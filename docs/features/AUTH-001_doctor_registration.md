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
- Lack of phone-based registration limits accessibility in India where phone is primary identifier
- No verification leads to fake accounts and spam

### 1.2 Proposed Solution

Provide a simple two-step registration flow where doctors can sign up using email and phone number, with OTP verification for phone. The system creates a basic account that can be enhanced during first-time profile setup (AUTH-003).

### 1.3 Success Criteria

| Metric                        | Current | Target      | Measurement Method    |
| ----------------------------- | ------- | ----------- | --------------------- |
| Registration completion rate  | N/A     | > 80%       | Analytics tracking    |
| Time to complete registration | N/A     | < 2 minutes | User session tracking |
| OTP verification success rate | N/A     | > 95%       | Backend logs          |
| Failed registration attempts  | N/A     | < 10%       | Error tracking        |

---

## 2. Affected Components

| Component           | Impact Level | Changes Required                                    |
| ------------------- | ------------ | --------------------------------------------------- |
| **Backend API**     | High         | New registration endpoints, OTP service integration |
| **Frontend (Web)**  | High         | Registration page, OTP verification UI              |
| **Database Schema** | High         | Users table, OTP tokens table                       |
| **Authentication**  | High         | JWT token generation, password hashing              |
| **Notifications**   | Medium       | SMS gateway integration for OTP                     |
| **Integrations**    | Low          | SMS provider (MSG91/Twilio)                         |

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
  - [ ] Receive OTP on phone for verification
  - [ ] Account is created after successful OTP verification

**US-AUTH001-02: Verify Phone via OTP**

- **As a:** Doctor
- **I want to:** Verify my phone number using OTP
- **So that:** My account is secured and linked to my phone
- **Acceptance Criteria:**
  - [ ] Receive 6-digit OTP via SMS within 30 seconds
  - [ ] Can enter OTP on verification screen
  - [ ] Can request OTP resend (max 3 times)
  - [ ] OTP expires after 5 minutes
  - [ ] Clear error message on wrong OTP

**US-AUTH001-03: Password Requirements**

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
| OTP expired               | Show error with option to resend                                               |
| Max OTP attempts exceeded | Show error: "Too many attempts. Please try again after 15 minutes."            |
| SMS delivery failure      | Show error with option to retry or use alternate method                        |
| Network timeout           | Show error with retry option                                                   |
| Weak password             | Show password requirements not met                                             |

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
| REQ-AUTH001-007 | Send OTP via SMS for phone verification       | Must Have   |          |
| REQ-AUTH001-008 | OTP must be 6 digits, expire in 5 minutes     | Must Have   |          |
| REQ-AUTH001-009 | Allow max 3 OTP resend attempts               | Must Have   |          |
| REQ-AUTH001-010 | Hash password using bcrypt                    | Must Have   | Security |
| REQ-AUTH001-011 | Generate JWT token on successful registration | Must Have   |          |
| REQ-AUTH001-012 | Store registration timestamp                  | Must Have   |          |
| REQ-AUTH001-013 | Password strength indicator                   | Should Have | UX       |
| REQ-AUTH001-014 | Terms & Conditions checkbox                   | Must Have   | Legal    |
| REQ-AUTH001-015 | Privacy Policy link                           | Must Have   | Legal    |

### 4.2 User Interface Requirements

**Registration Page:**

- Clean, minimal design with JivaDesk branding
- Single-column form layout
- Real-time field validation
- Clear error messages below each field
- Password visibility toggle
- Loading state on form submission
- Mobile-responsive design

**OTP Verification Page:**

- 6 input boxes for OTP digits
- Auto-focus to next box on input
- Countdown timer for OTP expiry
- Resend OTP link (disabled during cooldown)
- Back button to edit phone number

### 4.3 Notification Requirements

