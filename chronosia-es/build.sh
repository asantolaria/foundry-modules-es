#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
FVTT="./node_modules/.bin/fvtt"
[ -x "$FVTT" ] || FVTT="../dnd5e-2024-es/node_modules/.bin/fvtt"
rm -rf packs && mkdir -p packs
for p in objetos lore bestiario lugartenientes escenas; do
  "$FVTT" package pack "$p" --in "packs-src/$p" --out packs --id chronosia-es --type Module >/dev/null
  echo "  pack $p ✓"
done
echo "build OK"
