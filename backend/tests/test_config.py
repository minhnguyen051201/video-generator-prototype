# tests/config_test.py
"""
Unit tests for core/config.py

These tests verify that environment variables from the .env file
are correctly loaded into the Settings object.
This ensures your configuration system works before connecting to the database.
"""

import pytest
from app.core.config import get_settings


@pytest.fixture(scope="module")
def settings():
    """Load the Settings instance once for all tests in this module."""
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
        "MYSQL_ROOT_PASSWORD",
        "MYSQL_PORT",
    ]

    for var in required_vars:
        value = getattr(settings, var, None)
        assert value is not None, f"❌ Missing environment variable: {var}"
        assert value != "", f"❌ Empty value for variable: {var}"

    print("✅ All required environment variables are loaded correctly.")


def test_database_url_format(settings):
    """
    Verify that SQLALCHEMY_DATABASE_URL is constructed properly.
    """
    url = settings.SQLALCHEMY_DATABASE_URL
    assert url.startswith("mysql+pymysql://"), "❌ Invalid DB URL format"
    assert settings.MYSQL_USER in url, "❌ User not in DB URL"
    assert settings.MYSQL_DATABASE in url, "❌ Database name not in DB URL"

    print(f"✅ SQLALCHEMY_DATABASE_URL looks good → {url}")
