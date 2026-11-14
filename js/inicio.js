/* ============================================================
   inicio.js — portada: ruta de módulos y continuidad
   ============================================================ */
(function () {
  'use strict';

  var P = window.Progreso;

  function iniciar() {
    pintarDatosHero();
    pintarRuta();
    pintarContinuar();
    UI.iniciar({
      avatar: {
        estado: 'camina',
        mensaje: Avatar.MENSAJES.inicio
      }
    });
    montarConsejosPortada();
    montarHero3D();
    document.getElementById('bloque-continuar').hidden = false;
  }

  function montarHero3D() {
    var cont = document.getElementById('hero-figura-contenedor');
    if (!cont || !window.Visor) return;
    try {
      cont.innerHTML = '';
      window.Visor.montar(cont, 'prisma-diagonales', { modoHero: true, sinAviso: true });
    } catch (e) {
      console.warn('Error al montar figura hero 3D:', e);
    }
  }

  /* El botón «Otro consejo» recorre los consejos y hace caminar a Vértiz */
  function montarConsejosPortada() {
    var guia = window.AvatarGuia;
    var T = Avatar.TIPS || {};
    var consejos = ['inicio', 'puntos', 'posiciones', 'paralelismo', 'perpendicularidad',
      'angulos', 'proyecciones', 'triedro', 'prismas', 'piramides', 'redondos',
      'regulares', 'secciones', 'integrador']
      .map(function (k) { return T[k]; }).filter(Boolean);
    var i = 0;
    var caja = document.querySelector('#avatar-guia .avatar-caja');
    if (!caja || !consejos.length) return;
    caja.addEventListener('avatar-otro', function () {
      i = (i + 1) % consejos.length;
      if (!guia) return;
      guia.caminaA(i % 3 === 0 ? 'centro' : i % 3 === 1 ? 'izq' : 'der', consejos[i], 'habla', 2600);
    });
  }

  function pintarDatosHero() {
    var ej = document.getElementById('dato-ejercicios');
    var re = document.getElementById('dato-retos');
    if (ej) ej.textContent = Contenido.totalEjercicios();
    if (re) re.textContent = Contenido.totalRetos();
  }

  function etiquetaEstado(est) {
    if (est === 'hecho') return 'Completada';
    if (est === 'en-curso') return 'En curso';
    return 'Sin empezar';
  }

  function pintarRuta() {
    var cont = document.getElementById('lista-modulos');
    var actual = Contenido.siguientePendiente();
    var idActual = actual ? actual.id : null;

    cont.innerHTML = Contenido.MODULOS.map(function (m) {
      var prog = Contenido.progresoModulo(m);
      var clases = ['modulo'];
      if (prog.pct === 100) clases.push('completo');
      if (m.lecciones.indexOf(idActual) !== -1) clases.push('actual');

      var lecciones = m.lecciones.map(function (id) {
        var l = Contenido.obtenerLeccion(id);
        if (!l) return '';
        var est = P.estado(id) || null;
        var c = P.cuentaEjercicios(id);
        var res = P.resumenLeccion(id) || { retos: {} };
        var retosOk = Object.keys(res.retos || {}).filter(function (k) {
          return res.retos[k].resuelto;
        }).length;

        var marca = '<span class="estado' + (est === 'hecho' ? ' hecho' : est === 'en-curso' ? ' en-curso' : '') + '" aria-hidden="true">' +
          (est === 'hecho' ? '✓' : est === 'en-curso' ? '·' : '') + '</span>';

        return '<a class="leccion-fila" href="leccion.html?id=' + id + '">' +
          marca +
          '<div class="leccion-info">' +
          '<h4>' + l.titulo +
          (l.destacada ? '<span class="insignia-mini">Completa</span>' : '') + '</h4>' +
          '<p>' + l.resumen + '</p>' +
          '</div>' +
          '<span class="meta-texto" aria-label="' + etiquetaEstado(est) + '">' +
          (c.hechos + retosOk > 0 ? (c.hechos + retosOk) + ' resueltas' : l.duracion) +
          '</span>' +
          '</a>';
      }).join('');

      return '<article class="' + clases.join(' ') + '" id="mod-' + m.id + '">' +
        '<button type="button" class="modulo-cabeza" aria-expanded="false" aria-controls="cuerpo-' + m.id + '">' +
        '<span class="modulo-num" aria-hidden="true">' + m.numero + '</span>' +
        '<span>' +
        '<span class="modulo-titulo" role="heading" aria-level="3">' + m.titulo + '</span>' +
        '<span class="modulo-desc">' + m.desc + '</span>' +
        '</span>' +
        '<span class="modulo-meta">' +
        '<span class="meta-texto">' + prog.hechas + '/' + prog.total + '</span>' +
        '<span class="barra' + (prog.pct === 100 ? ' verde' : '') + '"><i style="width:' + prog.pct + '%"></i></span>' +
        '<svg class="chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6l5 5 5-5"/></svg>' +
        '</span>' +
        '</button>' +
        '<div class="modulo-cuerpo" id="cuerpo-' + m.id + '">' + lecciones + '</div>' +
        '</article>';
    }).join('');

    // Abre el módulo actual (o el primero) al cargar
    var abrir = document.querySelector('#mod-' + (idActual
      ? Contenido.moduloDeLeccion(idActual).id
      : 'm1'));
    if (abrir) alternar(abrir, true);

    cont.querySelectorAll('.modulo-cabeza').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var art = btn.closest('.modulo');
        alternar(art, !art.classList.contains('abierto'));
      });
    });
  }

  function alternar(art, abrir) {
    art.classList.toggle('abierto', abrir);
    var btn = art.querySelector('.modulo-cabeza');
    if (btn) btn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  }

  function pintarContinuar() {
    var ultima = P.ultima();
    var pendiente = Contenido.siguientePendiente();
    var glob = Contenido.progresoGlobal();

    var btnHero = document.getElementById('btn-continuar-hero');
    var txtHero = document.getElementById('texto-continuar');
    var btn = document.getElementById('btn-continuar');
    var titulo = document.getElementById('continuar-titulo');
    var detalle = document.getElementById('continuar-detalle');

    var destino;
    var texto;
    var detalleTxt;
    var tit;

    if (!ultima && glob.hechas === 0) {
      destino = pendiente ? 'leccion.html?id=' + pendiente.id : 'index.html#ruta';
      texto = 'Empezar la ruta';
      tit = 'Continúa donde lo dejaste';
      detalleTxt = 'Aún no has empezado. La ruta comienza con puntos, rectas y planos.';
    } else if (glob.hechas >= glob.total) {
      destino = 'practica.html';
      texto = 'Repasar con práctica';
      tit = 'Ruta completada';
      detalleTxt = 'Completaste las ' + glob.total + ' lecciones. Vuelve a los retos en una semana: lo que recuerdes sin mirar es lo que de verdad aprendiste.';
    } else {
      var ultimaLeccion = Contenido.obtenerLeccion(ultima.leccion);
      var mod = ultimaLeccion ? Contenido.moduloDeLeccion(ultima.leccion) : null;
      destino = pendiente ? 'leccion.html?id=' + pendiente.id : 'practica.html';
      texto = 'Continuar';
      tit = 'Retoma en: ' + (pendiente ? pendiente.leccion.titulo : 'práctica libre');
      detalleTxt = mod
        ? 'Módulo ' + mod.numero + ' · ' + glob.hechas + ' de ' + glob.total +
          ' lecciones completadas (' + glob.pct + ' %).'
        : glob.hechas + ' de ' + glob.total + ' lecciones completadas.';
    }

    if (btnHero) {
      btnHero.setAttribute('href', destino);
      if (txtHero) txtHero.textContent = texto;
    }
    if (btn) {
      btn.setAttribute('href', destino);
      btn.textContent = texto;
    }
    if (titulo) titulo.textContent = tit;
    if (detalle) detalle.textContent = detalleTxt;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
