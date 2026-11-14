#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if ! command -v python3 >/dev/null 2>&1; then echo "Python 3 is required. Install Python 3.11 or newer."; exit 1; fi
if ! command -v node >/dev/null 2>&1; then echo "Node.js 20 or newer is required. Install Node.js first."; exit 1; fi

if [ ! -d "$ROOT/backend/.venv" ]; then python3 -m venv "$ROOT/backend/.venv"; fi
"$ROOT/backend/.venv/bin/python" -m pip install --upgrade pip
"$ROOT/backend/.venv/bin/pip" install -r "$ROOT/backend/requirements.txt"

if [ ! -d "$ROOT/frontend/node_modules" ]; then (cd "$ROOT/frontend" && npm install); fi

"$ROOT/backend/.venv/bin/uvicorn" app.main:app --app-dir "$ROOT/backend" --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cleanup() { kill "$BACKEND_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

cd "$ROOT/frontend"
npm run dev
