# User model
from .base import Base
from sqlalchemy import Column, String, Boolean

class User(Base):
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)
    is_phone_verified = Column(Boolean, default=False)
    is_profile_complete = Column(Boolean, default=False)
