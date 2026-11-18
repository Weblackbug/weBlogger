/* ==========================================================================
   weBlogger (n.k-7) - interfaz: menu clasico, panel movible, tema, estado
   Las acciones se registran en `WB.actions` y cualquier elemento con
   `data-action` las dispara. `nombre:argumento` pasa el argumento.
   ========================================================================== */
(function () {
  'use strict';

  var app = document.getElementById('app');
  var html = document.documentElement;
  var menuRoot = document.getElementById('menuRoot');
  var menuLayer = document.getElementById('menuLayer');
  var statusMsg = document.getElementById('statusMsg');

  var THEMES = ['light', 'dark', 'metal', 'blue'];
  var SIDES = ['right', 'bottom', 'left', 'top'];

  /* ======================================================= acciones ====== */

  WB.actions = Object.create(null);

  WB.run = function (spec, source) {
    if (!spec) return;
    var i = spec.indexOf(':');
    var name = i > -1 ? spec.slice(0, i) : spec;
    var arg = i > -1 ? spec.slice(i + 1) : undefined;
    var fn = WB.actions[name];
    if (!fn) { status('accion sin implementar: ' + name); return; }
    try {
      var r = fn(arg, source);
      if (r && typeof r.catch === 'function') r.catch(fail);
    } catch (e) { fail(e); }
  };

  /* ================================================== render del menu === */

  function svgUse(id) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    var u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', '#' + id);
    s.appendChild(u);
    return s;
  }

  var checks = Object.create(null);   // clave -> funcion(valor) que dice si esta marcada
  var openPops = [];
  var activeRoot = null;

  function isChecked(key) {
    var i = key.indexOf(':');
    var kind = i > -1 ? key.slice(0, i) : key;
    var val = i > -1 ? key.slice(i + 1) : null;
    return checks[kind] ? !!checks[kind](val) : false;
  }

  function closeMenus() {
    openPops.forEach(function (p) { if (p.parentNode) p.parentNode.removeChild(p); });
    openPops = [];
    menuLayer.hidden = true;
    if (activeRoot) { activeRoot.setAttribute('aria-expanded', 'false'); activeRoot = null; }
  }

  function closeFrom(depth) {
    while (openPops.length > depth) {
      var p = openPops.pop();
      if (p.parentNode) p.parentNode.removeChild(p);
    }
  }

  function buildPop(items, depth) {
    var pop = document.createElement('div');
    pop.className = 'menu-pop' + (depth > 0 ? ' is-sub' : '');
    pop.setAttribute('role', 'menu');
    pop.style.maxHeight = '78vh';
    pop.style.overflowY = 'auto';

    items.forEach(function (it) {
      if (it.sep) {
        var sep = document.createElement('div');
        sep.className = 'menu-sep';
        pop.appendChild(sep);
        return;
      }
      if (it.group) {
        var g = document.createElement('div');
        g.className = 'menu-group';
        g.textContent = it.group;
        pop.appendChild(g);
        return;
      }

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'menu-item';
      btn.setAttribute('role', 'menuitem');
      // desactivada si no se puede usar ahora mismo (js/disponible.js)
      if (it.disabled || (WB.avail && !WB.avail.item(it))) {
        btn.disabled = true;
        var why = WB.avail && WB.avail.why(it);
        if (why) btn.title = why;
      }

      var mark = document.createElement('span');
      mark.className = 'menu-mark';
      if (it.check && isChecked(it.check)) mark.appendChild(svgUse('ic-check'));
      btn.appendChild(mark);
      if (it.icon) btn.appendChild(svgUse(it.icon));

      var label = document.createElement('span');
      label.className = 'menu-label';
      label.textContent = it.label;
      btn.appendChild(label);

      if (it.accel) {
        var a = document.createElement('span');
        a.className = 'menu-accel';
        a.textContent = it.accel;
        btn.appendChild(a);
      }

      if (it.sub) {
        btn.appendChild(svgUse('ic-chevron-right'));
        var openSub = function (ev) {
          if (ev) ev.stopPropagation();
          if (btn.disabled) { closeFrom(depth + 1); return; }
          closeFrom(depth + 1);
          openPop(typeof it.sub === 'function' ? it.sub() : it.sub, depth + 1, btn, pop);
        };
        btn.addEventListener('mouseenter', function () { openSub(); });
        btn.addEventListener('click', openSub);
      } else {
        btn.addEventListener('mouseenter', function () { closeFrom(depth + 1); });
        btn.addEventListener('click', function () {
          closeMenus();
          WB.run(it.action, btn);
        });
      }
      pop.appendChild(btn);
    });
    return pop;
  }

  function place(pop, anchor, depth, parentPop) {
    var r = anchor.getBoundingClientRect();
    menuLayer.appendChild(pop);
    var pr = pop.getBoundingClientRect();
    var x, y;
    if (depth === 0) { x = r.left; y = r.bottom + 2; }
    else { x = parentPop.getBoundingClientRect().right - 4; y = r.top - 5; }

    var maxX = window.innerWidth - pr.width - 6;
    var maxY = window.innerHeight - pr.height - 6;
    if (x > maxX) x = depth === 0 ? Math.max(6, maxX) : Math.max(6, r.left - pr.width + 4);
    if (x < 6) x = 6;
    if (y > maxY) y = Math.max(6, maxY);
    if (y < 6) y = 6;
    pop.style.left = Math.round(x) + 'px';
    pop.style.top = Math.round(y) + 'px';
  }

  function openPop(items, depth, anchor, parentPop) {
    var pop = buildPop(items, depth);
    menuLayer.hidden = false;
    place(pop, anchor, depth, parentPop);
    openPops.push(pop);
    return pop;
  }

  function openMenu(def, btn) {
    closeMenus();
    activeRoot = btn;
    btn.setAttribute('aria-expanded', 'true');
    openPop(typeof def.items === 'function' ? def.items() : def.items, 0, btn, null);
  }

  /** Menu contextual o desplegable suelto, anclado a un elemento. */
  function popup(items, anchor) {
    closeMenus();
    openPop(items, 0, anchor, null);
  }

  function setMenus(defs) {
    menuRoot.textContent = '';
    defs.forEach(function (def) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'menu-btn';
      btn.textContent = def.label;
      btn.setAttribute('role', 'menuitem');
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (activeRoot === btn) closeMenus(); else openMenu(def, btn);
      });
      btn.addEventListener('mouseenter', function () {
        if (activeRoot && activeRoot !== btn) openMenu(def, btn);
      });
      menuRoot.appendChild(btn);
    });
  }

  menuLayer.addEventListener('mousedown', function (ev) {
    if (ev.target === menuLayer) closeMenus();
  });
  window.addEventListener('blur', closeMenus);
  window.addEventListener('resize', closeMenus);

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && openPops.length) {
      ev.preventDefault();
      ev.stopPropagation();
      if (openPops.length > 1) closeFrom(openPops.length - 1); else closeMenus();
    }
  }, true);

  /* ========================================================== tema ====== */

  var themeSelect = document.getElementById('themeSelect');

  function setTheme(name, persist) {
    var t = THEMES.indexOf(name) > -1 ? name : 'dark';
    html.dataset.theme = t;
    if (themeSelect.value !== t) themeSelect.value = t;
    document.getElementById('statusTheme').textContent = 'tema: ' + t;
    if (persist !== false) WB.cfg.set(WB.cfg.K.theme, t);
    return t;
  }

  themeSelect.addEventListener('change', function () {
    setTheme(themeSelect.value);
    status('tema de la aplicacion: ' + themeSelect.value);
  });

  /* ========================================================== panel ===== */

  var dockHandle = document.getElementById('dockHandle');

  function stageMoved() {
    if (WB.ed && WB.ed.refreshSoon) WB.ed.refreshSoon();
  }

  function syncDock() {
    var side = app.dataset.dock;
    document.querySelectorAll('[data-dock-side]').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.dockSide === side);
    });
    dockHandle.setAttribute('aria-expanded', app.dataset.dockOpen);
  }

  function setDockSide(side, persist) {
    var s = SIDES.indexOf(side) > -1 ? side : 'right';
    app.dataset.dock = s;
    syncDock();
    if (persist !== false) WB.cfg.set(WB.cfg.K.dockSide, s);
    stageMoved();
  }

  function setDockOpen(open, persist) {
    app.dataset.dockOpen = open ? 'true' : 'false';
    syncDock();
    if (persist !== false) WB.cfg.set(WB.cfg.K.dockOpen, open ? 'true' : 'false');
    stageMoved();
  }

  function setDockWidth(px, persist) {
    var n = Math.max(260, Math.min(560, parseInt(px, 10) || 340));
    app.style.setProperty('--dock-size', n + 'px');
    if (persist !== false) WB.cfg.set(WB.cfg.K.dockW, n);
    stageMoved();
    return n;
  }

  function setDockTab(name) {
    var found = false;
    document.querySelectorAll('.dock-tab').forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle('is-active', on);
      if (on) found = true;
    });
    if (!found) return;
    document.querySelectorAll('.dock-pane').forEach(function (p) {
      p.classList.toggle('is-active', p.dataset.pane === name);
    });
    if (app.dataset.dockOpen !== 'true') setDockOpen(true);
  }

  document.querySelectorAll('[data-dock-side]').forEach(function (b) {
    b.addEventListener('click', function () {
      setDockSide(b.dataset.dockSide);
      setDockOpen(true);
      status('panel movido a: ' + b.dataset.dockSide);
    });
  });

  // La barra fina pliega con un clic y cambia el ancho arrastrando.
  (function () {
    var startX = 0, startW = 0, moved = false, dragging = false;
    dockHandle.addEventListener('pointerdown', function (ev) {
      dragging = true; moved = false;
      startX = ev.clientX;
      startW = document.getElementById('dock').getBoundingClientRect().width;
      dockHandle.setPointerCapture(ev.pointerId);
    });
    dockHandle.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      var side = app.dataset.dock;
      if (side !== 'left' && side !== 'right') return;
      var dx = ev.clientX - startX;
      if (Math.abs(dx) < 4 && !moved) return;
      moved = true;
      app.classList.add('is-resizing');
      setDockWidth(startW + (side === 'right' ? -dx : dx), false);
    });
    dockHandle.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      app.classList.remove('is-resizing');
      if (moved) {
        WB.cfg.set(WB.cfg.K.dockW, parseInt(getComputedStyle(app).getPropertyValue('--dock-size'), 10));
      } else {
        setDockOpen(app.dataset.dockOpen !== 'true');
      }
    });
  })();

  document.querySelectorAll('.dock-tab').forEach(function (tab) {
    tab.addEventListener('click', function () { setDockTab(tab.dataset.tab); });
  });

  /* ================================================== barra de estado === */

  var dirtyFlag = document.getElementById('dirtyFlag');
  var statusTimer = null;

  function status(msg) {
    statusMsg.textContent = msg;
    statusMsg.classList.remove('is-flash');
    void statusMsg.offsetWidth;
    statusMsg.classList.add('is-flash');
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { statusMsg.textContent = 'listo'; }, 6000);
  }

  function markDirty(value) {
    var on = value !== false;
    if (dirtyFlag.hidden === !on) return;
    dirtyFlag.hidden = !on;
    WB.invoke('set_dirty', { value: on }).catch(function () {});
  }

  function fail(e) {
    var msg = (e && e.message) ? e.message : String(e);
    if (window.console) console.error(e);
    status('error: ' + msg);
    WB.dlg.toast(msg, 'warn', 4200);
  }

  /* ===================================================== data-action ==== */

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-action]') : null;
    if (!t || t.disabled) return;
    WB.run(t.dataset.action, t);
  });

  WB.ui = {
    THEMES: THEMES,
    setMenus: setMenus,
    popup: popup,
    checks: checks,
    setTheme: setTheme,
    setDockSide: setDockSide,
    setDockOpen: setDockOpen,
    setDockWidth: setDockWidth,
    setDockTab: setDockTab,
    closeMenus: closeMenus,
    status: status,
    markDirty: markDirty,
    fail: fail,
    svgUse: svgUse,
    get dockOpen() { return app.dataset.dockOpen === 'true'; },
    get dockTab() {
      var t = document.querySelector('.dock-tab.is-active');
      return t ? t.dataset.tab : '';
    },
    get theme() { return html.dataset.theme; }
  };

  checks.theme = function (v) { return html.dataset.theme === v; };
  checks.dock = function (v) { return app.dataset.dock === v; };
  checks.dockopen = function () { return app.dataset.dockOpen === 'true'; };
})();
