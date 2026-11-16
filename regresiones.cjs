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
test('tutor inicial: humano Rocketbox realista con alternativa SVG accesible',()=>{
  const {api}=tutores('desconocido');
  assert.equal(api.actual(),'profesor-realista');
  for(const id of ['dragon','dragon-alado','pikachu','charizard'])
    assert.equal(api.elegir(id),false);
  assert.equal(api.elegir('inexistente'),false);
  assert.equal(api.actual(),'profesor-realista');
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
test('cinco profesores GLB: tres con animaciones y dos Rocketbox con visemas',()=>{
  const {api}=tutores('maestro-arcano');
  const models=api.catalogo.filter(p=>p.tipo==='3D');
  assert.equal(models.length,5);
  for(const tutor of models){
    assert.ok(tutor.modelo.startsWith('vendor/avatares/'));
    const glb=fs.readFileSync(path.join(__dirname,tutor.modelo));
    assert.equal(glb.readUInt32LE(0),0x46546c67);
    assert.ok(glb.length>150000&&glb.length<1200000);
    const d=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)));
    assert.ok(d.skins?.length>0);
    if(tutor.realista){
      assert.ok(tutor.meshopt);
      assert.ok(d.extensionsRequired.includes('EXT_meshopt_compression'));
      const morphs=d.meshes.flatMap(m=>m.extras?.targetNames||[]);
      for(const name of ['viseme_aa','viseme_PP','viseme_O'])
        assert.ok(morphs.includes(name),tutor.id+' necesita '+name);
    }else{
      const names=d.animations.map(a=>a.name);
      assert.ok(names.includes('Idle'),tutor.id);
      assert.ok(names.includes('Spellcast_Shoot'),tutor.id);
      assert.ok(names.includes('Walking_A'),tutor.id);
    }
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
  assert.equal(Object.keys(F.spec).length,19);
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
test('Fase 5: portada ligera, lecciones y laboratorios con 3D diferido',()=>{
  const home=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  assert.ok(!home.includes('js/cargador3d.js'),'inicio sin motor WebGL');
  for(const file of ['leccion.html','solido.html']){
    const html=fs.readFileSync(path.join(__dirname,file),'utf8');
    assert.ok(html.includes('js/cargador3d.js'),file+' usa cargador compartido');
    assert.ok(!html.includes('<script src="vendor/three.min.js"'),file+' no precarga Three');
    assert.ok(!html.includes('<script src="js/visor3d.js'),file+' no precarga visor 3D');
    assert.ok(html.includes('js/visor2d.js'),file+' mantiene SVG');
  }
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

test('Fase 6: sitemap de lecciones más páginas de sólidos',()=>{
 const xml=fs.readFileSync(path.join(__dirname,'sitemap.xml'),'utf8');
 const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
 assert.equal(urls.length,32);
 assert.ok(urls.some(u=>u.endsWith('/solidos.html')));
 assert.ok(urls.some(u=>u.includes('/solido.html?tipo=prisma')));
 assert.equal(new Set(urls).size,32);
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


test('Portada 3.0 presenta el producto antes del laboratorio y conserva la ruta',()=>{
 const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'js/inicio.js'),'utf8');
 assert.ok(html.includes('id="zenit-h1"'));
 assert.ok(html.includes('href="solidos.html"'));
 assert.ok(html.includes('id="como-funciona"'));
 assert.ok(html.includes('id="ruta"'));
 assert.ok(html.includes('id="lista-modulos"'));
 assert.ok(!html.includes('id="hero-figura-contenedor"'),'nada de simulador antes del aprendizaje');
 assert.ok(!html.includes('id="hero-tipo-prisma"'),'sin selector horizontal saturado');
 assert.ok(!html.includes('js/visor.js'),'no cargar el motor 3D en la portada');
 assert.ok(js.includes("window.location.replace('solido.html?'"),'los enlaces históricos se redirigen');
});

test('Aula premium existente se conserva para las lecciones narradas',()=>{
 const visor=fs.readFileSync(path.join(__dirname,'js/visor.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'css/aula-premium.css'),'utf8');
 const solid=fs.readFileSync(path.join(__dirname,'solido.html'),'utf8');
 assert.ok(visor.includes('controlesExternos.appendChild(barraSup)'));
 assert.ok(visor.includes('controlesExternos.appendChild(controlesVoz)'));
 assert.ok(css.includes('grid-template-columns:clamp(222px,20vw,265px)'));
 assert.ok(solid.includes('id="z-stage"'));
 assert.ok(solid.includes('data-z-mode="aprender"'));
 assert.ok(solid.includes('data-z-mode="experimentar"'));
 assert.ok(solid.includes('data-z-mode="resolver"'));
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
 const html=fs.readFileSync(path.join(__dirname,'leccion.html'),'utf8');
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
  const html=fs.readFileSync(path.join(__dirname,'solido.html'),'utf8');
  assert.ok(js.includes("if(!p.modelo)return bloques(p.id)"));
  assert.ok(js.includes("loader.load(url(p.modelo)"),"cargador reutilizable con Meshopt");
  assert.ok(js.includes("cambiarGesto(hablando)"));
  assert.ok(js.includes("acciones3d[claveAccion]"));
  assert.ok(js.includes("if (p.id === 'vertiz') return"));
  assert.ok(html.includes('css/avatares-3d.css'));
});


test('No se pierde el personaje creado antes de insertarlo en DOM',()=>{
 const js=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
 assert.ok(js.includes('if(nodo.isConnected)cargarModelo()'));
 assert.ok(js.includes('if(v.visible)cargarModelo()'));
 assert.ok(js.includes("acciones3d[claveAccion]"));
});
test('Documentación: licencia CC0 y ausencia de lipsync fonético explícito',()=>{
 const about=fs.readFileSync(path.join(__dirname,'acerca.html'),'utf8');
 const credit=fs.readFileSync(path.join(__dirname,'vendor/avatares/ORIGEN-Y-LICENCIA.md'),'utf8');
 assert.ok(about.includes('KayKit Adventurers'));
 assert.ok(about.includes('no tienen visemas'));
 assert.ok(!about.includes('selector permite cambiar entre ocho animales'));
 assert.ok(credit.includes('CC0 1.0'));
});


test('Rocketbox: decoder MIT, boca guiada por MP3 y licencia reproducida',()=>{
 const js=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
 const avatar=fs.readFileSync(path.join(__dirname,'js/avatar.js'),'utf8');
 const dec=fs.readFileSync(path.join(__dirname,'vendor/meshopt_decoder_reference.js'),'utf8');
 const lic=fs.readFileSync(path.join(__dirname,'vendor/avatares/ROCKETBOX-LICENSE.txt'),'utf8');
 assert.ok(js.includes("loader.setMeshoptDecoder(global.MeshoptDecoder)"));
 assert.ok(js.includes("morphTargetDictionary.viseme_aa"));
 assert.ok(js.includes("document.addEventListener('avatar-audio-elemento'"));
 assert.ok(avatar.includes("new CustomEvent('avatar-audio-elemento'"));
 const win={};vm.runInNewContext(dec,{window:win,Promise,Uint8Array,Uint32Array});
 assert.equal(win.MeshoptDecoder.supported,true);
 assert.equal(typeof win.MeshoptDecoder.decodeGltfBuffer,'function');
 assert.ok(lic.includes('Copyright (c) 2020 Microsoft'));
});


test('Humano 3D inicial parpadea y conserva sincronización guiada por amplitud',()=>{
  const tutor=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
  assert.ok(tutor.includes("var elegido = 'profesor-realista'"));
  assert.ok(tutor.includes('morphTargetDictionary.eyeBlinkLeft'));
  assert.ok(tutor.includes('morphTargetDictionary.eyeBlinkRight'));
  assert.ok(tutor.includes('nivelDeVoz(t)'));
  assert.ok(tutor.includes('if(!mallasLabios.length)return'));
});


test('La elección explícita de docente SVG persiste y los perfiles están completos',()=>{
 const {api}=tutores('vertiz');
 assert.equal(api.actual(),'vertiz');
 assert.equal(api.perfilVoz().pitch,1);
 assert.equal(api.elegir('profesor-realista'),true);
 assert.equal(api.perfilVoz().pitch,1);
 const s=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
 assert.ok(s.includes("if(!renderer)elegir('vertiz')"));
 assert.ok(!s.includes("['personaje','Voz de personaje']"));
});


test('Apertura de boca Rocketbox observable en las métricas locales del visor',()=>{
 const source=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
 assert.ok(source.includes('aperturaBoca:'));
 assert.ok(source.includes('morphTargetInfluences[mallasLabios[0].aa]'));
});

test('el cubo inicia limpio y su sección de seis puntos es un hexágono regular', () => {
  const contexto = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'js/figuras.js'), 'utf8'), contexto);
  const cubo = contexto.window.Figuras.obtener('cubo-seccion');
  const paso = cubo.pasosGuia;
  const ocultables = Object.fromEntries(cubo.capas.map(c => [c.id, c.activa]));
  assert.equal(ocultables.seccion, false);
  assert.equal(ocultables['diagonal-espacial'], false);
  assert.deepEqual(Array.from(paso[0].capasVisibles), ['caras', 'aristas']);
  assert.ok(paso[1].capasVisibles.includes('seccion'));
  const vertices = Array.from({length:6}, (_,i) => cubo.vertices['H'+i].p);
  const longitud = (a,b) => Math.hypot(...a.map((v,i)=>v-b[i]));
  const lados = vertices.map((v,i)=>longitud(v,vertices[(i+1)%6]));
  assert.ok(lados.every(v=>Math.abs(v-lados[0])<1e-9), 'seis lados iguales');
  const plano = vertices[0].reduce((s,v)=>s+v,0);
  assert.ok(vertices.every(v=>Math.abs(v.reduce((s,x)=>s+x,0)-plano)<1e-9), 'seis puntos coplanares');
  assert.ok(lados[0]>0);
});

test('Los docentes 3D señalan con huesos reales de Rocketbox y KayKit', () => {
  const glb = archivo => {
    const bytes=fs.readFileSync(path.join(__dirname, 'vendor/avatares',archivo));
    assert.equal(bytes.toString('ascii',0,4),'glTF');
    const longitud=bytes.readUInt32LE(12);
    const doc=JSON.parse(bytes.toString('utf8',20,20+longitud));
    return (doc.nodes||[]).map(n=>n.name).filter(Boolean);
  };
  for(const nombre of ['rocketbox_male.glb','rocketbox_female.glb']){
    const nodos=glb(nombre);
    for(const hueso of ['Head','Bip01_Neck','Bip01_L_UpperArm','Bip01_R_UpperArm',
      'Bip01_L_Forearm','Bip01_R_Forearm','Bip01_LEye','Bip01_REye']){
      assert.ok(nodos.includes(hueso),nombre+' requiere '+hueso);
    }
  }
  const aventura=glb('player_priest.glb');
  assert.ok(aventura.includes('upperarm.l')&&aventura.includes('upperarm.r'));
  const codigo=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
  for(const nombre of ['bip01lupperarm','bip01rupperarm','bip01leye','bip01reye',
    'bip01lforearm','bip01rforearm']){
    assert.ok(codigo.includes(nombre),'El controlador debe reconocer '+nombre);
  }
  assert.ok(codigo.includes('vistaObjetivo?direccion(vistaObjetivo)'));
  assert.ok(codigo.includes('gestoNivel'));
  assert.ok(codigo.includes('girarMundo(huesosGuia.neck,new T.Vector3(0,1,0)'));
});

test('Navegación del visor permite retroceder y volver a oír el paso anterior',()=>{
  const visor=fs.readFileSync(path.join(__dirname,'js/visor.js'),'utf8');
  assert.ok(visor.includes('btnAnt.disabled = false'), 'Anterior siempre accesible');
  assert.ok(!visor.includes('data-mm-accion="ant" disabled'),'Anterior no arranca bloqueado');
  assert.ok(visor.includes('estado.pasoActual>0 ? estado.pasoActual-1 : pasos.length-1'), 'Anterior circula al final');
  assert.ok(visor.includes('irAPaso(estado.pasoActual>0 ? estado.pasoActual-1 : pasos.length-1, true)'),
    'Al retroceder vuelve a escuchar la narración');
});
test('Docentes humanos usan cámara de cuerpo completo y brazo elevado para señalar',()=>{
  const tutores=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'css/avatares-3d.css'),'utf8');
  assert.ok(tutores.includes('renderer.setSize(420,600)'),'lienzo vertical para figura entera');
  assert.ok(tutores.includes('p.realista?4.12'),'cámara cercana para mostrar al docente completo');
  assert.ok(tutores.includes('new T.Vector3(lado*0.62,(d.y>0?-0.48:0.12)+pulso*0.10,0.62)'),
    'el codo se dirige hacia arriba y al lado del sólido');
  assert.ok(tutores.includes('new T.Vector3(lado*0.84,(d.y>0?-0.08:0.23)+pulso*0.13,0.50)'),
    'la mano prolonga la señal');
  assert.ok(css.includes('overflow:visible!important'),'escenario sin máscara de tarjeta');
});

test('La publicación genera URLs de assets distintas para evitar CSS y JS antiguos',()=>{
  const build=fs.readFileSync(path.join(__dirname,'build.js'),'utf8');
  const headers=fs.readFileSync(path.join(__dirname,'_headers'),'utf8');
  assert.ok(build.includes('CF_PAGES_COMMIT_SHA'), 'versión derivada del commit publicado');
  assert.ok(build.includes("file.split('?')[0]"), 'limpia números de versión obsoletos');
  assert.ok(headers.includes('Cache-Control: no-store'), 'no almacenar HTML antiguo');
  assert.ok(headers.includes('/js/*'), 'revalidar Javascript');
  assert.ok(headers.includes('/css/*'), 'revalidar CSS');
});
test('Mirada baja hacia el sólido y hombros gesticulan al hablar',()=>{
  const s=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
  assert.ok(s.includes('girarMundo(huesosGuia.head,new T.Vector3(1,0,0)'), 'mirada usa eje vertical coherente con el mundo');
  assert.ok(s.includes('0.12*Math.sin(t*1.75)'), 'gesto de brazos perceptible');
  assert.ok(s.includes('visual.height = 600'), 'renderizado vertical real');
});

test('La pose comienza antes de que la voz neural esté lista',()=>{
  const tutor=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
  assert.ok(tutor.includes('inicioAtencion:performance.now()'),'paso activa gesto de inmediato');
  assert.ok(tutor.includes("estadoAudio.estado==='preparando'"),'el audio pendiente no bloquea brazos');
  assert.ok(tutor.includes("var guiando=!!vistaObjetivo && (hablando||preparando||inicio)"),
    'mirada y manos no esperan el MP3');
});

test('La mirada usa coordenadas globales y evita ejes locales retorcidos del FBX',()=>{
  const js=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
  assert.ok(js.includes('function girarMundo(hueso,eje,angulo)'));
  assert.ok(js.includes('eje.clone().applyQuaternion(qPadre.invert()).normalize()'));
  assert.ok(js.includes('girarMundo(huesosGuia.head,new T.Vector3(0,1,0)'));
  assert.ok(js.includes('girarMundo(huesosGuia.neck,new T.Vector3(1,0,0)'));
});

test('El prisma comienza limpio y revela su altura solamente en el cuarto paso',()=>{
  const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window});
  const p=window.Figuras.obtener('prisma-elementos');
  assert.equal(p.capas.find(c=>c.id==='altura').activa,false);
  assert.equal(p.vertices.H.capa,'altura');
  assert.equal(p.vertices.O.capa,'altura');
  assert.equal(p.vertices.O1.capa,'altura');
  assert.equal(p.pasosGuia.length,5);
  assert.ok(p.pasosGuia.slice(0,3).every(s=>!s.capasVisibles.includes('altura')));
  assert.ok(p.pasosGuia[3].capasVisibles.includes('altura'));
  assert.ok(!p.pasosGuia[4].capasVisibles.includes('altura'));
});
test('Capas auxiliares manuales y pedagógicas coherentes en los dos visores',()=>{
  const v=fs.readFileSync(path.join(__dirname,'js/visor.js'),'utf8');
  const v2=fs.readFileSync(path.join(__dirname,'js/visor2d.js'),'utf8');
  const v3=fs.readFileSync(path.join(__dirname,'js/visor3d.js'),'utf8');
  assert.ok(v.includes('function esCapaAuxiliar(c)'));
  assert.ok(v.includes("btnTodosAux.textContent='✦ Todos los trazos'"));
  assert.ok(v.includes('idsAuxiliares.forEach(function(id){estado.capasOcultas[id]=todos;})'));
  assert.ok(v.includes('if(esCapaAuxiliar(c))estado.capasOcultas[c.id]=c.id!==paso.capaResaltada'));
  assert.ok(v2.includes('if(v.capa && !activa(v.capa))return'));
  assert.ok(v3.includes("self._registrar(v.capa || 'etiquetas', sp)"));
});

