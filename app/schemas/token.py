from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class APIKeyCreate(BaseModel):
    name: str
    scope: str = "read"  # "read" | "write"


class APIKeyResponse(BaseModel):
    id: UUID
    name: Optional[str]
    scope: str
    expires_at: Optional[datetime]
    last_used: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class APIKeyCreatedResponse(BaseModel):
    """Returned only once at creation — includes the raw key."""
    key: str
    name: Optional[str]
    scope: str
    note: str = "Save this key — it will NOT be shown again"
