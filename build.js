/* Construye la carpeta dist/ para despliegues en Cloudflare Pages / Vercel / Netlify
   cuando se configura `npm run build` con directorio de salida `dist`. */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const ITEMS = [
  'index.html',
  'leccion.html',
  'practica.html',
  'acerca.html',
  'descarga.html',
  'verificacion.html',
  '.nojekyll',
  '.gitignore',
  'README.md',
  'SUBIR-A-GITHUB.md',
  'TODO.md',
  'TUTORES-2026-10-28.md',
  'css',
  'js',
  'vendor'
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

console.log('Build completado en ./dist (' + ITEMS.length + ' recursos copiados).');
