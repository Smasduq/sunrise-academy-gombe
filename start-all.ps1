# Start Sunrise Academy Gombe — backend, public frontend, and admin panel.
# Usage (PowerShell):
#   .\start-all.ps1
# If scripts are blocked:
#   powershell -ExecutionPolicy Bypass -File .\start-all.ps1

$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$BackendPort = if ($env:BACKEND_PORT) { $env:BACKEND_PORT } else { "8000" }
$FrontendPort = if ($env:FRONTEND_PORT) { $env:FRONTEND_PORT } else { "3000" }

function Write-SunriseLog([string]$Message) {
    Write-Host "[sunrise] $Message" -ForegroundColor Cyan
}

function Write-SunriseWarn([string]$Message) {
    Write-Host "[sunrise] $Message" -ForegroundColor Yellow
}

function Stop-SunriseServices {
    Write-SunriseLog "Stopping services..."
    foreach ($proc in $script:Processes) {
        if ($null -ne $proc -and -not $proc.HasExited) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
}

$script:Processes = @()

foreach ($dir in @("backend", "frontend", "admin")) {
    if (-not (Test-Path (Join-Path $Root $dir))) {
        throw "Missing directory: $dir"
    }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is not installed or not on PATH."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm is not installed or not on PATH."
}

$Python = Join-Path $Root "backend\.venv\Scripts\python.exe"
if (-not (Test-Path $Python)) {
    throw @"
Backend venv not found.

Run once:
  cd backend
  py -3 -m venv .venv
  .\.venv\Scripts\Activate.ps1
  pip install -r requirements.txt
  copy .env.example .env
"@
}

if (-not (Test-Path (Join-Path $Root "backend\.env"))) {
    Write-SunriseWarn "backend\.env missing — copy backend\.env.example to backend\.env and configure it."
}

if (-not (Test-Path (Join-Path $Root "frontend\node_modules"))) {
    Write-SunriseLog "Installing frontend dependencies..."
    npm install --prefix (Join-Path $Root "frontend")
}

if (-not (Test-Path (Join-Path $Root "admin\node_modules"))) {
    Write-SunriseLog "Installing admin dependencies..."
    npm install --prefix (Join-Path $Root "admin")
}

$ShellExe = if (Get-Command pwsh -ErrorAction SilentlyContinue) { "pwsh" } else { "powershell" }

Write-SunriseLog "Starting FastAPI backend on http://127.0.0.1:$BackendPort"
$script:Processes += Start-Process -FilePath $ShellExe -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$Root\backend'; Write-Host 'Sunrise API (port $BackendPort)' -ForegroundColor Green; & '$Python' -m uvicorn app.main:app --reload --host 0.0.0.0 --port $BackendPort"
) -PassThru

Write-SunriseLog "Starting public frontend on http://127.0.0.1:$FrontendPort"
$script:Processes += Start-Process -FilePath $ShellExe -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$Root\frontend'; Write-Host 'Sunrise Frontend (port $FrontendPort)' -ForegroundColor Green; npm run dev -- --port $FrontendPort"
) -PassThru

Write-SunriseLog "Starting admin panel on http://127.0.0.1:3001"
$script:Processes += Start-Process -FilePath $ShellExe -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$Root\admin'; Write-Host 'Sunrise Admin (port 3001)' -ForegroundColor Green; npm run dev"
) -PassThru

Write-Host ""
Write-SunriseLog "All services started in separate windows:"
Write-Host "  API:      http://127.0.0.1:$BackendPort"
Write-Host "  Frontend: http://127.0.0.1:$FrontendPort"
Write-Host "  Admin:    http://127.0.0.1:3001"
Write-Host ""
Write-SunriseLog "Press Enter here to stop all services (or close each window manually)."

try {
    Read-Host
}
finally {
    Stop-SunriseServices
}
