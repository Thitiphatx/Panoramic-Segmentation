from fastapi import APIRouter, HTTPException

from src.schemas.core import ApiResponse
from src.schemas.segment import SegmentModel, SegmentModelList, SegmentRequest

router = APIRouter(prefix="/api/segment", tags=["segment"])


@router.get("/models", response_model=ApiResponse[SegmentModelList])
def list_models() -> ApiResponse[SegmentModelList]:
    return ApiResponse(
        success=True,
        data=SegmentModelList(
            models=[
                SegmentModel(
                    model_id="segformer-b0-cityscapes",
                    name="SegFormer B0 (Cityscapes)",
                )
            ]
        ),
    )


@router.post("/", status_code=501)
def submit_sequence_segment(body: SegmentRequest) -> None:
    raise HTTPException(
        status_code=501,
        detail="Job submission is not available until the worker service is implemented",
    )
