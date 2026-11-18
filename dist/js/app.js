/* ==========================================================================
   weBlogger - arranque, biblioteca, archivo, vista previa, menus y atajos.
   ========================================================================== */
(function () {
  'use strict';

  var E = WB.ed, D = WB.doc, P = WB.panels;
  var h = P.h;
  var app = document.getElementById('app');
  var library = document.getElementById('library');
  var stage = document.getElementById('stage');
  var preview = document.getElementById('preview');
  var previewFrame = document.getElementById('previewFrame');
  var editLang = document.getElementById('editLang');
  var A = WB.app = {};
  var root = '';
  var env = { version: '', defaultRoot: '', cfgPath: '' };

  WB.tpl = { css: '', js: '', edcss: '' };

  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('no se pudo leer ' + url);
      return r.text();
    });
  }

  function isDirty() { return !document.getElementById('dirtyFlag').hidden; }
  function hasDoc() { return !!E.idoc; }
  function baseName(p) { return String(p || '').replace(/[\\/]+$/, '').split(/[\\/]/).pop(); }

  function setView(v) {
    app.dataset.view = v;
    stage.hidden = v !== 'editor';
    E.refreshSoon();
  }

  /* ========================================================= archivo ===== */

  /** Antes de perder el articulo abierto: guardar, descartar o seguir. */
  function confirmDiscard() {
    if (!hasDoc() || !isDirty()) return Promise.resolve(true);
    return WB.dlg.show({
      kind: 'ask',
      title: 'Hay cambios sin guardar',
      message: 'El artículo «' + (D.s.title || baseName(D.s.path)) + '» tiene cambios que no se han guardado.',
      buttons: [
        { id: 'cancel', label: 'Cancelar', isCancel: true },
        { id: 'no', label: 'No guardar', variant: 'danger' },
        { id: 'yes', label: 'Guardar', variant: 'primary', isDefault: true }
      ]
    }).then(function (id) {
      if (id === 'yes') return A.save().then(function () { return !isDirty(); });
      return id === 'no';
    });
  }

  function closeDoc() {
    E.unmount();
    D.clearAssets();
    D.s = D.blank();
    WB.ui.markDirty(false);
    WB.fmt.reset();
    if (WB.pub) WB.pub.clear();
    P.renderAll();
    A.syncTitle();
  }
  A.closeDoc = closeDoc;
  A.setView = setView;
  A.freeFolder = freeFolder;
  A.confirmDiscard = confirmDiscard;
  A.root = function () { return root; };

  function openDoc(parsed, folder, isNew) {
    D.clearAssets();
    D.s = parsed.s;
    D.s.path = folder;
    setView('editor');
    var tmp = document.createElement('template');
    tmp.innerHTML = parsed.body;
    var ready = (!isNew && folder) ? D.loadLocalImages(tmp.content, folder) : Promise.resolve();
    return ready.then(function () {
      return E.mount(tmp.innerHTML);
    }).then(function () {
      WB.hist.reset();
      WB.fmt.reset();
      WB.ui.markDirty(false);
      if (isNew) WB.ui.markDirty(true);
      A.syncLangs();
      A.syncTitle();
      P.renderAll();
      WB.ui.setDockTab('blocks');
      if (!isNew) WB.cfg.set(WB.cfg.K.last, folder);
      if (WB.pub) return WB.pub.opened(folder, isNew);
    });
  }
  A.openDoc = openDoc;

  function freeFolder(slug) {
    function attempt(n) {
      var folder = WB.join(root, n > 1 ? slug + '-' + n : slug);
      return WB.invoke('path_exists', { path: folder }).then(function (yes) {
        return yes ? attempt(n + 1) : folder;
      });
    }
    return attempt(1);
  }

  A.newFrom = function (tplId, presetName) {
    var tpl = WB.TEMPLATES.filter(function (t) { return t.id === tplId; })[0] || WB.TEMPLATES[0];
    return confirmDiscard().then(function (ok) {
      if (!ok) return null;
      if (presetName) return presetName;
      return WB.dlg.prompt('Nuevo artículo · ' + tpl.name, 'Título del artículo. De él sale el nombre de la carpeta donde se guardará.', '', 'Por ejemplo: La fiesta mayor de mi barrio');
    }).then(function (name) {
      if (name === null || name === undefined) return;
      name = name.trim() || 'Artículo sin título';
      var slug = D.slug(name);
      return freeFolder(slug).then(function (folder) {
        var built = tpl.build(name);
        var s = D.blank();
        s.title = name;
        s.key = baseName(folder);
        s.paletteId = tpl.palette;
        s.palette = JSON.parse(JSON.stringify(WB.PALETTES[tpl.palette]));
        delete s.palette.name;
        Object.assign(s, built.set);
        return openDoc({ s: s, body: built.body }, folder, true);
      }).then(function () {
        WB.ui.status('artículo nuevo: se guardará en ' + D.s.path);
      });
    });
  };

  A.openFolder = function (folder) {
    return confirmDiscard().then(function (ok) {
      if (!ok) return;
      var opt = function (rel) {
        return WB.invoke('read_text', { path: WB.join(folder, rel) }).catch(function () { return ''; });
      };
      return WB.invoke('read_text', { path: WB.join(folder, 'index.html') }).then(function (html) {
        return Promise.all([opt('css/estilos.css'), opt('js/app.js')]).then(function (f) {
          return openDoc(D.parse(html, f[0], f[1], baseName(folder)), folder, false);
        });
      }).then(function () {
        WB.ui.status('abierto: ' + folder);
      });
    });
  };

  A.save = function () {
    if (!hasDoc()) return Promise.resolve();
    if (!D.s.path) return A.saveAs();
    var folder = D.s.path;
    return D.save(E.idoc, folder).then(function () {
      WB.ui.markDirty(false);
      WB.cfg.set(WB.cfg.K.last, folder);
      WB.ui.status('guardado en ' + folder);
      WB.dlg.toast('Artículo guardado', 'ok', 1800);
      A.syncTitle();
      P.renderPage();
    });
  };

  A.saveAs = function () {
    if (!hasDoc()) return Promise.resolve();
    return WB.dlg.prompt('Guardar como', 'Nombre de la carpeta nueva dentro de la biblioteca.', baseName(D.s.path) || D.slug(D.s.title)).then(function (name) {
      if (!name) return;
      return freeFolder(D.slug(name)).then(function (folder) {
        D.s.path = folder;
        D.s.key = baseName(folder);
        return A.save();
      });
    });
  };

  /* ====================================================== biblioteca ===== */

  function tplArt(id) {
    var p = WB.PALETTES[id] || WB.PALETTES.terracota;
    var L = p.light;
    function bar(w, c, ht) { var i = h('i'); i.style.width = w; i.style.background = c; if (ht) i.style.height = ht; return i; }
    var top = h('div', { class: 't-bar' }, [h('i', { class: 't-dot' }), bar('34px', L.textMuted, '4px')]);
    top.style.background = L.bgSecondary;
    top.firstChild.style.background = L.accent;
    var pic = h('i', { class: 't-pic' });
    pic.style.background = 'linear-gradient(135deg, ' + L.accent + ', ' + p.accent2 + ')';
    var body = h('div', { class: 't-body' }, [
      h('div', { class: 't-lines' }, [bar('46%', L.accent, '4px'), bar('100%', L.textPrimary, '8px'), bar('82%', L.textPrimary, '8px'), bar('94%', L.textMuted), bar('70%', L.textMuted)]),
      pic
    ]);
    var art = h('div', { class: 'tpl-art' }, [top, body]);
    art.style.background = L.bgPrimary;
    return art;
  }

  function when(secs) {
    if (!secs) return '';
    var d = new Date(secs * 1000);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' +
      d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  function articleCard(a) {
    var art = h('div', { class: 'card-art' });
    if (/^https?:/.test(a.cover)) {
      art.appendChild(h('img', { src: a.cover, alt: '', loading: 'lazy' }));
    } else if (a.cover && !/^data:/.test(a.cover)) {
      WB.invoke('read_b64', { path: WB.join(a.path, a.cover) }).then(function (b64) {
        var ext = (/\.([a-z0-9]+)$/i.exec(a.cover) || [])[1] || 'jpeg';
        art.appendChild(h('img', { src: 'data:image/' + ext.replace('jpg', 'jpeg').replace('svg', 'svg+xml') + ';base64,' + b64, alt: '' }));
      }).catch(function () {});
    }
    var card = h('div', { class: 'card' + (a.kind === 'periodico' ? ' is-weblog' : ''), tabIndex: 0, title: a.path }, [
      art,
      h('div', { class: 'card-body' }, [
        h('span', { class: 'card-name', text: a.title || a.name }),
        h('span', { class: 'card-sub', text: (a.kind === 'periodico' ? 'Periódico · ' : 'Blog · ') + a.name }),
        h('span', { class: 'card-meta', text: when(a.modified) })
      ]),
      h('div', { class: 'card-tools' }, [
        h('button', { type: 'button', class: 'icon-btn mini', title: 'Abrir la carpeta', onclick: function (ev) { ev.stopPropagation(); WB.invoke('open_external', { path: a.path }).catch(WB.ui.fail); } }, [WB.ui.svgUse('ic-open')]),
        h('button', { type: 'button', class: 'icon-btn mini', title: 'Ver en el navegador', onclick: function (ev) { ev.stopPropagation(); WB.invoke('open_external', { path: WB.join(a.path, 'index.html') }).catch(WB.ui.fail); } }, [WB.ui.svgUse('ic-globe')]),
        h('button', { type: 'button', class: 'icon-btn mini', title: 'Borrar el artículo', onclick: function (ev) {
          ev.stopPropagation();
          WB.dlg.show({
            kind: 'warn', title: 'Borrar el artículo',
            message: 'Se borrará del disco la carpeta entera de «' + (a.title || a.name) + '», con su HTML, CSS, JavaScript e imágenes. No se puede deshacer.',
            detail: a.path,
            buttons: [{ id: 'no', label: 'Cancelar', isCancel: true, isDefault: true }, { id: 'si', label: 'Borrar la carpeta', variant: 'danger' }]
          }).then(function (id) {
            if (id !== 'si') return;
            return WB.invoke('remove_article', { path: a.path }).then(function () { WB.ui.status('borrado: ' + a.name); renderLibrary(); });
          }).catch(WB.ui.fail);
        } }, [WB.ui.svgUse('ic-trash')])
      ])
    ]);
    card.addEventListener('click', function () { A.openFolder(a.path).catch(WB.ui.fail); });
    card.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') A.openFolder(a.path).catch(WB.ui.fail); });
    return card;
  }

  function renderLibrary() {
    library.textContent = '';

    var logo = WB.ui.svgUse('ic-logo');
    logo.setAttribute('class', 'lib-logo');
    library.appendChild(h('div', { class: 'hero' }, [
      h('div', { class: 'lib-head' }, [
        logo,
        h('div', null, [
          h('h1', { class: 'hero-title', text: 'weBlogger' }),
          h('p', { class: 'hero-sub', text: 'Escribe y maqueta artículos de blog. Cada artículo es una carpeta con su HTML, su CSS, su JavaScript y sus imágenes, lista para publicar.' })
        ]),
        h('span', { class: 'bitxo-logo', title: 'BitxoSOFT' }, ['BITXO', h('b', { text: 'SOFT (c)' }), ' ' + new Date().getFullYear()])
      ]),
      h('div', { class: 'lib-root' }, [
        h('span', { class: 'card-sub', text: 'Biblioteca:' }),
        h('span', { class: 'chip', text: root }),
        h('button', { type: 'button', class: 'btn', text: 'Cambiar de carpeta…', 'data-action': 'pick-root' }),
        h('button', { type: 'button', class: 'btn', text: 'Abrir una carpeta de artículo…', 'data-action': 'open-folder' }),
        h('button', { type: 'button', class: 'btn btn-ghost', text: 'Ver en el explorador', 'data-action': 'reveal-root' })
      ])
    ]));

    library.appendChild(h('h2', { class: 'lib-title', text: 'Empezar una edición' }));
    function start(kind, icon, title, text, foot) {
      var ic = WB.ui.svgUse(icon);
      return h('button', { type: 'button', class: 'start-card start-' + kind, 'data-action': 'edition' }, [
        h('span', { class: 'start-icon' }, [ic]),
        h('span', { class: 'start-text' }, [h('b', { text: title }), h('span', { text: text }), h('small', { text: foot })])
      ]);
    }
    library.appendChild(h('div', { class: 'lib-start' }, [
      start('blog', 'ic-globe', 'Blog', 'Para la web: las páginas se leen seguidas, deslizando, en claro y oscuro y en varios idiomas.', 'Se guarda como sitio web · HTML, CSS y JavaScript'),
      start('print', 'ic-masthead', 'Periódico o revista', 'Para imprimir en su tamaño de papel, viendo dónde corta cada hoja.', 'PDF de imprenta con sangrado, marcas de corte y CMYK · Word · .weblog'),
      start('styles', 'ic-palette', ((WB.styles && WB.styles.list.length) || 0) + ' estilos de prensa', 'Diarios de sábana, tabloides, semanarios, revistas y prensa del corazón de medio mundo.', 'Cada página, con el suyo')
    ]));

    library.appendChild(h('h2', { class: 'lib-title', text: 'Tus artículos' }));
    var agrid = h('div', { class: 'lib-grid' });
    library.appendChild(agrid);
    WB.invoke('list_articles', { root: root }).then(function (list) {
      if (!list.length) {
        agrid.replaceWith(h('div', { class: 'lib-empty', text: 'Todavía no hay artículos en esta carpeta. Elige una plantilla de arriba para crear el primero.' }));
        return;
      }
      list.forEach(function (a) { agrid.appendChild(articleCard(a)); });
    }).catch(WB.ui.fail);
  }

  A.showLibrary = function () {
    return confirmDiscard().then(function (ok) {
      if (!ok) return;
      if (hasDoc()) closeDoc();
      setView('library');
      renderLibrary();
    });
  };

  /* ==================================================== vista previa ===== */

  A.preview = function () {
    if (!hasDoc()) return;
    var html = D.buildHtml(E.idoc, true);
    var dict = D.exportI18n(E.idoc);
    preview.hidden = false;
    previewFrame.onload = function () {
      previewFrame.onload = null;
      var pd = previewFrame.contentDocument;
      previewFrame.contentWindow.WB_I18N = dict;
      // dentro de la aplicacion un enlace externo se llevaria la ventana
      pd.addEventListener('click', function (ev) {
        var a = ev.target.closest ? ev.target.closest('a[href]') : null;
        if (!a || a.getAttribute('href').charAt(0) === '#') return;
        ev.preventDefault();
        WB.dlg.toast('Enlace a ' + a.getAttribute('href'), 'info', 2600);
      }, true);
      pd.addEventListener('keydown', function (ev) {
        var mod = ev.ctrlKey || ev.metaKey;
        var k = (ev.key || '').toLowerCase();
        if (ev.key === 'Escape' && !pd.querySelector('.lightbox.open, .wb-modal.open')) A.previewClose();
        else if (k === 'f5') { ev.preventDefault(); A.previewClose(); }   // sin esto F5 recargaria la aplicacion
        else if (mod && k === 'r') ev.preventDefault();
        else if (mod && k === 's') { ev.preventDefault(); A.save().catch(WB.ui.fail); }
        else if (k === 'f11') { ev.preventDefault(); WB.run('fullscreen'); }
      });
      var sc = pd.createElement('script');
      sc.src = 'plantilla/app.js';
      pd.body.appendChild(sc);
    };
    previewFrame.srcdoc = html;
  };

  A.previewClose = function () {
    preview.hidden = true;
    previewFrame.srcdoc = '';
  };

  function previewDevice(px) {
    var st = previewFrame.parentElement;
    st.style.setProperty('--page-w', +px ? px + 'px' : '100%');
    st.dataset.device = +px ? 'narrow' : 'full';
    document.querySelectorAll('[data-pdevice]').forEach(function (b) { b.classList.toggle('is-active', b.dataset.pdevice === String(px)); });
  }

  /* ================================================ sincronizar barra ==== */

  A.syncTitle = function () {
    var name = hasDoc() ? (D.s.title || baseName(D.s.path) || 'sin título') : '';
    document.getElementById('docName').textContent = hasDoc() ? (baseName(D.s.path) || 'sin guardar') : '';
    WB.invoke('win_title', { title: name ? name + ' — weBlogger' : 'weBlogger' }).catch(function () {});
  };

  A.syncLangs = function () {
    var s = D.s;
    editLang.textContent = '';
    s.langs.forEach(function (l) {
      editLang.appendChild(h('option', { value: l, text: (WB.LANGS[l] ? WB.LANGS[l].name : l) + (l === s.lang ? ' (base)' : '') }));
    });
    editLang.value = s.editLang;
    document.getElementById('editLangField').hidden = s.langs.length < 2;
    document.getElementById('statusLang').textContent = 'idioma: ' + s.editLang;
  };

  function setEditLang(lang) {
    if (!hasDoc() || D.s.langs.indexOf(lang) < 0 || lang === D.s.editLang) return;
    D.setEditLang(E.idoc, lang);
    E.afterDom();
    WB.hist.push();
    A.syncLangs();
    P.renderOutline();
    WB.ui.status('escribiendo en ' + (WB.LANGS[lang] ? WB.LANGS[lang].name : lang) +
      (lang === D.s.lang ? '' : ' · los textos sin traducir se ven en el idioma anterior'));
  }

  editLang.addEventListener('change', function () { setEditLang(editLang.value); });

  function syncPageTheme() {
    var use = document.querySelector('#pageThemeBtn use');
    use.setAttribute('href', E.pageTheme === 'dark' ? '#ic-sun' : '#ic-moon');
  }

  // palabras y tiempo de lectura, como en una redaccion
  setInterval(function () {
    var cell = document.getElementById('statusWords');
    if (!hasDoc()) { cell.textContent = ''; return; }
    var body = E.idoc.querySelector('.article-content') || E.idoc.body;
    var n = (body.innerText.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
    cell.textContent = n + ' palabras · ' + Math.max(1, Math.round(n / 220)) + ' min';
  }, 1500);

  /* ========================================================= acciones ==== */

  var X = WB.actions;

  X['new'] = function (id) {
    if (id) return A.newFrom(id);
    if (app.dataset.view === 'library' && !hasDoc()) return A.newFrom('blank');
    WB.ui.popup(WB.TEMPLATES.map(function (t) { return { icon: 'ic-new', label: t.name, action: 'new:' + t.id }; }),
      document.querySelector('[data-action="new"]'));
  };
  X.library = A.showLibrary;
  X.save = A.save;
  X['save-as'] = A.saveAs;
  X.close = A.showLibrary;

  X['open-folder'] = function () {
    return WB.invoke('pick_folder', { start: root }).then(function (p) {
      if (!p) return;
      return WB.invoke('path_exists', { path: WB.join(p, 'index.html') }).then(function (yes) {
        if (!yes) { WB.ui.fail('esa carpeta no tiene un index.html: no es un artículo'); return; }
        return A.openFolder(p);
      });
    });
  };

  X['pick-root'] = function () {
    return WB.invoke('pick_folder', { start: root }).then(function (p) {
      if (!p) return;
      root = p;
      WB.cfg.set(WB.cfg.K.root, p);
      WB.ui.status('biblioteca: ' + p);
      if (app.dataset.view === 'library') renderLibrary();
    });
  };

  X['reveal-root'] = function () {
    // la carpeta de la biblioteca se crea al guardar el primer articulo
    return WB.invoke('path_exists', { path: root }).then(function (yes) {
      if (!yes) { WB.ui.status('la carpeta se creará al guardar el primer artículo'); return; }
      return WB.invoke('open_external', { path: root });
    });
  };

  X['reveal-doc'] = function () {
    if (!hasDoc()) return;
    return WB.invoke('open_external', { path: D.s.path });
  };

  X.browser = function () {
    if (!hasDoc()) return;
    var go = function () { return WB.invoke('open_external', { path: WB.join(D.s.path, 'index.html') }); };
    if (!isDirty()) return go();
    // el navegador abre lo que hay en el disco: primero hay que guardarlo
    return A.save().then(function () { if (!isDirty()) return go(); });
  };

  X.preview = function () { if (preview.hidden) A.preview(); else A.previewClose(); };
  X['preview-close'] = A.previewClose;
  X['preview-device'] = previewDevice;

  X.undo = function () { WB.hist.go(-1); A.syncLangs(); };
  X.redo = function () { WB.hist.go(1); A.syncLangs(); };
  X.dup = function () { E.duplicate(); };
  X.del = function () { E.remove(); };
  X.move = function (dir) { E.move(+dir); };
  X['sel-parent'] = function () { E.selectParent(); };
  X.insert = function (id) { if (hasDoc()) E.insert(id); };
  X.link = function () { WB.fmt.link(); };
  X.fmt = function (name) { WB.fmt.cmd(name); };
  X.fx = function (id) { WB.fmt.effect(id); };
  X.art = function () { WB.art.fromBlock(); };
  X.symbols = function () { WB.fmt.symbols(); };

  X.device = function (px) {
    E.setWidth(+px);
    document.querySelectorAll('[data-device]').forEach(function (b) {
      if (b.tagName === 'BUTTON') b.classList.toggle('is-active', b.dataset.device === String(px));
    });
  };

  X['page-theme'] = function (t) {
    E.setPageTheme(t === 'light' || t === 'dark' ? t : (E.pageTheme === 'dark' ? 'light' : 'dark'));
    syncPageTheme();
    WB.ui.status('artículo en modo ' + (E.pageTheme === 'dark' ? 'oscuro' : 'claro'));
  };

  X['edit-lang'] = setEditLang;
  X.palette = function (id) {
    if (!hasDoc() || !WB.PALETTES[id]) return;
    D.s.palette = JSON.parse(JSON.stringify(WB.PALETTES[id]));
    delete D.s.palette.name;
    D.s.paletteId = id;
    E.applyVars();
    WB.art.renderAll(E.idoc, true);
    E.commit('paleta: ' + WB.PALETTES[id].name);
    P.renderPage();
  };
  X.toc = function () { E.autoToc(); WB.ui.status('índice revisado'); };

  X['theme-set'] = function (t) { WB.ui.setTheme(t); };
  X['app-theme'] = function () { WB.ui.setTheme(WB.ui.theme === 'light' ? 'dark' : 'light'); };
  X['dock-set'] = function (s) { WB.ui.setDockSide(s); WB.ui.setDockOpen(true); };
  X['dock-toggle'] = function () { WB.ui.setDockOpen(!WB.ui.dockOpen); };
  X['dock-tab'] = function (t) { WB.ui.setDockTab(t); };
  X.fullscreen = function () {
    return WB.invoke('win_fullscreen').then(function (on) { WB.ui.status(on ? 'pantalla completa · F11 para salir' : 'ventana normal'); });
  };
  X['win-toggle'] = function () { return WB.invoke('win_toggle_maximize'); };
  X['win-minimize'] = function () { return WB.invoke('win_minimize'); };

  X.exit = function () {
    return confirmDiscard().then(function (ok) {
      if (ok) return WB.cfg.save().catch(function () {}).then(function () { return WB.invoke('app_exit'); });
    });
  };

  /* ---------------------------------------------------------- splash ---- */
  // La imagen tiembla como gelatina 3 segundos y se desvanece. Al arrancar se
  // va sola; desde «Acerca de» vuelve a salir y se queda hasta que se cierra.
  var splash = document.getElementById('splash');
  var splashImg = document.getElementById('splashImg');
  var splashInfo = document.getElementById('splashInfo');
  var splashStart = Date.now();
  var splashTimer = 0;
  var JELLY_MS = 3000, FADE_MS = 700;

  function hideSplash() {
    clearTimeout(splashTimer);
    if (splash.hidden || splash.classList.contains('is-out')) return;
    splash.classList.add('is-out');
    splashTimer = setTimeout(function () { splash.hidden = true; }, FADE_MS);
  }

  function showSplash(info) {
    clearTimeout(splashTimer);
    splashInfo.textContent = info || '';
    splashInfo.hidden = !info;
    splash.hidden = false;
    WB.splashFx.play();                    // repite los 3 segundos de gelatina
    void splash.offsetWidth;
    splash.classList.remove('is-out');
    splash.dataset.mode = info ? 'info' : 'start';
  }

  splash.addEventListener('click', hideSplash);
  document.addEventListener('keydown', function (ev) {
    if (splash.hidden || splash.classList.contains('is-out')) return;
    if (ev.key === 'Escape' || ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      ev.stopPropagation();
      hideSplash();
    }
  }, true);

  X.about = function () {
    WB.ui.closeMenus();
    showSplash('versión ' + env.version + '  ·  biblioteca: ' + root + '  ·  clic o Esc para cerrar');
  };

  X.keys = function () {
    return WB.dlg.show({
      title: 'Atajos de teclado', wide: 520,
      detail: [
        'Ctrl+N          artículo nuevo',
        'Ctrl+O          biblioteca',
        'Ctrl+S          guardar            Ctrl+Mayús+S  guardar como',
        'Ctrl+Z / Ctrl+Y deshacer / rehacer',
        'Ctrl+B / I / U  negrita / cursiva / subrayado',
        'Ctrl+K          enlace',
        'Ctrl+D          duplicar el bloque',
        'Alt+↑ / Alt+↓   subir / bajar el bloque',
        'Supr            borrar el bloque (sin el cursor en un texto)',
        'Esc             salir del texto / seleccionar el contenedor',
        'Intro           párrafo nuevo     Mayús+Intro  salto de línea',
        'F5              vista previa',
        'F9              plegar el panel',
        'F11             pantalla completa'
      ].join('\n')
    });
  };

  /* ============================================================ menus ==== */

  function insertItems() {
    var out = [];
    WB.CATALOG.forEach(function (c) {
      out.push({
        icon: c.items[0].icon, label: c.cat,
        sub: c.items.map(function (it) { return { icon: it.icon, label: it.name, action: 'insert:' + it.id }; })
      });
    });
    return out;
  }

  function langItems() {
    return D.s.langs.map(function (l) {
      return { label: (WB.LANGS[l] ? WB.LANGS[l].name : l) + (l === D.s.lang ? ' (base)' : ''), action: 'edit-lang:' + l, check: 'lang:' + l };
    });
  }

  WB.blockMenu = function () {
    var free = E.isFree(E.sel);
    var items = [
      { icon: 'ic-settings', label: 'Propiedades', action: 'dock-tab:props' },
      { icon: 'ic-parent', label: 'Seleccionar lo que lo contiene', accel: 'Esc', action: 'sel-parent' },
      { sep: true },
      { icon: 'ic-up', label: 'Subir', accel: 'Alt+↑', action: 'move:-1', disabled: !free },
      { icon: 'ic-down', label: 'Bajar', accel: 'Alt+↓', action: 'move:1', disabled: !free },
      { icon: 'ic-copy', label: 'Duplicar', accel: 'Ctrl+D', action: 'dup', disabled: !free },
      { icon: 'ic-trash', label: 'Eliminar', accel: 'Supr', action: 'del', disabled: !free },
      { sep: true },
      { icon: 'ic-plus', label: 'Insertar debajo', sub: insertItems }
    ];
    if (E.sel && /^(P|H2|H3|H4)$/.test(E.sel.tagName)) items.push({ icon: 'ic-sparkle', label: 'Convertir en texto artístico', action: 'art' });
    return items;
  };

  var ck = WB.ui.checks;
  ck.lang = function (v) { return D.s.editLang === v; };
  ck.pagetheme = function (v) { return E.pageTheme === v; };
  ck.device = function (v) { return String(E.device || 0) === v; };
  ck.pal = function (v) { return D.s.paletteId === v; };

  WB.ui.setMenus([
    {
      label: 'Archivo', items: [
        { icon: 'ic-new', label: 'Nuevo artículo', accel: 'Ctrl+N', sub: function () { return WB.TEMPLATES.map(function (t) { return { icon: 'ic-new', label: t.name, action: 'new:' + t.id }; }); } },
        { icon: 'ic-sparkle', label: 'Nueva edición: blog o periódico…', accel: 'Ctrl+Mayús+N', action: 'edition' },
        { icon: 'ic-book', label: 'Biblioteca', accel: 'Ctrl+O', action: 'library' },
        { icon: 'ic-open', label: 'Abrir una carpeta de artículo…', action: 'open-folder' },
        { sep: true },
        { icon: 'ic-save', label: 'Guardar', accel: 'Ctrl+S', action: 'save' },
        { icon: 'ic-saveas', label: 'Guardar como…', accel: 'Ctrl+Mayús+S', action: 'save-as' },
        { icon: 'ic-new', label: 'PDF para imprenta…', accel: 'Ctrl+P', action: 'press' },
        { icon: 'ic-saveas', label: 'Exportar', sub: function () { return WB.exp.FORMATS.map(function (f) { return { icon: f.icon, label: f.label, action: 'export:' + f.id }; }); } },
        { sep: true },
        { icon: 'ic-eye', label: 'Vista previa', accel: 'F5', action: 'preview' },
        { icon: 'ic-globe', label: 'Abrir en el navegador', action: 'browser' },
        { icon: 'ic-open', label: 'Abrir la carpeta del artículo', action: 'reveal-doc' },
        { sep: true },
        { icon: 'ic-settings', label: 'Cambiar la carpeta de la biblioteca…', action: 'pick-root' },
        { sep: true },
        { icon: 'ic-exit', label: 'Salir', accel: 'Alt+F4', action: 'exit' }
      ]
    },
    {
      label: 'Editar', items: [
        { icon: 'ic-undo', label: 'Deshacer', accel: 'Ctrl+Z', action: 'undo' },
        { icon: 'ic-redo', label: 'Rehacer', accel: 'Ctrl+Y', action: 'redo' },
        { sep: true },
        { icon: 'ic-copy', label: 'Duplicar el bloque', accel: 'Ctrl+D', action: 'dup' },
        { icon: 'ic-trash', label: 'Eliminar el bloque', accel: 'Supr', action: 'del' },
        { icon: 'ic-up', label: 'Subir el bloque', accel: 'Alt+↑', action: 'move:-1' },
        { icon: 'ic-down', label: 'Bajar el bloque', accel: 'Alt+↓', action: 'move:1' },
        { sep: true },
        { icon: 'ic-parent', label: 'Seleccionar lo que lo contiene', accel: 'Esc', action: 'sel-parent' }
      ]
    },
    { label: 'Insertar', items: insertItems },
    {
      label: 'Formato', items: [
        { label: 'Negrita', accel: 'Ctrl+B', action: 'fmt:bold' },
        { label: 'Cursiva', accel: 'Ctrl+I', action: 'fmt:italic' },
        { label: 'Subrayado', accel: 'Ctrl+U', action: 'fmt:underline' },
        { label: 'Tachado', action: 'fmt:strikeThrough' },
        { sep: true },
        { icon: 'ic-link', label: 'Enlace…', accel: 'Ctrl+K', action: 'link' },
        { icon: 'ic-symbol', label: 'Símbolos…', action: 'symbols' },
        { sep: true },
        { icon: 'ic-sparkle', label: 'Efecto de texto', sub: function () { return WB.TEXT_FX.map(function (f) { return { label: f.name, action: 'fx:' + f.id }; }); } },
        { icon: 'ic-sparkle', label: 'Texto artístico (curvado, 3D)', action: 'art' },
        { sep: true },
        { icon: 'ic-clear', label: 'Quitar el formato', action: 'fmt:removeFormat' }
      ]
    },
    {
      label: 'Artículo', items: [
        { icon: 'ic-plus', label: 'Página nueva…', action: 'gallery:page' },
        { icon: 'ic-palette', label: 'Cambiar el estilo de la página…', action: 'gallery:restyle' },
        { group: 'Tipo de publicación' },
        { icon: 'ic-globe', label: 'Blog (web, lectura seguida)', action: 'medium:blog', check: 'medium:blog' },
        { icon: 'ic-masthead', label: 'Periódico o revista (papel)', action: 'medium:periodico', check: 'medium:periodico' },
        { icon: 'ic-new', label: 'Tamaño del papel', sub: function () { return WB.edition.PAPERS.map(function (p) { return { label: p.name + ' · ' + p.mm[0] + '×' + p.mm[1] + ' mm', action: 'paper:' + p.id, check: 'paper:' + p.id, disabled: WB.pub.medium !== 'periodico' }; }); } },
        { sep: true },
        { icon: 'ic-up', label: 'Página anterior', accel: 'Ctrl+RePág', action: 'page-prev' },
        { icon: 'ic-down', label: 'Página siguiente', accel: 'Ctrl+AvPág', action: 'page-next' },
        { icon: 'ic-trash', label: 'Quitar esta página', action: 'page-del' },
        { sep: true },
        { icon: 'ic-settings', label: 'Ajustes de la página', action: 'dock-tab:page' },
        { icon: 'ic-layers', label: 'Esquema', action: 'dock-tab:outline' },
        { sep: true },
        { icon: 'ic-palette', label: 'Paleta de colores', sub: function () { return Object.keys(WB.PALETTES).map(function (id) { return { label: WB.PALETTES[id].name, action: 'palette:' + id, check: 'pal:' + id }; }); } },
        { icon: 'ic-globe', label: 'Idioma que escribo', sub: langItems },
        { sep: true },
        { group: 'Ver el artículo en' },
        { icon: 'ic-sun', label: 'Modo claro', action: 'page-theme:light', check: 'pagetheme:light' },
        { icon: 'ic-moon', label: 'Modo oscuro', action: 'page-theme:dark', check: 'pagetheme:dark' },
        { sep: true },
        { icon: 'ic-monitor', label: 'Ancho de escritorio', action: 'device:0', check: 'device:0' },
        { icon: 'ic-tablet', label: 'Ancho de tableta', action: 'device:820', check: 'device:820' },
        { icon: 'ic-phone', label: 'Ancho de móvil', action: 'device:390', check: 'device:390' }
      ]
    },
    {
      label: 'Ver', items: [
        { group: 'Tema de la aplicación' },
        { icon: 'ic-sun', label: 'Claro', action: 'theme-set:light', check: 'theme:light' },
        { icon: 'ic-moon', label: 'Oscuro', action: 'theme-set:dark', check: 'theme:dark' },
        { icon: 'ic-palette', label: 'Metal', action: 'theme-set:metal', check: 'theme:metal' },
        { icon: 'ic-palette', label: 'Azul', action: 'theme-set:blue', check: 'theme:blue' },
        { sep: true },
        { group: 'Panel' },
        { icon: 'ic-dock-left', label: 'A la izquierda', action: 'dock-set:left', check: 'dock:left' },
        { icon: 'ic-dock-right', label: 'A la derecha', action: 'dock-set:right', check: 'dock:right' },
        { icon: 'ic-dock-top', label: 'Arriba', action: 'dock-set:top', check: 'dock:top' },
        { icon: 'ic-dock-bottom', label: 'Abajo', action: 'dock-set:bottom', check: 'dock:bottom' },
        { label: 'Mostrar el panel', accel: 'F9', action: 'dock-toggle', check: 'dockopen' },
        { sep: true },
        { group: 'Ventana' },
        { icon: 'ic-window', label: 'Pantalla completa', accel: 'F11', action: 'fullscreen' },
        { icon: 'ic-maximize', label: 'Maximizar / restaurar', action: 'win-toggle' },
        { icon: 'ic-minimize', label: 'Minimizar', action: 'win-minimize' }
      ]
    },
    {
      label: 'Ayuda', items: [
        { icon: 'ic-info', label: 'Acerca de weBlogger', accel: 'F1', action: 'about' },
        { icon: 'ic-terminal', label: 'Atajos de teclado', action: 'keys' }
      ]
    }
  ]);

  /* =========================================================== atajos ==== */

  /** Atajos comunes. Lo llaman la ventana y el documento del articulo. */
  WB.shortcut = function (ev) {
    var mod = ev.ctrlKey || ev.metaKey;
    var k = (ev.key || '').toLowerCase();
    var act = null;
    var t = ev.target;
    var inField = t && t.ownerDocument === document && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);

    if (mod && !ev.altKey) {
      if (k === 's') act = ev.shiftKey ? 'save-as' : 'save';
      else if (k === 'z' && !inField) act = ev.shiftKey ? 'redo' : 'undo';
      else if (k === 'y' && !inField) act = 'redo';
      else if (k === 'n') act = ev.shiftKey ? 'edition' : 'new';
      else if (k === 'p') act = 'press';
      else if (k === 'pagedown') act = 'page-next';
      else if (k === 'pageup') act = 'page-prev';
      else if (k === 'o') act = 'library';
      else if (k === 'd' && !inField) act = 'dup';
      else if (k === 'k' && !inField) act = 'link';
    } else if (ev.altKey && !mod && !inField) {
      if (k === 'arrowup') act = 'move:-1';
      else if (k === 'arrowdown') act = 'move:1';
    } else if (k === 'f1') act = 'about';
    else if (k === 'f5') act = 'preview';
    else if (k === 'f9') act = 'dock-toggle';
    else if (k === 'f11') act = 'fullscreen';

    if (!act) return false;
    ev.preventDefault();
    if (!document.getElementById('dialogLayer').hidden) return true;   // con un dialogo abierto no se dispara nada
    WB.run(act);
    return true;
  };

  document.addEventListener('keydown', function (ev) {
    if (WB.shortcut(ev)) return;
    var inField = /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName);
    if (ev.key === 'Escape' && !preview.hidden) { A.previewClose(); return; }
    if (inField || !hasDoc() || !document.getElementById('dialogLayer').hidden) return;
    if (ev.key === 'Delete' && E.sel) { ev.preventDefault(); E.remove(); }
  });

  /* ========================================================== arranque === */

  WB.listen('wb-close', function () { WB.run('exit'); });

  WB.cfg.load().catch(function () {}).then(function () {
    var c = WB.cfg;
    WB.ui.setTheme(c.get(c.K.theme, 'dark'), false);
    WB.ui.setDockSide(c.get(c.K.dockSide, 'right'), false);
    WB.ui.setDockOpen(c.get(c.K.dockOpen, 'true') !== 'false', false);
    WB.ui.setDockWidth(c.get(c.K.dockW, '340'), false);
    syncPageTheme();
    return Promise.all([
      WB.invoke('env_info'),
      fetchText('plantilla/estilos.css'),
      fetchText('plantilla/app.js'),
      fetchText('plantilla/editor-frame.css')
    ]);
  }).then(function (r) {
    env = r[0];
    WB.tpl.css = r[1];
    WB.tpl.js = r[2];
    WB.tpl.edcss = r[3];
    // hojas de los formatos de diario, y sus plantillas en la biblioteca
    WB.tpl.formats = {};
    return Promise.all(Object.keys(WB.FORMATS).map(function (id) {
      var f = WB.FORMATS[id];
      WB.TEMPLATES.push({ id: 'fmt-' + id, name: f.name, desc: f.desc, palette: 'fmt-' + id, format: id, build: function (name) {
        return { body: f.build(name), set: { format: id, fontDisplay: f.fontDisplay, fontBody: f.fontBody, radius: f.radius || 'none' } };
      } });
      return fetchText('plantilla/formatos/' + id + '.css').then(function (css) { WB.tpl.formats[id] = css; });
    })).then(function () { return r; });
  }).then(function (r) {
    root = WB.cfg.get(WB.cfg.K.root, '') || env.defaultRoot;
    document.getElementById('statusVersion').textContent = 'weBlogger ' + env.version;
    P.renderAll();
    setView('library');
    renderLibrary();
    WB.ui.status('listo');
  }).catch(WB.ui.fail).then(function () {
    // la aplicacion empieza cuando la gelatina ha durado sus 3 segundos
    var began = WB.splashFx.startedAt || splashStart;
    splashTimer = setTimeout(hideSplash, Math.max(0, JELLY_MS - (Date.now() - began)));
  });
})();
