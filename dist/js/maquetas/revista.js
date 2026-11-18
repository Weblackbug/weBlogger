/* ==========================================================================
   Maqueta «revista» - semanario de portada.

   1. Portada: cabecera y fotonoticia con marco, foto alta, el titular del
      numero y tres llamadas.
   2. Sumario en tres columnas con numeros de pagina y la carta del director.
   3. El reportaje de portada: titular enorme, entradilla, firma, capitular,
      tres columnas, ladillos, citas, imagen entre columnas y despiece.
   4. Panorama (breves) y una entrevista corta.

   No lleva CSS: solo piezas del kit. El caracter lo pone la ficha.
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

  function initials(name) {
    var p = String(name || '').split(/\s+/).filter(Boolean);
    return ((p[0] || 'R').charAt(0) + (p[1] || '').charAt(0)).toUpperCase();
  }

  WB.addLayout({
    id: 'revista',
    name: 'Semanario de portada',
    desc: 'Portada de revista con foto alta enmarcada y llamadas, sumario del número, reportaje largo a tres columnas y un cierre de breves con entrevista.',
    build: function (c) {
      var e = c.esc;
      var IMG = c.IMG;

      function tag(t) { return t ? '<span class="np-tag">' + e(t) + '</span>' : ''; }
      function kicker(t) { return t ? '<span class="section-kicker">' + e(t) + '</span>' : ''; }
      function p(t) { return t ? '<p>' + e(t) + '</p>' : ''; }
      /* una foto con la altura que pide la composicion */
      function foto(pie, credito, alto) {
        return '<figure class="media-figure" data-lightbox-src="' + IMG + '" data-lightbox-caption="">' +
          '<img src="' + IMG + '" alt="" loading="lazy" style="height:' + alto + 'px" />' +
          '<figcaption class="media-figcaption"><span>' + e(pie || 'Pie de foto') + '</span><span class="license-tag">' + e(credito || 'Archivo') + '</span></figcaption></figure>';
      }

      /* ------------------------------------------------ el material ------ */
      var lead = c.one('noticias');
      var llamadas = c.take('noticias', 3);
      var resto = c.take('noticias', 5);
      var extras = c.take('noticias', 10);         // capítulos del reportaje, cada uno bajo su ladillo
      var ops = c.take('opinion', 3);
      var citas = c.take('citas', 2);
      var cifras = c.take('cifras', 4);
      var crono = c.one('cronologias');
      var breves = c.take('breves', 7);
      var ent = c.one('entrevistas');
      var firma = lead.firma || 'Redacción';

      /* ================================================== 1. PORTADA ===== */
      var cover =
        '<div class="np-cover frame" data-lightbox-src="' + IMG + '" data-lightbox-caption="">' +
          '<img src="' + IMG + '" alt="" style="height:940px" />' +
          '<div class="np-cover-text">' +
            tag('En portada') +
            '<h2 class="np-title np-xl">' + c.title + '</h2>' +
            p(lead.sum) +
            '<div class="wb-cols rule" style="--cols:3">' +
              llamadas.map(function (n, i) {
                return '<div class="wb-col">' + tag((n.sec || 'Actualidad') + ' · Pág. ' + (22 + i * 12)) +
                  '<h3 class="np-title np-sm">' + e(n.tit || '') + '</h3></div>';
              }).join('') +
            '</div>' +
          '</div>' +
        '</div>';
      var portada = c.nameplate('Semanario de información general', 'Año XXXIV · Número 1.742') + cover;

      /* ================================================== 2. SUMARIO ===== */
      function entrada(n, pag, conSum) {
        return '<div class="np-brief">' + kicker('Página ' + pag + (n.sec ? ' · ' + n.sec : '')) +
          '<h4>' + e(n.tit || '') + '</h4>' + (conSum ? p(n.sum) : '') + '</div>';
      }
      var colUno =
        foto('La imagen que abre el número', firma, 190) +
        '<div class="np-briefs">' +
          '<div class="np-brief">' + kicker('Página 6 · En portada') + '<h4>' + c.title + '</h4>' + '</div>' +
          entrada(llamadas[0], 22, true) +
          entrada(llamadas[1], 34, false) +
        '</div>';
      var colDos =
        '<div class="np-briefs">' +
          entrada(llamadas[2], 46, true) +
          resto.slice(0, 3).map(function (n, i) { return entrada(n, 54 + i * 6, false); }).join('') +
          '<div class="np-brief">' + kicker('Página 74') + '<h4>Panorama: la semana en breve</h4></div>' +
          '<div class="np-brief">' + kicker('Página 78 · Entrevista') + '<h4>' + e(ent.quien || '') + '</h4></div>' +
        '</div>';
      var carta = ops[0] || {};
      var colTres =
        '<div class="np-box" data-wb-slot>' +
          kicker('Carta del director') +
          '<h3 class="np-title np-md">' + e(carta.tit || '') + '</h3>' +
          p(carta.frase) +
          '<p><strong>' + e(carta.autor || '') + '</strong></p>' +
        '</div>' +
        ops.slice(1).map(function (o) {
          return '<div class="np-opinion"><img class="np-opinion-photo" src="' + IMG + '" alt="" />' +
            '<div><span class="np-opinion-author">' + e(o.autor || '') + '</span><h3>' + e(o.tit || '') + '</h3>' + p(o.frase) + '</div></div>';
        }).join('');
      var sumario =
        '<div class="wb-headline">' + kicker('Sumario') +
          '<h2 class="np-title np-lg">En este número</h2></div>' +
        '<div class="wb-divider" data-style="thick"></div>' +
        '<div class="wb-cols rule" style="--cols:3">' +
          '<div class="wb-col" data-wb-slot>' + colUno + '</div>' +
          '<div class="wb-col" data-wb-slot>' + colDos + '</div>' +
          '<div class="wb-col" data-wb-slot>' + colTres + '</div>' +
        '</div>';

      /* ================================================ 3. REPORTAJE ===== */
      /* El texto: la pieza principal entera y, detrás, dos capítulos: piezas
         enteras del banco (primero las de la misma sección), cada una bajo su
         ladillo. Nunca párrafos sueltos de piezas distintas mezclados. */
      var usadas = [lead].concat(llamadas, resto);
      var caps = [];
      extras.forEach(function (n) { if (n && usadas.indexOf(n) < 0 && caps.indexOf(n) < 0) caps.push(n); });
      caps = caps.filter(function (n) { return lead.sec && n.sec === lead.sec; })
        .concat(caps.filter(function (n) { return !(lead.sec && n.sec === lead.sec); }));
      while (caps.length < 2) caps.push(extras[caps.length] || resto[caps.length] || lead);   // banco mínimo
      function txt(n) { return ((n && n.txt && n.txt.length) ? n.txt : [n && n.sum]).filter(Boolean).map(String); }
      function ladillo(t) { return t ? '<h3 class="np-title np-md">' + e(t) + '</h3>' : ''; }
      function ps(list, firstCls) {
        return list.map(function (t, i) { return '<p' + (i === 0 && firstCls ? ' class="' + firstCls + '"' : '') + '>' + e(t) + '</p>'; }).join('');
      }
      var cita1 = citas[0] || {}, cita2 = citas[1] || {};

      /* la pieza principal, con capitular; la cita cruza las tres columnas
         solo si hay texto para seguir debajo */
      var tl = txt(lead);
      var corte = tl.length >= 4 ? Math.ceil(tl.length / 2) : tl.length;
      var flujoA =
        '<div class="wb-flow" data-wb-slot style="column-count:3">' +
          ps(tl.slice(0, corte), 'lead-dropcap') +
          (cita1.txt && corte < tl.length ? '<blockquote class="editorial-quote span-all"><p>' + e(cita1.txt) + '</p><cite>' + e(cita1.autor || '') + '</cite></blockquote>' : '') +
          ps(tl.slice(corte)) +
        '</div>';

      /* primer capítulo: la foto encajada entre sus dos columnas */
      var k1 = caps[0], t1 = txt(k1);
      var tot1 = words(t1.join(' ')), dos = partir(t1);
      var ih = Math.max(160, Math.min(300, Math.round(tot1 * (c.t.dens === 'densa' ? 0.8 : c.t.dens === 'aireada' ? 1.25 : 1))));
      var entre =
        ladillo(k1.tit) +
        '<div class="np-between" style="--iw:250px;--ih:' + ih + 'px;--top:1.4rem">' +
          '<div class="np-col" data-wb-slot>' + ps(dos[0]) + '</div>' +
          '<div class="np-col" data-wb-slot>' + ps(dos[1]) + '</div>' +
          '<figure class="np-between-fig" data-lightbox-src="' + IMG + '" data-lightbox-caption="">' +
            '<img src="' + IMG + '" alt="" /><figcaption><span>' + e(k1.lugar ? k1.lugar + ', esta semana' : 'Una imagen de esta semana') + '</span></figcaption></figure>' +
        '</div>';
      var pull = cita2.txt && cita2 !== cita1 ? '<p class="wb-pull">«' + e(cita2.txt) + '»</p>' : '';

      /* segundo capítulo, de nuevo a tres columnas */
      var k2 = caps[1];
      var flujoB = ladillo(k2.tit) + '<div class="wb-flow" data-wb-slot style="column-count:3">' + ps(txt(k2)) + '</div>';

      /* despiece: los datos en una tabla pequeña y la cronologia al lado */
      var tabla =
        '<div class="np-box" data-wb-slot>' +
          '<h3 class="np-title np-sm">La semana, en cifras</h3>' +
          '<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Dato</th><th>Qué mide</th></tr></thead><tbody>' +
            cifras.map(function (x) { return '<tr><td><strong>' + e(x.v || '') + '</strong></td><td>' + e(x.l || '') + '</td></tr>'; }).join('') +
          '</tbody></table></div>' +
        '</div>';
      var hitos = (crono.hitos || []).slice(0, 4);
      var claves =
        '<div class="np-box" data-wb-slot>' +
          '<h3 class="np-title np-sm">' + e(crono.tit || 'Las claves') + '</h3>' +
          (hitos.length
            ? '<div class="timeline">' + hitos.map(function (h) {
                return '<div class="timeline-item"><div class="timeline-year">' + e(h.f || '') + '</div><p>' + e(h.t || '') + '</p></div>';
              }).join('') + '</div>'
            : p(lead.sum)) +
        '</div>';

      var reportaje =
        '<div class="wb-headline">' + tag('Reportaje de portada') +
          '<h2 class="np-title np-xl">' + c.title + '</h2></div>' +
        '<p class="wb-lead">' + e(lead.sum || '') + '</p>' +
        '<div class="wb-byline"><span class="wb-byline-avatar">' + e(initials(firma)) + '</span><div>' +
          '<strong class="wb-byline-name">' + e(firma) + '</strong>' +
          '<span class="wb-byline-meta">' + e((lead.lugar ? lead.lugar + ' · ' : '') + c.fecha) + '</span></div></div>' +
        foto(lead.lugar ? lead.lugar + ', esta semana' : 'Una imagen de esta semana', firma, 430) +
        flujoA + entre + pull + flujoB +
        '<div class="np-grid">' + c.story(7, tabla) + c.story(5, claves) + '</div>';

      /* ================================= 4. PANORAMA Y ENTREVISTA ======== */
      var qa = (ent.qa || []).slice(0, 3);
      var entrevista =
        tag('Entrevista') +
        '<h3 class="np-title np-lg">' + e(ent.quien || '') + '</h3>' +
        '<p class="np-deck">' + e(ent.cargo || '') + '</p>' +
        foto((ent.quien || '') + (ent.cargo ? ', ' + ent.cargo.charAt(0).toLowerCase() + ent.cargo.slice(1) : ''), 'Archivo', 230) +
        '<div class="wb-flow" data-wb-slot style="column-count:2">' +
          qa.map(function (x) { return '<p><strong>' + e(x.p || '') + '</strong></p>' + p(x.r); }).join('') +
        '</div>';
      var panorama =
        '<div class="wb-headline">' + kicker('La semana en breve') +
          '<h2 class="np-title np-lg">Panorama</h2></div>' +
        '<div class="wb-divider" data-style="thick"></div>' +
        '<div class="np-grid rules">' +
          c.story(5, '<div class="np-briefs">' + breves.map(function (b) {
            return '<div class="np-brief"><h4>' + e(b.tit || '') + '</h4>' + p(b.txt) + '</div>';
          }).join('') + '</div>') +
          c.story(7, entrevista) +
        '</div>';

      return c.wrap(
        c.section('portada', portada) +
        c.section('sumario', sumario) +
        c.section('reportaje', reportaje) +
        c.section('panorama', panorama));
    }
  });
})();
