/* Sistema Zénit 3.0 — una sola especificación geométrica para enseñar,
   experimentar y resolver, utilizada por Visor2D y Visor3D. */
(function(global){
'use strict';
var META={
 prisma:{titulo:'Prismas',singular:'Prisma',subtitulo:'Dos bases poligonales paralelas y congruentes'},
 piramide:{titulo:'Pirámides',singular:'Pirámide',subtitulo:'Una base poligonal y caras que concurren en un vértice'},
 cilindro:{titulo:'Cilindros',singular:'Cilindro',subtitulo:'Superficie lateral curva y bases circulares'},
 cono:{titulo:'Conos',singular:'Cono',subtitulo:'Radio, altura y generatriz en una misma figura'},
 esfera:{titulo:'Esferas',singular:'Esfera',subtitulo:'Todos los puntos de la superficie equidistan del centro'},
 cubo:{titulo:'Cubos',singular:'Cubo',subtitulo:'Seis caras cuadradas de la misma medida'},
 tetraedro:{titulo:'Tetraedros',singular:'Tetraedro',subtitulo:'Un poliedro regular de cuatro caras triangulares'},
 octaedro:{titulo:'Octaedros',singular:'Octaedro',subtitulo:'Ocho caras triangulares congruentes'}
};
var DEFAULTS={lados:6,base:'regular',a:3.4,b:2.5,h:3.2,angulo:90,desplazamiento:0,r:1.8,arista:3,nivel:.5};
var RANGOS={lados:[3,12],a:[1,8],b:[1,8],h:[.7,8],angulo:[45,90],desplazamiento:[-.8,.8],r:[.5,5],arista:[1,7],nivel:[.15,.85]};
var CONTROLES={
 prisma:['lados','base','a','b','h','angulo','nivel'],
 piramide:['lados','base','a','b','h','desplazamiento'],
 cilindro:['r','h'],cono:['r','h'],esfera:['r'],cubo:['arista'],
 tetraedro:['arista'],octaedro:['arista']
};
var NOMBRES={lados:'Lados de la base',base:'Forma de la base',a:'Ancho / diámetro a',b:'Profundidad b',h:'Altura perpendicular h',angulo:'Ángulo arista–base',desplazamiento:'Desplazamiento del vértice',r:'Radio r',arista:'Longitud de arista',nivel:'Nivel de la sección transversal'};
function normalizar(input){
 var out=Object.assign({},DEFAULTS),v=input||{};
 Object.keys(RANGOS).forEach(function(k){
  var n=Number(v[k]);if(!Number.isFinite(n))n=out[k];
  out[k]=Math.min(RANGOS[k][1],Math.max(RANGOS[k][0],k==='lados'?Math.round(n):n));
 });
 out.base=v.base==='irregular'?'irregular':'regular';
 return out;
}
function vec(x,y,z){return[x,y,z];}
function sub(a,b){return a.map(function(x,i){return x-b[i];});}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function length(a){return Math.hypot(a[0],a[1],a[2]);}
function v(x,label,layer){return{p:x,etiqueta:label||'',sinEtiqueta:!label,sinEsfera:!label,capa:layer};}
function areaPolygon(ps){
 var s=0;for(var i=0;i<ps.length;i++){var p=ps[i],q=ps[(i+1)%ps.length];s+=p[0]*q[2]-q[0]*p[2];}
 return Math.abs(s)/2;
}
function perimeter(ps){return ps.reduce(function(sum,p,i){return sum+length(sub(p,ps[(i+1)%ps.length]));},0);}
function triangleArea(a,b,c){return .5*length(cross(sub(b,a),sub(c,a)));}
function basicLayers(){
 return [
  {id:'bases',nombre:'Bases',color:'#7168ce',activa:true,opacidad:.16},
  {id:'laterales',nombre:'Caras laterales',color:'#ae83de',activa:true,opacidad:.12},
  {id:'aristas',nombre:'Aristas',color:'#293250',activa:true},
  {id:'altura',nombre:'Altura y 90°',color:'#079583',activa:false,auxiliar:true},
  {id:'diagonales',nombre:'Diagonales',color:'#db8840',activa:false,auxiliar:true},
  {id:'corte',nombre:'Sección transversal',color:'#0c93ba',activa:false,auxiliar:true},
  {id:'etiquetas',nombre:'Nombres',color:'#64748b',activa:true}
 ];
}
function regularPolygon(p){
 var n=p.lados,rx=p.a/2,rz=p.base==='regular'?rx:p.b/2,points=[];
 for(var i=0;i<n;i++){
  var t=(2*Math.PI*i)/n+Math.PI/n;
  var x=rx*Math.cos(t),z=rz*Math.sin(t);
  if(p.base==='irregular')x+=.16*z;
  points.push(vec(x,0,z));
 }
 return points;
}
function surface(pts,apex){
 var area=0;for(var i=0;i<pts.length;i++)area+=triangleArea(pts[i],pts[(i+1)%pts.length],apex);
 return area;
}
function makePrism(p){
 var ps=regularPolygon(p),n=ps.length,dx=p.h/Math.tan(p.angulo*Math.PI/180);
 if(p.angulo>=89.999)dx=0;
 var vv={},faces=[],edges=[],lines=[],lower=[],upper=[];
 ps.forEach(function(point,i){
  var a='A'+i,b='B'+i;
  vv[a]=v(point,n<=6?'A'+(i+1):'');
  vv[b]=v(vec(point[0]+dx,p.h,point[2]),n<=6?'B'+(i+1):'');
  lower.push(a);upper.push(b);
 });
 faces.push({v:lower,capa:'bases'},{v:upper,capa:'bases'});
 // Sección con plano paralelo a las bases: mismo polígono, trasladado.
 // Por defecto no se dibuja; el estudiante la activa cuando la estudia.
 var seccion=[];
 ps.forEach(function(point,i){
  var name='S'+i;
  vv[name]=v(vec(point[0]+dx*p.nivel,p.h*p.nivel,point[2]),'','corte');
  seccion.push(name);
 });
 faces.push({v:seccion,capa:'corte'});
 var areaSide=0,lv=vec(dx,p.h,0);
 for(var i=0;i<n;i++){
  var j=(i+1)%n;
  faces.push({v:[lower[i],lower[j],upper[j],upper[i]],capa:'laterales'});
  edges.push({a:lower[i],b:lower[j],capa:'aristas'},
    {a:upper[i],b:upper[j],capa:'aristas'},
    {a:lower[i],b:upper[i],capa:'aristas'});
  areaSide+=length(cross(sub(ps[j],ps[i]),lv));
 }
 var centerBase=vec(0,0,0),centerUpper=vec(dx,p.h,0);
 // H es la proyección ortogonal del centro superior sobre el plano inferior.
 vv.O=v(centerBase,'O','altura');
 vv.H=v(vec(dx,0,0),'H','altura');
 vv.O1=v(centerUpper,'O₁','altura');
 vv.Q=v(vec(dx+.31,0,0),'90°','altura');
 lines.push({v:['H','O1'],capa:'altura',estilo:'punteada',grosor:2.7});
 lines.push({v:seccion,capa:'corte',cerrado:true,grosor:2.5});
 lines.push({pts:[vec(dx+.22,0,0),vec(dx+.22,.22,0),vec(dx,.22,0)],capa:'altura',grosor:1.8});
 if(n>=4){lines.push({v:[lower[0],lower[Math.floor(n/2)]],capa:'diagonales',estilo:'punteada',grosor:2.2});}
 var Ab=areaPolygon(ps),Pb=perimeter(ps),At=2*Ab+areaSide,V=Ab*p.h;
 var straight=p.angulo===90;
 return {
  spec:{titulo:straight?'Prisma recto de '+n+' lados':'Prisma oblicuo de '+n+' lados',
   tipo:'poliedro',vertices:vv,caras:faces,aristas:edges,lineas:lines,capas:basicLayers(),
   camara:{theta:-.7,phi:.30},alt:'Prisma de base '+n+' lados, altura perpendicular '+p.h.toFixed(2)+
   ', aristas laterales '+(straight?'perpendiculares':'inclinadas')+' respecto a las bases'},
  values:{Ab:Ab,Pb:Pb,Al:areaSide,At:At,V:V,h:p.h,shift:dx,n:n},
  formulas:[
    {label:'Área de la base',latex:p.base==='regular'?'A_b=\\frac{P_ba_p}{2}':'A_b=\\sum A_{\\triangle i}',value:Ab,unit:'u²'},
    {label:'Área lateral',latex:straight?'A_L=P_b\\,h':'A_L=\\sum_{i=1}^{n}A_i',value:areaSide,unit:'u²'},
    {label:'Área total',latex:'A_T=2A_b+A_L',value:At,unit:'u²'},
    {label:'Volumen',latex:'V=A_b\\,h',value:V,unit:'u³'}
  ],
  guide:[
    {title:'Identifica las bases',text:'Las dos bases tienen la misma forma y tamaño y se sitúan en planos paralelos. Esta base tiene '+n+' lados.',focus:'bases',latex:'A_b'},
    {title:straight?'La altura del prisma recto':'Recto y oblicuo: no son iguales',text:straight?'Las aristas laterales son perpendiculares a las bases. La altura es la distancia perpendicular entre sus planos.':'Las aristas laterales están inclinadas '+p.angulo+' grados respecto al plano basal. La altura sigue siendo perpendicular a ambas bases, no coincide con una arista inclinada.',focus:'altura',latex:'h'},
    {title:'Secciones paralelas a las bases',text:'Un plano de sección paralelo a las bases determina un polígono congruente a ellas. Puedes cambiar su posición sin alterar su área.',focus:'corte',latex:'A_s=A_b'},
    {title:'Área, superficie y volumen',text:'El volumen siempre se obtiene multiplicando el área de la base por la altura perpendicular. '+(straight?'Para el área lateral de este prisma recto multiplicamos perímetro por altura.':'Para el área lateral oblicua sumamos las áreas de las caras laterales.'),focus:'laterales',latex:'V=A_b\\,h'}
  ]
 };
}
function makePyramid(p){
 var ps=regularPolygon(p),n=ps.length,apex=vec(p.desplazamiento*(p.a/2),p.h,0),vv={},faces=[],edges=[],base=[];
 ps.forEach(function(point,i){
  var id='A'+i;vv[id]=v(point,n<=6?'A'+(i+1):'');base.push(id);
 });
 vv.P=v(apex,'P');vv.O=v(vec(0,0,0),'O','altura');
 faces.push({v:base,capa:'bases'});
 for(var i=0;i<n;i++){
  var j=(i+1)%n;faces.push({v:[base[i],base[j],'P'],capa:'laterales'});
  edges.push({a:base[i],b:base[j],capa:'aristas'},{a:base[i],b:'P',capa:'aristas'});
 }
 var Ab=areaPolygon(ps),Al=surface(ps,apex),V=Ab*p.h/3,At=Ab+Al;
 return {spec:{titulo:'Pirámide poligonal',vertices:vv,aristas:edges,caras:faces,
   lineas:[{v:['O','P'],capa:'altura',estilo:'punteada',grosor:2.5}],
   capas:basicLayers(),camara:{theta:-.65,phi:.29},
   alt:'Pirámide de '+n+' lados con vértice y altura '+p.h.toFixed(2)},
  values:{Ab:Ab,Al:Al,At:At,V:V,h:p.h,n:n},
  formulas:[
   {label:'Área de la base',latex:p.base==='regular'?'A_b=\\frac{P_ba_p}{2}':'A_b=\\sum A_{\\triangle i}',value:Ab,unit:'u²'},
   {label:'Área lateral',latex:'A_L=\\sum_{i=1}^{n}A_i',value:Al,unit:'u²'},
   {label:'Área total',latex:'A_T=A_b+A_L',value:At,unit:'u²'},
   {label:'Volumen',latex:'V=\\frac{A_bh}{3}',value:V,unit:'u³'}],
  guide:[
   {title:'La base de la pirámide',text:'La pirámide tiene una sola base poligonal de '+n+' lados. Sus caras laterales son triángulos.',focus:'bases'},
   {title:'Altura y posición del vértice',text:'La altura perpendicular se mide desde el vértice hasta el plano de la base. Desplazar el vértice puede producir una pirámide oblicua.',focus:'altura'},
   {title:'Área y volumen',text:'El volumen es un tercio del área de la base multiplicada por la altura perpendicular. El área lateral suma las caras triangulares.',focus:'laterales',latex:'V=\\frac{A_bh}{3}'}]
 };
}
function fromLegacy(tipo,p){
 var target=tipo==='cubo'?'prisma':tipo,
  params=tipo==='cubo'?{a:p.arista,b:p.arista,h:p.arista}:{r:p.r,h:p.h};
 var result=global.Parametricas.generar(target,params),spec=result.spec;
 if(tipo==='cubo'){
  spec.titulo='Cubo';
  // Mantener limpia la figura. El desarrollo y las diagonales son auxiliares.
 }
 (spec.capas||[]).forEach(function(c){if(['diagonal','baseDiagonal','radio','altura','generatriz'].includes(c.id))c.activa=false;});
 var s=p.arista,r=p.r,h=p.h,Ab,Al,At,V,formulas,guide;
 if(tipo==='cubo'){
  Ab=s*s;Al=4*s*s;At=6*s*s;V=s*s*s;
  formulas=[{label:'Área de una cara',latex:'A_b=a^2',value:Ab,unit:'u²'},
   {label:'Área lateral',latex:'A_L=4a^2',value:Al,unit:'u²'},
   {label:'Área total',latex:'A_T=6a^2',value:At,unit:'u²'},
   {label:'Volumen',latex:'V=a^3',value:V,unit:'u³'}];
  guide=[
   {title:'Seis caras iguales',text:'Un cubo tiene seis caras cuadradas congruentes, doce aristas y ocho vértices.',focus:'bases'},
   {title:'La diagonal y las aristas',text:'Cada arista mide lo mismo. La diagonal de cara se calcula con Pitágoras y mide a por raíz de dos.',focus:'diagonal',latex:'d_c=a\\sqrt2'},
   {title:'Volumen y superficie',text:'Su volumen es la arista elevada al cubo. Su superficie total suma seis cuadrados iguales.',focus:'bases',latex:'V=a^3'}
  ];
 }else if(tipo==='cilindro'){
  Ab=Math.PI*r*r;Al=2*Math.PI*r*h;At=2*Ab+Al;V=Ab*h;
  formulas=[{label:'Área de la base',latex:'A_b=\\pi r^2',value:Ab,unit:'u²'},
   {label:'Área lateral',latex:'A_L=2\\pi rh',value:Al,unit:'u²'},
   {label:'Área total',latex:'A_T=2\\pi r(r+h)',value:At,unit:'u²'},
   {label:'Volumen',latex:'V=\\pi r^2h',value:V,unit:'u³'}];
  guide=[
   {title:'Dos bases circulares',text:'El cilindro circular recto tiene dos bases circulares congruentes y paralelas.',focus:'bases'},
   {title:'Radio y altura',text:'La altura es perpendicular a las bases. Al desplegar su superficie lateral obtenemos un rectángulo.',focus:'altura'},
   {title:'Área y volumen',text:'Multiplica el área del círculo por la altura para hallar el volumen. El área lateral es el perímetro de la circunferencia por la altura.',focus:'lateral',latex:'V=\\pi r^2h'}];
 }else if(tipo==='cono'){
  var g=Math.hypot(r,h);Ab=Math.PI*r*r;Al=Math.PI*r*g;At=Ab+Al;V=Ab*h/3;
  formulas=[{label:'Área de la base',latex:'A_b=\\pi r^2',value:Ab,unit:'u²'},
   {label:'Generatriz',latex:'g=\\sqrt{r^2+h^2}',value:g,unit:'u'},
   {label:'Área total',latex:'A_T=\\pi r(r+g)',value:At,unit:'u²'},
   {label:'Volumen',latex:'V=\\frac{\\pi r^2h}{3}',value:V,unit:'u³'}];
  guide=[
   {title:'Una base circular y un vértice',text:'El cono circular recto tiene una base circular y un vértice.',focus:'bases'},
   {title:'Generatriz y altura',text:'La generatriz une el borde de la base con el vértice. En el cono recto, radio, altura y generatriz forman un triángulo rectángulo.',focus:'generatriz',latex:'g=\\sqrt{r^2+h^2}'},
   {title:'Calcular el volumen',text:'El volumen de un cono es un tercio del volumen del cilindro de igual base y altura.',focus:'bases',latex:'V=\\frac{\\pi r^2h}{3}'}];
 }else{
  Ab=Math.PI*r*r;Al=4*Math.PI*r*r;At=Al;V=4*Math.PI*r*r*r/3;
  formulas=[{label:'Área de un círculo máximo',latex:'A_c=\\pi r^2',value:Ab,unit:'u²'},
   {label:'Superficie',latex:'A=4\\pi r^2',value:At,unit:'u²'},
   {label:'Diámetro',latex:'d=2r',value:2*r,unit:'u'},
   {label:'Volumen',latex:'V=\\frac43\\pi r^3',value:V,unit:'u³'}];
  guide=[
   {title:'La esfera y su centro',text:'La esfera reúne los puntos de la superficie situados a la misma distancia del centro.',focus:'superficie'},
   {title:'Radio y diámetro',text:'El radio mide del centro a cualquier punto de la superficie. El diámetro equivale al doble del radio.',focus:'radio',latex:'d=2r'},
   {title:'Superficie y volumen',text:'Al duplicar el radio, el área se cuadruplica y el volumen se multiplica por ocho.',focus:'superficie',latex:'V=\\frac43\\pi r^3'}];
 }
 return {spec:spec,values:{Ab:Ab,Al:Al,At:At,V:V,h:p.h},formulas:formulas,guide:guide};
}
function regularPolyhedron(tipo,p){
 var a=p.arista,vv={},faces=[],edges=[],coords;
 if(tipo==='tetraedro'){
  var z=Math.sqrt(3)*a/6,H=Math.sqrt(2/3)*a;
  coords=[vec(-a/2,0,-z),vec(a/2,0,-z),vec(0,0,2*z),vec(0,H,0)];
  faces=[[0,1,2],[0,1,3],[1,2,3],[2,0,3]];
 }else{
  var d=a/Math.SQRT2;
  coords=[vec(d,0,0),vec(-d,0,0),vec(0,d,0),vec(0,-d,0),vec(0,0,d),vec(0,0,-d)];
  faces=[[0,2,4],[4,2,1],[1,2,5],[5,2,0],
   [4,3,0],[1,3,4],[5,3,1],[0,3,5]];
 }
 coords.forEach(function(pt,i){vv['V'+i]=v(pt,'V'+(i+1));});
 var f=faces.map(function(tri){return {v:tri.map(function(i){return 'V'+i;}),capa:'laterales'};});
 var seen=new Set();
 faces.forEach(function(tri){for(var i=0;i<3;i++){var p1=tri[i],p2=tri[(i+1)%3],ids=[p1,p2].sort(function(a,b){return a-b;});seen.add(ids.join(','));}});
 seen.forEach(function(pair){var ids=pair.split(',');edges.push({a:'V'+ids[0],b:'V'+ids[1],capa:'aristas'});});
 var At=tipo==='tetraedro'?Math.sqrt(3)*a*a:2*Math.sqrt(3)*a*a;
 var V=tipo==='tetraedro'?Math.pow(a,3)/(6*Math.SQRT2):Math.SQRT2*Math.pow(a,3)/3;
 return {
  spec:{titulo:META[tipo].singular+' regular',alt:META[tipo].subtitulo,
   vertices:vv,caras:f,aristas:edges,lineas:[],capas:basicLayers(),
   camara:{theta:-.75,phi:.35}},
  values:{At:At,V:V,Ab:At/f.length,Al:At},
  formulas:tipo==='tetraedro'?[
   {label:'Área de una cara',latex:'A_c=\\frac{\\sqrt3}{4}a^2',value:Math.sqrt(3)*a*a/4,unit:'u²'},
   {label:'Área total',latex:'A_T=\\sqrt3\\,a^2',value:At,unit:'u²'},
   {label:'Altura',latex:'h=a\\sqrt{\\frac23}',value:a*Math.sqrt(2/3),unit:'u'},
   {label:'Volumen',latex:'V=\\frac{a^3}{6\\sqrt2}',value:V,unit:'u³'}
  ]:[
   {label:'Área de una cara',latex:'A_c=\\frac{\\sqrt3}{4}a^2',value:Math.sqrt(3)*a*a/4,unit:'u²'},
   {label:'Área total',latex:'A_T=2\\sqrt3\\,a^2',value:At,unit:'u²'},
   {label:'Diámetro vértices opuestos',latex:'d=\\sqrt2\\,a',value:Math.sqrt(2)*a,unit:'u'},
   {label:'Volumen',latex:'V=\\frac{\\sqrt2}{3}a^3',value:V,unit:'u³'}
  ],
  guide:[
   {title:'Las caras triangulares',text:tipo==='tetraedro'?'El tetraedro regular tiene cuatro caras triangulares congruentes.':'El octaedro regular tiene ocho caras triangulares congruentes.',focus:'laterales'},
   {title:'Aristas y simetría',text:'Todas las aristas de un poliedro regular tienen la misma longitud y sus caras son polígonos regulares iguales.',focus:'aristas'},
   {title:'Área y volumen',text:'Las expresiones matemáticas relacionan la longitud de la arista con la superficie total y el volumen.',focus:'laterales'}]
 };
}
function generar(tipo,raw){
 if(!Object.prototype.hasOwnProperty.call(META,tipo))throw Error('Tipo de sólido desconocido');
 var p=normalizar(raw),r;
 if(tipo==='prisma')r=makePrism(p);
 else if(tipo==='piramide')r=makePyramid(p);
 else if(tipo==='tetraedro'||tipo==='octaedro')r=regularPolyhedron(tipo,p);
 else r=fromLegacy(tipo,p);
 r.tipo=tipo;r.params=p;r.meta=META[tipo];
 r.spec.id='zenit-'+tipo;
 r.spec.pie='Modelo paramétrico del Sistema Zénit; medidas en unidades arbitrarias.';
 return r;
}
global.ZSolidos={META:META,DEFAULTS:DEFAULTS,RANGOS:RANGOS,CONTROLES:CONTROLES,
 NOMBRES:NOMBRES,normalizar:normalizar,generar:generar};
})(window);
