# Feature Specification: First-time Profile Setup

**Feature ID:** AUTH-003
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

After registration and login, doctors need to complete their professional profile before they can start using the clinic management features. The profile information is essential for generating prescriptions, maintaining medical records, and establishing professional credibility.

**Current State:**

- Registration (AUTH-001) captures only email, phone, and password
- Login (AUTH-002) is implemented
- No mechanism exists to capture doctor's professional details
- `is_profile_complete` flag is false after registration

**User Pain Points:**

- Cannot generate prescriptions without doctor's name and registration number
- No professional identity established in the system
- Incomplete user records make the system unusable for clinical purposes

### 1.2 Proposed Solution

Provide a mandatory profile setup flow that appears after first login when `is_profile_complete` is false. The form captures the doctor's professional details: full name, medical registration number, qualification, and specialization. Upon completion, the user is redirected to the main dashboard and can start using the application.

### 1.3 Success Criteria

| Metric                      | Current | Target     | Measurement Method    |
| --------------------------- | ------- | ---------- | --------------------- |
| Profile completion rate     | N/A     | > 95%      | Analytics tracking    |
| Time to complete profile    | N/A     | < 2 minutes| User session tracking |
| Drop-off during setup       | N/A     | < 5%       | Funnel analysis       |

---

## 2. Affected Components

| Component           | Impact Level | Changes Required                                        |
| ------------------- | ------------ | ------------------------------------------------------- |
| **Backend API**     | High         | New profile setup endpoint, user profile update         |
| **Frontend (Web)**  | High         | Profile setup page with form validation                 |
| **Database Schema** | High         | New columns in users table for profile fields           |
| **Authentication**  | Low          | Protected endpoint (requires auth)                      |
| **Notifications**   | None         | -                                                       |
| **Integrations**    | None         | -                                                       |

---

## 3. User Stories

### 3.1 Primary User Stories

**US-AUTH003-01: Complete Profile After First Login**

- **As a:** Newly registered Doctor
- **I want to:** Complete my professional profile after logging in
- **So that:** I can start using the clinic management features
- **Acceptance Criteria:**
  - [ ] Redirected to profile setup after first login
  - [ ] Can enter full name
  - [ ] Can enter medical registration number
  - [ ] Can enter qualification (e.g., MBBS, MD)
  - [ ] Can enter specialization (e.g., General Physician, Pediatrician)
  - [ ] Profile is saved and `is_profile_complete` is set to true
  - [ ] Redirected to dashboard after successful completion

**US-AUTH003-02: Mandatory Profile Completion**

- **As the:** System
- **I want to:** Ensure doctors complete their profile before using the app
- **So that:** All prescriptions and records have valid doctor information
- **Acceptance Criteria:**
  - [ ] Users cannot access dashboard without completing profile
  - [ ] Profile setup page cannot be skipped
  - [ ] All required fields must be filled

### 3.2 Edge Cases & Error Scenarios

| Scenario                        | Expected Behavior                                                    |
| ------------------------------- | -------------------------------------------------------------------- |
| Empty full name                 | Show inline validation error                                         |
| Empty medical registration      | Show inline validation error                                         |
| Invalid registration format     | Show inline validation error with expected format                    |
| Empty qualification             | Show inline validation error                                         |
| Empty specialization            | Show inline validation error                                         |
| Session expired during setup    | Redirect to login, then back to profile setup after re-login         |
| Network timeout                 | Show error with retry option                                         |
| Duplicate registration number   | Show error: "This registration number is already in use"             |
| Direct URL access to dashboard  | Redirect to profile setup if `is_profile_complete` is false          |

---

## 4. Functional Requirements

### 4.1 Core Requirements

| ID              | Requirement                                           | Priority    | Notes           |
| --------------- | ----------------------------------------------------- | ----------- | --------------- |
| REQ-AUTH003-001 | Capture doctor's full name                            | Must Have   |                 |
| REQ-AUTH003-002 | Capture medical registration number                   | Must Have   | MCI/SMC format  |
| REQ-AUTH003-003 | Capture qualification                                 | Must Have   | e.g., MBBS, MD  |
| REQ-AUTH003-004 | Capture specialization                                | Must Have   |                 |
| REQ-AUTH003-005 | Validate all fields are non-empty                     | Must Have   |                 |
| REQ-AUTH003-006 | Update `is_profile_complete` to true                  | Must Have   |                 |
| REQ-AUTH003-007 | Require authentication for profile update             | Must Have   | Security        |
| REQ-AUTH003-008 | Redirect to dashboard after completion                | Must Have   |                 |
| REQ-AUTH003-009 | Prevent access to other pages until complete          | Must Have   |                 |
| REQ-AUTH003-010 | Specialization dropdown with common options           | Should Have | UX              |
| REQ-AUTH003-011 | Allow custom specialization if not in list            | Should Have | Flexibility     |

