# Medicine model
from .base import Base
from sqlalchemy import Column, String

class Medicine(Base):
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
