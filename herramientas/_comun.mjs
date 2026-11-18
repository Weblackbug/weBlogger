// Utilidades comunes de los comprobadores.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const MAQUETAS = ['sabana', 'referencia', 'tabloide', 'modular', 'revista', 'reportaje', 'rosa', 'financiero', 'deportivo', 'cultural', 'local', 'digital'];

export { BANNED, MASTS, mastKey } from './_lista.mjs';
import { BANNED } from './_lista.mjs';

/** Contexto aislado con el catalogo y el motor de estilos cargados. */
export function sandbox(extra = []) {
  const ctx = vm.createContext({ WB: {}, encodeURIComponent, JSON, Math, Date, Object, Array, String, Number, RegExp, console, Uint8Array, TextEncoder, TextDecoder });
  ctx.window = ctx;
  const run = rel => vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), ctx, { filename: rel });
  run('dist/js/bloques.js');
  run('dist/js/estilos.js');
  extra.forEach(run);
  return { ctx, run, WB: ctx.WB };
}

export function exists(rel) { return fs.existsSync(path.join(root, rel)); }

/** Revisa el HTML que compone una maqueta o un formato. Devuelve la lista de errores. */
export function checkHtml(html, o = {}) {
  const err = [];
  if (typeof html !== 'string' || html.length < 1500) { err.push('devuelve muy poco HTML'); return err; }
  if (!/<main class="article-wrapper[^"]*\bno-toc\b[^"]*">/.test(html)) err.push('falta <main class="article-wrapper no-toc np-wide">');
  if (!/<article class="article-content">/.test(html)) err.push('falta <article class="article-content">');
  if (/<script/i.test(html)) err.push('el HTML no puede llevar <script>');
  if (/\son[a-z]+\s*=/i.test(html.replace(/data-[\w-]+="[^"]*"/g, ''))) err.push('el HTML no puede llevar manejadores en linea');
  if (/contenteditable|data-i18n/.test(html)) err.push('no pongas contenteditable ni data-i18n');
  if (/undefined|\[object Object\]|NaN/.test(html.replace(/<[^>]+>/g, ' '))) err.push('en el texto aparece «undefined», «[object Object]» o «NaN»: falta algun dato del banco');

  const voidTags = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source']);
  const stack = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[2].toLowerCase();
    if (voidTags.has(tag) || /\/\s*$/.test(m[3])) continue;
    if (!m[1]) stack.push(tag);
    else {
      const top = stack.pop();
      if (top !== tag) { err.push('etiquetas mal cerradas: </' + tag + '> con <' + top + '> abierta, cerca de «' + html.slice(Math.max(0, m.index - 70), m.index + 20).replace(/\s+/g, ' ') + '»'); break; }
    }
  }
  if (stack.length) err.push('etiquetas sin cerrar: ' + stack.slice(-4).join(', '));

  const sections = html.match(/<section class="article-section[^"]*"[^>]*>/g) || [];
  if (sections.length < (o.minSections || 2)) err.push('tiene que haber al menos ' + (o.minSections || 2) + ' <section class="article-section" id="...">');
  sections.forEach(s => { if (!/\sid="[^"]+"/.test(s)) err.push('seccion sin id: ' + s); });
  const ids = (html.match(/\sid="([^"]+)"/g) || []).map(s => s.slice(5, -1));
  if (new Set(ids).size !== ids.length) err.push('hay id repetidos: ' + ids.filter((x, i) => ids.indexOf(x) !== i).join(', '));
  if ((html.match(/<img /g) || []).length < (o.minImgs || 3)) err.push('pocas imagenes (minimo ' + (o.minImgs || 3) + ')');
  if (/<img (?![^>]*\balt=)/.test(html)) err.push('hay <img> sin atributo alt');
  if (/src="https?:/.test(html)) err.push('las imagenes tienen que ser la de relleno, no direcciones de internet');
  const text = html.replace(/<[^>]+>/g, ' ');
  const hit = BANNED.exec(text);
  if (hit) err.push('aparece el nombre de una cabecera real: «' + hit[0] + '»');
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < (o.minWords || 300)) err.push('poco texto (' + words + ' palabras; minimo ' + (o.minWords || 300) + ')');
  return err;
}

export function finish(label, errors, warns = []) {
  warns.forEach(w => console.log('aviso: ' + w));
  const uniq = [...new Set(errors)];
  if (uniq.length) { uniq.slice(0, 40).forEach(e => console.log('ERROR: ' + e)); if (uniq.length > 40) console.log('... y ' + (uniq.length - 40) + ' mas'); process.exit(1); }
  console.log('OK ' + label);
}
