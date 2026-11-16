/* ============================================================
   visor.js — Escenario de Clase 3D, Modo Maestro y Modo Proyector
   ------------------------------------------------------------
   - Diseño sin encimados: barra superior fuera del lienzo y
     panel docente de Vértiz al costado (escritorio) o debajo (móvil).
   - El 100 % del lienzo 3D queda libre para que la figura jamás
     se recorte ni quede tapada por botones.
   - Vértiz aparece junto a la figura que explica, señala la capa
     activa y sincroniza voz y movimiento de boca.
   - Modo Proyector (pantalla completa + tema oscuro opcional +
     atajos de teclado y presentador inalámbrico).
   ============================================================ */
(function (global) {
  'use strict';

  var cargando = null;
  var modulo3d = null;
  var fallo3d = false;
  var instancias = [];
  var visorActivo = null;
  var contadorNarraciones = 0;

  function prefiereReducido() {
    return global.Progreso ? global.Progreso.prefiereMovimientoReducido() : false;
  }

  function equipoLimitado() {
    var n = global.navigator || {};
    return !!((n.deviceMemory && n.deviceMemory <= 2) || (n.hardwareConcurrency && n.hardwareConcurrency <= 2));
  }

  function vistaPreferida() {
    var p = global.Progreso ? global.Progreso.leerPrefs() : {};
    return p.vistaPreferida === '2d' || (!p.vistaPreferida && equipoLimitado()) ? '2d' : '3d';
  }

  function fijarVistaPreferida(v) {
    if (!global.Progreso) return;
    var p = global.Progreso.leerPrefs();
    p.vistaPreferida = v;
    try {
      localStorage.setItem('geo3d.prefs.v1', JSON.stringify(p));
    } catch (e) {}
  }

  /* Carga real bajo demanda: Three.js no forma parte del HTML inicial. */
  function cargar3d() {
    if (modulo3d) return Promise.resolve(modulo3d);
    if (fallo3d) return Promise.reject(new Error('WebGL no disponible'));
    if (cargando) return cargando;
    if (!global.Cargador3D || !global.Cargador3D.cargar)
      return Promise.reject(new Error('Cargador 3D no disponible'));
    cargando=global.Cargador3D.cargar().then(function(Clase){
      if (!global.soportaWebGL || !global.soportaWebGL()) {
        fallo3d=true;
        throw new Error('WebGL no disponible');
      }
      modulo3d=Clase;
      return Clase;
    }).catch(function(err){cargando=null;throw err;});
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
        texto: spec.alt || ('Observa este modelo tridimensional: ' + spec.titulo + '. Arrástralo para girarlo en 360°.'),
        camara: spec.camara || { theta: 0.7, phi: 0.35 },
        capaResaltada: capa1
      },
      {
        titulo: 'Elementos y aristas clave',
        texto: spec.pie || 'Fíjate en las relaciones espaciales entre caras, alturas y aristas destacadas en color.',
        camara: { theta: ((spec.camara && spec.camara.theta) || 0.7) + 0.45, phi: 0.28 },
        capaResaltada: capa2
      },
      {
        titulo: 'Propiedades y relación métrica',
        texto: (spec.medidas && spec.medidas.length)
          ? ('Datos clave del modelo: ' + spec.medidas.map(function (m) { return m[0] + ' = ' + m[1]; }).join(' · ') + '.')
          : 'Identifica el triángulo rectángulo auxiliar dentro del sólido para calcular las longitudes pedidas.',
        camara: spec.camara || { theta: 0.7, phi: 0.35 },
        capaResaltada: capa1
      }
    ];
  }

  // Los trazos auxiliares aparecen solo cuando el paso los explica,
  // o cuando el estudiante los activa manualmente.
  function esCapaAuxiliar(c) {
    return !!c && (c.auxiliar===true ||
      /^(altura|diagonal(?:-|$)|seccion$|corte$|apotema$|generatriz$|radio$|interseccion$)/.test(c.id));
  }

  function nombreCapa(spec, idCapa) {
    var lista = (spec && spec.capas) || [];
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === idCapa) return lista[i];
    }
    return null;
  }

  /* Montaje del Escenario de Clase 3D */
  function montarFigura(contenedor, idFigura, opciones) {
    opciones = opciones || {};
    var esHero = !!opciones.modoHero;
    var origenNarracion = 'figura-' + idFigura + '-' + (++contadorNarraciones);
    var spec = global.Figuras && global.Figuras.obtener(idFigura);
    if (!spec) {
      contenedor.innerHTML = '<p class="vacio-aviso">Figura no disponible.</p>';
      return null;
    }

    var capasOcultas = {};
    var idsAuxiliares=(spec.capas||[]).filter(esCapaAuxiliar).map(function(c){return c.id;});
    (spec.capas || []).forEach(function (c) {
      if (c.activa===false || esCapaAuxiliar(c)) capasOcultas[c.id] = true;
    });

    var pasos = (spec.pasosGuia && spec.pasosGuia.length) ? spec.pasosGuia : generarPasosPorDefecto(spec);
    var laboratorios = {
      'prisma-elementos':'prisma','prisma-diagonales':'prisma','piramide-elementos':'piramide',
      'cilindro':'cilindro','cono':'cono','esfera':'esfera',
      'seccion-prisma':'seccion','cubo-seccion':'seccion','paralelepipedo-oblicuo':'prisma'
    };
    var tipoLaboratorio = laboratorios[idFigura] || null;

    var figura = document.createElement('figure');
    figura.className = 'figura' + (esHero ? ' figura-hero-modo' : '');
    figura.setAttribute('tabindex', '-1');
    figura.setAttribute('aria-label', 'Visor didáctico: ' + (spec.titulo || idFigura));
    figura.setAttribute('data-narracion-origen',origenNarracion);

    /* 1. Barra superior dedicada (fuera del lienzo, nunca tapa la figura) */
    var barraSup = document.createElement('div');
    barraSup.className = 'figura-barra-sup';
    barraSup.innerHTML =
      (esHero ? '' :
        '<div class="hud-titulo-wrap">' +
          '<span class="hud-badge">📐 VISOR 3D</span>' +
          '<p class="hud-fig-titulo">' + spec.titulo + '</p>' +
        '</div>') +
      '<div class="acciones-fig">' +
        (tipoLaboratorio ? '<a class="btn-fig btn-fig-hud" href="laboratorio.html?modelo=' + tipoLaboratorio + '" title="Experimentar con las dimensiones de este tipo de sólido">Modificar medidas ↗</a>' : '') +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="vista" aria-pressed="false" title="Alternar entre vista 3D y dibujo 2D">' +
          '<span data-vista-texto>Vista 2D</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="reset" title="Recentrar figura (tecla R)">' +
          '<span>Recentrar</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="giro" aria-pressed="true" title="Pausar o reanudar rotación">' +
          '<span data-giro-texto>Giro</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud" data-accion="contraste" aria-pressed="false" title="Fondo oscuro de alto contraste para proyector">' +
          '<span>🌙 Fondo</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud btn-proyectar" data-accion="proyectar" aria-pressed="false" title="Modo Proyector a pantalla completa (tecla F)">' +
          '<span data-proyectar-texto>⛶ Proyectar</span>' +
        '</button>' +
        '<button type="button" class="btn-fig btn-fig-hud btn-ajustes" data-accion="ajustes" aria-expanded="false" title="Mostrar u ocultar los ajustes del aula">⚙ Ajustes</button>' +
      '</div>';
    figura.appendChild(barraSup);

    /* Los controles secundarios viven en un panel bajo demanda para no competir con la explicación. */
    var accionesVisor = barraSup.querySelector('.acciones-fig');
    var btnAjustes = accionesVisor.querySelector('[data-accion="ajustes"]');
    var panelAjustes = document.createElement('div');
    panelAjustes.className = 'figura-ajustes';
    panelAjustes.hidden = true;
    panelAjustes.setAttribute('aria-label', 'Ajustes del aula 3D');
    panelAjustes.innerHTML = '<div class="figura-ajustes-titulo"><strong>Configurar aula</strong><span>Se oculta al terminar</span></div>';
    Array.prototype.slice.call(accionesVisor.children).forEach(function (control) {
      if (control !== btnAjustes && !control.classList.contains('btn-proyectar')) panelAjustes.appendChild(control);
    });
    figura.appendChild(panelAjustes);
    // Los botones secundarios se trasladan al panel de Ajustes. Buscar en
    // su contenedor REAL evita abortar el montaje por querySelector(null).
    function buscarControl(accion){
      return panelAjustes.querySelector('[data-accion="'+accion+'"]') ||
             barraSup.querySelector('[data-accion="'+accion+'"]');
    }
    btnAjustes.addEventListener('click', function () {
      var abierto = !panelAjustes.hidden;
      panelAjustes.hidden = abierto;
      btnAjustes.setAttribute('aria-expanded', String(!abierto));
      figura.classList.toggle('ajustes-abiertos', !abierto);
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&!panelAjustes.hidden){
        panelAjustes.hidden=true;
        figura.classList.remove('ajustes-abiertos');
        btnAjustes.setAttribute('aria-expanded','false');
        btnAjustes.focus();
      }
    });

    /* 2. Escenario de clase: Columna Lienzo 3D + Columna Profesor Vértiz */
    var escenarioClase = document.createElement('div');
    escenarioClase.className = 'figura-escenario-clase';

    /* 2a. Columna del lienzo 3D + capas + medidas */
    var colLienzo = document.createElement('div');
    colLienzo.className = 'figura-col-lienzo';

    var lienzoWrap = document.createElement('div');
    lienzoWrap.className = 'figura-stage-wrap';

    var lienzo = document.createElement('div');
    lienzo.className = 'figura-lienzo' + (esHero ? ' lienzo-hero' : '');
    lienzo.setAttribute('role', 'img');
    lienzo.setAttribute('aria-label', spec.alt || spec.titulo);
    lienzoWrap.appendChild(lienzo);

    var aviso = document.createElement('div');
    aviso.className = 'figura-aviso';
    aviso.textContent = 'Arrastra para girar · Rueda para zoom';
    if (opciones.sinAviso) aviso.hidden = true;
    lienzoWrap.appendChild(aviso);
    var guiaFoco=document.createElement('div');guiaFoco.className='guia-foco';guiaFoco.hidden=true;guiaFoco.setAttribute('aria-hidden','true');
    guiaFoco.innerHTML='<svg class="guia-foco-trazo" width="100%" height="100%"><path fill="none"></path></svg><span class="guia-foco-punto"></span><span class="guia-foco-etiqueta"></span>';
    lienzoWrap.appendChild(guiaFoco);

    colLienzo.appendChild(lienzoWrap);

    /* Barra de capas + medidas debajo del lienzo */
    var capasBar = document.createElement('div');
    capasBar.className = 'figura-capas';
    capasBar.innerHTML = '<span class="et">Capas:</span>';
    (spec.capas || []).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-fig btn-pildora-capa';
      b.setAttribute('data-capa', c.id);
      b.setAttribute('aria-pressed', capasOcultas[c.id] ? 'false' : 'true');
      b.innerHTML = '<span class="capa-color-dot" style="background:' + c.color + '"></span>' + c.nombre;
      capasBar.appendChild(b);
    });
    var btnTodosAux=null;
    if(idsAuxiliares.length){
      btnTodosAux=document.createElement('button');
      btnTodosAux.type='button';
      btnTodosAux.className='btn-fig btn-pildora-capa btn-aux-todos';
      btnTodosAux.setAttribute('data-aux-todos','');
      btnTodosAux.setAttribute('aria-pressed','false');
      btnTodosAux.title='Mostrar u ocultar todas las líneas auxiliares';
      btnTodosAux.textContent='✦ Todos los trazos';
      capasBar.appendChild(btnTodosAux);
    }

    if (spec.medidas && spec.medidas.length) {
      var medWrap = document.createElement('div');
      medWrap.className = 'figura-medidas-chips';
      medWrap.innerHTML = spec.medidas.map(function (m) {
        return '<span class="chip-medida"><b>' + m[0] + ':</b> <span class="m">' + m[1] + '</span></span>';
      }).join('');
      capasBar.appendChild(medWrap);
    }
    colLienzo.appendChild(capasBar);
    escenarioClase.appendChild(colLienzo);

    /* 2b. Columna Docente: Vértiz + Paso a Paso */
    var colMaestro = document.createElement('aside');
    colMaestro.className = 'figura-col-maestro';
    colMaestro.setAttribute('aria-label', 'Explicación paso a paso con Vértiz');

    var puntosHtml = pasos.map(function (p, idx) {
      return '<button type="button" class="mm-punto-paso' + (idx === 0 ? ' activo' : '') + '" data-mm-ir="' + idx + '" title="Ir al paso ' + (idx + 1) + ': ' + p.titulo + '">' + (idx + 1) + '</button>';
    }).join('');

    var capaInicial = nombreCapa(spec, pasos[0].capaResaltada);
    var badgeCapaHtml = capaInicial
      ? '<span class="mm-capa-foco" data-mm-capa-tag><span class="capa-color-dot" style="background:' + capaInicial.color + '"></span>Enfoca: ' + capaInicial.nombre + '</span>'
      : '<span class="mm-capa-foco" data-mm-capa-tag hidden></span>';

    colMaestro.innerHTML =
      '<div class="mm-profesor-cabecera">' +
        '<div class="mm-avatar-slot" data-mm-avatar-slot></div>' +
        '<div class="mm-profesor-info">' +
          '<div class="mm-profesor-top">' +
            '<span class="mm-rol-tag">🎓 MODO MAESTRO</span>' +
            '<span class="avatar-ondas-voz" data-mm-ondas aria-hidden="true">' +
              '<span class="onda-1"></span><span class="onda-2"></span><span class="onda-3"></span><span class="onda-4"></span>' +
            '</span>' +
          '</div>' +
          '<strong class="mm-profesor-nombre">Vértiz</strong>' +
          '<span class="mm-profesor-subtitulo">Tu guía de geometría</span>' +
          '<div class="mm-controles-audio">' +
            '<button type="button" class="btn-mm-chip-voz" data-mm-accion="voz" title="Activar o silenciar voz">' +
              '<span class="mm-ico-voz">🔊</span> <span class="mm-txt-voz">Voz activa</span>' +
            '</button>' +
            '<button type="button" class="btn-mm-chip-voz" data-mm-accion="repetir" title="Volver a escuchar este paso">' +
              '🔄 Repetir' +
            '</button>' +
            '<button type="button" class="btn-mm-chip-voz" data-mm-accion="pausa" disabled title="Pausar o reanudar locución">⏸ Pausar</button>' +
          '</div>' +
          '<div class="mm-preferencias-voz">' +
            '<label>Voz española <select data-mm-voz-select aria-label="Seleccionar voz española"><option value="">Automática del navegador</option></select></label>' +
            '<label>Velocidad <select data-mm-velocidad aria-label="Velocidad de locución"><option value="0.8">0,8×</option><option value="1">Normal</option><option value="1.2">1,2×</option></select></label>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="mm-progreso-fila">' +
        '<span class="mm-num-tag" data-mm-paso-num>Paso 1 de ' + pasos.length + '</span>' +
        '<div class="mm-puntos-lista" role="group" aria-label="Pasos de la explicación">' + puntosHtml + '</div>' +
      '</div>' +

      '<div class="mm-caja-dialogo">' +
        '<div class="mm-dialogo-header">' +
          '<strong class="mm-dialogo-titulo" data-mm-titulo>' + pasos[0].titulo + '</strong>' +
          badgeCapaHtml +
        '</div>' +
        '<p class="mm-dialogo-texto" data-mm-texto aria-live="off">' + pasos[0].texto + '</p>' +
        '<div class="mm-transcripcion" data-mm-transcripcion aria-hidden="true"></div>' +
        '<p class="mm-estado-narracion" data-mm-estado-voz role="status" aria-live="polite">Explicación visible. Pulsa explicar para escuchar.</p>' +
      '</div>' +

      '<div class="mm-guion-lista" role="group" aria-label="Índice de pasos de la figura">' +
        pasos.map(function (p, idx) {
          return '<button type="button" class="mm-guion-item' + (idx === 0 ? ' activo' : '') + '" data-mm-ir="' + idx + '">' +
            '<span class="mm-guion-idx">' + (idx + 1) + '</span>' +
            '<span class="mm-guion-tit">' + p.titulo + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +

      '<div class="mm-acciones-fila">' +
        '<button type="button" class="btn-mm-nav btn-mm-ant" data-mm-accion="ant" title="Volver al paso anterior y escucharlo (PageUp)">' +
          '◀ Anterior' +
        '</button>' +
        '<button type="button" class="btn-mm-nav btn-mm-sig" data-mm-accion="sig" title="Iniciar o avanzar al siguiente paso (→ o Espacio)">' +
          '<span data-mm-sig-txt>▶ Explicar paso 1</span>' +
        '</button>' +
      '</div>';

    escenarioClase.appendChild(colMaestro);
    figura.appendChild(escenarioClase);

    /* Pie descriptivo en lecciones */
    if (!esHero && spec.pie) {
      var pie = document.createElement('figcaption');
      pie.className = 'figura-pie';
      pie.innerHTML = '<p class="figura-pie-desc">' + spec.pie + '</p>';
      figura.appendChild(pie);
    }

    contenedor.innerHTML = '';
    contenedor.appendChild(figura);

    /* Montar mini Vértiz dentro del panel docente */
    var slotAvatar = colMaestro.querySelector('[data-mm-avatar-slot]');
    if (global.Tutores) colMaestro.querySelector('.mm-profesor-info').appendChild(global.Tutores.selector());
    var miniAvatar = null;
    if (slotAvatar && global.Avatar && global.Avatar.crearMini) {
      miniAvatar = global.Avatar.crearMini({origen:origenNarracion});
      slotAvatar.appendChild(miniAvatar.nodo);
    }

    var estado = {
      api: null,
      tipo: null,
      reducido: prefiereReducido(),
      spec: spec,
      capasOcultas: capasOcultas,
      giro: !prefiereReducido(),
      pasoActual: 0,
      iniciado: false,
      figura: figura
    };
    function sincronizarCapas(){
      capasBar.querySelectorAll('[data-capa]').forEach(function(b){
        var id=b.getAttribute('data-capa');
        b.setAttribute('aria-pressed',estado.capasOcultas[id]?'false':'true');
        if(estado.api)estado.api.setCapa(id,!estado.capasOcultas[id]);
      });
      if(btnTodosAux)btnTodosAux.setAttribute('aria-pressed',
        idsAuxiliares.every(function(id){return !estado.capasOcultas[id];})?'true':'false');
    }
    var vistaDeseada=vistaPreferida();
    var visibleFigura=!(typeof IntersectionObserver!=='undefined');
    var solicitudVista=0;
    var liberarSiFuera=null;
    var observadorFigura=null;
    function liberarVista3d(){
      if(!estado.api)return;
      var old=estado.api;estado.api=null;
      try{old.destruir();}catch(e){console.warn('No se pudo liberar un visor 3D:',e);}
      var j=instancias.indexOf(estado);if(j>=0)instancias.splice(j,1);
    }

    function actualizarAtencion() {
      if(!estado.iniciado || !estado.atencionActiva || !estado.puntoAtencion || !estado.capaAtencion || estado.capasOcultas[estado.capaAtencion]) {
        guiaFoco.hidden=true;
        if(estado.atencionActiva && estado.capasOcultas[estado.capaAtencion] && global.Tutores)global.Tutores.suspender(figura);
        return;
      }
      var q=estado.tipo==='3d' && estado.api && estado.api.proyectarPunto
        ? estado.api.proyectarPunto(estado.puntoAtencion)
        : estado.proyeccion2d && estado.proyeccion2d.proyectar(estado.puntoAtencion);
      if(!q || !q.visible || !Number.isFinite(q.x) || !Number.isFinite(q.y)){guiaFoco.hidden=true;return;}
      guiaFoco.hidden=false;
      guiaFoco.style.setProperty('--foco-x',q.x+'px');guiaFoco.style.setProperty('--foco-y',q.y+'px');
      var r=lienzo.getBoundingClientRect(), tutor=slotAvatar.getBoundingClientRect();
      var w=r.width,h=r.height;
      var alCostado=tutor.left>=r.right-10;
      var sx=alCostado?w-12:Math.max(12,Math.min(w-12,tutor.left+tutor.width/2-r.left));
      var sy=alCostado?Math.max(12,Math.min(h-12,q.y+40)):h-12;
      guiaFoco.querySelector('path').setAttribute('d','M '+sx+' '+sy+' Q '+sx+' '+q.y+' '+q.x+' '+q.y);
      if(global.Tutores)global.Tutores.orientar({figura:figura,lienzo:lienzo,x:q.x,y:q.y,nombre:estado.nombreAtencion});
    }

    function pintar2d() {
      estado.tipo = '2d';
      lienzo.innerHTML = '';
      estado.proyeccion2d=global.Visor2D.render(lienzo, spec, { capasOcultas: estado.capasOcultas, camara: estado.camaraGuia });
      aviso.hidden = true;
      actualizarAtencion();
    }

    function usar2d(motivo) {
      solicitudVista++;
      liberarVista3d();
      estado.tipo = '2d';
      pintar2d();
      var b = barraSup.querySelector('[data-vista-texto]');
      if (b) b.textContent = 'Vista 3D';
      var btn = buscarControl('vista');
      if (btn) btn.setAttribute('aria-pressed', 'true');
      var giroBtn = buscarControl('giro');
      if (giroBtn) giroBtn.hidden = true;
      if (motivo === 'error') {
        aviso.hidden = false;
        aviso.textContent = 'Vista 2D (WebGL no disponible)';
      }
    }

    function usar3d() {
      var ticket=++solicitudVista;
      aviso.hidden=false;
      aviso.textContent='Preparando vista 3D…';
      cargar3d().then(function(Clase) {
        // El usuario pudo cambiar a 2D o salir de pantalla durante la descarga.
        if(ticket!==solicitudVista || vistaDeseada!=='3d' || !figura.isConnected || !visibleFigura)return;
        liberarVista3d();
        lienzo.innerHTML='';
        try{
          estado.api=new Clase(lienzo,spec,{
            capasOcultas:estado.capasOcultas,reducido:estado.reducido,
            alMoverCamara:actualizarAtencion
          });
          estado.tipo='3d';
          estado.api.setAutoGiro(estado.giro && !estado.reducido);
          aviso.hidden=!!opciones.sinAviso;
          aviso.textContent='Arrastra para girar · rueda para zoom';
          var btn=buscarControl('vista');
          if(btn)btn.setAttribute('aria-pressed','false');
          var vt=barraSup.querySelector('[data-vista-texto]');
          if(vt)vt.textContent='Vista 2D';
          var giroBtn=buscarControl('giro');
          if(giroBtn)giroBtn.hidden=estado.reducido;
          if(instancias.indexOf(estado)<0)instancias.push(estado);
          if(estado.iniciado)irAPaso(estado.pasoActual,false);
        }catch(err){console.warn('Vista 3D no disponible:',err);usar2d('error');}
      }).catch(function(err){
        if(ticket!==solicitudVista)return;
        console.warn('Se conserva 2D:',err);
        usar2d('error');
      });
    }

    // SVG está disponible desde el primer fotograma. Three.js se solicita solo
    // cuando el modelo entra en pantalla o se activa 3D explícitamente.
    usar2d();
    if(vistaDeseada==='3d' && !('IntersectionObserver' in window))usar3d();

    /* ---------- Lógica del Modo Maestro ---------- */
    var btnVoz = colMaestro.querySelector('[data-mm-accion="voz"]');
    var btnRepetir = colMaestro.querySelector('[data-mm-accion="repetir"]');
    var btnPausar = colMaestro.querySelector('[data-mm-accion="pausa"]');
    var selectVoz = colMaestro.querySelector('[data-mm-voz-select]');
    var selectVelocidad = colMaestro.querySelector('[data-mm-velocidad]');
    var transcripcion = colMaestro.querySelector('[data-mm-transcripcion]');
    var estadoNarracion = colMaestro.querySelector('[data-mm-estado-voz]');
    var textoNarracion = '';
    var palabraActual = null;
    if(global.Avatar && global.Avatar.getVelocidadVoz) selectVelocidad.value=String(global.Avatar.getVelocidadVoz());
    var narrador=global.NarracionUI&&global.NarracionUI.montar({panel:colMaestro,origen:origenNarracion});
    // En portada los controles de operación viven en la franja azul, no encima
    // del nombre del profesor ni de la explicación. Las referencias/handlers
    // ya creados continúan vinculados al mismo nodo después de moverlo.
    var controlesExternos=esHero && document.getElementById('hero-aula-controles');
    if (controlesExternos) {
      controlesExternos.appendChild(barraSup);
      var controlesVoz=colMaestro.querySelector('.mm-controles-audio');
      if(controlesVoz)controlesExternos.appendChild(controlesVoz);
      var preferencias=colMaestro.querySelector('.mm-preferencias-voz');
      if(preferencias)panelAjustes.appendChild(preferencias);
      var tutorPreferencias=colMaestro.querySelector('.tutor-preferencias');
      if(tutorPreferencias)panelAjustes.appendChild(tutorPreferencias);
      controlesExternos.appendChild(panelAjustes);
      figura.classList.add('controles-externos');
    }
    var btnAnt = colMaestro.querySelector('[data-mm-accion="ant"]');
    var btnSig = colMaestro.querySelector('[data-mm-accion="sig"]');
    var txtSig = colMaestro.querySelector('[data-mm-sig-txt]');
    var txtPasoNum = colMaestro.querySelector('[data-mm-paso-num]');
    var txtTitulo = colMaestro.querySelector('[data-mm-titulo]');
    var txtExplicacion = colMaestro.querySelector('[data-mm-texto]');
    var tagCapa = colMaestro.querySelector('[data-mm-capa-tag]');
    var ondasMM = colMaestro.querySelector('[data-mm-ondas]');
    var botonesPuntos = colMaestro.querySelectorAll('[data-mm-ir]');

    function actualizarBotonVoz() {
      var activa = global.Avatar && global.Avatar.getVozHabilitada ? global.Avatar.getVozHabilitada() : true;
      var ico = btnVoz.querySelector('.mm-ico-voz');
      var txt = btnVoz.querySelector('.mm-txt-voz');
      if (ico) ico.textContent = activa ? '🔊' : '🔇';
      if(txt)txt.textContent=activa
        ? (global.Avatar&&global.Avatar.getMotorVoz&&global.Avatar.getMotorVoz()==='neural'?'Voz neural':'Voz local')
        : 'Voz OFF';
      btnVoz.classList.toggle('voz-activa', activa);
      btnVoz.setAttribute('aria-pressed',activa?'true':'false');
    }

    function irAPaso(idx, conAudio) {
      if (idx < 0 || idx >= pasos.length) return;
      visorActivo = instanciaPublica;
      estado.pasoActual = idx;
      estado.iniciado = true;
      var paso = pasos[idx];
      estado.atencionActiva=true;
      var objetivo=nombreCapa(spec,paso.capaResaltada);
      estado.capaAtencion=paso.capaResaltada;
      estado.nombreAtencion=objetivo?objetivo.nombre:paso.titulo;
      estado.puntoAtencion=global.Figuras.puntoAtencion(spec,paso.capaResaltada);
      guiaFoco.querySelector('.guia-foco-etiqueta').textContent='Mira: '+estado.nombreAtencion;
      guiaFoco.style.setProperty('--foco-color',objetivo?objetivo.color:'#6366f1');
      if(global.Tutores)global.Tutores.enfocar({figura:figura,lienzo:lienzo,nombre:estado.nombreAtencion,paso:idx+1});
      aviso.hidden=true;
      estado.camaraGuia = paso.camara;
      // La lección dirige el foco y oculta construcciones ajenas al paso.
      if(paso.capasVisibles){
        (spec.capas||[]).forEach(function(c){
          estado.capasOcultas[c.id]=paso.capasVisibles.indexOf(c.id)===-1;
        });
      }else{
        (spec.capas||[]).forEach(function(c){
          if(esCapaAuxiliar(c))estado.capasOcultas[c.id]=c.id!==paso.capaResaltada;
        });
      }
      if(paso.capaResaltada)estado.capasOcultas[paso.capaResaltada]=false;
      sincronizarCapas();
      if (estado.tipo === '2d') pintar2d();

      txtPasoNum.textContent = 'Paso ' + (idx + 1) + ' de ' + pasos.length;
      txtTitulo.textContent = paso.titulo;
      txtExplicacion.innerHTML = paso.texto;
      if(narrador)narrador.mostrarPaso(paso.texto,idx,pasos.length);

      var infoCapa = nombreCapa(spec, paso.capaResaltada);
      if (tagCapa) {
        if (infoCapa) {
          tagCapa.hidden = false;
          tagCapa.innerHTML = '<span class="capa-color-dot" style="background:' + infoCapa.color + '"></span>Enfoca: ' + infoCapa.nombre;
        } else {
          tagCapa.hidden = true;
        }
      }

      botonesPuntos.forEach(function (b) {
        var nPaso = parseInt(b.getAttribute('data-mm-ir'), 10);
        b.classList.toggle('activo', nPaso === idx);
        b.setAttribute('aria-current', nPaso === idx ? 'step' : 'false');
        b.classList.toggle('visitado', nPaso < idx);
      });

      // El primer paso también permite regresar al último y volver a escuchar.
      btnAnt.disabled = false;
      btnAnt.title = idx===0 ? 'Ir al último paso y escucharlo' : 'Volver al paso anterior y escucharlo';
      if (idx === pasos.length - 1) {
        txtSig.textContent = '↻ Reiniciar explicación';
        btnSig.classList.add('btn-completado');
      } else {
        txtSig.textContent = 'Avanzar al paso ' + (idx + 2) + ' ⏭';
        btnSig.classList.remove('btn-completado');
      }

      /* Animar cámara y resaltar capa en el modelo 3D */
      if (estado.tipo === '3d' && estado.api) {
        estado.giro = false;
        estado.api.setAutoGiro(false);
        var giroBtn = buscarControl('giro');
        if (giroBtn) giroBtn.setAttribute('aria-pressed', 'false');

        if (paso.camara && estado.api.enfocarCamara) {
          estado.api.enfocarCamara(paso.camara.theta, paso.camara.phi, paso.camara.dist,estado.reducido?0:750);
        }
        if (paso.capaResaltada && estado.api.resaltarCapa) {
          estado.api.resaltarCapa(paso.capaResaltada, 0);
          var pillCapa = capasBar.querySelector('[data-capa="' + paso.capaResaltada + '"]');
          if (pillCapa) pillCapa.setAttribute('aria-pressed', 'true');
        }
      }

      /* La voz y el resaltado son accesorios: jamás desaparece el paso al terminar. */
      actualizarAtencion();
      if(global.AvatarGuia && global.AvatarGuia.setMensaje)
        global.AvatarGuia.setMensaje(txtExplicacion.textContent);
      if(conAudio!==false) {
        if(global.Avatar && global.Avatar.hablarVoz)
          global.Avatar.hablarVoz(paso.texto,null,{origen:origenNarracion,figura:idFigura,paso:idx});
        // Dos pasos siguientes se descargan mientras se oye el actual.
        // Sin precarga de otros módulos para limitar uso de Workers AI.
        if(global.VozNeural && global.VozNeural.precargar &&
           global.Avatar && global.Avatar.getMotorVoz &&
           global.Avatar.getMotorVoz()==='neural' &&
           global.Avatar.getVozHabilitada && global.Avatar.getVozHabilitada()) {
          for(var siguiente=idx+1;siguiente<Math.min(idx+3,pasos.length);siguiente++)
            global.VozNeural.precargar({figura:idFigura,paso:siguiente,
              voz:global.Avatar.getVozNeural?global.Avatar.getVozNeural():'javier'});
        }
      } else if(narrador) {
        narrador.detenerSiPropio();
      }
    }

    btnSig.setAttribute('aria-keyshortcuts','PageDown');
    btnAnt.setAttribute('aria-keyshortcuts','PageUp');
    btnSig.addEventListener('click', function () {
      if (!estado.iniciado) {
        irAPaso(0, true);
      } else if (estado.pasoActual < pasos.length - 1) {
        irAPaso(estado.pasoActual + 1, true);
      } else {
        irAPaso(0, true);
      }
    });

    btnAnt.addEventListener('click', function () {
      irAPaso(estado.pasoActual>0 ? estado.pasoActual-1 : pasos.length-1, true);
    });

    btnRepetir.addEventListener('click', function () {
      irAPaso(estado.pasoActual, true);
    });

    botonesPuntos.forEach(function (b) {
      b.addEventListener('click', function () {
        var idx = parseInt(b.getAttribute('data-mm-ir'), 10);
        if (!isNaN(idx)) irAPaso(idx, true);
      });
    });

    btnVoz.addEventListener('click', function () {
      if (global.Avatar && global.Avatar.getVozHabilitada && global.Avatar.setVozHabilitada) {
        var nueva = !global.Avatar.getVozHabilitada();
        global.Avatar.setVozHabilitada(nueva);
        actualizarBotonVoz();
        if (nueva) {
          irAPaso(estado.pasoActual, true);
        }
      }
    });

    document.addEventListener('voz-cambiada', actualizarBotonVoz);
    document.addEventListener('avatar-voces-cambiadas',actualizarBotonVoz);
    document.addEventListener('tutor-enfocando',function(e){
      if(e.detail.figura!==figura){estado.atencionActiva=false;guiaFoco.hidden=true;var m=colMaestro.querySelector('.tutor-consigna');if(m)m.hidden=true;}
    });
    document.addEventListener('avatar-hablando', function (e) {
      var d=e.detail||{};
      var activo=!!d.activo&&d.origen===origenNarracion;
      if (ondasMM) ondasMM.classList.toggle('activo', activo);
      colMaestro.classList.toggle('hablando-ahora', activo);
    });
    actualizarBotonVoz();

    /* ---------- Controles de la barra superior ---------- */
    buscarControl('vista').addEventListener('click', function () {
      if(vistaDeseada==='3d') {
        vistaDeseada='2d';
        usar2d();
      } else {
        vistaDeseada='3d';
        visibleFigura=true;
        usar3d();
      }
      fijarVistaPreferida(vistaDeseada);
    });

    buscarControl('reset').addEventListener('click', function () {
      if (estado.tipo === '3d' && estado.api) {
        estado.api.reset();
        if (estado.iniciado) irAPaso(estado.pasoActual, false);
      } else {
        pintar2d();
      }
    });

    buscarControl('giro').addEventListener('click', function () {
      estado.giro = !estado.giro;
      this.setAttribute('aria-pressed', estado.giro ? 'true' : 'false');
      if (estado.api) estado.api.setAutoGiro(estado.giro);
    });

    buscarControl('contraste').addEventListener('click', function () {
      var oscuro = figura.classList.toggle('tema-oscuro-visor');
      this.setAttribute('aria-pressed', oscuro ? 'true' : 'false');
      if (estado.api && estado.api._resize) estado.api._resize();
    });

    var btnProyectar = barraSup.querySelector('[data-accion="proyectar"]');
    var txtProyectar = barraSup.querySelector('[data-proyectar-texto]');

    function alternarProyector() {
      visorActivo = instanciaPublica;
      var proyectando = figura.classList.toggle('modo-proyector');
      document.body.classList.toggle('con-visor-proyectado', proyectando);
      btnProyectar.setAttribute('aria-pressed', proyectando ? 'true' : 'false');
      if (txtProyectar) txtProyectar.textContent = proyectando ? '✕ Salir' : '⛶ Proyectar';

      if (proyectando) {
        // La portada conserva la barra de controles externa y no usa
        // fullscreen nativo del subárbol del visor (la ocultaría).
        if (!esHero && figura.requestFullscreen) {
          figura.requestFullscreen().catch(function () {});
        }
        if(!esHero)figura.focus();
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(function () {});
        }
      }
      setTimeout(function () {
        if (estado.api && estado.api._resize) estado.api._resize();
        else if (estado.tipo === '2d') pintar2d();
      }, 60);
    }

    btnProyectar.addEventListener('click', alternarProyector);

    document.addEventListener('fullscreenchange', function () {
      if (!document.fullscreenElement && figura.classList.contains('modo-proyector')) {
        figura.classList.remove('modo-proyector');
        document.body.classList.remove('con-visor-proyectado');
        btnProyectar.setAttribute('aria-pressed', 'false');
        if (txtProyectar) txtProyectar.textContent = '⛶ Proyectar';
        setTimeout(function () {
          if (estado.api && estado.api._resize) estado.api._resize();
        }, 60);
      }
    });

    /* ---------- Capas ---------- */
    capasBar.querySelectorAll('[data-capa]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-capa');
        var activa = b.getAttribute('aria-pressed') === 'true';
        b.setAttribute('aria-pressed', activa ? 'false' : 'true');
        estado.capasOcultas[id] = activa;
        if (estado.tipo === '3d' && estado.api) estado.api.setCapa(id, !activa);
        else pintar2d();
        sincronizarCapas();
        actualizarAtencion();
      });
    });
    if(btnTodosAux)btnTodosAux.addEventListener('click',function(){
      var todos=idsAuxiliares.every(function(id){return !estado.capasOcultas[id];});
      idsAuxiliares.forEach(function(id){estado.capasOcultas[id]=todos;});
      sincronizarCapas();
      if(estado.tipo==='2d')pintar2d();
      actualizarAtencion();
    });

    /* Visor bajo demanda: liberar memoria GPU cuando deja de utilizarse. */
    if('IntersectionObserver' in window){
      observadorFigura=new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          visibleFigura=!!e.isIntersecting;
          if(liberarSiFuera){clearTimeout(liberarSiFuera);liberarSiFuera=null;}
          if(visibleFigura){
            if(vistaDeseada==='3d' && !estado.api)usar3d();
            else if(estado.api)estado.api.reanudar();
            if(!visorActivo)visorActivo=instanciaPublica;
          }else{
            if(estado.api)estado.api.pausar();
            liberarSiFuera=setTimeout(function(){
              liberarSiFuera=null;
              if(!visibleFigura && estado.api)usar2d();
            },6000);
          }
        });
      },{rootMargin:'160px'});
      observadorFigura.observe(figura);
    }

    window.addEventListener('pagehide',function(){
      solicitudVista++;
      if(liberarSiFuera)clearTimeout(liberarSiFuera);
      if(observadorFigura)observadorFigura.disconnect();
      liberarVista3d();
      if(narrador)narrador.detenerSiPropio();
    });

    figura.addEventListener('mouseenter', function () {
      visorActivo = instanciaPublica;
    });
    figura.addEventListener('focusin', function () {
      visorActivo = instanciaPublica;
    });

    window.addEventListener('resize', function () {
      if (estado.tipo === '2d') pintar2d();
      actualizarAtencion();
    });

    document.addEventListener('movimiento-cambiado', function (e) {
      estado.reducido = e.detail.reducido;
      if (estado.api) estado.api.setReducido(estado.reducido);
      if (estado.api && estado.reducido) estado.api.setAutoGiro(false);
    });

    var instanciaPublica = {
      elemento: figura,
      irAPaso: irAPaso,
      siguientePaso: function () { btnSig.click(); },
      anteriorPaso: function () { btnAnt.click(); },
      alternarProyector: alternarProyector,
      obtenerEstado: function () { return estado; },
      origenNarracion: origenNarracion
    };

    if (!visorActivo) visorActivo = instanciaPublica;
    return instanciaPublica;
  }

  /* Atajos de teclado de aula (cuando se proyecta o no se está en un input) */
  window.addEventListener('keydown', function (e) {
    if (!visorActivo) return;
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) return;
    if ((tag === 'button' || tag === 'a') && e.key === ' ') return;

    var st = visorActivo.obtenerEstado();
    var enProyector = st && st.figura && st.figura.classList.contains('modo-proyector');
    var focoEnFigura = st && st.figura && st.figura.contains(document.activeElement);

    if (!enProyector && !focoEnFigura) return;

    if (e.key === 'PageDown' || (enProyector && (e.key === 'ArrowRight' || e.key === ' '))) {
      e.preventDefault();
      visorActivo.siguientePaso();
    } else if (e.key === 'PageUp' || (enProyector && e.key === 'ArrowLeft')) {
      e.preventDefault();
      visorActivo.anteriorPaso();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      visorActivo.alternarProyector();
    } else if (e.key === 'Escape' && enProyector) {
      e.preventDefault();
      visorActivo.alternarProyector();
    }
  });

  global.Visor = {
    montar: montarFigura,
    montarFigura: montarFigura,
    instancias: instancias,
    cargar3d: cargar3d
  };
})(window);
