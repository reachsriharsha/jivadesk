# Design Specification: Doctor Login

**Design ID:** DES-002
**Feature ID:** AUTH-002 ([Feature Specification](../features/AUTH-002_doctor_login.md))
**Version:** 1.0
**Status:** Draft
**Created:** 2026-01-23
**Last Updated:** 2026-01-23
**Author:** JivaDesk Team

---

## 1. Overview

This design document provides the technical implementation details for the Doctor Login feature (AUTH-002). The feature enables registered doctors to authenticate using their email and password to access the JivaDesk application.

**Scope:**

- Login workflow with email and password
- Password verification using bcrypt
- JWT token generation for authenticated session
- Frontend login UI with validation
- Session persistence using localStorage

**Out of Scope:**

- Two-factor authentication (verification codes)
- Social login (Google, Facebook)
- Phone number login
- "Remember me" extended session
- Account lockout mechanism

**Related Documents:**

- Feature Spec: [AUTH-002_doctor_login.md](../features/AUTH-002_doctor_login.md)
- Registration Design: [DES-001_doctor_registration.md](./DES-001_doctor_registration.md)
- API Spec: [API_SPEC.md](../API_SPEC.md)
- Database Schema: [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)

---

## 2. Architecture Overview

### 2.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Doctor Login System                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────────┐  │
│  │   Frontend   │      │   Backend    │      │    Database      │  │
│  │  (React/TS)  │◄────►│  (FastAPI)   │◄────►│   (PostgreSQL)   │  │
│  └──────────────┘      └──────────────┘      └──────────────────┘  │
│         │                     │                                     │
│         │                     │                                     │
│         ▼                     ▼                                     │
│  ┌──────────────┐      ┌──────────────┐                            │
│  │ localStorage │      │  JWT Utils   │                            │
│  │   (tokens)   │      │  (PyJWT)     │                            │
│  └──────────────┘      └──────────────┘                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Impact

| Component       | Files Modified                                    | New Files                                                     | Deleted Files |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------- | ------------- |
| **Backend API** | `api/auth.py`<br>`services/auth_service.py`       | -                                                             | -             |
| **Frontend**    | `App.tsx`<br>`stores/authStore.ts`<br>`services/auth.ts`<br>`types/auth.ts` | `pages/Login.tsx`<br>`components/forms/LoginForm.tsx` | -             |
| **Database**    | -                                                 | -                                                             | -             |

---

## 3. Detailed Design

### 3.1 Backend API

#### 3.1.1 Database Schema

No changes required. Uses existing `users` table from AUTH-001:

```sql
-- Existing users table (created in AUTH-001)
-- Relevant columns for login:
-- - id: UUID (primary key)
-- - email: VARCHAR(255) UNIQUE NOT NULL
-- - password_hash: VARCHAR(255) NOT NULL
-- - is_active: BOOLEAN DEFAULT true
-- - is_profile_complete: BOOLEAN DEFAULT false
```

#### 3.1.2 API Endpoints

**Endpoint: POST /api/v1/auth/login**

| Attribute     | Value                                |
| ------------- | ------------------------------------ |
| Method        | POST                                 |
| Path          | /api/v1/auth/login                   |
| Auth Required | No                                   |
| Permissions   | Public                               |
| Rate Limit    | 5 requests per 15 minutes per IP     |
| Description   | Authenticate user and return tokens  |

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "string (required) - Registered email address",
  "password": "string (required) - User password"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Login successful",
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

| Code | Condition              | Response                                                                              |
| ---- | ---------------------- | ------------------------------------------------------------------------------------- |
| 400  | Invalid input          | `{"status": "error", "message": "Email and password are required"}`                   |
| 401  | Invalid credentials    | `{"status": "error", "message": "Invalid email or password", "error_code": "INVALID_CREDENTIALS"}` |
| 403  | Account deactivated    | `{"status": "error", "message": "Account is deactivated", "error_code": "ACCOUNT_DEACTIVATED"}` |
| 429  | Rate limit exceeded    | `{"status": "error", "message": "Too many login attempts. Please try again later."}` |
| 500  | Server error           | `{"status": "error", "message": "Internal server error"}`                             |

#### 3.1.3 Schema Definitions

**File:** `src/backend/app/schemas/auth.py` (add to existing)

