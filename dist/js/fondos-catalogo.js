/* ==========================================================================
   weBlogger - catalogo de fondos de pagina.

   Mas de cien fondos ordenados por indice (papel y folios, maderas, telas,
   piedra, pizarras, metales, naturaleza, cielo, geometricos, retro,
   degradados, fiesta). Todos se generan aqui mismo con CSS y SVG (ruido
   fractal de feTurbulence para la veta de la madera, el marmol, el papel o
   el corcho): no hay imagenes de nadie, pesan poco y se repiten sin costura.

   WB.BG.list   [{ id, name, cat, tone, css }]
   WB.BG.cats   [{ id, name, icon, items }]  (el indice)
   WB.BG.byId   id -> fondo
   tone: 'light' (material claro), 'dark' (material oscuro) o 'theme'
   (dibujo con los colores de la paleta: se adapta al modo claro u oscuro).
   ========================================================================== */
(function () {
  'use strict';

  /* --------------------------------------------------------- utilidades -- */

  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function hex(c) {
    var m = /^#?([0-9a-f]{6})$/i.exec(c);
    var n = parseInt(m ? m[1] : '808080', 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  /** SVG como url() para background-image. */
  function svg(w, h, body) {
    var s = "<svg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "' viewBox='0 0 " + w + ' ' + h + "'>" + body + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(s).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29') + '")';
  }

  var fid = 0;
  /**
   * Una capa de ruido de color: alfa = k * ruido + c.
   * o = { freq, oct, type, seed, color, k, c, op }
   */
  function noise(o) {
    var id = 'n' + (++fid), col = hex(o.color || '#000000');
    var k = o.k === undefined ? 1 : o.k, c = o.c === undefined ? 0 : o.c;
    return "<filter id='" + id + "' x='0' y='0' width='100%' height='100%'>" +
      "<feTurbulence type='" + (o.type || 'fractalNoise') + "' baseFrequency='" + o.freq + "' numOctaves='" + (o.oct || 3) + "' seed='" + (o.seed || 1) + "' stitchTiles='stitch'/>" +
      "<feColorMatrix type='matrix' values='0 0 0 0 " + col[0].toFixed(3) + ' 0 0 0 0 ' + col[1].toFixed(3) + ' 0 0 0 0 ' + col[2].toFixed(3) + ' ' + k + ' 0 0 0 ' + c + "'/></filter>" +
      "<rect width='100%' height='100%' filter='url(#" + id + ")'" + (o.op ? " opacity='" + o.op + "'" : '') + '/>';
  }

  /** Bandas de curvas de nivel (mapa topografico). */
  function contour(o) {
    var id = 'c' + (++fid), col = hex(o.color);
    var table = [];
    for (var i = 0; i < 18; i++) table.push(i % 2 ? 1 : 0);
    return "<filter id='" + id + "' x='0' y='0' width='100%' height='100%'>" +
      "<feTurbulence type='fractalNoise' baseFrequency='" + o.freq + "' numOctaves='2' seed='" + (o.seed || 3) + "' stitchTiles='stitch'/>" +
      "<feComponentTransfer><feFuncR type='discrete' tableValues='" + table.join(' ') + "'/></feComponentTransfer>" +
      "<feConvolveMatrix order='3' kernelMatrix='0 -1 0 -1 4 -1 0 -1 0' preserveAlpha='true'/>" +
      "<feColorMatrix type='matrix' values='0 0 0 0 " + col[0].toFixed(3) + ' 0 0 0 0 ' + col[1].toFixed(3) + ' 0 0 0 0 ' + col[2].toFixed(3) + " 3 0 0 0 0'/></filter>" +
      "<rect width='100%' height='100%' filter='url(#" + id + ")' opacity='" + (o.op || 0.5) + "'/>";
  }

  function rect(color) { return "<rect width='100%' height='100%' fill='" + color + "'/>"; }

  var LIST = [], CATS = [];
  function cat(id, name, icon) { var c = { id: id, name: name, icon: icon, items: [] }; CATS.push(c); return c; }
  function add(c, id, name, tone, css) {
    var b = { id: id, name: name, cat: c.id, tone: tone, css: css };
    c.items.push(b); LIST.push(b);
    return b;
  }
  function tile(bgColor, url, size) {
    return 'background-color:' + bgColor + ';background-image:' + url + ';background-size:' + (size || 'auto') + ';';
  }

  /* ======================================================== papel ======= */

  var P = cat('papel', 'Papel y folios', '📄');
  var grain = function (base, dark, amount, seed) {
    return svg(300, 300, rect(base) + noise({ freq: 0.85, oct: 3, seed: seed || 2, color: dark, k: amount, c: -amount * 0.42 }));
  };
  add(P, 'folio-blanco', 'Folio blanco', 'light', tile('#fbfaf7', grain('#fbfaf7', '#6b6150', 0.35)));
  add(P, 'folio-marfil', 'Folio marfil', 'light', tile('#f6efdf', grain('#f6efdf', '#7a6340', 0.45, 5)));
  add(P, 'folio-cuadriculado', 'Folio cuadriculado 5 mm', 'light', 'background-color:#fbfbf8;background-image:linear-gradient(#b9cde0 1px,transparent 1px),linear-gradient(90deg,#b9cde0 1px,transparent 1px);background-size:19px 19px;');
  add(P, 'milimetrado', 'Papel milimetrado', 'light', 'background-color:#fbfdf8;background-image:linear-gradient(rgba(64,140,90,.55) 1px,transparent 1px),linear-gradient(90deg,rgba(64,140,90,.55) 1px,transparent 1px),linear-gradient(rgba(64,140,90,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(64,140,90,.22) 1px,transparent 1px);background-size:95px 95px,95px 95px,9.5px 9.5px,9.5px 9.5px;');
  add(P, 'folio-pautado', 'Folio pautado', 'light', 'background-color:#fdfcf8;background-image:repeating-linear-gradient(transparent 0 29px,#a9c3dc 29px 30px);');
  add(P, 'cuaderno-margen', 'Cuaderno con margen', 'light', 'background-color:#fdfcf8;background-image:linear-gradient(90deg,transparent 72px,#e58a86 72px,#e58a86 74px,transparent 74px),repeating-linear-gradient(transparent 0 31px,#a9c3dc 31px 32px);');
  add(P, 'cuaderno-espiral', 'Cuaderno de espiral', 'light', 'background-color:#fdfcf8;background-image:radial-gradient(circle at 22px 50%,#5d5a55 5px,#d9d5cc 6px,transparent 7px),linear-gradient(90deg,transparent 64px,#e58a86 64px,#e58a86 66px,transparent 66px),repeating-linear-gradient(transparent 0 31px,#a9c3dc 31px 32px);background-size:100% 32px,auto,auto;background-repeat:repeat-y,no-repeat,repeat;');
  add(P, 'kraft', 'Papel kraft', 'light', tile('#c9a576', svg(300, 300, rect('#c9a576') + noise({ freq: 0.9, oct: 3, seed: 7, color: '#5b3d1b', k: 0.9, c: -0.38 }) + noise({ freq: '0.02 0.6', oct: 2, seed: 9, color: '#efd2a6', k: 0.8, c: -0.42 }))));
  add(P, 'pergamino', 'Pergamino', 'light', 'background-color:#efe0bd;background-image:radial-gradient(ellipse at center,transparent 45%,rgba(120,80,30,.28) 100%),' + svg(400, 400, rect('#efe0bd') + noise({ freq: 0.012, oct: 4, seed: 4, color: '#a07438', k: 0.9, c: -0.32 }) + noise({ freq: 0.8, oct: 2, seed: 2, color: '#6e5428', k: 0.5, c: -0.2 })) + ';background-size:100% 100%,auto;background-attachment:local;');
  add(P, 'periodico', 'Papel de periódico', 'light', tile('#e7e3d8', grain('#e7e3d8', '#4a4740', 0.7, 11)));
  add(P, 'reciclado', 'Papel reciclado', 'light', tile('#e2ddd0', svg(300, 300, rect('#e2ddd0') + noise({ freq: 0.75, oct: 2, seed: 13, color: '#5a5446', k: 6, c: -3.55 }) + noise({ freq: 0.9, oct: 3, seed: 3, color: '#6a6252', k: 0.4, c: -0.16 }))));
  add(P, 'washi', 'Papel de arroz', 'light', tile('#f3efe6', svg(400, 400, rect('#f3efe6') + noise({ type: 'turbulence', freq: '0.012 0.09', oct: 3, seed: 21, color: '#ffffff', k: -3, c: 1.1 }) + noise({ type: 'turbulence', freq: '0.09 0.012', oct: 2, seed: 8, color: '#c9bea6', k: -4, c: 0.55 }))));
  add(P, 'acuarela', 'Papel de acuarela', 'light', tile('#f8f6f1', svg(300, 300, rect('#f8f6f1') + noise({ freq: 0.06, oct: 4, seed: 6, color: '#8b8370', k: 1.2, c: -0.55 }))));
  add(P, 'calco', 'Papel de calco', 'light', tile('#e8eef2', grain('#e8eef2', '#7d93a6', 0.4, 17)));
  add(P, 'cartulina-negra', 'Cartulina negra', 'dark', tile('#1c1b1a', grain('#1c1b1a', '#9a958c', 0.45, 19)));
  add(P, 'carta-antigua', 'Carta antigua', 'light', 'background-color:#efe3c8;background-image:radial-gradient(ellipse at 30% 20%,rgba(150,95,40,.18),transparent 40%),radial-gradient(ellipse at 80% 85%,rgba(150,95,40,.22),transparent 45%),' + grain('#efe3c8', '#7a5a2e', 0.6, 23) + ';');

  /* ======================================================= madera ======= */

  var W = cat('madera', 'Maderas', '🪵');
  /** veta: dos ruidos estirados en horizontal + poros finos; tarima con juntas. */
  function wood(light, dark, seed, planks) {
    var body = rect(light) +
      noise({ freq: '0.0045 0.11', oct: 4, seed: seed, color: dark, k: 2.6, c: -1.05 }) +
      noise({ freq: '0.02 0.75', oct: 2, seed: seed + 5, color: dark, k: 1.3, c: -0.58 }) +
      noise({ freq: '0.003 0.04', oct: 2, seed: seed + 9, color: '#ffffff', k: 0.6, c: -0.25 });
    if (planks) {
      var r = rng(seed * 31), y;
      for (y = 0; y < 512; y += 128) {
        body += "<rect y='" + y + "' width='512' height='2' fill='" + dark + "' opacity='.55'/>";
        var x = Math.round(r() * 380) + 60;
        body += "<rect x='" + x + "' y='" + y + "' width='2' height='128' fill='" + dark + "' opacity='.45'/>";
      }
    }
    return svg(512, 512, body);
  }
  [
    ['roble', 'Roble', '#c9a26a', '#7d5428', 3, 0], ['roble-tarima', 'Tarima de roble', '#c49a62', '#77502a', 4, 1],
    ['nogal', 'Nogal', '#7a5233', '#2e1b0e', 5, 0], ['nogal-tarima', 'Tarima de nogal', '#6f4a2e', '#2a180c', 6, 1],
    ['pino', 'Pino', '#e6c48f', '#ab7a3e', 7, 0], ['pino-tablas', 'Tablas de pino', '#e2bd85', '#a1723a', 8, 1],
    ['cerezo', 'Cerezo', '#a65d3d', '#5c2614', 9, 0], ['haya', 'Haya', '#e3b88c', '#a87348', 10, 0],
    ['teca', 'Teca', '#a26f43', '#58351a', 11, 1], ['arce', 'Arce blanco', '#f0e2c6', '#c4a271', 12, 0],
    ['ebano', 'Ébano', '#3b2d25', '#0e0907', 13, 0], ['wengue', 'Wengué', '#4b3527', '#160d08', 14, 1],
    ['blanqueada', 'Madera blanqueada', '#e9e4da', '#a69c8a', 15, 1], ['envejecida', 'Madera envejecida', '#9b958b', '#4f4b45', 16, 1],
    ['caoba', 'Caoba', '#7d3829', '#3a120a', 17, 0], ['olivo', 'Olivo', '#d3bf8e', '#6c5a2e', 18, 0]
  ].forEach(function (w) {
    var lum = hex(w[2]);
    add(W, 'madera-' + w[0], w[1], (lum[0] + lum[1] + lum[2]) / 3 < 0.45 ? 'dark' : 'light', tile(w[2], wood(w[2], w[3], w[4], w[5])));
  });

  /* ======================================================== telas ======= */

  var T = cat('telas', 'Telas y tejidos', '🧵');
  add(T, 'lino-natural', 'Lino natural', 'light', 'background-color:#e8e0d0;background-image:repeating-linear-gradient(0deg,rgba(90,75,50,.12) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(90,75,50,.1) 0 1px,transparent 1px 5px),' + grain('#e8e0d0', '#5c4d33', 0.35, 29) + ';');
  add(T, 'tejano', 'Tejano', 'dark', 'background-color:#2f4a6d;background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.09) 0 2px,transparent 2px 5px),repeating-linear-gradient(-45deg,rgba(0,0,0,.18) 0 1px,transparent 1px 6px),' + svg(300, 300, rect('#2f4a6d') + noise({ freq: 0.8, oct: 2, seed: 31, color: '#c8d6e8', k: 0.6, c: -0.25 })) + ';');
  add(T, 'tweed', 'Tweed', 'dark', tile('#5a5047', svg(300, 300, rect('#5a5047') + noise({ freq: 0.6, oct: 2, seed: 33, color: '#c9a77a', k: 2, c: -0.95 }) + noise({ freq: 0.7, oct: 2, seed: 34, color: '#1d1a17', k: 2, c: -0.9 }) + noise({ freq: 0.65, oct: 2, seed: 35, color: '#8a3b2c', k: 3, c: -1.75 }))));
  add(T, 'lona', 'Lona', 'light', 'background-color:#d9cfb9;background-image:repeating-linear-gradient(0deg,rgba(80,65,40,.16) 0 2px,transparent 2px 4px),repeating-linear-gradient(90deg,rgba(80,65,40,.14) 0 2px,transparent 2px 4px);');
  add(T, 'fieltro-gris', 'Fieltro gris', 'dark', tile('#6c6e70', svg(300, 300, rect('#6c6e70') + noise({ freq: 0.5, oct: 4, seed: 37, color: '#2b2c2e', k: 1.2, c: -0.5 }) + noise({ freq: 0.9, oct: 2, seed: 38, color: '#b9bcc0', k: 0.8, c: -0.36 }))));
  add(T, 'seda', 'Seda', 'light', 'background-color:#efe6ea;background-image:linear-gradient(115deg,rgba(255,255,255,0) 20%,rgba(255,255,255,.75) 35%,rgba(255,255,255,0) 50%,rgba(170,140,155,.18) 70%,rgba(255,255,255,0) 85%);background-size:900px 900px;');
  add(T, 'terciopelo', 'Terciopelo', 'dark', 'background-color:#4c1a2a;background-image:radial-gradient(ellipse at 30% 20%,rgba(255,170,190,.22),transparent 55%),radial-gradient(ellipse at 75% 80%,rgba(0,0,0,.45),transparent 60%),' + svg(300, 300, rect('#4c1a2a') + noise({ freq: 0.9, oct: 2, seed: 41, color: '#000000', k: 0.6, c: -0.2 })) + ';background-size:100% 100%,100% 100%,auto;');
  add(T, 'vichy', 'Vichy', 'light', 'background-color:#fbfbfb;background-image:linear-gradient(90deg,rgba(200,50,60,.45) 50%,transparent 50%),linear-gradient(rgba(200,50,60,.45) 50%,transparent 50%);background-size:28px 28px;');
  add(T, 'tartan', 'Tartán', 'dark', 'background-color:#1f3d2e;background-image:repeating-linear-gradient(90deg,transparent 0 22px,rgba(180,30,40,.55) 22px 28px,transparent 28px 40px,rgba(240,200,80,.5) 40px 42px,transparent 42px 64px),repeating-linear-gradient(0deg,transparent 0 22px,rgba(180,30,40,.55) 22px 28px,transparent 28px 40px,rgba(240,200,80,.5) 40px 42px,transparent 42px 64px),repeating-linear-gradient(45deg,rgba(0,0,0,.2) 0 1px,transparent 1px 3px);');
  add(T, 'punto', 'Punto de lana', 'light', tile('#e9ddd0', svg(24, 24, rect('#e9ddd0') + "<path d='M0 0 L6 12 L12 0 M12 0 L18 12 L24 0 M0 12 L6 24 L12 12 M12 12 L18 24 L24 12' fill='none' stroke='#b49b80' stroke-width='3' stroke-linecap='round' opacity='.7'/>")));

  /* =================================================== piedra ========== */

  var S = cat('piedra', 'Piedra y mármol', '🪨');
  function marble(base, vein, seed, cloud) {
    var r = rng(seed), lines = '', id = 'm' + (++fid);
    for (var i = 0; i < 9; i++) {
      var x0 = -300 + r() * 1200, w = (0.6 + r() * 2.6).toFixed(1), op = (0.35 + r() * 0.55).toFixed(2);
      lines += "<path d='M" + x0.toFixed(0) + " -100 C " + (x0 + 200 + r() * 200).toFixed(0) + " 250, " + (x0 + 100 + r() * 300).toFixed(0) + " 550, " + (x0 + 450).toFixed(0) + " 1000' stroke='" + vein + "' stroke-width='" + w + "' fill='none' opacity='" + op + "'/>";
    }
    return svg(800, 800, rect(base) +
      noise({ freq: 0.003, oct: 4, seed: seed + 1, color: cloud || vein, k: 0.9, c: -0.3 }) +
      "<filter id='" + id + "' x='-20%' y='-20%' width='140%' height='140%'><feTurbulence type='fractalNoise' baseFrequency='0.006' numOctaves='5' seed='" + seed + "' result='t'/><feDisplacementMap in='SourceGraphic' in2='t' scale='160' xChannelSelector='R' yChannelSelector='G'/><feGaussianBlur stdDeviation='0.6'/></filter>" +
      "<g filter='url(#" + id + ")'>" + lines + "</g>");
  }
  add(S, 'marmol-blanco', 'Mármol blanco', 'light', tile('#f2f1ee', marble('#f2f1ee', '#8e8c88', 51, '#cfccc5')));
  add(S, 'marmol-negro', 'Mármol negro', 'dark', tile('#1b1b1d', marble('#1b1b1d', '#e8e6e0', 52, '#3a3a3e')));
  add(S, 'marmol-verde', 'Mármol verde', 'dark', tile('#24453a', marble('#24453a', '#d4e3d6', 53, '#0f2a21')));
  add(S, 'marmol-rosa', 'Mármol rosa', 'light', tile('#ecd3cb', marble('#ecd3cb', '#a7746a', 54, '#d9b2a8')));
  add(S, 'travertino', 'Travertino', 'light', tile('#e2d3b6', svg(500, 500, rect('#e2d3b6') + noise({ freq: '0.003 0.05', oct: 4, seed: 55, color: '#a88b5a', k: 1.4, c: -0.55 }) + noise({ freq: 0.5, oct: 2, seed: 56, color: '#8a6d3e', k: 5, c: -2.9 }))));
  function granite(base, a, b, seed) {
    return svg(300, 300, rect(base) + noise({ freq: 0.9, oct: 2, seed: seed, color: a, k: 7, c: -3.9 }) + noise({ freq: 0.8, oct: 2, seed: seed + 1, color: b, k: 7, c: -3.9 }) + noise({ freq: 0.6, oct: 3, seed: seed + 2, color: '#000000', k: 0.5, c: -0.2 }));
  }
  add(S, 'granito-gris', 'Granito gris', 'light', tile('#a9a8a5', granite('#a9a8a5', '#222222', '#f2f2f2', 57)));
  add(S, 'granito-rosa', 'Granito rosa', 'light', tile('#b99288', granite('#b99288', '#2a1d1a', '#f3e2dc', 60)));
  add(S, 'hormigon', 'Hormigón', 'light', tile('#bdbab4', svg(400, 400, rect('#bdbab4') + noise({ freq: 0.012, oct: 4, seed: 63, color: '#6f6c66', k: 0.9, c: -0.32 }) + noise({ freq: 0.9, oct: 3, seed: 64, color: '#4d4a45', k: 0.7, c: -0.28 }) + noise({ freq: 0.35, oct: 1, seed: 65, color: '#3f3d39', k: 9, c: -5.6 }))));
  add(S, 'terrazo', 'Terrazo', 'light', (function () {
    var r = rng(66), body = rect('#ece7df'), cols = ['#c7563f', '#2f5d62', '#e2a33c', '#7a7a7a', '#d9c3a5'];
    for (var i = 0; i < 70; i++) {
      var x = r() * 400, y = r() * 400, s = 3 + r() * 9;
      body += "<polygon points='" + [0, 1, 2, 3].map(function (k) { var a = k * 1.57 + r(); return (x + Math.cos(a) * s).toFixed(1) + ',' + (y + Math.sin(a) * s * (0.6 + r() * 0.6)).toFixed(1); }).join(' ') + "' fill='" + cols[i % cols.length] + "'/>";
    }
    return tile('#ece7df', svg(400, 400, body));
  })());
  add(S, 'pizarra-piedra', 'Pizarra natural', 'dark', tile('#3c4247', svg(500, 500, rect('#3c4247') + noise({ freq: '0.002 0.03', oct: 4, seed: 67, color: '#1b1e21', k: 1.6, c: -0.6 }) + noise({ freq: '0.004 0.08', oct: 2, seed: 68, color: '#7d8892', k: 1, c: -0.45 }))));
  add(S, 'arenisca', 'Arenisca', 'light', tile('#d8b98c', svg(500, 500, rect('#d8b98c') + noise({ freq: '0.002 0.025', oct: 4, seed: 69, color: '#a56f3b', k: 1.4, c: -0.5 }) + noise({ freq: 0.9, oct: 2, seed: 70, color: '#6d4a26', k: 0.6, c: -0.25 }))));

  /* ========================================== pizarras y corcho ======= */

  var B = cat('pizarra', 'Pizarras y corcho', '🧑‍🏫');
  var chalk = function (base, seed) {
    return svg(500, 500, rect(base) + noise({ freq: 0.008, oct: 4, seed: seed, color: '#ffffff', k: 0.45, c: -0.15 }) + noise({ freq: 0.9, oct: 2, seed: seed + 1, color: '#ffffff', k: 0.3, c: -0.12 }));
  };
  add(B, 'pizarra-verde', 'Pizarra verde', 'dark', tile('#2f4a3c', chalk('#2f4a3c', 71)));
  add(B, 'pizarra-negra', 'Pizarra negra', 'dark', tile('#232526', chalk('#232526', 73)));
  add(B, 'pizarra-azul', 'Pizarra azul', 'dark', tile('#203448', chalk('#203448', 75)));
  var cork = function (base, dark, light, seed) {
    return svg(300, 300, rect(base) + noise({ freq: 0.28, oct: 2, seed: seed, color: dark, k: 4.5, c: -2.1 }) + noise({ freq: 0.32, oct: 2, seed: seed + 1, color: light, k: 4.5, c: -2.3 }) + noise({ freq: 0.9, oct: 2, seed: seed + 2, color: dark, k: 0.6, c: -0.25 }));
  };
  add(B, 'corcho', 'Corcho', 'light', tile('#b98a57', cork('#b98a57', '#5d3a17', '#e2bb88', 77)));
  add(B, 'corcho-oscuro', 'Corcho tostado', 'dark', tile('#7b5232', cork('#7b5232', '#2e1a0b', '#b98657', 80)));
  add(B, 'tablon-anuncios', 'Tablón de anuncios', 'light', 'background-color:#b98a57;background-image:radial-gradient(circle at 30% 30%,#e8463a 5px,#9e2a20 6px,transparent 7px),radial-gradient(circle at 70% 60%,#2f7dd1 5px,#1d5394 6px,transparent 7px),' + cork('#b98a57', '#5d3a17', '#e2bb88', 83) + ';background-size:420px 380px,520px 470px,auto;');

  /* ===================================================== metales ======= */

  var M = cat('metal', 'Metales', '⚙️');
  var brushed = function (base, light, dark, seed) {
    return svg(500, 500, rect(base) + noise({ freq: '0.001 0.9', oct: 2, seed: seed, color: light, k: 1.4, c: -0.55 }) + noise({ freq: '0.0015 0.7', oct: 2, seed: seed + 1, color: dark, k: 1.4, c: -0.6 }));
  };
  add(M, 'acero', 'Acero cepillado', 'light', 'background-color:#b4b8bd;background-image:linear-gradient(100deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.35) 45%,rgba(255,255,255,0) 60%),' + brushed('#b4b8bd', '#ffffff', '#4c5258', 91) + ';background-size:100% 100%,auto;');
  add(M, 'aluminio', 'Aluminio', 'light', tile('#d3d6d9', brushed('#d3d6d9', '#ffffff', '#7d838a', 93)));
  add(M, 'cobre', 'Cobre', 'dark', tile('#a8603a', brushed('#a8603a', '#f2b48c', '#4f2510', 95)));
  add(M, 'laton', 'Latón', 'light', tile('#c6a14f', brushed('#c6a14f', '#fbe7a9', '#6b501a', 97)));
  add(M, 'oxido', 'Hierro oxidado', 'dark', tile('#7a3f22', svg(400, 400, rect('#5a3a2c') + noise({ freq: 0.015, oct: 4, seed: 99, color: '#b35a26', k: 2.2, c: -0.75 }) + noise({ freq: 0.3, oct: 3, seed: 100, color: '#e08a3c', k: 3, c: -1.75 }) + noise({ freq: 0.6, oct: 2, seed: 101, color: '#1e120c', k: 2, c: -1 }))));
  add(M, 'chapa', 'Chapa estriada', 'light', tile('#a7abb0', svg(40, 40, rect('#a7abb0') + "<g fill='#d9dce0' stroke='#6c7177' stroke-width='1'><rect x='5' y='4' width='5' height='14' rx='2.5' transform='rotate(45 7.5 11)'/><rect x='25' y='24' width='5' height='14' rx='2.5' transform='rotate(-45 27.5 31)'/></g>")));

  /* ================================================== naturaleza ======= */

  var N = cat('naturaleza', 'Naturaleza', '🌿');
  add(N, 'arena', 'Arena de playa', 'light', tile('#e6d2a6', svg(500, 500, rect('#e6d2a6') + noise({ freq: '0.003 0.04', oct: 3, seed: 111, color: '#b8975e', k: 1.1, c: -0.45 }) + noise({ freq: 0.95, oct: 2, seed: 112, color: '#6f5630', k: 1, c: -0.42 }))));
  add(N, 'dunas', 'Dunas', 'light', tile('#e8b980', svg(600, 600, rect('#e8b980') + noise({ type: 'turbulence', freq: '0.002 0.02', oct: 3, seed: 113, color: '#a5652e', k: -2.5, c: 0.8 }))));
  add(N, 'agua', 'Agua', 'dark', tile('#1f5f85', svg(500, 500, rect('#1f5f85') + noise({ type: 'turbulence', freq: '0.008 0.03', oct: 3, seed: 115, color: '#bfe6f5', k: -4, c: 0.7 }) + noise({ freq: 0.01, oct: 3, seed: 116, color: '#0b2c44', k: 1, c: -0.35 }))));
  add(N, 'cesped', 'Césped', 'dark', tile('#3e7a32', svg(300, 300, rect('#3e7a32') + noise({ freq: '0.06 0.4', oct: 3, seed: 117, color: '#1c4416', k: 2.2, c: -0.95 }) + noise({ freq: '0.05 0.5', oct: 2, seed: 118, color: '#8fcf5b', k: 2, c: -1 }))));
  add(N, 'musgo', 'Musgo', 'dark', tile('#4d5d2c', svg(300, 300, rect('#4d5d2c') + noise({ freq: 0.2, oct: 4, seed: 119, color: '#9aae4b', k: 2.4, c: -1.1 }) + noise({ freq: 0.08, oct: 3, seed: 120, color: '#223014', k: 1.6, c: -0.7 }))));
  add(N, 'hojas', 'Hojas', 'light', (function () {
    var r = rng(121), body = rect('#eef3e4'), cols = ['#7fa35a', '#a7c27a', '#5f8a43', '#c4d69b'];
    for (var i = 0; i < 26; i++) {
      var x = r() * 360, y = r() * 360, a = r() * 360, s = 0.7 + r() * 0.8;
      body += "<g transform='translate(" + x.toFixed(0) + ' ' + y.toFixed(0) + ') rotate(' + a.toFixed(0) + ') scale(' + s.toFixed(2) + ")'><path d='M0 -18 C12 -10 12 10 0 18 C-12 10 -12 -10 0 -18Z' fill='" + cols[i % 4] + "' opacity='.75'/><path d='M0 -16 V16' stroke='#ffffff' stroke-width='1' opacity='.5'/></g>";
    }
    return tile('#eef3e4', svg(360, 360, body));
  })());
  add(N, 'flores', 'Prado en flor', 'light', (function () {
    var r = rng(123), body = rect('#f4f1e6'), cols = ['#e57a8c', '#f2c14e', '#9b7fd1', '#ffffff', '#ef8a5b'];
    for (var i = 0; i < 22; i++) {
      var x = (r() * 300).toFixed(0), y = (r() * 300).toFixed(0), c = cols[i % 5];
      body += "<g transform='translate(" + x + ' ' + y + ")'>" + [0, 72, 144, 216, 288].map(function (a) { return "<ellipse cy='-4' rx='2.6' ry='4.4' fill='" + c + "' transform='rotate(" + a + ")'/>"; }).join('') + "<circle r='2' fill='#c48a1a'/></g>";
    }
    return tile('#f4f1e6', svg(300, 300, body));
  })());
  add(N, 'niebla', 'Niebla', 'light', 'background-color:#d9dee2;background-image:' + svg(800, 800, rect('#d9dee2') + noise({ freq: 0.003, oct: 4, seed: 125, color: '#ffffff', k: 1.8, c: -0.6 }) + noise({ freq: 0.006, oct: 3, seed: 126, color: '#8e9aa3', k: 1.2, c: -0.5 })) + ';');
  add(N, 'bambu', 'Bambú', 'light', 'background-color:#dfe7c4;background-image:linear-gradient(90deg,rgba(95,130,50,.0) 0,rgba(95,130,50,.35) 2px,rgba(255,255,255,.4) 6px,rgba(95,130,50,.2) 30px,rgba(95,130,50,.45) 34px),linear-gradient(transparent 0 118px,rgba(70,100,35,.55) 118px 122px,transparent 122px);background-size:36px 100%,36px 240px;');
  add(N, 'mapa-topografico', 'Mapa topográfico', 'light', tile('#f0ebdc', svg(600, 600, rect('#f0ebdc') + contour({ freq: 0.004, seed: 127, color: '#8a6a3c', op: 0.55 }))));
  add(N, 'piedras-rio', 'Cantos rodados', 'light', (function () {
    var r = rng(129), body = rect('#cfc8bc');
    for (var i = 0; i < 46; i++) {
      var g = Math.round(150 + r() * 80);
      var cx = (r() * 320).toFixed(0), cy = (r() * 320).toFixed(0);
      body += "<ellipse cx='" + cx + "' cy='" + cy + "' rx='" + (10 + r() * 18).toFixed(0) + "' ry='" + (7 + r() * 12).toFixed(0) + "' transform='rotate(" + (r() * 180).toFixed(0) + " " + cx + " " + cy + ")' fill='rgb(" + g + ',' + (g - 6) + ',' + (g - 14) + ")' stroke='rgba(60,50,40,.25)'/>";
    }
    return tile('#cfc8bc', svg(320, 320, body));
  })());

  /* =============================================== cielo y noche ======= */

  var C = cat('cielo', 'Cielo y noche', '🌙');
  add(C, 'cielo-nubes', 'Cielo con nubes', 'light', 'background-color:#8ec3ea;background-image:' + svg(900, 900, "<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#5ea6dc'/><stop offset='1' stop-color='#cfe7f7'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/>" + noise({ freq: 0.004, oct: 5, seed: 131, color: '#ffffff', k: 2.6, c: -1.25 })) + ';background-size:cover;');
  add(C, 'atardecer-nubes', 'Atardecer', 'light', 'background-color:#f2a26b;background-image:' + svg(900, 900, "<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#3d4f8a'/><stop offset='.55' stop-color='#e8806a'/><stop offset='1' stop-color='#f8d189'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/>" + noise({ freq: '0.002 0.012', oct: 4, seed: 133, color: '#ffd9c2', k: 2.2, c: -1.15 })) + ';background-size:cover;');
  function stars(seed, n, base, top) {
    var r = rng(seed), body = "<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='" + top + "'/><stop offset='1' stop-color='" + base + "'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/>";
    for (var i = 0; i < n; i++) body += "<circle cx='" + (r() * 500).toFixed(1) + "' cy='" + (r() * 500).toFixed(1) + "' r='" + (r() < 0.9 ? 0.6 + r() * 0.6 : 1.4 + r()).toFixed(2) + "' fill='#ffffff' opacity='" + (0.4 + r() * 0.6).toFixed(2) + "'/>";
    return svg(500, 500, body);
  }
  add(C, 'noche-estrellada', 'Noche estrellada', 'dark', tile('#0d1430', stars(135, 160, '#141d44', '#070b1d')));
  add(C, 'via-lactea', 'Vía láctea', 'dark', 'background-color:#0b0f24;background-image:' + svg(900, 900, rect('#0b0f24') + noise({ freq: '0.01 0.003', oct: 5, seed: 137, color: '#9fa8ff', k: 1.6, c: -0.75 }) + noise({ freq: 0.9, oct: 1, seed: 138, color: '#ffffff', k: 9, c: -6.2 })) + ';');
  add(C, 'aurora-boreal', 'Aurora boreal', 'dark', 'background-color:#071a24;background-image:radial-gradient(70% 40% at 30% 25%,rgba(60,230,170,.45),transparent 70%),radial-gradient(60% 35% at 70% 20%,rgba(140,90,255,.35),transparent 70%),' + stars(139, 90, '#06141c', '#04222a') + ';background-size:100% 100%,100% 100%,auto;');
  add(C, 'luna', 'Luna llena', 'dark', 'background-color:#101a2c;background-image:radial-gradient(circle at 80% 18%,#f6f0d8 0 60px,rgba(246,240,216,.25) 62px,transparent 160px),' + stars(141, 70, '#16233b', '#0a1120') + ';background-size:100% 100%,auto;background-repeat:no-repeat,repeat;');

  /* ================================================ geometricos ======= */
  /* dibujados con la paleta: se ven bien en claro y en oscuro */

  var G = cat('geometricos', 'Geométricos', '🔷');
  var A = 'color-mix(in srgb,var(--accent) 22%,transparent)', A2 = 'color-mix(in srgb,var(--accent) 12%,transparent)', TX = 'color-mix(in srgb,var(--text-primary) 8%,transparent)';
  add(G, 'geo-puntos', 'Puntos', 'theme', 'background-image:radial-gradient(' + A + ' 1.6px,transparent 2px);background-size:22px 22px;');
  add(G, 'geo-lunares', 'Lunares', 'theme', 'background-image:radial-gradient(' + A + ' 6px,transparent 6.5px),radial-gradient(' + A + ' 6px,transparent 6.5px);background-size:44px 44px;background-position:0 0,22px 22px;');
  add(G, 'geo-cuadricula', 'Cuadrícula', 'theme', 'background-image:linear-gradient(' + A2 + ' 1px,transparent 1px),linear-gradient(90deg,' + A2 + ' 1px,transparent 1px);background-size:28px 28px;');
  add(G, 'geo-rayas', 'Rayas diagonales', 'theme', 'background-image:repeating-linear-gradient(-45deg,' + A2 + ' 0 2px,transparent 2px 16px);');
  add(G, 'geo-marinero', 'Rayas marineras', 'theme', 'background-image:repeating-linear-gradient(0deg,' + A2 + ' 0 14px,transparent 14px 28px);');
  add(G, 'geo-zigzag', 'Zigzag', 'theme', 'background-image:linear-gradient(135deg,' + A + ' 25%,transparent 25%),linear-gradient(225deg,' + A + ' 25%,transparent 25%);background-size:32px 32px;background-position:0 0,0 0;');
  add(G, 'geo-rombos', 'Rombos', 'theme', 'background-image:linear-gradient(45deg,' + A2 + ' 25%,transparent 25%,transparent 75%,' + A2 + ' 75%),linear-gradient(-45deg,' + A2 + ' 25%,transparent 25%,transparent 75%,' + A2 + ' 75%);background-size:40px 40px;');
  add(G, 'geo-ajedrez', 'Tablero', 'theme', 'background-image:conic-gradient(' + A2 + ' 25%,transparent 0 50%,' + A2 + ' 0 75%,transparent 0);background-size:48px 48px;');
  add(G, 'geo-triangulos', 'Triángulos', 'theme', 'background-image:linear-gradient(60deg,' + A2 + ' 25%,transparent 25.5%,transparent 75%,' + A2 + ' 75%),linear-gradient(120deg,' + A2 + ' 25%,transparent 25.5%,transparent 75%,' + A2 + ' 75%);background-size:40px 70px;');
  add(G, 'geo-escamas', 'Escamas', 'theme', 'background-image:radial-gradient(circle at 50% 100%,transparent 13px,' + A + ' 14px,transparent 15px),radial-gradient(circle at 50% 100%,transparent 13px,' + A + ' 14px,transparent 15px);background-size:32px 16px;background-position:0 0,16px 8px;');
  add(G, 'geo-olas', 'Olas', 'theme', 'background-image:radial-gradient(circle at 50% 0,transparent 15px,' + A + ' 16px,transparent 18px),radial-gradient(circle at 50% 100%,transparent 15px,' + A + ' 16px,transparent 18px);background-size:40px 20px;background-position:0 0,20px 10px;');
  add(G, 'geo-circulos', 'Círculos concéntricos', 'theme', 'background-image:repeating-radial-gradient(circle at 0 0,transparent 0 18px,' + A2 + ' 18px 20px);background-size:120px 120px;');
  add(G, 'geo-cruces', 'Cruces', 'theme', 'background-image:linear-gradient(' + A + ' 2px,transparent 2px),linear-gradient(90deg,' + A + ' 2px,transparent 2px);background-size:30px 30px;background-position:14px 7px,7px 14px;');
  add(G, 'geo-hexagonos', 'Hexágonos', 'theme', 'background-image:' + svg(56, 98, "<path d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='#888' stroke-width='1.2' opacity='.45'/>") + ';background-size:56px 98px;');
  add(G, 'geo-ladrillo', 'Ladrillo visto', 'theme', 'background-image:linear-gradient(' + TX + ' 2px,transparent 2px),linear-gradient(90deg,' + TX + ' 2px,transparent 2px),linear-gradient(90deg,' + TX + ' 2px,transparent 2px);background-size:60px 30px,60px 60px,60px 60px;background-position:0 0,0 0,30px 30px;');
  add(G, 'geo-deco', 'Abanicos art déco', 'theme', 'background-image:repeating-radial-gradient(circle at 50% 100%,transparent 0 6px,' + A + ' 6px 8px),repeating-radial-gradient(circle at 50% 100%,transparent 0 6px,' + A + ' 6px 8px);background-size:60px 30px;background-position:0 0,30px 15px;');

  /* ============================================== retro y vintage ===== */

  var R = cat('retro', 'Retro y vintage', '📻');
  add(R, 'plano-azul', 'Plano técnico', 'dark', 'background-color:#1d4f8a;background-image:linear-gradient(rgba(255,255,255,.28) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.28) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px);background-size:100px 100px,100px 100px,20px 20px,20px 20px;');
  add(R, 'pentagrama', 'Papel de música', 'light', 'background-color:#faf6ea;background-image:repeating-linear-gradient(transparent 0 10px,#8b8170 10px 11px,transparent 11px 20px,#8b8170 20px 21px,transparent 21px 30px,#8b8170 30px 31px,transparent 31px 40px,#8b8170 40px 41px,transparent 41px 50px,#8b8170 50px 51px,transparent 51px 100px);');
  add(R, 'trama-comic', 'Trama de cómic', 'theme', 'background-image:radial-gradient(color-mix(in srgb,var(--accent) 40%,transparent) 22%,transparent 24%);background-size:10px 10px;');
  add(R, 'rayos-pop', 'Rayos pop', 'light', 'background-color:#ffd447;background-image:repeating-conic-gradient(from 0deg at 50% 40%,#ffd447 0 9deg,#ffb52e 9deg 18deg);');
  add(R, 'azulejo', 'Azulejo hidráulico', 'light', tile('#f1ece0', svg(80, 80, rect('#f1ece0') + "<g fill='none' stroke='#2c5f7c' stroke-width='3'><circle cx='0' cy='0' r='30'/><circle cx='80' cy='0' r='30'/><circle cx='0' cy='80' r='30'/><circle cx='80' cy='80' r='30'/><circle cx='40' cy='40' r='14'/></g><g fill='#c6533c'><circle cx='40' cy='40' r='6'/><path d='M40 4 L44 14 L40 24 L36 14Z M40 56 L44 66 L40 76 L36 66Z M4 40 L14 36 L24 40 L14 44Z M56 40 L66 36 L76 40 L66 44Z'/></g>")));
  add(R, 'papel-pintado', 'Papel pintado de rayas', 'light', 'background-color:#efe5d2;background-image:repeating-linear-gradient(90deg,transparent 0 26px,rgba(140,60,50,.22) 26px 30px,transparent 30px 34px,rgba(140,60,50,.12) 34px 36px,transparent 36px 60px),' + grain('#efe5d2', '#6b4f2e', 0.35, 151) + ';');
  add(R, 'papel-envejecido', 'Papel envejecido', 'light', 'background-color:#e8d4a8;background-image:radial-gradient(ellipse at center,rgba(255,250,235,.5),transparent 60%),radial-gradient(ellipse at center,transparent 50%,rgba(110,70,20,.4) 100%),' + svg(400, 400, rect('#e8d4a8') + noise({ freq: 0.02, oct: 4, seed: 153, color: '#9c6a2a', k: 1.4, c: -0.55 }) + noise({ freq: 0.25, oct: 2, seed: 154, color: '#6b4416', k: 6, c: -3.8 })) + ';background-size:100% 100%,100% 100%,auto;');
  add(R, 'pantalla-crt', 'Pantalla antigua', 'dark', 'background-color:#0f1a12;background-image:repeating-linear-gradient(0deg,rgba(80,255,120,.07) 0 1px,transparent 1px 3px),radial-gradient(ellipse at center,rgba(80,255,120,.12),transparent 70%);background-size:auto,100% 100%;');
  add(R, 'mantel-cuadros', 'Mantel de cuadros', 'light', 'background-color:#fff;background-image:linear-gradient(90deg,rgba(40,90,170,.4) 50%,transparent 50%),linear-gradient(rgba(40,90,170,.4) 50%,transparent 50%);background-size:40px 40px;');

  /* =================================================== degradados ===== */

  var D = cat('degradados', 'Degradados', '🌈');
  [
    ['amanecer', 'Amanecer', 'light', 'linear-gradient(160deg,#ffecd2 0%,#fcb69f 100%)'],
    ['oceano', 'Océano', 'dark', 'linear-gradient(160deg,#0f2b4c 0%,#1d6f8f 60%,#4fb3bf 100%)'],
    ['menta', 'Menta', 'light', 'linear-gradient(160deg,#e0f7ef 0%,#b8ead7 100%)'],
    ['lavanda', 'Lavanda', 'light', 'linear-gradient(160deg,#efe9fb 0%,#cfc2f2 100%)'],
    ['melocoton', 'Melocotón', 'light', 'linear-gradient(160deg,#fff1e6 0%,#ffd3b8 55%,#f7b7a3 100%)'],
    ['bosque', 'Bosque profundo', 'dark', 'linear-gradient(160deg,#0f2418 0%,#24503a 100%)'],
    ['medianoche', 'Medianoche', 'dark', 'linear-gradient(160deg,#0b1026 0%,#2b1f4a 100%)'],
    ['fuego', 'Fuego', 'dark', 'linear-gradient(160deg,#3a0d0d 0%,#a12c1d 55%,#f08a24 100%)'],
    ['algodon', 'Algodón de azúcar', 'light', 'radial-gradient(60% 50% at 15% 10%,#ffd1e8,transparent 70%),radial-gradient(60% 55% at 90% 80%,#c9e4ff,transparent 70%),linear-gradient(#fff8fc,#f4f8ff)'],
    ['perla', 'Gris perla', 'light', 'linear-gradient(160deg,#f7f7f5 0%,#dcdcd8 100%)'],
    ['aurora-paleta', 'Aurora de la paleta', 'theme', 'radial-gradient(60% 50% at 12% 8%,color-mix(in srgb,var(--accent) 30%,transparent),transparent 70%),radial-gradient(55% 45% at 90% 30%,color-mix(in srgb,var(--accent-2) 26%,transparent),transparent 70%),radial-gradient(70% 60% at 50% 100%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 70%)'],
    ['malla', 'Malla de color', 'light', 'radial-gradient(50% 60% at 0% 0%,#ffe29a,transparent 70%),radial-gradient(50% 60% at 100% 0%,#a0e7e5,transparent 70%),radial-gradient(60% 60% at 100% 100%,#ffaaa6,transparent 70%),radial-gradient(60% 60% at 0% 100%,#b4a7f5,transparent 70%),#fff']
  ].forEach(function (g) { add(D, 'grad-' + g[0], g[1], g[2], 'background:' + g[3] + ';'); });

  /* ============================================= infantil y fiesta ==== */

  var F = cat('fiesta', 'Infantil y fiesta', '🎉');
  function scatter(seed, n, w, base, shape) {
    var r = rng(seed), body = rect(base);
    for (var i = 0; i < n; i++) body += shape(r, i);
    return svg(w, w, body);
  }
  var FC = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5', '#f78c6b'];
  add(F, 'confeti', 'Confeti', 'light', tile('#fffdf7', scatter(161, 70, 320, '#fffdf7', function (r, i) {
    var x = (r() * 320).toFixed(0), y = (r() * 320).toFixed(0);
    return "<rect x='" + x + "' y='" + y + "' width='" + (4 + r() * 6).toFixed(0) + "' height='" + (3 + r() * 4).toFixed(0) + "' fill='" + FC[i % 6] + "' transform='rotate(" + (r() * 180).toFixed(0) + " " + x + " " + y + ")'/>";
  })));
  add(F, 'estrellas', 'Estrellas', 'light', tile('#f6f8ff', scatter(163, 26, 300, '#f6f8ff', function (r, i) {
    var x = r() * 300, y = r() * 300, s = 5 + r() * 7, pts = [];
    for (var k = 0; k < 10; k++) { var a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? s * 0.45 : s; pts.push((x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1)); }
    return "<polygon points='" + pts.join(' ') + "' fill='" + FC[i % 6] + "' opacity='.7'/>";
  })));
  add(F, 'corazones', 'Corazones', 'light', tile('#fff5f7', scatter(165, 24, 300, '#fff5f7', function (r, i) {
    var x = (r() * 300).toFixed(0), y = (r() * 300).toFixed(0), s = (0.5 + r() * 0.6).toFixed(2);
    return "<path transform='translate(" + x + ' ' + y + ') scale(' + s + ")' d='M0 6 C-14 -6 -6 -16 0 -8 C6 -16 14 -6 0 6Z' fill='" + ['#ef476f', '#ff8fab', '#f7b2bd'][i % 3] + "'/>";
  })));
  add(F, 'globos', 'Globos', 'light', tile('#f2fbff', scatter(167, 14, 340, '#f2fbff', function (r, i) {
    var x = (20 + r() * 300).toFixed(0), y = (20 + r() * 280).toFixed(0), c = FC[i % 6];
    return "<ellipse cx='" + x + "' cy='" + y + "' rx='13' ry='16' fill='" + c + "' opacity='.8'/><path d='M" + x + ' ' + (+y + 16) + ' q4 12 -2 24' + "' stroke='#9aa' fill='none'/>";
  })));
  add(F, 'arcoiris', 'Arcoíris', 'light', 'background-color:#fffaf2;background-image:radial-gradient(circle at 50% 100%,transparent 0 34%,rgba(239,71,111,.35) 34% 40%,rgba(255,159,67,.35) 40% 46%,rgba(255,209,102,.38) 46% 52%,rgba(6,214,160,.32) 52% 58%,rgba(17,138,178,.32) 58% 64%,rgba(155,93,229,.3) 64% 70%,transparent 70%);background-size:300px 170px;');
  add(F, 'pizarra-tiza', 'Pizarra con dibujos', 'dark', 'background-color:#2f4a3c;background-image:' + svg(420, 420, "<g fill='none' stroke='#ffffff' stroke-width='2' stroke-linecap='round' opacity='.28'><path d='M40 60 l20 -20 l20 20 v30 h-40z'/><circle cx='300' cy='80' r='22'/><path d='M300 40 v-14 M300 120 v14 M260 80 h-14 M340 80 h14'/><path d='M80 300 q30 -40 60 0 t60 0'/><path d='M300 300 l12 -24 l12 24 l-24 -15 h24z'/><text x='150' y='200' font-family='Comic Sans MS,cursive' font-size='34' fill='#fff' stroke='none'>a b c</text></g>") + ',' + chalk('#2f4a3c', 169) + ';');

  /* ------------------------------------------------------- publicar -- */

  var byId = {};
  LIST.forEach(function (b) { byId[b.id] = b; });

  WB.BG = {
    list: LIST,
    cats: CATS,
    byId: byId,
    /** CSS de la capa de relleno (vacio si no existe). */
    css: function (id) { var b = byId[id]; return b ? b.css : ''; }
  };
})();
