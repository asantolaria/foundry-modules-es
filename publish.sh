#!/usr/bin/env bash
# Publica vía raw: construye los zips en la raíz del repo y hace push. Lánzalo: bash publish.sh
set -e
cd "$(dirname "$0")"
zipmod(){ local m=$1; rm -f "$m.zip"; ( cd "$m" && zip -rq "../$m.zip" . -x './packs-src/*' './build.sh' '*LOCK' ); echo "  $m.zip $(ls -lh $m.zip|awk '{print $5}')"; }
zipmod chronosia-es
zipmod combat-feedback-es
git add -A
git -c user.name="Alex Santolaria" commit -q -m "publicar zips $(date +%F)" || echo "  (sin cambios)"
git remote get-url origin >/dev/null 2>&1 || git remote add origin git@github.com-asantolaria:asantolaria/foundry-modules-es.git
git push -u origin main
echo "✅ Manifiestos (gestor de módulos):"
echo "  https://raw.githubusercontent.com/asantolaria/foundry-modules-es/main/chronosia-es/module.json"
echo "  https://raw.githubusercontent.com/asantolaria/foundry-modules-es/main/combat-feedback-es/module.json"
