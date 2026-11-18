/* ==========================================================================
   weBlogger - el tipo de edicion: BLOG o PERIODICO / REVISTA.

   BLOG       para la web. Se guarda como carpeta con su HTML, CSS y
              JavaScript. Con varias paginas, el index.html las lleva todas
              seguidas, cada una con su estilo, y solo hay que deslizar para
              leerlas; las paginas que se editan van aparte, en fuentes/.
   PERIODICO  para imprimir: diarios, revistas y columnas en su tamaño de
              papel. Se edita sobre la hoja, con la linea de corte de cada
              hoja a la vista. Se guarda en el formato propio .weblog (un
              solo archivo) y se exporta a PDF del tamaño del papel y a Word.

   Formato .weblog: un ZIP sin comprimir con
     manifest.json                  formato, version, papel, titulo y paginas
     paginas/N.html, N.css, N.js    cada pagina tal como la guarda el editor
     imagenes/...                   las imagenes propias
   ========================================================================== */
(function () {
  'use strict';

  var E = WB.ed, D = WB.doc, A = WB.app, P = WB.panels, pub = WB.pub, S = WB.styles, X = WB.exp;
  var h = P.h;
  var MM = 96 / 25.4;   // pixeles CSS por milimetro

  var PAPERS = [
    { id: 'tabloide', name: 'Tabloide', mm: [280, 430], m: 10, desc: 'El de casi todos los diarios populares y regionales.' },
    { id: 'berlines', name: 'Berlinés', mm: [315, 470], m: 11, desc: 'El formato intermedio de muchos diarios europeos.' },
    { id: 'sabana', name: 'Sábana', mm: [375, 597], m: 12, desc: 'El gran formato de los diarios de referencia clásicos.' },
    { id: 'revista', name: 'Revista A4', mm: [210, 297], m: 9, desc: 'Revistas, boletines, suplementos y columnas.' },
    { id: 'magazine', name: 'Revista grande', mm: [230, 300], m: 9, desc: 'Semanarios y revistas de moda, de tamaño generoso.' },
    { id: 'a3', name: 'A3', mm: [297, 420], m: 10, desc: 'Para imprimir en cualquier impresora de oficina A3.' }
  ];

  var Ed = WB.edition = { PAPERS: PAPERS, pending: null };
  pub.medium = 'blog';
  pub.paper = 'tabloide';

  function paper(id) { return PAPERS.filter(function (p) { return p.id === (id || pub.paper); })[0] || PAPERS[0]; }
  Ed.paper = paper;
  Ed.paperName = function (id) { var p = paper(id); return p.name + ' ' + p.mm[0] + '×' + p.mm[1] + ' mm'; };
  function contentPx(p) { return { w: Math.round((p.mm[0] - 2 * p.m) * MM), h: Math.round((p.mm[1] - 2 * p.m) * MM) }; }
  function baseName(p) { return String(p || '').replace(/[\\/]+$/, '').split(/[\\/]/).pop(); }
  function isWeblog(p) { return /\.weblog$/i.test(String(p || '')); }

  /** Nombre libre para un .weblog nuevo en la biblioteca. */
  Ed.freeFile = function (slug) {
    function attempt(n) {
      var path = WB.join(A.root(), (n > 1 ? slug + '-' + n : slug) + '.weblog');
      return WB.invoke('path_exists', { path: path }).then(function (yes) { return yes ? attempt(n + 1) : path; });
    }
    return attempt(1);
  };

  /** Lo llama pub.opened: decide el tipo de la publicacion que se abre. */
  Ed.onOpened = function (path, isNew) {
    var p = isNew ? Ed.pending : null;
    Ed.pending = null;
    if (p) {
      pub.medium = p.medium || 'blog';
      if (p.paper) pub.paper = p.paper;
    } else {
      pub.medium = isWeblog(path) ? 'periodico' : 'blog';
    }
    // la pagina ya esta montada cuando se sabe el tipo: la vista se pone despues
    setTimeout(Ed.applyView, 0);
  };

  /* ============================================== vista: hoja o pantalla == */

  var stage = document.getElementById('stage');
  var overlay = document.getElementById('overlay');
  var guides = document.createElement('div');
  guides.className = 'sheet-guides';
  overlay.insertBefore(guides, overlay.firstChild);
  var paperView = false;

  Ed.applyView = function () {
    var d = E.idoc;
    if (pub.medium === 'periodico' && d) {
      var p = paper(), px = contentPx(p);
      E.setWidth(px.w);
      stage.classList.add('is-paper');
      d.documentElement.setAttribute('data-wb-paper', p.id);
      paperView = true;
    } else {
      if (d) d.documentElement.removeAttribute('data-wb-paper');
      stage.classList.remove('is-paper');
      if (paperView) E.setWidth(0);
      paperView = false;
    }
    drawGuides();
    if (pub.render) pub.render();
  };

  // la vista se rehace cada vez que se monta una pagina
  var baseMount = E.mount;
  E.mount = function () {
    return baseMount.apply(this, arguments).then(function (r) { Ed.applyView(); return r; });
  };

  /** Lineas rojas donde se corta cada hoja al imprimir. */
  /* --------------------------------------------------------------------------
     Donde corta de verdad cada hoja. Imita lo que hace el navegador al
     imprimir: una linea de texto nunca se parte (pasa entera a la hoja
     siguiente) y las piezas indivisibles (fotos, titulares, citas, breves...)
     pasan enteras. Cada columna corta por su sitio, asi que el corte se dibuja
     a trozos: uno por cada elemento que cruza la linea, a su altura real.
     -------------------------------------------------------------------------- */
  var KEEP = 'figure, .media-figure, .np-cover, .np-between-fig, img, blockquote, .editorial-quote, .wb-pull, .stat-card, .info-card, .np-brief, .np-opinion, .timeline-item, tr, .spec-pill-card, .gallery-item, .wb-art, .wb-byline, h1, h2, h3, h4, h5, .np-title, .np-tag, .section-kicker, .np-nameplate, .np-nav, .np-ticker';
  var TEXT = 'p, li, dd, dt, td, th, figcaption, cite, .np-deck';
  var cutCache = { key: '', cuts: [] };

  /** Lineas de texto de un elemento (en coordenadas del documento). */
  function lineRects(el, sy) {
    var r = el.ownerDocument.createRange();
    r.selectNodeContents(el);
    var out = [];
    Array.prototype.forEach.call(r.getClientRects(), function (q) {
      if (q.height < 2) return;
      var top = q.top + sy, bottom = q.bottom + sy;
      // los trozos de una misma linea se juntan
      var same = out.filter(function (o) { return Math.abs(o.top - top) < q.height * 0.5; })[0];
      if (same) { same.top = Math.min(same.top, top); same.bottom = Math.max(same.bottom, bottom); }
      else out.push({ top: top, bottom: bottom });
    });
    return out;
  }

  function computeCuts() {
    var d = E.idoc, w = d.defaultView, sy = w.scrollY;
    var sh = contentPx(paper()).h, total = d.documentElement.scrollHeight;
    var key = total + '|' + sh + '|' + d.body.innerHTML.length;
    if (cutCache.key === key) return cutCache.cuts;

    var keeps = Array.prototype.map.call(d.body.querySelectorAll(KEEP), function (el) {
      var r = el.getBoundingClientRect();
      return { el: el, top: r.top + sy, bottom: r.bottom + sy, left: r.left, right: r.right };
    }).filter(function (k) { return k.bottom - k.top > 0 && k.bottom - k.top < sh * 0.9; });
    var texts = Array.prototype.filter.call(d.body.querySelectorAll(TEXT), function (el) { return !el.closest(KEEP); });

    var cuts = [], start = 0;
    for (var n = 1; n < 400; n++) {
      var nominal = start + sh;
      if (nominal >= total) break;
      var segs = [];
      keeps.forEach(function (k) {
        if (k.top < nominal && k.bottom > nominal && k.top > start + 4) segs.push({ y: k.top, x0: k.left, x1: k.right });
      });
      texts.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top + sy >= nominal || r.bottom + sy <= nominal) return;
        // como al imprimir (orphans y widows a 3): nunca quedan menos de tres
        // lineas sueltas a un lado del corte; un parrafo corto pasa entero
        var ls = lineRects(el, sy).sort(function (a, b2) { return a.top - b2.top; });
        var k = -1;
        ls.forEach(function (l, j) { if (k < 0 && l.top < nominal && l.bottom > nominal) k = j; });
        if (k < 0) return;
        if (ls.length < 6 || k < 3) k = 0;
        else if (ls.length - k < 3) k = ls.length - 3;
        segs.push({ y: ls[k].top, x0: r.left, x1: r.right });
      });
      // un elemento dentro de otro que ya pasa entero no cuenta
      segs = segs.filter(function (s) {
        return !segs.some(function (o) { return o !== s && o.y < s.y && o.x0 <= s.x0 + 1 && o.x1 >= s.x1 - 1; });
      });
      var next = segs.length ? Math.min(nominal, Math.min.apply(null, segs.map(function (s) { return s.y; }))) : nominal;
      cuts.push({ n: n + 1, nominal: nominal, segs: segs });
      start = next;
    }
    cutCache = { key: key, cuts: cuts };
    return cuts;
  }

  function drawGuides() {
    guides.textContent = '';
    if (pub.medium !== 'periodico' || !E.idoc) return;
    var frame = document.getElementById('pageFrame');
    var f = frame.getBoundingClientRect(), s = stage.getBoundingClientRect();
    var sy = E.idoc.defaultView.scrollY, y0 = f.top - s.top, x0 = f.left - s.left;
    var add = function (cls, top, left, width, height, label) {
      var el = document.createElement('div');
      el.className = cls;
      el.style.top = Math.round(top) + 'px';
      el.style.left = Math.round(left) + 'px';
      el.style.width = Math.round(width) + 'px';
      if (height) el.style.height = Math.max(1, Math.round(height)) + 'px';
      if (label) el.setAttribute('data-label', label);
      guides.appendChild(el);
    };
    computeCuts().forEach(function (c) {
      var top = y0 + c.nominal - sy;
      if (top < y0 - 400 || top > s.height + 400) return;
      add('sheet-line', top, x0, f.width, 0, 'hoja ' + c.n);
      c.segs.forEach(function (g) {
        var gy = y0 + g.y - sy;
        // lo que sube a la hoja siguiente, sombreado; el corte real, en rojo
        add('sheet-moves', gy, x0 + g.x0, g.x1 - g.x0, c.nominal - g.y);
        add('sheet-cut', gy, x0 + g.x0, g.x1 - g.x0, 0);
      });
    });
  }
  Ed.cuts = function () { return E.idoc ? computeCuts() : []; };
  var baseRefresh = E.refresh;
  E.refresh = function () { baseRefresh.apply(this, arguments); drawGuides(); };

  function sheetsOf(doc) {
    if (!doc) return 0;
    return doc === E.idoc && pub.medium === 'periodico' ? computeCuts().length + 1 : Math.max(1, Math.ceil(doc.documentElement.scrollHeight / contentPx(paper()).h));
  }

  /** Lo llama la barra de paginas al pintarse. */
  Ed.decorateBar = function (bar) {
    if (pub.medium === 'periodico') {
      bar.appendChild(h('button', { type: 'button', class: 'pg-style pg-paper', title: 'Tamaño de papel de la publicación', onclick: function (ev) { paperMenu(ev.currentTarget); } }, [
        WB.ui.svgUse('ic-new'), h('span', { text: 'Papel: ' + Ed.paperName() + (E.idoc ? ' · ≈ ' + sheetsOf(E.idoc) + ' hojas' : '') })
      ]));
    }
    bar.appendChild(h('button', { type: 'button', class: 'pg-style', title: 'Ver todas las páginas seguidas (F5)', 'data-action': 'preview' }, [
      WB.ui.svgUse('ic-eye'), h('span', { text: 'Ver todas' })
    ]));
  };

  function paperMenu(anchor) {
    WB.ui.popup(PAPERS.map(function (p) {
      return { label: p.name + ' · ' + p.mm[0] + '×' + p.mm[1] + ' mm', action: 'paper:' + p.id, check: 'paper:' + p.id };
    }), anchor);
  }
  WB.ui.checks.paper = function (v) { return pub.paper === v; };
  WB.actions.paper = function (id) {
    pub.paper = paper(id).id;
    WB.ui.markDirty(true);
    Ed.applyView();
    WB.ui.status('papel: ' + Ed.paperName());
  };

  /* ===================================================== blog seguido ===== */

  /**
   * El index.html de un blog de varias paginas: todas seguidas, cada una
   * dentro de su contenedor con sus variables y los atributos de su estilo.
   * inline: hoja dentro de la pagina e imagenes del editor (vista previa).
   */
  function blogIndex(inline) {
    var e = WB.esc, parts = [], css = '', fonts = [], i18n = {}, credits = '';
    var first = pub.pages[0].s;
    pub.each(function (p, i, doc) {
      var s = p.s, n = i + 1, cls = 'wb-pg-' + n;
      var body = D.cleanBody(doc, inline);
      D.usedFonts(body.innerHTML).forEach(function (f) { if (fonts.indexOf(f) < 0) fonts.push(f); });
      var dict = D.exportI18n(doc);
      Object.keys(dict).forEach(function (l) { i18n[l] = Object.assign(i18n[l] || {}, dict[l]); });
      var v = D.varsCss();
      if (i === 0) css += v + '\n';   // la primera pagina pone tambien los colores del fondo
      css += '/* Página ' + n + ': ' + pub.nameOf(i) + ' */\n' +
        v.replace(':root', '.' + cls).replace('[data-theme="dark"]', 'html[data-theme="dark"] .' + cls) +
        D.formatCss() + (s.customCss || '') + '\n';
      parts.push('  <div class="wb-pg ' + cls + '" id="pagina-' + n + '" data-wb-page="' + e(pub.nameOf(i)) + '"' +
        (s.format ? ' data-wb-format="' + e(s.format) + '"' : '') + S.attrString(s) + '>\n' + body.innerHTML.trim() + '\n  </div>');
      if (!credits) credits = D.credits(doc);
    });

    var sheet = '/* Hoja de estilos de la lectura seguida, generada por weBlogger.\n   Las paginas para editar estan en fuentes/. */\n' + css + WB.tpl.css +
      '\n.wb-pg { font-family: var(--font-body); background: var(--bg-primary); color: var(--text-primary); line-height: 1.75; overflow-x: hidden; }\n' +
      '@media print { .wb-pg { break-after: page; } .wb-pg:last-child { break-after: auto; } }\n';
    var fontUrl = WB.fontsUrl(fonts);
    var html = '<!DOCTYPE html>\n<html lang="' + e(first.lang) + '" data-theme="' + first.startTheme + '" data-wb-key="' + e(first.key) + '" data-wb-medium="blog">\n<head>\n' +
      '  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
      '  <meta name="description" content="' + e(first.description) + '" />\n  <meta name="generator" content="weBlogger" />\n' +
      '  <title>' + e(first.title) + '</title>\n' +
      (fontUrl ? '  <link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n  <link href="' + e(fontUrl) + '" rel="stylesheet" />\n' : '') +
      (inline ? '  <style>\n' + sheet + '\n  </style>\n' : '  <link rel="stylesheet" href="css/estilos.css" />\n') +
      '</head>\n<body>\n\n' +
      (first.progress ? '  <div class="reading-progress" id="readingProgress"></div>\n\n' : '') +
      parts.join('\n\n') + '\n\n' + D.LIGHTBOX + '\n' +
      (inline ? '' : '  <script src="js/app.js"></script>\n') +
      '</body>\n</html>\n';
    var js = '/* Textos por idioma de todas las paginas. Lo escribe weBlogger. */\nwindow.WB_I18N = ' + JSON.stringify(i18n, null, 2) + '; /* WB:FIN-I18N */\n\n' + WB.tpl.js;
    return { html: html, css: sheet, js: js, credits: credits, i18n: i18n };
  }
  Ed.blogIndex = blogIndex;

  function writeAssets(folder, used) {
    var jobs = [];
    D.assets.forEach(function (a) {
      if (a.savedIn === folder || used.indexOf('"' + a.rel + '"') < 0) return;
      jobs.push(D.blobToB64(a.blob).then(function (b64) {
        return WB.invoke('write_b64', { path: WB.join(folder, a.rel), data: b64 });
      }).then(function () { a.savedIn = folder; }));
    });
    return Promise.all(jobs);
  }

  var basePubSave = pub.save;

  function saveBlog(folder) {
    var n = pub.pages.length;
    if (n === 1) {
      // una sola pagina: el index.html es la propia pagina, como siempre
      return basePubSave(folder).then(function () { return WB.invoke('clean_pages', { folder: folder, keepSources: 0, keepRoot: 1 }); });
    }
    var w = function (rel, text) { return WB.invoke('write_text', { path: WB.join(folder, rel), text: text }); };
    var jobs = [], used = '';
    pub.each(function (p, i, doc) {
      var f = pub.srcFiles(i), k = i + 1;
      p.s.path = folder;
      var html = D.buildHtml(doc, false, { css: 'pagina-' + k + '.css', js: 'pagina-' + k + '.js' });
      used += html;
      jobs.push(w(f.html, html), w(f.css, D.buildCss()), w(f.js, D.buildJs(doc)));
    });
    var idx = blogIndex(false);
    used += idx.html;
    jobs.push(w('index.html', idx.html), w('css/estilos.css', idx.css), w('js/app.js', idx.js));
    if (idx.credits) jobs.push(w('imagenes/creditos-imagenes.txt', idx.credits));
    // las paginas sueltas de una version anterior ya no hacen falta
    return Promise.all(jobs).then(function () { return writeAssets(folder, used); })
      .then(function () { return WB.invoke('clean_pages', { folder: folder, keepSources: n, keepRoot: 1 }); });
  }

  /* ========================================================= .weblog ===== */

  var MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif' };

  function weblogBytes() {
    var files = [], used = '';
    var man = {
      formato: 'weBlogger', version: 1, medio: 'periodico', paper: pub.paper, paperName: paper().name,
      title: pub.pages[0].s.title || '', guardado: new Date().toISOString(), pages: []
    };
    pub.each(function (p, i, doc) {
      var n = i + 1;
      var html = D.buildHtml(doc, false, { css: n + '.css', js: n + '.js' });
      used += html;
      files.push({ name: 'paginas/' + n + '.html', data: html }, { name: 'paginas/' + n + '.css', data: D.buildCss() }, { name: 'paginas/' + n + '.js', data: D.buildJs(doc) });
      man.pages.push({ n: n, name: pub.nameOf(i), style: p.s.style || '', html: 'paginas/' + n + '.html', css: 'paginas/' + n + '.css', js: 'paginas/' + n + '.js' });
    });
    var seen = {}, imgs = [];
    D.assets.forEach(function (a) {
      if (seen[a.rel] || used.indexOf('"' + a.rel + '"') < 0) return;
      seen[a.rel] = true;
      imgs.push(a);
    });
    return Promise.all(imgs.map(function (a) {
      return a.blob.arrayBuffer().then(function (buf) { files.push({ name: a.rel, data: new Uint8Array(buf) }); });
    })).then(function () {
      files.unshift({ name: 'manifest.json', data: JSON.stringify(man, null, 2) });
      return WB.office.zip(files);
    });
  }

  function saveWeblog(path) {
    return weblogBytes().then(function (bytes) {
      return WB.invoke('write_b64', { path: path, data: X.b64(bytes) });
    }).then(function () {
      pub.pages.forEach(function (p) { p.s.path = path; });
      D.assets.forEach(function (a) { a.savedIn = path; });
    });
  }

  pub.save = function (path) {
    return pub.medium === 'periodico' ? saveWeblog(path) : saveBlog(path);
  };

  /** Lee un ZIP (sin comprimir, o con deflate si lo ha tocado otro programa). */
  function unzip(bytes) {
    var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var eocd = -1;
    for (var i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) return Promise.reject(new Error('el archivo no es una publicación .weblog (no es un ZIP)'));
    var count = dv.getUint16(eocd + 10, true), p = dv.getUint32(eocd + 16, true);
    var dec = new TextDecoder('utf-8'), jobs = [], out = new Map();
    for (var k = 0; k < count; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) return Promise.reject(new Error('el archivo .weblog está dañado'));
      var method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true);
      var nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
      var name = dec.decode(bytes.subarray(p + 46, p + 46 + nl));
      var start = off + 30 + dv.getUint16(off + 26, true) + dv.getUint16(off + 28, true);
      var data = bytes.subarray(start, start + size);
      if (method === 0) out.set(name, data);
      else if (method === 8 && window.DecompressionStream) {
        jobs.push((function (nm, d) {
          return new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()
            .then(function (buf) { out.set(nm, new Uint8Array(buf)); });
        })(name, data));
      }
      p += 46 + nl + el + cl;
    }
    return Promise.all(jobs).then(function () { return out; });
  }

  function fromB64(b64) {
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function openWeblog(path) {
    var dec = new TextDecoder('utf-8');
    return WB.invoke('read_b64', { path: path }).then(function (b64) { return unzip(fromB64(b64)); }).then(function (files) {
      var text = function (n) { var b = files.get(n); return b ? dec.decode(b) : ''; };
      var man;
      try { man = JSON.parse(text('manifest.json')); } catch (e) { throw new Error('el archivo .weblog no tiene un manifiesto válido'); }
      if (!man || !Array.isArray(man.pages) || !man.pages.length) throw new Error('el archivo .weblog no tiene páginas');
      var urls = {};
      var url = function (rel) {
        if (!rel || !files.has(rel)) return null;
        if (!urls[rel]) {
          var ext = (/\.([a-z0-9]+)$/i.exec(rel) || [])[1] || '';
          var blob = new Blob([files.get(rel)], { type: MIME[ext.toLowerCase()] || 'application/octet-stream' });
          urls[rel] = { url: URL.createObjectURL(blob), blob: blob };
        }
        return urls[rel].url;
      };
      var stem = baseName(path).replace(/\.weblog$/i, '');
      var pages = man.pages.map(function (pg) {
        var parsed = D.parse(text(pg.html), text(pg.css), text(pg.js), stem);
        parsed.s.path = path;
        parsed.s.pageName = parsed.s.pageName || pg.name || '';
        var tmp = document.createElement('template');
        tmp.innerHTML = parsed.body;
        ['src', 'data-lightbox-src', 'poster'].forEach(function (attr) {
          tmp.content.querySelectorAll('[' + attr + ']').forEach(function (el) {
            var u = url(el.getAttribute(attr));
            if (u) el.setAttribute(attr, u);
          });
        });
        return { s: parsed.s, body: tmp.innerHTML };
      });
      Ed.pending = { medium: 'periodico', paper: man.paper || 'tabloide' };
      return A.openDoc({ s: pages[0].s, body: pages[0].body }, path, true).then(function () {
        // openDoc vacia las imagenes al empezar: se registran ahora
        Object.keys(urls).forEach(function (rel) { D.assets.set(urls[rel].url, { rel: rel, blob: urls[rel].blob, savedIn: path }); });
        pages.slice(1).forEach(function (p) { pub.pages.push(p); });
        pub.render();
        Ed.applyView();
        WB.ui.markDirty(false);
        WB.cfg.set(WB.cfg.K.last, path);
        WB.ui.status('abierto: ' + path + ' · ' + pages.length + ' páginas · ' + Ed.paperName());
      });
    });
  }
  Ed.openWeblog = openWeblog;

  /* ===================================================== abrir y guardar == */

  var baseOpen = A.openFolder;
  A.openFolder = function (path) {
    if (isWeblog(path)) {
      return A.confirmDiscard().then(function (ok) { if (ok) return openWeblog(path); });
    }
    return WB.invoke('path_exists', { path: WB.join(path, 'fuentes', 'pagina-1.html') }).then(function (multi) {
      if (!multi) return baseOpen(path);
      // blog de varias paginas: la pagina 1 para editar esta en fuentes/
      return A.confirmDiscard().then(function (ok) {
        if (!ok) return;
        var f = pub.srcFiles(0);
        var read = function (rel) { return WB.invoke('read_text', { path: WB.join(path, rel) }).catch(function () { return ''; }); };
        return Promise.all([read(f.html), read(f.css), read(f.js)]).then(function (r) {
          pub.sources = true;
          return A.openDoc(D.parse(r[0], r[1], r[2], baseName(path)), path, false);
        }).then(function () {
          pub.sources = false;
          WB.ui.status('abierto: ' + path + ' · ' + pub.pages.length + ' páginas');
        }, function (e) { pub.sources = false; throw e; });
      });
    });
  };

  var baseSaveAs = A.saveAs;
  A.saveAs = function () {
    if (!E.idoc) return Promise.resolve();
    if (pub.medium !== 'periodico') return baseSaveAs();
    return WB.dlg.prompt('Guardar como', 'Nombre del archivo .weblog dentro de la biblioteca.', baseName(D.s.path).replace(/\.weblog$/i, '') || D.slug(D.s.title)).then(function (name) {
      if (!name) return;
      return Ed.freeFile(D.slug(name)).then(function (path) {
        pub.pages.forEach(function (p) { p.s.path = path; });
        return A.save();
      });
    });
  };
  WB.actions['save-as'] = A.saveAs;

  /** Cambia el tipo de una publicacion abierta. La proxima vez se guarda en el sitio nuevo. */
  Ed.convert = function (medium) {
    if (!E.idoc || pub.medium === medium) return Promise.resolve();
    var slug = D.slug(pub.pages[0].s.title || baseName(D.s.path).replace(/\.weblog$/i, ''));
    var where = medium === 'periodico' ? Ed.freeFile(slug) : A.freeFolder(slug);
    return where.then(function (path) {
      pub.medium = medium;
      pub.pages.forEach(function (p) { p.s.path = path; });
      D.assets.forEach(function (a) { a.savedIn = null; });
      WB.ui.markDirty(true);
      Ed.applyView();
      A.syncTitle();
      WB.dlg.toast(medium === 'periodico' ? 'Ahora es un periódico: se guardará como ' + baseName(path) : 'Ahora es un blog: se guardará en la carpeta ' + baseName(path), 'ok', 3200);
    });
  };

  /* ===================================================== vista previa ===== */

  var preview = document.getElementById('preview');
  var previewFrame = document.getElementById('previewFrame');

  function showPreview(html, dict, sheetW) {
    preview.hidden = false;
    previewFrame.onload = function () {
      previewFrame.onload = null;
      var pd = previewFrame.contentDocument;
      if (dict) {
        previewFrame.contentWindow.WB_I18N = dict;
        var sc = pd.createElement('script');
        sc.src = 'plantilla/app.js';
        pd.body.appendChild(sc);
      }
      if (sheetW) {
        var st = pd.createElement('style');
        st.textContent = 'html,body{background:#5b6068!important}body{padding:28px 0}.wb-pg{width:' + sheetW + 'px;max-width:calc(100% - 24px);margin:0 auto 28px;box-shadow:0 14px 40px #0009}';
        pd.head.appendChild(st);
      }
      pd.addEventListener('click', function (ev) {
        var a = ev.target.closest ? ev.target.closest('a[href]') : null;
        if (!a || a.getAttribute('href').charAt(0) === '#') return;
        ev.preventDefault();
        WB.dlg.toast('Enlace a ' + a.getAttribute('href'), 'info', 2600);
      }, true);
      pd.addEventListener('dblclick', function (ev) {
        var pg = ev.target.closest ? ev.target.closest('.wb-pg') : null;
        if (!pg) return;
        var i = Array.prototype.indexOf.call(pd.querySelectorAll('.wb-pg'), pg);
        A.previewClose();
        pub.go(i).then(function () { WB.ui.status('editando la página ' + (i + 1) + ': ' + pub.nameOf(i)); });
      });
      pd.addEventListener('keydown', function (ev) {
        var k = (ev.key || '').toLowerCase();
        if ((ev.key === 'Escape' && !pd.querySelector('.lightbox.open, .wb-modal.open')) || k === 'f5') { ev.preventDefault(); A.previewClose(); }
        else if ((ev.ctrlKey || ev.metaKey) && k === 's') { ev.preventDefault(); A.save().catch(WB.ui.fail); }
      });
    };
    previewFrame.srcdoc = html;
  }

  var basePreview = A.preview;
  A.preview = function () {
    if (!E.idoc) return;
    if (pub.medium === 'periodico') {
      return X.combined('').then(function (html) { showPreview(html, null, contentPx(paper()).w); });
    }
    if (pub.pages.length < 2) return basePreview();
    var idx = blogIndex(true);
    showPreview(idx.html, idx.i18n, 0);
  };

  /* ===================================================== exportaciones ==== */

  var baseFormats = X.FORMATS;
  Object.defineProperty(X, 'FORMATS', {
    configurable: true,
    get: function () {
      var own = { id: 'weblog', ext: 'weblog', label: 'weBlogger (.weblog)', icon: 'ic-save' };
      var press = { id: 'imprenta', ext: 'pdf', label: 'PDF para imprenta (sangrado, marcas de corte, CMYK)…', icon: 'ic-new' };
      if (pub.medium === 'periodico') {
        var p = paper();
        return [press, { id: 'pdf-papel', ext: 'pdf', label: 'PDF · ' + p.name + ' ' + p.mm[0] + '×' + p.mm[1] + ' mm (impresora de oficina)', icon: 'ic-new' }]
          .concat(baseFormats.filter(function (f) { return f.id === 'docx' || f.id === 'doc'; }), [own],
            baseFormats.filter(function (f) { return ['docx', 'doc'].indexOf(f.id) < 0; }));
      }
      return [press].concat(baseFormats, [own]);
    }
  });
  X.MAKE['pdf-papel'] = function (path) {
    var p = paper();
    return X.combined({ size: p.mm[0] + 'mm ' + p.mm[1] + 'mm', margin: p.m + 'mm' }).then(function (html) {
      return WB.invoke('export_pdf', { html: html, pdf: path });
    });
  };
  X.MAKE.weblog = function (path) {
    return weblogBytes().then(function (bytes) { return WB.invoke('write_b64', { path: path, data: X.b64(bytes) }); });
  };

  WB.actions.browser = function () {
    if (!E.idoc) return;
    if (pub.medium === 'periodico') {
      WB.ui.status('un periódico se ve como se imprimirá: F5, o Exportar → PDF');
      return A.preview();
    }
    var go = function () { return WB.invoke('open_external', { path: WB.join(D.s.path, 'index.html') }); };
    return (document.getElementById('dirtyFlag').hidden ? Promise.resolve() : A.save()).then(go);
  };
  WB.actions['reveal-doc'] = function () {
    if (!E.idoc) return;
    var p = D.s.path;
    return WB.invoke('open_external', { path: isWeblog(p) ? String(p).replace(/[\\/][^\\/]*$/, '') : p });
  };


  /* ================================================== PDF para imprenta === */
  // Cada pagina se imprime aparte a su tamaño final mas el sangrado; el
  // backend (src-tauri/src/imprenta.rs) añade la zona de marcas, las cajas
  // TrimBox y BleedBox, las marcas de corte y registro, la barra de color,
  // pasa el color a CMYK, comprueba las fuentes y une las paginas.

  var PRESS_KEY = 'wb.imprenta';
  function pressPrefs() {
    var d = { paper: pub.paper, bleed: 3, cropMarks: true, registration: true, colorBar: true, cmyk: true, paperColor: false };
    try { return Object.assign(d, JSON.parse(localStorage.getItem(PRESS_KEY) || '{}'), { paper: pub.medium === 'periodico' ? pub.paper : (JSON.parse(localStorage.getItem(PRESS_KEY) || '{}').paper || pub.paper) }); } catch (e) { return d; }
  }

  function pressDialog() {
    var o = pressPrefs();
    var row = function (label, control, help) {
      return h('label', { class: 'field' + (control.type === 'checkbox' ? ' check' : '') }, control.type === 'checkbox'
        ? [control, h('span', null, [label, help ? h('small', { class: 'press-help', text: help }) : null])]
        : [h('span', { text: label }), control]);
    };
    var selPaper = h('select', { class: 'input' }, PAPERS.map(function (p) { return h('option', { value: p.id, text: p.name + ' · ' + p.mm[0] + '×' + p.mm[1] + ' mm' }); }));
    selPaper.value = o.paper;
    var selBleed = h('select', { class: 'input' }, [3, 4, 5].map(function (n) { return h('option', { value: String(n), text: n + ' mm' }); }));
    selBleed.value = String(o.bleed);
    var chk = function (v) { var c = h('input', { type: 'checkbox' }); c.checked = !!v; return c; };
    var cCrop = chk(o.cropMarks), cReg = chk(o.registration), cBar = chk(o.colorBar), cCmyk = chk(o.cmyk), cPaper = chk(o.paperColor);
    var body = h('div', { class: 'press-form' }, [
      h('div', { class: 'press-cols' }, [row('Formato final (corte)', selPaper), row('Sangrado', selBleed)]),
      row('Marcas de corte', cCrop, 'en las cuatro esquinas, por fuera del sangrado'),
      row('Marcas de registro', cReg, 'dianas en el centro de cada lado'),
      row('Barra de color', cBar, 'parches C, M, Y, K al 100 % y al 50 % en el margen inferior'),
      row('Convertir a CMYK', cCmyk, 'texto negro a una sola tinta, carga máxima de tinta 300 %'),
      row('Imprimir el color de fondo del papel', cPaper, 'desactivado, el fondo queda sin tinta: el color lo da el papel de la bobina'),
      h('p', { class: 'pnote', text: 'Las fuentes van incrustadas. La conversión a CMYK es genérica, sin perfil ICC: para un PDF/X certificado, la imprenta aplicará su perfil al recibirlo.' })
    ]);
    return WB.dlg.show({
      kind: 'info', title: 'PDF para imprenta', wide: 560, body: body,
      buttons: [{ id: 'no', label: 'Cancelar', isCancel: true }, { id: 'ok', label: 'Crear el PDF…', variant: 'primary', isDefault: true }]
    }).then(function (id) {
      if (id !== 'ok') return null;
      var r = { paper: selPaper.value, bleed: +selBleed.value, cropMarks: cCrop.checked, registration: cReg.checked, colorBar: cBar.checked, cmyk: cCmyk.checked, paperColor: cPaper.checked };
      try { localStorage.setItem(PRESS_KEY, JSON.stringify(r)); } catch (e) {}
      return r;
    });
  }

  function pressReport(rep, path) {
    var ok = function (good, text) { return h('li', { class: good ? 'is-ok' : 'is-warn' }, [h('b', { text: good ? '✓' : '!' }), h('span', { text: text })]); };
    var items = [
      ok(true, rep.pages + ' páginas · formato final ' + Math.round(rep.trimMm[0]) + '×' + Math.round(rep.trimMm[1]) + ' mm · sangrado ' + rep.bleedMm + ' mm'),
      ok(rep.fontsEmbedded === rep.fontsTotal, 'Fuentes incrustadas: ' + rep.fontsEmbedded + ' de ' + rep.fontsTotal + (rep.fontsMissing.length ? ' (faltan: ' + rep.fontsMissing.join(', ') + ')' : '')),
      rep.cmyk === false ? ok(true, 'Color: se ha dejado en RGB') :
        ok(!rep.imagesLeftRgb && !rep.shadingsLeft, 'Color CMYK: ' + rep.colorsConverted + ' colores y ' + rep.shadingsConverted + ' degradados convertidos · imágenes en CMYK: ' + rep.imagesCmyk + ' de ' + rep.imagesTotal + (rep.imagesLeftRgb ? ' (' + rep.imagesLeftRgb + ' siguen en RGB)' : ''))
    ];
    // que una pagina larga ocupe varias hojas es normal: es un dato, no un aviso
    var sheets = [];
    (rep.warnings || []).forEach(function (w) {
      var m = /pagina (\d+) de la publicacion no cabe en una hoja y ha salido en (\d+)/i.exec(w);
      if (m) sheets.push('la ' + m[1] + ' en ' + m[2]);
      else items.push(ok(false, w));
    });
    if (sheets.length) items.splice(1, 0, ok(true, 'Páginas que ocupan varias hojas: ' + sheets.join(', ') + '.'));
    var all = items.every(function (li) { return li.classList.contains('is-ok'); });
    return WB.dlg.show({
      kind: all ? 'ok' : 'warn', title: all ? 'PDF listo para imprenta' : 'PDF creado, con avisos', wide: 600,
      body: h('div', null, [h('ul', { class: 'press-report' }, items), h('p', { class: 'pnote', text: path })]),
      buttons: [{ id: 'open', label: 'Abrir el PDF' }, { id: 'ok', label: 'Aceptar', variant: 'primary', isDefault: true, isCancel: true }]
    }).then(function (b) { if (b === 'open') return WB.invoke('open_external', { path: path }); });
  }

  Ed.pressExport = function () {
    if (!E.idoc) { WB.ui.status('abre antes una publicación'); return Promise.resolve(); }
    var o;
    return pressDialog().then(function (r) {
      if (!r) return null;
      o = r;
      var name = (baseName(pub.pages[0].s.path).replace(/\.weblog$/i, '') || D.slug(pub.pages[0].s.title)) + '-imprenta.pdf';
      var dir = String(pub.pages[0].s.path || '').replace(/[\\/][^\\/]*$/, '');
      return WB.invoke('pick_save', { name: name, ext: 'pdf', start: dir });
    }).then(function (path) {
      if (!path) return;
      if (!/\.pdf$/i.test(path)) path += '.pdf';
      var p = paper(o.paper), b = o.bleed;
      var pageCss = { size: (p.mm[0] + 2 * b) + 'mm ' + (p.mm[1] + 2 * b) + 'mm', margin: (p.m + b) + 'mm' };
      var htmls = [];
      var chain = Promise.resolve();
      pub.pages.forEach(function (pg, i) {
        chain = chain.then(function () {
          var bg = o.paperColor ? (pg.s.palette && pg.s.palette.light ? pg.s.palette.light.bgPrimary : '#ffffff') : '#ffffff';
          var extra = 'html, body { background: ' + bg + ' !important; }\n' +
            (o.paperColor ? '' : '.wb-pg { background: transparent !important; }\n') +
            '.wb-pg { break-after: auto !important; }';
          return X.combined(pageCss, i, extra).then(function (html) { htmls.push(html); });
        });
      });
      var busy = WB.dlg.toast('Preparando el PDF para imprenta: ' + pub.pages.length + ' páginas…', 'info', 120000);
      return chain.then(function () {
        return WB.invoke('export_press_pdf', {
          pages: htmls, pdf: path,
          opts: { trimW: p.mm[0], trimH: p.mm[1], bleed: b, slug: 10, cropMarks: o.cropMarks, registration: o.registration, colorBar: o.colorBar, cmyk: o.cmyk, title: pub.pages[0].s.title || '' }
        });
      }).then(function (rep) {
        busy.remove();
        rep.cmyk = o.cmyk;
        WB.ui.status('PDF para imprenta: ' + path);
        return pressReport(rep, path);
      }, function (err) { busy.remove(); throw err; });
    }).catch(WB.ui.fail);
  };

  var baseExportAction = WB.actions['export'];
  WB.actions['export'] = function (id, source) {
    if (id === 'imprenta') return Ed.pressExport();
    return baseExportAction(id, source);
  };
  WB.actions.press = Ed.pressExport;

  /* ============================================ elegir la nueva edicion === */

  var chooser = null, inTitle, paperBox, chosenPaper = 'tabloide';

  function paperCard(p) {
    var ratio = p.mm[0] / p.mm[1];
    var shape = h('i', { class: 'ed-sheet' });
    shape.style.width = Math.round(46 * ratio) + 'px';
    var b = h('button', { type: 'button', class: 'ed-paper' + (p.id === chosenPaper ? ' is-sel' : ''), title: p.desc }, [
      shape, h('b', { text: p.name }), h('small', { text: p.mm[0] + '×' + p.mm[1] + ' mm' })
    ]);
    b.addEventListener('click', function () {
      chosenPaper = p.id;
      paperBox.querySelectorAll('.ed-paper').forEach(function (x) { x.classList.toggle('is-sel', x === b); });
    });
    b.addEventListener('dblclick', function () { go('periodico'); });
    return b;
  }

  function buildChooser() {
    inTitle = h('input', { type: 'text', class: 'input ed-title', placeholder: 'Por ejemplo: La Gaceta de Portalba · número 1', spellcheck: false, autocomplete: 'off' });
    paperBox = h('div', { class: 'ed-papers' }, PAPERS.map(paperCard));

    var blog = h('section', { class: 'ed-card ed-blog' }, [
      h('div', { class: 'ed-icon' }, [WB.ui.svgUse('ic-globe')]),
      h('h3', { text: 'Blog' }),
      h('p', { text: 'Para la web. Todas las páginas se leen seguidas: solo hay que deslizar. Se guarda como sitio web, con su HTML, su CSS y su JavaScript, listo para publicar.' }),
      h('ul', { class: 'ed-points' }, [
        h('li', { text: 'Lectura continua en pantalla, claro y oscuro' }),
        h('li', { text: 'Varios idiomas, ventanas, galerías y vídeo' }),
        h('li', { text: 'También exporta a PDF, Word y EPUB' })
      ]),
      h('div', { class: 'ed-actions' }, [
        h('button', { type: 'button', class: 'btn btn-primary', text: 'Con un estilo de prensa…', onclick: function () { go('blog'); } }),
        h('button', { type: 'button', class: 'btn', text: 'Con una plantilla de blog…', onclick: function () { WB.tplPick.open(inTitle.value.trim()); } })
      ])
    ]);

    var paperCardEl = h('section', { class: 'ed-card ed-print' }, [
      h('div', { class: 'ed-icon' }, [WB.ui.svgUse('ic-masthead')]),
      h('h3', { text: 'Periódico o revista' }),
      h('p', { text: 'Para imprimir: diarios, revistas y columnas de opinión en su tamaño de papel. Se maqueta sobre la hoja, viendo dónde corta cada una. Se guarda en formato .weblog y se exporta a PDF y Word.' }),
      h('span', { class: 'ed-label', text: 'Tamaño del papel' }),
      paperBox,
      h('div', { class: 'ed-actions' }, [
        h('button', { type: 'button', class: 'btn btn-primary', text: 'Elegir el estilo del periódico…', onclick: function () { go('periodico'); } })
      ])
    ]);

    chooser = h('div', { class: 'edition', hidden: true }, [
      h('div', { class: 'ed-box' }, [
        h('header', { class: 'ed-head' }, [
          h('div', null, [h('h2', { text: 'Nueva edición' }), h('p', { text: '¿Qué vas a publicar?' })]),
          h('button', { type: 'button', class: 'btn', text: 'Cerrar (Esc)', onclick: Ed.closeChooser })
        ]),
        h('label', { class: 'ed-field' }, [h('span', { text: 'Titular de portada o nombre de la edición' }), inTitle]),
        h('div', { class: 'ed-cards' }, [blog, paperCardEl])
      ])
    ]);
    document.body.appendChild(chooser);

  }

  function go(medium) {
    var name = inTitle.value.trim();
    Ed.closeChooser();
    WB.gallery.open('article', { medium: medium, paper: medium === 'periodico' ? chosenPaper : null, name: name });
  }

  Ed.openChooser = function () {
    if (!chooser) buildChooser();
    WB.ui.closeMenus();
    if (WB.gallery && WB.gallery.close) WB.gallery.close();
    chooser.hidden = false;
    inTitle.value = '';
    inTitle.focus();
  };
  Ed.closeChooser = function () { if (chooser) chooser.hidden = true; };

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && chooser && !chooser.hidden && document.getElementById('dialogLayer').hidden) {
      ev.preventDefault();
      ev.stopPropagation();
      Ed.closeChooser();
    }
  }, true);

  WB.actions.edition = Ed.openChooser;
  WB.actions['new'] = Ed.openChooser;
  var baseGallery = WB.actions.gallery;
  WB.actions.gallery = function (m) {
    if (!m || m === 'article') return Ed.openChooser();
    return baseGallery(m);
  };
  WB.actions.medium = function (m) { return Ed.convert(m); };
  WB.ui.checks.medium = function (v) { return !!E.idoc && pub.medium === v; };

  // abrir con doble clic un .weblog desde el explorador
  setTimeout(function () {
    WB.invoke('startup_file').then(function (path) {
      if (path) return A.openFolder(path);
    }).catch(function () {});
  }, 1200);
})();
