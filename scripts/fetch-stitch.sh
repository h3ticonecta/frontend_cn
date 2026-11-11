#!/usr/bin/env bash
# Baixa HTML/PNG do Stitch (URLs assinadas do get_screen).
# Uso: bash scripts/fetch-stitch.sh "<downloadUrl>" ".stitch/designs/roleta.html"
set -euo pipefail
url="${1:?URL}"
out="${2:?output path}"
mkdir -p "$(dirname "$out")"
curl -fsSL "$url" -o "$out"
echo "Saved $out"
