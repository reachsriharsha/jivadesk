# Design Specification: First-time Profile Setup

**Design ID:** DES-003
**Feature ID:** AUTH-003 ([Feature Specification](../features/AUTH-003_profile_setup.md))
**Version:** 1.0
**Status:** Draft
**Created:** 2026-01-23
**Last Updated:** 2026-01-23
**Author:** JivaDesk Team

---

## 1. Overview

This design document provides the technical implementation details for the First-time Profile Setup feature (AUTH-003). The feature captures the doctor's professional details after first login to complete their profile before accessing the main application.

**Scope:**

- Profile setup page with form validation
- Database schema changes for profile fields
- API endpoint for profile update
- Protected route requiring authentication
- Redirect logic based on profile completion status

**Out of Scope:**

- Profile photo upload
- Clinic details (CLINIC-002)
- Profile editing after initial setup (future feature)
- Multi-step wizard (single page for MVP)

**Related Documents:**

- Feature Spec: [AUTH-003_profile_setup.md](../features/AUTH-003_profile_setup.md)
- Login Design: [DES-002_doctor_login.md](./DES-002_doctor_login.md)
- UI Design: [UI_DESIGN.md](../UI_DESIGN.md)
- API Spec: [API_SPEC.md](../API_SPEC.md)
- Database Schema: [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)

---

## 2. Architecture Overview

### 2.1 System Context Diagram

```
+---------------------------------------------------------------------+
|                      Profile Setup System                            |
+---------------------------------------------------------------------+
|                                                                     |
|  +----------------+      +----------------+      +------------------+|
|  |   Frontend     |      |   Backend      |      |    Database      ||
|  |  (React/TS)    |<---->|  (FastAPI)     |<---->|   (PostgreSQL)   ||
|  +----------------+      +----------------+      +------------------+|
|         |                       |                                    |
|         |                       |                                    |
|         v                       v                                    |
|  +----------------+      +----------------+                          |
|  | localStorage   |      |  JWT Utils     |                          |
|  |   (tokens)     |      |  (PyJWT)       |                          |
|  +----------------+      +----------------+                          |
|                                                                     |
+---------------------------------------------------------------------+
```

### 2.2 Component Impact

| Component       | Files Modified                                                  | New Files                                                                    | Deleted Files |
| --------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| **Backend API** | `api/auth.py`<br>`services/auth_service.py`<br>`schemas/auth.py`| `database/models/user.py` (modify)                                           | -             |
| **Frontend**    | `App.tsx`<br>`stores/authStore.ts`<br>`services/auth.ts`<br>`types/auth.ts` | `pages/ProfileSetup.tsx`<br>`components/forms/ProfileSetupForm.tsx` | -             |
| **Database**    | -                                                               | `alembic/versions/xxx_add_profile_fields.py`                                 | -             |

---

## 3. Detailed Design

### 3.1 Backend API

#### 3.1.1 Database Schema Changes

**Migration: Add profile fields to users table**

```sql
-- Migration: add_profile_fields_to_users
-- Alembic revision

ALTER TABLE users ADD COLUMN full_name VARCHAR(100);
ALTER TABLE users ADD COLUMN medical_registration_number VARCHAR(20);
ALTER TABLE users ADD COLUMN qualification VARCHAR(100);
ALTER TABLE users ADD COLUMN specialization VARCHAR(100);

-- Create partial unique index (unique only when not null)
CREATE UNIQUE INDEX ix_users_medical_registration_number
ON users(medical_registration_number)
WHERE medical_registration_number IS NOT NULL;
```

**Updated User Model (`app/database/models/user.py`):**

```python
"""User model"""
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.database.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    # Profile fields (AUTH-003)
    full_name = Column(String(100), nullable=True)
    medical_registration_number = Column(String(20), unique=True, nullable=True)
    qualification = Column(String(100), nullable=True)
    specialization = Column(String(100), nullable=True)

    # Status flags
    is_email_verified = Column(Boolean, default=False)
    is_phone_verified = Column(Boolean, default=False)
    is_profile_complete = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Timestamps
    terms_accepted_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"
```

#### 3.1.2 API Endpoints

**Endpoint: PUT /api/v1/auth/profile-setup**

