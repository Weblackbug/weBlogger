# weBlogger

Editor visual de artículos de blog sobre el entorno **n.k-7**: Rust + Tauri 2,
con el frontend en HTML, CSS y JavaScript plano (sin bundler ni Node).

## Descargar

- **[Instalador MSI para Windows (x64)](https://github.com/Weblackbug/weBlogger/releases/download/v1.2.0/weBlogger_1.2.0_x64_es-ES.msi)**: se instala con su acceso directo y abre los archivos `.weblog`.
- [Ejecutable portable](https://github.com/Weblackbug/weBlogger/releases/download/v1.2.0/weBlogger_1.2.0_x64_portable.exe): no necesita instalación (requiere WebView2, incluido en Windows 10/11).

Todas las versiones: [Releases](https://github.com/Weblackbug/weBlogger/releases).

Cada artículo es **una carpeta** lista para publicar:

```
mi-articulo/
├─ index.html
├─ css/estilos.css
├─ js/app.js
└─ imagenes/            las fotos que hayas puesto + creditos-imagenes.txt
```

No hay archivo de proyecto aparte. La paleta, las fuentes y los idiomas se
vuelven a leer de esos mismos archivos, así que weBlogger abre también los
artículos hechos a mano con esa estructura (los tres de ejemplo incluidos).

## Arrancar

```bash
cd src-tauri
cargo tauri dev                 # desarrollo
cargo tauri build --no-bundle   # ejecutable: target/release/weblogger.exe
cargo tauri build               # instaladores .exe (NSIS) y .msi
cargo test --lib                # pruebas del backend
```

Hace falta Rust estable y la CLI de Tauri 2 (`cargo install tauri-cli --version "^2" --locked`).

## Cómo se usa

1. **Biblioteca.** Al abrir se ven las plantillas (en blanco, diario y los tres
   reportajes de ejemplo) y los artículos de la carpeta de la biblioteca, que
   por defecto es `Documentos/weBlogger` y se cambia desde ahí mismo.
2. **Escribir.** El artículo se ve tal como quedará. Se hace clic en cualquier
   texto y se escribe encima: `Intro` abre un párrafo nuevo y `Mayús+Intro` un
   salto de línea. Pegar varios párrafos crea varios párrafos.
3. **Arrastrar a la página.** La pestaña *Elementos* del panel tiene secciones,
   columnas, ventanas, ventanas modales, pestañas, acordeones, cajas, titulares,
   citas, listas, texto artístico, imágenes, galerías, vídeo, tablas, tarjetas,
   cronologías… Se arrastran al sitio (una línea azul marca dónde caen) o se
   pulsan para añadirlos debajo de lo seleccionado.
4. **Imágenes.** Doble clic para cambiarla, o se arrastra un archivo desde el
   explorador encima. En *Propiedades*: alto, encuadre, zoom, volteo, filtros,
   pie, crédito y si se amplía al pulsarla. La imagen original no se toca.
5. **Formato.** La cinta de arriba hace de procesador de textos: estilo de
   párrafo, fuente, tamaño, negrita, color, resaltado, alineación, listas,
   enlaces, interlineado, efectos (sombra, relieve 3D, neón, degradado…) y
   símbolos. *Propiedades* añade a cualquier bloque caja, bordes, sombra, giro
   y perspectiva 3D.
6. **Texto artístico.** Curvado en arco, onda o círculo, con degradado,
   contorno, volumen e inclinación 3D. Se puede convertir un título en uno.
7. **Página.** Paleta (claro y oscuro), fuentes, esquinas, idiomas, y qué
   partes lleva: cabecera, portada, tira de datos, índice lateral, pie.
8. **Vista previa (F5).** La página funcionando de verdad dentro de la
   aplicación, a ancho de escritorio, tableta o móvil.

### Idiomas

Se marcan en *Página → Idiomas*. El idioma base va escrito en `index.html`; los
demás se guardan en `js/app.js`. Para traducir se elige el idioma en la barra
(o en el selector de la propia página) y se escribe encima. Lo que no esté
traducido se ve en el idioma base.

## Blog o periódico

Cada edición nueva (`Ctrl+N`) empieza eligiendo qué se va a publicar:

| | Blog | Periódico o revista |
|---|---|---|
| Para | la web | imprimir |
| Se maqueta | a lo ancho de la pantalla | sobre la hoja, a su tamaño real, con la línea de corte de cada hoja |
| Se lee | todas las páginas seguidas, deslizando (`Ver todas` o F5) | hoja a hoja |
| Se guarda | carpeta con su web: `index.html` con las páginas seguidas, `css/`, `js/`, `imagenes/`; con varias páginas, las páginas para editar van en `fuentes/` | un solo archivo `.weblog` |
| Se exporta | PDF, Word, EPUB, HTML, Markdown, texto | **PDF del tamaño del papel** y **Word**, además del resto |

Tamaños de papel: tabloide (280×430 mm), berlinés (315×470), sábana (375×597),
revista A4, revista grande (230×300) y A3. Se cambian en *Artículo → Tamaño del
papel* o en la barra de páginas. Una publicación puede pasar de blog a periódico
y al revés en *Artículo → Tipo de publicación*.

El formato `.weblog` es un ZIP sin comprimir con `manifest.json` (formato,
papel, título y lista de páginas), cada página en `paginas/N.html` con su hoja
y su script, y las imágenes en `imagenes/`. El instalador asocia los `.weblog`
a weBlogger: doble clic en el Explorador y se abren.

## PDF para imprenta

*Archivo → PDF para imprenta…* (`Ctrl+P`, también el primero de *Exportar*)
prepara un PDF para rotativa o imprenta digital:

- **Formato final y sangrado** de 3, 4 o 5 mm. Cada hoja mide el formato más el
  sangrado más 10 mm de zona de marcas, con sus cajas `TrimBox` y `BleedBox`.
- **Marcas de corte** en las cuatro esquinas, **dianas de registro** en el
  centro de cada lado y **barra de color** (C, M, Y, K al 100 % y al 50 %, gris
  al 25 %), todo en color de registro y sin texto.
- **CMYK**: todos los colores, degradados, imágenes y grupos de transparencia
  pasan a CMYK; el texto negro sale a una sola tinta (K 100 %) y la carga total
  de tinta se limita al 300 %. Es una conversión genérica, sin perfil ICC.
- **Fuentes incrustadas** (subconjuntos), comprobadas una a una.
- **Color del papel**: por defecto el fondo no lleva tinta, porque el color lo
  da el papel; se puede imprimir si se quiere simular sobre papel blanco.

Al terminar, un informe de comprobación previa dice cuántas páginas y hojas
salen, si todas las fuentes van incrustadas y si queda algo en RGB. Lo hace el
backend (`src-tauri/src/imprenta.rs`): imprime cada página con Edge o Chrome sin
ventana y postprocesa el PDF.

## Cortes de hoja

En modo periódico, el editor marca dónde corta cada hoja tal como lo hará el
PDF: una línea de texto nunca se parte (pasa entera a la hoja siguiente), un
párrafo nunca deja menos de tres líneas sueltas a un lado del corte, y las
fotos, titulares, citas y breves pasan enteros. Como cada columna corta por su
sitio, el corte se dibuja a trozos: en rojo, sobre cada columna, a la altura
real; rayado, lo que sube a la hoja siguiente; y la regla fija de la hoja, en
línea tenue.

## Redacción

- **Saltos de página**: *Elementos → Diario → Sigue en la página / Viene de la
  página*. Se elige la página de destino en Propiedades; el número se escribe
  solo y se corrige si las páginas cambian de orden.
- **Estado de cada página**: borrador, en corrección o cerrada, con
  responsable y hora de cierre (*Página → Redacción*, o el botón derecho sobre
  la pestaña). Se ve como un punto de color en la pestaña, y la barra dice
  cuántas páginas están cerradas.
- **Medida de la pieza**: al seleccionar algo, la barra de estado dice los
  caracteres, palabras, líneas y milímetros de alto de su pieza. En
  Propiedades se le pone un objetivo de caracteres y avisa en rojo si se pasa.

## Estilos de prensa, varias páginas y exportación

**Galería de estilos** (*Archivo → Nueva desde la galería de estilos*, `Ctrl+Mayús+N`):
504 estilos de prensa repartidos en seis tradiciones (España y Portugal; Reino
Unido e Irlanda, con la prensa escocesa, galesa e irlandesa; Estados Unidos y
Canadá; Europa continental; revistas, prensa del corazón y suplementos;
Australia, América Latina, Asia y África). Se buscan por nombre, ciudad, época
o rasgo («tabloide», «glasgow», «salmón», «gótica»…) y se filtran por tradición
o por maqueta.

Un estilo no es una plantilla dibujada: es una ficha de parámetros (cabecera,
filetes, titulares, densidad, tratamiento de fotos, etiquetas, capitular,
papel, colores y tres fuentes) que se aplica sobre una de las doce maquetas
(sábana, referencia, tabloide, modular, semanario, reportaje, corazón,
económico, deportivo, cultural, local y digital). Por eso se puede **cambiar el
estilo de una página sin tocar lo escrito**. Ningún estilo lleva el nombre de
un periódico real: las cabeceras son inventadas.

**Varias páginas**: cada publicación tiene tantas páginas como se quiera, cada
una con su estilo. Están en la barra de abajo: un clic cambia de página, doble
clic la renombra, el botón derecho la duplica, la mueve o la quita, y
*Página* añade otra. Al guardar, la primera es `index.html` y las demás
`pagina-2.html`, `pagina-3.html`…, cada una con su hoja y su script, y todas
con un paginador para pasar de una a otra.

**Exportar** (*Archivo → Exportar* o el botón de la barra de páginas):

| Formato | Qué conserva |
|---|---|
| PDF A3 | la maqueta de periódico de cada página, en hojas A3 (lo imprime Edge o Chrome sin ventana) |
| PDF A4 | lo mismo en A4 |
| Word (.docx) | el texto en orden de lectura, con estilos de párrafo, negritas, listas, tablas, imágenes y enlaces; cada página en hoja nueva |
| Word 97-2003 (.doc) | lo mismo, para versiones antiguas de Word |
| EPUB | libro electrónico, una página por capítulo |
| HTML en un archivo | todas las páginas con su maqueta, imágenes incluidas |
| Markdown y texto | el contenido limpio |

La carpeta guardada ya es la web en HTML + CSS + JavaScript. Microsoft
Publisher (.pub) no se puede generar: es un formato cerrado; Publisher sí abre
los documentos de Word.

Para ampliar el motor (fichas, maquetas, textos de muestra, conversores) el
contrato está en `herramientas/CONTRATOS.md`, con un comprobador para cada pieza.

## Atajos

| Tecla | Acción |
|---|---|
| `Ctrl+N` / `Ctrl+O` | artículo nuevo / biblioteca |
| `Ctrl+S` / `Ctrl+Mayús+S` | guardar / guardar como |
| `Ctrl+Z` / `Ctrl+Y` | deshacer / rehacer |
| `Ctrl+B` `Ctrl+I` `Ctrl+U` | negrita, cursiva, subrayado |
| `Ctrl+K` | enlace |
| `Ctrl+D` | duplicar el bloque |
| `Alt+↑` / `Alt+↓` | subir / bajar el bloque |
| `Supr` | borrar el bloque (sin el cursor en un texto) |
| `Esc` | salir del texto / seleccionar el contenedor |
| `F5` | vista previa |
| `F9` | plegar el panel |
| `F11` | pantalla completa |

## Estructura

```
weBlogger/
├─ Setup.cfg                    tema, panel y carpeta de la biblioteca (se crea solo)
├─ dist/                        frontend
│  ├─ index.html                armazón n.k-7 + sprite de iconos
│  ├─ css/tokens.css            variables y temas (dark, metal, blue y light)
│  ├─ css/base.css              ventana, menú, barras, dock (n.k-7)
│  ├─ css/components.css        botones, diálogos, avisos (n.k-7)
│  ├─ css/editor.css            cinta, escenario, marcos, paneles, biblioteca
│  ├─ plantilla/estilos.css     hoja de estilos que lleva cada artículo
│  ├─ plantilla/app.js          JavaScript que lleva cada artículo
│  ├─ plantilla/editor-frame.css  solo dentro del editor, no se exporta
│  └─ js/
│     ├─ env.js                 puente con Rust y Setup.cfg
│     ├─ dialogs.js  ui.js      diálogos, menús, dock, tema (n.k-7)
│     ├─ bloques.js             catálogo: tipos, elementos, fuentes, paletas
│     ├─ plantillas.js          plantillas de inicio
│     ├─ documento.js           leer y escribir la carpeta del artículo
│     ├─ editor.js              selección, escritura, arrastrar, deshacer
│     ├─ formato.js             cinta de texto, texto artístico, imágenes
│     ├─ paneles.js             elementos, propiedades, página, esquema
│     └─ app.js                 biblioteca, archivo, vista previa, menús
└─ src-tauri/src/lib.rs         archivos, selector de carpetas, ventana
```

### Cómo añadir cosas

- **Un elemento arrastrable**: una entrada en `WB.CATALOG` (`bloques.js`) con su
  HTML, su tipo en `WB.TYPES`, y sus reglas en `plantilla/estilos.css`.
- **Una paleta**: una entrada en `WB.PALETTES` (`bloques.js`).
- **Una fuente**: una línea en `WB.FONTS` con los pesos que existen de verdad en
  Google Fonts (un peso inexistente hace fallar la hoja entera).
- **Un tema de la aplicación**: un bloque `[data-theme]` en `tokens.css` y su
  nombre en `THEMES` (`ui.js`).

`Setup.cfg` vive en la raíz del proyecto en desarrollo; instalado, en `%APPDATA%/weBlogger` (o junto al ejecutable si ya hay uno allí: modo portable).
La variable de entorno `WEBLOGGER_CONFIG` tiene prioridad, útil para pruebas.
