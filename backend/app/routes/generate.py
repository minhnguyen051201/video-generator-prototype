from core.config import API_TOKEN
from fastapi import Header, HTTPException, APIRouter, Depends

router = APIRouter(prefix="/api", tags=["generate"])


def verify_token(authorization: str = Header(default="")):
    token = authorization.replace("Bearer ", "")
    if token != API_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/generate", dependencies=[Depends(verify_token)])
def generate_video():
    return {"message": "Video generation request received"}
