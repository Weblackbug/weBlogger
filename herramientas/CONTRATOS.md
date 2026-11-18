# Contratos del motor de estilos de prensa

weBlogger compone páginas de periódico a partir de tres cosas independientes:

| Qué | Dónde | Se da de alta con | Se comprueba con |
|---|---|---|---|
| **Fichas de estilo** (500) | `dist/js/estilos/<grupo>.js` | `WB.addStyles(grupo, nombre, [...])` | `node herramientas/comprobar-estilos.mjs <grupo> <cuántas>` |
| **Maquetas** (12) | `dist/js/maquetas/<id>.js` | `WB.addLayout({...})` | `node herramientas/comprobar-maqueta.mjs <id>` |
| **Banco de textos** | `dist/js/banco.js` | `WB.bank = {...}` | `node herramientas/comprobar-banco.mjs` |
| **Conversores de oficina** | `dist/js/oficina.js` | `WB.office = {...}` | `node herramientas/comprobar-oficina.mjs` |

Los comandos se lanzan desde la raíz del proyecto (con Node en el PATH).
Todos tienen que acabar en `OK`.

**Regla común a todo:** los estilos se inspiran en tradiciones de prensa, no
suplantan a nadie. No se escribe el nombre de ningún periódico, revista o
agencia real, ni en nombres, ni en descripciones, ni en textos de muestra.
Las cabeceras de muestra son inventadas. Todo el texto es ficticio: ninguna
persona, empresa, partido, club ni noticia real. Idioma: español.

---

## 1. Fichas de estilo

Una ficha describe un periódico con parámetros. No lleva CSS ni HTML: la hoja
`dist/plantilla/estilos.css` (sección «MOTOR DE ESTILOS DE PRENSA») convierte
cada parámetro en diseño, y la maqueta compone la página.

```js
(function () {
  'use strict';
  WB.addStyles('reinounido', 'Reino Unido e Irlanda', [
    { id: 'reinounido-001',                       // <grupo>-NNN, correlativo
      name: 'Sábana conservadora londinense',     // nombre descriptivo propio (4-42 caracteres), único
      ref: 'Gran diario de sábana de Londres: seis columnas, serifa clásica y cabecera gótica', // 20-120 caracteres
      mast: 'The Meridian Courier',               // cabecera INVENTADA (3-26), única, en el idioma de esa prensa
      maqueta: 'sabana',
      display: 'Old Standard TT',                 // titulares  — solo nombres de WB.FONTS
      body: 'EB Garamond',                        // texto
      ui: 'Inter',                                // etiquetas, pies, firmas
      cabFont: 'Playfair Display',                // opcional: fuente propia de la cabecera
      c: ['#fbfaf6', '#141414', '#7a1f1f', '#1d3f6e'],   // [papel, tinta, acento, segundo acento]
      t: { cab: 'gotica', filetes: 'dobles', tit: 'normal', peso: '700', dens: 'densa',
           foto: 'bn', etq: 'texto', alin: 'centro', cap: 'clasica', just: 'si', radio: 'none' } },
    // ...
  ]);
})();
```

Parámetros (`t`) y sus valores. El primero es el de por defecto; lo que no
se escriba toma ese valor.

| Clave | Valores | Qué cambia |
|---|---|---|
| `cab` | `clasica` `versales` `gotica` `banda` `bloque` `manuscrita` `fina` | la cabecera: serena centrada, en versales, letra gótica, banda de color con el nombre en blanco, bloque inclinado de tabloide, letra manuscrita (exige `cabFont`: Pacifico, Dancing Script o Caveat), fina y muy espaciada |
| `filetes` | `finos` `ninguno` `dobles` `gruesos` | las líneas entre piezas y bajo la cabecera |
| `tit` | `normal` `versales` `cursiva` `condensada` | los titulares (condensada = versales apretadas: pide una fuente estrecha como Oswald, Anton o Bebas Neue) |
| `peso` | `700` `400` `900` | grosor de los titulares (900 solo luce con fuentes que lo tengan: Playfair Display, Montserrat, Archivo Black, Anton…) |
| `dens` | `media` `densa` `aireada` | cuerpo de letra, interlineado y aire entre piezas |
| `foto` | `normal` `bn` `calida` `saturada` `redonda` | tratamiento de las fotos |
| `etq` | `caja` `subrayada` `texto` `pastilla` | las etiquetas de sección |
| `alin` | `izq` `centro` | alineación de titulares en la rejilla |
| `cap` | `clasica` `ninguna` `color` `caja` | la letra capital |
| `just` | `no` `si` | texto justificado |
| `radio` | `none` `sm` `md` `lg` | esquinas |

