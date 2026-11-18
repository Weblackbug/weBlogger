/* ==========================================================================
   weBlogger - a donde lleva cada enlace.

   Al hacer clic en un enlace del articulo (texto enlazado, boton, menu,
   indice, «abrir ventana»...) aparece una tarjeta junto a el que dice a
   donde lleva:
     - una web de fuera: el dominio y la direccion completa;
     - una parte de este articulo: el titulo de esa seccion o bloque;
     - otra pagina de la publicacion: su numero y su nombre;
     - un correo, un telefono, una ventana modal del articulo;
     - y avisa si no lleva a ningun sitio o si el destino no existe.
   Con botones para ir alli, abrir la web, cambiar el enlace (eligiendo una
   seccion de la lista) o quitarlo.
   ========================================================================== */
(function () {
  'use strict';

  var E = WB.ed, P = WB.panels, h = P.h;
  var L = WB.links = {};
  var card = null, cur = null;

  function stage() { return document.getElementById('stage'); }
  function frame() { return document.getElementById('pageFrame'); }
  function clip(t, n) { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; }

  /* --------------------------------------------------- el destino -- */

  function titleOf(t) {
    if (!t) return '';
    if (t.id === 'inicio' || t.matches('.hero')) return 'La portada (el principio de la página)';
    var head = t.matches('h1, h2, h3, h4') ? t : t.querySelector('h1, h2, h3, h4');
    var type = WB.typeOf(t);
    if (head && clip(head.textContent, 80)) return (type && !t.matches('.article-section') ? type.name + ': ' : '') + '«' + clip(head.textContent, 80) + '»';
    var txt = clip(t.innerText || t.textContent, 60);   // innerText respeta los saltos entre partes
    return (type ? type.name : 'Bloque') + (txt ? ': «' + txt + '»' : '');
  }

  /** Todo lo que se sabe de un enlace. */
  function describe(a) {
    var d = E.idoc, href = (a.getAttribute('href') || '').trim();
    var modal = a.getAttribute('data-wb-modal-open');
    var out = { href: href, blank: a.getAttribute('target') === '_blank' };
    if (modal) {
      var m = d.getElementById(modal);
      var mt = m && m.querySelector('.wb-modal-title');
      return Object.assign(out, { icon: '🪟', kind: 'Abre una ventana de este artículo', dest: m ? '«' + clip(mt ? mt.textContent : 'Ventana', 70) + '»' : 'La ventana ya no existe', target: m ? m.closest('.wb-modal-wrap') : null, warn: !m });
    }
    if (!href || href === '#') return Object.assign(out, { icon: '⚠️', kind: 'Sin destino', dest: 'Este enlace todavía no lleva a ningún sitio.', warn: true });
    if (href.charAt(0) === '#') {
      var id = decodeURIComponent(href.slice(1)), t = d.getElementById(id);
      return Object.assign(out, t
        ? { icon: '↪', kind: 'Una parte de este artículo', dest: titleOf(t), sub: href, target: t }
        : { icon: '⚠️', kind: 'Una parte de este artículo', dest: 'No existe ninguna parte llamada «' + id + '» en esta página.', sub: href, warn: true });
    }
    if (/^mailto:/i.test(href)) return Object.assign(out, { icon: '✉️', kind: 'Correo electrónico', dest: href.replace(/^mailto:/i, '').split('?')[0], external: true });
    if (/^tel:/i.test(href)) return Object.assign(out, { icon: '📞', kind: 'Teléfono', dest: href.replace(/^tel:/i, ''), external: true });
    var pg = /^(index|pagina-(\d+))\.html(#.*)?$/i.exec(href);
    if (pg) {
      var n = pg[2] ? +pg[2] : 1, pub = WB.pub;
      var name = pub && pub.pages && pub.pages[n - 1] ? pub.nameOf(n - 1) : '';
      return Object.assign(out, { icon: '📄', kind: 'Otra página de la publicación', dest: 'Página ' + n + (name ? ': ' + name : '') + (pg[3] ? ' (' + pg[3] + ')' : ''), sub: href, page: n - 1, warn: !(pub && pub.pages && pub.pages[n - 1]) });
    }
    if (/^https?:\/\//i.test(href)) {
      var u;
      try { u = new URL(href); } catch (e) { u = null; }
      return Object.assign(out, { icon: '🌐', kind: 'Una web de fuera', dest: u ? u.hostname.replace(/^www\./, '') : href, sub: href, external: true });
    }
    return Object.assign(out, { icon: '📎', kind: 'Un archivo o una dirección relativa', dest: href, sub: 'Se busca junto al artículo publicado' });
  }

  /* ----------------------------------------------------- la tarjeta -- */

  function place(a) {
    var r = a.getBoundingClientRect(), f = frame().getBoundingClientRect(), s = stage().getBoundingClientRect();
    var x = r.left + f.left - s.left, y = r.bottom + f.top - s.top + 8;
    var w = card.offsetWidth, hh = card.offsetHeight;
    if (y + hh > stage().clientHeight - 8) y = r.top + f.top - s.top - hh - 8;   // no cabe debajo: encima
    x = Math.max(8, Math.min(x, stage().clientWidth - w - 8));
    card.style.left = Math.round(x) + 'px';
    card.style.top = Math.round(Math.max(8, y)) + 'px';
    var vis = r.bottom > 0 && r.top < f.height;
    card.hidden = !vis;
  }

  L.hide = function () { if (card) card.hidden = true; cur = null; };

  L.show = function (a) {
    if (!a || !E.idoc || !E.idoc.body.contains(a)) return L.hide();
    if (!card) {
      card = h('div', { class: 'link-card', role: 'dialog', 'aria-label': 'Destino del enlace' });
      card.addEventListener('mousedown', function (ev) { ev.stopPropagation(); });
      stage().appendChild(card);
    }
    cur = a;
    var info = describe(a);
    card.textContent = '';
    card.classList.toggle('is-warn', !!info.warn);
    card.appendChild(h('div', { class: 'link-card-head' }, [
      h('span', { class: 'link-card-icon', text: info.icon }),
      h('span', { class: 'link-card-kind', text: info.kind + (info.blank ? ' · se abre en otra pestaña' : '') })
    ]));
    card.appendChild(h('div', { class: 'link-card-dest', text: info.dest }));
    if (info.sub && info.sub !== info.dest) card.appendChild(h('div', { class: 'link-card-url', text: info.sub, title: info.sub }));
    var btns = [];
    if (info.target) btns.push(['Ir allí', function () {
      var t = info.target;
      L.hide();
      if (t.matches('.wb-modal-wrap')) t.classList.add('wb-edit-open');
      E.select(t, { scroll: true, force: true });
    }, 'btn-primary']);
    if (info.page !== undefined && WB.pub && WB.pub.pages[info.page]) btns.push(['Ir a la página', function () { L.hide(); WB.pub.go(info.page); }, 'btn-primary']);
    if (info.external && /^https?:/i.test(info.href)) btns.push(['Abrir la web', function () {
      if (WB.isDesktop) WB.invoke('open_external', { path: info.href }).catch(WB.ui.fail);
      else window.open(info.href, '_blank', 'noopener');
    }]);
    if (!a.hasAttribute('data-wb-modal-open')) btns.push(['Cambiar…', function () { L.edit(a); }]);
    if (info.href && info.href !== '#' && !a.hasAttribute('data-wb-modal-open')) btns.push(['Quitar', function () { unlink(a); }, 'btn-ghost']);
    card.appendChild(h('div', { class: 'link-card-btns' }, btns.map(function (b) {
      return h('button', { type: 'button', class: 'btn ' + (b[2] || ''), text: b[0], onclick: function (ev) { ev.preventDefault(); b[1](); } });
    })));
    card.hidden = false;
    place(a);
  };

  /** Un enlace dentro del texto se deshace; un boton o una entrada de menu se queda sin destino. */
  function unlink(a) {
    var block = a.matches('[contenteditable], .wb-btn, .nav-links > a, .toc-list a, [data-wb-modal-open]') || a.closest('.wb-btn-row, .nav-links, .toc-list');
    if (block) a.setAttribute('href', '#');
    else a.replaceWith.apply(a, Array.prototype.slice.call(a.childNodes));
    L.hide();
    E.changed();
  }

  /* ------------------------------------------------- cambiar destino -- */

  /** Las partes del articulo a las que se puede saltar. */
  function anchors() {
    var d = E.idoc, out = [];
    var hero = d.querySelector('.hero');
    if (hero) { if (!hero.id) hero.id = 'inicio'; out.push(['#' + hero.id, 'Portada (principio de la página)']); }
    d.body.querySelectorAll('.article-section, [id]').forEach(function (el) {
      if (!el.id || el === hero || el.closest('.wb-modal, svg, .site-header, .lightbox') || /^(STYLE|SCRIPT|LINK|TEMPLATE|INPUT|BUTTON)$/.test(el.tagName)) return;
      if (/^(themeToggle|themeIcon|lightbox\w*|readingProgress|wb-\w+)$/i.test(el.id)) return;
      if (out.some(function (o) { return o[0] === '#' + el.id; })) return;
      var t = titleOf(el);
      if (/^Bloque$/.test(t)) return;          // sin nombre ni texto: no se reconoceria en la lista
      out.push(['#' + el.id, t + '  · #' + el.id]);
    });
    if (WB.pub && WB.pub.pages && WB.pub.pages.length > 1 && WB.pub.medium !== 'periodico') {
      WB.pub.pages.forEach(function (p, i) {
        if (i !== WB.pub.cur) out.push([i === 0 ? 'index.html' : 'pagina-' + (i + 1) + '.html', 'Página ' + (i + 1) + ': ' + WB.pub.nameOf(i)]);
      });
    }
    return out;
  }

  L.edit = function (a) {
    var input = h('input', { type: 'text', class: 'input', spellcheck: false, autocomplete: 'off', placeholder: 'https://… · #seccion · mailto:… · tel:…' });
    input.value = a.getAttribute('href') || '';
    var sel = h('select', { class: 'input' });
    sel.appendChild(h('option', { value: '', text: '— o elige una parte de este artículo —' }));
    anchors().forEach(function (o) { sel.appendChild(h('option', { value: o[0], text: o[1] })); });
    sel.value = anchors().some(function (o) { return o[0] === input.value; }) ? input.value : '';
    sel.addEventListener('change', function () { if (sel.value) input.value = sel.value; });
    var blank = h('input', { type: 'checkbox' });
    blank.checked = a.getAttribute('target') === '_blank';
    var body = h('div', { class: 'link-edit' }, [
      h('label', { class: 'field' }, [h('span', { text: 'Dirección' }), input]),
      h('label', { class: 'field' }, [h('span', { text: 'Parte del artículo' }), sel]),
      h('label', { class: 'field check' }, [blank, h('span', { text: 'Abrir en otra pestaña (para webs de fuera)' })])
    ]);
    L.hide();
    setTimeout(function () { input.focus(); input.select(); }, 60);
    WB.dlg.show({
      title: 'A dónde lleva este enlace', body: body, wide: 520,
      buttons: [{ id: 'ok', label: 'Aceptar', variant: 'primary', isDefault: true }, { id: 'cancel', label: 'Cancelar', isCancel: true }]
    }).then(function (b) {
      if (b !== 'ok') return;
      var v = input.value.trim();
      if (!v) { unlink(a); return; }
      if (/^www\./i.test(v)) v = 'https://' + v;
      a.setAttribute('href', v);
      if (blank.checked) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
      else { a.removeAttribute('target'); if (a.getAttribute('rel') === 'noopener noreferrer') a.removeAttribute('rel'); }
      E.changed();
      L.show(a);
    });
  };

  /* ------------------------------------------------ escuchar el doc -- */

  function linkAt(node) {
    if (!node) return null;
    if (node.nodeType !== 1) node = node.parentElement;
    return node ? node.closest('a[href], a[data-wb-modal-open]') : null;
  }

  function attach(d) {
    if (!d || d.__links) return;
    d.__links = true;
    d.addEventListener('click', function (ev) {
      var a = linkAt(ev.target);
      if (a) setTimeout(function () { L.show(a); }, 0); else L.hide();
    });
    d.addEventListener('keyup', function (ev) {
      if (/^(Shift|Control|Alt|Meta)$/.test(ev.key)) return;
      var s = d.getSelection();
      var a = s && s.rangeCount ? linkAt(s.anchorNode) : null;
      if (a) L.show(a); else L.hide();
    });
    d.addEventListener('scroll', function () { if (cur && card && !card.hidden) place(cur); }, true);
  }

  var baseMount = E.mount;
  E.mount = function () {
    var r = baseMount.apply(this, arguments);
    L.hide();
    var hook = function () { attach(E.idoc); };
    if (r && typeof r.then === 'function') r.then(hook); else hook();
    return r;
  };
  var baseUnmount = E.unmount;
  E.unmount = function () { L.hide(); return baseUnmount.apply(this, arguments); };
  window.addEventListener('resize', L.hide);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && card && !card.hidden) L.hide(); }, true);
  if (E.idoc) attach(E.idoc);
})();
