from fastapi import APIRouter

from app.models.recommendations import (
    RecommendationSearchRequest,
    RecommendationSearchResponse,
)
from app.services.recommendation_service import build_recommendation

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/search", response_model=RecommendationSearchResponse)
def search_recommendations(payload: RecommendationSearchRequest) -> RecommendationSearchResponse:
    return build_recommendation(payload.query)
