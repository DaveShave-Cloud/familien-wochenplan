#!/usr/bin/env bash
# Standbilder zur Sichtkontrolle:  bash scripts/stills.sh 60,150,600  [zielordner]
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/generate-audio.mjs --if-missing
FRAMES="${1:?Frames angeben, z. B. 60,150,600}"
OUT="${2:-out/stills}"
mkdir -p "$OUT"
npx remotion render Film1 "$OUT" --frames="$FRAMES" --image-format=png --sequence --log=error --is-production=false ${PROPS:+--props="$PROPS"}
ls "$OUT"
