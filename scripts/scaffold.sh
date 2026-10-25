#!/usr/bin/env bash
# Usage: bash scaffold.sh <dest-folder>
set -e
DEST="${1:?usage: scaffold.sh <dest-folder>}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$DEST"
cp -r "$HERE/assets/starter-project/." "$DEST/"
cd "$DEST"
npm install
PY=$(command -v python3 || command -v python || command -v py)
$PY -m pip install numpy -q || true
$PY scripts/make_audio.py
npx tsc --noEmit && echo "typecheck OK"
echo "Next: npm start  |  pip install edge-tts && npm run vo  |  npm run render"
