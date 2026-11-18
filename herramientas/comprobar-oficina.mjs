// Comprueba dist/js/oficina.js:  node herramientas/comprobar-oficina.mjs [carpeta-de-salida]
// Convierte una publicacion de muestra a todos los formatos y revisa por dentro
// lo que sale (estructura del ZIP, CRC, XML bien formado, textos presentes).
// Con una carpeta, deja ademas los archivos para abrirlos a mano.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { root, exists, finish } from './_comun.mjs';

if (!exists('dist/js/oficina.js')) { console.error('falta dist/js/oficina.js'); process.exit(1); }
const ctx = vm.createContext({ WB: {}, Uint8Array, Uint16Array, Uint32Array, ArrayBuffer, DataView, TextEncoder, TextDecoder, JSON, Math, Date, String, Array, Object, Number, RegExp, console, btoa: s => Buffer.from(s, 'binary').toString('base64') });
ctx.window = ctx;
vm.runInContext(fs.readFileSync(path.join(root, 'dist/js/oficina.js'), 'utf8'), ctx, { filename: 'oficina.js' });
const O = ctx.WB.office;
const err = [], warn = [];
if (!O) { console.error('oficina.js no define WB.office'); process.exit(1); }

const PNG = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFElEQVR4nGP8z8DAwMDAxMDAwMAAAA0GAQGZc1tFAAAAAElFTkSuQmCC', 'base64'));
const model = {
  title: 'La Gaceta de prueba: «ñandú» & <cía>', lang: 'es', creator: 'weBlogger',
  pages: [
    { name: 'Portada', title: 'Portada', blocks: [
      { t: 'p', runs: [{ text: 'INTERNACIONAL' }], cls: 'kicker', align: '' },
      { t: 'h', level: 1, runs: [{ text: 'El titular con tildes: áéíóú ñ ¿? ¡! «» — € & < >' }] },
      { t: 'p', runs: [{ text: 'La entradilla resume la noticia.' }], cls: 'lead', align: '' },
      { t: 'p', runs: [{ text: 'Texto normal, ' }, { text: 'negrita', b: true }, { text: ', ' }, { text: 'cursiva', i: true }, { text: ', ' }, { text: 'subrayado', u: true }, { text: ', ' }, { text: 'tachado', s: true }, { text: ', x' }, { text: '2', sup: true }, { text: ', H' }, { text: '2', sub: true }, { text: 'O, ' }, { text: 'rojo', color: '#cc0000' }, { text: ' y ' }, { text: 'un enlace', link: 'https://example.org/a?b=1&c=2' }, { text: '.\nSegunda línea.' }], cls: '', align: 'justify' },
      { t: 'img', name: 'imagen-1.png', mime: 'image/png', data: PNG, url: null, w: 1200, h: 700, caption: 'Pie de la imagen incrustada · Archivo', alt: 'una foto' },
      { t: 'img', name: '', mime: '', data: null, url: 'https://example.org/foto.jpg', w: 0, h: 0, caption: 'Pie de la imagen enlazada', alt: '' },
      { t: 'quote', runs: [{ text: 'Una cita destacada' }], cite: 'Quien la dijo' },
      { t: 'list', ordered: false, items: [[{ text: 'Primer punto' }], [{ text: 'Segundo ' }, { text: 'punto', b: true }]] },
      { t: 'list', ordered: true, items: [[{ text: 'Paso uno' }], [{ text: 'Paso dos' }]] },
      { t: 'table', head: [[[{ text: 'Puerto' }], [{ text: 'Pleamar' }]]], rows: [[[{ text: 'Albamar' }], [{ text: '6.42' }]], [[{ text: 'Cendra' }], [{ text: '7.05' }]]] },
      { t: 'rule' },
      { t: 'p', runs: [{ text: 'codigo(); // ancho fijo' }], cls: 'code', align: '' },
      { t: 'p', runs: [{ text: 'Nota al pie.' }], cls: 'note', align: 'center' }
    ] },
    { name: 'Segunda página', title: 'Reportaje', blocks: [
      { t: 'h', level: 2, runs: [{ text: 'Titular de la segunda página' }] },
      { t: 'p', runs: [{ text: 'Texto de la segunda página.' }], cls: '', align: '' },
      { t: 'h', level: 3, runs: [{ text: 'Un ladillo' }] },
      { t: 'h', level: 4, runs: [{ text: 'Un título menor' }] }
    ] }
  ]
};

