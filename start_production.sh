#!/usr/bin/env bash
set -e

echo "====================================================================="
echo "          TERRASENTINEL - AI ENVIRONMENTAL MONITORING PLATFORM       "
echo "              Production Deployment Launcher (SIH26178)              "
echo "====================================================================="
echo ""

if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "[INFO] Docker & Docker Compose found. Launching containerized stack..."
    docker-compose up -d --build
    echo ""
    echo "====================================================================="
    echo "[SUCCESS] TerraSentinel is live in production containers!"
    echo "  - Public & Agency Platform: http://localhost:80"
    echo "  - FastAPI Swagger Docs:     http://localhost:8000/docs"
    echo "  - WebSocket Ingestion Hub:  ws://localhost:8000/ws/dashboard"
    echo "====================================================================="
    exit 0
fi

echo "[INFO] Running native fallback mode..."

# Activate python virtualenv if exists
if [ -d ".venv" ]; then
    echo "[1/2] Activating .venv..."
    source .venv/bin/activate
fi

# Start backend
echo "[2/2] Starting FastAPI Backend on port 8000..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "[INFO] Starting Frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "====================================================================="
echo "[SUCCESS] TerraSentinel Services Running in Background"
echo "  - Backend PID:  $BACKEND_PID"
echo "  - Frontend PID: $FRONTEND_PID"
echo "  - Open: http://localhost:5173"
echo "====================================================================="

wait
