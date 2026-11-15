/* Diagnósticos específicos de distractores, por alternativa. No revelan la clave. */
(function(Contenido){
'use strict';
var DATOS={
  "m1l1e1": [
    "La unicidad del plano queda garantizada: no pueden existir dos planos diferentes que contengan tres puntos no colineales.",
    "Infinitos planos pueden contener dos puntos, pero no tres no alineados.",
    "No es necesario un cuarto punto para determinar un plano."
  ],
  "m1l1e3": [
    "La propiedad vale para toda la recta determinada por los dos puntos, no solo para el segmento.",
    "Una recta que tiene dos puntos del plano no puede ser paralela exterior a él.",
    "Una recta que corta un plano en un único punto no puede tener dos puntos en él."
  ],
  "m1l1e4": [
    "La recta junto al punto exterior fija la orientación del plano, evitando infinitas posibilidades.",
    "Una recta y un punto fuera de ella siempre pueden contenerse en un plano.",
    "Las semirrectas opuestas pertenecen a la misma recta; no determinan dos planos diferentes."
  ],
  "m1l2e1": [
    "No cortarse no basta para ser alabeadas: también es necesario que no compartan un plano.",
    "Las rectas alabeadas no tienen punto de intersección.",
    "La ortogonalidad es posible, pero no es necesaria: hay rectas alabeadas de direcciones oblicuas."
  ],
  "m1l2e3": [
    "Dos planos distintos no paralelos se encuentran en una dimensión lineal, no únicamente en un punto.",
    "La intersección de dos planos no paralelos se prolonga indefinidamente; no se limita a un segmento.",
    "Dos planos cuya intersección es un plano completo serían coincidentes, contrariamente a la hipótesis."
  ],
  "m1l2e5": [
    "Sus vectores directores pertenecen a direcciones diferentes; no hay paralelismo.",
    "Los dos objetos no comparten el vértice mencionado; verifica la ubicación de C.",
    "La dirección de AB es ortogonal a la dirección de CC₁, no oblicua."
  ],
  "m2l1e1": [
    "Al estar ambas rectas en el mismo plano σ, una intersección invalidaría r paralela a π.",
    "Ninguna perpendicularidad está dada; la hipótesis impone una dirección común.",
    "La intersección de σ y π impone una dirección compatible con r paralela a π."
  ],
  "m2l1e2": [
    "Una sola recta del primer plano no determina la orientación de todo ese plano.",
    "Dos rectas paralelas, una en cada plano, no garantizan que ambos planos sean paralelos.",
    "Dos rectas de planos diferentes pueden ser paralelas aunque los planos se corten."
  ],
  "m2l1e4": [
    "Los puntos de AB están en la base inferior, no en A₁.",
    "AB no pertenece al plano de la cara superior.",
    "La dirección horizontal de AB no es normal a una cara horizontal."
  ],
  "m2l2e1": [
    "La perpendicularidad a una sola recta del plano no basta.",
    "Dos rectas paralelas aportan una sola condición direccional, no dos independientes.",
    "Una recta puede no cortar un plano y por ello ser paralela a él, no perpendicular."
  ],
  "m2l2e3": [
    "La proyección de AM sobre π es OM; la relación indicada no produce paralelismo.",
    "AO es perpendicular al plano, pero eso no obliga a que AO sea perpendicular a la oblicua AM.",
    "La hipótesis no menciona una razón de segmentos ni un punto medio."
  ],
  "m2l2e5": [
    "A distancia positiva constante serían planos paralelos, no ortogonales.",
    "Los planos perpendiculares sí se intersecan.",
    "Dos planos no son necesariamente perpendiculares por contener alguna pareja de rectas perpendiculares."
  ],
  "m3l1e2": [
    "El ángulo con la normal es complementario del ángulo con el plano.",
    "Cualquier recta del plano no define la proyección de la recta dada.",
    "Una arista arbitraria no fija el ángulo con el plano; usa la proyección ortogonal."
  ],
  "m3l1e3": [
    "Calcula u·v=2−4+2: no corresponde a un ángulo agudo de 45°.",
    "Calcula u·v antes de asignar 60°: ese valor implicaría un coseno no nulo.",
    "Direcciones paralelas requerirían vectores proporcionales componente a componente."
  ],
  "m3l1e5": [
    "Dos rectas normales a un mismo plano comparten la misma dirección normal.",
    "Pueden ser distintas sin cortarse: no es obligatorio que compartan el mismo pie.",
    "El ángulo de ambas con la dirección normal es cero, no 45°."
  ],
  "m3l2e1": [
    "Un corte paralelo a la arista no exhibe correctamente las dos semirrectas perpendiculares a ella.",
    "Un plano que contiene la arista no genera el ángulo rectilíneo transversal del diedro.",
    "No cualquier sección reproduce el diedro; el corte debe ser ortogonal a la arista."
  ],
  "m3l2e4": [
    "Un plano diagonal de un cubo presenta pendientes por diagonales de cara, no la razón asociada a 30°.",
    "El triángulo de sección relevante tiene catetos iguales, por lo que 60° no se ajusta.",
    "Una diagonal de cara no suele ser normal a la propia cara; revisa la sección perpendicular."
  ],
  "m3l2e5": [
    "Compartir una dirección paralela no establece perpendicularidad entre planos.",
    "Dos planos perpendiculares se cortan necesariamente en una recta.",
    "Si sus normales fueran paralelas, los planos serían paralelos o coincidentes."
  ],
  "m4l1e3": [
    "La proyección no depende del origen arbitrario del sistema de coordenadas.",
    "Proyectar un punto de un plano sobre ese mismo plano está bien definido.",
    "La distancia perpendicular de un punto que ya pertenece al plano es cero."
  ],
  "m4l1e5": [
    "Todos los puntos de la recta comparten el mismo pie; la imagen no conserva longitud.",
    "Una recta perpendicular al plano proyecta sobre un único lugar.",
    "La proyección ortogonal cae en el plano; una recta perpendicular no se proyecta a otra recta."
  ],
  "m4l2e3": [
    "La distancia no se obtiene sumando valores referidos al origen.",
    "El ángulo es cero para paralelos y no determina su separación.",
    "Si usas ecuaciones, primero debes normalizar por la magnitud de la normal."
  ],
  "m4l2e5": [
    "Son distintas: por ello su separación puede ser positiva.",
    "Los extremos escogidos arbitrariamente no proporcionan la distancia mínima entre rectas.",
    "El ángulo entre paralelas no determina su separación espacial."
  ],
  "m5l1e1": [
    "Comprueba la desigualdad estricta: 90° supera la suma de 20° y 30°.",
    "Además de las desigualdades triangulares, la suma de caras debe ser menor que 360°.",
    "Si el mayor ángulo iguala la suma de los otros dos, el triedro degenera."
  ],
  "m5l1e4": [
    "Cada una de las tres caras angulares es recta; suma las tres.",
    "360° corresponde a un giro completo plano, no a tres caras rectas.",
    "La longitud de las aristas no altera la medida de los tres ángulos rectos."
  ],
  "m5l1e5": [
    "No son tres ángulos de 90°; revisa la palabra trirrectángulo.",
    "La igualdad 45+45=90 es un caso límite que no produce triedro propio.",
    "La suma no es 360°: verifica 45+45+90."
  ],
  "m6l1e3": [
    "Solo en un prisma recto L coincide con h; no en un oblicuo cualquiera.",
    "Cos φ es la longitud de la proyección sobre la base, no la altura perpendicular.",
    "Una altura perpendicular no puede superar la longitud de la arista oblicua que la genera."
  ],
  "m6l1e5": [
    "Cuenta las diagonales entre vértices de bases distintas excluyendo aristas laterales y diagonales de caras.",
    "Has contado más conexiones que las espaciales; verifica qué pares están en una cara.",
    "Un prisma de base pentagonal sí tiene diagonales que atraviesan el interior."
  ],
  "m6l1e7": [
    "Una diagonal de cara solo incorpora dos longitudes positivas.",
    "La diagonal de esa cara omite una dimensión del ortoedro.",
    "La desigualdad es estricta cuando a,b,c son positivas; no pueden igualarse todas."
  ],
  "m6l2e3": [
    "Las áreas escalan con el cuadrado del factor, no con el propio factor.",
    "El cubo del factor corresponde a volúmenes.",
    "La razón de áreas depende del factor al cuadrado, no de multiplicarlo por dos."
  ],
  "m6l2e5": [
    "Esta expresión calcula la superficie de un ortoedro, no su volumen.",
    "Sumar tres longitudes no produce unidades cúbicas.",
    "Dividir el producto por tres corresponde a otras fórmulas, como una pirámide de igual base y altura."
  ],
  "m7l1e3": [
    "El triángulo de altura, apotema de base y apotema lateral obedece a suma de cuadrados.",
    "El radio circunscrito es diferente de la apotema de base; la arista lateral usa otra relación.",
    "La apotema lateral es hipotenusa, no el cateto de menor longitud."
  ],
  "m7l1e5": [
    "Revisa la apotema del triángulo equilátero: su longitud es a√3/2, no a/√2.",
    "El dato a/2 es la apotema de la base y no la de la cara.",
    "El coseno del diedro relaciona apotema básica con apotema lateral, no con la arista de cara."
  ],
  "m8l1e4": [
    "El volumen de la esfera depende del cubo del radio, no linealmente.",
    "Cuadruplicar sería el efecto sobre el área superficial, que depende del cuadrado.",
    "El factor volumétrico debe ser una potencia cúbica del factor de radio."
  ],
  "m8l1e6": [
    "No confundas la fórmula de superficie esférica con el área lateral de un cilindro.",
    "πR² corresponde al área de un círculo plano.",
    "El factor 4/3πR³ tiene unidades cúbicas: representa volumen, no superficie."
  ],
  "m9l1e1": [
    "Revisa si falta algún sólido platónico antes de enumerar.",
    "Seis no satisface la clasificación de poliedros regulares convexos.",
    "La clasificación convexa está restringida por los ángulos que concurren en cada vértice."
  ],
  "m9l1e4": [
    "El tetraedro es autodual y no tiene la cantidad de caras correspondiente al dual del cubo.",
    "La dualidad intercambia número de caras con número de vértices.",
    "La combinación de caras triangulares y seis vértices orienta a un sólido diferente."
  ],
  "m10l1e1": [
    "Un plano paralelo a las bases no secciona axialmente el cilindro.",
    "La sección por un plano oblicuo puede ser una elipse; no en un corte paralelo a las bases.",
    "Una sección circular no se convierte en triángulo por cortar un cilindro."
  ],
  "m10l1e3": [
    "Un cubo también admite secciones de cinco o seis lados.",
    "Un plano convexo puede cortar como máximo seis caras del cubo; ocho es demasiado.",
    "El número de caras del cubo limita el número de lados de una sección plana."
  ],
  "m10l1e5": [
    "Las caras paralelas pertenecen a planos paralelos; su corte por un plano transversal comparte una dirección.",
    "Dos rectas de planos paralelos diferentes no pueden ser secantes.",
    "Las rectas obtenidas están en un mismo plano de corte, por lo que no pueden ser alabeadas."
  ],
  "m11l1e3": [
    "El cuadrado de la razón de longitudes corresponde a áreas.",
    "La razón lineal no preserva el volumen bajo semejanza.",
    "El denominador también debe elevarse al cubo."
  ],
  "m11l1e4": [
    "Sustituir sin clasificar puede aplicar una fórmula a un sólido distinto.",
    "Un dibujo a escala exacta no es necesario para plantear hipótesis.",
    "Las coordenadas pueden ser útiles, pero no siempre son el primer paso ni un requisito."
  ],
  "m12l1e1": [
    "Contar aristas y vértices con Euler sin revisar grados mínimos puede producir un conteo imposible.",
    "Euler daría un valor candidato, pero no cumple que en cada vértice concurran al menos tres aristas.",
    "No basta con sumar caras: el número de incidencias debe ser compatible con un poliedro convexo."
  ],
  "m12l1e4": [
    "Las normales son proporcionales, de modo que los planos no se cortan.",
    "Normales paralelas no representan planos perpendiculares.",
    "Los términos independientes no mantienen la misma proporción que los coeficientes; los planos son distintos."
  ]
};
var contador=0;
Contenido.bancoPractica().forEach(function(e){
 if(e.tipo!=='opcion')return;
 var lista=DATOS[e.id];
 if(!lista)return;
 var n=0;
 e.opciones.forEach(function(o){if(o.correcta)return;o.motivo=lista[n++]||'Compara este enunciado con la hipótesis del teorema.';});
 if(n===lista.length)contador++;
});
window.DiagnosticoAcademico={total:contador,esperados:Object.keys(DATOS).length};
})(Contenido);
