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

class FrameDetail(BaseModel):
    sequence_id: str
    frame_id: str
    image_available: bool
    gps: GPSCoordinates | None = None

class SequenceItem(BaseModel):
    id: str
    preview: str
    date: str
    status: Literal["Ready", "Processing", "Segmented"]

class Sequence(SequenceItem):
    frames: int
    duration: str
    storage: str

class FrameList(BaseModel):
    sequence: str
    frames: list[FrameSummary]

class ResourceList(BaseModel):
    text: str
