# Feature Specification: Doctor Login

**Feature ID:** AUTH-002
**Version:** 1.0
**Status:** Draft
**Priority:** P0 (Critical)
**Target Release:** MVP (Phase 1)
**Created:** 2026-01-23
**Last Updated:** 2026-01-23
**Author:** JivaDesk Team

---

## 1. Overview

### 1.1 Problem Statement

Registered doctors need a secure way to access their JivaDesk account to manage their clinic operations. The login process must be quick, secure, and provide a seamless experience.

**Current State:**

- Registration (AUTH-001) is implemented
- Users can create accounts but cannot log back in after logging out
- No session persistence mechanism

**User Pain Points:**

- Cannot access their account after initial registration session expires
- No way to return to the application without re-registering

### 1.2 Proposed Solution

Provide a simple login flow where doctors can authenticate using their registered email and password. Upon successful authentication, JWT tokens are issued for session management. The login page provides clear error messages and a link to password reset (AUTH-004) for forgotten passwords.

### 1.3 Success Criteria

| Metric                  | Current | Target     | Measurement Method    |
| ----------------------- | ------- | ---------- | --------------------- |
| Login success rate      | N/A     | > 95%      | Analytics tracking    |
| Time to login           | N/A     | < 5 seconds| User session tracking |
| Failed login attempts   | N/A     | < 10%      | Error tracking        |

---

## 2. Affected Components

| Component           | Impact Level | Changes Required                                |
| ------------------- | ------------ | ----------------------------------------------- |
| **Backend API**     | Medium       | New login endpoint, token generation            |
| **Frontend (Web)**  | Medium       | Login page with form validation                 |
| **Database Schema** | None         | Uses existing users table from AUTH-001         |
| **Authentication**  | Medium       | Password verification, JWT token generation     |
| **Notifications**   | None         | -                                               |
| **Integrations**    | None         | -                                               |

---

## 3. User Stories

### 3.1 Primary User Stories

**US-AUTH002-01: Login with Email and Password**

- **As a:** Registered Doctor
- **I want to:** Login to JivaDesk using my email and password
- **So that:** I can access my clinic management dashboard
- **Acceptance Criteria:**
  - [ ] Can enter registered email address
  - [ ] Can enter password
  - [ ] Successful login redirects to dashboard
  - [ ] JWT tokens are stored for session management
  - [ ] Can access protected routes after login

**US-AUTH002-02: Session Persistence**

- **As a:** Doctor
- **I want to:** Stay logged in across browser sessions
- **So that:** I don't have to login every time I open the app
- **Acceptance Criteria:**
  - [ ] Tokens are stored in localStorage
  - [ ] App checks for existing tokens on startup
  - [ ] Expired tokens trigger re-authentication

### 3.2 Edge Cases & Error Scenarios

| Scenario                   | Expected Behavior                                                    |
| -------------------------- | -------------------------------------------------------------------- |
| Email not registered       | Show error: "Invalid email or password"                              |
| Wrong password             | Show error: "Invalid email or password"                              |
| Account deactivated        | Show error: "Account is deactivated. Please contact support."        |
| Empty email field          | Show inline validation error                                         |
| Empty password field       | Show inline validation error                                         |
| Invalid email format       | Show inline validation error                                         |
| Network timeout            | Show error with retry option                                         |
| Too many failed attempts   | Show error with cooldown period (rate limiting)                      |

---

## 4. Functional Requirements

### 4.1 Core Requirements

| ID              | Requirement                                   | Priority    | Notes           |
| --------------- | --------------------------------------------- | ----------- | --------------- |
| REQ-AUTH002-001 | Accept email as login identifier              | Must Have   |                 |
| REQ-AUTH002-002 | Validate email format                         | Must Have   |                 |
| REQ-AUTH002-003 | Verify password against stored hash           | Must Have   |                 |
| REQ-AUTH002-004 | Generate JWT access token on success          | Must Have   |                 |
| REQ-AUTH002-005 | Generate JWT refresh token on success         | Must Have   |                 |
| REQ-AUTH002-006 | Return user profile data on success           | Must Have   |                 |
| REQ-AUTH002-007 | Generic error for invalid credentials         | Must Have   | Security        |
| REQ-AUTH002-008 | Rate limit login attempts                     | Should Have | 5 per 15 min/IP |
| REQ-AUTH002-009 | Link to password reset page                   | Should Have |                 |
| REQ-AUTH002-010 | Link to registration page                     | Should Have |                 |

### 4.2 User Interface Requirements

**Login Page:**

