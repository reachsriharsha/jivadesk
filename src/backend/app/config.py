# App configuration for JivaDesk
import os

# Use 'db' when running in Docker, 'localhost' when running locally
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://jivadesk:secret@127.0.0.1:5432/jivadesk")
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_SECONDS = 3600
