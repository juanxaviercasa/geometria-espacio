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

/* Los originales WebP viajan versionados en un paquete ZIP dentro del repositorio.
 * Se extraen en el build (sin descargas ni dependencias externas), de modo que
 * Cloudflare Pages los sirve como archivos estáticos locales, no enlaces temporales. */
const zlib = require('zlib');
const packagePath = path.join(ROOT, 'media', 'zenit-fase4-webp.zip');
const expectedNames = [
  'aprender', 'experimentar', 'resolver', 'ruta',
  'entender', 'error', 'verificar', 'cierre'
];
const expectedFiles = new Set(expectedNames.map(n => 'assets/zenit/fase4/' + n + '.webp'));
expectedFiles.add('assets/zenit/fase4/catalog.json');
if (!fs.existsSync(packagePath)) {
  throw new Error('Falta el paquete de imágenes Zénit Aurora: media/zenit-fase4-webp.zip');
}
const data = fs.readFileSync(packagePath);
const extracted = new Set();
let cursor = 0;
while (cursor + 30 <= data.length) {
  const signature = data.readUInt32LE(cursor);
  if (signature === 0x02014b50 || signature === 0x06054b50) break; // ZIP central directory
  if (signature !== 0x04034b50) throw new Error('Encabezado ZIP incorrecto');
  const flags = data.readUInt16LE(cursor + 6);
  const method = data.readUInt16LE(cursor + 8);
  const compressedSize = data.readUInt32LE(cursor + 18);
  const expandedSize = data.readUInt32LE(cursor + 22);
  const nameLength = data.readUInt16LE(cursor + 26);
  const extraLength = data.readUInt16LE(cursor + 28);
  if (flags & 0x08) throw new Error('ZIP con descriptor de datos no compatible');
  const name = data.subarray(cursor + 30, cursor + 30 + nameLength).toString('utf8');
  const start = cursor + 30 + nameLength + extraLength;
  const end = start + compressedSize;
  if (end > data.length) throw new Error('Archivo ZIP incompleto: ' + name);
  if (expectedFiles.has(name)) {
    if (extracted.has(name)) throw new Error('Entrada duplicada en paquete: ' + name);
    if (method !== 8 && method !== 0) throw new Error('Compresión no compatible: ' + name);
    const body = method === 8 ? zlib.inflateRawSync(data.subarray(start, end)) : data.subarray(start, end);
    if (body.length !== expandedSize) throw new Error('Longitud incorrecta en ' + name);
    if (name.endsWith('.webp')) {
      if (body.toString('ascii', 0, 4) !== 'RIFF' ||
          body.toString('ascii', 8, 12) !== 'WEBP') {
        throw new Error('Imagen WebP inválida: ' + name);
      }
    } else {
      const manifest = JSON.parse(body.toString('utf8'));
      if (manifest.ready !== true || !expectedNames.every(n => manifest.assets.includes(n))) {
        throw new Error('Manifiesto de imágenes incompleto');
      }
    }
    const target = path.join(DIST, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, body);
    extracted.add(name);
  }
  cursor = end;
}
if (extracted.size !== expectedFiles.size) {
  throw new Error('Faltan imágenes en el paquete HD: ' +
    [...expectedFiles].filter(name => !extracted.has(name)).join(', '));
}
console.log('Zénit Aurora: 8 originales WebP y manifiesto instalados en dist.');

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
