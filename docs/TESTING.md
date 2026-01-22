# JivaDesk Backend Testing Guide

## Overview

Backend automated testing using pytest. Tests run against an isolated test database.

---

## Test Stack

| Tool           | Purpose                         |
| -------------- | ------------------------------- |
| pytest         | Test framework and runner       |
| pytest-asyncio | Async test support              |
| pytest-cov     | Coverage reporting              |
| httpx          | Async HTTP client for API tests |
| factory-boy    | Test data factories             |

---

## Test Structure

```
src/backend/tests/
├── __init__.py
├── conftest.py              # Global fixtures
├── factories.py             # Test data factories
│
├── unit/                    # Unit tests (no database)
│   ├── __init__.py
│   ├── test_security.py     # Password hashing, JWT
│   ├── test_pdf.py          # PDF generation
│   └── test_validators.py   # Schema validation
│
├── repository/              # Repository tests (with test DB)
│   ├── __init__.py
│   ├── test_user_repo.py
│   ├── test_patient_repo.py
│   ├── test_visit_repo.py
│   └── test_prescription_repo.py
│
└── api/                     # API integration tests
    ├── __init__.py
    ├── test_auth.py
    ├── test_patients.py
    ├── test_visits.py
    ├── test_prescriptions.py
    └── test_medicines.py
```

---

## Test Database Configuration

### Isolation Strategy

- Separate database: `jivadesk_test`
- Same PostgreSQL container (port 5433)
- Database created/dropped per test session
- Tables truncated between tests

### conftest.py Setup

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.config import settings
from app.database import Base, get_db

# Test database URL
TEST_DATABASE_URL = settings.DATABASE_URL.replace(
    "/jivadesk", "/jivadesk_test"
)

engine = create_engine(TEST_DATABASE_URL)
TestSessionLocal = sessionmaker(bind=engine)


@pytest.fixture(scope="session")
def setup_database():
    """Create test database tables once per session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(setup_database):
    """Provide a transactional database session for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def override_get_db(db_session):
    """Override FastAPI dependency."""
    def _get_db():
        yield db_session
    return _get_db


@pytest.fixture
async def client(override_get_db):
    """Async test client with overridden database."""
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client, db_session):
    """Get auth headers for authenticated requests."""
    # Create test user and return token headers
    ...
```

---

## Test Factories

Using factory-boy for consistent test data:

```python
# tests/factories.py
import factory
from app.database.models import User, Patient, Visit, Clinic


class ClinicFactory(factory.Factory):
    class Meta:
        model = Clinic

    id = factory.LazyFunction(uuid.uuid4)
    name = factory.Faker("company")
    address = factory.Faker("address")
    phone = factory.Faker("phone_number")


class UserFactory(factory.Factory):
    class Meta:
        model = User

    id = factory.LazyFunction(uuid.uuid4)
    email = factory.Faker("email")
    password_hash = factory.LazyAttribute(
        lambda _: hash_password("testpass123")
    )
    name = factory.Faker("name", locale="en_IN")
    clinic = factory.SubFactory(ClinicFactory)


class PatientFactory(factory.Factory):
    class Meta:
        model = Patient

    id = factory.LazyFunction(uuid.uuid4)
    name = factory.Faker("name", locale="en_IN")
    phone = factory.Sequence(lambda n: f"98765{n:05d}")
    gender = factory.Iterator(["M", "F"])
    dob = factory.Faker("date_of_birth", minimum_age=1, maximum_age=90)
```

---

## Test Examples

### Unit Test Example

```python
# tests/unit/test_security.py
import pytest
from app.utils.security import hash_password, verify_password, create_access_token

def test_password_hashing():
    password = "mysecretpassword"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)


def test_jwt_token_creation():
    token = create_access_token({"sub": "user@test.com", "clinic_id": "uuid"})

    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 50
```

### Repository Test Example

```python
# tests/repository/test_patient_repo.py
import pytest
from app.database.repositories import PatientRepository
from tests.factories import PatientFactory, ClinicFactory

