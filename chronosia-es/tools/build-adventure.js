// Construye el documento Adventure de Chronosia desde packs-src/ → packs-src/aventura/
// Empaqueta escenas (con sus carpetas de ZONA) + actores + objetos + lore para volcar la campaña de 1 clic.
const fs=require("fs"), path=require("path"), crypto=require("crypto");
const SRC=path.join(__dirname,"..","packs-src");
const id16=()=>crypto.randomBytes(8).toString("hex").slice(0,16);
const load=dir=>fs.readdirSync(path.join(SRC,dir)).filter(f=>f.endsWith(".json")).map(f=>JSON.parse(fs.readFileSync(path.join(SRC,dir,f),"utf8")));
const isFolder=d=>typeof d._key==="string" && d._key.startsWith("!folders!");
const stripKey=o=>{ if(Array.isArray(o))o.forEach(stripKey); else if(o&&typeof o==="object"){ delete o._key; for(const k in o)stripKey(o[k]); } return o; };

// cargar y clasificar por _key (ANTES de stripear)
const objetosAll=load("objetos"), loreAll=load("lore"), bestAll=load("bestiario"), lugAll=load("lugartenientes"), escAll=load("escenas");
const items=objetosAll.filter(d=>!isFolder(d));
const journals=loreAll.filter(d=>!isFolder(d));
const loreFolders=loreAll.filter(isFolder);
const bestiario=bestAll.filter(d=>!isFolder(d));
const lugart=lugAll.filter(d=>!isFolder(d));
const scenes=escAll.filter(d=>!isFolder(d));
const sceneFolders=escAll.filter(isFolder);   // las 13 subcarpetas de zona

// carpetas nuevas para actores/objetos (esos packs no traen carpetas); las escenas usan sus zonas reales
const mk=(name,type)=>({_id:id16(),name,type,folder:null,sorting:"a",color:null,flags:{},sort:0,description:""});
const fBest=mk("🌌 Bestiario","Actor"), fLt=mk("🌌 Lugartenientes","Actor"), fObj=mk("🌌 Objetos mágicos","Item");
bestiario.forEach(a=>a.folder=fBest._id);
lugart.forEach(a=>a.folder=fLt._id);
items.forEach(i=>i.folder=fObj._id);
// escenas: conservan su carpeta de zona (o null = mapa general en la raíz)

const allFolders=[fBest,fLt,fObj,...loreFolders,...sceneFolders];
[items,journals,bestiario,lugart,scenes,allFolders].forEach(arr=>arr.forEach(stripKey));

const advId=id16();
const portada=(scenes.find(s=>/mapa general/i.test(s.name))||scenes[0]||{}).background?.src || "modules/chronosia-es/assets/maps/00_mapa-general-chronosia.webp";
const adv={
  _id:advId, _key:"!adventures!"+advId,
  name:"Chronosia — Campaña completa",
  img:portada,
  caption:"El Reino del Tiempo Fracturado",
  description:"<p>Volcado completo de la campaña <strong>Chronosia</strong>: 14 escenas (organizadas por zona), 39 criaturas del bestiario (con stats afinados y ataques), 12 lugartenientes, 8 objetos mágicos y 60 diarios de lore. Importa todo a tu mundo dnd5e con un clic.</p>",
  sort:0, folder:null, flags:{},
  actors:[...bestiario,...lugart], items, journal:journals, scenes,
  folders:allFolders, combats:[], tables:[], macros:[], cards:[], playlists:[]
};

const out=path.join(SRC,"aventura");
fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,"chronosia-campana.json"),JSON.stringify(adv,null,2));
console.log("Aventura construida:");
console.log("  escenas:",adv.scenes.length," actores:",adv.actors.length," objetos:",adv.items.length," diarios:",adv.journal.length);
console.log("  carpetas:",adv.folders.length,"(zonas de escena:",sceneFolders.length,", lore:",loreFolders.length,", actores/objetos:3)");
