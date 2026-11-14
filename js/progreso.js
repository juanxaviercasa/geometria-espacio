/* ============================================================
   progreso.js — avance guardado en el dispositivo (localStorage)
   Sin cuentas, sin servidor. Nunca borra datos del estudiante.
   ------------------------------------------------------------
   Estructura del registro (clave "geo3d.progreso.v1"):
   {
     version: 1,
     lecciones: {
       "m6l1": {
         estado: "hecho" | "en-curso",
         ejercicios: { "m6l1e1": { ok: true, intentos: 2, pistas: 1 } },
         retos:      { "m6l1r1": { revelado: 2, resuelto: true } },
         actualizado: 1690000000000
       }
     },
     ultima: { leccion: "m6l1", ts: 1690000000000 },
     puntos: 40
   }
   Las preferencias van aparte ("geo3d.prefs.v1") para que restablecer
   el avance no borre la configuración de accesibilidad.
   ============================================================ */
(function (global) {
  'use strict';

  var CLAVE = 'geo3d.progreso.v1';
  var CLAVE_PREF = 'geo3d.prefs.v1';

  function disponible() {
    try {
      var k = '__geo3d_probe__';
      global.localStorage.setItem(k, '1');
      global.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  var HAY_STORAGE = disponible();
  var memoria = null; // respaldo en memoria si el navegador bloquea el almacenamiento

  function vacio() {
    return { version: 1, lecciones: {}, ultima: null, puntos: 0 };
  }

  function normaliza(d) {
    if (!d || typeof d !== 'object') return vacio();
    if (!d.lecciones || typeof d.lecciones !== 'object') d.lecciones = {};
    if (!('puntos' in d) || typeof d.puntos !== 'number') d.puntos = 0;
    if (!('version' in d)) d.version = 1;
    return d;
  }

  function leer() {
    if (!HAY_STORAGE) return normaliza(memoria || vacio());
    try {
      var bruto = global.localStorage.getItem(CLAVE);
      if (!bruto) return vacio();
      return normaliza(JSON.parse(bruto));
    } catch (e) {
      // Registro ilegible: se conserva intacto y se trabaja en memoria
      // durante esta sesión para no destruir datos del estudiante.
      console.warn('[progreso] registro no legible, se conserva sin cambios.', e);
      return vacio();
    }
  }

  function guardar(d) {
    d.version = 1;
    memoria = d;
    if (!HAY_STORAGE) return false;
    try {
      global.localStorage.setItem(CLAVE, JSON.stringify(d));
      return true;
    } catch (e) {
      console.warn('[progreso] no se pudo guardar el avance.', e);
      return false;
    }
  }

  function estado(idLeccion) {
    var d = leer();
    var l = d.lecciones[idLeccion];
    return l ? l.estado : null;
  }

  function entrada(d, idLeccion) {
    if (!d.lecciones[idLeccion]) {
      d.lecciones[idLeccion] = {
        estado: 'en-curso',
        ejercicios: {},
        retos: {},
        actualizado: Date.now()
      };
    }
    return d.lecciones[idLeccion];
  }

  function marcarEnCurso(idLeccion) {
    var d = leer();
    var e = entrada(d, idLeccion);
    if (e.estado !== 'hecho') e.estado = 'en-curso';
    e.actualizado = Date.now();
    d.ultima = { leccion: idLeccion, ts: Date.now() };
    guardar(d);
    return d;
  }

  function marcarHecho(idLeccion) {
    var d = leer();
    var e = entrada(d, idLeccion);
    if (e.estado !== 'hecho') {
      e.estado = 'hecho';
      e.actualizado = Date.now();
    }
    d.ultima = { leccion: idLeccion, ts: Date.now() };
    guardar(d);
    return d;
  }

  function registrarEjercicio(idLeccion, idEjercicio, correcto, pistasUsadas, contabilizarIntento) {
    var d = leer();
    var e = entrada(d, idLeccion);
    var prev = e.ejercicios[idEjercicio] || { ok: false, intentos: 0, pistas: 0 };
    if (contabilizarIntento !== false) prev.intentos = (prev.intentos || 0) + 1;
    if (typeof pistasUsadas === 'number') prev.pistas = Math.max(prev.pistas || 0, pistasUsadas);
    if (correcto) prev.ok = true;
    e.ejercicios[idEjercicio] = prev;
    e.actualizado = Date.now();
    d.ultima = { leccion: idLeccion, ts: Date.now() };
    recalculaPuntos(d);
    guardar(d);
    return d;
  }

  function registrarReto(idLeccion, idReto, revelado, resuelto) {
    var d = leer();
    var e = entrada(d, idLeccion);
    var prev = e.retos[idReto] || { revelado: 0, resuelto: false };
    if (typeof revelado === 'number') prev.revelado = Math.max(prev.revelado || 0, revelado);
    if (resuelto) prev.resuelto = true;
    e.retos[idReto] = prev;
    e.actualizado = Date.now();
    recalculaPuntos(d);
    guardar(d);
    return d;
  }

  function recalculaPuntos(d) {
    var total = 0;
    Object.keys(d.lecciones).forEach(function (k) {
      var l = d.lecciones[k];
      Object.keys(l.ejercicios || {}).forEach(function (ej) {
        if (l.ejercicios[ej].ok) total += 10;
      });
      Object.keys(l.retos || {}).forEach(function (r) {
        if (l.retos[r].resuelto) total += 25;
      });
      if (l.estado === 'hecho') total += 15;
    });
    d.puntos = total;
  }

  function ultima() {
    var d = leer();
    return d.ultima || null;
  }

  function puntos() {
    return leer().puntos || 0;
  }

  function resumenLeccion(idLeccion) {
    var d = leer();
    return d.lecciones[idLeccion] || null;
  }

  function cuentaEjercicios(idLeccion) {
    var l = resumenLeccion(idLeccion);
    if (!l) return { hechos: 0, intentados: 0 };
    var ejs = l.ejercicios || {};
    var ids = Object.keys(ejs);
    return {
      hechos: ids.filter(function (k) { return ejs[k].ok; }).length,
      intentados: ids.length
    };
  }

  /* -------- preferencias -------- */
  function leerPrefs() {
    var base = { movimientoReducido: null, vistaPreferida: '3d' };
    if (!HAY_STORAGE) return base;
    try {
      var bruto = global.localStorage.getItem(CLAVE_PREF);
      if (!bruto) return base;
      var p = JSON.parse(bruto);
      return Object.assign(base, p || {});
    } catch (e) {
      return base;
    }
  }

  function guardarPrefs(p) {
    if (!HAY_STORAGE) return false;
    try {
      global.localStorage.setItem(CLAVE_PREF, JSON.stringify(p));
      return true;
    } catch (e) {
      return false;
    }
  }

  function prefiereMovimientoReducido() {
    var p = leerPrefs();
    if (p.movimientoReducido === true) return true;
    if (p.movimientoReducido === false) return false;
    return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function definirMovimientoReducido(valor) {
    var p = leerPrefs();
    p.movimientoReducido = !!valor;
    guardarPrefs(p);
    aplicarMovimiento();
    return p.movimientoReducido;
  }

  function aplicarMovimiento() {
    if (!global.document) return;
    var reducido = prefiereMovimientoReducido();
    global.document.body.classList.toggle('movimiento-reducido', reducido);
    var boton = global.document.getElementById('btn-movimiento');
    if (boton) {
      boton.setAttribute('aria-pressed', reducido ? 'true' : 'false');
      var et = boton.querySelector('[data-etiqueta]');
      if (et) et.textContent = reducido ? 'Movimiento reducido' : 'Animaciones';
    }
  }

  /* -------- exportar / importar (respaldo sin destruir) -------- */
  function exportar() {
    return JSON.stringify({ progreso: leer(), preferencias: leerPrefs() }, null, 2);
  }

  global.Progreso = {
    HAY_STORAGE: HAY_STORAGE,
    leer: leer,
    estado: estado,
    marcarEnCurso: marcarEnCurso,
    marcarHecho: marcarHecho,
    registrarEjercicio: registrarEjercicio,
    registrarReto: registrarReto,
    ultima: ultima,
    puntos: puntos,
    resumenLeccion: resumenLeccion,
    cuentaEjercicios: cuentaEjercicios,
    leerPrefs: leerPrefs,
    prefiereMovimientoReducido: prefiereMovimientoReducido,
    definirMovimientoReducido: definirMovimientoReducido,
    aplicarMovimiento: aplicarMovimiento,
    exportar: exportar
  };
})(window);
