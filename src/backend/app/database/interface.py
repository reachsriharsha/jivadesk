# Abstract database interface (Protocol)
from typing import Protocol

class DatabaseInterface(Protocol):
    def get_user(self, user_id: str): ...
    def get_patient(self, patient_id: str): ...
    # Add more as needed
