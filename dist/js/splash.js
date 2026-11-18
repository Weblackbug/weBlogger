/* ==========================================================================
   weBlogger - gelatina del splash.

   Una transformacion CSS solo sabe escalar, girar o sesgar: la imagen seguiria
   siendo un rectangulo rigido. Aqui la imagen se pinta sobre una malla de
   WebGL y cada vertice se mueve por su cuenta, asi que los bordes se curvan:
   se ladea mas cuanto mas arriba, se aplasta abombandose por los lados y la
   recorren ondas, todo cada vez mas flojo hasta quedarse quieta a los 3 s.
   Sin WebGL queda la animacion CSS de reserva.
   ========================================================================== */
(function () {
  'use strict';

  var img = document.getElementById('splashImg');
  var cv = document.getElementById('splashGL');
  var PAD = 0.22;            // margen del lienzo alrededor de la imagen (ver editor.css)
  var COLS = 48, ROWS = 28;
  var DUR = 3000;
  var RADIUS = 16;

  var gl = null, uT = null, uSize = null;
  var raf = 0, t0 = 0, count = 0;
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var FX = WB.splashFx = { startedAt: 0, DUR: DUR, webgl: false };

  var VS = [
    'attribute vec2 a;',
    'uniform mediump float t;',   // misma precision en los dos sombreadores
    'varying vec2 uv;',
    'const float PAD = ' + PAD.toFixed(2) + ';',
    'const float TAU = 6.2831853;',
    'void main() {',
    '  uv = a;',
    '  float env = exp(-1.25 * t) * (1.0 - smoothstep(2.3, 3.0, t));',   // se va calmando y acaba quieta
    '  float pop = 1.0 - 0.45 * exp(-9.0 * t);',                         // entra creciendo
    '  float h = 1.0 - a.y;',                                            // altura sobre la base
    '  float cx = a.x - 0.5;',
    '  float w = TAU * 2.1;',
    '  float sway = 0.17 * env * sin(w * t);',
    '  float squash = 0.20 * env * sin(w * 1.31 * t + 1.2);',
    '  float tilt = 0.08 * env * sin(w * 0.83 * t + 2.0);',
    '  vec2 p = a;',
    // se ladea: la base aguanta y lo de arriba se va, en curva
    '  p.x += sway * pow(h, 1.7);',
    // cabecea: un lado sube y el otro baja, mas cuanto mas arriba
    '  p.y += tilt * cx * 2.0 * (0.4 + 0.6 * h);',
    // se aplasta contra la base y se abomba por los costados
    '  p.y += squash * h * 0.55;',
    '  p.x += squash * cx * (0.25 + 0.75 * sin(3.14159265 * a.y));',
    // ondas que recorren el cuerpo: los bordes dejan de ser rectos
    '  p.x += 0.036 * env * sin(TAU * a.y * 1.4 - w * 1.7 * t);',
    '  p.y += 0.046 * env * sin(TAU * a.x * 1.2 - w * 1.45 * t + 0.8) * (0.35 + 0.65 * h);',
    '  p.x += 0.018 * env * sin(TAU * (a.x + a.y) * 1.1 + w * 2.3 * t) * h;',
    '  p = (p - vec2(0.5, 1.0)) * pop + vec2(0.5, 1.0);',
    '  vec2 q = (p + PAD) / (1.0 + 2.0 * PAD);',
    '  gl_Position = vec4(q.x * 2.0 - 1.0, 1.0 - q.y * 2.0, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FS = [
    'precision mediump float;',
    'varying vec2 uv;',
    'uniform sampler2D tex;',
    'uniform vec2 size;',
    'uniform mediump float t;',   // misma precision en los dos sombreadores
    'void main() {',
    '  vec4 c = texture2D(tex, uv);',
    // esquinas redondeadas, que se deforman con la malla
    '  vec2 pc = (uv - 0.5) * size;',
    '  vec2 d = abs(pc) - (size * 0.5 - ' + RADIUS.toFixed(1) + ');',
    // distancia al borde en pixeles: negativa por dentro
    '  float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - ' + RADIUS.toFixed(1) + ';',
    '  float al = 1.0 - smoothstep(-1.0, 1.0, sd);',
    // marco luminoso: un filete azul que recorre el borde y se deforma con la
    // gelatina, con un resplandor hacia dentro y un brillo que da vueltas
    '  float ang = atan(pc.y, pc.x);',
    '  float run = 0.5 + 0.5 * sin(ang * 2.0 - t * 2.4);',
    '  vec3 rim = mix(vec3(0.10, 0.48, 1.0), vec3(0.50, 0.90, 1.0), run);',
    '  float line = 1.0 - smoothstep(2.6, 4.2, -sd);',
    '  float inner = 1.0 - smoothstep(6.5, 8.0, abs(-sd - 11.0) + 6.2);',   // segundo filete fino, mas adentro
    '  float glow = exp(sd / 22.0);',
    '  vec3 col = c.rgb + rim * glow * 0.42;',
    '  col = mix(col, rim, line);',
    '  col = mix(col, rim, inner * 0.55);',
    '  al *= smoothstep(0.0, 0.22, t);',
    '  gl_FragColor = vec4(col * al, al);',
    '}'
  ].join('\n');

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function init() {
    gl = cv.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) throw new Error('sin WebGL');

    var prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    var verts = [], idx = [];
    for (var y = 0; y <= ROWS; y++) for (var x = 0; x <= COLS; x++) verts.push(x / COLS, y / ROWS);
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var i = r * (COLS + 1) + c;
      idx.push(i, i + 1, i + COLS + 1, i + 1, i + COLS + 2, i + COLS + 1);
    }
    count = idx.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    uT = gl.getUniformLocation(prog, 't');
    uSize = gl.getUniformLocation(prog, 'size');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    FX.webgl = true;
    cv.hidden = false;
    img.classList.add('is-ghost');   // sigue ocupando su sitio, pero la que se ve es la malla
  }

  function draw(seconds) {
    var w = img.clientWidth, hh = img.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw = Math.round(w * (1 + 2 * PAD) * dpr), ch = Math.round(hh * (1 + 2 * PAD) * dpr);
    if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
    gl.viewport(0, 0, cw, ch);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uT, seconds);
    gl.uniform2f(uSize, w, hh);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
  }

  function frame(now) {
    var ms = now - t0;
    if (ms >= DUR) { draw(DUR / 1000); raf = 0; return; }
    draw(ms / 1000);
    raf = requestAnimationFrame(frame);
  }

  /** Empieza (o repite) los 3 segundos de gelatina. */
  FX.play = function () {
    FX.startedAt = Date.now();
    if (!FX.webgl) {
      img.classList.remove('is-jelly');
      void img.offsetWidth;
      if (!calm) img.classList.add('is-jelly');
      return;
    }
    cancelAnimationFrame(raf);
    if (calm) { draw(DUR / 1000); return; }
    t0 = performance.now();
    raf = requestAnimationFrame(frame);
  };

  window.addEventListener('resize', function () {
    if (FX.webgl && !raf) draw(DUR / 1000);
  });

  function boot() {
    try { init(); } catch (e) { gl = null; FX.webgl = false; FX.error = String(e && e.message || e); }
    FX.play();
  }

  if (img.complete && img.naturalWidth) boot();
  else {
    img.addEventListener('load', boot);
    img.addEventListener('error', function () { FX.play(); });
  }
})();
