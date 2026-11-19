from fastapi import APIRouter, Request

from src.schemas.core import ApiResponse

router = APIRouter(tags=["health"])

@router.get("/health")
def health(request: Request) -> ApiResponse[dict[str, str]]:
    service = getattr(request.app.state, "segment_service", None)
    return ApiResponse(success=True, data={
        "status": "ok",
        "model": "loaded" if service and service.predictor._model else "not_loaded",
    })
