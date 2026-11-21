from pathlib import PurePosixPath

from minio.error import S3Error

from src.core.config import Settings
from src.core.errors import (
    DatasetNotFoundError,
    InvalidSegmentRequestError,
    InvalidSequenceDataError,
    SequenceStorageUnavailableError,
)
from src.schemas.segment import SegmentRequest
from src.services.storage_service import StorageService


class SequenceSegmentService:
    def __init__(self, settings: Settings, storage: StorageService | None = None):
        self.settings = settings
        self.storage = storage if storage is not None else StorageService()

    def list_models(self):
        return list(self.settings.available_models)

    def validate_request(self, request: SegmentRequest) -> None:
        if request.model_id not in {model.model_id for model in self.settings.available_models}:
            raise InvalidSegmentRequestError(f"Unknown model_id '{request.model_id}'")
        if (
            not request.sequence_id
            or request.sequence_id in {".", ".."}
            or "/" in request.sequence_id
            or "\\" in request.sequence_id
        ):
            raise InvalidSegmentRequestError("Invalid sequence_id")

        prefix = f"{self.storage.raw_path}/data_images/{request.sequence_id}/"
        try:
            client = self.storage.get_client()
            objects = list(client.list_objects(self.storage.bucket, prefix=prefix, recursive=True))
            names = [item.object_name for item in objects if item.object_name]
        except (RuntimeError, S3Error, OSError) as exc:
            raise SequenceStorageUnavailableError("Sequence storage is unavailable") from exc

        if not names:
            raise DatasetNotFoundError(f"Sequence '{request.sequence_id}' was not found")

        image_names = [
            name for name in names
            if "/data_rect/" in name
            and PurePosixPath(name).suffix.lower() in {".png", ".jpg", ".jpeg"}
        ]
        if not image_names:
            raise InvalidSequenceDataError("Sequence must contain at least one image under data_rect")

        timestamp_name = f"{prefix}timestamps.txt"
        if timestamp_name not in names:
            raise InvalidSequenceDataError("Sequence is missing timestamps.txt")
        try:
            response = client.get_object(self.storage.bucket, timestamp_name)
            try:
                timestamps = [
                    line for line in response.read().decode("utf-8-sig").splitlines() if line.strip()
                ]
            finally:
                response.close()
                response.release_conn()
        except (S3Error, OSError, UnicodeDecodeError) as exc:
            raise InvalidSequenceDataError("Unable to read timestamps.txt") from exc

        if len(timestamps) != len(image_names):
            raise InvalidSequenceDataError(
                f"timestamps.txt has {len(timestamps)} entries for {len(image_names)} image files"
            )