test('El maestro parte de brazos relajados, no de la pose en T del rig',()=>{
  const js=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
  assert.ok(js.includes("['right','rightForearm','rightHand',-1]"));
  assert.ok(js.includes("['left','leftForearm','leftHand',1]"));
  assert.ok(js.includes('new T.Vector3(ladoReposo*0.17,-0.97,0.18)'));
  assert.ok(js.includes('new T.Vector3(lado*0.84,(d.y>0?-0.08:0.23)'));
});

test('Identidad visible: Profesor Xavier en todos los visores del aula',()=>{
  const {api}=tutores('profesor-realista');
  assert.equal(api.catalogo.find(c=>c.id==='profesor-realista').nombre,'Profesor Xavier');
  const visor=fs.readFileSync(path.join(__dirname,'js/visor.js'),'utf8');
  assert.ok(visor.includes('Explicación paso a paso con Profesor Xavier'));
  assert.ok(visor.includes('<strong class="mm-profesor-nombre">Profesor Xavier</strong>'));
});
test('En escritorio, avatar y explicación comparten una fila sin scroll interno',()=>{
  const visor=fs.readFileSync(path.join(__dirname,'js/visor.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'css/aula-premium.css'),'utf8');
  assert.ok(visor.includes("infoDocente.appendChild(filaPedagogica)"));
  assert.ok(visor.includes("infoDocente.appendChild(explicacionPedagogica)"));
  assert.ok(visor.includes("colMaestro.insertBefore(explicacionPedagogica,listaPedagogica)"),
    'el panel se restaura correctamente en móvil');
  assert.ok(css.includes('.figura-col-maestro.mm-distribucion-horizontal'));
  assert.ok(css.includes('overflow:hidden!important'));
  assert.ok(css.includes('bottom:0!important'),'sombra bajo los pies');
});
test('Prisma: demostrar paralelismo y perpendicularidad durante frases específicas',()=>{
  const win={};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window:win});
  const p=win.Figuras.obtener('prisma-elementos');
  const demos=p.pasosGuia[0].demostraciones;
  assert.equal(demos.length,2);
  assert.equal(demos[0].tipo,'paralelas');
  assert.equal(demos[1].tipo,'perpendiculares');
  for(const paso of p.pasosGuia.slice(0,3)){
    for(const d of paso.demostraciones||[]){
      assert.ok(paso.texto.toLowerCase().includes(d.frase.toLowerCase()),
        'la marca temporal debe existir en la narración');
    }
  }
  const visor=fs.readFileSync(path.join(__dirname,'js/visor.js'),'utf8');
  assert.ok(visor.includes('demoSesion=global.Avatar.hablarVoz'));
  assert.ok(visor.includes("'avatar-palabra'"),'sincronización nativa por palabras');
  assert.ok(visor.includes("'avatar-audio-elemento'"),'sincronización con audio neural');
  assert.ok(visor.includes("audio.addEventListener('timeupdate',seguirAudio)"));
  assert.ok(visor.includes("document.createElementNS('http://www.w3.org/2000/svg','svg')"));
  assert.ok(visor.includes("demoActiva==='perpendiculares'"));
});

