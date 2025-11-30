import subprocess
import json
import requests
import tempfile
import os
import websockets

from fastapi import UploadFile

COMFY_URL = "http://host.docker.internal:8188"
COMFY_WS_URL = "ws://host.docker.internal:8188/ws"


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
async def wait_for_comfy_result(prompt_id: str):
    async with websockets.connect(COMFY_WS_URL) as ws:
        while True:
            msg = await ws.recv()
            event = json.loads(msg)

            # FINAL RESULT
            if (
                event.get("type") == "result"
                and event["data"]["prompt_id"] == prompt_id
            ):
                return event["data"]


# -----------------------------------------------------------
# Extract metadata from ComfyUI output video
# -----------------------------------------------------------
def extract_metadata_from_comfyui(filename: str):
    # Download video bytes
    video_bytes = requests.get(
        f"{COMFY_URL}/view?filename={filename}&type=output"
    ).content

    if not video_bytes:
        return None

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(video_bytes)
        temp_path = tmp.name

    # ffprobe
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height,avg_frame_rate,duration,codec_name",
        "-of",
        "json",
        temp_path,
    ]

    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        info = json.loads(proc.stdout)
        stream = info["streams"][0]

        # convert fps
        fps_str = stream.get("avg_frame_rate", "0/1")
        num, den = fps_str.split("/")
        fps = round(float(num) / float(den), 2) if den != "0" else None

        metadata = {
            "width": stream.get("width"),
            "height": stream.get("height"),
            "resolution": f"{stream.get('width')}x{stream.get('height')}",
            "duration": float(stream.get("duration", 0)),
            "fps": fps,
            "codec": stream.get("codec_name"),
        }

    finally:
        os.remove(temp_path)

    return metadata


# -----------------------------------------------------------
# Main generation flow
# -----------------------------------------------------------
async def generate_video_flow(
    positive_prompt: str, negative_prompt: str, image: UploadFile
):
    # 1. Upload image first
    image_name = upload_image_to_comfy(image) if image else None

    # 2. Load workflow
    workflow = load_workflow("/app/app/public/api_test_workflow.json")

    # 3. Inject params
    workflow = inject_workflow_params(
        workflow,
        negative_prompt=negative_prompt,
        positive_prompt=positive_prompt,
        image_name=image_name,
    )

    # 4. Submit workflow
    prompt_id = submit_workflow(workflow)

    # 5. Wait for completion
    result = await wait_for_comfy_result(prompt_id)

    # 6. Extract true video output (ComfyUI uses "videos")
    output_videos = result.get("output", {}).get("videos", [])

    if not output_videos:
        raise Exception("No video returned by ComfyUI")

    final_video = output_videos[0]  # dict: {filename, subfolder, type}
    filename = final_video["filename"]

    # 7. Extract metadata from ComfyUI file
    video_metadata = extract_metadata_from_comfyui(filename)
    print(video_metadata)

    return {
        "prompt_id": prompt_id,
        "input_image": image_name,
        "output_file": filename,
        "subfolder": final_video.get("subfolder", ""),
        "metadata": video_metadata,
    }

