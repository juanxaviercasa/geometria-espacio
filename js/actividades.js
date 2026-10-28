/* ============================================================
   actividades.js — ejercicios y retos interactivos
   ------------------------------------------------------------
   Componentes reutilizados por leccion.html y practica.html.
   Validan cálculos y opciones, ofrecen pistas graduadas,
   retroalimentación explicativa y revelado progresivo de
   soluciones. Registran el resultado en el progreso local.
   ============================================================ */
(function (global) {
  'use strict';

  var P = global.Progreso;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function aNumero(txt) {
    var limpio = String(txt).replace(/\s/g, '').replace(',', '.');
    // Admite fracciones del tipo "7/2" y raíces escritas como "2,5"
    if (/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(limpio)) {
      var partes = limpio.split('/');
      var a = parseFloat(partes[0]), b = parseFloat(partes[1]);
      if (b !== 0) return a / b;
    }
    var n = parseFloat(limpio.replace(/[^\d.\-]/g, ''));
    return isNaN(n) ? NaN : n;
  }

  /* ---------------------------------------------------------
     EJERCICIO
     ej: { id, tipo, dificultad, pregunta, opciones|respuesta,
           unidad, tolerancia, explicacion, pistas }
     --------------------------------------------------------- */
  function crearEjercicio(ej, idx, idLeccion, alCambiar, opciones) {
    opciones = opciones || {};
    var art = document.createElement('article');
    art.className = 'ejercicio';
    art.id = 'ej-' + ej.id;

    var guardado = (P.resumenLeccion(idLeccion) || { ejercicios: {} }).ejercicios[ej.id] || {};
    var pistasUsadas = guardado.pistas || 0;
    var resuelto = !!guardado.ok;

    var procedencia = opciones.mostrarModulo
      ? '<p style="font-size:.74rem;color:var(--ink-3);margin:0 0 .5rem">' +
        'Módulo ' + opciones.mostrarModulo + ' · <a href="leccion.html?id=' + idLeccion + '">' +
        esc(opciones.tituloLeccion || '') + '</a></p>'
      : '';

    var html = '<div class="ejercicio-cabeza">' +
      '<span class="num">' + (idx + 1) + '</span>' +
      '<h3>Ejercicio ' + (idx + 1) + '</h3>' +
      '<span class="dificultad">' + (ej.dificultad || 'Práctica') + '</span>' +
      '</div>' +
      procedencia +
      '<div class="enunciado-ej">' + ej.pregunta + '</div>';

    if (ej.tipo === 'opcion') {
      html += '<div class="opciones" role="radiogroup" aria-label="Opciones del ejercicio ' + (idx + 1) + '">' +
        ej.opciones.map(function (o, i) {
          return '<label class="opcion" data-i="' + i + '">' +
            '<input type="radio" name="op-' + ej.id + '" value="' + i + '">' +
            '<span><span class="letra">' + String.fromCharCode(65 + i) + '</span>' + o.texto + '</span>' +
            '</label>';
        }).join('') + '</div>';
    } else {
      html += '<div class="campo-respuesta">' +
        '<label for="resp-' + ej.id + '">Tu respuesta:</label>' +
        '<input type="text" id="resp-' + ej.id + '" inputmode="decimal" autocomplete="off" ' +
        'placeholder="número" aria-describedby="uni-' + ej.id + '">' +
        (ej.unidad ? '<span class="unidad" id="uni-' + ej.id + '">' + ej.unidad + '</span>' : '') +
        '</div>';
    }

    html += '<div class="acciones-ej">' +
      '<button type="button" class="btn pequeno" data-accion="comprobar">Comprobar</button>' +
      '<button type="button" class="btn secundario pequeno" data-accion="pista">Ver pista</button>' +
      '<button type="button" class="btn secundario pequeno" data-accion="explicacion">Explicación</button>' +
      '</div><div data-zona-feedback></div>';

    art.innerHTML = html;

    var zona = art.querySelector('[data-zona-feedback]');
    var btnPista = art.querySelector('[data-accion="pista"]');
    var btnComp = art.querySelector('[data-accion="comprobar"]');

    function retro(tipo, titulo, cuerpo) {
      var div = document.createElement('div');
      div.className = 'retro ' + tipo;
      div.setAttribute('role', 'status');
      div.innerHTML = '<div class="titulo-retro">' + (tipo === 'ok' ? '✓ ' : '× ') + titulo + '</div>' + cuerpo;
      zona.appendChild(div);
      return div;
    }

    function mostrarPista() {
      var pistas = ej.pistas || [];
      if (!pistas.length || pistasUsadas >= pistas.length) return;
      var caja = zona.querySelector('.pistas');
      if (!caja) {
        caja = document.createElement('div');
        caja.className = 'pistas';
        zona.appendChild(caja);
      }
      var d = document.createElement('div');
      d.className = 'pista';
      d.innerHTML = '<span class="et-pista">Pista ' + (pistasUsadas + 1) + ' de ' + pistas.length + '</span>' +
        pistas[pistasUsadas];
      caja.appendChild(d);
      pistasUsadas++;
      P.registrarEjercicio(idLeccion, ej.id, false, pistasUsadas - 1);
      if (global.AvatarMensaje) global.AvatarMensaje('pista');
      if (pistasUsadas >= pistas.length) {
        btnPista.disabled = true;
        btnPista.textContent = 'Sin más pistas';
      }
    }

    function comprobar() {
      var elegida = art.querySelector('input[type="radio"]:checked');
      var entrada = art.querySelector('input[type="text"]');
      var ok = false;
      var detalle = '';

      if (ej.tipo === 'opcion') {
        if (!elegida) {
          zona.innerHTML = '';
          retro('no', 'Elige una opción',
            '<p>Selecciona la alternativa que consideres correcta antes de comprobar.</p>');
          return;
        }
        var i = parseInt(elegida.value, 10);
        ok = !!ej.opciones[i].correcta;
        art.querySelectorAll('.opcion').forEach(function (lab, k) {
          lab.classList.add('bloqueada');
          lab.querySelector('input').disabled = true;
          if (ej.opciones[k].correcta) lab.classList.add('correcta');
          else if (k === i) lab.classList.add('incorrecta');
        });
      } else {
        var v = entrada ? aNumero(entrada.value) : NaN;
        if (!entrada || entrada.value.trim() === '' || isNaN(v)) {
          zona.innerHTML = '';
          retro('no', 'Falta la respuesta',
            '<p>Escribe un valor numérico antes de comprobar. Puedes usar coma o punto decimal y fracciones como <span class="m">7/2</span>.</p>');
          return;
        }
        var tol = typeof ej.tolerancia === 'number' ? ej.tolerancia : 0.005;
        ok = Math.abs(v - ej.respuesta) <= tol + 1e-9;
        detalle = '<p>Tu respuesta: <span class="m">' + esc(entrada.value) + '</span> ' +
          esc(ej.unidad || '') +
          (ok ? '' : ' · Valor esperado: <span class="m">' + ej.respuesta + '</span> ' + esc(ej.unidad || '')) +
          '</p>';
      }

      zona.innerHTML = '';
      if (ok) {
        retro('ok', 'Correcto', detalle + '<p>' + ej.explicacion + '</p>');
        btnComp.disabled = true;
        btnComp.textContent = 'Resuelto ✓';
        if (global.AvatarMensaje) global.AvatarMensaje('acierto');
      } else {
        retro('no', 'Todavía no', detalle +
          '<p>' + ej.explicacion + '</p>' +
          '<p><em>Si el cálculo no cambió, revisa el planteamiento antes que la aritmética.</em></p>');
        if (global.AvatarMensaje) global.AvatarMensaje('fallo');
      }
      P.registrarEjercicio(idLeccion, ej.id, ok, pistasUsadas);
      if (alCambiar) alCambiar();
    }

    btnComp.addEventListener('click', comprobar);
    btnPista.addEventListener('click', mostrarPista);
    art.querySelector('[data-accion="explicacion"]').addEventListener('click', function () {
      var existente = zona.querySelector('.solucion-detalle');
      if (existente) { existente.remove(); return; }
      var d = document.createElement('div');
      d.className = 'solucion-detalle';
      d.innerHTML = '<p><strong>Razonamiento completo</strong></p><p>' + ej.explicacion + '</p>' +
        ((ej.pistas || []).length
          ? '<p style="font-size:.84rem;color:var(--ink-3)">Hay ' + ej.pistas.length +
            ' pista(s) disponibles si prefieres llegar por tu cuenta.</p>'
          : '');
      zona.appendChild(d);
    });

    if (ej.tipo !== 'opcion') {
      art.querySelector('input[type="text"]').addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); comprobar(); }
      });
    }

    if (resuelto) {
      btnComp.disabled = true;
      btnComp.textContent = 'Resuelto ✓';
      if (ej.tipo === 'opcion') {
        art.querySelectorAll('.opcion').forEach(function (lab) {
          lab.classList.add('bloqueada');
          lab.querySelector('input').disabled = true;
        });
        zona.innerHTML = '<div class="retro ok" role="status">' +
          '<div class="titulo-retro">✓ Ya resuelto</div>' +
          '<p>Marcaste este ejercicio como correcto. Puedes repasar la explicación cuando quieras.</p></div>';
      }
    }
    if ((ej.pistas || []).length && pistasUsadas >= ej.pistas.length) {
      btnPista.disabled = true;
      btnPista.textContent = 'Sin más pistas';
    }

    return art;
  }

  /* ---------------------------------------------------------
     RETO con revelado progresivo
     --------------------------------------------------------- */
  function crearReto(r, idx, idLeccion, alCambiar, opciones) {
    opciones = opciones || {};
    var art = document.createElement('article');
    art.className = 'reto';
    art.id = 'reto-' + r.id;

    var guardado = (P.resumenLeccion(idLeccion) || { retos: {} }).retos[r.id] || { revelado: 0 };
    var fase = guardado.revelado || 0;

    var proc = opciones.mostrarModulo
      ? '<p style="font-size:.74rem;color:var(--ink-3);margin:0 0 .45rem">' +
        'Módulo ' + opciones.mostrarModulo + ' · ' +
        '<a href="leccion.html?id=' + idLeccion + '">' + esc(opciones.tituloLeccion || '') + '</a></p>'
      : '';

    art.innerHTML =
      proc +
      '<div class="reto-cabeza">' +
      '<span class="nivel">' + esc(r.nivel || 'Reto') + '</span>' +
      '<h3>' + r.titulo + '</h3>' +
      '<span class="puntos">' + (r.puntos || 25) + ' pts</span>' +
      '</div>' +
      '<p class="enunciado">' + r.enunciado + '</p>' +
      '<div class="botones-reto">' +
      '<button type="button" class="btn secundario pequeno" data-fase="1">Estrategia</button>' +
      '<button type="button" class="btn secundario pequeno" data-fase="2">Desarrollo</button>' +
      '<button type="button" class="btn secundario pequeno" data-fase="3">Respuesta</button>' +
      '<button type="button" class="btn pequeno" data-accion="resuelto">Lo resolví por mi cuenta</button>' +
      '</div>' +
      '<div class="fase" data-fase-caja="1" hidden><h4>Fase 1 · Estrategia (sin cálculos)</h4><ol>' +
      (r.estrategia || []).map(function (t) { return '<li>' + t + '</li>'; }).join('') +
      '</ol></div>' +
      '<div class="fase" data-fase-caja="2" hidden><h4>Fase 2 · Desarrollo completo</h4><ol>' +
      (r.desarrollo || []).map(function (t) { return '<li>' + t + '</li>'; }).join('') +
      '</ol></div>' +
      '<div class="fase" data-fase-caja="3" hidden><h4>Fase 3 · Respuesta y comentario</h4>' +
      '<div class="respuesta-final">' + r.respuesta + '</div></div>';

    function revelar(n) {
      fase = Math.max(fase, n);
      art.querySelectorAll('[data-fase-caja]').forEach(function (c) {
        if (parseInt(c.getAttribute('data-fase-caja'), 10) <= fase) c.hidden = false;
      });
      art.querySelectorAll('[data-fase]').forEach(function (b) {
        if (parseInt(b.getAttribute('data-fase'), 10) <= fase) b.disabled = true;
      });
      P.registrarReto(idLeccion, r.id, fase, fase >= 3);
      if (global.AvatarMensaje && fase >= 2) global.AvatarMensaje('pista');
      if (alCambiar) alCambiar();
    }

    art.querySelectorAll('[data-fase]').forEach(function (b) {
      b.addEventListener('click', function () {
        revelar(parseInt(b.getAttribute('data-fase'), 10));
      });
    });

    var btnResuelto = art.querySelector('[data-accion="resuelto"]');
    if (guardado.resuelto) {
      btnResuelto.disabled = true;
      btnResuelto.textContent = 'Registrado ✓';
    }
    btnResuelto.addEventListener('click', function () {
      P.registrarReto(idLeccion, r.id, Math.max(fase, 1), true);
      this.disabled = true;
      this.textContent = 'Registrado ✓';
      if (global.AvatarMensaje) global.AvatarMensaje('acierto');
      if (alCambiar) alCambiar();
    });

    if (fase > 0) revelar(fase);
    return art;
  }

  global.Actividades = {
    crearEjercicio: crearEjercicio,
    crearReto: crearReto,
    aNumero: aNumero
  };
})(window);
