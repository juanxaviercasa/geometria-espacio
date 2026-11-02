/* ============================================================
   ui.js — elementos compartidos de la interfaz
   - anillo de progreso y datos de la cabecera
   - botón de movimiento reducido
   - avatar guía lateral
   - utilidades de formato
   ============================================================ */
(function (global) {
  'use strict';

  var P = global.Progreso;

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }

  function texto(s) {
    var d = document.createElement('div');
    d.innerHTML = s;
    return d.textContent || '';
  }

  /* ---------- cabecera: anillo + datos ---------- */
  function pintarCabecera() {
    var g = global.Contenido ? Contenido.progresoGlobal() : { pct: 0, hechas: 0, total: 0 };
    var anillo = document.getElementById('anillo-progreso');
    if (anillo) {
      anillo.style.setProperty('--p', g.pct);
      var num = anillo.querySelector('span');
      if (num) num.textContent = g.pct + '%';
      var cont = anillo.closest('.insignia-progreso');
      if (cont) {
        cont.setAttribute('aria-label', 'Progreso de la ruta: ' + g.pct + ' por ciento, ' + g.hechas + ' de ' + g.total + ' lecciones completadas');
        var et = cont.querySelector('[data-progreso-texto]');
        if (et) et.textContent = g.hechas + '/' + g.total + ' lecciones';
      }
    }
    document.querySelectorAll('[data-puntos]').forEach(function (n) {
      n.textContent = P.puntos();
    });
    document.querySelectorAll('[data-progreso-global]').forEach(function (n) {
      n.textContent = g.pct + '%';
    });
  }

  /* ---------- Modo Aula / TV (Pantalla Gigante de Proyección) ---------- */
  function esModoAulaTV() {
    try {
      return localStorage.getItem('geo3d.modoAulaTV') === 'true';
    } catch (e) {
      return false;
    }
  }

  function aplicarModoAulaTV(activo) {
    document.body.classList.toggle('modo-aula-tv', activo);
    var btns = document.querySelectorAll('#btn-modo-tv, .btn-modo-tv');
    btns.forEach(function (b) {
      b.setAttribute('aria-pressed', activo ? 'true' : 'false');
    });
    try {
      localStorage.setItem('geo3d.modoAulaTV', activo ? 'true' : 'false');
    } catch (e) {}
    document.dispatchEvent(new CustomEvent('modo-aula-tv-cambiado', {
      detail: { activo: activo }
    }));
    setTimeout(function () {
      window.dispatchEvent(new Event('resize'));
    }, 60);
  }

  function alternarModoAulaTV() {
    var actual = document.body.classList.contains('modo-aula-tv');
    aplicarModoAulaTV(!actual);
  }

  function montarModoAulaTV() {
    var activo = esModoAulaTV();
    aplicarModoAulaTV(activo);
    var btns = document.querySelectorAll('#btn-modo-tv, .btn-modo-tv');
    btns.forEach(function (b) {
      b.addEventListener('click', alternarModoAulaTV);
    });
    window.addEventListener('keydown', function (e) {
      if ((e.key === 't' || e.key === 'T') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        alternarModoAulaTV();
      }
    });
  }

  /* ---------- movimiento reducido ---------- */
  function montarBotonMovimiento() {
    var btn = document.getElementById('btn-movimiento');
    if (!btn) return;
    btn.setAttribute('aria-pressed', P.prefiereMovimientoReducido() ? 'true' : 'false');
    btn.addEventListener('click', function () {
      var activo = btn.getAttribute('aria-pressed') === 'true';
      P.definirMovimientoReducido(!activo);
      document.dispatchEvent(new CustomEvent('movimiento-cambiado', {
        detail: { reducido: !activo }
      }));
    });
    P.aplicarMovimiento();
  }

  /* ---------- avatar ---------- */
  function montarAvatar(opciones) {
    var cont = document.getElementById('avatar-guia');
    if (!cont || !global.Avatar) return null;
    var caja = global.Avatar.crear(opciones || {
      estado: 'senala',
      mensaje: global.Avatar.MENSAJES.bienvenida
    });
    cont.innerHTML = '';
    cont.appendChild(caja.nodo);
    // Instancia accesible desde el resto de la página
    global.AvatarGuia = caja;
    return caja;
  }

  /* ---------- barra de progreso de lección ---------- */
  function pintarProgresoLeccion(idLeccion, totalEj, totalRetos) {
    var c = P.cuentaEjercicios(idLeccion);
    var resumen = P.resumenLeccion(idLeccion) || { retos: {}, ejercicios: {} };
    var retosHechos = Object.keys(resumen.retos || {}).filter(function (k) {
      return resumen.retos[k].resuelto;
    }).length;

    var cont = document.getElementById('avance-leccion');
    if (!cont) return;
    var items = [
      { n: c.hechos, de: totalEj, txt: 'ejercicios' },
      { n: retosHechos, de: totalRetos, txt: 'retos' }
    ];
    var html = items.map(function (it) {
      var pct = it.de ? Math.round((it.n / it.de) * 100) : 0;
      return '<div class="fila-progreso">' +
        '<span class="meta-texto">' + it.n + '/' + it.de + ' ' + it.txt + '</span>' +
        '<div class="barra' + (pct === 100 ? ' verde' : '') + '"><i style="width:' + pct + '%"></i></div>' +
        '</div>';
    }).join('');
    cont.innerHTML = html;
  }

  /* ---------- navegación activa ---------- */
  function marcarNav() {
    var pag = document.body.getAttribute('data-pagina');
    if (!pag) return;
    document.querySelectorAll('.nav-principal a').forEach(function (a) {
      if (a.getAttribute('data-nav') === pag) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------- arranque común ---------- */
  function iniciar(opciones) {
    opciones = opciones || {};
    marcarNav();
    pintarCabecera();
    montarBotonMovimiento();
    montarModoAulaTV();
    if (opciones.avatar !== false) montarAvatar(opciones.avatar);
    var anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();
    document.addEventListener('movimiento-cambiado', function () {
      pintarCabecera();
    });
  }

  global.UI = {
    el: el,
    texto: texto,
    pintarCabecera: pintarCabecera,
    montarBotonMovimiento: montarBotonMovimiento,
    montarModoAulaTV: montarModoAulaTV,
    alternarModoAulaTV: alternarModoAulaTV,
    aplicarModoAulaTV: aplicarModoAulaTV,
    esModoAulaTV: esModoAulaTV,
    montarAvatar: montarAvatar,
    pintarProgresoLeccion: pintarProgresoLeccion,
    iniciar: iniciar
  };})(window);
