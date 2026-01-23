# Design Specification: Doctor Registration

**Design ID:** DES-001
**Feature ID:** AUTH-001 ([Feature Specification](../features/AUTH-001_doctor_registration.md))
**Version:** 2.0
**Status:** Draft
**Created:** 2026-01-22
**Last Updated:** 2026-01-22
**Author:** JivaDesk Team

---

## 1. Overview

This design document provides the technical implementation details for the Doctor Registration feature (AUTH-001). The feature enables doctors to create a JivaDesk account using email, phone number, and password. The account is created immediately without verification during registration. 

**Key Design Decision:** For cost optimization and improved user experience, verification codes are sent to both email and phone during the login process (AUTH-002) rather than during registration. This provides two-factor authentication while minimizing operational costs and registration friction.

**Scope:**

- User registration workflow with email, phone, and password
- Password validation and hashing
- JWT token generation for authenticated session  
- Database schema for users table
- API endpoint for registration
- Frontend registration UI with validation
- Immediate account creation and login

**Out of Scope:**

- Verification codes during registration (moved to AUTH-002)
- Email/SMS sending during registration (moved to AUTH-002)
- Social login (Google, Facebook)
- Multi-clinic registration
- Admin/staff registration
- International phone numbers (India only for MVP)

**Related Documents:**

- Feature Spec: [AUTH-001_doctor_registration.md](../features/AUTH-001_doctor_registration.md)
- API Spec: [API_SPEC.md](../API_SPEC.md)
- Database Schema: [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)

---

## 2. Architecture Overview

### 2.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Doctor Registration System                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────────┐  │
│  │   Frontend   │      │   Backend    │      │    Database      │  │
│  │  (React/TS)  │◄────►│  (FastAPI)   │◄────►│   (PostgreSQL)   │  │
│  └──────────────┘      └──────────────┘      └──────────────────┘  │
│                                                                     │
│  Note: Email & SMS services used during login (AUTH-002)           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Impact

| Component       | Files Modified | New Files                                                           | Deleted Files |
| --------------- | -------------- | ------------------------------------------------------------------- | ------------- |
| **Backend API** | `main.py`      | `api/auth.py`<br>`services/auth_service.py`<br>`schemas/auth.py`<br>`database/models/user.py`<br>`database/repositories/user_repository.py`<br>`utils/password.py`<br>`utils/jwt.py` | -             |
| **Frontend**    | `App.tsx`      | `pages/Register.tsx`<br>`components/forms/RegistrationForm.tsx`<br>`services/auth.ts`<br>`stores/authStore.ts`<br>`types/auth.ts` | -             |
| **Database**    | -              | `alembic/versions/001_create_users_table.py`               | -             |

---

## 3. Detailed Design

### 3.1 Backend API

#### 3.1.1 Database Schema Changes

**New Table: users**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    is_profile_complete BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    terms_accepted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_phone ON users(phone);
CREATE INDEX ix_users_created_at ON users(created_at);

-- Constraints
ALTER TABLE users ADD CONSTRAINT check_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
ALTER TABLE users ADD CONSTRAINT check_phone_format 
    CHECK (phone ~ '^[0-9]{10}$');

-- Note: is_email_verified and is_phone_verified will be set to true
-- during the login verification process (AUTH-002)
```

**Note on Verification:**

Verification codes for email and phone will be implemented in AUTH-002 (Login). A `verification_codes` table will be created in that feature to store verification codes sent during login for two-factor authentication.

#### 3.1.2 API Endpoints

**Endpoint: POST /api/v1/auth/register**

| Attribute     | Value                                          |
| ------------- | ---------------------------------------------- |
| Method        | POST                                           |
| Path          | /api/v1/auth/register                          |
| Auth Required | No                                             |
| Permissions   | Public                                         |
| Rate Limit    | 5 requests per 15 minutes per IP               |
| Description   | Create new user account and return JWT token   |

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "string (required) - Valid email address",
  "phone": "string (required) - 10-digit phone number without +91",
  "password": "string (required) - Min 8 chars, 1 uppercase, 1 number",
  "confirm_password": "string (required) - Must match password",
  "terms_accepted": "boolean (required) - Must be true"
}
```

