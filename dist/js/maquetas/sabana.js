/* Maqueta «Sábana clásica»: el gran diario de formato sábana.
   Portada de seis columnas estrechas con muchas piezas, titulares contenidos
   de distintos cuerpos, sumarios apilados, datas en versales y continuaciones;
   una página interior con un reportaje a cuatro columnas y una página
   editorial. No lleva CSS: solo compone con las piezas del kit de diario. */
(function () {
  'use strict';

  WB.addLayout({
    id: 'sabana',
    name: 'Sábana clásica',
    desc: 'Seis columnas estrechas con filetes, titulares contenidos, sumarios apilados, datas en versales y mucha noticia en portada.',
    build: function (c) {
      var e = c.esc;
      var n0 = (c.st && c.st.n) || 0;

      /* ------------------------------------------------ utilidades ------ */
      function arr(x) { return Array.isArray(x) ? x : []; }
      // el banco puede estar a medias: nunca se devuelve un hueco
      function take(tipo, n) {
        var out = arr(c.take(tipo, n)).slice(0, n);
        while (out.length < n) out.push({});
        return out.map(function (x) { return x || {}; });
      }
      function one(tipo) { return take(tipo, 1)[0]; }
      function words(t) { return String(t || '').split(/\s+/).filter(Boolean).length; }

      // data en versales al empezar el texto: CIUDAD —
      function data(n) {
        return n.lugar ? '<strong>' + e(String(n.lugar).toUpperCase()) + ' —</strong> ' : '';
      }
      // los párrafos [desde, hasta) de una noticia; el primero lleva la data
      function body(n, desde, hasta, cls) {
        return arr(n.txt).slice(desde, hasta).map(function (p, i) {
          var first = desde === 0 && i === 0;
          return '<p' + (first && cls ? ' class="' + cls + '"' : '') + '>' + (first ? data(n) : '') + e(p) + '</p>';
        }).join('');
      }
      // segundo sumario: la primera frase de un párrafo que no se muestra
      function deck2(n, shown) {
        var t = arr(n.txt);
        if (t.length <= shown) return '';
        var m = /^(.+?[.!?»])(\s|$)/.exec(String(t[t.length - 1] || ''));
        if (!m || m[1].length < 28 || m[1].length > 125) return '';
        return '<p class="np-deck"><em>' + e(m[1].replace(/\.$/, '')) + '</em></p>';
      }
      function tag(n) { return n.sec ? '<span class="np-tag">' + e(n.sec) + '</span>' : ''; }
      function kicker(t) { return '<span class="section-kicker">' + e(t) + '</span>'; }
      function h(n, size, lvl) {
        lvl = lvl || 'h3';
        return '<' + lvl + ' class="np-title ' + size + '">' + e(n.tit || '') + '</' + lvl + '>';
      }
      function deck(n) { return n.sum ? '<p class="np-deck">' + e(n.sum) + '</p>' : ''; }
      function sigue(pag) { return '<p class="wb-note"><em>Sigue en la página ' + pag + '</em></p>'; }
      function firma(n) { return n.firma ? '<p class="wb-note">Por <strong>' + e(n.firma) + '</strong></p>' : ''; }
      function flow(cols, html) { return '<div class="wb-flow" data-wb-slot style="column-count:' + cols + '">' + html + '</div>'; }
      function folio(pag, seccion) {
        return '<nav class="np-nav"><a href="#">Página ' + pag + '</a><a href="#">' + c.mast + '</a><a href="#">' + e(seccion) + '</a></nav>';
      }
      function iniciales(nombre) {
        return String(nombre || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
      }
      // pieza estrecha de una columna: titular pequeño, sumarios apilados, data y salto
      function estrecha(n, pag, conSumario) {
        return c.story(2, tag(n) + h(n, 'np-sm') +
          (conSumario ? deck(n) + deck2(n, 1) : '') +
          body(n, 0, 1) + sigue(pag));
      }

      /* ------------------------------------------------ portada --------- */
      var lead = one('noticias');
      var N = take('noticias', 9);
      // si al banco le falta un tipo, se suple con noticias: ninguna pieza queda vacía
      function breve(n) { return { tit: n.tit, txt: n.sum }; }
      function suplir(lista, f) {
        return lista.map(function (x) { return (x.tit || x.txt || x.frase) ? x : f(one('noticias')); });
      }
      function opin(n) { return { autor: n.firma, tit: n.tit, frase: n.sum }; }
      var breves = suplir(take('breves', 4), breve);
      var sueltos = suplir(take('breves', 2), breve);
      var ops = suplir(take('opinion', 2), opin);
      var secciones = arr(WB.bank && WB.bank.secciones).slice(0, 8);

      var indice = '<div class="np-box" data-wb-slot><h3 class="np-title np-sm">En este número</h3><ul>' +
        secciones.map(function (s, i) { return '<li>' + e(s) + ' <strong>' + (2 + i * 4 + (i > 2 ? 2 : 0)) + '</strong></li>'; }).join('') +
        '</ul></div>' +
        '<div class="np-briefs">' + sueltos.map(function (x) {
          return '<div class="np-brief"><h4>' + e(x.tit || '') + '</h4><p>' + e(x.txt || '') + '</p></div>';
        }).join('') + '</div>';

      // la relacionada va bajo la principal, en la misma pieza, para que las tres columnas de la franja igualen
      var rel = N[8];
      var principal = c.story(8,
        tag(lead) +
        '<h2 class="np-title np-lg">' + c.title + '</h2>' +
        deck(lead) + deck2(lead, 3) +
        c.fig(lead.sum || lead.tit, lead.firma, '') +
        flow(3, body(lead, 0, 3) + firma(lead) + sigue(6)) +
        '<div class="wb-divider" data-style="line"></div>' +
        kicker('Además') + h(rel, 'np-md') + deck(rel) + flow(2, body(rel, 0, 2)) + sigue(7));
      // pieza estrecha sin el envoltorio de la rejilla, para apilar dos en una columna
      function apilada(n, pag, conSumario) {
        return tag(n) + h(n, 'np-sm') + (conSumario ? deck(n) + deck2(n, 1) : '') + body(n, 0, 1) + sigue(pag);
      }

      var portada =
        c.nameplate('Edición de la mañana', 'Año CXL · Número ' + (51204 + n0 * 13).toLocaleString('es-ES').replace(/\s/g, '.')) +
        c.nav(8) +
        '<div class="np-grid rules">' +
          // primera franja: la principal en las cuatro columnas centrales y dos piezas a cada lado
          c.story(2, apilada(N[0], 4, true) + '<div class="wb-divider" data-style="line"></div>' + apilada(N[2], 12, true)) +
          principal +
          c.story(2, apilada(N[1], 9, true) + '<div class="wb-divider" data-style="line"></div>' + indice) +
          // segunda franja
          c.story(4, c.fig(N[3].sum || N[3].tit, N[3].firma) + tag(N[3]) + h(N[3], 'np-md') + body(N[3], 0, 1) + sigue(14)) +
          c.story(4, tag(N[4]) + h(N[4], 'np-md') + deck(N[4]) + deck2(N[4], 2) + flow(2, body(N[4], 0, 2)) + sigue(17)) +
          estrecha(N[5], 20, false) +
          estrecha(N[6], 23, false) +
          // tercera franja
          c.story(6, tag(N[7]) + h(N[7], 'np-md') + deck(N[7]) + flow(3, body(N[7], 0, 3)) + sigue(26)) +
          c.story(4, kicker('En breve') + '<div class="np-briefs">' +
            breves.map(function (b) { return '<div class="np-brief"><h4>' + e(b.tit || '') + '</h4><p>' + e(b.txt || '') + '</p></div>'; }).join('') +
            '</div>') +
          c.story(2, kicker('Opinión') +
            ops.map(function (o) {
              return '<span class="np-opinion-author">' + e(o.autor || '') + '</span>' +
                '<h3 class="np-title np-sm">' + e(o.tit || '') + '</h3><p>' + e(o.frase || '') + '</p>';
            }).join('') + sigue(30)) +
        '</div>';

      /* ------------------------------------------------ reportaje ------- */
      var R = one('noticias');
      var cita = one('citas');
      var cifras = take('cifras', 4);
      var B = one('noticias');
      var B2 = one('noticias');
      function col(n) {
        return '<div class="np-col" data-wb-slot>' + body(n, 0, 3) + sigue(8) + '</div>';
      }
      var corto = Math.min(words(arr(B.txt).slice(0, 3).join(' ')), words(arr(B2.txt).slice(0, 3).join(' ')));
      var iw = corto >= 200 ? 260 : 220, ih = corto >= 200 ? 230 : 180;

      var reportaje =
        folio(6, R.sec || 'Reportaje') +
        '<div class="wb-headline">' + kicker(R.sec || 'Reportaje') +
          h(R, 'np-xl', 'h2') + deck(R) +
        '</div>' +
        '<div class="wb-byline"><span class="wb-byline-avatar">' + e(iniciales(R.firma)) + '</span><div>' +
          '<strong class="wb-byline-name">' + e(R.firma || '') + '</strong>' +
          '<span class="wb-byline-meta">' + e(R.lugar || '') + ' · ' + e(c.fecha) + '</span></div></div>' +
        '<div class="np-grid rules">' +
          c.story(8, flow(2, body(R, 0, 99, 'lead-dropcap'))) +
          c.story(4, c.fig(R.sum || R.tit, R.firma) +
            (cita.txt ? '<blockquote class="editorial-quote"><p>«' + e(cita.txt) + '»</p><cite>' + e(cita.autor || '') + '</cite></blockquote>' : '')) +
        '</div>' +
        '<div class="np-box" data-wb-slot>' + kicker('El país en cifras') +
          '<div class="stats-grid">' + cifras.map(function (s) {
            return '<div class="stat-card"><div class="stat-value">' + e(s.v || '') + '</div><div class="stat-label">' + e(s.l || '') + '</div></div>';
          }).join('') + '</div></div>' +
        '<div class="wb-divider" data-style="double"></div>' +
        // los titulares van fuera de las columnas: dentro se justificarían
        '<div class="np-grid">' + c.story(6, tag(B) + h(B, 'np-md')) + c.story(6, tag(B2) + h(B2, 'np-md')) + '</div>' +
        '<div class="np-between" style="--iw:' + iw + 'px;--ih:' + ih + 'px;--top:40px">' +
          col(B) + col(B2) +
          '<figure class="np-between-fig" data-lightbox-src="' + c.IMG + '" data-lightbox-caption=""><img src="' + c.IMG + '" alt="" loading="lazy" />' +
          '<figcaption><span>' + e(B.sum || B.tit || '') + '</span></figcaption></figure>' +
        '</div>';

      /* ------------------------------------------------ editorial ------- */
      var O = suplir(take('opinion', 4), opin);
      var A = one('noticias');
      var ent = one('entrevistas');
      var qa = arr(ent.qa).slice(0, 6);
      var dichos = take('citas', 2).filter(function (d) { return d.txt; });
      var foto = one('noticias');

      function columna(o) {
        return '<div class="np-opinion"><img class="np-opinion-photo" src="' + c.IMG + '" alt="" /><div>' +
          '<span class="np-opinion-author">' + e(o.autor || '') + '</span><h3>' + e(o.tit || '') + '</h3><p>' + e(o.frase || '') + '</p></div></div>';
      }
      var preguntas = qa.map(function (x, i) {
        return '<p><strong>' + (i ? 'P.' : 'Pregunta.') + '</strong> ' + e(x.p || '') + '</p>' +
          '<p><strong>' + (i ? 'R.' : 'Respuesta.') + '</strong> ' + e(x.r || '') + '</p>';
      }).join('');
      // sin entrevistas en el banco, la pieza central es una noticia más
      var central = qa.length
        ? kicker('La entrevista') + '<h2 class="np-title np-lg">' + e(ent.quien || '') + '</h2>' +
          (ent.cargo ? '<p class="np-deck">' + e(ent.cargo) + '</p>' : '') + flow(2, preguntas)
        : (function (n) { return kicker('A fondo') + h(n, 'np-lg', 'h2') + deck(n) + flow(2, body(n, 0, 99, 'lead-dropcap')) + firma(n); })(one('noticias'));

      var editorial =
        folio(2, 'Opinión') +
        '<div class="np-grid rules">' +
          c.story(3, kicker('Editorial') +
            '<h2 class="np-title np-lg">' + e(O[0].tit || '') + '</h2>' +
            '<p class="wb-lead">' + e(O[0].frase || '') + '</p>' +
            '<div class="wb-divider" data-style="line"></div>' +
            kicker('Tribuna') + columna(O[1]) +
            '<div class="wb-divider" data-style="line"></div>' +
            kicker('La columna') + columna(O[2]) +
            '<div class="wb-divider" data-style="line"></div>' +
            kicker('Firmas') + columna(O[3])) +
          c.story(6, central + (dichos.length ?
            '<div class="wb-divider" data-style="line"></div>' + kicker('Dicho ayer') +
            '<div class="wb-cols rule" style="--cols:' + dichos.length + '">' + dichos.map(function (d) {
              return '<div class="wb-col"><blockquote class="editorial-quote"><p>' + e(d.txt) + '</p><cite>' + e(d.autor || '') + '</cite></blockquote></div>';
            }).join('') + '</div>' : '')) +
          c.story(3, kicker('Análisis') + h(A, 'np-md') + deck(A) + body(A, 0, 4) + firma(A)) +
        '</div>' +
        '<div class="np-cover" data-lightbox-src="' + c.IMG + '" data-lightbox-caption=""><img src="' + c.IMG + '" alt="" loading="lazy" />' +
          '<div class="np-cover-text"><span class="np-tag">La imagen del día</span>' +
          '<h2 class="np-title np-lg">' + e(foto.tit || '') + '</h2><p>' + e(foto.sum || '') + '</p></div></div>';

      return c.wrap(
        c.section('portada', portada) +
        c.section('reportaje', reportaje) +
        c.section('opinion', editorial));
    }
  });
})();
