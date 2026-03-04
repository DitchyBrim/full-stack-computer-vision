from pydantic import BaseModel, Field

class Detection(BaseModel):
    id: str
    class_name: str
    confidence: float
    x1: int
    y1: int
    x2: int
    y2: int

class DetectionResponse(BaseModel):
    detections: list[Detection]

class SettingsMessage(BaseModel):
    type: str
    confidence: float = Field(0.5, ge=0.0, le=1.0)
    iou: float = Field(0.45, ge=0.0, le=1.0)
    maxDetections: int = Field(100, ge=1, le=300)
    model: str = "yolov8n"
class InferRequest(BaseModel):
    image_b64: str
    settings: SettingsMessage