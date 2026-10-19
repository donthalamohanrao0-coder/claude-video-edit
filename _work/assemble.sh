#!/usr/bin/env bash
# usage: assemble.sh <remotion video.mp4> <final mix.wav> <out.mp4>
# Muxes the Remotion render with the SFX mix; re-encodes to stay under GitHub's 100 MB file limit.
set -euo pipefail
VID=$1; AUD=$2; OUT=$3
ffmpeg -y -hide_banner -loglevel error -stats -i "$VID" -i "$AUD" -map 0:v -map 1:a \
  -c:v libx264 -preset slow -b:v 5000k -maxrate 8000k -bufsize 12000k -pix_fmt yuv420p -r 60 \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$OUT"
