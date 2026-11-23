import time
import uuid

from redis import Redis


class RedisService:
    queue_name = "job_queue"
    storage_sync_queue_name = "storage_sync:queue"
    storage_sync_active_key = "storage_sync:active"
    storage_sync_ttl_seconds = 604800
    storage_sync_lock_ttl_seconds = 21600

    def __init__(self, client: Redis) -> None:
        self._client = client

    def create_job(self) -> str:
        job_id = str(uuid.uuid4())
        job_key = f"job:{job_id}"

        self._client.hset(
            job_key,
            mapping={
                "status": "pending",
                "job_type": "segment",
                "created_at": time.time(),
            },
        )
        self._client.lpush(self.queue_name, job_id)
        return job_id

    def check_job_status(self, job_id: str) -> dict[str, str]:
        return self._client.hgetall(f"job:{job_id}")

    def start_storage_sync(self) -> tuple[str, bool]:
        sync_id = str(uuid.uuid4())
        acquired = self._client.set(
            self.storage_sync_active_key,
            sync_id,
            nx=True,
            ex=self.storage_sync_lock_ttl_seconds,
        )
        if acquired:
            self.update_storage_sync(
                sync_id,
                {
                    "sync_id": sync_id,
                    "job_type": "storage_sync",
                    "status": "queued",
                    "stage": "queued",
                    "completed": 0,
                    "total": 0,
                    "progress": 0,
                    "message": "Storage sync queued",
                },
            )
            self._client.lpush(self.storage_sync_queue_name, sync_id)
            return sync_id, True

        active_sync_id = self._client.get(self.storage_sync_active_key)
        if active_sync_id:
            return active_sync_id, False

        return self.start_storage_sync()

    def dequeue_storage_sync(self, timeout: int = 5) -> str | None:
        queued_item = self._client.brpop(self.storage_sync_queue_name, timeout=timeout)
        return queued_item[1] if queued_item else None

    def mark_storage_sync_running(self, sync_id: str) -> bool:
        result = self._client.eval(
            "if redis.call('hget', KEYS[1], 'cancel_requested') == '1' then "
            "return 0 end "
            "redis.call('hset', KEYS[1], 'status', 'running', 'stage', 'discovering', "
            "'message', 'Starting storage sync') "
            "return 1",
            1,
            f"storage_sync:{sync_id}",
        )
        return bool(result)

    def is_storage_sync_cancel_requested(self, sync_id: str) -> bool:
        return self._client.hget(f"storage_sync:{sync_id}", "cancel_requested") == "1"

    def cancel_storage_sync(self, sync_id: str) -> dict[str, str | int]:
        status = self.get_storage_sync(sync_id)
        if not status or status.get("status") in {"completed", "failed", "cancelled"}:
            return status

        self.update_storage_sync(
            sync_id,
            {
                "cancel_requested": 1,
                "status": "cancelling",
                "stage": "cancelling",
                "message": "Cancellation requested",
            },
        )
        if status.get("status") == "queued":
            removed = self._client.lrem(self.storage_sync_queue_name, 0, sync_id)
            if removed:
                self.finish_storage_sync(sync_id, "cancelled", "Storage sync cancelled")
        return self.get_storage_sync(sync_id)

    def update_storage_sync(self, sync_id: str, values: dict[str, str | int]) -> None:
        key = f"storage_sync:{sync_id}"
        self._client.hset(key, mapping=values)
        self._client.expire(key, self.storage_sync_ttl_seconds)
        if self._client.get(self.storage_sync_active_key) == sync_id:
            self._client.expire(self.storage_sync_active_key, self.storage_sync_lock_ttl_seconds)

    def get_storage_sync(self, sync_id: str) -> dict[str, str | int]:
        values = self._client.hgetall(f"storage_sync:{sync_id}")
        for field in ("completed", "total", "progress"):
            if field in values:
                values[field] = int(values[field])
        return values

    def get_active_storage_sync(self) -> dict[str, str | int] | None:
        sync_id = self._client.get(self.storage_sync_active_key)
        if not sync_id:
            return None
        status = self.get_storage_sync(sync_id)
        return status or None

    def recover_interrupted_storage_sync(self) -> None:
        sync_id = self._client.get(self.storage_sync_active_key)
        if not sync_id:
            return
        status = self.get_storage_sync(sync_id)
        if status.get("status") not in {"running", "cancelling"}:
            return

        was_cancelled = status.get("cancel_requested") == "1"
        self.finish_storage_sync(
            sync_id,
            "cancelled" if was_cancelled else "failed",
            "Storage sync cancelled after backend restart"
            if was_cancelled
            else "Storage sync interrupted by backend restart",
        )

    def finish_storage_sync(self, sync_id: str, status: str, message: str) -> None:
        values: dict[str, str | int] = {
            "status": status,
            "stage": status,
            "message": message,
        }
        if status == "completed":
            values["progress"] = 100
        self.update_storage_sync(sync_id, values)
        self._client.eval(
            "if redis.call('get', KEYS[1]) == ARGV[1] then "
            "return redis.call('del', KEYS[1]) else return 0 end",
            1,
            self.storage_sync_active_key,
            sync_id,
        )
