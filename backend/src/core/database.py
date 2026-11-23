from sqlalchemy import inspect, text
from sqlmodel import SQLModel, create_engine

from src.core.config import settings

engine = create_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    if engine.dialect.name != "postgresql":
        return

    primary_key = inspect(engine).get_pk_constraint("frame")
    constrained_columns = set(primary_key.get("constrained_columns") or [])
    if constrained_columns == {"id", "sequence_id"}:
        return

    constraint_name = primary_key.get("name")
    preparer = engine.dialect.identifier_preparer
    with engine.begin() as connection:
        if constraint_name:
            quoted_constraint_name = preparer.quote(constraint_name)
            connection.execute(text(f"ALTER TABLE frame DROP CONSTRAINT {quoted_constraint_name}"))
        connection.execute(text("ALTER TABLE frame ADD PRIMARY KEY (sequence_id, id)"))