test('La altura del prisma recto es OO₁ entre centros y perpendicular a ambas bases',()=>{
  const win={};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window:win});
  const fig=win.Figuras.obtener('prisma-elementos');
  const p=k=>Array.from(fig.vertices[k].p);
  const vec=(a,b)=>a.map((x,i)=>b[i]-x);
  const dot=(a,b)=>a.reduce((acc,x,i)=>acc+x*b[i],0);
  const norm=a=>Math.hypot(...a);
  const centroid=keys=>keys.reduce((acc,k)=>acc.map((x,i)=>x+p(k)[i]),[0,0,0]).map(x=>x/keys.length);
  const O=p('O'),O1=p('O1'),h=vec(O,O1);
  for(const [k,v] of [['O',centroid(['A','B','C','D'])],['O1',centroid(['A1','B1','C1','D1'])]]){
    assert.ok(p(k).every((x,i)=>Math.abs(x-v[i])<1e-10),k+' es centro de la base');
  }
  assert.ok(Math.abs(h[0])<1e-12&&Math.abs(h[2])<1e-12,'OO₁ es vertical');
  for(const keys of [['A','B','D'],['A1','B1','D1']]){
    assert.ok(Math.abs(dot(h,vec(p(keys[0]),p(keys[1]))))<1e-12,'altura perpendicular al primer lado');
    assert.ok(Math.abs(dot(h,vec(p(keys[0]),p(keys[2]))))<1e-12,'altura perpendicular al segundo lado');
  }
  assert.ok(Math.abs(norm(h)-norm(vec(p('A'),p('A1'))))<1e-12,'misma medida que una arista lateral');
  const alturas=fig.lineas.filter(l=>l.capa==='altura');
  assert.equal(alturas.length,3,'un segmento y dos marcas de 90 grados');
  assert.equal(Array.from(alturas[0].v).join(','),'O,O1');
  assert.ok(!alturas.some(l=>l.v && Array.from(l.v).includes('H')),'no conecta la altura con un punto oblicuo');
  for(const [i,origen] of [[1,O],[2,O1]]){
    const [x,y,z]=Array.from(alturas[i].pts,p=>Array.from(p));
    const u=vec(origen,x),v=vec(x,y),w=vec(y,z);
    assert.ok(Math.abs(dot(u,v))<1e-10,'escuadra '+i+' contiene ángulo recto');
    assert.ok(norm(u)>0&&norm(v)>0&&norm(w)>0,'escuadra con tamaño real');
  }
  assert.equal(fig.vertices.R0.etiqueta,'90°');
  assert.equal(fig.vertices.R1.etiqueta,'90°');
  assert.ok(fig.pasosGuia[3].texto.includes('noventa grados'));
});


