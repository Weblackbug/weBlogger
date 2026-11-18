// Comprueba el banco de textos de muestra:  node herramientas/comprobar-banco.mjs
import { sandbox, exists, BANNED, finish } from './_comun.mjs';

if (!exists('dist/js/banco.js')) { console.error('falta dist/js/banco.js'); process.exit(1); }
const { WB } = sandbox(['dist/js/banco.js']);
const B = WB.bank, err = [], warn = [];

const NEED = {
  secciones: [8, x => typeof x === 'string' && x.length > 2],
  noticias: [48, x => x.sec && x.tit && x.sum && Array.isArray(x.txt) && x.txt.length >= 3 && x.txt.every(p => typeof p === 'string' && p.length > 120) && x.firma && x.lugar],
  opinion: [20, x => x.autor && x.tit && x.frase],
  breves: [36, x => x.tit && x.txt],
  citas: [20, x => x.txt && x.autor],
  cifras: [24, x => x.v && x.l],
  entrevistas: [6, x => x.quien && x.cargo && Array.isArray(x.qa) && x.qa.length >= 5 && x.qa.every(q => q.p && q.r)],
  cronologias: [6, x => x.tit && Array.isArray(x.hitos) && x.hitos.length >= 5 && x.hitos.every(h => h.f && h.t)],
  rosa: [20, x => x.tit && x.sum && Array.isArray(x.txt) && x.txt.length >= 2],
  deportes: [16, x => x.tit && x.sum && Array.isArray(x.txt) && x.txt.length >= 2 && x.marcador && x.marcador.local && x.marcador.visit && Number.isInteger(x.marcador.gl) && Number.isInteger(x.marcador.gv)],
  mercados: [14, x => x.n && x.v && x.d],
  agenda: [14, x => x.d && x.t && x.l]
};

Object.keys(NEED).forEach(k => {
  const [min, ok] = NEED[k];
  const arr = B[k];
  if (!Array.isArray(arr)) { err.push('falta WB.bank.' + k); return; }
  if (arr.length < min) err.push(k + ': hacen falta al menos ' + min + ' y hay ' + arr.length);
  arr.forEach((x, i) => { if (!ok(x)) err.push(k + '[' + i + '] incompleto o demasiado corto: ' + JSON.stringify(x).slice(0, 90)); });
  const titles = arr.map(x => (typeof x === 'string' ? x : x.tit || x.txt || x.n || x.v || x.quien || x.t || '').toLowerCase());
  titles.forEach((t, i) => { if (t && titles.indexOf(t) !== i) err.push(k + ': repetido «' + t.slice(0, 50) + '»'); });
});

const all = JSON.stringify(B);
const hit = BANNED.exec(all.replace(/\\n/g, ' '));
if (hit) err.push('aparece una cabecera real: «' + hit[0] + '»');
if (/lorem ipsum/i.test(all)) err.push('nada de lorem ipsum');
const secs = new Set((B.noticias || []).map(n => n.sec));
if (secs.size < 8) err.push('las noticias tienen que repartirse entre al menos 8 secciones (hay ' + secs.size + ')');
const words = all.split(/\s+/).length;
if (words < 9000) warn.push('el banco es corto (' + words + ' palabras): con 500 estilos los textos se repetiran mucho');
finish('banco · ' + words + ' palabras · ' + (B.noticias || []).length + ' noticias', err, warn);
