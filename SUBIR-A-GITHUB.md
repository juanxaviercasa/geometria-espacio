# Subir este proyecto a GitHub y publicarlo

Guía paso a paso. No necesitas terminal para la opción recomendada.

Repositorio de destino: `https://github.com/juanxaviercasa/geometria-espacio`

> Comprobado el 2026-10-27: el repositorio existe, es **público** y está **vacío**
> (`GET /branches` devuelve `[]`, `GET /contents/` devuelve 404). No hay nada que
> sobrescribir ni conflictos que resolver: este será el primer commit.

---

## 1. Qué hay que subir (manifiesto exacto)

**32 archivos** forman el proyecto: 6 HTML + 1 CSS + 19 JS + 1 de Three.js (27)
+ 5 de documentación y soporte (`README.md`, `SUBIR-A-GITHUB.md`, `TODO.md`,
`.nojekyll`, `.gitignore`). Si falta uno del sitio, algo se rompe.

> Atajo: abre `descarga.html` en el sitio y pulsa el botón. Genera un
> `geometria-espacio.zip` con estos 32 archivos, ya con la estructura de carpetas
> correcta, sin que tengas que arrastrarlos uno a uno. La guía manual sigue abajo
> por si prefieres subirlos a mano.

### Páginas HTML — obligatorias

| Archivo | Tamaño | Página |
|---|---|---|
| `index.html` | 14,9 KB | Portada: título, ruta de 12 módulos, banda de Vértiz |
| `leccion.html` | 5,8 KB | Lección (necesita `?id=`, p. ej. `leccion.html?id=m6l1`) |
| `practica.html` | 6,8 KB | Banco de ejercicios y retos |
| `acerca.html` | 22,2 KB | Método, licencias y gestión de datos |
| `verificacion.html` | 7,1 KB | Autocomprobaciones en el navegador |
| `descarga.html` | 7,9 KB | Genera y descarga el ZIP del proyecto |

### Estilos

| Archivo | Tamaño |
|---|---|
| `css/estilos.css` | ~48 KB |

### JavaScript — obligatorios, en este orden conceptual

| Archivo | Tamaño | Función |
|---|---|---|
| `js/progreso.js` | 7,8 KB | Progreso y preferencias en `localStorage` |
| `js/contenido.js` | 6,9 KB | Registro de los 12 módulos |
| `js/contenido-a.js` | 83,8 KB | Módulos 1–3 |
| `js/contenido-b.js` | 80,1 KB | Módulos 4–6 (incluye la lección completa `m6l1`) |
| `js/contenido-c.js` | 43,8 KB | Módulos 7–9 |
| `js/contenido-d.js` | 34,9 KB | Módulos 10–12 |
| `js/figuras.js` | 38,6 KB | 16 figuras: fuente única para 2D y 3D |
| `js/visor2d.js` | 15,0 KB | Vista 2D en SVG |
| `js/visor3d.js` | 18,9 KB | Vista 3D con Three.js (módulo ES) |
| `js/visor.js` | 10,2 KB | Orquesta 3D/2D y capas |
| `js/avatar.js` | 14,3 KB | Personaje guía «Vértiz» |
| `js/ui.js` | 4,9 KB | Cabecera, progreso, avatar |
| `js/actividades.js` | 12,7 KB | Ejercicios con pistas y retos progresivos |
| `js/leccion.js` | 17,4 KB | Render de lecciones |
| `js/inicio.js` | 7,2 KB | Portada y continuidad |
| `js/practica.js` | 5,6 KB | Banco de práctica |
| `js/acerca.js` | 3,6 KB | Exportación de datos |
| `js/verificacion.js` | 28,5 KB | 74 autocomprobaciones |

### Dependencia vendorizada — **no excluir**

| Archivo | Tamaño | Licencia |
|---|---|---|
| `vendor/three.module.min.js` | 392,8 KB | MIT (three.js 0.186.1) |

