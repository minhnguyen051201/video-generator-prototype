import json
from typing import Optional
import uuid
import requests
import websockets
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse

router = APIRouter()

COMFY_URL = "http://host.docker.internal:8188"
COMFY_WS_URL = "ws://host.docker.internal:8188/ws"
COMFY_INPUT_DIR = "/Users/minhnguyen/Workspace/AI_Project/model_inference/ComfyUI/input"


@router.post("/generate")
async def generate_video(
    positive_prompt: str = Form(...),
    negative_prompt: str = Form(""),
    image: UploadFile = File(None),
):
    """
    1. Load the workflow JSON
    2. Inject dynamic prompt + image
    3. Trigger ComfyUI
    4. Wait for result via websocket
    5. Save final output locally into frontend/public
    6. Return public URL
    """

    # ---------------------------------------
    # 1. Load workflow
    # ---------------------------------------
    with open("/app/app/public/api_test_workflow.json", "r") as f:
        workflow = json.load(f)

    # ---------------------------------------
    # 2. Inject prompts
    # ---------------------------------------
    workflow["6"]["inputs"]["text"] = positive_prompt
    workflow["7"]["inputs"]["text"] = negative_prompt

    # ---------------------------------------
    # 3. Inject uploaded image (if provided)
    # ---------------------------------------
    comfy_files = [("image", (image.filename, image.file, image.content_type))]
    comfy_image_name = None

    if image is not None:
        comfy_files = {"image": (image.filename, image.file, image.content_type)}

        res = requests.post(
            "http://host.docker.internal:8188/upload/image", files=comfy_files
        )

        # Example response: {"name": "cowboy_walk.png"}
        comfy_image_name = res.json()["name"]

    # ---------------------------------------
    # 4. Send workflow to ComfyUI
    # ---------------------------------------

    # If image uploaded, assign it to node 1206
    if comfy_image_name:
        workflow["1206"]["inputs"]["image"] = comfy_image_name

    resp = requests.post(f"{COMFY_URL}/prompt", json={"prompt": workflow})

    # ---------------------------------------
    # 5. Wait for the final result
    # ---------------------------------------
    async with websockets.connect(COMFY_WS_URL) as ws:
        final_result = None
        while True:
            msg = await ws.recv()
            event = json.loads(msg)

            # "result" event = final output ready
            if event.get("type") == "result":
                final_result = event["data"]
                break

    # Check from this one
    # ---------------------------------------
    # 6. Extract output file info
    # ---------------------------------------
    output_info = final_result["output"]["images"][0]
    filename = output_info["filename"]
    subfolder = output_info["subfolder"]

    # ---------------------------------------
    # 7. Download file from ComfyUI API
    # ---------------------------------------
    file_bytes = requests.get(
        f"{COMFY_URL}/view?filename={filename}&subfolder={subfolder}&type=output"
    ).content

    # ---------------------------------------
    # 8. Save to Next.js public folder
    # ---------------------------------------
    saved_filename = f"{uuid.uuid4()}_{filename}"
    output_path = f"../../../public/{saved_filename}"

    with open(output_path, "wb") as f:
        f.write(file_bytes)

    # ---------------------------------------
    # 9. Return PUBLIC URL for frontend
    # ---------------------------------------
    public_url = f"/generated_videos/{saved_filename}"

    return JSONResponse({"video_url": public_url})
