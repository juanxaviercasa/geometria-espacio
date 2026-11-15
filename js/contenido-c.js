/* ============================================================
   contenido-c.js — módulos 7, 8 y 9
   M7 Pirámides
   M8 Cilindro, cono y esfera
   M9 Poliedros regulares
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     M7 · L1 — Pirámides
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm7l1',
    modulo: 'm7',
    titulo: 'Pirámides: altura, apotema y arista lateral',
    resumen: 'El triángulo rectángulo que explica todas las medidas de una pirámide regular.',
    objetivo: 'Distinguir altura, apotema de la pirámide y arista lateral, aplicar las relaciones métricas de la pirámide regular y calcular áreas y volúmenes.',
    duracion: '30 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'Una pirámide tiene tres longitudes que se confunden todo el tiempo: la <strong>altura</strong> (del vértice al centro de la base), la <strong>apotema</strong> (del vértice al punto medio de una arista básica) y la <strong>arista lateral</strong> (del vértice a un vértice de la base). Están relacionadas por dos triángulos rectángulos, y con ellos se resuelve casi cualquier problema.' },
      {
        tipo: 'definicion', titulo: 'Elementos de una pirámide', indice: 'Elementos',
        html: '<p>Una <strong>pirámide</strong> es un poliedro con una cara poligonal llamada <strong>base</strong> y caras laterales triangulares que concurren en un punto llamado <strong>vértice</strong> o <strong>cúspide</strong>.</p>' +
          '<ul>' +
          '<li><strong>Altura <span class="m">h</span>:</strong> distancia del vértice al plano de la base. Su pie es el centro <var>O</var> de la base si la pirámide es regular.</li>' +
          '<li><strong>Apotema de la base <span class="m">a<sub>b</sub></span>:</strong> distancia del centro <var>O</var> al punto medio de una arista básica.</li>' +
          '<li><strong>Apotema de la pirámide <span class="m">a<sub>p</sub></span>:</strong> distancia del vértice al punto medio de una arista básica. Es la altura de una cara lateral.</li>' +
          '<li><strong>Arista lateral <span class="m">L</span>:</strong> segmento del vértice a un vértice de la base.</li>' +
          '<li><strong>Radio de la base <span class="m">R</span>:</strong> distancia del centro <var>O</var> a un vértice de la base.</li>' +
          '</ul>' +
          '<p>Una pirámide es <strong>regular</strong> si su base es un polígono regular y el pie de la altura es el centro de la base. En ese caso las caras laterales son triángulos isósceles congruentes.</p>'
      },
      {
        tipo: 'teorema', titulo: 'Las tres relaciones métricas', indice: 'Relaciones métricas',
        enunciado: '<p>En una pirámide regular de altura <span class="m">h</span>, apotema de la base <span class="m">a<sub>b</sub></span>, apotema de la pirámide <span class="m">a<sub>p</sub></span>, radio de la base <span class="m">R</span> y arista lateral <span class="m">L</span>:</p>' +
          '<p class="m" style="font-family:var(--mono)">a<sub>p</sub>² = h² + a<sub>b</sub>² &nbsp;&nbsp; L² = h² + R² &nbsp;&nbsp; L² = a<sub>p</sub>² + (lado/2)²</p>',
        justifica: '<p>Los tres triángulos son rectángulos porque la altura es perpendicular a la base:</p>' +
          '<ul><li><span class="m">V O M</span> es rectángulo en <var>O</var> (con <var>M</var> punto medio de una arista): catetos <span class="m">h</span> y <span class="m">a<sub>b</sub></span>, hipotenusa <span class="m">a<sub>p</sub></span>.</li>' +
          '<li><span class="m">V O A</span> es rectángulo en <var>O</var> (con <var>A</var> vértice de la base): catetos <span class="m">h</span> y <span class="m">R</span>, hipotenusa <span class="m">L</span>.</li>' +
          '<li>En la cara lateral, <span class="m">V M A</span> es rectángulo en <var>M</var>: catetos <span class="m">a<sub>p</sub></span> y medio lado, hipotenusa <span class="m">L</span>.</li></ul>'
      },
      { tipo: 'figura', figura: 'piramide-elementos', indice: 'Figura: la pirámide y sus tres medidas', titulo: 'Altura, apotema y arista lateral', pie: 'Activa una capa cada vez para fijar la vista en una sola magnitud. El ángulo recto marcado en <var>O</var> justifica los tres teoremas de Pitágoras.' },
      {
        tipo: 'formulas', titulo: 'Áreas y volumen', indice: 'Fórmulas',
        items: [
          { f: 'V = (1/3) · B · h', desc: 'B = área de la base, h = altura. El factor 1/3 es lo que distingue la pirámide del prisma con la misma base y altura.' },
          { f: 'A_lateral = (1/2) · P · a_p', desc: 'En la pirámide regular: perímetro de la base por apotema de la pirámide, dividido entre 2. Equivale a sumar n triángulos de base lado y altura a_p.' },
          { f: 'A_total = A_lateral + B', desc: 'Una sola base, no dos.' },
          { f: 'a_p = √(h² + a_b²)', desc: 'Relación entre apotema, altura y apotema de la base.' },
          { f: 'L = √(h² + R²)', desc: 'Relación entre arista lateral, altura y radio de la base.' }
        ]
      },
      {
        tipo: 'nota', variante: 'dato',
        html: '<p><strong>Valores de apotema y radio de la base según el polígono regular de lado <span class="m">l</span>:</strong> cuadrado <span class="m">a<sub>b</sub> = l/2</span>, <span class="m">R = l√2/2</span>; triángulo equilátero <span class="m">a<sub>b</sub> = l√3/6</span>, <span class="m">R = l√3/3</span>; hexágono regular <span class="m">a<sub>b</sub> = l√3/2</span>, <span class="m">R = l</span>. Memorizar el caso del hexágono ahorra tiempo: en él, el radio <em>es</em> el lado.</p>'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo 1',
        titulo: 'Pirámide cuadrangular regular completa',
        enunciado: 'Una pirámide cuadrangular regular tiene lado de la base 6 cm y arista lateral 5 cm. Calcula la altura, la apotema, el área lateral, el área total y el volumen.',
        pasos: [
          { titulo: 'Radio de la base', html: 'El cuadrado de lado 6 tiene radio <span class="m">R = 6√2/2 = 3√2 ≈ 4,243</span>.' },
          { titulo: 'Altura', html: 'Del triángulo <span class="m">VOA</span>: <span class="m">L² = h² + R²</span>, luego <span class="m">h² = 25 − 18 = 7</span>.', cuenta: 'h = √7 ≈ 2,646 cm' },
          { titulo: 'Apotema de la base', html: '<span class="m">a<sub>b</sub> = lado/2 = 3</span>.' },
          { titulo: 'Apotema de la pirámide', html: '<span class="m">a<sub>p</sub>² = h² + a<sub>b</sub>² = 7 + 9 = 16</span>.', cuenta: 'a_p = 4 cm' },
          { titulo: 'Área lateral', html: '<span class="m">P = 24</span>, <span class="m">A_lat = (1/2)·24·4 = 48 cm²</span>.' },
          { titulo: 'Área total', html: '<span class="m">B = 36</span>, <span class="m">A_total = 48 + 36 = 84 cm²</span>.' },
          { titulo: 'Volumen', html: '<span class="m">V = (1/3)·36·√7 = 12√7 ≈ 31,75 cm³</span>.' }
        ],
        respuesta: '<span class="m">h = √7 ≈ 2,65 cm</span>; <span class="m">a_p = 4 cm</span>; <span class="m">A_total = 84 cm²</span>; <span class="m">V = 12√7 ≈ 31,7 cm³</span>. Observa que la apotema resultó entera: el problema estaba construido con una terna 3‑4‑5.'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo 2 (tipo UNI)',
        titulo: 'Pirámide con caras laterales equiláteras',
        enunciado: 'Una pirámide tiene base cuadrada de lado <span class="m">a</span> y todas sus caras laterales son triángulos equiláteros. Halla su altura y su volumen. ¿Existe realmente?',
        pasos: [
          { titulo: 'Arista lateral', html: 'Si las caras laterales son equiláteras de lado <span class="m">a</span>, entonces la arista lateral es <span class="m">L = a</span>.' },
          { titulo: 'Altura', html: '<span class="m">h² = L² − R² = a² − a²/2 = a²/2</span>.', cuenta: 'h = a/√2 = a√2/2 ≈ 0,707a' },
          { titulo: 'Comprobación de la apotema', html: '<span class="m">a<sub>p</sub>² = h² + (a/2)² = a²/2 + a²/4 = 3a²/4</span>, luego <span class="m">a<sub>p</sub> = a√3/2</span>: exactamente la altura del triángulo equilátero de lado <span class="m">a</span> ✓. Coherente.' },
          { titulo: '¿Existe?', html: 'Sí. El vértice está a altura <span class="m">a/√2 ≈ 0,707a</span>, positiva. La pirámide es «baja» comparada con su base, y por eso las caras pueden ser equiláteras sin que el vértice quede en el plano de la base.' },
          { titulo: 'Volumen', html: '<span class="m">V = (1/3)·a²·(a/√2) = a³/(3√2) = a³√2/6 ≈ 0,2357a³</span>.' }
        ],
        respuesta: "<span class=\"m\">h=a√2/2</span> y <span class=\"m\">V=a³√2/6</span>. El diedro entre cada cara lateral y la base es <span class=\"m\">arctan(√2)≈54,74°</span>, no 45°. Se comprueba con <span class=\"m\">cos θ=1/√3</span>."
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Usar <span class="m">V = B·h</span> en una pirámide.', bien: '<span class="m">V = (1/3)B·h</span>.', porque: 'El factor 1/3 proviene de que tres pirámides congruentes llenan el prisma de igual base y altura. Omitirlo triplica el resultado.' },
          { mal: 'Usar la arista lateral como apotema en <span class="m">A_lateral = (1/2)P·a_p</span>.', bien: 'Calcular <span class="m">a_p</span> con <span class="m">a_p² = h² + a_b²</span>.', porque: 'La apotema es la altura <em>de la cara</em>; la arista lateral es el lado inclinado de la cara. Su longitud es mayor.' },
          { mal: 'Calcular la altura con <span class="m">h² = L² − (lado/2)²</span>.', bien: '<span class="m">h² = L² − R²</span>, con <span class="m">R</span> el radio de la base.', porque: 'Confundir el radio con el semi-lado es el error que aparece incluso en textos escolares. En el cuadrado, <span class="m">R = lado·√2/2</span>, no <span class="m">lado/2</span>.' },
          { mal: 'Sumar dos bases en el área total.', bien: 'Sumar una sola base.', porque: 'La pirámide tiene una única base; la confusión viene de las fórmulas de prismas.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm7l1e1', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'Una pirámide cuadrangular regular tiene lado de base 8 y altura 3. ¿Cuánto mide su apotema?',
        unidad: 'u', respuesta: 5, tolerancia: 0.01,
        explicacion: 'Apotema de la base: <span class="m">a<sub>b</sub> = 4</span>. Apotema de la pirámide: <span class="m">a_p = √(3² + 4²) = √25 = 5</span>. Es una terna 3‑4‑5 perfecta.',
        pistas: ['La apotema de la base de un cuadrado es la mitad del lado.', 'Aplica Pitágoras con la altura y esa apotema.']
      },
      {
        id: 'm7l1e2', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'Una pirámide tiene base de 36 cm² y altura 10 cm. ¿Cuál es su volumen?',
        unidad: 'cm³', respuesta: 120, tolerancia: 0,
        explicacion: '<span class="m">V = (1/3)·36·10 = 120 cm³</span>. Si olvidas el factor 1/3 obtienes 360, el triple.',
        pistas: ['Recuerda el factor 1/3.', '<span class="m">36·10 = 360</span>; divide entre 3.']
      },
      {
        id: 'm7l1e3', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'En una pirámide regular, ¿cuál es la relación correcta?',
        opciones: [
          { texto: '<span class="m">a_p² = h² + a_b²</span>', correcta: true },
          { texto: '<span class="m">a_p² = h² − a_b²</span>' },
          { texto: '<span class="m">L² = h² + a_b²</span>' },
          { texto: '<span class="m">h² = a_p² + a_b²</span>' }
        ],
        explicacion: 'El triángulo <span class="m">VOM</span> es rectángulo en <var>O</var> con catetos <span class="m">h</span> y <span class="m">a<sub>b</sub></span> e hipotenusa <span class="m">a<sub>p</sub></span>. La relación con <span class="m">L</span> usa el radio <span class="m">R</span>, no la apotema de la base.',
        pistas: ['Dibuja el triángulo que forma la altura con la apotema de la base.', '¿Cuál es la hipotenusa de ese triángulo?']
      },
      {
        id: 'm7l1e4', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'Una pirámide hexagonal regular tiene lado de base 4 y altura 6. ¿Cuál es su volumen?',
        unidad: 'u³', respuesta: 83.14, tolerancia: 0.5,
        explicacion: 'Área del hexágono regular de lado 4: <span class="m">(3√3/2)·16 = 24√3 ≈ 41,569</span>. Volumen: <span class="m">(1/3)·24√3·6 = 48√3 ≈ 83,14</span>.',
        pistas: ['Área del hexágono regular: <span class="m">(3√3/2)s²</span>.', 'Multiplica por la altura y divide entre 3.']
      },
      {
        id: 'm7l1e5', tipo: 'opcion', dificultad: 'Avanzado',
        pregunta: 'En una pirámide cuadrangular regular de lado <span class="m">a</span> cuyas caras laterales son triángulos equiláteros, ¿cuánto vale el coseno del ángulo entre una cara lateral y la base?',
        opciones: [
          { texto: '<span class="m">1/√3</span>', correcta: true },
          { texto: '<span class="m">1/√2</span>' },
          { texto: '<span class="m">1/2</span>' },
          { texto: '<span class="m">√3/2</span>' }
        ],
        explicacion: 'El ángulo entre una cara lateral y la base es el del triángulo rectángulo formado por la apotema de la base <span class="m">a<sub>b</sub> = a/2</span> y la apotema de la pirámide <span class="m">a<sub>p</sub></span>; como las caras son equiláteras de lado <span class="m">a</span>, <span class="m">a<sub>p</sub> = a√3/2</span>. Entonces <span class="m">cos θ = a<sub>b</sub>/a<sub>p</sub> = (a/2)/(a√3/2) = 1/√3 ≈ 0,5774</span>, es decir <span class="m">θ ≈ 54,7°</span>. Este ángulo coincide con el que forma la diagonal espacial del cubo con una arista: no es casualidad, es la misma configuración geométrica.',
        pistas: ['En el triángulo rectángulo de la apotema, el cateto adyacente al ángulo es <span class="m">a<sub>b</sub></span> y la hipotenusa es <span class="m">a<sub>p</sub></span>.', 'Con caras equiláteras, <span class="m">a<sub>p</sub> = a√3/2</span> y <span class="m">a<sub>b</sub> = a/2</span>.']
      },
      {
        id: 'm7l1e6', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: "Una pirámide triangular regular tiene lado de base 6 y arista lateral 5. ¿Cuánto mide su altura? Redondea a dos decimales. Distingue la altura perpendicular de la apotema de las caras.",
        unidad: 'u', respuesta: 3.61, tolerancia: 0.02,
        explicacion: "En la base equilátera de lado 6, el radio circunscrito es <span class=\"m\">R=6√3/3=2√3</span>. La arista lateral y la altura forman un triángulo rectángulo con catetos R y h, por tanto <span class=\"m\">h=√(5²-(2√3)²)=√13≈3,60555</span>. Redondeando a dos decimales: <strong>3,61</strong> (no debe confundirse con la apotema lateral).",
        pistas: ['El radio de un triángulo equilátero de lado <span class="m">l</span> es <span class="m">l√3/3</span>.', '<span class="m">h² = L² − R²</span>.']
      }
    ],
    retos: [
      {
        id: 'm7l1r1', titulo: 'Pirámide inscrita en un cubo', nivel: 'UNI', puntos: 25,
        enunciado: "En un cubo de arista <var>a</var>, se forma una pirámide con vértice en <var>A</var> y base en la cara superior <span class=\"m\">A₁B₁C₁D₁</span>. Calcula su volumen y la fracción del cubo que ocupa. Después, calcula el ángulo entre la arista lateral <strong><span class=\"m\">AC₁</span></strong> (diagonal espacial del cubo) y el plano de la base.",
        estrategia: ["Esta pirámide no es regular: el pie de su altura es A₁, un vértice de la base, no el centro.","Su base es un cuadrado de lado a; la distancia entre el vértice A y el plano superior es a.","La arista especificada AC₁ es una diagonal espacial; proyecta AC₁ sobre A₁C₁ para hallar su ángulo con la base."],
        desarrollo: ["La base <span class=\"m\">A₁B₁C₁D₁</span> tiene área <span class=\"m\">B=a²</span>.","Como <span class=\"m\">AA₁</span> es perpendicular a la cara superior, la altura es <span class=\"m\">h=AA₁=a</span>; su pie <var>A₁</var> no es el centro de la base.","El volumen vale <span class=\"m\">V=(1/3)a²·a=a³/3</span>, así que representa exactamente <span class=\"m\">1/3</span> del volumen del cubo.","La arista lateral elegida, <span class=\"m\">AC₁</span>, mide <span class=\"m\">a√3</span>. Su proyección ortogonal sobre el plano de la base es la diagonal <span class=\"m\">A₁C₁</span> de longitud <span class=\"m\">a√2</span>, no una semidiagonal.","En el triángulo rectángulo <span class=\"m\">AA₁C₁</span>, <span class=\"m\">sen θ=AA₁/AC₁=1/√3</span> y <span class=\"m\">cos θ=A₁C₁/AC₁=√(2/3)</span>. Por ello <span class=\"m\">θ≈35,26°</span>.","Comprueba el alcance: otras aristas laterales de esta pirámide tienen ángulos diferentes. <span class=\"m\">AA₁</span> forma 90° y <span class=\"m\">AB₁</span> forma 45° con la base; por eso el enunciado especifica <span class=\"m\">AC₁</span>."],
        respuesta: "<span class=\"m\">V=a³/3</span> (un tercio del cubo) y, para la arista <strong><span class=\"m\">AC₁</span></strong>, <span class=\"m\">sen θ=1/√3</span>, <span class=\"m\">cos θ=√(2/3)</span> y <span class=\"m\">θ≈35,26°</span>. Es una pirámide oblicua respecto al centro de su base."
      }
    ]
  });

  /* ==========================================================
     M8 · L1 — Cuerpos de revolución
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm8l1',
    modulo: 'm8',
    titulo: 'Cilindro, cono y esfera',
    resumen: 'Desarrollos planos, áreas curvas y el factor 4/3 que nadie debe olvidar.',
    objetivo: 'Calcular áreas y volúmenes de cilindros, conos y esferas, construir sus desarrollos planos y resolver problemas de capacidad y comparación.',
    duracion: '32 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'Un cuerpo de revolución se genera al girar una figura plana alrededor de un eje. Un rectángulo genera un <strong>cilindro</strong>; un triángulo rectángulo, un <strong>cono</strong>; un semicírculo, una <strong>esfera</strong>. La ventaja de pensarlo así es que las fórmulas salen del desarrollo plano.' },
      {
        tipo: 'formulas', titulo: 'Cilindro circular recto', indice: 'Cilindro',
        items: [
          { f: 'A_lateral = 2πr·h', desc: 'Al desarrollar la superficie lateral se obtiene un rectángulo de base 2πr (la circunferencia) y altura h.' },
          { f: 'A_total = 2πr·h + 2πr²', desc: 'Dos bases circulares más la superficie lateral.' },
          { f: 'V = πr²·h', desc: 'Área de la base por altura. Es un «prisma de base circular».' },
          { f: 'd = √((2r)² + h²)', desc: 'Diagonal de la sección axial: el rectángulo de lados 2r y h.' }
        ]
      },
      { tipo: 'figura', figura: 'cilindro', indice: 'Figura: cilindro', titulo: 'Cilindro: radio, altura y generatriz', pie: 'La generatriz del cilindro mide lo mismo que la altura. Al cortar y desplegar la superficie lateral aparece un rectángulo de base <span class="m">2πr</span>.' },
      {
        tipo: 'formulas', titulo: 'Cono circular recto', indice: 'Cono',
        items: [
          { f: 'g² = r² + h²', desc: 'La generatriz, el radio y la altura forman un triángulo rectángulo. Es la relación que permite pasar de unos datos a otros.' },
          { f: 'A_lateral = πr·g', desc: 'Al desarrollar la superficie lateral se obtiene un sector circular de radio g y arco 2πr.' },
          { f: 'A_total = πr·g + πr²', desc: 'Superficie lateral más la base.' },
          { f: 'V = (1/3)πr²·h', desc: 'Un tercio del cilindro con la misma base y altura.' },
          { f: 'ángulo del sector = 360°·(r/g)', desc: 'Amplitud del sector circular del desarrollo lateral.' }
        ]
      },
      { tipo: 'figura', figura: 'cono', indice: 'Figura: cono', titulo: 'Cono: generatriz, radio y altura', pie: 'El triángulo rectángulo formado por <span class="m">g</span>, <span class="m">r</span> y <span class="m">h</span> es la clave de todos los cálculos del cono.' },
      {
        tipo: 'formulas', titulo: 'Esfera', indice: 'Esfera',
        items: [
          { f: 'A = 4πR²', desc: 'La superficie esférica tiene exactamente el área de cuatro círculos máximos.' },
          { f: 'V = (4/3)πR³', desc: 'El factor 4/3 es el más olvidado de la geometría del espacio.' },
          { f: 'A_casquete = 2πR·h', desc: 'Área de una zona esférica de altura h. Sorprendentemente, no depende de dónde se corte.' }
        ]
      },
      { tipo: 'figura', figura: 'esfera', indice: 'Figura: esfera', titulo: 'Esfera y círculo máximo', pie: 'Todos los puntos están a la misma distancia <span class="m">R</span> del centro. El círculo máximo tiene radio <span class="m">R</span> y divide a la esfera en dos hemisferios.' },
      {
        tipo: 'nota', variante: 'ojo',
        html: '<p><strong>Radio contra diámetro.</strong> Antes de sustituir en cualquier fórmula, identifica si el dato es radio o diámetro. Un error clásico: dar el diámetro y usarlo como radio, lo que multiplica el volumen por 8 y el área por 4. Escribe siempre <span class="m">r = d/2</span> como primer paso y no vuelvas atrás.</p>'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo 1',
        titulo: 'Comparar cilindro y cono',
        enunciado: 'Un cilindro y un cono tienen el mismo radio 3 cm y la misma altura 8 cm. Compara sus volúmenes y sus áreas laterales. El cono tiene <span class="m">g = √(3² + 8²) = √73 ≈ 8,544</span>.',
        pasos: [
          { titulo: 'Volumen del cilindro', html: '<span class="m">V_cil = π·9·8 = 72π ≈ 226,2 cm³</span>.' },
          { titulo: 'Volumen del cono', html: '<span class="m">V_cono = (1/3)·π·9·8 = 24π ≈ 75,4 cm³</span>.' },
          { titulo: 'Razón', html: '<span class="m">72π : 24π = 3 : 1</span>. El cono es exactamente un tercio del cilindro. Es la misma relación que prisma-pirámide.' },
          { titulo: 'Área lateral del cilindro', html: '<span class="m">2π·3·8 = 48π ≈ 150,8 cm²</span>.' },
          { titulo: 'Área lateral del cono', html: '<span class="m">π·3·√73 = 3π√73 ≈ 80,5 cm²</span>. Es mucho menor: aunque la generatriz es más larga que la altura, la superficie lateral del cono se cierra hacia el vértice.' }
        ],
        respuesta: '<span class="m">V_cil : V_cono = 3 : 1</span>. Las áreas laterales no guardan una razón simple: <span class="m">48π</span> frente a <span class="m">3π√73</span>.'
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo 2 (tipo UNI)',
        titulo: 'Esfera inscrita en un cilindro',
        enunciado: 'Una esfera de radio <span class="m">R</span> está inscrita en un cilindro (es tangente a las bases y a la superficie lateral). Halla la razón entre el volumen de la esfera y el del cilindro, y la razón entre sus superficies.',
        pasos: [
          { titulo: 'Dimensiones del cilindro', html: 'Si la esfera es tangente a las bases, la altura del cilindro es el diámetro: <span class="m">h = 2R</span>. Si es tangente lateralmente, el radio del cilindro es <span class="m">r = R</span>.' },
          { titulo: 'Volumen del cilindro', html: '<span class="m">V_cil = πR²·2R = 2πR³</span>.' },
          { titulo: 'Volumen de la esfera', html: '<span class="m">V_esf = (4/3)πR³</span>.' },
          { titulo: 'Razón de volúmenes', html: '<span class="m">V_esf / V_cil = (4/3)πR³ / (2πR³) = 2/3</span>.' },
          { titulo: 'Superficies', html: '<span class="m">A_esf = 4πR²</span>; <span class="m">A_cil = 2πR·2R + 2πR² = 4πR² + 2πR² = 6πR²</span>.' },
          { titulo: 'Razón de superficies', html: '<span class="m">4πR² / 6πR² = 2/3</span>. ¡La misma razón! Este resultado lo descubrió Arquímides y pidió que lo grabaran en su tumba.' }
        ],
        respuesta: 'Ambas razones son <span class="m">2 : 3</span>. La esfera ocupa dos tercios del cilindro que la circunscribe y su superficie es también dos tercios de la del cilindro.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Usar el diámetro como radio.', bien: '<span class="m">r = d/2</span> antes de sustituir.', porque: 'Multiplica el volumen por 8 y el área por 4, y suele coincidir con uno de los distractores.' },
          { mal: 'Calcular el volumen del cono como <span class="m">πr²h</span>.', bien: '<span class="m">(1/3)πr²h</span>.', porque: 'El cono es un tercio del cilindro; es la misma relación prisma-pirámide.' },
          { mal: 'Usar la altura en lugar de la generatriz en <span class="m">A_lateral = πrg</span>.', bien: 'Calcular <span class="m">g = √(r² + h²)</span>.', porque: 'La generatriz es el lado inclinado del cono, siempre mayor que la altura. Confundirlos subestima el área.' },
          { mal: 'Calcular <span class="m">A = 2πR²</span> para la esfera.', bien: '<span class="m">A = 4πR²</span>.', porque: 'Cuatro círculos máximos, no dos. El 2 corresponde a la media esfera o a una base circular duplicada.' },
          { mal: 'Olvidar el factor 4/3 en el volumen de la esfera.', bien: '<span class="m">V = (4/3)πR³</span>.', porque: 'Sin el 4/3 se obtiene un valor menor. Truco: <span class="m">V_esfera = (2/3)·V_cilindro circunscrito = (2/3)(2πR³) = 4πR³/3</span> ✓.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm8l1e1', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'Un cilindro tiene radio 3 y altura 7. ¿Cuál es su volumen? Usa π ≈ 3,1416 y redondea a dos decimales.',
        unidad: 'u³', respuesta: 197.92, tolerancia: 0.1,
        explicacion: '<span class="m">V = πr²h = π·9·7 = 63π ≈ 197,92</span>.',
        pistas: ['Área de la base: <span class="m">πr²</span>.', 'Multiplica por la altura.']
      },
      {
        id: 'm8l1e2', tipo: 'numerico', dificultad: 'Básico',
        pregunta: '¿Cuál es el volumen de una esfera de radio 3? Usa π ≈ 3,1416 y redondea a dos decimales.',
        unidad: 'u³', respuesta: 113.1, tolerancia: 0.1,
        explicacion: '<span class="m">V = (4/3)π·27 = 36π ≈ 113,10</span>. Sin el 4/3 daría <span class="m">27π ≈ 84,82</span>, el distractor típico.',
        pistas: ['<span class="m">V = (4/3)πR³</span>.', '<span class="m">R³ = 27</span>.']
      },
      {
        id: 'm8l1e3', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'Un cono tiene radio 5 y generatriz 13. ¿Cuál es su volumen? Usa π ≈ 3,1416.',
        unidad: 'u³', respuesta: 314.16, tolerancia: 0.2,
        explicacion: 'Altura: <span class="m">h = √(169 − 25) = √144 = 12</span>. Volumen: <span class="m">(1/3)π·25·12 = 100π ≈ 314,16</span>. La terna 5‑12‑13 es clásica.',
        pistas: ['Usa <span class="m">g² = r² + h²</span> para obtener la altura.', 'La terna 5‑12‑13 aparece aquí.']
      },
      {
        id: 'm8l1e4', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'Si se duplica el radio de una esfera, su volumen se multiplica por:',
        opciones: [
          { texto: '8', correcta: true },
          { texto: '2' },
          { texto: '4' },
          { texto: '6' }
        ],
        explicacion: 'El volumen depende de <span class="m">R³</span>: <span class="m">(2R)³ = 8R³</span>. El área se multiplicaría por 4 (<span class="m">R²</span>) y la circunferencia por 2.',
        pistas: ['¿Qué exponente tiene R en la fórmula del volumen?', '<span class="m">2³ = 8</span>.']
      },
      {
        id: 'm8l1e5', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'Un depósito cilíndrico de radio 2 m y altura 5 m está lleno hasta el 80 %. ¿Cuántos litros contiene? Usa π ≈ 3,1416 y redondea al litro.',
        unidad: 'litros', respuesta: 50265, tolerancia: 50,
        explicacion: 'Volumen total: <span class="m">π·4·5 = 20π ≈ 62,832 m³</span>. Al 80 %: <span class="m">50,265 m³</span>. En litros: <span class="m">50 265 L</span> (1 m³ = 1000 L).',
        pistas: ['<span class="m">V = πr²h</span> en m³.', 'Multiplica por 0,8 y luego por 1000.']
      },
      {
        id: 'm8l1e6', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'La superficie total de la esfera de radio R es:',
        opciones: [
          { texto: '<span class="m">4πR²</span>', correcta: true },
          { texto: '<span class="m">2πR²</span>' },
          { texto: '<span class="m">πR²</span>' },
          { texto: '<span class="m">(4/3)πR³</span>' }
        ],
        explicacion: 'La superficie esférica equivale a cuatro círculos máximos. La opción <span class="m">(4/3)πR³</span> es el volumen, no el área, y las unidades lo delatarían: el volumen va en unidades cúbicas.',
        pistas: ['¿Cuántos círculos máximos forman la superficie de la esfera?', 'Comprueba las unidades: el área debe ir en unidades cuadradas.']
      }
    ],
    retos: [
      {
        id: 'm8l1r1', titulo: 'Cono y cilindro con la misma área', nivel: 'UNI', puntos: 25,
        enunciado: 'Un cilindro y un cono tienen la misma área total y la misma base de radio <span class="m">r</span>. Si la altura del cilindro es <span class="m">h</span>, expresa la generatriz del cono y compara los volúmenes.',
        estrategia: ['Iguala las áreas totales.', 'Sustituye la relación <span class="m">g² = r² + h_c²</span> para la altura del cono.', 'Compara los volúmenes al final.'],
        desarrollo: [
          'Área total del cilindro: <span class="m">2πrh + 2πr²</span>.',
          'Área total del cono: <span class="m">πrg + πr²</span>.',
          'Igualando: <span class="m">2πrh + 2πr² = πrg + πr²</span> → <span class="m">2rh + 2r² = rg + r²</span> → <span class="m">rg = 2rh + r²</span> → <span class="m">g = 2h + r</span>.',
          'Altura del cono: <span class="m">h_c = √(g² − r²) = √((2h+r)² − r²) = √(4h² + 4hr) = 2√(h² + hr)</span>.',
          'Volumen del cono: <span class="m">V_c = (1/3)πr²·2√(h² + hr)</span>. Volumen del cilindro: <span class="m">V_cil = πr²h</span>.',
          'Razón: <span class="m">V_c/V_cil = (2/3)·√(h² + hr)/h = (2/3)√(1 + r/h)</span>. Es siempre mayor que 2/3, y crece cuando <span class="m">r/h</span> crece.'
        ],
        respuesta: '<span class="m">g = 2h + r</span> y <span class="m">V_c/V_cil = (2/3)√(1 + r/h)</span>. El cono con igual área total no es un tercio del cilindro: es más «alto» en proporción.'
      }
    ]
  });

  /* ==========================================================
     M9 · L1 — Poliedros regulares
     ========================================================== */
  Contenido.registrarLeccion({
    id: 'm9l1',
    modulo: 'm9',
    titulo: 'Los cinco sólidos platónicos',
    resumen: 'Por qué solo existen cinco, la relación de Euler y los pares duales.',
    objetivo: 'Identificar los cinco poliedros regulares, verificar la relación de Euler, relacionar cada sólido con su dual y calcular sus métricas básicas.',
    duracion: '28 min',
    bloques: [
      { tipo: 'parrafo', indice: 'La idea', texto: 'Un poliedro es <strong>regular</strong> si todas sus caras son polígonos regulares congruentes y en cada vértice concurre el mismo número de caras. Solo hay cinco. No es una limitación de nuestra imaginación: es un teorema que se demuestra en tres líneas.' },
      {
        tipo: 'tabla', indice: 'Los cinco sólidos',
        titulo: 'Los sólidos platónicos',
        caption: 'Comprueba Euler en cada fila: C + V − A = 2.',
        columnas: ['Sólido', 'Caras', 'Vértices', 'Aristas', 'Cara', 'Caras por vértice', 'Dual'],
        filas: [
          ['Tetraedro', '4', '4', '6', 'Triángulo', '3', 'Él mismo'],
          ['Cubo (hexaedro)', '6', '8', '12', 'Cuadrado', '3', 'Octaedro'],
          ['Octaedro', '8', '6', '12', 'Triángulo', '4', 'Cubo'],
          ['Dodecaedro', '12', '20', '30', 'Pentágono', '3', 'Icosaedro'],
          ['Icosaedro', '20', '12', '30', 'Triángulo', '5', 'Dodecaedro']
        ]
      },
      {
        tipo: 'teorema', titulo: 'Por qué solo existen cinco', indice: 'Teorema de existencia',
        enunciado: 'Existen exactamente cinco poliedros regulares convexos.',
        justifica: '<p>Sea <span class="m">n</span> el número de lados de cada cara y <span class="m">k</span> el número de caras que concurren en cada vértice. En cada vértice, la suma de los ángulos de las caras que concurren debe ser <strong>menor que 360°</strong> (si fuera 360°, las caras serían coplanares; si más, el vértice sería cóncavo).</p>' +
          '<p>Cada ángulo interior de un polígono regular de <span class="m">n</span> lados mide <span class="m">180(n−2)/n</span>. La condición es:</p>' +
          '<p class="m" style="font-family:var(--mono);font-size:.9rem">k · 180(n−2)/n < 360 &nbsp;⟺&nbsp; k(n−2) < 2n</p>' +
          '<p>Con <span class="m">n ≥ 3</span> y <span class="m">k ≥ 3</span>:</p>' +
          '<ul><li><span class="m">n = 3</span>: <span class="m">k < 6</span> → k = 3 (tetraedro), 4 (octaedro), 5 (icosaedro).</li>' +
          '<li><span class="m">n = 4</span>: <span class="m">k < 4</span> → k = 3 (cubo).</li>' +
          '<li><span class="m">n = 5</span>: <span class="m">k < 10/3</span> → k = 3 (dodecaedro).</li>' +
          '<li><span class="m">n ≥ 6</span>: <span class="m">180(n−2)/n ≥ 120°</span>, y <span class="m">3·120 = 360</span>, que no es menor: imposible.</li></ul>' +
          '<p>Cinco soluciones, cinco sólidos.</p>'
      },
      {
        tipo: 'teorema', titulo: 'Relación de Euler', indice: 'Euler',
        enunciado: 'En todo poliedro convexo, <span class="m">C + V − A = 2</span>, donde <span class="m">C</span> es el número de caras, <span class="m">V</span> el de vértices y <span class="m">A</span> el de aristas.',
        justifica: 'Es un invariante topológico: cualquier deformación continua del poliedro, siempre que no se rompa ni se pegue, conserva el valor 2. Para el cubo: 6 + 8 − 12 = 2. Para el tetraedro: 4 + 4 − 6 = 2. Permite deducir el número de aristas conociendo caras y vértices, y sirve para descartar sólidos imposibles.'
      },
      { tipo: 'figura', figura: 'tetraedro', indice: 'Figura: tetraedro', titulo: 'Tetraedro regular', pie: 'Cuatro caras equiláteras. Es su propio dual: los centros de sus caras forman otro tetraedro.' },
      { tipo: 'figura', figura: 'octaedro', indice: 'Figura: octaedro', titulo: 'Octaedro regular', pie: 'Ocho caras triangulares. El cubo y el octaedro son duales: los centros de las caras del cubo son los vértices del octaedro inscrito.' },
      {
        tipo: 'definicion', titulo: 'Pares duales', indice: 'Dualidad',
        html: '<p>El <strong>dual</strong> de un poliedro regular se obtiene tomando como vértices los centros de sus caras. Se cumple:</p>' +
          '<ul><li>Cubo (6 caras, 8 vértices) ↔ Octaedro (8 caras, 6 vértices).</li>' +
          '<li>Dodecaedro (12 caras, 20 vértices) ↔ Icosaedro (20 caras, 12 vértices).</li>' +
          '<li>Tetraedro ↔ sí mismo.</li></ul>' +
          '<p>Los números de caras y vértices se intercambian; el número de aristas coincide en cada par (12 y 30).</p>'
      },
      {
        tipo: 'formulas', titulo: 'Métricas de los sólidos regulares', indice: 'Fórmulas',
        items: [
          { f: 'Tetraedro (arista a): A = a²√3, V = a³√2/12, h = a√(2/3)', desc: 'Cuatro triángulos equiláteros. La altura llega al baricentro de la base.' },
          { f: 'Cubo (arista a): A = 6a², V = a³, d = a√3', desc: 'El más sencillo de todos.' },
          { f: 'Octaedro (arista a): A = 2a²√3, V = a³√2/3', desc: 'Ocho triángulos equiláteros; el doble del volumen del tetraedro de la misma arista.' },
          { f: 'Dodecaedro (arista a): A = 3a²√(25+10√5), V = a³(15+7√5)/4', desc: 'Doce pentágonos regulares.' },
          { f: 'Icosaedro (arista a): A = 5a²√3, V = (5/12)a³(3+√5)', desc: 'Veinte triángulos equiláteros.' },
          { f: 'Fórmula de Euler: C + V − A = 2', desc: 'Válida para todo poliedro convexo, no solo los regulares.' }
        ]
      },
      {
        tipo: 'ejemplo', indice: 'Ejemplo resuelto',
        titulo: 'Deducir aristas con Euler',
        enunciado: 'Un poliedro convexo tiene 8 caras: 4 triangulares y 4 cuadrangulares. ¿Cuántos vértices y aristas tiene?',
        pasos: [
          { titulo: 'Contar aristas a partir de las caras', html: 'Cada cara triangular aporta 3 aristas y cada cuadrangular 4, pero cada arista se cuenta dos veces (pertenece a dos caras).', cuenta: 'A = (4·3 + 4·4)/2 = (12 + 16)/2 = 28/2 = 14' },
          { titulo: 'Aplicar Euler', html: '<span class="m">C + V − A = 2</span> → <span class="m">8 + V − 14 = 2</span> → <span class="m">V = 8</span>.' },
          { titulo: 'Verificar', html: 'Es la pirámide cuadrangular: 1 base cuadrada + 4 caras triangulares + … tendría 5 caras, no 8. No hemos identificado un sólido concreto con esos datos; la comprobación aritmética necesaria es: <span class="m">8 + 8 − 14 = 2</span> ✓.' },
          { titulo: 'Comprobación adicional', html: 'En cada vértice debe concurrir un número entero de caras. Con 8 vértices y 14 aristas, el grado medio es <span class="m">2·14/8 = 3,5</span>: hay vértices de grado 3 y 4. Es compatible con un poliedro convexo.' }
        ],
        respuesta: '<span class="m">A = 14</span> y <span class="m">V = 8</span>. El truco del doble conteo de aristas es la herramienta fundamental en estos problemas.'
      },
      {
        tipo: 'errores', indice: 'Errores frecuentes',
        items: [
          { mal: 'Contar el número de aristas sumando las aristas de cada cara sin dividir entre 2.', bien: 'Dividir entre 2: cada arista pertenece a dos caras.', porque: 'Sin dividir se duplica el recuento y Euler deja de cumplirse, lo que debería alertarte.' },
          { mal: 'Aplicar las fórmulas de volumen del tetraedro al octaedro.', bien: 'Usar <span class="m">V = a³√2/3</span> para el octaedro.', porque: 'Con la misma arista, el octaedro tiene el doble de volumen que el tetraedro: son sólidos distintos.' },
          { mal: 'Creer que existe un sólido regular con caras hexagonales.', bien: 'Recordar que tres hexágonos ya suman 360° en un vértice.', porque: 'Con <span class="m">n ≥ 6</span> el ángulo interior es ≥ 120° y tres caras no pueden concurrir sin ser coplanares.' }
        ]
      }
    ],
    ejercicios: [
      {
        id: 'm9l1e1', tipo: 'opcion', dificultad: 'Básico',
        pregunta: '¿Cuántos poliedros regulares convexos existen?',
        opciones: [
          { texto: '5', correcta: true },
          { texto: '4' },
          { texto: '6' },
          { texto: 'Infinitos' }
        ],
        explicacion: 'Tetraedro, cubo, octaedro, dodecaedro e icosaedro. La demostración usa la condición de que la suma de ángulos en cada vértice sea menor que 360°.',
        pistas: ['Se llaman sólidos platónicos.', 'Cuenta: tetraedro, cubo, octaedro… y dos más.']
      },
      {
        id: 'm9l1e2', tipo: 'numerico', dificultad: 'Básico',
        pregunta: 'En un icosaedro regular, ¿cuántas aristas hay?',
        unidad: 'aristas', respuesta: 30, tolerancia: 0,
        explicacion: 'Tiene 20 caras triangulares, y cada arista pertenece a 2 caras: <span class="m">A = 20·3/2 = 30</span>. Euler confirma: <span class="m">20 + 12 − 30 = 2</span> ✓.',
        pistas: ['Cada cara triangular aporta 3 aristas.', 'Cada arista se cuenta dos veces.']
      },
      {
        id: 'm9l1e3', tipo: 'numerico', dificultad: 'Intermedio',
        pregunta: 'Un poliedro convexo tiene 12 caras y 20 vértices. ¿Cuántas aristas tiene?',
        unidad: 'aristas', respuesta: 30, tolerancia: 0,
        explicacion: 'Por Euler: <span class="m">A = C + V − 2 = 12 + 20 − 2 = 30</span>. Es el dodecaedro regular.',
        pistas: ['Despeja A en <span class="m">C + V − A = 2</span>.', '<span class="m">A = C + V − 2</span>.']
      },
      {
        id: 'm9l1e4', tipo: 'opcion', dificultad: 'Intermedio',
        pregunta: 'El dual del cubo es:',
        opciones: [
          { texto: 'El octaedro', correcta: true },
          { texto: 'El tetraedro' },
          { texto: 'El dodecaedro' },
          { texto: 'El icosaedro' }
        ],
        explicacion: 'Tomando los centros de las seis caras del cubo como vértices se obtiene un octaedro: 6 vértices y 8 caras. Los números se intercambian, como debe ocurrir en un par dual.',
        pistas: ['El dual tiene tantos vértices como caras tiene el original.', 'El cubo tiene 6 caras: busca el sólido con 6 vértices.']
      },
      {
        id: 'm9l1e5', tipo: 'numerico', dificultad: 'Avanzado',
        pregunta: 'Un tetraedro regular tiene arista 6. ¿Cuál es su volumen? Usa <span class="m">V = a³√2/12</span> y redondea a dos decimales.',
        unidad: 'u³', respuesta: 25.46, tolerancia: 0.05,
        explicacion: '<span class="m">V = 216·√2/12 = 18√2 ≈ 25,456</span>. Comprobación: la altura es <span class="m">a√(2/3) = 6·0,8165 = 4,899</span> y el área de la base <span class="m">36√3/4 = 15,588</span>; <span class="m">V = (1/3)(15,588)(4,899) ≈ 25,46</span> ✓.',
        pistas: ['<span class="m">6³ = 216</span>.', 'Divide 216√2 entre 12.']
      }
    ],
    retos: [
      {
        id: 'm9l1r1', titulo: 'Cubo y octaedro inscritos', nivel: 'UNI', puntos: 25,
        enunciado: 'En un cubo de arista <span class="m">a</span> se inscribe un octaedro cuyos vértices son los centros de las seis caras. Halla la arista del octaedro, su volumen y la razón entre los volúmenes del cubo y del octaedro.',
        estrategia: ['Los centros de dos caras adyacentes están a media arista de distancia en dos direcciones.', 'Identifica un par de vértices del octaedro separados por una arista y calcula su distancia.', 'Usa la fórmula del volumen del octaedro.'],
        desarrollo: [
          'Centros de las caras del cubo <span class="m">[0,a]³</span>: <span class="m">(a/2, a/2, 0)</span>, <span class="m">(a/2, a/2, a)</span>, <span class="m">(a/2, 0, a/2)</span>, <span class="m">(a/2, a, a/2)</span>, <span class="m">(0, a/2, a/2)</span>, <span class="m">(a, a/2, a/2)</span>.',
          'Una «arista» del octaedro une dos de estos centros que no sean opuestos. Distancia entre <span class="m">(a/2, a/2, 0)</span> y <span class="m">(a/2, 0, a/2)</span>: <span class="m">√(0 + a²/4 + a²/4) = a/√2 = a√2/2</span>.',
          'Verificación: todos los pares adyacentes dan la misma distancia <span class="m">a√2/2</span>, luego el octaedro es regular de arista <span class="m">s = a√2/2</span>.',
          'Volumen del octaedro: <span class="m">V = s³√2/3</span>. Con <span class="m">s = a√2/2</span>: <span class="m">s³ = a³·2√2/8 = a³√2/4</span>. Entonces <span class="m">V = (a³√2/4)(√2/3) = a³·2/12 = a³/6</span>.',
          'Razón: <span class="m">V_cubo / V_octaedro = a³/(a³/6) = 6</span>.',
          'Comprobación alternativa: el octaedro se descompone en 8 tetraedros con vértice en el centro del cubo; cada uno tiene volumen <span class="m">a³/48</span>, y <span class="m">8·a³/48 = a³/6</span> ✓.'
        ],
        respuesta: "El octaedro inscrito tiene arista <span class=\"m\">a√2/2</span> y volumen <span class=\"m\">a³/6</span>. El cubo ocupa seis veces ese volumen. La pirámide del reto del módulo 7 tiene volumen <span class=\"m\">a³/3</span>, es decir <strong>el doble</strong> del octaedro, no el mismo."
      }
    ]
  });
})();