| Attribute     | Value                                        |
| ------------- | -------------------------------------------- |
| Method        | PUT                                          |
| Path          | /api/v1/auth/profile-setup                   |
| Auth Required | Yes (JWT Bearer token)                       |
| Permissions   | Authenticated user, own profile only         |
| Rate Limit    | 10 requests per minute                       |
| Description   | Complete doctor profile setup                |

**Request Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "full_name": "string (required) - Doctor's full name, 2-100 chars",
  "medical_registration_number": "string (required) - MCI/SMC number, 5-20 chars",
  "qualification": "string (required) - Medical qualification, 2-100 chars",
  "specialization": "string (required) - Medical specialization, 2-100 chars"
}
```

**Response (200 OK):**

```json
{
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
      "is_profile_complete": true,
      "is_email_verified": false,
      "is_phone_verified": false
    }
  }
}
```

**Error Responses:**

| Code | Condition                    | Response                                                                              |
| ---- | ---------------------------- | ------------------------------------------------------------------------------------- |
| 400  | Validation error             | `{"status": "error", "message": "Validation error", "errors": [...]}`                 |
| 401  | Invalid/expired token        | `{"status": "error", "message": "Invalid or expired token", "error_code": "UNAUTHORIZED"}` |
| 409  | Duplicate registration no.   | `{"status": "error", "message": "Registration number already exists", "error_code": "REGISTRATION_NUMBER_EXISTS"}` |
| 500  | Server error                 | `{"status": "error", "message": "Internal server error"}`                             |

---

**Endpoint: GET /api/v1/auth/me**

| Attribute     | Value                                |
| ------------- | ------------------------------------ |
| Method        | GET                                  |
| Path          | /api/v1/auth/me                      |
| Auth Required | Yes (JWT Bearer token)               |
| Permissions   | Authenticated user                   |
| Rate Limit    | 60 requests per minute               |
| Description   | Get current user profile             |

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
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
      "is_profile_complete": true,
      "is_email_verified": false,
      "is_phone_verified": false
    }
  }
}
```

#### 3.1.3 Schema Definitions

**File:** `src/backend/app/schemas/auth.py` (add to existing)

```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import re


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
        # Allow letters, spaces, dots, and hyphens
        if not re.match(r'^[A-Za-z\s.\-]+$', v):
            raise ValueError('Full name can only contain letters, spaces, dots, and hyphens')
        return v.strip()

    @field_validator('medical_registration_number')
    @classmethod
    def validate_registration_number(cls, v):
        # Allow alphanumeric with hyphens and slashes
        if not re.match(r'^[A-Za-z0-9\-/]+$', v):
            raise ValueError('Registration number can only contain letters, numbers, hyphens, and slashes')
        return v.strip().upper()

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Dr. Rajesh Kumar",
                "medical_registration_number": "MCI-12345",
                "qualification": "MBBS, MD (General Medicine)",
                "specialization": "General Physician"
            }
        }


class ProfileSetupResponse(BaseModel):
    """Response schema for profile setup."""
    status: str
    message: str
    data: dict

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "message": "Profile setup completed successfully",
                "data": {
                    "user": {
                        "id": "uuid",
                        "email": "doctor@example.com",
                        "phone": "9876543210",
                        "full_name": "Dr. Rajesh Kumar",
                        "medical_registration_number": "MCI-12345",
                        "qualification": "MBBS, MD (General Medicine)",
                        "specialization": "General Physician",
                        "is_profile_complete": True
                    }
                }
            }
        }


class UserProfileResponse(BaseModel):
    """Response schema for user profile (GET /me)."""
    status: str
    data: dict

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "data": {
                    "user": {
                        "id": "uuid",
                        "email": "doctor@example.com",
                        "phone": "9876543210",
                        "full_name": "Dr. Rajesh Kumar",
                        "is_profile_complete": True
                    }
                }
            }
        }
```

#### 3.1.4 Service Layer

**File:** `src/backend/app/services/auth_service.py` (add methods to existing AuthService)

```python
from typing import Optional
from app.database.models.user import User
from app.schemas.auth import ProfileSetupRequest


class AuthService:
    # ... existing methods from AUTH-001 and AUTH-002 ...

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
```

#### 3.1.5 Repository Layer

**File:** `src/backend/app/database/repositories/user_repository.py` (add methods)

