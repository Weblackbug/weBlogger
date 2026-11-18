/* ==========================================================================
   weBlogger - que se puede usar en cada momento.

   Los menus y los botones de las barras salen desactivados (en gris, sin
   hacer nada) cuando en ese momento no sirven: sin articulo abierto no hay
   guardar, exportar, insertar ni formato; sin bloque seleccionado no hay
   duplicar, borrar ni mover; sin cursor en un texto no hay negrita ni
   cursiva; deshacer solo si hay algo que deshacer; tamaño del papel solo en
   periodico; pagina siguiente solo si existe...

   Cada orden (data-action / action del menu) tiene su regla. Las que no
   tienen regla estan siempre disponibles. El motivo sale como ayuda al pasar
   el raton por encima.
   ========================================================================== */
(function () {
  'use strict';

  var E = WB.ed, D = WB.doc;
  var V = WB.avail = {};

  /* ------------------------------------------------------- el momento -- */

  function hasDoc() { return !!E.idoc && document.getElementById('app').dataset.view !== 'library'; }
  function pub() { return WB.pub || { pages: [], cur: 0, medium: 'blog' }; }
  function isPaper() { return hasDoc() && pub().medium === 'periodico'; }
  function canText() { return hasDoc() && !!(WB.fmt && WB.fmt.canFormat && WB.fmt.canFormat()); }
  function hasSel() { return hasDoc() && !!E.sel; }
  function hist(step) {
    var H = WB.hist;
    if (!hasDoc() || !H) return false;
    var n = H.i + step;
    return n >= 0 && n < H.stack.length;
  }

  var NEED = {
    doc: [hasDoc, 'Abre o crea antes un artículo'],
    text: [canText, 'Haz clic dentro de un texto del artículo'],
    sel: [hasSel, 'Selecciona antes un bloque del artículo'],
    paper: [isPaper, 'Solo en periódicos y revistas'],
    blog: [function () { return hasDoc() && pub().medium !== 'periodico'; }, 'Solo en blogs'],
    saved: [function () { return hasDoc() && !!D.s.path; }, 'Guarda antes el artículo'],
    desk: [function () { return !!WB.isDesktop; }, 'Solo en la aplicación de escritorio']
  };

  /* --------------------------------------------- reglas de cada orden -- */
  /* nombre de la orden (antes de los dos puntos) -> necesidad o funcion */

  var RULES = {
    save: 'doc', 'save-as': 'doc', press: 'doc', 'export': 'doc', preview: 'doc', browser: 'doc', 'reveal-doc': 'saved',
    undo: function () { return hist(-1) || [false, 'Nada que deshacer']; },
    redo: function () { return hist(1) || [false, 'Nada que rehacer']; },
    dup: 'sel', del: 'sel', move: 'sel', 'sel-parent': 'sel',
    insert: 'doc', block: 'doc',
    fmt: 'text', link: 'text', symbols: 'text', fx: 'text', art: 'doc',
    gallery: function (arg) { return arg === 'page' || arg === 'restyle' ? 'doc' : true; },
    medium: 'doc', paper: 'paper', palette: 'doc', lang: 'doc', 'page-theme': 'doc', device: 'doc',
    'page-prev': function () { return hasDoc() && pub().cur > 0 || [false, 'Ya estás en la primera página']; },
    'page-next': function () { return hasDoc() && pub().cur < pub().pages.length - 1 || [false, 'Ya estás en la última página']; },
    'page-del': function () { return hasDoc() && pub().pages.length > 1 || [false, 'Una publicación necesita al menos una página']; },
    'page-go': 'doc', 'page-dup': 'doc', 'page-state': 'doc', 'page-rename': 'doc',
    'dock-tab': function (arg) { return arg === 'page' || arg === 'outline' ? 'doc' : true; },
    backgrounds: 'blog', toc: 'doc', capture: 'desk',
    'preview-device': true, 'preview-close': true
  };

  /** [disponible, motivo] para una orden como 'fmt:bold' o 'page-next'. */
  function check(action) {
    if (!action) return [true, ''];
    var i = action.indexOf(':');
    var name = i > -1 ? action.slice(0, i) : action, arg = i > -1 ? action.slice(i + 1) : null;
    var r = RULES[name];
    if (r === undefined || r === true) return [true, ''];
    if (typeof r === 'function') r = r(arg);
    if (r === true) return [true, ''];
    if (Array.isArray(r)) return r;
    var n = NEED[r];
    if (!n) return [true, ''];
    return n[0]() ? [true, ''] : [false, n[1]];
  }

  V.can = function (action) { return check(action)[0]; };

  /** Para los menus: una opcion con orden, o un submenu con `need`. */
  V.item = function (it) {
    if (it.need && NEED[it.need] && !NEED[it.need][0]()) return false;
    return check(it.action)[0];
  };
  V.why = function (it) {
    if (it.need && NEED[it.need] && !NEED[it.need][0]()) return NEED[it.need][1];
    return check(it.action)[1];
  };

  /* --------------------------------------------- botones de las barras -- */

  var raf = 0;
  /** Repasa los botones con data-action de la ventana (no los del articulo). */
  V.refresh = function () {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      document.querySelectorAll('.toolbar [data-action], .page-bar [data-action], #pageBar [data-action], .stage-bar [data-action]').forEach(function (b) {
        var r = check(b.dataset.action);
        if (b.disabled === !r[0]) return;
        b.disabled = !r[0];
        if (!r[0]) { if (!b.dataset.title0) b.dataset.title0 = b.title || ''; b.title = (b.dataset.title0 ? b.dataset.title0 + ' — ' : '') + r[1]; }
        else if (b.dataset.title0 !== undefined) b.title = b.dataset.title0;
      });
      // la cinta de formato: solo con el cursor en un texto
      var rb = document.getElementById('ribbon');
      if (rb) {
        var on = canText();
        rb.classList.toggle('is-off', !on);
        rb.querySelectorAll('button, select').forEach(function (c) { c.disabled = !on; });
      }
    });
  };

  // se repasa cuando cambia algo que importa
  function after(obj, key) {
    var f = obj && obj[key];
    if (typeof f !== 'function' || f.__avail) return;
    var g = function () {
      var r = f.apply(this, arguments);
      V.refresh();
      if (r && typeof r.then === 'function') r.then(V.refresh, V.refresh);
      return r;
    };
    g.__avail = true;
    obj[key] = g;
  }
  after(E, 'select'); after(E, 'mount'); after(E, 'unmount'); after(E, 'changed'); after(E, 'commit');
  after(WB.hist, 'push'); after(WB.hist, 'go'); after(WB.hist, 'reset');
  after(WB.app, 'showLibrary'); after(WB.app, 'openDoc');
  if (WB.pub) { after(WB.pub, 'go'); after(WB.pub, 'add'); after(WB.pub, 'remove'); after(WB.pub, 'render'); }
  document.addEventListener('keyup', V.refresh, true);
  document.addEventListener('mouseup', V.refresh, true);
  V.refresh();
})();
