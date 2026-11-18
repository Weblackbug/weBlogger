/* ==========================================================================
   weBlogger - formato: la cinta de texto, el texto artistico y las imagenes.
   ========================================================================== */
(function () {
  'use strict';

  var E = WB.ed;
  var frame = document.getElementById('pageFrame');
  var ribbon = document.getElementById('ribbon');

  function doc() { return E.idoc; }

  /* ======================================================= seleccion ===== */
  // Los desplegables de la cinta roban el foco: se recuerda la ultima
  // seleccion de texto y se repone antes de aplicar nada.

  var saved = null;

  function hostAt(node) {
    if (!node) return null;
    if (node.nodeType !== 1) node = node.parentElement;
    return node ? node.closest('[contenteditable="true"]') : null;
  }

  /** La seleccion recordada, solo si sigue viva y dentro del bloque que el
      usuario tiene seleccionado: al pasar a otro bloque deja de valer. */
  function live() {
    var d = doc();
    if (!d || !saved || !d.body.contains(saved.commonAncestorContainer)) return null;
    if (!E.sel || !E.sel.contains(saved.commonAncestorContainer)) return null;
    return saved;
  }

  function hasRange() {
    var r = live();
    return !!(r && !r.collapsed);
  }

  function restore() {
    var d = doc();
    var r = live();
    if (!r) return false;
    frame.contentWindow.focus();
    var s = d.getSelection();
    s.removeAllRanges();
    s.addRange(r);
    return true;
  }

  /** Bloque de texto sobre el que actuan alinear, interlineado, etc. */
  function textTarget() {
    var d = doc();
    if (!d) return null;
    var r = live();
    if (r) {
      var h = hostAt(r.commonAncestorContainer);
      if (h) return h;
    }
    return E.sel;
  }

  var F = WB.fmt = {};

  F.onSelection = function () {
    var d = doc();
    if (!d) return;
    var s = d.getSelection();
    if (s.rangeCount && d.body.contains(s.anchorNode) && hostAt(s.anchorNode)) saved = s.getRangeAt(0).cloneRange();
    syncSoon();
  };

  F.reset = function () { saved = null; sync(); };

  /**
   * ¿Se puede dar formato ahora? Solo con el cursor o una seleccion dentro de
   * un texto editable, o con un bloque de texto seleccionado.
   */
  F.canFormat = function () {
    if (!doc()) return false;
    if (live()) return true;
    var s = E.sel;
    return !!(s && (s.matches('[contenteditable="true"]') || s.querySelector('[contenteditable="true"]')));
  };

  /* ====================================================== ordenes ======== */

  /** Orden clasica del navegador sobre el texto seleccionado. */
  F.cmd = function (name, value) {
    var d = doc();
    if (!d) return;
    if (!hasRange()) {
      // sin texto marcado, negrita y compañia van al bloque entero
      var el = textTarget();
      if (!el) return;
      var st = el.style, cs = d.defaultView.getComputedStyle(el);
      if (name === 'bold') st.fontWeight = parseInt(cs.fontWeight, 10) >= 600 ? '400' : '700';
      else if (name === 'italic') st.fontStyle = cs.fontStyle === 'italic' ? 'normal' : 'italic';
      else if (name === 'underline') st.textDecoration = /underline/.test(cs.textDecorationLine) ? 'none' : 'underline';
      else if (name === 'strikeThrough') st.textDecoration = /line-through/.test(cs.textDecorationLine) ? 'none' : 'line-through';
      else if (name === 'foreColor') st.color = value;
      else if (name === 'hiliteColor') st.backgroundColor = value;
      else if (name === 'removeFormat') {
        el.removeAttribute('style');
        el.removeAttribute('data-wb-tf');
      } else { restore(); d.execCommand(name, false, value); }
      E.changed();
      WB.panels.renderProps();
      return;
    }
    restore();
    d.execCommand('styleWithCSS', false, true);
    d.execCommand(name, false, value === undefined ? null : value);
    E.changed();
    sync();
  };

  /**
   * Estilo en linea cualquiera. Con texto marcado lo envuelve en un <span>;
   * sin el, se aplica al bloque seleccionado.
   */
  F.span = function (style) {
    var d = doc();
    if (!d) return;
    if (style.fontFamily) {
      var m = /'([^']+)'/.exec(style.fontFamily);
      if (m) E.ensureFonts([m[1]]);
    }
    if (!hasRange()) {
      var el = textTarget();
      if (!el) { WB.ui.status('selecciona antes un texto o un bloque'); return; }
      Object.assign(el.style, style);
      E.changed();
      WB.panels.renderProps();
      return;
    }
    restore();
    // Se envuelve a mano cada trozo de texto de la seleccion. Las ordenes del
    // navegador (fontSize, fontName) borran por el camino el tamaño o la
    // fuente que el texto ya tuviera; asi no se pierde nada.
    var range = d.getSelection().getRangeAt(0);
    var top = range.commonAncestorContainer;
    if (top.nodeType !== 1) top = top.parentNode;
    var walker = d.createTreeWalker(top, NodeFilter.SHOW_TEXT);
    var texts = [], node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.length && range.intersectsNode(node) && hostAt(node)) texts.push(node);
    }
    var sc = range.startContainer, so = range.startOffset, ec = range.endContainer, eo = range.endOffset;
    var spans = [];
    texts.forEach(function (t) {
      var a = t === sc ? so : 0;
      var b = t === ec ? eo : t.nodeValue.length;
      if (a >= b) return;
      if (b < t.nodeValue.length) t.splitText(b);
      if (a > 0) t = t.splitText(a);
      var par = t.parentNode, sp;
      var reuse = par.tagName === 'SPAN' && par.childNodes.length === 1 && !par.className &&
        !par.hasAttribute('contenteditable') && !par.hasAttribute('data-i18n');
      if (reuse) sp = par;
      else {
        sp = d.createElement('span');
        par.insertBefore(sp, t);
        sp.appendChild(t);
      }
      Object.assign(sp.style, style);
      spans.push(sp);
    });
    if (spans.length) {
      var r = d.createRange();
      r.setStartBefore(spans[0]);
      r.setEndAfter(spans[spans.length - 1]);
      var s = d.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      saved = r.cloneRange();
    }
    E.changed();
    sync();
  };

  F.block = function (style) {
    var el = textTarget();
    if (!el) { WB.ui.status('selecciona antes un texto'); return; }
    Object.assign(el.style, style);
    E.changed();
    sync();
    WB.panels.renderProps();
  };

  /** Efecto de texto (sombra, 3D, neon...) sobre seleccion o bloque. */
  F.effect = function (id) {
    var fx = WB.TEXT_FX.filter(function (f) { return f.id === id; })[0];
    if (!fx) return;
    var clear = {};
    WB.TEXT_FX_PROPS.forEach(function (p) { clear[p] = ''; });
    if (!hasRange()) {
      var el = textTarget();
      if (!el) return;
      Object.assign(el.style, clear, fx.css);
      E.changed();
      WB.panels.renderProps();
    } else {
      // primero se limpia el efecto anterior: si no, se acumulan
      F.span(Object.assign(clear, fx.css));
    }
  };

  /** Cambia la etiqueta de un bloque de texto conservando su contenido. */
  F.retag = function (el, tag, className) {
    var d = doc();
    if (!el || !d) return null;
    var n = d.createElement(tag);
    Array.prototype.forEach.call(el.attributes, function (a) {
      if (a.name !== 'class') n.setAttribute(a.name, a.value);
    });
    if (className) n.className = className;
    while (el.firstChild) n.appendChild(el.firstChild);
    el.replaceWith(n);
    E.commit();
    E.select(n, { force: true });
    return n;
  };

  var PARA = {
    p: ['p', ''], dropcap: ['p', 'lead-dropcap'], lead: ['p', 'wb-lead'], note: ['p', 'wb-note'],
    pull: ['p', 'wb-pull'], h2: ['h2', ''], h3: ['h3', ''], h4: ['h4', '']
  };

  F.paragraph = function (kind, el) {
    el = el || textTarget();
    if (el && !/^(P|H2|H3|H4)$/.test(el.tagName)) el = E.sel;
    // solo parrafos y titulos sueltos: los que forman parte de un bloque
    // (titular, modal, cabecera de diario) llevan una clase que no se puede perder
    if (!el || !/^(P|H2|H3|H4)$/.test(el.tagName) || !el.parentElement || !el.parentElement.matches(E.SLOT) || /(^|\s)np-/.test(el.className)) {
      WB.ui.status('eso se aplica a párrafos y títulos del artículo');
      return;
    }
    var def = PARA[kind];
    if (def) F.retag(el, def[0], def[1]);
  };

  F.list = function (tag) {
    var d = doc();
    var el = E.sel;
    if (!d) return;
    if (el && el.tagName === 'LI') el = el.parentElement;
    if (el && el.closest('.toc-list, .nav-links, .site-header, .site-footer, .np-ranking')) {
      WB.ui.status('las listas se ponen en el cuerpo del artículo');
      return;
    }
    if (el && /^(UL|OL)$/.test(el.tagName)) {
      if (el.tagName.toLowerCase() === tag) {
        if (!el.parentElement.matches(E.SLOT)) return;
        // volver a parrafos
        var last = el;
        Array.prototype.slice.call(el.children).forEach(function (li) {
          var p = d.createElement('p');
          p.innerHTML = li.innerHTML;
          last.after(p);
          last = p;
        });
        el.remove();
        E.commit('lista deshecha');
        E.select(last);
      } else {
        F.retag(el, tag, el.className);
      }
      return;
    }
    if (el && el.tagName === 'P' && el.parentElement.matches(E.SLOT)) {
      var list = d.createElement(tag);
      var li = d.createElement('li');
      li.innerHTML = el.innerHTML;
      list.appendChild(li);
      el.replaceWith(list);
      E.commit('lista creada');
      E.select(list);
      return;
    }
    E.insert(tag);
  };

  F.link = function () {
    var d = doc();
    if (!d) return;
    var rng = live();
    var a = rng ? hostAt(rng.commonAncestorContainer) : null;
    var node = rng ? rng.commonAncestorContainer : null;
    if (node && node.nodeType !== 1) node = node.parentElement;
    var cur = node ? node.closest('a') : null;
    if (!cur && a && a.tagName === 'A') cur = a;
    if (!cur && !hasRange()) { WB.ui.status('marca antes el texto que será el enlace'); return; }
    WB.dlg.prompt('Enlace', 'Dirección a la que lleva (https://… o #seccion). Déjalo vacío para quitarlo.',
      cur ? cur.getAttribute('href') || '' : 'https://').then(function (url) {
      if (url === null) return;
      if (cur) {
        if (url.trim()) cur.setAttribute('href', url.trim());
        else if (cur.matches('[contenteditable]')) cur.setAttribute('href', '#');
        else cur.replaceWith.apply(cur, Array.prototype.slice.call(cur.childNodes));
      } else if (url.trim()) {
        restore();
        d.execCommand('createLink', false, url.trim());
      }
      E.changed();
    });
  };

  F.symbols = function () {
    var chars = '« » “ ” ‘ ’ — – … · • © ® ™ € £ ¥ º ª ¿ ¡ ½ ¼ ¾ × ÷ ± ≈ ≠ ≤ ≥ → ← ↑ ↓ ★ ☆ ✦ ❦ ✓ ✗ § ¶ † ‰ ° № ♥ ♪ ☀ ☂ ⚑ ✉ ☎ 📍 🗓️ ✍️ 💡 ⚠️ 🤝 🏗️ 🌾 📷'.split(' ');
    var grid = document.createElement('div');
    grid.className = 'sym-grid';
    chars.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-ghost';
      b.textContent = c;
      b.addEventListener('click', function () {
        if (restore()) { doc().execCommand('insertText', false, c); E.changed(); }
        else WB.ui.status('coloca antes el cursor en un texto');
      });
      grid.appendChild(b);
    });
    WB.dlg.show({ title: 'Símbolos', message: 'Pulsa un símbolo para escribirlo donde está el cursor.', body: grid, buttons: [{ id: 'ok', label: 'Cerrar', isDefault: true, isCancel: true }] });
  };

  /* ====================================================== la cinta ======= */

  var selFont = document.getElementById('fmtFont');
  var inSize = document.getElementById('fmtSize');
  var selPara = document.getElementById('fmtPara');
  var selLine = document.getElementById('fmtLine');
  var selFx = document.getElementById('fmtFx');
  var inColor = document.getElementById('fmtColor');
  var inHilite = document.getElementById('fmtHilite');

  function opt(sel, value, label) {
    var o = document.createElement('option');
    o.value = value;
    o.textContent = label;
    sel.appendChild(o);
    return o;
  }

  opt(selFont, '', 'Fuente de la página');
  var CATS = { sans: 'Palo seco', serif: 'Con remate', display: 'Titulares', script: 'Manuscritas', mono: 'Ancho fijo' };
  Object.keys(CATS).forEach(function (c) {
    var g = document.createElement('optgroup');
    g.label = CATS[c];
    WB.FONTS.forEach(function (f) { if (f.cat === c) opt(g, f.name, f.name); });
    selFont.appendChild(g);
  });
  WB.TEXT_FX.forEach(function (f) { opt(selFx, f.id, f.id === 'none' ? 'Efecto…' : f.name); });

  selFont.addEventListener('change', function () {
    F.span({ fontFamily: selFont.value ? WB.fontStack(selFont.value) : '' });
  });
  selPara.addEventListener('change', function () { F.paragraph(selPara.value); });
  selLine.addEventListener('change', function () { F.block({ lineHeight: selLine.value }); });
  selFx.addEventListener('change', function () { F.effect(selFx.value); selFx.value = 'none'; });
  inSize.addEventListener('change', function () {
    var n = parseFloat(inSize.value);
    F.span({ fontSize: n > 0 ? n + 'px' : '' });
  });
  inColor.addEventListener('input', function () { F.cmd('foreColor', inColor.value); });
  inHilite.addEventListener('input', function () { F.cmd('hiliteColor', inHilite.value); });

  function stepSize(delta) {
    var n = (parseFloat(inSize.value) || 16) + delta;
    inSize.value = Math.max(8, Math.min(200, n));
    F.span({ fontSize: inSize.value + 'px' });
  }

  var HANDLERS = {
    bold: function () { F.cmd('bold'); },
    italic: function () { F.cmd('italic'); },
    underline: function () { F.cmd('underline'); },
    strike: function () { F.cmd('strikeThrough'); },
    sup: function () { F.cmd('superscript'); },
    sub: function () { F.cmd('subscript'); },
    left: function () { F.block({ textAlign: 'left' }); },
    center: function () { F.block({ textAlign: 'center' }); },
    right: function () { F.block({ textAlign: 'right' }); },
    justify: function () { F.block({ textAlign: 'justify' }); },
    ul: function () { F.list('ul'); },
    ol: function () { F.list('ol'); },
    link: F.link,
    upper: function () {
      var t = textTarget();
      var on = t && doc().defaultView.getComputedStyle(t).textTransform === 'uppercase';
      F.span({ textTransform: on ? 'none' : 'uppercase' });
    },
    smallcaps: function () { F.span({ fontVariant: 'small-caps' }); },
    bigger: function () { stepSize(2); },
    smaller: function () { stepSize(-2); },
    clear: function () { F.cmd('removeFormat'); },
    symbols: F.symbols,
    nocolor: function () { F.span({ color: '', backgroundColor: '' }); },
    art: function () { WB.art.fromBlock(); }
  };

  // mousedown y no click: asi el texto del articulo no pierde la seleccion
  ribbon.addEventListener('mousedown', function (ev) {
    var b = ev.target.closest('[data-fmt]');
    if (!b) return;
    ev.preventDefault();
    if (HANDLERS[b.dataset.fmt]) HANDLERS[b.dataset.fmt]();
  });

  var syncRaf = 0, ribbonOn = null;
  function syncSoon() {
    if (syncRaf) return;
    syncRaf = requestAnimationFrame(function () { syncRaf = 0; sync(); });
  }

  /** La cinta refleja el formato de donde esta el cursor. */
  function sync() {
    var d = doc();
    var el = textTarget();
    var on = F.canFormat();
    ribbon.classList.toggle('is-off', !on);
    if (ribbonOn !== on) {
      ribbonOn = on;
      ribbon.querySelectorAll('button, select').forEach(function (c) { c.disabled = !on; });
      ribbon.setAttribute('aria-disabled', on ? 'false' : 'true');
      ribbon.title = on ? '' : 'Haz clic en un texto del artículo para darle formato';
    }
    if (WB.avail) WB.avail.refresh();
    if (!on || !el) return;
    var node = live() ? saved.startContainer : el;
    if (node.nodeType !== 1) node = node.parentElement;
    var cs = d.defaultView.getComputedStyle(node || el);

    var states = {
      bold: parseInt(cs.fontWeight, 10) >= 600,
      italic: cs.fontStyle === 'italic',
      underline: /underline/.test(cs.textDecorationLine),
      strike: /line-through/.test(cs.textDecorationLine),
      left: cs.textAlign === 'left' || cs.textAlign === 'start',
      center: cs.textAlign === 'center',
      right: cs.textAlign === 'right' || cs.textAlign === 'end',
      justify: cs.textAlign === 'justify',
      upper: cs.textTransform === 'uppercase'
    };
    ribbon.querySelectorAll('[data-fmt]').forEach(function (b) {
      if (b.dataset.fmt in states) b.classList.toggle('is-active', states[b.dataset.fmt]);
    });

    if (document.activeElement !== inSize) inSize.value = Math.round(parseFloat(cs.fontSize));
    var fam = (/^\s*["']?([^"',]+)/.exec(cs.fontFamily) || [])[1] || '';
    if (document.activeElement !== selFont) selFont.value = WB.fontByName(fam) ? fam : '';
    inColor.value = WB.doc.toHex(cs.color, '#000000');

    var block = el.closest ? el : null;
    var para = '';
    if (block) {
      if (block.tagName === 'P') para = block.classList.contains('lead-dropcap') ? 'dropcap' : block.classList.contains('wb-lead') ? 'lead' : block.classList.contains('wb-note') ? 'note' : block.classList.contains('wb-pull') ? 'pull' : 'p';
      else if (/^H[234]$/.test(block.tagName)) para = block.tagName.toLowerCase();
    }
    selPara.value = para;
  }
  F.sync = sync;

  /* ================================================ texto artistico ====== */

  var A = WB.art = {};
  // El lienzo de medir tiene que ser del documento del articulo: es ese
  // documento el que tiene cargadas las fuentes, no la ventana del editor.
  var measurer = null, measurerDoc = null;
  function measure(d) {
    if (measurerDoc !== d) { measurerDoc = d; measurer = d.createElement('canvas').getContext('2d'); }
    return measurer;
  }

  A.get = function (el) {
    try { return JSON.parse(el.getAttribute('data-art')) || {}; } catch (e) { return {}; }
  };

  A.put = function (el, v) { el.setAttribute('data-art', JSON.stringify(v)); };

  A.set = function (el, patch) {
    var v = Object.assign(A.get(el), patch);
    A.put(el, v);
    if (patch.font) E.ensureFonts([patch.font]);
    A.render(el);
    E.changed();
  };

  function num(v, def) { v = parseFloat(v); return isFinite(v) ? v : def; }

  /**
   * Dibuja el texto como SVG sobre un trazado: recto, en arco, en onda o en
   * circulo. El volumen son copias desplazadas detras del texto, y la
   * inclinacion 3D una transformacion CSS con perspectiva.
   */
  A.render = function (el) {
    var v = A.get(el);
    var d = el.ownerDocument;
    var text = v.text || ' ';
    var size = num(v.size, 80), weight = num(v.weight, 700), sp = num(v.spacing, 0);
    var fam = WB.fontStack(v.font || WB.doc.s.fontDisplay);
    var uid = v.uid || (v.uid = WB.uid());

    measure(d).font = weight + ' ' + size + 'px ' + fam;
    var W = Math.max(20, measurer.measureText(text).width + sp * text.length + size * 0.15);
    var curve = num(v.curve, 0) / 100;
    var depth = Math.round(num(v.depth, 0));
    var sw = num(v.strokeW, 0), glow = num(v.glow, 0);
    var ang = num(v.depthAngle, 45) * Math.PI / 180;
    var dx = Math.cos(ang), dy = Math.sin(ang);
    var pad = size * 0.3 + sw + glow * 1.5 + 4;

    var path, x0, y0, x1, y1;   // caja del dibujo
    var up = size * 0.95, down = size * 0.32;
    if (v.shape === 'arcUp' || v.shape === 'arcDown') {
      var h = curve * W * 0.45 * (v.shape === 'arcUp' ? -1 : 1);
      path = 'M0 0 Q' + (W / 2) + ' ' + (2 * h) + ' ' + W + ' 0';
      x0 = 0; x1 = W;
      y0 = Math.min(0, h) - up; y1 = Math.max(0, h) + down;
      // en un arco las letras de los extremos se inclinan y sobresalen
      var tilt = Math.abs(h) / W * size * 2.2;
      x0 -= tilt; x1 += tilt; y1 += tilt * 0.5;
    } else if (v.shape === 'wave') {
      var a = curve * size * 1.1;
      path = 'M0 0 Q' + (W / 4) + ' ' + (-2 * a) + ' ' + (W / 2) + ' 0 T' + W + ' 0';
      x0 = 0; x1 = W; y0 = -a - up; y1 = a + down + size * 0.2;
    } else if (v.shape === 'circle') {
      var r = Math.max(size, W / (2 * Math.PI));
      path = 'M0 ' + r + ' A' + r + ' ' + r + ' 0 1 1 0 ' + (-r) + ' A' + r + ' ' + r + ' 0 1 1 0 ' + r;
      x0 = -r - up; x1 = r + up; y0 = -r - up; y1 = r + up;
    } else {
      path = 'M0 0 H' + W;
      x0 = 0; x1 = W; y0 = -up; y1 = down;
    }

    x0 -= pad; y0 -= pad; x1 += pad + Math.max(0, dx * depth); y1 += pad + Math.max(0, dy * depth);
    if (dx < 0) x0 += dx * depth;
    if (dy < 0) y0 += dy * depth;
    var vw = x1 - x0, vh = y1 - y0;

    var e = WB.esc;
    var fill = v.fill || 'var(--accent)';
    var paint = v.fill2 ? 'url(#g' + uid + ')' : fill;
    var tp = '<textPath href="#p' + uid + '" startOffset="50%">' + e(text) + '</textPath>';
    var layers = '';
    for (var i = depth; i >= 1; i--) {
      layers += '<text transform="translate(' + (dx * i).toFixed(2) + ' ' + (dy * i).toFixed(2) + ')" style="fill:' + e(v.depthColor || '#000') + '">' + tp + '</text>';
    }
    var main = '<text style="fill:' + e(paint) + ';' +
      (sw > 0 && v.stroke ? 'stroke:' + e(v.stroke) + ';stroke-width:' + sw + 'px;paint-order:stroke;stroke-linejoin:round;' : '') + '">' + tp + '</text>';

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + [x0, y0, vw, vh].map(function (n) { return n.toFixed(1); }).join(' ') + '"' +
      ' width="' + Math.round(vw) + '" height="' + Math.round(vh) + '" role="img" aria-label="' + e(text) + '"' +
      (glow > 0 ? ' style="filter:drop-shadow(0 0 ' + glow + 'px ' + e(v.glowColor || '#000') + ')"' : '') + '>' +
      '<defs><path id="p' + uid + '" d="' + path + '"/>' +
      (v.fill2 ? '<linearGradient id="g' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:' + e(fill) + '"/><stop offset="1" style="stop-color:' + e(v.fill2) + '"/></linearGradient>' : '') +
      '</defs>' +
      '<g text-anchor="middle" style="font-family:' + e(fam) + ';font-size:' + size + 'px;font-weight:' + weight + ';letter-spacing:' + sp + 'px">' +
      layers + main + '</g></svg>';

    var rx = num(v.rx, 0), ry = num(v.ry, 0), rz = num(v.rz, 0);
    var tf = '';
    if (rx || ry) tf += 'perspective(' + num(v.persp, 800) + 'px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) ';
    if (rz) tf += 'rotate(' + rz + 'deg)';
    // la inclinacion va en un envoltorio: asi el bloque conserva su caja y la
    // animacion (que mueve el svg) no pisa el giro
    el.innerHTML = '<span class="wb-art-tilt"' + (tf ? ' style="transform:' + tf.trim() + '"' : '') + '>' + svg + '</span>';
    if (v.anim) el.setAttribute('data-anim', v.anim); else el.removeAttribute('data-anim');
    A.put(el, v);
  };

  A.renderAll = function (d, force) {
    d.querySelectorAll('.wb-art').forEach(function (el) {
      if (force || !el.firstElementChild) A.render(el);
    });
  };

  /** Convierte un titulo o parrafo en texto artistico (y deja editarlo). */
  A.fromBlock = function () {
    var el = E.sel;
    var d = doc();
    if (!d) return;
    if (el && el.classList.contains('wb-art')) { WB.ui.setDockTab('props'); return; }
    if (!el || !/^(P|H2|H3|H4)$/.test(el.tagName) || !el.parentElement.matches(E.SLOT)) {
      E.insert('art');
      WB.ui.setDockTab('props');
      return;
    }
    var v = Object.assign({ uid: WB.uid() }, WB.ART_PRESETS[0].v, {
      text: el.textContent.trim() || 'Texto artístico',
      size: Math.min(110, Math.max(40, Math.round(parseFloat(d.defaultView.getComputedStyle(el).fontSize) * 1.6)))
    });
    var art = d.createElement('div');
    art.className = 'wb-art';
    A.put(art, v);
    el.replaceWith(art);
    E.commit('convertido en texto artístico');
    E.select(art, { force: true });
    WB.ui.setDockTab('props');
  };

  /* ======================================================= imagenes ====== */

  var I = WB.img = {};
  var picker = document.getElementById('filePicker');
  var pending = null;

  /** Imagen principal de un bloque (figura, foto de galeria o la propia img). */
  I.of = function (el) {
    if (!el) return null;
    if (el.tagName === 'IMG') return el;
    var t = WB.typeOf(el);
    return t && t.image ? el.querySelector('img') : null;
  };

  I.setSrc = function (img, url) {
    if (!img) return;
    img.setAttribute('src', url);
    var box = img.closest('[data-lightbox-src]');
    if (box) {
      // en Wikimedia la version ampliada es la misma imagen a mas ancho
      box.setAttribute('data-lightbox-src', url.replace(/([?&]width=)\d+/, '$11200'));
    }
    E.changed();
    WB.panels.renderProps();
  };

  I.pick = function (img) {
    if (!img) return;
    pending = img;
    picker.value = '';
    picker.click();
  };

  picker.addEventListener('change', function () {
    var file = picker.files && picker.files[0];
    if (!file || !pending) return;
    if (!/^image\//.test(file.type)) { WB.ui.fail('ese archivo no es una imagen'); return; }
    I.setSrc(pending, WB.doc.addAsset(file, file.name));
    WB.ui.status('imagen cambiada: ' + file.name);
    pending = null;
  });

  I.askUrl = function (img) {
    var cur = img.getAttribute('src') || '';
    WB.dlg.prompt('Imagen desde internet', 'Pega la dirección de la imagen (https://…).',
      /^https?:/.test(cur) ? cur : 'https://').then(function (url) {
      if (url && /^https?:\/\//.test(url.trim())) I.setSrc(img, url.trim());
      else if (url) WB.ui.fail('la dirección tiene que empezar por https://');
    });
  };

  /* Los filtros y el encuadre se guardan como datos y se aplican como CSS:
     la imagen original no se toca nunca. */
  I.FX_DEFAULT = { bright: 100, contrast: 100, sat: 100, gray: 0, sepia: 0, blur: 0, hue: 0, zoom: 100, flip: false };
  I.FX_PRESETS = [
    ['Original', {}],
    ['Blanco y negro', { gray: 100, contrast: 110 }],
    ['Sepia', { sepia: 80, sat: 85 }],
    ['Vívido', { sat: 150, contrast: 112 }],
    ['Antiguo', { sepia: 45, contrast: 88, bright: 108, sat: 75 }],
    ['Frío', { hue: 190, sat: 80, sepia: 20 }],
    ['Cálido', { sepia: 30, sat: 125, bright: 104 }],
    ['Dramático', { contrast: 140, bright: 90, sat: 85 }]
  ];

  I.fx = function (img) {
    var v = {};
    try { v = JSON.parse(img.getAttribute('data-wb-fx')) || {}; } catch (e) {}
    return Object.assign({}, I.FX_DEFAULT, v);
  };

  I.setFx = function (img, patch, replace) {
    var v = Object.assign(replace ? Object.assign({}, I.FX_DEFAULT) : I.fx(img), patch);
    var f = '';
    if (v.bright !== 100) f += 'brightness(' + v.bright + '%) ';
    if (v.contrast !== 100) f += 'contrast(' + v.contrast + '%) ';
    if (v.sat !== 100) f += 'saturate(' + v.sat + '%) ';
    if (v.gray) f += 'grayscale(' + v.gray + '%) ';
    if (v.sepia) f += 'sepia(' + v.sepia + '%) ';
    if (v.hue) f += 'hue-rotate(' + v.hue + 'deg) ';
    if (v.blur) f += 'blur(' + v.blur + 'px) ';
    img.style.filter = f.trim();
    var z = v.zoom / 100;
    img.style.scale = (z === 1 && !v.flip) ? '' : ((v.flip ? -z : z) + ' ' + z);
    img.style.transformOrigin = img.style.objectPosition || '';

    var clean = {};
    Object.keys(v).forEach(function (k) { if (v[k] !== I.FX_DEFAULT[k]) clean[k] = v[k]; });
    if (Object.keys(clean).length) img.setAttribute('data-wb-fx', JSON.stringify(clean));
    else img.removeAttribute('data-wb-fx');
    E.changed();
  };
})();
