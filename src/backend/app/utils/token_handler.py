"""JWT token generation and verification utilities"""
import jwt
from datetime import datetime, timedelta
from uuid import UUID
from typing import Dict, Any


class JWTHandler:
    """
    Utility for JWT token generation and verification.

    Responsibilities:
    - Create access and refresh tokens
    - Verify and decode tokens
    - Handle token expiry
    """

    def __init__(
        self,
        secret_key: str,
        algorithm: str = "HS256",
        access_token_expire_minutes: int = 60,
        refresh_token_expire_days: int = 30
    ):
        self.secret_key = secret_key
        self.algorithm = algorithm
        # Convert to seconds for internal use
        self.access_token_ttl = access_token_expire_minutes * 60
        self.refresh_token_ttl = refresh_token_expire_days * 24 * 60 * 60

    def create_access_token(self, user_id: UUID) -> str:
        """
        Create JWT access token.

        Args:
            user_id: User ID to encode in token

        Returns:
            Encoded JWT token
        """
        payload = {
            "sub": str(user_id),
            "type": "access",
            "exp": datetime.utcnow() + timedelta(seconds=self.access_token_ttl),
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(self, user_id: UUID) -> str:
        """
        Create JWT refresh token.

        Args:
            user_id: User ID to encode in token

        Returns:
            Encoded JWT token
        """
        payload = {
            "user_id": str(user_id),
            "type": "refresh",
            "exp": datetime.utcnow() + timedelta(seconds=self.refresh_token_ttl),
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def decode_token(self, token: str) -> Dict[str, Any]:
        """
        Decode and verify JWT token.

        Args:
            token: JWT token to decode

        Returns:
            Decoded token payload

        Raises:
            jwt.ExpiredSignatureError: If token has expired
            jwt.InvalidTokenError: If token is invalid
        """
        return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])

    def verify_access_token(self, token: str) -> str:
        """
        Verify access token and return user_id.

        Args:
            token: JWT access token

        Returns:
            User ID from token

        Raises:
            jwt.ExpiredSignatureError: If token has expired
            jwt.InvalidTokenError: If token is invalid
            ValueError: If token type is not 'access'
        """
        payload = self.decode_token(token)
        if payload.get("type") != "access":
            raise ValueError("Invalid token type")
        return payload.get("user_id")
