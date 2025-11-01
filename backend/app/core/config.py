from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from functools import lru_cache
from pathlib import Path

from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    """
    Global backend configuration loaded from .env
    Works seamlessly with Docker Compose MySQL environment variables.
    """

    # --- Application ---
    APP_NAME: str = "Video Generator API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    # --- Database ---
    MYSQL_USER: str
    MYSQL_PASSWORD: str
    MYSQL_DATABASE: str
    MYSQL_HOST: str  # matches docker-compose service name
    MYSQL_ROOT_PASSWORD: str  # optional, only used by container
    MYSQL_PORT: str

    # --- Frontend ---
    ALLOWED_ORIGINS: List[str] | str

    # Pydantic v2 configuration

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env", env_file_encoding="utf-8"
    )

    @field_validator("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, v: str) -> List[str]:
        return v.split(",") if v else []

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
