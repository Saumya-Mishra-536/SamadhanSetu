#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

PYTHON_BIN=""
for candidate in python3.12 python3.11 python3.13 python3.14 python3; do
  if command -v "$candidate" >/dev/null 2>&1; then
    if "$candidate" -c 'import sys; raise SystemExit(0 if (3, 11) <= sys.version_info[:2] < (3, 15) else 1)'; then
      PYTHON_BIN="$candidate"
      break
    fi
  fi
done
if [ -z "$PYTHON_BIN" ]; then echo "Python 3.11, 3.12, 3.13 or 3.14 is required."; exit 1; fi
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then echo "Node.js 20 or newer (including npm) is required."; exit 1; fi

if [ -d "$ROOT/backend/.venv" ] && ! "$ROOT/backend/.venv/bin/python" -c 'import sys; raise SystemExit(0 if (3, 11) <= sys.version_info[:2] < (3, 15) else 1)'; then
  rm -rf "$ROOT/backend/.venv"
fi
if [ ! -d "$ROOT/backend/.venv" ]; then "$PYTHON_BIN" -m venv "$ROOT/backend/.venv"; fi
"$ROOT/backend/.venv/bin/python" -m pip install --upgrade pip
"$ROOT/backend/.venv/bin/pip" install -r "$ROOT/backend/requirements.txt"

if [ ! -d "$ROOT/frontend/node_modules" ]; then (cd "$ROOT/frontend" && npm install); fi

"$ROOT/backend/.venv/bin/uvicorn" app.main:app --app-dir "$ROOT/backend" --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cleanup() { kill "$BACKEND_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

cd "$ROOT/frontend"
npm run dev
