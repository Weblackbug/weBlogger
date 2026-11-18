/* ==========================================================================
   weBlogger - maqueta «cultural»: el suplemento de cultura y libros del fin
   de semana. Mucho aire, tipografia grande, pocas piezas y bien separadas.

   1. Portada: cabecera, un gran titular a todo el ancho, imagen muy amplia
      con la entradilla al lado y tres llamadas breves.
   2. El ensayo (dos columnas anchas con capitular y cita) y la conversacion
      (preguntas y respuestas rodeando el retrato).
   3. Criticas en rejilla, la agenda de la semana y el libro de la semana.

   No lleva CSS: solo piezas del kit de diario. Todo el texto sale del banco.
   ========================================================================== */
(function () {
  'use strict';

  var GENEROS = ['Libros', 'Música', 'Cine', 'Arte'];
  var OBRAS = ['Novela', 'Disco', 'Película', 'Exposición'];
  var NOTAS = ['Imprescindible', 'Muy recomendable', 'Notable', 'Con reservas'];
  var PAGINAS = ['Página 4', 'Página 9', 'Página 12'];

  // Agenda de reserva por si el banco aún no trae el tipo «agenda».
  var AGENDA = [
    { d: 'Jueves 19', t: 'Estreno de «La casa de los vientos», de la compañía Tramoya Norte', l: 'Teatro Principal, Castroval' },
    { d: 'Viernes 20', t: 'Cuarteto Aldera: los últimos cuartetos de cuerda del repertorio clásico', l: 'Auditorio del Puerto, Portalba' },
    { d: 'Sábado 21', t: 'Inauguración de «Mareas», fotografía de las lonjas del litoral', l: 'Museo del Faro, Albamar' },
    { d: 'Sábado 21', t: 'Feria del libro de lance, con cuarenta libreros de toda la comarca', l: 'Plaza Mayor, Miravalle' },
    { d: 'Domingo 22', t: 'Ciclo de cine mudo con piano en directo: «El faro perdido»', l: 'Filmoteca de Castroval' },
    { d: 'Martes 24', t: 'Encuentro con la poeta Irene Valdaliso y lectura de su último libro', l: 'Biblioteca Central, Brezales' }
  ];

  function words(s) { return String(s || '').split(/\s+/).filter(Boolean).length; }

  /** Una frase entrecomillada del propio texto, para la cita destacada. */
  function frase(txt) {
    var m, re = /«([^»]{40,170})»/g, all = (txt || []).join(' ');
    while ((m = re.exec(all))) { if (/[.!?…]$/.test(m[1]) || m[1].length > 60) return m[1].replace(/[.,;:]$/, ''); }
    return '';
  }

  /** Iniciales para el circulo de la firma. */
  function initials(name) {
    var p = String(name || '').split(/\s+/).filter(Boolean);
    return ((p[0] || 'R').charAt(0) + (p[1] || '').charAt(0)).toUpperCase();
  }

  WB.addLayout({
    id: 'cultural',
    name: 'Suplemento cultural',
    desc: 'Mucho aire y tipografía grande: un gran tema de portada, ensayo y conversación, críticas, agenda y el libro de la semana.',
    build: function (c) {
      var e = c.esc;

      /** Imagen con su pie y una altura de composicion. */
      function foto(pie, credito, alto) {
        return '<figure class="media-figure" data-lightbox-src="' + c.IMG + '" data-lightbox-caption="">' +
          '<img src="' + c.IMG + '" alt="" loading="lazy" style="height:' + alto + 'px;max-height:none" />' +
          '<figcaption class="media-figcaption"><span>' + e(pie || 'Imagen de archivo') + '</span><span class="license-tag">' + e(credito || 'Archivo') + '</span></figcaption></figure>';
      }
      function firma(nombre, meta) {
        if (!nombre) return '';
        return '<div class="wb-byline"><span class="wb-byline-avatar">' + e(initials(nombre)) + '</span><div>' +
          '<strong class="wb-byline-name">' + e(nombre) + '</strong><span class="wb-byline-meta">' + e(meta || '') + '</span></div></div>';
      }

      /* ------------------------------------------------------ portada --- */
      var lead = c.one('noticias');
      var ltxt = lead.txt || [];
      var calls = c.take('noticias', 3);

      var portada =
        c.nameplate('Cultura y libros', 'Suplemento del fin de semana') +
        c.nav(6) +
        '<div class="np-grid">' +
          c.story(12,
            '<span class="np-tag">' + e(lead.sec || 'Cultura') + '</span>' +
            '<h2 class="np-title np-xl">' + c.title + '</h2>' +
            (lead.sum ? '<p class="np-deck">' + e(lead.sum) + '</p>' : '')) +
        '</div>' +
        foto(lead.tit || lead.sum, lead.lugar, 500) +
        '<div class="wb-cols" style="--cols:2">' +
          '<div class="wb-col" data-wb-slot>' + (ltxt[0] ? '<p class="wb-lead">' + e(ltxt[0]) + '</p>' : '') + '</div>' +
          '<div class="wb-col" data-wb-slot>' + (ltxt[1] ? '<p>' + e(ltxt[1]) + '</p>' : '') +
            firma(lead.firma, lead.lugar ? 'Desde ' + lead.lugar : 'Tema de portada') + '</div>' +
        '</div>' +
        '<div class="wb-divider" data-style="orn"></div>' +
        '<div class="np-grid rules">' +
          calls.map(function (n, i) {
            return c.story(4,
              '<span class="section-kicker">' + e(n.sec || 'Cultura') + '</span>' +
              '<h3 class="np-title np-md">' + e(n.tit || '') + '</h3>' +
              '<p>' + e(n.sum || '') + '</p>' +
              '<p class="wb-note">' + PAGINAS[i] + '</p>');
          }).join('') +
        '</div>';

      /* -------------------------------------- ensayo y conversacion --- */
      var ens = c.one('noticias');
      var etxt = ens.txt || [];
      // la cita sale del propio ensayo si tiene una frase entrecomillada
      var propia = frase(etxt);
      var cita = propia ? { txt: propia, autor: '' } : c.one('citas');
      var ent = c.one('entrevistas');
      var qa = (ent.qa || []).slice(0, 6);

      var flujo = etxt.map(function (p, i) {
        return '<p' + (i === 0 ? ' class="lead-dropcap"' : '') + '>' + e(p) + '</p>';
      }).join('');

      var ensayo =
        '<div class="np-grid">' +
          c.story(12,
            '<span class="np-tag">El ensayo</span>' +
            '<h2 class="np-title np-lg">' + e(ens.tit || '') + '</h2>' +
            (ens.sum ? '<p class="np-deck">' + e(ens.sum) + '</p>' : '')) +
        '</div>' +
        firma(ens.firma, ens.lugar || 'Ensayo') +
        '<div class="wb-flow" data-wb-slot style="column-count:2">' + flujo + '</div>' +
        (cita.txt ? '<p class="wb-pull">«' + e(cita.txt) + '»' + (cita.autor ? '<br />— ' + e(cita.autor) : '') + '</p>' : '');

      // Las preguntas se reparten en dos columnas de peso parecido y el
      // retrato se dimensiona segun el texto que haya para rodearlo.
      var total = qa.reduce(function (s, x) { return s + words(x.p) + words(x.r); }, 0);
      var colA = [], colB = [], acc = 0;
      qa.forEach(function (x, i) {
        var w = words(x.p) + words(x.r);
        if (i === 0 || (acc + w / 2 <= total / 2 && i < qa.length - 1)) { colA.push(x); acc += w; }
        else colB.push(x);
      });
      if (!colB.length && colA.length > 1) colB.push(colA.pop());
      function qaHtml(list) {
        return list.map(function (x) {
          return '<p><strong>' + e(x.p || '') + '</strong></p><p>' + e(x.r || '') + '</p>';
        }).join('');
      }
      function alto(list) {   // alto aproximado de una columna, en px
        return list.reduce(function (s, x) { return s + 50 + Math.ceil((words(x.p) + words(x.r)) / 10) * 27; }, 0) * dens;
      }
      var dens = c.t.dens === 'densa' ? 0.82 : c.t.dens === 'aireada' ? 1.2 : 1;
      var top = 24;
      var ih = Math.max(190, Math.min(340, Math.min(alto(colA), alto(colB)) - top - 30));
      var iw = Math.round(Math.max(170, Math.min(260, ih * 0.8)));

      var conversacion = qa.length ?
        '<div class="wb-divider" data-style="accent"></div>' +
        '<div class="np-grid">' +
          c.story(12,
            '<span class="np-tag">La conversación</span>' +
            '<h3 class="np-title np-lg">' + e(ent.quien || '') + '</h3>' +
            (ent.cargo ? '<p class="np-deck">' + e(ent.cargo) + '</p>' : '')) +
        '</div>' +
        '<div class="np-between" style="--iw:' + iw + 'px;--ih:' + ih + 'px;--top:' + top + 'px;min-height:' + (top + ih + 16) + 'px">' +
          '<div class="np-col" data-wb-slot>' + qaHtml(colA) + '</div>' +
          '<div class="np-col" data-wb-slot>' + qaHtml(colB) + '</div>' +
          '<figure class="np-between-fig" data-lightbox-src="' + c.IMG + '" data-lightbox-caption="">' +
            '<img src="' + c.IMG + '" alt="" loading="lazy" />' +
            '<figcaption><span>' + e(ent.quien || 'Retrato') + (ent.cargo ? '. ' + e(ent.cargo) : '') + '</span></figcaption></figure>' +
        '</div>' :
        // sin entrevista en el banco: el retrato cierra el ensayo
        foto(ens.sum || ens.tit, ens.lugar, 420);

      /* ------------------------------- criticas, agenda y el libro --- */
      var criticas = c.take('opinion', 4);
      if (!criticas.length) {   // banco sin opinion: las criticas salen de las noticias
        criticas = c.take('noticias', 4).map(function (n) { return { tit: n.tit, frase: n.sum, autor: n.firma }; });
      }
      var agenda = c.take('agenda', 6);
      if (!agenda.length) agenda = AGENDA;
      var libro = c.one('noticias');
      var ltx = libro.txt || [];

      var rejilla =
        '<div class="np-grid">' +
          c.story(12, '<span class="np-tag">Crítica</span><h2 class="np-title np-lg">Lo visto, lo leído y lo escuchado</h2>') +
        '</div>' +
        '<div class="np-grid rules">' +
          criticas.map(function (o, i) {
            return c.story(3,
              '<span class="section-kicker">' + GENEROS[i] + '</span>' +
              foto(OBRAS[i], 'Archivo', 190) +
              '<h3 class="np-title np-sm">' + e(o.tit || '') + '</h3>' +
              '<p>' + e(o.frase || '') + '</p>' +
              '<p class="wb-note">' + (o.autor ? 'Crítica de ' + e(o.autor) + '<br />' : '') + '<strong>Valoración: ' + NOTAS[i] + '</strong></p>');
          }).join('') +
        '</div>';

      var tabla = agenda.length ?
        '<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Día</th><th>Cita</th><th>Lugar</th></tr></thead><tbody>' +
          agenda.map(function (a) {
            return '<tr><td><strong>' + e(a.d || '') + '</strong></td><td>' + e(a.t || '') + '</td><td>' + e(a.l || '') + '</td></tr>';
          }).join('') +
        '</tbody></table></div>' : '';

      var semana =
        '<div class="np-grid rules">' +
          c.story(7,
            '<span class="np-tag">Agenda</span>' +
            '<h3 class="np-title np-md">La semana por delante</h3>' +
            tabla) +
          c.story(5,
            '<div class="np-box" data-wb-slot>' +
              '<span class="section-kicker">El libro de la semana</span>' +
              '<h3 class="np-title np-md">' + e(libro.tit || '') + '</h3>' +
              foto('Cubierta de la obra reseñada', 'Archivo', 200) +
              (libro.sum ? '<p><strong>' + e(libro.sum) + '</strong></p>' : '') +
              (ltx[0] ? '<p>' + e(ltx[0]) + '</p>' : '') +
              '<p class="wb-note">' + (libro.firma ? 'Reseña de ' + e(libro.firma) + ' · ' : '') + '<strong>Valoración: ' + NOTAS[0] + '</strong></p>' +
            '</div>') +
        '</div>';

      return c.wrap(
        c.section('portada', portada) +
        c.section('ensayo', ensayo + conversacion) +
        c.section('critica', rejilla + semana));
    }
  });
})();
