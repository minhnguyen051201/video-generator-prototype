from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import desc


# ---------- Base Schema ----------
class VideoBase(BaseModel):
    # input
    input_image_url: Optional[str] = Field(None, description="input iomage")
    positive_prompt: Optional[str] = Field(
        None, description="Main text prompt provided for video generation"
    )
    negative_prompt: Optional[str] = Field(
        None, description="Negative prompt for removing unwanted elements"
    )
    # metadata
    duration: Optional[str] = Field(
        None, description="Video duration (e.g., '4s', '8s')"
    )
    resolution: Optional[str] = Field(
        None, description="Output resolution (e.g., '720x1280')"
    )
    width: str = Field(..., description="width of the video")
    height: str = Field(..., description="height of the video")
    fps: str = Field(..., description="fps of the video")
    codec: str = Field(..., description="codec of the video")
    # output
    comfy_subfolder: Optional[str] = Field(None, description="ComfyUI output subfolder")
    output_filename: Optional[str] = Field(None, description="Output filename")

    created_at: datetime


# ---------- Create Schema ----------
class VideoCreate(VideoBase):
    user_id: int = Field(..., description="Reference to owner user ID")


# ---------- Read Schema ----------
class VideoRead(VideoBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
