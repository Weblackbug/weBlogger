/* ==========================================================================
   weBlogger - mas plantillas de blog.

   Formatos que funcionan en los blogs mas leidos de internet: el ensayo
   largo de lectura tranquila, el boletin por correo, la revista digital de
   portada en rejilla, el analisis de producto con «nuestra eleccion», el
   directo minuto a minuto, la receta con su ficha, la guia de viaje, el
   tutorial tecnico, la lista de consejos, la entrevista, el explicador...

   Solo se toma la idea del formato: nombres, textos, colores, ilustraciones
   y fondos son propios (catalogo de js/fondos-catalogo.js), sin marcas ni
   logotipos de nadie.
   ========================================================================== */
(function () {
  'use strict';

  var K = WB.tplKit;
  if (!K) return;
  var e = K.e, SC = K.SC, header = K.header, hero = K.hero, stats = K.stats, figure = K.figure, ps = K.ps, first = K.first,
    cards = K.cards, timeline = K.timeline, specs = K.specs, quote = K.quote, gallery = K.gallery, callout = K.callout,
    section = K.section, body = K.body, pageBg = K.pageBg, page = K.page;

  /* ------------------------------------------------- piezas de mas -- */

  function byline(name, meta, ini) {
    return '<div class="wb-byline"><span class="wb-byline-avatar">' + e(ini || name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2)) + '</span><div><strong class="wb-byline-name">' + e(name) + '</strong><span class="wb-byline-meta">' + e(meta) + '</span></div></div>';
  }
  function button(label, ghost) { return '<div class="wb-btn-row"><a class="wb-btn' + (ghost ? ' ghost' : '') + '" href="#">' + e(label) + '</a></div>'; }
  function buttons(list) { return '<div class="wb-btn-row">' + list.map(function (b, i) { return '<a class="wb-btn' + (i ? ' ghost' : '') + '" href="#">' + e(b) + '</a>'; }).join('') + '</div>'; }
  function cols(list) {
    return '<div class="wb-cols" style="--cols:' + list.length + '">' + list.map(function (c) { return '<div class="wb-col" data-wb-slot>' + c + '</div>'; }).join('') + '</div>';
  }
  function table(head, rows) {
    return '<div class="wb-table-wrap"><table class="wb-table"><thead><tr>' + head.map(function (h) { return '<th>' + e(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + e(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function acc(list) {
    return '<div class="wb-acc">' + list.map(function (q, i) { return '<details class="wb-acc-item"' + (i ? '' : ' open') + '><summary>' + e(q[0]) + '</summary><div class="wb-acc-body" data-wb-slot><p>' + e(q[1]) + '</p></div></details>'; }).join('') + '</div>';
  }
  function ul(list) { return '<ul>' + list.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>'; }
  function ol(list) { return '<ol>' + list.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ol>'; }
  function pull(t) { return '<p class="wb-pull">' + e(t) + '</p>'; }
  function lead(t) { return '<p class="wb-lead">' + e(t) + '</p>'; }
  function note(t) { return '<p class="wb-note">' + e(t) + '</p>'; }
  function tone(kind, icon, html) {
    return '<div class="wb-callout" data-tone="' + kind + '"><div class="wb-callout-icon">' + icon + '</div><div class="wb-callout-body" data-wb-slot><p>' + html + '</p></div></div>';
  }
  function mediaText(img, title, text) {
    return '<div class="wb-media-text">' + figure(img, title, 'Foto propia') + '<div class="wb-media-text-body" data-wb-slot><h3>' + e(title) + '</h3><p>' + e(text) + '</p></div></div>';
  }
  /** tarjeta de articulo para portadas de revista */
  function story(img, tag, title, text) {
    return '<span class="section-kicker">' + e(tag) + '</span>' + figure(img, title, 'Foto propia') + '<h3>' + e(title) + '</h3><p>' + e(text) + '</p>';
  }

  var T = [];
  function tpl(o) { T.push(o); }

  /* ======================================= lectura y opinion ======= */

  tpl({
    id: 'ensayo-largo', name: 'Ensayo de lectura larga', group: 'Lectura y opinión',
    desc: 'Una sola columna estrecha, letra grande con serifa, firma y citas destacadas. Para leer sin distracciones.',
    palette: 'grafito', thumb: { pal: 'grafito', bgId: 'folio-marfil', center: true },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'folio-marfil'),
          header({ brand: 'CUADERNO ABIERTO', sub: 'Ensayos y crónicas', emblem: '¶', nav: ['Inicio', 'Ensayo'] }),
          hero(name, { cls: 'hero-center', img: null, badge: 'Ensayo · 12 min de lectura', lead: 'Una idea contada con calma, de principio a fin, como se cuentan las cosas que importan.', meta: ['🗓️ Fecha', '⏱️ 12 min', '✍️ Autor'] }),
          body(false,
            section('', 'Empezar por una escena', byline('Nombre del autor', 'Publicado el 18 de noviembre · 12 min de lectura') +
              ps([first('Los buenos ensayos empiezan en un lugar concreto: una cocina a las siete de la mañana, un andén vacío, una conversación que no termina. Empieza por ahí y deja que el lector entre contigo.'), 'Después abre el plano. Explica por qué esa escena te llevó a pensar en algo más grande y qué pregunta quieres responder.']) +
              pull('La pregunta es más importante que la respuesta: es lo que hace que el lector siga.')),
            section('', 'El argumento', ps(['Desarrolla la idea en párrafos cortos. Cada párrafo, una sola idea; cada idea, apoyada en un ejemplo, un dato o una experiencia.', 'No tengas miedo de los matices: un ensayo honesto reconoce lo que no sabe.']) +
              quote('Escribir es pensar dos veces: una al escribir y otra al leer lo escrito.', 'Cita de un autor') +
              ps(['Vuelve a la escena del principio y muestra cómo ha cambiado su sentido.'])),
            section('', 'Para terminar', ps(['Cierra con una frase que el lector se lleve puesta. Sin moraleja: basta con una imagen clara.']) + note('Notas y fuentes: añade aquí las referencias que hayas usado.'))
          )
        ]),
        set: { fontDisplay: 'Libre Baskerville', fontBody: 'Source Serif 4', radius: 'sm' }
      };
    }
  });

  tpl({
    id: 'boletin', name: 'Boletín por correo', group: 'Lectura y opinión',
    desc: 'Formato de newsletter: saludo, «en este número», piezas breves, enlaces de la semana y caja de suscripción.',
    palette: 'vino', thumb: { pal: 'vino', bgId: 'carta-antigua', center: true },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'carta-antigua'),
          header({ brand: 'LA CARTA DEL LUNES', sub: 'Boletín semanal', emblem: '✉', nav: ['Inicio', 'Este número', 'Enlaces', 'Suscríbete'] }),
          hero(name, { cls: 'hero-center', img: null, badge: 'Número 1 · Semana del 18 de noviembre', lead: 'Lo que he leído, lo que he pensado y lo que merece la pena de esta semana, en cinco minutos.', meta: ['✉️ Cada lunes', '⏱️ 5 min', '👥 Lectores'] }),
          body(false,
            section('Hola', 'En este número', ps([first('Querido lector: esta semana ha pasado de todo y quiero contártelo con calma. Aquí va lo más importante.')]) + ol(['La historia de la semana', 'Tres enlaces que valen la pena', 'Una recomendación para el fin de semana'])),
            section('La historia', 'Lo que más me ha hecho pensar', ps(['Escribe aquí la pieza principal del boletín: una reflexión, una noticia comentada o una historia personal.']) + pull('Una frase que resuma la semana.')),
            section('Enlaces', 'Tres cosas que leer', cards([['Un artículo largo', 'Por qué merece la pena leerlo, en una línea.'], ['Un vídeo corto', 'Qué tiene de especial.']]) + ul(['Un tercer enlace con su comentario'])),
            section('Suscríbete', '¿Te ha gustado?', tone('ok', '💌', '<strong>Recibe la carta cada lunes.</strong> Sin publicidad y sin prisas. Puedes darte de baja cuando quieras.') + button('Quiero suscribirme'))
          )
        ]),
        set: { fontDisplay: 'Playfair Display', fontBody: 'Lora', radius: 'md' }
      };
    }
  });

  tpl({
    id: 'entrevista', name: 'Entrevista', group: 'Lectura y opinión',
    desc: 'Presentación del personaje, preguntas en negrita, respuestas y frases destacadas. Fondo de papel de periódico.',
    palette: 'tinta', thumb: { pal: 'tinta', bgId: 'periodico', img: SC.redaccion },
    build: function (name) {
      var qa = function (q, a) { return '<p><strong>' + e(q) + '</strong></p><p>' + e(a) + '</p>'; };
      return {
        body: page([
          pageBg(null, '', 0, 'periodico'),
          header({ brand: 'CONVERSACIONES', sub: 'Entrevistas sin prisa', emblem: '«»', nav: ['Inicio', 'Quién es', 'La entrevista'] }),
          hero(name, { img: SC.redaccion, badge: 'Entrevista', lead: 'Hablamos durante dos horas sobre su oficio, sus dudas y lo que ha aprendido por el camino.', meta: ['📍 Lugar', '🗓️ Fecha', '🎙️ Entrevista de'], cap: 'Durante la conversación', credit: 'Foto propia' }),
          body(false,
            section('Quién es', 'Perfil', ps([first('Presenta a la persona en un párrafo: a qué se dedica, por qué es interesante y en qué momento la encontramos.')]) + specs([['Profesión', 'A qué se dedica'], ['Edad', 'Años'], ['Lugar', 'Dónde vive']])),
            section('La entrevista', 'Preguntas y respuestas', qa('¿Cómo empezó todo?', 'Escribe la respuesta tal como la dijo, corrigiendo solo lo imprescindible para que se lea bien.') +
              pull('«La frase más potente de la entrevista, a tamaño grande»') +
              qa('¿Qué ha sido lo más difícil?', 'Otra respuesta. Alterna preguntas cortas con respuestas largas para dar ritmo.') +
              qa('¿Qué le diría a quien empieza?', 'La última respuesta suele ser la más personal.')),
            section('', 'Despedida', ps(['Cierra con un detalle del final del encuentro: un gesto, una frase al despedirse.']))
          )
        ]),
        set: { fontDisplay: 'DM Serif Display', fontBody: 'Source Serif 4', radius: 'sm' }
      };
    }
  });

  tpl({
    id: 'escritorio', name: 'Escritorio del escritor', group: 'Lectura y opinión',
    desc: 'El texto va en una hoja de papel sobre una mesa de nogal. Para diarios, relatos y cartas.',
    palette: 'terracota', thumb: { pal: 'terracota', bgId: 'madera-nogal', center: true },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'madera-nogal'),
          header({ brand: 'SOBRE LA MESA', sub: 'Relatos y cartas', emblem: '✒', nav: ['Inicio', 'El relato'] }),
          hero(name, { cls: 'hero-center', img: null, badge: 'Relato', lead: 'Una historia escrita a mano, una tarde de lluvia, con el café enfriándose al lado.', meta: ['🗓️ Fecha', '☕ Tiempo de lectura', '✍️ Autor'] }),
          body(false,
            section('I', 'Capítulo primero', ps([first('Érase una vez un comienzo. Escribe aquí tu relato: cada Intro es un párrafo nuevo, y puedes añadir imágenes, citas o separadores desde el panel.'), 'Los diálogos van con raya: —Así —dijo ella—, como en los libros.'])),
            section('II', 'Capítulo segundo', ps(['Continúa la historia. Si es larga, añade más secciones: cada una aparece en el índice.']) + '<div class="wb-divider" data-style="line"></div>' + ps(['Fin.']))
          )
        ]),
        set: { fontDisplay: 'EB Garamond', fontBody: 'EB Garamond', radius: 'sm' }
      };
    }
  });

  /* ======================================== revista y medios ======= */

  tpl({
    id: 'revista-digital', name: 'Revista digital', group: 'Revista y medios',
    desc: 'Portada a toda pantalla, colores intensos y rejilla de artículos con foto. En modo oscuro.',
    palette: 'violeta', thumb: { pal: 'violeta', img: SC.estadio, cover: true, dark: true },
    build: function (name) {
      return {
        body: page([
          header({ brand: 'PULSO', sub: 'Cultura, tecnología y ciencia', emblem: '◆', nav: ['Portada', 'Destacados', 'Lo último', 'Opinión'] }),
          hero(name, { cls: 'hero-cover', img: SC.estadio, badge: 'Portada · Reportaje', lead: 'La historia que todo el mundo comenta esta semana, contada desde dentro.', meta: ['✍️ Redacción', '🗓️ Fecha', '⏱️ 9 min'], cap: 'La imagen de la semana', credit: 'Foto propia' }),
          body(false,
            section('Destacados', 'Lo más leído', cols([story(SC.laboratorio, 'Ciencia', 'Un hallazgo que cambia lo que sabíamos', 'Dos líneas de entradilla que invitan a leer.'), story(SC.concierto, 'Cultura', 'La gira del año, de cerca', 'Dos líneas de entradilla que invitan a leer.'), story(SC.bolsa, 'Economía', 'Qué significan los nuevos datos', 'Dos líneas de entradilla que invitan a leer.')])),
            section('Lo último', 'Recién publicado', cols([story(SC.ciudad, 'Ciudad', 'El barrio que se reinventa', 'Entradilla breve.'), story(SC.tren, 'Viajes', 'En tren hasta el final de la línea', 'Entradilla breve.')])),
            section('Opinión', 'Firmas', byline('Nombre del columnista', 'Columna semanal') + ps(['El arranque de la columna de opinión, en un párrafo que engancha.']) + button('Leer la columna', true))
          )
        ]),
        set: { fontDisplay: 'Archivo Black', fontBody: 'Inter', radius: 'md', startTheme: 'dark' }
      };
    }
  });

  tpl({
    id: 'directo', name: 'Directo minuto a minuto', group: 'Revista y medios',
    desc: 'Seguimiento en vivo: última hora, cronología con horas, claves y datos. Para elecciones, partidos o eventos.',
    palette: 'tinta', thumb: { pal: 'tinta', bgId: 'grad-perla', img: SC.plaza },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'grad-perla'),
          header({ brand: 'EN DIRECTO', sub: 'Seguimiento al minuto', emblem: '●', nav: ['Inicio', 'Última hora', 'Claves'] }),
          hero(name, { img: SC.plaza, badge: '● En directo', lead: 'Sigue aquí todo lo que está pasando, actualizado cada pocos minutos.', meta: ['🕒 Actualizado a las 18:42', '📍 Lugar', '✍️ Redacción'], cap: 'Imagen de la jornada', credit: 'Foto propia' }),
          stats([['18:42', 'Última actualización'], ['24', 'Entradas'], ['3', 'Claves'], ['1', 'Lugar']]),
          body(true,
            section('Última hora', 'Lo más reciente', tone('danger', '🔴', '<strong>Última hora:</strong> escribe aquí el titular urgente del momento.') +
              timeline([['18:42 · Nueva información', 'Qué ha pasado, en dos líneas.'], ['18:15 · Reacción', 'Quién ha dicho qué.'], ['17:50 · Comienzo', 'Cómo empezó la jornada.']])),
            section('Claves', 'Para entenderlo', cards([['Qué está pasando', 'El resumen para quien llega ahora.'], ['Por qué importa', 'Las consecuencias, en una frase.']]) + acc([['¿Dónde se puede seguir?', 'Indica dónde ver o escuchar el evento.'], ['¿Cuándo termina?', 'Hora prevista de cierre.']]))
          )
        ]),
        set: { fontDisplay: 'Oswald', fontBody: 'Roboto', radius: 'sm' }
      };
    }
  });

  tpl({
    id: 'ensayo-fotografico', name: 'Ensayo fotográfico', group: 'Revista y medios',
    desc: 'Las fotos mandan: portada a toda pantalla, imágenes grandes con pie y poco texto, sobre cartulina negra.',
    palette: 'grafito', thumb: { pal: 'grafito', img: SC.montana, cover: true, dark: true },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'cartulina-negra'),
          header({ brand: 'LUZ NATURAL', sub: 'Fotografía y relato', emblem: '◐', nav: ['Inicio', 'Serie', 'Galería'] }),
          hero(name, { cls: 'hero-cover', img: SC.montana, badge: 'Ensayo fotográfico', lead: 'Doce imágenes y pocas palabras: un lugar contado con luz.', meta: ['📍 Lugar', '📷 Cámara', '🗓️ Año'], cap: 'Primera luz sobre la cumbre', credit: 'Foto propia' }),
          body(false,
            section('I', 'Amanecer', figure(SC.montana, 'La primera luz', 'Foto propia') + ps(['Un párrafo breve que acompañe a la imagen: dónde, cuándo y qué sentiste al hacerla.'])),
            section('II', 'Mediodía', figure(SC.campo, 'El campo a pleno sol', 'Foto propia') + figure(SC.puente, 'El puente', 'Foto propia')),
            section('III', 'Noche', figure(SC.autopista, 'Las luces de la carretera', 'Foto propia') + quote('Fotografiar es elegir qué dejar fuera.', 'Notas de campo')),
            section('Galería', 'La serie completa', gallery([[SC.montana, 'I'], [SC.campo, 'II'], [SC.puente, 'III'], [SC.faro, 'IV'], [SC.playa, 'V'], [SC.autopista, 'VI']]))
          )
        ]),
        set: { fontDisplay: 'Raleway', fontBody: 'Inter', radius: 'none', startTheme: 'dark' }
      };
    }
  });

  tpl({
    id: 'podcast', name: 'Episodio de pódcast', group: 'Revista y medios',
    desc: 'Ficha del episodio, botón para escuchar, notas con marcas de tiempo, invitados y enlaces. Degradado de medianoche.',
    palette: 'violeta', thumb: { pal: 'violeta', bgId: 'grad-medianoche', dark: true, img: SC.concierto },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'grad-medianoche'),
          header({ brand: 'ONDA LARGA', sub: 'Un pódcast de conversación', emblem: '🎧', nav: ['Inicio', 'Episodio', 'Notas', 'Enlaces'] }),
          hero(name, { img: SC.concierto, badge: 'Episodio 12', lead: 'Una conversación de una hora sobre lo que nos mueve. Dale al play y quédate.', meta: ['⏱️ 58 min', '🗓️ Fecha', '🎙️ Presenta'], cap: 'En el estudio', credit: 'Foto propia' }),
          body(true,
            section('Episodio', 'Escúchalo', buttons(['▶ Escuchar ahora', 'Descargar']) + specs([['Duración', '58 minutos'], ['Invitado', 'Nombre del invitado'], ['Tema', 'De qué hablamos']])),
            section('Notas', 'Marcas de tiempo', table(['Minuto', 'Tema'], [['00:00', 'Presentación'], ['04:30', 'Primera pregunta'], ['21:10', 'El momento clave'], ['49:00', 'Despedida']])),
            section('Enlaces', 'Lo que mencionamos', ul(['Un libro que salió en la conversación', 'Un artículo para ampliar', 'La web del invitado']) + callout('💬', '<strong>¿Tienes una pregunta?</strong> Escríbenos y la leeremos en el próximo episodio.'))
          )
        ]),
        set: { fontDisplay: 'Space Grotesk', fontBody: 'Inter', radius: 'lg', startTheme: 'dark' }
      };
    }
  });

  tpl({
    id: 'deportes', name: 'Crónica deportiva', group: 'Revista y medios',
    desc: 'Marcador en cifras, crónica, jugadas clave en cronología y tabla de clasificación. Fondo de césped.',
    palette: 'huerta', thumb: { pal: 'huerta', bgId: 'cesped', img: SC.estadio },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'cesped'),
          header({ brand: 'TERCER TIEMPO', sub: 'Deporte local', emblem: '⚽', nav: ['Inicio', 'La crónica', 'Jugadas', 'Clasificación'] }),
          hero(name, { img: SC.estadio, badge: 'Crónica · Jornada 12', lead: 'Un partido de los que se recuerdan: remontada, emoción y un final de infarto.', meta: ['🏟️ Estadio', '🗓️ Fecha', '👥 Asistencia'], cap: 'El estadio, lleno', credit: 'Foto propia' }),
          stats([['3 – 2', 'Resultado final'], ['58 %', 'Posesión'], ['14', 'Tiros'], ['9.400', 'Espectadores']]),
          body(true,
            section('La crónica', 'Así fue el partido', ps([first('Empieza por el momento decisivo y después cuenta el partido en orden: el planteamiento, los goles, los cambios y el final.')])),
            section('Jugadas', 'Minuto a minuto', timeline([['12′ · Gol', 'Quién marcó y cómo.'], ['55′ · Empate', 'La reacción del rival.'], ['89′ · Gol de la victoria', 'El momento que nadie olvidará.']])),
            section('Clasificación', 'Así va la liga', table(['Pos.', 'Equipo', 'Puntos'], [['1', 'Equipo A', '28'], ['2', 'Equipo B', '25'], ['3', 'Equipo C', '24'], ['4', 'Equipo D', '21']])))
        ]),
        set: { fontDisplay: 'Bebas Neue', fontBody: 'Roboto', radius: 'md' }
      };
    }
  });

  /* ========================================== practicas y guias ===== */

  tpl({
    id: 'receta', name: 'Receta con ficha', group: 'Prácticas y guías',
    desc: 'Botón «ir a la receta», ficha de tiempos, ingredientes, pasos numerados, información nutricional y preguntas. Sobre madera de olivo.',
    palette: 'terracota', thumb: { pal: 'terracota', bgId: 'madera-olivo', img: SC.mercado },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'madera-olivo'),
          header({ brand: 'COCINA DE DOMINGO', sub: 'Recetas probadas en casa', emblem: '🍳', nav: ['Inicio', 'La historia', 'Receta', 'Preguntas'] }),
          hero(name, { img: SC.mercado, badge: 'Receta · Plato principal', lead: 'La receta que más nos piden: fácil, de temporada y con un truco que lo cambia todo.', meta: ['⏱️ 50 min', '👥 4 raciones', '⭐ 4,9 (120 votos)'], cap: 'Todo listo para empezar', credit: 'Foto propia' }),
          body(true,
            section('La historia', 'Por qué esta receta', button('↓ Ir directamente a la receta', true) + ps([first('Cuenta en pocas líneas de dónde viene la receta y por qué te gusta. Breve: quien llega quiere cocinar.')])),
            section('Receta', 'Ficha', specs([['Preparación', '15 min'], ['Cocción', '35 min'], ['Dificultad', 'Fácil']]) +
              cols(['<h3>Ingredientes</h3>' + ul(['400 g del ingrediente principal', '1 cebolla', '2 dientes de ajo', 'Aceite de oliva, sal y pimienta']), '<h3>Utensilios</h3>' + ul(['Una cazuela de fondo grueso', 'Tabla y cuchillo', 'Cuchara de madera'])]) +
              '<h3>Paso a paso</h3>' + ol(['Prepara todos los ingredientes antes de empezar.', 'Sofríe la cebolla y el ajo a fuego medio.', 'Añade el ingrediente principal y cocina 30 minutos.', 'Rectifica de sal y deja reposar 5 minutos.']) +
              tone('warn', '💡', '<strong>El truco:</strong> escribe aquí ese detalle que marca la diferencia.') +
              table(['Por ración', 'Cantidad'], [['Calorías', '420 kcal'], ['Proteínas', '24 g'], ['Hidratos', '38 g'], ['Grasas', '16 g']])),
            section('Preguntas', 'Dudas frecuentes', acc([['¿Se puede congelar?', 'Sí, hasta tres meses en un recipiente hermético.'], ['¿Con qué lo acompaño?', 'Con pan, arroz blanco o una ensalada verde.'], ['¿Se puede hacer sin gluten?', 'Explica aquí la alternativa.']]))
          )
        ]),
        set: { fontDisplay: 'Abril Fatface', fontBody: 'Lora', radius: 'lg' }
      };
    }
  });

  tpl({
    id: 'guia-viaje', name: 'Guía de viaje', group: 'Prácticas y guías',
    desc: 'Itinerario por días, presupuesto en tabla, dónde dormir, consejos y preguntas frecuentes. Fondo de mapa topográfico.',
    palette: 'mar', thumb: { pal: 'mar', bgId: 'mapa-topografico', img: SC.puerto },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'mapa-topografico'),
          header({ brand: 'MOCHILA LIGERA', sub: 'Guías para viajar mejor', emblem: '🧭', nav: ['Inicio', 'Itinerario', 'Presupuesto', 'Consejos'] }),
          hero(name, { img: SC.puerto, badge: 'Guía completa · 2026', lead: 'Todo lo que necesitas para organizar el viaje: ruta, presupuesto, alojamiento y los errores que no debes cometer.', meta: ['📍 Destino', '🗓️ 5 días', '💶 Presupuesto medio'], cap: 'Llegando al puerto', credit: 'Foto propia' }),
          stats([['5', 'Días'], ['650 €', 'Por persona'], ['8', 'Imprescindibles'], ['Mayo', 'Mejor época']]),
          body(true,
            section('Itinerario', 'Día a día', timeline([['Día 1 · Llegada', 'Del aeropuerto al centro y primer paseo.'], ['Día 2 · El casco antiguo', 'Museos, mercado y miradores.'], ['Día 3 · Excursión', 'Un día fuera de la ciudad.'], ['Días 4 y 5 · A tu aire', 'Playas, compras y despedida.']]) + figure(SC.tren, 'El tren de la excursión', 'Foto propia')),
            section('Presupuesto', 'Cuánto cuesta', table(['Concepto', 'Precio aprox.', 'Notas'], [['Vuelos', '180 €', 'Con antelación'], ['Alojamiento', '300 €', '4 noches'], ['Comidas', '120 €', 'Menús del día'], ['Transporte y entradas', '50 €', 'Bono turístico']])),
            section('Dónde dormir', 'Por zonas', cards([['Centro', 'Caro, pero a pie de todo.'], ['Junto al puerto', 'Más tranquilo y con buenas vistas.']])),
            section('Consejos', 'Antes de ir', acc([['¿Hace falta coche?', 'No: el transporte público llega a todas partes.'], ['¿Es seguro?', 'Sí, con las precauciones habituales.'], ['¿Qué llevar?', 'Calzado cómodo, adaptador y una chaqueta para la noche.']]))
          )
        ]),
        set: { fontDisplay: 'Montserrat', fontBody: 'Open Sans', radius: 'lg' }
      };
    }
  });

  tpl({
    id: 'tutorial', name: 'Tutorial técnico', group: 'Prácticas y guías',
    desc: 'Requisitos, pasos numerados con código, avisos, solución de problemas y resumen. Sobre plano técnico azul.',
    palette: 'mar', thumb: { pal: 'mar', bgId: 'plano-azul', dark: true },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'plano-azul'),
          header({ brand: 'MANUAL ABIERTO', sub: 'Tutoriales paso a paso', emblem: '{ }', nav: ['Inicio', 'Requisitos', 'Pasos', 'Problemas'] }),
          hero(name, { img: SC.laboratorio, badge: 'Tutorial · Nivel intermedio', lead: 'En veinte minutos lo tendrás funcionando. Te explico cada paso y qué hacer si algo falla.', meta: ['⏱️ 20 min', '🧰 Nivel medio', '🗓️ Actualizado'], cap: 'El resultado final', credit: 'Captura propia' }),
          body(true,
            section('Requisitos', 'Antes de empezar', ul(['Un ordenador con conexión a internet', 'El programa instalado (versión 2 o superior)', 'Veinte minutos sin interrupciones']) + tone('info', 'ℹ️', 'Si ya lo tienes instalado, salta directamente al paso 2.')),
            section('Pasos', 'Paso a paso', '<h3>1. Prepara el proyecto</h3><p>Crea una carpeta nueva y ábrela en la terminal.</p><pre class="wb-code">mkdir mi-proyecto\ncd mi-proyecto</pre>' +
              '<h3>2. Configura</h3><p>Copia esta configuración en un archivo nuevo.</p><pre class="wb-code">modo = "produccion"\npuerto = 8080</pre>' +
              '<h3>3. Comprueba</h3><p>Arranca y abre el navegador en la dirección indicada.</p>' + tone('ok', '✅', 'Si ves la página de bienvenida, ¡ya está!')),
            section('Problemas', 'Si algo falla', acc([['Aparece «orden no encontrada»', 'El programa no está en el PATH: vuelve a instalarlo marcando la opción correspondiente.'], ['El puerto está ocupado', 'Cambia el número de puerto en la configuración.']]) + tone('warn', '⚠️', 'Haz siempre una copia de seguridad antes de cambiar la configuración.'))
          )
        ]),
        set: { fontDisplay: 'Space Grotesk', fontBody: 'Inter', radius: 'md' }
      };
    }
  });

  tpl({
    id: 'lista-consejos', name: 'Lista de consejos', group: 'Prácticas y guías',
    desc: 'El clásico «10 ideas para…»: cada consejo con su número grande, explicación y un resumen al final. Fondo de lunares.',
    palette: 'violeta', thumb: { pal: 'violeta', bgId: 'geo-lunares', center: true },
    build: function (name) {
      var tip = function (n, t, p) { return section('Consejo ' + n, t, ps([p])); };
      return {
        body: page([
          pageBg(null, '', 0, 'geo-lunares'),
          header({ brand: 'IDEAS ÚTILES', sub: 'Consejos que funcionan', emblem: '✓', nav: ['Inicio', 'Los consejos', 'Resumen'] }),
          hero(name, { cls: 'hero-center', img: null, badge: '7 consejos · 6 min', lead: 'Siete ideas sencillas que puedes aplicar hoy mismo. Probadas, explicadas y sin complicaciones.', meta: ['⏱️ 6 min', '🗓️ Fecha', '✍️ Autor'] }),
          body(true,
            tip(1, 'Empieza por lo más fácil', 'Explica el consejo en dos o tres frases y da un ejemplo concreto.'),
            tip(2, 'Hazlo cada día un poco', 'La constancia vale más que el esfuerzo de un día.'),
            tip(3, 'Pide ayuda a tiempo', 'Nadie lo sabe todo: preguntar ahorra horas.'),
            tip(4, 'Mide lo que haces', 'Lo que no se mide no mejora.'),
            tip(5, 'Quita lo que sobra', 'Menos es más, también aquí.'),
            tip(6, 'Descansa', 'El descanso también es trabajo.'),
            tip(7, 'Celebra los avances', 'Reconocer lo conseguido da fuerzas para seguir.'),
            section('Resumen', 'En una frase', callout('📌', '<strong>Resumen:</strong> empieza fácil, sé constante y celebra cada paso.'))
          )
        ]),
        set: { fontDisplay: 'Poppins', fontBody: 'Inter', radius: 'lg' }
      };
    }
  });

  tpl({
    id: 'analisis-producto', name: 'Análisis de producto', group: 'Prácticas y guías',
    desc: '«Nuestra elección» al principio, pros y contras en columnas, tabla comparativa, cómo lo probamos y veredicto.',
    palette: 'mar', thumb: { pal: 'mar', bgId: 'folio-blanco', img: SC.laboratorio },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'folio-blanco'),
          header({ brand: 'PROBADO A FONDO', sub: 'Análisis independientes', emblem: '★', nav: ['Inicio', 'Elección', 'Comparativa', 'Cómo probamos'] }),
          hero(name, { img: SC.laboratorio, badge: 'Análisis · Actualizado', lead: 'Hemos probado los modelos más vendidos durante seis semanas. Este es el que recomendamos y por qué.', meta: ['🧪 6 semanas de pruebas', '🔢 8 modelos', '🗓️ Actualizado'], cap: 'En el banco de pruebas', credit: 'Foto propia' }),
          body(true,
            section('Nuestra elección', 'El mejor para la mayoría', tone('ok', '🏆', '<strong>Nuestra elección: Modelo A.</strong> El más equilibrado en precio, calidad y duración.') +
              cols(['<h3>👍 A favor</h3>' + ul(['Muy fácil de usar', 'Buena relación calidad-precio', 'Garantía de tres años']), '<h3>👎 En contra</h3>' + ul(['Algo pesado', 'Pocos colores'])])),
            section('Comparativa', 'Frente a frente', table(['Modelo', 'Precio', 'Nota', 'Para quién'], [['Modelo A', '149 €', '9,1', 'La mayoría'], ['Modelo B', '89 €', '8,2', 'Presupuesto ajustado'], ['Modelo C', '249 €', '8,8', 'Uso intensivo']])),
            section('Cómo probamos', 'Nuestro método', ps(['Explica cómo hiciste las pruebas, durante cuánto tiempo y con qué criterios. La transparencia es lo que da valor al análisis.'])),
            section('Veredicto', 'Conclusión', quote('Si solo puedes comprar uno, que sea este.', 'Nuestro equipo') + note('No recibimos dinero de los fabricantes por estos análisis.'))
          )
        ]),
        set: { fontDisplay: 'Merriweather', fontBody: 'Inter', radius: 'md' }
      };
    }
  });

  tpl({
    id: 'bricolaje', name: 'Bricolaje paso a paso', group: 'Prácticas y guías',
    desc: 'Materiales y herramientas en fichas, pasos con foto, consejos de seguridad. Sobre tablas de pino.',
    palette: 'terracota', thumb: { pal: 'terracota', bgId: 'madera-pino-tablas', img: SC.fabrica },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'madera-pino-tablas'),
          header({ brand: 'MANOS A LA OBRA', sub: 'Bricolaje y reformas', emblem: '🔨', nav: ['Inicio', 'Materiales', 'Pasos', 'Seguridad'] }),
          hero(name, { img: SC.fabrica, badge: 'Bricolaje · Nivel fácil', lead: 'Un proyecto de fin de semana con herramientas básicas y un resultado que parece de tienda.', meta: ['⏱️ 4 horas', '💶 35 €', '🔧 Fácil'], cap: 'El taller listo', credit: 'Foto propia' }),
          body(true,
            section('Materiales', 'Lo que necesitas', specs([['Madera', '3 tablas de 120 × 20 cm'], ['Tornillería', '24 tornillos de 4 × 40'], ['Acabado', 'Barniz al agua']]) + ul(['Taladro atornillador', 'Lija de grano 120 y 240', 'Metro y lápiz', 'Sargentos'])),
            section('Pasos', 'Cómo se hace', mediaText(SC.fabrica, '1. Mide y corta', 'Marca las piezas con lápiz y corta con calma. Mide dos veces, corta una.') + mediaText(SC.edificio, '2. Monta la estructura', 'Une las piezas con cola y tornillos, comprobando la escuadra.') + mediaText(SC.campo, '3. Lija y barniza', 'Dos manos de barniz con lijado suave entre ellas.')),
            section('Seguridad', 'Ojo con esto', tone('warn', '🦺', '<strong>Protégete:</strong> gafas, guantes y mascarilla al lijar. Trabaja en un lugar ventilado.'))
          )
        ]),
        set: { fontDisplay: 'Roboto Slab', fontBody: 'Roboto', radius: 'sm' }
      };
    }
  });

  tpl({
    id: 'explicador', name: 'Explicador ilustrado', group: 'Prácticas y guías',
    desc: 'Explicar algo difícil con humor: preguntas, cajas, notas al margen y glosario. En hoja cuadriculada.',
    palette: 'mar', thumb: { pal: 'mar', bgId: 'folio-cuadriculado', center: true },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'folio-cuadriculado'),
          header({ brand: 'ESO TIENE EXPLICACIÓN', sub: 'Ideas grandes, explicadas fácil', emblem: '?', nav: ['Inicio', 'La pregunta', 'La explicación', 'Glosario'] }),
          hero(name, { cls: 'hero-center', img: null, badge: 'Explicador', lead: 'Una pregunta que parece sencilla, una respuesta que no lo es tanto y un montón de dibujos por el camino.', meta: ['⏱️ 15 min', '🧠 Para curiosos', '✍️ Autor'] }),
          body(true,
            section('La pregunta', '¿Por qué pasa esto?', ps([first('Plantea la pregunta como la haría un niño curioso. Las mejores explicaciones empiezan con un «¿y por qué?».')]) + callout('🤔', '<strong>Piénsalo un momento</strong> antes de seguir leyendo: ¿qué responderías tú?')),
            section('La explicación', 'Por partes', '<h3>Parte 1: lo básico</h3><p>Empieza por lo que todo el mundo sabe.</p><h3>Parte 2: lo sorprendente</h3><p>Luego, el dato que cambia la perspectiva.</p>' + tone('ok', '✏️', 'Nota al margen: los dibujos ayudan. Añade una imagen o un texto artístico desde el panel.') + pull('Lo complicado se entiende cuando se cuenta paso a paso.')),
            section('Glosario', 'Palabras difíciles', acc([['Palabra uno', 'Su definición en lenguaje llano.'], ['Palabra dos', 'Otra definición sencilla.']]))
          )
        ]),
        set: { fontDisplay: 'Caveat', fontBody: 'Plus Jakarta Sans', radius: 'md' }
      };
    }
  });

  /* ================================================ tematicas ======= */

  tpl({
    id: 'moda', name: 'Moda y estilo', group: 'Temáticas',
    desc: 'Pastel y elegante: portada con foto grande, looks en columnas, galería y lista de compras. Degradado melocotón.',
    palette: 'vino', thumb: { pal: 'vino', bgId: 'grad-melocoton', img: SC.ciudad },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'grad-melocoton'),
          header({ brand: 'PASARELA', sub: 'Estilo de cada día', emblem: '✿', nav: ['Inicio', 'Los looks', 'Galería', 'Dónde comprar'] }),
          hero(name, { img: SC.ciudad, badge: 'Tendencias · Otoño', lead: 'Tres maneras de llevar la prenda de la temporada, del lunes al domingo.', meta: ['🗓️ Temporada', '✨ Tendencia', '✍️ Autora'], cap: 'Paseo de otoño', credit: 'Foto propia' }),
          body(false,
            section('Los looks', 'Tres estilos', cols(['<h3>Para trabajar</h3><p>Sencillo y cómodo, con un toque de color.</p>', '<h3>Para el fin de semana</h3><p>Informal, con zapatillas blancas.</p>', '<h3>Para salir</h3><p>Con complementos dorados.</p>'])),
            section('Galería', 'Inspiración', gallery([[SC.ciudad, 'Ciudad'], [SC.lluvia, 'Lluvia'], [SC.playa, 'Verano']])),
            section('Dónde comprar', 'La lista', ul(['Prenda principal — tienda', 'Complemento — tienda', 'Calzado — tienda']) + note('Ningún enlace es publicidad.'))
          )
        ]),
        set: { fontDisplay: 'Playfair Display', fontBody: 'Raleway', radius: 'lg' }
      };
    }
  });

  tpl({
    id: 'portafolio', name: 'Portafolio de estudio', group: 'Temáticas',
    desc: 'Titular tipográfico enorme, proyectos en rejilla, servicios, proceso y contacto. Sobre hormigón.',
    palette: 'grafito', thumb: { pal: 'grafito', bgId: 'hormigon', center: true },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'hormigon'),
          header({ brand: 'ESTUDIO NORTE', sub: 'Diseño y comunicación', emblem: 'N', nav: ['Inicio', 'Proyectos', 'Servicios', 'Contacto'] }),
          hero(name, { cls: 'hero-center', img: null, badge: 'Portafolio 2026', lead: 'Diseñamos marcas, webs y publicaciones con una idea clara detrás de cada decisión.', meta: ['📍 Ciudad', '👥 6 personas', '🗓️ Desde 2015'] }),
          body(false,
            section('Proyectos', 'Trabajo reciente', cols([story(SC.edificio, 'Identidad', 'Marca para un museo', 'Rediseño completo de identidad y señalética.'), story(SC.puente, 'Web', 'Portal de una ciudad', 'Arquitectura de la información y diseño.'), story(SC.redaccion, 'Editorial', 'Revista trimestral', 'Maqueta, tipografía y dirección de arte.')])),
            section('Servicios', 'Qué hacemos', specs([['Marca', 'Identidad, logotipo y manual'], ['Digital', 'Webs, apps y contenidos'], ['Editorial', 'Libros, revistas e informes']])),
            section('Proceso', 'Cómo trabajamos', timeline([['1 · Escuchar', 'Entender el problema antes de dibujar nada.'], ['2 · Proponer', 'Dos o tres caminos, bien argumentados.'], ['3 · Afinar', 'Detalle a detalle hasta la entrega.']])),
            section('Contacto', 'Hablemos', buttons(['Escríbenos', 'Descarga el dosier']))
          )
        ]),
        set: { fontDisplay: 'Anton', fontBody: 'Inter', radius: 'none' }
      };
    }
  });

  tpl({
    id: 'resena-libro', name: 'Reseña de libro', group: 'Temáticas',
    desc: 'Ficha del libro, nota, citas subrayadas, para quién es y libros parecidos. Sobre pergamino.',
    palette: 'tinta', thumb: { pal: 'tinta', bgId: 'pergamino', center: true },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'pergamino'),
          header({ brand: 'CLUB DE LECTURA', sub: 'Libros que dejan huella', emblem: '📖', nav: ['Inicio', 'La ficha', 'La reseña', 'Si te gustó'] }),
          hero(name, { cls: 'hero-center', img: null, badge: 'Reseña · Novela', lead: 'Una historia que se lee de un tirón y se recuerda durante semanas.', meta: ['⭐ 4,5 / 5', '📄 320 páginas', '✍️ Reseña de'] }),
          body(true,
            section('La ficha', 'El libro', specs([['Título', 'Título del libro'], ['Autor', 'Nombre del autor'], ['Editorial y año', 'Editorial, año']]) + stats([['4,5', 'Nota'], ['320', 'Páginas'], ['2026', 'Edición'], ['3 días', 'En leerlo']])),
            section('La reseña', 'Qué me ha parecido', ps([first('Resume el argumento sin destripar el final y di qué te ha parecido: los personajes, el estilo, el ritmo.')]) + quote('Una frase subrayada del libro, la que más te haya gustado.', 'Página 112')),
            section('Si te gustó', 'Para seguir leyendo', cards([['Un libro parecido', 'Por qué te gustará.'], ['Otro del mismo autor', 'Qué tienen en común.']]))
          )
        ]),
        set: { fontDisplay: 'Old Standard TT', fontBody: 'Libre Baskerville', radius: 'sm' }
      };
    }
  });

  tpl({
    id: 'ciencia', name: 'Divulgación científica', group: 'Temáticas',
    desc: 'Datos clave, explicación por partes, glosario y fuentes. Pizarra negra en modo oscuro.',
    palette: 'mar', thumb: { pal: 'mar', bgId: 'pizarra-negra', dark: true, img: SC.laboratorio },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'pizarra-negra'),
          header({ brand: 'LABORATORIO ABIERTO', sub: 'Ciencia para todos', emblem: '⚗', nav: ['Inicio', 'El dato', 'Cómo funciona', 'Fuentes'] }),
          hero(name, { img: SC.laboratorio, badge: 'Ciencia · Divulgación', lead: 'Qué dice la investigación, cómo se ha llegado hasta ahí y qué significa para nuestra vida.', meta: ['🔬 Estudio de 2026', '⏱️ 10 min', '✍️ Autor'], cap: 'En el laboratorio', credit: 'Foto propia' }),
          stats([['95 %', 'Confianza'], ['1.200', 'Participantes'], ['4 años', 'De estudio'], ['12', 'Países']]),
          body(true,
            section('El dato', 'Lo esencial', ps([first('Empieza por el hallazgo en una frase y explica por qué es importante.')]) + tone('info', '🔎', '<strong>Ojo:</strong> un estudio no es una verdad absoluta. Explica sus límites.')),
            section('Cómo funciona', 'Paso a paso', timeline([['La hipótesis', 'Qué querían comprobar.'], ['El experimento', 'Cómo lo midieron.'], ['El resultado', 'Qué encontraron.']]) + figure(SC.eolico, 'Una imagen que ayude a entenderlo', 'Foto propia')),
            section('Fuentes', 'Para saber más', acc([['Glosario', 'Define aquí los términos técnicos.'], ['El estudio original', 'Referencia completa del artículo científico.']]) + note('Este artículo se ha revisado con la ayuda de especialistas.'))
          )
        ]),
        set: { fontDisplay: 'Space Grotesk', fontBody: 'Source Serif 4', radius: 'md', startTheme: 'dark' }
      };
    }
  });

  tpl({
    id: 'evento', name: 'Boda y eventos', group: 'Temáticas',
    desc: 'Invitación, programa del día, cómo llegar, alojamiento y confirmación de asistencia. Sobre lino.',
    palette: 'vino', thumb: { pal: 'vino', bgId: 'lino-natural', center: true },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'lino-natural'),
          header({ brand: 'NUESTRO DÍA', sub: 'Os esperamos', emblem: '♥', nav: ['Inicio', 'Programa', 'Cómo llegar', 'Confirma'] }),
          hero(name, { cls: 'hero-center', img: null, badge: 'Sábado, 20 de junio de 2026', lead: 'Nos casamos y queremos celebrarlo contigo. Aquí tienes todo lo que necesitas saber.', meta: ['📍 Lugar', '🕔 17:00 h', '👗 Etiqueta de verano'] }),
          body(false,
            section('Programa', 'El día', timeline([['17:00 · Ceremonia', 'En el jardín.'], ['18:30 · Aperitivo', 'Con música en directo.'], ['21:00 · Cena y baile', 'Hasta que el cuerpo aguante.']])),
            section('Cómo llegar', 'El lugar', figure(SC.vinedo, 'La finca entre viñedos', 'Foto propia') + cards([['En coche', 'Aparcamiento en la misma finca.'], ['En autobús', 'Saldrá uno desde el centro a las 16:15.']])),
            section('Confirma', '¿Vienes?', tone('ok', '💌', 'Confírmanos tu asistencia antes del 1 de mayo.') + button('Confirmar asistencia'))
          )
        ]),
        set: { fontDisplay: 'Dancing Script', fontBody: 'Lora', radius: 'lg' }
      };
    }
  });

  tpl({
    id: 'infantil', name: 'Aula e infantil', group: 'Temáticas',
    desc: 'Colores vivos, actividades en tarjetas, pasos sencillos y galería de trabajos. Fondo de confeti.',
    palette: 'violeta', thumb: { pal: 'violeta', bgId: 'confeti', center: true },
    build: function (name) {
      return {
        body: page([
          pageBg(null, '', 0, 'confeti'),
          header({ brand: 'EL AULA DIVERTIDA', sub: 'Aprender jugando', emblem: '★', nav: ['Inicio', 'Actividades', 'Paso a paso', 'Nuestros trabajos'] }),
          hero(name, { cls: 'hero-center', img: null, badge: 'Actividad · 6 a 10 años', lead: 'Una actividad para hacer en clase o en casa, con materiales que ya tienes.', meta: ['⏱️ 45 min', '👧 6-10 años', '✂️ Fácil'] }),
          body(false,
            section('Actividades', 'Elige una', cards([['🎨 Pintar', 'Con témperas y mucha imaginación.'], ['✂️ Recortar', 'Formas de colores para un mural.']]) + cards([['🔢 Contar', 'Juegos de números con tapones.'], ['📚 Leer', 'Un cuento y sus preguntas.']])),
            section('Paso a paso', 'Cómo se hace', ol(['Prepara el material en la mesa.', 'Explica la actividad con un ejemplo.', 'Deja que cada uno lo haga a su manera.', '¡Exponed los trabajos!'])),
            section('Nuestros trabajos', 'La galería', gallery([[SC.aula, 'En clase'], [SC.campo, 'De excursión'], [SC.playa, 'En verano']]))
          )
        ]),
        set: { fontDisplay: 'Pacifico', fontBody: 'Poppins', radius: 'lg' }
      };
    }
  });

  T.forEach(function (t) { WB.TEMPLATES.push(t); });
})();
