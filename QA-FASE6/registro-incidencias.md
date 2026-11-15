# Registro de incidencias — Fase 6

**Fecha:** 14/11/2026 · **Repositorio:** [geometria-espacio](https://github.com/juanxaviercasa/geometria-espacio) · **Estado:** incidencias encontradas durante el QA automatizado corregidas.

| ID | Gravedad | Evidencia antes | Corrección aplicada | Comprobación después |
|---|---|---|---|---|
| QA-01 | Media | Autocomprobaciones: documento de 329 px para viewport de 320 px | Contención de desbordamiento del panel, conservando scroll de la tabla y foco teclado | Documento exactamente 320 px; tabla 420 px desplazable dentro de área de 294 px |
| QA-02 | Media | Etiquetas de ejemplos, notas y estados con contrastes estimados de 3,48–4,41:1 | Paleta oscurecida y tamaño auxiliar mejorado en `css/fase6.css` | Contrastes medidos en ejemplos 7,66:1; errores 7,78:1; corrección 7,45:1; nota 7,79:1 |
| QA-03 | Media | Gradientes SVG `vCabello`, `vChaqueta`, `vDorado`, `vPedestal` con IDs duplicados en lecciones con más de un Vértiz | `Avatar.svgUnico`: prefijos distintos por instancia y referencias `url(#id)` acordes | En las 17 lecciones: ningún ID duplicado |
| QA-04 | Baja | Un `h3` dentro de la figura del héroe saltaba desde `h1` antes del siguiente `h2` | Etiqueta visual de figura `p` con clase conservada | Jerarquía de encabezados principal sin salto inicial |
| QA-05 | Baja | Enlace vacío `href="#"` decorativo en Descarga | Sustituido por `span` oculto a la accesibilidad | No queda control interactivo ficticio |
| QA-06 | Baja | Canonical de `.html` no concordaba con la ruta final limpia de Cloudflare Pages | Canonicals de `/practica`, `/laboratorio`, etc. y `/leccion?id=...`; sitemap | Canonical corresponde a la URL limpia |
| QA-07 | Baja | Fecha en navegador remoto aparecía el 15/11 por hora de servidor UTC, con referencia peruana | `toLocaleString('es-PE', {timeZone:'America/Lima'})` | La hora se expresa explícitamente en zona peruana |
| QA-08 | Media | Cloudflare Pages tenía comando de compilación vacío, sin ejecutar tests Node | Ajustar `build_command` a `npm test && npm run build`, directorio `dist` | Validar ejecución de build en despliegue final y conservar logs |

## Evidencia visual real

**Antes:** [captura 320 px de la tabla en un despliegue anterior](verificacion-320-antes.jpg) (despliegue `330de18`).

**Después:** [captura 320 px de la tabla corregida](verificacion-320-despues.jpg) (producción de Fase 6).

Ambas imágenes fueron capturadas mediante Cloudflare Browser Rendering a 320 × 360 px, con desplazamiento hasta la sección de resultados. La diferencia de desbordamiento se acreditó principalmente por las mediciones DOM (329 → 320 px), no solo por apariencia visual.

## Seguimiento externo

Estas correcciones se probaron en Chromium. Safari, Firefox, VoiceOver, NVDA, TalkBack, zoom físico y mediciones de campo requieren navegadores o dispositivos adicionales; no se incluyen en los éxitos automatizados.
