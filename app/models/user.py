from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid

class User(Base):
    __tablename__ = 'users'

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email      = Column(String, unique=True, nullable=False)
    username   = Column(String, unique=True, nullable=False)
    hashed_pw  = Column(String, nullable=False)
    role       = Column(String, default='user')   # 'user' | 'admin'
    is_active  = Column(Boolean, default=True)
    api_keys   = relationship('APIKey', back_populates='owner')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


    def __repr__(self):
        return f'<User {self.username}>'