### 4.2 User Interface Requirements

**Profile Setup Page:**

- Clean, welcoming design with JivaDesk branding
- Single-column form layout centered on page
- Progress indicator showing this is part of onboarding
- Real-time field validation
- Clear error messages below each field
- Loading state on form submission
- Mobile-responsive design
- Success message on completion
- Auto-redirect to dashboard after setup

### 4.3 Field Specifications

| Field                    | Type        | Required | Validation                              | Max Length |
| ------------------------ | ----------- | -------- | --------------------------------------- | ---------- |
| Full Name                | Text Input  | Yes      | Min 2 chars, letters and spaces only    | 100        |
| Medical Registration No. | Text Input  | Yes      | Alphanumeric, 5-20 characters           | 20         |
| Qualification            | Text Input  | Yes      | Min 2 chars                             | 100        |
| Specialization           | Dropdown    | Yes      | Selection from list or custom entry     | 100        |

### 4.4 Specialization Options

Common specializations for the dropdown:

- General Physician
- Pediatrician
- Gynecologist
- Dermatologist
- Orthopedic
- ENT Specialist
- Ophthalmologist
- Cardiologist
- Neurologist
- Psychiatrist
- General Surgeon
- Other (allows custom input)

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement               | Target       | Measurement      |
| ------------------------- | ------------ | ---------------- |
| Profile API response      | < 200ms      | API monitoring   |
| Page load time            | < 2 seconds  | Lighthouse       |
| Profile save time         | < 100ms      | Backend logs     |

### 5.2 Security & Privacy

- [x] Endpoint requires valid JWT token
- [x] User can only update their own profile
- [x] Input sanitization for SQL injection prevention
- [x] HTTPS only for all endpoints
- [x] No sensitive data logging
- Data stored: Database (PostgreSQL) in users table
- Data retention: Account data retained until deletion request
- Access control: Authenticated users only, own profile only

### 5.3 Scalability

| Scenario        | Expected Load          | Behavior                      |
| --------------- | ---------------------- | ----------------------------- |
| Normal usage    | 100 profile setups/day | Standard response times       |
| Peak usage      | 500 profile setups/day | Standard response times       |

---

## 6. User Flows

### 6.1 Happy Path

```
Step 1: Doctor logs in successfully (AUTH-002)
    |
Step 2: System checks is_profile_complete flag
    |
Step 3: Flag is false, redirect to /profile-setup
    |
Step 4: Doctor enters full name, registration number, qualification, specialization
    |
Step 5: Doctor clicks "Complete Profile"
    |
Step 6: System validates inputs and updates profile
    |
Step 7: is_profile_complete set to true
    |
Step 8: Doctor redirected to dashboard
    |
Step 9: Subsequent logins go directly to dashboard
```

### 6.2 Alternative Flows

**Flow: User Tries to Access Dashboard Directly**

```
Step 1: User with incomplete profile navigates to /dashboard
    |
Step 2: System checks is_profile_complete flag
    |
Step 3: Flag is false, redirect to /profile-setup
    |
Step 4: Continue with happy path from Step 4
```

**Flow: Session Expired During Setup**

```
Step 1-4: Same as happy path
    |
Step 5: Session expires before submission
    |
Step 6: System returns 401 Unauthorized
    |
Step 7: Redirect to login page
    |
Step 8: After re-login, redirect back to profile setup
```

### 6.3 Error Flows

**Flow: Validation Error**

```
Step 1-4: Same as happy path
    |
Step 5: Doctor submits with invalid/missing data
    |
Step 6: System shows inline validation errors
    |
Step 7: Doctor corrects the errors
    |
Step 8: Continue with submission
```

**Flow: Network Error**

```
Step 1-5: Same as happy path
    |
Step 6: Network error occurs during submission
    |
Step 7: System shows "Network error. Please try again."
    |
Step 8: Doctor clicks retry
    |
Step 9: System resubmits profile data
```

---

## 7. Wireframes / Mockups

