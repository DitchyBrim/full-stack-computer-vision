import io
import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

from app.schemas.ocr import OCRResponse, OCRWithBoxesResponse
from app.services.ocr_service import ocr_service

router = APIRouter(prefix="/ocr", tags=["OCR"])
logger = logging.getLogger(__name__)

ALLOWED_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/bmp", "image/tiff"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ── shared helpers ────────────────────────────────────────────────────────────

def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


async def _read_validated(file: UploadFile) -> bytes:
    """Validate content type and file size, return raw bytes."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed: {', '.join(ALLOWED_TYPES)}",
        )
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )
    return contents


# ── endpoints ─────────────────────────────────────────────────────────────────

@router.post(
    "/extract",
    response_model=OCRResponse,
    summary="Extract text from an image",
    description="Extracts text from an uploaded image using OCR.",
)
async def extract_text(
    file: UploadFile = File(..., description="Image file to process"),
    language: str = Query("eng", description="OCR language code (eng, spa, fra, ...)"),
) -> OCRResponse:
    contents = await _read_validated(file)
    job_id = str(uuid.uuid4())
    try:
        text, confidence = ocr_service.extract_text(contents, language)
        logger.info("OCR job %s completed successfully", job_id)
        return OCRResponse(
            job_id=job_id,
            text=text,
            confidence=confidence,
            language=language,
            processed_at=_utcnow(),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("OCR job %s failed: %s", job_id, e)
        raise HTTPException(status_code=500, detail="OCR processing failed.")


@router.post(
    "/extract-with-boxes",
    response_model=OCRWithBoxesResponse,
    summary="Extract text with bounding boxes",
    description="Upload an image and extract text with per-word bounding box information.",
)
async def extract_text_with_boxes(
    file: UploadFile = File(..., description="Image file to process"),
    language: str = Query("eng", description="OCR language code"),
) -> OCRWithBoxesResponse:
    contents = await _read_validated(file)
    job_id = str(uuid.uuid4())
    try:
        result = ocr_service.extract_text_with_boxes(contents, language)
        logger.info("OCR with boxes job %s completed: %d words", job_id, result["total_words"])
        return OCRWithBoxesResponse(
            job_id=job_id,
            text=result["text"],
            words=result["words"],
            total_words=result["total_words"],
            language=language,
            processed_at=_utcnow(),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("OCR with boxes job %s failed: %s", job_id, e)
        raise HTTPException(status_code=500, detail="OCR processing failed. Please try again.")


@router.post(
    "/extract-annotated",
    summary="Extract text and return annotated image",
    description="Upload an image and get back a PNG with bounding boxes drawn around detected text.",
)
async def extract_with_annotated_image(
    file: UploadFile = File(..., description="Image file to process"),
    language: str = Query("eng", description="OCR language code"),
) -> StreamingResponse:
    contents = await _read_validated(file)
    job_id = str(uuid.uuid4())
    try:
        result = ocr_service.extract_text_with_boxes(contents, language)
        logger.info("Annotated image job %s completed", job_id)
        return StreamingResponse(
            io.BytesIO(result["annotated_image"]),
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename=annotated_{file.filename}",
                "X-Job-ID": job_id,
                "X-Total-Words": str(result["total_words"]),
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Annotated image job %s failed: %s", job_id, e)
        raise HTTPException(status_code=500, detail="Image processing failed. Please try again.")