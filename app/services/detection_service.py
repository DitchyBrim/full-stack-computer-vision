from PIL import Image
from ultralytics import YOLO

import io
import base64

from ..schemas.detection import Detection

def base64_to_image(b64: str) -> Image.Image:
    raw = base64.b64decode(b64)
    return Image.open(io.BytesIO(raw)).convert("RGB")

def run_detection(image: Image.Image, model: YOLO, conf: float, iou: float, max_det: int) -> list[dict]:
    results = model.predict(source=image, conf=conf, iou=iou, max_det=max_det, verbose=False)[0]
    w, h = image.size
    return [
        {
            "label": results.names[int(box.cls[0].item())],
            "confidence": round(float(box.conf[0].item()), 3),
            "x1": round(box.xyxy[0][0].item() / w, 4),
            "y1": round(box.xyxy[0][1].item() / h, 4),
            "x2": round(box.xyxy[0][2].item() / w, 4),
            "y2": round(box.xyxy[0][3].item() / h, 4),
        }
        for box in results.boxes
    ]