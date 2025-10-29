"""
Defines Pydantic models (schemas) for User-related requests and responses.

Purpose:
- Validate input data coming from API requests (e.g., signup, login).
- Control what data is returned in API responses (e.g., hide password).
- Provide a clean contract between frontend and backend.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


# ---------------------------------------------------------------------
# Base Schema (Shared Attributes)
# ---------------------------------------------------------------------
class UserBase(BaseModel):
    """Common attributes shared across all user operations."""

    email: EmailStr
    username: str


# ---------------------------------------------------------------------
# Schema for User Creation (Request)
# ---------------------------------------------------------------------
class UserCreate(UserBase):
    """Used when a user registers an account."""

    password: str = Field(..., min_length=6, max_length=50)


# ---------------------------------------------------------------------
# Schema for Reading User Data (Response)
# ---------------------------------------------------------------------
class UserOut(UserBase):
    """Used when returning user information (response model)."""

    id: int
    role: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = (
            True  # enable ORM-to-Pydantic conversion (formerly orm_mode=True)
        )
