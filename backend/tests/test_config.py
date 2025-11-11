# tests/config_test.py
"""
Unit tests for core/config.py

These tests verify that environment variables from the .env file
are correctly loaded into the Settings object.
This ensures your configuration system works before connecting to the database.
"""

import pytest
from app.core.config import get_settings


@pytest.fixture()
def settings(monkeypatch):
    """Load the Settings instance once for all tests in this module."""

    required_env = {
        "MYSQL_USER": "test_user",
        "MYSQL_PASSWORD": "test_password",
        "MYSQL_DATABASE": "test_db",
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "3306",
        "ALLOWED_ORIGINS": "http://localhost:3000,https://localhost:5173",
        "SECRET_KEY": "test-secret-key",
        "ACCESS_TOKEN_EXPIRE_MINUTES": "45",
    }

    for key, value in required_env.items():
        monkeypatch.setenv(key, value)

    # Optional variables should default gracefully if unset.
    monkeypatch.delenv("MYSQL_ROOT_PASSWORD", raising=False)

    # Clear cached settings to ensure we pick up the monkeypatched values.
    get_settings.cache_clear()

    return get_settings()


def test_env_variables_exist(settings):
    """
    Ensure all required environment variables are present
    and non-empty in the loaded settings.
    """
    required_vars = [
        "MYSQL_USER",
        "MYSQL_PASSWORD",
        "MYSQL_DATABASE",
        "MYSQL_HOST",
        "MYSQL_PORT",
    ]

    for var in required_vars:
        value = getattr(settings, var, None)
        assert value is not None, f"❌ Missing environment variable: {var}"
        assert value != "", f"❌ Empty value for variable: {var}"

    print("✅ All required environment variables are loaded correctly.")

    # Optional variable should remain unset unless explicitly provided.
    assert settings.MYSQL_ROOT_PASSWORD is None

    # Comma-separated ALLOWED_ORIGINS should be parsed into a list.
    assert settings.ALLOWED_ORIGINS == [
        "http://localhost:3000",
        "https://localhost:5173",
    ]
    assert settings.SECRET_KEY == "test-secret-key"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 45


def test_database_url_format(settings):
    """
    Verify that SQLALCHEMY_DATABASE_URL is constructed properly.
    """
    url = settings.SQLALCHEMY_DATABASE_URL
    assert url.startswith("mysql+pymysql://"), "❌ Invalid DB URL format"
    assert settings.MYSQL_USER in url, "❌ User not in DB URL"
    assert settings.MYSQL_DATABASE in url, "❌ Database name not in DB URL"

    print(f"✅ SQLALCHEMY_DATABASE_URL looks good → {url}")
