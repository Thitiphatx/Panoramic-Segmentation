from fastapi import APIRouter, Request

router = APIRouter(tags=["health"])


@router.get("/health")
def health(request: Request) -> dict[str, str]:
    service = getattr(request.app.state, "segmentation_service", None)
    return {"status": "ok", "model": "loaded" if service and service.predictor._model else "not_loaded"}
