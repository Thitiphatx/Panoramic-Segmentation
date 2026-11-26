import time
import uuid

from redis import Redis


class RedisService:
    queue_name = "job_queue"

    def __init__(self, client: Redis) -> None:
        self._client = client

    def create_job(self, model_id: str, sequence_id: str) -> str:
        job_id = str(uuid.uuid4())
        job_key = f"job:{job_id}"

        self._client.hset(
            job_key,
            mapping={
                "status": "pending",
                "model_id": model_id,
                "sequence_id": sequence_id,
                "created_at": time.time(),
            },
        )
        self._client.lpush(self.queue_name, job_id)
        return job_id

    def check_job_status(self, job_id: str) -> dict[str, str]:
        return self._client.hgetall(f"job:{job_id}")

    def list_jobs(self) -> list[dict[str, str]]:
        jobs = []
        for key in self._client.scan_iter(match="job:*"):
            job = self._client.hgetall(key)
            if job:
                job["job_id"] = key.removeprefix("job:")
                jobs.append(job)
        return sorted(jobs, key=lambda job: float(job.get("created_at", 0)), reverse=True)

    def cancel_job(self, job_id: str) -> bool:
        key = f"job:{job_id}"
        status = self._client.hget(key, "status")
        if not status or status in {"completed", "cancelled"}:
            return False
        if status == "failed":
            self._client.hset(key, mapping={"status": "cancelled", "finished_at": time.time()})
            return True
        if status == "pending":
            self._client.lrem(self.queue_name, 0, job_id)
            self._client.hset(key, mapping={"status": "cancelled", "finished_at": time.time()})
        else:
            self._client.hset(key, "cancel_requested", 1)
        return True
