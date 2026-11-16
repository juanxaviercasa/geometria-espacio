/* Profesorado 3D preexistente, licenciado y alojado localmente:
   dos humanos Rocketbox MIT y tres personajes KayKit CC0. Carga WebGL
   diferida, visemas guiados por amplitud y gestos de enseñanza.
   Vértiz SVG permanece como alternativa cuando falla el 3D. */
(function (global) {
  'use strict';
  /* Rocketbox tiene visemas Oculus; KayKit tiene animaciones esqueléticas
     pero no visemas. Ninguno se presenta como lipsync fonético exacto. */
  var CATALOGO = [
    {id:'profesor-realista',nombre:'Marco · Profesor realista',tipo:'3D',
      modelo:'vendor/avatares/rocketbox_male.glb',meshopt:true,realista:true,
      descripcion:'Profesor 3D humano con visemas y expresiones faciales'},
    {id:'profesora-realista',nombre:'Elena · Profesora realista',tipo:'3D',
      modelo:'vendor/avatares/rocketbox_female.glb',meshopt:true,realista:true,
      descripcion:'Profesora 3D con rostro expresivo y gestos'},
    {id:'maestro-arcano',nombre:'Ariel · Maestro 3D',tipo:'3D',modelo:'vendor/avatares/player_priest.glb',
      descripcion:'Profesor de estilo anime-aventura, con gestos de enseñanza'},
    {id:'guardian-zenit',nombre:'Axel · Guardián 3D',tipo:'3D',modelo:'vendor/avatares/player_swordsman.glb',
      descripcion:'Profesor estilo videojuego, con animaciones corporales'},
    {id:'exploradora-zenit',nombre:'Lía · Exploradora 3D',tipo:'3D',modelo:'vendor/avatares/player_archer.glb',
      descripcion:'Guía 3D con gestos y movimientos'},
    {id:'vertiz',nombre:'Vértiz · 2D ligero',tipo:'Ilustración',
      descripcion:'Alternativa ligera sin WebGL'}
  ];
  var clave = 'geo3d.tutor.v1';
  var estiloVoz = 'natural';
  try { var estiloGuardado=localStorage.getItem('geo3d.voz.estilo.v1');if(['natural','anime'].indexOf(estiloGuardado)!==-1)estiloVoz=estiloGuardado; } catch(e) {}
  var vocesSelectores = [];
  var PERFILES = {
    dragon: {pitch:0.72,rate:0.93,descripcion:'Grave y aventurera'},
    capibara: {pitch:0.9,rate:0.91,descripcion:'Cálida y tranquila'},
    aguila: {pitch:0.86,rate:1.02,descripcion:'Firme y clara'},
    pikachu: {pitch:1.48,rate:1.06,descripcion:'Aguda y alegre'},
    charizard: {pitch:0.75,rate:0.98,descripcion:'Grave y enérgica'},
    eevee: {pitch:1.22,rate:1.02,descripcion:'Suave y curiosa'},
    dragonite: {pitch:0.88,rate:0.96,descripcion:'Amable y aventurera'},
    vertiz: {pitch:1.04,rate:1,descripcion:'Natural de profesor'}
    ,zorro:{pitch:1.13,rate:1.04,descripcion:'Ágil y curiosa'}
    ,gato:{pitch:1.16,rate:0.98,descripcion:'Suave y expresiva'}
    ,panda:{pitch:0.92,rate:0.92,descripcion:'Cálida y serena'}
    ,conejo:{pitch:1.3,rate:1.05,descripcion:'Alegre y ligera'}
    ,lobo:{pitch:0.79,rate:0.98,descripcion:'Grave y segura'}
    ,'dragon-alado':{pitch:0.72,rate:0.93,descripcion:'Grave y aventurera'}
  };
  var elegido = 'profesor-realista';
  try {
    var valor = localStorage.getItem(clave);
    // La elección explícita del estudiante prevalece. Usuarios nuevos ven
    // a Marco; quien eligió Vértiz conserva el modo ligero en próximas visitas.
    if(buscar(valor))elegido=valor;
  } catch (e) {}
  var vistas = [], selectores = [], cargas = {}, T, renderer, scene, camera, modelo, mixer, alas = [], cabeza;
  var revision = 0, animacion = 0, ultimo = 0, hablando = false, giro = 0.35, arrastrando = false;
  var foco=null, huesosGuia=null,acciones3d=null,accion3d=null;
   var miradaX=0,miradaY=0,gestoNivel=0;
  var mallasLabios=[],elementoAudio=null,envolventeAudio=null,pasoAudio=.05;
  function limpiarAudioVisual(){elementoAudio=null;envolventeAudio=null;}
  function procesarAudio(blob,elemento){
    limpiarAudioVisual();elementoAudio=elemento;
    if(!mallasLabios.length)return;
    var Contexto=global.AudioContext||global.webkitAudioContext;
    if(!Contexto||!blob||!blob.arrayBuffer)return;
    var contexto;
    try{contexto=new Contexto();}catch(e){return;}
    blob.arrayBuffer().then(function(bytes){return contexto.decodeAudioData(bytes);})
      .then(function(audio){
        if(elementoAudio!==elemento)return;
        var data=audio.getChannelData(0),salto=Math.max(1,Math.round(audio.sampleRate*pasoAudio));
        var result=new Float32Array(Math.ceil(data.length/salto));
        for(var k=0;k<result.length;k++){
          var desde=k*salto,hasta=Math.min(data.length,desde+salto),sum=0,n=0;
          for(var j=desde;j<hasta;j+=8){sum+=data[j]*data[j];n++;}
          result[k]=n?Math.sqrt(sum/n):0;
        }
        if(elementoAudio===elemento)envolventeAudio=result;
      }).catch(function(){/* sin datos PCM: gestos normales */})
      .finally(function(){contexto.close().catch(function(){});});
  }
  function nivelDeVoz(t){
    if(!hablando)return 0;
    if(elementoAudio&&envolventeAudio){
      var i=Math.floor(elementoAudio.currentTime/pasoAudio);
      return Math.min(.92,Math.max(0,(envolventeAudio[i]||0)*4));
    }
    return .22+.10*Math.max(0,Math.sin(t*14));
  }
  var erroresModelo=0;
  var baseURL = new URL('../', document.currentScript.src);
  function url(ruta) { return new URL(ruta, baseURL).href; }
  function buscar(id) { return CATALOGO.find(function (p) { return p.id === id; }); }
  function reducido() { return global.Progreso ? global.Progreso.prefiereMovimientoReducido() : global.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function script(ruta) {
    if (cargas[ruta]) return cargas[ruta];
    cargas[ruta] = new Promise(function (resolve, reject) {
      var s = document.createElement('script'); s.src = url(ruta);
      s.onload = resolve; s.onerror = function () { delete cargas[ruta]; s.remove(); reject(new Error('No se pudo cargar ' + ruta)); };
      document.head.appendChild(s);
    });
    return cargas[ruta];
  }
  function actualizarNombres() {
    var p = buscar(elegido);
    document.querySelectorAll('.mm-profesor-nombre').forEach(function (n) {
      n.textContent=n.closest('.figura-hero-modo')?p.nombre:p.nombre+' explica este modelo';
    });
    document.querySelectorAll('.etiqueta-avatar').forEach(function (n) { n.textContent = p.nombre + ' explica'; });
    selectores = selectores.filter(function (s) { return s.isConnected; });
    selectores.forEach(function (s) { s.value = elegido; });
    vocesSelectores=vocesSelectores.filter(function(s){return s.isConnected;});
    vocesSelectores.forEach(function(s){s.value=estiloVoz;});
    document.querySelectorAll('[data-tutor-voz]').forEach(function(n){n.textContent=perfilVoz().descripcion+' · español';});
  }
  function elegir(id) {
    if (!buscar(id)) return false;
    elegido = id;
    if(global.Avatar)global.Avatar.detenerVoz();
    try { localStorage.setItem(clave, id); } catch (e) {}
    vistas = vistas.filter(function (v) { return v.nodo.isConnected; });
    vistas.forEach(pintar);
    actualizarNombres(); cargarModelo();
    document.dispatchEvent(new CustomEvent('tutor-cambiado', { detail: { id: id } }));
    return true;
  }
  function selector() {
    var label = document.createElement('label'); label.className = 'tutor-selector';
    var nombre = document.createElement('span'); nombre.textContent = 'Elige tu tutor';
    var select = document.createElement('select'); select.setAttribute('aria-label', 'Elige tu tutor');
    ['3D', 'Ilustración'].forEach(function (tipo) {
      var grupo = document.createElement('optgroup');
      grupo.label=tipo==='3D'?'Profesores 3D · humanos y videojuego':'Alternativa ligera';
      CATALOGO.filter(function (p) { return p.tipo === tipo; }).forEach(function (p) {
        var option = document.createElement('option'); option.value = p.id; option.textContent = p.nombre; grupo.appendChild(option);
      });
      select.appendChild(grupo);
    });
    select.value = elegido; select.addEventListener('change', function () { elegir(select.value); });
    selectores.push(select); label.appendChild(nombre); label.appendChild(select);
    var panel=document.createElement('div');panel.className='tutor-preferencias';panel.appendChild(label);
    var vozLabel=document.createElement('label');vozLabel.className='tutor-selector';
    var vozNombre=document.createElement('span');vozNombre.textContent='Tonalidad de voz';vozLabel.appendChild(vozNombre);
    var vozSelect=document.createElement('select');vozSelect.setAttribute('aria-label','Tonalidad de voz');
    [['natural','Voz natural'],['anime','Tono expresivo (voz del dispositivo)']].forEach(function(v){var o=document.createElement('option');o.value=v[0];o.textContent=v[1];vozSelect.appendChild(o);});
    vozSelect.value=estiloVoz;vocesSelectores.push(vozSelect);
    vozSelect.addEventListener('change',function(){estiloVoz=vozSelect.value;try{localStorage.setItem('geo3d.voz.estilo.v1',estiloVoz);}catch(e){}if(global.Avatar)global.Avatar.detenerVoz();actualizarNombres();});
    vozLabel.appendChild(vozSelect);panel.appendChild(vozLabel);
    var descripcion=document.createElement('small');descripcion.setAttribute('data-tutor-voz','');descripcion.textContent=perfilVoz().descripcion+' · español';panel.appendChild(descripcion);
    return panel;
  }
  function perfilVoz() {
    if(estiloVoz==='natural')return {pitch:1,rate:1,descripcion:'Voz natural'};
    if(estiloVoz==='anime')return {pitch:1.08,rate:1.06,descripcion:'Heroica y enérgica'};
    return PERFILES[elegido]||{pitch:1,rate:1,descripcion:'Voz natural'};
  }
  function participa(v) { var f=v.nodo.closest('.figura');return !!foco && (!f || f===foco.figura); }
  function direccion(v) {
    var r=v.nodo.getBoundingClientRect(),l=foco.lienzo.getBoundingClientRect();
    var dx=l.left+(Number.isFinite(foco.x)?foco.x:l.width/2)-(r.left+r.width/2);
    var dy=l.top+(Number.isFinite(foco.y)?foco.y:l.height/2)-(r.top+r.height/2);
    return {x:Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*0.7?(dx<0?-1:1):0,y:dy<0?-1:1,angulo:Math.atan2(dy,dx)*180/Math.PI+90};
  }
  function actualizarGestos() {
    vistas.forEach(function(v){
      var activa=participa(v);v.nodo.classList.toggle('tutor-senalando',activa);
      v.nodo.dataset.gesto=activa?'senala':'reposo';v.nodo.dataset.objetivo=activa?foco.nombre:'';
      if(activa){var d=direccion(v);v.nodo.dataset.direccion=d.x<0?'izq':d.x>0?'der':'arriba';v.nodo.style.setProperty('--tutor-mano-angulo',d.angulo+'deg');v.nodo.style.setProperty('--tutor-inclinacion',(d.x*6)+'deg');}
    });
  }
  function enfocar(info) {
    foco=info;
    document.dispatchEvent(new CustomEvent('tutor-enfocando',{detail:{figura:info.figura}}));
    var panel=info.figura.querySelector('.mm-profesor-info');
    var mensaje=panel.querySelector('.tutor-consigna');
    if(!mensaje){mensaje=document.createElement('p');mensaje.className='tutor-consigna';mensaje.setAttribute('role','status');panel.appendChild(mensaje);}
    mensaje.hidden=false;mensaje.textContent='☝ Fíjate en: '+info.nombre;
    actualizarGestos();despertar();
  }
  function orientar(info) { if(!foco){enfocar(info);return;}if(foco.figura!==info.figura)return;foco=Object.assign({},foco,info);actualizarGestos();despertar(); }
  function suspender(figura) {if(foco && foco.figura===figura){foco=null;actualizarGestos();var m=figura.querySelector('.tutor-consigna');if(m)m.hidden=true;despertar();}}
  function pintar(v) {
    var p = buscar(elegido); v.canvas = null;
    v.nodo.classList.toggle('tutor-personalizado', p.id !== 'vertiz');
    v.nodo.classList.toggle('tutor-realista', !!p.realista);
    v.nodo.querySelectorAll('.tutor-visual').forEach(function (n) { n.remove(); });
    if (p.id === 'vertiz') return;
    var visual;
    if (p.pokemon) {
      visual = document.createElement('img');
      visual.loading='lazy';visual.decoding='async';
      visual.src = url('vendor/pokemon-' + p.pokemon + (reducido() ? '.png' : '.gif'));
      visual.alt = p.nombre + ', tutor Pokémon animado en 2D'; visual.className = 'tutor-visual tutor-pokemon';
      visual.addEventListener('error', function () { visual.alt = p.nombre + ' no pudo cargarse. Puedes elegir otro tutor.'; });
    } else {
      visual = document.createElement('canvas'); visual.width = 420; visual.height = 420;
      visual.className = 'tutor-visual tutor-canvas'; visual.setAttribute('role', 'img');
      visual.tabIndex=0;
      visual.setAttribute('aria-label', p.nombre + ' 3D. Arrastra o usa las flechas izquierda y derecha para girarlo.');
      visual.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();giro+=(e.key==='ArrowLeft'?-1:1)*0.2;despertar();}});
      v.canvas = visual;
      var x = 0;
      visual.addEventListener('pointerdown', function (e) { arrastrando = true; x=e.clientX; visual.setPointerCapture(e.pointerId); });
      visual.addEventListener('pointermove', function (e) { if (!arrastrando) return; giro += (e.clientX-x)*0.012; x=e.clientX; despertar(); });
      function soltar() { arrastrando = false; }
      visual.addEventListener('pointerup', soltar); visual.addEventListener('pointercancel', soltar);
      // No dibujamos emojis como sustitutos del profesor.
      var ctx=visual.getContext('2d');
      if(ctx) {
        var grad=ctx.createLinearGradient(0,0,0,420);
        grad.addColorStop(0,'#e7edff');grad.addColorStop(1,'#f8faff');
        ctx.fillStyle=grad;ctx.fillRect(0,0,420,420);
        ctx.fillStyle='#343d70';ctx.font='600 24px sans-serif';
        ctx.textAlign='center';ctx.fillText('Cargando profesor 3D…',210,355);
      }
    }
    v.nodo.appendChild(visual);
    if(p.pokemon){var mano=document.createElement('span');mano.className='tutor-mano tutor-visual';mano.textContent='☝';mano.setAttribute('aria-hidden','true');v.nodo.appendChild(mano);}
    actualizarGestos();
    if(v.canvas && renderer && cargadoId===p.id)copiar(v);
  }
  function copiar(v) { if(!v.canvas)return;var ctx=v.canvas.getContext('2d');if(ctx){ctx.clearRect(0,0,420,420);ctx.drawImage(renderer.domElement,0,0);} }
  function montar(nodo) {
    var v = { nodo: nodo, visible: !('IntersectionObserver' in global), canvas: null };
    vistas.push(v); pintar(v);
    if ('IntersectionObserver' in global) {
      v.observer = new IntersectionObserver(function (entries) {
        v.visible=entries[0].isIntersecting;
        if(v.visible)cargarModelo();
        despertar();
      }, {rootMargin:'80px'});
      v.observer.observe(nodo);
    }
    actualizarNombres();
    // crearMini() monta el tutor ANTES de insertarlo en el DOM. Si cargamos
    // aquí, cargarModelo() elimina las vistas no conectadas y el observer
    // nunca puede reactivarlas. Esperar a la primera entrada visible.
    if(nodo.isConnected)cargarModelo();
  }
  function material(color) { return new T.MeshStandardMaterial({color:color,roughness:0.72,metalness:0.02}); }
  function esfera(parent, color, pos, scale) {
    var m = new T.Mesh(new T.SphereGeometry(1,16,12), material(color)); m.position.set.apply(m.position,pos); m.scale.set.apply(m.scale,scale); parent.add(m); return m;
  }
  function cono(parent,color,pos,r,h,rot) {
    var m=new T.Mesh(new T.ConeGeometry(r,h,8),material(color)); m.position.set.apply(m.position,pos); if(rot)m.rotation.set.apply(m.rotation,rot); parent.add(m); return m;
  }
  function bloques(id) {
    var datos={
      dragon:{piel:'#36a69d',morro:'#81d8b7',ropa:'#315c87',orejas:'cuernos'},
      capibara:{piel:'#b98454',morro:'#d5aa7a',ropa:'#477a67',orejas:'cortas'},
      aguila:{piel:'#6b4836',cabeza:'#fff4dc',morro:'#f4bd3d',ropa:'#3f608b',orejas:'alas'},
      zorro:{piel:'#e98b39',morro:'#fff0d5',ropa:'#496773',orejas:'punta'},
      gato:{piel:'#a1acbb',morro:'#edf0ed',ropa:'#785c9b',orejas:'punta'},
      panda:{piel:'#f0e9df',morro:'#fff8e8',ropa:'#597e72',orejas:'panda'},
      conejo:{piel:'#f4e3d4',morro:'#fff7ed',ropa:'#7183ab',orejas:'largas'},
      lobo:{piel:'#758ca1',morro:'#d5e5e7',ropa:'#3a586c',orejas:'punta'}
    }[id];
    var root=new T.Group();
    function cubo(parent,color,pos,tam) { var m=new T.Mesh(new T.BoxGeometry(tam[0],tam[1],tam[2]),material(color));m.position.set.apply(m.position,pos);parent.add(m);return m; }
    var oscuro=id==='panda'?'#30323b':id==='zorro'?'#584435':datos.piel;
    cubo(root,datos.ropa,[0,0.9,0],[0.68,0.73,0.41]);
    cubo(root,'#26374a',[0,0.52,0],[0.7,0.08,0.43]);
    [-1,1].forEach(function(s){
      var pierna=new T.Group();pierna.position.set(s*0.19,0.5,0);root.add(pierna);
      cubo(pierna,oscuro,[0,-0.18,0],[0.29,0.36,0.33]);
      cubo(pierna,'#26374a',[0,-0.38,0.06],[0.32,0.13,0.43]);
      var brazo=new T.Group();brazo.position.set(s*0.49,1.15,0);root.add(brazo);
      cubo(brazo,datos.ropa,[0,-0.19,0],[0.27,0.4,0.35]);
      cubo(brazo,oscuro,[0,-0.47,0.015],[0.27,0.18,0.34]);
      cubo(brazo,oscuro,[s*0.055,-0.61,0.08],[0.08,0.16,0.12]);
      brazo.userData.tutorBrazo=s;alas.push(brazo);
    });
    cabeza=new T.Group();cabeza.position.set(0,1.64,0);root.add(cabeza);
    cubo(cabeza,datos.cabeza||datos.piel,[0,0,0],[0.86,0.68,0.62]);
    cubo(cabeza,datos.morro,[0,-0.14,0.37],[id==='capibara'?0.73:0.55,0.28,id==='aguila'?0.44:0.25]);
    [-1,1].forEach(function(s){
      if(id==='panda')cubo(cabeza,'#30323b',[s*0.23,0.045,0.32],[0.24,0.27,0.025]);
      cubo(cabeza,'#172233',[s*0.23,0.06,id==='panda'?0.34:0.32],[0.095,0.13,0.035]);
      cubo(cabeza,'#fff9ed',[s*0.245,0.093,0.346],[0.028,0.04,0.018]);
      if(datos.orejas==='largas') { cubo(cabeza,datos.piel,[s*0.25,0.63,-0.035],[0.21,0.64,0.2]);cubo(cabeza,'#e2a5b1',[s*0.25,0.64,0.074],[0.11,0.42,0.02]); }
      else if(datos.orejas==='cuernos') { cubo(cabeza,'#e7c891',[s*0.31,0.48,-0.05],[0.16,0.31,0.17]); }
      else if(datos.orejas!=='alas') { var oreja=cubo(cabeza,datos.orejas==='panda'?'#30323b':datos.piel,[s*0.31,0.4,-0.03],[0.22,datos.orejas==='punta'?0.31:0.18,0.23]);if(datos.orejas==='punta')oreja.rotation.z=-s*0.18; }
      if(id==='dragon'||id==='aguila') {
        var ala=new T.Group();ala.position.set(s*0.33,1.15,-0.2);root.add(ala);
        for(var i=0;i<3;i++) { var pluma=cubo(ala,id==='dragon'?'#8470b8':'#9f7950',[s*(0.26+i*0.18),0.05-i*0.13,-0.07],[0.23,0.55-i*0.06,0.1]);pluma.rotation.z=-s*0.3; }
        ala.userData.tutorAla=s;alas.push(ala);
      }
      if(id==='capibara')cubo(cabeza,'#5a3c2b',[s*0.15,-0.07,0.505],[0.075,0.035,0.025]);
    });
    if(id!=='capibara'&&id!=='aguila')cubo(cabeza,id==='dragon'?'#28665e':'#4a3440',[0,-0.09,0.515],[0.13,0.075,0.04]);
    cubo(root,'#e6b45c',[0,1.23,0.24],[0.73,0.09,0.1]);
    var emblema=cubo(root,'#f7d985',[0,0.96,0.23],[0.16,0.16,0.04]);emblema.rotation.z=Math.PI/4;
    if(id==='dragon'||id==='gato'||id==='zorro'||id==='lobo') {
      var cola=cubo(root,datos.piel,[0,0.66,-0.43],[0.17,0.18,0.55]);cola.rotation.x=-0.3;
      if(id==='zorro')cubo(root,'#fff0d5',[0,0.76,-0.72],[0.19,0.21,0.22]);
    }
    return root;
  }
  function liberarModelo() {
    if(mixer) { mixer.stopAllAction(); mixer.uncacheRoot(modelo); mixer=null; }
    if(modelo) {
      scene.remove(modelo);
      modelo.traverse(function (o) { if(o.geometry)o.geometry.dispose(); if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(function(m){Object.keys(m).forEach(function(k){if(m[k]&&m[k].isTexture)m[k].dispose();});m.dispose();}); });
      modelo=null;
    }
    alas=[]; cabeza=null;huesosGuia=null;acciones3d=null;accion3d=null;
    miradaX=0;miradaY=0;gestoNivel=0;
    mallasLabios=[];limpiarAudioVisual();
  }
  function iniciarMotor() {
    if(renderer) return;
    T=global.THREE;
    renderer=new T.WebGLRenderer({alpha:true,antialias:!reducido(),preserveDrawingBuffer:false,powerPreference:'low-power'});
    renderer.setSize(420,420); renderer.setPixelRatio(1); renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.2;
    scene=new T.Scene(); camera=new T.PerspectiveCamera(32,1,0.1,100); camera.position.set(0,1.15,4.8); camera.lookAt(0,0.96,0);
    scene.add(new T.HemisphereLight('#e5f5ff','#b3a0ab',1.9)); var frente=new T.DirectionalLight('#ffffff',1.7);frente.position.set(0,2,5);scene.add(frente);
    var sol=new T.DirectionalLight('#fff2d6',2.4); sol.position.set(3,5,4); scene.add(sol);
    var borde=new T.DirectionalLight('#9ebdff',1.8); borde.position.set(-4,3,-3); scene.add(borde);
  }
  var preparando = null;
  function motor() {
    if(renderer)return Promise.resolve();
    if(preparando)return preparando;
    preparando=(global.THREE?Promise.resolve():(global.Cargador3D?global.Cargador3D.cargarThree():script('vendor/three.min.js'))).then(function(){iniciarMotor();}).catch(function(e){preparando=null;throw e;});
    return preparando;
  }
  var cargadoId=null, pendienteId=null;
  function cargarModelo() {
    var p=buscar(elegido);
    if(p.tipo!=='3D') { revision++; pendienteId=null; if(scene)liberarModelo(); cargadoId=null; return; }
    vistas=vistas.filter(function(v){return v.nodo.isConnected;});
    if(!vistas.some(function(v){return v.visible;}))return;
    if(cargadoId===p.id || pendienteId===p.id) { despertar(); return; }
    var token=++revision; pendienteId=p.id; vistas.forEach(function(v){v.nodo.dataset.carga="motor";});
    motor().then(function () {
      if(token!==revision)return;
      liberarModelo(); vistas.forEach(function(v){v.nodo.dataset.carga="modelo";});
      if(!p.modelo)return bloques(p.id);
      var librerias=[];
      if(!T.GLTFLoader)librerias.push(script('vendor/GLTFLoader.js?v=160-1'));
      if(p.meshopt&&!global.MeshoptDecoder)
        librerias.push(script('vendor/meshopt_decoder_reference.js?v=20261115'));
      return Promise.all(librerias).then(function(){
        var loader=new T.GLTFLoader();
        if(p.meshopt){
          if(!global.MeshoptDecoder)throw Error('Decodificador Meshopt ausente');
          loader.setMeshoptDecoder(global.MeshoptDecoder);
        }
        return new Promise(function(resolve,reject){
          loader.load(url(p.modelo),resolve,undefined,reject);
        });
      });
    }).then(function (resultado) {
      if(token!==revision || !resultado)return;
      modelo=resultado.scene || resultado;
      if(resultado.scene) {
        modelo.traverse(function(o){
          if(!o.isMesh)return;
          o.frustumCulled=false;
          if(o.morphTargetDictionary&&o.morphTargetDictionary.viseme_aa!==undefined)
            mallasLabios.push({
              mesh:o,aa:o.morphTargetDictionary.viseme_aa,
              sil:o.morphTargetDictionary.viseme_sil,
              blinkL:o.morphTargetDictionary.eyeBlinkLeft,
              blinkR:o.morphTargetDictionary.eyeBlinkRight
            });
          var mats=Array.isArray(o.material)?o.material:[o.material];
          mats.filter(Boolean).forEach(function(m){
            m.side=T.FrontSide;
            if('roughness' in m)m.roughness=Math.max(.58,m.roughness||.6);
          });
        });
        // Los huesos deben actualizarse antes de medir: el FBX convertido
        // tiene una escala de armadura distinta a la geometría sin deformar.
        modelo.updateMatrixWorld(true);
        modelo.traverse(function(o){if(o.skeleton)o.skeleton.update();});
        var caja=new T.Box3().setFromObject(modelo,true), tam=caja.getSize(new T.Vector3()), centro=caja.getCenter(new T.Vector3());
        var escala=1.9/Math.max(tam.x,tam.y,tam.z); modelo.scale.setScalar(escala);
        modelo.position.set(-centro.x*escala,-caja.min.y*escala,-centro.z*escala);
        var cont=new T.Group(); cont.add(modelo); modelo=cont;
        if(resultado.animations&&resultado.animations.length){
          mixer=new T.AnimationMixer(modelo);
          acciones3d={};
          resultado.animations.forEach(function(clip){
            if(/^(Idle|Spellcast_Shoot|Walking_A)$/.test(clip.name))
              acciones3d[clip.name]=mixer.clipAction(clip);
          });
          // El gesto didáctico debe sostenerse mientras dura la locución;
          // los clips de hechizo suelen terminar tras una sola reproducción.
          if(acciones3d.Spellcast_Shoot)acciones3d.Spellcast_Shoot.setLoop(T.LoopRepeat,Infinity);
          accion3d=acciones3d.Idle || mixer.clipAction(resultado.animations[0]);
          accion3d.play();
        }
        // Huesos verificables en los GLB Rocketbox: Bip01_R_UpperArm,
        // Bip01_L_UpperArm, Bip01_R_Forearm, Bip01_L_Forearm,
        // Bip01_REye, Bip01_LEye, Head, Bip01_Neck.
        // KayKit utiliza upperarm.l / upperarm.r / head.
        function huesoPorNombres(nombres) {
          var encontrado=null;
          modelo.traverse(function(o){
            if(encontrado||!o.isBone)return;
            var nombre=(o.name||'').toLowerCase().replace(/[^a-z0-9]/g,'');
            if(nombres.indexOf(nombre)!==-1)encontrado=o;
          });
          return encontrado;
        }
        huesosGuia={
          head:huesoPorNombres(['head','bip01head']),
          neck:huesoPorNombres(['bip01neck','neck']),
          left:huesoPorNombres(['bip01lupperarm','upperarml','leftupperarm','upperarmleft']),
          right:huesoPorNombres(['bip01rupperarm','upperarmr','rightupperarm','upperarmright']),
          leftForearm:huesoPorNombres(['bip01lforearm','lowerarml','forearml','leftforearm']),
          rightForearm:huesoPorNombres(['bip01rforearm','lowerarmr','forearmr','rightforearm']),
          leftHand:huesoPorNombres(['bip01lhand','handl','lefthand']),
          rightHand:huesoPorNombres(['bip01rhand','handr','righthand']),
          leftEye:huesoPorNombres(['bip01leye','lefteye','eyel']),
          rightEye:huesoPorNombres(['bip01reye','righteye','eyer'])
        };
      }
      scene.add(modelo); cargadoId=p.id; pendienteId=null;
      // Medio cuerpo: rostro y brazos distinguibles sin alejar al profesor.
      camera.position.set(0,p.realista?1.1:(p.modelo?1.18:1.15),
        p.realista?4.2:(p.modelo?3.65:4.8));
      camera.lookAt(0,p.realista?0.95:1.0,0);
      modelo.rotation.y=giro;
      if(mixer){mixer.update(0);cambiarGesto(hablando);}
      // La voz puede comenzar antes de que el modelo GLB termine de cargar.
      // Recuperar el gesto vigente evita que el profesor quede inmóvil mientras habla.
      dibujarVistas(vistas,performance.now()/1000,reducido());
      vistas.forEach(function(v){v.nodo.dataset.carga="listo";}); despertar();
    }).catch(function (error) {
      if(token!==revision)return;
      pendienteId=null;
      erroresModelo++;
      vistas.forEach(function(v){v.nodo.dataset.carga='error';});
      // Si el hardware no puede descodificar el humano, se conserva el aula:
      // volver a un personaje de videojuego más ligero en vez de mostrar vacío.
      if(elegido===p.id){
        if(!renderer)elegir('vertiz');
        else if(p.realista)elegir('maestro-arcano');
      }
      vistas.forEach(function(v){if(v.canvas){v.canvas.setAttribute('aria-label',p.nombre+': 3D no disponible. Elige otro tutor.');}});
    });
  }
  function cambiarGesto(estaHablando) {
    if(!acciones3d||!mixer)return;
    var claveAccion=estaHablando?'Spellcast_Shoot':'Idle';
    var proxima=acciones3d[claveAccion]||acciones3d.Idle;
    if(!proxima||accion3d===proxima)return;
    proxima.reset().fadeIn(.28).play();
    if(accion3d)accion3d.fadeOut(.28);
    accion3d=proxima;
    despertar();
  }
  function despertar() { if(!animacion && renderer && modelo && !document.hidden) animacion=requestAnimationFrame(frame); }
  // Orienta una articulación a partir de la dirección real de sus dos huesos.
  // No depende de que el eje local Z de Rocketbox coincida con el de KayKit.
  function orientarHueso(hueso,extremo,direccion,fuerza) {
    if(!hueso||!extremo||!fuerza)return false;
    hueso.updateWorldMatrix(true,true);
    var origen=hueso.getWorldPosition(new T.Vector3());
    var fin=extremo.getWorldPosition(new T.Vector3());
    var actual=fin.sub(origen);
    if(actual.lengthSq()<1e-8)return false;
    var giroMundo=new T.Quaternion().setFromUnitVectors(actual.normalize(),direccion.clone().normalize());
    var padre=hueso.parent?hueso.parent.getWorldQuaternion(new T.Quaternion()):new T.Quaternion();
    var giroLocal=padre.clone().invert().multiply(giroMundo).multiply(padre);
    var destino=hueso.quaternion.clone().premultiply(giroLocal);
    hueso.quaternion.slerp(destino,Math.min(1,fuerza));
    hueso.updateWorldMatrix(false,true);
    return true;
  }
  function dibujarVistas(lista,t,quieto) {
    if(mallasLabios.length){
      var apertura=quieto?0:nivelDeVoz(t);
      var fase=t%5.3;
      var parpadeo=quieto?0:(fase<.16?Math.sin(Math.PI*fase/.16):0);
      mallasLabios.forEach(function(item){
        var weights=item.mesh.morphTargetInfluences;
        if(!weights)return;
        weights[item.aa]=apertura;
        if(item.sil!==undefined)weights[item.sil]=1-apertura;
        if(item.blinkL!==undefined)weights[item.blinkL]=parpadeo;
        if(item.blinkR!==undefined)weights[item.blinkR]=parpadeo;
      });
    }
    var bases={};
    if(huesosGuia)Object.keys(huesosGuia).forEach(function(k){
      var bone=huesosGuia[k];if(bone)bases[k]=bone.quaternion.clone();
    });
    // La atención está vinculada a coordenadas REALES proyectadas del sólido.
    // Interpolar evita que ojos y brazos salten entre los pasos.
    var vistaObjetivo=lista.find(function(v){return v.canvas && participa(v);});
    var dir=vistaObjetivo?direccion(vistaObjetivo):{x:0,y:0};
    var factor=quieto?1:0.24;
    miradaX+=( (vistaObjetivo?dir.x*0.32:0)-miradaX)*factor;
    miradaY+=( (vistaObjetivo?dir.y*0.12:0)-miradaY)*factor;
    gestoNivel+=((vistaObjetivo?1:0)-gestoNivel)*factor;
    lista.forEach(function(v){
      if(!v.canvas)return;
      var activa=participa(v),d=activa?direccion(v):{x:0,y:0};
      modelo.rotation.y=giro+(activa?miradaX*0.65:(quieto?0:Math.sin(t*0.5)*0.05));
      modelo.position.y=quieto?0:Math.sin(t*2)*0.015;
      if(cabeza){
        cabeza.rotation.y=activa?miradaX:0;
        cabeza.rotation.x=activa?miradaY:0;
      }
      alas.forEach(function(a,i){
        a.rotation.x=0;
        a.rotation.z=quieto?0:Math.sin(t*(hablando?5:1.4))*(hablando?0.12:0.035)*(a.userData.tutorBrazo || a.userData.tutorAla || (i?1:-1));
        var lado=d.x || -1;
        if(activa && a.userData.tutorBrazo===lado){
          a.rotation.z=lado*(d.x?1.25:2.7);a.rotation.x=-0.3;
        }
        if(activa && a.userData.tutorAla===lado)a.rotation.z=lado*0.45;
      });
      if(huesosGuia){
        Object.keys(bases).forEach(function(k){huesosGuia[k].quaternion.copy(bases[k]);});
        // Cabeza y ojos observan el sólido mientras el docente lo señala.
        if(huesosGuia.neck){
          huesosGuia.neck.rotateY(miradaX*0.40);
          huesosGuia.neck.rotateX(-miradaY*0.3);
        }
        if(huesosGuia.head){
          huesosGuia.head.rotateY(miradaX*0.85);
          huesosGuia.head.rotateX(-miradaY*0.7+(hablando&&!quieto?Math.sin(t*2.2)*0.022:0));
        }
        ['leftEye','rightEye'].forEach(function(k){
          if(huesosGuia[k]){
            huesosGuia[k].rotateY(miradaX*0.38);
            huesosGuia[k].rotateX(-miradaY*0.35);
          }
        });
        // En los Rocketbox, las articulaciones bip01*upperarm se verificaron
        // directamente en los GLB. El brazo elevado apunta hacia el visor.
        // Se modula la pose para no confundir un gesto con un espasmo repetido.
        if(activa && gestoNivel>0.02){
          var haciaIzquierda=d.x<0;
          var brazo=haciaIzquierda?huesosGuia.right:huesosGuia.left;
          var codo=haciaIzquierda?huesosGuia.rightForearm:huesosGuia.leftForearm;
          var lado=haciaIzquierda?-1:1;
          if(brazo){
            // Elevar el codo hacia el lateral del sólido y adelantar la mano.
            // Se usan vectores en espacio mundial y se respeta la orientación
            // de la cámara para que la acción sea perceptible de frente.
            var orientado=orientarHueso(brazo,codo,
              new T.Vector3(lado*0.72,-0.18,0.62),0.90*gestoNivel);
            if(!orientado){
              brazo.rotateZ(lado*0.72*gestoNivel);
              brazo.rotateX(-0.35*gestoNivel);
            }
          }
          var mano=haciaIzquierda?huesosGuia.rightHand:huesosGuia.leftHand;
          if(codo&&mano){
            orientarHueso(codo,mano,new T.Vector3(lado*0.87,0.10,0.43),0.85*gestoNivel);
          }
        }else if(hablando&&!quieto){
          if(huesosGuia.left)huesosGuia.left.rotateZ(0.18+0.09*Math.sin(t*2.2));
          if(huesosGuia.right)huesosGuia.right.rotateZ(-0.18-0.08*Math.sin(t*2.1+1));
        }
      }
      renderer.render(scene,camera);copiar(v);
    });
    if(huesosGuia)Object.keys(bases).forEach(function(k){
      huesosGuia[k].quaternion.copy(bases[k]);
    });
  }
  function frame(now) {
    animacion=0;
    var visibles=vistas.filter(function(v){return v.canvas && v.visible && v.nodo.isConnected;});
    if(!visibles.length || !modelo || document.hidden)return;
    var dt=ultimo?Math.min((now-ultimo)/1000,0.06):0.016;
    if(now-ultimo<(hablando||foco?33:75) && !reducido()) { despertar(); return; } ultimo=now;
    var t=now/1000, quieto=reducido();
    if(mixer) { mixer.update(quieto?0:dt*(hablando?1:0.65)); }
    dibujarVistas(visibles,t,quieto);
    if(!quieto)despertar();
  }
  document.addEventListener('avatar-audio-elemento',function(e){
    var d=e.detail||{};
    if(d.audio&&d.blob)procesarAudio(d.blob,d.audio);
  });
  document.addEventListener('avatar-hablando',function(e){
    hablando=!!(e.detail&&e.detail.activo);
    cambiarGesto(hablando);
    despertar();
  });
  document.addEventListener('movimiento-cambiado',function(){if(buscar(elegido).pokemon)vistas.forEach(pintar);despertar();});
  document.addEventListener('visibilitychange',despertar);
  global.addEventListener('pagehide',function(){
    revision++;pendienteId=null;
    if(animacion)cancelAnimationFrame(animacion);
    animacion=0;
    vistas.forEach(function(v){if(v.observer)v.observer.disconnect();});
    if(renderer){
      liberarModelo();
      renderer.dispose();
      if(renderer.forceContextLoss)try{renderer.forceContextLoss();}catch(e){}
      renderer=null;scene=null;camera=null;T=null;preparando=null;
    }
  });
  global.Tutores={catalogo:CATALOGO,actual:function(){return elegido;},
    elegir:elegir,montar:montar,selector:selector,perfilVoz:perfilVoz,
    enfocar:enfocar,orientar:orientar,suspender:suspender,
    estadisticas:function(){return{cargado:cargadoId,pendiente:pendienteId,
      reproduciendo:!!(mixer&&accion3d),fallos:erroresModelo,
      vistas:vistas.length,visibles:vistas.filter(function(v){return v.visible;}).length,
      conectadas:vistas.filter(function(v){return v.nodo.isConnected;}).length,
      gesto:acciones3d && accion3d===acciones3d.Spellcast_Shoot?'explicando':'reposo',
      visemas:mallasLabios.length,decoder:!!global.MeshoptDecoder,
      aperturaBoca:mallasLabios.length&&mallasLabios[0].mesh.morphTargetInfluences?
        Number(mallasLabios[0].mesh.morphTargetInfluences[mallasLabios[0].aa].toFixed(3)):null};}
  };
})(window);
