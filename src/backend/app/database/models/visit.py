# Visit model
from .base import Base
from sqlalchemy import Column, String, Date, ForeignKey

class Visit(Base):
    patient_id = Column(String, ForeignKey('patient.id'))
    doctor_id = Column(String, ForeignKey('user.id'))
    date = Column(Date)
    symptoms = Column(String)
    diagnosis = Column(String)
    notes = Column(String)
    followup_date = Column(Date)
