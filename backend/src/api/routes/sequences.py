from fastapi import APIRouter, HTTPException, Query

from src.core.config import settings
from src.core.errors import DatasetNotFoundError
from src.schemas.core import ApiResponse
from src.schemas.frame import FrameList, SequenceList
from src.services.kitti360 import Kitti360Service

router = APIRouter(prefix="/api/sequence", tags=["sequence"])


@router.get("", response_model=ApiResponse[SequenceList])
def list_sequences() -> ApiResponse[SequenceList]:
    return ApiResponse(success=True, data=SequenceList(sequences=Kitti360Service(settings).list_sequences()))


@router.get("/{sequence_id}", response_model=ApiResponse[FrameList])
def list_frames(
    sequence_id: str,
    camera: str = Query(default="image_00", pattern=r"^image_\d{2}$"),
) -> ApiResponse[FrameList]:
    try:
        frames = Kitti360Service(settings).list_frames(sequence_id, camera)
    except DatasetNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ApiResponse(success=True, data=FrameList(sequence=sequence_id, frames=frames))
