// Unpack del mundo Chronosia (LevelDB) → packs-src/ (JSON con _key). CLI fvtt unpack está roto
// (LEVEL_ITERATOR), por eso usamos classic-level directamente. Uso: node unpack.js [ruta-mundo]
const path=require("path"), fs=require("fs");
function reqCL(){
  const cands=[ path.join(__dirname,"..","node_modules","classic-level"),
    path.join(__dirname,"..","..","..","dnd5e-2024-es","node_modules","classic-level"),
    "classic-level" ];
  for(const c of cands){ try{ return require(c).ClassicLevel; }catch(e){} }
  throw new Error("classic-level no encontrado — ejecuta 'npm install' en el módulo");
}
const CL=reqCL();
const WORLD=process.argv[2]||path.join(process.env.HOME,"Documentos/ASant-Github/foundryVTT/data/Data/worlds/chronosia");
const SRC=path.join(__dirname,"..","packs-src");

async function unpack(dbPath, outDir, keepFn){
  fs.rmSync(outDir,{recursive:true,force:true}); fs.mkdirSync(outDir,{recursive:true});
  const db=new CL(dbPath,{valueEncoding:"json"}); await db.open();
  const map=new Map(); for await(const [k,v] of db.iterator()){ v._key=k; map.set(k,v); }
  await db.close();
  const parse=k=>{ const i1=k.indexOf("!",1), i2=k.indexOf("!",i1+1); return {coll:k.slice(1,i1), ids:k.slice(i1+1,i2<0?undefined:i2)}; };
  const depth=k=>parse(k).coll.split(".").length;
  const prim=[]; const reset=new Set();
  for(const k of [...map.keys()].sort((a,b)=>depth(a)-depth(b))){
    const {coll,ids}=parse(k); const doc=map.get(k); const cP=coll.split("."), iP=ids.split(".");
    if(cP.length===1){ prim.push(doc); continue; }
    const field=cP[cP.length-1], pKey="!"+cP.slice(0,-1).join(".")+"!"+iP.slice(0,-1).join(".");
    const parent=map.get(pKey); if(!parent)continue;
    const tag=pKey+"|"+field; if(!reset.has(tag)){ parent[field]=[]; reset.add(tag); } parent[field].push(doc);
  }
  let n=0;
  for(const doc of prim){ if(keepFn && !keepFn(doc)) continue;
    const id=parse(doc._key).ids;
    const nm=(doc.name||id).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^\w\-]+/g,"_").slice(0,40);
    fs.writeFileSync(path.join(outDir,nm+"_"+id+".json"), JSON.stringify(doc,null,2)); n++; }
  console.log("  "+path.basename(outDir)+": "+n+" docs");
}
// Extrae las subcarpetas de escena de la zona 🌌 Chronosia (para reproducir la estructura por zona
// en el compendio/Aventura). El mundo guarda las carpetas en data/folders.
async function unpackSceneFolders(foldersDb, outDir){
  const db=new CL(foldersDb,{valueEncoding:"json"}); await db.open();
  const all=[]; for await(const [k,v] of db.iterator()){ if(k.startsWith("!folders!")){ v._key=k; all.push(v); } }
  await db.close();
  const parent=all.find(f=>f.type==="Scene" && /Chronosia/.test(f.name) && !f.folder);
  if(!parent){ console.log("  (sin carpeta padre de escenas)"); return; }
  const zones=all.filter(f=>f.type==="Scene" && f.folder===parent._id);
  for(const f of zones){ const nm=("_carpeta_"+f.name).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^\w\-]+/g,"_").slice(0,44);
    fs.writeFileSync(path.join(outDir,nm+"_"+f._id+".json"), JSON.stringify(f,null,2)); }
  console.log("  escenas: + "+zones.length+" carpetas de zona");
}
(async()=>{
  await unpack(path.join(WORLD,"packs/chronosia-objetos"), path.join(SRC,"objetos"));
  await unpack(path.join(WORLD,"packs/chronosia-lore"), path.join(SRC,"lore"));
  await unpack(path.join(WORLD,"packs/chronosia-bestiario"), path.join(SRC,"bestiario"));
  await unpack(path.join(WORLD,"packs/chronosia-lugartenientes"), path.join(SRC,"lugartenientes"));
  // solo escenas de Chronosia (mapa propio), descarta las de ejemplo de la plantilla FA/MAD
  await unpack(path.join(WORLD,"data/scenes"), path.join(SRC,"escenas"),
    s=>s._key.startsWith("!scenes!") && /worlds\/chronosia\/maps/.test((s.background&&s.background.src)||s.img||""));
  await unpackSceneFolders(path.join(WORLD,"data/folders"), path.join(SRC,"escenas"));
})();
