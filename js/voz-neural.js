/* Caché de audio neural por figura, paso y voz.
   Comparte solicitudes concurrentes y limita el uso de memoria. */
(function(global){
'use strict';
var VOCES=[{id:"javier",nombre:"Javier · voz masculina neural"},
{id:"alvaro",nombre:"Álvaro · voz masculina neural"},
{id:"nestor",nombre:"Néstor · voz masculina neural"}];
var CACHE_MAX=9,cache=new Map();
function validar(o){
  var id=o.figura,paso=o.paso,voz=o.voz||"javier";
  if(typeof id!=="string"||!/^[a-z0-9-]+$/.test(id)||!Number.isInteger(paso)||paso<0||paso>30 ||
      !VOCES.some(function(v){return v.id===voz;}))throw Error("Paso o voz inválidos");
  return {id:id,paso:paso,voz:voz,key:id+":"+paso+":"+voz};
}
function obtener(o){
  var v=validar(o);
  if(cache.has(v.key)){
    var entry=cache.get(v.key);cache.delete(v.key);cache.set(v.key,entry);
    return entry;
  }
  var params=new URLSearchParams({figura:v.id,paso:String(v.paso),voz:v.voz});
  // El audio compartido no depende del aborto de una sesión de reproducción.
  // La sesión anterior se descarta en Avatar.hablarVoz sin cancelar este fetch.
  var pending=fetch("/api/tts?"+params,{credentials:"omit",headers:{Accept:"audio/mpeg"}})
    .then(function(res){
      if(!res.ok)throw Error("No está disponible la voz neural ("+res.status+")");
      if(!(res.headers.get("content-type")||"").includes("audio/"))throw Error("El servicio no devolvió audio");
      return res.blob();
    }).then(function(blob){
      if(blob.size<100)throw Error("Audio vacío");
      return blob;
    }).catch(function(e){cache.delete(v.key);throw e;});
  cache.set(v.key,pending);
  while(cache.size>CACHE_MAX)cache.delete(cache.keys().next().value);
  return pending;
}
function generar(opciones,signal){
  if(signal&&signal.aborted)return Promise.reject(Error("Solicitud cancelada"));
  return obtener(opciones);
}
function precargar(opciones){
  return obtener(opciones).catch(function(){return null;});
}
global.VozNeural={generar:generar,precargar:precargar,voces:VOCES,
  cacheSize:function(){return cache.size;}};
})(window);
