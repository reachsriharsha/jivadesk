# Entry point for FastAPI app
from fastapi import FastAPI
from app.api import auth, patients, visits, prescriptions, medicines

app = FastAPI()

# Register routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["patients"])
app.include_router(visits.router, prefix="/api/v1/visits", tags=["visits"])
app.include_router(prescriptions.router, prefix="/api/v1/prescriptions", tags=["prescriptions"])
app.include_router(medicines.router, prefix="/api/v1/medicines", tags=["medicines"])
