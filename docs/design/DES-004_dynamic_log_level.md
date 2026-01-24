# Design Specification: Dynamic Log Level Management

**Design ID:** DES-004
**Feature ID:** FEAT-004 ([Feature Spec](../features/FEAT-004_dynamic_log_level.md))
**Version:** 1.0
**Status:** Draft
**Created:** 2026-01-24
**Last Updated:** 2026-01-24
**Author:** GitHub Copilot

---

## 1. Overview

This design document details the implementation of dynamic log level management for the backend. It covers API, service, and logging configuration changes to allow runtime adjustment of log levels globally and per component/module.

**Scope:**
- Backend API and logging configuration
- New endpoints for log level management
- Security and validation for log level changes

**Out of Scope:**
- Frontend UI for log level management
- Persisting log level across restarts

**Related Documents:**
- Feature Spec: [FEAT-004_dynamic_log_level.md](../features/FEAT-004_dynamic_log_level.md)
- API Spec: [API_SPEC.md](../API_SPEC.md)

---

## 2. Architecture Overview

### 2.1 System Context Diagram

```
┌──────────────┐      ┌──────────────┐
│   Frontend   │      │   Backend    │
│   (Web App)  │◄────►│   (API)      │
└──────────────┘      └──────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Logging System  │
                  └─────────────────┘
```

### 2.2 Component Impact

| Component       | Files Modified                        | New Files                        | Deleted Files |
|-----------------|--------------------------------------|----------------------------------|---------------|
| **Backend API** | logging_config.py, main.py, auth.py  | api/loglevel.py                  | None          |
| **Frontend**    | None                                 | None                             | None          |
| **Database**    | None                                 | None                             | None          |

---

## 3. Detailed Design

### 3.1 Backend API

#### 3.1.1 Database Schema Changes
N/A

#### 3.1.2 API Endpoints

**Endpoint: POST /api/v1/loglevel**
| Attribute     | Value                  |
|---------------|------------------------|
| Method        | POST                   |
| Path          | /api/v1/loglevel       |
| Auth Required | Yes                    |
| Permissions   | Admin/DevOps           |
| Rate Limit    | 10 requests/min        |
| Description   | Set log level globally or per component |

**Request Body:**
```json
{
  "logger": "app.api.auth", // optional
  "level": "DEBUG"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Log level updated"
}
```

**Endpoint: GET /api/v1/loglevel**
| Attribute     | Value                  |
|---------------|------------------------|
| Method        | GET                    |
| Path          | /api/v1/loglevel       |
| Auth Required | Yes                    |
| Permissions   | Admin/DevOps           |
| Rate Limit    | 10 requests/min        |
| Description   | Get current log levels |

**Response (200 OK):**
```json
{
  "status": "success",
  "loggers": {
    "root": "INFO",
    "app.api.auth": "DEBUG"
  }
}
```

#### 3.1.3 Service Layer
- Add a service to manage log level changes, validate input, and update logger objects in memory.
- Log all changes for audit.

#### 3.1.4 Security
- Only authenticated users with admin/devops role can change log levels.
- All changes are logged.

---

### 3.2 Logging Configuration
- Refactor `logging_config.py` to allow runtime log level changes.
- Expose a method to set log level for any logger by name.
- Ensure changes take effect immediately and do not duplicate handlers.

---

## 4. Sequence Diagrams

**Set Log Level Flow:**
```
Admin → API /loglevel (POST) → Backend → Logging Service → Logger(s)
```

**Get Log Level Flow:**
```
Admin → API /loglevel (GET) → Backend → Logging Service → Logger(s)
```

---

## 5. Error Handling
- Invalid log level: return 400 with error message
- Non-existent logger: return 404
- Unauthorized: return 403

---

## 6. Testing
- Unit tests for service and API
- Integration tests for log output
- Manual tests for error scenarios

---

## 7. Rollout & Migration
- Feature flag for API activation
- No data migration required

---

## 8. Open Questions
| # | Question                        | Status | Answer | Answered By |
|---|----------------------------------|--------|--------|-------------|
| 1 | Should log level persist reboot? | Open   |        |             |

---

## 9. References
- [Feature Spec: FEAT-004](../features/FEAT-004_dynamic_log_level.md)
- [Python logging docs](https://docs.python.org/3/library/logging.html)

---

## Revision History
| Version | Date       | Author         | Changes        |
|---------|------------|----------------|---------------|
| 1.0     | 2026-01-24 | GitHub Copilot | Initial draft  |

---

## Approvals
| Role          | Name | Date | Status           |
|---------------|------|------|------------------|
| Product Owner |      |      | Pending/Approved |
| Tech Lead     |      |      | Pending/Approved |
| QA Lead       |      |      | Pending/Approved |

**End of Design Specification**
