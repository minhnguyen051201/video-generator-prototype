from fastapi import APIRouter

# from app.schemas.user import UserOut
# from app.services.user_service import get_user
from app.db.session import test_db_connection, engine
from app.db.base import Base

router = APIRouter()


# @router.get("/{user_id}", response_model=UserOut)
# def user(user_id: int):
#     return get_user(user_id)
#


@router.get("/health")
def home():
    Base.metadata.create_all(bind=engine)
    print("All tables created!")
    test_db_connection()
