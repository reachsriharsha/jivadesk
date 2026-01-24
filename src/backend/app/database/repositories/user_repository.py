"""User repository for database operations"""
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database.models.user import User
from app.database.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User model database operations."""

    def __init__(self, db: Session):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email address.

        Args:
            email: Email address to search for

        Returns:
            User if found, None otherwise
        """
        return self.db.query(User).filter(User.email == email).first()

    async def get_by_phone(self, phone: str) -> Optional[User]:
        """
        Get user by phone number.

        Args:
            phone: Phone number to search for

        Returns:
            User if found, None otherwise
        """
        return self.db.query(User).filter(User.phone == phone).first()

    async def create(
        self,
        email: str,
        phone: str,
        password_hash: str,
        is_email_verified: bool = False,
        is_phone_verified: bool = False,
        terms_accepted_at: Optional[datetime] = None,
    ) -> User:
        """
        Create a new user.

        Args:
            email: User email address
            phone: User phone number
            password_hash: Hashed password
            is_email_verified: Email verification status
            is_phone_verified: Phone verification status
            terms_accepted_at: Timestamp when terms were accepted

        Returns:
            Created user

        Raises:
            IntegrityError: If email or phone already exists
        """
        user = User(
            email=email,
            phone=phone,
            password_hash=password_hash,
            is_email_verified=is_email_verified,
            is_phone_verified=is_phone_verified,
            terms_accepted_at=terms_accepted_at or datetime.utcnow(),
        )
        
        try:
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            return user
        except IntegrityError as e:
            self.db.rollback()
            raise e

    def update_verification_status(
        self,
        user_id: str,
        is_email_verified: Optional[bool] = None,
        is_phone_verified: Optional[bool] = None,
    ) -> User:
        """
        Update user verification status.

        Args:
            user_id: User ID
            is_email_verified: Email verification status
            is_phone_verified: Phone verification status

        Returns:
            Updated user
        """
        user = self.get(user_id)
        if user is None:
            raise ValueError(f"User with id {user_id} not found")

        if is_email_verified is not None:
            user.is_email_verified = is_email_verified
        if is_phone_verified is not None:
            user.is_phone_verified = is_phone_verified

        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user

    async def get_by_id(self, user_id: str) -> Optional[User]:
        """
        Get user by ID.

        Args:
            user_id: User UUID

        Returns:
            User if found, None otherwise
        """
        return self.db.query(User).filter(User.id == user_id).first()

    async def get_by_registration_number(
        self,
        registration_number: str
    ) -> Optional[User]:
        """
        Get user by medical registration number.

        Args:
            registration_number: Medical registration number

        Returns:
            User if found, None otherwise
        """
        return self.db.query(User).filter(
            User.medical_registration_number == registration_number
        ).first()

    async def update_profile(
        self,
        user_id: str,
        full_name: str,
        medical_registration_number: str,
        qualification: str,
        specialization: str
    ) -> Optional[User]:
        """
        Update user profile and set is_profile_complete to True.

        Args:
            user_id: User UUID
            full_name: Doctor's full name
            medical_registration_number: MCI/SMC registration number
            qualification: Medical qualification
            specialization: Medical specialization

        Returns:
            Updated user or None if not found

        Raises:
            IntegrityError: If registration number already exists
        """
        user = await self.get_by_id(user_id)
        if user is None:
            return None

        try:
            user.full_name = full_name
            user.medical_registration_number = medical_registration_number
            user.qualification = qualification
            user.specialization = specialization
            user.is_profile_complete = True
            user.updated_at = datetime.utcnow()

            self.db.commit()
            self.db.refresh(user)
            return user
        except IntegrityError as e:
            self.db.rollback()
            raise e
