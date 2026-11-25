from collections.abc import Generator
from functools import lru_cache
import os

from fastapi import Depends
from minio import Minio
from redis import Redis
from sqlmodel import Session

from src.core.config import settings
from src.core.database import engine
from src.services.database_service import DatabaseService
from src.services.jobs_service import JobService
from src.services.redis_service import RedisService
from src.services.segment_service import SegmentService
from src.services.sequence_service import SequenceService
from src.services.storage_service import StorageService
from src.utils.utils import env


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

@lru_cache
def get_minio_client() -> Minio:
    return Minio(
        env("S3_ENDPOINT"),
        access_key=env("S3_ACCESS_KEY"),
        secret_key=env("S3_SECRET_KEY"),
        secure=os.environ.get("S3_USE_SSL", "false").lower() == "true",
    )

@lru_cache
def get_redis_client() -> Redis:
    return Redis(
        host=env("REDIS_HOST"),
        port=int(env("REDIS_PORT")),
        username=os.environ.get("REDIS_USERNAME"),
        password=os.environ.get("REDIS_PASSWORD", "redis-dev-password"),
        decode_responses=True,
    )


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

