/* ==========================================================================
   weBlogger - maqueta «local»: semanario local o comarcal.

   Portada con la noticia del pueblo y un lateral de servicio (agenda y
   farmacias), muchas piezas pequeñas de vida local, páginas de comarca con
   breves por pueblos, la entrevista a un vecino y las fotos de la fiesta, y
   una página de servicios: autobuses, el tiempo, anuncios por palabras y la
   carta del director.

   No lleva CSS: solo compone con las piezas del kit de diario. La geografía
   y los datos de servicio son inventados.
   ========================================================================== */
(function () {
  'use strict';

  // Los pueblos de la comarca, los mismos que salen en el banco de textos.
  var PUEBLOS = ['Castroval', 'Portalba', 'Sotoluengo', 'Brezales', 'Valdearcos', 'Miravalle', 'Torremaura', 'Peñalcor', 'Fuentecalma', 'Albamar', 'Puente Sarrio'];

  var FARMACIAS = [
    ['Lunes y martes', 'Farmacia de la Plaza', 'Castroval'],
    ['Miércoles', 'Farmacia del Puente', 'Puente Sarrio'],
    ['Jueves', 'Farmacia del Mercado', 'Sotoluengo'],
    ['Viernes', 'Farmacia de la Fuente', 'Fuentecalma'],
    ['Sábado y domingo', 'Farmacia de la Estación', 'Castroval']
  ];

  var TELEFONOS = [
    ['Centro de salud', '555 201 014'],
    ['Ayuntamiento', '555 201 100'],
    ['Taxi comarcal', '555 204 377'],
    ['Averías del agua', '555 209 060']
  ];

  var BUSES = [
    ['Castroval – Portalba', '7.15', '7.50', 'Diario'],
    ['Castroval – Sotoluengo', '8.30', '9.10', 'Laborables'],
    ['Portalba – Albamar', '10.00', '10.35', 'Diario'],
    ['Castroval – Brezales', '13.45', '14.20', 'Laborables'],
    ['Peñalcor – Castroval', '16.30', '17.25', 'Diario'],
    ['Castroval – Torremaura', '19.10', '19.55', 'Viernes y sábados'],
    ['Valdearcos – Castroval', '21.00', '21.40', 'Domingos']
  ];

  var TIEMPO = [
    ['Lunes', 'Nieblas matinales', '4°', '13°'],
    ['Martes', 'Poco nuboso', '5°', '15°'],
    ['Miércoles', 'Soleado', '6°', '17°'],
    ['Jueves', 'Intervalos nubosos', '7°', '16°'],
    ['Viernes', 'Lluvia débil', '8°', '12°'],
    ['Sábado', 'Chubascos', '6°', '11°'],
    ['Domingo', 'Claros por la tarde', '3°', '12°']
  ];

  var ANUNCIOS = [
    ['Se vende', [
      'Leña de encina seca, cortada a medida. Se lleva a casa en toda la comarca. Tel. 555 210 432.',
      'Tractor de 70 caballos con pala, pocas horas, siempre en nave. Tel. 555 218 905.',
      'Huerto de regadío con caseta y pozo, a diez minutos de Portalba. Tel. 555 233 170.'
    ]],
    ['Se alquila', [
      'Piso de tres habitaciones junto a la plaza de Castroval, con calefacción. Tel. 555 240 618.',
      'Local de 60 metros en la calle del Mercado, listo para abrir. Tel. 555 246 093.',
      'Plaza de garaje cerrada en el barrio de la Estación. Tel. 555 251 774.'
    ]],
    ['Trabajo', [
      'Se necesita oficial de panadería para obrador en Sotoluengo. Turno de noche. Tel. 555 262 481.',
      'Clases de repaso de primaria y secundaria, a domicilio o en grupo. Tel. 555 267 350.',
      'Se ofrece persona con experiencia para cuidar mayores por las mañanas. Tel. 555 270 926.'
    ]],
    ['Varios', [
      'Perdida perra pastora, blanca y canela, en el camino de Peñalcor. Se gratificará. Tel. 555 281 039.',
      'Se afinan y reparan acordeones y guitarras. Recogida los jueves, día de mercado. Tel. 555 285 612.',
      'La coral de Fuentecalma busca voces graves. Ensayos los martes en la escuela vieja.'
    ]]
  ];

  // Agenda y fotos de reserva por si el banco aún no trae el tipo «agenda».
  var AGENDA = [
    { d: 'Jueves', t: 'Mercado semanal de productores de la vega', l: 'Plaza del Mercado, Castroval' },
    { d: 'Viernes', t: 'Pleno ordinario del Ayuntamiento, abierto a los vecinos', l: 'Casa Consistorial, Sotoluengo' },
    { d: 'Viernes', t: 'Cine de verano en invierno: sesión familiar', l: 'Salón parroquial, Brezales' },
    { d: 'Sábado', t: 'Concurso de tortillas de las peñas', l: 'Paseo del Puerto, Portalba' },
    { d: 'Sábado', t: 'Baile con la orquesta Brisas del Aldera', l: 'Pabellón municipal, Valdearcos' },
    { d: 'Domingo', t: 'Marcha senderista a la ermita del Monte', l: 'Salida de la fuente vieja, Peñalcor' }
  ];
  var FOTOS = [
    { t: 'La procesión cívica abre las fiestas de San Martín', l: 'Castroval' },
    { t: 'Los gigantes y cabezudos recorren el casco viejo', l: 'Sotoluengo' },
    { t: 'Doscientas raciones en la comida popular de las peñas', l: 'Portalba' },
    { t: 'Los más pequeños, en el concurso de disfraces', l: 'Brezales' },
    { t: 'La banda municipal estrena uniformes en la plaza', l: 'Valdearcos' },
    { t: 'Fuegos artificiales sobre el puente de piedra', l: 'Puente Sarrio' }
  ];

  /** El pueblo que nombra el texto, para que la etiqueta no mienta. */
  function pueblo(text) {
    for (var i = 0; i < PUEBLOS.length; i++) if (String(text || '').indexOf(PUEBLOS[i]) >= 0) return PUEBLOS[i];
    return '';
  }

  /** Gira una lista para que cada ficha empiece en un sitio distinto. */
  function rot(list, n) {
    var k = ((n || 0) % list.length + list.length) % list.length;
    return list.slice(k).concat(list.slice(0, k));
  }

  function initials(name) {
    var parts = String(name || '').split(/\s+/).filter(Boolean);
    return ((parts[0] || 'R').charAt(0) + (parts[1] || '').charAt(0)).toUpperCase();
  }

  function table(c, head, rows) {
    return '<div class="wb-table-wrap"><table class="wb-table"><thead><tr>' +
      head.map(function (h) { return '<th>' + c.esc(h) + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (d) { return '<td>' + c.esc(d) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div>';
  }

  WB.addLayout({
    id: 'local',
    name: 'Semanario local',
    desc: 'La noticia del pueblo con foto, agenda y farmacias al lado, breves por pueblos, autobuses, el tiempo y anuncios por palabras.',
    build: function (c) {
      var e = c.esc;
      var n0 = (c.st && c.st.n) || 0;

      /** Como c.take(), pero sin repetir cuando el banco es pequeño: puede devolver menos. */
      function uniq(kind, n, key) {
        var seen = {}, out = [];
        c.take(kind, n).forEach(function (x) {
          var k = String((x && x[key]) || '');
          if (!x || seen[k]) return;
          seen[k] = 1;
          out.push(x);
        });
        return out;
      }
      /** Si al banco le falta un tipo, se saca de las noticias para no dejar piezas vacías. */
      function desde(kind, n, key, conv) {
        var out = uniq(kind, n, key);
        if (out.length) return out;
        return uniq('noticias', n, 'tit').map(conv);
      }
      function kicker(text) { return text ? '<span class="section-kicker">' + e(text) + '</span>' : ''; }
      function tag(text) { return text ? '<span class="np-tag">' + e(text) + '</span>' : ''; }
      function byline(n) {
        var who = [n.firma || '', n.lugar || ''].filter(Boolean).join(' · ');
        return who ? '<p><strong>' + e(who) + '</strong></p>' : '';
      }
      function briefs(list, conPueblo) {
        return '<div class="np-briefs">' + list.map(function (b) {
          return '<div class="np-brief">' + (conPueblo ? kicker(pueblo(b.tit + ' ' + b.txt) || 'Comarca') : '') +
            '<h4>' + e(b.tit || '') + '</h4><p>' + e(b.txt || '') + '</p></div>';
        }).join('') + '</div>';
      }

      /* ------------------------------------------------ portada ---------- */
      var seen = {};
      var news = [];
      c.take('noticias', 8).forEach(function (n) {
        if (!n || seen[n.tit]) return;
        seen[n.tit] = 1;
        news.push(n);
      });
      var lead = news[0] || {};
      var medias = news.slice(1, 4);
      var cortas = news.slice(4, 8);
      var txt = lead.txt || [];

      var agenda = uniq('agenda', 6, 't');
      if (!agenda.length) agenda = AGENDA;
      var lateral =
        (!agenda.length ? '' : '<div class="np-box" data-wb-slot><h3 class="np-title np-sm">Agenda de la semana</h3>' +
          '<div class="np-briefs">' + agenda.map(function (a) {
            return '<div class="np-brief">' + kicker(a.d || '') + '<h4>' + e(a.t || '') + '</h4><p>' + e(a.l || '') + '</p></div>';
          }).join('') + '</div></div>') +
        '<h3 class="np-title np-sm">Farmacias de guardia</h3>' +
        table(c, ['Día', 'Farmacia'], FARMACIAS.map(function (f) { return [f[0], f[1] + ' (' + f[2] + ')']; }));

      var principal =
        tag(lead.sec || 'Comarca') +
        '<h2 class="np-title np-xl">' + c.title + '</h2>' +
        '<p class="np-deck">' + e(lead.sum || '') + '</p>' +
        c.fig(lead.tit || lead.sum || '', (lead.firma || 'Archivo'), '') +
        byline(lead) +
        '<div class="wb-flow" data-wb-slot style="column-count:2">' +
          (txt[0] ? '<p class="lead-dropcap">' + e(txt[0]) + '</p>' : '') +
          c.ps(txt.slice(1), 5) +
        '</div>';

      var filaMedia = medias.map(function (n, i) {
        var span = medias.length === 3 ? 4 : 12 / medias.length;
        return c.story(span,
          tag(n.sec || '') +
          '<h3 class="np-title np-md">' + e(n.tit || '') + '</h3>' +
          (i === 0 ? c.fig(n.sum || '', n.lugar || 'Archivo', '') : '<p class="np-deck">' + e(n.sum || '') + '</p>') +
          c.ps(n.txt, i === 0 ? 1 : 2));
      }).join('');

      var dep = c.one('deportes');
      var m = dep.marcador || {};
      var marcador = (m.local && m.visit) ?
        '<p><strong>' + e(m.local) + ' ' + e(String(m.gl === undefined ? '' : m.gl)) + ' – ' + e(String(m.gv === undefined ? '' : m.gv)) + ' ' + e(m.visit) + '</strong></p>' : '';
      var piezas = cortas.slice(0, dep.tit ? 3 : 4).map(function (n) {
        return tag(n.sec || '') + '<h3 class="np-title np-sm">' + e(n.tit || '') + '</h3><p>' + e(n.sum || '') + '</p>' + byline(n);
      });
      if (dep.tit) piezas.push(tag('Deporte base') + '<h3 class="np-title np-sm">' + e(dep.tit || '') + '</h3>' + marcador + '<p>' + e(dep.sum || '') + '</p>');
      var spanCorta = piezas.length === 4 ? 3 : piezas.length === 3 ? 4 : piezas.length === 2 ? 6 : 12;
      var filaCorta = piezas.map(function (p) { return c.story(spanCorta, p); }).join('');

      var portada =
        c.nameplate('Semanario de la comarca del Alto Aldera', 'Año XXXIV · Número 1.742 · 1,80 €') +
        c.nav(6) +
        '<div class="np-grid rules">' +
          c.story(8, principal) +
          c.story(4, lateral) +
          filaMedia +
          filaCorta +
        '</div>';

      /* ------------------------------------------------ comarca ---------- */
      var breves = desde('breves', 9, 'tit', function (n) { return { tit: n.tit, txt: n.sum }; });
      var nCols = breves.length >= 9 ? 3 : breves.length >= 4 ? 2 : Math.max(1, Math.min(3, breves.length));
      var porCol = Math.ceil(breves.length / nCols);
      var cols = '';
      for (var i = 0; i < nCols; i++) {
        cols += '<div class="wb-col" data-wb-slot>' +
          briefs(breves.slice(i * porCol, (i + 1) * porCol), true) + '</div>';
      }

      var ent = c.one('entrevistas');
      var cita = c.one('citas');
      var qa = (ent.qa || []).slice(0, 5);
      var otra = ent.quien ? {} : c.one('noticias');
      var entrevista = !ent.quien ?
        tag(otra.sec || 'Comarca') +
        '<h3 class="np-title np-lg">' + e(otra.tit || '') + '</h3>' +
        '<p class="np-deck">' + e(otra.sum || '') + '</p>' +
        '<div class="wb-flow" data-wb-slot style="column-count:2">' + c.ps(otra.txt, 3) + '</div>' :
        tag('El vecino') +
        '<h3 class="np-title np-lg">' + e(ent.quien || '') + '</h3>' +
        (ent.cargo ? '<p class="np-deck">' + e(ent.cargo) + '</p>' : '') +
        '<div class="wb-flow" data-wb-slot style="column-count:2">' +
          qa.map(function (x) { return '<p><strong>' + e(x.p || '') + '</strong></p><p>' + e(x.r || '') + '</p>'; }).join('') +
        '</div>';
      var retrato =
        c.fig(ent.quien ? ent.quien + (ent.cargo ? ', ' + ent.cargo : '') : (otra.sum || ''), 'Redacción', '') +
        (cita.txt ? '<blockquote class="editorial-quote"><p>' + e(cita.txt) + '</p><cite>' + e(cita.autor || '') + '</cite></blockquote>' : '');

      // las fotos de la fiesta: actos de la agenda que no salieron en el lateral, o las de reserva
      var fotos = uniq('agenda', 6, 't');
      if (fotos.length < 6) fotos = rot(FOTOS, n0);
      var galeria = '<div class="gallery-grid">' + fotos.map(function (a) {
        return '<div class="gallery-item" data-lightbox-src="' + c.IMG + '" data-lightbox-caption="">' +
          '<img src="' + c.IMG + '" alt="" loading="lazy" /><div class="gallery-item-caption">' +
          e([a.t || '', a.l || ''].filter(Boolean).join('. ')) + '</div></div>';
      }).join('') + '</div>';

      var comarca =
        kicker('Comarca') +
        '<h2 class="np-title np-lg">Pueblo a pueblo</h2>' +
        '<div class="wb-cols rule" style="--cols:' + nCols + '">' + cols + '</div>' +
        '<div class="np-grid rules">' +
          c.story(7, entrevista) +
          c.story(5, retrato) +
        '</div>' +
        kicker('Fiestas') +
        '<h3 class="np-title np-md">La semana, en imágenes</h3>' +
        galeria;

      /* ----------------------------------------------- servicios --------- */
      var ops = desde('opinion', 3, 'tit', function (n) { return { autor: n.firma, tit: n.tit, frase: n.sum }; });
      var dir = ops[0] || {};
      var tribunas = ops.slice(1);
      var opinion =
        tag('Opinión') +
        '<h3 class="np-title np-md">' + e(dir.tit || '') + '</h3>' +
        '<div class="wb-byline"><span class="wb-byline-avatar">' + e(initials(dir.autor)) + '</span><div>' +
          '<strong class="wb-byline-name">' + e(dir.autor || '') + '</strong>' +
          '<span class="wb-byline-meta">Carta del director</span></div></div>' +
        '<p class="lead-dropcap">' + e(dir.frase || '') + '</p>' +
        tribunas.map(function (o) {
          return '<div class="np-opinion"><img class="np-opinion-photo" src="' + c.IMG + '" alt="" />' +
            '<div><span class="np-opinion-author">' + e(o.autor || '') + '</span><h3>' + e(o.tit || '') + '</h3><p>' + e(o.frase || '') + '</p></div></div>';
        }).join('');

      var servicios =
        kicker('Servicios') +
        '<h2 class="np-title np-lg">Para toda la semana</h2>' +
        '<div class="np-grid rules">' +
          c.story(5, '<h3 class="np-title np-sm">Autobuses de la comarca</h3>' +
            table(c, ['Línea', 'Sale', 'Llega', 'Días'], rot(BUSES, 0)) +
            '<p>Los horarios pueden cambiar en días de fiesta local.</p>') +
          c.story(4, '<h3 class="np-title np-sm">El tiempo de la semana</h3>' +
            table(c, ['Día', 'Cielo', 'Mín.', 'Máx.'], TIEMPO) +
            '<p>Heladas débiles en las vegas al final de la semana.</p>' +
            '<h3 class="np-title np-sm">Teléfonos de interés</h3>' +
            table(c, ['Servicio', 'Teléfono'], TELEFONOS)) +
          c.story(3, opinion) +
        '</div>' +
        '<h3 class="np-title np-md">Anuncios por palabras</h3>' +
        '<div class="wb-cols rule" style="--cols:4">' +
          rot(ANUNCIOS, n0).map(function (g) {
            return '<div class="wb-col" data-wb-slot><h4>' + e(g[0]) + '</h4>' +
              g[1].map(function (a) { return '<p>' + e(a) + '</p>'; }).join('') + '</div>';
          }).join('') +
        '</div>';

      return c.wrap(
        c.section('portada', portada) +
        c.section('comarca', comarca) +
        c.section('servicios', servicios));
    }
  });
})();
