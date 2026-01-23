"""Authentication service layer"""
from typing import Tuple
from datetime import datetime
from uuid import UUID

from app.database.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest
from app.utils.password import PasswordHasher
from app.utils.jwt import JWTHandler
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