Maquetas disponibles para `maqueta`:

| id | Para qué prensa |
|---|---|
| `sabana` | diario de sábana clásico: seis columnas estrechas, muchas piezas, titulares contenidos |
| `referencia` | diario generalista de referencia: cinco columnas, foto grande central, columna de opinión |
| `tabloide` | tabloide popular: un titular gigante, una foto enorme y llamadas alrededor |
| `modular` | diario moderno de módulos limpios, con cifras y despieces |
| `revista` | semanario: portada con foto a sangre y titular encima, más un sumario |
| `reportaje` | reportaje largo de lectura: titular enorme, columnas, citas, imagen entre columnas |
| `rosa` | prensa del corazón: mosaico de fotos, exclusivas, exclamaciones |
| `financiero` | diario económico: tabla de mercados, cifras, análisis |
| `deportivo` | diario deportivo: foto gigante, marcador, crónica |
| `cultural` | suplemento cultural: mucho aire, tipografía grande, crítica y agenda |
| `local` | semanario local o comarcal: agenda, breves, servicios |
| `digital` | medio nativo digital: tarjetas, última hora, lo más leído |

Colores: el papel es siempre claro; la tinta, casi negra; el acento tiene que
leerse sobre el papel. El tema oscuro se deriva solo. Hay papeles de muchos
tonos (blanco, marfil, crema, salmón de prensa económica, gris perla, rosa
pálido de prensa deportiva…): úsalos.

Lo que hace buena una colección de fichas:

- **Verdad de oficio.** Cada ficha recoge una manera real de hacer periódicos:
  el país, la época, el formato (sábana, berlinés, tabloide), el público. `ref`
  lo cuenta en una frase sin nombrar ninguna cabecera.
- **Variedad de verdad.** No valen veinte fichas iguales con otro color. Cambian
  la maqueta, la pareja de fuentes, la cabecera, la densidad, el papel.
- **Nombres con carácter**, en español, que digan de dónde viene el estilo:
  «Rotativo de Chicago de entreguerras», «Tabloide de mediodía de Glasgow»,
  «Semanario de salón parisino». Nunca «Estilo 37».
- **Cabeceras inventadas creíbles** en el idioma de esa prensa («The Harbour
  Sentinel», «Der Morgenbote», «La Gazette du Quai», «Il Faro della Sera»).

---

## 2. Maquetas

Una maqueta es una función que compone la página de muestra de cualquier ficha
que la use. Recibe un contexto y devuelve HTML.

```js
(function () {
  'use strict';
  WB.addLayout({
    id: 'sabana',
    name: 'Sábana clásica',                       // se ve en la galería
    desc: 'Seis columnas estrechas con filetes, titulares contenidos y mucha noticia.',
    build: function (c) {
      var lead = c.one('noticias');               // la noticia principal
      var portada =
        c.nameplate('Edición de la mañana', 'Año CXL · Número 51.204') +
        c.nav(7) +
        '<div class="np-grid rules">' +
          c.story(8, '<span class="np-tag">' + c.esc(lead.sec) + '</span>' +
            '<h2 class="np-title np-xl">' + c.title + '</h2>' +      // el titular del usuario, ya escapado
            '<p class="np-deck">' + c.esc(lead.sum) + '</p>' + c.fig('Pie de foto', 'Archivo') + c.ps(lead.txt, 2)) +
          // ...
        '</div>';
      return c.wrap(c.section('portada', portada) + c.section('interior', '…'));
    }
  });
})();
```

