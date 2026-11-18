/* Video ambiental Zénit: reproducción condicional y respeto de accesibilidad.
 * Las escenas son decorativas, sin pista de audio ni información esencial. */
(function(){
 'use strict';
 function ready(){
   var frames=Array.from(document.querySelectorAll('[data-zenit-ambient]'));
   if(!frames.length)return;
   var reduced=window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : {matches:false};
   frames.forEach(function(frame){
     var video=frame.querySelector('video'),button=frame.querySelector('.zenit-video-toggle');
     if(!video||!button)return;
     var visible=false,userPaused=false,broken=false;
     video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=true;
     frame.setAttribute('data-playing','false');
     button.hidden=false;
     function updateButton(){
       button.setAttribute('aria-pressed',userPaused?'true':'false');
       button.setAttribute('aria-label',userPaused?'Reproducir animación':'Pausar animación');
       button.textContent=userPaused?'▶':'❚❚';
       button.hidden=!!reduced.matches||broken;
     }
     function update(){
       var shouldRun=visible&&!document.hidden&&!reduced.matches&&!userPaused&&!broken;
       if(!shouldRun){
         video.pause();
         if(reduced.matches||broken)frame.setAttribute('data-playing','false');
         return;
       }
       var result=video.play();
       if(result&&typeof result.catch==='function'){
         result.catch(function(){video.pause();frame.setAttribute('data-playing','false');});
       }
     }
     video.addEventListener('playing',function(){
       if(!reduced.matches&&!broken)frame.setAttribute('data-playing','true');
     });
     video.addEventListener('error',function(){
       broken=true;frame.setAttribute('data-playing','false');updateButton();
     });
     button.addEventListener('click',function(){
       userPaused=!userPaused;updateButton();update();
     });
     document.addEventListener('visibilitychange',update);
     if(reduced.addEventListener)reduced.addEventListener('change',function(){
       updateButton();update();
     });else if(reduced.addListener)reduced.addListener(function(){updateButton();update();});
     updateButton();
     if('IntersectionObserver' in window){
       var io=new IntersectionObserver(function(entries){
         visible=entries.some(function(e){return e.isIntersecting&&e.intersectionRatio>=.15;});
         update();
       },{threshold:[0,.15,.35]});
       io.observe(frame);
     }else{
       visible=true;update();
     }
   });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
 else ready();
})();