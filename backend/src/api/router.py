from fastapi import APIRouter

from src.api.routes.health_controller import router as health_router
from src.api.routes.sequences_controller import router as sequences_router
from src.api.routes.resource_controller import router as resource_router
from src.api.routes.frame_controller import router as frames_router
from src.api.routes.jobs_controller import router as jobs_router
from src.api.routes.segment_controller import router as segment_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(sequences_router)
api_router.include_router(resource_router)
api_router.include_router(frames_router)
api_router.include_router(jobs_router)
api_router.include_router(segment_router)
