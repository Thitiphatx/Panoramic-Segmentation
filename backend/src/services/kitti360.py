from pathlib import Path

from src.core.errors import DatasetNotFoundError
from src.core.config import Settings
from src.schemas.frame import GPSCoordinates


class Kitti360Service:
    def __init__(self, settings: Settings):
        self.dataset_dir = settings.dataset_dir

    def list_sequences(self) -> list[str]:
        images_root = self.dataset_dir / "data_images"
        if not images_root.is_dir():
            return []
        return sorted(path.name for path in images_root.iterdir() if path.is_dir())

    def list_frames(self, sequence: str, camera: str = "image_00") -> list[dict[str, object]]:
        image_dir = self._image_dir(sequence, camera)
        if not image_dir.is_dir():
            raise DatasetNotFoundError(f"Sequence '{sequence}' or camera '{camera}' was not found")
        frames = []
        for image_path in sorted(image_dir.glob("*.png"), key=lambda path: path.stem):
            pose_path = self._pose_path(sequence, image_path.stem)
            frames.append({
                "frame_id": image_path.stem,
                "image_available": True,
                "gps_available": pose_path.is_file(),
            })
        return frames

    def get_frame(self, sequence: str, frame_id: str, camera: str = "image_00") -> tuple[Path, GPSCoordinates | None]:
        image_path = self._image_dir(sequence, camera) / f"{frame_id}.png"
        if not image_path.is_file():
            raise DatasetNotFoundError(f"Frame '{frame_id}' was not found in sequence '{sequence}'")
        pose_path = self._pose_path(sequence, frame_id)
        gps = self._read_gps(pose_path) if pose_path.is_file() else None
        return image_path, gps

    def _image_dir(self, sequence: str, camera: str) -> Path:
        # Resolve and verify paths to prevent user-supplied traversal outside the dataset.
        root = (self.dataset_dir / "data_images").resolve()
        candidate = (root / sequence / camera / "data_rect").resolve()
        if candidate != root and root not in candidate.parents:
            raise DatasetNotFoundError("Invalid sequence or camera")
        return candidate

    def _pose_path(self, sequence: str, frame_id: str) -> Path:
        return self.dataset_dir / "data_poses_oxt" / sequence / "oxts" / "data" / f"{frame_id}.txt"

    @staticmethod
    def _read_gps(path: Path) -> GPSCoordinates | None:
        try:
            values = path.read_text(encoding="utf-8").split()
            if len(values) < 3:
                return None
            return GPSCoordinates(latitude=float(values[0]), longitude=float(values[1]), altitude=float(values[2]))
        except (OSError, ValueError):
            return None