```python
from typing import Optional
from sqlalchemy.orm import Session
from app.database.models.user import User


class UserRepository:
    # ... existing methods ...

    async def get_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    async def get_by_registration_number(
        self,
        registration_number: str
    ) -> Optional[User]:
        """Get user by medical registration number."""
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
    ) -> User:
        """Update user profile and set is_profile_complete to True."""
        user = await self.get_by_id(user_id)
        if user:
            user.full_name = full_name
            user.medical_registration_number = medical_registration_number
            user.qualification = qualification
            user.specialization = specialization
            user.is_profile_complete = True
            self.db.commit()
            self.db.refresh(user)
        return user
```

#### 3.1.6 API Router

**File:** `src/backend/app/api/auth.py` (add endpoints to existing router)

```python
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth import (
    ProfileSetupRequest,
    ProfileSetupResponse,
    UserProfileResponse
)
from app.services.auth_service import AuthService
from app.utils.jwt import JWTHandler
from app.config import SECRET_KEY, JWT_ALGORITHM
from app.logging_config import get_logger

logger = get_logger(__name__)
security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extract and validate user ID from JWT token."""
    jwt_handler = JWTHandler(secret_key=SECRET_KEY, algorithm=JWT_ALGORITHM)
    try:
        payload = jwt_handler.decode_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"status": "error", "message": "Invalid token", "error_code": "UNAUTHORIZED"}
            )
        return user_id
    except Exception as e:
        logger.warning(f"token_validation_failed | error={str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"status": "error", "message": "Invalid or expired token", "error_code": "UNAUTHORIZED"}
        )


@router.put("/profile-setup", response_model=ProfileSetupResponse)
async def profile_setup(
    data: ProfileSetupRequest,
    user_id: str = Depends(get_current_user_id),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Complete doctor profile setup.

    Requires authentication. Updates the user's profile with professional details
    and sets is_profile_complete to true.
    """
    logger.info(f"profile_setup_started | user_id={user_id}")

    try:
        user = await auth_service.setup_profile(user_id, data)

        logger.info(
            f"profile_setup_success | user_id={user.id} | "
            f"full_name={user.full_name} | registration_number={user.medical_registration_number}"
        )

        return ProfileSetupResponse(
            status="success",
            message="Profile setup completed successfully",
            data={
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "phone": user.phone,
                    "full_name": user.full_name,
                    "medical_registration_number": user.medical_registration_number,
                    "qualification": user.qualification,
                    "specialization": user.specialization,
                    "is_profile_complete": user.is_profile_complete,
                    "is_email_verified": user.is_email_verified,
                    "is_phone_verified": user.is_phone_verified
                }
            }
        )

    except ValueError as e:
        error_message = str(e)
        if error_message == "USER_NOT_FOUND":
            logger.warning(f"profile_setup_failed | user_id={user_id} | reason=user_not_found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "status": "error",
                    "message": "User not found",
                    "error_code": "USER_NOT_FOUND"
                }
            )
        elif error_message == "REGISTRATION_NUMBER_EXISTS":
            logger.warning(
                f"profile_setup_failed | user_id={user_id} | "
                f"registration_number={data.medical_registration_number} | "
                f"reason=registration_number_exists"
            )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "status": "error",
                    "message": "This registration number is already in use",
                    "error_code": "REGISTRATION_NUMBER_EXISTS"
                }
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "status": "error",
                "message": error_message,
                "error_code": "VALIDATION_ERROR"
            }
        )

    except Exception as e:
        logger.error(f"profile_setup_error | user_id={user_id} | error_type={type(e).__name__} | error={str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": "Internal server error"}
        )


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Get current authenticated user's profile.

    Requires authentication.
    """
    logger.debug(f"get_current_user_started | user_id={user_id}")

    user = await auth_service.get_current_user(user_id)

    if not user:
        logger.warning(f"get_current_user_failed | user_id={user_id} | reason=user_not_found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "status": "error",
                "message": "User not found",
                "error_code": "USER_NOT_FOUND"
            }
        )

    logger.debug(f"get_current_user_success | user_id={user.id} | email={user.email}")

    return UserProfileResponse(
        status="success",
        data={
            "user": {
                "id": str(user.id),
                "email": user.email,
                "phone": user.phone,
                "full_name": user.full_name,
                "medical_registration_number": user.medical_registration_number,
                "qualification": user.qualification,
                "specialization": user.specialization,
                "is_profile_complete": user.is_profile_complete,
                "is_email_verified": user.is_email_verified,
                "is_phone_verified": user.is_phone_verified
            }
        }
    )
```

