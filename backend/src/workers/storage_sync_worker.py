import logging
from threading import Event

from redis.exceptions import AuthenticationError
from sqlmodel import Session

from src.core.database import engine
from src.core.errors import StorageSyncCancelledError
from src.dependencies import get_minio_client, get_redis_client
from src.services.database_service import DatabaseService
from src.services.redis_service import RedisService
from src.services.storage_service import StorageService

logger = logging.getLogger(__name__)


def process_storage_sync(sync_id: str, redis_service: RedisService) -> None:
    def report_progress(values: dict[str, str | int]) -> None:
        try:
            redis_service.update_storage_sync(sync_id, values)
        except Exception:
            logger.exception("Could not update storage sync progress for %s", sync_id)

    try:
        if not redis_service.mark_storage_sync_running(sync_id):
            redis_service.finish_storage_sync(sync_id, "cancelled", "Storage sync cancelled")
            return
        storage = StorageService(get_minio_client())
        with Session(engine) as session:
            DatabaseService(
                session,
                storage,
                report_progress,
                lambda: redis_service.is_storage_sync_cancel_requested(sync_id),
            ).sync_storage()
        redis_service.finish_storage_sync(sync_id, "completed", "Storage sync completed")
    except StorageSyncCancelledError:
        redis_service.finish_storage_sync(sync_id, "cancelled", "Storage sync cancelled")
    except Exception as exc:
        try:
            redis_service.update_storage_sync(sync_id, {"error": str(exc)[:500]})
            redis_service.finish_storage_sync(sync_id, "failed", "Storage sync failed")
        except Exception:
            logger.exception("Could not record storage sync failure for %s", sync_id)
        logger.exception("Storage sync %s failed", sync_id)


def run_worker(stop_event: Event) -> None:
    redis_service = None
    logger.info("Storage sync worker started")
    should_recover_active_sync = True
    while not stop_event.is_set():
        try:
            if redis_service is None:
                redis_service = RedisService(get_redis_client())
            if should_recover_active_sync:
                redis_service.recover_interrupted_storage_sync()
                should_recover_active_sync = False
            sync_id = redis_service.dequeue_storage_sync(timeout=1)
        except AuthenticationError:
            logger.exception(
                "Storage sync worker stopped because Redis rejected its credentials; "
                "check REDIS_USERNAME and REDIS_PASSWORD"
            )
            return
        except Exception:
            logger.exception("Storage sync worker could not read its Redis queue")
            redis_service = None
            stop_event.wait(5)
            continue
        if sync_id:
            logger.info("Processing storage sync %s", sync_id)
            process_storage_sync(sync_id, redis_service)
