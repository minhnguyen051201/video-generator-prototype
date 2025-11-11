from sqlalchemy.orm import declarative_base

# ---------------------------------------------------------------------
# Base Class for ORM Models
# ---------------------------------------------------------------------
# All models should inherit from this Base.

Base = declarative_base()


# These imports are required for SQLAlchemy metadata discovery
def init_models():
    from app.models.user import User
