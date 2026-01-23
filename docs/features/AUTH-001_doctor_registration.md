# Feature Specification: Doctor Registration

**Feature ID:** AUTH-001
**Version:** 1.0
**Status:** Draft
**Priority:** P0 (Critical)
**Target Release:** MVP (Phase 1)
**Created:** 2026-01-22
**Last Updated:** 2026-01-22
**Author:** JivaDesk Team

---

## 1. Overview

### 1.1 Problem Statement

Doctors running small to medium clinics need a simple way to get started with JivaDesk. The registration process must be quick, secure, and capture essential information to create their account.

**Current State:**

- No system exists; this is the initial implementation
- Doctors currently manage patient records manually or with fragmented tools

**User Pain Points:**

- Complex registration forms with too many fields discourage sign-ups
- Excessive OTP usage during registration increases operational costs
- Multi-step verification during signup creates friction and reduces completion rates

### 1.2 Proposed Solution

Provide a simple one-step registration flow where doctors can sign up using email, phone number, and password. Account is created immediately without OTP verification during registration. For security, verification codes will be sent to both email and phone during the login process (AUTH-002), providing two-factor authentication while reducing OTP costs during registration. The account can be enhanced during first-time profile setup (AUTH-003).

### 1.3 Success Criteria

| Metric                        | Current | Target      | Measurement Method    |
| ----------------------------- | ------- | ----------- | --------------------- |
| Registration completion rate  | N/A     | > 90%       | Analytics tracking    |
| Time to complete registration | N/A     | < 1 minute  | User session tracking |
| Failed registration attempts  | N/A     | < 5%        | Error tracking        |
| Duplicate account attempts    | N/A     | < 2%        | Backend logs          |

---

## 2. Affected Components

| Component           | Impact Level | Changes Required                                    |
| ------------------- | ------------ | --------------------------------------------------- |
| **Backend API**     | High         | New registration endpoint, user creation            |
| **Frontend (Web)**  | High         | Registration page with form validation              |
| **Database Schema** | High         | Users table                                         |
| **Authentication**  | High         | JWT token generation, password hashing              |
| **Notifications**   | Low          | Welcome email (future)                              |
| **Integrations**    | None         | -                                                   |

---

## 3. User Stories

### 3.1 Primary User Stories

**US-AUTH001-01: Register with Email and Phone**

- **As a:** Doctor
- **I want to:** Register for JivaDesk using my email and phone number
- **So that:** I can create an account to manage my clinic
- **Acceptance Criteria:**
  - [ ] Can enter email address
  - [ ] Can enter phone number (Indian format: +91 XXXXX XXXXX)
  - [ ] Can set a password with minimum requirements
  - [ ] Account is created immediately upon submission
  - [ ] Verification will happen during first login (AUTH-002)

**US-AUTH001-02: Password Requirements**

- **As a:** Doctor
- **I want to:** Set a secure password
- **So that:** My account is protected
- **Acceptance Criteria:**
  - [ ] Minimum 8 characters
  - [ ] At least one uppercase letter
  - [ ] At least one number
  - [ ] Password strength indicator shown
  - [ ] Confirm password field must match

### 3.2 Edge Cases & Error Scenarios

| Scenario                  | Expected Behavior                                                              |
| ------------------------- | ------------------------------------------------------------------------------ |
| Email already registered  | Show error: "Email already registered. Please login or reset password."        |
| Phone already registered  | Show error: "Phone number already registered. Please login or reset password." |
| Invalid email format      | Show inline validation error                                                   |
| Invalid phone format      | Show inline validation error with expected format                              |
| Network timeout           | Show error with retry option                                                   |
| Weak password             | Show password requirements not met                                             |
| Passwords don't match     | Show error: "Passwords do not match"                                           |
| Terms not accepted        | Show error: "You must accept the terms and conditions"                         |

---

## 4. Functional Requirements

### 4.1 Core Requirements

