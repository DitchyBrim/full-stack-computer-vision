# full-stack-computer-vision
Real-time object detection (YOLOv8) + OCR (Tesseract) full-stack app with FastAPI backend and React frontend. Now with JWT authentication and API key management.

<table align="center">
  <tr>
    <td align="center">
      <img src="screenshots/od-result.png" alt="YOLO detection example" width="400"/>
    </td>
    <td align="center">
      <img src="screenshots/ocr-result-image.png" alt="OCR bounding boxes visualization" width="400"/>
    </td>
  </tr>
</table>

<p align="center">
  Object detection (left) — Text extraction with boxes (right)
</p>

## Features
✦ Provides a full-stack solution for real-time object detection, including a web-based UI with dynamic settings.
<img alt="Web UI - Live Object Detection" src="screenshots/od-landingpage.png" ></img>
*Browser interface: select model, adjust confidence/IOU, see real-time bounding boxes*

✦ Integrates configurable YOLOv8 models (nano, small, medium, large, extra-large) for efficient AI-powered inference on the backend.
<p align="center">
<img alt="YOLOv8 multiple model support" src="screenshots/model-selection.png" style="display: block;" width=300></img>
</p>
*Switch models on-the-fly without restarting*

✦ Offers an HTTP `/health` endpoint for quick server status checks, including a list of currently loaded models, and a `/models` endpoint to list available YOLO models.
✦ Processes base64-encoded image frames received over WebSocket from various sources.
✦ Allows dynamic adjustment of detection parameters (model, confidence threshold, IOU threshold, max detections) via WebSocket.
✦ Returns structured JSON detection results including normalized bounding box coordinates, labels, and confidence.

✦ Supports multiple video input sources from the frontend: live camera feed, desktop screen sharing, and local file uploads (images/videos).

✦ Visualizes object detection results (bounding boxes, labels, confidence) directly on the video stream in real-time.

✦ Includes OCR (Optical Character Recognition) capabilities for extracting text from images, providing plain text, text with bounding box information, or an annotated image.
<p align="center">
<img alt="OCR landing page" src="screenshots/ocr-landingpage.png" style="display: block;" width=300></img>
</p>
✦ Provides a dedicated HTTP endpoint for performing object detection on static image file uploads, complemented by a frontend UI for batch processing and visualization.

✦ **Secure user authentication:** Implements user registration and login using JWT (JSON Web Tokens) for secure access to protected resources.
✦ **API Key management:** Users can generate, list, and revoke API keys for programmatic access to specific endpoints via the `X-API-Key` header.
✦ **Role-based access control:** Supports `user` and `admin` roles, enabling fine-grained control over features and data, including an admin-exclusive UI for user management.
✦ **User dashboard:** A dedicated frontend dashboard for users to manage their profile and API keys.

## Usage
### Installation (Backend)
First, ensure you have Python 3.8+ installed. You will also need a PostgreSQL database instance running.
Then, install the required dependencies:

