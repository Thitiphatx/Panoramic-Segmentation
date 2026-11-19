from fastapi import APIRouter, HTTPException

from src.core.config import settings
from src.core.errors import (
    DatasetNotFoundError,
    InvalidSegmentRequestError,
    InvalidSequenceDataError,
    SequenceStorageUnavailableError,
)
from src.schemas.core import ApiResponse
from src.schemas.segment import SegmentModelList, SegmentRequest
from src.services.sequence_segment_service import SequenceSegmentService

router = APIRouter(prefix="/api/segment", tags=["segment"])


@router.get("/models", response_model=ApiResponse[SegmentModelList])
def list_models() -> ApiResponse[SegmentModelList]:
    return ApiResponse(
        success=True,
        data=SegmentModelList(models=SequenceSegmentService(settings).list_models()),
    )


@router.post("/", status_code=501)
def submit_sequence_segment(body: SegmentRequest) -> None:
    try:
        SequenceSegmentService(settings).validate_request(body)
    except InvalidSegmentRequestError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except DatasetNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except InvalidSequenceDataError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except SequenceStorageUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    raise HTTPException(
        status_code=501,
        detail="Job submission is not available until the worker service is implemented",
    )
