from fastapi import APIRouter, Depends, HTTPException

from src.core.config import settings
from src.core.errors import DatasetNotFoundError, JobServiceUnavailableError
from src.schemas.core import ApiResponse
from src.schemas.frame import FrameDetail
from src.dependencies import get_job_service
from src.services.jobs_service import JobService

router = APIRouter(prefix="/api/sequence/{sequence_id}/frame", tags=["frame"])


@router.get("/{frame_id}", response_model=ApiResponse[FrameDetail])
def get_frame(sequence_id: str, frame_id: str, camera: str = "image_00") -> ApiResponse[FrameDetail]:
    try:
        _, gps = None
    except DatasetNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ApiResponse(
        success=True,
        data=FrameDetail(
            sequence_id=sequence_id,
            frame_id=frame_id,
            image_available=True,
            gps=gps,
        ),
    )


@router.post("/{frame_id}/segment", status_code=202)
def submit_frame_segment(
    sequence_id: str,
    frame_id: str,
    service: JobService = Depends(get_job_service),
) -> dict[str, str]:
    job_id = service.submit_frame(sequence_id, frame_id)
    return {"job_id": job_id}
