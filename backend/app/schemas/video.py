from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ---------- Base Schema ----------
class VideoBase(BaseModel):
    # Input
    input_image: Optional[str] = Field(
        None, description="URL or name of input image uploaded to ComfyUI"
    )
    positive_prompt: Optional[str] = Field(
        None, description="Main text prompt provided for video generation"
    )
    negative_prompt: Optional[str] = Field(
        None, description="Negative prompt for removing unwanted elements"
    )

    # Metadata
    duration: Optional[float] = Field(None, description="Video duration in seconds")
    resolution: Optional[str] = Field(
        None, description="Video resolution (e.g., '720x1280')"
    )
    width: Optional[int] = Field(None, description="Video width in px")
    height: Optional[int] = Field(None, description="Video height in px")
    fps: Optional[float] = Field(None, description="Frame rate")

    # Output
    localpath: Optional[str] = Field(None, description="Local path")
    filename: Optional[str] = Field(None, description="Output video filename")
    format: Optional[str] = Field(None, description="format of the video")
    source_video: Optional[str] = Field(None, description="Video source")

    created_at: datetime


# ---------- Create Schema ----------
class VideoCreate(VideoBase):
    id: int = Field(..., description="Identifier")
    user_id: int = Field(..., description="Reference to the owner user ID")

    model_config = {"from_attributes": True}


# ---------- Read Schema ----------
class VideoRead(VideoBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}