El contexto `c`:

| | |
|---|---|
| `c.title` | titular que escribió el usuario, **ya escapado**. Es el de la noticia principal. |
| `c.mast` | nombre de la cabecera de la ficha, ya escapado |
| `c.fecha` | fecha de hoy escrita («Martes, 17 de noviembre de 2026») |
| `c.t` | los parámetros de la ficha (`c.t.cab`, `c.t.dens`…), por si la maqueta quiere adaptarse |
| `c.st` | la ficha entera |
| `c.esc(texto)` | escapa HTML. **Todo** lo que venga del banco pasa por aquí. |
| `c.take(tipo, n)` | `n` elementos del banco sin repetir dentro de la página. Cada ficha empieza en un punto distinto, así dos estilos no muestran las mismas noticias. |
| `c.one(tipo)` | uno solo |
| `c.ps(parrafos, n)` | los `n` primeros párrafos como `<p>…</p>` ya escapados |
| `c.fig(pie, credito, clase)` | una imagen con su pie |
| `c.IMG` | la imagen de relleno (para `np-cover`, `np-between`, `np-opinion-photo`…) |
| `c.story(span, html)` | una pieza de la rejilla de 12 columnas |
| `c.nameplate(izq, der)` | la cabecera del diario con la línea de fecha |
| `c.nav(n)` | la barra de secciones |
| `c.section(prefijo, html, clase)` | `<section class="article-section" id="prefijo-xxxxx">` |
| `c.wrap(secciones)` | el envoltorio completo de la página, con el pie |
| `c.uid()` | identificador corto aleatorio |

Tipos del banco (`c.take`): `noticias` `opinion` `breves` `citas` `cifras`
`entrevistas` `cronologias` `rosa` `deportes` `mercados` `agenda`. Sus campos
están en el apartado 3. El banco puede ser pequeño: `take` da la vuelta, así
que nunca devuelve `undefined`, pero un campo sí puede faltar — usa
`c.esc(x.campo || '')`.

Piezas de HTML disponibles: las de la tabla de `herramientas/PIEZAS.md`
(rejilla `np-grid`, titulares `np-title np-xl|np-lg|np-md|np-sm`, sumario
`np-deck`, `np-tag`, fotonoticia `np-cover`, imagen entre columnas
`np-between`, texto en columnas `wb-flow` con hijos `span-all`, letra capital
`lead-dropcap`, cita `wb-pull`, firma `wb-byline`, despiece `np-box`, breves
`np-briefs`, lo más leído `np-ranking`, opinión `np-opinion`, cifras
`stats-grid`, cronología `timeline`, tabla `wb-table`, separadores
`wb-divider`…). Sus estilos están en `dist/plantilla/estilos.css`.

Reglas (las vigila el comprobador):

- Devuelve `c.wrap(...)` con dos o más `c.section(...)`.
- Usa `c.title` como titular principal y la cabecera de la ficha (`c.nameplate()`
  o `c.mast`).
- Nada de `<script>`, `onclick=`, `style` con colores fijos, direcciones de
  internet, `contenteditable` ni `data-i18n`.
- Las maquetas **no llevan CSS propio**: el carácter lo pone la ficha. Se
  permite `style="…"` solo para medidas de composición (`--span`, `--rows`,
  `--cols`, `column-count`, `--iw`, `--ih`, `--top`, alturas de foto).
- Al menos tres imágenes y unas 500-900 palabras de página.
- Tiene que funcionar con cualquier combinación de parámetros (titulares
  centrados, densidad alta, sin filetes…): no dependas de uno.

Lo que hace buena una maqueta: que parezca compuesta por un maquetador de
oficio. Una noticia manda y las demás se ordenan por cuerpo de titular y
columnas ocupadas; hay ritmo (piezas anchas y estrechas, con y sin foto); la
segunda sección cambia de registro (un reportaje, una doble página, la
opinión); y la página se lee con gusto.

