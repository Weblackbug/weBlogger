/* ==========================================================================
   weBlogger - maqueta «deportivo»: el diario deportivo.

   Portada: fotonoticia gigante con el titular, el marcador del partido en
   grande y las llamadas a otros deportes. Segunda sección: la crónica, con su
   ficha técnica, el texto en tres columnas, el protagonista y el uno por uno.
   Tercera: clasificación, resultados, próxima jornada y opinión.

   No lleva CSS: solo piezas del kit de diario. El carácter lo pone la ficha.
   ========================================================================== */
(function () {
  'use strict';

  /* Datos de liga inventados: plantillas, técnicos y la tabla de la jornada. */
  var ONCE_LOCAL = ['Arizkun', 'Lasarte', 'Bermeo', 'Olavide', 'Querol', 'Sanchiz', 'Tarrés', 'Ibarrola', 'Mendiluce', 'Corbalán', 'Navascués'];
  var ONCE_VISIT = ['Peñalba', 'Gamazo', 'Lizarraga', 'Otxandio', 'Rebollar', 'Sotelo', 'Villaescusa', 'Marquina', 'Tudela', 'Zurbano', 'Almenar'];
  var NOTAS = [
    ['7', 'Seguro por alto y rápido en las salidas.'],
    ['6', 'Cumplió en su banda sin alardes.'],
    ['7', 'Mandó en la zaga y sacó dos balones bajo palos.'],
    ['5', 'Sufrió a la espalda toda la primera parte.'],
    ['6', 'Fue de menos a más y acabó de extremo.'],
    ['8', 'El ancla del equipo: robó, ordenó y no perdió un pase.'],
    ['6', 'Trabajo oscuro y mucho recorrido.'],
    ['7', 'Suyo fue el último pase en las mejores llegadas.'],
    ['5', 'Desaparecido hasta que lo cambiaron.'],
    ['8', 'Desequilibró cada vez que encaró.'],
    ['9', 'El mejor: peleó solo arriba y fue un incordio constante.']
  ];
  var CLUBES = ['CD Valdearcos', 'Unión Cendra', 'Sporting Miralba', 'Atlético Rocamar', 'CF Sotoverde', 'Rayo Brezal', 'Olímpico Arenales', 'Juventud Peñarrubia', 'Racing Montefrío', 'Deportivo Lagunar'];
  //            J   G  E  P   GF  GC   (36 victorias, 36 derrotas, 24 empates; 124 goles a favor y en contra)
  var TABLA = [[12, 8, 3, 1, 24, 9], [12, 7, 4, 1, 21, 10], [12, 6, 4, 2, 19, 12], [12, 5, 4, 3, 16, 14],
               [12, 4, 3, 5, 14, 16], [12, 3, 3, 6, 12, 18], [12, 2, 2, 8, 10, 21], [12, 1, 1, 10, 8, 24]];
  var OTROS = [[1, 1], [0, 2], [3, 1]];
  var MIN_L = [23, 58, 81, 90, 12, 67, 44], MIN_V = [36, 72, 9, 50, 85, 28, 61];
  var GOL_L = [10, 9, 7, 10, 5, 8, 9], GOL_V = [9, 10, 6, 9, 7, 10, 2];

  var FUTBOL = /penalti|córner|corner|delanter|larguero|fuera de juego|cabece|área|centrocampista|liga/i;
  var OTRO_DEPORTE = /balonmano|waterpolo|hockey|baloncesto|canasta|rugby|ensayo|melé|ciclis|etapa|pelotón|natación|piscina|regata|tenis/i;

  function num(v) { var n = parseInt(v, 10); return n > 0 ? n : 0; }

  /** Reparte los párrafos en dos columnas de largo parecido; si hace falta, parte un párrafo por una frase. */
  function dosColumnas(paras) {
    var list = (paras || []).filter(Boolean).map(String);
    var total = list.join('').length, a = [], b = [], n = 0;
    list.forEach(function (p) {
      if (b.length || n >= total / 2) { b.push(p); return; }
      if (n + p.length <= total / 2 + 40) { a.push(p); n += p.length; return; }
      var frases = p.match(/[^.!?…]+[.!?…]+["»”]?\s*|[^.!?…]+$/g) || [p], izq = '';
      frases.forEach(function (f) {
        if (!b.length && n + izq.length + f.length / 2 < total / 2) izq += f; else b.push(f);
      });
      if (izq.trim()) a.push(izq.trim());
      if (b.length) b = [b.join('').trim()];
      n = total;
    });
    if (!b.length && a.length > 1) b.push(a.pop());
    return [a, b];
  }

  /** Una frase entre comillas del propio texto, para la cita destacada. */
  function citaDelTexto(paras) {
    var m = /[«“]([^«»“”]{30,160})[»”]/.exec((paras || []).join(' '));
    return m ? m[1].replace(/[\s.,;:]+$/, '') : '';
  }

  WB.addLayout({
    id: 'deportivo',
    name: 'Diario deportivo',
    desc: 'Foto gigante con el titular encima, el marcador en grande, la crónica con su ficha técnica y la clasificación.',
    build: function (c) {
      var e = c.esc;

      /* ---------- contenido: sin repetir aunque el banco sea pequeño ---------- */
      var vistos = {};
      function nuevos(tipo, n) {
        return c.take(tipo, n).filter(function (x) {
          var k = x && (x.tit || x.t || x.txt);
          if (!k || vistos[k]) return false;
          vistos[k] = 1;
          return true;
        });
      }
      function rellena(lista, n) {                       // completa con noticias generales si faltan deportes
        if (lista.length < n) lista = lista.concat(nuevos('noticias', n - lista.length));
        return lista;
      }
      // la portada la abre un partido de fútbol: se busca entre los primeros deportes del banco
      var candidatos = nuevos('deportes', 8);
      function esFutbol(x) {
        var k = x && x.marcador, t = x ? [x.tit, x.sum].concat(x.txt || []).join(' ') : '';
        return !!(k && k.local && k.visit && num(k.gl) + num(k.gv) <= 9 &&
          FUTBOL.test(t) && !OTRO_DEPORTE.test(t));
      }
      var lead = candidatos.filter(esFutbol)[0];
      var futbol = !!lead;
      if (!lead) lead = candidatos[0] || c.one('noticias');   // sin fútbol (o sin deportes): portada polideportiva
      vistos[lead.tit || ''] = 1;
      var resto = candidatos.filter(function (x) { return x !== lead; });
      var prot = resto.shift() || rellena(nuevos('deportes', 1), 1)[0] || lead;
      var llamadas = resto.splice(0, 5);
      llamadas = rellena(llamadas.concat(nuevos('deportes', 5 - llamadas.length)), 5);
      var urgente = resto.shift() || nuevos('deportes', 1)[0] || c.one('breves');
      var masDeporte = resto.concat(nuevos('deportes', Math.max(0, 3 - resto.length))).slice(0, 3);
      var firma = c.one('noticias');

      /* ---------- el partido ---------- */
      // sin un partido de fútbol en el banco, el marcador es el de la jornada de liga inventada
      var m = futbol ? lead.marcador : { local: CLUBES[0], visit: CLUBES[1], gl: 2, gv: 1 };
      var local = String(m.local), visit = String(m.visit);
      var gl = num(m.gl), gv = num(m.gv);

      function goles(n, once, quien, mins, lado) {
        var out = [];
        for (var i = 0; i < Math.min(n, 7); i++) out.push({ min: mins[i], n: once[quien[i]], lado: lado });
        return out;
      }
      // los goleadores solo se inventan si el partido es inventado: si viene del banco,
      // su crónica ya cuenta quién marcó y la ficha no debe contradecirla
      var tantosL = futbol ? [] : goles(gl, ONCE_LOCAL, GOL_L, MIN_L, 0);
      var tantosV = futbol ? [] : goles(gv, ONCE_VISIT, GOL_V, MIN_V, 1);
      function porMinuto(a, b) { return a.min - b.min; }
      function lista(t) {
        return t.slice().sort(porMinuto).map(function (g) { return g.n + ' (' + g.min + '’)'; }).join(', ');
      }
      var a = 0, b = 0;
      var relato = tantosL.concat(tantosV).sort(porMinuto).map(function (g) {
        if (g.lado) b++; else a++;
        return a + '-' + b + ' (' + g.min + '’) ' + g.n;
      }).join('. ');

      /* ---------- la jornada: resultados y clasificación coherentes ---------- */
      var usados = {};
      usados[local] = usados[visit] = 1;
      var partidos = [{ l: local, v: visit, gl: gl, gv: gv }];
      llamadas.concat([prot], masDeporte).forEach(function (x) {
        var k = x.marcador;
        if (!esFutbol(x) || partidos.length > 3) return;
        var l = String(k.local), v = String(k.visit);
        if (l === v || usados[l] || usados[v] || num(k.gl) + num(k.gv) > 9) return;
        usados[l] = usados[v] = 1;
        partidos.push({ l: l, v: v, gl: num(k.gl), gv: num(k.gv) });
      });
      var libres = CLUBES.filter(function (n) { return !usados[n]; });
      for (var i = 0; partidos.length < 4; i++) partidos.push({ l: libres.shift(), v: libres.shift(), gl: OTROS[i % 3][0], gv: OTROS[i % 3][1] });

      // el ganador del partido grande sale líder; el perdedor, cuarto
      var gana = gv > gl ? visit : local, pierde = gv > gl ? local : visit;
      var equipos = [gana];
      partidos.slice(1).forEach(function (p) { if (p.gv > p.gl) equipos.push(p.v, p.l); else equipos.push(p.l, p.v); });
      equipos.splice(3, 0, pierde);
      var proximos = [[5, 0], [4, 1], [7, 2], [6, 3]];

      /* ---------- piezas ---------- */
      function tag(t) { return '<span class="np-tag">' + e(t) + '</span>'; }
      function kicker(t) { return '<span class="section-kicker">' + e(t) + '</span>'; }
      function tanteo(x) {
        var k = x.marcador;
        if (!k || !k.local || !k.visit) return e(x.sec || 'Polideportivo');
        // pruebas sin rival (etapas, regatas, récords): el deporte, no un marcador
        var t = [x.tit, x.sum].join(' ');
        if (/pelotón|récord|marca/i.test(k.visit) || /regata|velero/i.test(t)) {
          return /etapa|vuelta|esprint|contrarreloj/i.test(t) ? 'Ciclismo' : /piscina|libres|natación/i.test(t) ? 'Natación' : /regata|velero/i.test(t) ? 'Vela' : 'Polideportivo';
        }
        return e(k.local) + ' ' + num(k.gl) + ' – ' + num(k.gv) + ' ' + e(k.visit);
      }
      function iniciales(n) {
        return String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
      }
      function tabla(cabeza, filas) {
        return '<div class="wb-table-wrap"><table class="wb-table">' +
          (cabeza ? '<thead><tr>' + cabeza.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' : '') +
          '<tbody>' + filas.map(function (f) { return '<tr>' + f.map(function (d) { return '<td>' + d + '</td>'; }).join('') + '</tr>'; }).join('') +
          '</tbody></table></div>';
      }
      function llamada(x, cuerpo, conTexto) {
        if (!x) return '';
        return '<span class="section-kicker">' + tanteo(x) + '</span>' +
          '<h3 class="np-title ' + cuerpo + '">' + e(x.tit || '') + '</h3>' +
          '<p class="np-deck">' + e(x.sum || '') + '</p>' +
          (conTexto ? c.ps(x.txt, 1) : '');
      }
      var raya = '<div class="wb-divider" data-style="line"></div>';

      /* ====================================================== PORTADA ===== */
      var portada =
        c.nameplate('Diario deportivo · Edición de la mañana', 'Año XXXIV · Número 12.108') +
        '<nav class="np-nav">' + ['Fútbol', 'Baloncesto', 'Ciclismo', 'Tenis', 'Motor', 'Atletismo', 'Polideportivo', 'Opinión']
          .map(function (s) { return '<a href="#">' + s + '</a>'; }).join('') + '</nav>' +
        (urgente.tit ? '<div class="np-ticker">' + tag('Última hora') + '<span>' + e(urgente.tit) + '</span></div>' : '') +

        '<div class="np-cover" data-lightbox-src="' + c.IMG + '" data-lightbox-caption=""><img src="' + c.IMG + '" alt="" />' +
          '<div class="np-cover-text">' + tag(futbol ? 'Fútbol · Jornada 12' : 'Polideportivo') +
          '<h2 class="np-title np-xl">' + c.title + '</h2>' +
          '<p>' + e(lead.sum || '') + '</p></div></div>' +

        // el marcador, en grande
        '<div class="np-box" data-wb-slot>' + (futbol ? '' : kicker('Liga · El partido de la jornada')) + '<div class="np-grid">' +
          c.story(5, kicker('Local') + '<h3 class="np-title np-lg">' + e(local) + '</h3>' +
            '<p>' + (tantosL.length ? e(lista(tantosL)) : 'Entrenador: Fermín Echauri') + '</p>') +
          c.story(2, kicker('Final') + '<h3 class="np-title np-xl">' + gl + '–' + gv + '</h3>') +
          c.story(5, kicker('Visitante') + '<h3 class="np-title np-lg">' + e(visit) + '</h3>' +
            '<p>' + (tantosV.length ? e(lista(tantosV)) : 'Entrenador: Ulises Barreda') + '</p>') +
        '</div></div>' +

        // llamadas a otros deportes
        '<div class="np-grid rules">' +
          c.story(5, c.fig(llamadas[0] && llamadas[0].marcador && llamadas[0].marcador.local ? llamadas[0].marcador.local + ', en plena competición' : 'Imagen de la jornada', 'Foto: Archivo') +
            llamada(llamadas[0], 'np-md', true)) +
          c.story(4, llamada(llamadas[1], 'np-md', true) + raya + llamada(llamadas[2], 'np-sm', false)) +
          c.story(3, llamada(llamadas[3], 'np-sm', false) + raya + llamada(llamadas[4], 'np-sm', false) +
            '<p><strong>La crónica, la ficha y el uno por uno, en las páginas 2 a 5</strong></p>') +
        '</div>';

      /* ====================================================== CRÓNICA ===== */
      var txt = (lead.txt || []).slice();
      var cuerpo = txt.map(function (p, i) { return '<p' + (i ? '' : ' class="lead-dropcap"') + '>' + e(p) + '</p>'; }).join('');
      var dicho = citaDelTexto(txt);
      if (dicho) cuerpo += '<p class="wb-pull span-all">«' + e(dicho) + '»</p>';

      var ficha =
        '<div class="np-box" data-wb-slot><h3 class="np-title np-sm">Ficha técnica' + (futbol ? '' : ': ' + e(local) + ' – ' + e(visit)) + '</h3>' +
          '<p><strong>' + e(local) + ', ' + gl + ':</strong> ' + ONCE_LOCAL.join(', ') + '. Entrenador: Fermín Echauri.</p>' +
          '<p><strong>' + e(visit) + ', ' + gv + ':</strong> ' + ONCE_VISIT.join(', ') + '. Entrenador: Ulises Barreda.</p>' +
          (relato ? '<p><strong>Goles:</strong> ' + e(relato) + '.</p>' : '') +
          '<p><strong>Árbitro:</strong> Leandro Ortuño Vidal. Amonestó a Olavide, Sanchiz, Otxandio y Marquina.</p>' +
          '<p><strong>Estadio:</strong> Municipal de La Dársena. 18.420 espectadores. Partido de la duodécima jornada.</p>' +
        '</div>';

      // el protagonista: la foto encajada entre dos columnas, tan grande como dé el texto
      var pp = (prot.txt || []).slice();
      if (pp.length < 2 && prot.sum) pp.unshift(prot.sum);
      var cols = dosColumnas(pp);
      var total = pp.join(' ').split(/\s+/).filter(Boolean).length;
      var iw = total > 230 ? 250 : total > 150 ? 210 : total > 90 ? 170 : 130;
      var ih = total > 230 ? 230 : total > 150 ? 180 : total > 90 ? 140 : 100;
      var pk = prot.marcador;
      var pieProt = pk && pk.local && pk.visit
        ? (tanteo(prot).indexOf('–') > -1 ? tanteo(prot) : e(pk.local) + ', protagonista de la jornada')
        : 'El protagonista de la jornada';
      var entre =
        '<div class="np-between" style="--iw:' + iw + 'px;--ih:' + ih + 'px;--top:8px">' +
          '<div class="np-col" data-wb-slot>' + c.ps(cols[0], cols[0].length) + '</div>' +
          '<div class="np-col" data-wb-slot>' + (cols[1].length ? c.ps(cols[1], cols[1].length) : '<p>' + e(prot.sum || '') + '</p>') + '</div>' +
          '<figure class="np-between-fig" data-lightbox-src="' + c.IMG + '" data-lightbox-caption=""><img src="' + c.IMG + '" alt="" />' +
          '<figcaption><span>' + pieProt + '</span></figcaption></figure>' +
        '</div>';

      // el uno por uno como en la prensa deportiva: nombre, nota y una línea de juicio
      var unoPorUno = '<div class="np-box" data-wb-slot><h3 class="np-title np-sm">Uno por uno: ' + e(local) + '</h3>' +
        ONCE_LOCAL.map(function (n, i) { return '<p><strong>' + n + ', ' + NOTAS[i][0] + '.</strong> ' + NOTAS[i][1] + '</p>'; }).join('') + '</div>';

      var cronica =
        tag('La crónica') +
        '<h2 class="np-title np-lg">' + e(lead.tit || '') + '</h2>' +
        '<div class="wb-byline"><span class="wb-byline-avatar">' + e(iniciales(firma.firma) || 'RD') + '</span><div>' +
          '<strong class="wb-byline-name">' + e(firma.firma || 'Redacción de Deportes') + '</strong>' +
          '<span class="wb-byline-meta">Enviado especial' + (firma.lugar ? ' · ' + e(firma.lugar) : '') + '</span></div></div>' +
        '<div class="np-grid">' +
          c.story(8, c.fig(futbol ? local + ' ' + gl + ' – ' + gv + ' ' + visit + '. ' + (gl === gv ? 'Un lance del partido.' : 'La celebración del ' + (gv > gl ? visit : local) + '.') : 'Un momento de la jornada', 'Foto: Archivo') +
            '<div class="wb-flow" data-wb-slot style="column-count:3">' + cuerpo + '</div>') +
          c.story(4, ficha) +
        '</div>' +
        '<div class="np-grid rules">' +
          c.story(7, tag('El protagonista') +
            '<h3 class="np-title np-md">' + e(prot.tit || '') + '</h3>' +
            '<p class="np-deck">' + e(prot.sum || '') + '</p>' + entre) +
          c.story(5, unoPorUno) +
        '</div>';

      /* ================================================ LA JORNADA ======== */
      var clasif = tabla(['Equipo', 'J', 'G', 'E', 'P', 'Pts'], TABLA.map(function (r, i) {
        return ['<strong>' + (i + 1) + '. ' + e(equipos[i]) + '</strong>', r[0], r[1], r[2], r[3], '<strong>' + (r[1] * 3 + r[2]) + '</strong>'];
      }));
      // los resultados en lista: el marcador no se parte aunque la columna sea estrecha
      var resultados = '<div class="np-briefs">' + partidos.map(function (p) {
        return '<div class="np-brief"><h4>' + e(p.l) + '&nbsp;' + p.gl + '&nbsp;–&nbsp;' + p.gv + ' ' + e(p.v) + '</h4></div>';
      }).join('') + '</div>';
      var HORAS = ['Sábado, 16.15', 'Sábado, 18.30', 'Domingo, 12.00', 'Domingo, 21.00'];
      var proxima = '<div class="np-briefs">' + proximos.map(function (p, i) {
        return '<div class="np-brief"><h4>' + e(equipos[p[0]]) + ' – ' + e(equipos[p[1]]) + '</h4><p>' + HORAS[i] + '</p></div>';
      }).join('') + '</div>';
      // la franja final: tres piezas cortas de otros deportes, a lo ancho
      var mas = masDeporte.length ? '<div class="np-grid rules">' + masDeporte.map(function (x) {
        return c.story(12 / masDeporte.length, '<span class="section-kicker">' + tanteo(x) + '</span>' +
          '<h3 class="np-title np-sm">' + e(x.tit || '') + '</h3><p>' + e(x.sum || '') + '</p>');
      }).join('') + '</div>' : '';
      // las columnas de opinión hablan del partido de la jornada (firmas inventadas de la casa)
      var empate = gl === gv;
      var firmas = [
        { autor: 'Ramiro Etxabe', tit: empate ? 'Un punto que sabe a poco' : 'El ' + gana + ' ya no se esconde',
          frase: empate ? 'Ni ' + local + ' ni ' + visit + ' quisieron perder, y eso se notó en cada balón dividido. La liga no espera a los que se conforman.'
            : 'Ganar así, sufriendo y sin brillo, es lo que hacen los equipos que acaban levantando títulos. El vestuario lo sabe y ya no lo disimula.' },
        { autor: 'Nieves Larrañaga', tit: empate ? 'Dos técnicos con miedo' : 'Lo que le falta al ' + pierde,
          frase: empate ? 'Los cambios llegaron tarde y con el freno echado. Cuando el reloj aprieta, el banquillo también juega, y ayer ninguno quiso arriesgar.'
            : 'Tiene oficio y tiene orden, pero le falta un futbolista que se atreva a romper el partido cuando el rival se encierra.' },
        { autor: 'Tomás Aguirrezabal', tit: 'La grada también juega',
          frase: 'Dieciocho mil almas empujaron cada ataque. Hay estadios que valen un gol por partido y el Municipal de La Dársena es uno de ellos.' }
      ];
      var opinion = firmas.map(function (o) {
        return '<div class="np-opinion"><img class="np-opinion-photo" src="' + c.IMG + '" alt="" /><div>' +
          '<span class="np-opinion-author">' + e(o.autor) + '</span><h3>' + e(o.tit) + '</h3><p>' + e(o.frase) + '</p></div></div>';
      }).join('');

      var jornada =
        tag('Liga · Jornada 12') +
        '<h2 class="np-title np-lg">Así queda la tabla</h2>' +
        '<div class="np-grid rules">' +
          c.story(5, '<h3 class="np-title np-sm">Clasificación</h3>' + clasif) +
          c.story(3, '<h3 class="np-title np-sm">Resultados</h3>' + resultados +
            '<h3 class="np-title np-sm">Próxima jornada</h3>' + proxima) +
          c.story(4, tag('Opinión') + opinion) +
        '</div>' +
        (mas ? tag('Más deporte') + mas : '');

      return c.wrap(c.section('portada', portada) + c.section('cronica', cronica) + c.section('jornada', jornada));
    }
  });
})();
