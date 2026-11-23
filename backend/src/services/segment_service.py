from pathlib import Path

from src.core.config import Settings
from src.inference.postprocessing import class_coverage, colorize_mask
from src.inference.segformer import SegformerPredictor
from src.schemas.frame import GPSCoordinates
from src.utils.images import as_data_uri, decode_image


class SegmentService:
    def __init__(self, settings: Settings):
        self.predictor = SegformerPredictor(settings.model_dir)

    def segment(self, image_bytes: bytes, frame_id: str | None = None, gps: GPSCoordinates | None = None):
        image = decode_image(image_bytes)
        mask, elapsed_ms, labels = self.predictor.predict(image)
        return {
            "frame_id": frame_id,
            "gps": gps,
            "image": as_data_uri(image),
            "mask": as_data_uri(colorize_mask(mask)),
            "width": image.width,
            "height": image.height,
            "classes": class_coverage(mask, labels),
            "inference_time_ms": round(elapsed_ms, 3),
        }

    def segment_file(self, path: Path, frame_id: str, gps: GPSCoordinates | None = None):
        return self.segment(path.read_bytes(), frame_id=frame_id, gps=gps)


