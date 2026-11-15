# Informe de ejecución — Fase 5: rendimiento y calidad técnica

**Fecha:** 14/11/2026 · **Proyecto:** Geometría del Espacio 3D · Sistema Zénit  
**Repositorio:** https://github.com/juanxaviercasa/geometria-espacio  
**Publicación:** https://geometriaespacio.sistemazenit.com/ · rama `main`.

## 1. Optimización implementada

**Código y carga inicial.** Se creó `js/cargador3d.js` como cargador compartido de la versión clásica de Three.js y del visor. `index.html` y `leccion.html` ya no descargan Three.js en scripts bloqueantes: comienzan con SVG y solicitan WebGL cuando la figura es visible o el estudiante activa 3D. `js/visor.js` descarta cargas obsoletas, suspende visores ocultos y libera contextos GPU después de seis segundos fuera de pantalla. El regreso a la figura reconstruye la vista y conserva el razonamiento y el progreso.

**Renderizado y memoria.** `js/visor3d.js` utiliza fotogramas bajo demanda: si no hay giro, cambio o animación, no mantiene un bucle `requestAnimationFrame`. La destrucción es idempotente, libera geometrías, materiales y texturas compartidas sin doble `dispose`, desconecta observadores y cierra WebGL. `estadisticas()` aporta contadores locales para diagnóstico. `js/tutores.js` difiere la carga de modelos al entrar en pantalla, reduce frecuencia de redibujo sin voz y dispone del renderer al abandonar la página.

**Laboratorio.** `js/laboratorio.js` ya no importa el archivo `three.module.min.js` de 1.272.972 bytes; usa el Three.js clásico local de 669.884 bytes mediante el cargador común. La vista SVG continúa operativa sin WebGL. El código técnico del módulo anterior se conserva en el repositorio y en el ZIP, pero no forma parte de la descarga normal del laboratorio.

**División de dependencias.** `js/catalogo-ligero.js` mantiene la cuenta de las 17 lecciones en Acerca, Descarga y Laboratorio sin cargar los 107 ejercicios y las demostraciones. Acerca y Descarga ya no solicitan KaTeX, su auto-renderizador ni los tutores. Lecciones y Práctica sí conservan los módulos necesarios para enseñar y evaluar.

**Seguridad, accesibilidad y metadatos.** El servidor local restringe archivos permitidos, resuelve rutas reales, niega archivos ocultos, carpetas privadas y symlinks fuera del proyecto, admite GET/HEAD y ya no usa CORS abierto sin necesidad. Cloudflare Pages incorpora `_headers` desde `build.js` (nosniff, Referrer-Policy, Permissions-Policy y X-Frame-Options). Se añadió `es-PE`, canonical de portada y URLs canónicas específicas para las 17 lecciones, así como textos de metadatos corregidos. Se consolidó en `css/fase5.css` la presentación de las autocomprobaciones.

**Medición sin seguimiento.** `js/metricas-rendimiento.js` presenta FCP, LCP, CLS, INP aproximado cuando hay interacción, recursos, transferencia, heap JS si el navegador lo ofrece, tareas largas, errores y scroll en `verificacion.html#rendimiento`. No establece cookies, no envía datos personales y no confunde un dato ausente con cero. Los umbrales deseables están en `PRESUPUESTOS-RENDIMIENTO.json`, no son certificaciones.

## 2. Tamaños de recursos de referencia

Medidos por el árbol del repositorio, antes de finalizar esta fase:

| Recurso | Tamaño de fuente | Condición actual |
| --- | ---: | --- |
| `vendor/three.module.min.js` | 1.272.972 B | Fuera de la ruta habitual |
| `vendor/three.min.js` | 669.884 B | Solo si se solicita WebGL |
| `vendor/katex.min.css` | 366.695 B | Páginas matemáticas |
| `vendor/katex.min.js` | 276.701 B | Páginas matemáticas |
| `vendor/tutor-dragon.glb` | 268.884 B | Tutor 3D visible y seleccionado |

No se deben confundir tamaños de archivos con tráfico HTTP comprimido y efectos de caché.

## 3. Pruebas realizadas

**Muestras del navegador conectado**, en sesiones concretas de Cloudflare Browser Rendering:

- Portada móvil antes de cambios: 28 recursos, 22 scripts, ~675.814 B observados y `loadEventEnd` ~3.019 ms. Esta referencia no prueba un beneficio porcentual universal.
- Acerca en muestra intermedia: 13 recursos, 8 scripts y ~373.765 B transferidos observados.
- Acerca después de optimización: **9 recursos, 5 scripts y ~30.213 B observados**; FCP ~1.272 ms, progreso de 17 lecciones, sin Three.js y sin scroll horizontal a 390 px. Diferentes sesiones/cachés pueden cambiar estos números.
- Laboratorio a 768 px: cuatro fórmulas, vista 2D, progreso de 17 lecciones; **sin solicitar** las versiones de Three.js y sin desbordamiento.
- Al activar 3D a 1024 px: se obtuvo vista 3D con un canvas, cargando `vendor/three.min.js` y **sin descargar** `vendor/three.module.min.js`; sin desbordamiento.
- Autocomprobaciones en móvil: batería previa **174/174 superadas**; panel de métricas disponible, cero errores capturados en esa visita y ancho de documento estable.

**Pruebas aisladas del código actual:** se comprobaron sintaxis JavaScript de los módulos intervenidos, catálogo de 17 IDs, ausencia de RAF continuo en escena estática, reactivación ante cambio de capa, disposición idempotente de geometrías/materiales/texturas y denegación de rutas internas. Todas esas comprobaciones aisladas resultaron satisfactorias. `regresiones.cjs` incorpora nuevas pruebas Node sin dependencias adicionales para cubrir esos mismos invariantes.

## 4. Limitaciones explícitas

**No se ejecutaron** `npm test` ni `npm run build` completos desde el conector, que no ofrece un runner Node del repositorio. Las pruebas se dejaron preparadas y se verificaron sus algoritmos principales de forma aislada. No se inició GitHub Actions para evitar consumir minutos de la cuenta.

El panel de métricas permite observar LCP, CLS, INP aproximado y memoria cuando las APIs y las interacciones aportan datos; **no equivale** a una medición de Core Web Vitals de campo ni a la certificación de Safari, Firefox, dispositivos de gama baja o lector de pantalla. La portada continuará transfiriendo modelos 3D cuando estén visibles, por lo que su tráfico total puede ser parecido al previo aunque se haya aligerado la ruta crítica de carga.

## 5. Estado y continuidad

**Fase 5: implementación completada en `main`** con validaciones funcionales representativas; quedan para la Fase 6 los comandos Node, auditoría visual y de accesibilidad transversal, pruebas WebGL/no WebGL, zoom 200 %, dispositivos físicos, mediciones de campo y verificación final de todas las páginas.

Se preservan las 17 lecciones, 107 ejercicios, 18 retos, 129 diagnósticos de distractores, laboratorio paramétrico y motor narrativo Vértiz.
