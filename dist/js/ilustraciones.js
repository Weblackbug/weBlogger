/* ==========================================================================
   weBlogger - ilustraciones de prensa.
   Escenas SVG generadas (sin texto ni logotipos) que sustituyen a los huecos
   de imagen en las paginas de muestra. WB.scenes.url(i) devuelve un data URI
   de 1200x800; WB.scenes.portrait(i) un retrato en silueta de 400x400.
   ========================================================================== */
(function () {
  'use strict';

  var W = 1200, H = 800;

  /* ---------- utilidades ---------- */
  function rng(seed) {
    var s = (seed * 2654435761) >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function k(v) { return Math.round(v); }
  function op(o) { return o == null || o === 1 ? '' : " opacity='" + o + "'"; }
  function stops(a) {
    return a.map(function (s) {
      return "<stop offset='" + s[0] + "' stop-color='" + s[1] + "'" + (s.length > 2 ? " stop-opacity='" + s[2] + "'" : '') + '/>';
    }).join('');
  }
  function lg(id, a, x2, y2) {
    return "<linearGradient id='" + id + "' x2='" + (x2 == null ? 0 : x2) + "' y2='" + (y2 == null ? 1 : y2) + "'>" + stops(a) + '</linearGradient>';
  }
  function rg(id, a, cx, cy, r) {
    return "<radialGradient id='" + id + "'" + (cx != null ? " cx='" + cx + "' cy='" + cy + "' r='" + r + "'" : '') + '>' + stops(a) + '</radialGradient>';
  }
  function glow(id, c) { return rg(id, [[0, c, 1], [0.22, c, 0.5], [1, c, 0]]); }
  function blur(id, sd) {
    return "<filter id='" + id + "' x='-40%' y='-40%' width='180%' height='180%'><feGaussianBlur stdDeviation='" + sd + "'/></filter>";
  }
  function P(d, f, o, ex) { return "<path d='" + d + "' fill='" + f + "'" + op(o) + (ex || '') + '/>'; }
  function L(d, c, w, o, ex) {
    return "<path d='" + d + "' fill='none' stroke='" + c + "' stroke-width='" + w + "'" + op(o) + (ex || '') + '/>';
  }
  function R(x, y, w, h, f, o) {
    return "<rect x='" + k(x) + "' y='" + k(y) + "' width='" + k(w) + "' height='" + k(h) + "' fill='" + f + "'" + op(o) + '/>';
  }
  function C(x, y, r, f, o) { return "<circle cx='" + k(x) + "' cy='" + k(y) + "' r='" + k(r) + "' fill='" + f + "'" + op(o) + '/>'; }
  function El(x, y, rx, ry, f, o) {
    return "<ellipse cx='" + k(x) + "' cy='" + k(y) + "' rx='" + k(rx) + "' ry='" + k(ry) + "' fill='" + f + "'" + op(o) + '/>';
  }
  function G(a, inner) { return '<g ' + a + '>' + inner + '</g>'; }
  function sky(a) { return lg('s', a); }
  var SKY = R(0, 0, W, H, 'url(#s)');

  /* Ventanas iluminadas: rejilla + mascara irregular del color del edificio. */
  function win(c, lit) {
    return "<pattern id='w' width='18' height='24' patternUnits='userSpaceOnUse'><rect x='5' y='6' width='7' height='10' fill='" + (lit || '#ffd48a') + "'/></pattern>" +
      "<pattern id='q' width='54' height='72' patternUnits='userSpaceOnUse'><g fill='" + c + "'><rect x='5' y='6' width='8' height='10'/><rect x='23' y='30' width='8' height='10'/><rect x='41' y='54' width='8' height='10'/><rect x='41' y='6' width='8' height='10'/><rect x='5' y='54' width='8' height='10'/><rect x='23' y='54' width='8' height='10'/></g></pattern>";
  }

  /* ---------- generadores de formas ---------- */
  function towers(r, x, x1, base, h0, h1, w0, w1) {
    var d = '';
    while (x < x1) {
      var w = w0 + r() * (w1 - w0), h = h0 + r() * (h1 - h0);
      d += 'M' + k(x) + ' ' + base + 'v' + (-k(h));
      if (r() < 0.3) d += 'h' + k(w * 0.25) + 'v' + (-k(h * 0.1)) + 'h' + k(w * 0.5) + 'v' + k(h * 0.1) + 'H' + k(x + w);
      else d += 'h' + k(w);
      d += 'V' + base + 'z';
      x += w + (r() < 0.2 ? 4 + r() * 10 : 0);
    }
    return d;
  }
  function ridge(r, y, amp, seg, bot) {
    var d = 'M-10 ' + (bot || H), s = (W + 20) / seg;
    for (var i = 0; i <= seg; i++) d += 'L' + k(-10 + i * s) + ' ' + k(i % 2 ? y - r() * amp : y + r() * amp * 0.35);
    return d + 'V' + (bot || H) + 'z';
  }
  function hill(r, y, amp, seg, bot) {
    var p = [], s = (W + 40) / seg, i, d;
    for (i = 0; i <= seg; i++) p.push([-20 + i * s, y + (r() - 0.5) * amp]);
    d = 'M-20 ' + (bot || H) + 'L' + k(p[0][0]) + ' ' + k(p[0][1]);
    for (i = 1; i <= seg; i++) d += 'Q' + k(p[i - 1][0]) + ' ' + k(p[i - 1][1]) + ' ' + k((p[i - 1][0] + p[i][0]) / 2) + ' ' + k((p[i - 1][1] + p[i][1]) / 2);
    return d + 'L' + k(p[seg][0]) + ' ' + k(p[seg][1]) + 'V' + (bot || H) + 'z';
  }
  /* Hilera de multitud: hombros y cabezas en un unico trazado. */
  function band(r, y, s, bot) {
    var d = 'M-40 ' + (bot || H) + 'V' + k(y), x = -40;
    while (x < W + 40) {
      var hr = s * (0.17 + r() * 0.05), sh = s * (0.3 + r() * 0.2), up = s * (0.12 + r() * 0.16), nk = s * 0.06;
      d += 'q' + k(sh * 0.15) + ' ' + (-k(up)) + ' ' + k(sh) + ' ' + (-k(up)) + 'l' + k(nk) + ' ' + (-k(s * 0.08)) +
        'a' + k(hr) + ' ' + k(hr * 1.2) + ' 0 1 1 ' + k(hr * 1.5) + ' 0l' + k(nk) + ' ' + k(s * 0.08) +
        'q' + k(sh * 0.85) + ' 0 ' + k(sh) + ' ' + k(up);
      x += 2 * sh + 2 * nk + hr * 1.5;
    }
    return d + 'V' + (bot || H) + 'z';
  }
  /* Busto (de espaldas o de frente) con la base de los hombros en y. */
  function bust(x, y, s) {
    var hr = s * 0.2, bw = s * 0.45, c = s * 0.17;
    return 'M' + k(x - hr) + ' ' + k(y - s * 0.2) + 'a' + k(hr) + ' ' + k(hr * 1.18) + ' 0 1 1 ' + k(2 * hr) + ' 0a' + k(hr) + ' ' + k(hr * 1.18) + ' 0 1 1 ' + (-k(2 * hr)) + ' 0' +
      'M' + k(x - bw) + ' ' + k(y + s * 1.4) + 'V' + k(y + c) + 'q0 ' + (-k(c)) + ' ' + k(c) + ' ' + (-k(c)) + 'H' + k(x + bw - c) + 'q' + k(c) + ' 0 ' + k(c) + ' ' + k(c) + 'V' + k(y + s * 1.4) + 'z';
  }
  /* Figura de pie: pies en f, altura h. */
  function fig(x, f, h) {
    var a = h * 0.065;
    return 'M' + k(x - a) + ' ' + k(f - h * 0.92) + 'a' + k(a) + ' ' + k(a * 1.15) + ' 0 1 1 ' + k(2 * a) + ' 0a' + k(a) + ' ' + k(a * 1.15) + ' 0 1 1 ' + (-k(2 * a)) + ' 0' +
      'M' + k(x - h * 0.12) + ' ' + k(f - h * 0.46) + 'V' + k(f - h * 0.79) + 'q0 ' + (-k(h * 0.05)) + ' ' + k(h * 0.05) + ' ' + (-k(h * 0.05)) + 'H' + k(x + h * 0.07) +
      'q' + k(h * 0.05) + ' 0 ' + k(h * 0.05) + ' ' + k(h * 0.05) + 'V' + k(f - h * 0.46) + 'z' +
      'M' + k(x - h * 0.09) + ' ' + k(f - h * 0.48) + 'h' + k(h * 0.085) + 'V' + k(f) + 'h' + (-k(h * 0.085)) + 'z' +
      'M' + k(x + h * 0.005) + ' ' + k(f - h * 0.48) + 'h' + k(h * 0.085) + 'V' + k(f) + 'h' + (-k(h * 0.085)) + 'z';
  }
  function pine(x, b, h, w) {
    return 'M' + k(x) + ' ' + k(b - h) + 'l' + k(w * 0.3) + ' ' + k(h * 0.45) + 'h' + (-k(w * 0.12)) + 'l' + k(w * 0.32) + ' ' + k(h * 0.55) +
      'h' + (-k(w)) + 'l' + k(w * 0.32) + ' ' + (-k(h * 0.55)) + 'h' + (-k(w * 0.12)) + 'z';
  }
  function forest(r, x0, x1, b, h0, h1, step) {
    var d = '', x = x0;
    while (x < x1) { var h = h0 + r() * (h1 - h0); d += pine(x, b + r() * 12, h, h * 0.42); x += step * (0.6 + r() * 0.8); }
    return d;
  }
  function blob(x, y, rx) { return 'M' + k(x - rx) + ' ' + k(y) + 'a' + k(rx) + ' ' + k(rx) + ' 0 1 1 ' + k(2 * rx) + ' 0a' + k(rx) + ' ' + k(rx) + ' 0 1 1 ' + (-k(2 * rx)) + ' 0'; }
  function clouds(r, n, y0, y1, c, o) {
    var d = '';
    for (var i = 0; i < n; i++) {
      var x = r() * W, y = y0 + r() * (y1 - y0), s = 40 + r() * 60;
      d += blob(x, y, s) + blob(x + s * 0.9, y + s * 0.2, s * 0.8) + blob(x - s * 0.9, y + s * 0.25, s * 0.7);
    }
    return P(d, c || '#fff', o == null ? 0.75 : o, " filter='url(#b)'");
  }
  function streaks(r, n, x0, x1, y0, y1, w0, w1) {
    var d = '';
    for (var i = 0; i < n; i++) d += 'M' + k(x0 + r() * (x1 - x0)) + ' ' + k(y0 + r() * (y1 - y0)) + 'h' + k(w0 + r() * (w1 - w0));
    return d;
  }
  function fan(vx, vy, xs, y0, y1) {
    /* trazos que convergen hacia un punto de fuga */
    var d = '';
    xs.forEach(function (x) {
      var t0 = (y0 - vy) / (H - vy), t1 = (y1 - vy) / (H - vy);
      d += 'M' + k(vx + (x - vx) * t0) + ' ' + y0 + 'L' + k(vx + (x - vx) * t1) + ' ' + y1;
    });
    return d;
  }
  function range(a, b, s) { var o = []; for (var x = a; x <= b; x += s) o.push(x); return o; }

  /* ---------- escenas ---------- */
  var S = [];
  function add(name, f) { S.push({ n: name, f: f }); }

  add('ciudad al atardecer', function (r) {
    var near = towers(r, -30, W, H, 150, 400, 70, 170);
    return [sky([[0, '#1c2744'], [0.45, '#6e4a68'], [0.75, '#d9845a'], [1, '#f4c27e']]) + glow('g', '#ffe0a0') + win('#17131d'),
      SKY + C(780, 470, 340, 'url(#g)') + C(780, 480, 56, '#fff3d0') +
      P(towers(r, -20, W, 640, 40, 170, 30, 90), '#9c6274', 0.75) +
      P(towers(r, -20, W, 720, 100, 330, 45, 120), '#553650') +
      P(near, '#17131d') + P(near, 'url(#w)', 0.55) + P(near, 'url(#q)')];
  });

  add('puerto con barcos', function (r) {
    var i, cr = '', ca = '', c1 = '', c2 = '', c3 = '', x;
    for (i = 0; i < 3; i++) {
      x = 700 + i * 160;
      cr += 'M' + x + ' 512V360h9V512zM' + (x + 52) + ' 512V360h9V512zM' + (x - 10) + ' 372v-24h82v24zM' + (x - 110) + ' 352v-9h300v9z';
      ca += 'M' + (x + 30) + ' 300V348M' + (x + 30) + ' 300L' + (x - 110) + ' 344M' + (x + 30) + ' 300L' + (x + 190) + ' 344';
    }
    for (i = 0; i < 42; i++) {
      var col = i % 14, row = (i / 14) | 0, v = r();
      var dd = 'M' + (640 + col * 38) + ' ' + (498 - row * 14) + 'h36v13h-36z';
      if (v < 0.4) c1 += dd; else if (v < 0.7) c2 += dd; else c3 += dd;
    }
    var sh = '';
    for (i = 0; i < 24; i++) { v = r(); sh += 'M' + (190 + (i % 12) * 30) + ' ' + (546 - ((i / 12) | 0) * 13) + 'h28v12h-28z'; }
    return [sky([[0, '#6f8aa6'], [0.6, '#c6d0d4'], [1, '#ebe5d6']]) + lg('a', [[0, '#9aa9b2'], [1, '#2b3a47']]) + glow('g', '#fff8e4'),
      SKY + C(330, 400, 260, 'url(#g)') + P(hill(r, 480, 34, 6, 512), '#8494a2') +
      P(c1, '#8a4a36') + P(c2, '#3f5f7a') + P(c3, '#9a9488') +
      P(cr, '#3b4652') + L(ca, '#3b4652', 3) +
      R(0, 512, W, 288, 'url(#a)') + L(streaks(r, 46, 0, W, 520, 760, 20, 90), '#f2f4f2', 2, 0.35) +
      P('M150 558H780L748 622H180z', '#1d232b') + P(sh, '#7a3c2e') + P('M580 558V500h130v58zM610 500v-30h76v30z', '#ece9e1') +
      R(630, 438, 30, 32, '#8a3028') + R(600, 512, 120, 8, '#bfc6c9') + P('M180 624h568l-26 42H206z', '#141a20', 0.35) +
      P('M800 700h150l-20 28H820z', '#f1efe8') + L('M870 700V520', '#222', 4) + P('M876 528V694h66z', '#f6f4ee') + P('M866 540V694h-58z', '#dcdad2') +
      P('M808 730h134l-14 22H822z', '#f1efe8', 0.25) +
      P('M0 650L470 690V800H0z', '#181c21') + P('M40 652h14v40h-14zM180 664h14v40h-14zM320 676h14v40h-14z', '#0d1013') +
      P(fig(230, 690, 110) + fig(262, 694, 104), '#0e1115')];
  });

  add('montana nevada', function (r) {
    return [sky([[0, '#26446d'], [0.65, '#9cb6d1'], [1, '#e2eaf0']]) + lg('h', [[0, '#fff', 0], [1, '#eef3f6', 0.85]]) + lg('n', [[0, '#e9eef2'], [1, '#c4d0da']]),
      SKY + P(ridge(r, 420, 90, 16), '#a3b5c8') +
      P('M160 800L520 205L600 278L660 238L1020 800z', '#56687d') +
      P('M520 205L600 278L660 238L745 380L705 366L672 410L630 360L586 402L545 350L500 396L465 362L420 380z', '#f3f6f9') +
      P('M520 205L600 278L660 238L1020 800H640L610 520L585 420z', '#0a1420', 0.22) +
      R(0, 420, W, 220, 'url(#h)') +
      P(hill(r, 610, 50, 7), '#3a4959') + P(forest(r, -20, W + 20, 700, 80, 170, 34), '#17222a') +
      P(hill(r, 750, 30, 5), 'url(#n)') + P(forest(r, 40, 400, 790, 120, 220, 70), '#0e171c')];
  });

  add('multitud en una plaza', function (r) {
    var arches = '';
    for (var x = 20; x < W; x += 110) arches += 'M' + x + ' 560V478a38 38 0 0 1 76 0V560z';
    return [sky([[0, '#8aa6bf'], [1, '#e1e5e1']]) + "<pattern id='w' width='110' height='96' patternUnits='userSpaceOnUse'><rect x='38' y='18' width='34' height='56' fill='#5f5243'/><rect x='34' y='74' width='42' height='6' fill='#e8dcc6'/></pattern>" +
      lg('f', [[0, '#000', 0.25], [0.5, '#000', 0], [1, '#000', 0.3]], 1, 0),
      SKY + R(0, 200, W, 360, '#cdbda3') + R(0, 210, W, 240, 'url(#w)') + R(0, 186, W, 22, '#a99a80') + R(0, 448, W, 12, '#b5a68c') +
      P(arches, '#4d4134') + R(0, 186, W, 374, 'url(#f)') + R(0, 556, W, 244, '#aa9c86') +
      L('M300 560V380M900 560V380', '#2b2620', 6) + C(300, 372, 12, '#2b2620') + C(900, 372, 12, '#2b2620') +
      P(band(r, 574, 36), '#7a7064') + P(band(r, 606, 48), '#564e45') + P(band(r, 660, 76), '#36312b') + P(band(r, 740, 118), '#16130f')];
  });

  add('estadio de noche', function (r) {
    var b = SKY, st = '', i;
    b += P('M-10 300L1210 280V330L-10 352z', '#0a0d13') + P('M-10 352L1210 330V560H-10z', '#1e242e') + P('M-10 352L1210 330V560H-10z', 'url(#c)', 0.6);
    [[170, 150], [1030, 140]].forEach(function (p) {
      b += L('M' + p[0] + ' ' + p[1] + 'V340', '#07090d', 12) + C(p[0], p[1], 300, 'url(#g)') + R(p[0] - 62, p[1] - 30, 124, 46, '#f4f6f6') +
        P('M' + (p[0] - 60) + ' ' + (p[1] + 16) + 'L' + (p[0] + (p[0] < 600 ? 520 : -520)) + ' 800H' + (p[0] + (p[0] < 600 ? 120 : -120)) + 'z', 'url(#m)', 0.6);
    });
    var top = range(240, 960, 90), bot = range(-250, 1450, 212.5);
    for (i = 0; i < top.length - 1; i += 2) st += 'M' + top[i] + ' 560H' + top[i + 1] + 'L' + k(bot[i + 1]) + ' 800H' + k(bot[i]) + 'z';
    b += P('M-250 800L240 560H960L1450 800z', 'url(#p)') + P(st, '#000', 0.12) +
      L('M240 562H960M600 562V800', '#eef3ee', 3, 0.85) + "<ellipse cx='600' cy='660' rx='120' ry='34' fill='none' stroke='#eef3ee' stroke-width='3' opacity='.85'/>" +
      P(fig(520, 640, 44) + fig(700, 700, 56) + fig(380, 720, 62), '#c23a30') + P(fig(610, 620, 40) + fig(820, 650, 48) + fig(460, 610, 38), '#f0f0f0') +
      C(560, 688, 7, '#fff');
    return [sky([[0, '#03050a'], [1, '#161d2a']]) + glow('g', '#fff7de') + lg('p', [[0, '#2a5a31'], [1, '#3f8a46']]) + lg('m', [[0, '#fff', 0.5], [1, '#fff', 0]]) +
      "<pattern id='c' width='14' height='11' patternUnits='userSpaceOnUse'><circle cx='3' cy='3' r='2.6' fill='#9aa0aa'/><circle cx='10' cy='8' r='2.6' fill='#5d636e'/></pattern>", b];
  });

  add('edificio institucional', function (r) {
    var cols = '', caps = '', steps = '';
    for (var i = 0; i < 8; i++) { var x = 288 + i * 84; cols += R(x, 318, 46, 282, 'url(#c)'); caps += 'M' + (x - 7) + ' 306h60v14h-60z'; }
    for (i = 0; i < 6; i++) steps += R(230 - i * 22, 600 + i * 17, 740 + i * 44, 17, i % 2 ? '#bdb39f' : '#d8cfbc');
    return [sky([[0, '#4f7ca6'], [1, '#d5e1ea']]) + blur('b', 9) + lg('c', [[0, '#9a907d'], [0.35, '#f5f0e6'], [0.7, '#d6cdb9'], [1, '#867c6a']], 1, 0),
      SKY + clouds(r, 4, 80, 220) +
      P('M150 640h900V420H150z', '#cfc6b3') + R(258, 300, 684, 300, '#3e392f') +
      P('M240 262L600 138L960 262z', '#ece6d8') + P('M290 252L600 152L910 252z', '#cfc5b0') + R(240, 262, 720, 44, '#e2dac8') + R(240, 296, 720, 10, '#b3a891') +
      P('M480 600V420h40v180zM580 600V400h40v200zM680 600V420h40v180z', '#221f19') +
      cols + P(caps, '#e9e2d2') + steps +
      L('M110 640V300M1090 640V300', '#3a3a3a', 5) + P('M112 302h80v52h-80z', '#a63a32') + P('M1088 302h-80v52h80z', '#2f5a8a') +
      P(blob(70, 560, 90) + blob(150, 600, 70) + blob(1130, 560, 90) + blob(1050, 600, 70), '#2e4430') +
      P(fig(500, 640, 70) + fig(530, 643, 66) + fig(760, 676, 80) + fig(420, 694, 86), '#1a1814')];
  });

  add('mercado con toldos', function (r) {
    var aw = '', fr = ['', '', '', ''], cnt = '', i, j, x;
    for (i = 0; i < 4; i++) {
      x = 20 + i * 300;
      aw += 'M' + x + ' 300h260l36 80q-18 14-36 0q-18 14-36 0q-18 14-36 0q-18 14-36 0q-18 14-36 0q-18 14-36 0q-18 14-36 0q-18 14-36 0q-18 14-36 0z';
      cnt += 'M' + (x + 10) + ' 560h272v240h-272z';
      for (j = 0; j < 10; j++) fr[(i + j) % 4] += blob(x + 34 + j * 25, 546 - r() * 8, 13);
    }
    return [sky([[0, '#b9c7cf'], [1, '#e9e2d4']]) + "<pattern id='a' width='60' height='10' patternUnits='userSpaceOnUse'><rect width='30' height='10' fill='#b23a2e'/><rect x='30' width='30' height='10' fill='#f2ead8'/></pattern>",
      SKY + P(towers(r, -10, W, 330, 140, 280, 120, 220), '#c9a985') + P(towers(r, 40, W, 330, 80, 160, 140, 260), '#a7876a', 0.6) +
      R(0, 300, W, 280, '#3a2f26') + P(aw, 'url(#a)') + P(aw, '#000', 0.12) +
      P(cnt, '#6b4a2e') + L('M20 600h1180M20 660h1180', '#4c3420', 4) +
      P(fr[0], '#e08a2a') + P(fr[1], '#c9302a') + P(fr[2], '#6f9a3a') + P(fr[3], '#e8c84a') +
      P(fig(150, 520, 180) + fig(470, 525, 170) + fig(840, 522, 176), '#1c1612') +
      P(band(r, 700, 120), '#120e0b')];
  });

  add('campo de cultivo', function (r) {
    var xs = range(-1400, 2600, 70), fx = fan(620, 430, xs, 520, 800);
    return [sky([[0, '#4f86ba'], [0.7, '#cfe0e8'], [1, '#f1ead6']]) + blur('b', 9) + glow('g', '#fff4cf'),
      SKY + C(980, 180, 260, 'url(#g)') + clouds(r, 5, 80, 260) +
      P(hill(r, 430, 30, 5), '#7f9878') + P(blob(100, 450, 22) + blob(140, 444, 26) + blob(184, 452, 20) + blob(420, 446, 24) + blob(460, 452, 18) + blob(1050, 450, 26) + blob(1096, 446, 30), '#3b5135') +
      P('M820 450V420h80v30zM810 422l50-30 50 30z', '#e9e2d0') + P('M810 422l50-30 50 30z', '#8a3a2a') +
      P(hill(r, 480, 24, 4), '#cfac4f') + P('M-20 520Q600 498 1220 526V800H-20z', '#5f7c32') +
      L(fx, '#3c5420', 9) + L(fx, '#88a24a', 2, 0.5, " transform='translate(14 0)'")];
  });

  add('tren en un viaducto', function (r) {
    var ar = 'M-10 410H1210V800H-10z', i, cars = '', wn = '';
    for (i = 0; i < 10; i++) ar += 'M' + (20 + i * 124) + ' 800V520a46 46 0 0 1 92 0V800z';
    for (i = 0; i < 5; i++) { cars += 'M' + (200 + i * 150) + ' 404v-46q0-8 8-8h136q8 0 8 8v46z'; wn += 'M' + (214 + i * 150) + ' 366h124v14h-124z'; }
    return [sky([[0, '#7290b2'], [1, '#e7dac3']]) + lg('h', [[0, '#eee8dc', 0], [1, '#eee8dc', 0.95]]) + lg('v', [[0, '#7b6a5c'], [1, '#4c4038']], 1, 0),
      SKY + P(ridge(r, 360, 80, 12), '#93a1b2') + P(hill(r, 470, 60, 6), '#64768a') + R(0, 380, W, 300, 'url(#h)') +
      P(forest(r, -20, W, 760, 60, 120, 28), '#3c4d47') +
      P(ar, 'url(#v)', 1, " fill-rule='evenodd'") + R(-10, 398, 1220, 16, '#3a302a') +
      P(cars + 'M960 404v-46q0-8 8-8h90q40 0 56 54z', '#a8322a') + P(wn + 'M974 366h80v14h-80z', '#232a30') + R(200, 394, 920, 8, '#e5e1d8') +
      R(0, 640, W, 160, 'url(#h)')];
  });

  add('puente colgante', function (r) {
    var h = '', x, t, y;
    for (x = 345; x < 860; x += 22) { t = (x - 330) / 540; y = (1 - t) * (1 - t) * 180 + 2 * t * (1 - t) * 730 + t * t * 180; h += 'M' + x + ' ' + k(y) + 'V470'; }
    for (x = 0; x < 320; x += 24) h += 'M' + x + ' ' + k(470 - (x + 10) / 340 * 280 + Math.sin((x + 10) / 340 * Math.PI) * 30) + 'V470';
    for (x = 880; x < W; x += 24) h += 'M' + x + ' ' + k(180 + (x - 870) / 340 * 290 + Math.sin((x - 870) / 340 * Math.PI) * 30) + 'V470';
    return [sky([[0, '#373d62'], [0.5, '#b0676a'], [0.85, '#efa766'], [1, '#f6d3a0']]) + glow('g', '#ffd99a') + lg('a', [[0, '#d39466'], [1, '#22222f']]),
      SKY + C(600, 560, 330, 'url(#g)') + C(600, 548, 48, '#fff0c8') + P(towers(r, 0, W, 560, 10, 50, 30, 70), '#8a5a62', 0.6) +
      R(0, 560, W, 240, 'url(#a)') + L(streaks(r, 30, 480, 720, 566, 760, 30, 120), '#ffe2b0', 3, 0.5) +
      G("fill='#16141e'", P('M322 610V170h20v440zM378 610V170h20v440zM862 610V170h20v440zM918 610V170h20v440z', 'inherit') +
        R(322, 230, 76, 12, 'inherit') + R(862, 230, 76, 12, 'inherit') + R(322, 380, 76, 12, 'inherit') + R(862, 380, 76, 12, 'inherit') +
        R(-10, 468, 1220, 22, 'inherit')) +
      L('M-10 472Q170 400 360 176Q600 730 900 176Q1060 400 1210 474', '#16141e', 5) + L(h, '#16141e', 1.5) +
      P('M-10 490h1220v8H-10z', '#000', 0.35)];
  });

  add('bosque con niebla', function (r) {
    return [lg('s', [[0, '#c5cecc'], [1, '#e9ebe5']]) + lg('m', [[0, '#e6e9e3', 0], [1, '#e6e9e3', 0.9]]) + lg('y', [[0, '#fff', 0.55], [1, '#fff', 0]]) + blur('b', 10),
      SKY + P('M760 -40L1000 -40L520 800H260z', 'url(#y)', 0.6, " filter='url(#b)'") +
      P(forest(r, -20, W + 20, 500, 140, 230, 40), '#a9b3ae') + R(0, 380, W, 180, 'url(#m)') +
      P(forest(r, -20, W + 20, 590, 200, 300, 60), '#7b8a84') + R(0, 470, W, 160, 'url(#m)') +
      P(forest(r, -20, W + 20, 690, 260, 380, 90), '#4b5a54') + R(0, 600, W, 120, 'url(#m)', 0.7) +
      P(forest(r, -40, W + 40, 820, 420, 600, 150), '#18221f') + P('M-10 800V760Q600 730 1210 770V800z', '#1c2420')];
  });

  add('playa', function (r) {
    var um = '', po = '';
    [[260, 600, '#c8382e'], [520, 640, '#f2c230'], [880, 620, '#2f6fa0'], [1080, 680, '#f4f1ea']].forEach(function (u) {
      um += P('M' + (u[0] - 70) + ' ' + u[1] + 'q70-62 140 0z', u[2]);
      po += 'M' + u[0] + ' ' + (u[1] - 30) + 'V' + (u[1] + 110);
    });
    return [sky([[0, '#4a8cc4'], [1, '#d3e8ef']]) + lg('a', [[0, '#2f6f98'], [1, '#86c0c9']]) + lg('d', [[0, '#d8c193'], [1, '#efdcb0']]) + blur('b', 8),
      SKY + clouds(r, 3, 120, 260, '#fff', 0.8) + P('M-20 440Q120 360 300 420L380 440H-20z', '#607f77') +
      R(0, 436, W, 160, 'url(#a)') + L(streaks(r, 40, 300, 1100, 450, 560, 20, 70), '#fff', 2, 0.45) +
      L('M-20 560Q300 540 600 566T1220 556M-20 586Q320 570 640 590T1220 582', '#fff', 5, 0.8) +
      P('M-20 572Q300 560 600 582T1220 574V800H-20z', '#c2ab7e') + P('M-20 610Q400 596 1220 620V800H-20z', 'url(#d)') +
      El(260, 714, 80, 12, '#000', 0.15) + El(520, 754, 80, 12, '#000', 0.15) + El(880, 734, 80, 12, '#000', 0.15) +
      L(po, '#3a3530', 4) + um + P('M600 700h120v26h-120zM940 740h110v24h-110z', '#e0705a') +
      P(fig(430, 580, 64) + fig(452, 582, 52) + fig(760, 576, 58), '#2a2622')];
  });

  add('escenario de concierto', function (r) {
    var bm = '', arms = '', i, x;
    [[260, '#c84cff'], [600, '#5fd4ff'], [940, '#ffb84a'], [430, '#ffffff'], [770, '#ffffff']].forEach(function (b, j) {
      bm += P('M' + (b[0] - 10) + ' 112L' + (b[0] + 10) + ' 112L' + (b[0] + 150 - j * 60) + ' 800H' + (b[0] - 150 - j * 30) + 'z', b[1], 0.28);
      bm += C(b[0], 112, 14, '#fff');
    });
    for (i = 0; i < 12; i++) { x = 60 + i * 95 + r() * 30; arms += 'M' + k(x) + ' 700l' + k(10 + r() * 20) + ' -' + k(110 + r() * 50) + 'l14 4l-12 110z'; }
    return [lg('s', [[0, '#06050a'], [1, '#120d18']]) + glow('g', '#7a4ca0') + blur('b', 10),
      SKY + C(600, 380, 420, 'url(#g)') + R(120, 96, 960, 18, '#2a2a30') + L('M120 96l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18l24-18l24 18', '#4a4a52', 2) +
      bm + El(600, 420, 380, 120, '#c9b8e0', 0.12, " filter='url(#b)'") +
      R(140, 520, 920, 24, '#0b0a0e') + P('M100 520V330h120v190zM980 520V330h120v190z', '#0d0c11') +
      P(fig(600, 520, 190) + 'M640 520V400h4v120z', '#050407') + P('M560 420l-40 -60l8 -6l44 56z', '#050407') +
      P(band(r, 640, 70), '#16111c') + P(arms, '#050407') + P(band(r, 720, 120), '#050407')];
  });

  add('laboratorio', function (r) {
    var fl = '', lq = ['', '', ''], tb = '', i, x;
    [[640, 0], [760, 1], [880, 2]].forEach(function (f) {
      x = f[0];
      fl += 'M' + (x - 10) + ' 420h20v46l46 54h-112l46-54z';
      lq[f[1]] += 'M' + (x - 30) + ' 490h60l26 30h-112z';
    });
    for (i = 0; i < 6; i++) tb += 'M' + (980 + i * 22) + ' 440h12v70q0 6-6 6t-6-6z';
    return [lg('s', [[0, '#d9e3e7'], [1, '#aebcc2']]) + lg('y', [[0, '#fff', 0.7], [1, '#fff', 0]]) + blur('b', 8),
      SKY + R(60, 90, 300, 360, '#f6faf8') + L('M210 90V450M60 270H360', '#9aa9ae', 10) + R(60, 90, 300, 360, 'none') +
      P('M60 450H360L640 800H-40z', 'url(#y)', 0.5, " filter='url(#b)'") +
      P('M820 120h340v8h-340zM820 220h340v8h-340z', '#5e6e74') + P('M840 120v-40h24v40zM880 120v-60h30v60zM930 120v-30h22v30zM1040 120v-50h36v50zM860 220v-50h40v50zM960 220v-34h26v34zM1080 220v-56h30v56z', '#6f8b94') +
      P(bust(330, 380, 230), '#eef1f2') + P('M284 322a46 54 0 1 1 92 0a46 54 0 1 1-92 0', '#3a2f2a') + L('M330 380V560', '#b8c2c6', 3) +
      R(0, 520, W, 26, '#26343a') + R(0, 546, W, 254, '#3f5056') + L('M300 546V800M600 546V800M900 546V800', '#2c393e', 4) +
      P(fl, '#e6f0f2', 0.75) + P(lq[0], '#3a8fc0') + P(lq[1], '#5aa860') + P(lq[2], '#d89a3a') +
      R(970, 500, 150, 16, '#5e6e74') + P(tb, '#cfe4ea', 0.85) +
      P('M480 520h80v-14h-26l-10-80l26-30l-10-8l-34 36l12 82h-38z', '#1e2a2e')];
  });

  add('fabrica', function (r) {
    var saw = 'M60 600V470', i, sm = '', x;
    for (i = 0; i < 8; i++) saw += 'l70-56v56';
    saw += 'V600z';
    [[760, 0], [880, 1], [1000, 2]].forEach(function (c) {
      x = c[0];
      for (i = 0; i < 6; i++) sm += blob(x + 30 + i * 60 + r() * 20, 200 - i * 30 - r() * 20, 40 + i * 14);
    });
    return [sky([[0, '#46495a'], [0.6, '#9f8b7a'], [1, '#dbb489']]) + blur('b', 10) + lg('t', [[0, '#6c6a66'], [0.4, '#b9b5ae'], [1, '#55524d']], 1, 0),
      SKY + P(sm, '#d4cfc7', 0.75, " filter='url(#b)'") +
      P('M752 600l10-380h26l10 380zM872 600l10-420h26l10 420zM992 600l10-360h26l10 360z', '#2e2b29') +
      P('M760 236h30v12h-30zM760 268h30v12h-30zM880 196h30v12h-30zM880 228h30v12h-30zM1000 256h30v12h-30zM1000 288h30v12h-30z', '#b84a3a') +
      P(saw, '#2a2725') + P(towers(r, 640, W, 600, 80, 160, 90, 180), '#1f1d1c') +
      R(250, 430, 120, 170, 'url(#t)') + R(400, 400, 140, 200, 'url(#t)') + El(310, 430, 60, 12, '#c8c4bd') + El(470, 400, 70, 14, '#c8c4bd') +
      L('M370 520H400M540 480H700V560', '#3c3936', 12) +
      P('M100 560h30v14h-30zM160 560h30v14h-30zM220 560h30v14h-30zM700 560h30v14h-30zM760 560h30v14h-30zM940 520h30v14h-30z', '#ffcf7a') +
      R(0, 600, W, 200, '#171615') + L('M0 680H1200M0 720H1200', '#2b2927', 3) + L(streaks(r, 10, 0, W, 740, 790, 60, 200), '#3a3734', 3)];
  });

  add('sala de redaccion', function (r) {
    var li = '', mo = '', ds = '', pe = '', i, y, s, x;
    for (i = 0; i < 5; i++) { y = 40 + i * i * 9 + i * 20; s = 0.4 + i * 0.25; li += 'M' + k(600 - 260 * s) + ' ' + y + 'h' + k(110 * s) + 'v' + k(10 * s) + 'h' + (-k(110 * s)) + 'zM' + k(600 + 150 * s) + ' ' + y + 'h' + k(110 * s) + 'v' + k(10 * s) + 'h' + (-k(110 * s)) + 'z'; }
    [[0.5, 430], [0.75, 500], [1.1, 610]].forEach(function (row) {
      s = row[0]; y = row[1];
      ds += 'M' + k(600 - 620 * s) + ' ' + y + 'h' + k(1240 * s) + 'v' + k(20 * s) + 'h' + (-k(1240 * s)) + 'z';
      for (x = -2; x <= 2; x++) {
        var cx = 600 + x * 240 * s + (r() - 0.5) * 40 * s;
        mo += 'M' + k(cx - 46 * s) + ' ' + k(y - 66 * s) + 'h' + k(92 * s) + 'v' + k(58 * s) + 'h' + (-k(92 * s)) + 'z';
        if (r() < 0.75) pe += bust(cx + 70 * s, y - 40 * s, 110 * s);
      }
    });
    return [lg('s', [[0, '#1d242c'], [0.5, '#39444f'], [1, '#5b6168']]) + lg('c', [[0, '#7ea8c8'], [1, '#d9c9a8']]) + glow('g', '#a9d4f0'),
      SKY + R(80, 190, 1040, 200, 'url(#c)') + P(towers(r, 80, 1120, 390, 30, 140, 40, 90), '#4d5a68') + L('M340 190V390M600 190V390M860 190V390M80 290H1120', '#20262d', 8) +
      P(li, '#f3f5ef') + R(0, 390, W, 410, '#2a3037') +
      P(mo, '#0b0f14') + P(mo, '#a9d0ea', 0.85) + C(600, 500, 500, 'url(#g)', 0.18) +
      P(ds, '#14181d') + P(pe, '#0c0f13')];
  });

  add('aula', function (r) {
    var h = '', i, j, s, y;
    for (j = 0; j < 4; j++) {
      s = 50 + j * 24; y = 470 + j * j * 14 + j * 40;
      for (i = 0; i < 5; i++) h += bust(600 + (i - 2) * s * 2.6 + (r() - 0.5) * 20 + (j % 2) * 30, y, s);
    }
    return [lg('s', [[0, '#e8dec9'], [1, '#c9bba0']]) + lg('y', [[0, '#fff', 0.6], [1, '#fff', 0]]) + blur('b', 8),
      SKY + R(990, 120, 170, 340, '#f8f4ea') + L('M1075 120V460M990 290H1160', '#9c8a6a', 8) + P('M990 160L1160 120L600 800H160z', 'url(#y)', 0.45, " filter='url(#b)'") +
      R(220, 130, 700, 300, '#7a5a3a') + R(234, 144, 672, 272, '#2f4a3e') +
      L('M300 380H560M320 400V180M330 370Q420 160 520 210', '#e9efe9', 3, 0.7) + "<circle cx='720' cy='260' r='70' fill='none' stroke='#e9efe9' stroke-width='3' opacity='.7'/>" +
      L('M650 260H790M720 190V330', '#e9efe9', 2, 0.5) + R(234, 410, 672, 10, '#5e4630') +
      P(fig(170, 600, 260), '#2c2420') + R(0, 600, W, 200, '#8a6a48') + L('M0 660H1200M0 730H1200', '#6e5236', 3) +
      P(h, '#2a221d') + P('M60 800L140 700H1060L1140 800z', '#5a4028')];
  });

  add('hospital', function (r) {
    var li = '', dr = '', i, t;
    for (i = 0; i < 6; i++) { t = Math.pow(0.68, i); li += 'M' + k(600 - 90 * t) + ' ' + k(330 - 300 * t) + 'h' + k(180 * t) + 'l' + k(-14 * t) + ' ' + k(22 * t) + 'h' + k(-152 * t) + 'z'; }
    for (i = 0; i < 3; i++) { t = Math.pow(0.6, i); dr += 'M' + k(520 - 420 * t) + ' ' + k(360 + 360 * t) + 'v' + (-k(470 * t)) + 'l' + k(90 * t) + ' ' + k(30 * t) + 'v' + k(400 * t) + 'zM' + k(680 + 420 * t) + ' ' + k(360 + 360 * t) + 'v' + (-k(470 * t)) + 'l' + (-k(90 * t)) + ' ' + k(30 * t) + 'v' + k(400 * t) + 'z'; }
    return [lg('s', [[0, '#e6ecec'], [1, '#c3cfd1']]) + lg('f', [[0, '#c9d3d4'], [1, '#7d8c90']]) + glow('g', '#ffffff'),
      SKY + P('M0 0L540 320V440L0 800z', '#b7c7ca') + P('M1200 0L660 320V440L1200 800z', '#a9babd') + P('M0 0H1200L660 320H540z', '#e9eeee') +
      P('M0 800L540 440H660L1200 800z', 'url(#f)') + R(540, 320, 120, 120, '#fbfdfd') + C(600, 380, 260, 'url(#g)', 0.7) +
      P(li, '#ffffff') + P(dr, '#6f8790') + L('M0 690L540 432M1200 690L660 432', '#8fa3a8', 6) +
      P('M760 640h300v-20q0-20 20-20h40v120H760z', '#e9eef0') + P('M760 660h360v16h-360zM780 676h12v70h-12zM1090 676h12v70h-12z', '#4b5a60') +
      L('M740 740V440M720 440h40', '#4b5a60', 4) + P('M728 450h24v44h-24z', '#cde4ea') +
      P(fig(470, 740, 300), '#2f6f78') + P(fig(610, 520, 110), '#3a4a50', 0.8)];
  });

  add('aeropuerto', function (r) {
    return [sky([[0, '#2b375a'], [0.6, '#d8865a'], [1, '#f4c58b']]) + lg('f', [[0, '#c48a64', 0.6], [1, '#0e0f14', 1]]) + glow('g', '#ffe2a8'),
      SKY + C(900, 520, 300, 'url(#g)') + P(towers(r, 0, W, 540, 10, 40, 40, 120), '#5a4050') + R(0, 540, W, 80, '#463a3c') +
      P('M260 470q0-20 40-24h460q60 0 90 24q-30 22-90 24H300q-40-4-40-24z', '#16131a') + P('M300 450L250 360h40l80 90zM520 470L600 560h50L620 470zM520 470L560 430h40l-10 40z', '#16131a') +
      R(0, 620, W, 180, 'url(#f)') +
      L('M0 40H1200M0 620H1200', '#0b0a0e', 30) + L('M150 40V620M450 40V620M750 40V620M1050 40V620M0 330H1200', '#0b0a0e', 12) +
      P(fig(340, 760, 230) + fig(392, 764, 210) + fig(820, 780, 250) + 'M420 700h46v64h-46zM850 720h50v60h-50z', '#07070a') + L('M443 700V660M875 720V670', '#07070a', 5)];
  });

  add('calle con lluvia', function (r) {
    var lamps = '', refl = '', um = '';
    [[250, 260], [430, 340], [770, 340], [950, 260]].forEach(function (p) {
      lamps += L('M' + p[0] + ' ' + p[1] + 'V' + (p[1] + 330 - (p[1] - 260) * 2), '#0a0d12', 6) + C(p[0], p[1], 110 - (p[1] - 260), 'url(#g)') + C(p[0], p[1], 8, '#fff2cc');
      refl += 'M' + (p[0] - 10) + ' 600h20v200h-20z';
    });
    [[360, 700, 200], [640, 620, 120], [860, 740, 240]].forEach(function (u) {
      um += fig(u[0], u[1], u[2]) + 'M' + k(u[0] - u[2] * 0.3) + ' ' + k(u[1] - u[2] * 0.95) + 'q' + k(u[2] * 0.3) + ' -' + k(u[2] * 0.34) + ' ' + k(u[2] * 0.6) + ' 0z';
    });
    return [sky([[0, '#0b111b'], [1, '#26303f']]) + glow('g', '#ffc870') + lg('f', [[0, '#2a3240'], [1, '#0b0e14']]) + blur('b', 6) + win('#121722', '#ffd28a') +
      "<pattern id='r' width='40' height='60' patternUnits='userSpaceOnUse'><path d='M10 0l-6 22M30 30l-6 22' stroke='#cfd8e6' stroke-width='1.4'/></pattern>",
      SKY + P('M0 0H460V560L0 640z', '#121722') + P('M0 0H460V560L0 640z', 'url(#w)', 0.5) + P('M0 0H460V560L0 640z', 'url(#q)') +
      P('M1200 0H740V560L1200 640z', '#151a25') + P('M1200 0H740V560L1200 640z', 'url(#w)', 0.4) + P('M1200 0H740V560L1200 640z', 'url(#q)') +
      P('M0 640L460 560H740L1200 640V800H0z', 'url(#f)') + P(refl, '#ffc870', 0.35, " filter='url(#b)'") +
      C(560, 575, 14, '#ff4a3a') + C(640, 575, 14, '#ff4a3a') + P('M545 600h110v-30l-20-24h-70l-20 24z', '#06080c') + P('M550 620h100v120h-100z', '#ff4a3a', 0.25, " filter='url(#b)'") +
      lamps + P(um, '#06080c') + R(0, 0, W, H, 'url(#r)', 0.35)];
  });

  add('vinedo', function (r) {
    var xs = range(-1800, 3000, 110), rows = '', g = fan(700, 420, xs, 470, 800);
    xs.forEach(function (x) { var tb = 50 / (H - 420); rows += 'M' + k(700 + (x - 700) * tb) + ' 470L' + k(x - 24) + ' 800H' + k(x + 24) + 'z'; });
    return [sky([[0, '#6a8db2'], [0.6, '#eac88e'], [1, '#f4dcad']]) + glow('g', '#fff0c0'),
      SKY + C(260, 360, 260, 'url(#g)') + P(hill(r, 380, 40, 5), '#9a8e78') + P(hill(r, 430, 30, 5), '#7c7a4f') +
      P('M840 420V392h70v28zM830 394l45-22 45 22z', '#efe3c8') + P('M830 394l45-22 45 22z', '#a0482e') +
      P('M960 430c-8-60 0-110 8-130c8 20 16 70 8 130zM1000 432c-8-50 0-90 7-110c7 20 15 60 7 110zM780 428c-7-50 0-90 7-110c7 20 15 60 7 110z', '#1f2a1a') +
      P('M-20 470Q600 450 1220 476V800H-20z', '#a5844f') + P(rows, '#3b4a22') + L(g, '#2a3618', 3)];
  });

  add('faro', function (r) {
    var bands = '';
    [[300, 330], [380, 410]].forEach(function (b) { var a = (b[0] - 200) * 0.06, c = (b[1] - 200) * 0.06; bands += 'M' + k(870 - 26 - a) + ' ' + b[0] + 'H' + k(870 + 26 + a) + 'L' + k(870 + 26 + c) + ' ' + b[1] + 'H' + k(870 - 26 - c) + 'z'; });
    return [sky([[0, '#16213a'], [0.6, '#4b6588'], [1, '#c8a68a']]) + lg('a', [[0, '#4a5f78'], [1, '#121820']]) + lg('y', [[0, '#fff6d8', 0.85], [1, '#fff6d8', 0]], 1, 0) + glow('g', '#fff2c4'),
      SKY + L(streaks(r, 40, 0, W, 20, 300, 2, 3), '#fff', 2, 0.6) +
      R(0, 500, W, 300, 'url(#a)') + L(streaks(r, 40, 0, 760, 520, 780, 30, 120), '#9fb4c8', 2, 0.35) +
      P('M870 186L-60 40V340z', 'url(#y)', 0.7) +
      P('M600 800L660 560L760 520L820 470H1210V800z', '#15191d') + P('M640 800L700 600L780 560L840 520H1210V800z', '#0c0f12') +
      P('M844 470L846 200H894L896 470z', '#ecebe5') + P(bands, '#b23a30') + P('M836 200h68v-10h-68zM846 190v-30h48v30z', '#20262c') +
      C(870, 176, 180, 'url(#g)') + C(870, 176, 14, '#fff8e0') + P('M856 160l14-20 14 20z', '#20262c') +
      L('M600 790Q630 760 660 772T720 770M560 700Q600 680 650 692', '#e9eef2', 4, 0.7)];
  });

  add('bolsa con graficos', function (r) {
    var sc = '', ln = ['', ''], ca = ['', ''], i, j, x, y, v, cx, cy;
    for (i = 0; i < 8; i++) {
      cx = 90 + (i % 4) * 260; cy = 80 + ((i / 4) | 0) * 170;
      sc += 'M' + cx + ' ' + cy + 'h240v150h-240z';
      if (i === 2 || i === 5) {
        for (j = 0; j < 12; j++) { x = cx + 14 + j * 18; v = r(); y = cy + 30 + r() * 80; ca[v < 0.5 ? 0 : 1] += 'M' + x + ' ' + k(y) + 'h10v' + k(10 + r() * 30) + 'h-10z'; }
      } else {
        var c = i % 3 === 1 ? 1 : 0, d = 'M' + (cx + 10) + ' ' + (cy + 75);
        y = cy + 75;
        for (j = 1; j <= 22; j++) { y += (r() - (c ? 0.55 : 0.45)) * 18; y = Math.max(cy + 14, Math.min(cy + 136, y)); d += 'L' + (cx + 10 + j * 10) + ' ' + k(y); }
        ln[c] += d;
      }
    }
    return [lg('s', [[0, '#0a1220'], [1, '#162a42']]) + glow('g', '#3a8ad0'),
      SKY + C(600, 260, 640, 'url(#g)', 0.35) + P(sc, '#0e1d30') + L(sc, '#3c5878', 3) +
      L(ln[0], '#4ad08a', 3) + L(ln[1], '#ff5a4a', 3) + P(ca[0], '#4ad08a') + P(ca[1], '#ff5a4a') +
      L('M100 230h220M360 230h220M620 230h220M880 230h220', '#2a3e58', 1) +
      R(0, 560, W, 240, '#0a0f18') + P('M120 520h180v110h-180zM340 520h180v110h-180zM680 520h180v110h-180zM900 520h180v110h-180z', '#6fb0e8', 0.85) +
      L('M140 590l30-20l30 10l30-30l30 16l30-26M700 600l40-10l30 20l40-40l40 10M360 560h140M920 560h140M920 580h100', '#e8f4ff', 3, 0.6) +
      P(bust(240, 630, 170) + bust(560, 640, 180) + bust(820, 620, 160) + bust(1090, 650, 190), '#04070c') + R(0, 720, W, 80, '#04070c')];
  });

  add('manifestacion con pancartas', function (r) {
    return [sky([[0, '#aab4bb'], [1, '#e3e5e2']]) + win('#8f8a82', '#c9c4ba'),
      SKY + P('M0 0H380V560L0 620z', '#8f8a82') + P('M0 0H380V560L0 620z', 'url(#w)', 0.6) + P('M0 0H380V560L0 620z', 'url(#q)') +
      P('M1200 0H820V560L1200 620z', '#7b766f') + P('M1200 0H820V560L1200 620z', 'url(#w)', 0.5) + P('M1200 0H820V560L1200 620z', 'url(#q)') +
      P(towers(r, 380, 820, 560, 120, 260, 60, 120), '#a39e95') + R(0, 540, W, 260, '#6c6862') +
      P(band(r, 586, 46), '#4a453f') +
      L('M300 600V430M560 600V430M640 590V420M900 590V420M180 600V330M1010 590V320', '#2a2622', 6) +
      P('M300 434q130-18 260 0v80q-130-18-260 0z', '#f2efe8') + P('M640 424q130-18 260 0v80q-130-18-260 0z', '#c23a2e') +
      P('M183 332h100q-20 28 0 56h-100z', '#e8b830') + P('M1013 322h110q-20 28 0 56h-110z', '#2f6a9a') +
      P(band(r, 640, 72), '#2b2723') +
      P('M220 660l16-120l16 4l-12 118zM770 650l-6-130h16l6 130zM1040 670l10-120l16 4l-6 118z', '#12100e') + P(band(r, 730, 120), '#12100e')];
  });

  add('parque eolico', function (r) {
    var t = '';
    [[300, 470, 0.7, 10], [620, 430, 0.45, 50], [860, 500, 0.9, 80], [1060, 440, 0.5, 30], [140, 420, 0.35, 70]].forEach(function (p) {
      t += "<use href='#t' transform='translate(" + p[0] + ' ' + p[1] + ') scale(' + p[2] + ")'/><use href='#r' transform='translate(" + p[0] + ' ' + k(p[1] - 300 * p[2]) + ') scale(' + p[2] + ') rotate(' + p[3] + ")'/>";
    });
    return [sky([[0, '#5a83af'], [1, '#dde6ea']]) + blur('b', 9) +
      "<path id='t' d='M-5 0L-3-300H3L5 0z' fill='#f1f3f3'/><g id='r' fill='#e9ecec'><path d='M-3 0L0-190L5 0z'/><path d='M-3 0L0-190L5 0z' transform='rotate(120)'/><path d='M-3 0L0-190L5 0z' transform='rotate(240)'/><circle r='9' fill='#cfd5d6'/></g>",
      SKY + clouds(r, 4, 60, 240) + P(hill(r, 440, 50, 5), '#8ea08a') + t +
      P(hill(r, 520, 50, 5), '#5f7d4e') + P(hill(r, 640, 60, 4), '#3e5a34') + P('M-20 740Q600 700 1220 750V800H-20z', '#2a3e24')];
  });

  add('autopista de noche', function (r) {
    return [sky([[0, '#0a0f1f'], [0.6, '#283860'], [1, '#7a5868']]) + win('#141a2a', '#ffd690') + blur('b', 5),
      SKY + P(towers(r, -10, W, 470, 60, 250, 40, 110), '#141a2a') + P(towers(r, -10, W, 470, 60, 250, 40, 110), 'url(#w)', 0.45) +
      R(0, 470, W, 330, '#0b0e16') + P('M-20 800C300 640 700 520 1220 500V560C760 590 420 700 260 800z', '#1b1f28') +
      L('M0 790C320 640 720 534 1220 514M60 800C360 654 740 548 1220 530', '#ffe8b4', 10, 0.5, " filter='url(#b)'") +
      L('M0 790C320 640 720 534 1220 514M60 800C360 654 740 548 1220 530', '#fff4d6', 3) +
      L('M160 800C430 676 780 566 1220 546M230 800C480 690 820 580 1220 558', '#ff3a2a', 10, 0.5, " filter='url(#b)'") +
      L('M160 800C430 676 780 566 1220 546M230 800C480 690 820 580 1220 558', '#ff6a50', 3) +
      L('M-20 760C300 610 700 500 1220 482', '#5a606c', 3) +
      L('M140 720V560M420 620V510M680 560V470M940 530V450', '#2a2e36', 4) + C(140, 560, 40, '#ffc870', 0.5) + C(420, 510, 30, '#ffc870', 0.5) + C(680, 470, 22, '#ffc870', 0.5) + C(940, 450, 16, '#ffc870', 0.5)];
  });

  add('incendio forestal', function (r) {
    var fl = '', fy = '', i, x;
    for (i = 0; i < 16; i++) { x = i * 80 + r() * 30 - 20; fl += 'M' + k(x) + ' 520q20-' + k(60 + r() * 80) + ' 40-' + k(120 + r() * 60) + 'q10 60 40 120z'; fy += 'M' + k(x + 20) + ' 520q14-50 24-80q8 40 26 80z'; }
    return [sky([[0, '#2a201e'], [0.5, '#8c4a2c'], [1, '#e48a3a']]) + blur('b', 10) + glow('g', '#ff9a3a'),
      SKY + P(blob(300, 300, 160) + blob(480, 220, 200) + blob(700, 160, 220) + blob(900, 120, 200) + blob(420, 400, 140), '#2e2826', 0.85, " filter='url(#b)'") +
      C(600, 520, 520, 'url(#g)', 0.6) + P(fl, '#ff8a2a', 0.9) + P(fy, '#ffe07a') +
      P(hill(r, 520, 30, 6), '#150e0c') + P(forest(r, -20, W, 600, 120, 220, 60), '#0e0908') +
      P('M-20 800V680Q600 640 1220 700V800z', '#0c0807') +
      P(fig(860, 740, 220) + 'M836 528q24-22 48 0h10v8h-68v-8z', '#050303') + L('M880 640Q980 600 1060 520', '#050303', 10) +
      L('M1060 520Q1100 500 1150 470', '#d8e4ea', 6, 0.5)];
  });

  /* ---------- retratos ---------- */
  var PBG = [['#9fb2c4', '#4d5f72'], ['#d9c6a6', '#7a6248'], ['#b9c4b0', '#55644a'], ['#c8b4b8', '#6a4f58'],
    ['#a9b8c0', '#3a4a56'], ['#d6cfc2', '#6e6658'], ['#b4aac4', '#4e4462'], ['#c9b89a', '#5a4a36']];
  var HAIR = [
    'M128 172C122 92 278 92 272 172C262 128 140 128 128 172z',
    'M122 170C110 80 290 80 278 170L300 330H100z',
    'M128 168C122 96 278 96 272 168C262 126 140 126 128 168zM166 92a34 30 0 1 1 68 0a34 30 0 1 1-68 0',
    '',
    'M130 160a26 26 0 0 1 20-50a30 30 0 0 1 50-20a30 30 0 0 1 50 20a26 26 0 0 1 20 50C260 124 140 124 130 160z',
    'M128 166C124 100 276 100 272 166C250 120 160 122 128 166zM136 200Q140 300 200 302Q260 300 264 200Q250 262 200 264Q150 262 136 200z',
    'M120 176C108 76 292 76 280 176L286 262H254L262 160Q200 120 138 160L146 262H114z',
    'M130 170C122 98 278 98 270 170C250 136 150 136 130 170zM262 140Q330 180 300 290Q290 220 262 190z'
  ];
  var CLOTH = [
    "<path d='M160 300L200 392L240 300z' fill='#e9e6e0'/><path d='M196 320h8l6 72h-20z' fill='#7a2a2a'/>",
    "<path d='M170 296Q200 330 230 296V312Q200 346 170 312z' fill='#00000033'/>",
    "<path d='M150 300L200 400L250 300L238 296L200 360L162 296z' fill='#ffffff30'/>",
    "<path d='M168 290h64v36q-32 16-64 0z' fill='#00000040'/>"
  ];
  function portrait(i) {
    i = ((i % 8) + 8) % 8;
    var bg = PBG[i], dark = '#24242b';
    var sil = "<path d='M30 400C30 318 110 292 200 292C290 292 370 318 370 400z'/><path d='M170 230h60v76h-60z'/><ellipse cx='200' cy='180' rx='70' ry='86'/>" +
      (HAIR[i] ? "<path d='" + HAIR[i] + "'/>" : '');
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400' preserveAspectRatio='xMidYMid slice'><defs>" +
      rg('b', [[0, bg[0]], [1, bg[1]]], 0.35, 0.3, 0.9) + rg('h', [[0, '#5a5a64'], [1, dark]], 0.3, 0.25, 0.8) + '</defs>' +
      "<rect width='400' height='400' fill='url(#b)'/>" +
      (i === 1 || i === 6 ? "<path d='" + HAIR[i] + "' fill='" + dark + "'/>" : '') +
      "<g fill='#ffffff' opacity='.35' transform='translate(-5 -3)'>" + sil + '</g>' +
      "<g fill='url(#h)'>" + sil + '</g>' + CLOTH[i % 4] + '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /* ---------- montaje ---------- */
  var cache = {};
  function build(i) {
    var sc = S[i], out = sc.f(rng(i * 7919 + 13));
    return "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800' preserveAspectRatio='xMidYMid slice'><defs>" + out[0] +
      rg('vg', [[0.55, '#000', 0], [1, '#000', 0.45]], 0.5, 0.5, 0.75) + '</defs>' + out[1] + "<rect width='1200' height='800' fill='url(#vg)'/></svg>";
  }
  function idx(i) { i = Math.floor(Number(i) || 0); return ((i % S.length) + S.length) % S.length; }

  WB.scenes = {
    count: S.length,
    list: S.map(function (s) { return s.n; }),
    svg: function (i) { return build(idx(i)); },
    url: function (i) {
      var j = idx(i);
      if (!cache[j]) cache[j] = 'data:image/svg+xml;utf8,' + encodeURIComponent(build(j));
      return cache[j];
    },
    portrait: portrait
  };
})();