**Response (201 Created):**

```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "usr_xyz789",
      "email": "doctor@example.com",
      "phone": "9876543210",
      "is_profile_complete": false,
      "is_email_verified": false,
      "is_phone_verified": false
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "token_type": "bearer",
      "expires_in": 3600
    }
  }
}
```

**Error Responses:**

| Code | Condition                    | Response                                                                                                                 |
| ---- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 400  | Invalid input                | `{"status": "error", "message": "Validation failed", "errors": [{"field": "email", "message": "Invalid email format"}]}` |
| 400  | Passwords don't match        | `{"status": "error", "message": "Passwords do not match", "error_code": "PASSWORD_MISMATCH"}`                            |
| 400  | Weak password                | `{"status": "error", "message": "Password does not meet requirements", "error_code": "WEAK_PASSWORD"}`                   |
| 409  | Email already registered     | `{"status": "error", "message": "Email already registered", "error_code": "EMAIL_EXISTS"}`                               |
| 409  | Phone already registered     | `{"status": "error", "message": "Phone number already registered", "error_code": "PHONE_EXISTS"}`                        |
| 429  | Rate limit exceeded          | `{"status": "error", "message": "Too many registration attempts. Please try again later."}`                              |
| 500  | Server error                 | `{"status": "error", "message": "Internal server error"}`                                                                |

---

**Endpoint: GET /api/v1/auth/check-email**

| Attribute     | Value                               |
| ------------- | ----------------------------------- |
| Method        | GET                                 |
| Path          | /api/v1/auth/check-email            |
| Auth Required | No                                  |
| Permissions   | Public                              |
| Rate Limit    | 20 requests per minute              |
| Description   | Check if email is available         |

**Query Parameters:**

```
email: string (required) - Email address to check
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "available": true
  }
}
```

---

**Endpoint: GET /api/v1/auth/check-phone**

| Attribute     | Value                               |
| ------------- | ----------------------------------- |
| Method        | GET                                 |
| Path          | /api/v1/auth/check-phone            |
| Auth Required | No                                  |
| Permissions   | Public                              |
| Rate Limit    | 20 requests per minute              |
| Description   | Check if phone number is available  |

**Query Parameters:**

```
phone: string (required) - 10-digit phone number to check
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "available": true
  }
}
```

#### 3.1.3 Service Layer

**File:** `src/backend/app/services/auth_service.py`

```python
from typing import Optional, Tuple
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
            raise ValueError("Email already registered")

        # Check phone uniqueness
        if not await self.check_phone_available(data.phone):
            raise ValueError("Phone number already registered")

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
```

**File:** `src/backend/app/utils/password.py`

```python
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
```

**File:** `src/backend/app/utils/jwt.py`

```python
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

    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_ttl = 3600  # 1 hour
        self.refresh_token_ttl = 2592000  # 30 days

    def create_access_token(self, user_id: UUID) -> str:
        """
        Create JWT access token.

        Args:
            user_id: User ID to encode in token

        Returns:
            Encoded JWT token
        """
        payload = {
            "user_id": str(user_id),
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
```

---

### 3.2 Frontend

#### 3.2.1 Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                Registration Flow Components                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    RegisterPage                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │            RegistrationForm                      │    │    │
│  │  │  ┌──────────────────────────────────────────┐   │    │    │
│  │  │  │  EmailInput (with availability check)    │   │    │    │
│  │  │  └──────────────────────────────────────────┘   │    │    │
│  │  │  ┌──────────────────────────────────────────┐   │    │    │
│  │  │  │  PhoneInput (with availability check)    │   │    │    │
│  │  │  └──────────────────────────────────────────┘   │    │    │
│  │  │  ┌──────────────────────────────────────────┐   │    │    │
│  │  │  │  PasswordInput (with strength meter)     │   │    │    │
│  │  │  └──────────────────────────────────────────┘   │    │    │
│  │  │  ┌──────────────────────────────────────────┐   │    │    │
│  │  │  │  ConfirmPasswordInput                    │   │    │    │
│  │  │  └──────────────────────────────────────────┘   │    │    │
│  │  │  ┌──────────────────────────────────────────┐   │    │    │
│  │  │  │  TermsCheckbox                           │   │    │    │
│  │  │  └──────────────────────────────────────────┘   │    │    │
│  │  └─────────────────────────────────────────────┘    │    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 State Management

