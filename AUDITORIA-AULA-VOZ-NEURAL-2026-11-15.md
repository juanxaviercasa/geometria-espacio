# Corrección de aula y voz neural — 15 de noviembre de 2026

**Repositorio:** https://github.com/juanxaviercasa/geometria-espacio  
**Rama:** `main`  
**Producción:** https://geometriaespacio.sistemazenit.com/

## Defectos aportados por captura

La captura a 1535 × 958 mostraba botones «Proyectar» y «Ajustes» superpuestos sobre «Vértiz clásico explica este modelo» y controles de voz dentro del encabezado. El avatar parecía excesivamente pequeño para el objetivo pedagógico. El usuario también consideró robótica la locución nativa del navegador.

## Implementación visual

Se creó `css/aula-premium.css` con la franja de controles externa `#hero-aula-controles`. `js/visor.js` traslada los nodos reales de proyección, ajustes y voz sin duplicar listeners. Al abrir Ajustes se muestran los controles secundarios y los selectores. Se detectó y corrigió una regresión anterior: los botones secundarios habían sido trasladados a otro contenedor, pero sus listeners seguían buscándolos en la barra original; ahora `buscarControl()` utiliza la posición real.

En el panel de la portada se conservan únicamente el avatar, su nombre «Vértiz», un subtítulo breve, la selección de pasos, el desarrollo matemático y la navegación. El avatar pasó a 164 × 190 px en 1366 px, 110 × 142 px en móvil de 390 px y 100 × 130 px en 320 px. Los controles ocupan una o dos filas según el ancho disponible, siempre fuera del panel blanco. Los visores de lecciones mantienen su organización.

## Voz neural en producción

- **Modelo:** `@cf/deepgram/aura-2-es` en Workers AI, vinculado a la Pages Function.
- **Voces disponibles:** Javier (predeterminada), Álvaro y Néstor; se conserva la voz del dispositivo como alternativa manual.
- **Endpoint:** `GET /api/tts?figura=prisma-elementos&paso=0&voz=javier`. La entrada solo admite IDs y pasos del catálogo, no texto libre.
- **Seguridad y coste:** claves de IA solo del lado servidor, solicitudes validadas y caché de MP3 en Cloudflare. La inferencia de Workers AI puede tener un coste y no está incluida automáticamente en el hosting estático.
- **Reproductor:** `js/voz-neural.js` + `js/avatar.js` crean un `Audio` para el MP3, con pausa, reanudación, cancelación del audio anterior y limpieza de los Object URLs al cambiar de paso.
- **Accesibilidad:** si hay error de voz, el texto y los elementos del sólido permanecen visibles; la locución nunca controla el avance automático.

## QA confirmada

- Despliegue de GitHub `main` vía Cloudflare Pages con `npm test && npm run build`.
- **46 pruebas Node aprobadas, 0 fallos** en el último build de código verificado.
- A 1366 px, botones externos, Vértiz de 190 px de alto y descripción sin solapamiento.
- A 390 px, toolbar externa, Vértiz de 142 px, explicación escrita y ningún scroll horizontal.
- A 320 px, Vértiz de 130 px, toolbar de dos filas, Proyectar activable/desactivable, Ajustes abrible, sin scroll horizontal.
- `GET /api/tts?estado=1`: HTTP 200, `habilitado=true`, 45 pasos.
- `GET /api/tts?figura=prisma-elementos&paso=0&voz=javier`: HTTP 200, `audio/mpeg`, **56.736 bytes** de datos MP3 entregados efectivamente por Cloudflare.

**Límites:** el timbre debe valorarse con escucha humana; no se ha verificado audio en iOS/Safari ni lectores de pantalla físicos. Cloudflare puede cobrar la generación neural; conviene monitorizar el consumo.

## Archivos principales

`index.html`, `css/aula-premium.css`, `js/visor.js`, `js/tutores.js`, `js/avatar.js`, `js/narracion-ui.js`, `js/voz-neural.js`, `functions/api/tts.js`, `wrangler.jsonc`, `regresiones.cjs`.
