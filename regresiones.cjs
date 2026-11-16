const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
test('KaTeX compone las fórmulas del curso, raíces cúbicas y fracciones', () => {
  const context = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/matematicas.js'),'utf8'), context);
  const latex = context.Matematicas.latex, katex = require('./vendor/katex.min.js');
  assert.equal(latex('∛2'), '\\sqrt[3]{2}');
  assert.equal(latex('a³√2/12'), '\\frac{a^{3} \\sqrt{2}}{12}');
  assert.equal(latex('√(R² − d²)'), '\\sqrt{R^{2} - d^{2}}');
  let total = 0;
  for (const file of fs.readdirSync(path.join(__dirname,'js')).filter(f=>/^contenido/.test(f))) {
    const source = fs.readFileSync(path.join(__dirname,'js',file),'utf8');
    for (const match of source.matchAll(/class="m">([^<]+)</g)) {
      katex.renderToString(latex(match[1]), {throwOnError:true, strict:'ignore'});
      total++;
    }
  }
  assert.ok(total > 100, 'comprueba las fórmulas reales del curso');
});
function voz() {
  const events = [], timers = [], spoken = [];
  const window = { speechSynthesis: { getVoices: () => [], cancel() {}, resume() {}, speak(u) { spoken.push(u); } } };
  const context = { window, localStorage: { getItem() { return null; }, setItem() {} },
    document: { dispatchEvent(e) { events.push(e); } }, CustomEvent: function (type, data) { this.type=type; this.detail=data.detail; },
    SpeechSynthesisUtterance: function (text) { this.text=text; },
    setTimeout(fn, ms) { timers.push({fn,ms}); return timers.length; }, clearTimeout() {}, AbortController };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'js/voz-matematica.js'),'utf8'),context);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'js/avatar.js'),'utf8'),context);
  return { api: window.Avatar, events, timers, spoken, window };
}
test('pronuncia cuadrados, signos y subíndices', () => {
  const {api}=voz();
  assert.equal(api.limpiarTextoParaVoz('a² + b² + c² = 49'), 'a al cuadrado más be al cuadrado más ce al cuadrado igual a 49');
  assert.equal(api.limpiarTextoParaVoz('AC₁ = √49'), 'A C sub 1 igual a raíz cuadrada de 49');
});
test('avanzar rápidamente descarta la locución pendiente anterior', () => {
  const v=voz();
  v.api.hablarVoz('Paso uno'); v.api.hablarVoz('Paso dos');
  v.timers.slice().forEach(t=>t.fn());
  assert.deepEqual(v.spoken.map(u=>u.text),['Paso dos']);
});
test('silenciar antes de los 50 ms impide que arranque la voz', () => {
  const v=voz(); v.api.hablarVoz('Paso uno'); v.api.setVozHabilitada(false);
  v.timers.slice().forEach(t=>t.fn()); assert.equal(v.spoken.length,0);
});
test('el fin de la voz anterior no apaga la actual', () => {
  const v=voz(); v.api.hablarVoz('Uno'); v.timers[0].fn();
  const old=v.spoken[0]; v.api.hablarVoz('Dos'); v.timers[1].fn();
  old.onend(); assert.equal(v.api.getEstadoVoz().estado,'preparando','un evento antiguo no cancela la nueva narración');
  v.spoken[1].onstart();v.spoken[1].onend();assert.equal(v.api.getEstadoVoz().estado,'finalizado');
});
test('la animación termina con el audio real, sin temporizador estimado', () => {
  const v=voz(); v.api.hablarVoz('Explicación extensa'); v.timers[0].fn();
  assert.equal(v.timers.length,1);
});
test('aplica el perfil tonal sin cambiar el texto matemático', () => {
  const v=voz();v.window.Tutores={perfilVoz:()=>({pitch:0.72,rate:0.93})};
  v.api.hablarVoz('a² + b²');v.timers[0].fn();
  assert.equal(v.spoken[0].pitch,0.72);assert.equal(v.spoken[0].rate,0.93);
  assert.equal(v.spoken[0].text,'a al cuadrado más be al cuadrado');
});

