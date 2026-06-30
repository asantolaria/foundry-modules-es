# Feedback de Combate (ES) — `combat-feedback-es`

Módulo propio para Foundry VTT v13 + dnd5e. Muestra **texto flotante** sobre el token objetivo
al resolver una tirada de ataque de **Midi-QOL**:

| Resultado | Texto | Color |
|---|---|---|
| Impacto | `IMPACTO` | verde |
| Fallo | `FALLO` | gris |
| Crítico | `¡CRÍTICO!` (grande) | dorado |
| Pifia (1 natural) | `PIFIA` (grande) | rojo |

## Cómo funciona
- Se engancha al hook `midi-qol.AttackRollComplete`.
- El cliente que hizo la tirada emite el aviso a **todos** los clientes vía **socketlib**
  (una sola vez por ataque), para que GM y jugadores lo vean.
- Opción de reproducir un **efecto Sequencer/JB2A en crítico** (ajuste `critEffectFile`,
  vacío por defecto; ej. `jb2a.explosion.01.orange` si la ruta existe en tu JB2A).

## Requisitos
- **socketlib** (requerido)
- **midi-qol** (recomendado; sin él no se dispara nada)
- **sequencer** (opcional; solo para el efecto de crítico)

## Activación
1. Está montado en el contenedor vía `docker-compose.yml`
   (`./dev/combat-feedback-es` → `/data/Data/modules/combat-feedback-es`).
2. Reiniciar el contenedor para que aparezca: `task up` (o `docker compose up -d`).
3. En cada mundo D&D: *Gestionar Módulos* → activar **Feedback de Combate (ES)**.

## Ajustes (Configurar Ajustes → Feedback de Combate)
- **Activar feedback de combate** (on/off).
- **Efecto en crítico (opcional)**: ruta de efecto Sequencer/JB2A.

## Estado: v0.1 (pendiente de prueba en vivo)
Los nombres del hook de Midi y la API de texto flotante (`canvas.interface.createScrollingText`)
pueden variar entre versiones. Tras el primer reinicio hay que **probar un ataque** y, si no
aparece el texto, revisar la consola (F12) — el módulo registra avisos con prefijo
`combat-feedback-es |` para afinar los campos del workflow.
