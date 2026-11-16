from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile

from src.core.config import settings
from src.core.errors import DatasetNotFoundError, InferenceUnavailableError, InvalidImageError
from src.schemas.frame import GPSCoordinates
from src.schemas.segmentation import SegmentationResult, UploadedGPS
from src.services.kitti360 import Kitti360Service

router = APIRouter(tags=["segmentation"])


def _segment(request: Request, image_bytes: bytes, frame_id: str | None, gps: GPSCoordinates | None):
    service = request.app.state.segmentation_service
    try:
        return service.segment(image_bytes, frame_id=frame_id, gps=gps)
    except InferenceUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except InvalidImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get(
    "/api/sequences/{sequence}/frames/{frame_id}/segmentation",
    response_model=SegmentationResult,
)
def segment_dataset_frame(
    sequence: str,
    frame_id: str,
    request: Request,
    camera: str = "image_00",
) -> SegmentationResult:
    if not frame_id.isdigit():
        raise HTTPException(status_code=422, detail="frame_id must contain digits only")
    if not camera.startswith("image_") or not camera[6:].isdigit():
        raise HTTPException(status_code=422, detail="camera must use the form image_NN")
    try:
        image_path, gps = Kitti360Service(settings).get_frame(sequence, frame_id, camera)
    except DatasetNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return _segment(request, image_path.read_bytes(), frame_id, gps)


@router.post("/api/segmentation", response_model=SegmentationResult)
async def segment_upload(
    request: Request,
    file: UploadFile = File(...),
    latitude: float | None = Form(default=None, ge=-90, le=90),
    longitude: float | None = Form(default=None, ge=-180, le=180),
    altitude: float | None = Form(default=None),
) -> SegmentationResult:
    content = await file.read(settings.max_upload_bytes + 1)
    await file.close()
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Uploaded image exceeds the size limit")
    gps = None
    if latitude is not None or longitude is not None or altitude is not None:
        try:
            gps = UploadedGPS(latitude=latitude, longitude=longitude, altitude=altitude)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        gps = GPSCoordinates(**gps.model_dump())
    return _segment(request, content, None, gps)
