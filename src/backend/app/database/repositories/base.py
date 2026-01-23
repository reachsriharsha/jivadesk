# Base repository for CRUD operations
from typing import Generic, Type, TypeVar
from sqlalchemy.orm import Session

T = TypeVar('T')

class BaseRepository(Generic[T]):
    def __init__(self,model: Type[T], db: Session):
        self.model = model
        self.db = db
    # Add generic CRUD methods here
