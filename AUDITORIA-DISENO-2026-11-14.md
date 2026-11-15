# Auditoría y rediseño visual — 14 de noviembre de 2026

## Diagnóstico

La aplicación tenía una base funcional sólida, pero la interfaz presentaba una jerarquía visual confusa: el hero mezclaba el mensaje de entrada con demasiados controles del visor, el modelo 3D quedaba con poco espacio útil y el panel de Vértiz comprimía el personaje junto a selectores y controles de voz. En lecciones y práctica, la lectura y la interacción competían con un lateral visualmente débil, mientras que las páginas informativas no compartían una sensación de producto educativo acabado.

El problema no estaba en el motor geométrico ni en el banco académico. La auditoría estática y las pruebas existentes confirmaron que el cambio debía concentrarse en presentación, escala, ritmo, agrupación y responsive, preservando IDs, estados, eventos y contratos de JavaScript.

## Cambios aplicados

- Se añadió `css/rediseño-visual.css` como capa final de presentación, sin reescribir la lógica existente.
- Se unificó el sistema visual en todas las páginas: fondo, tokens de color, bordes, sombras, radios, tipografía, foco visible y espaciado.
- Se reequilibró la portada: texto de entrada más claro, CTA con más presencia, métricas más legibles y mayor protagonismo del aula 3D.
- Se reorganizó visualmente el escenario 3D para dar prioridad al lienzo y reservar una columna docente suficientemente legible.
- Se aumentaron el lienzo, el avatar y los controles táctiles; el personaje ahora conserva espacio propio en modo maestro, lección y práctica.
- Se separaron mejor las intenciones de uso: ruta de aprendizaje, explicación con tutor, práctica y documentación.
- Se mejoraron tarjetas de módulos, filas de lecciones, bloques de lectura y paneles laterales.
- Se añadieron breakpoints que apilan el escenario sin encoger el modelo ni provocar scroll horizontal, con reglas específicas para móvil pequeño.
- Se preservó el modo oscuro/proyector, la alternativa 2D, las preferencias locales, el audio, el progreso y la reducción de movimiento.

## Archivos modificados

- `css/rediseño-visual.css`
- `index.html`
- `leccion.html`
- `practica.html`
- `laboratorio.html`
- `acerca.html`
- `verificacion.html`
- `descarga.html`

## Validación

- `npm test`: 40/40 pruebas superadas.
- `npm run build`: completado correctamente; se generaron 28 recursos en `dist`.
- Revisión renderizada local de portada, lección `m6l1` y práctica.
- Se verificaron los selectores accesibles y la presencia de los controles del visor en la copia local.
- No se alteraron archivos de contenido, cálculos, progreso, narración ni motores 2D/3D.

## Límites

La revisión visual remota se realizó en Chromium. La certificación final en Safari, Firefox, lectores de pantalla y dispositivos físicos queda fuera de este entorno y debe hacerse antes de considerar el rediseño certificado para todos los navegadores.
