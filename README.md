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

`js/figuras.js` declara cada figura (15 registradas: triedro, planos que se cortan, recta-plano,
perpendicular, proyección, prisma de elementos, prisma 2·3·6 con diagonales, cubo con sección
hexagonal, paralelepípedo oblicuo, pirámide, cilindro, cono, esfera, tetraedro, octaedro,
sección de prisma). El visor 3D y el 2D **leen el mismo objeto**, así que no pueden mostrar cosas
distintas.

- 3D: Three.js como módulo ES desde `vendor/`, carga diferida con `import()`, controles de órbita
  propios (arrastre, rueda, pellizco, flechas del teclado, `R` para recentrar), pausa del bucle
  cuando la figura sale de pantalla.
- 2D: SVG con la misma cámara y ocultación por sondeo. Se activa si falla WebGL, si el equipo
  declara ≤2 núcleos o ≤2 GB, en pantallas pequeñas, o al pulsar «Vista 2D». La elección se recuerda.
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
- `verificacion.html` ejecuta **74 comprobaciones** en el navegador (fórmulas por doble vía,
  respuestas recalculadas, coherencia estructural, validez de las figuras). Resultado actual:
  **74/74 (100 %)**. Es la prueba reproducible del contenido: ábrela para ver el informe.

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
