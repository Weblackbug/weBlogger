/* ==========================================================================
   weBlogger - maqueta «rosa»: la revista del corazón y de sociedad.

   Portada con la exclusiva a toda foto y un mosaico de seis piezas; dentro,
   el reportaje con muchas fotos, citas y un despiece; y al final los
   protagonistas de la semana, la agenda y el horóscopo.
   No lleva CSS: solo piezas del kit, y el carácter lo pone la ficha.
   ========================================================================== */
(function () {
  'use strict';

  // Rótulos fijos de la maqueta (no son noticias: son la «voz» de la revista).
  var RUBROS = ['Exclusivas', 'Bodas', 'En casa de…', 'Alfombra roja', 'Estilo', 'Agenda', 'Horóscopo'];
  var ETIQUETAS = ['En primicia', 'Alfombra roja', 'Lo último', 'Sociedad', 'Estilo', 'Confidencias'];
  var PIES = ['Los anfitriones, en la entrada', 'El salón, a media tarde', 'Un rincón con historia',
    'La mesa, lista para los invitados', 'Flores recién cortadas', 'La despedida, ya de noche'];
  var HOROSCOPO = [
    ['Aries', 'Semana de buenas noticias: esa llamada que esperas llega antes del jueves.'],
    ['Tauro', 'Date un capricho pequeño. Lo llevas mereciendo desde hace un mes.'],
    ['Géminis', 'Una invitación inesperada te alegra el sábado. Di que sí sin pensarlo.'],
    ['Cáncer', 'En casa todo fluye. Buen momento para cambiar los muebles de sitio.'],
    ['Leo', 'Brillas sin proponértelo: alguien se fija en ti y te lo hará saber.'],
    ['Virgo', 'Ordena papeles el lunes y tendrás el resto de la semana para ti.'],
    ['Libra', 'Un reencuentro con sabor a verano. Estrena algo para la ocasión.'],
    ['Escorpio', 'Tu intuición acierta de pleno. Hazle caso, también en el amor.'],
    ['Sagitario', 'Se acerca un viaje corto. Prepara la maleta: te sentará de maravilla.'],
    ['Capricornio', 'El esfuerzo empieza a notarse. Celébralo con quien te ha acompañado.'],
    ['Acuario', 'Una idea tuya gusta más de lo que imaginas. Compártela sin miedo.'],
    ['Piscis', 'Días tranquilos y románticos. Una cena sencilla puede ser la mejor fiesta.']
  ];

  WB.addLayout({
    id: 'rosa',
    name: 'Prensa del corazón',
    desc: 'La exclusiva a toda foto, un mosaico de sociedad, el reportaje «en casa de…» y la agenda de la semana.',
    build: function (c) {
      var e = c.esc;

      /** Una foto de altura fija, con o sin pie. */
      function foto(alto, pie) {
        return '<figure class="media-figure" data-lightbox-src="' + c.IMG + '" data-lightbox-caption="">' +
          '<img src="' + c.IMG + '" alt="" loading="lazy" style="height:' + alto + 'px" />' +
          (pie ? '<figcaption class="media-figcaption"><span>' + e(pie) + '</span><span class="license-tag">Archivo</span></figcaption>' : '') +
          '</figure>';
      }
      function galeria(pies) {
        return '<div class="gallery-grid">' + pies.map(function (p) {
          return '<div class="gallery-item" data-lightbox-src="' + c.IMG + '" data-lightbox-caption="">' +
            '<img src="' + c.IMG + '" alt="" loading="lazy" /><div class="gallery-item-caption">' + e(p) + '</div></div>';
        }).join('') + '</div>';
      }
      /** Frases para destacar: primero lo que el texto ya trae entre comillas; si no, frases enteras. */
      function destacados(parrafos, reserva) {
        var out = [], todo = (parrafos || []).join(' ');
        var re = /[«“"]([^«»“”"]{28,170})[»”"]/g, m;
        while ((m = re.exec(todo))) out.push(m[1]);
        ((todo.match(/[^.!?…]+[.!?…]+/g)) || []).forEach(function (f) {
          f = f.replace(/^\s+|\s+$/g, '');
          if (out.length < 2 && f.length > 40 && f.length < 150 && !/[«»“”"]/.test(f)) out.push(f);
        });
        if (!out.length && reserva) out.push(reserva);
        return out.map(function (q) { return q.replace(/^\s+|[\s.,;:]+$/g, ''); });
      }

      /* ---------------------------------------------------------- portada */
      // si al banco le falta la prensa rosa, se compone con noticias: nunca queda un hueco
      var tipo = c.take('rosa', 1).length ? 'rosa' : 'noticias';
      var lead = c.one(tipo);
      var mosaico = c.take(tipo, 6);
      var rep = c.one(tipo);
      var protas = c.take(tipo, 4);

      var spans = [6, 3, 3, 3, 3, 6];
      var portada =
        c.nameplate('Corazón y sociedad', 'Número 618 · Cada miércoles') +
        '<nav class="np-nav">' + RUBROS.map(function (r) { return '<a href="#">' + r + '</a>'; }).join('') + '</nav>' +
        '<div class="np-cover" data-lightbox-src="' + c.IMG + '" data-lightbox-caption="">' +
          '<img src="' + c.IMG + '" alt="" style="height:600px" />' +
          '<div class="np-cover-text"><span class="np-tag">Exclusiva</span>' +
          '<h2 class="np-title np-xl">' + c.title + '</h2>' +
          '<p>' + e(lead.sum || lead.tit || '') + '</p></div></div>' +
        '<div class="np-grid">' +
          mosaico.map(function (x, i) {
            var ancha = spans[i] === 6;
            return c.story(spans[i], foto(250) +
              '<span class="np-tag">' + ETIQUETAS[i] + '</span>' +
              '<h3 class="np-title ' + (ancha ? 'np-md' : 'np-sm') + '">' + e(x.tit || '') + '</h3>' +
              (ancha && x.sum ? '<p>' + e(x.sum) + '</p>' : ''));
          }).join('') +
        '</div>';

      /* -------------------------------------------------------- reportaje */
      // el texto entero en una columna ancha junto a la foto grande y la galería;
      // la cita destacada solo si el texto trae algo dicho entre comillas
      var txt = rep.txt || [];
      var citas = destacados(txt, '').filter(function (q) { return txt.join(' ').indexOf('«' + q) > -1 || txt.join(' ').indexOf('“' + q) > -1; });
      var largo = txt.join(' ').length;

      function parrafos(arr, capital) {
        return arr.map(function (p, i) {
          return '<p' + (capital && i === 0 ? ' class="lead-dropcap"' : '') + '>' + e(p) + '</p>';
        }).join('');
      }
      // la cita cierra el texto: así no queda pegada a la frase de la que sale
      var pull = citas[0] ? '<p class="wb-pull span-all">«' + e(citas[0]) + '»</p>' : '';
      var cuerpo = parrafos(txt.length ? txt : [rep.sum || ''], true) + pull;

      // arriba, la doble de fotos (una grande y dos apiladas); debajo, el texto en
      // columnas que se equilibran solas, sea cual sea la densidad de la ficha
      var reportaje =
        '<span class="section-kicker">En casa de… · Reportaje de la semana</span>' +
        '<h2 class="np-title np-lg">' + e(rep.tit || '') + '</h2>' +
        (rep.sum ? '<p class="np-deck">' + e(rep.sum) + '</p>' : '') +
        '<div class="np-grid">' +
          c.story(8, foto(452, PIES[0])) +
          c.story(4, foto(190, PIES[1]) + foto(190, PIES[2])) +
        '</div>' +
        '<div class="wb-flow" data-wb-slot style="column-count:' + (largo > 600 ? 3 : 2) + '">' + cuerpo + '</div>' +
        galeria(PIES.slice(3, 6));

      /* ------------------------------------------- protagonistas y agenda */
      // de la agenda, lo que es de vida social (estrenos, galas, fiestas); lo institucional no entra
      var SOCIAL = /concierto|estreno|gala|fiesta|festival|presentación|inauguración|exposición|feria|cine|recital|mercado|desfile|boda|baile|premio|vendimia|ruta/i;
      var agenda = c.take('agenda', 14).filter(function (a, i, arr) {
        return a && SOCIAL.test(a.t || '') && arr.indexOf(a) === i;
      }).slice(0, 5);
      var semana =
        '<span class="section-kicker">De boca en boca</span>' +
        '<h2 class="np-title np-lg">Los protagonistas de la semana</h2>' +
        '<div class="np-grid rules">' +
          protas.map(function (x, i) {
            return c.story(3, foto(210) +
              '<span class="np-tag">N.º ' + (i + 1) + '</span>' +
              '<h3 class="np-title np-sm">' + e(x.tit || '') + '</h3>' +
              (x.sum ? '<p>' + e(x.sum) + '</p>' : ''));
          }).join('') +
        '</div>' +
        '<div class="np-grid">' +
          (agenda.length ? c.story(5, '<span class="np-tag">Agenda</span>' +
            '<h3 class="np-title np-md">Estrenos y fiestas que no hay que perderse</h3>' +
            '<div class="np-briefs">' + agenda.map(function (a) {
              return '<div class="np-brief"><h4>' + e(a.t || '') + '</h4><p>' +
                e([a.d, a.l].filter(Boolean).join(' · ')) + '</p></div>';
            }).join('') + '</div>') : '') +
          c.story(agenda.length ? 7 : 12, '<div class="np-box" data-wb-slot><h3 class="np-title np-md">Tu semana en las estrellas</h3>' +
            '<div class="wb-flow" data-wb-slot style="column-count:' + (agenda.length ? 2 : 3) + '">' +
            HOROSCOPO.map(function (h) { return '<p><strong>' + h[0] + '.</strong> ' + h[1] + '</p>'; }).join('') +
            '</div></div>') +
        '</div>';

      return c.wrap(
        c.section('portada', portada) +
        c.section('reportaje', reportaje) +
        c.section('semana', semana));
    }
  });
})();