| ID              | Requirement                                   | Priority    | Notes    |
| --------------- | --------------------------------------------- | ----------- | -------- |
| REQ-AUTH001-001 | Accept email address as unique identifier     | Must Have   |          |
| REQ-AUTH001-002 | Accept Indian phone number (+91)              | Must Have   |          |
| REQ-AUTH001-003 | Validate email format                         | Must Have   |          |
| REQ-AUTH001-004 | Validate phone format (10 digits)             | Must Have   |          |
| REQ-AUTH001-005 | Check email uniqueness before proceeding      | Must Have   |          |
| REQ-AUTH001-006 | Check phone uniqueness before proceeding      | Must Have   |          |
| REQ-AUTH001-007 | Hash password using bcrypt                    | Must Have   | Security |
| REQ-AUTH001-008 | Create user account immediately               | Must Have   |          |
| REQ-AUTH001-009 | Generate JWT token on successful registration | Must Have   |          |
| REQ-AUTH001-010 | Store registration timestamp                  | Must Have   |          |
| REQ-AUTH001-011 | Password strength indicator                   | Should Have | UX       |
| REQ-AUTH001-012 | Terms & Conditions checkbox                   | Must Have   | Legal    |
| REQ-AUTH001-013 | Privacy Policy link                           | Must Have   | Legal    |
| REQ-AUTH001-014 | Send welcome email                            | Should Have | Future   |

### 4.2 User Interface Requirements

**Registration Page:**

- Clean, minimal design with JivaDesk branding
- Single-column form layout
- Real-time field validation
- Clear error messages below each field
- Password visibility toggle
- Loading state on form submission
- Mobile-responsive design
- Success message on account creation
- Auto-redirect to login page after registration

### 4.3 Notification Requirements

| Event                | Notification Type | Recipients | Channel | Content                                                            |
| -------------------- | ----------------- | ---------- | ------- | ------------------------------------------------------------------ |
| Registration Success | Welcome           | Doctor     | Email   | Welcome email with getting started guide (future enhancement)      |
| First Login          | Transactional     | Doctor     | Email & SMS | Verification codes sent to email and phone (see AUTH-002)      |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement               | Target       | Measurement      |
| ------------------------- | ------------ | ---------------- |
| Registration API response | < 200ms      | API monitoring   |
| Page load time            | < 2 seconds  | Lighthouse       |
| Account creation time     | < 100ms      | Backend logs     |

### 5.2 Security & Privacy

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] Input sanitization for SQL injection prevention
- [x] HTTPS only for all endpoints
- [x] No password logging
- [x] Email and phone verification at login (AUTH-002)
- [x] Rate limiting on registration endpoint (max 5 per 15 minutes per IP)
- Data stored: Database (PostgreSQL)
- Data retention: Account data retained until deletion request
- Access control: Public endpoint (no auth required for registration)

### 5.3 Scalability

| Scenario        | Expected Load          | Behavior                      |
| --------------- | ---------------------- | ----------------------------- |
| Normal usage    | 100 registrations/day  | Standard response times       |
| Peak usage      | 500 registrations/day  | May queue OTP delivery        |
| Launch campaign | 1000 registrations/day | SMS gateway rate limits apply |

---

## 6. User Flows

### 6.1 Happy Path

```
Step 1: Doctor opens JivaDesk registration page
    ↓
Step 2: Doctor enters email, phone, and password
    ↓
Step 3: Doctor accepts Terms & Privacy Policy
    ↓
Step 4: Doctor clicks "Register"
    ↓
Step 5: System validates inputs and creates account
    ↓
Step 6: Account created successfully, JWT token generated
    ↓
Step 7: Doctor is logged in and redirected to Profile Setup (AUTH-003)
    ↓
Step 8: On subsequent logins, verification codes sent to email & phone (AUTH-002)
```

### 6.2 Alternative Flows

**Flow: Email already exists**

```
Step 1-4: Same as happy path
    ↓
Step 5: System detects email exists
    ↓
Step 6: Show error with "Login" and "Forgot Password" links
    ↓
Step 7: Doctor chooses to login or reset password
```

**Flow: Phone already exists**

```
Step 1-4: Same as happy path
    ↓
Step 5: System detects phone exists
    ↓
Step 6: Show error with "Login" and "Forgot Password" links
    ↓
Step 7: Doctor chooses to login or reset password
```

### 6.3 Error Flows

**Flow: Network Error**

