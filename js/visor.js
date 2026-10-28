/* ============================================================
   visor.js — orquestador de figuras y Modo Maestro 3D
   ------------------------------------------------------------
   - Escenario 3D interactivo con HUD flotante de cristal.
   - Modo Maestro integrado directamente sobre la escena 3D.
   - Sincronización con Vértiz (voz, cámara 3D y resaltado).
   - Modo Hero optimizado para máxima elegancia en portada.
   ============================================================ */
(function (global) {
  'use strict';

  var cargando = null;
  var modulo3d = null;
  var fallo3d = false;
  var instancias = [];

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
        : import('./js/visor3d.js').catch(function () {
            return import('./visor3d.js');
          });
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
        texto: spec.alt || ('Observen este sólido tridimensional: ' + spec.titulo + '. Puedes rotarlo libremente en 360° con el ratón o el dedo.'),
        camara: spec.camara || { theta: 0.7, phi: 0.35 },
        capaResaltada: capa1
      },
      {
        titulo: 'Elementos y aristas clave',
        texto: spec.pie || 'Fíjate en las relaciones de perpendicularidad, caras y aristas destacadas en el modelo.',
        camara: { theta: ((spec.camara && spec.camara.theta) || 0.7) + 0.45, phi: 0.28 },
        capaResaltada: capa2
      },
      {
        titulo: 'Propiedades y cálculo métrico',
        texto: (spec.medidas && spec.medidas.length)
          ? ('Medidas destacadas del modelo: ' + spec.medidas.map(function (m) { return m[0] + ' (' + m[1] + ')'; }).join(', ') + '.')
          : 'Comprender visualmente el cuerpo es la clave para resolver los problemas tipo admisión.',
        camara: spec.camara || { theta: 0.7, phi: 0.35 },
        capaResaltada: capa1
      }
    ];
  }

  /* Contenedor de figura con diseño moderno y Modo Maestro */
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

    var figura = document.createElement('figure');
    figura.className = 'figura' + (esHero ? ' figura-hero-mode' : '');

    // Escenario contenedor que agrupa el HUD flotante, el lienzo y el Modo Maestro
    var stageWrap = document.createElement('div');
    stageWrap.className = 'figura-stage-wrap';

    // HUD Superior Flotante de Cristal
    var hudTop = document.createElement('div');
    hudTop.className = 'figura-hud-top';
    hudTop.innerHTML =
      '<div class="hud-titulo-wrap">' +
        '<span class="hud-badge">' + (esHero ? '✨ MODELO 3D' : '📐 3D LAB') + '</span>' +
        '<h4 class="hud-fig-titulo">' + spec.titulo + '</h4>' +
      '</div>' +
      '<div class="acciones-fig">' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="vista" aria-pressed="false" title="Cambiar a vista 2D/3D">' +
          '<span data-vista-texto>2D</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="reset" title="Recentrar cámara">' +
          '<span>Recentrar</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="giro" aria-pressed="true" title="Pausar o activar giro automático">' +
          '<span data-giro-texto>Giro</span>' +
        '</button>' +
      '</div>';
    stageWrap.appendChild(hudTop);

    // Lienzo 3D
    var lienzo = document.createElement('div');
    lienzo.className = 'figura-lienzo' + (esHero ? ' lienzo-hero' : '');
    lienzo.setAttribute('role', 'group');
    lienzo.setAttribute('aria-label', spec.alt || spec.titulo);
    stageWrap.appendChild(lienzo);

    var aviso = document.createElement('div');
    aviso.className = 'figura-aviso';
    aviso.textContent = 'Arrastra para rotar en 360°';
    if (opciones.sinAviso) aviso.hidden = true;
    lienzo.appendChild(aviso);

    // Panel interactivo del Modo Maestro (flotante sobre el lienzo)
    var pasos = (spec.pasosGuia && spec.pasosGuia.length) ? spec.pasosGuia : generarPasosPorDefecto(spec);

    var modoMaestroWrap = document.createElement('div');
    modoMaestroWrap.className = 'modo-maestro modo-maestro-dock';
    modoMaestroWrap.innerHTML =
      '<div class="mm-cabecera">' +
        '<button type="button" class="btn-mm-iniciar-glow" data-mm-accion="iniciar">' +
          '<span class="mm-ico">▶</span> <span class="mm-txt-iniciar">Iniciar Explicación con Vértiz</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud btn-mm-voz" data-mm-accion="voz" title="Activar/Silenciar voz">' +
          '<span class="mm-ico-voz">' + (global.Avatar && global.Avatar.getVozHabilitada && global.Avatar.getVozHabilitada() ? '🔊' : '🔇') + '</span> ' +
          '<span class="mm-txt-voz">Voz</span>' +
        '</button>' +
      '</div>' +
      '<div class="mm-panel-interactivo" data-mm-panel hidden>' +
        '<div class="mm-nav-barra">' +
          '<div class="mm-paso-contador">' +
            '<span class="mm-num-tag" data-mm-paso-num>Paso 1</span> de <span data-mm-paso-total>' + pasos.length + '</span>' +
            '<div class="mm-barra-progreso"><i data-mm-progreso style="width:' + (100 / pasos.length) + '%"></i></div>' +
          '</div>' +
          '<div class="mm-nav-botones">' +
            '<button type="button" class="btn-mm-nav btn-mm-ant" data-mm-accion="ant" disabled title="Paso anterior">' +
              '◀ Anterior' +
            '</button>' +
            '<button type="button" class="btn-mm-nav btn-mm-sig" data-mm-accion="sig" title="Avanzar al siguiente paso">' +
              'Avanzar ⏭' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="mm-caja-dialogo">' +
          '<div class="mm-dialogo-header">' +
            '<span class="mm-avatar-tag">🗣️ Vértiz explica:</span>' +
            '<strong class="mm-dialogo-titulo" data-mm-titulo>' + pasos[0].titulo + '</strong>' +
          '</div>' +
          '<p class="mm-dialogo-texto" data-mm-texto>' + pasos[0].texto + '</p>' +
        '</div>' +
      '</div>';
    stageWrap.appendChild(modoMaestroWrap);
    figura.appendChild(stageWrap);

    // Barra de Capas (píldoras horizontales limpias debajo del escenario)
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
    figura.appendChild(capasBar);

    // Pie de figura y medidas (se oculta en hero para evitar saturación visual)
    if (!esHero) {
      var pie = document.createElement('figcaption');
      pie.className = 'figura-pie';
      var medidas = (spec.medidas || []).map(function (m) {
        return '<span><strong>' + m[0] + '</strong> ' + m[1] + '</span>';
      }).join('');
      pie.innerHTML =
        '<p class="figura-pie-desc">' + spec.pie + '</p>' +
        (medidas ? '<div class="medidas">' + medidas + '</div>' : '');
      figura.appendChild(pie);
    }

    contenedor.innerHTML = '';
    contenedor.appendChild(figura);

    var estado = {
      api: null,
      tipo: null,
      reducido: prefiereReducido(),
      spec: spec,
      capasOcultas: capasOcultas,
      giro: !prefiereReducido(),
      pasoActual: -1,
      explicando: false
    };

    function pintar2d() {
      estado.tipo = '2d';
      global.Visor2D.render(lienzo, spec, { capasOcultas: estado.capasOcultas });
      aviso.hidden = true;
    }

    function usar2d(motivo) {
      estado.tipo = '2d';
      pintar2d();
      var b = hudTop.querySelector('[data-vista-texto]');
      if (b) b.textContent = '3D';
      var btn = hudTop.querySelector('[data-accion="vista"]');
      if (btn) btn.setAttribute('aria-pressed', 'true');
      var giroBtn = hudTop.querySelector('[data-accion="giro"]');
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
        lienzo.appendChild(aviso);
        try {
          estado.api = new Clase(lienzo, spec, {
            capasOcultas: estado.capasOcultas,
            reducido: estado.reducido
          });
          estado.tipo = '3d';
          estado.api.setAutoGiro(estado.giro && !estado.reducido);
          aviso.hidden = false;
          var btn = hudTop.querySelector('[data-accion="vista"]');
          if (btn) btn.setAttribute('aria-pressed', 'false');
          var vt = hudTop.querySelector('[data-vista-texto]');
          if (vt) vt.textContent = '2D';
          var giroBtn = hudTop.querySelector('[data-accion="giro"]');
          if (giroBtn) giroBtn.hidden = estado.reducido;
          instancias.push(estado);
        } catch (e) {
          console.warn('Error inicializando Visor3D:', e);
          usar2d('error');
        }
      }).catch(function (err) {
        console.warn('Fallback 2D:', err);
        usar2d('error');
      });
    }

    // Arranque 3D por defecto
    if (vistaPreferida() === '2d') {
      usar2d();
      var bt = hudTop.querySelector('[data-accion="vista"]');
      if (bt) bt.setAttribute('aria-pressed', 'true');
    } else {
      usar3d();
    }

    /* ---------- Lógica del Modo Maestro (Paso a Paso) ---------- */
    var panelMM = modoMaestroWrap.querySelector('[data-mm-panel]');
    var btnIniciar = modoMaestroWrap.querySelector('[data-mm-accion="iniciar"]');
    var btnVoz = modoMaestroWrap.querySelector('[data-mm-accion="voz"]');
    var btnAnt = modoMaestroWrap.querySelector('[data-mm-accion="ant"]');
    var btnSig = modoMaestroWrap.querySelector('[data-mm-accion="sig"]');
    var txtPasoNum = modoMaestroWrap.querySelector('[data-mm-paso-num]');
    var barraProg = modoMaestroWrap.querySelector('[data-mm-progreso]');
    var txtTitulo = modoMaestroWrap.querySelector('[data-mm-titulo]');
    var txtExplicacion = modoMaestroWrap.querySelector('[data-mm-texto]');

    function actualizarBotonVoz() {
      var activa = global.Avatar && global.Avatar.getVozHabilitada ? global.Avatar.getVozHabilitada() : true;
      var ico = btnVoz.querySelector('.mm-ico-voz');
      var txt = btnVoz.querySelector('.mm-txt-voz');
      if (ico) ico.textContent = activa ? '🔊' : '🔇';
      if (txt) txt.textContent = activa ? 'Voz ON' : 'Silencio';
      btnVoz.classList.toggle('voz-activa', activa);
    }

    function irAPaso(idx) {
      if (idx < 0 || idx >= pasos.length) return;
      estado.pasoActual = idx;
      var paso = pasos[idx];

      txtPasoNum.textContent = 'Paso ' + (idx + 1);
      barraProg.style.width = (((idx + 1) / pasos.length) * 100) + '%';
      txtTitulo.textContent = paso.titulo;
      txtExplicacion.innerHTML = paso.texto;

      btnAnt.disabled = (idx === 0);
      if (idx === pasos.length - 1) {
        btnSig.innerHTML = '🎉 Finalizar';
        btnSig.classList.add('btn-completado');
      } else {
        btnSig.innerHTML = 'Avanzar ⏭';
        btnSig.classList.remove('btn-completado');
      }

      // Animación en la figura 3D
      if (estado.tipo === '3d' && estado.api) {
        if (paso.camara && estado.api.enfocarCamara) {
          estado.api.enfocarCamara(paso.camara.theta, paso.camara.phi, paso.camara.dist, 750);
        }
        if (paso.capaResaltada && estado.api.resaltarCapa) {
          estado.api.resaltarCapa(paso.capaResaltada, 2400);
        }
      }

      // Locución del Personaje
      if (global.AvatarGuia && global.AvatarGuia.hablar) {
        global.AvatarGuia.hablar(paso.texto, {
          estadoFinal: (idx === pasos.length - 1) ? 'celebra' : 'senala',
          conVoz: true
        });
      } else if (global.Avatar && global.Avatar.hablarVoz) {
        global.Avatar.hablarVoz(paso.texto);
      }

      if (idx === pasos.length - 1 && global.AvatarGuia && global.AvatarGuia.celebracion) {
        setTimeout(function () {
          global.AvatarGuia.celebracion();
        }, 1200);
      }
    }

    btnIniciar.addEventListener('click', function () {
      if (panelMM.hidden) {
        panelMM.hidden = false;
        btnIniciar.classList.add('activo');
        btnIniciar.querySelector('.mm-txt-iniciar').textContent = 'Pausar Explicación';
        btnIniciar.querySelector('.mm-ico').textContent = '⏸';
        estado.explicando = true;
        if (estado.pasoActual < 0) {
          irAPaso(0);
        } else {
          irAPaso(estado.pasoActual);
        }
      } else {
        panelMM.hidden = true;
        btnIniciar.classList.remove('activo');
        btnIniciar.querySelector('.mm-txt-iniciar').textContent = 'Continuar Explicación';
        btnIniciar.querySelector('.mm-ico').textContent = '▶';
        estado.explicando = false;
        if (global.Avatar && global.Avatar.detenerVoz) global.Avatar.detenerVoz();
      }
    });

    btnSig.addEventListener('click', function () {
      if (estado.pasoActual < pasos.length - 1) {
        irAPaso(estado.pasoActual + 1);
      } else {
        irAPaso(0);
      }
    });

    btnAnt.addEventListener('click', function () {
      if (estado.pasoActual > 0) {
        irAPaso(estado.pasoActual - 1);
      }
    });

    btnVoz.addEventListener('click', function () {
      if (global.Avatar && global.Avatar.getVozHabilitada && global.Avatar.setVozHabilitada) {
        var nueva = !global.Avatar.getVozHabilitada();
        global.Avatar.setVozHabilitada(nueva);
        actualizarBotonVoz();
        if (nueva && estado.pasoActual >= 0) {
          global.Avatar.hablarVoz(pasos[estado.pasoActual].texto);
        }
      }
    });

    document.addEventListener('voz-cambiada', actualizarBotonVoz);
    actualizarBotonVoz();

    /* Controles generales del visor */
    hudTop.querySelector('[data-accion="vista"]').addEventListener('click', function () {
      if (estado.tipo === '3d') {
        if (estado.api) { estado.api.destruir(); estado.api = null; }
        usar2d();
        fijarVistaPreferida('2d');
      } else {
        usar3d();
        fijarVistaPreferida('3d');
      }
    });

    hudTop.querySelector('[data-accion="reset"]').addEventListener('click', function () {
      if (estado.tipo === '3d' && estado.api) estado.api.reset();
      else pintar2d();
    });

    hudTop.querySelector('[data-accion="giro"]').addEventListener('click', function () {
      estado.giro = !estado.giro;
      this.setAttribute('aria-pressed', estado.giro ? 'true' : 'false');
      if (estado.api) estado.api.setAutoGiro(estado.giro);
    });

    /* Pausa las figuras fuera de pantalla */
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (!estado.api) return;
          if (e.isIntersecting) estado.api.reanudar();
          else {
            estado.api.pausar();
            if (estado.explicando && global.Avatar && global.Avatar.detenerVoz) {
              global.Avatar.detenerVoz();
            }
          }
        });
      }, { rootMargin: '120px' });
      obs.observe(lienzo);
    }

    window.addEventListener('resize', function () {
      if (estado.tipo !== '2d') return;
      pintar2d();
    });

    document.addEventListener('movimiento-cambiado', function (e) {
      estado.reducido = e.detail.reducido;
      if (estado.api) estado.api.setReducido(estado.reducido);
      if (estado.api && estado.reducido) estado.api.setAutoGiro(false);
    });

    capasBar.querySelectorAll('[data-capa]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-capa');
        var activa = b.getAttribute('aria-pressed') === 'true';
        b.setAttribute('aria-pressed', activa ? 'false' : 'true');
        estado.capasOcultas[id] = activa;
        if (estado.tipo === '3d' && estado.api) estado.api.setCapa(id, !activa);
        else pintar2d();
      });
    });

    return {
      elemento: figura,
      irAPaso: irAPaso,
      obtenerEstado: function () { return estado; }
    };
  }

  global.Visor = {
    montar: montarFigura,
    montarFigura: montarFigura,
    instancias: instancias,
    cargar3d: cargar3d
  };
})(window);
