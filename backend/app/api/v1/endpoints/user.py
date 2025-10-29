"""
Defines REST endpoints for user-related operations.

Purpose:
- Handle HTTP requests and responses.
- Use Pydantic schemas for validation.
- Delegate business logic to the user_service layer.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserOut
from app.services import user_service


router = APIRouter(prefix="/users", tags=["Users"])


# ---------------------------------------------------------------------
# Register a New User
# ---------------------------------------------------------------------
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    - Validates email & password.
    - Checks for duplicate email.
    - Creates a new user with hashed password.
    """
    existing_user = user_service.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered.",
        )

    user = user_service.create_user(db, user_data)
    return user


# ---------------------------------------------------------------------
# Get User by ID
# ---------------------------------------------------------------------
@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific user by ID.
    """
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found.",
        )
    return user
