"""Authentication API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    CheckAvailabilityResponse,
    ErrorResponse,
    UserResponse,
    TokenResponse,
    CheckEmailRequest,
    CheckPhoneRequest,
)
from app.utils.password import PasswordHasher
from app.utils.jwt import JWTHandler
from app.config import SECRET_KEY, JWT_ALGORITHM
from app.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["Authentication"])


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Dependency to get AuthService instance."""
    user_repo = UserRepository(db)
    password_hasher = PasswordHasher()
    jwt_handler = JWTHandler(secret_key=SECRET_KEY, algorithm=JWT_ALGORITHM)
    return AuthService(user_repo, password_hasher, jwt_handler)


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input or passwords don't match"},
        409: {"model": ErrorResponse, "description": "Email or phone already registered"},
        429: {"model": ErrorResponse, "description": "Too many registration attempts"},
    }
)
async def register(
    data: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Register a new user account.
    
    Creates a new user with email, phone, and password. Account is created immediately
    without verification. Verification codes will be sent during login (AUTH-002).
    
    - **email**: Valid email address (must be unique)
    - **phone**: 10-digit phone number (must be unique)
    - **password**: Minimum 8 characters, 1 uppercase, 1 number
    - **confirm_password**: Must match password
    - **terms_accepted**: Must be true
    """
    try:
        user, access_token, refresh_token = await auth_service.register_user(data)
        
        return RegisterResponse(
            status="success",
            message="Registration successful",
            data={
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "phone": user.phone,
                    "is_profile_complete": user.is_profile_complete,
                    "is_email_verified": user.is_email_verified,
                    "is_phone_verified": user.is_phone_verified,
                },
                "token": {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "token_type": "bearer",
                    "expires_in": 3600,
                }
            }
        )
    
    except ValueError as e:
        error_message = str(e)
        if error_message == "EMAIL_EXISTS":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "status": "error",
                    "message": "Email already registered",
                    "error_code": "EMAIL_EXISTS"
                }
            )
        elif error_message == "PHONE_EXISTS":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "status": "error",
                    "message": "Phone number already registered",
                    "error_code": "PHONE_EXISTS"
                }
            )
        elif error_message == "Passwords do not match":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "status": "error",
                    "message": "Passwords do not match",
                    "error_code": "PASSWORD_MISMATCH"
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "status": "error",
                    "message": error_message,
                    "error_code": "VALIDATION_ERROR"
                }
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "message": "Internal server error"
            }
        )


@router.post(
    "/check-email",
    response_model=CheckAvailabilityResponse,
    responses={
        200: {"model": CheckAvailabilityResponse, "description": "Email availability status"},
    }
)
async def check_email(
    data: CheckEmailRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Check if email is available for registration.
    Accepts a JSON body with the email field.
    """
    logger.info(f"Checking email availability: {data.email}")
    available = await auth_service.check_email_available(data.email)
    return CheckAvailabilityResponse(
        status="success",
        data={"available": available}
    )


@router.post(
    "/check-phone",
    response_model=CheckAvailabilityResponse,
    responses={
        200: {"model": CheckAvailabilityResponse, "description": "Phone availability status"},
    }
)
async def check_phone(
    data: CheckPhoneRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Check if phone number is available for registration.
    Accepts a JSON body with the phone field.
    """
    available = await auth_service.check_phone_available(data.phone)
    return CheckAvailabilityResponse(
        status="success",
        data={"available": available}
    )
