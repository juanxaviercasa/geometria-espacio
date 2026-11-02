/* ============================================================
   visor.js — Escenario de Clase 3D, Modo Maestro y Modo Proyector
   ------------------------------------------------------------
   - Diseño sin encimados: barra superior fuera del lienzo y
     panel docente de Vértiz al costado (escritorio) o debajo (móvil).
   - El 100 % del lienzo 3D queda libre para que la figura jamás
     se recorte ni quede tapada por botones.
   - Vértiz aparece junto a la figura que explica, señala la capa
     activa y sincroniza voz y movimiento de boca.
   - Modo Proyector (pantalla completa + tema oscuro opcional +
     atajos de teclado y presentador inalámbrico).
   ============================================================ */
(function (global) {
  'use strict';

  var cargando = null;
  var modulo3d = null;
  var fallo3d = false;
  var instancias = [];
  var visorActivo = null;

  function prefiereReducido() {
    return global.Progreso ? global.Progreso.prefiereMovimientoReducido() : false;
  }

  function vistaPreferida() {
    var p = global.Progreso ? global.Progreso.leerPrefs() : {};
    return p.vistaPreferida === '2d' ? '2d' : '3d';
  }

  function fijarVistaPreferida(v) {
    if (!global.Progreso) return;
    var p = global.Progreso.leerPrefs();
    p.vistaPreferida = v;
    try {
      localStorage.setItem('geo3d.prefs.v1', JSON.stringify(p));
    } catch (e) {}
  }

  /* Carga del visor 3D */
  function cargar3d() {
    if (modulo3d) return Promise.resolve(modulo3d);

    if (global.Visor3D) {
      if (global.soportaWebGL && !global.soportaWebGL()) {
        fallo3d = true;
        return Promise.reject(new Error('WebGL no disponible'));
      }
      modulo3d = global.Visor3D;
      return Promise.resolve(modulo3d);
    }

    if (fallo3d) return Promise.reject(new Error('3D no disponible'));
    if (cargando) return cargando;

    cargando = Promise.resolve().then(function () {
      return (typeof importScripts === 'function')
        ? null
        : import('./visor3d.js');
    }).then(function (mod) {
      var V = (mod && mod.Visor3D) || global.Visor3D;
      var s = (mod && mod.soportaWebGL) || global.soportaWebGL;
      if (!s || !s()) {
        throw new Error('WebGL no disponible');
      }
      modulo3d = V;
      return modulo3d;
    }).catch(function (err) {
      fallo3d = true;
      cargando = null;
      throw err;
    });

    return cargando;
  }

  /* Generador de pasos pedagógicos por defecto */
  function generarPasosPorDefecto(spec) {
    var capas = spec.capas || [];
    var capa1 = capas[0] ? capas[0].id : 'aristas';
    var capa2 = capas[1] ? capas[1].id : capa1;

    return [
      {
        titulo: 'Presentación del sólido 3D',
        texto: spec.alt || ('Observa este modelo tridimensional: ' + spec.titulo + '. Arrástralo para girarlo en 360°.'),
        camara: spec.camara || { theta: 0.7, phi: 0.35 },
        capaResaltada: capa1
      },
      {
        titulo: 'Elementos y aristas clave',
        texto: spec.pie || 'Fíjate en las relaciones espaciales entre caras, alturas y aristas destacadas en color.',
        camara: { theta: ((spec.camara && spec.camara.theta) || 0.7) + 0.45, phi: 0.28 },
        capaResaltada: capa2
      },
      {
        titulo: 'Propiedades y relación métrica',
        texto: (spec.medidas && spec.medidas.length)
          ? ('Datos clave del modelo: ' + spec.medidas.map(function (m) { return m[0] + ' = ' + m[1]; }).join(' · ') + '.')
          : 'Identifica el triángulo rectángulo auxiliar dentro del sólido para calcular las longitudes pedidas.',
        camara: spec.camara || { theta: 0.7, phi: 0.35 },
        capaResaltada: capa1
      }
    ];
  }

  function nombreCapa(spec, idCapa) {
    var lista = (spec && spec.capas) || [];
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === idCapa) return lista[i];
    }
    return null;
  }

  /* Montaje del Escenario de Clase 3D */
  function montarFigura(contenedor, idFigura, opciones) {
    opciones = opciones || {};
    var esHero = !!opciones.modoHero;
    var spec = global.Figuras && global.Figuras.obtener(idFigura);
    if (!spec) {
      contenedor.innerHTML = '<p class="vacio-aviso">Figura no disponible.</p>';
      return null;
    }

    var capasOcultas = {};
    (spec.capas || []).forEach(function (c) {
      if (c.activa === false) capasOcultas[c.id] = true;
    });

    var pasos = (spec.pasosGuia && spec.pasosGuia.length) ? spec.pasosGuia : generarPasosPorDefecto(spec);

    var figura = document.createElement('figure');
    figura.className = 'figura' + (esHero ? ' figura-hero-modo' : '');
    figura.setAttribute('tabindex', '-1');

    /* 1. Barra superior dedicada (fuera del lienzo, nunca tapa la figura) */
    var barraSup = document.createElement('div');
    barraSup.className = 'figura-barra-sup';
    barraSup.innerHTML =
      '<div class="hud-titulo-wrap">' +
        '<span class="hud-badge">' + (esHero ? '✨ AULA 3D' : '📐 VISOR 3D') + '</span>' +
        '<h3 class="hud-fig-titulo">' + spec.titulo + '</h3>' +
      '</div>' +
      '<div class="acciones-fig">' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="vista-frente" title="Vista frontal del sólido (📐 Frente)">' +
          '<span>📐 Frente</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="vista-arriba" title="Vista superior o planta (🔼 Arriba)">' +
          '<span>🔼 Arriba</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="vista-iso" title="Perspectiva 3D isométrica"><span>🎲 3D</span></button>' +
        '<button type="button" class="btn-fig btn-fig-hud btn-lab-trigger" data-accion="laboratorio" aria-pressed="false" title="Abrir Laboratorio para variar medidas y calcular en tiempo real">' +
          '<span>⚙️ Medidas en vivo</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="vista" aria-pressed="false" title="Alternar entre vista 3D y dibujo 2D">' +
          '<span data-vista-texto>Vista 2D</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="reset" title="Recentrar figura (tecla R)">' +
          '<span>Recentrar</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="giro" aria-pressed="true" title="Pausar o reanudar rotación">' +
          '<span data-giro-texto>Giro</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="contraste" aria-pressed="false" title="Fondo oscuro de alto contraste para proyector">' +
          '<span>🌙 Fondo</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud btn-proyectar" data-accion="proyectar" aria-pressed="false" title="Modo Pantalla Completa / Proyector para Televisor (tecla F)">' +
          '<span data-proyectar-texto>⛶ Pantalla Completa TV</span>' +
        '</button>' +
      '</div>';
    figura.appendChild(barraSup);

    /* 2. Escenario de clase: Columna Lienzo 3D + Columna Profesor Vértiz */
    var escenarioClase = document.createElement('div');
    escenarioClase.className = 'figura-escenario-clase';

    /* 2a. Columna del lienzo 3D + capas + medidas */
    var colLienzo = document.createElement('div');
    colLienzo.className = 'figura-col-lienzo';

    var lienzoWrap = document.createElement('div');
    lienzoWrap.className = 'figura-stage-wrap';

    var lienzo = document.createElement('div');
    lienzo.className = 'figura-lienzo' + (esHero ? ' lienzo-hero' : '');
    lienzo.setAttribute('role', 'group');
    lienzo.setAttribute('aria-label', spec.alt || spec.titulo);
    lienzoWrap.appendChild(lienzo);

    var aviso = document.createElement('div');
    aviso.className = 'figura-aviso';
    aviso.textContent = 'Arrastra para girar · Rueda para zoom';
    if (opciones.sinAviso) aviso.hidden = true;
    lienzoWrap.appendChild(aviso);
    var guiaFoco=document.createElement('div');guiaFoco.className='guia-foco';guiaFoco.hidden=true;guiaFoco.setAttribute('aria-hidden','true');
    guiaFoco.innerHTML='<svg class="guia-foco-trazo" width="100%" height="100%"><path fill="none"></path></svg><span class="guia-foco-punto"></span><span class="guia-foco-etiqueta"></span>';
    lienzoWrap.appendChild(guiaFoco);

    colLienzo.appendChild(lienzoWrap);

    /* Panel del Laboratorio 3D Interactivo (Medidas y Fórmulas en Vivo) */
    var panelLab = document.createElement('div');
    panelLab.className = 'figura-laboratorio-panel';
    panelLab.hidden = true;
    panelLab.setAttribute('aria-label', 'Laboratorio interactivo de dimensiones y cálculo en vivo');
    colLienzo.appendChild(panelLab);

    
    /* Lógica del Laboratorio Interactivo */
    var labEstado = { activo: false, a: 2, b: 3, h: 6, r: 3 };
    if (idFigura.indexOf('cilindro') !== -1 || idFigura.indexOf('cono') !== -1) {
      labEstado = { activo: false, r: 3, h: 6 };
    } else if (idFigura.indexOf('piramide') !== -1) {
      labEstado = { activo: false, a: 4, h: 6 };
    }

    function renderLab() {
      var html = '<div class="lab-cabecera">' +
        '<h4>📐 Laboratorio 3D: Modifica Dimensiones y Observa el Cálculo en Vivo</h4>' +
        '<button type="button" class="lab-btn-cerrar" data-lab-cerrar title="Cerrar laboratorio">✕</button>' +
      '</div>' +
      '<div class="lab-cuerpo">' +
        '<div class="lab-controles">';

      if (labEstado.r != null) {
        html += '<div class="lab-control-fila">' +
          '<label><b>Radio base (r):</b> <span class="lab-val-num">' + labEstado.r.toFixed(1) + ' u</span></label>' +
          '<div class="lab-slider-wrap">' +
            '<button type="button" class="btn-lab-step" data-lab-step="r,-0.5">-</button>' +
            '<input type="range" min="1" max="8" step="0.5" value="' + labEstado.r + '" data-lab-slider="r">' +
            '<button type="button" class="btn-lab-step" data-lab-step="r,0.5">+</button>' +
          '</div>' +
        '</div>';
      } else {
        html += '<div class="lab-control-fila">' +
          '<label><b>Lado base (a):</b> <span class="lab-val-num">' + labEstado.a.toFixed(1) + ' u</span></label>' +
          '<div class="lab-slider-wrap">' +
            '<button type="button" class="btn-lab-step" data-lab-step="a,-0.5">-</button>' +
            '<input type="range" min="1" max="8" step="0.5" value="' + labEstado.a + '" data-lab-slider="a">' +
            '<button type="button" class="btn-lab-step" data-lab-step="a,0.5">+</button>' +
          '</div>' +
        '</div>';
        if (labEstado.b != null) {
          html += '<div class="lab-control-fila">' +
            '<label><b>Profundidad (b):</b> <span class="lab-val-num">' + labEstado.b.toFixed(1) + ' u</span></label>' +
            '<div class="lab-slider-wrap">' +
              '<button type="button" class="btn-lab-step" data-lab-step="b,-0.5">-</button>' +
              '<input type="range" min="1" max="8" step="0.5" value="' + labEstado.b + '" data-lab-slider="b">' +
              '<button type="button" class="btn-lab-step" data-lab-step="b,0.5">+</button>' +
            '</div>' +
          '</div>';
        }
      }

      html += '<div class="lab-control-fila">' +
        '<label><b>Altura (h):</b> <span class="lab-val-num">' + labEstado.h.toFixed(1) + ' u</span></label>' +
        '<div class="lab-slider-wrap">' +
          '<button type="button" class="btn-lab-step" data-lab-step="h,-0.5">-</button>' +
          '<input type="range" min="1" max="12" step="0.5" value="' + labEstado.h + '" data-lab-slider="h">' +
          '<button type="button" class="btn-lab-step" data-lab-step="h,0.5">+</button>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="btn-lab-reset" data-lab-reset>Restablecer originales</button>' +
      '</div>';

      html += '<div class="lab-calculos-tarjeta">';
      if (idFigura.indexOf('cilindro') !== -1) {
        var r = labEstado.r, h = labEstado.h;
        var ab = Math.PI * r * r;
        var al = 2 * Math.PI * r * h;
        var at = al + 2 * ab;
        var v = ab * h;
        html += '<div class="lab-calc-titulo">Cálculo de Cilindro en Vivo</div>' +
          '<div class="lab-calc-fila"><span>Área base (A_B):</span> <span class="m">A_B = \\pi r^2 = ' + ab.toFixed(2) + ' u^2</span></div>' +
          '<div class="lab-calc-fila"><span>Área lateral (A_L):</span> <span class="m">A_L = 2\\pi r h = ' + al.toFixed(2) + ' u^2</span></div>' +
          '<div class="lab-calc-fila"><span>Área total (A_T):</span> <span class="m">A_T = A_L + 2A_B = ' + at.toFixed(2) + ' u^2</span></div>' +
          '<div class="lab-calc-fila destaque"><span>Volumen (V):</span> <span class="m">V = A_B \\cdot h = ' + v.toFixed(2) + ' u^3</span></div>';
      } else if (idFigura.indexOf('cono') !== -1) {
        var r2 = labEstado.r, h2 = labEstado.h;
        var g = Math.sqrt(r2 * r2 + h2 * h2);
        var ab2 = Math.PI * r2 * r2;
        var al2 = Math.PI * r2 * g;
        var at2 = al2 + ab2;
        var v2 = (1 / 3) * ab2 * h2;
        html += '<div class="lab-calc-titulo">Cálculo de Cono en Vivo</div>' +
          '<div class="lab-calc-fila"><span>Generatriz (g):</span> <span class="m">g = \\sqrt{r^2 + h^2} = ' + g.toFixed(2) + ' u</span></div>' +
          '<div class="lab-calc-fila"><span>Área lateral (A_L):</span> <span class="m">A_L = \\pi r g = ' + al2.toFixed(2) + ' u^2</span></div>' +
          '<div class="lab-calc-fila destaque"><span>Volumen (V):</span> <span class="m">V = \\frac{1}{3} \\pi r^2 h = ' + v2.toFixed(2) + ' u^3</span></div>';
      } else if (idFigura.indexOf('piramide') !== -1) {
        var aP = labEstado.a, hP = labEstado.h;
        var apP = aP / 2;
        var Ap = Math.sqrt(hP * hP + apP * apP);
        var abP = aP * aP;
        var alP = (4 * aP / 2) * Ap;
        var atP = alP + abP;
        var vP = (1 / 3) * abP * hP;
        html += '<div class="lab-calc-titulo">Cálculo de Pirámide en Vivo</div>' +
          '<div class="lab-calc-fila"><span>Apotema (Ap):</span> <span class="m">Ap = \\sqrt{h^2 + ap^2} = ' + Ap.toFixed(2) + ' u</span></div>' +
          '<div class="lab-calc-fila"><span>Área lateral (A_L):</span> <span class="m">A_L = p_{base} \\times Ap = ' + alP.toFixed(2) + ' u^2</span></div>' +
          '<div class="lab-calc-fila destaque"><span>Volumen (V):</span> <span class="m">V = \\frac{1}{3} A_B \\cdot h = ' + vP.toFixed(2) + ' u^3</span></div>';
      } else {
        var aPr = labEstado.a, bPr = labEstado.b != null ? labEstado.b : labEstado.a, hPr = labEstado.h;
        var abPr = aPr * bPr;
        var alPr = 2 * (aPr + bPr) * hPr;
        var atPr = alPr + 2 * abPr;
        var vPr = abPr * hPr;
        var dEsp = Math.sqrt(aPr * aPr + bPr * bPr + hPr * hPr);
        html += '<div class="lab-calc-titulo">Cálculo de Prisma Recto en Vivo</div>' +
          '<div class="lab-calc-fila"><span>Área base (A_B):</span> <span class="m">A_B = a \\times b = ' + abPr.toFixed(2) + ' u^2</span></div>' +
          '<div class="lab-calc-fila"><span>Área lateral (A_L):</span> <span class="m">A_L = 2(a+b)h = ' + alPr.toFixed(2) + ' u^2</span></div>' +
          '<div class="lab-calc-fila"><span>Diagonal espacial (D):</span> <span class="m">D = \\sqrt{a^2+b^2+h^2} = ' + dEsp.toFixed(2) + ' u</span></div>' +
          '<div class="lab-calc-fila destaque"><span>Volumen (V):</span> <span class="m">V = A_B \\cdot h = ' + vPr.toFixed(2) + ' u^3</span></div>';
      }
      html += '</div></div>';
      panelLab.innerHTML = html;

      panelLab.querySelectorAll('[data-lab-slider]').forEach(function (inp) {
        inp.addEventListener('input', function () {
          var param = inp.getAttribute('data-lab-slider');
          labEstado[param] = parseFloat(inp.value);
          actualizarEscala3D();
          renderLab();
        });
      });
      panelLab.querySelectorAll('[data-lab-step]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var partes = btn.getAttribute('data-lab-step').split(',');
          var param = partes[0], delta = parseFloat(partes[1]);
          labEstado[param] = Math.max(1, Math.min(12, labEstado[param] + delta));
          actualizarEscala3D();
          renderLab();
        });
      });
      var btnCerrar = panelLab.querySelector('[data-lab-cerrar]');
      if (btnCerrar) btnCerrar.addEventListener('click', function () {
        panelLab.hidden = true;
        var t = barraSup.querySelector('[data-accion="laboratorio"]');
        if (t) t.setAttribute('aria-pressed', 'false');
      });
      var btnReset = panelLab.querySelector('[data-lab-reset]');
      if (btnReset) btnReset.addEventListener('click', function () {
        labEstado.a = 2; labEstado.b = 3; labEstado.h = 6; labEstado.r = 3;
        actualizarEscala3D();
        renderLab();
      });

      if (global.Matematicas && global.Matematicas.render) {
        global.Matematicas.render(panelLab);
      }
    }

    function actualizarEscala3D() {
      if (!estado.api || !estado.api.escalaDinamica) return;
      var sx = 1, sy = 1, sz = 1;
      if (labEstado.r != null) {
        sx = labEstado.r / 3; sz = labEstado.r / 3; sy = labEstado.h / 6;
      } else {
        sx = labEstado.a / 2; sz = (labEstado.b != null ? labEstado.b : labEstado.a) / 3; sy = labEstado.h / 6;
      }
      estado.api.escalaDinamica(sx, sy, sz);
    }

    /* Barra de capas + medidas debajo del lienzo */
    var capasBar = document.createElement('div');
    capasBar.className = 'figura-capas';
    capasBar.innerHTML = '<span class="et">Capas:</span>';
    (spec.capas || []).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-fig btn-pildora-capa';
      b.setAttribute('data-capa', c.id);
      b.setAttribute('aria-pressed', c.activa === false ? 'false' : 'true');
      b.innerHTML = '<span class="capa-color-dot" style="background:' + c.color + '"></span>' + c.nombre;
      capasBar.appendChild(b);
    });

    if (spec.medidas && spec.medidas.length) {
      var medWrap = document.createElement('div');
      medWrap.className = 'figura-medidas-chips';
      medWrap.innerHTML = spec.medidas.map(function (m) {
        return '<span class="chip-medida"><b>' + m[0] + ':</b> <span class="m">' + m[1] + '</span></span>';
      }).join('');
      capasBar.appendChild(medWrap);
    }
    colLienzo.appendChild(capasBar);
    escenarioClase.appendChild(colLienzo);

    /* 2b. Columna Docente: Vértiz + Paso a Paso */
    var colMaestro = document.createElement('aside');
    colMaestro.className = 'figura-col-maestro';
    colMaestro.setAttribute('aria-label', 'Explicación paso a paso con Vértiz');

    var puntosHtml = pasos.map(function (p, idx) {
      return '<button type="button" class="mm-punto-paso' + (idx === 0 ? ' activo' : '') + '" data-mm-ir="' + idx + '" title="Ir al paso ' + (idx + 1) + ': ' + p.titulo + '">' + (idx + 1) + '</button>';
    }).join('');

    var capaInicial = nombreCapa(spec, pasos[0].capaResaltada);
    var badgeCapaHtml = capaInicial
      ? '<span class="mm-capa-foco" data-mm-capa-tag><span class="capa-color-dot" style="background:' + capaInicial.color + '"></span>Enfoca: ' + capaInicial.nombre + '</span>'
      : '<span class="mm-capa-foco" data-mm-capa-tag hidden></span>';

    colMaestro.innerHTML =
      '<div class="mm-profesor-cabecera">' +
        '<div class="mm-avatar-slot" data-mm-avatar-slot></div>' +
        '<div class="mm-profesor-info">' +
          '<div class="mm-profesor-top">' +
            '<span class="mm-rol-tag">🎓 MODO MAESTRO</span>' +
            '<span class="avatar-ondas-voz" data-mm-ondas aria-hidden="true">' +
              '<span class="onda-1"></span><span class="onda-2"></span><span class="onda-3"></span><span class="onda-4"></span>' +
            '</span>' +
          '</div>' +
          '<strong class="mm-profesor-nombre">Vértiz explica este modelo</strong>' +
          '<div class="mm-controles-audio">' +
            '<button type="button" class="btn-mm-chip-voz" data-mm-accion="voz" title="Activar o silenciar voz">' +
              '<span class="mm-ico-voz">🔊</span> <span class="mm-txt-voz">Voz activa</span>' +
            '</button>' +
            '<button type="button" class="btn-mm-chip-voz" data-mm-accion="repetir" title="Volver a escuchar este paso">' +
              '🔄 Escuchar' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="mm-progreso-fila">' +
        '<span class="mm-num-tag" data-mm-paso-num>Paso 1 de ' + pasos.length + '</span>' +
        '<div class="mm-puntos-lista" role="group" aria-label="Pasos de la explicación">' + puntosHtml + '</div>' +
      '</div>' +

      '<div class="mm-caja-dialogo">' +
        '<div class="mm-dialogo-header">' +
          '<strong class="mm-dialogo-titulo" data-mm-titulo>' + pasos[0].titulo + '</strong>' +
          badgeCapaHtml +
        '</div>' +
        '<p class="mm-dialogo-texto" data-mm-texto>' + pasos[0].texto + '</p>' +
      '</div>' +

      '<div class="mm-guion-lista" aria-label="Índice de pasos de la figura">' +
        pasos.map(function (p, idx) {
          return '<button type="button" class="mm-guion-item' + (idx === 0 ? ' activo' : '') + '" data-mm-ir="' + idx + '">' +
            '<span class="mm-guion-idx">' + (idx + 1) + '</span>' +
            '<span class="mm-guion-tit">' + p.titulo + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +

      '<div class="mm-acciones-fila">' +
        '<button type="button" class="btn-mm-nav btn-mm-ant" data-mm-accion="ant" disabled title="Paso anterior (←)">' +
          '◀ Anterior' +
        '</button>' +
        '<button type="button" class="btn-mm-nav btn-mm-sig" data-mm-accion="sig" title="Iniciar o avanzar al siguiente paso (→ o Espacio)">' +
          '<span data-mm-sig-txt>▶ Explicar paso 1</span>' +
        '</button>' +
      '</div>';

    escenarioClase.appendChild(colMaestro);
    figura.appendChild(escenarioClase);

    /* Pie descriptivo en lecciones */
    if (!esHero && spec.pie) {
      var pie = document.createElement('figcaption');
      pie.className = 'figura-pie';
      pie.innerHTML = '<p class="figura-pie-desc">' + spec.pie + '</p>';
      figura.appendChild(pie);
    }

    contenedor.innerHTML = '';
    contenedor.appendChild(figura);

    /* Montar mini Vértiz dentro del panel docente */
    var slotAvatar = colMaestro.querySelector('[data-mm-avatar-slot]');
    if (global.Tutores) colMaestro.querySelector('.mm-profesor-info').appendChild(global.Tutores.selector());
    var miniAvatar = null;
    if (slotAvatar && global.Avatar && global.Avatar.crearMini) {
      miniAvatar = global.Avatar.crearMini();
      slotAvatar.appendChild(miniAvatar.nodo);
    }

    var estado = {
      api: null,
      tipo: null,
      reducido: prefiereReducido(),
      spec: spec,
      capasOcultas: capasOcultas,
      giro: !prefiereReducido(),
      pasoActual: 0,
      iniciado: false,
      figura: figura
    };

    function actualizarAtencion() {
      if(!estado.iniciado || !estado.atencionActiva || !estado.puntoAtencion || !estado.capaAtencion || estado.capasOcultas[estado.capaAtencion]) {
        guiaFoco.hidden=true;
        if(estado.atencionActiva && estado.capasOcultas[estado.capaAtencion] && global.Tutores)global.Tutores.suspender(figura);
        return;
      }
      var q=estado.tipo==='3d' && estado.api && estado.api.proyectarPunto
        ? estado.api.proyectarPunto(estado.puntoAtencion)
        : estado.proyeccion2d && estado.proyeccion2d.proyectar(estado.puntoAtencion);
      if(!q || !q.visible || !Number.isFinite(q.x) || !Number.isFinite(q.y)){guiaFoco.hidden=true;return;}
      guiaFoco.hidden=false;
      guiaFoco.style.setProperty('--foco-x',q.x+'px');guiaFoco.style.setProperty('--foco-y',q.y+'px');
      var r=lienzo.getBoundingClientRect(), tutor=slotAvatar.getBoundingClientRect();
      var w=r.width,h=r.height;
      var alCostado=tutor.left>=r.right-10;
      var sx=alCostado?w-12:Math.max(12,Math.min(w-12,tutor.left+tutor.width/2-r.left));
      var sy=alCostado?Math.max(12,Math.min(h-12,q.y+40)):h-12;
      guiaFoco.querySelector('path').setAttribute('d','M '+sx+' '+sy+' Q '+sx+' '+q.y+' '+q.x+' '+q.y);
      if(global.Tutores)global.Tutores.orientar({figura:figura,lienzo:lienzo,x:q.x,y:q.y,nombre:estado.nombreAtencion});
    }

    function pintar2d() {
      estado.tipo = '2d';
      lienzo.innerHTML = '';
      estado.proyeccion2d=global.Visor2D.render(lienzo, spec, { capasOcultas: estado.capasOcultas, camara: estado.camaraGuia });
      aviso.hidden = true;
      actualizarAtencion();
    }

    function usar2d(motivo) {
      estado.tipo = '2d';
      pintar2d();
      var b = barraSup.querySelector('[data-vista-texto]');
      if (b) b.textContent = 'Vista 3D';
      var btn = barraSup.querySelector('[data-accion="vista"]');
      if (btn) btn.setAttribute('aria-pressed', 'true');
      var giroBtn = barraSup.querySelector('[data-accion="giro"]');
      if (giroBtn) giroBtn.hidden = true;
      if (motivo === 'error') {
        aviso.hidden = false;
        aviso.textContent = 'Vista 2D (WebGL no disponible)';
      }
    }

    function usar3d() {
      cargar3d().then(function (Clase) {
        if (estado.api) {
          estado.api.destruir();
          estado.api = null;
        }
        lienzo.innerHTML = '';
        try {
          estado.api = new Clase(lienzo, spec, {
            capasOcultas: estado.capasOcultas,
            reducido: estado.reducido,
            alMoverCamara: actualizarAtencion
          });
          estado.tipo = '3d';
          estado.api.setAutoGiro(estado.giro && !estado.reducido);
          if (!opciones.sinAviso) aviso.hidden = false;
          var btn = barraSup.querySelector('[data-accion="vista"]');
          if (btn) btn.setAttribute('aria-pressed', 'false');
          var vt = barraSup.querySelector('[data-vista-texto]');
          if (vt) vt.textContent = 'Vista 2D';
          var giroBtn = barraSup.querySelector('[data-accion="giro"]');
          if (giroBtn) giroBtn.hidden = estado.reducido;
          if (instancias.indexOf(estado) === -1) instancias.push(estado);
          if (estado.iniciado) irAPaso(estado.pasoActual, false);
        } catch (e) {
          console.warn('Error inicializando Visor3D:', e);
          usar2d('error');
        }
      }).catch(function (err) {
        console.warn('Fallback 2D:', err);
        usar2d('error');
      });
    }

    if (vistaPreferida() === '2d') {
      usar2d();
    } else {
      usar3d();
    }

    /* ---------- Lógica del Modo Maestro ---------- */
    var btnVoz = colMaestro.querySelector('[data-mm-accion="voz"]');
    var btnRepetir = colMaestro.querySelector('[data-mm-accion="repetir"]');
    var btnAnt = colMaestro.querySelector('[data-mm-accion="ant"]');
    var btnSig = colMaestro.querySelector('[data-mm-accion="sig"]');
    var txtSig = colMaestro.querySelector('[data-mm-sig-txt]');
    var txtPasoNum = colMaestro.querySelector('[data-mm-paso-num]');
    var txtTitulo = colMaestro.querySelector('[data-mm-titulo]');
    var txtExplicacion = colMaestro.querySelector('[data-mm-texto]');
    var tagCapa = colMaestro.querySelector('[data-mm-capa-tag]');
    var ondasMM = colMaestro.querySelector('[data-mm-ondas]');
    var botonesPuntos = colMaestro.querySelectorAll('[data-mm-ir]');

    function actualizarBotonVoz() {
      var activa = global.Avatar && global.Avatar.getVozHabilitada ? global.Avatar.getVozHabilitada() : true;
      var ico = btnVoz.querySelector('.mm-ico-voz');
      var txt = btnVoz.querySelector('.mm-txt-voz');
      if (ico) ico.textContent = activa ? '🔊' : '🔇';
      if (txt) txt.textContent = activa ? 'Voz ON' : 'Silencio';
      btnVoz.classList.toggle('voz-activa', activa);
    }

    function irAPaso(idx, conAudio) {
      if (idx < 0 || idx >= pasos.length) return;
      visorActivo = instanciaPublica;
      estado.pasoActual = idx;
      estado.iniciado = true;
      var paso = pasos[idx];
      estado.atencionActiva=true;
      var objetivo=nombreCapa(spec,paso.capaResaltada);
      estado.capaAtencion=paso.capaResaltada;
      estado.nombreAtencion=objetivo?objetivo.nombre:paso.titulo;
      estado.puntoAtencion=global.Figuras.puntoAtencion(spec,paso.capaResaltada);
      guiaFoco.querySelector('.guia-foco-etiqueta').textContent='Mira: '+estado.nombreAtencion;
      guiaFoco.style.setProperty('--foco-color',objetivo?objetivo.color:'#6366f1');
      if(global.Tutores)global.Tutores.enfocar({figura:figura,lienzo:lienzo,nombre:estado.nombreAtencion,paso:idx+1});
      aviso.hidden=true;
      estado.camaraGuia = paso.camara;
      // Mantener la selección y la capa visible en ambos motores.
      if (paso.capaResaltada) estado.capasOcultas[paso.capaResaltada] = false;
      if (paso.capasVisibles) {
        (spec.capas || []).forEach(function (c) {
          estado.capasOcultas[c.id] = paso.capasVisibles.indexOf(c.id) === -1;
        });
      }
      capasBar.querySelectorAll('[data-capa]').forEach(function (b) {
        var id = b.getAttribute('data-capa');
        b.setAttribute('aria-pressed', estado.capasOcultas[id] ? 'false' : 'true');
        if (estado.api) estado.api.setCapa(id, !estado.capasOcultas[id]);
      });
      if (estado.tipo === '2d') pintar2d();

      txtPasoNum.textContent = 'Paso ' + (idx + 1) + ' de ' + pasos.length;
      txtTitulo.textContent = paso.titulo;
      txtExplicacion.innerHTML = paso.texto;

      var infoCapa = nombreCapa(spec, paso.capaResaltada);
      if (tagCapa) {
        if (infoCapa) {
          tagCapa.hidden = false;
          tagCapa.innerHTML = '<span class="capa-color-dot" style="background:' + infoCapa.color + '"></span>Enfoca: ' + infoCapa.nombre;
        } else {
          tagCapa.hidden = true;
        }
      }

      botonesPuntos.forEach(function (b) {
        var nPaso = parseInt(b.getAttribute('data-mm-ir'), 10);
        b.classList.toggle('activo', nPaso === idx);
        b.setAttribute('aria-current', nPaso === idx ? 'step' : 'false');
        b.classList.toggle('visitado', nPaso < idx);
      });

      btnAnt.disabled = (idx === 0);
      if (idx === pasos.length - 1) {
        txtSig.textContent = '↻ Reiniciar explicación';
        btnSig.classList.add('btn-completado');
      } else {
        txtSig.textContent = 'Avanzar al paso ' + (idx + 2) + ' ⏭';
        btnSig.classList.remove('btn-completado');
      }

      /* Animar cámara y resaltar capa en el modelo 3D */
      if (estado.tipo === '3d' && estado.api) {
        estado.giro = false;
        estado.api.setAutoGiro(false);
        var giroBtn = barraSup.querySelector('[data-accion="giro"]');
        if (giroBtn) giroBtn.setAttribute('aria-pressed', 'false');

        if (paso.camara && estado.api.enfocarCamara) {
          estado.api.enfocarCamara(paso.camara.theta, paso.camara.phi, paso.camara.dist, 750);
        }
        if (paso.capaResaltada && estado.api.resaltarCapa) {
          estado.api.resaltarCapa(paso.capaResaltada, 0);
          var pillCapa = capasBar.querySelector('[data-capa="' + paso.capaResaltada + '"]');
          if (pillCapa) pillCapa.setAttribute('aria-pressed', 'true');
        }
      }

      /* Locución y animación de Vértiz */
      actualizarAtencion();
      if (conAudio !== false) {
        if (global.AvatarGuia && global.AvatarGuia.hablar) {
          global.AvatarGuia.hablar(paso.texto, {
            estadoFinal: (idx === pasos.length - 1) ? 'celebra' : 'senala',
            conVoz: true
          });
        } else if (global.Avatar && global.Avatar.hablarVoz) {
          global.Avatar.hablarVoz(paso.texto);
        }

      }
    }

    btnSig.addEventListener('click', function () {
      if (!estado.iniciado) {
        irAPaso(0, true);
      } else if (estado.pasoActual < pasos.length - 1) {
        irAPaso(estado.pasoActual + 1, true);
      } else {
        irAPaso(0, true);
      }
    });

    btnAnt.addEventListener('click', function () {
      if (estado.pasoActual > 0) {
        irAPaso(estado.pasoActual - 1, true);
      }
    });

    btnRepetir.addEventListener('click', function () {
      irAPaso(estado.pasoActual, true);
    });

    botonesPuntos.forEach(function (b) {
      b.addEventListener('click', function () {
        var idx = parseInt(b.getAttribute('data-mm-ir'), 10);
        if (!isNaN(idx)) irAPaso(idx, true);
      });
    });

    btnVoz.addEventListener('click', function () {
      if (global.Avatar && global.Avatar.getVozHabilitada && global.Avatar.setVozHabilitada) {
        var nueva = !global.Avatar.getVozHabilitada();
        global.Avatar.setVozHabilitada(nueva);
        actualizarBotonVoz();
        if (nueva) {
          irAPaso(estado.pasoActual, true);
        }
      }
    });

    document.addEventListener('voz-cambiada', actualizarBotonVoz);
    document.addEventListener('tutor-enfocando',function(e){
      if(e.detail.figura!==figura){estado.atencionActiva=false;guiaFoco.hidden=true;var m=colMaestro.querySelector('.tutor-consigna');if(m)m.hidden=true;}
    });
    document.addEventListener('avatar-hablando', function (e) {
      var activo = !!(e.detail && e.detail.activo);
      if (ondasMM) ondasMM.classList.toggle('activo', activo);
      colMaestro.classList.toggle('hablando-ahora', activo);
    });
    actualizarBotonVoz();

    /* ---------- Controles de la barra superior ---------- */
    barraSup.querySelector('[data-accion="vista"]').addEventListener('click', function () {
      if (estado.tipo === '3d') {
        if (estado.api) { estado.api.destruir(); estado.api = null; }
        usar2d();
        fijarVistaPreferida('2d');
      } else {
        usar3d();
        fijarVistaPreferida('3d');
      }
    });

    barraSup.querySelector('[data-accion="reset"]').addEventListener('click', function () {
      if (estado.tipo === '3d' && estado.api) {
        estado.api.reset();
        if (estado.iniciado) irAPaso(estado.pasoActual, false);
      } else {
        pintar2d();
      }
    });

    var bFrente = barraSup.querySelector('[data-accion="vista-frente"]');
    if (bFrente) bFrente.addEventListener('click', function () {
      if (estado.tipo === '3d' && estado.api && estado.api.vistaFrente) estado.api.vistaFrente();
    });
    var bArriba = barraSup.querySelector('[data-accion="vista-arriba"]');
    if (bArriba) bArriba.addEventListener('click', function () {
      if (estado.tipo === '3d' && estado.api && estado.api.vistaArriba) estado.api.vistaArriba();
    });
    var bIso = barraSup.querySelector('[data-accion="vista-iso"]');
    if (bIso) bIso.addEventListener('click', function () {
      if (estado.tipo === '3d' && estado.api && estado.api.vistaIsometrica) estado.api.vistaIsometrica();
    });
    var bLab = barraSup.querySelector('[data-accion="laboratorio"]');
    if (bLab) bLab.addEventListener('click', function () {
      panelLab.hidden = !panelLab.hidden;
      bLab.setAttribute('aria-pressed', panelLab.hidden ? 'false' : 'true');
      if (!panelLab.hidden) renderLab();
    });

    barraSup.querySelector('[data-accion="giro"]').addEventListener('click', function () {
      estado.giro = !estado.giro;
      this.setAttribute('aria-pressed', estado.giro ? 'true' : 'false');
      if (estado.api) estado.api.setAutoGiro(estado.giro);
    });

    barraSup.querySelector('[data-accion="contraste"]').addEventListener('click', function () {
      var oscuro = figura.classList.toggle('tema-oscuro-visor');
      this.setAttribute('aria-pressed', oscuro ? 'true' : 'false');
      if (estado.api && estado.api._resize) estado.api._resize();
    });

    var btnProyectar = barraSup.querySelector('[data-accion="proyectar"]');
    var txtProyectar = barraSup.querySelector('[data-proyectar-texto]');

    function alternarProyector() {
      visorActivo = instanciaPublica;
      var proyectando = figura.classList.toggle('modo-proyector');
      document.body.classList.toggle('con-visor-proyectado', proyectando);
      btnProyectar.setAttribute('aria-pressed', proyectando ? 'true' : 'false');
      if (txtProyectar) txtProyectar.textContent = proyectando ? '✕ Salir' : '⛶ Proyectar';

      if (proyectando) {
        if (figura.requestFullscreen) {
          figura.requestFullscreen().catch(function () {});
        }
        figura.focus();
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(function () {});
        }
      }
      setTimeout(function () {
        if (estado.api && estado.api._resize) estado.api._resize();
        else if (estado.tipo === '2d') pintar2d();
      }, 60);
    }

    btnProyectar.addEventListener('click', alternarProyector);

    document.addEventListener('fullscreenchange', function () {
      if (!document.fullscreenElement && figura.classList.contains('modo-proyector')) {
        figura.classList.remove('modo-proyector');
        document.body.classList.remove('con-visor-proyectado');
        btnProyectar.setAttribute('aria-pressed', 'false');
        if (txtProyectar) txtProyectar.textContent = '⛶ Proyectar';
        setTimeout(function () {
          if (estado.api && estado.api._resize) estado.api._resize();
        }, 60);
      }
    });

    /* ---------- Capas ---------- */
    capasBar.querySelectorAll('[data-capa]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-capa');
        var activa = b.getAttribute('aria-pressed') === 'true';
        b.setAttribute('aria-pressed', activa ? 'false' : 'true');
        estado.capasOcultas[id] = activa;
        if (estado.tipo === '3d' && estado.api) estado.api.setCapa(id, !activa);
        else pintar2d();
        actualizarAtencion();
      });
    });

    /* ---------- Visibilidad en pantalla ---------- */
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (!estado.api) return;
          if (e.isIntersecting) {
            estado.api.reanudar();
            if (!visorActivo) visorActivo = instanciaPublica;
          } else {
            estado.api.pausar();
          }
        });
      }, { rootMargin: '140px' });
      obs.observe(figura);
    }

    figura.addEventListener('mouseenter', function () {
      visorActivo = instanciaPublica;
    });
    figura.addEventListener('focusin', function () {
      visorActivo = instanciaPublica;
    });

    window.addEventListener('resize', function () {
      if (estado.tipo === '2d') pintar2d();
      actualizarAtencion();
    });

    document.addEventListener('movimiento-cambiado', function (e) {
      estado.reducido = e.detail.reducido;
      if (estado.api) estado.api.setReducido(estado.reducido);
      if (estado.api && estado.reducido) estado.api.setAutoGiro(false);
    });

    var instanciaPublica = {
      elemento: figura,
      irAPaso: irAPaso,
      siguientePaso: function () { btnSig.click(); },
      anteriorPaso: function () { btnAnt.click(); },
      alternarProyector: alternarProyector,
      obtenerEstado: function () { return estado; }
    };

    if (!visorActivo) visorActivo = instanciaPublica;
    return instanciaPublica;
  }

  /* Atajos de teclado de aula (cuando se proyecta o no se está en un input) */
  window.addEventListener('keydown', function (e) {
    if (!visorActivo) return;
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) return;
    if ((tag === 'button' || tag === 'a') && e.key === ' ') return;

    var st = visorActivo.obtenerEstado();
    var enProyector = st && st.figura && st.figura.classList.contains('modo-proyector');
    var focoEnFigura = st && st.figura && st.figura.contains(document.activeElement);

    if (!enProyector && !focoEnFigura) return;

    if ((e.key === 't' || e.key === 'T') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      if (global.UI && global.UI.alternarModoAulaTV) {
        global.UI.alternarModoAulaTV();
        return;
      }
    }
    if (e.key === 'PageDown' || (enProyector && (e.key === 'ArrowRight' || e.key === ' '))) {
      e.preventDefault();
      visorActivo.siguientePaso();
    } else if (e.key === 'PageUp' || (enProyector && e.key === 'ArrowLeft')) {
      e.preventDefault();
      visorActivo.anteriorPaso();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      visorActivo.alternarProyector();
    } else if (e.key === 'Escape' && enProyector) {
      e.preventDefault();
      visorActivo.alternarProyector();
    }
  });

  global.Visor = {
    montar: montarFigura,
    montarFigura: montarFigura,
    instancias: instancias,
    cargar3d: cargar3d
  };
})(window);
