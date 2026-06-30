#!/usr/bin/env bash
#
# Starts the API and web app in development mode
# (API: http://localhost:4000, web: http://localhost:3000).
#
# The character sheet is now embedded directly in web/src, so there is no
# separate library to compile.
#
# The API dev env (DB_URI, CORS_URL, ...) comes from api/nodemon.json, so a local
# MongoDB on 127.0.0.1:27017 is the only external prerequisite.
#
# Usage:
#   ./dev.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API="$ROOT/api"
WEB="$ROOT/web"

# Pick a package runner; the project uses yarn.
run() { if command -v yarn >/dev/null 2>&1; then yarn "$@"; else npm run "$@"; fi; }

# Ensure dependencies exist before launching.
[[ -d "$API/node_modules" ]] || (echo "==> Installing API deps"; cd "$API" && yarn install --ignore-engines)
[[ -d "$WEB/node_modules" ]] || (echo "==> Installing web deps"; cd "$WEB" && yarn install --ignore-engines)

# Track child PIDs and shut everything down together.
pids=()
cleanup() {
  echo
  echo "==> Shutting down dev servers"
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "==> Starting API (nodemon) on http://localhost:4000"
(cd "$API" && run dev) &
pids+=($!)

echo "==> Starting web (vite) on http://localhost:3000"
(cd "$WEB" && BROWSER=none run start) &
pids+=($!)

echo "==> Both servers running. Press Ctrl+C to stop."
wait
