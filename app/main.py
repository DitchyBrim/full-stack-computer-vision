from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.logging import setup_logging
from app.routers import detection, health, models, ocr

setup_logging()

app = FastAPI(
    title="YOLO Detection API",
    description="Real-time object detection via WebSocket using YOLOv8.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(models.router)
app.include_router(detection.router)
app.include_router(ocr.router)


# ── run ───────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    # use localhost, not 127.0.0.1 — some browsers treat them differently
    uvicorn.run(app, host="localhost", port=8000, log_level="info")