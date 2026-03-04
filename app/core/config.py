from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    default_model: str = "yolov8n"
    available_models: dict[str, str] = {
        "yolov8n": "YOLOv8n (fastest)",
        "yolov8s": "YOLOv8s",
        "yolov8m": "YOLOv8m",
        "yolov8l": "YOLOv8l",
        "yolov8x": "YOLOv8x (most accurate)",
    }
    default_conf: float = 0.5
    default_iou: float = 0.45
    default_max_det: int = 100

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()