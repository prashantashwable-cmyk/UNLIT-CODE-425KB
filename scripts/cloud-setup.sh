#!/usr/bin/env bash
# Environment setup script for Claude Code on the web. Idempotent. Needs apt reachable (Trusted/Full network).
set -uo pipefail
if ! command -v psql >/dev/null; then
  apt-get update -y >/dev/null 2>&1
  apt-get install -y postgresql postgresql-contrib postgis ripgrep jq >/dev/null 2>&1 \
    || echo "WARN: package install failed; check network access level"
fi
bash "$(dirname "$0")/test-db.sh" start || true
exit 0