test('Fase 4: fracciones, raíces, grados, letras B/V y unidades no separan dígitos',()=>{
  const v=voz(),formato=v.api.limpiarTextoParaVoz;
  assert.equal(formato('B y V'),'be y uve');
  assert.equal(formato('x² -7x +12'),'equis al cuadrado menos 7 equis más 12');
  assert.equal(formato('\\frac{3}{4}'),'fracción 3 sobre 4');
  assert.equal(formato('C₁D₁'),'C sub 1 D sub 1');
  assert.equal(formato('V=12 cm³'),'uve igual a 12 centímetros cúbicos');
  assert.equal(formato('3 mm²'),'3 milímetros cuadrados');
  assert.ok(formato('∛8').includes('raíz cúbica'));
});
test('Fase 4: eventos de palabra y estado conservan la figura origen',()=>{
  const v=voz();
  v.api.hablarVoz('AB = 12',null,{origen:'figura-a'});
  v.timers[0].fn();
  const u=v.spoken[0];u.onstart();
  assert.equal(v.api.getEstadoVoz().estado,'hablando');
  u.onboundary({name:'word',charIndex:3,charLength:5});
  const b=v.events.filter(e=>e.type==='avatar-palabra').at(-1);
  assert.equal(b.detail.origen,'figura-a');
  assert.equal(b.detail.texto,'A be igual a 12');
  assert.equal(b.detail.charIndex,3);
  u.onend();
  assert.equal(v.api.getEstadoVoz().estado,'finalizado');
});
test('Fase 4: locución sustituida no puede marcar el estado de la nueva',()=>{
  const v=voz();
  v.api.hablarVoz('Primera',null,{origen:'figura-a'});v.timers[0].fn();
  const anterior=v.spoken[0];anterior.onstart();
  v.api.hablarVoz('Segunda',null,{origen:'figura-b'});v.timers[1].fn();
  const actual=v.spoken[1];actual.onstart();
  anterior.onerror({error:'canceled'});
  anterior.onend();
  assert.equal(v.api.getEstadoVoz().origen,'figura-b');
  assert.equal(v.api.getEstadoVoz().estado,'hablando');
  actual.onend();
  assert.equal(v.api.getEstadoVoz().estado,'finalizado');
});
test('Fase 4: pausa y reanudación reales, sin avanzar pasos por temporizador',()=>{
  const v=voz();
  let pausas=0,reanudaciones=0;
  v.window.speechSynthesis.pause=()=>{pausas++;};
  v.window.speechSynthesis.resume=()=>{reanudaciones++;};
  v.api.hablarVoz('Un prisma tiene seis caras',null,{origen:'figura-c'});
  v.timers[0].fn();v.spoken[0].onstart();
  assert.equal(v.api.pausarVoz(),true);
  assert.equal(v.api.getEstadoVoz().estado,'pausado');
  assert.equal(v.api.reanudarVoz(),true);
  assert.equal(v.api.getEstadoVoz().estado,'hablando');
  assert.equal(pausas,1);assert.equal(reanudaciones,1);
  assert.equal(v.timers.length,1,'no se programa fin estimado de audio');
});
test('Fase 4: voces españolas preferidas, selección segura y error TTS sin bloquear',()=>{
  const v=voz();
  v.window.speechSynthesis.getVoices=()=>[
    {lang:'en-US',name:'English',voiceURI:'en'},
    {lang:'es-ES',name:'Castellano',voiceURI:'es'},
    {lang:'es-PE',name:'Voz peruana',voiceURI:'pe'}
  ];
  assert.equal(v.api.vocesDisponibles().length,2);
  assert.equal(v.api.elegirVoz('inexistente'),false);
  assert.equal(v.api.elegirVoz('pe'),true);
  v.api.hablarVoz('Raíz',null,{origen:'figura-d'});v.timers[0].fn();
  assert.equal(v.spoken[0].voice.voiceURI,'pe');
  v.spoken[0].onerror({error:'language-unavailable'});
  assert.equal(v.api.getEstadoVoz().estado,'error');
});
function tutores(guardado) {
  const datos={'geo3d.tutor.v1':guardado},window={addEventListener(){}};
  const document={currentScript:{src:'http://localhost/js/tutores.js'},addEventListener(){},querySelectorAll(){return[];},dispatchEvent(){}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8'),{window,document,URL,localStorage:{getItem:k=>datos[k],setItem:(k,v)=>{datos[k]=v;}},CustomEvent:function(){}});
  return {api:window.Tutores,datos};
}
test('tutor inicial: maestro KayKit 3D y alternativa accesible SVG',()=>{
  const {api}=tutores('desconocido');
  assert.equal(api.actual(),'maestro-arcano');
  for(const id of ['dragon','dragon-alado','pikachu','charizard'])
    assert.equal(api.elegir(id),false);
  assert.equal(api.elegir('inexistente'),false);
  assert.equal(api.actual(),'maestro-arcano');
  assert.ok(api.catalogo.some(p=>p.id==='vertiz'&&p.tipo==='Ilustración'));
});
test('cambiar de profesor recuerda el personaje 3D con la voz neural preservada',()=>{
  const {api,datos}=tutores('maestro-arcano');
  assert.equal(api.elegir('guardian-zenit'),true);
  assert.equal(datos['geo3d.tutor.v1'],'guardian-zenit');
  assert.equal(api.perfilVoz().pitch,1);
  assert.equal(api.perfilVoz().rate,1);
  assert.equal(api.elegir('exploradora-zenit'),true);
});
test('tres profesores GLB se distribuyen con rig y clips genuinos',()=>{
  const {api}=tutores('maestro-arcano');
  const models=api.catalogo.filter(p=>p.tipo==='3D');
  assert.equal(models.length,3);
  for(const tutor of models){
    assert.ok(tutor.modelo.startsWith('vendor/avatares/'));
    const glb=fs.readFileSync(path.join(__dirname,tutor.modelo));
    assert.equal(glb.readUInt32LE(0),0x46546c67);
    assert.ok(glb.length>150000&&glb.length<900000);
    const d=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)));
    assert.ok(d.skins?.length>0);
    const names=d.animations.map(a=>a.name);
    assert.ok(names.includes('Idle'),tutor.id);
    assert.ok(names.includes('Spellcast_Shoot'),tutor.id);
    assert.ok(names.includes('Walking_A'),tutor.id);
  }
});
test('el prisma contiene una diagonal de base y una espacial con longitudes correctas', () => {
  const window={}; vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window});
  const spec=window.Figuras.obtener('prisma-diagonales');
  assert.equal(spec.lineas.length,2);
  const len=l=>Math.hypot(...spec.vertices[l.v[0]].p.map((x,i)=>x-spec.vertices[l.v[1]].p[i]));
  assert.equal(len(spec.lineas.find(l=>l.capa==='diagonal-espacial')),7);
  assert.ok(Math.abs(len(spec.lineas.find(l=>l.capa==='diagonal-cara'))-Math.sqrt(13))<1e-10);
  spec.pasosGuia.forEach(p=>assert.ok(p.capasVisibles.includes(p.capaResaltada)));
  // AC no debe colapsar horizontalmente sobre AA₁ desde la cámara de la guía.
  spec.pasosGuia.forEach(p=>{
    const t=p.camara.theta;
    assert.ok(Math.abs(2*Math.cos(t)+3*Math.sin(t))>2.5);
  });
});
test('el foco cae en la diagonal explicada y se puede proyectar en ambos motores',()=>{
  const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window});
  const spec=window.Figuras.obtener('prisma-diagonales');
  assert.deepEqual(Array.from(window.Figuras.puntoAtencion(spec,'diagonal-espacial')),[0,3,0]);
  assert.deepEqual(Array.from(window.Figuras.puntoAtencion(spec,'diagonal-cara')),[0,0,0]);
  assert.equal(window.Figuras.puntoAtencion({vertices:{}},'vacia'),null);
});
test('la vista 2D muestra una capa inicialmente apagada cuando la guía la activa',()=>{
  function node(tag){return {tag,attrs:{},children:[],setAttribute(k,v){this.attrs[k]=String(v);},appendChild(n){this.children.push(n);},set innerHTML(v){this.children=[];}};}
  const window={document:{createElementNS(ns,tag){return node(tag);}}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window});
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/visor2d.js'),'utf8'),{window});
  const spec={titulo:'Prueba',camara:{theta:0.7,phi:0.3},vertices:{A:{p:[-1,0,0]},B:{p:[1,1,0]}},lineas:[{v:['A','B'],capa:'diagonal'}],capas:[{id:'diagonal',activa:false,color:'#ff0000'}]};
  const cont=node('div');cont.clientWidth=500;cont.clientHeight=300;
  function lineas(n){return (n.tag==='path'&&n.attrs.stroke==='#ff0000'?1:0)+n.children.reduce((s,c)=>s+lineas(c),0);}
  window.Visor2D.render(cont,spec,{});assert.equal(lineas(cont),0);
  const api=window.Visor2D.render(cont,spec,{capasOcultas:{diagonal:false}});assert.ok(lineas(cont)>0);
  const p=api.proyectar([0,0.5,0]);assert.ok(p.visible);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
});

