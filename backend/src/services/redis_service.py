import uuid
import time
import redis
from src.utils.utils import env

r = redis.Redis(
    host=env("REDIS_HOST"),
    port=env("REDIS_PORT"),
    decode_responses=True
    )

QUEUE_NAME = 'job_queue'

def create_job():
    job_id = str(uuid.uuid4())
    job_key = f'job:{job_id}'
    
    r.hset(
        job_key,
        mapping={
            'status': 'pending',
            'created_at': time.time()
        }
    )
    r.lpush(QUEUE_NAME, job_id)
    print(f'--> [Job] สร้าง Job สำเร็จ ID: {job_id}')
    
    return job_id


def check_job_status(job_id):
    job_key = f'job:{job_id}'
    job_info = r.hgetall(job_key)
    return job_info