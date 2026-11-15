/* Fase 4 · lectura matemática española (sin dependencias ni servidor).
   Se conserva la expresión visual; esto solo prepara el texto para TTS. */
(function (global) {
  'use strict';
  function plano(valor) {
    return String(valor == null ? '' : valor)
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<sub\b[^>]*>(.*?)<\/sub>/gi, ' sub $1 ')
      .replace(/<sup\b[^>]*>(.*?)<\/sup>/gi, ' elevado a $1 ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&(?:nbsp|thinsp);/gi, ' ')
      .replace(/&(?:mdash|ndash);/gi, ', ')
      .replace(/&times;/gi, ' por ').replace(/&divide;/gi, ' dividido entre ')
      .replace(/&pi;/gi, ' pi ').replace(/&radic;/gi, ' raíz cuadrada de ')
      .replace(/&lt;/gi, ' menor que ').replace(/&gt;/gi, ' mayor que ')
      .replace(/&amp;/gi, ' y ').replace(/&#(\d+);/g, function (_, n) {
        var v = Number(n); return v > 31 && v < 65536 ? String.fromCharCode(v) : ' ';
      });
  }
  function latex(expresion) {
    var s = String(expresion || '');
    function bloque(inicio) {
      if (s[inicio] !== '{') return null;
      var profundidad = 0;
      for (var k = inicio; k < s.length; k++) {
        if (s[k] === '{') profundidad++;
        if (s[k] === '}' && --profundidad === 0)
          return { dato: s.slice(inicio + 1, k), fin: k + 1 };
      }
      return null;
    }
    for (var i = 0; i < s.length;) {
      var resto = s.slice(i), tipo = null, largo = 0;
      if (resto.startsWith('\\frac{')) { tipo = 'frac'; largo = 5; }
      else if (resto.startsWith('\\dfrac{')) { tipo = 'frac'; largo = 6; }
      else if (resto.startsWith('\\sqrt[3]{')) { tipo = 'cbrt'; largo = 8; }
      else if (resto.startsWith('\\sqrt{')) { tipo = 'sqrt'; largo = 5; }
      if (!tipo) { i++; continue; }
      var primero = bloque(i + largo);
      var segundo = tipo === 'frac' && primero ? bloque(primero.fin) : null;
      if (!primero || (tipo === 'frac' && !segundo)) { i += largo; continue; }
      var fin = segundo ? segundo.fin : primero.fin;
      var reemplazo = tipo === 'frac'
        ? ' fracción ' + primero.dato + ' sobre ' + segundo.dato + ' '
        : (tipo === 'cbrt' ? ' raíz cúbica de ' : ' raíz cuadrada de ') + primero.dato + ' ';
      s = s.slice(0, i) + reemplazo + s.slice(fin);
      i += reemplazo.length;
    }
    return s.replace(/\\(?:times|cdot)/g, ' por ')
      .replace(/\\(?:pi)/g, ' pi ').replace(/\\(?:theta)/g, ' teta ')
      .replace(/\\(?:alpha)/g, ' alfa ').replace(/\\(?:beta)/g, ' beta ')
      .replace(/\\(?:gamma)/g, ' gamma ')
      .replace(/\\(?:leq|le)/g, ' menor o igual que ')
      .replace(/\\(?:geq|ge)/g, ' mayor o igual que ')
      .replace(/\\(?:perp)/g, ' perpendicular a ')
      .replace(/\\(?:parallel)/g, ' paralelo a ')
      .replace(/\\(?:neq|ne)/g, ' distinto de ')
      .replace(/\\(?:sin)/g, ' seno ')
      .replace(/\\(?:cos)/g, ' coseno ')
      .replace(/\\(?:tan)/g, ' tangente ')
      .replace(/\\(?:text|mathrm)\{([^{}]+)\}/g, '$1')
      .replace(/[{}]/g, ' ');
  }
  function leer(texto) {
    var s = latex(plano(texto));
    s = s.replace(/(\d+(?:[.,]\d+)?)\s*%/g, '$1 por ciento');
    s = s.replace(/\bkm\/h\b/gi, 'kilómetros por hora')
      .replace(/cm³/g, 'centímetros cúbicos').replace(/cm²/g, 'centímetros cuadrados')
      .replace(/mm²/g, 'milímetros cuadrados')
      .replace(/m³/g, 'metros cúbicos').replace(/m²/g, 'metros cuadrados')
      .replace(/\bcm\b/g, 'centímetros').replace(/\bmm\b/g, 'milímetros')
      .replace(/\bkg\b/g, 'kilogramos');
    // Separar nombres de vértices (AC₁ -> A C₁), sin fragmentar números (12 -> 12).
    s = s.replace(/\b([A-Z]{2,})(?=[₀₁₂₃₄₅₆₇₈₉]|[^a-zA-Z]|$)/g, function (w) {
      return /^(UNI|TTS|SVG|HTML|WebGL)$/.test(w) ? w : w.split('').join(' ');
    });
    s = s.replace(/([₀₁₂₃₄₅₆₇₈₉])(?=[A-Z])/g, '$1 ');
    s = s.replace(/([A-Za-z])([₀₁₂₃₄₅₆₇₈₉]+)/g, function(_, letra, sub) {
      var digitos = '₀₁₂₃₄₅₆₇₈₉';
      return letra + ' sub ' + sub.split('').map(function(c) { return digitos.indexOf(c); }).join('');
    });
    s = s.replace(/∛/g, ' raíz cúbica de ')
      .replace(/√\s*\(([^()]+)\)/g, ' raíz cuadrada de ($1) ')
      .replace(/√/g, ' raíz cuadrada de ');
    s = s.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, function(p) {
      var orden = '⁰¹²³⁴⁵⁶⁷⁸⁹', n = p.split('').map(function(c){return orden.indexOf(c)}).join('');
      return n === '2' ? ' al cuadrado ' : n === '3' ? ' al cubo ' : ' elevado a ' + n + ' ';
    });
    s = s.replace(/\^\s*\{?\s*(\d+)\s*\}?/g, function(_, n) {
      return n === '2' ? ' al cuadrado ' : n === '3' ? ' al cubo ' : ' elevado a ' + n + ' ';
    });
    // Un número completo se envía entero al sintetizador, nunca como dígitos sueltos.
    s = s.replace(/\b([a-zA-Z])\s+al (cuadrado|cubo)\b/g, function(_, letra, pot) {
      var nombres = {a:'a',b:'be',c:'ce',d:'de',v:'uve',x:'equis',y:'ye',z:'zeta',r:'erre',h:'hache',n:'ene'};
      return (nombres[letra.toLowerCase()] || letra) + ' al ' + pot;
    });
    s = s.replace(/(^|[\s(=,+\-])([bBvV])(?=\s|$|[=,+\-):])/g, function(_,sep,letra) {
      return sep + (letra.toLowerCase()==='b' ? 'be' : 'uve');
    });
    s = s.replace(/(\d)([a-zA-Z])\b/g, '$1 $2')
      .replace(/(^|[=+\s])-(?=\d)/g, '$1 menos ')
      .replace(/(\d)\s*x\b/gi, '$1 equis');
    s = s.replace(/θ/g,' teta ').replace(/α/g,' alfa ').replace(/β/g,' beta ')
      .replace(/γ/g,' gamma ').replace(/φ/g,' fi ').replace(/π/g,' pi ')
      .replace(/∠/g,' ángulo ').replace(/°/g,' grados ')
      .replace(/≤/g,' menor o igual que ').replace(/≥/g,' mayor o igual que ')
      .replace(/≠/g,' distinto de ').replace(/[⟂⊥]/g,' perpendicular a ')
      .replace(/∥/g,' paralelo a ').replace(/≈/g,' aproximadamente igual a ')
      .replace(/→/g,' implica ').replace(/\+/g,' más ')
      .replace(/=/g,' igual a ').replace(/[·×]/g,' por ')
      .replace(/÷/g,' dividido entre ')
      .replace(/\s*\/\s*/g,' dividido entre ')
      .replace(/−/g,' menos ').replace(/\s-\s/g,' menos ')
      .replace(/\s+/g,' ').trim();
    return s;
  }
  function palabras(texto) {
    var s = String(texto||''), out=[], match, re=/\S+/g;
    while((match=re.exec(s)))out.push({inicio:match.index,fin:match.index+match[0].length,texto:match[0]});
    return out;
  }
  function palabraEn(texto, indice) {
    var tokens = palabras(texto), objetivo = Math.max(0, Number(indice)||0);
    for(var i=0;i<tokens.length;i++) if(objetivo<tokens[i].fin)return i;
    return Math.max(0,tokens.length-1);
  }
  global.VozMatematica={leer:leer,plano:plano,latex:latex,palabras:palabras,palabraEn:palabraEn};
})(typeof window!=='undefined'?window:globalThis);
