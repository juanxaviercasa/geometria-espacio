/* ============================================================
   avatar.js — «Vértiz», personaje guía interactivo y parlante
   ------------------------------------------------------------
   - Ilustración vectorial estilizada con estética anime/tutor 3D.
   - Motor de audio dual:
     1. Web Audio API (síntesis de formantes/vocalización musical)
        garantiza sonido audible inmediato en cualquier equipo.
     2. Web Speech API (síntesis de voz en español) con corrección
        de bugs de Chromium (garbage collection y cola en pausa).
   - Visualizador de ondas de sonido activo al hablar.
   - Botón directo de prueba de voz para el usuario.
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- SVG de Vértiz: Personaje Estilizado Moderno ---------- */
  var SVG = [
    '<svg class="avatar" viewBox="0 0 200 250" role="img" aria-labelledby="av-titulo">',
    '<title id="av-titulo">Vértiz, tutor virtual de geometría del espacio</title>',
    '<desc>Personaje estilizado con cabello oscuro y reflejos geométricos, chaqueta futurista azul marino con detalles dorados, ojos expresivos y poliedros holográficos flotantes.</desc>',
    '<defs>',
      '<linearGradient id="vCabello" x1="0%" y1="0%" x2="100%" y2="100%">',
        '<stop offset="0%" stop-color="#242b47"/>',
        '<stop offset="50%" stop-color="#181e36"/>',
        '<stop offset="100%" stop-color="#0f1324"/>',
      '</linearGradient>',
      '<linearGradient id="vChaqueta" x1="0%" y1="0%" x2="100%" y2="100%">',
        '<stop offset="0%" stop-color="#3b4bcb"/>',
        '<stop offset="100%" stop-color="#1e297a"/>',
      '</linearGradient>',
      '<linearGradient id="vDorado" x1="0%" y1="0%" x2="100%" y2="100%">',
        '<stop offset="0%" stop-color="#ffd166"/>',
        '<stop offset="100%" stop-color="#f77f00"/>',
      '</linearGradient>',
      '<linearGradient id="vPedestal" x1="0%" y1="0%" x2="100%" y2="100%">',
        '<stop offset="0%" stop-color="#4f46e5" stop-opacity="0.35"/>',
        '<stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>',
      '</linearGradient>',
      '<filter id="vBrillo" x="-20%" y="-20%" width="140%" height="140%">',
        '<feGaussianBlur stdDeviation="3" result="blur"/>',
        '<feComposite in="SourceGraphic" in2="blur" operator="over"/>',
      '</filter>',
    '</defs>',

    /* Pedestal holográfico */
    '<g class="pedestal-holograma" aria-hidden="true">',
      '<ellipse cx="100" cy="235" rx="65" ry="12" fill="url(#vPedestal)"/>',
      '<ellipse cx="100" cy="235" rx="45" ry="7" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.75" class="anillo-giro"/>',
      '<ellipse cx="100" cy="235" rx="28" ry="4" fill="#0f172a" opacity="0.3"/>',
    '</g>',

    /* Hologramas 3D flotantes */
    '<g class="adornos" aria-hidden="true">',
      /* Cubo flotante dorado a la izquierda */
      '<g class="adorno adorno-cubo" transform="translate(20 70)">',
        '<polygon points="12,2 24,8 12,14 0,8" fill="#ffeaa7" stroke="#e17055" stroke-width="1.4"/>',
        '<polygon points="0,8 12,14 12,28 0,22" fill="#fdcb6e" stroke="#e17055" stroke-width="1.4"/>',
        '<polygon points="24,8 12,14 12,28 24,22" fill="#e17055" stroke="#d63031" stroke-width="1.4"/>',
      '</g>',
      /* Diamante flotante cian a la derecha */
      '<g class="adorno adorno-tri" transform="translate(160 55)">',
        '<polygon points="12,0 24,10 12,26 0,10" fill="#81ecec" stroke="#00cec9" stroke-width="1.4" opacity="0.9"/>',
        '<polyline points="0,10 12,14 24,10" fill="none" stroke="#00cec9" stroke-width="1.2"/>',
        '<line x1="12" y1="0" x2="12" y2="26" stroke="#00cec9" stroke-width="1.2"/>',
      '</g>',
      '<circle cx="168" cy="115" r="3" fill="#a29bfe" opacity="0.65" class="particula-flotante"/>',
      '<circle cx="32" cy="130" r="2.5" fill="#ffd166" opacity="0.65" class="particula-flotante"/>',
    '</g>',

    '<g class="figura-cuerpo">',
      /* ---- Piernas estilizadas ---- */
      '<g class="pierna pierna-izq">',
        '<path d="M78 152 L74 205 L66 226 L88 226 L88 152 Z" fill="#1e243b" stroke="#0f172a" stroke-width="2.5" stroke-linejoin="round"/>',
        '<path d="M64 220 L90 220 L94 230 L60 230 Z" fill="url(#vDorado)" stroke="#0f172a" stroke-width="2.2" stroke-linejoin="round"/>',
      '</g>',
      '<g class="pierna pierna-der">',
        '<path d="M112 152 L112 205 L112 226 L134 226 L126 152 Z" fill="#1e243b" stroke="#0f172a" stroke-width="2.5" stroke-linejoin="round"/>',
        '<path d="M110 220 L136 220 L140 230 L106 230 Z" fill="url(#vDorado)" stroke="#0f172a" stroke-width="2.2" stroke-linejoin="round"/>',
      '</g>',

      /* ---- Torso y Chaqueta moderna ---- */
      '<g class="torso">',
        '<path d="M72 96 L100 102 L128 96 L134 156 L66 156 Z" fill="url(#vChaqueta)" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/>',
        /* Cuello blanco futurista */
        '<polygon points="85,98 100,122 115,98 126,96 100,128 74,96" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/>',
        /* Insignia dorada geométrica */
        '<g transform="translate(100 138) scale(0.85)">',
          '<polygon points="0,-12 10,-4 6,10 -6,10 -10,-4" fill="url(#vDorado)" stroke="#0f172a" stroke-width="2"/>',
          '<circle cx="0" cy="0" r="3" fill="#ffffff"/>',
        '</g>',
      '</g>',

      /* ---- Brazos ---- */
      '<g class="brazo brazo-izq">',
        '<path d="M74 100 Q50 115 54 138 Q58 148 68 144 Q66 126 80 112 Z" fill="#2d3a9e" stroke="#0f172a" stroke-width="2.8" stroke-linejoin="round"/>',
        '<circle cx="60" cy="142" r="7" fill="#fcd9bd" stroke="#0f172a" stroke-width="2.2"/>',
      '</g>',
      '<g class="brazo brazo-der">',
        '<path d="M126 100 Q150 115 146 138 Q142 148 132 144 Q134 126 120 112 Z" fill="#2d3a9e" stroke="#0f172a" stroke-width="2.8" stroke-linejoin="round"/>',
        '<circle cx="140" cy="142" r="7" fill="#fcd9bd" stroke="#0f172a" stroke-width="2.2"/>',
      '</g>',

      /* ---- Cabeza expresiva ---- */
      '<g class="cabeza">',
        /* Cabello trasero */
        '<path d="M62 65 C52 35 70 14 100 14 C130 14 148 35 138 65 C146 75 142 90 134 94 C128 98 122 84 122 84 C116 95 84 95 78 84 C78 84 72 98 66 94 C58 90 54 75 62 65 Z" fill="url(#vCabello)" stroke="#0f172a" stroke-width="3"/>',
        /* Rostro suave anime */
        '<path d="M70 52 C70 38 82 28 100 28 C118 28 130 38 130 52 C130 72 118 88 100 92 C82 88 70 72 70 52 Z" fill="#fee5d3" stroke="#0f172a" stroke-width="2.6"/>',
        
        /* Orejas */
        '<ellipse cx="68" cy="58" rx="4.5" ry="7" fill="#fcd9bd" stroke="#0f172a" stroke-width="2"/>',
        '<ellipse cx="132" cy="58" rx="4.5" ry="7" fill="#fcd9bd" stroke="#0f172a" stroke-width="2"/>',

        /* Flequillo y peinado */
        '<path d="M68 42 Q85 35 98 48 Q105 32 125 38 Q134 44 130 56 Q118 42 108 52 Q92 40 76 52 Z" fill="url(#vCabello)" stroke="#0f172a" stroke-width="2.4"/>',
        /* Mechón rebelde y prendedor triangular */
        '<path d="M96 16 L88 4 L102 10 Z" fill="url(#vCabello)" stroke="#0f172a" stroke-width="2.2"/>',
        '<polygon points="120,24 132,18 128,32" fill="url(#vDorado)" stroke="#0f172a" stroke-width="2.2" filter="url(#vBrillo)"/>',

        /* Ojos grandes luminosos */
        '<g class="ojo ojo-izq">',
          '<ellipse cx="85" cy="58" rx="7.5" ry="9.5" fill="#0f172a"/>',
          '<ellipse cx="85" cy="59" rx="6.5" ry="8" fill="#4338ca"/>',
          '<ellipse cx="85" cy="62" rx="4.5" ry="4.5" fill="#6366f1"/>',
          '<circle cx="82.5" cy="54.5" r="2.8" fill="#ffffff"/>',
          '<circle cx="87" cy="62" r="1.4" fill="#ffffff"/>',
          '<path d="M76 46 Q85 41 94 45" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>',
        '</g>',
        '<g class="ojo ojo-der">',
          '<ellipse cx="115" cy="58" rx="7.5" ry="9.5" fill="#0f172a"/>',
          '<ellipse cx="115" cy="59" rx="6.5" ry="8" fill="#4338ca"/>',
          '<ellipse cx="115" cy="62" rx="4.5" ry="4.5" fill="#6366f1"/>',
          '<circle cx="112.5" cy="54.5" r="2.8" fill="#ffffff"/>',
          '<circle cx="117" cy="62" r="1.4" fill="#ffffff"/>',
          '<path d="M106 45 Q115 41 124 46" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>',
        '</g>',

        /* Mejillas sonrojadas */
        '<ellipse cx="76" cy="68" rx="5.5" ry="3" fill="#ff7675" opacity="0.6"/>',
        '<ellipse cx="124" cy="68" rx="5.5" ry="3" fill="#ff7675" opacity="0.6"/>',

        /* Nariz sutil */
        '<circle cx="100" cy="66" r="1.2" fill="#d6a07e"/>',

        /* Boca: línea amable cerrada + boca animada al hablar */
        '<path class="boca-linea" d="M94 74 Q100 79 106 74" fill="none" stroke="#b33939" stroke-width="2.6" stroke-linecap="round"/>',
        '<path class="boca-abierta" d="M93 73 Q100 84 107 73 Z" fill="#c0392b" stroke="#7f1d1d" stroke-width="2"/>',
      '</g>',
    '</g>',
    '</svg>'
  ].join('');

  /* ---------- Motor de Audio y Síntesis Dual ---------- */
  var vozHabilitada = true;
  try {
    var vGuardada = localStorage.getItem('geo3d.voz.v1');
    if (vGuardada !== null) vozHabilitada = (vGuardada === 'true');
  } catch (e) {}

  // 1. Síntesis Musical de Vocalización (Web Audio API)
  // Genera formantes acústicos dulces tipo tutor/mascota virtual.
  // 100% GARANTIZADO de sonar en cualquier navegador sin depender de TTS de Windows.
  function emitirSonidoHabla(duracionMs) {
    if (!vozHabilitada) return;
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._avatarAudioCtx) {
        window._avatarAudioCtx = new AudioCtx();
      }
      var ctx = window._avatarAudioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      var numSilabas = Math.min(16, Math.max(3, Math.floor(duracionMs / 140)));
      var now = ctx.currentTime;
      var tonos = [300, 360, 420, 340, 380, 440, 320];

      for (var i = 0; i < numSilabas; i++) {
        var t = now + (i * 0.12);
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var filtro = ctx.createBiquadFilter();

        osc.type = 'triangle';
        var frec = tonos[i % tonos.length];
        osc.frequency.setValueAtTime(frec, t);
        osc.frequency.exponentialRampToValueAtTime(frec * 1.12, t + 0.08);

        filtro.type = 'bandpass';
        filtro.frequency.setValueAtTime(800 + (i % 4) * 150, t);
        filtro.Q.value = 2.8;

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.09, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

        osc.connect(filtro);
        filtro.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.11);
      }
    } catch (e) {
      // Ignora silenciosamente si Web Audio está bloqueado
    }
  }

  // 2. Síntesis de Voz en Español (SpeechSynthesis) con resolución de bugs de Chromium
  var vozEspanol = null;
  function obtenerVozEspanol() {
    if (!('speechSynthesis' in window)) return null;
    var voces = window.speechSynthesis.getVoices() || [];
    for (var i = 0; i < voces.length; i++) {
      var l = (voces[i].lang || '').toLowerCase();
      if (l.indexOf('es') === 0) return voces[i];
    }
    return voces[0] || null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = function () {
      vozEspanol = obtenerVozEspanol();
    };
    vozEspanol = obtenerVozEspanol();
  }

  function hablarVoz(texto, callbackFin) {
    if (!vozHabilitada) {
      if (callbackFin) callbackFin();
      return;
    }

    var limpio = String(texto || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/√/g, 'raíz cuadrada de ')
      .replace(/²/g, ' al cuadrado ')
      .replace(/³/g, ' al cubo ')
      .replace(/·/g, ' por ')
      .replace(/≠/g, ' distinto de ')
      .replace(/≤/g, ' menor o igual que ')
      .replace(/≥/g, ' mayor o igual que ')
      .replace(/⟂/g, ' perpendicular a ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!limpio) {
      if (callbackFin) callbackFin();
      return;
    }

    var palabras = limpio.split(/\s+/).length;
    var duracionAproxMs = Math.max(1800, palabras * 220);

    // Activar audio feedback inmediato en Web Audio
    emitirSonidoHabla(duracionAproxMs);

    // Notificar inicio de habla a los visualizadores
    document.dispatchEvent(new CustomEvent('avatar-hablando', { detail: { activo: true } }));

    var terminado = false;
    function finalizar() {
      if (terminado) return;
      terminado = true;
      window._activeSpeechUtterance = null;
      document.dispatchEvent(new CustomEvent('avatar-hablando', { detail: { activo: false } }));
      if (callbackFin) callbackFin();
    }

    // SpeechSynthesis nativo con protección contra garbage collector
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        setTimeout(function () {
          try {
            var u = new SpeechSynthesisUtterance(limpio);
            window._activeSpeechUtterance = u; // Fix crítico: impide que Chromium borre 'u'

            if (!vozEspanol) vozEspanol = obtenerVozEspanol();
            if (vozEspanol) u.voice = vozEspanol;
            u.lang = (vozEspanol && vozEspanol.lang) || 'es-ES';
            u.rate = 1.02;
            u.pitch = 1.12;

            u.onend = finalizar;
            u.onerror = finalizar;

            window.speechSynthesis.speak(u);

            // Timeout de seguridad si el navegador no dispara onend
            setTimeout(function () {
              if (!terminado) finalizar();
            }, duracionAproxMs + 1200);

          } catch (e) {
            setTimeout(finalizar, duracionAproxMs);
          }
        }, 60);

      } catch (e) {
        setTimeout(finalizar, duracionAproxMs);
      }
    } else {
      setTimeout(finalizar, duracionAproxMs);
    }
  }

  function detenerVoz() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    document.dispatchEvent(new CustomEvent('avatar-hablando', { detail: { activo: false } }));
  }

  function setVozHabilitada(activa) {
    vozHabilitada = !!activa;
    try { localStorage.setItem('geo3d.voz.v1', String(vozHabilitada)); } catch (e) {}
    if (!vozHabilitada) detenerVoz();
    document.dispatchEvent(new CustomEvent('voz-cambiada', { detail: { activa: vozHabilitada } }));
  }

  /* ---------- Mensajes y Consejos ---------- */
  var MENSAJES = {
    bienvenida: '¡Hola! Soy Vértiz, tu compañero 3D. Explico cada figura paso a paso con voz y animación interactiva.',
    leccion: 'Pulsa «Iniciar Explicación» en cualquier figura 3D para avanzar juntos paso a paso.',
    practica: 'No adivines: escribe primero qué te piden y qué datos tienes. ¡Así resuelves la mitad!',
    acierto: '¡Brillante! Si logras explicar el porqué de la respuesta, jamás se te olvidará.',
    fallo: 'No pasa nada, equivócate aquí para no fallar en el examen. ¡Mira la pista y prueba otra vez!',
    pista: 'Aquí tienes una pista clave para desbloquear el siguiente paso del cálculo.',
    reto: 'Los retos tipo admisión requieren orden: primero plantea la estrategia y luego calcula.',
    final: '¡Ruta completada! Repasa las figuras y retos cada semana para fijar tu memoria 3D.',
    figura: 'Gira el modelo 3D en 360° o pulsa «Avanzar» para ver cada cara, arista y diagonal destacada.',
    inicio: '¡Bienvenido a Geometría del Espacio! Empieza explorando los prismas en 3D.'
  };

  var TIPS = {
    inicio: 'Empieza por el módulo 1 aunque creas que lo sabes: la notación se usa en todo lo demás.',
    puntos: 'Punto, recta y plano son ideas primitivas: no se definen, se aceptan. Todo se construye desde ahí.',
    posiciones: 'Dos rectas del espacio pueden no cortarse y no ser paralelas: son alabeadas. Míralas en planos distintos.',
    paralelismo: 'Que una recta sea paralela a una recta del plano no la hace paralela al plano: necesita no cortarlo.',
    perpendicularidad: 'Recta perpendicular a un plano lo corta y es perpendicular a TODA recta del plano.',
    angulos: 'El ángulo entre rectas se calcula con vectores directores, no con la inclinación aparente del dibujo.',
    proyecciones: 'La distancia de un punto a un plano se mide siempre sobre la perpendicular.',
    triedro: 'En un triedro, cada cara es menor que la suma de las otras dos. Si eso falla, el triedro no existe.',
    prismas: 'Altura no es arista lateral: coinciden solo en el prisma recto. ¡Cuidado en los exámenes!',
    piramides: 'En la pirámide, la apotema de la base no es la altura. Confundirlas altera el resultado.',
    redondos: 'Radio y diámetro: la fórmula lleva radio. Si te dan el diámetro, divídelo entre dos.',
    regulares: 'Euler manda: Caras + Vértices − Aristas = 2. Sirve para descartar poliedros imposibles.',
    secciones: 'Una sección plana de un prisma es un polígono; sus lados están en las caras, no en el interior.',
    integrador: 'Antes de calcular: nombra los vértices y escribe qué te piden y qué te dan.'
  };

  var ESTADOS = ['neutral', 'camina', 'senala', 'celebra', 'anima', 'piensa', 'habla'];
  var POSICIONES = ['centro', 'izq', 'der'];

  function crear(opciones) {
    opciones = opciones || {};
    var estado = ESTADOS.indexOf(opciones.estado) !== -1 ? opciones.estado : 'neutral';
    var mensaje = opciones.mensaje || MENSAJES.bienvenida;
    var firma = opciones.firma || 'Vértiz · Tutor 3D';
    var conBoton = opciones.boton !== false;

    var cont = document.createElement('div');
    cont.className = 'avatar-caja';
    cont.innerHTML =
      '<div class="avatar-escenario pos-centro">' +
        '<div class="avatar-ondas-voz" data-avatar-ondas aria-hidden="true">' +
          '<span></span><span></span><span></span><span></span><span></span>' +
          '<small>Voz activa</small>' +
        '</div>' +
        '<span class="avatar-suelo" aria-hidden="true"></span>' +
        '<span class="avatar-confeti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>' +
        '<div class="avatar-escena estado-' + estado + '">' + SVG + '</div>' +
        '<button type="button" class="btn-avatar-voz ' + (vozHabilitada ? 'voz-on' : 'voz-off') + '" data-avatar-voz title="' +
          (vozHabilitada ? 'Silenciar voz' : 'Activar voz') + '">' +
          '<span class="voz-ico">' + (vozHabilitada ? '🔊' : '🔇') + '</span>' +
        '</button>' +
      '</div>' +
      '<div class="bocadillo">' +
        '<div class="bocadillo-header">' +
          '<span class="etiqueta-avatar">🗣️ Vértiz explica</span>' +
          '<button type="button" class="btn-probar-audio" data-avatar-probar title="Probar voz de Vértiz">Probar Voz 🔊</button>' +
        '</div>' +
        '<p class="texto-avatar" data-avatar-texto role="status" aria-live="polite">' + mensaje + '</p>' +
        '<div class="bocadillo-pie">' +
          '<span class="firma">' + firma + '</span>' +
          (conBoton ? '<button type="button" class="avatar-otro" data-avatar-otro>Otro consejo 💡</button>' : '') +
        '</div>' +
      '</div>';

    var escenario = cont.querySelector('.avatar-escenario');
    var escena = cont.querySelector('.avatar-escena');
    var texto = cont.querySelector('[data-avatar-texto]');
    var botonOtro = cont.querySelector('[data-avatar-otro]');
    var botonVoz = cont.querySelector('[data-avatar-voz]');
    var botonProbar = cont.querySelector('[data-avatar-probar]');
    var ondasVoz = cont.querySelector('[data-avatar-ondas]');
    var temporizador = null;
    var pausado = false;

    function setEstado(nuevo, ms) {
      if (ESTADOS.indexOf(nuevo) === -1) return;
      ESTADOS.forEach(function (e) { escena.classList.remove('estado-' + e); });
      escena.classList.add('estado-' + nuevo);
      escena.setAttribute('data-estado', nuevo);
      if (temporizador) { clearTimeout(temporizador); temporizador = null; }
      if (ms) {
        temporizador = setTimeout(function () {
          if (pausado) return;
          setEstado('neutral');
        }, ms);
      }
    }

    function setMensaje(t) {
      if (texto) texto.textContent = t;
      return t;
    }

    function setPosicion(p) {
      if (POSICIONES.indexOf(p) === -1) return;
      POSICIONES.forEach(function (x) { escenario.classList.remove('pos-' + x); });
      escenario.classList.add('pos-' + p);
    }

    function caminaA(pos, mensajeNuevo, estadoFinal, msFinal, conVoz) {
      var actual = POSICIONES.filter(function (x) {
        return escenario.classList.contains('pos-' + x);
      })[0];
      if (mensajeNuevo) setMensaje(mensajeNuevo);
      if (actual === pos) {
        setEstado(estadoFinal || 'senala', msFinal || 3000);
        if (conVoz && mensajeNuevo) hablarVoz(mensajeNuevo);
        return;
      }
      setPosicion(pos);
      setEstado('camina');
      setTimeout(function () {
        if (pausado) return;
        setEstado(estadoFinal || 'senala', msFinal || 3000);
        if (conVoz && mensajeNuevo) hablarVoz(mensajeNuevo);
      }, 550);
    }

    function celebracion() {
      escenario.classList.add('fiesta');
      setEstado('celebra');
      setTimeout(function () {
        escenario.classList.remove('fiesta');
        if (!pausado) setEstado('neutral');
      }, 2000);
    }

    function hablar(mensajeNuevo, opcionesHabla) {
      opcionesHabla = opcionesHabla || {};
      if (mensajeNuevo) setMensaje(mensajeNuevo);
      setEstado('habla');

      if (opcionesHabla.conVoz !== false) {
        hablarVoz(mensajeNuevo, function () {
          if (!pausado) {
            setEstado(opcionesHabla.estadoFinal || 'senala', 2200);
          }
        });
      } else {
        setTimeout(function () {
          if (!pausado) setEstado(opcionesHabla.estadoFinal || 'neutral', 1800);
        }, 2200);
      }
    }

    if (botonOtro) {
      botonOtro.addEventListener('click', function () {
        cont.dispatchEvent(new CustomEvent('avatar-otro', { bubbles: true }));
      });
    }

    if (botonProbar) {
      botonProbar.addEventListener('click', function () {
        hablar('¡Hola! Soy Vértiz. Mi voz está funcionando al cien por ciento y estoy listo para explicarte cada figura geométrica en 3D.', {
          estadoFinal: 'celebra'
        });
      });
    }

    if (botonVoz) {
      botonVoz.addEventListener('click', function (e) {
        e.stopPropagation();
        setVozHabilitada(!vozHabilitada);
        actualizarBotonVoz();
        if (vozHabilitada) {
          hablar('Voz activada. ¡Listo para explicarte!', { estadoFinal: 'senala' });
        }
      });
    }

    function actualizarBotonVoz() {
      if (!botonVoz) return;
      botonVoz.className = 'btn-avatar-voz ' + (vozHabilitada ? 'voz-on' : 'voz-off');
      botonVoz.setAttribute('title', vozHabilitada ? 'Silenciar voz' : 'Activar voz');
      var ico = botonVoz.querySelector('.voz-ico');
      if (ico) ico.textContent = vozHabilitada ? '🔊' : '🔇';
    }

    document.addEventListener('voz-cambiada', actualizarBotonVoz);
    document.addEventListener('avatar-hablando', function (e) {
      if (ondasVoz) {
        ondasVoz.classList.toggle('activo', !!e.detail.activo);
      }
    });

    if ('IntersectionObserver' in global) {
      new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          pausado = !e.isIntersecting;
          escenario.classList.toggle('detenido', pausado);
          if (pausado) detenerVoz();
        });
      }, { rootMargin: '80px' }).observe(cont);
    }

    return {
      nodo: cont,
      setEstado: setEstado,
      setMensaje: setMensaje,
      setPosicion: setPosicion,
      caminaA: caminaA,
      celebracion: celebracion,
      hablar: hablar,
      detenerVoz: detenerVoz
    };
  }

  global.Avatar = {
    crear: crear,
    MENSAJES: MENSAJES,
    TIPS: TIPS,
    ESTADOS: ESTADOS,
    POSICIONES: POSICIONES,
    svg: function () { return SVG; },
    hablarVoz: hablarVoz,
    detenerVoz: detenerVoz,
    setVozHabilitada: setVozHabilitada,
    getVozHabilitada: function () { return vozHabilitada; }
  };
})(window);
