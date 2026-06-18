from collections.abc import Generator

from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import BASE_DIR, settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

if settings.database_url.startswith("sqlite"):
    engine = create_engine(settings.database_url, connect_args=connect_args)
else:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record) -> None:
    if settings.database_url.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    import app.models  # noqa: F401
    from app.admin_helpers import get_or_create_settings
    from app.school_classes import ensure_school_classes

    if settings.database_url.startswith("sqlite"):
        db_path = settings.database_url.replace("sqlite:///", "")
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        ensure_school_classes(db)
        get_or_create_settings(db)
    finally:
        db.close()

