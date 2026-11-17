# Geometría del espacio: piensa en 3D

Ruta educativa en español de **geometría del espacio** para estudiantes de secundaria que
preparan exámenes de admisión exigentes (tipo UNI). Sitio estático en HTML, CSS y JavaScript,
sin cuentas y con el progreso guardado en el propio dispositivo.

> **Producción (14/11/2026):** [geometriaespacio.sistemazenit.com](https://geometriaespacio.sistemazenit.com/), desplegada en Cloudflare Pages desde `main`. Código y seguimiento en [PLAN-MEJORA-2026-11-14.md](PLAN-MEJORA-2026-11-14.md).

---

## 1. Punto de entrada y páginas

| Archivo | Ruta / parámetros | Qué contiene |
|---|---|---|
| `index.html` | `/` | Portada con el título «Geometría del espacio: piensa en 3D», bloque *continuar donde lo dejaste*, ruta de los 12 módulos con barras de progreso y lecciones desplegables. |
| `leccion.html` | `leccion.html?id=<leccionId>` | Lección completa: bloques didácticos, figuras interactivas, práctica guiada, retos, índice lateral, navegación anterior/siguiente y marcado como completada. Sin `?id` redirige a la primera lección pendiente. Respaldo: atributo `data-leccion` en `<body>`. |
| `laboratorio.html` | `/laboratorio.html?modelo=prisma` | Laboratorio paramétrico: 6 modelos, sliders y controles 2D/3D, capas, cálculos con KaTeX, vista adaptativa y modo de secciones oblicuas. |
| `practica.html` | `/practica.html` | Banco con todos los ejercicios de la ruta, filtrable por módulo, más todos los retos. Marcador de sesión y puntos. |
| `acerca.html` | `/acerca.html` | Método pedagógico, dependencias integradas con estrellas y fecha de consulta, herramientas evaluadas y descartadas, accesibilidad, gestión de datos locales. |
| `verificacion.html` | `/verificacion.html` | Autocomprobaciones **ejecutadas en el navegador**: fórmulas por doble vía, respuestas del contenido, coherencia estructural y validación de las especificaciones de figuras. |
| `descarga.html` | `/descarga.html` | **Genera y descarga un ZIP** con los 32 archivos del proyecto. El paquete se arma en el navegador (CRC-32 y formato ZIP propios, método STORE) leyendo los archivos del propio sitio: no interviene ningún servidor. |

Ejemplos de enlace directo: `leccion.html?id=m6l1` (lección completa de prismas y diagonales),
`leccion.html?id=m12l1` (simulacro final).

---

## 2. Mapa de módulos

| # | Módulo | Lecciones |
|---|---|---|
| 1 | Puntos, rectas y planos | `m1l1` El espacio y sus notaciones · `m1l2` Planos que se cortan y primeras demostraciones |
| 2 | Posiciones relativas, paralelismo y perpendicularidad | `m2l1` Paralelismo · `m2l2` Perpendicularidad y teorema de las tres perpendiculares |
| 3 | Ángulos entre rectas, planos y recta-plano | `m3l1` Ángulos entre rectas y recta-plano · `m3l2` Diedros y ángulo entre planos |
| 4 | Proyecciones y distancias | `m4l1` Proyección ortogonal · `m4l2` Las seis distancias |
| 5 | Triedros y ángulos poliedros | `m5l1` Triedros y ángulos poliedros |
| 6 | **Prismas y paralelepípedos** | `m6l1` **Prismas y diagonales (lección completa)** · `m6l2` Volumen y descomposición |
| 7 | Pirámides | `m7l1` Altura, apotema y arista lateral |
| 8 | Cilindro, cono y esfera | `m8l1` Cuerpos de revolución |
| 9 | Poliedros regulares | `m9l1` Los cinco sólidos platónicos |
| 10 | Secciones planas | `m10l1` Secciones planas de sólidos |
| 11 | Problemas integradores | `m11l1` Estrategias para problemas integradores |
| 12 | Simulacro final tipo UNI | `m12l1` Simulacro con cinco retos |

La lección **`m6l1`** es la desarrollada a fondo (`destacada: true`): elementos y clasificación,
áreas y volumen, diagonales de cara, diagonal espacial, recuentos con Euler, problemas tipo
admisión, 8 ejercicios y 2 retos con las tres fases de solución.

---

## 3. Estructura de archivos

```
index.html  leccion.html  practica.html  acerca.html  verificacion.html
css/estilos.css            Hoja única: tokens, componentes, responsive, movimiento reducido, impresión
js/progreso.js             localStorage (claves geo3d.progreso.v1 y geo3d.prefs.v1)
js/contenido.js            Núcleo del currículo: módulos, registro de lecciones, navegación
js/contenido-a.js          Módulos 1–3
js/contenido-b.js          Módulos 4–6 (incluye la lección completa)
js/contenido-c.js          Módulos 7–9
js/contenido-d.js          Módulos 10–12
js/figuras.js              Especificaciones geométricas (vértices, aristas, caras, capas, cámara)
js/visor3d.js              Visor Three.js (módulo ES, carga diferida)
js/visor2d.js              Alternativa 2D en SVG con líneas ocultas por sondeo
js/visor.js                Orquestador: elige 3D o 2D, controles de capas, pausa fuera de pantalla
js/actividades.js          Ejercicios y retos (pistas, validación, revelado progresivo)
js/leccion.js              Render de bloques de lección
js/inicio.js               Portada: ruta y continuidad
js/practica.js             Banco de práctica filtrable
js/acerca.js               Resumen y exportación de datos locales (solo lectura)
js/verificacion.js         Autocomprobaciones
js/avatar.js               Personaje guía original «Vértiz» (SVG + estados CSS)
js/ui.js                   Cabecera, anillo de progreso, botón de movimiento reducido
vendor/three.module.min.js Three.js 0.186.1 (MIT), servido desde el repo
TODO.md                    Requisitos de partida
```

---

## 4. Almacenamiento y modelo de datos

Todo es local. **No hay backend, ni tabla, ni API.**

- `geo3d.progreso.v1` → `{ version: 1, lecciones: { [idLeccion]: { estado: "hecho"|"en-curso", ejercicios: { [idEj]: { ok, intentos, pistas } }, retos: { [idReto]: { revelado, resuelto } }, actualizado } }, ultima: { leccion, ts }, puntos }`
- `geo3d.prefs.v1` → `{ movimientoReducido: bool|null, vistaPreferida: "3d"|"2d" }`

Las preferencias están **separadas del progreso** para que cambiar la accesibilidad no toque el
avance. `progreso.js` nunca llama a `clear()` ni a `removeItem()`: si el registro es ilegible lo
conserva intacto y trabaja en memoria durante la sesión. `acerca.html` solo lee y permite
descargar una copia en JSON.

---

## 5. Figuras: una sola fuente de verdad

`js/figuras.js` declara cada figura (16 registradas: triedro, planos que se cortan, recta-plano,
perpendicular, proyección, prisma de elementos, prisma 2·3·6 con diagonales, cubo con sección
hexagonal, paralelepípedo oblicuo, pirámide, cilindro, cono, esfera, tetraedro, octaedro,
sección de prisma). El visor 3D y el 2D **leen el mismo objeto**, así que no pueden mostrar cosas
distintas.

- 3D curricular: usa el visor Three.js clásico incluido en `vendor/`, controles de órbita
  (arrastre, rueda, pellizco y teclado), modo proyector, resaltado y pausa fuera de pantalla.
  El motor se adaptó para liberar recursos y permitir actualizaciones de geometría sin crear nuevos contextos.
- 3D paramétrico (`laboratorio.html`): carga diferida: primero intenta el módulo ES local y, si no está
  disponible, carga la distribución clásica; evita descargar la biblioteca si el visitante elige 2D.
- 2D: SVG alimentado por la misma especificación y capas. Se activa cuando falta WebGL,
  el estudiante lo selecciona o el dispositivo declara ≤2 núcleos o ≤2 GB sin preferencia previa.
  La vista del laboratorio se guarda separadamente de la preferencia de las lecciones.
- Capas conmutables por figura (caras, aristas, vértices, nombres, alturas, diagonales, secciones…).

---

## 6. Movimiento reducido y accesibilidad

- Botón en la cabecera que **anula** la preferencia del sistema; por defecto se respeta
  `prefers-reduced-motion`. Desactiva animaciones del personaje, giro automático de figuras y transiciones.
- Salto al contenido, foco visible, `role="radiogroup"` en los ejercicios, `role="status"` en la
  retroalimentación, descripción textual de cada figura, `canvas` oculto a lectores de pantalla.
- El personaje guía **nunca oculta una fórmula ni una figura**: vive en la columna lateral (escritorio y
  tableta) o como primera tarjeta del panel (móvil). En móvil se apila centrado con alto propio para que
  el dibujo no se recorte.
- Hojas de impresión: figuras sí, controles no.

---

## 7. Dependencias

| Dependencia | Licencia | Estrellas (2026-10-27) | Uso |
|---|---|---|---|
| [three.js](https://github.com/mrdoob/three.js) 0.186.1 | MIT | 117 008 | Render 3D, servido desde `vendor/` |
| [Google Fonts](https://fonts.google.com/) (Outfit, Newsreader, JetBrains Mono) | SIL OFL 1.1 | — | Tipografía |

Evaluadas y **no** integradas: [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
(33 264 ★, MIT; requiere React y build), [Babylon.js](https://github.com/BabylonJS/Babylon.js)
(26 235 ★, Apache-2.0; tamaño), [three-vrm](https://github.com/pixiv/three-vrm) (2 237 ★, MIT; sin
modelo VRM propio), [glTF](https://github.com/KhronosGroup/glTF) (7 870 ★; sin assets binarios).
Detalle y motivos en `acerca.html`.

## 7b. Personaje guía «Vértiz»

Original, sin copiar personajes ni marcas. Es un **sprite 2D en SVG animado solo con CSS**, con estética
de videojuego (contorno grueso, colores planos, ojos grandes). **No es un rig 3D ni fotorrealismo**, y así
se declara en `acerca.html#avatar` y en la propia portada.

Archivos: `js/avatar.js` (dibujo + API), `css/estilos.css` sección 10 (escenario y animaciones),
montaje en `js/ui.js#montarAvatar`, comportamiento en `leccion.js`, `practica.js` e `inicio.js`.

- **Se desplaza** dentro de un escenario de tres posturas (`pos-izq`, `pos-centro`, `pos-der`) con ciclo
  de caminado: piernas en zancada alterna, brazos en contrafase y rebote del cuerpo.
- **Explica**: bocadillo etiquetado «Vértiz explica» con `role="status"` `aria-live="polite"`, botón
  **«Otro consejo»** que recorre el banco `Avatar.TIPS` (14 consejos por tema).
- **Estados**: `neutral`, `camina`, `senala`, `celebra` (brazos arriba + confeti geométrico), `anima`,
  `piensa` (mano al mentón), `habla` (boca animada).
- **Reactivo**: acierto → celebra; fallo → se acerca y asiente; pista → piensa; al llegar a la práctica o
  a los retos, camina y cambia el mensaje. Se pausa con `IntersectionObserver` fuera de pantalla.
- **Accesible**: todo el contenido va por escrito (nada depende de audio), `role="img"` con título y
  descripción, y con movimiento reducido se queda quieto pero sigue explicando y mostrando el texto.

### Modo Maestro y Motor 3D Solucionado

El motor 3D funciona tanto en local haciendo doble clic en el archivo HTML (`file://`) como en cualquier servidor web o GitHub Pages.
- **Three.js autónomo:** Incluye `vendor/three.min.js` y `vendor/three.module.min.js` sin dependencias externas ni archivos fragmentados.
- **Modo Maestro interactivo:** Cada figura 3D cuenta con una barra de presentación con botones «Iniciar Explicación», «Avanzar ⏭» y «Anterior ◀». Al avanzar cada paso, el visor 3D reorienta la cámara y resalta los elementos geométricos correspondientes.
- **Locución por voz de Vértiz:** Síntesis de voz en español nativa (Web Speech API) con sincronización labial y botón de silenciar/activar voz.

---

## 8. Comprobaciones realizadas

- Consola sin errores en `index.html`, `leccion.html` (con `?id=m6l1`), `practica.html`, `acerca.html` y `verificacion.html`.
- Render verificado con capturas en escritorio y móvil: portada con las 12 tarjetas, banda de
  Vértiz completa, avatar visible y sin recortes en la columna lateral, sin código crudo a la vista.
- `verificacion.html` reúne comprobaciones de estructura, fórmulas, escenas, **64 claves
  numéricas independientes, 129 distractores y 18 retos**. Resultado observado tras Fase 4:
  **174/174** superadas en el navegador conectado (14/11/2026). No sustituye las pruebas
  completas `npm test`, `npm run build` y QA en navegadores físicos.

Correcciones matemáticas aplicadas tras revisión: sección `MNC₁` de un cubo (trapecio isósceles
`M N C₁ A₁`, no un cuadrilátero inventado), perpendicularidad `AC₁ ⟂ (A₁BD)` por producto escalar,
distancia punto-plano `2/3`, distancia centro–plano `√3/2`, triedro 45/45/90 declarado degenerado,
coseno `1/√3` en la pirámide de caras equiláteras, volumen `256` en la pirámide de arista 10 y
altura 6.

---

## 9. Publicación y mantenimiento

- **Sitio público:** https://geometriaespacio.sistemazenit.com/
- **Cloudflare Pages:** proyecto `geometria-espacio`, repositorio `juanxaviercasa/geometria-espacio`, rama de producción `main`.
- **Verificación de despliegue:** confirmados proyectos, dominio y despliegues desde la conexión Cloudflare el 14/11/2026. La portada se comprobó con navegador renderizado.
- **Edición:** guardar cambios en `main` y verificar el nuevo despliegue en Cloudflare. No es necesario cambiar de plataforma.
- **Compilación opcional:** `npm run build` produce `dist/`; el proyecto de Cloudflare actual publica directamente la raíz sin comando de compilación.
- **Exportación:** `descarga.html` empaqueta archivos de desarrollo. La lista del ZIP debe mantenerse sincronizada si se añaden archivos. Está disponible por compatibilidad, no es la acción principal de los estudiantes.

## 10. Pendientes posteriores al rediseño

1. Completar pruebas integrales `npm test`, `npm run build` y `verificacion.html` para todas las lecciones y geometrías; las comprobaciones puntuales no sustituyen esa certificación.
2. Auditar contraste WCAG AA, teclado, lectores de pantalla y dispositivos de 360, 390, 768, 1024 y 1440 px; conservar capturas y resultados.
3. Optimizar memoria del visor 3D, fallback y carga de bibliotecas (Fase 2 / Fase 5).
4. Profundizar el currículo de distancias, secciones y ejercicios tipo UNI (Fase 3).
5. Conservar el avatar clásico en SVG y las alternativas de tutores 3D/2D; verificar voz, licencias y recursos propios.
6. La página de práctica muestra 12 ejercicios inicialmente y permite cargar más; el avance sigue guardado localmente.

---

## Fase 1 — Interfaz unificada (2026-11-14)

Se ha agregado `css/fase1.css` para conservar estilos y funcionalidades de tutores, junto con `js/ui.js` como única cabecera y pie compartidos para las páginas. El inicio prioriza la ruta y el visor, las lecciones ofrecen accesos rápidos y el banco permite elegir módulo en un selector accesible. Se conservan KaTeX, tutores y motores 2D/3D. Se comprobó el despliegue en Cloudflare y se inspeccionaron capturas móviles de portada, lección y práctica; la auditoría WCAG y la matriz completa de navegadores forman parte del cierre de calidad.


## Fase 2 — Laboratorio geométrico paramétrico (2026-11-14)

El nuevo laboratorio utiliza `js/parametricas.js` (única fuente geométrica para prisma rectangular, pirámide recta, cilindro, cono, esfera y sección oblicua), `js/laboratorio.js` (estado, accesibilidad, carga diferida y sincronización visual), `css/laboratorio.css` y una página independiente. Los modelos comparten el mismo esquema de `js/figuras.js` para 2D/3D. Los controles de clase de `js/visor3d.js` aceptan `actualizarSpec` sin crear otro contexto WebGL, liberan texturas y geometrías, limitan DPR en equipos modestos y gestionan pausa/reanudación con RAF cancelable. `js/visor2d.js` corrige la silueta de la esfera y el apagado de la superficie. `js/visor.js` añade enlaces contextuales al laboratorio y un fallback por hardware de baja capacidad. Se corrigieron las capas pedagógicas del tetraedro y se sumaron tests en `regresiones.cjs`.

Informe de implementación y QA: [FASE2-REPORTE-2026-11-14.md](FASE2-REPORTE-2026-11-14.md). Se validaron 9.258 condiciones geométricas en un ejecutor JS y pruebas DOM de controles; la batería completa de Node y la certificación 3D/WebGL en dispositivos físicos siguen siendo tareas de QA.


## Fase 3 — Rigor matemático y pedagógico (2026-11-14)

Se auditaron las 17 lecciones del catálogo. Se corrigieron claves numéricas, demostraciones y enunciados ambiguos, incluidos el tetraedro de volumen cero, la altura √13 de una pirámide, la sección pentagonal del cubo, la orientación de prismas oblicuos y la inclusión octaedro–tetraedro. El banco se amplió de 90 a **107 ejercicios**, con 17 problemas avanzados tipo UNI, **43 preguntas de opción**, **64 numéricas**, **18 retos** y **129 diagnósticos específicos de distractores**. Cada lección dispone de una guía de principios, comprobación y límites de aplicación. La práctica diferencia reintentos, consulta explícita de soluciones y resolución independiente. Ver [FASE3-REPORTE-2026-11-14.md](FASE3-REPORTE-2026-11-14.md).


## Fase 4 — Vértiz y narración matemática accesible (2026-11-14)

Se actualizó el motor de voz del navegador con normalización de expresiones en español: potencias, raíces, fracciones LaTeX, subíndices, letras B/V, ángulos y unidades. Los visores ofrecen selección de voz, velocidad, repetición, pausa, reanudación y silencio, además de transcripción visible sincronizada con eventos reales de palabra cuando Web Speech los expone. Cada figura conserva título, texto, enfoque geométrico y capa resaltada aunque falle o termine la voz. Se mantienen los 107 ejercicios y 18 retos. En la comprobación del navegador publicada se observaron **174/174 verificaciones superadas** y una prueba móvil de 390 px sin scroll horizontal. Esta validación no sustituye pruebas físicas de TTS ni accesibilidad WCAG completa. Informe: [FASE4-REPORTE-2026-11-14.md](FASE4-REPORTE-2026-11-14.md).


## Fase 5 — Rendimiento y calidad técnica (2026-11-14)

La portada y las lecciones ofrecen una **representación SVG inicial** y descargan Three.js únicamente al necesitar la vista 3D. Los visores fuera de pantalla se pausan y, tras un período de inactividad, liberan memoria GPU; el motor ya no solicita fotogramas cuando está inmóvil. El laboratorio carga la versión clásica local de Three.js bajo demanda, no la edición modular de mayor tamaño. Acerca, Descarga y Laboratorio utilizan un índice ligero de las 17 lecciones; las páginas informativas tampoco precargan KaTeX ni tutores. Se conservan 107 ejercicios y 18 retos.

Se añadió un [panel de métricas locales](verificacion.html#rendimiento) para FCP, LCP, CLS, INP aproximado cuando hay interacciones, memoria, recursos y errores, **sin enviar datos del navegador**. El servidor local fue endurecido frente a rutas internas y symlinks; Cloudflare Pages recibe el archivo `_headers` en el build. Los metadatos incluyen idioma `es-PE` y enlaces canónicos por lección. Se añadieron pruebas Node de rendimiento y seguridad, pero `npm test` y `npm run build` completos siguen pendientes de un runner real: no se creó CI para evitar consumir minutos de GitHub Actions. Documentación: [informe Fase 5](FASE5-REPORTE-2026-11-14.md) y [presupuestos](PRESUPUESTOS-RENDIMIENTO.json).


## Fase 6 — Auditoría transversal y cierre (2026-11-14)

Se comprobaron **49 combinaciones de las siete páginas** en 320–1440 px y **51 combinaciones de las 17 lecciones** a 320/390/768 px. Se corrigió el desbordamiento de la tabla de verificaciones a 320 px, el contraste de etiquetas, los identificadores SVG duplicados de Vértiz, encabezados y canonical URLs. Se verificaron los 107 ejercicios/18 retos/21 figuras, cero errores KaTeX o referencias ARIA sin destino en las lecciones y los flujos representativos de práctica, teclado, laboratorio sin WebGL y ZIP. Se guardaron capturas antes/después, matriz e incidencias en [QA-FASE6](QA-FASE6/registro-incidencias.md). Se agregó sitemap de 23 URL y la preparación de un pipeline Cloudflare Pages con pruebas y compilación Node, sin GitHub Actions. [Informe detallado](FASE6-REPORTE-2026-11-14.md). Las pruebas en Safari, Firefox y lectores de pantalla físicos se consideran pendientes, no certificadas.


## Fase 6 — Auditoría integral, pruebas y despliegue (2026-11-14)

Se verificaron 7 páginas con 7 anchos (49 combinaciones), 17 lecciones con 3 anchos (51 combinaciones), 107 ejercicios y 18 retos. La auditoría publicada documenta corrección de desbordamiento a 320 px, IDs SVG únicos, contraste de controles y 174/174 autocomprobaciones del navegador. **Cloudflare Pages ejecutó con éxito `npm test && npm run build`: 40/40 pruebas Node y despliegue de producción confirmado** (commit `5828e1f`). La validación continúa limitada a Chromium remoto; Safari, Firefox, hardware real y lectores de pantalla requieren pruebas externas adicionales. Evidencias: [informe Fase 6](FASE6-REPORTE-2026-11-14.md) y [matriz de QA](QA-FASE6/matriz.json).


## Rediseño de aula y voz neural (15/11/2026)

La portada es un aula de **ocho sólidos geométricos** con los controles de Proyectar, Ajustes, voz, repetición y pausa en la **franja azul exterior**. El panel blanco presenta a **Vértiz más grande**, el paso, el texto y los botones Anterior/Siguiente sin solapamientos. Los controles secundarios 2D/3D, fondo, giro, medidas, preferencias de tutor y voz siguen dentro de Ajustes. El visor de las lecciones no comparte este cambio de distribución.

**Narración neural:** se implementó [Cloudflare Pages Function `/api/tts`](functions/api/tts.js), con Workers AI/Deepgram Aura-2 español, voz masculina **Javier** predeterminada; en Ajustes puede elegirse también **Álvaro** o **Néstor**, o la voz del dispositivo como alternativa. El audio se pide al iniciar o repetir un paso, permite pausar/reanudar, y se cancela cuando se cambia de paso. La voz neural cubre 45 explicaciones de 16 modelos geométricos del catálogo, no las 107 preguntas de práctica. El servicio **no admite texto libre**; recibe solo figura, paso y voz permitidos, sin claves del proveedor en el navegador. Una capa de caché de Cloudflare reutiliza los MP3. **Workers AI puede generar cargos por caracteres sintetizados**. Si la voz no está disponible, la explicación escrita permanece.

**Verificación:** Cloudflare produjo un MP3 válido de 56.736 bytes para el primer paso del prisma, el panel y la navegación de proyección se comprobaron a 390 y 320 px sin scroll horizontal, y el despliegue ejecutó **46/46 pruebas Node**, `npm run build` y publicación sin fallos. Esto verifica la entrega técnica del audio, **no certifica una evaluación subjetiva de su timbre o calidad acústica en los dispositivos de los estudiantes**.


## Profesores 3D CC0 existentes (15/11/2026)

Se incorporaron tres personajes KayKit terminados, no generados por IA: **Ariel (mago), Axel (caballero) y Lía (exploradora)**. Se distribuyen como GLB optimizados bajo `vendor/avatares/`, con esqueleto y siete animaciones cada uno. Se seleccionan en Ajustes y el maestro 3D es la opción predeterminada. La animación `Idle` se usa en reposo y `Spellcast_Shoot` al hablar mediante el reproductor neural ya integrado. Vértiz SVG permanece como alternativa ligera. **No se afirma sincronización fonética labial** porque los activos no incluyen visemas. Procedencia, licencia y límites: [vendor/avatares/ORIGEN-Y-LICENCIA.md](vendor/avatares/ORIGEN-Y-LICENCIA.md).


### Profesores humanos Rocketbox (15/11/2026)

Se incorporan **Marco y Elena**, modelos humanos ya terminados de Microsoft Rocketbox, en GLB optimizados distribuidos bajo MIT por Talking Avatar. Cada uno incluye 15 visemas Oculus y expresiones ARKit; el frontend los carga bajo demanda con Meshopt. Al sonar el MP3 neural, la apertura de la boca se guía por una envolvente de audio calculada localmente, **no por reconocimiento fonético exacto**. Los tres KayKit y Vértiz se conservan como opciones más ligeras. La licencia MIT de Microsoft se adjunta en `vendor/avatares/ROCKETBOX-LICENSE.txt`.


**Tutor inicial actualizado:** Marco, profesor Rocketbox realista con mirada, parpadeo y boca guiada por la envolvente del audio. Se mantienen Ariel, Axel, Lía, Elena y Vértiz en el selector. La sincronización labial es aproximada por audio, no un alineamiento preciso de fonemas.


## Zénit 3.0 — arquitectura de enseñanza por sólidos (16/11/2026)

- **Portada `index.html`**: presentación del método, funcionalidades y acceso a catálogo. No carga Three.js ni reproduce un simulador al entrar.
- **Catálogo `solidos.html`**: ocho familias de sólidos, cada una vinculada a `solido.html?tipo=<familia>`.
- **Espacios de aprendizaje `solido.html`**: pestañas accesibles **Aprender**, **Experimentar** y **Resolver**. Mantienen los mismos parámetros y la misma especificación geométrica.
- **Motor `js/zenit-solids.js`**: calcula el prisma regular/irregular y recto/oblicuo, pirámides poligonales con vértice desplazable, poliedros regulares y reutiliza `Parametricas` para cilindro, cono, esfera y cubo. Ofrece `spec`, `formulas`, `guide`, `values`. No separar fórmulas del modelo 3D.
- **Orquestación `js/zenit-workspace.js`**: visor 2D inmediato si WebGL falla, carga diferida de Three.js, configuración persistida por tipo, controles de capas y proyección, clases guiadas con Profesor Xavier y resolución paso a paso. La voz guiada usa Speech Synthesis del dispositivo; no implica sincronización fonética de la voz neural.
- **Compatibilidad**: `index.html?solido=prisma` y otros enlaces antiguos redirigen a su página individual; 17 lecciones y práctica se conservan.
- **Calidad**: ejecutar `npm test && npm run build` y auditar Chrome desktop/móvil. No se equipara el éxito de build a la certificación visual de todas las combinaciones.



## Sistema visual premium Zénit — 16/11/2026

Se ha incorporado una familia de ilustraciones vectoriales 3D en `assets/zenit/`:
portada, ocho sólidos, tres métodos de aprendizaje y cinco conceptos geométricos
de prismas. Se mantienen independientes de la geometría paramétrica educativa; ninguna
imagen sustituye la demostración matemática y los modelos SVG/WebGL. El despliegue
incluye la carpeta `assets` desde `build.js`; las imágenes usan `loading=lazy`
fuera del hero y sus descripciones accesibles se encuentran en el contexto textual.
El laboratorio vuelve a utilizar al Profesor Xavier de cuerpo completo y tres
cuartos, con altura visual mayor en escritorio y orientación de gestos hacia la
figura durante las explicaciones.


La imagen fotorealista de la portada `assets/zenit/prisma-ai.webp` se generó mediante IA, se revisó visualmente y se convirtió a WebP optimizado (380 × 380). Las restantes ilustraciones conceptuales y de catálogo son SVGs locales; las fórmulas y relaciones exactas se mantienen en el motor geométrico.


### Galería didáctica — lote 1 (10 imágenes)

Diez escenas de geometría producidas con IA y optimizadas a WebP se guardan en `assets/zenit/lote-1/`. Se presentan en galerías asociadas a Pirámides (3), Cilindros (3), Conos (3) y Esferas (1), con ampliación accesible mediante `<dialog>`, textos docentes y relaciones escritas con KaTeX. Las imágenes son apoyo ilustrativo; la geometría exacta se obtiene de `ZSolidos` y de los visores interactivos. El corte horizontal del cono representa el *plano que originaría* un tronco al retirar la parte superior, no la pieza físicamente separada. La imagen del tronco de pirámide muestra la cúspide original como referencia punteada.


### Galería didáctica — lote 2 (10 escenas individuales)

Se generó una segunda lámina con coherencia de iluminación y material, se separó en diez ilustraciones WebP independientes y se incorporó a `assets/zenit/lote-2/`. Cubre Esferas (3), Cubos (4), Tetraedros (2) y Octaedros (1), con sus textos, fórmulas KaTeX y visualización ampliada. La geometría interactiva sigue siendo el medio de validación matemática. Todas las imágenes son decorativas/pedagógicas y no sustituyen los modelos exactos.


### Galería didáctica — lote 3 (10 diagramas matemáticos nuevos)
Se incorporaron **diez ilustraciones SVG individuales originales** en `assets/zenit/lote-3/`:
dos de Prismas (caras, diagonales), dos de Pirámides (bases y relación de volúmenes),
dos de Cilindros (sección axial y paralela), dos de Conos (relación con cilindro y
secciones paralelas), una de Tetraedro (desarrollo plano) y una de Octaedro
(dos pirámides de base cuadrada). Cada tarjeta se integra con lectura pedagógica,
fórmulas KaTeX y modal de ampliación. Los SVG no son imágenes generadas por IA:
son diagramas vectoriales construidos con coordenadas y composición de diseño.
El modelo interactivo sigue siendo la fuente de verdad para dimensiones,
inclinaciones y áreas. Para visualizar secciones exactas, usar el visor del sólido.


### Lotes 4 y 5 — 20 escenas vectoriales educativas individuales
Se incorporaron dos colecciones ilustradas `assets/zenit/lote-4/` y
`assets/zenit/lote-5/`, con diez escenas cada una (Prismas, Pirámides,
Cilindros, Conos, Esfera, Cubo y Octaedro), además de las primeras treinta
ilustraciones ya publicadas. Los SVG contienen geometría construida por
coordenadas y acabados Zénit Aurora (violeta, índigo, turquesa y oro).
Cada ilustración tiene tarjeta pedagógica, explicación, fórmula KaTeX
cuando corresponde, texto alternativo y ampliación accesible.
El despliegue Cloudflare Pages existente copia `assets` mediante
`build.js`. No se altera la geometría paramétrica ni las lecciones.
**Nota didáctica**: los diagramas ilustrados sirven de referencia,
mientras que el visor 2D/3D proporciona el modelo matemático editable.


### Cierre del inventario visual, lote 6 (4 escenas)
Se añadieron cuatro ilustraciones **vectoriales de ambientación** en
`assets/zenit/lote-6/`: `portada-aurora.svg` (cabecera principal),
`catalogo-cristal.svg` (separador visual de las ocho familias),
`laboratorio-planos.svg` (encabezados pedagógicos) y
`zenit-horizonte.svg` (cierres y llamadas a la acción).
Son imágenes editoriales, no diagramas utilizados para enseñar mediciones.
Se integran en portada, catálogo, ocho laboratorios y la cabecera
de la sección de laboratorio anterior, manteniendo intactos los
visores 2D/3D, el Profesor Xavier y las fórmulas.
La versión no usa llamadas externas para descargar las ilustraciones;
se sirven desde Cloudflare Pages como recursos estáticos locales.
