# App configuration for JivaDesk
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://jivadesk:secret@db:5432/jivadesk")
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_SECONDS = 3600
