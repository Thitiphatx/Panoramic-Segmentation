from fastapi import APIRouter, HTTPException, Query, Request

from src.core.config import settings
from src.core.errors import DatasetNotFoundError
from src.schemas.frame import FrameList, SequenceList
from src.services.kitti360 import Kitti360Service

router = APIRouter(prefix="/api/sequences", tags=["sequences"])


@router.get("", response_model=SequenceList)
def list_sequences() -> SequenceList:
    return SequenceList(sequences=Kitti360Service(settings).list_sequences())


@router.get("/{sequence}/frames", response_model=FrameList)
def list_frames(
    sequence: str,
    camera: str = Query(default="image_00", pattern=r"^image_\d{2}$"),
) -> FrameList:
    try:
        frames = Kitti360Service(settings).list_frames(sequence, camera)
    except DatasetNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return FrameList(sequence=sequence, frames=frames)
