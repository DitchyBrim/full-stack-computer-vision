from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


# ── Any logged-in user ─────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


# ── Admin only ─────────────────────────────────────────────────────────────

@router.get("/", response_model=list[UserResponse])
def list_all_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(User).all()


@router.patch("/{user_id}/role")
def change_user_role(
    user_id: str,
    role: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    user.role = role
    db.commit()
    db.refresh(user)
    return {"message": f"Role updated to '{role}'", "user": user.username}


@router.patch("/{user_id}/deactivate")
def deactivate_user(
    user_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    user.is_active = False
    db.commit()
    return {"message": f"User '{user.username}' deactivated"}
