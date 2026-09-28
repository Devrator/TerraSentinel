@echo off
TITLE TerraSentinel Production Platform Launcher
echo =====================================================================
echo           TERRASENTINEL - AI ENVIRONMENTAL MONITORING PLATFORM
echo               Production Deployment Launcher (SIH26178)
echo =====================================================================
echo.

:: Check Docker availability
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Docker detected. Starting multi-container production stack...
    docker-compose up -d --build
    echo.
    echo =====================================================================
    echo [SUCCESS] TerraSentinel is live in production containers!
    echo   - Public Portal & Agency Command: http://localhost:80
    echo   - FastAPI Swagger / Docs:         http://localhost:8000/docs
    echo   - Real-Time WebSocket Endpoint:   ws://localhost:8000/ws/dashboard
    echo =====================================================================
    goto end
)

echo [INFO] Docker not found in PATH. Launching native Python + Node processes...
echo.

:: Step 1: Python Virtual Environment & Backend
if exist .venv\Scripts\activate.bat (
    echo [1/2] Activating Python virtual environment...
    call .venv\Scripts\activate.bat
) else (
    echo [WARN] .venv not found. Using system python...
)

echo [2/2] Starting FastAPI Backend on http://localhost:8000...
start "TerraSentinel Backend API" cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

:: Step 2: Frontend Production Server
cd frontend
if not exist node_modules (
    echo [INFO] Installing frontend dependencies...
    call npm install
)

echo [INFO] Starting Frontend Dev Server on http://localhost:5173...
start "TerraSentinel Frontend UI" cmd /k "npm run dev"

echo.
echo =====================================================================
echo [SUCCESS] TerraSentinel Dual Services Started!
echo   - Web Application: http://localhost:5173
echo   - Backend API:     http://localhost:8000
echo =====================================================================

:end
pause
