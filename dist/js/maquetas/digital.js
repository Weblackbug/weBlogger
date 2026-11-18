/* ==========================================================================
   weBlogger - maqueta «digital»: el medio nativo digital.

   Portada de tarjetas: última hora, una apertura grande con «Lo más leído» al
   lado, dos filas de tarjetas iguales, un directo minuto a minuto y un bloque
   de datos. Después, un explicativo de lectura cómoda («Las claves») y, para
   cerrar, la opinión y la suscripción al boletín.

   No lleva CSS: solo piezas del kit de diario. El carácter lo pone la ficha.
   ========================================================================== */
(function () {
  'use strict';

  // Horas del directo, de la más reciente a la más antigua.
  var HORAS = ['13.42', '13.18', '12.55', '12.31', '11.47', '11.05'];

  WB.addLayout({
    id: 'digital',
    name: 'Medio digital',
    desc: 'Portada de tarjetas con última hora, lo más leído, directo minuto a minuto, datos y un explicativo con preguntas y respuestas.',
    build: function (c) {
      var e = c.esc;

      function tag(t) { return '<span class="np-tag">' + e(t) + '</span>'; }
      function kicker(t) { return '<span class="section-kicker">' + e(t) + '</span>'; }
      function words(arr) { return (arr || []).join(' ').split(/\s+/).filter(Boolean).length; }
      function initials(name) {
        var p = String(name || '').split(/\s+/).filter(Boolean);
        return ((p[0] || 'R').charAt(0) + (p[1] || '').charAt(0)).toUpperCase();
      }
      /** Una frase entrecomillada del propio texto, para la cita destacada. */
      function frase(txt) {
        var m, re = /«([^»]{40,170})»/g, all = (txt || []).join(' ');
        while ((m = re.exec(all))) { if (m[1].length > 60 || /[.!?…]$/.test(m[1])) return m[1].replace(/[.,;:]$/, ''); }
        return '';
      }
      /** Breves del banco; si aún no hay, salen de las noticias (titular y sumario). */
      function breves(n) {
        var b = c.take('breves', n);
        if (b.length) return b;
        return c.take('noticias', n).map(function (x) { return { tit: x.tit, txt: x.sum }; });
      }
      /** Tarjeta: foto, etiqueta, titular y una línea. */
      function card(n, span, size) {
        return c.story(span,
          c.fig(n.lugar || n.sec || 'Imagen de la noticia', n.firma || 'Archivo') +
          tag(n.sec || 'Actualidad') +
          '<h3 class="np-title ' + size + '">' + e(n.tit || '') + '</h3>' +
          '<p>' + e(n.sum || '') + '</p>');
      }

      /* ------------------------------------------------ 1. portada ------- */
      var lead = c.one('noticias');
      var ultima = breves(1)[0] || {};
      var leidas = c.take('noticias', 5);
      var segunda = c.one('noticias');
      var fila1 = c.take('noticias', 3);
      var fila2 = c.take('noticias', 4);
      var directo = c.one('noticias');
      var minutos = breves(5);
      var cifras = c.take('cifras', 4);

      var portada =
        c.nameplate('Edición digital', 'Actualizado a las ' + HORAS[0]) +
        c.nav(8) +
        '<div class="np-ticker">' + tag('Última hora') + '<span>' + e(ultima.tit || '') + '</span></div>' +

        // apertura + lo más leído
        '<div class="np-grid rules">' +
          c.story(8,
            tag(lead.sec || 'Portada') +
            '<h2 class="np-title np-xl">' + c.title + '</h2>' +
            '<p class="np-deck">' + e(lead.sum || '') + '</p>' +
            c.fig(lead.lugar || 'Imagen de apertura', lead.firma || 'Archivo') +
            c.ps(lead.txt, 2)) +
          c.story(4,
            kicker('Lo más leído') +
            '<ol class="np-ranking">' +
              leidas.map(function (n) { return '<li>' + e(n.tit || '') + '</li>'; }).join('') +
            '</ol>' +
            c.fig(segunda.lugar || segunda.sec || 'Imagen de la noticia', segunda.firma || 'Archivo') +
            tag(segunda.sec || 'Actualidad') +
            '<h3 class="np-title np-md">' + e(segunda.tit || '') + '</h3>' +
            '<p>' + e(segunda.sum || '') + '</p>') +
        '</div>' +

        // dos filas de tarjetas iguales
        '<div class="np-grid">' +
          fila1.map(function (n) { return card(n, 4, 'np-md'); }).join('') +
        '</div>' +
        '<div class="np-grid">' +
          fila2.map(function (n) { return card(n, 3, 'np-sm'); }).join('') +
        '</div>' +

        // en directo
        '<div class="wb-divider" data-style="thick"></div>' +
        '<div class="np-grid">' +
          c.story(7,
            '<div class="np-cover" data-lightbox-src="' + c.IMG + '" data-lightbox-caption="">' +
              '<img src="' + c.IMG + '" alt="" loading="lazy" style="height:470px" />' +
              '<div class="np-cover-text">' + tag('En directo') +
                '<h2 class="np-title np-lg">' + e(directo.tit || '') + '</h2>' +
                '<p>' + e(directo.sum || '') + '</p>' +
              '</div>' +
            '</div>') +
          c.story(5,
            kicker('Minuto a minuto') +
            '<div class="timeline">' +
              minutos.map(function (b, i) {
                return '<div class="timeline-item"><div class="timeline-year">' + HORAS[i % HORAS.length] + ' h</div>' +
                  '<p><strong>' + e(b.tit || '') + '.</strong> ' + e(b.txt || '') + '</p></div>';
              }).join('') +
            '</div>') +
        '</div>' +

        // datos
        (!cifras.length ? '' :
        kicker('Datos') +
        '<h2 class="np-title np-md">El día, en cuatro cifras</h2>' +
        '<div class="stats-grid">' +
          cifras.map(function (x) {
            return '<div class="stat-card"><div class="stat-value">' + e(x.v || '') + '</div><div class="stat-label">' + e(x.l || '') + '</div></div>';
          }).join('') +
        '</div>');

      /* --------------------------------------------- 2. explicativo ------ */
      var exp = c.one('noticias');
      var rel = c.take('noticias', 2);
      var claves = breves(4);
      var propia = frase(exp.txt);
      var cita = propia ? { txt: propia, autor: '' } : c.one('citas');
      var crono = c.one('cronologias');
      var entre = c.one('entrevistas');
      var hitos = (crono.hitos || []).slice(0, 6);
      var qa = (entre.qa || []).slice(0, 5);

      // La imagen encajada crece con el texto que tiene alrededor.
      rel = [rel[0] || {}, rel[1] || {}];
      var menor = Math.min(words(rel[0].txt), words(rel[1].txt));
      var alto = Math.max(110, Math.min(250, Math.round(menor * 2.1) - 10));
      var ancho = Math.round(alto * 1.25);

      var explicativo =
        '<div class="np-grid">' +
          c.story(8,
            tag('Las claves') +
            '<h2 class="np-title np-lg">' + e(exp.tit || '') + '</h2>' +
            '<p class="wb-lead">' + e(exp.sum || '') + '</p>' +
            '<div class="wb-byline"><span class="wb-byline-avatar">' + e(initials(exp.firma)) + '</span><div>' +
              '<strong class="wb-byline-name">' + e(exp.firma || 'Redacción') + '</strong>' +
              '<span class="wb-byline-meta">' + e((exp.lugar ? exp.lugar + ' · ' : '') + c.fecha) + '</span></div></div>' +
            (exp.txt && exp.txt.length ? '<p class="lead-dropcap">' + e(exp.txt[0]) + '</p>' + c.ps(exp.txt.slice(1), 4) : '') +
            (cita.txt ? '<p class="wb-pull">«' + e(cita.txt) + '»</p>' +
              '<p class="wb-note">' + e(cita.autor || '') + '</p>' : '')) +
          c.story(4,
            c.fig(exp.lugar || exp.sec || 'Imagen del explicativo', 'Archivo') +
            '<div class="np-box" data-wb-slot>' +
              '<h3 class="np-title np-sm">También hoy, en cuatro claves</h3>' +
              '<ul>' +
                claves.map(function (b) { return '<li><strong>' + e(b.tit || '') + '.</strong> ' + e(b.txt || '') + '</li>'; }).join('') +
              '</ul>' +
            '</div>') +
        '</div>' +

        '<div class="wb-divider" data-style="line"></div>' +
        kicker('El contexto') +
        '<div class="np-between" style="--iw:' + ancho + 'px;--ih:' + alto + 'px;--top:76px">' +
          rel.map(function (n) {
            return '<div class="np-col" data-wb-slot><h3 class="np-title np-sm">' + e(n.tit || '') + '</h3>' + c.ps(n.txt, 4) + '</div>';
          }).join('') +
          '<figure class="np-between-fig" data-lightbox-src="' + c.IMG + '" data-lightbox-caption="">' +
            '<img src="' + c.IMG + '" alt="" loading="lazy" /><figcaption><span>' + e(rel[0].lugar || rel[0].sec || 'Imagen de archivo') + '</span></figcaption></figure>' +
        '</div>' +

        (!hitos.length && !qa.length ? '' :
        '<div class="np-grid rules">' +
          (!hitos.length ? '' : c.story(qa.length ? 6 : 12,
            kicker('Cómo hemos llegado hasta aquí') +
            '<h3 class="np-title np-md">' + e(crono.tit || 'La cronología') + '</h3>' +
            '<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Cuándo</th><th>Qué pasó</th></tr></thead><tbody>' +
              hitos.map(function (h) { return '<tr><td><strong>' + e(h.f || '') + '</strong></td><td>' + e(h.t || '') + '</td></tr>'; }).join('') +
            '</tbody></table></div>')) +
          (!qa.length ? '' : c.story(hitos.length ? 6 : 12,
            kicker('Preguntas y respuestas') +
            '<h3 class="np-title np-md">' + e(entre.quien || 'La redacción') + ' responde</h3>' +
            '<p class="wb-note">' + e(entre.cargo || '') + '</p>' +
            '<div class="wb-acc">' +
              qa.map(function (x, i) {
                return '<details class="wb-acc-item"' + (i === 0 ? ' open' : '') + '><summary>' + e(x.p || '') + '</summary>' +
                  '<div class="wb-acc-body" data-wb-slot><p>' + e(x.r || '') + '</p></div></details>';
              }).join('') +
            '</div>')) +
        '</div>');

      /* ------------------------------------- 3. opinión y boletín -------- */
      var firmas = c.take('opinion', 2);
      var cierre =
        '<div class="np-grid rules">' +
          (!firmas.length ? '' : c.story(7,
            tag('Opinión') +
            '<h2 class="np-title np-md">Las firmas del día</h2>' +
            firmas.map(function (o) {
              return '<div class="np-opinion"><img class="np-opinion-photo" src="' + c.IMG + '" alt="" />' +
                '<div><span class="np-opinion-author">' + e(o.autor || '') + '</span>' +
                '<h3>' + e(o.tit || '') + '</h3><p>' + e(o.frase || '') + '</p></div></div>';
            }).join(''))) +
          c.story(firmas.length ? 5 : 12,
            '<div class="np-box" data-wb-slot>' +
              kicker('Boletín') +
              '<h3 class="np-title np-md">La Primera Hora</h3>' +
              '<p>Cada mañana, a las siete, lo imprescindible de ' + c.mast + ' en cinco minutos de lectura: las noticias que importan, un dato y una firma.</p>' +
              '<p class="wb-note">Gratis, de lunes a viernes. Puedes darte de baja cuando quieras.</p>' +
              '<div class="wb-btn-row"><a class="wb-btn" href="#">Quiero recibirlo</a></div>' +
            '</div>') +
        '</div>';

      return c.wrap(
        c.section('portada', portada) +
        c.section('claves', explicativo) +
        c.section('opinion', cierre));
    }
  });
})();
