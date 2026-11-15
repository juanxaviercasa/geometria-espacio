/* ============================================================
   contenido-d.js — módulos 10, 11 y 12
   M10 Secciones planas
   M11 Problemas integradores de admisión
   M12 Simulacro final tipo UNI
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     M10 · L1 — Secciones planas
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm10l1',
    modulo: 'm10',
    titulo: 'Secciones planas de sólidos',
    resumen: 'Cortar un cubo con un plano y deducir el polígono resultante con método.',
    objetivo: 'Determinar la sección que produce un plano en un prisma, una pirámide o un cuerpo de revolución, y calcular su área y perímetro.',
    duracion: '32 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'Cortar un queso con un cuchillo produce una superficie plana: esa superficie es la <strong>sección</strong>. En un poliedro, la sección es siempre un polígono, y sus lados están contenidos en las caras del sólido. Eso da un método: buscar la intersección con cada cara.' },
      {
        tipo: 'definicion', titulo: 'Sección plana', indice: 'Definición',
        html: '<p>La <strong>sección</strong> de un sólido por un plano <var>π</var> es el conjunto de los puntos comunes al sólido y al plano. En un poliedro convexo, la sección es un polígono convexo cuyos lados son las intersecciones de <var>π</var> con las caras.</p>' +
          '<p>Dos hechos que resuelven la mayoría de los problemas:</p>' +
          '<ul><li>Si <var>π</var> corta a dos caras <strong>paralelas</strong>, las dos rectas de corte son <strong>paralelas</strong>.</li>' +
          '<li>Si <var>π</var> corta a dos caras que comparten una arista, las dos rectas de corte se cortan en un punto de esa arista.</li></ul>'
      },
      { tipo: 'figura', figura: 'cubo-seccion', indice: 'Figura: sección hexagonal', titulo: 'Un plano que produce un hexágono', pie: 'El plano pasa por seis puntos medios. Como corta tres pares de caras paralelas, los tres pares de lados opuestos son paralelos: el hexágono es regular.' },
      {
        tipo: 'subtitulo', indice: 'Método general', texto: 'Un método en cuatro pasos' },
      { tipo: 'parrafo', texto: '<strong>Paso 1.</strong> Marca los puntos de corte ya conocidos sobre las aristas. <strong>Paso 2.</strong> Une los puntos que estén en una misma cara. <strong>Paso 3.</strong> Usa los paralelismos entre caras opuestas para continuar. <strong>Paso 4.</strong> Cuando falte un punto, prolonga dos rectas de corte hasta cortar la arista común de dos caras: ese punto pertenece a la sección.' },
      {
        tipo: 'ejemplo', indice: 'Ejemplo 1',
        titulo: 'Sección triangular en un cubo',
        enunciado: 'En un cubo de arista <var>a</var>, el plano pasa por los vértices <span class="m">A</span>, <span class="m">B₁</span> y <span class="m">C</span>… comprueba que esos tres puntos son coplanares y describe la sección.',
        pasos: [
          { titulo: 'Verificar coplanariedad', html: 'Tres puntos no alineados son <em>siempre</em> coplanares: por (A2) determinan un plano único. No hay nada que verificar.' },
          { titulo: 'Identificar los lados', html: '<span class="m">A</span> y <span class="m">C</span> están en la cara inferior, luego <span class="m">AC</span> es un lado. Pero <span class="m">A</span> y <span class="m">C</span> son vértices opuestos: <span class="m">AC</span> es una diagonal de la base y pasa por el interior de la cara. Correcto, es un lado de la sección.' },
          { titulo: 'Continuar', html: '<span class="m">B₁</span> y <span class="m">C</span> están ambos en la cara <span class="m">BCC₁B₁</span>, luego <span class="m">B₁C</span> es otro lado. ¿Y <span class="m">A</span> con <span class="m">B₁</span>? Ambos están en la cara <span class="m">ABB₁A₁</span>, luego <span class="m">AB₁</span> es el tercer lado.' },
          { titulo: 'Comprobar si el plano corta más caras', html: 'El plano <span class="m">(AB₁C)</span> tiene ecuación, con <span class="m">A(0,0,0)</span>, <span class="m">B₁(a,0,a)</span>, <span class="m">C(a,a,0)</span>: <span class="m">x − y − z = 0</span>. Cortando con las demás aristas: con <span class="m">DD₁</span> (<span class="m">x = 0, y = a</span>) da <span class="m">−a − z = 0</span> → <span class="m">z = −a</span>, fuera. Con <span class="m">A₁B₁</span> (<span class="m">z = a, y = 0</span>) da <span class="m">x − a = 0</span> → <span class="m">x = a</span>, es decir <span class="m">B₁</span> ✓. No hay más cortes interiores.' },
          { titulo: 'Área', html: '<span class="m">AC = a√2</span>, <span class="m">AB₁ = a√2</span>, <span class="m">CB₁ = a√2</span>. Triángulo equilátero de lado <span class="m">a√2</span>.', cuenta: 'A = (√3/4)(2a²) = a²√3/2' }
        ],
        respuesta: 'Triángulo equilátero de lado <span class="m">a√2</span> y área <span class="m">a²√3/2</span>. Tres puntos no alineados siempre definen una sección; la dificultad aparece cuando hay que continuar la sección sobre más caras.'
      },
      {
        tipo: 'teorema', titulo: 'Secciones de cuerpos de revolución', indice: 'Revolución',
        enunciado: '<p>En un cilindro: un plano paralelo a las bases da un <strong>círculo</strong>; un plano que contiene el eje da un <strong>rectángulo</strong> (sección axial); un plano oblicuo que corta a las dos bases da una <strong>elipse</strong> o un óvalo.</p><p>En un cono: un plano paralelo a la base da un <strong>círculo</strong>; un plano que contiene el eje da un <strong>triángulo isósceles</strong>; un plano paralelo a una generatriz da una <strong>parábola</strong>; un plano más inclinado, una <strong>hipérbola</strong>. Son las cónicas.</p><p>En una esfera: <strong>todo</strong> plano da un círculo. Si pasa por el centro, es un círculo máximo de radio <span class="m">R</span>; si está a distancia <span class="m">d</span> del centro, el radio del círculo es <span class="m">√(R² − d²)</span>.</p>',
        justifica: 'Las secciones del cono son las cónicas porque la ecuación del cono es cuadrática y la del plano es lineal; al sustituir se obtiene una ecuación de segundo grado en el plano. En la esfera, cualquier plano la corta en una circunferencia por la simetría radial: el triángulo formado por el centro, el centro de la sección y un punto del borde es rectángulo, y de ahí el radio <span class="m">√(R² − d²)</span>.'
      },
      { tipo: 'figura', figura: 'seccion-prisma', indice: 'Figura: sección de prisma', titulo: 'Sección inclinada', pie: 'La sección de un prisma por un plano oblicuo es un polígono con tantos lados como caras corta. Si es más inclinado, más caras corta.' },
      {
        tipo: 'ejemplo', indice: 'Ejemplo 2 (tipo UNI)',
        titulo: 'Sección de una esfera a distancia del centro',
        enunciado: 'Una esfera de radio 13 cm se corta con un plano que está a 5 cm del centro. Halla el radio del círculo de corte y su área.',
        pasos: [
          { titulo: 'Formar el triángulo rectángulo', html: 'El centro <var>O</var>, el centro de la sección <var>O′</var> y un punto <var>P</var> del borde forman un triángulo rectángulo en <var>O′</var>, con hipotenusa <span class="m">OP = R = 13</span> y cateto <span class="m">OO′ = d = 5</span>.' },
          { titulo: 'Calcular el radio de la sección', html: '<span class="m">r = √(13² − 5²) = √(169 − 25) = √144 = 12 cm</span>.', cuenta: 'r = 12 cm' },
          { titulo: 'Área del círculo', html: '<span class="m">A = π·144 = 144π ≈ 452,4 cm²</span>.' },
          { titulo: 'Comprobación', html: 'Si <span class="m">d = 0</span>, <span class="m">r = R</span> (círculo máximo) ✓. Si <span class="m">d = R</span>, <span class="m">r = 0</span> (un punto tangente) ✓. La fórmula se comporta como debe. Y la terna 5‑12‑13 confirma el resultado.' }
        ],
        respuesta: '<span class="m">r = 12 cm</span> y <span class="m">A = 144π ≈ 452,4 cm²</span>. La fórmula <span class="m">r = √(R² − d²)</span> es la que hay que recordar; no depende del ángulo.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Trazar la sección uniendo puntos que no están en una misma cara.', bien: 'Unir solo puntos de la misma cara, o justificar la coplanariedad.', porque: 'Unir puntos de caras distintas da un segmento que «atraviesa» el sólido, no un borde de la sección.' },
          { mal: 'Olvidar que los cortes en caras paralelas son paralelos.', bien: 'Usar ese paralelismo para continuar la sección.', porque: 'Es la herramienta más potente y la que ahorra el cálculo de ecuaciones de planos.' },
          { mal: 'Suponer que la sección de cualquier cuerpo de revolución es un círculo.', bien: 'Distinguir círculo, elipse, rectángulo, triángulo, parábola.', porque: 'Solo en la esfera todo corte es circular. En el cilindro, un corte oblicuo da una elipse.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm10l1e1', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'La sección de un cilindro por un plano paralelo a sus bases es:',
        opciones: [
          { texto: 'Un círculo congruente con las bases', correcta: true },
          { texto: 'Un rectángulo' },
          { texto: 'Una elipse' },
          { texto: 'Un triángulo' }
        ],
        explicacion: 'Al ser paralelo a las bases, el plano corta al cilindro en una figura igual a la base. Solo los planos oblicuos producen elipses, y solo los que contienen el eje dan rectángulos.',
        pistas: ['¿Cómo es la «rebanada» de un cilindro si el cuchillo es horizontal?', 'La figura es idéntica a la base.']
      },
      {
        id: 'm10l1e2', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'Una esfera de radio 10 se corta con un plano a 6 del centro. ¿Cuál es el radio del círculo de corte?',
        unidad: 'u', respuesta: 8, tolerancia: 0,
        explicacion: '<span class="m">r = √(100 − 36) = √64 = 8</span>. Terna 6‑8‑10.',
        pistas: ['<span class="m">r = √(R² − d²)</span>.', '100 − 36 = 64.']
      },
      {
        id: 'm10l1e3', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: '¿Qué polígono puede obtenerse como sección de un cubo?',
        opciones: [
          { texto: 'Triángulo, cuadrilátero, pentágono o hexágono', correcta: true },
          { texto: 'Solo triángulos y cuadriláteros' },
          { texto: 'Hasta octógonos' },
          { texto: 'Cualquier polígono de 3 a 12 lados' }
        ],
        explicacion: 'Un cubo tiene 6 caras, y la sección tiene como máximo un lado por cara: como mucho un hexágono. No puede haber heptágonos porque harían falta 7 caras. Todos los casos de 3 a 6 lados son posibles.',
        pistas: ['¿Cuántas caras tiene un cubo?', 'La sección tiene como máximo un lado por cara cortada.']
      },
      {
        id: 'm10l1e4', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'Un cubo de arista 6 se corta por un plano paralelo a una cara, a 2 de la base. ¿Cuál es el área de la sección?',
        unidad: 'u²', respuesta: 36, tolerancia: 0,
        explicacion: 'La sección es un cuadrado congruente con la base: lado 6, área 36. La distancia al a base no cambia el tamaño porque las caras laterales son perpendiculares a la base.',
        pistas: ['¿La sección paralela a una cara de un cubo es un cuadrado?', '¿De qué lado?']
      },
      {
        id: 'm10l1e5', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'Si un plano corta a dos caras paralelas de un prisma, las rectas de corte son:',
        opciones: [
          { texto: 'Paralelas entre sí', correcta: true },
          { texto: 'Perpendiculares' },
          { texto: 'Secantes en un punto de la arista común' },
          { texto: 'Alabeadas' }
        ],
        explicacion: 'Ambas rectas están en el plano de corte y en planos paralelos distintos. Si se cortaran, el punto pertenecería a ambos planos paralelos, lo que es imposible. Al ser coplanares y no cortarse, son paralelas.',
        pistas: ['¿Pueden dos planos paralelos tener un punto común?', 'Las dos rectas de corte viven en el mismo plano.']
      }
    ],
    retos: [
      {
        id: 'm10l1r1', titulo: "Sección triangular por tres puntos medios", nivel: 'UNI', puntos: 25,
        enunciado: 'En un cubo de arista <var>a</var>, el plano pasa por los puntos medios de tres aristas que concurren en un mismo vértice. Describe la sección, calcula su área y el volumen del sólido menor que queda.',
        estrategia: ['Identifica el tetraedro que se separa.', 'La sección es su cara opuesta al vértice.', 'Calcula área y volumen con las fórmulas del tetraedro trirrectángulo.'],
        desarrollo: ["Desde el vértice <var>A</var> parten tres aristas del cubo mutuamente perpendiculares. Los tres puntos medios están a distancia <span class=\"m\">a/2</span> sobre cada una.","Cada lado del triángulo que une dos puntos medios mide <span class=\"m\">√((a/2)²+(a/2)²)=a/√2</span>. Por tanto, la sección es un triángulo equilátero.","El área de la sección es <span class=\"m\">(√3/4)(a/√2)²=a²√3/8</span>.","El volumen del tetraedro trirrectángulo cortado es <span class=\"m\">V=(a/2)(a/2)(a/2)/6=a³/48</span>.","Segunda vía: la distancia del vértice A al plano de los tres puntos medios es <span class=\"m\">a/(2√3)</span>. Con <span class=\"m\">V=(1/3)(a²√3/8)(a/(2√3))=a³/48</span> se obtiene el mismo resultado."],
        respuesta: "La sección es un <strong>triángulo equilátero</strong> de lado <span class=\"m\">a/√2</span>, área <span class=\"m\">a²√3/8</span> y volumen separado <span class=\"m\">a³/48</span>. No se trata de un pentágono: los tres puntos medios están en aristas concurrentes."
      }
    ]
  });

  /* ==========================================================
     M11 · L1 — Estrategias de admisión
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm11l1',
    modulo: 'm11',
    titulo: 'Estrategias para problemas integradores',
    resumen: 'Cómo atacar un problema de geometría del espacio en un examen cronometrado.',
    objetivo: 'Aplicar un protocolo de resolución de cinco pasos y las técnicas de coordenadas, sección auxiliar y análisis dimensional para problemas tipo admisión.',
    duracion: '30 min',
    bloques: [
      { tipo: 'parrafo', indice: 'Por qué un protocolo', texto: 'En un examen de admisión no falla el conocimiento: falla la organización. Un problema con seis datos y una pregunta al final se resuelve siempre igual, y tener un orden reduce los errores mucho más que estudiar otra fórmula.' },
      {
        tipo: 'definicion', titulo: 'Protocolo de cinco pasos', indice: 'Protocolo',
        html: '<ol>' +
          '<li><strong>Clasificar el sólido y sus datos.</strong> Escribe qué es (prisma recto, pirámide regular, esfera…) y anota cada dato con su nombre exacto. Convierte diámetros en radios, aristas laterales en alturas cuando corresponda.</li>' +
          '<li><strong>Dibujar un boceto con nombres.</strong> No hace falta que sea bonito: hace falta que distinga qué segmento es altura, cuál es apotema y cuál es arista transversal.</li>' +
          '<li><strong>Decidir el método.</strong> Tres opciones: (a) relaciones métricas directas, (b) coordenadas, (c) sección auxiliar que reduce el problema a un plano.</li>' +
          '<li><strong>Ejecutar con unidades visibles.</strong> Escribe la unidad en cada línea intermedia. Detecta el 80 % de los errores.</li>' +
          '<li><strong>Verificar con un caso límite o una magnitud.</strong> ¿El resultado es mayor que una diagonal conocida? ¿Tiene sentido que sea negativo? ¿La raíz es de un cuadrado perfecto?</li>' +
          '</ol>'
      },
      {
        tipo: 'teorema', titulo: 'Técnica: las tres elecciones de sistema de coordenadas', indice: 'Coordenadas',
        enunciado: '<p>Cuando el sólido es un prisma recto o un ortoedro, coloca un vértice en el origen y las aristas sobre los ejes. Cuando es una pirámide regular, coloca el centro de la base en el origen y el eje <span class="m">z</span> sobre la altura. Cuando es un triedro trirrectángulo, usa directamente sus aristas como ejes.</p>',
        justifica: 'La elección de ejes no cambia la respuesta, pero sí el esfuerzo: con los ejes alineados a las aristas del sólido, la mayoría de los puntos tienen coordenadas con ceros, y los productos escalares y vectores normales se calculan mentalmente. Elegir mal los ejes es la causa más frecuente de cálculos que se alargan sin fin.'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo integrador',
        titulo: 'El problema completo, paso a paso',
        enunciado: 'Una pirámide de base cuadrada tiene lado 6 y altura 4. Se corta con un plano paralelo a la base a altura 1. Halla el volumen del tronco de pirámide resultante y el área de la sección.',
        pasos: [
          { titulo: 'Paso 1: clasificar', html: 'Pirámide cuadrangular, base <span class="m">6 × 6</span> en <span class="m">z = 0</span>, vértice en <span class="m">(3,3,4)</span>. Plano de corte <span class="m">z = 1</span>.' },
          { titulo: 'Paso 2: boceto mental', html: 'La sección es un cuadrado más pequeño, semejante a la base. La razón de semejanza es la razón de las distancias al vértice: la altura restante es <span class="m">4 − 1 = 3</span> sobre la total 4, luego <span class="m">k = 3/4</span>.' },
          { titulo: 'Paso 3: método', html: 'Semejanza, sin coordenadas. El lado de la sección es <span class="m">6·(3/4) = 4,5</span>.' },
          { titulo: 'Paso 4: ejecutar', html: 'Área de la sección: <span class="m">4,5² = 20,25</span>. Volumen del tronco = pirámide completa − pirámide superior:', cuenta: 'V = (1/3)(36)(4) − (1/3)(20,25)(3) = 48 − 20,25 = 27,75' },
          { titulo: 'Paso 5: verificar', html: 'Fórmula del tronco: <span class="m">V = (h/3)(B₁ + B₂ + √(B₁B₂))</span> con <span class="m">h = 1</span>: <span class="m">(1/3)(36 + 20,25 + √729) = (1/3)(36 + 20,25 + 27) = 83,25/3 = 27,75</span> ✓. Coincide exactamente.' }
        ],
        respuesta: '<span class="m">V = 27,75 u³</span> y área de la sección <span class="m">20,25 u²</span>. La verificación con la fórmula del tronco confirma el resultado: en el examen basta con una de las dos vías, pero comprobar cuando sobra tiempo es lo que separa un 18 de un 20.'
      },
      {
        tipo: 'formulas', titulo: 'Fórmulas de troncos', indice: 'Troncos',
        items: [
          { f: 'V_tronco_pirámide = (h/3)(B₁ + B₂ + √(B₁B₂))', desc: 'h = altura del tronco; B₁, B₂ = áreas de las bases paralelas.' },
          { f: 'V_tronco_cono = (h/3)(πR² + πr² + πRr)', desc: 'La misma estructura con bases circulares.' },
          { f: 'A_lateral_tronco_cono = π(R + r)g', desc: 'g = generatriz del tronco, calculada como <span class="m">√(h² + (R−r)²)</span>.' }
        ]
      },
      {
        tipo: 'nota', variante: 'dato',
        html: '<p><strong>Atajos que ahorran minutos.</strong> (1) Si la pregunta es una razón, nunca calcules las magnitudes absolutas: trabaja con <span class="m">k</span>, <span class="m">k²</span>, <span class="m">k³</span>. (2) Si piden un ángulo y las opciones son 30°, 45°, 60°, 90°, calcula solo el coseno y compara con <span class="m">√3/2, √2/2, 1/2, 0</span>. (3) Si aparecen raíces, busca ternas pitagóricas antes de calcular: casi siempre están ahí.</p>'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes en examen',
        items: [
          { mal: 'Empezar a calcular antes de identificar qué segmento es la altura.', bien: 'Escribir el nombre de cada magnitud antes de usar fórmulas.', porque: 'Confundir altura con arista lateral es el error más caro y ocurre en los primeros 30 segundos.' },
          { mal: 'Dejar las unidades para el final.', bien: 'Anotarlas en cada línea.', porque: 'Un resultado en cm² cuando se pedía cm³ es un punto perdido por descuido, no por falta de conocimiento.' },
          { mal: 'Elegir coordenadas «centradas» por costumbre aunque el sólido no lo pida.', bien: 'Alinear los ejes a las aristas del sólido.', porque: 'Con ejes mal elegidos, aparecen raíces y fracciones que consumen tiempo de examen.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm11l1e1', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'Una pirámide de base cuadrada de lado 8 y altura 12 se corta a altura 3 con un plano paralelo a la base. ¿Cuál es el área de la sección?',
        unidad: 'u²', respuesta: 36, tolerancia: 0.01,
        explicacion: 'La razón de semejanza es la de las alturas desde el vértice: <span class="m">(12 − 3)/12 = 9/12 = 3/4</span>. El lado de la sección es <span class="m">8·3/4 = 6</span> y el área <span class="m">36 u²</span>.',
        pistas: ['Usa la razón de distancias al vértice, no al plano de la base.', '<span class="m">(12−3)/12 = 3/4</span>.']
      },
      {
        id: 'm11l1e2', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'Un tronco de pirámide tiene bases cuadradas de 6 y 4, y altura 3. ¿Cuál es su volumen?',
        unidad: 'u³', respuesta: 76, tolerancia: 0.01,
        explicacion: '<span class="m">B₁ = 36</span>, <span class="m">B₂ = 16</span>, <span class="m">√(B₁B₂) = √576 = 24</span>. <span class="m">V = (3/3)(36 + 16 + 24) = 76</span>.',
        pistas: ['<span class="m">V = (h/3)(B₁ + B₂ + √(B₁B₂))</span>.', '<span class="m">√(36·16) = 24</span>.']
      },
      {
        id: 'm11l1e3', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'Si una pregunta pide la razón entre los volúmenes de dos sólidos semejantes con razón de longitudes 2 : 3, la respuesta es:',
        opciones: [
          { texto: '8 : 27', correcta: true },
          { texto: '4 : 9' },
          { texto: '2 : 3' },
          { texto: '8 : 9' }
        ],
        explicacion: 'Los volúmenes escalan con el cubo: <span class="m">2³ : 3³ = 8 : 27</span>. Las áreas darían <span class="m">4 : 9</span>, y las longitudes <span class="m">2 : 3</span>.',
        pistas: ['¿Con qué potencia de la razón escalan los volúmenes?', 'Eleva al cubo ambos términos.']
      },
      {
        id: 'm11l1e4', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'En un examen, el primer paso ante un problema de sólidos debería ser:',
        opciones: [
          { texto: 'Identificar el sólido y nombrar cada dato con precisión', correcta: true },
          { texto: 'Sustituir todos los datos en la fórmula más parecida' },
          { texto: 'Dibujar a escala con regla' },
          { texto: 'Elegir coordenadas' }
        ],
        explicacion: 'Nombrar con precisión evita el error más costoso (altura vs. arista lateral, radio vs. diámetro). Las coordenadas son una herramienta, no un primer paso obligado.',
        pistas: ['¿Qué error se comete más veces en estos problemas?', 'Nombrar bien evita ese error.']
      },
      {
        id: 'm11l1e5', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'Un cono truncado tiene radios 6 y 3 y altura 4. ¿Cuál es su volumen? Usa π ≈ 3,1416 y redondea a dos decimales.',
        unidad: 'u³', respuesta: 263.89, tolerancia: 0.2,
        explicacion: '<span class="m">V = (h/3)(πR² + πr² + πRr) = (4/3)π(36 + 9 + 18) = (4/3)π·63 = 84π ≈ 263,89</span>.',
        pistas: ['La fórmula del tronco de cono tiene la misma estructura que la del tronco de pirámide.', '<span class="m">36 + 9 + 6·3 = 63</span>.']
      }
    ],
    retos: [
      {
        id: 'm11l1r1', titulo: 'Problema integrador de tres sólidos', nivel: 'UNI', puntos: 25,
        enunciado: "En un cilindro de radio 6 y altura 12 hay una esfera inscrita de radio 6. Dentro del hemisferio superior se coloca un cono recto de radio 6 y altura 6, cuya <strong>base está en el plano ecuatorial de la esfera</strong> y cuyo vértice es el centro de la tapa superior del cilindro. ¿Qué fracción del cilindro ocupa la unión de la esfera y el cono? Justifica si los volúmenes deben sumarse.",
        estrategia: ['Calcula los tres volúmenes por separado con las fórmulas exactas.', 'Comprueba si los sólidos se solapan.', 'Trabaja con πR³ como unidad para simplificar.'],
        desarrollo: ["El volumen del cilindro es <span class=\"m\">V_c=π·6²·12=432π</span>.","El volumen de la esfera inscrita es <span class=\"m\">V_e=(4/3)π·6³=288π</span>.","El volumen del cono sería <span class=\"m\">V_k=(1/3)π·6²·6=72π</span>, pero sumar sin examinar la intersección contaría espacio dos veces.","Con el origen de alturas en la base inferior, la esfera tiene centro <span class=\"m\">z=6</span>. En una altura <span class=\"m\">z∈[6,12]</span>, la sección horizontal del cono tiene radio <span class=\"m\">r_k=12-z</span>, mientras la sección de la esfera tiene radio <span class=\"m\">r_e=√(36-(z-6)²)</span>.","Al poner <span class=\"m\">u=z-6</span> entre 0 y 6, se cumple <span class=\"m\">r_e²-r_k²=36-u²-(6-u)²=12u-2u²=2u(6-u)≥0</span>. Por tanto, <strong>todo el cono está contenido en la esfera</strong>.","El volumen de la unión es únicamente <span class=\"m\">V_e=288π</span>, y su fracción del cilindro es <span class=\"m\">288π/432π=2/3</span>. No se suman 72π porque corresponden a espacio ya ocupado."],
        respuesta: '<span class="m">2/3</span> del cilindro, porque el cono está contenido en la esfera y no añade volumen. Este problema existe para comprobar el paso 5 del protocolo: verificar solapamientos antes de sumar volúmenes.'
      }
    ]
  });

  /* ==========================================================
     M12 · L1 — Simulacro final
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm12l1',
    modulo: 'm12',
    titulo: 'Simulacro final tipo UNI',
    resumen: 'Cinco retos cronometrados que integran toda la ruta, con solución progresiva.',
    objetivo: 'Resolver problemas de dificultad comparable a la UNI integrando herramientas de todos los módulos, con revelado progresivo de la solución.',
    duracion: '45 min',
    bloques: [
      { tipo: 'parrafo', indice: 'Instrucciones', texto: 'Cinco problemas. Intenta cada uno durante 6 minutos antes de pedir la estrategia, y 4 minutos más antes del desarrollo. No es un examen oficial: es un entrenamiento de decisión bajo presión. Anota en papel qué método elegiste y por qué; eso entrena más que la respuesta correcta.' },
      { tipo: 'nota', variante: 'dato', html: '<p><strong>Cómo se puntúa.</strong> Cada reto vale 25 puntos. Pedir la estrategia resta valor de aprendizaje pero no bloquea: puedes verla las veces que necesites. El progreso local guarda qué retos resolviste, para que puedas volver dentro de una semana y comprobar qué recuerdas.</p>' },
      { tipo: 'parrafo', texto: 'Antes de empezar, un repaso mental de las cinco herramientas que más rinden: relación de Euler, diagonal espacial del ortoedro, triángulo rectángulo de la pirámide regular, teorema del coseno proyectivo y semejanza con razones <span class="m">k, k², k³</span>. Si sabes cuándo aplicar cada una, tienes el examen resuelto.' }
    ],
    ejercicios: [
      {
        id: 'm12l1e1', tipo: 'opcion', dificultad: 'Avanzado',
        pregunta: 'Un poliedro convexo tiene 10 caras: 2 hexagonales y 8 pentagonales. ¿Cuántos vértices tiene?',
        opciones: [
          { texto: 'No existe tal poliedro convexo' , correcta: true },
          { texto: '20' },
          { texto: '18' },
          { texto: '24' }
        ],
        explicacion: 'Aristas por doble conteo: <span class="m">(2·6 + 8·5)/2 = 52/2 = 26</span>. Por Euler, <span class="m">V = 2 + A − C = 2 + 26 − 10 = 18</span>. El cálculo aritmético da 18, pero eso no es suficiente: el grado medio sería <span class="m">2A/V = 52/18 ≈ 2,89</span>, y en todo poliedro convexo cada vértice tiene grado al menos 3, de modo que el grado medio no puede ser menor que 3. La combinación es imposible: «18» es el resultado de aplicar Euler sin comprobar la viabilidad.',
        pistas: ['Cuenta aristas con doble conteo.', 'Aplica Euler y después comprueba que el grado medio sea al menos 3.']
      },
      {
        id: 'm12l1e2', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: "En un cubo de arista 2, ¿cuál es la distancia entre el <strong>centro del cubo</strong> y la recta que contiene la arista <span class=\"m\">AB</span>? Considera <span class=\"m\">A(0,0,0)</span>, <span class=\"m\">B(2,0,0)</span> y centro <span class=\"m\">(1,1,1)</span>.",
        unidad: 'u', respuesta: 1.414, tolerancia: 0.01,
        explicacion: 'Centro <span class="m">(1,1,1)</span>; recta <span class="m">AB</span> es el eje <span class="m">x</span> desde <span class="m">(0,0,0)</span> a <span class="m">(2,0,0)</span>, es decir la recta <span class="m">{y = 0, z = 0}</span>. La distancia del punto a esa recta es <span class="m">√(1² + 1²) = √2 ≈ 1,414</span>.',
        pistas: ['La distancia de un punto a una recta coordenada es la raíz de la suma de los cuadrados de las otras dos coordenadas.', 'El centro está en <span class="m">(1,1,1)</span>.']
      },
      {
        id: 'm12l1e3', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'Una pirámide cuadrangular regular tiene arista lateral 10 y altura 6. ¿Cuál es su volumen? Redondea a dos decimales.',
        unidad: 'u³', respuesta: 256, tolerancia: 0.5,
        explicacion: 'Por Pitágoras en el triángulo <span class="m">V O A</span>: <span class="m">R² = L² − h² = 100 − 36 = 64</span>, luego <span class="m">R = 8</span>. En el cuadrado, el radio es la semidiagonal: <span class="m">R = l√2/2</span>, de donde <span class="m">l = 2R/√2 = 2(8)/√2 = 8√2</span> y <span class="m">B = l² = 128</span>. Volumen: <span class="m">V = (1/3)·128·6 = 256 u³</span>.',
        pistas: ['Obtén el radio de la base con Pitágoras: <span class="m">L² = h² + R²</span>.', 'El lado del cuadrado se relaciona con R: <span class="m">l = R√2</span>.']
      },
      {
        id: 'm12l1e4', tipo: 'opcion', dificultad: 'Avanzado',
        pregunta: 'Dos planos <span class="m">π₁: x + 2y − 2z = 3</span> y <span class="m">π₂: 2x + 4y − 4z = 7</span>:',
        opciones: [
          { texto: 'Son paralelos y su distancia es 1/6', correcta: true },
          { texto: 'Se cortan en una recta' },
          { texto: 'Son perpendiculares' },
          { texto: 'Son coincidentes' }
        ],
        explicacion: 'La normal de <span class="m">π₂</span> es el doble de la de <span class="m">π₁</span>, luego son paralelos. Normalizando <span class="m">π₂</span>: <span class="m">x + 2y − 2z = 3,5</span>. Distancia: <span class="m">|3 − 3,5|/√(1 + 4 + 4) = 0,5/3 = 1/6</span>.',
        pistas: ['Compara las normales: ¿son proporcionales?', 'Normaliza y usa <span class="m">|d₁ − d₂|/|n|</span>.']
      },
      {
        id: 'm12l1e5', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'Un recipiente cónico de radio 6 y altura 12 contiene agua hasta la mitad de su altura (6 desde el vértice). ¿Qué fracción de la capacidad está llena?',
        unidad: '(fracción, escribe el decimal)', respuesta: 0.125, tolerancia: 0.005,
        explicacion: 'Por semejanza, el cono de agua tiene razón <span class="m">k = 6/12 = 1/2</span> respecto del total. Los volúmenes escalan con <span class="m">k³ = 1/8 = 0,125</span>. Es decir, solo el 12,5 % de la capacidad. Este resultado sorprende y es un clásico en exámenes.',
        pistas: ['El agua forma un cono semejante al total.', 'La razón de alturas es 1/2; el volumen escala con el cubo.']
      }
    ],
    retos: [
      {
        id: 'm12l1r1', titulo: 'Cubo, tetraedro y octaedro en el mismo espacio', nivel: 'UNI', puntos: 25,
        enunciado: 'En un cubo de arista <span class="m">a</span> se inscribe un octaedro (vértices en los centros de las caras) y se forma un tetraedro con cuatro vértices alternos del cubo. Halla la razón <span class="m">V_cubo : V_tetraedro : V_octaedro</span> y el volumen de la parte del cubo no ocupada por ninguno de los dos.',
        estrategia: ["Calcula los tres volúmenes por separado y expresa sus razones con el volumen del cubo.","Comprueba si los seis centros de las caras del cubo son puntos medios de aristas del tetraedro de vértices alternos.","Decide si el octaedro está contenido en el tetraedro; si lo está, el volumen de la unión coincide con el del tetraedro."],
        desarrollo: ["El cubo tiene volumen <span class=\"m\">V_c=a³</span>.","El tetraedro de vértices alternos, por ejemplo <span class=\"m\">A(0,0,0), C(a,a,0), B₁(a,0,a), D₁(0,a,a)</span>, tiene lado <span class=\"m\">a√2</span> y volumen <span class=\"m\">(a√2)³√2/12=a³/3</span>.","El octaedro con vértices en los centros de las seis caras del cubo tiene arista <span class=\"m\">a/√2</span> y volumen <span class=\"m\">a³/6</span>.","La razón es <span class=\"m\">V_c:V_t:V_o=1:(1/3):(1/6)=6:2:1</span>.","Los seis centros de las caras del cubo son exactamente los <strong>puntos medios de las seis aristas</strong> de ese tetraedro. El octaedro que forman está, por convexidad, <strong>completamente contenido en el tetraedro</strong>; no es una intersección desconocida.","Así, <span class=\"m\">V(tetraedro∪octaedro)=V_t=a³/3</span> y la parte libre del cubo vale <span class=\"m\">a³-a³/3=2a³/3</span>.","Comprobación geométrica: la región exterior al tetraedro se divide en cuatro tetraedros trirrectángulos en los otros cuatro vértices del cubo, cada uno de volumen <span class=\"m\">a³/6</span>. Suman <span class=\"m\">4a³/6=2a³/3</span>. Dentro del tetraedro quedan además cuatro tetraedros pequeños alrededor del octaedro, pero no forman parte del volumen libre."],
        respuesta: "La razón es <strong><span class=\"m\">6:2:1</span></strong> y el volumen del cubo <strong>no ocupado por ninguno de los dos</strong> es <strong><span class=\"m\">2a³/3</span></strong>. El octaedro está contenido dentro del tetraedro de vértices alternos; por tanto, la unión ocupa <span class=\"m\">a³/3</span>."
      }
    ]
  });
})();
