/* ==========================================================================
   weBlogger - paneles del dock: elementos, propiedades, pagina y esquema.
   Todo se construye con createElement (la politica de seguridad no admite
   HTML ni manejadores en linea) a partir de unos pocos controles comunes.
   ========================================================================== */
(function () {
  'use strict';

  var E = WB.ed;
  var P = WB.panels = {};
  var paneBlocks = document.getElementById('paneBlocks');
  var paneProps = document.getElementById('paneProps');
  var panePage = document.getElementById('panePage');
  var paneOutline = document.getElementById('paneOutline');

  /* ====================================================== controles ====== */

  function h(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === undefined || v === null) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else if (k in n && k !== 'list') n[k] = v;
      else n.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) {
      if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  function icon(id) {
    var s = WB.ui.svgUse(id);
    return s;
  }

  var openState = Object.create(null);

  function group(title, kids, open) {
    var isOpen = title in openState ? openState[title] : !!open;
    var det = h('details', { class: 'pgroup' }, [h('summary', { text: title }), h('div', { class: 'pgroup-body' }, kids)]);
    det.open = isOpen;
    det.addEventListener('toggle', function () { openState[title] = det.open; });
    return det;
  }

  function field(label, control) {
    return h('label', { class: 'field' }, [h('span', { text: label }), control]);
  }

  function fRange(label, o) {
    var unit = o.unit || '';
    var out = h('output', { class: 'range-out', text: o.value + unit });
    var inp = h('input', { type: 'range', class: 'input', min: o.min, max: o.max, step: o.step || 1 });
    inp.value = o.value;
    inp.addEventListener('input', function () {
      out.textContent = inp.value + unit;
      o.on(parseFloat(inp.value));
    });
    return h('label', { class: 'field range' }, [h('span', null, [label, out]), inp]);
  }

  function cssVar(name) {
    return E.idoc ? getComputedStyle(E.idoc.documentElement).getPropertyValue(name).trim() : '';
  }

  function resolveColor(v) {
    var m = /^var\((--[\w-]+)\)$/.exec(String(v || '').trim());
    return m ? cssVar(m[1]) : v;
  }

  /** Selector de color con «usar el acento de la pagina» y «quitar». */
  function fColor(label, o) {
    var inp = h('input', { type: 'color', class: 'color-in' });
    inp.value = WB.doc.toHex(resolveColor(o.value), o.fallback || '#000000');
    var state = h('span', { class: 'color-state', text: o.value ? (/^var/.test(o.value) ? 'acento' : '') : (o.noneLabel || 'sin color') });
    inp.addEventListener('input', function () { state.textContent = ''; o.on(inp.value); });
    var row = h('div', { class: 'color-row' }, [
      inp, state,
      h('button', { type: 'button', class: 'btn btn-ghost mini-btn', text: 'acento', title: 'Usar el color de acento de la página', onclick: function (ev) { ev.preventDefault(); state.textContent = 'acento'; inp.value = WB.doc.toHex(cssVar('--accent')); o.on('var(--accent)'); } }),
      o.none === false ? null : h('button', { type: 'button', class: 'btn btn-ghost mini-btn', text: 'quitar', onclick: function (ev) { ev.preventDefault(); state.textContent = o.noneLabel || 'sin color'; o.on(''); } })
    ]);
    return h('div', { class: 'field' }, [h('span', { text: label }), row]);
  }

  function fSelect(label, opts, value, on) {
    var sel = h('select', { class: 'input' });
    opts.forEach(function (o) {
      var op = h('option', { value: o[0], text: o[1] });
      sel.appendChild(op);
    });
    sel.value = value === undefined || value === null ? '' : String(value);
    if (sel.selectedIndex < 0) sel.selectedIndex = 0;
    sel.addEventListener('change', function () { on(sel.value); });
    return field(label, sel);
  }

  function fText(label, value, on, o) {
    o = o || {};
    var inp = o.area
      ? h('textarea', { class: 'input area', rows: o.rows || 4, spellcheck: false })
      : h('input', { type: 'text', class: 'input', spellcheck: false, autocomplete: 'off' });
    inp.value = value || '';
    if (o.placeholder) inp.placeholder = o.placeholder;
    if (o.readonly) inp.readOnly = true;
    inp.addEventListener(o.lazy ? 'change' : 'input', function () { on(inp.value); });
    return field(label, inp);
  }

  function fCheck(label, value, on) {
    var inp = h('input', { type: 'checkbox' });
    inp.checked = !!value;
    inp.addEventListener('change', function () { on(inp.checked); });
    return h('label', { class: 'field check' }, [inp, h('span', { text: label })]);
  }

  function fBtns(list) {
    return h('div', { class: 'btn-row' }, list.map(function (b) {
      if (!b) return null;
      return h('button', { type: 'button', class: 'btn ' + (b[2] || ''), text: b[0], title: b[3] || '', onclick: function (ev) { ev.preventDefault(); b[1](); } });
    }));
  }

  function note(text) { return h('p', { class: 'pnote', text: text }); }
  function px(v) { return Math.round(parseFloat(v) || 0); }
  function chg() { E.changed(); }

  /* ====================================================== elementos ====== */

  function buildBlocks() {
    paneBlocks.textContent = '';
    paneBlocks.appendChild(note('Arrastra un elemento a la página, o haz clic para añadirlo debajo de lo seleccionado.'));
    WB.CATALOG.forEach(function (cat) {
      paneBlocks.appendChild(h('h4', { class: 'blk-cat', text: cat.cat }));
      var grid = h('div', { class: 'blk-grid' });
      cat.items.forEach(function (it) {
        var b = h('button', { type: 'button', class: 'blk', title: it.name }, [icon(it.icon), h('span', { text: it.name })]);
        b.addEventListener('pointerdown', function (ev) {
          E.startDrag(ev, {
            kind: it.kind || 'content',
            label: it.name,
            onDrop: function (place) { E.insert(it.id, place); },
            onClick: function () { E.insert(it.id); }
          });
        });
        grid.appendChild(b);
      });
      paneBlocks.appendChild(grid);
    });
  }

  /* ==================================================== propiedades ====== */

  function textGroup(el) {
    var cs = E.idoc.defaultView.getComputedStyle(el);
    var fam = (/^\s*["']?([^"',]+)/.exec(el.style.fontFamily) || [])[1] || '';
    var fonts = [['', '(la de la página)']].concat(WB.FONTS.map(function (f) { return [f.name, f.name]; }));
    var fs = parseFloat(cs.fontSize) || 16;
    var aligns = [['left', 'ic-align-left', 'Izquierda'], ['center', 'ic-align-center', 'Centro'], ['right', 'ic-align-right', 'Derecha'], ['justify', 'ic-align-justify', 'Justificado']];

    return group('Texto', [
      fSelect('Fuente', fonts, fam, function (v) { el.style.fontFamily = v ? WB.fontStack(v) : ''; if (v) E.ensureFonts([v]); chg(); }),
      fRange('Tamaño', { min: 8, max: 160, value: Math.round(fs), unit: 'px', on: function (v) { el.style.fontSize = v + 'px'; chg(); } }),
      fSelect('Grosor', [['', '(el del estilo)'], ['300', 'Fina'], ['400', 'Normal'], ['500', 'Media'], ['600', 'Seminegra'], ['700', 'Negrita'], ['800', 'Extra negrita'], ['900', 'Negra']],
        el.style.fontWeight, function (v) { el.style.fontWeight = v; chg(); }),
      fCheck('Cursiva', cs.fontStyle === 'italic', function (v) { el.style.fontStyle = v ? 'italic' : 'normal'; chg(); }),
      fColor('Color del texto', { value: el.style.color, fallback: WB.doc.toHex(cs.color), noneLabel: 'el del estilo', on: function (v) { el.style.color = v; chg(); } }),
      h('div', { class: 'field' }, [h('span', { text: 'Alineación' }), h('div', { class: 'seg' }, aligns.map(function (a) {
        return h('button', { type: 'button', class: 'icon-btn' + (cs.textAlign === a[0] ? ' is-active' : ''), title: a[2], onclick: function () { el.style.textAlign = a[0]; chg(); P.renderProps(); } }, [icon(a[1])]);
      }))]),
      fRange('Interlineado', { min: 0.8, max: 3, step: 0.05, value: (parseFloat(cs.lineHeight) / fs || 1.6).toFixed(2), on: function (v) { el.style.lineHeight = v; chg(); } }),
      fRange('Espacio entre letras', { min: -3, max: 24, step: 0.5, value: parseFloat(cs.letterSpacing) || 0, unit: 'px', on: function (v) { el.style.letterSpacing = v ? v + 'px' : ''; chg(); } }),
      fRange('Espacio entre palabras', { min: 0, max: 30, step: 1, value: parseFloat(cs.wordSpacing) || 0, unit: 'px', on: function (v) { el.style.wordSpacing = v ? v + 'px' : ''; chg(); } }),
      fRange('Sangría de primera línea', { min: 0, max: 90, step: 2, value: px(cs.textIndent), unit: 'px', on: function (v) { el.style.textIndent = v ? v + 'px' : ''; chg(); } }),
      fSelect('Mayúsculas', [['', '(como está escrito)'], ['uppercase', 'TODO EN MAYÚSCULAS'], ['lowercase', 'todo en minúsculas'], ['capitalize', 'Iniciales En Mayúscula'], ['small-caps', 'Versalitas']],
        el.style.fontVariant === 'small-caps' ? 'small-caps' : el.style.textTransform, function (v) {
          el.style.fontVariant = v === 'small-caps' ? 'small-caps' : '';
          el.style.textTransform = v === 'small-caps' ? '' : v;
          chg();
        }),
      fSelect('Efecto', WB.TEXT_FX.map(function (f) { return [f.id, f.name]; }), 'none', function (v) {
        var fx = WB.TEXT_FX.filter(function (f) { return f.id === v; })[0];
        WB.TEXT_FX_PROPS.forEach(function (p) { el.style[p] = ''; });
        Object.assign(el.style, fx.css);
        chg();
      })
    ], true);
  }

  function boxGroup(el) {
    var cs = E.idoc.defaultView.getComputedStyle(el);
    var place = el.style.marginLeft === 'auto' ? (el.style.marginRight === 'auto' ? 'center' : 'right') : '';
    return group('Caja y espacio', [
      fColor('Fondo', { value: el.style.backgroundColor, fallback: '#ffffff', on: function (v) { el.style.backgroundColor = v; chg(); } }),
      fRange('Relleno interior', { min: 0, max: 100, value: px(cs.paddingTop), unit: 'px', on: function (v) { el.style.padding = v + 'px'; chg(); } }),
      fRange('Espacio encima', { min: -60, max: 200, value: px(cs.marginTop), unit: 'px', on: function (v) { el.style.marginTop = v + 'px'; chg(); } }),
      fRange('Espacio debajo', { min: -60, max: 200, value: px(cs.marginBottom), unit: 'px', on: function (v) { el.style.marginBottom = v + 'px'; chg(); } }),
      fRange('Ancho máximo', { min: 15, max: 100, value: parseInt(el.style.maxWidth, 10) || 100, unit: '%', on: function (v) { el.style.maxWidth = v >= 100 ? '' : v + '%'; chg(); } }),
      fSelect('Colocación', [['', 'A la izquierda'], ['center', 'Centrado'], ['right', 'A la derecha']], place, function (v) {
        el.style.marginLeft = v ? 'auto' : '';
        el.style.marginRight = v === 'center' ? 'auto' : '';
        chg();
      }),
      fRange('Grosor del borde', { min: 0, max: 14, value: el.style.borderWidth ? px(el.style.borderWidth) : 0, unit: 'px', on: function (v) {
        el.style.borderWidth = v + 'px';
        if (v && !el.style.borderStyle) el.style.borderStyle = 'solid';
        chg();
      } }),
      fSelect('Tipo de borde', [['', '(el del estilo)'], ['solid', 'Continuo'], ['dashed', 'Rayas'], ['dotted', 'Puntos'], ['double', 'Doble']],
        el.style.borderStyle, function (v) { el.style.borderStyle = v; chg(); }),
      fColor('Color del borde', { value: el.style.borderColor, fallback: WB.doc.toHex(cs.borderTopColor), noneLabel: 'el del estilo', on: function (v) { el.style.borderColor = v; chg(); } }),
      fRange('Esquinas redondeadas', { min: 0, max: 90, value: px(cs.borderTopLeftRadius), unit: 'px', on: function (v) { el.style.borderRadius = v + 'px'; chg(); } }),
      fSelect('Sombra', [['', '(la del estilo)'], ['none', 'Sin sombra'], ['var(--shadow-sm)', 'Suave'], ['var(--shadow-md)', 'Media'], ['var(--shadow-lg)', 'Grande'], ['8px 8px 0 var(--accent)', 'Dura (cartel)']],
        el.style.boxShadow, function (v) { el.style.boxShadow = v; chg(); }),
      fRange('Opacidad', { min: 10, max: 100, step: 5, value: Math.round((parseFloat(cs.opacity) || 1) * 100), unit: '%', on: function (v) { el.style.opacity = v >= 100 ? '' : v / 100; chg(); } })
    ], false);
  }

  var TF0 = { rz: 0, rx: 0, ry: 0, p: 800, sc: 100, sk: 0 };

  function fxGroup(el) {
    var tf = {};
    try { tf = JSON.parse(el.getAttribute('data-wb-tf')) || {}; } catch (e) {}
    tf = Object.assign({}, TF0, tf);

    function apply(k, v) {
      tf[k] = v;
      var s = '';
      if (tf.rx || tf.ry) s += 'perspective(' + tf.p + 'px) rotateX(' + tf.rx + 'deg) rotateY(' + tf.ry + 'deg) ';
      if (tf.rz) s += 'rotate(' + tf.rz + 'deg) ';
      if (tf.sk) s += 'skewX(' + tf.sk + 'deg) ';
      if (tf.sc !== 100) s += 'scale(' + tf.sc / 100 + ')';
      el.style.transform = s.trim();
      if (s && E.idoc.defaultView.getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
      if (s) el.setAttribute('data-wb-tf', JSON.stringify(tf)); else el.removeAttribute('data-wb-tf');
      chg();
    }

    return group('Giro y 3D', [
      fRange('Girar', { min: -180, max: 180, value: tf.rz, unit: '°', on: function (v) { apply('rz', v); } }),
      fRange('Inclinar hacia atrás / delante', { min: -75, max: 75, value: tf.rx, unit: '°', on: function (v) { apply('rx', v); } }),
      fRange('Girar en profundidad', { min: -75, max: 75, value: tf.ry, unit: '°', on: function (v) { apply('ry', v); } }),
      fRange('Perspectiva', { min: 200, max: 2000, step: 50, value: tf.p, unit: 'px', on: function (v) { apply('p', v); } }),
      fRange('Sesgar', { min: -45, max: 45, value: tf.sk, unit: '°', on: function (v) { apply('sk', v); } }),
      fRange('Escala', { min: 30, max: 250, step: 5, value: tf.sc, unit: '%', on: function (v) { apply('sc', v); } })
    ], false);
  }

  function advGroup(el, t) {
    var kids = [];
    // cualquier bloque puede tener un ancla: un enlace a #nombre salta hasta el
    if (!el.closest('.site-header')) {
      kids.push(fText('Ancla: nombre para saltar aquí con #nombre', el.id, function (v) {
        var id = String(v || '').replace(/^#/, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
        if (!id) { if (t.kind !== 'section') el.removeAttribute('id'); E.commit(); return; }
        var base = id, d = el.ownerDocument;
        for (var n = 2; d.getElementById(id) && d.getElementById(id) !== el; n++) id = base + '-' + n;
        el.id = id;
        E.commit();
        WB.ui.status('Ancla lista: un enlace a «#' + id + '» salta hasta este bloque');
      }, { lazy: true }));
    }
    if (E.isFree(el)) {
      kids.push(fCheck('Aparece con animación al llegar a él', el.classList.contains('reveal'), function (v) { el.classList.toggle('reveal', v); chg(); }));
    }
    if (el.parentElement && el.parentElement.matches('.wb-flow')) {
      kids.unshift(fCheck('Ocupa todas las columnas del texto', el.classList.contains('span-all'), function (v) { el.classList.toggle('span-all', v); chg(); }));
    }
    kids.push(fBtns([['Quitar los estilos propios', function () {
      el.removeAttribute('style');
      el.removeAttribute('data-wb-tf');
      if (el.classList.contains('wb-art')) WB.art.render(el);
      E.commit('estilos quitados');
      P.renderProps();
    }]]));
    return group('Avanzado', kids, false);
  }

  /* ---- imagen ---- */

  function imageGroups(el, t) {
    var img = WB.img.of(el);
    if (!img) return [];
    var fx = WB.img.fx(img);
    var pos = /(-?[\d.]+)%\s+(-?[\d.]+)%/.exec(img.style.objectPosition) || [0, 50, 50];
    var holder = img.closest('.media-figure, .hero-frame, .gallery-item, .np-cover, .np-between-fig');

    function setPos(x, y) {
      pos[1] = x; pos[2] = y;
      img.style.objectPosition = x + '% ' + y + '%';
      img.style.transformOrigin = img.style.objectPosition;
      chg();
    }

    var main = [
      h('img', { class: 'img-thumb', src: img.getAttribute('src') || '', alt: '' }),
      fBtns([
        ['Elegir archivo…', function () { WB.img.pick(img); }, 'btn-primary'],
        ['Desde internet…', function () { WB.img.askUrl(img); }]
      ]),
      note('También puedes arrastrar una imagen desde el explorador encima de la foto, o hacer doble clic sobre ella.'),
      fText('Texto alternativo (lo leen los lectores de pantalla)', img.getAttribute('alt'), function (v) { img.setAttribute('alt', v); chg(); })
    ];

    if (holder) {
      main.push(fCheck('Se amplía al hacer clic', holder.hasAttribute('data-lightbox-src'), function (v) {
        if (v) { holder.setAttribute('data-lightbox-src', img.getAttribute('src')); holder.setAttribute('data-lightbox-caption', ''); }
        else { holder.removeAttribute('data-lightbox-src'); holder.removeAttribute('data-lightbox-caption'); }
        chg(); P.renderProps();
      }));
      if (holder.hasAttribute('data-lightbox-src')) {
        main.push(fText('Texto bajo la imagen ampliada', holder.getAttribute('data-lightbox-caption'), function (v) { holder.setAttribute('data-lightbox-caption', v); chg(); }));
      }
    }

    var frameG = [
      fRange('Alto', { min: 60, max: 1000, step: 10, value: px(img.style.height) || img.offsetHeight || 300, unit: 'px', on: function (v) { img.style.height = v + 'px'; img.style.maxHeight = 'none'; chg(); } }),
      fBtns([['Alto automático', function () { img.style.height = ''; img.style.maxHeight = ''; chg(); P.renderProps(); }]]),
      fSelect('Encaje', [['', 'Rellenar el marco (recorta)'], ['contain', 'Imagen entera'], ['fill', 'Estirar']], img.style.objectFit, function (v) { img.style.objectFit = v; chg(); }),
      fRange('Encuadre horizontal', { min: 0, max: 100, value: +pos[1], unit: '%', on: function (v) { setPos(v, pos[2]); } }),
      fRange('Encuadre vertical', { min: 0, max: 100, value: +pos[2], unit: '%', on: function (v) { setPos(pos[1], v); } }),
      fRange('Zoom', { min: 100, max: 400, step: 5, value: fx.zoom, unit: '%', on: function (v) { WB.img.setFx(img, { zoom: v }); } }),
      fCheck('Voltear en horizontal', fx.flip, function (v) { WB.img.setFx(img, { flip: v }); })
    ];

    if (el.matches('.media-figure') && el.parentElement.matches(E.SLOT)) {
      var cur = el.getAttribute('data-wb-pos') || '';
      var w = parseInt(el.style.width, 10) || (cur ? 45 : 100);
      var layout = function (mode, width) {
        cur = mode; w = width;
        el.style.float = mode === 'left' || mode === 'right' ? mode : '';
        el.style.width = mode ? width + '%' : '';
        el.style.margin = mode === 'left' ? '0.4rem 1.7rem 1rem 0' : mode === 'right' ? '0.4rem 0 1rem 1.7rem' : mode === 'center' ? '2rem auto' : '';
        if (mode) el.setAttribute('data-wb-pos', mode); else el.removeAttribute('data-wb-pos');
        chg();
      };
      frameG.unshift(
        fSelect('Colocación en el texto', [['', 'A todo el ancho'], ['left', 'A la izquierda, con el texto alrededor'], ['right', 'A la derecha, con el texto alrededor'], ['center', 'Centrada y más estrecha']], cur, function (v) { layout(v, v ? (w >= 100 ? 45 : w) : 100); P.renderProps(); }),
        cur ? fRange('Ancho', { min: 20, max: 100, step: 5, value: w, unit: '%', on: function (v) { layout(cur, v); } }) : null
      );
    }

    var presets = [['', 'Elegir un filtro hecho…']].concat(WB.img.FX_PRESETS.map(function (p, i) { return [String(i), p[0]]; }));
    var filt = [
      fSelect('Filtros hechos', presets, '', function (v) {
        if (v === '') return;
        var cur = WB.img.fx(img);   // zoom y volteo de ahora, no los de cuando se pinto el panel
        WB.img.setFx(img, Object.assign({ zoom: cur.zoom, flip: cur.flip }, WB.img.FX_PRESETS[+v][1]), true);
        P.renderProps();
      }),
      fRange('Brillo', { min: 0, max: 200, value: fx.bright, unit: '%', on: function (v) { WB.img.setFx(img, { bright: v }); } }),
      fRange('Contraste', { min: 0, max: 200, value: fx.contrast, unit: '%', on: function (v) { WB.img.setFx(img, { contrast: v }); } }),
      fRange('Saturación', { min: 0, max: 300, value: fx.sat, unit: '%', on: function (v) { WB.img.setFx(img, { sat: v }); } }),
      fRange('Blanco y negro', { min: 0, max: 100, value: fx.gray, unit: '%', on: function (v) { WB.img.setFx(img, { gray: v }); } }),
      fRange('Sepia', { min: 0, max: 100, value: fx.sepia, unit: '%', on: function (v) { WB.img.setFx(img, { sepia: v }); } }),
      fRange('Tono', { min: 0, max: 360, value: fx.hue, unit: '°', on: function (v) { WB.img.setFx(img, { hue: v }); } }),
      fRange('Desenfoque', { min: 0, max: 20, step: 0.5, value: fx.blur, unit: 'px', on: function (v) { WB.img.setFx(img, { blur: v }); } })
    ];

    return [group('Imagen', main, true), group('Marco y encuadre', frameG, true), group('Filtros', filt, false)];
  }

  /* ---- texto artistico ---- */

  function artGroups(el) {
    var v = WB.art.get(el);
    function set(k) { return function (val) { var p = {}; p[k] = val; WB.art.set(el, p); }; }
    var fonts = WB.FONTS.map(function (f) { return [f.name, f.name]; });

    return [
      group('Texto artístico', [
        fSelect('Estilos hechos', [['', 'Elegir un estilo…']].concat(WB.ART_PRESETS.map(function (p, i) { return [String(i), p.name]; })), '', function (i) {
          if (i === '') return;
          var now = WB.art.get(el);   // el texto puede haber cambiado desde que se pinto el panel
          WB.art.set(el, Object.assign({}, WB.ART_PRESETS[+i].v, { text: now.text, uid: now.uid }));
          P.renderProps();
        }),
        fText('Texto', v.text, set('text'), { area: true, rows: 2 }),
        fSelect('Forma', [['line', 'Recto'], ['arcUp', 'Arco hacia arriba'], ['arcDown', 'Arco hacia abajo'], ['wave', 'Onda'], ['circle', 'Círculo']], v.shape, set('shape')),
        fRange('Curvatura', { min: 0, max: 100, value: v.curve || 0, unit: '%', on: set('curve') }),
        fSelect('Fuente', fonts, v.font, set('font')),
        fRange('Tamaño', { min: 16, max: 240, value: v.size || 80, unit: 'px', on: set('size') }),
        fSelect('Grosor', [['400', 'Normal'], ['600', 'Seminegra'], ['700', 'Negrita'], ['900', 'Negra']], String(v.weight || 700), function (x) { WB.art.set(el, { weight: +x }); }),
        fRange('Espacio entre letras', { min: -4, max: 40, value: v.spacing || 0, unit: 'px', on: set('spacing') })
      ], true),
      group('Color y contorno', [
        fColor('Color', { value: v.fill, none: false, on: function (c) { WB.art.set(el, { fill: c || 'var(--accent)' }); } }),
        fColor('Segundo color (degradado)', { value: v.fill2, noneLabel: 'sin degradado', on: set('fill2') }),
        fColor('Contorno', { value: v.stroke, noneLabel: 'sin contorno', on: function (c) { WB.art.set(el, { stroke: c, strokeW: c ? (v.strokeW || 2) : 0 }); v = WB.art.get(el); } }),
        fRange('Grosor del contorno', { min: 0, max: 14, step: 0.5, value: v.strokeW || 0, unit: 'px', on: set('strokeW') }),
        fRange('Resplandor', { min: 0, max: 40, value: v.glow || 0, unit: 'px', on: set('glow') }),
        fColor('Color del resplandor', { value: v.glowColor, none: false, on: set('glowColor') })
      ], true),
      group('Volumen y 3D', [
        fRange('Profundidad', { min: 0, max: 30, value: v.depth || 0, unit: 'px', on: set('depth') }),
        fRange('Dirección del volumen', { min: 0, max: 360, step: 5, value: v.depthAngle === undefined ? 45 : v.depthAngle, unit: '°', on: set('depthAngle') }),
        fColor('Color del volumen', { value: v.depthColor, none: false, on: set('depthColor') }),
        fRange('Inclinar hacia atrás / delante', { min: -75, max: 75, value: v.rx || 0, unit: '°', on: set('rx') }),
        fRange('Girar en profundidad', { min: -75, max: 75, value: v.ry || 0, unit: '°', on: set('ry') }),
        fRange('Girar', { min: -180, max: 180, value: v.rz || 0, unit: '°', on: set('rz') }),
        fRange('Perspectiva', { min: 200, max: 2000, step: 50, value: v.persp || 800, unit: 'px', on: set('persp') }),
        fSelect('Movimiento', [['', 'Quieto'], ['float', 'Flota'], ['pulse', 'Late'], ['swing', 'Se balancea']], v.anim || '', set('anim'))
      ], true)
    ];
  }

  /* ---- lo propio de cada tipo ---- */

  function addChild(el, t) {
    var kids = el.querySelectorAll(':scope > ' + t.grid);
    var last = kids[kids.length - 1];
    if (!last) return;
    var c = last.cloneNode(true);
    c.querySelectorAll('[data-i18n]').forEach(function (n) { n.removeAttribute('data-i18n'); });
    c.removeAttribute('data-i18n');
    if (c.tagName === 'DETAILS') c.open = true;
    last.after(c);
    E.commit('elemento añadido');
    E.select(c);
  }

  function videoHtml(url) {
    url = url.trim();
    var yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/.exec(url);
    var vm = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url);
    var e = WB.esc;
    if (yt) return '<iframe src="https://www.youtube-nocookie.com/embed/' + yt[1] + '" title="Vídeo" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    if (vm) return '<iframe src="https://player.vimeo.com/video/' + vm[1] + '" title="Vídeo" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>';
    if (/^https?:\/\/.+\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return '<video controls preload="metadata" src="' + e(url) + '"></video>';
    if (/^https?:\/\//.test(url)) return '<iframe src="' + e(url) + '" title="Contenido incrustado" loading="lazy" allowfullscreen></iframe>';
    return '<div class="wb-video-ph">Pega la dirección del vídeo en el panel de Propiedades</div>';
  }

  function anchors() {
    return Array.prototype.map.call(E.idoc.querySelectorAll('.article-section[id], .hero[id]'), function (s) {
      var hd = s.querySelector('h1, h2');
      return ['#' + s.id, (hd ? hd.textContent.trim().slice(0, 40) : s.id)];
    });
  }

  function linkField(a, label) {
    var opts = [['', '(otra dirección, escrita abajo)']].concat(anchors());
    var href = a.getAttribute('href') || '';
    var known = opts.some(function (o) { return o[0] === href; });
    return [
      fSelect(label || 'Lleva a', opts, known ? href : '', function (v) { if (v) { a.setAttribute('href', v); chg(); P.renderProps(); } }),
      fText('Dirección', href, function (v) { a.setAttribute('href', v.trim() || '#'); chg(); }, { placeholder: 'https://… o #seccion' }),
      fCheck('Abrir en otra pestaña', a.getAttribute('target') === '_blank', function (v) {
        if (v) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
        else { a.removeAttribute('target'); a.removeAttribute('rel'); }
        chg();
      })
    ];
  }

  function specific(el, t) {
    // otros modulos pueden añadir grupos propios (redaccion.js)
    if (P.extra) { var more = P.extra(el, t); if (more && more.length) return more.concat(specific0(el, t)); }
    return specific0(el, t);
  }

  function specific0(el, t) {
    var d = E.idoc;
    var out = [];
    var k = [];

    if (t.image) out = out.concat(imageGroups(el, t));
    if (el.matches('.wb-art')) return artGroups(el);

    if (el.matches('.np-grid')) {
      k.push(fBtns([['＋ Añadir una pieza', function () { addChild(el, t); }, 'btn-primary']]));
      k.push(fCheck('Filetes entre las piezas', el.classList.contains('rules'), function (v) { el.classList.toggle('rules', v); chg(); }));
      k.push(fRange('Separación entre columnas', { min: 8, max: 60, value: px(d.defaultView.getComputedStyle(el).columnGap), unit: 'px', on: function (v) { el.style.columnGap = v + 'px'; chg(); } }));
      k.push(note('La rejilla tiene 12 columnas. Selecciona una pieza para decidir cuántas ocupa: 12 es todo el ancho, 6 la mitad, 4 un tercio, 3 un cuarto.'));
      out.push(group(t.name, k, true));
      return out;
    }
    if (el.matches('.np-story')) {
      var gs = function (name, def) { return parseInt(el.style.getPropertyValue(name), 10) || def; };
      k.push(fRange('Columnas que ocupa (de 12)', { min: 2, max: 12, value: gs('--span', 4), on: function (v) { el.style.setProperty('--span', v); chg(); } }));
      k.push(fRange('Filas que ocupa', { min: 1, max: 4, value: gs('--rows', 1), on: function (v) { el.style.setProperty('--rows', v); chg(); } }));
      k.push(note('Arrastra dentro de la pieza titulares, imágenes o cualquier otro elemento. Las flechas cambian su orden en la rejilla.'));
      out.push(group(t.name, k, true));
      return out;
    }
    if (el.matches('.np-between')) {
      var gv = function (name, def) { return parseFloat(el.style.getPropertyValue(name)) || def; };
      k.push(fRange('Ancho de la imagen', { min: 120, max: 620, step: 10, value: gv('--iw', 300), unit: 'px', on: function (v) { el.style.setProperty('--iw', v + 'px'); chg(); } }));
      k.push(fRange('Alto de la imagen', { min: 100, max: 620, step: 10, value: gv('--ih', 240), unit: 'px', on: function (v) { el.style.setProperty('--ih', v + 'px'); chg(); } }));
      k.push(fRange('Altura a la que se coloca', { min: 0, max: 900, step: 10, value: el.style.getPropertyValue('--top') ? gv('--top', 72) : 72, unit: 'px', on: function (v) { el.style.setProperty('--top', v + 'px'); chg(); } }));
      k.push(fRange('Separación entre columnas', { min: 12, max: 80, value: px(d.defaultView.getComputedStyle(el).columnGap), unit: 'px', on: function (v) { el.style.columnGap = v + 'px'; chg(); } }));
      k.push(note('El texto de las dos columnas rodea la imagen. Haz doble clic sobre ella para cambiarla.'));
      out.push(group(t.name, k, true));
      return out;
    }
    if (el.matches('.np-cover')) {
      var cimg = el.querySelector(':scope > img');
      k.push(fSelect('Titular', [['', 'Abajo'], ['top', 'Arriba']], el.classList.contains('top') ? 'top' : '', function (v) { el.classList.toggle('top', v === 'top'); chg(); }));
      k.push(fCheck('Marco de color (portada de revista)', el.classList.contains('frame'), function (v) { el.classList.toggle('frame', v); chg(); }));
      if (cimg) k.push(fRange('Alto de la foto', { min: 200, max: 1000, step: 10, value: cimg.offsetHeight || 520, unit: 'px', on: function (v) { cimg.style.height = v + 'px'; chg(); } }));
      out.push(group(t.name, k, true));
      return out;
    }
    if (el.matches('.np-nameplate')) {
      var cur = el.classList.contains('frak') ? 'frak' : el.classList.contains('bar') ? 'bar' : el.classList.contains('caps') ? 'caps' : '';
      k.push(fSelect('Estilo de la cabecera', [['', 'Clásica con filetes'], ['caps', 'Versales'], ['frak', 'Letra gótica'], ['bar', 'Banda de color']], cur, function (v) {
        ['frak', 'bar', 'caps'].forEach(function (c) { el.classList.toggle(c, c === v); });
        if (v === 'frak') E.ensureFonts(['UnifrakturMaguntia']);
        chg();
      }));
      out.push(group(t.name, k, true));
      return out;
    }
    if (el.matches('.np-nav')) {
      k.push(fBtns([['＋ Sección', function () { el.appendChild(E.make('<a href="#">Sección</a>')); E.commit('sección añadida'); }, 'btn-primary']]));
      out.push(group(t.name, k, true));
      return out;
    }
    if (el.matches('.np-title')) {
      var size = ['np-xl', 'np-lg', 'np-md', 'np-sm'].filter(function (c) { return el.classList.contains(c); })[0] || 'np-md';
      k.push(fSelect('Cuerpo del titular', [['np-xl', 'A toda página'], ['np-lg', 'Grande'], ['np-md', 'Mediano'], ['np-sm', 'Pequeño']], size, function (v) {
        ['np-xl', 'np-lg', 'np-md', 'np-sm'].forEach(function (c) { el.classList.toggle(c, c === v); });
        chg();
      }));
      k.push(fCheck('En cursiva', el.classList.contains('it'), function (v) { el.classList.toggle('it', v); chg(); }));
      k.push(fCheck('Fino en vez de negrita', el.classList.contains('light'), function (v) { el.classList.toggle('light', v); chg(); }));
      out.push(group('Titular', k, true));
      return out;
    }

    if (t.grid) {
      var n = el.querySelectorAll(':scope > ' + t.grid).length;
      k.push(fBtns([['＋ Añadir otro', function () { addChild(el, t); }, 'btn-primary']]));
      if (!el.matches('.timeline, .wb-acc')) {
        var cols = el.matches('.wb-cols') ? parseInt(el.style.getPropertyValue('--cols'), 10) || n
          : (/repeat\((\d+)/.exec(el.style.gridTemplateColumns) || [])[1] || Math.min(n, el.matches('.info-cards') ? 2 : el.matches('.stats-grid') ? 4 : 3);
        k.push(fRange('Columnas', { min: 1, max: 6, value: +cols, on: function (v) {
          if (el.matches('.wb-cols')) el.style.setProperty('--cols', v);
          else el.style.gridTemplateColumns = 'repeat(' + v + ', 1fr)';
          chg();
        } }));
        k.push(fRange('Separación', { min: 0, max: 60, value: px(d.defaultView.getComputedStyle(el).columnGap), unit: 'px', on: function (v) { el.style.gap = v + 'px'; chg(); } }));
      }
      if (el.matches('.wb-cols')) k.push(fCheck('Filete entre columnas', el.classList.contains('rule'), function (v) { el.classList.toggle('rule', v); chg(); }));
      if (el.matches('.gallery-grid')) {
        var first = el.querySelector('img');
        k.push(fRange('Alto de las fotos', { min: 80, max: 600, step: 10, value: first ? first.offsetHeight : 210, unit: 'px', on: function (v) {
          el.querySelectorAll('img').forEach(function (i) { i.style.height = v + 'px'; });
          chg();
        } }));
      }
      out.push(group(t.name, k, true));
      return out;
    }

    if (el.matches('.wb-flow')) {
      k.push(fRange('Columnas', { min: 1, max: 4, value: parseInt(el.style.columnCount, 10) || 2, on: function (v) { el.style.columnCount = v; chg(); } }));
      k.push(fRange('Separación', { min: 10, max: 80, value: px(d.defaultView.getComputedStyle(el).columnGap) || 35, unit: 'px', on: function (v) { el.style.columnGap = v + 'px'; chg(); } }));
      k.push(fCheck('Filete entre columnas', el.style.columnRule !== 'none', function (v) { el.style.columnRule = v ? '' : 'none'; chg(); }));
      k.push(fCheck('Texto justificado', el.style.textAlign !== 'left', function (v) { el.style.textAlign = v ? '' : 'left'; chg(); }));
    } else if (el.matches('.wb-callout')) {
      k.push(fSelect('Tono', [['info', 'Informativo (acento)'], ['ok', 'Correcto (verde)'], ['warn', 'Aviso (ámbar)'], ['danger', 'Peligro (rojo)']], el.getAttribute('data-tone'), function (v) { el.setAttribute('data-tone', v); chg(); }));
      k.push(fCheck('Con icono', !!el.querySelector('.wb-callout-icon'), function (v) {
        var ic = el.querySelector('.wb-callout-icon');
        if (v && !ic) el.insertBefore(E.make('<div class="wb-callout-icon">💡</div>'), el.firstChild);
        if (!v && ic) ic.remove();
        E.commit();
      }));
      k.push(note('El icono es texto: haz clic sobre él y escribe otro emoji.'));
    } else if (el.matches('.wb-window')) {
      k.push(fCheck('Botones de colores en la barra', !!el.querySelector('.wb-window-dots'), function (v) {
        var dots = el.querySelector('.wb-window-dots');
        if (v && !dots) el.querySelector('.wb-window-bar').insertBefore(E.make('<span class="wb-window-dots"><i></i><i></i><i></i></span>'), el.querySelector('.wb-window-bar').firstChild);
        if (!v && dots) dots.remove();
        E.commit();
      }));
      k.push(note('Arrastra dentro de la ventana cualquier elemento del catálogo.'));
    } else if (el.matches('.wb-modal-wrap')) {
      var box = el.querySelector('.wb-modal-box');
      k.push(fCheck('Mostrar el modal para editarlo', el.classList.contains('wb-edit-open'), function (v) { el.classList.toggle('wb-edit-open', v); E.refreshSoon(); }));
      k.push(fRange('Ancho del modal', { min: 320, max: 1100, step: 20, value: px(box.style.maxWidth) || 640, unit: 'px', on: function (v) { box.style.maxWidth = v + 'px'; chg(); } }));
      k.push(note('En la página publicada el modal se abre al pulsar el botón y se cierra con la ✕, con Escape o pulsando fuera. Pruébalo en la vista previa (F5).'));
    } else if (el.matches('.wb-tabs')) {
      k.push(fBtns([
        ['＋ Pestaña', function () {
          el.querySelector('.wb-tab-bar').appendChild(E.make('<a class="wb-tab" href="#" role="tab">Nueva</a>'));
          el.appendChild(E.make('<div class="wb-tab-panel" data-wb-slot><p>Contenido de la pestaña.</p></div>'));
          E.commit('pestaña añadida');
        }, 'btn-primary'],
        ['Quitar la pestaña abierta', function () {
          var tabs = el.querySelectorAll(':scope > .wb-tab-bar > .wb-tab');
          if (tabs.length < 2) { WB.ui.status('tiene que quedar al menos una pestaña'); return; }
          var i = Array.prototype.findIndex.call(tabs, function (x) { return x.classList.contains('is-active'); });
          if (i < 0) i = tabs.length - 1;
          var panels = el.querySelectorAll(':scope > .wb-tab-panel');
          tabs[i].remove();
          if (panels[i]) panels[i].remove();
          var t0 = el.querySelector('.wb-tab'), p0 = el.querySelector('.wb-tab-panel');
          if (t0) t0.classList.add('is-active');
          if (p0) p0.classList.add('is-active');
          E.commit('pestaña quitada');
        }]
      ]));
      k.push(note('Pulsa una pestaña para ver y editar su contenido.'));
    } else if (el.matches('.wb-table-wrap')) {
      var table = el.querySelector('table');
      var body = table.tBodies[0] || table;
      var colCount = function () {
        return Array.prototype.reduce.call(table.rows, function (m, r) { return Math.max(m, r.cells.length); }, 0);
      };
      k.push(fBtns([
        ['＋ Fila', function () {
          var tr = d.createElement('tr');
          for (var i = 0; i < colCount(); i++) tr.appendChild(E.make('<td>—</td>'));
          body.appendChild(tr);
          E.commit('fila añadida');
        }, 'btn-primary'],
        ['＋ Columna', function () {
          Array.prototype.forEach.call(table.rows, function (r) {
            r.appendChild(d.createElement(r.parentElement.tagName === 'THEAD' ? 'th' : 'td')).textContent = r.parentElement.tagName === 'THEAD' ? 'Título' : '—';
          });
          E.commit('columna añadida');
        }, 'btn-primary']
      ]));
      k.push(fBtns([
        ['− Última fila', function () { if (body.rows.length > 1) { body.deleteRow(-1); E.commit('fila quitada'); } }],
        ['− Última columna', function () {
          if (colCount() < 2) return;
          Array.prototype.forEach.call(table.rows, function (r) { r.deleteCell(-1); });
          E.commit('columna quitada');
        }]
      ]));
      k.push(fCheck('Con fila de títulos', !!table.tHead, function (v) {
        if (v && !table.tHead) {
          var n = colCount();   // antes de crear la fila: la nueva seria la primera y esta vacia
          var hd = table.createTHead().insertRow();
          for (var i = 0; i < n; i++) hd.appendChild(d.createElement('th')).textContent = 'Título';
        } else if (!v && table.tHead) table.deleteTHead();
        E.commit();
      }));
    } else if (el.matches('.wb-video')) {
      var src = el.querySelector('iframe, video');
      k.push(fText('Dirección del vídeo', src ? src.getAttribute('src') : '', function (v) { el.innerHTML = videoHtml(v); E.commit('vídeo cambiado'); },
        { lazy: true, placeholder: 'https://www.youtube.com/watch?v=…' }));
      k.push(fSelect('Proporción', [['16 / 9', 'Panorámico 16:9'], ['4 / 3', 'Clásico 4:3'], ['1 / 1', 'Cuadrado'], ['9 / 16', 'Vertical 9:16']], el.style.aspectRatio || '16 / 9', function (v) { el.style.aspectRatio = v; chg(); }));
      k.push(note('Vale una dirección de YouTube o Vimeo, o un archivo .mp4 o .webm publicado en internet.'));
    } else if (el.matches('.wb-embed')) {
      k.push(fText('Código HTML', el.innerHTML, function (v) { el.innerHTML = v; E.commit('HTML cambiado'); }, { area: true, rows: 10, lazy: true }));
      k.push(note('Se inserta tal cual en la página. Los scripts solo funcionan en la página publicada, no en el editor.'));
    } else if (el.matches('.wb-divider')) {
      k.push(fSelect('Estilo', [['line', 'Línea fina'], ['double', 'Línea doble'], ['accent', 'Trazo corto de color'], ['dots', 'Tres puntos'], ['orn', 'Adorno'], ['thick', 'Filete grueso']], el.getAttribute('data-style'), function (v) { el.setAttribute('data-style', v); chg(); }));
    } else if (el.matches('.wb-spacer')) {
      k.push(fRange('Alto', { min: 4, max: 400, step: 4, value: el.offsetHeight, unit: 'px', on: function (v) { el.style.height = v + 'px'; chg(); } }));
    } else if (el.matches('.wb-btn')) {
      k = k.concat(linkField(el, 'El botón lleva a'));
      if (el.hasAttribute('data-wb-modal-open')) k = [note('Este botón abre la ventana modal. Doble clic sobre él para ver u ocultar el modal.')];
      k.push(fSelect('Aspecto', [['', 'Relleno'], ['ghost', 'Solo contorno']], el.classList.contains('ghost') ? 'ghost' : '', function (v) { el.classList.toggle('ghost', v === 'ghost'); chg(); }));
    } else if (el.matches('.wb-btn-row')) {
      k.push(fBtns([['＋ Otro botón', function () { el.appendChild(E.make('<a class="wb-btn ghost" href="#">Otro botón</a>')); E.commit('botón añadido'); }, 'btn-primary']]));
      k.push(fSelect('Alineación', [['', 'Izquierda'], ['center', 'Centro'], ['flex-end', 'Derecha']], el.style.justifyContent, function (v) { el.style.justifyContent = v; chg(); }));
    } else if (el.matches('.wb-media-text')) {
      k.push(fCheck('Imagen a la derecha', el.classList.contains('rev'), function (v) { el.classList.toggle('rev', v); chg(); }));
      k.push(fRange('Ancho de la imagen', { min: 20, max: 80, step: 5, value: parseInt((/^([\d.]+)fr/.exec(el.style.gridTemplateColumns) || [])[1], 10) || 50, unit: '%', on: function (v) { el.style.gridTemplateColumns = v + 'fr ' + (100 - v) + 'fr'; chg(); } }));
    } else if (el.matches('ul, ol')) {
      k.push(fSelect('Tipo', [['ul', 'Con viñetas'], ['ol', 'Numerada']], el.tagName.toLowerCase(), function (v) { WB.fmt.retag(el, v, el.className); }));
      k.push(fSelect('Viñeta o numeración', el.tagName === 'UL'
        ? [['', 'Punto'], ['circle', 'Círculo'], ['square', 'Cuadrado'], ['"— "', 'Raya'], ['"✓ "', 'Marca'], ['"★ "', 'Estrella'], ['none', 'Sin viñeta']]
        : [['', '1, 2, 3'], ['lower-alpha', 'a, b, c'], ['upper-alpha', 'A, B, C'], ['lower-roman', 'i, ii, iii'], ['upper-roman', 'I, II, III']],
        el.style.listStyleType, function (v) { el.style.listStyleType = v; chg(); }));
    } else if (/^(P|H2|H3|H4)$/.test(el.tagName) && !el.closest('.hero, .site-header, .site-footer, .wb-headline, .wb-masthead')) {
      var cur = el.tagName === 'P'
        ? (el.classList.contains('lead-dropcap') ? 'dropcap' : el.classList.contains('wb-lead') ? 'lead' : el.classList.contains('wb-note') ? 'note' : el.classList.contains('wb-pull') ? 'pull' : 'p')
        : el.tagName.toLowerCase();
      k.push(fSelect('Estilo de párrafo', [['p', 'Párrafo normal'], ['dropcap', 'Párrafo con letra capital'], ['lead', 'Entradilla'], ['pull', 'Cita destacada'], ['note', 'Nota pequeña'], ['h2', 'Título'], ['h3', 'Subtítulo'], ['h4', 'Título menor']], cur, function (v) {
        WB.fmt.paragraph(v, el);
      }));
      if (el.parentElement.matches(E.SLOT)) k.push(fBtns([['✦ Convertir en texto artístico', function () { WB.art.fromBlock(); }]]));
    } else if (el.matches('.site-header')) {
      k.push(fBtns([['＋ Enlace en el menú', function () {
        var nav = el.querySelector('.nav-links');
        if (!nav) return;
        var a = E.make('<a href="#">Enlace</a>');
        nav.appendChild(a);
        E.commit('enlace añadido');
        E.select(a);
      }, 'btn-primary']]));
      k.push(note('Los idiomas, el botón de tema y el resto de partes se eligen en la pestaña Página.'));
    } else if (el.matches('.hero')) {
      var vis = el.querySelector('.hero-visual');
      k.push(fCheck('Con imagen', !!vis && !vis.hidden, function (v) {
        if (vis) vis.hidden = !v;
        el.querySelector('.hero-container').style.gridTemplateColumns = v ? '' : '1fr';
        chg();
      }));
      k.push(fCheck('Imagen a la izquierda', !!vis && vis.style.order === '-1', function (v) { if (vis) vis.style.order = v ? '-1' : ''; chg(); }));
    } else if (el.matches('.site-footer')) {
      var sig = el.querySelector('.footer-signature');
      if (sig) k = k.concat(linkField(sig, 'La firma lleva a'));
    } else if (el.matches('.toc-sidebar')) {
      var list = el.querySelector('.toc-list');
      k.push(fCheck('Índice automático (sale de los títulos de las secciones)', list && list.hasAttribute('data-wb-auto'), function (v) {
        if (!list) return;
        if (v) list.setAttribute('data-wb-auto', ''); else list.removeAttribute('data-wb-auto');
        E.commit(v ? 'índice automático' : 'índice a mano');
      }));
    } else if (t.kind === 'part') {
      k.push(note('Es una parte fija de la página. Se activa o se quita en la pestaña Página.'));
    }

    if (el.tagName === 'A' && !el.matches('.wb-btn, .wb-tab')) k = k.concat(linkField(el));
    if (el.matches('.toc-list > li')) { var la = el.querySelector('a'); if (la) k = k.concat(linkField(la)); }

    if (k.length) out.push(group(t.name, k, true));
    return out;
  }

  P.renderProps = function () {
    var keep = paneProps.parentElement.scrollTop;
    var sameEl = P._last === E.sel;
    P._last = E.sel;
    paneProps.textContent = '';
    if (!E.idoc) { paneProps.appendChild(note('Abre o crea un artículo para empezar.')); return; }
    var el = E.sel;
    if (!el) {
      paneProps.appendChild(h('div', { class: 'pempty' }, [
        icon('ic-cursor'),
        h('p', { text: 'Haz clic en cualquier parte de la página para seleccionarla.' }),
        h('p', { class: 'pnote', text: 'El texto se escribe directamente encima. Las imágenes se cambian con doble clic. Con el botón derecho salen las acciones del bloque.' })
      ]));
      return;
    }
    var t = WB.typeOf(el) || { name: el.tagName.toLowerCase(), kind: 'content' };

    var crumbs = h('div', { class: 'crumbs' });
    E.path(el).forEach(function (step, i, all) {
      var b = h('button', { type: 'button', class: 'crumb' + (i === all.length - 1 ? ' is-cur' : ''), text: step.type.name, onclick: function () { E.select(step.el, { scroll: true }); } });
      crumbs.appendChild(b);
    });
    paneProps.appendChild(crumbs);

    if (E.isFree(el)) {
      paneProps.appendChild(h('div', { class: 'btn-row acts' }, [
        h('button', { type: 'button', class: 'icon-btn', title: 'Subir (Alt+↑)', onclick: function () { E.move(-1); } }, [icon('ic-up')]),
        h('button', { type: 'button', class: 'icon-btn', title: 'Bajar (Alt+↓)', onclick: function () { E.move(1); } }, [icon('ic-down')]),
        h('button', { type: 'button', class: 'icon-btn', title: 'Duplicar (Ctrl+D)', onclick: function () { E.duplicate(); } }, [icon('ic-copy')]),
        h('button', { type: 'button', class: 'icon-btn', title: 'Eliminar', onclick: function () { E.remove(); } }, [icon('ic-trash')])
      ]));
    }

    specific(el, t).forEach(function (g) { paneProps.appendChild(g); });

    var plain = t.image || el.matches('.wb-divider, .wb-spacer, .wb-video, .wb-art, .wb-embed');
    if (!plain) paneProps.appendChild(textGroup(el));
    if (!el.matches('.wb-art')) {
      paneProps.appendChild(boxGroup(el));
      paneProps.appendChild(fxGroup(el));
    }
    paneProps.appendChild(advGroup(el, t));
    if (sameEl) paneProps.parentElement.scrollTop = keep;
  };

  /* ========================================================= pagina ====== */

  function partPlace(id) {
    var d = E.idoc, b = d.body;
    var header = b.querySelector('.site-header'), hero = b.querySelector('.hero');
    if (id === 'header') return function (n) { b.insertBefore(n, b.firstChild); };
    if (id === 'hero') return function (n) { if (header) header.after(n); else b.insertBefore(n, b.firstChild); };
    if (id === 'stats') return function (n) { var a = hero || header; if (a) a.after(n); else b.insertBefore(n, b.firstChild); };
    if (id === 'toc') {
      var wrap = b.querySelector('.article-wrapper');
      return wrap ? function (n) { wrap.insertBefore(n, wrap.firstChild); } : null;
    }
    return function (n) { b.appendChild(n); };
  }

  function swatch(label, value, on) {
    var inp = h('input', { type: 'color', class: 'color-in' });
    inp.value = WB.doc.toHex(value);
    inp.addEventListener('input', function () { on(inp.value); });
    return h('label', { class: 'swatch' }, [inp, h('span', { text: label })]);
  }

  P.renderPage = function () {
    panePage.textContent = '';
    if (!E.idoc) { panePage.appendChild(note('Abre o crea un artículo para empezar.')); return; }
    var s = WB.doc.s;
    var d = E.idoc;

    function vars() { E.applyVars(); WB.art.renderAll(d, true); E.changed(); }

    panePage.appendChild(group('El artículo', [
      fText('Título (pestaña del navegador y buscadores)', s.title, function (v) { s.title = v; chg(); WB.app.syncTitle(); }),
      fText('Descripción para buscadores', s.description, function (v) { s.description = v; chg(); }, { area: true, rows: 3 }),
      fText('Carpeta', s.path || '(sin guardar todavía)', function () {}, { readonly: true }),
      fSelect('Tema al abrir la página', [['light', 'Claro'], ['dark', 'Oscuro']], s.startTheme, function (v) { s.startTheme = v; chg(); })
    ], true));

    /* ---- colores ---- */
    var presets = [['', '(colores propios)']].concat(Object.keys(WB.PALETTES).map(function (id) { return [id, WB.PALETTES[id].name]; }));
    var all = h('div', { class: 'swatches' });
    ['light', 'dark'].forEach(function (mode) {
      all.appendChild(h('h5', { text: mode === 'light' ? 'Tema claro' : 'Tema oscuro' }));
      WB.PALETTE_KEYS.forEach(function (k) {
        all.appendChild(swatch(WB.PALETTE_LABELS[k], s.palette[mode][k], function (v) { s.palette[mode][k] = v; s.paletteId = ''; vars(); }));
      });
    });
    panePage.appendChild(group('Colores', [
      fSelect('Paleta', presets, s.paletteId, function (id) {
        if (!id) return;
        s.palette = JSON.parse(JSON.stringify(WB.PALETTES[id]));
        delete s.palette.name;
        s.paletteId = id;
        vars();
        E.commit('paleta: ' + WB.PALETTES[id].name);
        P.renderPage();
      }),
      h('div', { class: 'swatches' }, [
        swatch('Acento (claro)', s.palette.light.accent, function (v) { s.palette.light.accent = v; s.paletteId = ''; vars(); }),
        swatch('Acento (oscuro)', s.palette.dark.accent, function (v) { s.palette.dark.accent = v; s.paletteId = ''; vars(); }),
        swatch('Segundo color', s.palette.accent2, function (v) { s.palette.accent2 = v; vars(); })
      ]),
      group('Todos los colores', [all], false)
    ], true));

    /* ---- tipografia ---- */
    var fonts = WB.FONTS.map(function (f) { return [f.name, f.name]; });
    panePage.appendChild(group('Tipografía y formas', [
      fSelect('Fuente de los títulos', fonts, s.fontDisplay, function (v) { s.fontDisplay = v; vars(); }),
      fSelect('Fuente del texto', fonts, s.fontBody, function (v) { s.fontBody = v; vars(); }),
      fSelect('Esquinas', [['none', 'Rectas'], ['sm', 'Poco redondeadas'], ['md', 'Redondeadas'], ['lg', 'Muy redondeadas']], s.radius, function (v) { s.radius = v; vars(); })
    ], true));

    /* ---- idiomas ---- */
    var langKids = [note('Marca los idiomas del artículo. Se escribe cada uno eligiéndolo en la barra de arriba o en el selector de la propia página.')];
    Object.keys(WB.LANGS).forEach(function (code) {
      langKids.push(fCheck(WB.LANGS[code].name + (code === s.lang ? ' (idioma base)' : ''), s.langs.indexOf(code) > -1, function (on) {
        if (code === s.lang) { P.renderPage(); return; }
        if (on && s.langs.indexOf(code) < 0) s.langs.push(code);
        // sin cabecera no hay donde poner el selector de idiomas en la pagina
        if (on && !d.querySelector('.header-controls')) {
          var old = d.querySelector('.site-header');
          if (old) old.remove();
          partPlace('header')(E.make(WB.PARTS.header.html()));
          WB.ui.status('se ha añadido la cabecera: lleva el selector de idiomas');
        }
        if (!on) {
          if (s.editLang === code) WB.doc.setEditLang(d, s.lang);
          s.langs = s.langs.filter(function (l) { return l !== code; });
        }
        E.commit(on ? 'idioma añadido: ' + WB.LANGS[code].name : 'idioma quitado');
        WB.app.syncLangs();
        P.renderPage();
      }));
    });
    panePage.appendChild(group('Idiomas', langKids, false));

    /* ---- partes ---- */
    var partKids = [];
    Object.keys(WB.PARTS).forEach(function (id) {
      var part = WB.PARTS[id];
      if (!partPlace(id)) return;
      partKids.push(fCheck(part.name, !!d.querySelector(part.sel), function (on) {
        var cur = d.querySelector(part.sel);
        if (on && !cur) {
          var n = E.make(part.html());
          partPlace(id)(n);   // el sitio se decide ahora: las otras partes pueden haber cambiado
          E.commit(part.name + ' añadida');
          E.select(n, { scroll: true });
        } else if (!on && cur) {
          cur.remove();
          E.commit(part.name + ' quitada (Ctrl+Z la recupera)');
        }
        P.renderPage();
      }));
    });
    partKids.push(fCheck('Barra de progreso de lectura', s.progress, function (v) { s.progress = v; chg(); }));
    var tb = d.querySelector('.theme-btn');
    partKids.push(fCheck('Botón de tema claro / oscuro', !!tb, function (v) {
      var cur = d.querySelector('.theme-btn');
      var controls = d.querySelector('.header-controls');
      if (v && !cur && controls) controls.appendChild(E.make('<button type="button" class="theme-btn" id="themeToggle" aria-label="Cambiar tema claro u oscuro" title="Modo claro / oscuro"><svg id="themeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></button>'));
      if (!v && cur) cur.remove();
      E.commit();
    }));
    panePage.appendChild(group('Partes de la página', partKids, false));

    if (P.pageExtra) P.pageExtra(panePage);

    panePage.appendChild(group('CSS propio', [
      note('Reglas CSS que se añaden al final de la hoja de estilos del artículo.'),
      fText('CSS', s.customCss, function (v) { s.customCss = v; E.applyVars(); chg(); }, { area: true, rows: 8, placeholder: '.article-section h2 { text-transform: uppercase; }' })
    ], false));
  };

  /* ========================================================= esquema ===== */

  P.renderOutline = function () {
    paneOutline.textContent = '';
    if (!E.idoc) return;
    var d = E.idoc;
    var list = h('ul', { class: 'list outline' });

    function row(el, label, depth, ic) {
      var li = h('li', { class: depth ? 'is-sub' : '', onclick: function () { E.select(el, { scroll: true }); } }, [icon(ic), h('span', { text: label })]);
      list.appendChild(li);
    }

    d.body.querySelectorAll('.site-header, .hero, .stats-strip, .toc-sidebar, .article-section, .site-footer').forEach(function (el) {
      var t = WB.typeOf(el);
      if (el.matches('.article-section')) {
        var hd = el.querySelector('h2');
        row(el, hd ? hd.textContent.trim() || 'Sección sin título' : 'Sección', 0, 'ic-section');
        Array.prototype.forEach.call(el.children, function (c) {
          var ct = WB.typeOf(c);
          if (!ct || ct.kind === 'text') return;
          row(c, ct.name, 1, 'ic-chevron-right');
        });
      } else {
        row(el, t.name, 0, 'ic-layers');
      }
    });
    paneOutline.appendChild(note('Pulsa una entrada para ir a esa parte de la página.'));
    paneOutline.appendChild(list);
  };

  var outlineTimer = 0;
  P.renderOutlineSoon = function () {
    clearTimeout(outlineTimer);
    outlineTimer = setTimeout(P.renderOutline, 700);
  };

  P.renderAll = function () {
    P.renderProps();
    P.renderPage();
    P.renderOutline();
  };

  P.h = h;
  P.ui = { group: group, field: field, fRange: fRange, fColor: fColor, fSelect: fSelect, fText: fText, fCheck: fCheck, fBtns: fBtns, note: note };
  buildBlocks();
})();