function actividades() {
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'js/actividades.js'), 'utf8'), { window });
  return window.Actividades;
}

test('validación numérica estricta: decimales, fracciones y notación científica', () => {
  const parse = actividades().aNumero;
  assert.equal(parse('7/2'), 3.5);
  assert.equal(parse('1 / 4'), 0.25);
  assert.equal(parse('-2,5'), -2.5);
  assert.equal(parse('.75'), 0.75);
  assert.equal(parse('1e3'), 1000);
  assert.equal(parse(' 12 '), 12);
});

test('validación numérica estricta: rechaza respuestas mal formadas', () => {
  const parse = actividades().aNumero;
  for (const valor of ['12abc', '2m', '1 2', '1+1', '12/0', '2/0.0', '5/3/2', '--2', '1.2.3', 'Infinity', '', '1e9999']) {
    assert.ok(Number.isNaN(parse(valor)), 'Debe rechazarse: ' + valor);
  }
});

test('consultar pistas no incrementa intentos ni puntos', () => {
  const store = new Map();
  const window = { localStorage: {
    setItem(k, v) { store.set(k, String(v)); },
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    removeItem(k) { store.delete(k); }
  }};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'js/progreso.js'), 'utf8'), { window, console, Date });
  const P = window.Progreso;
  P.registrarEjercicio('m6l1', 'ej1', false, 1, false);
  const primera = P.resumenLeccion('m6l1').ejercicios.ej1;
  assert.equal(primera.intentos, 0);
  assert.equal(primera.pistas, 1);
  assert.equal(P.puntos(), 0);
  P.registrarEjercicio('m6l1', 'ej1', true, 1);
  assert.equal(P.resumenLeccion('m6l1').ejercicios.ej1.intentos, 1);
  assert.equal(P.puntos(), 10);
  P.registrarReto('m6l1', 'reto1', 3, false);
  assert.equal(P.puntos(), 10);
  P.registrarReto('m6l1', 'reto1', 3, true);
  assert.equal(P.puntos(), 10, 'revelar desarrollo no permite ganar puntos');
  assert.equal(P.resumenLeccion('m6l1').retos.reto1.resuelto, false);
  P.registrarReto('m6l1', 'reto2', 1, true);
  assert.equal(P.puntos(), 35, 'declaración previa al desarrollo sí puntúa');
  P.registrarReto('m6l1', 'reto2', 3, false);
  assert.equal(P.puntos(), 35, 'consultar después no revoca una resolución anterior');
});

/* Fase 2 — batería de propiedades matemáticas para el laboratorio. */
function parametricasLab() {
  const win={};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/parametricas.js'),'utf8'),{window:win});
  return win.Parametricas;
}
function cercanos(a,b,eps=1e-9){assert.ok(Math.abs(a-b)<eps, 'Valores diferentes: '+a+' y '+b);}

test('Fase 2: prisma, superficies y diagonales por Pitágoras',()=>{
 const P=parametricasLab(), m=P.generar('prisma',{a:3,b:2,h:4});
 assert.equal(m.formulas[0].valor,24);
 assert.equal(m.formulas[1].valor,52);
 cercanos(m.formulas[2].valor,Math.sqrt(29));
 cercanos(m.formulas[3].valor,Math.sqrt(13));
});

