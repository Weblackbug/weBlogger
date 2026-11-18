/* Maqueta «tabloide»: el tabloide popular de quiosco.
   Portada-cartel (fotonoticia enorme con el titular encima y llamadas cortas
   alrededor, deportes abajo y un faldón de promoción), doble página interior
   con la noticia del día y una tercera de breves, lo más leído y televisión.
   No lleva CSS: solo piezas del kit de diario. */
(function () {
  'use strict';

  WB.addLayout({
    id: 'tabloide',
    name: 'Tabloide popular',
    desc: 'Portada-cartel: una foto enorme con el titular gigante encima, llamadas rotundas alrededor, deportes y un faldón de sorteo.',
    build: function (c) {
      var e = c.esc, IMG = c.IMG;
      var seen = {};

      /* n elementos sin repetir en toda la página; si el banco es corto, completa hasta min con repetidos. */
      function pick(kind, n, min) {
        var out = [], rest = [], local = {};
        c.take(kind, n).forEach(function (x) {
          var k = kind + '|' + (x.tit || x.txt || x.v || x.t || x.quien || x.n || '');
          if (!seen[k]) { seen[k] = 1; local[k] = 1; out.push(x); } else if (!local[k]) { local[k] = 1; rest.push(x); }
        });
        while (out.length < (min || 0) && rest.length) out.push(rest.shift());
        return out;
      }
      /* si el banco aún no trae ese tipo, la pieza se compone con noticias */
      function pickAny(kind, n, min) {
        var r = pick(kind, n, min);
        return r.length ? r : pick('noticias', n, min);
      }
      function one(kind) { return pickAny(kind, 1, 1)[0] || {}; }
      /* texto corto de una pieza: el de un breve o, si es una noticia, su sumario */
      function corto(x) { return typeof x.txt === 'string' ? x.txt : (x.sum || ''); }
      function first(arr) { return (arr && arr[0]) || ''; }

      /* una foto con la altura que pida la composición */
      function foto(pie, alto, cls) {
        return '<figure class="media-figure' + (cls ? ' ' + cls : '') + '" data-lightbox-src="' + IMG + '" data-lightbox-caption="">' +
          '<img src="' + IMG + '" alt="" loading="lazy" style="height:' + alto + 'px" />' +
          '<figcaption class="media-figcaption"><span>' + e(pie || 'Pie de foto') + '</span><span class="license-tag">Archivo</span></figcaption></figure>';
      }
      function tag(t) { return '<span class="np-tag">' + e(t) + '</span>'; }
      function pagina(n) { return '<span class="section-kicker">Página ' + n + '</span>'; }
      function banda(rotulo, texto) {
        return '<div class="np-ticker">' + tag(rotulo) + '<span>' + texto + '</span></div>';
      }
      function story(span, rows, html) {
        return html ? c.story(span, html).replace('--span:' + span, '--span:' + span + ';--rows:' + rows) : '';
      }
      function iniciales(nombre) {
        return String(nombre || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
      }

      /* ------------------------------------------------ material del banco */
      var lead = one('noticias');
      var notis = pick('noticias', 3, 3);
      var n1 = notis[0] || {}, n2 = notis[1] || {}, n3 = notis[2] || {};
      var rosa = one('rosa');
      var dep = one('deportes');
      var m = dep.marcador || {};
      var brevesPortada = pickAny('breves', 3, 3);
      var b1 = brevesPortada[0] || {}, b2 = brevesPortada[1] || {}, b3 = brevesPortada[2] || {};
      var cifras = pick('cifras', 5, 4);
      var citas = pick('citas', 3, 1);

      /* ====================================================== 1. portada == */
      var cartel =
        '<div class="np-cover" data-lightbox-src="' + IMG + '" data-lightbox-caption="">' +
          '<img src="' + IMG + '" alt="" loading="lazy" style="height:640px" />' +
          '<div class="np-cover-text">' + tag(lead.sec || 'Exclusiva') +
            '<h2 class="np-title np-xl">' + c.title + '</h2>' +
            '<p>' + e(lead.sum || '') + '</p></div></div>';

      var portada =
        c.nameplate('Edición de quiosco', 'Año XXXI · Número 9.412') +
        banda('Última hora', e(b3.tit || '') + (corto(b3) ? '. ' + e(corto(b3)) : '')) +
        '<div class="np-grid rules">' +
          story(3, 1,
            foto(n1.sum || n1.tit, 150) + tag(n1.sec || 'Sociedad') +
            '<h3 class="np-title np-md">' + e(n1.tit || '') + '</h3>' + pagina(8)) +
          story(6, 2, cartel) +
          story(3, 1,
            foto(rosa.sum || rosa.tit, 150) + tag('Corazón') +
            '<h3 class="np-title np-md">' + e(rosa.tit || '') + '</h3>' + pagina(22)) +
          story(3, 1,
            tag('Y además') + '<h3 class="np-title np-sm">' + e(b1.tit || '') + '</h3>' +
            '<p>' + e(corto(b1)) + '</p>' + pagina(12)) +
          story(3, 1,
            tag(n2.sec || 'Actualidad') + '<h3 class="np-title np-sm">' + e(n2.tit || '') + '</h3>' +
            '<p>' + e(n2.sum || '') + '</p>' + pagina(10)) +
        '</div>' +
        '<div class="np-grid rules">' +
          story(5, 1, foto(dep.sum || dep.tit, 250)) +
          story(4, 1,
            tag('Deportes') +
            (m.local ? '<p class="np-deck"><strong>' + e(m.local) + ' ' + e(String(m.gl == null ? '' : m.gl)) + ' - ' + e(String(m.gv == null ? '' : m.gv)) + ' ' + e(m.visit || '') + '</strong></p>' : '') +
            '<h3 class="np-title np-lg">' + e(dep.tit || '') + '</h3>' +
            (first(dep.txt) ? '<p>' + e(first(dep.txt)) + '</p>' : '<p>' + e(dep.sum || '') + '</p>') + pagina(34)) +
          story(3, 1,
            tag(n3.sec || 'Tu dinero') + '<h3 class="np-title np-sm">' + e(n3.tit || '') + '</h3>' +
            '<p>' + e(n3.sum || '') + '</p>' +
            '<div class="np-briefs"><div class="np-brief"><h4>' + e(b2.tit || '') + '</h4><p>' + e(corto(b2)) + '</p></div></div>') +
        '</div>' +
        '<div class="np-box" data-wb-slot>' +
          '<div class="wb-cols" style="--cols:3">' +
            '<div class="wb-col">' + tag('Gran sorteo') + '<h3 class="np-title np-md">¡Llévate una furgoneta camper con tu ' + c.mast + '!</h3></div>' +
            '<div class="wb-col"><p><strong>Cupón número 14.</strong> Recorta los cupones de lunes a sábado, pégalos en la cartilla que regalamos el domingo y entrégala en tu quiosco antes del día 30.</p></div>' +
            '<div class="wb-col"><p><strong>Y cada semana,</strong> cien cestas de la compra para los lectores más rápidos. Bases del sorteo y lista de ganadores, en la página 31.</p></div>' +
          '</div></div>';

      /* ================================================= 2. doble página == */
      var parrafos = lead.txt || [];
      var cifra = cifras[0];
      var cita1 = citas[0] || {}, cita2 = citas[1] || {}, cita3 = citas[2] || {};
      var mas = pick('noticias', 2, 2);
      var m0 = mas[0] || {}, m1 = mas[1] || {};
      function cita(x) {
        return x.txt ? '<blockquote class="editorial-quote"><p>«' + e(x.txt) + '»</p><cite>' + e(x.autor || '') + '</cite></blockquote>' : '';
      }

      var doble =
        banda('Páginas 2 y 3', 'El tema del día') +
        '<div class="np-grid">' +
          story(12, 1,
            tag(lead.sec || 'Exclusiva') +
            '<h2 class="np-title np-xl">' + c.title + '</h2>' +
            '<p class="np-deck">' + e(lead.sum || '') + '</p>') +
          story(8, 1, foto(lead.sum || lead.tit, 430)) +
          story(4, 1,
            (cifra ? tag('La cifra') + '<h3 class="np-title np-xl">' + e(cifra.v || '') + '</h3><p class="np-deck">' + e(cifra.l || '') + '</p>' : '') +
            cita(cita1)) +
        '</div>' +
        '<div class="wb-byline"><span class="wb-byline-avatar">' + e(iniciales(lead.firma) || 'R') + '</span><div>' +
          '<strong class="wb-byline-name">' + e(lead.firma || 'Redacción') + '</strong>' +
          '<span class="wb-byline-meta">' + e(lead.lugar || '') + (lead.lugar ? ' · ' : '') + e(c.fecha) + '</span></div></div>' +
        '<div class="wb-flow" data-wb-slot style="column-count:3">' +
          (parrafos[0] ? '<p class="lead-dropcap">' + e(parrafos[0]) + '</p>' : '') +
          c.ps(parrafos.slice(1), 5) +
        '</div>' +
        '<div class="np-grid rules">' +
          story(5, 1,
            foto(m0.sum || m0.tit, 240) + tag(m0.sec || 'Actualidad') +
            '<h3 class="np-title np-md">' + e(m0.tit || '') + '</h3>' + c.ps(m0.txt, 2) + pagina(5)) +
          story(4, 1,
            tag(m1.sec || 'Actualidad') +
            '<h3 class="np-title np-md">' + e(m1.tit || '') + '</h3>' +
            (m1.sum ? '<p class="np-deck">' + e(m1.sum) + '</p>' : '') + c.ps(m1.txt, 3) + pagina(7)) +
          story(3, 1,
            tag('Lo que dicen') + cita(cita2) + cita(cita3)) +
        '</div>';

      /* ======================================= 3. breves, leído y la tele == */
      var breves = pickAny('breves', 8, 6);
      var mitad = Math.ceil(breves.length / 2);
      function colBreves(arr) {
        return '<div class="wb-col" data-wb-slot><div class="np-briefs">' + arr.map(function (b) {
          return '<div class="np-brief"><h4>' + e(b.tit || '') + '</h4><p>' + e(corto(b)) + '</p></div>';
        }).join('') + '</div></div>';
      }
      var leido = [n1, rosa, dep, n2].filter(function (x) { return x && x.tit; });
      var ops = pick('opinion', 2, 2);
      var agenda = pickAny('agenda', 5, 2);

      var tele = [
        ['15.30', 'Canal Faro', 'Sobremesa de cine: «El último tren a la costa»'],
        ['18.00', 'Tele Ribera', 'Tardes contigo, magacín en directo'],
        ['20.30', 'Punto TV', 'El concurso de las ocho'],
        ['21.00', 'Canal Faro', 'Informativo de la noche y el tiempo'],
        ['22.15', 'Tele Ribera', 'La gran final: cantan los pueblos'],
        ['00.30', 'Punto TV', 'Madrugada de misterio']
      ];

      var tercera =
        banda('Sucesos y sociedad', 'Lo que pasó ayer, contado en dos líneas') +
        '<div class="np-grid rules">' +
          story(8, 1,
            '<div class="wb-cols rule" style="--cols:2">' + colBreves(breves.slice(0, mitad)) + colBreves(breves.slice(mitad)) + '</div>') +
          story(4, 1,
            tag('Lo más leído') +
            '<ol class="np-ranking"><li>' + c.title + '</li>' + leido.map(function (x) { return '<li>' + e(x.tit) + '</li>'; }).join('') + '</ol>' +
            (ops.length ? tag('Opinan') : '') +
            ops.map(function (o) {
              return '<div class="np-opinion"><img class="np-opinion-photo" src="' + IMG + '" alt="" /><div>' +
                '<span class="np-opinion-author">' + e(o.autor || '') + '</span><h3>' + e(o.tit || '') + '</h3><p>' + e(o.frase || '') + '</p></div></div>';
            }).join('')) +
        '</div>' +
        banda('Televisión y agenda', 'Para esta noche y para mañana') +
        '<div class="np-grid rules">' +
          story(7, 1,
            '<h3 class="np-title np-md">Esta noche, en la tele</h3>' +
            '<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Hora</th><th>Cadena</th><th>Programa</th></tr></thead><tbody>' +
            tele.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') +
            '</tbody></table></div>') +
          story(5, 1,
            '<h3 class="np-title np-md">No te lo pierdas</h3>' +
            '<div class="np-briefs">' + agenda.map(function (a) {
              return '<div class="np-brief"><h4>' + e(a.t || a.tit || '') + '</h4><p>' + (a.t ? e(a.d || '') + (a.l ? ' · ' + e(a.l) : '') : e(corto(a))) + '</p></div>';
            }).join('') + '</div>') +
        '</div>';

      return c.wrap(
        c.section('portada', portada) +
        c.section('doble', doble) +
        c.section('breves', tercera));
    }
  });
})();