```
Step 1-4: Same as happy path
    ↓
Step 5: Network error occurs during submission
    ↓
Step 6: System shows "Network error. Please try again."
    ↓
Step 7: Doctor clicks retry
    ↓
Step 8: System resubmits registration
```

---

## 7. Wireframes / Mockups

### 7.1 Registration Page

```
┌─────────────────────────────────────────────────────────────────┐
│                         JivaDesk Logo                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Create Your Account                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📧 Email Address                                         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ doctor@example.com                                  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📱 Phone Number                                          │  │
│  │  ┌────────┐ ┌──────────────────────────────────────────┐  │  │
│  │  │ +91  ▼ │ │ 98765 43210                              │  │  │
│  │  └────────┘ └──────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🔒 Password                                    [👁]      │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ ••••••••••                                          │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  Strength: ████████░░ Strong                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🔒 Confirm Password                            [👁]      │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ ••••••••••                                          │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ☑ I agree to the Terms of Service and Privacy Policy          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    REGISTER                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│           Already have an account? Login here                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Registration Success

```
┌─────────────────────────────────────────────────────────────────┐
│                         JivaDesk Logo                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ✓ Account Created!                           │
│                                                                 │
│         Welcome to JivaDesk, Dr. [Name]                        │
│                                                                 │
│         Your account has been successfully created.             │
│                                                                 │
│         Note: On your first login, you will receive             │
│         verification codes via email and SMS for security.      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              CONTINUE TO PROFILE SETUP                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│                     Redirecting in 3 seconds...                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. API Changes

### 8.1 New Endpoints

| Method | Endpoint                 | Description                          | Auth Required |
| ------ | ------------------------ | ------------------------------------ | ------------- |
| POST   | /api/v1/auth/register    | Create new user account              | No            |
| GET    | /api/v1/auth/check-email | Check if email is available          | No            |
| GET    | /api/v1/auth/check-phone | Check if phone is available          | No            |

### 8.2 Request/Response Examples

**POST /api/v1/auth/register**

Request:

```json
{
  "email": "doctor@example.com",
  "phone": "9876543210",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123",
  "terms_accepted": true
}
```

Response (200 OK):

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
      "expires_in": 3600
    }
  }
}
```

Response (400 Bad Request - Email exists):

```json
{
  "status": "error",
  "message": "Email already registered",
  "error_code": "EMAIL_EXISTS"
}
```

**GET /api/v1/auth/check-email**

---

## 9. Data Model Changes

### 9.1 New Tables

**Table: users**

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

CREATE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_phone ON users(phone);

-- Note: is_email_verified and is_phone_verified will be set to true
-- during login verification process (AUTH-002)
```

**Table: verification_codes** (for login verification - see AUTH-002)

```sql
-- This table will be used for login verification (AUTH-002)
-- Not needed for registration (AUTH-001)
CREATE TABLE verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    email_code_hash VARCHAR(255) NOT NULL,
    phone_code_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(20) NOT NULL DEFAULT 'login', -- 'login', 'password_reset'
    attempts INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX ix_verification_codes_expires_at ON verification_codes(expires_at);
```

### 9.2 Indexes

| Table               | Index Name                      | Columns    | Type  |
| ------------------- | ------------------------------- | ---------- | ----- |
| users               | ix_users_email                  | email      | BTREE |
| users               | ix_users_phone                  | phone      | BTREE |
| verification_codes  | ix_verification_codes_user_id   | user_id    | BTREE |
| verification_codes  | ix_verification_codes_expires_at| expires_at | BTREE |

---

## 10. Dependencies

### 10.1 Internal Dependencies

| Dependency               | Type   | Impact                                   |
| ------------------------ | ------ | ---------------------------------------- |
| AUTH-002 (Login)         | Blocks | Login feature depends on user table      |
| AUTH-003 (Profile Setup) | Blocks | Profile setup happens after registration |

### 10.2 External Dependencies

| Service/Library | Version | Purpose              |
| --------------- | ------- | -------------------- |
| bcrypt          | 4.x     | Password hashing     |
| jsonwebtoken    | 9.x     | JWT token generation |
| PostgreSQL      | 15+     | Database             |

