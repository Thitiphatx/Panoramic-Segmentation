from typing import Any

from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Column, Field, SQLModel


class Frame(SQLModel, table=True):
    id: str = Field(primary_key=True)
    sequence_id: str = Field(foreign_key="sequence.id", index=True, primary_key=True)
    metadata_: dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column("metadata", JSONB, nullable=False),
    )

    def __init__(self, **data: Any):
        if "metadata" in data and "metadata_" not in data:
            data["metadata_"] = data.pop("metadata")
        super().__init__(**data)