### 7.1 Profile Setup Page

```
+---------------------------------------------------------------------+
|                         JivaDesk Logo                                |
+---------------------------------------------------------------------+
|                                                                     |
|                    Complete Your Profile                            |
|                                                                     |
|     Please provide your professional details to get started         |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |  Full Name *                                                  |  |
|  |  +----------------------------------------------------------+ |  |
|  |  | Dr. Rajesh Kumar                                         | |  |
|  |  +----------------------------------------------------------+ |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |  Medical Registration Number *                                |  |
|  |  +----------------------------------------------------------+ |  |
|  |  | MCI-12345                                                 | |  |
|  |  +----------------------------------------------------------+ |  |
|  |  Format: MCI number or State Medical Council number           |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |  Qualification *                                              |  |
|  |  +----------------------------------------------------------+ |  |
|  |  | MBBS, MD (General Medicine)                              | |  |
|  |  +----------------------------------------------------------+ |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |  Specialization *                                             |  |
|  |  +----------------------------------------------------------+ |  |
|  |  | General Physician                                    [v] | |  |
|  |  +----------------------------------------------------------+ |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |                   COMPLETE PROFILE                            |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
+---------------------------------------------------------------------+
```

### 7.2 Profile Setup Success (Brief Toast/Redirect)

```
+---------------------------------------------------------------------+
|                         JivaDesk Logo                                |
+---------------------------------------------------------------------+
|                                                                     |
|                    [check icon] Profile Complete!                    |
|                                                                     |
|         Welcome to JivaDesk, Dr. Rajesh Kumar                       |
|                                                                     |
|         You're all set to start managing your clinic.               |
|                                                                     |
|                     Redirecting to dashboard...                      |
|                                                                     |
+---------------------------------------------------------------------+
```

---

## 8. API Changes

### 8.1 New Endpoints

| Method | Endpoint                    | Description                    | Auth Required |
| ------ | --------------------------- | ------------------------------ | ------------- |
| PUT    | /api/v1/auth/profile-setup  | Complete doctor profile setup  | Yes           |
| GET    | /api/v1/auth/me             | Get current user profile       | Yes           |

### 8.2 Request/Response Examples

**PUT /api/v1/auth/profile-setup**

Request Headers:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request Body:
```json
{
  "full_name": "Dr. Rajesh Kumar",
  "medical_registration_number": "MCI-12345",
  "qualification": "MBBS, MD (General Medicine)",
  "specialization": "General Physician"
}
```

Response (200 OK):
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

Response (400 Bad Request - Validation Error):
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    {
      "field": "full_name",
      "message": "Full name is required"
    }
  ],
  "error_code": "VALIDATION_ERROR"
}
```

Response (401 Unauthorized):
```json
{
  "status": "error",
  "message": "Invalid or expired token",
  "error_code": "UNAUTHORIZED"
}
```

**GET /api/v1/auth/me**

Request Headers:
```
Authorization: Bearer <access_token>
```

Response (200 OK):
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

---

## 9. Data Model Changes

### 9.1 Modified Tables

**Table: users (add columns)**

```sql
-- Add new columns to existing users table
ALTER TABLE users ADD COLUMN full_name VARCHAR(100);
ALTER TABLE users ADD COLUMN medical_registration_number VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN qualification VARCHAR(100);
ALTER TABLE users ADD COLUMN specialization VARCHAR(100);

