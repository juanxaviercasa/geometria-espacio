/* ============================================================
   contenido-a.js — módulos 1, 2 y 3
   M1 Puntos, rectas y planos
   M2 Posiciones relativas, paralelismo y perpendicularidad
   M3 Ángulos entre rectas, planos y recta-plano
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     M1 · L1 — El espacio y sus notaciones
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm1l1',
    modulo: 'm1',
    titulo: 'El espacio y sus notaciones',
    resumen: 'Punto, recta y plano: qué se admite sin demostración y cómo se escribe.',
    objetivo: 'Distinguir los tres objetos fundamentales de la geometría del espacio, usar su notación correcta y reconocer cuándo un conjunto de puntos determina una recta o un plano.',
    duracion: '22 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La intuición primero', texto: 'Una hoja de papel apoyada en la mesa es una buena imagen de un <strong>plano</strong>: tiene largo y ancho, pero su grosor es despreciable. Una cuerda tensa sobre esa hoja se parece a una <strong>recta</strong>. Un grano de arena es un <strong>punto</strong>. La geometría del espacio no estudia objetos físicos: estudia <em>modelos</em> de esos objetos, con extensión infinita y sin grosor.' },
      { tipo: 'parrafo', texto: 'La diferencia esencial con la geometría plana es que ahora hacen falta <strong>tres datos independientes</strong> para fijar un punto. En el plano bastan dos coordenadas; en el espacio, tres. Todo lo demás —rectas, planos, ángulos, distancias— se construye a partir de esa base.' },
      {
        tipo: 'definicion', titulo: 'Definiciones fundamentales', indice: 'Definiciones',
        html: '<p>Admitimos como conceptos primitivos los conjuntos <strong>punto</strong>, <strong>recta</strong> y <strong>plano</strong>, y la relación <em>pertenece a</em> (notación: <span class="m">P ∈ r</span> se lee «<var>P</var> pertenece a <var>r</var>»).</p>' +
          '<ul><li>Un <strong>punto</strong> se designa con una letra mayúscula: <var>A</var>, <var>B</var>, <var>P</var>.</li>' +
          '<li>Una <strong>recta</strong> se designa con una letra minúscula: <var>r</var>, <var>s</var>, <var>t</var>. También se nombra por dos de sus puntos: <span class="m">AB</span>.</li>' +
          '<li>Un <strong>plano</strong> se designa con una letra griega: <var>α</var>, <var>β</var>, <var>π</var>. También se nombra por tres de sus puntos no alineados: <span class="m">(ABC)</span>.</li>' +
          '<li>Dados <var>A</var> y <var>B</var>, el <strong>segmento</strong> <span class="m">AB</span> es el conjunto de puntos de la recta <span class="m">AB</span> que están entre <var>A</var> y <var>B</var>. Su longitud se escribe <span class="m">|AB|</span> o simplemente <span class="m">AB</span> cuando no hay ambigüedad.</li>' +
          '<li>Un conjunto de puntos es <strong>coplanar</strong> si todos están contenidos en un mismo plano; en caso contrario se llama <strong>alabeado</strong> (para rectas) o simplemente <strong>no coplanar</strong>.</li></ul>'
      },
      {
        tipo: 'teorema', titulo: 'Axiomas de determinación', indice: 'Axiomas de determinación',
        enunciado: '<p><strong>(A1)</strong> Por dos puntos distintos pasa una recta y solo una.</p>' +
          '<p><strong>(A2)</strong> Por tres puntos no alineados pasa un plano y solo uno.</p>' +
          '<p><strong>(A3)</strong> Si dos puntos de una recta están en un plano, entonces todos los puntos de la recta están en ese plano.</p>' +
          '<p><strong>(A4)</strong> Si dos planos distintos tienen un punto en común, su intersección es una recta.</p>' +
          '<p><strong>(A5)</strong> Existen al menos cuatro puntos no coplanares.</p>',
        justifica: 'No se demuestran: son las reglas mínimas que hacen que el espacio se comporte como esperamos. Todo teorema posterior se apoya en ellas. El axioma (A5) es el que garantiza que estamos en el espacio y no en un plano.'
      },
      { tipo: 'figura', figura: 'triedro', indice: 'Figura: referencia espacial', titulo: 'Tres direcciones independientes', pie: 'Tres semirrectas con origen común ya no caben en un plano: son el germen del sistema de referencia <var>x</var>, <var>y</var>, <var>z</var>. Arrastra o usa las flechas del teclado para girar el modelo.' },
      { tipo: 'nota', variante: 'ojo', html: '<p><strong>Cuidado con el lenguaje.</strong> «Tres puntos determinan un plano» es <em>falso</em> si están alineados: por una recta pasan infinitos planos. La condición «no alineados» no es un tecnicismo, es lo que hace que la afirmación sea verdadera.</p>' },
      {
        tipo: 'ejemplo', indice: 'Ejemplo resuelto',
        titulo: '¿Cuántos planos determinan los vértices de un tetraedro?',
        enunciado: 'Un tetraedro tiene cuatro vértices <var>A</var>, <var>B</var>, <var>C</var>, <var>D</var>, y se sabe que tres cualesquiera no están alineados. ¿Cuántos planos distintos determinan esos cuatro puntos?',
        pasos: [
          { titulo: 'Interpretar qué se pide', html: 'Cada plano queda determinado por una terna de puntos no alineados, por (A2). Como tres vértices de un tetraedro nunca son colineales, cada terna aporta un plano.' },
          { titulo: 'Contar las ternas', html: 'El número de formas de elegir 3 puntos entre 4, sin importar el orden, es una combinación:', cuenta: 'C(4,3) = 4! / (3!·1!) = 4' },
          { titulo: 'Comprobar que no hay repeticiones', html: '¿Podrían dos ternas distintas dar el mismo plano? Si <span class="m">(ABC)</span> y <span class="m">(ABD)</span> fueran el mismo plano, los cuatro puntos serían coplanares. Pero en un tetraedro <var>D</var> no está en el plano <span class="m">(ABC)</span>; de lo contrario el sólido sería plano, no un tetraedro. Por tanto los 4 planos son distintos.' }
        ],
        respuesta: "<strong>4 planos.</strong> Cada terna de vértices de un tetraedro determina una cara distinta. Para generalizar a <span class=\"m\">C(n,3)</span> planos distintos, debe exigirse que no haya tres puntos alineados <strong>ni cuatro coplanares</strong>; no basta con que todos los puntos no sean coplanares."
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Decir que una recta y un punto determinan siempre un plano.', bien: 'Solo si el punto no pertenece a la recta.', porque: 'Si el punto está sobre la recta, todas las combinaciones caen en la misma recta y por ella pasan infinitos planos.' },
          { mal: 'Contar 3 planos a partir de 4 puntos no coplanares restando una cara al tetraedro.', bien: 'Son 4: una por cada cara.', porque: 'Cada cara define un plano propio; olvidar una suele venir de contar las caras «visibles» en el dibujo.' },
          { mal: 'Escribir <span class="m">AB = 5</span> para el segmento y luego usar <span class="m">AB</span> como la recta.', bien: 'Reservar <span class="m">AB</span> para la longitud y <span class="m">↔AB</span> o <var>r</var> para la recta.', porque: 'En los exámenes, la ambigüedad de notación provoca errores al aplicar fórmulas de distancia.' }
        ]
      },
      { tipo: 'subtitulo', indice: 'Práctica', texto: 'Practica lo esencial' },
      { tipo: 'parrafo', texto: 'Resuelve los siguientes ejercicios. Puedes pedir pistas graduadas: la primera te orienta, la segunda te da el cálculo intermedio. La retroalimentación explica <em>por qué</em> una opción es incorrecta, no solo cuál es la correcta.' }
    ],
    ejercicios: [
      {
        id: 'm1l1e1', tipo: 'opcion', dificultad: 'Básico',
        pregunta: '¿Cuántos planos determinan tres puntos no alineados?',
        opciones: [
          { texto: 'Exactamente uno', correcta: true },
          { texto: 'Exactamente dos' },
          { texto: 'Infinitos' },
          { texto: 'Ninguno, hacen falta cuatro puntos' }
        ],
        explicacion: 'Es el axioma (A2): por tres puntos no alineados pasa un plano y solo uno. «Solo uno» es tan importante como «pasa uno»: si hubiera dos planos distintos con esos tres puntos, su intersección sería una recta que contiene a los tres, y estarían alineados.',
        pistas: ['Recuerda el axioma de determinación del plano.', 'Si hubiera dos planos con esos tres puntos, su intersección sería una recta con tres puntos… ¿qué implicaría eso?']
      },
      {
        id: 'm1l1e2', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'Cinco puntos son tales que <strong>solo</strong> tres de ellos están alineados (y no hay otros tres alineados entre sí). ¿Cuántas rectas distintas determinan?',
        unidad: 'rectas', respuesta: 8, tolerancia: 0,
        explicacion: 'Con 5 puntos, el número de pares es C(5,2) = 10. Los tres puntos alineados aportan 3 pares que producen una única recta; por eso restamos 3 y sumamos 1. Resultado: 10 − 3 + 1 = 8. Comprobación directa: la recta de los tres alineados (1), las 3 rectas del cuarto punto con cada uno de ellos (3), las 3 del quinto (3) y la recta que une el cuarto con el quinto (1) → 1 + 3 + 3 + 1 = 8.',
        pistas: ['Empieza contando todos los pares de puntos: C(5,2).', 'Los 3 puntos alineados producen 3 pares, pero una sola recta. Resta 3 pares y suma 1 recta.']
      },
      {
        id: 'm1l1e3', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'Si dos puntos <var>A</var> y <var>B</var> de una recta <var>r</var> pertenecen al plano <var>α</var>, entonces necesariamente:',
        opciones: [
          { texto: 'Toda la recta <var>r</var> está contenida en <var>α</var>', correcta: true },
          { texto: 'Solo el segmento <span class="m">AB</span> está en <var>α</var>' },
          { texto: '<var>r</var> es paralela a <var>α</var>' },
          { texto: '<var>r</var> corta a <var>α</var> en un único punto' }
        ],
        explicacion: 'Es el axioma (A3). Además, esto descarta las otras opciones: si la recta cortara al plano en un único punto, ese punto sería <var>A</var> o <var>B</var>, pero ambos pertenecen al plano, así que la recta no puede «salir» del plano.',
        pistas: ['Es uno de los axiomas de incidencia.', 'Piensa si una recta puede entrar y salir de un plano.']
      },
      {
        id: 'm1l1e4', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'Una recta <var>r</var> y un punto <var>P</var> que <strong>no</strong> pertenece a <var>r</var>. ¿Qué determinan?',
        opciones: [
          { texto: 'Un único plano', correcta: true },
          { texto: 'Infinitos planos' },
          { texto: 'Ningún plano' },
          { texto: 'Dos planos, uno por cada semirrecta' }
        ],
        explicacion: 'Toma dos puntos <var>A</var> y <var>B</var> de <var>r</var>. Como <var>P</var> no está en <var>r</var>, los puntos <var>A</var>, <var>B</var>, <var>P</var> no están alineados, y por (A2) determinan un plano único. Ese plano contiene a <var>A</var> y <var>B</var>, luego por (A3) contiene toda la recta <var>r</var>.',
        pistas: ['Elige dos puntos de la recta.', '¿Están esos dos puntos y <var>P</var> alineados?']
      },
      {
        id: 'm1l1e5', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'En un cubo, ¿cuántas rectas distintas determinan sus 8 vértices? (Todas las aristas y todas las diagonales de cara cuentan.)',
        unidad: 'rectas', respuesta: 28, tolerancia: 0,
        explicacion: 'Cada par de vértices define una recta. Hay C(8,2) = 28 pares. En el cubo no hay tres vértices alineados (ninguna arista pasa por un tercer vértice), así que cada par da una recta diferente: 28. De ellas, 12 son aristas, 12 son diagonales de cara y 4 son diagonales espaciales.',
        pistas: ['Cuenta pares de vértices.', 'En un cubo, ¿hay algún caso de tres vértices alineados? Si no lo hay, cada par da una recta distinta.']
      }
    ],
    retos: [
      {
        id: 'm1l1r1', titulo: 'Planos y rectas en un tetraedro', nivel: 'UNI', puntos: 25,
        enunciado: 'Sea <var>ABCD</var> un tetraedro. Sea <var>M</var> el punto medio de <span class="m">AB</span> y <var>N</var> el punto medio de <span class="m">CD</span>. Demuestra que las rectas <span class="m">MN</span> y <span class="m">AC</span> son alabeadas, y decide si <span class="m">MN</span> y <span class="m">BD</span> también lo son.',
        estrategia: [
          'Para probar que dos rectas son alabeadas basta exhibir un plano que contenga a una de ellas y comprobar que la otra lo corta en un punto que no está en la primera.',
          'Busca un plano que contenga a <span class="m">AC</span> y sea cómodo: el plano <span class="m">(ABC)</span> o el <span class="m">(ACD)</span> sirven.',
          'Analiza por separado los dos casos pedidos.'
        ],
        desarrollo: [
          'Considera el plano <span class="m">(ABC)</span>. La recta <span class="m">AC</span> está contenida en él. El punto <var>M</var> está en <span class="m">AB</span>, luego en el plano; el punto <var>N</var> está en <span class="m">CD</span>, y como <var>D</var> no pertenece a <span class="m">(ABC)</span>, el único punto de la recta <span class="m">CD</span> que está en ese plano es <var>C</var>. Como <var>N</var> ≠ <var>C</var>, se tiene <var>N</var> ∉ <span class="m">(ABC)</span>.',
          'Por tanto la recta <span class="m">MN</span> corta al plano <span class="m">(ABC)</span> exactamente en <var>M</var>. Si <span class="m">MN</span> y <span class="m">AC</span> fueran coplanares, estarían ambas en un plano que contiene a <var>M</var>, <var>N</var> y <span class="m">AC</span>; ese plano contendría <var>M</var>, <var>A</var>, <var>C</var> y <var>N</var>, y como <var>A</var>, <var>M</var>, <var>C</var> determinan <span class="m">(ABC)</span>, se tendría <var>N</var> ∈ <span class="m">(ABC)</span>, contradicción. Luego <span class="m">MN</span> y <span class="m">AC</span> son alabeadas.',
          'Para <span class="m">MN</span> y <span class="m">BD</span>: considera el plano <span class="m">(ABD)</span>. La recta <span class="m">BD</span> está en él y <var>M</var> ∈ <span class="m">AB</span> también. El punto <var>N</var> ∈ <span class="m">CD</span> corta a <span class="m">(ABD)</span> solo en <var>D</var>, y <var>N</var> ≠ <var>D</var>. Con el mismo argumento, <span class="m">MN</span> y <span class="m">BD</span> son alabeadas.',
          'Y en efecto, <span class="m">MN</span> y <span class="m">BD</span> tampoco se cortan: si se cortaran, el punto de corte estaría en ambos planos <span class="m">(ABD)</span> y… el razonamiento anterior ya lo excluye.'
        ],
        respuesta: 'Ambos pares son alabeados. El segmento <span class="m">MN</span> se llama <strong>bimediana</strong> del tetraedro y une los puntos medios de dos aristas opuestas.'
      }
    ]
  });

  /* ==========================================================
     M1 · L2 — Axiomas y primeras demostraciones
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm1l2',
    modulo: 'm1',
    titulo: 'Planos que se cortan y primeras demostraciones',
    resumen: 'Cómo se cortan dos planos y cómo se escribe una demostración corta y válida.',
    objetivo: 'Determinar planos, describir la intersección de dos planos y estructurar demostraciones breves usando los axiomas de incidencia.',
    duracion: '24 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'Cuando dos planos distintos se cruzan, la «huella» del cruce es una recta. Piensa en dos paredes contiguas de una habitación: se juntan en una esquina que es recta, no un punto ni una superficie. Ese es el contenido del axioma (A4) y es la base de la mayoría de las construcciones en el espacio.' },
      { tipo: 'figura', figura: 'planos-corte', indice: 'Figura: planos que se cortan', titulo: 'Intersección de dos planos', pie: 'La recta <var>r</var> es el conjunto de puntos comunes a <var>α</var> y <var>β</var>. Activa y desactiva capas para ver cada plano por separado.' },
      {
        tipo: 'definicion', titulo: 'Posiciones relativas de dos planos', indice: 'Posiciones relativas',
        html: '<ul><li><strong>Secantes:</strong> tienen una recta en común y exactamente una.</li>' +
          '<li><strong>Paralelos:</strong> no tienen ningún punto en común.</li>' +
          '<li><strong>Coincidentes:</strong> son «el mismo» plano; no son planos <em>distintos</em>.</li></ul>' +
          '<p>Dos planos distintos no pueden cortarse en un solo punto: eso es precisamente lo que prohíbe (A4). Una consecuencia útil: si dos planos distintos comparten <strong>tres puntos no alineados</strong>, son el mismo plano.</p>'
      },
      {
        tipo: 'teorema', titulo: 'Dos rectas secantes determinan un plano', indice: 'Teorema: rectas secantes',
        enunciado: 'Si dos rectas <var>r</var> y <var>s</var> se cortan en un punto <var>P</var>, entonces existe un plano y solo uno que contiene a ambas.',
        justifica: 'Toma <var>A</var> ∈ <var>r</var>, <var>A</var> ≠ <var>P</var>, y <var>B</var> ∈ <var>s</var>, <var>B</var> ≠ <var>P</var>. Los puntos <var>A</var>, <var>B</var>, <var>P</var> no son colineales: si lo fueran, las rectas <span class="m">AP</span> y <span class="m">BP</span> serían la misma recta, es decir <var>r</var> = <var>s</var>, contra la hipótesis de que son rectas distintas que se cortan. Por (A2) existe un único plano <var>π</var> con esos tres puntos. Ese plano contiene <var>A</var> y <var>P</var>, luego contiene a <var>r</var> (A3), y contiene <var>B</var> y <var>P</var>, luego contiene a <var>s</var>. La unicidad se sigue de (A2): cualquier plano que contenga a ambas contiene a <var>A</var>, <var>B</var>, <var>P</var>.'
      },
      {
        tipo: 'teorema', titulo: 'Dos rectas paralelas determinan un plano', indice: 'Teorema: rectas paralelas',
        enunciado: 'Dos rectas paralelas distintas están contenidas en un único plano.',
        justifica: 'Si <var>r</var> ∥ <var>s</var>, son coplanares por definición de paralelismo en el espacio, así que existe al menos un plano que las contiene. Si existieran dos planos <var>π</var><sub>1</sub> y <var>π</var><sub>2</sub> que las contienen, ambos contendrían dos puntos de <var>r</var> y uno de <var>s</var> fuera de <var>r</var>, es decir tres puntos no alineados; por (A2) serían el mismo plano.'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo resuelto',
        titulo: 'Intersección de un plano con las caras de un cubo',
        enunciado: 'En el cubo <span class="m">ABCD-A₁B₁C₁D₁</span> de arista <var>a</var>, sea <var>M</var> el punto medio de <span class="m">AB</span> y <var>N</var> el punto medio de <span class="m">BC</span>. Describe la sección que produce el plano <span class="m">(MNC₁)</span> y clasifica la figura resultante.',
        pasos: [
          { titulo: 'Identificar los segmentos conocidos', html: '<var>M</var> y <var>N</var> están en la cara inferior, así que el segmento <span class="m">MN</span> pertenece a la sección. <var>N</var> y <span class="m">C₁</span> están ambos en la cara <span class="m">BCC₁B₁</span>, luego <span class="m">NC₁</span> también. Faltan los otros lados.' },
          { titulo: 'Escribir la ecuación del plano', html: 'Con <span class="m">A(0,0,0)</span>, <span class="m">B(a,0,0)</span>, <span class="m">C(a,a,0)</span>, <span class="m">C₁(a,a,a)</span> se tiene <span class="m">M(a/2, 0, 0)</span> y <span class="m">N(a, a/2, 0)</span>. El plano que contiene a los tres puntos es:', cuenta: '2x − 2y + z = a' },
          { titulo: 'Comprobar la ecuación con los tres puntos', html: 'En <var>M</var>: <span class="m">2(a/2) − 0 + 0 = a</span> ✓. En <var>N</var>: <span class="m">2a − a + 0 = a</span> ✓. En <span class="m">C₁</span>: <span class="m">2a − 2a + a = a</span> ✓. La ecuación es correcta.' },
          { titulo: 'Buscar el cuarto vértice', html: 'Se corta el plano con las aristas restantes y se descartan los puntos fuera de los segmentos (por ejemplo, en <span class="m">BB₁</span>: <span class="m">2a + z = a</span> da <span class="m">z = −a</span>, fuera). En la arista <span class="m">AA₁</span>, con <span class="m">x = y = 0</span>, se obtiene <span class="m">z = a</span>: el punto <span class="m">A₁(0,0,a)</span> sí pertenece al plano.', cuenta: 'A₁ ∈ (MNC₁)  porque  0 − 0 + a = a' },
          { titulo: 'Cerrar el polígono', html: 'La sección es el cuadrilátero <span class="m">M N C₁ A₁</span>, con un lado en cada una de cuatro caras: <span class="m">MN</span> en la base, <span class="m">NC₁</span> en la cara derecha, <span class="m">C₁A₁</span> en la tapa y <span class="m">A₁M</span> en la cara frontal.' },
          { titulo: 'Clasificar la figura', html: '<span class="m">MN</span> une puntos medios en el triángulo <span class="m">ABC</span>, luego <span class="m">MN ∥ AC</span> y <span class="m">MN = a√2/2</span>. Como <span class="m">A₁C₁ ∥ AC</span> y <span class="m">A₁C₁ = a√2</span>, resulta <span class="m">MN ∥ A₁C₁</span>: es un trapecio. Las patas miden <span class="m">A₁M = √(a² + a²/4) = a√5/2</span> y <span class="m">NC₁ = a√5/2</span>, iguales por simetría.' }
        ],
        respuesta: 'La sección es el trapecio isósceles <span class="m">M N C₁ A₁</span>, con bases <span class="m">MN = a√2/2</span> y <span class="m">A₁C₁ = a√2</span>, y patas <span class="m">a√5/2</span>. No es un paralelogramo: una base mide el doble que la otra.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Afirmar que dos planos que comparten dos puntos se cortan solo en el segmento que los une.', bien: 'Se cortan en toda la recta que pasa por esos dos puntos.', porque: 'Por (A3) la recta entera está en cada plano, y por (A4) la intersección es exactamente esa recta.' },
          { mal: 'Concluir «son paralelos» solo porque en el dibujo no se ve el corte.', bien: 'Verificar la ausencia de puntos comunes con un argumento, no con el dibujo.', porque: 'Un dibujo en perspectiva puede mostrar planos que se cortan fuera del trozo dibujado. Dos rectas paralelas en el dibujo pueden no serlo en el espacio.' },
          { mal: 'Dar por hecho que si dos rectas no se cortan son paralelas.', bien: 'En el espacio pueden ser alabeadas: no se cortan y no son coplanares.', porque: 'Esta es la diferencia central entre geometría plana y del espacio. En el plano sí vale la implicación; en el espacio no.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm1l2e1', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'Dos rectas alabeadas <var>r</var> y <var>s</var>:',
        opciones: [
          { texto: 'No se cortan y no son coplanares', correcta: true },
          { texto: 'No se cortan y son coplanares' },
          { texto: 'Se cortan en un punto del espacio' },
          { texto: 'Son siempre perpendiculares' }
        ],
        explicacion: 'Alabeadas significa exactamente eso: no coplanares, y por tanto tampoco secantes. Si fueran coplanares y no se cortaran, serían paralelas, que es el otro caso posible entre rectas coplanares.',
        pistas: ['«Alabeado» se define por la coplanariedad, no por el ángulo.', 'En un plano, dos rectas que no se cortan son paralelas. ¿Qué pasa si no hay plano que las contenga?']
      },
      {
        id: 'm1l2e2', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'En un cubo de arista 1, ¿cuántos <strong>pares de aristas alabeadas</strong> hay?',
        unidad: 'pares', respuesta: 24, tolerancia: 0,
        explicacion: 'Hay 12 aristas, es decir C(12,2) = 66 pares. Dos aristas son coplanares si y solo si son paralelas o se cortan. Paralelas: 3 direcciones × C(4,2) = 18 pares. Secantes: en cada vértice concurren 3 aristas y cualquier par de ellas determina un ángulo de cara; son C(3,2) = 3 pares por vértice × 8 vértices = 24 pares. Total coplanares: 18 + 24 = 42. Alabeadas: 66 − 42 = 24.',
        pistas: ['Cuenta primero todos los pares de aristas y luego resta los coplanares.', 'Coplanares = paralelas + secantes. Paralelas: 3·C(4,2). Secantes: 8·C(3,2).']
      },
      {
        id: 'm1l2e3', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'La intersección de dos planos distintos que no son paralelos es:',
        opciones: [
          { texto: 'Una recta', correcta: true },
          { texto: 'Un punto' },
          { texto: 'Un segmento de longitud finita' },
          { texto: 'Un plano' }
        ],
        explicacion: 'Es el axioma (A4). Un punto solo no basta: por cualquier recta pasan infinitos planos, así que dos planos que comparten un punto comparten al menos una recta. Un segmento finito tampoco: la recta entera pertenece a ambos.',
        pistas: ['Piensa en la esquina de una habitación.', '¿Qué recta contiene un plano que pasa por dos puntos de otro plano?']
      },
      {
        id: 'm1l2e4', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'Cuatro puntos de un mismo plano, sin que haya tres alineados. ¿Cuántas rectas distintas determinan?',
        unidad: 'rectas', respuesta: 6, tolerancia: 0,
        explicacion: 'C(4,2) = 6. Como no hay tres alineados, cada par de puntos produce una recta distinta. Los 6 pares corresponden a los 4 lados y las 2 diagonales de un cuadrilátero.',
        pistas: ['Es una combinación de 4 elementos tomados de 2 en 2.', 'Dibuja un cuadrilátero: cuenta lados y diagonales.']
      },
      {
        id: 'm1l2e5', tipo: 'opcion', dificultad: 'Avanzado',
        pregunta: 'En un cubo, sea <var>r</var> la recta que contiene a la arista <span class="m">AB</span> y <var>s</var> la recta que contiene a la arista <span class="m">CC₁</span>. ¿Qué relación tienen?',
        opciones: [
          { texto: 'Son alabeadas y ortogonales', correcta: true },
          { texto: 'Son paralelas' },
          { texto: 'Son secantes en <var>C</var>' },
          { texto: 'Son alabeadas y oblicuas' }
        ],
        explicacion: 'No son coplanares (AB está en la cara inferior, CC₁ es vertical, y no hay plano que contenga a ambas), luego son alabeadas. Además, el ángulo entre ellas se mide trasladando una paralela: la recta <span class="m">BB₁</span> es paralela a <span class="m">CC₁</span> y es perpendicular a <span class="m">AB</span> en <var>B</var>. Por tanto las <strong>direcciones son ortogonales</strong> y forman un ángulo de 90°. Como las rectas no se cortan, conviene llamarlas <strong>rectas alabeadas ortogonales</strong> y reservar «perpendiculares» para rectas secantes.',
        pistas: ['Comprueba primero si hay un plano que las contenga.', 'Para el ángulo, traslada una de ellas a un punto de la otra.']
      }
    ],
    retos: [
      {
        id: 'm1l2r1', titulo: 'Un plano, tres caras', nivel: 'UNI', puntos: 25,
        enunciado: 'En un cubo <span class="m">ABCD-A₁B₁C₁D₁</span> de arista <var>a</var>, el plano <var>π</var> pasa por los puntos medios <var>M</var> de <span class="m">AB</span>, <var>N</var> de <span class="m">AD</span> y <var>P</var> de <span class="m">CC₁</span>. Determina el polígono de la sección y su perímetro.',
        estrategia: ["Sitúa el cubo en coordenadas y encuentra la ecuación del plano que pasa por M, N y P.","Interseca el plano con las doce aristas y acepta únicamente los puntos dentro de cada segmento.","Ordena los vértices de la sección y suma únicamente distancias entre vértices consecutivos."],
        desarrollo: ["Sea <span class=\"m\">A(0,0,0), B(a,0,0), D(0,a,0)</span>. Entonces <span class=\"m\">M(a/2,0,0), N(0,a/2,0), P(a,a,a/2)</span>.","Los vectores <span class=\"m\">MN=(-a/2,a/2,0)</span> y <span class=\"m\">MP=(a/2,a,a/2)</span> dan un vector normal proporcional a <span class=\"m\">(1,1,-3)</span>. El plano es <span class=\"m\">x+y-3z=a/2</span>.","Al intersectar con <span class=\"m\">BB₁</span> aparece <span class=\"m\">Q(a,0,a/6)</span>, y con <span class=\"m\">DD₁</span>, <span class=\"m\">R(0,a,a/6)</span>. Los otros tres cortes válidos son M, N y P; el polígono tiene cinco vértices.","En el contorno <span class=\"m\">M-Q-P-R-N-M</span>, las longitudes son <span class=\"m\">MQ=RN=a√10/6</span>, <span class=\"m\">QP=PR=a√10/3</span> y <span class=\"m\">NM=a/√2</span>.","Sumando los cinco lados: <span class=\"m\">P=2(a√10/6)+2(a√10/3)+a/√2=a(√10+1/√2)</span>. Para <span class=\"m\">a=1</span> resulta aproximadamente <span class=\"m\">3,8694</span>. La diagonal NQ no es un lado."],
        respuesta: "La sección es el pentágono <span class=\"m\">MQPRN</span>, cuyo perímetro es <strong><span class=\"m\">P=a(√10+1/√2)</span></strong>. El plano utilizado es <span class=\"m\">x+y-3z=a/2</span>."
      }
    ]
  });

  /* ==========================================================
     M2 · L1 — Paralelismo
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm2l1',
    modulo: 'm2',
    titulo: 'Paralelismo entre rectas y planos',
    resumen: 'Tres teoremas que convierten un paralelismo visible en una demostración.',
    objetivo: 'Aplicar los criterios de paralelismo recta-plano y plano-plano, y usarlos para identificar secciones y ángulos en sólidos.',
    duracion: '26 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'En el plano, dos rectas son paralelas si no se cortan. En el espacio esa definición se queda corta, porque dos rectas pueden no cortarse y aun así no ser paralelas: son alabeadas. Por eso el paralelismo se define siempre <strong>por coplanariedad más ausencia de corte</strong>.' },
      {
        tipo: 'definicion', titulo: 'Definiciones de paralelismo', indice: 'Definiciones',
        html: '<ul><li><strong>Recta paralela a un plano:</strong> una recta <var>r</var> y un plano <var>π</var> son paralelos si no tienen ningún punto en común. Se escribe <span class="m">r ∥ π</span>. Si <var>r</var> está contenida en <var>π</var>, se dice que <var>r</var> está <em>contenida</em>, no que es paralela.</li>' +
          '<li><strong>Planos paralelos:</strong> dos planos son paralelos si no tienen ningún punto en común.</li>' +
          '<li><strong>Rectas paralelas:</strong> son coplanares y no se cortan.</li></ul>' +
          '<p>La distinción «contenida» / «paralela» no es un lujo: los teoremas cambian según el caso.</p>'
      },
      {
        tipo: 'teorema', titulo: 'Criterio recta-plano (CRP)', indice: 'Criterio recta-plano',
        enunciado: 'Si una recta <var>r</var> es paralela a una recta <var>s</var> contenida en un plano <var>π</var>, entonces <var>r</var> es paralela a <var>π</var> o está contenida en <var>π</var>.',
        justifica: 'Supongamos que <var>r</var> corta a <var>π</var> en un punto <var>P</var>. Como <var>r ∥ s</var>, ambas están en un plano <var>σ</var>. Ese plano <var>σ</var> contiene a <var>s</var> ⊂ <var>π</var> y también a <var>P</var> ∈ <var>π</var>. La intersección <span class="m">σ ∩ π</span> es una recta (A4) que contiene a <var>s</var> y a <var>P</var>; en el plano <var>σ</var>, esa recta corta a <var>r</var> en <var>P</var> y es paralela a <var>r</var>: contradicción, porque dos rectas paralelas no se cortan. Luego <var>r</var> no corta a <var>π</var>.'
      },
      {
        tipo: 'teorema', titulo: 'Teorema de la intersección paralela (TIP)', indice: 'Teorema de intersección',
        enunciado: 'Si <var>r ∥ π</var> y <var>r</var> está contenida en un plano <var>σ</var> que corta a <var>π</var> según la recta <var>t</var>, entonces <span class="m">t ∥ r</span>.',
        justifica: '<var>r</var> y <var>t</var> son coplanares (ambas en <var>σ</var>). Si se cortaran en <var>P</var>, ese punto estaría en <var>t</var> ⊂ <var>π</var>, luego en <var>r</var> ∩ <var>π</var>, en contra de <var>r ∥ π</var>. Como son coplanares y no se cortan, son paralelas.'
      },
      {
        tipo: 'teorema', titulo: 'Criterio plano-plano (CPP)', indice: 'Criterio plano-plano',
        enunciado: 'Si un plano <var>π</var> contiene dos rectas secantes, ambas paralelas a un plano <var>σ</var>, entonces <span class="m">π ∥ σ</span>.',
        justifica: 'Sean <var>r</var> y <var>s</var> las dos rectas secantes de <var>π</var>, con <var>r ∥ σ</var> y <var>s ∥ σ</var>. Si <var>π</var> cortara a <var>σ</var> según una recta <var>t</var>, por el TIP tendríamos <var>t ∥ r</var> y <var>t ∥ s</var>. Por la unicidad de la paralela por un punto, <var>r</var> y <var>s</var> serían la misma recta, contra la hipótesis de que son secantes distintas. Luego <var>π ∥ σ</var>.'
      },
      { tipo: 'figura', figura: 'planos-corte', indice: 'Figura: corte de planos', titulo: 'La recta de intersección como testigo', pie: 'Cuando un plano auxiliar corta a otros dos, las rectas de corte son el instrumento con el que se prueba el paralelismo (TIP).' },
      {
        tipo: 'ejemplo', indice: 'Ejemplo resuelto',
        titulo: 'Una diagonal de cara paralela a una cara opuesta',
        enunciado: 'En el cubo <span class="m">ABCD-A₁B₁C₁D₁</span>, demuestra que la recta <span class="m">A₁B</span> es paralela al plano <span class="m">DCC₁D₁</span>.',
        pasos: [
          { titulo: 'Buscar una paralela contenida en el plano', html: 'El plano <span class="m">DCC₁D₁</span> contiene la arista <span class="m">D₁C</span> y la arista <span class="m">DC</span>. ¿Alguna es paralela a <span class="m">A₁B</span>? La arista <span class="m">D₁C</span> va de la esquina superior de una cara a la inferior de la otra; <span class="m">A₁B</span> hace lo mismo en la cara opuesta.' },
          { titulo: 'Justificar el paralelismo', html: 'El cuadrilátero <span class="m">A₁BCD₁</span> tiene <span class="m">A₁D₁ ∥ BC</span> y <span class="m">A₁D₁ = BC = a</span>, luego es un paralelogramo, y por tanto <span class="m">A₁B ∥ D₁C</span>.' },
          { titulo: 'Aplicar el criterio', html: 'Como <span class="m">D₁C</span> está contenida en el plano <span class="m">DCC₁D₁</span> y <span class="m">A₁B ∥ D₁C</span>, por el criterio (CRP) la recta <span class="m">A₁B</span> es paralela a ese plano (no está contenida: el punto <var>B</var> no pertenece a la cara derecha).' }
        ],
        respuesta: '<span class="m">A₁B ∥ plano DCC₁D₁</span>. La cadena lógica completa es: paralelogramo → rectas paralelas → criterio recta-plano. Nunca se usa el dibujo.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Decir «r es paralela a π porque no la toca en el dibujo».', bien: 'Encontrar una recta de π paralela a r, o razonar por contradicción.', porque: 'El dibujo muestra solo una porción finita del plano; el corte puede estar fuera del trozo dibujado.' },
          { mal: 'Concluir que dos planos son paralelos porque contienen rectas paralelas (una cada uno).', bien: 'Exigir dos rectas secantes en uno de los planos, ambas paralelas al otro.', porque: 'Con una sola recta paralela por plano, los planos pueden cortarse: basta girar uno de ellos alrededor de esa recta.' },
          { mal: 'Confundir «recta contenida» con «recta paralela».', bien: 'Verificar si <var>r</var> tiene puntos en común con <var>π</var>.', porque: 'Una recta contenida tiene infinitos puntos comunes; una paralela, ninguno. Varios teoremas excluyen explícitamente el caso contenido.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm2l1e1', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'Si <var>r ∥ π</var> y <var>r</var> está contenida en un plano <var>σ</var> que corta a <var>π</var> en la recta <var>t</var>, entonces:',
        opciones: [
          { texto: '<span class="m">t ∥ r</span>', correcta: true },
          { texto: '<span class="m">t</span> corta a <var>r</var>' },
          { texto: '<span class="m">t</span> es perpendicular a <var>r</var>' },
          { texto: 'No se puede afirmar nada' }
        ],
        explicacion: 'Es el teorema de la intersección paralela. <var>t</var> y <var>r</var> son coplanares (ambas en <var>σ</var>); si se cortaran, el punto estaría en <var>π</var> y en <var>r</var>, contradiciendo <var>r ∥ π</var>.',
        pistas: ['¿En qué plano viven las dos rectas a la vez?', 'Si se cortaran, ¿dónde estaría el punto de corte?']
      },
      {
        id: 'm2l1e2', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'Para concluir que un plano <var>π</var> es paralelo a un plano <var>σ</var> basta comprobar que:',
        opciones: [
          { texto: '<var>π</var> contiene dos rectas secantes, ambas paralelas a <var>σ</var>', correcta: true },
          { texto: '<var>π</var> contiene una recta paralela a <var>σ</var>' },
          { texto: '<var>π</var> y <var>σ</var> contienen rectas paralelas entre sí' },
          { texto: '<var>π</var> contiene una recta paralela a una recta de <var>σ</var>' }
        ],
        explicacion: 'Con dos rectas secantes queda bloqueada cualquier posibilidad de giro: si los planos se cortaran, ambas rectas de <var>π</var> serían paralelas a la recta de intersección, lo que es imposible porque son secantes entre sí.',
        pistas: ['¿Qué hace falta para que un plano no pueda girar?', 'Con una sola recta paralela, el plano puede girar alrededor de ella.']
      },
      {
        id: 'm2l1e3', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'En un cubo de arista 2, <var>M</var> y <var>N</var> son los puntos medios de <span class="m">A₁B₁</span> y <span class="m">B₁C₁</span>. ¿Cuál es el área del triángulo <span class="m">MNB</span>?',
        unidad: 'u²', respuesta: 1.5, tolerancia: 0.01,
        explicacion: 'Con <span class="m">B(2,0,0)</span>, <span class="m">M(1,0,2)</span>, <span class="m">N(2,1,2)</span>: <span class="m">BM = √(1+0+4) = √5</span>, <span class="m">BN = √(0+1+4) = √5</span>, <span class="m">MN = √(1+1+0) = √2</span>. Triángulo isósceles: la altura desde <var>B</var> mide <span class="m">√(5 − (√2/2)²) = √(5 − 0,5) = √4,5 = 3/√2</span>. Área <span class="m">= ½·√2·3/√2 = 1,5</span>.',
        pistas: ['Pon coordenadas con <var>B</var> como origen de la cara.', 'Calcula los tres lados y usa la altura sobre el lado distinto.']
      },
      {
        id: 'm2l1e4', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'En un cubo, la recta <span class="m">AB</span> (arista inferior) y el plano de la cara superior <span class="m">A₁B₁C₁D₁</span>:',
        opciones: [
          { texto: 'Son paralelos', correcta: true },
          { texto: 'Se cortan en <var>A₁</var>' },
          { texto: 'La recta está contenida en el plano' },
          { texto: 'Son perpendiculares' }
        ],
        explicacion: 'La recta <span class="m">AB</span> es paralela a <span class="m">A₁B₁</span>, que está contenida en el plano superior. Por el criterio (CRP), <span class="m">AB</span> es paralela a ese plano. Además, <span class="m">AB</span> y el plano superior no tienen ningún punto en común.',
        pistas: ['Busca una recta del plano superior paralela a <span class="m">AB</span>.', 'Aplica el criterio recta-plano.']
      },
      {
        id: 'm2l1e5', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'Un plano paralelo a la base de un cubo de arista 3 lo corta a la altura 1 desde la base. ¿Cuál es el perímetro de la sección?',
        unidad: 'u', respuesta: 12, tolerancia: 0,
        explicacion: 'Un plano paralelo a una cara corta al cubo en un cuadrado congruente con la base: de lado 3 y perímetro 12. La altura del corte no influye en el tamaño porque las caras laterales son perpendiculares a la base.',
        pistas: ['¿Cómo es la sección de un prisma por un plano paralelo a las bases?', 'Es congruente con la base.']
      }
    ],
    retos: [
      {
        id: 'm2l1r1', titulo: 'Sección hexagonal paralela', nivel: 'UNI', puntos: 25,
        enunciado: 'En un cubo de arista <var>a</var>, sea <var>π</var> el plano que pasa por los puntos medios de las aristas <span class="m">AB</span>, <span class="m">BC</span>, <span class="m">CC₁</span>, <span class="m">C₁D₁</span>, <span class="m">D₁A₁</span> y <span class="m">A₁A</span> (seis puntos). Demuestra que los seis son coplanares y calcula el área de la sección.',
        estrategia: ['Demuestra la coplanariedad por pares de lados opuestos paralelos.', 'El hexágono resultante es regular: calcula su lado.', 'Usa <span class="m">A = (3√3/2)·s²</span> para el hexágono regular de lado <var>s</var>.'],
        desarrollo: [
          'Llamemos <span class="m">M, N, P, Q, R, S</span> a los puntos medios en el orden del enunciado. Los lados <span class="m">MN</span> y <span class="m">PQ</span> son paralelos a <span class="m">AC</span> y <span class="m">A₁C₁</span> respectivamente, y <span class="m">AC ∥ A₁C₁</span>; además ambos miden <span class="m">a√2/2</span>. Lo mismo ocurre con los otros dos pares de lados opuestos.',
          'Que tres pares de lados opuestos sean paralelos e iguales implica que los seis puntos son coplanares (cada par define un paralelogramo y los paralelogramos comparten planos).',
          'El lado del hexágono es la mitad de la diagonal de cara: <span class="m">s = (a√2)/2 = a/√2</span>.',
          'Área: <span class="m">A = (3√3/2)(a/√2)² = (3√3/2)(a²/2) = 3√3a²/4</span>.',
          'Comprobación con <span class="m">a = 2</span>: el lado es <span class="m">√2</span> y el área <span class="m">= (3√3/2)·2 = 3√3 ≈ 5,196</span>.'
        ],
        respuesta: 'Hexágono regular de lado <span class="m">a/√2</span> y área <span class="m">3√3a²/4</span>. Es la mayor sección hexagonal posible de un cubo.'
      }
    ]
  });

  /* ==========================================================
     M2 · L2 — Perpendicularidad
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm2l2',
    modulo: 'm2',
    titulo: 'Perpendicularidad recta-plano y plano-plano',
    resumen: 'El criterio de las dos rectas y el teorema de las tres perpendiculares.',
    objetivo: 'Decidir cuándo una recta es perpendicular a un plano y usar el teorema de las tres perpendiculares para calcular distancias y ángulos.',
    duracion: '28 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'Un lápiz apoyado en la mesa puede inclinarse en cualquier dirección; solo cuando queda «de pie» es perpendicular al plano. La condición precisa no es «forma 90° con una recta del plano», porque siempre hay rectas del plano perpendiculares a una recta inclinada: la condición correcta es formarlo con <strong>dos</strong> rectas del plano que pasen por el pie.' },
      { tipo: 'figura', figura: 'perpendicular-plano', indice: 'Figura: perpendicular al plano', titulo: 'Recta perpendicular a un plano', pie: 'La recta <span class="m">TO</span> forma 90° con <span class="m">OX</span> y con <span class="m">OY</span>, ambas contenidas en el plano. Entonces es perpendicular a <em>todas</em> las rectas del plano que pasan por <var>O</var>.' },
      {
        tipo: 'definicion', titulo: 'Recta perpendicular a un plano', indice: 'Definición',
        html: '<p>Una recta <var>r</var> es <strong>perpendicular</strong> a un plano <var>π</var> si es perpendicular a toda recta de <var>π</var> que pase por el punto <span class="m">P = r ∩ π</span>. El punto <var>P</var> se llama <strong>pie</strong> de la perpendicular.</p>' +
          '<p>Dos planos son <strong>perpendiculares</strong> si el ángulo diedro que forman es recto, es decir, si uno de ellos contiene una recta perpendicular al otro.</p>'
      },
      {
        tipo: 'teorema', titulo: 'Criterio de perpendicularidad recta-plano', indice: 'Criterio',
        enunciado: 'Si una recta <var>r</var> es perpendicular a dos rectas secantes <var>s</var> y <var>t</var> contenidas en un plano <var>π</var>, en el punto <span class="m">P = r ∩ π</span>, entonces <span class="m">r ⟂ π</span>.',
        justifica: 'Sea <var>u</var> una recta cualquiera de <var>π</var> que pase por <var>P</var>. Hay que probar que <var>r ⟂ u</var>. Se elige un punto <var>A</var> en <var>r</var>, y una recta auxiliar de <var>π</var> que corte a <var>s</var>, <var>t</var> y <var>u</var> en <var>S</var>, <var>T</var>, <var>U</var> respectivamente. Comparando los triángulos rectángulos con cateto común <span class="m">AP</span> se deduce <span class="m">AS = AT</span> y luego <span class="m">AU</span> es perpendicular a <span class="m">AP</span>. Es el argumento clásico de la geometría griega, basado en congruencia de triángulos.'
      },
      {
        tipo: 'teorema', titulo: 'Teorema de las tres perpendiculares (T3P)', indice: 'Tres perpendiculares',
        enunciado: 'Sea <var>π</var> un plano, <var>A</var> un punto exterior, <var>O</var> su proyección ortogonal sobre <var>π</var>. Si <var>r</var> es una recta de <var>π</var> y <var>M</var> es el pie de la perpendicular desde <var>O</var> a <var>r</var>, entonces <span class="m">AM ⟂ r</span>. Recíprocamente, si <span class="m">AM ⟂ r</span> entonces <span class="m">OM ⟂ r</span>.',
        justifica: '<span class="m">AO ⟂ π</span> implica <span class="m">AO ⟂ r</span> (pues <span class="m">r</span> ⊂ <var>π</var> y pasa por <var>M</var>… más precisamente, por el criterio, <span class="m">AO</span> es perpendicular a toda recta de <var>π</var> que pase por <var>O</var>, y la paralela a <var>r</var> por <var>O</var> lo es). Además <span class="m">OM ⟂ r</span>. Así <var>r</var> es perpendicular a dos rectas secantes del plano <span class="m">(AOM)</span>, luego <span class="m">r ⟂</span> plano <span class="m">(AOM)</span>, y por tanto <span class="m">r ⟂ AM</span>.'
      },
      {
        tipo: 'nota', variante: 'dato',
        html: '<p><strong>Por qué importa el T3P.</strong> Convierte un problema de perpendicularidad en el espacio en un problema de triángulo rectángulo en un plano. Es la herramienta que permite calcular alturas, apotemas y ángulos diedros sin vectores.</p>'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo resuelto',
        titulo: 'La diagonal del cubo es perpendicular a un plano',
        enunciado: 'En el cubo <span class="m">ABCD-A₁B₁C₁D₁</span> de arista <var>a</var>, demuestra que la diagonal <span class="m">AC₁</span> es perpendicular al plano <span class="m">A₁BD</span> y calcula el volumen del tetraedro <span class="m">A₁BD A</span>.',
        pasos: [
          { titulo: 'Simetría antes que cálculo', html: 'Por simetría de las tres direcciones del cubo, <span class="m">AC₁</span> debe relacionarse igual con los tres vértices <span class="m">A₁</span>, <var>B</var>, <var>D</var>. Basta probar la perpendicularidad con dos rectas secantes del plano.' },
          { titulo: 'Primera perpendicularidad', html: 'Considera <span class="m">BD</span>. En la base, <span class="m">AC ⟂ BD</span> (diagonales del cuadrado). Además <span class="m">CC₁ ⟂</span> base, luego <span class="m">CC₁ ⟂ BD</span>. Así <span class="m">BD ⟂</span> plano <span class="m">(ACC₁A₁)</span>, y por tanto <span class="m">BD ⟂ AC₁</span>, que está en ese plano.', cuenta: 'BD ⟂ AC  y  BD ⟂ CC₁  ⟹  BD ⟂ plano (ACC₁A₁)  ⟹  BD ⟂ AC₁' },
          { titulo: 'Segunda perpendicularidad', html: 'Ahora toma <span class="m">A₁B</span>. Con <span class="m">A(0,0,0)</span>, <span class="m">A₁(0,0,a)</span>, <span class="m">B(a,0,0)</span> y <span class="m">C₁(a,a,a)</span>: <span class="m">A₁B = (a, 0, −a)</span> y <span class="m">AC₁ = (a,a,a)</span>. El producto escalar es <span class="m">a² + 0 − a² = 0</span>, luego <span class="m">A₁B ⟂ AC₁</span>.', cuenta: '(a,0,−a)·(a,a,a) = a² + 0 − a² = 0' },
          { titulo: 'Conclusión', html: '<span class="m">AC₁</span> es perpendicular a <span class="m">BD</span> y a <span class="m">A₁B</span>, dos rectas del plano <span class="m">(A₁BD)</span> que se cortan en <var>B</var>. Por el criterio de perpendicularidad, <span class="m">AC₁ ⟂ (A₁BD)</span>.' },
          { titulo: 'Volumen del tetraedro', html: 'El tetraedro <span class="m">A A₁BD</span> tiene base <span class="m">A₁BD</span>, un triángulo equilátero de lado <span class="m">a√2</span>, y altura igual a la distancia de <var>A</var> al plano <span class="m">(A₁BD)</span>. Con coordenadas: el plano <span class="m">(A₁BD)</span> es <span class="m">x + y + z = a</span> y la distancia desde <span class="m">A(0,0,0)</span> es <span class="m">a/√3</span>. Área de la base: <span class="m">(√3/4)(2a²) = a²√3/2</span>.', cuenta: 'V = (1/3)·(a²√3/2)·(a/√3) = a³/6' }
        ],
        respuesta: '<span class="m">AC₁ ⟂ plano A₁BD</span> y <span class="m">V = a³/6</span>, es decir, la sexta parte del volumen del cubo. El punto donde <span class="m">AC₁</span> corta al plano divide a la diagonal en la razón <span class="m">1 : 2</span>.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: '«<var>r</var> es perpendicular al plano porque forma 90° con una recta del plano».', bien: 'Comprobar la perpendicularidad con dos rectas secantes del plano por el pie.', porque: 'Cualquier recta inclinada forma 90° con alguna recta del plano (la perpendicular a su proyección), así que una sola no distingue la vertical de la inclinada.' },
          { mal: 'Usar el T3P cuando el punto <var>M</var> no es perpendicular al pie.', bien: 'Identificar <var>O</var> (proyección de <var>A</var>) y <var>M</var> (pie de la perpendicular desde <var>O</var> a la recta).', porque: 'El teorema exige esa cadena de dos perpendiculares; si se aplica a un punto arbitrario de la recta, la conclusión falla.' },
          { mal: 'Confundir «perpendicular» con «ortogonal» para rectas que no se cortan.', bien: 'Decir: son ortogonales porque sus direcciones son perpendiculares, aunque sean alabeadas.', porque: 'En el espacio, dos rectas ortogonales pueden ser alabeadas. Muchos textos usan «perpendiculares» de forma laxa; conviene saber la distinción.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm2l2e1', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'Una recta <var>r</var> es perpendicular a un plano <var>π</var> si:',
        opciones: [
          { texto: 'Es perpendicular a dos rectas secantes de <var>π</var> que pasan por su pie', correcta: true },
          { texto: 'Es perpendicular a una recta de <var>π</var>' },
          { texto: 'Es perpendicular a dos rectas paralelas de <var>π</var>' },
          { texto: 'No corta a <var>π</var>' }
        ],
        explicacion: 'Dos rectas secantes bloquean todas las direcciones del plano. Dos rectas paralelas no: solo fijan una dirección, y la recta podría seguir inclinada respecto de las demás direcciones del plano.',
        pistas: ['¿Cuántas direcciones independientes tiene un plano?', '¿Dos rectas paralelas fijan dos direcciones o una sola?']
      },
      {
        id: 'm2l2e2', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'En un cubo de arista 2, ¿cuál es la distancia del vértice <var>A</var> al plano <span class="m">A₁BD</span>?',
        unidad: 'u', respuesta: 1.1547, tolerancia: 0.01,
        explicacion: 'El plano por <span class="m">A₁(0,0,2)</span>, <span class="m">B(2,0,0)</span>, <span class="m">D(0,2,0)</span> es <span class="m">x + y + z = 2</span>. La distancia desde <span class="m">A(0,0,0)</span> es <span class="m">|0 + 0 + 0 − 2| / √3 = 2/√3 = 2√3/3 ≈ 1,1547</span>.',
        pistas: ['Escribe la ecuación del plano. Con tres cortes en los ejes es inmediata.', 'Usa <span class="m">d = |ax₀ + by₀ + cz₀ + d| / √(a² + b² + c²)</span>.']
      },
      {
        id: 'm2l2e3', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'En el teorema de las tres perpendiculares, si <var>O</var> es la proyección de <var>A</var> sobre <var>π</var> y <span class="m">OM ⟂ r</span> con <span class="m">r ⊂ π</span>, se concluye que:',
        opciones: [
          { texto: '<span class="m">AM ⟂ r</span>', correcta: true },
          { texto: '<span class="m">AM ∥ r</span>' },
          { texto: '<span class="m">AO ⟂ AM</span>' },
          { texto: '<span class="m">M</span> es el punto medio de <var>r</var>' }
        ],
        explicacion: 'La recta <var>r</var> es perpendicular a <span class="m">AO</span> (porque <span class="m">AO ⟂ π</span>) y a <span class="m">OM</span> (hipótesis), luego es perpendicular al plano <span class="m">(AOM)</span> y por tanto a toda recta de ese plano, en particular a <span class="m">AM</span>.',
        pistas: ['¿A qué rectas es perpendicular <var>r</var> por hipótesis?', 'Si <var>r</var> es perpendicular a dos rectas secantes del plano <span class="m">(AOM)</span>, es perpendicular al plano.']
      },
      {
        id: 'm2l2e4', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'En un cubo de arista 3, <var>M</var> es el punto medio de <span class="m">BC</span>. ¿Cuál es la longitud de <span class="m">A₁M</span>?',
        unidad: 'u', respuesta: 4.5, tolerancia: 0.01,
        explicacion: 'Con <span class="m">A₁(0,0,3)</span> y <span class="m">M(3, 1.5, 0)</span>: <span class="m">A₁M = √(9 + 2,25 + 9) = √20,25 = 4,5</span>. También se ve con el T3P: la proyección de <span class="m">A₁</span> es <var>A</var>, <span class="m">AM = √(9 + 2,25) = √11,25</span>, y <span class="m">A₁M = √(11,25 + 9) = 4,5</span>.',
        pistas: ['Proyecta <span class="m">A₁</span> sobre la base: cae en <var>A</var>.', 'Calcula primero <span class="m">AM</span> en la base y luego aplica Pitágoras con la altura.']
      },
      {
        id: 'm2l2e5', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'Dos planos son perpendiculares cuando:',
        opciones: [
          { texto: 'Uno de ellos contiene una recta perpendicular al otro', correcta: true },
          { texto: 'Están a distancia constante', correcta: false },
          { texto: 'Nunca se cortan' },
          { texto: 'Contienen rectas perpendiculares entre sí' }
        ],
        explicacion: 'La definición operativa es la que se puede comprobar: si <var>π</var> contiene una recta perpendicular a <var>σ</var>, el diedro es recto. Planteada en términos del ángulo entre normales, equivale a que los vectores normales sean perpendiculares.',
        pistas: ['Piensa en una pared y el suelo.', '¿Qué recta del suelo es perpendicular a la pared?']
      }
    ],
    retos: [
      {
        id: 'm2l2r1', titulo: 'Punto de la diagonal y plano', nivel: 'UNI', puntos: 25,
        enunciado: 'En un cubo de arista <var>a</var>, la diagonal <span class="m">AC₁</span> corta al plano <span class="m">A₁BD</span> en un punto <var>P</var>. Halla <span class="m">AP : PC₁</span> y el volumen del tetraedro <span class="m">P A₁BD</span>.',
        estrategia: ["Parametriza AC₁ y halla su intersección P con A₁BD.","Recuerda que un tetraedro con cuatro puntos coplanares tiene volumen cero.","Compara con el tetraedro no degenerado AA₁BD para comprobar el significado de altura."],
        desarrollo: ["Con <span class=\"m\">A(0,0,0)</span> y <span class=\"m\">C₁(a,a,a)</span>, la diagonal cumple <span class=\"m\">(x,y,z)=(ta,ta,ta)</span>, donde <span class=\"m\">0≤t≤1</span>.","El plano <span class=\"m\">A₁BD</span> tiene ecuación <span class=\"m\">x+y+z=a</span>. Sustituye la diagonal: <span class=\"m\">3ta=a</span>, por lo que <span class=\"m\">t=1/3</span> y <span class=\"m\">AP:PC₁=1:2</span>.","El punto <var>P</var> está en el plano de <span class=\"m\">A₁BD</span> y coincide con el baricentro del triángulo A₁BD.","El tetraedro <span class=\"m\">PA₁BD</span> es degenerado: su altura sobre la base <span class=\"m\">A₁BD</span> es cero. En consecuencia, <span class=\"m\">V(PA₁BD)=0</span>.","En cambio, <span class=\"m\">AA₁BD</span> tiene área de base <span class=\"m\">a²√3/2</span> y distancia del vértice A al plano <span class=\"m\">a/√3</span>; su volumen es <span class=\"m\">(1/3)(a²√3/2)(a/√3)=a³/6</span>."],
        respuesta: "<span class=\"m\">AP:PC₁=1:2</span> y <strong><span class=\"m\">V(PA₁BD)=0</span></strong>. El punto P pertenece a la base; no debe confundirse con el volumen <span class=\"m\">V(AA₁BD)=a³/6</span>."
      }
    ]
  });

  /* ==========================================================
     M3 · L1 — Ángulos entre rectas y recta-plano
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm3l1',
    modulo: 'm3',
    titulo: 'Ángulos entre rectas y entre recta y plano',
    resumen: 'Trasladar para medir, y proyectar para el ángulo con un plano.',
    objetivo: 'Calcular el ángulo entre dos rectas (incluidas las alabeadas) y el ángulo entre una recta y un plano, usando proyecciones y trigonometría.',
    duracion: '26 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'Un ángulo necesita un vértice, es decir, un punto común. Si dos rectas son alabeadas no lo tienen, así que <strong>no se puede medir el ángulo entre ellas directamente</strong>: hay que trasladar una paralela hasta que corte a la otra. El ángulo trasladado es el mismo porque el paralelismo conserva direcciones.' },
      {
        tipo: 'definicion', titulo: 'Ángulo entre dos rectas', indice: 'Definición (rectas)',
        html: '<p>Dadas dos rectas <var>r</var> y <var>s</var> (secantes, paralelas o alabeadas), se toma un punto arbitrario <var>P</var> y se trazan por él las rectas <span class="m">r′ ∥ r</span> y <span class="m">s′ ∥ s</span>. El <strong>ángulo entre <var>r</var> y <var>s</var></strong> es el ángulo que forman <span class="m">r′</span> y <span class="m">s′</span>. Se toma siempre el menor de los dos ángulos, de modo que el resultado está en <span class="m">[0°, 90°]</span>.</p>' +
          '<p>Si el ángulo es 90°, las rectas se llaman <strong>perpendiculares</strong> u <strong>ortogonales</strong> (aunque sean alabeadas). El resultado no depende de la elección de <var>P</var>: trasladar una recta paralelamente a sí misma no cambia las direcciones.</p>'
      },
      {
        tipo: 'formulas', titulo: 'Cálculo con vectores directores', indice: 'Fórmulas',
        items: [
          { f: 'cos θ = |u · v| / (|u|·|v|)', desc: 'Ángulo entre dos rectas de vectores directores u y v. El valor absoluto asegura que θ ∈ [0°, 90°].' },
          { f: 'cos θ = |u · v| / (|u|·|v|)', desc: 'Mismo cálculo para el ángulo entre los planos de normales u y v, o entre una recta y la normal de un plano.' },
          { f: 'sen θ = |u · n| / (|u|·|n|)', desc: 'Ángulo θ entre la recta de vector u y el plano de normal n. Es el complemento del ángulo entre la recta y la normal.' }
        ]
      },
      {
        tipo: 'nota', variante: 'ojo',
        html: '<p><strong>El error más caro.</strong> Entre recta y plano se usa <strong>seno</strong>, no coseno. Motivo: el ángulo con el plano y el ángulo con la normal suman 90°, y <span class="m">cos(90° − θ) = sen θ</span>. Si usas coseno obtendrás el ángulo complementario, y en una opción múltiple muchas veces está presente como distractor.</p>'
      },
      { tipo: 'figura', figura: 'recta-plano-angulo', indice: 'Figura: recta y plano', titulo: 'El ángulo se mide sobre la proyección', pie: 'El ángulo entre <span class="m">AB</span> y el plano es el ángulo <span class="m">BAB′</span>, donde <span class="m">B′</span> es la proyección ortogonal de <var>B</var>. El triángulo <span class="m">ABB′</span> es rectángulo en <span class="m">B′</span>, y eso permite calcularlo con trigonometría plana.' },
      {
        tipo: 'definicion', titulo: 'Ángulo entre recta y plano', indice: 'Definición (recta-plano)',
        html: '<p>Sea <var>r</var> una recta que corta al plano <var>π</var> en <var>A</var>, y sea <var>B</var> otro punto de <var>r</var> con proyección ortogonal <span class="m">B′</span> sobre <var>π</var>. El <strong>ángulo entre <var>r</var> y <var>π</var></strong> es el ángulo <span class="m">∠BAB′</span>.</p>' +
          '<p>Si <var>r ⊂ π</var>, el ángulo es 0°. Si <span class="m">r ⟂ π</span>, el ángulo es 90°. En el triángulo rectángulo <span class="m">ABB′</span> se tiene <span class="m">sen θ = BB′ / AB</span> y <span class="m">tan θ = BB′ / AB′</span>.</p>'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo resuelto',
        titulo: 'Dos ángulos en el mismo cubo',
        enunciado: 'En un cubo de arista <var>a</var>: (a) halla el ángulo entre las rectas alabeadas <span class="m">AB₁</span> y <span class="m">BC₁</span>; (b) halla el ángulo entre la diagonal <span class="m">AC₁</span> y el plano de la base.',
        pasos: [
          { titulo: '(a) Vectores directores', html: 'Con <span class="m">A(0,0,0)</span>, <span class="m">B(a,0,0)</span>, <span class="m">B₁(a,0,a)</span>, <span class="m">C₁(a,a,a)</span>: <span class="m">AB₁ = (a,0,a)</span>, <span class="m">BC₁ = (0,a,a)</span>.' },
          { titulo: '(a) Producto escalar', html: '<span class="m">u·v = 0 + 0 + a² = a²</span>, <span class="m">|u| = |v| = a√2</span>.', cuenta: 'cos θ = a²/(a√2·a√2) = a²/(2a²) = 1/2  ⟹  θ = 60°' },
          { titulo: '(a) Interpretación geométrica', html: 'La recta <span class="m">AD₁</span> es paralela a <span class="m">BC₁</span>. Trasladando, el ángulo es el del triángulo <span class="m">AB₁D₁</span>, que resulta equilátero: sus tres lados son diagonales de cara, <span class="m">a√2</span>. De ahí el 60° sin necesidad de vectores.' },
          { titulo: '(b) Proyección de la diagonal', html: 'La proyección de <span class="m">AC₁</span> sobre la base es <span class="m">AC</span>, cuya longitud es <span class="m">a√2</span>. La altura es <span class="m">CC₁ = a</span>.', cuenta: 'tan θ = a / (a√2) = 1/√2  ⟹  θ = arctan(1/√2) ≈ 35,26°' },
          { titulo: '(b) Comprobación', html: '<span class="m">sen θ = a / (a√3) = 1/√3 ≈ 0,5774</span>. Y <span class="m">arcsen(0,5774) ≈ 35,26°</span>: coincide. El ángulo entre la diagonal del cubo y una cara nunca es 45°.' }
        ],
        respuesta: '(a) <span class="m">60°</span>. (b) <span class="m">θ = arctan(1/√2) ≈ 35,26°</span>. La diagonal del cubo forma con la base el mismo ángulo que con cualquiera de las tres caras que concurren en el vértice opuesto.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Usar cos θ para el ángulo entre recta y plano.', bien: 'Usar <span class="m">sen θ = BB′/AB</span> o la fórmula con la normal.', porque: 'El ángulo con el plano es el complemento del ángulo con la normal; confundirlos da el valor complementario.' },
          { mal: 'Medir el ángulo entre alabeadas en el punto donde «parecen» cortarse en el dibujo.', bien: 'Trasladar una paralela a un punto de la otra recta.', porque: 'El dibujo en perspectiva no conserva ángulos; la traslación sí conserva direcciones.' },
          { mal: 'Dar un ángulo mayor de 90° entre dos rectas.', bien: 'Tomar siempre el menor de los dos ángulos suplementarios.', porque: 'Por convención, el ángulo entre rectas está en <span class="m">[0°, 90°]</span>. En cambio, entre dos planos también se toma el menor, pero entre un vector y otro puede ser obtuso.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm3l1e1', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'En un cubo, ¿cuál es el ángulo entre la diagonal espacial y una arista que no la corta? Usa <span class="m">cos θ = 1/√3</span> y expresa el resultado en grados con un decimal.',
        unidad: 'grados', respuesta: 54.7, tolerancia: 0.2,
        explicacion: 'La diagonal <span class="m">AC₁</span> tiene vector <span class="m">(a,a,a)</span>; una arista, por ejemplo <span class="m">(a,0,0)</span>. <span class="m">cos θ = a²/(a√3·a) = 1/√3 ≈ 0,5774</span> → <span class="m">θ ≈ 54,7°</span>. Es el ángulo que forma la diagonal con cada una de las tres aristas que salen del vértice opuesto.',
        pistas: ['Elige coordenadas y dos vectores directores.', 'cos θ = |u·v|/(|u||v|).']
      },
      {
        id: 'm3l1e2', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'El ángulo entre una recta y un plano se calcula como:',
        opciones: [
          { texto: 'El ángulo entre la recta y su proyección ortogonal sobre el plano', correcta: true },
          { texto: 'El ángulo entre la recta y la normal al plano' },
          { texto: 'El ángulo entre la recta y cualquier recta del plano' },
          { texto: 'El complemento del ángulo entre la recta y una arista del plano' }
        ],
        explicacion: 'La definición usa la proyección ortogonal. El ángulo con la normal es su complementario; el ángulo con «cualquier recta del plano» no está bien definido, porque depende de la recta elegida.',
        pistas: ['¿Qué sombra proyecta la recta sobre el plano?', 'La definición debe ser independiente de elecciones arbitrarias.']
      },
      {
        id: 'm3l1e3', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'Dos rectas alabeadas con vectores directores <span class="m">u = (1, 2, 2)</span> y <span class="m">v = (2, −2, 1)</span>:',
        opciones: [
          { texto: 'Son ortogonales', correcta: true },
          { texto: 'Forman 45°' },
          { texto: 'Forman 60°' },
          { texto: 'Son paralelas' }
        ],
        explicacion: '<span class="m">u·v = 2 − 4 + 2 = 0</span>. El producto escalar nulo indica direcciones perpendiculares, y como son alabeadas se dice que son ortogonales. Sus módulos son ambos 3, pero eso no hace falta para la conclusión.',
        pistas: ['Calcula el producto escalar.', 'Si el producto escalar es 0, ¿qué ángulo hay entre las direcciones?']
      },
      {
        id: 'm3l1e4', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'En un cubo de arista 6, <var>M</var> es el punto medio de <span class="m">A₁B₁</span>. ¿Cuál es el ángulo, en grados, entre la recta <span class="m">MC</span> y el plano de la base? Aproxima a un decimal.',
        unidad: 'grados', respuesta: 41.8, tolerancia: 0.3,
        explicacion: 'Con <span class="m">A(0,0,0)</span>, <span class="m">B(6,0,0)</span>, <span class="m">C(6,6,0)</span>, <span class="m">A₁(0,0,6)</span> y <span class="m">B₁(6,0,6)</span> se tiene <span class="m">M(3,0,6)</span>. Su proyección sobre la base es <span class="m">M′(3,0,0)</span>, y la proyección de <span class="m">MC</span> es <span class="m">M′C = (3,6,0)</span>, de longitud <span class="m">√45 = 3√5 ≈ 6,708</span>. La componente vertical es 6, así que <span class="m">tan θ = 6/(3√5) = 2/√5 ≈ 0,8944</span> y <span class="m">θ ≈ 41,8°</span>.',
        pistas: ['Proyecta <var>M</var> sobre la base: cae en el punto medio de <span class="m">AB</span>.', 'Calcula la distancia horizontal entre esa proyección y <var>C</var>, y usa la tangente con la altura.']
      },
      {
        id: 'm3l1e5', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'Si dos rectas son perpendiculares a un mismo plano, entonces:',
        opciones: [
          { texto: 'Son paralelas entre sí', correcta: true },
          { texto: 'Son alabeadas' },
          { texto: 'Se cortan necesariamente' },
          { texto: 'Forman 45°' }
        ],
        explicacion: 'Ambas tienen la dirección de la normal al plano, así que sus vectores directores son paralelos. Por tanto las rectas son paralelas (o coincidentes). Es un resultado muy útil para justificar alturas paralelas en prismas y pirámides.',
        pistas: ['¿Cuántas direcciones perpendiculares a un plano hay?', 'Dos rectas con la misma dirección son paralelas o coincidentes.']
      }
    ],
    retos: [
      {
        id: 'm3l1r1', titulo: 'Ángulo entre dos diagonales de cara', nivel: 'UNI', puntos: 25,
        enunciado: 'En un cubo de arista <var>a</var>, considera las diagonales <span class="m">AC₁</span> (espacial) y <span class="m">BD</span> (de la base). Halla el ángulo entre ellas y comprueba que son perpendiculares.',
        estrategia: ['Elige coordenadas con un vértice en el origen.', 'Calcula vectores directores y su producto escalar.', 'Interpreta geométricamente el resultado.'],
        desarrollo: [
          '<span class="m">A(0,0,0)</span>, <span class="m">C₁(a,a,a)</span> → <span class="m">u = (a,a,a)</span>. <span class="m">B(a,0,0)</span>, <span class="m">D(0,a,0)</span> → <span class="m">v = (−a,a,0)</span>.',
          '<span class="m">u·v = −a² + a² + 0 = 0</span>.',
          'Como el producto escalar es nulo, las direcciones son perpendiculares: el ángulo es 90°.',
          'Interpretación: la diagonal espacial es perpendicular a la diagonal de la base que no la corta. Esto es coherente con el resultado de la lección anterior: <span class="m">AC₁ ⟂</span> plano <span class="m">(A₁BD)</span>, y <span class="m">BD</span> está en ese plano, luego es perpendicular a <span class="m">BD</span>.'
        ],
        respuesta: '<span class="m">90°</span>. Las rectas son ortogonales (alabeadas, pues no se cortan). La segunda vía —usar que <span class="m">AC₁</span> es perpendicular al plano <span class="m">A₁BD</span>— es más elegante y no requiere coordenadas.'
      }
    ]
  });

  /* ==========================================================
     M3 · L2 — Diedros y ángulo entre planos
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm3l2',
    modulo: 'm3',
    titulo: 'Diedros y ángulo entre planos',
    resumen: 'El ángulo entre planos se mide en un plano perpendicular a la arista.',
    objetivo: 'Medir diedros, calcular el ángulo entre dos planos y aplicarlo a sólidos como el tetraedro y el cubo.',
    duracion: '24 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'Dos planos secantes forman cuatro regiones. La abertura de esas regiones es el <strong>diedro</strong>. Para medirlo hay que colocarse «de canto» respecto de la arista: se traza un plano perpendicular a la arista, y allí el diedro se ve como un ángulo plano corriente, el <strong>ángulo rectilíneo</strong>.' },
      {
        tipo: 'definicion', titulo: 'Diedro y ángulo rectilíneo', indice: 'Definición',
        html: '<p>Un <strong>diedro</strong> está formado por dos semiplanos con una recta común llamada <strong>arista</strong>. Para medirlo se toma un plano <var>σ</var> perpendicular a la arista; la intersección de <var>σ</var> con los semiplanos son dos semirrectas que forman el <strong>ángulo rectilíneo</strong> del diedro. Su medida no depende de dónde se sitúe <var>σ</var> a lo largo de la arista.</p>' +
          '<p>El <strong>ángulo entre dos planos</strong> es el menor de los ángulos rectilíneos que forman, y está en <span class="m">[0°, 90°]</span>.</p>'
      },
      {
        tipo: 'teorema', titulo: 'Ángulo entre planos y sus normales', indice: 'Teorema',
        enunciado: 'El ángulo entre dos planos es igual al ángulo entre sus rectas normales.',
        justifica: 'Sean <span class="m">n₁</span> y <span class="m">n₂</span> las normales. El ángulo entre los planos y el ángulo entre <span class="m">n₁</span> y <span class="m">n₂</span> son iguales o suplementarios: al girar 90° ambas direcciones, la abertura se conserva. Tomando el menor de los dos, coinciden. De ahí <span class="m">cos θ = |n₁·n₂| / (|n₁||n₂|)</span>.'
      },
      { tipo: 'figura', figura: 'triedro', indice: 'Figura: diedros de un triedro', titulo: 'Tres diedros en un triedro', pie: 'En un triedro trirrectángulo los tres diedros miden 90°. En un triedro general, cada par de caras define un diedro distinto.' },
      {
        tipo: 'ejemplo', indice: 'Ejemplo resuelto',
        titulo: 'Diedro entre dos caras de un tetraedro regular',
        enunciado: 'Halla el ángulo diedro entre dos caras de un tetraedro regular de arista <var>a</var>.',
        pasos: [
          { titulo: 'Cortar por un plano perpendicular a la arista', html: 'Toma la arista <span class="m">AB</span> y el plano perpendicular a <span class="m">AB</span> en su punto medio <var>M</var>. Ese plano corta a las dos caras que contienen <span class="m">AB</span> en segmentos que forman el ángulo rectilíneo.' },
          { titulo: 'Identificar los dos segmentos', html: 'En la cara <span class="m">ABC</span>, el segmento es la mediana <span class="m">MC</span>, de longitud <span class="m">m = a√3/2</span>. En la cara <span class="m">ABD</span>, es <span class="m">MD</span>, también <span class="m">a√3/2</span>. Ambos son perpendiculares a <span class="m">AB</span>.' },
          { titulo: 'Triángulo rectilíneo', html: 'El ángulo rectilíneo <span class="m">θ = ∠CMD</span> se calcula en el triángulo isósceles <span class="m">MCD</span>, con <span class="m">MC = MD = a√3/2</span> y <span class="m">CD = a</span>.' },
          { titulo: 'Ley del coseno', html: '', cuenta: 'cos θ = (m² + m² − a²)/(2m²) = (2·(3a²/4) − a²)/(2·(3a²/4)) = (a²/2)/(3a²/2) = 1/3' },
          { titulo: 'Valor numérico', html: '<span class="m">θ = arccos(1/3) ≈ 70,53°</span>. El suplementario es <span class="m">109,47°</span>, que es el ángulo entre los semiplanos que contienen el interior del sólido.' }
        ],
        respuesta: '<span class="m">cos θ = 1/3</span>, es decir <span class="m">θ ≈ 70,53°</span>. Este valor aparece también en el ángulo entre las caras de un octaedro regular y es un dato clásico en exámenes de admisión.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Medir el diedro con dos rectas arbitrarias, una en cada plano.', bien: 'Usar dos rectas perpendiculares a la arista en el mismo punto.', porque: 'Solo si ambas son perpendiculares a la arista el ángulo coincide con el rectilíneo; en otro caso el resultado depende de las rectas elegidas.' },
          { mal: 'Confundir el ángulo entre planos con el ángulo entre dos aristas del sólido.', bien: 'Identificar las caras (planos) y su arista común.', porque: 'El ángulo entre aristas mide direcciones; el diedro mide aberturas de planos. En un cubo, las aristas dan 90° y los diedros también, lo que oculta el error… hasta que aparece un sólido oblicuo.' },
          { mal: 'Dar 109,47° como ángulo entre planos.', bien: 'Dar 70,53°, el menor.', porque: 'El ángulo entre planos se define como el menor de los dos suplementarios.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm3l2e1', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'El ángulo rectilíneo de un diedro se obtiene cortando el diedro con:',
        opciones: [
          { texto: 'Un plano perpendicular a la arista', correcta: true },
          { texto: 'Un plano paralelo a la arista' },
          { texto: 'Un plano que contenga la arista' },
          { texto: 'Cualquier plano' }
        ],
        explicacion: 'Solo un plano perpendicular a la arista produce dos semirrectas perpendiculares a ella, y por tanto una medida independiente del punto de corte. Si el plano es oblicuo, el ángulo obtenido varía.',
        pistas: ['¿Qué condición hace que la medida no dependa de dónde cortemos?', 'Piensa en «ver el diedro de canto».']
      },
      {
        id: 'm3l2e2', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'En un tetraedro regular de arista 6, ¿cuánto vale <span class="m">cos θ</span> del diedro entre dos caras? Usa el desarrollo de la lección.',
        unidad: '(adimensional)', respuesta: 0.3333, tolerancia: 0.01,
        explicacion: 'El resultado <span class="m">cos θ = 1/3</span> no depende de la arista. Con <span class="m">a = 6</span>: <span class="m">m = 3√3 ≈ 5,196</span> y <span class="m">cos θ = (2·27 − 36)/(2·27) = 18/54 = 1/3</span>. El ángulo es <span class="m">≈ 70,53°</span>.',
        pistas: ['La mediana de una cara equilátera mide <span class="m">a√3/2</span>.', 'Aplica la ley del coseno en el triángulo isósceles de lados <span class="m">m, m, a</span>.']
      },
      {
        id: 'm3l2e3', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'Dos planos tienen normales <span class="m">n₁ = (1, 0, 0)</span> y <span class="m">n₂ = (1, 1, 0)</span>. ¿Cuál es el ángulo entre los planos, en grados?',
        unidad: 'grados', respuesta: 45, tolerancia: 0.5,
        explicacion: '<span class="m">n₁·n₂ = 1</span>, <span class="m">|n₁| = 1</span>, <span class="m">|n₂| = √2</span>. Entonces <span class="m">cos θ = 1/√2</span> y <span class="m">θ = 45°</span>. Geométricamente: uno es el plano <span class="m">x = c</span> y el otro un plano bisector.',
        pistas: ['Usa <span class="m">cos θ = |n₁·n₂|/(|n₁||n₂|)</span>.', 'El producto escalar vale 1 y los módulos son 1 y √2.']
      },
      {
        id: 'm3l2e4', tipo: 'opcion', dificultad: 'Avanzado',
        pregunta: 'En un cubo, el ángulo entre el plano de una cara y un plano diagonal (que contiene dos aristas opuestas) es:',
        opciones: [
          { texto: '45°', correcta: true },
          { texto: '30°' },
          { texto: '60°' },
          { texto: '90°' }
        ],
        explicacion: 'El plano diagonal que contiene las aristas <span class="m">AB</span> y <span class="m">D₁C₁</span> tiene ecuación <span class="m">y = z</span>, es decir, normal <span class="m">(0, 1, −1)</span>. La base tiene normal <span class="m">(0, 0, 1)</span>. Entonces <span class="m">cos θ = |(0,1,−1)·(0,0,1)| / (√2 · 1) = 1/√2</span>, luego <span class="m">θ = 45°</span>. Geométricamente: al cortar por un plano perpendicular a la arista común <span class="m">AB</span>, la sección es un rectángulo de lados <span class="m">a</span> y <span class="m">a√2</span>, y su diagonal forma 45° con la base.',
        pistas: ['Corta el cubo con un plano perpendicular a la arista común.', 'La sección es un rectángulo cuya diagonal forma 45° con la base.']
      },
      {
        id: 'm3l2e5', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'Si dos planos son perpendiculares, ¿qué se cumple?',
        opciones: [
          { texto: 'Uno de ellos contiene una recta perpendicular al otro', correcta: true },
          { texto: 'Son paralelos a una misma recta' },
          { texto: 'No tienen arista común' },
          { texto: 'Sus normales son paralelas' }
        ],
        explicacion: 'Es la definición operativa y el criterio que se usa en la práctica. Equivalentemente: el diedro mide 90°, o los vectores normales son perpendiculares (no paralelos).',
        pistas: ['Piensa en una pared y el suelo.', '¿Qué relación tienen las normales de dos planos perpendiculares?']
      }
    ],
    retos: [
      {
        id: 'm3l2r1', titulo: 'Diedro en una pirámide cuadrangular regular', nivel: 'UNI', puntos: 25,
        enunciado: "Una pirámide recta de base cuadrada tiene lado 6 y altura 4. Calcula el ángulo agudo entre los <strong>planos que contienen dos caras laterales opuestas</strong> y el ángulo entre una cara lateral y la base. Nota: las caras opuestas no comparten arista, por lo que no forman un diedro del poliedro.",
        estrategia: ['Separa los dos diedros: cara-base y cara-cara.', 'Para cara-base usa el triángulo rectángulo formado por la altura, la apotema de la base y la apotema de la pirámide.', 'Para cara-cara, corta por el plano perpendicular a la arista común de las dos caras.'],
        desarrollo: ["La apotema de cada cara lateral mide <span class=\"m\">m=√(4²+3²)=5</span>.","En la sección perpendicular a un lado de la base, <span class=\"m\">tan α=4/3</span>, así que el ángulo entre cara y base es <span class=\"m\">α≈53,13°</span>.","Prolonga los planos de dos caras laterales opuestas. En la sección perpendicular a sus lados de base, las dos apotemas miden 5 y parten del vértice con componentes horizontales opuestas ±3 y componente vertical 4.","El ángulo agudo entre esos planos vale <span class=\"m\">β=2 arctan(3/4)≈73,74°</span>; el otro ángulo formado por sus semiplanos mide <span class=\"m\">106,26°</span>.","Por normales proporcionales a <span class=\"m\">(4,0,3)</span> y <span class=\"m\">(-4,0,3)</span>, el coseno del ángulo entre normales es <span class=\"m\">-7/25</span>. El ángulo agudo entre planos es <span class=\"m\">arccos(7/25)≈73,74°</span>. Son planos de caras opuestas, no un diedro de arista del poliedro."],
        respuesta: "Cara-base: <span class=\"m\">arctan(4/3)≈53,13°</span>. Ángulo agudo entre <strong>planos</strong> de caras laterales opuestas: <span class=\"m\">arccos(7/25)≈73,74°</span>. Los diedros del poliedro se forman entre caras adyacentes."
      }
    ]
  });
})();
