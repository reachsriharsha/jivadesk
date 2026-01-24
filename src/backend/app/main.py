# Entry point for FastAPI app
from fastapi import FastAPI
from app.api import auth, patients, visits, prescriptions, medicines, loglevel
from app.logging_config import get_logger
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug
)
logger = get_logger(__name__)

logger.info(f"backend_server_started | app_name={settings.app_name} | debug={settings.debug}")

# Register routers
app.include_router(auth.router, prefix="/api/v1/auth")
app.include_router(patients.router, prefix="/api/v1/patients")
app.include_router(visits.router, prefix="/api/v1/visits")
app.include_router(prescriptions.router, prefix="/api/v1/prescriptions")
app.include_router(medicines.router, prefix="/api/v1/medicines")
app.include_router(loglevel.router, prefix="/api/v1/loglevel")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
