from pydantic import BaseModel, Field

from src.schemas.frame import GPSCoordinates


class ClassCoverage(BaseModel):
    class_id: int
    class_name: str
    pixel_count: int
    percentage: float


class SegmentResult(BaseModel):
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


class SegmentRequest(BaseModel):
    model_id: str
    sequence_id: str


class SegmentModel(BaseModel):
    model_id: str
    name: str


class SegmentModelList(BaseModel):
    models: list[SegmentModel]
