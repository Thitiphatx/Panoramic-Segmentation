from fastapi import Depends
from minio import Minio
from redis import Redis
from sqlmodel import Session

from src.core.config import settings
from src.core.database import get_session
from src.core.minio import get_minio_client
from src.core.redis import get_redis_client
from src.services.database_service import DatabaseService
from src.services.jobs_service import JobService
from src.services.redis_service import RedisService
from src.services.segment_service import SegmentService
from src.services.sequence_service import SequenceService
from src.services.storage_service import StorageService


def get_storage_service(
    client: Minio = Depends(get_minio_client),
    redis_client: Redis = Depends(get_redis_client),
) -> StorageService:
    return StorageService(client, redis_client)


def get_segment_service() -> SegmentService:
    return SegmentService(settings)

def get_redis_service(client: Redis = Depends(get_redis_client)) -> RedisService:
    return RedisService(client)

def get_job_service(redis_service: RedisService = Depends(get_redis_service)) -> JobService:
    return JobService(redis_service)

def get_database_service(session: Session = Depends(get_session),
                         storage: StorageService = Depends(get_storage_service)
                         ) -> DatabaseService:
    return DatabaseService(session=session, storage=storage)

def get_sequence_service(
    session: Session = Depends(get_session),
    storage: StorageService = Depends(get_storage_service),
) -> SequenceService:
    return SequenceService(session, storage)

