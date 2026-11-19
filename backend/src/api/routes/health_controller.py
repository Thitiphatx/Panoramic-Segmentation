from fastapi import APIRouter, Request

from src.schemas.core import ApiResponse
from src.services.health_service import HealthService

router = APIRouter(tags=["health"])

@router.get("/health")
def health(request: Request) -> ApiResponse[dict[str, str]]:
    service = getattr(request.app.state, "segment_service", None)
    return ApiResponse(success=True, data=HealthService.status(service))
