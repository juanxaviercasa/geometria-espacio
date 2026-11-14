/* Modelos paramétricos: misma geometría para visores 2D/3D. */
(function(w){
'use strict';
var CFG={
 prisma:{nombre:'Prisma rectangular',controles:['a','b','h']},
 piramide:{nombre:'Pirámide recta',controles:['a','b','h']},
 cilindro:{nombre:'Cilindro circular recto',controles:['r','h']},
 cono:{nombre:'Cono circular recto',controles:['r','h']},
 esfera:{nombre:'Esfera',controles:['r']},
 seccion:{nombre:'Sección oblicua de un prisma',controles:['a','b','h','nivel','angulo']}
};
var LIMITES={a:[1,10],b:[1,10],h:[1,10],r:[.5,6],nivel:[.15,.85],angulo:[-35,35]};
var DEFAULTS={a:3,b:2,h:4,r:1.8,nivel:.5,angulo:18};
var COL={bases:'#9992e7',caras:'#6166d9',lateral:'#6166d9',aristas:'#26304f',bordes:'#26304f',etiquetas:'#46516e',altura:'#cb4b67',radio:'#07877f',diagonal:'#7045ca',baseDiagonal:'#c68a18',generatriz:'#bd831b',apotema:'#bd831b',corte:'#079bb5',superficie:'#6166d9',meridianos:'#697491'};
var LABELS={bases:'Bases',caras:'Caras',lateral:'Superficie lateral',aristas:'Aristas',bordes:'Contornos',etiquetas:'Nombres',altura:'Altura',radio:'Radio',diagonal:'Diagonal espacial',baseDiagonal:'Diagonal de base',generatriz:'Generatriz',apotema:'Apotema de cara',corte:'Plano de corte',superficie:'Superficie',meridianos:'Meridianos'};
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function param(input){input=input||{};var p={};Object.keys(DEFAULTS).forEach(function(k){var x=Number(input[k]);p[k]=clamp(Number.isFinite(x)?x:DEFAULTS[k],LIMITES[k][0],LIMITES[k][1]);});return p;}
function fmt(x,dp){return String(Number(x.toFixed(dp===undefined?2:dp))).replace('.',',');}
function vert(x,y,z,label,hide){return {p:[x,y,z],etiqueta:label||'',sinEsfera:!!hide,sinEtiqueta:!!hide};}
function ar(a,b,c){return {a:a,b:b,capa:c||'aristas'};}
function fa(v,c){return {v:v,capa:c||'caras'};}
function li(v,c,g,otros){return Object.assign({v:v,capa:c,grosor:g||2.5},otros||{});}
function capas(ids){return ids.map(function(id){return {id:id,nombre:LABELS[id],color:COL[id],activa:true,opacidad:id==='corte'?.28:id==='bases'?.17:id==='caras'||id==='lateral'||id==='superficie'?.12:1};});}
function item(name,val,unit,latex,help){return {nombre:name,valor:val,unidad:unit,latex:latex,ayuda:help};}
function bloque(a,b,h){var x=a/2,z=b/2,vs={
 A:vert(-x,0,z,'A'),B:vert(x,0,z,'B'),C:vert(x,0,-z,'C'),D:vert(-x,0,-z,'D'),
 A1:vert(-x,h,z,'A₁'),B1:vert(x,h,z,'B₁'),C1:vert(x,h,-z,'C₁'),D1:vert(-x,h,-z,'D₁')};
 var edges=[['A','B'],['B','C'],['C','D'],['D','A'],['A1','B1'],['B1','C1'],['C1','D1'],['D1','A1'],['A','A1'],['B','B1'],['C','C1'],['D','D1']];
 return {vertices:vs,aristas:edges.map(function(x){return ar(x[0],x[1]);}),
 caras:[fa(['A','B','C','D'],'bases'),fa(['A1','B1','C1','D1'],'bases'),fa(['A','B','B1','A1']),fa(['B','C','C1','B1']),fa(['C','D','D1','C1']),fa(['D','A','A1','D1'])]};
}
function punta(a,b,h){var x=a/2,z=b/2,vs={
 A:vert(-x,0,z,'A'),B:vert(x,0,z,'B'),C:vert(x,0,-z,'C'),D:vert(-x,0,-z,'D'),
 O:vert(0,0,0,'O'),P:vert(0,h,0,'P'),M:vert(0,0,z,'M')};
 return {vertices:vs,aristas:[['A','B'],['B','C'],['C','D'],['D','A'],['A','P'],['B','P'],['C','P'],['D','P']].map(function(x){return ar(x[0],x[1]);}),
 caras:[fa(['A','B','C','D'],'bases'),fa(['A','B','P']),fa(['B','C','P']),fa(['C','D','P']),fa(['D','A','P'])],
 lineas:[li(['P','O'],'altura',2.6,{estilo:'punteada'}),li(['P','M'],'generatriz',3)]};
}
function redondo(r,h,cone){var vs={},lo=[],up=[],faces=[],i,t,k,N=32;
 for(i=0;i<N;i++){t=i*2*Math.PI/N;k='b'+i;vs[k]=vert(r*Math.cos(t),0,r*Math.sin(t),'',true);lo.push(k);
 if(!cone){k='t'+i;vs[k]=vert(r*Math.cos(t),h,r*Math.sin(t),'',true);up.push(k);}}
 vs.O=vert(0,0,0,'O');vs.A=vert(r,0,0,'A');
 if(cone)vs.P=vert(0,h,0,'P');else {vs.O1=vert(0,h,0,'O₁');vs.T=vert(r,h,0,'T');}
 for(i=0;i<N;i++)faces.push(fa(cone?['P','b'+i,'b'+((i+1)%N)]:['b'+i,'b'+((i+1)%N),'t'+((i+1)%N),'t'+i],'lateral'));
 faces.push(fa(lo,'bases'));if(!cone)faces.push(fa(up,'bases'));
 var ls=[li(lo,'bordes',2,{cerrado:true}),li(['O','A'],'radio',3)];
 if(cone)ls.push(li(['O','P'],'altura',2.5,{estilo:'punteada'}),li(['P','A'],'generatriz',3));
 else ls.push(li(up,'bordes',2,{cerrado:true}),li(['O','O1'],'altura',2.5,{estilo:'punteada'}),li(['A','T'],'generatriz',2.4));
 return {vertices:vs,aristas:[],caras:faces,lineas:ls};
}
function generar(tipo,entrada){
 if(!Object.prototype.hasOwnProperty.call(CFG,tipo))throw Error('Sólido no registrado: '+tipo);
 var p=param(entrada),a=p.a,b=p.b,h=p.h,r=p.r,s={},f=[],msg='',cam={theta:.7,phi:.32};
 if(tipo==='prisma'||tipo==='seccion'){
  s=bloque(a,b,h);
  var diag=Math.hypot(a,b,h),diagBase=Math.hypot(a,b);
  s.lineas=[li(['A','C'],'baseDiagonal',3),li(['A','C1'],'diagonal',3),li(['A','A1'],'altura',3)];
  s.capas=capas(['bases','caras','aristas','altura','baseDiagonal','diagonal','etiquetas']);
  f=[item('Volumen',a*b*h,'u³','V=abh','Área de base por altura.'),
     item('Área total',2*(a*b+a*h+b*h),'u²','A_T=2(ab+ah+bh)','Suma de las seis caras.'),
     item('Diagonal espacial',diag,'u','d=\\sqrt{a^2+b^2+h^2}','Pitágoras en dos dimensiones y luego en el espacio.'),
     item('Diagonal de base',diagBase,'u','d_b=\\sqrt{a^2+b^2}','Pitágoras en el rectángulo de base.')];
  msg='La diagonal espacial depende de las tres medidas del prisma.';
  if(tipo==='seccion'){
   var t=h*p.nivel,m=clamp(Math.tan(p.angulo*Math.PI/180),-2*Math.min(t,h-t)/a*.95,2*Math.min(t,h-t)/a*.95),effective=Math.atan(m)*180/Math.PI;
   var xx=[-a/2,a/2,a/2,-a/2],zz=[b/2,b/2,-b/2,-b/2],ids=['S0','S1','S2','S3'];
   ids.forEach(function(id,i){s.vertices[id]=vert(xx[i],t+m*xx[i],zz[i],'',true);});
   s.caras.push(fa(ids,'corte'));s.lineas=[li(ids,'corte',3.3,{cerrado:true})];
   s.vertices.H=vert(-a/2,t-m*a/2,b/2,'H');s.vertices.O=vert(-a/2,0,b/2,'O');
   s.lineas.push(li(['O','H'],'altura',2.8));
   s.capas=capas(['bases','caras','aristas','corte','altura','etiquetas']);
   f=[item('Área de sección',a*b*Math.sqrt(1+m*m),'u²','A_s=ab\\sqrt{1+m^2}','El plano y=t+mx forma una sección rectangular.'),
      item('Arista inclinada',a*Math.sqrt(1+m*m),'u','L=a\\sqrt{1+m^2}','Longitud de la sección a lo largo del eje X.'),
      item('Altura central',t,'u','t=nh','Altura del centro del plano.'),
      item('Inclinación efectiva',effective,'°','\\theta=\\arctan(m)','El ángulo se limita para que la sección permanezca dentro de las cuatro caras laterales.')];
   msg='Al modificar la inclinación, el plano atraviesa las cuatro caras laterales; la sección es un rectángulo.';
  }
 }else if(tipo==='piramide'){
  s=punta(a,b,h);s.capas=capas(['bases','caras','aristas','altura','apotema','etiquetas']);s.lineas[1].capa='apotema';
  var aa=Math.hypot(h,b/2),ab=Math.hypot(h,a/2),later=a*aa+b*ab,g=Math.hypot(h,a/2,b/2);
  f=[item('Volumen',a*b*h/3,'u³','V=\\frac{abh}{3}','Un tercio del prisma de igual base y altura.'),
     item('Área lateral',later,'u²','A_L=a\\sqrt{h^2+(b/2)^2}+b\\sqrt{h^2+(a/2)^2}','Dos pares de triángulos con apotemas diferentes.'),
     item('Arista lateral',g,'u','g=\\sqrt{h^2+(a/2)^2+(b/2)^2}','Distancia del vértice a una esquina de la base.'),
     item('Área total',a*b+later,'u²','A_T=ab+A_L','Suma de base y caras laterales.'),
     item('Apotema cara a',aa,'u','m_a=\\sqrt{h^2+(b/2)^2}','Altura inclinada del triángulo cuya base mide a.'),
     item('Apotema cara b',ab,'u','m_b=\\sqrt{h^2+(a/2)^2}','Altura inclinada del triángulo cuya base mide b.')];
  msg='La altura es perpendicular a la base y no es la arista lateral.';
 }else if(tipo==='cilindro'||tipo==='cono'){
  var cone=tipo==='cono',g2=Math.hypot(r,h);s=redondo(r,h,cone);s.capas=capas(['bases','lateral','bordes','altura','radio','generatriz','etiquetas']);cam={theta:-.58,phi:.28};
  f=[item('Volumen',Math.PI*r*r*h/(cone?3:1),'u³',cone?'V=\\frac{\\pi r^2h}{3}':'V=\\pi r^2h','El cono tiene un tercio del volumen del cilindro de igual base y altura.'),
     item('Área lateral',cone?Math.PI*r*g2:2*Math.PI*r*h,'u²',cone?'A_L=\\pi rg':'A_L=2\\pi rh','Superficie desarrollada sin las bases.'),
     item('Área total',cone?Math.PI*r*(r+g2):2*Math.PI*r*(r+h),'u²',cone?'A_T=\\pi r(r+g)':'A_T=2\\pi r(r+h)','Incluye las bases del sólido.')];
  if(cone)f.push(item('Generatriz',g2,'u','g=\\sqrt{r^2+h^2}','Hipotenusa del triángulo formado por radio y altura.'));
  msg=cone?'Radio, altura y generatriz forman un triángulo rectángulo.':'Al abrir la superficie lateral se obtiene un rectángulo de ancho 2πr y altura h.';
 }else {
  s={tipo:'esfera',radio:r,vertices:{},caras:[],aristas:[],lineas:[],capas:capas(['superficie','meridianos','radio'])};
  f=[item('Volumen',4*Math.PI*r*r*r/3,'u³','V=\\frac{4}{3}\\pi r^3','El volumen crece con el cubo del radio.'),
     item('Área',4*Math.PI*r*r,'u²','A=4\\pi r^2','La superficie crece con el cuadrado del radio.'),
     item('Circunferencia máxima',2*Math.PI*r,'u','C=2\\pi r','Circunferencia de un círculo máximo.')];
  msg='Duplicar el radio multiplica el área por 4 y el volumen por 8.';
 }
 s.id='lab-'+tipo;s.titulo=CFG[tipo].nombre;s.alt=s.titulo+'. '+msg;s.pie=msg;s.camara=cam;
 s.medidas=f.slice(0,4).map(function(i){return [i.nombre,fmt(i.valor)+' '+i.unidad];});
 return {tipo:tipo,parametros:p,modelo:CFG[tipo],spec:s,formulas:f,mensaje:msg};
}
w.Parametricas={MODELOS:CFG,RANGOS:LIMITES,DEFAULTS:DEFAULTS,normalizar:param,generar:generar,redondear:fmt};
})(window);
