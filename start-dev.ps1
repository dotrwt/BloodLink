Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Starting BloodLink (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Start Backend in a dedicated PowerShell window
Write-Host "`n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000"

# 2. Start Frontend in a dedicated PowerShell window
Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\MediCare'; npm run dev"

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  BloodLink is running!" -ForegroundColor Green
Write-Host "  * Web App:      http://localhost:5173" -ForegroundColor Yellow
Write-Host "  * Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Cyan
