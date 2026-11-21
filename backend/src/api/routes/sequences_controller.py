from fastapi import APIRouter, HTTPException, Query

from src.core.errors import DatasetNotFoundError
from src.schemas.core import ApiResponse
from src.schemas.frame import FrameList, Sequence, SequenceItem
from src.services.storage_service import StorageService

router = APIRouter(prefix="/api/sequence", tags=["sequence"])
storage_service = StorageService()


@router.get("", response_model=ApiResponse[list[SequenceItem]])
def list_sequences() -> ApiResponse[list[SequenceItem]]:
    return ApiResponse(success=True, data=storage_service.get_sequences())


@router.get("/{sequence_id}", response_model=ApiResponse[FrameList])
def list_frames(
    sequence_id: str,
    camera: str = Query(default="image_00", pattern=r"^image_\d{2}$"),
) -> ApiResponse[FrameList]:
    try:
        frames = None
    except DatasetNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ApiResponse(success=True, data=FrameList(sequence=sequence_id, frames=frames))
