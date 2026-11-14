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