---

### 3.2 Frontend

#### 3.2.1 Component Architecture

Based on [UI_DESIGN.md](../UI_DESIGN.md) Profile Setup Wizard design:

```
+---------------------------------------------------------------------+
|                    Profile Setup Flow Components                     |
+---------------------------------------------------------------------+
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |                      ProfileSetupPage                          |  |
|  |  +-----------------------------------------------------------+|  |
|  |  |                 ProfileSetupForm                          ||  |
|  |  |  +-----------------------------------------------------+ ||  |
|  |  |  |  FullNameInput                                      | ||  |
|  |  |  +-----------------------------------------------------+ ||  |
|  |  |  +-----------------------------------------------------+ ||  |
|  |  |  |  MedicalRegistrationInput                           | ||  |
|  |  |  +-----------------------------------------------------+ ||  |
|  |  |  +-----------------------------------------------------+ ||  |
|  |  |  |  QualificationInput                                 | ||  |
|  |  |  +-----------------------------------------------------+ ||  |
|  |  |  +-----------------------------------------------------+ ||  |
|  |  |  |  SpecializationSelect (dropdown with custom option) | ||  |
|  |  |  +-----------------------------------------------------+ ||  |
|  |  |  +-----------------------------------------------------+ ||  |
|  |  |  |  SubmitButton                                       | ||  |
|  |  |  +-----------------------------------------------------+ ||  |
|  |  +-----------------------------------------------------------+|  |
|  +---------------------------------------------------------------+  |
|                                                                     |
+---------------------------------------------------------------------+
```

#### 3.2.2 Type Definitions

**File:** `src/frontend/src/types/auth.ts` (add to existing)

```typescript
// Add to existing auth types

export interface ProfileSetupFormData {
  fullName: string;
  medicalRegistrationNumber: string;
  qualification: string;
  specialization: string;
}

export interface ProfileSetupFormErrors {
  fullName?: string;
  medicalRegistrationNumber?: string;
  qualification?: string;
  specialization?: string;
  general?: string;
}

export interface ProfileSetupRequest {
  full_name: string;
  medical_registration_number: string;
  qualification: string;
  specialization: string;
}

export interface ProfileSetupResponse {
  status: string;
  message: string;
  data: {
    user: User;
  };
}

// Update User interface to include profile fields
export interface User {
  id: string;
  email: string;
  phone: string;
  full_name?: string;
  medical_registration_number?: string;
  qualification?: string;
  specialization?: string;
  is_profile_complete: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
}

// Specialization options
export const SPECIALIZATIONS = [
  'General Physician',
  'Pediatrician',
  'Gynecologist',
  'Dermatologist',
  'Orthopedic',
  'ENT Specialist',
  'Ophthalmologist',
  'Cardiologist',
  'Neurologist',
  'Psychiatrist',
  'General Surgeon',
  'Other',
] as const;

export type Specialization = typeof SPECIALIZATIONS[number];
```

#### 3.2.3 API Service

**File:** `src/frontend/src/services/auth.ts` (add to existing)

```typescript
import { logger } from '../utils/logger';

// Add to existing auth service

/**
 * Complete profile setup
 */
async setupProfile(data: ProfileSetupRequest): Promise<ProfileSetupResponse> {
  const endpoint = '/auth/profile-setup';
  const startTime = Date.now();
  const accessToken = localStorage.getItem('access_token');

  logger.info('api_request_start', {
    method: 'PUT',
    endpoint,
    fullName: data.full_name,
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.json();
      logger.error('api_request_failed', {
        method: 'PUT',
        endpoint,
        status: response.status,
        durationMs,
        errorCode: error.detail?.error_code || error.error_code,
        errorMessage: error.detail?.message || error.message,
      });
      throw error;
    }

    const result = await response.json();
    logger.info('api_request_success', {
      method: 'PUT',
      endpoint,
      status: response.status,
      durationMs,
      userId: result.data?.user?.id,
      isProfileComplete: result.data?.user?.is_profile_complete,
    });

    return result;
  } catch (error: any) {
    if (!error.detail && !error.error_code) {
      logger.error('api_request_error', {
        method: 'PUT',
        endpoint,
        errorType: 'network_or_unknown',
        errorMessage: error.message || 'Unknown error',
      });
    }
    throw error;
  }
}

/**
 * Get current user profile
 */
async getCurrentUser(): Promise<UserProfileResponse> {
  const endpoint = '/auth/me';
  const startTime = Date.now();
  const accessToken = localStorage.getItem('access_token');

  logger.debug('api_request_start', { method: 'GET', endpoint });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.json();
      logger.error('api_request_failed', {
        method: 'GET',
        endpoint,
        status: response.status,
        durationMs,
      });
      throw error;
    }

    const result = await response.json();
    logger.debug('api_request_success', {
      method: 'GET',
      endpoint,
      status: response.status,
      durationMs,
    });

    return result;
  } catch (error: any) {
    logger.error('api_request_error', {
      method: 'GET',
      endpoint,
      errorMessage: error.message,
    });
    throw error;
  }
}
```

