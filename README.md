# foundry-modules-es

Módulos propios para **Foundry VTT** (sistema **dnd5e**), en español.

| Módulo | Qué aporta | Instalar (URL de manifiesto) |
|---|---|---|
| **chronosia-es** | Campaña homebrew Chronosia: objetos, lore, bestiario afinado, lugartenientes, 14 escenas | `https://github.com/asantolaria/foundry-modules-es/releases/download/chronosia-es/module.json` |
| **combat-feedback-es** | Texto flotante IMPACTO/FALLO/CRÍTICO/PIFIA en combate (Midi-QOL) | `https://github.com/asantolaria/foundry-modules-es/releases/download/combat-feedback-es/module.json` |

## Instalar en Foundry
Setup → **Módulos de complementos** → **Instalar módulo** → pega la URL de manifiesto → Instalar.
Las versiones nuevas se actualizan con un clic desde el gestor. (Las URLs van por
`github.com/.../releases/download/<id>/` — dominio que el gestor acepta y que las redes no bloquean;
el tag es rodante = el id del módulo, así la URL no cambia entre versiones.)

## Publicar una versión nueva
Edita `<modulo>/module.json` (sube `version`), luego `bash publish.sh` (reconstruye el zip y lo
sube a la release con `--clobber`).
