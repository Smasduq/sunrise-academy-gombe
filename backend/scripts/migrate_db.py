"""Run database migrations. Execute: python scripts/migrate_db.py"""

from app.database import init_db

if __name__ == "__main__":
    print("Running database migrations…")
    init_db()
    print("Done.")
