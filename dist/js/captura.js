/* ==========================================================================
   weBlogger - capturar el estilo de una pagina.

   1. Descarga el HTML del enlace, sus hojas CSS (y los @import) y sus
      scripts (desde Rust: js fetch_url).
   2. Maqueta la pagina en un marco aislado, con todo su CSS pero SIN
      ejecutar su JavaScript, y mide lo que se ve de verdad: colores mas
      usados, color de acento (enlaces y botones), fuentes y tamaños de
      titulares y texto, pesos, mayusculas, esquinas, sombras, ancho de la
      columna, cabecera, tipo de portada, barra lateral, galerias, citas,
      tablas, formularios de suscripcion, videos...
   3. Lee los scripts para saber que librerias usa (sliders, animaciones,
      lightbox...) y propone su equivalente en weBlogger.
   4. Con todo eso compone un blog muy parecido: misma paleta (y su version
      oscura), fuentes equivalentes, mismo tipo de portada y estructura, y
      unas reglas CSS propias que imitan los rasgos medidos.

   No copia textos, imagenes, logotipos ni el codigo de la web: su JavaScript
   no funcionaria fuera de ella y es suyo. Se toma el estilo, no el contenido.
   ========================================================================== */
(function () {
  'use strict';

  var A = WB.app, P = WB.panels, h = P.h, K = WB.tplKit;
  var C = WB.capture = {};
  var FILE = 'plantillas-capturadas.json';
  var W = 1280;               // ancho al que se maqueta el original

  /* ============================================================ color == */

  function parse(c) {
    var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?/i.exec(c || '');
    if (m) {
      var a = m[4] === undefined ? 1 : /%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
      return { r: +m[1], g: +m[2], b: +m[3], a: a };
    }
    m = /^#([0-9a-f]{3,8})$/i.exec(String(c || '').trim());
    if (m) {
      var x = m[1];
      if (x.length <= 4) x = x.split('').map(function (k) { return k + k; }).join('');
      return { r: parseInt(x.substr(0, 2), 16), g: parseInt(x.substr(2, 2), 16), b: parseInt(x.substr(4, 2), 16), a: x.length > 6 ? parseInt(x.substr(6, 2), 16) / 255 : 1 };
    }
    return null;
  }
  function hex(c) { return '#' + [c.r, c.g, c.b].map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
  function lum(c) {
    var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function hsl(c) {
    var r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = 0, hh = 0, d = mx - mn;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      hh *= 60;
    }
    return { h: hh, s: s, l: l };
  }
  function mix(a, b, t) { return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t, a: 1 }; }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  var WHITE = { r: 255, g: 255, b: 255, a: 1 }, BLACK = { r: 0, g: 0, b: 0, a: 1 };

  /* ===================================================== fuentes ====== */

  // nombre de la web -> equivalente del catalogo de weBlogger
  var FONT_MAP = {
    'georgia': 'Merriweather', 'times': 'Libre Baskerville', 'times new roman': 'Libre Baskerville', 'garamond': 'EB Garamond',
    'helvetica': 'Inter', 'helvetica neue': 'Inter', 'arial': 'Inter', 'segoe ui': 'Inter', 'system-ui': 'Inter', '-apple-system': 'Inter',
    'blinkmacsystemfont': 'Inter', 'sf pro text': 'Inter', 'sf pro display': 'Inter', 'verdana': 'Open Sans', 'tahoma': 'Open Sans',
    'lato': 'Open Sans', 'source sans pro': 'Inter', 'source sans 3': 'Inter', 'nunito': 'Poppins', 'nunito sans': 'Open Sans',
    'work sans': 'Inter', 'dm sans': 'Plus Jakarta Sans', 'manrope': 'Plus Jakarta Sans', 'outfit': 'Poppins', 'ibm plex sans': 'Inter',
    'noto sans': 'Open Sans', 'pt sans': 'Open Sans', 'fira sans': 'Roboto', 'ubuntu': 'Roboto', 'rubik': 'Poppins', 'karla': 'Inter',
    'mulish': 'Open Sans', 'barlow': 'Roboto', 'barlow condensed': 'Oswald', 'archivo': 'Inter', 'archivo narrow': 'Oswald',
    'noto serif': 'Source Serif 4', 'pt serif': 'Merriweather', 'crimson text': 'EB Garamond', 'crimson pro': 'EB Garamond',
    'libre caslon text': 'Libre Baskerville', 'spectral': 'Source Serif 4', 'literata': 'Source Serif 4', 'newsreader': 'Source Serif 4',
    'fraunces': 'DM Serif Display', 'dm serif text': 'DM Serif Display', 'cormorant': 'Cormorant Garamond', 'bitter': 'Roboto Slab',
    'zilla slab': 'Roboto Slab', 'arvo': 'Roboto Slab', 'josefin sans': 'Raleway', 'quicksand': 'Poppins', 'oswald': 'Oswald',
    'league gothic': 'Oswald', 'fjalla one': 'Oswald', 'teko': 'Oswald', 'ibm plex mono': 'JetBrains Mono', 'fira code': 'JetBrains Mono',
    'courier new': 'JetBrains Mono', 'courier': 'JetBrains Mono', 'menlo': 'JetBrains Mono', 'consolas': 'JetBrains Mono',
    'satisfy': 'Dancing Script', 'great vibes': 'Dancing Script', 'shadows into light': 'Caveat', 'indie flower': 'Caveat'
  };

  function families(stack) {
    return String(stack || '').split(',').map(function (f) { return f.trim().replace(/^["']|["']$/g, ''); }).filter(Boolean);
  }

  /** De la pila de fuentes de la web, la mas parecida que tiene weBlogger. */
  function mapFont(stack, role, weight) {
    var list = families(stack), have = {};
    WB.FONTS.forEach(function (f) { have[f.name.toLowerCase()] = f.name; });
    for (var i = 0; i < list.length; i++) {
      var k = list[i].toLowerCase();
      if (have[k]) return { orig: list[0], use: have[k], exact: i === 0 };
      if (FONT_MAP[k]) return { orig: list[0], use: FONT_MAP[k], exact: false };
      var base = k.replace(/\s+(display|text|pro|variable|vf|web|regular)$/, '');
      if (have[base]) return { orig: list[0], use: have[base], exact: false };
      if (FONT_MAP[base]) return { orig: list[0], use: FONT_MAP[base], exact: false };
    }
    var all = list.join(' ').toLowerCase();
    var use = /mono|code|courier/.test(all) ? 'JetBrains Mono'
      : /condensed|narrow|compressed/.test(all) ? 'Oswald'
      : /(^|[^-])serif/.test(all) && !/sans/.test(all) ? (role === 'display' ? 'Playfair Display' : 'Source Serif 4')
      : role === 'display' && weight >= 800 ? 'Archivo Black'
      : role === 'display' ? 'Poppins' : 'Inter';
    return { orig: list[0] || '(del sistema)', use: use, exact: false };
  }

  /* ===================================================== descargar ==== */

  function fetchText(url, kb) {
    if (!WB.isDesktop) return Promise.reject(new Error('capturar el estilo de una web solo funciona en la aplicación de escritorio'));
    return WB.invoke('fetch_url', { url: url, maxKb: kb || 2048 });
  }

  function abs(u, base) { try { return new URL(u, base).href; } catch (e) { return ''; } }

  /** url(...) relativas -> absolutas, para que fondos e imagenes se vean. */
  function absolutize(css, base) {
    return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, function (m, q, u) {
      if (/^(data:|https?:|#)/i.test(u)) return m;
      var a = abs(u, base);
      return a ? 'url("' + a + '")' : m;
    });
  }

  var LIBS = [
    [/jquery/i, 'jQuery', ''], [/react(-dom)?(\.production)?(\.min)?\.js|__NEXT_DATA__|_next\/static/i, 'React / Next.js', 'Páginas dibujadas con JavaScript: se analizan sus hojas de estilo'],
    [/vue(\.runtime)?(\.global)?(\.min)?\.js|__NUXT__/i, 'Vue / Nuxt', ''], [/angular/i, 'Angular', ''], [/svelte/i, 'Svelte', ''],
    [/gsap|TweenMax|ScrollTrigger/i, 'GSAP (animaciones)', 'Animación de entrada de las secciones (.reveal)'],
    [/aos(\.min)?\.js|data-aos/i, 'AOS (animar al desplazar)', 'Animación de entrada de las secciones (.reveal)'],
    [/swiper|slick|splide|flickity|owl\.carousel|glide/i, 'Carrusel de imágenes', 'Galería de fotos con ampliación'],
    [/lightbox|glightbox|fancybox|photoswipe|magnific/i, 'Visor de imágenes', 'Ampliación de fotos al hacer clic (incluida)'],
    [/bootstrap(\.bundle)?(\.min)?\.(css|js)/i, 'Bootstrap', ''], [/tailwind/i, 'Tailwind CSS', ''],
    [/wp-content|wp-includes/i, 'WordPress', ''], [/cdn\.shopify|Shopify\./i, 'Shopify', ''], [/wixstatic|wix\.com/i, 'Wix', ''],
    [/squarespace/i, 'Squarespace', ''], [/ghost\.(io|org)|ghost-portal/i, 'Ghost', ''], [/substack/i, 'Substack', ''],
    [/gtag\(|googletagmanager|google-analytics/i, 'Estadísticas de Google', 'No se copia: weBlogger no rastrea a los lectores'],
    [/cookiebot|onetrust|cookieconsent|didomi/i, 'Aviso de cookies', 'No hace falta: el blog no usa cookies'],
    [/prefers-color-scheme|data-theme|dark-mode|darkmode/i, 'Modo oscuro', 'Botón de claro / oscuro (incluido)']
  ];

  function detectLibs(text) {
    var out = [];
    LIBS.forEach(function (l) { if (l[0].test(text) && !out.some(function (o) { return o.name === l[1]; })) out.push({ name: l[1], equiv: l[2] }); });
    return out;
  }

  /* ====================================================== medir ====== */

  function measure(fd) {
    var win = fd.defaultView, cs = function (el) { return win.getComputedStyle(el); };
    var M = { warnings: [] };
    var visible = function (el) {
      if (!el || !el.getClientRects().length) return false;
      var s = cs(el);
      return s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0.05 && el.offsetWidth > 0;
    };
    var top = function (el) { var y = 0; while (el) { y += el.offsetTop || 0; el = el.offsetParent; } return y; };
    var bgOf = function (el) {
      while (el && el.nodeType === 1) {
        var c = parse(cs(el).backgroundColor);
        if (c && c.a > 0.5) return c;
        el = el.parentElement;
      }
      return null;
    };

    var body = fd.body, html = fd.documentElement;
    M.text = (body.innerText || '').replace(/\s+/g, ' ').trim().length;
    if (M.text < 200) M.warnings.push('Casi no hay texto sin JavaScript: la web se dibuja con scripts. El estilo se saca sobre todo de sus hojas CSS.');

    M.bg = parse(cs(body).backgroundColor);
    if (!M.bg || M.bg.a < 0.5) M.bg = parse(cs(html).backgroundColor);
    if (!M.bg || M.bg.a < 0.5) M.bg = WHITE;
    M.ink = parse(cs(body).color) || BLACK;
    M.bodyFont = cs(body).fontFamily;
    var p = Array.prototype.filter.call(fd.querySelectorAll('main p, article p, p'), visible).filter(function (x) { return (x.textContent || '').trim().length > 60; })[0];
    if (p) {
      var ps = cs(p);
      M.bodyFont = ps.fontFamily; M.ink = parse(ps.color) || M.ink;
      M.bodyPx = parseFloat(ps.fontSize); M.lineH = parseFloat(ps.lineHeight) / M.bodyPx || 0;
      var mw = p, w = 0;
      while (mw && mw !== body) { var mx = parseFloat(cs(mw).maxWidth); if (mx && mx > 500 && mx < 2000) { w = Math.max(w, mx); } mw = mw.parentElement; }
      M.contentW = w || 0;
      M.paperBg = bgOf(p) || M.bg;
    }

    var heads = function (sel) { return Array.prototype.filter.call(fd.querySelectorAll(sel), visible); };
    var h1 = heads('h1')[0];
    if (!h1) {
      // sin h1 visible: el texto mas grande de la parte de arriba
      var big = null, bigPx = 0;
      Array.prototype.forEach.call(fd.querySelectorAll('h2, h3, [class*="title"], [class*="headline"]'), function (el) {
        if (!visible(el) || top(el) > 1400) return;
        var px = parseFloat(cs(el).fontSize);
        if (px > bigPx) { bigPx = px; big = el; }
      });
      h1 = big;
    }
    var hInfo = function (el) {
      if (!el) return null;
      var s = cs(el);
      return { font: s.fontFamily, px: parseFloat(s.fontSize), weight: parseInt(s.fontWeight, 10) || 400, transform: s.textTransform, spacing: parseFloat(s.letterSpacing) || 0, italic: s.fontStyle === 'italic', color: parse(s.color), align: s.textAlign };
    };
    M.h1 = hInfo(h1);
    M.h2 = hInfo(heads('h2').filter(function (x) { return x !== h1; })[0]);

    // colores: cuanto ocupa cada uno, y cuales llevan enlaces y botones
    var votes = {}, vote = function (c, wgt, kind) {
      if (!c || c.a < 0.5) return;
      var k = hex(c);
      var v = votes[k] || (votes[k] = { c: c, w: 0, links: 0, buttons: 0 });
      v.w += wgt;
      if (kind === 'link') v.links += wgt;
      if (kind === 'button') v.buttons += wgt;
    };
    var all = fd.body.querySelectorAll('*'), n = 0;
    for (var i = 0; i < all.length && n < 3000; i++) {
      var el = all[i];
      if (!visible(el)) continue;
      n++;
      var s = cs(el), area = Math.min(el.offsetWidth * el.offsetHeight, 400000);
      var bg = parse(s.backgroundColor);
      if (bg && bg.a > 0.5) vote(bg, area / 400, /^(BUTTON|INPUT)$/.test(el.tagName) || /btn|button|cta/i.test(el.className) ? 'button' : '');
      if (el.tagName === 'A' && (el.textContent || '').trim()) vote(parse(s.color), 60, 'link');
      if (/btn|button|cta/i.test(typeof el.className === 'string' ? el.className : '') || el.tagName === 'BUTTON') { vote(parse(s.backgroundColor), 300, 'button'); vote(parse(s.borderTopColor), 40, 'button'); }
      if (parseFloat(s.borderTopWidth) > 0) vote(parse(s.borderTopColor), 5, '');
    }
    var list = Object.keys(votes).map(function (k) { return votes[k]; });
    var vivid = list.filter(function (v) { var x = hsl(v.c); return x.s > 0.28 && x.l > 0.16 && x.l < 0.82; });
    vivid.sort(function (a, b) { return (b.buttons * 4 + b.links * 2 + b.w * 0.2) - (a.buttons * 4 + a.links * 2 + a.w * 0.2); });
    M.accent = vivid[0] ? vivid[0].c : null;
    if (M.accent) {
      var hA = hsl(M.accent).h;
      var second = vivid.filter(function (v) { var d = Math.abs(hsl(v.c).h - hA); return Math.min(d, 360 - d) > 35; })[0];
      M.accent2 = second ? second.c : null;
    }
    list.sort(function (a, b) { return b.w - a.w; });
    M.colors = list.slice(0, 10).map(function (v) { return hex(v.c); });

    // cabecera
    var hd = Array.prototype.filter.call(fd.querySelectorAll('header, [role="banner"], .site-header, #header, .header, nav'), function (x) { return visible(x) && top(x) < 260 && x.offsetHeight < 400; })[0];
    if (hd) {
      M.headerBg = bgOf(hd) || M.bg;
      var hs = cs(hd);
      M.headerSticky = hs.position === 'sticky' || hs.position === 'fixed';
      var la = Array.prototype.filter.call(hd.querySelectorAll('nav a, a'), function (a) { var t = (a.textContent || '').trim(); return visible(a) && t.length > 1 && t.length < 18 && !/^\W+$/.test(t); });
      M.headerInk = la[0] ? parse(cs(la[0]).color) : null;
      M.nav = la.map(function (a) { return a.textContent.trim().replace(/\s+/g, ' '); }).filter(function (t, j, arr) { return arr.indexOf(t) === j; }).slice(0, 6);
    }

    // portada
    var imgs = Array.prototype.filter.call(fd.querySelectorAll('img, picture, video'), function (x) { return visible(x) && x.offsetWidth >= 120; });
    var heroImg = imgs.filter(function (x) { return top(x) < 1100 && x.offsetWidth >= 520; })[0];
    var bgHero = Array.prototype.filter.call(fd.querySelectorAll('section, div, header'), function (x) {
      return top(x) < 900 && x.offsetWidth > W * 0.85 && x.offsetHeight > 300 && /url\(/.test(cs(x).backgroundImage) && visible(x);
    })[0];
    M.hero = bgHero || (heroImg && heroImg.offsetWidth > W * 0.82) ? 'cover' : heroImg ? 'side' : (M.h1 && M.h1.align === 'center' ? 'center' : 'side');
    M.heroImg = !!(heroImg || bgHero);

    // esquinas, sombras
    // esquinas: mandan las cajas (tarjetas, figuras); luego botones; luego fotos
    var rBox = [], rBtn = [], rImg = [], shadows = 0, cards = 0;
    Array.prototype.forEach.call(fd.querySelectorAll('img, button, a[class*="btn"], a[class*="button"], [class*="card"], article, figure, input, section, aside'), function (el) {
      if (!visible(el)) return;
      var s = cs(el);
      var r = parseFloat(s.borderTopLeftRadius);
      var cls = typeof el.className === 'string' ? el.className : '';
      if (!isNaN(r) && r < 200) {
        if (el.tagName === 'IMG') rImg.push(r);
        else if (el.tagName === 'BUTTON' || el.tagName === 'INPUT' || /btn|button/i.test(cls)) { if (r < 40) rBtn.push(r); }
        else if (parseColorBg(s) || parseFloat(s.borderTopWidth) > 0 || s.boxShadow !== 'none') rBox.push(r);
      }
      if (s.boxShadow && s.boxShadow !== 'none') shadows++;
      if (/card/i.test(cls)) cards++;
    });
    function parseColorBg(s) { var c = parse(s.backgroundColor); return c && c.a > 0.5; }
    var median = function (a) { a.sort(function (x, y) { return x - y; }); return a[Math.floor(a.length / 2)]; };
    M.radius = rBox.length ? median(rBox) : rBtn.length ? median(rBtn) : rImg.length ? median(rImg) : 0;
    M.shadows = shadows;

    // estructura
    M.h2count = heads('h2').length;
    M.sidebar = heads('aside, [class*="sidebar"], [id*="sidebar"], [class*="toc"], [id*="toc"], [class*="widget-area"], nav[class*="side"]').some(function (a) { return a.offsetWidth > 120 && a.offsetWidth < 460 && a.offsetHeight > 200; });
    M.images = imgs.length;
    M.quote = heads('blockquote').length > 0;
    M.table = heads('table').length > 0;
    M.newsletter = !!fd.querySelector('input[type="email"]');
    M.video = !!fd.querySelector('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
    M.gallery = Array.prototype.some.call(fd.querySelectorAll('*'), function (el) {
      return el.children.length >= 3 && Array.prototype.filter.call(el.children, function (c) { return c.querySelector && (c.tagName === 'IMG' || c.querySelector('img')); }).length >= 3;
    });
    M.cards = cards >= 3 || Array.prototype.some.call(fd.querySelectorAll('ul, div'), function (el) {
      var k = Array.prototype.filter.call(el.children, function (c) { return c.querySelector && c.querySelector('img') && c.querySelector('h2, h3, h4'); });
      return k.length >= 3;
    });
    M.dark = lum(M.bg) < 0.2;
    return M;
  }

  /** Si la web se dibuja con JavaScript, algo se saca de las hojas CSS. */
  function fromCss(css, M) {
    var v = function (re) { var m = re.exec(css); return m ? m[1] : null; };
    if (!M.accent) {
      var a = v(/--[\w-]*(?:primary|accent|brand|main|link)[\w-]*\s*:\s*(#[0-9a-f]{3,8}|rgba?\([^)]*\))/i);
      if (a) M.accent = parse(a);
    }
    var bodyRule = v(/(?:^|[}\s])body\s*\{([^}]*)\}/i) || '';
    if (M.text < 200) {
      var bgc = /background(?:-color)?\s*:\s*(#[0-9a-f]{3,8}|rgba?\([^)]*\))/i.exec(bodyRule), col = /(?:^|;)\s*color\s*:\s*(#[0-9a-f]{3,8}|rgba?\([^)]*\))/i.exec(bodyRule);
      if (bgc) M.bg = parse(bgc[1]) || M.bg;
      if (col) M.ink = parse(col[1]) || M.ink;
      var ff = /font-family\s*:\s*([^;]+)/i.exec(bodyRule);
      if (ff) M.bodyFont = ff[1];
      var hf = v(/h1[^{]*\{[^}]*font-family\s*:\s*([^;}]+)/i);
      if (hf && !(M.h1 && M.h1.font)) M.h1 = { font: hf, px: 44, weight: 700, transform: 'none', spacing: 0 };
      M.dark = lum(M.bg) < 0.2;
    }
  }

  /* ======================================== de la medida al blog ===== */

  var PK = ['bgPrimary', 'bgSecondary', 'bgCard', 'textPrimary', 'textSecondary', 'textMuted', 'accent', 'accentHover', 'border'];

  function palFrom(bg, ink, acc, card) {
    var darkBg = lum(bg) < 0.2;
    var sec = mix(bg, darkBg ? WHITE : BLACK, darkBg ? 0.05 : 0.035);
    card = card && contrast(card, ink) > 4 ? card : mix(bg, darkBg ? WHITE : WHITE, darkBg ? 0.07 : 0.6);
    if (contrast(acc, bg) < 2.6) acc = mix(acc, darkBg ? WHITE : BLACK, 0.35);
    return [bg, sec, card, ink, mix(ink, bg, 0.28), mix(ink, bg, 0.45), acc, mix(acc, darkBg ? WHITE : BLACK, 0.18), mix(ink, bg, 0.86)].map(hex);
  }

  function toSpec(M, url) {
    var acc = M.accent || mix(M.ink, M.bg, 0.25);
    var hA = hsl(acc).h;
    var lightArr, darkArr;
    if (M.dark) {
      darkArr = palFrom(M.bg, M.ink, acc, M.paperBg && hex(M.paperBg) !== hex(M.bg) ? M.paperBg : null);
      var lb = parse('#f7f6f3'), li = parse('#17181b');
      lightArr = palFrom(mix(lb, acc, 0.03), li, mix(acc, BLACK, 0.12), WHITE);
    } else {
      lightArr = palFrom(M.bg, M.ink, acc, M.paperBg && hex(M.paperBg) !== hex(M.bg) ? M.paperBg : null);
      var db = mix(parse('#121316'), acc, 0.04), di = parse('#eef0f3');
      darkArr = palFrom(db, di, mix(acc, WHITE, 0.25), null);
    }
    var pal = { accent2: hex(M.accent2 || parse('#' + ['3b8d56', '2c6e91', 'b9772b', '8e2343'][Math.floor(((hA + 150) % 360) / 90)])), light: {}, dark: {} };
    PK.forEach(function (k, i) { pal.light[k] = lightArr[i]; pal.dark[k] = darkArr[i]; });

    var disp = mapFont(M.h1 ? M.h1.font : M.bodyFont, 'display', M.h1 ? M.h1.weight : 700);
    var bodyF = mapFont(M.bodyFont, 'body', 400);
    var r = M.radius;
    var radius = r < 1 ? 'none' : r <= 5 ? 'sm' : r <= 12 ? 'md' : 'lg';

    // reglas propias que imitan los rasgos medidos
    var css = [];
    var heads = '.hero h1, .article-section h2, .wb-headline-title, .np-title';
    if (M.h1) {
      var rules = [];
      if (M.h1.weight && M.h1.weight !== 700) rules.push('font-weight:' + M.h1.weight);
      if (M.h1.transform && M.h1.transform !== 'none') rules.push('text-transform:' + M.h1.transform);
      if (M.h1.spacing && M.h1.px) rules.push('letter-spacing:' + (M.h1.spacing / M.h1.px).toFixed(3) + 'em');
      if (M.h1.italic) rules.push('font-style:italic');
      if (rules.length) css.push(heads + '{' + rules.join(';') + '}');
      if (M.h1.px >= 26 && M.h1.px <= 120) css.push('.hero h1{font-size:clamp(2rem,' + (M.h1.px / W * 100 * 1.05).toFixed(2) + 'vw,' + Math.round(M.h1.px) + 'px)}');
    }
    if (M.h2 && M.h2.px >= 18 && M.h2.px <= 64) {
      var r2 = ['font-size:' + Math.round(M.h2.px) + 'px'];
      if (M.h2.transform && M.h2.transform !== 'none') r2.push('text-transform:' + M.h2.transform);
      if (M.h2.spacing) r2.push('letter-spacing:' + (M.h2.spacing / M.h2.px).toFixed(3) + 'em');
      if (M.h2.weight && M.h2.weight !== 700) r2.push('font-weight:' + M.h2.weight);
      css.push('.article-section h2{' + r2.join(';') + '}');
    }
    if (M.bodyPx >= 14 && M.bodyPx <= 23) css.push('.article-content p,.article-content li{font-size:' + Math.round(M.bodyPx) + 'px' + (M.lineH > 1.2 && M.lineH < 2.2 ? ';line-height:' + M.lineH.toFixed(2) : '') + '}');
    if (M.contentW >= 560) css.push('.header-inner,.hero-container,.article-wrapper,.stats-strip{max-width:' + Math.min(1280, Math.round(M.contentW)) + 'px}');
    if (M.headerBg && contrast(M.headerBg, M.bg) > 1.6) {
      var hink = M.headerInk && contrast(M.headerInk, M.headerBg) > 3 ? M.headerInk : (lum(M.headerBg) < 0.35 ? WHITE : BLACK);
      css.push(':root:not([data-theme="dark"]) .site-header{background:' + hex(M.headerBg) + ';border-bottom-color:transparent}' +
        ':root:not([data-theme="dark"]) .site-header .brand-title,:root:not([data-theme="dark"]) .site-header .brand-sub,:root:not([data-theme="dark"]) .site-header .nav-links a,:root:not([data-theme="dark"]) .site-header .theme-btn{color:' + hex(hink) + '}');
    }
    if (M.shadows < 2) css.push('.info-card,.stat-card,.toc-sidebar,.hero-frame,.media-figure{box-shadow:none}');

    var feats = [];
    if (M.cards) feats.push('cards');
    if (M.gallery || M.images >= 6) feats.push('gallery');
    if (M.quote) feats.push('quote');
    if (M.table) feats.push('table');
    if (M.video) feats.push('video');
    if (M.newsletter) feats.push('newsletter');

    var host = '';
    try { host = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { host = url; }
    return {
      v: 1, url: url, host: host, date: new Date().toISOString().slice(0, 10),
      palette: pal, dark: !!M.dark,
      fontDisplay: disp.use, fontBody: bodyF.use, fontsOrig: [disp.orig, bodyF.orig],
      radius: radius, hero: M.hero === 'cover' ? 'hero-cover' : M.hero === 'center' ? 'hero-center' : '', heroImg: M.heroImg !== false,
      toc: !!M.sidebar, sections: Math.max(3, Math.min(6, M.h2count || 4)), feats: feats,
      nav: (M.nav || []).slice(0, 5), customCss: css.join('\n')
    };
  }

  /* -------------------------------------- componer la pagina ----- */

  function buildFromSpec(sp, name, brand) {
    var e = K.e, sc = [3, 0, 9, 5, 21, 11];
    var hasImg = sp.hero !== 'hero-center';
    var sections = [];
    var add = function (kicker, title, html) { sections.push(K.section(kicker, title, html)); };
    add('Introducción', 'De qué va este artículo', K.ps([K.first('Escribe aquí la entradilla larga: el gancho que hace que el lector se quede. Este blog tiene el estilo de la web que capturaste —colores, letras y estructura—, pero los textos y las fotos son tuyos.'), 'Haz clic en cualquier texto para cambiarlo y arrastra elementos desde el panel de la derecha.']));
    if (sp.feats.indexOf('cards') > -1) add('Destacados', 'Tres cosas que importan', K.cards([['Primera idea', 'Explícala en una línea.'], ['Segunda idea', 'Otra línea breve.']]) + K.cards([['Tercera idea', 'Un dato o un consejo.'], ['Cuarta idea', 'Algo para recordar.']]));
    add('En detalle', 'El desarrollo', K.figure(sc[1], 'Una imagen que acompaña al texto', 'Foto propia') + K.ps(['Desarrolla aquí el tema con calma. Divide el texto en párrafos cortos y usa subtítulos.']));
    if (sp.feats.indexOf('quote') > -1) add('Una voz', 'Lo que dicen', K.quote('Una cita que resuma el espíritu del artículo.', 'Quién lo dijo'));
    if (sp.feats.indexOf('table') > -1) add('Datos', 'En una tabla', '<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Concepto</th><th>Dato</th></tr></thead><tbody><tr><td>Primero</td><td>—</td></tr><tr><td>Segundo</td><td>—</td></tr><tr><td>Tercero</td><td>—</td></tr></tbody></table></div>');
    if (sp.feats.indexOf('video') > -1) add('Vídeo', 'Para verlo', '<div class="wb-video"><div class="wb-video-ph">Pega la dirección del vídeo en el panel de Propiedades</div></div>');
    if (sp.feats.indexOf('gallery') > -1) add('Galería', 'En imágenes', K.gallery([[sc[2], 'Uno'], [sc[3], 'Dos'], [sc[4], 'Tres']]));
    while (sections.length < sp.sections) add('Sección', 'Otro apartado', K.ps(['Escribe aquí otro apartado del artículo.']));
    if (sp.feats.indexOf('newsletter') > -1) add('Suscríbete', 'No te pierdas nada', K.callout('💌', '<strong>Recibe los nuevos artículos</strong> en tu correo.') + '<div class="wb-btn-row"><a class="wb-btn" href="#">Suscribirme</a></div>');
    var nav = ['Inicio'];
    (sp.nav.length ? sp.nav.slice(1) : ['Artículos', 'Sobre mí', 'Contacto']).forEach(function (t, i) { if (i < sections.length) nav.push(t); });
    return K.page([
      K.header({ brand: brand || 'MI BLOG', sub: 'Con el estilo de ' + sp.host, emblem: (brand || 'B').charAt(0), nav: nav }),
      K.hero(name, { cls: sp.hero, img: hasImg ? sc[0] : null, badge: 'Artículo destacado', lead: 'La entradilla: dos o tres líneas que cuentan de qué trata el artículo y por qué merece la pena leerlo.', meta: ['🗓️ Fecha', '⏱️ 5 min', '✍️ Autor'], cap: 'Imagen de portada', credit: 'Foto propia' }),
      K.body.apply(null, [sp.toc].concat(sections))
    ]);
  }

  function templateFrom(sp, brand) {
    var id = 'cap-' + sp.host.replace(/[^a-z0-9]+/gi, '-') + '-' + (sp.saved || Date.now()).toString(36).slice(-5);
    return {
      id: id, name: (brand && brand !== 'MI BLOG' ? brand + ' · ' : '') + 'Estilo de ' + sp.host, group: 'Capturadas de la web',
      desc: 'Capturada el ' + sp.date + ': ' + sp.fontDisplay + ' y ' + sp.fontBody + (sp.dark ? ', en oscuro' : '') + '. ' + sp.url,
      palette: 'terracota', captured: sp,
      thumb: { palette: sp.palette, img: sp.hero === 'hero-center' ? null : 3, cover: sp.hero === 'hero-cover', center: sp.hero === 'hero-center', dark: sp.dark },
      build: function (name) {
        return {
          body: buildFromSpec(sp, name, brand),
          set: { fontDisplay: sp.fontDisplay, fontBody: sp.fontBody, radius: sp.radius, startTheme: sp.dark ? 'dark' : 'light', palette: JSON.parse(JSON.stringify(sp.palette)), paletteId: 'a-medida', customCss: sp.customCss }
        };
      }
    };
  }

  /* ================================================== analizar ===== */

  C.analyze = function (url, step) {
    step = step || function () {};
    url = String(url || '').trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    var R = { url: url, sheets: [], scripts: [], libs: [], warnings: [] };
    step('Descargando la página');
    return fetchText(url, 3072).then(function (pg) {
      if (pg.status >= 400) throw new Error('la web respondió ' + pg.status + (pg.status === 403 ? ' (no deja que la descarguen programas)' : pg.status === 404 ? ' (no existe)' : ''));
      if (!/html|xml|text\/plain/i.test(pg.contentType || 'text/html')) throw new Error('ese enlace no es una página web (' + pg.contentType + ')');
      R.page = pg; R.base = pg.url;
      R.doc = new DOMParser().parseFromString(pg.text, 'text/html');
      var gen = R.doc.querySelector('meta[name="generator"]');
      R.generator = gen ? gen.getAttribute('content') : '';

      step('Descargando las hojas de estilo');
      var items = [];
      Array.prototype.forEach.call(R.doc.querySelectorAll('link[rel~="stylesheet"][href], style'), function (el) {
        if (el.tagName === 'STYLE') items.push({ inline: true, text: el.textContent || '' });
        else {
          var media = (el.getAttribute('media') || '').toLowerCase();
          if (media && /print|speech/.test(media) && !/screen|all/.test(media)) return;
          items.push({ href: abs(el.getAttribute('href'), R.base) });
        }
      });
      var remote = items.filter(function (x) { return x.href; }).slice(0, 12);
      return Promise.all(remote.map(function (it) {
        return fetchText(it.href, 1536).then(function (r) { it.text = absolutize(r.text, r.url); it.kb = Math.round(r.bytes / 1024); }, function () { it.text = ''; it.failed = true; });
      })).then(function () {
        // @import, un nivel
        var imports = [];
        items.forEach(function (it) {
          (it.text || '').replace(/@import\s+(?:url\()?\s*['"]?([^'")\s;]+)['"]?\s*\)?[^;]*;/g, function (m, u) {
            if (imports.length < 6 && !/fonts\.googleapis/.test(u)) imports.push({ href: abs(u, it.href || R.base), parent: it });
            return m;
          });
        });
        return Promise.all(imports.map(function (im) {
          return fetchText(im.href, 1024).then(function (r) { im.text = absolutize(r.text, r.url); im.kb = Math.round(r.bytes / 1024); }, function () { im.text = ''; });
        })).then(function () {
          R.css = imports.map(function (i) { return i.text; }).concat(items.map(function (i) { return i.inline ? absolutize(i.text, R.base) : i.text || ''; })).join('\n');
          R.sheets = remote.concat(imports).map(function (i) { return { href: i.href, kb: i.kb || 0, failed: !!i.failed }; });
          R.inlineStyles = items.filter(function (i) { return i.inline; }).length;
        });
      });
    }).then(function () {
      step('Descargando y leyendo los scripts');
      var srcs = Array.prototype.map.call(R.doc.querySelectorAll('script[src]'), function (s) { return abs(s.getAttribute('src'), R.base); }).filter(Boolean);
      var inline = Array.prototype.map.call(R.doc.querySelectorAll('script:not([src])'), function (s) { return s.textContent || ''; }).join('\n');
      R.inlineScripts = R.doc.querySelectorAll('script:not([src])').length;
      return Promise.all(srcs.slice(0, 10).map(function (u) {
        return fetchText(u, 1024).then(function (r) { return { href: u, kb: Math.round(r.bytes / 1024), text: r.text }; }, function () { return { href: u, kb: 0, text: '', failed: true }; });
      })).then(function (js) {
        R.scripts = js.map(function (j) { return { href: j.href, kb: j.kb, failed: !!j.failed }; });
        R.scriptsTotal = srcs.length;
        R.libs = detectLibs(srcs.join('\n') + '\n' + inline.slice(0, 400000) + '\n' + js.map(function (j) { return j.href + '\n' + j.text.slice(0, 300000); }).join('\n') + '\n' + R.page.text.slice(0, 200000) + '\n' + R.css.slice(0, 300000));
      });
    }).then(function () {
      step('Maquetando la página sin ejecutar su JavaScript');
      return render(R);
    }).then(function (fd) {
      step('Midiendo colores, letras, espacios y estructura');
      var M = measure(fd);
      fromCss(R.css, M);
      R.M = M;
      R.warnings = R.warnings.concat(M.warnings);
      step('Componiendo tu blog con ese estilo');
      R.spec = toSpec(M, R.base);
      R.spec.fontsMapped = [[R.spec.fontsOrig[0], R.spec.fontDisplay], [R.spec.fontsOrig[1], R.spec.fontBody]];
      return R;
    });
  };

  var frame = null;
  /** Maqueta la pagina descargada en el marco de la izquierda, sin scripts. */
  function render(R) {
    var d = R.doc.cloneNode(true);
    Array.prototype.forEach.call(d.querySelectorAll('script, link[rel~="stylesheet"], link[rel="preload"], link[rel="modulepreload"], style, iframe, object, embed, meta[http-equiv], base, noscript[data-wb-skip]'), function (x) { x.remove(); });
    Array.prototype.forEach.call(d.querySelectorAll('*'), function (x) {
      for (var i = x.attributes.length - 1; i >= 0; i--) { var an = x.attributes[i].name; if (/^on/i.test(an)) x.removeAttribute(an); }
      if (/^\s*javascript:/i.test(x.getAttribute('href') || '')) x.setAttribute('href', '#');
    });
    // imagenes perezosas: el src de verdad suele ir en data-src
    Array.prototype.forEach.call(d.querySelectorAll('img'), function (im) {
      var ds = im.getAttribute('data-src') || im.getAttribute('data-lazy-src') || im.getAttribute('data-original');
      if (ds) im.setAttribute('src', ds);
      im.removeAttribute('loading');
      im.removeAttribute('srcset');
    });
    // muchas webs esconden el contenido hasta que su JavaScript lo enseña
    d.documentElement.classList.remove('no-js');
    var head = d.head || d.documentElement.insertBefore(d.createElement('head'), d.body);
    var base = d.createElement('base'); base.href = R.base; head.insertBefore(base, head.firstChild);
    var st = d.createElement('style');
    st.textContent = R.css + '\n*{animation:none!important;transition:none!important}[data-aos]{opacity:1!important;transform:none!important}';
    head.appendChild(st);
    var html = '<!DOCTYPE html>' + d.documentElement.outerHTML;
    return new Promise(function (resolve) {
      frame.onload = function () { setTimeout(function () { resolve(frame.contentDocument); }, 1400); };
      frame.srcdoc = html;
    });
  }

  /* ================================================ guardar ======== */

  var loaded = null, saved = [];
  function file() { return WB.join(A.root(), FILE); }

  C.ensure = function () {
    if (loaded) return loaded;
    loaded = WB.invoke('read_text', { path: file() }).then(function (t) {
      try { saved = JSON.parse(t) || []; } catch (e) { saved = []; }
      saved.forEach(function (it) { register(templateFrom(it.spec, it.brand)); });
    }, function () { saved = []; });
    return loaded;
  };

  function register(t) {
    WB.TEMPLATES = WB.TEMPLATES.filter(function (x) { return x.id !== t.id; });
    WB.TEMPLATES.push(t);
    if (WB.tplPick && WB.tplPick.refresh) WB.tplPick.refresh();
  }

  C.save = function (spec, brand) {
    spec.saved = Date.now();
    var t = templateFrom(spec, brand);
    return C.ensure().then(function () {
      saved.push({ id: t.id, brand: brand, spec: spec });
      return WB.invoke('write_text', { path: file(), text: JSON.stringify(saved, null, 1) });
    }).then(function () { register(t); return t; });
  };

  /* ===================================================== pantalla ===== */

  var layer, inUrl, inBrand, stepsEl, report, pvO, pvN, fO, fN, btnGo, btnCreate, btnSave, last = null;

  function fit(view, fr) {
    var k = view.clientWidth / W;
    fr.style.width = W + 'px';
    fr.style.height = Math.ceil(view.clientHeight / k) + 'px';
    fr.style.transform = 'scale(' + k + ')';
  }
  function fitAll() { if (layer && !layer.hidden) { fit(pvO, fO); fit(pvN, fN); } }

  function sw(color, label) { var s = h('span', { class: 'cap-sw', title: label + ': ' + color }); s.style.background = color; return s; }

  function showReport(R) {
    var sp = R.spec, M = R.M;
    report.textContent = '';
    var row = function (k, v) { return h('div', { class: 'cap-row' }, [h('span', { text: k }), v instanceof Node ? v : h('b', { text: v })]); };
    var group = function (title, kids) { report.appendChild(h('section', { class: 'cap-group' }, [h('h4', { text: title })].concat(kids))); };
    group('Colores', [
      h('div', { class: 'cap-sws' }, ['bgPrimary', 'bgSecondary', 'bgCard', 'textPrimary', 'textMuted', 'accent', 'border'].map(function (k) { return sw(sp.palette[sp.dark ? 'dark' : 'light'][k], k); }).concat([sw(sp.palette.accent2, 'segundo color')])),
      row('Más usados', h('span', { class: 'cap-sws' }, M.colors.slice(0, 8).map(function (c) { return sw(c, 'usado'); }))),
      row('Modo', sp.dark ? 'oscuro (se crea también la versión clara)' : 'claro (se crea también la versión oscura)')
    ]);
    group('Letras', [
      row('Titulares', sp.fontsOrig[0] + ' → ' + sp.fontDisplay),
      row('Texto', sp.fontsOrig[1] + ' → ' + sp.fontBody),
      row('Tamaños', (M.h1 ? Math.round(M.h1.px) + ' px titular · ' : '') + (M.bodyPx ? Math.round(M.bodyPx) + ' px texto' : '—')),
      row('Rasgos', [M.h1 && M.h1.weight ? 'peso ' + M.h1.weight : '', M.h1 && M.h1.transform !== 'none' ? M.h1.transform : '', M.h1 && M.h1.italic ? 'cursiva' : ''].filter(Boolean).join(' · ') || 'normales')
    ]);
    group('Maqueta', [
      row('Portada', { 'hero-cover': 'foto a toda la portada', 'hero-center': 'centrada', '': 'texto y foto al lado' }[sp.hero]),
      row('Esquinas', Math.round(M.radius) + ' px → ' + sp.radius),
      row('Columna', M.contentW ? Math.round(M.contentW) + ' px' : 'automática'),
      row('Barra lateral', sp.toc ? 'sí → índice lateral' : 'no'),
      row('Bloques', sp.feats.length ? sp.feats.map(function (f) { return { cards: 'tarjetas', gallery: 'galería', quote: 'citas', table: 'tablas', video: 'vídeo', newsletter: 'suscripción' }[f]; }).join(', ') : 'texto e imágenes'),
      row('Menú', (M.nav || []).join(' · ') || '—')
    ]);
    var kb = R.sheets.reduce(function (a, s) { return a + s.kb; }, 0), jkb = R.scripts.reduce(function (a, s) { return a + s.kb; }, 0);
    group('Descargado y analizado', [
      row('HTML', Math.round(R.page.bytes / 1024) + ' KB' + (R.generator ? ' · ' + R.generator : '')),
      row('Hojas CSS', R.sheets.length + ' archivos · ' + kb + ' KB' + (R.inlineStyles ? ' + ' + R.inlineStyles + ' en la página' : '')),
      row('JavaScript', R.scriptsTotal + ' archivos (' + R.scripts.length + ' leídos, ' + jkb + ' KB) + ' + R.inlineScripts + ' en la página'),
      h('ul', { class: 'cap-libs' }, R.libs.length ? R.libs.map(function (l) { return h('li', null, [h('b', { text: l.name }), l.equiv ? h('span', { text: ' → ' + l.equiv }) : null]); }) : [h('li', { text: 'Sin librerías conocidas' })]),
      h('p', { class: 'pnote', text: 'Su JavaScript no se copia: no funcionaría fuera de su web y es código suyo. Lo que hace (galerías, animaciones, modo oscuro…) ya lo trae weBlogger.' })
    ]);
    if (R.warnings.length) group('Avisos', R.warnings.map(function (w) { return h('p', { class: 'cap-warn', text: w }); }));
  }

  function setSteps(list) {
    stepsEl.textContent = '';
    list.forEach(function (s, i) { stepsEl.appendChild(h('li', { class: i === list.length - 1 ? 'is-now' : 'is-done', text: s })); });
  }

  function go() {
    var url = inUrl.value.trim();
    if (!url) { inUrl.focus(); return; }
    var steps = [];
    btnGo.disabled = btnCreate.disabled = btnSave.disabled = true;
    report.textContent = '';
    fN.srcdoc = '';
    layer.classList.add('is-working');
    WB.busy.run('Capturando el estilo de ' + url.replace(/^https?:\/\//, '').split('/')[0], function () {
      return C.analyze(url, function (s) { steps.push(s); setSteps(steps); if (WB.busy) WB.busy.label(s); });
    }).then(function (R) {
      last = R;
      setSteps(steps.concat(['Listo: así quedaría tu blog con ese estilo']));
      stepsEl.lastChild.className = 'is-done';
      showReport(R);
      preview();
      btnCreate.disabled = btnSave.disabled = false;
    }, function (err) {
      setSteps(steps);
      stepsEl.appendChild(h('li', { class: 'is-error', text: 'No se pudo: ' + (err && err.message || err) }));
    }).then(function () { btnGo.disabled = false; layer.classList.remove('is-working'); fitAll(); });
  }

  function preview() {
    if (!last) return;
    var t = templateFrom(last.spec, inBrand.value.trim() || 'MI BLOG');
    fN.srcdoc = WB.tplPick.previewHtml(t, 'El titular de tu artículo');
    fitAll();
  }

  function build() {
    inUrl = h('input', { type: 'url', class: 'input', placeholder: 'https://… el enlace de la página cuyo estilo quieres', spellcheck: false, autocomplete: 'off' });
    inUrl.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); go(); } });
    inBrand = h('input', { type: 'text', class: 'input', value: 'MI BLOG', spellcheck: false, autocomplete: 'off' });
    inBrand.addEventListener('change', preview);
    btnGo = h('button', { type: 'button', class: 'btn btn-primary', text: 'Analizar', onclick: go });
    btnCreate = h('button', { type: 'button', class: 'btn btn-primary', text: 'Crear blog con este estilo', disabled: true, onclick: function () {
      if (!last) return;
      var t = templateFrom(last.spec, inBrand.value.trim() || 'MI BLOG');
      t.id = 'cap-actual'; t.hidden = true;
      register(t);
      C.close();
      A.newFrom(t.id).catch(WB.ui.fail);
    } });
    btnSave = h('button', { type: 'button', class: 'btn', text: 'Guardar como plantilla', disabled: true, onclick: function () {
      if (!last) return;
      C.save(JSON.parse(JSON.stringify(last.spec)), inBrand.value.trim() || 'MI BLOG').then(function (t) {
        WB.dlg.toast('Plantilla guardada: ' + t.name + ' (Nuevo blog → Capturadas de la web)', 'ok', 3500);
      }, WB.ui.fail);
    } });
    stepsEl = h('ol', { class: 'cap-steps' });
    report = h('div', { class: 'cap-report' });
    fO = h('iframe', { class: 'gal-pv-frame', title: 'La página original, sin su JavaScript', sandbox: 'allow-same-origin' });
    fN = h('iframe', { class: 'gal-pv-frame', title: 'Tu blog con ese estilo', sandbox: '' });
    pvO = h('div', { class: 'gal-pv-view cap-view' }, [fO]);
    pvN = h('div', { class: 'gal-pv-view cap-view' }, [fN]);
    frame = fO;

    layer = h('div', { class: 'gallery cap-layer', hidden: true }, [
      h('header', { class: 'gal-head' }, [
        h('div', { class: 'gal-heading' }, [
          h('h2', { class: 'gal-title', text: 'Capturar estilo de página' }),
          h('p', { class: 'gal-sub', text: 'Descarga la página, sus hojas CSS y sus scripts, la maqueta sin ejecutar su JavaScript, mide colores, letras y estructura, y crea un blog muy parecido con tus textos.' })
        ]),
        h('button', { type: 'button', class: 'btn', text: 'Cerrar (Esc)', onclick: function () { C.close(); } })
      ]),
      h('div', { class: 'gal-tools' }, [
        h('label', { class: 'gal-field gal-grow' }, [h('span', { text: 'Enlace de la página' }), inUrl]),
        h('label', { class: 'gal-field' }, [h('span', { text: 'Nombre de tu blog' }), inBrand]),
        btnGo
      ]),
      h('div', { class: 'cap-body' }, [
        h('section', { class: 'cap-col' }, [h('h3', { text: 'La página original (sin JavaScript)' }), pvO]),
        h('section', { class: 'cap-col' }, [h('h3', { text: 'Tu blog con ese estilo' }), pvN]),
        h('aside', { class: 'cap-side' }, [stepsEl, report, h('div', { class: 'cap-actions' }, [btnCreate, btnSave]),
          h('p', { class: 'pnote', text: 'Se toma el estilo, no el contenido: los textos, las fotos y los logotipos de la web no se copian.' })])
      ])
    ]);
    document.body.appendChild(layer);
    window.addEventListener('resize', fitAll);
  }

  C.open = function (url) {
    if (!layer) build();
    WB.ui.closeMenus();
    if (WB.tplPick) WB.tplPick.close();
    if (WB.edition && WB.edition.closeChooser) WB.edition.closeChooser();
    layer.hidden = false;
    if (url) inUrl.value = url;
    requestAnimationFrame(fitAll);
    inUrl.focus();
    if (!WB.isDesktop) setSteps(['Esta función necesita la aplicación de escritorio (descarga las páginas desde Rust).']);
  };
  C.close = function () { if (layer) layer.hidden = true; };

  document.addEventListener('keydown', function (ev) {
    if (!layer || layer.hidden || !document.getElementById('dialogLayer').hidden) return;
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); C.close(); }
  }, true);

  WB.actions.capture = function () { C.open(); };

  // las plantillas capturadas aparecen en el selector de plantillas
  if (WB.tplPick) {
    var baseOpen = WB.tplPick.open;
    WB.tplPick.open = function (name) {
      return C.ensure().then(function () { baseOpen(name); }, function () { baseOpen(name); });
    };
  }

  // para las pruebas: medir un documento ya maquetado
  C._measure = measure;
  C._toSpec = toSpec;
  C._templateFrom = templateFrom;
})();
