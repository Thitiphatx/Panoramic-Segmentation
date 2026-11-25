from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import ForeignKeyConstraint
from sqlmodel import Column, Field, SQLModel


class FrameResult(SQLModel, table=True):
    __tablename__ = "fameresult"
    __table_args__ = (
        ForeignKeyConstraint(["sequence_id", "frame_id"], ["frame.sequence_id", "frame.id"]),
    )

    sequence_id: str = Field(primary_key=True)
    frame_id: str = Field(primary_key=True)
    model_id: str = Field(primary_key=True, index=True)
    most_found_class: str
    classes: dict[str, float] | None = Field(default=None, sa_column=Column(JSONB))