- Clean, minimal design matching JivaDesk branding
- Single-column form layout centered on page
- Real-time field validation
- Clear error messages
- Password visibility toggle
- Loading state on form submission
- Mobile-responsive design
- "Forgot Password?" link
- "Don't have an account? Register" link

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement               | Target       | Measurement      |
| ------------------------- | ------------ | ---------------- |
| Login API response        | < 300ms      | API monitoring   |
| Page load time            | < 2 seconds  | Lighthouse       |
| Password verification     | < 200ms      | Backend logs     |

### 5.2 Security & Privacy

- [x] Passwords verified using bcrypt constant-time comparison
- [x] Generic error messages (don't reveal if email exists)
- [x] All API communication over HTTPS only
- [x] JWT tokens include expiry timestamps
- [x] No sensitive data logged
- [x] Rate limiting on login endpoint (5 attempts per 15 minutes per IP)
- Data stored: Database (PostgreSQL) - no new data, uses existing users table
- Access control: Public endpoint (no auth required for login)

### 5.3 Scalability

| Scenario        | Expected Load          | Behavior                      |
| --------------- | ---------------------- | ----------------------------- |
| Normal usage    | 500 logins/day         | Standard response times       |
| Peak usage      | 2000 logins/day        | May slightly increase latency |

---

## 6. User Flows

### 6.1 Happy Path

```
Step 1: Doctor opens JivaDesk login page
    ↓
Step 2: Doctor enters registered email and password
    ↓
Step 3: Doctor clicks "Login"
    ↓
Step 4: System validates credentials
    ↓
Step 5: Credentials valid, JWT tokens generated
    ↓
Step 6: Tokens stored in localStorage
    ↓
Step 7: Doctor redirected to Dashboard (or Profile Setup if incomplete)
```

### 6.2 Alternative Flows

**Flow: Invalid Credentials**

```
Step 1-3: Same as happy path
    ↓
Step 4: System detects invalid credentials
    ↓
Step 5: Show generic error: "Invalid email or password"
    ↓
Step 6: Doctor can retry or click "Forgot Password?"
```

**Flow: Profile Incomplete**

```
Step 1-6: Same as happy path
    ↓
Step 7: System checks is_profile_complete flag
    ↓
Step 8: If false, redirect to Profile Setup (AUTH-003)
    ↓
Step 9: If true, redirect to Dashboard
```

### 6.3 Error Flows

**Flow: Network Error**

```
Step 1-3: Same as happy path
    ↓
Step 4: Network error occurs during submission
    ↓
Step 5: System shows "Network error. Please try again."
    ↓
Step 6: Doctor clicks retry
```

**Flow: Rate Limited**

```
Step 1-3: Same as happy path (after multiple failed attempts)
    ↓
Step 4: Rate limit exceeded
    ↓
Step 5: Show error: "Too many login attempts. Please try again in 15 minutes."
```

---

## 7. Wireframes / Mockups

### 7.1 Login Page

```
┌─────────────────────────────────────────────────────────────────┐
│                         JivaDesk Logo                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Welcome Back                                 │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📧 Email Address                                         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ doctor@example.com                                  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🔒 Password                                    [👁]      │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ ••••••••••                                          │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                    Forgot Password? →     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                       LOGIN                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│           Don't have an account? Register here                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Login Error State

```
┌─────────────────────────────────────────────────────────────────┐
│                         JivaDesk Logo                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ⚠️ Invalid email or password                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│                    Welcome Back                                 │
│                                                                 │
│  [Form fields same as above]                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. API Changes

### 8.1 New Endpoints

| Method | Endpoint            | Description                    | Auth Required |
| ------ | ------------------- | ------------------------------ | ------------- |
| POST   | /api/v1/auth/login  | Authenticate user, get tokens  | No            |

### 8.2 Request/Response Examples

**POST /api/v1/auth/login**

Request:

```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123"
}
```

Response (200 OK):

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

Response (401 Unauthorized - Invalid credentials):

```json
{
  "status": "error",
  "message": "Invalid email or password",
  "error_code": "INVALID_CREDENTIALS"
}
```

Response (403 Forbidden - Account deactivated):

```json
{
  "status": "error",
  "message": "Account is deactivated. Please contact support.",
  "error_code": "ACCOUNT_DEACTIVATED"
}
```

Response (429 Too Many Requests):

```json
{
  "status": "error",
  "message": "Too many login attempts. Please try again later.",
  "error_code": "RATE_LIMIT_EXCEEDED"
}
```

---

## 9. Data Model Changes

### 9.1 New Tables

No new tables required. Uses existing `users` table from AUTH-001.

### 9.2 Modified Tables

None. Existing `users` table schema is sufficient for login.

---

## 10. Dependencies

### 10.1 Internal Dependencies

| Dependency               | Type       | Impact                                       |
| ------------------------ | ---------- | -------------------------------------------- |
| AUTH-001 (Registration)  | Required   | Login requires existing user account         |
| AUTH-003 (Profile Setup) | Blocked By | Redirect to profile setup if incomplete      |
| AUTH-004 (Password Reset)| Optional   | Link to forgot password (can be placeholder) |

### 10.2 External Dependencies

| Service/Library | Version | Purpose                |
| --------------- | ------- | ---------------------- |
| bcrypt          | 4.x     | Password verification  |
| PyJWT           | 2.x     | JWT token generation   |
| PostgreSQL      | 15+     | Database               |

---

## 11. Risks & Mitigations

| Risk                        | Probability | Impact | Mitigation                                   |
| --------------------------- | ----------- | ------ | -------------------------------------------- |
| Brute force attacks         | Medium      | High   | Rate limiting, account lockout consideration |
| Credential stuffing         | Medium      | Medium | Rate limiting per IP, monitoring             |
| Session hijacking           | Low         | High   | HTTPS only, secure token storage             |
| User enumeration            | Low         | Low    | Generic error messages                       |

---

## 12. Testing Strategy

### 12.1 Unit Tests

- [ ] Email format validation
- [ ] Password verification with bcrypt
- [ ] JWT token generation
- [ ] Token expiry validation
- [ ] Rate limiting logic

### 12.2 Integration Tests

- [ ] Login flow end-to-end
- [ ] Invalid credentials handling
- [ ] Deactivated account handling
- [ ] Token persistence and retrieval
- [ ] Rate limiting enforcement

### 12.3 Manual Test Cases

| Test ID | Description             | Steps                           | Expected Result                              |
| ------- | ----------------------- | ------------------------------- | -------------------------------------------- |
| TC-001  | Successful login        | Enter valid credentials, submit | Logged in, redirected to dashboard           |
| TC-002  | Wrong password          | Enter wrong password, submit    | Generic error message shown                  |
| TC-003  | Unregistered email      | Enter unknown email, submit     | Generic error message shown                  |
| TC-004  | Empty fields            | Submit with empty fields        | Validation errors shown                      |
| TC-005  | Deactivated account     | Login with deactivated account  | Deactivated account error shown              |
| TC-006  | Profile incomplete      | Login with incomplete profile   | Redirected to profile setup                  |

---

## 13. Rollout Plan

### 13.1 Feature Flags

| Flag Name        | Default | Description                    |
| ---------------- | ------- | ------------------------------ |
| login_enabled    | true    | Enable/disable login feature   |

### 13.2 Phased Rollout

| Phase   | Audience             | Duration | Success Criteria      |
| ------- | -------------------- | -------- | --------------------- |
| Phase 1 | Internal testing     | 1 week   | All test cases pass   |
| Phase 2 | Beta users           | 1 week   | > 95% success rate    |
| Phase 3 | General availability | -        | Stable metrics        |

---

## 14. Out of Scope

- Two-factor authentication (email/SMS verification codes)
- Social login (Google, Facebook)
- "Remember me" extended session
- Biometric authentication
- Single Sign-On (SSO)
- Account lockout after failed attempts (consider for future)

---

## 15. Open Questions

| #   | Question                                        | Status   | Answer                           | Answered By  | Date       |
| --- | ----------------------------------------------- | -------- | -------------------------------- | ------------ | ---------- |
| 1   | Should we implement 2FA for MVP?                | Resolved | No, simple login for MVP         | Product Team | 2026-01-23 |
| 2   | Should login support phone number as well?      | Resolved | No, email only for MVP           | Product Team | 2026-01-23 |

---

## 16. References

### 16.1 Related Documents

- [AUTH-001: Doctor Registration](./AUTH-001_doctor_registration.md)
- [AUTH-003: First-time Profile Setup](./AUTH-003_profile_setup.md) - Pending
- [AUTH-004: Password Reset](./AUTH-004_password_reset.md) - Pending
- [Database Schema](../DATABASE_SCHEMA.md)
- [API Specification](../API_SPEC.md)

### 16.2 External References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://auth0.com/blog/jwt-authentication-best-practices/)

---

## Revision History

| Version | Date       | Author        | Changes       |
| ------- | ---------- | ------------- | ------------- |
| 1.0     | 2026-01-23 | JivaDesk Team | Initial draft |

---

## Approvals

| Role          | Name | Date | Status  |
| ------------- | ---- | ---- | ------- |
| Product Owner |      |      | Pending |
| Tech Lead     |      |      | Pending |
| QA Lead       |      |      | Pending |

---

**End of Feature Specification**
