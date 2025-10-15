from sqlalchemy.orm import declarative_base

Base = declarative_base()

# These imports are required for SQLAlchemy metadata discovery
# Do not remove, even if marked as unused by IDE
from app.models.user import User
