from fastapi import APIRouter

from src.schemas.frame import ResourceList
from src.services.minio import test
from src.services.redis import test_redis

router = APIRouter(prefix="/api/resource", tags=["resource"])

@router.get("", response_model=ResourceList)
def get_resource() -> ResourceList:
    result = test()
    return ResourceList(
        text=result
    )