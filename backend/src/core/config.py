import os
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import quote_plus

from src.schemas.segment import SegmentModel

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]

SEGMENT_MODELS = tuple(
    SegmentModel(model_id=f"segformer-b{variant}-cityscapes", name=f"SegFormer B{variant} (Cityscapes)")
    for variant in range(6)
)

@dataclass(frozen=True)
class Settings:
    cors_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    )
    available_models: tuple[SegmentModel, ...] = field(default_factory=lambda: SEGMENT_MODELS)


settings = Settings()
