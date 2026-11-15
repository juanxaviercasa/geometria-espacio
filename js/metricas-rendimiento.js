/* Panel de rendimiento local, sin cookies, analítica remota ni envío de datos.
   LCP/CLS/INP dependen de PerformanceObserver y de interacción suficiente. */
(function(global){
'use strict';
var observados={lcp:null,cls:0,inp:null,longTasks:0,errores:[],soporte:{}};
function registrar(tipo,fn,opciones){
 try{
  if(!global.PerformanceObserver)return false;
  var p=new PerformanceObserver(function(lista){lista.getEntries().forEach(fn);});
  p.observe(opciones||{type:tipo,buffered:true});
  return true;
 }catch(e){return false;}
}
observados.soporte.lcp=registrar('largest-contentful-paint',function(x){observados.lcp=x.startTime;});
observados.soporte.cls=registrar('layout-shift',function(x){if(!x.hadRecentInput)observados.cls+=x.value;});
observados.soporte.inp=registrar('event',function(x){
 if(!x.interactionId || !x.duration)return;
 observados.inp=Math.max(observados.inp||0,x.duration);
},{type:'event',buffered:true,durationThreshold:40});
observados.soporte.longtask=registrar('longtask',function(){observados.longTasks++;});
global.addEventListener('error',function(e){
 if(observados.errores.length<10)observados.errores.push({tipo:'error',mensaje:String(e.message||'Error de recurso')});
});
global.addEventListener('unhandledrejection',function(e){
 if(observados.errores.length<10)observados.errores.push({tipo:'promesa',mensaje:String(e.reason&&e.reason.message||e.reason||'Rechazo inesperado')});
});
function instantanea(){
 var nav=global.performance&&performance.getEntriesByType('navigation')[0];
 var recursos=global.performance?performance.getEntriesByType('resource'):[];
 var js=recursos.filter(function(r){return r.initiatorType==='script';});
 var marcas=global.performance?performance.getEntriesByType('paint'):[];
 var fcp=marcas.filter(function(e){return e.name==='first-contentful-paint';})[0];
 var memoria=global.performance&&performance.memory?performance.memory:null;
 return{
  navegacionMs:nav&&nav.loadEventEnd?Math.round(nav.loadEventEnd):null,
  fcpMs:fcp?Math.round(fcp.startTime):null,
  lcpMs:observados.soporte.lcp?observados.lcp:null,
  cls:observados.soporte.cls?Math.round(observados.cls*10000)/10000:null,
  inpAproxMs:observados.soporte.inp?observados.inp:null,
  tareasLargas:observados.soporte.longtask?observados.longTasks:null,
  recursos:recursos.length,
  jsSolicitados:js.length,
  transferBytes:recursos.reduce(function(n,r){return n+(r.transferSize||0);},0),
  heapBytes:memoria?memoria.usedJSHeapSize:null,
  elementosDOM:document.getElementsByTagName('*').length,
  desborda:document.documentElement.scrollWidth>document.documentElement.clientWidth,
  errores:observados.errores.slice(),soporte:Object.assign({},observados.soporte)
 };
}
function panel(){
 var salida=document.getElementById('metricas-rendimiento'),btn=document.getElementById('btn-perf-actualizar');
 if(!salida)return;
 function poner(titulo,valor){
  var div=document.createElement('div');div.className='perf-item';
  var dt=document.createElement('dt');dt.textContent=titulo;div.appendChild(dt);
  var dd=document.createElement('dd');dd.textContent=valor;div.appendChild(dd);salida.appendChild(div);
 }
 function pintar(){
  var x=instantanea();
  salida.textContent='';
  function ms(x){return Number.isFinite(x)?Math.round(x)+' ms':'Sin medición';}
  poner('Carga del documento',ms(x.navegacionMs));
  poner('Primera pintura (FCP)',ms(x.fcpMs));
  poner('Elemento más grande (LCP)',ms(x.lcpMs));
  poner('Cambios de distribución (CLS)',x.cls===null?'No compatible':String(x.cls));
  poner('Respuesta a interacciones (INP, aproximado)',x.inpAproxMs===null?'Sin muestra de interacción':ms(x.inpAproxMs));
  poner('Recursos / scripts',x.recursos+' / '+x.jsSolicitados);
  poner('Transferencia observada',Math.round(x.transferBytes/1024)+' KiB (según caché y Timing-Allow-Origin)');
  poner('Memoria JS del navegador',x.heapBytes===null?'API no disponible':Math.round(x.heapBytes/1048576)+' MiB');
  poner('Tareas largas',x.tareasLargas===null?'API no disponible':String(x.tareasLargas));
  poner('Errores observados',String(x.errores.length));
  poner('Desbordamiento horizontal',x.desborda?'Detectado':'No detectado');
 }
 if(btn)btn.addEventListener('click',pintar);
 pintar();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',panel);
else panel();
global.MetricasRendimiento={obtener:instantanea,version:'2026-11-14'};
})(window);
