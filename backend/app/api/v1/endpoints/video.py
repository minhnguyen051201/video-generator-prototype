from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.video import Video
from app.schemas.video import VideoCreate
from app.services.video_service import generate_video_flow
from datetime import datetime

router = APIRouter(prefix="/videos", tags=["Videos"])


# -----------------------------
#  POST /videos/generate
# -----------------------------
@router.post("/generate", response_model=VideoCreate)
async def generate_video(
    user_id: int = Form(...),
    positive_prompt: str = Form(...),
    negative_prompt: str = Form(""),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    """
    1. Upload image to ComfyUI
    2. Inject workflow params
    3. Execute workflow
    4. Wait for final video
    5. Save metadata to DB
    """

    # 1. Run the actual generation logic
    try:
        result = await generate_video_flow(positive_prompt, negative_prompt, image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ComfyUI error: {str(e)}")

    if result["output_file"] is None:
        raise HTTPException(
            status_code=500, detail="Model did not return any video file."
        )

    # 2. Extract metadata
    metadata = result.get("metadata", {})

    # 3. Save in DB
    new_video = Video(
        user_id=user_id,
        # output
        file_name=result.get("output_file"),
        comfy_subfolder=metadata.get("subfolder"),
        # input
        input_image_url=result["input_image"],
        positive_prompt=positive_prompt,
        negative_prompt=negative_prompt,
        # metadata
        duration=metadata.get("duration"),
        resolution=metadata.get("resolution"),
        width=metadata.get("width"),
        height=metadata.get("height"),
        fps=metadata.get("fps"),
        codec=metadata.get("codec"),
        created_at=datetime.now(),
    )

    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    return new_video
