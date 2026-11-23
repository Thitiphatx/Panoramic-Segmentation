from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Column, Field, SQLModel


class FrameResult(SQLModel, table=True):
    image_id: str = Field(foreign_key="image.id", primary_key=True)
    model_id: str = Field(index=True)
    most_found_class: str
    classes: dict[str, float] | None = Field(default=None, sa_column=Column(JSONB))
    artifact: dict[str, str] = Field(default_factory=dict, sa_column=Column(JSONB, nullable=False))
