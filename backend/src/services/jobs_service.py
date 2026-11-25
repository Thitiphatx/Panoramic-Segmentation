from src.services.redis_service import RedisService


class JobService:
    def __init__(self, redis: RedisService) -> None:
        self.redis = redis

    def list_jobs(self) -> list[dict[str, object]]:
        return self.redis.list_jobs()

    def cancel_job(self, job_id: str) -> None:
        self.redis.cancel_job(job_id)

    def submit_sequence(self, model_id: str, sequence_id: str) -> str:
        return self.redis.create_job(model_id, sequence_id)

    def submit_frame(self, sequence_id: str, frame_id: str) -> str:
        # Sequence jobs are the unit consumed by the worker. Frame-specific
        # submission is kept compatible by queueing the containing sequence.
        return self.submit_sequence("segformer-b0-cityscapes", sequence_id)
