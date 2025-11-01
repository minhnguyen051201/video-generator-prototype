from sqlalchemy.orm import declarative_base

# ---------------------------------------------------------------------
# Base Class for ORM Models
# ---------------------------------------------------------------------
# All models should inherit from this Base.

Base = declarative_base()

# These imports are required for SQLAlchemy metadata discovery
# Do not remove, even if marked as unused by IDE
from app.models.user import User
