#!/usr/bin/env bash
# Publica el monorepo y crea/actualiza las releases. Lánzalo tú: bash publish.sh
set -e
cd "$(dirname "$0")"
REPO="asantolaria/foundry-modules-es"
gh auth switch --user asantolaria >/dev/null 2>&1 || true
gh repo view "$REPO" >/dev/null 2>&1 || gh repo create "$REPO" --public -d "Módulos propios Foundry VTT (dnd5e), en español"
git remote remove origin 2>/dev/null || true
git remote add origin "git@github.com-asantolaria:$REPO.git"
git push -u origin main
zipmod(){ local m=$1; rm -f "/tmp/$m.zip"; ( cd "$m" && zip -rq "/tmp/$m.zip" . -x './packs-src/*' './build.sh' '*LOCK' ); }
rel(){ local tag=$1 m=$2 title=$3; 
  gh release create "$tag" "/tmp/$m.zip" "$m/module.json" -t "$title" -n "$title" 2>/dev/null \
  || gh release upload "$tag" "/tmp/$m.zip" "$m/module.json" --clobber; }
zipmod chronosia-es;        rel chronosia-es-v1.0.0       chronosia-es       "chronosia-es v1.0.0"
zipmod combat-feedback-es;  rel combat-feedback-es-v0.1.0 combat-feedback-es "combat-feedback-es v0.1.0"
echo; echo "✅ PUBLICADO. URLs de manifiesto para el gestor de módulos:"
echo "  https://raw.githubusercontent.com/asantolaria/foundry-modules-es/main/chronosia-es/module.json"
echo "  https://raw.githubusercontent.com/asantolaria/foundry-modules-es/main/combat-feedback-es/module.json"
