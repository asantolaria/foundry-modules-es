#!/usr/bin/env bash
# Reconstruye el módulo chronosia-es DESDE el mundo maestro y publica una versión nueva.
# Uso:  bash update-chronosia.sh [version] [ruta-mundo]
#   version    p.ej. 1.2.0  (si se omite, no toca la versión)
#   ruta-mundo (por defecto: data/Data/worlds/chronosia del árbol foundryVTT)
set -e
cd "$(dirname "$0")"
MOD="chronosia-es"
VER="$1"
WORLD="${2:-$HOME/Documentos/ASant-Github/foundryVTT/data/Data/worlds/chronosia}"
FVTT="$(cd ../dnd5e-2024-es/node_modules/.bin && pwd)/fvtt"

echo "Mundo maestro: $WORLD"
echo "1/5 unpack del mundo → packs-src";        node "$MOD/tools/unpack.js" "$WORLD"
echo "2/5 reescribir rutas + limpiar";          node "$MOD/tools/process.js"
echo "3/5 construir Aventura";                  node "$MOD/tools/build-adventure.js"
echo "4/5 compilar packs"
( cd "$MOD" && rm -rf packs && mkdir packs
  for p in objetos lore bestiario lugartenientes escenas aventura; do
    "$FVTT" package pack "$p" --in "packs-src/$p" --out packs --id "$MOD" --type Module >/dev/null && echo "    ✓ $p"
  done )
if [ -n "$VER" ]; then
  node -e 'const fs=require("fs");const p=process.argv[1];const m=JSON.parse(fs.readFileSync(p));m.version=process.argv[2];fs.writeFileSync(p,JSON.stringify(m,null,2));console.log("    versión → v"+m.version)' "$MOD/module.json" "$VER"
fi
echo "5/5 publicar (push + release)";            bash publish.sh