test('Prismas regulares y de base irregular: geometría convexa y cálculo correcto',()=>{
  const w={};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window:w});
  for(const [id,n,regular] of [
    ['prisma-hexagonal',6,true],
    ['prisma-octagonal',8,true],
    ['prisma-irregular',6,false]
  ]){
    const p=w.Figuras.obtener(id);
    assert.ok(p,id+' existe');
    assert.equal(p.caras.length,n+2);
    assert.equal(p.aristas.length,3*n);
    assert.equal(p.parametros.lados,n);
    const lower=Array.from({length:n},(_,i)=>p.vertices['A'+(i+1)].p);
    const upper=Array.from({length:n},(_,i)=>p.vertices['B'+(i+1)].p);
    for(let i=0;i<n;i++){
      const a=Array.from(lower[i]),b=Array.from(upper[i]);
      assert.ok(Math.abs(b[0]-a[0])<1e-10&&Math.abs(b[2]-a[2])<1e-10);
      assert.ok(Math.abs(b[1]-a[1]-p.parametros.altura)<1e-10);
    }
    const sides=lower.map((a,i)=>{
      const b=lower[(i+1)%n];
      return Math.hypot(a[0]-b[0],a[2]-b[2]);
    });
    assert.equal(sides.every(l=>Math.abs(l-sides[0])<1e-9),regular,'regularidad esperada');
    // El área de Gauss comprueba que no se confundió el área de la base
    // con su perímetro y que el volumen utiliza altura perpendicular.
    const area=Math.abs(lower.reduce((sum,a,i)=>{
      const b=lower[(i+1)%n];
      return sum+a[0]*b[2]-b[0]*a[2];
    },0))/2;
    const per=sides.reduce((a,b)=>a+b,0);
    assert.ok(Math.abs(area-p.parametros.areaBase)<1e-9);
    assert.ok(Math.abs(per-p.parametros.perimetroBase)<1e-9);
    assert.ok(Math.abs(area*p.parametros.altura-p.parametros.volumen)<1e-9);
    assert.ok(Math.abs(per*p.parametros.altura-p.parametros.areaLateral)<1e-9);
    const cross=lower.map((a,i)=>{
      const b=lower[(i+1)%n],c=lower[(i+2)%n];
      return (b[0]-a[0])*(c[2]-b[2])-(b[2]-a[2])*(c[0]-b[0]);
    });
    assert.ok(cross.every(x=>x>0)||cross.every(x=>x<0),'la base no es cóncava');
    assert.equal(p.pasosGuia.length,3);
    assert.ok(p.pasosGuia.at(-1).formulas.some(f=>f.latex.includes('V=')));
  }
});