/* ---- lector de ZIP minimo, con CRC ---- */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }; })();
function readZip(bytes, label) {
  const out = [];
  if (!(bytes instanceof Uint8Array) && !(bytes && bytes.constructor && bytes.constructor.name === 'Uint8Array')) { err.push(label + ': no devuelve un Uint8Array'); return out; }
  const b = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = b.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) { err.push(label + ': no es un ZIP (falta el final del directorio)'); return out; }
  const n = b.readUInt16LE(eocd + 10), dirOff = b.readUInt32LE(eocd + 16);
  let p = dirOff;
  for (let i = 0; i < n; i++) {
    if (b.readUInt32LE(p) !== 0x02014b50) { err.push(label + ': directorio central corrupto'); break; }
    const method = b.readUInt16LE(p + 10), crc = b.readUInt32LE(p + 16), size = b.readUInt32LE(p + 20), usize = b.readUInt32LE(p + 24);
    const nl = b.readUInt16LE(p + 28), el = b.readUInt16LE(p + 30), cl = b.readUInt16LE(p + 32), off = b.readUInt32LE(p + 42);
    const name = b.slice(p + 46, p + 46 + nl).toString('utf8');
    if (b.readUInt32LE(off) !== 0x04034b50) err.push(label + ': cabecera local corrupta en ' + name);
    const lnl = b.readUInt16LE(off + 26), lel = b.readUInt16LE(off + 28);
    const data = b.slice(off + 30 + lnl + lel, off + 30 + lnl + lel + size);
    if (method !== 0) err.push(label + ': ' + name + ' va comprimido (metodo ' + method + '); tiene que ir sin comprimir');
    else if (size !== usize || CRC(data) !== crc) err.push(label + ': CRC o tamano incorrecto en ' + name);
    out.push({ name, data, off });
    p += 46 + nl + el + cl;
  }
  return out;
}
function xmlOk(text, label) {
  const stack = [];
  const re = /<(\/?)([A-Za-z_][\w:.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let m;
  const body = text.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<!DOCTYPE[^>]*>/g, '');
  while ((m = re.exec(body))) {
    if (/\/\s*$/.test(m[3])) continue;
    if (!m[1]) stack.push(m[2]);
    else if (stack.pop() !== m[2]) { err.push(label + ': XML mal formado cerca de «' + body.slice(Math.max(0, m.index - 50), m.index + 30).replace(/\s+/g, ' ') + '»'); return; }
  }
  if (stack.length) err.push(label + ': XML sin cerrar: ' + stack.slice(-3).join(', '));
  if (/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.test(body)) err.push(label + ': hay un & sin escapar');
}
const call = (name, fn) => { try { return fn(); } catch (e) { err.push(name + '() lanza: ' + e.message); return null; } };
const outDir = process.argv[2];
const save = (name, data) => { if (outDir) { fs.mkdirSync(outDir, { recursive: true }); fs.writeFileSync(path.join(outDir, name), data); } };

['zip', 'docx', 'epub', 'wordDoc', 'markdown', 'text'].forEach(k => { if (typeof O[k] !== 'function') err.push('falta WB.office.' + k); });
if (!err.length) {
  /* zip */
  const z = call('zip', () => O.zip([{ name: 'a.txt', data: 'hola ñ' }, { name: 'dir/b.bin', data: new Uint8Array([1, 2, 3]) }]));
  if (z) { const e = readZip(z, 'zip'); if (e.length !== 2 || e[0].data.toString('utf8') !== 'hola ñ') err.push('zip: no conserva los archivos o no codifica el texto en UTF-8'); }

  /* docx */
  const dx = call('docx', () => O.docx(model));
  if (dx) {
    save('prueba.docx', dx);
    const e = readZip(dx, 'docx'), names = e.map(x => x.name);
    ['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/_rels/document.xml.rels', 'word/styles.xml'].forEach(n => { if (!names.includes(n)) err.push('docx: falta ' + n); });
    if (!names.some(n => /^word\/media\/.+\.png$/.test(n))) err.push('docx: la imagen incrustada no esta en word/media/');
    e.filter(x => /\.(xml|rels)$/.test(x.name)).forEach(x => xmlOk(x.data.toString('utf8'), 'docx ' + x.name));
    const d = (e.find(x => x.name === 'word/document.xml') || { data: Buffer.alloc(0) }).data.toString('utf8');
    ['áéíóú ñ', 'negrita', 'Una cita destacada', 'Primer punto', 'Albamar', 'Titular de la segunda página'].forEach(t => { if (!d.includes(t)) err.push('docx: falta el texto «' + t + '»'); });
    if (!/<w:b\b/.test(d) || !/<w:i\b/.test(d) || !/<w:u\b/.test(d)) err.push('docx: faltan negrita, cursiva o subrayado');
    if (!/w:br w:type="page"|<w:pageBreakBefore/.test(d)) err.push('docx: la segunda pagina no empieza en hoja nueva');
    if (!/<w:tbl>/.test(d)) err.push('docx: falta la tabla');
    if (!/<w:drawing>/.test(d)) err.push('docx: la imagen no esta colocada en el documento');
    if (!/<w:hyperlink /.test(d)) err.push('docx: el enlace no es un hipervinculo');
    const ct = (e.find(x => x.name === '[Content_Types].xml') || { data: Buffer.alloc(0) }).data.toString('utf8');
    if (!/Extension="png"/.test(ct)) err.push('docx: [Content_Types].xml no declara png');
    const m = /<wp:extent cx="(\d+)" cy="(\d+)"/.exec(d);
    if (m && (+m[1] > 16 * 360000 + 1000 || Math.abs(+m[1] / +m[2] - 1200 / 700) > 0.02)) err.push('docx: la imagen pasa de 16 cm o pierde la proporcion (' + m[1] + ' x ' + m[2] + ' EMU)');
  }

  /* epub */
  const ep = call('epub', () => O.epub(model));
  if (ep) {
    save('prueba.epub', ep);
    const e = readZip(ep, 'epub'), names = e.map(x => x.name);
    if (names[0] !== 'mimetype' || e[0].data.toString() !== 'application/epub+zip') err.push('epub: «mimetype» tiene que ser el primer archivo y contener application/epub+zip');
    if (e[0] && e[0].off !== 0) err.push('epub: «mimetype» tiene que empezar en el byte 0');
    if (!names.includes('META-INF/container.xml')) err.push('epub: falta META-INF/container.xml');
    const opf = e.find(x => /\.opf$/.test(x.name));
    if (!opf) err.push('epub: falta el .opf'); else {
      const t = opf.data.toString('utf8');
      xmlOk(t, 'epub opf');
      if (!/properties="nav"/.test(t)) err.push('epub: el .opf no declara el documento de navegacion (properties="nav")');
      if (!/<dc:identifier/.test(t) || !/dcterms:modified/.test(t)) err.push('epub: faltan dc:identifier o dcterms:modified');
      if ((t.match(/<itemref /g) || []).length < 2) err.push('epub: cada pagina tiene que ser un capitulo del lomo (spine)');
    }
    e.filter(x => /\.(xhtml|opf|xml|ncx)$/.test(x.name)).forEach(x => xmlOk(x.data.toString('utf8'), 'epub ' + x.name));
    if (!names.some(n => /\.png$/.test(n))) err.push('epub: falta la imagen incrustada');
    const all = e.filter(x => /\.xhtml$/.test(x.name)).map(x => x.data.toString('utf8')).join('\n');
    ['áéíóú ñ', 'Una cita destacada', 'Titular de la segunda página'].forEach(t => { if (!all.includes(t)) err.push('epub: falta el texto «' + t + '»'); });
  }

  /* .doc (MHTML) */
  const wd = call('wordDoc', () => O.wordDoc(model));
  if (wd !== null) {
    save('prueba.doc', wd || '');
    if (typeof wd !== 'string') err.push('wordDoc: tiene que devolver texto');
    else {
      if (!/^MIME-Version: 1\.0/m.test(wd) || !/multipart\/related/i.test(wd)) err.push('wordDoc: no es MHTML (MIME-Version y multipart/related)');
      if (!/Content-Type: image\/png/i.test(wd) || !/Content-Transfer-Encoding: base64/i.test(wd)) err.push('wordDoc: la imagen no va como parte en base64');
      if (!/Content-Location:/i.test(wd)) err.push('wordDoc: las partes necesitan Content-Location');
      if (/[^\x00-\x7f]/.test(wd)) err.push('wordDoc: el MHTML tiene que ser ASCII puro (quoted-printable o entidades para las tildes)');
      if (!/Una cita destacada/.test(wd)) err.push('wordDoc: falta texto');
      if (!/page-break-before|mso-special-character:\s*line-break;\s*page-break-before|<br[^>]*page-break/i.test(wd)) err.push('wordDoc: la segunda pagina no empieza en hoja nueva');
    }
  }

  /* markdown y texto */
  const md = call('markdown', () => O.markdown(model));
  if (md !== null) {
    save('prueba.md', md || '');
    if (typeof md !== 'string') err.push('markdown: tiene que devolver texto');
    else {
      [/^# .*titular con tildes/mi, /\*\*negrita\*\*/, /[*_]cursiva[*_]/, /^[-*] Primer punto/m, /^1\. Paso uno/m, /^> Una cita destacada/m, /\[un enlace\]\(https:\/\/example\.org\/a\?b=1&c=2\)/, /\| *Puerto *\| *Pleamar *\|/, /^---+$/m, /!\[[^\]]*\]\(/].forEach(r => { if (!r.test(md)) err.push('markdown: no aparece ' + r); });
    }
  }
  const tx = call('text', () => O.text(model));
  if (tx !== null) {
    save('prueba.txt', tx || '');
    if (typeof tx !== 'string') err.push('text: tiene que devolver texto');
    else {
      if (/[<>]/.test(tx.replace('< >', '').replace('<cía>', ''))) warn.push('text: quedan signos < > que parecen etiquetas');
      ['EL TITULAR CON TILDES', 'Una cita destacada', 'Primer punto', 'Titular de la segunda página'].forEach(t => { if (!tx.toLowerCase().includes(t.toLowerCase())) err.push('text: falta «' + t + '»'); });
      if (/\*\*|^#+ /m.test(tx)) err.push('text: no puede llevar marcas de Markdown');
    }
  }
}
finish('oficina · zip, docx, epub, doc, markdown y texto' + (outDir ? ' · archivos en ' + outDir : ''), err, warn);
