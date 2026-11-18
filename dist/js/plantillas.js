/* ==========================================================================
   weBlogger - plantillas para empezar un blog. Los periodicos y revistas
   empiezan desde la galeria de estilos de prensa.

   Las tres «BitxoSOFT» siguen la estructura de los blogs de BitxoSOFT
   (cabecera con emblema, portada con insignia y foto enmarcada, tira de
   cifras, indice lateral, tarjetas, cronologia o fichas, cita, galeria y
   pie firmado), con textos de muestra para escribir encima. Las demas
   añaden fondos: foto a toda la portada, imagen quieta detras de la pagina
   o texturas (papel, cuaderno, cuadricula, aurora...).

   Cada plantilla lleva `thumb` para dibujar su miniatura en el selector.
   ========================================================================== */
(function () {
  'use strict';

  var e = function (t) { return WB.esc(t); };
  var n = 0; // numero de seccion, para los enlaces del menu
  var scene = function (i) { return WB.scenes ? WB.scenes.url(i) : WB.PLACEHOLDER; };

  /* escenas de ilustraciones.js */
  var SC = {
    ciudad: 0, puerto: 1, montana: 2, plaza: 3, estadio: 4, edificio: 5, mercado: 6, campo: 7, tren: 8,
    puente: 9, bosque: 10, playa: 11, concierto: 12, laboratorio: 13, fabrica: 14, redaccion: 15,
    aula: 16, hospital: 17, aeropuerto: 18, lluvia: 19, vinedo: 20, faro: 21, bolsa: 22, eolico: 24, autopista: 25
  };

  var MOON = '<svg id="themeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

  /* ------------------------------------------------------------ piezas -- */

  function header(o) {
    n = 0; // la cabecera se compone la primera: las secciones empiezan en 1
    var nav = (o.nav || ['Inicio']).map(function (n, i) {
      return '<a href="#' + (i ? 'seccion-' + i : 'inicio') + '">' + e(n) + '</a>';
    }).join('');
    return '<header class="site-header"><div class="header-inner">' +
      '<a href="#inicio" class="brand"><div class="brand-emblem">' + e(o.emblem || 'B') + '</div><div class="brand-text"><span class="brand-title">' + e(o.brand) + '</span><span class="brand-sub">' + e(o.sub || '') + '</span></div></a>' +
      '<nav class="nav-links" aria-label="Navegación principal">' + nav + '</nav>' +
      '<div class="header-controls"><div class="lang-switcher" role="group" aria-label="Selector de idioma"></div>' +
      '<button type="button" class="theme-btn" id="themeToggle" aria-label="Cambiar tema claro u oscuro" title="Modo claro / oscuro">' + MOON + '</button></div>' +
      '</div></header>';
  }

  function hero(name, o) {
    var img = o.img === null ? '' : scene(o.img);
    var meta = (o.meta || ['📍 Lugar', '🗓️ Fecha', '✍️ Autor']).map(function (m) { return '<span>' + e(m) + '</span>'; }).join('');
    var visual = img ? '<div class="hero-visual"><figure class="hero-frame" data-lightbox-src="' + img + '" data-lightbox-caption="">' +
      '<img src="' + img + '" alt="" loading="eager" />' +
      '<figcaption class="hero-caption"><span>' + e(o.cap || 'Pie de la imagen de portada') + '</span><span class="license-tag">' + e(o.credit || 'Autor / licencia') + '</span></figcaption></figure></div>' : '';
    return '<section class="hero' + (o.cls ? ' ' + o.cls : '') + '" id="inicio"><div class="hero-container"><div>' +
      '<div class="hero-badge">' + e(o.badge) + '</div>' +
      '<h1>' + e(name) + '</h1>' +
      '<p class="hero-lead">' + e(o.lead) + '</p>' +
      '<div class="hero-meta">' + meta + '</div></div>' + visual +
      '</div></section>';
  }

  function stats(list) {
    return '<div class="stats-strip"><div class="stats-grid">' + list.map(function (s) {
      return '<div class="stat-card reveal"><div class="stat-value">' + e(s[0]) + '</div><div class="stat-label">' + e(s[1]) + '</div></div>';
    }).join('') + '</div></div>';
  }

  function figure(i, cap, credit) {
    var img = scene(i);
    return '<figure class="media-figure" data-lightbox-src="' + img + '" data-lightbox-caption="' + e(cap || '') + '">' +
      '<img src="' + img + '" alt="" loading="lazy" />' +
      '<figcaption class="media-figcaption"><span>' + e(cap || 'Pie de foto') + '</span><span class="license-tag">' + e(credit || 'Autor / licencia') + '</span></figcaption></figure>';
  }

  function ps(list) { return list.map(function (p, i) { return '<p' + (i === 0 && p.cap ? ' class="lead-dropcap"' : '') + '>' + e(p.t || p) + '</p>'; }).join(''); }
  function first(t) { return { t: t, cap: true }; }

  function cards(list) {
    return '<div class="info-cards">' + list.map(function (c) { return '<div class="info-card"><h3>' + e(c[0]) + '</h3><p>' + e(c[1]) + '</p></div>'; }).join('') + '</div>';
  }
  function timeline(list) {
    return '<div class="timeline">' + list.map(function (c) { return '<div class="timeline-item"><div class="timeline-year">' + e(c[0]) + '</div><p>' + e(c[1]) + '</p></div>'; }).join('') + '</div>';
  }
  function specs(list) {
    return '<div class="ganxet-specs">' + list.map(function (c) { return '<div class="spec-pill-card"><strong>' + e(c[0]) + '</strong><span>' + e(c[1]) + '</span></div>'; }).join('') + '</div>';
  }
  function quote(t, who) {
    return '<blockquote class="editorial-quote"><p>«' + e(t) + '»</p><cite>' + e(who) + '</cite></blockquote>';
  }
  function gallery(list) {
    return '<div class="gallery-grid">' + list.map(function (g) {
      var img = scene(g[0]);
      return '<div class="gallery-item" data-lightbox-src="' + img + '" data-lightbox-caption="' + e(g[1]) + '"><img src="' + img + '" alt="" loading="lazy" /><div class="gallery-item-caption">' + e(g[1]) + '</div></div>';
    }).join('') + '</div>';
  }
  function callout(icon, html) {
    return '<div class="wb-callout" data-tone="info"><div class="wb-callout-icon">' + icon + '</div><div class="wb-callout-body" data-wb-slot><p>' + html + '</p></div></div>';
  }

  function section(kicker, title, html) {
    n++;
    return '<section class="article-section reveal" id="seccion-' + n + '"><span class="section-kicker">' + e(kicker) + '</span><h2>' + e(title) + '</h2>' + html + '</section>';
  }

  /** body(toc, seccion1, seccion2, ...) */
  function body(toc) {
    var sections = Array.prototype.slice.call(arguments, 1).join('');
    return '<main class="article-wrapper' + (toc ? '' : ' no-toc') + '">' + (toc ? WB.PARTS.toc.html() : '') +
      '<article class="article-content">' + sections + '</article></main>';
  }

  /**
   * Fondo quieto detras de toda la pagina: imagen con velo, textura, o un
   * fondo del catalogo (js/fondos-catalogo.js) por su id.
   */
  function pageBg(img, texture, veil, bgId) {
    var src = img === null || img === undefined ? '' : scene(img);
    var bg = bgId && WB.BG ? WB.BG.byId[bgId] : null;
    return '<div class="wb-page-bg"' + (texture ? ' data-texture="' + texture + '"' : '') +
      (bg ? ' data-bg="' + bg.id + '"' + (bg.tone !== 'theme' ? ' data-tone="' + bg.tone + '"' : '') : '') +
      ' style="--veil:' + (veil === undefined ? (bg ? 0 : 0.82) : veil) + '" aria-hidden="true">' +
      (src ? '<img src="' + src + '" alt="" />' : '') +
      (bg ? '<div class="wb-bg-fill" style="' + e(bg.css) + '"></div>' : '') + '</div>';
  }

  function page(parts) {
    return parts.join('') + WB.PARTS.footer.html();
  }

  /* las piezas, para las plantillas de js/plantillas-mas.js */
  WB.tplKit = {
    e: e, scene: scene, SC: SC, header: header, hero: hero, stats: stats, figure: figure, ps: ps, first: first,
    cards: cards, timeline: timeline, specs: specs, quote: quote, gallery: gallery, callout: callout,
    section: section, body: body, pageBg: pageBg, page: page
  };

  /* --------------------------------------------------------- plantillas -- */

  WB.TEMPLATES = [
    {
      id: 'blank', name: 'En blanco',
      desc: 'Cabecera, portada, índice y una sección vacía para empezar a escribir.',
      palette: 'terracota',
      thumb: { pal: 'terracota', img: null },
      build: function (name) {
        var hero0 = WB.PARTS.hero.html().replace('El titular de tu artículo va aquí', function () { return e(name); });
        n = 0;
        return {
          body: WB.PARTS.header.html() + hero0 + body(true,
            section('Primera parte', 'Título de la primera sección',
              '<p class="lead-dropcap">Empieza a escribir aquí. Haz clic sobre cualquier texto para cambiarlo y arrastra elementos desde el panel de la derecha para añadir imágenes, citas, tarjetas, ventanas o lo que necesites.</p><p>Cada vez que pulses Intro se crea un párrafo nuevo.</p>')) +
            WB.PARTS.footer.html(),
          set: {}
        };
      }
    },

    /* =========================== BitxoSOFT: la estructura de sus blogs === */
    {
      id: 'bitxo-patrimonio', name: 'BitxoSOFT · Patrimonio', group: 'BitxoSOFT',
      desc: 'Historia de un lugar: una masía, un barrio, un edificio. Cifras, tarjetas, cronología, cita y galería.',
      palette: 'terracota',
      thumb: { pal: 'terracota', img: SC.edificio, frame: true },
      build: function (name) {
        return {
          body: page([
            header({ brand: 'PATRIMONIO LOCAL', sub: 'Historia y memoria', emblem: 'P', nav: ['Inicio', 'Origen', 'Historia', 'Testimonios', 'Galería'] }),
            hero(name, { img: SC.edificio, badge: 'Patrimonio · Historia local', lead: 'La historia de un lugar que ha visto pasar generaciones: quién lo levantó, qué se vivió entre sus muros y qué queda hoy de todo aquello.', meta: ['📍 Lugar', '🗓️ Siglo XVIII – hoy', '✍️ Autor del artículo'], cap: 'La fachada principal, tal como se conserva', credit: 'Archivo familiar' }),
            stats([['1750', 'Primera mención escrita'], ['3', 'Generaciones'], ['12 ha', 'Tierras de la finca'], ['1998', 'Protección patrimonial']]),
            body(true,
              section('El origen', 'Cómo empezó todo', ps([first('Cuenta aquí el origen del lugar: quién lo construyó, por qué en ese sitio y qué se sabe de los primeros años. Una buena historia empieza con un detalle concreto, una fecha o un nombre propio.'), 'Añade lo que dicen los documentos antiguos, los registros de la parroquia o los recuerdos de las personas mayores. Todo texto es editable: haz clic y escribe.']) +
                cards([['Lo que dicen los documentos', 'Escrituras, censos y registros que confirman las fechas principales.'], ['Lo que cuenta la gente', 'Los recuerdos y las anécdotas que han pasado de padres a hijos.']])),
              section('La historia', 'Siglos de vida', figure(SC.campo, 'Las tierras de la finca vistas desde el camino', 'Archivo') +
                timeline([['1750 · La construcción', 'Se levanta el primer cuerpo de la casa y las tierras empiezan a trabajarse.'], ['1890 · La ampliación', 'Llegan nuevos cultivos y la casa crece con un ala nueva.'], ['1998 · La protección', 'El edificio entra en el catálogo de patrimonio del municipio.']])),
              section('Testimonios', 'La voz de quien lo vivió', quote('Aquí aprendimos todo lo que sabemos: a mirar el cielo antes de sembrar y a respetar el trabajo de los mayores.', 'Una vecina, en una entrevista') +
                ps(['Recoge aquí las voces de quienes conocieron el lugar. Las citas textuales dan vida a la historia y acercan al lector.'])),
              section('Hoy', 'Lo que queda', figure(SC.plaza, 'El entorno, hoy', 'Foto propia') + ps(['Explica en qué estado se encuentra hoy, quién lo cuida y si se puede visitar. Termina con una invitación al lector.']) +
                callout('📍', '<strong>Cómo llegar.</strong> Indica aquí la dirección, el horario de visita o cómo ponerse en contacto.')),
              section('Galería', 'Imágenes del lugar', gallery([[SC.edificio, 'La fachada'], [SC.campo, 'Los campos'], [SC.bosque, 'El bosque cercano']]))
            )
          ]),
          set: { fontDisplay: 'Cormorant Garamond', fontBody: 'Plus Jakarta Sans', radius: 'md' }
        };
      }
    },
    {
      id: 'bitxo-huerta', name: 'BitxoSOFT · Huerta y tradición', group: 'BitxoSOFT',
      desc: 'Oficios, productos de la tierra y tradiciones: fichas técnicas, cita, fotos y galería.',
      palette: 'huerta',
      thumb: { pal: 'huerta', img: SC.campo, frame: true },
      build: function (name) {
        return {
          body: page([
            header({ brand: 'HUERTA Y TRADICIÓN', sub: 'La tierra y su gente', emblem: 'H', nav: ['Inicio', 'La huerta', 'El oficio', 'El producto', 'Galería'] }),
            hero(name, { img: SC.campo, badge: 'Tradición · Producto local', lead: 'Un oficio que se aprende mirando: cómo se trabaja la tierra, qué se cultiva en cada estación y por qué este producto es diferente a cualquier otro.', meta: ['📍 Comarca', '🌱 Temporada', '✍️ Autor'], cap: 'Los bancales al amanecer', credit: 'Foto propia' }),
            stats([['4', 'Estaciones de cultivo'], ['30+', 'Variedades'], ['100 %', 'De proximidad'], ['1920', 'Primera cosecha documentada']]),
            body(true,
              section('La huerta', 'Un paisaje trabajado a mano', ps([first('Describe el paisaje: el agua, el suelo, las parcelas y los caminos. Explica por qué este sitio es bueno para cultivar y qué lo hace especial.'), 'Habla de las familias que lo trabajan y de cómo ha cambiado con los años.']) +
                cards([['El agua', 'Acequias, pozos y turnos de riego que ordenan el trabajo.'], ['La tierra', 'Qué tipo de suelo hay y cómo se cuida para que dé fruto cada año.']])),
              section('El oficio', 'Paso a paso', figure(SC.mercado, 'El mercado del sábado', 'Archivo') + ps(['Cuenta el trabajo de un día cualquiera: a qué hora se empieza, qué herramientas se usan y qué no se puede hacer con prisa.'])),
              section('El producto', 'Ficha de la variedad', specs([['Temporada', 'De junio a septiembre'], ['Sabor', 'Dulce, con un punto ácido'], ['Cómo se conserva', 'En lugar fresco y sin nevera']]) +
                figure(SC.vinedo, 'Recogida a mano', 'Foto propia') +
                quote('Lo bueno no se fuerza: la tierra te dice cuándo está lista.', 'Un hortelano de la zona')),
              section('En la cocina', 'Cómo se come', ps(['Una receta sencilla de la casa, un consejo para elegir el mejor producto en el mercado o la forma tradicional de prepararlo.']) +
                callout('🥘', '<strong>Receta de la casa.</strong> Escribe aquí los ingredientes y los pasos.')),
              section('Galería', 'La huerta en imágenes', gallery([[SC.campo, 'Los bancales'], [SC.mercado, 'El mercado'], [SC.vinedo, 'La recogida']]))
            )
          ]),
          set: { fontDisplay: 'Playfair Display', fontBody: 'Plus Jakarta Sans', radius: 'lg' }
        };
      }
    },
    {
      id: 'bitxo-familia', name: 'BitxoSOFT · Casa y familia', group: 'BitxoSOFT',
      desc: 'La historia de una casa o de una familia: cronología de generaciones, tarjetas, cita y álbum.',
      palette: 'mar',
      thumb: { pal: 'mar', img: SC.puerto, frame: true },
      build: function (name) {
        return {
          body: page([
            header({ brand: 'CASA Y FAMILIA', sub: 'Memoria de una saga', emblem: 'C', nav: ['Inicio', 'La casa', 'Generaciones', 'Recuerdos', 'Álbum'] }),
            hero(name, { img: SC.puerto, badge: 'Memoria · Familia', lead: 'De los abuelos a los nietos: la historia de una casa y de la familia que la ha llenado de vida durante más de cien años.', meta: ['📍 Población', '🗓️ 1900 – hoy', '✍️ Autor'], cap: 'La casa vista desde el puerto', credit: 'Álbum familiar' }),
            stats([['1905', 'Llegada de la familia'], ['4', 'Generaciones'], ['27', 'Nietos y bisnietos'], ['1', 'Casa que lo cuenta todo']]),
            body(true,
              section('La casa', 'Donde empezó todo', ps([first('Presenta la casa: dónde está, cómo es y qué recuerdos guarda cada habitación. Los detalles pequeños —una puerta, un olor, un rincón— son los que mejor se recuerdan.'), 'Explica cómo llegó la familia y por qué se quedó.']) +
                cards([['Las estancias', 'La cocina, el patio, la habitación de los abuelos: cada lugar tiene su historia.'], ['Los objetos', 'Muebles, fotografías y cartas que han pasado de mano en mano.']])),
              section('Generaciones', 'Cien años en cuatro fechas', figure(SC.ciudad, 'El pueblo a principios de siglo', 'Archivo municipal') +
                timeline([['1905 · Los fundadores', 'Los bisabuelos compran la casa y abren el primer negocio.'], ['1950 · Los años difíciles', 'La familia sale adelante con trabajo y ayuda de los vecinos.'], ['2000 · La nueva etapa', 'Los nietos restauran la casa y la abren a todos.']])),
              section('Recuerdos', 'Lo que se cuenta en la mesa', quote('En esta casa nunca sobró nada, pero nunca faltó un plato para quien llamaba a la puerta.', 'La abuela, según sus nietos') +
                ps(['Recoge las historias que se repiten en cada reunión familiar. Son el alma del artículo.'])),
              section('Hoy', 'La casa sigue viva', figure(SC.faro, 'El faro, a dos pasos de la casa', 'Foto propia') + ps(['Termina contando qué es hoy la casa y quién la mantiene.'])),
              section('Álbum', 'Fotos de familia', gallery([[SC.puerto, 'El puerto'], [SC.ciudad, 'El pueblo'], [SC.playa, 'Los veranos']]))
            )
          ]),
          set: { fontDisplay: 'DM Serif Display', fontBody: 'Inter', radius: 'md' }
        };
      }
    },

    /* ========================================== con fondos ============== */
    {
      id: 'viajes', name: 'Viajes · Portada a toda pantalla', group: 'Con fondo',
      desc: 'La foto ocupa toda la portada y el titular va encima. Cuaderno de viaje con fichas y galería.',
      palette: 'mar',
      thumb: { pal: 'mar', img: SC.playa, cover: true },
      build: function (name) {
        return {
          body: page([
            header({ brand: 'CUADERNO DE VIAJE', sub: 'Rutas y destinos', emblem: 'V', nav: ['Inicio', 'La ruta', 'Qué ver', 'Consejos'] }),
            hero(name, { cls: 'hero-cover', img: SC.playa, badge: 'Viajes · Escapada', lead: 'Una ruta para hacer sin prisa: dónde dormir, qué ver y los rincones que no salen en las guías.', meta: ['📍 Destino', '🗓️ 4 días', '🚗 En coche'], cap: 'La costa al atardecer', credit: 'Foto propia' }),
            stats([['4', 'Días de ruta'], ['320 km', 'Recorridos'], ['6', 'Paradas'], ['★ 4,8', 'Nota del viaje']]),
            body(true,
              section('La ruta', 'Día a día', ps([first('Resume el viaje en un párrafo: el punto de partida, el destino y lo que hace especial la ruta.'), 'Después cuenta cada jornada con sus horarios, distancias y paradas.']) +
                timeline([['Día 1 · La llegada', 'Paseo por el casco antiguo y cena junto al puerto.'], ['Día 2 · La costa', 'Ruta a pie por los acantilados hasta el faro.'], ['Día 3 · El interior', 'Pueblos de montaña y mercado de productos locales.']])),
              section('Qué ver', 'Imprescindibles', figure(SC.faro, 'El faro, al final del sendero', 'Foto propia') +
                cards([['Para madrugar', 'El amanecer desde el mirador, antes de que llegue la gente.'], ['Para comer', 'El mercado del puerto: pescado del día y precios honrados.']])),
              section('Consejos', 'Antes de salir', specs([['Mejor época', 'Mayo y septiembre'], ['Presupuesto', 'Unos 90 € al día'], ['Imprescindible', 'Calzado cómodo y chubasquero']]) +
                callout('🧭', '<strong>Truco.</strong> Reserva el alojamiento con antelación en temporada alta.')),
              section('Galería', 'El viaje en fotos', gallery([[SC.playa, 'La playa'], [SC.faro, 'El faro'], [SC.montana, 'La montaña']]))
            )
          ]),
          set: { fontDisplay: 'Playfair Display', fontBody: 'Inter', radius: 'lg' }
        };
      }
    },
    {
      id: 'naturaleza', name: 'Naturaleza · Fondo de bosque', group: 'Con fondo',
      desc: 'Una imagen de bosque queda quieta detrás de toda la página; el texto va sobre papel translúcido.',
      palette: 'huerta',
      thumb: { pal: 'huerta', img: SC.bosque, bg: true },
      build: function (name) {
        return {
          body: page([
            pageBg(SC.bosque, '', 0.55),
            header({ brand: 'SENDEROS', sub: 'Naturaleza cerca de casa', emblem: 'S', nav: ['Inicio', 'El paseo', 'Flora y fauna', 'Galería'] }),
            hero(name, { img: SC.montana, badge: 'Naturaleza · Ruta a pie', lead: 'Un paseo entre árboles centenarios, con agua todo el año y vistas que compensan cada subida.', meta: ['📍 Parque natural', '⏱️ 3 h', '🥾 Dificultad media'], cap: 'La cumbre desde el último tramo', credit: 'Foto propia' }),
            body(true,
              section('El paseo', 'Por dónde se va', ps([first('Describe el recorrido: dónde se aparca, por dónde empieza el sendero y qué señales seguir.'), 'Indica los tramos difíciles y los puntos de agua.']) +
                specs([['Distancia', '9,5 km ida y vuelta'], ['Desnivel', '420 m'], ['Época', 'Todo el año']])),
              section('Flora y fauna', 'Qué se puede ver', figure(SC.bosque, 'El hayedo en otoño', 'Foto propia') +
                cards([['Árboles', 'Hayas, robles y castaños que cambian de color con cada estación.'], ['Animales', 'Corzos, ardillas y aves rapaces si se camina en silencio.']])),
              section('Respeta el entorno', 'Normas del parque', callout('🌿', '<strong>Deja el camino como lo encontraste.</strong> No salgas de los senderos y llévate tu basura.')),
              section('Galería', 'El bosque en imágenes', gallery([[SC.bosque, 'El bosque'], [SC.montana, 'La cumbre'], [SC.eolico, 'La sierra']]))
            )
          ]),
          set: { fontDisplay: 'Lora', fontBody: 'Plus Jakarta Sans', radius: 'lg' }
        };
      }
    },
    {
      id: 'ciudad', name: 'Crónica urbana · Fondo de ciudad', group: 'Con fondo',
      desc: 'La ciudad de noche como fondo de toda la página, en modo oscuro. Para crónicas, barrios y cultura.',
      palette: 'violeta',
      thumb: { pal: 'violeta', img: SC.ciudad, bg: true, dark: true },
      build: function (name) {
        return {
          body: page([
            pageBg(SC.ciudad, '', 0.7),
            header({ brand: 'CRÓNICA URBANA', sub: 'La ciudad que no sale en las postales', emblem: 'U', nav: ['Inicio', 'El barrio', 'Su gente', 'Agenda'] }),
            hero(name, { img: SC.lluvia, badge: 'Ciudad · Crónica', lead: 'Calles, comercios de toda la vida y vecinos que hacen barrio. Una mirada de cerca a la ciudad que cambia.', meta: ['📍 Barrio', '🗓️ Fecha', '✍️ Autor'], cap: 'La avenida en una noche de lluvia', credit: 'Foto propia' }),
            stats([['1920', 'Nace el barrio'], ['14.000', 'Vecinos'], ['60', 'Comercios'], ['3', 'Plazas']]),
            body(true,
              section('El barrio', 'Un paseo por sus calles', ps([first('Empieza por una escena: una esquina, un bar, una persona. Después amplía el plano y explica el barrio.'), 'Cuenta cómo ha cambiado en los últimos años.'])),
              section('Su gente', 'Quién hace barrio', quote('Aquí todo el mundo se conoce: si un día no abro, al día siguiente vienen a preguntar.', 'La dueña de la panadería') +
                cards([['El comercio', 'Las tiendas de siempre que resisten y las nuevas que llegan.'], ['Las fiestas', 'La fiesta mayor, el mercadillo y las verbenas de verano.']])),
              section('Agenda', 'Qué hacer esta semana', '<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Día</th><th>Qué</th><th>Dónde</th></tr></thead><tbody><tr><td>Viernes</td><td>Concierto</td><td>Plaza mayor</td></tr><tr><td>Sábado</td><td>Mercadillo</td><td>Calle ancha</td></tr><tr><td>Domingo</td><td>Ruta guiada</td><td>Centro cívico</td></tr></tbody></table></div>'),
              section('Galería', 'La ciudad en imágenes', gallery([[SC.ciudad, 'Al caer la tarde'], [SC.lluvia, 'Bajo la lluvia'], [SC.autopista, 'Las salidas']]))
            )
          ]),
          set: { fontDisplay: 'Space Grotesk', fontBody: 'Inter', radius: 'md', startTheme: 'dark' }
        };
      }
    },
    {
      id: 'cocina', name: 'Cocina · Papel de recetario', group: 'Con fondo',
      desc: 'Fondo de papel con textura cálida, portada centrada y fichas de receta.',
      palette: 'vino',
      thumb: { pal: 'vino', img: null, texture: 'papel' },
      build: function (name) {
        return {
          body: page([
            pageBg(null, 'papel', 0),
            header({ brand: 'EL RECETARIO', sub: 'Cocina de casa', emblem: 'R', nav: ['Inicio', 'Ingredientes', 'Elaboración', 'Trucos'] }),
            hero(name, { img: SC.mercado, badge: 'Receta · Cocina tradicional', lead: 'Una receta de las de siempre, explicada paso a paso para que salga igual que la de casa.', meta: ['⏱️ 45 min', '👥 4 personas', '🔥 Fácil'], cap: 'Los ingredientes, recién comprados', credit: 'Foto propia' }),
            body(true,
              section('Ingredientes', 'Lo que necesitas', specs([['Para la base', '500 g de producto de temporada'], ['Para el sofrito', 'Cebolla, ajo y tomate maduro'], ['Para acabar', 'Aceite de oliva y sal']]) +
                '<ul><li>Primer ingrediente</li><li>Segundo ingrediente</li><li>Tercer ingrediente</li></ul>'),
              section('Elaboración', 'Paso a paso', '<ol><li>Prepara y corta todos los ingredientes antes de encender el fuego.</li><li>Haz el sofrito a fuego lento, sin prisa.</li><li>Añade el ingrediente principal y deja que se haga.</li><li>Rectifica de sal y sirve caliente.</li></ol>' +
                figure(SC.mercado, 'Así queda el plato terminado', 'Foto propia')),
              section('Trucos', 'Para que salga perfecto', callout('👩‍🍳', '<strong>El secreto de la abuela.</strong> Escribe aquí ese detalle que marca la diferencia.') +
                quote('La cocina de casa no tiene prisa: el fuego lento lo arregla todo.', 'Dicho familiar'))
            )
          ]),
          set: { fontDisplay: 'Abril Fatface', fontBody: 'Lora', radius: 'sm' }
        };
      }
    },
    {
      id: 'diario', name: 'Diario personal · Cuaderno', group: 'Con fondo',
      desc: 'Hoja de cuaderno con renglones y margen, letra manuscrita en los títulos y portada centrada.',
      palette: 'terracota',
      thumb: { pal: 'terracota', img: null, texture: 'cuaderno', center: true },
      build: function (name) {
        return {
          body: page([
            pageBg(null, 'cuaderno', 0),
            header({ brand: 'MI DIARIO', sub: 'Notas, ideas y días', emblem: 'D', nav: ['Inicio', 'Hoy', 'Ideas'] }),
            hero(name, { cls: 'hero-center', img: null, badge: 'Diario · Entrada', lead: 'Lo que pasó hoy, lo que pensé y lo que no quiero olvidar.', meta: ['🗓️ Fecha', '☁️ Cómo hace el día', '✍️ Yo'] }),
            body(false,
              section('Hoy', 'Lo que pasó', ps([first('Escribe como si se lo contaras a un amigo. No hace falta que sea perfecto: es tu diario.'), 'Añade una foto, una cita o una lista si te apetece.']) +
                figure(SC.lluvia, 'Desde la ventana', 'Foto propia')),
              section('Ideas', 'Para no olvidar', '<ul><li>Una idea que me ha rondado todo el día</li><li>Un libro, una canción o una película</li><li>Algo que quiero hacer mañana</li></ul>' +
                quote('Escribir es la forma de pensar despacio.', 'Anónimo'))
            )
          ]),
          set: { fontDisplay: 'Caveat', fontBody: 'Lora', radius: 'sm' }
        };
      }
    },
    {
      id: 'tecnologia', name: 'Tecnología · Cuadrícula y aurora', group: 'Con fondo',
      desc: 'Modo oscuro con fondo de cuadrícula y brillos de color. Para análisis, tutoriales y novedades.',
      palette: 'violeta',
      thumb: { pal: 'violeta', img: null, texture: 'aurora', dark: true },
      build: function (name) {
        return {
          body: page([
            pageBg(null, 'cuadricula', 0),
            header({ brand: 'BIT A BIT', sub: 'Tecnología explicada', emblem: '</>', nav: ['Inicio', 'Qué es', 'Cómo funciona', 'Veredicto'] }),
            hero(name, { img: SC.laboratorio, badge: 'Tecnología · Análisis', lead: 'Lo probamos durante un mes. Esto es lo que funciona, lo que no y si de verdad merece la pena.', meta: ['🗓️ Fecha', '⏱️ 8 min de lectura', '✍️ Autor'], cap: 'En el banco de pruebas', credit: 'Foto propia' }),
            stats([['30', 'Días de prueba'], ['8,5', 'Nota final'], ['12 h', 'Batería'], ['3', 'Alternativas']]),
            body(true,
              section('Qué es', 'En pocas palabras', ps([first('Explica qué es y para quién está pensado, sin tecnicismos. Si hay que usar uno, explícalo la primera vez que aparezca.')]) +
                cards([['Lo mejor', 'Rápido, bien acabado y fácil de usar desde el primer día.'], ['Lo peor', 'El precio y algunos detalles de software por pulir.']])),
              section('Cómo funciona', 'Por dentro', '<pre class="wb-code">// pega aquí un fragmento de código o una configuración\nconfig.modo = "rendimiento";</pre>' +
                '<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Prueba</th><th>Resultado</th><th>Notas</th></tr></thead><tbody><tr><td>Arranque</td><td>4 s</td><td>Muy rápido</td></tr><tr><td>Consumo</td><td>Bajo</td><td>En reposo</td></tr><tr><td>Ruido</td><td>Silencioso</td><td>Salvo con carga</td></tr></tbody></table></div>'),
              section('Veredicto', '¿Merece la pena?', callout('✅', '<strong>Recomendado</strong> si buscas equilibrio entre precio y rendimiento.') +
                quote('La mejor tecnología es la que deja de notarse.', 'Redacción'))
            )
          ]),
          set: { fontDisplay: 'Space Grotesk', fontBody: 'Inter', radius: 'md', startTheme: 'dark', customCss: '.wb-page-bg::after{background:radial-gradient(55% 45% at 10% 5%,color-mix(in srgb,var(--accent) 28%,transparent),transparent 70%),radial-gradient(50% 40% at 95% 35%,color-mix(in srgb,var(--accent-2) 24%,transparent),transparent 70%),linear-gradient(color-mix(in srgb,var(--accent) 14%,transparent) 1px,transparent 1px) 0 0/28px 28px,linear-gradient(90deg,color-mix(in srgb,var(--accent) 14%,transparent) 1px,transparent 1px) 0 0/28px 28px;}' }
        };
      }
    },
    {
      id: 'concierto', name: 'Cultura · Escenario', group: 'Con fondo',
      desc: 'Portada a toda pantalla con la foto del escenario, para crónicas de conciertos, teatro y festivales.',
      palette: 'vino',
      thumb: { pal: 'vino', img: SC.concierto, cover: true, dark: true },
      build: function (name) {
        return {
          body: page([
            header({ brand: 'PRIMERA FILA', sub: 'Música, teatro y festivales', emblem: '♪', nav: ['Inicio', 'La noche', 'El repertorio', 'Fotos'] }),
            hero(name, { cls: 'hero-cover', img: SC.concierto, badge: 'Cultura · Crónica', lead: 'Dos horas de música, un público entregado y un final que nadie esperaba. Así fue la noche.', meta: ['📍 Sala', '🗓️ Fecha', '🎟️ Entradas agotadas'], cap: 'El escenario, en el primer bis', credit: 'Foto propia' }),
            body(true,
              section('La noche', 'Cómo fue', ps([first('Empieza por el momento más intenso del concierto y después vuelve al principio para contarlo en orden.'), 'Describe el ambiente, el sonido, la luz y la reacción del público.']) +
                quote('Hacía años que no veía a una sala entera cantando a la vez.', 'Un espectador a la salida')),
              section('El repertorio', 'Lo que sonó', '<ol><li>Primera canción</li><li>Segunda canción</li><li>La más celebrada</li><li>El bis final</li></ol>' +
                specs([['Duración', '2 h 10 min'], ['Público', 'Unas 1.500 personas'], ['Lo mejor', 'El final acústico']])),
              section('Fotos', 'La noche en imágenes', gallery([[SC.concierto, 'El escenario'], [SC.plaza, 'La cola de entrada'], [SC.ciudad, 'La salida']]))
            )
          ]),
          set: { fontDisplay: 'Bebas Neue', fontBody: 'Inter', radius: 'sm', startTheme: 'dark' }
        };
      }
    },
    {
      id: 'minimal', name: 'Minimal · Puntos', group: 'Con fondo',
      desc: 'Blanco y negro, fondo de puntos suaves, portada centrada y una sola columna para leer sin distracciones.',
      palette: 'grafito',
      thumb: { pal: 'grafito', img: null, texture: 'puntos', center: true },
      build: function (name) {
        return {
          body: page([
            pageBg(null, 'puntos', 0),
            header({ brand: 'ENSAYOS', sub: 'Ideas en limpio', emblem: 'E', nav: ['Inicio', 'Ensayo'] }),
            hero(name, { cls: 'hero-center', img: null, badge: 'Ensayo', lead: 'Una idea desarrollada con calma, en una sola columna y sin nada que distraiga de la lectura.', meta: ['🗓️ Fecha', '⏱️ 6 min', '✍️ Autor'] }),
            body(false,
              section('I', 'El planteamiento', ps([first('Plantea la pregunta o la idea central en el primer párrafo. Sé claro: el lector debe saber desde el principio adónde vas.'), 'Desarrolla el argumento en párrafos cortos.']) +
                '<p class="wb-pull">Una frase que resume la tesis y rompe la página</p>'),
              section('II', 'El desarrollo', ps(['Aporta ejemplos, datos o experiencias que sostengan la idea. Cita las fuentes cuando las uses.']) +
                quote('Lo simple no es lo fácil: es lo que queda cuando se quita lo que sobra.', 'Autor de la cita')),
              section('III', 'La conclusión', ps(['Cierra volviendo a la pregunta inicial y deja al lector algo en lo que pensar.']))
            )
          ]),
          set: { fontDisplay: 'EB Garamond', fontBody: 'Source Serif 4', radius: 'sm' }
        };
      }
    }
  ];
})();
