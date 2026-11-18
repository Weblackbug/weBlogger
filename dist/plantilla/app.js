/* ==========================================================
   Artículo creado con weBlogger.
   Idiomas, tema claro / oscuro, visor de imágenes, ventanas
   modales, pestañas, índice activo y barra de lectura.
   ========================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'wb_' + (root.getAttribute('data-wb-key') || 'articulo');
  var translations = window.WB_I18N || {};

  function store(name, value) {
    try {
      if (value === undefined) return localStorage.getItem(KEY + '_' + name);
      localStorage.setItem(KEY + '_' + name, value);
    } catch (e) {}
    return null;
  }

  function each(sel, fn, base) {
    Array.prototype.forEach.call((base || document).querySelectorAll(sel), fn);
  }

  /* ---------------------------------------------- idiomas ---- */
  var baseLang = root.lang || 'es';
  var baseTexts = {};
  each('[data-i18n]', function (el) { baseTexts[el.getAttribute('data-i18n')] = el.innerHTML; });

  function setLanguage(lang) {
    var dict = lang === baseLang ? baseTexts : (translations[lang] || {});
    root.lang = lang;
    each('[data-i18n]', function (el) {
      var key = el.getAttribute('data-i18n');
      var text = dict[key];
      if (text === undefined || text === null || text === '') text = baseTexts[key];
      if (text !== undefined) el.innerHTML = text;
    });
    each('.lang-btn', function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    store('lang', lang);
  }

  each('.lang-btn', function (btn) {
    btn.addEventListener('click', function () { setLanguage(btn.getAttribute('data-lang')); });
  });

  var savedLang = store('lang');
  if (savedLang && savedLang !== baseLang && translations[savedLang]) setLanguage(savedLang);

  /* ------------------------------------ tema claro / oscuro ---- */
  var SUN = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
  var MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
  // puede haber varios (un blog de varias paginas lleva uno en cada cabecera)
  var themeToggles = document.querySelectorAll('.theme-btn');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    each('.theme-btn svg', function (icon) { icon.innerHTML = theme === 'dark' ? SUN : MOON; });
  }

  var savedTheme = store('theme');
  applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : (root.getAttribute('data-theme') || 'light'));

  Array.prototype.forEach.call(themeToggles, function (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      store('theme', next);
    });
  });

  /* --------------------------------------- visor de imágenes ---- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightboxImg.removeAttribute('src');
  }

  if (lightbox && lightboxImg) {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest ? e.target.closest('[data-lightbox-src]') : null;
      if (!trigger || e.target.closest('a')) return;
      lightboxImg.src = trigger.getAttribute('data-lightbox-src');
      if (lightboxCaption) lightboxCaption.textContent = trigger.getAttribute('data-lightbox-caption') || '';
      lightbox.classList.add('open');
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.closest('.lightbox-close')) closeLightbox();
    });
  }

  /* --------------------------------------- ventanas modales ---- */
  function closeModals() {
    each('.wb-modal.open', function (m) { m.classList.remove('open'); });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var opener = e.target.closest('[data-wb-modal-open]');
    if (opener) {
      e.preventDefault();
      var modal = document.getElementById(opener.getAttribute('data-wb-modal-open'));
      if (modal) modal.classList.add('open');
      return;
    }
    if (e.target.classList.contains('wb-modal') || e.target.closest('.wb-modal-close')) closeModals();
  });

  /* --------------------------------------------- pestañas ---- */
  document.addEventListener('click', function (e) {
    var tab = e.target.closest ? e.target.closest('.wb-tab') : null;
    if (!tab) return;
    e.preventDefault();
    var box = tab.closest('.wb-tabs');
    var tabs = box.querySelectorAll(':scope > .wb-tab-bar > .wb-tab');
    var panels = box.querySelectorAll(':scope > .wb-tab-panel');
    Array.prototype.forEach.call(tabs, function (t, i) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      if (panels[i]) panels[i].classList.toggle('is-active', on);
    });
  });

  /* ------------------------------ enlaces dentro de la página ---- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link || link.classList.contains('wb-tab') || link.hasAttribute('data-wb-modal-open')) return;
    var id = link.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : document.body;
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeLightbox();
    closeModals();
  });

  /* ------------------- barra de lectura, índice y aparición ---- */
  var readingProgress = document.getElementById('readingProgress');
  var sections = document.querySelectorAll('.article-section');
  var tocLinks = document.querySelectorAll('.toc-list a');

  function onScroll() {
    var scrollTop = window.scrollY;
    var docHeight = root.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (readingProgress) readingProgress.style.width = Math.min(100, Math.max(0, pct)) + '%';

    var currentId = '';
    Array.prototype.forEach.call(sections, function (sec) {
      if (scrollTop >= sec.offsetTop - 160) currentId = sec.id;
    });
    Array.prototype.forEach.call(tocLinks, function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }

  /* Lo que entra en pantalla aparece. Se mide en cada desplazamiento en vez
     de con un observador: asi funciona igual dentro de un marco o con la
     ventana tapada, y nada se queda invisible. */
  function reveal() {
    var limit = window.innerHeight * 0.94;
    each('.reveal:not(.visible)', function (el) {
      if (el.getBoundingClientRect().top < limit) el.classList.add('visible');
    });
  }

  window.addEventListener('scroll', function () { onScroll(); reveal(); }, { passive: true });
  window.addEventListener('resize', reveal);
  window.addEventListener('load', reveal);
  onScroll();
  reveal();
})();
