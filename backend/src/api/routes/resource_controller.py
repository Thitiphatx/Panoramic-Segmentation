from fastapi import APIRouter

from src.schemas.core import ApiResponse
from src.schemas.frame import ResourceList
from src.services.resource_service import ResourceService

router = APIRouter(prefix="/api/resource", tags=["resource"])

@router.get("", response_model=ApiResponse[ResourceList])
def get_resource() -> ApiResponse[ResourceList]:
    result = ResourceService.describe_storage()
    return ApiResponse(success=True, data=ResourceList(
        text=result
    ))
