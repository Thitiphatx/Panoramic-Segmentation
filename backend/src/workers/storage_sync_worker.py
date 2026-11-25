import logging
from threading import Event

from redis.exceptions import AuthenticationError
from sqlmodel import Session

from src.core.database import engine
from src.core.errors import StorageSyncCancelledError
from src.dependencies import get_minio_client, get_redis_client
from src.services.database_service import DatabaseService
from src.services.storage_service import StorageService

logger = logging.getLogger(__name__)


def process_storage_sync(sync_id: str, storage: StorageService) -> None:
    def report_progress(values: dict[str, str | int]) -> None:
        try:
            storage.update_storage_sync(sync_id, values)
        except Exception:
            logger.exception("Could not update storage sync progress for %s", sync_id)

    try:
        if not storage.mark_storage_sync_running(sync_id):
            storage.finish_storage_sync(sync_id, "cancelled", "Storage sync cancelled")
            return
        with Session(engine) as session:
            DatabaseService(
                session,
                storage,
                report_progress,
                lambda: storage.is_storage_sync_cancel_requested(sync_id),
            ).sync_storage()
        storage.finish_storage_sync(sync_id, "completed", "Storage sync completed")
    except StorageSyncCancelledError:
        storage.finish_storage_sync(sync_id, "cancelled", "Storage sync cancelled")
    except Exception as exc:
        try:
            storage.update_storage_sync(sync_id, {"error": str(exc)[:500]})
            storage.finish_storage_sync(sync_id, "failed", "Storage sync failed")
        except Exception:
            logger.exception("Could not record storage sync failure for %s", sync_id)
        logger.exception("Storage sync %s failed", sync_id)


def run_worker(stop_event: Event) -> None:
    storage = None
    logger.info("Storage sync worker started")
    should_recover_active_sync = True
    while not stop_event.is_set():
        try:
            if storage is None:
                storage = StorageService(get_minio_client(), get_redis_client())
            if should_recover_active_sync:
                storage.recover_interrupted_storage_sync()
                should_recover_active_sync = False
            sync_id = storage.dequeue_storage_sync(timeout=1)
        except AuthenticationError:
            logger.exception(
                "Storage sync worker stopped because Redis rejected its credentials; "
                "check REDIS_USERNAME and REDIS_PASSWORD"
            )
            return
        except Exception:
            logger.exception("Storage sync worker could not read its Redis queue")
            storage = None
            stop_event.wait(5)
            continue
        if sync_id:
            logger.info("Processing storage sync %s", sync_id)
            process_storage_sync(sync_id, storage)
