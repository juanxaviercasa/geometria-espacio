/* ============================================================
   avatar.js — «Vértiz», personaje guía interactivo y parlante
   ------------------------------------------------------------
   - Sprite original en SVG animado con CSS.
   - Síntesis de voz en español nativa (Web Speech API).
   - Movimiento en escenario, gestos pedagógicos (señala, habla,
     celebra, piensa, camina).
   - Modo interactivo para acompañar al maestro en la explicación.
   ============================================================ */
(function (global) {
  'use strict';

  var SVG = [
    '<svg class="avatar" viewBox="0 0 160 200" role="img" aria-labelledby="av-titulo">',
    '<title id="av-titulo">Vértiz, personaje guía de geometría del espacio</title>',
    '<desc>Personaje de cuerpo entero con cabello oscuro, prendedor triangular naranja, chaqueta azul y zapatos naranjas.</desc>',

    /* Adornos flotantes */
    '<g class="adornos" aria-hidden="true">',
    '<g class="adorno adorno-cubo" transform="translate(24 52)">',
    '<path d="M0 6l9-5 9 5v11l-9 5-9-5z" fill="#e8eafa" stroke="#6f7ed0" stroke-width="1.6"/>',
    '<path d="M0 6l9 5 9-5M9 11v11" stroke="#6f7ed0" stroke-width="1.2" fill="none"/>',
    '</g>',
    '<g class="adorno adorno-tri" transform="translate(128 40)">',
    '<path d="M0 12L9 9l9 3-9 3z" fill="#fdf0e1" stroke="#c8813a" stroke-width="1.6"/>',
    '</g>',
    '<circle class="adorno adorno-punto" cx="136" cy="86" r="3.2" fill="#c9cef0"/>',
    '</g>',

    /* Sombra de contacto */
    '<ellipse class="sombra" cx="80" cy="190" rx="34" ry="6" fill="#131829" opacity=".13"/>',

    '<g class="figura-cuerpo">',

    /* ---- Piernas ---- */
    '<g class="pierna pierna-izq">',
    '<rect x="59" y="124" width="17" height="54" rx="8" fill="#3a4363" stroke="#141a2e" stroke-width="3"/>',
    '<path d="M53 170h29a6 6 0 0 1 6 6v8H47v-8a6 6 0 0 1 6-6z" fill="#e07a2f" stroke="#141a2e" stroke-width="3" stroke-linejoin="round"/>',
    '</g>',
    '<g class="pierna pierna-der">',
    '<rect x="84" y="124" width="17" height="54" rx="8" fill="#3a4363" stroke="#141a2e" stroke-width="3"/>',
    '<path d="M78 170h29a6 6 0 0 1 6 6v8H72v-8a6 6 0 0 1 6-6z" fill="#e07a2f" stroke="#141a2e" stroke-width="3" stroke-linejoin="round"/>',
    '</g>',

    /* ---- Cuello ---- */
    '<rect x="74" y="72" width="12" height="20" rx="5" fill="#f0c39f" stroke="#141a2e" stroke-width="2.8"/>',

    /* ---- Torso: chaqueta azul con cuello blanco ---- */
    '<path d="M80 88c-17 0-28 10-28 23v22c0 6 4 9 10 9h36c6 0 10-3 10-9v-22c0-13-11-23-28-23z" fill="#2c3c9e" stroke="#141a2e" stroke-width="3.2" stroke-linejoin="round"/>',
    '<path d="M96 92c5 5 8 11 8 19v22c0 4-2 6-5 8h-4V92z" fill="#4152cc"/>',
    '<path d="M68 88l12 10 12-10 5 4-17 14-17-14z" fill="#eef1ff" stroke="#141a2e" stroke-width="2.4" stroke-linejoin="round"/>',
    '<g class="insignia" stroke="#eef1ff" stroke-width="2.1" fill="none" stroke-linejoin="round" opacity=".92">',
    '<path d="M80 112l9 5v10l-9 5-9-5v-10z"/>',
    '<path d="M71 117l9 5 9-5M80 122v10"/>',
    '</g>',

    /* ---- Brazos ---- */
    '<g class="brazo brazo-izq">',
    '<path d="M60 94c-10 4-16 10-18 18-1 5 2 9 7 10s9-2 10-7c1-5 3-8 6-11z" fill="#2c3c9e" stroke="#141a2e" stroke-width="3" stroke-linejoin="round"/>',
    '<circle class="mano" cx="45" cy="120" r="7" fill="#f0c39f" stroke="#141a2e" stroke-width="2.8"/>',
    '<path class="dedo" d="M41 116l-3-5" stroke="#141a2e" stroke-width="2.4" stroke-linecap="round"/>',
    '</g>',
    '<g class="brazo brazo-der">',
    '<path d="M100 94c10 4 16 10 18 18 1 5-2 9-7 10s-9-2-10-7c-1-5-3-8-6-11z" fill="#2c3c9e" stroke="#141a2e" stroke-width="3" stroke-linejoin="round"/>',
    '<circle class="mano" cx="115" cy="120" r="7" fill="#f0c39f" stroke="#141a2e" stroke-width="2.8"/>',
    '<path class="dedo" d="M119 116l3-5" stroke="#141a2e" stroke-width="2.4" stroke-linecap="round"/>',
    '</g>',

    /* ---- Cabeza ---- */
    '<g class="cabeza">',
    '<path d="M80 18c-18 0-30 12-30 30 0 19 13 32 30 32s30-13 30-32c0-18-12-30-30-30z" fill="#fbe2cd" stroke="#141a2e" stroke-width="3.2" stroke-linejoin="round"/>',
    '<ellipse cx="50" cy="56" rx="4" ry="6" fill="#f6d3ba" stroke="#141a2e" stroke-width="2.2"/>',
    '<ellipse cx="110" cy="56" rx="4" ry="6" fill="#f6d3ba" stroke="#141a2e" stroke-width="2.2"/>',
    '<path d="M50 48c-3-19 11-30 30-30s33 11 30 30c-3-10-8-16-14-18-5 3-11 5-16 5s-11-2-16-5c-6 2-11 8-14 18z" fill="#232a44" stroke="#141a2e" stroke-width="3" stroke-linejoin="round"/>',
    '<path d="M60 22l-11-11 14 4z" fill="#232a44" stroke="#141a2e" stroke-width="2.6" stroke-linejoin="round"/>',
    '<path d="M100 22l11-11-14 4z" fill="#232a44" stroke="#141a2e" stroke-width="2.6" stroke-linejoin="round"/>',
    '<path d="M92 26l10 5-10 5z" fill="#e07a2f" stroke="#141a2e" stroke-width="2.2" stroke-linejoin="round"/>',
    /* ojos */
    '<g class="ojo">',
    '<ellipse cx="67" cy="56" rx="6.6" ry="8" fill="#fdfdff" stroke="#141a2e" stroke-width="2"/>',
    '<ellipse cx="93" cy="56" rx="6.6" ry="8" fill="#fdfdff" stroke="#141a2e" stroke-width="2"/>',
    '<circle cx="68" cy="57" r="3.9" fill="#1b2033"/>',
    '<circle cx="94" cy="57" r="3.9" fill="#1b2033"/>',
    '<circle cx="69.6" cy="55" r="1.4" fill="#fff"/>',
    '<circle cx="95.6" cy="55" r="1.4" fill="#fff"/>',
    '</g>',
    /* cejas */
    '<path class="ceja" d="M59 45q7-4 13-1" fill="none" stroke="#232a44" stroke-width="2.2" stroke-linecap="round"/>',
    '<path class="ceja" d="M88 44q7-3 13 1" fill="none" stroke="#232a44" stroke-width="2.2" stroke-linecap="round"/>',
    /* mejillas */
    '<ellipse class="mejilla" cx="57" cy="66" rx="4.6" ry="2.8" fill="#e2825f"/>',
    '<ellipse class="mejilla" cx="103" cy="66" rx="4.6" ry="2.8" fill="#e2825f"/>',
    /* boca */
    '<path class="boca-linea" d="M73 68q7 6 14 0" fill="none" stroke="#8c3f2b" stroke-width="2.6" stroke-linecap="round"/>',
    '<ellipse class="boca-abierta" cx="80" cy="70" rx="6" ry="4.6" fill="#8c3f2b"/>',
    '</g>',

    '</g>',
    '</svg>'
  ].join('');

  /* ---------- Síntesis de Voz en Español ---------- */
  var vozHabilitada = true;
  try {
    var vGuardada = localStorage.getItem('geo3d.voz.v1');
    if (vGuardada !== null) vozHabilitada = (vGuardada === 'true');
  } catch (e) {}

  var vozEspanol = null;
  function buscarVoz() {
    if (!('speechSynthesis' in window)) return null;
    var voces = window.speechSynthesis.getVoices();
    for (var i = 0; i < voces.length; i++) {
      var l = (voces[i].lang || '').toLowerCase();
      if (l.indexOf('es') === 0) return voces[i];
    }
    return voces[0] || null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = function () {
      vozEspanol = buscarVoz();
    };
    vozEspanol = buscarVoz();
  }

  function hablarVoz(texto, callbackFin) {
    if (!vozHabilitada || !('speechSynthesis' in window)) {
      if (callbackFin) setTimeout(callbackFin, 1600);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      // Elimina etiquetas HTML y limpia expresiones para lectura fluida
      var limpio = String(texto || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/√/g, 'raíz cuadrada de ')
        .replace(/²/g, ' al cuadrado ')
        .replace(/³/g, ' al cubo ')
        .replace(/·/g, ' por ')
        .replace(/≠/g, ' no es igual a ')
        .replace(/≤/g, ' menor o igual a ')
        .replace(/≥/g, ' mayor o igual a ')
        .replace(/⟂/g, ' perpendicular a ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!limpio) {
        if (callbackFin) callbackFin();
        return;
      }

      var u = new SpeechSynthesisUtterance(limpio);
      if (!vozEspanol) vozEspanol = buscarVoz();
      if (vozEspanol) u.voice = vozEspanol;
      u.lang = (vozEspanol && vozEspanol.lang) || 'es-ES';
      u.rate = 1.0;
      u.pitch = 1.05;

      var terminado = false;
      function terminar() {
        if (terminado) return;
        terminado = true;
        if (callbackFin) callbackFin();
      }

      u.onend = terminar;
      u.onerror = terminar;
      window.speechSynthesis.speak(u);
    } catch (e) {
      if (callbackFin) callbackFin();
    }
  }

  function detenerVoz() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  function setVozHabilitada(activa) {
    vozHabilitada = !!activa;
    try { localStorage.setItem('geo3d.voz.v1', String(vozHabilitada)); } catch (e) {}
    if (!vozHabilitada) detenerVoz();
    document.dispatchEvent(new CustomEvent('voz-cambiada', { detail: { activa: vozHabilitada } }));
  }

  /* ---------- Textos ---------- */
  var MENSAJES = {
    bienvenida: '¡Hola! Soy Vértiz. Te acompaño por la lección: explico en voz alta cada paso, señalo las figuras 3D y te ayudo a entender la geometría.',
    leccion: 'Lee la definición o pulsa Iniciar Explicación en las figuras 3D para que avancemos paso a paso juntos.',
    practica: 'No adivines: escribe primero qué te piden y qué te dan. La mitad del problema se resuelve ahí.',
    acierto: '¡Exacto! Ahora fíjate en el porqué: si puedes explicarlo, no se te olvida.',
    fallo: 'No pasa nada. Mira la explicación, corrige el razonamiento y vuelve a intentarlo: así se aprende.',
    pista: 'Una pista más abajo. Úsala, no es hacer trampa: es el paso intermedio que te falta.',
    reto: 'Los retos son duros a propósito. Pide la estrategia primero, el desarrollo después.',
    final: 'Ruta terminada. Vuelve a los retos en una semana: lo que recuerdes sin mirar es lo que de verdad aprendiste.',
    figura: 'Arrastra la figura 3D para girarla libremente o pulsa Avanzar para ver la explicación paso a paso.',
    inicio: 'Empieza por el módulo 1 aunque creas que lo sabes: la notación se usa en todo lo demás.'
  };

  var TIPS = {
    inicio: 'Empieza por el módulo 1 aunque creas que lo sabes: la notación se usa en todo lo demás.',
    puntos: 'Punto, recta y plano son ideas primitivas: no se definen, se aceptan. Todo lo demás se construye desde ahí.',
    posiciones: 'Dos rectas del espacio pueden no cortarse y no ser paralelas: son alabeadas. Míralas en planos distintos.',
    paralelismo: 'Que una recta sea paralela a una recta del plano no la hace paralela al plano: necesita no cortarlo.',
    perpendicularidad: 'Recta perpendicular a un plano lo corta y es perpendicular a TODA recta del plano. Una sola no basta.',
    angulos: 'El ángulo entre rectas se calcula con vectores directores, no con la inclinación aparente del dibujo.',
    proyecciones: 'La distancia de un punto a un plano se mide sobre la perpendicular; nunca sobre una recta oblicua.',
    triedro: 'En un triedro, cada cara es menor que la suma de las otras dos. Si eso falla, el triedro no existe.',
    prismas: 'Altura no es arista lateral: coinciden solo en el prisma recto. Ahí se pierden muchos puntos.',
    piramides: 'En la pirámide, la apotema de la base no es la altura. Confundirlas cambia el resultado.',
    redondos: 'Radio y diámetro: la fórmula lleva radio. Si te dan el diámetro, divídelo antes de sustituir.',
    regulares: 'Euler manda: caras + vértices − aristas = 2. Sirve para descartar poliedros imposibles.',
    secciones: 'Una sección plana de un prisma es un polígono; sus lados están en las caras, no en el interior.',
    integrador: 'Antes de calcular: nombra los vértices y escribe qué te piden y qué te dan.'
  };

  var ESTADOS = ['neutral', 'camina', 'senala', 'celebra', 'anima', 'piensa', 'habla'];
  var POSICIONES = ['centro', 'izq', 'der'];

  function crear(opciones) {
    opciones = opciones || {};
    var estado = ESTADOS.indexOf(opciones.estado) !== -1 ? opciones.estado : 'neutral';
    var mensaje = opciones.mensaje || '';
    var firma = opciones.firma || 'Vértiz';
    var conBoton = opciones.boton !== false;

    var cont = document.createElement('div');
    cont.className = 'avatar-caja';
    cont.innerHTML =
      '<div class="avatar-escenario pos-centro">' +
        '<span class="avatar-suelo" aria-hidden="true"></span>' +
        '<span class="avatar-confeti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>' +
        '<div class="avatar-escena estado-' + estado + '">' + SVG + '</div>' +
        '<button type="button" class="btn-avatar-voz ' + (vozHabilitada ? 'voz-on' : 'voz-off') + '" data-avatar-voz title="' +
          (vozHabilitada ? 'Silenciar voz del personaje' : 'Activar voz del personaje') + '">' +
          '<span class="voz-ico">' + (vozHabilitada ? '🔊' : '🔇') + '</span>' +
        '</button>' +
      '</div>' +
      (mensaje
        ? '<p class="bocadillo">' +
            '<span class="etiqueta-avatar">Vértiz explica</span>' +
            '<span class="texto-avatar" data-avatar-texto role="status" aria-live="polite">' + mensaje + '</span>' +
            '<span class="firma">' + firma + '</span>' +
            (conBoton ? '<button type="button" class="avatar-otro" data-avatar-otro>Otro consejo</button>' : '') +
          '</p>'
        : '');

    var escenario = cont.querySelector('.avatar-escenario');
    var escena = cont.querySelector('.avatar-escena');
    var texto = cont.querySelector('[data-avatar-texto]');
    var botonOtro = cont.querySelector('[data-avatar-otro]');
    var botonVoz = cont.querySelector('[data-avatar-voz]');
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
      }, 660);
    }

    function celebracion() {
      escenario.classList.add('fiesta');
      setEstado('celebra');
      setTimeout(function () {
        escenario.classList.remove('fiesta');
        if (!pausado) setEstado('neutral');
      }, 1800);
    }

    function hablar(mensajeNuevo, opcionesHabla) {
      opcionesHabla = opcionesHabla || {};
      if (mensajeNuevo) setMensaje(mensajeNuevo);
      setEstado('habla');

      if (opcionesHabla.conVoz !== false) {
        hablarVoz(mensajeNuevo, function () {
          if (!pausado) {
            setEstado(opcionesHabla.estadoFinal || 'senala', 2500);
          }
        });
      } else {
        setTimeout(function () {
          if (!pausado) setEstado(opcionesHabla.estadoFinal || 'neutral', 1500);
        }, 2200);
      }
    }

    if (botonOtro) {
      botonOtro.addEventListener('click', function () {
        cont.dispatchEvent(new CustomEvent('avatar-otro', { bubbles: true }));
      });
    }

    if (botonVoz) {
      botonVoz.addEventListener('click', function (e) {
        e.stopPropagation();
        setVozHabilitada(!vozHabilitada);
        actualizarBotonVoz();
      });
    }

    function actualizarBotonVoz() {
      if (!botonVoz) return;
      botonVoz.className = 'btn-avatar-voz ' + (vozHabilitada ? 'voz-on' : 'voz-off');
      botonVoz.setAttribute('title', vozHabilitada ? 'Silenciar voz del personaje' : 'Activar voz del personaje');
      var ico = botonVoz.querySelector('.voz-ico');
      if (ico) ico.textContent = vozHabilitada ? '🔊' : '🔇';
    }

    document.addEventListener('voz-cambiada', function () {
      actualizarBotonVoz();
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
