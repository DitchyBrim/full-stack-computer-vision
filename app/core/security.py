from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
import hashlib, secrets

from ..core.config import settings

ACCESS_TO_EXPIRE = 30
PH_HOURS = 8  # UTC+8 for Philippines

pwd_ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')


# Passwords
def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_ctx.verify(plain_password, hashed_password)

# JWT tokens
def create_access_token(data:dict) -> str:
    payload = data.copy()
    payload['exp'] = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TO_EXPIRE)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token:str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
    except JWTError:
        return None

# API keys

def generate_api_key() -> tuple[str, str]:
    raw = secrets.token_hex(32)             # 64 char hex string
    hashed = hashlib.sha256(raw.encode()).hexdigest()
    return raw, hashed                  # store hashed in DB, return raw to user

def hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode()).hexdigest()