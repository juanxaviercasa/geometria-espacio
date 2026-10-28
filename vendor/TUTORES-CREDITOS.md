# Recursos de los tutores

## Dragón 3D

Autor: Quaternius. Animated Monster Pack (agosto de 2018), CC0 1.0.
Fuente de autor/licencia: https://quaternius.com/packs/animatedmonster.html
Modelo GLB convertido distribuido por GameDev Asset Library:
https://gamedev.trebeljahr.com/quaternius/animated-monster-pack-by-quaternius/dragon
Descarga: https://assets.gamedev.trebeljahr.com/glb/quaternius/animated-monster-pack-by-quaternius/glb/dragon.glb
Catálogo: https://github.com/trebeljahr/gamedev
Archivo local: tutor-dragon.glb (268884 bytes). Adaptación visual: materiales turquesa, dorado y violeta, iluminación frontal y encuadre de la malla deformada por el esqueleto. Se reproduce Dragon_Flying; no se usan las animaciones de ataque o muerte en la clase.

## Motor y cargador

Three.js r160, MIT: https://github.com/mrdoob/three.js/tree/r160
GLTFLoader.js y toTrianglesDrawMode de BufferGeometryUtils.js de esa revisión.
Adaptación: imports convertidos al objeto THREE ya presente en la app; utilidad incluida en el mismo cierre para evitar solicitudes a CDNs.
El aviso y la licencia MIT se conservan en THREE-LICENSE.txt.

## Pokémon (imágenes 2D)

Repositorio: https://github.com/PokeAPI/sprites
Revisión fijada: 1dd55c0436d2a5b6e324c0b780e1b1b416fbfb64.
Sprites GIF de sprites/pokemon/other/showdown/{6,25,133,149}.gif.
Imágenes estáticas de sprites/pokemon/{6,25,133,149}.png para movimiento reducido.
Créditos de animaciones de batalla: comunidad Smogon / Pokémon Showdown, según README del repositorio.
Pokémon y sus personajes son propiedad de sus respectivos titulares. La disponibilidad del repositorio no transfiere los derechos sobre personajes ni sus marcas. Esta app no está afiliada a Pokémon, Nintendo, Creatures o Game Freak.

## Animales de bloques

Dragón, capibara, águila, zorro, gato, panda, conejo y lobo: modelos geométricos originales de estética de bloques tipo Roblox construidos para esta aplicación con Three.js, con articulaciones y animación por código. No son modelos de Roblox ni personajes oficiales de otra franquicia.

## Voces

Esta versión usa Web Speech API y voces en español disponibles en el dispositivo; cambia tono y ritmo según el personaje y conserva las reglas de pronunciación matemática. No incorpora ni clona voces de actores, animes o doblajes oficiales.

Se investigaron como motores alternativos, pero NO se integraron ni descargaron sus modelos:
- Piper: https://github.com/OHF-Voice/piper1-gpl y sus MODEL_CARD por voz.
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md (español: ef_dora, em_alex, em_santa).

Todos los recursos gráficos usados por el selector se sirven desde el mismo sitio. Elegir un tutor no consulta APIs de Pokémon ni envía el texto de la lección a un servicio TTS añadido por esta aplicación. Las voces del sistema pueden ser locales o remotas según el navegador.
