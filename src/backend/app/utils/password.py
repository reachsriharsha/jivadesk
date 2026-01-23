"""Password hashing and validation utilities"""
import bcrypt
import re


class PasswordHasher:
    """
    Utility for password hashing and validation.

    Responsibilities:
    - Hash passwords using bcrypt
    - Verify passwords against hash
    - Validate password strength
    """

    def __init__(self, cost_factor: int = 12):
        self.cost_factor = cost_factor

    def hash_password(self, password: str) -> str:
        """
        Hash password using bcrypt.

        Args:
            password: Plain text password

        Returns:
            Hashed password
        """
        salt = bcrypt.gensalt(rounds=self.cost_factor)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    def verify_password(self, password: str, password_hash: str) -> bool:
        """
        Verify password against hash.

        Args:
            password: Plain text password
            password_hash: Hashed password to verify against

        Returns:
            True if password matches hash, False otherwise
        """
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

    def is_strong_password(self, password: str) -> bool:
        """
        Validate password strength.

        Requirements:
        - Minimum 8 characters
        - At least one uppercase letter
        - At least one number

        Args:
            password: Password to validate

        Returns:
            True if password meets requirements, False otherwise
        """
        if len(password) < 8:
            return False

        if not re.search(r'[A-Z]', password):
            return False

        if not re.search(r'[0-9]', password):
            return False

        return True
