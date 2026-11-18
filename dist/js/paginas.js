/* ==========================================================================
   weBlogger - publicaciones de varias paginas.

   Una publicacion es una carpeta. La primera pagina es index.html (con
   css/estilos.css y js/app.js); las demas son pagina-2.html, pagina-3.html...
   cada una con su hoja y su script propios, porque cada pagina puede llevar un
   estilo distinto. Al guardar, todas reciben abajo un paginador para pasar de
   una a otra.

   En el editor solo hay una pagina montada: las demas esperan guardadas como
   texto y se montan al cambiar de pestaña.
   ========================================================================== */
(function () {
  'use strict';

  var E = WB.ed, D = WB.doc, A = WB.app, P = WB.panels;
  var h = P.h;
  var bar = document.getElementById('pageBar');
  var pub = WB.pub = { pages: [], cur: 0 };

  function files(i) {
    return i === 0
      ? { html: 'index.html', css: 'css/estilos.css', js: 'js/app.js' }
      : { html: 'pagina-' + (i + 1) + '.html', css: 'css/pagina-' + (i + 1) + '.css', js: 'js/pagina-' + (i + 1) + '.js' };
  }
  pub.files = files;

  function nameOf(p, i) {
    return p.s.pageName || (i === 0 ? 'Portada' : 'Página ' + (i + 1));
  }
  pub.nameOf = function (i) { return nameOf(pub.pages[i], i); };

  /** Documento suelto con el cuerpo de una pagina que no esta montada. */
  function looseDoc(body) {
    var d = document.implementation.createHTMLDocument('');
    d.body.innerHTML = body;
    return d;
  }

  /** Recorre las paginas con D.s apuntando a cada una y su documento. */
  pub.each = function (fn) {
    stash();
    var keep = D.s;
    try {
      pub.pages.forEach(function (p, i) {
        D.s = p.s;
        var doc = i === pub.cur ? E.idoc : looseDoc(p.body);
        fn(p, i, doc);
        if (i !== pub.cur) p.body = doc.body.innerHTML;
      });
    } finally { D.s = keep; }
  };

  function stash() {
    var p = pub.pages[pub.cur];
    if (!p || !E.idoc) return;
    p.s = D.s;
    p.body = E.idoc.body.innerHTML;
  }

  pub.clear = function () {
    pub.pages = [];
    pub.cur = 0;
    render();
  };

  /** La aplicacion acaba de abrir un articulo: es la pagina 1. Busca las demas. */
  /** Paginas para editar de un blog de varias paginas (el index.html es la lectura seguida). */
  function srcFiles(i) {
    var n = i + 1;
    return { html: 'fuentes/pagina-' + n + '.html', css: 'fuentes/pagina-' + n + '.css', js: 'fuentes/pagina-' + n + '.js' };
  }
  pub.srcFiles = srcFiles;

  pub.opened = function (folder, isNew) {
    if (WB.edition) WB.edition.onOpened(folder, isNew);
    pub.pages = [{ s: D.s, body: '' }];
    pub.cur = 0;
    render();
    if (isNew || !folder) return Promise.resolve();
    var name = String(folder).replace(/[\\/]+$/, '').split(/[\\/]/).pop();

    var fromSources = pub.sources;
    function next(i) {
      var f = fromSources ? srcFiles(i) : files(i);
      var read = function (rel) { return WB.invoke('read_text', { path: WB.join(folder, rel) }).catch(function () { return ''; }); };
      return WB.invoke('path_exists', { path: WB.join(folder, f.html) }).then(function (yes) {
        if (!yes) return;
        return Promise.all([read(f.html), read(f.css), read(f.js)]).then(function (r) {
          if (!r[0]) return;
          var parsed = D.parse(r[0], r[1], r[2], name);
          parsed.s.path = folder;
          var tmp = document.createElement('template');
          tmp.innerHTML = parsed.body;
          return D.loadLocalImages(tmp.content, folder).then(function () {
            pub.pages.push({ s: parsed.s, body: tmp.innerHTML });
            return next(i + 1);
          });
        });
      });
    }
    return next(1).then(render).then(function () { if (WB.edition) WB.edition.applyView(); });
  };

  function mountCurrent() {
    var p = pub.pages[pub.cur];
    D.s = p.s;
    return E.mount(p.body).then(function () {
      WB.hist.reset();
      WB.fmt.reset();
      A.syncLangs();
      A.syncTitle();
      P.renderAll();
      render();
    });
  }

  pub.go = function (i) {
    if (i === pub.cur || !pub.pages[i]) return Promise.resolve();
    stash();
    pub.cur = i;
    return mountCurrent().then(function () {
      WB.ui.status('página ' + (i + 1) + ' de ' + pub.pages.length + ': ' + pub.nameOf(i));
    });
  };

  /** Pagina nueva detras de la actual, compuesta con una ficha de estilo. */
  pub.add = function (st, name) {
    if (!E.idoc) return Promise.resolve();
    stash();
    var first = pub.pages[0].s;
    var s = D.blank();
    s.path = first.path;
    s.key = first.key + '-p' + (pub.pages.length + 1) + WB.uid();
    s.title = name;
    s.pageName = name;
    s.lang = s.editLang = first.lang;
    WB.styles.apply(s, st);
    pub.pages.splice(pub.cur + 1, 0, { s: s, body: WB.styles.build(st, name) });
    pub.cur++;
    WB.ui.markDirty(true);
    return mountCurrent().then(function () { WB.ui.status('página nueva: ' + name + ' · estilo ' + st.name); });
  };

  /* ------------------------------------------------------------------------
     Pagina interior de periodico, como en los programas de maquetacion: no
     pide titulo, no repite la portada ni trae titulares de muestra. Hereda
     el estilo de la pagina actual (la «pagina maestra»): arriba la cabecera
     del periodico en pequeño, con la misma letra y filetes que la de la
     portada, y debajo cuerpo de lectura corrido en columnas.
     ------------------------------------------------------------------------ */
  var READ = [
    'Escribe aquí el texto de la página. Es cuerpo de lectura: corre de una columna a la siguiente sin que tengas que hacer nada, y donde se corta cada hoja al imprimir se ve una línea roja.',
    'Pulsa Intro para empezar un párrafo nuevo. Si necesitas un titular, un ladillo, una foto o una cita, añádelos desde Elementos y quedarán encajados entre las columnas.'
  ];
  var COLS = { sabana: 6, berlines: 5, tabloide: 5, a3: 5, revista: 3, magazine: 3 };

  function fillerBody(s, n) {
    var e = WB.esc, st = WB.styles.byId[s.style];
    // la cabecera tal como esta en la portada (stash ya guardo la pagina actual)
    var front = looseDoc(pub.pages[0].body);
    var plate = front.querySelector('.np-nameplate');
    var nameEl = front.querySelector('.np-nameplate-name, .np-masthead, .masthead-name');
    var mast = (nameEl && nameEl.textContent.trim()) || (st ? st.mast : (pub.pages[0].s.title || 'El periódico'));
    var fecha = WB.styles.ctx && st ? WB.styles.ctx(st, '').fecha : new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var cls = plate ? plate.className.replace(/\bnp-mini\b/g, '').trim() : 'np-nameplate';
    var cols = COLS[pub.paper] || 4;
    return '<main class="article-wrapper no-toc np-wide"><article class="article-content">' +
      '<section class="article-section np-interior" id="pagina-' + n + '-' + WB.uid() + '">' +
        '<div class="' + e(cls) + ' np-mini"><h2 class="np-nameplate-name">' + e(mast) + '</h2>' +
          '<div class="np-nameplate-line"><span>Página ' + n + '</span><span>' + e(fecha) + '</span><span>Sección</span></div></div>' +
        '<div class="wb-flow" data-wb-slot style="column-count:' + cols + '">' +
          READ.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
        '</div>' +
      '</section></article></main>';
  }

  /** Pagina interior detras de la actual, con el estilo de la actual. */
  pub.addFiller = function () {
    if (!E.idoc) return Promise.resolve();
    stash();
    var base = pub.pages[pub.cur].s, n = pub.cur + 2;
    var s = JSON.parse(JSON.stringify(base));
    s.key = pub.pages[0].s.key + '-p' + (pub.pages.length + 1) + WB.uid();
    s.pageName = 'Página ' + n;
    delete s.estado;
    pub.pages.splice(pub.cur + 1, 0, { s: s, body: fillerBody(s, n) });
    pub.cur++;
    WB.ui.markDirty(true);
    return mountCurrent().then(function () { WB.ui.status('página ' + n + ' añadida, con el estilo de la anterior: rellénala'); });
  };

  pub.duplicate = function (i) {
    stash();
    var p = pub.pages[i];
    var s = JSON.parse(JSON.stringify(p.s));
    s.key = pub.pages[0].s.key + '-p' + (pub.pages.length + 1) + WB.uid();
    s.pageName = nameOf(p, i) + ' (copia)';
    pub.pages.splice(i + 1, 0, { s: s, body: p.body });
    pub.cur = i + 1;
    WB.ui.markDirty(true);
    return mountCurrent();
  };

  pub.remove = function (i) {
    if (pub.pages.length < 2) { WB.ui.status('una publicación tiene al menos una página'); return Promise.resolve(); }
    return WB.dlg.confirm('Quitar la página', 'Se quitará «' + pub.nameOf(i) + '» de la publicación. Al guardar desaparecerá también del disco.', 'warn').then(function (ok) {
      if (!ok) return;
      if (i !== pub.cur) stash();
      pub.pages.splice(i, 1);
      pub.cur = Math.min(i === pub.cur ? i : (i < pub.cur ? pub.cur - 1 : pub.cur), pub.pages.length - 1);
      WB.ui.markDirty(true);
      return mountCurrent();
    });
  };

  /** Lleva la pagina `from` a la posicion `to` (arrastrar en el panel de articulos). */
  pub.moveTo = function (from, to) {
    if (from === to || !pub.pages[from] || to < 0 || to >= pub.pages.length) return;
    stash();
    var cur = pub.pages[pub.cur];
    var p = pub.pages.splice(from, 1)[0];
    pub.pages.splice(to, 0, p);
    pub.cur = pub.pages.indexOf(cur);
    WB.ui.markDirty(true);
    render();
    WB.ui.status('«' + nameOf(p, to) + '» pasa a ser la página ' + (to + 1) + (to === 0 ? ' (portada: se guardará como index.html)' : ''));
  };

  pub.move = function (i, dir) {
    var j = i + dir;
    if (j < 0 || j >= pub.pages.length) return;
    stash();
    var p = pub.pages.splice(i, 1)[0];
    pub.pages.splice(j, 0, p);
    if (pub.cur === i) pub.cur = j; else if (pub.cur === j) pub.cur = i;
    WB.ui.markDirty(true);
    render();
  };

  pub.rename = function (i) {
    return WB.dlg.prompt('Nombre de la página', 'Aparece en la pestaña y en el paginador de la publicación.', pub.nameOf(i)).then(function (v) {
      if (!v || !v.trim()) return;
      pub.pages[i].s.pageName = v.trim();
      WB.ui.markDirty(true);
      render();
    });
  };

  /** Cambia el estilo de la pagina actual sin tocar lo que hay escrito. */
  pub.restyle = function (st) {
    if (!E.idoc) return;
    WB.styles.apply(D.s, st);
    E.applyVars();
    WB.art.renderAll(E.idoc, true);
    E.commit('estilo: ' + st.name);
    P.renderPage();
    render();
  };

  /* ============================================================ guardar == */

  function pager(i, names) {
    var e = WB.esc, out = '<nav class="wb-pager" aria-label="Páginas de la publicación">';
    out += i > 0 ? '<a href="' + files(i - 1).html + '" rel="prev">‹ Anterior</a>' : '<span class="is-off">‹ Anterior</span>';
    names.forEach(function (n, j) {
      out += j === i ? '<span class="is-current" title="' + e(n) + '">' + (j + 1) + '</span>'
        : '<a href="' + files(j).html + '" title="' + e(n) + '">' + (j + 1) + '</a>';
    });
    out += i < names.length - 1 ? '<a href="' + files(i + 1).html + '" rel="next">Siguiente ›</a>' : '<span class="is-off">Siguiente ›</span>';
    return out + '</nav>';
  }

  pub.save = function (folder) {
    var names = pub.pages.map(nameOf);
    var jobs = [], all = '', credits = '';
    var w = function (rel, text) { return WB.invoke('write_text', { path: WB.join(folder, rel), text: text }); };

    pub.each(function (p, i, doc) {
      var f = files(i);
      p.s.path = folder;
      var html = D.buildHtml(doc, false, { css: f.css, js: f.js, pager: names.length > 1 ? pager(i, names) : '' });
      all += html;
      jobs.push(w(f.html, html), w(f.css, D.buildCss()), w(f.js, D.buildJs(doc)));
      if (!credits) credits = D.credits(doc);
    });
    if (credits) jobs.push(w('imagenes/creditos-imagenes.txt', credits));

    D.assets.forEach(function (a) {
      if (a.savedIn === folder || all.indexOf('"' + a.rel + '"') < 0) return;
      jobs.push(D.blobToB64(a.blob).then(function (b64) {
        return WB.invoke('write_b64', { path: WB.join(folder, a.rel), data: b64 });
      }).then(function () { a.savedIn = folder; }));
    });

    // paginas que ya no existen: sus archivos sobran, y al reabrir volverian
    function prune(n) {
      return WB.invoke('path_exists', { path: WB.join(folder, files(n - 1).html) }).then(function (yes) {
        if (!yes) return;
        return WB.invoke('remove_page', { folder: folder, number: n }).then(function () { return prune(n + 1); });
      });
    }
    return Promise.all(jobs).then(function () { return prune(pub.pages.length + 1); });
  };

  A.save = function () {
    if (!E.idoc) return Promise.resolve();
    var folder = D.s.path || pub.pages[0].s.path;
    if (!folder) return A.saveAs();
    return pub.save(folder).then(function () {
      WB.ui.markDirty(false);
      WB.cfg.set(WB.cfg.K.last, folder);
      WB.ui.status('guardado en ' + folder + (pub.pages.length > 1 ? ' · ' + pub.pages.length + ' páginas' : ''));
      WB.dlg.toast(pub.pages.length > 1 ? 'Publicación guardada: ' + pub.pages.length + ' páginas' : 'Artículo guardado', 'ok', 1800);
      A.syncTitle();
      P.renderPage();
    });
  };
  WB.actions.save = A.save;

  /* ====================================================== barra de paginas */

  function render() {
    if (!bar) return;
    bar.textContent = '';
    bar.hidden = !E.idoc || !pub.pages.length;
    if (bar.hidden) return;

    pub.pages.forEach(function (p, i) {
      var tab = h('button', { type: 'button', class: 'pg-tab' + (i === pub.cur ? ' is-active' : ''), title: 'Doble clic para renombrar · botón derecho para más opciones' }, [
        h('b', { text: String(i + 1) }), h('span', { text: nameOf(p, i) }),
        WB.redaccion ? WB.redaccion.dot(p.s) : null
      ]);
      tab.addEventListener('click', function () { pub.go(i).catch(WB.ui.fail); });
      tab.addEventListener('dblclick', function () { pub.rename(i); });
      tab.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
        WB.ui.popup([
          { icon: 'ic-font', label: 'Renombrar…', action: 'page-rename:' + i },
          { icon: 'ic-check', label: 'Estado', sub: function () { return WB.redaccion ? WB.redaccion.stateItems(i) : []; } },
          { icon: 'ic-copy', label: 'Duplicar', action: 'page-dup:' + i },
          { icon: 'ic-up', label: 'Mover antes', action: 'page-move:' + i + ',-1', disabled: i === 0 },
          { icon: 'ic-down', label: 'Mover después', action: 'page-move:' + i + ',1', disabled: i === pub.pages.length - 1 },
          { sep: true },
          { icon: 'ic-trash', label: 'Quitar la página', action: 'page-del:' + i, disabled: pub.pages.length < 2 }
        ], tab);
      });
      bar.appendChild(tab);
    });

    var paper = pub.medium === 'periodico';
    var add = h('button', { type: 'button', class: 'pg-add', 'data-action': 'page-new',
      title: paper ? 'Añadir una página interior con el mismo estilo · botón derecho: otras opciones' : 'Añadir una página con el estilo que elijas' },
      [WB.ui.svgUse('ic-plus'), h('span', { text: 'Página' })]);
    add.addEventListener('contextmenu', function (ev) {
      ev.preventDefault();
      WB.ui.popup(addItems(), add);
    });
    bar.appendChild(add);
    bar.appendChild(h('span', { class: 'tool-spacer' }));
    if (WB.edition) WB.edition.decorateBar(bar);
    var st = WB.styles.byId[D.s.style];
    var label = st ? st.name : (D.s.format && WB.FORMATS[D.s.format] ? WB.FORMATS[D.s.format].name : 'sin estilo de prensa');
    bar.appendChild(h('button', { type: 'button', class: 'pg-style', title: 'Cambiar el estilo de esta página sin tocar el texto', 'data-action': 'gallery:restyle' }, [WB.ui.svgUse('ic-palette'), h('span', { text: 'Estilo: ' + label })]));
    bar.appendChild(h('button', { type: 'button', class: 'pg-style', title: 'Exportar a PDF, Word, EPUB…', 'data-action': 'export' }, [WB.ui.svgUse('ic-saveas'), h('span', { text: 'Exportar' })]));
  }
  pub.render = render;
  var baseRender = render;
  render = function () { baseRender(); if (WB.articles) WB.articles.renderSoon(); };

  function addItems() {
    return [
      { icon: 'ic-plus', label: 'Página interior (mismo estilo, para rellenar)', action: 'page-new:interior' },
      { icon: 'ic-copy', label: 'Copia de esta página', action: 'page-dup:' + pub.cur },
      { icon: 'ic-palette', label: 'Página con otro estilo de prensa…', action: 'gallery:page' }
    ];
  }
  pub.addItems = addItems;

  var X = WB.actions;
  // periodico: pagina interior directa; blog: se elige el estilo
  X['page-new'] = function (how) {
    if (how === 'interior' || pub.medium === 'periodico') return pub.addFiller();
    return WB.gallery.open('page');
  };
  X['page-go'] = function (i) { return pub.go(+i); };
  X['page-rename'] = function (i) { return pub.rename(+i); };
  X['page-dup'] = function (i) { return pub.duplicate(+i); };
  X['page-del'] = function (i) { return pub.remove(i === undefined ? pub.cur : +i); };
  X['page-move'] = function (arg) { var a = String(arg).split(','); pub.move(+a[0], +a[1]); };
  X['page-next'] = function () { return pub.go(Math.min(pub.cur + 1, pub.pages.length - 1)); };
  X['page-prev'] = function () { return pub.go(Math.max(pub.cur - 1, 0)); };

  render();
})();
