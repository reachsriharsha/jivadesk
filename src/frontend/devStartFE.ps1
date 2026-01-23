# devStartFE.ps1
# Script to start the frontend development server on Windows

$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $PSScriptRoot

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Attempting to install dependencies..." -ForegroundColor Cyan
    if (Get-Command "bun" -ErrorAction SilentlyContinue) {
        bun install
    } else {
        npm install
    }
}

# Determine the runner (bun or npm)
if (Get-Command "bun" -ErrorAction SilentlyContinue) {
    Write-Host "Starting frontend with Bun..." -ForegroundColor Green
    bun run dev
} elseif (Get-Command "npm" -ErrorAction SilentlyContinue) {
    Write-Host "Starting frontend with NPM..." -ForegroundColor Green
    npm run dev
} else {
    Write-Error "Neither Bun nor NPM/Node.js was found. Please install a JavaScript runtime to run the frontend."
    exit 1
}
