/* Fase 4 · transcripción visual y controles TTS del Modo Maestro.
   Cada figura se identifica por origen: nunca recibe eventos de otra figura. */
(function(global) {
 'use strict';
 function montar(opciones) {
   opciones=opciones||{};
   var panel=opciones.panel,origen=opciones.origen;
   if(!panel||!origen)return null;
   var avatar=global.Avatar;
   var elegir=panel.querySelector('[data-mm-voz-select]');
   var velocidad=panel.querySelector('[data-mm-velocidad]');
   var btnPausa=panel.querySelector('[data-mm-accion="pausa"]');
   var transcripcion=panel.querySelector('[data-mm-transcripcion]');
   var estado=panel.querySelector('[data-mm-estado-voz]');
   if(!elegir||!velocidad||!btnPausa||!transcripcion||!estado)return null;
   var texto='',n=0,indiceActual=-1;
   function voces(){
     if(!avatar)return;
     var motor=avatar.getMotorVoz?avatar.getMotorVoz():'nativa';
     var preferida=avatar.getVozNeural?avatar.getVozNeural():'javier';
     var lista=avatar.vocesDisponibles?avatar.vocesDisponibles():[];
     elegir.textContent='';
     if(global.VozNeural)global.VozNeural.voces.forEach(function(v){
       var opt=document.createElement('option');
       opt.value='neural:'+v.id;opt.textContent='Neural · '+v.nombre;elegir.appendChild(opt);
     });
     var auto=document.createElement('option');
     auto.value='nativa:auto';auto.textContent='Voz del dispositivo (alternativa)';
     elegir.appendChild(auto);
     lista.forEach(function(v){
       var o=document.createElement('option');o.value='nativa:'+v.id;
       o.textContent='Dispositivo · '+v.nombre+' ('+v.idioma+')';elegir.appendChild(o);
     });
     var sel=motor==='neural'?'neural:'+preferida:'nativa:'+(avatar.getVozElegida?avatar.getVozElegida()||'auto':'auto');
     elegir.value=[].some.call(elegir.options,function(o){return o.value===sel;})?sel:'nativa:auto';
   }
   function pintarPalabras(t) {
     texto=String(t||'');n++;indiceActual=-1;
     transcripcion.textContent='';
     if(!global.VozMatematica)return;
     var frag=document.createDocumentFragment();
     global.VozMatematica.palabras(texto).forEach(function(token,i){
       var span=document.createElement('span');
       span.dataset.mmPalabra=String(i);
       span.textContent=token.texto+' ';
       frag.appendChild(span);
     });
     transcripcion.appendChild(frag);
   }
   function seleccionarEn(pos) {
     if(!global.VozMatematica || !texto)return;
     var indice=global.VozMatematica.palabraEn(texto,pos);
     if(indice===indiceActual)return;
     if(indiceActual>=0){
       var antes=transcripcion.querySelector('[data-mm-palabra="'+indiceActual+'"]');
       if(antes)antes.classList.remove('mm-palabra-actual');
     }
     var ahora=transcripcion.querySelector('[data-mm-palabra="'+indice+'"]');
     if(ahora)ahora.classList.add('mm-palabra-actual');
     indiceActual=indice;
   }
   function controles(d) {
     var propio=d && d.origen===origen;
     var pausar=propio && (d.estado==='hablando'||d.estado==='pausado');
     btnPausa.disabled=!pausar;
     btnPausa.textContent=propio && d.estado==='pausado'?'▶ Reanudar':'⏸ Pausar';
     btnPausa.setAttribute('aria-label',propio && d.estado==='pausado'?'Reanudar narración':'Pausar narración');
   }
   var mensajes={
     preparando:'Preparando la voz de la lección…',
     hablando:'Narrando este paso; el texto y la figura permanecen visibles.',
     pausado:'Locución pausada. Puedes leer el paso o reanudar.',
     finalizado:'Narración terminada. El texto y la figura siguen disponibles.',
     error:'El audio ha fallado. Continúa leyendo el paso con los controles.',
     'sin-voz':'No hay síntesis de voz disponible; la explicación escrita sigue activa.',
     silenciado:'Voz silenciada. Toda la explicación está disponible por escrito.',
     detenido:'Locución detenida.',
     vacio:'Este paso no tiene texto para narrar.'
   };
   function alEstado(ev){
     var d=ev.detail||{};if(d.origen!==origen)return;
     estado.textContent=mensajes[d.estado]||'Paso disponible.';
     estado.title=d.estado==='error'?(d.error||'Error de síntesis'):'';
     panel.classList.toggle('mm-narrando',d.estado==='hablando');
     controles(d);
   }
   function alPalabra(ev){
     var d=ev.detail||{};if(d.origen===origen && d.texto===texto)seleccionarEn(d.charIndex);
   }
   elegir.addEventListener('change',function(){
     if(!avatar)return;
     var valor=elegir.value;
     if(valor.indexOf('neural:')===0){
       if(avatar.setMotorVoz)avatar.setMotorVoz('neural');
       if(avatar.setVozNeural)avatar.setVozNeural(valor.slice(7));
     }else{
       if(avatar.setMotorVoz)avatar.setMotorVoz('nativa');
       if(avatar.elegirVoz)avatar.elegirVoz(valor==='nativa:auto'?'':valor.slice(7));
     }
     estado.textContent='Voz seleccionada. Pulsa Repetir para escucharla.';
   });
   velocidad.addEventListener('change',function(){
     if(avatar&&avatar.setVelocidadVoz)avatar.setVelocidadVoz(Number(velocidad.value));
     estado.textContent='Velocidad actualizada. Pulsa Repetir para aplicar el cambio.';
   });
   btnPausa.addEventListener('click',function(){
     if(!avatar||!avatar.getEstadoVoz)return;
     var actual=avatar.getEstadoVoz();
     if(actual.origen!==origen)return;
     if(actual.estado==='hablando'&&avatar.pausarVoz)avatar.pausarVoz();
     else if(actual.estado==='pausado'&&avatar.reanudarVoz)avatar.reanudarVoz();
   });
   if(global.document && document.addEventListener){
     document.addEventListener('avatar-voz-estado',alEstado);
     document.addEventListener('avatar-palabra',alPalabra);
     document.addEventListener('avatar-voces-cambiadas',voces);
   }
   if(avatar&&avatar.getVelocidadVoz){
     var v=String(avatar.getVelocidadVoz());
     velocidad.value=['0.8','1','1.2'].indexOf(v)>=0?v:'1';
   }
   voces();
   controles(null);
   function mostrarPaso(html,idx,total) {
     var listo=avatar&&avatar.limpiarTextoParaVoz?avatar.limpiarTextoParaVoz(html):String(html||'').replace(/<[^>]*>/g,' ');
     pintarPalabras(listo);
     estado.textContent='Paso '+(idx+1)+' de '+total+' listo: puedes leerlo'+
       (avatar&&avatar.getVozHabilitada&&avatar.getVozHabilitada()?' o escucharlo.':'. Voz silenciada.');
     return listo;
   }
   function detenerSiPropio() {
     if(!avatar||!avatar.getEstadoVoz||!avatar.detenerVoz)return;
     var a=avatar.getEstadoVoz();
     if(a.origen===origen && (a.estado==='preparando'||a.estado==='hablando'||a.estado==='pausado'))avatar.detenerVoz();
   }
   return {
     mostrarPaso:mostrarPaso,
     detenerSiPropio:detenerSiPropio,
     obtenerTexto:function(){return texto;},
     seleccionarEn:seleccionarEn,
     origen:origen
   };
 }
 global.NarracionUI={montar:montar};
})(window);