#### 3.2.4 State Management

**File:** `src/frontend/src/stores/authStore.ts` (add method to existing store)

```typescript
import { logger } from '../utils/logger';

// Add to existing authStore

interface AuthState {
  // ... existing state ...

  // Actions
  setupProfile: (data: ProfileSetupFormData) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  // ... existing actions ...
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // ... existing state and actions ...

  setupProfile: async (data: ProfileSetupFormData) => {
    logger.info('profile_setup_started', {
      fullName: data.fullName,
      registrationNumber: data.medicalRegistrationNumber,
    });
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.setupProfile({
        full_name: data.fullName,
        medical_registration_number: data.medicalRegistrationNumber,
        qualification: data.qualification,
        specialization: data.specialization,
      });

      const userId = response.data.user.id;

      set({ user: response.data.user });

      logger.info('profile_setup_success', {
        userId,
        fullName: data.fullName,
        isProfileComplete: response.data.user.is_profile_complete,
      });
    } catch (error: any) {
      const errorMessage =
        error.detail?.message || error.message || 'Profile setup failed';
      const errorCode = error.detail?.error_code || error.error_code || 'UNKNOWN';

      logger.error('profile_setup_failed', {
        errorCode,
        errorMessage,
      });

      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCurrentUser: async () => {
    logger.debug('fetch_current_user_started', {});

    try {
      const response = await authApi.getCurrentUser();
      set({ user: response.data.user });

      logger.debug('fetch_current_user_success', {
        userId: response.data.user.id,
        isProfileComplete: response.data.user.is_profile_complete,
      });
    } catch (error: any) {
      logger.error('fetch_current_user_failed', {
        errorMessage: error.message,
      });
      // If token is invalid, clear auth state
      if (error.status === 401) {
        get().logout();
      }
    }
  },
}));
```

#### 3.2.5 Profile Setup Page

**File:** `src/frontend/src/pages/ProfileSetup.tsx`

```typescript
import React from 'react';
import ProfileSetupForm from '../components/forms/ProfileSetupForm';

const ProfileSetup: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">JivaDesk</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please provide your professional details to get started
          </p>
        </div>

        {/* Profile Setup Form */}
        <ProfileSetupForm />
      </div>
    </div>
  );
};

export default ProfileSetup;
```

#### 3.2.6 Profile Setup Form Component

**File:** `src/frontend/src/components/forms/ProfileSetupForm.tsx`