| Event                | Notification Type | Recipients | Channel | Content                                                            |
| -------------------- | ----------------- | ---------- | ------- | ------------------------------------------------------------------ |
| OTP Request          | Transactional     | Doctor     | SMS     | "Your JivaDesk verification code is: XXXXXX. Valid for 5 minutes." |
| Registration Success | Welcome           | Doctor     | Email   | Welcome email with getting started guide                           |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement               | Target       | Measurement      |
| ------------------------- | ------------ | ---------------- |
| Registration API response | < 500ms      | API monitoring   |
| OTP delivery time         | < 30 seconds | SMS gateway logs |
| Page load time            | < 2 seconds  | Lighthouse       |

### 5.2 Security & Privacy

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] OTP rate limiting (max 3 per 15 minutes)
- [x] Input sanitization for SQL injection prevention
- [x] HTTPS only for all endpoints
- [x] No password logging
- [x] OTP stored as hashed value
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
Step 5: System validates inputs and sends OTP
    ↓
Step 6: Doctor receives OTP on phone
    ↓
Step 7: Doctor enters OTP on verification page
    ↓
Step 8: System verifies OTP and creates account
    ↓
Step 9: Doctor is logged in and redirected to Profile Setup (AUTH-003)
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

**Flow: OTP Resend**

```
Step 1-6: Same as happy path
    ↓
Step 7: Doctor doesn't receive OTP or it expires
    ↓
Step 8: Doctor clicks "Resend OTP"
    ↓
Step 9: System sends new OTP (if within attempt limit)
    ↓
Step 10: Continue from Step 7 of happy path
```

### 6.3 Error Flows

**Flow: Invalid OTP**

```
Step 1-6: Same as happy path
    ↓
Step 7: Doctor enters wrong OTP
    ↓
Step 8: System shows "Invalid OTP. Please try again."
    ↓
Step 9: Doctor can retry (up to 5 attempts)
    ↓
Step 10: After 5 failed attempts, OTP is invalidated
    ↓
Step 11: Doctor must request new OTP
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

### 7.2 OTP Verification Page

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                     JivaDesk Logo                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      Verify Your Phone                          │
│                                                                 │
│         We sent a 6-digit code to +91 98765 43210              │
│                                                                 │
│         ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                   │
│         │ 4 │ │ 5 │ │ 2 │ │ _ │ │ _ │ │ _ │                   │
│         └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                   │
│                                                                 │
│                   Code expires in 4:32                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     VERIFY                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│              Didn't receive code? Resend OTP                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. API Changes

### 8.1 New Endpoints

| Method | Endpoint                 | Description                          | Auth Required |
| ------ | ------------------------ | ------------------------------------ | ------------- |
| POST   | /api/v1/auth/register    | Initiate registration, send OTP      | No            |
| POST   | /api/v1/auth/verify-otp  | Verify OTP and complete registration | No            |
| POST   | /api/v1/auth/resend-otp  | Resend OTP to phone                  | No            |
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
  "terms_accepted": true
}
```

Response (200 OK):

```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "data": {
    "verification_id": "ver_abc123xyz",
    "phone_masked": "+91 ****43210",
    "otp_expires_at": "2026-01-22T10:05:00Z",
    "resend_available_at": "2026-01-22T10:01:00Z"
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

**POST /api/v1/auth/verify-otp**

Request:

```json
{
  "verification_id": "ver_abc123xyz",
  "otp": "452189"
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
      "is_profile_complete": false
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 3600
    }
  }
}
```

Response (400 Bad Request - Invalid OTP):

```json
{
  "status": "error",
  "message": "Invalid OTP",
  "error_code": "INVALID_OTP",
  "data": {
    "attempts_remaining": 4
  }
}
```

**POST /api/v1/auth/resend-otp**

Request:

```json
{
  "verification_id": "ver_abc123xyz"
}
```

Response (200 OK):

```json
{
  "status": "success",
  "message": "OTP resent successfully",
  "data": {
    "otp_expires_at": "2026-01-22T10:10:00Z",
    "resend_available_at": "2026-01-22T10:06:00Z",
    "resends_remaining": 2
  }
}
```

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
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_phone ON users(phone);
```

