/* Fase 5 · índices de avance sin cargar explicaciones, respuestas ni modelos. */
(function(global){
'use strict';
var IDS=['m1l1','m1l2','m2l1','m2l2','m3l1','m3l2',
'm4l1','m4l2','m5l1','m6l1','m6l2','m7l1','m8l1','m9l1',
'm10l1','m11l1','m12l1'];
function progresoGlobal(){
 var hechas=IDS.filter(function(id){
  return !!(global.Progreso&&global.Progreso.estado(id)==='hecho');
 }).length;
 return{hechas:hechas,total:IDS.length,pct:Math.round(100*hechas/IDS.length)};
}
global.Contenido={IDs:IDS,progresoGlobal:progresoGlobal};
})(window);
