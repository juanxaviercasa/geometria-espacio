/* Cliente de lectura neuronal. Solicita audio solo al iniciar el paso. */
(function(global){
'use strict';
var VOCES=[{id:"javier",nombre:"Javier · voz masculina neural"},
{id:"alvaro",nombre:"Álvaro · voz masculina neural"},
{id:"nestor",nombre:"Néstor · voz masculina neural"}];
async function generar(opciones,signal){
  var id=opciones.figura,paso=opciones.paso,voz=opciones.voz||"javier";
  if(typeof id!=="string"||!/^[a-z0-9-]+$/.test(id)||!Number.isInteger(paso)||paso<0||paso>30)throw Error("Paso inválido");
  var params=new URLSearchParams({figura:id,paso:String(paso),voz:voz});
  var res=await fetch("/api/tts?"+params,{credentials:"omit",signal:signal,headers:{Accept:"audio/mpeg"}});
  if(!res.ok)throw Error("No está disponible la voz neural ("+res.status+")");
  if(!(res.headers.get("content-type")||"").includes("audio/"))throw Error("El servicio no devolvió audio");
  var blob=await res.blob();if(blob.size<100)throw Error("Audio vacío");return blob;
}
global.VozNeural={generar:generar,voces:VOCES};
})(window);
