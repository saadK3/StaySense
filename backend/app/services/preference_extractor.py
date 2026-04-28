from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx
from pydantic import ValidationError
from openai import BadRequestError

from app.models.recommendations import ExtractedPreferences

CITY_KEYWORDS = ("lahore", "karachi", "islamabad")
AREA_KEYWORDS = ("gulberg", "johar town", "dha", "clifton", "f-8")


def extract_preferences(query: str) -> ExtractedPreferences:
    extracted, _ = extract_preferences_with_source(query)
    return extracted


def extract_preferences_with_source(query: str) -> tuple[ExtractedPreferences, str]:
    api_key = _get_llm_api_key()
    if not api_key:
        return extract_with_fallback(query), "fallback"

    try:
        return extract_with_llm(query), "llm"
    except Exception:
        return extract_with_fallback(query), "fallback"


def extract_with_llm(query: str) -> ExtractedPreferences:
    from openai import OpenAI

    provider = os.getenv("LLM_PROVIDER", "openai").strip().lower()
    model = os.getenv("LLM_MODEL", os.getenv("OPENAI_MODEL", "gpt-4.1-mini"))
    timeout_seconds = float(os.getenv("EXTRACTION_TIMEOUT_SECONDS", "8"))
    api_key = _get_llm_api_key()
    if not api_key:
        raise ValueError("Missing LLM API key")

    base_url = os.getenv("LLM_BASE_URL")
    if not base_url and provider == "groq":
        base_url = "https://api.groq.com/openai/v1"

    trust_env = os.getenv("LLM_TRUST_ENV", "false").strip().lower() == "true"
    http_client = httpx.Client(timeout=timeout_seconds, trust_env=trust_env)

    client_kwargs: dict[str, Any] = {
        "api_key": api_key,
        "timeout": timeout_seconds,
        "http_client": http_client,
    }
    if base_url:
        client_kwargs["base_url"] = base_url
    client = OpenAI(**client_kwargs)

    schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "city": {"type": ["string", "null"]},
            "area": {"type": ["string", "null"]},
            "total_budget": {"type": ["number", "null"]},
            "budget_per_night": {"type": ["number", "null"]},
            "nights": {"type": ["number", "null"]},
            "currency": {"type": ["string", "null"]},
            "traveller_type": {"type": ["string", "null"]},
            "needs_parking": {"type": "boolean"},
            "preferences": {"type": "array", "items": {"type": "string"}},
        },
        "required": [
            "city",
            "area",
            "total_budget",
            "budget_per_night",
            "nights",
            "currency",
            "traveller_type",
            "needs_parking",
            "preferences",
        ],
        "additionalProperties": False,
    }

    system_prompt = (
        "Extract hotel preferences from user text. "
        "Output JSON strictly matching schema. "
        "If query says budget for X nights/days, treat as total_budget and derive budget_per_night. "
        "If query says per night/nightly/per room/one night, treat as budget_per_night. "
        "If both are present, preserve both."
    )

    try:
        response = client.responses.create(
            model=model,
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query},
            ],
            text={
                "format": {
                    "type": "json_schema",
                    "name": "extracted_preferences",
                    "schema": schema,
                    "strict": True,
                }
            },
        )
        payload = json.loads(response.output_text)
    except BadRequestError as exc:
        if provider != "groq":
            raise
        if "json_schema" not in str(exc):
            raise
        # Groq model-level compatibility fallback: request strict JSON object and validate ourselves.
        chat = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": (
                        f"Return a JSON object with keys: {', '.join(schema['required'])}. "
                        f"Schema: {json.dumps(schema)}. Query: {query}"
                    ),
                },
            ],
            response_format={"type": "json_object"},
            temperature=0,
        )
        content = chat.choices[0].message.content or "{}"
        payload = json.loads(content)
    payload = _normalize_payload(payload, query)
    try:
        return ExtractedPreferences.model_validate(payload)
    except ValidationError as exc:
        raise ValueError("Invalid LLM extraction payload") from exc


