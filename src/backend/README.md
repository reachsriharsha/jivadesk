# JivaDesk Backend

FastAPI-based REST API for JivaDesk clinic management system.

## Prerequisites

- **Python 3.12+**
- **uv** (Python package manager) - [Install uv](https://github.com/astral-sh/uv)
- **PostgreSQL 15+**
- **Docker** (optional, for running PostgreSQL)

## Technology Stack

- **Framework:** FastAPI 0.128
- **Database:** PostgreSQL 15 with SQLAlchemy 2.0 ORM
- **Migrations:** Alembic
- **Authentication:** JWT with PyJWT
- **Password Hashing:** bcrypt
- **Server:** Uvicorn

## Project Setup (Linux)

### 1. Install uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Clone and Navigate

```bash
cd /path/to/jivadesk/src/backend
```

### 3. Install Dependencies

Using uv's native dependency management:

```bash
# Install all dependencies and create virtual environment
uv sync
```

This will:
- Create a virtual environment in `.venv/`
- Install all dependencies from `pyproject.toml`
- Lock dependencies in `uv.lock`

### 4. Setup Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
cd ../../docker
docker-compose up -d
```

This starts PostgreSQL on `localhost:5432` with:
- Database: `jivadesk`
- User: `jivadesk`
- Password: `secret`

#### Option B: Local PostgreSQL

Install PostgreSQL and create database:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE jivadesk;
CREATE USER jivadesk WITH PASSWORD 'secret';
GRANT ALL PRIVILEGES ON DATABASE jivadesk TO jivadesk;
\q
```

### 5. Environment Variables

Create `.env` file in `src/backend/`:

```bash
# Database
DATABASE_URL=postgresql+psycopg2://jivadesk:secret@localhost:5432/jivadesk

# JWT
SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# Application
DEBUG=True
```

### 6. Run Database Migrations

```bash
# Run migrations to create tables
uv run alembic upgrade head
```

Available migration commands:

```bash
# Create new migration (auto-detect changes)
uv run alembic revision --autogenerate -m "description"

# Upgrade to latest version
uv run alembic upgrade head

# Downgrade one version
uv run alembic downgrade -1

# View migration history
uv run alembic history

# View current version
uv run alembic current
```

## Running the Application

### Development Server

```bash
# Start development server with auto-reload
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or using the provided script:

```bash
chmod +x devStartBE.sh
./devStartBE.sh
```

The API will be available at:
- **API:** http://localhost:8000
- **Interactive Docs (Swagger):** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Production Server

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Development

### Adding Dependencies

```bash
# Add a new package
uv add package-name

# Add development dependency
uv add --dev package-name

# Update all dependencies
uv sync
```

### Code Quality

```bash
# Format code
uv run black app/

# Lint code
uv run ruff check app/

# Type checking
uv run mypy app/
```

## Testing

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app --cov-report=html

# Run specific test file
uv run pytest tests/test_auth.py

# Run specific test
uv run pytest tests/test_auth.py::test_register_user
```

Coverage report will be generated in `htmlcov/index.html`.

## Project Structure

```
backend/
├── alembic/                # Database migrations
│   └── versions/           # Migration files
├── app/
│   ├── api/                # API endpoints (routers)
│   │   └── auth.py         # Authentication endpoints
│   ├── database/
│   │   ├── models/         # SQLAlchemy ORM models
│   │   │   ├── base.py     # Base model
│   │   │   └── user.py     # User model
│   │   ├── repositories/   # Data access layer
│   │   │   └── user_repository.py
│   │   └── connection.py   # Database connection
│   ├── schemas/            # Pydantic schemas
│   │   └── auth.py         # Request/response schemas
│   ├── services/           # Business logic layer
│   │   └── auth_service.py
│   ├── utils/              # Utility functions
│   │   ├── jwt.py          # JWT handling
│   │   └── password.py     # Password hashing
│   ├── config.py           # Configuration
│   ├── logging_config.py   # Logging setup
│   └── main.py             # FastAPI application
├── tests/                  # Test files
├── alembic.ini             # Alembic configuration
├── pyproject.toml          # Project dependencies (uv)
├── uv.lock                 # Locked dependencies
└── README.md               # This file
```

## API Endpoints

### Authentication

| Method | Endpoint                 | Description                    | Auth Required |
|--------|--------------------------|--------------------------------|---------------|
| POST   | /api/v1/auth/register    | Register new user              | No            |
| POST   | /api/v1/auth/login       | Login user                     | No            |
| PUT    | /api/v1/auth/profile-setup | Complete profile setup       | Yes           |
| GET    | /api/v1/auth/me          | Get current user profile       | Yes           |
| POST   | /api/v1/auth/check-email | Check email availability       | No            |
| POST   | /api/v1/auth/check-phone | Check phone availability       | No            |

## Database Schema

### Users Table

| Column                       | Type         | Constraints    |
|------------------------------|--------------|----------------|
| id                           | UUID         | PRIMARY KEY    |
| email                        | VARCHAR(255) | UNIQUE, NOT NULL |
| phone                        | VARCHAR(15)  | UNIQUE, NOT NULL |
| password_hash                | VARCHAR(255) | NOT NULL       |
| full_name                    | VARCHAR(100) | NULLABLE       |
| medical_registration_number  | VARCHAR(20)  | UNIQUE, NULLABLE |
| qualification                | VARCHAR(100) | NULLABLE       |
| specialization               | VARCHAR(100) | NULLABLE       |
| is_email_verified            | BOOLEAN      | DEFAULT false  |
| is_phone_verified            | BOOLEAN      | DEFAULT false  |
| is_profile_complete          | BOOLEAN      | DEFAULT false  |
| is_active                    | BOOLEAN      | DEFAULT true   |
| terms_accepted_at            | TIMESTAMP    | NOT NULL       |
| created_at                   | TIMESTAMP    | DEFAULT NOW()  |
| updated_at                   | TIMESTAMP    | DEFAULT NOW()  |

## Logging

All logs include:
- Timestamp
- Log level (DEBUG, INFO, WARN, ERROR)
- File and line number (automatic)
- Contextual data (action, IDs, parameters)

Format: `[timestamp] [level] [file:line] action | key=value | key=value`

Example:
```
[2026-01-24 10:30:00] [INFO] [auth.py:65] registration_started | email=doctor@example.com | phone=9876543210
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check Docker container
docker ps
docker-compose logs
```

### Migration Conflicts

```bash
# Reset database (WARNING: Deletes all data)
uv run alembic downgrade base
uv run alembic upgrade head

# Or drop and recreate database
sudo -u postgres psql
DROP DATABASE jivadesk;
CREATE DATABASE jivadesk;
```

## Performance Tuning

### Database Connection Pool

Edit `app/database/connection.py`:

```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,          # Number of connections to maintain
    max_overflow=10,       # Additional connections allowed
    pool_pre_ping=True,    # Verify connections before using
)
```

### Uvicorn Workers

```bash
# Use multiple workers for production
uv run uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
```

Number of workers = (2 × CPU cores) + 1

## Security Notes

- **Never commit `.env` files** to version control
- **Change `SECRET_KEY`** in production (use a long random string)
- **Use HTTPS** in production
- **Set `DEBUG=False`** in production
- **Enable CORS** only for trusted origins
- **Implement rate limiting** for public endpoints

## Useful Commands

```bash
# Check Python version
python --version

# Check uv version
uv --version

# View installed packages
uv pip list

# Create new migration
uv run alembic revision --autogenerate -m "add new field"

# Check database connection
uv run python -c "from app.database.connection import engine; print(engine.url)"

# Start interactive Python shell with app context
uv run python
>>> from app.main import app
>>> from app.database.connection import SessionLocal
>>> db = SessionLocal()
```

## Contributing

1. Follow the layered architecture (API → Service → Repository → Model)
2. Use Pydantic for all request/response validation
3. Follow logging guidelines (see CLAUDE.md)
4. Write tests for new features
5. Run migrations for database changes
6. Use type hints throughout

## Documentation

- [API Documentation](http://localhost:8000/docs) - Swagger UI
- [Feature Specifications](../../docs/features/) - Detailed specs
- [Design Documents](../../docs/design/) - Technical designs
- [Development Rules](./DEVELOPMENT_RULES.md) - Coding standards

## License

Proprietary - JivaDesk

---

For frontend setup, see `../frontend/README.md`
