/* ==========================================================================
   weBlogger - plantillas para empezar un blog. Los periodicos y revistas
   empiezan desde la galeria de estilos de prensa.
   ========================================================================== */
(function () {
  'use strict';

  function section(u, kicker, title, body) {
    return '<section class="article-section reveal" id="seccion-' + u + '"><span class="section-kicker">' + kicker + '</span><h2>' + title + '</h2>' + body + '</section>';
  }

  function wrap(toc, sections) {
    return '<main class="article-wrapper' + (toc ? '' : ' no-toc') + '">' + (toc ? WB.PARTS.toc.html() : '') +
      '<article class="article-content">' + sections + '</article></main>';
  }


  WB.TEMPLATES = [
    {
      id: 'blank', name: 'En blanco',
      desc: 'Cabecera, portada, índice y una sección vacía para empezar a escribir.',
      palette: 'terracota',
      build: function (name) {
        var hero = WB.PARTS.hero.html().replace('El titular de tu artículo va aquí', function () { return WB.esc(name); });
        return {
          body: WB.PARTS.header.html() + hero + wrap(true,
            section(WB.uid(), 'Primera parte', 'Título de la primera sección',
              '<p class="lead-dropcap">Empieza a escribir aquí. Haz clic sobre cualquier texto para cambiarlo y arrastra elementos desde el panel de la derecha para añadir imágenes, citas, tarjetas, ventanas o lo que necesites.</p><p>Cada vez que pulses Intro se crea un párrafo nuevo.</p>')) +
            WB.PARTS.footer.html(),
          set: {}
        };
      }
    }
  ];
})();
