from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from pathlib import Path

from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    """
    Global backend configuration loaded from .env
    Works seamlessly with Docker Compose MySQL environment variables.
    """

    # --- Application ---
    APP_NAME: str = "Video Generator API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # --- Database ---
    MYSQL_USER: Optional[str] = None
    MYSQL_PASSWORD: Optional[str] = None
    MYSQL_DATABASE: Optional[str] = None
    MYSQL_HOST: Optional[str] = None  # matches docker-compose service name
    MYSQL_ROOT_PASSWORD: Optional[str] = None  # optional, only used by container
    MYSQL_PORT: Optional[str] = None

    # --- Frontend ---
    FRONTEND_URL: str = "http://localhost:3000"

    # Pydantic v2 configuration
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env", env_file_encoding="utf-8"
    )

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        """
        Construct database connection string.
        """
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
        )


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings instance (only loads .env once).
    """
    return Settings()
