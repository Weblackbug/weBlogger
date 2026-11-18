# Piezas de HTML para maquetas

Lo que una maqueta (`dist/js/maquetas/<id>.js`) puede usar. Todo tiene ya sus
estilos en `dist/plantilla/estilos.css`.

## Piezas disponibles

Todo esto ya tiene estilos en `dist/plantilla/estilos.css`. Úsalo tal cual; lo
que cambie en tu formato va en tu hoja.

**Huecos.** Un elemento con `data-wb-slot` admite que el usuario arrastre
bloques dentro. Los textos (`h2`, `h3`, `h4`, `p`, `li`, `figcaption > span`,
`.np-tag`…) se editan solos al hacer clic: no hay que marcar nada.

| Pieza | HTML |
|---|---|
| Cabecera | `<div class="np-nameplate [frak\|caps\|bar]"><h2 class="np-nameplate-name">…</h2><div class="np-nameplate-line"><span>…</span><span>…</span><span>…</span></div></div>` |
| Secciones | `<nav class="np-nav"><a href="#">…</a>…</nav>` |
| Última hora | `<div class="np-ticker"><span class="np-tag">…</span><span>…</span></div>` |
| Etiqueta | `<span class="np-tag">…</span>` · antetítulo sin fondo: `<span class="section-kicker">…</span>` |
| Titular | `<h2 class="np-title np-xl\|np-lg\|np-md\|np-sm [it] [light]">…</h2>` (también en `h3`) |
| Sumario | `<p class="np-deck">…</p>` |
| Rejilla de 12 columnas | `<div class="np-grid [rules]">` + piezas `WB.npStory(span, html)` (span de 2 a 12; con `rules` lleva filetes) `</div>` |
| Pieza a mano | `<div class="np-story" data-wb-slot style="--span:6;--rows:2">…</div>` |
| Imagen | `<figure class="media-figure" data-lightbox-src="…" data-lightbox-caption=""><img …/><figcaption class="media-figcaption"><span>pie</span><span class="license-tag">crédito</span></figcaption></figure>` |
| Fotonoticia | `<div class="np-cover [top] [frame]" data-lightbox-src="…" data-lightbox-caption=""><img …/><div class="np-cover-text"><span class="np-tag">…</span><h2 class="np-title np-lg">…</h2><p>…</p></div></div>` |
| Imagen entre columnas | `<div class="np-between" style="--iw:300px;--ih:240px;--top:72px"><div class="np-col" data-wb-slot>párrafos</div><div class="np-col" data-wb-slot>párrafos</div><figure class="np-between-fig" data-lightbox-src="…" data-lightbox-caption=""><img …/><figcaption><span>pie</span></figcaption></figure></div>` — cada columna necesita texto de sobra (unas 120 palabras) para rodear la imagen |
| Texto en columnas | `<div class="wb-flow" data-wb-slot style="column-count:3">párrafos…</div>` — un hijo con `class="… span-all"` cruza todas las columnas (una foto, un ladillo, una cita) |
| Letra capital | `<p class="lead-dropcap">…</p>` |
| Entradilla | `<p class="wb-lead">…</p>` |
| Cita destacada | `<p class="wb-pull">…</p>` · cita con autor: `<blockquote class="editorial-quote"><p>…</p><cite>…</cite></blockquote>` |
| Firma | `<div class="wb-byline"><span class="wb-byline-avatar">AB</span><div><strong class="wb-byline-name">…</strong><span class="wb-byline-meta">…</span></div></div>` |
| Despiece | `<div class="np-box" data-wb-slot><h3 class="np-title np-sm">…</h3>…</div>` |
| Breves | `<div class="np-briefs"><div class="np-brief"><h4>…</h4><p>…</p></div>…</div>` |
| Lo más leído | `<ol class="np-ranking"><li>…</li>…</ol>` |
| Opinión | `<div class="np-opinion"><img class="np-opinion-photo" src="…" alt="" /><div><span class="np-opinion-author">…</span><h3>…</h3><p>…</p></div></div>` |
| Columnas sueltas | `<div class="wb-cols [rule]" style="--cols:3"><div class="wb-col" data-wb-slot>…</div>…</div>` |
| Cifras | `<div class="stats-grid"><div class="stat-card"><div class="stat-value">…</div><div class="stat-label">…</div></div>…</div>` |
| Cronología | `<div class="timeline"><div class="timeline-item"><div class="timeline-year">…</div><p>…</p></div>…</div>` |
| Tabla | `<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>…</th></tr></thead><tbody><tr><td>…</td></tr></tbody></table></div>` |
| Separador | `<div class="wb-divider" data-style="line\|double\|accent\|dots\|orn\|thick"></div>` |
| Pie de página | `WB.PARTS.footer.html()` (va después de `</main>`) |

