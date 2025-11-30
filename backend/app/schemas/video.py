from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ---------- Base Schema ----------
class VideoBase(BaseModel):
    input_image_url: Optional[str] = Field(
        None, description="URL of the input image uploaded to ComfyUI"
    )
    positive_prompt: Optional[str] = Field(
        None, description="Main text prompt provided for video generation"
    )
    negative_prompt: Optional[str] = Field(
        None, description="Negative prompt for removing unwanted elements"
    )
    video_model_version: Optional[str] = Field(
        None, description="Version of the model used for generation"
    )
    duration: Optional[str] = Field(
        None, description="Video duration (e.g., '4s', '8s')"
    )
    resolution: Optional[str] = Field(
        None, description="Output resolution (e.g., '720x1280')"
    )
    filename: str = Field(
        ..., description="Name of the generated video file stored in disk"
    )
    file_url: str = Field(
        ..., description="Public URL used by frontend to fetch generated video"
    )
    comfy_subfolder: Optional[str] = Field(None, description="ComfyUI output subfolder")
    comfy_type: Optional[str] = Field(
        None, description="ComfyUI output type (e.g., 'video')"
    )


# ---------- Create Schema ----------
class VideoCreate(VideoBase):
    user_id: int = Field(..., description="Reference to owner user ID")


# ---------- Update Schema ----------
class VideoUpdate(BaseModel):
    prompt: Optional[str] = None
    negative_prompt: Optional[str] = None
    filename: Optional[str] = None
    file_url: Optional[str] = None
    duration: Optional[str] = None
    resolution: Optional[str] = None
    comfy_subfolder: Optional[str] = None
    comfy_type: Optional[str] = None


# ---------- Read Schema ----------
class VideoRead(VideoBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
