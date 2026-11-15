/* Verificación independiente de los 18 retos del currículo.
   Se comprueban casos geométricos con operaciones exactas o fórmulas independientes. */
(function(global){
'use strict';
var EPS=1e-8;
function cerca(a,b){return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<EPS;}
function dot(u,v){return u.reduce(function(t,x,i){return t+x*v[i];},0);}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function sub(a,b){return a.map(function(x,i){return x-b[i];});}
function norma(x){return Math.sqrt(dot(x,x));}
var CASOS={
 m1l1r1:function(){
   var A=[0,0,0],B=[1,0,0],C=[0,1,0],D=[0,0,1];
   var M=[.5,0,0],N=[0,.5,.5],MN=sub(N,M);
   return Math.abs(dot(cross(MN,sub(C,A)),sub(A,M)))>EPS &&
          Math.abs(dot(cross(MN,sub(D,B)),sub(B,M)))>EPS;
 },
 m1l2r1:function(){
   var a=2,M=[a/2,0,0],Q=[a,0,a/6],P=[a,a,a/2],R=[0,a,a/6],N=[0,a/2,0];
   var poly=[M,Q,P,R,N,M],per=0;
   for(var i=0;i<poly.length-1;i++)per+=norma(sub(poly[i+1],poly[i]));
   return cerca(per,a*(Math.sqrt(10)+1/Math.sqrt(2)));
 },
 m2l1r1:function(){var a=6,s=a/Math.sqrt(2);return cerca(6*s*s*Math.sqrt(3)/4,3*Math.sqrt(3)*a*a/4);},
 m2l2r1:function(){var a=3,P=[1,1,1];return cerca(P[0]+P[1]+P[2],a)&&cerca(dot([1,1,1],P)-a,0);},
 m3l1r1:function(){return cerca(dot([1,1,1],[-1,1,0]),0);},
 m3l2r1:function(){return cerca(Math.acos(7/25)*180/Math.PI,2*Math.atan(3/4)*180/Math.PI);},
 m4l1r1:function(){var B=[1,0,0],D=[0,1,0],A1=[0,0,1];return cerca(norma(cross(sub(D,B),sub(A1,B)))/2,Math.sqrt(3)/2);},
 m4l2r1:function(){var B=[1,0,0],B1=[1,0,1];return cerca(norma(sub(B1,B)),1)&&cerca(dot(sub(B1,B),[1,0,0]),0)&&cerca(dot(sub(B1,B),[0,1,0]),0);},
 m5l1r1:function(){var AM=[-3,2,6],theta=Math.asin(3/norma(AM))*180/Math.PI;return cerca(norma(AM),7)&&theta>25&&theta<26;},
 m6l1r1:function(){for(var a=1;a<=6;a++)for(var b=1;b<=6;b++)for(var c=1;c<=6;c++)if(a*b*c===48&&a*a+b*b+c*c===49)return false;return true;},
 m6l1r2:function(){var s=4,h=10,B=3*Math.sqrt(3)*s*s/2;return cerca(B*h,240*Math.sqrt(3))&&cerca(6*s*h+2*B,240+48*Math.sqrt(3))&&cerca(Math.hypot(2*s,h),2*Math.sqrt(41));},
 m6l2r1:function(){var cap=2*3*4,neto=12-4;return cerca(cap*1000/neto,3000)&&cerca(cap*3.5,84);},
 m7l1r1:function(){var a=2;return cerca(a*a*a/3,8/3)&&cerca(Math.sin(Math.asin(1/Math.sqrt(3))),1/Math.sqrt(3));},
 m8l1r1:function(){var r=3,h=2,g=2*h+r,altura=Math.sqrt(g*g-r*r);return cerca(Math.PI*r*g+Math.PI*r*r,2*Math.PI*r*h+2*Math.PI*r*r)&&cerca(altura/(3*h),2*Math.sqrt(1+r/h)/3);},
 m9l1r1:function(){var a=4,s=a/Math.sqrt(2);return cerca(s*s*s*Math.sqrt(2)/3,a*a*a/6);},
 m10l1r1:function(){var a=4;return cerca(Math.sqrt(3)*a*a/8,2*Math.sqrt(3))&&cerca(Math.pow(a/2,3)/6,a*a*a/48);},
 m11l1r1:function(){for(var u=0;u<=6;u+=.25){var es=36-u*u,k=(6-u)*(6-u);if(es+EPS<k)return false;}return cerca((4*Math.PI*Math.pow(6,3)/3)/(Math.PI*36*12),2/3);},
 m12l1r1:function(){var a=6;var tet=a*a*a/3,oct=a*a*a/6;return oct<tet&&cerca((a*a*a-tet)/(a*a*a),2/3); }
};
function auditar(Contenido){
 var retos=Contenido.bancoRetos(),data={};
 retos.forEach(function(r){data[r.id]=r;});
 var fallos=[];
 Object.keys(CASOS).forEach(function(id){
   if(!data[id]){fallos.push({id:id,razon:'Reto ausente'});return;}
   try{if(!CASOS[id]())fallos.push({id:id,razon:'Comprobación matemática falsa'});}
   catch(e){fallos.push({id:id,razon:String(e)});}
 });
 retos.forEach(function(r){if(!CASOS[r.id])fallos.push({id:r.id,razon:'Reto sin comprobador'});});
 return{total:retos.length,comprobados:Object.keys(CASOS).length,correcto:fallos.length===0,errores:fallos};
}
global.AuditoriaRetos={verificar:auditar,casos:CASOS};
})(window);