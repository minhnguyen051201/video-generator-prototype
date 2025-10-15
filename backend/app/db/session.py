import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
DATABASE_URL = os.getenv("mysql_database_url", "none")

if not DATABASE_URL or DATABASE_URL.lower() == "none":
    raise ValueError("DATABASE_URL is missing or invalid in your .env file")


# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


def test_db_connection():
    try:
        with engine.connect() as connection:
            res = connection.execute(text("SELECT 1"))
            print("Databse connected successfully!")
            print(f"Test query result: {res.scalar()}")
    except Exception as e:
        print("Databse connection failed")
        print(e)
