# Auditoría de geometría del espacio — 28 de octubre de 2026

## Acceso

El navegador tiene sesión de juanxaviercasa y acceso al repositorio privado. La conexión de herramientas GitHub se identificó como zenitmath y devolvió 404 para el mismo repositorio. Se descargó el código desde la sesión autorizada del navegador, sin cerrar sesiones ni cambiar permisos. No se confirmó la desvinculación de zenitmath: la operación disponible eliminaba todo el complemento y fue rechazada por la revisión automática.

## Cambios

- Prisma 2×3×6: una diagonal de base AC y una espacial AC₁. Antes se mostraban cinco diagonales, incluidas varias que no se explicaban. La presentación empieza sin diagonales y cada paso activa las capas necesarias.
- Cámara del prisma con theta 0,7: el ángulo anterior, −0,62, alineaba casi exactamente la proyección de AC₁ con una arista vertical. La regresión exige separación horizontal de la diagonal de base.
- Resaltado persistente hasta cambiar de paso, en lugar de desaparecer a los 4,2 segundos. Las capas atenuadas dejan de escribir profundidad para no ocultar la línea explicada.
- Cámara de la guía aplicada también al dibujo 2D. Al regresar a 3D se reaplica el paso actual. Controles y estado de capas permanecen coherentes.
- Locución: cuadrados, cubos, signos más/igual y pi se convierten a texto hablado; be y ce se explicitan en la fórmula. Se conservan subíndices y raíces.
- Una sesión de voz invalida los arranques diferidos y callbacks anteriores. Silenciar impide que una locución pendiente arranque después. La animación termina con el evento real del audio, no con una estimación de duración.
- Se elimina una celebración retrasada que podía activarse en otro paso. Se evita duplicar instancias al alternar vistas y que Espacio active dos veces un botón en proyección.
- Se corrigen las etiquetas accesibles del selector de pasos y la ruta redundante de carga del visor.
- La portada indica 17 lecciones, coherente con el registro y el progreso, en lugar de 14.

## Validación

- `npm test`: seis pruebas de regresión con Node, sin dependencias. Cubren pronunciación preparada, cambios rápidos, silencio antes de iniciar, callbacks obsoletos, final real del audio y longitudes de diagonales (√13 y 7).
- `npm run build`: genera dist correctamente.
- Navegador local: 74/74 autocomprobaciones existentes, incluida coherencia de vértices, capas y respuestas.
- Navegador local: cambio de paso y de capas en 3D; cambio a 2D y paso de diagonal de base; retorno a 3D con el mismo paso.
- La consola mostró un aviso de obsolescencia del paquete UMD de Three.js. No se sustituyó la biblioteca en esta corrección.

## Límites

Las pruebas de voz comprueban el texto enviado al sintetizador y las condiciones de carrera con eventos simulados. La calidad y pronunciación audible de cada voz del sistema requieren escucha humana. Las 74 autocomprobaciones existentes no cubren exhaustivamente todas las respuestas del currículo. Esto no certifica una auditoría completa de accesibilidad ni de todos los dispositivos.

La conexión zenitmath sigue pendiente de una desvinculación selectiva desde la administración de conexiones. Las correcciones se preparan en una rama para revisión; este informe no afirma que estén desplegadas en el dominio público.
