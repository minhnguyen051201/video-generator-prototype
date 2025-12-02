"""
Defines REST endpoints for user-related operations.

Purpose:
- Handle HTTP requests and responses.
- Use Pydantic schemas for validation.
- Delegate business logic to the user_service layer.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserOut, UserLogin

from app.core import security
from app.core.config import get_settings

from app.schemas.auth import Token
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])

settings = get_settings()


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
# Authenticate a User
# ---------------------------------------------------------------------
@router.post("/login", response_model=Token)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user and return a bearer token."""

    user = user_service.authenticate_user(
        db, email=credentials.email, password=credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )

    return Token(access_token=access_token)


# ---------------------------------------------------------------------
# Get Current User from Bearer Token
# ---------------------------------------------------------------------
@router.get("/me", response_model=UserOut)
def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """Return the authenticated user by decoding the bearer token."""

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing.",
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header.",
        )

    try:
        payload = security.decode_access_token(token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    subject = payload.get("sub")

    try:
        user_id = int(subject) if subject is not None else None
    except (TypeError, ValueError):
        user_id = None

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )

    user = user_service.get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

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
