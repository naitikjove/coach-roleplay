#!/usr/bin/env bash
# Refresh production/ and reference/ from a local b2c-ui-main checkout.
# Usage: ./scripts/sync-from-prod.sh [/path/to/b2c-ui-main]

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UI="${1:-$(dirname "$ROOT")/b2c-ui-main}"

if [[ ! -d "$UI/src/app/arena/exp7" ]]; then
  echo "b2c-ui-main not found at: $UI" >&2
  exit 1
fi

echo "Syncing from $UI …"

rsync -a --exclude '_parked' "$UI/src/app/arena/exp7/" "$ROOT/production/src/app/arena/exp7/"
rsync -a "$UI/src/app/api/arena/exp7/" "$ROOT/production/src/app/api/arena/exp7/"
rsync -a --exclude '_parked' "$UI/src/lib/arena/exp7/" "$ROOT/production/src/lib/arena/exp7/"
rsync -a "$UI/arena/exp7/" "$ROOT/production/arena/exp7/"
mkdir -p "$ROOT/production/src/lib/arena"
cp "$UI/src/lib/arena/loadOpenAiKey.ts" "$ROOT/production/src/lib/arena/"

cp "$UI/arena/exp7/prompts/"*.prompt.txt "$ROOT/reference/prompts/" 2>/dev/null || true
cp "$UI/arena/exp7/config/"*.json "$ROOT/reference/scenes/" 2>/dev/null || true
cp "$UI/src/app/arena/exp7/pre-post/CONTENT_FINAL.md" "$ROOT/reference/"
cp "$UI/vercel.exp7-pre-post.json" "$ROOT/reference/"

echo "Done. Review diff and update docs/CHANGELOG.md if needed."
