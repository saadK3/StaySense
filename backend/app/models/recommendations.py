from pydantic import BaseModel, Field


class RecommendationSearchRequest(BaseModel):
    query: str = Field(..., min_length=3, description="Natural language hotel search query")


class ExtractedPreferences(BaseModel):
    city: str | None = None
    area: str | None = None
    priorities: list[str] = Field(default_factory=list)
    concerns: list[str] = Field(default_factory=list)


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
    extracted_preferences: ExtractedPreferences
    ranked_hotels: list[RankedHotel]
    comparison_data: list[ComparisonRow]
    recommendation_summary: str
