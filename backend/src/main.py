from contextlib import asynccontextmanager
from threading import Event, Thread

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.router import api_router
from src.core.config import settings
from src.core.database import init_db
from src.workers.storage_sync_worker import run_worker

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
    except Exception as exc:
        print(f"[Database] Warning: Could not initialize tables on startup: {exc}")
    stop_storage_worker = Event()
    storage_worker = Thread(
        target=run_worker,
        args=(stop_storage_worker,),
        name="storage-sync-worker",
        daemon=True,
    )
    storage_worker.start()
    try:
        yield
    finally:
        stop_storage_worker.set()
        storage_worker.join(timeout=5)


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
