/* KaTeX local: LaTeX explícito y compatibilidad con las fórmulas Unicode del curso. */
(function (global) {
  'use strict';
  function latex(s) {
    s = String(s).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/½/g, '(1/2)').replace(/⅓/g, '(1/3)').replace(/¼/g, '(1/4)');
    // Un analizador de átomos conserva el alcance de raíces y fracciones.
    var i = 0;
    function sequence(end) {
      var parts = [];
      while (i < s.length && s[i] !== end) {
        if (/\s/.test(s[i])) { i++; continue; }
        if (s[i] === '/') {
          i++; var factors = [];
          while (parts.length && !/^(=|\+|-|\\approx|\\le|\\ge|,|:)$/.test(parts[parts.length - 1])) factors.unshift(parts.pop());
          var numerator = factors.join(' ') || '1';
          parts.push('\\frac{' + numerator + '}{' + atom() + '}');
        } else parts.push(atom());
      }
      if (end && s[i] === end) i++;
      return parts.join(' ');
    }
    function atom() {
      while (/\s/.test(s[i] || '') && i < s.length) i++;
      var c = s[i++], value;
      if (!c) return '';
      if (c === '(' || c === '[') value = '\\left' + c + sequence(c === '(' ? ')' : ']') + '\\right' + (c === '(' ? ')' : ']');
      else if (c === '√' || c === '∛') {
        var inside;
        if (s[i] === '(') { i++; inside = sequence(')'); }
        else inside = atom();
        value = '\\sqrt' + (c === '∛' ? '[3]' : '') + '{' + inside + '}';
      } else if (/\d/.test(c)) {
        value = c; while (i < s.length && /[\d.,]/.test(s[i])) value += s[i++];
      } else if (/[a-záéíóúñ]/i.test(c)) {
        value = c; while (i < s.length && /[a-záéíóúñ]/i.test(s[i])) value += s[i++];
        if (/^(sin|cos|tan|sen|arccos|arcsin)$/.test(value)) value = '\\' + (value === 'sen' ? 'sin' : value);
        else if (value.length > 1 && !/^[A-Z]+$/.test(value)) value = '\\text{' + value + '}\\,';
      } else value = ({'·':'\\cdot','×':'\\times','÷':'\\div','−':'-','≈':'\\approx','π':'\\pi','θ':'\\theta','α':'\\alpha','β':'\\beta','γ':'\\gamma','φ':'\\varphi','∥':'\\parallel','⊥':'\\perp','≤':'\\le','≥':'\\ge','≠':'\\ne','°':'{}^{\\circ}','∞':'\\infty','%':'\\%','{':'\\{','}':'\\}'}[c] || c);
      var sup = '', sub = '', digits = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
      while (/[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(s[i] || '')) sup += digits[s[i++]];
      while (/[₀₁₂₃₄₅₆₇₈₉]/.test(s[i] || '')) sub += digits[s[i++]];
      if (s[i] === '\u0304') { i++; value = '\\overline{' + value + '}'; }
      while (s[i] === '^' || s[i] === '_') {
        var marker = s[i++];
        var argument;
        if (s[i] === '(') { i++; argument = sequence(')'); }
        else argument = atom();
        value += marker + '{' + argument + '}';
      }
      if (sup) value += '^{' + sup + '}';
      if (sub) value += '_{' + sub + '}';
      return value;
    }
    return sequence();
  }
  function render(root) {
    if (!global.katex) return;
    root.querySelectorAll('.m, .fml dt, .cuenta, [data-latex]').forEach(function (el) {
      if (el.closest('.katex') || el.querySelector('.katex') || el.dataset.mathRendered === el.textContent) return;
      if (!el.hasAttribute('data-latex') && !/[=√∛²³₁₂₃πθ·×÷≈°/<>]/.test(el.textContent)) return;
      var tex = el.getAttribute('data-latex') || latex(el.textContent);
      try {
        global.katex.render(tex, el, {throwOnError:true, trust:false, output:'htmlAndMathml', strict:'ignore'});
        el.dataset.mathRendered = el.textContent;
      } catch (error) { el.dataset.mathError = error.message; }
    });
    if (global.renderMathInElement) global.renderMathInElement(root, {
      delimiters:[{left:'$$',right:'$$',display:true},{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],
      throwOnError:false, trust:false, ignoredClasses:['katex','m','cuenta'],
      ignoredTags:['script','noscript','style','textarea','pre','code','option','svg']
    });
  }
  function iniciar() {
    render(document.body);
    var pending = false;
    new MutationObserver(function (changes) {
      if (pending || !changes.some(function (c) { return !c.target.closest || !c.target.closest('.katex'); })) return;
      pending = true;
      requestAnimationFrame(function () { render(document.body); pending = false; });
    }).observe(document.body, {childList:true, subtree:true, characterData:true});
  }
  global.Matematicas = {latex:latex, render:render};
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
  }
})(typeof window !== 'undefined' ? window : globalThis);