```python
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "doctor@example.com",
                "password": "SecurePass123"
            }
        }


class LoginResponse(BaseModel):
    """Response schema for successful login."""
    status: str
    message: str
    data: dict

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "message": "Login successful",
                "data": {
                    "user": {
                        "id": "uuid",
                        "email": "doctor@example.com",
                        "phone": "9876543210",
                        "is_profile_complete": False
                    },
                    "token": {
                        "access_token": "eyJ...",
                        "refresh_token": "eyJ...",
                        "token_type": "bearer",
                        "expires_in": 3600
                    }
                }
            }
        }
```

#### 3.1.4 Service Layer

**File:** `src/backend/app/services/auth_service.py` (add method to existing AuthService)

```python
from typing import Optional, Tuple
from app.database.models.user import User


class AuthService:
    # ... existing methods from AUTH-001 ...

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
            raise ValueError("Invalid email or password")

        # Check if account is active
        if not user.is_active:
            raise ValueError("Account is deactivated")

        # Verify password
        if not self.password_hasher.verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password")

        # Generate JWT tokens
        access_token = self.jwt_handler.create_access_token(user.id)
        refresh_token = self.jwt_handler.create_refresh_token(user.id)

        return user, access_token, refresh_token
```

#### 3.1.5 API Router

**File:** `src/backend/app/api/auth.py` (add endpoint to existing router)

```python
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import LoginRequest, LoginResponse
from app.services.auth_service import AuthService
from app.database.connection import get_db


router = APIRouter(prefix="/auth", tags=["Authentication"])


# ... existing endpoints from AUTH-001 ...


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Authenticate user with email and password.

    Returns JWT tokens for session management.
    """
    try:
        user, access_token, refresh_token = await auth_service.login_user(
            email=request.email,
            password=request.password
        )

        return {
            "status": "success",
            "message": "Login successful",
            "data": {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "phone": user.phone,
                    "is_profile_complete": user.is_profile_complete,
                    "is_email_verified": user.is_email_verified,
                    "is_phone_verified": user.is_phone_verified
                },
                "token": {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "token_type": "bearer",
                    "expires_in": 3600
                }
            }
        }
    except ValueError as e:
        error_message = str(e)
        if "deactivated" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "status": "error",
                    "message": "Account is deactivated. Please contact support.",
                    "error_code": "ACCOUNT_DEACTIVATED"
                }
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "status": "error",
                "message": "Invalid email or password",
                "error_code": "INVALID_CREDENTIALS"
            }
        )
```

---

### 3.2 Frontend

#### 3.2.1 Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Login Flow Components                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      LoginPage                           │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │                 LoginForm                        │    │    │
│  │  │  ┌──────────────────────────────────────────┐   │    │    │
│  │  │  │  EmailInput                              │   │    │    │
│  │  │  └──────────────────────────────────────────┘   │    │    │
│  │  │  ┌──────────────────────────────────────────┐   │    │    │
│  │  │  │  PasswordInput (with visibility toggle)  │   │    │    │
│  │  │  └──────────────────────────────────────────┘   │    │    │
│  │  │  ┌──────────────────────────────────────────┐   │    │    │
│  │  │  │  ForgotPasswordLink                      │   │    │    │
│  │  │  └──────────────────────────────────────────┘   │    │    │
│  │  │  ┌──────────────────────────────────────────┐   │    │    │
│  │  │  │  SubmitButton                            │   │    │    │
│  │  │  └──────────────────────────────────────────┘   │    │    │
│  │  │  ┌──────────────────────────────────────────┐   │    │    │
│  │  │  │  RegisterLink                            │   │    │    │
│  │  │  └──────────────────────────────────────────┘   │    │    │
│  │  └─────────────────────────────────────────────┘    │    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 Type Definitions

**File:** `src/frontend/src/types/auth.ts` (add to existing)

```typescript
// Add to existing auth types

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: TokenResponse;
  };
}
```

#### 3.2.3 API Service

**File:** `src/frontend/src/services/auth.ts` (add to existing)

```typescript
// Add to existing auth service

export const authApi = {
  // ... existing methods ...

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'Login failed');
    }

    return response.json();
  },
};
```

#### 3.2.4 State Management

**File:** `src/frontend/src/stores/authStore.ts` (add method to existing store)

