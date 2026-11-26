from typing import Any

from sqlalchemy import Column, ForeignKeyConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class Frame(SQLModel, table=True):
    __tablename__ = "frame"
    __table_args__ = {"extend_existing": True}

    id: str = Field(primary_key=True)
    sequence_id: str = Field(primary_key=True)
    metadata_: dict[str, Any] = Field(default_factory=dict, sa_column=Column("metadata", JSONB, nullable=False))


class Sequence(SQLModel, table=True):
    __tablename__ = "sequence"
    __table_args__ = {"extend_existing": True}

    id: str = Field(primary_key=True)
    metadata_: dict[str, Any] = Field(default_factory=dict, sa_column=Column("metadata", JSONB, nullable=False))


class FrameResult(SQLModel, table=True):
    __tablename__ = "fameresult"
    __table_args__ = (
        ForeignKeyConstraint(
            ["sequence_id", "frame_id"], ["frame.sequence_id", "frame.id"]
        ),
        {"extend_existing": True},
    )

    sequence_id: str = Field(primary_key=True)
    frame_id: str = Field(primary_key=True)
    model_id: str = Field(primary_key=True, index=True)
    most_found_class: str
    classes: dict[str, float] | None = Field(default=None, sa_column=Column(JSONB))
