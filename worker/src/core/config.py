import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    redis_host: str = os.getenv("REDIS_HOST", "localhost")
    redis_port: int = int(os.getenv("REDIS_PORT", "6379"))
    redis_username: str | None = os.getenv("REDIS_USERNAME") or None
    redis_password: str = os.getenv("REDIS_PASSWORD", "redis-dev-password")
    s3_endpoint: str = os.getenv("S3_ENDPOINT", "localhost:9000")
    s3_access_key: str = os.getenv("S3_ACCESS_KEY", "minioadmin")
    s3_secret_key: str = os.getenv("S3_SECRET_KEY", "minioadmin")
    s3_use_ssl: bool = os.getenv("S3_USE_SSL", "false").lower() == "true"
    s3_bucket: str = os.getenv("S3_BUCKET", "panoramic-segmentation")
    model_dir: Path = Path(os.getenv(
        "MODEL_DIR", str(Path(__file__).resolve().parents[1] / "models" / "segforme-cityscapes-1024-1024")
    ))
    poll_seconds: float = float(os.getenv("WORKER_POLL_SECONDS", "2"))
    redis_retry_seconds: float = float(os.getenv("REDIS_RETRY_SECONDS", "5"))
    redis_queue: str = "job_queue"


settings = Settings()
