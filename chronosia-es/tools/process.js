// Reescribe rutas de assets (worlds/chronosia → modules/chronosia-es/assets), limpia campos de
// mundo (folder colgante, ownership, escena activa, placeables basura). Uso: node process.js
const fs=require("fs"), path=require("path");
const SRC=path.join(__dirname,"..","packs-src");
const RX=/worlds\/chronosia\/(maps|bestiario|objetos-magicos)\//g;
const REPL="modules/chronosia-es/assets/$1/";
let files=0, paths=0;
for(const pack of fs.readdirSync(SRC)){
  const dir=path.join(SRC,pack); if(!fs.statSync(dir).isDirectory())continue;
  const folderIds=new Set();
  for(const f of fs.readdirSync(dir)){ const o=JSON.parse(fs.readFileSync(path.join(dir,f))); if(o._key&&o._key.startsWith("!folders!")) folderIds.add(o._id); }
  for(const f of fs.readdirSync(dir)){ const p=path.join(dir,f);
    let raw=fs.readFileSync(p,"utf8");
    paths+=(raw.match(RX)||[]).length; raw=raw.replace(RX,REPL);
    const o=JSON.parse(raw);
    if(o.folder && !folderIds.has(o.folder)) o.folder=null;
    if(o.ownership) o.ownership={default:0};
    if(o._key&&o._key.startsWith("!scenes!")){ o.active=false; o.navigation=true;
      for(const fld of ["walls","lights","sounds","tiles","drawings","templates","notes","tokens","regions"]) o[fld]=[]; }
    for(const fld of ["items","pages","tokens"]) if(Array.isArray(o[fld])) o[fld].forEach(e=>{ if(e&&e.ownership) e.ownership={default:0}; });
    fs.writeFileSync(p, JSON.stringify(o,null,2)); files++;
  }
}
console.log("  ficheros:",files,"| rutas de asset reescritas:",paths);
