from fastapi import APIRouter, Depends, HTTPException

from src.core.config import settings
from src.dependencies import get_job_service
from src.schemas.core import ApiResponse
from src.schemas.segment import SegmentModelList, SegmentRequest
from src.services.jobs_service import JobService

router = APIRouter(prefix="/api/segment", tags=["segment"])


@router.get("/models", response_model=ApiResponse[SegmentModelList])
def list_models(
) -> ApiResponse[SegmentModelList]:
    return ApiResponse(
        success=True,
        data=SegmentModelList(models=list(settings.available_models)),
    )


@router.post("/segment", response_model=ApiResponse[dict[str, str]], status_code=202)
def submit_sequence_segment(
    request: SegmentRequest,
    service: JobService = Depends(get_job_service),
) -> ApiResponse[dict[str, str]]:
    available = {model.model_id for model in settings.available_models}
    if request.model_id not in available:
        raise HTTPException(status_code=400, detail=f"Unsupported model_id: {request.model_id}")
    job_id = service.submit_sequence(request.model_id, request.sequence_id)
    return ApiResponse(success=True, data={"job_id": job_id})
