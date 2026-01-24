# Backend Development Rules

## Package Management

### Use UV for All Python Package Operations

**Always use `uv` for Python package installations and management.**

#### Installing Packages

**Important**: UV uses native dependency management with `pyproject.toml` and `uv.lock`

```bash
# Navigate to backend directory
cd /home/sharsha/src/jivadesk/src/backend

# Install all dependencies (creates .venv automatically)
uv sync

# Install a single package
uv add <package-name>

# Install multiple packages
uv add <package1> <package2> <package3>

# Install development dependencies
uv add --dev <package-name>
```

#### Common Commands

```bash
# Sync dependencies from pyproject.toml
uv sync

# Update all dependencies
uv sync --upgrade

# Upgrade a specific package
uv add --upgrade <package-name>

# Remove a package
uv remove <package-name>

# List installed packages
uv pip list

# Show package info
uv pip show <package-name>

# Run commands in the environment
uv run <command>
```

#### Why UV Native?

- **Speed**: Significantly faster than pip
- **Lock file**: `uv.lock` ensures reproducible builds
- **No requirements.txt**: Dependencies in `pyproject.toml`
- **Modern**: Built in Rust for performance

## General Guidelines

### Project Structure

```
src/backend/
├── alembic/              # Database migrations
│   └── versions/         # Migration files
├── app/
│   ├── api/              # API endpoints (routers)
│   ├── database/         # Database models and repositories
│   │   ├── models/       # SQLAlchemy models
│   │   └── repositories/ # Data access layer
│   ├── schemas/          # Pydantic schemas (request/response)
│   ├── services/         # Business logic layer
│   ├── utils/            # Utility functions
│   ├── config.py         # Configuration
│   └── main.py           # FastAPI application entry point
├── tests/                # Test files
├── requirements.txt      # Production dependencies
└── requirements-dev.txt  # Development dependencies
```

### Code Organization

1. **Models**: Define database schema (SQLAlchemy ORM)
2. **Schemas**: Define API request/response structure (Pydantic)
3. **Repositories**: Handle database operations
4. **Services**: Contain business logic
5. **API/Routers**: Define HTTP endpoints
6. **Utils**: Reusable utility functions

### API Style to be used
- Always use http POST only. As data is not shown like get.
- The request should be always defined in schema as a class  

### Best Practices

- Use type hints for all function parameters and return values
- Follow PEP 8 style guidelines
- Write docstrings for all classes and functions
- Use async/await for database operations
- Implement proper error handling
- Keep business logic in services, not in API endpoints
- Use dependency injection for services

### Testing

- Write unit tests for services and utilities
- Write integration tests for API endpoints
- Use pytest as the testing framework
- Aim for >85% code coverage

### Security

- Never commit sensitive data (API keys, secrets)
- Use environment variables for configuration
- Hash passwords using bcrypt (cost factor 12)
- Use JWT for authentication
- Validate all user inputs
- Use parameterized queries to prevent SQL injection

### Logging

**STRICT RULE: Every log entry MUST include contextual data. Plain English statements without data are NOT allowed.**

Use the logger from `app.logging_config`:

```python
from app.logging_config import get_logger
logger = get_logger(__name__)
```

**Log Format:** `action | key=value | key=value`

```python
# BAD - No contextual data
logger.info("User registered")
logger.error("Login failed")

# GOOD - Includes relevant data
logger.info(f"user_registered | user_id={user.id} | email={user.email} | phone={user.phone}")
logger.error(f"login_failed | email={email} | reason=invalid_credentials")
logger.info(f"patient_created | patient_id={patient.id} | doctor_id={doctor.id}")
logger.warning(f"rate_limit_approached | ip={ip_address} | count={attempt_count}")
```

**What to include:**
- Entity IDs (user_id, patient_id, etc.)
- Input parameters (email, phone - NOT passwords)
- Error details and types
- Counts and metrics
- Duration for performance-sensitive operations

**Log Levels:**
- `DEBUG`: Detailed flow with full data (dev only)
- `INFO`: Key actions with identifiers
- `WARNING`: Recoverable issues
- `ERROR`: Failures with full context

## Development Workflow

### Starting Development Server

```bash
./devStartBE.sh
```

### Running Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py
```

## Dependencies Update Protocol

When adding new dependencies:

1. Install using UV native: `uv add <package>`
2. Dependencies are automatically added to `pyproject.toml` and `uv.lock`
3. Test that the application still works
4. Commit code changes, `pyproject.toml`, and `uv.lock`

## Common Packages

- **FastAPI**: Web framework
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation
- **Alembic**: Database migrations
- **bcrypt**: Password hashing
- **PyJWT**: JWT token handling
- **pytest**: Testing framework
- **uvicorn**: ASGI server

---

**Last Updated**: 2026-01-22
