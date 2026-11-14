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
    setTimeout(fn, ms) { timers.push({fn,ms}); return timers.length; }, clearTimeout() {} };
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
  old.onend(); assert.equal(v.events.filter(e=>e.type==='avatar-hablando').at(-1).detail.activo,true);
  v.spoken[1].onend(); assert.equal(v.events.at(-1).detail.activo,false);
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
function tutores(guardado) {
  const datos={'geo3d.tutor.v1':guardado},window={};
  const document={currentScript:{src:'http://localhost/js/tutores.js'},addEventListener(){},querySelectorAll(){return[];},dispatchEvent(){}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'js/tutores.js'),'utf8'),{window,document,URL,localStorage:{getItem:k=>datos[k],setItem:(k,v)=>{datos[k]=v;}},CustomEvent:function(){}});
  return {api:window.Tutores,datos};
}
test('preferencia desconocida usa el dragón y rechaza opciones inválidas',()=>{
  const {api}=tutores('desconocido');assert.equal(api.actual(),'dragon');
  assert.equal(api.elegir('inexistente'),false);assert.equal(api.actual(),'dragon');
});
test('elegir Pokémon recuerda el tutor y proporciona una voz humana diferenciada',()=>{
  const {api,datos}=tutores('vertiz');
  assert.equal(api.elegir('pikachu'),true);assert.equal(datos['geo3d.tutor.v1'],'pikachu');
  assert.ok(api.perfilVoz().pitch>1);assert.ok(api.perfilVoz().rate<=1.1);
});
test('los recursos del dragón y Pokémon están incluidos localmente',()=>{
  const {api}=tutores('dragon');
  assert.equal(api.catalogo.filter(p=>p.tipo==='3D').length,9);
  api.catalogo.filter(p=>p.pokemon).forEach(p=>['gif','png'].forEach(ext=>assert.ok(fs.statSync(path.join(__dirname,'vendor/pokemon-'+p.pokemon+'.'+ext)).size>0)));
  const glb=fs.readFileSync(path.join(__dirname,'vendor/tutor-dragon.glb'));
  assert.equal(glb.readUInt32LE(0),0x46546c67);
  const data=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)));
  assert.ok(data.skins.length>0);assert.ok(data.animations.some(a=>/flying/i.test(a.name)));
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
  assert.equal(P.puntos(), 35);
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
