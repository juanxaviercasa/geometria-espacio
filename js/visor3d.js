/* ============================================================
   visor3d.js — visor Three.js universal
   ------------------------------------------------------------
   - Compatible con carga directa por <script> (file:// y http://).
   - Encuadre automático que respeta el ancho Y el alto del lienzo:
     la figura siempre aparece completa, sin recortes.
   - Aristas y diagonales con grosor real (cilindros), porque
     LineBasicMaterial siempre mide 1 px en Windows.
   - Controles de órbita (arrastre, rueda, teclado, pellizco).
   - Animación de cámara suave para el Modo Maestro.
   - Resaltado didáctico: la capa explicada late y el resto se
     atenúa, conservando su color (los textos citan colores).
   - Render bajo demanda: no gasta GPU si nada se mueve.
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

  var _soporte = null;
  function soportaWebGL() {
    if (_soporte !== null) return _soporte;
    try {
      var c = document.createElement('canvas');
      _soporte = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
      _soporte = false;
    }
    return _soporte;
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
    this._sucio = true;
    this._resalte = null;

    this.escena = new T.Scene();
    this.escena.background = null;

    this.camara = new T.PerspectiveCamera(34, 1, 0.05, 500);
    this.renderer = new T.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.contenedor.appendChild(this.renderer.domElement);

    this.grupo = new T.Group();
    this.escena.add(this.grupo);

    var luz1 = new T.DirectionalLight(0xffffff, 2.2);
    luz1.position.set(5, 8, 7);
    this.escena.add(luz1);
    var luz2 = new T.DirectionalLight(0xcfd8ff, 1.3);
    luz2.position.set(-7, -3, -6);
    this.escena.add(luz2);
    var luz3 = new T.DirectionalLight(0xffecd2, 1.1);
    luz3.position.set(-3, 6, 4);
    this.escena.add(luz3);
    this.escena.add(new T.AmbientLight(0xffffff, 1.35));

    this.objetosCapa = {}; // capaId -> [Object3D]
    this.etiquetas = [];
    this._animCamaraId = null;
    this._geoCil = new T.CylinderGeometry(1, 1, 1, 10, 1, false);
    this._geoEsf = new T.SphereGeometry(1, 16, 12);

    this._medir();
    this._construir();
    this._sombra();
    this._encuadrar(this.opciones.vista);
    this._eventos();

    this.animando = false;
    this._loop = this._loop.bind(this);
    this._ultimo = performance.now();
    this._resize = this._resize.bind(this);
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(this._resize);
      this._ro.observe(this.contenedor);
    } else {
      window.addEventListener('resize', this._resize);
    }
    this._resize();

    this.animando = true;
    requestAnimationFrame(this._loop);
  }

  /* ---------- medidas de la figura ---------- */
  Visor3D.prototype._medir = function () {
    var T = this.THREE;
    var spec = this.spec;
    var puntos = [];
    if (spec.tipo === 'esfera') {
      var R0 = spec.radio;
      puntos.push(new T.Vector3(-R0, -R0, -R0), new T.Vector3(R0, R0, R0));
    } else {
      Object.keys(spec.vertices || {}).forEach(function (k) {
        var p = spec.vertices[k].p;
        puntos.push(new T.Vector3(p[0], p[1], p[2]));
      });
      (spec.lineas || []).forEach(function (l) {
        (l.pts || []).forEach(function (p) { puntos.push(new T.Vector3(p[0], p[1], p[2])); });
      });
    }
    if (!puntos.length) puntos.push(new T.Vector3(0, 0, 0));
    var caja = new T.Box3().setFromPoints(puntos);
    var centro = caja.getCenter(new T.Vector3());
    var radio = 0;
    if (spec.tipo === 'esfera') {
      radio = spec.radio;
    } else {
      puntos.forEach(function (p) { radio = Math.max(radio, p.distanceTo(centro)); });
    }
    this.caja = caja;
    this.centro = centro;
    this.radio = Math.max(radio, 0.6);
    this.trazo = this.radio * 0.0042; // grosor base de los trazos
  };

  /* ---------- primitivas ---------- */
  Visor3D.prototype._cilindro = function (a, b, color, radio, capaId, opacidad, orden) {
    var T = this.THREE;
    var dir = new T.Vector3().subVectors(b, a);
    var largo = dir.length();
    if (largo < 1e-6) return null;
    var mat = new T.MeshBasicMaterial({
      color: new T.Color(color),
      transparent: opacidad < 1,
      opacity: opacidad
    });
    var m = new T.Mesh(this._geoCil, mat);
    m.scale.set(radio, largo, radio);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
    m.renderOrder = orden || 3;
    m.userData.radio = radio;
    this.grupo.add(m);
    this._registrar(capaId, m);
    return m;
  };

  /* Trazo recto, continuo o discontinuo */
  Visor3D.prototype._barra = function (a, b, color, radio, capaId, opc) {
    opc = opc || {};
    var opacidad = opc.opacidad != null ? opc.opacidad : 1;
    if (!opc.punteada) {
      this._cilindro(a, b, color, radio, capaId, opacidad, opc.orden);
      return;
    }
    var T = this.THREE;
    var largo = a.distanceTo(b);
    var seg = this.radio * 0.05;
    var hueco = this.radio * 0.036;
    var paso = seg + hueco;
    var n = Math.max(1, Math.round(largo / paso));
    var ajuste = largo / n; // reparte el patrón para que termine limpio
    for (var i = 0; i < n; i++) {
      var t0 = (i * ajuste) / largo;
      var t1 = Math.min(1, (i * ajuste + ajuste * (seg / paso)) / largo);
      var p0 = new T.Vector3().lerpVectors(a, b, t0);
      var p1 = new T.Vector3().lerpVectors(a, b, t1);
      this._cilindro(p0, p1, color, radio, capaId, opacidad, opc.orden);
    }
  };

  /* ---------- construcción de la escena ---------- */
  Visor3D.prototype._construir = function () {
    var T = this.THREE;
    var spec = this.spec;
    var self = this;
    this.objetosCapa = {};
    this.etiquetas = [];

    if (spec.tipo === 'esfera') return this._construirEsfera();

    var V = spec.vertices || {};
    var vec = function (id) {
      var v = V[id];
      return v ? new T.Vector3(v.p[0], v.p[1], v.p[2]) : null;
    };

    // Aristas con grosor real
    (spec.aristas || []).forEach(function (ar) {
      var a = vec(ar.a), b = vec(ar.b);
      if (!a || !b) return;
      var capaId = ar.capa || 'aristas';
      var def = colorDe(spec, capaId);
      var punteada = ar.estilo === 'punteada' || ar.estilo === 'oculta';
      self._barra(a, b, def.color, self.trazo * 1.5, capaId, {
        punteada: punteada,
        opacidad: punteada ? 0.75 : 1
      });
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
      var baseOpc = opacidadDe(spec, capaId);
      var opcCalc = cara.traslucida ? Math.min(baseOpc, 0.28) : Math.max(baseOpc, 0.38);
      var mat = new T.MeshStandardMaterial({
        color: new T.Color(def.color),
        transparent: true,
        opacity: opcCalc,
        side: T.DoubleSide,
        depthWrite: false,
        roughness: 0.42,
        metalness: 0.08,
        flatShading: true
      });
      var malla = new T.Mesh(geo, mat);
      malla.renderOrder = 1;
      self.grupo.add(malla);
      self._registrar(capaId, malla);
    });

    // Líneas especiales (diagonales, alturas, secciones, curvas)
    (spec.lineas || []).forEach(function (l) {
      var capaId = l.capa || 'aristas';
      var def = colorDe(spec, capaId);
      var pts = [];
      if (l.pts) {
        l.pts.forEach(function (p) { pts.push(new T.Vector3(p[0], p[1], p[2])); });
      } else if (l.v) {
        l.v.forEach(function (id) {
          var p = vec(id);
          if (p) pts.push(p);
        });
      }
      if (pts.length < 2) return;
      if (l.cerrado) pts.push(pts[0].clone());
      var punteada = l.estilo === 'punteada';
      var radio = self.trazo * (l.grosor || 2.2) * (punteada ? 0.8 : 1);
      var curva = pts.length > 8;
      for (var i = 0; i < pts.length - 1; i++) {
        if (curva && punteada) {
          // En curvas largas se alterna un tramo sí y otro no
          if (i % 2 === 0) self._cilindro(pts[i], pts[i + 1], def.color, radio, capaId, 0.8, 4);
        } else {
          self._barra(pts[i], pts[i + 1], def.color, radio, capaId, {
            punteada: punteada && !curva,
            opacidad: punteada ? 0.85 : 1,
            orden: 4
          });
        }
      }
    });

    // Vértices
    Object.keys(V).forEach(function (k) {
      var v = V[k];
      if (v.sinEsfera) return;
      var r = v.r != null ? v.r : self.radio * 0.019;
      var rReal = v.r != null ? v.r : self.radio * 0.028;
      var mat = new T.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.28, metalness: 0.4 });
      var esf = new T.Mesh(self._geoEsf, mat);
      esf.scale.setScalar(rReal);
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
    var geo = new T.SphereGeometry(R, 48, 32);
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
    for (var i = 0; i <= 96; i++) {
      var a = (i / 96) * Math.PI * 2;
      ptsCirculo.push(new T.Vector3(R * Math.cos(a), 0, R * Math.sin(a)));
    }
    for (var j = 0; j < ptsCirculo.length - 1; j++) {
      this._cilindro(ptsCirculo[j], ptsCirculo[j + 1], '#131829', this.trazo * 1.3, 'meridianos', 0.85, 3);
    }

    var o = new T.Vector3(0, 0, 0);
    var extremo = new T.Vector3(R * 0.72, R * 0.58, 0);
    this._cilindro(o, extremo, '#0c7367', this.trazo * 2.6, 'radio', 1, 6);

    var centro = new T.Mesh(this._geoEsf, new T.MeshStandardMaterial({ color: 0x131829 }));
    centro.scale.setScalar(R * 0.03);
    this.grupo.add(centro);
    this._registrar('radio', centro);

    this._etiquetasEsfera(R);
  };

  /* Sombra de contacto suave bajo la figura */
  Visor3D.prototype._sombra = function () {
    var T = this.THREE;
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, 'rgba(30, 41, 99, 0.22)');
    g.addColorStop(0.55, 'rgba(30, 41, 99, 0.08)');
    g.addColorStop(1, 'rgba(30, 41, 99, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    var tex = new T.CanvasTexture(c);
    var mat = new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    var tam = this.radio * 2.1;
    var plano = new T.Mesh(new T.PlaneGeometry(tam, tam), mat);
    plano.rotation.x = -Math.PI / 2;
    var yMin = this.spec.tipo === 'esfera' ? -this.spec.radio : this.caja.min.y;
    plano.position.set(this.centro.x, yMin - this.radio * 0.04, this.centro.z);
    plano.renderOrder = 0;
    this.escena.add(plano);
    this._plano = plano;
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
    var fuente = '700 40px "JetBrains Mono", ui-monospace, monospace';
    ctx.font = fuente;
    var ancho = Math.ceil(ctx.measureText(texto).width) + 26;
    c.width = ancho * esc;
    c.height = 58 * esc;
    var ctx2 = c.getContext('2d');
    ctx2.scale(esc, esc);
    ctx2.font = fuente;
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    ctx2.lineJoin = 'round';
    ctx2.lineWidth = 9;
    ctx2.strokeStyle = 'rgba(255,255,255,.96)';
    ctx2.strokeText(texto, ancho / 2, 30);
    ctx2.fillStyle = color;
    ctx2.fillText(texto, ancho / 2, 30);

    var tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.minFilter = T.LinearFilter;
    var mat = new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    var sprite = new T.Sprite(mat);
    var alto = this.radio * 0.115;
    sprite.scale.set((ancho / 58) * alto, alto, 1);
    sprite.renderOrder = 20;
    return sprite;
  };

  Visor3D.prototype._etiquetas = function () {
    var T = this.THREE;
    var spec = this.spec;
    var V = spec.vertices || {};
    var self = this;
    Object.keys(V).forEach(function (k) {
      var v = V[k];
      if (!v.etiqueta || v.sinEtiqueta) return;
      var sp = self._etiquetaSprite(v.etiqueta, '#1e293b');
      var p = new T.Vector3(v.p[0], v.p[1], v.p[2]);
      var fuera = new T.Vector3().subVectors(p, self.centro);
      if (fuera.lengthSq() < 1e-6) fuera.set(0, 1, 0);
      fuera.normalize();
      p.addScaledVector(fuera, self.radio * 0.1);
      sp.position.copy(p);
      self.grupo.add(sp);
      self.etiquetas.push(sp);
      self._registrar('etiquetas', sp);
    });
  };

  Visor3D.prototype._etiquetasEsfera = function (R) {
    var sp = this._etiquetaSprite('R', '#0c7367');
    sp.position.set(R * 0.42, R * 0.4, 0);
    this.grupo.add(sp);
    this.etiquetas.push(sp);
    this._registrar('radio', sp);
    var o = this._etiquetaSprite('O', '#475569');
    o.position.set(-R * 0.1, R * 0.02, 0);
    this.grupo.add(o);
    this.etiquetas.push(o);
    this._registrar('radio', o);
  };

  /* ---------- cámara y encuadre ---------- */
  Visor3D.prototype._encuadrar = function (vista) {
    var cam = this.spec.camara || { theta: 0.7, phi: 0.3 };
    vista = vista || {};
    this.theta = vista.theta != null ? vista.theta : (cam.theta != null ? cam.theta : 0.7);
    this.phi = vista.phi != null ? vista.phi : (cam.phi != null ? cam.phi : 0.3);
    this.zoom = vista.zoom != null ? vista.zoom : 1;
    this._ajustarDistancia();
    this._actualizarCamara();
  };

  /* Distancia mínima para que la esfera que envuelve la figura
     y sus etiquetas de vértice quepan enteras con holgura. */
  Visor3D.prototype._ajustarDistancia = function () {
    var vf = this.camara.fov * Math.PI / 180;
    var aspecto = this.camara.aspect || 1;
    var hf = 2 * Math.atan(Math.tan(vf / 2) * aspecto);
    var f = Math.min(vf, hf);
    this.distBase = (this.radio / Math.sin(f / 2)) * 1.24;
    this.dist = this.distBase * this.zoom;
  };

  Visor3D.prototype._actualizarCamara = function () {
    var p = this.phi;
    var t = this.theta;
    var d = this.dist;
    this.camara.position.set(
      this.centro.x + d * Math.cos(p) * Math.sin(t),
      this.centro.y + d * Math.sin(p),
      this.centro.z + d * Math.cos(p) * Math.cos(t)
    );
    this.camara.lookAt(this.centro);
    this._sucio = true;
    if(this.opciones.alMoverCamara)this.opciones.alMoverCamara();
  };

  Visor3D.prototype.proyectarPunto = function(p) {
    this.camara.updateMatrixWorld(true);
    var q=new this.THREE.Vector3(p[0],p[1],p[2]).project(this.camara);
    return {x:(q.x+1)*this.contenedor.clientWidth/2,y:(1-q.y)*this.contenedor.clientHeight/2,visible:q.z>=-1 && q.z<=1 && Math.abs(q.x)<=1 && Math.abs(q.y)<=1};
  };

  Visor3D.prototype._fijarZoom = function (z) {
    this.zoom = Math.max(0.45, Math.min(3.2, z));
    this.dist = this.distBase * this.zoom;
    this._actualizarCamara();
  };

  Visor3D.prototype._resize = function () {
    var w = this.contenedor.clientWidth;
    var h = this.contenedor.clientHeight;
    if (!w || !h) return;
    this.camara.aspect = w / h;
    this.camara.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this._ajustarDistancia();
    this._actualizarCamara();
    if (!this.animando) this.renderer.render(this.escena, this.camara);
  };

  Visor3D.prototype._eventos = function () {
    var dom = this.renderer.domElement;
    var el = this.contenedor;
    var self = this;
    var ultimoX = 0, ultimoY = 0;

    var inicio = function (e) {
      if (e.touches && e.touches.length > 1) return;
      self.arrastrando = true;
      el.classList.add('arrastrando');
      var p = e.touches ? e.touches[0] : e;
      ultimoX = p.clientX;
      ultimoY = p.clientY;
      if (e.cancelable) e.preventDefault();
    };
    var mover = function (e) {
      if (!self.arrastrando) return;
      if (e.touches && e.touches.length > 1) return;
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

    this._mover = mover;
    this._fin = fin;
    dom.addEventListener('mousedown', inicio);
    window.addEventListener('mousemove', mover);
    window.addEventListener('mouseup', fin);
    dom.addEventListener('touchstart', inicio, { passive: false });
    dom.addEventListener('touchmove', mover, { passive: false });
    dom.addEventListener('touchend', fin);
    dom.addEventListener('wheel', function (e) {
      if (e.ctrlKey) return;
      self._fijarZoom(self.zoom * (1 + e.deltaY * 0.0012));
      e.preventDefault();
    }, { passive: false });

    // Pellizco de dos dedos
    var distInicial = 0;
    var zoomInicial = 1;
    dom.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        self.arrastrando = false;
        distInicial = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        zoomInicial = self.zoom;
      }
    }, { passive: true });
    dom.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2 && distInicial > 0) {
        var d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        self._fijarZoom(zoomInicial * (distInicial / d));
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
      else if (e.key === '+' || e.key === '=') { self._fijarZoom(self.zoom * 0.9); }
      else if (e.key === '-') { self._fijarZoom(self.zoom * 1.1); }
      else if (e.key === 'r' || e.key === 'R') { self.reset(); }
      else return;
      self._actualizarCamara();
      e.preventDefault();
    });
  };

  Visor3D.prototype.reset = function () {
    var cam = this.spec.camara || {};
    this.enfocarCamara(
      cam.theta != null ? cam.theta : 0.7,
      cam.phi != null ? cam.phi : 0.3,
      null,
      600
    );
  };

  Visor3D.prototype.vistaFrente = function () {
    this.setAutoGiro(false);
    this.enfocarCamara(0, 0, null, 500);
  };

  Visor3D.prototype.vistaArriba = function () {
    this.setAutoGiro(false);
    this.enfocarCamara(0, 1.45, null, 500);
  };

  Visor3D.prototype.vistaIsometrica = function () {
    this.setAutoGiro(false);
    this.enfocarCamara(0.785, 0.52, null, 500);
  };

  Visor3D.prototype.escalaDinamica = function (sx, sy, sz) {
    if (!this.grupo) return;
    this.grupo.scale.set(sx || 1, sy || 1, sz || 1);
    this._sucio = true;
    if (this.opciones.alMoverCamara) this.opciones.alMoverCamara();
  };

  Visor3D.prototype.vista = function () {
    return { theta: this.theta, phi: this.phi, zoom: this.zoom };
  };

  /* ---------- Animación suave de cámara (Modo Maestro) ----------
     targetDist (opcional) es una distancia absoluta; si no se da,
     se vuelve al encuadre completo (zoom 1). */
  Visor3D.prototype.enfocarCamara = function (targetTheta, targetPhi, targetDist, duracionMs) {
    if (this._animCamaraId) {
      cancelAnimationFrame(this._animCamaraId);
      this._animCamaraId = null;
    }
    duracionMs = this.reducido ? 1 : (duracionMs || 800);
    var startTheta = this.theta;
    var startPhi = this.phi;
    var startZoom = this.zoom;
    var finalZoom = targetDist != null ? targetDist / this.distBase : 1;
    // Camino más corto (el giro automático acumula vueltas)
    var dif = targetTheta - startTheta;
    dif = Math.atan2(Math.sin(dif), Math.cos(dif));
    var startTime = performance.now();
    var self = this;

    function paso(now) {
      var p = Math.min(1, (now - startTime) / duracionMs);
      var ease = 0.5 - Math.cos(p * Math.PI) / 2;
      self.theta = startTheta + dif * ease;
      self.phi = startPhi + (targetPhi - startPhi) * ease;
      self.zoom = startZoom + (finalZoom - startZoom) * ease;
      self.dist = self.distBase * self.zoom;
      self._actualizarCamara();
      if (p < 1) {
        self._animCamaraId = requestAnimationFrame(paso);
      } else {
        self._animCamaraId = null;
      }
    }
    this._animCamaraId = requestAnimationFrame(paso);
  };

  /* ---------- Resaltado didáctico ----------
     La capa elegida se engrosa y late; las demás se atenúan.
     duracionMs = 0 o ausente: el resaltado dura hasta quitarResalte(). */
  Visor3D.prototype.resaltarCapa = function (capaId, duracionMs) {
    this.quitarResalte();
    var objs = this.objetosCapa[capaId] || [];
    if (!objs.length) return;
    this.setCapa(capaId, true);
    var self = this;
    var tocados = [];

    function guardar(o) {
      if (!o.material || o.userData._guardado) return;
      o.userData._guardado = {
        opacity: o.material.opacity,
        transparent: o.material.transparent,
        depthWrite: o.material.depthWrite,
        escala: o.scale.clone()
      };
      tocados.push(o);
    }

    Object.keys(this.objetosCapa).forEach(function (id) {
      if (id === capaId || id === 'etiquetas' || id === 'vertices') return;
      self.objetosCapa[id].forEach(function (o) {
        guardar(o);
        if (!o.material) return;
        o.material.transparent = true;
        o.material.opacity = o.userData._guardado.opacity * 0.22;
        o.material.depthWrite = false;
        o.material.needsUpdate = true;
      });
    });
    objs.forEach(function (o) {
      guardar(o);
      if (o.material && o.isMesh && o.userData.radio == null && !o.isSprite) {
        o.material.transparent = true;
        o.material.opacity = Math.max(o.userData._guardado.opacity, 0.3);
        o.material.needsUpdate = true;
      }
    });

    var ahora = performance.now();
    this._resalte = {
      capa: capaId,
      objs: objs,
      tocados: tocados,
      t0: ahora,
      hasta: duracionMs ? ahora + duracionMs : Infinity
    };
    this._sucio = true;
  };

  Visor3D.prototype.quitarResalte = function () {
    var r = this._resalte;
    if (!r) return;
    r.tocados.forEach(function (o) {
      var g = o.userData._guardado;
      if (!g) return;
      if (o.material) {
        o.material.opacity = g.opacity;
        o.material.transparent = g.transparent;
        o.material.depthWrite = g.depthWrite;
        o.material.needsUpdate = true;
      }
      o.scale.copy(g.escala);
      delete o.userData._guardado;
    });
    this._resalte = null;
    this._sucio = true;
  };

  Visor3D.prototype._animarResalte = function (ahora) {
    var r = this._resalte;
    if (!r) return false;
    if (ahora > r.hasta) {
      this.quitarResalte();
      return true;
    }
    var t = ahora - r.t0;
    // Late con fuerza los primeros 3 s y luego queda engrosado
    var pulso = this.reducido ? 0.6 : (t < 3000 ? 0.5 + 0.5 * Math.sin(t * 0.009) : 0.6);
    r.objs.forEach(function (o) {
      var g = o.userData._guardado;
      if (!g) return;
      if (o.userData.radio != null) {
        var k = 1 + 1.1 * pulso;
        o.scale.set(g.escala.x * k, g.escala.y, g.escala.z * k);
      } else if (o.isMesh && o.material && !o.isSprite) {
        o.material.opacity = Math.max(g.opacity, 0.26) + 0.18 * pulso;
      }
    });
    return true;
  };

  /* ---------- capas ---------- */
  Visor3D.prototype.setCapa = function (id, visible) {
    this.capasOcultas[id] = !visible;
    var lista = this.objetosCapa[id] || [];
    lista.forEach(function (o) { o.visible = !!visible; });
    this._sucio = true;
  };

  Visor3D.prototype.setAutoGiro = function (activo) {
    this.autoGiro = !!activo && !this.reducido;
  };

  Visor3D.prototype.setReducido = function (v) {
    this.reducido = !!v;
    if (this.reducido) this.autoGiro = false;
  };

  /* ---------- bucle (render bajo demanda) ---------- */
  Visor3D.prototype._loop = function (t) {
    if (!this.animando) return;
    var dt = Math.min(0.05, (t - (this._ultimo || t)) / 1000);
    this._ultimo = t;
    if (this.autoGiro && !this.arrastrando && !this._animCamaraId) {
      this.theta += dt * 0.16;
      this._actualizarCamara();
    }
    if (this._animarResalte(t)) this._sucio = true;
    if (this._sucio) {
      this.renderer.render(this.escena, this.camara);
      this._sucio = false;
    }
    requestAnimationFrame(this._loop);
  };

  Visor3D.prototype.pausar = function () {
    this.animando = false;
    this.renderer.render(this.escena, this.camara);
  };

  Visor3D.prototype.reanudar = function () {
    if (this.animando) return;
    this.animando = true;
    this._sucio = true;
    this._ultimo = performance.now();
    requestAnimationFrame(this._loop);
  };

  Visor3D.prototype.destruir = function () {
    this.animando = false;
    if (this._animCamaraId) cancelAnimationFrame(this._animCamaraId);
    if (this._ro) this._ro.disconnect();
    else window.removeEventListener('resize', this._resize);
    window.removeEventListener('mousemove', this._mover);
    window.removeEventListener('mouseup', this._fin);
    this.escena.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (o.material.map) o.material.map.dispose();
        o.material.dispose();
      }
    });
    this.renderer.dispose();
    if (this.renderer.forceContextLoss) {
      try { this.renderer.forceContextLoss(); } catch (e) {}
    }
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  };

  return {
    Visor3D: Visor3D,
    soportaWebGL: soportaWebGL
  };
});
