/* ==========================================================================
   weBlogger (n.k-7) - cajas de alerta y avisos
   Dialogos modales animados (entrada con rebote, salida con desvanecido) y
   notificaciones flotantes. Todo se construye con createElement: la politica
   de seguridad de Tauri no permite HTML ni manejadores en linea.
   ========================================================================== */
(function () {
  'use strict';

  var WB = window.WB;
  var layer = document.getElementById('dialogLayer');
  var toastLayer = document.getElementById('toastLayer');

  var ICON = {
    info: 'ic-info',
    ok: 'ic-ok',
    warn: 'ic-warn',
    error: 'ic-error',
    ask: 'ic-ask'
  };

  var open = [];

  function svg(id, cls) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (cls) s.setAttribute('class', cls);
    s.setAttribute('viewBox', '0 0 24 24');
    var u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', '#' + id);
    s.appendChild(u);
    return s;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  /**
   * Dialogo generico.
   * @param {object} o  kind, title, message, detail, input, buttons[]
   * @returns {Promise<*>} id del boton pulsado (o el texto si hay input)
   */
  function show(o) {
    o = o || {};
    var kind = o.kind || 'info';
    var buttons = o.buttons && o.buttons.length ? o.buttons : [{ id: 'ok', label: 'Aceptar', variant: 'primary', isDefault: true, isCancel: true }];

    return new Promise(function (resolve) {
      var box = el('div', 'dialog');
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.dataset.kind = kind;

      var head = el('div', 'dialog-head');
      head.appendChild(svg(ICON[kind] || ICON.info));
      var h = el('h2', 'dialog-title', o.title || 'weBlogger');
      head.appendChild(h);
      box.appendChild(head);

      var body = el('div', 'dialog-body');
      if (o.message) body.appendChild(el('p', null, o.message));
      var field = null;
      if (o.input) {
        field = el('input', 'input');
        field.type = 'text';
        field.style.width = '100%';
        field.style.marginTop = '10px';
        field.value = o.input.value || '';
        field.placeholder = o.input.placeholder || '';
        body.appendChild(field);
      }
      if (o.detail) body.appendChild(el('pre', null, o.detail));
      if (o.body) body.appendChild(o.body);
      if (o.wide) box.style.width = 'min(' + o.wide + 'px, 100%)';
      box.appendChild(body);

      var foot = el('div', 'dialog-foot');
      var defaultBtn = null;
      var cancelId = null;

      buttons.forEach(function (b) {
        var cls = 'btn';
        if (b.variant === 'primary') cls += ' btn-primary';
        if (b.variant === 'danger') cls += ' btn-danger';
        var btn = el('button', cls, b.label);
        btn.type = 'button';
        btn.addEventListener('click', function () { done(b.id); });
        foot.appendChild(btn);
        if (b.isDefault) defaultBtn = btn;
        if (b.isCancel) cancelId = b.id;
      });
      box.appendChild(foot);

      layer.appendChild(box);
      layer.hidden = false;
      layer.classList.remove('is-closing');

      var entry = { box: box, resolve: resolve };
      open.push(entry);

      function onKey(ev) {
        if (open[open.length - 1] !== entry) return;
        if (ev.key === 'Escape') { ev.preventDefault(); done(cancelId); }
        else if (ev.key === 'Enter' && ev.target.tagName === 'BUTTON' && box.contains(ev.target)) {
          return;   // Intro sobre un boton del dialogo pulsa ese boton, no el de por defecto
        }
        else if (ev.key === 'Enter' && (!field || ev.target === field)) {
          ev.preventDefault();
          done(buttons.filter(function (b) { return b.isDefault; }).map(function (b) { return b.id; })[0] || buttons[0].id);
        }
      }
      document.addEventListener('keydown', onKey, true);

      // Pulsar el velo "sacude" el dialogo en vez de cerrarlo a ciegas.
      function onVeil(ev) {
        if (ev.target !== layer) return;
        box.classList.remove('is-shake');
        void box.offsetWidth;
        box.classList.add('is-shake');
      }
      layer.addEventListener('mousedown', onVeil);

      var closed = false;
      function done(id) {
        if (closed) return;
        closed = true;
        document.removeEventListener('keydown', onKey, true);
        layer.removeEventListener('mousedown', onVeil);
        open = open.filter(function (e) { return e !== entry; });

        var value = field ? field.value : undefined;
        if (!open.length) layer.classList.add('is-closing');

        var remove = function () {
          if (box.parentNode) box.parentNode.removeChild(box);
          if (!open.length) {
            layer.hidden = true;
            layer.classList.remove('is-closing');
          }
          resolve(field ? (id === cancelId ? null : value) : id);
        };
        setTimeout(remove, 160);
      }

      requestAnimationFrame(function () {
        if (field) { field.focus(); field.select(); }
        else if (defaultBtn) defaultBtn.focus();
      });
    });
  }

  function toast(message, kind, ms) {
    var t = el('div', 'toast');
    t.dataset.kind = kind || 'info';
    t.appendChild(svg(ICON[kind] || ICON.info));
    t.appendChild(el('span', null, message));
    toastLayer.appendChild(t);

    var life = ms || 2600;
    setTimeout(function () {
      t.classList.add('is-out');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 200);
    }, life);
    return t;
  }

  WB.dlg = {
    show: show,

    alert: function (title, message, kind, detail) {
      return show({
        kind: kind || 'info',
        title: title,
        message: message,
        detail: detail,
        buttons: [{ id: 'ok', label: 'Aceptar', variant: 'primary', isDefault: true, isCancel: true }]
      });
    },

    confirm: function (title, message, kind) {
      return show({
        kind: kind || 'ask',
        title: title,
        message: message,
        buttons: [
          { id: 'no', label: 'Cancelar', isCancel: true },
          { id: 'si', label: 'Aceptar', variant: 'primary', isDefault: true }
        ]
      }).then(function (id) { return id === 'si'; });
    },

    prompt: function (title, message, value, placeholder) {
      return show({
        kind: 'ask',
        title: title,
        message: message,
        input: { value: value, placeholder: placeholder },
        buttons: [
          { id: 'cancel', label: 'Cancelar', isCancel: true },
          { id: 'ok', label: 'Aceptar', variant: 'primary', isDefault: true }
        ]
      });
    },

    toast: toast,
    icon: svg
  };
})();