```typescript
// Add to existing authStore

interface AuthState {
  // ... existing state ...

  // Actions
  login: (data: LoginFormData) => Promise<void>;
  // ... existing actions ...
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // ... existing state and actions ...

  login: async (data: LoginFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
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
      set({ error: error.message || 'Login failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

#### 3.2.5 Login Page Component

**File:** `src/frontend/src/pages/Login.tsx`

```typescript
import React from 'react';
import LoginForm from '../components/forms/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">JivaDesk</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

#### 3.2.6 Login Form Component

**File:** `src/frontend/src/components/forms/LoginForm.tsx`

```typescript
import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { validateEmail } from '../../utils/validation';
import { LoginFormData, LoginFormErrors } from '../../types/auth';

const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);

      // Get user to check profile completion
      const user = useAuthStore.getState().user;

      // Redirect based on profile completion
      if (user?.is_profile_complete) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/profile-setup';
      }
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
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="doctor@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          <div className="mt-1 text-right">
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot Password?
            </a>
          </div>
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
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
```

#### 3.2.7 Routing Update

**File:** `src/frontend/src/App.tsx` (update routing)

```typescript
// Add Login route to existing App.tsx

import Login from './pages/Login';

// In routing logic:
// path: '/login' -> <Login />
// path: '/' -> redirect to /login if not authenticated, else /dashboard
```

---

## 4. Data Flow

### 4.1 Login Flow

```
┌───────────────────────────────────────────────────────────────────┐
│                         Login Flow                                 │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User                                                             │
│   │                                                               │
│   │ 1. Enters email and password                                  │
│   ▼                                                               │
│  LoginForm (Frontend)                                             │
│   │                                                               │
│   │ 2. Validates input locally, calls login()                     │
│   ▼                                                               │
│  authStore                                                        │
│   │                                                               │
│   │ 3. POST /api/v1/auth/login                                    │
│   ▼                                                               │
│  Backend API (auth.py)                                            │
│   │                                                               │
│   │ 4. Validates request, calls AuthService                       │
│   ▼                                                               │
│  AuthService                                                      │
│   │                                                               │
│   │ 5. Gets user by email from database                           │
│   ▼                                                               │
│  Database (users table)                                           │
│   │                                                               │
│   │ 6. Verifies password with bcrypt                              │
│   ▼                                                               │
│  PasswordHasher                                                   │
│   │                                                               │
│   │ 7. Generates JWT tokens                                       │
│   ▼                                                               │
│  JWTHandler                                                       │
│   │                                                               │
│   │ 8. Returns user data and tokens                               │
│   ▼                                                               │
│  Frontend (stores tokens, redirects)                              │
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
   │ 1. Enter  │              │            │             │
   │ credentials│             │            │             │
   │──────────>│              │            │             │
   │           │              │            │             │
   │           │ 2. POST      │            │             │
   │           │ /login       │            │             │
   │           │─────────────>│            │             │
   │           │              │            │             │
   │           │              │ 3. Get     │             │
   │           │              │ user       │             │
   │           │              │───────────>│             │
   │           │              │            │             │
   │           │              │ 4. User    │             │
   │           │              │ data       │             │
   │           │              │<───────────│             │
   │           │              │            │             │
   │           │              │ 5. Verify  │             │
   │           │              │ password   │             │
   │           │              │ (bcrypt)   │             │
   │           │              │            │             │
   │           │              │ 6. Generate│             │
   │           │              │ tokens     │             │
   │           │              │────────────────────────>│
   │           │              │            │             │
   │           │              │ 7. Tokens  │             │
   │           │              │<────────────────────────│
   │           │              │            │             │
   │           │ 8. Return    │            │             │
   │           │ user + tokens│            │             │
   │           │<─────────────│            │             │
   │           │              │            │             │
   │           │ 9. Store     │            │             │
   │           │ tokens       │            │             │
   │           │ (localStorage)            │             │
   │           │              │            │             │
   │ 10. Redirect             │            │             │
   │ to dashboard             │            │             │
   │<──────────│              │            │             │
   │           │              │            │             │
```

---

## 5. Configuration

### 5.1 Environment Variables

No new environment variables required. Uses existing JWT configuration from AUTH-001:

