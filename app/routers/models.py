from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("")
async def get_models():
    """Return the list of available YOLO models."""
    return {
        "models": [
            {"value": k, "label": v}
            for k, v in settings.available_models.items()
        ]
    }