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
 if(w.Tutores&&teacherMounted&&modo==='aprender') {
  var lienzo=$('z-stage');
  if(lienzo&&lienzo.clientWidth) {
   var targetY=d.focus==='bases'?.65:d.focus==='altura'?.47:.45;
   try {
    w.Tutores.enfocar({figura:$('z-panel'),lienzo:lienzo,
      x:lienzo.clientWidth*.36,y:lienzo.clientHeight*targetY,nombre:d.title});
   } catch(e) {console.warn('Foco pedagógico',e);}
  }
 }
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
 var caption=element('div','z-professor-info mm-profesor-info');
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
 stopVoice();
 if(modo==='aprender'&&w.Tutores&&w.Tutores.suspender)
  w.Tutores.suspender($('z-panel'));
 modo=next;setUrl();panel();syncRenderButtons();
}

function conceptCards(){
 var root=$('z-concept-grid');if(!root)return;
 root.replaceChildren();
 // Each image is a locally hosted instructional illustration, NOT the
 // geometric source of truth. Measurements come from ZSolidos.
 var old=function(name,title,description,latex){
  return {src:'assets/zenit/'+name+'.svg',title:title,text:description,latex:latex||'',alt:title+'. Ilustración conceptual en tonos violeta.'};
 };
 var ai=function(name,title,description,latex,alt){
  return {src:'assets/zenit/lote-1/'+name+'.webp',title:title,text:description,
    latex:latex||'',alt:alt,generated:true};
 };
 var ai2=function(name,title,description,latex,alt){
  return {src:'assets/zenit/lote-2/'+name+'.webp',title:title,text:description,
    latex:latex||'',alt:alt,generated:true,portrait:true};
 };
 var concepts={
  prisma:[
   old('prisma-bases','Bases paralelas','Dos polígonos congruentes en planos paralelos.'),
   old('prisma-altura','Altura perpendicular','La distancia entre bases se mide perpendicularmente a sus planos.'),
   old('prisma-oblicuo','Prisma oblicuo','Las aristas inclinadas no son la altura.'),
   old('prisma-seccion','Sección transversal','Un plano paralelo a las bases genera una sección congruente.'),
   old('prisma-volumen','Volumen','Área de la base por altura perpendicular.','V=A_bh')
  ],
  piramide:[
   ai('piramide-altura-apotema','Altura y apotema lateral',
      'En una pirámide regular recta, la altura baja perpendicularmente al centro de la base; el apotema lateral llega al punto medio de un lado.',
      'l^2=h^2+a_p^2',
      'Pirámide violeta transparente: segmento naranja vertical de altura y segmento turquesa oblicuo hacia el punto medio de un lado de la base.'),
   ai('piramide-seccion-paralela','Sección paralela a la base',
      'Un plano paralelo a la base produce un polígono semejante a ella. El tamaño disminuye al acercarse al vértice.',
      'A_s=k^2A_b',
      'Pirámide violeta atravesada horizontalmente por un plano turquesa, con una sección poligonal interior.'),
   ai('piramide-truncada','Tronco de pirámide',
      'Se obtiene al cortar una pirámide por un plano paralelo a la base y retirar la parte superior. Conserva dos bases semejantes.',
      'V=\\frac{h}{3}(A_1+A_2+\\sqrt{A_1A_2})',
      'Tronco de pirámide violeta de cristal con la punta original representada por aristas discontinuas.')
  ],
  cilindro:[
   ai('cilindro-radio-diametro','Radio, diámetro y altura',
      'Distingue la distancia del centro al borde, el diámetro completo y la altura perpendicular entre bases.',
      'd=2r',
      'Cilindro violeta transparente con segmentos destacados en naranja y turquesa para altura y radio.'),
   ai('cilindro-desarrollo','Desarrollo lateral del cilindro',
      'Al desplegar la superficie lateral de un cilindro circular recto aparece un rectángulo de ancho 2πr y alto h.',
      'A_L=2\\pi rh',
      'Cilindro transparente que se despliega visualmente hacia un rectángulo, con dos círculos para las bases.'),
   ai('cilindro-recto-oblicuo','Cilindro recto y oblicuo',
      'Compara las generatrices perpendiculares e inclinadas. En ambos casos, el volumen se calcula con la altura perpendicular.',
      'V=A_bh',
      'Dos cilindros translúcidos violetas: uno vertical y otro inclinado, con alturas resaltadas.')
  ],
  cono:[
   ai('cono-generatriz','Radio, altura y generatriz',
      'En un cono circular recto, el radio, la altura y la generatriz forman un triángulo rectángulo.',
      'g=\\sqrt{r^2+h^2}',
      'Cono violeta transparente con una altura naranja, radio turquesa horizontal y generatriz turquesa inclinada.'),
   ai('cono-seccion-axial','Sección axial del cono',
      'Un plano que pasa por el eje del cono circular recto determina un triángulo isósceles. Su altura coincide con la del cono.',
      'A_{\\triangle}=rh',
      'Cono violeta atravesado por un plano vertical turquesa que contiene el eje y genera un triángulo axial.'),
   ai('cono-truncado','Plano de corte y tronco de cono',
      'Un plano paralelo a la base divide el cono en un cono pequeño y un tronco de cono. La figura ilustra el corte antes de separar las partes.',
      'V=\\frac{\\pi h}{3}(R^2+Rr+r^2)',
      'Cono violeta transparente atravesado horizontalmente por un plano que marca dónde se obtendría un tronco de cono.')
  ],
  esfera:[
   ai2('esfera-radio-diametro','Radio y diámetro',
     'El radio une el centro con un punto de la superficie; el diámetro une dos puntos opuestos pasando por el centro.',
     'd=2R',
     'Esfera translúcida con diámetro horizontal turquesa y radio naranja desde el centro a la superficie.'),
   ai2('esfera-circulo-maximo','Círculo máximo de la esfera',
     'Un plano que pasa por el centro corta la esfera en un círculo cuyo radio coincide con el de la esfera.',
     'A_c=\\\\pi R^2',
     'Esfera translúcida atravesada horizontalmente por un círculo central turquesa.'),
   ai2('esfera-superficie','Superficie y volumen',
     'La superficie curva de radio R tiene área 4πR² y el espacio interior encerrado tiene volumen 4πR³/3.',
     'V=\\\\frac43\\\\pi R^3',
     'Esfera violeta con meridianos y paralelos dibujados sobre su superficie y sombreado interior.'),
   ai('esfera-plano-secante','Plano secante fuera del centro',
     'Si el plano no pasa por el centro, el círculo de sección tiene un radio menor que R y cumple el teorema de Pitágoras.',
     'r_s=\\sqrt{R^2-d^2}',
     'Esfera translúcida atravesada por plano inclinado; su sección circular está resaltada.')
  ],
  cubo:[
   ai2('cubo-vertices-aristas','Caras, aristas y vértices',
     'Un cubo tiene seis caras cuadradas iguales, doce aristas y ocho vértices.',
     'N_c=6,\\\\;N_a=12,\\\\;N_v=8',
     'Cubo violeta translúcido con vértices y aristas resaltados en colores turquesa y violeta.'),
   ai2('cubo-diagonal-cara','Diagonal de una cara',
     'La diagonal de una cara cuadrada conecta dos vértices opuestos del mismo cuadrado y se calcula por Pitágoras.',
     'd_c=a\\\\sqrt2',
     'Cubo translúcido con segmento turquesa que une vértices opuestos de una cara.'),
   ai2('cubo-diagonal-espacial','Diagonal espacial del cubo',
     'La diagonal espacial une dos vértices opuestos del cubo pasando por su interior, no por una cara.',
     'd_e=a\\\\sqrt3',
     'Cubo transparente con diagonal turquesa que atraviesa su interior entre vértices opuestos.'),
   ai2('cubo-desarrollo-plano','Desarrollo plano del cubo',
     'El cubo puede desplegarse en seis cuadrados congruentes que se pliegan para reconstruir el sólido.',
     'A_T=6a^2',
     'Red de seis cuadrados violetas en forma de cruz junto a un cubo ensamblado.')
  ],
  tetraedro:[
   ai2('tetraedro-caras','Tetraedro regular: cuatro caras',
     'En un tetraedro regular, todas las caras son triángulos equiláteros congruentes y todas sus seis aristas miden a.',
     'A_T=\\\\sqrt3\,a^2',
     'Tetraedro regular violeta con cuatro caras triangulares y aristas visibles.'),
   ai2('tetraedro-altura','Altura perpendicular del tetraedro',
     'Desde un vértice, la altura llega perpendicularmente al plano de la cara opuesta. En el tetraedro regular pasa por su centro.',
     'h=a\\\\sqrt{\\\\frac23}',
     'Tetraedro de cristal con segmento naranja de altura perpendicular y una marca de ángulo recto.')
  ],
  octaedro:[
   ai2('octaedro-simetria','Eje de simetría y vértices opuestos',
     'El octaedro regular tiene ocho caras triangulares. Los vértices superior e inferior están alineados sobre un eje de simetría.',
     'd=\\\\sqrt2\,a',
     'Octaedro translúcido formado por dos pirámides cuadradas unidas por sus bases, con eje vertical punteado.')
  ]
 };
 (concepts[tipo]||[]).forEach(function(entry,i){
  var card=element('article','z-concept-card');
  var btn=element('button','z-concept-open');
  btn.type='button';btn.setAttribute('aria-label','Ampliar: '+entry.title);
  var art=element('img','z-concept-art'+(entry.portrait?' z-concept-art-portrait':''));art.src=entry.src;art.alt=entry.alt;
  art.loading='lazy';art.decoding='async';
  art.width=entry.portrait?292:entry.generated?960:680;
  art.height=entry.portrait?498:entry.generated?720:460;
  btn.append(art,element('span','z-concept-zoom','Ampliar imagen'));
  btn.addEventListener('click',function(){openConcept(entry);});
  var caption=element('div','z-concept-copy');
  caption.append(element('h3',null,entry.title),element('p',null,entry.text));
  if(entry.latex){var formula=element('div','z-concept-formula');
   formula.setAttribute('aria-label','Relación matemática');writeMath(formula,entry.latex);caption.appendChild(formula);}
  card.append(btn,caption);root.append(card);
 });
}
function openConcept(entry){
 var modal=$('z-concept-modal');
 if(!modal){window.open(entry.src,'_blank','noopener');return;}
 var img=$('z-concept-modal-img'),title=$('z-concept-modal-title'),
  caption=$('z-concept-modal-caption'),math=$('z-concept-modal-math');
 img.src=entry.src;img.alt=entry.alt;
 title.textContent=entry.title;caption.textContent=entry.text;
 math.replaceChildren();math.hidden=!entry.latex;
 if(entry.latex)writeMath(math,entry.latex);
 if(typeof modal.showModal==='function'){if(!modal.open)modal.showModal();}
 else window.open(entry.src,'_blank','noopener');
}
function setupConceptModal(){
 var modal=$('z-concept-modal');if(!modal)return;
 var close=$('z-concept-modal-close');
 if(close)close.addEventListener('click',function(){modal.close();});
 modal.addEventListener('click',function(e){if(e.target===modal)modal.close();});
}
function init(){
 w.UI.iniciar({avatar:false});
 $('z-title').textContent=Z.META[tipo].titulo;
 var familyArt=$('z-family-art');
 if(familyArt)familyArt.src='assets/zenit/'+tipo+'.svg';
 document.title=Z.META[tipo].titulo+' | Laboratorio 3D · Sistema Zénit';
 var canonical=$('z-canonical');
 if(canonical)canonical.href='https://geometriaespacio.sistemazenit.com/solido.html?tipo='+tipo;
 $('z-crumb').textContent=Z.META[tipo].titulo;
 $('z-subtitle').textContent=Z.META[tipo].subtitulo;
 $('z-view-title').textContent=Z.META[tipo].singular+' interactivo';
 conceptCards();
 setupConceptModal();
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
