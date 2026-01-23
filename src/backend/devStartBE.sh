#!/bin/bash
# Script to activate venv and start the FastAPI backend server in development mode

cd "$(dirname "$0")"

# Activate the Python virtual environment
source app/.venv/bin/activate

# Start the backend server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000