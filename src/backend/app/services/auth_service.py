"""Authentication service layer"""
from typing import Tuple, Optional
from datetime import datetime
from uuid import UUID

from app.database.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest, ProfileSetupRequest
from app.utils.password import PasswordHasher
from app.utils.token_handler import JWTHandler
from app.database.models.user import User


class AuthService:
    """
    Service for handling authentication operations.

    Responsibilities:
    - User registration workflow
    - Email and phone uniqueness checks
    - Password hashing and validation
    - JWT token generation
    """

    def __init__(
        self,
        user_repo: UserRepository,
        password_hasher: PasswordHasher,
        jwt_handler: JWTHandler,
    ):
        self.user_repo = user_repo
        self.password_hasher = password_hasher
        self.jwt_handler = jwt_handler

    async def check_email_available(self, email: str) -> bool:
        """
        Check if email is available for registration.

        Args:
            email: Email address to check

        Returns:
            True if available, False if already registered
        """
        user = await self.user_repo.get_by_email(email)
        return user is None

    async def check_phone_available(self, phone: str) -> bool:
        """
        Check if phone number is available for registration.

        Args:
            phone: Phone number to check (10 digits)

        Returns:
            True if available, False if already registered
        """
        user = await self.user_repo.get_by_phone(phone)
        return user is None

    async def register_user(self, data: RegisterRequest) -> Tuple[User, str, str]:
        """
        Register a new user.

        Args:
            data: Registration request data

        Returns:
            Tuple of (User, access_token, refresh_token)

        Raises:
            ValueError: If email or phone already registered or passwords don't match
            ValidationError: If data is invalid
        """
        # Check password match
        if data.password != data.confirm_password:
            raise ValueError("Passwords do not match")

        # Check email uniqueness
        if not await self.check_email_available(data.email):
            raise ValueError("EMAIL_EXISTS")

        # Check phone uniqueness
        if not await self.check_phone_available(data.phone):
            raise ValueError("PHONE_EXISTS")

        # Validate password strength
        if not self.password_hasher.is_strong_password(data.password):
            raise ValueError("Password does not meet requirements")

        # Hash password
        password_hash = self.password_hasher.hash_password(data.password)

        # Create user
        user = await self.user_repo.create(
            email=data.email,
            phone=data.phone,
            password_hash=password_hash,
            is_email_verified=False,  # Will be verified at login
            is_phone_verified=False,  # Will be verified at login
            terms_accepted_at=datetime.utcnow(),
        )

        # Generate JWT tokens
        access_token = self.jwt_handler.create_access_token(user.id)
        refresh_token = self.jwt_handler.create_refresh_token(user.id)

        return user, access_token, refresh_token

    async def login_user(self, email: str, password: str) -> Tuple[User, str, str]:
        """
        Authenticate user with email and password.

        Args:
            email: User's email address
            password: User's password

        Returns:
            Tuple of (User, access_token, refresh_token)

        Raises:
            ValueError: If credentials are invalid or account is deactivated
        """
        # Get user by email
        user = await self.user_repo.get_by_email(email)

        if user is None:
            # Use same error message as wrong password for security
            raise ValueError("INVALID_CREDENTIALS")

        # Check if account is active
        if not user.is_active:
            raise ValueError("ACCOUNT_DEACTIVATED")

        # Verify password
        if not self.password_hasher.verify_password(password, user.password_hash):
            raise ValueError("INVALID_CREDENTIALS")

        # Generate JWT tokens
        access_token = self.jwt_handler.create_access_token(user.id)
        refresh_token = self.jwt_handler.create_refresh_token(user.id)

        return user, access_token, refresh_token

    async def setup_profile(
        self,
        user_id: str,
        data: ProfileSetupRequest
    ) -> User:
        """
        Complete doctor profile setup.

        Args:
            user_id: UUID of the authenticated user
            data: Profile setup data

        Returns:
            Updated User object

        Raises:
            ValueError: If user not found or registration number already exists
        """
        # Get current user
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise ValueError("USER_NOT_FOUND")

        # Check if registration number is already in use by another user
        existing_user = await self.user_repo.get_by_registration_number(
            data.medical_registration_number
        )
        if existing_user and str(existing_user.id) != user_id:
            raise ValueError("REGISTRATION_NUMBER_EXISTS")

        # Update user profile
        user = await self.user_repo.update_profile(
            user_id=user_id,
            full_name=data.full_name,
            medical_registration_number=data.medical_registration_number,
            qualification=data.qualification,
            specialization=data.specialization
        )

        return user

    async def get_current_user(self, user_id: str) -> Optional[User]:
        """
        Get current user by ID.

        Args:
            user_id: UUID of the authenticated user

        Returns:
            User object or None if not found
        """
        return await self.user_repo.get_by_id(user_id)

    async def logout_user(self, user_id: str) -> bool:
        """
        Log user logout event for audit trail.

        Note: This is a stateless JWT system. Tokens cannot be invalidated server-side.
        This method exists for auditing and compliance purposes.

        Args:
            user_id: UUID of the authenticated user

        Returns:
            True if logout event was logged successfully

        Raises:
            ValueError: If user not found
        """
        # Verify user exists
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise ValueError("USER_NOT_FOUND")

        # Future enhancements could add:
        # - Update last_logout_at timestamp in user table
        # - Record in audit log table
        # - Check for suspicious patterns

        return True
