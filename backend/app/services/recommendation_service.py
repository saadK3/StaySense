from __future__ import annotations

from typing import TypedDict

from app.models.recommendations import (
    ComparisonRow,
    ExtractedPreferences,
    RankedHotel,
    RecommendationSearchResponse,
)
from app.services.preference_extractor import extract_preferences_with_source


class HotelRecord(TypedDict):
    id: str
    name: str
    city: str
    area: str
    price_per_night: int
    rating: float
    amenities: list[str]
    cleanliness_score: int
    service_score: int
    location_score: int
    wifi_score: int
    parking_score: int
    value_score: int


MOCK_HOTELS: list[HotelRecord] = [
    {
        "id": "pk-lhr-gulberg-grand-plaza",
        "name": "Grand Plaza Gulberg",
        "city": "Lahore",
        "area": "Gulberg",
        "price_per_night": 17500,
        "rating": 4.6,
        "amenities": ["parking", "wifi", "breakfast", "gym"],
        "cleanliness_score": 91,
        "service_score": 89,
        "location_score": 93,
        "wifi_score": 88,
        "parking_score": 92,
        "value_score": 86,
    },
    {
        "id": "pk-lhr-johar-town-suite",
        "name": "Johar Town Suites",
        "city": "Lahore",
        "area": "Johar Town",
        "price_per_night": 13200,
        "rating": 4.2,
        "amenities": ["wifi", "parking", "family-rooms"],
        "cleanliness_score": 84,
        "service_score": 81,
        "location_score": 79,
        "wifi_score": 82,
        "parking_score": 88,
        "value_score": 89,
    },
    {
        "id": "pk-lhr-dha-business-inn",
        "name": "DHA Business Inn",
        "city": "Lahore",
        "area": "DHA",
        "price_per_night": 19800,
        "rating": 4.4,
        "amenities": ["wifi", "parking", "meeting-room", "airport-shuttle"],
        "cleanliness_score": 88,
        "service_score": 90,
        "location_score": 86,
        "wifi_score": 90,
        "parking_score": 87,
        "value_score": 80,
    },
    {
        "id": "pk-khi-clifton-seaview",
        "name": "Clifton Seaview Hotel",
        "city": "Karachi",
        "area": "Clifton",
        "price_per_night": 21000,
        "rating": 4.5,
        "amenities": ["wifi", "pool", "parking", "spa"],
        "cleanliness_score": 89,
        "service_score": 87,
        "location_score": 92,
        "wifi_score": 86,
        "parking_score": 85,
        "value_score": 81,
    },
    {
        "id": "pk-isb-f8-residency",
        "name": "F-8 Residency",
        "city": "Islamabad",
        "area": "F-8",
        "price_per_night": 16500,
        "rating": 4.3,
        "amenities": ["wifi", "parking", "breakfast", "family-rooms"],
        "cleanliness_score": 87,
        "service_score": 85,
        "location_score": 88,
        "wifi_score": 84,
        "parking_score": 90,
        "value_score": 85,
    },
]


def score_hotel(hotel: HotelRecord, preferences: ExtractedPreferences) -> tuple[int, list[str]]:
    score = 40
    reason_codes: list[str] = []

    if preferences.city and hotel["city"].lower() == preferences.city.lower():
        score += 20
        reason_codes.append("city_match")

    if preferences.area and hotel["area"].lower() == preferences.area.lower():
        score += 15
        reason_codes.append("area_match")

    if preferences.budget_per_night is not None:
        if hotel["price_per_night"] <= preferences.budget_per_night:
            score += 10
            reason_codes.append("budget_cap_match")
        else:
            score += 1
            reason_codes.append("budget_cap_exceeded")

    if preferences.needs_parking:
        score += 10 if "parking" in hotel["amenities"] else -5
        reason_codes.append("parking_required")

    for priority in preferences.preferences:
        if priority == "parking":
            score += 10 if "parking" in hotel["amenities"] else -5
            reason_codes.append("parking_priority")
        elif priority == "cleanliness":
            score += 10 if hotel["cleanliness_score"] >= 88 else 2
            reason_codes.append("cleanliness_priority")
        elif priority == "wifi":
            score += 8 if hotel["wifi_score"] >= 86 else 1
            reason_codes.append("wifi_priority")
        elif priority == "budget":
            score += 10 if hotel["price_per_night"] <= 15000 else 2
            reason_codes.append("budget_priority")
        elif priority == "family-friendly":
            score += 6 if "family-rooms" in hotel["amenities"] else 1
            reason_codes.append("family_priority")
        elif priority == "business-friendly":
            score += 6 if "meeting-room" in hotel["amenities"] else 1
            reason_codes.append("business_priority")

    score += round((hotel["rating"] - 4.0) * 8)
    score = max(0, min(100, score))
    return score, reason_codes


def build_recommendation(query: str) -> RecommendationSearchResponse:
    extracted_preferences, extraction_source = extract_preferences_with_source(query)

    ranked_hotels: list[RankedHotel] = []
    for hotel in MOCK_HOTELS:
        match_score, reason_codes = score_hotel(hotel, extracted_preferences)
        ranked_hotels.append(
            RankedHotel(
                **hotel,
                match_score=match_score,
                reason_codes=reason_codes,
            )
        )

    ranked_hotels.sort(key=lambda hotel: hotel.match_score, reverse=True)
    ranked_hotels = ranked_hotels[:3]

    comparison_data = [
        ComparisonRow(
            hotel_id=hotel.id,
            hotel_name=hotel.name,
            price_per_night=hotel.price_per_night,
            rating=hotel.rating,
            cleanliness_score=hotel.cleanliness_score,
            service_score=hotel.service_score,
            location_score=hotel.location_score,
            wifi_score=hotel.wifi_score,
            parking_score=hotel.parking_score,
            value_score=hotel.value_score,
            match_score=hotel.match_score,
        )
        for hotel in ranked_hotels
    ]

    if not ranked_hotels:
        recommendation_summary = (
            "No hotels matched this query. Try adding city, budget, or amenity details."
        )
    else:
        best = ranked_hotels[0]
        recommendation_summary = (
            f"{best.name} is the strongest overall match with a score of "
            f"{best.match_score}/100 based on your stated preferences."
        )

    return RecommendationSearchResponse(
        extraction_source=extraction_source,
        extracted_preferences=extracted_preferences,
        ranked_hotels=ranked_hotels,
        comparison_data=comparison_data,
        recommendation_summary=recommendation_summary,
    )
