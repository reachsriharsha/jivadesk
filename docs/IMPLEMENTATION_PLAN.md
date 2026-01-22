# JivaDesk MVP Implementation Plan

## Overview

SaaS platform for independent doctors & small outpatient clinics in India.

**MVP Scope**: Doctor registration, Patient management, OPD visits, Digital prescriptions (PDF)

---

## Tech Stack (Final)

| Layer           | Technology                        |
| --------------- | --------------------------------- |
| Backend         | FastAPI (Python 3.12+)            |
| Package Manager | uv (Python)                       |
| Frontend        | React 18 + Bun                    |
| Styling         | Tailwind CSS                      |
| State Mgmt      | Zustand                           |
| Database        | PostgreSQL 15 (Docker, isolated)  |
| ORM             | SQLAlchemy 2.0 + Alembic          |
| Auth            | JWT (email + password)            |
| PDF Generation  | WeasyPrint                        |
| Testing         | pytest + pytest-asyncio + httpx   |
| Local Dev       | Docker Compose (isolated network) |
| Production      | DigitalOcean VPS + Docker         |

---

## MVP Features (4 modules)

### 1. Authentication & Doctor Setup

- Register with email + password
- Login with JWT tokens
- First login wizard: Name, Clinic Address, Medical Registration Number
- Doctor profile management

### 2. Patient Management

- Create patient (name, age/DOB, gender, phone, address)
- Search patient by phone number (auto-search)
- View patient details with visit history

### 3. OPD Visit & Consultation

- Create visit linked to patient
- Record: symptoms (free text), diagnosis, clinical notes, follow-up date
- View/edit past visits

### 4. Digital Prescription

- Add medicines with autocomplete (seeded list)
- Dosage patterns (1-0-1, 0-1-1, etc.)
- Duration & instructions
- Generate PDF prescription
- Print / WhatsApp (dummy) integration

---

## Project Structure

```
jivadesk/
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── nginx/
│       └── nginx.conf
├── docs/
│   ├── MVP.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── API_SPEC.md
│   ├── DATABASE_SCHEMA.md
│   └── TESTING.md
├── src/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py
│   │   │   ├── config.py
│   │   │   ├── database/                 # Database package (abstraction layer)
│   │   │   │   ├── __init__.py           # Exports: get_db, DatabaseInterface
│   │   │   │   ├── interface.py          # Abstract interface (Protocol)
│   │   │   │   ├── connection.py         # Session management, engine
│   │   │   │   ├── models/               # SQLAlchemy models
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── base.py           # Base model with common fields
│   │   │   │   │   ├── clinic.py
│   │   │   │   │   ├── user.py
│   │   │   │   │   ├── patient.py
│   │   │   │   │   ├── visit.py
│   │   │   │   │   ├── prescription.py
│   │   │   │   │   └── medicine.py
│   │   │   │   └── repositories/         # Data access layer
│   │   │   │       ├── __init__.py
│   │   │   │       ├── base.py           # Base repository
│   │   │   │       ├── user.py
│   │   │   │       ├── patient.py
│   │   │   │       ├── visit.py
│   │   │   │       ├── prescription.py
│   │   │   │       └── medicine.py
│   │   │   ├── schemas/                  # Pydantic schemas (API contracts)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user.py
│   │   │   │   ├── patient.py
│   │   │   │   ├── visit.py
│   │   │   │   └── prescription.py
│   │   │   ├── api/                      # API routes
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── patients.py
│   │   │   │   ├── visits.py
│   │   │   │   ├── prescriptions.py
│   │   │   │   └── medicines.py
│   │   │   ├── services/                 # Business logic
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── pdf.py
│   │   │   │   └── whatsapp.py
│   │   │   └── utils/
│   │   │       ├── __init__.py
│   │   │       ├── security.py
│   │   │       └── dependencies.py
│   │   ├── tests/                        # Backend tests
│   │   │   ├── __init__.py
│   │   │   ├── conftest.py               # Fixtures, test DB setup
│   │   │   ├── test_auth.py
│   │   │   ├── test_patients.py
│   │   │   ├── test_visits.py
│   │   │   ├── test_prescriptions.py
│   │   │   └── test_medicines.py
│   │   ├── alembic/
│   │   │   └── versions/
│   │   ├── seeds/
│   │   │   └── medicines.json
│   │   ├── templates/
│   │   │   └── prescription.html
│   │   ├── pyproject.toml                # uv project config
│   │   ├── uv.lock                       # uv lock file
│   │   ├── Dockerfile
│   │   ├── alembic.ini
│   │   └── pytest.ini
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   ├── layout/
│       │   │   └── forms/
│       │   ├── pages/
│       │   │   ├── Login.tsx
│       │   │   ├── Register.tsx
│       │   │   ├── Dashboard.tsx
│       │   │   ├── Patients.tsx
│       │   │   ├── PatientDetail.tsx
│       │   │   ├── NewVisit.tsx
│       │   │   └── Prescription.tsx
│       │   ├── stores/
│       │   │   ├── authStore.ts
│       │   │   ├── patientStore.ts
│       │   │   └── visitStore.ts
│       │   ├── services/
│       │   │   └── api.ts
│       │   ├── hooks/
│       │   ├── types/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       ├── public/
│       ├── index.html
│       ├── package.json
│       ├── bunfig.toml
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── Dockerfile
└── README.md
```

