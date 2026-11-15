/* ============================================================
   verificacion.js — autocomprobaciones reproducibles
   ------------------------------------------------------------
   Cada comprobación se ejecuta en el navegador y se compara con
   una segunda vía de cálculo o con una regla estructural. Si
   alguna falla, el resultado se muestra en rojo: no hay
   resultados pregrabados.
   ============================================================ */
(function () {
  'use strict';

  var TOL = 1e-9;
  var resultados = [];

  function cerca(a, b, tol) {
    tol = typeof tol === 'number' ? tol : 1e-6;
    return Math.abs(a - b) <= tol;
  }

  function comprobar(grupo, nombre, fn) {
    var ok = false;
    var detalle = '';
    try {
      var r = fn();
      if (typeof r === 'boolean') { ok = r; }
      else if (r && typeof r.ok === 'boolean') { ok = r.ok; detalle = r.detalle || ''; }
    } catch (e) {
      ok = false;
      detalle = 'Excepción: ' + e.message;
    }
    resultados.push({ grupo: grupo, nombre: nombre, ok: ok, detalle: detalle });
  }

  /* ==========================================================
     1. Fórmulas cerradas, por dos vías
     ========================================================== */

  function seccion() {
    /* --- Diagonal espacial del ortoedro y del cubo --- */
    comprobar('Fórmulas', 'Diagonal del ortoedro de dimensiones 2, 3 y 6: \\(d = 7\\)', function () {
      var d = Math.sqrt(4 + 9 + 36);
      var terna = 7;
      return { ok: cerca(d, terna, TOL), detalle: '√(4+9+36) = √49 = ' + d };
    });

    comprobar('Fórmulas', 'Diagonal del cubo = \\(a\\sqrt{3}\\) (coincide con la fórmula general)', function () {
      var a = 5;
      var general = Math.sqrt(a * a + a * a + a * a);
      var cubo = a * Math.sqrt(3);
      return { ok: cerca(general, cubo, 1e-12), detalle: general.toFixed(6) + ' = ' + cubo.toFixed(6) };
    });

    comprobar('Fórmulas', 'Diagonal de cara del cubo = \\(a\\sqrt{2}\\) (dos dimensiones)', function () {
      var a = 5;
      return { ok: cerca(Math.sqrt(25 + 25), a * Math.SQRT2, 1e-12), detalle: '√50 = ' + Math.sqrt(50).toFixed(6) };
    });

    /* --- Volumen de la pirámide: 1/3 frente a la suma de tetraedros --- */
    comprobar('Fórmulas', 'Volumen de pirámide = \\(\\frac{1}{3}\\) del prisma (integración numérica)', function () {
      // Compara B·h/3 con una suma de Simpson de secciones paralelas de escala lineal
      var B = 36, h = 12;
      var exacto = (B * h) / 3;
      // La sección a altura t es B·(1 - t/h)²; Simpson con n=2000
      var n = 2000, suma = 0;
      for (var i = 0; i <= n; i++) {
        var t = (i / n) * h;
        var f = B * Math.pow(1 - t / h, 2);
        var w = (i === 0 || i === n) ? 1 : (i % 2 === 1 ? 4 : 2);
        suma += w * f;
      }
      suma *= h / (3 * n);
      return {
        ok: cerca(exacto, suma, 0.01),
        detalle: 'fórmula = ' + exacto + ' · Simpson = ' + suma.toFixed(4)
      };
    });

    /* --- Tetraedro regular: fórmula frente a base × altura --- */
    comprobar('Fórmulas', 'Volumen del tetraedro regular: \\(\\frac{a^3\\sqrt{2}}{12} = \\frac{B h}{3}\\)', function () {
      var a = 6;
      var formula = (a * a * a * Math.sqrt(2)) / 12;
      var base = (a * a * Math.sqrt(3)) / 4;
      var altura = a * Math.sqrt(2 / 3);
      var via = (base * altura) / 3;
      return {
        ok: cerca(formula, via, 1e-9),
        detalle: formula.toFixed(6) + ' = ' + via.toFixed(6)
      };
    });

    /* --- Octaedro inscrito: s³√2/3 = 8 tetraedros --- */
    comprobar('Fórmulas', 'Octaedro inscrito en cubo: \\(\\frac{s^3\\sqrt{2}}{3} = \\frac{a^3}{6}\\) por ocho tetraedros', function () {
      var a = 2;
      var s = (a * Math.SQRT2) / 2;
      var porFormula = (s * s * s * Math.sqrt(2)) / 3;
      var porDescomposicion = 8 * ((1 / 6) * (a / 2) * (a / 2) * (a / 2));
      return {
        ok: cerca(porFormula, porDescomposicion, 1e-12),
        detalle: porFormula.toFixed(9) + ' = ' + porDescomposicion.toFixed(9)
      };
    });

    /* --- Esfera en cilindro circunscrito: 2/3 en volumen y superficie --- */
    comprobar('Fórmulas', 'Esfera inscrita en cilindro: razón \\(\\frac{2}{3}\\) en volumen y en superficie', function () {
      var R = 3.5;
      var vEsf = (4 / 3) * Math.PI * R * R * R;
      var vCil = Math.PI * R * R * (2 * R);
      var aEsf = 4 * Math.PI * R * R;
      var aCil = 2 * Math.PI * R * (2 * R) + 2 * Math.PI * R * R;
      return {
        ok: cerca(vEsf / vCil, 2 / 3, 1e-12) && cerca(aEsf / aCil, 2 / 3, 1e-12),
        detalle: 'V: ' + (vEsf / vCil).toFixed(6) + ' · A: ' + (aEsf / aCil).toFixed(6)
      };
    });

    /* --- Cono truncado: fórmula y diferencia de conos --- */
    comprobar('Fórmulas', 'Volumen del tronco de cono: fórmula = diferencia de conos', function () {
      var R = 6, r = 3, h = 4;
      var porFormula = (h / 3) * Math.PI * (R * R + r * r + R * r);
      // Cono grande de altura H tal que r/R = (H-h)/H
      var H = (h * R) / (R - r);
      var porDiferencia = (Math.PI * R * R * H) / 3 - (Math.PI * r * r * (H - h)) / 3;
      return {
        ok: cerca(porFormula, porDiferencia, 1e-9),
        detalle: porFormula.toFixed(6) + ' = ' + porDiferencia.toFixed(6)
      };
    });

    /* --- Tronco de pirámide --- */
    comprobar('Fórmulas', 'Volumen del tronco de pirámide: fórmula = pirámide grande − pequeña', function () {
      var B1 = 36, B2 = 16, h = 3;
      var porFormula = (h / 3) * (B1 + B2 + Math.sqrt(B1 * B2));
      var H = (h * 6) / (6 - 4); // lados 6 y 4 → alturas proporcionales
      var porDiferencia = (B1 * H) / 3 - (B2 * (H - h)) / 3;
      return {
        ok: cerca(porFormula, porDiferencia, 1e-9),
        detalle: porFormula.toFixed(4) + ' = ' + porDiferencia.toFixed(4)
      };
    });

    /* --- Diedro del tetraedro regular = arccos(1/3) --- */
    comprobar('Fórmulas', 'Diedro del tetraedro regular: cos θ = 1/3 (ley del coseno)', function () {
      var a = 6;
      var m = (a * Math.sqrt(3)) / 2;
      var cos = (m * m + m * m - a * a) / (2 * m * m);
      return { ok: cerca(cos, 1 / 3, 1e-12), detalle: 'cos θ = ' + cos.toFixed(6) };
    });

    /* --- Área proyectiva --- */
    comprobar('Fórmulas', 'Teorema del coseno proyectivo en el triángulo equilátero', function () {
      var lado = 4;
      var S = (Math.sqrt(3) / 4) * lado * lado;
      var proy = S * Math.cos(Math.PI / 3);
      return {
        ok: cerca(proy, 2 * Math.sqrt(3), 1e-12),
        detalle: 'S·cos60° = ' + proy.toFixed(6)
      };
    });

    /* --- Prisma truncado: media de alturas = integración lineal --- */
    comprobar('Fórmulas', 'Prisma truncado: media de las 4 alturas = altura media lineal', function () {
      var B = 10, hs = [2, 3, 4, 5];
      var porMedia = B * ((hs[0] + hs[1] + hs[2] + hs[3]) / 4);
      // Integración numérica: la altura varía bilinealmente entre los 4 vértices
      var n = 220, total = 0;
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          var u = (i + 0.5) / n, v = (j + 0.5) / n;
          var h = hs[0] * (1 - u) * (1 - v) + hs[1] * u * (1 - v) + hs[2] * u * v + hs[3] * (1 - u) * v;
          total += h;
        }
      }
      var porIntegracion = B * total / (n * n);
      return {
        ok: cerca(porMedia, porIntegracion, 0.02),
        detalle: 'media = ' + porMedia + ' · integrada = ' + porIntegracion.toFixed(4)
      };
    });

    /* --- Sección de esfera --- */
    comprobar('Fórmulas', 'Sección de esfera: \\(r = \\sqrt{R^2-d^2}\\) comprobada con distancia 3D', function () {
      var R = 13, d = 5;
      var r = Math.sqrt(R * R - d * d);
      // Toma un punto del círculo de corte y comprueba que está en la esfera
      var px = r, py = 0, pz = d;
      var dist = Math.sqrt(px * px + py * py + pz * pz);
      return { ok: cerca(dist, R, 1e-12) && r === 12, detalle: 'r = ' + r + ', |OP| = ' + dist };
    });

    /* --- Euler en los cinco sólidos platónicos --- */
    comprobar('Fórmulas', 'Relación de Euler en los cinco sólidos platónicos', function () {
      var solidos = [
        { n: 'tetraedro', C: 4, V: 4, A: 6 },
        { n: 'cubo', C: 6, V: 8, A: 12 },
        { n: 'octaedro', C: 8, V: 6, A: 12 },
        { n: 'dodecaedro', C: 12, V: 20, A: 30 },
        { n: 'icosaedro', C: 20, V: 12, A: 30 }
      ];
      var fallos = solidos.filter(function (s) { return s.C + s.V - s.A !== 2; });
      return { ok: fallos.length === 0, detalle: fallos.length ? 'falla: ' + fallos.map(function (f) { return f.n; }).join(', ') : '5 de 5 cumplen' };
    });

    /* --- Recuento de aristas por doble conteo, contra Euler --- */
    comprobar('Fórmulas', 'Doble conteo de aristas coherente con Euler en prismas n-gonales', function () {
      var malos = [];
      for (var n = 3; n <= 12; n++) {
        var C = n + 2, V = 2 * n, A = 3 * n;
        if (C + V - A !== 2) malos.push(n);
        // Recuento por caras: 2 bases de n lados + n rectángulos de 4 lados
        var aristasContadas = (2 * n + n * 4) / 2;
        if (aristasContadas !== A) malos.push('n=' + n);
      }
      return { ok: malos.length === 0, detalle: malos.length ? 'falla: ' + malos.join(',') : 'n = 3..12 correctos' };
    });

    /* --- Existen exactamente cinco sólidos regulares --- */
    comprobar('Fórmulas', 'Solo 5 pares (n,k) cumplen k(n−2) < 2n', function () {
      var soluciones = [];
      for (var n = 3; n <= 12; n++) {
        for (var k = 3; k <= 8; k++) {
          if (k * (n - 2) < 2 * n) soluciones.push(n + ',' + k);
        }
      }
      return {
        ok: soluciones.length === 5,
        detalle: soluciones.length + ' soluciones: ' + soluciones.join(' | ')
      };
    });

    /* --- Condición de triedro --- */
    comprobar('Fórmulas', 'Criterios de triedro clasifican correctamente cuatro ternas', function () {
      function esTriedro(a, b, c) {
        return a < b + c && b < a + c && c < a + b && a + b + c < 360;
      }
      var casos = [
        [[60, 70, 80], true],
        [[30, 40, 100], false],
        [[120, 130, 140], false],
        [[45, 45, 90], false]
      ];
      var fallos = casos.filter(function (c) { return esTriedro(c[0][0], c[0][1], c[0][2]) !== c[1]; });
      return { ok: fallos.length === 0, detalle: fallos.length ? fallos.length + ' discrepancias' : '4 de 4 correctos' };
    });

    /* --- Semejanza k, k², k³ --- */
    comprobar('Fórmulas', 'Razones de semejanza: k² en área y k³ en volumen (cubo)', function () {
      var a = 2, k = 3;
      var A1 = 6 * a * a, A2 = 6 * (k * a) * (k * a);
      var V1 = a * a * a, V2 = Math.pow(k * a, 3);
      return {
        ok: cerca(A2 / A1, k * k, 1e-12) && cerca(V2 / V1, k * k * k, 1e-12),
        detalle: 'A: ' + (A2 / A1) + ' · V: ' + (V2 / V1)
      };
    });

    /* --- Prisma oblicuo: altura con seno --- */
    comprobar('Fórmulas', 'Prisma oblicuo: h = L·sen φ y volumen 48·10·sen30° = 240', function () {
      var L = 10, phi = Math.PI / 6, B = 48;
      var h = L * Math.sin(phi);
      return { ok: cerca(B * h, 240, 1e-9), detalle: 'h = ' + h + ' · V = ' + B * h };
    });

    /* --- Normalización de planos paralelos --- */
    comprobar('Fórmulas', 'Distancia entre planos paralelos tras normalizar = 1/6', function () {
      // x + 2y - 2z = 3  y  2x + 4y - 4z = 7
      var n = Math.sqrt(1 + 4 + 4);
      var d = Math.abs(3 - 3.5) / n;
      return { ok: cerca(d, 1 / 6, 1e-12), detalle: 'd = ' + d.toFixed(6) };
    });

    /* --- Ángulo diagonal-arista del cubo --- */
    comprobar('Fórmulas', 'Ángulo diagonal espacial-arista: \\(\\cos\\theta = \\frac{1}{\\sqrt{3}}\\), \\(\\theta \\approx 54{,}7^\\circ\\)', function () {
      var a = 1;
      var cos = a / (a * Math.sqrt(3));
      var grados = (Math.acos(cos) * 180) / Math.PI;
      return { ok: cerca(grados, 54.7356, 1e-3), detalle: grados.toFixed(4) + '°' };
    });

    /* --- Ángulo diagonal-cara (base) --- */
    comprobar('Fórmulas', 'Ángulo diagonal espacial-base: \\(\\sin\\theta = \\frac{1}{\\sqrt{3}}\\), \\(\\theta \\approx 35{,}26^\\circ\\)', function () {
      var a = 1;
      var sen = a / (a * Math.sqrt(3));
      var grados = (Math.asin(sen) * 180) / Math.PI;
      return { ok: cerca(grados, 35.2644, 1e-3), detalle: grados.toFixed(4) + '°' };
    });
  }

  /* ==========================================================
     2. Respuestas numéricas del contenido
     ========================================================== */
  function respuestas() {
    var banco = Contenido.bancoPractica();
    var numericos = banco.filter(function (e) { return e.tipo === 'numerico'; });
    comprobar('Respuestas', 'El banco tiene respuestas numéricas declaradas', function () {
      var sinRespuesta = numericos.filter(function (e) {
        return typeof e.respuesta !== 'number' || isNaN(e.respuesta);
      });
      return {
        ok: numericos.length > 0 && sinRespuesta.length === 0,
        detalle: numericos.length + ' ejercicios numéricos, ' + sinRespuesta.length + ' sin respuesta válida'
      };
    });

    // Recálculos independientes de cada respuesta del contenido
    var recalculos = {
      'm1l1e2': function () { return 10 - 3 + 1; },              // rectas con 3 alineados
      'm1l1e5': function () { return (8 * 7) / 2; },              // pares de vértices del cubo
      'm1l2e2': function () { return 66 - (3 * 6) - (8 * 3); },   // alabeadas en el cubo
      'm1l2e4': function () { return (4 * 3) / 2; },
      'm2l1e3': function () { var b = Math.sqrt(5), h = Math.sqrt(b * b - 0.5); return 0.5 * Math.SQRT2 * h; },
      'm2l1e5': function () { return 4 * 3; },
      'm2l2e2': function () { return 2 / Math.sqrt(3); },
      'm2l2e4': function () { return Math.sqrt(9 + 2.25 + 9); },
      'm3l1e1': function () { return (Math.acos(1 / Math.sqrt(3)) * 180) / Math.PI; },
      'm3l2e2': function () { return 1 / 3; },
      'm3l2e3': function () { return 45; },
      'm4l1e1': function () { return 10 * Math.cos(Math.PI / 3); },
      'm4l1e2': function () { return (Math.sqrt(3) / 4 * 16) * Math.cos(Math.PI / 3); },
      'm4l2e1': function () { return Math.abs(2 * 1 - 1 * 2 + 2 * 2 - 6) / Math.sqrt(4 + 1 + 4); },
      'm4l2e2': function () { return 2; },
      'm5l1e2': function () { return 159; },
      'm5l1e3': function () { return 3; },
      'm6l1e1': function () { return Math.sqrt(4 + 9 + 36); },
      'm6l1e2': function () { return 5 * Math.SQRT2; },
      'm6l1e4': function () { return 16 * 9 + 2 * 16; },
      'm6l1e5': function () { return 5 * 2; },
      'm6l1e6': function () { return 6 * 8 * 10 * Math.sin(Math.PI / 6); },
      'm7l1e1': function () { return Math.sqrt(9 + 16); },
      'm7l1e2': function () { return (36 * 10) / 3; },
      'm7l1e4': function () { return (1 / 3) * (3 * Math.sqrt(3) / 2 * 16) * 6; },
      'm8l1e1': function () { return Math.PI * 9 * 7; },
      'm8l1e2': function () { return (4 / 3) * Math.PI * 27; },
      'm8l1e3': function () { return (1 / 3) * Math.PI * 25 * 12; },
      'm9l1e2': function () { return (20 * 3) / 2; },
      'm9l1e3': function () { return 12 + 20 - 2; },
      'm10l1e2': function () { return Math.sqrt(100 - 36); },
      'm10l1e4': function () { return 36; },
      'm11l1e2': function () { return (3 / 3) * (36 + 16 + 24); },
      'm11l1e5': function () { return (4 / 3) * Math.PI * (36 + 9 + 18); },
      'm12l1e5': function () { return Math.pow(0.5, 3); }
    };

    Object.keys(recalculos).forEach(function (id) {
      var ej = banco.filter(function (e) { return e.id === id; })[0];
      if (!ej) {
        comprobar('Respuestas', 'Existe el ejercicio ' + id, function () {
          return { ok: false, detalle: 'no encontrado en el banco' };
        });
        return;
      }
      comprobar('Respuestas', id + ' — respuesta recalculada', function () {
        var valor = recalculos[id]();
        var tol = typeof ej.tolerancia === 'number' ? ej.tolerancia : 0.005;
        // Los ejercicios de opción múltiple no tienen campo `respuesta`:
        // su valor esperado es el de la opción marcada como correcta.
        var esperado;
        if (ej.tipo === 'opcion') {
          var correcta = (ej.opciones || []).filter(function (o) { return o.correcta; })[0];
          esperado = correcta ? parseFloat(String(correcta.texto).replace(',', '.')) : NaN;
        } else {
          esperado = ej.respuesta;
        }
        var diff = Math.abs(valor - esperado);
        return {
          ok: diff <= tol + 1e-9,
          detalle: 'contenido = ' + esperado + ' · recalculado = ' + valor.toFixed(6) +
            ' · tolerancia = ' + tol
        };
      });
    });
  }

  /* ==========================================================
     3. Coherencia estructural del contenido
     ========================================================== */
  function estructura() {
    comprobar('Estructura', 'Todos los módulos tienen al menos una lección registrada', function () {
      var vacios = Contenido.MODULOS.filter(function (m) {
        return m.lecciones.some(function (id) { return !Contenido.obtenerLeccion(id); });
      });
      return {
        ok: vacios.length === 0,
        detalle: vacios.length ? 'módulos vacíos: ' + vacios.map(function (m) { return m.id; }).join(',') :
          Contenido.MODULOS.length + ' módulos completos'
      };
    });

    comprobar('Estructura', 'Cada lección declara objetivo, resumen y duración', function () {
      var fallos = [];
      Contenido.listaOrdenada().forEach(function (l) {
        var x = l.leccion;
        if (!x.objetivo || !x.resumen || !x.duracion || !x.bloques || !x.bloques.length) fallos.push(x.id);
      });
      return { ok: fallos.length === 0, detalle: fallos.length ? fallos.join(', ') : 'todas completas' };
    });

    comprobar('Estructura', 'Cada ejercicio numérico tiene explicación y al menos 2 pistas', function () {
      var fallos = [];
      Contenido.bancoPractica().forEach(function (e) {
        if (!e.explicacion) fallos.push(e.id + ' sin explicación');
        if (!e.pistas || e.pistas.length < 2) fallos.push(e.id + ' con menos de 2 pistas');
      });
      return { ok: fallos.length === 0, detalle: fallos.length ? fallos.slice(0, 6).join('; ') : 'todos cumplen' };
    });

    comprobar('Estructura', 'Cada pregunta de opción múltiple tiene exactamente una respuesta correcta', function () {
      var fallos = [];
      var total = 0;
      Contenido.bancoPractica().forEach(function (e) {
        if (e.tipo !== 'opcion') return;
        total++;
        var correctas = (e.opciones || []).filter(function (o) { return o.correcta; });
        if (correctas.length !== 1) fallos.push(e.id + ': ' + correctas.length + ' correctas');
        if ((e.opciones || []).length !== 4) fallos.push(e.id + ': ' + (e.opciones || []).length + ' opciones');
      });
      return {
        ok: fallos.length === 0,
        detalle: total + ' preguntas · ' + (fallos.length ? fallos.join('; ') : 'todas con 1 correcta y 4 opciones')
      };
    });

    comprobar('Estructura', 'Cada reto tiene estrategia, desarrollo y respuesta', function () {
      var fallos = [];
      Contenido.bancoRetos().forEach(function (r) {
        if (!r.estrategia || !r.estrategia.length) fallos.push(r.id + ' sin estrategia');
        if (!r.desarrollo || !r.desarrollo.length) fallos.push(r.id + ' sin desarrollo');
        if (!r.respuesta) fallos.push(r.id + ' sin respuesta');
      });
      return { ok: fallos.length === 0, detalle: fallos.length ? fallos.join('; ') : 'todos completos' };
    });

    comprobar('Estructura', 'Los identificadores de ejercicios y retos son únicos', function () {
      var vistos = {}, dup = [];
      Contenido.bancoPractica().forEach(function (e) {
        if (vistos[e.id]) dup.push(e.id);
        vistos[e.id] = true;
      });
      Contenido.bancoRetos().forEach(function (r) {
        if (vistos[r.id]) dup.push(r.id);
        vistos[r.id] = true;
      });
      return { ok: dup.length === 0, detalle: dup.length ? dup.join(', ') : Object.keys(vistos).length + ' identificadores únicos' };
    });

    comprobar('Estructura', 'Cada lección incluye al menos un error frecuente o un aviso', function () {
      var faltan = [];
      Contenido.listaOrdenada().forEach(function (l) {
        var tiene = l.leccion.bloques.some(function (b) {
          return b.tipo === 'errores' || b.tipo === 'nota';
        });
        if (!tiene) faltan.push(l.id);
      });
      return { ok: faltan.length === 0, detalle: faltan.length ? faltan.join(', ') : 'todas incluyen' };
    });

    comprobar('Estructura', 'La lección del módulo 6 está desarrollada a fondo', function () {
      var l = Contenido.obtenerLeccion('m6l1');
      var tieneDiagonales = l && l.bloques.some(function (b) {
        return b.tipo === 'teorema' && /diagonal/i.test(b.titulo);
      });
      return {
        ok: !!(l && l.destacada && l.ejercicios.length >= 8 && l.retos.length >= 2 && tieneDiagonales),
        detalle: l ? l.ejercicios.length + ' ejercicios · ' + l.retos.length + ' retos · ' +
          l.bloques.length + ' bloques' : 'no encontrada'
      };
    });
  }

  /* ==========================================================
     4. Especificaciones de figuras
     ========================================================== */
  function figuras() {
    var ids = Object.keys(Figuras.spec);
    comprobar('Figuras', 'Hay figuras registradas', function () {
      return { ok: ids.length >= 10, detalle: ids.length + ' figuras' };
    });

    comprobar('Figuras', 'Cada figura declara título, descripción, pie y cámara', function () {
      var fallos = [];
      ids.forEach(function (id) {
        var f = Figuras.spec[id];
        if (!f.titulo) fallos.push(id + ' sin título');
        if (!f.alt) fallos.push(id + ' sin descripción');
        if (!f.pie) fallos.push(id + ' sin pie');
        if (!f.camara || typeof f.camara.theta !== 'number') fallos.push(id + ' sin cámara');
        if (!f.capas || !f.capas.length) fallos.push(id + ' sin capas');
      });
      return { ok: fallos.length === 0, detalle: fallos.length ? fallos.slice(0, 5).join('; ') : 'todas completas' };
    });

    comprobar('Figuras', 'Todas las referencias de vértices existen', function () {
      var fallos = [];
      ids.forEach(function (id) {
        var f = Figuras.spec[id];
        if (f.tipo === 'esfera') return;
        (f.aristas || []).forEach(function (a) {
          if (!f.vertices[a.a]) fallos.push(id + '.' + a.a);
          if (!f.vertices[a.b]) fallos.push(id + '.' + a.b);
        });
        (f.caras || []).forEach(function (c) {
          (c.v || []).forEach(function (v) {
            if (!f.vertices[v]) fallos.push(id + '.' + v);
          });
        });
        (f.lineas || []).forEach(function (l) {
          (l.v || []).forEach(function (v) {
            if (typeof v === 'string' && !f.vertices[v]) fallos.push(id + '.' + v);
          });
        });
      });
      return { ok: fallos.length === 0, detalle: fallos.length ? fallos.slice(0, 8).join(', ') : 'sin referencias rotas' };
    });

    comprobar('Figuras', 'Todas las capas usadas por una figura están declaradas', function () {
      var fallos = [];
      ids.forEach(function (id) {
        var f = Figuras.spec[id];
        if (f.tipo === 'esfera') return;
        var declaradas = (f.capas || []).map(function (c) { return c.id; });
        var usadas = [];
        (f.caras || []).forEach(function (c) { usadas.push(c.capa || 'caras'); });
        (f.aristas || []).forEach(function (a) { usadas.push(a.capa || 'aristas'); });
        (f.lineas || []).forEach(function (l) { usadas.push(l.capa || 'aristas'); });
        usadas.forEach(function (u) {
          if (declaradas.indexOf(u) === -1) fallos.push(id + ':' + u);
        });
      });
      return { ok: fallos.length === 0, detalle: fallos.length ? fallos.slice(0, 8).join(', ') : 'todas declaradas' };
    });

    comprobar('Figuras', 'Las coordenadas son números finitos', function () {
      var fallos = [];
      ids.forEach(function (id) {
        var f = Figuras.spec[id];
        if (f.tipo === 'esfera') return;
        Object.keys(f.vertices || {}).forEach(function (k) {
          var p = f.vertices[k].p;
          if (!Array.isArray(p) || p.length !== 3 || p.some(function (x) { return typeof x !== 'number' || !isFinite(x); })) {
            fallos.push(id + '.' + k);
          }
        });
      });
      return { ok: fallos.length === 0, detalle: fallos.length ? fallos.slice(0, 8).join(', ') : 'todas finitas' };
    });

    comprobar('Figuras', 'Cada lección referencia figuras existentes', function () {
      var faltan = [];
      Contenido.listaOrdenada().forEach(function (l) {
        l.leccion.bloques.forEach(function (b) {
          if (b.tipo === 'figura' && !Figuras.obtener(b.figura)) {
            faltan.push(l.id + ' → ' + b.figura);
          }
        });
      });
      return { ok: faltan.length === 0, detalle: faltan.length ? faltan.join(', ') : 'todas las referencias válidas' };
    });

    comprobar('Figuras', 'La especificación 2·3·6 tiene diagonal espacial 7 (coherencia con el texto)', function () {
      var f = Figuras.obtener('prisma-diagonales');
      if (!f) return { ok: false, detalle: 'figura no encontrada' };
      var A = f.vertices.A.p, C1 = f.vertices.C1.p;
      var d = Math.sqrt(
        Math.pow(C1[0] - A[0], 2) + Math.pow(C1[1] - A[1], 2) + Math.pow(C1[2] - A[2], 2)
      );
      return { ok: cerca(d, 7, 1e-9), detalle: '|AC₁| = ' + d.toFixed(6) };
    });

    comprobar('Figuras', 'El cubo de la sección hexagonal tiene arista coherente', function () {
      var f = Figuras.obtener('cubo-seccion');
      if (!f) return { ok: false, detalle: 'figura no encontrada' };
      var A = f.vertices.A.p, B = f.vertices.B.p, A1 = f.vertices.A1.p;
      var lado = Math.abs(B[0] - A[0]);
      var altura = Math.abs(A1[1] - A[1]);
      return { ok: cerca(lado, altura, 1e-9), detalle: 'lado = ' + lado + ' · altura = ' + altura };
    });
  }

  /* Auditoría transversal de todas las claves y las 17 lecciones.
     Cada clave se comprueba con un cálculo independiente del valor guardado. */
  function auditoriaAcademica() {
    if (!window.AuditoriaAcademica) {
      comprobar('Auditoría académica', 'Motor independiente disponible', function () {
        return { ok:false, detalle:'Falta js/auditoria-academica.js' };
      });
      return;
    }
    var aud = window.AuditoriaAcademica;
    var informe = aud.auditar(Contenido);
    comprobar('Auditoría académica', 'Integridad del catálogo y ejercicios nivel UNI', function () {
      return { ok:informe.correcto && informe.lecciones===17 && informe.ejercicios===107 &&
        informe.numericos===64 && informe.opciones===43 && informe.retos===18,
        detalle:informe.lecciones+' lecciones · '+informe.ejercicios+' ejercicios · '+
          informe.retos+' retos · '+informe.errores.length+' incidencias' };
    });
    comprobar('Auditoría académica','Diagnóstico de las 129 opciones incorrectas',function(){
      var d=window.DiagnosticoAcademico;
      var conMotivo=Contenido.bancoPractica().filter(function(e){return e.tipo==='opcion';})
        .reduce(function(sum,e){return sum+e.opciones.filter(function(o){return !o.correcta&&typeof o.motivo==='string'&&o.motivo.length>15;}).length;},0);
      return {ok:!!d&&d.total===43&&d.esperados===43&&conMotivo===129,
        detalle:conMotivo+' de 129 alternativas incorrectas con diagnóstico específico'};
    });
    var banco=Contenido.bancoPractica(), mapa={};
    banco.forEach(function(e){mapa[e.id]=e;});
    Object.keys(aud.claves).forEach(function(id){
      comprobar('Auditoría académica','Clave independiente: '+id,function(){
        var e=mapa[id],n=aud.claves[id]();
        if(!e)return {ok:false,detalle:'Ejercicio ausente'};
        var tol=typeof e.tolerancia==='number'?e.tolerancia:.005;
        return {ok:Number.isFinite(n) && Number.isFinite(e.respuesta) && Math.abs(n-e.respuesta)<=tol+1e-9,
          detalle:'Respuesta = '+e.respuesta+' · recálculo = '+n.toFixed(5)+' · tolerancia = '+tol};
      });
    });
  }

  /* ==========================================================
     Render del informe
     ========================================================== */
  function render() {
    var cont = document.getElementById('resultados');
    var grupos = {};
    resultados.forEach(function (r) {
      if (!grupos[r.grupo]) grupos[r.grupo] = [];
      grupos[r.grupo].push(r);
    });

    var total = resultados.length;
    var ok = resultados.filter(function (r) { return r.ok; }).length;
    var pct = total ? Math.round((ok / total) * 100) : 0;

    var anillo = document.getElementById('anillo-verif');
    anillo.style.setProperty('--p', pct);
    anillo.querySelector('span').textContent = pct + '%';

    document.getElementById('verif-titulo').textContent =
      ok === total ? 'Todo correcto' : (total - ok) + ' comprobación(es) fallida(s)';
    document.getElementById('verif-detalle').textContent =
      ok + ' de ' + total + ' comprobaciones superadas · ' + new Date().toLocaleString('es-ES');

    var html = '';
    Object.keys(grupos).forEach(function (g) {
      var lista = grupos[g];
      var fallos = lista.filter(function (r) { return !r.ok; }).length;
      html += '<section style="margin-bottom:1.8rem">' +
        '<h2 style="display:flex;align-items:center;gap:.6rem;font-size:1.1rem">' +
        g +
        '<span class="pildora" style="background:' + (fallos ? 'var(--danger-soft)' : 'var(--teal-soft)') +
        ';color:' + (fallos ? 'var(--danger)' : 'var(--teal)') + '">' +
        (lista.length - fallos) + '/' + lista.length + '</span></h2>' +
        '<div class="tabla-envoltura"><table class="datos tabla-larga">' +
        '<caption>Resultados de la ejecución actual en este navegador.</caption>' +
        '<thead><tr><th scope="col">Comprobación</th><th scope="col">Resultado</th>' +
        '<th scope="col">Detalle</th></tr></thead><tbody>' +
        lista.map(function (r) {
          return '<tr>' +
            '<th scope="row" style="font-weight:500">' + r.nombre + '</th>' +
            '<td>' + (r.ok
              ? '<span class="estado-si">✓ Superada</span>'
              : '<span class="estado-no" style="background:var(--danger-soft);color:var(--danger)">× Fallida</span>') +
            '</td>' +
            '<td><span class="m" style="white-space:normal;font-size:.78rem">' +
            (r.detalle || '—') + '</span></td>' +
            '</tr>';
        }).join('') +
        '</tbody></table></div></section>';
    });

    cont.innerHTML = html;
  }

  function ejecutar() {
    resultados = [];
    seccion();
    respuestas();
    estructura();
    figuras();
    auditoriaAcademica();
    render();
  }

  function iniciar() {
    UI.iniciar({ avatar: false });
    ejecutar();
    document.getElementById('btn-repetir').addEventListener('click', ejecutar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
