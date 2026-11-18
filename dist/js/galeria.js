/* ==========================================================================
   weBlogger - galeria de estilos de prensa.
   Una sola pantalla para tres cosas: empezar una publicacion, añadir una
   pagina o cambiar el estilo de la pagina abierta.

   A la izquierda, las fichas (se buscan por nombre, ciudad, epoca o rasgo y
   se filtran por tradicion o maqueta). A la derecha, la pagina de verdad que
   saldria con la ficha elegida, a escala, para leerla antes de decidir.
   Un clic elige y enseña; doble clic, Intro o el boton la usan.
   ========================================================================== */
(function () {
  'use strict';

  var S = WB.styles, A = WB.app, D = WB.doc, P = WB.panels;
  var h = P.h;
  var G = WB.gallery = {};
  var layer = null, grid, count, inName, inSearch, selGroup, selLayout, titleEl, subEl;
  var pv = {};
  var mode = 'article';
  var job = 0, chosen = null, pvTimer = 0;
  var PAGE_W = 1240;

  var MODES = {
    article: { title: 'Nueva publicación', sub: 'Elige el estilo de la primera página. Después podrás añadir más páginas, cada una con el suyo.', ask: 'Titular de portada', def: 'Titular de portada', go: 'Crear la publicación' },
    page: { title: 'Página nueva', sub: 'Elige el estilo de la página que se añade detrás de la actual.', ask: 'Titular de la página', def: 'Página nueva', go: 'Añadir la página' },
    restyle: { title: 'Cambiar el estilo de la página', sub: 'El texto y las imágenes se quedan como están: cambian la tipografía, el color y el carácter.', ask: '', def: '', go: 'Aplicar a esta página' }
  };

  function loadFonts() {
    if (document.getElementById('galleryFonts')) return;
    var l = document.createElement('link');
    l.id = 'galleryFonts';
    l.rel = 'stylesheet';
    l.href = WB.fontsUrl(WB.FONTS.map(function (f) { return f.name; }));
    document.head.appendChild(l);
  }

  function groupName(id) {
    var g = S.groups.filter(function (x) { return x.id === id; })[0];
    return g ? g.name : '';
  }

  /* ===================================================== vista previa === */

  /** La pagina completa que compondria esa ficha, como documento suelto. */
  function previewHtml(st) {
    var s = D.blank();
    S.apply(s, st);
    var keep = D.s, vars;
    D.s = s;
    try { vars = D.varsCss(); } finally { D.s = keep; }
    var fonts = WB.fontsUrl([st.display, st.body, st.ui, st.cabFont, st.t.cab === 'gotica' ? 'UnifrakturMaguntia' : ''].filter(Boolean));
    var title = inName.value.trim() || (mode === 'restyle' ? 'El titular de tu página' : MODES[mode].def);
    var body;
    try { body = S.build(st, title); } catch (e) { body = '<p style="padding:2rem">No se puede componer: ' + WB.esc(e.message) + '</p>'; }
    return '<!DOCTYPE html><html lang="es" data-theme="light"' + S.attrString(s) + '><head><meta charset="utf-8">' +
      (fonts ? '<link rel="stylesheet" href="' + WB.esc(fonts) + '">' : '') +
      '<style>' + WB.tpl.css + '\n' + vars + '\n.reveal{opacity:1!important;transform:none!important}html{scroll-behavior:auto}body{overflow-x:hidden}a{pointer-events:none}</style>' +
      '</head><body>' + body + '</body></html>';
  }

  function fitPreview() {
    if (!pv.frame || layer.hidden) return;
    var w = pv.view.clientWidth, hgt = pv.view.clientHeight;
    var k = w / PAGE_W;
    pv.frame.style.width = PAGE_W + 'px';
    pv.frame.style.height = Math.ceil(hgt / k) + 'px';
    pv.frame.style.transform = 'scale(' + k + ')';
  }

  function swatch(color, label) {
    var sw = h('span', { class: 'gal-sw', title: label + ': ' + color });
    sw.style.background = color;
    return sw;
  }

  function showPreview(st) {
    chosen = st;
    grid.querySelectorAll('.gal-card.is-sel').forEach(function (c) { c.classList.remove('is-sel'); });
    var card = grid.querySelector('[data-style="' + st.id + '"]');
    if (card) card.classList.add('is-sel');

    var l = S.layouts[st.maqueta];
    pv.name.textContent = st.name;
    pv.ref.textContent = st.ref;
    pv.meta.textContent = groupName(st.grupo) + ' · maqueta ' + (l ? l.name.toLowerCase() : st.maqueta) +
      ' · titulares en ' + st.display + ' · texto en ' + st.body;
    pv.mast.textContent = st.mast;
    pv.swatches.textContent = '';
    ['papel', 'tinta', 'acento', 'segundo color'].forEach(function (lab, i) { pv.swatches.appendChild(swatch(st.c[i], lab)); });
    pv.use.disabled = false;

    // componer la pagina cuesta: si se pasa rapido por varias, solo la ultima
    clearTimeout(pvTimer);
    pv.box.classList.add('is-loading');
    pvTimer = setTimeout(function () {
      pv.frame.onload = function () { pv.box.classList.remove('is-loading'); };
      pv.frame.srcdoc = previewHtml(st);
      fitPreview();
    }, 90);
  }

  /* ============================================================ montar === */

  function build() {
    grid = h('div', { class: 'gal-grid', tabIndex: 0 });
    count = h('span', { class: 'gal-count' });
    inName = h('input', { type: 'text', class: 'input gal-name', spellcheck: false, autocomplete: 'off' });
    inSearch = h('input', { type: 'search', class: 'input', placeholder: 'Buscar: sábana, tabloide, glasgow, salmón, gótica, corazón…', spellcheck: false, autocomplete: 'off' });
    selGroup = h('select', { class: 'input' });
    selLayout = h('select', { class: 'input' });
    titleEl = h('h2', { class: 'gal-title' });
    subEl = h('p', { class: 'gal-sub' });

    selGroup.appendChild(h('option', { value: '', text: 'Todas las tradiciones' }));
    S.groups.forEach(function (g) { selGroup.appendChild(h('option', { value: g.id, text: g.name + ' (' + g.items.length + ')' })); });
    selLayout.appendChild(h('option', { value: '', text: 'Todas las maquetas' }));
    S.layoutList.forEach(function (l) { selLayout.appendChild(h('option', { value: l.id, text: l.name })); });

    inSearch.addEventListener('input', fill);
    selGroup.addEventListener('change', fill);
    selLayout.addEventListener('change', fill);
    inName.addEventListener('change', function () { if (chosen) showPreview(chosen); });
    inName.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && chosen) { ev.preventDefault(); choose(chosen); } });

    pv.name = h('h3', { class: 'gal-pv-name' });
    pv.ref = h('p', { class: 'gal-pv-ref' });
    pv.meta = h('p', { class: 'gal-pv-meta' });
    pv.mast = h('b', { class: 'gal-pv-mast' });
    pv.swatches = h('span', { class: 'gal-sws' });
    pv.frame = h('iframe', { class: 'gal-pv-frame', title: 'Vista previa del estilo', sandbox: '' });
    pv.view = h('div', { class: 'gal-pv-view' }, [pv.frame]);
    pv.use = h('button', { type: 'button', class: 'btn btn-primary gal-use', onclick: function () { if (chosen) choose(chosen); } });
    pv.box = h('aside', { class: 'gal-pv' }, [
      h('div', { class: 'gal-pv-head' }, [
        h('div', { class: 'gal-pv-titles' }, [pv.name, pv.ref, pv.meta]),
        pv.use
      ]),
      h('div', { class: 'gal-pv-line' }, [h('span', { text: 'Cabecera de muestra:' }), pv.mast, pv.swatches]),
      pv.view,
      h('p', { class: 'gal-pv-foot', text: 'Así queda la página, a escala. Rueda del ratón para recorrerla · doble clic en una ficha o Intro para usarla.' })
    ]);

    layer = h('div', { class: 'gallery', hidden: true }, [
      h('header', { class: 'gal-head' }, [
        h('div', { class: 'gal-heading' }, [titleEl, subEl]),
        h('button', { type: 'button', class: 'btn', text: 'Cerrar (Esc)', onclick: G.close })
      ]),
      h('div', { class: 'gal-tools' }, [
        h('label', { class: 'gal-field gal-field-name' }, [h('span', { class: 'gal-ask' }), inName]),
        h('label', { class: 'gal-field gal-grow' }, [h('span', { text: 'Buscar' }), inSearch]),
        h('label', { class: 'gal-field' }, [h('span', { text: 'Tradición' }), selGroup]),
        h('label', { class: 'gal-field' }, [h('span', { text: 'Maqueta' }), selLayout]),
        count
      ]),
      h('div', { class: 'gal-body' }, [grid, pv.box])
    ]);
    document.body.appendChild(layer);
    window.addEventListener('resize', fitPreview);
  }

  function norm(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function card(st) {
    var l = S.layouts[st.maqueta];
    var c = h('button', { type: 'button', class: 'gal-card', title: st.ref || st.name, 'data-style': st.id }, [
      S.thumb(st),
      h('span', { class: 'gal-card-name', text: st.name }),
      h('span', { class: 'gal-card-meta', text: groupName(st.grupo) + (l ? ' · ' + l.name : '') })
    ]);
    c.addEventListener('click', function () { showPreview(st); });
    c.addEventListener('dblclick', function () { choose(st); });
    return c;
  }

  /** Pinta las fichas por tandas para que 500 no bloqueen la ventana. */
  function fill() {
    var q = norm(inSearch.value).split(/\s+/).filter(Boolean);
    var list = S.list.filter(function (st) {
      if (selGroup.value && st.grupo !== selGroup.value) return false;
      if (selLayout.value && st.maqueta !== selLayout.value) return false;
      if (!q.length) return true;
      var hay = norm(st.name + ' ' + st.ref + ' ' + st.mast + ' ' + st.maqueta + ' ' + groupName(st.grupo) + ' ' + st.display + ' ' + st.body + ' ' + Object.keys(st.t).map(function (k) { return st.t[k]; }).join(' '));
      return q.every(function (w) { return hay.indexOf(w) > -1; });
    });
    count.textContent = list.length + ' de ' + S.list.length + ' estilos';
    grid.textContent = '';
    grid.scrollTop = 0;
    if (!list.length) { grid.appendChild(h('p', { class: 'lib-empty', text: 'Ningún estilo coincide con esa búsqueda.' })); return; }
    if (!chosen || list.indexOf(chosen) < 0) showPreview(list[0]);
    var mine = ++job, i = 0;
    (function step() {
      if (mine !== job) return;
      var frag = document.createDocumentFragment();
      for (var n = 0; n < 36 && i < list.length; n++, i++) {
        var c = card(list[i]);
        if (list[i] === chosen) c.classList.add('is-sel');
        frag.appendChild(c);
      }
      grid.appendChild(frag);
      if (i < list.length) requestAnimationFrame(step);
    })();
  }

  function choose(st) {
    var name = inName.value.trim() || MODES[mode].def;
    // en un periodico la pagina no lleva titular propio: se llama por su numero
    if (mode === 'page' && WB.pub.medium === 'periodico') name = 'Página ' + (WB.pub.cur + 2);
    G.close();
    if (mode === 'restyle') { WB.pub.restyle(st); return; }
    if (mode === 'page') { WB.pub.add(st, name).catch(WB.ui.fail); return; }
    var ed = G.opts || { medium: 'blog' };
    A.confirmDiscard().then(function (ok) {
      if (!ok) return;
      var where = ed.medium === 'periodico' ? WB.edition.freeFile(D.slug(name)) : A.freeFolder(D.slug(name));
      return where.then(function (folder) {
        return WB.busy.run("Componiendo la portada con el estilo " + st.name, function () {
          var s = D.blank();
          s.title = name;
          s.pageName = 'Portada';
          s.key = String(folder).replace(/[\\/]+$/, '').split(/[\\/]/).pop().replace(/\.weblog$/i, '');
          S.apply(s, st);
          WB.edition.pending = { medium: ed.medium, paper: ed.paper };
          return A.openDoc({ s: s, body: S.build(st, name) }, folder, true);
        });
      }).then(function () {
        WB.ui.status('publicación nueva con el estilo ' + st.name + ' · se guardará en ' + D.s.path);
      });
    }).catch(WB.ui.fail);
  }

  G.open = function (m, opts) {
    if (opts) G.opts = opts;
    else if (m === 'article' || !m) G.opts = { medium: 'blog' };
    if (!S.list.length) { WB.ui.fail('no hay estilos de prensa instalados'); return; }
    mode = MODES[m] ? m : 'article';
    if ((mode === 'page' || mode === 'restyle') && !WB.ed.idoc) { WB.ui.status('abre antes una publicación'); return; }
    if (!layer) build();
    loadFonts();
    WB.ui.closeMenus();
    var kind = mode === 'article' && G.opts && G.opts.medium === 'periodico' ? 'Periódico · ' + WB.edition.paperName(G.opts.paper) :
      mode === 'article' ? 'Blog' : (WB.pub.medium === 'periodico' ? 'Periódico' : 'Blog');
    titleEl.textContent = MODES[mode].title + ' (' + kind + ') — ' + S.list.length + ' estilos de prensa';
    subEl.textContent = MODES[mode].sub;
    layer.querySelector('.gal-field-name').hidden = mode === 'restyle' || (mode === 'page' && WB.pub.medium === 'periodico');
    layer.querySelector('.gal-ask').textContent = MODES[mode].ask;
    pv.use.textContent = MODES[mode].go;
    inName.value = (mode === 'article' && G.opts && G.opts.name) || '';
    inName.placeholder = MODES[mode].def;
    chosen = mode === 'restyle' ? S.byId[D.s.style] || null : chosen;
    layer.hidden = false;
    fill();
    if (chosen) showPreview(chosen);
    requestAnimationFrame(fitPreview);
    (layer.querySelector('.gal-field-name').hidden ? inSearch : inName).focus();
  };

  G.close = function () {
    job++;
    clearTimeout(pvTimer);
    if (layer) {
      layer.hidden = true;
      pv.frame.srcdoc = '';
    }
  };

  document.addEventListener('keydown', function (ev) {
    if (!layer || layer.hidden || !document.getElementById('dialogLayer').hidden) return;
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); G.close(); return; }
    // flechas para recorrer las fichas sin raton
    if ((ev.key === 'ArrowRight' || ev.key === 'ArrowLeft' || ev.key === 'ArrowDown' || ev.key === 'ArrowUp') && document.activeElement === grid || (document.activeElement && document.activeElement.classList.contains('gal-card') && /^Arrow/.test(ev.key))) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.gal-card'));
      var i = cards.indexOf(grid.querySelector('.gal-card.is-sel'));
      var cols = Math.max(1, Math.round(grid.clientWidth / (cards[0] ? cards[0].offsetWidth + 14 : 260)));
      var step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[ev.key];
      var next = cards[Math.max(0, Math.min(cards.length - 1, i + step))];
      if (next) { ev.preventDefault(); next.focus(); next.click(); next.scrollIntoView({ block: 'nearest' }); }
    } else if (ev.key === 'Enter' && document.activeElement && document.activeElement.classList.contains('gal-card') && chosen) {
      ev.preventDefault();
      choose(chosen);
    }
  }, true);

  WB.actions.gallery = function (m) { G.open(m || 'article'); };
})();
