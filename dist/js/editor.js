/* ==========================================================================
   weBlogger - el editor sobre la pagina.

   El articulo vive en un <iframe> con su propia hoja de estilos, la misma que
   se exporta: lo que se ve es lo que se guarda. Este archivo pone encima la
   seleccion de bloques, la escritura directa, arrastrar y soltar y deshacer.
   Los marcos de seleccion se dibujan fuera del iframe para no ensuciar el
   documento del articulo.
   ========================================================================== */
(function () {
  'use strict';

  var frame = document.getElementById('pageFrame');
  var stage = document.getElementById('stage');
  var ovHover = document.getElementById('ovHover');
  var ovSel = document.getElementById('ovSel');
  var ovBar = document.getElementById('ovBar');
  var ovLabel = document.getElementById('ovLabel');
  var ovDrop = document.getElementById('ovDrop');

  var SLOT = '.article-section,[data-wb-slot]';
  var E = WB.ed = { idoc: null, sel: null, pageTheme: 'light', SLOT: SLOT };
  var d = null;               // documento del articulo

  /* ============================================================ montar === */

  E.mount = function (bodyHtml) {
    var src = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<style id="wb-vars"></style><style id="wb-base"></style><style id="wb-format"></style><style id="wb-custom"></style><style id="wb-ed"></style>' +
      '</head><body></body></html>';
    return new Promise(function (resolve) {
      frame.onload = function () { frame.onload = null; resolve(); };
      frame.srcdoc = src;
    }).then(function () {
      d = E.idoc = frame.contentDocument;
      E.sel = null;
      d.documentElement.lang = WB.doc.s.editLang;
      d.documentElement.setAttribute('data-theme', E.pageTheme);
      d.getElementById('wb-base').textContent = WB.tpl.css;
      d.getElementById('wb-ed').textContent = WB.tpl.edcss;
      d.body.innerHTML = bodyHtml;
      bind();
      E.applyVars();
      E.afterDom();
    });
  };

  E.unmount = function () {
    d = E.idoc = null;
    E.sel = null;
    frame.srcdoc = '';
    E.refresh();
  };

  /** Variables de color y fuentes de la pagina, mas el CSS propio. */
  E.applyVars = function () {
    if (!d) return;
    d.getElementById('wb-vars').textContent = WB.doc.varsCss();
    d.getElementById('wb-custom').textContent = WB.doc.s.customCss || '';
    d.getElementById('wb-format').textContent = WB.doc.formatCss();
    if (WB.doc.s.format) d.documentElement.setAttribute('data-wb-format', WB.doc.s.format);
    else d.documentElement.removeAttribute('data-wb-format');
    if (WB.styles) WB.styles.attrs(d.documentElement, WB.doc.s);
    E.ensureFonts();
  };

  /** Carga en el editor las fuentes de Google que la pagina usa. */
  E.ensureFonts = function (extra) {
    if (!d) return;
    var names = WB.doc.usedFonts(d.body.innerHTML).concat(extra || []);
    names.forEach(function (n) {
      if (!WB.fontByName(n) || d.head.querySelector('link[data-font="' + n + '"]')) return;
      var l = d.createElement('link');
      l.rel = 'stylesheet';
      l.href = WB.fontsUrl([n]);
      l.setAttribute('data-font', n);
      l.onload = function () {
        // el texto artistico se mide con la fuente: hay que redibujarlo
        if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { WB.art.renderAll(d, true); E.refreshSoon(); });
      };
      d.head.appendChild(l);
    });
  };

  /** Lo que hay que rehacer cada vez que cambia la estructura de la pagina. */
  E.afterDom = function () {
    if (!d) return;
    markHosts();
    WB.art.renderAll(d, false);
    autoToc();
    WB.doc.syncLangButtons(d);
    var wrap = d.querySelector('.article-wrapper');
    if (wrap) wrap.classList.toggle('no-toc', !wrap.querySelector('.toc-sidebar'));
    E.ensureFonts();
    E.refreshSoon();
  };

  function markHosts() {
    d.body.querySelectorAll(WB.TEXT_SEL).forEach(function (el) {
      if (el.closest('.wb-art, .wb-embed, .wb-video')) return;
      if (el.querySelector(WB.TEXT_SEL)) { el.removeAttribute('contenteditable'); return; }
      if (el.getAttribute('contenteditable') === 'true') return;
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');
    });
  }

  /* =================================================== indice automatico = */

  function autoToc() {
    var list = d.querySelector('.toc-list[data-wb-auto]');
    var used = Object.create(null);
    var secs = d.querySelectorAll('.article-content > .article-section');
    secs.forEach(function (sec) {
      // toda seccion necesita un ancla unica, haya indice o no
      if (!sec.id || used[sec.id]) {
        var h = sec.querySelector('h2');
        var base = WB.doc.slug(h ? h.textContent : 'seccion');
        var id = base;
        for (var n = 2; used[id] || (d.getElementById(id) && d.getElementById(id) !== sec); n++) id = base + '-' + n;
        sec.id = id;
      }
      used[sec.id] = true;
    });
    if (!list) return;

    var html = '';
    secs.forEach(function (sec, i) {
      var h = sec.querySelector('h2');
      var t = h ? h.textContent.trim() : 'Sección ' + (i + 1);
      html += '<li><a href="#' + sec.id + '" data-i18n="toc-' + sec.id + '">' + (i + 1) + '. ' + WB.esc(t) + '</a></li>';
    });
    var now = Array.prototype.map.call(list.querySelectorAll('a'), function (a) {
      return a.getAttribute('href') + '|' + a.textContent;
    }).join('\n');
    var want = Array.prototype.map.call(secs, function (sec, i) {
      var h = sec.querySelector('h2');
      return '#' + sec.id + '|' + (i + 1) + '. ' + (h ? h.textContent.trim() : 'Sección ' + (i + 1));
    }).join('\n');
    if (now !== want) list.innerHTML = html;
  }
  E.autoToc = function () { if (d) { autoToc(); markHosts(); } };

  /* ====================================================== bloques ======== */

  function blockOf(t) {
    if (!t) return null;
    if (t.nodeType !== 1) t = t.parentElement;
    if (!t || !d.body.contains(t) || t === d.body) return null;
    var opaque = t.closest('.wb-art, .wb-embed, .wb-video');
    if (opaque) return opaque;
    return t.closest(WB.ALL_SEL);
  }
  E.blockOf = blockOf;

  function hostOf(t) {
    if (!t) return null;
    if (t.nodeType !== 1) t = t.parentElement;
    return t ? t.closest('[contenteditable="true"]') : null;
  }

  /** Cadena de bloques desde la pagina hasta `el`. */
  E.path = function (el) {
    var out = [];
    for (var n = el; n && n !== d.body; n = n.parentElement) {
      var t = WB.typeOf(n);
      if (t) out.unshift({ el: n, type: t });
    }
    return out;
  };

  E.select = function (el, opts) {
    if (el && (!d || !d.body.contains(el))) el = null;
    var changed = E.sel !== el;
    E.sel = el;
    ovHover.hidden = true;
    E.refresh();
    if (changed || (opts && opts.force)) WB.panels.renderProps();
    if (el && opts && opts.scroll) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (el && changed) {
      var t = WB.typeOf(el);
      document.getElementById('statusSel').textContent = t ? t.name : el.tagName.toLowerCase();
    } else if (!el) {
      document.getElementById('statusSel').textContent = 'nada seleccionado';
    }
  };

  E.selectParent = function () {
    if (!E.sel) return;
    var p = E.sel.parentElement ? blockOf(E.sel.parentElement) : null;
    if (p) E.select(p);
  };

  function kindOf(el) {
    var t = WB.typeOf(el);
    return t ? t.kind : 'content';
  }

  /** Se puede mover / duplicar / borrar: todo menos las partes fijas. */
  E.isFree = function (el) {
    var k = kindOf(el);
    if (!el || k === 'part' || k === 'fixed') return false;
    // el indice automatico se rehace solo, y sin su boton un modal no se abre
    if (el.matches('.toc-list[data-wb-auto] > li, .wb-modal-wrap > [data-wb-modal-open]')) return false;
    return true;
  };

  /** Una lista o una rejilla que se queda sin hijos no sirve de nada. */
  function pruneEmpty(parent) {
    if (parent && !parent.children.length && !parent.hasAttribute('data-wb-auto') &&
        parent.matches('.np-grid,.np-briefs,ul,ol,.gallery-grid,.info-cards,.timeline,.ganxet-specs,.wb-btn-row,.wb-acc')) {
      var next = parent.nextElementSibling || parent.previousElementSibling;
      parent.remove();
      return next;
    }
    return null;
  }

  function stripKeys(el) {
    // una copia no puede compartir claves de traduccion ni identificadores
    el.querySelectorAll('[id]').forEach(function (n) {
      var old = n.id, nu = old.replace(/-[a-z0-9]{5}$/, '') + '-' + WB.uid();
      n.id = nu;
      el.querySelectorAll('[data-wb-modal-open="' + old + '"]').forEach(function (o) { o.setAttribute('data-wb-modal-open', nu); });
    });
    if (el.id) el.id = '';
    if (el.classList.contains('wb-art')) {
      var a = WB.art.get(el); a.uid = WB.uid(); WB.art.put(el, a); el.innerHTML = '';
    }
    el.querySelectorAll('.wb-art').forEach(function (n) {
      var a2 = WB.art.get(n); a2.uid = WB.uid(); WB.art.put(n, a2); n.innerHTML = '';
    });
  }

  E.duplicate = function (el) {
    el = el || E.sel;
    if (!E.isFree(el)) return;
    var c = el.cloneNode(true);
    stripKeys(c);
    el.after(c);
    E.commit('duplicado');
    E.select(c, { scroll: true });
  };

  E.remove = function (el) {
    el = el || E.sel;
    if (!E.isFree(el)) return;
    var parent = el.parentElement;
    var next = el.nextElementSibling || el.previousElementSibling;
    el.remove();
    next = pruneEmpty(parent) || next;
    E.commit('eliminado');
    E.select(next && blockOf(next));
  };

  E.move = function (dir, el) {
    el = el || E.sel;
    if (!E.isFree(el)) return;
    var sib = dir < 0 ? el.previousElementSibling : el.nextElementSibling;
    if (!sib) return;
    if (dir < 0) sib.before(el); else sib.after(el);
    E.commit(dir < 0 ? 'subido' : 'bajado');
    el.scrollIntoView({ block: 'nearest' });
    E.refresh();
  };

  /** Donde va un elemento nuevo cuando se inserta con un clic. */
  function defaultPlace(kind) {
    var content = d.querySelector('.article-content');
    if (kind === 'section') {
      if (!content) return null;
      var cur = E.sel && E.sel.closest('.article-content > .article-section');
      return { container: content, before: cur ? cur.nextElementSibling : null };
    }
    if (E.sel) {
      if (E.sel.matches('[data-wb-slot]') && !E.sel.children.length) return { container: E.sel, before: null };
      for (var n = E.sel; n && n !== d.body; n = n.parentElement) {
        if (n.parentElement && n.parentElement.matches(SLOT)) return { container: n.parentElement, before: n.nextElementSibling };
        if (n.matches('.article-section')) return { container: n, before: null };
      }
    }
    var secs = d.querySelectorAll('.article-content > .article-section');
    if (secs.length) return { container: secs[secs.length - 1], before: null };
    return content ? { container: content, before: null, needsSection: true } : null;
  }

  function make(html) {
    var t = d.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  E.make = make;

  E.insert = function (id, place) {
    var item = WB.catalogItem(id);
    if (!item || !d) return null;
    var kind = item.kind || 'content';
    place = place || defaultPlace(kind);
    if (!place) { WB.ui.fail('esta página no tiene cuerpo de artículo donde ponerlo'); return null; }
    var el = make(item.html(WB.uid()));
    if (place.needsSection) {
      var sec = make(WB.catalogItem('section').html(WB.uid()));
      sec.innerHTML = '';
      place.container.appendChild(sec);
      place = { container: sec, before: null };
    }
    place.container.insertBefore(el, place.before || null);
    E.commit(item.name + ' añadido');
    E.select(el, { scroll: !place.dropped });
    return el;
  };

  /* ===================================================== capa de marcos == */

  function rectOf(el) {
    var r = el.getBoundingClientRect();
    var f = frame.getBoundingClientRect();
    var s = stage.getBoundingClientRect();
    return { x: r.left + f.left - s.left, y: r.top + f.top - s.top, w: r.width, h: r.height, fx: f.left - s.left, fw: f.width };
  }

  function placeBox(box, r) {
    box.style.left = Math.round(r.x) + 'px';
    box.style.top = Math.round(r.y) + 'px';
    box.style.width = Math.round(r.w) + 'px';
    box.style.height = Math.round(r.h) + 'px';
  }

  E.refresh = function () {
    if (!d || !E.sel || !d.body.contains(E.sel)) {
      if (E.sel) { E.sel = null; WB.panels.renderProps(); }
      ovSel.hidden = ovBar.hidden = true;
      return;
    }
    var r = rectOf(E.sel);
    var sh = stage.clientHeight;
    if (r.y + r.h < 0 || r.y > sh) { ovSel.hidden = ovBar.hidden = true; return; }
    ovSel.hidden = ovBar.hidden = false;
    placeBox(ovSel, r);

    var t = WB.typeOf(E.sel);
    ovLabel.textContent = t ? t.name : E.sel.tagName.toLowerCase();
    var free = E.isFree(E.sel);
    ovBar.querySelectorAll('[data-free]').forEach(function (b) { b.hidden = !free; });
    var bw = ovBar.offsetWidth, bh = ovBar.offsetHeight;
    var y = r.y - bh - 3;
    if (y < 2) y = Math.min(Math.max(2, r.y + 3), Math.max(2, r.y + r.h - bh - 3));
    var x = Math.max(r.fx + 2, Math.min(r.x, r.fx + r.fw - bw - 14));
    ovBar.style.left = Math.round(x) + 'px';
    ovBar.style.top = Math.round(y) + 'px';
  };

  var raf = 0;
  E.refreshSoon = function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; E.refresh(); });
  };
  window.addEventListener('resize', E.refreshSoon);
  // Las imagenes y las fuentes llegan tarde y mueven la pagina.
  setInterval(function () { if (d && E.sel) E.refresh(); }, 400);

  /* ============================================================ cambios == */

  var histTimer = 0;

  /** Cambio pequeño (escribir, mover un deslizador): se anota con retraso. */
  E.changed = function () {
    WB.ui.markDirty(true);
    E.refreshSoon();
    clearTimeout(histTimer);
    histTimer = setTimeout(function () { histTimer = 0; WB.hist.push(); }, 500);
  };

  /** Cambio de estructura: se rehace todo lo derivado y se anota ya. */
  E.commit = function (msg) {
    clearTimeout(histTimer);
    histTimer = 0;
    E.afterDom();
    WB.ui.markDirty(true);
    WB.hist.push();
    WB.panels.renderOutline();
    if (msg) WB.ui.status(msg);
  };

  WB.hist = {
    stack: [], i: -1,
    snap: function () { return { html: d.body.innerHTML, st: JSON.stringify(WB.doc.s) }; },
    reset: function () { this.stack = d ? [this.snap()] : []; this.i = this.stack.length - 1; },
    push: function () {
      if (!d) return;
      var s = this.snap(), cur = this.stack[this.i];
      if (cur && cur.html === s.html && cur.st === s.st) return;
      this.stack.length = this.i + 1;
      this.stack.push(s);
      if (this.stack.length > 80) this.stack.shift();
      this.i = this.stack.length - 1;
    },
    go: function (step) {
      if (!d) return;
      if (histTimer) { clearTimeout(histTimer); histTimer = 0; this.push(); }
      var n = this.i + step;
      if (n < 0 || n >= this.stack.length) { WB.ui.status(step < 0 ? 'nada que deshacer' : 'nada que rehacer'); return; }
      this.i = n;
      var s = this.stack[n];
      var path = WB.doc.s.path;
      WB.doc.s = JSON.parse(s.st);
      WB.doc.s.path = path;
      d.body.innerHTML = s.html;
      d.documentElement.lang = WB.doc.s.editLang;
      E.sel = null;
      E.applyVars();
      E.afterDom();
      WB.ui.markDirty(true);
      WB.panels.renderAll();
      WB.ui.status(step < 0 ? 'deshecho' : 'rehecho');
    }
  };

  /* ====================================================== escribir ======= */

  function inSlot(el) {
    return !!el.parentElement && el.parentElement.matches(SLOT);
  }

  function splittable(host) {
    if (host.tagName === 'LI') return true;
    return /^(P|H2|H3|H4)$/.test(host.tagName) && inSlot(host);
  }

  function caretTo(el, atEnd) {
    var r = d.createRange();
    r.selectNodeContents(el);
    r.collapse(!atEnd);
    var s = d.getSelection();
    s.removeAllRanges();
    s.addRange(r);
    el.focus();
  }

  /** Intro: parte el parrafo en dos, como en un procesador de textos. */
  function splitHost(host) {
    var s = d.getSelection();
    if (!s.rangeCount) return;
    var r = s.getRangeAt(0);
    r.deleteContents();
    var tail = d.createRange();
    tail.selectNodeContents(host);
    tail.setStart(r.endContainer, r.endOffset);
    var frag = tail.extractContents();
    var n = d.createElement(host.tagName === 'LI' ? 'li' : 'p');
    n.appendChild(frag);
    if (!n.textContent && !n.querySelector('img,br')) n.innerHTML = '';
    host.after(n);
    E.commit();
    caretTo(n, false);
    E.select(blockOf(n));
  }

  function isEmpty(host) {
    return !host.textContent.replace(/​/g, '').trim() && !host.querySelector('img');
  }

  function onKeyDown(ev) {
    if (WB.shortcut(ev)) return;
    var host = hostOf(ev.target);

    if (!host) {
      if ((ev.key === 'Delete' || ev.key === 'Backspace') && E.sel) { ev.preventDefault(); E.remove(); }
      else if (ev.key === 'Escape') E.selectParent();
      return;
    }

    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (host.tagName === 'PRE') { d.execCommand('insertText', false, '\n'); return; }
      if (ev.shiftKey || !splittable(host)) {
        if (ev.shiftKey || /^(P|H1|H2|H3|H4|CITE|TD|TH)$/.test(host.tagName)) d.execCommand('insertLineBreak');
        return;
      }
      splitHost(host);
    } else if (ev.key === 'Backspace' && isEmpty(host) && splittable(host)) {
      var prev = host.previousElementSibling;
      var target = prev && (prev.matches('[contenteditable="true"]') ? prev : prev.querySelector('[contenteditable="true"]:last-of-type'));
      if (!target) return;
      ev.preventDefault();
      var list = host.tagName === 'LI' ? host.parentElement : null;
      host.remove();
      if (list && !list.children.length) list.remove();
      E.commit();
      caretTo(target, true);
      E.select(blockOf(target));
    } else if (ev.key === ' ' && host.tagName === 'SUMMARY') {
      ev.preventDefault();
      d.execCommand('insertText', false, ' ');
    } else if (ev.key === 'Escape') {
      host.blur();
      d.getSelection().removeAllRanges();
      E.select(blockOf(host));
    }
  }

  function onPaste(ev) {
    var cd = ev.clipboardData;
    if (!cd) return;
    var file = Array.prototype.filter.call(cd.files || [], function (f) { return /^image\//.test(f.type); })[0];
    ev.preventDefault();
    // Excel y compañia copian el texto y ademas una foto de lo copiado: si hay
    // texto y un sitio donde escribirlo, manda el texto
    var plain = (cd.getData('text/plain') || '').trim();
    if (file && !(hostOf(ev.target) && plain)) {
      var url = WB.doc.addAsset(file, file.name || 'pegada.png');
      var fig = E.insert('image');
      if (fig) WB.img.setSrc(fig.querySelector('img'), url);
      return;
    }
    var host = hostOf(ev.target);
    if (!host) return;
    var text = cd.getData('text/plain').replace(/\r/g, '');
    var paras = text.split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
    if (paras.length > 1 && host.tagName === 'P' && inSlot(host)) {
      // varios parrafos pegados: cada uno en su parrafo
      d.execCommand('insertHTML', false, WB.esc(paras[0]).replace(/\n/g, '<br>'));
      // lo que habia detras del cursor tiene que acabar detras de lo pegado
      var sel = d.getSelection();
      var tail = null;
      if (sel.rangeCount) {
        var tr = d.createRange();
        tr.selectNodeContents(host);
        tr.setStart(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
        tail = tr.extractContents();
      }
      var after = host;
      paras.slice(1).forEach(function (p) {
        var n = d.createElement('p');
        n.innerHTML = WB.esc(p).replace(/\n/g, '<br>');
        after.after(n);
        after = n;
      });
      var mark = d.createTextNode('');
      after.appendChild(mark);
      if (tail) after.appendChild(tail);
      E.commit(paras.length + ' párrafos pegados');
      var cr = d.createRange();
      cr.setStart(mark, 0);
      cr.collapse(true);
      sel.removeAllRanges();
      sel.addRange(cr);
      after.focus();
      E.select(blockOf(after));
    } else {
      d.execCommand('insertHTML', false, WB.esc(text).replace(/\n/g, '<br>'));
      E.changed();
    }
  }

  /* ====================================================== eventos ======== */

  function bind() {
    var w = frame.contentWindow;

    d.addEventListener('mousemove', function (ev) {
      if (dragging) return;
      var b = blockOf(ev.target);
      if (!b || b === E.sel) { ovHover.hidden = true; return; }
      ovHover.hidden = false;
      placeBox(ovHover, rectOf(b));
    });
    d.addEventListener('mouseleave', function () { ovHover.hidden = true; });

    d.addEventListener('mousedown', function (ev) {
      WB.ui.closeMenus();
      E.select(blockOf(ev.target));
    });

    d.addEventListener('click', function (ev) {
      var t = ev.target.nodeType === 1 ? ev.target : ev.target.parentElement;
      if (!t) return;
      var a = t.closest('a');
      if (a) ev.preventDefault();

      var lang = t.closest('.lang-btn');
      if (lang) { ev.preventDefault(); WB.run('edit-lang:' + lang.getAttribute('data-lang')); return; }
      if (t.closest('.theme-btn')) { ev.preventDefault(); WB.run('page-theme'); return; }

      var tab = t.closest('.wb-tab');
      if (tab) {
        var box = tab.closest('.wb-tabs');
        var tabs = box.querySelectorAll(':scope > .wb-tab-bar > .wb-tab');
        var panels = box.querySelectorAll(':scope > .wb-tab-panel');
        tabs.forEach(function (x, i) {
          x.classList.toggle('is-active', x === tab);
          if (panels[i]) panels[i].classList.toggle('is-active', x === tab);
        });
        E.refreshSoon();
        return;
      }
      if (t.closest('.wb-modal-close')) {
        t.closest('.wb-modal-wrap').classList.remove('wb-edit-open');
        E.select(t.closest('.wb-modal-wrap'), { force: true });
      }
    });

    d.addEventListener('dblclick', function (ev) {
      var t = ev.target;
      if (t.tagName === 'IMG') { ev.preventDefault(); WB.img.pick(t); return; }
      var wrap = t.closest && t.closest('.wb-modal-wrap');
      if (wrap && t.closest('[data-wb-modal-open]')) {
        wrap.classList.toggle('wb-edit-open');
        E.select(wrap, { force: true });
      }
    });

    d.addEventListener('contextmenu', function (ev) {
      ev.preventDefault();
      var b = blockOf(ev.target);
      if (!b) return;
      E.select(b);
      var f = frame.getBoundingClientRect();
      var x = ev.clientX + f.left, y = ev.clientY + f.top;
      WB.ui.popup(WB.blockMenu(), { getBoundingClientRect: function () { return { left: x, right: x, top: y, bottom: y, width: 0, height: 0 }; } });
    });

    d.addEventListener('input', function (ev) {
      E.changed();
      var host = hostOf(ev.target);
      if (host && host.tagName === 'H2') { autoToc(); markHosts(); WB.panels.renderOutlineSoon(); }
    });
    d.addEventListener('keydown', onKeyDown);
    d.addEventListener('paste', onPaste);
    d.addEventListener('selectionchange', function () { WB.fmt.onSelection(); });

    d.addEventListener('dragover', function (ev) {
      if (!ev.dataTransfer || Array.prototype.indexOf.call(ev.dataTransfer.types, 'Files') < 0) return;
      ev.preventDefault();
      var f = frame.getBoundingClientRect();
      showDrop(dropTarget('content', ev.clientX + f.left, ev.clientY + f.top, null));
    });
    d.addEventListener('drop', function (ev) {
      if (!ev.dataTransfer || !ev.dataTransfer.files.length) return;
      ev.preventDefault();
      ovDrop.hidden = true;
      var f = frame.getBoundingClientRect();
      var place = dropTarget('content', ev.clientX + f.left, ev.clientY + f.top, null);
      // soltar un archivo encima de una imagen la sustituye
      var over = d.elementFromPoint(ev.clientX, ev.clientY);
      Array.prototype.forEach.call(ev.dataTransfer.files, function (file) {
        if (!/^image\//.test(file.type)) return;
        var url = WB.doc.addAsset(file, file.name);
        if (over && over.tagName === 'IMG') { WB.img.setSrc(over, url); over = null; return; }
        if (place) place.dropped = true;
        var fig = E.insert('image', place);
        if (fig) WB.img.setSrc(fig.querySelector('img'), url);
      });
    });

    w.addEventListener('scroll', function () { ovHover.hidden = true; E.refresh(); }, { passive: true });
    w.addEventListener('resize', E.refreshSoon);
  }

  /* =============================================== arrastrar y soltar ==== */

  var dragging = false;
  var ghost = document.getElementById('dragGhost');

  /**
   * Donde caeria un elemento soltado en (cx, cy), en coordenadas de la ventana.
   * Devuelve el hueco, el hermano delante del que entra y la linea que lo marca.
   */
  function dropTarget(kind, cx, cy, moving) {
    if (!d) return null;
    var f = frame.getBoundingClientRect();
    var x = cx - f.left, y = cy - f.top;
    if (x < 0 || y < 0 || x > f.width || y > f.height) return null;

    var w = frame.contentWindow;
    if (y < 50) w.scrollBy(0, -16); else if (y > f.height - 50) w.scrollBy(0, 16);

    var container = null;
    var kids;
    if (kind === 'section') {
      container = d.querySelector('.article-content');
      if (!container) return null;
      kids = Array.prototype.filter.call(container.children, function (k) { return k.matches('.article-section'); });
    } else {
      var t = d.elementFromPoint(x, y);
      container = t && t.closest ? t.closest(SLOT) : null;
      // dentro de un bloque opaco no se suelta nada
      while (container && container.closest('.wb-embed, .wb-art')) container = container.parentElement.closest(SLOT);
      if (moving && container && moving.contains(container)) container = moving.parentElement ? moving.parentElement.closest(SLOT) : null;
      if (!container) {
        var best = Infinity;
        d.querySelectorAll('.article-content > .article-section').forEach(function (s) {
          var r = s.getBoundingClientRect();
          var dist = y < r.top ? r.top - y : (y > r.bottom ? y - r.bottom : 0);
          if (dist < best) { best = dist; container = s; }
        });
      }
      if (!container) {
        container = d.querySelector('.article-content');
        if (!container) return null;
        return { container: container, before: null, needsSection: true, line: lineAt(container, null) };
      }
      kids = Array.prototype.slice.call(container.children);
    }

    var before = null;
    for (var i = 0; i < kids.length; i++) {
      if (kids[i] === moving) continue;
      var r2 = kids[i].getBoundingClientRect();
      if (y < r2.top + r2.height / 2) { before = kids[i]; break; }
    }
    return { container: container, before: before, line: lineAt(container, before) };
  }

  function lineAt(container, before) {
    var c = rectOf(container);
    var y;
    if (before) y = rectOf(before).y - 2;
    else if (container.lastElementChild) { var l = rectOf(container.lastElementChild); y = l.y + l.h + 2; }
    else y = c.y + 8;
    return { x: c.x, y: y, w: c.w };
  }

  function showDrop(place) {
    if (!place) { ovDrop.hidden = true; return; }
    ovDrop.hidden = false;
    ovDrop.style.left = Math.round(place.line.x) + 'px';
    ovDrop.style.top = Math.round(place.line.y) + 'px';
    ovDrop.style.width = Math.round(place.line.w) + 'px';
  }

  /**
   * Arrastre con el puntero, igual para un elemento nuevo del catalogo y para
   * mover un bloque que ya esta en la pagina.
   * o: { kind, label, el (bloque a mover), onDrop(place), onClick() }
   */
  E.startDrag = function (ev, o) {
    if (ev.button !== 0 || !d) return;
    var sx = ev.clientX, sy = ev.clientY;
    var place = null;

    function move(e) {
      if (!dragging) {
        if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) < 6) return;
        dragging = true;
        document.body.classList.add('is-dragging');
        ghost.textContent = o.label;
        ghost.hidden = false;
        ovHover.hidden = true;
      }
      ghost.style.left = (e.clientX + 14) + 'px';
      ghost.style.top = (e.clientY + 12) + 'px';
      place = dropTarget(o.kind, e.clientX, e.clientY, o.el || null);
      showDrop(place);
    }

    function up() {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', up, true);
      var was = dragging;
      dragging = false;
      document.body.classList.remove('is-dragging');
      ghost.hidden = true;
      ovDrop.hidden = true;
      if (!was) { if (o.onClick) o.onClick(); return; }
      if (place) { place.dropped = true; o.onDrop(place); }
    }

    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', up, true);
    ev.preventDefault();
  };

  /** Mueve un bloque existente al hueco indicado. */
  E.moveTo = function (el, place) {
    if (place.before === el || (place.before === el.nextElementSibling && place.container === el.parentElement)) return;
    if (place.needsSection) return;
    var from = el.parentElement;
    place.container.insertBefore(el, place.before || null);
    if (from !== place.container) pruneEmpty(from);
    E.commit('movido');
    E.select(el, { force: true });
  };

  // tirador de la barra del bloque seleccionado
  document.getElementById('ovGrip').addEventListener('pointerdown', function (ev) {
    var el = E.sel;
    if (!el || !E.isFree(el)) return;
    var k = kindOf(el);
    if (k === 'item') { WB.ui.status('este elemento se ordena con las flechas'); return; }
    var t = WB.typeOf(el);
    E.startDrag(ev, {
      kind: k === 'section' ? 'section' : 'content',
      label: t ? t.name : 'bloque',
      el: el,
      onDrop: function (place) { E.moveTo(el, place); }
    });
  });

  /* ============================================ vista: ancho y tema ====== */

  E.setWidth = function (px) {
    stage.style.setProperty('--page-w', px ? px + 'px' : '100%');
    stage.dataset.device = px ? 'narrow' : 'full';
    E.device = px || 0;
    setTimeout(E.refresh, 60);
  };

  E.setPageTheme = function (t) {
    E.pageTheme = t === 'dark' ? 'dark' : 'light';
    if (d) d.documentElement.setAttribute('data-theme', E.pageTheme);
  };
})();