def extract_with_fallback(query: str) -> ExtractedPreferences:
    lowered = query.lower()
    city = next((c.title() for c in CITY_KEYWORDS if c in lowered), None)
    area = next((a.title() for a in AREA_KEYWORDS if a in lowered), None)

    preferences: list[str] = []
    if "parking" in lowered:
        preferences.append("parking")
    if "clean" in lowered or "cleanliness" in lowered:
        preferences.append("cleanliness")
    if "wifi" in lowered or "internet" in lowered:
        preferences.append("wifi")
    if "budget" in lowered or "cheap" in lowered or "afford" in lowered:
        preferences.append("budget")
    if "family" in lowered:
        preferences.append("family-friendly")
    if "business" in lowered or "work" in lowered:
        preferences.append("business-friendly")

    budget_value = _extract_amount(lowered)
    nights = _extract_nights(lowered)
    mentions_total = _mentions_total_budget(lowered)
    mentions_per_night = _mentions_per_night_budget(lowered)

    total_budget: int | None = None
    budget_per_night: int | None = None
    if budget_value is not None and 2000 <= budget_value <= 5000000:
        if mentions_total and nights and nights > 0:
            total_budget = budget_value
            budget_per_night = int(round(total_budget / nights))
        elif mentions_per_night:
            budget_per_night = budget_value
        elif nights and nights > 1:
            total_budget = budget_value
            budget_per_night = int(round(total_budget / nights))
        else:
            budget_per_night = budget_value

    traveller_type: str | None = None
    if "solo" in lowered:
        traveller_type = "solo"
    elif "couple" in lowered:
        traveller_type = "couple"
    elif "family" in lowered:
        traveller_type = "family"
    elif "friends" in lowered or "group" in lowered:
        traveller_type = "friends"

    currency: str | None = None
    if "pkr" in lowered or "rs" in lowered or "₨" in query:
        currency = "PKR"
    elif "usd" in lowered or "$" in query:
        currency = "USD"

    payload = {
        "city": city,
        "area": area,
        "total_budget": total_budget,
        "budget_per_night": budget_per_night,
        "nights": nights,
        "currency": currency,
        "traveller_type": traveller_type,
        "needs_parking": "parking" in lowered,
        "preferences": preferences,
    }
    payload = _normalize_payload(payload, query)
    return ExtractedPreferences.model_validate(payload)


def _get_llm_api_key() -> str | None:
    provider = os.getenv("LLM_PROVIDER", "openai").strip().lower()
    if provider == "groq":
        return os.getenv("GROQ_API_KEY")
    return os.getenv("OPENAI_API_KEY")


def _normalize_payload(payload: dict[str, Any], query: str) -> dict[str, Any]:
    normalized = dict(payload)
    for key in ("total_budget", "budget_per_night", "nights"):
        if normalized.get(key) is not None:
            normalized[key] = int(round(float(normalized[key])))

    if normalized.get("traveller_type") is not None:
        normalized["traveller_type"] = str(normalized["traveller_type"]).strip().lower()
        if normalized["traveller_type"] == "group":
            normalized["traveller_type"] = "friends"
        if normalized["traveller_type"] not in {"solo", "couple", "family", "friends"}:
            normalized["traveller_type"] = None

    lowered = query.lower()
    nights = normalized.get("nights") or _extract_nights(lowered)
    total_budget = normalized.get("total_budget")
    per_night = normalized.get("budget_per_night")
    mentions_total = _mentions_total_budget(lowered)

    if total_budget is not None and per_night is None and nights and nights > 0:
        per_night = int(round(total_budget / nights))
    if per_night is not None and total_budget is None and mentions_total and nights and nights > 0:
        total_budget = per_night * nights

    normalized["nights"] = nights
    normalized["total_budget"] = total_budget
    normalized["budget_per_night"] = per_night
    normalized["needs_parking"] = bool(normalized.get("needs_parking", False))
    normalized["preferences"] = [str(p) for p in normalized.get("preferences", [])]

    if normalized.get("currency") is not None:
        normalized["currency"] = str(normalized["currency"]).upper()

    return normalized


def _extract_nights(text: str) -> int | None:
    match = re.search(r"\b(\d+)\s*(night|nights|day|days)\b", text)
    if match:
        return int(match.group(1))
    if "one night" in text:
        return 1
    return None


def _extract_amount(text: str) -> int | None:
    cleaned = text.replace(",", "")
    match = re.search(r"\b\d{3,7}\b", cleaned)
    if match:
        return int(match.group(0))
    return None


def _mentions_total_budget(text: str) -> bool:
    if "budget for" in text:
        return True
    if "total budget" in text:
        return True
    return ("for" in text) and ("night" in text or "day" in text)


def _mentions_per_night_budget(text: str) -> bool:
    markers = ("per night", "nightly", "per room", "one night")
    return any(marker in text for marker in markers)
