from fastapi import Depends, HTTPException, Header, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.security import decode_token, hash_api_key
from app.db.session import get_db
from app.models.user import User
from app.models.api_key import APIKey

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login')

# JWT dpependency
async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

# Role guard

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail='Admin privileges required')
    return current_user

# api key dependency

def get_user_from_api_key(
        x_api_key: str = Header(...), db: Session = Depends(get_db)
) -> User:
    key_hash = hash_api_key(x_api_key)
    api_key = db.query(APIKey).filter(APIKey.key_hash == key_hash).first()
    if not api_key :
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    if api_key.expires_at and api_key.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key expired"
        )

    # update last_used timestamp
    api_key.last_used = datetime.now(timezone.utc)
    db.commit()

    return api_key.owner