```typescript
import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { logger } from '../../utils/logger';
import {
  ProfileSetupFormData,
  ProfileSetupFormErrors,
  SPECIALIZATIONS,
} from '../../types/auth';

const ProfileSetupForm: React.FC = () => {
  const { setupProfile, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState<ProfileSetupFormData>({
    fullName: '',
    medicalRegistrationNumber: '',
    qualification: '',
    specialization: '',
  });

  const [customSpecialization, setCustomSpecialization] = useState('');
  const [errors, setErrors] = useState<ProfileSetupFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ProfileSetupFormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[A-Za-z\s.\-]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Full name can only contain letters, spaces, dots, and hyphens';
    }

    // Medical registration number validation
    if (!formData.medicalRegistrationNumber.trim()) {
      newErrors.medicalRegistrationNumber = 'Medical registration number is required';
    } else if (formData.medicalRegistrationNumber.length < 5) {
      newErrors.medicalRegistrationNumber = 'Registration number must be at least 5 characters';
    } else if (!/^[A-Za-z0-9\-/]+$/.test(formData.medicalRegistrationNumber)) {
      newErrors.medicalRegistrationNumber = 'Registration number can only contain letters, numbers, hyphens, and slashes';
    }

    // Qualification validation
    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualification is required';
    } else if (formData.qualification.length < 2) {
      newErrors.qualification = 'Qualification must be at least 2 characters';
    }

    // Specialization validation
    const finalSpecialization =
      formData.specialization === 'Other' ? customSpecialization : formData.specialization;
    if (!finalSpecialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name as keyof ProfileSetupFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleCustomSpecializationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomSpecialization(e.target.value);
    if (errors.specialization) {
      setErrors((prev) => ({ ...prev, specialization: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      logger.warn('profile_setup_validation_failed', {
        errorCount: Object.keys(errors).length,
      });
      return;
    }

    const finalSpecialization =
      formData.specialization === 'Other' ? customSpecialization : formData.specialization;

    try {
      await setupProfile({
        ...formData,
        specialization: finalSpecialization,
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* General Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Dr. Rajesh Kumar"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Medical Registration Number Field */}
        <div>
          <label
            htmlFor="medicalRegistrationNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Medical Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            id="medicalRegistrationNumber"
            name="medicalRegistrationNumber"
            type="text"
            value={formData.medicalRegistrationNumber}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.medicalRegistrationNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="MCI-12345 or KMC/12345"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your MCI or State Medical Council registration number
          </p>
          {errors.medicalRegistrationNumber && (
            <p className="mt-1 text-sm text-red-600">
              {errors.medicalRegistrationNumber}
            </p>
          )}
        </div>

        {/* Qualification Field */}
        <div>
          <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">
            Qualification <span className="text-red-500">*</span>
          </label>
          <input
            id="qualification"
            name="qualification"
            type="text"
            value={formData.qualification}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.qualification ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="MBBS, MD (General Medicine)"
          />
          {errors.qualification && (
            <p className="mt-1 text-sm text-red-600">{errors.qualification}</p>
          )}
        </div>

        {/* Specialization Field */}
        <div>
          <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
            Specialization <span className="text-red-500">*</span>
          </label>
          <select
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.specialization ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select specialization</option>
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
          {formData.specialization === 'Other' && (
            <input
              type="text"
              value={customSpecialization}
              onChange={handleCustomSpecializationChange}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your specialization"
            />
          )}
          {errors.specialization && (
            <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Saving...' : 'Complete Profile'}
      </button>
    </form>
  );
};

export default ProfileSetupForm;
```

#### 3.2.7 Routing Update

**File:** `src/frontend/src/App.tsx` (update routing)

```typescript
import React, { useEffect } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import { useAuthStore } from './stores/authStore';

function App() {
  const { user, accessToken, fetchCurrentUser } = useAuthStore();
  const path = window.location.pathname;

  // Check for existing session on app load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !user) {
      fetchCurrentUser();
    }
  }, []);

  // Routing logic with profile completion check
  if (path === '/register') {
    return <Register />;
  }

  if (path === '/login') {
    return <Login />;
  }

  if (path === '/profile-setup') {
    // Only allow access if logged in
    if (!accessToken && !localStorage.getItem('access_token')) {
      window.location.href = '/login';
      return null;
    }
    return <ProfileSetup />;
  }

  if (path === '/dashboard') {
    // Check authentication
    if (!accessToken && !localStorage.getItem('access_token')) {
      window.location.href = '/login';
      return null;
    }

    // Check profile completion
    if (user && !user.is_profile_complete) {
      window.location.href = '/profile-setup';
      return null;
    }

    // Dashboard component (placeholder for now)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.full_name || 'Doctor'}!</p>
        </div>
      </div>
    );
  }

  // Default: Landing page
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">JivaDesk</h1>
        <p className="text-gray-600 mb-8">Doctor Practice Management System</p>
        <div className="space-x-4">
          <a
            href="/register"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </a>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
```

---

## 4. Data Flow

### 4.1 Profile Setup Flow

