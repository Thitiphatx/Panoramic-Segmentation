from pydantic import BaseModel, Field

from src.schemas.frame import GPSCoordinates


class ClassCoverage(BaseModel):
    class_id: int
    class_name: str
    pixel_count: int
    percentage: float


class SegmentationResult(BaseModel):
    frame_id: str | None = None
    gps: GPSCoordinates | None = None
    image: str
    mask: str
    width: int
    height: int
    classes: list[ClassCoverage]
    inference_time_ms: float


class UploadedGPS(BaseModel):
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    altitude: float | None = None
