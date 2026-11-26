from fastapi import APIRouter

from src.api.routes.health_controller import router as health_router
from src.api.routes.sequence_controller import router as sequence_router
from src.api.routes.frame_controller import router as frames_router
from src.api.routes.job_controller import router as jobs_router
from src.api.routes.segment_controller import router as segment_router

api_router = APIRouter()
api_router.include_router(sequence_router)
api_router.include_router(frames_router)
api_router.include_router(segment_router)
api_router.include_router(health_router)
api_router.include_router(jobs_router)
