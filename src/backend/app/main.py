# Entry point for FastAPI app
from fastapi import FastAPI
from app.api import auth, patients, visits, prescriptions, medicines
from app.logging_config import get_logger
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
logger = get_logger(__name__)

logger.info("Backend server started.")

# Register routers
app.include_router(auth.router, prefix="/api/v1/auth")
app.include_router(patients.router, prefix="/api/v1/patients")
app.include_router(visits.router, prefix="/api/v1/visits")
app.include_router(prescriptions.router, prefix="/api/v1/prescriptions")
app.include_router(medicines.router, prefix="/api/v1/medicines")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://127.0.0.1",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
