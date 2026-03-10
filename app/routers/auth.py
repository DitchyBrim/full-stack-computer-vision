from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token, generate_api_key
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.api_key import APIKey
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import TokenResponse, APIKeyCreate, APIKeyResponse, APIKeyCreatedResponse

router = APIRouter(prefix='/auth', tags=['authentication'])

# Register

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    # Check for duplicate email or username
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=data.email,
        username=data.username,
        hashed_pw=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Login and API key management
@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm expects form fields: username + password
    user = db.query(User).filter(User.username == form.username).first()

    if not user or not verify_password(form.password, user.hashed_pw):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer"}



@router.post("/api-keys", response_model=APIKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(
    data: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.scope not in ("read", "write"):
        raise HTTPException(status_code=400, detail="Scope must be 'read' or 'write'")

    raw, hashed = generate_api_key()
    api_key = APIKey(
        user_id=current_user.id,
        name=data.name,
        key_hash=hashed,
        scope=data.scope,
    )
    db.add(api_key)
    db.commit()

    return APIKeyCreatedResponse(key=raw, name=data.name, scope=data.scope)


@router.get("/api-keys", response_model=list[APIKeyResponse])
def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(APIKey).filter(APIKey.user_id == current_user.id).all()


@router.delete("/api-keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    api_key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user.id  # users can only delete their own keys
    ).first()

    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    db.delete(api_key)
    db.commit()
