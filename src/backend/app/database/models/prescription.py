# Prescription model
from .base import Base
from sqlalchemy import Column, String, Date, ForeignKey

class Prescription(Base):
    visit_id = Column(String, ForeignKey('visit.id'))
    doctor_id = Column(String, ForeignKey('user.id'))
    date = Column(Date)
    notes = Column(String)
