import io
import logging
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np
import pytesseract
from PIL import Image

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self, tesseract_path: Optional[str] = None):
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
            logger.info("Tesseract path set to: %s", tesseract_path)
        else:
            logger.info("Using default Tesseract path")


    # image helpers

    def bytes_to_image(self, image_bytes: bytes) -> np.ndarray:
        """Decode raw bytes into an OpenCV (BGR) image array."""
        try:
            logger.debug("Converting bytes to image, size: %d bytes", len(image_bytes))
            pil_image = Image.open(io.BytesIO(image_bytes))
            logger.debug("PIL image opened: mode=%s, size=%s", pil_image.mode, pil_image.size)

            img_array = np.array(pil_image)
            if len(img_array.shape) == 3:
                img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
                logger.debug("Image converted to BGR, shape: %s", img_array.shape)

            return img_array
        except Exception as e:
            logger.error("Failed to convert bytes to image: %s", e)
            raise ValueError(f"Invalid image data: {e}") from e

    def preprocess_image(self, img: np.ndarray) -> np.ndarray:
        """Convert to grayscale for improved OCR accuracy."""
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            logger.debug("Image converted to grayscale")
        else:
            gray = img
            logger.debug("Image already in grayscale")
        return gray

    # ── core OCR methods ──────────────────────────────────────────────────────

    def extract_text(self, image_bytes: bytes, language: str = "eng") -> Tuple[str, float]:
        """
        Extract plain text from image bytes.

        Returns:
            (extracted_text, avg_confidence_percent)
        """
        try:
            img = self.bytes_to_image(image_bytes)
            gray = self.preprocess_image(img)

            logger.debug("Running Tesseract OCR...")
            text = pytesseract.image_to_string(gray, lang=language)

            data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
            confidences = [int(c) for c in data["conf"] if c != "-1"]

            if confidences:
                avg_confidence = sum(confidences) / len(confidences)
                logger.info(
                    "OCR completed — confidence: %.2f%%, text length: %d, words: %d",
                    avg_confidence, len(text), len(confidences),
                )
            else:
                avg_confidence = 0.0
                logger.warning("No text detected in image")

            if avg_confidence < 50:
                logger.warning(
                    "Low OCR confidence: %.2f%%. Consider improving image quality.", avg_confidence
                )

            return text.strip(), round(avg_confidence, 2)

        except pytesseract.TesseractNotFoundError as e:
            logger.error("Tesseract executable not found", exc_info=True)
            raise ValueError("Tesseract OCR is not properly installed or configured") from e
        except Exception as e:
            logger.error("OCR extraction failed: %s", e, exc_info=True)
            raise ValueError(f"Failed to process image: {e}") from e

    def extract_text_with_boxes(
        self, image_bytes: bytes, language: str = "eng"
    ) -> Dict:
        """
        Extract text with per-word bounding box information.

        Returns dict with keys: text, words, total_words, annotated_image (bytes).
        """
        try:
            img = self.bytes_to_image(image_bytes)
            gray = self.preprocess_image(img)

            logger.debug("Running Tesseract OCR with bounding box detection...")
            text = pytesseract.image_to_string(gray, lang=language)
            boxes = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)

            detected_words: List[Dict] = [
                {
                    "text": boxes["text"][i],
                    "confidence": int(boxes["conf"][i]),
                    "bounding_box": {
                        "left": boxes["left"][i],
                        "top": boxes["top"][i],
                        "width": boxes["width"][i],
                        "height": boxes["height"][i],
                    },
                }
                for i in range(len(boxes["text"]))
                if boxes["text"][i].strip()
            ]
            logger.info("Bounding boxes extracted: %d words detected", len(detected_words))

            annotated_img = self._draw_boxes(img.copy(), boxes)
            is_success, buffer = cv2.imencode(".png", annotated_img)
            if not is_success:
                raise ValueError("Failed to encode annotated image")

            annotated_bytes = buffer.tobytes()
            logger.info(
                "OCR with boxes completed — %d words, text length: %d",
                len(detected_words), len(text),
            )

            return {
                "text": text.strip(),
                "words": detected_words,
                "total_words": len(detected_words),
                "annotated_image": annotated_bytes,
            }

        except pytesseract.TesseractNotFoundError as e:
            logger.error("Tesseract executable not found", exc_info=True)
            raise ValueError("Tesseract OCR is not properly installed or configured") from e
        except Exception as e:
            logger.error("OCR with boxes failed: %s", e, exc_info=True)
            raise ValueError(f"Failed to process image: {e}") from e

    # ── private helpers ───────────────────────────────────────────────────────

    def _draw_boxes(self, img: np.ndarray, boxes: Dict) -> np.ndarray:
        """Overlay green bounding boxes and labels on the image."""
        drawn = 0
        for i in range(len(boxes["text"])):
            if not boxes["text"][i].strip():
                continue
            x, y = boxes["left"][i], boxes["top"][i]
            w, h = boxes["width"][i], boxes["height"][i]
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(
                img, boxes["text"][i],
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2,
            )
            drawn += 1
        logger.debug("Drew %d bounding boxes on image", drawn)
        return img
    

from app.core.config import settings

ocr_service = OCRService(tesseract_path=settings.get_tesseract_path())