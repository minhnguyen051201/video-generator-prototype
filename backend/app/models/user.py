"""
Defines the User ORM model.

Purpose:
- Represent registered users in the database.
- Provide authentication data (email, hashed_password).
- Track user creation and updates.
"""

from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class User(Base):
    """
    SQLAlchemy ORM model for the `users` table.

    Each instance of this class corresponds to a row in the table.
    """

    __tablename__ = "users"

    # ------------------------------------------------------------------
    # Columns
    # ------------------------------------------------------------------
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=True)

    # Audit fields (auto-managed)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Video reference
    videos = relationship("Video", back_populates="user", cascade="all, delete-orphan")

    # ------------------------------------------------------------------
    # Representation helper
    # ------------------------------------------------------------------
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', username='{self.username}')>"
