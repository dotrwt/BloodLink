@echo off
title BloodLink Launcher
echo ========================================================
echo       Starting BloodLink (Backend + Frontend)
echo ========================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "BloodLink Backend (FastAPI)" cmd /k "cd /d "%~dp0" && call .\venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "BloodLink Frontend (Vite)" cmd /k "cd /d "%~dp0MediCare" && npm run dev"

timeout /t 3 >nul
start http://localhost:5173

echo.
echo ========================================================
echo   BloodLink is running!
echo   * Web App:      http://localhost:5173
echo   * Swagger Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo.
pause
