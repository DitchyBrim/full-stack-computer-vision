from ultralytics import YOLO

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

class ModelManager:
    def __init__(self):
        self._cache: dict[str, YOLO] = {}
        self.load(settings.default_model)

    def load(self, name: str) -> YOLO:
        """Load a model if not already cached, then return it."""
        if name not in self._cache:
            if name not in settings.available_models:
                raise ValueError(f"Unknown model '{name}'. Available: {list(settings.available_models)}")
            logger.info("Loading model: %s", name)
            self._cache[name] = YOLO(f"{name}.pt")
            logger.info("Model loaded: %s", name)
        else:
            logger.debug("Using cached model: %s", name)
        return self._cache[name]

    def get(self, name: str) -> YOLO:
        return self.load(name)

    @property
    def loaded_models(self) -> list[str]:
        return list(self._cache.keys())
    
model_manager = ModelManager()  # singleton