"""Pydantic schemas related to authentication tokens."""

from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    """Response returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Represents the data stored inside issued JWT tokens."""

    sub: Optional[str] = None
    exp: Optional[int] = None
