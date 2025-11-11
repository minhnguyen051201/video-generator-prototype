from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from pathlib import Path


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
    SECRET_KEY: str = Field(..., description="Secret key used to sign JWT tokens")
    ALGORITHM: str = Field(
        default="HS256", description="Algorithm used for JWT token signing"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        description="Number of minutes before issued access tokens expire",
        ge=1,
    )

    # --- Database ---
    MYSQL_USER: str = Field(..., description="MySQL username")
    MYSQL_PASSWORD: str = Field(..., description="MySQL password")
    MYSQL_DATABASE: str = Field(..., description="MySQL database name")
    MYSQL_HOST: str = Field(..., description="MySQL host or service name")
    MYSQL_ROOT_PASSWORD: str | None = Field(
        default=None,
        description="Optional root password used only by the MySQL container",
    )
    MYSQL_PORT: int = Field(..., description="MySQL port")

    # --- Frontend ---
    ALLOWED_ORIGINS: list[str] | str = Field(
        default_factory=lambda: ["http://localhost:3000"],
        description="Comma-separated list of origins allowed by CORS",
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(
        cls, value: str | list[str] | tuple[str, ...] | None
    ) -> list[str]:
        if value is None:
            return []
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        if isinstance(value, (list, tuple)):
            return [
                origin.strip()
                for origin in value
                if isinstance(origin, str) and origin.strip()
            ]

        raise TypeError("ALLOWED_ORIGINS must be a string or a sequence of strings")

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
