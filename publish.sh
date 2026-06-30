#!/usr/bin/env bash
# Publica vía GitHub Releases (tag = id del módulo, rodante). Lánzalo: bash publish.sh
set -e
cd "$(dirname "$0")"
gh auth switch --user asantolaria >/dev/null 2>&1 || true
git remote get-url origin >/dev/null 2>&1 || git remote add origin git@github.com-asantolaria:asantolaria/foundry-modules-es.git
git add -A && git -c user.name="Alex Santolaria" commit -q -m "manifiestos vía releases $(date +%F)" || echo "  (sin cambios)"
git push -u origin main
pub(){ local id=$1 title=$2; rm -f "/tmp/$id.zip"
  ( cd "$id" && zip -rq "/tmp/$id.zip" . -x './packs-src/*' './build.sh' '*LOCK' )
  if gh release view "$id" >/dev/null 2>&1; then
    gh release upload "$id" "/tmp/$id.zip" "$id/module.json" --clobber
  else
    gh release create "$id" "/tmp/$id.zip" "$id/module.json" -t "$title" -n "$title"
  fi
  echo "  ✓ release $id"
}
pub chronosia-es       "Chronosia (ES)"
pub combat-feedback-es "Feedback de Combate (ES)"
echo; echo "✅ URLs de manifiesto (gestor de módulos):"
echo "  https://github.com/asantolaria/foundry-modules-es/releases/download/chronosia-es/module.json"
echo "  https://github.com/asantolaria/foundry-modules-es/releases/download/combat-feedback-es/module.json"
