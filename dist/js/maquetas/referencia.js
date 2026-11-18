/* Maqueta «referencia»: el diario generalista europeo de referencia, sobrio.
   Portada repartida 3 + 6 + 3 sobre la rejilla de doce (dos noticias a la
   izquierda, la foto grande con el titular debajo en el centro y la columna
   de opinión a la derecha) y, debajo, una banda de cinco piezas menores.
   Segunda sección: un reportaje a tres columnas con capitular, cita cruzando
   columnas, imagen entre columnas y despiece de cifras. Tercera: editorial,
   tribuna, firmas y una entrevista en pregunta y respuesta.
   No lleva CSS: el carácter lo pone la ficha. */
(function () {
  'use strict';

  WB.addLayout({
    id: 'referencia',
    name: 'Diario de referencia',
    desc: 'Cinco columnas sobrias: foto grande central con el titular debajo, dos noticias a un lado y la columna de opinión al otro.',
    build: function (c) {
      var e = c.esc, IMG = c.IMG;

      /* ------------------------------------------------ utilidades ---- */
      function tag(t) { return t ? '<span class="np-tag">' + e(t) + '</span>' : ''; }
      function kicker(t) { return '<span class="section-kicker">' + e(t) + '</span>'; }
      function title(size, t, extra) { return '<h3 class="np-title ' + size + (extra ? ' ' + extra : '') + '">' + e(t || '') + '</h3>'; }
      function p(t) { return t ? '<p>' + e(t) + '</p>' : ''; }
      function deck(t) { return t ? '<p class="np-deck">' + e(t) + '</p>' : ''; }
      function note(t) { return t ? '<p class="wb-note">' + t + '</p>' : ''; }
      function firma(n) {
        var partes = [n.firma, n.lugar].filter(Boolean);
        return partes.length ? note(e(partes.join(' · '))) : '';
      }
      function words(arr) { return (arr || []).join(' ').split(/\s+/).filter(Boolean).length; }
      function initials(nombre) {
        return String(nombre || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
      }
      function sentence(t) {                      // la primera frase con cuerpo de un texto
        var fr = String(t || '').match(/[^.!?…]+[.!?…]+(?=\s|$)/g) || [String(t || '')];
        var buena = fr.map(function (x) { return x.trim(); }).filter(function (x) { return x.length >= 35 && x.length <= 150; })[0];
        return (buena || fr.join(' ').trim()).replace(/\.$/, '');
      }
      function opinion(o) {
        return '<div class="np-opinion"><img class="np-opinion-photo" src="' + IMG + '" alt="" />' +
          '<div><span class="np-opinion-author">' + e(o.autor || '') + '</span><h3>' + e(o.tit || '') + '</h3><p>' + e(o.frase || '') + '</p></div></div>';
      }
      function byline(nombre, meta) {
        return '<div class="wb-byline"><span class="wb-byline-avatar">' + e(initials(nombre)) + '</span><div>' +
          '<strong class="wb-byline-name">' + e(nombre || '') + '</strong><span class="wb-byline-meta">' + e(meta) + '</span></div></div>';
      }

      /* -------------------------------------------------- portada ---- */
      var lead = c.one('noticias');
      var izq = c.take('noticias', 2);
      var firmas = c.take('opinion', 3);
      var edit = c.one('opinion');
      var banda = c.take('noticias', 4);
      var breves = c.take('breves', 3);
      var leidas = c.take('noticias', 4);
      var leadTxt = lead.txt || [];

      var portada =
        c.nameplate('Edición nacional', 'Año XLVIII · Número 16.912') +
        c.nav(8) +

        '<div class="np-grid rules">' +

        // columna izquierda: dos noticias, la segunda con foto pequeña
        c.story(3,
          tag(izq[0].sec) +
          title('np-md', izq[0].tit) +
          deck(izq[0].sum) +
          c.ps(izq[0].txt, 2) +
          firma(izq[0]) +
          '<div class="wb-divider" data-style="line"></div>' +
          tag(izq[1].sec) +
          title('np-sm', izq[1].tit) +
          c.ps(izq[1].txt, 1) +
          firma(izq[1])) +

        // centro: la foto grande y, debajo, el titular del día
        c.story(6,
          c.fig(lead.sum || lead.tit, lead.firma) +
          tag(lead.sec) +
          '<h2 class="np-title np-lg">' + c.title + '</h2>' +
          deck(lead.sum) +
          '<div class="wb-flow" data-wb-slot style="column-count:2">' +
            (leadTxt.length ? '<p><strong>' + e([lead.firma, lead.lugar].filter(Boolean).join('. ')) + '.</strong> ' + e(leadTxt[0]) + '</p>' : '') +
            c.ps(leadTxt.slice(1), 3) +
            note('<em>Sigue en la página 6</em>') +
          '</div>') +

        // columna derecha: opinión
        c.story(3,
          kicker('Opinión') +
          firmas.map(opinion).join('') +
          '<div class="np-briefs"><div class="np-brief"><h4>Editorial: ' + e(edit.tit || '') + '</h4><p>' + e(edit.frase || '') + ' <em>Pasa a la página 14</em></p></div></div>' +
          kicker('Lo más leído') +
          '<ol class="np-ranking">' + leidas.filter(function (x) { return x.tit; }).map(function (x) { return '<li>' + e(x.tit) + '</li>'; }).join('') + '</ol>') +

        '</div>' +

        // la banda baja: cinco piezas menores
        '<div class="np-grid rules">' +
        c.story(4,
          c.fig(banda[0].sum || banda[0].tit, banda[0].firma) +
          tag(banda[0].sec) +
          title('np-md', banda[0].tit) +
          c.ps(banda[0].txt, 1)) +
        c.story(2,
          tag(banda[1].sec) +
          title('np-sm', banda[1].tit) +
          c.ps(banda[1].txt, 1) +
          note('<em>Sigue en la página 21</em>')) +
        c.story(2,
          tag(banda[2].sec) +
          title('np-sm', banda[2].tit, 'light') +
          c.ps(banda[2].txt, 1) +
          note('<em>Sigue en la página 27</em>')) +
        c.story(2,
          tag(banda[3].sec) +
          title('np-sm', banda[3].tit) +
          c.ps(banda[3].txt, 1) +
          note('<em>Sigue en la página 34</em>')) +
        c.story(2,
          kicker('En breve') +
          '<div class="np-briefs">' + breves.map(function (b) {
            return '<div class="np-brief"><h4>' + e(b.tit || '') + '</h4><p>' + e(b.txt || '') + '</p></div>';
          }).join('') + '</div>') +
        '</div>';

      /* ------------------------------------------------ reportaje ---- */
      var rep = c.one('noticias');
      var sub = c.take('noticias', 2);
      var cita = c.one('citas');
      var cifras = c.take('cifras', 4);
      var rt = (rep.txt || []).slice();
      // con un banco escaso el reportaje se queda en nada: se alarga con las piezas vecinas
      if (words(rt) < 110) rt = rt.concat(sub[0].txt || [], sub[1].txt || []);
      var flow = rt.map(function (t, i) {
        return i === 0 ? '<p class="lead-dropcap">' + e(t) + '</p>' : p(t);
      }).join('');

      // la imagen entre columnas se encoge si las dos piezas traen poco texto
      var corto = Math.min(words(sub[0].txt), words(sub[1].txt));
      var iw = corto >= 130 ? 280 : corto >= 85 ? 240 : 200;
      var ih = corto >= 130 ? 240 : corto >= 85 ? 200 : 150;
      function col(s) {
        return '<div class="np-col" data-wb-slot>' + c.ps(s.txt, 4) + '</div>';
      }

      var reportaje =
        '<div class="wb-headline">' +
          kicker('Reportaje') +
          '<h2 class="np-title np-xl">' + e(rep.tit || '') + '</h2>' +
          deck(rep.sum) +
        '</div>' +
        byline(rep.firma, [rep.lugar, c.fecha].filter(Boolean).join(' · ')) +
        '<div class="np-grid rules">' +
          c.story(7, '<div class="wb-flow" data-wb-slot style="column-count:2">' + flow + '</div>') +
          c.story(5, c.fig(rep.sum || rep.tit, rep.firma) +
            (cita.txt ? '<p class="wb-pull">«' + e(cita.txt) + '»</p>' + (cita.autor ? note(e(cita.autor)) : '') : '')) +
        '</div>' +

        '<div class="wb-divider" data-style="double"></div>' +
        '<div class="np-grid">' +
          c.story(6, tag(sub[0].sec) + title('np-md', sub[0].tit)) +
          c.story(6, tag(sub[1].sec) + title('np-md', sub[1].tit)) +
        '</div>' +
        '<div class="np-between" style="--iw:' + iw + 'px;--ih:' + ih + 'px;--top:40px">' +
          col(sub[0]) + col(sub[1]) +
          '<figure class="np-between-fig" data-lightbox-src="' + IMG + '" data-lightbox-caption=""><img src="' + IMG + '" alt="" loading="lazy" />' +
          '<figcaption><span>' + e(sub[0].sum || sub[0].tit || '') + '</span></figcaption></figure>' +
        '</div>' +

        '<div class="np-box" data-wb-slot>' + kicker('En cifras') +
          '<div class="stats-grid">' + cifras.map(function (x) {
            return '<div class="stat-card"><div class="stat-value">' + e(x.v || '') + '</div><div class="stat-label">' + e(x.l || '') + '</div></div>';
          }).join('') + '</div>' +
        '</div>';

      /* -------------------------------------------------- opinión ---- */
      // cada texto largo va con su propio titular: el análisis es una noticia entera
      var an = c.one('noticias');
      var trib = c.one('opinion');
      var mas = c.take('opinion', 3);
      var cita2 = c.one('citas');
      var ent = c.one('entrevistas');
      var qa = (ent.qa || []).slice(0, 6);
      var frase = qa.length ? sentence((qa[1] || qa[0]).r) : '';
      var preguntas = qa.map(function (x, i) {
        return '<p><strong>' + (i ? 'P.' : 'Pregunta.') + '</strong> ' + e(x.p || '') + '</p>' +
          '<p><strong>' + (i ? 'R.' : 'Respuesta.') + '</strong> ' + e(x.r || '') + '</p>';
      }).join('');

      var opinionSec =
        '<div class="np-grid rules">' +
        c.story(5,
          kicker('Análisis') +
          title('np-md', an.tit) +
          deck(an.sum) +
          c.ps(an.txt, 3) +
          firma(an)) +
        c.story(4,
          kicker('Editorial') +
          title('np-lg', edit.tit) +
          (edit.frase ? '<p class="wb-lead">' + e(edit.frase) + '</p>' : '') +
          '<div class="wb-divider" data-style="line"></div>' +
          kicker('Tribuna') +
          opinion(trib) +
          (cita2.txt ? '<blockquote class="editorial-quote"><p>' + e(cita2.txt) + '</p><cite>' + e(cita2.autor || '') + '</cite></blockquote>' : '')) +
        c.story(3,
          kicker('Firmas') +
          mas.map(opinion).join('')) +
        '</div>' +

        (qa.length ?
        '<div class="np-grid rules">' +
        c.story(4,
          c.fig([ent.quien, ent.cargo].filter(Boolean).join(', '), 'Archivo') +
          (frase ? '<p class="wb-pull">«' + e(frase) + '»</p>' : '')) +
        c.story(8,
          kicker('Entrevista') +
          title('np-lg', ent.quien) +
          deck(ent.cargo) +
          '<div class="wb-flow" data-wb-slot style="column-count:2">' + preguntas + '</div>') +
        '</div>' : '');

      return c.wrap(
        c.section('portada', portada) +
        c.section('reportaje', reportaje) +
        c.section('opinion', opinionSec));
    }
  });
})();
