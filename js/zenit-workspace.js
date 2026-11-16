/* Sistema Zénit 3.0 — interfaz de laboratorio individual. */
(function(w){
'use strict';
var Z=w.ZSolidos, P=w.Parametricas;
if(!Z||!P)return;
var $=id=>document.getElementById(id);
var qs=new URLSearchParams(w.location.search);
var tipo=Object.prototype.hasOwnProperty.call(Z.META,qs.get('tipo'))?qs.get('tipo'):'prisma';
var modo=['aprender','experimentar','resolver'].includes(qs.get('modo'))?qs.get('modo'):'aprender';
var key='geo3d.solid.v3.'+tipo,baseData={};
try{baseData=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(err){}
for(const k of ['lados','angulo','a','b','h','r','arista','desplazamiento','base']){
 if(qs.has(k))baseData[k]=qs.get(k);
}
var valores=Z.normalizar(baseData),modelo=Z.generar(tipo,valores),indexPaso=0,pasoSol=0,
 tarea='V', vista='iso',render='2d',api=null,capasOcultas={},cargando=null,
 requestId=0,timeout=null,teacherNode=null,teacherMounted=false,voiceOn=false;
var CAM={iso:{theta:-.72,phi:.30},front:{theta:0,phi:0},side:{theta:Math.PI/2,phi:0},top:{theta:0,phi:1.47}};
function $(id){return document.getElementById(id);}
function element(t,c,content){var n=document.createElement(t);if(c)n.className=c;if(content!=null)n.textContent=content;return n;}
function num(n){return (Math.round(n*100)/100).toLocaleString('es-PE',{maximumFractionDigits:2});}
function persist(){
 try{localStorage.setItem(key,JSON.stringify(valores));}catch(err){}
}
function setUrl(){
 try{
  var url=new URL(location.href);url.searchParams.set('tipo',tipo);
  if(modo==='aprender')url.searchParams.delete('modo');else url.searchParams.set('modo',modo);
  w.history.replaceState(null,'',url);
 }catch(err){}
}
function reduced(){return !!(w.Progreso&&w.Progreso.prefiereMovimientoReducido());}
function webgl(){
 if(!w.WebGLRenderingContext)return false;
 try{var c=document.createElement('canvas'),gl=c.getContext('webgl2')||c.getContext('webgl');if(!gl)return false;var x=gl.getExtension('WEBGL_lose_context');if(x)x.loseContext();return true;}catch(err){return false;}
}
function stopVoice(){
 if(w.speechSynthesis)w.speechSynthesis.cancel();
 voiceOn=false;
 document.dispatchEvent(new CustomEvent('avatar-hablando',{detail:{activo:false}}));
}
function status(msg){
 var node=$('z-status');
 if(!node){node=element('p','z-stage-status');node.id='z-status';node.setAttribute('role','status');$('z-stage').appendChild(node);}
 node.hidden=!msg;node.textContent=msg||'';
}
function syncRenderButtons(){
 document.querySelectorAll('[data-z-render]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.zRender===render));});
 document.querySelectorAll('[data-z-camera]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.zCamera===vista));});
}
function release3D(){
 if(!api)return;
 try{api.destruir();}catch(err){console.warn('Liberación 3D',err);}
 api=null;
}
function setupLayers(){
 var previous=capasOcultas;capasOcultas={};
 (modelo.spec.capas||[]).forEach(function(c){
  capasOcultas[c.id]=Object.prototype.hasOwnProperty.call(previous,c.id)?previous[c.id]:!c.activa;
 });
 if(modo==='aprender')guideLayers();
 var wrap=$('z-layers');
 wrap.replaceChildren();
 var legend=element('legend',null,'Capas de la figura');wrap.appendChild(legend);
 (modelo.spec.capas||[]).forEach(function(c){
  var label=element('label','z-layer');
  var input=document.createElement('input');input.type='checkbox';input.checked=!capasOcultas[c.id];
  input.setAttribute('aria-label','Mostrar '+c.nombre.toLowerCase());input.dataset.layer=c.id;
  var name=element('span',null,c.nombre);
  label.append(input,name);wrap.appendChild(label);
  input.addEventListener('change',function(){
   capasOcultas[c.id]=!input.checked;
   if(api)api.setCapa(c.id,input.checked);else draw2D();
  });
 });
}
function guideLayers(){
 var step=modelo.guide[indexPaso];
 (modelo.spec.capas||[]).forEach(function(c){
  if(c.auxiliar||['altura','diagonal','diagonales','baseDiagonal','generatriz','radio'].includes(c.id)){
   capasOcultas[c.id]=!!(!step||step.focus!==c.id);
  }
 });
}
function refreshLayerInputs(){
 document.querySelectorAll('[data-layer]').forEach(function(inp){
  inp.checked=!capasOcultas[inp.dataset.layer];
 });
}
function draw2D(){
 requestId++;release3D();
 try{
  w.Visor2D.render($('z-stage'),modelo.spec,{capasOcultas:capasOcultas,camara:CAM[vista]});
  status('');syncRenderButtons();
 }catch(err){status('No se pudo dibujar la figura. Prueba otra vista.');console.warn(err);}
}
function draw3D(){
 var ticket=++requestId;
 if(!webgl()){render='2d';draw2D();status('Este navegador no admite WebGL; la figura sigue disponible en 2D.');return;}
 status('Preparando el modelo 3D…');
 if(!cargando)cargando=w.Cargador3D.cargar().catch(function(e){cargando=null;throw e;});
 cargando.then(function(){
  if(ticket!==requestId||render!=='3d')return;
  try{
   if(!api){
    $('z-stage').replaceChildren();
    api=new w.Visor3D($('z-stage'),modelo.spec,{
      capasOcultas:capasOcultas,reducido:reduced(),vista:CAM[vista]
    });
    api.setAutoGiro(false);
    if(api.renderer&&api.renderer.domElement){
     api.renderer.domElement.addEventListener('webglcontextlost',function(ev){
      ev.preventDefault();if(render!=='3d')return;
      requestId++;release3D();render='2d';draw2D();
      status('Se perdió el contexto 3D. Puedes continuar con la misma figura en 2D.');
     },{once:true});
    }
   } else {
    api.capasOcultas=capasOcultas;
    api.actualizarSpec(modelo.spec);
   }
   api.enfocarCamara(CAM[vista].theta,CAM[vista].phi,null,reduced()?0:300);
   status('');syncRenderButtons();
  }catch(err){
   console.warn('Fallo del visor 3D',err);
   release3D();render='2d';draw2D();
   status('No fue posible iniciar 3D; el modelo permanece disponible en 2D.');
  }
 }).catch(function(err){
  if(ticket!==requestId)return;
  console.warn('Descarga Three.js',err);
  release3D();render='2d';draw2D();
  status('No se pudo cargar el motor 3D. Puedes trabajar con el modelo 2D.');
 });
}
function draw(){
 if(render==='3d')draw3D();else draw2D();
}
function camera(next){
 if(!CAM[next])return;
 vista=next;
 if(api)api.enfocarCamara(CAM[vista].theta,CAM[vista].phi,null,reduced()?0:350);
 else if(render==='2d')draw2D();
 syncRenderButtons();
}
function writeMath(node,tex){
 if(!node)return;
 node.textContent=tex;
 if(w.katex&&w.katex.render){
  try{w.katex.render(tex,node,{displayMode:false,output:'htmlAndMathml',throwOnError:true,trust:false,strict:'ignore'});}
  catch(err){node.setAttribute('data-math-error','true');}
 }
}
function formulasGrid(){
 var grid=element('div','z-formula-grid');
 modelo.formulas.forEach(function(f){
  var card=element('article','z-math-card');
  var title=element('h4',null,f.label);
  var math=element('div','z-math');writeMath(math,f.latex);
  var value=element('strong',null,num(f.value)+' '+f.unit);
  card.append(title,math,value);grid.appendChild(card);
 });
 return grid;
}
function headerPanel(kicker,title,description){
 var box=element('div','z-panel-header');
 box.append(element('span','z-label',kicker),element('h2',null,title),element('p',null,description));
 return box;
}
function learnStep(){
 var d=modelo.guide[indexPaso];
 var card=$('z-step-card'),counter=$('z-step-count'),prev=$('z-prev'),next=$('z-next');
 if(!card)return;
 card.replaceChildren();
 var line=element('div','z-step-title');
 line.append(element('h3',null,d.title),element('span','z-step-index',(indexPaso+1)+' / '+modelo.guide.length));
 card.append(line,element('p',null,d.text));
 if(d.latex){
  var ex=element('div','z-step-expression');writeMath(ex,d.latex);card.appendChild(ex);
 }
 if(counter)counter.textContent='Paso '+(indexPaso+1)+' de '+modelo.guide.length;
 if(prev)prev.disabled=indexPaso===0;
 if(next)next.textContent=indexPaso===modelo.guide.length-1?'Volver al inicio ↺':'Siguiente paso →';
 guideLayers();refreshLayerInputs();
 if(api){(modelo.spec.capas||[]).forEach(function(c){api.setCapa(c.id,!capasOcultas[c.id]);});}
 else if(render==='2d')draw2D();
}
function panelLearn(){
 var box=$('z-side-content');box.replaceChildren();
 box.appendChild(headerPanel('MODO APRENDER','Aprende con el Profesor Xavier',
  'Sigue los conceptos a tu ritmo. La figura destaca las partes del paso.'));
 var teacher=element('div','z-teacher');
 if(!teacherNode){teacherNode=element('div','z-teacher-model');teacherNode.setAttribute('aria-label','Representación 3D del Profesor Xavier');}
 teacher.appendChild(teacherNode);
 var caption=element('div');
 caption.append(element('span','z-teacher-naming','Docente virtual'),
  element('strong',null,'Profesor Xavier'),
  element('span',null,'Observa, escucha y comprende cada sólido geométrico.'));
 teacher.append(caption);box.appendChild(teacher);
 if(w.Tutores && !teacherMounted){
  if(w.Tutores.actual&&w.Tutores.actual()!=='profesor-realista')
    w.Tutores.elegir('profesor-realista');
  w.Tutores.montar(teacherNode);teacherMounted=true;
 }
 var card=element('article','z-step-card');card.id='z-step-card';box.append(card);
 var playRow=element('div','z-voice-row');
 var audio=element('button','z-btn z-btn-secondary','▶ Escuchar explicación');
 audio.type='button';
 audio.addEventListener('click',function(){
  if(!('speechSynthesis' in w)||!('SpeechSynthesisUtterance' in w)){
   audio.textContent='La voz no está disponible en este navegador';return;
  }
  stopVoice();
  var step=modelo.guide[indexPaso];
  var u=new SpeechSynthesisUtterance(step.title+'. '+step.text);
  u.lang='es-PE';u.rate=.92;
  var spanish=w.speechSynthesis.getVoices().find(function(v){return /^es-/i.test(v.lang);});
  if(spanish)u.voice=spanish;
  u.onstart=function(){voiceOn=true;document.dispatchEvent(new CustomEvent('avatar-hablando',{detail:{activo:true}}));};
  u.onend=u.onerror=function(){voiceOn=false;document.dispatchEvent(new CustomEvent('avatar-hablando',{detail:{activo:false}}));};
  w.speechSynthesis.speak(u);
 });
 playRow.append(audio,element('span','z-small-note','Voz disponible según el dispositivo.'));
 box.appendChild(playRow);
 var nav=element('div','z-step-nav');
 var prev=element('button','z-btn','← Anterior');prev.id='z-prev';
 var next=element('button','z-btn z-btn-primary','Siguiente paso →');next.id='z-next';
 prev.addEventListener('click',function(){if(indexPaso>0){stopVoice();indexPaso--;learnStep();}});
 next.addEventListener('click',function(){stopVoice();indexPaso=(indexPaso+1)%modelo.guide.length;learnStep();});
 nav.append(prev,next);box.append(nav);
 box.appendChild(element('span','z-small-note','El modelo, las capas y los cálculos son comunes a los tres modos.'));
 var href=tipo==='prisma'?'leccion.html?id=m6l1':'index.html#ruta';
 var link=element('a','z-link-tutor','Ver las lecciones completas ↗');link.href=href;box.append(link);
 var counter=element('span','z-sr');counter.id='z-step-count';counter.style.position='absolute';counter.style.width='1px';counter.style.height='1px';counter.style.overflow='hidden';
 box.append(counter);
 learnStep();
}
function control(k){
 var row=element('div','z-control'),head=element('div','z-control-head');
 var label=element('label',null,Z.NOMBRES[k]),value=element('output');
 var id='z-param-'+k;label.htmlFor=id;value.htmlFor=id;value.id='z-out-'+k;
 head.append(label,value);row.append(head);
 var input;
 if(k==='base'){
  input=document.createElement('select');
  [{v:'regular',n:'Regular (lados y ángulos iguales)'},{v:'irregular',n:'Irregular (base convexa)'}].forEach(function(q){
   var opt=document.createElement('option');opt.value=q.v;opt.textContent=q.n;input.append(opt);
  });
  input.value=valores.base;
 }else{
  input=document.createElement('input');input.type='range';
  input.min=Z.RANGOS[k][0];input.max=Z.RANGOS[k][1];
  input.step=['lados'].includes(k)?'1':['angulo'].includes(k)?'5':k==='nivel'?'0.05':k==='desplazamiento'?'0.1':'0.1';
  input.value=valores[k];
 }
 input.id=id;
 function format(){value.textContent=k==='base'?valores.base==='regular'?'Regular':'Irregular':
   (k==='nivel'?Math.round(valores.nivel*100)+' %':num(valores[k])+(k==='angulo'?'°':k==='lados'?'':' u'));}
 format();
 row.appendChild(input);
 input.addEventListener('input',function(){
  valores[k]=k==='base'?input.value:Number(input.value);
  valores=Z.normalizar(valores);
  format();persist();updateModel(false);
  if(k==='base')panelExperiment();
 });
 input.addEventListener('change',function(){updateModel(true);});
 return row;
}
function panelExperiment(){
 var box=$('z-side-content');box.replaceChildren();
 box.appendChild(headerPanel('MODO EXPERIMENTAR','Cambia el sólido',
  'Mueve los controles y observa cómo cambia el dibujo y sus resultados.'));
 var controls=element('div','z-control-grid');
 Z.CONTROLES[tipo].filter(function(k){return k!=='b'||valores.base==='irregular';}).forEach(function(k){controls.appendChild(control(k));});
 box.append(controls);
 var results=element('div','z-live-results');
 results.appendChild(element('h3',null,'Resultados matemáticos'));
 var grid=formulasGrid();grid.id='z-live-formulas';
 results.append(grid);box.append(results);
 var reset=element('button','z-btn','↺ Restablecer medidas');
 reset.addEventListener('click',function(){valores=Z.normalizar({});persist();updateModel(true);panelExperiment();});
 box.append(reset,element('span','z-small-note','El ángulo de las aristas con la base es 90° en un prisma recto. La altura siempre se mide perpendicularmente.'));
 if(tipo==='prisma'){
  var cutLink=element('a','z-link-tutor','Explorar cortes oblicuos avanzados ↗');
  cutLink.href='laboratorio.html?modelo=seccion';
  box.append(cutLink);
 }
}
function solveSteps(){
 var f=modelo.formulas.find(function(x){return tarea==='V'?x.label==='Volumen':x.label==='Área total';})||modelo.formulas.at(-1);
 var field=tarea==='V'?'V':'A_T';
 var context=tipo==='prisma'?'Área basal = '+num(modelo.values.Ab)+' u² y altura = '+num(valores.h)+' u.':
   tipo==='cubo'||tipo==='tetraedro'||tipo==='octaedro'?'Arista = '+num(valores.arista)+' u.':
   tipo==='piramide'?'Área basal = '+num(modelo.values.Ab)+' u² y altura = '+num(valores.h)+' u.':
   tipo==='esfera'?'Radio = '+num(valores.r)+' u.':
   'Radio = '+num(valores.r)+' u y altura = '+num(valores.h)+' u.';
 return [
  {title:'Identificar los datos',text:context,latex:''},
  {title:'Seleccionar la fórmula',text:'Elegimos una relación matemática válida para este tipo de sólido.',latex:f.latex},
  {title:'Sustituir y calcular',text:'Utiliza las magnitudes del modelo actual. Los resultados se recalculan cuando cambias sus controles.',latex:field+'\\approx '+num(f.value)},
  {title:'Interpretar el resultado',text:'La magnitud buscada es '+f.label.toLowerCase()+'. Recuerda indicar correctamente las unidades.',latex:field+'\\approx '+num(f.value)+'\\,\\mathrm{'+(f.unit==='u³'?'u^3':'u^2')+'}',answer:num(f.value)+' '+f.unit}
 ];
}
function showSolve(){
 var steps=solveSteps(),s=steps[pasoSol],card=$('z-solve-card');
 if(!card)return;
 card.replaceChildren();
 var h=element('div','z-step-title');
 h.append(element('h3',null,s.title),element('span','z-step-index',(pasoSol+1)+' / '+steps.length));
 card.append(h,element('p',null,s.text));
 if(s.latex){var math=element('div','z-step-expression');writeMath(math,s.latex);card.append(math);}
 if(s.answer)card.appendChild(element('strong','z-answer-value',s.answer));
 $('z-solve-prev').disabled=pasoSol===0;
 $('z-solve-next').textContent=pasoSol===steps.length-1?'Resolver de nuevo ↺':'Continuar →';
}
function panelSolve(){
 var box=$('z-side-content');box.replaceChildren();
 box.appendChild(headerPanel('MODO RESOLVER','Del dibujo al resultado',
  'Desarrolla un problema con las dimensiones actuales, paso a paso.'));
 var label=element('label','z-solve-title','¿Qué deseas calcular?');label.htmlFor='z-task';
 var select=element('select','z-solve-select');select.id='z-task';
 [{v:'V',l:'Volumen'},{v:'At',l:'Área total'}].forEach(function(o){
  var opt=document.createElement('option');opt.value=o.v;opt.textContent=o.l;select.append(opt);
 });
 select.value=tarea;
 select.addEventListener('change',function(){tarea=select.value;pasoSol=0;showSolve();});
 box.append(label,select);
 var card=element('article','z-step-card');card.id='z-solve-card';box.append(card);
 var nav=element('div','z-solve-nav');
 var prev=element('button','z-btn','← Anterior');prev.id='z-solve-prev';
 var next=element('button','z-btn z-btn-primary','Continuar →');next.id='z-solve-next';
 prev.addEventListener('click',function(){if(pasoSol>0){pasoSol--;showSolve();}});
 next.addEventListener('click',function(){pasoSol=(pasoSol+1)%4;showSolve();});
 nav.append(prev,next);box.append(nav);
 box.appendChild(element('span','z-small-note','Los números se obtienen del mismo modelo que se muestra a la izquierda.'));
 showSolve();
}
function panel(){
 var side=$('z-panel'),id='z-tab-'+modo;side.setAttribute('aria-labelledby',id);
 document.querySelectorAll('[data-z-mode]').forEach(function(b){
  var current=b.dataset.zMode===modo;
  b.setAttribute('aria-selected',String(current));b.tabIndex=current?0:-1;
 });
 if(modo==='aprender')panelLearn();
 else if(modo==='experimentar')panelExperiment();
 else panelSolve();
}
function updateModel(immediate){
 modelo=Z.generar(tipo,valores);
 if(modo==='aprender')guideLayers();
 setupLayers();
 clearTimeout(timeout);
 if(immediate)draw();
 else timeout=setTimeout(draw,85);
 if(modo==='experimentar'){
  var old=$('z-live-formulas');
  if(old){var next=formulasGrid();next.id='z-live-formulas';old.replaceWith(next);}
 }else if(modo==='aprender')learnStep();
 else if(modo==='resolver')showSolve();
}
function changeMode(next){
 if(!['aprender','experimentar','resolver'].includes(next))return;
 stopVoice();modo=next;setUrl();panel();syncRenderButtons();
}
function init(){
 w.UI.iniciar({avatar:false});
 $('z-title').textContent=Z.META[tipo].titulo;
 document.title=Z.META[tipo].titulo+' | Laboratorio 3D · Sistema Zénit';
 var canonical=$('z-canonical');
 if(canonical)canonical.href='https://geometriaespacio.sistemazenit.com/solido.html?tipo='+tipo;
 $('z-crumb').textContent=Z.META[tipo].titulo;
 $('z-subtitle').textContent=Z.META[tipo].subtitulo;
 $('z-view-title').textContent=Z.META[tipo].singular+' interactivo';
 $('z-type').value=tipo;
 $('z-type').addEventListener('change',function(){location.href='solido.html?tipo='+encodeURIComponent(this.value);});
 document.querySelectorAll('[data-z-mode]').forEach(function(b){
  b.addEventListener('click',function(){changeMode(this.dataset.zMode);});
  b.addEventListener('keydown',function(e){
   if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
   var modes=['aprender','experimentar','resolver'],i=modes.indexOf(modo);
   var next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;
   changeMode(modes[next]);
   document.querySelector('[data-z-mode="'+modes[next]+'"]').focus();
   e.preventDefault();
  });
 });
 document.querySelectorAll('[data-z-render]').forEach(function(b){
  b.addEventListener('click',function(){render=this.dataset.zRender;draw();});
 });
 document.querySelectorAll('[data-z-camera]').forEach(function(b){
  b.addEventListener('click',function(){camera(this.dataset.zCamera);});
 });
 $('z-reset').addEventListener('click',function(){camera('iso');});
 document.addEventListener('movimiento-cambiado',function(){if(api)api.setReducido(reduced());});
 w.addEventListener('pagehide',function(){stopVoice();requestId++;release3D();});
 var start2D=!webgl()||w.matchMedia('(max-width: 700px)').matches;
 render=start2D?'2d':'3d';
 setupLayers();panel();draw();
 if('ResizeObserver' in w){
  var resizeTimeout,observer=new ResizeObserver(function(){
   if(render!=='2d')return;
   clearTimeout(resizeTimeout);resizeTimeout=setTimeout(draw2D,130);
  });observer.observe($('z-stage'));
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})(window);