**Store: authStore**

**File:** `src/frontend/src/stores/authStore.ts`

```typescript
import { create } from 'zustand';
import { authApi } from '../services/auth';

interface User {
  id: string;
  email: string;
  phone: string;
  isProfileComplete: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  register: (data: RegisterData) => Promise<void>;
  checkEmailAvailable: (email: string) => Promise<boolean>;
  checkPhoneAvailable: (phone: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register({
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirm_password: data.confirmPassword,
        terms_accepted: data.termsAccepted,
      });
      
      set({
        user: response.data.user,
        accessToken: response.data.token.access_token,
        refreshToken: response.data.token.refresh_token,
      });
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', response.data.token.access_token);
      localStorage.setItem('refresh_token', response.data.token.refresh_token);
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Registration failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  checkEmailAvailable: async (email: string) => {
    try {
      const response = await authApi.checkEmail(email);
      return response.data.available;
    } catch (error) {
      return false;
    }
  },

  checkPhoneAvailable: async (phone: string) => {
    try {
      const response = await authApi.checkPhone(phone);
      return response.data.available;
    } catch (error) {
      return false;
    }
  },

  logout: () => {
    set({ user: null, accessToken: null, refreshToken: null });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  clearError: () => set({ error: null }),
}));
```

---

## 4. Data Flow

### 4.1 Registration Flow

```
┌───────────────────────────────────────────────────────────────────┐
│                    Registration Flow                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User                                                             │
│   │                                                               │
│   │ 1. Enters email, phone, password, confirms terms              │
│   ▼                                                               │
│  RegistrationForm (Frontend)                                      │
│   │                                                               │
│   │ 2. Validates input locally, calls register()                  │
│   ▼                                                               │
│  authStore                                                        │
│   │                                                               │
│   │ 3. POST /api/v1/auth/register                                 │
│   ▼                                                               │
│  Backend API (auth.py)                                            │
│   │                                                               │
│   │ 4. Validates data, checks email/phone uniqueness              │
│   ▼                                                               │
│  AuthService                                                      │
│   │                                                               │
│   │ 5. Hashes password, creates user record                       │
│   ▼                                                               │
│  Database (users table)                                           │
│   │                                                               │
│   │ 6. Generates JWT tokens                                       │
│   ▼                                                               │
│  JWTHandler                                                       │
│   │                                                               │
│   │ 7. Returns user data and tokens                               │
│   ▼                                                               │
│  Frontend (stores tokens, redirects to profile setup)             │
│                                                                   │
│  Note: On next login, verification codes will be sent to          │
│        both email and phone (AUTH-002)                            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 4.2 Sequence Diagram

```
┌──────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐
│ User │  │ Frontend │  │ Backend │  │ Database │  │   JWT    │
│      │  │          │  │   API   │  │          │  │ Handler  │
└──┬───┘  └────┬─────┘  └────┬────┘  └────┬─────┘  └────┬─────┘
   │           │              │            │             │
   │ 1. Fill   │              │            │             │
   │ form      │              │            │             │
   │──────────>│              │            │             │
   │           │              │            │             │
   │           │ 2. POST      │            │             │
   │           │ /register    │            │             │
   │           │─────────────>│            │             │
   │           │              │            │             │
   │           │              │ 3. Check   │             │
   │           │              │ uniqueness │             │
   │           │              │───────────>│             │
   │           │              │            │             │
   │           │              │ 4. OK      │             │
   │           │              │<───────────│             │
   │           │              │            │             │
   │           │              │ 5. Hash    │             │
   │           │              │ password   │             │
   │           │              │            │             │
   │           │              │ 6. Create  │             │
   │           │              │ user       │             │
   │           │              │───────────>│             │
   │           │              │            │             │
   │           │              │ 7. User    │             │
   │           │              │ created    │             │
   │           │              │<───────────│             │
   │           │              │            │             │
   │           │              │ 8. Generate│             │
   │           │              │ tokens     │             │
   │           │              │────────────────────────>│
   │           │              │            │             │
   │           │              │ 9. Tokens  │             │
   │           │              │<────────────────────────│
   │           │              │            │             │
   │           │ 10. Return   │            │             │
   │           │ user + tokens│            │             │
   │           │<─────────────│            │             │
   │           │              │            │             │
   │ 11. Login │              │            │             │
   │ success   │              │            │             │
   │<──────────│              │            │             │
   │           │              │            │             │