-- Create index for medical registration number
CREATE UNIQUE INDEX ix_users_medical_registration_number
ON users(medical_registration_number)
WHERE medical_registration_number IS NOT NULL;
```

**Updated users table structure:**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),                      -- NEW
    medical_registration_number VARCHAR(20),    -- NEW (unique when not null)
    qualification VARCHAR(100),                 -- NEW
    specialization VARCHAR(100),                -- NEW
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    is_profile_complete BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    terms_accepted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 9.2 Indexes

| Table | Index Name                               | Columns                      | Type   |
| ----- | ---------------------------------------- | ---------------------------- | ------ |
| users | ix_users_medical_registration_number     | medical_registration_number  | UNIQUE |

---

## 10. Dependencies

### 10.1 Internal Dependencies

| Dependency              | Type       | Impact                                        |
| ----------------------- | ---------- | --------------------------------------------- |
| AUTH-001 (Registration) | Required   | User account must exist                       |
| AUTH-002 (Login)        | Required   | User must be authenticated to setup profile   |
| Dashboard               | Blocked By | Dashboard access requires completed profile   |

### 10.2 External Dependencies

| Service/Library | Version | Purpose                |
| --------------- | ------- | ---------------------- |
| PostgreSQL      | 15+     | Database               |
| Alembic         | 1.x     | Database migrations    |
| PyJWT           | 2.x     | Token validation       |

---

## 11. Risks & Mitigations

| Risk                            | Probability | Impact | Mitigation                                     |
| ------------------------------- | ----------- | ------ | ---------------------------------------------- |
| Users abandon during setup      | Medium      | Medium | Minimal required fields, clear progress        |
| Invalid registration numbers    | Medium      | Low    | Basic format validation, allow manual entry    |
| Duplicate registration numbers  | Low         | Medium | Unique constraint, clear error message         |
| Data entry errors               | Medium      | Low    | Allow profile editing later (future feature)   |

---

## 12. Testing Strategy

### 12.1 Unit Tests

- [ ] Full name validation (min length, format)
- [ ] Medical registration number validation
- [ ] Qualification validation
- [ ] Specialization validation
- [ ] Profile update service
- [ ] Authentication middleware

### 12.2 Integration Tests

- [ ] Profile setup flow end-to-end
- [ ] Redirect to profile setup when incomplete
- [ ] Redirect to dashboard after completion
- [ ] Unauthorized access handling
- [ ] Duplicate registration number handling
- [ ] Token expiry during setup

### 12.3 Manual Test Cases

| Test ID | Description                | Steps                                  | Expected Result                                 |
| ------- | -------------------------- | -------------------------------------- | ----------------------------------------------- |
| TC-001  | Successful profile setup   | Login, fill all fields, submit         | Profile saved, redirected to dashboard          |
| TC-002  | Missing full name          | Login, leave name empty, submit        | Validation error shown                          |
| TC-003  | Missing registration no.   | Login, leave registration empty        | Validation error shown                          |
| TC-004  | Direct dashboard access    | Navigate to /dashboard without profile | Redirected to profile setup                     |
| TC-005  | Session expiry             | Wait for token to expire, submit       | Redirected to login                             |
| TC-006  | Duplicate registration no. | Enter existing registration number     | Error: "Registration number already in use"     |

---

## 13. Rollout Plan

### 13.1 Feature Flags

| Flag Name                     | Default | Description                                    |
| ----------------------------- | ------- | ---------------------------------------------- |
| profile_setup_enabled         | true    | Enable/disable profile setup flow              |
| profile_setup_required        | true    | Require profile completion before dashboard    |

### 13.2 Phased Rollout

| Phase   | Audience             | Duration | Success Criteria           |
| ------- | -------------------- | -------- | -------------------------- |
| Phase 1 | Internal testing     | 1 week   | All test cases pass        |
| Phase 2 | Beta users           | 1 week   | > 95% completion rate      |
| Phase 3 | General availability | -        | Stable metrics             |

---

## 14. Out of Scope

- Profile photo upload (future enhancement)
- Clinic details (separate feature - CLINIC-002)
- Address capture (moved to clinic setup)
- Multiple qualifications (single text field for MVP)
- Verification of medical registration number (manual process)
- Profile editing after initial setup (future feature)

---

## 15. Open Questions

| #   | Question                                          | Status   | Answer                              | Answered By  | Date       |
| --- | ------------------------------------------------- | -------- | ----------------------------------- | ------------ | ---------- |
| 1   | Should we verify medical registration numbers?    | Resolved | No, manual validation for MVP       | Product Team | 2026-01-23 |
| 2   | Should we capture clinic address?                 | Resolved | No, separate feature (CLINIC-002)   | Product Team | 2026-01-23 |
| 3   | Should profile be editable after initial setup?   | Open     | Future feature                      | -            | -          |

---

## 16. References

### 16.1 Related Documents

- [AUTH-001: Doctor Registration](./AUTH-001_doctor_registration.md)
- [AUTH-002: Doctor Login](./AUTH-002_doctor_login.md)
- [CLINIC-002: Clinic Details](./CLINIC-002_clinic_details.md) - Pending
- [Database Schema](../DATABASE_SCHEMA.md)
- [API Specification](../API_SPEC.md)

### 16.2 External References

- [Medical Council of India](https://www.nmc.org.in/) - Registration number format
- [State Medical Councils](https://www.nmc.org.in/information-desk/state-medical-councils/)

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
