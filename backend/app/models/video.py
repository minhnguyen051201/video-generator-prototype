from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # input data
    input_image_url = Column(String(255), nullable=True)
    positive_prompt = Column(Text, nullable=True)
    negative_prompt = Column(Text, nullable=True)

    # metadata
    duration = Column(String(50), nullable=True)
    resolution = Column(String(50), nullable=True)
    width = Column(String(255), nullable=True)
    height = Column(String(255), nullable=True)
    fps = Column(String(255), nullable=True)
    codec = Column(String(255), nullable=True)

    # generated output
    filename = Column(String(255), nullable=False)
    comfy_subfolder = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.now)

    # relationship
    user = relationship("User", back_populates="videos")
