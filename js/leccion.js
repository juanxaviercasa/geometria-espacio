/* ============================================================
   leccion.js — renderizador de lecciones
   ------------------------------------------------------------
   Convierte el contenido declarativo (bloques) en HTML
   accesible, monta las figuras y delega ejercicios y retos en
   actividades.js (compartido con practica.html).
   ============================================================ */
(function (global) {
  'use strict';

  var P = global.Progreso;

  function slug(s) {
    return 'sec-' + String(s || '')
      .toLowerCase()
      .replace(/[^\wáéíóúñ]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 46);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ---------- bloques de contenido ---------- */
  function bloqueHTML(b) {
    switch (b.tipo) {
      case 'subtitulo':
        return '<div class="bloque" id="' + slug(b.texto) + '"><h2>' + b.texto + '</h2></div>';

      case 'parrafo':
        return '<p class="parrafo"' + (b.indice ? ' id="' + slug(b.indice) + '"' : '') + '>' + b.texto + '</p>';

      case 'definicion':
        return '<div class="bloque def" id="' + slug(b.indice || b.titulo) + '">' +
          '<h3>' + b.titulo + '</h3>' + b.html + '</div>';

      case 'teorema':
        return '<div class="bloque teo" id="' + slug(b.indice || b.titulo) + '">' +
          '<h3>' + b.titulo + '</h3>' +
          '<div class="enunciado">' + b.enunciado + '</div>' +
          (b.justifica
            ? '<div class="justifica"><strong>Demostración / justificación</strong>' + b.justifica + '</div>'
            : '') +
          '</div>';

      case 'formulas':
        return '<div class="bloque fml" id="' + slug(b.indice || b.titulo) + '">' +
          '<p class="titulo">' + b.titulo + '</p><dl>' +
          b.items.map(function (i) {
            return '<div><dt>' + i.f + '</dt><dd>' + i.desc + '</dd></div>';
          }).join('') +
          '</dl></div>';

      case 'nota':
        var icono = b.variante === 'ojo' ? '!' : b.variante === 'dato' ? 'i' : '·';
        return '<div class="bloque nota ' + (b.variante || '') + '"' + (b.indice ? ' id="' + slug(b.indice) + '"' : '') + '>' +
          '<span class="icono-nota" aria-hidden="true">' + icono + '</span>' +
          '<div>' + b.html + '</div></div>';

      case 'ejemplo':
        return '<div class="bloque ejm" id="' + slug(b.indice || b.titulo) + '">' +
          '<div class="ejm-cabeza"><span class="et">Ejemplo resuelto</span><div>' +
          '<h3>' + b.titulo + '</h3><p>' + b.enunciado + '</p></div></div>' +
          '<div class="ejm-cuerpo"><ol class="ejm-pasos">' +
          b.pasos.map(function (p) {
            return '<li><span class="paso-titulo">' + p.titulo + '</span>' +
              (p.html ? '<p>' + p.html + '</p>' : '') +
              (p.cuenta ? '<code class="cuenta">' + esc(p.cuenta) + '</code>' : '') +
              '</li>';
          }).join('') +
          '</ol>' +
          (b.respuesta ? '<div class="ejm-respuesta">' + b.respuesta + '</div>' : '') +
          '</div></div>';

      case 'errores':
        return '<div class="bloque" id="' + slug(b.indice || 'Errores') + '">' +
          '<h3>' + (b.titulo || 'Errores frecuentes') + '</h3>' +
          '<div class="err-lista">' +
          b.items.map(function (e) {
            return '<div class="err">' +
              '<div class="mal"><span class="et">Error típico</span>' + e.mal + '</div>' +
              '<div class="bien"><span class="et">Forma correcta</span>' + e.bien + '</div>' +
              '<div class="porque"><strong>Por qué:</strong> ' + e.porque + '</div>' +
              '</div>';
          }).join('') +
          '</div></div>';

      case 'tabla':
        return '<div class="bloque" id="' + slug(b.indice || b.titulo) + '">' +
          '<h3>' + b.titulo + '</h3>' +
          '<div class="tabla-envoltura"><table class="datos">' +
          (b.caption ? '<caption>' + b.caption + '</caption>' : '') +
          '<thead><tr>' + b.columnas.map(function (c) {
            return '<th scope="col">' + c + '</th>';
          }).join('') + '</tr></thead><tbody>' +
          b.filas.map(function (f) {
            return '<tr>' + f.map(function (celda, i) {
              return i === 0
                ? '<th scope="row">' + celda + '</th>'
                : '<td>' + celda + '</td>';
            }).join('') + '</tr>';
          }).join('') +
          '</tbody></table></div></div>';

      default:
        return '';
    }
  }

  /* ---------- personaje reactivo ----------
     AvatarMensaje(tipo) lo llaman las actividades (acierto, fallo, pista).
     El personaje se desplaza y cambia de gesto, sin tapar nunca la figura. */
  function montarMensajeroAvatar(leccion) {
    var guia = global.AvatarGuia;
    var mapa = {
      acierto: { estado: 'celebra', msg: global.Avatar.MENSAJES.acierto },
      fallo: { estado: 'anima', msg: global.Avatar.MENSAJES.fallo },
      pista: { estado: 'piensa', msg: global.Avatar.MENSAJES.pista },
      reto: { estado: 'senala', msg: global.Avatar.MENSAJES.reto }
    };

    global.AvatarMensaje = function (tipo) {
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

    /* Botón «Otro consejo»: recorre los consejos del tema de la lección */
    var consejos = consejosDeLeccion(leccion);
    var i = 0;
    var caja = document.querySelector('#avatar-guia .avatar-caja');
    if (caja) {
      caja.addEventListener('avatar-otro', function () {
        i = (i + 1) % consejos.length;
        if (!guia) return;
        guia.caminaA(i % 3 === 0 ? 'centro' : i % 3 === 1 ? 'izq' : 'der', consejos[i], 'habla', 2600);
      });
    }
  }

  /* Consejos disponibles para esta lección, según sus títulos */
  function consejosDeLeccion(leccion) {
    var T = global.Avatar.TIPS || {};
    var texto = [leccion.titulo, leccion.resumen, leccion.objetivo]
      .join(' ').toLowerCase();
    var claves = [];
    var reglas = [
      ['prisma', 'prismas'], ['pirámide', 'piramides'], ['piramide', 'piramides'],
      ['cilindro', 'redondos'], ['cono', 'redondos'], ['esfera', 'redondos'],
      ['poliedro', 'regulares'], ['tetraedro', 'regulares'], ['octaedro', 'regulares'],
      ['sección', 'secciones'], ['seccion', 'secciones'], ['corte', 'secciones'],
      ['triedro', 'triedro'], ['diedro', 'triedro'],
      ['ángulo', 'angulos'], ['angulo', 'angulos'],
      ['proyección', 'proyecciones'], ['proyeccion', 'proyecciones'], ['distancia', 'proyecciones'],
      ['perpendicular', 'perpendicularidad'],
      ['paralel', 'paralelismo'],
      ['posición', 'posiciones'], ['posicion', 'posiciones'],
      ['punto', 'puntos'], ['recta', 'puntos'], ['plano', 'puntos']
    ];
    reglas.forEach(function (r) {
      if (texto.indexOf(r[0]) !== -1 && claves.indexOf(r[1]) === -1 && T[r[1]]) {
        claves.push(r[1]);
      }
    });
    var lista = claves.map(function (k) { return T[k]; });
    lista.push(T.integrador);
    lista.push(T.inicio);
    return lista.filter(Boolean);
  }

  /* El personaje comenta la sección visible mientras se lee */
  function seguirSecciones(leccion) {
    if (!('IntersectionObserver' in window) || !global.AvatarGuia) return;
    var guia = global.AvatarGuia;
    var T = global.Avatar.TIPS || {};
    var mapaSecciones = {
      'sec-practica': { pos: 'der', txt: 'Ahora tú. Escribe qué te piden antes de tocar la calculadora; si te trabas, pide pista.' },
      'sec-retos': { pos: 'der', txt: T.integrador || 'Antes de calcular: nombra los vértices y escribe qué te piden y qué te dan.' }
    };
    var nodos = Object.keys(mapaSecciones).map(function (id) {
      return document.getElementById(id);
    }).filter(Boolean);
    if (!nodos.length) return;

    var ultimo = null;
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting || e.target.id === ultimo) return;
        ultimo = e.target.id;
        var m = mapaSecciones[e.target.id];
        if (!m) return;
        if (guia.caminaA) guia.caminaA(m.pos, m.txt);
        else { guia.setMensaje(m.txt); }
      });
    }, { rootMargin: '-30% 0px -45% 0px' });
    nodos.forEach(function (n) { obs.observe(n); });
  }

  /* ---------- arranque ---------- */
  function iniciar() {
    var params = new URLSearchParams(location.search);
    // El identificador puede venir en la URL (?id=m6l1) o, como respaldo,
    // en el atributo data-leccion del body (útil para enlaces fijos y pruebas).
    var idLeccion = params.get('id') || document.body.getAttribute('data-leccion');
    var leccion = idLeccion ? Contenido.obtenerLeccion(idLeccion) : null;

    if (!leccion) {
      var sig = Contenido.siguientePendiente();
      if (sig && !idLeccion) {
        location.replace('leccion.html?id=' + sig.id);
        return;
      }
      document.getElementById('cuerpo-leccion').innerHTML =
        '<p class="vacio-aviso">No encontramos esa lección. Vuelve a la <a href="index.html#ruta">ruta de módulos</a> para elegir una.</p>';
      var cab0 = document.getElementById('cabecera-leccion');
      if (cab0) cab0.querySelector('h1').textContent = 'Lección no encontrada';
      return;
    }

    var modulo = Contenido.moduloDeLeccion(leccion.id);
    var vec = Contenido.vecinos(leccion.id);
    var ejercicios = leccion.ejercicios || [];
    var retos = leccion.retos || [];

    document.title = leccion.titulo + ' · Geometría del espacio';
    // Cada una de las 17 lecciones conserva su URL indexable específica.
    var canon=document.head.querySelector('link[rel="canonical"]');
    if(!canon){canon=document.createElement('link');canon.rel='canonical';document.head.appendChild(canon);}
    canon.href='https://geometriaespacio.sistemazenit.com/leccion.html?id='+encodeURIComponent(leccion.id);
    var desc=document.head.querySelector('meta[name="description"]');
    if(desc && leccion.objetivo)desc.setAttribute('content',(String(leccion.objetivo).replace(/<[^>]*>/g,' ').replace(/\\s+/g,' ').trim()+' · Geometría del espacio interactiva').slice(0,165));

    /* migas */
    document.getElementById('migas-leccion').innerHTML =
      '<a href="index.html">Ruta</a><span aria-hidden="true">/</span>' +
      '<a href="index.html#mod-' + modulo.id + '">Módulo ' + modulo.numero + ': ' + modulo.titulo + '</a>' +
      '<span aria-hidden="true">/</span><span>' + leccion.titulo + '</span>';

    /* cabecera */
    document.getElementById('cabecera-leccion').innerHTML =
      '<div class="etiquetas">' +
      '<span class="pildora mod">Módulo ' + modulo.numero + '</span>' +
      (leccion.destacada ? '<span class="pildora insignia">Lección completa</span>' : '') +
      '<span class="pildora">Lección ' + vec.posicion + ' de ' + vec.total + '</span>' +
      '<span class="pildora">' + leccion.duracion + '</span>' +
      '</div>' +
      '<h1>' + leccion.titulo + '</h1>' +
      '<p class="objetivo"><strong>Al terminar podrás:</strong> ' + leccion.objetivo + '</p>';

    /* cuerpo: bloques */
    var contenido = document.getElementById('cuerpo-leccion');
    var indice = [];

    var HTML = leccion.bloques.map(function (b) {
      if (b.tipo === 'figura') {
        var contId = 'fig-' + b.figura;
        indice.push({ id: contId, texto: b.titulo || 'Figura' });
        return '<div class="bloque-figura" id="' + contId + '" data-figura="' + b.figura + '"></div>';
      }
      if (b.indice) indice.push({ id: slug(b.indice), texto: b.indice });
      return bloqueHTML(b);
    }).join('');

    // Andamiaje formativo: qué afirmar, cómo verificar y dónde deja de aplicar.
    var notas = global.GuiaAcademica && global.GuiaAcademica.obtener(leccion.id);
    var secGuia = notas
      ? '<section class="guia-razonamiento" id="sec-ruta-razonamiento" aria-labelledby="titulo-ruta-razonamiento">' +
          '<div class="guia-razonamiento-cab"><span class="eyebrow">MÉTODO ZÉNIT</span>' +
          '<h2 id="titulo-ruta-razonamiento">Antes de resolver: tres preguntas esenciales</h2>' +
          '<p>Identifica las hipótesis, demuestra lo que afirmas y comprueba el alcance del resultado.</p></div>' +
          '<div class="guia-razonamiento-grid">' +
          '<div><span class="guia-orden">1 · Principio</span><p>' + esc(notas.principio) + '</p></div>' +
          '<div><span class="guia-orden">2 · Comprobación</span><p>' + esc(notas.verificacion) + '</p></div>' +
          '<div><span class="guia-orden">3 · Cuándo no aplicar</span><p>' + esc(notas.limite) + '</p></div>' +
          '</div></section>'
      : '';
    if (notas) indice.unshift({ id: 'sec-ruta-razonamiento', texto: 'Ruta de razonamiento' });
    contenido.innerHTML = '<div id="sec-inicio"></div>' + secGuia + HTML;

    /* figuras */
    contenido.querySelectorAll('[data-figura]').forEach(function (c) {
      try {
        global.Visor.montarFigura(c, c.getAttribute('data-figura'));
      } catch (e) {
        c.innerHTML = '<p class="vacio-aviso">No se pudo cargar esta figura. La explicación escrita sigue siendo completa.</p>';
        console.warn('[leccion] figura no disponible:', c.getAttribute('data-figura'), e);
      }
    });

    /* práctica */
    if (ejercicios.length) {
      indice.push({ id: 'sec-practica', texto: 'Práctica guiada' });
      var sec = document.createElement('section');
      sec.className = 'bloque';
      sec.id = 'sec-practica';
      sec.innerHTML = '<h2>Práctica guiada</h2>' +
        '<p class="parrafo" style="max-width:none">Cada ejercicio valida tu cálculo o tu elección. Si no sale, pide una pista: la primera orienta el planteamiento y la segunda da el paso intermedio. Si te equivocas, podrás intentar de nuevo sin que aparezca inmediatamente la solución. Consultarla se registra como ayuda.</p>';
      contenido.appendChild(sec);
      ejercicios.forEach(function (ej, i) {
        contenido.appendChild(
          Actividades.crearEjercicio(ej, i, leccion.id, actualizarAvance)
        );
      });
    }

    /* retos */
    if (retos.length) {
      indice.push({ id: 'sec-retos', texto: 'Retos nivel admisión' });
      var sec2 = document.createElement('section');
      sec2.className = 'bloque';
      sec2.id = 'sec-retos';
      sec2.innerHTML = '<h2>Retos de nivel admisión</h2>' +
        '<p class="parrafo" style="max-width:none">Primero intenta resolver sin ayuda. Puedes consultar la estrategia y después el desarrollo; ver el desarrollo completo impide registrar ese reto como resuelto de forma independiente.</p>';
      contenido.appendChild(sec2);
      retos.forEach(function (r, i) {
        contenido.appendChild(Actividades.crearReto(r, i, leccion.id, actualizarAvance));
      });
    }

    /* navegación entre lecciones */
    document.getElementById('nav-leccion').innerHTML =
      (vec.anterior
        ? '<a href="leccion.html?id=' + vec.anterior.id + '" class="anterior">' +
          '<span class="dir">← Anterior</span><span class="nom">' + vec.anterior.leccion.titulo + '</span></a>'
        : '<a class="anterior vacio" aria-hidden="true" tabindex="-1"></a>') +
      (vec.siguiente
        ? '<a href="leccion.html?id=' + vec.siguiente.id + '" class="siguiente">' +
          '<span class="dir">Siguiente →</span><span class="nom">' + vec.siguiente.leccion.titulo + '</span></a>'
        : '<a href="practica.html" class="siguiente">' +
          '<span class="dir">Fin de la ruta →</span><span class="nom">Practicar todos los ejercicios</span></a>');

    /* marcar como completada */
    var cerrar = document.getElementById('cerrar-leccion');
    cerrar.innerHTML =
      '<div><strong>¿Terminaste esta lección?</strong>' +
      '<p>Márcala como completada para que la ruta retome exactamente aquí la próxima vez.</p></div>' +
      '<button type="button" class="btn" data-accion="completar">Marcar como completada</button>';
    var btnCompletar = cerrar.querySelector('[data-accion="completar"]');
    function pintarCompletar() {
      if (P.estado(leccion.id) === 'hecho') {
        btnCompletar.textContent = 'Completada ✓';
        btnCompletar.disabled = true;
        btnCompletar.classList.add('suave');
      }
    }
    btnCompletar.addEventListener('click', function () {
      P.marcarHecho(leccion.id);
      pintarCompletar();
      UI.pintarCabecera();
      actualizarAvance();
      if (global.AvatarMensaje) global.AvatarMensaje('acierto');
    });

    /* índice lateral */
    var ul = document.getElementById('indice-leccion');
    ul.innerHTML = '<li><a href="#sec-inicio">Objetivo</a></li>' + indice.map(function (i) {
      return '<li><a href="#' + i.id + '">' + i.texto + '</a></li>';
    }).join('');

    if ('IntersectionObserver' in window) {
      var enlaces = Array.prototype.slice.call(ul.querySelectorAll('a'));
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          enlaces.forEach(function (a) {
            a.classList.toggle('activo', a.getAttribute('href') === '#' + e.target.id);
          });
        });
      }, { rootMargin: '-90px 0px -65% 0px' });
      ['sec-inicio'].concat(indice.map(function (i) { return i.id; })).forEach(function (id) {
        var t = document.getElementById(id);
        if (t) obs.observe(t);
      });
    }

    /* avance */
    function actualizarAvance() {
      UI.pintarProgresoLeccion(leccion.id, ejercicios.length, retos.length);
      UI.pintarCabecera();

      var total = ejercicios.length + retos.length;
      var c = P.cuentaEjercicios(leccion.id);
      var res = P.resumenLeccion(leccion.id) || { retos: {} };
      var retosOk = Object.keys(res.retos || {}).filter(function (k) {
        return res.retos[k].resuelto;
      }).length;
      var hechos = c.hechos + retosOk;
      var pct = total ? Math.round((hechos / total) * 100) : 0;

      var barra = document.getElementById('progreso-leccion-barra');
      if (barra) {
        barra.querySelector('i').style.width = pct + '%';
        barra.setAttribute('aria-valuenow', pct);
      }
      var txt = document.getElementById('progreso-leccion-texto');
      if (txt) txt.textContent = hechos + ' de ' + total + ' actividades resueltas';
      pintarCompletar();
    }

    P.marcarEnCurso(leccion.id);
    UI.iniciar({
      avatar: {
        estado: 'senala',
        mensaje: leccion.destacada
          ? 'Esta es la lección completa del módulo 6. En la figura puedes aislar cada diagonal: empieza por la de cara.'
          : 'Lee la definición, mira la figura y después resuelve. Si te trabas, pide pista.'
      }
    });
    montarMensajeroAvatar(leccion);
    seguirSecciones(leccion);
    actualizarAvance();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})(window);
