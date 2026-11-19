from fastapi import APIRouter, HTTPException

from src.core.config import settings
from src.core.errors import DatasetNotFoundError
from src.schemas.core import ApiResponse
from src.schemas.frame import FrameDetail
from src.services.kitti360 import Kitti360Service

router = APIRouter(prefix="/api/sequence/{sequence_id}/frame", tags=["frame"])


@router.get("/{frame_id}", response_model=ApiResponse[FrameDetail])
def get_frame(sequence_id: str, frame_id: str, camera: str = "image_00") -> ApiResponse[FrameDetail]:
    try:
        _, gps = Kitti360Service(settings).get_frame(sequence_id, frame_id, camera)
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


@router.post("/{frame_id}/segment", status_code=501)
def submit_frame_segment(sequence_id: str, frame_id: str) -> None:
    raise HTTPException(
        status_code=501,
        detail="Job submission is not available until the worker service is implemented",
    )
