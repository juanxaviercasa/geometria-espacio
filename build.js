/* Construye la carpeta dist/ para despliegues en Cloudflare Pages / Vercel / Netlify
   cuando se configura `npm run build` con directorio de salida `dist`. */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const ITEMS = [
  'index.html',
  'solidos.html',
  'solido.html',
  'laboratorio.html',
  'leccion.html',
  'practica.html',
  'acerca.html',
  'descarga.html',
  'verificacion.html',
  '.nojekyll',
  '_headers',
  'robots.txt',
  'sitemap.xml',
  'QA-FASE6',
  '.gitignore',
  'README.md',
  'SUBIR-A-GITHUB.md',
  'TODO.md',
  'TUTORES-2026-10-28.md',
  'PLAN-MEJORA-2026-11-14.md',
  'FASE1-REPORTE-2026-11-14.md',
  'FASE2-REPORTE-2026-11-14.md',
  'FASE3-REPORTE-2026-11-14.md',
  'FASE4-REPORTE-2026-11-14.md',
  'FASE5-REPORTE-2026-11-14.md',
  'FASE6-REPORTE-2026-11-14.md',
  'PRESUPUESTOS-RENDIMIENTO.json',
  'css',
  'js',
  'vendor',
  'assets'
];

if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

for (const item of ITEMS) {
  const src = path.join(ROOT, item);
  const dest = path.join(DIST, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

// Cloudflare entrega una URL diferente de CSS/JS en cada publicación.
 // Sin esto, el navegador puede conservar scripts antiguos aunque se actualice main.
const crypto=require('crypto');
const version=(process.env.CF_PAGES_COMMIT_SHA||process.env.GITHUB_SHA||
  crypto.createHash('sha256').update(
    fs.readFileSync(path.join(ROOT,'js','visor.js'))+
    fs.readFileSync(path.join(ROOT,'js','tutores.js'))+
    fs.readFileSync(path.join(ROOT,'css','aula-premium.css'))
  ).digest('hex')).slice(0,12);
for(const page of ['index.html','solidos.html','solido.html','leccion.html','laboratorio.html','practica.html','acerca.html','descarga.html','verificacion.html']){
  const dest=path.join(DIST,page);
  if(!fs.existsSync(dest))continue;
  const updated=fs.readFileSync(dest,'utf8').replace(
    /((?:src|href)=["'])(js|css)\/([^"']+)(["'])/g,
    (_,head,folder,file,quote)=>head+folder+'/'+file.split('?')[0]+'?v='+version+quote
  );
  fs.writeFileSync(dest,updated);
}
console.log('Build completado en ./dist (' + ITEMS.length + ' recursos copiados, assets v'+version+').');
