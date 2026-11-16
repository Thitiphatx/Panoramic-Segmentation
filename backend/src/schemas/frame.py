from pydantic import BaseModel


class GPSCoordinates(BaseModel):
    latitude: float | None = None
    longitude: float | None = None
    altitude: float | None = None


class FrameSummary(BaseModel):
    frame_id: str
    image_available: bool
    gps_available: bool


class SequenceList(BaseModel):
    sequences: list[str]


class FrameList(BaseModel):
    sequence: str
    frames: list[FrameSummary]
