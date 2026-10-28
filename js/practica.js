/* ============================================================
   practica.js — banco de práctica y retos
   ============================================================ */
(function () {
  'use strict';

  var P = window.Progreso;
  var filtro = 'todos';

  function iniciar() {
    pintarFiltros();
    pintarBanco();
    pintarRetos();
    UI.iniciar({
      avatar: {
        estado: 'piensa',
        mensaje: Avatar.MENSAJES.practica
      }
    });
    montarAvatarMensaje();
    actualizarMarcador();
  }

  /* ---------- personaje reactivo ----------
     Vértiz se desplaza por su escenario: se aparta al pensar, se acerca
     al celebrar. El bocadillo explica; nunca tapa un ejercicio. */
  function montarAvatarMensaje() {
    var guia = window.AvatarGuia;
    var mapa = {
      acierto: { estado: 'celebra', msg: Avatar.MENSAJES.acierto },
      fallo: { estado: 'anima', msg: Avatar.MENSAJES.fallo },
      pista: { estado: 'piensa', msg: Avatar.MENSAJES.pista },
      reto: { estado: 'senala', msg: Avatar.MENSAJES.reto }
    };

    window.AvatarMensaje = function (tipo) {
      var m = mapa[tipo];
      if (!m || !guia) return;
      if (tipo === 'acierto' && guia.celebracion) {
        guia.setMensaje(m.msg);
        guia.celebracion();
        return;
      }
      if (guia.caminaA) {
        // Camina hasta su postura y termina en el gesto del mensaje
        guia.caminaA(tipo === 'fallo' ? 'der' : 'izq', m.msg, m.estado, 3400);
        return;
      }
      guia.setEstado(m.estado);
      guia.setMensaje(m.msg);
    };

    /* Botón «Otro consejo»: recorre el banco de consejos */
    var T = Avatar.TIPS || {};
    var consejos = ['inicio', 'puntos', 'posiciones', 'paralelismo', 'perpendicularidad',
      'angulos', 'proyecciones', 'triedro', 'prismas', 'piramides', 'redondos',
      'regulares', 'secciones', 'integrador']
      .map(function (k) { return T[k]; }).filter(Boolean);
    var i = 0;
    var caja = document.querySelector('#avatar-guia .avatar-caja');
    if (caja && consejos.length) {
      caja.addEventListener('avatar-otro', function () {
        i = (i + 1) % consejos.length;
        if (!guia) return;
        guia.caminaA(i % 3 === 0 ? 'centro' : i % 3 === 1 ? 'izq' : 'der', consejos[i], 'habla', 2600);
      });
    }
  }

  function pintarFiltros() {
    var cont = document.getElementById('filtros');
    var opciones = [{ id: 'todos', nombre: 'Todos' }].concat(
      Contenido.MODULOS.map(function (m) {
        return { id: m.id, nombre: m.numero + '. ' + m.titulo };
      })
    );
    cont.innerHTML = opciones.map(function (o) {
      return '<button type="button" class="chip" data-filtro="' + o.id + '" aria-pressed="' +
        (o.id === filtro ? 'true' : 'false') + '">' + o.nombre + '</button>';
    }).join('');

    cont.querySelectorAll('[data-filtro]').forEach(function (b) {
      b.addEventListener('click', function () {
        filtro = b.getAttribute('data-filtro');
        cont.querySelectorAll('[data-filtro]').forEach(function (x) {
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        pintarBanco();
      });
    });
  }

  function pintarBanco() {
    var banco = Contenido.bancoPractica();
    if (filtro !== 'todos') {
      banco = banco.filter(function (e) { return e.modulo === filtro; });
    }
    var cont = document.getElementById('banco');

    if (!banco.length) {
      cont.innerHTML = '<p class="vacio-aviso">No hay ejercicios en este módulo.</p>';
      return;
    }

    var modTitulo = filtro === 'todos' ? null : Contenido.MODULOS.filter(function (m) {
      return m.id === filtro;
    })[0];

    cont.innerHTML = '<h2 style="margin-bottom:.3rem">' +
      (modTitulo ? 'Módulo ' + modTitulo.numero + ': ' + modTitulo.titulo : 'Todos los ejercicios') +
      '</h2>' +
      '<p style="font-size:.9rem;color:var(--ink-3);margin:0 0 1rem">' +
      banco.length + ' ejercicio' + (banco.length === 1 ? '' : 's') +
      ' · Las respuestas se comparan con tolerancia numérica y admiten fracciones.</p>';

    var contenedor = document.createElement('div');
    cont.appendChild(contenedor);
    banco.forEach(function (e, i) {
      contenedor.appendChild(Actividades.crearEjercicio(e, i, e.leccionId, actualizarMarcador, {
        mostrarModulo: e.moduloNum,
        tituloLeccion: e.leccionTitulo
      }));
    });
  }

  function pintarRetos() {
    var retos = Contenido.bancoRetos();
    var cont = document.getElementById('banco-retos');
    if (!retos.length) {
      cont.innerHTML = '<p class="vacio-aviso">Todavía no hay retos disponibles.</p>';
      return;
    }
    retos.forEach(function (r, i) {
      cont.appendChild(Actividades.crearReto(r, i, r.leccionId, actualizarMarcador, {
        mostrarModulo: r.moduloNum,
        tituloLeccion: r.leccionTitulo
      }));
    });
  }

  function actualizarMarcador() {
    var banco = Contenido.bancoPractica();
    var resueltos = 0, intentados = 0;
    banco.forEach(function (e) {
      var reg = (P.resumenLeccion(e.leccionId) || { ejercicios: {} }).ejercicios[e.id];
      if (reg) {
        intentados++;
        if (reg.ok) resueltos++;
      }
    });
    var a = document.getElementById('marcador-resueltos');
    var b = document.getElementById('marcador-intentados');
    if (a) a.textContent = resueltos;
    if (b) b.textContent = intentados;
    UI.pintarCabecera();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