test('Fase 2: pirámide correcta en bases rectangulares no cuadradas',()=>{
 const P=parametricasLab(), m=P.generar('piramide',{a:3,b:2,h:4});
 assert.equal(m.formulas[0].valor,8);
 cercanos(m.formulas[1].valor,3*Math.hypot(4,1)+2*Math.hypot(4,1.5));
 cercanos(m.formulas[2].valor,Math.hypot(4,1.5,1));
});

test('Fase 2: volumen y áreas de cilindro, cono y esfera',()=>{
 const P=parametricasLab();
 const c=P.generar('cilindro',{r:2,h:4}),k=P.generar('cono',{r:2,h:4});
 cercanos(c.formulas[0].valor,16*Math.PI);
 cercanos(c.formulas[1].valor,16*Math.PI);
 cercanos(k.formulas[0].valor,c.formulas[0].valor/3);
 cercanos(k.formulas[3].valor,Math.sqrt(20));
 const a=P.generar('esfera',{r:2}),b=P.generar('esfera',{r:4});
 cercanos(b.formulas[0].valor,8*a.formulas[0].valor);
 cercanos(b.formulas[1].valor,4*a.formulas[1].valor);
});

test('Fase 2: el corte oblicuo nunca atraviesa fuera del prisma',()=>{
 const P=parametricasLab();
 for(const a of [1,3,10])for(const h of [1,3,10])for(const angulo of [-35,0,35]){
   const m=P.generar('seccion',{a,b:2,h,nivel:.15,angulo});
   const v=['S0','S1','S2','S3'].map(id=>m.spec.vertices[id].p);
   assert.ok(v.every(x=>x[1]>=-1e-10&&x[1]<=h+1e-10));
   const q=v[1].map((x,i)=>x-v[0][i]),t=v[3].map((x,i)=>x-v[0][i]);
   const cross=[q[1]*t[2]-q[2]*t[1],q[2]*t[0]-q[0]*t[2],q[0]*t[1]-q[1]*t[0]];
   cercanos(Math.hypot(...cross),m.formulas[0].valor);
 }
});

test('Fase 2: vértices y capas compartidos entre motores',()=>{
 const P=parametricasLab();
 for(const type of Object.keys(P.MODELOS)){
   for(const vals of [{a:1,b:1,h:1,r:.5,nivel:.15,angulo:-35},{a:10,b:10,h:10,r:6,nivel:.85,angulo:35}]){
     const m=P.generar(type,vals),spec=m.spec, ids=Object.keys(spec.vertices);
     ids.forEach(k=>assert.ok(spec.vertices[k].p.every(Number.isFinite)));
     spec.caras.forEach(c=>c.v.forEach(k=>assert.ok(ids.includes(k),type+': '+k)));
     spec.aristas.forEach(e=>{assert.ok(ids.includes(e.a));assert.ok(ids.includes(e.b));});
     spec.lineas.forEach(l=>(l.v||[]).forEach(k=>assert.ok(ids.includes(k))));
     m.formulas.forEach(f=>assert.ok(Number.isFinite(f.valor)));
     assert.ok(spec.capas.length>0);
   }
 }
});

test('Fase 2: entradas inválidas no producen puntos no finitos',()=>{
 const P=parametricasLab();
 const p=P.normalizar({a:-12,b:Infinity,h:'?',r:null,nivel:99,angulo:-999});
 assert.equal(p.a,1);
 assert.equal(p.h,4);
 assert.equal(p.nivel,.85);
 assert.equal(p.angulo,-35);
 assert.ok(Object.values(p).every(Number.isFinite));
});

test('Fase 2: las 16 escenas curriculares tienen vértices, capas y guías válidas',()=>{
  const window={};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window});
  const F=window.Figuras;
  assert.equal(Object.keys(F.spec).length,16);
  for(const id of Object.keys(F.spec)){
    const s=F.obtener(id),vs=s.vertices||{},layers=new Set((s.capas||[]).map(c=>c.id));
    Object.keys(vs).forEach(k=>assert.ok(vs[k].p.every(Number.isFinite),id+' vértice '+k));
    (s.caras||[]).forEach(c=>{c.v.forEach(k=>assert.ok(vs[k],id+' cara '+k));if(c.capa)assert.ok(layers.has(c.capa),id+' capa '+c.capa);});
    (s.aristas||[]).forEach(ar=>{assert.ok(vs[ar.a]&&vs[ar.b],id+' arista inválida');if(ar.capa)assert.ok(layers.has(ar.capa));});
    (s.lineas||[]).forEach(l=>{
      if(l.v)l.v.forEach(k=>assert.ok(vs[k],id+' línea '+k));
      if(l.capa)assert.ok(layers.has(l.capa),id+' capa '+l.capa);
    });
    (s.pasosGuia||[]).forEach(p=>{
      if(p.capaResaltada)assert.ok(layers.has(p.capaResaltada),id+' guía '+p.capaResaltada);
      (p.capasVisibles||[]).forEach(c=>assert.ok(layers.has(c),id+' capa guía '+c));
    });
  }
});