```
+---------------------------------------------------------------------+
|                         Profile Setup Flow                           |
+---------------------------------------------------------------------+
|                                                                     |
|  User (logged in, is_profile_complete=false)                        |
|   |                                                                 |
|   | 1. Redirected to /profile-setup after login                     |
|   v                                                                 |
|  ProfileSetupForm (Frontend)                                        |
|   |                                                                 |
|   | 2. Enters full name, registration number, qualification,        |
|   |    specialization                                               |
|   |                                                                 |
|   | 3. Validates input locally, calls setupProfile()                |
|   v                                                                 |
|  authStore                                                          |
|   |                                                                 |
|   | 4. PUT /api/v1/auth/profile-setup (with JWT token)              |
|   v                                                                 |
|  Backend API (auth.py)                                              |
|   |                                                                 |
|   | 5. Validates token, extracts user_id                            |
|   v                                                                 |
|  get_current_user_id dependency                                     |
|   |                                                                 |
|   | 6. Validates request, calls AuthService                         |
|   v                                                                 |
|  AuthService                                                        |
|   |                                                                 |
|   | 7. Checks for duplicate registration number                     |
|   | 8. Updates user profile in database                             |
|   | 9. Sets is_profile_complete = true                              |
|   v                                                                 |
|  UserRepository -> Database                                         |
|   |                                                                 |
|   | 10. Returns updated user data                                   |
|   v                                                                 |
|  Frontend (updates state, redirects to /dashboard)                  |
|                                                                     |
+---------------------------------------------------------------------+
```

### 4.2 Sequence Diagram

```
+--------+  +-----------+  +---------+  +----------+  +----------+
|  User  |  | Frontend  |  | Backend |  | Database |  |   JWT    |
|        |  |           |  |   API   |  |          |  | Handler  |
+---+----+  +-----+-----+  +----+----+  +----+-----+  +----+-----+
    |             |             |            |             |
    | 1. Login   |             |            |             |
    |----------->|             |            |             |
    |             |             |            |             |
    | 2. is_profile_complete=false          |             |
    |<-----------|             |            |             |
    |             |             |            |             |
    | 3. Redirect to /profile-setup         |             |
    |<-----------|             |            |             |
    |             |             |            |             |
    | 4. Enter   |             |            |             |
    | profile    |             |            |             |
    | details    |             |            |             |
    |----------->|             |            |             |
    |             |             |            |             |
    |             | 5. PUT      |            |             |
    |             | /profile-setup           |             |
    |             | + Bearer token           |             |
    |             |------------>|            |             |
    |             |             |            |             |
    |             |             | 6. Validate|             |
    |             |             | token      |             |
    |             |             |------------------------>|
    |             |             |            |             |
    |             |             | 7. User ID |             |
    |             |             |<------------------------|
    |             |             |            |             |
    |             |             | 8. Check   |             |
    |             |             | duplicate  |             |
    |             |             | reg number |             |
    |             |             |----------->|             |
    |             |             |            |             |
    |             |             | 9. Update  |             |
    |             |             | profile    |             |
    |             |             |----------->|             |
    |             |             |            |             |
    |             |             | 10. User   |             |
    |             |             | data       |             |
    |             |             |<-----------|             |
    |             |             |            |             |
    |             | 11. Return  |            |             |
    |             | updated user|            |             |
    |             |<------------|            |             |
    |             |             |            |             |
    |             | 12. Update  |            |             |
    |             | state       |            |             |
    |             |             |            |             |
    | 13. Redirect to /dashboard|            |             |
    |<-----------|             |            |             |
    |             |             |            |             |
```

---

## 5. Configuration

### 5.1 Environment Variables

No new environment variables required. Uses existing JWT configuration.

### 5.2 Application Constants

**Backend:**

```python
# Profile field validation
FULL_NAME_MIN_LENGTH = 2
FULL_NAME_MAX_LENGTH = 100
REGISTRATION_NUMBER_MIN_LENGTH = 5
REGISTRATION_NUMBER_MAX_LENGTH = 20
QUALIFICATION_MIN_LENGTH = 2
QUALIFICATION_MAX_LENGTH = 100
SPECIALIZATION_MIN_LENGTH = 2
SPECIALIZATION_MAX_LENGTH = 100
```

**Frontend:**

```typescript
// Specialization options (from types/auth.ts)
export const SPECIALIZATIONS = [
  'General Physician',
  'Pediatrician',
  'Gynecologist',
  'Dermatologist',
  'Orthopedic',
  'ENT Specialist',
  'Ophthalmologist',
  'Cardiologist',
  'Neurologist',
  'Psychiatrist',
  'General Surgeon',
  'Other',
] as const;
```

