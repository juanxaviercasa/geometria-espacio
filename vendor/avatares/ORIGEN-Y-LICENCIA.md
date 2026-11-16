# Origen, licencia y limitaciones de los profesores 3D

**Fecha de integración:** 15 de noviembre de 2026  
**Licencia del arte:** CC0 1.0 Universal, recurso original de Kay Lousberg (KayKit).  
**Referencia oficial:** https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0  
**Versiones GLB optimizadas:** https://github.com/sion-rgb/tactical-slash/blob/main/THIRD_PARTY_ASSETS.md

Los tres archivos están alojados en `vendor/avatares/` dentro de este repositorio,
y no dependen de servidores externos para funcionar en la web.

| Nombre en el aula | Archivo GLB | Tamaño | Modelo de origen |
|---|---|---:|---|
| Ariel, Maestro 3D | `player_priest.glb` | 536.752 B | KayKit Mage |
| Axel, Guardián 3D | `player_swordsman.glb` | 549.284 B | KayKit Knight |
| Lía, Exploradora 3D | `player_archer.glb` | 701.504 B | KayKit Rogue Hooded |

Los archivos son copias byte a byte de los tres GLB ya optimizados del repositorio
Tactical Slash; se verificó que los SHA de los blobs coinciden con el origen.

Los archivos contienen armaduras esqueléticas y siete clips:
`Idle`, `Walking_A`, `Spellcast_Shoot`, `Hit_A`, `Death_A`,
`1H_Melee_Attack_Slice_Horizontal` y `2H_Ranged_Shoot`.
El aula utiliza `Idle` en reposo y `Spellcast_Shoot` al recibir eventos reales
de voz hablada, con transición cruzada.

**Límites técnicos y pedagógicos:**
- No contienen visemas de pronunciación ni formas faciales ARKit.
  La animación acompaña a la voz neural pero **no es lipsync fonético**.
- No son modelos oficiales de Roblox, Pokémon, GTA ni franquicias de anime.
  Son recursos independientes CC0 con estética de videojuego.
- Se cargan bajo demanda mediante GLTFLoader y WebGL. La opción Vértiz SVG
  permanece accesible cuando el navegador no soporta renderizado 3D.
- Para publicar personajes de franquicias existentes se requerirían permisos de
  los titulares, aunque el archivo aparezca en un repositorio público.
- El modelo humano realista Rocketbox y los avatares VRoid se evaluaron, pero no
  se insertaron automáticamente: sus formatos, pesos y permisos de modelos
  concretos requieren una conversión o validación específica.
