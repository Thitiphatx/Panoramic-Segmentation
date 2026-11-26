from pathlib import PurePosixPath
import uuid

from minio import Minio
from redis import Redis


class StorageService:
    bucket = "panoramic-segmentation"
    raw_path = "raw"
    images_root = f"{raw_path}/data_images"
    poses_root = f"{raw_path}/data_poses_oxt"
    sync_queue_name = "storage_sync:queue"
    sync_active_key = "storage_sync:active"
    sync_ttl_seconds = 604800
    sync_lock_ttl_seconds = 21600

    def __init__(self, client: Minio, redis_client: Redis) -> None:
        self._client = client
        self._redis = redis_client

    def get_client(self) -> Minio:
        return self._client

    def sequence_path(self, sequence_id: str) -> str:
        return f"{self.images_root}/{sequence_id}"

    def image_path(self, sequence_id: str, image_id: str) -> str:
        return f"{self.sequence_path(sequence_id)}/data_rect/{image_id}.png"

    def relative_object_path(self, path: str) -> str:
        """Return a bucket-relative object path, accepting legacy bucket prefixes."""
        prefix = f"{self.bucket}/"
        return path.removeprefix(prefix)

    def get_resource(self, path: str):
        object_path = self.relative_object_path(path)
        parts = PurePosixPath(object_path).parts
        if (
            not object_path
            or "\\" in object_path
            or any(part in {"", ".", ".."} for part in parts)
            or not (
                object_path.startswith(f"{self.images_root}/")
                or object_path.startswith("segmented/")
            )
        ):
            raise ValueError(f"Invalid storage path: {path!r}")
        return self.get_client().get_object(self.bucket, object_path)

    def list_sequence_ids(self) -> list[str]:
        """List sequence folders under raw/data_images/."""
        prefix = f"{self.images_root}/"
        objects = self.get_client().list_objects(self.bucket, prefix=prefix, recursive=False)
        return sorted(
            obj.object_name.removeprefix(prefix).strip("/")
            for obj in objects
            if obj.is_dir
        )

    def list_image_ids(self, sequence_id: str) -> list[str]:
        """List image ids (PNG file stems) in a sequence's data_rect folder."""
        prefix = f"{self.sequence_path(sequence_id)}/data_rect/"
        objects = self.get_client().list_objects(self.bucket, prefix=prefix, recursive=False)
        return sorted(
            PurePosixPath(obj.object_name).stem
            for obj in objects
            if not obj.is_dir and obj.object_name.lower().endswith(".png")
        )

    def get_first_timestamp(self, sequence_id: str) -> str:
        """Read the first timestamp line for a sequence."""
        timestamps = self.get_timestamps(sequence_id)
        return timestamps[0] if timestamps else ""

    def get_timestamps(self, sequence_id: str) -> list[str]:
        """Read all timestamp lines for a sequence in frame order."""
        object_name = f"{self.sequence_path(sequence_id)}/timestamps.txt"
        response = self.get_client().get_object(self.bucket, object_name)
        try:
            lines = response.read().decode("utf-8-sig").splitlines()
            return [line.strip() for line in lines]
        finally:
            response.close()
            response.release_conn()

    def get_gps_metadata(self, sequence_id: str, image_id: str) -> dict[str, float | int | str]:
        """Read GPS, motion, and receiver metadata from a KITTI-360 OXTS record."""
        object_name = f"{self.poses_root}/{sequence_id}/oxts/data/{image_id}.txt"
        response = self.get_client().get_object(self.bucket, object_name)
        try:
            values = [float(value) for value in response.read().decode("utf-8").split()]
        finally:
            response.close()
            response.release_conn()

        field_names = (
            "lat", "lon", "alt", "roll", "pitch", "yaw", "vn", "ve", "vf", "vl",
            "vu", "ax", "ay", "az", "af", "al", "au", "wx", "wy", "wz", "wf",
            "wl", "wu", "pos_accuracy", "vel_accuracy", "navstat", "numsats", "posmode",
            "velmode", "orimode",
        )
        if len(values) < len(field_names):
            raise ValueError(
                f"Invalid OXTS record for {sequence_id}/{image_id}: "
                f"expected {len(field_names)} values, got {len(values)}"
            )

        gps_metadata: dict[str, float | int | str] = {
            name: value for name, value in zip(field_names[:25], values[:25])
        }
        gps_metadata.update(
            {name: int(value) for name, value in zip(field_names[25:], values[25:30])}
        )
        gps_metadata["address"] = ""
        return gps_metadata

    def start_storage_sync(self) -> tuple[str, bool]:
        sync_id = str(uuid.uuid4())
        acquired = self._redis.set(
            self.sync_active_key,
            sync_id,
            nx=True,
            ex=self.sync_lock_ttl_seconds,
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
            self._redis.lpush(self.sync_queue_name, sync_id)
            return sync_id, True

        active_sync_id = self._redis.get(self.sync_active_key)
        if active_sync_id:
            return active_sync_id, False
        return self.start_storage_sync()

    def dequeue_storage_sync(self, timeout: int = 5) -> str | None:
        queued_item = self._redis.brpop(self.sync_queue_name, timeout=timeout)
        return queued_item[1] if queued_item else None

    def mark_storage_sync_running(self, sync_id: str) -> bool:
        result = self._redis.eval(
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
        return self._redis.hget(f"storage_sync:{sync_id}", "cancel_requested") == "1"

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
            removed = self._redis.lrem(self.sync_queue_name, 0, sync_id)
            if removed:
                self.finish_storage_sync(sync_id, "cancelled", "Storage sync cancelled")
                return {
                    **status,
                    "status": "cancelled",
                    "stage": "cancelled",
                    "message": "Storage sync cancelled",
                }
        return self.get_storage_sync(sync_id)

    def update_storage_sync(self, sync_id: str, values: dict[str, str | int]) -> None:
        key = f"storage_sync:{sync_id}"
        self._redis.hset(key, mapping=values)
        self._redis.expire(key, self.sync_ttl_seconds)
        if self._redis.get(self.sync_active_key) == sync_id:
            self._redis.expire(self.sync_active_key, self.sync_lock_ttl_seconds)

    def get_storage_sync(self, sync_id: str) -> dict[str, str | int]:
        values = self._redis.hgetall(f"storage_sync:{sync_id}")
        for field in ("completed", "total", "progress"):
            if field in values:
                values[field] = int(values[field])
        return values

    def get_active_storage_sync(self) -> dict[str, str | int] | None:
        sync_id = self._redis.get(self.sync_active_key)
        if not sync_id:
            return None
        status = self.get_storage_sync(sync_id)
        return status or None

    def recover_interrupted_storage_sync(self) -> None:
        sync_id = self._redis.get(self.sync_active_key)
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
        values: dict[str, str | int] = {"status": status, "stage": status, "message": message}
        if status == "completed":
            values["progress"] = 100
        self.update_storage_sync(sync_id, values)
        self._redis.eval(
            "if redis.call('get', KEYS[1]) == ARGV[1] then "
            "return redis.call('del', KEYS[1]) else return 0 end",
            1,
            self.sync_active_key,
            sync_id,
        )
        self._redis.delete(f"storage_sync:{sync_id}")


