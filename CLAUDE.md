# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JivaDesk is a medical clinic management application with a Python FastAPI backend and React TypeScript frontend.

## Commands

### Backend (from `src/backend/`)

```bash
# Start development server
./devStartBE.sh
# Or manually: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Install packages (always use uv native)
uv add <package>
# Dependencies are tracked in pyproject.toml and uv.lock automatically

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1

# Run tests
pytest
pytest --cov=app --cov-report=html
pytest tests/test_auth.py  # single file
```

### Frontend (from `src/frontend/`)

```bash
# Start development server (port 5173)
bun run dev
# Or: ./devStartFE.sh

# Build for production
bun run build

# Install packages
bun install <package>
```

### Docker

```bash
# Start database only (development)
docker-compose -f docker/docker-compose.yml up -d

# Full production stack
docker-compose -f docker/docker-compose.prod.yml up -d
```

## Architecture

### Backend Layered Architecture

The backend follows a strict layered pattern:

1. **API Layer** (`app/api/`) - FastAPI routers defining HTTP endpoints
2. **Service Layer** (`app/services/`) - Business logic (e.g., AuthService)
3. **Repository Layer** (`app/database/repositories/`) - Data access abstraction
4. **Models** (`app/database/models/`) - SQLAlchemy ORM models with UUID primary keys
5. **Schemas** (`app/schemas/`) - Pydantic validation (separate from ORM models)
6. **Utils** (`app/utils/`) - JWTHandler, PasswordHasher

Key conventions:
- Always use HTTP POST for API endpoints (data not exposed in URLs)
- Request bodies must be defined as Pydantic schema classes
- Business logic belongs in services, not API endpoints
- Use dependency injection for services and DB sessions

### Frontend Architecture

- **Pages** (`src/pages/`) - Route containers
- **Components** (`src/components/`) - Reusable React components
- **Stores** (`src/stores/`) - Zustand state management (AuthStore, PatientStore, VisitStore)
- **Services** (`src/services/`) - API client abstraction
- **Types** (`src/types/`) - TypeScript interfaces

### API Structure

All endpoints are prefixed with `/api/v1/`:
- `/auth/` - Authentication (register, login, availability checks)
- `/patients/` - Patient management
- `/visits/` - Medical visit records
- `/prescriptions/` - Prescription management
- `/medicines/` - Medicine database

### Database

- PostgreSQL 15 with SQLAlchemy 2.0 ORM
- Alembic for migrations (auto-generate supported)
- Base model provides: `id` (UUID), `created_at`, `updated_at`
- Connection: `postgresql+psycopg2://jivadesk:secret@127.0.0.1:5432/jivadesk`

## Tech Stack

**Backend:** FastAPI 0.128, Python 3.12, SQLAlchemy 2.0, Pydantic 2.x, Alembic, PyJWT, bcrypt, Uvicorn

**Frontend:** React 18, TypeScript 5, Vite, Tailwind CSS, Zustand, Bun

**Infrastructure:** PostgreSQL 15, Docker, Nginx (production)

## Logging Guidelines

**STRICT RULE: Every log entry MUST include contextual data. Plain English statements without data are NOT allowed.**

**File name and line number are automatically captured by the logging utilities - no manual input needed.**

### Log Format Requirements

Every log must include:
1. **What** - The action/event being logged
2. **Context** - Relevant data (IDs, counts, parameters, etc.)
3. **Result** - Outcome or state (for completion logs)

### Output Format

Both backend and frontend logs include `[file:line]` automatically:
```
[2026-01-23 10:30:00] [INFO] [auth.py:65] registration_started | email=doctor@example.com | phone=9876543210
[2026-01-23T10:30:00.000Z] [INFO] [stores/authStore.ts:35] login_success | userId=abc-123 | email=doctor@example.com
```

### Backend (Python)

```python
from app.logging_config import get_logger
logger = get_logger(__name__)

# BAD - No contextual data
logger.info("User logged in")
logger.error("Failed to create patient")

# GOOD - Includes relevant data
logger.info(f"login_success | user_id={user.id} | email={user.email}")
logger.error(f"patient_create_failed | error={str(e)} | email={data.email}")
logger.info(f"registration_complete | user_id={user.id} | email={data.email} | phone={data.phone}")
```

Use the format: `action | key=value | key=value`

### Frontend (TypeScript)

```typescript
import { logger } from '../utils/logger';

// BAD - No contextual data
logger.info("Login clicked");
logger.error("API call failed");

// GOOD - Includes relevant data
logger.info('login_attempt', { email: data.email });
logger.error('login_failed', { email: data.email, status: response.status, error: error.message });
logger.info('registration_success', { userId: user.id, email: user.email });
```

### Log Levels

- **DEBUG**: Detailed flow information with full data (development only)
- **INFO**: Key actions and state changes with identifiers
- **WARN**: Recoverable issues with context
- **ERROR**: Failures with full error details and input data

### What to Log

- API requests/responses (method, path, status, duration)
- Authentication events (login, logout, token refresh)
- Business operations (create, update, delete with entity IDs)
- Validation failures (field, value, rule violated)
- External service calls (service name, operation, result)

### What NOT to Log

- Passwords or tokens (mask or omit)
- Full request/response bodies in production
- High-frequency operations without sampling