---

## Database Architecture

### Design Principle: Interface-based Access

The application accesses all database operations through the `database` package interface. This provides:

1. **Abstraction** - Business logic doesn't depend on SQLAlchemy directly
2. **Testability** - Easy to mock/replace for unit tests
3. **Flexibility** - Can swap implementations without changing API layer

### Database Package Structure

```
app/database/
├── __init__.py           # Public exports: get_db, repositories
├── interface.py          # Protocol definitions (abstract interface)
├── connection.py         # Engine, session factory, get_db dependency
├── models/               # SQLAlchemy ORM models
│   ├── base.py          # BaseModel with id, created_at, updated_at
│   └── *.py             # Entity models
└── repositories/         # Data access implementations
    ├── base.py          # Generic CRUD operations
    └── *.py             # Entity-specific queries
```

### Usage Pattern

```python
# In API routes - inject repository via dependency
from app.database import get_db, PatientRepository

@router.get("/patients")
def list_patients(db: Session = Depends(get_db)):
    repo = PatientRepository(db)
    return repo.get_by_clinic(clinic_id)
```

### Multi-tenancy Strategy

- **Shared tables with `clinic_id`** column
- All queries filtered by `clinic_id`
- Row-level isolation (simple, scalable for MVP)

### Core Tables

| Table              | Purpose                              |
| ------------------ | ------------------------------------ |
| clinics            | Clinic/practice details              |
| users              | Doctors (linked to clinic)           |
| patients           | Patient records (per clinic)         |
| visits             | OPD consultations                    |
| prescriptions      | Prescription metadata                |
| prescription_items | Individual medicines in prescription |
| medicines          | Master medicine list (seeded)        |

---

## Docker Setup

### Isolated Network

Docker Compose uses a dedicated network (`jivadesk-network`) to avoid conflicts with other PostgreSQL instances running on the host.

```yaml
# Network configuration
networks:
  jivadesk-network:
    driver: bridge
    name: jivadesk-network

# PostgreSQL service
services:
  db:
    image: postgres:15
    container_name: jivadesk-db
    networks:
      - jivadesk-network
    ports:
      - "5433:5432" # Different host port to avoid conflicts
```

### Container Names

All containers prefixed with `jivadesk-` for easy identification:

- `jivadesk-db` - PostgreSQL
- `jivadesk-backend` - FastAPI
- `jivadesk-frontend` - React (nginx in prod)

---

## Backend Testing Strategy

### Test Framework

- **pytest** - Test runner
- **pytest-asyncio** - Async test support
- **httpx** - Async HTTP client for API tests
- **factory-boy** - Test data factories (optional)

### Test Database

Separate test database created automatically:

- Uses same PostgreSQL container
- Database: `jivadesk_test`
- Migrations run before tests
- Truncated between test sessions

### Test Categories

| Category   | Location            | Description                        |
| ---------- | ------------------- | ---------------------------------- |
| Unit Tests | `tests/unit/`       | Repository methods, services       |
| API Tests  | `tests/api/`        | Endpoint integration tests         |
| Fixtures   | `tests/conftest.py` | Shared fixtures, test client setup |

