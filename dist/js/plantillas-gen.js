/* ==========================================================================
   weBlogger - coleccion de plantillas generadas.

   28 temas (cada uno con sus marcas, textos, cifras, pasos, preguntas,
   ilustraciones y fondos) x 9 estructuras de pagina = 252 plantillas
   originales. Cada una lleva ademas su paleta a medida (calculada a partir
   del color del tema), su pareja de fuentes y su fondo del catalogo, asi que
   no hay dos iguales. Todo el texto es propio y sirve de guia para escribir.
   ========================================================================== */
(function () {
  'use strict';

  var K = WB.tplKit;
  if (!K) return;
  var e = K.e, header = K.header, hero = K.hero, stats = K.stats, figure = K.figure, ps = K.ps, first = K.first,
    cards = K.cards, timeline = K.timeline, specs = K.specs, quote = K.quote, gallery = K.gallery, callout = K.callout,
    section = K.section, body = K.body, pageBg = K.pageBg, page = K.page;

  /* ------------------------------------------------------- color ----- */

  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    var a = s * Math.min(l, 1 - l);
    var f = function (n) { var k = (n + h / 30) % 12; var c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, '0'); };
    return '#' + f(0) + f(8) + f(4);
  }
  var PKEYS = ['bgPrimary', 'bgSecondary', 'bgCard', 'textPrimary', 'textSecondary', 'textMuted', 'accent', 'accentHover', 'border'];
  /** Paleta completa (clara y oscura) a partir del tono del papel y del acento. */
  function palette(name, paperHue, accHue, sat, warm) {
    var ps0 = warm ? 30 : 12;
    var L = [hsl(paperHue, ps0, 97), hsl(paperHue, ps0, 93), hsl(paperHue, ps0 + 10, 99.4), hsl(paperHue, 18, 11), hsl(paperHue, 9, 30), hsl(paperHue, 7, 46), hsl(accHue, sat, 38), hsl(accHue, sat, 30), hsl(paperHue, 16, 86)];
    var D = [hsl(paperHue, 12, 8), hsl(paperHue, 11, 11), hsl(paperHue, 10, 13.5), hsl(paperHue, 18, 95), hsl(paperHue, 9, 78), hsl(paperHue, 7, 58), hsl(accHue, Math.min(90, sat + 5), 63), hsl(accHue, Math.min(90, sat + 5), 71), hsl(paperHue, 10, 21)];
    var o = { name: name, accent2: hsl(accHue + 150, 45, 42), light: {}, dark: {} };
    PKEYS.forEach(function (k, i) { o.light[k] = L[i]; o.dark[k] = D[i]; });
    return o;
  }

  var FONTS = [
    ['Playfair Display', 'Inter'], ['Cormorant Garamond', 'Plus Jakarta Sans'], ['Merriweather', 'Open Sans'], ['Lora', 'Lora'],
    ['DM Serif Display', 'Inter'], ['Libre Baskerville', 'Source Serif 4'], ['EB Garamond', 'EB Garamond'], ['Montserrat', 'Open Sans'],
    ['Poppins', 'Inter'], ['Raleway', 'Roboto'], ['Space Grotesk', 'Inter'], ['Oswald', 'Roboto'], ['Bebas Neue', 'Roboto'],
    ['Archivo Black', 'Inter'], ['Abril Fatface', 'Lora'], ['Roboto Slab', 'Roboto'], ['Old Standard TT', 'Libre Baskerville'],
    ['Caveat', 'Plus Jakarta Sans'], ['Dancing Script', 'Lora'], ['Anton', 'Inter'], ['Source Serif 4', 'Source Serif 4'], ['Pacifico', 'Poppins']
  ];
  var RADII = ['sm', 'md', 'lg', 'md', 'none', 'lg'];

  /* ------------------------------------------------------- temas ----- */
  /* s: escenas de ilustraciones.js; bg: fondos del catalogo */

  var TOPICS = [
    { id: 'huerto', name: 'Jardín y huerto', hue: 110, warm: 1, fk: [1, 3, 17], brands: ['EL BANCAL', 'RAÍZ Y HOJA', 'HUERTO URBANO'], em: '🌱',
      badge: 'Huerto · Temporada de otoño', lead: 'Qué plantar este mes, cómo cuidar la tierra sin química y los trucos que funcionan en un balcón pequeño.',
      meta: ['🌦️ Otoño', '🪴 Nivel principiante', '✍️ Autor'], stats: [['12', 'Cultivos del mes'], ['3 m²', 'Basta para empezar'], ['0', 'Pesticidas'], ['90 días', 'Hasta la cosecha']],
      cards: [['Preparar la tierra', 'Compost, acolchado y paciencia: la base de todo.'], ['Elegir semillas', 'Variedades locales que se adaptan al clima.'], ['Regar bien', 'Poco y a menudo, mejor a primera hora.'], ['Plagas sin química', 'Plantas aliadas y remedios caseros.']],
      steps: ['Prepara la tierra con compost maduro.', 'Siembra a la profundidad que indica el sobre.', 'Riega con suavidad los primeros días.', 'Aclara las plantas cuando tengan cuatro hojas.'],
      tl: [['Septiembre', 'Siembra de hoja verde y ajos.'], ['Noviembre', 'Habas, guisantes y cebollas.'], ['Febrero', 'Semilleros protegidos para primavera.']],
      sp: [['Luz', 'Al menos 6 horas de sol'], ['Riego', 'Dos veces por semana'], ['Cosecha', 'A los 60-90 días']],
      q: ['La tierra devuelve lo que le das, pero a su ritmo.', 'Un hortelano veterano'], faq: [['¿Se puede tener huerto en un balcón?', 'Sí: con macetas de 30 cm de fondo y buena luz.'], ['¿Cuándo se abona?', 'Al preparar la tierra y a mitad de cultivo.']],
      s: [7, 6, 20, 10], bg: ['madera-olivo', 'lino-natural', 'hojas', 'kraft'] },
    { id: 'panaderia', name: 'Panadería y repostería', hue: 30, warm: 1, fk: [14, 0, 18], brands: ['MASA MADRE', 'EL HORNO DE CASA', 'MIGA Y CORTEZA'], em: '🥖',
      badge: 'Pan · Receta de fin de semana', lead: 'Pan de verdad hecho en casa: harina, agua, sal, tiempo y un horno corriente.',
      meta: ['⏱️ 24 h (casi todo espera)', '🔥 Horno a 240 °C', '✍️ Autor'], stats: [['4', 'Ingredientes'], ['75 %', 'Hidratación'], ['18 h', 'Fermentación'], ['1', 'Horno de casa']],
      cards: [['La harina', 'De fuerza para empezar; integral cuando le cojas el truco.'], ['La masa madre', 'Cómo crearla en una semana y mantenerla viva.'], ['El amasado', 'Pliegues suaves en lugar de amasar sin parar.'], ['El horneado', 'Vapor al principio y paciencia al final.']],
      steps: ['Mezcla harina y agua y deja reposar una hora.', 'Añade la masa madre y la sal.', 'Haz cuatro tandas de pliegues cada media hora.', 'Forma, deja fermentar en frío y hornea con vapor.'],
      tl: [['Viernes noche', 'Refresca la masa madre.'], ['Sábado', 'Amasado, pliegues y formado.'], ['Domingo', 'Horneado y desayuno.']],
      sp: [['Harina', '500 g de fuerza'], ['Agua', '375 g templada'], ['Sal', '10 g']],
      q: ['El pan bueno no tiene prisa: el tiempo es el ingrediente secreto.', 'Una panadera de pueblo'], faq: [['¿Puedo usar levadura seca?', 'Sí: 3 g bastan para 500 g de harina.'], ['¿Por qué no sube?', 'Casi siempre es frío: busca un rincón templado.']],
      s: [6, 14, 7, 3], bg: ['madera-roble', 'kraft', 'mantel-cuadros', 'folio-marfil'] },
    { id: 'vino', name: 'Vinos y bodegas', hue: 345, warm: 1, fk: [6, 4, 16], brands: ['LA COPA LENTA', 'CEPA VIEJA', 'NOTAS DE CATA'], em: '🍷',
      badge: 'Vino · Nota de cata', lead: 'Visitamos la bodega, probamos sus vinos y te contamos cuáles merecen la pena y con qué tomarlos.',
      meta: ['📍 Denominación de origen', '🍇 Variedad', '✍️ Autor'], stats: [['1920', 'Fundación de la bodega'], ['14 ha', 'Viñedo propio'], ['6', 'Vinos catados'], ['8,9', 'Nota media']],
      cards: [['El viñedo', 'Suelo, clima y la mano de quien lo trabaja.'], ['La bodega', 'Depósitos, barricas y el silencio de la cueva.'], ['La cata', 'Vista, nariz y boca: cómo describir lo que bebes.'], ['El maridaje', 'Qué platos lo hacen brillar.']],
      steps: ['Sirve a la temperatura adecuada.', 'Observa el color contra un fondo blanco.', 'Huele sin mover y después moviendo la copa.', 'Prueba un sorbo pequeño y deja que recorra la boca.'],
      tl: [['Vendimia', 'Septiembre, a mano y en cajas pequeñas.'], ['Crianza', 'Doce meses en barrica de roble.'], ['Botella', 'Seis meses más de reposo antes de salir.']],
      sp: [['Variedad', 'Uva principal'], ['Crianza', '12 meses en barrica'], ['Temperatura', '16 °C']],
      q: ['Un vino se hace en el campo; en la bodega solo se cuida.', 'El enólogo de la casa'], faq: [['¿Hay que decantarlo?', 'Los jóvenes no; los de guarda, media hora antes.'], ['¿Cuánto aguanta abierto?', 'Dos o tres días con tapón y en frío.']],
      s: [20, 7, 5, 0], bg: ['madera-cerezo', 'pergamino', 'terciopelo', 'marmol-rosa'] },
    { id: 'cafe', name: 'Café y té', hue: 25, warm: 1, fk: [2, 9, 10], brands: ['TAZA LENTA', 'TUESTE MEDIO', 'LA HORA DEL TÉ'], em: '☕',
      badge: 'Café · Método de filtrado', lead: 'Del grano a la taza: cómo preparar en casa un café que no tiene nada que envidiar al de la cafetería.',
      meta: ['⏱️ 4 minutos', '☕ 1 taza', '✍️ Autor'], stats: [['15 g', 'De café'], ['250 ml', 'De agua'], ['93 °C', 'Temperatura'], ['3:30', 'Minutos de extracción']],
      cards: [['El grano', 'Recién tostado y molido justo antes.'], ['El agua', 'Filtrada y sin hervir del todo.'], ['La molienda', 'Media para filtro, fina para espresso.'], ['La proporción', 'Una parte de café por quince de agua.']],
      steps: ['Calienta el agua a unos 93 °C.', 'Muele 15 g de café a punto medio.', 'Vierte un poco de agua y espera 30 segundos.', 'Termina de verter en círculos lentos.'],
      tl: [['Origen', 'Fincas de altura y recogida a mano.'], ['Tueste', 'Pequeños lotes cada semana.'], ['Taza', 'Notas de chocolate y fruta roja.']],
      sp: [['Origen', 'País y región'], ['Tueste', 'Medio'], ['Notas', 'Chocolate, cereza']],
      q: ['Un buen café es una pausa que se bebe.', 'Un tostador de barrio'], faq: [['¿Se puede guardar molido?', 'Mejor no: pierde aroma en horas.'], ['¿Qué cafetera para empezar?', 'Un gotero de filtro es barato y agradecido.']],
      s: [6, 19, 0, 3], bg: ['madera-nogal', 'kraft', 'papel-envejecido', 'marmol-blanco'] },
    { id: 'montana', name: 'Montaña y senderismo', hue: 150, warm: 0, fk: [11, 7, 15], brands: ['CIMA Y COLLADO', 'PASO A PASO', 'SENDA ALTA'], em: '⛰️',
      badge: 'Ruta · Dificultad media', lead: 'Una ruta circular con lagos, un refugio para comer y vistas que se recuerdan durante años.',
      meta: ['📍 Macizo', '⏱️ 6 h', '📈 900 m de desnivel'], stats: [['14 km', 'Distancia'], ['900 m', 'Desnivel'], ['6 h', 'Duración'], ['2', 'Lagos']],
      cards: [['Antes de salir', 'Parte meteorológico, mapa y alguien que sepa tu ruta.'], ['La mochila', 'Agua, abrigo, comida y botiquín.'], ['El ritmo', 'Que puedas hablar mientras subes.'], ['La bajada', 'Bastones y rodillas flexionadas.']],
      steps: ['Aparca en el refugio de la entrada del valle.', 'Sigue las marcas hasta el primer lago.', 'Sube por la pedrera hasta el collado.', 'Baja por el bosque cerrando el círculo.'],
      tl: [['Km 0', 'Salida desde el aparcamiento.'], ['Km 6', 'Lago y almuerzo.'], ['Km 9', 'Collado: el punto más alto.']],
      sp: [['Distancia', '14 km circular'], ['Desnivel', '900 m'], ['Época', 'De junio a octubre']],
      q: ['La montaña no es de quien llega antes, sino de quien vuelve.', 'Dicho de refugio'], faq: [['¿Hace falta experiencia?', 'Basta con estar en forma y llevar buen calzado.'], ['¿Hay agua en la ruta?', 'Solo en el refugio: lleva al menos dos litros.']],
      s: [2, 10, 9, 21], bg: ['mapa-topografico', 'niebla', 'pizarra-piedra', 'cielo-nubes'] },
    { id: 'bici', name: 'Ciclismo', hue: 200, warm: 0, fk: [11, 12, 13], brands: ['PEDAL Y PIÑÓN', 'RUEDA LIBRE', 'KILÓMETRO CERO'], em: '🚲',
      badge: 'Bici · Ruta de domingo', lead: 'Ochenta kilómetros por carreteras secundarias, un puerto asequible y un café a mitad de camino.',
      meta: ['📍 Comarca', '🚴 80 km', '⛰️ 1 puerto'], stats: [['80 km', 'Distancia'], ['1.100 m', 'Desnivel'], ['27 km/h', 'Media'], ['1', 'Café obligatorio']],
      cards: [['La bici', 'Revisa frenos, presión y cadena antes de salir.'], ['La ropa', 'Por capas: se sube con calor y se baja con frío.'], ['La comida', 'Come antes de tener hambre.'], ['La seguridad', 'Luces, casco y carreteras con arcén.']],
      steps: ['Sal temprano para evitar tráfico.', 'Rueda suave los primeros veinte minutos.', 'Sube el puerto a tu ritmo, sin mirar a nadie.', 'Para a comer en el pueblo y vuelve por el valle.'],
      tl: [['Km 0', 'Salida desde la plaza.'], ['Km 35', 'Cima del puerto.'], ['Km 50', 'Café en el pueblo.']],
      sp: [['Distancia', '80 km'], ['Desnivel', '1.100 m'], ['Firme', 'Asfalto en buen estado']],
      q: ['Las cuestas también se acaban; lo que no se acaba es la vista.', 'Un compañero de grupeta'], faq: [['¿Bici de carretera o de gravel?', 'Esta ruta se hace con cualquiera de las dos.'], ['¿Cómo evito pinchazos?', 'Cubiertas en buen estado y presión correcta.']],
      s: [25, 9, 2, 7], bg: ['grad-oceano', 'geo-rayas', 'acero', 'cielo-nubes'] },
    { id: 'correr', name: 'Correr', hue: 10, warm: 0, fk: [12, 19, 8], brands: ['ZANCADA', 'KILÓMETRO A KILÓMETRO', 'META'], em: '🏃',
      badge: 'Entrenamiento · Plan de 8 semanas', lead: 'De cero a correr diez kilómetros en ocho semanas, sin lesiones y sin dejarlo a la tercera.',
      meta: ['📅 8 semanas', '🏃 3 días por semana', '✍️ Autor'], stats: [['8', 'Semanas'], ['3', 'Días por semana'], ['10 km', 'Objetivo'], ['0', 'Excusas']],
      cards: [['Las zapatillas', 'Cómodas y para tu pisada: no hace falta más.'], ['El calentamiento', 'Cinco minutos andando y movilidad.'], ['El ritmo', 'Que puedas mantener una conversación.'], ['El descanso', 'Los días sin correr también entrenan.']],
      steps: ['Semanas 1-2: alterna un minuto corriendo y uno andando.', 'Semanas 3-4: tres minutos corriendo, uno andando.', 'Semanas 5-6: veinte minutos seguidos.', 'Semanas 7-8: sube poco a poco hasta los diez kilómetros.'],
      tl: [['Semana 1', 'Primeros minutos corriendo.'], ['Semana 5', 'Veinte minutos sin parar.'], ['Semana 8', 'Los primeros 10 km.']],
      sp: [['Frecuencia', '3 días por semana'], ['Duración', '30-60 minutos'], ['Objetivo', '10 km']],
      q: ['El kilómetro más difícil es el que te lleva a la puerta de casa.', 'Refrán de corredores'], faq: [['¿Correr en ayunas?', 'Solo en salidas suaves y si te sienta bien.'], ['¿Y si me duele algo?', 'Para, descansa y consulta si no mejora.']],
      s: [4, 25, 11, 3], bg: ['geo-zigzag', 'grad-fuego', 'hormigon', 'geo-marinero'] },
    { id: 'yoga', name: 'Yoga y bienestar', hue: 280, warm: 1, fk: [1, 18, 9], brands: ['RESPIRA', 'CALMA', 'EQUILIBRIO'], em: '🧘',
      badge: 'Bienestar · Práctica de 20 minutos', lead: 'Una secuencia suave para empezar el día con energía y terminarlo sin tensiones.',
      meta: ['⏱️ 20 min', '🧘 Todos los niveles', '✍️ Autora'], stats: [['20 min', 'Duración'], ['8', 'Posturas'], ['0', 'Material especial'], ['1', 'Esterilla']],
      cards: [['La respiración', 'Lenta, por la nariz, guiando cada movimiento.'], ['La postura', 'Sin forzar: el cuerpo marca el límite.'], ['La constancia', 'Diez minutos diarios mejor que una hora a la semana.'], ['El descanso', 'La relajación final es parte de la práctica.']],
      steps: ['Siéntate y respira despacio durante dos minutos.', 'Calienta columna y caderas con movimientos suaves.', 'Encadena las posturas de pie sin prisa.', 'Termina tumbado, en silencio, cinco minutos.'],
      tl: [['Inicio', 'Respiración y calentamiento.'], ['Centro', 'Posturas de pie y equilibrio.'], ['Final', 'Estiramientos y relajación.']],
      sp: [['Duración', '20 minutos'], ['Nivel', 'Principiante'], ['Momento', 'Al despertar']],
      q: ['No se trata de tocarse los pies, sino de lo que aprendes por el camino.', 'Una profesora de yoga'], faq: [['¿Necesito ser flexible?', 'No: la flexibilidad llega practicando.'], ['¿Mejor por la mañana o por la noche?', 'Cuando puedas ser constante.']],
      s: [11, 10, 12, 2], bg: ['grad-lavanda', 'washi', 'seda', 'grad-algodon'] },
    { id: 'crianza', name: 'Crianza y familia', hue: 15, warm: 1, fk: [17, 8, 3], brands: ['CASA CON NIÑOS', 'PEQUEÑOS PASOS', 'LA TRIBU'], em: '👶',
      badge: 'Familia · Ideas para el fin de semana', lead: 'Planes sencillos, baratos y sin pantallas para disfrutar en familia cualquier sábado.',
      meta: ['👨‍👩‍👧 Todas las edades', '💶 Gratis o casi', '✍️ Autora'], stats: [['10', 'Planes'], ['0 €', 'La mayoría'], ['2-10', 'Años'], ['1', 'Tarde libre']],
      cards: [['En casa', 'Cocinar juntos, construir una cabaña, un cine de sábanas.'], ['En el parque', 'Búsqueda del tesoro y juegos de siempre.'], ['En la biblioteca', 'Cuentacuentos y préstamo de libros.'], ['En la naturaleza', 'Una ruta corta con merienda.']],
      steps: ['Elige el plan entre todos.', 'Prepara lo necesario la noche antes.', 'Deja que los pequeños tengan tareas propias.', 'Al acabar, cada uno cuenta lo que más le gustó.'],
      tl: [['Mañana', 'Desayuno largo y plan elegido.'], ['Mediodía', 'Comida al aire libre.'], ['Tarde', 'Juego libre y cuento.']],
      sp: [['Edades', 'De 2 a 10 años'], ['Coste', 'Casi gratis'], ['Duración', 'Media jornada']],
      q: ['Lo que recordarán no es el plan, sino que estabais juntos.', 'Una madre de tres'], faq: [['¿Y si llueve?', 'Siempre hay un plan B en casa.'], ['¿Cómo evito las peleas?', 'Turnos claros y un adulto de árbitro.']],
      s: [16, 11, 7, 3], bg: ['estrellas', 'grad-melocoton', 'globos', 'geo-lunares'] },
    { id: 'mascotas', name: 'Mascotas', hue: 40, warm: 1, fk: [8, 17, 15], brands: ['CUATRO PATAS', 'HUELLA', 'COLA CONTENTA'], em: '🐾',
      badge: 'Mascotas · Guía práctica', lead: 'Todo lo que necesitas saber las primeras semanas con un perro o un gato en casa.',
      meta: ['🐶 Perros y gatos', '🏠 Primeras semanas', '✍️ Autor'], stats: [['3', 'Visitas al veterinario'], ['2', 'Paseos al día'], ['12 h', 'De sueño (cachorros: más)'], ['1', 'Rincón propio']],
      cards: [['El rincón', 'Una cama tranquila lejos del paso.'], ['La comida', 'Siempre a la misma hora y sin sobras de la mesa.'], ['El veterinario', 'Vacunas, chip y desparasitación.'], ['La educación', 'Refuerzo positivo y mucha paciencia.']],
      steps: ['Prepara la casa antes de que llegue.', 'Deja que explore a su ritmo.', 'Establece rutinas de comida, paseo y descanso.', 'Premia lo que hace bien en el momento.'],
      tl: [['Día 1', 'Llegada y exploración.'], ['Semana 1', 'Primera visita al veterinario.'], ['Mes 1', 'Rutinas asentadas.']],
      sp: [['Comida', 'Dos tomas al día'], ['Paseos', 'Mañana y tarde'], ['Veterinario', 'Revisión anual']],
      q: ['Un animal no llena la casa: la cambia.', 'Una voluntaria de protectora'], faq: [['¿Perro o gato?', 'Depende de tu tiempo y tu casa.'], ['¿Adoptar o comprar?', 'Adoptar salva una vida y sale más barato.']],
      s: [7, 10, 3, 11], bg: ['vichy', 'kraft', 'cesped', 'grad-amanecer'] },
    { id: 'foto', name: 'Fotografía', hue: 220, warm: 0, fk: [9, 10, 4], brands: ['DIAFRAGMA', 'LUZ DE TARDE', 'EL VISOR'], em: '📷',
      badge: 'Fotografía · Técnica', lead: 'Cómo aprovechar la hora dorada para hacer retratos y paisajes con una luz que no se puede comprar.',
      meta: ['📷 Cualquier cámara', '🌅 Hora dorada', '✍️ Autor'], stats: [['1/250', 'Velocidad'], ['f/2.8', 'Diafragma'], ['ISO 200', 'Sensibilidad'], ['45 min', 'De luz mágica']],
      cards: [['La luz', 'Lateral y cálida: modela las caras y los paisajes.'], ['La composición', 'Tercios, líneas y algo en primer plano.'], ['El enfoque', 'En los ojos, siempre en los ojos.'], ['La edición', 'Poca y coherente en toda la serie.']],
      steps: ['Llega media hora antes de la puesta de sol.', 'Coloca el sol detrás o a un lado del modelo.', 'Mide la luz en la cara, no en el cielo.', 'Dispara en ráfaga cuando la luz cambie.'],
      tl: [['-45 min', 'Llegada y pruebas.'], ['-20 min', 'La mejor luz.'], ['+10 min', 'Hora azul.']],
      sp: [['Cámara', 'Cualquiera con modo manual'], ['Objetivo', '35-85 mm'], ['Accesorio', 'Un reflector barato']],
      q: ['Fotografiar es escribir con luz; la cámara es solo el lápiz.', 'Notas de un fotógrafo'], faq: [['¿Necesito una cámara cara?', 'No: la luz importa mucho más que el equipo.'], ['¿RAW o JPEG?', 'RAW si vas a editar; JPEG si no.']],
      s: [21, 0, 2, 9], bg: ['cartulina-negra', 'grad-medianoche', 'hormigon', 'grad-perla'] },
    { id: 'cine', name: 'Cine y series', hue: 0, warm: 0, fk: [12, 4, 13], brands: ['FUNDIDO A NEGRO', 'LA BUTACA', 'PLANO SECUENCIA'], em: '🎬',
      badge: 'Crítica · Estreno', lead: 'La película de la que todo el mundo habla: qué funciona, qué no y si merece la pena ir al cine.',
      meta: ['🎬 Género', '⏱️ 128 min', '⭐ 4 / 5'], stats: [['128', 'Minutos'], ['4/5', 'Nuestra nota'], ['3', 'Escenas para recordar'], ['1', 'Final que divide']],
      cards: [['El guion', 'Una premisa sencilla con giros bien sembrados.'], ['La dirección', 'Planos largos que confían en el espectador.'], ['Los actores', 'Un reparto que sostiene los silencios.'], ['La música', 'Aparece poco, pero cuando aparece pesa.']],
      steps: ['Ve sin ver el tráiler completo.', 'Fíjate en los colores de cada parte.', 'Quédate hasta el final de los créditos.', 'Coméntala al salir, no antes.'],
      tl: [['Primer acto', 'Presentación pausada.'], ['Segundo acto', 'El giro que lo cambia todo.'], ['Tercer acto', 'Un final abierto a debate.']],
      sp: [['Duración', '128 minutos'], ['Para quién', 'Mayores de 12 años'], ['Dónde', 'En cines']],
      q: ['El cine que importa es el que sigues pensando al día siguiente.', 'Un crítico de provincias'], faq: [['¿Hay escena poscréditos?', 'Sí, una breve.'], ['¿Hay que ver la anterior?', 'No hace falta.']],
      s: [12, 19, 0, 15], bg: ['grad-medianoche', 'terciopelo', 'cartulina-negra', 'pantalla-crt'] },
    { id: 'musica', name: 'Música', hue: 300, warm: 0, fk: [19, 11, 10], brands: ['CARA B', 'EL VINILO', 'SALA LLENA'], em: '🎵',
      badge: 'Disco · Reseña', lead: 'Diez canciones, cuarenta minutos y el disco que más estamos escuchando este otoño.',
      meta: ['💿 10 canciones', '⏱️ 41 min', '⭐ 8,5'], stats: [['10', 'Canciones'], ['41 min', 'Duración'], ['8,5', 'Nota'], ['3', 'Imprescindibles']],
      cards: [['La producción', 'Cálida, con espacio entre los instrumentos.'], ['Las letras', 'Historias pequeñas contadas de cerca.'], ['El single', 'Pegadizo sin ser obvio.'], ['La sorpresa', 'Una balada final que no esperabas.']],
      steps: ['Escúchalo entero y en orden la primera vez.', 'Busca la letra de tu canción favorita.', 'Escúchalo con auriculares buenos.', 'Ve a verlos en directo si puedes.'],
      tl: [['Pista 1', 'Arranque enérgico.'], ['Pista 5', 'El corazón del disco.'], ['Pista 10', 'Despedida acústica.']],
      sp: [['Género', 'Pop independiente'], ['Sello', 'Independiente'], ['Formato', 'Vinilo y digital']],
      q: ['Hay discos que se escuchan y discos que se viven.', 'Un dependiente de tienda de discos'], faq: [['¿Dónde se puede escuchar?', 'En las plataformas habituales y en vinilo.'], ['¿Habrá gira?', 'Fechas anunciadas para primavera.']],
      s: [12, 15, 0, 3], bg: ['pentagrama', 'grad-fuego', 'rayos-pop', 'trama-comic'] },
    { id: 'juegos', name: 'Videojuegos', hue: 260, warm: 0, fk: [10, 13, 12], brands: ['PULSA START', 'NIVEL EXTRA', 'GAME OVER'], em: '🎮',
      badge: 'Videojuegos · Análisis', lead: 'Cuarenta horas después, este es nuestro veredicto sobre el juego más esperado del año.',
      meta: ['🎮 Plataformas', '⏱️ 40 h', '⭐ 9 / 10'], stats: [['40 h', 'Para acabarlo'], ['9/10', 'Nota'], ['60 fps', 'Rendimiento'], ['3', 'Finales']],
      cards: [['La jugabilidad', 'Controles precisos y una curva de dificultad justa.'], ['El mundo', 'Grande sin ser vacío.'], ['La historia', 'Personajes que se ganan su sitio.'], ['El rendimiento', 'Estable incluso en los momentos más intensos.']],
      steps: ['Empieza por el modo historia.', 'Explora antes de seguir la misión principal.', 'Mejora primero las habilidades de movimiento.', 'Guarda antes de cada jefe.'],
      tl: [['Horas 1-5', 'Tutorial y primer mundo.'], ['Horas 6-25', 'El mundo se abre.'], ['Horas 26-40', 'Final y contenido extra.']],
      sp: [['Género', 'Aventura y acción'], ['Jugadores', '1'], ['Edad', '+12']],
      q: ['Los mejores juegos te hacen olvidar que tienes un mando en la mano.', 'Nuestro redactor'], faq: [['¿Merece la pena a precio completo?', 'Sí, por la cantidad y calidad del contenido.'], ['¿Tiene modo en línea?', 'No: es una experiencia para un jugador.']],
      s: [25, 13, 4, 0], bg: ['pantalla-crt', 'grad-medianoche', 'geo-hexagonos', 'plano-azul'] },
    { id: 'codigo', name: 'Programación', hue: 160, warm: 0, fk: [10, 15, 7], brands: ['COMPILA', 'HOLA MUNDO', 'RAMA PRINCIPAL'], em: '⌘',
      badge: 'Programación · Guía', lead: 'Lo que me habría gustado saber el primer año: herramientas, hábitos y errores que evitar.',
      meta: ['💻 Principiantes', '⏱️ 10 min', '✍️ Autor'], stats: [['5', 'Herramientas'], ['3', 'Hábitos'], ['10', 'Errores típicos'], ['1', 'Proyecto propio']],
      cards: [['El editor', 'Uno, bien configurado y con sus atajos aprendidos.'], ['El control de versiones', 'Pequeños commits con mensajes claros.'], ['Las pruebas', 'Una prueba antes de cada arreglo.'], ['La lectura', 'Leer código ajeno enseña más que cualquier curso.']],
      steps: ['Elige un proyecto pequeño que te apetezca.', 'Divide el problema en partes muy pequeñas.', 'Haz que funcione y luego hazlo bonito.', 'Enséñaselo a alguien y escucha.'],
      tl: [['Mes 1', 'Sintaxis y primeros programas.'], ['Mes 6', 'Un proyecto propio terminado.'], ['Año 1', 'Primera contribución a un proyecto abierto.']],
      sp: [['Nivel', 'Principiante'], ['Tiempo', '1 hora al día'], ['Coste', 'Gratis']],
      q: ['Primero haz que funcione, después que sea correcto y al final que sea rápido.', 'Consejo clásico de programadores'], faq: [['¿Qué lenguaje primero?', 'Uno con buena documentación y comunidad.'], ['¿Hace falta saber matemáticas?', 'Para empezar, lo básico basta.']],
      s: [13, 15, 25, 5], bg: ['plano-azul', 'geo-cuadricula', 'pantalla-crt', 'pizarra-negra'] },
    { id: 'negocio', name: 'Emprendimiento', hue: 210, warm: 0, fk: [7, 8, 2], brands: ['PRIMER CLIENTE', 'DE CERO A UNO', 'EL TALLER'], em: '📈',
      badge: 'Negocio · Caso práctico', lead: 'Cómo una tienda de barrio pasó de vender en el mostrador a tener clientes en todo el país.',
      meta: ['🏪 Comercio local', '📈 3 años', '✍️ Autor'], stats: [['3', 'Años'], ['x4', 'Facturación'], ['2.000', 'Clientes'], ['5', 'Empleos']],
      cards: [['El problema', 'Un producto bueno que nadie conocía.'], ['La idea', 'Contar la historia detrás de cada pieza.'], ['La ejecución', 'Una web sencilla y envíos rápidos.'], ['El resultado', 'Clientes que repiten y recomiendan.']],
      steps: ['Habla con veinte clientes antes de invertir.', 'Lanza algo pequeño en un mes.', 'Mide qué funciona y descarta el resto.', 'Reinvierte en lo que tus clientes valoran.'],
      tl: [['Año 1', 'Primera tienda en línea.'], ['Año 2', 'Primer empleo y almacén.'], ['Año 3', 'Ventas en todo el país.']],
      sp: [['Sector', 'Comercio'], ['Inversión inicial', '3.000 €'], ['Equipo', '5 personas']],
      q: ['El mejor plan de negocio es un cliente contento.', 'La fundadora'], faq: [['¿Cuánto dinero hace falta?', 'Menos del que crees si empiezas pequeño.'], ['¿Cuándo dejar el trabajo?', 'Cuando el negocio pague tus gastos.']],
      s: [22, 6, 5, 15], bg: ['grad-perla', 'geo-cuadricula', 'folio-blanco', 'aluminio'] },
    { id: 'finanzas', name: 'Finanzas personales', hue: 140, warm: 0, fk: [2, 7, 5], brands: ['BOLSILLO SANO', 'CUENTAS CLARAS', 'EL SOBRE'], em: '💶',
      badge: 'Dinero · Guía básica', lead: 'Un método sencillo para saber adónde va tu dinero y empezar a ahorrar sin agobios.',
      meta: ['💶 Para todos', '⏱️ 8 min', '✍️ Autor'], stats: [['50 %', 'Necesidades'], ['30 %', 'Caprichos'], ['20 %', 'Ahorro'], ['3 meses', 'Colchón de seguridad']],
      cards: [['Apuntar', 'Un mes anotando todos los gastos.'], ['Repartir', 'Necesidades, caprichos y ahorro.'], ['Automatizar', 'El ahorro, el primer día del mes.'], ['Revisar', 'Una vez al mes, quince minutos.']],
      steps: ['Anota todos tus gastos durante un mes.', 'Agrúpalos en categorías.', 'Fija un porcentaje de ahorro realista.', 'Programa una transferencia automática.'],
      tl: [['Mes 1', 'Saber adónde va el dinero.'], ['Mes 3', 'Primer colchón.'], ['Año 1', 'Ahorro estable y sin esfuerzo.']],
      sp: [['Método', '50 / 30 / 20'], ['Herramienta', 'Una hoja de cálculo'], ['Tiempo', '15 min al mes']],
      q: ['No es lo que ganas, es lo que haces con ello.', 'Consejo de abuela'], faq: [['¿Y si no me llega para ahorrar?', 'Empieza con un 5 %: lo importante es el hábito.'], ['¿Dónde guardo el colchón?', 'En una cuenta aparte y sin tarjeta.']],
      s: [22, 5, 6, 0], bg: ['milimetrado', 'folio-pautado', 'grad-menta', 'geo-cuadricula'] },
    { id: 'deco', name: 'Decoración e interiorismo', hue: 35, warm: 1, fk: [4, 1, 9], brands: ['CASA SERENA', 'RINCÓN', 'LUZ Y MADERA'], em: '🛋️',
      badge: 'Casa · Antes y después', lead: 'Un salón pequeño y oscuro convertido en el lugar favorito de la casa con poco presupuesto.',
      meta: ['🏠 Salón de 14 m²', '💶 600 €', '✍️ Autora'], stats: [['14 m²', 'Superficie'], ['600 €', 'Presupuesto'], ['2', 'Fines de semana'], ['1', 'Pared pintada']],
      cards: [['La luz', 'Cortinas ligeras y una lámpara de pie.'], ['El color', 'Un tono cálido en una sola pared.'], ['Los textiles', 'Cojines, manta y alfombra que acompañan.'], ['El orden', 'Menos cosas y mejor elegidas.']],
      steps: ['Vacía la habitación y piensa cómo la usas.', 'Pinta antes de comprar nada.', 'Elige una pieza protagonista.', 'Añade textiles y plantas al final.'],
      tl: [['Semana 1', 'Vaciar y pintar.'], ['Semana 2', 'Muebles y luz.'], ['Semana 3', 'Detalles y plantas.']],
      sp: [['Estilo', 'Nórdico cálido'], ['Colores', 'Arena, terracota y verde'], ['Presupuesto', '600 €']],
      q: ['Una casa bonita es la que cuenta quién vive en ella.', 'Una interiorista'], faq: [['¿Alquilas? ¿Se puede pintar?', 'Pregunta al casero: muchos aceptan colores suaves.'], ['¿Dónde comprar barato?', 'Segunda mano y mercadillos.']],
      s: [5, 3, 0, 9], bg: ['madera-blanqueada', 'lino-natural', 'terrazo', 'marmol-blanco'] },
    { id: 'arquitectura', name: 'Arquitectura y ciudad', hue: 0, warm: 0, fk: [11, 10, 13], brands: ['PLANTA BAJA', 'ESCALA HUMANA', 'LA FACHADA'], em: '🏛️',
      badge: 'Ciudad · Paseo de arquitectura', lead: 'Un paseo de dos horas por los edificios que explican cómo ha crecido la ciudad en cien años.',
      meta: ['📍 Centro', '🚶 2 h a pie', '🏛️ 8 edificios'], stats: [['8', 'Edificios'], ['100', 'Años de historia'], ['3 km', 'De paseo'], ['2 h', 'Duración']],
      cards: [['El modernismo', 'Hierro, cerámica y curvas a principios de siglo.'], ['La posguerra', 'Bloques sobrios y patios compartidos.'], ['Lo contemporáneo', 'Vidrio, hormigón y luz.'], ['Lo que se perdió', 'Edificios que ya solo existen en fotos.']],
      steps: ['Empieza en la estación.', 'Sube por la avenida principal mirando hacia arriba.', 'Entra en el mercado: su estructura es una joya.', 'Termina en el mirador del parque.'],
      tl: [['1910', 'El mercado de hierro.'], ['1960', 'El primer rascacielos.'], ['2010', 'La biblioteca nueva.']],
      sp: [['Distancia', '3 km'], ['Paradas', '8'], ['Mejor hora', 'Por la mañana']],
      q: ['Una ciudad se lee como un libro: cada calle es una página.', 'Un arquitecto jubilado'], faq: [['¿Se puede entrar en los edificios?', 'En algunos, en jornadas de puertas abiertas.'], ['¿Es accesible?', 'Sí, salvo el mirador final.']],
      s: [5, 9, 0, 3], bg: ['hormigon', 'plano-azul', 'geo-ladrillo', 'pizarra-piedra'] },
    { id: 'historia', name: 'Historia local', hue: 30, warm: 1, fk: [16, 6, 5], brands: ['MEMORIA DEL PUEBLO', 'EL ARCHIVO', 'TIEMPOS DE ANTES'], em: '📜',
      badge: 'Historia · Memoria local', lead: 'Cómo era la vida en el pueblo hace cien años, contada con documentos, fotos antiguas y la voz de los mayores.',
      meta: ['📍 Municipio', '🗓️ 1900-1950', '✍️ Autor'], stats: [['1900', 'Punto de partida'], ['2.300', 'Habitantes entonces'], ['40', 'Fotos de archivo'], ['12', 'Testimonios']],
      cards: [['El trabajo', 'El campo, la fábrica y los oficios que desaparecieron.'], ['Las fiestas', 'Cómo se celebraba sin luz eléctrica.'], ['La escuela', 'Pizarras, tinteros y maestros de pueblo.'], ['La plaza', 'El centro de toda la vida social.']],
      steps: ['Visita el archivo municipal.', 'Pide fotos antiguas a las familias.', 'Graba a los mayores contando sus recuerdos.', 'Contrasta fechas con varios documentos.'],
      tl: [['1902', 'Llega el ferrocarril.'], ['1925', 'Se abre la primera fábrica.'], ['1950', 'El pueblo cambia para siempre.']],
      sp: [['Época', '1900-1950'], ['Fuentes', 'Archivo y testimonios'], ['Fotos', 'Cedidas por vecinos']],
      q: ['Un pueblo sin memoria es un pueblo sin futuro.', 'Una cronista local'], faq: [['¿Dónde están los documentos?', 'En el archivo municipal y el parroquial.'], ['¿Puedo aportar fotos?', 'Sí: se escanean y se devuelven.']],
      s: [8, 5, 3, 7], bg: ['papel-envejecido', 'pergamino', 'carta-antigua', 'periodico'] },
    { id: 'espacio', name: 'Astronomía', hue: 230, warm: 0, fk: [10, 13, 7], brands: ['CIELO PROFUNDO', 'ÓRBITA', 'EL TELESCOPIO'], em: '🔭',
      badge: 'Astronomía · Guía de observación', lead: 'Qué se puede ver en el cielo este mes a simple vista, con prismáticos y con un telescopio pequeño.',
      meta: ['🌙 Luna nueva el día 12', '🔭 Sin equipo caro', '✍️ Autor'], stats: [['5', 'Planetas visibles'], ['1', 'Lluvia de estrellas'], ['0 €', 'A simple vista'], ['22 h', 'Mejor hora']],
      cards: [['A simple vista', 'Constelaciones, planetas brillantes y la Vía Láctea.'], ['Con prismáticos', 'Cúmulos de estrellas y los cráteres de la Luna.'], ['Con telescopio', 'Los anillos de Saturno y las lunas de Júpiter.'], ['El lugar', 'Lejos de las luces de la ciudad.']],
      steps: ['Consulta el tiempo y la fase lunar.', 'Aléjate de la contaminación lumínica.', 'Espera veinte minutos a que la vista se adapte.', 'Usa una linterna roja para el mapa.'],
      tl: [['Día 5', 'Conjunción de la Luna y un planeta.'], ['Día 12', 'Luna nueva: cielo oscuro.'], ['Día 21', 'Máximo de la lluvia de estrellas.']],
      sp: [['Lugar', 'Cielo oscuro'], ['Equipo', 'Prismáticos 10x50'], ['Hora', 'A partir de las 22 h']],
      q: ['Mirar las estrellas es mirar al pasado.', 'Un astrónomo aficionado'], faq: [['¿Qué prismáticos compro?', 'Unos 10x50 son perfectos para empezar.'], ['¿Se ve algo desde la ciudad?', 'La Luna y los planetas, sí.']],
      s: [21, 2, 9, 24], bg: ['noche-estrellada', 'via-lactea', 'luna', 'aurora-boreal'] },
    { id: 'planeta', name: 'Medio ambiente', hue: 120, warm: 0, fk: [3, 2, 8], brands: ['HUELLA VERDE', 'MENOS ES MÁS', 'EL PLANETA EN CASA'], em: '🌍',
      badge: 'Sostenibilidad · Hábitos', lead: 'Pequeños cambios en casa que reducen residuos, ahorran dinero y suman mucho entre todos.',
      meta: ['🏠 En casa', '♻️ Residuo cero', '✍️ Autora'], stats: [['30 %', 'Menos basura'], ['200 €', 'Ahorro al año'], ['10', 'Cambios fáciles'], ['1', 'Planeta']],
      cards: [['En la compra', 'Bolsas de tela, granel y productos de temporada.'], ['En la cocina', 'Aprovechar sobras y compostar.'], ['En el baño', 'Pastillas de jabón y menos envases.'], ['En casa', 'Luz, agua y calefacción con cabeza.']],
      steps: ['Mira tu cubo de basura durante una semana.', 'Elige los tres residuos que más se repiten.', 'Busca una alternativa para cada uno.', 'Cuando sean costumbre, elige tres más.'],
      tl: [['Semana 1', 'Observar sin cambiar nada.'], ['Mes 1', 'Tres cambios asentados.'], ['Año 1', 'La basura a la mitad.']],
      sp: [['Dificultad', 'Fácil'], ['Coste', 'Ahorra dinero'], ['Impacto', 'Alto si lo hacemos todos']],
      q: ['No hace falta que unos pocos lo hagan perfecto, sino que muchos lo hagan un poco.', 'Una activista vecinal'], faq: [['¿Sirve de algo reciclar?', 'Sí, pero reducir sirve todavía más.'], ['¿Es más caro?', 'Al principio algo; a medio plazo, ahorra.']],
      s: [24, 10, 7, 11], bg: ['washi', 'reciclado', 'hojas', 'musgo'] },
    { id: 'motor', name: 'Motor y clásicos', hue: 15, warm: 0, fk: [12, 15, 19], brands: ['GASOLINA Y CROMO', 'EL GARAJE', 'CURVA A CURVA'], em: '🚗',
      badge: 'Clásicos · Restauración', lead: 'Dos años, cientos de horas y un coche de 1972 que vuelve a la carretera como el primer día.',
      meta: ['🚗 Modelo de 1972', '🔧 2 años', '✍️ Autor'], stats: [['1972', 'Año del coche'], ['2 años', 'De trabajo'], ['850', 'Horas'], ['1', 'Primera vuelta']],
      cards: [['La carrocería', 'Óxido fuera, chapa nueva y pintura original.'], ['El motor', 'Desmontado pieza a pieza y ajustado.'], ['El interior', 'Tapicería cosida como entonces.'], ['Los papeles', 'Homologación como vehículo histórico.']],
      steps: ['Fotografía todo antes de desmontar.', 'Etiqueta cada pieza y cada tornillo.', 'Empieza por la estructura y termina por la estética.', 'Prueba en distancias cortas antes del primer viaje.'],
      tl: [['Mes 1', 'Desmontaje completo.'], ['Mes 12', 'Motor en marcha.'], ['Mes 24', 'Primera salida.']],
      sp: [['Modelo', 'Coupé de 1972'], ['Motor', '1.600 cc'], ['Estado', 'Restaurado']],
      q: ['Un clásico no se conduce, se disfruta.', 'Un mecánico de toda la vida'], faq: [['¿Cuánto cuesta restaurar uno?', 'Depende del estado: pide varios presupuestos.'], ['¿Dónde se encuentran piezas?', 'En clubes, ferias y desguaces especializados.']],
      s: [25, 14, 8, 9], bg: ['chapa', 'oxido', 'acero', 'geo-ajedrez'] },
    { id: 'artesania', name: 'Artesanía y manualidades', hue: 330, warm: 1, fk: [17, 18, 3], brands: ['HECHO A MANO', 'EL OVILLO', 'TALLER DE TARDE'], em: '🧶',
      badge: 'Manualidades · Proyecto', lead: 'Un proyecto para hacer en una tarde con materiales sencillos y un resultado precioso.',
      meta: ['⏱️ 3 horas', '✂️ Fácil', '💶 15 €'], stats: [['3 h', 'Tiempo'], ['15 €', 'Material'], ['5', 'Pasos'], ['1', 'Regalo hecho a mano']],
      cards: [['Los materiales', 'Lana, tela o papel de buena calidad.'], ['Las herramientas', 'Tijeras afiladas y una regla.'], ['El patrón', 'Descárgalo e imprímelo a tamaño real.'], ['El acabado', 'Los detalles marcan la diferencia.']],
      steps: ['Reúne todo el material en la mesa.', 'Corta las piezas siguiendo el patrón.', 'Une las piezas con calma.', 'Remata los bordes y añade los detalles.'],
      tl: [['Primera hora', 'Preparación y corte.'], ['Segunda hora', 'Montaje.'], ['Tercera hora', 'Acabados.']],
      sp: [['Dificultad', 'Fácil'], ['Tiempo', '3 horas'], ['Material', 'Unos 15 €']],
      q: ['Lo hecho a mano lleva dentro el tiempo de quien lo hizo.', 'Una artesana'], faq: [['¿Necesito máquina de coser?', 'No: este proyecto se cose a mano.'], ['¿Dónde compro el material?', 'En mercerías y tiendas de manualidades.']],
      s: [6, 16, 3, 11], bg: ['punto', 'corcho', 'lino-natural', 'confeti'] },
    { id: 'idiomas', name: 'Idiomas', hue: 190, warm: 0, fk: [8, 2, 17], brands: ['PALABRA A PALABRA', 'OTRA LENGUA', 'EL DICCIONARIO'], em: '🗣️',
      badge: 'Idiomas · Método', lead: 'Cómo aprender un idioma con veinte minutos al día, sin academia y sin aburrirte.',
      meta: ['⏱️ 20 min al día', '📚 Desde cero', '✍️ Autora'], stats: [['20 min', 'Al día'], ['1.000', 'Palabras clave'], ['6 meses', 'Para conversar'], ['0 €', 'Coste']],
      cards: [['Escuchar', 'Pódcast y series con subtítulos en el idioma.'], ['Hablar', 'Desde el primer día, aunque sea solo.'], ['Leer', 'Libros graduados y noticias sencillas.'], ['Repasar', 'Tarjetas con repetición espaciada.']],
      steps: ['Aprende las cien palabras más frecuentes.', 'Escucha diez minutos cada día.', 'Habla en voz alta lo que haces.', 'Busca un compañero de intercambio.'],
      tl: [['Mes 1', 'Saludos y frases básicas.'], ['Mes 3', 'Entiendes conversaciones lentas.'], ['Mes 6', 'Mantienes una charla.']],
      sp: [['Tiempo', '20 minutos diarios'], ['Material', 'Gratis en internet'], ['Nivel', 'Desde cero']],
      q: ['Un idioma nuevo es una ventana nueva al mundo.', 'Una profesora de idiomas'], faq: [['¿Gramática primero?', 'No: primero palabras y frases útiles.'], ['¿Cuánto tardaré?', 'Con constancia, unos seis meses para conversar.']],
      s: [16, 18, 0, 3], bg: ['cuaderno-margen', 'folio-pautado', 'pizarra-verde', 'grad-menta'] },
    { id: 'teatro', name: 'Teatro y danza', hue: 350, warm: 0, fk: [6, 0, 16], brands: ['TELÓN', 'PRIMER ACTO', 'LA PLATEA'], em: '🎭',
      badge: 'Escena · Crítica', lead: 'Una función de hora y media que deja a la sala en pie: la crónica de un estreno inolvidable.',
      meta: ['🎭 Teatro', '⏱️ 90 min', '⭐ 5 / 5'], stats: [['90 min', 'Duración'], ['5', 'Intérpretes'], ['600', 'Butacas'], ['3', 'Ovaciones']],
      cards: [['El texto', 'Diálogos afilados y silencios que pesan.'], ['La puesta en escena', 'Una escenografía mínima y muy inteligente.'], ['El reparto', 'Cinco intérpretes en estado de gracia.'], ['La luz', 'Cuenta tanto como las palabras.']],
      steps: ['Llega con tiempo para leer el programa.', 'Apaga el móvil del todo.', 'Fíjate en lo que pasa al fondo del escenario.', 'Aplaude hasta que salga todo el equipo.'],
      tl: [['Acto I', 'Presentación y conflicto.'], ['Acto II', 'La tensión crece.'], ['Final', 'Un desenlace que corta la respiración.']],
      sp: [['Duración', '90 minutos'], ['Para quién', 'Público adulto'], ['Hasta', 'Fin de temporada']],
      q: ['El teatro es lo único que solo pasa una vez.', 'Una actriz veterana'], faq: [['¿Hay entradas?', 'Quedan pocas para los martes.'], ['¿Tiene descanso?', 'No: son noventa minutos seguidos.']],
      s: [12, 5, 3, 0], bg: ['terciopelo', 'grad-medianoche', 'cartulina-negra', 'geo-deco'] },
    { id: 'mar', name: 'Mar y vela', hue: 205, warm: 0, fk: [0, 8, 15], brands: ['BARLOVENTO', 'MAR ABIERTO', 'EL AMARRE'], em: '⛵',
      badge: 'Mar · Travesía', lead: 'Tres días navegando entre calas, con el viento a favor y el mar como única compañía.',
      meta: ['⛵ Velero de 10 m', '🌊 3 días', '✍️ Autor'], stats: [['3', 'Días'], ['62', 'Millas'], ['4', 'Calas'], ['15 nudos', 'De viento']],
      cards: [['El barco', 'Un velero de diez metros, sencillo y seguro.'], ['El parte', 'Viento y oleaje antes de soltar amarras.'], ['La tripulación', 'Cuatro personas y turnos claros.'], ['El fondeo', 'Arena limpia y protegida del viento.']],
      steps: ['Revisa el parte y el barco antes de salir.', 'Sal del puerto a motor y despliega velas en abierto.', 'Navega con el viento de través.', 'Fondea antes de que caiga el sol.'],
      tl: [['Día 1', 'Puerto y primera cala.'], ['Día 2', 'Travesía larga con buen viento.'], ['Día 3', 'Regreso al amanecer.']],
      sp: [['Barco', 'Velero de 10 m'], ['Tripulación', '4 personas'], ['Titulación', 'Patrón de embarcación']],
      q: ['El mar no se domina; se le pide permiso.', 'Un patrón con cuarenta años de mar'], faq: [['¿Hace falta título?', 'Sí, para patronear; no para acompañar.'], ['¿Y si me mareo?', 'Mira al horizonte y mantente ocupado.']],
      s: [1, 11, 21, 18], bg: ['agua', 'grad-oceano', 'arena', 'geo-olas'] },
    { id: 'autocaravana', name: 'Viajes en furgoneta', hue: 50, warm: 1, fk: [17, 7, 15], brands: ['RUTA LIBRE', 'KILÓMETRO Y CAMA', 'LA FURGO'], em: '🚐',
      badge: 'Furgoneta · Ruta de dos semanas', lead: 'Dos semanas, una furgoneta camper y la costa de punta a punta durmiendo donde nos pillaba la noche.',
      meta: ['🚐 Camper', '🗓️ 14 días', '🛣️ 1.800 km'], stats: [['14', 'Días'], ['1.800 km', 'Recorridos'], ['11', 'Noches en ruta'], ['35 €', 'Al día']],
      cards: [['La furgo', 'Cama, nevera y placa solar: no hace falta más.'], ['Dónde dormir', 'Áreas de autocaravanas y campings tranquilos.'], ['La comida', 'Mercados locales y cocina sencilla.'], ['El agua', 'Llena en cada área y gasta con cabeza.']],
      steps: ['Planifica las paradas largas, improvisa las cortas.', 'Busca las áreas con agua y vaciado.', 'Conduce de día y descansa cada dos horas.', 'Deja cada sitio más limpio de lo que estaba.'],
      tl: [['Días 1-4', 'Costa norte.'], ['Días 5-10', 'Interior y montaña.'], ['Días 11-14', 'Playas del sur.']],
      sp: [['Vehículo', 'Furgoneta camper'], ['Distancia', '1.800 km'], ['Presupuesto', '35 € al día']],
      q: ['La casa es donde aparcas esta noche.', 'Un viajero en furgoneta'], faq: [['¿Se puede dormir en cualquier sitio?', 'No: respeta las normas de cada municipio.'], ['¿Alquilar o comprar?', 'Alquila primero para saber si te gusta.']],
      s: [11, 25, 2, 9], bg: ['dunas', 'mapa-topografico', 'grad-amanecer', 'kraft'] }
  ];

  /* --------------------------------------------- estructuras de pagina -- */
  /* cada una devuelve las partes de la pagina a partir del tema */

  function listUl(a) { return '<ul>' + a.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>'; }
  function listOl(a) { return '<ol>' + a.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ol>'; }
  function acc(a) { return '<div class="wb-acc">' + a.map(function (q, i) { return '<details class="wb-acc-item"' + (i ? '' : ' open') + '><summary>' + e(q[0]) + '</summary><div class="wb-acc-body" data-wb-slot><p>' + e(q[1]) + '</p></div></details>'; }).join('') + '</div>'; }
  function pull(t) { return '<p class="wb-pull">' + e(t) + '</p>'; }
  function btn(t) { return '<div class="wb-btn-row"><a class="wb-btn" href="#">' + e(t) + '</a></div>'; }
  function cols(a) { return '<div class="wb-cols" style="--cols:' + a.length + '">' + a.map(function (c) { return '<div class="wb-col" data-wb-slot>' + c + '</div>'; }).join('') + '</div>'; }
  function table(T) { return '<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Dato</th><th>Detalle</th></tr></thead><tbody>' + T.sp.concat(T.stats.slice(0, 2).map(function (s) { return [s[1], s[0]]; })).map(function (r) { return '<tr><td>' + e(r[0]) + '</td><td>' + e(r[1]) + '</td></tr>'; }).join('') + '</tbody></table></div>'; }
  function intro(T) { return first('Empieza contando por qué te apasiona este tema y qué va a encontrar aquí el lector. ' + T.lead); }
  var P2 = 'Escribe encima de cualquier texto para cambiarlo: todo es editable, también las fotos, los colores y el fondo.';

  var LAYOUTS = [
    { id: 'clasica', name: 'Clásica', hero: '', toc: true, build: function (T) {
      return [section('Introducción', 'Lo primero', ps([intro(T), P2]) + cards(T.cards.slice(0, 2))),
        section('En detalle', 'Lo que hay que saber', figure(T.s[1], 'Una imagen que lo explica', 'Foto propia') + cards(T.cards.slice(2, 4))),
        section('Paso a paso', 'Cómo hacerlo', timeline(T.tl)),
        section('Opinión', 'Una voz', quote(T.q[0], T.q[1])),
        section('Galería', 'En imágenes', gallery([[T.s[0], 'Uno'], [T.s[1], 'Dos'], [T.s[2], 'Tres']]))];
    } },
    { id: 'portada', name: 'Portada a toda pantalla', hero: 'hero-cover', toc: false, build: function (T) {
      return [section('Destacado', 'Lo esencial', cols(T.cards.slice(0, 3).map(function (c) { return '<h3>' + e(c[0]) + '</h3><p>' + e(c[1]) + '</p>'; }))),
        section('La historia', 'Contada despacio', ps([intro(T), P2]) + pull(T.q[0])),
        section('Galería', 'Para mirar', gallery([[T.s[0], 'Uno'], [T.s[2], 'Dos'], [T.s[3], 'Tres']]))];
    } },
    { id: 'columna', name: 'Columna de lectura', hero: 'hero-center', toc: false, build: function (T) {
      return [section('', 'El comienzo', ps([intro(T), P2]) + pull(T.q[0])),
        section('', 'El desarrollo', ps([T.cards[0][1] + ' ' + T.cards[1][1], T.cards[2][1] + ' ' + T.cards[3][1]]) + quote(T.q[0], T.q[1])),
        section('', 'Para terminar', ps(['Cierra con una idea que el lector se lleve puesta.']))];
    } },
    { id: 'guia', name: 'Guía práctica', hero: '', toc: true, build: function (T) {
      return [section('Antes de empezar', 'Lo que necesitas', specs(T.sp) + listUl(T.cards.map(function (c) { return c[0]; }))),
        section('Paso a paso', 'Cómo se hace', listOl(T.steps) + callout('💡', '<strong>Consejo:</strong> ' + e(T.cards[3][1]))),
        section('Preguntas', 'Dudas frecuentes', acc(T.faq))];
    } },
    { id: 'revista', name: 'Revista', hero: 'hero-cover', toc: false, build: function (T) {
      return [section('Portada', 'En este número', cols(T.cards.slice(0, 3).map(function (c, i) { return '<span class="section-kicker">' + e(c[0]) + '</span>' + figure(T.s[i], c[0], 'Foto propia') + '<p>' + e(c[1]) + '</p>'; }))),
        section('Reportaje', 'La historia principal', ps([intro(T)]) + quote(T.q[0], T.q[1])),
        section('Cifras', 'En números', '<div class="stats-grid">' + T.stats.map(function (s) { return '<div class="stat-card"><div class="stat-value">' + e(s[0]) + '</div><div class="stat-label">' + e(s[1]) + '</div></div>'; }).join('') + '</div>')];
    } },
    { id: 'cuaderno', name: 'Cuaderno', hero: 'hero-center', toc: false, build: function (T) {
      return [section('Notas', 'Lo de hoy', ps([intro(T)]) + listUl(T.steps.slice(0, 3))),
        section('Ideas', 'Para no olvidar', cards(T.cards.slice(0, 2)) + pull(T.q[0]))];
    } },
    { id: 'ficha', name: 'Ficha técnica', hero: '', toc: true, build: function (T) {
      return [section('La ficha', 'Datos principales', specs(T.sp) + table(T)),
        section('Análisis', 'Lo bueno y lo mejorable', cols(['<h3>👍 A favor</h3>' + listUl([T.cards[0][0], T.cards[1][0]]), '<h3>✏️ A tener en cuenta</h3>' + listUl([T.cards[2][0], T.cards[3][0]])]) + ps([intro(T)])),
        section('Veredicto', 'En resumen', quote(T.q[0], T.q[1]) + btn('Saber más'))];
    } },
    { id: 'cronica', name: 'Crónica', hero: '', toc: true, build: function (T) {
      return [section('Así empezó', 'El principio', ps([intro(T), P2])),
        section('Cronología', 'Momento a momento', timeline(T.tl) + figure(T.s[2], 'Un momento clave', 'Foto propia')),
        section('Voces', 'Lo que dicen', quote(T.q[0], T.q[1]) + cards(T.cards.slice(0, 2)))];
    } },
    { id: 'album', name: 'Álbum de fotos', hero: 'hero-cover', toc: false, build: function (T) {
      return [section('I', 'Primera parada', figure(T.s[1], T.cards[0][0], 'Foto propia') + ps([T.cards[0][1]])),
        section('II', 'Segunda parada', figure(T.s[2], T.cards[1][0], 'Foto propia') + ps([T.cards[1][1]])),
        section('Galería', 'Todas las fotos', gallery([[T.s[0], 'I'], [T.s[1], 'II'], [T.s[2], 'III'], [T.s[3], 'IV']]))];
    } },
    { id: 'boletin', name: 'Boletín', hero: 'hero-center', toc: false, build: function (T) {
      return [section('Hola', 'En este número', ps([first('Bienvenido a un nuevo número. ' + T.lead)]) + listOl(T.cards.slice(0, 3).map(function (c) { return c[0]; }))),
        section('Lo principal', T.cards[0][0], ps([T.cards[0][1], P2]) + pull(T.q[0])),
        section('Suscríbete', '¿Te ha gustado?', callout('💌', '<strong>Recibe el próximo número</strong> en tu correo.') + btn('Quiero suscribirme'))];
    } }
  ];

  function plainPal(p) { var o = JSON.parse(JSON.stringify(p)); delete o.name; return o; }

  /* ------------------------------------------------------- generar --- */

  var out = [];
  TOPICS.forEach(function (T, ti) {
    for (var k = 0; k < 9; k++) {
      (function (T, ti, k) {
        var L = LAYOUTS[(ti * 3 + k) % LAYOUTS.length];
        var fp = FONTS[(T.fk[k % 3] + k * 5 + ti) % FONTS.length];
        var dark = (ti + k) % 7 === 3;
        var bgId = T.bg[k % T.bg.length];
        var hueShift = [0, 25, -25, 160, 40, -40, 200, 10, -10][k];
        var pal = palette(T.name, T.hue + (k % 2 ? 8 : 0), T.hue + hueShift, 45 + (k * 7) % 30, T.warm);
        var brand = T.brands[k % 3];
        var bgObj = WB.BG && WB.BG.byId[bgId];
        var id = 'gen-' + T.id + '-' + L.id;
        out.push({
          id: id,
          name: T.name + ' · ' + L.name,
          group: 'Colección · ' + T.name,
          desc: L.name + ' con ' + fp[0] + (fp[1] !== fp[0] ? ' y ' + fp[1] : '') + (bgObj ? ', fondo ' + bgObj.name.toLowerCase() : '') + (dark ? ', en oscuro' : '') + '.',
          palette: 'terracota',
          thumb: { palette: pal, bgId: bgId, img: L.hero === 'hero-center' ? null : T.s[k % 4], cover: L.hero === 'hero-cover', center: L.hero === 'hero-center', dark: dark },
          build: function (name) {
            var parts = [
              pageBg(null, '', 0, bgId),
              header({ brand: brand, sub: T.name, emblem: T.em, nav: ['Inicio'].concat(L.build(T).map(function (s, i) { return (/<h2>([^<]*)<\/h2>/.exec(s) || [])[1] || 'Sección ' + (i + 1); }).slice(0, 4)) }),
              hero(name, { cls: L.hero, img: L.hero === 'hero-center' ? null : T.s[k % 4], badge: T.badge, lead: T.lead, meta: T.meta, cap: 'Imagen de portada', credit: 'Foto propia' })
            ];
            if (L.id === 'clasica' || L.id === 'guia' || L.id === 'ficha') parts.push(stats(T.stats));
            parts.push(body.apply(null, [L.toc].concat(L.build(T))));
            return {
              body: page(parts),
              set: { fontDisplay: fp[0], fontBody: fp[1], radius: RADII[(ti + k) % RADII.length], startTheme: dark ? 'dark' : 'light', palette: plainPal(pal), paletteId: 'a-medida' }
            };
          }
        });
      })(T, ti, k);
    }
  });

  // las de la coleccion, detras de las escritas a mano
  out.forEach(function (t) { WB.TEMPLATES.push(t); });
  WB.TEMPLATE_TOPICS = TOPICS.map(function (T) { return { id: T.id, name: T.name, em: T.em }; });
})();
