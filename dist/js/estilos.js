/* ==========================================================================
   weBlogger - motor de estilos de prensa.

   Un estilo no es una plantilla dibujada a mano: es una ficha de parametros
   (cabecera, titulares, filetes, densidad, fotos, color, fuentes) mas una
   maqueta que compone la pagina. La hoja de estilos del articulo traduce cada
   parametro en diseño mediante atributos data-st-* en <html>, asi que un
   mismo contenido cambia de periodico con solo cambiar de ficha.

   - Las fichas viven en js/estilos/<grupo>.js   (WB.addStyles)
   - Las maquetas en js/maquetas/<id>.js          (WB.addLayout)
   - Los textos de muestra en js/banco.js         (WB.bank)
   ========================================================================== */
(function () {
  'use strict';

  var S = WB.styles = { list: [], byId: {}, groups: [], layouts: {}, layoutList: [] };

  /** Valores admitidos de cada parametro. El primero es el de por defecto. */
  S.TOKENS = {
    cab: ['clasica', 'versales', 'gotica', 'banda', 'bloque', 'manuscrita', 'fina'],
    filetes: ['finos', 'ninguno', 'dobles', 'gruesos'],
    tit: ['normal', 'versales', 'cursiva', 'condensada'],
    peso: ['700', '400', '900'],
    dens: ['media', 'densa', 'aireada'],
    foto: ['normal', 'bn', 'calida', 'saturada', 'redonda'],
    etq: ['caja', 'subrayada', 'texto', 'pastilla'],
    alin: ['izq', 'centro'],
    cap: ['clasica', 'ninguna', 'color', 'caja'],
    just: ['no', 'si'],
    radio: ['none', 'sm', 'md', 'lg']
  };
  S.TOKEN_LABELS = {
    cab: 'Cabecera', filetes: 'Filetes', tit: 'Titulares', peso: 'Grosor de titulares', dens: 'Densidad',
    foto: 'Fotografías', etq: 'Etiquetas de sección', alin: 'Alineación de titulares', cap: 'Letra capital', just: 'Texto justificado'
  };
  S.VALUE_LABELS = {
    clasica: 'Clásica', versales: 'Versales', gotica: 'Gótica', banda: 'Banda de color', bloque: 'Bloque de tabloide', manuscrita: 'Manuscrita', fina: 'Fina y espaciada',
    finos: 'Finos', ninguno: 'Sin filetes', dobles: 'Dobles', gruesos: 'Gruesos',
    normal: 'Normales', cursiva: 'En cursiva', condensada: 'Condensados en versales',
    '700': 'Negrita', '400': 'Fina', '900': 'Negra',
    media: 'Media', densa: 'Densa', aireada: 'Aireada',
    bn: 'Blanco y negro', calida: 'Cálidas', saturada: 'Saturadas', redonda: 'Esquinas redondas',
    caja: 'En caja', subrayada: 'Subrayadas', texto: 'Solo texto', pastilla: 'Pastilla',
    izq: 'A la izquierda', centro: 'Centrados', ninguna: 'Sin capitular', color: 'Grande y de color',
    no: 'No', si: 'Sí'
  };

  /* ============================================================ color ==== */

  function rgb(hex) {
    var h = String(hex || '#000000').replace('#', '');
    if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16) || 0; });
  }
  function hex(c) {
    return '#' + c.map(function (n) { return ('0' + Math.round(Math.max(0, Math.min(255, n))).toString(16)).slice(-2); }).join('');
  }
  function mix(a, b, t) {
    var x = rgb(a), y = rgb(b);
    return hex(x.map(function (v, i) { return v + (y[i] - v) * t; }));
  }
  function lum(c) {
    var v = rgb(c).map(function (n) { n /= 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  S.lum = lum;
  S.mix = mix;

  /** De cuatro colores (papel, tinta, acento, segundo acento) sale la paleta
      entera, en claro y en oscuro. */
  S.palette = function (c) {
    var paper = c[0], ink = c[1], accent = c[2], a2 = c[3] || c[2];
    var darkAccent = accent;
    for (var i = 0; i < 6 && lum(darkAccent) < 0.3; i++) darkAccent = mix(darkAccent, '#ffffff', 0.2);
    return {
      accent2: a2,
      light: {
        bgPrimary: paper, bgSecondary: mix(paper, ink, 0.06), bgCard: lum(paper) > 0.93 ? '#ffffff' : mix(paper, '#ffffff', 0.55),
        textPrimary: ink, textSecondary: mix(ink, paper, 0.24), textMuted: mix(ink, paper, 0.46),
        accent: accent, accentHover: mix(accent, '#000000', 0.22), border: mix(paper, ink, 0.17)
      },
      dark: {
        bgPrimary: '#111315', bgSecondary: '#191c1f', bgCard: '#1f2327',
        textPrimary: '#f1f0ec', textSecondary: '#c8c7c2', textMuted: '#908f8a',
        accent: darkAccent, accentHover: mix(darkAccent, '#ffffff', 0.25), border: '#2f3337'
      }
    };
  };

  /* ========================================================== registro === */

  /**
   * Da de alta un grupo de fichas.
   * ficha: { id, name, ref, maqueta, mast, display, body, ui, cabFont?, c:[papel,tinta,acento,acento2], t:{...} }
   */
  WB.addStyles = function (groupId, groupName, list) {
    var g = { id: groupId, name: groupName, items: [] };
    list.forEach(function (raw) {
      if (!raw || !raw.id || S.byId[raw.id]) return;
      var t = {};
      Object.keys(S.TOKENS).forEach(function (k) {
        var v = raw.t && raw.t[k] !== undefined ? String(raw.t[k]) : S.TOKENS[k][0];
        if (v === 'true') v = 'si';
        if (v === 'false') v = 'no';
        t[k] = S.TOKENS[k].indexOf(v) > -1 ? v : S.TOKENS[k][0];
      });
      var st = {
        id: raw.id, name: raw.name, ref: raw.ref || '', grupo: groupId, maqueta: raw.maqueta || 'sabana',
        mast: raw.mast || 'El Diario', display: raw.display, body: raw.body, ui: raw.ui || raw.body,
        cabFont: raw.cabFont || '', c: raw.c, t: t, n: S.list.length
      };
      S.byId[st.id] = st;
      S.list.push(st);
      g.items.push(st);
    });
    S.groups.push(g);
  };

  /** Da de alta una maqueta: { id, name, desc, build(ctx) -> html }. */
  WB.addLayout = function (l) {
    if (S.layouts[l.id]) return;
    S.layouts[l.id] = l;
    S.layoutList.push(l);
  };

  /* ====================================================== aplicar ======== */

  /** Pone la ficha en el estado del articulo (colores, fuentes y parametros). */
  S.apply = function (s, st) {
    var p = S.palette(st.c);
    s.style = st.id;
    s.tokens = Object.assign({}, st.t);
    s.palette = p;
    s.paletteId = '';
    s.fontDisplay = st.display;
    s.fontBody = st.body;
    s.fontUi = st.ui || '';
    s.fontCab = st.cabFont || '';
    s.radius = st.t.radio || 'none';
    s.format = '';
  };

  /** Atributos data-st-* para <html>, como texto. */
  S.attrString = function (s) {
    if (!s.style) return '';
    var out = ' data-wb-style="' + WB.esc(s.style) + '"';
    Object.keys(s.tokens || {}).forEach(function (k) {
      if (k !== 'radio') out += ' data-st-' + k + '="' + WB.esc(s.tokens[k]) + '"';
    });
    return out;
  };

  /** Los mismos atributos, puestos sobre un elemento (el <html> del editor). */
  S.attrs = function (el, s) {
    Array.prototype.slice.call(el.attributes).forEach(function (a) {
      if (a.name === 'data-wb-style' || a.name.indexOf('data-st-') === 0) el.removeAttribute(a.name);
    });
    if (!s.style) return;
    el.setAttribute('data-wb-style', s.style);
    Object.keys(s.tokens || {}).forEach(function (k) {
      if (k !== 'radio') el.setAttribute('data-st-' + k, s.tokens[k]);
    });
  };

  /** Lee de un <html> ya guardado el estilo y sus parametros. */
  S.read = function (root, s) {
    s.style = root.getAttribute('data-wb-style') || '';
    s.tokens = {};
    Array.prototype.forEach.call(root.attributes, function (a) {
      if (a.name.indexOf('data-st-') === 0) s.tokens[a.name.slice(8)] = a.value;
    });
    if (s.style) s.tokens.radio = s.radius;
  };

  /* ================================================== textos de muestra == */
  // Banco minimo, por si falta js/banco.js. El de verdad lo sustituye entero.
  WB.bank = {
    secciones: ['Internacional', 'Nacional', 'Economía', 'Sociedad', 'Cultura', 'Deportes', 'Opinión'],
    noticias: [
      { sec: 'Ciudad', tit: 'El puerto abre al paseo sus últimos muelles de carga', sum: 'El pleno aprueba por dos votos un plan que llevaba once años en un cajón', txt: ['El pleno municipal aprobó anoche el plan que convierte en paseo los tres últimos muelles de carga del puerto viejo. La votación, aplazada dos veces este otoño, salió adelante por dos votos de diferencia.', 'Las obras empezarán en primavera y durarán cuatro años. El proyecto reserva la mitad de la superficie a zonas verdes y mantiene en pie las dos grúas históricas del muelle de Levante.', 'Los vecinos del barrio marinero, que reclamaban la reforma desde hace una década, pidieron ayer que el calendario se cumpla esta vez.'], firma: 'Clara Ibarrola', lugar: 'Portalba' },
      { sec: 'Economía', tit: 'Los alquileres frenan su subida por primera vez en seis años', sum: 'El precio medio de los contratos nuevos creció un 0,4% en octubre', txt: ['El precio medio de los contratos firmados en octubre creció un 0,4%, la menor variación desde que existe el registro público.', 'Las capitales de la costa siguen por encima de la media, pero también allí el ritmo se ha reducido a la mitad en un año.'], firma: 'Irene Solbes', lugar: 'Villanueva del Mar' },
      { sec: 'Sociedad', tit: 'Las escuelas rurales ganan alumnos por tercer curso seguido', sum: 'Los pueblos de menos de mil habitantes suman 1.840 matrículas nuevas', txt: ['Las aulas de los pueblos de menos de mil habitantes suman 1.840 matrículas nuevas, casi todas de familias llegadas de la ciudad.', 'Los ayuntamientos piden ahora maestros estables y transporte para que el crecimiento no se quede en una moda.'], firma: 'Tomás Arregui', lugar: 'Valdearcos' }
    ],
    opinion: [
      { autor: 'Elvira Santacreu', tit: 'El agua no entiende de lindes', frase: 'Un pacto imperfecto vale más que otra década de pleitos entre vecinos.' },
      { autor: 'Noor Benhamú', tit: 'Lo que no se mide', frase: 'Sin contadores en cada toma, cualquier reparto es un acto de fe.' }
    ],
    breves: [
      { tit: 'La biblioteca central abrirá los domingos', txt: 'El nuevo horario empieza en enero y se mantendrá todo el curso.' },
      { tit: 'El tranvía recupera la parada del mercado', txt: 'Llevaba cerrada desde las obras de la plaza, hace dos años.' },
      { tit: 'Récord de visitantes en el museo del faro', txt: 'Más de 90.000 personas han pasado por sus salas en lo que va de año.' }
    ],
    citas: [{ txt: 'Una ciudad se mide por lo que decide no construir junto al agua', autor: 'Aurora Benimelis, urbanista' }],
    cifras: [{ v: '37 %', l: 'de las familias llegadas al valle tiene hijos en edad escolar' }, { v: '1.840', l: 'matrículas nuevas en escuelas rurales' }, { v: '11 años', l: 'llevaba el plan esperando en un cajón' }, { v: '0,4 %', l: 'subida de los alquileres en octubre' }],
    entrevistas: [{ quien: 'Matilde Arbós', cargo: 'Farera de Punta Cendra', qa: [{ p: '¿Qué se aprende viviendo en un faro?', r: 'A no tener prisa. El mar pasa por delante todos los días y nunca es el mismo.' }, { p: '¿Echa algo de menos?', r: 'El pan del día. Lo demás llega con la lancha de los jueves.' }] }],
    cronologias: [{ tit: 'Once años de un plan', hitos: [{ f: '2015', t: 'El primer proyecto se presenta y se guarda.' }, { f: '2021', t: 'Los vecinos reúnen cuatro mil firmas.' }, { f: '2026', t: 'El pleno lo aprueba por dos votos.' }] }],
    rosa: [{ tit: 'La boda del año se celebra a puerta cerrada', sum: 'Trescientos invitados y ni una sola fotografía', txt: ['La cantante Vera Lumbier y el cocinero Íñigo Salvatierra se casaron el sábado en una finca de la sierra ante trescientos invitados que dejaron el teléfono en la entrada.'] }],
    deportes: [{ tit: 'El Atlético Portalba remonta en el descuento', sum: 'Dos goles en cuatro minutos dan la vuelta al derbi', txt: ['El equipo local perdía por un gol a falta de cinco minutos y acabó ganando con dos tantos en el descuento.'], marcador: { local: 'At. Portalba', visit: 'Real Albamar', gl: 2, gv: 1 } }],
    mercados: [{ n: 'Índice Costa 40', v: '8.412,6', d: '+0,8 %' }, { n: 'Bono a diez años', v: '3,12 %', d: '-0,04' }, { n: 'Petróleo', v: '71,30', d: '-1,2 %' }],
    agenda: [{ d: 'Jueves 19', t: 'Concierto de la banda municipal', l: 'Plaza del Reloj' }, { d: 'Sábado 21', t: 'Mercado de libros de viejo', l: 'Paseo del Muelle' }]
  };

  /* ====================================================== componer ======= */

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  function today() {
    var d = new Date();
    return DIAS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear();
  }

  /** Lo que recibe una maqueta para componer la pagina. */
  S.ctx = function (st, name) {
    // cada foto de la pagina, una ilustracion distinta (js/ilustraciones.js); sin ellas, el recuadro de siempre
    var shot = st.n * 5;
    function nextImg() { return WB.scenes ? WB.scenes.url(shot++) : WB.PLACEHOLDER; }
    var e = WB.esc;
    var cursor = {};
    var c = {
      st: st, t: st.t, esc: e, uid: WB.uid,
      title: e(name),
      mast: e(st.mast),
      fecha: today(),
      footer: WB.PARTS.footer.html(),
      story: WB.npStory,
      /** n elementos del banco, sin repetir dentro de la pagina; cada estilo empieza en un sitio distinto. */
      take: function (kind, n) {
        var arr = WB.bank[kind] || [];
        if (!arr.length) return [];
        if (cursor[kind] === undefined) cursor[kind] = (st.n * 7) % arr.length;
        var out = [];
        for (var i = 0; i < n; i++) { out.push(arr[cursor[kind] % arr.length]); cursor[kind]++; }
        return out;
      },
      one: function (kind) { return c.take(kind, 1)[0] || {}; },
      fig: function (pie, credito, cls) {
        var img = nextImg();
        return '<figure class="media-figure' + (cls ? ' ' + cls : '') + '" data-lightbox-src="' + img + '" data-lightbox-caption="">' +
          '<img src="' + img + '" alt="" loading="lazy" />' +
          '<figcaption class="media-figcaption"><span>' + e(pie || 'Pie de foto') + '</span><span class="license-tag">' + e(credito || 'Archivo') + '</span></figcaption></figure>';
      },
      ps: function (arr, n) {
        return (arr || []).slice(0, n || 99).map(function (p) { return '<p>' + e(p) + '</p>'; }).join('');
      },
      nameplate: function (izq, der) {
        return '<div class="np-nameplate"><h2 class="np-nameplate-name">' + c.mast + '</h2><div class="np-nameplate-line"><span>' +
          e(izq || 'Edición nacional') + '</span><span>' + e(c.fecha) + '</span><span>' + e(der || 'Año I · Número 1') + '</span></div></div>';
      },
      nav: function (n) {
        return '<nav class="np-nav">' + (WB.bank.secciones || []).slice(0, n || 7).map(function (s) { return '<a href="#">' + e(s) + '</a>'; }).join('') + '</nav>';
      },
      section: function (prefijo, html, cls) {
        return '<section class="article-section' + (cls ? ' ' + cls : '') + '" id="' + prefijo + '-' + WB.uid() + '">' + html + '</section>';
      },
      wrap: function (sections) {
        return '<main class="article-wrapper no-toc np-wide"><article class="article-content">' + sections + '</article></main>' + c.footer;
      }
    };
    Object.defineProperty(c, 'IMG', { get: nextImg, enumerable: true });
    return c;
  };

  /** HTML de una pagina nueva con ese estilo. */
  /** Retocar la pagina compuesta: retratos para la opinion y la foto ampliada igual que la foto. */
  function finish(html) {
    if (!WB.scenes) return html;
    var who = 0;
    html = html.replace(/(<img[^>]*class="np-opinion-photo"[^>]*src=")[^"]*/g, function (m, a) { return a + WB.scenes.portrait(who++); });
    html = html.replace(/(<img[^>]*src=")[^"]*("[^>]*class="np-opinion-photo")/g, function (m, a, b) { return a + WB.scenes.portrait(who++) + b; });
    return html.replace(/data-lightbox-src="([^"]*)"([^>]*>s*<img[^>]*?ssrc=")([^"]*)"/g, function (m, big, mid, src) { return 'data-lightbox-src="' + src + '"' + mid + src + '"'; });
  }

  S.build = function (st, name) {
    var c = S.ctx(st, name);
    var l = S.layouts[st.maqueta] || S.layoutList[0];
    if (l) return finish(l.build(c));
    // sin ninguna maqueta instalada: una portada minima, para no quedarse en blanco
    var lead = c.one('noticias');
    return c.wrap(
      c.section('portada', c.nameplate() + c.nav(6) + '<div class="np-grid rules">' +
        c.story(8, '<span class="np-tag">' + c.esc(lead.sec || 'Portada') + '</span><h2 class="np-title np-xl">' + c.title + '</h2><p class="np-deck">' + c.esc(lead.sum || '') + '</p>' + c.fig() + c.ps(lead.txt, 2)) +
        c.story(4, c.take('noticias', 2).map(function (n) { return '<h3 class="np-title np-md">' + c.esc(n.tit) + '</h3>' + c.ps(n.txt, 1); }).join('')) +
        '</div>') +
      c.section('mas', '<div class="np-briefs">' + c.take('breves', 3).map(function (b) { return '<div class="np-brief"><h4>' + c.esc(b.tit) + '</h4><p>' + c.esc(b.txt) + '</p></div>'; }).join('') + '</div>'));
  };

  /* ============================================== miniatura del estilo === */

  /** Dibujo pequeño de la ficha: papel, cabecera, titulares y columnas. */
  S.thumb = function (st) {
    var p = S.palette(st.c).light;
    function el(cls, css) { var n = document.createElement('i'); n.className = cls; if (css) n.style.cssText = css; return n; }
    var box = document.createElement('div');
    box.className = 'st-thumb st-cab-' + st.t.cab + ' st-fil-' + st.t.filetes + ' st-alin-' + st.t.alin;
    box.style.background = p.bgPrimary;
    box.style.setProperty('--ink', p.textPrimary);
    box.style.setProperty('--ac', p.accent);
    box.style.setProperty('--mu', p.textMuted);
    box.style.setProperty('--bd', p.border);
    var head = document.createElement('div');
    head.className = 'st-thumb-head';
    var name = document.createElement('b');
    name.textContent = st.mast;
    name.style.fontFamily = st.t.cab === 'gotica' ? "'UnifrakturMaguntia', serif" : WB.fontStack(st.cabFont || st.display);
    head.appendChild(name);
    box.appendChild(head);
    var body = document.createElement('div');
    body.className = 'st-thumb-body';
    var main = document.createElement('div');
    main.className = 'st-thumb-main';
    main.appendChild(el('st-tag'));
    main.appendChild(el('st-h', 'width:94%'));
    main.appendChild(el('st-h', 'width:70%'));
    var pic = el('st-pic');
    if (st.t.foto === 'bn') pic.style.filter = 'grayscale(1)';
    main.appendChild(pic);
    body.appendChild(main);
    var side = document.createElement('div');
    side.className = 'st-thumb-side';
    for (var i = 0; i < 6; i++) side.appendChild(el(i % 3 === 0 ? 'st-h2' : 'st-l', 'width:' + (i % 3 === 0 ? 86 : 100 - (i * 9) % 30) + '%'));
    body.appendChild(side);
    box.appendChild(body);
    return box;
  };
})();
