# Informe de cierre de implementación — Fase 6

**Fecha:** 14 de noviembre de 2026 (hora de Lima)  
**Repositorio:** https://github.com/juanxaviercasa/geometria-espacio  
**Producción:** https://geometriaespacio.sistemazenit.com/  
**Rama:** `main`  
**Herramienta de QA visual:** Cloudflare Browser Rendering (Chromium).

## 1. Resultado

Se implementó una auditoría transversal de las siete páginas, las 17 lecciones y los flujos principales de práctica, progreso, tutor y laboratorio. Se corrigieron los problemas de accesibilidad, diseño responsive y SEO encontrados.

- **49 combinaciones de las 7 páginas** con anchos de 320, 360, 390, 768, 1024, 1280 y 1440 px. La primera matriz señaló un desbordamiento a 320 px en Autocomprobaciones; se corrigió y confirmó el ancho exacto de 320 px manteniendo scroll interno.
- **51 combinaciones de las 17 lecciones** a 320, 390 y 768 px, sin desbordamiento horizontal. Coincidieron los **107 ejercicios**, **18 retos** y **21 bloques de figuras** con los registros de currículo.
- **0 errores KaTeX observados** tras el render; **0 IDs duplicados** tras el arreglo de gradientes SVG; **0 referencias `aria-describedby` sin destino** en estas lecciones.
- **174/174 autocomprobaciones del curso** superadas en la última visita observada. Incluyen recálculos numéricos, integridad de preguntas, distractores, retos y lectura matemática.

Los resultados detallados están en [matriz.json](QA-FASE6/matriz.json). Son comprobaciones de DOM y de interacción del navegador conectado, no una garantía absoluta sobre todo dispositivo.

## 2. Flujo educativo probado

**Portada:** 12 módulos, 17 enlaces únicos de lección. Menú móvil abierto/cerrado cambia `aria-expanded` y visibilidad. La primera unidad se expande/contrae como corresponde.

**Ejercicio real:** `m7l1e6` (altura de pirámide). `4,12` se rechaza con un intento, sin revelar `3,61` ni sumar puntos; solicitar pista conserva un intento y registra una pista; ingresar `3,61` después registra el segundo intento, el acierto y 10 puntos.

**Laboratorio:** cuatro fórmulas del prisma; al aumentar una medida, el volumen observado pasó de 24 a 32 unidades cúbicas. Simulando ausencia de WebGL, activar 3D preservó la vista SVG y explicó que el equipo no admitía WebGL. Se corroboró previamente 3D real con biblioteca Three clásica, sin pedir el módulo pesado.

**Vértiz y teclado:** con voz silenciada siguen la transcripción y el paso visible. Con foco en la figura, `PageDown` inició y avanzó la secuencia; al mover el foco fuera del visor, dejó de interceptar la navegación de la página. La consulta de soluciones y la diferencia de puntos se verificaron en la Fase 4.

**ZIP:** los 77 recursos de la lista anteriores a las incorporaciones finales respondieron con HTTP 200 en la comprobación HEAD de producción. `Descarga.construirZip` generó una cabecera ZIP `PK\x03\x04` y CRC válido con un contenido de prueba. La lista se actualizó para incluir los archivos y evidencias de esta fase.

## 3. Incidencias corregidas

El registro [QA-FASE6/registro-incidencias.md](QA-FASE6/registro-incidencias.md) clasifica cambios por gravedad, evidencias y correcciones. Entre ellos: 329→320 px de ancho en Autocomprobaciones, etiquetas con contraste bajo elevadas a ~7,5–10,3:1 en los casos muestreados, gradientes SVG con IDs únicos, jerarquía de encabezados y rutas canónicas limpias.

Se añadieron dos capturas reales comparables de la tabla a 320 px, obtenidas con Cloudflare Browser Rendering: [antes](QA-FASE6/verificacion-320-antes.jpg) y [después](QA-FASE6/verificacion-320-despues.jpg).

## 4. Publicación y calidad

Se incorporaron `robots.txt` y un `sitemap.xml` de **23 URL canónicas**, con las 17 lecciones identificadas por `?id=`. Se actualizaron el `build.js`, la descarga ZIP y las pruebas en `regresiones.cjs` para los nuevos recursos y la unicidad SVG.

Se configura Cloudflare Pages para utilizar `npm test && npm run build` y servir `dist`, evitando depender de GitHub Actions. **La certificación de esos comandos queda supeditada al resultado real del despliegue**, que debe comprobarse mediante el estado de la fase build y los logs. No se atribuye éxito a pruebas sin evidencia.

## 5. Límites y tareas de certificación externa

Esta auditoría se ejecutó en Chromium remoto y mediante pruebas de contenido verificable. No se ha simulado un iPhone real, Android de gama baja, Safari, Firefox, VoiceOver, NVDA o TalkBack; tampoco se ha medido INP/LCP/CLS mediante tráfico de estudiantes ni se ha probado zoom nativo del navegador al 200 % en hardware físico. Los anchos de 320/640 px permiten revisar reflow aproximado, pero no sustituyen esos controles.

**Estado:** cierre de implementación de Fase 6 y correcciones auditadas en el navegador conectado; las pruebas físicas externas se informan por separado, no se declaran superadas sin ejecutarlas.

No se modificaron los identificadores de lecciones ni las claves de progreso. Se preservan las Fases 1–5.
