/* ==========================================================================
   weBlogger - herramientas de redaccion.

   - Saltos entre paginas: «Sigue en la pagina N» / «Viene de la pagina N».
     El salto apunta a otra pagina de la publicacion por su clave; el numero
     se escribe solo y se corrige si las paginas cambian de orden.
   - Flujo de redaccion: cada pagina tiene estado (borrador, en correccion,
     cerrada), responsable y hora de cierre. Se ven en la barra de paginas.
   - Medida de la pieza: caracteres, palabras, lineas y alto, con un objetivo
     de caracteres que avisa si la pieza se pasa o se queda corta.
   ========================================================================== */
(function () {
  'use strict';

  var E = WB.ed, D = WB.doc, P = WB.panels, pub = WB.pub;
  var h = P.h, ui = P.ui;
  var R = WB.redaccion = {};

  /* ================================================== saltos de pagina === */

  WB.TYPES.unshift({ sel: '.np-jump', name: 'Salto de página', kind: 'text' });
  WB.ALL_SEL = WB.TYPES.map(function (t) { return t.sel; }).join(',');

  var diario = WB.CATALOG.filter(function (c) { return c.cat === 'Diario'; })[0];
  if (diario) {
    diario.items.push(
      { id: 'np-jump', name: 'Sigue en la página', icon: 'ic-down', html: function () { return '<p class="np-jump" data-wb-jump="">Sigue en la página <b class="np-jump-n">?</b></p>'; } },
      { id: 'np-jump-from', name: 'Viene de la página', icon: 'ic-up', html: function () { return '<p class="np-jump from" data-wb-jump="">Viene de la página <b class="np-jump-n">?</b></p>'; } }
    );
  }

  /** Pone en cada salto el numero de la pagina a la que apunta. */
  function updateJumps(doc) {
    if (!doc || !doc.body) return 0;
    var n = 0;
    doc.body.querySelectorAll('[data-wb-jump]').forEach(function (el) {
      var key = el.getAttribute('data-wb-jump');
      var i = -1;
      pub.pages.forEach(function (p, j) { if (key && p.s.key === key) i = j; });
      var b = el.querySelector('.np-jump-n');
      if (!b) { b = doc.createElement('b'); b.className = 'np-jump-n'; el.appendChild(b); }
      var txt = i > -1 ? String(i + 1) : '?';
      if (b.textContent !== txt) { b.textContent = txt; n++; }
    });
    return n;
  }
  R.updateJumps = updateJumps;

  // antes de guardar o exportar, todas las paginas con sus numeros al dia
  var baseEach = pub.each;
  pub.each = function (fn) {
    return baseEach.call(pub, function (p, i, doc) { updateJumps(doc); return fn(p, i, doc); });
  };
  // y en la pagina que se ve, al montarla y al cambiar el orden
  var baseMount = E.mount;
  E.mount = function () {
    return baseMount.apply(this, arguments).then(function (r) { updateJumps(E.idoc); return r; });
  };
  var baseMoveTo = pub.moveTo;
  pub.moveTo = function () { baseMoveTo.apply(pub, arguments); updateJumps(E.idoc); };
  var baseMove = pub.move;
  pub.move = function () { baseMove.apply(pub, arguments); updateJumps(E.idoc); };

  // las paginas nuevas necesitan una clave propia para poder ser destino
  function ensureKeys() {
    var seen = {};
    pub.pages.forEach(function (p, i) {
      if (!p.s.key || seen[p.s.key]) p.s.key = (pub.pages[0].s.key || 'pagina') + '-p' + (i + 1) + WB.uid();
      seen[p.s.key] = true;
    });
  }

  /* ===================================================== medida ========== */

  function measure(el) {
    var text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    var words = (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
    var lines = 0;
    el.querySelectorAll('p, li, h1, h2, h3, h4, td, figcaption').forEach(function (n) {
      if (n.closest('figure') && n.tagName !== 'FIGCAPTION') return;
      var lh = parseFloat(E.idoc.defaultView.getComputedStyle(n).lineHeight) || 20;
      lines += Math.max(1, Math.round(n.getBoundingClientRect().height / lh));
    });
    if (!lines && text) {
      var lh0 = parseFloat(E.idoc.defaultView.getComputedStyle(el).lineHeight) || 20;
      lines = Math.max(1, Math.round(el.getBoundingClientRect().height / lh0));
    }
    return { chars: text.length, words: words, lines: lines, mm: Math.round(el.getBoundingClientRect().height / (96 / 25.4)) };
  }
  R.measure = measure;

  function fmt(n) { return n.toLocaleString('es-ES'); }

  /** Texto de la medida, con el objetivo si lo hay. */
  function measureText(el) {
    var m = measure(el);
    var goal = parseInt(el.getAttribute('data-wb-objetivo'), 10) || 0;
    var s = fmt(m.chars) + ' caracteres · ' + fmt(m.words) + ' palabras · ' + m.lines + ' líneas · ' + m.mm + ' mm de alto';
    if (goal) {
      var diff = m.chars - goal, tol = Math.max(30, Math.round(goal * 0.03));
      s += diff > tol ? ' · se pasa en ' + fmt(diff) : diff < -tol ? ' · faltan ' + fmt(-diff) : ' · justa';
    }
    return { text: s, over: goal && m.chars - goal > Math.max(30, Math.round(goal * 0.03)), m: m, goal: goal };
  }

  var PIECE = '.np-story, .np-box, .wb-flow, .np-between, .wb-col, .info-card, .np-brief, .article-section, .wb-headline, blockquote, .np-opinion';

  // en la barra de estado, la medida de lo seleccionado
  var statusSel = document.getElementById('statusSel');
  var baseSelect = E.select;
  E.select = function (el) {
    var r = baseSelect.apply(this, arguments);
    showMeasure();
    return r;
  };
  function showMeasure() {
    var el = E.sel;
    if (!el || !E.idoc || !E.idoc.body.contains(el)) return;
    var piece = el.matches(PIECE) ? el : (el.closest(PIECE) || el);
    var t = WB.typeOf(piece);
    var r = measureText(piece);
    statusSel.textContent = (t ? t.name : 'pieza') + ' · ' + r.text;
    statusSel.classList.toggle('is-over', !!r.over);
  }
  var baseChanged = E.changed;
  var mt = 0;
  E.changed = function () {
    baseChanged.apply(this, arguments);
    clearTimeout(mt);
    mt = setTimeout(showMeasure, 250);
  };

  /* ===================================================== flujo ============ */

  var STATES = [
    { id: 'borrador', name: 'Borrador', color: '#9aa4b2' },
    { id: 'correccion', name: 'En corrección', color: '#e0a526' },
    { id: 'cerrada', name: 'Cerrada', color: '#2f9e5b' }
  ];
  function state(s) { return STATES.filter(function (x) { return x.id === (s.estado || 'borrador'); })[0]; }

  R.dot = function (s) {
    var st = state(s);
    var title = st.name + (s.responsable ? ' · ' + s.responsable : '') + (s.cierre ? ' · cierre ' + s.cierre.replace('T', ' ') : '');
    var d = h('i', { class: 'pg-state', title: title });
    d.style.background = st.color;
    return d;
  };

  R.stateItems = function (i) {
    return STATES.map(function (st) {
      return { label: st.name, action: 'page-state:' + i + ',' + st.id, check: 'pagestate:' + i + ',' + st.id };
    });
  };
  WB.ui.checks.pagestate = function (v) {
    var a = String(v).split(',');
    var p = pub.pages[+a[0]];
    return !!p && (p.s.estado || 'borrador') === a[1];
  };
  WB.actions['page-state'] = function (arg) {
    var a = String(arg).split(',');
    var p = pub.pages[+a[0]];
    if (!p) return;
    p.s.estado = a[1];
    WB.ui.markDirty(true);
    pub.render();
    if (WB.ui.dockTab === 'page') P.renderPage();
    WB.ui.status('página ' + (+a[0] + 1) + ': ' + state(p.s).name.toLowerCase());
  };

  /** Resumen del cierre en la barra de paginas. */
  var bar = document.getElementById('pageBar');
  function summary() {
    var old = bar.querySelector('.pg-summary');
    if (old) old.remove();
    if (!E.idoc || pub.pages.length < 2) return;
    var closed = pub.pages.filter(function (p) { return p.s.estado === 'cerrada'; }).length;
    var el = h('span', { class: 'pg-summary', title: 'Páginas cerradas de la edición' }, [h('b', { text: closed + '/' + pub.pages.length }), h('span', { text: ' cerradas' })]);
    var spacer = bar.querySelector('.tool-spacer');
    if (spacer) spacer.after(el);
  }
  var baseDecorate = WB.edition.decorateBar;
  WB.edition.decorateBar = function (b) {
    baseDecorate(b);
    // al abrir, la pagina se monta antes de que lleguen las demas: los saltos se repasan aqui
    if (E.idoc && updateJumps(E.idoc)) WB.hist.push();
    setTimeout(summary, 0);
  };

  /* ================================================ en los paneles ========= */

  P.extra = function (el) {
    var out = [];
    var d = E.idoc;

    if (el.matches('.np-jump')) {
      ensureKeys();
      var opts = [['', '(elige la página)']].concat(pub.pages.map(function (p, i) {
        return [p.s.key, (i + 1) + ' · ' + pub.nameOf(i) + (i === pub.cur ? ' (esta)' : '')];
      }));
      out.push(ui.group('Salto de página', [
        ui.fSelect('Lleva a la página', opts, el.getAttribute('data-wb-jump'), function (v) {
          el.setAttribute('data-wb-jump', v);
          updateJumps(d);
          E.changed();
        }),
        ui.fSelect('Tipo', [['', 'Sigue en la página…'], ['from', 'Viene de la página…']], el.classList.contains('from') ? 'from' : '', function (v) {
          el.classList.toggle('from', v === 'from');
          var b = el.querySelector('.np-jump-n');
          el.textContent = (v === 'from' ? 'Viene de la página ' : 'Sigue en la página ');
          if (b) el.appendChild(b);
          updateJumps(d);
          E.commit();
        }),
        ui.note('El número se pone solo y se corrige si cambias el orden de las páginas. Pon un «Viene de la página» al principio de la continuación.')
      ], true));
    }

    var piece = el.matches(PIECE) ? el : el.closest(PIECE);
    if (piece && !el.matches('.np-jump')) {
      var r = measureText(piece);
      var line = h('p', { class: 'measure-line' + (r.over ? ' is-over' : ''), text: r.text });
      out.push(ui.group('Medida de la pieza', [
        line,
        ui.fText('Objetivo de caracteres (lo que encarga la sección)', r.goal ? String(r.goal) : '', function (v) {
          var n = parseInt(String(v).replace(/\D/g, ''), 10);
          if (n) piece.setAttribute('data-wb-objetivo', n); else piece.removeAttribute('data-wb-objetivo');
          var rr = measureText(piece);
          line.textContent = rr.text;
          line.classList.toggle('is-over', !!rr.over);
          showMeasure();
          E.changed();
        }, { placeholder: 'por ejemplo 1500' }),
        ui.note('Cuenta los caracteres con espacios, como en una redacción. Avisa si la pieza se pasa del objetivo más de un 3 %.')
      ], false));
    }
    return out;
  };

  P.pageExtra = function (pane) {
    var s = D.s;
    pane.appendChild(ui.group('Redacción', [
      ui.fSelect('Estado de la página', STATES.map(function (st) { return [st.id, st.name]; }), s.estado || 'borrador', function (v) {
        s.estado = v;
        WB.ui.markDirty(true);
        pub.render();
      }),
      ui.fText('Responsable', s.responsable, function (v) { s.responsable = v.trim(); WB.ui.markDirty(true); pub.render(); }, { placeholder: 'Quién la cierra' }),
      (function () {
        var inp = h('input', { type: 'datetime-local', class: 'input' });
        inp.value = s.cierre || '';
        inp.addEventListener('change', function () { s.cierre = inp.value; WB.ui.markDirty(true); pub.render(); });
        return ui.field('Hora de cierre', inp);
      })(),
      ui.note('El estado se ve como un punto de color en la pestaña de la página: gris, borrador; ámbar, en corrección; verde, cerrada.')
    ], true));
  };
})();
