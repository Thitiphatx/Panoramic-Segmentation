import logging
import time

from redis import Redis
from redis.exceptions import RedisError

from src.core.clients import create_database_engine, create_redis_client, create_storage_client
from src.core.config import settings
from src.inferer.inferer import SegformerPredictor
from src.services.job_service import claim_job, process_job

logger = logging.getLogger("segmentation-worker")


def run_worker() -> None:
    redis: Redis = create_redis_client()
    while True:
        try:
            redis.ping()
            break
        except RedisError:
            logger.warning(
                "Redis is not ready; retrying in %s seconds",
                settings.redis_retry_seconds,
                exc_info=True,
            )
            time.sleep(settings.redis_retry_seconds)

    engine = create_database_engine()
    storage = create_storage_client()
    predictors: dict[str, SegformerPredictor] = {}
    logger.info("Worker ready; polling Redis queue %s", settings.redis_queue)

    while True:
        queued = redis.brpop(settings.redis_queue, timeout=int(settings.poll_seconds))
        if not queued:
            continue
        job_id = queued[1]
        job = claim_job(redis, job_id)
        if job:
            process_job(job_id, job, redis, engine, storage, predictors)
