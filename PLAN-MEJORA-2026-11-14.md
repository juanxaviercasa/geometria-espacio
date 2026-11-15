# Plan integral de mejora — Geometría del Espacio 3D
**Fecha:** 14 de noviembre de 2026  
**Repositorio:** `juanxaviercasa/geometria-espacio`  
**Rama de trabajo:** `main`  
**Alcance:** diseño, estructura HTML/CSS/JS, visualización 2D/3D, rigor matemático, pedagogía, accesibilidad, rendimiento y pruebas.

> **Tipo de auditoría:** revisión estática de archivos del repositorio. No se ha conseguido verificar la interfaz desplegada ni ejecutar aquí una matriz de pruebas en navegador. Los puntos marcados como «pendientes de comprobar» no deben tratarse como defectos visuales confirmados.

## Inventario encontrado
- Sitio multipágina estático con `index.html`, `leccion.html`, `practica.html`, `acerca.html`, `verificacion.html` y `descarga.html`.
- 12 módulos y 17 lecciones según `js/contenido.js` y el registro documentado.
- `css/estilos.css` centraliza estilos, tokens y responsive.
- Figuras compartidas entre `js/figuras.js`, `js/visor3d.js` y `js/visor2d.js`; orquestación en `js/visor.js`.
- Three.js UMD precargado por las páginas de inicio y lecciones; otro archivo `three.module.min.js` está incluido en `vendor/`.
- Progreso y preferencias en almacenamiento local, personaje Vértiz con voz del navegador y sistema de ejercicios/retos.
- Seis pruebas Node existentes antes de esta intervención; archivo de autocomprobaciones de navegador independiente.

## Defectos confirmados y medidas inmediatas
| ID | Prioridad | Evidencia | Resolución / criterio |
|---|---|---|---|
| P0-01 | Crítica | `js/actividades.js`: `parseFloat` con eliminación de caracteres permitía transformar entradas como `12abc` en respuestas numéricas. | **Corregido**: gramática numérica estricta; rechaza divisiones por cero, caracteres extra y resultados no finitos. |
| P0-02 | Alta | `js/actividades.js` registraba pistas como intentos y con el contador una unidad atrasado. | **Corregido**: pista se registra sin incrementar intentos. |
| P0-03 | Alta | La tercera fase de un reto llamaba `registrarReto(..., true)` y daba puntos solo por revelar la solución. | **Corregido**: revelar no equivale a resolver; registrar resolución sigue siendo acción explícita. |
| P0-04 | Alta | `server.js`: la ruta solicitada no se comprobaba frente a la carpeta raíz. | **Corregido**: resolución canónica y rechazo de rutas fuera del directorio. Falta prueba HTTP real. |
| P0-05 | Alta | `css/estilos.css`: `.m` usaba `white-space: nowrap`, con riesgo de desbordamiento en expresiones largas. | **Mitigado**: permitir ajuste, protección de contenedores `min-width:0` y responsive; falta validar fórmulas visualmente. |
| P1-01 | Media | `js/inicio.js`: encabezados y párrafos dentro de `span` y encabezado de módulo dentro de `button`. | **Corregido parcialmente**: contenedores válidos y título accesible con `role=heading`. Revisar con validador HTML. |
| P1-02 | Media | Portada montaba una figura del visor dentro de un elemento `figure` externo. | **Corregido**: contenedor `div` + etiqueta accesible que persiste al cargar JavaScript. |
| P1-03 | Media | Cinco páginas mostraban inicialmente `0/14 lecciones` cuando hay 17. | **Corregido**: 17 como valor inicial; el progreso real lo reemplaza después. |
| P1-04 | Media | En portada, «Descargar el código» competía con CTA de aprendizaje. | **Corregido**: CTA eliminado de portada, sin retirar funcionalidad de documentación. |

## Fase 1 — Rediseño del sistema visual y de navegación
**Objetivo:** un laboratorio geométrico centrado en contenido, con estilo académico tecnológico y controles intuitivos.
- [ ] Definir tokens y componentes de interfaz: tipografía 16–18 px para texto principal, jerarquía de títulos, escala de espaciados, contraste comprobado WCAG AA, estados de foco y botones táctiles.
- [ ] Rediseñar hero: título y beneficio claros, botón primario «Continuar aprendiendo», atajo a «Explorar una figura» y preview 3D con subtítulo legible.
- [ ] Separar la ruta de aprendizaje del material técnico del repositorio; dejar método, licencias y verificaciones en secciones secundarias.
- [ ] Vista de módulos con estado por lección, duración, dificultad, objetivo y llamada a acción inequívoca.
- [ ] Unificar cabecera y pie en componentes mantenibles (sin copiar manualmente HTML en seis archivos).
- [ ] En lecciones, priorizar «qué aprenderás → representación → explicación → demostración → ejemplo → práctica → reto → recapitulación».
- [ ] Mantener la identidad propia y accesible de Vértiz sin tapar la figura o las fórmulas.
**Criterios de aceptación:** navegación desde teclado, contraste AA en texto normal, interacción táctil cómoda, sin encabezados inválidos ni enlaces prioritarios a herramientas técnicas.

