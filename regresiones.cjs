const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
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

