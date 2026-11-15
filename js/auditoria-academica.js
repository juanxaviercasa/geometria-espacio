/* Auditoría matemática de 47 claves numéricas + 43 opciones.
   Cálculos independientes de las cifras guardadas en contenido-*.js. */
(function (global) {
'use strict';
var DEG=180/Math.PI;
var claves={
  m1l1e2:function(){return (5*4/2)-(3*2/2)+1;},
  m1l1e5:function(){return 8*7/2;},
  m1l2e2:function(){return 12*11/2-3*(4*3/2)-8*(3*2/2);},
  m1l2e4:function(){return 4*3/2;},
  m2l1e3:function(){return Math.SQRT2/2*Math.sqrt(5-Math.pow(Math.SQRT2/2,2));},
  m2l1e5:function(){return 4*3;},
  m2l2e2:function(){return 2/Math.sqrt(3);},
  m2l2e4:function(){return Math.hypot(3,1.5,3);},
  m3l1e1:function(){return Math.acos(1/Math.sqrt(3))*DEG;},
  m3l1e4:function(){return Math.atan2(6,Math.hypot(3,6))*DEG;},
  m3l2e2:function(){return 1/3;},
  m3l2e3:function(){return Math.acos(1/Math.sqrt(2))*DEG;},
  m4l1e1:function(){return 10*Math.cos(Math.PI/3);},
  m4l1e2:function(){return Math.sqrt(3)/4*16*Math.cos(Math.PI/3);},
  m4l1e4:function(){return Math.hypot(4,4);},
  m4l2e1:function(){return Math.abs(2*1-2+2*2-6)/Math.hypot(2,-1,2);},
  m4l2e2:function(){return Math.abs(2);},
  m4l2e4:function(){return Math.abs(1.5+1.5+1.5-3)/Math.sqrt(3);},
  m5l1e2:function(){return 70+90-1;},
  m5l1e3:function(){return 3;},
  m6l1e1:function(){return Math.hypot(2,3,6);},
  m6l1e2:function(){return Math.hypot(5,5);},
  m6l1e4:function(){return 2*4*4+4*4*9;},
  m6l1e6:function(){return 6*8*10*Math.sin(Math.PI/6);},
  m6l1e8:function(){return Math.acos(1/Math.sqrt(3))*DEG;},
  m6l2e1:function(){return 3*3*3;},
  m6l2e2:function(){return 10*(2+3+4+5)/4;},
  m6l2e4:function(){return 6*4*3-Math.pow(2,3);},
  m7l1e1:function(){return Math.hypot(3,4);},
  m7l1e2:function(){return 36*10/3;},
  m7l1e4:function(){return 48*Math.sqrt(3);},
  m7l1e6:function(){return Math.sqrt(5*5-Math.pow(6/Math.sqrt(3),2));},
  m8l1e1:function(){return Math.PI*3*3*7;},
  m8l1e2:function(){return Math.PI*4*Math.pow(3,3)/3;},
  m8l1e3:function(){return Math.PI*5*5*Math.sqrt(13*13-5*5)/3;},
  m8l1e5:function(){return Math.PI*2*2*5*0.8*1000;},
  m9l1e2:function(){return 20*3/2;},
  m9l1e3:function(){return 12+20-2;},
  m9l1e5:function(){return Math.pow(6,3)*Math.sqrt(2)/12;},
  m10l1e2:function(){return Math.sqrt(10*10-6*6);},
  m10l1e4:function(){return 6*6;},
  m11l1e1:function(){return Math.pow(8*(12-3)/12,2);},
  m11l1e2:function(){return 3/3*(36+16+Math.sqrt(36*16));},
  m11l1e5:function(){return Math.PI*4/3*(6*6+3*3+6*3);},
  m12l1e2:function(){return Math.hypot(1,1);},
  m12l1e3:function(){return Math.pow(8*Math.SQRT2,2)*6/3;},
  m12l1e5:function(){return Math.pow(6/12,3);},
  m1l1u1:function(){return 6*5*4/(3*2);},
  m1l2u1:function(){return 3*6+8*3;},
  m2l1u1:function(){return (3*Math.sqrt(3)/2)*Math.pow(6/Math.sqrt(2),2);},
  m2l2u1:function(){return 3/Math.sqrt(3);},
  m3l1u1:function(){return Math.atan2(1,Math.sqrt(2))*180/Math.PI;},
  m3l2u1:function(){return Math.acos(Math.abs(-2+2+4)/(3*3))*180/Math.PI;},
  m4l1u1:function(){return 6*6*Math.cos(Math.PI/3);},
  m4l2u1:function(){return Math.abs(2*2-3+2*4-10)/Math.sqrt(4+1+4);},
  m5l1u1:function(){return 70+80-1;},
  m6l1u1:function(){return Math.hypot(4,9,12);},
  m6l2u1:function(){return 12*(2+4+6+8)/4;},
  m7l1u1:function(){return 8*8*Math.sqrt(6*6-Math.pow(8/Math.sqrt(2),2))/3;},
  m8l1u1:function(){return Math.PI*5*5*12*(1-1/3);},
  m9l1u1:function(){return (6*4+8*3)/2-(6+8)+2;},
  m10l1u1:function(){return Math.PI*(13*13-5*5);},
  m11l1u1:function(){return 6*(100+25+Math.sqrt(100*25))/3;},
  m12l1u1:function(){return 1-(Math.sqrt(2)**3*Math.sqrt(2)/12); }
};
function auditar(contenido) {
  var fallos=[],avisos=[],lista=contenido.listaOrdenada(),banco=contenido.bancoPractica(),retos=contenido.bancoRetos();
  var numericas=banco.filter(function(e){return e.tipo==='numerico';});
  var opciones=banco.filter(function(e){return e.tipo==='opcion';});
  function fallo(id,m){fallos.push({id:id,motivo:m});}
  if(lista.length!==17)fallo('catalogo','Se esperaban 17 lecciones; se encontraron '+lista.length);
  if(banco.length!==107)fallo('banco','Se esperaban 107 ejercicios; se encontraron '+banco.length);
  if(retos.length!==18)fallo('retos','Se esperaban 18 retos; se encontraron '+retos.length);
  lista.forEach(function(e){
    var l=e.leccion;
    if(!l||!l.objetivo||!l.resumen||!l.duracion)fallo(e.id,'Metadatos pedagógicos incompletos');
    (l.bloques||[]).forEach(function(b,i){
      if(b.tipo==='teorema'&&!b.justifica)avisos.push({id:e.id,detalle:'Teorema '+i+' sin justificación explícita'});
      if(b.tipo==='ejemplo'&&(!b.respuesta||!b.pasos||!b.pasos.length))fallo(e.id,'Ejemplo sin resolución o respuesta');
      if(b.tipo==='figura' && global.Figuras && !global.Figuras.obtener(b.figura))fallo(e.id,'Figura ausente: '+b.figura);
    });
  });
  var ids={};
  banco.forEach(function(e){
    if(ids[e.id])fallo(e.id,'ID duplicado');ids[e.id]=true;
    if(!e.explicacion||!e.pistas||e.pistas.length<2)fallo(e.id,'Falta explicación o dos pistas');
    if(e.tipo==='opcion'){
      if(!e.opciones||e.opciones.filter(function(o){return o.correcta;}).length!==1)fallo(e.id,'No hay exactamente una opción correcta');
    }else if(e.tipo==='numerico'){
      if(!Object.prototype.hasOwnProperty.call(claves,e.id)){fallo(e.id,'Sin recálculo independiente');return;}
      var esperado=claves[e.id](),tol=Number.isFinite(e.tolerancia)?e.tolerancia:0.005;
      if(!Number.isFinite(e.respuesta)||!Number.isFinite(esperado)||Math.abs(e.respuesta-esperado)>tol+1e-9)
        fallo(e.id,'Clave='+e.respuesta+'; valor recalculado='+esperado+'; tolerancia='+tol);
    }else fallo(e.id,'Tipo de ejercicio desconocido');
  });
  Object.keys(claves).forEach(function(id){if(!ids[id])fallo(id,'Recálculo huérfano')});
  retos.forEach(function(r){
    if(!r.estrategia||r.estrategia.length<2||!r.desarrollo||r.desarrollo.length<3||!r.respuesta)
      fallo(r.id,'Reto sin estrategia, desarrollo o respuesta');
  });
  return {correcto:fallos.length===0,lecciones:lista.length,ejercicios:banco.length,
    numericos:numericas.length,opciones:opciones.length,retos:retos.length,
    recalculos:Object.keys(claves).length,errores:fallos,advertencias:avisos};
}
global.AuditoriaAcademica={auditar:auditar,claves:claves};
})(window);