```

---

## 5. Configuration

### 5.1 Environment Variables

| Variable                | Default             | Description                          | Required |
| ----------------------- | ------------------- | ------------------------------------ | -------- |
| `JWT_SECRET_KEY`        | -                   | Secret key for JWT token signing     | Yes      |
| `JWT_ALGORITHM`         | `HS256`             | Algorithm for JWT encoding           | No       |
| `JWT_ACCESS_TOKEN_TTL`  | `3600`              | Access token expiry in seconds (1h)  | No       |
| `JWT_REFRESH_TOKEN_TTL` | `2592000`           | Refresh token expiry in seconds (30d) | No       |
| `BCRYPT_COST_FACTOR`    | `12`                | Bcrypt hashing cost factor           | No       |

### 5.2 Application Constants

**Backend:**

```python
# Password Configuration
PASSWORD_MIN_LENGTH = 8
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_NUMBER = True
BCRYPT_COST_FACTOR = 12

# JWT Configuration
JWT_ACCESS_TOKEN_TTL = 3600  # 1 hour
JWT_REFRESH_TOKEN_TTL = 2592000  # 30 days

# Rate Limiting
REGISTRATION_RATE_LIMIT = "5 per 15 minutes"
EMAIL_CHECK_RATE_LIMIT = "20 per minute"
PHONE_CHECK_RATE_LIMIT = "20 per minute"
```

**Frontend:**

```typescript
// Validation Configuration
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format',
  },
  phone: {
    pattern: /^[0-9]{10}$/,
    message: 'Phone must be 10 digits',
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    message: 'Password must be at least 8 characters with 1 uppercase and 1 number',
  },
};
```

---

## 6. Security Considerations

### 6.1 Data Protection

- [x] Passwords hashed using bcrypt (cost factor 12)
- [x] All API communication over HTTPS only
- [x] JWT tokens include expiry timestamps
- [x] No sensitive data in JWT payload
- [x] Database queries use parameterized statements (SQL injection prevention)
- [x] Email and phone verification at login (AUTH-002) provides 2FA

### 6.2 Input Validation

| Field             | Validation Rules                                                                  |
| ----------------- | --------------------------------------------------------------------------------- |
| email             | Format: RFC 5322 email regex, Max length: 255, Uniqueness check                  |
| phone             | Format: Exactly 10 digits, Allowed: 0-9, Uniqueness check                        |
| password          | Min length: 8, Required: 1 uppercase, 1 number, Max length: 128                  |
| confirm_password  | Must match password                                                               |
| terms_accepted    | Type: boolean, Must be true                                                       |

### 6.3 Attack Prevention

| Attack Type           | Prevention Mechanism                                 |
| --------------------- | ---------------------------------------------------- |
| Brute force           | Rate limiting (5 attempts per 15 minutes)            |
| SQL injection         | Parameterized queries + ORM (SQLAlchemy)             |
| XSS                   | Input sanitization + Content Security Policy         |
| Timing attacks        | Constant-time comparison for password verification   |
| Enumeration attacks   | Generic error messages (don't reveal if email exists)|

---

## 7. Testing Strategy

### 7.1 Unit Tests

| Component                | Test File                                  | Coverage Target |
| ------------------------ | ------------------------------------------ | --------------- |
| AuthService              | `tests/services/test_auth_service.py`      | 90%             |
| PasswordHasher           | `tests/utils/test_password.py`             | 95%             |
| JWTHandler               | `tests/utils/test_jwt.py`                  | 95%             |
| UserRepository           | `tests/repositories/test_user_repository.py` | 85%           |
| RegistrationForm         | `src/components/forms/RegistrationForm.test.tsx` | 85%       |
| authStore                | `src/stores/authStore.test.ts`             | 85%             |

### 7.2 Integration Tests

| Scenario                              | Test Description                                                  |
| ------------------------------------- | ----------------------------------------------------------------- |
| Complete registration flow            | Register → Account created → Logged in                            |
| Email uniqueness enforcement          | Attempt to register with existing email, verify error             |
| Phone uniqueness enforcement          | Attempt to register with existing phone, verify error             |
| Password validation                   | Test various password combinations for strength requirements      |
| Rate limiting enforcement             | Make 6 registration requests in 15 minutes, verify 6th is blocked |
| Invalid input validation              | Submit invalid email/phone/password, verify validation errors     |
| Concurrent registration attempts      | Simulate 2 users registering with same email, verify one fails    |

---

## 8. Migration Strategy

### 8.1 Database Migration

**Migration File:** `alembic/versions/001_create_users_table.py`

```python
"""Create users table

Revision ID: 001
Revises: 
Create Date: 2026-01-22
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('phone', sa.String(15), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('is_email_verified', sa.Boolean(), default=False),
        sa.Column('is_phone_verified', sa.Boolean(), default=False),
        sa.Column('is_profile_complete', sa.Boolean(), default=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('terms_accepted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_phone', 'users', ['phone'])
    op.create_index('ix_users_created_at', 'users', ['created_at'])


def downgrade():
    op.drop_index('ix_users_created_at', 'users')
    op.drop_index('ix_users_phone', 'users')
    op.drop_index('ix_users_email', 'users')
    op.drop_table('users')
```

---

## 9. Implementation Checklist

### 9.1 Backend

- [x] Database migration created (`001_create_users_table.py`)
- [x] User model defined (`database/models/user.py`)
- [x] User repository implemented (`database/repositories/user_repository.py`)
- [x] Auth service implemented (`services/auth_service.py`)
- [x] Password hasher utility (`utils/password.py`)
- [x] JWT handler utility (`utils/jwt.py`)
- [x] Auth schemas defined (`schemas/auth.py`)
- [x] Auth API endpoints implemented (`api/auth.py`)
- [ ] Rate limiting configured
- [x] Input validation added
- [x] Error handling implemented
- [ ] Unit tests written (>90% coverage)
- [ ] Integration tests written
- [ ] API documentation updated

### 9.2 Frontend

- [x] Register page created (`pages/Register.tsx`)
- [x] Registration form component (`components/forms/RegistrationForm.tsx`)
- [x] Auth store implemented (`stores/authStore.ts`)
- [x] Auth API integration (`services/auth.ts`)
- [x] Auth types defined (`types/auth.ts`)
- [x] Routing configured (App.tsx)
- [x] Error handling implemented
- [x] Loading states handled
- [x] Form validation added
- [x] Password strength indicator
- [ ] Unit tests written (>85% coverage)
- [ ] E2E tests written
- [ ] Accessibility verified (WCAG 2.1 AA)
- [ ] Mobile responsive design verified

---

## 10. Revision History

| Version | Date       | Author        | Changes                                  |
| ------- | ---------- | ------------- | ---------------------------------------- |
| 1.0     | 2026-01-22 | JivaDesk Team | Initial design document                  |
| 2.0     | 2026-01-22 | JivaDesk Team | Removed OTP, simplified to direct registration |

---

**End of Design Specification**