test('Área de un prisma oblicuo no reutiliza la fórmula exclusiva de prismas rectos',()=>{
  const w={};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window:w});
  const recto=w.Figuras.obtener('prisma-elementos');
  const oblicuo=w.Figuras.obtener('paralelepipedo-oblicuo');
  const F=recto.pasosGuia.at(-1).formulas;
  assert.ok(F.some(f=>f.latex.includes('P_b')&&f.latex.includes('h')));
  assert.ok(F.some(f=>f.latex.startsWith('V=')));
  assert.ok(F.some(f=>f.latex.startsWith('A_T=')));
  const G=oblicuo.pasosGuia.at(-1).formulas;
  assert.ok(G.some(f=>f.latex.startsWith('V=')));
  assert.ok(G.some(f=>f.latex.includes('sum')));
  assert.ok(!G.some(f=>f.latex.includes('P_b')),'sin fórmula lateral de prisma recto');
});

test('KaTeX renderiza las fórmulas académicas de cada tipo de prisma',()=>{
  const w={};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window:w});
  const katex=require('./vendor/katex.min.js');
  let total=0;
  ['prisma-elementos','paralelepipedo-oblicuo',
   'prisma-hexagonal','prisma-octagonal','prisma-irregular'].forEach(id=>{
    w.Figuras.obtener(id).pasosGuia.forEach(p=>{
      (p.formulas||[]).forEach(f=>{
        const result=katex.renderToString(f.latex,{throwOnError:true,output:'htmlAndMathml'});
        assert.ok(result.includes('katex-mathml'),id+' fórmula accesible');
        total++;
      });
    });
  });
  assert.ok(total>=18,'fórmulas suficientes para todas las variantes');
  const visor=fs.readFileSync(path.join(__dirname,'js/visor.js'),'utf8');
  const styles=fs.readFileSync(path.join(__dirname,'css/aula-premium.css'),'utf8');
  assert.ok(visor.includes("global.katex.render(f.latex,formula"));
  assert.ok(visor.includes("renderizarTarjetasFormula(paso.formulas)"));
  assert.ok(styles.includes('.mm-formula-tarjeta'));
  assert.ok(styles.includes('prefers-reduced-motion'));
});

