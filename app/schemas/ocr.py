from pydantic import BaseModel
from typing import List, Optional

class BoundingBox(BaseModel):
    left: int
    top: int
    width: int
    height: int

class DetectedWord(BaseModel):
    text: str
    confidence: float
    bounding_box: BoundingBox

class OCRResponse(BaseModel):
    job_id:str
    text: str
    confidence: float
    language: Optional[str]
    processed_at: str

class OCRWithBoxesResponse(BaseModel):
    job_id: str
    text: str
    words: List[DetectedWord]
    total_words: int
    language: str
    processed_at: str