Este archivo **es imprescindible** para la vista 3D. Está en `vendor/` para que el sitio
funcione sin conexión y sin llamadas a terceros. `js/visor3d.js` lo importa con
`import * as THREE from '../vendor/three.module.min.js'`. Si falta, todas las figuras
caen a la vista 2D (siguen viéndose, pero se pierde el giro).

### Documentación y soporte

| Archivo | Función |
|---|---|
| `README.md` | Documentación técnica completa |
| `SUBIR-A-GITHUB.md` | Este documento |
| `.nojekyll` | Evita que GitHub Pages procese el sitio con Jekyll |
| `.gitignore` | Excluye solo basura del sistema |

`TODO.md` es el enunciado original del proyecto: puedes subirlo o dejarlo fuera, no afecta al sitio.

### Carpetas que deben existir

```
geometria-espacio/
├── index.html
├── leccion.html
├── practica.html
├── acerca.html
├── verificacion.html
├── README.md
├── SUBIR-A-GITHUB.md
├── .nojekyll
├── .gitignore
├── css/
│   └── estilos.css
├── js/
│   └── (18 archivos .js)
└── vendor/
    └── three.module.min.js
```

**La estructura de carpetas importa.** Las rutas del HTML son relativas
(`css/estilos.css`, `js/inicio.js`). Si aplanas todo en una sola carpeta, el sitio
queda sin estilos y sin scripts.

---

## 2. Opción A — Subir desde la web de GitHub (recomendada, sin terminal)

1. Abre `https://github.com/juanxaviercasa/geometria-espacio`.
2. Pulsa **Add file → Upload files**.
3. Arrastra **la carpeta completa del proyecto** a la zona de subida. GitHub acepta
   arrastrar carpetas y **conserva la estructura** `css/`, `js/`, `vendor/`.
   - Si tu navegador no permite arrastrar carpetas, crea primero las carpetas con
     **Add file → Create new file** escribiendo `js/` delante del nombre
     (por ejemplo `js/avatar.js`) y sube los archivos dentro.
4. En el campo de mensaje escribe:
   ```
   Geometría del espacio: ruta de 12 módulos, lecciones, figuras 2D/3D y personaje guía Vértiz
   ```
5. Comprueba que la rama sea **`main`** y pulsa **Commit changes**.

### Verificación tras subir

En la raíz del repositorio debes ver:

- 5 archivos `.html`
- `README.md`, `SUBIR-A-GITHUB.md`
- 3 carpetas: `css`, `js`, `vendor`

Y dentro de cada carpeta, los archivos de la tabla. Entra en `vendor/` y confirma que
`three.module.min.js` está ahí (392 KB). Es el que más se olvida.

> Los archivos que empiezan por punto (`.nojekyll`, `.gitignore`) son ocultos y la
> interfaz de subida puede no mostrarlos. Si quieres asegurarlos, usa
> **Add file → Create new file**, escribe `.nojekyll` como nombre, deja el contenido
> vacío y haz commit. `.nojekyll` conviene tenerlo, pero el sitio también funciona sin él.

---

## 3. Opción B — Con terminal (git)

Desde la carpeta del proyecto:

```bash
git init -b main

git add .
git commit -m "Geometría del espacio: ruta de 12 módulos, lecciones, figuras 2D/3D y personaje guía Vértiz"

git remote add origin https://github.com/juanxaviercasa/geometria-espacio.git
git push -u origin main
```

Al terminar, `git log -1 --format=%H` te da el **hash del commit**: ese es el que
puedes citar como confirmación del envío.

Si `git push` pide credenciales, usa un **token de acceso personal** (Settings →
Developer settings → Personal access tokens → Fine-grained, permiso *Contents:
Read and write* sobre este repositorio). No lo pegues en ningún sitio público y
revócalo cuando termines.

---

## 4. Publicar con GitHub Pages

1. En el repositorio: **Settings → Pages**.
2. En *Source* elige **Deploy from a branch**.
3. Rama **`main`**, carpeta **`/ (root)`**. Guarda.
4. Espera 1–2 minutos. La URL aparecerá en esa misma pantalla:

   ```
   https://juanxaviercasa.github.io/geometria-espacio/
   ```

### Enlaces directos que funcionarán

