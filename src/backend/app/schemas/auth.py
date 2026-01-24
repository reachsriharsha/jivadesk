"""Authentication schemas (Pydantic models)"""
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
import re


class RegisterRequest(BaseModel):
    """Request schema for user registration."""
    
    email: EmailStr = Field(..., description="User email address")
    phone: str = Field(..., min_length=10, max_length=10, description="10-digit phone number")
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    confirm_password: str = Field(..., description="Password confirmation")
    terms_accepted: bool = Field(..., description="Terms and conditions acceptance")

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        """Validate phone number format (10 digits)."""
        if not re.match(r'^[0-9]{10}$', v):
            raise ValueError('Phone must be exactly 10 digits')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

    @field_validator('terms_accepted')
    @classmethod
    def validate_terms(cls, v):
        """Validate terms acceptance."""
        if not v:
            raise ValueError('You must accept the terms and conditions')
        return v

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "email": "doctor@example.com",
            "phone": "9876543210",
            "password": "SecurePass123",
            "confirm_password": "SecurePass123",
            "terms_accepted": True
        }
    })


class UserResponse(BaseModel):
    """Response schema for user data."""
    
    id: str
    email: str
    phone: str
    is_profile_complete: bool
    is_email_verified: bool
    is_phone_verified: bool

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Response schema for authentication tokens."""
    
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 3600


class RegisterResponse(BaseModel):
    """Response schema for registration."""
    
    status: str = "success"
    message: str
    data: dict

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "status": "success",
            "message": "Registration successful",
            "data": {
                "user": {
                    "id": "usr_xyz789",
                    "email": "doctor@example.com",
                    "phone": "9876543210",
                    "is_profile_complete": False,
                    "is_email_verified": False,
                    "is_phone_verified": False
                },
                "token": {
                    "access_token": "eyJhbGciOiJIUzI1NiIs...",
                    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
                    "token_type": "bearer",
                    "expires_in": 3600
                }
            }
        }
    })


class CheckAvailabilityResponse(BaseModel):
    """Response schema for email/phone availability check."""
    
    status: str = "success"
    data: dict

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "status": "success",
            "data": {
                "available": True
            }
        }
    })


class ErrorResponse(BaseModel):
    """Response schema for errors."""
    
    status: str = "error"
    message: str
    error_code: Optional[str] = None
    errors: Optional[list] = None

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "status": "error",
            "message": "Email already registered",
            "error_code": "EMAIL_EXISTS"
        }
    })


class CheckEmailRequest(BaseModel):
    email: EmailStr = Field(..., description="Email address to check")


class CheckPhoneRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=10, description="10-digit phone number to check")


class LoginRequest(BaseModel):
    """Request schema for user login."""

    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="User password")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "email": "doctor@example.com",
            "password": "SecurePass123"
        }
    })


class LoginResponse(BaseModel):
    """Response schema for successful login."""

    status: str = "success"
    message: str
    data: dict

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "status": "success",
            "message": "Login successful",
            "data": {
                "user": {
                    "id": "usr_xyz789",
                    "email": "doctor@example.com",
                    "phone": "9876543210",
                    "is_profile_complete": False,
                    "is_email_verified": False,
                    "is_phone_verified": False
                },
                "token": {
                    "access_token": "eyJhbGciOiJIUzI1NiIs...",
                    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
                    "token_type": "bearer",
                    "expires_in": 3600
                }
            }
        }
    })


# AUTH-003: Profile Setup Schemas

class ProfileSetupRequest(BaseModel):
    """Request schema for profile setup."""

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Doctor's full name"
    )
    medical_registration_number: str = Field(
        ...,
        min_length=5,
        max_length=20,
        description="MCI or State Medical Council registration number"
    )
    qualification: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Medical qualification (e.g., MBBS, MD)"
    )
    specialization: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Medical specialization"
    )

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        """Validate full name format."""
        if not re.match(r'^[A-Za-z\s.\-]+$', v):
            raise ValueError('Full name can only contain letters, spaces, dots, and hyphens')
        return v.strip()

    @field_validator('medical_registration_number')
    @classmethod
    def validate_registration_number(cls, v):
        """Validate registration number format."""
        if not re.match(r'^[A-Za-z0-9\-/]+$', v):
            raise ValueError('Registration number can only contain letters, numbers, hyphens, and slashes')
        return v.strip().upper()

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "full_name": "Dr. Rajesh Kumar",
            "medical_registration_number": "MCI-12345",
            "qualification": "MBBS, MD (General Medicine)",
            "specialization": "General Physician"
        }
    })


class ProfileSetupResponse(BaseModel):
    """Response schema for profile setup."""

    status: str = "success"
    message: str
    data: dict

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "status": "success",
            "message": "Profile setup completed successfully",
            "data": {
                "user": {
                    "id": "usr_xyz789",
                    "email": "doctor@example.com",
                    "phone": "9876543210",
                    "full_name": "Dr. Rajesh Kumar",
                    "medical_registration_number": "MCI-12345",
                    "qualification": "MBBS, MD (General Medicine)",
                    "specialization": "General Physician",
                    "is_profile_complete": True,
                    "is_email_verified": False,
                    "is_phone_verified": False
                }
            }
        }
    })


class LogoutResponse(BaseModel):
    """Response schema for logout."""

    status: str = "success"
    message: str

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "status": "success",
            "message": "Logged out successfully"
        }
    })


class UserProfileResponse(BaseModel):
    """Response schema for user profile (GET /me)."""

    status: str = "success"
    data: dict

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "status": "success",
            "data": {
                "user": {
                    "id": "usr_xyz789",
                    "email": "doctor@example.com",
                    "phone": "9876543210",
                    "full_name": "Dr. Rajesh Kumar",
                    "medical_registration_number": "MCI-12345",
                    "qualification": "MBBS, MD (General Medicine)",
                    "specialization": "General Physician",
                    "is_profile_complete": True,
                    "is_email_verified": False,
                    "is_phone_verified": False
                }
            }
        }
    })

