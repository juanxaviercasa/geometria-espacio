/* ============================================================
   descarga.js — empaqueta el proyecto en un ZIP desde el navegador
   ------------------------------------------------------------
   Por qué existe: el entorno donde se construyó este proyecto no
   tiene shell ni puede crear archivos binarios, así que en lugar de
   entregar el sitio "a mano" esta página lee los archivos reales del
   propio sitio y arma un .zip válido en memoria.

   - Método STORE (sin compresión): no hace falta ninguna librería
     externa y el ZIP se abre en Windows, macOS y Linux.
   - CRC-32 calculado en el navegador, como exige el formato ZIP.
   - Si algún archivo falta, se informa cuál: no se genera un ZIP
     incompleto en silencio.
   ============================================================ */
(function (global) {
  'use strict';

  /* Inventario real del proyecto. Si se añade un archivo al sitio,
     hay que añadirlo también aquí para que viaje en el ZIP. */
  var ARCHIVOS = [
    // Páginas
    'index.html',
    'leccion.html',
    'practica.html',
    'acerca.html',
    'verificacion.html',
    'descarga.html',
    // Documentación y soporte
    'README.md',
    'SUBIR-A-GITHUB.md',
    'TODO.md',
    'TUTORES-2026-10-28.md',
    '.gitignore',
    '.nojekyll',
    // Estilos
    'css/estilos.css',
    // Lógica
    'js/progreso.js',
    'js/contenido.js',
    'js/contenido-a.js',
    'js/contenido-b.js',
    'js/contenido-c.js',
    'js/contenido-d.js',
    'js/figuras.js',
    'js/visor2d.js',
    'js/visor3d.js',
    'js/visor.js',
    'js/avatar.js',
    'js/tutores.js',
    'js/ui.js',
    'js/actividades.js',
    'js/leccion.js',
    'js/inicio.js',
    'js/practica.js',
    'js/acerca.js',
    'js/verificacion.js',
    'js/descarga.js',
    // Dependencia vendorizada (necesaria para la vista 3D)
    'vendor/three.min.js',
    'vendor/three.module.min.js',
    'vendor/GLTFLoader.js',
    'vendor/THREE-LICENSE.txt',
    'vendor/TUTORES-CREDITOS.md',
    'vendor/tutor-dragon.glb',
    'vendor/pokemon-6.gif', 'vendor/pokemon-6.png',
    'vendor/pokemon-25.gif', 'vendor/pokemon-25.png',
    'vendor/pokemon-133.gif', 'vendor/pokemon-133.png',
    'vendor/pokemon-149.gif', 'vendor/pokemon-149.png'
  ];

  /* ---------- CRC-32 (tabla precalculada) ---------- */
  var TABLA_CRC = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) {
      c = TABLA_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  /* ---------- Construcción del ZIP (método STORE) ---------- */
  var HORA_DOS = 0;                                    // 00:00:00
  var FECHA_DOS = ((2026 - 1980) << 9) | (10 << 5) | 28; // 2026-10-28

  function textoABytes(txt) {
    return new TextEncoder().encode(txt);
  }

  function construirZip(ficheros) {
    var trozos = [];      // contenido del archivo, en orden
    var centrales = [];   // cabeceras del directorio central
    var desplazamiento = 0;
    var total = 0;

    ficheros.forEach(function (f) {
      var nombre = textoABytes(f.nombre);
      var datos = f.datos;
      var crc = crc32(datos);
      var tam = datos.length;

      // Cabecera local + contenido
      var local = new Uint8Array(30 + nombre.length + tam);
      var dl = new DataView(local.buffer);
      dl.setUint32(0, 0x04034b50, true);
      dl.setUint16(4, 20, true);          // versión necesaria
      dl.setUint16(6, 0x0800, true);      // nombres en UTF-8
      dl.setUint16(8, 0, true);           // 0 = sin compresión
      dl.setUint16(10, HORA_DOS, true);
      dl.setUint16(12, FECHA_DOS, true);
      dl.setUint32(14, crc, true);
      dl.setUint32(18, tam, true);
      dl.setUint32(22, tam, true);
      dl.setUint16(26, nombre.length, true);
      dl.setUint16(28, 0, true);
      local.set(nombre, 30);
      local.set(datos, 30 + nombre.length);
      trozos.push(local);

      // Cabecera del directorio central
      var cen = new Uint8Array(46 + nombre.length);
      var dc = new DataView(cen.buffer);
      dc.setUint32(0, 0x02014b50, true);
      dc.setUint16(4, 20, true);          // versión creadora
      dc.setUint16(6, 20, true);          // versión necesaria
      dc.setUint16(8, 0x0800, true);
      dc.setUint16(10, 0, true);
      dc.setUint16(12, HORA_DOS, true);
      dc.setUint16(14, FECHA_DOS, true);
      dc.setUint32(16, crc, true);
      dc.setUint32(20, tam, true);
      dc.setUint32(24, tam, true);
      dc.setUint16(28, nombre.length, true);
      dc.setUint16(30, 0, true);          // extra
      dc.setUint16(32, 0, true);          // comentario
      dc.setUint16(34, 0, true);          // disco
      dc.setUint16(36, 0, true);          // atributos internos
      dc.setUint32(38, 0, true);          // atributos externos
      dc.setUint32(42, desplazamiento, true);
      cen.set(nombre, 46);
      centrales.push(cen);

      desplazamiento += local.length;
      total += tam;
    });

    var tamCentral = centrales.reduce(function (a, c) { return a + c.length; }, 0);

    // Registro de fin del directorio central
    var fin = new Uint8Array(22);
    var df = new DataView(fin.buffer);
    df.setUint32(0, 0x06054b50, true);
    df.setUint16(4, 0, true);
    df.setUint16(6, 0, true);
    df.setUint16(8, ficheros.length, true);
    df.setUint16(10, ficheros.length, true);
    df.setUint32(12, tamCentral, true);
    df.setUint32(16, desplazamiento, true);
    df.setUint16(20, 0, true);

    var partes = trozos.concat(centrales).concat([fin]);
    var bytes = new Uint8Array(
      partes.reduce(function (a, p) { return a + p.length; }, 0)
    );
    var pos = 0;
    partes.forEach(function (p) {
      bytes.set(p, pos);
      pos += p.length;
    });

    return { bytes: bytes, total: total, entradas: ficheros.length };
  }

  /* ---------- Descarga ---------- */
  function descargar(bytes, nombre) {
    var blob = new Blob([bytes], { type: 'application/zip' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 6000);
    return blob.size;
  }

  /* ---------- Interfaz ---------- */
  function formatoKB(n) {
    if (n < 1024) return n + ' B';
    return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
  }

  function iniciar() {
    var btn = document.getElementById('btn-descargar');
    var estado = document.getElementById('estado-descarga');
    var lista = document.getElementById('lista-archivos');
    var resumen = document.getElementById('resumen-zip');
    if (!btn) return;

    // Tabla inicial del inventario
    if (lista) {
      lista.innerHTML = ARCHIVOS.map(function (r) {
        return '<tr data-ruta="' + r + '">' +
          '<td><code>' + r + '</code></td>' +
          '<td class="der estado-celda"><span class="estado-no">pendiente</span></td>' +
          '</tr>';
      }).join('');
    }

    var totalArchivos = ARCHIVOS.length;

    // Recuento real en el encabezado de la tabla (no un número fijo)
    var totalEl = document.getElementById('total-archivos');
    if (totalEl) totalEl.textContent = totalArchivos;

    var leidos = 0;

    function marcar(ruta, ok, kb, error) {
      var fila = lista ? lista.querySelector('[data-ruta="' + ruta + '"]') : null;
      if (!fila) return;
      var celda = fila.querySelector('.estado-celda');
      celda.innerHTML = ok
        ? '<span class="estado-si">' + kb + '</span>'
        : '<span class="estado-no" title="' + (error || '') + '">error</span>';
    }

    function generar() {
      btn.disabled = true;
      btn.textContent = 'Preparando…';
      if (resumen) resumen.textContent = '';
      var ficheros = [];
      var fallos = [];
      leidos = 0;

      var cadena = Promise.resolve();
      ARCHIVOS.forEach(function (ruta) {
        cadena = cadena.then(function () {
          return fetch(ruta, { cache: 'no-store' })
            .then(function (res) {
              if (!res.ok) throw new Error('HTTP ' + res.status);
              return res.arrayBuffer();
            })
            .then(function (buf) {
              var datos = new Uint8Array(buf);
              ficheros.push({ nombre: ruta, datos: datos });
              leidos++;
              marcar(ruta, true, formatoKB(datos.length));
              if (estado) {
                estado.textContent = 'Leyendo archivos… ' + leidos + ' de ' + totalArchivos;
              }
            })
            .catch(function (e) {
              fallos.push(ruta + ' (' + e.message + ')');
              marcar(ruta, false, 0, e.message);
            });
        });
      });

      cadena.then(function () {
        if (!ficheros.length) {
          throw new Error('No se pudo leer ningún archivo del proyecto.');
        }
        if (estado) estado.textContent = 'Empaquetando…';
        var zip = construirZip(ficheros);
        var tam = descargar(zip.bytes, 'geometria-espacio.zip');

        var msg = 'ZIP generado: ' + zip.entradas + ' archivos · ' +
          formatoKB(tam) + ' · contenido sin comprimir ' + formatoKB(zip.total) + '.';
        if (fallos.length) {
          msg += ' Aviso: ' + fallos.length + ' archivo(s) no se pudieron leer: ' +
            fallos.join(', ') + '.';
        }
        if (estado) estado.textContent = msg;
        if (resumen) {
          resumen.innerHTML = '<p class="retro ok" role="status">' + msg +
            ' La descarga debería haber comenzado. Si tu navegador la bloqueó, ' +
            'pulsa de nuevo el botón.</p>';
        }
        btn.disabled = false;
        btn.textContent = 'Descargar de nuevo (.zip)';
      }).catch(function (e) {
        var err = 'No se pudo generar el ZIP: ' + e.message;
        if (estado) estado.textContent = err;
        if (resumen) {
          resumen.innerHTML = '<p class="retro no" role="status">' + err + '</p>';
        }
        btn.disabled = false;
        btn.textContent = 'Reintentar';
      });
    }

    btn.addEventListener('click', generar);
  }

  global.Descarga = {
    iniciar: iniciar,
    ARCHIVOS: ARCHIVOS,
    construirZip: construirZip,
    crc32: crc32
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})(window);