### Test Coverage Goals (MVP)

| Module         | Coverage Target |
| -------------- | --------------- |
| Auth           | 90%             |
| Patients       | 85%             |
| Visits         | 85%             |
| Prescriptions  | 85%             |
| PDF Generation | 70%             |

### Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app --cov-report=html

# Run specific module
uv run pytest tests/api/test_patients.py

# Run in watch mode (during development)
uv run pytest-watch
```

---

## Implementation Phases

### Phase A: Foundation (Week 1-2)

1. Project scaffolding (backend + frontend)
2. Docker Compose setup (isolated network, PostgreSQL)
3. Database package structure + base models
4. Alembic migrations setup
5. pytest configuration + test fixtures
6. React + Tailwind + Zustand setup

### Phase B: Authentication (Week 2-3)

1. User & Clinic models + repositories
2. Registration API + tests
3. Login + JWT token generation + tests
4. First-login profile setup wizard
5. Protected route middleware
6. Frontend auth flow + stores

### Phase C: Patient Management (Week 3-4)

1. Patient model + repository
2. Patient CRUD APIs + tests
3. Phone number search + tests
4. Patient list + detail pages
5. Visit history display

### Phase D: OPD Visits (Week 4-5)

1. Visit model + repository
2. Visit CRUD APIs + tests
3. New visit form (symptoms, diagnosis, notes)
4. Follow-up date handling
5. Visit history timeline

### Phase E: Prescriptions (Week 5-6)

1. Prescription model + repository
2. Prescription APIs + tests
3. Medicine autocomplete (seeded data)
4. Prescription form UI
5. PDF generation (WeasyPrint) + tests
6. Download + Print functionality
7. WhatsApp dummy integration

### Phase F: Polish & Deploy (Week 6-7)

1. Error handling & validation
2. Full test suite review (target: 85%+ coverage)
3. Loading states & UX polish
4. Production Docker setup
5. DigitalOcean VPS deployment
6. Basic monitoring

---

## API Endpoints (MVP)

### Auth

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
```

### Patients

```
GET    /api/patients              # List (with search)
POST   /api/patients              # Create
GET    /api/patients/{id}         # Detail + visits
PUT    /api/patients/{id}         # Update
```

### Visits

```
GET    /api/visits                # List (by patient optional)
POST   /api/visits                # Create
GET    /api/visits/{id}           # Detail
PUT    /api/visits/{id}           # Update
```

### Prescriptions

```
POST   /api/prescriptions         # Create for visit
GET    /api/prescriptions/{id}    # Get
GET    /api/prescriptions/{id}/pdf  # Generate PDF
POST   /api/prescriptions/{id}/whatsapp  # Send (dummy)
```

### Medicines

```
GET    /api/medicines             # List with search
```

---

## Key Decisions

| Decision         | Choice                       | Reason                             |
| ---------------- | ---------------------------- | ---------------------------------- |
| Multi-tenancy    | Shared tables + clinic_id    | Simple, sufficient for MVP         |
| Database access  | Repository pattern + package | Abstraction, testability           |
| Package manager  | uv                           | Fast, modern Python tooling        |
| Auth             | Custom JWT                   | Full control, no external deps     |
| PDF              | WeasyPrint                   | HTML templates, easy styling       |
| State management | Zustand                      | Lightweight, simple API            |
| Docker network   | Isolated (jivadesk-network)  | Avoid conflicts with host Postgres |
| Backend testing  | pytest + httpx               | Standard, async support            |
| Frontend testing | Deferred                     | Focus on backend stability first   |
| No queue/billing | Deferred to Phase 2          | Focus on core consultation flow    |

---

## Out of Scope (MVP)

- Token/queue management
- Billing & payments
- Appointment scheduling
- Multi-user roles (only doctor)
- SMS/WhatsApp actual sending
- Offline support
- Regional languages
- Reports/analytics

---

## Success Criteria

MVP is complete when a doctor can:

1. ✅ Register and set up their profile
2. ✅ Add new patients
3. ✅ Search existing patients by phone
4. ✅ Create OPD visits with symptoms/diagnosis
5. ✅ Prescribe medicines with autocomplete
6. ✅ Generate and print prescription PDF