## Fase 2 — Laboratorio 3D y alternativa 2D
- [x] Especificaciones declarativas compartidas: `js/figuras.js` y `js/parametricas.js` con vértices, caras, capas, cámara y métricas.
- [x] Auditar programáticamente 16 escenas curriculares y corregir dos referencias de capas inexistentes del tetraedro; el QA visual de cada una se valida transversalmente en Fase 6.
- [x] Controles paramétricos en seis modelos: aristas, altura, radio, secciones oblicuas e inclinación; generatrices y apotemas derivados matemáticamente.
- [x] Vincular parámetros, medidas y KaTeX en tiempo real; verificación de prisma 24→48 u³, cono 16,76 u³ y actualización de SVG.
- [ ] Verificación integral de los cinco anchos y del giro horizontal en todos los visores (Fase 6). El laboratorio tiene CSS responsive y capturas revisadas a 390 y 1320 px.
- [x] Detectar hardware limitado cuando el navegador informa núcleos/memoria, ofrecer botón 2D/3D, persistir preferencia y fallback cuando WebGL no está disponible.
- [x] Carga diferida, actualización de geometría sin recrear WebGL, liberación GPU, ResizeObserver, IntersectionObserver, pagehide y cancelación de rAF.
- [x] Migración progresiva en el nuevo laboratorio: intentar ES module local y fallback a UMD. Migración del visor curricular completo aplazada por compatibilidad de tutores.
- [x] Añadir pruebas de consistencia de referencias, escenas y secciones; validar visualmente que la vista 2D responde a cambios. Paridad renderizada 3D real pendiente de Fase 6.
**Criterios:** sin pérdidas de contexto al cambiar 2D/3D, cámara estable, diagonales no confundibles con aristas, WebGL ausente → vista 2D comprensible.

**Cierre de implementación:** [FASE2-REPORTE-2026-11-14.md](FASE2-REPORTE-2026-11-14.md), con resultados matemáticos, capturas y limitaciones explícitas.

## Fase 3 — Rigor matemático y didáctico
- [x] Inventariar 17 lecciones con definiciones, teoremas, ejemplos, 107 ejercicios y 18 retos; evaluar 43 alternativas y 129 distractores.
- [x] Recalcular 64 respuestas numéricas y comprobar relaciones de 18 retos; corregir claves, unidades, hipótesis y convenciones de geometría.
- [x] Conservar render matemático KaTeX con MathML y mejorar contenedores responsive en `css/fase3.css`; comprobación visual inicial. Auditoría WCAG transversal permanece en Fase 6.
- [x] Añadir 17 guías académicas (principio, comprobación, condición límite), aclarar hipótesis, corregir demostraciones y ejemplos con resultados ambiguos.
- [x] Permitir reintentos, ocultar claves tras un fallo, registrar consulta explícita y mostrar diagnóstico causal según alternativa elegida.
- [x] Incorporar 17 ejercicios UNI de transferencia, uno por lección; total 107; 129 motivos específicos para alternativas erróneas.
- [x] Distinguir solución consultada (5 puntos en ejercicio) de acierto autónomo (10); no puntuar reto si el desarrollo ya fue revelado; preservar puntos de resolución previa.
**Criterios:** todas las respuestas del banco recalculadas, tolerancias justificadas y sin discrepancias entre modelo gráfico y fórmula.

**Informe de ejecución:** [FASE3-REPORTE-2026-11-14.md](FASE3-REPORTE-2026-11-14.md). La ejecución del navegador registró 159/159 comprobaciones; `npm test`, `npm run build` y la certificación de accesibilidad multidispositivo siguen pendientes de la Fase 6.

