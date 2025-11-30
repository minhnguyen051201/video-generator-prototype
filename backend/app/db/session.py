"""
Initializes the SQLAlchemy database connection.

This file:
- Creates the engine using environment-based settings.
- Defines a session factory for transaction management.
- Exposes a Base class for all ORM models to inherit.
- Provides a dependency injection function for FastAPI routes.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings


# ---------------------------------------------------------------------
# Load environment configuration
# ---------------------------------------------------------------------
settings = get_settings()

# ---------------------------------------------------------------------
# SQLAlchemy Engine
# ---------------------------------------------------------------------
# The Engine represents the core interface to the database.
# pool_pre_ping=True ensures dropped MySQL connections are handled safely.
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL queries in debug mode
    pool_pre_ping=True,  # Auto-check if DB connection is alive
    pool_recycle=280,  # Reconnect MySQL after 280 seconds (prevents timeout)
    future=True,  # Use SQLAlchemy 2.0 style engine
)


# ---------------------------------------------------------------------
# Session Factory
# ---------------------------------------------------------------------
# This creates independent DB sessions for each request.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,  # Keeps objects accessible after commit
)


# ---------------------------------------------------------------------
# Dependency Injection for FastAPI
# ---------------------------------------------------------------------
# Provides a clean session for every API request.
def get_db():
    """
    FastAPI dependency that provides a SQLAlchemy session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
