import base64
import io
import logging

import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ── load model once at startup ────────────────────────────
DEFAULT_MODEL = "yolov8n"
logger.info("Loading YOLO model: %s", DEFAULT_MODEL)
model_cache: dict[str, YOLO] = {
    DEFAULT_MODEL: YOLO(f"{DEFAULT_MODEL}.pt")
}
logger.info("Model loaded successfully")

app = FastAPI()

# allow the Vite dev server to talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── helpers ───────────────────────────────────────────────
def base64_to_image(b64: str) -> Image.Image:
    return Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")


def run_detection(image: Image.Image, mdl, conf, iou, max_det) -> list[dict]:
    results = mdl.predict(source=image, conf=conf, iou=iou, max_det=max_det, verbose=False)[0]
    w, h = image.size
    detections: list[dict] = []

    for box in results.boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        detections.append(
            {
                "label": results.names[int(box.cls[0].item())],
                "confidence": round(float(box.conf[0].item()), 3),
                "x1": round(x1 / w, 4),
                "y1": round(y1 / h, 4),
                "x2": round(x2 / w, 4),
                "y2": round(y2 / h, 4),
            }
        )

    return detections


# ── sanity-check endpoint — hit this first to confirm the server is alive ──
@app.get("/health")
async def health():
    return {"status": "ok"}

AVAILABLE_MODELS = {
    "yolov8n": "YOLOv8n (fastest)",
    "yolov8s": "YOLOv8s",
    "yolov8m": "YOLOv8m",
    "yolov8l": "YOLOv8l",
    "yolov8x": "YOLOv8x (most accurate)",
}

@app.get("/models")
async def get_models():
    return {
        "models": [
            {"value": k, "label": v}
            for k, v in AVAILABLE_MODELS.items()
        ]
    }

# ── WebSocket endpoint ────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket client connected")
    frame_count = 0
    # per-connection settings with defaults
    current_conf = 0.5
    current_iou = 0.45
    current_max_det = 100
    current_model_name = DEFAULT_MODEL
    current_model = model_cache[DEFAULT_MODEL]  # the globally loaded model
    try:
        while True:
            data: str = await websocket.receive_text()
            # check if settings message
            try:
                msg = json.loads(data)
                if msg.get("type") == "settings":
                    current_conf = float(msg.get("confidence", current_conf))
                    current_iou = float(msg.get("iou", current_iou))
                    current_max_det = int(msg.get("maxDetections", current_max_det))

                    new_model_name = msg.get("model", current_model_name)
                    if new_model_name != current_model_name:
                        if new_model_name not in model_cache:
                            logger.info("Loading new model: %s", new_model_name)
                            model_cache[new_model_name] = YOLO(f"{new_model_name}.pt")
                        else:
                            logger.info("Using cached model: %s", new_model_name)
                        current_model_name = new_model_name
                        current_model = model_cache[current_model_name]
                    logger.info("Settings updated: conf=%.2f iou=%.2f max_det=%d model=%s",
                        current_conf, current_iou, current_max_det, current_model_name)
                    continue  # don't try to run detection on this message
            except (json.JSONDecodeError, ValueError) as e:
                pass
            frame_count += 1

            if frame_count % 30 == 0:
                logger.info("Received frame #%d (len=%d chars)", frame_count, len(data))

            image = base64_to_image(data)
            detections = run_detection(image, current_model, current_conf, current_iou, current_max_det)

            if detections:
                logger.info(
                    "Frame #%d — %d detections: %s",
                    frame_count,
                    len(detections),
                    [d["label"] for d in detections],
                )

            await websocket.send_json({"detections": detections})

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected after %d frames", frame_count)


# ── run ───────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    # use localhost, not 127.0.0.1 — some browsers treat them differently
    uvicorn.run(app, host="localhost", port=8000, log_level="info")