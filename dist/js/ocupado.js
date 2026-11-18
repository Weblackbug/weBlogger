/* ==========================================================================
   weBlogger - barra de carga.
   Mientras la aplicacion trabaja (abrir, guardar, componer un estilo, añadir
   paginas, exportar...) se ve que esta trabajando y en que:

   - una barra fina arriba del todo, que avanza con los archivos ya escritos
     o leidos (o se mueve sola si no se sabe cuanto falta);
   - si tarda mas de medio segundo, una tarjeta con lo que esta haciendo,
     el porcentaje, los archivos y los segundos que lleva;
   - en la barra de estado, el mismo texto con una rueda girando.

   Se cuelga de WB.invoke (todo lo que toca el disco pasa por ahi) y envuelve
   las operaciones largas de la aplicacion. Mientras hay un dialogo abierto o
   un selector de archivos, no se muestra: entonces espera al usuario, no
   trabaja. Se carga la ultima, cuando ya existen todas las piezas.
   ========================================================================== */
(function () {
  'use strict';

  var B = WB.busy = {};
  var stack = [];          // operaciones en marcha: { label, sub }
  var files = { started: 0, done: 0 };
  var manual = null;       // progreso dado a mano: { done, total }
  var mine = null, before = null, t0 = 0, tick = 0, seq = 0;
  var bar, fill, card, cLabel, cDetail, cFill, cPct, dlgLayer, statusMsg, spin;

  /* lo que no es trabajo: esperar al usuario o cosas instantaneas */
  var QUIET = {
    pick_folder: 1, pick_save: 1, cfg_read: 1, cfg_write: 1, set_dirty: 1, win_title: 1,
    win_fullscreen: 1, win_toggle_maximize: 1, win_minimize: 1, app_exit: 1, open_external: 1,
    env_info: 1, startup_file: 1, path_exists: 1
  };
  var LABEL = {
    write_text: 'Guardando', write_b64: 'Guardando las imágenes', read_text: 'Leyendo',
    read_b64: 'Cargando', list_articles: 'Leyendo la biblioteca', list_pages: 'Leyendo las páginas',
    export_pdf: 'Creando el PDF', export_press_pdf: 'Preparando el PDF para imprenta',
    remove_article: 'Borrando', remove_page: 'Ordenando las páginas', clean_pages: 'Ordenando las páginas'
  };

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function build() {
    bar = el('div', 'busy-bar', document.body);
    bar.setAttribute('aria-hidden', 'true');
    fill = el('div', 'busy-fill', bar);

    card = el('div', 'busy-card', document.body);
    card.setAttribute('role', 'status');
    card.setAttribute('aria-live', 'polite');
    var top = el('div', 'busy-top', card);
    el('span', 'busy-spin', top);
    cLabel = el('strong', 'busy-label', top);
    cPct = el('span', 'busy-pct', top);
    var track = el('div', 'busy-track', card);
    cFill = el('div', 'busy-track-fill', track);
    cDetail = el('div', 'busy-detail', card);

    dlgLayer = document.getElementById('dialogLayer');
    statusMsg = document.getElementById('statusMsg');
    if (statusMsg) {
      spin = el('span', 'busy-status-spin');
      statusMsg.parentNode.insertBefore(spin, statusMsg);
    }
  }

  /** La etiqueta que manda: la de la operacion de la aplicacion, no la del archivo. */
  function current() {
    for (var i = stack.length - 1; i >= 0; i--) if (!stack[i].sub) return stack[i].label;
    return stack.length ? stack[stack.length - 1].label : '';
  }

  function ratio() {
    if (manual && manual.total) return Math.min(1, manual.done / manual.total);
    if (files.started > 1) return Math.min(1, files.done / files.started);
    return -1; // no se sabe: barra en movimiento
  }

  function waitingForUser() {
    return !!(dlgLayer && !dlgLayer.hidden);
  }

  var last = 0;
  function render() {
    if (!bar) return;
    var active = stack.length > 0 && !waitingForUser();
    var age = Date.now() - t0;
    var showBar = active && age > 120, showCard = active && age > 550;
    bar.classList.toggle('is-on', showBar);
    card.classList.toggle('is-on', showCard);
    document.documentElement.classList.toggle('is-busy', showBar);
    if (spin) spin.classList.toggle('is-on', showBar);
    if (!active) return;
    var r = ratio();
    if (r >= 0) last = Math.max(last, r); // nunca hacia atras
    var indet = r < 0;
    bar.classList.toggle('is-indet', indet);
    card.classList.toggle('is-indet', indet);
    var w = indet ? '' : Math.round(Math.min(last, 0.97) * 100) + '%';
    fill.style.width = w;
    cFill.style.width = w;
    var label = current() || 'Trabajando';
    cLabel.textContent = label + '…';
    cPct.textContent = indet ? '' : Math.round(Math.min(last, 0.97) * 100) + ' %';
    var bits = [];
    if (manual && manual.total) bits.push(manual.done + ' de ' + manual.total + (manual.unit ? ' ' + manual.unit : ''));
    else if (files.started > 1) bits.push(files.done + ' de ' + files.started + ' archivos');
    var secs = Math.floor(age / 1000);
    if (secs >= 1) bits.push(secs + ' s');
    cDetail.textContent = bits.join(' · ') || 'un momento';
    if (statusMsg && showBar && (statusMsg.textContent === mine || statusMsg.textContent === before)) mine = statusMsg.textContent = label + '…' + (indet ? '' : ' ' + Math.round(Math.min(last, 0.97) * 100) + ' %');
  }

  function finish() {
    if (!bar) return;
    var wasOn = bar.classList.contains('is-on');
    if (wasOn) {
      // llega al final antes de irse, para que se vea que ha terminado
      bar.classList.remove('is-indet');
      fill.style.width = '100%';
    }
    card.classList.remove('is-on');
    document.documentElement.classList.remove('is-busy');
    if (spin) spin.classList.remove('is-on');
    setTimeout(function () {
      if (stack.length) return;
      bar.classList.remove('is-on');
      setTimeout(function () { if (!stack.length) fill.style.width = '0'; }, 260);
    }, wasOn ? 220 : 0);
    if (statusMsg && statusMsg.textContent === mine) statusMsg.textContent = 'listo';
    mine = before = null;
  }

  /** Empieza una operacion. Devuelve la ficha para terminarla con B.end(). */
  B.begin = function (label, sub) {
    if (!bar && document.body) build();
    if (!stack.length) {
      t0 = Date.now();
      files.started = files.done = 0;
      manual = null;
      last = 0;
      before = statusMsg ? statusMsg.textContent : null;
      clearInterval(tick);
      tick = setInterval(render, 100);
    }
    var job = { id: ++seq, label: label || 'Trabajando', sub: !!sub };
    stack.push(job);
    render();
    return job;
  };

  B.end = function (job) {
    var i = stack.indexOf(job);
    if (i > -1) stack.splice(i, 1);
    if (stack.length) { render(); return; }
    clearInterval(tick);
    finish();
  };

  /** Cambia el texto de la operacion en marcha (la de mas arriba). */
  B.label = function (text) {
    for (var i = stack.length - 1; i >= 0; i--) if (!stack[i].sub) { stack[i].label = text; break; }
    render();
  };

  /** Progreso conocido: 3 de 8 paginas. */
  B.progress = function (done, total, unit) {
    manual = { done: done, total: total, unit: unit || '' };
    render();
  };

  B.active = function () { return stack.length > 0; };

  /**
   * Hace fn() con la barra puesta. Antes deja pintar dos cuadros, para que
   * la barra salga aunque fn sea un calculo largo que bloquea la ventana.
   */
  B.run = function (label, fn) {
    var job = B.begin(label);
    return new Promise(function (resolve) {
      // dos cuadros para pintar; si la ventana los retrasa, no mas de 60 ms
      requestAnimationFrame(function () { requestAnimationFrame(resolve); });
      setTimeout(resolve, 60);
    }).then(function () { return fn(); }).then(function (v) {
      B.end(job); return v;
    }, function (e) {
      B.end(job); throw e;
    });
  };

  /** Envuelve obj[key] para que siempre trabaje con la barra. */
  B.wrap = function (obj, key, label) {
    var f = obj && obj[key];
    if (typeof f !== 'function' || f.__busy) return;
    var g = function () {
      var self = this, args = arguments;
      return B.run(typeof label === 'function' ? label.apply(self, args) : label, function () { return f.apply(self, args); });
    };
    g.__busy = true;
    obj[key] = g;
  };

  /* ------------------------------------------- todo lo que toca el disco --- */

  var raw = WB.invoke;
  WB.invoke = function (cmd, args) {
    if (QUIET[cmd]) return raw(cmd, args);
    var job = B.begin(LABEL[cmd] || 'Trabajando', true);
    files.started++;
    var p;
    try { p = raw(cmd, args); } catch (e) { p = Promise.reject(e); }
    var done = function () { files.done++; B.end(job); };
    return Promise.resolve(p).then(function (v) { done(); return v; }, function (e) { done(); throw e; });
  };

  /* -------------------------------------------- operaciones de la aplicacion */

  var A = WB.app, pub = WB.pub, Ed = WB.edition, X = WB.exp, G = WB.gallery;
  function saveLabel() {
    var n = pub && pub.pages ? pub.pages.length : 1;
    return n > 1 ? 'Guardando la publicación (' + n + ' páginas)' : 'Guardando el artículo';
  }
  var pageName = function (i) { try { return pub.nameOf(i); } catch (e) { return ''; } };

  B.wrap(A, 'openDoc', 'Componiendo la página');
  B.wrap(A, 'openFolder', 'Abriendo la publicación');
  B.wrap(A, 'preview', 'Preparando la vista previa');
  if (pub) {
    B.wrap(pub, 'save', saveLabel);
    B.wrap(pub, 'go', function (i) { return 'Abriendo la página ' + (i + 1) + (pageName(i) ? ': ' + pageName(i) : ''); });
    B.wrap(pub, 'add', function (st) { return 'Componiendo la página nueva' + (st && st.name ? ' con el estilo ' + st.name : ''); });
    B.wrap(pub, 'restyle', function (st) { return 'Aplicando el estilo' + (st && st.name ? ' ' + st.name : ''); });
    B.wrap(pub, 'duplicate', 'Duplicando la página');
  }
  if (Ed) {
    B.wrap(Ed, 'convert', function (m) { return m === 'periodico' ? 'Pasando a periódico' : 'Pasando a blog'; });
    B.wrap(Ed, 'pressExport', 'Preparando el PDF para imprenta');
    B.wrap(Ed, 'openWeblog', 'Abriendo la publicación');
  }
  if (X && X.MAKE) {
    Object.keys(X.MAKE).forEach(function (id) {
      var f = (X.FORMATS || []).filter(function (x) { return x.id === id; })[0];
      B.wrap(X.MAKE, id, 'Exportando' + (f ? ' a ' + f.label : ''));
    });
  }
  if (G) B.wrap(G, 'open', 'Cargando los estilos de prensa');

  // el guardado llega por varios caminos (menu, Ctrl+S, panel): todos con barra
  ['save', 'saveAs'].forEach(function (k) { B.wrap(A, k, saveLabel); });
  if (WB.actions.save) WB.actions.save = A.save;
})();
