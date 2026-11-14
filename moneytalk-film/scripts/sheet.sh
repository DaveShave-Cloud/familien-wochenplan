#!/usr/bin/env bash
# Kontaktbogen aus Standbildern: bash scripts/sheet.sh <ordner> <ausgabe.png> [spalten] [kachelbreite]
set -euo pipefail
DIR="${1:?Ordner}"; OUT="${2:?Ausgabe}"; COLS="${3:-2}"; W="${4:-960}"
N=$(ls "$DIR"/*.png | wc -l)
ROWS=$(( (N + COLS - 1) / COLS ))
ffmpeg -v error -y -pattern_type glob -i "$DIR/*.png" -vf "scale=$W:-1,tile=${COLS}x${ROWS}:padding=6:color=0x444444" -frames:v 1 "$OUT"
