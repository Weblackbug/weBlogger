// Comprueba un grupo de fichas de estilo:  node herramientas/comprobar-estilos.mjs <grupo> [cuantas]
import { sandbox, exists, BANNED, MASTS, mastKey, MAQUETAS, finish } from './_comun.mjs';

const grupo = process.argv[2];
const expected = +process.argv[3] || 0;
const file = 'dist/js/estilos/' + grupo + '.js';
if (!grupo || !exists(file)) { console.error('falta ' + file); process.exit(1); }

const { ctx, run, WB } = sandbox();
const S = WB.styles;
let raw = [], gid = '', gname = '';
const original = WB.addStyles;
WB.addStyles = (id, name, list) => { gid = id; gname = name; raw = raw.concat(list || []); original(id, name, list); };
run(file);

const err = [], warn = [];
const hex = /^#[0-9a-f]{6}$/i;
if (gid !== grupo) err.push('el primer argumento de WB.addStyles tiene que ser "' + grupo + '" (es "' + gid + '")');
if (!gname || gname.length < 4) err.push('falta el nombre del grupo');
if (expected && raw.length !== expected) err.push('tiene que haber exactamente ' + expected + ' fichas y hay ' + raw.length);

const seen = { id: new Set(), name: new Set(), mast: new Set(), sig: new Set() };
const contrast = (a, b) => { const x = S.lum(a) + 0.05, y = S.lum(b) + 0.05; return Math.max(x, y) / Math.min(x, y); };

raw.forEach((r, i) => {
  const tag = '#' + (i + 1) + ' ' + (r && r.id || '(sin id)') + ': ';
  if (!r || typeof r !== 'object') { err.push(tag + 'no es un objeto'); return; }
  if (!new RegExp('^' + grupo + '-\\d{3}$').test(r.id || '')) err.push(tag + 'el id tiene que ser ' + grupo + '-001, ' + grupo + '-002...');
  for (const [k, set] of [['id', seen.id], ['name', seen.name], ['mast', seen.mast]]) {
    const v = String(r[k] || '').toLowerCase();
    if (set.has(v)) err.push(tag + k + ' repetido: «' + r[k] + '»');
    set.add(v);
  }
  if (typeof r.name !== 'string' || r.name.length < 4 || r.name.length > 42) err.push(tag + 'name: de 4 a 42 caracteres');
  if (typeof r.ref !== 'string' || r.ref.length < 20 || r.ref.length > 120) err.push(tag + 'ref: de 20 a 120 caracteres (que tradicion recoge y que lo distingue)');
  if (typeof r.mast !== 'string' || r.mast.length < 3 || r.mast.length > 26) err.push(tag + 'mast: nombre de cabecera inventado, de 3 a 26 caracteres');
  if (!MAQUETAS.includes(r.maqueta)) err.push(tag + 'maqueta desconocida: ' + r.maqueta + ' (valen: ' + MAQUETAS.join(', ') + ')');
  for (const k of ['display', 'body', 'ui']) if (!WB.fontByName(r[k])) err.push(tag + k + ': fuente fuera de WB.FONTS: ' + r[k]);
  if (r.cabFont && !WB.fontByName(r.cabFont)) err.push(tag + 'cabFont fuera de WB.FONTS: ' + r.cabFont);
  if (!Array.isArray(r.c) || r.c.length !== 4 || !r.c.every(x => hex.test(x))) err.push(tag + 'c: cuatro colores #rrggbb [papel, tinta, acento, segundo acento]');
  else {
    if (S.lum(r.c[0]) < 0.6) err.push(tag + 'el papel (c[0]) tiene que ser claro');
    if (contrast(r.c[0], r.c[1]) < 9) err.push(tag + 'poca diferencia entre papel y tinta (contraste ' + contrast(r.c[0], r.c[1]).toFixed(1) + ', minimo 9)');
    if (contrast(r.c[0], r.c[2]) < 3) err.push(tag + 'el acento (c[2]) no se lee sobre el papel (contraste ' + contrast(r.c[0], r.c[2]).toFixed(1) + ', minimo 3)');
  }
  if (!r.t || typeof r.t !== 'object') err.push(tag + 'falta t (los parametros)');
  else Object.keys(r.t).forEach(k => {
    const allowed = S.TOKENS[k];
    if (!allowed) { err.push(tag + 't.' + k + ' no existe (valen: ' + Object.keys(S.TOKENS).join(', ') + ')'); return; }
    if (!allowed.includes(String(r.t[k]))) err.push(tag + 't.' + k + '="' + r.t[k] + '" no vale (valen: ' + allowed.join(', ') + ')');
  });
  if (r.t && r.t.cab === 'manuscrita' && !(r.cabFont && ['Pacifico', 'Dancing Script', 'Caveat'].includes(r.cabFont))) err.push(tag + 'con cab "manuscrita" hace falta cabFont: Pacifico, Dancing Script o Caveat');
  const hit = BANNED.exec([r.name, r.ref, r.mast].join(' · '));
  if (hit) err.push(tag + 'nombra una cabecera real: «' + hit[0].trim() + '»');
  if (MASTS.has(mastKey(r.mast))) err.push(tag + 'mast «' + r.mast + '» es el nombre de una cabecera que existe: inventa otro');
  const sig = JSON.stringify([r.display, r.body, r.c, r.t, r.maqueta]);
  if (seen.sig.has(sig)) err.push(tag + 'es identica a otra ficha (mismas fuentes, colores, parametros y maqueta)');
  seen.sig.add(sig);
});

const distinct = f => new Set(raw.map(f)).size;
if (raw.length >= 40) {
  if (distinct(r => r.maqueta) < 6) err.push('poca variedad: usa al menos 6 maquetas distintas (hay ' + distinct(r => r.maqueta) + ')');
  if (distinct(r => r.display) < 9) err.push('poca variedad: usa al menos 9 fuentes de titulares distintas (hay ' + distinct(r => r.display) + ')');
  if (distinct(r => r.t && r.t.cab) < 5) err.push('poca variedad: usa al menos 5 tipos de cabecera (hay ' + distinct(r => r.t && r.t.cab) + ')');
  if (distinct(r => r.c && r.c[2]) < raw.length * 0.5) err.push('demasiados acentos repetidos: al menos la mitad de las fichas con un acento propio');
  if (distinct(r => r.c && r.c[0]) < 6) warn.push('casi todos los papeles son del mismo color: hay papel salmon, crema, gris, marfil...');
}
finish(grupo + ' · ' + gname + ' · ' + raw.length + ' fichas', err, warn);