**Table: otp_verifications**

```sql
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(20) NOT NULL, -- 'registration', 'password_reset', 'phone_change'
    attempts INT DEFAULT 0,
    resend_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_otp_verification_id ON otp_verifications(verification_id);
CREATE INDEX ix_otp_phone ON otp_verifications(phone);
```

### 9.2 Indexes

| Table             | Index Name             | Columns         | Type  |
| ----------------- | ---------------------- | --------------- | ----- |
| users             | ix_users_email         | email           | BTREE |
| users             | ix_users_phone         | phone           | BTREE |
| otp_verifications | ix_otp_verification_id | verification_id | BTREE |
| otp_verifications | ix_otp_phone           | phone           | BTREE |

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
| MSG91 or Twilio | Latest  | SMS OTP delivery     |
| bcrypt          | 4.x     | Password hashing     |
| jsonwebtoken    | 9.x     | JWT token generation |
| PostgreSQL      | 15+     | Database             |

---

## 11. Risks & Mitigations

| Risk                   | Probability | Impact | Mitigation                                |
| ---------------------- | ----------- | ------ | ----------------------------------------- |
| SMS gateway downtime   | Low         | High   | Implement fallback SMS provider           |
| OTP delivery delays    | Medium      | Medium | Show appropriate messaging, allow resend  |
| Bot/spam registrations | Medium      | Medium | Implement rate limiting, consider CAPTCHA |
| Phone number recycling | Low         | Medium | Account recovery options                  |

---

## 12. Testing Strategy

### 12.1 Unit Tests

- [ ] Email format validation
- [ ] Phone format validation
- [ ] Password strength validation
- [ ] OTP generation and hashing
- [ ] JWT token generation

### 12.2 Integration Tests

- [ ] Registration flow end-to-end
- [ ] OTP verification flow
- [ ] Duplicate email/phone handling
- [ ] Rate limiting enforcement

### 12.3 Manual Test Cases

| Test ID | Description             | Steps                           | Expected Result                              |
| ------- | ----------------------- | ------------------------------- | -------------------------------------------- |
| TC-001  | Successful registration | Enter valid details, verify OTP | Account created, redirected to profile setup |
| TC-002  | Duplicate email         | Register with existing email    | Error message shown                          |
| TC-003  | Invalid OTP             | Enter wrong OTP                 | Error with retry option                      |
| TC-004  | OTP expiry              | Wait 5+ minutes, enter OTP      | Error with resend option                     |
| TC-005  | Weak password           | Enter password < 8 chars        | Validation error                             |

---

## 13. Rollout Plan

### 13.1 Feature Flags

| Flag Name                   | Default | Description                         |
| --------------------------- | ------- | ----------------------------------- |
| registration_enabled        | true    | Enable/disable registration         |
| otp_verification_required   | true    | Require OTP verification            |
| email_verification_required | false   | Require email verification (future) |

### 13.2 Phased Rollout

| Phase   | Audience             | Duration | Success Criteria      |
| ------- | -------------------- | -------- | --------------------- |
| Phase 1 | Internal testing     | 1 week   | All test cases pass   |
| Phase 2 | Beta users (50)      | 2 weeks  | > 80% completion rate |
| Phase 3 | General availability | -        | Stable metrics        |

---

## 14. Out of Scope

- Email verification (planned for future)
- Social login (Google, Facebook)
- Multi-clinic registration
- Admin/staff registration (separate feature)
- International phone numbers (India only for MVP)

---

## 15. Open Questions

| #   | Question                                   | Status   | Answer                         | Answered By |
| --- | ------------------------------------------ | -------- | ------------------------------ | ----------- |
| 1   | Which SMS gateway to use?                  | Open     | -                              | -           |
| 2   | Should we support email-only registration? | Resolved | No, phone is mandatory for OTP | Product     |
| 3   | Max OTP resend attempts?                   | Resolved | 3 attempts per registration    | Product     |

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
