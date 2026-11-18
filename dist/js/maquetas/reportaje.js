/* ==========================================================================
   weBlogger - maqueta «reportaje»: gran reportaje o crónica larga de lectura.

   Sin portada de noticias. Abre con una fotonoticia a toda página (antetítulo,
   titular y sumario sobre la foto) y sigue con el cuerpo en tandas: entradilla
   y firma junto a un despiece con cronología; luego tres capítulos, cada uno
   bajo su ladillo (la pieza principal y piezas del banco de la misma sección,
   enteras, nunca párrafos sueltos mezclados): uno a tres columnas con una foto
   y una cita que las cruzan, otro con la foto encajada entre dos columnas y el
   cierre junto a la ficha de quien firma. La segunda sección reúne tres
   piezas relacionadas y una galería.
   ========================================================================== */
(function () {
  'use strict';

  function words(s) { return String(s || '').split(/\s+/).filter(Boolean).length; }

  /** Reparte párrafos en dos columnas de peso parecido, cortando por la
      frase que mejor equilibra (un párrafo puede quedar partido entre ellas). */
  function partir(pars) {
    var u = [];
    pars.forEach(function (p, pi) {
      String(p).split(/(?<=[.!?»])\s+(?=[«¿¡A-ZÁÉÍÓÚÑ])/).forEach(function (s) { u.push({ pi: pi, s: s, w: words(s) }); });
    });
    var total = u.reduce(function (a, x) { return a + x.w; }, 0), acc = 0, k = 1, mejor = Infinity;
    u.forEach(function (x, i) {
      acc += x.w;
      if (i < u.length - 1 && Math.abs(total - 2 * acc) < mejor) { mejor = Math.abs(total - 2 * acc); k = i + 1; }
    });
    function juntar(list) {
      var out = [];
      list.forEach(function (x, i) { if (i && list[i - 1].pi === x.pi) out[out.length - 1] += ' ' + x.s; else out.push(x.s); });
      return out;
    }
    return [juntar(u.slice(0, k)), juntar(u.slice(k))];
  }

  WB.addLayout({
    id: 'reportaje',
    name: 'Reportaje de lectura',
    desc: 'Gran reportaje para leer despacio: foto a toda página, columnas con capitular, citas, foto entre columnas y despieces.',
    build: function (c) {
      var e = c.esc;
      var IMG = c.IMG;

      /* ---- materia prima ---- */
      var lead = c.one('noticias');
      var firma = lead.firma || 'Redacción';
      var lugar = lead.lugar || '';

      /* Piezas para los capítulos y para «Para saber más»: sin repetir y,
         primero, las de la misma sección que la principal. Con un banco
         pequeño (que da la vuelta) se reutilizan, pero nunca la principal. */
      var lote = c.take('noticias', 14);
      var unicas = [];
      lote.forEach(function (n) { if (n && n !== lead && unicas.indexOf(n) < 0) unicas.push(n); });
      var misma = unicas.filter(function (n) { return lead.sec && n.sec === lead.sec; });
      var otras = unicas.filter(function (n) { return misma.indexOf(n) < 0; });
      var orden = misma.concat(otras);
      function pieza(i) { return orden.length ? orden[i % orden.length] : lead; }
      var caps = [pieza(0), pieza(1), pieza(2)];
      var rel = [pieza(3), pieza(4), pieza(5)];
      function txt(n) {
        var t = (n && n.txt && n.txt.length ? n.txt : [n && n.sum]).filter(Boolean);
        return t.map(String);
      }
      // la pieza más larga va entre las dos columnas, que piden más texto
      var largo = caps.slice().sort(function (a, b) { return words(txt(b).join(' ')) - words(txt(a).join(' ')); })[0];
      var capEntre = largo, capsResto = caps.filter(function (n) { return n !== largo; });
      if (capsResto.length < 2) capsResto = [caps[0], caps[1]];

      var citas = c.take('citas', 2);
      var cron = c.one('cronologias');
      var cifras = c.take('cifras', 4);

      function html(list, firstCls) {
        return list.map(function (p, i) {
          return '<p' + (i === 0 && firstCls ? ' class="' + firstCls + '"' : '') + '>' + e(p) + '</p>';
        }).join('');
      }
      /** Foto con pie y altura de composición. */
      function foto(pie, credito, alto, cls) {
        return '<figure class="media-figure' + (cls ? ' ' + cls : '') + '" data-lightbox-src="' + IMG + '" data-lightbox-caption="">' +
          '<img src="' + IMG + '" alt="" loading="lazy" style="height:' + alto + 'px" />' +
          '<figcaption class="media-figcaption"><span>' + e(pie || lugar || firma) + '</span><span class="license-tag">' + e(credito || 'Archivo') + '</span></figcaption></figure>';
      }
      function ladillo(texto, cls) {
        return texto ? '<h3 class="np-title np-md' + (cls ? ' ' + cls : '') + '">' + e(texto) + '</h3>' : '';
      }
      function pieDe(n) {
        return (n.lugar ? n.lugar + '. ' : '') + (n.sum || n.tit || '');
      }
      function iniciales(nombre) {
        return String(nombre || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
      }

      /* ---- apertura a toda página ---- */
      var apertura =
        '<div class="np-nameplate"><div class="np-nameplate-line"><span>' + c.mast + '</span><span>' + e(c.fecha) + '</span><span>Gran reportaje</span></div></div>' +
        '<div class="np-cover" data-lightbox-src="' + IMG + '" data-lightbox-caption="">' +
          '<img src="' + IMG + '" alt="" style="height:620px" />' +
          '<div class="np-cover-text">' +
            '<span class="np-tag">' + e(lead.sec || 'Reportaje') + '</span>' +
            '<h2 class="np-title np-xl">' + c.title + '</h2>' +
            '<p>' + e(lead.sum || '') + '</p>' +
          '</div>' +
        '</div>';

      /* ---- primera tanda: entradilla, firma y arranque; al lado, la cronología ---- */
      var tl = txt(lead);
      var entradilla = tl.slice(0, 1), arranque = tl.slice(1);
      // la cronología se mide con el texto que tiene al lado
      var nh = Math.max(3, Math.min(6, Math.round(words(arranque.join(' ')) / (c.t.dens === 'densa' ? 55 : 48))));
      var hitos = (cron.hitos || []).slice(0, nh);
      var tanda1 =
        '<div class="np-grid">' +
          c.story(8,
            html(entradilla, 'wb-lead') +
            '<div class="wb-byline"><span class="wb-byline-avatar">' + e(iniciales(firma)) + '</span><div>' +
              '<strong class="wb-byline-name">' + e(firma) + '</strong>' +
              '<span class="wb-byline-meta">' + e((lugar ? lugar + ' · ' : '') + c.fecha) + '</span></div></div>' +
            (arranque.length ? '<div class="wb-flow" data-wb-slot style="column-count:2">' + html(arranque, 'lead-dropcap') + '</div>' : '')) +
          c.story(4,
            (hitos.length ? '<div class="np-box" data-wb-slot>' +
              '<span class="section-kicker">Cronología</span>' +
              (cron.tit ? '<h3 class="np-title np-sm">' + e(cron.tit) + '</h3>' : '') +
              '<div class="timeline">' + hitos.map(function (h) {
                return '<div class="timeline-item"><div class="timeline-year">' + e(h.f || '') + '</div><p>' + e(h.t || '') + '</p></div>';
              }).join('') + '</div>' +
            '</div>' : '') +
            // con una cronología corta (o sin ella), una foto compensa la columna
            (hitos.length < 3 || words(arranque.join(' ')) > 260 ? foto(lugar ? lugar + ', esta semana' : 'Esta semana', 'Foto: ' + firma, hitos.length ? 170 : 380) : '')) +
        '</div>';

      /* ---- segunda tanda: un capítulo a tres columnas, con foto y cita que las cruzan ---- */
      var k1 = capsResto[0], t1 = txt(k1);
      var c1 = citas[0] || {};
      // los ladillos van fuera del texto en columnas: así no heredan la justificación
      var tanda2 =
        ladillo(k1.tit) +
        '<div class="wb-flow" data-wb-slot style="column-count:3">' +
          foto(pieDe(k1), 'Foto: ' + firma, 400, 'span-all') +
          html(t1) +
          (c1.txt ? '<p class="wb-pull span-all">«' + e(c1.txt) + '»' +
            (c1.autor ? '<br /><span class="section-kicker">' + e(c1.autor) + '</span>' : '') + '</p>' : '') +
        '</div>';

      /* ---- cifras ---- */
      var datos = !cifras.length ? '' :
        '<span class="section-kicker">En cifras</span>' +
        '<div class="stats-grid">' + cifras.map(function (x) {
          return '<div class="stat-card"><div class="stat-value">' + e(x.v || '') + '</div><div class="stat-label">' + e(x.l || '') + '</div></div>';
        }).join('') + '</div>';

      /* ---- tercera tanda: foto encajada entre dos columnas del mismo capítulo ---- */
      var t2 = txt(capEntre);
      var total2 = words(t2.join(' ')), dos = partir(t2);
      // la foto se mide con el texto que la rodea
      var ih = Math.max(160, Math.min(320, Math.round(total2 * (c.t.dens === 'densa' ? 0.8 : c.t.dens === 'aireada' ? 1.25 : 1))));
      var tanda3 =
        ladillo(capEntre.tit) +
        '<div class="np-between" style="--iw:240px;--ih:' + ih + 'px;--top:40px">' +
          '<div class="np-col" data-wb-slot>' + html(dos[0]) + '</div>' +
          '<div class="np-col" data-wb-slot>' + html(dos[1]) + '</div>' +
          '<figure class="np-between-fig" data-lightbox-src="' + IMG + '" data-lightbox-caption="">' +
            '<img src="' + IMG + '" alt="" />' +
            '<figcaption><span>' + e(capEntre.lugar ? capEntre.lugar + ', esta semana' : (capEntre.sec || 'Esta semana')) + '</span></figcaption>' +
          '</figure>' +
        '</div>';

      /* ---- cuarta tanda: el cierre y la ficha de quien firma ---- */
      var k3 = capsResto[1];
      var c2 = citas[1] || {};
      var tanda4 =
        '<div class="np-grid">' +
          c.story(8,
            ladillo(k3.tit) + '<div class="wb-flow" data-wb-slot style="column-count:2">' + html(txt(k3)) + '</div>') +
          c.story(4,
            (c2.txt && c2 !== c1 ? '<blockquote class="editorial-quote"><p>' + e(c2.txt) + '</p><cite>' + e(c2.autor || '') + '</cite></blockquote>' : '') +
            '<div class="np-box" data-wb-slot>' +
              '<span class="section-kicker">Quién firma</span>' +
              '<div class="np-opinion"><img class="np-opinion-photo" src="' + IMG + '" alt="" /><div>' +
                '<span class="np-opinion-author">' + e(firma) + '</span>' +
                '<p>' + e('Texto y fotografías' + (lugar ? ' desde ' + lugar : '') + '.') + '</p>' +
              '</div></div>' +
            '</div>') +
        '</div>' +
        '<div class="wb-divider" data-style="orn"></div>';

      /* ---- segunda sección: para saber más ---- */
      var mas =
        '<span class="section-kicker">' + c.mast + '</span>' +
        '<h2 class="np-title np-lg">Para saber más</h2>' +
        '<div class="np-grid rules">' + rel.map(function (n) {
          return c.story(4,
            foto(n.lugar || n.sec || '', n.firma || 'Archivo', 200) +
            '<span class="np-tag">' + e(n.sec || 'Reportaje') + '</span>' +
            '<h3 class="np-title np-md">' + e(n.tit || '') + '</h3>' +
            '<p class="np-deck">' + e(n.sum || '') + '</p>' +
            html(txt(n).slice(0, 1)));
        }).join('') + '</div>' +
        '<span class="section-kicker">El reportaje, en imágenes</span>' +
        '<div class="gallery-grid">' + [lead].concat(caps).slice(0, 3).map(function (n, i) {
          var pie = i === 0 ? (lugar ? lugar + ', ' : '') + 'donde empieza esta historia' : (n.lugar ? n.lugar + ': ' : '') + (n.tit || '');
          return '<div class="gallery-item" data-lightbox-src="' + IMG + '" data-lightbox-caption="">' +
            '<img src="' + IMG + '" alt="" loading="lazy" /><div class="gallery-item-caption">' + e(pie) + '</div></div>';
        }).join('') + '</div>';

      return c.wrap(
        c.section('reportaje', apertura + tanda1 + tanda2 + datos + tanda3 + tanda4) +
        c.section('saber-mas', mas));
    }
  });
})();
