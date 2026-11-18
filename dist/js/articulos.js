/* ==========================================================================
   weBlogger - panel «Artículos» del dock.

   Lista los articulos de la biblioteca y, desplegado, las paginas de cada uno.
   - Doble clic en una pagina: se abre en el editor (si es de otro articulo,
     primero se abre ese articulo).
   - Arrastrar una pagina arriba o abajo: cambia su orden en la publicacion.
     En el articulo abierto el cambio queda pendiente de guardar, como
     cualquier otro; si es de otro articulo, se abre ese articulo antes.
   El articulo abierto se lee de memoria (asi se ven las paginas aun sin
   guardar); los demas, del disco con la orden list_pages.
   ========================================================================== */
(function () {
  'use strict';

  var D = WB.doc, A = WB.app, P = WB.panels, pub = WB.pub, S = WB.styles;
  var h = P.h;
  var pane = document.getElementById('paneArticles');
  var expanded = Object.create(null);   // ruta -> desplegado
  var cache = Object.create(null);      // ruta -> paginas leidas del disco
  var filter = '';
  var drag = null;                      // { path, from }
  var timer = 0;

  function norm(p) { return String(p || '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase(); }
  function same(a, b) { return !!a && !!b && norm(a) === norm(b); }
  function current() { return pub.pages[0] ? pub.pages[0].s.path : null; }
  function baseName(p) { return String(p || '').replace(/[\\/]+$/, '').split(/[\\/]/).pop(); }
  function icon(id) { return WB.ui.svgUse(id); }

  function styleName(id) {
    var st = id && S.byId[id];
    return st ? st.name : '';
  }

  /** Paginas de un articulo: de memoria si es el abierto, del disco si no. */
  function pagesOf(a) {
    if (same(a.path, current())) {
      return Promise.resolve(pub.pages.map(function (p, i) {
        return { name: pub.nameOf(i), title: p.s.title, style: p.s.style, live: true };
      }));
    }
    if (cache[a.path]) return Promise.resolve(cache[a.path]);
    return WB.invoke('list_pages', { folder: a.path }).then(function (list) {
      cache[a.path] = list.map(function (p, i) {
        return { name: p.name || (i === 0 ? 'Portada' : 'Página ' + (i + 1)), title: p.title, style: p.style, live: false };
      });
      return cache[a.path];
    }).catch(function () { return []; });
  }

  /* ========================================================== acciones === */

  /** Abre el articulo si hace falta. Devuelve false si el usuario cancela. */
  function ensureOpen(a) {
    if (same(a.path, current())) return Promise.resolve(true);
    return A.openFolder(a.path).then(function () { return same(a.path, current()); });
  }

  function openPage(a, i) {
    return ensureOpen(a).then(function (ok) {
      if (!ok) return;
      return pub.go(Math.min(i, pub.pages.length - 1)).then(function () {
        WB.ed.idoc.defaultView.scrollTo(0, 0);
        WB.ui.status('editando: ' + (a.title || a.name) + ' · ' + pub.nameOf(pub.cur));
      });
    }).catch(WB.ui.fail);
  }

  function movePage(a, from, to) {
    return ensureOpen(a).then(function (ok) {
      if (!ok) return;
      pub.moveTo(from, to);
      expanded[a.path] = true;
      if (!same(a.path, current())) return;
      WB.dlg.toast('Orden cambiado. Guarda (Ctrl+S) para conservarlo.', 'info', 2600);
    }).catch(WB.ui.fail);
  }

  /* ============================================================ pintar === */

  function pageRow(a, pg, i, total, isCur) {
    var active = isCur && i === pub.cur;
    var li = h('li', { class: 'art-page' + (active ? ' is-active' : ''), draggable: true, title: 'Doble clic para editarla · arrastra para cambiar su orden' }, [
      h('span', { class: 'art-num', text: String(i + 1) }),
      h('span', { class: 'art-page-text' }, [
        h('span', { class: 'art-page-name', text: pg.name }),
        h('span', { class: 'art-page-sub', text: styleName(pg.style) || (i === 0 ? 'index.html' : 'pagina-' + (i + 1) + '.html') })
      ]),
      h('span', { class: 'art-grip' }, [icon('ic-grip')])
    ]);

    li.addEventListener('dblclick', function () { openPage(a, i); });
    li.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') openPage(a, i); });
    li.tabIndex = 0;

    li.addEventListener('dragstart', function (ev) {
      drag = { path: a.path, from: i };
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('text/plain', String(i));
      li.classList.add('is-dragging');
    });
    li.addEventListener('dragend', function () {
      drag = null;
      li.classList.remove('is-dragging');
      pane.querySelectorAll('.drop-before, .drop-after').forEach(function (n) { n.classList.remove('drop-before', 'drop-after'); });
    });
    li.addEventListener('dragover', function (ev) {
      if (!drag || !same(drag.path, a.path)) return;
      ev.preventDefault();
      var r = li.getBoundingClientRect();
      var after = ev.clientY > r.top + r.height / 2;
      li.classList.toggle('drop-after', after);
      li.classList.toggle('drop-before', !after);
    });
    li.addEventListener('dragleave', function () { li.classList.remove('drop-before', 'drop-after'); });
    li.addEventListener('drop', function (ev) {
      if (!drag || !same(drag.path, a.path)) return;
      ev.preventDefault();
      var after = li.classList.contains('drop-after');
      li.classList.remove('drop-before', 'drop-after');
      var from = drag.from;
      var to = i + (after ? 1 : 0);
      if (from < to) to--;
      drag = null;
      if (to !== from) movePage(a, from, Math.max(0, Math.min(total - 1, to)));
    });
    return li;
  }

  function articleBlock(a) {
    var isCur = same(a.path, current());
    var open = expanded[a.path] !== undefined ? expanded[a.path] : isCur;
    var list = h('ul', { class: 'art-pages' });
    var count = h('span', { class: 'art-count' });
    var head = h('button', { type: 'button', class: 'art-head' + (isCur ? ' is-current' : ''), title: a.path + '\nClic: ver sus páginas · doble clic: abrirlo' }, [
      h('span', { class: 'art-chev' + (open ? ' is-open' : '') }, [icon('ic-chevron-right')]),
      h('span', { class: 'art-title' }, [
        h('b', { text: a.title || a.name }),
        h('small', { text: (isCur ? 'abierto ahora · ' : '') + a.name + (a.unsaved ? ' · sin guardar' : '') })
      ]),
      count
    ]);
    head.addEventListener('click', function () {
      expanded[a.path] = !open;
      render();
    });
    head.addEventListener('dblclick', function (ev) { ev.preventDefault(); openPage(a, 0); });

    var box = h('div', { class: 'art' + (isCur ? ' is-current' : '') }, [head, list]);
    list.hidden = !open;
    pagesOf(a).then(function (pages) {
      count.textContent = pages.length + (pages.length === 1 ? ' pág.' : ' págs.');
      if (!open) return;
      pages.forEach(function (pg, i) { list.appendChild(pageRow(a, pg, i, pages.length, isCur)); });
      if (isCur) {
        list.appendChild(h('li', { class: 'art-add' }, [
          h('button', { type: 'button', class: 'btn btn-ghost', 'data-action': 'gallery:page' }, [icon('ic-plus'), h('span', { text: 'Añadir una página' })])
        ]));
      }
    });
    return box;
  }

  function render() {
    clearTimeout(timer);
    pane.textContent = '';
    var search = h('input', { type: 'search', class: 'input', placeholder: 'Buscar un artículo…', spellcheck: false });
    search.value = filter;
    search.addEventListener('input', function () { filter = search.value; drawList(); });
    var listBox = h('div', { class: 'art-list' });
    pane.appendChild(h('div', { class: 'art-tools' }, [
      search,
      h('button', { type: 'button', class: 'icon-btn', title: 'Publicación nueva desde la galería', 'data-action': 'gallery:article' }, [icon('ic-plus')]),
      h('button', { type: 'button', class: 'icon-btn', title: 'Volver a leer la biblioteca', onclick: function () { cache = Object.create(null); render(); } }, [icon('ic-refresh')])
    ]));
    pane.appendChild(h('p', { class: 'pnote', text: 'Doble clic en una página para editarla. Arrástrala para cambiar su orden.' }));
    pane.appendChild(listBox);

    var all = [];
    function drawList() {
      listBox.textContent = '';
      var q = filter.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      var shown = all.filter(function (a) {
        if (!q) return true;
        return (String(a.title) + ' ' + a.name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').indexOf(q) > -1;
      });
      if (!shown.length) {
        listBox.appendChild(h('p', { class: 'pnote', text: all.length ? 'Ningún artículo coincide.' : 'Todavía no hay artículos en la biblioteca.' }));
        return;
      }
      shown.forEach(function (a) { listBox.appendChild(articleBlock(a)); });
    }

    WB.invoke('list_articles', { root: A.root() }).then(function (list) {
      var cur = current();
      // el articulo abierto va primero, aunque aun no este guardado
      var mine = list.filter(function (a) { return same(a.path, cur); })[0];
      all = list.filter(function (a) { return !same(a.path, cur); });
      if (cur && WB.ed.idoc) {
        all.unshift({ path: cur, name: baseName(cur), title: pub.pages[0].s.title || (mine && mine.title) || baseName(cur), unsaved: !mine });
      }
      drawList();
    }).catch(WB.ui.fail);
  }

  function renderSoon() {
    if (WB.ui.dockTab !== 'articles') return;
    clearTimeout(timer);
    timer = setTimeout(render, 150);
  }

  // al guardar, lo leido del disco de ese articulo ya no vale
  var baseSave = A.save;
  A.save = function () {
    return Promise.resolve(baseSave.apply(this, arguments)).then(function (r) {
      var cur = current();
      if (cur) delete cache[cur];
      renderSoon();
      return r;
    });
  };
  WB.actions.save = A.save;

  var tab = document.querySelector('.dock-tab[data-tab="articles"]');
  if (tab) tab.addEventListener('click', render);

  WB.articles = { render: render, renderSoon: renderSoon };
  WB.actions.articles = function () { WB.ui.setDockTab('articles'); render(); };
})();
