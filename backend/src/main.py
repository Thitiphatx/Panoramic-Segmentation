from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.router import api_router
from src.core.config import settings
from src.services.segment_service import SegmentService


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.segment_service = SegmentService(settings)
    yield


app = FastAPI(
    title="Panoramic Segment API",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok", "message": "Panoramic Segment API is running"}
