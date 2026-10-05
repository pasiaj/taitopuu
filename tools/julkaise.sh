#!/bin/sh
# Kopioi peruskoulun taitopuun xpostiin, josta se tarjoillaan osoitteessa
# pasiaj.com/taitopuu/peruskoulu/. Pushaa xpost erikseen: push julkaisee.
set -e
cd "$(dirname "$0")/.."
XPOST="${XPOST:-$HOME/projects/xpost}"
DEST="$XPOST/nginx/www/pasiaj.com/taitopuu/peruskoulu"
mkdir -p "$DEST"
rsync -a --delete peruskoulu/ "$DEST/"
# versioleima: selain ei käytä vanhaa data.js:ää tai puu.js:ää välimuistista
REV=$(git rev-parse --short HEAD)
for f in "$DEST/index.html" "$DEST/esittely/index.html"; do
  sed -i.bak -E "s#src=\"(\.\./)?(data|puu)\.js\"#src=\"\1\2.js?v=$REV\"#g" "$f" && rm "$f.bak"
done
echo "Kopioitu: $DEST ($(git rev-parse --short HEAD))"
