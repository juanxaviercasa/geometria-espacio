# Fase 4 — Vértiz, voz matemática y accesibilidad

**Fecha:** 14 de noviembre de 2026  
**Repositorio:** https://github.com/juanxaviercasa/geometria-espacio  
**Producción:** https://geometriaespacio.sistemazenit.com/  
**Rama:** `main`, Cloudflare Pages `geometria-espacio`.

## Objetivo
Garantizar que la explicación de cualquier figura permanezca visible, matemáticamente correcta y operable sin audio, sincronizando paso pedagógico, capa geométrica resaltada y narración opcional de Vértiz.

## Arquitectura implementada

### `js/voz-matematica.js`
Motor de normalización de expresiones para locución en español. Se conserva sin modificaciones el texto y el render matemático visible; la normalización solo se utiliza para sintetizar voz y para la transcripción complementaria.

- Procesa `\frac{3}{4}` como «fracción 3 sobre 4» y `√`, `∛` y `\sqrt{…}`.
- Lee exponentes (`x²` y `x^2`) como «equis al cuadrado», números completos (`12`) sin separarlos y `-7x` como «menos siete equis».
- Distingue las letras aisladas B («be») y V («uve»); separa nombres de vértices como `AC₁` y `C₁D₁`, interpreta subíndices y grados.
- Convierte unidades comunes como cm², cm³, m², m³, mm², y porcentaje a expresiones orales.
- Expone `palabras()` y `palabraEn()` para correlacionar los índices de palabra y la locución; no finge una posición cuando Web Speech no emite eventos `boundary`.

### `js/avatar.js`
Motor Web Speech API mejorado sin servidor adicional:

- Selecciona voces `es-*` disponibles, priorizando es-PE y, cuando no exista, otras voces hispanas; permite conservar una preferencia concreta por `voiceURI`.
- Conserva estilos tonales de tutores, con velocidad ajustable.
- Tiene estados diferenciados `preparando`, `hablando`, `pausado`, `finalizado`, `error`, `sin-voz`, `silenciado`, `detenido`.
- Identifica cada solicitud con número de sesión y origen de figura; cancela la anterior antes de iniciar otra. Los eventos tardíos `onend`, `onerror` o `onboundary` de la solicitud anterior no modifican la narración nueva.
- Usa `speechSynthesis.pause()`, `resume()` y `cancel()`, sin cronómetros que simulen una lectura o corten arbitrariamente la duración del audio.
- Si no hay Web Speech API, si el usuario silencia o si el sintetizador lanza un error, conserva el texto y notifica el estado real.
- Pausa al ocultarse la pestaña; el usuario puede reanudar manualmente.
- Los mini tutores solo reaccionan a la voz originada por su figura; otras figuras no reciben la animación de hablado.

**Importante:** La disponibilidad, calidad de las voces y emisión de `boundary` dependen del navegador, sistema operativo y paquetes de voz instalados. El sitio no instala un modelo neural ni garantiza una voz específica; algunos motores pueden usar servicios de su proveedor.

### `js/narracion-ui.js`, `js/visor.js`
- Botones de voz, repetir, pausar y reanudar, más selectores de voz española y velocidad.
- Transcripción visual del texto oral; resaltado de la palabra mediante `boundary.charIndex` solo si el navegador emite información real.
- Texto matemático original, título de paso, capa seleccionada y cámara se mantienen anclados al avanzar; la finalización o el error de voz no los oculta ni desplaza automáticamente.
- Cada visor tiene un origen de narración único, lo que impide resaltar una palabra de otra figura.
- La narración está desactivada visualmente sin pérdida de instrucciones cuando el estudiante silencia el audio.
- Mensajes breves `role=status` / `aria-live=polite` comunican estados sin forzar la lectura repetida de todo el contenido.
- El paso actual se marca con `aria-current=step`; los botones permiten navegación por teclado. `PageDown` y `PageUp` funcionan cuando el foco está en el visor; en modo proyector también se admiten flechas.
- El lienzo recibe descripción accesible de `spec.alt`, los botones de voz declaran `aria-pressed`, y los gestos del mini-avatar están separados de la superficie del modelo.
- Con movimiento reducido, los cambios de cámara usan la ruta reducida del motor; no se obliga a animar el texto ni el indicador.