/* Fase 3 — regresiones de correcciones y del banco completo. */
function cargarCursoFase3(){
  const window={};
  const base={window,Contenido:null};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/contenido.js'),'utf8'),base);
  const C=window.Contenido;
  for(const file of ['contenido-a.js','contenido-b.js','contenido-c.js','contenido-d.js','contenido-uni.js']){
    vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js',file),'utf8'),{Contenido:C});
  }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window});
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/distractores.js'),'utf8'),{Contenido:C,window});
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/auditoria-academica.js'),'utf8'),{window});
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/auditoria-retos.js'),'utf8'),{window});
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/guia-academica.js'),'utf8'),{window});
  return window;
}
test('Fase 3: las 17 lecciones y las 107 preguntas tienen cobertura académica completa',()=>{
  const w=cargarCursoFase3(),r=w.AuditoriaAcademica.auditar(w.Contenido);
  assert.equal(r.correcto,true,JSON.stringify(r.errores));
  assert.equal(r.lecciones,17);assert.equal(r.ejercicios,107);
  assert.equal(r.numericos,64);assert.equal(r.opciones,43);assert.equal(r.retos,18);
  assert.equal(r.recalculos,64);assert.equal(r.advertencias.length,0);
  const retos=w.AuditoriaRetos.verificar(w.Contenido);
  assert.equal(retos.correcto,true,JSON.stringify(retos.errores));
  assert.equal(retos.total,18);assert.equal(retos.comprobados,18);
  assert.equal(w.DiagnosticoAcademico.total,43);assert.equal(w.DiagnosticoAcademico.esperados,43);
  assert.equal(w.Contenido.bancoPractica().filter(e=>e.tipo==='opcion').flatMap(e=>e.opciones.filter(o=>!o.correcta&&!o.motivo)).length,0);
  assert.equal(w.GuiaAcademica.ids.length,17);
  w.Contenido.listaOrdenada().forEach(l=>{
    const a=w.GuiaAcademica.obtener(l.id);
    assert.ok(a && a.principio && a.verificacion && a.limite,'guía '+l.id);
    assert.equal(l.leccion.ejercicios.filter(e=>e.dificultad==='UNI').length,1,'problema UNI '+l.id);
  });
});
test('Fase 3: correcciones de errores geométricos críticos verificables',()=>{
  const w=cargarCursoFase3(),C=w.Contenido,near=(x,y)=>assert.ok(Math.abs(x-y)<1e-8);
  near(C.bancoPractica().find(e=>e.id==='m7l1e6').respuesta,3.61);
  assert.ok(C.obtenerLeccion('m2l2').retos[0].respuesta.includes('V(PA₁BD)=0'));
  assert.ok(C.obtenerLeccion('m1l2').retos[0].respuesta.includes('√10+1/√2'));
  assert.ok(C.obtenerLeccion('m12l1').retos[0].respuesta.includes('2a³/3'));
  assert.ok(C.obtenerLeccion('m7l1').retos[0].enunciado.includes('AC₁'));
  assert.ok(!C.obtenerLeccion('m10l1').retos[0].titulo.includes('pentagonal'));
  near(Math.sqrt(5*5-(2*Math.sqrt(3))**2),Math.sqrt(13));
});
test('Fase 3: solución consultada recibe menos puntos; las pistas no cuentan como intentos',()=>{
  const data=new Map(),window={localStorage:{
    setItem(k,v){data.set(k,String(v));},getItem(k){return data.has(k)?data.get(k):null;},removeItem(k){data.delete(k);}
  }};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/progreso.js'),'utf8'),{window,Date,console});
  const P=window.Progreso;
  P.registrarEjercicio('m1l1','indep',true,0,true,false);
  P.registrarEjercicio('m1l1','conayuda',false,2,false,true);
  P.registrarEjercicio('m1l1','conayuda',true,2,true,true);
  P.registrarEjercicio('m1l1','solo-pista',false,1,false);
  assert.equal(P.puntos(),15);
  assert.equal(P.cuentaEjercicios('m1l1').intentados,2);
  assert.equal(P.cuentaEjercicios('m1l1').hechos,2);
  P.registrarReto('m1l1','revelado',2,false);
  P.registrarReto('m1l1','revelado',2,true);
  assert.equal(P.puntos(),15);
  P.registrarReto('m1l1','autonomo',1,true);
  assert.equal(P.puntos(),40);
});

test('Fase 3: se mantienen los contornos de sección y la claridad de nombres geométricos',()=>{
  const w=cargarCursoFase3(),c=w.Contenido;
  const sec=c.obtenerLeccion('m1l2').retos[0].respuesta;
  assert.ok(sec.includes('a(√10+1/√2)'), 'perímetro de la sección pentagonal');
  const ort=c.obtenerLeccion('m1l2').ejercicios.find(e=>e.id==='m1l2e5');
  assert.ok(ort.opciones[0].texto.includes('ortogonales'),'rectas alabeadas ortogonales');
  const pis=c.obtenerLeccion('m6l2').ejercicios.find(e=>e.id==='m6l2e2');
  assert.ok(pis.pregunta.includes('en ese orden'),'coherencia del corte plano');
  assert.ok(pis.explicacion.includes('2+5=3+4'),'suma de alturas opuestas');
});

