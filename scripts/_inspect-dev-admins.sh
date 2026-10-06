#!/usr/bin/env bash
set -euo pipefail
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
URL="$(grep -E '^DATABASE_URL=' .env | cut -d= -f2-)"
psql "$URL" -c 'select id, email, role, "emailVerified", "accessEnabled" from users order by role, email;'
