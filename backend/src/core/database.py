import os
from collections.abc import Generator

from sqlalchemy import URL, inspect, text
from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine


def create_database_engine() -> Engine:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return create_engine(database_url, pool_pre_ping=True)

    required = ("POSTGRES_HOST", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD")
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        raise RuntimeError(f"Database configuration missing: {', '.join(missing)}")

    return create_engine(
        URL.create(
            "postgresql+psycopg",
            username=os.environ["POSTGRES_USER"],
            password=os.environ["POSTGRES_PASSWORD"],
            host=os.environ["POSTGRES_HOST"],
            port=int(os.getenv("POSTGRES_PORT", "5432")),
            database=os.environ["POSTGRES_DB"],
        ),
        pool_pre_ping=True,
    )


engine = create_database_engine()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    if engine.dialect.name != "postgresql":
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE fameresult DROP COLUMN IF EXISTS artifact"))

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
