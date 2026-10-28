/* ============================================================
   contenido.js — núcleo del currículo
   ------------------------------------------------------------
   Define los 12 módulos de la ruta y el registro de lecciones.
   Las lecciones se declaran en archivos separados y se
   registran aquí con Contenido.registrarLeccion(...).
   ============================================================ */
(function (global) {
  'use strict';

  var MODULOS = [
    {
      id: 'm1',
      numero: 1,
      titulo: 'Puntos, rectas y planos',
      desc: 'Los objetos del espacio, sus notaciones y los axiomas que sostienen todo lo demás.',
      lecciones: ['m1l1', 'm1l2']
    },
    {
      id: 'm2',
      numero: 2,
      titulo: 'Posiciones relativas, paralelismo y perpendicularidad',
      desc: 'Cómo se relacionan rectas y planos entre sí y cómo se demuestra cada relación.',
      lecciones: ['m2l1', 'm2l2']
    },
    {
      id: 'm3',
      numero: 3,
      titulo: 'Ángulos entre rectas, planos y recta-plano',
      desc: 'Medir aperturas en el espacio sin caer en el ángulo equivocado.',
      lecciones: ['m3l1', 'm3l2']
    },
    {
      id: 'm4',
      numero: 4,
      titulo: 'Proyecciones y distancias',
      desc: 'Proyectar, medir y resolver distancias entre puntos, rectas y planos.',
      lecciones: ['m4l1', 'm4l2']
    },
    {
      id: 'm5',
      numero: 5,
      titulo: 'Triedros y ángulos poliedros',
      desc: 'Ángulos que viven en un vértice: caras, diedros y sus desigualdades.',
      lecciones: ['m5l1']
    },
    {
      id: 'm6',
      numero: 6,
      titulo: 'Prismas y paralelepípedos',
      desc: 'Elementos, clasificación, áreas, volúmenes y todas las diagonales.',
      lecciones: ['m6l1', 'm6l2'],
      estrella: true
    },
    {
      id: 'm7',
      numero: 7,
      titulo: 'Pirámides',
      desc: 'Altura, apotema, arista lateral y el triángulo rectángulo que lo explica todo.',
      lecciones: ['m7l1']
    },
    {
      id: 'm8',
      numero: 8,
      titulo: 'Cilindro, cono y esfera',
      desc: 'Cuerpos de revolución: desarrollo plano, áreas y volúmenes.',
      lecciones: ['m8l1']
    },
    {
      id: 'm9',
      numero: 9,
      titulo: 'Poliedros regulares',
      desc: 'Los cinco sólidos platónicos, sus relaciones de Euler y sus duales.',
      lecciones: ['m9l1']
    },
    {
      id: 'm10',
      numero: 10,
      titulo: 'Secciones planas',
      desc: 'Cortar un sólido con un plano y reconocer el polígono que aparece.',
      lecciones: ['m10l1']
    },
    {
      id: 'm11',
      numero: 11,
      titulo: 'Problemas integradores de admisión',
      desc: 'Estrategias de examen: boceto, variables, teoremas y control de unidades.',
      lecciones: ['m11l1']
    },
    {
      id: 'm12',
      numero: 12,
      titulo: 'Simulacro final tipo UNI',
      desc: 'Retos cronometrados con solución progresiva y autoevaluación.',
      lecciones: ['m12l1']
    }
  ];

  var LECCIONES = {};
  var ORDEN = [];

  function registrarLeccion(datos) {
    if (!datos || !datos.id) return;
    LECCIONES[datos.id] = datos;
    if (ORDEN.indexOf(datos.id) === -1) ORDEN.push(datos.id);
  }

  function obtenerLeccion(id) {
    return LECCIONES[id] || null;
  }

  function moduloDeLeccion(idLeccion) {
    for (var i = 0; i < MODULOS.length; i++) {
      if (MODULOS[i].lecciones.indexOf(idLeccion) !== -1) return MODULOS[i];
    }
    return null;
  }

  /* Todas las lecciones en orden curricular */
  function listaOrdenada() {
    var out = [];
    MODULOS.forEach(function (m) {
      m.lecciones.forEach(function (id) {
        var l = LECCIONES[id];
        if (l) {
          out.push({ modulo: m, leccion: l, id: id });
        }
      });
    });
    return out;
  }

  function vecinos(idLeccion) {
    var lista = listaOrdenada();
    var idx = -1;
    for (var i = 0; i < lista.length; i++) if (lista[i].id === idLeccion) idx = i;
    if (idx === -1) return { anterior: null, siguiente: null, posicion: 0, total: lista.length };
    return {
      anterior: idx > 0 ? lista[idx - 1] : null,
      siguiente: idx < lista.length - 1 ? lista[idx + 1] : null,
      posicion: idx + 1,
      total: lista.length
    };
  }

  /* Primera lección no completada, para "continuar donde lo dejé" */
  function siguientePendiente() {
    var lista = listaOrdenada();
    for (var i = 0; i < lista.length; i++) {
      var est = global.Progreso ? global.Progreso.estado(lista[i].id) : null;
      if (est !== 'hecho') return lista[i];
    }
    return lista[lista.length - 1] || null;
  }

  function progresoModulo(m) {
    var total = m.lecciones.length;
    var hechas = 0;
    m.lecciones.forEach(function (id) {
      if (global.Progreso && global.Progreso.estado(id) === 'hecho') hechas++;
    });
    return { hechas: hechas, total: total, pct: total ? Math.round((hechas / total) * 100) : 0 };
  }

  function progresoGlobal() {
    var lista = listaOrdenada();
    var hechas = 0;
    lista.forEach(function (l) {
      if (global.Progreso && global.Progreso.estado(l.id) === 'hecho') hechas++;
    });
    return { hechas: hechas, total: lista.length, pct: lista.length ? Math.round((hechas / lista.length) * 100) : 0 };
  }

  function totalEjercicios() {
    var n = 0;
    listaOrdenada().forEach(function (l) {
      n += (l.leccion.ejercicios || []).length;
    });
    return n;
  }

  function totalRetos() {
    var n = 0;
    listaOrdenada().forEach(function (l) {
      n += (l.leccion.retos || []).length;
    });
    return n;
  }

  /* Banco plano de ejercicios de práctica (todos los módulos) */
  function bancoPractica() {
    var out = [];
    listaOrdenada().forEach(function (l) {
      (l.leccion.ejercicios || []).forEach(function (e) {
        out.push(Object.assign({}, e, {
          modulo: l.modulo.id,
          moduloNum: l.modulo.numero,
          moduloTitulo: l.modulo.titulo,
          leccionId: l.id,
          leccionTitulo: l.leccion.titulo
        }));
      });
    });
    return out;
  }

  function bancoRetos() {
    var out = [];
    listaOrdenada().forEach(function (l) {
      (l.leccion.retos || []).forEach(function (r) {
        out.push(Object.assign({}, r, {
          modulo: l.modulo.id,
          moduloNum: l.modulo.numero,
          leccionId: l.id,
          leccionTitulo: l.leccion.titulo
        }));
      });
    });
    return out;
  }

  global.Contenido = {
    MODULOS: MODULOS,
    LECCIONES: LECCIONES,
    registrarLeccion: registrarLeccion,
    obtenerLeccion: obtenerLeccion,
    moduloDeLeccion: moduloDeLeccion,
    listaOrdenada: listaOrdenada,
    vecinos: vecinos,
    siguientePendiente: siguientePendiente,
    progresoModulo: progresoModulo,
    progresoGlobal: progresoGlobal,
    totalEjercicios: totalEjercicios,
    totalRetos: totalRetos,
    bancoPractica: bancoPractica,
    bancoRetos: bancoRetos
  };
})(window);
