import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base

class APIKey(Base):
    __tablename__ = 'api_keys'

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name       = Column(String(100), nullable=True)               # friendly label e.g. "my-script"
    key_hash   = Column(String(64), unique=True, nullable=False)  # SHA-256 hex of raw key
    scope      = Column(String(50), nullable=False, default="read")  # "read" | "write"
    expires_at = Column(DateTime(timezone=True), nullable=True)   # NULL = never expires
    last_used  = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Many API keys → one user
    owner = relationship("User", back_populates="api_keys")