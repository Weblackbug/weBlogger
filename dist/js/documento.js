/* ==========================================================================
   weBlogger - el articulo: leer una carpeta, y volver a escribirla.

   Un articulo es una carpeta con index.html, css/estilos.css, js/app.js e
   imagenes/. No hay archivo de proyecto aparte: todo lo que el editor necesita
   para reabrirlo (paleta, fuentes, idiomas) se lee de esos mismos archivos,
   asi que la carpeta es siempre una web completa y nada mas.
   ========================================================================== */
(function () {
  'use strict';

  var D = WB.doc = {};
  var CUSTOM_A = '/* WB:CUSTOM */';
  var CUSTOM_B = '/* WB:FIN-CUSTOM */';
  var I18N_END = '/* WB:FIN-I18N */';
  var RADIUS = { none: [0, 0, 0], sm: [4, 8, 12], md: [8, 14, 22], lg: [14, 22, 32] };
  D.RADIUS = RADIUS;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  D.blank = function () {
    return {
      path: null,            // carpeta del articulo
      title: '', description: '',
      lang: 'es',            // idioma base: el que lleva escrito el HTML
      editLang: 'es',        // idioma que se esta viendo en el editor
      langs: ['es'],
      startTheme: 'light',
      key: 'articulo',
      paletteId: 'terracota',
      palette: clone(WB.PALETTES.terracota),
      fontDisplay: 'Cormorant Garamond',
      fontBody: 'Plus Jakarta Sans',
      radius: 'md',
      progress: true,
      customCss: '',
      format: '',            // formato de diario (js/formatos): añade su hoja de estilos
      style: '',             // ficha del motor de estilos (js/estilos.js)
      tokens: {},            // sus parametros: van como atributos data-st-* en <html>
      fontUi: '',            // fuente de etiquetas, pies y firmas
      fontCab: '',           // fuente propia de la cabecera
      pageName: '',          // nombre de la pagina dentro de la publicacion
      estado: '',            // flujo de redaccion: borrador | correccion | cerrada
      responsable: '',
      cierre: '',            // hora de cierre (aaaa-mm-ddThh:mm)
      i18n: {}
    };
  };

  D.s = D.blank();
  D.assets = new Map();      // url blob -> { rel, blob, savedIn }

  /* ============================================================ colores == */

  function rgb(color) {
    var c = String(color || '').trim();
    var m = /^#([0-9a-f]{3})$/i.exec(c);
    if (m) return m[1].split('').map(function (x) { return parseInt(x + x, 16); });
    m = /^#([0-9a-f]{6})/i.exec(c);
    if (m) return [0, 2, 4].map(function (i) { return parseInt(m[1].substr(i, 2), 16); });
    m = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(c);
    if (m) return [+m[1], +m[2], +m[3]];
    return null;
  }

  function rgba(color, a) {
    var c = rgb(color) || [0, 0, 0];
    return 'rgba(' + c[0] + ', ' + c[1] + ', ' + c[2] + ', ' + a + ')';
  }

  /** Color de texto que se lee encima de un color: blanco, u oscuro si es claro. */
  function onColor(color) {
    var c = (rgb(color) || [0, 0, 0]).map(function (n) {
      n /= 255;
      return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 0.5 ? '#101113' : '#ffffff';
  }

  /** Cualquier color CSS simple -> #rrggbb, para los <input type="color">. */
  D.toHex = function (color, fallback) {
    var c = rgb(color);
    if (!c) return fallback || '#000000';
    return '#' + c.map(function (n) { return ('0' + Math.max(0, Math.min(255, n)).toString(16)).slice(-2); }).join('');
  };

  /* ================================================================ CSS == */

  function block(sel, p, extra) {
    var names = {
      bgPrimary: 'bg-primary', bgSecondary: 'bg-secondary', bgCard: 'bg-card',
      textPrimary: 'text-primary', textSecondary: 'text-secondary', textMuted: 'text-muted',
      accent: 'accent', accentHover: 'accent-hover', border: 'border'
    };
    var out = sel + ' {\n';
    WB.PALETTE_KEYS.forEach(function (k) { out += '  --' + names[k] + ': ' + p[k] + ';\n'; });
    extra.forEach(function (l) { out += '  ' + l + '\n'; });
    return out + '}\n';
  }

  D.varsCss = function () {
    var s = D.s, L = s.palette.light, K = s.palette.dark;
    var r = RADIUS[s.radius] || RADIUS.md;
    return block(':root', L, [
      '--accent-soft: ' + rgba(L.accent, 0.11) + ';',
      '--accent-glow: ' + rgba(L.accent, 0.3) + ';',
      '--accent-2: ' + s.palette.accent2 + ';',
      '--shadow-sm: 0 4px 14px ' + rgba(L.textPrimary, 0.05) + ';',
      '--shadow-md: 0 12px 30px ' + rgba(L.textPrimary, 0.09) + ';',
      '--shadow-lg: 0 22px 48px ' + rgba(L.textPrimary, 0.14) + ';',
      '--header-bg: ' + rgba(L.bgPrimary, 0.88) + ';',
      '--on-accent: ' + onColor(L.accent) + ';',
      '--radius-sm: ' + r[0] + 'px;',
      '--radius-md: ' + r[1] + 'px;',
      '--radius-lg: ' + r[2] + 'px;',
      '--transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);',
      '--font-display: ' + WB.fontStack(s.fontDisplay) + ';',
      '--font-body: ' + WB.fontStack(s.fontBody) + ';'
    ].concat(
      s.fontUi ? ['--font-ui: ' + WB.fontStack(s.fontUi) + ';'] : [],
      s.fontCab ? ['--font-cab: ' + WB.fontStack(s.fontCab) + ';'] : []
    )) + '\n' + block('[data-theme="dark"]', K, [
      '--accent-soft: ' + rgba(K.accent, 0.14) + ';',
      '--accent-glow: ' + rgba(K.accent, 0.3) + ';',
      '--shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.25);',
      '--shadow-md: 0 12px 30px rgba(0, 0, 0, 0.38);',
      '--shadow-lg: 0 22px 48px rgba(0, 0, 0, 0.5);',
      '--header-bg: ' + rgba(K.bgPrimary, 0.88) + ';',
      '--on-accent: ' + onColor(K.accent) + ';'
    ]);
  };

  D.buildCss = function () {
    return '/* Hoja de estilos generada por weBlogger. Los colores y las fuentes\n' +
      '   estan en las variables de aqui arriba; el editor las vuelve a leer. */\n' +
      D.varsCss() + '\n' + WB.tpl.css + '\n' + D.formatCss() +
      CUSTOM_A + '\n' + (D.s.customCss || '') + '\n' + CUSTOM_B + '\n';
  };

  /** Hoja del formato de diario del articulo, si lleva uno. */
  D.formatCss = function () {
    var css = D.s.format && WB.tpl.formats ? WB.tpl.formats[D.s.format] : '';
    return css ? '\n/* Formato de diario: ' + D.s.format + ' */\n' + css + '\n' : '';
  };

  function varsOf(css, re) {
    var m = re.exec(css);
    var out = {};
    if (!m) return out;
    m[1].replace(/--([\w-]+)\s*:\s*([^;]+);/g, function (_, k, v) { out[k] = v.trim(); return ''; });
    return out;
  }

  function parseCss(css, s) {
    if (!css) return;
    var L = varsOf(css, /:root\s*\{([^}]*)\}/);
    var K = varsOf(css, /\[data-theme=["']dark["']\]\s*\{([^}]*)\}/);
    var names = {
      'bg-primary': 'bgPrimary', 'bg-secondary': 'bgSecondary', 'bg-card': 'bgCard',
      'text-primary': 'textPrimary', 'text-secondary': 'textSecondary', 'text-muted': 'textMuted',
      'accent': 'accent', 'accent-hover': 'accentHover', 'border': 'border'
    };
    Object.keys(names).forEach(function (n) {
      if (L[n]) s.palette.light[names[n]] = D.toHex(L[n], s.palette.light[names[n]]);
      if (K[n]) s.palette.dark[names[n]] = D.toHex(K[n], s.palette.dark[names[n]]);
    });

    var a2 = L['accent-2'];
    if (!a2) {
      var g = /\.reading-progress\s*\{[^}]*linear-gradient\([^,]+,\s*var\(--accent\)\s*,\s*(#[0-9a-f]{3,8})/i.exec(css);
      if (g) a2 = g[1];
    }
    if (a2) s.palette.accent2 = D.toHex(a2, s.palette.accent2);

    var fd = /'([^']+)'/.exec(L['font-display'] || '');
    var fb = /'([^']+)'/.exec(L['font-body'] || '');
    if (fd) s.fontDisplay = fd[1];
    if (fb) s.fontBody = fb[1];
    var fu = /'([^']+)'/.exec(L['font-ui'] || '');
    var fc = /'([^']+)'/.exec(L['font-cab'] || '');
    if (fu) s.fontUi = fu[1];
    if (fc) s.fontCab = fc[1];

    var md = parseInt(L['radius-md'], 10);
    Object.keys(RADIUS).forEach(function (k) { if (RADIUS[k][1] === md) s.radius = k; });

    s.paletteId = '';
    Object.keys(WB.PALETTES).forEach(function (id) {
      var p = WB.PALETTES[id];
      if (p.light.accent === s.palette.light.accent && p.light.bgPrimary === s.palette.light.bgPrimary) s.paletteId = id;
    });

    var a = css.indexOf(CUSTOM_A), b = css.indexOf(CUSTOM_B);
    if (a > -1 && b > a) s.customCss = css.slice(a + CUSTOM_A.length, b).trim();
  }

  /* ========================================================== idiomas ==== */

  /** Lee un objeto literal de JavaScript (claves sin comillas, comentarios,
      comas finales) sin ejecutar nada: el diccionario de los articulos hechos
      a mano no es JSON. */
  function parseLiteral(src, start) {
    var pos = start;

    function ws() {
      while (pos < src.length) {
        var c = src[pos];
        if (/\s/.test(c)) pos++;
        else if (c === '/' && src[pos + 1] === '/') { while (pos < src.length && src[pos] !== '\n') pos++; }
        else if (c === '/' && src[pos + 1] === '*') { var e = src.indexOf('*/', pos); pos = e < 0 ? src.length : e + 2; }
        else break;
      }
    }

    function str() {
      var q = src[pos++], out = '';
      while (pos < src.length && src[pos] !== q) {
        var c = src[pos++];
        if (c !== '\\') { out += c; continue; }
        var n = src[pos++];
        if (n === 'n') out += '\n';
        else if (n === 't') out += '\t';
        else if (n === 'u') { out += String.fromCharCode(parseInt(src.substr(pos, 4), 16)); pos += 4; }
        else out += n;
      }
      pos++;
      return out;
    }

    function val() {
      ws();
      var c = src[pos];
      if (c === '{') return obj();
      if (c === '"' || c === "'" || c === '`') return str();
      var s = '';
      while (pos < src.length && src[pos] !== ',' && src[pos] !== '}') s += src[pos++];
      return s.trim();
    }

    function obj() {
      var o = {};
      pos++;
      for (;;) {
        ws();
        if (pos >= src.length) throw new Error('diccionario de idiomas sin cerrar');
        if (src[pos] === '}') { pos++; return o; }
        var k = '';
        if (src[pos] === '"' || src[pos] === "'") k = str();
        else while (pos < src.length && /[\w$-]/.test(src[pos])) k += src[pos++];
        ws();
        if (src[pos] !== ':') throw new Error('diccionario de idiomas mal formado');
        pos++;
        o[k] = val();
        ws();
        if (src[pos] === ',') pos++;
      }
    }

    return obj();
  }

  function parseJs(js) {
    if (!js) return { dict: {}, legacy: false };
    var end = js.indexOf(I18N_END);
    var m = /window\.WB_I18N\s*=\s*/.exec(js);
    if (m && end > m.index) {
      try {
        return { dict: JSON.parse(js.slice(m.index + m[0].length, end).replace(/;\s*$/, '')), legacy: false };
      } catch (e) {}
    }
    var t = /\btranslations\s*=\s*\{/.exec(js);
    if (t) {
      try { return { dict: parseLiteral(js, t.index + t[0].length - 1), legacy: true }; } catch (e2) {}
    }
    return { dict: {}, legacy: false };
  }

  function texts(doc) {
    return doc.querySelectorAll('[data-i18n]');
  }

  /** Cada texto editable necesita una clave propia para poder traducirse. */
  D.ensureKeys = function (doc) {
    var seen = Object.create(null);
    doc.body.querySelectorAll('[contenteditable="true"]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k && !seen[k]) { seen[k] = true; return; }
      var nk = 't' + WB.uid() + WB.uid();
      if (k) {
        // clave repetida (bloque duplicado): la copia hereda las traducciones
        Object.keys(D.s.i18n).forEach(function (l) {
          if (D.s.i18n[l][k] !== undefined) D.s.i18n[l][nk] = D.s.i18n[l][k];
        });
      }
      el.setAttribute('data-i18n', nk);
      seen[nk] = true;
    });
  };

  /** Guarda en el diccionario lo que hay escrito ahora mismo en la pagina. */
  D.capture = function (doc) {
    var s = D.s;
    if (s.langs.length < 2) return;
    D.ensureKeys(doc);
    var d = s.i18n[s.editLang] = {};
    // En un idioma que no es el base, lo que sigue igual que el base esta sin
    // traducir: no se guarda, para que no quede congelado como traduccion.
    var base = s.editLang === s.lang ? null : (s.i18n[s.lang] || {});
    texts(doc).forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (base && base[k] === el.innerHTML) return;
      d[k] = el.innerHTML;
    });
  };

  D.setEditLang = function (doc, lang) {
    var s = D.s;
    D.capture(doc);
    s.editLang = lang;
    var d = s.i18n[lang] || {};
    var base = s.i18n[s.lang] || {};
    // lo que no tiene traduccion se ve en el idioma base, nunca en el anterior
    texts(doc).forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var v = d[k];
      if (v === undefined || v === null) v = base[k];
      if (v !== undefined && v !== null) el.innerHTML = v;
    });
    doc.documentElement.lang = lang;
    D.syncLangButtons(doc);
  };

  /** El selector de idiomas de la cabecera refleja la lista de idiomas. */
  D.syncLangButtons = function (doc) {
    var s = D.s;
    var controls = doc.querySelector('.header-controls');
    var sw = doc.querySelector('.lang-switcher');
    if (!sw && controls && s.langs.length > 1) {
      sw = doc.createElement('div');
      sw.className = 'lang-switcher';
      sw.setAttribute('role', 'group');
      sw.setAttribute('aria-label', 'Selector de idioma');
      controls.insertBefore(sw, controls.firstChild);
    }
    if (!sw) return;
    var have = Array.prototype.map.call(sw.querySelectorAll('.lang-btn'), function (b) { return b.getAttribute('data-lang'); });
    var want = s.langs.length > 1 ? s.langs : [];
    if (have.join() !== want.join()) {
      sw.innerHTML = want.map(function (l) { return WB.langButton(l, false); }).join('');
    }
    sw.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === s.editLang);
    });
    sw.hidden = !want.length;
  };

  /* ========================================================== imagenes ==== */

  var MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif', mp4: 'video/mp4', webm: 'video/webm' };

  function isRelative(u) {
    return !!u && !/^(https?:|data:|blob:|#|\/\/|mailto:|tel:)/i.test(u);
  }

  function blobToB64(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { reject(new Error('no se pudo leer la imagen')); };
      r.readAsDataURL(blob);
    });
  }

  function b64ToBlob(b64, type) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: type });
  }

  function relTaken(rel) {
    var hit = false;
    D.assets.forEach(function (a) { if (a.rel.toLowerCase() === rel.toLowerCase()) hit = true; });
    return hit;
  }

  /** Registra una imagen nueva. Devuelve la URL con la que se ve en el editor;
      al guardar se convierte en `imagenes/nombre.ext`. */
  D.addAsset = function (blob, filename) {
    var name = String(filename || 'imagen').toLowerCase().replace(/\.[^.]+$/, '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'imagen';
    var ext = (/\.([a-z0-9]+)$/i.exec(filename || '') || [])[1];
    if (!ext) ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
    var rel = 'imagenes/' + name + '.' + ext.toLowerCase();
    for (var n = 2; relTaken(rel); n++) rel = 'imagenes/' + name + '-' + n + '.' + ext.toLowerCase();
    var url = URL.createObjectURL(blob);
    D.assets.set(url, { rel: rel, blob: blob, savedIn: null });
    return url;
  };

  var SRC_ATTRS = ['src', 'data-lightbox-src', 'poster'];

  /** Las imagenes guardadas en la carpeta se cargan como blobs para verlas. */
  D.loadLocalImages = function (root, folder) {
    var byRel = {};
    var jobs = [];
    SRC_ATTRS.forEach(function (attr) {
      root.querySelectorAll('[' + attr + ']').forEach(function (el) {
        var rel = el.getAttribute(attr);
        if (!isRelative(rel)) return;
        if (!byRel[rel]) {
          byRel[rel] = WB.invoke('read_b64', { path: WB.join(folder, rel) }).then(function (b64) {
            var ext = (/\.([a-z0-9]+)$/i.exec(rel) || [])[1] || '';
            var blob = b64ToBlob(b64, MIME[ext.toLowerCase()] || 'application/octet-stream');
            var url = URL.createObjectURL(blob);
            D.assets.set(url, { rel: rel.replace(/\\/g, '/'), blob: blob, savedIn: folder });
            return url;
          }).catch(function () { return null; });
        }
        jobs.push(byRel[rel].then(function (url) { if (url) el.setAttribute(attr, url); }));
      });
    });
    return Promise.all(jobs);
  };

  D.clearAssets = function () {
    D.assets.forEach(function (_, url) { URL.revokeObjectURL(url); });
    D.assets = new Map();
  };

  /* ============================================================= leer ===== */

  D.parse = function (html, css, js, name) {
    var s = D.blank();
    var dom = new DOMParser().parseFromString(html, 'text/html');
    var root = dom.documentElement;

    s.title = dom.title || '';
    var md = dom.querySelector('meta[name="description"]');
    s.description = md ? md.getAttribute('content') || '' : '';
    s.lang = s.editLang = root.getAttribute('lang') || 'es';
    s.startTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    s.key = root.getAttribute('data-wb-key') || name || 'articulo';
    s.format = root.getAttribute('data-wb-format') || '';
    s.pageName = root.getAttribute('data-wb-page') || '';
    s.estado = root.getAttribute('data-wb-estado') || '';
    s.responsable = root.getAttribute('data-wb-responsable') || '';
    s.cierre = root.getAttribute('data-wb-cierre') || '';
    s.progress = !!dom.querySelector('.reading-progress') || !dom.querySelector('.article-wrapper');

    // los scripts de un bloque de HTML incrustado son contenido del usuario
    dom.querySelectorAll('script, .lightbox, .reading-progress, .wb-pager').forEach(function (n) {
      if (n.tagName === 'SCRIPT' && n.closest('.wb-embed')) return;
      n.remove();
    });

    s.langs = Array.prototype.map.call(dom.querySelectorAll('.lang-btn'), function (b) { return b.getAttribute('data-lang'); })
      .filter(function (l, i, a) { return l && a.indexOf(l) === i; });
    if (s.langs.indexOf(s.lang) < 0) s.langs.unshift(s.lang);

    var parsed = parseJs(js);
    Object.keys(parsed.dict).forEach(function (l) {
      if (l === s.lang || typeof parsed.dict[l] !== 'object') return;   // el idioma base ya esta en el HTML
      var d = s.i18n[l] = {};
      Object.keys(parsed.dict[l]).forEach(function (k) {
        var v = parsed.dict[l][k];
        d[k] = parsed.legacy ? WB.esc(v).replace(/&quot;/g, '"') : v;
      });
      if (s.langs.indexOf(l) < 0) s.langs.push(l);
    });

    parseCss(css, s);
    if (WB.styles) WB.styles.read(root, s);
    return { s: s, body: dom.body.innerHTML };
  };

  /* ========================================================== escribir ==== */

  var LIGHTBOX = '  <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Imagen ampliada">\n' +
    '    <div class="lightbox-inner">\n' +
    '      <button type="button" class="lightbox-close" id="lightboxClose" aria-label="Cerrar">&times;</button>\n' +
    '      <img id="lightboxImg" src="" alt="" />\n' +
    '      <p class="lightbox-caption" id="lightboxCaption"></p>\n' +
    '    </div>\n' +
    '  </div>\n';

  /** Copia del cuerpo de la pagina sin nada del editor y en el idioma base. */
  function cleanBody(doc, keepBlobs) {
    var s = D.s;
    D.capture(doc);
    var body = doc.body.cloneNode(true);

    if (s.editLang !== s.lang) {
      var base = s.i18n[s.lang] || {};
      texts(body).forEach(function (el) {
        var v = base[el.getAttribute('data-i18n')];
        if (v !== undefined && v !== null) el.innerHTML = v;
      });
    }
    // el indice automatico se numera segun el orden de ahora, no el que tenia
    // cuando se capturo el idioma base
    body.querySelectorAll('.toc-list[data-wb-auto] a').forEach(function (a, i) {
      var id = (a.getAttribute('href') || '').slice(1);
      var sec = id ? body.querySelector('[id="' + id.replace(/"/g, '') + '"]') : null;
      var h2 = sec ? sec.querySelector('h2') : null;
      a.textContent = (i + 1) + '. ' + (h2 && h2.textContent.trim() ? h2.textContent.trim() : 'Sección ' + (i + 1));
    });
    if (s.langs.length < 2) {
      body.querySelectorAll('.lang-switcher').forEach(function (n) { n.remove(); });
    } else {
      body.querySelectorAll('.lang-btn').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-lang') === s.lang);
      });
    }

    body.querySelectorAll('[contenteditable], [spellcheck]').forEach(function (el) {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    });
    body.querySelectorAll('.wb-edit-open').forEach(function (el) { el.classList.remove('wb-edit-open'); });
    body.querySelectorAll('.reveal.visible').forEach(function (el) { el.classList.remove('visible'); });
    body.querySelectorAll('[hidden].lang-switcher').forEach(function (el) { el.removeAttribute('hidden'); });
    body.querySelectorAll('[class=""]').forEach(function (el) { el.removeAttribute('class'); });
    body.querySelectorAll('[style=""]').forEach(function (el) { el.removeAttribute('style'); });

    // en la vista previa las imagenes siguen siendo las del editor
    if (!keepBlobs) SRC_ATTRS.forEach(function (attr) {
      body.querySelectorAll('[' + attr + ']').forEach(function (el) {
        var a = D.assets.get(el.getAttribute(attr));
        if (a) el.setAttribute(attr, a.rel);
      });
    });
    return body;
  }

  function usedFonts(html) {
    var s = D.s;
    var names = [s.fontDisplay, s.fontBody, s.fontUi, s.fontCab, s.tokens && s.tokens.cab === 'gotica' ? 'UnifrakturMaguntia' : '']
      .filter(function (n, i, a) { return n && a.indexOf(n) === i; });
    html += D.formatCss() + (s.customCss || '');   // las hojas tambien pueden pedir fuentes
    // Solo cuenta el nombre usado como fuente (en un estilo o en un texto
    // artistico): «Inter» o «Anton» aparecen tambien dentro de palabras.
    WB.FONTS.forEach(function (f) {
      if (names.indexOf(f.name) > -1) return;
      var n = f.name.replace(/ /g, '\\s');
      var re = new RegExp('(font-family:\\s*(?:&quot;|["\'])?|&quot;font&quot;:&quot;)' + n + '(?![\\w ])');
      if (re.test(html)) names.push(f.name);
    });
    if (html.indexOf('wb-masthead-name') > -1 && names.indexOf('UnifrakturMaguntia') < 0) names.push('UnifrakturMaguntia');
    return names;
  }
  D.usedFonts = usedFonts;

  /**
   * index.html completo.
   * `inline` mete el CSS dentro de la pagina y deja fuera el script: es lo que
   * usa la vista previa, que carga el JavaScript por su cuenta.
   */
  D.cleanBody = cleanBody;
  D.LIGHTBOX = LIGHTBOX;
  D.blobToB64 = blobToB64;

  /**
   * `o` (opcional): nombres de los archivos de esta pagina y el paginador,
   * para las publicaciones de varias paginas.
   *   { css: 'css/pagina-2.css', js: 'js/pagina-2.js', pager: '<nav ...>' }
   */
  D.buildHtml = function (doc, inline, o) {
    o = o || {};
    var s = D.s;
    var body = cleanBody(doc, inline).innerHTML.trim();
    var fonts = WB.fontsUrl(usedFonts(body));
    var e = WB.esc;

    return '<!DOCTYPE html>\n' +
      '<html lang="' + e(s.lang) + '" data-theme="' + s.startTheme + '" data-wb-key="' + e(s.key) + '"' + (s.format ? ' data-wb-format="' + e(s.format) + '"' : '') + (s.pageName ? ' data-wb-page="' + e(s.pageName) + '"' : '') +
        (s.estado ? ' data-wb-estado="' + e(s.estado) + '"' : '') + (s.responsable ? ' data-wb-responsable="' + e(s.responsable) + '"' : '') + (s.cierre ? ' data-wb-cierre="' + e(s.cierre) + '"' : '') + (WB.styles ? WB.styles.attrString(s) : '') + '>\n' +
      '<head>\n' +
      '  <meta charset="UTF-8" />\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
      '  <meta name="description" content="' + e(s.description) + '" />\n' +
      '  <meta name="generator" content="weBlogger" />\n' +
      '  <title>' + e(s.title) + '</title>\n' +
      (fonts
        ? '  <link rel="preconnect" href="https://fonts.googleapis.com" />\n' +
          '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n' +
          '  <link href="' + e(fonts) + '" rel="stylesheet" />\n'
        : '') +
      (inline ? '  <style>\n' + D.buildCss() + '\n  </style>\n' : '  <link rel="stylesheet" href="' + (o.css || 'css/estilos.css') + '" />\n') +
      '</head>\n' +
      '<body>\n\n' +
      (s.progress ? '  <div class="reading-progress" id="readingProgress"></div>\n\n' : '') +
      '  ' + body + '\n\n' +
      (o.pager ? '  ' + o.pager + '\n\n' : '') +
      LIGHTBOX + '\n' +
      (inline ? '' : '  <script src="' + (o.js || 'js/app.js') + '"></script>\n') +
      '</body>\n</html>\n';
  };

  /** Diccionario de los idiomas que no son el base. */
  D.exportI18n = function (doc) {
    var s = D.s;
    D.capture(doc);
    var out = {};
    if (s.langs.length < 2) return out;
    s.langs.forEach(function (l) {
      if (l !== s.lang) out[l] = Object.assign({}, s.i18n[l] || {});
    });

    // El indice automatico se escribe solo en cada idioma a partir del titulo
    // traducido de su seccion.
    doc.querySelectorAll('.toc-list[data-wb-auto] a[data-i18n]').forEach(function (a, i) {
      var sec = doc.getElementById((a.getAttribute('href') || '').slice(1));
      var h = sec ? sec.querySelector('h2') : null;
      var hk = h ? h.getAttribute('data-i18n') : null;
      Object.keys(out).forEach(function (l) {
        var t = hk && s.i18n[l] ? s.i18n[l][hk] : null;
        if (t) out[l][a.getAttribute('data-i18n')] = (i + 1) + '. ' + t.replace(/<[^>]+>/g, '');
        else delete out[l][a.getAttribute('data-i18n')];
      });
    });
    return out;
  };

  D.buildJs = function (doc) {
    return '/* Textos por idioma. Lo escribe weBlogger: el idioma base esta en index.html. */\n' +
      'window.WB_I18N = ' + JSON.stringify(D.exportI18n(doc), null, 2) + '; ' + I18N_END + '\n\n' + WB.tpl.js;
  };

  /** creditos-imagenes.txt, como en los articulos de ejemplo. */
  D.credits = function (doc) {
    var seen = Object.create(null);
    var n = 0;
    var out = 'CRÉDITOS DE LAS IMÁGENES\n' + new Array(81).join('=') + '\n' +
      'Imágenes usadas en index.html, con su pie y la licencia o autoría anotada en la página.\n';
    doc.querySelectorAll('img').forEach(function (img) {
      var src = img.getAttribute('src') || '';
      if (!src || src.indexOf('data:') === 0) return;
      var a = D.assets.get(src);
      var where = a ? a.rel : src;
      var wiki = /commons\.wikimedia\.org\/wiki\/Special:FilePath\/([^?]+)/.exec(where);
      if (wiki) where = 'https://commons.wikimedia.org/wiki/File:' + wiki[1];
      if (seen[where]) return;
      seen[where] = true;
      var box = img.closest('figure, .gallery-item');
      var cap = box ? box.querySelector('figcaption span:not(.license-tag), .gallery-item-caption') : null;
      var lic = box ? box.querySelector('.license-tag') : null;
      var label = (cap ? cap.textContent : img.getAttribute('alt') || 'Imagen').trim();
      out += '\n' + (++n) + '. ' + label + (lic ? ' (' + lic.textContent.trim() + ')' : '') + ':\n   ' + where + '\n';
    });
    return n ? out : '';
  };

  /** Escribe la carpeta entera. */
  D.save = function (doc, folder) {
    var html = D.buildHtml(doc, false);
    var jobs = [
      WB.invoke('write_text', { path: WB.join(folder, 'index.html'), text: html }),
      WB.invoke('write_text', { path: WB.join(folder, 'css', 'estilos.css'), text: D.buildCss() }),
      WB.invoke('write_text', { path: WB.join(folder, 'js', 'app.js'), text: D.buildJs(doc) })
    ];
    var credits = D.credits(doc);
    if (credits) jobs.push(WB.invoke('write_text', { path: WB.join(folder, 'imagenes', 'creditos-imagenes.txt'), text: credits }));

    D.assets.forEach(function (a) {
      if (a.savedIn === folder || html.indexOf('"' + a.rel + '"') < 0) return;
      jobs.push(blobToB64(a.blob).then(function (b64) {
        return WB.invoke('write_b64', { path: WB.join(folder, a.rel), data: b64 });
      }).then(function () { a.savedIn = folder; }));
    });
    return Promise.all(jobs).then(function () { D.s.path = folder; });
  };

  /** Nombre de carpeta a partir de un titulo. */
  D.slug = function (text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'articulo';
  };
})();
