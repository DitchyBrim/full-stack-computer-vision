from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from uuid import UUID

# Request schemas

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

    @field_validator('password')
    @classmethod
    def password_min_length(cls, v:str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
    
    @field_validator('username')
    @classmethod
    def username_no_spaces(cls, v:str) -> str:
        if ' ' in v:
            raise ValueError('Username cannot contain spaces')
        return v
    
class UserLogin(BaseModel):
    username: str
    password: str

# Response schemas

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    created_at: datetime
    role: str
    is_active: bool
    
    model_config = {"from_attributes":True}

class UserPubclic(BaseModel):
    id: UUID
    username: str

    model_config = {"from_attributes":True}