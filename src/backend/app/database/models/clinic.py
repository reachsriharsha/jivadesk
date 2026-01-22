# Clinic model
from .base import Base
from sqlalchemy import Column, String

class Clinic(Base):
    name = Column(String, nullable=False)
    address = Column(String)
    registration_number = Column(String)
