// Construye un documento Adventure de Chronosia desde packs-src/ → packs-src/aventura/
// Empaqueta escenas + actores + objetos + lore (con carpetas) para volcar la campaña con 1 clic.
const fs=require("fs"), path=require("path"), crypto=require("crypto");
const ROOT=path.join(__dirname,"..");
const SRC=path.join(ROOT,"packs-src");
const id16=()=>crypto.randomBytes(8).toString("hex").replace(/[^a-zA-Z0-9]/g,"").padEnd(16,"0").slice(0,16);
const load=dir=>fs.readdirSync(path.join(SRC,dir)).filter(f=>f.endsWith(".json"))
  .map(f=>JSON.parse(fs.readFileSync(path.join(SRC,dir,f),"utf8")));
const stripKey=o=>{ if(Array.isArray(o))o.forEach(stripKey); else if(o&&typeof o==="object"){ delete o._key; for(const k in o)stripKey(o[k]); } return o; };

// --- cargar y separar primarios/carpetas ---
const objetos=load("objetos").map(stripKey);
const loreAll=load("lore").map(stripKey);
const bestiario=load("bestiario").map(stripKey);
const lugart=load("lugartenientes").map(stripKey);
const escenas=load("escenas").map(stripKey);
// más fiable: una carpeta no tiene 'pages'; un JournalEntry sí. Distinguimos por 'pages'.
const journals=loreAll.filter(d=>Array.isArray(d.pages));
const folders=loreAll.filter(d=>!Array.isArray(d.pages)); // el resto son Folder

// --- carpetas nuevas para actores/objetos/escenas ---
const mk=(name,type)=>({_id:id16(),name,type,folder:null,sorting:"a",color:null,flags:{},sort:0,description:""});
const fBest=mk("🌌 Bestiario","Actor"), fLt=mk("🌌 Lugartenientes","Actor"),
      fObj=mk("🌌 Objetos mágicos","Item"), fScn=mk("🌌 Escenas","Scene");
bestiario.forEach(a=>a.folder=fBest._id);
lugart.forEach(a=>a.folder=fLt._id);
objetos.forEach(i=>i.folder=fObj._id);
escenas.forEach(s=>s.folder=fScn._id);

// --- documento Adventure ---
const advId=id16();
const portada = (escenas.find(s=>/mapa general/i.test(s.name))||escenas[0]||{}).background?.src || "modules/chronosia-es/assets/maps/00_mapa-general-chronosia.webp";
const adv={
  _id:advId, _key:"!adventures!"+advId,
  name:"Chronosia — Campaña completa",
  img:portada,
  caption:"El Reino del Tiempo Fracturado",
  description:"<p>Volcado completo de la campaña <strong>Chronosia</strong>: 14 escenas, 39 criaturas del bestiario (con stats afinados y ataques), 12 lugartenientes, 8 objetos mágicos y 60 diarios de lore. Importa todo a tu mundo dnd5e con un clic.</p>",
  sort:0, folder:null, flags:{},
  actors:[...bestiario,...lugart],
  items:objetos,
  journal:journals,
  scenes:escenas,
  folders:[fBest,fLt,fObj,fScn,...folders],
  combats:[], tables:[], macros:[], cards:[], playlists:[]
};

const out=path.join(SRC,"aventura");
fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,"chronosia-campana.json"),JSON.stringify(adv,null,2));
console.log("Aventura construida:");
console.log("  escenas:",adv.scenes.length," actores:",adv.actors.length," objetos:",adv.items.length," diarios:",adv.journal.length," carpetas:",adv.folders.length);
console.log("  portada:",adv.img);
