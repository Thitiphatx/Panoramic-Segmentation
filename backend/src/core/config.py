import os
from dataclasses import dataclass
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[3]


def _env_path(name: str, default: Path) -> Path:
    value = os.getenv(name)
    return Path(value).expanduser().resolve() if value else default.resolve()


@dataclass(frozen=True)
class Settings:
    dataset_dir: Path = _env_path("KITTI360_DATASET", REPOSITORY_ROOT / "datasets" / "KITTI-360")
    model_dir: Path = _env_path(
        "SEGFORMER_MODEL_DIR",
        REPOSITORY_ROOT / "training" / "models" / "segformer-finetuned-cityscapes-1024-1024" / "b0",
    )
    max_upload_bytes: int = int(os.getenv("MAX_UPLOAD_BYTES", str(20 * 1024 * 1024)))
    cors_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    )


settings = Settings()
