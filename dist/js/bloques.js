/* ==========================================================================
   weBlogger - catalogo: tipos de bloque, elementos que se arrastran a la
   pagina, fuentes, paletas, idiomas y partes fijas de la pagina.
   Aqui solo hay datos; quien los usa es editor.js y paneles.js.
   ========================================================================== */
(function () {
  'use strict';

  WB.uid = function () { return Math.random().toString(36).slice(2, 7); };

  WB.esc = function (s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  /** Logotipo de BitxoSOFT: BITXO fino, SOFT (c) en negrita dorada y el año. */
  WB.BITXO_URL = 'https://www.canalinformatika.es/bitxosoft/index.php';
  WB.bitxoLogo = function () {
    return '<span class="bitxo-brand bitxo-logo">BITXO<b>SOFT (c)</b> ' + new Date().getFullYear() + '</span>';
  };

  /** Imagen de relleno: se ve hasta que el usuario pone la suya. */
  WB.PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9d4cb"/><stop offset="1" stop-color="#b9b2a6"/></linearGradient></defs>' +
    '<rect width="1200" height="700" fill="url(#g)"/>' +
    '<g fill="none" stroke="#7a7267" stroke-width="6"><rect x="470" y="230" width="260" height="190" rx="10"/><circle cx="545" cy="295" r="22"/><path d="M470 390l80-62 62 46 46-32 72 56"/></g>' +
    '<text x="600" y="480" font-family="sans-serif" font-size="30" fill="#6b645a" text-anchor="middle">Haz clic para elegir la imagen</text></svg>');

  /* ======================================================== tipos ======== */
  // kind: part (parte fija de la pagina) · section · content (se mueve entre
  // huecos) · item (hijo de una rejilla) · text (texto suelto)
  WB.TYPES = [
    { sel: '.site-header', name: 'Cabecera', kind: 'part' },
    { sel: '.hero', name: 'Portada', kind: 'part' },
    { sel: '.stats-strip', name: 'Tira de datos', kind: 'part' },
    { sel: '.toc-sidebar', name: 'Índice', kind: 'part' },
    { sel: '.site-footer', name: 'Pie de página', kind: 'part' },
    { sel: '.article-section', name: 'Sección', kind: 'section' },

    { sel: '.hero-frame', name: 'Imagen de portada', kind: 'fixed', image: true },
    { sel: '.media-figure', name: 'Imagen', kind: 'content', image: true },
    { sel: '.gallery-item', name: 'Foto de la galería', kind: 'item', image: true },
    { sel: '.stat-card', name: 'Dato', kind: 'item' },
    { sel: '.info-card', name: 'Tarjeta', kind: 'item' },
    { sel: '.timeline-item', name: 'Hito', kind: 'item' },
    { sel: '.spec-pill-card', name: 'Ficha', kind: 'item' },
    { sel: '.wb-col', name: 'Columna', kind: 'item' },
    { sel: '.wb-acc-item', name: 'Desplegable', kind: 'item' },
    { sel: '.hero-meta > span', name: 'Dato de portada', kind: 'item' },
    { sel: '.nav-links > a', name: 'Enlace del menú', kind: 'item' },
    { sel: '.toc-list > li', name: 'Entrada del índice', kind: 'item' },

    { sel: '.stats-grid', name: 'Datos', kind: 'content', grid: '.stat-card' },
    { sel: '.info-cards', name: 'Tarjetas', kind: 'content', grid: '.info-card' },
    { sel: '.timeline', name: 'Cronología', kind: 'content', grid: '.timeline-item' },
    { sel: '.ganxet-specs', name: 'Fichas', kind: 'content', grid: '.spec-pill-card' },
    { sel: '.gallery-grid', name: 'Galería', kind: 'content', grid: '.gallery-item' },
    { sel: '.editorial-quote', name: 'Cita', kind: 'content' },
    { sel: '.wb-cols', name: 'Columnas', kind: 'content', grid: '.wb-col' },
    { sel: '.wb-flow', name: 'Texto en columnas', kind: 'content' },
    { sel: '.wb-callout', name: 'Caja destacada', kind: 'content' },
    { sel: '.wb-window', name: 'Ventana', kind: 'content' },
    { sel: '.wb-modal-wrap', name: 'Ventana modal', kind: 'content' },
    { sel: '.wb-tabs', name: 'Pestañas', kind: 'content' },
    { sel: '.wb-acc', name: 'Acordeón', kind: 'content', grid: '.wb-acc-item' },
    { sel: '.wb-art', name: 'Texto artístico', kind: 'content' },
    { sel: '.wb-table-wrap', name: 'Tabla', kind: 'content' },
    { sel: '.wb-video', name: 'Vídeo', kind: 'content' },
    { sel: '.wb-embed', name: 'HTML incrustado', kind: 'content' },
    { sel: '.wb-media-text', name: 'Imagen y texto', kind: 'content' },
    { sel: '.wb-btn-row', name: 'Botones', kind: 'content' },
    { sel: '.wb-divider', name: 'Separador', kind: 'content' },
    { sel: '.wb-spacer', name: 'Espacio', kind: 'content' },
    { sel: '.wb-headline', name: 'Titular', kind: 'content' },
    { sel: '.wb-byline', name: 'Firma', kind: 'content' },
    { sel: '.wb-masthead', name: 'Cabecera de diario', kind: 'content' },
    { sel: '.wb-code', name: 'Código', kind: 'content' },
    { sel: '.np-grid', name: 'Rejilla de portada', kind: 'content', grid: '.np-story' },
    { sel: '.np-story', name: 'Pieza', kind: 'item' },
    { sel: '.np-between-fig', name: 'Imagen central', kind: 'fixed', image: true },
    { sel: '.np-between > .np-col', name: 'Columna de texto', kind: 'fixed' },
    { sel: '.np-between', name: 'Imagen entre columnas', kind: 'content' },
    { sel: '.np-cover', name: 'Fotonoticia', kind: 'content', image: true },
    { sel: '.np-box', name: 'Despiece', kind: 'content' },
    { sel: '.np-brief', name: 'Breve', kind: 'item' },
    { sel: '.np-briefs', name: 'Breves', kind: 'content', grid: '.np-brief' },
    { sel: '.np-ranking', name: 'Lo más leído', kind: 'content' },
    { sel: '.np-opinion', name: 'Columna de opinión', kind: 'content' },
    { sel: '.np-ticker', name: 'Última hora', kind: 'content' },
    { sel: '.np-nav', name: 'Secciones', kind: 'content' },
    { sel: '.np-nameplate', name: 'Cabecera del diario', kind: 'content' },
    { sel: '.np-tag', name: 'Etiqueta', kind: 'text' },
    { sel: '.wb-btn', name: 'Botón', kind: 'text' },
    { sel: '.section-kicker', name: 'Antetítulo', kind: 'text' },
    { sel: '.hero-badge', name: 'Etiqueta', kind: 'text' },
    { sel: 'h1', name: 'Titular principal', kind: 'text' },
    { sel: 'h2', name: 'Título', kind: 'text' },
    { sel: 'h3', name: 'Subtítulo', kind: 'text' },
    { sel: 'h4', name: 'Título menor', kind: 'text' },
    { sel: 'p', name: 'Párrafo', kind: 'text' },
    { sel: 'ul', name: 'Lista', kind: 'text' },
    { sel: 'ol', name: 'Lista numerada', kind: 'text' },
    { sel: 'img:not(.media-figure img):not(.hero-frame img):not(.gallery-item img)', name: 'Imagen', kind: 'text', image: true }
  ];

  WB.ALL_SEL = WB.TYPES.map(function (t) { return t.sel; }).join(',');

  WB.typeOf = function (el) {
    if (!el || !el.matches) return null;
    for (var i = 0; i < WB.TYPES.length; i++) if (el.matches(WB.TYPES[i].sel)) return WB.TYPES[i];
    return null;
  };

  /** Elementos cuyo texto se escribe directamente sobre la pagina. */
  WB.TEXT_SEL = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'cite', 'summary', 'td', 'th', 'pre.wb-code',
    'figcaption > span', '.hero-badge', '.hero-meta > span', '.stat-value', '.stat-label',
    '.section-kicker', '.timeline-year', '.gallery-item-caption', '.toc-title', '.toc-list a',
    '.nav-links a', '.brand-emblem', '.brand-title', '.brand-sub', '.license-tag',
    '.footer-signature > span', '.spec-pill-card > strong', '.spec-pill-card > span',
    '.wb-window-title', '.wb-btn', '.wb-tab', '.wb-callout-icon', '.wb-byline-avatar',
    '.wb-byline-name', '.wb-byline-meta', '.wb-masthead-line > span',
    '.np-tag', '.np-ticker > span', '.np-nameplate-line > span', '.np-nav > a', '.np-opinion-author', '[data-i18n]'
  ].join(',');

  /* ===================================================== catalogo ======== */

  var P = 'Escribe aquí el texto. Haz clic y empieza a teclear: Intro crea un párrafo nuevo y Mayús+Intro un salto de línea.';
  var IMG = WB.PLACEHOLDER;

  function figure(caption) {
    return '<figure class="media-figure" data-lightbox-src="' + IMG + '" data-lightbox-caption="">' +
      '<img src="' + IMG + '" alt="" loading="lazy" />' +
      '<figcaption class="media-figcaption"><span>' + (caption || 'Pie de foto') + '</span><span class="license-tag">Autor / licencia</span></figcaption></figure>';
  }

  function galleryItem(n) {
    return '<div class="gallery-item" data-lightbox-src="' + IMG + '" data-lightbox-caption="">' +
      '<img src="' + IMG + '" alt="" loading="lazy" /><div class="gallery-item-caption">Foto ' + n + '</div></div>';
  }

  WB.CATALOG = [
    {
      cat: 'Estructura', items: [
        { id: 'section', name: 'Sección', icon: 'ic-section', kind: 'section', html: function (u) { return '<section class="article-section reveal" id="seccion-' + u + '"><span class="section-kicker">Antetítulo</span><h2>Título de la sección</h2><p>' + P + '</p></section>'; } },
        { id: 'cols2', name: '2 columnas', icon: 'ic-columns', html: function () { return '<div class="wb-cols" style="--cols:2"><div class="wb-col" data-wb-slot><p>Primera columna.</p></div><div class="wb-col" data-wb-slot><p>Segunda columna.</p></div></div>'; } },
        { id: 'cols3', name: '3 columnas', icon: 'ic-columns3', html: function () { return '<div class="wb-cols" style="--cols:3"><div class="wb-col" data-wb-slot><p>Columna uno.</p></div><div class="wb-col" data-wb-slot><p>Columna dos.</p></div><div class="wb-col" data-wb-slot><p>Columna tres.</p></div></div>'; } },
        { id: 'flow', name: 'Texto de diario', icon: 'ic-flow', html: function () { return '<div class="wb-flow" data-wb-slot><p>Este texto fluye de una columna a la siguiente, como en un periódico. Escribe con normalidad y el reparto se hace solo.</p><p>Cambia el número de columnas en Propiedades.</p></div>'; } },
        { id: 'window', name: 'Ventana', icon: 'ic-window', html: function () { return '<div class="wb-window"><div class="wb-window-bar"><span class="wb-window-dots"><i></i><i></i><i></i></span><span class="wb-window-title">Título de la ventana</span></div><div class="wb-window-body" data-wb-slot><p>Contenido de la ventana. Puedes arrastrar dentro cualquier otro elemento.</p></div></div>'; } },
        { id: 'modal', name: 'Ventana modal', icon: 'ic-modal', html: function (u) { return '<div class="wb-modal-wrap wb-edit-open"><a class="wb-btn" href="#" role="button" data-wb-modal-open="modal-' + u + '">Abrir ventana</a><div class="wb-modal" id="modal-' + u + '" role="dialog" aria-modal="true"><div class="wb-modal-box"><div class="wb-modal-head"><h3 class="wb-modal-title">Título del modal</h3><button type="button" class="wb-modal-close" aria-label="Cerrar">&times;</button></div><div class="wb-modal-body" data-wb-slot><p>Este contenido aparece al pulsar el botón. Arrastra aquí textos, imágenes o lo que necesites.</p></div></div></div></div>'; } },
        { id: 'callout', name: 'Caja destacada', icon: 'ic-box', html: function () { return '<div class="wb-callout" data-tone="info"><div class="wb-callout-icon">💡</div><div class="wb-callout-body" data-wb-slot><p><strong>¿Sabías que…?</strong> Usa esta caja para un dato, un aviso o un resumen.</p></div></div>'; } },
        { id: 'tabs', name: 'Pestañas', icon: 'ic-tabs', html: function () { return '<div class="wb-tabs"><div class="wb-tab-bar" role="tablist"><a class="wb-tab is-active" href="#" role="tab">Primera</a><a class="wb-tab" href="#" role="tab">Segunda</a><a class="wb-tab" href="#" role="tab">Tercera</a></div><div class="wb-tab-panel is-active" data-wb-slot><p>Contenido de la primera pestaña.</p></div><div class="wb-tab-panel" data-wb-slot><p>Contenido de la segunda pestaña.</p></div><div class="wb-tab-panel" data-wb-slot><p>Contenido de la tercera pestaña.</p></div></div>'; } },
        { id: 'acc', name: 'Acordeón', icon: 'ic-accordion', html: function () { return '<div class="wb-acc"><details class="wb-acc-item" open><summary>Primera pregunta</summary><div class="wb-acc-body" data-wb-slot><p>Respuesta o contenido desplegable.</p></div></details><details class="wb-acc-item"><summary>Segunda pregunta</summary><div class="wb-acc-body" data-wb-slot><p>Otra respuesta.</p></div></details></div>'; } },
        { id: 'divider', name: 'Separador', icon: 'ic-divider', html: function () { return '<div class="wb-divider" data-style="line"></div>'; } },
        { id: 'spacer', name: 'Espacio', icon: 'ic-spacer', html: function () { return '<div class="wb-spacer" style="height:3rem"></div>'; } }
      ]
    },
    {
      cat: 'Texto', items: [
        { id: 'headline', name: 'Titular', icon: 'ic-headline', html: function () { return '<div class="wb-headline"><span class="section-kicker">Sección</span><h2 class="wb-headline-title">Titular de la noticia en una o dos líneas</h2><p class="wb-headline-deck">Entradilla: una frase que resume lo esencial y anima a seguir leyendo.</p></div>'; } },
        { id: 'h2', name: 'Título', icon: 'ic-h2', html: function () { return '<h2>Título</h2>'; } },
        { id: 'h3', name: 'Subtítulo', icon: 'ic-h3', html: function () { return '<h3>Subtítulo</h3>'; } },
        { id: 'kicker', name: 'Antetítulo', icon: 'ic-kicker', html: function () { return '<span class="section-kicker">Antetítulo</span>'; } },
        { id: 'p', name: 'Párrafo', icon: 'ic-para', html: function () { return '<p>' + P + '</p>'; } },
        { id: 'dropcap', name: 'Letra capital', icon: 'ic-dropcap', html: function () { return '<p class="lead-dropcap">Este párrafo empieza con una letra capital, como los reportajes de las revistas. Escribe encima para cambiarlo.</p>'; } },
        { id: 'lead', name: 'Entradilla', icon: 'ic-lead', html: function () { return '<p class="wb-lead">Entradilla: un párrafo algo mayor que presenta el tema.</p>'; } },
        { id: 'quote', name: 'Cita', icon: 'ic-quote', html: function () { return '<blockquote class="editorial-quote"><p>«Escribe aquí la cita textual.»</p><cite>Quién lo dijo</cite></blockquote>'; } },
        { id: 'pull', name: 'Cita destacada', icon: 'ic-pull', html: function () { return '<p class="wb-pull">Una frase grande que rompe la página y llama la atención</p>'; } },
        { id: 'ul', name: 'Lista', icon: 'ic-list', html: function () { return '<ul><li>Primer punto</li><li>Segundo punto</li><li>Tercer punto</li></ul>'; } },
        { id: 'ol', name: 'Lista numerada', icon: 'ic-list-num', html: function () { return '<ol><li>Primer paso</li><li>Segundo paso</li><li>Tercer paso</li></ol>'; } },
        { id: 'byline', name: 'Firma', icon: 'ic-byline', html: function () { return '<div class="wb-byline"><span class="wb-byline-avatar">AB</span><div><strong class="wb-byline-name">Nombre de quien firma</strong><span class="wb-byline-meta">17 de noviembre de 2026 · 5 min de lectura</span></div></div>'; } },
        { id: 'art', name: 'Texto artístico', icon: 'ic-sparkle', html: function (u) { return '<div class="wb-art" data-art="' + WB.esc(JSON.stringify(Object.assign({ uid: u }, WB.ART_PRESETS[0].v))) + '"></div>'; } },
        { id: 'note', name: 'Nota', icon: 'ic-note', html: function () { return '<p class="wb-note">Nota aclaratoria o fuente, en letra pequeña.</p>'; } },
        { id: 'code', name: 'Código', icon: 'ic-terminal', html: function () { return '<pre class="wb-code">texto con ancho fijo</pre>'; } },
        { id: 'masthead', name: 'Cabecera diario', icon: 'ic-masthead', html: function () { return '<div class="wb-masthead"><h2 class="wb-masthead-name">El Diario</h2><div class="wb-masthead-line"><span>Portalba</span><span>Martes, 17 de noviembre de 2026</span><span>Número 1</span></div></div>'; } }
      ]
    },
    {
      cat: 'Imagen y medios', items: [
        { id: 'image', name: 'Imagen', icon: 'ic-image', html: function () { return figure(); } },
        { id: 'mediatext', name: 'Imagen y texto', icon: 'ic-mediatext', html: function () { return '<div class="wb-media-text">' + figure() + '<div class="wb-media-text-body" data-wb-slot><h3>Título junto a la imagen</h3><p>Texto que acompaña a la fotografía.</p></div></div>'; } },
        { id: 'gallery', name: 'Galería', icon: 'ic-gallery', html: function () { return '<div class="gallery-grid">' + galleryItem(1) + galleryItem(2) + galleryItem(3) + '</div>'; } },
        { id: 'video', name: 'Vídeo', icon: 'ic-video', html: function () { return '<div class="wb-video"><div class="wb-video-ph">Pega la dirección del vídeo en el panel de Propiedades</div></div>'; } },
        { id: 'embed', name: 'HTML', icon: 'ic-code', html: function () { return '<div class="wb-embed"><p class="wb-note">Bloque de HTML: escribe el código en Propiedades.</p></div>'; } }
      ]
    },
    {
      cat: 'Datos y cajas', items: [
        { id: 'cards', name: 'Tarjetas', icon: 'ic-cards', html: function () { return '<div class="info-cards"><div class="info-card"><h3>Primera tarjeta</h3><p>Texto breve de la tarjeta.</p></div><div class="info-card"><h3>Segunda tarjeta</h3><p>Texto breve de la tarjeta.</p></div></div>'; } },
        { id: 'specs', name: 'Fichas', icon: 'ic-specs', html: function () { return '<div class="ganxet-specs"><div class="spec-pill-card"><strong>Dato</strong><span>Valor o descripción</span></div><div class="spec-pill-card"><strong>Dato</strong><span>Valor o descripción</span></div><div class="spec-pill-card"><strong>Dato</strong><span>Valor o descripción</span></div></div>'; } },
        { id: 'timeline', name: 'Cronología', icon: 'ic-timeline', html: function () { return '<div class="timeline"><div class="timeline-item"><div class="timeline-year">Año · Hecho</div><p>Qué ocurrió.</p></div><div class="timeline-item"><div class="timeline-year">Año · Hecho</div><p>Qué ocurrió.</p></div><div class="timeline-item"><div class="timeline-year">Año · Hecho</div><p>Qué ocurrió.</p></div></div>'; } },
        { id: 'stats', name: 'Cifras', icon: 'ic-stats', html: function () { return '<div class="stats-grid"><div class="stat-card"><div class="stat-value">100</div><div class="stat-label">Qué mide</div></div><div class="stat-card"><div class="stat-value">2026</div><div class="stat-label">Qué mide</div></div><div class="stat-card"><div class="stat-value">75 %</div><div class="stat-label">Qué mide</div></div><div class="stat-card"><div class="stat-value">12</div><div class="stat-label">Qué mide</div></div></div>'; } },
        { id: 'table', name: 'Tabla', icon: 'ic-table', html: function () { return '<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Concepto</th><th>Dato</th><th>Notas</th></tr></thead><tbody><tr><td>Fila 1</td><td>—</td><td>—</td></tr><tr><td>Fila 2</td><td>—</td><td>—</td></tr><tr><td>Fila 3</td><td>—</td><td>—</td></tr></tbody></table></div>'; } },
        { id: 'button', name: 'Botón', icon: 'ic-button', html: function () { return '<div class="wb-btn-row"><a class="wb-btn" href="#">Texto del botón</a></div>'; } }
      ]
    }
  ];

  /* ---- kit de diario ---- */
  var LOREM = 'Texto de la noticia. Sustitúyelo por el tuyo: quién, qué, cuándo, dónde y por qué, de lo más importante a lo menos.';

  function story(span, inner) {
    return '<div class="np-story" data-wb-slot style="--span:' + span + '">' + inner + '</div>';
  }
  WB.npStory = story;

  WB.CATALOG.push({
    cat: 'Diario', items: [
      { id: 'np-nameplate', name: 'Cabecera', icon: 'ic-masthead', html: function () { return '<div class="np-nameplate"><h2 class="np-nameplate-name">El Diario</h2><div class="np-nameplate-line"><span>Edición nacional</span><span>Martes, 17 de noviembre de 2026</span><span>Año I · Número 1</span></div></div>'; } },
      { id: 'np-nav', name: 'Secciones', icon: 'ic-kicker', html: function () { return '<nav class="np-nav"><a href="#">Internacional</a><a href="#">Opinión</a><a href="#">Economía</a><a href="#">Cultura</a><a href="#">Deportes</a></nav>'; } },
      { id: 'np-ticker', name: 'Última hora', icon: 'ic-divider', html: function () { return '<div class="np-ticker"><span class="np-tag">Última hora</span><span>Escribe aquí el titular urgente del momento</span></div>'; } },
      { id: 'np-grid', name: 'Rejilla portada', icon: 'ic-grid', html: function () {
        return '<div class="np-grid rules">' +
          story(8, '<span class="np-tag">Portada</span><h2 class="np-title np-lg">La noticia principal abre la página a cuatro columnas</h2><p class="np-deck">Un sumario breve que amplía el titular sin repetirlo.</p><p>' + LOREM + '</p>') +
          story(4, '<h3 class="np-title np-md">Segunda noticia del día</h3><p>' + LOREM + '</p>') +
          story(4, '<h3 class="np-title np-sm">Tercera noticia</h3><p>Un par de líneas que la resumen.</p>') +
          story(4, '<h3 class="np-title np-sm">Cuarta noticia</h3><p>Un par de líneas que la resumen.</p>') +
          story(4, '<h3 class="np-title np-sm">Quinta noticia</h3><p>Un par de líneas que la resumen.</p>') +
          '</div>';
      } },
      { id: 'np-headline', name: 'Titular a toda página', icon: 'ic-headline', html: function () { return '<div class="wb-headline"><span class="np-tag">Sección</span><h2 class="np-title np-xl">Un titular grande que cruza la página de lado a lado</h2><p class="np-deck">La entradilla resume la noticia en dos o tres líneas y da paso al texto.</p></div>'; } },
      { id: 'np-between', name: 'Imagen entre columnas', icon: 'ic-mediatext', html: function () {
        var txt = '<p>El texto de esta columna rodea la fotografía, que queda encajada entre las dos. Escribe con normalidad: las líneas se acortan solas al llegar a la altura de la imagen y vuelven a su ancho cuando la dejan atrás.</p><p>Es el recurso clásico de las revistas y los dominicales para una foto pequeña, un retrato o un gráfico que acompaña al texto sin partirlo.</p><p>En Propiedades puedes cambiar el tamaño de la imagen y la altura a la que se coloca.</p>';
        return '<div class="np-between"><div class="np-col" data-wb-slot>' + txt + '</div><div class="np-col" data-wb-slot>' + txt + '</div>' +
          '<figure class="np-between-fig" data-lightbox-src="' + IMG + '" data-lightbox-caption=""><img src="' + IMG + '" alt="" loading="lazy" /><figcaption><span>Pie de la imagen</span></figcaption></figure></div>';
      } },
      { id: 'np-cover', name: 'Fotonoticia', icon: 'ic-image', html: function () { return '<div class="np-cover" data-lightbox-src="' + IMG + '" data-lightbox-caption=""><img src="' + IMG + '" alt="" loading="lazy" /><div class="np-cover-text"><span class="np-tag">Reportaje</span><h2 class="np-title np-lg">El titular va escrito sobre la fotografía</h2><p>Una línea que sitúa la imagen y lleva al texto.</p></div></div>'; } },
      { id: 'np-box', name: 'Despiece', icon: 'ic-box', html: function () { return '<div class="np-box" data-wb-slot><h3 class="np-title np-sm">Las claves</h3><ul><li>Primer dato que conviene saber</li><li>Segundo dato</li><li>Tercer dato</li></ul></div>'; } },
      { id: 'np-briefs', name: 'Breves', icon: 'ic-para', html: function () {
        var b = '';
        ['Primer breve', 'Segundo breve', 'Tercer breve'].forEach(function (t) { b += '<div class="np-brief"><h4>' + t + '</h4><p>Dos líneas con lo esencial de la noticia.</p></div>'; });
        return '<div class="np-briefs">' + b + '</div>';
      } },
      { id: 'np-ranking', name: 'Lo más leído', icon: 'ic-list-num', html: function () { return '<ol class="np-ranking"><li>La noticia que más se está leyendo</li><li>La segunda más leída</li><li>La tercera</li><li>La cuarta</li><li>La quinta</li></ol>'; } },
      { id: 'np-opinion', name: 'Opinión', icon: 'ic-byline', html: function () { return '<div class="np-opinion"><img class="np-opinion-photo" src="' + IMG + '" alt="" /><div><span class="np-opinion-author">Nombre del columnista</span><h3>El título de la columna, en cursiva</h3><p>Una frase que resume la tesis del artículo de opinión.</p></div></div>'; } },
      { id: 'np-tag', name: 'Etiqueta', icon: 'ic-kicker', html: function () { return '<span class="np-tag">Sección</span>'; } }
    ]
  });

  /* ---- formatos de diario ---- */
  // Cada formato vive en su propio archivo (js/formatos/<id>.js y
  // plantilla/formatos/<id>.css) y se da de alta con WB.addFormat.
  WB.FORMATS = {};
  WB.addFormat = function (f) {
    WB.FORMATS[f.id] = f;
    var p = { name: f.name, accent2: f.palette.accent2, light: {}, dark: {} };
    PKEYS.forEach(function (k, i) { p.light[k] = f.palette.light[i]; p.dark[k] = f.palette.dark[i]; });
    WB.PALETTES['fmt-' + f.id] = p;
  };

  WB.catalogItem = function (id) {
    for (var c = 0; c < WB.CATALOG.length; c++) {
      var items = WB.CATALOG[c].items;
      for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    }
    return null;
  };

  /* ======================================================= fuentes ======= */
  // `g` es la especificacion para Google Fonts: solo pesos que existen de
  // verdad, porque un peso inexistente hace fallar la hoja entera.
  WB.FONTS = [
    { name: 'Plus Jakarta Sans', cat: 'sans', g: 'Plus+Jakarta+Sans:wght@400;500;600;700' },
    { name: 'Inter', cat: 'sans', g: 'Inter:wght@400;500;600;700' },
    { name: 'Roboto', cat: 'sans', g: 'Roboto:ital,wght@0,400;0,500;0,700;1,400' },
    { name: 'Open Sans', cat: 'sans', g: 'Open+Sans:ital,wght@0,400;0,600;0,700;1,400' },
    { name: 'Montserrat', cat: 'sans', g: 'Montserrat:wght@400;500;600;700;800' },
    { name: 'Poppins', cat: 'sans', g: 'Poppins:wght@400;500;600;700' },
    { name: 'Raleway', cat: 'sans', g: 'Raleway:wght@400;600;700' },
    { name: 'Space Grotesk', cat: 'sans', g: 'Space+Grotesk:wght@400;500;700' },
    { name: 'Cormorant Garamond', cat: 'serif', g: 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600' },
    { name: 'Playfair Display', cat: 'serif', g: 'Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700' },
    { name: 'Merriweather', cat: 'serif', g: 'Merriweather:ital,wght@0,400;0,700;1,400;1,700' },
    { name: 'Lora', cat: 'serif', g: 'Lora:ital,wght@0,400;0,600;0,700;1,400;1,600' },
    { name: 'Libre Baskerville', cat: 'serif', g: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400' },
    { name: 'EB Garamond', cat: 'serif', g: 'EB+Garamond:ital,wght@0,400;0,600;0,700;1,400' },
    { name: 'Source Serif 4', cat: 'serif', g: 'Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400' },
    { name: 'Old Standard TT', cat: 'serif', g: 'Old+Standard+TT:ital,wght@0,400;0,700;1,400' },
    { name: 'DM Serif Display', cat: 'serif', g: 'DM+Serif+Display:ital@0;1' },
    { name: 'Roboto Slab', cat: 'serif', g: 'Roboto+Slab:wght@400;700' },
    { name: 'Abril Fatface', cat: 'display', g: 'Abril+Fatface' },
    { name: 'Bebas Neue', cat: 'display', g: 'Bebas+Neue' },
    { name: 'Anton', cat: 'display', g: 'Anton' },
    { name: 'Oswald', cat: 'display', g: 'Oswald:wght@400;500;700' },
    { name: 'Archivo Black', cat: 'display', g: 'Archivo+Black' },
    { name: 'UnifrakturMaguntia', cat: 'display', g: 'UnifrakturMaguntia' },
    { name: 'Caveat', cat: 'script', g: 'Caveat:wght@400;700' },
    { name: 'Dancing Script', cat: 'script', g: 'Dancing+Script:wght@400;700' },
    { name: 'Pacifico', cat: 'script', g: 'Pacifico' },
    { name: 'JetBrains Mono', cat: 'mono', g: 'JetBrains+Mono:wght@400;700' }
  ];

  var FALLBACK = { sans: '-apple-system, BlinkMacSystemFont, sans-serif', serif: 'Georgia, serif', display: 'Impact, sans-serif', script: 'cursive', mono: 'Consolas, monospace' };

  WB.fontByName = function (name) {
    for (var i = 0; i < WB.FONTS.length; i++) if (WB.FONTS[i].name === name) return WB.FONTS[i];
    return null;
  };

  /** Valor CSS completo de una fuente del catalogo, con su reserva. */
  WB.fontStack = function (name) {
    var f = WB.fontByName(name);
    return "'" + name + "', " + (f ? FALLBACK[f.cat] : 'sans-serif');
  };

  WB.fontsUrl = function (names) {
    var specs = [];
    names.forEach(function (n) {
      var f = WB.fontByName(n);
      if (f && specs.indexOf(f.g) < 0) specs.push(f.g);
    });
    if (!specs.length) return '';
    return 'https://fonts.googleapis.com/css2?family=' + specs.join('&family=') + '&display=swap';
  };

  /* ======================================================= paletas ======= */

  var PKEYS = ['bgPrimary', 'bgSecondary', 'bgCard', 'textPrimary', 'textSecondary', 'textMuted', 'accent', 'accentHover', 'border'];
  WB.PALETTE_KEYS = PKEYS;
  WB.PALETTE_LABELS = {
    bgPrimary: 'Fondo', bgSecondary: 'Fondo secundario', bgCard: 'Tarjetas', textPrimary: 'Texto principal',
    textSecondary: 'Texto secundario', textMuted: 'Texto apagado', accent: 'Acento', accentHover: 'Acento al pasar', border: 'Bordes'
  };

  function pal(name, light, dark, accent2) {
    var o = { name: name, accent2: accent2, light: {}, dark: {} };
    PKEYS.forEach(function (k, i) { o.light[k] = light[i]; o.dark[k] = dark[i]; });
    return o;
  }

  WB.PALETTES = {
    terracota: pal('Terracota',
      ['#faf8f5', '#f2ede4', '#ffffff', '#1d1b18', '#534d46', '#7a7267', '#b85d19', '#944810', '#e4ddd2'],
      ['#141312', '#1d1b19', '#24211e', '#f4f0ea', '#c7bfb5', '#948b80', '#e68a45', '#f39e5d', '#332f2b'], '#2e7d32'),
    huerta: pal('Huerta',
      ['#f9f8f3', '#eff1e6', '#ffffff', '#1a2118', '#4a5446', '#707b6b', '#3d7a37', '#2d5c28', '#dce2d3'],
      ['#121611', '#1a2018', '#21281f', '#f1f4ee', '#c1cabd', '#8b9686', '#68b85f', '#82ce79', '#2f382c'], '#c99738'),
    mar: pal('Azul marino',
      ['#faf8f5', '#f2ede4', '#ffffff', '#1d1b18', '#534d46', '#7a7267', '#2c6e91', '#1f506b', '#e4ddd2'],
      ['#141312', '#1d1b19', '#24211e', '#f4f0ea', '#c7bfb5', '#948b80', '#5aa9d6', '#7bc0e8', '#332f2b'], '#3b8d56'),
    tinta: pal('Tinta de diario',
      ['#f7f3ea', '#ede7d9', '#fffdf8', '#16130f', '#3f3a33', '#6e675d', '#8a1c1c', '#6b1414', '#d8cfbd'],
      ['#12110f', '#1a1815', '#211f1b', '#f2ede2', '#c9c1b3', '#938a7b', '#e0655d', '#ee857d', '#35312a'], '#b58a2e'),
    vino: pal('Vino',
      ['#faf6f6', '#f1e8e9', '#ffffff', '#1f1719', '#54474a', '#7d6d71', '#8e2343', '#6d1832', '#e6d9dc'],
      ['#151112', '#1e181a', '#261e21', '#f5eef0', '#cbbfc2', '#978a8e', '#e0708f', '#ee8fa9', '#372c30'], '#b9772b'),
    violeta: pal('Violeta',
      ['#f8f7fb', '#edeaf4', '#ffffff', '#1a1822', '#4b4759', '#746f85', '#5b3fa6', '#462f82', '#ddd8ea'],
      ['#121118', '#1a1822', '#211f2b', '#f1eff7', '#c3bfd1', '#8d889e', '#a48cf0', '#bba8f6', '#322e40'], '#d9774b'),
    grafito: pal('Grafito',
      ['#f6f6f6', '#ebebec', '#ffffff', '#16171a', '#474a50', '#73767d', '#1f2937', '#0f172a', '#dcdde0'],
      ['#101113', '#17191c', '#1e2024', '#f1f2f4', '#c2c5ca', '#8b8f96', '#d5dae2', '#ffffff', '#2d3036'], '#6b7280')
  };

  /* ======================================================= idiomas ======= */

  var F = '<svg class="flag-icon" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">';
  WB.LANGS = {
    es: { name: 'Español', flag: F + '<rect width="60" height="40" fill="#AA151B"/><rect y="10" width="60" height="20" fill="#F1BF00"/><circle cx="18" cy="20" r="4" fill="#AA151B"/></svg>' },
    ca: { name: 'Català', flag: F + '<rect width="60" height="40" fill="#FCDD09"/><rect y="4.44" width="60" height="4.44" fill="#DA121A"/><rect y="13.33" width="60" height="4.44" fill="#DA121A"/><rect y="22.22" width="60" height="4.44" fill="#DA121A"/><rect y="31.11" width="60" height="4.44" fill="#DA121A"/></svg>' },
    en: { name: 'English', flag: F + '<rect width="60" height="40" fill="#012169"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" stroke-width="7"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" stroke-width="11"/><path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="6.5"/></svg>' },
    fr: { name: 'Français', flag: F + '<rect width="20" height="40" fill="#0055A4"/><rect x="20" width="20" height="40" fill="#FFFFFF"/><rect x="40" width="20" height="40" fill="#EF4135"/></svg>' },
    de: { name: 'Deutsch', flag: F + '<rect width="60" height="13.4" fill="#000000"/><rect y="13.3" width="60" height="13.4" fill="#DD0000"/><rect y="26.6" width="60" height="13.4" fill="#FFCE00"/></svg>' },
    it: { name: 'Italiano', flag: F + '<rect width="20" height="40" fill="#009246"/><rect x="20" width="20" height="40" fill="#FFFFFF"/><rect x="40" width="20" height="40" fill="#CE2B37"/></svg>' },
    pt: { name: 'Português', flag: F + '<rect width="24" height="40" fill="#006600"/><rect x="24" width="36" height="40" fill="#FF0000"/><circle cx="24" cy="20" r="7" fill="#FFCC00"/></svg>' }
  };

  WB.langButton = function (code, active) {
    var l = WB.LANGS[code] || { name: code, flag: '' };
    return '<button type="button" class="lang-btn' + (active ? ' active' : '') + '" data-lang="' + code + '" title="' + l.name + '">' +
      l.flag + '<span class="lang-label">' + code.toUpperCase() + '</span></button>';
  };

  /* ========================================= partes fijas de la pagina === */

  var MOON = '<svg id="themeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

  WB.PARTS = {
    header: {
      name: 'Cabecera', sel: '.site-header',
      html: function () {
        return '<header class="site-header"><div class="header-inner">' +
          '<a href="#inicio" class="brand"><div class="brand-emblem">B</div><div class="brand-text"><span class="brand-title">MI BLOG</span><span class="brand-sub">Lema o lugar</span></div></a>' +
          '<nav class="nav-links" aria-label="Navegación principal"><a href="#inicio">Inicio</a></nav>' +
          '<div class="header-controls"><div class="lang-switcher" role="group" aria-label="Selector de idioma"></div>' +
          '<button type="button" class="theme-btn" id="themeToggle" aria-label="Cambiar tema claro u oscuro" title="Modo claro / oscuro">' + MOON + '</button></div>' +
          '</div></header>';
      }
    },
    hero: {
      name: 'Portada', sel: '.hero',
      html: function () {
        return '<section class="hero" id="inicio"><div class="hero-container"><div>' +
          '<div class="hero-badge">Etiqueta del artículo</div>' +
          '<h1>El titular de tu artículo va aquí</h1>' +
          '<p class="hero-lead">Entradilla: dos o tres líneas que cuentan de qué trata el artículo y por qué merece la pena leerlo.</p>' +
          '<div class="hero-meta"><span>📍 Lugar</span><span>🗓️ Fecha</span><span>✍️ Autor</span></div></div>' +
          '<div class="hero-visual"><figure class="hero-frame" data-lightbox-src="' + IMG + '" data-lightbox-caption=""><img src="' + IMG + '" alt="" loading="eager" />' +
          '<figcaption class="hero-caption"><span>Pie de la imagen de portada</span><span class="license-tag">Autor / licencia</span></figcaption></figure></div>' +
          '</div></section>';
      }
    },
    stats: {
      name: 'Tira de datos', sel: '.stats-strip',
      html: function () {
        var c = '';
        ['Dato uno', 'Dato dos', 'Dato tres', 'Dato cuatro'].forEach(function (t, i) {
          c += '<div class="stat-card reveal"><div class="stat-value">' + (i + 1) + '</div><div class="stat-label">' + t + '</div></div>';
        });
        return '<div class="stats-strip"><div class="stats-grid">' + c + '</div></div>';
      }
    },
    toc: {
      name: 'Índice lateral', sel: '.toc-sidebar',
      html: function () {
        return '<aside class="toc-sidebar" aria-label="Índice del artículo"><div class="toc-title">En este artículo</div><ul class="toc-list" data-wb-auto></ul></aside>';
      }
    },
    footer: {
      name: 'Pie de página', sel: '.site-footer',
      html: function () {
        return '<footer class="site-footer"><div class="footer-inner">' +
          '<p class="footer-credits-sources">Créditos de las imágenes y fuentes consultadas.</p>' +
          '<a href="' + WB.BITXO_URL + '" target="_blank" rel="noopener noreferrer" class="footer-signature"><span>por</span>' + WB.bitxoLogo() + '</a>' +
          '</div></footer>';
      }
    }
  };

  /* ================================================ texto artistico ====== */

  WB.ART_PRESETS = [
    { name: 'Arco clásico', v: { text: 'Texto artístico', shape: 'arcUp', curve: 38, font: 'Cormorant Garamond', size: 84, weight: 700, spacing: 2, fill: 'var(--accent)', fill2: '', stroke: '', strokeW: 0, depth: 0, depthColor: '#000000', depthAngle: 45, glow: 0, glowColor: '#000000', rx: 0, ry: 0, rz: 0, persp: 800, anim: '' } },
    { name: 'Titular 3D', v: { text: 'TITULAR 3D', shape: 'line', curve: 0, font: 'Anton', size: 96, weight: 400, spacing: 3, fill: '#f4b942', fill2: '#e8590c', stroke: '#3b1d08', strokeW: 2, depth: 12, depthColor: '#3b1d08', depthAngle: 45, glow: 0, glowColor: '#000000', rx: 14, ry: -16, rz: 0, persp: 700, anim: '' } },
    { name: 'Neón', v: { text: 'Abierto', shape: 'line', curve: 0, font: 'Pacifico', size: 90, weight: 400, spacing: 1, fill: '#ffffff', fill2: '', stroke: '#ff4fd8', strokeW: 1.5, depth: 0, depthColor: '#000000', depthAngle: 45, glow: 18, glowColor: '#ff2bd1', rx: 0, ry: 0, rz: -4, persp: 800, anim: 'pulse' } },
    { name: 'Sello circular', v: { text: 'EDICIÓN ESPECIAL · EDICIÓN ESPECIAL · ', shape: 'circle', curve: 0, font: 'Oswald', size: 34, weight: 700, spacing: 4, fill: 'var(--accent)', fill2: '', stroke: '', strokeW: 0, depth: 0, depthColor: '#000000', depthAngle: 45, glow: 0, glowColor: '#000000', rx: 0, ry: 0, rz: -8, persp: 800, anim: '' } },
    { name: 'Onda', v: { text: 'Como las olas del mar', shape: 'wave', curve: 55, font: 'Dancing Script', size: 78, weight: 700, spacing: 1, fill: '#2c6e91', fill2: '#3bb6a6', stroke: '', strokeW: 0, depth: 3, depthColor: '#123247', depthAngle: 60, glow: 0, glowColor: '#000000', rx: 0, ry: 0, rz: 0, persp: 800, anim: 'float' } },
    { name: 'Cómic', v: { text: '¡ZAS!', shape: 'arcDown', curve: 30, font: 'Bebas Neue', size: 130, weight: 400, spacing: 6, fill: '#ffe14d', fill2: '#ff8a1f', stroke: '#111111', strokeW: 4, depth: 10, depthColor: '#111111', depthAngle: 35, glow: 0, glowColor: '#000000', rx: 0, ry: 12, rz: -6, persp: 600, anim: '' } },
    { name: 'Cromo', v: { text: 'CROMADO', shape: 'line', curve: 0, font: 'Archivo Black', size: 92, weight: 400, spacing: 2, fill: '#f5f7fa', fill2: '#7b8794', stroke: '#2b3138', strokeW: 1.5, depth: 6, depthColor: '#2b3138', depthAngle: 90, glow: 6, glowColor: '#9aa5b1', rx: 18, ry: 0, rz: 0, persp: 500, anim: '' } },
    { name: 'Diario antiguo', v: { text: 'La Gaceta', shape: 'line', curve: 0, font: 'UnifrakturMaguntia', size: 110, weight: 400, spacing: 0, fill: 'var(--text-primary)', fill2: '', stroke: '', strokeW: 0, depth: 0, depthColor: '#000000', depthAngle: 45, glow: 0, glowColor: '#000000', rx: 0, ry: 0, rz: 0, persp: 800, anim: '' } }
  ];

  /* ============================================== efectos de texto ====== */
  // Estilos en linea que se aplican al texto seleccionado o al bloque entero.
  WB.TEXT_FX = [
    { id: 'none', name: 'Sin efecto', css: {} },
    { id: 'shadow', name: 'Sombra suave', css: { textShadow: '0 3px 8px rgba(0,0,0,.35)' } },
    { id: '3d', name: 'Relieve 3D', css: { textShadow: '1px 1px 0 #00000055, 2px 2px 0 #00000050, 3px 3px 0 #0000004a, 4px 4px 0 #00000044, 5px 5px 0 #0000003e, 6px 7px 10px #00000055' } },
    { id: 'neon', name: 'Neón', css: { textShadow: '0 0 4px #fff, 0 0 10px var(--accent), 0 0 22px var(--accent), 0 0 40px var(--accent)' } },
    { id: 'emboss', name: 'Grabado', css: { textShadow: '0 1px 0 rgba(255,255,255,.7), 0 -1px 0 rgba(0,0,0,.35)' } },
    { id: 'outline', name: 'Solo contorno', css: { webkitTextStroke: '1.5px currentColor', webkitTextFillColor: 'transparent' } },
    { id: 'gradient', name: 'Degradado', css: { backgroundImage: 'linear-gradient(90deg, var(--accent), var(--accent-2))', webkitBackgroundClip: 'text', backgroundClip: 'text', webkitTextFillColor: 'transparent' } },
    { id: 'marker', name: 'Rotulador', css: { backgroundImage: 'linear-gradient(transparent 55%, color-mix(in srgb, var(--accent) 35%, transparent) 55%)' } }
  ];
  WB.TEXT_FX_PROPS = ['textShadow', 'webkitTextStroke', 'webkitTextFillColor', 'backgroundImage', 'webkitBackgroundClip', 'backgroundClip'];
})();
