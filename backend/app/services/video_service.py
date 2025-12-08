import cv2
import json
import requests
import tempfile
import os
import asyncio
import aiohttp

from fastapi import UploadFile

COMFY_URL = "http://host.docker.internal:8188"


# -----------------------------------------------------------
# Load workflow JSON
# -----------------------------------------------------------
def load_workflow(path: str):
    with open(path, "r") as f:
        return json.load(f)


# -----------------------------------------------------------
# Upload image to ComfyUI
# -----------------------------------------------------------
def upload_image_to_comfy(image: UploadFile):
    if not image:
        return None

    img_bytes = image.file.read()

    files = {
        "image": (
            image.filename,
            img_bytes,
            image.content_type or "image/png",
        )
    }

    res = requests.post(f"{COMFY_URL}/upload/image", files=files)
    return res.json()["name"]


# -----------------------------------------------------------
# Inject dynamic params (image_name is a STRING)
# -----------------------------------------------------------
def inject_workflow_params(
    workflow, negative_prompt, positive_prompt, image_name: str | None
):
    workflow["6"]["inputs"]["text"] = positive_prompt
    workflow["7"]["inputs"]["text"] = negative_prompt

    # image_name comes from upload_image_to_comfy()
    if image_name:
        workflow["1206"]["inputs"]["image"] = image_name

    return workflow


# -----------------------------------------------------------
# Send workflow to ComfyUI
# -----------------------------------------------------------
def submit_workflow(workflow: dict):
    payload = {"prompt": workflow}
    res = requests.post(f"{COMFY_URL}/prompt", json=payload)
    res.raise_for_status()

    return res.json()["prompt_id"]


# -----------------------------------------------------------
# Wait for ComfyUI websocket result
# -----------------------------------------------------------


async def wait_for_comfy_result(prompt_id: str, timeout: int = 900):
    """
    Poll ComfyUI /history/{prompt_id} until output is ready.
    Works in Docker + ComfyUI Desktop.
    Replaces WebSocket (which cannot cross macOS <-> Docker boundary).
    """

    start = asyncio.get_event_loop().time()

    async with aiohttp.ClientSession() as session:
        while True:
            # timeout guard
            elapsed = asyncio.get_event_loop().time() - start
            if elapsed > timeout:
                raise RuntimeError("Timed out waiting for ComfyUI result")

            try:
                async with session.get(f"{COMFY_URL}/history/{prompt_id}") as resp:
                    if resp.status == 200:
                        data = await resp.json()

                        # Check if history entry exists AND output is ready
                        if (
                            prompt_id in data
                            and "outputs" in data[prompt_id]
                            and data[prompt_id]["outputs"]
                        ):
                            return data[prompt_id]["outputs"]

            except Exception as e:
                print(f"[wait_for_comfy_result] Error: {e}")

            # poll every 2 seconds
            await asyncio.sleep(2)


# -----------------------------------------------------------
# Extract metadata from ComfyUI output video
# -----------------------------------------------------------


def extract_video_metadata(filename: str | None):
    """
    1. Download video from ComfyUI output endpoint
    2. Save temporarily
    3. Extract duration, width, height, fps
    """
    try:
        # --- 1. Download video bytes from ComfyUI ---
        url = f"http://host.docker.internal:8188/view?filename={filename}&type=output"

        resp = requests.get(url)

        if resp.status_code != 200:
            raise Exception(f"Failed to download video: {resp.status_code}")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            tmp.write(resp.content)
            tmp_path = tmp.name

        # --- 2. Extract metadata using OpenCV ---
        cap = cv2.VideoCapture(tmp_path)

        if not cap.isOpened():
            raise Exception("OpenCV failed to open video")

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)

        duration = frames / fps if (fps > 0 and frames > 0) else None

        metadata = {
            "width": width,
            "height": height,
            "fps": fps,
            "duration": duration,
            "resolution": f"{width}x{height}",
        }

        return metadata

    except Exception as e:
        raise Exception(f"OpenCV metadata extraction failed: {str(e)}")

    finally:
        if "tmp_path" in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)


# extract video output
def extract_video_output(result_json):
    # 1. Get the first key ("1336")
    key = list(result_json.keys())[0]

    # 2. Access the gifs list
    gifs = result_json[key].get("gifs", [])

    if not gifs:
        raise ValueError("No GIF/MP4 outputs found in ComfyUI response")

    file_info = gifs[0]

    # 3. Extract fields
    filename = file_info.get("filename")
    fullpath = file_info.get("fullpath")
    format = file_info.get("format")

    return {
        "filename": filename,
        "localpath": fullpath,
        "format": format,
    }


# -----------------------------------------------------------
# Main generation flow
# -----------------------------------------------------------
async def generate_video_flow(positive_prompt, negative_prompt, image):
    try:
        # Upload input image
        input_image = upload_image_to_comfy(image) if image else None

        # Load workflow file
        workflow = load_workflow("/app/app/public/api_test_workflow.json")

        # Inject prompts + image
        workflow = inject_workflow_params(
            workflow,
            positive_prompt=positive_prompt,
            negative_prompt=negative_prompt,
            image_name=input_image,
        )

        # Trigger comfyUI
        prompt_id = submit_workflow(workflow)

        # Wait for final output
        result = await wait_for_comfy_result(prompt_id)

        result_json = extract_video_output(result_json=result)

        filename = result_json.get("filename")
        localpath = result_json.get("localpath")
        format = result_json.get("format")
        source_video = f"http://localhost:8188/view?filename={filename}"

        # Extract ffprobe metadata
        metadata = extract_video_metadata(filename)

        return {
            "prompt_id": prompt_id,
            "input_image": input_image,
            "filename": filename,
            "format": format,
            "localpath": localpath,
            "metadata": metadata,
            "source_video": source_video,
        }

    except Exception as e:
        raise RuntimeError(f"Video generation flow failed: {str(e)}")
