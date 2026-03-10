from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.logging import setup_logging
from app.routers import detection, health, models, ocr

from app.db.base import Base
from app.db.session import engine
from app.routers import auth, users, images

# ── Create tables if they don't exist ─────────────────────────────────────
# This is fine for development. Switch to Alembic migrations for production.
# Create database tables
Base.metadata.create_all(bind=engine)

setup_logging()

app = FastAPI(
    title="YOLO Detection API",
    description="Real-time object detection via WebSocket using YOLOv8. with JWT + API Key",
    version="1.0.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(models.router)
app.include_router(detection.router)
app.include_router(ocr.router)
# auth
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(images.router)


# ── run ───────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    # use localhost, not 127.0.0.1 — some browsers treat them differently
    uvicorn.run(app, host="localhost", port=8000, log_level="info")