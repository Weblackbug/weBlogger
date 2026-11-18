// Comprueba una maqueta:  node herramientas/comprobar-maqueta.mjs <id>
// La compone con varias fichas distintas y con el banco de textos grande y
// con el minimo, y revisa el HTML que sale.
import { sandbox, exists, checkHtml, finish } from './_comun.mjs';

const id = process.argv[2];
const file = 'dist/js/maquetas/' + id + '.js';
if (!id || !exists(file)) { console.error('falta ' + file); process.exit(1); }

const err = [], warn = [];
const TITLE = 'Titular de prueba <con> "comillas" & $& signos';

function variants(withBank) {
  const { WB, run } = sandbox(withBank && exists('dist/js/banco.js') ? ['dist/js/banco.js'] : []);
  run(file);
  const l = WB.styles.layouts[id];
  if (!l) { err.push('el archivo no llama a WB.addLayout con id "' + id + '"'); return; }
  if (typeof l.name !== 'string' || l.name.length < 3) err.push('falta name');
  if (typeof l.desc !== 'string' || l.desc.length < 20) err.push('falta desc (una frase)');
  const base = { maqueta: id, display: 'Playfair Display', body: 'Source Serif 4', ui: 'Inter', c: ['#ffffff', '#111111', '#b00020', '#1a5a96'] };
  WB.addStyles('prueba', 'Prueba', [
    Object.assign({ id: 'prueba-001', name: 'Prueba uno', mast: 'La <Prueba> & Cía', t: {} }, base),
    Object.assign({ id: 'prueba-002', name: 'Prueba dos', mast: 'El Segundo', t: { cab: 'banda', filetes: 'gruesos', tit: 'condensada', dens: 'densa', alin: 'centro' } }, base),
    Object.assign({ id: 'prueba-003', name: 'Prueba tres', mast: 'Tercera Voz', t: { cab: 'gotica', filetes: 'ninguno', dens: 'aireada', foto: 'bn' } }, base)
  ]);
  const out = [];
  WB.styles.list.forEach(st => {
    let html = '';
    try { html = WB.styles.build(st, TITLE); } catch (e) { err.push('build() lanza con la ficha ' + st.id + (withBank ? '' : ' y el banco minimo') + ': ' + e.message); return; }
    checkHtml(html, { minSections: 2, minImgs: 3, minWords: withBank ? 420 : 250 }).forEach(e => err.push((withBank ? '' : '[banco minimo] ') + e));
    if (!html.includes('Titular de prueba &lt;con&gt;')) err.push('el titular recibido (ctx.title, ya escapado) no aparece en la pagina');
    if (!html.includes('La &lt;Prueba&gt; &amp; Cía') && st.id === 'prueba-001') err.push('la cabecera del estilo (ctx.mast, o ctx.nameplate()) no aparece en la pagina');
    if (!/class="np-(grid|cover|between)/.test(html) && !/class="wb-flow/.test(html)) err.push('no usa ninguna pieza del kit de diario (np-grid, np-cover, np-between, wb-flow)');
    out.push(html);
  });
  return out;
}

const big = variants(true) || [];
variants(false);
if (big.length > 1 && big[0].replace(/[a-z0-9]{5}"/g, '"') === big[1].replace(/[a-z0-9]{5}"/g, '"')) warn.push('dos fichas distintas dan exactamente la misma pagina: usa ctx.take() para que cada estilo empiece en un punto distinto del banco');
if (!exists('dist/js/banco.js') || big.length === 0) warn.push('todavia no existe dist/js/banco.js completo: se ha probado con el banco minimo');
finish(id + ' · ' + (big[0] ? big[0].length + ' caracteres de HTML' : 'sin HTML'), err, warn);
