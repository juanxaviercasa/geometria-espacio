# Fase 3 — Rigor matemático y pedagógico: informe de implementación

**Fecha:** 14 de noviembre de 2026  
**Repositorio:** https://github.com/juanxaviercasa/geometria-espacio  
**Producción:** https://geometriaespacio.sistemazenit.com/  
**Cloudflare Pages:** proyecto `geometria-espacio`, rama `main`.

## 1. Alcance completo

La auditoría trabajó sobre **17 lecciones en 12 módulos**, **90 ejercicios originales**, **18 retos originales** y los ejemplos resueltos, definiciones, teoremas y explicaciones declarados en `js/contenido-a.js` a `js/contenido-d.js`.

Se añadieron **17 ejercicios de transferencia avanzada (tipo UNI)**, uno por lección, conservando identificadores y respuestas históricos. El catálogo actualizado queda en **107 ejercicios: 64 numéricos y 43 de opción**, más **18 retos de admisión**.

### Infraestructura editorial entregada

| Archivo | Función |
|---|---|
| `js/contenido-a.js` a `js/contenido-d.js` | Enunciados, soluciones y demostraciones corregidas |
| `js/contenido-uni.js` | 17 nuevas preguntas numéricas de transferencia, una por lección |
| `js/guia-academica.js` | 17 rutas didácticas con principio, verificación y condición límite |
| `js/distractores.js` | 129 mensajes específicos para alternativas incorrectas de 43 preguntas |
| `js/auditoria-academica.js` | 64 recálculos numéricos independientes, integridad de catálogo, claves y retos |
| `js/auditoria-retos.js` | 18 comprobadores matemáticos independientes de relaciones de cada reto |
| `js/actividades.js` | Reintentos, pistas graduadas, error diagnóstico y solución explícita |
| `js/progreso.js` | Registro de pistas, intentos reales, consulta de solución y mérito independiente |
| `js/leccion.js` | Ruta de razonamiento, anclas de secciones y presentación pedagógica |
| `css/fase3.css` | Legibilidad matemática, contraste de retroalimentación y estructura responsive |
| `js/verificacion.js`, `regresiones.cjs` | Pruebas de todas las claves, los retos y los distractores |

## 2. Errores de contenido corregidos

Se corrigieron preguntas y demostraciones, no solo sus claves. Las principales intervenciones fueron:

1. **Pirámide triangular** (`m7l1e6`): arista básica 6, lateral 5. La altura correcta es `√13 ≈ 3,61`, no 4,12. Se corrigieron clave y justificación.
2. **Tetraedro degenerado** (`m2l2r1`): `P` pertenece al plano `A₁BD`; `V(PA₁BD)=0`. Se distinguió del tetraedro `AA₁BD` de volumen `a³/6`.
3. **Sección pentagonal** (`m1l2r1`): se determinó el plano, los cinco puntos de intersección y su perímetro exacto `a(√10+1/√2)`.
4. **Tetraedro y octaedro inscritos** (`m12l1r1`): el octaedro formado por los centros de las caras del cubo está contenido dentro del tetraedro de vértices alternos; el volumen libre es `2a³/3`, no el volumen exterior solo al octaedro.
5. **Pirámide en un cubo** (`m7l1r1`): se identificó explícitamente la arista `AC₁` cuyo ángulo con la base se calcula y se corrigió la relación seno/coseno.
6. **Pirámides con caras equiláteras**: diedro cara-base `arccos(1/√3) ≈ 54,74°`, no 45°.
7. **Ángulos de caras opuestas** (`m3l2r1`): se diferenciaron planos prolongados de caras opuestas del diedro definido por caras adyacentes.
8. **Rectas alabeadas ortogonales** (`m1l2e5`): terminología geométrica corregida para no confundir ortogonalidad de direcciones con intersección perpendicular.
9. **Distancias entre aristas**: `AB` y `C₁D₁` son paralelas, no alabeadas; se rehízo el ejemplo y se comparó con `AB` y `CC₁`.
10. **Recta `OM` dentro del plano `OBC`**: el reto de triedro ahora pregunta por `AM`, que sí forma el ángulo calculado con ese plano.
11. **Prisma oblicuo**: ya no exige calcular un área lateral subdeterminada; se explica qué orientación adicional falta.
12. **Proyección de un segmento**: ya no se llama «área» a la longitud proyectada.
13. **Ángulo diagonal–arista/diagonal–plano**: se distingue `54,74°` de `35,26°`.
14. **Prisma truncado**: se especifica una superficie de corte plana y el orden de alturas opuestas compatibles.
15. **Ángulos poliedros**: se corrigió la generalización errónea `C(n,2)` para número de diedros; cuenta caras consecutivas.
16. **Cono contenido en esfera**: se completaron enunciado y demostración por radios de secciones horizontales.
17. **Sección triangular por puntos medios**: se corrigió un título engañoso que la llamaba pentagonal y se entregó el cálculo completo.
18. **Cubo, diagonal y planos**: se eliminó una ecuación falsa presentada como paso de solución; se dejó la demostración válida.
19. **Condiciones de coplanariedad y conteo de planos**: la generalización `C(n,3)` requiere evitar cuatro puntos coplanares, además de tres alineados.
20. **Problema del ortoedro entero imposible**: ahora el enunciado pide verificar existencia, no calcular dimensiones de un sólido inexistente.
21. **Comparación de volúmenes**: se corrigió la afirmación de que una pirámide `a³/3` y un octaedro `a³/6` tenían el mismo volumen.
22. **Navegación académica**: se corrigieron anclas repetidas y enlaces a bloques de contenido.