```bash
pip install ultralytics fastapi==0.111.0 uvicorn[standard]==0.29.0 sqlalchemy==2.0.30 psycopg2-binary==2.9.9 passlib[bcrypt]==1.7.4 python-jose[cryptography]==3.3.0 python-multipart==0.0.9 pydantic-settings==2.2.1 alembic==1.13.1
```
For OCR functionality, you must also install the Tesseract OCR engine on your system. Refer to the official [Tesseract documentation](https://tesseract-ocr.github.io/tessdoc/Installation.html) for installation instructions specific to your operating system.
The backend server automatically downloads and caches required YOLOv8 models (e.g., `yolov8n.pt`), with the default and available models configured in `app/core/config.py`.

**Database Setup (Alembic)**
This project uses Alembic for database migrations.
1.  Initialize Alembic:
    ```bash
    alembic init alembic
    ```
    (This step is typically done once per project; subsequent runs only require `alembic revision` and `alembic upgrade`).
2.  Generate initial migration (or subsequent migrations after model changes):
    ```bash
    alembic revision --autogenerate -m "create users and api_keys tables"
    ```
3.  Apply migrations to your database:
    ```bash
    alembic upgrade head
    ```

### Installation (Frontend)
Navigate to the `frontend/` directory and install the Node.js dependencies:

```bash
cd frontend
npm install
# or yarn install
```

### Running the Server (Backend)
Configure your database connection and `SECRET_KEY` by creating a `.env` file in the project root or setting environment variables:
```
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
SECRET_KEY=a_very_secret_key_that_is_at_least_32_chars
# Optional: TESSERACT_PATH=/usr/local/bin/tesseract
```
Start the FastAPI server:

```bash
python app/main.py
```
Server configuration, including default detection parameters and available models, can be customized using environment variables or a `.env` file (e.g., `DEFAULT_MODEL=yolov8m`). OCR settings like `TESSERACT_PATH` (path to Tesseract executable) and `DEFAULT_OCR_LANGUAGE` can also be configured.
The server will start on `http://localhost:8000`.

### Running the Client (Frontend)
In a separate terminal, navigate to the `frontend/` directory and start the development server:

```bash
cd frontend
npm run dev
# or yarn dev
```
The client application will typically open in your browser at `http://localhost:5173`. You will first need to register and log in to access the main features. The client application offers several sections: real-time YOLO detection, OCR image processor, a user dashboard for managing API keys, and an admin panel (for admin users), accessible via the navigation bar.

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

### Authentication & User Management API (Backend)
This API provides endpoints for user authentication (JWT-based) and API key management.

**JWT Authentication:** Endpoints requiring authentication expect a `Bearer` token in the `Authorization` header.
**API Key Authentication:** Endpoints designated for programmatic access expect an `X-API-Key` header with a valid API key.

1.  **Register User:** `POST /auth/register`
    *   **Description:** Creates a new user account.
    *   **Input:** `application/json` with `email`, `username`, `password` (min 8 chars).
    *   **Output:** `application/json` (UserResponse).

2.  **Login User:** `POST /auth/login`
    *   **Description:** Authenticates a user and returns an access token (JWT).
    *   **Input:** `application/x-www-form-urlencoded` with `username` and `password`.
    *   **Output:** `application/json` (TokenResponse)
        ```json
        {
          "access_token": "eyJ...",
          "token_type": "bearer"
        }
        ```

3.  **Create API Key:** `POST /auth/api-keys`
    *   **Description:** Generates a new API key for the authenticated user.
    *   **Authentication:** Requires JWT.
    *   **Input:** `application/json` with `name` (string, optional) and `scope` (`"read"` or `"write"`, default: `"read"`).
    *   **Output:** `application/json` (APIKeyCreatedResponse).
        *   **Important:** The raw API key is returned *only once* at creation. Store it securely.

4.  **List API Keys:** `GET /auth/api-keys`
    *   **Description:** Retrieves all API keys belonging to the authenticated user.
    *   **Authentication:** Requires JWT.
    *   **Output:** `application/json` (list of APIKeyResponse).

5.  **Revoke API Key:** `DELETE /auth/api-keys/{key_id}`
    *   **Description:** Deletes a specific API key belonging to the authenticated user.
    *   **Authentication:** Requires JWT.
    *   **Output:** `HTTP 204 No Content`.

6.  **Get Current User Profile:** `GET /users/me`
    *   **Description:** Returns the profile of the authenticated user.
    *   **Authentication:** Requires JWT.
    *   **Output:** `application/json` (UserResponse).

7.  **List All Users:** `GET /users/`
    *   **Description:** Returns a list of all registered users. (Admin only)
    *   **Authentication:** Requires JWT with `admin` role.
    *   **Output:** `application/json` (list of UserResponse).

8.  **Change User Role:** `PATCH /users/{user_id}/role`
    *   **Description:** Updates the role of a specified user. (Admin only)
    *   **Authentication:** Requires JWT with `admin` role.
    *   **Input:** Query parameter `role` (`"user"` or `"admin"`).
    *   **Output:** `application/json` (message and updated username).

9.  **Deactivate User:** `PATCH /users/{user_id}/deactivate`
    *   **Description:** Deactivates a specified user account. (Admin only)
    *   **Authentication:** Requires JWT with `admin` role.
    *   **Output:** `application/json` (message).

### HTTP Detection API (Backend)
This endpoint performs **unauthenticated** object detection on static image files.

1.  **Infer Image:** `POST /infer/image`
    *   **Description:** Uploads an image file (`.png`, `.jpeg`, `.jpg`, `.bmp`, `.tiff`, max 10 MB) and returns object detection results.
    *   **Input:** `multipart/form-data` with:
        *   `file` (required): An `UploadFile` containing the image.
        *   `confidence` (optional): `float` from 0.0 to 1.0 (default: 0.5)
        *   `iou` (optional): `float` from 0.0 to 1.0 (default: 0.45)
        *   `max_det` (optional): `int` (default: 100)
        *   `model` (optional): `str` (e.g., `yolov8n`, `yolov8s`, `yolov8m`, `yolov8l`, `yolov8x`)
    *   **Output:** `application/json`
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

### Authenticated Image Processing API (Backend)
These endpoints provide image processing functionality that requires authentication, either via an API Key or JWT.

1.  **Process Image:** `POST /images/process`
    *   **Description:** An example endpoint for image processing logic.
    *   **Authentication:** Requires `X-API-Key` header with a valid API key.
    *   **Input:** `multipart/form-data` with `file` (image).
    *   **Output:** `application/json` (example response, implement your logic).

2.  **Get User's Processing Jobs:** `GET /images/my-jobs`
    *   **Description:** An example endpoint to retrieve image processing jobs associated with the authenticated user.
    *   **Authentication:** Requires JWT.
    *   **Output:** `application/json` (example response, implement your logic).

### OCR API (Backend)
The backend provides REST API endpoints for **unauthenticated** Optical Character Recognition. All endpoints accept image files (`.png`, `.jpeg`, `.jpg`, `.bmp`, `.tiff`) up to 10 MB and support a `language` query parameter (e.g., `eng`, `spa`).

1.  **Extract Plain Text:** `POST /ocr/extract`
    *   **Description:** Extracts all discernible text from an uploaded image.
    *   **Input:** `multipart/form-data` with an `UploadFile` (image) and an optional `language` query parameter.
    *   **Output:** `application/json`
        ```json
        {
          "job_id": "...",
          "text": "Extracted text content...",
          "confidence": 85.3, // average confidence
          "language": "eng",
          "processed_at": "2026-03-11T15:25:00Z"
        }
        ```

2.  **Extract Text with Bounding Boxes:** `POST /ocr/extract-with-boxes`
    *   **Description:** Extracts text and provides detailed bounding box coordinates for each detected word.
    *   **Input:** `multipart/form-data` with an `UploadFile` (image) and an optional `language` query parameter.
    *   **Output:** `application/json`
        ```json
        {
          "job_id": "...",
          "text": "Extracted text content...",
          "words": [
            {
              "text": "Word",
              "confidence": 98.5,
              "bounding_box": { "left": 10, "top": 20, "width": 50, "height": 15 }
            },
            // ... more words
          ],
          "total_words": 123,
          "language": "eng",
          "processed_at": "2026-03-11T15:25:00Z"
        }
        ```

3.  **Extract Annotated Image:** `POST /ocr/extract-annotated`
    *   **Description:** Returns the uploaded image with bounding boxes drawn around the detected text.
    *   **Input:** `multipart/form-data` with an `UploadFile` (image) and an optional `language` query parameter.
    *   **Output:** `image/png` (binary image data) with `X-Total-Words` header.