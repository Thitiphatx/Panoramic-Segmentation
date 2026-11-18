from fastapi import APIRouter

from src.schemas.frame import ResourceList
from src.services.minio import test

router = APIRouter(tags=["resource"])

@router.get("/resource", response_model=ResourceList)
def get_resource() -> ResourceList:
    result = test()
    return ResourceList(
        text=result
    )
