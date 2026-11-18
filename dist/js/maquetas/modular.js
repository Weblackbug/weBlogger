/* ==========================================================================
   weBlogger - maqueta «modular».

   El diario moderno de módulos limpios: cada noticia en su rectángulo, con
   aire alrededor. Tres páginas:
     1. Portada: última hora, una noticia ancha con foto, un lateral de
        opinión y lo más leído, y una fila de módulos iguales.
     2. El tema del día: cifras grandes, texto en columnas, cronología,
        tabla y despiece.
     3. La contra: entrevista en pregunta y respuesta, con una frase enorme
        y la foto encajada entre las dos columnas.
   No lleva CSS: el carácter lo pone la ficha.
   ========================================================================== */
(function () {
  'use strict';

  WB.addLayout({
    id: 'modular',
    name: 'Diario modular',
    desc: 'Módulos rectangulares con aire: una noticia ancha, lateral de opinión, cifras grandes, cronología y entrevista de contraportada.',
    build: function (c) {
      var e = c.esc;

      /* ---- utilidades ---- */
      function v(o, k) { return e((o && o[k]) || ''); }
      function tag(t) { return t ? '<span class="np-tag">' + t + '</span>' : ''; }
      function kicker(t) { return '<span class="section-kicker">' + t + '</span>'; }
      function deck(t) { return t ? '<p class="np-deck">' + t + '</p>' : ''; }
      /** Una foto de altura fija, para que los módulos de una fila casen. */
      function foto(pie, credito, alto) {
        return '<figure class="media-figure" data-lightbox-src="' + c.IMG + '" data-lightbox-caption="">' +
          '<img src="' + c.IMG + '" alt="" loading="lazy" style="height:' + alto + 'px" />' +
          '<figcaption class="media-figcaption"><span>' + (pie || 'Pie de foto') + '</span><span class="license-tag">' + (credito || 'Archivo') + '</span></figcaption></figure>';
      }
      function iniciales(nombre) {
        var p = String(nombre || '').split(/\s+/).filter(Boolean);
        return e(((p[0] || 'R').charAt(0) + (p[1] || '').charAt(0)).toUpperCase());
      }
      function firma(n, hecho) {
        if (!n.firma) return '';
        return '<div class="wb-byline"><span class="wb-byline-avatar">' + iniciales(n.firma) + '</span><div>' +
          '<strong class="wb-byline-name">' + v(n, 'firma') + '</strong>' +
          '<span class="wb-byline-meta">' + (n.lugar ? v(n, 'lugar') + ' · ' : '') + hecho + '</span></div></div>';
      }
      function parrafos(n) { return (n && n.txt && n.txt.length ? n.txt : []).filter(Boolean); }

      var aireada = c.t.dens === 'aireada';
      var densa = c.t.dens === 'densa';

      /* ================================================= 1. PORTADA ====== */
      var lead = c.one('noticias');
      var urgente = c.one('breves');
      var opiniones = c.take('opinion', 3);
      var leidas = c.take('breves', 5);
      var modulos = c.take('noticias', aireada ? 3 : 4);

      var ticker = urgente.tit
        ? '<div class="np-ticker"><span class="np-tag">Última hora</span><span>' + v(urgente, 'tit') + (urgente.txt ? '. ' + v(urgente, 'txt') : '') + '</span></div>'
        : '';

      var pLead = parrafos(lead);
      var principal =
        tag(v(lead, 'sec') || 'Portada') +
        '<h2 class="np-title np-xl">' + c.title + '</h2>' +
        deck(v(lead, 'sum')) +
        foto(v(lead, 'tit'), v(lead, 'lugar') || 'Archivo', 400) +
        (pLead.length
          ? '<div class="wb-flow" style="column-count:2">' + c.ps(pLead, densa ? 3 : 2) + '</div>'
          : '');

      var lateral =
        kicker('Opinión') +
        opiniones.map(function (o) {
          return '<div class="np-opinion"><img class="np-opinion-photo" src="' + c.IMG + '" alt="" />' +
            '<div><span class="np-opinion-author">' + v(o, 'autor') + '</span><h3>' + v(o, 'tit') + '</h3><p>' + v(o, 'frase') + '</p></div></div>';
        }).join('') +
        '<div class="wb-divider" data-style="line"></div>' +
        kicker('Lo más leído') +
        '<ol class="np-ranking">' + leidas.map(function (b) { return b.tit ? '<li>' + v(b, 'tit') + '</li>' : ''; }).join('') + '</ol>';

      var span = aireada ? 4 : 3;
      var fila = modulos.map(function (n) {
        return c.story(span,
          foto(v(n, 'lugar') || v(n, 'sec') || 'Pie de foto', v(n, 'firma') || 'Archivo', aireada ? 190 : 150) +
          tag(v(n, 'sec')) +
          '<h3 class="np-title np-md">' + v(n, 'tit') + '</h3>' +
          '<p>' + v(n, 'sum') + '</p>');
      }).join('');

      var portada =
        c.nameplate('Edición general', 'Número 9.317 · Precio: 1,80') +
        c.nav(8) +
        ticker +
        '<div class="np-grid rules">' +
          c.story(8, principal) +
          c.story(4, lateral) +
          fila +
        '</div>';

      /* ========================================== 2. EL TEMA DEL DÍA ===== */
      var tema = c.one('noticias');
      var cifras = c.take('cifras', 4);
      var crono = c.one('cronologias');
      var claves = c.take('breves', 4);
      var datos = c.take('mercados', 5);
      var pTema = parrafos(tema);

      var stats = cifras.length
        ? kicker('La semana en cifras') + '<div class="stats-grid">' + cifras.map(function (x) {
            return '<div class="stat-card"><div class="stat-value">' + v(x, 'v') + '</div><div class="stat-label">' + v(x, 'l') + '</div></div>';
          }).join('') + '</div>'
        : '';

      var cuerpo =
        foto(v(tema, 'lugar') || v(tema, 'sec') || 'Pie de foto', 'Archivo', 300) +
        '<div class="wb-flow" style="column-count:2">' +
          (pTema[0] ? '<p class="lead-dropcap">' + e(pTema[0]) + '</p>' : '') +
          c.ps(pTema.slice(1), 4) +
        '</div>';

      var hitos = ((crono && crono.hitos) || []).slice(0, 6);
      var cronologia =
        '<div class="np-box">' + kicker('Cronología') +
          '<h3 class="np-title np-sm">' + v(crono, 'tit') + '</h3>' +
          '<div class="timeline">' + hitos.map(function (h) {
            return '<div class="timeline-item"><div class="timeline-year">' + v(h, 'f') + '</div><p>' + v(h, 't') + '</p></div>';
          }).join('') + '</div>' +
        '</div>';

      var tabla = datos.length
        ? kicker('Los mercados al cierre') +
          '<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Valor</th><th>Cierre</th><th>Variación</th></tr></thead><tbody>' +
          datos.map(function (m) { return '<tr><td>' + v(m, 'n') + '</td><td>' + v(m, 'v') + '</td><td>' + v(m, 'd') + '</td></tr>'; }).join('') +
          '</tbody></table></div>'
        : '';

      var despiece =
        '<div class="np-box"><h3 class="np-title np-sm">Las claves</h3>' +
          '<div class="np-briefs">' + claves.map(function (b) {
            return '<div class="np-brief"><h4>' + v(b, 'tit') + '</h4><p>' + v(b, 'txt') + '</p></div>';
          }).join('') + '</div>' +
        '</div>';

      var temaDia =
        '<div class="wb-divider" data-style="thick"></div>' +
        '<div class="np-grid">' +
          c.story(12, tag('El tema del día') +
            '<h2 class="np-title np-lg">' + v(tema, 'tit') + '</h2>' +
            deck(v(tema, 'sum'))) +
        '</div>' +
        firma(tema, v(tema, 'sec') || 'Redacción') +
        stats +
        '<div class="np-grid rules">' +
          c.story(8, cuerpo) +
          c.story(4, cronologia) +
          c.story(7, tabla) +
          c.story(5, despiece) +
        '</div>';

      /* ================================================ 3. LA CONTRA ===== */
      var ent = c.one('entrevistas');
      var qa = ((ent && ent.qa) || []).filter(function (x) { return x && (x.p || x.r); }).slice(0, 6);

      // La frase destacada sale de la propia entrevista: la oración más
      // rotunda (ni muy corta ni muy larga) de las respuestas.
      var frase = '';
      qa.forEach(function (x) {
        String(x.r || '').split(/(?<=[.!?])\s+/).forEach(function (s) {
          s = s.replace(/[.\s]+$/, '');
          if (s.length < 28 || s.length > 110) return;
          if (!frase || Math.abs(s.length - 70) < Math.abs(frase.length - 70)) frase = s;
        });
      });
      if (!frase && qa[0]) frase = String(qa[0].r || '').replace(/[.\s]+$/, '');
      if (!frase) frase = (c.one('citas').txt || '');

      // Las preguntas se reparten en dos columnas de peso parecido.
      var total = qa.reduce(function (s, x) { return s + String(x.p || '').length + String(x.r || '').length; }, 0);
      var colA = [], colB = [], acc = 0;
      qa.forEach(function (x, i) {
        var len = String(x.p || '').length + String(x.r || '').length;
        var segunda = colB.length || (i > 0 && (acc + len / 2 > total / 2 || i === qa.length - 1));
        (segunda ? colB : colA).push(x);
        acc += len;
      });
      function col(list) {
        return '<div class="np-col" data-wb-slot>' + list.map(function (x) {
          return '<p><strong>' + v(x, 'p') + '</strong><br />' + v(x, 'r') + '</p>';
        }).join('') + '</div>';
      }
      // La foto del centro se mide con el texto que hay para rodearla.
      var alto = Math.round((total / 2) / 62 * 28 + Math.ceil(qa.length / 2) * 46);
      var ih = Math.max(96, Math.min(250, alto - 170));
      var iw = Math.round(Math.min(300, ih * 1.3));
      var top = alto > 420 ? 64 : (alto > 250 ? 28 : 0);

      var contra =
        '<div class="wb-divider" data-style="thick"></div>' +
        '<div class="np-grid">' +
          c.story(12, tag('La contra') +
            '<h2 class="np-title np-lg">' + v(ent, 'quien') + '</h2>' +
            deck(v(ent, 'cargo'))) +
        '</div>' +
        (frase ? '<p class="wb-pull">«' + e(frase) + '»</p>' : '') +
        '<div class="np-between" style="--iw:' + iw + 'px;--ih:' + ih + 'px;--top:' + top + 'px">' +
          col(colA) + col(colB) +
          '<figure class="np-between-fig" data-lightbox-src="' + c.IMG + '" data-lightbox-caption=""><img src="' + c.IMG + '" alt="" loading="lazy" />' +
          '<figcaption><span>' + v(ent, 'quien') + (ent.cargo ? ', ' + e(String(ent.cargo).charAt(0).toLowerCase() + String(ent.cargo).slice(1)) : '') + '</span></figcaption></figure>' +
        '</div>';

      var dichos = c.take('citas', 3).filter(function (x) { return x && x.txt && x.txt !== frase; });
      if (dichos.length) {
        contra +=
          '<div class="wb-divider" data-style="line"></div>' + kicker('Dicho esta semana') +
          '<div class="np-grid rules">' + dichos.map(function (x, i) {
            var span = dichos.length === 3 ? 4 : (dichos.length === 2 ? 6 : 12);
            return c.story(span, '<blockquote class="editorial-quote"><p>' + v(x, 'txt') + '</p><cite>' + v(x, 'autor') + '</cite></blockquote>');
          }).join('') + '</div>';
      }

      return c.wrap(
        c.section('portada', portada) +
        c.section('tema', temaDia) +
        c.section('contra', contra));
    }
  });
})();
