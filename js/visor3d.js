/* ============================================================
   visor3d.js — visor Three.js universal
   ------------------------------------------------------------
   - Compatible con carga directa por <script> (file:// y http://)
     y con carga diferida.
   - Controles de órbita (arrastre, rueda, teclado, pellizco).
   - Animación de cámara suave para Modo Maestro (enfocarCamara).
   - Resaltado temporal de capas geométricas para explicaciones.
   ============================================================ */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(typeof THREE !== 'undefined' ? THREE : null);
  } else {
    var THREE_REF = root.THREE || (typeof window !== 'undefined' ? window.THREE : null);
    var mod = factory(THREE_REF);
    root.Visor3D = mod.Visor3D;
    root.soportaWebGL = mod.soportaWebGL;
  }
})(typeof self !== 'undefined' ? self : this, function (THREE) {
  'use strict';

  function getTHREE() {
    if (THREE) return THREE;
    if (typeof window !== 'undefined' && window.THREE) return window.THREE;
    return null;
  }

  function soportaWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
      return false;
    }
  }

  function colorDe(spec, id) {
    var lista = spec.capas || [];
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) return lista[i];
    }
    return { color: '#5b6bd6', opacidad: 0.12 };
  }

  function opacidadDe(spec, id) {
    var c = colorDe(spec, id);
    return c.opacidad != null ? c.opacidad : 0.12;
  }

  function Visor3D(contenedor, spec, opciones) {
    var T = getTHREE();
    if (!T) {
      throw new Error('Three.js no está disponible en memoria');
    }

    this.THREE = T;
    this.contenedor = contenedor;
    this.spec = spec;
    this.opciones = opciones || {};
    this.capasOcultas = this.opciones.capasOcultas || {};
    this.reducido = !!this.opciones.reducido;
    this.arrastrando = false;
    this.autoGiro = !this.reducido;

    this.escena = new T.Scene();
    this.escena.background = null;

    this.camara = new T.PerspectiveCamera(38, 1, 0.1, 200);
    this.renderer = new T.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.contenedor.innerHTML = '';
    this.contenedor.appendChild(this.renderer.domElement);

    this.grupo = new T.Group();
    this.escena.add(this.grupo);

    var luz1 = new T.DirectionalLight(0xffffff, 2.1);
    luz1.position.set(4, 7, 6);
    this.escena.add(luz1);
    var luz2 = new T.DirectionalLight(0xdfe4ff, 1.1);
    luz2.position.set(-6, -2, -5);
    this.escena.add(luz2);
    var amb = new T.AmbientLight(0xffffff, 1.15);
    this.escena.add(amb);

    this.objetosCapa = {}; // capaId -> [Object3D]
    this.etiquetas = [];
    this._animCamaraId = null;

    this._construir();
    this._encuadrar();
    this._eventos();

    this.animando = false;
    this._loop = this._loop.bind(this);
    this._ultimo = performance.now();
    this._resize = this._resize.bind(this);
    window.addEventListener('resize', this._resize);
    this._resize();

    this.animando = true;
    requestAnimationFrame(this._loop);
  }

  /* ---------- construcción de la escena ---------- */
  Visor3D.prototype._construir = function () {
    var T = this.THREE;
    var spec = this.spec;
    this.grupo.clear();
    this.objetosCapa = {};
    this.etiquetas = [];

    if (spec.tipo === 'esfera') return this._construirEsfera();

    var V = spec.vertices || {};
    var self = this;

    // Aristas (trazos finos)
    (spec.aristas || []).forEach(function (ar) {
      var a = V[ar.a], b = V[ar.b];
      if (!a || !b) return;
      var capaId = ar.capa || 'aristas';
      var def = colorDe(spec, capaId);
      var geo = new T.BufferGeometry().setFromPoints([
        new T.Vector3(a.p[0], a.p[1], a.p[2]),
        new T.Vector3(b.p[0], b.p[1], b.p[2])
      ]);
      var mat = new T.LineBasicMaterial({
        color: new T.Color(def.color),
        linewidth: 1,
        transparent: true,
        opacity: 0.95
      });
      var linea = new T.Line(geo, mat);
      self.grupo.add(linea);
      self._registrar(capaId, linea);
    });

    // Caras semitransparentes con doble cara
    (spec.caras || []).forEach(function (cara) {
      var ids = cara.v || [];
      if (ids.length < 3) return;
      var capaId = cara.capa || 'caras';
      var def = colorDe(spec, capaId);
      var posiciones = [];
      ids.forEach(function (id) {
        var v = V[id];
        if (v) posiciones.push(v.p[0], v.p[1], v.p[2]);
      });
      if (posiciones.length < 9) return;
      var geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(posiciones, 3));
      var idx = [];
      var n = posiciones.length / 3;
      for (var i = 1; i < n - 1; i++) idx.push(0, i, i + 1);
      geo.setIndex(idx);
      geo.computeVertexNormals();
      var mat = new T.MeshStandardMaterial({
        color: new T.Color(def.color),
        transparent: true,
        opacity: cara.traslucida ? Math.min(opacidadDe(spec, capaId), 0.12) : opacidadDe(spec, capaId),
        side: T.DoubleSide,
        depthWrite: false,
        roughness: 0.72,
        metalness: 0.02,
        flatShading: true
      });
      var malla = new T.Mesh(geo, mat);
      malla.renderOrder = 1;
      self.grupo.add(malla);
      self._registrar(capaId, malla);
    });

    // Líneas especiales
    (spec.lineas || []).forEach(function (l) {
      var capaId = l.capa || 'aristas';
      var def = colorDe(spec, capaId);
      var pts = [];
      if (l.pts) {
        l.pts.forEach(function (p) { pts.push(new T.Vector3(p[0], p[1], p[2])); });
      } else if (l.v) {
        l.v.forEach(function (id) {
          var v = V[id];
          if (v) pts.push(new T.Vector3(v.p[0], v.p[1], v.p[2]));
        });
      }
      if (pts.length < 2) return;
      if (l.cerrado) pts.push(pts[0].clone());
      if (pts.length === 2) {
        var geo = new T.BufferGeometry().setFromPoints(pts);
        var mat = new T.LineBasicMaterial({
          color: new T.Color(def.color),
          transparent: true,
          opacity: l.estilo === 'punteada' ? 0.55 : 1,
          linewidth: 1
        });
        var linea = new T.Line(geo, mat);
        linea.renderOrder = 3;
        self.grupo.add(linea);
        self._registrar(capaId, linea);
        if (l.estilo !== 'punteada') self._tubo(pts, def.color, (l.grosor || 2.2) * 0.012, capaId);
      } else {
        var curva = new T.CatmullRomCurve3(pts, false, 'catmullrom', 0);
        var geoCurva = new T.BufferGeometry().setFromPoints(curva.getPoints(Math.max(24, pts.length * 3)));
        var matCurva = new T.LineBasicMaterial({
          color: new T.Color(def.color),
          transparent: true,
          opacity: l.estilo === 'punteada' ? 0.6 : 1
        });
        var lineaCurva = new T.Line(geoCurva, matCurva);
        lineaCurva.renderOrder = 4;
        self.grupo.add(lineaCurva);
        self._registrar(capaId, lineaCurva);
      }
    });

    // Vértices
    Object.keys(V).forEach(function (k) {
      var v = V[k];
      if (v.sinEsfera) return;
      var r = v.r != null ? v.r : 0.045;
      var geo = new T.SphereGeometry(r, 12, 10);
      var mat = new T.MeshStandardMaterial({ color: 0x131829, roughness: 0.5 });
      var esf = new T.Mesh(geo, mat);
      esf.position.set(v.p[0], v.p[1], v.p[2]);
      esf.renderOrder = 5;
      self.grupo.add(esf);
      self._registrar('vertices', esf);
    });

    this._etiquetas();
  };

  Visor3D.prototype._construirEsfera = function () {
    var T = this.THREE;
    var R = this.spec.radio;
    var geo = new T.SphereGeometry(R, 40, 28);
    var mat = new T.MeshStandardMaterial({
      color: new T.Color(colorDe(this.spec, 'superficie').color),
      transparent: true,
      opacity: opacidadDe(this.spec, 'superficie'),
      roughness: 0.5,
      metalness: 0.05,
      side: T.DoubleSide,
      depthWrite: false
    });
    var esf = new T.Mesh(geo, mat);
    this.grupo.add(esf);
    this._registrar('superficie', esf);

    var wire = new T.LineSegments(
      new T.WireframeGeometry(new T.SphereGeometry(R * 1.001, 22, 14)),
      new T.LineBasicMaterial({ color: 0x8f96b0, transparent: true, opacity: 0.22 })
    );
    this.grupo.add(wire);
    this._registrar('meridianos', wire);

    var ptsCirculo = [];
    for (var i = 0; i < 96; i++) {
      var a = (i / 96) * Math.PI * 2;
      ptsCirculo.push(new T.Vector3(R * Math.cos(a), 0, R * Math.sin(a)));
    }
    var circulo = new T.LineLoop(
      new T.BufferGeometry().setFromPoints(ptsCirculo),
      new T.LineBasicMaterial({ color: 0x131829, transparent: true, opacity: 0.8 })
    );
    this.grupo.add(circulo);
    this._registrar('meridianos', circulo);

    var geoR = new T.BufferGeometry().setFromPoints([
      new T.Vector3(0, 0, 0),
      new T.Vector3(R * 0.72, R * 0.58, 0)
    ]);
    var lineaR = new T.Line(geoR, new T.LineBasicMaterial({ color: 0x0c7367 }));
    this.grupo.add(lineaR);
    this._registrar('radio', lineaR);
    this._tubo([new T.Vector3(0, 0, 0), new T.Vector3(R * 0.72, R * 0.58, 0)], '#0c7367', 0.022, 'radio');

    var centro = new T.Mesh(
      new T.SphereGeometry(0.045, 12, 10),
      new T.MeshStandardMaterial({ color: 0x131829 })
    );
    this.grupo.add(centro);
    this._registrar('radio', centro);

    this._etiquetasEsfera(R);
  };

  Visor3D.prototype._tubo = function (puntos, color, radio, capaId) {
    var T = this.THREE;
    if (puntos.length < 2) return;
    var curva = new T.CatmullRomCurve3(puntos, false, 'catmullrom', 0);
    var geo = new T.TubeGeometry(curva, Math.max(8, puntos.length * 4), radio, 6, false);
    var mat = new T.MeshStandardMaterial({
      color: new T.Color(color),
      roughness: 0.42,
      metalness: 0.05
    });
    var malla = new T.Mesh(geo, mat);
    malla.renderOrder = 6;
    this.grupo.add(malla);
    this._registrar(capaId, malla);
  };

  Visor3D.prototype._registrar = function (capaId, objeto) {
    if (!this.objetosCapa[capaId]) this.objetosCapa[capaId] = [];
    this.objetosCapa[capaId].push(objeto);
    if (this.capasOcultas[capaId]) {
      objeto.visible = false;
    }
  };

  Visor3D.prototype._etiquetaSprite = function (texto, color) {
    var T = this.THREE;
    var esc = 2;
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    var fuente = '600 40px "JetBrains Mono", ui-monospace, monospace';
    ctx.font = fuente;
    var ancho = Math.ceil(ctx.measureText(texto).width) + 24;
    c.width = ancho * esc;
    c.height = 58 * esc;
    var ctx2 = c.getContext('2d');
    ctx2.scale(esc, esc);
    ctx2.font = fuente;
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    ctx2.lineWidth = 7;
    ctx2.strokeStyle = 'rgba(253,252,249,.96)';
    ctx2.strokeText(texto, ancho / 2, 29);
    ctx2.fillStyle = color;
    ctx2.fillText(texto, ancho / 2, 29);

    var tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.minFilter = T.LinearFilter;
    var mat = new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    var sprite = new T.Sprite(mat);
    var alto = 0.28;
    sprite.scale.set((ancho / 58) * alto, alto, 1);
    sprite.renderOrder = 20;
    return sprite;
  };

  Visor3D.prototype._etiquetas = function () {
    var spec = this.spec;
    var V = spec.vertices || {};
    var self = this;
    Object.keys(V).forEach(function (k) {
      var v = V[k];
      if (!v.etiqueta || v.sinEtiqueta) return;
      var sp = self._etiquetaSprite(v.etiqueta, '#414a63');
      sp.position.set(v.p[0], v.p[1] + 0.2, v.p[2]);
      self.grupo.add(sp);
      self.etiquetas.push(sp);
      self._registrar('etiquetas', sp);
    });
  };

  Visor3D.prototype._etiquetasEsfera = function (R) {
    var sp = this._etiquetaSprite('R', '#0c7367');
    sp.position.set(R * 0.42, R * 0.36, 0);
    this.grupo.add(sp);
    this.etiquetas.push(sp);
    this._registrar('radio', sp);
    var o = this._etiquetaSprite('O', '#6c748c');
    o.position.set(-0.22, 0.02, 0);
    this.grupo.add(o);
    this.etiquetas.push(o);
    this._registrar('radio', o);
  };

  /* ---------- cámara y encuadre ---------- */
  Visor3D.prototype._encuadrar = function () {
    var T = this.THREE;
    var spec = this.spec;
    var cam = spec.camara || { theta: 0.7, phi: 0.3 };
    var caja = new T.Box3();
    var puntos = [];
    if (spec.tipo === 'esfera') {
      puntos.push(new T.Vector3(-spec.radio, -spec.radio, -spec.radio));
      puntos.push(new T.Vector3(spec.radio, spec.radio, spec.radio));
    } else {
      Object.keys(spec.vertices || {}).forEach(function (k) {
        var p = spec.vertices[k].p;
        puntos.push(new T.Vector3(p[0], p[1], p[2]));
      });
    }
    caja.setFromPoints(puntos);
    var centro = caja.getCenter(new T.Vector3());
    var tam = caja.getSize(new T.Vector3());
    var radio = Math.max(tam.length() / 2, 0.6);

    this.centro = centro;
    this.radio = radio;
    this.distBase = (radio / Math.sin((this.camara.fov * Math.PI / 180) / 2)) * 0.92;

    this.theta = cam.theta != null ? cam.theta : 0.7;
    this.phi = cam.phi != null ? cam.phi : 0.3;
    this.dist = this.distBase;
    this.camara.position.set(0, 0, 0);
    this._actualizarCamara();
  };

  Visor3D.prototype._actualizarCamara = function () {
    var p = this.phi;
    var t = this.theta;
    var d = this.dist;
    var x = this.centro.x + d * Math.cos(p) * Math.sin(t);
    var y = this.centro.y + d * Math.sin(p);
    var z = this.centro.z + d * Math.cos(p) * Math.cos(t);
    this.camara.position.set(x, y, z);
    this.camara.lookAt(this.centro);
  };

  Visor3D.prototype._resize = function () {
    var w = this.contenedor.clientWidth || 600;
    var h = this.contenedor.clientHeight || 320;
    this.camara.aspect = w / h;
    this.camara.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };

  Visor3D.prototype._eventos = function () {
    var dom = this.renderer.domElement;
    var el = this.contenedor;
    var self = this;
    var ultimoX = 0, ultimoY = 0;

    var inicio = function (e) {
      self.arrastrando = true;
      el.classList.add('arrastrando');
      var p = e.touches ? e.touches[0] : e;
      ultimoX = p.clientX;
      ultimoY = p.clientY;
      if (e.cancelable) e.preventDefault();
    };
    var mover = function (e) {
      if (!self.arrastrando) return;
      var p = e.touches ? e.touches[0] : e;
      var dx = p.clientX - ultimoX;
      var dy = p.clientY - ultimoY;
      ultimoX = p.clientX;
      ultimoY = p.clientY;
      self.theta -= dx * 0.008;
      self.phi = Math.max(-1.45, Math.min(1.45, self.phi + dy * 0.006));
      self._actualizarCamara();
      if (e.cancelable) e.preventDefault();
    };
    var fin = function () {
      self.arrastrando = false;
      el.classList.remove('arrastrando');
    };

    dom.addEventListener('mousedown', inicio);
    window.addEventListener('mousemove', mover);
    window.addEventListener('mouseup', fin);
    dom.addEventListener('touchstart', inicio, { passive: false });
    dom.addEventListener('touchmove', mover, { passive: false });
    dom.addEventListener('touchend', fin);
    dom.addEventListener('wheel', function (e) {
      if (!e.ctrlKey) {
        self.dist = Math.max(self.radio * 1.4, Math.min(self.radio * 14, self.dist + e.deltaY * 0.0035));
        self._actualizarCamara();
        e.preventDefault();
      }
    }, { passive: false });

    // Pellizco de dos dedos
    var distInicial = 0;
    dom.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        distInicial = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });
    dom.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2 && distInicial > 0) {
        var d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        var factor = distInicial / d;
        self.dist = Math.max(self.radio * 1.4, Math.min(self.radio * 14, self.dist * (1 + (factor - 1) * 0.35)));
        self._actualizarCamara();
      }
    }, { passive: true });

    // Teclado
    dom.setAttribute('tabindex', '0');
    dom.addEventListener('keydown', function (e) {
      var paso = 0.14;
      if (e.key === 'ArrowLeft') { self.theta += paso; }
      else if (e.key === 'ArrowRight') { self.theta -= paso; }
      else if (e.key === 'ArrowUp') { self.phi = Math.min(1.45, self.phi + paso); }
      else if (e.key === 'ArrowDown') { self.phi = Math.max(-1.45, self.phi - paso); }
      else if (e.key === '+' || e.key === '=') { self.dist = Math.max(self.radio * 1.4, self.dist * 0.9); }
      else if (e.key === '-') { self.dist = Math.min(self.radio * 14, self.dist * 1.1); }
      else if (e.key === 'r' || e.key === 'R') { self.reset(); }
      else return;
      self._actualizarCamara();
      e.preventDefault();
    });
  };

  Visor3D.prototype.reset = function () {
    var cam = this.spec.camara || {};
    this.theta = cam.theta != null ? cam.theta : 0.7;
    this.phi = cam.phi != null ? cam.phi : 0.3;
    this.dist = this.distBase;
    this._actualizarCamara();
  };

  /* ---------- Animación suave de cámara (Modo Maestro) ---------- */
  Visor3D.prototype.enfocarCamara = function (targetTheta, targetPhi, targetDist, duracionMs) {
    if (this._animCamaraId) {
      cancelAnimationFrame(this._animCamaraId);
      this._animCamaraId = null;
    }
    duracionMs = duracionMs || 700;
    var startTheta = this.theta;
    var startPhi = this.phi;
    var startDist = this.dist;
    var finalDist = targetDist != null ? targetDist : startDist;
    var startTime = performance.now();
    var self = this;

    function paso(now) {
      var transcurrido = now - startTime;
      var p = Math.min(1, transcurrido / duracionMs);
      var ease = 0.5 - Math.cos(p * Math.PI) / 2; // In-out sine

      self.theta = startTheta + (targetTheta - startTheta) * ease;
      self.phi = startPhi + (targetPhi - startPhi) * ease;
      self.dist = startDist + (finalDist - startDist) * ease;
      self._actualizarCamara();

      if (p < 1) {
        self._animCamaraId = requestAnimationFrame(paso);
      } else {
        self._animCamaraId = null;
      }
    }
    this._animCamaraId = requestAnimationFrame(paso);
  };

  /* ---------- Resaltar temporalmente una capa ---------- */
  Visor3D.prototype.resaltarCapa = function (capaId, duracionMs) {
    duracionMs = duracionMs || 2200;
    var T = this.THREE;
    var objs = this.objetosCapa[capaId] || [];
    if (!objs.length) return;

    this.setCapa(capaId, true);

    objs.forEach(function (o) {
      if (o.material) {
        if (!o._origColor && o.material.color) {
          o._origColor = o.material.color.clone();
        }
        if (o._origOpacity == null) {
          o._origOpacity = o.material.opacity;
        }
        if (o.material.color) {
          o.material.color.setHex(0xe07a2f); // Naranja brillante Vértiz
        }
        o.material.opacity = 0.85;
      }
    });

    var self = this;
    setTimeout(function () {
      objs.forEach(function (o) {
        if (o.material && o._origColor) {
          o.material.color.copy(o._origColor);
          o.material.opacity = o._origOpacity;
        }
      });
    }, duracionMs);
  };

  /* ---------- capas ---------- */
  Visor3D.prototype.setCapa = function (id, visible) {
    this.capasOcultas[id] = !visible;
    var lista = this.objetosCapa[id] || [];
    lista.forEach(function (o) { o.visible = !!visible; });
  };

  Visor3D.prototype.setAutoGiro = function (activo) {
    this.autoGiro = !!activo && !this.reducido;
  };

  Visor3D.prototype.setReducido = function (v) {
    this.reducido = !!v;
    if (this.reducido) this.autoGiro = false;
  };

  /* ---------- bucle ---------- */
  Visor3D.prototype._loop = function (t) {
    if (!this.animando) return;
    var dt = Math.min(0.05, (t - (this._ultimo || t)) / 1000);
    this._ultimo = t;
    if (this.autoGiro && !this.arrastrando && !this._animCamaraId) {
      this.theta += dt * 0.18;
      this._actualizarCamara();
    }
    this.renderer.render(this.escena, this.camara);
    requestAnimationFrame(this._loop);
  };

  Visor3D.prototype.pausar = function () {
    this.animando = false;
    this.renderer.render(this.escena, this.camara);
  };

  Visor3D.prototype.reanudar = function () {
    if (this.animando) return;
    this.animando = true;
    this._ultimo = performance.now();
    requestAnimationFrame(this._loop);
  };

  Visor3D.prototype.destruir = function () {
    this.animando = false;
    if (this._animCamaraId) cancelAnimationFrame(this._animCamaraId);
    window.removeEventListener('resize', this._resize);
    this.grupo.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (o.material.map) o.material.map.dispose();
        o.material.dispose();
      }
    });
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  };

  return {
    Visor3D: Visor3D,
    soportaWebGL: soportaWebGL
  };
});
