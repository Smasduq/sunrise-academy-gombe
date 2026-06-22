#!/usr/bin/env bash
# Start Sunrise Academy Gombe — backend, public frontend, and admin panel.
#
# Usage:
#   Git Bash / macOS / Linux:  ./start-all.sh
#   Windows PowerShell:        .\start-all.ps1
#
# Requires: Node.js, npm, Python 3.11+

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
ADMIN_PORT="${ADMIN_PORT:-3001}"

PIDS=()

log() {
  printf '\033[1;36m[sunrise]\033[0m %s\n' "$*"
}

warn() {
  printf '\033[1;33m[sunrise]\033[0m %s\n' "$*" >&2
}

fail() {
  printf '\033[1;31m[sunrise]\033[0m %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

activate_backend_venv() {
  if [[ -f "$ROOT/backend/.venv/bin/activate" ]]; then
    # Linux, macOS, Git Bash
    # shellcheck source=/dev/null
    source "$ROOT/backend/.venv/bin/activate"
  elif [[ -f "$ROOT/backend/.venv/Scripts/activate" ]]; then
    # Windows venv
    # shellcheck source=/dev/null
    source "$ROOT/backend/.venv/Scripts/activate"
  else
    fail "Backend venv not found. Run: cd backend && python3 -m venv .venv && pip install -r requirements.txt"
  fi
}

cleanup() {
  log "Stopping services..."
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

require_cmd node
require_cmd npm

PYTHON=""
if command -v python3 >/dev/null 2>&1; then
  PYTHON=python3
elif command -v python >/dev/null 2>&1; then
  PYTHON=python
else
  fail "Missing required command: python3 or python"
fi

[[ -d "$ROOT/backend" ]] || fail "backend/ directory not found"
[[ -d "$ROOT/frontend" ]] || fail "frontend/ directory not found"
[[ -d "$ROOT/admin" ]] || fail "admin/ directory not found"

if [[ ! -f "$ROOT/backend/.env" ]]; then
  warn "backend/.env missing — copy backend/.env.example to backend/.env and configure it."
fi

if [[ ! -d "$ROOT/frontend/node_modules" ]]; then
  log "Installing frontend dependencies..."
  npm install --prefix "$ROOT/frontend"
fi

if [[ ! -d "$ROOT/admin/node_modules" ]]; then
  log "Installing admin dependencies..."
  npm install --prefix "$ROOT/admin"
fi

activate_backend_venv

log "Starting FastAPI backend on http://127.0.0.1:${BACKEND_PORT}"
(
  cd "$ROOT/backend"
  exec "$PYTHON" -m uvicorn app.main:app --reload --host 0.0.0.0 --port "$BACKEND_PORT"
) &
PIDS+=($!)

log "Starting public frontend on http://127.0.0.1:${FRONTEND_PORT}"
(
  cd "$ROOT/frontend"
  exec npm run dev -- --port "$FRONTEND_PORT"
) &
PIDS+=($!)

log "Starting admin panel on http://127.0.0.1:${ADMIN_PORT}"
(
  cd "$ROOT/admin"
  exec npm run dev
) &
PIDS+=($!)

echo
log "All services running:"
echo "  API:      http://127.0.0.1:${BACKEND_PORT}"
echo "  Frontend: http://127.0.0.1:${FRONTEND_PORT}"
echo "  Admin:    http://127.0.0.1:${ADMIN_PORT}"
echo
log "Press Ctrl+C to stop everything."

wait
