from fastapi import APIRouter, Depends, HTTPException

from src.schemas.core import ApiResponse
from src.schemas.segment import SegmentModelList, SegmentRequest

router = APIRouter(prefix="/api/segment", tags=["segment"])


@router.get("/models", response_model=ApiResponse[SegmentModelList])
def list_models(
) -> ApiResponse[SegmentModelList]:
    return ApiResponse(
        success=True,
        data=SegmentModelList(models=list()),
    )