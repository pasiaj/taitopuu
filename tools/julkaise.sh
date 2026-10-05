#!/bin/sh
# Kopioi peruskoulun taitopuun xpostiin, josta se tarjoillaan osoitteessa
# pasiaj.com/taitopuu/peruskoulu/. Pushaa xpost erikseen: push julkaisee.
set -e
cd "$(dirname "$0")/.."
XPOST="${XPOST:-$HOME/projects/xpost}"
DEST="$XPOST/nginx/www/pasiaj.com/taitopuu/peruskoulu"
mkdir -p "$DEST"
rsync -a --delete peruskoulu/ "$DEST/"
echo "Kopioitu: $DEST ($(git rev-parse --short HEAD))"
