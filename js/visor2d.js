/* ============================================================
   visor2d.js — alternativa 2D en SVG
   ------------------------------------------------------------
   Proyecta la MISMA especificación de figuras.js con la MISMA
   cámara que el visor 3D, y aplica un algoritmo de líneas
   ocultas por sondeo (cada arista se considera oculta si la
   mayoría de sus puntos cae dentro de una cara frontal más
   cercana a la cámara). No necesita WebGL ni descarga nada:
   funciona en dispositivos modestos y con movimiento reducido.
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  function el(nombre, attrs) {
    var n = global.document.createElementNS(NS, nombre);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function puntosDeSpec(spec) {
    var ps = [];
    if (spec.tipo === 'esfera') return ps;
    Object.keys(spec.vertices || {}).forEach(function (k) { ps.push(spec.vertices[k].p); });
    (spec.lineas || []).forEach(function (l) {
      if (l.pts) l.pts.forEach(function (p) { ps.push(p); });
      if (l.v) l.v.forEach(function (id) {
        var v = spec.vertices[id];
        if (v) ps.push(v.p);
      });
    });
    return ps;
  }

  function radioDe(ps) {
    if (!ps.length) return 1;
    var c = [0, 0, 0];
    ps.forEach(function (p) { c = [c[0] + p[0], c[1] + p[1], c[2] + p[2]]; });
    c = [c[0] / ps.length, c[1] / ps.length, c[2] / ps.length];
    var m = 0;
    ps.forEach(function (p) {
      var d = Math.sqrt(Math.pow(p[0] - c[0], 2) + Math.pow(p[1] - c[1], 2) + Math.pow(p[2] - c[2], 2));
      if (d > m) m = d;
    });
    return m || 1;
  }

  function centroDe(ps, spec) {
    if (spec.tipo === 'esfera') return [0, 0, 0];
    if (!ps.length) return [0, 0, 0];
    var lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    ps.forEach(function (p) {
      for (var i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p[i]); hi[i] = Math.max(hi[i], p[i]); }
    });
    return [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
  }

  function dentroDePoligono(pt, poly) {
    var x = pt[0], y = pt[1], dentro = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) dentro = !dentro;
    }
    return dentro;
  }

  /* Dibuja la figura en un <svg> que ocupa el contenedor. */
  function render(contenedor, spec, opciones) {
    opciones = opciones || {};
    var ancho = contenedor.clientWidth || 600;
    var alto = contenedor.clientHeight || 340;
    var capasOcultas = opciones.capasOcultas || {};

    contenedor.innerHTML = '';

    var ps = puntosDeSpec(spec);
    var centro = centroDe(ps, spec);
    var radio = spec.tipo === 'esfera' ? spec.radio : radioDe(ps);
    var eye = global.Figuras.ojoCamara(opciones.camara || spec.camara || { theta: 0.7, phi: 0.3 }, centro, radio);
    var base = global.Figuras.construirCamara(eye.p, centro);
    var V = global.Figuras.vectores;

    var focal = eye.dist * 1.05;
    var proy = [];
    function proyectar(p) {
      var d = V.resta(p, eye.p);
      var z = Math.max(0.05, d[0] * base.f[0] + d[1] * base.f[1] + d[2] * base.f[2]);
      var x = (d[0] * base.r[0] + d[1] * base.r[1] + d[2] * base.r[2]) * focal / z;
      var y = (d[0] * base.u[0] + d[1] * base.u[1] + d[2] * base.u[2]) * focal / z;
      return { x: x, y: y, z: z };
    }

    // Muestreo para calcular la caja de la proyección
    var muestras = ps.map(proyectar);
    if (spec.tipo === 'esfera') {
      for (var s = 0; s < 24; s++) {
        var a = (s / 24) * Math.PI * 2;
        muestras.push(proyectar([spec.radio * Math.cos(a), 0, spec.radio * Math.sin(a)]));
        muestras.push(proyectar([0, spec.radio * Math.sin(a), spec.radio * Math.cos(a)]));
      }
    }
    if (!muestras.length) return;

    var xs = muestras.map(function (m) { return m.x; });
    var ys = muestras.map(function (m) { return m.y; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var pad = 46; // margen para las etiquetas
    var esc = Math.min((ancho - pad * 2) / Math.max(0.001, x1 - x0), (alto - pad * 2) / Math.max(0.001, y1 - y0));
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;

    function aPantalla(p) {
      var q = proyectar(p);
      return {
        x: ancho / 2 + (q.x - cx) * esc,
        y: alto / 2 - (q.y - cy) * esc,
        z: q.z
      };
    }

    var svg = el('svg', {
      class: 'figura-2d',
      viewBox: '0 0 ' + ancho + ' ' + alto,
      role: 'img',
      'aria-label': spec.alt || spec.titulo || 'Figura geométrica'
    });
    var tituloSvg = el('title');
    tituloSvg.textContent = spec.alt || spec.titulo || '';
    svg.appendChild(tituloSvg);

    var gCaras = el('g', { class: 'capa-caras' });
    var gLineas = el('g', { class: 'capa-aristas' });
    var gEtiquetas = el('g', { class: 'capa-etiquetas' });
    svg.appendChild(gCaras);
    svg.appendChild(gLineas);
    svg.appendChild(gEtiquetas);

    function capa(id) {
      var lista = spec.capas || [];
      for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
      return { color: '#5b6bd6', activa: true, opacidad: 0.12 };
    }
    function activa(id) {
      if(Object.prototype.hasOwnProperty.call(capasOcultas,id))return !capasOcultas[id];
      if (capasOcultas[id]) return false;
      return capa(id).activa !== false;
    }

    /* ---------- caras ---------- */
    var triangulos = [];
    (spec.caras || []).forEach(function (cara) {
      var ids = cara.v || [];
      var capaId = cara.capa || 'caras';
      if (!activa(capaId)) return;
      var pts = [], ps3 = [];
      for (var i = 0; i < ids.length; i++) {
        var v = spec.vertices[ids[i]];
        if (!v) return;
        ps3.push(v.p);
        pts.push(aPantalla(v.p));
      }
      if (pts.length < 3) return;
      var c3 = V.centroide(ps3);
      var normal = V.cruz(V.resta(ps3[1], ps3[0]), V.resta(ps3[2], ps3[0]));
      var haciaOjo = V.resta(eye.p, c3);
      var frontal = (normal[0] * haciaOjo[0] + normal[1] * haciaOjo[1] + normal[2] * haciaOjo[2]) > 0;
      var prof = proyectar(c3).z;

      var d = 'M' + pts.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join('L') + 'Z';
      var def = capa(capaId);
      var opac = cara.traslucida ? (def.opacidad || 0.1) : (def.opacidad != null ? def.opacidad : 0.14);
      if (!frontal) opac = Math.min(opac, 0.05);
      var path = el('path', {
        d: d,
        fill: def.color,
        'fill-opacity': opac,
        stroke: def.color,
        'stroke-opacity': frontal ? 0.35 : 0.14,
        'stroke-width': 1
      });
      gCaras.appendChild(path);

      for (var t = 1; t < pts.length - 1; t++) {
        triangulos.push({
          poly: [pts[0], pts[t], pts[t + 1]],
          z: prof,
          frontal: frontal
        });
      }
    });

    /* ---------- ocultación por sondeo ---------- */
    function tramosOcultos(pts) {
      // devuelve lista de segmentos con bandera de oculto
      var resultado = [];
      var pasos = Math.max(8, Math.min(28, Math.round(distanciaTotal(pts) / 12)));
      var muestras = [];
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1];
        for (var j = 0; j < pasos; j++) {
          var t = j / pasos;
          var px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
          var pz = a.z + (b.z - a.z) * t;
          var oculto = false;
          for (var k = 0; k < triangulos.length; k++) {
            var tri = triangulos[k];
            if (!tri.frontal) continue;
            if (tri.z < pz - radio * 0.06) {
              if (dentroDePoligono([px, py], tri.poly)) { oculto = true; break; }
            }
          }
          muestras.push({ i: i, t: t, oculto: oculto, a: a, b: b });
        }
      }
      // agrupa en tramos consecutivos con el mismo estado
      var actual = null;
      muestras.forEach(function (m) {
        if (!actual || actual.oculto !== m.oculto) {
          if (actual) resultado.push(actual);
          actual = { oculto: m.oculto, i: m.i, desde: m.t, hasta: m.t };
        } else {
          actual.hasta = m.t;
        }
        actual.a = m.a; actual.b = m.b;
      });
      if (actual) resultado.push(actual);
      return resultado;
    }

    function distanciaTotal(pts) {
      var d = 0;
      for (var i = 0; i < pts.length - 1; i++) d += Math.abs(pts[i + 1].x - pts[i].x) + Math.abs(pts[i + 1].y - pts[i].y);
      return d;
    }

    function dibujarPolilinea(pts3, def, estilo, grosor, cerrado) {
      var pts = pts3.map(aPantalla);
      if (cerrado) pts.push(pts[0]);
      var tramos = tramosOcultos(pts);
      var base = {
        fill: 'none',
        stroke: def.color,
        'stroke-width': (grosor || 2),
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      };
      if (estilo === 'punteada') base['stroke-dasharray'] = '5 4';
      var d = '';
      pts.forEach(function (p, i) { d += (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
      var pathVisible = el('path', Object.assign({}, base, { d: d }));
      gLineas.appendChild(pathVisible);

      // Los tramos ocultos se sobrepintan con trazo discontinuo claro
      tramos.forEach(function (tr) {
        if (!tr.oculto) return;
        var x1 = tr.a.x + (tr.b.x - tr.a.x) * tr.desde;
        var y1 = tr.a.y + (tr.b.y - tr.a.y) * tr.desde;
        var x2 = tr.a.x + (tr.b.x - tr.a.x) * tr.hasta;
        var y2 = tr.a.y + (tr.b.y - tr.a.y) * tr.hasta;
        var oc = el('path', {
          d: 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ',' + y2.toFixed(1),
          stroke: '#fdfcf9',
          'stroke-width': (grosor || 2) + 2,
          'stroke-linecap': 'round',
          fill: 'none'
        });
        gLineas.appendChild(oc);
        var oc2 = el('path', {
          d: 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ',' + y2.toFixed(1),
          stroke: def.color,
          'stroke-width': (grosor || 2) * 0.8,
          'stroke-dasharray': '4 4',
          'stroke-opacity': 0.55,
          'stroke-linecap': 'round',
          fill: 'none'
        });
        gLineas.appendChild(oc2);
      });
    }

    /* ---------- aristas ---------- */
    (spec.aristas || []).forEach(function (ar) {
      var capaId = ar.capa || 'aristas';
      if (!activa(capaId)) return;
      var va = spec.vertices[ar.a], vb = spec.vertices[ar.b];
      if (!va || !vb) return;
      dibujarPolilinea([va.p, vb.p], capa(capaId), ar.estilo || 'fuerte', 1.9, false);
    });

    /* ---------- líneas especiales ---------- */
    (spec.lineas || []).forEach(function (l) {
      var capaId = l.capa || 'aristas';
      if (!activa(capaId)) return;
      var pts3 = [];
      if (l.pts) pts3 = l.pts;
      else if (l.v) {
        l.v.forEach(function (id) {
          if (typeof id === 'string' && spec.vertices[id]) pts3.push(spec.vertices[id].p);
          else if (Array.isArray(id)) pts3.push(id);
        });
      }
      if (pts3.length < 2) return;
      dibujarPolilinea(pts3, capa(capaId), l.estilo || 'fuerte', l.grosor || 2.2, !!l.cerrado);
    });

    /* ---------- esfera ---------- */
    if (spec.tipo === 'esfera') {
      var c = aPantalla([0, 0, 0]);
      // Silueta circular: el radio proyectado no depende de la orientación de cámara.
      var r = spec.radio * (focal / eye.dist) * esc;
      if (activa('superficie')) {
        svg.insertBefore(el('circle', {
          cx: c.x.toFixed(1), cy: c.y.toFixed(1), r: r.toFixed(1),
          fill: capa('superficie').color, 'fill-opacity': capa('superficie').opacidad || 0.1,
          stroke: '#131829', 'stroke-width': 1.6, 'stroke-opacity': .55
        }), gLineas);
      }

      // Círculos en tres planos para dar volumen
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (eje, idx) {
        var capaId = idx === 1 ? 'meridianos' : 'meridianos';
        if (!activa(capaId)) return;
        var pts = [];
        for (var i = 0; i <= 48; i++) {
          var a = (i / 48) * Math.PI * 2;
          var p;
          if (idx === 0) p = [0, spec.radio * Math.cos(a), spec.radio * Math.sin(a)];
          else if (idx === 1) p = [spec.radio * Math.cos(a), 0, spec.radio * Math.sin(a)];
          else p = [spec.radio * Math.cos(a), spec.radio * Math.sin(a), 0];
          pts.push(aPantalla(p));
        }
        var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join('');
        gEtiquetas.appendChild(el('path', {
          d: d + 'Z', fill: 'none', stroke: capa('meridianos').color,
          'stroke-width': idx === 1 ? 1.8 : 1, 'stroke-opacity': idx === 1 ? .8 : .38,
          'stroke-dasharray': idx === 1 ? 'none' : '4 4'
        }));
      });

      if (activa('radio')) {
        var p0 = c, p1 = aPantalla([spec.radio * 0.72, spec.radio * 0.58, 0]);
        gLineas.appendChild(el('line', {
          x1: p0.x.toFixed(1), y1: p0.y.toFixed(1), x2: p1.x.toFixed(1), y2: p1.y.toFixed(1),
          stroke: capa('radio').color, 'stroke-width': 2.4, 'stroke-linecap': 'round'
        }));
        gEtiquetas.appendChild(texto('R', p1.x + 6, p1.y - 4, capa('radio').color, true));
        gEtiquetas.appendChild(el('circle', { cx: p0.x.toFixed(1), cy: p0.y.toFixed(1), r: 2.6, fill: '#131829' }));
        gEtiquetas.appendChild(texto('O', p0.x - 12, p0.y + 14, '#6c748c', true));
      }
    }

    /* ---------- vértices y etiquetas ---------- */
    var mostrarVertices = activa('vertices');
    var mostrarEtiquetas = activa('etiquetas');
    if (spec.tipo !== 'esfera') {
      Object.keys(spec.vertices || {}).forEach(function (k) {
        var v = spec.vertices[k];
        var q = aPantalla(v.p);
        if (mostrarVertices && !v.sinEsfera) {
          gEtiquetas.appendChild(el('circle', {
            cx: q.x.toFixed(1), cy: q.y.toFixed(1), r: 2.9,
            fill: '#fdfcf9', stroke: '#131829', 'stroke-width': 1.5
          }));
        }
        if (mostrarEtiquetas && v.etiqueta && v.sinEtiqueta !== true) {
          var dx = 8, dy = -8;
          if (v.etiqueta.length > 1) { dx = 6; dy = 14; }
          gEtiquetas.appendChild(texto(v.etiqueta, q.x + dx, q.y + dy, '#414a63', true));
        }
      });
    }

    function texto(t, x, y, color, negrita) {
      var n = el('text', {
        x: x.toFixed(1), y: y.toFixed(1),
        fill: color || '#414a63',
        'font-size': '12',
        'font-family': '"JetBrains Mono", ui-monospace, monospace',
        'font-weight': negrita ? '600' : '400',
        'text-anchor': 'middle',
        'paint-order': 'stroke',
        stroke: '#fdfcf9',
        'stroke-width': 3,
        'stroke-linejoin': 'round'
      });
      n.textContent = t;
      return n;
    }

    contenedor.appendChild(svg);
    return {proyectar:function(p){var q=aPantalla(p);q.visible=q.x>=0&&q.x<=ancho&&q.y>=0&&q.y<=alto;return q;}};
  }

  global.Visor2D = { render: render };
})(window);
