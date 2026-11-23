#!/bin/sh
# PM2 on this server runs `next start` from the repository root.
# The website now lives in apps/web and the API is a separate process.
BIN_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$BIN_DIR/../../.." && pwd)
REAL="$ROOT/node_modules/next/dist/bin/next"

if [ "$1" = "start" ] && [ "$#" -eq 1 ]; then
  exec node "$ROOT/scripts/start-production.mjs"
fi

exec node "$REAL" "$@"