## 3. Nuevo itinerario de aprendizaje

Cada lección contiene una **ruta de razonamiento** con tres componentes contextualizados: principio matemático, verificación independiente y casos en que el teorema no aplica. Los 17 nuevos ejercicios UNI tienen dos pistas graduadas, unidad, tolerancia numérica justificada y desarrollo.

Para preguntas de opción múltiple, el alumno recibe un **diagnóstico específico de la alternativa que eligió** entre 129 motivos redactados; no se revela la clave simplemente por fallar. Puede corregir y volver a comprobar.

Las respuestas numéricas incorrectas tampoco muestran el valor esperado; se ofrecen pistas. La explicación completa se abre por acción explícita y queda registrada. Una respuesta correcta sin consultar solución mantiene **10 puntos**; con solución consultada, **5 puntos**. Las pistas, por sí solas, **no incrementan los intentos**.

En retos, consultar el **desarrollo completo** impide atribuir 25 puntos por una resolución supuestamente autónoma posterior. Una resolución declarada antes de consultar el desarrollo sigue válida. El progreso conserva la clave de almacenamiento `geo3d.progreso.v1`, sin borrar datos históricos.

## 4. Validación ejecutada

- **Auditoría matemática programática:** 17 lecciones, 107 ejercicios (64 numéricos/43 alternativas), 18 retos, 64 respuestas recalculadas; **cero fallos detectados** en esta batería.
- **Auditoría de retos:** 18 de 18 verificadores geométricos independientes, incluidos cortes, ángulos, perpendiculares, volúmenes, solapamientos y relaciones métricas, sin fallos detectados.
- **Cobertura de distractores:** 43 preguntas de alternativa, 129 mensajes específicos; cobertura completa del banco actual.
- **Verificación en navegador publicado:** `verificacion.html` mostró **159 de 159 comprobaciones superadas** en la ejecución observada.
- **Prueba responsive:** práctica de 390 px con 107 ejercicios y sin scroll horizontal; lección de pirámides 390 px con guía y clave 3,61 sin scroll horizontal.
- **Prueba de retroalimentación:** ingresar 4,12 para `m7l1e6` se rechazó sin revelar 3,61, dejó el botón disponible y registró un intento.
- **Prueba de alternativa:** una respuesta incorrecta permitió otro intento y posteriormente la respuesta correcta; se registraron dos intentos.
- **Prueba de reto:** consultar desarrollo activó `consultoSolucion`, bloqueó declaración autónoma y no atribuyó puntos.
- **Prueba de puntuación aislada:** intento independiente=10 puntos, correcto tras solución=5; reto consultado=0 puntos y declaración previa a consulta=25.
- **Sintaxis JavaScript:** comprobada en los archivos nuevos/modificados mediante un motor JS.

### Límites de la verificación

**No se ha ejecutado `npm test` ni `npm run build` desde GitHub o Cloudflare** (la conexión usada no dispone de ejecución shell de esos comandos). Se añadieron las pruebas a `regresiones.cjs` para ejecutarlas en un runner Node. El navegador permite comprobar flujos representativos y autocomprobaciones; no certifica por sí solo todas las combinaciones de interacción ni accesibilidad WCAG. En ejercicios simbólicos, los 18 verificadores prueban propiedades geométricas relevantes, pero no constituyen una demostración formal automatizada de cada frase editorial.

## 5. Criterios de mantenimiento

- Los identificadores de las 90 preguntas originales no cambian, evitando romper historiales.
- Nuevos IDs de 17 ejercicios UNI con sufijo `u1`.
- Todo ejercicio numérico nuevo debe incluir recálculo independiente y tolerancia.
- Cada nueva alternativa incorrecta debe indicar el error que representa.
- Todo reto debe demostrar su conclusión; revelar desarrollo no otorga resolución autónoma.
- La interfaz, tutores y visores 2D/3D se preservan.
- Continuar con **Fase 4: Vértiz, voz y accesibilidad del contenido narrado**, seguida de QA transversal (Fases 5–6).

**Estado:** Fase 3 implementada, publicada, auditada programáticamente y probada mediante flujos representativos del sitio; ejecución completa de tests Node y auditoría transversal de navegadores pendientes.