test('El catálogo muestra ocho rutas individuales sin scroll horizontal de pestañas',()=>{
 const catalog=fs.readFileSync(path.join(__dirname,'solidos.html'),'utf8');
 const solid=fs.readFileSync(path.join(__dirname,'solido.html'),'utf8');
 const ui=fs.readFileSync(path.join(__dirname,'js/ui.js'),'utf8');
 const home=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
 for(const tipo of ['prisma','piramide','cilindro','cono','esfera','cubo','tetraedro','octaedro']){
  assert.ok(catalog.includes('href="solido.html?tipo='+tipo+'"'),tipo+' con ruta dedicada');
  assert.ok(solid.includes('value="'+tipo+'"'),tipo+' configurable');
 }
 assert.ok(home.includes('href="solidos.html"'));
 assert.ok(ui.includes('data-nav="solidos"'));
 assert.ok(solid.includes('id="z-stage"'));
 assert.ok(solid.includes('id="z-layers"'));
});

test('Prisma oblicuo: la altura es perpendicular, interior y más corta que la arista lateral',()=>{
  const w={};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/figuras.js'),'utf8'),{window:w});
  const p=w.Figuras.obtener('paralelepipedo-oblicuo');
  const v=k=>Array.from(p.vertices[k].p);
  const d=(a,b)=>b.map((x,i)=>x-a[i]);
  const dot=(a,b)=>a.reduce((acc,x,i)=>acc+x*b[i],0);
  const len=x=>Math.hypot(...x);
  const O=v('O'),H=v('H'),h=d(O,H),l=d(v('A'),v('A1'));
  assert.ok(Math.abs(h[0])<1e-10&&Math.abs(h[2])<1e-10);
  assert.ok(Math.abs(dot(h,d(v('A'),v('B'))))<1e-10);
  assert.ok(Math.abs(dot(h,d(v('A1'),v('B1'))))<1e-10);
  assert.ok(len(l)>len(h));
  const topXs=['A1','B1','C1','D1'].map(k=>v(k)[0]);
  assert.ok(H[0]>=Math.min(...topXs)&&H[0]<=Math.max(...topXs),
    'el extremo superior de la altura está dentro del rango del plano basal');
  const a=p.lineas.filter(l=>l.capa==='altura');
  assert.equal(a.length,3);
  assert.equal(Array.from(a[0].v).join(','),'O,H');
  assert.ok(p.pasosGuia[1].texto.includes('perpendicular'));
  assert.ok(p.pasosGuia[1].capasVisibles.includes('altura'));
});


