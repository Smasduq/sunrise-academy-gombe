import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

INSECURE_SECRET_VALUES = {"", "change-me-to-a-long-random-string"}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql://postgres:password@localhost:5432/postgres"
    secret_key: str = ""
    access_token_expire_minutes: int = 60 * 24
    cors_origins: str = "http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:3001,http://localhost:3001"
    hf_token: str = ""
    hf_bucket_id: str = ""  # e.g. your-username/sunrise-academy-gombe

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def jwt_secret(self) -> str:
        if self.secret_key and self.secret_key not in INSECURE_SECRET_VALUES:
            return self.secret_key
        if os.getenv("ENVIRONMENT", "").lower() == "production":
            raise RuntimeError("SECRET_KEY must be set to a strong value when ENVIRONMENT=production.")
        return "local-development-only-secret"


settings = Settings()

if os.getenv("ENVIRONMENT", "").lower() == "production" and not settings.cors_origin_list:
    raise RuntimeError("CORS_ORIGINS is required when ENVIRONMENT=production.")
