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


  /* Cabecera y pie compartidos: todas las páginas usan la misma navegación. */
  function montarEstructura() {
    var cabecera = document.querySelector('.sitio-head');
    if (cabecera) {
      cabecera.innerHTML =
        '<div class="wrap sitio-head-inner">' +
          '<a class="marca" href="index.html" aria-label="Geometría del espacio, ir al inicio">' +
            '<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="logo-geo" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4338ca"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect width="40" height="40" rx="12" fill="url(#logo-geo)"/><path d="M20 7 32 14v13L20 34 8 27V14Z M20 20l12-6M20 20 8 14M20 20v14" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="20" r="2.6" fill="#f4c76b"/></svg>' +
            '<span><small>SISTEMA ZÉNIT · LABORATORIO</small><b>Geometría del espacio</b></span></a>' +
          '<button type="button" class="nav-toggle" aria-controls="nav-geo" aria-expanded="false" aria-label="Abrir menú de navegación"><span aria-hidden="true">☰</span><span>Menú</span></button>' +
          '<nav class="nav-principal" id="nav-geo" aria-label="Navegación principal">' +
            '<a href="index.html" data-nav="inicio">Inicio</a>' +
            '<a href="solidos.html" data-nav="solidos">Sólidos 3D</a>' +
            '<a href="index.html#ruta" data-nav="modulos">Lecciones</a>' +
            '<a href="practica.html" data-nav="practica">Práctica</a>' +
            '<a href="acerca.html" data-nav="acerca">Cómo aprender</a>' +
          '</nav>' +
          '<a class="insignia-progreso" href="index.html#ruta"><span class="anillo" id="anillo-progreso" style="--p:0"><span>0%</span></span><span data-progreso-texto>0/17 lecciones</span></a>' +
          '<button type="button" class="btn-movimiento" id="btn-movimiento" aria-pressed="false" title="Activar o desactivar animaciones"><span aria-hidden="true">◉</span><span data-etiqueta>Animaciones</span></button>' +
        '</div>';
      var toggle = cabecera.querySelector('.nav-toggle');
      var nav = cabecera.querySelector('.nav-principal');
      function setMenuOpen(abierto) {
        toggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        toggle.setAttribute('aria-label', abierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
        nav.classList.toggle('nav-abierta', abierto);
      }
      toggle.addEventListener('click', function () {
        setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
      });
      nav.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() { setMenuOpen(false); });
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          setMenuOpen(false);
          toggle.focus();
        }
      });
      document.addEventListener('click', function(e) {
        if (toggle.getAttribute('aria-expanded') === 'true' &&
            !nav.contains(e.target) && !toggle.contains(e.target)) {
          setMenuOpen(false);
        }
      });
    }
    var pie = document.querySelector('.sitio-pie');
    if (pie) pie.innerHTML =
      '<div class="wrap pie-grid">' +
        '<div class="pie-identidad"><p class="pie-marca">Geometría del espacio <span>· Piensa en 3D</span></p><p>Aprende a ver, razonar y resolver problemas del espacio con una ruta guiada y modelos interactivos.</p></div>' +
        '<div><h2>Aprender</h2><a href="solidos.html">Catálogo 3D</a><a href="index.html#ruta">Ruta de módulos</a><a href="laboratorio.html?modelo=seccion">Cortes avanzados</a><a href="practica.html">Práctica y retos</a></div>' +
        '<div><h2>Tu experiencia</h2><a href="acerca.html">Método de estudio</a><a href="acerca.html#datos">Gestionar mi progreso</a><a href="leccion.html?id=m12l1">Simulacro tipo UNI</a></div>' +
        '<div class="legal"><span>© <span id="anio">2026</span> Geometría del espacio · Sistema Zénit</span><span>Tu progreso se conserva en este dispositivo · Sin registro</span></div>' +
      '</div>';
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
      if (a.getAttribute('data-nav') === pag || (pag === 'leccion' && a.getAttribute('data-nav') === 'inicio')) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------- arranque común ---------- */
  function iniciar(opciones) {
    opciones = opciones || {};
    montarEstructura();
    marcarNav();
    pintarCabecera();
    montarBotonMovimiento();
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
    montarAvatar: montarAvatar,
    pintarProgresoLeccion: pintarProgresoLeccion,
    iniciar: iniciar
  };})(window);
