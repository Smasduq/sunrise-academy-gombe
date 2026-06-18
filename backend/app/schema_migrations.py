"""Lightweight schema patches for existing databases."""

from sqlalchemy import inspect, text

from app.config import settings
from app.database import engine


def _column_exists(table: str, column: str) -> bool:
    insp = inspect(engine)
    if table not in insp.get_table_names():
        return False
    return column in {col["name"] for col in insp.get_columns(table)}


def ensure_student_columns() -> None:
    is_sqlite = settings.database_url.startswith("sqlite")
    additions: list[tuple[str, str]] = [
        ("middle_name", "TEXT" if is_sqlite else "VARCHAR(100)"),
        ("photo_url", "TEXT" if is_sqlite else "VARCHAR(500)"),
        ("mother_name", "TEXT" if is_sqlite else "VARCHAR(150)"),
        ("guardian_email", "TEXT" if is_sqlite else "VARCHAR(255)"),
        ("guardian_relationship", "TEXT" if is_sqlite else "VARCHAR(50)"),
        ("emergency_contact", "TEXT" if is_sqlite else "VARCHAR(30)"),
        ("admission_date", "TIMESTAMP"),
        ("is_archived", "INTEGER DEFAULT 0" if is_sqlite else "BOOLEAN DEFAULT FALSE"),
        ("is_deleted", "INTEGER DEFAULT 0" if is_sqlite else "BOOLEAN DEFAULT FALSE"),
        ("deleted_at", "TIMESTAMP"),
    ]

    with engine.begin() as conn:
        if not is_sqlite:
            conn.execute(text("SET statement_timeout = '60s'"))
        for name, ddl in additions:
            if _column_exists("students", name):
                continue
            try:
                conn.execute(text(f"ALTER TABLE students ADD COLUMN {name} {ddl}"))
            except Exception as exc:
                print(f"[schema] Could not add students.{name}: {exc}")


def ensure_student_promotion_table() -> None:
    """Create student_promotion_history if missing (PostgreSQL / SQLite)."""
    try:
        insp = inspect(engine)
        if "student_promotion_history" in insp.get_table_names():
            return
        from app.models import StudentPromotionHistory  # noqa: F401
        from app.database import Base

        Base.metadata.tables["student_promotion_history"].create(bind=engine, checkfirst=True)
    except Exception as exc:
        print(f"[schema] Could not create student_promotion_history: {exc}")
