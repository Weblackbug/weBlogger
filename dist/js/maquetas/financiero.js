/* ==========================================================================
   weBlogger - maqueta «financiero»: el diario de economía y finanzas.

   Portada: cabecera, teletipo de mercados, la noticia principal a ocho
   columnas con una foto discreta y, en el lateral, la tabla de mercados y
   las cifras del día; debajo, las piezas de análisis con firma.
   Segunda sección: un análisis largo a dos columnas con un gráfico encajado,
   el despiece «En cifras», la cronología de una operación y una comparativa.
   Tercera: opinión de mercados, breves corporativos y agenda de la semana.

   Sin CSS propio: solo las piezas del kit. El carácter lo pone la ficha.
   ========================================================================== */
(function () {
  'use strict';

  var ECO = /econom|empresa|mercad|finan|bolsa|negocio|banca|invers|energ|industria|laboral|trabajo/i;

  /** Quita los repetidos (el banco pequeño da la vuelta). */
  function unique(arr, key) {
    var seen = {}, out = [];
    arr.forEach(function (x) {
      var k = String((x && x[key]) || '');
      if (!x || seen[k]) return;
      seen[k] = 1;
      out.push(x);
    });
    return out;
  }

  function chars(arr) {
    return arr.reduce(function (n, p) { return n + String(p || '').length; }, 0);
  }

  /** Reparte los párrafos en dos columnas de peso parecido. */
  function split(paras) {
    var list = paras.filter(Boolean).map(String);
    if (list.length === 1) {                      // un solo párrafo: se parte por frases
      var parts = list[0].match(/[^.!?…]+[.!?…]+["»”]?\s*|[^.!?…]+$/g) || [list[0]];
      list = parts.map(function (s) { return s.trim(); }).filter(Boolean);
      if (list.length < 2) return [list, []];
      var half0 = chars(list) / 2, a0 = [], b0 = [], n0 = 0;
      list.forEach(function (s) { if (n0 < half0) { a0.push(s); n0 += s.length; } else b0.push(s); });
      return [[a0.join(' ')], b0.length ? [b0.join(' ')] : []];
    }
    var half = chars(list) / 2, a = [], b = [], n = 0;
    list.forEach(function (p, i) {
      // el párrafo va a la izquierda mientras no la pase de la mitad (y siempre queda uno a la derecha)
      if (i < list.length - 1 && (n === 0 || n + p.length / 2 < half)) { a.push(p); n += p.length; } else b.push(p);
    });
    return [a, b];
  }

  WB.addLayout({
    id: 'financiero',
    name: 'Diario económico',
    desc: 'Portada con tabla de mercados y cifras, análisis largo con gráfico, cronología, comparativa, opinión y agenda económica.',
    build: function (c) {
      var e = c.esc;

      function initials(name) {
        return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
      }
      function byline(n, meta) {
        if (!n.firma) return '';
        var m = [meta || '', n.lugar || ''].filter(Boolean).join(' · ');
        return '<div class="wb-byline"><span class="wb-byline-avatar">' + e(initials(n.firma)) + '</span><div>' +
          '<strong class="wb-byline-name">' + e(n.firma) + '</strong>' +
          (m ? '<span class="wb-byline-meta">' + e(m) + '</span>' : '') + '</div></div>';
      }
      function fig(pie, credito, alto, cls) {
        return '<figure class="media-figure' + (cls ? ' ' + cls : '') + '" data-lightbox-src="' + c.IMG + '" data-lightbox-caption="">' +
          '<img src="' + c.IMG + '" alt="" loading="lazy" style="height:' + alto + 'px" />' +
          '<figcaption class="media-figcaption"><span>' + e(pie) + '</span><span class="license-tag">' + e(credito) + '</span></figcaption></figure>';
      }
      /** Escapa y pega el signo de porcentaje a su cifra, para que no salte de línea. */
      function nb(x) { return e(x || '').replace(/ %/g, '&nbsp;%'); }
      function table(head, rows) {
        return '<div class="wb-table-wrap"><table class="wb-table"><thead><tr>' +
          head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + nb(x) + '</td>'; }).join('') + '</tr>'; }).join('') +
          '</tbody></table></div>';
      }
      function stats(list, max) {
        // a dos columnas si las cifras caben; las largas («9.027.416») van una por fila
        var cols = list.every(function (x) { return String(x.v || '').length <= max; }) ? 2 : 1;
        return '<div class="stats-grid" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">' + list.map(function (x) {
          return '<div class="stat-card"><div class="stat-value">' + e(x.v || '') + '</div><div class="stat-label">' + e(x.l || '') + '</div></div>';
        }).join('') + '</div>';
      }

      /* ---- el material: primero lo de economía ---- */
      var pool = unique(c.take('noticias', 14), 'tit');
      var eco = pool.filter(function (n) { return ECO.test(n.sec || ''); });
      var rest = pool.filter(function (n) { return !ECO.test(n.sec || ''); });
      pool = eco.concat(rest);
      if (!pool.length) pool = [{}];
      function pick(i) { return pool[i % pool.length]; }

      var lead = pick(0);
      var nAna = pool.length >= 6 ? 4 : 3;
      // el análisis largo: de lo que queda, el texto más extenso (mejor si es de economía)
      var others = pool.slice(1);
      var longIdx = -1, best = -1;
      others.forEach(function (n, i) {
        var w = chars(n.txt || []) + (ECO.test(n.sec || '') ? 100000 : 0);
        if (w > best) { best = w; longIdx = i; }
      });
      var an = longIdx > -1 && pool.length > nAna + 1 ? others.splice(longIdx, 1)[0] : pick(nAna + 1);
      var piezas = [];
      for (var i = 0; i < nAna; i++) piezas.push(others.length ? others[i % others.length] : lead);

      // los mercados se reparten sin repetir: teletipo, tabla del cierre y comparativa de valores
      var mk = unique(c.take('mercados', 16), 'n');
      var nTick = mk.length >= 12 ? 3 : 0;
      var nComp = mk.length >= 9 ? 5 : 0;
      var tickList = mk.slice(mk.length - nTick);
      var comp = mk.slice(mk.length - nTick - nComp, mk.length - nTick);
      var mercados = mk.slice(0, Math.min(8, mk.length - nTick - nComp));
      var cifras = unique(c.take('cifras', 7), 'l');
      var cita = c.one('citas');
      var crono = c.one('cronologias');
      var opin = unique(c.take('opinion', 3), 'tit');
      var breves = unique(c.take('breves', 4), 'tit');
      var agenda = unique(c.take('agenda', 5), 't');

      /* ================================================= portada ========= */
      var tick = tickList.map(function (m) {
        return e(m.n || '') + ' ' + nb(m.v) + (m.d ? ' (' + nb(m.d) + ')' : '');
      }).join(' &nbsp;·&nbsp; ');
      var ultima = pick(pool.length - 1);
      var ticker = tick
        ? '<div class="np-ticker"><span class="np-tag">Mercados</span><span>' + tick + '</span></div>'
        : (ultima.tit ? '<div class="np-ticker"><span class="np-tag">Última hora</span><span>' + e(ultima.tit) + '</span></div>' : '');

      var leadTxt = (lead.txt || []).slice(0, 3);
      var principal =
        '<span class="np-tag">' + e(lead.sec || 'Economía') + '</span>' +
        '<h2 class="np-title np-xl">' + c.title + '</h2>' +
        (lead.sum ? '<p class="np-deck">' + e(lead.sum) + '</p>' : '') +
        byline(lead, 'Redacción de Economía') +
        '<div class="wb-flow" data-wb-slot style="column-count:2">' +
          fig(lead.tit || lead.sum || 'La sede de la compañía, ayer', lead.lugar || 'Archivo', 250, 'span-all') +
          c.ps(leadTxt, 3) +
        '</div>';

      var lateral =
        (mercados.length
          ? '<span class="section-kicker">Mercados</span>' +
            '<h3 class="np-title np-sm">El cierre de la sesión</h3>' +
            table(['Índice', 'Valor', 'Var.'], mercados.map(function (m) { return [m.n, m.v, m.d]; }))
          : '<span class="section-kicker">Además</span>' +
            '<div class="np-briefs">' + pool.slice(-3).map(function (n) {
              return '<div class="np-brief"><h4>' + e(n.tit || '') + '</h4><p>' + e(n.sum || '') + '</p></div>';
            }).join('') + '</div>') +
        (cifras.length ? '<div class="np-box" data-wb-slot><h3 class="np-title np-sm">Las cifras del día</h3>' + stats(cifras.slice(0, 2), 6) + '</div>' : '');

      var portada =
        c.nameplate('Economía y mercados', 'Año XXVII · Número 9.418') +
        c.nav(7) +
        ticker +
        '<div class="np-grid rules">' +
          c.story(8, principal) +
          c.story(4, lateral) +
        '</div>' +
        '<div class="np-grid rules">' +
          piezas.map(function (n, k) {
            return c.story(12 / nAna,
              '<span class="section-kicker">' + (k === 0 ? 'Análisis' : e(n.sec || 'Empresas')) + '</span>' +
              '<h3 class="np-title ' + (k === 0 ? 'np-md' : 'np-sm') + '">' + e(n.tit || '') + '</h3>' +
              (k === 0
                ? fig(n.lugar ? n.lugar + ', en una imagen de archivo' : 'Imagen de archivo', 'Archivo', 150) + (n.sum ? '<p class="np-deck">' + e(n.sum) + '</p>' : '')
                : c.ps(n.txt, 1)) +
              byline(n, 'Análisis'));
          }).join('') +
        '</div>';

      /* ================================================ análisis ========= */
      var cols = split(an.txt || []);
      var corta = Math.min(chars(cols[0]), chars(cols[1]));
      var altoTexto = Math.ceil(corta / 52) * 27;                 // lo que ocupa la columna más corta junto a la imagen
      var ih = Math.max(130, Math.min(250, altoTexto - 24));
      var top = altoTexto > 340 ? 54 : 6;
      var iw = ih < 180 ? 220 : 280;
      // la cifra del gráfico no se repite en el lateral ni en el despiece
      var grafico = cifras.length > 3 ? cifras[2] : {};
      var pieGrafico = grafico.v ? grafico.v + ': ' + (grafico.l || '') : 'Evolución del último año';

      function col(paras, capital) {
        return '<div class="np-col" data-wb-slot>' + paras.map(function (p, k) {
          return '<p' + (capital && k === 0 ? ' class="lead-dropcap"' : '') + '>' + e(p) + '</p>';
        }).join('') + '</div>';
      }

      // la cita destacada sale del propio análisis si trae algo dicho entre comillas
      var dichoM = /«([^«»]{30,170})»/.exec((an.txt || []).join(' '));
      var dicho = dichoM ? dichoM[1].replace(/[\s.,;:]+$/, '') : '';
      var hitos = (crono.hitos || []).slice(0, 5);
      var enCifras = cifras.length > 3 ? cifras.slice(3, 7) : cifras.slice(2);
      var despiece =
        (enCifras.length ? c.story(hitos.length ? 5 : 12,
          '<div class="np-box" data-wb-slot><h3 class="np-title np-sm">En cifras</h3>' + stats(enCifras, 9) + '</div>') : '') +
        (hitos.length ? c.story(enCifras.length ? 7 : 12,
          '<span class="section-kicker">Cronología</span>' +
          '<h3 class="np-title np-md">' + e(crono.tit || 'Los pasos de la operación') + '</h3>' +
          '<div class="timeline">' + hitos.map(function (h) {
            return '<div class="timeline-item"><div class="timeline-year">' + e(h.f || '') + '</div><p>' + e(h.t || '') + '</p></div>';
          }).join('') + '</div>') : '') +
        (comp.length ? c.story(12,
          '<span class="section-kicker">Comparativa</span>' +
          '<h3 class="np-title np-sm">Así quedan los valores que mueven la semana</h3>' +
          table(['Valor', 'Último', 'Variación', 'Tendencia'], comp.map(function (m) {
            var d = String(m.d || '');
            return [m.n, m.v, d, /^\s*[-−–]/.test(d) ? 'A la baja' : (/[1-9]/.test(d) ? 'Al alza' : 'Sin cambios')];
          }))) : '');

      var analisis =
        '<div class="np-grid">' +
          c.story(12,
            '<span class="np-tag">Análisis</span>' +
            '<h2 class="np-title np-lg">' + e(an.tit || '') + '</h2>' +
            (an.sum ? '<p class="np-deck">' + e(an.sum) + '</p>' : '') +
            byline(an, 'Análisis')) +
        '</div>' +
        '<div class="np-between" style="--iw:' + iw + 'px;--ih:' + ih + 'px;--top:' + top + 'px;min-height:' + (top + ih + 18) + 'px">' +
          col(cols[0], true) + col(cols[1], false) +
          '<figure class="np-between-fig" data-lightbox-src="' + c.IMG + '" data-lightbox-caption="">' +
            '<img src="' + c.IMG + '" alt="" loading="lazy" />' +
            '<figcaption><span>' + e(pieGrafico) + '</span></figcaption></figure>' +
        '</div>' +
        (dicho ? '<blockquote class="editorial-quote"><p>«' + e(dicho) + '»</p></blockquote>'
          : cita.txt ? '<blockquote class="editorial-quote"><p>' + e(cita.txt) + '</p>' + (cita.autor ? '<cite>' + e(cita.autor) + '</cite>' : '') + '</blockquote>' : '') +
        (despiece ? '<div class="np-grid rules">' + despiece + '</div>' : '');

      /* ======================================== opinión y agenda ========= */
      var bloques = [];
      if (opin.length) bloques.push(
        '<span class="np-tag">Opinión</span>' +
        '<h3 class="np-title np-sm">La mirada de los mercados</h3>' +
        opin.map(function (o) {
          return '<div class="np-opinion"><img class="np-opinion-photo" src="' + c.IMG + '" alt="" />' +
            '<div><span class="np-opinion-author">' + e(o.autor || '') + '</span><h3>' + e(o.tit || '') + '</h3><p>' + e(o.frase || '') + '</p></div></div>';
        }).join(''));
      if (breves.length) bloques.push(
        '<span class="np-tag">Empresas</span>' +
        '<h3 class="np-title np-sm">Breves corporativos</h3>' +
        '<div class="np-briefs">' + breves.map(function (b) {
          return '<div class="np-brief"><h4>' + e(b.tit || '') + '</h4><p>' + e(b.txt || '') + '</p></div>';
        }).join('') + '</div>');
      if (agenda.length) bloques.push(
        '<span class="np-tag">Agenda</span>' +
        '<h3 class="np-title np-sm">La semana económica</h3>' +
        table(['Día', 'Cita', 'Lugar'], agenda.map(function (a) { return [a.d, a.t, a.l]; })));
      var anchos = bloques.length === 3 ? [4, 3, 5] : bloques.length === 2 ? [6, 6] : [12];
      var cierre = bloques.length
        ? '<div class="np-grid rules">' + bloques.map(function (b, k) { return c.story(anchos[k], b); }).join('') + '</div>'
        : '';

      return c.wrap(
        c.section('portada', portada) +
        c.section('analisis', analisis) +
        (cierre ? c.section('opinion', cierre) : ''));
    }
  });
})();
