from functools import lru_cache
import os

from redis import Redis
from worker.src.utils import env

@lru_cache
def get_redis_client() -> Redis:
    return Redis(
        host=env("REDIS_HOST"),
        port=int(env("REDIS_PORT")),
        username=os.environ.get("REDIS_USERNAME"),
        password=os.environ.get("REDIS_PASSWORD", "redis-dev-password"),
        decode_responses=True,
    )