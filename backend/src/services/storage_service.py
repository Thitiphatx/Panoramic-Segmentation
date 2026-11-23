from datetime import timedelta
from pathlib import PurePosixPath

from minio import Minio


class StorageService:
    bucket = "panoramic-segmentation"
    raw_path = "raw"
    images_root = f"{raw_path}/data_images"
    poses_root = f"{raw_path}/data_poses_oxt"

    def __init__(self, client: Minio) -> None:
        self._client = client

    def get_client(self) -> Minio:
        return self._client

    def sequence_path(self, sequence_id: str) -> str:
        return f"{self.images_root}/{sequence_id}"

    def image_path(self, sequence_id: str, image_id: str) -> str:
        return f"{self.sequence_path(sequence_id)}/data_rect/{image_id}.png"

    def access_url(self, path: str, expires: timedelta = timedelta(hours=1)) -> str:
        """Create a temporary URL for a stored object, given `bucket/object-key`."""
        bucket, separator, object_name = path.partition("/")
        if not separator or not object_name:
            raise ValueError(f"Invalid storage path: {path!r}")
        return self.get_client().presigned_get_object(bucket, object_name, expires=expires)

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


