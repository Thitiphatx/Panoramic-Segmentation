from typing import Literal
from pydantic import BaseModel

class GPSCoordinates(BaseModel):
    latitude: float | None = None
    longitude: float | None = None
    altitude: float | None = None

class FrameSummary(BaseModel):
    frame_id: str
    image_available: bool
    gps_available: bool

class FrameMetadata(BaseModel):
    date: str
    gps: GPSCoordinates

class FrameDetail(BaseModel):
    id: str
    metadata: FrameMetadata
    status: Literal["Ready", "Processing", "Segmented"]
class Sequence(BaseModel):
    id: str
    preview: str
    date: str
    status: Literal["Ready", "Processing", "Segmented"]
    frames: int
    duration: int
    storage: str


class FrameList(BaseModel):
    sequence: str
    frames: list[FrameSummary]

class ResourceList(BaseModel):
    text: str
