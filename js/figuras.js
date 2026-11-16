/* ============================================================
   figuras.js — especificaciones geométricas compartidas
   ------------------------------------------------------------
   Una sola fuente de verdad para cada figura: el visor 3D
   (Three.js) y la alternativa 2D (SVG) leen el MISMO objeto.
   Así no hay discrepancias entre lo que se explica y lo que
   se dibuja.

   Estructura de una especificación:
   {
     id, titulo, alt, pie, medidas,
     camara: { theta, phi, dist? },
     vertices: { NOMBRE: { p:[x,y,z], r, etiqueta } },
     caras:   [ { v:[...], capa } ],
     aristas: [ { a, b, capa, estilo } ],
     lineas:  [ { v:[...] | pts:[[x,y,z],...], capa, estilo, grosor } ],
     capas:   [ { id, nombre, color, activa } ],
     tipo: 'solido' | 'esfera'
   }
   Sistema de coordenadas: Y hacia arriba, unidades reales.
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- utilidades vectoriales ---------- */
  function v(x, y, z) { return [x, y, z]; }
  function suma(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function resta(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function escala(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function punto(a, b, t) { return suma(a, escala(resta(b, a), t)); }
  function cruz(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function punto3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norma(a) { return Math.sqrt(punto3(a, a)); }
  function unitario(a) { var n = norma(a) || 1; return escala(a, 1 / n); }
  function centroide(ps) {
    var s = [0, 0, 0];
    ps.forEach(function (p) { s = suma(s, p); });
    return escala(s, 1 / (ps.length || 1));
  }

  /* ---------- cámara ---------- */
  function ojoCamara(cam, centro, radio) {
    var dist = cam.dist || (radio / Math.sin(cam.fov ? cam.fov / 2 : 0.52)) * 1.28;
    var theta = cam.theta, phi = cam.phi;
    return {
      p: [
        centro[0] + dist * Math.cos(phi) * Math.sin(theta),
        centro[1] + dist * Math.sin(phi),
        centro[2] + dist * Math.cos(phi) * Math.cos(theta)
      ],
      dist: dist
    };
  }

  /* Proyección perspectiva compartida: devuelve coordenadas de pantalla
     normalizadas (-.5..? ) y profundidad. w/h en píxeles. */
  function baseCamara(eye, target) {
    var f = unitario(resta(target, eye));
    var up = [0, 1, 0];
    if (Math.abs(punto3(f, up)) > 0.999) up = [0, 0, 1];
    var r = unitario(cruz(f, up));
    var u = cruz(r, f);
    return { eye: eye, f: f, r: r, u: u, target: target };
  }

  /* ---------- registro ---------- */
  var FIGURAS = {};
  function registrar(id, spec) {
    spec.id = id;
    FIGURAS[id] = spec;
  }

  /* ---------- capas por defecto ---------- */
  function capas(extras) {
    var base = [
      { id: 'caras', nombre: 'Caras', color: '#5b6bd6', activa: true },
      { id: 'aristas', nombre: 'Aristas', color: '#1b2033', activa: true },
      { id: 'vertices', nombre: 'Vértices', color: '#1b2033', activa: true },
      { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
    ];
    return base.concat(extras || []);
  }

  /* ---------- constructores de sólidos ---------- */
  /* Prisma recto de base rectangular: a (eje X), b (eje Z), h (eje Y).
     Vértices inferiores A B C D y superiores A1 B1 C1 D1. */
  function prismaRecto(opts) {
    var a = opts.a, b = opts.b, h = opts.h;
    var A = v(-a / 2, 0, b / 2), B = v(a / 2, 0, b / 2),
      C = v(a / 2, 0, -b / 2), D = v(-a / 2, 0, -b / 2);
    var sube = function (p) { return [p[0], p[1] + h, p[2]]; };
    var vs = {
      A: { p: A, etiqueta: 'A' }, B: { p: B, etiqueta: 'B' },
      C: { p: C, etiqueta: 'C' }, D: { p: D, etiqueta: 'D' },
      A1: { p: sube(A), etiqueta: 'A₁' }, B1: { p: sube(B), etiqueta: 'B₁' },
      C1: { p: sube(C), etiqueta: 'C₁' }, D1: { p: sube(D), etiqueta: 'D₁' }
    };
    var aristas = [
      ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
      ['A1', 'B1'], ['B1', 'C1'], ['C1', 'D1'], ['D1', 'A1'],
      ['A', 'A1'], ['B', 'B1'], ['C', 'C1'], ['D', 'D1']
    ];
    var caras = [
      ['A', 'B', 'C', 'D'], ['A1', 'B1', 'C1', 'D1'],
      ['A', 'B', 'B1', 'A1'], ['B', 'C', 'C1', 'B1'],
      ['C', 'D', 'D1', 'C1'], ['D', 'A', 'A1', 'D1']
    ];
    return { vertices: vs, aristas: aristas, caras: caras, dims: { a: a, b: b, h: h } };
  }

  /* Pirámide de base cuadrada/rectangular, vértice V sobre el centro */
  function piramide(opts) {
    var a = opts.a, b = opts.b, h = opts.h;
    var A = v(-a / 2, 0, b / 2), B = v(a / 2, 0, b / 2),
      C = v(a / 2, 0, -b / 2), D = v(-a / 2, 0, -b / 2);
    var O = v(0, 0, 0), V = v(0, h, 0);
    var vs = {
      A: { p: A, etiqueta: 'A' }, B: { p: B, etiqueta: 'B' },
      C: { p: C, etiqueta: 'C' }, D: { p: D, etiqueta: 'D' },
      V: { p: V, etiqueta: 'V' }, O: { p: O, etiqueta: 'O' },
      M: { p: v(0, 0, b / 2), etiqueta: 'M' }
    };
    return {
      vertices: vs,
      aristas: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'V'], ['B', 'V'], ['C', 'V'], ['D', 'V']],
      caras: [['A', 'B', 'C', 'D'], ['A', 'B', 'V'], ['B', 'C', 'V'], ['C', 'D', 'V'], ['D', 'A', 'V']],
      dims: { a: a, b: b, h: h }
    };
  }

  /* Cilindro: dos círculos de radio r separados h */
  function cilindro(r, h, n) {
    n = n || 40;
    var vs = {}, i, ang, p;
    for (i = 0; i < n; i++) {
      ang = (i / n) * Math.PI * 2;
      vs['b' + i] = { p: v(r * Math.cos(ang), 0, r * Math.sin(ang)), sinEtiqueta: true, r: 0 };
      vs['t' + i] = { p: v(r * Math.cos(ang), h, r * Math.sin(ang)), sinEtiqueta: true, r: 0 };
    }
    var aristas = [], caras = [];
    for (i = 0; i < n; i++) {
      var j = (i + 1) % n;
      caras.push(['b' + i, 'b' + j, 't' + j, 't' + i]);
    }
    var polilineaBase = [], polilineaTapa = [];
    for (i = 0; i < n; i++) { polilineaBase.push('b' + i); polilineaTapa.push('t' + i); }
    return {
      vertices: vs, aristas: aristas, caras: caras,
      polilineas: [polilineaBase, polilineaTapa], n: n, dims: { r: r, h: h }
    };
  }

  function cono(r, h, n) {
    n = n || 40;
    var vs = { V: { p: v(0, h, 0), etiqueta: 'V' }, O: { p: v(0, 0, 0), etiqueta: 'O' } }, i, ang;
    for (i = 0; i < n; i++) {
      ang = (i / n) * Math.PI * 2;
      vs['b' + i] = { p: v(r * Math.cos(ang), 0, r * Math.sin(ang)), sinEtiqueta: true, r: 0 };
    }
    var caras = [];
    for (i = 0; i < n; i++) caras.push(['V', 'b' + i, 'b' + ((i + 1) % n)]);
    var base = [];
    for (i = 0; i < n; i++) base.push('b' + i);
    vs.B = { p: v(r, 0, 0), etiqueta: 'B' };
    return { vertices: vs, aristas: [], caras: caras, polilineas: [base], n: n, dims: { r: r, h: h } };
  }

  /* Arco en el plano definido por u, v apoyado en el centro c */
  function arco(c, u, vv, r, desde, hasta, n) {
    n = n || 24;
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var t = desde + (hasta - desde) * (i / n);
      pts.push(suma(c, suma(escala(u, r * Math.cos(t)), escala(vv, r * Math.sin(t)))));
    }
    return pts;
  }

  /* Marca de ángulo recto: vértice + dos direcciones unitarias */
  function marcaRecta(o, d1, d2, t) {
    var p1 = suma(o, escala(unitario(d1), t));
    var p2 = suma(o, suma(escala(unitario(d1), t), escala(unitario(d2), t)));
    var p3 = suma(o, escala(unitario(d2), t));
    return [p1, p2, p3];
  }

  /* ============================================================
     FIGURAS
     ============================================================ */

  /* --- 1. Planos que se cortan y recta de intersección --- */
  (function () {
    var P = 3.4;
    var vs = {
      P1: { p: v(-P, 0, -P) }, P2: { p: v(P, 0, -P) }, P3: { p: v(P, 0, P) }, P4: { p: v(-P, 0, P) },
      Q1: { p: v(-P, -P, 0) }, Q2: { p: v(P, -P, 0) }, Q3: { p: v(P, P, 0) }, Q4: { p: v(-P, P, 0) },
      I1: { p: v(-P, 0, 0), etiqueta: 'r' }, I2: { p: v(P, 0, 0) }
    };
    registrar('planos-corte', {
      titulo: 'Dos planos que se cortan',
      alt: 'Dos planos inclinados que se intersecan según una recta común r, con la indicación del ángulo diedro.',
      pie: 'Dos planos distintos no paralelos se cortan siempre en una recta. El ángulo entre ellos se mide con un plano perpendicular a esa recta.',
      medidas: [['α', 'plano horizontal', 'plano'], ['β', 'plano vertical', 'plano'], ['r', 'recta de intersección', 'arista']],
      camara: { theta: -0.72, phi: 0.36 },
      vertices: vs,
      caras: [
        { v: ['P1', 'P2', 'P3', 'P4'], capa: 'planoA' },
        { v: ['Q1', 'Q2', 'Q3', 'Q4'], capa: 'planoB' }
      ],
      aristas: [
        { a: 'P1', b: 'P2', capa: 'planoA' }, { a: 'P2', b: 'P3', capa: 'planoA' },
        { a: 'P3', b: 'P4', capa: 'planoA' }, { a: 'P4', b: 'P1', capa: 'planoA' },
        { a: 'Q1', b: 'Q2', capa: 'planoB' }, { a: 'Q2', b: 'Q3', capa: 'planoB' },
        { a: 'Q3', b: 'Q4', capa: 'planoB' }, { a: 'Q4', b: 'Q1', capa: 'planoB' }
    ],
      lineas: [
        { v: ['I1', 'I2'], capa: 'interseccion', estilo: 'fuerte', grosor: 3.2 }
      ],
      capas: [
        { id: 'planoA', nombre: 'Plano α', color: '#2c3c9e', activa: true, opacidad: 0.13 },
        { id: 'planoB', nombre: 'Plano β', color: '#b85c0d', activa: true, opacidad: 0.13 },
        { id: 'interseccion', nombre: 'Recta r', color: '#a8271f', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 2. Recta que corta un plano: ángulo recta-plano --- */
  (function () {
    var P = 3.2, h = 2.6;
    var vs = {
      P1: { p: v(-P, 0, -P) }, P2: { p: v(P, 0, -P) }, P3: { p: v(P, 0, P) }, P4: { p: v(-P, 0, P) },
      A: { p: v(-1.9, 0, 1.0), etiqueta: 'A' },
      B: { p: v(1.5, h, -1.1), etiqueta: 'B' },
      Bp: { p: v(1.5, 0, -1.1), etiqueta: "B'" }
    };
    registrar('recta-plano-angulo', {
      titulo: 'Ángulo entre una recta y un plano',
      alt: 'Una recta AB corta al plano en A; B′ es la proyección ortogonal de B sobre el plano, y el ángulo buscado es el que forma AB con AB′.',
      pie: 'El ángulo entre la recta AB y el plano es el ángulo que forma AB con su proyección ortogonal AB′ sobre el plano. Es el complemento del ángulo que AB forma con la perpendicular al plano.',
      medidas: [['AB', 'recta oblicua', 'diagonal'], ["B B'", 'perpendicular al plano', 'altura'], ["A B'", 'proyección de AB', 'arista']],
      camara: { theta: 0.62, phi: 0.28 },
      vertices: vs,
      caras: [{ v: ['P1', 'P2', 'P3', 'P4'], capa: 'plano' }],
      aristas: [
        { a: 'P1', b: 'P2', capa: 'plano' }, { a: 'P2', b: 'P3', capa: 'plano' },
        { a: 'P3', b: 'P4', capa: 'plano' }, { a: 'P4', b: 'P1', capa: 'plano' }
      ],
      lineas: [
        { v: ['A', 'B'], capa: 'recta', estilo: 'fuerte', grosor: 3 },
        { v: ['B', 'Bp'], capa: 'perpendicular', estilo: 'punteada', grosor: 2 },
        { v: ['A', 'Bp'], capa: 'proyeccion', estilo: 'fuerte', grosor: 3 },
        { pts: marcaRecta(vs.Bp.p, resta(vs.Bp.p, vs.B.p), resta(vs.A.p, vs.Bp.p), 0.42), capa: 'perpendicular' },
        { pts: arco(vs.A.p, unitario(resta(vs.Bp.p, vs.A.p)), unitario(resta(vs.B.p, vs.A.p)), 0.85, 0, Math.PI / 2), capa: 'angulo', estilo: 'curva' }
      ],
      capas: [
        { id: 'plano', nombre: 'Plano', color: '#2c3c9e', activa: true, opacidad: 0.12 },
        { id: 'recta', nombre: 'Recta AB', color: '#131829', activa: true },
        { id: 'perpendicular', nombre: 'Perpendicular', color: '#0c7367', activa: true },
        { id: 'proyeccion', nombre: 'Proyección', color: '#b85c0d', activa: true },
        { id: 'angulo', nombre: 'Ángulo', color: '#a8271f', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 3. Recta perpendicular a un plano (teorema de las tres perpendiculares) --- */
  (function () {
    var P = 3.0, h = 2.4;
    var vs = {
      P1: { p: v(-P, 0, -P) }, P2: { p: v(P, 0, -P) }, P3: { p: v(P, 0, P) }, P4: { p: v(-P, 0, P) },
      O: { p: v(0, 0, 0), etiqueta: 'O' },
      T: { p: v(0, h, 0), etiqueta: 'T' },
      X: { p: v(-2.1, 0, -1.5), etiqueta: 'X' },
      Y: { p: v(2.1, 0, -1.5), etiqueta: 'Y' }
    };
    registrar('perpendicular-plano', {
      titulo: 'Recta perpendicular a un plano',
      alt: 'La recta TO es perpendicular al plano en O; las rectas OX y OY contenidas en el plano forman ángulo recto con TO.',
      pie: 'Si una recta es perpendicular a dos rectas del plano que pasan por su pie, entonces es perpendicular al plano: y por tanto lo es a toda recta del plano que pase por ese punto.',
      medidas: [['TO', '⟂ plano', 'altura'], ['OX, OY', 'rectas del plano', 'arista']],
      camara: { theta: -0.55, phi: 0.3 },
      vertices: vs,
      caras: [{ v: ['P1', 'P2', 'P3', 'P4'], capa: 'plano' }],
      aristas: [
        { a: 'P1', b: 'P2', capa: 'plano' }, { a: 'P2', b: 'P3', capa: 'plano' },
        { a: 'P3', b: 'P4', capa: 'plano' }, { a: 'P4', b: 'P1', capa: 'plano' },
        { a: 'O', b: 'X', capa: 'rectas-plano' }, { a: 'O', b: 'Y', capa: 'rectas-plano' }
      ],
      lineas: [
        { v: ['O', 'T'], capa: 'perpendicular', estilo: 'fuerte', grosor: 3 },
        { pts: marcaRecta(vs.O.p, resta(vs.T.p, vs.O.p), resta(vs.X.p, vs.O.p), 0.42), capa: 'perpendicular' },
        { pts: marcaRecta(vs.O.p, resta(vs.T.p, vs.O.p), resta(vs.Y.p, vs.O.p), 0.42), capa: 'perpendicular' }
      ],
      capas: [
        { id: 'plano', nombre: 'Plano', color: '#2c3c9e', activa: true, opacidad: 0.12 },
        { id: 'perpendicular', nombre: 'Perpendicular', color: '#0c7367', activa: true },
        { id: 'rectas-plano', nombre: 'Rectas del plano', color: '#b85c0d', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 4. Proyección ortogonal y distancia punto-plano --- */
  (function () {
    var P = 3.0, h = 2.2;
    var vs = {
      P1: { p: v(-P, 0, -P) }, P2: { p: v(P, 0, -P) }, P3: { p: v(P, 0, P) }, P4: { p: v(-P, 0, P) },
      A: { p: v(-1.6, 0, 1.3), etiqueta: 'A' },
      Pp: { p: v(1.2, 0, 0.4), etiqueta: "P'" },
      P0: { p: v(1.2, h, 0.4), etiqueta: 'P' },
      B: { p: v(2.1, 0, -1.6), etiqueta: 'B' }
    };
    registrar('proyeccion-distancia', {
      titulo: 'Proyección ortogonal y distancia',
      alt: 'El punto P se proyecta ortogonalmente sobre el plano en P′. La distancia de P al plano es PP′; la distancia de P a un punto B del plano es PB.',
      pie: 'La distancia de un punto a un plano es la longitud del segmento perpendicular PP′. Para cualquier otro punto B del plano, PB > PP′ (es la hipotenusa del triángulo rectángulo).',
      medidas: [['PP′', 'distancia al plano', 'altura'], ['PB', 'distancia a un punto', 'diagonal'], ["P'B", 'proyección', 'arista']],
      camara: { theta: 0.7, phi: 0.32 },
      vertices: vs,
      caras: [{ v: ['P1', 'P2', 'P3', 'P4'], capa: 'plano' }],
      aristas: [
        { a: 'P1', b: 'P2', capa: 'plano' }, { a: 'P2', b: 'P3', capa: 'plano' },
        { a: 'P3', b: 'P4', capa: 'plano' }, { a: 'P4', b: 'P1', capa: 'plano' },
        { a: 'Pp', b: 'B', capa: 'plano-linea' }
      ],
      lineas: [
        { v: ['P0', 'Pp'], capa: 'distancia', estilo: 'fuerte', grosor: 3 },
        { v: ['P0', 'B'], capa: 'recta', estilo: 'fuerte', grosor: 2.4 },
        { pts: marcaRecta(vs.Pp.p, resta(vs.P0.p, vs.Pp.p), resta(vs.B.p, vs.Pp.p), 0.4), capa: 'distancia' }
      ],
      capas: [
        { id: 'plano', nombre: 'Plano', color: '#2c3c9e', activa: true, opacidad: 0.12 },
        { id: 'distancia', nombre: 'Distancia', color: '#0c7367', activa: true },
        { id: 'recta', nombre: 'Recta PB', color: '#b85c0d', activa: true },
        { id: 'plano-linea', nombre: 'Rectas del plano', color: '#6c748c', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 5. Triedro --- */
  (function () {
    var vs = {
      O: { p: v(0, 0, 0), etiqueta: 'O' },
      X: { p: v(3.2, 0, 0), etiqueta: 'x' },
      Y: { p: v(0, 3.0, 0), etiqueta: 'y' },
      Z: { p: v(0, 0, 3.2), etiqueta: 'z' },
      A: { p: v(2.6, 1.7, 0) },
      B: { p: v(0, 1.7, 2.6) },
      C: { p: v(2.6, 0, 2.6) }
    };
    registrar('triedro', {
      titulo: 'Triedro trirrectángulo',
      alt: 'Tres semirrectas con origen común O forman un triedro; en este caso los tres diedros son rectos.',
      pie: 'Un triedro está formado por tres semirrectas (aristas) con origen común. Cada par de aristas determina una cara. Los ángulos entre aristas son los ángulos de las caras y los ángulos entre caras son los diedros.',
      medidas: [['O', 'vértice del triedro', 'altura'], ['caras', 'xOy, yOz, zOx', 'plano']],
      camara: { theta: 0.78, phi: 0.34 },
      vertices: vs,
      caras: [
        { v: ['O', 'X', 'Y'], capa: 'caraA' },
        { v: ['O', 'Y', 'Z'], capa: 'caraB' },
        { v: ['O', 'X', 'Z'], capa: 'caraC' }
      ],
      aristas: [
        { a: 'O', b: 'X', capa: 'aristas' },
        { a: 'O', b: 'Y', capa: 'aristas' },
        { a: 'O', b: 'Z', capa: 'aristas' }
      ],
      capas: [
        { id: 'caraA', nombre: 'Cara xOy', color: '#2c3c9e', activa: true, opacidad: 0.14 },
        { id: 'caraB', nombre: 'Cara yOz', color: '#b85c0d', activa: true, opacidad: 0.14 },
        { id: 'caraC', nombre: 'Cara zOx', color: '#0c7367', activa: true, opacidad: 0.14 },
        { id: 'aristas', nombre: 'Aristas', color: '#131829', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 6. Prisma recto: elementos y clasificación --- */
  (function () {
    var pr = prismaRecto({ a: 2.8, b: 2.1, h: 2.9 });
    var caras = pr.caras.map(function (f, i) {
      return { v: f, capa: i === 0 || i === 1 ? 'bases' : 'laterales' };
    });
    var vs = Object.assign({}, pr.vertices);
    // arista lateral destacada y altura
    vs.H = { p: v(0, 0, 1.05), etiqueta: 'h', sinEsfera: true };
    registrar('prisma-elementos', {
      titulo: 'Prisma recto y sus elementos',
      alt: 'Prisma recto de base rectangular A B C D con bases paralelas y caras laterales rectangulares; se marca la altura h.',
      pie: 'Un prisma recto tiene dos bases paralelas y caras laterales rectangulares. La altura h coincide con la arista lateral; si el prisma es oblicuo, no coinciden.',
      medidas: [['a × b', 'base', 'arista'], ['h', 'altura = arista lateral', 'altura']],
      camara: { theta: -0.68, phi: 0.3 },
      vertices: vs,
      caras: caras,
      aristas: pr.aristas.map(function (p) { return { a: p[0], b: p[1], capa: 'aristas' }; }),
      lineas: [
        { v: ['A1', 'H'], capa: 'altura', estilo: 'fuerte', grosor: 2.6 }
      ],
      capas: [
        { id: 'bases', nombre: 'Bases', color: '#2c3c9e', activa: true, opacidad: 0.16 },
        { id: 'laterales', nombre: 'Caras laterales', color: '#b85c0d', activa: true, opacidad: 0.1 },
        { id: 'aristas', nombre: 'Aristas', color: '#131829', activa: true },
        { id: 'altura', nombre: 'Altura', color: '#0c7367', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 7. MÓDULO ESTRELLA: prisma y diagonales (2:3:6) --- */
  (function () {
    var a = 2, b = 3, h = 6;
    var pr = prismaRecto({ a: a, b: b, h: h });
    var vs = Object.assign({}, pr.vertices);
    vs.d = { p: v(0, 0, 0), sinEsfera: true, etiqueta: false };
    registrar('prisma-diagonales', {
      titulo: 'Diagonales de cara y diagonal espacial',
      alt: 'Paralelepípedo recto de dimensiones 2, 3 y 6. Se muestran la diagonal AC de la base y la diagonal espacial que va de A a C₁.',
      pie: 'Las diagonales de cara viven dentro de una cara; la diagonal espacial une dos vértices no situados en la misma cara. Aquí AC₁ mide √(2² + 3² + 6²) = 7.',
      medidas: [['AB', '2 u', 'arista'], ['BC', '3 u', 'arista'], ['AA₁', '6 u', 'altura'], ['AC₁', '7 u', 'diagonal']],
      camara: { theta: 0.7, phi: 0.26 },
      vertices: vs,
      caras: pr.caras.map(function (f) { return { v: f, capa: 'caras' }; }),
      aristas: pr.aristas.map(function (p) { return { a: p[0], b: p[1], capa: 'aristas' }; }),
      lineas: [
        { v: ['A', 'C1'], capa: 'diagonal-espacial', estilo: 'fuerte', grosor: 3.4 },
        { v: ['A', 'C'], capa: 'diagonal-cara', estilo: 'fuerte', grosor: 2.4 }
      ],
      capas: [
        { id: 'caras', nombre: 'Caras', color: '#5b6bd6', activa: true, opacidad: 0.08 },
        { id: 'aristas', nombre: 'Aristas', color: '#131829', activa: true },
        { id: 'diagonal-cara', nombre: 'Diagonales de cara', color: '#b85c0d', activa: false },
        { id: 'diagonal-espacial', nombre: 'Diagonal espacial', color: '#a8271f', activa: false },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 8. Cubo con diagonal y sección hexagonal --- */
  (function () {
    var L = 2.6;
    var pr = prismaRecto({ a: L, b: L, h: L });
    var vs = Object.assign({}, pr.vertices);
    // El plano x + y + z = L/2 pasa por el centro y corta seis aristas
    // exactamente en sus puntos medios. Los seis lados miden L/sqrt(2).
    // El orden recorre el perímetro sin cruces, formando un hexágono regular.
    var hex = [
      v(L / 2, L / 2, -L / 2), v(L / 2, 0, 0),
      v(0, 0, L / 2), v(-L / 2, L / 2, L / 2),
      v(-L / 2, L, 0), v(0, L, -L / 2)
    ];
    hex.forEach(function (p, i) { vs['H' + i] = { p: p, etiqueta: 'H' + (i + 1) }; });
    registrar('cubo-seccion', {
      titulo: 'Sección plana de un cubo',
      alt: 'Cubo cortado por un plano que pasa por seis puntos medios de aristas, produciendo un hexágono; además se marca una diagonal espacial.',
      pie: 'Un plano bien elegido corta el cubo en un hexágono regular. La diagonal espacial del cubo mide a√3.',
      medidas: [['arista', 'a', 'arista'], ['diagonal', 'a√3', 'diagonal'], ['sección', 'hexágono regular', 'seccion']],
      camara: { theta: -0.7, phi: 0.34 },
      vertices: vs,
      caras: [
        { v: ['A', 'B', 'C', 'D'], capa: 'caras' },
        { v: ['H0', 'H1', 'H2', 'H3', 'H4', 'H5'], capa: 'seccion' }
      ],
      aristas: pr.aristas.map(function (p) { return { a: p[0], b: p[1], capa: 'aristas' }; }),
      lineas: [
        { v: ['D', 'B1'], capa: 'diagonal-espacial', estilo: 'fuerte', grosor: 2.6 },
        { pts: [vs.H0.p, vs.H1.p, vs.H2.p, vs.H3.p, vs.H4.p, vs.H5.p], capa: 'seccion', estilo: 'fuerte', grosor: 2.4, cerrado: true }
      ],
      capas: [
        { id: 'caras', nombre: 'Caras', color: '#5b6bd6', activa: true, opacidad: 0.06 },
        { id: 'aristas', nombre: 'Aristas', color: '#131829', activa: true },
        { id: 'seccion', nombre: 'Sección', color: '#a8271f', activa: false, opacidad: 0.2 },
        { id: 'diagonal-espacial', nombre: 'Diagonal', color: '#0c7367', activa: false },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: false }
      ]
    });
  })();

  /* --- 9. Paralelepípedo oblicuo vs recto --- */
  (function () {
    var a = 2.4, b = 2.0, h = 2.6, dx = 0.9;
    var A = v(-a / 2, 0, b / 2), B = v(a / 2, 0, b / 2), C = v(a / 2, 0, -b / 2), D = v(-a / 2, 0, -b / 2);
    var des = function (p) { return [p[0] + dx, p[1] + h, p[2]]; };
    var vs = {
      A: { p: A, etiqueta: 'A' }, B: { p: B, etiqueta: 'B' }, C: { p: C, etiqueta: 'C' }, D: { p: D, etiqueta: 'D' },
      A1: { p: des(A), etiqueta: 'A₁' }, B1: { p: des(B), etiqueta: 'B₁' },
      C1: { p: des(C), etiqueta: 'C₁' }, D1: { p: des(D), etiqueta: 'D₁' }
    };
    registrar('paralelepipedo-oblicuo', {
      titulo: 'Paralelepípedo oblicuo',
      alt: 'Paralelepípedo cuyas caras laterales son paralelogramos inclinados; la altura es menor que la arista lateral.',
      pie: 'En un paralelepípedo oblicuo las caras laterales son paralelogramos. La altura h (distancia entre bases) es menor que la arista lateral.',
      medidas: [['arista lateral', 'L', 'diagonal'], ['altura', 'h < L', 'altura']],
      camara: { theta: -0.6, phi: 0.28 },
      vertices: vs,
      caras: [
        { v: ['A', 'B', 'C', 'D'], capa: 'bases' },
        { v: ['A1', 'B1', 'C1', 'D1'], capa: 'bases' },
        { v: ['A', 'B', 'B1', 'A1'], capa: 'laterales' },
        { v: ['B', 'C', 'C1', 'B1'], capa: 'laterales' },
        { v: ['C', 'D', 'D1', 'C1'], capa: 'laterales' },
        { v: ['D', 'A', 'A1', 'D1'], capa: 'laterales' }
      ],
      aristas: [
        { a: 'A', b: 'B', capa: 'aristas' }, { a: 'B', b: 'C', capa: 'aristas' },
        { a: 'C', b: 'D', capa: 'aristas' }, { a: 'D', b: 'A', capa: 'aristas' },
        { a: 'A1', b: 'B1', capa: 'aristas' }, { a: 'B1', b: 'C1', capa: 'aristas' },
        { a: 'C1', b: 'D1', capa: 'aristas' }, { a: 'D1', b: 'A1', capa: 'aristas' },
        { a: 'A', b: 'A1', capa: 'aristas' }, { a: 'B', b: 'B1', capa: 'aristas' },
        { a: 'C', b: 'C1', capa: 'aristas' }, { a: 'D', b: 'D1', capa: 'aristas' }
      ],
      lineas: [
        { pts: [v(-a / 2, 0, b / 2), v(-a / 2 + dx, h, b / 2)], capa: 'arista-lateral', estilo: 'fuerte', grosor: 3 },
        { pts: [v(-a / 2, 0, b / 2), v(-a / 2, h, b / 2)], capa: 'altura', estilo: 'punteada', grosor: 2.4 }
      ],
      capas: [
        { id: 'bases', nombre: 'Bases', color: '#2c3c9e', activa: true, opacidad: 0.14 },
        { id: 'laterales', nombre: 'Caras laterales', color: '#b85c0d', activa: true, opacidad: 0.1 },
        { id: 'aristas', nombre: 'Aristas', color: '#131829', activa: true },
        { id: 'arista-lateral', nombre: 'Arista lateral', color: '#0c7367', activa: true },
        { id: 'altura', nombre: 'Altura', color: '#a8271f', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 10. Pirámide: altura, apotema, arista lateral --- */
  (function () {
    var pi = piramide({ a: 3, b: 3, h: 3.2 });
    var vs = Object.assign({}, pi.vertices);
    registrar('piramide-elementos', {
      titulo: 'Pirámide cuadrangular regular',
      alt: 'Pirámide de base cuadrada con vértice V; se muestran la altura VO, la apotema VM y la arista lateral VA.',
      pie: 'La altura VO llega al centro de la base; la apotema VM va al punto medio de una arista básica y la arista lateral VA une el vértice con un vértice de la base. El triángulo VOM es rectángulo.',
      medidas: [['VO', 'altura', 'altura'], ['VM', 'apotema', 'diagonal'], ['VA', 'arista lateral', 'aristas2']],
      camara: { theta: 0.66, phi: 0.26 },
      vertices: vs,
      caras: pi.caras.map(function (f, i) { return { v: f, capa: i === 0 ? 'base' : 'laterales' }; }),
      aristas: pi.aristas.map(function (p) { return { a: p[0], b: p[1], capa: 'aristas' }; }),
      lineas: [
        { v: ['V', 'O'], capa: 'altura', estilo: 'fuerte', grosor: 2.8 },
        { v: ['V', 'M'], capa: 'apotema', estilo: 'fuerte', grosor: 2.8 },
        { v: ['A', 'V'], capa: 'aristas2', estilo: 'fuerte', grosor: 2.6 },
        { pts: marcaRecta(vs.O.p, resta(vs.V.p, vs.O.p), resta(vs.M.p, vs.O.p), 0.4), capa: 'altura' }
      ],
      capas: [
        { id: 'base', nombre: 'Base', color: '#2c3c9e', activa: true, opacidad: 0.16 },
        { id: 'laterales', nombre: 'Caras laterales', color: '#b85c0d', activa: true, opacidad: 0.1 },
        { id: 'aristas', nombre: 'Aristas', color: '#131829', activa: true },
        { id: 'altura', nombre: 'Altura', color: '#0c7367', activa: true },
        { id: 'apotema', nombre: 'Apotema', color: '#a8271f', activa: true },
        { id: 'aristas2', nombre: 'Arista lateral', color: '#6b4ba8', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 11. Cilindro --- */
  (function () {
    var c = cilindro(1.5, 3.0, 44);
    var vs = Object.assign({}, c.vertices);
    vs.O = { p: v(0, 0, 0), etiqueta: 'O' };
    vs.A = { p: v(1.5, 0, 0), etiqueta: 'A' };
    vs.O2 = { p: v(0, 3.0, 0), etiqueta: "O'" };
    contorno(c);
    registrar('cilindro', {
      titulo: 'Cilindro circular recto',
      alt: 'Cilindro de radio r y altura h, con la generatriz que une las dos bases y el radio marcado en la base inferior.',
      pie: 'El cilindro recto se genera al girar un rectángulo alrededor de un lado. Su superficie lateral, al desarrollarse, es un rectángulo de base 2πr y altura h.',
      medidas: [['r', 'radio de la base', 'radio'], ['h', 'altura', 'altura']],
      camara: { theta: -0.55, phi: 0.24 },
      vertices: vs,
      caras: c.caras.map(function (f) { return { v: f, capa: 'lateral', traslucida: true }; }),
      aristas: [],
      lineas: [
        { v: c.polilineas[0], capa: 'bordes', estilo: 'fuerte', grosor: 2.2, cerrado: true },
        { v: c.polilineas[1], capa: 'bordes', estilo: 'fuerte', grosor: 2.2, cerrado: true },
        { v: ['O', 'A'], capa: 'radio', estilo: 'fuerte', grosor: 2.6 },
        { pts: [v(0, 0, 0), v(0, 3.0, 0)], capa: 'altura', estilo: 'punteada', grosor: 2.6 }
      ],
      capas: [
        { id: 'lateral', nombre: 'Superficie', color: '#5b6bd6', activa: true, opacidad: 0.08 },
        { id: 'bordes', nombre: 'Bordes', color: '#131829', activa: true },
        { id: 'radio', nombre: 'Radio', color: '#0c7367', activa: true },
        { id: 'altura', nombre: 'Altura', color: '#a8271f', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 12. Cono --- */
  (function () {
    var c = cono(1.6, 3.0, 44);
    var vs = Object.assign({}, c.vertices);
    vs.A = { p: v(1.6, 0, 0), etiqueta: 'A' };
    registrar('cono', {
      titulo: 'Cono circular recto',
      alt: 'Cono de radio r y altura h; se marca la generatriz g desde el vértice hasta un punto de la base.',
      pie: 'En el cono recto, la generatriz g, el radio r y la altura h forman un triángulo rectángulo: g² = r² + h². La superficie lateral desarrollada es un sector circular.',
      medidas: [['r', 'radio', 'radio'], ['h', 'altura', 'altura'], ['g', 'generatriz', 'generatriz']],
      camara: { theta: 0.58, phi: 0.26 },
      vertices: vs,
      caras: c.caras.map(function (f) { return { v: f, capa: 'lateral', traslucida: true }; }),
      aristas: [],
      lineas: [
        { v: c.polilineas[0], capa: 'bordes', estilo: 'fuerte', grosor: 2.2, cerrado: true },
        { pts: [v(0, 0, 0), v(0, 3.0, 0)], capa: 'altura', estilo: 'punteada', grosor: 2.6 },
        { v: ['V', 'A'], capa: 'generatriz', estilo: 'fuerte', grosor: 2.8 },
        { pts: [v(0, 0, 0), v(1.6, 0, 0)], capa: 'radio', estilo: 'fuerte', grosor: 2.4 }
      ],
      capas: [
        { id: 'lateral', nombre: 'Superficie', color: '#5b6bd6', activa: true, opacidad: 0.08 },
        { id: 'bordes', nombre: 'Borde de la base', color: '#131829', activa: true },
        { id: 'altura', nombre: 'Altura', color: '#a8271f', activa: true },
        { id: 'generatriz', nombre: 'Generatriz', color: '#b85c0d', activa: true },
        { id: 'radio', nombre: 'Radio', color: '#0c7367', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 13. Esfera (tratada como figura especial) --- */
  registrar('esfera', {
    tipo: 'esfera',
    titulo: 'Esfera y círculo máximo',
    alt: 'Esfera de radio R con un círculo máximo marcado y el radio trazado desde el centro.',
    pie: 'Todos los puntos de la esfera están a la misma distancia R del centro. Cualquier plano que pasa por el centro la corta en un círculo máximo de radio R.',
    medidas: [['R', 'radio', 'radio'], ['círculo máximo', '2πR', 'diagonal']],
    camara: { theta: -0.6, phi: 0.28 },
    radio: 1.7,
    capas: [
      { id: 'superficie', nombre: 'Superficie', color: '#5b6bd6', activa: true, opacidad: 0.1 },
      { id: 'meridianos', nombre: 'Meridianos', color: '#6c748c', activa: true },
      { id: 'radio', nombre: 'Radio', color: '#0c7367', activa: true }
    ]
  });

  /* --- 14. Tetraedro regular --- */
  (function () {
    var s = 2.8, r = s / Math.sqrt(3), hh = s * Math.sqrt(2 / 3);
    var base = [
      v(r, 0, 0), v(-r / 2, 0, (s / 2)), v(-r / 2, 0, -(s / 2))
    ];
    var vs = {
      A: { p: base[0], etiqueta: 'A' },
      B: { p: base[1], etiqueta: 'B' },
      C: { p: base[2], etiqueta: 'C' },
      V: { p: v(0, hh, 0), etiqueta: 'V' },
      O: { p: v(0, 0, 0), etiqueta: 'O' },
      M: { p: punto(base[1], base[2], 0.5), etiqueta: 'M' }
    };
    registrar('tetraedro', {
      titulo: 'Tetraedro regular',
      alt: 'Tetraedro regular con sus cuatro caras triangulares equiláteras, la altura VO y la apotema VM.',
      pie: 'El tetraedro regular tiene 4 caras, 6 aristas y 4 vértices. Si la arista es a: altura = a√(2/3), área total = a²√3 y volumen = a³√2/12.',
      medidas: [['a', 'arista', 'aristas'], ['h', 'a√(2/3)', 'altura']],
      camara: { theta: 0.7, phi: 0.34 },
      vertices: vs,
      caras: [
        { v: ['A', 'B', 'C'], capa: 'base' },
        { v: ['A', 'B', 'V'], capa: 'laterales' },
        { v: ['B', 'C', 'V'], capa: 'laterales' },
        { v: ['C', 'A', 'V'], capa: 'laterales' }
      ],
      aristas: [
        { a: 'A', b: 'B', capa: 'aristas' }, { a: 'B', b: 'C', capa: 'aristas' },
        { a: 'C', b: 'A', capa: 'aristas' }, { a: 'A', b: 'V', capa: 'aristas' },
        { a: 'B', b: 'V', capa: 'aristas' }, { a: 'C', b: 'V', capa: 'aristas' }
      ],
      lineas: [
        { v: ['V', 'O'], capa: 'altura', estilo: 'fuerte', grosor: 2.6 },
        { v: ['V', 'M'], capa: 'apotema', estilo: 'punteada', grosor: 2.2 }
      ],
      capas: [
        { id: 'base', nombre: 'Base', color: '#2c3c9e', activa: true, opacidad: 0.16 },
        { id: 'laterales', nombre: 'Caras laterales', color: '#b85c0d', activa: true, opacidad: 0.1 },
        { id: 'aristas', nombre: 'Aristas', color: '#131829', activa: true },
        { id: 'altura', nombre: 'Altura', color: '#0c7367', activa: true },
        { id: 'apotema', nombre: 'Apotema', color: '#a8271f', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 15. Octaedro regular --- */
  (function () {
    var s = 2.9, r = s / Math.SQRT2;
    var vs = {
      N: { p: v(0, r, 0), etiqueta: 'N' },
      S: { p: v(0, -r, 0), etiqueta: 'S' },
      E: { p: v(r, 0, 0), etiqueta: 'E' },
      W: { p: v(-r, 0, 0), etiqueta: 'W' },
      F: { p: v(0, 0, r), etiqueta: 'F' },
      B: { p: v(0, 0, -r), etiqueta: 'B' }
    };
    var caras = [['N', 'E', 'F'], ['N', 'F', 'W'], ['N', 'W', 'B'], ['N', 'B', 'E'],
      ['S', 'E', 'F'], ['S', 'F', 'W'], ['S', 'W', 'B'], ['S', 'B', 'E']];
    var aristas = [];
    var bordes = [['N', 'E'], ['N', 'F'], ['N', 'W'], ['N', 'B'], ['S', 'E'], ['S', 'F'], ['S', 'W'], ['S', 'B'], ['E', 'F'], ['F', 'W'], ['W', 'B'], ['B', 'E']];
    bordes.forEach(function (p) { aristas.push({ a: p[0], b: p[1], capa: 'aristas' }); });
    registrar('octaedro', {
      titulo: 'Octaedro regular',
      alt: 'Octaedro regular formado por ocho triángulos equiláteros, con un eje y un plano ecuatorial señalados.',
      pie: 'El octaedro regular tiene 8 caras, 12 aristas y 6 vértices: es el dual del cubo. Si la arista es a, el volumen es a³√2/3 y el área total 2a²√3.',
      medidas: [['a', 'arista', 'aristas'], ['V', 'a³√2/3', 'altura']],
      camara: { theta: -0.66, phi: 0.3 },
      vertices: vs,
      caras: caras.map(function (f) { return { v: f, capa: 'caras' }; }),
      aristas: aristas,
      lineas: [{ v: ['N', 'S'], capa: 'eje', estilo: 'punteada', grosor: 2.2 }],
      capas: [
        { id: 'caras', nombre: 'Caras', color: '#5b6bd6', activa: true, opacidad: 0.08 },
        { id: 'aristas', nombre: 'Aristas', color: '#131829', activa: true },
        { id: 'eje', nombre: 'Eje', color: '#a8271f', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* --- 16. Sección plana de un prisma: corte triangular --- */
  (function () {
    var pr = prismaRecto({ a: 2.6, b: 2.6, h: 3.0 });
    var vs = Object.assign({}, pr.vertices);
    registrar('seccion-prisma', {
      titulo: 'Sección plana de un prisma',
      alt: 'Prisma recto cortado por un plano inclinado que produce un triángulo como sección.',
      pie: 'La intersección de un plano con un prisma recto es un polígono cuyos lados están contenidos en las caras del prisma. Si el plano es paralelo a las bases, la sección es congruente con la base.',
      medidas: [['sección', 'polígono', 'seccion']],
      camara: { theta: -0.6, phi: 0.3 },
      vertices: vs,
      caras: pr.caras.map(function (f) { return { v: f, capa: 'caras' }; }),
      aristas: pr.aristas.map(function (p) { return { a: p[0], b: p[1], capa: 'aristas' }; }),
      lineas: [
        { v: ['A', 'B1', 'C'], capa: 'seccion', estilo: 'fuerte', grosor: 2.6, cerrado: true }
      ],
      capas: [
        { id: 'caras', nombre: 'Caras', color: '#5b6bd6', activa: true, opacidad: 0.06 },
        { id: 'aristas', nombre: 'Aristas', color: '#1b2033', activa: true },
        { id: 'seccion', nombre: 'Sección', color: '#a8271f', activa: true },
        { id: 'etiquetas', nombre: 'Nombres', color: '#6c748c', activa: true }
      ]
    });
  })();

  /* Helper: marca curvas de contorno (cilindro/cono) sin bordes verticales */
  function contorno() { /* reservado: los bordes verticales no se dibujan */ }

  /* ---------- Explicaciones didácticas paso a paso (Modo Maestro) ---------- */
  var PASOS_FIGURAS = {
    'prisma-elementos': [
      {
        titulo: 'Identificación del prisma recto',
        texto: 'Un prisma recto es un poliedro con dos bases poligonales paralelas e idénticas, y caras laterales perpendiculares a ellas.',
        camara: { theta: -0.68, phi: 0.3 },
        capaResaltada: 'bases'
      },
      {
        titulo: 'Las bases superior e inferior',
        texto: 'Miren las dos bases en color azul. Al ser paralelas e iguales, definen el área basal que usaremos para el volumen.',
        camara: { theta: -0.68, phi: 0.65 },
        capaResaltada: 'bases'
      },
      {
        titulo: 'Caras laterales y aristas',
        texto: 'Las caras laterales en color ámbar son rectángulos perfectos. Cada arista lateral une vértices correspondientes de ambas bases.',
        camara: { theta: 0.35, phi: 0.2 },
        capaResaltada: 'laterales'
      },
      {
        titulo: 'La altura del prisma',
        texto: 'La línea verde vertical es la altura h. En todo prisma recto, la altura mide exactamente lo mismo que la arista lateral.',
        camara: { theta: -0.68, phi: 0.25 },
        capaResaltada: 'altura'
      },
      {
        titulo: 'Fórmulas maestras de cálculo',
        texto: 'Área Total = Área Lateral + 2 veces el Área de la Base. Y el Volumen = Área de la base por la altura.',
        camara: { theta: -0.68, phi: 0.3 },
        capaResaltada: 'bases'
      }
    ],
    'prisma-diagonales': [
      {
        titulo: 'Dimensiones del ortoedro',
        texto: 'Tenemos un paralelepípedo recto de aristas 2, 3 y 6. Fíjense cómo se distribuyen en el largo, ancho y alto.',
        camara: { theta: 0.7, phi: 0.26 },
        capasVisibles: ['caras', 'aristas', 'etiquetas'],
        capaResaltada: 'aristas'
      },
      {
        titulo: 'Diagonales de cara',
        texto: 'La línea naranja AC es la diagonal de la base. En esa base de 2 por 3, AC al cuadrado es 2 al cuadrado más 3 al cuadrado: 13. Por tanto, AC mide raíz cuadrada de 13.',
        camara: { theta: 0.7, phi: 0.58 },
        capasVisibles: ['aristas', 'diagonal-cara', 'etiquetas'],
        capaResaltada: 'diagonal-cara'
      },
      {
        titulo: 'La diagonal espacial AC₁',
        texto: '¡Miren la línea roja que cruza el interior del sólido! Une dos vértices opuestos sin compartir cara: es la diagonal espacial.',
        camara: { theta: 0.7, phi: 0.26 },
        capasVisibles: ['aristas', 'diagonal-espacial', 'etiquetas'],
        capaResaltada: 'diagonal-espacial'
      },
      {
        titulo: 'Pitágoras en tres dimensiones',
        texto: 'La fórmula es: <span class="m">d² = a² + b² + c²</span>. Con 2, 3 y 6: <span class="m">4 + 9 + 36 = 49</span>. La diagonal mide <span class="m">√49 = 7</span> unidades.',
        camara: { theta: 0.7, phi: 0.26 },
        capasVisibles: ['aristas', 'diagonal-espacial', 'etiquetas'],
        capaResaltada: 'diagonal-espacial'
      }
    ],
    'cubo-seccion': [
      {
        titulo: 'El cubo y sus aristas',
        texto: 'Un cubo regular posee seis caras cuadradas idénticas y doce aristas de igual longitud.',
        camara: { theta: -0.7, phi: 0.35 },
        capasVisibles: ['caras', 'aristas'],
        capaResaltada: 'caras'
      },
      {
        titulo: 'Corte por los puntos medios',
        texto: 'Al hacer pasar un plano secante por los puntos medios de 6 aristas consecutivas, cortamos el sólido.',
        camara: { theta: 0.78, phi: 0.62 },
        capasVisibles: ['caras', 'aristas', 'seccion'],
        capaResaltada: 'seccion'
      },
      {
        titulo: 'El hexágono regular resultante',
        texto: '¡Observen la sección roja! El resultado es un hexágono regular perfecto, perpendicular a la diagonal espacial del cubo.',
        camara: { theta: 0.78, phi: 0.62 },
        capasVisibles: ['caras', 'aristas', 'seccion'],
        capaResaltada: 'seccion'
      }
    ],
    'paralelepipedo-oblicuo': [
      {
        titulo: 'El prisma oblicuo',
        texto: 'En este paralelepípedo, las aristas laterales están inclinadas respecto al plano de la base.',
        camara: { theta: -0.65, phi: 0.28 },
        capaResaltada: 'laterales'
      },
      {
        titulo: 'Arista lateral versus altura',
        texto: '¡Cuidado en los exámenes! Al estar inclinada, la arista lateral mide más que la altura vertical real.',
        camara: { theta: -0.65, phi: 0.28 },
        capaResaltada: 'altura'
      },
      {
        titulo: 'Cálculo de volumen',
        texto: 'El volumen es el área de la base por la altura, o el área de la sección recta por la arista lateral.',
        camara: { theta: -0.65, phi: 0.28 },
        capaResaltada: 'arista-lateral'
      }
    ],
    'piramide-elementos': [
      {
        titulo: 'Estructura de la pirámide regular',
        texto: 'Tiene una base poligonal y caras laterales triangulares que convergen en un único vértice o cúspide.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'base'
      },
      {
        titulo: 'La altura vertical',
        texto: 'La línea verde es la altura real de la pirámide: el segmento perpendicular desde el vértice hasta el centro de la base.',
        camara: { theta: -0.65, phi: 0.25 },
        capaResaltada: 'altura'
      },
      {
        titulo: 'La apotema de la pirámide',
        texto: 'La línea roja inclinada es la apotema: la altura de una cara lateral triangular.',
        camara: { theta: 0.45, phi: 0.3 },
        capaResaltada: 'apotema'
      },
      {
        titulo: 'El volumen piramidal',
        texto: 'El volumen de toda pirámide es exactamente un tercio del área de su base multiplicada por su altura.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'base'
      }
    ],
    'cilindro': [
      {
        titulo: 'Cuerpo de revolución',
        texto: 'El cilindro recto se forma al hacer girar un rectángulo completo alrededor de uno de sus lados.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'lateral'
      },
      {
        titulo: 'Bases circulares y radio',
        texto: 'Sus bases son dos círculos congruentes y paralelos de radio R.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'radio'
      },
      {
        titulo: 'Volumen cilíndrico',
        texto: 'Volumen = pi por radio al cuadrado por altura. ¡Es como una pila infinita de monedas!',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'altura'
      }
    ],
    'cono': [
      {
        titulo: 'Cono de revolución',
        texto: 'Generado al girar un triángulo rectángulo alrededor de uno de sus catetos fijos.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'lateral'
      },
      {
        titulo: 'El trío pitagórico del cono',
        texto: 'El radio de la base, la altura vertical y la generatriz inclinada forman siempre un triángulo rectángulo.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'generatriz'
      },
      {
        titulo: 'Volumen del cono',
        texto: 'El volumen del cono es exactamente la tercera parte del cilindro que lo contiene: un tercio de pi por radio al cuadrado por h.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'altura'
      }
    ],
    'esfera': [
      {
        titulo: 'La esfera y su centro',
        texto: 'Todos los puntos de la superficie esférica se encuentran a la misma distancia R del centro O.',
        camara: { theta: 0.7, phi: 0.3 },
        capaResaltada: 'superficie'
      },
      {
        titulo: 'Círculo máximo',
        texto: 'Cualquier plano secante que pasa por el centro O corta a la esfera en un círculo máximo de radio R.',
        camara: { theta: 0.7, phi: 0.5 },
        capaResaltada: 'meridianos'
      },
      {
        titulo: 'Fórmulas de Arquímedes',
        texto: 'Área superficial = 4 por pi por radio al cuadrado. Volumen = cuatro tercios de pi por radio al cubo.',
        camara: { theta: 0.7, phi: 0.3 },
        capaResaltada: 'radio'
      }
    ],
    'tetraedro': [
      {
        titulo: 'El tetraedro regular',
        texto: 'Sólido platónico formado por cuatro caras que son triángulos equiláteros congruentes.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'laterales'
      },
      {
        titulo: 'Altura y simetría',
        texto: 'La altura cae exactamente sobre el centroide de la base opuesta, midiendo arista por raíz de 6 sobre 3.',
        camara: { theta: -0.65, phi: 0.25 },
        capaResaltada: 'altura'
      },
      {
        titulo: 'Volumen del tetraedro',
        texto: 'Su volumen es arista al cubo por la raíz de 2, dividido entre 12.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'base'
      }
    ],
    'octaedro': [
      {
        titulo: 'El octaedro regular',
        texto: 'Formado por 8 triángulos equiláteros. Puede verse como dos pirámides de base cuadrada unidas por su base.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'caras'
      },
      {
        titulo: 'Diagonales ortogonales',
        texto: 'Tiene tres diagonales de igual longitud, que son perpendiculares entre sí y se cortan en su punto medio.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'eje'
      }
    ],
    'seccion-prisma': [
      {
        titulo: 'Sección plana de un prisma',
        texto: 'Un plano secante no paralelo corta las aristas laterales formando un polígono de sección.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'seccion'
      },
      {
        titulo: 'Tronco de prisma',
        texto: 'La parte de sólido que queda entre la base y la sección es un tronco de prisma triangular.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'aristas'
      }
    ],
    'planos-corte': [
      {
        titulo: 'Planos secantes',
        texto: 'Dos planos en el espacio que se cortan tienen como intersección una recta completa.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'interseccion'
      },
      {
        titulo: 'La recta de corte',
        texto: 'La línea roja r es la recta común compartida por ambos planos alfa y beta.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'interseccion'
      }
    ],
    'recta-plano-angulo': [
      {
        titulo: 'Recta y plano secante',
        texto: 'Una recta oblicua corta al plano en un punto y genera una sombra perpendicular: su proyección ortogonal.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'recta'
      },
      {
        titulo: 'El ángulo recta-plano',
        texto: 'El ángulo de una recta con un plano es el ángulo agudo que forma la recta con su propia proyección ortogonal.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'angulo'
      }
    ],
    'perpendicular-plano': [
      {
        titulo: 'Perpendicularidad recta-plano',
        texto: 'Una recta es perpendicular a un plano si es perpendicular a TODA recta contenida en él que pase por su pie.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'perpendicular'
      },
      {
        titulo: 'Tres perpendiculares',
        texto: 'El Teorema de las Tres Perpendiculares es la herramienta rey para calcular distancias y diedros en exámenes tipo UNI.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'perpendicular'
      }
    ],
    'proyeccion-distancia': [
      {
        titulo: 'Distancia de un punto a un plano',
        texto: 'La distancia desde un punto P hasta un plano se mide siempre sobre el segmento perpendicular trazado hacia él.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'distancia'
      },
      {
        titulo: 'El triángulo rectángulo métrico',
        texto: 'Cualquier recta oblicua trazada desde P forma la hipotenusa de un triángulo rectángulo, siendo siempre mayor que la distancia perpendicular.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'distancia'
      }
    ],
    'triedro': [
      {
        titulo: 'El ángulo triedro',
        texto: 'Figura formada por tres semirrectas que parten de un mismo vértice, delimitando tres caras angulares.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'caraA'
      },
      {
        titulo: 'Desigualdad de caras',
        texto: 'En cualquier triedro real, cada cara es estrictamente menor que la suma de las otras dos.',
        camara: { theta: -0.65, phi: 0.3 },
        capaResaltada: 'aristas'
      }
    ]
  };

  /* ---------- API ---------- */
  function puntoAtencion(spec, capa) {
    function puntos(ids) { return (ids || []).map(function(id){return Array.isArray(id)?id:spec.vertices && spec.vertices[id] && spec.vertices[id].p;}).filter(function(p){return p && p.length===3 && p.every(Number.isFinite);}); }
    var linea=(spec.lineas || []).find(function(l){return l.capa===capa;});
    var ps=linea?puntos(linea.pts || linea.v):[];
    if(!ps.length) {
      var arista=(spec.aristas || []).find(function(a){return (a.capa || 'aristas')===capa;});
      if(arista)ps=puntos([arista.a,arista.b]);
    }
    if(!ps.length) {
      var cara=(spec.caras || []).find(function(c){return c.capa===capa;});
      if(cara)ps=puntos(cara.v);
    }
    if(!ps.length && spec.tipo==='esfera')return [spec.radio*0.6,0,0];
    if(!ps.length)ps=puntos(Object.keys(spec.vertices || {}));
    return ps.length?centroide(ps):null;
  }
  global.Figuras = {
    puntoAtencion: puntoAtencion,
    spec: FIGURAS,
    obtener: function (id) {
      var fig = FIGURAS[id] || null;
      if (fig && !fig.pasosGuia && PASOS_FIGURAS[id]) {
        fig.pasosGuia = PASOS_FIGURAS[id];
      }
      return fig;
    },
    pasos: PASOS_FIGURAS,
    construirCamara: baseCamara,
    ojoCamara: ojoCamara,
    vectores: {
      suma: suma, resta: resta, escala: escala, cruz: cruz,
      punto: punto3, unitario: unitario, norma: norma, centroide: centroide
    }
  };
})(window);
