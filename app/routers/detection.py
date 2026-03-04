import io

from fastapi import APIRouter, File, WebSocket, WebSocketDisconnect, Form, UploadFile
from PIL import Image

from app.core.config import settings
from app.core.logging import get_logger
from app.models.yolo_manager import model_manager
from app.schemas.detection import SettingsMessage, InferRequest
from app.services.detection_service import base64_to_image, run_detection

import json, logging

router = APIRouter(tags=["Detection"])
logger = get_logger(__name__)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket client connected")

    # per connection state initialized from global defaults
    conf = settings.default_conf
    iou = settings.default_iou
    max_det = settings.default_max_det
    model_name = settings.default_model
    model = model_manager.get(model_name)
    frame_count = 0
    try:
        while True:
            data: str = await websocket.receive_text()
            # settings update
            try:
                msg = json.loads(data)
                if msg.get("type") == "settings":
                    conf = float(msg.get("confidence", conf))
                    iou = float(msg.get("iou", iou))
                    max_det = int(msg.get("maxDetections", max_det))
                    new_model = msg.get("model", model_name)
                    if new_model != model_name:
                        model_name = new_model
                        model = model_manager.get(model_name)
                    logger.info("Settings updated: conf=%.2f iou=%.2f max_det=%d model=%s",
                        conf, iou, max_det, model_name)
                    continue
            except (json.JSONDecodeError, ValueError):
                pass  # not a settings message, continue to try detection

            # inference frame
            frame_count += 1
            if frame_count % 30 == 0:
                logger.info("Received frame #%d (len=%d chars)", frame_count, len(data))

            image = base64_to_image(data)
            detections = run_detection(image, model, conf, iou, max_det)
            if detections:
                logger.info(
                    "Frame #%d — %d detections: %s",
                    frame_count,
                    len(detections),
                    [d["label"] for d in detections],
                )
            await websocket.send_json({"detections": detections})
    except WebSocketDisconnect:
        logger.info("Client disconnected after %d frames", frame_count)

@router.post('/infer/image')
async def infer_image(
    file: UploadFile = File(...),
    confidence: float = Form(0.5),
    iou: float = Form(0.45),
    max_det: int = Form(100),
    model: str = Form("yolov8n"),
):
    """HTTP endpoint for single image inference."""
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    mdl = model_manager.get(model)
    detections = run_detection(image, mdl, confidence, iou, max_det)

    return {"detections": [d for d in detections]}