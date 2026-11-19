/* Fase 5: carga compartida y diferida de Three.js y del visor 3D.
   Sin dependencias remotas; nunca descarga WebGL por defecto en páginas sin figura visible. */
(function(global){
'use strict';
var base=new URL('../',document.currentScript.src),pendientes={},motor=null,ultimoError=null;
function recurso(path,condicion){
 if(condicion())return Promise.resolve();
 if(pendientes[path])return pendientes[path];
 pendientes[path]=new Promise(function(resolve,reject){
  var js=document.createElement('script');
  js.src=new URL(path,base).href;js.async=true;
  js.dataset.cargador3d=path;
  js.onload=function(){if(condicion())resolve();else reject(Error('El recurso no inicializó: '+path));};
  js.onerror=function(){reject(Error('No se pudo descargar '+path));};
  document.head.appendChild(js);
 }).then(function(){
  delete pendientes[path];
 }).catch(function(err){
  delete pendientes[path];
  var node=document.querySelector('script[data-cargador3d="'+path+'"]');
  if(node)node.remove();
  ultimoError=err;
  throw err;
 });
 return pendientes[path];
}
function three(){
 return recurso('vendor/three.min.js',function(){return !!(global.THREE&&global.THREE.WebGLRenderer);});
}
function cargar(){
 if(global.Visor3D&&global.THREE)return Promise.resolve(global.Visor3D);
 if(motor)return motor;
 motor=three().then(function(){
  return recurso('js/visor3d.js?v=aula-fit-angulos-20261119b',function(){return !!global.Visor3D;});
 }).then(function(){
  if(!global.Visor3D)throw Error('No se registró el visor 3D');
  return global.Visor3D;
 }).catch(function(err){motor=null;throw err;});
 return motor;
}
global.Cargador3D={
 cargar:cargar,
 cargarThree:three,
 estado:function(){return {three:!!global.THREE,visor:!!global.Visor3D,pendientes:Object.keys(pendientes).length,error:ultimoError&&ultimoError.message};}
};
})(window);
