/**
 * combat-feedback-es
 * Texto flotante de IMPACTO / FALLO / ¡CRÍTICO! / PIFIA sobre el objetivo,
 * disparado al completar la tirada de ataque de Midi-QOL.
 *
 * Se reproduce en TODOS los clientes (vía socketlib) una sola vez por ataque.
 * NOTA: los nombres del hook de Midi y los campos del workflow pueden variar
 * entre versiones; este módulo es defensivo y registra avisos en consola.
 */
const MOD = "combat-feedback-es";
let socket = null;

const STYLE = {
  hit:    { label: "IMPACTO",    color: "#37b24d", big: false },
  miss:   { label: "FALLO",      color: "#adb5bd", big: false },
  crit:   { label: "¡CRÍTICO!",  color: "#ffd43b", big: true  },
  fumble: { label: "PIFIA",      color: "#f03e3e", big: true  },
};

Hooks.once("init", () => {
  game.settings.register(MOD, "enabled", {
    name: "Activar feedback de combate",
    hint: "Muestra texto flotante de IMPACTO/FALLO/¡CRÍTICO!/PIFIA sobre el objetivo al atacar.",
    scope: "world", config: true, type: Boolean, default: true,
  });
  game.settings.register(MOD, "critEffectFile", {
    name: "Efecto en crítico (opcional)",
    hint: "Ruta de un efecto Sequencer/JB2A a reproducir sobre el objetivo en crítico. Vacío = sin efecto. Ej: jb2a.explosion.01.orange",
    scope: "world", config: true, type: String, default: "",
  });
});

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule(MOD);
  socket.register("show", _show);
});

Hooks.once("ready", () => {
  if (!game.modules.get("midi-qol")?.active) {
    console.warn(`${MOD} | Midi-QOL no está activo; no se mostrará feedback.`);
    return;
  }
  // Hook principal de Midi tras resolver el ataque (impactos ya calculados).
  Hooks.on("midi-qol.AttackRollComplete", onAttackComplete);
  console.log(`${MOD} | listo`);
});

async function onAttackComplete(workflow) {
  try {
    if (!game.settings.get(MOD, "enabled")) return;

    // Dispara UNA sola vez: solo el cliente que hizo la tirada emite el broadcast.
    const rollerId = workflow?.user?.id ?? workflow?.userId ?? null;
    if (rollerId) { if (rollerId !== game.user.id) return; }
    else if (!game.user.isGM) return; // sin info de usuario: que lo emita el GM

    const isCrit = !!workflow?.isCritical;
    const isFumble = !!workflow?.isFumble;

    const hitSet = workflow?.hitTargets ?? new Set();
    const hitIds = new Set([...hitSet].map(t => t?.id ?? t?.document?.id ?? t?.object?.id).filter(Boolean));

    const targets = [...(workflow?.targets ?? [])];
    const payload = targets.map(tg => {
      const tid = tg?.id ?? tg?.object?.id ?? tg?.document?.id;
      const didHit = hitIds.has(tid);
      let kind = "miss";
      if (isFumble) kind = "fumble";
      else if (didHit && isCrit) kind = "crit";
      else if (didHit) kind = "hit";
      return { tokenId: tid, kind };
    }).filter(p => p.tokenId);

    if (!payload.length) return;
    const file = game.settings.get(MOD, "critEffectFile");

    if (socket) socket.executeForEveryone("show", payload, file);
    else await _show(payload, file); // sin socketlib: al menos en este cliente
  } catch (e) {
    console.error(`${MOD} | error en onAttackComplete`, e);
  }
}

/** Se ejecuta en cada cliente. */
async function _show(payload, file) {
  for (const { tokenId, kind } of payload) {
    const token = canvas.tokens?.get(tokenId);
    if (!token) continue;
    const s = STYLE[kind] ?? STYLE.miss;
    await _floatingText(token, s.label, s.color, s.big);
    if (kind === "crit") await _critEffect(token, file);
  }
}

async function _floatingText(token, text, color, big) {
  try {
    const center = token.center ?? { x: token.x, y: token.y };
    await canvas.interface.createScrollingText(center, text, {
      anchor: CONST.TEXT_ANCHOR_POINTS.CENTER,
      direction: CONST.TEXT_ANCHOR_POINTS.TOP,
      duration: 2000,
      distance: (token.h ?? 100) * 1.2,
      fontSize: big ? 52 : 34,
      fill: color,
      stroke: 0x000000,
      strokeThickness: 4,
      jitter: 0.25,
    });
  } catch (e) {
    console.warn(`${MOD} | no se pudo crear el texto flotante`, e);
  }
}

async function _critEffect(token, file) {
  if (!file || !game.modules.get("sequencer")?.active) return;
  try {
    await new Sequence().effect().file(file).atLocation(token).scaleToObject(2).play();
  } catch (e) {
    console.warn(`${MOD} | el efecto de crítico falló (¿ruta válida?)`, e);
  }
}
