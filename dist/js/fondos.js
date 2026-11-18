/* ==========================================================================
   weBlogger - plantillas de blog con miniatura y fondos de pagina.

   1. Selector de plantillas: fichas con miniatura a la izquierda y, a la
      derecha, la pagina de verdad a escala (como la galeria de estilos).
      Clic enseña, doble clic, Intro o el boton la usan.
   2. Fondo de la pagina (pestaña Página): imagen quieta detras de todo,
      velo para que se lea el texto y textura (papel, cuaderno, puntos...).
   3. Portada: «foto a toda la portada» o «centrada sin foto».
   ========================================================================== */
(function () {
  'use strict';

  var A = WB.app, D = WB.doc, E = WB.ed, P = WB.panels;
  var h = P.h, ui = P.ui;
  var T = WB.tplPick = {};
  var layer, grid, inName, pv = {}, chosen = null, timer = 0;
  var PAGE_W = 1240;

  var TEXTURES = [
    ['', 'Sin textura'], ['papel', 'Papel'], ['cuaderno', 'Cuaderno de renglones'], ['puntos', 'Puntos'],
    ['cuadricula', 'Cuadrícula'], ['rayas', 'Rayas'], ['lino', 'Lino'], ['aurora', 'Aurora de color']
  ];

  /* ===================================================== miniaturas ===== */

  function thumb(t) {
    var th = t.thumb || {};
    var pal = WB.PALETTES[th.pal || t.palette] || WB.PALETTES.terracota;
    var c = th.dark ? pal.dark : pal.light;
    var box = h('div', { class: 'tp-thumb' + (th.dark ? ' is-dark' : '') + (th.cover ? ' is-cover' : '') + (th.center ? ' is-center' : '') + (th.bg ? ' has-bg' : '') });
    box.style.setProperty('--b', c.bgPrimary);
    box.style.setProperty('--s', c.bgSecondary);
    box.style.setProperty('--c', c.bgCard);
    box.style.setProperty('--t', c.textPrimary);
    box.style.setProperty('--m', c.textMuted);
    box.style.setProperty('--a', c.accent);
    box.style.setProperty('--a2', pal.accent2);
    // los fondos «theme» del catalogo usan las variables de la pagina
    box.style.setProperty('--accent', c.accent);
    box.style.setProperty('--accent-2', pal.accent2);
    box.style.setProperty('--text-primary', c.textPrimary);
    var img = th.img === null || th.img === undefined ? '' : WB.scenes.url(th.img);
    var cat = th.bgId && WB.BG ? WB.BG.byId[th.bgId] : null;
    if (cat) {
      box.classList.add('has-bg');
      box.appendChild(h('div', { class: 'tp-bg tp-bg-cat', style: cat.css + 'background-size:' + (/background-size/.test(cat.css) ? '' : 'auto') }));
    }
    if (th.bg && img) box.appendChild(h('div', { class: 'tp-bg', style: 'background-image:url("' + img + '")' }));
    if (th.texture) box.appendChild(h('div', { class: 'tp-tex', 'data-texture': th.texture }));
    box.appendChild(h('div', { class: 'tp-hdr' }, [h('b'), h('i'), h('i'), h('i')]));
    var heroKids = [h('div', { class: 'tp-txt' }, [h('i', { class: 'tp-badge' }), h('i', { class: 'tp-h1' }), h('i', { class: 'tp-h1 tp-short' }), h('i', { class: 'tp-p' }), h('i', { class: 'tp-p tp-short' })])];
    if (img && !th.bg && !th.center) heroKids.push(h('div', { class: 'tp-img', style: 'background-image:url("' + img + '")' }));
    if (img && th.bg) heroKids.push(h('div', { class: 'tp-img', style: 'background-image:url("' + WB.scenes.url((th.img + 9) % WB.scenes.count) + '")' }));
    box.appendChild(h('div', { class: 'tp-hero' }, heroKids));
    box.appendChild(h('div', { class: 'tp-body' }, [
      th.center ? null : h('i', { class: 'tp-toc' }),
      h('div', { class: 'tp-col' }, [h('i', { class: 'tp-k' }), h('i', { class: 'tp-h2' }), h('i'), h('i'), h('i', { class: 'tp-short' })])
    ]));
    if (!img && !th.texture && !cat) box.classList.add('is-plain');
    return box;
  }

  /* ===================================================== vista previa === */

  function previewHtml(t) {
    var name = inName.value.trim() || 'El titular de tu blog';
    var built = t.build(name);
    var s = D.blank();
    s.paletteId = t.palette;
    s.palette = JSON.parse(JSON.stringify(WB.PALETTES[t.palette]));
    delete s.palette.name;
    Object.assign(s, built.set);
    var keep = D.s, vars;
    D.s = s;
    try { vars = D.varsCss(); } finally { D.s = keep; }
    var fonts = WB.fontsUrl([s.fontDisplay, s.fontBody].filter(Boolean));
    return '<!DOCTYPE html><html lang="es" data-theme="' + (s.startTheme === 'dark' ? 'dark' : 'light') + '"><head><meta charset="utf-8">' +
      (fonts ? '<link rel="stylesheet" href="' + WB.esc(fonts) + '">' : '') +
      '<style>' + WB.tpl.css + '\n' + vars + '\n' + (s.customCss || '') +
      '\n.reveal{opacity:1!important;transform:none!important}html{scroll-behavior:auto}body{overflow-x:hidden}a{pointer-events:none}</style>' +
      '</head><body>' + built.body + '</body></html>';
  }

  function fit() {
    if (!layer || layer.hidden) return;
    var w = pv.view.clientWidth, hgt = pv.view.clientHeight, k = w / PAGE_W;
    pv.frame.style.width = PAGE_W + 'px';
    pv.frame.style.height = Math.ceil(hgt / k) + 'px';
    pv.frame.style.transform = 'scale(' + k + ')';
  }

  function show(t) {
    chosen = t;
    grid.querySelectorAll('.gal-card.is-sel').forEach(function (c) { c.classList.remove('is-sel'); });
    var card = grid.querySelector('[data-tpl="' + t.id + '"]');
    if (card) card.classList.add('is-sel');
    pv.name.textContent = t.name;
    pv.ref.textContent = t.desc || '';
    pv.meta.textContent = (t.group ? t.group + ' · ' : '') + 'paleta ' + ((WB.PALETTES[t.palette] || {}).name || t.palette);
    clearTimeout(timer);
    pv.box.classList.add('is-loading');
    timer = setTimeout(function () {
      pv.frame.onload = function () { pv.box.classList.remove('is-loading'); };
      pv.frame.srcdoc = previewHtml(t);
      fit();
    }, 80);
  }

  function use(t) {
    var name = inName.value.trim();
    T.close();
    A.newFrom(t.id, name || undefined).catch(WB.ui.fail);
  }

  function build() {
    grid = h('div', { class: 'gal-grid tp-grid', tabIndex: 0 });
    inName = h('input', { type: 'text', class: 'input gal-name', spellcheck: false, autocomplete: 'off', placeholder: 'El titular de tu blog' });
    inName.addEventListener('change', function () { if (chosen) show(chosen); });
    inName.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && chosen) { ev.preventDefault(); use(chosen); } });

    pv.name = h('h3', { class: 'gal-pv-name' });
    pv.ref = h('p', { class: 'gal-pv-ref' });
    pv.meta = h('p', { class: 'gal-pv-meta' });
    pv.frame = h('iframe', { class: 'gal-pv-frame', title: 'Vista previa de la plantilla', sandbox: '' });
    pv.view = h('div', { class: 'gal-pv-view' }, [pv.frame]);
    pv.use = h('button', { type: 'button', class: 'btn btn-primary gal-use', text: 'Crear el blog', onclick: function () { if (chosen) use(chosen); } });
    pv.box = h('aside', { class: 'gal-pv' }, [
      h('div', { class: 'gal-pv-head' }, [h('div', { class: 'gal-pv-titles' }, [pv.name, pv.ref, pv.meta]), pv.use]),
      pv.view,
      h('p', { class: 'gal-pv-foot', text: 'Así queda la página, a escala. Todo se puede cambiar después: textos, fotos, colores, fuentes y el fondo (pestaña Página).' })
    ]);

    var groups = {};
    WB.TEMPLATES.forEach(function (t) {
      var g = t.group || 'Básicas';
      (groups[g] = groups[g] || []).push(t);
    });
    Object.keys(groups).forEach(function (g) {
      grid.appendChild(h('h4', { class: 'tp-group', text: g }));
      groups[g].forEach(function (t) {
        var c = h('button', { type: 'button', class: 'gal-card tp-card', title: t.desc || t.name, 'data-tpl': t.id }, [
          thumb(t),
          h('span', { class: 'gal-card-name', text: t.name }),
          h('span', { class: 'gal-card-meta', text: t.desc || '' })
        ]);
        c.addEventListener('click', function () { show(t); });
        c.addEventListener('dblclick', function () { use(t); });
        grid.appendChild(c);
      });
    });

    layer = h('div', { class: 'gallery tp-layer', hidden: true }, [
      h('header', { class: 'gal-head' }, [
        h('div', { class: 'gal-heading' }, [
          h('h2', { class: 'gal-title', text: 'Nuevo blog — ' + WB.TEMPLATES.length + ' plantillas' }),
          h('p', { class: 'gal-sub', text: 'Las de BitxoSOFT siguen la estructura de sus blogs; las de «Con fondo» llevan imagen o textura detrás. Clic para verla, doble clic para usarla.' })
        ]),
        h('button', { type: 'button', class: 'btn', text: 'Cerrar (Esc)', onclick: function () { T.close(); } })
      ]),
      h('div', { class: 'gal-tools' }, [
        h('label', { class: 'gal-field gal-field-name' }, [h('span', { text: 'Titular de portada' }), inName])
      ]),
      h('div', { class: 'gal-body' }, [grid, pv.box])
    ]);
    document.body.appendChild(layer);
    window.addEventListener('resize', fit);
  }

  T.open = function (name) {
    if (!layer) build();
    WB.ui.closeMenus();
    if (WB.edition && WB.edition.closeChooser) WB.edition.closeChooser();
    inName.value = name || '';
    layer.hidden = false;
    show(chosen || WB.TEMPLATES[1] || WB.TEMPLATES[0]);
    requestAnimationFrame(fit);
    inName.focus();
  };

  T.close = function () {
    clearTimeout(timer);
    if (layer) { layer.hidden = true; pv.frame.srcdoc = ''; }
  };

  document.addEventListener('keydown', function (ev) {
    if (!layer || layer.hidden || !document.getElementById('dialogLayer').hidden) return;
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); T.close(); }
    else if (ev.key === 'Enter' && document.activeElement && document.activeElement.classList.contains('tp-card') && chosen) { ev.preventDefault(); use(chosen); }
  }, true);

  WB.actions.templates = function () { T.open(''); };

  /* ================================================ fondo de pagina ===== */

  function bgEl() { return E.idoc && E.idoc.querySelector('body > .wb-page-bg'); }

  function ensureBg() {
    var b = bgEl();
    if (b) return b;
    b = E.make('<div class="wb-page-bg" style="--veil:0.82" aria-hidden="true"></div>');
    E.idoc.body.insertBefore(b, E.idoc.body.firstChild);
    return b;
  }

  function bgImg(b, create) {
    var img = b.querySelector('img');
    if (!img && create) { img = E.idoc.createElement('img'); img.alt = ''; b.appendChild(img); }
    return img;
  }

  function catName(id) {
    var c = WB.BG ? WB.BG.cats.filter(function (x) { return x.id === id; })[0] : null;
    return c ? c.name : '';
  }

  /** Pone un fondo del catalogo en la pagina abierta (sin apuntarlo aun en el historial). */
  function applyBg(bg) {
    var b = ensureBg();
    var fill = b.querySelector('.wb-bg-fill');
    if (!fill) { fill = E.idoc.createElement('div'); fill.className = 'wb-bg-fill'; b.appendChild(fill); }
    fill.setAttribute('style', bg.css);
    b.setAttribute('data-bg', bg.id);
    b.removeAttribute('data-texture');
    if (bg.tone === 'theme') b.removeAttribute('data-tone');
    else {
      b.setAttribute('data-tone', bg.tone);
      var im = b.querySelector('img');
      if (im) im.remove();          // un material tapa la foto: fuera
    }
    if (!b.querySelector('img')) b.style.setProperty('--veil', '0');
  }

  /* ------------------------------------- selector de fondos con indice -- */

  var B = WB.bgPick = {};
  var bl, bIndex, bGrid, bSearch, bCount, bNow, snap = null, picked = null;

  function cssVar(name) { return E.idoc ? getComputedStyle(E.idoc.documentElement).getPropertyValue(name).trim() : ''; }

  function bgTile(bg) {
    var t = h('button', { type: 'button', class: 'bgp-tile', title: bg.name + ' · ' + catName(bg.cat), 'data-bg': bg.id }, [
      h('span', { class: 'bgp-sw', style: bg.css }),
      h('span', { class: 'bgp-name', text: bg.name })
    ]);
    t.addEventListener('click', function () { choose(bg); });
    t.addEventListener('dblclick', function () { choose(bg); B.accept(); });
    return t;
  }

  function choose(bg) {
    picked = bg;
    applyBg(bg);
    E.changed && E.changed();
    bGrid.querySelectorAll('.bgp-tile.is-sel').forEach(function (x) { x.classList.remove('is-sel'); });
    var t = bGrid.querySelector('[data-bg="' + bg.id + '"]');
    if (t) t.classList.add('is-sel');
    bNow.textContent = bg.name + ' · ' + catName(bg.cat) + (bg.tone === 'theme' ? ' · usa los colores de la paleta' : bg.tone === 'dark' ? ' · material oscuro' : '');
  }

  function fillGrid() {
    var q = bSearch.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    bGrid.textContent = '';
    var n = 0;
    WB.BG.cats.forEach(function (c) {
      var items = c.items.filter(function (b) {
        return !q || (b.name + ' ' + c.name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').indexOf(q) > -1;
      });
      if (!items.length) return;
      n += items.length;
      bGrid.appendChild(h('h4', { class: 'bgp-cat', id: 'bgp-cat-' + c.id, text: c.icon + '  ' + c.name + ' · ' + items.length }));
      items.forEach(function (b) { bGrid.appendChild(bgTile(b)); });
    });
    bCount.textContent = n + ' de ' + WB.BG.list.length + ' fondos';
    var cur = bgEl() && bgEl().getAttribute('data-bg');
    var sel = cur && bGrid.querySelector('[data-bg="' + cur + '"]');
    if (sel) sel.classList.add('is-sel');
  }

  function buildPicker() {
    bSearch = h('input', { type: 'search', class: 'input', placeholder: 'Buscar: madera, folio, mármol, noche…', spellcheck: false, autocomplete: 'off' });
    bSearch.addEventListener('input', fillGrid);
    bCount = h('span', { class: 'bgp-count' });
    bNow = h('span', { class: 'bgp-now' });
    bIndex = h('nav', { class: 'bgp-index', 'aria-label': 'Índice de fondos' });
    bIndex.appendChild(h('button', { type: 'button', class: 'bgp-ix is-on', onclick: function () { bSearch.value = ''; fillGrid(); bGrid.scrollTop = 0; mark(this); } }, [h('span', { text: '▦  Todos' }), h('b', { text: String(WB.BG.list.length) })]));
    WB.BG.cats.forEach(function (c) {
      bIndex.appendChild(h('button', { type: 'button', class: 'bgp-ix', onclick: function () {
        if (bSearch.value) { bSearch.value = ''; fillGrid(); }
        var head = bGrid.querySelector('#bgp-cat-' + c.id);
        if (head) bGrid.scrollTo({ top: head.offsetTop - bGrid.offsetTop - 6, behavior: 'smooth' });
        mark(this);
      } }, [h('span', { text: c.icon + '  ' + c.name }), h('b', { text: String(c.items.length) })]));
    });
    function mark(btn) { bIndex.querySelectorAll('.bgp-ix').forEach(function (x) { x.classList.toggle('is-on', x === btn); }); }
    bGrid = h('div', { class: 'bgp-grid' });

    bl = h('div', { class: 'bgp', hidden: true, role: 'dialog', 'aria-label': 'Fondos de página' }, [
      h('header', { class: 'bgp-head' }, [
        h('div', { class: 'bgp-titles' }, [h('h2', { text: 'Fondos de página' }), bCount]),
        bSearch,
        h('button', { type: 'button', class: 'btn btn-ghost', text: '✕', title: 'Cancelar (Esc)', onclick: function () { B.cancel(); } })
      ]),
      h('div', { class: 'bgp-body' }, [bIndex, bGrid]),
      h('footer', { class: 'bgp-foot' }, [
        bNow,
        h('button', { type: 'button', class: 'btn btn-ghost', text: 'Sin fondo', onclick: function () { var b = bgEl(); if (b) b.remove(); picked = null; bNow.textContent = 'Sin fondo'; bGrid.querySelectorAll('.is-sel').forEach(function (x) { x.classList.remove('is-sel'); }); } }),
        h('button', { type: 'button', class: 'btn', text: 'Cancelar', onclick: function () { B.cancel(); } }),
        h('button', { type: 'button', class: 'btn btn-primary', text: 'Aceptar', onclick: function () { B.accept(); } })
      ])
    ]);
    document.body.appendChild(bl);
  }

  B.open = function () {
    if (!E.idoc || !WB.BG) return;
    if (!bl) buildPicker();
    WB.ui.closeMenus();
    var b = bgEl();
    snap = b ? b.outerHTML : null;
    picked = null;
    // los fondos que usan la paleta se ven con los colores de esta pagina
    ['--accent', '--accent-2', '--text-primary', '--bg-primary'].forEach(function (v) { bGrid.style.setProperty(v, cssVar(v)); });
    bGrid.style.setProperty('--bgp-base', cssVar('--bg-primary') || '#fff');
    bSearch.value = '';
    fillGrid();
    var cur = b && b.getAttribute('data-bg') && WB.BG.byId[b.getAttribute('data-bg')];
    bNow.textContent = cur ? cur.name + ' · ' + catName(cur.cat) : 'Elige un fondo: se ve en la página al momento';
    bl.hidden = false;
    var sel = bGrid.querySelector('.is-sel');
    if (sel) sel.scrollIntoView({ block: 'center' });
    bSearch.focus();
  };

  B.accept = function () {
    if (!bl) return;
    bl.hidden = true;
    E.commit(picked ? 'fondo: ' + picked.name : 'fondo de la página');
    P.renderPage();
  };

  B.cancel = function () {
    if (!bl) return;
    bl.hidden = true;
    var b = bgEl();
    if (b) b.remove();
    if (snap) E.idoc.body.insertBefore(E.make(snap), E.idoc.body.firstChild);
    E.refresh && E.refresh();
  };

  document.addEventListener('keydown', function (ev) {
    if (!bl || bl.hidden || !document.getElementById('dialogLayer').hidden) return;
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); B.cancel(); }
  }, true);

  WB.actions.backgrounds = function () { B.open(); };

  var basePageExtra = P.pageExtra;
  P.pageExtra = function (pane) {
    if (basePageExtra) basePageExtra(pane);
    if (!E.idoc || (WB.pub && WB.pub.medium === 'periodico')) return;
    var b = bgEl();
    var img = b && b.querySelector('img');
    var kids = [];
    var redo = function () { E.commit('fondo de la página'); P.renderPage(); };

    if (img && img.getAttribute('src')) kids.push(h('img', { class: 'img-thumb', src: img.getAttribute('src'), alt: '' }));
    kids.push(ui.fBtns([
      ['Imagen de archivo…', function () { var x = bgImg(ensureBg(), true); WB.img.pick(x); setTimeout(function () { P.renderPage(); }, 1200); }, 'btn-primary'],
      ['Desde internet…', function () { WB.img.askUrl(bgImg(ensureBg(), true)); }],
      ['Ilustración', function () {
        var x = bgImg(ensureBg(), true);
        var i = (parseInt(x.getAttribute('data-wb-scene'), 10) + 1) || Math.floor(Math.random() * WB.scenes.count);
        x.setAttribute('data-wb-scene', i % WB.scenes.count);
        x.src = WB.scenes.url(i);
        redo();
      }, '', 'Pone una de las ilustraciones de weBlogger; pulsa otra vez para cambiarla']
    ]));
    // el catalogo: papel, madera, piedra... con su indice
    var cur = b && b.getAttribute('data-bg') && WB.BG ? WB.BG.byId[b.getAttribute('data-bg')] : null;
    kids.push(h('div', { class: 'bgp-current' }, [
      h('span', { class: 'bgp-current-sw', style: cur ? cur.css : '' }),
      h('span', { text: cur ? cur.name + ' · ' + catName(cur.cat) : 'Sin fondo del catálogo' })
    ]));
    kids.push(ui.fBtns([['Elegir fondo… (' + (WB.BG ? WB.BG.list.length : 0) + ')', function () { B.open(); }, 'btn-primary', 'Papel, madera, telas, mármol, pizarra, metal, naturaleza, geométricos…']]));
    if (b && img) {
      var veil = parseFloat(b.style.getPropertyValue('--veil'));
      if (isNaN(veil)) veil = 0.82;
      kids.push(ui.fRange('Velo sobre la imagen (para leer mejor)', { min: 0, max: 100, step: 5, value: Math.round(veil * 100), unit: '%', on: function (v) { b.style.setProperty('--veil', (v / 100).toFixed(2)); E.changed(); } }));
    }
    if (b && b.getAttribute('data-texture')) {
      kids.push(ui.fSelect('Textura', TEXTURES, b.getAttribute('data-texture') || '', function (v) {
        if (v) b.setAttribute('data-texture', v); else b.removeAttribute('data-texture');
        redo();
      }));
    }
    if (b) {
      kids.push(ui.fBtns([
        img ? ['Quitar la imagen', function () { img.remove(); b.style.setProperty('--veil', '0'); redo(); }] : null,
        ['Quitar el fondo', function () { b.remove(); redo(); }, 'btn-ghost']
      ]));
    }
    kids.push(ui.note('El fondo se queda quieto detrás de la página mientras se lee. El velo usa el color de fondo de la paleta, así funciona en claro y en oscuro.'));
    pane.appendChild(ui.group('Fondo de la página', kids, !!b));
  };

  /* ==================================================== portada ========= */

  var baseExtra = P.extra;
  P.extra = function (el, t) {
    var out = baseExtra ? (baseExtra(el, t) || []) : [];
    if (!el.matches('.hero')) return out;
    var mode = el.classList.contains('hero-cover') ? 'cover' : el.classList.contains('hero-center') ? 'center' : '';
    out.push(ui.group('Diseño de la portada', [
      ui.fSelect('Disposición', [['', 'Texto a la izquierda y foto a la derecha'], ['cover', 'Foto a toda la portada, titular encima'], ['center', 'Centrada, sin foto']], mode, function (v) {
        el.classList.remove('hero-cover', 'hero-center');
        if (v === 'cover') {
          el.classList.add('hero-cover');
          if (!el.querySelector('.hero-visual')) {
            var src = WB.scenes.url(Math.floor(Math.random() * WB.scenes.count));
            el.querySelector('.hero-container').appendChild(E.make('<div class="hero-visual"><figure class="hero-frame" data-lightbox-src="' + src + '" data-lightbox-caption=""><img src="' + src + '" alt="" loading="eager" /><figcaption class="hero-caption"><span>Pie de la imagen de portada</span><span class="license-tag">Autor / licencia</span></figcaption></figure></div>'));
          }
        }
        if (v === 'center') el.classList.add('hero-center');
        E.commit('portada');
        P.renderProps();
      }),
      ui.note('Con la foto a toda la portada, el titular va en blanco sobre un degradado oscuro para que se lea siempre.')
    ], true));
    return out;
  };
})();
