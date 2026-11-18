/* ============================================================
   inicio.js — portada: ruta de módulos y continuidad
   ============================================================ */
(function () {
  'use strict';

  var P = window.Progreso;

  function iniciar() {
    var viejo=new URLSearchParams(window.location.search).get('solido');
    if(viejo){
      var destinos={prisma:'prisma','prisma-oblicuo':'prisma','prisma-hexagonal':'prisma','prisma-octagonal':'prisma','prisma-irregular':'prisma',piramide:'piramide',cilindro:'cilindro',cono:'cono',esfera:'esfera',cubo:'cubo',tetraedro:'tetraedro',octaedro:'octaedro'};
      if(destinos[viejo]){
        var qs=new URLSearchParams({tipo:destinos[viejo]});
        if(viejo==='prisma-oblicuo')qs.set('angulo','60');
        if(viejo==='prisma-hexagonal')qs.set('lados','6');
        if(viejo==='prisma-octagonal')qs.set('lados','8');
        if(viejo==='prisma-irregular'){qs.set('lados','6');qs.set('base','irregular');}
        window.location.replace('solido.html?'+qs.toString());
        return;
      }
    }
    pintarRuta();
    pintarContinuar();
    // La portada es un aula de sólidos, no un escaparate de personajes.
    UI.iniciar({avatar:false});
    // La portada presenta el catálogo: el visor solo se carga en cada laboratorio.
    document.getElementById('bloque-continuar').hidden = false;
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

      // Etiquetas de orientación sin bloquear módulos: toda la ruta sigue disponible.
      var categoria = m.numero<=4?'Fundamentos':m.numero<=6?'Construcción':m.numero<=10?'Exploración':'Reto de admisión';
      var recomendado = m.lecciones.indexOf(idActual)!==-1;
      var estadoModulo = prog.pct===100?'Completado':recomendado?'Tu siguiente paso':prog.hechas>0?'En progreso':'Disponible';
      var claseEstado = prog.pct===100?'hecho':recomendado?'siguiente':prog.hechas>0?'avance':'disponible';

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
        '<span class="zenit-modulo-main">' +
        '<span class="zenit-modulo-etiquetas"><span class="zenit-modulo-categoria">' + categoria + '</span><span class="zenit-modulo-estado ' + claseEstado + '">' + estadoModulo + '</span></span>' +
        '<span class="modulo-titulo" role="heading" aria-level="3">' + m.titulo + '</span>' +
        '<span class="modulo-desc">' + m.desc + '</span>' +
        '</span>' +
        '<span class="modulo-meta">' +
        '<span class="meta-texto">' + prog.hechas + '/' + prog.total + '</span>' +
        '<span class="barra' + (prog.pct === 100 ? ' verde' : '') + '"><i style="width:' + prog.pct + '%"></i></span>' +
        '<svg class="chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6l5 5 5-5"/></svg>' +
        '</span>' +
        '</button>' +
        '<div class="modulo-cuerpo" id="cuerpo-' + m.id + '" hidden>' + lecciones + '</div>' +
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
    if (!art) return;
    var btn = art.querySelector('.modulo-cabeza');
    var cuerpo = art.querySelector('.modulo-cuerpo');
    // Sincroniza estado visual, contenido y accesibilidad en cada interacción.
    // [hidden] evita que los enlaces del panel cerrado reciban el foco con Tab.
    if (cuerpo) cuerpo.hidden = !abrir;
    art.classList.toggle('abierto', abrir);
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
      texto = 'Empezar mi ruta';
      tit = 'Tu primer paso empieza aquí';
      detalleTxt = 'Comienza con puntos, rectas y planos: las ideas que te ayudarán a comprender todo lo demás.';
    } else if (glob.hechas >= glob.total) {
      destino = 'practica.html';
      texto = 'Ponerme a prueba';
      tit = '¡Completaste la ruta!';
      detalleTxt = 'Terminaste las ' + glob.total + ' lecciones. Refuerza lo aprendido con nuevos ejercicios y comprueba cuánto recuerdas.';
    } else {
      var ultimaLeccion = ultima ? Contenido.obtenerLeccion(ultima.leccion) : null;
      var mod = ultimaLeccion ? Contenido.moduloDeLeccion(ultima.leccion) : null;
      destino = pendiente ? 'leccion.html?id=' + pendiente.id : 'practica.html';
      texto = 'Seguir mi ruta';
      tit = 'Tu siguiente desafío: ' + (pendiente ? pendiente.leccion.titulo : 'práctica libre');
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