---

## 6. Security Considerations

### 6.1 Data Protection

- [x] Endpoint requires valid JWT token
- [x] User can only update their own profile
- [x] Input sanitization for SQL injection prevention
- [x] All API communication over HTTPS only
- [x] No sensitive data in logs (only user_id, not full details)

### 6.2 Input Validation

| Field                        | Validation Rules                                              |
| ---------------------------- | ------------------------------------------------------------- |
| full_name                    | 2-100 chars, letters/spaces/dots/hyphens only                 |
| medical_registration_number  | 5-20 chars, alphanumeric/hyphens/slashes, unique              |
| qualification                | 2-100 chars                                                   |
| specialization               | 2-100 chars, from list or custom                              |

### 6.3 Authorization

| Check                    | Implementation                                         |
| ------------------------ | ------------------------------------------------------ |
| Token validity           | JWT signature verification                             |
| Token expiry             | Check exp claim                                        |
| User ownership           | User can only modify their own profile                 |

---

## 7. Error Handling

### 7.1 Error Cases

| Error                        | Detection              | Recovery Action              | User Message                                    |
| ---------------------------- | ---------------------- | ---------------------------- | ----------------------------------------------- |
| Empty required field         | Client validation      | Show inline error            | "[Field] is required"                           |
| Invalid format               | Client validation      | Show inline error            | "[Field] format is invalid"                     |
| Invalid/expired token        | Server response 401    | Redirect to login            | "Session expired. Please login again."          |
| Duplicate registration no.   | Server response 409    | Show error                   | "This registration number is already in use"    |
| Network error                | Fetch failure          | Show retry option            | "Network error. Please try again."              |

---

## 8. Testing Strategy

### 8.1 Unit Tests

| Component                | Test File                              | Coverage Target |
| ------------------------ | -------------------------------------- | --------------- |
| AuthService (profile)    | `tests/services/test_auth_service.py`  | 90%             |
| Profile API              | `tests/api/test_auth.py`               | 90%             |
| ProfileSetupForm         | `ProfileSetupForm.test.tsx`            | 85%             |
| authStore (profile)      | `authStore.test.ts`                    | 85%             |

### 8.2 Integration Tests

| Scenario                               | Test Description                                              |
| -------------------------------------- | ------------------------------------------------------------- |
| Successful profile setup               | Valid data -> profile saved -> redirected                     |
| Missing required field                 | Empty field -> validation error                               |
| Duplicate registration number          | Existing number -> 409 error                                  |
| Invalid token                          | Expired/invalid token -> 401 error                            |
| Redirect when incomplete               | Navigate to /dashboard -> redirected to /profile-setup        |
| Access after completion                | Navigate to /dashboard -> dashboard loads                     |

---

## 9. Implementation Checklist

### 9.1 Backend

- [ ] Database migration created (`alembic/versions/xxx_add_profile_fields.py`)
- [ ] User model updated (`database/models/user.py`)
- [ ] Profile schemas defined (`schemas/auth.py`)
- [ ] User repository methods added (`database/repositories/user_repository.py`)
- [ ] Profile setup service method added (`services/auth_service.py`)
- [ ] Profile setup API endpoint implemented (`api/auth.py`)
- [ ] Get current user API endpoint implemented (`api/auth.py`)
- [ ] JWT authentication dependency created
- [ ] Unit tests written
- [ ] Integration tests written

### 9.2 Frontend

- [ ] Profile types added (`types/auth.ts`)
- [ ] API service methods added (`services/auth.ts`)
- [ ] Store actions added (`stores/authStore.ts`)
- [ ] ProfileSetup page created (`pages/ProfileSetup.tsx`)
- [ ] ProfileSetupForm component created (`components/forms/ProfileSetupForm.tsx`)
- [ ] Routing updated with profile completion check (`App.tsx`)
- [ ] Form validation implemented
- [ ] Error handling implemented
- [ ] Loading states handled

---

## 10. Revision History

| Version | Date       | Author        | Changes       |
| ------- | ---------- | ------------- | ------------- |
| 1.0     | 2026-01-23 | JivaDesk Team | Initial draft |

---

**End of Design Specification**
