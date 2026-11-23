from fastapi import APIRouter, Depends, HTTPException

from src.dependencies import get_redis_service, get_segment_service
from src.schemas.core import ApiResponse
from src.services.health_service import HealthService
from src.services.redis_service import RedisService
from src.services.segment_service import SegmentService

router = APIRouter(prefix="/api", tags=["health"])

@router.get("/health")
def health(
    service: SegmentService = Depends(get_segment_service),
) -> ApiResponse[dict[str, str]]:
    return ApiResponse(success=True, data=HealthService.status(service))


@router.post("/sync-storage")
def sync_storage(
    redis_service: RedisService = Depends(get_redis_service),
) -> ApiResponse[dict[str, str | int]]:
    sync_id, _ = redis_service.start_storage_sync()
    status = redis_service.get_storage_sync(sync_id)
    return ApiResponse(success=True, data=status)


@router.get("/sync-storage")
def active_storage_sync(
    redis_service: RedisService = Depends(get_redis_service),
) -> ApiResponse[dict[str, str | int] | None]:
    return ApiResponse(success=True, data=redis_service.get_active_storage_sync())


@router.get("/sync-storage/{sync_id}")
def storage_sync_status(
    sync_id: str,
    redis_service: RedisService = Depends(get_redis_service),
) -> ApiResponse[dict[str, str | int]]:
    status = redis_service.get_storage_sync(sync_id)
    if not status:
        raise HTTPException(status_code=404, detail="Storage sync was not found")
    return ApiResponse(success=True, data=status)


@router.post("/sync-storage/{sync_id}/cancel")
def cancel_storage_sync(
    sync_id: str,
    redis_service: RedisService = Depends(get_redis_service),
) -> ApiResponse[dict[str, str | int]]:
    status = redis_service.cancel_storage_sync(sync_id)
    if not status:
        raise HTTPException(status_code=404, detail="Storage sync was not found")
    return ApiResponse(success=True, data=status)