test('Motor 3.0 mantiene fórmulas y poliedros 2D/3D consistentes',()=>{
 const w={};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/parametricas.js'),'utf8'),{window:w});
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/zenit-solids.js'),'utf8'),{window:w});
 for(const tipo of ['prisma','piramide','cilindro','cono','esfera','cubo','tetraedro','octaedro']){
  const m=w.ZSolidos.generar(tipo,{});
  assert.ok(m.spec&&m.guide.length>=3,tipo+' tiene lecciones');
  assert.equal(m.formulas.length,4,tipo+' muestra cuatro resultados');
  assert.ok(m.formulas.every(x=>Number.isFinite(x.value)&&x.value>0),tipo+' valores reales');
  assert.ok(m.formulas.some(x=>x.label==='Volumen'));
  assert.ok(m.spec.capas?.length>=1);
 }
 const prism=w.ZSolidos.generar('prisma',{lados:8,base:'irregular',angulo:60,a:4,b:3,h:5});
 assert.equal(prism.spec.caras.length,11);
 assert.equal(prism.spec.aristas.length,24);
 const vec=(id)=>prism.spec.vertices[id].p;
 const H=vec('H'),O1=vec('O1');
 assert.ok(Math.abs(H[0]-O1[0])<1e-10&&Math.abs(H[2]-O1[2])<1e-10);
 assert.ok(Math.abs(O1[1]-H[1]-5)<1e-10);
 assert.ok(Math.abs(prism.values.V-prism.values.Ab*5)<1e-10);
 assert.ok(prism.values.Al>0);
 const straight=w.ZSolidos.generar('prisma',{lados:8,base:'irregular',angulo:90,a:4,b:3,h:5});
 assert.ok(prism.values.Al>=straight.values.Al-1e-9);
 const poly=w.ZSolidos.generar('piramide',{lados:7,base:'irregular',desplazamiento:.5});
 assert.equal(poly.spec.caras.length,8);
 assert.ok(Math.abs(poly.values.V-poly.values.Ab*poly.params.h/3)<1e-10);
});
test('Modelos paramétricos accesibles desde tres modos y con KaTeX correcto',()=>{
 const html=fs.readFileSync(path.join(__dirname,'solido.html'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'js/zenit-workspace.js'),'utf8');
 const katex=require('./vendor/katex.min.js');
 const w={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/parametricas.js'),'utf8'),{window:w});
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/zenit-solids.js'),'utf8'),{window:w});
 let count=0;
 for(const tipo of Object.keys(w.ZSolidos.META)){
  for(const f of w.ZSolidos.generar(tipo,{}).formulas){
   assert.ok(katex.renderToString(f.latex,{throwOnError:true,output:'htmlAndMathml'}).includes('katex-mathml'));
   count++;
  }
 }
 assert.equal(count,32);
 assert.ok(app.includes('renderizar')===false||app.includes('writeMath'),'render matemático centralizado');
 assert.ok(app.includes('w.Cargador3D.cargar()'));
 assert.ok(app.includes('w.Visor2D.render('));
 assert.ok(app.includes('w.speechSynthesis.speak(u)'));
 assert.ok(app.includes('localStorage.setItem(key'));
 assert.ok(html.includes('role="tablist"'));
 assert.ok(html.includes('aria-controls="z-panel"'));
});
test('Las ocho familias tienen controles configurables específicos',()=>{
 const w={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/parametricas.js'),'utf8'),{window:w});
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/zenit-solids.js'),'utf8'),{window:w});
 const c=w.ZSolidos.CONTROLES;
 assert.ok(['lados','base','angulo','h'].every(k=>c.prisma.includes(k)));
 assert.ok(['lados','desplazamiento'].every(k=>c.piramide.includes(k)));
 assert.deepEqual(Array.from(c.cilindro),['r','h']);
 assert.deepEqual(Array.from(c.esfera),['r']);
 assert.deepEqual(Array.from(c.cubo),['arista']);
});
test('La compilación incluye portada, catálogo y laboratorios individuales',()=>{
 const build=fs.readFileSync(path.join(__dirname,'build.js'),'utf8');
 ['solidos.html','solido.html'].forEach(p=>assert.ok(build.includes("'"+p+"'")));
 const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
 assert.ok(html.includes('css/zenit-home.css'));
 const solid=fs.readFileSync(path.join(__dirname,'solido.html'),'utf8');
 assert.ok(solid.includes('css/zenit-workspace.css'));
 assert.ok(solid.includes('js/zenit-solids.js'));
 assert.ok(solid.includes('js/zenit-workspace.js'));
});

test('Todas las rutas de los ocho sólidos figuran en sitemap',()=>{
 const s=fs.readFileSync(path.join(__dirname,'sitemap.xml'),'utf8');
 const html=fs.readFileSync(path.join(__dirname,'solido.html'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'js/zenit-workspace.js'),'utf8');
 for(const tipo of ['prisma','piramide','cilindro','cono','esfera','cubo','tetraedro','octaedro']){
   assert.ok(s.includes('/solido.html?tipo='+tipo),tipo+' en sitemap');
 }
 assert.ok(html.includes('id="z-canonical"'));
 assert.ok(app.includes("canonical.href="));
});

test('Sección transversal del prisma es congruente a la base y opcional',()=>{
 const w={};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/parametricas.js'),'utf8'),{window:w});
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/zenit-solids.js'),'utf8'),{window:w});
 for(const angle of [45,70,90]){
  for(const n of [3,6,12]){
   const p=w.ZSolidos.generar('prisma',{lados:n,angulo:angle,nivel:.35,base:'irregular'});
   const first=p.spec.vertices.A0.p,sec=p.spec.vertices.S0.p,top=p.spec.vertices.B0.p;
   const t=.35;
   for(let k=0;k<3;k++)assert.ok(Math.abs(sec[k]-(first[k]+(top[k]-first[k])*t))<1e-10);
   const area=ids=>Math.abs(ids.reduce((s,id,i)=>{
    const a=p.spec.vertices[id].p,b=p.spec.vertices[ids[(i+1)%n]].p;
    return s+a[0]*b[2]-b[0]*a[2];
   },0)/2);
   assert.ok(Math.abs(area(Array.from({length:n},(_,i)=>'A'+i))-
     area(Array.from({length:n},(_,i)=>'S'+i)))<1e-9);
   assert.ok(p.spec.capas.find(x=>x.id==='corte').activa===false);
   assert.ok(p.guide.some(x=>x.focus==='corte'));
  }
 }
});

test('El sistema visual Zénit entrega ilustraciones con fuentes locales válidas',()=>{
 const fs=require('fs'),path=require('path');
 const assets=['hero-laboratorio','prisma','piramide','cilindro','cono','esfera','cubo','tetraedro','octaedro',
  'modo-aprender','modo-experimentar','modo-resolver',
  'prisma-bases','prisma-altura','prisma-oblicuo','prisma-seccion','prisma-volumen'];
 for(const name of assets){
  const p=path.join(__dirname,'assets','zenit',name+'.svg');
  assert.ok(fs.existsSync(p),'ilustración faltante '+name);
  const svg=fs.readFileSync(p,'utf8');
  assert.ok(svg.startsWith('<svg ')&&svg.includes('</svg>'),name+' SVG válido');
  assert.ok(svg.includes('aria-label='),name+' descripción');
 }
 const build=fs.readFileSync(path.join(__dirname,'build.js'),'utf8');
 assert.ok(build.includes("'assets'"),'la compilación copia el pack visual');
 const home=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
 const catalog=fs.readFileSync(path.join(__dirname,'solidos.html'),'utf8');
 const lab=fs.readFileSync(path.join(__dirname,'solido.html'),'utf8');
 assert.ok(home.includes('hero-laboratorio.svg'));
 assert.equal((catalog.match(/class="zenit-catalog-visual"/g)||[]).length,8);
 assert.equal((catalog.match(/src="assets\/zenit\/[^"]+\.svg"/g)||[]).length,8);
 assert.ok(lab.includes('id="z-family-art"'));
 assert.ok(lab.includes('id="z-concept-grid"'));
});
test('Profesor Xavier: el aula recupera figura completa y gestos de enfoque',()=>{
 const css=fs.readFileSync(path.join(__dirname,'css/zenit-workspace.css'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'js/zenit-workspace.js'),'utf8');
 const tutor=fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8');
 assert.ok(css.includes('min-height:325px'),'docente visible en escritorio');
 assert.ok(css.includes('height:222px'),'docente legible en móvil');
 assert.ok(css.includes('.z-professor-info'));
 assert.ok(app.includes("w.Tutores.enfocar({figura:$('z-panel')"));
 assert.ok(tutor.includes("giro = 0.24"),'vista inicial tres cuartos');
});

test('Hero generado con IA tiene versión WebP ligera en producción',()=>{
 const fs=require('fs'),path=require('path');
 const filename=path.join(__dirname,'assets/zenit/prisma-ai.webp');
 const buf=fs.readFileSync(filename);
 assert.equal(buf.toString('ascii',0,4),'RIFF');
 assert.equal(buf.toString('ascii',8,12),'WEBP');
 assert.ok(buf.length<20000,'imagen optimizada');
 const home=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
 assert.ok(home.includes('src="assets/zenit/prisma-ai.webp"'));
});
