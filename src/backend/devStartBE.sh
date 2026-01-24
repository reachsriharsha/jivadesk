#!/bin/bash
# Development startup script for JivaDesk Backend
# This script:
# 1. Starts PostgreSQL via Docker
# 2. Runs database migrations
# 3. Starts FastAPI development server

set -e  # Exit on error

echo "🚀 Starting JivaDesk Backend Development Environment..."

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCKER_DIR="$SCRIPT_DIR/../../docker"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Start Docker containers
echo -e "\n${YELLOW}📦 Step 1: Starting PostgreSQL database...${NC}"
cd "$DOCKER_DIR"

if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Database already running${NC}"
else
    docker-compose up -d
    echo -e "${GREEN}✓ Database started${NC}"

    # Wait for PostgreSQL to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 3
fi

# Step 2: Run database migrations
echo -e "\n${YELLOW}🗄️  Step 2: Running database migrations...${NC}"
cd "$SCRIPT_DIR"
uv run alembic upgrade head
echo -e "${GREEN}✓ Migrations applied${NC}"

# Step 3: Start FastAPI server
echo -e "\n${YELLOW}🌐 Step 3: Starting FastAPI development server...${NC}"
echo -e "${GREEN}Backend will be available at:${NC}"
echo "  📍 API: http://localhost:8000"
echo "  📚 Docs: http://localhost:8000/docs"
echo "  📖 ReDoc: http://localhost:8000/redoc"
echo ""
echo "Press CTRL+C to stop the server"
echo "─────────────────────────────────────────────────"

uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
