/* Servidor local de desarrollo; producción se sirve por Cloudflare Pages. */
const http=require('http');
const fs=require('fs');
const path=require('path');
const ROOT=fs.realpathSync(__dirname);
const PORT=Number(process.env.PORT)||3000;
const MIME={
 '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
 '.js':'application/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
 '.json':'application/json; charset=utf-8','.md':'text/markdown; charset=utf-8',
 '.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp',
 '.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif',
 '.glb':'model/gltf-binary','.wasm':'application/wasm',
 '.woff':'font/woff','.woff2':'font/woff2',
 '.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'
};
const PAGINAS=new Set(['index.html','laboratorio.html','leccion.html','practica.html',
 'acerca.html','descarga.html','verificacion.html']);
const DOCUMENTOS=new Set(['README.md','TODO.md','SUBIR-A-GITHUB.md',
 'PLAN-MEJORA-2026-11-14.md','TUTORES-2026-10-28.md',
 'FASE1-REPORTE-2026-11-14.md','FASE2-REPORTE-2026-11-14.md',
 'FASE3-REPORTE-2026-11-14.md','FASE4-REPORTE-2026-11-14.md',
 'FASE5-REPORTE-2026-11-14.md','.gitignore','.nojekyll']);
const CARPETAS=new Set(['css','js','vendor']);
function rutaPublica(ruta){
 const pedazos=ruta.split('/').filter(Boolean);
 if(!pedazos.length)return false;
 if(pedazos.some(x=>x==='.'||x==='..'||x.startsWith('.')))return pedazos.length===1&&DOCUMENTOS.has(pedazos[0]);
 if(pedazos.length===1)return PAGINAS.has(pedazos[0])||DOCUMENTOS.has(pedazos[0]);
 return CARPETAS.has(pedazos[0])&&pedazos.length>=2;
}
function dentroDeRaiz(nombre){
 return nombre.startsWith(ROOT+path.sep);
}
const server=http.createServer((req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 if(req.method!=='GET'&&req.method!=='HEAD'){
  res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;
 }
 let solicitada;
 try{solicitada=decodeURIComponent((req.url||'/').split('?')[0]);}
 catch(e){res.writeHead(400);res.end('URL incorrecta');return;}
 if(solicitada==='/'||solicitada==='')solicitada='/index.html';
 if(solicitada.includes('\\')||solicitada.includes('\0')||!rutaPublica(solicitada)){
  res.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});res.end('Acceso denegado');return;
 }
 const filePath=path.resolve(ROOT,solicitada.replace(/^\/+/, ''));
 if(!dentroDeRaiz(filePath)){
  res.writeHead(403);res.end('Acceso denegado');return;
 }
 fs.realpath(filePath,(err,real)=>{
  if(err||!dentroDeRaiz(real)){
   res.writeHead(err&&err.code==='ENOENT'?404:403);
   res.end('No disponible');return;
  }
  fs.stat(real,(statErr,st)=>{
   if(statErr||!st.isFile()){
    res.writeHead(404);res.end('No encontrado');return;
   }
   const tipo=MIME[path.extname(real).toLowerCase()]||'application/octet-stream';
   res.writeHead(200,{
    'Content-Type':tipo,
    'Content-Length':st.size,
    'Cache-Control':tipo.startsWith('text/html')?'no-cache':'public, max-age=3600'
   });
   if(req.method==='HEAD'){res.end();return;}
   fs.createReadStream(real).on('error',()=>res.destroy()).pipe(res);
  });
 });
});
if(require.main===module)server.listen(PORT,()=>{
 console.log('Servidor local de Geometría 3D en http://localhost:'+PORT);
});
module.exports={server,rutaPublica,dentroDeRaiz};
