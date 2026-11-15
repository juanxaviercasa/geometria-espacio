/* Guía de razonamiento rigurosa para las 17 lecciones: hipótesis, verificación y error límite. */
(function(global){
'use strict';
var DATOS={
  "m1l1": [
    "Por dos puntos distintos pasa una recta; por tres no alineados, un plano único.",
    "Identifica los puntos realmente distintos y si existe colinealidad.",
    "Para contar planos distintos entre n puntos exige que ningún cuarteto sea coplanar; no basta con decir que el conjunto no es coplanar."
  ],
  "m1l2": [
    "La intersección de planos no paralelos es una recta; para obtener una sección hay que cortar las aristas.",
    "Introduce coordenadas, calcula el plano y comprueba pertenencia al segmento.",
    "Un punto obtenido sobre la recta prolongada de una arista puede quedar fuera del sólido; descártalo."
  ],
  "m2l1": [
    "Las dos rectas secantes de un plano paralelas a otro plano permiten demostrar paralelismo entre planos.",
    "Verifica que las dos rectas del primer plano sean secantes y que no esté incluido en el segundo.",
    "Dos rectas simplemente paralelas entre sí no bastan para el criterio plano-plano."
  ],
  "m2l2": [
    "Para probar recta perpendicular a plano bastan dos rectas secantes de ese plano.",
    "Justifica la perpendicularidad con productos escalares o con un teorema válido.",
    "No confundas pie de la perpendicular con un punto arbitrario del plano; un vértice contenido en la base da volumen cero."
  ],
  "m3l1": [
    "El ángulo entre rectas se mide mediante sus vectores directores; el ángulo recta-plano se mide con su proyección.",
    "Distingue siempre diagonal-arista (aprox. 54,74° en el cubo) de diagonal-plano (aprox. 35,26°).",
    "Para rectas alabeadas se traslada una dirección: no es necesario que las rectas se corten."
  ],
  "m3l2": [
    "El ángulo entre planos se calcula con las normales y admite dos suplementos según convención.",
    "Dibuja una sección perpendicular a la línea de intersección y señala el ángulo que pide el ejercicio.",
    "Caras opuestas no comparten arista: no forman un diedro del poliedro; sí pueden prolongarse sus planos."
  ],
  "m4l1": [
    "La longitud proyectada de un segmento utiliza coseno; el área proyectada de una región plana utiliza el coseno del ángulo entre planos.",
    "Comprueba si el enunciado pide longitud, área o imagen completa de un sólido.",
    "La proyección de una línea es un segmento o una recta, no una superficie con área positiva."
  ],
  "m4l2": [
    "La distancia es la longitud mínima: punto-plano por normal; rectas alabeadas por perpendicular común.",
    "Antes de aplicar una fórmula clasifica si las rectas son paralelas, secantes o alabeadas.",
    "No llames alabeadas a dos aristas paralelas del cubo; verifica sus vectores directores."
  ],
  "m5l1": [
    "En un triedro propio cada ángulo de cara es menor que la suma de los otros dos y los tres suman menos de 360°.",
    "Comprueba desigualdades estrictas y cuántas caras consecutivas forman diedros.",
    "Un ángulo poliedro de n caras tiene n diedros entre caras consecutivas, no todos los pares de caras."
  ],
  "m6l1": [
    "En un prisma la altura es perpendicular a la base; la arista lateral solo coincide con ella si es recto.",
    "Diferencia diagonal de cara, diagonal espacial, arista lateral y su proyección sobre la base.",
    "En un oblicuo conocer la longitud y su inclinación no fija siempre las áreas laterales; el área depende también de la dirección."
  ],
  "m6l2": [
    "Volúmenes por descomposición se suman o restan solo sobre regiones sin solapamiento.",
    "Para un prisma truncado con altura afín sobre base rectangular usa el promedio de las cuatro alturas.",
    "Si el corte no está descrito como plano, promediar alturas aisladas sin hipótesis adicional puede ser incorrecto."
  ],
  "m7l1": [
    "En una pirámide regular el pie de altura está en el centro de una base regular; no ocurre en todas las pirámides.",
    "Radio circunscrito, apotema de base, apotema lateral y arista lateral son magnitudes diferentes.",
    "Para una base rectangular no cuadrada, las caras opuestas tienen apotemas distintos; para un tetraedro básico de lado 6 y arista lateral 5, h=√13."
  ],
  "m8l1": [
    "Las áreas se miden en unidades cuadradas y los volúmenes en cúbicas. Cono y cilindro de igual base y altura tienen volúmenes en razón 1:3.",
    "Calcula generatriz con Pitágoras antes de aplicar área lateral del cono.",
    "Nunca sumes sólidos inscritos sin comprobar primero si se superponen."
  ],
  "m9l1": [
    "Para poliedros convexos verifica Euler V−E+F=2 y doble conteo de aristas.",
    "Distingue área de las caras, cantidad de vértices, aristas y caras de cada sólido platónico.",
    "La igualdad de un conteo numérico no demuestra por sí sola la existencia o regularidad de un poliedro."
  ],
  "m10l1": [
    "Una sección plana es un polígono (o curva) definido por el plano con el sólido completo.",
    "Identifica los puntos de corte con aristas y ordena el contorno sobre las caras.",
    "Tres puntos medios sobre aristas concurrentes de un cubo determinan una sección triangular, no pentagonal."
  ],
  "m11l1": [
    "Resuelve sólidos compuestos con diagrama, datos, semejanza, fórmula y comprobación.",
    "Si hay un sólido inscrito dentro de otro calcula volumen de la unión antes de restar al contenedor.",
    "Separa con claridad cortes de pirámides por planos paralelos a la base frente a secciones oblicuas."
  ],
  "m12l1": [
    "En un simulacro exige identificación de hipótesis, elección de teorema, operación y verificación final.",
    "Calcula primero razones de volumen y comprueba inclusión geométrica para evitar sumar volúmenes solapados.",
    "El octaedro medial está incluido en el tetraedro de vértices alternos del cubo; el volumen libre es 2/3 del cubo."
  ]
};
function guia(id){var r=DATOS[id];return r?{principio:r[0],verificacion:r[1],limite:r[2]}:null;}
global.GuiaAcademica={obtener:guia,ids:Object.keys(DATOS)};
})(window);
