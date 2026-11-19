from fastapi import APIRouter

from src.schemas.core import ApiResponse
from src.schemas.frame import ResourceList
from src.services.minio import test
from src.services.redis import test_redis

router = APIRouter(prefix="/api/resource", tags=["resource"])

@router.get("", response_model=ApiResponse[ResourceList])
def get_resource() -> ApiResponse[ResourceList]:
    result = test()
    return ApiResponse(success=True, data=ResourceList(
        text=result
    ))
