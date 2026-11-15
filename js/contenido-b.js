/* ============================================================
   contenido-b.js — módulos 4, 5 y 6
   M4 Proyecciones y distancias
   M5 Triedros y ángulos poliedros
   M6 Prismas y paralelepípedos  ← lección estrella desarrollada
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     M4 · L1 — Proyección ortogonal
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm4l1',
    modulo: 'm4',
    titulo: 'Proyección ortogonal sobre un plano',
    resumen: 'La sombra que guarda distancias: proyectar puntos, rectas y figuras.',
    objetivo: 'Construir la proyección ortogonal de un punto, una recta y un polígono sobre un plano, y usar el teorema del coseno proyectivo para relacionar áreas.',
    duracion: '23 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'Cuando el sol está exactamente en la vertical, la sombra de un poste es nula: el poste coincide con su proyección. Cuando el sol se inclina, la sombra se alarga. La <strong>proyección ortogonal</strong> es el caso límite en el que los rayos son perpendiculares al plano: la sombra más corta posible.' },
      {
        tipo: 'definicion', titulo: 'Proyección ortogonal', indice: 'Definición',
        html: '<p>Sea <var>π</var> un plano. La <strong>proyección ortogonal</strong> de un punto <var>P</var> sobre <var>π</var> es el punto <span class="m">P′ = π ∩ r</span>, donde <var>r</var> es la recta que pasa por <var>P</var> y es perpendicular a <var>π</var>.</p>' +
          '<p>La proyección de una figura <var>F</var> es el conjunto de las proyecciones de sus puntos. Propiedades inmediatas:</p>' +
          '<ul><li>Si <span class="m">P ∈ π</span>, entonces <span class="m">P′ = P</span> (los puntos del plano son fijos).</li>' +
          '<li>La proyección de un segmento es un segmento (o un punto si el segmento es perpendicular al plano).</li>' +
          '<li>La proyección de una recta paralela al plano es una recta paralela a ella.</li>' +
          '<li>La proyección nunca <em>alarga</em> distancias: <span class="m">|P′Q′| ≤ |PQ|</span>.</li></ul>'
      },
      {
        tipo: 'teorema', titulo: 'Teorema del coseno proyectivo (áreas)', indice: 'Área proyectada',
        enunciado: 'Si una figura plana de área <span class="m">S</span> está contenida en un plano que forma un ángulo <span class="m">θ</span> con el plano de proyección, el área de su proyección es <span class="m">S′ = S · cos θ</span>.',
        justifica: 'Basta probarlo para un triángulo: se descompone en dos triángulos rectángulos y se comprueba que la altura proyectada se reduce en el factor <span class="m">cos θ</span> mientras la base no cambia (la base es la intersección de los dos planos). Cualquier figura poligonal se triangula, y el factor común se saca de la suma.'
      },
      { tipo: 'figura', figura: 'proyeccion-distancia', indice: 'Figura: proyección y distancia', titulo: 'Proyectar para medir', pie: 'La distancia de <var>P</var> al plano es <span class="m">PP′</span>, y es menor que la distancia de <var>P</var> a cualquier otro punto <var>B</var> del plano. El triángulo <span class="m">PP′B</span> es rectángulo en <span class="m">P′</span>.' },
      {
        tipo: 'ejemplo', indice: 'Ejemplo resuelto',
        titulo: 'Área proyectada de una cara del cubo',
        enunciado: 'Un cubo de arista <var>a</var> se proyecta ortogonalmente sobre un plano paralelo a una de sus caras. ¿Cuál es el área de la proyección del cubo?',
        pasos: [
          { titulo: 'Identificar la dirección de proyección', html: 'La proyección es perpendicular al plano de proyección, que es paralelo a una cara. Por tanto la dirección de proyección es perpendicular a esa cara.' },
          { titulo: 'Proyectar cada punto', html: 'Cada punto del cubo cae sobre su «columna» perpendicular. Todos los puntos con la misma proyección son los de una misma recta perpendicular al plano.' },
          { titulo: 'Determinar la figura resultante', html: 'La proyección del cubo es exactamente la cara paralela al plano: un cuadrado de lado <var>a</var>. Las caras laterales se proyectan sobre los lados de ese cuadrado (área nula, porque son perpendiculares al plano).' },
          { titulo: 'Calcular', html: 'Área proyectada <span class="m">= a²</span>.', cuenta: 'S′ = a² = S_cara' },
          { titulo: 'Variante interesante', html: 'Si el plano de proyección forma 45° con la cara, el área proyectada de la cara es <span class="m">a²·cos 45° = a²/√2</span>, pero la proyección del cubo completo es un rectángulo de lados <span class="m">a</span> y <span class="m">a√2</span>, de área <span class="m">a²√2</span>: ¡la proyección de la <em>unión</em> no es la unión de las proyecciones con áreas sumadas, porque hay solapamiento!' }
        ],
        respuesta: 'Área proyectada <span class="m">= a²</span> cuando el plano es paralelo a una cara. El ejemplo muestra por qué el teorema del coseno se aplica a <em>una</em> figura plana, no a un sólido: al proyectar un sólido, distintas caras pueden solaparse.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Aplicar <span class="m">S′ = S cos θ</span> al área total de un sólido.', bien: 'Aplicarlo a cada figura plana por separado y luego estudiar solapamientos.', porque: 'La fórmula presupone una única figura contenida en un plano. Un sólido tiene caras en planos distintos.' },
          { mal: 'Creer que la proyección conserva longitudes.', bien: 'Recordar <span class="m">|P′Q′| = |PQ|·cos θ</span> para segmentos inclinados.', porque: 'La proyección acorta (o mantiene) longitudes, nunca las alarga. Solo se conservan las longitudes de segmentos paralelos al plano.' },
          { mal: 'Proyectar «en diagonal» sin justificar la perpendicularidad.', bien: 'Verificar que la recta de proyección es perpendicular al plano.', porque: 'Una proyección oblicua no tiene las propiedades métricas de la ortogonal.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm4l1e1', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'Un segmento de longitud 10 forma un ángulo de 60° con un plano. ¿Cuánto mide su proyección ortogonal sobre el plano?',
        unidad: 'u', respuesta: 5, tolerancia: 0.01,
        explicacion: '<span class="m">|P′Q′| = 10·cos 60° = 10·0,5 = 5</span>. La proyección acorta el segmento por el coseno del ángulo con el plano.',
        pistas: ['La proyección de un segmento inclinado se reduce en el factor cos θ.', 'cos 60° = 0,5.']
      },
      {
        id: 'm4l1e2', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'Un triángulo equilátero de lado 4 está contenido en un plano que forma 60° con el plano de proyección. ¿Cuál es el área de su proyección? Expresa el resultado redondeado a dos decimales.',
        unidad: 'u²', respuesta: 3.46, tolerancia: 0.02,
        explicacion: 'Área del triángulo: <span class="m">(√3/4)·16 = 4√3 ≈ 6,928</span>. Área proyectada: <span class="m">6,928·cos 60° = 3,464</span>.',
        pistas: ['Calcula primero el área real del triángulo equilátero.', 'Multiplica por cos 60°.']
      },
      {
        id: 'm4l1e3', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'La proyección ortogonal de un punto que pertenece al plano de proyección es:',
        opciones: [
          { texto: 'El mismo punto', correcta: true },
          { texto: 'El origen de coordenadas' },
          { texto: 'No existe' },
          { texto: 'Un punto a distancia igual a su altura' }
        ],
        explicacion: 'Si <span class="m">P ∈ π</span>, la recta perpendicular a <var>π</var> por <var>P</var> corta a <var>π</var> en <var>P</var> mismo. La proyección deja fijos los puntos del plano.',
        pistas: ['¿Dónde corta al plano la perpendicular por un punto del plano?', 'La distancia al plano es cero.']
      },
      {
        id: 'm4l1e4', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: "En un cubo de arista 4, ¿cuál es la <strong>longitud</strong> de la proyección ortogonal de la diagonal espacial <span class=\"m\">AC₁</span> sobre el plano de la base? (La proyección es un segmento, no una región con área.)",
        unidad: 'u', respuesta: 5.657, tolerancia: 0.01,
        explicacion: 'La proyección de <span class="m">AC₁</span> sobre la base es la diagonal <span class="m">AC</span>, de longitud <span class="m">4√2 ≈ 5,657</span>. Comprobación con el coseno: el ángulo entre la diagonal y la base es <span class="m">θ</span> con <span class="m">cos θ = AC/AC₁ = 4√2/(4√3) = √(2/3) ≈ 0,8165</span>; entonces <span class="m">AC₁·cos θ = 4√3·0,8165 = 5,657</span>.',
        pistas: ['¿Qué sombra deja la diagonal del cubo sobre la base?', 'Es la diagonal de la base.']
      },
      {
        id: 'm4l1e5', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'La proyección ortogonal de una recta perpendicular al plano de proyección es:',
        opciones: [
          { texto: 'Un punto', correcta: true },
          { texto: 'Una recta paralela' },
          { texto: 'Un segmento de igual longitud' },
          { texto: 'Una recta perpendicular a la original' }
        ],
        explicacion: 'Todos los puntos de la recta se proyectan sobre el mismo punto (el pie de la perpendicular). Por eso una altura vertical se proyecta como un punto en la planta.',
        pistas: ['¿Hacia dónde se proyectan los puntos de una recta vertical?', 'Todos caen sobre el mismo pie.']
      }
    ],
    retos: [
      {
        id: 'm4l1r1', titulo: 'Sección de un cubo y su área', nivel: 'UNI', puntos: 25,
        enunciado: 'En un cubo de arista <var>a</var>, el plano <var>π</var> contiene la diagonal <span class="m">BD</span> de la base y el vértice <span class="m">A₁</span>. Halla el área de la sección que produce.',
        estrategia: ["Fija las coordenadas de B, D y A₁ y calcula primero la ecuación exacta del plano.","Interseca el plano con las aristas y comprueba que la sección es el triángulo BDA₁.","Verifica el área usando lados y como comprobación el área de la proyección sobre la base."],
        desarrollo: ["Con <span class=\"m\">A(0,0,0), B(a,0,0), D(0,a,0), A₁(0,0,a)</span>, el plano que contiene B, D y A₁ es <span class=\"m\">x+y+z=a</span>. Sustituir las coordenadas de los tres puntos confirma exactamente la ecuación.","El plano encuentra el cubo en los tres vértices <var>B</var>, <var>D</var> y <span class=\"m\">A₁</span>. En <span class=\"m\">CC₁</span> requeriría <span class=\"m\">z=-a</span>, fuera del segmento; las restantes aristas tampoco añaden cortes interiores. La sección es <span class=\"m\">BDA₁</span>.","Las distancias <span class=\"m\">BD</span>, <span class=\"m\">BA₁</span> y <span class=\"m\">DA₁</span> valen <span class=\"m\">a√2</span>. Es un triángulo equilátero.","El área es <span class=\"m\">(√3/4)(a√2)²=a²√3/2</span>.","Verificación: su proyección sobre la base es <span class=\"m\">BDA</span>, área <span class=\"m\">a²/2</span>. Como <span class=\"m\">cos θ=1/√3</span> entre ambos planos, el área original es <span class=\"m\">(a²/2)/(1/√3)=a²√3/2</span>."],
        respuesta: 'Triángulo equilátero de lado <span class="m">a√2</span> y área <span class="m">a²√3/2</span>. La comprobación cruzada con áreas proyectadas es la mejor forma de detectar errores.'
      }
    ]
  });

  /* ==========================================================
     M4 · L2 — Distancias
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm4l2',
    modulo: 'm4',
    titulo: 'Distancias en el espacio',
    resumen: 'Seis tipos de distancia y la regla que las unifica: siempre la perpendicular común.',
    objetivo: 'Calcular distancias entre puntos, punto-recta, punto-plano, recta-plano, entre rectas paralelas, entre planos paralelos y entre rectas alabeadas.',
    duracion: '30 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'Toda distancia en el espacio es la longitud del <strong>segmento más corto</strong> que une los dos objetos. Ese segmento es siempre perpendicular a ambos (cuando los dos son «extensos»). Seis casos, una sola idea.' },
      {
        tipo: 'formulas', titulo: 'Las seis distancias', indice: 'Fórmulas',
        items: [
          { f: 'd(P, Q) = √((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²)', desc: 'Distancia entre dos puntos. Es la única que se calcula directamente.' },
          { f: 'd(P, π) = |ax₀ + by₀ + cz₀ + d| / √(a² + b² + c²)', desc: 'Punto a plano de ecuación ax + by + cz + d = 0. Se mide sobre la perpendicular.' },
          { f: 'd(P, r) = |PQ × u| / |u|', desc: 'Punto a recta r de vector director u, con Q ∈ r. El numerador es el área del paralelogramo; al dividir por la base, queda la altura.' },
          { f: 'd(r, π) = d(P₀, π)', desc: 'Recta paralela a un plano: se toma cualquier punto P₀ de la recta.' },
          { f: 'd(π₁, π₂) = d(P₀, π₂)', desc: 'Planos paralelos: cualquier punto de uno de ellos.' },
          { f: 'd(r, s) = |(P₂ − P₁) · n| / |n|,  n = u₁ × u₂', desc: 'Rectas alabeadas: n es perpendicular a ambas; se proyecta el vector entre puntos sobre n. Si n = 0, las rectas son paralelas y se usa la fórmula punto-recta.' }
        ]
      },
      { tipo: 'figura', figura: 'proyeccion-distancia', indice: 'Figura: la distancia es perpendicular', titulo: 'Distancia punto-plano', pie: 'Para cualquier otro punto <var>B</var> del plano, el segmento <span class="m">PB</span> es más largo que <span class="m">PP′</span>: es la hipotenusa de un triángulo rectángulo cuyo cateto es la distancia.' },
      {
        tipo: 'nota', variante: 'ojo',
        html: '<p><strong>Rectas alabeadas.</strong> La distancia entre dos rectas alabeadas es la longitud del segmento perpendicular común. Es distinto de la distancia entre sus proyecciones o entre sus puntos más cercanos «a ojo»: solo el segmento perpendicular común sirve. Si las rectas fueran paralelas, el segmento perpendicular común es único; si son alabeadas, también es único, y por eso la distancia está bien definida.</p>'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo resuelto',
        titulo: 'Distancia entre dos aristas opuestas de un cubo',
        enunciado: "En un cubo de arista <var>a</var>, calcula la distancia entre las aristas <span class=\"m\">AB</span> y <span class=\"m\">C₁D₁</span> (son <strong>paralelas</strong>). Después, compara con la distancia entre las rectas alabeadas <span class=\"m\">AB</span> y <span class=\"m\">CC₁</span>.",
        pasos: [{"titulo":"Ubicar las aristas","html":"En el cubo <span class=\"m\">A(0,0,0), B(a,0,0), C₁(a,a,a), D₁(0,a,a)</span>."},{"titulo":"Clasificar las paralelas","html":"Los vectores directores <span class=\"m\">AB=(a,0,0)</span> y <span class=\"m\">D₁C₁=(a,0,0)</span> son paralelos. Por tanto estas aristas no son alabeadas."},{"titulo":"Calcular distancia entre paralelas","html":"El vector <span class=\"m\">AD₁=(0,a,a)</span> es perpendicular al vector director común <span class=\"m\">(1,0,0)</span>. Su longitud es <span class=\"m\">a√2</span>."},{"titulo":"Calcular distancia entre alabeadas","html":"Para <span class=\"m\">AB</span> y <span class=\"m\">CC₁</span>, los vectores directores son <span class=\"m\">(1,0,0)</span> y <span class=\"m\">(0,0,1)</span>. La perpendicular común está en la dirección del eje Y; el segmento <span class=\"m\">BC</span> mide <span class=\"m\">a</span>.","cuenta":"d(AB,C₁D₁) = a√2; d(AB,CC₁)=a"},{"titulo":"Interpretar","html":"La primera pareja es paralela; la segunda, alabeada. Antes de aplicar fórmulas, clasifica las rectas y comprueba cuál es su perpendicular común."}],
        respuesta: 'Entre aristas opuestas y paralelas: <span class="m">a√2</span>. Entre aristas alabeadas como <span class="m">AB</span> y <span class="m">CC₁</span>: <span class="m">a</span>. Este ejemplo muestra por qué es imprescindible clasificar primero la posición relativa.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Calcular la distancia entre alabeadas restando las ecuaciones de los planos.', bien: 'Usar la perpendicular común <span class="m">n = u₁ × u₂</span>.', porque: 'Las rectas alabeadas no determinan planos paralelos con distancia constante salvo en la dirección de la perpendicular común.' },
          { mal: 'Usar <span class="m">d(r, π)</span> cuando la recta corta al plano.', bien: 'Comprobar primero que <span class="m">r ∥ π</span> o <span class="m">r ⊂ π</span>.', porque: 'Si la recta corta al plano, la distancia es 0 y la fórmula de «tomar un punto» da un valor positivo falso.' },
          { mal: 'Confundir la distancia punto-plano con la distancia al pie de la perpendicular de otro punto.', bien: 'Proyectar el punto dado, no otro.', porque: 'El pie cambia con cada punto; usar el pie equivocado da una distancia mayor (hipotenusa en lugar de cateto).' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm4l2e1', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'Halla la distancia del punto <span class="m">P(1, 2, 2)</span> al plano <span class="m">2x − y + 2z − 6 = 0</span>.',
        unidad: 'u', respuesta: 0.6667, tolerancia: 0.01,
        explicacion: 'Se sustituye el punto en el primer miembro: <span class="m">2(1) − (2) + 2(2) − 6 = 2 − 2 + 4 − 6 = −2</span>. Se toma el valor absoluto: 2. El módulo de la normal es <span class="m">√(2² + (−1)² + 2²) = √9 = 3</span>. Por tanto <span class="m">d = 2/3 ≈ 0,67</span> u. El signo negativo del primer miembro solo indica en qué lado del plano está el punto.',
        pistas: ['Sustituye el punto en la ecuación y toma el valor absoluto.', 'Divide por el módulo de la normal <span class="m">√(a² + b² + c²)</span>.']
      },
      {
        id: 'm4l2e2', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'En un cubo de arista 2, ¿cuál es la distancia entre las rectas alabeadas <span class="m">AB</span> y <span class="m">B₁C₁</span>?',
        unidad: 'u', respuesta: 2, tolerancia: 0.01,
        explicacion: 'Con <span class="m">A(0,0,0)</span>, <span class="m">B(2,0,0)</span>, <span class="m">B₁(2,0,2)</span>, <span class="m">C₁(2,2,2)</span>: <span class="m">u₁ = (1,0,0)</span>, <span class="m">u₂ = (0,1,0)</span>, <span class="m">n = u₁ × u₂ = (0,0,1)</span>. Vector entre puntos: <span class="m">B₁ − A = (2,0,2)</span>. Producto con <span class="m">n</span> = 2. Distancia <span class="m">= 2/1 = 2</span>. El segmento perpendicular común es <span class="m">BB₁</span>.',
        pistas: ['Calcula <span class="m">u₁ × u₂</span>.', 'Proyecta el vector entre un punto de cada recta sobre esa dirección.']
      },
      {
        id: 'm4l2e3', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'La distancia entre dos planos paralelos se calcula:',
        opciones: [
          { texto: 'Tomando un punto cualquiera de uno y midiendo su distancia al otro', correcta: true },
          { texto: 'Sumando las distancias al origen', correcta: false },
          { texto: 'Calculando su ángulo y multiplicando', correcta: false },
          { texto: 'Restando los términos independientes sin normalizar' }
        ],
        explicacion: 'Como todos los puntos del primer plano equidistan del segundo, basta elegir uno. Si las ecuaciones son <span class="m">ax + by + cz + d₁ = 0</span> y <span class="m">ax + by + cz + d₂ = 0</span>, la distancia es <span class="m">|d₁ − d₂|/√(a²+b²+c²)</span>: normalizar es imprescindible.',
        pistas: ['¿Todos los puntos de un plano paralelo equidistan del otro?', 'La fórmula requiere normalizar la normal.']
      },
      {
        id: 'm4l2e4', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'En un cubo de arista 3, halla la distancia del centro del cubo al plano <span class="m">A₁BD</span>.',
        unidad: 'u', respuesta: 0.866, tolerancia: 0.01,
        explicacion: 'El plano <span class="m">A₁BD</span>, con <span class="m">A₁(0,0,3)</span>, <span class="m">B(3,0,0)</span> y <span class="m">D(0,3,0)</span>, es <span class="m">x + y + z = 3</span>. El centro del cubo es <span class="m">(1,5; 1,5; 1,5)</span>, y al sustituir: <span class="m">4,5 − 3 = 1,5</span>. La distancia es <span class="m">1,5/√3 = √3/2 ≈ 0,866</span> u. No es cero: el centro no pertenece a ese plano.',
        pistas: ['Escribe la ecuación del plano con tres cortes en los ejes.', 'El centro está en <span class="m">(a/2, a/2, a/2)</span>.']
      },
      {
        id: 'm4l2e5', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'La distancia entre dos rectas paralelas es:',
        opciones: [
          { texto: 'La distancia de un punto cualquiera de una a la otra recta', correcta: true },
          { texto: 'Siempre cero' },
          { texto: 'La mitad de la distancia entre sus puntos extremos' },
          { texto: 'El ángulo entre ellas' }
        ],
        explicacion: 'Por definición, dos rectas paralelas equidistan en todos sus puntos. Basta elegir un punto de una y calcular su distancia a la otra con la fórmula punto-recta: <span class="m">d = |PQ × u|/|u|</span>.',
        pistas: ['¿La distancia cambia si me desplazo a lo largo de una de las rectas?', 'Usa la fórmula punto-recta desde un punto de una de ellas.']
      }
    ],
    retos: [
      {
        id: 'm4l2r1', titulo: 'Perpendicular común a dos aristas', nivel: 'UNI', puntos: 25,
        enunciado: 'En un cubo de arista <var>a</var>, halla la distancia y los extremos del segmento perpendicular común entre las aristas <span class="m">AB</span> y <span class="m">B₁C₁</span>.',
        estrategia: ['Parametriza ambas rectas.', 'Impón que el vector entre los puntos paramétricos sea perpendicular a ambas direcciones.', 'Resuelve el sistema y comprueba.'],
        desarrollo: [
          'Recta 1: <span class="m">P(s) = (s, 0, 0)</span>, <span class="m">s ∈ [0, a]</span>. Recta 2: <span class="m">Q(t) = (a, t, a)</span>, <span class="m">t ∈ [0, a]</span>.',
          'Vector entre ellas: <span class="m">Q − P = (a − s, t, a)</span>.',
          'Condición de perpendicularidad con <span class="m">u₁ = (1,0,0)</span>: <span class="m">a − s = 0</span> → <span class="m">s = a</span>.',
          'Con <span class="m">u₂ = (0,1,0)</span>: <span class="m">t = 0</span>.',
          'Entonces <span class="m">P = (a,0,0) = B</span> y <span class="m">Q = (a,0,a) = B₁</span>. El segmento perpendicular común es <span class="m">BB₁</span>, de longitud <span class="m">a</span>.',
          'Comprobación: <span class="m">BB₁</span> es perpendicular a <span class="m">AB</span> (arista de la misma cara) y a <span class="m">B₁C₁</span> (arista de la misma cara). Correcto.'
        ],
        respuesta: 'Distancia <span class="m">a</span>, con extremos en <var>B</var> y <span class="m">B₁</span>. No siempre los extremos de la perpendicular común son los puntos más «evidentes»: aquí coinciden con vértices, pero en un prisma oblicuo no ocurriría.'
      }
    ]
  });

  /* ==========================================================
     M5 · L1 — Triedros
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm5l1',
    modulo: 'm5',
    titulo: 'Triedros y ángulos poliedros',
    resumen: 'Las tres caras de un triedro no pueden tener ángulos arbitrarios.',
    objetivo: 'Reconocer triedros, relacionar ángulos de cara y diedros, aplicar la desigualdad triangular esférica y el teorema de la suma de ángulos.',
    duracion: '25 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'En el plano, tres ángulos cualesquiera pueden sumar 180°. En el espacio, tres ángulos que concurren en un vértice tienen restricciones: no se puede tener un triedro con caras de 100°, 100° y 200°, por ejemplo. La razón es que un triedro cortado por una esfera da un triángulo esférico, y en él valen sus propias reglas.' },
      {
        tipo: 'definicion', titulo: 'Triedro', indice: 'Definición',
        html: '<p>Un <strong>triedro</strong> es la figura formada por tres semirrectas con un origen común <var>O</var> (las <strong>aristas</strong>), tomadas dos a dos. Las tres regiones angulares determinadas por cada par de aristas son las <strong>caras</strong>; los ángulos entre pares de aristas son los <strong>ángulos de las caras</strong>; los ángulos entre pares de caras son los <strong>diedros</strong>.</p>' +
          '<p>Un triedro es <strong>trirrectángulo</strong> si sus tres diedros miden 90°. Es el vértice de un cubo o de un paralelepípedo recto.</p>' +
          '<p>Un <strong>ángulo poliedro</strong> es la generalización a <span class="m">n</span> aristas concurrentes; el caso <span class="m">n</span> = 3 es el triedro.</p>'
      },
      { tipo: 'figura', figura: 'triedro', indice: 'Figura: triedro', titulo: 'Triedro trirrectángulo', pie: 'Las tres caras son <span class="m">xOy</span>, <span class="m">yOz</span> y <span class="m">zOx</span>. En este caso los tres ángulos de cara miden 90° y los tres diedros también.' },
      {
        tipo: 'teorema', titulo: 'Desigualdad triangular esférica', indice: 'Desigualdad triangular',
        enunciado: 'En todo triedro, cada ángulo de cara es menor que la suma de los otros dos y mayor que su diferencia. Es decir, si los ángulos de cara son <span class="m">α, β, γ</span>: <span class="m">|β − γ| < α < β + γ</span>.',
        justifica: 'Cortando el triedro con una esfera centrada en <var>O</var> se obtiene un triángulo esférico cuyos lados (arcos) miden <span class="m">α, β, γ</span>. En la esfera vale la desigualdad triangular para arcos, y la demostración se reduce al caso plano considerando los planos de las caras.'
      },
      {
        tipo: 'teorema', titulo: 'Suma de ángulos de un ángulo poliedro', indice: 'Suma de ángulos',
        enunciado: 'La suma de los ángulos de las caras de un ángulo poliedro convexo es menor que 360°. En un triedro, <span class="m">α + β + γ < 360°</span>.',
        justifica: 'Cortando con una esfera centrada en el vértice se obtiene un polígono esférico convexo. La suma de sus ángulos internos supera la de un polígono plano, y de ahí se deduce que la suma de los arcos es menor que la circunferencia completa. La cota 360° no se alcanza nunca en un triedro propio.'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo resuelto',
        titulo: '¿Existe el triedro?',
        enunciado: 'Decide si existe un triedro cuyos ángulos de cara midan (a) 60°, 70°, 80°; (b) 30°, 40°, 100°; (c) 120°, 130°, 140°.',
        pasos: [
          { titulo: '(a) Comprobar la desigualdad triangular', html: '<span class="m">60 + 70 = 130 > 80</span>; <span class="m">70 + 80 = 150 > 60</span>; <span class="m">60 + 80 = 140 > 70</span>. Se cumple en los tres casos.' },
          { titulo: '(a) Comprobar la suma', html: '<span class="m">60 + 70 + 80 = 210 < 360</span>. Cumple.' },
          { titulo: '(a) Conclusión', html: 'Sí existe. De hecho, cualquier terna que cumpla la desigualdad triangular y sume menos de 360° define un triedro (teorema recíproco).' },
          { titulo: '(b) Comprobar', html: '<span class="m">30 + 40 = 70 < 100</span>. Falla la desigualdad triangular: la cara mayor supera la suma de las otras dos.' },
          { titulo: '(b) Conclusión', html: 'No existe. Intuición: si dos caras son muy estrechas, la tercera no puede abrirse tanto.' },
          { titulo: '(c) Comprobar', html: '<span class="m">120 + 130 = 250 > 140</span> ✓; la suma es <span class="m">390 > 360</span> ✗.' },
          { titulo: '(c) Conclusión', html: 'No existe: la suma de las caras no puede alcanzar 360°. Geométricamente, las tres caras «se pasarían» de plano.' }
        ],
        respuesta: 'Solo (a) define un triedro. Los dos criterios —desigualdad triangular y suma menor que 360°— son necesarios y, juntos, suficientes.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Aplicar solo la condición de suma menor que 360°.', bien: 'Comprobar también que cada ángulo es menor que la suma de los otros dos.', porque: 'La terna 30°, 40°, 100° suma 170° (menos de 360°) pero no forma triedro.' },
          { mal: 'Confundir ángulo de cara con diedro.', bien: 'El ángulo de cara está entre dos aristas; el diedro, entre dos caras.', porque: 'En un triedro trirrectángulo ambos valen 90° y el error pasa desapercibido hasta que el triedro es oblicuo.' },
          { mal: 'Suponer que los tres diedros de un triedro suman 360° o 180°.', bien: 'Usar la relación con los ángulos de cara (ley esférica del coseno) cuando haga falta.', porque: 'No hay una relación aditiva simple entre diedros y ángulos de cara.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm5l1e1', tipo: 'opcion', dificultad: 'Básico',
        pregunta: '¿Cuál de estas ternas puede ser los ángulos de cara de un triedro?',
        opciones: [
          { texto: '50°, 60°, 70°', correcta: true },
          { texto: '20°, 30°, 90°' },
          { texto: '150°, 160°, 170°' },
          { texto: '100°, 100°, 200°' }
        ],
        explicacion: '50 + 60 = 110 > 70 ✓ y la suma 180 < 360 ✓. En cambio 20 + 30 = 50 < 90 falla; 150 + 160 + 170 = 480 > 360 falla; y 100 + 100 = 200 no es mayor que 200 (falla la desigualdad estricta).',
        pistas: ['Comprueba la desigualdad triangular en los tres casos.', 'Comprueba también que la suma sea menor que 360°.']
      },
      {
        id: 'm5l1e2', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'En un triedro, dos ángulos de cara miden 70° y 90°. ¿Cuál es el mayor valor entero posible (en grados) del tercer ángulo?',
        unidad: 'grados', respuesta: 159, tolerancia: 0,
        explicacion: 'Debe cumplirse <span class="m">γ < 70 + 90 = 160</span>, luego <span class="m">γ ≤ 159</span> si es entero. Además la suma <span class="m">70 + 90 + γ < 360</span> da <span class="m">γ < 200</span>, que no restringe más. El máximo entero es 159°.',
        pistas: ['La desigualdad triangular es <span class="m">γ < α + β</span>.', 'Al ser estrictamente menor, el mayor entero es uno menos que la suma.']
      },
      {
        id: 'm5l1e3', tipo: 'numerico', dificultad: 'Básico',
        pregunta: '¿Cuántos diedros tiene un triedro?',
        unidad: 'diedros', respuesta: 3, tolerancia: 0,
        explicacion: "Un triedro tiene tres caras consecutivas, por tanto <span class=\"m\">3</span> diedros (uno por cada arista). En un ángulo poliedro convexo de <span class=\"m\">n</span> caras, hay <strong>n diedros entre caras consecutivas</strong>, no <span class=\"m\">C(n,2)</span> en general; contar todos los pares incluiría caras no adyacentes.",
        pistas: ['Cuenta pares de caras.', 'Con 3 caras, ¿cuántos pares se pueden formar?']
      },
      {
        id: 'm5l1e4', tipo: 'opcion', dificultad: 'Avanzado',
        pregunta: 'En un triedro trirrectángulo, la suma de los tres ángulos de cara es:',
        opciones: [
          { texto: '270°', correcta: true },
          { texto: '180°' },
          { texto: '360°' },
          { texto: 'Depende de las longitudes de las aristas' }
        ],
        explicacion: 'Cada ángulo de cara mide 90°, así que la suma es 270° < 360°. Este triedro es el vértice de un cubo: es el máximo «aprovechamiento» del espacio por tres caras mutuamente perpendiculares.',
        pistas: ['En un triedro trirrectángulo, ¿cuánto mide cada ángulo de cara?', 'Suma tres veces ese valor.']
      },
      {
        id: 'm5l1e5', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'Un triedro tiene caras de 45°, 45° y 90°. ¿Qué se puede afirmar?',
        opciones: [
          { texto: 'No existe como triedro propio: es el caso degenerado', correcta: true },
          { texto: 'Existe y es trirrectángulo' },
          { texto: 'Existe y no es trirrectángulo' },
          { texto: 'Existe y su suma de caras es 360°' }
        ],
        explicacion: 'La desigualdad triangular es <strong>estricta</strong>: <span class="m">α < β + γ</span>. Aquí <span class="m">90 = 45 + 45</span>, no es estrictamente menor. Cuando se alcanza la igualdad, las tres aristas quedan en un mismo plano: el triedro degenera en un ángulo plano. No es un triedro propio.',
        pistas: ['Comprueba si 45 + 45 es estrictamente mayor que 90.', 'La desigualdad es estricta: <span class="m">α < β + γ</span>, sin igualdad posible.']
      }
    ],
    retos: [
      {
        id: 'm5l1r1', titulo: "Ángulo entre una recta y un plano en un triedro", nivel: 'UNI', puntos: 25,
        enunciado: "En un triedro trirrectángulo de aristas mutuamente perpendiculares <span class=\"m\">OA=3</span>, <span class=\"m\">OB=4</span> y <span class=\"m\">OC=12</span>, sea <var>M</var> el punto medio de <span class=\"m\">BC</span>. Calcula el ángulo entre la recta <strong><span class=\"m\">AM</span></strong> y el plano <span class=\"m\">OBC</span>, y la distancia de <var>A</var> a ese plano.",
        estrategia: ['Coloca el triedro como sistema de ejes: es su ventaja principal.', 'La distancia al plano <span class="m">OBC</span> es inmediata porque es un plano coordenado.', 'Para el ángulo, proyecta y usa trigonometría.'],
        desarrollo: [
          'Toma <span class="m">O(0,0,0)</span>, <span class="m">A(3,0,0)</span>, <span class="m">B(0,4,0)</span>, <span class="m">C(0,0,12)</span>.',
          'El plano <span class="m">OBC</span> es el plano <span class="m">x = 0</span>. La distancia de <span class="m">A(3,0,0)</span> a él es 3. Coincide con <span class="m">OA</span>, como debe ser, porque <span class="m">OA</span> es perpendicular a ese plano.',
          'Punto medio <span class="m">M = (0, 2, 6)</span>. El vector <span class="m">AM = (−3, 2, 6)</span>.',
          'La proyección de <span class="m">AM</span> sobre el plano <span class="m">x = 0</span> es <span class="m">M − A′</span> donde <span class="m">A′ = (0,0,0) = O</span>: es decir <span class="m">OM = (0,2,6)</span>, de módulo <span class="m">√40 = 2√10</span>.',
          'La componente perpendicular es la diferencia de la primera coordenada: 3. Así <span class="m">tan θ = 3/(2√10) ≈ 0,4743</span> → <span class="m">θ ≈ 25,4°</span>.',
          'Comprobación por seno: <span class="m">|AM| = √(9 + 4 + 36) = 7</span>, <span class="m">sen θ = 3/7 ≈ 0,4286</span> → <span class="m">θ ≈ 25,38°</span>. Coincide.'
        ],
        respuesta: '<span class="m">θ ≈ 25,4°</span> y la distancia de <var>A</var> al plano <span class="m">OBC</span> es 3. El truco clave: en un triedro trirrectángulo, los planos coordenados son accesibles de inmediato.'
      }
    ]
  });

  /* ==========================================================
     M6 · L1 — LECCIÓN ESTRELLA: prismas y diagonales
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm6l1',
    modulo: 'm6',
    titulo: 'Prismas y diagonales: lección completa',
    resumen: 'Elementos, clasificación, áreas, volumen, diagonales de cara y diagonal espacial, con problemas tipo admisión.',
    objetivo: 'Dominar el prisma recto y el paralelepípedo: nomenclatura, relaciones métricas, diferencia entre altura y arista lateral, y cálculo sistemático de diagonales de cara y de la diagonal espacial.',
    duracion: '55 min',
    destacada: true,
    bloques: [
      { tipo: 'parrafo', indice: 'Por qué esta lección', texto: 'Los prismas aparecen en casi todos los exámenes de admisión, y casi siempre por el mismo motivo: hay que distinguir con precisión entre <strong>arista lateral</strong>, <strong>altura</strong>, <strong>diagonal de cara</strong> y <strong>diagonal espacial</strong>. Un prisma recto y un prisma oblicuo comparten nombres pero no relaciones métricas. Esta lección va despacio por ahí, porque es donde se pierden los puntos.' },

      { tipo: 'subtitulo', indice: '1. Elementos y clasificación', texto: '1. Elementos y clasificación' },
      { tipo: 'parrafo', texto: 'Un <strong>prisma</strong> es un poliedro limitado por dos polígonos congruentes y paralelos llamados <strong>bases</strong>, y por tantos paralelogramos como lados tienen las bases, llamados <strong>caras laterales</strong>. Las bases están en planos paralelos; la distancia entre esos planos es la <strong>altura</strong>.' },
      {
        tipo: 'definicion', titulo: 'Elementos de un prisma', indice: 'Elementos',
        html: '<ul>' +
          '<li><strong>Bases:</strong> dos polígonos congruentes y paralelos. Si la base es un triángulo, el prisma es triangular; si es un cuadrilátero, cuadrangular; etc.</li>' +
          '<li><strong>Caras laterales:</strong> paralelogramos que unen aristas correspondientes de las bases.</li>' +
          '<li><strong>Aristas básicas:</strong> los lados de las bases. Hay <span class="m">2n</span> (con <span class="m">n</span> lados en la base).</li>' +
          '<li><strong>Aristas laterales:</strong> segmentos que unen vértices correspondientes. Hay <span class="m">n</span>, y todas son paralelas e iguales.</li>' +
          '<li><strong>Altura <span class="m">h</span>:</strong> distancia entre los planos de las bases. Es perpendicular a ambas.</li>' +
          '<li><strong>Vértices:</strong> <span class="m">2n</span>.</li>' +
          '<li><strong>Diagonales de cara:</strong> segmentos que unen dos vértices no consecutivos de una misma cara.</li>' +
          '<li><strong>Diagonales del prisma (espaciales):</strong> segmentos que unen dos vértices que no pertenecen a una misma cara.</li>' +
          '</ul>' +
          '<p>Recuento con Euler: <span class="m">C + V − A = 2</span>. Para un prisma de base <span class="m">n</span>-gonal: caras <span class="m">n + 2</span>, vértices <span class="m">2n</span>, aristas <span class="m">3n</span>. Comprobación: <span class="m">(n+2) + 2n − 3n = 2</span> ✓.</p>'
      },
      {
        tipo: 'definicion', titulo: 'Clasificación', indice: 'Clasificación',
        html: '<p>Dos criterios independientes, y conviene nombrarlos por separado:</p>' +
          '<ol>' +
          '<li><strong>Según la inclinación de las aristas laterales:</strong><ul>' +
          '<li><strong>Prisma recto:</strong> las aristas laterales son perpendiculares a las bases. Entonces la arista lateral <em>es</em> la altura, y las caras laterales son rectángulos.</li>' +
          '<li><strong>Prisma oblicuo:</strong> las aristas laterales son oblicuas a las bases. La arista lateral <em>no</em> es la altura; es mayor que ella. Las caras laterales son paralelogramos no rectángulos.</li>' +
          '</ul></li>' +
          '<li><strong>Según la forma de la base:</strong> triangular, cuadrangular, pentagonal… Si la base es un polígono regular y el prisma es recto, se llama <strong>prisma regular</strong>.</li>' +
          '</ol>' +
          '<p>Un <strong>paralelepípedo</strong> es un prisma cuya base es un paralelogramo. Un <strong>ortoedro</strong> (o paralelepípedo recto rectangular) es un paralelepípedo recto con base rectangular: el «ladrillo». El <strong>cubo</strong> es el ortoedro con las tres dimensiones iguales.</p>'
      },
      { tipo: 'figura', figura: 'prisma-elementos', indice: 'Figura 1: elementos', titulo: 'Prisma recto de base rectangular', pie: 'Observa que la altura <span class="m">h</span> coincide con la arista lateral <span class="m">AA₁</span> porque el prisma es recto. En el prisma oblicuo de la figura siguiente esto deja de ser cierto.' },
      { tipo: 'figura', figura: 'paralelepipedo-oblicuo', indice: 'Figura 2: prisma oblicuo', titulo: 'Paralelepípedo oblicuo: arista lateral ≠ altura', pie: 'La arista lateral (verde) está inclinada; la altura (roja, punteada) es la distancia entre los planos de las bases. Compara las longitudes: <span class="m">altura < arista lateral</span>.' },

      { tipo: 'nota', variante: 'ojo', html: '<p><strong>El error que más puntos cuesta.</strong> En un prisma oblicuo, <span class="m">V = área de la base × <em>altura</em></span>, no × arista lateral. Si el enunciado da la arista lateral y el ángulo de inclinación, primero hay que obtener <span class="m">h = L · sen φ</span>, donde <span class="m">φ</span> es el ángulo entre la arista lateral y el plano de la base.</p>' },

      { tipo: 'subtitulo', indice: '2. Áreas y volumen', texto: '2. Áreas y volumen' },
      {
        tipo: 'formulas', titulo: 'Fórmulas del prisma', indice: 'Fórmulas',
        items: [
          { f: 'V = B · h', desc: 'B = área de la base; h = altura (distancia entre los planos de las bases, no la arista lateral si el prisma es oblicuo).' },
          { f: 'A_lateral = P_base · h', desc: 'Válida en el prisma recto, donde cada cara lateral es un rectángulo de base un lado y altura h. P_base = perímetro de la base.' },
          { f: 'A_lateral (oblicuo) = P_sección_recta · L', desc: 'Sección recta = sección por un plano perpendicular a las aristas laterales. L = longitud de la arista lateral.' },
          { f: 'A_total = A_lateral + 2B', desc: 'Siempre: las dos bases más la superficie lateral.' },
          { f: 'V(ortoedro) = a · b · c', desc: 'Para el ortoedro de dimensiones a, b, c.' },
          { f: 'A_total(ortoedro) = 2(ab + bc + ca)', desc: 'Suma de las seis caras.' }
        ]
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo 1',
        titulo: 'Prisma recto de base triangular',
        enunciado: 'Un prisma recto tiene base triangular de lados 3, 4 y 5 cm, y altura 10 cm. Calcula el área total y el volumen.',
        pasos: [
          { titulo: 'Verificar el tipo de triángulo', html: '<span class="m">3² + 4² = 9 + 16 = 25 = 5²</span>. Es rectángulo, con catetos 3 y 4. Esto simplifica el área de la base.' },
          { titulo: 'Área de la base', html: 'Triángulo rectángulo: <span class="m">B = (3·4)/2 = 6 cm²</span>.', cuenta: 'B = 6 cm²' },
          { titulo: 'Perímetro de la base', html: '<span class="m">P = 3 + 4 + 5 = 12 cm</span>.' },
          { titulo: 'Área lateral', html: 'Prisma recto: <span class="m">A_lat = P·h = 12·10 = 120 cm²</span>.', cuenta: 'A_lateral = 120 cm²' },
          { titulo: 'Área total', html: '<span class="m">A_total = A_lat + 2B = 120 + 12 = 132 cm²</span>.', cuenta: 'A_total = 132 cm²' },
          { titulo: 'Volumen', html: '<span class="m">V = B·h = 6·10 = 60 cm³</span>.', cuenta: 'V = 60 cm³' }
        ],
        respuesta: '<span class="m">A_total = 132 cm²</span> y <span class="m">V = 60 cm³</span>. Las unidades son distintas y no deben mezclarse: el área va en cm² y el volumen en cm³.'
      },

      { tipo: 'subtitulo', indice: '3. Diagonales de cara', texto: '3. Diagonales de cara' },
      { tipo: 'parrafo', texto: 'Una <strong>diagonal de cara</strong> está contenida en una sola cara. Por tanto se calcula con Pitágoras en dos dimensiones, dentro de esa cara. Si la cara es un rectángulo de lados <span class="m">p</span> y <span class="m">q</span>, su diagonal mide <span class="m">√(p² + q²)</span>. Si la cara es un paralelogramo oblicuo, se usa la ley del coseno.' },
      {
        tipo: 'teorema', titulo: 'Número de diagonales de cara', indice: 'Recuento',
        enunciado: 'En un prisma de base <span class="m">n</span>-gonal con caras laterales rectangulares, hay <span class="m">n</span> diagonales en las bases y <span class="m">n</span> en las caras laterales, es decir <span class="m">2n</span> diagonales de cara distintas.',
        justifica: 'Cada base es un polígono de <span class="m">n</span> lados, que aporta <span class="m">n(n−3)/2</span> diagonales; con dos bases son <span class="m">n(n−3)</span>. Cada una de las <span class="m">n</span> caras laterales es un rectángulo, que aporta 1 diagonal. Total: <span class="m">n(n−3) + n = n(n−2)</span>. Para el caso cuadrangular (<span class="m">n = 4</span>): <span class="m">4·2 = 8</span> diagonales de cara.'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo 2',
        titulo: 'Diagonales de cara en un ortoedro 2 × 3 × 6',
        enunciado: 'Un ortoedro tiene dimensiones <span class="m">a = 2</span>, <span class="m">b = 3</span>, <span class="m">h = 6</span>. Halla las longitudes de las tres clases de diagonales de cara y compáralas.',
        pasos: [
          { titulo: 'Caras de dimensiones a × b', html: 'Dos caras (base y tapa) de 2 × 3. Diagonal: <span class="m">√(4 + 9) = √13 ≈ 3,606</span>.', cuenta: 'd₁ = √13 ≈ 3,606' },
          { titulo: 'Caras de dimensiones a × h', html: 'Dos caras de 2 × 6. Diagonal: <span class="m">√(4 + 36) = √40 = 2√10 ≈ 6,325</span>.', cuenta: 'd₂ = √40 = 2√10' },
          { titulo: 'Caras de dimensiones b × h', html: 'Dos caras de 3 × 6. Diagonal: <span class="m">√(9 + 36) = √45 = 3√5 ≈ 6,708</span>.', cuenta: 'd₃ = √45 = 3√5' },
          { titulo: 'Interpretación', html: 'Las tres diagonales de cara son distintas porque las tres dimensiones son distintas. Si el sólido fuera un cubo, las tres coincidirían en <span class="m">a√2</span>. Cada clase aparece dos veces (una en cada cara de ese par), así que hay 6 diagonales de cara contando repeticiones en el ortoedro.' }
        ],
        respuesta: '<span class="m">√13, 2√10, 3√5</span>. Regla: la diagonal de una cara usa solo <strong>dos</strong> dimensiones del sólido.'
      },
      { tipo: 'figura', figura: 'prisma-diagonales', indice: 'Figura 3: diagonales', titulo: 'Diagonal de cara y diagonal espacial', pie: 'En rojo, la diagonal espacial <span class="m">AC₁</span> que atraviesa el sólido. En naranja, diagonales de cara que viven dentro de una cara. Activa y desactiva cada capa para distinguirlas.' },

      { tipo: 'subtitulo', indice: '4. Diagonal espacial', texto: '4. La diagonal espacial' },
      { tipo: 'parrafo', texto: 'La <strong>diagonal espacial</strong> (o diagonal del prisma) une dos vértices que no comparten ninguna cara. En un ortoedro de dimensiones <span class="m">a, b, c</span>, todas las diagonales espaciales tienen la misma longitud, y se obtiene aplicando Pitágoras dos veces: primero dentro de la base, luego con la altura.' },
      {
        tipo: 'teorema', titulo: 'Diagonal espacial del ortoedro', indice: 'Teorema (diagonal)',
        enunciado: 'En un ortoedro de dimensiones <span class="m">a, b, c</span>, la diagonal espacial mide <span class="m">d = √(a² + b² + c²)</span>. Hay exactamente <strong>4</strong> diagonales espaciales.',
        justifica: 'Sea la diagonal <span class="m">AC₁</span> que une <span class="m">A(0,0,0)</span> con <span class="m">C₁(a,b,c)</span>. El triángulo <span class="m">ACC₁</span> es rectángulo en <span class="m">C</span>: el cateto <span class="m">AC</span> es la diagonal de la base, <span class="m">AC = √(a² + b²)</span>, y el cateto <span class="m">CC₁ = c</span> es perpendicular a la base. Por Pitágoras: <span class="m">AC₁² = AC² + CC₁² = (a² + b²) + c²</span>. El recuento de 4 diagonales viene de que cada diagonal espacial une un vértice de la base inferior con el vértice opuesto de la superior, y hay 4 pares de este tipo.'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo 3',
        titulo: 'La terna 2, 3, 6',
        enunciado: 'En el ortoedro <span class="m">2 × 3 × 6</span>, calcula la diagonal espacial y el ángulo que forma con la base.',
        pasos: [
          { titulo: 'Aplicar la fórmula', html: '<span class="m">d = √(2² + 3² + 6²) = √(4 + 9 + 36) = √49 = 7</span>.', cuenta: 'd = 7 u' },
          { titulo: 'Detectar la terna pitagórica', html: '<span class="m">4 + 9 + 36 = 49 = 7²</span>. Las dimensiones 2, 3, 6 forman una terna entera: por eso aparecen tanto en los exámenes. Otras ternas útiles: (1, 2, 2) → 3; (2, 3, 6) → 7; (1, 4, 8) → 9; (3, 4, 12) → 13.' },
          { titulo: 'Ángulo con la base', html: 'La proyección de la diagonal espacial sobre la base es la diagonal de la base: <span class="m">√(4 + 9) = √13</span>. La altura es 6.', cuenta: 'tan θ = 6/√13 ≈ 1,664  ⟹  θ ≈ 59,04°' },
          { titulo: 'Comprobación', html: '<span class="m">sen θ = 6/7 ≈ 0,857</span> → <span class="m">θ ≈ 58,99°</span>… y <span class="m">arctan(6/√13) = 59,04°</span>. La pequeña diferencia es de redondeo: <span class="m">sen θ = h/d = 6/7</span> es exacto, y <span class="m">arcsen(6/7) = 59,0°</span>. Usa <span class="m">sen θ = h/d</span> para el ángulo con la base.' }
        ],
        respuesta: '<span class="m">d = 7 u</span> y el ángulo con la base cumple <span class="m">sen θ = 6/7</span>, es decir <span class="m">θ ≈ 59,0°</span>. Observa que la diagonal espacial (7) es mayor que cualquier diagonal de cara (<span class="m">3√5 ≈ 6,71</span>).'
      },
      {
        tipo: 'teorema', titulo: 'Número de diagonales espaciales', indice: 'Recuento espacial',
        enunciado: 'En un prisma de base <span class="m">n</span>-gonal, el número de diagonales espaciales es <span class="m">n(n − 3)</span>.',
        justifica: 'Un vértice de la base inferior se puede unir con <span class="m">2n</span> vértices. Descontamos: él mismo (1), los dos vértices de su arista básica (2), el vértice correspondiente en la base superior (1) —que define la arista lateral— y los dos vértices de la base superior unidos a sus vecinos en la base (2), que están en caras laterales. Es decir, se excluyen <span class="m">1 + 2 + 1 + 2 = 6</span>… con más cuidado: desde un vértice hay <span class="m">2n − 1</span> vértices distintos; de esos, 3 están en la misma cara básica o son adyacentes por arista básica, 2 son adyacentes por arista lateral, y los demás generan diagonales de cara. Contando solo los que no comparten cara: hay <span class="m">n − 3</span> por vértice inferior, y cada diagonal se cuenta una vez desde la base inferior, lo que da <span class="m">n(n − 3)</span>. Para <span class="m">n = 4</span>: <span class="m">4·1 = 4</span> ✓, que coincide con las 4 diagonales del ortoedro.'
      },
      {
        tipo: 'tabla', indice: 'Tabla resumen',
        titulo: 'Recuento en prismas',
        caption: 'Verifica siempre que se cumpla Euler: C + V − A = 2.',
        columnas: ['Base', 'Caras', 'Vértices', 'Aristas', 'Diag. de cara', 'Diag. espaciales'],
        filas: [
          ['Triangular (n=3)', '5', '6', '9', '9', '0'],
          ['Cuadrangular (n=4)', '6', '8', '12', '8', '4'],
          ['Pentagonal (n=5)', '7', '10', '15', '15', '10'],
          ['Hexagonal (n=6)', '8', '12', '18', '24', '18'],
          ['n-gonal', 'n+2', '2n', '3n', 'n(n−2)', 'n(n−3)']
        ]
      },
      { tipo: 'nota', variante: 'dato', html: '<p><strong>Un detalle elegante.</strong> En el prisma triangular no hay diagonales espaciales: cualquier par de vértices comparte alguna cara. Compruébalo: <span class="m">3·(3−3) = 0</span>. Y en el cubo hay 4 diagonales espaciales, todas de longitud <span class="m">a√3</span>, que se cortan en el centro del cubo.</p>' },

      { tipo: 'subtitulo', indice: '5. Problemas tipo admisión', texto: '5. Problemas tipo admisión' },
      {
        tipo: 'ejemplo', indice: 'Ejemplo 4 (tipo UNI)',
        titulo: 'Arista lateral y altura en un prisma oblicuo',
        enunciado: "Un paralelepípedo oblicuo tiene base rectangular de 4 × 3 cm y arista lateral de 5 cm, que forma 37° con el plano de la base. Halla su volumen. ¿Basta esa información para conocer el área lateral y el área total?",
        pasos: [{"titulo":"Identificar la altura perpendicular","html":"La arista lateral mide <span class=\"m\">L=5</span> y forma con la base <span class=\"m\">φ=37°</span>. La altura del prisma es la componente perpendicular a la base.","cuenta":"h=5·sen 37°≈3,009 cm"},{"titulo":"Calcular el volumen","html":"El área de la base es <span class=\"m\">B=4·3=12 cm²</span>. En todo prisma, sea recto u oblicuo, el volumen es <span class=\"m\">V=B·h</span>.","cuenta":"V=12·5·sen 37°≈36,1 cm³"},{"titulo":"Interpretar el dato insuficiente","html":"El ángulo con la base determina la altura, pero no la dirección de la proyección horizontal de la arista lateral. Esa dirección afecta las inclinaciones de las cuatro caras laterales, que son paralelogramos."},{"titulo":"Conclusión","html":"Por ello <strong>no</strong> se pueden deducir de manera única las áreas laterales de esas caras ni el área total sin información adicional sobre la orientación de la arista lateral. No se debe usar <span class=\"m\">P_b·L</span> salvo en casos justificados."}],
        respuesta: "<strong><span class=\"m\">V=60 sen 37°≈36,1 cm³</span></strong>. El área lateral y el área total no quedan determinados con los datos, porque falta la dirección horizontal de la arista oblicua."
      },
      {
        tipo: 'teorema', titulo: 'Relación entre arista lateral y altura', indice: 'Relación métrica',
        enunciado: 'En un prisma con arista lateral <span class="m">L</span> inclinada un ángulo <span class="m">φ</span> respecto del plano de la base, se cumple <span class="m">h = L · sen φ</span>, y la proyección de la arista lateral sobre la base mide <span class="m">L · cos φ</span>.',
        justifica: 'El triángulo formado por la arista lateral, su proyección sobre la base y la perpendicular a la base es rectángulo, con hipotenusa <span class="m">L</span> y ángulo <span class="m">φ</span> entre la hipotenusa y la proyección. Aplicando las razones trigonométricas: el cateto opuesto a <span class="m">φ</span> es la altura y el adyacente es la proyección.'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo 5 (tipo UNI)',
        titulo: 'Cubo con un plano que corta tres aristas',
        enunciado: 'En un cubo de arista <span class="m">a</span>, un plano corta las tres aristas que salen del vértice <var>A</var> a distancia <span class="m">a/2</span> de <var>A</var>. Halla el volumen de la pirámide que queda separada en el vértice <var>A</var> y la longitud del lado mayor de la sección.',
        pasos: [
          { titulo: 'Identificar la pirámide', html: 'La pirámide tiene vértice <var>A</var> y base triangular con los tres puntos de corte <span class="m">M, N, P</span>, cada uno a <span class="m">a/2</span> de <var>A</var> sobre una arista. Es un tetraedro con tres aristas mutuamente perpendiculares en <var>A</var>.' },
          { titulo: 'Volumen del tetraedro trirrectángulo', html: 'Con tres aristas perpendiculares de longitudes <span class="m">p, q, r</span> desde un vértice:', cuenta: 'V = (1/6)·p·q·r = (1/6)·(a/2)³ = a³/48' },
          { titulo: 'Lado de la sección', html: 'Los tres puntos están a <span class="m">a/2</span> de <var>A</var> sobre aristas perpendiculares; la distancia entre dos de ellos es <span class="m">√(a²/4 + a²/4) = a/√2</span>. La sección es un triángulo equilátero de lado <span class="m">a/√2</span>.' },
          { titulo: 'Comprobación por área y altura', html: 'Área de la sección: <span class="m">(√3/4)(a²/2) = a²√3/8</span>. Distancia de <var>A</var> al plano de la sección: la normal del plano <span class="m">x + y + z = a/2</span> da <span class="m">(a/2)/√3 = a/(2√3)</span>. Volumen: <span class="m">(1/3)(a²√3/8)(a/(2√3)) = a³/48</span> ✓. Coincide.' }
        ],
        respuesta: '<span class="m">V = a³/48</span> y el lado de la sección es <span class="m">a/√2</span>. La doble comprobación (tetraedro trirrectángulo vs. base × altura) es una excelente forma de verificar en el examen.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes en prismas',
        items: [
          { mal: 'Usar <span class="m">V = B · (arista lateral)</span> en un prisma oblicuo.', bien: '<span class="m">V = B · h</span> con <span class="m">h = L·sen φ</span>.', porque: 'La altura es la distancia entre los planos de las bases; la arista lateral es mayor salvo en el prisma recto.' },
          { mal: 'Confundir la diagonal de cara con la diagonal espacial.', bien: 'La de cara usa 2 dimensiones; la espacial, 3.', porque: 'La diagonal de cara está contenida en una cara plana; la espacial atraviesa el interior del sólido.' },
          { mal: 'Calcular <span class="m">A_lateral = P_base · arista lateral</span> en un prisma oblicuo.', bien: 'Usar la sección recta: <span class="m">A_lateral = P_sección · L</span>.', porque: 'En el oblicuo las caras laterales no son rectángulos y su altura no es la altura del prisma.' },
          { mal: 'Poner <span class="m">d = √(a² + b²)</span> para la diagonal espacial del ortoedro.', bien: '<span class="m">d = √(a² + b² + c²)</span>.', porque: 'Olvidar la tercera dimensión es el error más frecuente; comprueba con un cubo: debe dar <span class="m">a√3</span>, no <span class="m">a√2</span>.' },
          { mal: 'Mezclar cm² y cm³ en la respuesta final.', bien: 'Etiquetar cada resultado con su unidad y comprobar la homogeneidad dimensional.', porque: 'En opción múltiple, las unidades distintas muchas veces son el único indicio de que la opción es incorrecta.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm6l1e1', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'Un ortoedro tiene dimensiones 2, 3 y 6. ¿Cuánto mide su diagonal espacial?',
        unidad: 'u', respuesta: 7, tolerancia: 0,
        explicacion: '<span class="m">d = √(2² + 3² + 6²) = √(4 + 9 + 36) = √49 = 7</span>. Es la terna (2, 3, 6) → 7, muy frecuente en exámenes.',
        pistas: ['Usa las tres dimensiones: es Pitágoras aplicado dos veces.', '4 + 9 + 36 = 49. ¿Qué raíz tiene 49?']
      },
      {
        id: 'm6l1e2', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'En un cubo de arista 5, ¿cuánto mide la diagonal de una cara?',
        unidad: 'u', respuesta: 7.071, tolerancia: 0.01,
        explicacion: 'La diagonal de una cara es <span class="m">a√2 = 5√2 ≈ 7,071</span>. Solo intervienen dos dimensiones, ambas iguales a 5: <span class="m">√(25 + 25) = √50 = 5√2</span>.',
        pistas: ['La cara es un cuadrado de lado 5.', 'Diagonal del cuadrado: <span class="m">a√2</span>.']
      },
      {
        id: 'm6l1e3', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'En un prisma oblicuo, la relación correcta entre la altura <span class="m">h</span> y la arista lateral <span class="m">L</span> es:',
        opciones: [
          { texto: '<span class="m">h = L · sen φ</span>, con <span class="m">φ</span> el ángulo entre la arista lateral y la base', correcta: true },
          { texto: '<span class="m">h = L</span> siempre' },
          { texto: '<span class="m">h = L · cos φ</span>' },
          { texto: '<span class="m">h > L</span>' }
        ],
        explicacion: 'El triángulo rectángulo formado por la arista lateral, su proyección y la altura tiene hipotenusa <span class="m">L</span>; la altura es el cateto opuesto al ángulo <span class="m">φ</span> que forma la arista con el plano, luego <span class="m">h = L sen φ</span>. En consecuencia <span class="m">h ≤ L</span>, con igualdad solo si el prisma es recto.',
        pistas: ['Dibuja el triángulo rectángulo: arista lateral, proyección, altura.', 'El ángulo <span class="m">φ</span> está entre la arista y el plano, no entre la arista y la vertical.']
      },
      {
        id: 'm6l1e4', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'Un prisma recto tiene base cuadrada de lado 4 y altura 9. ¿Cuál es su área total?',
        unidad: 'u²', respuesta: 176, tolerancia: 0,
        explicacion: 'Base: <span class="m">B = 16</span>. Perímetro: <span class="m">P = 16</span>. Área lateral: <span class="m">P·h = 16·9 = 144</span>. Total: <span class="m">144 + 2·16 = 176</span>.',
        pistas: ['Calcula el área de una base y el perímetro.', '<span class="m">A_total = P·h + 2B</span>.']
      },
      {
        id: 'm6l1e5', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: '¿Cuántas diagonales espaciales tiene un prisma de base pentagonal?',
        opciones: [
          { texto: '10', correcta: true },
          { texto: '5' },
          { texto: '15' },
          { texto: '0' }
        ],
        explicacion: 'La fórmula es <span class="m">n(n − 3)</span>. Con <span class="m">n = 5</span>: <span class="m">5·2 = 10</span>. En cambio, <span class="m">n(n−2) = 15</span> es el número de diagonales <em>de cara</em>: no confundas las dos fórmulas.',
        pistas: ['Diagonal espacial: <span class="m">n(n − 3)</span>.', 'Diagonal de cara: <span class="m">n(n − 2)</span>.']
      },
      {
        id: 'm6l1e6', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'Un paralelepípedo oblicuo tiene base rectangular de 6 × 8 y arista lateral 10, inclinada 30° respecto de la base. ¿Cuál es su volumen?',
        unidad: 'u³', respuesta: 240, tolerancia: 1,
        explicacion: '<span class="m">B = 6·8 = 48</span>. Altura: <span class="m">h = 10·sen 30° = 5</span>. Volumen: <span class="m">48·5 = 240</span>. Si hubieras usado la arista lateral, obtendrías 480: justo el doble, un distractor clásico.',
        pistas: ['Calcula primero la altura con el seno del ángulo.', '<span class="m">V = B·h</span>, no <span class="m">B·L</span>.']
      },
      {
        id: 'm6l1e7', tipo: 'opcion', dificultad: 'Avanzado',
        pregunta: 'En un ortoedro de dimensiones <span class="m">a < b < c</span>, ¿cuál de estas longitudes es la mayor?',
        opciones: [
          { texto: 'La diagonal espacial', correcta: true },
          { texto: 'La diagonal de la cara <span class="m">b × c</span>' },
          { texto: 'La diagonal de la cara <span class="m">a × c</span>' },
          { texto: 'Todas son iguales' }
        ],
        explicacion: 'Diagonal espacial: <span class="m">√(a² + b² + c²)</span>. Diagonal de la cara mayor: <span class="m">√(b² + c²)</span>. La primera es mayor porque incluye el término <span class="m">a² > 0</span>. La diagonal espacial es siempre la cuerda más larga del ortoedro.',
        pistas: ['Compara las expresiones bajo la raíz.', 'La diagonal espacial añade un término cuadrado positivo.']
      },
      {
        id: 'm6l1e8', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'En un cubo de arista 6, ¿cuál es el ángulo, en grados, entre una diagonal espacial y una arista que no corta? Aproxima a un decimal.',
        unidad: 'grados', respuesta: 54.7, tolerancia: 0.2,
        explicacion: "<span class=\"m\">cos θ=a/(a√3)=1/√3≈0,5774</span>, por lo que el ángulo entre la diagonal espacial y una dirección de arista es <span class=\"m\">θ≈54,7°</span>. En cambio, el ángulo entre la diagonal espacial y el plano de una cara que contiene su proyección mide <span class=\"m\">≈35,26°</span>; son complementarios, no iguales.",
        pistas: ['Elige un vértice y escribe los dos vectores.', 'La arista mide <span class="m">a</span> y la diagonal <span class="m">a√3</span>.']
      }
    ],
    retos: [
      {
        id: 'm6l1r1', titulo: 'Caja con diagonal entera', nivel: 'UNI', puntos: 25,
        enunciado: "Un ortoedro tiene diagonal espacial de 7 cm y volumen de 48 cm³. Sus tres dimensiones serían números enteros positivos. <strong>Determina si tal ortoedro existe</strong> y justifica tu conclusión con una búsqueda completa de ternas. Si no existe, explica por qué no es posible calcular un área total para ese supuesto sólido.",
        estrategia: ['Plantea el sistema con las tres incógnitas.', 'Busca ternas enteras que cumplan <span class="m">a² + b² + c² = 49</span>.', 'Verifica el volumen como filtro final.'],
        desarrollo: [
          'Condiciones: <span class="m">a² + b² + c² = 49</span> y <span class="m">abc = 48</span>, con <span class="m">a, b, c</span> enteros positivos.',
          'Divisores de 48 que podrían aparecer: 1, 2, 3, 4, 6, 8, 12, 16, 24, 48. Como <span class="m">c² < 49</span>, cada dimensión es a lo sumo 6.',
          'Ternas con producto 48 y todas las dimensiones ≤ 6: (2, 4, 6) → producto 48 ✓. Comprobamos la diagonal: <span class="m">4 + 16 + 36 = 56 ≠ 49</span>. ✗',
          '(2, 3, 8): excede el límite de 6 en una dimensión (<span class="m">8² = 64 > 49</span>). ✗',
          '(1, 6, 8): excede. ✗ (1, 4, 12): excede. ✗ (3, 4, 4): producto 48 ✓, diagonal <span class="m">9 + 16 + 16 = 41 ≠ 49</span>. ✗',
          '(2, 2, 12): excede. ✗ Ninguna terna entera cumple ambas condiciones.',
          'Conclusión: no existe tal ortoedro con dimensiones enteras. El problema está mal planteado a propósito: reconocerlo también es parte de la competencia.'
        ],
        respuesta: 'No existe ninguna terna entera. La más cercana es (2, 4, 6): producto 48 pero diagonal <span class="m">√56 ≈ 7,48</span>. Si el volumen fuera 60, la terna (2, 5, 6) daría diagonal <span class="m">√65</span>… El ejercicio entrena la verificación sistemática, no la adivinación.'
      },
      {
        id: 'm6l1r2', titulo: 'Prisma regular hexagonal', nivel: 'UNI', puntos: 25,
        enunciado: 'Un prisma recto tiene base hexagonal regular de lado 4 cm y altura 10 cm. Halla el volumen, el área total y la longitud de la diagonal espacial que une un vértice de la base con el vértice opuesto de la tapa.',
        estrategia: ['Calcula el área del hexágono regular.', 'Usa las fórmulas del prisma recto.', 'Para la diagonal, identifica la diagonal mayor del hexágono.'],
        desarrollo: [
          'Área del hexágono regular de lado <span class="m">s</span>: <span class="m">B = (3√3/2)s² = (3√3/2)(16) = 24√3 ≈ 41,57 cm²</span>.',
          'Volumen: <span class="m">V = B·h = 24√3·10 = 240√3 ≈ 415,7 cm³</span>.',
          'Perímetro: <span class="m">P = 6·4 = 24 cm</span>. Área lateral: <span class="m">24·10 = 240 cm²</span>. Área total: <span class="m">240 + 2·24√3 = 240 + 48√3 ≈ 323,1 cm²</span>.',
          'La diagonal mayor de un hexágono regular de lado 4 mide <span class="m">2s = 8 cm</span> (une vértices opuestos).',
          'Diagonal espacial: <span class="m">√(8² + 10²) = √164 = 2√41 ≈ 12,81 cm</span>.',
          'Comprobación con el ángulo: <span class="m">sen θ = 10/12,81 ≈ 0,781</span> → <span class="m">θ ≈ 51,3°</span> respecto de la base.'
        ],
        respuesta: '<span class="m">V = 240√3 ≈ 415,7 cm³</span>; <span class="m">A_total ≈ 323,1 cm²</span>; diagonal espacial <span class="m">2√41 ≈ 12,81 cm</span>.'
      }
    ]
  });

  /* ==========================================================
     M6 · L2 — Volúmenes por descomposición
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm6l2',
    modulo: 'm6',
    titulo: 'Prismas: problemas de volumen y descomposición',
    resumen: 'Cortar, comparar y transformar sólidos para resolver sin fórmulas nuevas.',
    objetivo: 'Resolver problemas de prismas por descomposición, comparación de volúmenes y razones de semejanza, incluyendo casos con prismas truncados.',
    duracion: '28 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'Muchos problemas de volumen no necesitan una fórmula nueva: necesitan <strong>cortar el sólido en trozos conocidos</strong> o <strong>compararlo con otro</strong>. Un prisma truncado se convierte en un prisma menos una pirámide; una pieza en L se convierte en dos ortoedros.' },
      {
        tipo: 'teorema', titulo: 'Volumen del prisma truncado (principio de la media)', indice: 'Prisma truncado',
        enunciado: 'Si un ortoedro de base <span class="m">B</span> se corta por un plano que produce alturas <span class="m">h₁, h₂, h₃, h₄</span> en los cuatro vértices de la base, el volumen del sólido resultante es <span class="m">V = B · (h₁ + h₂ + h₃ + h₄)/4</span>.',
        justifica: 'Se descompone el sólido en dos prismas triangulares cortando por una diagonal de la base. Cada prisma triangular truncado tiene volumen <span class="m">B/2 · (media de sus tres alturas)</span>, y al sumar, los términos se agrupan en la media de las cuatro alturas. Es el caso discreto del principio de Cavalieri aplicado a la altura lineal.'
      },
      { tipo: 'figura', figura: 'seccion-prisma', indice: 'Figura: sección', titulo: 'Cortes y secciones', pie: 'Un plano inclinado produce un prisma truncado. Las longitudes de las cuatro aristas laterales resultantes son las «alturas» que aparecen en la fórmula de la media.' },
      {
        tipo: 'ejemplo', indice: 'Ejemplo resuelto',
        titulo: 'Piscina con fondo inclinado',
        enunciado: 'Una piscina tiene planta rectangular de 8 m × 4 m. La profundidad varía linealmente de 1 m en un extremo a 2,4 m en el otro. ¿Cuál es su capacidad en litros?',
        pasos: [
          { titulo: 'Reconocer el sólido', html: 'Es un prisma truncado con base de 8 × 4 = 32 m². Las alturas en los cuatro vértices son 1, 1, 2,4, 2,4 (dos vértices a cada profundidad, porque la variación es a lo largo de un lado).' },
          { titulo: 'Aplicar la media', html: '<span class="m">h̄ = (1 + 1 + 2,4 + 2,4)/4 = 6,8/4 = 1,7 m</span>.', cuenta: 'V = 32 · 1,7 = 54,4 m³' },
          { titulo: 'Comprobar con la fórmula directa', html: 'Para un prisma truncado cuya altura varía linealmente en una sola dirección, el volumen es base × altura media de las dos secciones extremas: <span class="m">32 · (1 + 2,4)/2 = 32 · 1,7 = 54,4</span> ✓.' },
          { titulo: 'Convertir unidades', html: '<span class="m">1 m³ = 1000 L</span>, luego <span class="m">54.400 L</span>.', cuenta: 'Capacidad = 54 400 litros' }
        ],
        respuesta: '<span class="m">54,4 m³ = 54 400 litros</span>. La conversión de unidades es parte del problema: en los exámenes hay opciones en litros y en m³ para penalizar el descuido.'
      },
      {
        tipo: 'teorema', titulo: 'Razón de semejanza en volúmenes', indice: 'Semejanza',
        enunciado: 'Si dos sólidos son semejantes con razón de semejanza <span class="m">k</span> (es decir, todas las longitudes se multiplican por <span class="m">k</span>), entonces las áreas se multiplican por <span class="m">k²</span> y los volúmenes por <span class="m">k³</span>.',
        justifica: 'Toda fórmula de área es una suma de productos de dos longitudes, y toda fórmula de volumen, de tres. Al escalar todas las longitudes por <span class="m">k</span>, cada término de área gana un factor <span class="m">k²</span> y cada término de volumen, <span class="m">k³</span>.'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo de semejanza',
        titulo: 'Duplicar el volumen',
        enunciado: 'Si se duplica el volumen de un cubo, ¿en qué factor se multiplica su arista? ¿Y su área total?',
        pasos: [
          { titulo: 'Plantear la relación', html: 'Si <span class="m">V₂ = 2V₁</span> y <span class="m">V = k³V₁</span>, entonces <span class="m">k³ = 2</span>.' },
          { titulo: 'Resolver', html: '<span class="m">k = ∛2 ≈ 1,26</span>. La arista aumenta un 26 %, no un 100 %.' },
          { titulo: 'Área', html: '<span class="m">A₂ = k²A₁ = 2^(2/3)A₁ ≈ 1,587A₁</span>: un 58,7 % más.' },
          { titulo: 'Interpretación', html: 'Este es el motivo por el que duplicar el tamaño de un objeto multiplica por cuatro su superficie y por ocho su volumen (o, al revés, duplicar el volumen solo aumenta la superficie un 59 %). Aparece en problemas de pintura, calor y densidad.' }
        ],
        respuesta: 'La arista se multiplica por <span class="m">∛2 ≈ 1,26</span> y el área por <span class="m">2^(2/3) ≈ 1,587</span>. Error típico: responder «el doble» en ambos casos.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Duplicar el volumen y duplicar también las longitudes.', bien: 'Usar <span class="m">k = ∛2</span>.', porque: 'El volumen depende del cubo de la longitud; duplicar longitudes multiplica el volumen por 8.' },
          { mal: 'Sumar áreas de prismas sin comprobar que no se solapan.', bien: 'Verificar que las piezas son disjuntas y que la unión cubre el sólido.', porque: 'Una descomposición correcta exige que las piezas no se superpongan; si se superponen, se cuenta dos veces.' },
          { mal: 'Aplicar la fórmula del prisma truncado a sólidos con alturas no lineales.', bien: 'Comprobar que la variación de altura es lineal (plano de corte).', porque: 'La media de las cuatro alturas solo vale para un corte plano; con un corte curvo hay que integrar.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm6l2e1', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'Un cubo de arista 2 se estira de modo que su arista se triplica. ¿En qué factor se multiplica su volumen?',
        unidad: 'veces', respuesta: 27, tolerancia: 0,
        explicacion: '<span class="m">k = 3</span>, entonces el volumen se multiplica por <span class="m">k³ = 27</span>. (El área lo haría por <span class="m">k² = 9</span>.)',
        pistas: ['El volumen de un cubo depende del cubo de la arista.', '<span class="m">(3a)³ = 27a³</span>.']
      },
      {
        id: 'm6l2e2', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'Un prisma recto truncado por un <strong>plano</strong> tiene base rectangular de 10 m² y alturas de 2, 3, 5 y 4 m medidas <strong>en ese orden alrededor de la base</strong> (vértices opuestos: 2 y 5, 3 y 4). ¿Cuál es su volumen?',
        unidad: 'm³', respuesta: 35, tolerancia: 0,
        explicacion: 'Al ser un corte plano sobre base rectangular, las alturas opuestas deben tener igual suma: <span class="m">2+5=3+4=7</span>. Altura media: <span class="m">(2+3+5+4)/4=3,5</span>. Volumen: <span class="m">10·3,5=35 m³</span>. Si las alturas no fueran compatibles con un plano, no podría aplicarse directamente este promedio.',
        pistas: ['Usa la media de las cuatro alturas.', '<span class="m">V = B · h̄</span>.']
      },
      {
        id: 'm6l2e3', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'Si dos cubos son semejantes y la arista del segundo es el triple, la razón entre sus áreas totales es:',
        opciones: [
          { texto: '9 : 1', correcta: true },
          { texto: '3 : 1' },
          { texto: '27 : 1' },
          { texto: '6 : 1' }
        ],
        explicacion: 'Las áreas escalan con <span class="m">k² = 9</span> y los volúmenes con <span class="m">k³ = 27</span>. Confundir 9 con 27 es el error más común: el 27 es la razón de volúmenes, no de áreas.',
        pistas: ['¿El área es proporcional a la longitud, a su cuadrado o a su cubo?', 'k = 3 → ¿k² o k³?']
      },
      {
        id: 'm6l2e4', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'Una pieza tiene forma de ortoedro de 6 × 4 × 3 al que se le extrae, en una esquina, un cubo de arista 2. ¿Cuál es el volumen restante?',
        unidad: 'u³', respuesta: 64, tolerancia: 0,
        explicacion: 'Volumen del ortoedro: <span class="m">6·4·3 = 72</span>. Volumen del cubo extraído: <span class="m">2³ = 8</span>. Restante: <span class="m">72 − 8 = 64</span>. Nota: si la extracción estuviera en el centro, sería una cavidad; en la esquina, se trata de una muesca abierta, y el volumen restante se calcula igual.',
        pistas: ['Calcula los dos volúmenes por separado.', 'Resta el volumen extraído.']
      },
      {
        id: 'm6l2e5', tipo: 'opcion', dificultad: 'Básico',
        pregunta: 'El volumen de un ortoedro de dimensiones <span class="m">a</span>, <span class="m">b</span>, <span class="m">c</span> es:',
        opciones: [
          { texto: '<span class="m">a·b·c</span>', correcta: true },
          { texto: '<span class="m">2(ab + bc + ca)</span>' },
          { texto: '<span class="m">a + b + c</span>' },
          { texto: '<span class="m">abc/3</span>' }
        ],
        explicacion: '<span class="m">a·b·c</span> es el volumen; <span class="m">2(ab+bc+ca)</span> es el área total. La opción <span class="m">abc/3</span> confunde con el volumen de una pirámide, donde sí aparece el factor <span class="m">1/3</span>.',
        pistas: ['Distingue entre volumen y área superficial.', 'Una pirámide tiene factor 1/3; un prisma no.']
      }
    ],
    retos: [
      {
        id: 'm6l2r1', titulo: 'Depósito con dos caudales', nivel: 'UNI', puntos: 25,
        enunciado: 'Un depósito prismático de base 2 m × 3 m y altura 4 m se llena con un caudal de 12 L/min y se vacía con otro de 4 L/min que funciona simultáneamente. ¿Cuánto tarda en llenarse y cuánto costaría llenarlo si el agua cuesta 3,5 soles por m³?',
        estrategia: ['Convierte todas las unidades al mismo sistema antes de operar.', 'Trabaja con el caudal neto.', 'Separa el cálculo del tiempo del cálculo del coste.'],
        desarrollo: [
          'Volumen del depósito: <span class="m">2·3·4 = 24 m³ = 24 000 L</span>.',
          'Caudal neto: <span class="m">12 − 4 = 8 L/min</span>.',
          'Tiempo: <span class="m">24 000/8 = 3000 min = 50 horas</span>.',
          'Coste: <span class="m">24 m³ · 3,5 S//m³ = 84 soles</span>.',
          'Comprobación de unidades: minutos × (L/min) = L ✓; m³ × (S//m³) = S/ ✓.'
        ],
        respuesta: '<span class="m">3000 min = 50 h</span>; coste <span class="m">84 soles</span>. Si se olvida el caudal de salida, el tiempo resulta <span class="m">2000 min ≈ 33,3 h</span>: es el distractor clásico.'
      }
    ]
  });
})();
