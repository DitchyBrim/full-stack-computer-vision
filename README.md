# full-stack-computer-vision


undefined

undefined

1.  Summarize new functionality
    *   Launches a new FastAPI application providing a real-time object detection service.
    *   Exposes a WebSocket endpoint (`/ws`) for streaming base64-encoded image frames.
    *   Performs object detection using a pre-loaded YOLOv8 model and returns structured JSON results.
    *   Includes a `/health` HTTP endpoint to check server availability.
    *   Configures CORS middleware to allow cross-origin requests from any source.

2.  Detect important updates
    *   **New Core Service:** Introduces a foundational real-time object detection API built with FastAPI.
    *   **YOLOv8 Integration:** Establishes a core dependency on and integration with the `ultralytics` YOLOv8 model for AI inference.
    *   **WebSocket Communication:** Implements a WebSocket protocol for persistent, low-latency communication of image streams and detection results.
    *   **Image Processing Pipeline:** Defines a complete server-side pipeline for decoding base64 images, running inference, and formatting detection output.
    *   **Broad CORS Policy:** Configures a permissive CORS policy, simplifying initial frontend development and integration.

3.  Generate README.md updates

    ## Features (updated)
    ✦ Provides a real-time object detection service via WebSocket.
    ✦ Integrates the YOLOv8 model for efficient AI-powered inference.
    ✦ Offers an HTTP `/health` endpoint for quick server status checks.
    ✦ Processes base64-encoded image frames received over WebSocket.
    ✦ Returns structured JSON detection results including normalized bounding box coordinates, labels, and confidence.

    ## Usage (updated)
    ### Installation
    First, ensure you have Python 3.8+ installed. Then, install the required dependencies:

    ```bash
    pip install fastapi uvicorn "ultralytics[yolo]" Pillow
    ```

    Next, download the YOLOv8 nano model (`yolov8n.pt`) and place it in the project root directory, or ensure the `MODEL_PATH` in `app/main.py` points to its location. You can download it directly from Ultralytics:

    ```bash
    wget https://github.com/ultralytics/assets/releases/download/v8.1.0/yolov8n.pt
    ```

    ### Running the Server
    Start the FastAPI server:

    ```bash
    python app/main.py
    ```
    The server will start on `http://localhost:8000`.

    ### WebSocket API
    Connect to the WebSocket endpoint at `ws://localhost:8000/ws`.

    **Sending Data:**
    Send base64-encoded image data (e.g., JPEG or PNG frames) as a plain text string over the WebSocket connection.

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

    ## Recent Changes
    ### YYYY-MM-DD – Initial release of real-time YOLO detection server
    - Introduces a FastAPI-based server for real-time object detection.
    - Provides a WebSocket API (`/ws`) for streaming image frames and receiving detection results.
    - Includes a `/health` endpoint for server status checks.
    - Integrates the YOLOv8 model for AI inference capabilities.