### `css/fase4.css`
Los controles son responsivos, con un área táctil mínima de 43–45 píxeles, contraste reforzado, transcripción legible y marcadores de foco visibles. El avatar sigue ubicado fuera de la figura, no sobre los elementos geométricos. Se incluye un tratamiento específico de `prefers-reduced-motion`.

## Pruebas ejecutadas

1. **Validación programática del motor de voz con sintetizador simulado:** voz española priorizada, pronunciación matemática, índice de palabra, pausa/reanudación, error `language-unavailable`, cancelación tardía y silencio.
2. **Prueba en navegador publicada (390×844):** una lección con figura avanza del paso 1 de 5 al paso 2 de 5 con voz desactivada; la transcripción y el texto permanecen, la navegación de pasos marca `aria-current` y el documento mantiene el ancho correcto, sin scroll horizontal.
3. **Prueba de aislamiento por figura (390×844):** evento simulado de palabra ilumina exactamente un término de la figura activa, cero de otras figuras. El estado de pausa actualiza el botón a «Reanudar» sin cambiar el paso.
4. **QA de continuidad (1024×768):** transcripción visible coincide con el texto realmente preparado para voz, sin partir la unidad cúbica y sin habilitar pausa si la voz está silenciada.
5. **Autocomprobaciones públicas:** la página `verificacion.html` mostraba **174 de 174 comprobaciones superadas** en la ejecución observada, incluidas 15 pruebas adicionales de voz y notación.

Se añadieron pruebas de regresión en `regresiones.cjs` para el motor Web Speech simulado (voz, evento de palabra, silencio, pausa, reanudación, errores y obsolescencia). **No se ejecutó `npm test` ni `npm run build` en un entorno Node completo desde el conector**; estos comandos deberán ejecutarse por un runner con acceso a los archivos y quedan como parte de la validación de integración. No se ha certificado todavía VoiceOver/NVDA/TalkBack ni voz real en dispositivos físicos.

## Cómo utilizar el aula
1. Abre una lección con figura; selecciona «Explicar paso 1» en Modo Maestro.
2. Usa «Pausar/Reanudar», «Repetir», «Voz» y los selectores de voz y velocidad; los botones Anterior/Siguiente controlan el avance exclusivamente por acción del estudiante.
3. En ausencia de voz o con silencio, lee el texto y observa la misma capa destacada, sin pérdida de la demostración.
4. Puedes alternar entre 2D y 3D, según las posibilidades del dispositivo; el contenido verbal no depende del motor gráfico.

## Preservación de fases anteriores
- Se respetaron las 17 lecciones, 107 ejercicios, 18 retos y 129 diagnósticos específicos de distractores implementados en Fase 3.
- No se cambiaron los identificadores de contenido ni la clave de progreso local.
- Continúan operativos los modelos paramétricos y el visor 2D/3D de las Fases 1 y 2.
- El paquete ZIP incluye el nuevo motor de voz, la interfaz de narración y su CSS.

## Pendientes de cierre transversal
- Ejecución integral de `npm test` y `npm run build` mediante runner Node.
- Certificación en Chrome, Firefox, Safari y navegadores móviles, incluyendo ausencia de TTS, pausas en segundo plano, lectores de pantalla y zoom 200%.
- Medición de rendimiento, peso de bundles, CLS y GPU en Fase 5.
- Auditoría final WCAG, navegación exclusivamente con teclado y evidencia de capturas en Fase 6.

**Estado de Fase 4:** implementada en `main`, publicada en Cloudflare Pages y validada con pruebas de comportamiento representativas, sin presentar la calidad de la voz nativa ni la accesibilidad física como certificadas.
