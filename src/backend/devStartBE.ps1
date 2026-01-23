# devStartBE.ps1
# Script to activate venv and start the FastAPI backend server on Windows

$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $PSScriptRoot

# Check for the root venv first (where dependencies are currently installed)
$rootVenv = Join-Path $PSScriptRoot "..\..\.venv\Scripts\Activate.ps1"
# Check for the local app venv
$localVenv = Join-Path $PSScriptRoot "app\.venv\Scripts\Activate.ps1"

if (Test-Path $rootVenv) {
    Write-Host "Activating root virtual environment..." -ForegroundColor Cyan
    . $rootVenv
} elseif (Test-Path $localVenv) {
    Write-Host "Activating local virtual environment..." -ForegroundColor Cyan
    . $localVenv
} else {
    Write-Error "Virtual environment not found. Please ensure a .venv exists in either the project root or src/backend/app/"
    exit 1
}

Write-Host "Starting backend server on http://localhost:8000..." -ForegroundColor Green
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
