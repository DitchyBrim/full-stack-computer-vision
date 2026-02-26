import base64
import io
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ── load model once at startup ────────────────────────────
MODEL_PATH = "yolov8n.pt"
logger.info("Loading YOLO model: %s", MODEL_PATH)
model = YOLO(MODEL_PATH)
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


def run_detection(image: Image.Image) -> list[dict]:
    results = model.predict(source=image, conf=0.25, verbose=False)[0]

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


# ── WebSocket endpoint ────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket client connected")
    frame_count = 0

    try:
        while True:
            data: str = await websocket.receive_text()
            frame_count += 1

            if frame_count % 30 == 0:
                logger.info("Received frame #%d (len=%d chars)", frame_count, len(data))

            image = base64_to_image(data)
            detections = run_detection(image)

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