- Portada: `https://juanxaviercasa.github.io/geometria-espacio/`
- Lección completa de prismas: `.../leccion.html?id=m6l1`
- Simulacro final: `.../leccion.html?id=m12l1`
- Práctica: `.../practica.html`
- Autocomprobaciones: `.../verificacion.html`

GitHub Pages sirve `index.html` en la raíz, así que la portada abre sola.

---

## 5. Qué comprobar cuando esté publicado

Hazlo en este orden; si algo falla, la causa suele estar en la lista de abajo.

1. **Portada**: se ve el título «Geometría del espacio: piensa en 3D», la ruta de
   12 módulos y la banda de Vértiz con el personaje dibujado y el botón «Otro consejo».
2. **Estilos**: si ves la página sin colores ni tipografía, faltó `css/estilos.css`
   o se aplanó la carpeta `css/`.
3. **Personaje animado**: debe caminar, parpadear y señalar. Si está quieto, revisa
   que `js/avatar.js` esté subido.
4. **Figuras**: abre `leccion.html?id=m6l1`. Debes ver el prisma con etiquetas de
   vértices y los botones «Vista 2D», «Centrar», «Giro automático» y la fila «Capas».
5. **Vista 3D**: pulsa «Vista 2D / Vista 3D». En un hosting estático normal el 3D
   debe cargar (arrastrar gira la figura). Esto es lo que **no pude verificar** en el
   entorno de vista previa de la plataforma, donde la importación de archivos grandes
   se bloquea por una limitación del servidor de previsualización, no del código.
6. **Progreso**: resuelve un ejercicio y recarga. El progreso debe seguir ahí.
   Se guarda en `localStorage` de ese navegador, por dominio: no viaja entre
   dispositivos ni entre `usuario.github.io` y otro dominio.
7. **Consola** (F12): no debería haber errores en rojo. Un aviso sobre
   `sandbox` o sobre fuentes externas es normal.

### Problemas típicos y su causa

| Síntoma | Causa casi segura |
|---|---|
| Página sin estilos | Falta `css/estilos.css` o la carpeta se aplanó |
| La portada sale pero la ruta no se pinta | Falta algún `js/contenido-*.js` |
| «Cargando lección…» eterno | Falta `js/leccion.js` o `js/actividades.js` |
| Figuras en 2D y el botón 3D no cambia | Falta `vendor/three.module.min.js` |
| Sin personaje | Falta `js/avatar.js` |
| 404 al entrar en una lección | La URL necesita `?id=`, p. ej. `leccion.html?id=m6l1` |
| Error 404 en la raíz del site | Falta `index.html` o Pages apunta a otra carpeta |

---

## 6. Nota sobre datos y privacidad

El sitio no tiene backend ni cuentas. Todo el progreso vive en `localStorage` del
navegador del visitante, bajo las claves `geo3d.progreso.v1` y `geo3d.prefs.v1`.
No se envía nada a ningún servidor. Consecuencia práctica: si publicas una versión
nueva, **el progreso de los visitantes se conserva** (mismas claves, mismo dominio,
lectura no destructiva). Si algún día cambias de dominio, el progreso anterior no
viajará: pertenece al dominio antiguo.

---

## 7. Lo que no está terminado (honestidad)

- **No hay despliegue hecho por mí.** No tengo shell ni acceso de escritura a GitHub
  en este entorno: mis herramientas solo editan archivos y descargan con `GET`.
  Por eso no puedo darte un hash de commit ni una URL publicada.
- **Validación formal pendiente**: no se ha pasado un validador HTML ni una auditoría
  automática de contraste WCAG. Las comprobaciones hechas son de contenido, de cálculo
  y de render en navegador (`verificacion.html` ejecuta 74 y ahora da 74/74).
- **Profundidad desigual**: solo `m6l1` (prismas y diagonales) es exhaustiva. Las otras
  13 lecciones son correctas pero más breves.
- **El personaje es un sprite 2D animado con CSS**, no un modelo 3D con esqueleto.
  Está declarado así en `acerca.html#avatar`.