/* Fase 5: carga crítica, catálogo ligero, GPU y seguridad del servidor local. */
test('Fase 5: la portada y lecciones no cargan Three.js de forma bloqueante',()=>{
  ['index.html','leccion.html'].forEach(file=>{
    const html=fs.readFileSync(path.join(__dirname,file),'utf8');
    assert.ok(html.includes('js/cargador3d.js'),file+' usa cargador compartido');
    assert.ok(!html.includes('<script src="vendor/three.min.js"'),file+' no precarga Three');
    assert.ok(!html.includes('<script src="js/visor3d.js'),file+' no precarga visor 3D');
    assert.ok(html.includes('js/visor2d.js'),file+' mantiene SVG');
  });
  const lab=fs.readFileSync(path.join(__dirname,'js/laboratorio.js'),'utf8');
  assert.ok(!lab.includes("import('../vendor/three.module.min.js')"),'laboratorio evita el paquete modular más pesado');
  assert.ok(fs.statSync(path.join(__dirname,'vendor/three.min.js')).size<700000);
  assert.ok(fs.statSync(path.join(__dirname,'vendor/three.module.min.js')).size>1000000);
});
test('Fase 5: páginas informativas conservan progreso con catálogo ligero',()=>{
  const window={Progreso:{estado:id=>['m1l1','m7l1'].includes(id)?'hecho':'pendiente'}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/catalogo-ligero.js'),'utf8'),{window});
  const resumen=window.Contenido.progresoGlobal();
  assert.equal(window.Contenido.IDs.length,17);
  assert.equal(resumen.hechas,2);
  assert.equal(resumen.total,17);
  assert.equal(resumen.pct,12);
  ['acerca.html','descarga.html','laboratorio.html'].forEach(page=>{
    const html=fs.readFileSync(path.join(__dirname,page),'utf8');
    assert.ok(html.includes('js/catalogo-ligero.js'),page+' declara catálogo liviano');
    assert.ok(!html.includes('js/contenido-a.js'),page+' no carga demostraciones');
    assert.ok(!html.includes('js/contenido-d.js'),page+' no carga banco de retos');
    assert.ok(!html.includes('js/tutores.js'),page+' no necesita motor 3D de tutores');
  });
});
test('Fase 5: la vista 3D estática no conserva un bucle RAF permanente',()=>{
  const callbacks=[],context={
    module:{exports:{}},exports:{},console,performance:{now:()=>100},
    requestAnimationFrame:fn=>{callbacks.push(fn);return callbacks.length;},
    cancelAnimationFrame:()=>{},window:{removeEventListener(){}}
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/visor3d.js'),'utf8'),context);
  const proto=context.module.exports.Visor3D.prototype;
  const visor=Object.create(proto);let renders=0;
  Object.assign(visor,{
    animando:true,_destruido:false,_raf:null,_sucio:true,
    autoGiro:false,_resalte:null,_ultimo:100,_renders:0,
    renderer:{render(){renders++;}},escena:{},camara:{},
    capasOcultas:{},objetosCapa:{aristas:[{visible:true}]}
  });
  visor._loop=proto._loop.bind(visor);
  visor._loop(110);
  assert.equal(renders,1);
  assert.equal(callbacks.length,0,'sin giro ni cambios no debe programar RAF');
  visor.setCapa('aristas',false);
  assert.equal(callbacks.length,1,'un cambio solicita exactamente un nuevo fotograma');
  callbacks[0](125);
  assert.equal(renders,2);
  assert.equal(callbacks.length,1,'vuelve a quedar quieto después del cambio');
  assert.equal(visor.estadisticas().renderizados,2);
});
test('Fase 5: destruir un visor libera recursos compartidos una sola vez',()=>{
  const context={
    module:{exports:{}},exports:{},console,
    requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},
    window:{removeEventListener(){}}
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/visor3d.js'),'utf8'),context);
  const proto=context.module.exports.Visor3D.prototype;
  const cuentas={geo:0,mat:0,tex:0,renderer:0,contexto:0},g={dispose(){cuentas.geo++;}},
    tex={dispose(){cuentas.tex++;}},mat={map:tex,dispose(){cuentas.mat++;}};
  const visor=Object.create(proto);
  Object.assign(visor,{
    _destruido:false,animando:true,_raf:null,_animCamaraId:null,_ro:{disconnect(){}},
    _geoCil:g,_geoEsf:g,_mover:function(){},_fin:function(){},
    escena:{traverse(fn){fn({geometry:g,material:mat});fn({geometry:g,material:mat});}},
    renderer:{dispose(){cuentas.renderer++;},forceContextLoss(){cuentas.contexto++;},
      domElement:{parentNode:{removeChild(){}}}}
  });
  visor.destruir();visor.destruir();
  assert.deepEqual(cuentas,{geo:1,mat:1,tex:1,renderer:1,contexto:1});
});
test('Fase 5: servidor local expone solo recursos publicados, no secretos',()=>{
  const ruta=require('./server.js').rutaPublica;
  assert.equal(ruta('/index.html'),true);
  assert.equal(ruta('/js/visor.js'),true);
  assert.equal(ruta('/vendor/tutor-dragon.glb'),true);
  assert.equal(ruta('/README.md'),true);
  for(const acceso of ['/server.js','/package.json','/.env','/.git/config',
    '/js/../server.js','/node_modules/a.js','/css/.secreto','/assets-privados/datos.json'])
    assert.equal(ruta(acceso),false,acceso+' denegado');
  const build=fs.readFileSync(path.join(__dirname,'build.js'),'utf8');
  assert.ok(build.includes("'_headers'"));
  assert.ok(fs.readFileSync(path.join(__dirname,'_headers'),'utf8').includes('X-Content-Type-Options: nosniff'));
});

test('Fase 6: dos Vértiz no comparten los ID ni los gradientes del SVG',()=>{
 const window={},context={window,localStorage:{getItem(){return null;},setItem(){}},document:{dispatchEvent(){}},CustomEvent:function(){}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/avatar.js'),'utf8'),context);
 const primero=window.Avatar.svg(),segundo=window.Avatar.svg();
 const ids=[...primero.matchAll(/id="(vertiz-[^"]+)"/g)].map(m=>m[1]);
 const ids2=[...segundo.matchAll(/id="(vertiz-[^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,4);
 assert.equal(ids2.length,4);
 assert.equal(new Set(ids.concat(ids2)).size,8,'cada gradiente tiene nombre único');
 for(const svg of [primero,segundo]){
  const defs=new Set([...svg.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
  for(const match of svg.matchAll(/url\(#([^)]+)\)/g))assert.ok(defs.has(match[1]),'referencia a gradiente existente');
 }
});

test('Fase 6: sitemap con 23 URL canónicas y todas las lecciones',()=>{
 const xml=fs.readFileSync(path.join(__dirname,'sitemap.xml'),'utf8');
 const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
 assert.equal(urls.length,23);
 assert.equal(new Set(urls).size,23);
 assert.ok(urls.includes('https://geometriaespacio.sistemazenit.com/'));
 const datos=JSON.parse(fs.readFileSync(path.join(__dirname,'QA-FASE6/matriz.json'),'utf8'));
 assert.equal(datos.lecciones.length,17);
 datos.lecciones.forEach(leccion=>{
  assert.ok(urls.includes('https://geometriaespacio.sistemazenit.com/leccion?id='+leccion.id));
  assert.equal(leccion.erroresKatex,0);
  assert.equal(leccion.idsDuplicados,0);
 });
 assert.equal(datos.lecciones.reduce((s,x)=>s+x.ejercicios,0),107);
 assert.equal(datos.lecciones.reduce((s,x)=>s+x.retos,0),18);
 assert.equal(datos.paginas.length,7);
 assert.equal(datos.validaciones.combinacionesPaginas,49);
});
test('Fase 6: el ZIP y el build incluyen recursos y evidencias del cierre',()=>{
 const window={};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/descarga.js'),'utf8'),{window,TextEncoder,document:{readyState:'loading',addEventListener(){}}});
 const archivos=window.Descarga.ARCHIVOS;
 assert.equal(new Set(archivos).size,archivos.length,'no duplicar rutas en ZIP');
 ['robots.txt','sitemap.xml','FASE6-REPORTE-2026-11-14.md',
  'css/fase6.css','QA-FASE6/matriz.json','QA-FASE6/registro-incidencias.md',
  'QA-FASE6/verificacion-320-antes.jpg','QA-FASE6/verificacion-320-despues.jpg']
  .forEach(p=>assert.ok(archivos.includes(p),'falta recurso '+p));
 const mini=window.Descarga.construirZip([{nombre:'prueba.txt',datos:Uint8Array.from([65,66,67])}]);
 assert.equal(mini.entradas,1);
 assert.equal(mini.bytes[0],0x50);assert.equal(mini.bytes[1],0x4b);
 assert.equal(mini.bytes[2],3);assert.equal(mini.bytes[3],4);
 assert.equal(window.Descarga.crc32(Uint8Array.from([65,66,67])),2743272264);
 const build=fs.readFileSync(path.join(__dirname,'build.js'),'utf8');
 ['QA-FASE6','sitemap.xml','robots.txt','FASE6-REPORTE-2026-11-14.md'].forEach(x=>assert.ok(build.includes("'"+x+"'")));
});


test('Portada de sólidos: ocho opciones, sin franja Aula 3D ni sección de dragón',()=>{
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  const js=fs.readFileSync(path.join(__dirname,'js/inicio.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'css/portada-limpia.css'),'utf8');
  assert.equal((html.match(/data-solido="/g)||[]).length,8);
  assert.ok(html.includes('aria-label="Elegir sólido geométrico"'));
  assert.ok(!html.includes('class="seccion banda-vertiz"'));
  assert.ok(js.includes("prisma:'prisma-elementos'"));
  assert.ok(js.includes("esfera:'esfera'"));
  assert.ok(css.includes('.hero::before'));
  assert.ok(css.includes('content:none'));
  assert.ok(css.includes('.mm-dialogo-texto'));
  assert.ok(!html.includes('id="btn-continuar-hero"'), 'sin bloque promocional oculto');
  assert.ok(!fs.readFileSync(path.join(__dirname,'js/visor.js'),'utf8').includes('✨ AULA 3D'), 'sin franja de Aula 3D ni en el DOM');
});


test('Aula premium: barra externa, avatar protagonista y controles separados',()=>{
 const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
 const visor=fs.readFileSync(path.join(__dirname,'js/visor.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'css/aula-premium.css'),'utf8');
 assert.ok(html.includes('id="hero-aula-controles"'));
 assert.ok(html.includes('css/aula-premium.css'));
 assert.ok(visor.includes('controlesExternos.appendChild(barraSup)'));
 assert.ok(visor.includes('controlesExternos.appendChild(controlesVoz)'));
 assert.ok(visor.includes('panelAjustes.appendChild(preferencias)'));
 assert.ok(css.includes('grid-template-columns:clamp(126px,12vw,174px)'));
 assert.ok(css.includes('.hero .hero-toolbar .figura-ajustes[hidden]'));
 assert.ok(css.includes('.hero .hero-toolbar{flex-wrap:wrap'));
});
test('Servicio de voz neural: catálogo cerrado, estado y audio sin exponer texto libre',async()=>{
 const js=fs.readFileSync(path.join(__dirname,'functions/api/tts.js'),'utf8');
 const ctx={Response,Request,URL,URLSearchParams,console};
 vm.createContext(ctx);
 vm.runInContext(js.replace('export async function onRequestGet','async function onRequestGet')+
   '\nthis.onRequestGet=onRequestGet;',ctx);
 const fn=ctx.onRequestGet;
 let res=await fn({request:new Request('https://example.com/api/tts?estado=1'),env:{}});
 let health=await res.json();assert.equal(res.status,200);assert.equal(health.pasos,45);
 assert.equal(health.habilitado,false);
 res=await fn({request:new Request('https://example.com/api/tts?figura=inexistente&paso=0'),env:{}});
 assert.equal(res.status,400);
 res=await fn({request:new Request('https://example.com/api/tts?figura=prisma-elementos&paso=0'),env:{}});
 assert.equal(res.status,503);
 let entrada=null;
 res=await fn({request:new Request('https://example.com/api/tts?figura=prisma-elementos&paso=0&voz=javier'),
   env:{AI:{run:async(model,payload)=>{entrada={model,payload};return new Uint8Array([73,68,51,3,4,5])}}}});
 assert.equal(res.status,200);assert.equal(res.headers.get('content-type'),'audio/mpeg');
 assert.equal(entrada.model,'@cf/deepgram/aura-2-es');
 assert.equal(entrada.payload.speaker,'javier');
 assert.ok(entrada.payload.text.startsWith('Un prisma recto'));
 res=await fn({request:new Request('https://example.com/api/tts?figura=prisma-elementos&paso=0&voz=invalid'),
   env:{AI:{run:async()=>{throw Error('no debe ejecutarse')}}}});
 assert.equal(res.status,400);
});
test('Vértiz tiene como opción principal la voz neural masculina',()=>{
 const {api}=voz();
 assert.equal(api.getMotorVoz(),'neural');
 assert.equal(api.getVozNeural(),'javier');
 assert.equal(api.setVozNeural('alvaro'),true);
 assert.equal(api.getVozNeural(),'alvaro');
 assert.equal(api.setVozNeural('voz-invalida'),false);
 assert.equal(api.setMotorVoz('nativa'),true);
 assert.equal(api.getMotorVoz(),'nativa');
 assert.equal(api.setMotorVoz('neural'),true);
 const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
 assert.ok(html.indexOf('js/voz-neural.js') < html.indexOf('js/avatar.js'));
});


test('Visor: controles secundarios trasladados a Ajustes siguen disponibles',()=>{
 const s=fs.readFileSync(path.join(__dirname,'js/visor.js'),'utf8');
 assert.ok(s.includes('function buscarControl(accion)'));
 for(const accion of ['vista','reset','giro','contraste']){
   assert.ok(s.includes("buscarControl('"+accion+"').addEventListener"),accion+' tiene manejador activo');
   assert.ok(!s.includes("barraSup.querySelector('[data-accion=\""+accion+"\"]').addEventListener"),accion+' no busca el nodo en su posición antigua');
 }
 assert.ok(s.includes("btnProyectar.addEventListener('click', alternarProyector)"));
});


test('Vértiz reproduce MP3 neural con pausa/reanuda y libera audio al cambiar de paso',async()=>{
  const v=voz(),a=[],released=[],fetches=[];
  class AudioSimulado {
    constructor(src){this.src=src;this.playbackRate=1;this.playing=false;a.push(this);}
    play(){this.playing=true;if(this.onplaying)this.onplaying();return Promise.resolve();}
    pause(){this.playing=false;if(this.onpause)this.onpause();}
    removeAttribute(){this.src='';}
    load(){}
  }
  v.window.Audio=AudioSimulado;
  v.window.URL={createObjectURL:()=> 'blob:voz-prueba',revokeObjectURL:u=>released.push(u)};
  v.window.VozNeural={generar:(arg,signal)=>{
    fetches.push({arg,signal});
    return Promise.resolve({size:1200,type:'audio/mpeg'});
  }};
  v.api.hablarVoz('Un prisma recto',null,
    {origen:'prisma-uno',figura:'prisma-elementos',paso:0});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(fetches.length,1);
  assert.equal(fetches[0].arg.figura,'prisma-elementos');
  assert.equal(fetches[0].arg.paso,0);
  assert.equal(fetches[0].arg.voz,'javier');
  assert.equal(v.api.getEstadoVoz().estado,'hablando');
  assert.equal(a.length,1);
  assert.equal(v.spoken.length,0,'no se ha invocado el sintetizador robótico del dispositivo');
  assert.equal(v.api.pausarVoz(),true);
  assert.equal(v.api.getEstadoVoz().estado,'pausado');
  assert.equal(v.api.reanudarVoz(),true);
  assert.equal(v.api.getEstadoVoz().estado,'hablando');
  v.api.hablarVoz('Siguiente paso',null,
    {origen:'prisma-dos',figura:'prisma-elementos',paso:1});
  assert.equal(fetches[0].signal.aborted,true);
  assert.equal(a[0].playing,false);
  assert.equal(released.length,1);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(a.length,2);
  assert.equal(v.api.getEstadoVoz().origen,'prisma-dos');
  v.api.detenerVoz();
  assert.equal(v.api.getEstadoVoz().estado,'detenido');
  assert.equal(released.length,2);
});


test('Profesor 3D: el navegador utiliza GLTFLoader, gestos por voz y fallback 2D',()=>{
  const js=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  assert.ok(js.includes("if(!p.modelo)return bloques(p.id)"));
  assert.ok(js.includes("new T.GLTFLoader().load(url(p.modelo)"));
  assert.ok(js.includes("cambiarGesto(hablando)"));
  assert.ok(js.includes("acciones3d[claveAccion]"));
  assert.ok(js.includes("if (p.id === 'vertiz') return"));
  assert.ok(html.includes('css/avatares-3d.css'));
});
