from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.dependencies import get_user_from_api_key, get_current_user
from app.models.user import User

router = APIRouter(prefix="/images", tags=["Images"])


# ── Requires API Key (X-API-Key header) ───────────────────────────────────

@router.post("/process")
async def process_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_user_from_api_key),
):
    """
    Image processing endpoint — authenticated via API Key (X-API-Key header).
    Replace the body with your actual image processing logic.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()

    # TODO: plug in your image processing logic here
    return {
        "message": "Image received",
        "filename": file.filename,
        "size_bytes": len(contents),
        "processed_by": current_user.username,
    }


# ── Requires JWT (Authorization: Bearer <token>) ───────────────────────────

@router.get("/my-jobs")
def get_my_jobs(current_user: User = Depends(get_current_user)):
    """
    Returns image processing jobs for the logged-in user.
    Authenticated via JWT — meant for the React dashboard.
    """
    # TODO: query a jobs/results table when you add one
    return {"message": f"Jobs for {current_user.username}", "jobs": []}
