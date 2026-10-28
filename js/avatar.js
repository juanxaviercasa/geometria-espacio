/* ============================================================
   avatar.js — «Vértiz», profesor virtual y compañero 3D
   ------------------------------------------------------------
   - Ilustración vectorial en viewBox 200x250 con articulaciones
     exactas para cabeza, ojos, boca, brazos y piernas.
   - Motor de voz pedagógico:
     1. Síntesis de voz real en español (Web Speech API) con
        protección contra el recolector de basura de Chromium,
        selección inteligente de voz en español y seguimiento
        de palabras (karaoke) cuando el navegador lo soporta.
     2. Acorde acústico suave al iniciar o celebrar (Web Audio)
        sin pitidos repetitivos que compitan con la voz.
   - Dos modos de montaje:
     - Avatar.crear()     -> tarjeta completa (portada, lección, práctica)
     - Avatar.crearMini() -> escenario compacto integrado junto al visor 3D
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- SVG de Vértiz (viewBox 0 0 200 250) ----------
     Coordenadas de articulación:
     - cabeza:     (100, 88)
     - ojo-izq:    (85, 58)
     - ojo-der:    (115, 58)
     - boca:       (100, 75)
     - brazo-izq:  (72, 102)
     - brazo-der:  (128, 102)
     - pierna-izq: (82, 154)
     - pierna-der: (118, 154)
     - cuerpo:     (100, 228)
     --------------------------------------------------------- */
  var SVG = [
    '<svg class="avatar" viewBox="0 0 200 250" role="img" aria-label="Vértiz, tutor virtual de geometría del espacio">',
    '<defs>',
      '<linearGradient id="vCabello" x1="0%" y1="0%" x2="100%" y2="100%">',
        '<stop offset="0%" stop-color="#1e293b"/>',
        '<stop offset="55%" stop-color="#0f172a"/>',
        '<stop offset="100%" stop-color="#020617"/>',
      '</linearGradient>',
      '<linearGradient id="vChaqueta" x1="0%" y1="0%" x2="100%" y2="100%">',
        '<stop offset="0%" stop-color="#4f46e5"/>',
        '<stop offset="100%" stop-color="#312e81"/>',
      '</linearGradient>',
      '<linearGradient id="vDorado" x1="0%" y1="0%" x2="100%" y2="100%">',
        '<stop offset="0%" stop-color="#fbbf24"/>',
        '<stop offset="100%" stop-color="#d97706"/>',
      '</linearGradient>',
      '<linearGradient id="vPedestal" x1="0%" y1="0%" x2="100%" y2="100%">',
        '<stop offset="0%" stop-color="#4f46e5" stop-opacity="0.28"/>',
        '<stop offset="100%" stop-color="#06b6d4" stop-opacity="0.04"/>',
      '</linearGradient>',
    '</defs>',

    /* Pedestal holográfico */
    '<g class="pedestal-holograma" aria-hidden="true">',
      '<ellipse cx="100" cy="234" rx="62" ry="11" fill="url(#vPedestal)"/>',
      '<ellipse cx="100" cy="234" rx="44" ry="6.5" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.7"/>',
      '<ellipse cx="100" cy="234" rx="26" ry="3.8" fill="#0f172a" opacity="0.22"/>',
    '</g>',

    /* Poliedros flotantes */
    '<g class="adornos" aria-hidden="true">',
      '<g class="adorno adorno-cubo" transform="translate(18 68)">',
        '<polygon points="12,2 24,8 12,14 0,8" fill="#fef3c7" stroke="#d97706" stroke-width="1.4"/>',
        '<polygon points="0,8 12,14 12,28 0,22" fill="#fde68a" stroke="#d97706" stroke-width="1.4"/>',
        '<polygon points="24,8 12,14 12,28 24,22" fill="#f59e0b" stroke="#b45309" stroke-width="1.4"/>',
      '</g>',
      '<g class="adorno adorno-tri" transform="translate(158 54)">',
        '<polygon points="12,0 24,10 12,26 0,10" fill="#cffafe" stroke="#0891b2" stroke-width="1.4"/>',
        '<polyline points="0,10 12,14 24,10" fill="none" stroke="#0891b2" stroke-width="1.2"/>',
        '<line x1="12" y1="0" x2="12" y2="26" stroke="#0891b2" stroke-width="1.2"/>',
      '</g>',
    '</g>',

    '<g class="figura-cuerpo">',
      /* Piernas */
      '<g class="pierna pierna-izq">',
        '<path d="M76 152 L73 206 L66 226 L88 226 L88 152 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.4" stroke-linejoin="round"/>',
        '<path d="M64 220 L90 220 L93 230 L61 230 Z" fill="url(#vDorado)" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/>',
      '</g>',
      '<g class="pierna pierna-der">',
        '<path d="M112 152 L112 226 L134 226 L127 206 L124 152 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.4" stroke-linejoin="round"/>',
        '<path d="M110 220 L136 220 L139 230 L107 230 Z" fill="url(#vDorado)" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/>',
      '</g>',

      /* Torso */
      '<g class="torso">',
        '<path d="M72 96 L100 102 L128 96 L134 156 L66 156 Z" fill="url(#vChaqueta)" stroke="#0f172a" stroke-width="2.8" stroke-linejoin="round"/>',
        '<polygon points="85,98 100,122 115,98 126,96 100,128 74,96" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>',
        '<g transform="translate(100 138) scale(0.82)">',
          '<polygon points="0,-12 10,-4 6,10 -6,10 -10,-4" fill="url(#vDorado)" stroke="#0f172a" stroke-width="2"/>',
          '<circle cx="0" cy="0" r="3" fill="#ffffff"/>',
        '</g>',
      '</g>',

      /* Brazos */
      '<g class="brazo brazo-izq">',
        '<path d="M74 100 Q50 115 54 138 Q58 148 68 144 Q66 126 80 112 Z" fill="#4338ca" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/>',
        '<circle cx="60" cy="142" r="6.8" fill="#fed7aa" stroke="#0f172a" stroke-width="2"/>',
      '</g>',
      '<g class="brazo brazo-der">',
        '<path d="M126 100 Q150 115 146 138 Q142 148 132 144 Q134 126 120 112 Z" fill="#4338ca" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/>',
        '<circle cx="140" cy="142" r="6.8" fill="#fed7aa" stroke="#0f172a" stroke-width="2"/>',
      '</g>',

      /* Cabeza */
      '<g class="cabeza">',
        '<path d="M62 65 C52 35 70 14 100 14 C130 14 148 35 138 65 C146 75 142 90 134 94 C128 98 122 84 122 84 C116 95 84 95 78 84 C78 84 72 98 66 94 C58 90 54 75 62 65 Z" fill="url(#vCabello)" stroke="#0f172a" stroke-width="2.8"/>',
        '<path d="M70 52 C70 38 82 28 100 28 C118 28 130 38 130 52 C130 72 118 88 100 92 C82 88 70 72 70 52 Z" fill="#ffedd5" stroke="#0f172a" stroke-width="2.4"/>',
        '<ellipse cx="68" cy="58" rx="4.5" ry="7" fill="#fed7aa" stroke="#0f172a" stroke-width="2"/>',
        '<ellipse cx="132" cy="58" rx="4.5" ry="7" fill="#fed7aa" stroke="#0f172a" stroke-width="2"/>',
        '<path d="M68 42 Q85 35 98 48 Q105 32 125 38 Q134 44 130 56 Q118 42 108 52 Q92 40 76 52 Z" fill="url(#vCabello)" stroke="#0f172a" stroke-width="2.2"/>',
        '<polygon points="120,24 132,18 128,32" fill="url(#vDorado)" stroke="#0f172a" stroke-width="2"/>',

        /* Ojos */
        '<g class="ojo ojo-izq">',
          '<ellipse cx="85" cy="58" rx="7" ry="9" fill="#0f172a"/>',
          '<ellipse cx="85" cy="59" rx="6" ry="7.5" fill="#4338ca"/>',
          '<ellipse cx="85" cy="61.5" rx="4" ry="4" fill="#6366f1"/>',
          '<circle cx="82.5" cy="54.5" r="2.6" fill="#ffffff"/>',
          '<circle cx="87" cy="62" r="1.3" fill="#ffffff"/>',
          '<path d="M76 46 Q85 41 94 45" fill="none" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round"/>',
        '</g>',
        '<g class="ojo ojo-der">',
          '<ellipse cx="115" cy="58" rx="7" ry="9" fill="#0f172a"/>',
          '<ellipse cx="115" cy="59" rx="6" ry="7.5" fill="#4338ca"/>',
          '<ellipse cx="115" cy="61.5" rx="4" ry="4" fill="#6366f1"/>',
          '<circle cx="112.5" cy="54.5" r="2.6" fill="#ffffff"/>',
          '<circle cx="117" cy="62" r="1.3" fill="#ffffff"/>',
          '<path d="M106 45 Q115 41 124 46" fill="none" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round"/>',
        '</g>',

        /* Mejillas y nariz */
        '<ellipse class="mejilla" cx="76" cy="68" rx="5" ry="2.8" fill="#fb7185" opacity="0.55"/>',
        '<ellipse class="mejilla" cx="124" cy="68" rx="5" ry="2.8" fill="#fb7185" opacity="0.55"/>',
        '<circle cx="100" cy="66" r="1.2" fill="#d97706"/>',

        /* Boca */
        '<path class="boca-linea" d="M94 74 Q100 79 106 74" fill="none" stroke="#991b1b" stroke-width="2.5" stroke-linecap="round"/>',
        '<path class="boca-abierta" d="M93 73 Q100 84 107 73 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.8"/>',
      '</g>',
    '</g>',
    '</svg>'
  ].join('');

  /* ---------- Estado y preferencias de voz ---------- */
  var vozHabilitada = true;
  var velocidadVoz = 1.0;
  try {
    var vGuardada = localStorage.getItem('geo3d.voz.v1');
    if (vGuardada !== null) vozHabilitada = (vGuardada === 'true');
    var velGuardada = parseFloat(localStorage.getItem('geo3d.voz.vel.v1'));
    if (!isNaN(velGuardada) && velGuardada >= 0.75 && velGuardada <= 1.35) {
      velocidadVoz = velGuardada;
    }
  } catch (e) {}

  /* Timbre acústico sutil de inicio de paso (2 notas suaves, no invasivas) */
  function emitirAcordePaso(tipo) {
    if (!vozHabilitada) return;
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._avatarAudioCtx) window._avatarAudioCtx = new AudioCtx();
      var ctx = window._avatarAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      var notas = tipo === 'celebra' ? [523.25, 659.25, 783.99] : [440, 554.37];
      var now = ctx.currentTime;
      notas.forEach(function (frec, idx) {
        var t = now + idx * 0.075;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frec, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.035, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.17);
      });
    } catch (e) {}
  }

  /* Selección priorizada de voz en español */
  var vozEspanol = null;
  function elegirMejorVozEspanol() {
    if (!('speechSynthesis' in window)) return null;
    var voces = window.speechSynthesis.getVoices() || [];
    if (!voces.length) return null;

    var candidatas = voces.filter(function (v) {
      var l = (v.lang || '').toLowerCase();
      return l.indexOf('es') === 0;
    });

    if (!candidatas.length) return null;

    // Priorizar voces naturales / Microsoft / Google en español latino o España
    candidatas.sort(function (a, b) {
      var na = (a.name || '').toLowerCase();
      var nb = (b.name || '').toLowerCase();
      var pa = (na.indexOf('natural') !== -1 || na.indexOf('neural') !== -1 ? 4 : 0) +
               (na.indexOf('google') !== -1 || na.indexOf('sabina') !== -1 || na.indexOf('helena') !== -1 || na.indexOf('elvira') !== -1 || na.indexOf('dalia') !== -1 ? 2 : 0) +
               (a.localService ? 1 : 0);
      var pb = (nb.indexOf('natural') !== -1 || nb.indexOf('neural') !== -1 ? 4 : 0) +
               (nb.indexOf('google') !== -1 || nb.indexOf('sabina') !== -1 || nb.indexOf('helena') !== -1 || nb.indexOf('elvira') !== -1 || nb.indexOf('dalia') !== -1 ? 2 : 0) +
               (b.localService ? 1 : 0);
      return pb - pa;
    });

    return candidatas[0];
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = function () {
      vozEspanol = elegirMejorVozEspanol();
    };
    vozEspanol = elegirMejorVozEspanol();
  }

  function limpiarTextoParaVoz(texto) {
    return String(texto || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&mdash;/g, ', ')
      .replace(/AC₁/g, 'A C sub 1')
      .replace(/AA₁/g, 'A A sub 1')
      .replace(/A₁/g, 'A sub 1')
      .replace(/B₁/g, 'B sub 1')
      .replace(/C₁/g, 'C sub 1')
      .replace(/D₁/g, 'D sub 1')
      .replace(/√\(([^)]+)\)/g, 'raíz cuadrada de $1')
      .replace(/√/g, 'raíz cuadrada de ')
      .replace(/²/g, ' al cuadrado ')
      .replace(/³/g, ' al cubo ')
      .replace(/\^2\b/g, ' al cuadrado ')
      .replace(/\^3\b/g, ' al cubo ')
      .replace(/\bb(?= al cuadrado)/g, 'be')
      .replace(/\bc(?= al cuadrado)/g, 'ce')
      .replace(/\+/g, ' más ')
      .replace(/=/g, ' igual a ')
      .replace(/[×·]/g, ' por ')
      .replace(/π/g, ' pi ')
      .replace(/≠/g, ' distinto de ')
      .replace(/≤/g, ' menor o igual que ')
      .replace(/≥/g, ' mayor o igual que ')
      .replace(/⟂/g, ' perpendicular a ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  var vozSesion = 0;

  function hablarVoz(texto, callbackFin, opciones) {
    var sesion = ++vozSesion;
    opciones = opciones || {};
    if (!vozHabilitada) {
      if (callbackFin) callbackFin();
      return;
    }

    var limpio = limpiarTextoParaVoz(texto);
    if (!limpio) {
      if (callbackFin) callbackFin();
      return;
    }

    var palabras = limpio.split(/\s+/).length;
    var duracionEstimadaMs = Math.max(2000, Math.round((palabras * 260) / velocidadVoz));

    emitirAcordePaso(opciones.tipoAcorde || 'paso');
    document.dispatchEvent(new CustomEvent('avatar-hablando', {
      detail: { activo: true, texto: limpio }
    }));

    var terminado = false;
    var timerSeguridad = null;

    function finalizar() {
      if (terminado || sesion !== vozSesion) return;
      terminado = true;
      if (timerSeguridad) clearTimeout(timerSeguridad);
      window._activeSpeechUtterance = null;
      document.dispatchEvent(new CustomEvent('avatar-hablando', {
        detail: { activo: false }
      }));
      if (callbackFin) callbackFin();
    }

    if ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        setTimeout(function () {
          if (terminado || sesion !== vozSesion || !vozHabilitada) return;
          try {
            var u = new SpeechSynthesisUtterance(limpio);
            window._activeSpeechUtterance = u;

            if (!vozEspanol) vozEspanol = elegirMejorVozEspanol();
            if (vozEspanol) {
              u.voice = vozEspanol;
              u.lang = vozEspanol.lang;
            } else {
              u.lang = 'es-ES';
            }
            u.rate = velocidadVoz;
            u.pitch = 1.04;

            u.onboundary = function (ev) {
              if (sesion === vozSesion && ev.name === 'word') {
                document.dispatchEvent(new CustomEvent('avatar-palabra', {
                  detail: { charIndex: ev.charIndex, charLength: ev.charLength || 0, texto: limpio }
                }));
              }
            };
            u.onend = finalizar;
            u.onerror = finalizar;

            window.speechSynthesis.speak(u);
            // La voz real determina el final; no cortar la animación con una estimación.
          } catch (e) {
            timerSeguridad = setTimeout(finalizar, duracionEstimadaMs);
          }
        }, 50);
      } catch (e) {
        timerSeguridad = setTimeout(finalizar, duracionEstimadaMs);
      }
    } else {
      timerSeguridad = setTimeout(finalizar, duracionEstimadaMs);
    }
  }

  function detenerVoz() {
    vozSesion++;
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    window._activeSpeechUtterance = null;
    document.dispatchEvent(new CustomEvent('avatar-hablando', { detail: { activo: false } }));
  }

  function setVozHabilitada(activa) {
    vozHabilitada = !!activa;
    try { localStorage.setItem('geo3d.voz.v1', String(vozHabilitada)); } catch (e) {}
    if (!vozHabilitada) detenerVoz();
    document.dispatchEvent(new CustomEvent('voz-cambiada', { detail: { activa: vozHabilitada } }));
  }

  function setVelocidadVoz(vel) {
    var v = parseFloat(vel);
    if (isNaN(v)) return;
    velocidadVoz = Math.max(0.75, Math.min(1.35, v));
    try { localStorage.setItem('geo3d.voz.vel.v1', String(velocidadVoz)); } catch (e) {}
  }

  /* ---------- Mensajes y Consejos ---------- */
  var MENSAJES = {
    bienvenida: '¡Hola! Soy Vértiz, tu profesor virtual 3D. En cada figura me verás a tu lado explicando paso a paso con voz y resaltado.',
    leccion: 'Pulsa «Explicar con Vértiz» o «Avanzar» en cualquier figura 3D para recorrer la demostración juntos.',
    practica: 'No adivines: escribe primero qué te piden y qué datos tienes. ¡Así resuelves la mitad!',
    acierto: '¡Brillante! Si logras explicar el porqué de la respuesta, jamás se te olvidará.',
    fallo: 'No pasa nada, equivócate aquí para no fallar en el examen. ¡Mira la pista y prueba otra vez!',
    pista: 'Aquí tienes una pista clave para desbloquear el siguiente paso del cálculo.',
    reto: 'Los retos tipo admisión requieren orden: primero plantea la estrategia y luego calcula.',
    final: '¡Ruta completada! Repasa las figuras y retos cada semana para fijar tu memoria 3D.',
    figura: 'Gira el modelo 3D en 360° o pulsa «Avanzar» para ver cada cara, arista y diagonal destacada.',
    inicio: '¡Bienvenido! Pulsa «Avanzar» junto al prisma 3D de arriba para escuchar mi primera explicación.'
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

  /* ---------- Tarjeta completa del Avatar ---------- */
  function crear(opciones) {
    opciones = opciones || {};
    var estado = ESTADOS.indexOf(opciones.estado) !== -1 ? opciones.estado : 'neutral';
    var mensaje = opciones.mensaje || MENSAJES.bienvenida;
    var firma = opciones.firma || 'Vértiz · Tutor 3D';
    var conBoton = opciones.boton !== false;

    var cont = document.createElement('div');
    cont.className = 'avatar-caja';
    cont.innerHTML =
      '<div class="avatar-columna-figura">' +
        '<div class="avatar-escenario pos-centro">' +
          '<span class="avatar-suelo" aria-hidden="true"></span>' +
          '<span class="avatar-confeti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>' +
          '<div class="avatar-escena estado-' + estado + '">' + SVG + '</div>' +
        '</div>' +
        '<div class="avatar-controles-fila">' +
          '<button type="button" class="btn-avatar-control btn-probar-voz" data-avatar-probar title="Escuchar voz de Vértiz">' +
            '🔊 Probar voz' +
          '</button>' +
          '<button type="button" class="btn-avatar-control btn-toggle-voz ' + (vozHabilitada ? 'voz-on' : 'voz-off') + '" data-avatar-voz title="Activar o silenciar locución">' +
            '<span class="voz-ico">' + (vozHabilitada ? '🎙️ Voz ON' : '🔇 Silencio') + '</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="bocadillo">' +
        '<div class="bocadillo-header">' +
          '<span class="etiqueta-avatar">🗣️ Vértiz explica</span>' +
          '<span class="avatar-ondas-voz" data-avatar-ondas aria-hidden="true">' +
            '<span class="onda-1"></span><span class="onda-2"></span><span class="onda-3"></span><span class="onda-4"></span>' +
          '</span>' +
        '</div>' +
        '<p class="texto-avatar" data-avatar-texto role="status" aria-live="polite">' + mensaje + '</p>' +
        '<div class="bocadillo-pie">' +
          '<span class="firma">' + firma + '</span>' +
          (conBoton ? '<button type="button" class="avatar-otro" data-avatar-otro>💡 Otro consejo</button>' : '') +
        '</div>' +
      '</div>';

    var escenario = cont.querySelector('.avatar-escenario');
    var escena = cont.querySelector('.avatar-escena');
    var texto = cont.querySelector('[data-avatar-texto]');
    var botonOtro = cont.querySelector('[data-avatar-otro]');
    var botonVoz = cont.querySelector('[data-avatar-voz]');
    var botonProbar = cont.querySelector('[data-avatar-probar]');
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
      }, 520);
    }

    function celebracion() {
      escenario.classList.add('fiesta');
      setEstado('celebra');
      emitirAcordePaso('celebra');
      setTimeout(function () {
        escenario.classList.remove('fiesta');
        if (!pausado) setEstado('neutral');
      }, 2200);
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
        }, 2000);
      }
    }

    if (botonOtro) {
      botonOtro.addEventListener('click', function () {
        cont.dispatchEvent(new CustomEvent('avatar-otro', { bubbles: true }));
      });
    }

    if (botonProbar) {
      botonProbar.addEventListener('click', function () {
        if (!vozHabilitada) setVozHabilitada(true);
        hablar('¡Hola! Soy Vértiz. Estoy listo para explicarte cada figura en tres dimensiones paso a paso.', {
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
          hablar('Voz activada. Avanza por los pasos de cualquier figura para escuchar la explicación.', {
            estadoFinal: 'senala'
          });
        }
      });
    }

    function actualizarBotonVoz() {
      if (!botonVoz) return;
      botonVoz.className = 'btn-avatar-control btn-toggle-voz ' + (vozHabilitada ? 'voz-on' : 'voz-off');
      var ico = botonVoz.querySelector('.voz-ico');
      if (ico) ico.textContent = vozHabilitada ? '🎙️ Voz ON' : '🔇 Silencio';
    }

    document.addEventListener('voz-cambiada', actualizarBotonVoz);
    document.addEventListener('avatar-hablando', function (e) {
      var activo = !!(e.detail && e.detail.activo);
      escenario.classList.toggle('hablando', activo);
      cont.classList.toggle('avatar-activo-habla', activo);
      if (activo) {
        setEstado('habla');
      } else if (escena.getAttribute('data-estado') === 'habla') {
        setEstado('senala', 1600);
      }
    });

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

  /* ---------- Escenario compacto de Vértiz junto al visor 3D ---------- */
  function crearMini(opciones) {
    opciones = opciones || {};
    var wrap = document.createElement('div');
    wrap.className = 'vertiz-stage-mini';
    wrap.innerHTML =
      '<div class="avatar-escenario mini-escenario pos-centro">' +
        '<span class="avatar-suelo" aria-hidden="true"></span>' +
        '<span class="avatar-confeti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>' +
        '<div class="avatar-escena estado-senala">' + SVG + '</div>' +
      '</div>';

    var escenario = wrap.querySelector('.avatar-escenario');
    var escena = wrap.querySelector('.avatar-escena');

    function setEstado(nuevo) {
      if (ESTADOS.indexOf(nuevo) === -1) return;
      ESTADOS.forEach(function (e) { escena.classList.remove('estado-' + e); });
      escena.classList.add('estado-' + nuevo);
    }

    function celebrar() {
      escenario.classList.add('fiesta');
      setEstado('celebra');
      setTimeout(function () {
        escenario.classList.remove('fiesta');
        setEstado('senala');
      }, 2000);
    }

    document.addEventListener('avatar-hablando', function (e) {
      var activo = !!(e.detail && e.detail.activo);
      escenario.classList.toggle('hablando', activo);
      setEstado(activo ? 'habla' : 'senala');
    });

    return {
      nodo: wrap,
      setEstado: setEstado,
      celebrar: celebrar
    };
  }

  global.Avatar = {
    crear: crear,
    crearMini: crearMini,
    MENSAJES: MENSAJES,
    TIPS: TIPS,
    ESTADOS: ESTADOS,
    POSICIONES: POSICIONES,
    svg: function () { return SVG; },
    hablarVoz: hablarVoz,
    limpiarTextoParaVoz: limpiarTextoParaVoz,
    detenerVoz: detenerVoz,
    setVozHabilitada: setVozHabilitada,
    getVozHabilitada: function () { return vozHabilitada; },
    setVelocidadVoz: setVelocidadVoz,
    getVelocidadVoz: function () { return velocidadVoz; }
  };
})(window);
