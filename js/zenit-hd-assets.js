/* Sistema Zénit · activación progresiva de originales 4:3 / 16:9.
 * Mientras no estén publicados los 8 WebP generados, la portada utiliza
 * fotografías premium locales para que nunca haya imágenes rotas.
 */
(function(){
'use strict';
function start(){
 const targetImages=Array.from(document.querySelectorAll('img[data-zenit-hd-src]'));
 if(!targetImages.length)return;
 fetch('assets/zenit/fase4/catalog.json',{cache:'no-store'})
  .then(function(res){if(!res.ok)throw new Error('Catálogo HD pendiente');return res.json()})
  .then(function(manifest){
    if(!manifest||manifest.ready!==true||!Array.isArray(manifest.assets)||manifest.assets.length!==8)return;
    targetImages.forEach(function(img){
      const src=img.getAttribute('data-zenit-hd-src');
      if(!src)return;
      const file=src.split('/').pop().replace(/\.webp$/,'');
      if(manifest.assets.indexOf(file)<0)return;
      if(img.getAttribute('src')===src){
        img.setAttribute('data-zenit-hd-ready','true');
        return;
      }
      const swap=new Image();
      swap.decoding='async';
      swap.onload=function(){
        img.src=src;
        img.setAttribute('data-zenit-hd-ready','true');
      };
      swap.onerror=function(){/* Fallback local actual; no imagen rota */};
      swap.src=src;
    });
  }).catch(function(){/* Sitio funcional sin el paquete opcional HD */});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
