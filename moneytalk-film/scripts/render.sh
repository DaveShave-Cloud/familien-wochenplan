#!/usr/bin/env bash
# Rendert den Film als MP4 (H.264, yuv420p, AAC, faststart).
#
#   bash scripts/render.sh film1         vollständiger Film, Ersatzsequenzen gekennzeichnet
#   bash scripts/render.sh film1-clean   vollständiger Film ohne Kennzeichnung
#   bash scripts/render.sh test          Testszene (erste 45,5 Sekunden)
#   bash scripts/render.sh range 2700 3300 ausschnitt   beliebiger Frame-Bereich
#
# Remotion-Lizenz: siehe PROJEKT.md. Mit Lizenzschlüssel: REMOTION_LICENSE_KEY=… setzen.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/generate-audio.mjs --if-missing

MODE="${1:-film1}"
PROPS='{"showPlaceholderLabels":true}'
RANGE=()
case "$MODE" in
  film1)       NAME="ploetzlich-steht-alles-still_vorschau" ;;
  film1-clean) NAME="ploetzlich-steht-alles-still_ohne-kennzeichnung"; PROPS='{"showPlaceholderLabels":false}' ;;
  test)        NAME="film1_testszene"; RANGE=(--frames=0-1364) ;;
  range)       NAME="film1_${4:-ausschnitt}"; RANGE=(--frames="$2-$3") ;;
  *) echo "Unbekannter Modus: $MODE" >&2; exit 1 ;;
esac

mkdir -p out
RAW="out/.${NAME}.raw.mp4"
OUT="out/${NAME}.mp4"

LICENSE=(--is-production=false)
if [ -n "${REMOTION_LICENSE_KEY:-}" ]; then LICENSE=(--license-key="$REMOTION_LICENSE_KEY"); fi

# IMAGE_FORMAT=jpeg rendert etwa doppelt so schnell (für Zwischenstände), png ist die Endqualität.
npx remotion render Film1 "$RAW" "${RANGE[@]}" --props="$PROPS" \
  --image-format="${IMAGE_FORMAT:-png}" \
  --concurrency="${CONCURRENCY:-$(nproc)}" --log=info "${LICENSE[@]}"

# Für das Abspielen von Stick/Laptop: Index an den Dateianfang (faststart), Streams unverändert.
ffmpeg -v error -y -i "$RAW" -c copy -movflags +faststart "$OUT"
rm -f "$RAW"

echo
echo "Fertig: $OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,profile,pix_fmt,width,height,r_frame_rate,sample_rate,channels -of default=noprint_wrappers=1 "$OUT"
