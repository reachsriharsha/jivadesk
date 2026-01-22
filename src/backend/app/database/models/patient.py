# Patient model
from .base import Base
from sqlalchemy import Column, String, Date, ForeignKey

class Patient(Base):
    name = Column(String, nullable=False)
    dob = Column(Date)
    gender = Column(String)
    phone = Column(String)
    address = Column(String)
    clinic_id = Column(String, ForeignKey('clinic.id'))
