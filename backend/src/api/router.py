from fastapi import APIRouter

from src.api.routes.health import router as health_router
from src.api.routes.sequences import router as sequences_router
from src.api.routes.segmentation import router as segmentation_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(sequences_router)
api_router.include_router(segmentation_router)
