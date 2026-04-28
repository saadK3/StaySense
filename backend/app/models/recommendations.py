from pydantic import BaseModel, Field
from typing import Literal


class RecommendationSearchRequest(BaseModel):
    query: str = Field(..., min_length=3, description="Natural language hotel search query")


class ExtractedPreferences(BaseModel):
    city: str | None = None
    area: str | None = None
    total_budget: int | None = None
    budget_per_night: int | None = None
    nights: int | None = None
    currency: str | None = None
    traveller_type: Literal["solo", "couple", "family", "friends"] | None = None
    needs_parking: bool = False
    preferences: list[str] = Field(default_factory=list)


class RankedHotel(BaseModel):
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
    match_score: int
    reason_codes: list[str]


class ComparisonRow(BaseModel):
    hotel_id: str
    hotel_name: str
    price_per_night: int
    rating: float
    cleanliness_score: int
    service_score: int
    location_score: int
    wifi_score: int
    parking_score: int
    value_score: int
    match_score: int


class RecommendationSearchResponse(BaseModel):
    extraction_source: str | None = None
    extracted_preferences: ExtractedPreferences
    ranked_hotels: list[RankedHotel]
    comparison_data: list[ComparisonRow]
    recommendation_summary: str
