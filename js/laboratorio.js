/* Laboratorio interactivo: capa de controles para Parametricas, Visor3D y Visor2D. */
(function (w) {
'use strict';
var P=w.Parametricas, figura='prisma', valores=Object.assign({},P.DEFAULTS),modo='2d',api=null;
var selec, lienzo, estado, sliders, capasBox, formulas, nota, capasOcultas={},cam2d={theta:.7,phi:.32};
var ultimoModelo=null, raf=null, tRebuild=0, loading3d=null, solicitud=0, visible=true, obs=null;
var KEY='geo3d.lab.v1';
var LABELS={a:'Largo a',b:'Ancho b',h:'Altura h',r:'Radio r',nivel:'Nivel del plano',angulo:'Inclinación del plano'};
var HINTS={a:'Longitud de la base (unidades)',b:'Ancho de la base (unidades)',h:'Distancia perpendicular a la base (unidades)',
 r:'Distancia del centro a la circunferencia',nivel:'Posición del plano respecto de la altura total',angulo:'Puede ajustarse automáticamente para quedar dentro del prisma'};
var PASOS={a:.25,b:.25,h:.25,r:.25,nivel:.05,angulo:1};
function $(id){return document.getElementById(id);}
function lowSpec() {
 var n=typeof navigator==='object'?navigator:{};
 return (n.hardwareConcurrency && n.hardwareConcurrency<=2) ||
        (n.deviceMemory && n.deviceMemory<=2) ||
        (w.matchMedia && w.matchMedia('(max-width: 440px)').matches && n.deviceMemory && n.deviceMemory<=4);
}
function webgl() {
 if(!w.WebGLRenderingContext)return false;
 try{
   var c=document.createElement('canvas'),gl=c.getContext('webgl2')||c.getContext('webgl');
   if(!gl)return false;
   var lose=gl.getExtension('WEBGL_lose_context'); if(lose)lose.loseContext();
   return true;
 }catch(e){return false;}
}
function leer() {
 try{var x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&P.MODELOS[x.figura]){figura=x.figura;valores=P.normalizar(x.valores);}}catch(e){}
 var prefs=w.Progreso?w.Progreso.leerPrefs():{};
 modo=prefs.laboratorioVista==='2d'||prefs.laboratorioVista==='3d'?prefs.laboratorioVista:(lowSpec()?'2d':'3d');
}
function guardar() {
 try{localStorage.setItem(KEY,JSON.stringify({figura:figura,valores:valores}));}catch(e){}
}
function guardarVista() {
 if(!w.Progreso)return;
 try{var p=w.Progreso.leerPrefs();p.laboratorioVista=modo;w.Progreso.guardarPrefs(p);}catch(e){}
}
function e(t,cls,text) {
 var node=document.createElement(t);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;
}
function pintarInputs() {
 sliders.innerHTML='';
 P.MODELOS[figura].controles.forEach(function(k){
  var row=e('div','lab-control'),head=e('div','lab-control-cab'),
      label=e('label','',LABELS[k]),out=e('output'),input=e('input');
  var n=k==='nivel'?valores[k]*100:valores[k];
  input.type='range';input.id='lab-control-'+k;input.min=k==='nivel'?15:P.RANGOS[k][0];
  input.max=k==='nivel'?85:P.RANGOS[k][1];input.step=k==='nivel'?5:PASOS[k];
  input.value=n;input.setAttribute('aria-describedby','lab-help-'+k);label.htmlFor=input.id;
  out.htmlFor=input.id;out.id='lab-output-'+k;
  var help=e('p','lab-control-hint',HINTS[k]);help.id='lab-help-'+k;
  head.appendChild(label);head.appendChild(out);row.appendChild(head);row.appendChild(input);row.appendChild(help);
  sliders.appendChild(row);
  input.addEventListener('input',function(){
    valores[k]=k==='nivel'?Number(this.value)/100:Number(this.value);
    actualizarEtiquetas();actualizarModelo(false);guardar();
  });
  input.addEventListener('change',function(){actualizarModelo(true);});
 });
 actualizarEtiquetas();
}
function actualizarEtiquetas(){
 P.MODELOS[figura].controles.forEach(function(k){
  var out=$('lab-output-'+k);if(out)out.value=(k==='nivel'?Math.round(valores[k]*100)+' %':P.redondear(valores[k],2)+(k==='angulo'?'°':' u'));
 });
}
function pintarCapas(spec) {
 capasBox.innerHTML='<legend>Elementos visibles</legend>';
 (spec.capas||[]).forEach(function(c){
  var label=e('label','lab-capa'),input=e('input'),dot=e('span','lab-capa-dot'),name=e('span','',c.nombre);
  input.type='checkbox';input.checked=!capasOcultas[c.id];input.setAttribute('data-lab-capa',c.id);
  dot.style.background=c.color;label.appendChild(input);label.appendChild(dot);label.appendChild(name);
  capasBox.appendChild(label);
  input.addEventListener('change',function(){
    capasOcultas[c.id]=!this.checked;
    if(modo==='3d'&&api)api.setCapa(c.id,this.checked);
    else if(modo==='2d')render2d();
  });
 });
}
function pintarFormulas(m) {
 formulas.innerHTML='';
 m.formulas.forEach(function(f){
   var card=e('article','lab-formula'),title=e('h3','',f.nombre),
     num=e('strong','',P.redondear(f.valor)+' '+f.unidad),
     math=e('div','lab-latex'),help=e('p','',f.ayuda);
   math.setAttribute('aria-label',f.latex);
   card.appendChild(title);card.appendChild(num);card.appendChild(math);card.appendChild(help);
   formulas.appendChild(card);
   if(w.katex && typeof w.katex.render==='function') {
     try{w.katex.render(f.latex,math,{throwOnError:false,strict:'ignore',output:'html'});}
     catch(err){math.textContent=f.latex;}
   }else math.textContent=f.latex.replace(/\\/g,'');
 });
 nota.textContent=m.mensaje+(figura==='seccion'?' El ángulo se restringe para conservar cuatro vértices de corte.':'');
}
function vista2d(){return {theta:cam2d.theta,phi:cam2d.phi};}
function render2d(){
 if(!ultimoModelo)return;
 var m=ultimoModelo; 
 if(api){api.destruir();api=null;}
 var result=w.Visor2D.render(lienzo,m.spec,{capasOcultas:capasOcultas,camara:vista2d()});
 if(result){lienzo.setAttribute('aria-label',m.spec.alt);estado.hidden=true;}
}
function cargarThree(){
 if(w.THREE && w.THREE.WebGLRenderer)return Promise.resolve();
 if(loading3d)return loading3d;
 // Migración progresiva a ES modules; si la distribución modular no está disponible
 // se usa la versión local clásica, que todavía requieren algunas lecciones.
 loading3d=import('../vendor/three.module.min.js').then(function(mod){
  if(!mod || !mod.WebGLRenderer || !mod.Scene)throw Error('Módulo Three.js no válido');
  w.THREE=mod;
 }).catch(function(){
  return new Promise(function(resolve,reject){
   if(w.THREE&&w.THREE.WebGLRenderer)return resolve();
   var el=document.createElement('script');
   el.src='vendor/three.min.js';el.onload=function(){if(w.THREE&&w.THREE.WebGLRenderer)resolve();else reject(Error('Three.js no disponible'));};
   el.onerror=function(){reject(Error('No se puede cargar Three.js'));};
   document.head.appendChild(el);
  });
 });
 return loading3d;
}
function mostrarError(msg){
 estado.hidden=false;estado.textContent=msg;
}
function actualizarBotones(){
 document.querySelectorAll('[data-lab-vista]').forEach(function(b){
  b.setAttribute('aria-pressed',b.getAttribute('data-lab-vista')===modo?'true':'false');
 });
 $('lab-rotacion').hidden=modo!=='2d';
 $('lab-giro').hidden=modo==='2d'||!!(w.Progreso&&w.Progreso.prefiereMovimientoReducido());
 $('lab-instrucciones').textContent=modo==='2d'?'Usa las flechas para girar la proyección 2D.':'Arrastra para girar; usa la rueda o pellizca para acercar.';
}
function render3d() {
 var ticket=++solicitud;
 if(!webgl()){modo='2d';actualizarBotones();render2d();mostrarError('Tu dispositivo no admite WebGL. Se muestra la misma figura en 2D.');return;}
 mostrarError('Cargando la vista 3D…');
 cargarThree().then(function(){
  if(ticket!==solicitud || modo!=='3d'||!ultimoModelo)return;
  if(!api){
    lienzo.innerHTML='';
    api=new w.Visor3D(lienzo,ultimoModelo.spec,{capasOcultas:capasOcultas,reducido:!!(w.Progreso&&w.Progreso.prefiereMovimientoReducido()),vista:cam2d});
    api.setAutoGiro(false);
    if(!visible||document.hidden)api.pausar();
  }else if(api.spec!==ultimoModelo.spec){
    api.actualizarSpec(ultimoModelo.spec);
  }
  lienzo.setAttribute('aria-label',ultimoModelo.spec.alt);estado.hidden=true;
 }).catch(function(err){
  if(ticket!==solicitud)return;
  console.warn('Laboratorio: fallback a SVG',err);
  if(api){api.destruir();api=null;}
  modo='2d';actualizarBotones();render2d();
  mostrarError('No se pudo iniciar la vista 3D; puedes seguir trabajando en 2D.');
 });
}
function dibujar(){
 if(modo==='2d'){solicitud++;render2d();}
 else render3d();
}
function actualizarModelo(inmediato){
 ultimoModelo=P.generar(figura,valores);
 $('lab-lienzo-titulo').textContent=ultimoModelo.modelo.nombre;
 $('lab-modelo-descripcion').textContent=ultimoModelo.modelo.nombre+'. '+ultimoModelo.mensaje;
 pintarFormulas(ultimoModelo);
 lienzo.setAttribute('aria-label',ultimoModelo.spec.alt);
 // Evitar regenerar el grafo WebGL en cada pixel de movimiento del deslizador.
 if(raf){clearTimeout(raf);raf=null;}
 if(inmediato)dibujar();
 else raf=setTimeout(function(){raf=null;dibujar();},110);
}
function cambiarModelo(tipo){
 if(!P.MODELOS[tipo])return;
 figura=tipo;valores=P.normalizar(valores);
 capasOcultas={};
 var c=P.MODELOS[tipo].controles;
 cam2d={theta:(tipo==='cilindro'||tipo==='cono')?-.58:.7,phi:.32};
 selec.value=tipo;
 pintarInputs();
 ultimoModelo=P.generar(figura,valores);pintarCapas(ultimoModelo.spec);
 actualizarModelo(true);guardar();
}
function cambiarVista(next,usuario){
 if(next!=='2d'&&next!=='3d')return;
 if(modo==='3d'&&api&&next==='2d'){cam2d=api.vista();api.destruir();api=null;}
 modo=next;actualizarBotones();
 if(usuario)guardarVista();
 dibujar();
}
function iniciar() {
 selec=$('lab-modelo');lienzo=$('lab-lienzo');estado=$('lab-estado');
 sliders=$('lab-sliders');capasBox=$('lab-capas');formulas=$('lab-formulas');nota=$('lab-principio');
 if(!P||!selec||!w.Visor2D)return;
 leer();w.UI.iniciar({});
 cambiarModelo(figura);actualizarBotones();
 if(modo==='3d')dibujar();
 selec.addEventListener('change',function(){cambiarModelo(this.value);});
 document.querySelectorAll('[data-lab-vista]').forEach(function(b){
  b.addEventListener('click',function(){cambiarVista(this.getAttribute('data-lab-vista'),true);});
 });
 $('lab-recentrar').addEventListener('click',function(){
  var cam=ultimoModelo.spec.camara;cam2d={theta:cam.theta,phi:cam.phi};
  if(api)api.reset();else render2d();
 });
 $('lab-giro').addEventListener('click',function(){
  if(!api)return;
  var on=this.getAttribute('aria-pressed')!=='true';
  api.setAutoGiro(on);this.setAttribute('aria-pressed',String(on));
  this.textContent=on?'Giro automático: sí':'Giro automático: no';
 });
 $('lab-restablecer').addEventListener('click',function(){
  valores=Object.assign({},P.DEFAULTS);capasOcultas={};cambiarModelo(figura);
 });
 document.querySelectorAll('[data-lab-rotar]').forEach(function(b){
  b.addEventListener('click',function(){
    var dir=this.getAttribute('data-lab-rotar'),delta=.16;
    if(dir==='izquierda')cam2d.theta-=delta;
    if(dir==='derecha')cam2d.theta+=delta;
    if(dir==='arriba')cam2d.phi=Math.min(1.2,cam2d.phi+delta);
    if(dir==='abajo')cam2d.phi=Math.max(-1.2,cam2d.phi-delta);
    if(modo==='2d')render2d();
  });
 });
 if('IntersectionObserver' in w){
  obs=new IntersectionObserver(function(entries){
   visible=!!entries[0].isIntersecting;
   if(api){if(visible&&!document.hidden)api.reanudar();else api.pausar();}
  },{rootMargin:'120px'});
  obs.observe(lienzo);
 }
 document.addEventListener('visibilitychange',function(){if(api){if(document.hidden)api.pausar();else if(visible)api.reanudar();}});
 if('ResizeObserver' in w){
   var rs=new ResizeObserver(function(){if(modo==='2d')render2d();});rs.observe(lienzo);
 }else w.addEventListener('resize',function(){if(modo==='2d')render2d();});
 w.addEventListener('pagehide',function(){
  solicitud++;if(raf)clearTimeout(raf);if(obs)obs.disconnect();
  if(api){api.destruir();api=null;}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);
else iniciar();
})(window);
