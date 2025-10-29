"""
Contains business logic for user management.

Purpose:
- Handle user creation, retrieval, and authentication.
- Abstract database logic away from API routes.
- Keep routes clean and reusable.
"""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from passlib.context import CryptContext


# ---------------------------------------------------------------------
# Password Hashing Setup
# ---------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------------------------------------------------------------
# Utility functions
# ---------------------------------------------------------------------
def get_password_hash(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hashed version."""
    return pwd_context.verify(plain_password, hashed_password)


# ---------------------------------------------------------------------
# CRUD Functions
# ---------------------------------------------------------------------
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve a user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Retrieve a user by their ID."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Create a new user in the database.

    Steps:
    1. Hash the user's password.
    2. Create a User instance.
    3. Commit to database.
    4. Return the created user.
    """
    hashed_pw = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email, username=user_data.username, hashed_password=hashed_pw
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
