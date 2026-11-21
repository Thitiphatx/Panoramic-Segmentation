import io
import json
import os
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from pathlib import PurePosixPath
from threading import Lock

from minio import Minio
from minio.error import S3Error
from pydantic import ValidationError

from src.schemas.frame import Sequence, SequenceItem
from src.utils.utils import env


class StorageService:
    sequence_cache_seconds = 1
    sequence_workers = 8
    bucket = "panoramic-segmentation"
    result_path = "result"
    raw_path = "raw"
    object_name = "hello.txt"
    payload = b"hello from SILO\n"

    def __init__(self, client: Minio | None = None) -> None:
        self._client = client
        self._sequence_cache: tuple[float, list[Sequence]] | None = None
        self._sequence_cache_lock = Lock()

    def get_client(self) -> Minio:
        """Create and cache the MinIO client when storage is first used."""
        if self._client is None:
            self._client = Minio(
                env("S3_ENDPOINT"),
                access_key=env("S3_ACCESS_KEY"),
                secret_key=env("S3_SECRET_KEY"),
                secure=os.environ.get("S3_USE_SSL", "false").lower() == "true",
            )
        return self._client

    def get_sequences(self) -> list[SequenceItem]:
        """Return summaries for image sequences that also have OXTS folders."""
        with self._sequence_cache_lock:
            now = time.monotonic()
            if self._sequence_cache and now - self._sequence_cache[0] < self.sequence_cache_seconds:
                return self._sequence_cache[1]

            client = self.get_client()
            images_prefix = f"{self.raw_path}/data_images/"
            poses_prefix = f"{self.raw_path}/data_poses_oxt/"
            image_sequences = self._list_child_folders(client, images_prefix)
            pose_sequences = self._list_child_folders(client, poses_prefix)
            sequence_ids = sorted(image_sequences & pose_sequences)

            with ThreadPoolExecutor(max_workers=min(self.sequence_workers, len(sequence_ids) or 1)) as executor:
                sequences = list(
                    executor.map(
                        lambda sequence_id: self._get_sequence(client, sequence_id, images_prefix),
                        sequence_ids,
                    )
                )

            self._sequence_cache = (time.monotonic(), sequences)
            return sequences

    def _list_child_folders(self, client: Minio, prefix: str) -> set[str]:
        folders = set()
        for item in client.list_objects(self.bucket, prefix=prefix, recursive=False):
            if not item.object_name or not item.object_name.startswith(prefix):
                continue
            relative_name = item.object_name[len(prefix):]
            folder_name, separator, _ = relative_name.partition("/")
            if folder_name and (separator or relative_name.endswith("/")):
                folders.add(folder_name)
        return folders

    def _get_sequence(self, client: Minio, sequence_id: str, images_prefix: str) -> SequenceItem:
        sequence_prefix = f"{images_prefix}{sequence_id}/"
        metadata_name = f"{sequence_prefix}metadata.json"
        try:
            response = client.get_object(self.bucket, metadata_name)
            try:
                metadata = json.loads(response.read().decode("utf-8"))
                sequence = Sequence.model_validate(metadata)
                sequence.preview = self._get_preview_url(client, sequence_prefix)
                return sequence
            finally:
                response.close()
                response.release_conn()
        except S3Error as exc:
            if exc.code not in {"NoSuchKey", "NoSuchObject", "NotFound"}:
                raise
        except (json.JSONDecodeError, UnicodeDecodeError, ValidationError):
            pass

        sequence = self._build_sequence(client, sequence_id, sequence_prefix)
        metadata_bytes = sequence.model_dump_json().encode("utf-8")
        client.put_object(
            self.bucket,
            metadata_name,
            io.BytesIO(metadata_bytes),
            length=len(metadata_bytes),
            content_type="application/json",
        )
        return sequence

    def _build_sequence(self, client: Minio, sequence_id: str, sequence_prefix: str) -> SequenceItem:
        timestamp_response = client.get_object(self.bucket, f"{sequence_prefix}timestamps.txt")
        try:
            first_timestamp = timestamp_response.read(256).decode("utf-8-sig").splitlines()[0].strip()
        finally:
            timestamp_response.close()
            timestamp_response.release_conn()

        return SequenceItem(
            id=sequence_id,
            preview=self._get_preview_url(client, sequence_prefix),
            status="Ready",
            date=first_timestamp,
        )

    def _get_preview_url(self, client: Minio, sequence_prefix: str) -> str:
        image_names = sorted(
            item.object_name
            for item in client.list_objects(self.bucket, prefix=sequence_prefix, recursive=True)
            if item.object_name
            and "/data_rect/" in item.object_name
            and PurePosixPath(item.object_name).suffix.lower() == ".png"
        )
        if not image_names:
            raise ValueError(f"Sequence has no PNG preview under {sequence_prefix}")
        return client.presigned_get_object(
            self.bucket,
            image_names[0],
            expires=timedelta(hours=1),
        )

    @staticmethod
    def _format_size(size_bytes: int) -> str:
        size_gb = size_bytes / (1024**3)
        return f"{size_gb:.1f} GB"