---

## 3. Banco de textos

`dist/js/banco.js` define `WB.bank` entero (sustituye al mínimo que trae el motor):

```js
WB.bank = {
  secciones: ['Internacional', 'Nacional', …],                                   // 8 o más
  noticias: [{ sec, tit, sum, txt: [p1, p2, p3…], firma, lugar }],                // 48+, en 8+ secciones, párrafos de más de 120 caracteres
  opinion: [{ autor, tit, frase }],                                               // 20+
  breves: [{ tit, txt }],                                                         // 36+
  citas: [{ txt, autor }],                                                        // 20+
  cifras: [{ v, l }],                                                             // 24+   v: '37 %'   l: lo que mide
  entrevistas: [{ quien, cargo, qa: [{ p, r } ×5+] }],                            // 6+
  cronologias: [{ tit, hitos: [{ f, t } ×5+] }],                                  // 6+
  rosa: [{ tit, sum, txt: [p1, p2…] }],                                           // 20+  prensa del corazón, con famosos INVENTADOS
  deportes: [{ tit, sum, txt: [p1, p2…], marcador: { local, visit, gl, gv } }],   // 16+  clubes INVENTADOS, gl y gv enteros
  mercados: [{ n, v, d }],                                                        // 14+  índices y valores inventados
  agenda: [{ d, t, l }]                                                           // 14+  día, acto, lugar
};
```

Periodismo verosímil y bien escrito, en español, con sus tildes. Geografía
inventada pero coherente (un puñado de ciudades y comarcas que se repiten),
nombres propios inventados y variados. Registros distintos según el tipo: la
crónica deportiva no suena como el análisis económico ni como la prensa rosa.

---

## 4. Conversores de oficina

`dist/js/oficina.js` define `WB.office` con funciones **puras** (sin DOM, sin
`window`, sin red): reciben el modelo de la publicación y devuelven bytes o texto.
Tiene que funcionar igual en el navegador y en Node.

```js
WB.office = {
  zip(files),        // [{ name, data: Uint8Array | string }] -> Uint8Array   (ZIP sin compresión, con CRC-32 correcto)
  docx(doc),         // -> Uint8Array   Word moderno (WordprocessingML)
  epub(doc),         // -> Uint8Array   EPUB 3 (con «mimetype» el primero y sin comprimir)
  wordDoc(doc),      // -> string       .doc que abre Word 97-2003: MHTML con las imágenes como partes
  markdown(doc),     // -> string
  text(doc)          // -> string
};
```

El modelo:

```js
doc   = { title, lang: 'es', creator: 'weBlogger', pages: [{ name, title, blocks: [...] }] }
block = { t: 'h', level: 1..4, runs }
      | { t: 'p', runs, cls: '' | 'lead' | 'note' | 'kicker' | 'code', align: '' | 'center' | 'right' | 'justify' }
      | { t: 'quote', runs, cite }
      | { t: 'list', ordered, items: [runs, runs…] }
      | { t: 'img', name: 'imagen-1.png', mime: 'image/png' | 'image/jpeg', data: Uint8Array | null, url: string | null, w, h, caption, alt }
      | { t: 'table', head: [[runs…]], rows: [[runs…]] }
      | { t: 'rule' }
run   = { text, b?, i?, u?, s?, sup?, sub?, color?: '#rrggbb', link?: 'https://…' }     // text puede ser '\n' (salto de línea)
```

- Cada página empieza en hoja nueva (salto de página en Word, capítulo en EPUB).
- Una imagen con `data` va incrustada; con solo `url`, se pone el pie y un enlace.
- En Word las imágenes no pasan de 16 cm de ancho, conservando la proporción.
- El resultado tiene que abrirse sin avisos en Word y en LibreOffice (docx), y
  pasar un validador de EPUB razonable.
