# foundry-modules-es

Módulos propios para **Foundry VTT** (sistema **dnd5e**), en español.

| Módulo | Qué aporta | Instalar (URL de manifiesto) |
|---|---|---|
| **chronosia-es** | Campaña homebrew Chronosia: objetos, lore, bestiario afinado, lugartenientes, 14 escenas | `https://raw.githubusercontent.com/asantolaria/foundry-modules-es/main/chronosia-es/module.json` |
| **combat-feedback-es** | Texto flotante IMPACTO/FALLO/CRÍTICO/PIFIA en combate (Midi-QOL) | `https://raw.githubusercontent.com/asantolaria/foundry-modules-es/main/combat-feedback-es/module.json` |

## Instalar en Foundry
Setup → **Módulos de complementos** → **Instalar módulo** → pega la URL de manifiesto → Instalar.
Las versiones nuevas se actualizan con un clic desde el gestor.

## Publicar una versión nueva
Edita `<modulo>/module.json` (sube `version`), luego `bash publish.sh`.
