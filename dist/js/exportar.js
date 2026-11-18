/* ==========================================================================
   weBlogger - exportar la publicacion a otros formatos.

   Hay dos caminos, porque los formatos son de dos clases:

   - Los que conservan la maqueta (PDF y HTML en un solo archivo): se monta
     un documento unico con todas las paginas, cada una con su estilo.
   - Los de texto corrido (Word, EPUB, Markdown, texto): un procesador de
     textos no sabe de rejillas de periodico, asi que se saca el contenido
     en orden de lectura (titulares, parrafos, listas, tablas, imagenes) y lo
     convierte js/oficina.js.

   La carpeta guardada ya es, por si misma, la web en HTML + CSS + JavaScript.
   ========================================================================== */
(function () {
  'use strict';

  var E = WB.ed, D = WB.doc, pub = WB.pub;
  var X = WB.exp = {};

  /* ============================================================ utiles === */

  function b64(bytes) {
    var out = '', step = 0x8000;
    for (var i = 0; i < bytes.length; i += step) out += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
    return btoa(out);
  }

  function dataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result)); };
      r.onerror = function () { reject(new Error('no se pudo leer una imagen')); };
      r.readAsDataURL(blob);
    });
  }

  function dataUrlToBlob(url) {
    var m = /^data:([^;,]+)(;base64)?,(.*)$/.exec(url);
    if (!m) return null;
    var raw = m[2] ? atob(m[3]) : decodeURIComponent(m[3]);
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return new Blob([bytes], { type: m[1] });
  }

  function baseName() {
    var p = pub.pages[0] ? pub.pages[0].s.path : '';
    var n = String(p || '').replace(/[\\/]+$/, '').split(/[\\/]/).pop();
    return n || D.slug(D.s.title);
  }

  function startDir() {
    var p = pub.pages[0] ? pub.pages[0].s.path : '';
    return p ? String(p).replace(/[\\/][^\\/]*$/, '') : '';
  }

  /* ============================================== documento con maqueta == */

  /**
   * Todas las paginas en un solo HTML, cada una dentro de un contenedor que
   * lleva sus variables y los atributos de su estilo. Las imagenes propias van
   * incrustadas, para que el archivo no dependa de ninguna carpeta.
   * print: 'A3' | 'A4' | '' (sin regla de pagina)
   */
  /**
   * only:  indice de una sola pagina (para la imprenta, que imprime cada una aparte).
   * extra: CSS que se añade al final.
   */
  X.combined = function (print, only, extra) {
    var parts = [], css = '', fonts = [], jobs = [];
    var e = WB.esc;

    pub.each(function (p, i, doc) {
      if (only !== undefined && only !== null && i !== only) return;
      var s = p.s;
      var body = D.cleanBody(doc, true);
      body.querySelectorAll('.lang-switcher, .theme-btn, .wb-modal').forEach(function (n) { n.remove(); });
      body.querySelectorAll('[data-lightbox-src]').forEach(function (n) { n.removeAttribute('data-lightbox-src'); n.removeAttribute('data-lightbox-caption'); });
      body.querySelectorAll('img[src]').forEach(function (img) {
        var a = D.assets.get(img.getAttribute('src'));
        if (a) jobs.push(dataUrl(a.blob).then(function (u) { img.setAttribute('src', u); }));
        img.removeAttribute('loading');
      });
      D.usedFonts(body.innerHTML).forEach(function (n) { if (fonts.indexOf(n) < 0) fonts.push(n); });

      var cls = 'wb-pg-' + (i + 1);
      css += D.varsCss().replace(':root', '.' + cls).replace('[data-theme="dark"]', '.' + cls + '[data-theme="dark"]') +
        D.formatCss() + (s.customCss || '') + '\n';
      parts.push({
        open: '<div class="wb-pg ' + cls + '" data-theme="light"' + (s.format ? ' data-wb-format="' + e(s.format) + '"' : '') + WB.styles.attrString(s) + '>',
        body: body
      });
    });

    return Promise.all(jobs).then(function () {
      var page = print && typeof print === 'object' ? '@page { size: ' + print.size + '; margin: ' + print.margin + '; }' : print === 'A4' ? '@page { size: A4; margin: 12mm; }' : print === 'A3' ? '@page { size: A3; margin: 11mm; }' : '';
      var fontUrl = WB.fontsUrl(fonts);
      return '<!DOCTYPE html>\n<html lang="' + e(pub.pages[0].s.lang) + '">\n<head>\n<meta charset="UTF-8" />\n' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
        '<meta name="generator" content="weBlogger" />\n<title>' + e(pub.pages[0].s.title) + '</title>\n' +
        (fontUrl ? '<link href="' + e(fontUrl) + '" rel="stylesheet" />\n' : '') +
        '<style>\n' + WB.tpl.css + '\n' +
        'body { background: #fff; }\n' +
        '.wb-pg { font-family: var(--font-body); background: var(--bg-primary); color: var(--text-primary); line-height: 1.75; overflow: hidden; break-after: page; page-break-after: always; }\n' +
        '.wb-pg:last-child { break-after: auto; page-break-after: auto; }\n' +
        '.wb-pg .reveal { opacity: 1; transform: none; }\n' +
        '.wb-pg .site-header { position: static; }\n' +
        css + page + '\n' + (extra || '') + '\n</style>\n</head>\n<body>\n' +
        parts.map(function (p) { return p.open + '\n' + p.body.innerHTML.trim() + '\n</div>'; }).join('\n') +
        '\n</body>\n</html>\n';
    });
  };

  /* ================================================ contenido en orden === */

  var SKIP = 'script,style,.np-nav,.nav-links,.header-controls,.lang-switcher,.theme-btn,.wb-pager,.toc-sidebar,.lightbox,.wb-modal-close,.wb-window-dots,.wb-tab-bar,.wb-video,.wb-embed,.np-opinion-photo,.wb-byline-avatar';
  var BLOCKY = 'p,h1,h2,h3,h4,h5,h6,ul,ol,figure,img,table,div,section,blockquote,pre,article,aside,header,footer,nav,details';

  // Filas que en pantalla separa la maqueta (flex o rejilla): en texto corrido
  // sus piezas quedarian pegadas («Edición nacionalMartes…»), asi que se unen con un punto.
  var ROWS = '.np-nameplate-line, .wb-masthead-line, .hero-meta, .np-ticker, .wb-byline, .np-opinion > div, .stat-card, .spec-pill-card, .footer-signature, .wb-btn-row';

  function runsOf(el) {
    var out = [];
    (function go(node, st) {
      var row = node.nodeType === 1 && node.matches(ROWS);
      var first = true;
      node.childNodes.forEach(function (n) {
        if (row && n.nodeType === 1 && n.textContent.trim()) {
          if (!first) out.push(Object.assign({ text: ' · ' }, st));
          first = false;
        }
        if (n.nodeType === 3) {
          var t = n.nodeValue.replace(/\s+/g, ' ');
          if (t) out.push(Object.assign({ text: t }, st));
          return;
        }
        if (n.nodeType !== 1) return;
        var tag = n.tagName;
        if (tag === 'BR') { out.push(Object.assign({ text: '\n' }, st)); return; }
        var s2 = Object.assign({}, st);
        if (tag === 'B' || tag === 'STRONG') s2.b = true;
        if (tag === 'I' || tag === 'EM' || tag === 'CITE') s2.i = true;
        if (tag === 'U') s2.u = true;
        if (tag === 'S' || tag === 'DEL' || tag === 'STRIKE') s2.s = true;
        if (tag === 'SUP') s2.sup = true;
        if (tag === 'SUB') s2.sub = true;
        if (tag === 'A' && /^https?:/i.test(n.getAttribute('href') || '')) s2.link = n.getAttribute('href');
        var cs = n.style;
        if (cs) {
          if (parseInt(cs.fontWeight, 10) >= 600 || cs.fontWeight === 'bold') s2.b = true;
          if (cs.fontStyle === 'italic') s2.i = true;
          if (/underline/.test(cs.textDecoration)) s2.u = true;
          if (/line-through/.test(cs.textDecoration)) s2.s = true;
          if (cs.color && /^(#|rgb)/.test(cs.color)) s2.color = D.toHex(cs.color);
        }
        go(n, s2);
      });
    })(el, {});
    // sin espacios sobrantes al principio ni al final
    while (out.length && !out[0].text.trim() && out[0].text !== '\n') out.shift();
    while (out.length && !out[out.length - 1].text.trim()) out.pop();
    if (out.length) { out[0].text = out[0].text.replace(/^ +/, ''); out[out.length - 1].text = out[out.length - 1].text.replace(/ +$/, ''); }
    return out.filter(function (r) { return r.text !== ''; });
  }

  function plain(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }

  function blocksOf(body, images) {
    var out = [];

    function image(img, caption) {
      var src = img ? img.getAttribute('src') : '';
      if (!src || src === WB.PLACEHOLDER) return;
      var b = { t: 'img', name: '', mime: '', data: null, url: null, w: 0, h: 0, caption: caption || '', alt: img.getAttribute('alt') || '' };
      images.push({ block: b, src: src });
      out.push(b);
    }

    function walk(el) {
      if (el.nodeType !== 1 || el.hidden || el.matches(SKIP)) return;
      var tag = el.tagName;

      if (/^H[1-6]$/.test(tag)) {
        var r = runsOf(el);
        if (r.length) out.push({ t: 'h', level: Math.min(4, +tag[1]), runs: r });
      } else if (tag === 'P') {
        var runs = runsOf(el);
        if (!runs.length) return;
        if (el.classList.contains('wb-pull')) { out.push({ t: 'quote', runs: runs, cite: '' }); return; }
        var cls = el.matches('.wb-lead, .np-deck, .hero-lead, .wb-headline-deck') ? 'lead' : el.matches('.wb-note') ? 'note' : '';
        var al = el.style.textAlign;
        out.push({ t: 'p', runs: runs, cls: cls, align: al === 'center' || al === 'right' || al === 'justify' ? al : '' });
      } else if (tag === 'UL' || tag === 'OL') {
        var items = Array.prototype.map.call(el.querySelectorAll(':scope > li'), runsOf).filter(function (x) { return x.length; });
        if (items.length) out.push({ t: 'list', ordered: tag === 'OL', items: items });
      } else if (tag === 'BLOCKQUOTE') {
        var qp = el.querySelector('p') || el;
        var cite = el.querySelector('cite');
        var holder = qp === el && cite ? null : qp;
        out.push({ t: 'quote', runs: holder ? runsOf(holder) : [{ text: plain(el) }], cite: plain(cite) });
      } else if (tag === 'FIGURE' || el.matches('.gallery-item')) {
        var cap = el.querySelector('figcaption span:not(.license-tag), .gallery-item-caption');
        var lic = el.querySelector('.license-tag');
        image(el.querySelector('img'), [plain(cap), plain(lic)].filter(Boolean).join(' · '));
      } else if (el.matches('.np-cover')) {
        image(el.querySelector(':scope > img'), '');
        var txt = el.querySelector('.np-cover-text');
        if (txt) Array.prototype.forEach.call(txt.children, walk);
      } else if (tag === 'IMG') {
        image(el, '');
      } else if (tag === 'TABLE') {
        var rows = function (sel) {
          return Array.prototype.map.call(el.querySelectorAll(sel), function (tr) { return Array.prototype.map.call(tr.cells, runsOf); });
        };
        out.push({ t: 'table', head: rows('thead tr'), rows: rows('tbody tr') });
      } else if (tag === 'PRE') {
        out.push({ t: 'p', runs: [{ text: el.textContent }], cls: 'code', align: '' });
      } else if (el.matches('.wb-divider')) {
        out.push({ t: 'rule' });
      } else if (el.matches('.wb-art')) {
        var art = WB.art.get(el);
        if (art.text) out.push({ t: 'h', level: 2, runs: [{ text: art.text.trim() }] });
      } else if (!el.querySelector(BLOCKY) || el.matches(ROWS)) {
        // hoja de texto suelta: antetitulo, etiqueta, cifra, firma, pie...
        var lr = runsOf(el);
        if (lr.length) out.push({ t: 'p', runs: lr, cls: 'kicker', align: '' });
      } else {
        Array.prototype.forEach.call(el.children, walk);
      }
    }

    Array.prototype.forEach.call(body.children, walk);
    return out;
  }

  /** Convierte lo que no sea PNG o JPEG, y mide la imagen. */
  function resolveImage(item, n) {
    var a = D.assets.get(item.src);
    var blob = a ? a.blob : (/^data:/.test(item.src) ? dataUrlToBlob(item.src) : null);
    if (!blob) { item.block.url = item.src; return Promise.resolve(); }   // imagen de internet: se enlaza
    return createImageBitmap(blob).then(function (bmp) {
      item.block.w = bmp.width;
      item.block.h = bmp.height;
      if (/^image\/(png|jpeg)$/.test(blob.type)) return blob;
      var cv = document.createElement('canvas');
      cv.width = bmp.width;
      cv.height = bmp.height;
      cv.getContext('2d').drawImage(bmp, 0, 0);
      return new Promise(function (res) { cv.toBlob(res, 'image/png'); });
    }).then(function (final) {
      return final.arrayBuffer().then(function (buf) {
        item.block.data = new Uint8Array(buf);
        item.block.mime = final.type;
        item.block.name = 'imagen-' + n + (final.type === 'image/png' ? '.png' : '.jpg');
      });
    }).catch(function () { item.block.url = /^https?:/.test(item.src) ? item.src : null; });
  }

  /** El contenido de la publicacion, pagina a pagina, en orden de lectura. */
  X.model = function () {
    var images = [];
    var doc = { title: pub.pages[0].s.title || baseName(), lang: pub.pages[0].s.lang, creator: 'weBlogger', pages: [] };
    pub.each(function (p, i, d) {
      doc.pages.push({ name: pub.nameOf(i), title: p.s.title, blocks: blocksOf(D.cleanBody(d, true), images) });
    });
    return Promise.all(images.map(function (it, n) { return resolveImage(it, n + 1); })).then(function () {
      doc.pages.forEach(function (pg) {
        pg.blocks = pg.blocks.filter(function (b) { return b.t !== 'img' || b.data || b.url; });
      });
      return doc;
    });
  };

  /* ========================================================== formatos === */

  X.FORMATS = [
    { id: 'pdf-a3', ext: 'pdf', label: 'PDF · A3, con la maqueta de diario', icon: 'ic-new' },
    { id: 'pdf-a4', ext: 'pdf', label: 'PDF · A4, a una columna', icon: 'ic-new' },
    { id: 'docx', ext: 'docx', label: 'Word (.docx)', icon: 'ic-font' },
    { id: 'doc', ext: 'doc', label: 'Word 97-2003 (.doc)', icon: 'ic-font' },
    { id: 'epub', ext: 'epub', label: 'Libro electrónico (.epub)', icon: 'ic-book' },
    { id: 'html', ext: 'html', label: 'HTML en un solo archivo', icon: 'ic-globe' },
    { id: 'md', ext: 'md', label: 'Markdown (.md)', icon: 'ic-terminal' },
    { id: 'txt', ext: 'txt', label: 'Texto sin formato (.txt)', icon: 'ic-para' }
  ];

  function office() {
    if (!WB.office) throw new Error('falta js/oficina.js: sin él no se puede exportar a ese formato');
    return WB.office;
  }

  var MAKE = {
    'pdf-a3': function (path) { return X.combined('A3').then(function (html) { return WB.invoke('export_pdf', { html: html, pdf: path }); }); },
    'pdf-a4': function (path) { return X.combined('A4').then(function (html) { return WB.invoke('export_pdf', { html: html, pdf: path }); }); },
    html: function (path) { return X.combined('').then(function (html) { return WB.invoke('write_text', { path: path, text: html }); }); },
    docx: function (path) { return X.model().then(function (m) { return WB.invoke('write_b64', { path: path, data: b64(office().docx(m)) }); }); },
    epub: function (path) { return X.model().then(function (m) { return WB.invoke('write_b64', { path: path, data: b64(office().epub(m)) }); }); },
    doc: function (path) { return X.model().then(function (m) { return WB.invoke('write_text', { path: path, text: office().wordDoc(m) }); }); },
    md: function (path) { return X.model().then(function (m) { return WB.invoke('write_text', { path: path, text: office().markdown(m) }); }); },
    txt: function (path) { return X.model().then(function (m) { return WB.invoke('write_text', { path: path, text: office().text(m) }); }); }
  };

  X.MAKE = MAKE;
  X.b64 = b64;

  X.run = function (id) {
    var f = X.FORMATS.filter(function (x) { return x.id === id; })[0];
    if (!f || !E.idoc) return Promise.resolve();
    return WB.invoke('pick_save', { name: baseName() + '.' + f.ext, ext: f.ext, start: startDir() }).then(function (path) {
      if (!path) return;
      if (!new RegExp('\\.' + f.ext + '$', 'i').test(path)) path += '.' + f.ext;
      WB.ui.status('exportando a ' + f.label + '…');
      var busy = WB.dlg.toast('Exportando…', 'info', 60000);
      return MAKE[id](path).then(function () {
        busy.remove();
        WB.ui.status('exportado: ' + path);
        return WB.dlg.show({
          kind: 'ok', title: 'Exportación terminada', message: f.label, detail: path,
          buttons: [{ id: 'open', label: 'Abrir el archivo' }, { id: 'ok', label: 'Aceptar', variant: 'primary', isDefault: true, isCancel: true }]
        }).then(function (b) { if (b === 'open') return WB.invoke('open_external', { path: path }); });
      }, function (err) { busy.remove(); throw err; });
    });
  };

  WB.actions['export'] = function (id, source) {
    if (!E.idoc) { WB.ui.status('abre antes una publicación'); return; }
    if (id) return X.run(id);
    WB.ui.popup(X.FORMATS.map(function (f) { return { icon: f.icon, label: f.label, action: 'export:' + f.id }; }),
      source && source.getBoundingClientRect ? source : document.getElementById('pageBar'));
  };
})();
