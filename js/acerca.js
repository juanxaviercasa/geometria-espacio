/* ============================================================
   acerca.js — gestión transparente de los datos locales
   Esta página NUNCA borra ni modifica el progreso: solo lo
   lee y permite exportar una copia.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Progreso;

  function iniciar() {
    UI.iniciar({ avatar: false });
    pintarEstado();
    pintarResumen();
    rellenarSalida();

    document.getElementById('btn-exportar').addEventListener('click', descargar);
    document.getElementById('btn-copiar').addEventListener('click', copiar);
  }

  function pintarEstado() {
    var el = document.getElementById('estado-storage');
    if (!el) return;
    if (P.HAY_STORAGE) {
      el.innerHTML = '<span class="estado-si">Disponible</span> ' +
        'Tu navegador permite guardar el avance en este dispositivo. Las claves usadas son ' +
        '<code>geo3d.progreso.v1</code> y <code>geo3d.prefs.v1</code>.';
    } else {
      el.innerHTML = '<span class="estado-no">Bloqueado</span> ' +
        'El navegador está bloqueando el almacenamiento local (modo privado o política del ' +
        'dispositivo). Puedes estudiar con normalidad, pero el avance solo se conservará ' +
        'mientras la pestaña esté abierta.';
    }
  }

  function pintarResumen() {
    var el = document.getElementById('resumen-datos');
    if (!el) return;
    var g = Contenido.progresoGlobal();
    var d = P.leer();
    var nLecciones = Object.keys(d.lecciones || {}).length;
    var ejs = 0, retos = 0;
    Object.keys(d.lecciones || {}).forEach(function (k) {
      var l = d.lecciones[k];
      ejs += Object.keys(l.ejercicios || {}).length;
      retos += Object.keys(l.retos || {}).length;
    });
    el.innerHTML = '<strong>' + g.hechas + ' de ' + g.total + '</strong> lecciones completadas (' +
      g.pct + ' %) · <strong>' + nLecciones + '</strong> lecciones con actividad · ' +
      '<strong>' + ejs + '</strong> ejercicios registrados · <strong>' + retos +
      '</strong> retos iniciados · <strong>' + P.puntos() + '</strong> puntos.';
  }

  function rellenarSalida() {
    var ta = document.getElementById('salida-datos');
    if (ta) ta.value = P.exportar();
  }

  function descargar() {
    var texto = P.exportar();
    var blob = new Blob([texto], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var fecha = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = 'geometria-3d-progreso-' + fecha + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function copiar() {
    var ta = document.getElementById('salida-datos');
    var btn = document.getElementById('btn-copiar');
    if (!ta) return;
    var textoOriginal = btn.textContent;
    function aviso(msg) {
      btn.textContent = msg;
      setTimeout(function () { btn.textContent = textoOriginal; }, 2200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(function () {
        aviso('Copiado ✓');
      }).catch(function () {
        ta.select();
        aviso('Selecciona y copia con Ctrl+C');
      });
    } else {
      ta.select();
      aviso('Selecciona y copia con Ctrl+C');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
