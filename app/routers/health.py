from fastapi import APIRouter

from app.models.yolo_manager import model_manager

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health():
    """Liveness check — confirms the server and default model are ready."""
    return {
        "status": "ok",
        "loaded_models": model_manager.loaded_models,
    }