## Fase 4 — Vértiz, narración y accesibilidad
- [x] Sincronizar por origen de figura y paso: transcripción, eventos reales de palabra, foco y capas persistentes, incluso con voz desactivada.
- [x] Elegir voces españolas instaladas con prioridad es-PE y opción manual; mantener 100 % de las explicaciones por escrito si no existe audio.
- [x] Estados Web Speech, sesión anticuada descartada, error/fallback, repetición, silencio, pausa y reanudación nativas.
- [x] Normalización académica comprobada para fracciones, raíces, potencias, B/V, unidades y vértices; QA de voces en dispositivos físicos pendiente de Fase 6.
- [x] Semántica de figura, `aria-live` breve, `aria-current`, `aria-pressed`, atajos accesibles y reducción de movimiento; certificación WCAG transversal pendiente de Fase 6.
**Criterios:** se entiende cada lección con voz apagada, no hay audio obsoleto, no hay pérdida de foco ni superposición de avatar y matemática.

**Informe Fase 4:** [FASE4-REPORTE-2026-11-14.md](FASE4-REPORTE-2026-11-14.md). QA de navegador: 174/174 autocomprobaciones y prueba a 390 px sin scroll horizontal; pruebas del motor de voz simulado superadas. `npm test`, `npm run build` y certificación con voces/lectores de pantalla reales quedan pendientes de Fases 5–6.

## Fase 5 — Rendimiento y calidad técnica
- [x] Incorporar panel local de recursos, FCP, LCP, CLS, INP aproximado, heap y errores; registrar muestras móviles. El INP real, LCP/CLS de campo y memoria GPU física se certificarán en Fase 6.
- [x] SVG primero, Three.js bajo demanda, catálogo ligero y límites orientativos en `PRESUPUESTOS-RENDIMIENTO.json`.
- [x] Consolidar estilos del panel de verificación en `css/fase5.css` y excluir CSS/JS pesados de páginas informativas. La revisión editorial exhaustiva de otros estilos permanece en Fase 6.
- [x] Idioma es-PE, URLs canónicas para páginas y 17 lecciones, texto de descargas actualizado, cabeceras Cloudflare y servidor local con rutas permitidas y realpath.
- [x] Añadir regresiones de carga diferida, catálogo ligero, RAF estático, dispose GPU y exposición de archivos; se mantienen las pruebas académicas y de voz.
- [x] Registrar pruebas en navegador, pruebas JS aisladas, límites y comandos Node; no iniciar CI de GitHub Actions. `npm test` y `npm run build` siguen pendientes de ejecución en runner.

**Informe técnico:** [FASE5-REPORTE-2026-11-14.md](FASE5-REPORTE-2026-11-14.md). **Nota:** no se consideran certificados aún el build Node, los Core Web Vitals de campo ni la matriz de navegadores.

## Fase 6 — Matriz de QA y cierre
- [x] Probar siete páginas a 1440/1280/1024/768/390/360/320 px y 17 lecciones a 320/390/768; corregir único desbordamiento. Orientación física horizontal queda fuera del navegador remoto.
- [x] Verificar DOM en Chromium con WebGL real, fallos simulados WebGL y fallback SVG 2D. Firefox y Safari en hardware real requieren validación externa.
- [x] Comprobar menú móvil, foco y PageDown, transcripción con voz desactivada, atributos ARIA y CSS de movimiento reducido. Zoom físico 200%, NVDA, VoiceOver y TalkBack permanecen como certificación externa.
- [x] Verificar portada (12 módulos/17 enlaces), todas las lecciones, 107 ejercicios y 18 retos por DOM; probar respuestas errónea/correcta, pistas, progreso y controles de reto; se preservó navegación.
- [x] Confirmar 174/174 verificaciones del curso, 64 recálculos numéricos, 18 comprobadores de retos y diagnóstico de 129 distractores; 17 lecciones sin duplicados ni errores KaTeX.
- [x] Guardar dos capturas reales a 320 px de la tabla y registro de incidencias clasificado con valores antes/después.
- [x] Publicar informe de Fase 6 y matriz JSON, distinguir Chromium y pruebas aisladas de certificación física externa; activar pruebas y build en Cloudflare.

**Informe de cierre:** [FASE6-REPORTE-2026-11-14.md](FASE6-REPORTE-2026-11-14.md) y [matriz QA](QA-FASE6/matriz.json). No atribuir certificación física Safari/Firefox/lectores de pantalla sin dispositivos reales.

## Registro de ejecución (esta intervención)
Cambios guardados directamente en `main` en una serie de commits pequeños: validación numérica, puntuación de ejercicios y retos, seguridad básica del servidor local, semántica del catálogo, estructura del hero, mejoras CSS, contador inicial y pruebas Node ampliadas. **No se afirma que el despliegue se haya actualizado ni que las pruebas se hayan ejecutado automáticamente.** Se requiere `npm test`, `npm run build` y auditoría visual del sitio desplegado antes de dar por cerrada la fase.