def test_create_patient(db_session):
    clinic = ClinicFactory()
    db_session.add(clinic)
    db_session.commit()

    repo = PatientRepository(db_session)
    patient = repo.create(
        clinic_id=clinic.id,
        name="Test Patient",
        phone="9876543210",
        gender="M"
    )

    assert patient.id is not None
    assert patient.name == "Test Patient"
    assert patient.clinic_id == clinic.id


def test_search_by_phone(db_session):
    clinic = ClinicFactory()
    patient = PatientFactory(clinic=clinic, phone="9876543210")
    db_session.add_all([clinic, patient])
    db_session.commit()

    repo = PatientRepository(db_session)
    results = repo.search(clinic_id=clinic.id, query="987654")

    assert len(results) == 1
    assert results[0].phone == "9876543210"


def test_patient_isolation_by_clinic(db_session):
    """Patients should only be visible to their own clinic."""
    clinic1 = ClinicFactory()
    clinic2 = ClinicFactory()
    patient1 = PatientFactory(clinic=clinic1)
    patient2 = PatientFactory(clinic=clinic2)
    db_session.add_all([clinic1, clinic2, patient1, patient2])
    db_session.commit()

    repo = PatientRepository(db_session)

    # Clinic 1 should only see their patient
    results = repo.get_by_clinic(clinic1.id)
    assert len(results) == 1
    assert results[0].id == patient1.id
```

### API Test Example

```python
# tests/api/test_patients.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_patient(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/patients",
        json={
            "name": "Suresh Kumar",
            "phone": "9876543210",
            "gender": "M",
            "dob": "1980-05-15"
        },
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Suresh Kumar"
    assert data["phone"] == "9876543210"
    assert "id" in data


@pytest.mark.asyncio
async def test_search_patients_by_phone(client: AsyncClient, auth_headers):
    # Create test patient first
    await client.post(
        "/api/patients",
        json={"name": "Test", "phone": "9876543210", "gender": "M"},
        headers=auth_headers
    )

    response = await client.get(
        "/api/patients?search=987654",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    """API should reject requests without auth token."""
    response = await client.get("/api/patients")
    assert response.status_code == 401
```

---

## Running Tests

### Basic Commands

```bash
# Navigate to backend directory
cd src/backend

# Run all tests
uv run pytest

# Run with verbose output
uv run pytest -v

# Run specific test file
uv run pytest tests/api/test_auth.py

# Run specific test function
uv run pytest tests/api/test_auth.py::test_login_success

# Run tests matching pattern
uv run pytest -k "patient"
```

### Coverage Commands

```bash
# Run with coverage
uv run pytest --cov=app

# Generate HTML report
uv run pytest --cov=app --cov-report=html

# View coverage report
# Open htmlcov/index.html in browser

# Fail if coverage below threshold
uv run pytest --cov=app --cov-fail-under=80
```

### Watch Mode (Development)

```bash
# Install pytest-watch
uv add --dev pytest-watch

# Run in watch mode
uv run ptw
```

---

## Test Coverage Goals

| Module                 | Target | Priority |
| ---------------------- | ------ | -------- |
| `api/auth.py`          | 90%    | High     |
| `api/patients.py`      | 85%    | High     |
| `api/visits.py`        | 85%    | High     |
| `api/prescriptions.py` | 85%    | High     |
| `repositories/*`       | 90%    | High     |
| `services/pdf.py`      | 70%    | Medium   |
| `utils/security.py`    | 95%    | High     |

**Overall Target: 85%+**

---

## CI Integration (Future)

```yaml
# .github/workflows/test.yml (example)
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: jivadesk_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v4

      - name: Install dependencies
        run: uv sync
        working-directory: src/backend

      - name: Run tests
        run: uv run pytest --cov=app --cov-fail-under=80
        working-directory: src/backend
```

---

## Best Practices

1. **One assertion focus** - Each test should verify one behavior
2. **Descriptive names** - `test_create_patient_with_valid_data`
3. **Use factories** - Don't hardcode test data everywhere
4. **Test isolation** - Tests shouldn't depend on each other
5. **Test edge cases** - Empty inputs, duplicates, invalid data
6. **Mock external services** - WhatsApp, email, etc.