| Variable                | Default   | Description                          | Required |
| ----------------------- | --------- | ------------------------------------ | -------- |
| `JWT_SECRET_KEY`        | -         | Secret key for JWT token signing     | Yes      |
| `JWT_ALGORITHM`         | `HS256`   | Algorithm for JWT encoding           | No       |
| `JWT_ACCESS_TOKEN_TTL`  | `3600`    | Access token expiry in seconds (1h)  | No       |
| `JWT_REFRESH_TOKEN_TTL` | `2592000` | Refresh token expiry in seconds (30d)| No       |

### 5.2 Application Constants

**Backend:**

```python
# Rate Limiting
LOGIN_RATE_LIMIT = "5 per 15 minutes"
```

**Frontend:**

```typescript
// Validation Configuration (reuse from registration)
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format',
  },
};
```

---

## 6. Security Considerations

### 6.1 Data Protection

- [x] Passwords verified using bcrypt constant-time comparison
- [x] Generic error messages (don't reveal if email exists)
- [x] All API communication over HTTPS only
- [x] JWT tokens include expiry timestamps
- [x] No sensitive data in logs

### 6.2 Input Validation

| Field    | Validation Rules                          |
| -------- | ----------------------------------------- |
| email    | Format: Email regex, Max length: 255      |
| password | Required, no format validation on login   |

### 6.3 Attack Prevention

| Attack Type           | Prevention Mechanism                                   |
| --------------------- | ------------------------------------------------------ |
| Brute force           | Rate limiting (5 attempts per 15 minutes)              |
| Timing attacks        | Constant-time password comparison (bcrypt)             |
| User enumeration      | Generic error messages for all credential errors       |
| Session hijacking     | HTTPS only, secure token storage, short-lived tokens   |

---

## 7. Error Handling

### 7.1 Error Cases

| Error                  | Detection              | Recovery Action              | User Message                                |
| ---------------------- | ---------------------- | ---------------------------- | ------------------------------------------- |
| Invalid email format   | Client validation      | Show inline error            | "Invalid email format"                      |
| Empty fields           | Client validation      | Show inline error            | "Email/Password is required"                |
| Invalid credentials    | Server response 401    | Clear password, show error   | "Invalid email or password"                 |
| Account deactivated    | Server response 403    | Show error with support link | "Account is deactivated. Contact support."  |
| Rate limited           | Server response 429    | Show error with wait time    | "Too many attempts. Try again later."       |
| Network error          | Fetch failure          | Show retry option            | "Network error. Please try again."          |

---

## 8. Testing Strategy

### 8.1 Unit Tests

| Component        | Test File                              | Coverage Target |
| ---------------- | -------------------------------------- | --------------- |
| AuthService      | `tests/services/test_auth_service.py`  | 90%             |
| Login API        | `tests/api/test_auth.py`               | 90%             |
| LoginForm        | `LoginForm.test.tsx`                   | 85%             |
| authStore login  | `authStore.test.ts`                    | 85%             |

### 8.2 Integration Tests

| Scenario                          | Test Description                                         |
| --------------------------------- | -------------------------------------------------------- |
| Successful login                  | Valid credentials → tokens returned → stored             |
| Invalid email                     | Unregistered email → 401 error                           |
| Invalid password                  | Wrong password → 401 error                               |
| Deactivated account               | Deactivated user login → 403 error                       |
| Rate limiting                     | 6 attempts in 15 min → 429 error on 6th                  |
| Token persistence                 | Login → close browser → reopen → still authenticated     |

---

## 9. Implementation Checklist

### 9.1 Backend

- [ ] Login schema defined (`schemas/auth.py`)
- [ ] Login service method implemented (`services/auth_service.py`)
- [ ] Login API endpoint implemented (`api/auth.py`)
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Unit tests written
- [ ] Integration tests written

### 9.2 Frontend

- [ ] Login page created (`pages/Login.tsx`)
- [ ] Login form component (`components/forms/LoginForm.tsx`)
- [ ] Login types added (`types/auth.ts`)
- [ ] Login API method added (`services/auth.ts`)
- [ ] Login store action added (`stores/authStore.ts`)
- [ ] Routing updated (`App.tsx`)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Form validation added

---

## 10. Revision History

| Version | Date       | Author        | Changes       |
| ------- | ---------- | ------------- | ------------- |
| 1.0     | 2026-01-23 | JivaDesk Team | Initial draft |

---

**End of Design Specification**