Note: SMS and Email services will be used in AUTH-002 (Login) for verification codes

---

## 11. Risks & Mitigations

| Risk                   | Probability | Impact | Mitigation                                |
| ---------------------- | ----------- | ------ | ----------------------------------------- |
| Bot/spam registrations | Medium      | Medium | Implement rate limiting, consider CAPTCHA |
| Duplicate accounts     | Low         | Low    | Strict uniqueness checks on email/phone   |
| Weak passwords         | Medium      | Medium | Password strength requirements enforced   |
| Account enumeration    | Low         | Low    | Generic error messages                    |

---

## 12. Testing Strategy

### 12.1 Unit Tests

- [ ] Email format validation
- [ ] Phone format validation
- [ ] Password strength validation
- [ ] Password hashing (bcrypt)
- [ ] JWT token generation
- [ ] Email/phone uniqueness checks

### 12.2 Integration Tests

- [ ] Registration flow end-to-end
- [ ] Duplicate email/phone handling
- [ ] Rate limiting enforcement
- [ ] Password validation and hashing
- [ ] JWT token generation and validation

### 12.3 Manual Test Cases

| Test ID | Description             | Steps                           | Expected Result                              |
| ------- | ----------------------- | ------------------------------- | -------------------------------------------- |
| TC-001  | Successful registration | Enter valid details, submit     | Account created, logged in, redirected       |
| TC-002  | Duplicate email         | Register with existing email    | Error message shown                          |
| TC-003  | Duplicate phone         | Register with existing phone    | Error message shown                          |
| TC-004  | Weak password           | Enter password < 8 chars        | Validation error                             |
| TC-005  | Password mismatch       | Enter different passwords       | Validation error                             |

---

## 13. Rollout Plan

### 13.1 Feature Flags

| Flag Name                       | Default | Description                                    |
| ------------------------------- | ------- | ---------------------------------------------- |
| registration_enabled            | true    | Enable/disable new registrations               |
| login_verification_required     | true    | Require verification codes at login (AUTH-002) |
| password_strength_check_enabled | true    | Enable password strength validation            |

### 13.2 Phased Rollout

| Phase   | Audience             | Duration | Success Criteria      |
| ------- | -------------------- | -------- | --------------------- |
| Phase 1 | Internal testing     | 1 week   | All test cases pass   |
| Phase 2 | Beta users (50)      | 2 weeks  | > 80% completion rate |
| Phase 3 | General availability | -        | Stable metrics        |

---

## 14. Out of Scope

- OTP verification during registration (moved to login - AUTH-002)
- Email verification during registration (moved to login - AUTH-002)
- Social login (Google, Facebook)
- Multi-clinic registration
- Admin/staff registration (separate feature)
- International phone numbers (India only for MVP)
- SMS sending (moved to AUTH-002 for login verification)

---

## 15. Open Questions

| #   | Question                                   | Status   | Answer                                    | Answered By  | Date       |
| --- | ------------------------------------------ | -------- | ----------------------------------------- | ------------ | ---------- |
| 1   | Should we require verification at registration? | Resolved | No, moved to login for cost savings  | Product Team | 2026-01-22 |
| 2   | Should we support email-only registration? | Resolved | No, both email and phone required         | Product Team | 2026-01-22 |
| 3   | Should we send welcome email immediately?  | Open     | -                                         | -            | -          |

---

## 16. References

### 16.1 Related Documents

- [AUTH-002: Doctor Login](./AUTH-002_doctor_login.md) - Pending
- [AUTH-003: First-time Profile Setup](./AUTH-003_profile_setup.md) - Pending
- [Database Schema](../DATABASE_SCHEMA.md)

### 16.2 External References

- [MSG91 API Documentation](https://docs.msg91.com/)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

## Revision History

| Version | Date       | Author        | Changes       |
| ------- | ---------- | ------------- | ------------- |
| 1.0     | 2026-01-22 | JivaDesk Team | Initial draft |

---

## Approvals

| Role          | Name | Date | Status  |
| ------------- | ---- | ---- | ------- |
| Product Owner |      |      | Pending |
| Tech Lead     |      |      | Pending |
| QA Lead       |      |      | Pending |

---

**End of Feature Specification**
