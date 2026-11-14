# Fase 2 — Laboratorio geométrico interactivo: implementación y pruebas
**Fecha:** 14 de noviembre de 2026  
**Proyecto:** Geometría del espacio · Sistema Zénit  
**Repositorio:** https://github.com/juanxaviercasa/geometria-espacio  
**Producción:** https://geometriaespacio.sistemazenit.com/  
**Rama de producción:** `main` · Cloudflare Pages `geometria-espacio`.

## 1. Objetivos cumplidos

Se ha añadido [laboratorio.html](https://geometriaespacio.sistemazenit.com/laboratorio.html), una experiencia paramétrica independiente de las lecciones existentes. El estudiante puede experimentar con:

| Sólido | Parámetros | Relaciones calculadas |
|---|---|---|
| Prisma rectangular | Largo `a`, ancho `b`, altura `h` | Volumen, área total, diagonal espacial y diagonal de base |
| Pirámide recta (base rectangular) | `a`, `b`, `h` | Volumen, áreas, arista lateral y los dos apotemas de sus caras |
| Cilindro circular recto | Radio `r`, altura `h` | Volumen, área lateral y total |
| Cono circular recto | `r`, `h` | Volumen, área lateral, total y generatriz |
| Esfera | `r` | Volumen, superficie y circunferencia máxima |
| Sección oblicua de prisma | `a`, `b`, `h`, nivel, inclinación | Área del corte, arista inclinada, altura central y ángulo efectivo |

**Precisión del corte:** el plano `y=t+mx` se restringe a un régimen en el que cruza las cuatro caras laterales. En ese régimen la sección es rectangular, y `A_s=ab√(1+m²)` es válida. Si el estudiante solicita una inclinación mayor, el programa limita el ángulo efectivo e informa de ese comportamiento. **No se afirma que el módulo resuelva todavía secciones arbitrarias de cualquier poliedro.**

## 2. Arquitectura y compatibilidad
- `js/parametricas.js`: modelo matemático declarativo puro; usa estructura `vertices/caras/aristas/lineas/capas/camara` compatible con las especificaciones curriculares de `js/figuras.js`.
- `js/laboratorio.js`: UI de sliders, controles de modo, capas, giro, orientación 2D, guardado local independiente, estado accesible y presentación dinámica de fórmulas con KaTeX local.
- `css/laboratorio.css`: controles táctiles, jerarquías, mobile-first y respuesta a anchos de 390 px y escritorio.
- `js/visor3d.js`: añade `actualizarSpec` con un solo contexto GPU, liberación de geometrías/materiales/texturas al cambiar dimensiones, limpieza de mallas temporales, protección contra eventos de pérdida de contexto durante destrucciones voluntarias, DPR acotado para equipos modestos y cancelación de rAF al pausar/destruir.
- `js/visor2d.js`: dibuja las mismas especificaciones en SVG sin WebGL. Corrección de contorno de esfera que no debe cambiar de radio aparente por orientar la cámara y permite ocultar la superficie.
- `js/visor.js`: mantiene Modo Maestro existente; enlaces contextuales a la nueva experimentación para nueve escenas compatibles. En ausencia de preferencia y hardware de ≤2 núcleos o ≤2 GB se sugiere 2D automáticamente.
- **Carga diferida:** el nuevo laboratorio no carga Three.js si se queda en 2D; intenta el módulo ES local y usa la distribución clásica como respaldo. La migración de todas las páginas antiguas al formato ES no se hizo para no afectar el sistema de tutores, el Modo Maestro ni los ejercicios actuales.
- **Persistencia:** `geo3d.lab.v1` almacena modelo y medidas del laboratorio; `geo3d.prefs.v1` agrega `laboratorioVista`, sin sobrescribir el avance `geo3d.progreso.v1`.

## 3. Auditoría de las escenas existentes
Se inspeccionaron programáticamente las **16 escenas** de `js/figuras.js`, incluidos vértices finitos, aristas, caras, líneas, referencias de capas y las capas declaradas en pasos pedagógicos. Se detectaron **dos referencias a una capa inexistente `caras` en los pasos del tetraedro**; se sustituyeron por `laterales` y `base` según el objetivo de cada paso. En la segunda comprobación se observaron **0 referencias inválidas a capas de atención**. Se añadió un test de regresión para evitar recurrencia.

## 4. Comprobaciones realizadas
- **Matemática:** comprobación directa de **9.258 condiciones** en combinaciones de dimensiones de seis modelos. Cero fallos detectados. Incluye coordenadas finitas, referencias geométricas, evaluación de fórmulas y área real (producto vectorial) de la sección oblicua.
- **Interacción navegador:** mover el largo de prisma de 3 a 6 unidades actualizó el volumen de **24 a 48 u³**. Seleccionar cono con `r=2`, `h=4` produjo **16,76 u³**. Al pasar a SVG 2D, la representación se dibujó y los controles de orientación modificaron el gráfico.
- **Capturas renderizadas:** escritorio **1320×900** y móvil **390×844**, incluyendo el visor, el corte y los controles completos de la sección oblicua. La presentación de fórmulas de cono fue inspeccionada con KaTeX.
- **Anchos adicionales:** pruebas DOM a **360 px** sin desbordamiento (scrollWidth=clientWidth=360; esfera en 2D con un control) y **768 px** sin desbordamiento (scrollWidth=clientWidth=768; pirámide con seis fórmulas y seis capas).
- **Producción:** el laboratorio se sirvió desde el dominio en Cloudflare. La rama de producción continúa siendo `main`; los commits activan despliegues de Pages.
- **Regresiones añadidas:** seis pruebas matemáticas y de límites para el motor paramétrico, y una prueba para todas las escenas curriculares; quedan incorporadas a `regresiones.cjs`.

## 5. Límites de certificación
La comprobación browser-rendering disponible puede carecer de WebGL acelerado y activa correctamente SVG. Por ello, **no equivale a certificar el motor 3D físico en todos los navegadores o equipos**. La vista 3D conserva la implementación ya funcional en lecciones y ha recibido cambios de rendimiento, pero la prueba manual real con GPU es parte de la matriz de QA final.

La ejecución integral `npm test`, `npm run build`, medición de FPS/GPU y pruebas de lector de pantalla todavía deben realizarse en un entorno con shell y navegadores reales. El proyecto Cloudflare Pages actual publica directamente los archivos de la raíz, con la opción `build.js` compatible.

## 6. Evolución posterior (fuera de alcance de esta fase)
- Cortes arbitrarios de sólidos (más allá de secciones rectangulares oblicuas de prismas).
- Migración total de los visores curriculares y los tutores a Three.js ESM, sin distribuir dos runtimes.
- Auditoría matemática exhaustiva de ejercicios, demostraciones y 17 lecciones (Fase 3).
- Sincronización de voz y guía virtual (Fase 4).
- Certificación transversal de Safari/Firefox/Chrome, WebGL, WCAG y rendimiento (Fases 5–6).

**Estado:** Fase 2 implementada, desplegada y comprobada a nivel matemático, interfaz y alternativa 2D; los controles de pirámides distinguen apotemas de caras de tamaños diferentes. Certificación transversal de GPU y navegadores pendiente.
