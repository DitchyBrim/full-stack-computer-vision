# full-stack-computer-vision

## Features
✦ Provides a full-stack solution for real-time object detection, including a web-based UI with dynamic settings.
✦ Integrates configurable YOLOv8 models (nano, small, medium, large, extra-large) for efficient AI-powered inference on the backend.
✦ Offers an HTTP `/health` endpoint for quick server status checks and a `/models` endpoint to list available YOLO models.
✦ Processes base64-encoded image frames received over WebSocket from various sources.
✦ Allows dynamic adjustment of detection parameters (model, confidence threshold, IOU threshold, max detections) via WebSocket.
✦ Returns structured JSON detection results including normalized bounding box coordinates, labels, and confidence.
✦ Supports multiple video input sources from the frontend: live camera feed, desktop screen sharing, and local file uploads (images/videos).
✦ Visualizes object detection results (bounding boxes, labels, confidence) directly on the video stream in real-time.

## Usage
### Installation (Backend)
First, ensure you have Python 3.8+ installed. Then, install the required dependencies:

```bash
pip install fastapi uvicorn "ultralytics[yolo]" Pillow pydantic
```

The backend server will automatically download the specified YOLOv8 model (e.g., `yolov8n.pt`) if not found in the project root directory, and will cache additional models loaded dynamically.

### Installation (Frontend)
Navigate to the `frontend/` directory and install the Node.js dependencies:

```bash
cd frontend
npm install
# or yarn install
```

### Running the Server (Backend)
Start the FastAPI server:

```bash
python app/main.py
```
The server will start on `http://localhost:8000`.

### Running the Client (Frontend)
In a separate terminal, navigate to the `frontend/` directory and start the development server:

```bash
cd frontend
npm run dev
# or yarn dev
```
The client application will typically open in your browser at `http://localhost:5173`. Ensure both backend and frontend are running for full functionality.

### WebSocket API (Backend)
The frontend client automatically connects to the WebSocket endpoint at `ws://localhost:8000/ws`.

**Sending Data:**
The client sends JSON messages over the WebSocket connection. There are two types of messages:

1.  **Image Frames:** To send an image for detection:
    ```json
    {
      "image": "base64_encoded_image_string_here..."
    }
    ```
    *Note: The `confidence_threshold` is now managed via a separate settings message, not per-frame.*

2.  **Settings Updates:** To dynamically adjust detection parameters (model, confidence threshold, IOU threshold, maximum detections):
    ```json
    {
      "type": "settings",
      "model": "yolov8m",              // e.g., yolov8n, yolov8s, yolov8m, yolov8l, yolov8x
      "confidence": 0.5,               // float from 0.0 to 1.0
      "iou": 0.45,                     // float from 0.0 to 1.0
      "maxDetections": 100             // integer
    }
    ```
    Only the parameters present in the `settings` message will be updated.

**Receiving Data:**
The server will respond with JSON messages containing detection results for each processed frame. Each message will have a `"detections"` key containing a list of objects, structured as follows:

```json
{
  "detections": [
    {
      "label": "person",
      "confidence": 0.897,
      "x1": 0.1234,
      "y1": 0.5678,
      "x2": 0.3456,
      "y2": 0.7890
    },
    // ... more detection objects
  ]
}
```
Coordinates (`x1`, `y1`, `x2`, `y2`) are normalized (0.0 to 1.0) relative to the image dimensions.