from fastapi import APIRouter, Depends

from src.model.frame import Frame
from src.model.sequence import Sequence
from src.schemas.core import ApiResponse
from src.dependencies import get_sequence_service
from src.services.sequence_service import SequenceService

router = APIRouter(prefix="/api/sequence", tags=["sequence"])


@router.get("", response_model=ApiResponse[list[Sequence]])
def list_sequences(
    sequence_service: SequenceService = Depends(get_sequence_service),
) -> ApiResponse[list[Sequence]]:
    sequences = sequence_service.get_sequences()
    return ApiResponse(success=True, data=sequences)

@router.get("/{sequence_id}", response_model=ApiResponse[list[Frame]])
def list_frames(
    sequence_id: str,
    sequence_service: SequenceService = Depends(get_sequence_service),
) -> ApiResponse[list[Frame]]:
    print(f"sequence_id {sequence_id}")
    frames = sequence_service.get_frames(sequence_id)
    return ApiResponse(success=True, data=frames)
