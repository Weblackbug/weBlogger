/* weBlogger · conversores de oficina
 *
 * WB.office convierte el modelo de una publicación (apartado 4 de
 * herramientas/CONTRATOS.md) en archivos de oficina:
 *
 *   zip(files)      -> Uint8Array   ZIP sin compresión
 *   docx(doc)       -> Uint8Array   Word moderno (WordprocessingML)
 *   epub(doc)       -> Uint8Array   EPUB 3
 *   wordDoc(doc)    -> string       .doc para Word 97-2003 (MHTML, ASCII de 7 bits)
 *   markdown(doc)   -> string
 *   text(doc)       -> string
 *
 * Funciones puras: sin DOM, sin window, sin red y sin dependencias. El mismo
 * archivo sirve en el navegador y en Node. Las fechas internas del ZIP son
 * fijas; la de los metadatos es doc.date si viene, y si no, la del momento.
 */
(function (root) {
  'use strict';

  /* ================================================================
   * 1. Bytes, UTF-8, CRC-32, base64
   * ================================================================ */

  var encoder = new TextEncoder();

  function utf8(s) { return encoder.encode(String(s)); }

  function toBytes(d) {
    if (d === null || d === undefined) return new Uint8Array(0);
    if (typeof d === 'string') return utf8(d);
    if (d.BYTES_PER_ELEMENT === 1 && typeof d.length === 'number') return d;
    if (d.buffer && typeof d.byteLength === 'number' && typeof d.byteOffset === 'number') {
      return new Uint8Array(d.buffer, d.byteOffset, d.byteLength);
    }
    return new Uint8Array(d);
  }

  var CRC_TABLE = (function () {
    var t = new Uint32Array(256), n, c, k;
    for (n = 0; n < 256; n++) {
      c = n;
      for (k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(b) {
    var c = 0xffffffff, i;
    for (i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  /* base64 en líneas de 76 caracteres separadas por CRLF */
  function base64Lines(b) {
    var out = [], line = '', i, n, a, c, d;
    for (i = 0; i < b.length; i += 3) {
      n = b.length - i;
      a = b[i]; c = n > 1 ? b[i + 1] : 0; d = n > 2 ? b[i + 2] : 0;
      line += B64.charAt(a >> 2) + B64.charAt(((a & 3) << 4) | (c >> 4)) +
        (n > 1 ? B64.charAt(((c & 15) << 2) | (d >> 6)) : '=') +
        (n > 2 ? B64.charAt(d & 63) : '=');
      if (line.length >= 76) { out.push(line); line = ''; }
    }
    if (line) out.push(line);
    return out.join('\r\n');
  }

  /* ================================================================
   * 2. ZIP sin compresión
   * ================================================================ */

  var ZIP_TIME = 0;                                     // 00:00:00
  var ZIP_DATE = ((2024 - 1980) << 9) | (1 << 5) | 1;   // 1 de enero de 2024

  function zip(files) {
    var list = (files || []).map(function (f) {
      var name = String(f.name || '').replace(/\\/g, '/').replace(/^\/+/, '');
      var data = toBytes(f.data);
      return {
        name: utf8(name),
        flags: /[^\x00-\x7f]/.test(name) ? 0x0800 : 0,   // bit 11: nombre en UTF-8
        data: data,
        crc: crc32(data)
      };
    });
    var size = 22;
    list.forEach(function (f) { size += 30 + f.name.length + f.data.length + 46 + f.name.length; });
    var out = new Uint8Array(size), dv = new DataView(out.buffer), p = 0;

    list.forEach(function (f) {
      f.off = p;
      dv.setUint32(p, 0x04034b50, true);
      dv.setUint16(p + 4, 20, true);              // versión necesaria: 2.0
      dv.setUint16(p + 6, f.flags, true);
      dv.setUint16(p + 8, 0, true);               // método 0: almacenado
      dv.setUint16(p + 10, ZIP_TIME, true);
      dv.setUint16(p + 12, ZIP_DATE, true);
      dv.setUint32(p + 14, f.crc, true);
      dv.setUint32(p + 18, f.data.length, true);
      dv.setUint32(p + 22, f.data.length, true);
      dv.setUint16(p + 26, f.name.length, true);
      dv.setUint16(p + 28, 0, true);              // sin campo extra
      out.set(f.name, p + 30);
      out.set(f.data, p + 30 + f.name.length);
      p += 30 + f.name.length + f.data.length;
    });

    var dirOff = p;
    list.forEach(function (f) {
      dv.setUint32(p, 0x02014b50, true);
      dv.setUint16(p + 4, 20, true);              // hecho con: 2.0, atributos FAT
      dv.setUint16(p + 6, 20, true);
      dv.setUint16(p + 8, f.flags, true);
      dv.setUint16(p + 10, 0, true);
      dv.setUint16(p + 12, ZIP_TIME, true);
      dv.setUint16(p + 14, ZIP_DATE, true);
      dv.setUint32(p + 16, f.crc, true);
      dv.setUint32(p + 20, f.data.length, true);
      dv.setUint32(p + 24, f.data.length, true);
      dv.setUint16(p + 28, f.name.length, true);
      dv.setUint16(p + 30, 0, true);              // campo extra
      dv.setUint16(p + 32, 0, true);              // comentario
      dv.setUint16(p + 34, 0, true);              // disco
      dv.setUint16(p + 36, 0, true);              // atributos internos
      dv.setUint32(p + 38, 0, true);              // atributos externos
      dv.setUint32(p + 42, f.off, true);
      out.set(f.name, p + 46);
      p += 46 + f.name.length;
    });

    dv.setUint32(p, 0x06054b50, true);
    dv.setUint16(p + 4, 0, true);
    dv.setUint16(p + 6, 0, true);
    dv.setUint16(p + 8, list.length, true);
    dv.setUint16(p + 10, list.length, true);
    dv.setUint32(p + 12, p - dirOff, true);
    dv.setUint32(p + 16, dirOff, true);
    dv.setUint16(p + 20, 0, true);
    return out;
  }

  /* ================================================================
   * 3. Normalización del modelo
   * ================================================================ */

  var MIME_EXT = {
    'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif',
    'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/bmp': 'bmp'
  };
  var EXT_MIME = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp' };

  function str(v) { return v === null || v === undefined ? '' : String(v); }

  function cleanColor(c) {
    c = str(c).trim().toLowerCase();
    var m = /^#?([0-9a-f]{3})$/.exec(c);
    if (m) return '#' + m[1].charAt(0) + m[1].charAt(0) + m[1].charAt(1) + m[1].charAt(1) + m[1].charAt(2) + m[1].charAt(2);
    m = /^#?([0-9a-f]{6})$/.exec(c);
    return m ? '#' + m[1] : '';
  }

  function cleanLink(l) {
    l = str(l).trim();
    if (!l || /^(javascript|vbscript|data)\s*:/i.test(l)) return '';
    return l;
  }

  function sameFormat(a, b) {
    return a.b === b.b && a.i === b.i && a.u === b.u && a.s === b.s && a.sup === b.sup &&
      a.sub === b.sub && a.color === b.color && a.link === b.link;
  }

  /* acepta una lista de runs, un run suelto o un texto */
  function normRuns(runs) {
    var out = [];
    if (runs === null || runs === undefined) return out;
    if (typeof runs === 'string') runs = [{ text: runs }];
    else if (!Array.isArray(runs)) runs = [runs];
    runs.forEach(function (r) {
      if (r === null || r === undefined) return;
      if (typeof r !== 'object') r = { text: r };
      var text = str(r.text).replace(/\r\n?/g, '\n')
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '');
      if (!text) return;
      var n = {
        text: text, b: !!r.b, i: !!r.i, u: !!r.u, s: !!r.s, sup: !!r.sup, sub: !!r.sub && !r.sup,
        color: cleanColor(r.color), link: cleanLink(r.link)
      };
      var last = out[out.length - 1];
      if (last && sameFormat(last, n)) last.text += n.text; else out.push(n);
    });
    return out;
  }

  function sniffMime(b) {
    if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
    if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
    if (b.length > 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif';
    if (b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
    if (b.length > 2 && b[0] === 0x42 && b[1] === 0x4d) return 'image/bmp';
    return '';
  }

  /* medidas en píxeles leídas de la propia imagen, cuando el modelo no las trae */
  function sniffSize(b, mime) {
    var i, m, len;
    if (mime === 'image/png' && b.length >= 24) {
      return { w: ((b[16] << 24) | (b[17] << 16) | (b[18] << 8) | b[19]) >>> 0, h: ((b[20] << 24) | (b[21] << 16) | (b[22] << 8) | b[23]) >>> 0 };
    }
    if (mime === 'image/gif' && b.length >= 10) return { w: b[6] | (b[7] << 8), h: b[8] | (b[9] << 8) };
    if (mime === 'image/jpeg') {
      i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        m = b[i + 1];
        if (m === 0xff) { i++; continue; }
        if (m === 0x01 || (m >= 0xd0 && m <= 0xd9)) { i += 2; continue; }
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
          return { w: (b[i + 7] << 8) | b[i + 8], h: (b[i + 5] << 8) | b[i + 6] };
        }
        len = (b[i + 2] << 8) | b[i + 3];
        if (len < 2) break;
        i += 2 + len;
      }
    }
    return { w: 0, h: 0 };
  }

  function pad3(n) { n = String(n); while (n.length < 3) n = '0' + n; return n; }

  function normalize(doc) {
    doc = doc || {};
    var used = {}, imgCount = 0;
    var lang = str(doc.lang).trim();
    if (!/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(lang)) lang = 'es';
    var out = {
      title: str(doc.title).trim() || 'Sin título',
      lang: lang,
      creator: str(doc.creator).trim() || 'weBlogger',
      date: doc.date,
      pages: []
    };

    function normImg(b) {
      var bytes = b.data ? toBytes(b.data) : null;
      if (bytes && !bytes.length) bytes = null;
      var mime = str(b.mime).toLowerCase(), size, w = +b.w > 0 ? +b.w : 0, h = +b.h > 0 ? +b.h : 0;
      var file = '';
      if (bytes) {
        mime = sniffMime(bytes) || mime;
        if (mime === 'image/jpg') mime = 'image/jpeg';
        if (!MIME_EXT[mime]) mime = 'image/png';
        if (!w || !h) { size = sniffSize(bytes, mime); if (size.w > 0 && size.h > 0) { w = size.w; h = size.h; } else { w = 0; h = 0; } }
        imgCount++;
        var base = str(b.name).replace(/\\/g, '/').split('/').pop().replace(/\.[A-Za-z0-9]{1,5}$/, '')
          .replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
        if (!base) base = 'imagen-' + imgCount;
        var ext = MIME_EXT[mime], k = 1;
        file = base + '.' + ext;
        while (used[file]) { k++; file = base + '-' + k + '.' + ext; }
        used[file] = true;
      }
      return {
        t: 'img', file: file, mime: mime, data: bytes, url: cleanLink(b.url), w: w, h: h,
        caption: str(b.caption).trim(), alt: str(b.alt).trim()
      };
    }

    function normRow(row) { return (Array.isArray(row) ? row : [row]).map(normRuns); }

    (Array.isArray(doc.pages) ? doc.pages : []).forEach(function (pg, idx) {
      pg = pg || {};
      var page = {
        name: str(pg.name).trim(), title: str(pg.title).trim(), blocks: [], n: idx + 1
      };
      page.label = page.title || page.name || ('Página ' + (idx + 1));
      (Array.isArray(pg.blocks) ? pg.blocks : []).forEach(function (b) {
        if (!b || typeof b !== 'object') return;
        var lv, runs, items;
        switch (b.t) {
          case 'h':
            runs = normRuns(b.runs);
            lv = Math.round(+b.level) || 1;
            if (runs.length) page.blocks.push({ t: 'h', level: Math.max(1, Math.min(4, lv)), runs: runs });
            break;
          case 'p':
            runs = normRuns(b.runs);
            if (runs.length) {
              page.blocks.push({
                t: 'p', runs: runs,
                cls: /^(lead|note|kicker|code)$/.test(str(b.cls)) ? b.cls : '',
                align: /^(center|right|justify)$/.test(str(b.align)) ? b.align : ''
              });
            }
            break;
          case 'quote':
            runs = normRuns(b.runs);
            if (runs.length || str(b.cite).trim()) page.blocks.push({ t: 'quote', runs: runs, cite: str(b.cite).trim() });
            break;
          case 'list':
            items = (Array.isArray(b.items) ? b.items : []).map(normRuns).filter(function (r) { return r.length; });
            if (items.length) page.blocks.push({ t: 'list', ordered: !!b.ordered, items: items });
            break;
          case 'img':
            page.blocks.push(normImg(b));
            break;
          case 'table':
            var head = (Array.isArray(b.head) ? b.head : []).map(normRow);
            var rows = (Array.isArray(b.rows) ? b.rows : []).map(normRow);
            var cols = 0;
            head.concat(rows).forEach(function (r) { cols = Math.max(cols, r.length); });
            if (cols) {
              head.concat(rows).forEach(function (r) { while (r.length < cols) r.push([]); });
              page.blocks.push({ t: 'table', head: head, rows: rows, cols: cols });
            }
            break;
          case 'rule':
            page.blocks.push({ t: 'rule' });
            break;
          default:
        }
      });
      out.pages.push(page);
    });
    return out;
  }

  function plain(runs) { return runs.map(function (r) { return r.text; }).join(''); }

  function isoDate(d) {
    var date = d instanceof Date ? d : (d ? new Date(d) : new Date());
    if (isNaN(date.getTime())) date = new Date();
    return date.toISOString().replace(/\.\d+Z$/, 'Z');
  }

  /* cuatro pasadas de FNV-1a con semillas distintas: 16 bytes estables */
  function stableUuid(text) {
    var b = utf8(text), bytes = [], s, i, h;
    for (s = 0; s < 4; s++) {
      h = (0x811c9dc5 ^ Math.imul(s + 1, 0x9e3779b1)) >>> 0;
      for (i = 0; i < b.length; i++) { h ^= b[i]; h = Math.imul(h, 0x01000193) >>> 0; }
      h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d) >>> 0; h ^= h >>> 12;
      bytes.push((h >>> 24) & 255, (h >>> 16) & 255, (h >>> 8) & 255, h & 255);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x50;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    var hex = bytes.map(function (x) { return (x < 16 ? '0' : '') + x.toString(16); }).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  }

  function esc(s) {
    return str(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escAttr(s) { return esc(str(s).replace(/[\r\n\t]+/g, ' ')); }

  var XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

  /* ================================================================
   * 4. DOCX
   * ================================================================ */

  var EMU_CM = 360000, EMU_PX = 9525;
  var IMG_MAX_W = 16 * EMU_CM, IMG_MAX_H = 21 * EMU_CM;
  var TEXT_W = 9072;                       // ancho de la caja de texto en twips (16 cm)
  var SERIF = 'Georgia', MONO = 'Consolas';
  var WORD_LANG = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', pt: 'pt-PT', ca: 'ca-ES', gl: 'gl-ES', eu: 'eu-ES', nl: 'nl-NL' };
  var DOCX_IMG = { 'image/png': 1, 'image/jpeg': 1, 'image/gif': 1, 'image/bmp': 1 };

  /* tamaño de la imagen en EMU: nunca más de 16 cm de ancho, con su proporción */
  function imgEmu(w, h) {
    var cx, cy, k;
    if (!(w > 0) || !(h > 0)) { cx = IMG_MAX_W; cy = IMG_MAX_W * 3 / 4; }
    else { cx = w * EMU_PX; cy = h * EMU_PX; }
    k = Math.min(1, IMG_MAX_W / cx, IMG_MAX_H / cy);
    return { cx: Math.max(1, Math.round(cx * k)), cy: Math.max(1, Math.round(cy * k)) };
  }

  function docxStyles(lang) {
    var wl = WORD_LANG[lang.toLowerCase()] || (lang.indexOf('-') > 0 ? lang : 'es-ES');
    function fonts(f) { return '<w:rFonts w:ascii="' + f + '" w:hAnsi="' + f + '" w:eastAsia="' + f + '" w:cs="' + f + '"/>'; }
    function para(id, name, ppr, rpr, extra) {
      return '<w:style w:type="paragraph" w:styleId="' + id + '"><w:name w:val="' + name + '"/>' +
        '<w:basedOn w:val="Normal"/><w:next w:val="' + ((extra && extra.next) || 'Normal') + '"/>' +
        ((extra && extra.prio) ? '<w:uiPriority w:val="' + extra.prio + '"/>' : '') + '<w:qFormat/>' +
        (ppr ? '<w:pPr>' + ppr + '</w:pPr>' : '') + (rpr ? '<w:rPr>' + rpr + '</w:rPr>' : '') + '</w:style>';
    }
    function heading(n, size, before, after, rpr) {
      return para('Titulo' + n, 'heading ' + n,
        '<w:keepNext/><w:keepLines/><w:spacing w:before="' + before + '" w:after="' + after + '" w:line="' + (n === 1 ? 240 : 252) + '" w:lineRule="auto"/><w:outlineLvl w:val="' + (n - 1) + '"/>',
        '<w:b/><w:bCs/>' + (rpr || '') + '<w:sz w:val="' + size + '"/><w:szCs w:val="' + size + '"/>', { prio: 9 });
    }
    return XML_HEAD +
      '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:docDefaults><w:rPrDefault><w:rPr>' + fonts(SERIF) +
      '<w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="' + escAttr(wl) + '" w:eastAsia="' + escAttr(wl) + '" w:bidi="ar-SA"/></w:rPr></w:rPrDefault>' +
      '<w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
      '<w:style w:type="character" w:default="1" w:styleId="Fuentedeparrafo"><w:name w:val="Default Paragraph Font"/><w:uiPriority w:val="1"/><w:semiHidden/><w:unhideWhenUsed/></w:style>' +
      '<w:style w:type="table" w:default="1" w:styleId="Tablanormal"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/><w:unhideWhenUsed/>' +
      '<w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>' +
      heading(1, 52, 240, 200) +
      heading(2, 36, 360, 140) +
      heading(3, 28, 280, 100) +
      heading(4, 24, 240, 80, '<w:i/><w:iCs/>') +
      para('Entradilla', 'Entradilla', '<w:spacing w:after="240" w:line="324" w:lineRule="auto"/>',
        '<w:color w:val="333333"/><w:sz w:val="28"/><w:szCs w:val="28"/>') +
      para('Antetitulo', 'Antetítulo', '<w:keepNext/><w:spacing w:before="120" w:after="60"/>',
        '<w:b/><w:bCs/><w:caps/><w:color w:val="7A1F1F"/><w:spacing w:val="20"/><w:sz w:val="18"/><w:szCs w:val="18"/>', { next: 'Titulo1' }) +
      para('Cita', 'Quote',
        '<w:pBdr><w:left w:val="single" w:sz="18" w:space="12" w:color="999999"/></w:pBdr><w:spacing w:before="240" w:after="80" w:line="324" w:lineRule="auto"/><w:ind w:left="567" w:right="567"/>',
        '<w:i/><w:iCs/><w:color w:val="333333"/><w:sz w:val="28"/><w:szCs w:val="28"/>', { prio: 29, next: 'CitaAutor' }) +
      para('CitaAutor', 'Autor de la cita', '<w:spacing w:after="240"/><w:ind w:left="567" w:right="567"/>',
        '<w:color w:val="555555"/><w:sz w:val="20"/><w:szCs w:val="20"/>') +
      para('Imagen', 'Imagen', '<w:keepNext/><w:spacing w:before="200" w:after="80" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/>', '') +
      para('PieDeFoto', 'Pie de foto', '<w:spacing w:after="240" w:line="264" w:lineRule="auto"/>',
        '<w:i/><w:iCs/><w:color w:val="555555"/><w:sz w:val="18"/><w:szCs w:val="18"/>') +
      para('Nota', 'Nota', '<w:spacing w:before="80" w:after="160" w:line="264" w:lineRule="auto"/>',
        '<w:color w:val="555555"/><w:sz w:val="18"/><w:szCs w:val="18"/>') +
      para('Codigo', 'Código',
        '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/><w:spacing w:before="120" w:after="160" w:line="264" w:lineRule="auto"/><w:ind w:left="113" w:right="113"/>',
        '<w:rFonts w:ascii="' + MONO + '" w:hAnsi="' + MONO + '" w:eastAsia="' + MONO + '" w:cs="' + MONO + '"/><w:noProof/><w:sz w:val="19"/><w:szCs w:val="19"/>') +
      para('Parrafodelista', 'List Paragraph', '<w:spacing w:after="80"/>', '', { prio: 34, next: 'Parrafodelista' }) +
      para('Tabla', 'Texto de tabla', '<w:spacing w:before="40" w:after="40" w:line="264" w:lineRule="auto"/>',
        '<w:sz w:val="20"/><w:szCs w:val="20"/>', { next: 'Tabla' }) +
      para('Filete', 'Filete', '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="808080"/></w:pBdr><w:spacing w:before="120" w:after="240" w:line="120" w:lineRule="auto"/>',
        '<w:sz w:val="8"/><w:szCs w:val="8"/>') +
      '<w:style w:type="character" w:styleId="Hipervinculo"><w:name w:val="Hyperlink"/><w:basedOn w:val="Fuentedeparrafo"/><w:uiPriority w:val="99"/><w:unhideWhenUsed/>' +
      '<w:rPr><w:color w:val="1D3F6E"/><w:u w:val="single"/></w:rPr></w:style>' +
      '</w:styles>';
  }

  function docxNumbering(orderedNums) {
    function lvl(fmt, text) {
      return '<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="' + fmt + '"/><w:lvlText w:val="' + text + '"/><w:lvlJc w:val="left"/>' +
        '<w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>' +
        (fmt === 'bullet' ? '<w:rPr><w:rFonts w:ascii="' + SERIF + '" w:hAnsi="' + SERIF + '" w:cs="' + SERIF + '" w:hint="default"/></w:rPr>' : '') + '</w:lvl>';
    }
    var xml = XML_HEAD + '<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>' + lvl('bullet', '\u2022') + '</w:abstractNum>' +
      '<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>' + lvl('decimal', '%1.') + '</w:abstractNum>' +
      '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>';
    orderedNums.forEach(function (id) {
      // cada lista numerada vuelve a empezar en 1
      xml += '<w:num w:numId="' + id + '"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>';
    });
    return xml + '</w:numbering>';
  }

  function docx(model) {
    var doc = normalize(model);
    var rels = [], media = [], linkIds = {}, orderedNums = [], exts = {};
    var nextRel = 4, drawing = 0, pendingBreak = false, body = '';
    var R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

    function linkRel(url) {
      if (!linkIds[url]) {
        linkIds[url] = 'rId' + (nextRel++);
        rels.push('<Relationship Id="' + linkIds[url] + '" Type="' + R + '/hyperlink" Target="' + escAttr(url) + '" TargetMode="External"/>');
      }
      return linkIds[url];
    }

    function wText(text) {
      var out = '';
      text.split(/(\n|\t)/).forEach(function (part) {
        if (part === '\n') out += '<w:br/>';
        else if (part === '\t') out += '<w:tab/>';
        else if (part) out += '<w:t xml:space="preserve">' + esc(part) + '</w:t>';
      });
      return out;
    }

    function wRun(r, o) {
      var p = '';
      if (r.link) p += '<w:rStyle w:val="Hipervinculo"/>';
      if (r.b || (o && o.b)) p += '<w:b/><w:bCs/>';
      if (r.i) p += '<w:i/><w:iCs/>';
      if (r.s) p += '<w:strike/>';
      if (r.color) p += '<w:color w:val="' + r.color.slice(1).toUpperCase() + '"/>';
      if (r.u) p += '<w:u w:val="single"/>';
      if (r.sup) p += '<w:vertAlign w:val="superscript"/>';
      else if (r.sub) p += '<w:vertAlign w:val="subscript"/>';
      return '<w:r>' + (p ? '<w:rPr>' + p + '</w:rPr>' : '') + wText(r.text) + '</w:r>';
    }

    function wRuns(runs, o) {
      var out = '', i = 0, j, url;
      while (i < runs.length) {
        url = runs[i].link;
        if (!url) { out += wRun(runs[i], o); i++; continue; }
        j = i;
        out += '<w:hyperlink r:id="' + linkRel(url) + '" w:history="1">';
        while (j < runs.length && runs[j].link === url) { out += wRun(runs[j], o); j++; }
        out += '</w:hyperlink>';
        i = j;
      }
      return out;
    }

    /* o: { style, keepNext, num, bdr, jc }; el orden de los hijos de pPr es el del esquema */
    function para(o, inner) {
      var p = '';
      if (o.style) p += '<w:pStyle w:val="' + o.style + '"/>';
      if (o.keepNext) p += '<w:keepNext/>';
      if (pendingBreak) { p += '<w:pageBreakBefore/>'; pendingBreak = false; }
      if (o.num) p += '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="' + o.num + '"/></w:numPr>';
      if (o.jc) p += '<w:jc w:val="' + o.jc + '"/>';
      return '<w:p>' + (p ? '<w:pPr>' + p + '</w:pPr>' : '') + (inner || '') + '</w:p>';
    }

    function picture(b) {
      var rid = 'rId' + (nextRel++), size = imgEmu(b.w, b.h), id = ++drawing;
      var ext = b.file.split('.').pop();
      exts[ext] = b.mime;
      media.push({ name: 'word/media/' + b.file, data: b.data });
      rels.push('<Relationship Id="' + rid + '" Type="' + R + '/image" Target="media/' + escAttr(b.file) + '"/>');
      return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">' +
        '<wp:extent cx="' + size.cx + '" cy="' + size.cy + '"/><wp:effectExtent l="0" t="0" r="0" b="0"/>' +
        '<wp:docPr id="' + id + '" name="Imagen ' + id + '" descr="' + escAttr(b.alt || b.caption) + '"/>' +
        '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
        '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>' +
        '<pic:nvPicPr><pic:cNvPr id="' + id + '" name="' + escAttr(b.file) + '"/><pic:cNvPicPr/></pic:nvPicPr>' +
        '<pic:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
        '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + size.cx + '" cy="' + size.cy + '"/></a:xfrm>' +
        '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>' +
        '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
    }

    function table(b) {
      var colW = Math.floor(TEXT_W / b.cols), bd = '', xml;
      ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].forEach(function (s) {
        bd += '<w:' + s + ' w:val="single" w:sz="4" w:space="0" w:color="808080"/>';
      });
      xml = '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>' + bd + '</w:tblBorders>' +
        '<w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar>' +
        '<w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid>';
      for (var i = 0; i < b.cols; i++) xml += '<w:gridCol w:w="' + colW + '"/>';
      xml += '</w:tblGrid>';
      function row(cells, isHead) {
        var r = '<w:tr>' + (isHead ? '<w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>' : '<w:trPr><w:cantSplit/></w:trPr>');
        cells.forEach(function (c) {
          r += '<w:tc><w:tcPr><w:tcW w:w="' + colW + '" w:type="dxa"/>' +
            (isHead ? '<w:shd w:val="clear" w:color="auto" w:fill="EDEDED"/>' : '') + '</w:tcPr>' +
            '<w:p><w:pPr><w:pStyle w:val="Tabla"/></w:pPr>' + wRuns(c, { b: isHead }) + '</w:p></w:tc>';
        });
        return r + '</w:tr>';
      }
      b.head.forEach(function (r) { xml += row(r, true); });
      b.rows.forEach(function (r) { xml += row(r, false); });
      // párrafo mínimo tras la tabla: Word lo exige al final y separa tablas seguidas
      return xml + '</w:tbl><w:p><w:pPr><w:spacing w:after="120" w:line="120" w:lineRule="auto"/><w:rPr><w:sz w:val="8"/></w:rPr></w:pPr></w:p>';
    }

    function block(b) {
      var num, cap;
      switch (b.t) {
        case 'h':
          return para({ style: 'Titulo' + b.level }, wRuns(b.runs));
        case 'p':
          return para({
            style: { lead: 'Entradilla', note: 'Nota', kicker: 'Antetitulo', code: 'Codigo' }[b.cls] || '',
            jc: { center: 'center', right: 'right', justify: 'both' }[b.align] || ''
          }, wRuns(b.runs));
        case 'quote':
          return (b.runs.length ? para({ style: 'Cita', keepNext: !!b.cite }, wRuns(b.runs)) : '') +
            (b.cite ? para({ style: 'CitaAutor' }, wRuns([{ text: '\u2014 ' + b.cite }])) : '');
        case 'list':
          if (b.ordered) { num = 2 + orderedNums.length; orderedNums.push(num); } else num = 1;
          return b.items.map(function (it) { return para({ style: 'Parrafodelista', num: num }, wRuns(it)); }).join('');
        case 'img':
          if (b.data && DOCX_IMG[b.mime]) {
            return para({ style: 'Imagen', keepNext: false }, picture(b)) +
              (b.caption ? para({ style: 'PieDeFoto' }, wRuns([{ text: b.caption }])) : '');
          }
          cap = [];
          if (b.caption || b.alt) cap.push({ text: (b.caption || b.alt) + (b.url ? ' \u00b7 ' : '') });
          if (b.url) cap.push({ text: b.url, link: b.url });
          return cap.length ? para({ style: 'PieDeFoto' }, wRuns(normRuns(cap))) : '';
        case 'table':
          if (pendingBreak) {
            pendingBreak = false;
            return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>' + table(b);
          }
          return table(b);
        case 'rule':
          return para({ style: 'Filete' }, '');
        default:
          return '';
      }
    }

    doc.pages.forEach(function (pg, i) {
      if (i > 0 && body) pendingBreak = true;
      pg.blocks.forEach(function (b) { body += block(b); });
    });
    if (!body) body = '<w:p/>';

    var documentXml = XML_HEAD +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="' + R + '"' +
      ' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"' +
      ' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"' +
      ' xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>' + body +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417" w:header="708" w:footer="708" w:gutter="0"/>' +
      '<w:cols w:space="708"/></w:sectPr></w:body></w:document>';

    var defaults = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp' }, ctImg = '';
    exts.png = 'image/png';
    Object.keys(exts).forEach(function (e) { ctImg += '<Default Extension="' + e + '" ContentType="' + (defaults[e] || exts[e]) + '"/>'; });

    var PKG = 'application/vnd.openxmlformats-officedocument.';
    var contentTypes = XML_HEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' + ctImg +
      '<Override PartName="/word/document.xml" ContentType="' + PKG + 'wordprocessingml.document.main+xml"/>' +
      '<Override PartName="/word/styles.xml" ContentType="' + PKG + 'wordprocessingml.styles+xml"/>' +
      '<Override PartName="/word/numbering.xml" ContentType="' + PKG + 'wordprocessingml.numbering+xml"/>' +
      '<Override PartName="/word/settings.xml" ContentType="' + PKG + 'wordprocessingml.settings+xml"/>' +
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
      '<Override PartName="/docProps/app.xml" ContentType="' + PKG + 'extended-properties+xml"/>' +
      '</Types>';

    var RELS_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
    var rootRels = XML_HEAD + '<Relationships xmlns="' + RELS_NS + '">' +
      '<Relationship Id="rId1" Type="' + R + '/officeDocument" Target="word/document.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
      '<Relationship Id="rId3" Type="' + R + '/extended-properties" Target="docProps/app.xml"/>' +
      '</Relationships>';
    var docRels = XML_HEAD + '<Relationships xmlns="' + RELS_NS + '">' +
      '<Relationship Id="rId1" Type="' + R + '/styles" Target="styles.xml"/>' +
      '<Relationship Id="rId2" Type="' + R + '/numbering" Target="numbering.xml"/>' +
      '<Relationship Id="rId3" Type="' + R + '/settings" Target="settings.xml"/>' +
      rels.join('') + '</Relationships>';

    var settings = XML_HEAD + '<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:zoom w:percent="100"/><w:defaultTabStop w:val="708"/><w:hyphenationZone w:val="425"/><w:characterSpacingControl w:val="doNotCompress"/>' +
      '<w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat>' +
      '</w:settings>';

    var when = isoDate(doc.date);
    var core = XML_HEAD + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"' +
      ' xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"' +
      ' xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<dc:title>' + esc(doc.title) + '</dc:title><dc:creator>' + esc(doc.creator) + '</dc:creator>' +
      '<cp:lastModifiedBy>' + esc(doc.creator) + '</cp:lastModifiedBy>' +
      '<dcterms:created xsi:type="dcterms:W3CDTF">' + when + '</dcterms:created>' +
      '<dcterms:modified xsi:type="dcterms:W3CDTF">' + when + '</dcterms:modified>' +
      '<dc:language>' + esc(doc.lang) + '</dc:language></cp:coreProperties>';
    var app = XML_HEAD + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">' +
      '<Application>weBlogger</Application></Properties>';

    return zip([
      { name: '[Content_Types].xml', data: contentTypes },
      { name: '_rels/.rels', data: rootRels },
      { name: 'word/document.xml', data: documentXml },
      { name: 'word/_rels/document.xml.rels', data: docRels },
      { name: 'word/styles.xml', data: docxStyles(doc.lang) },
      { name: 'word/numbering.xml', data: docxNumbering(orderedNums) },
      { name: 'word/settings.xml', data: settings },
      { name: 'docProps/core.xml', data: core },
      { name: 'docProps/app.xml', data: app }
    ].concat(media));
  }

  /* ================================================================
   * 5. HTML compartido por EPUB (XHTML) y .doc (HTML de Word)
   * ================================================================ */

  function hRuns(runs, code) {
    return runs.map(function (r) {
      var text = code ? r.text.replace(/ {2}/g, ' \u00a0').replace(/^ /gm, '\u00a0') : r.text;
      var h = esc(text).replace(/\n/g, '<br/>');
      if (r.sup) h = '<sup>' + h + '</sup>';
      else if (r.sub) h = '<sub>' + h + '</sub>';
      if (r.s) h = '<s>' + h + '</s>';
      if (r.u) h = '<span class="subrayado" style="text-decoration:underline">' + h + '</span>';
      if (r.i) h = '<em>' + h + '</em>';
      if (r.b) h = '<strong>' + h + '</strong>';
      if (r.color) h = '<span style="color:' + r.color + '">' + h + '</span>';
      if (r.link) h = '<a href="' + escAttr(r.link) + '">' + h + '</a>';
      return h;
    }).join('');
  }

  /* o.img(bloque) -> HTML de la imagen incrustada, o '' si ese formato no la admite */
  function hBlocks(blocks, o) {
    return blocks.map(function (b) {
      var cls, tag, h, pic;
      switch (b.t) {
        case 'h':
          return '<h' + b.level + '>' + hRuns(b.runs) + '</h' + b.level + '>';
        case 'p':
          cls = [];
          if (b.cls) cls.push({ lead: 'entradilla', note: 'nota', kicker: 'antetitulo', code: 'codigo' }[b.cls]);
          if (b.align) cls.push({ center: 'centro', right: 'derecha', justify: 'justificado' }[b.align]);
          return '<p' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' + hRuns(b.runs, b.cls === 'code') + '</p>';
        case 'quote':
          return '<blockquote class="cita">' + (b.runs.length ? '<p>' + hRuns(b.runs) + '</p>' : '') +
            (b.cite ? '<p class="cita-autor">\u2014 ' + esc(b.cite) + '</p>' : '') + '</blockquote>';
        case 'list':
          tag = b.ordered ? 'ol' : 'ul';
          return '<' + tag + '>' + b.items.map(function (it) { return '<li>' + hRuns(it) + '</li>'; }).join('') + '</' + tag + '>';
        case 'img':
          pic = b.data ? o.img(b) : '';
          if (pic) {
            return o.word
              ? '<p class="imagen" align="center">' + pic + '</p>' + (b.caption ? '<p class="pie">' + esc(b.caption) + '</p>' : '')
              : '<figure>' + pic + (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>';
          }
          h = esc(b.caption || b.alt);
          if (b.url) h += (h ? ' \u00b7 ' : '') + '<a href="' + escAttr(b.url) + '">' + esc(b.url) + '</a>';
          return h ? '<p class="pie">' + h + '</p>' : '';
        case 'table':
          h = '<table class="tabla"' + (o.word ? ' border="1" cellspacing="0" cellpadding="5"' : '') + '>';
          if (b.head.length) {
            h += '<thead>' + b.head.map(function (r) {
              return '<tr>' + r.map(function (c) { return '<th>' + hRuns(c) + '</th>'; }).join('') + '</tr>';
            }).join('') + '</thead>';
          }
          if (b.rows.length || !b.head.length) {
            h += '<tbody>' + b.rows.map(function (r) {
              return '<tr>' + r.map(function (c) { return '<td>' + hRuns(c) + '</td>'; }).join('') + '</tr>';
            }).join('') + '</tbody>';
          }
          return h + '</table>';
        case 'rule':
          return '<hr/>';
        default:
          return '';
      }
    }).filter(Boolean).join('\n');
  }

  /* ================================================================
   * 6. EPUB 3
   * ================================================================ */

  var EPUB_CSS = [
    '@charset "utf-8";',
    'html { font-size: 100%; }',
    'body { margin: 0 5%; font-family: Georgia, "Times New Roman", serif; line-height: 1.55; text-align: left; widows: 2; orphans: 2; }',
    'h1, h2, h3, h4 { font-weight: bold; line-height: 1.18; margin: 1.6em 0 0.5em; page-break-after: avoid; break-after: avoid; -webkit-hyphens: none; hyphens: none; }',
    'h1 { font-size: 2em; margin-top: 0.6em; }',
    'h2 { font-size: 1.5em; }',
    'h3 { font-size: 1.2em; }',
    'h4 { font-size: 1.05em; font-style: italic; }',
    'p { margin: 0 0 0.9em; }',
    'p.antetitulo { margin: 1.2em 0 0.2em; font-size: 0.78em; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase; }',
    'p.entradilla { font-size: 1.2em; line-height: 1.4; margin-bottom: 1.2em; }',
    'p.nota { font-size: 0.82em; opacity: 0.8; }',
    'p.codigo { font-family: Consolas, "Courier New", monospace; font-size: 0.85em; line-height: 1.4; text-align: left; white-space: pre-wrap; padding: 0.6em 0.8em; border: 1px solid #999; }',
    'p.pie, figcaption { font-size: 0.82em; font-style: italic; line-height: 1.35; margin: 0.4em 0 1.2em; text-align: left; opacity: 0.8; }',
    '.centro { text-align: center; }',
    '.derecha { text-align: right; }',
    '.justificado { text-align: justify; -webkit-hyphens: auto; hyphens: auto; }',
    'blockquote.cita { margin: 1.4em 0 1.4em 0.4em; padding: 0 0 0 1em; border-left: 0.2em solid #999; }',
    'blockquote.cita p { font-size: 1.2em; font-style: italic; line-height: 1.4; margin-bottom: 0.3em; }',
    'blockquote.cita p.cita-autor { font-size: 0.85em; font-style: normal; }',
    'ul, ol { margin: 0 0 1em; padding-left: 1.6em; }',
    'li { margin-bottom: 0.3em; }',
    'figure { margin: 1.4em 0; text-align: center; page-break-inside: avoid; break-inside: avoid; }',
    'img { max-width: 100%; height: auto; }',
    'table.tabla { border-collapse: collapse; width: 100%; margin: 1.2em 0; font-size: 0.9em; line-height: 1.3; }',
    'table.tabla th, table.tabla td { border: 1px solid #888; padding: 0.35em 0.6em; text-align: left; vertical-align: top; }',
    'table.tabla th { font-weight: bold; }',
    'hr { border: 0; border-top: 1px solid #888; margin: 1.8em 20%; }',
    'a { color: inherit; text-decoration: underline; }',
    'sup, sub { font-size: 0.75em; line-height: 0; }',
    'nav ol { list-style: none; padding-left: 0; }',
    'nav li { margin: 0.5em 0; }',
    ''
  ].join('\n');

  function epub(model) {
    var doc = normalize(model);
    var uuid = 'urn:uuid:' + stableUuid(doc.title);
    var X = '<?xml version="1.0" encoding="UTF-8"?>\n';
    var lang = escAttr(doc.lang);
    var images = [], chapters = [];
    if (!doc.pages.length) doc.pages.push({ name: '', title: '', label: doc.title, blocks: [], n: 1 });

    function xhtml(title, body, cssPath, extraNs) {
      return X + '<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"' + (extraNs || '') +
        ' lang="' + lang + '" xml:lang="' + lang + '">\n<head>\n<meta charset="utf-8"/>\n<title>' + esc(title) + '</title>\n' +
        '<link rel="stylesheet" type="text/css" href="' + cssPath + '"/>\n</head>\n<body>\n' + body + '\n</body>\n</html>\n';
    }

    doc.pages.forEach(function (pg, i) {
      var id = 'pagina-' + pad3(i + 1);
      var inner = hBlocks(pg.blocks, {
        img: function (b) {
          images.push(b);
          return '<img src="../imagenes/' + escAttr(b.file) + '" alt="' + escAttr(b.alt || b.caption) + '"/>';
        }
      });
      if (!inner) inner = '<h1>' + esc(pg.label) + '</h1>';
      chapters.push({
        id: id, href: 'texto/' + id + '.xhtml', label: pg.label,
        data: xhtml(pg.label, '<section epub:type="chapter" id="' + id + '">\n' + inner + '\n</section>', '../css/estilo.css')
      });
    });

    var manifest = '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>\n' +
      '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n' +
      '<item id="css" href="css/estilo.css" media-type="text/css"/>\n';
    chapters.forEach(function (c) { manifest += '<item id="' + c.id + '" href="' + c.href + '" media-type="application/xhtml+xml"/>\n'; });
    images.forEach(function (b, i) {
      manifest += '<item id="imagen-' + pad3(i + 1) + '" href="imagenes/' + escAttr(b.file) + '" media-type="' + (EXT_MIME[b.file.split('.').pop()] || b.mime) + '"/>\n';
    });

    var opf = X + '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="' + lang + '">\n' +
      '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n' +
      '<dc:identifier id="pub-id">' + uuid + '</dc:identifier>\n' +
      '<dc:title>' + esc(doc.title) + '</dc:title>\n' +
      '<dc:language>' + esc(doc.lang) + '</dc:language>\n' +
      '<dc:creator>' + esc(doc.creator) + '</dc:creator>\n' +
      '<meta property="dcterms:modified">' + isoDate(doc.date) + '</meta>\n' +
      '</metadata>\n<manifest>\n' + manifest + '</manifest>\n<spine toc="ncx">\n' +
      chapters.map(function (c) { return '<itemref idref="' + c.id + '"/>\n'; }).join('') +
      '</spine>\n</package>\n';

    var nav = xhtml(doc.title,
      '<nav epub:type="toc" id="toc">\n<h1>' + esc(doc.title) + '</h1>\n<ol>\n' +
      chapters.map(function (c) { return '<li><a href="' + c.href + '">' + esc(c.label) + '</a></li>\n'; }).join('') +
      '</ol>\n</nav>', 'css/estilo.css');

    var ncx = X + '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="' + lang + '">\n<head>\n' +
      '<meta name="dtb:uid" content="' + uuid + '"/>\n<meta name="dtb:depth" content="1"/>\n' +
      '<meta name="dtb:totalPageCount" content="0"/>\n<meta name="dtb:maxPageNumber" content="0"/>\n</head>\n' +
      '<docTitle><text>' + esc(doc.title) + '</text></docTitle>\n<navMap>\n' +
      chapters.map(function (c, i) {
        return '<navPoint id="nav-' + c.id + '" playOrder="' + (i + 1) + '"><navLabel><text>' + esc(c.label) + '</text></navLabel><content src="' + c.href + '"/></navPoint>\n';
      }).join('') + '</navMap>\n</ncx>\n';

    var container = X + '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n<rootfiles>\n' +
      '<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n</rootfiles>\n</container>\n';

    return zip([
      { name: 'mimetype', data: 'application/epub+zip' },
      { name: 'META-INF/container.xml', data: container },
      { name: 'OEBPS/content.opf', data: opf },
      { name: 'OEBPS/nav.xhtml', data: nav },
      { name: 'OEBPS/toc.ncx', data: ncx },
      { name: 'OEBPS/css/estilo.css', data: EPUB_CSS }
    ].concat(chapters.map(function (c) { return { name: 'OEBPS/' + c.href, data: c.data }; }),
      images.map(function (b) { return { name: 'OEBPS/imagenes/' + b.file, data: b.data }; })));
  }

  /* ================================================================
   * 7. .doc para Word 97-2003 (MHTML)
   * ================================================================ */

  /* todo lo que no sea ASCII pasa a entidad numérica */
  function asciiEntities(s) {
    var out = '', i, c, d;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c < 0x80) { out += s.charAt(i); continue; }
      if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
        d = s.charCodeAt(i + 1);
        if (d >= 0xdc00 && d <= 0xdfff) { out += '&#' + (((c - 0xd800) << 10) + (d - 0xdc00) + 0x10000) + ';'; i++; continue; }
      }
      out += (c >= 0xd800 && c <= 0xdfff) ? '&#65533;' : '&#' + c + ';';
    }
    return out;
  }

  function hex2(n) { var h = n.toString(16).toUpperCase(); return h.length < 2 ? '0' + h : h; }

  /* quoted-printable sobre texto ya ASCII: líneas de 76 como mucho, CRLF */
  function quotedPrintable(s) {
    return s.replace(/\r\n?/g, '\n').split('\n').map(function (line) {
      var out = '', cur = '', i, c, tok;
      for (i = 0; i < line.length; i++) {
        c = line.charCodeAt(i);
        if (c === 61 || c < 32 && c !== 9 || c > 126 || ((c === 32 || c === 9) && i === line.length - 1)) tok = '=' + hex2(c & 255);
        else tok = line.charAt(i);
        if (cur.length + tok.length > 75) { out += cur + '=\r\n'; cur = ''; }
        cur += tok;
      }
      return out + cur;
    }).join('\r\n');
  }

  var WORD_CSS = [
    '@page WordSection1 { size: 21.0cm 29.7cm; margin: 2.5cm 2.5cm 2.5cm 2.5cm; mso-header-margin: 1.25cm; mso-footer-margin: 1.25cm; mso-paper-source: 0; }',
    'div.WordSection1 { page: WordSection1; }',
    'body { font-family: Georgia, "Times New Roman", serif; font-size: 11.0pt; }',
    'p { margin: 0cm 0cm 8.0pt 0cm; line-height: 125%; font-family: Georgia, serif; font-size: 11.0pt; }',
    'h1 { margin: 12.0pt 0cm 10.0pt 0cm; line-height: 100%; page-break-after: avoid; font-family: Georgia, serif; font-size: 26.0pt; font-weight: bold; }',
    'h2 { margin: 18.0pt 0cm 7.0pt 0cm; line-height: 105%; page-break-after: avoid; font-family: Georgia, serif; font-size: 18.0pt; font-weight: bold; }',
    'h3 { margin: 14.0pt 0cm 5.0pt 0cm; line-height: 105%; page-break-after: avoid; font-family: Georgia, serif; font-size: 14.0pt; font-weight: bold; }',
    'h4 { margin: 12.0pt 0cm 4.0pt 0cm; line-height: 105%; page-break-after: avoid; font-family: Georgia, serif; font-size: 12.0pt; font-weight: bold; font-style: italic; }',
    'p.antetitulo { margin: 6.0pt 0cm 3.0pt 0cm; page-break-after: avoid; font-size: 9.0pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1.0pt; color: #7A1F1F; }',
    'p.entradilla { margin-bottom: 12.0pt; line-height: 135%; font-size: 14.0pt; color: #333333; }',
    'p.nota { font-size: 9.0pt; line-height: 110%; color: #555555; }',
    'p.codigo { margin: 6.0pt 0cm 8.0pt 0cm; line-height: 110%; font-family: Consolas, "Courier New", monospace; font-size: 9.5pt; background: #F2F2F2; }',
    'p.imagen { margin: 10.0pt 0cm 4.0pt 0cm; line-height: 100%; text-align: center; page-break-after: avoid; }',
    'p.pie { margin-bottom: 12.0pt; line-height: 110%; font-size: 9.0pt; font-style: italic; color: #555555; }',
    'p.centro, h1.centro { text-align: center; }',
    'p.derecha { text-align: right; }',
    'p.justificado { text-align: justify; }',
    'blockquote { margin: 12.0pt 1.0cm 12.0pt 1.0cm; }',
    'blockquote p { line-height: 135%; font-size: 14.0pt; font-style: italic; color: #333333; margin-bottom: 4.0pt; }',
    'blockquote p.cita-autor { font-size: 10.0pt; font-style: normal; color: #555555; }',
    'li { margin-bottom: 4.0pt; line-height: 125%; font-family: Georgia, serif; font-size: 11.0pt; }',
    'table.tabla { border-collapse: collapse; border: solid #808080 1.0pt; width: 100%; margin-bottom: 10.0pt; }',
    'table.tabla th, table.tabla td { border: solid #808080 1.0pt; padding: 3.0pt 5.0pt 3.0pt 5.0pt; font-family: Georgia, serif; font-size: 10.0pt; text-align: left; vertical-align: top; }',
    'table.tabla th { font-weight: bold; background: #EDEDED; }',
    'a { color: #1D3F6E; text-decoration: underline; }'
  ].join('\n');

  function wordDoc(model) {
    var doc = normalize(model);
    var BASE = 'file:///C:/weBlogger/';
    var boundary = '----=_NextPart_weBlogger_' + stableUuid(doc.title).replace(/-/g, '').slice(0, 20);
    var images = [], body = '';
    var okMime = { 'image/png': 1, 'image/jpeg': 1, 'image/gif': 1 };

    doc.pages.forEach(function (pg) {
      var inner = hBlocks(pg.blocks, {
        word: true,
        img: function (b) {
          if (!okMime[b.mime]) return '';
          var size = imgEmu(b.w, b.h);
          images.push(b);
          return '<img width="' + Math.round(size.cx / EMU_PX) + '" height="' + Math.round(size.cy / EMU_PX) + '"' +
            ' src="' + BASE + 'documento_archivos/' + escAttr(b.file) + '" alt="' + escAttr(b.alt || b.caption) + '"/>';
        }
      });
      if (!inner) return;
      if (body) body += '\n<br clear="all" style="mso-special-character:line-break;page-break-before:always"/>\n';
      body += inner;
    });

    var html = '<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"' +
      ' xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">\n<head>\n' +
      '<meta http-equiv="Content-Type" content="text/html; charset=us-ascii">\n' +
      '<meta name="ProgId" content="Word.Document">\n<meta name="Generator" content="weBlogger">\n' +
      '<title>' + esc(doc.title) + '</title>\n' +
      '<!--[if gte mso 9]><xml>\n<o:DocumentProperties><o:Author>' + esc(doc.creator) + '</o:Author></o:DocumentProperties>\n' +
      '<w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument>\n</xml><![endif]-->\n' +
      '<style>\n<!--\n' + WORD_CSS + '\n-->\n</style>\n</head>\n' +
      '<body lang="' + escAttr(WORD_LANG[doc.lang.toLowerCase()] || doc.lang) + '">\n<div class="WordSection1">\n' + (body || '<p>&nbsp;</p>') + '\n</div>\n</body>\n</html>\n';

    var parts = ['MIME-Version: 1.0',
      'Content-Type: multipart/related; boundary="' + boundary + '"; type="text/html"',
      '',
      'Documento de weBlogger en formato de archivo web de un solo archivo (MHTML).',
      '',
      '--' + boundary,
      'Content-Location: ' + BASE + 'documento.htm',
      'Content-Transfer-Encoding: quoted-printable',
      'Content-Type: text/html; charset="us-ascii"',
      '',
      quotedPrintable(asciiEntities(html)),
      ''];
    images.forEach(function (b) {
      parts.push('--' + boundary,
        'Content-Location: ' + BASE + 'documento_archivos/' + b.file,
        'Content-Transfer-Encoding: base64',
        'Content-Type: ' + b.mime,
        '',
        base64Lines(b.data),
        '');
    });
    parts.push('--' + boundary + '--', '');
    return parts.join('\r\n');
  }

  /* ================================================================
   * 8. Markdown
   * ================================================================ */

  function mdEsc(s) {
    return s.replace(/([\\`*_\[\]<])/g, '\\$1').replace(/&(?=#?\w+;)/g, '&amp;');
  }

  function mdUrl(u) { return u.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29'); }

  function mdRuns(runs) {
    return runs.map(function (r) {
      var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(r.text), core = m[2], h;
      if (!core) return r.text.replace(/\n/g, '  \n');
      h = mdEsc(core).replace(/\n/g, '  \n');
      if (r.sup) h = '<sup>' + h + '</sup>';
      else if (r.sub) h = '<sub>' + h + '</sub>';
      if (r.u) h = '<u>' + h + '</u>';
      if (r.s) h = '~~' + h + '~~';
      if (r.b && r.i) h = '***' + h + '***';
      else if (r.b) h = '**' + h + '**';
      else if (r.i) h = '*' + h + '*';
      if (r.link) h = '[' + h + '](' + mdUrl(r.link) + ')';
      return (m[1] + h + m[3]).replace(/ *\n/g, '  \n');
    }).join('');
  }

  /* evita que una línea de texto se lea como título, cita, lista o filete */
  function mdGuard(text) {
    return text.split('\n').map(function (line) {
      return line.replace(/^(\s*)(#{1,6}(?=\s|$)|>|[-+](?=\s)|(?:=+|-+)\s*$)/, '$1\\$2').replace(/^(\s*\d+)([.)])(?=\s)/, '$1\\$2');
    }).join('\n');
  }

  function mdCell(runs) { return mdRuns(runs).replace(/ *\n/g, '<br>').replace(/\|/g, '\\|').trim(); }

  function markdown(model) {
    var doc = normalize(model), pages = [];
    doc.pages.forEach(function (pg) {
      var out = [];
      pg.blocks.forEach(function (b) {
        var s, alt, fence;
        switch (b.t) {
          case 'h':
            out.push('#'.repeat(b.level) + ' ' + mdRuns(b.runs).replace(/\s*\n\s*/g, ' ').trim());
            break;
          case 'p':
            if (b.cls === 'code') {
              s = plain(b.runs);
              fence = '```';
              while (s.indexOf(fence) >= 0) fence += '`';
              out.push(fence + '\n' + s + '\n' + fence);
            } else out.push(mdGuard(mdRuns(b.runs).trim()));
            break;
          case 'quote':
            s = b.runs.length ? mdRuns(b.runs).trim().split('\n').map(function (l) { return ('> ' + l).replace(/\s+$/, function (w) { return w.length >= 2 ? '  ' : ''; }); }).join('\n') : '';
            if (b.cite) s += (s ? '\n>\n' : '') + '> \u2014 ' + mdEsc(b.cite);
            out.push(s);
            break;
          case 'list':
            out.push(b.items.map(function (it, i) {
              var mark = b.ordered ? (i + 1) + '. ' : '- ';
              return mark + mdRuns(it).trim().replace(/\n/g, '\n' + ' '.repeat(mark.length));
            }).join('\n'));
            break;
          case 'img':
            alt = mdEsc(b.alt || b.caption).replace(/\s*\n\s*/g, ' ');
            s = (b.data || b.url) ? '![' + alt + '](' + mdUrl(b.data ? b.file : b.url) + ')' : '';
            if (b.caption) s += (s ? '\n\n' : '') + '*' + mdEsc(b.caption).replace(/\s*\n\s*/g, ' ') + '*';
            if (s) out.push(s);
            break;
          case 'table':
            var head = b.head.length ? b.head[0] : null, rows = b.head.slice(1).concat(b.rows), lines = [], i;
            if (!head) { head = []; for (i = 0; i < b.cols; i++) head.push([]); }
            lines.push('| ' + head.map(mdCell).join(' | ') + ' |');
            lines.push('| ' + head.map(function () { return '---'; }).join(' | ') + ' |');
            rows.forEach(function (r) { lines.push('| ' + r.map(mdCell).join(' | ') + ' |'); });
            out.push(lines.join('\n'));
            break;
          case 'rule':
            out.push('---');
            break;
          default:
        }
      });
      if (out.length) pages.push(out.join('\n\n'));
    });
    return pages.join('\n\n* * *\n\n') + '\n';
  }

  /* ================================================================
   * 9. Texto sin formato
   * ================================================================ */

  var TXT_W = 76;

  function txtRuns(runs) {
    return runs.map(function (r) {
      var t = r.text.trim();
      return r.link && r.link !== t && r.link.replace(/^mailto:/, '') !== t
        ? r.text.replace(/\s*$/, function (w) { return ' (' + r.link + ')' + w; })
        : r.text;
    }).join('');
  }

  /* parte en líneas de `width` como mucho, respetando los saltos de línea propios */
  function wrap(text, width, first, rest) {
    var lines = [], started = false;
    first = first || ''; rest = rest === undefined ? first : rest;
    text.split('\n').forEach(function (par) {
      var cur = started ? rest : first, empty = true;
      started = true;
      par.split(/[ \t]+/).forEach(function (word) {
        if (!word) return;
        if (!empty && cur.length + 1 + word.length > width) { lines.push(cur); cur = rest; empty = true; }
        cur += (empty ? '' : ' ') + word;
        empty = false;
      });
      lines.push(empty ? cur.replace(/\s+$/, '') : cur);
    });
    return lines;
  }

  function padEnd(s, n) { while (s.length < n) s += ' '; return s; }

  function text(model) {
    var doc = normalize(model), pages = [];
    doc.pages.forEach(function (pg) {
      var out = [];
      pg.blocks.forEach(function (b) {
        var lines, len, s;
        switch (b.t) {
          case 'h':
            lines = wrap(plain(b.runs).toUpperCase().replace(/\s*\n\s*/g, ' ').trim(), TXT_W);
            len = 0;
            lines.forEach(function (l) { len = Math.max(len, l.length); });
            out.push(lines.join('\n') + '\n' + (b.level === 1 ? '=' : '-').repeat(Math.max(3, len)));
            break;
          case 'p':
            if (b.cls === 'code') {
              out.push(plain(b.runs).split('\n').map(function (l) { return '    ' + l; }).join('\n'));
            } else {
              lines = wrap(txtRuns(b.runs).trim(), TXT_W);
              if (b.align === 'center' || b.align === 'right') {
                lines = lines.map(function (l) {
                  var gap = TXT_W - l.length;
                  return gap > 0 ? ' '.repeat(b.align === 'center' ? Math.floor(gap / 2) : gap) + l : l;
                });
              }
              out.push(lines.join('\n'));
            }
            break;
          case 'quote':
            s = b.runs.length ? wrap(txtRuns(b.runs).trim(), TXT_W, '    ').join('\n') : '';
            if (b.cite) s += (s ? '\n' : '') + wrap('\u2014 ' + b.cite, TXT_W, '    ', '      ').join('\n');
            out.push(s);
            break;
          case 'list':
            out.push(b.items.map(function (it, i) {
              var mark = b.ordered ? (i + 1) + '. ' : '- ';
              return wrap(txtRuns(it).trim(), TXT_W, '  ' + mark, ' '.repeat(2 + mark.length)).join('\n');
            }).join('\n'));
            break;
          case 'img':
            s = b.caption || b.alt;
            s = wrap(s ? '[Imagen: ' + s.replace(/\s*\n\s*/g, ' ') + ']' : '[Imagen]', TXT_W, '', '  ').join('\n');
            if (b.url) s += '\n' + b.url;
            out.push(s);
            break;
          case 'table':
            var all = b.head.concat(b.rows).map(function (r) {
              return r.map(function (c) { return txtRuns(c).replace(/\s*\n\s*/g, ' ').trim(); });
            });
            var widths = [], i;
            for (i = 0; i < b.cols; i++) widths.push(1);
            all.forEach(function (r) { r.forEach(function (c, k) { widths[k] = Math.max(widths[k], c.length); }); });
            lines = [];
            all.forEach(function (r, n) {
              lines.push(r.map(function (c, k) { return padEnd(c, widths[k]); }).join('  ').replace(/\s+$/, ''));
              if (b.head.length && n === b.head.length - 1) lines.push(widths.map(function (w) { return '-'.repeat(w); }).join('  '));
            });
            out.push(lines.join('\n'));
            break;
          case 'rule':
            out.push(' '.repeat((TXT_W - 5) / 2 | 0) + '* * *');
            break;
          default:
        }
      });
      if (out.length) pages.push(out.join('\n\n'));
    });
    return pages.join('\n\n\n' + '='.repeat(TXT_W) + '\n\n\n') + '\n';
  }

  /* ================================================================
   * 10. Alta
   * ================================================================ */

  var office = { zip: zip, docx: docx, epub: epub, wordDoc: wordDoc, markdown: markdown, text: text };

  var host = (typeof WB !== 'undefined' && WB) ? WB : (root ? (root.WB = root.WB || {}) : {});
  host.office = office;
  if (typeof module !== 'undefined' && module && module.exports) module.exports = office;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this));
