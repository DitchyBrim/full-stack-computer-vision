from typing import Optional

from pydantic_settings import BaseSettings
import shutil, platform, os
from dotenv import load_dotenv

# env variables
load_dotenv()

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")
SECREET_KEY = os.getenv("SECRET_KEY")
class Settings(BaseSettings):

    # Database settings
    POSTGRES_USER: str = POSTGRES_USER
    POSTGRES_PASSWORD: str = POSTGRES_PASSWORD
    POSTGRES_DB: str = POSTGRES_DB
    SECRET_KEY: str = SECREET_KEY
    DATABASE_URL: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:5431/{POSTGRES_DB}"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OD Settings - Platform independent
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
        extra = "ignore"

    # OCR Settings - Platform independent
    TESSERACT_PATH: Optional[str] = None
    DEFAULT_OCR_LANGUAGE: str = "eng"
    def get_cors_origins(self) -> list:
        """
        Parse CORS origins from string to list
        
        Returns:
            List of allowed CORS origins
        """
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    def get_tesseract_path(self) -> str:
        """
        Get Tesseract path based on environment and platform
        
        Returns:
            Path to Tesseract executable
        """
        # If explicitly set in environment, use that
        if self.TESSERACT_PATH:
            return self.TESSERACT_PATH
        
        # Try to find tesseract in PATH
        tesseract_cmd = shutil.which("tesseract")
        if tesseract_cmd:
            return tesseract_cmd
        
        # Platform-specific default paths
        system = platform.system()
        
        if system == "Windows":
            # Common Windows installation paths
            possible_paths = [
                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    return path
        
        elif system == "Linux":
            # Common Linux paths
            possible_paths = [
                "/usr/bin/tesseract",
                "/usr/local/bin/tesseract",
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    return path
        
        elif system == "Darwin":  # macOS
            # Common macOS paths
            possible_paths = [
                "/usr/local/bin/tesseract",
                "/opt/homebrew/bin/tesseract",
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    return path
        
        # If nothing found, return "tesseract" and let system find it
        return "tesseract"


settings = Settings()