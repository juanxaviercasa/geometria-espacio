/* Videos ambientales Zénit: reproducción al entrar en pantalla, control accesible
 * y salto opcional del inicio de los videos con bandas negras. */
(function(){
 'use strict';
 function ready(){
   var frames=Array.from(document.querySelectorAll('[data-zenit-ambient]'));
   if(!frames.length)return;
   var reduced=window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : {matches:false};
   frames.forEach(function(frame){
     var video=frame.querySelector('video'),button=frame.querySelector('.zenit-video-toggle');
     if(!video||!button)return;
     var startAt=Number(frame.getAttribute('data-start-at')||0);
     if(!Number.isFinite(startAt)||startAt<0)startAt=0;
     var trimmed=startAt>0;
     var visible=false,userPaused=false,broken=false,primed=!trimmed,seeking=false;
     video.muted=true;video.defaultMuted=true;video.playsInline=true;
     // El loop nativo vuelve a 0. El video recortado debe volver al punto de corte.
     video.loop=!trimmed;
     frame.setAttribute('data-playing','false');
     button.hidden=false;
     function updateButton(){
       button.setAttribute('aria-pressed',userPaused?'true':'false');
       button.setAttribute('aria-label',userPaused?'Reproducir animación':'Pausar animación');
       button.textContent=userPaused?'▶':'❚❚';
       button.hidden=!!reduced.matches||broken;
     }
     function seekToIntroEnd(){
       if(!trimmed||primed||seeking||video.readyState<1)return;
       var upper=Number.isFinite(video.duration)?Math.max(0,video.duration-.35):startAt;
       var target=Math.min(startAt,upper);
       if(Math.abs(video.currentTime-target)<.12){primed=true;update();return;}
       seeking=true;
       try{video.currentTime=target;}
       catch(err){seeking=false;primed=true;update();}
     }
     function update(){
       var shouldRun=visible&&!document.hidden&&!reduced.matches&&!userPaused&&!broken;
       if(!shouldRun){
         video.pause();
         if(reduced.matches||broken)frame.setAttribute('data-playing','false');
         return;
       }
       if(!primed){
         if(video.readyState<1){
           video.preload='metadata';
           if(video.networkState===video.NETWORK_EMPTY)video.load();
         }else seekToIntroEnd();
         return;
       }
       var result=video.play();
       if(result&&typeof result.catch==='function'){
         result.catch(function(){video.pause();frame.setAttribute('data-playing','false');});
       }
     }
     video.addEventListener('loadedmetadata',seekToIntroEnd);
     video.addEventListener('seeked',function(){
       if(seeking){seeking=false;primed=true;update();}
     });
     video.addEventListener('ended',function(){
       if(trimmed){primed=false;seekToIntroEnd();}
     });
     video.addEventListener('playing',function(){
       if(primed&&!reduced.matches&&!broken)frame.setAttribute('data-playing','true');
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
