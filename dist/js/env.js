/* ==========================================================================
   weBlogger - puente con el sistema y Setup.cfg
   Es el unico sitio que sabe si hay backend de Rust. En escritorio las
   llamadas van a los comandos de Tauri; abierto en un navegador se sustituyen
   por un almacen en localStorage, suficiente para probar la interfaz.
   ========================================================================== */
window.WB = {};

(function () {
  'use strict';

  var T = window.__TAURI__;
  WB.isDesktop = !!(T && T.core && T.core.invoke);

  /* ----------------------------------------------- sustitutos web ------- */
  var FS = 'wb.fs:';
  function norm(p) { return String(p).replace(/\\/g, '/'); }

  var web = {
    cfg_read: function () { return localStorage.getItem('wb.cfg') || ''; },
    cfg_write: function (a) { localStorage.setItem('wb.cfg', a.text); },
    env_info: function () { return { version: 'web', cfgPath: 'localStorage', defaultRoot: '/weBlogger', os: 'web' }; },
    list_pages: function (a) {
      var out = [];
      for (var n = 1; n < 500; n++) {
        var html = localStorage.getItem(FS + norm(a.folder) + '/' + (n === 1 ? 'index.html' : 'pagina-' + n + '.html'));
        if (html === null) break;
        var t = /<title>([^<]*)<\/title>/i.exec(html), pg = /data-wb-page="([^"]*)"/.exec(html), st = /data-wb-style="([^"]*)"/.exec(html);
        out.push({ number: n, file: '', title: t ? t[1] : '', name: pg ? pg[1] : '', style: st ? st[1] : '' });
      }
      return out;
    },
    list_articles: function (a) {
      var root = norm(a.root).replace(/\/$/, '') + '/';
      var out = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k.indexOf(FS + root) !== 0 || !/\/index\.html$/.test(k)) continue;
        var dir = k.slice(FS.length, -'/index.html'.length);
        if (dir.slice(root.length).indexOf('/') > -1) continue;
        var html = localStorage.getItem(k);
        var t = /<title>([^<]*)<\/title>/i.exec(html);
        var img = /<img[^>]*src="([^"]*)"/i.exec(html);
        out.push({ name: dir.slice(root.length), path: dir, title: t ? t[1] : '', description: '', cover: img ? img[1] : '', modified: 0 });
      }
      return out;
    },
    read_text: function (a) {
      var v = localStorage.getItem(FS + norm(a.path));
      if (v === null) throw new Error('no existe: ' + a.path);
      return v;
    },
    write_text: function (a) { localStorage.setItem(FS + norm(a.path), a.text); },
    read_b64: function (a) { return web.read_text(a); },
    write_b64: function (a) { localStorage.setItem(FS + norm(a.path), a.data); },
    path_exists: function (a) {
      var p = FS + norm(a.path);
      for (var i = 0; i < localStorage.length; i++) if (localStorage.key(i).indexOf(p) === 0) return true;
      return false;
    },
    remove_article: function (a) {
      var p = FS + norm(a.path) + '/';
      var del = [];
      for (var i = 0; i < localStorage.length; i++) if (localStorage.key(i).indexOf(p) === 0) del.push(localStorage.key(i));
      del.forEach(function (k) { localStorage.removeItem(k); });
    },
    pick_folder: function () { return null; },
    clean_pages: function () {},
    startup_file: function () { return null; },
    pick_save: function (a) { return '/weBlogger/exportado/' + a.name; },
    export_pdf: function () { throw new Error('el PDF solo se puede crear en la aplicación de escritorio'); },
    remove_page: function (a) {
      var base = FS + norm(a.folder) + '/';
      ['pagina-' + a.number + '.html', 'css/pagina-' + a.number + '.css', 'js/pagina-' + a.number + '.js'].forEach(function (r) { localStorage.removeItem(base + r); });
    },
    open_external: function () { throw new Error('solo en la aplicacion de escritorio'); },
    set_dirty: function () {},
    win_fullscreen: function () {
      if (document.fullscreenElement) { document.exitFullscreen(); return false; }
      document.documentElement.requestFullscreen();
      return true;
    },
    win_toggle_maximize: function () {},
    win_minimize: function () {},
    win_title: function (a) { document.title = a.title; },
    app_exit: function () { window.close(); }
  };

  WB.invoke = function (cmd, args) {
    if (WB.isDesktop) return T.core.invoke(cmd, args || {});
    return new Promise(function (resolve, reject) {
      try {
        if (!web[cmd]) throw new Error('orden desconocida: ' + cmd);
        resolve(web[cmd](args || {}));
      } catch (e) { reject(e); }
    });
  };

  WB.listen = function (event, fn) {
    if (WB.isDesktop && T.event) T.event.listen(event, fn);
  };

  /** Une trozos de ruta con el separador que ya traiga la primera. */
  WB.join = function () {
    var parts = Array.prototype.slice.call(arguments);
    var sep = parts[0].indexOf('\\') > -1 ? '\\' : '/';
    return parts.map(function (p, i) {
      p = String(p);
      if (i > 0) p = p.replace(/^[\\/]+/, '');
      if (i < parts.length - 1) p = p.replace(/[\\/]+$/, '');
      return sep === '\\' ? p.replace(/\//g, '\\') : p;
    }).join(sep);
  };

  /* ------------------------------------------------------ Setup.cfg ----- */
  // Texto plano, `Clave : Valor`. Los comentarios y las secciones que el
  // usuario escriba a mano se conservan al volver a guardar.
  var DEFAULT_CFG = [
    '; weBlogger - configuracion. Se puede editar a mano.',
    '',
    '[Entorno]',
    'Mod Screen : dark          ; light | dark | metal | blue',
    'Mod WidhtScreen : 340      ; ancho del panel en px',
    '',
    '[Dock]',
    'Dock Side : right          ; right | left | top | bottom',
    'Dock Open : true',
    '',
    '[Biblioteca]',
    'Blog Root :                ; vacio = Documentos/weBlogger',
    'Last Article :',
    ''
  ].join('\n');

  var lines = [];

  function parse(text) {
    lines = String(text || DEFAULT_CFG).split(/\r?\n/);
  }

  function find(key) {
    var k = key.toLowerCase();
    for (var i = 0; i < lines.length; i++) {
      var m = /^\s*([^;\[\]:][^:]*?)\s*:(.*)$/.exec(lines[i]);
      if (m && m[1].toLowerCase() === k) return { i: i, raw: m[2] };
    }
    return null;
  }

  WB.cfg = {
    K: {
      theme: 'Mod Screen', dockW: 'Mod WidhtScreen', dockSide: 'Dock Side',
      dockOpen: 'Dock Open', root: 'Blog Root', last: 'Last Article'
    },
    load: function () {
      return WB.invoke('cfg_read').then(function (t) { parse(t && t.trim() ? t : DEFAULT_CFG); });
    },
    get: function (key, def) {
      var f = find(key);
      if (!f) return def;
      var v = f.raw.split(';')[0].trim();
      return v === '' ? def : v;
    },
    set: function (key, value) {
      var f = find(key);
      var v = String(value === null || value === undefined ? '' : value);
      if (f) {
        var c = f.raw.indexOf(';');
        var comment = c > -1 ? '   ' + f.raw.slice(c) : '';
        lines[f.i] = key + ' : ' + v + comment;
      } else {
        lines.push(key + ' : ' + v);
      }
      WB.cfg.saveSoon();
    },
    save: function () { return WB.invoke('cfg_write', { text: lines.join('\n') }); },
    saveSoon: function () {
      clearTimeout(WB.cfg._t);
      WB.cfg._t = setTimeout(function () { WB.cfg.save().catch(function () {}); }, 500);
    }
  };
  parse(DEFAULT_CFG);
})();
