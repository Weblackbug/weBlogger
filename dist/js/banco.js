/* weBlogger · Banco de textos de muestra  ->  WB.bank
   Todo lo que aparece aquí es FICTICIO. El mundo es inventado y coherente:
   - País: Lirenia (gentilicio: lireno). Capital: Castroval. Moneda: el florín.
   - Ciudades: Portalba (el gran puerto, en la desembocadura del Aldera), Miravalle (universitaria),
     Sotoluengo (industrial), Albamar (costa turística), Torremaura (cuenca minera),
     Valdearcos (rural, Alto Aldera), Brezales (sierra), Fuentecalma (balneario), Peñalcor (villa histórica)
     y las islas Cendra.
   - Río Aldera, sierra de Brezales, bahía de Albamar, estrecho de Calder.
   - Instituciones: Asamblea General, Consejo de Gobierno, Banco Central de Lirenia, Instituto Lireno de
     Estadística, Universidad de Miravalle, Hospital General de Castroval, Observatorio de Brezales.
   - Vecinos: Vesperia, Orvalia, Nordhaven, Tarsia y las islas Meridias.
   Ninguna persona, empresa, club, partido o cabecera corresponde a nada real. */
(function () {
  'use strict';
  WB.bank = {
    secciones: ['Internacional', 'Nacional', 'Política', 'Economía', 'Sociedad', 'Ciudad', 'Ciencia', 'Tecnología', 'Cultura', 'Sucesos', 'Medio ambiente', 'Educación', 'Sanidad', 'Deportes', 'Opinión'],

    noticias: [
      { sec: 'Internacional', tit: 'Vesperia y Orvalia firman la paz del estrecho de Calder tras nueve años de bloqueo', sum: 'El acuerdo reabre el paso a los mercantes y crea una comisión conjunta de pesca con sede en las islas Meridias',
        txt: [
          'Los jefes de Gobierno de Vesperia y Orvalia firmaron ayer en la isla de Meridia Mayor el tratado que pone fin a nueve años de bloqueo en el estrecho de Calder. El texto, de cuarenta y dos artículos, reabre el paso a los buques mercantes desde el próximo lunes y fija un calendario de dieciocho meses para retirar las patrulleras que ambos países mantenían a uno y otro lado de la línea de boyas.',
          'El punto más delicado, el reparto de los caladeros, queda en manos de una comisión conjunta de pesca que tendrá su sede en las islas y un presidente rotatorio. «No hemos resuelto todas las diferencias, pero hemos decidido dejar de pagarlas», resumió la canciller vesperiana, Halda Morvenn, ante un centenar de periodistas llegados en dos transbordadores fletados para la ocasión.',
          'Para Lirenia, cuyo comercio marítimo depende en buena parte de esa ruta, el acuerdo supone acortar en tres días la travesía hacia los puertos del norte. La Naviera Tramontana, primera operadora de Portalba, calcula que ahorrará unos cuarenta millones de florines al año en combustible y seguros, y ya ha anunciado que recuperará dos líneas regulares suspendidas desde el inicio del bloqueo.',
          'Los pescadores de uno y otro lado recibieron la noticia con más cautela. Las cofradías orvalianas recuerdan que tres acuerdos anteriores se quedaron en papel mojado y reclaman que la comisión empiece a trabajar antes de la campaña de primavera, cuando los bancos de caballa cruzan el estrecho y los incidentes entre flotas han sido tradicionalmente más frecuentes.'
        ], firma: 'Marta Echenagusía', lugar: 'Meridia Mayor' },

      { sec: 'Nacional', tit: 'La Asamblea General aprueba el plan ferroviario que unirá Castroval y Portalba en cincuenta minutos', sum: 'La línea de alta velocidad costará 3.200 millones de florines y entrará en servicio en seis años',
        txt: [
          'La Asamblea General dio ayer luz verde, con 141 votos a favor, 62 en contra y nueve abstenciones, al plan ferroviario más ambicioso de las últimas tres décadas. Su pieza central es una línea de alta velocidad de 187 kilómetros entre Castroval y Portalba que reducirá el viaje de las dos horas y cuarto actuales a cincuenta minutos, con una parada intermedia en Sotoluengo.',
          'El presupuesto asciende a 3.200 millones de florines, de los que un tercio saldrá de un préstamo a treinta años. La consejera de Infraestructuras, Leonor Bastarreche, defendió que la obra «se paga sola» con el tráfico de mercancías que absorberá la vía antigua una vez liberada de trenes de viajeros, y prometió que las primeras máquinas entrarán en el valle del Aldera antes del verano.',
          'La oposición no discute la línea, sino su trazado. Los diputados de la Liga Moderada reprocharon al Gobierno que haya descartado la estación de Valdearcos, que habría dado servicio a toda la comarca del Alto Aldera, y anunciaron una enmienda para estudiar un apeadero. Ferrolira, la compañía pública que explotará el servicio, sostiene que cada parada añade siete minutos al trayecto.',
          'Los alcaldes de los catorce municipios atravesados por las obras se reunirán el jueves con los técnicos para conocer las expropiaciones. Solo en la vega de Sotoluengo se verán afectadas unas trescientas fincas, la mayoría huertas de regadío, cuyos propietarios han constituido ya una plataforma para negociar en bloque las indemnizaciones.'
        ], firma: 'Andrés Villaluenga', lugar: 'Castroval' },

      { sec: 'Política', tit: 'La coalición de Gobierno salva los presupuestos con una rebaja de última hora en el impuesto del agua', sum: 'El Frente del Aldera retira su veto a cambio de 120 millones para regadíos y depuradoras',
        txt: [
          'El Consejo de Gobierno evitó anoche la prórroga presupuestaria con un acuerdo cerrado a las once y media, media hora antes de que expirase el plazo. El Frente del Aldera, socio menor de la coalición, retiró el veto que mantenía desde hacía tres semanas después de que Convergencia Lirena aceptara rebajar a la mitad la subida prevista del canon del agua para uso agrícola.',
          'El pacto incluye además una partida de 120 millones de florines para modernizar regadíos y construir once depuradoras en la cuenca alta. «Hemos discutido como se discute en las familias: fuerte y en la cocina», admitió el presidente del Consejo, Ricardo Ansúrez, que compareció sin corbata y sin papeles. Su socio, el dirigente ribereño Fermín Olaizábal, habló de «un acuerdo decente».',
          'La oposición calificó la negociación de «subasta». La portavoz de la Liga Moderada, Inés Valcárcel, recordó que el déficit previsto crece dos décimas respecto al borrador de septiembre y pidió la comparecencia urgente del consejero de Hacienda. Las cuentas se votarán el día 28 y, salvo sorpresa, saldrán adelante con una mayoría de once escaños.'
        ], firma: 'Paloma Erquicia', lugar: 'Castroval' },

      { sec: 'Economía', tit: 'El Banco Central de Lirenia mantiene los tipos en el 3,25 % y enfría la expectativa de rebajas', sum: 'La inflación subyacente sigue en el 2,9 % y el gobernador pide «paciencia» a hipotecados y empresas',
        txt: [
          'El Banco Central de Lirenia dejó ayer intacto el precio del dinero en el 3,25 %, donde lleva desde marzo, y advirtió de que no lo tocará mientras la inflación subyacente no baje con claridad del 2,5 %. La decisión se tomó por siete votos contra dos, la división más amplia del consejo en lo que va de año, y decepcionó a un mercado que daba por hecha una rebaja antes de Navidad.',
          'El gobernador, Aurelio Montesdeoca, justificó la pausa en el encarecimiento de los servicios y de los alquileres, que crecen todavía por encima del 4 %. «Sé lo que significa una cuota que sube. También sé lo que significa bajar los tipos demasiado pronto y tener que volver a subirlos», dijo en la rueda de prensa posterior, en la que pidió «paciencia» a familias y empresas.',
          'La Bolsa de Castroval reaccionó con una caída del 0,7 %, arrastrada por las inmobiliarias, mientras el florín se apreciaba frente a la corona de Nordhaven. El Banco del Aldera, la mayor entidad del país por depósitos, calcula que una hipoteca media de 180.000 florines seguirá pagando unos 95 florines más al mes que hace dos años, al menos hasta la revisión de primavera.'
        ], firma: 'Irene Solbes', lugar: 'Castroval' },

      { sec: 'Sociedad', tit: 'Las escuelas rurales ganan alumnos por tercer curso seguido gracias a las familias llegadas de la ciudad', sum: 'Los pueblos de menos de mil habitantes suman 1.840 matrículas nuevas, la mayoría en el Alto Aldera',
        txt: [
          'Las aulas de los pueblos lirenos de menos de mil habitantes han empezado el curso con 1.840 alumnos más que el pasado, según el recuento que publicó ayer el Instituto Lireno de Estadística. Es el tercer año consecutivo de crecimiento y el mayor desde que existe la serie: casi siete de cada diez matrículas nuevas corresponden a familias que se han mudado desde Castroval, Portalba o Sotoluengo.',
          'El fenómeno se concentra en el Alto Aldera y en la sierra de Brezales, donde el teletrabajo, los alquileres bajos y la llegada de la fibra óptica han invertido una sangría de medio siglo. En Valdearcos, la escuela que estuvo a punto de cerrar con nueve niños tiene hoy cuarenta y tres, y el Ayuntamiento ha habilitado el antiguo granero como comedor.',
          '«Vinimos por un año y llevamos cuatro», cuenta Estela Gurruchaga, diseñadora y madre de dos alumnas. Los alcaldes celebran las cifras, pero advierten de que el crecimiento es frágil: reclaman maestros con plaza estable, un pediatra que suba más de un día por semana y transporte para los institutos, que siguen a cuarenta minutos de carretera de montaña.'
        ], firma: 'Tomás Arregui', lugar: 'Valdearcos' },

      { sec: 'Ciudad', tit: 'Portalba abre al paseo sus tres últimos muelles de carga', sum: 'El pleno aprueba por dos votos un plan que llevaba once años en un cajón y que conserva las grúas históricas',
        txt: [
          'El pleno municipal de Portalba aprobó anoche, pasadas las diez, el plan que convierte en paseo público los tres últimos muelles de carga del puerto viejo. La votación, aplazada dos veces este otoño, salió adelante por dos votos de diferencia después de que el grupo independiente arrancara al gobierno local el compromiso de no levantar ningún edificio de más de tres alturas junto al agua.',
          'Las obras empezarán en primavera y durarán cuatro años. El proyecto, firmado por el estudio de la urbanista Aurora Benimelis, reserva la mitad de las once hectáreas a jardines y arbolado, mantiene en pie las dos grúas del muelle de Levante y recupera la antigua lonja como mercado de abastos. La actividad portuaria se concentrará definitivamente en la dársena exterior.',
          'Los vecinos del barrio de la Ribera, que reclamaban la reforma desde hace más de una década y llegaron a reunir cuatro mil firmas, llenaron la tribuna del salón de plenos. «Que esta vez el calendario se cumpla», pidió al terminar la sesión su portavoz, Remedios Cantalapiedra, de 78 años, hija y nieta de estibadores.'
        ], firma: 'Clara Ibarrola', lugar: 'Portalba' },

      { sec: 'Ciencia', tit: 'Un equipo de Miravalle reconstruye dos mil años de sequías leyendo los anillos de los tejos de Brezales', sum: 'El estudio concluye que la sequía actual es la tercera más intensa del registro y la más cálida',
        txt: [
          'Los tejos centenarios de la sierra de Brezales guardan en su madera un archivo del clima que un equipo de la Universidad de Miravalle ha conseguido leer hasta el siglo primero. El trabajo, publicado esta semana tras ocho años de campañas, combina muestras de 214 árboles vivos con vigas de ermitas y troncos conservados en turberas para reconstruir, año a año, la lluvia caída en la cuenca del Aldera.',
          'La serie identifica veintitrés grandes sequías. La actual, que dura ya seis años, es la tercera más intensa, por detrás de dos episodios medievales, pero se distingue de todas las anteriores por la temperatura. «Ha llovido menos otras veces. Lo que nunca habíamos visto es tan poca agua con tanto calor», explica la dendrocronóloga Sabela Nogueruelas, directora de la investigación.',
          'Los resultados tienen una lectura práctica inmediata: los embalses de la cuenca se dimensionaron con datos de apenas ochenta años, un periodo que el estudio revela como excepcionalmente húmedo. La Confederación del Aldera ha pedido ya la serie completa para revisar sus planes de reserva, y el Observatorio de Brezales la incorporará a sus modelos de previsión estacional.'
        ], firma: 'Hugo Zarandona', lugar: 'Miravalle' },

      { sec: 'Tecnología', tit: 'Lumen Sistemas probará en Sotoluengo una red eléctrica que se repara sola', sum: 'Veinte mil hogares participarán durante dos años en el ensayo, que promete cortes de menos de un minuto',
        txt: [
          'La tecnológica Lumen Sistemas y la distribuidora Energías Cendra pondrán en marcha en enero el mayor ensayo de red eléctrica autónoma realizado en Lirenia. Durante dos años, veinte mil hogares y cuatrocientas empresas del distrito industrial de Sotoluengo recibirán la corriente a través de un sistema capaz de detectar una avería, aislar el tramo dañado y redirigir el suministro sin intervención humana.',
          'El corazón del proyecto son 1.300 sensores instalados en transformadores y líneas, que envían medidas cada dos segundos a un programa entrenado con quince años de incidencias. Según la compañía, el tiempo medio de un apagón pasará de los 47 minutos actuales a menos de uno. «El operario seguirá subiendo al poste, pero ya no a oscuras: sabrá qué ha fallado antes de arrancar la furgoneta», señala el ingeniero jefe, Dámaso Urrutikoetxea.',
          'El ensayo cuesta 28 millones de florines, cofinanciados por el Consejo de Gobierno. Las asociaciones de consumidores lo ven con interés, pero piden garantías sobre el uso de los datos de consumo, que permiten deducir los horarios de cada vivienda. La empresa asegura que la información se guardará agregada por manzanas y que ningún contador individual saldrá del centro de control.'
        ], firma: 'Nerea Olabarrieta', lugar: 'Sotoluengo' },

      { sec: 'Cultura', tit: 'Olvido Farrán gana el Premio Nacional de las Letras con una novela sobre las conserveras de Albamar', sum: '«La sal en las manos» convence al jurado por unanimidad y lleva ya seis ediciones',
        txt: [
          'La escritora Olvido Farrán, de 54 años, obtuvo ayer el Premio Nacional de las Letras por «La sal en las manos», una novela coral que sigue a cuatro generaciones de mujeres en las fábricas de conservas de Albamar. El jurado, que deliberó apenas cuarenta minutos, destacó por unanimidad «una prosa que huele a salmuera y una mirada que no pide permiso ni perdón».',
          'Farrán recibió la llamada en la cocina de su casa de Peñalcor, donde vive desde hace veinte años. «Mi abuela limpiaba anchoas doce horas al día y nadie escribió una línea sobre ella. He tardado siete años porque no quería que fuese un homenaje, sino un libro», dijo por teléfono. La novela, publicada en marzo por Ediciones del Faro, va por su sexta edición y se traducirá a nueve lenguas.',
          'El premio, dotado con 60.000 florines, se entregará en diciembre en el Teatro Principal de Castroval. Es la cuarta mujer que lo recibe en sus cuarenta y una convocatorias. La autora, que debutó con un libro de cuentos que pasó inadvertido, adelantó que destinará parte del dinero a digitalizar el archivo fotográfico de la antigua cofradía de conserveras.'
        ], firma: 'Julia Menchaca', lugar: 'Peñalcor' },

      { sec: 'Sucesos', tit: 'Rescatados los once tripulantes de un pesquero que ardió a veinte millas de las islas Cendra', sum: 'El fuego se inició en la sala de máquinas de madrugada; dos marineros fueron atendidos por inhalación de humo',
        txt: [
          'Los once tripulantes del pesquero Nuestra Señora de la Bruma fueron rescatados ilesos en la madrugada de ayer después de que un incendio en la sala de máquinas los obligara a abandonar el barco a unas veinte millas al sur de las islas Cendra. La llamada de socorro se recibió a las 3.40 y el helicóptero de Salvamento Marítimo tardó cincuenta minutos en localizar las dos balsas.',
          'El patrón, Evaristo Lamadrid, de 61 años, contó a su llegada al puerto de Portalba que el fuego se propagó «en lo que se tarda en rezar un padrenuestro» y que apenas tuvieron tiempo de coger los trajes de supervivencia. Dos marineros fueron trasladados al Hospital del Mar por inhalación de humo y recibieron el alta a mediodía.',
          'El barco, de 28 metros de eslora y con base en Albamar, faenaba al arrastre desde el lunes. Un remolcador intentaba anoche llevar el casco hasta la costa para evitar el vertido de los 14.000 litros de gasóleo que conserva en los tanques. La Capitanía Marítima ha abierto una investigación y revisará el historial de inspecciones, la última de ellas superada hace cinco meses.'
        ], firma: 'Rubén Castiñeira', lugar: 'Portalba' },

      { sec: 'Medio ambiente', tit: 'El salmón vuelve a remontar el Aldera cuarenta años después de su desaparición', sum: 'Los biólogos cuentan 312 ejemplares en la escala de Puente Sarrio tras el derribo de tres presas en desuso',
        txt: [
          'Hacía cuarenta años que nadie veía un salmón en el tramo medio del Aldera. Este otoño han pasado 312 por la escala de Puente Sarrio, según el recuento que los biólogos de la Confederación cerraron el viernes con una cámara subacuática. La cifra triplica la más optimista de las previsiones y confirma el éxito de un programa que empezó, entre no pocas protestas, con el derribo de tres presas en desuso.',
          'La desaparición del salmón coincidió con la construcción de los azudes que alimentaban las antiguas fábricas textiles de Sotoluengo. Cerradas las fábricas, los muros siguieron cortando el río durante décadas. «Quitamos nueve metros de hormigón y el río hizo el resto en cuatro inviernos», explica la bióloga Carlota Ezquerro, que dirige el seguimiento desde una caseta junto al puente.',
          'El regreso no garantiza todavía una población estable: hará falta que los alevines nacidos esta temporada bajen al mar y vuelvan dentro de dos o tres años. Mientras tanto, la pesca seguirá vedada en toda la cuenca. Los ayuntamientos ribereños confían en que el salmón atraiga visitantes, y Valdearcos ya ha señalizado un mirador sobre la poza donde descansan antes del último salto.'
        ], firma: 'Lucía Barrenengoa', lugar: 'Puente Sarrio' },

      { sec: 'Educación', tit: 'Los institutos públicos estrenarán en septiembre una asignatura de oficios desde los doce años', sum: 'Carpintería, electricidad, huerto y cocina ocuparán dos horas semanales en primero y segundo',
        txt: [
          'Los 412 institutos públicos de Lirenia incorporarán el próximo curso una asignatura obligatoria de oficios para los alumnos de doce y trece años. Durante dos horas a la semana pasarán por talleres de carpintería, electricidad básica, cocina y huerto, en grupos de quince como máximo. La medida, incluida en la reforma que el Consejo de Gobierno aprobó ayer, costará 34 millones de florines en equipamiento.',
          'El consejero de Educación, Baltasar Ormaechea, la presentó como un intento de «devolver las manos a la escuela». Lirenia tiene la tasa más baja de matrícula en formación profesional de toda la región, un 22 %, y las empresas de Sotoluengo llevan años quejándose de que no encuentran soldadores ni electricistas. «No se trata de orientar a nadie antes de tiempo, sino de que nadie descarte lo que no ha probado», dijo.',
          'Los sindicatos docentes apoyan la idea, pero dudan del calendario: harán falta unos novecientos profesores técnicos y la mitad de los centros carece de un aula adecuada. Las asociaciones de familias piden, por su parte, que las horas no se resten de música ni de educación física, como figura en el primer borrador que la Consejería ha enviado a los directores.'
        ], firma: 'Begoña Larrinaga', lugar: 'Castroval' },

      { sec: 'Sanidad', tit: 'El Hospital General de Castroval reduce a la mitad la espera en urgencias con un médico en la puerta', sum: 'El nuevo sistema de clasificación atiende en menos de quince minutos a ocho de cada diez pacientes',
        txt: [
          'El Hospital General de Castroval ha conseguido en seis meses lo que parecía imposible: que la espera media en urgencias baje de dos horas y cuarenta minutos a una hora y diez. La clave ha sido cambiar quién recibe al paciente. En lugar de un mostrador administrativo, ahora lo atiende en la misma puerta un equipo formado por un médico veterano y una enfermera, que deciden en minutos a dónde va.',
          'Ocho de cada diez personas son vistas antes de un cuarto de hora, y casi un tercio se marcha desde esa primera consulta con un diagnóstico y un tratamiento, sin pasar a la sala. «Poníamos a los residentes en la puerta y a los expertos al fondo. Era exactamente al revés de lo que tocaba», reconoce la jefa del servicio, la doctora Amparo Sistiaga.',
          'El modelo ha exigido contratar a seis médicos y reformar el vestíbulo, con un coste de 1,8 millones de florines al año, que la gerencia da por amortizado: los ingresos innecesarios han caído un 12 %. La Consejería de Sanidad lo extenderá en primavera a los hospitales de Portalba y Sotoluengo, y estudia una versión reducida para los comarcales de Torremaura y Brezales.'
        ], firma: 'Elena Garmendia', lugar: 'Castroval' },

      { sec: 'Internacional', tit: 'Nordhaven cierra sus dos últimas minas de carbón y promete un empleo a cada minero', sum: 'El plan de reconversión afecta a 6.400 trabajadores y costará el equivalente a 900 millones de florines',
        txt: [
          'La Confederación de Nordhaven apagó ayer la última caldera de carbón de su historia. Las minas de Skarnes y Holmvik, abiertas hace 140 años, bajaron la jaula por última vez a las seis de la tarde ante centenares de vecinos que aguardaban en silencio en la bocamina. Con ellas se cierra un sector que llegó a dar trabajo a uno de cada cinco habitantes del norte del país.',
          'El Gobierno confederal ha comprometido el equivalente a 900 millones de florines para que ninguno de los 6.400 mineros quede sin ocupación. La mitad se prejubilará; el resto podrá elegir entre un puesto en las fábricas de aerogeneradores que se levantan sobre las antiguas escombreras o dos años de formación pagada. «No cerramos una mina, cambiamos de siglo», dijo la primera ministra, Sigrun Aldersen.',
          'En Torremaura, la cuenca minera lirena que vivió su propio cierre hace una década, la noticia se siguió con una mezcla de envidia y escepticismo. «A nosotros también nos prometieron un empleo por cada lámpara. Vinieron tres empresas y quedó una», recuerda Anselmo Brañas, antiguo picador y hoy concejal. Una delegación de alcaldes nordhavenses visitará la comarca en enero para conocer qué funcionó y qué no.'
        ], firma: 'Daniel Ochandiano', lugar: 'Skarnes' },

      { sec: 'Nacional', tit: 'El censo confirma que Lirenia supera por primera vez los nueve millones de habitantes', sum: 'La población crece un 4,1 % en diez años, pero 380 municipios siguen perdiendo vecinos',
        txt: [
          'Lirenia tiene 9.027.416 habitantes. La cifra, que el Instituto Lireno de Estadística hizo oficial ayer tras catorce meses de recuento, supera por primera vez la barrera de los nueve millones y supone un crecimiento del 4,1 % respecto al censo anterior. Casi todo el aumento se debe a la inmigración y al regreso de emigrados: el saldo entre nacimientos y defunciones es negativo desde hace siete años.',
          'El mapa que dibuja el censo es el de un país que se inclina hacia el mar. Portalba gana 61.000 vecinos y roza ya los 700.000, Albamar crece un 11 % y el área metropolitana de Castroval concentra a uno de cada cuatro lirenos. En el otro extremo, 380 municipios del interior han perdido población, y veintidós de ellos tienen menos de cincuenta empadronados.',
          'Hay matices esperanzadores. La comarca del Alto Aldera rompe medio siglo de caída y suma 2.300 habitantes, y la edad media de la sierra de Brezales baja por primera vez. El director del Instituto, Gaspar Leturiondo, pidió no leer el dato como un triunfo ni como una alarma: «Somos más, somos más viejos y vivimos más juntos. Las tres cosas obligan a planificar».',
          'El nuevo censo tendrá consecuencias inmediatas. Servirá para redistribuir los 212 escaños de la Asamblea General antes de las próximas elecciones, en las que Portalba ganará previsiblemente tres diputados a costa de las circunscripciones del interior, y para recalcular el reparto de los fondos de sanidad y educación entre comarcas.'
        ], firma: 'Carmen Uriarte', lugar: 'Castroval' },

      { sec: 'Política', tit: 'La Liga Moderada elige a Inés Valcárcel para disputar la presidencia del Consejo', sum: 'La portavoz parlamentaria vence en las primarias con el 58 % de los votos y promete «un Gobierno aburrido»',
        txt: [
          'La Liga Moderada ya tiene candidata. Inés Valcárcel, de 47 años, abogada y portavoz del grupo en la Asamblea General, ganó anoche las primarias con el 58 % de los votos de los 41.000 afiliados que participaron, frente al 39 % del alcalde de Albamar, Leandro Quirós. La participación, del 71 %, fue la más alta en la historia del partido.',
          'En su primer discurso, pronunciado en un polideportivo de Miravalle, Valcárcel prometió «un Gobierno aburrido, de los que cuadran las cuentas y arreglan las carreteras». Evitó los ataques personales a Ricardo Ansúrez, a quien se enfrentará dentro de dieciséis meses, y dedicó la mitad de la intervención a la vivienda, que según todas las encuestas es hoy la primera preocupación de los lirenos.',
          'Quirós reconoció la derrota antes de que terminara el escrutinio y se ofreció a hacer campaña «donde me manden». El resultado deja a la Liga más unida de lo que temían sus dirigentes, pero con una tarea pendiente: la candidata arrasa en las ciudades y pierde en nueve de las catorce comarcas rurales, precisamente donde el Frente del Aldera ha crecido más en los últimos años.'
        ], firma: 'Paloma Erquicia', lugar: 'Miravalle' },

      { sec: 'Economía', tit: 'Aceros Sotoluengo invertirá 450 millones en un horno eléctrico que jubilará sus chimeneas', sum: 'La siderúrgica reducirá sus emisiones un 70 % y mantendrá los 2.900 empleos de la planta',
        txt: [
          'Aceros Sotoluengo, la mayor empresa industrial de Lirenia, anunció ayer la inversión más alta de su siglo y medio de historia: 450 millones de florines para sustituir sus dos altos hornos por un horno de arco eléctrico alimentado con chatarra y energía renovable. Las obras comenzarán en otoño y la primera colada está prevista para dentro de tres años.',
          'La compañía calcula que el cambio recortará sus emisiones de dióxido de carbono en un 70 % y la librará de pagar unos 60 millones anuales en derechos de emisión. El presidente, Octavio Regúlez, garantizó ante el comité de empresa que se mantendrán los 2.900 puestos de trabajo, aunque un tercio de la plantilla tendrá que formarse para oficios nuevos. Un tercio de la inversión llegará en forma de ayudas públicas.',
          'El anuncio despeja meses de incertidumbre en una ciudad que respira, literalmente, al ritmo de la fábrica. Las dos chimeneas de 110 metros que dominan el valle dejarán de humear, y el Ayuntamiento ya estudia conservar una de ellas como monumento. Las acciones de la siderúrgica subieron un 6,3 % en la Bolsa de Castroval, su mejor sesión en cuatro años.'
        ], firma: 'Víctor Amenábar', lugar: 'Sotoluengo' },

      { sec: 'Sociedad', tit: 'Uno de cada tres jóvenes lirenos comparte piso pasados los treinta años', sum: 'La edad media de emancipación se retrasa hasta los 30,4 años, dos más que hace una década',
        txt: [
          'A los treinta años, la mayoría de los lirenos sigue sin tener una casa propia ni un alquiler a su nombre. La edad media de emancipación ha subido hasta los 30,4 años, según la encuesta de juventud que presentó ayer el Instituto Lireno de Estadística, y un tercio de quienes se han marchado de casa de sus padres lo ha hecho para compartir piso con desconocidos.',
          'El motivo está en una sola cifra: un joven con el sueldo mediano de su edad, 1.340 florines al mes, tendría que destinar el 62 % de sus ingresos para alquilar en solitario una vivienda de cincuenta metros en Castroval o en Portalba. «Tengo un contrato indefinido, un máster y una habitación de nueve metros», resume Aitana Belmonte, enfermera de 31 años, que vive con otras tres personas junto al puerto.',
          'El informe detecta además un cambio de costumbres. La mitad de los encuestados ya no considera la propiedad una meta, y crece el número de quienes se van a ciudades medianas como Miravalle o Fuentecalma, donde el alquiler cuesta la mitad. El Consejo de Gobierno prepara un plan de 12.000 viviendas de alquiler asequible que las asociaciones juveniles consideran insuficiente y tardío.'
        ], firma: 'Sara Linazasoro', lugar: 'Castroval' },

      { sec: 'Ciudad', tit: 'El tranvía de Castroval recupera la parada del Mercado Central dos años después', sum: 'La línea 3 vuelve a cruzar la plaza de los Tilos, ya peatonal, y estrena frecuencia de seis minutos',
        txt: [
          'El tranvía volvió a detenerse ayer ante el Mercado Central de Castroval. La parada llevaba cerrada desde que empezaron las obras de la plaza de los Tilos, hace veintiséis meses, y su reapertura cierra un rodeo que obligaba a los usuarios de la línea 3 a bajar en la ronda y caminar diez minutos cargados con la compra. El primer convoy llegó a las 6.12 con media docena de viajeros y un acordeonista.',
          'La plaza que encontraron es otra. Los coches han desaparecido, hay 84 árboles nuevos y el tranvía circula sobre una plataforma de césped. Los comerciantes, que durante la reforma perdieron según sus cálculos un 30 % de las ventas, se mostraron aliviados. «Dos años vendiendo entre vallas. Hoy han vuelto clientas que no veía desde entonces», decía Purificación Arnáiz detrás de su puesto de legumbres.',
          'La empresa municipal de transportes aprovecha la reapertura para aumentar la frecuencia de la línea, que pasa de nueve a seis minutos en hora punta. La alcaldesa, Matilde Berasategui, anunció que el siguiente paso será prolongar las vías hasta el campus de la Vega, una obra de 2,4 kilómetros presupuestada en 38 millones de florines y pendiente todavía de financiación.'
        ], firma: 'Ignacio Recalde', lugar: 'Castroval' },

      { sec: 'Ciencia', tit: 'El Observatorio de Brezales descubre un cometa que será visible a simple vista en primavera', sum: 'El objeto, bautizado con el nombre de la sierra, pasará a 62 millones de kilómetros de la Tierra en abril',
        txt: [
          'Una mancha difusa en una fotografía tomada la noche del 3 de noviembre ha resultado ser un cometa desconocido. Lo detectó la astrónoma Jimena Altolaguirre mientras revisaba las imágenes del telescopio de 1,2 metros del Observatorio de Brezales, y tres centros de otros países han confirmado ya la órbita. El objeto llevará el nombre de la sierra desde la que fue visto por primera vez.',
          'El cometa se encuentra ahora más allá de la órbita de Marte y se acerca al Sol a 34 kilómetros por segundo. Los cálculos indican que en abril pasará a 62 millones de kilómetros de la Tierra y que, si su núcleo resiste, podrá verse a simple vista durante unas tres semanas, al anochecer y hacia el oeste. La última vez que ocurrió algo parecido en estas latitudes fue hace veintisiete años.',
          '«Los cometas son como los gatos: tienen cola y hacen lo que les da la gana», bromea Altolaguirre, que pide prudencia con las previsiones de brillo. El Observatorio organizará jornadas de observación en la sierra, uno de los cielos más oscuros del país, y ha solicitado a los ayuntamientos de la comarca que apaguen el alumbrado ornamental durante las noches de máximo acercamiento.'
        ], firma: 'Hugo Zarandona', lugar: 'Brezales' },

      { sec: 'Tecnología', tit: 'Telelira llevará la fibra óptica a las 214 aldeas que seguían sin conexión', sum: 'El despliegue terminará en dieciocho meses y se apoyará en los postes de la red eléctrica',
        txt: [
          'Las 214 aldeas lirenas que todavía dependen de una conexión por radio o de ninguna tendrán fibra óptica antes de dos años. Telelira, la principal operadora del país, firmó ayer con el Consejo de Gobierno el contrato para completar el despliegue en los núcleos de menos de cien habitantes, los únicos que quedaban fuera de la red. El coste, 76 millones de florines, se repartirá a partes iguales.',
          'Para abaratar la obra, el cable no irá enterrado: viajará colgado de los postes de la red eléctrica, una solución que ya se ensayó con éxito en el Alto Aldera. La primera fase cubrirá la sierra de Brezales y la cuenca de Torremaura, donde hay valles en los que una videollamada sigue siendo una lotería. «Aquí el médico pasa consulta por pantalla y la mitad de los días se le congela la cara», cuenta el alcalde de Arcillares, Jacinto Mugarza.',
          'La operadora se compromete a ofrecer la misma tarifa que en las ciudades y a mantener el servicio durante al menos veinte años. Los alcaldes creen que la conexión es hoy tan decisiva como lo fue la carretera: nueve de cada diez familias que se han instalado en un pueblo en los últimos tres años preguntaron por la velocidad de internet antes que por el precio de la casa.'
        ], firma: 'Nerea Olabarrieta', lugar: 'Torremaura' },

      { sec: 'Cultura', tit: 'El Museo de Bellas Artes de Castroval recupera un retablo robado hace sesenta y dos años', sum: 'Las ocho tablas del Maestro de Peñalcor aparecieron en el desván de una casa de subastas de Tarsia',
        txt: [
          'Ocho tablas pintadas hacia 1480 por el llamado Maestro de Peñalcor han vuelto a Lirenia sesenta y dos años después de que alguien las arrancara, una noche de enero, del altar de la ermita de San Telmo. El Museo de Bellas Artes de Castroval las presentó ayer, todavía sin restaurar, en una sala abarrotada en la que se encontraban varios vecinos que recordaban haberlas visto de niños.',
          'El retablo apareció por casualidad. Una historiadora del arte, Fabiola Insausti, reconoció una de las escenas en el catálogo de una casa de subastas de Tarsia, donde figuraba como obra anónima del norte. La investigación posterior demostró que las tablas habían pasado por cuatro colecciones privadas. El último propietario, que las compró de buena fe, aceptó devolverlas a cambio de una compensación que no se ha hecho pública.',
          'La restauración durará dos años y se hará a la vista del público, tras una mampara de cristal. La directora del museo, Covadonga Ruiloba, confirmó que después las tablas regresarán a Peñalcor, cuyo Ayuntamiento ha reformado la ermita y ha instalado por fin una alarma. «Un retablo se pinta para un sitio. Nosotros solo lo cuidamos mientras se cura», dijo.'
        ], firma: 'Julia Menchaca', lugar: 'Castroval' },

      { sec: 'Sucesos', tit: 'Desarticulada una red que vendía falso aceite de oliva a restaurantes de la costa', sum: 'La policía interviene 90.000 litros y detiene a siete personas en Albamar, Portalba y Sotoluengo',
        txt: [
          'La Policía Judicial ha desmantelado una red que vendía como aceite de oliva virgen extra una mezcla de girasol, colorante y aroma. En la operación, desarrollada de forma simultánea en Albamar, Portalba y Sotoluengo, han sido detenidas siete personas e intervenidos 90.000 litros de producto, tres envasadoras y 240.000 etiquetas de una cooperativa que no existe.',
          'El grupo operaba desde una nave del polígono de Sotoluengo y distribuía las garrafas, a un tercio del precio de mercado, entre restaurantes y freidurías del litoral. La investigación comenzó hace ocho meses, cuando un cocinero de Albamar notó que el aceite «no humeaba como debía» y llevó una muestra al laboratorio municipal. Los análisis no han hallado sustancias peligrosas para la salud.',
          'Los investigadores calculan que la trama puso en circulación más de medio millón de litros en dos años, con un beneficio superior a los cuatro millones de florines. Los detenidos, de entre 34 y 67 años, pasarán hoy a disposición judicial acusados de estafa y delito contra la salud pública. La asociación de hosteleros ha pedido que no se señale a los locales, a los que considera «los primeros engañados».'
        ], firma: 'Rubén Castiñeira', lugar: 'Albamar' },

      { sec: 'Medio ambiente', tit: 'Las islas Cendra prohibirán fondear sobre las praderas marinas a partir del verano', sum: 'Las anclas han arrasado en veinte años el 18 % de la posidonia; habrá 600 boyas ecológicas',
        txt: [
          'Los barcos de recreo no podrán echar el ancla sobre las praderas de posidonia de las islas Cendra a partir del próximo junio. El Consejo Insular aprobó ayer una norma que delimita 2.400 hectáreas protegidas y obliga a amarrar en alguna de las 600 boyas ecológicas que se instalarán durante el invierno. Las multas irán de 300 a 6.000 florines, según la eslora.',
          'La medida llega después de que un estudio de la Universidad de Miravalle demostrara que las anclas y sus cadenas han destruido en dos décadas el 18 % de la pradera, una planta que crece apenas un centímetro al año y de la que depende la transparencia del agua. «Cada fondeo deja un surco que tarda un siglo en cerrarse. En agosto contamos novecientos barcos en una sola cala», explica la oceanógrafa Mireia Calafell.',
          'El sector náutico acepta la prohibición, pero considera escaso el número de boyas y teme las colas en temporada alta. El Consejo responde que la reserva se hará por una aplicación y que los ingresos, unos dos millones de florines anuales, se destinarán íntegramente a vigilancia y replantación. Los pescadores artesanales, exentos de la norma, la han apoyado sin reservas.'
        ], firma: 'Lucía Barrenengoa', lugar: 'Islas Cendra' },

      { sec: 'Educación', tit: 'La Universidad de Miravalle limitará el precio de los pisos de estudiantes con una bolsa propia', sum: 'El campus alquilará 900 viviendas a particulares y las realquilará a un máximo de 260 florines por habitación',
        txt: [
          'La Universidad de Miravalle se convertirá en casera. El consejo de gobierno de la institución aprobó ayer crear una bolsa propia de alojamiento que alquilará 900 viviendas a propietarios particulares y las ofrecerá después a los estudiantes con un tope de 260 florines por habitación. A cambio, el dueño tendrá el cobro garantizado doce meses al año y la reparación de cualquier desperfecto.',
          'El plan responde a una emergencia. Miravalle recibe cada septiembre a 31.000 universitarios, casi tantos como vecinos, y el precio medio de una habitación ha subido un 44 % en cinco años. El curso pasado, 1.200 alumnos admitidos renunciaron a la plaza por no encontrar dónde vivir. «Estamos perdiendo a los mejores expedientes de las comarcas porque sus familias no pueden pagar una cama», lamentó la rectora, Rosalía Mendizábal.',
          'La bolsa funcionará desde junio y dará prioridad a los becarios. El Ayuntamiento colaborará con una rebaja del impuesto de bienes inmuebles a los propietarios que se adhieran. Las plataformas de pisos turísticos, a las que el consistorio atribuye buena parte de la escalada, quedan fuera del acuerdo: en el casco histórico hay ya más viviendas para visitantes que para estudiantes.'
        ], firma: 'Begoña Larrinaga', lugar: 'Miravalle' },

      { sec: 'Sanidad', tit: 'Lirenia vacunará gratis contra el herpes zóster a todos los mayores de sesenta y cinco años', sum: 'La campaña empezará en enero por los nacidos antes de 1950 y alcanzará a 1,4 millones de personas',
        txt: [
          'La vacuna contra el herpes zóster, que hasta ahora costaba 190 florines por dosis en la farmacia, será gratuita desde enero para todos los mayores de sesenta y cinco años. La Consejería de Sanidad anunció ayer la compra de 2,8 millones de dosis, suficientes para proteger en tres años a 1,4 millones de lirenos. La campaña comenzará por los nacidos antes de 1950 y por los pacientes inmunodeprimidos.',
          'El herpes zóster, la reactivación del virus de la varicela, afecta a una de cada tres personas a lo largo de la vida y provoca en los mayores dolores que pueden durar meses. Los centros de salud atendieron el año pasado 41.000 casos. «Es una de esas enfermedades que no matan, pero amargan. Hemos visto pacientes que no podían soportar el roce de la sábana», explicó la directora de Salud Pública, Nieves Aramburu.',
          'La vacunación se hará con cita en los centros de salud y, en los municipios pequeños, con una unidad móvil que recorrerá las comarcas del interior. El coste de la campaña, 96 millones de florines, se compensará en parte con el ahorro en analgésicos y consultas. Las sociedades de geriatría, que la reclamaban desde hace cinco años, la consideran «la mejor noticia del invierno».'
        ], firma: 'Elena Garmendia', lugar: 'Castroval' },

      { sec: 'Internacional', tit: 'Un terremoto de magnitud 6,8 deja al menos 140 muertos en el sur de Tarsia', sum: 'Lirenia envía dos aviones con equipos de rescate y un hospital de campaña a la región de Kadessa',
        txt: [
          'Un terremoto de magnitud 6,8 sacudió a las 4.17 de la madrugada de ayer la región de Kadessa, en el sur de Tarsia, y dejó al menos 140 muertos y más de novecientos heridos, según el último balance oficial. El epicentro se situó a doce kilómetros de profundidad, bajo una zona de pueblos de montaña construidos en piedra y adobe, donde barrios enteros han quedado reducidos a escombros.',
          'Los equipos de rescate trabajan contra el reloj y contra el frío: por la noche el termómetro baja de cero y las réplicas, más de sesenta, impiden a los vecinos regresar a las casas que siguen en pie. La carretera principal está cortada por desprendimientos en tres puntos y los primeros auxilios llegaron en helicóptero. «Sacamos a una niña viva después de once horas. Eso nos sostiene», relataba un bombero a la televisión tarsiana.',
          'Lirenia fue uno de los primeros países en responder. Dos aviones despegaron por la tarde de la base de Castroval con 64 especialistas, ocho perros adiestrados y un hospital de campaña de cuarenta camas. La comunidad tarsiana de Portalba, unas 12.000 personas, ha abierto un punto de recogida de mantas y medicinas en la antigua lonja, y el Ayuntamiento ha habilitado una cuenta para donativos.'
        ], firma: 'Marta Echenagusía', lugar: 'Kadessa' },

      { sec: 'Nacional', tit: 'El Gobierno declara la emergencia hídrica en seis comarcas tras el otoño más seco en setenta años', sum: 'Los embalses del Aldera están al 23 % y habrá cortes nocturnos en 41 municipios desde el lunes',
        txt: [
          'El Consejo de Gobierno declaró ayer la emergencia hídrica en seis comarcas del centro y el sur del país, donde viven 1,3 millones de personas. La decisión, que no se adoptaba desde hace diecinueve años, llega después del otoño más seco desde que hay registros fiables: entre septiembre y noviembre ha llovido un 68 % menos de lo habitual y los embalses de la cuenca del Aldera están al 23 % de su capacidad.',
          'Las restricciones entrarán en vigor el lunes. Se prohíbe regar jardines, llenar piscinas y lavar vehículos fuera de las instalaciones con reciclado, y 41 municipios sufrirán cortes de suministro entre las once de la noche y las seis de la mañana. El riego agrícola se reduce a la mitad, con excepción de los frutales, y las industrias deberán presentar en quince días un plan de ahorro.',
          '«No hay agua para todo y vamos a decirlo con claridad», afirmó el consejero de Medio Ambiente, Teodoro Ibarguren, que evitó poner fecha al final de las medidas. El Observatorio de Brezales no prevé lluvias significativas hasta mediados de enero. Los regantes de la vega de Sotoluengo, que dan por perdida la cosecha de alcachofa, reclaman ayudas directas y la apertura de los pozos de sequía.',
          'En las ciudades, la respuesta de los primeros días ha sido desigual. Castroval ha reducido su consumo un 9 % desde que se anunció la alerta, mientras que en la costa, donde el agua procede en parte de la desaladora de Albamar, apenas ha variado. El Gobierno estudia conectar ambas redes con una tubería de 54 kilómetros, un proyecto aparcado desde hace una década por su coste.'
        ], firma: 'Andrés Villaluenga', lugar: 'Castroval' },

      { sec: 'Política', tit: 'La Asamblea rebaja a dieciséis años la edad para votar en las elecciones municipales', sum: 'La reforma sale adelante con apoyo de cuatro grupos y se estrenará en los comicios locales de mayo',
        txt: [
          'Los lirenos de dieciséis y diecisiete años podrán votar en las elecciones municipales del próximo mayo. La Asamblea General aprobó ayer la reforma de la ley electoral con 128 votos a favor y 79 en contra, tras un debate de cinco horas seguido desde la tribuna por alumnos de tres institutos de Castroval. La medida incorpora al censo a unos 170.000 nuevos electores.',
          'La propuesta partió del Frente del Aldera, que la defendió como una forma de retener a los jóvenes en los pueblos: «Si decides a los dieciséis quién arregla tu plaza, te cuesta más marcharte de ella», argumentó la diputada Jacinta Elorduy. Convergencia Lirena y dos grupos minoritarios se sumaron. La Liga Moderada votó en contra por considerar que la mayoría de edad «no se puede trocear».',
          'La reforma se limita, por ahora, a los ayuntamientos. Extenderla a las elecciones generales exigiría modificar la Carta Fundamental con dos tercios de la Cámara, una mayoría que hoy no existe. Los institutos impartirán desde enero un taller de seis horas sobre el funcionamiento de un pleno municipal, y la Junta Electoral enviará a cada nuevo votante una carta con las instrucciones.'
        ], firma: 'Paloma Erquicia', lugar: 'Castroval' },

      { sec: 'Economía', tit: 'El paro baja del 8 % por primera vez en quince años gracias a la industria y al turismo de otoño', sum: 'Lirenia cierra el trimestre con 4,1 millones de ocupados, pero uno de cada cuatro contratos dura menos de un mes',
        txt: [
          'La tasa de paro lirena cayó en el tercer trimestre al 7,8 %, tres décimas menos que en primavera y el nivel más bajo desde hace quince años. La encuesta que publicó ayer el Instituto Lireno de Estadística eleva el número de ocupados a 4,1 millones, un récord, y sitúa el de desempleados en 347.000. Todas las comarcas crean empleo, con la excepción de Torremaura.',
          'El motor ha sido doble. La industria de Sotoluengo, impulsada por los pedidos de componentes eólicos, suma 11.000 trabajadores en un año, y la hostelería de la costa ha conseguido alargar la temporada hasta noviembre gracias a un otoño inusualmente cálido. Solo en Albamar, los hoteles han mantenido abiertas el 80 % de las plazas, veinte puntos más que hace un año.',
          'El dato tiene sombras. Uno de cada cuatro contratos firmados en el trimestre duró menos de un mes y el salario medio real sigue un 2 % por debajo del de hace cinco años. «Hay más gente trabajando, pero no vive mejor», advirtió la secretaria general de la Unión de Trabajadores, Micaela Zubizarreta. La patronal responde que los sueldos de convenio suben ya por encima de la inflación.'
        ], firma: 'Irene Solbes', lugar: 'Castroval' },

      { sec: 'Sociedad', tit: 'Los mayores que viven solos tendrán un cartero que llame a su puerta cada semana', sum: 'El servicio postal visitará a 38.000 personas de más de ochenta años en un programa pionero',
        txt: [
          'El cartero llamará una vez por semana, traiga carta o no. El servicio postal lireno y la Consejería de Bienestar firmaron ayer un convenio para que los 2.600 repartidores rurales visiten a las 38.000 personas mayores de ochenta años que viven solas en municipios pequeños. La visita durará unos diez minutos y servirá para comprobar que todo está en orden y avisar a los servicios sociales si algo falla.',
          'La idea nació de la práctica. «Lo hacíamos ya, sin que nadie nos lo pidiera. Si la señora Engracia no abre la ventana a las once, yo sé que pasa algo», cuenta Feliciano Urdangarai, que lleva veintiocho años repartiendo en los valles de Brezales. El año pasado, los carteros dieron la voz de alarma en 214 casos de caídas o enfermedad, según el recuento de la propia empresa.',
          'Los repartidores recibirán una formación de doce horas y llevarán una tableta con un cuestionario muy breve. El programa cuesta 4,2 millones de florines anuales, menos de lo que supone una semana de ingresos hospitalarios evitables, y compensa además la caída del correo ordinario, que ha perdido la mitad de su volumen en diez años. Empezará en febrero en el Alto Aldera y Brezales.'
        ], firma: 'Tomás Arregui', lugar: 'Brezales' },

      { sec: 'Ciudad', tit: 'Albamar limitará a 9.000 las plazas de pisos turísticos y cerrará las que no tengan licencia', sum: 'El Ayuntamiento congela nuevas autorizaciones en el casco viejo, donde hay más camas que vecinos',
        txt: [
          'El Ayuntamiento de Albamar aprobó ayer la ordenanza que pone techo a los pisos turísticos: 9.000 plazas en toda la ciudad, un tercio menos de las que se anuncian hoy en las plataformas. En el casco viejo y en el barrio de Pescadores, donde hay ya más camas para visitantes que vecinos empadronados, no se concederá ninguna licencia nueva y las existentes caducarán cuando la vivienda se venda.',
          'Los inspectores municipales han identificado 2.300 apartamentos que operan sin autorización. Sus dueños tendrán tres meses para retirarlos del mercado o se enfrentarán a multas de hasta 30.000 florines. «No estamos contra el turismo, vivimos de él. Estamos contra una ciudad en la que la panadera no puede alquilar a diez calles de la panadería», defendió el alcalde, Leandro Quirós.',
          'La asociación de propietarios anunció un recurso y sostiene que la medida hundirá los ingresos de familias que complementan así la pensión. Los vecinos del casco viejo, que han perdido 1.900 residentes en una década, la aplaudieron con cautela. Según el registro municipal, el alquiler medio en la ciudad ha subido un 51 % en seis años, el mayor incremento de toda Lirenia.'
        ], firma: 'Ainhoa Recarte', lugar: 'Albamar' },

      { sec: 'Ciencia', tit: 'Hallada en una cueva de Torremaura la flauta más antigua de la región, tallada hace 31.000 años', sum: 'El instrumento, hecho con el hueso de un buitre, conserva cuatro agujeros y todavía suena',
        txt: [
          'Mide diecinueve centímetros, tiene cuatro agujeros y fue tallada en el cúbito de un buitre hace unos 31.000 años. La flauta apareció el pasado julio en la cueva del Cuervo, cerca de Torremaura, y los arqueólogos de la Universidad de Miravalle la presentaron ayer como el instrumento musical más antiguo hallado en esta parte del continente.',
          'La pieza estaba rota en tres fragmentos, a metro y medio de profundidad, junto a restos de hogueras y cuentas de collar. Su estado de conservación ha permitido fabricar una réplica exacta, que un músico hizo sonar durante la presentación: cinco notas claras, parecidas a las de una escala pentatónica. «No sabemos qué tocaban, pero sabemos que alguien dedicó muchas horas a algo que no servía para comer ni para abrigarse», dijo el director de la excavación, Roque Lizarralde.',
          'La cueva, descubierta por unos espeleólogos hace solo seis años, se ha revelado como uno de los yacimientos más ricos del país. Las campañas continuarán al menos una década. El Ayuntamiento de Torremaura, que busca alternativas económicas desde el cierre de las minas, proyecta un centro de interpretación en el antiguo lavadero de carbón, con una sala donde los visitantes podrán escuchar la flauta.'
        ], firma: 'Hugo Zarandona', lugar: 'Torremaura' },

      { sec: 'Tecnología', tit: 'Los juzgados lirenos dejarán de usar papel en dos años', sum: 'El expediente digital se estrena en Miravalle con 14.000 causas y promete recortar un tercio los plazos',
        txt: [
          'Los juzgados de Miravalle se despidieron ayer de los carros cargados de legajos. Desde esta semana, las 14.000 causas abiertas en el partido judicial se tramitan en un expediente digital único, que jueces, fiscales y abogados consultan desde una pantalla. Es el primer paso de un plan que eliminará el papel de todos los tribunales lirenos en un plazo de dos años.',
          'El sistema, desarrollado por un consorcio que encabeza Lumen Sistemas, permite presentar escritos a cualquier hora, notifica por vía electrónica y avisa cuando un plazo está a punto de vencer. La Consejería de Justicia calcula que los procedimientos civiles, que hoy duran catorce meses de media, se acortarán en un tercio. «La mitad del tiempo de un pleito es un papel esperando en una bandeja», resumió la jueza decana, Visitación Agirregoikoa.',
          'No todos comparten el entusiasmo. El colegio de abogados teme las caídas del sistema, como la que paralizó tres días el registro mercantil en primavera, y pide mantener una ventanilla presencial para los ciudadanos que litigan sin letrado. Los 2,3 kilómetros de estanterías del archivo de Miravalle se digitalizarán poco a poco; los documentos anteriores a 1950 irán al Archivo Nacional.'
        ], firma: 'Nerea Olabarrieta', lugar: 'Miravalle' },

      { sec: 'Cultura', tit: 'El Festival de Cine de Albamar premia una película rodada con los vecinos de un pueblo de 90 habitantes', sum: '«Los días largos», de la debutante Noa Erauskin, se lleva la Caracola de Oro y el premio del público',
        txt: [
          'Ninguno de sus intérpretes había estado antes delante de una cámara. «Los días largos», primera película de la directora Noa Erauskin, de 33 años, ganó anoche la Caracola de Oro del Festival de Cine de Albamar con una historia mínima: el último verano de la escuela de un pueblo de la sierra de Brezales, contado por los propios vecinos. El público, que vota a la salida de cada sesión, le dio también su premio.',
          'Erauskin rodó durante once semanas en Arcillares, de noventa habitantes, con un equipo de nueve personas y un presupuesto de 380.000 florines. La maestra, el pastor y la dueña del bar hacen de sí mismos. «Yo no dirigí a nadie. Esperé a que se olvidaran de mí», dijo al recoger el galardón, acompañada sobre el escenario por catorce vecinos que habían viajado en autobús.',
          'El jurado, presidido por el veterano director Bruno Aldemira, concedió el premio de interpretación a Candela Ordás por su papel de sindicalista en «Turno de noche» y el de guion a la comedia tarsiana «El invitado». La 38.ª edición del certamen se cierra con 61.000 espectadores, un 8 % más que el año pasado, y con la confirmación de que el viejo Cine Marítimo será por fin restaurado.'
        ], firma: 'Gonzalo Iturrioz', lugar: 'Albamar' },

      { sec: 'Sucesos', tit: 'Un desprendimiento corta durante dieciocho horas la carretera del puerto de Brezales', sum: 'Cuarenta vehículos quedaron atrapados bajo la nieve; no hubo heridos y los ocupantes durmieron en un refugio',
        txt: [
          'Un desprendimiento de rocas y nieve cortó a las siete de la tarde del sábado la carretera que cruza el puerto de Brezales, a 1.640 metros de altitud, y dejó atrapados durante la noche a cuarenta vehículos con 112 ocupantes. No hubo heridos. La vía, la única que comunica la sierra con el valle del Aldera sin dar un rodeo de noventa kilómetros, quedó reabierta ayer a la una de la tarde.',
          'La avalancha, de unos 3.000 metros cúbicos, cayó sobre la calzada en un tramo sin viseras de protección minutos después de que pasara un autobús de línea. Los agentes de tráfico y los voluntarios de Protección Civil condujeron a los viajeros a pie hasta el refugio de la Collada, donde pasaron la noche con mantas y caldo. «Los críos se lo tomaron como una excursión. Los mayores, menos», contaba una de las afectadas.',
          'El Gobierno comarcal reclama desde hace ocho años la construcción de un falso túnel en ese punto, donde se han registrado once desprendimientos en una década. La Consejería de Infraestructuras recordó que el proyecto está redactado y presupuestado en 17 millones de florines, y se comprometió a licitarlo antes del verano. Hasta entonces, el puerto se cerrará de forma preventiva con aviso de nevadas intensas.'
        ], firma: 'Rubén Castiñeira', lugar: 'Brezales' },

      { sec: 'Medio ambiente', tit: 'Sotoluengo respira el aire más limpio desde que hay mediciones', sum: 'Las partículas en suspensión caen un 41 % en cinco años por los filtros de la acería y el fin del carbón doméstico',
        txt: [
          'La ciudad que durante un siglo fue sinónimo de humo cerrará el año con el aire más limpio desde que se instaló la primera estación de medida, en 1987. La concentración media de partículas en suspensión en Sotoluengo ha bajado un 41 % en cinco años y, por primera vez, no se ha superado ningún día el umbral de alerta, según el informe que presentó ayer la Agencia Lirena del Aire.',
          'La mejora tiene tres causas: los nuevos filtros de Aceros Sotoluengo, la sustitución de 9.000 calderas de carbón por bombas de calor con ayudas públicas y la zona de bajas emisiones del centro. Los médicos ya la notan. Los ingresos de niños por crisis asmáticas en el hospital comarcal se han reducido casi un tercio. «Antes sabíamos qué viento soplaba por la sala de espera», recuerda la neumóloga Olalla Berriatúa.',
          'El informe advierte, sin embargo, de que el ozono sigue por encima de lo recomendable en verano y de que el tráfico de camiones hacia el puerto de Portalba es ahora la principal fuente de contaminación. La Agencia propone trasladar al ferrocarril al menos un tercio de esas mercancías cuando la vía antigua quede libre, algo que no ocurrirá antes de seis años.'
        ], firma: 'Lucía Barrenengoa', lugar: 'Sotoluengo' },

      { sec: 'Educación', tit: 'Los colegios de Portalba prohíben el móvil también en el recreo y los patios recuperan el balón', sum: 'Tras un trimestre de prueba, los conflictos entre alumnos bajan un 28 % y las bibliotecas prestan el doble',
        txt: [
          'Tres meses después de que los 64 colegios e institutos públicos de Portalba prohibieran el teléfono móvil durante toda la jornada, incluido el recreo, los directores han hecho balance y no quieren volver atrás. Los partes por conflictos entre alumnos han bajado un 28 %, los préstamos de las bibliotecas escolares se han duplicado y en los patios, cuentan, ha vuelto a oírse ruido.',
          'Los alumnos dejan el aparato apagado en una taquilla al entrar y lo recogen al salir. «La primera semana fue un drama. La segunda, alguien trajo una baraja», relata Germán Bidaurreta, director del instituto Dársena, donde los profesores han tenido que comprar balones y reponer las redes de las canastas. Las familias pueden llamar al centro en caso de urgencia, como se hizo siempre.',
          'No todo son ventajas: algunos docentes echan de menos el móvil como herramienta en clase, y los estudiantes mayores consideran excesivo que la norma se les aplique igual que a los de doce años. La Consejería de Educación, que observa la experiencia con interés, decidirá en primavera si la extiende a todo el país. Una encuesta entre 5.000 familias de la ciudad arroja un 81 % de apoyo.'
        ], firma: 'Begoña Larrinaga', lugar: 'Portalba' },

      { sec: 'Sanidad', tit: 'Faltan 900 médicos de familia y la mitad de los que ejercen se jubilará en diez años', sum: 'El colegio profesional alerta de que 140 consultorios rurales abren ya solo dos días por semana',
        txt: [
          'Lirenia necesita 900 médicos de familia más de los que tiene, y el problema va a empeorar antes de mejorar. El informe que el Colegio de Médicos entregó ayer a la Asamblea General advierte de que el 48 % de los facultativos de atención primaria tiene más de 55 años y se jubilará a lo largo de la próxima década, mientras que las plazas de formación en la especialidad quedan sin cubrir por tercer año.',
          'Las consecuencias se notan sobre todo lejos de las ciudades. Hay 140 consultorios rurales que abren ya solo dos días por semana, y en la comarca de Torremaura la espera para una cita ordinaria es de once días. «Tengo 1.900 pacientes y cuatro pueblos. Hago más kilómetros que consultas», cuenta la doctora Herminia Zaldúa, que con 63 años ha pospuesto el retiro porque nadie ha pedido su plaza.',
          'El Colegio propone subir un 20 % el sueldo en los destinos de difícil cobertura, ofrecer vivienda y permitir que los jubilados sigan pasando consulta a tiempo parcial. La Consejería de Sanidad comparte el diagnóstico y anunció 150 plazas más de formación, pero recordó que un médico tarda diez años en hacerse. Entretanto, recurrirá a la telemedicina y a enfermeras con más competencias.'
        ], firma: 'Elena Garmendia', lugar: 'Torremaura' },

      { sec: 'Internacional', tit: 'Las islas Meridias votan en referéndum mantener su estatuto de puerto franco', sum: 'El 61 % de los isleños rechaza integrarse en la unión aduanera de Orvalia, con una participación del 84 %',
        txt: [
          'Los 96.000 habitantes de las islas Meridias decidieron ayer seguir como están. El 61 % de los votantes rechazó en referéndum la integración del archipiélago en la unión aduanera de Orvalia y optó por conservar el estatuto de puerto franco que disfruta desde hace dos siglos. La participación, del 84 %, es la más alta registrada nunca en una consulta en las islas.',
          'La campaña había partido en dos a familias y cofradías. Los partidarios del sí prometían subvenciones agrícolas y un puente aéreo más barato; los del no, mantener los impuestos bajos que sostienen el comercio y los astilleros. «Hemos sido un mostrador entre dos tiendas durante doscientos años, y nos ha ido bien», dijo la gobernadora insular, Petra Vandermolen, que había defendido la neutralidad.',
          'El resultado tranquiliza a las navieras lirenas, que utilizan el puerto de Meridia Mayor como escala de avituallamiento y temían un aumento de las tasas. El Gobierno de Orvalia aseguró que respetará el veredicto y que el tratado del estrecho de Calder, firmado hace solo unas semanas en las mismas islas, no se verá afectado. La consulta no podrá repetirse hasta dentro de quince años.'
        ], firma: 'Daniel Ochandiano', lugar: 'Meridia Mayor' },

      { sec: 'Nacional', tit: 'La nevada más temprana en treinta años aísla 62 pueblos y deja sin clase a 14.000 alumnos', sum: 'El temporal cubre con medio metro la sierra de Brezales y obliga a cerrar tres puertos de montaña',
        txt: [
          'El invierno se adelantó tres semanas. Una nevada de intensidad poco común para mediados de noviembre cubrió ayer con hasta 55 centímetros la sierra de Brezales y la cuenca de Torremaura, dejó aislados 62 pueblos y obligó a suspender las clases de 14.000 alumnos. Tres puertos de montaña permanecen cerrados y en otros siete son obligatorias las cadenas.',
          'Las quitanieves trabajan desde la madrugada, pero el viento, con rachas de noventa kilómetros por hora, vuelve a tapar las calzadas a las pocas horas. Unos 8.000 hogares pasaron la noche sin luz por la caída de dos líneas de media tensión; Energías Cendra confía en restablecer el suministro a lo largo de hoy. En Arcillares, los vecinos abrieron a pala el camino hasta el consultorio.',
          'La nieve es, a la vez, una buena noticia. El Observatorio de Brezales calcula que el manto acumulado equivale a unos 40 hectómetros cúbicos de agua, un alivio modesto pero real para unos embalses bajo mínimos. «No arregla la sequía, pero es lo primero que cae del cielo en tres meses», señaló el meteorólogo Calixto Garmendia. El temporal remitirá mañana y dará paso a heladas severas.'
        ], firma: 'Carmen Uriarte', lugar: 'Brezales' },

      { sec: 'Política', tit: 'Dimite el consejero de Vivienda tras conocerse que alquilaba un piso turístico sin licencia', sum: 'Samuel Etxegarai deja el cargo a los tres días de la publicación y Ansúrez nombra a una arquitecta independiente',
        txt: [
          'El consejero de Vivienda, Samuel Etxegarai, presentó ayer su dimisión tres días después de que se supiera que ofrecía a turistas, sin la licencia obligatoria, un apartamento de su propiedad en el casco viejo de Albamar. El piso figuraba en una plataforma de reservas a 140 florines la noche mientras su departamento ultimaba, precisamente, la ley que endurece las sanciones contra esa práctica.',
          'Etxegarai admitió «un error de gestión doméstica» y aseguró que el anuncio lo tramitaba un familiar, pero reconoció que su continuidad «restaba autoridad a una ley necesaria». El presidente del Consejo, Ricardo Ansúrez, aceptó la renuncia en una conversación de diez minutos y evitó defenderlo en público. La oposición, que había pedido el cese desde el primer día, consideró que la salida llega «tarde y a rastras».',
          'Su sustituta será Berta Olaskoaga, arquitecta de 51 años, sin carné de partido y hasta ahora directora de la empresa pública de suelo. Hereda el plan de 12.000 viviendas de alquiler asequible y una ley que entra en la Asamblea dentro de dos semanas. «No tengo más piso que el mío, y vivo en él», dijo a los periodistas a la entrada de la Consejería.'
        ], firma: 'Paloma Erquicia', lugar: 'Castroval' },

      { sec: 'Economía', tit: 'El puerto de Portalba bate su récord de contenedores y ya planea un tercer muelle', sum: 'La dársena exterior movió 3,4 millones de unidades hasta octubre, un 12 % más que en todo el año anterior',
        txt: [
          'Con dos meses todavía por delante, el puerto de Portalba ha superado ya su mejor año. Hasta el 31 de octubre pasaron por la dársena exterior 3,4 millones de contenedores, un 12 % más que en los doce meses del ejercicio pasado. La Autoridad Portuaria atribuye el salto al desvío de rutas provocado por el bloqueo del estrecho de Calder y a la entrada en servicio de cuatro grúas automatizadas.',
          'El éxito tiene un coste: la terminal trabaja al 94 % de su capacidad y los barcos esperan una media de treinta horas en la bocana. El presidente del puerto, Arsenio Goicolea, anunció que pedirá autorización para construir un tercer muelle de 900 metros, una obra de 610 millones de florines que la Naviera Tramontana y otros dos operadores están dispuestos a cofinanciar.',
          'El proyecto exigirá ganar 38 hectáreas al mar frente a la playa de Poniente, y las asociaciones vecinales y ecologistas ya han anunciado alegaciones. Los estibadores, por su parte, reclaman que la ampliación no sirva de pretexto para extender la automatización: el puerto da trabajo directo a 5.200 personas, una cifra que apenas ha crecido pese a que el tráfico se ha duplicado en quince años.'
        ], firma: 'Víctor Amenábar', lugar: 'Portalba' },

      { sec: 'Sociedad', tit: 'Los lirenos leen más que nunca, pero cada vez compran menos libros', sum: 'Las bibliotecas públicas baten su récord de préstamos mientras cierran 46 librerías en dos años',
        txt: [
          'Seis de cada diez lirenos leen al menos un libro al trimestre, la proporción más alta desde que se hace la encuesta de hábitos culturales. El dato, publicado ayer, convive con otro menos alegre: en los dos últimos años han cerrado 46 librerías, y el gasto medio por hogar en libros ha bajado a 71 florines anuales. La explicación está en las bibliotecas, que prestaron el año pasado 14 millones de ejemplares.',
          'La red pública, que ha abierto 38 sedes desde 2020 y amplió sus horarios a los domingos, tiene hoy 2,7 millones de socios, casi un tercio de la población. El préstamo digital se ha multiplicado por cuatro. «Viene gente que no había pisado una biblioteca en su vida, y viene a por novelas», explica Milagros Echaniz, bibliotecaria en la central de Portalba, donde hay listas de espera de tres meses para los títulos más pedidos.',
          'Los libreros piden que las bibliotecas compren sus fondos en las tiendas de cada municipio y no a grandes distribuidoras, como ya ocurre en Miravalle. La encuesta revela además una brecha persistente: las mujeres leen el doble que los hombres a partir de los cuarenta años, y los adolescentes abandonan la lectura por placer, de forma brusca, entre los trece y los quince.'
        ], firma: 'Sara Linazasoro', lugar: 'Portalba' },

      { sec: 'Ciudad', tit: 'Miravalle cerrará al tráfico su casco histórico todos los fines de semana', sum: 'La medida afecta a 34 calles dentro de la muralla y se compensará con dos aparcamientos gratuitos y lanzaderas',
        txt: [
          'Desde el primer sábado de marzo, ningún coche que no sea de residentes podrá entrar en el recinto amurallado de Miravalle entre las diez de la mañana del sábado y la medianoche del domingo. El Ayuntamiento aprobó ayer la medida, que afecta a 34 calles, tras un ensayo de seis fines de semana en el que el comercio del centro aumentó sus ventas un 14 %.',
          'Los visitantes podrán dejar el vehículo en dos aparcamientos disuasorios gratuitos, junto al campus y la estación, conectados con la plaza de la Catedral por autobuses eléctricos cada ocho minutos. Los 4.100 residentes conservarán el acceso con una tarjeta, y los repartidores tendrán una franja hasta las diez. «Esta ciudad se trazó para ir andando y a caballo. Lo raro era lo otro», comentó el alcalde, Fulgencio Arrieta.',
          'La asociación de hosteleros apoya el cierre; los talleres y los pocos comercios de muebles que resisten intramuros, no tanto. La medida forma parte de la candidatura del casco histórico a patrimonio protegido, que se decidirá el próximo año. Las mediciones del ensayo registraron además una caída del ruido de once decibelios en la calle Mayor, la más transitada.'
        ], firma: 'Ignacio Recalde', lugar: 'Miravalle' },

      { sec: 'Ciencia', tit: 'Una vacuna experimental contra la malaria desarrollada en Castroval logra un 82 % de eficacia', sum: 'El ensayo con 4.200 niños abre la puerta a una producción a bajo coste en un plazo de tres años',
        txt: [
          'Una vacuna contra la malaria diseñada en el Instituto de Biomedicina de Castroval ha protegido al 82 % de los niños que la recibieron en un ensayo con 4.200 participantes de entre cinco meses y tres años. Los resultados, revisados por un comité independiente y presentados ayer, sitúan al preparado entre los más eficaces probados hasta ahora y, sobre todo, entre los más baratos de fabricar.',
          'La fórmula utiliza una proteína del parásito producida en levaduras, una técnica habitual en la industria que permite fabricar cada dosis por menos de dos florines. Se administra en tres pinchazos con un refuerzo al año. «La ciencia difícil ya estaba hecha por otros. Nuestro trabajo ha sido conseguir que quepa en el presupuesto de un país pobre», explicó el inmunólogo Elías Barandiarán, que dirige el proyecto desde hace doce años.',
          'El siguiente paso es un ensayo con 20.000 niños en cuatro países, que empezará en primavera y durará dos años. Si confirma los datos, la vacuna podría estar disponible en tres. El instituto ha renunciado a la patente y ha cedido la licencia a un fabricante público, una decisión que su consejo rector aprobó por unanimidad y que varios laboratorios privados habían intentado evitar.'
        ], firma: 'Aurora Meabe', lugar: 'Castroval' },

      { sec: 'Tecnología', tit: 'Un programa entrenado con la voz de los abuelos salva del olvido el habla del Alto Aldera', sum: 'Lingüistas e ingenieros graban a 320 hablantes para crear un diccionario sonoro y un asistente de voz',
        txt: [
          'En el Alto Aldera se dice «brumar» por lloviznar y «zarracatín» por alboroto, y cada vez lo dice menos gente. Para que esas palabras no se pierdan, un equipo de lingüistas e ingenieros de la Universidad de Miravalle ha grabado durante dos años a 320 vecinos de más de setenta años y ha entrenado con sus voces un programa capaz de reconocer y reproducir el habla de la comarca.',
          'El resultado, presentado ayer en Valdearcos, es un diccionario sonoro con 11.400 voces y un asistente que entiende a quien le habla con acento ribereño, algo que los sistemas comerciales hacen mal. «Mi madre le pedía la hora al aparato y no la entendía. A este sí», cuenta Benigna Otxandorena, de 74 años, una de las informantes. Las 900 horas de grabación incluyen refranes, recetas y canciones de siega.',
          'El proyecto ha costado 600.000 florines y su código es abierto. Las escuelas de la comarca usarán el diccionario en clase desde enero. Los investigadores quieren repetir la experiencia con el habla marinera de las islas Cendra, que conserva vocabulario de navegación desaparecido en el resto del país y que hoy solo utilizan con naturalidad unos dos mil isleños.'
        ], firma: 'Nerea Olabarrieta', lugar: 'Valdearcos' },

      { sec: 'Cultura', tit: 'La Orquesta Sinfónica de Lirenia nombra por primera vez a una directora titular', sum: 'Irati Mendiluce, de 39 años, sucede al maestro Colmenero y debutará con un programa de compositoras olvidadas',
        txt: [
          'La Orquesta Sinfónica de Lirenia tendrá por primera vez en sus 112 años de historia una mujer al frente. El patronato designó ayer directora titular a Irati Mendiluce, de 39 años, nacida en Fuentecalma y formada en el conservatorio de Castroval antes de hacer carrera en teatros de Nordhaven y Vesperia. Sustituye al maestro Evelio Colmenero, que se retira tras diecinueve temporadas.',
          'Los músicos habían votado en una consulta interna, y Mendiluce obtuvo el respaldo de 71 de los 88 profesores. Violista de formación, es conocida por ensayos breves y programas arriesgados. «No vengo a romper nada. Vengo a tocar lo que no se toca y a llenar la sala de gente que cree que esto no es para ella», dijo en la presentación, celebrada en el vestíbulo del Auditorio del Aldera.',
          'Su primera temporada, que arranca en septiembre, incluirá una gira por diez localidades sin sala de conciertos, con actuaciones en polideportivos y lonjas, y un ciclo dedicado a cuatro compositoras lirenas del siglo XIX cuyas partituras duermen en el Archivo Nacional. El contrato es por cinco años. Los abonos, que llevaban tres temporadas a la baja, han crecido un 9 % desde que se filtró su nombre.'
        ], firma: 'Julia Menchaca', lugar: 'Castroval' },

      { sec: 'Sucesos', tit: 'Detenido el autor de catorce robos en joyerías que escapaba siempre en tranvía', sum: 'El sospechoso, de 58 años y sin antecedentes, guardaba el botín en un trastero de Castroval',
        txt: [
          'Durante dos años, la policía de Castroval buscó a un ladrón metódico que entraba en las joyerías a media mañana, pedía ver relojes, se guardaba dos o tres con un juego de manos y desaparecía sin correr. Ayer lo detuvo a la salida de su casa. Tiene 58 años, carece de antecedentes y, según los investigadores, huía siempre en tranvía porque «nadie mira a quien espera en una parada».',
          'El hombre, antiguo ilusionista de sala de fiestas, está acusado de catorce robos por un valor conjunto de 410.000 florines. Lo delató su abono de transporte: los agentes cruzaron las horas de los robos con las validaciones en las paradas cercanas y hallaron una misma tarjeta en doce de ellos. En un trastero alquilado a su nombre aparecieron 37 relojes ordenados en cajas de zapatos y etiquetados con la fecha.',
          'El detenido no había vendido ni una sola pieza. «Dice que lo hacía para comprobar que todavía podía», explicó la comisaria Rosaura Ibáñez de Garayo, que admitió cierta perplejidad. Los joyeros han podido recuperar casi todo lo sustraído. El juez lo dejó en libertad con la obligación de comparecer cada quince días y la prohibición de acercarse a cualquier establecimiento del gremio.'
        ], firma: 'Rubén Castiñeira', lugar: 'Castroval' },

      { sec: 'Medio ambiente', tit: 'El lince regresa a la sierra de Brezales con la suelta de ocho ejemplares criados en cautividad', sum: 'El programa prevé liberar cuarenta animales en cinco años en un territorio donde se extinguió en 1962',
        txt: [
          'La jaula se abrió a las ocho y diez de la mañana y la hembra tardó casi un minuto en decidirse. Después cruzó el claro en tres saltos y se perdió entre los brezos. Con ella y otros siete ejemplares criados en cautividad comenzó ayer el regreso del lince a la sierra de Brezales, donde el último fue abatido en 1962. El programa prevé liberar cuarenta animales en cinco años.',
          'La zona elegida, 30.000 hectáreas de monte bajo entre Arcillares y la Collada, tiene hoy una densidad de conejos que no se veía desde hace décadas, gracias en parte al abandono de los cultivos. Cada lince lleva un collar que emite su posición cada cuatro horas. «El primer invierno es el examen. Si en primavera siguen aquí y han criado, habremos empezado bien», explica el veterinario Abel Lekuona, responsable del seguimiento.',
          'La reintroducción ha exigido cuatro años de conversaciones con cazadores y ganaderos, recelosos al principio. El acuerdo incluye compensaciones por daños al ganado menor en un plazo máximo de un mes y la colocación de pasos de fauna en la carretera del puerto, donde los atropellos son la principal amenaza. Seis sociedades de caza de la comarca colaboran ya en la vigilancia del furtivismo.'
        ], firma: 'Lucía Barrenengoa', lugar: 'Brezales' },

      { sec: 'Educación', tit: 'Lirenia mejora en matemáticas por primera vez en doce años, pero retrocede en comprensión lectora', sum: 'La evaluación de 22.000 alumnos de quince años revela que la brecha entre comarcas se ha reducido a la mitad',
        txt: [
          'Los alumnos lirenos de quince años resuelven mejor los problemas que hace tres cursos y entienden peor lo que leen. Es la conclusión de la evaluación nacional que presentó ayer la Consejería de Educación, basada en las pruebas de 22.000 estudiantes de 380 institutos. En matemáticas, la puntuación media sube once puntos, la primera mejora en doce años; en lectura cae siete.',
          'Los técnicos atribuyen el avance en cálculo al programa de desdobles, que divide las clases de matemáticas en grupos de quince alumnos en primero y segundo. El retroceso en lectura es más difícil de explicar y afecta sobre todo a los textos largos: uno de cada cuatro estudiantes no fue capaz de resumir un artículo de dos páginas. «Leen mucho y a trozos. Les cuesta sostener la atención hasta el final», señaló la inspectora Presentación Uzkudun.',
          'La mejor noticia del informe es la reducción de las diferencias territoriales. La distancia entre los institutos de Castroval y los de las comarcas del interior, que equivalía a un curso y medio, se ha acortado a la mitad. Los centros rurales de menos de cien alumnos obtienen, de hecho, los mejores resultados del país en comprensión lectora, un dato que la Consejería estudiará con detalle.'
        ], firma: 'Begoña Larrinaga', lugar: 'Castroval' },

      { sec: 'Sanidad', tit: 'El balneario de Fuentecalma se convierte en el primer centro público de rehabilitación del dolor crónico', sum: 'La Consejería recupera el edificio centenario para tratar cada año a 3.000 pacientes con aguas termales y fisioterapia',
        txt: [
          'El viejo balneario de Fuentecalma, cerrado desde hace catorce años y con la cúpula de hierro y vidrio a medio desplomar, reabrirá en otoño como el primer centro público de Lirenia dedicado al dolor crónico. La Consejería de Sanidad invertirá 22 millones de florines en restaurar el edificio, levantado en 1894, y en equipar sus tres piscinas termales, alimentadas por un manantial que brota a 41 grados.',
          'El centro atenderá cada año a unos 3.000 pacientes con fibromialgia, lumbalgias rebeldes o secuelas de accidentes, derivados por sus médicos para estancias de dos semanas. El programa combina hidroterapia, fisioterapia, psicología y ejercicio. «No prometemos quitar el dolor, sino enseñar a vivir con menos. Los estudios dicen que la mitad reduce la medicación a los seis meses», apunta la doctora Fidela Arruabarrena, futura directora.',
          'Para la villa, de 6.800 habitantes, es un regreso a los orígenes. Fuentecalma vivió un siglo de sus aguas, llegó a tener once hoteles y hoy conserva dos. El Ayuntamiento calcula que el centro creará 140 empleos directos. Los vecinos podrán seguir bañándose en la piscina exterior, como han hecho siempre, los domingos por la mañana y a precio de entrada municipal.'
        ], firma: 'Elena Garmendia', lugar: 'Fuentecalma' },

      { sec: 'Economía', tit: 'Conservas Albamar vuelve a manos de sus trabajadoras tras la quiebra del fondo que la compró', sum: 'Las 310 empleadas constituyen una cooperativa y reabren la fábrica con pedidos para ocho meses',
        txt: [
          'La sirena de Conservas Albamar volvió a sonar ayer a las siete de la mañana, cinco meses después de que el fondo de inversión que había comprado la empresa la llevara a la quiebra. Quienes entraron por la puerta eran las mismas de siempre, pero ya no como asalariadas: 310 trabajadoras, de una plantilla de 340, han invertido su indemnización y su prestación por desempleo para quedarse con la fábrica.',
          'La nueva cooperativa ha adquirido la maquinaria, la marca y las naves por 5,6 millones de florines, con un crédito del Banco del Aldera avalado por el Gobierno comarcal. Arranca con pedidos para ocho meses, en buena parte de clientes de Nordhaven que nunca dejaron de preguntar por la anchoa en salazón. «Sabíamos hacer las latas. Lo que no sabíamos era lo que valían», dice la presidenta, Dolores Achúcarro, 31 años en la línea de envasado.',
          'La fábrica, fundada en 1911, es la última gran conservera de una ciudad que llegó a tener cuarenta. Las cooperativistas han acordado una escala salarial en la que nadie cobra más del triple que la que menos, y han recuperado la campaña del bonito, que el fondo había suprimido por poco rentable. La premiada novela de Olvido Farrán, ambientada entre esas mismas paredes, les ha traído ya dos pedidos inesperados.'
        ], firma: 'Ainhoa Recarte', lugar: 'Albamar' },

      { sec: 'Ciudad', tit: 'Torremaura convierte su mayor escombrera en un parque con cuarenta mil árboles', sum: 'La montaña de estériles de la mina San Roque, de 90 metros de altura, tendrá senderos, un mirador y un auditorio al aire libre',
        txt: [
          'Durante un siglo fue lo primero que se veía al llegar a Torremaura: una montaña negra de noventa metros de altura levantada con los estériles de la mina San Roque. Ayer, 600 escolares plantaron en su ladera los primeros robles y abedules de los 40.000 árboles que la cubrirán en tres años. La escombrera se convertirá en un parque de 52 hectáreas con senderos, un mirador y un pequeño auditorio al aire libre.',
          'El proyecto, de 9 millones de florines, se financia con el fondo de reconversión de la cuenca. Los ingenieros han sellado la superficie con arcilla y tierra vegetal para evitar que la lluvia arrastre metales al río. «Mi padre vació esa montaña de dentro de la tierra, vagoneta a vagoneta. Que ahora crezca un bosque encima tiene su justicia», decía Anselmo Brañas, concejal y antiguo picador, mientras repartía azadas.',
          'El parque conservará el castillete de la mina y una de las vagonetas, y enlazará con la vía verde que sigue el antiguo ferrocarril del carbón hasta Sotoluengo. La ciudad, que ha perdido un tercio de su población desde el cierre de los pozos, confía en que la obra sirva también para retener a los jóvenes. Catorce de los veinte puestos de jardinería se han reservado a desempleados de la comarca.'
        ], firma: 'Clara Ibarrola', lugar: 'Torremaura' },

      { sec: 'Cultura', tit: 'Vera Lumbier llena tres noches el estadio de Portalba con un disco grabado en la cocina de su abuela', sum: 'La cantante reúne a 135.000 personas en el cierre de una gira que ha pasado por veintidós ciudades',
        txt: [
          'Vera Lumbier terminó anoche en el estadio de la Ribera, ante 45.000 personas, la gira de «Mantel de hule», el disco que grabó hace dos años con un micrófono y una guitarra en la cocina de su abuela en Valdearcos. Era la tercera noche consecutiva con las entradas agotadas en su ciudad de adopción: 135.000 espectadores en total, una cifra que ningún artista lireno había alcanzado.',
          'El concierto duró dos horas y cuarenta minutos y no tuvo pantallas gigantes hasta la mitad. Lumbier, de 29 años, salió sola, cantó cuatro canciones sentada en una silla de enea y solo después dejó entrar a la banda. «Estas canciones se escribieron para doce personas en una cocina. Gracias por caber», dijo. El público coreó entera «Brumar», la nana que ha hecho popular una palabra del Alto Aldera.',
          'La gira, de veintidós fechas, ha vendido 610.000 entradas y ha incluido paradas tan poco habituales como la plaza de toros de Peñalcor o la lonja de las islas Cendra. La cantante anunció un descanso de un año. Su discográfica, Discos Tramontana, publicará en primavera la grabación de la última noche, cuyos beneficios irán a la escuela de música de su pueblo.'
        ], firma: 'Gonzalo Iturrioz', lugar: 'Portalba' },

      { sec: 'Sociedad', tit: 'Las fiestas de la Vendimia de Peñalcor recuperan el pisado de la uva tras veinte años de prohibición', sum: 'La villa recibe a 40.000 visitantes y reparte 6.000 litros de mosto en la plaza de la Colegiata',
        txt: [
          'La uva volvió a pisarse con los pies en la plaza de la Colegiata de Peñalcor. La tradición, suspendida hace veinte años por una normativa sanitaria que nadie recordaba bien, se recuperó ayer en la jornada grande de las fiestas de la Vendimia, después de que el Ayuntamiento lograra una autorización para que el mosto obtenido en el lagar de piedra se destine solo a la degustación en el momento.',
          'Doce cuadrillas de pisadores, entre ellas por primera vez tres de mujeres, exprimieron 9.000 kilos de uva tinta al ritmo de las dulzainas. Unas 40.000 personas, cuatro veces la población de la villa, llenaron las calles empedradas. «Mi abuelo pisó aquí con seis años y yo creía que no lo vería», decía emocionado el mayordomo de la cofradía de viticultores, Ezequiel Lapuerta, con las piernas moradas hasta la rodilla.',
          'La cosecha de este año es corta por la sequía, un 30 % menor que la anterior, pero de una calidad que los bodegueros califican de excepcional. La denominación de origen de Peñalcor agrupa a 64 bodegas y exporta ya la mitad de su producción. Las fiestas se cierran el domingo con la subasta de la primera barrica, cuya recaudación se destina cada año al asilo de la villa.'
        ], firma: 'Tomás Arregui', lugar: 'Peñalcor' },

      { sec: 'Internacional', tit: 'Orvalia inaugura el túnel ferroviario más largo del continente bajo los montes Garnak', sum: 'La galería de 57 kilómetros une en veinte minutos dos valles separados hasta ahora por cuatro horas de carretera',
        txt: [
          'Un tren de pasajeros cruzó ayer por primera vez los montes Garnak por debajo. El túnel ferroviario inaugurado por el Gobierno de Orvalia mide 57 kilómetros, ha tardado diecisiete años en construirse y es desde ahora el más largo del continente. Une en veinte minutos los valles de Terebin y Olsk, separados hasta ayer por un puerto de montaña cerrado cinco meses al año y cuatro horas de curvas.',
          'La obra ha costado el equivalente a 9.000 millones de florines, el doble de lo presupuestado, y nueve trabajadores perdieron la vida durante la perforación. Sus nombres figuran en una placa en la boca norte, ante la que el presidente orvaliano guardó un minuto de silencio. En el interior, la roca alcanza los 44 grados, y un sistema de ventilación del tamaño de una catedral mantiene el aire respirable.',
          'El túnel forma parte del corredor que enlazará los puertos del sur con las ciudades industriales del norte, y por él circularán cada día 180 trenes de mercancías. Lirenia sigue el proyecto con interés: los ingenieros de Ferrolira visitaron las obras en tres ocasiones para preparar los cuatro túneles, mucho más modestos, de la futura línea entre Castroval y Portalba.'
        ], firma: 'Daniel Ochandiano', lugar: 'Terebin' }
    ],

    opinion: [
      { autor: 'Elvira Santacreu', tit: 'El agua no entiende de lindes', frase: 'Un pacto imperfecto entre regantes y ciudades vale más que otra década de pleitos con los embalses vacíos.' },
      { autor: 'Noor Benhamú', tit: 'Lo que no se mide', frase: 'Sin contadores en cada toma, cualquier reparto del Aldera es un acto de fe, y la fe no llena pantanos.' },
      { autor: 'Germán Olaizola', tit: 'Cincuenta minutos', frase: 'El tren rápido acercará Castroval a Portalba; falta saber si alejará todavía más a todo lo que queda en medio.' },
      { autor: 'Adela Monreal', tit: 'Un Gobierno aburrido', frase: 'Prometer aburrimiento es la oferta más audaz que ha hecho un candidato en veinte años, y la más difícil de cumplir.' },
      { autor: 'Bernardo Ulacia', tit: 'La chimenea que se queda', frase: 'Sotoluengo hace bien en conservar una chimenea: las ciudades que borran sus cicatrices acaban sin cara.' },
      { autor: 'Leire Azpilicueta', tit: 'Treinta años y una habitación', frase: 'Una generación a la que se le pidió estudiar, esperar y callar empieza a preguntar, con razón, a cambio de qué.' },
      { autor: 'Faustino Requena', tit: 'Elogio del cartero', frase: 'Hemos tardado un siglo en descubrir que el mejor servicio social ya pasaba cada mañana por delante de la puerta.' },
      { autor: 'Maite Orbegozo', tit: 'El salmón no vota', frase: 'Derribar una presa no da votos el día que se anuncia; los da cuarenta años después, cuando ya gobierna otro.' },
      { autor: 'Cosme Barrutia', tit: 'Pisos con vistas al vecino que se fue', frase: 'Albamar ha entendido tarde que una ciudad sin vecinos es un decorado, y que los decorados no pagan panaderías.' },
      { autor: 'Rebeca Lasarte', tit: 'Dieciséis', frase: 'A quien puede trabajar, pagar impuestos y cuidar de un hermano le podemos confiar la elección de un alcalde.' },
      { autor: 'Julián Mendiguren', tit: 'Paciencia, dice el gobernador', frase: 'La paciencia es una virtud admirable, sobre todo cuando la recomienda quien no tiene la hipoteca a tipo variable.' },
      { autor: 'Inmaculada Zabaleta', tit: 'Leer a trozos', frase: 'No es que los adolescentes no lean: leen sin parar; lo que hemos dejado de enseñarles es a llegar al final.' },
      { autor: 'Ramiro Echeverri', tit: 'El puerto y la playa', frase: 'Cada muelle nuevo se presenta como inevitable; lo inevitable, en Portalba, suele tener nombre de naviera.' },
      { autor: 'Olga Bengoetxea', tit: 'Las manos en la escuela', frase: 'Un país que no sabe cambiar un enchufe no es más culto: solo depende más de quien sí sabe.' },
      { autor: 'Saturnino Irazoqui', tit: 'Dimitir a tiempo', frase: 'La dimisión que se presenta al tercer día ya no es un gesto de dignidad, sino el acuse de recibo de un despido.' },
      { autor: 'Carlota Mújica', tit: 'Médicos que no llegan', frase: 'Se puede formar a un médico en diez años o se le puede pagar bien mañana; llevamos quince sin hacer ninguna de las dos cosas.' },
      { autor: 'Efrén Zuloaga', tit: 'La montaña negra', frase: 'Plantar un bosque sobre una escombrera es hermoso; dar trabajo a quien vive a su sombra sería, además, útil.' },
      { autor: 'Nuria Arizmendi', tit: 'Contra el recreo con pantalla', frase: 'Quitamos el móvil del patio y descubrimos, con cierto pudor, que lo que faltaba no eran normas sino balones.' },
      { autor: 'Hilario Goñi', tit: 'Puerto franco, cabeza fría', frase: 'Los isleños de Meridia han votado lo que votan los pueblos pequeños cuando son sensatos: que nadie los salve.' },
      { autor: 'Amaia Sagastizábal', tit: 'La anchoa y el capital', frase: 'Un fondo vio en la conservera una hoja de cálculo; sus trabajadoras vieron una fábrica, y por eso sigue abierta.' },
      { autor: 'Silverio Monasterio', tit: 'Un cometa para apagar farolas', frase: 'Hará falta un cometa para que recordemos que el cielo oscuro también es patrimonio y que nos lo estábamos gastando.' },
      { autor: 'Beatriz Uranga', tit: 'Lo que cuesta una vacuna', frase: 'Renunciar a una patente es la forma más elegante de recordar para qué servía la ciencia antes de cotizar en Bolsa.' },
      { autor: 'Leandro Otaegui', tit: 'Nueve millones', frase: 'Somos más que nunca y vivimos más apretados que nunca: el censo no describe un éxito, describe una mudanza.' },
      { autor: 'Violeta Amézaga', tit: 'La directora', frase: 'Que sea noticia que una mujer dirija la Sinfónica dice poco de ella y bastante de los ciento doce años anteriores.' }
    ],

    breves: [
      { tit: 'La biblioteca central de Portalba abrirá los domingos', txt: 'El nuevo horario empieza en enero, de diez a dos, y se mantendrá todo el curso con personal de refuerzo.' },
      { tit: 'Récord de visitantes en el Museo del Faro', txt: 'Más de 90.000 personas han pasado por sus salas en lo que va de año, un 17 % más que en todo el anterior.' },
      { tit: 'El puente de Hierro de Sotoluengo cierra dos meses por obras', txt: 'Se sustituirán los tirantes y el tablero de madera; los peatones podrán cruzar por una pasarela provisional.' },
      { tit: 'Valdearcos estrena farmacia tras seis años sin ella', txt: 'La nueva titular, llegada de Castroval, abrirá también los sábados por la mañana y repartirá a domicilio en las aldeas.' },
      { tit: 'Las islas Cendra tendrán un segundo transbordador en verano', txt: 'El refuerzo duplicará las plazas diarias entre junio y septiembre y permitirá embarcar hasta noventa vehículos.' },
      { tit: 'El precio del pan sube cinco céntimos en Castroval', txt: 'El gremio de panaderos lo atribuye al encarecimiento de la harina y de la electricidad; es la primera subida en dos años.' },
      { tit: 'Hallado un mosaico romano en las obras del alcantarillado de Miravalle', txt: 'La pieza, de doce metros cuadrados y con motivos marinos, se trasladará al museo provincial tras su consolidación.' },
      { tit: 'La Universidad de Miravalle ofrecerá un grado en Ingeniería Naval', txt: 'Se impartirá desde septiembre en el campus de Portalba, con sesenta plazas y prácticas en los astilleros de la ría.' },
      { tit: 'Fuentecalma recupera su mercado de los jueves', txt: 'Treinta puestos de fruta, queso y miel vuelven a la plaza del Manantial después de las obras de pavimentación.' },
      { tit: 'El aeropuerto de Castroval estrena ruta directa con Nordhaven', txt: 'Aerolíneas Meridia operará cuatro vuelos semanales a partir de marzo, con una duración de dos horas y media.' },
      { tit: 'Los taxis de Albamar serán eléctricos en cinco años', txt: 'El Ayuntamiento subvencionará la mitad del coste de cada vehículo e instalará cuarenta puntos de carga rápida.' },
      { tit: 'Torremaura abre al público la galería de la mina San Roque', txt: 'Las visitas, guiadas por antiguos mineros, descienden ochenta metros y duran una hora y media. Hay que reservar.' },
      { tit: 'La cosecha de manzana de sidra cae un 20 % por la sequía', txt: 'Los lagareros del Alto Aldera prevén una producción corta pero de buena graduación, y mantendrán los precios.' },
      { tit: 'El Teatro Principal renueva sus 900 butacas', txt: 'La sala de Castroval cerrará en julio y agosto; las viejas butacas de terciopelo se subastarán con fines benéficos.' },
      { tit: 'Un vecino de Peñalcor dona 4.000 libros a la escuela', txt: 'El maestro jubilado Aquilino Sarasola ha cedido su biblioteca personal, que ocupará la antigua casa del conserje.' },
      { tit: 'La carretera de la costa tendrá carril bici entre Albamar y Portalba', txt: 'Los 46 kilómetros del trazado estarán terminados en dos años y aprovecharán la plataforma del viejo tranvía litoral.' },
      { tit: 'Los bomberos de Brezales incorporan un dron con cámara térmica', txt: 'Servirá para localizar excursionistas perdidos y vigilar los rescoldos de los incendios forestales durante la noche.' },
      { tit: 'El Banco del Aldera cerrará 31 oficinas rurales', txt: 'La entidad las sustituirá por dos oficinas móviles que visitarán cada pueblo un día por semana. Los alcaldes protestan.' },
      { tit: 'Sotoluengo plantará un árbol por cada niño nacido en la ciudad', txt: 'La iniciativa empezará en enero en el parque de la Fundición; cada familia recibirá una placa con el nombre.' },
      { tit: 'La lonja de Portalba subasta un atún rojo de 312 kilos', txt: 'El ejemplar, capturado frente a las islas Cendra, alcanzó los 19.400 florines y viajará a un restaurante de la capital.' },
      { tit: 'Las farmacias dispensarán gratis protectores solares a los pescadores', txt: 'La campaña, impulsada por las cofradías y el Colegio de Dermatólogos, llegará a 4.800 marineros de bajura.' },
      { tit: 'El castillo de Peñalcor reabre su torre del homenaje', txt: 'La restauración ha durado tres años y permite subir de nuevo a la terraza, con vistas a toda la comarca vinícola.' },
      { tit: 'Castroval instala 200 fuentes de agua potable en sus calles', txt: 'Todas tendrán pulsador de bajo consumo; durante la emergencia hídrica funcionarán solo de ocho a ocho.' },
      { tit: 'La feria del queso de Brezales reúne a sesenta pastores', txt: 'El certamen premió un azul de oveja curado en cueva, elaborado por dos hermanas de Arcillares de 26 y 29 años.' },
      { tit: 'El hospital de Portalba estrena un quirófano robotizado', txt: 'Permitirá realizar unas 400 intervenciones al año de urología y cirugía digestiva con ingresos más cortos.' },
      { tit: 'Los autobuses nocturnos de Miravalle circularán hasta las cinco', txt: 'El servicio se amplía los jueves, viernes y sábados a petición del consejo de estudiantes de la universidad.' },
      { tit: 'Rescatada una tortuga boba en la playa de Poniente', txt: 'El animal, enredado en una red, se recupera en el centro de fauna marina y será devuelto al mar en primavera.' },
      { tit: 'La vendimia de Peñalcor termina con un 30 % menos de uva', txt: 'El consejo regulador destaca la sanidad del fruto y augura vinos concentrados, de más cuerpo que los del año pasado.' },
      { tit: 'El archivo de Torremaura digitaliza las nóminas de la mina', txt: 'Los descendientes de 22.000 mineros podrán consultar en línea los expedientes laborales desde 1890.' },
      { tit: 'Un grupo de vecinos compra el último cine de Fuentecalma', txt: 'Cuatrocientos socios han aportado cien florines cada uno para evitar que la sala se convierta en un supermercado.' },
      { tit: 'Las obras del tercer carril de la ronda de Castroval acabarán en junio', txt: 'El tramo de siete kilómetros lleva un retraso de cinco meses por la aparición de restos de una calzada medieval.' },
      { tit: 'La cofradía de Albamar veda el pulpo durante dos meses', txt: 'Los propios pescadores han pedido adelantar el paro biológico tras detectar una caída del 40 % en las capturas.' },
      { tit: 'El conservatorio de Castroval admite por primera vez acordeonistas', txt: 'La especialidad, muy arraigada en las comarcas del interior, tendrá doce plazas y un profesor llegado de Vesperia.' },
      { tit: 'Un apagón deja dos horas sin luz al centro de Portalba', txt: 'La avería en una subestación afectó a 30.000 clientes y detuvo el tranvía; Energías Cendra investiga las causas.' },
      { tit: 'Brezales acogerá el campeonato nacional de esquí de fondo', txt: 'La prueba se disputará en febrero en el circuito de la Collada, si la nieve acompaña, con 240 inscritos.' },
      { tit: 'La Asamblea General abrirá sus puertas a los escolares los viernes', txt: 'Los grupos podrán ocupar los escaños y celebrar un debate simulado. Las solicitudes ya cubren hasta mayo.' },
      { tit: 'Los relojeros de Sotoluengo restauran el carillón del Ayuntamiento', txt: 'Sus dieciocho campanas, mudas desde 1998, volverán a tocar el himno de la ciudad cada mediodía.' },
      { tit: 'El albergue de peregrinos de Valdearcos duplica sus camas', txt: 'El camino del Aldera recibió este año a 12.000 caminantes, el triple que hace un lustro.' },
      { tit: 'Una vecina de Albamar cumple 107 años y sigue bajando al mercado', txt: 'Encarnación Loidi, antigua conservera, atribuye su longevidad «a las sardinas y a no discutir después de cenar».' },
      { tit: 'La línea 3 del tranvía de Castroval tendrá wifi gratuito', txt: 'Telelira instalará los equipos en los 24 convoyes antes de fin de año, dentro de un acuerdo de patrocinio.' },
      { tit: 'El faro de Punta Cendra se alquilará como residencia de escritores', txt: 'Cada autor seleccionado podrá pasar un mes en la antigua vivienda de la farera, con una beca de 1.500 florines.' },
      { tit: 'Los agricultores de la vega ensayan el riego nocturno por goteo', txt: 'Cuarenta fincas de Sotoluengo han reducido a la mitad su consumo de agua sin perder cosecha de tomate.' }
    ],

    citas: [
      { txt: 'Una ciudad se mide por lo que decide no construir junto al agua', autor: 'Aurora Benimelis, urbanista' },
      { txt: 'No hemos resuelto todas las diferencias, pero hemos decidido dejar de pagarlas', autor: 'Halda Morvenn, canciller de Vesperia' },
      { txt: 'Ha llovido menos otras veces. Lo que nunca habíamos visto es tan poca agua con tanto calor', autor: 'Sabela Nogueruelas, dendrocronóloga' },
      { txt: 'Mi abuela limpiaba anchoas doce horas al día y nadie escribió una línea sobre ella', autor: 'Olvido Farrán, escritora' },
      { txt: 'Quitamos nueve metros de hormigón y el río hizo el resto en cuatro inviernos', autor: 'Carlota Ezquerro, bióloga' },
      { txt: 'Sé lo que significa una cuota que sube. También sé lo que significa bajar los tipos demasiado pronto', autor: 'Aurelio Montesdeoca, gobernador del Banco Central' },
      { txt: 'Somos más, somos más viejos y vivimos más juntos. Las tres cosas obligan a planificar', autor: 'Gaspar Leturiondo, director del Instituto Lireno de Estadística' },
      { txt: 'Tengo un contrato indefinido, un máster y una habitación de nueve metros', autor: 'Aitana Belmonte, enfermera' },
      { txt: 'Los cometas son como los gatos: tienen cola y hacen lo que les da la gana', autor: 'Jimena Altolaguirre, astrónoma' },
      { txt: 'Un retablo se pinta para un sitio. Nosotros solo lo cuidamos mientras se cura', autor: 'Covadonga Ruiloba, directora del Museo de Bellas Artes' },
      { txt: 'Si la señora Engracia no abre la ventana a las once, yo sé que pasa algo', autor: 'Feliciano Urdampilleta, cartero rural' },
      { txt: 'No sabemos qué tocaban, pero alguien dedicó muchas horas a algo que no servía para comer ni para abrigarse', autor: 'Roque Lizarralde, arqueólogo' },
      { txt: 'La mitad del tiempo de un pleito es un papel esperando en una bandeja', autor: 'Visitación Agirregoikoa, jueza decana de Miravalle' },
      { txt: 'Yo no dirigí a nadie. Esperé a que se olvidaran de mí', autor: 'Noa Erauskin, cineasta' },
      { txt: 'Antes sabíamos qué viento soplaba por la sala de espera', autor: 'Olalla Berriatúa, neumóloga' },
      { txt: 'Tengo 1.900 pacientes y cuatro pueblos. Hago más kilómetros que consultas', autor: 'Herminia Zaldúa, médica rural' },
      { txt: 'Hemos sido un mostrador entre dos tiendas durante doscientos años, y nos ha ido bien', autor: 'Petra Vandermolen, gobernadora de las islas Meridias' },
      { txt: 'Esta ciudad se trazó para ir andando y a caballo. Lo raro era lo otro', autor: 'Fulgencio Arrieta, alcalde de Miravalle' },
      { txt: 'La ciencia difícil ya estaba hecha. Nuestro trabajo ha sido que quepa en el presupuesto de un país pobre', autor: 'Elías Barandiarán, inmunólogo' },
      { txt: 'Vengo a tocar lo que no se toca y a llenar la sala de gente que cree que esto no es para ella', autor: 'Irati Mendiluce, directora de orquesta' },
      { txt: 'Sabíamos hacer las latas. Lo que no sabíamos era lo que valían', autor: 'Dolores Achúcarro, presidenta de la cooperativa Conservas Albamar' },
      { txt: 'Estas canciones se escribieron para doce personas en una cocina. Gracias por caber', autor: 'Vera Lumbier, cantante' },
      { txt: 'Mi padre vació esa montaña de dentro de la tierra, vagoneta a vagoneta. Que ahora crezca un bosque encima tiene su justicia', autor: 'Anselmo Brañas, antiguo minero y concejal de Torremaura' },
      { txt: 'No cerramos una mina, cambiamos de siglo', autor: 'Sigrun Aldersen, primera ministra de Nordhaven' },
      { txt: 'El fútbol se juega con los pies, pero se gana con los noventa minutos enteros', autor: 'Zacarías Lertxundi, entrenador del Atlético Portalba' },
      { txt: 'Poníamos a los residentes en la puerta y a los expertos al fondo. Era justo al revés', autor: 'Amparo Sistiaga, jefa de urgencias' }
    ],

    cifras: [
      { v: '9.027.416', l: 'habitantes tiene Lirenia según el último censo' },
      { v: '50 min', l: 'durará el viaje en tren entre Castroval y Portalba' },
      { v: '3,25 %', l: 'tipo de interés oficial del Banco Central de Lirenia' },
      { v: '7,8 %', l: 'tasa de paro, la más baja en quince años' },
      { v: '23 %', l: 'del agua que cabe en los embalses del Aldera es la que queda' },
      { v: '1.840', l: 'matrículas nuevas en las escuelas rurales este curso' },
      { v: '30,4 años', l: 'edad media a la que se emancipan los jóvenes lirenos' },
      { v: '312', l: 'salmones han remontado el Aldera este otoño' },
      { v: '3,4 millones', l: 'de contenedores ha movido el puerto de Portalba hasta octubre' },
      { v: '450 M', l: 'de florines invertirá Aceros Sotoluengo en su horno eléctrico' },
      { v: '41 %', l: 'menos partículas en el aire de Sotoluengo que hace cinco años' },
      { v: '900', l: 'médicos de familia faltan en la atención primaria' },
      { v: '82 %', l: 'de eficacia alcanza la vacuna experimental contra la malaria' },
      { v: '31.000 años', l: 'tiene la flauta de hueso hallada en Torremaura' },
      { v: '62 %', l: 'del sueldo de un joven se iría en alquilar solo en la capital' },
      { v: '214', l: 'aldeas recibirán fibra óptica en los próximos dieciocho meses' },
      { v: '14 millones', l: 'de libros prestaron las bibliotecas públicas el año pasado' },
      { v: '135.000', l: 'espectadores reunió Vera Lumbier en tres noches' },
      { v: '40.000', l: 'árboles cubrirán la escombrera de la mina San Roque' },
      { v: '9.000', l: 'plazas de pisos turísticos permitirá Albamar como máximo' },
      { v: '1 h 10 min', l: 'espera media en las urgencias del Hospital General' },
      { v: '170.000', l: 'jóvenes de 16 y 17 años podrán votar en mayo' },
      { v: '38.000', l: 'mayores que viven solos recibirán la visita semanal del cartero' },
      { v: '57 km', l: 'mide el nuevo túnel ferroviario de Orvalia' },
      { v: '28 %', l: 'menos conflictos en los colegios de Portalba sin móviles' },
      { v: '310', l: 'trabajadoras son ahora dueñas de Conservas Albamar' },
      { v: '11 años', l: 'llevaba el plan de los muelles esperando en un cajón' },
      { v: '2,7 millones', l: 'de socios tiene la red pública de bibliotecas' },
      { v: '62', l: 'pueblos quedaron aislados por la nevada de noviembre' },
      { v: '0,4 %', l: 'subieron los alquileres en octubre, el menor ritmo en seis años' }
    ],

    entrevistas: [
      { quien: 'Matilde Arbós', cargo: 'Farera de Punta Cendra durante treinta y cuatro años', qa: [
        { p: '¿Qué se aprende viviendo en un faro?', r: 'A no tener prisa. El mar pasa por delante todos los días y nunca es el mismo. Al tercer invierno dejas de mirar el reloj y empiezas a mirar el cielo, que avisa antes.' },
        { p: '¿Echó algo de menos?', r: 'El pan del día. Lo demás llegaba con la lancha de los jueves. Y a veces una conversación tonta, de las de ascensor. En un faro todas las conversaciones son importantes, y eso cansa.' },
        { p: '¿Pasó miedo alguna vez?', r: 'Una noche de febrero el viento arrancó la puerta de abajo y el agua subió once escalones. Miedo, no: tenía demasiado que hacer. El miedo vino al día siguiente, cuando conté los escalones.' },
        { p: 'La linterna es automática desde hace años. ¿Hacía falta una farera?', r: 'La luz se enciende sola, pero no ve. Yo avisé de cuatro barcos que derivaban sin máquina. Una bombilla no coge la radio.' },
        { p: '¿Qué le parece que el faro vaya a alojar a escritores?', r: 'Muy bien, siempre que alguien les explique cómo se purga la caldera. Y que no esperen inspirarse: allí lo que se hace es mirar. Lo de escribir vendrá después, en casa.' },
        { p: '¿Volvería?', r: 'Mañana. Pero tengo setenta y un años y la escalera tiene ciento cuarenta y seis peldaños. Hay amores que se terminan por las rodillas.' }
      ] },
      { quien: 'Aurelio Montesdeoca', cargo: 'Gobernador del Banco Central de Lirenia', qa: [
        { p: 'Los hipotecados esperaban una rebaja antes de Navidad. ¿Por qué no llega?', r: 'Porque la inflación de los servicios sigue por encima del 4 %. Si bajamos ahora y los precios repuntan, tendríamos que subir de nuevo, y eso es peor para todos, empezando por quien tiene una hipoteca.' },
        { p: 'Dos consejeros votaron en contra. ¿Está dividido el banco?', r: 'Está vivo. Un consejo que vota siempre por unanimidad no delibera: asiente. Las discrepancias se publican en las actas y me parece sano que así sea.' },
        { p: '¿Cuándo bajarán los tipos, entonces?', r: 'Cuando los datos lo permitan. Sé que es una respuesta insatisfactoria, pero la alternativa es prometer una fecha, y los gobernadores que prometen fechas acaban desmintiéndose.' },
        { p: 'El Gobierno le reprocha en privado que frena el crecimiento.', r: 'En privado me dicen muchas cosas. En público, la ley me encarga la estabilidad de los precios, no la popularidad. Con un paro por debajo del 8 % cuesta sostener que la economía esté asfixiada.' },
        { p: '¿Le preocupa el precio de la vivienda?', r: 'Mucho, pero no se arregla desde un banco central. Faltan casas donde está el trabajo. Con tipos al cero faltarían igual y costarían más.' },
        { p: '¿Qué hace un gobernador el día que decide los tipos?', r: 'Madruga, repasa las cifras por última vez y procura desayunar poco. A mediodía ya está todo dicho. Por la tarde leo lo que he querido decir según los periódicos.' }
      ] },
      { quien: 'Vera Lumbier', cargo: 'Cantante y compositora', qa: [
        { p: 'Tres noches de estadio con un disco grabado en una cocina. ¿Cómo se explica?', r: 'No se explica. Yo creo que la gente estaba cansada de canciones que suenan a oficina. En la cocina de mi abuela se oye la nevera, y resulta que eso también es música.' },
        { p: '¿No le da vértigo?', r: 'El vértigo fue antes, cuando tocaba para doce personas y me miraban a los ojos. Cuarenta y cinco mil son un paisaje. Canto para la fila tres y lo demás se arregla solo.' },
        { p: 'Ha popularizado palabras del Alto Aldera. ¿Era la intención?', r: 'Yo no sabía que «brumar» era una palabra rara. Era la que había. Me enteré de que hablaba distinto cuando llegué a Portalba y me pidieron que repitiera las cosas.' },
        { p: '¿Por qué un año de descanso ahora?', r: 'Porque no he escrito nada en dieciocho meses que no sea una lista de la compra. Para contar cosas hay que vivirlas, y en una furgoneta se vive poco.' },
        { p: '¿Qué hará?', r: 'Volver a Valdearcos, ayudar en la vendimia de mi tío, aprender a tocar bien el acordeón, que lo toco mal. Y aburrirme. De ahí salió el disco anterior.' }
      ] },
      { quien: 'Sabela Nogueruelas', cargo: 'Dendrocronóloga de la Universidad de Miravalle', qa: [
        { p: '¿Cómo se lee una sequía en un árbol?', r: 'Cada año el árbol añade un anillo. Si llueve, el anillo es ancho; si no, estrecho. Un tejo de mil años es un cuaderno de mil páginas, y nosotros hemos aprendido la caligrafía.' },
        { p: '¿Hay que cortarlo?', r: 'Jamás. Sacamos un cilindro del grosor de un lápiz con una barrena hueca. Al árbol le hace lo que a usted un análisis de sangre. Algunos los hemos pinchado tres veces en ocho años y ahí siguen.' },
        { p: 'Dicen que esta sequía es la tercera peor en dos mil años. ¿Eso tranquiliza o asusta?', r: 'Las dos cosas. Tranquiliza saber que los tejos sobrevivieron a dos peores. Asusta que entonces hacía dos grados menos y vivían aquí cien mil personas, no nueve millones.' },
        { p: '¿Qué deberían hacer las administraciones con sus datos?', r: 'Dejar de planificar con los últimos ochenta años, que fueron una época de vacas gordas. Hemos construido embalses para un clima que era la excepción.' },
        { p: '¿Cuál es el árbol más viejo que ha encontrado?', r: 'Un tejo en un barranco de Brezales con 1.640 anillos contados, y le falta el centro, que está hueco. No digo dónde. A los árboles viejos lo que peor les sienta es la fama.' },
        { p: '¿Qué le ha enseñado pasar tantas horas en el monte?', r: 'Que la prisa es una enfermedad reciente. Un anillo estrecho no es un fracaso del árbol: es su manera de esperar.' }
      ] },
      { quien: 'Zacarías Lertxundi', cargo: 'Entrenador del Atlético Portalba', qa: [
        { p: 'Líderes en la jornada catorce con el cuarto presupuesto. ¿Cuál es el secreto?', r: 'Correr más que el rival y quejarse menos que el rival. Lo primero se entrena; lo segundo es más difícil, pero también.' },
        { p: 'Han ganado seis partidos en los últimos diez minutos.', r: 'Eso no es suerte, es gasolina. En pretemporada subimos el puerto de Brezales en bicicleta cuatro veces. Me odiaron en agosto y me lo agradecen en noviembre.' },
        { p: '¿Se ve campeón?', r: 'Me veo el domingo en Sotoluengo, con lluvia y un campo que es una patata. Más allá no veo. Cada vez que un entrenador mira la clasificación, pierde un punto.' },
        { p: 'Tiene siete canteranos en la primera plantilla. ¿Convicción o necesidad?', r: 'Las dos. No había dinero para fichar y había chavales que llevaban desde los ocho años esperando. Uno juega distinto cuando su abuelo está en la grada de siempre.' },
        { p: '¿Qué le dice a un jugador antes de un derbi?', r: 'Nada nuevo. El que necesita un discurso para jugar contra el Real Albamar ya ha perdido. Les recuerdo dónde está el agua y poco más.' },
        { p: '¿Y cuando pierden?', r: 'Cenamos juntos igual. A los equipos no los rompen las derrotas, los rompen los silencios del día después.' }
      ] },
      { quien: 'Dolores Achúcarro', cargo: 'Presidenta de la cooperativa Conservas Albamar', qa: [
        { p: 'De envasadora a presidenta en cinco meses. ¿Cómo ha sido?', r: 'Como una mudanza con la casa ardiendo. Un lunes nos dijeron que cerraban y el martes ya estábamos haciendo cuentas en el comedor, con un bolígrafo y los rollos de etiquetas por detrás.' },
        { p: '¿Por qué decidieron quedarse con la fábrica?', r: 'Porque los pedidos seguían llegando. La empresa no quebró por las latas, quebró por las deudas que le cargaron. Lo vimos en cuanto alguien nos dejó mirar los papeles.' },
        { p: '¿No les daba miedo arriesgar la indemnización?', r: 'Mucho. Hubo treinta compañeras que no entraron y las entiendo. Pero tengo 56 años: ¿quién me iba a contratar a mí? Preferí apostar por lo único que sé hacer bien.' },
        { p: '¿Qué ha cambiado dentro?', r: 'Que ahora las decisiones se toman a diez metros de la línea. Hemos recuperado el bonito, que es más trabajo y deja menos margen, pero es lo que distingue a esta casa.' },
        { p: '¿Cómo se manda entre iguales?', r: 'Mal, al principio. Luego aprendes que mandar es explicar. Hacemos asamblea el primer viernes de mes y dura lo que dura, que suele ser demasiado.' },
        { p: '¿Ha leído la novela ambientada en la fábrica?', r: 'Dos veces. La segunda, subrayando. Mi madre sale sin nombre en la página 212: es la que canta mientras descabeza. La autora no lo sabía, pero yo sí.' }
      ] },
      { quien: 'Íñigo Salvatierra', cargo: 'Cocinero del restaurante Marea Baja, en Portalba', qa: [
        { p: 'Ha quitado la carta. ¿Qué come quien se sienta en su restaurante?', r: 'Lo que entró esa mañana por la lonja. Si hubo temporal, hay huevos, patatas y mucho ingenio. Nadie se ha levantado todavía de la mesa.' },
        { p: '¿No es un riesgo para el negocio?', r: 'El riesgo era lo otro: prometer lubina cuarenta semanas al año y servirla de piscifactoría con cara de pena. Prefiero decepcionar con la verdad.' },
        { p: 'Cocina con algas, con pescado de descarte, con espinas. ¿Moda o convicción?', r: 'Hambre heredada. Mi abuela hacía sopa con las cabezas porque no había otra cosa. Yo le he puesto un plato bonito y un precio, que es lo único que he inventado.' },
        { p: '¿Qué plato no quitaría nunca?', r: 'Las anchoas con pan y mantequilla. Tres ingredientes. Si alguno falla, no hay salsa que lo tape. Es el plato que les hago preparar a los que piden trabajo.' },
        { p: 'Le llueven ofertas para abrir en Castroval.', r: 'Y las agradezco. Pero mi cocina está a doscientos metros del muelle por una razón. En la capital tendría que cocinar con camiones.' },
        { p: '¿Qué cena un cocinero en su casa?', r: 'Tortilla francesa, de pie y demasiado tarde. Los domingos cocina mi mujer y yo friego, que es el reparto justo.' }
      ] },
      { quien: 'Amparo Sistiaga', cargo: 'Jefa de urgencias del Hospital General de Castroval', qa: [
        { p: '¿Cómo se le ocurrió poner a un médico veterano en la puerta?', r: 'Mirando un aeropuerto. Me fijé en que quien decide por qué cola vas es alguien con experiencia. Nosotros hacíamos decidir al último que había llegado.' },
        { p: '¿Hubo resistencia?', r: 'Toda. A un adjunto con veinte años de oficio no le apetece pasar la guardia de pie en un vestíbulo. Les pedí un mes. Al mes no quiso volver ninguno.' },
        { p: '¿Por qué?', r: 'Porque resuelven. Ver a alguien con un esguince, vendarlo y mandarlo a casa en doce minutos es más satisfactorio que heredar una sala con cuarenta personas enfadadas.' },
        { p: '¿Sirve para cualquier hospital?', r: 'Sirve la idea, no la receta. En un comarcal con dos médicos de guardia no puedes poner uno en la puerta. Pero sí puedes poner al que más sabe a decidir primero.' },
        { p: '¿Qué es lo que la gente no entiende de unas urgencias?', r: 'Que no atendemos por orden de llegada, sino de gravedad. Si usted espera mucho, alégrese: significa que no se está muriendo.' }
      ] }
    ],

    cronologias: [
      { tit: 'Once años de un plan para los muelles de Portalba', hitos: [
        { f: '2015', t: 'El Ayuntamiento presenta el primer proyecto de paseo marítimo y lo guarda tras las elecciones.' },
        { f: '2018', t: 'La Autoridad Portuaria traslada los graneles a la dársena exterior; los muelles viejos quedan casi vacíos.' },
        { f: '2021', t: 'Los vecinos de la Ribera reúnen cuatro mil firmas y las entregan en el pleno.' },
        { f: '2023', t: 'Se convoca el concurso de ideas. Gana el estudio de Aurora Benimelis entre 46 propuestas.' },
        { f: 'Otoño de 2026', t: 'La votación se aplaza dos veces por falta de acuerdo sobre la altura de los edificios.' },
        { f: 'Noviembre de 2026', t: 'El pleno aprueba el plan por dos votos. Las obras empezarán en primavera.' }
      ] },
      { tit: 'El conflicto del estrecho de Calder, paso a paso', hitos: [
        { f: 'Año 1', t: 'Un incidente entre pesqueros de Vesperia y Orvalia termina con un barco hundido y tres desaparecidos.' },
        { f: 'Año 2', t: 'Ambos países despliegan patrulleras y cierran el paso a los mercantes del otro. Las navieras desvían sus rutas.' },
        { f: 'Año 4', t: 'Fracasa la primera mediación de Nordhaven tras cinco semanas de conversaciones.' },
        { f: 'Año 6', t: 'Un temporal obliga a las dos flotas a refugiarse juntas en Meridia Mayor. Empiezan los contactos discretos.' },
        { f: 'Año 8', t: 'Se acuerda un alto el fuego pesquero durante la campaña de la caballa. Se respeta.' },
        { f: 'Año 9', t: 'Firma del tratado en las islas Meridias. El estrecho se reabre a la navegación.' }
      ] },
      { tit: 'Auge, cierre y segunda vida de la cuenca de Torremaura', hitos: [
        { f: '1871', t: 'Se abre el pozo San Roque. En diez años la villa pasa de 900 a 7.000 habitantes.' },
        { f: '1924', t: 'El ferrocarril del carbón enlaza las minas con las fundiciones de Sotoluengo.' },
        { f: '1958', t: 'Máximo histórico: 14.200 mineros y 38 pozos en activo.' },
        { f: '1994', t: 'Primeros cierres. La plantilla se reduce a la mitad en seis años.' },
        { f: '2016', t: 'Baja la última jaula. De las tres empresas prometidas para la reconversión llega una.' },
        { f: '2020', t: 'Unos espeleólogos descubren la cueva del Cuervo y su yacimiento paleolítico.' },
        { f: '2026', t: 'Empieza la plantación de 40.000 árboles sobre la gran escombrera.' }
      ] },
      { tit: 'Cómo volvió el salmón al Aldera', hitos: [
        { f: '1986', t: 'Último salmón documentado aguas arriba de Sotoluengo.' },
        { f: '2009', t: 'Cierra la última fábrica textil. Los azudes dejan de tener uso.' },
        { f: '2019', t: 'La Confederación aprueba, con protestas vecinales, el derribo de tres presas.' },
        { f: '2022', t: 'Cae el azud de Puente Sarrio. El río recupera once kilómetros de cauce libre.' },
        { f: '2024', t: 'Se sueltan 60.000 alevines criados en la piscifactoría de Valdearcos.' },
        { f: '2026', t: 'La cámara de la escala cuenta 312 adultos remontando en un solo otoño.' }
      ] },
      { tit: 'La sequía, mes a mes', hitos: [
        { f: 'Mayo', t: 'La primavera termina con un 35 % menos de lluvia. Los embalses están al 51 %.' },
        { f: 'Julio', t: 'Se prohíbe el riego por inundación en la vega de Sotoluengo.' },
        { f: 'Septiembre', t: 'No cae una gota en todo el mes en Castroval, algo que no ocurría desde 1949.' },
        { f: 'Octubre', t: 'Los embalses bajan del 30 %. Asoma el campanario del pueblo sumergido de Villarejo.' },
        { f: 'Noviembre', t: 'El Gobierno declara la emergencia hídrica en seis comarcas. Cortes nocturnos en 41 municipios.' },
        { f: 'Mediados de noviembre', t: 'Una nevada temprana deja medio metro en Brezales: el primer alivio en tres meses.' }
      ] },
      { tit: 'La carrera de Olvido Farrán', hitos: [
        { f: '1972', t: 'Nace en Albamar, hija de un patrón de bajura y de una conservera.' },
        { f: '1998', t: 'Publica «Marea muerta», un libro de cuentos del que se venden 400 ejemplares.' },
        { f: '2006', t: 'Se traslada a Peñalcor y trabaja como correctora durante una década.' },
        { f: '2014', t: 'Su novela «El invierno de los relojeros» obtiene el Premio de la Crítica.' },
        { f: '2019', t: 'Empieza a entrevistar a antiguas trabajadoras de las conserveras.' },
        { f: '2026', t: 'Publica «La sal en las manos» y gana el Premio Nacional de las Letras.' }
      ] },
      { tit: 'La temporada del Atlético Portalba', hitos: [
        { f: 'Agosto', t: 'Empate sin goles en el estreno. La grada silba al equipo.' },
        { f: 'Septiembre', t: 'Cuatro victorias seguidas, tres de ellas con gol en los últimos diez minutos.' },
        { f: 'Octubre', t: 'Lesión del capitán Urko Salaberría. Debuta el canterano Izan Mugartegui, de 18 años.' },
        { f: 'Noviembre', t: 'Remontada en el derbi ante el Real Albamar y liderato en solitario.' },
        { f: 'Diciembre', t: 'Visita al Deportivo Castroval, segundo a dos puntos, en el partido que cierra la primera vuelta.' }
      ] },
      { tit: 'El tren rápido, de la idea a las obras', hitos: [
        { f: '2011', t: 'Primer estudio informativo. Se descarta por su coste.' },
        { f: '2019', t: 'Ferrolira advierte de que la línea antigua está saturada: 212 trenes diarios.' },
        { f: '2023', t: 'El Consejo de Gobierno encarga el trazado definitivo, con parada en Sotoluengo.' },
        { f: '2026', t: 'La Asamblea General aprueba el plan con 141 votos a favor.' },
        { f: '2027', t: 'Inicio previsto de las expropiaciones y de los cuatro túneles.' },
        { f: '2032', t: 'Fecha anunciada para el primer viaje comercial: cincuenta minutos.' }
      ] }
    ],

    rosa: [
      { tit: 'Vera Lumbier e Íñigo Salvatierra se dan el «sí, quiero» a puerta cerrada', sum: 'Trescientos invitados, una finca entre viñedos y ni una sola fotografía: así fue la boda del año',
        txt: [
          'La cantante Vera Lumbier y el cocinero Íñigo Salvatierra se casaron el sábado al atardecer en una finca de Peñalcor, entre viñedos recién vendimiados y ante trescientos invitados que dejaron el teléfono en una cesta de mimbre a la entrada. No hubo exclusiva ni reportaje: los novios han repartido una única imagen, tomada de espaldas, en la que se les ve caminar de la mano hacia el lagar.',
          'La novia, según cuentan quienes estuvieron, llevó un vestido de lino crudo confeccionado por la modista de su pueblo y un ramo de brezo y romero. El menú lo firmó, cómo no, el novio: anchoas con pan y mantequilla, arroz de pescadores para todos y una tarta de manzana que cortaron con el cuchillo de su abuela. A medianoche, ella cogió la guitarra y cantó tres canciones. Dicen que nadie se movió de la silla.',
          'La pareja, que se conoció hace cuatro años en una cena benéfica en Portalba, pasará la luna de miel «en un sitio sin cobertura», según ha confiado un amigo íntimo. A su regreso se instalarán en la casa que han reformado frente al muelle de Levante.'
        ] },
      { tit: 'Candela Ordás presenta a su hija Jimena: «Es lo mejor que he rodado»', sum: 'La actriz reaparece radiante en el Festival de Albamar tres meses después de ser madre',
        txt: [
          'Tres meses después de dar a luz, Candela Ordás volvió a pisar una alfombra roja, la del Festival de Cine de Albamar, y lo hizo con la mejor compañía posible: la pequeña Jimena, dormida en brazos de su padre, el arquitecto Mauro Ezcurdia, que la esperaba discretamente a un lado. «Es lo mejor que he rodado, y sin segunda toma», bromeó la actriz, espléndida con un vestido verde botella.',
          'Ordás, de 36 años, recogió esa misma noche el premio de interpretación por «Turno de noche» y se lo dedicó «a todas las que vuelven al trabajo con ojeras y una sonrisa». Ha contado que rodó las últimas escenas embarazada de cinco meses y que el equipo de vestuario hizo milagros con las chaquetas.',
          'La familia vive en una casa con jardín a las afueras de Miravalle, lejos del ruido. La actriz se tomará las cosas con calma: no volverá a los platós hasta la primavera, cuando empezará una comedia a las órdenes de Bruno Aldemira.'
        ] },
      { tit: 'La marquesa de Peñalcor abre por primera vez las puertas de su palacio', sum: 'Casilda de Urrestarazu nos recibe entre tapices y perros de aguas para hablar de su nueva vida como bodeguera',
        txt: [
          'Hacía cuatro generaciones que ningún fotógrafo cruzaba el zaguán del palacio de Peñalcor. Casilda de Urrestarazu, decimotercera marquesa, ha decidido que ya era hora. Nos recibe en vaqueros y con botas de campo en el salón de los tapices, rodeada de sus tres perros de aguas, y sirve ella misma el café. «El servicio de la casa soy yo, y los jueves viene Puri», aclara entre risas.',
          'A sus 44 años, viuda desde hace seis, la marquesa ha convertido las viejas caballerizas en una pequeña bodega de la que salen 20.000 botellas al año. «Heredé un título, catorce goteras y una viña. He arreglado nueve goteras», resume. Sus dos hijos, Lope y Brianda, estudian en Castroval y la ayudan en la vendimia.',
          '¿Y el corazón? Sonríe y mira por la ventana. Se la ha visto varias veces paseando por Albamar con el navegante Gael Zubiaurre, pero ella prefiere no poner nombre a las cosas: «A mi edad una ya sabe que lo que se anuncia mucho dura poco».'
        ] },
      { tit: 'El duque de Fuentecalma y la presentadora Mencía Roldán confirman su romance en las regatas', sum: 'Un beso en la cubierta del velero disipa los rumores de todo el verano',
        txt: [
          'Los rumores venían de lejos, pero la confirmación llegó con viento de poniente. Tristán de Albornoz-Lezama, duque de Fuentecalma, y la presentadora Mencía Roldán se besaron el domingo en la cubierta del velero «Brisa», minutos después de que el aristócrata cruzara la meta en tercera posición en la Copa de la Bahía de Albamar. Ella lo esperaba en el pantalán con una toalla y una sonrisa.',
          'La pareja lleva viéndose desde la primavera, cuando coincidieron en una cena a beneficio del asilo de Peñalcor. Él, de 41 años y soltero de oro de la aristocracia lirena, regenta el balneario familiar; ella, de 38, conduce el magacín de las tardes y se separó hace dos años del empresario Rodolfo Arancibia, con quien mantiene una relación cordial.',
          '«Estamos muy contentos y no hay más que contar», dijo la presentadora al bajar del barco, con el pelo revuelto y sin perder la sonrisa. La duquesa viuda, que seguía la regata desde el club náutico con sus prismáticos, levantó la copa. Buena señal.'
        ] },
      { tit: 'Urko Salaberría y Cloe Bermúdez esperan su primer hijo', sum: 'El capitán del Atlético Portalba y la diseñadora lo anuncian con una diminuta camiseta rojiblanca',
        txt: [
          'Una camiseta del Atlético Portalba del tamaño de una mano, con el dorsal 1 y la palabra «Fichaje» a la espalda. Así han anunciado el futbolista Urko Salaberría y la diseñadora de joyas Cloe Bermúdez que esperan su primer hijo para el mes de mayo. La imagen, publicada el domingo por la noche, superó el millón de felicitaciones en pocas horas.',
          'La noticia llega en un momento agridulce para el capitán, de 31 años, que se recupera de una lesión de rodilla y no volverá a los terrenos de juego hasta febrero. «Tenía que ser ahora, para que aprenda a cambiar pañales con tiempo», ha comentado con humor su entrenador. La pareja se casó el verano pasado en la ermita de San Telmo.',
          'Cloe, de 29 años, ha adelantado que seguirá al frente de su taller en el barrio de la Ribera y que ya trabaja en una colección de medallas de cuna. Del nombre, ni una pista: «Lo sabrá primero su abuela».'
        ] },
      { tit: 'La tenista Lía Montenegro se compra un faro para vivir frente al mar', sum: 'La campeona del Abierto de Albamar cambia las pistas por las olas en su nuevo refugio de las islas Cendra',
        txt: [
          'Después de ganar su tercer Abierto de Albamar, Lía Montenegro se ha hecho el mejor regalo: la antigua casa del torrero de un pequeño faro en la costa norte de las islas Cendra. La tenista, de 27 años, nos enseña la vivienda todavía a medio amueblar, con las raquetas apoyadas junto a una estufa de leña y unas vistas que quitan el hipo.',
          '«Paso cuarenta semanas al año en hoteles con moqueta. Necesitaba un sitio donde lo único que suene sea el mar», explica mientras prepara una infusión. La casa tiene dos dormitorios, un huerto diminuto y, de momento, ningún televisor. Su entrenador y pareja desde hace tres años, Bastián Oyarbide, se encarga de la pintura.',
          'La campeona pasará aquí las Navidades con su familia antes de viajar a la gira del sur. Reconoce que le encantaría ser madre «cuando la rodilla diga basta», pero que todavía tiene tenis para rato.'
        ] },
      { tit: 'Rómulo Estévez viste de novia a la hija de la baronesa de Rocaverde', sum: 'El modisto firma un vestido con ocho metros de cola para el enlace que reunirá a toda la sociedad lirena',
        txt: [
          'Faltan tres semanas para la boda de Leonor de Rocaverde con el joven abogado Íker Landaburu, y en el taller de Rómulo Estévez, en el casco viejo de Castroval, no se duerme. El modisto, de 62 años, remata personalmente un vestido de seda natural con ocho metros de cola y un velo de encaje que perteneció a la tatarabuela de la novia.',
          '«Leonor quería algo sencillo. Le he hecho algo sencillo que pesa seis kilos», confiesa el diseñador con su ironía habitual. La ceremonia se celebrará en la colegiata de Peñalcor ante cuatrocientos invitados, y el banquete, en los jardines del palacio familiar. La baronesa viuda ha supervisado hasta la última flor.',
          'Entre los asistentes confirmados figuran el duque de Fuentecalma, la marquesa de Peñalcor y varias caras conocidas del cine y de la música. La novia ha pedido que, en lugar de regalos, se hagan donativos a la escuela de música de Valdearcos.'
        ] },
      { tit: 'Bruno Aldemira y Paulina Garay celebran sus bodas de plata rodeados de sus cinco nietos', sum: 'El director y la bailarina renuevan sus votos en la misma ermita en la que se casaron hace veinticinco años',
        txt: [
          'Veinticinco años después, la misma ermita, las mismas flores silvestres y casi los mismos invitados. El director de cine Bruno Aldemira y la bailarina Paulina Garay renovaron sus votos el sábado en Brezales, donde tienen su casa de verano, acompañados de sus tres hijos y de sus cinco nietos, que hicieron de pajes con más entusiasmo que orden.',
          '«El secreto es que ella nunca ha visto mis películas enteras y yo nunca he entendido sus coreografías», bromeó el cineasta, de 68 años, en el brindis. Paulina, elegantísima con un traje de chaqueta color marfil, bailó un vals con su marido y otro con el nieto mayor, que apenas le llega al hombro.',
          'La fiesta terminó con una chocolatada en la plaza a la que se sumó medio pueblo. La pareja prepara ahora su primer proyecto en común: un documental sobre las danzas de la sierra.'
        ] },
      { tit: 'Maruxa del Aldera vuelve a sonreír tras su operación de garganta', sum: 'La gran dama de la canción reaparece en un homenaje en Sotoluengo y anuncia que volverá a los escenarios',
        txt: [
          'El público del teatro Fundición se puso en pie antes de que dijera una palabra. Maruxa del Aldera, la gran dama de la canción lirena, reapareció el jueves en el homenaje que le rindió su ciudad natal, cuatro meses después de la delicada operación de garganta que la obligó a suspender su gira de despedida. Llevaba un mantón bordado y los ojos brillantes.',
          '«Los médicos me han dicho que puedo cantar. Lo que no me han dicho es que pueda callarme», dijo con esa voz ronca que tres generaciones reconocen. A sus 74 años, anunció que retomará los conciertos en primavera, «pocos y bien elegidos», y que el último será en la plaza de su barrio.',
          'La acompañaban su hija Rocío y su inseparable guitarrista, Fermín Aldaz. Al final cantó, a media voz y sin micrófono, el estribillo de «Río arriba». No quedó un pañuelo seco en la sala.'
        ] },
      { tit: 'Darío Quintanar, sorprendido con una misteriosa acompañante en el mercado de Albamar', sum: 'El actor de moda pasea su nueva ilusión entre puestos de fruta y sin esconderse',
        txt: [
          'Con gorra, gafas oscuras y una bolsa de tela llena de tomates, pero inconfundible. El actor Darío Quintanar, protagonista de la serie del momento, fue visto el sábado por la mañana en el mercado de Albamar junto a una joven morena con la que compartió confidencias, risas y un cucurucho de churros. No se soltaron de la mano en todo el paseo.',
          'Según ha podido saber esta revista, ella se llama Ariadna, es veterinaria y no tiene nada que ver con el mundo del espectáculo. Se conocieron hace unos meses, cuando el actor llevó a su perro a la consulta. Quintanar, de 34 años, puso fin la pasada primavera a su relación de cinco años con la modelo Jana Olabeaga.',
          'Preguntado por los periodistas a la salida, el intérprete se limitó a sonreír: «Estoy comprando fruta. Y estoy muy bien, gracias». Su perro, por cierto, también.'
        ] },
      { tit: 'Jana Olabeaga estrena piso, flequillo y sonrisa en Castroval', sum: 'La modelo nos enseña su ático con vistas a la catedral y habla, por fin, de su nueva etapa',
        txt: [
          'Paredes blancas, mucha planta y un sofá en el que caben seis amigas. Jana Olabeaga ha encontrado su sitio en un ático del casco viejo de Castroval, con una terraza desde la que se tocan casi las torres de la catedral. La modelo, de 30 años, nos abre la puerta descalza y con un flequillo recién cortado que le sienta de maravilla.',
          '«Este ha sido el año de aprender a estar sola y descubrir que no se está tan mal», confiesa. De su ruptura con el actor Darío Quintanar solo tiene buenas palabras: «Nos quisimos mucho y nos deseamos lo mejor. Eso también es un final feliz». Acaba de firmar como imagen de una casa de perfumes y prepara una línea de ropa de punto.',
          'Jana cocina regular, lee novela negra y ha adoptado una gata tuerta a la que ha llamado Pirata. ¿Enamorada? «De mi terraza», responde, y se ríe.'
        ] },
      { tit: 'Los duques de Fuentecalma reciben al cuerpo diplomático en su tradicional baile de otoño', sum: 'Tiaras, valses y un invitado inesperado en la cita más elegante de la temporada',
        txt: [
          'El gran salón del balneario de Fuentecalma volvió a encender sus doce lámparas de cristal para el baile de otoño, la cita con la que la casa ducal abre desde hace un siglo la temporada social. La duquesa viuda, doña Eugenia, recibió a los doscientos invitados al pie de la escalinata con la tiara de aguamarinas que solo sale de la caja fuerte una vez al año.',
          'No faltaron los embajadores de Vesperia, Orvalia y Nordhaven, ni la marquesa de Peñalcor, de azul noche, ni el modisto Rómulo Estévez, que había vestido a media sala. La sorpresa la dio el anfitrión, el duque Tristán, al abrir el baile del brazo de la presentadora Mencía Roldán, deslumbrante con un vestido color champán.',
          'Se cenó consomé, faisán y helado de higos. La recaudación de la tómbola, 48.000 florines, se destinará este año a la restauración de la cúpula del balneario. La orquesta tocó hasta las tres.'
        ] },
      { tit: 'El presentador Teo Ballester adelgaza veinte kilos: «He cambiado el sofá por la bicicleta»', sum: 'El rostro más querido de las mañanas cuenta cómo ha recuperado la salud y el buen humor',
        txt: [
          'Cuesta reconocerlo. Teo Ballester, el presentador que desde hace quince años da los buenos días a medio país, ha perdido veinte kilos en ocho meses y luce una figura que, según él mismo, no tenía «desde la primera comunión». Nos cita en el paseo fluvial de Castroval, adonde llega pedaleando y sin resuello.',
          '«Me asusté. El médico me enseñó los análisis y parecía la lista de la compra de una pastelería», recuerda. Desde entonces camina una hora al día, ha dicho adiós a los refrescos y cocina con su mujer, la periodista Aroa Lizaso, que lo ha acompañado en el esfuerzo. Sus dos hijas le ponen nota cada domingo.',
          'A sus 52 años asegura que se encuentra mejor que nunca y que no piensa volver atrás. Eso sí: se ha reservado un capricho. «El día de mi cumpleaños, tarta. Entera».'
        ] },
      { tit: 'Irati Mendiluce: «Mi marido me oye ensayar desde la cocina y nunca protesta»', sum: 'La nueva directora de la Sinfónica nos presenta a su familia en su casa de Fuentecalma',
        txt: [
          'En el piano del salón hay partituras, un dinosaurio de plástico y medio bocadillo. Irati Mendiluce, flamante directora de la Orquesta Sinfónica de Lirenia, nos recibe en la casa familiar de Fuentecalma en plena merienda de sus hijos, Unai y Maddi, de siete y cuatro años. Su marido, el lutier Anselmo Etura, asoma desde el taller con las manos llenas de barniz.',
          '«Él construye violines y yo los hago sufrir. Es un matrimonio muy equilibrado», dice entre risas. Se conocieron hace doce años, cuando ella llevó a reparar su viola. Desde entonces la han acompañado por teatros de medio continente. Ahora, por fin, la maleta descansa en el altillo.',
          'La directora confiesa que no sabe cocinar, que duerme poco antes de un estreno y que su mejor crítico es su hijo mayor: «Si se duerme, es que el segundo movimiento iba lento».'
        ] },
      { tit: 'La chef Rosalinda Mauleón se casa en secreto con su jefe de sala', sum: 'Una ceremonia íntima en el juzgado de Miravalle y una comida para veinte en su propio restaurante',
        txt: [
          'Nadie lo sabía, ni siquiera los cocineros. Rosalinda Mauleón, una de las cocineras más reconocidas del país, se casó el lunes, día de descanso de su restaurante, con Evaristo Sagredo, su jefe de sala desde hace once años. La ceremonia, en el juzgado de Miravalle, duró quince minutos y tuvo dos testigos: la madre de ella y el pescadero de siempre.',
          'Después, los recién casados invitaron a comer a veinte personas en el comedor vacío del restaurante. Cocinó la novia, faltaría más: sopa de ajo, cordero al horno y arroz con leche. «Llevamos once años discutiendo por las comandas. Ya era hora de firmar la paz», comentó ella, que cambió por un día la chaquetilla por un vestido de flores.',
          'No habrá luna de miel hasta enero, cuando el local cierra por vacaciones. El martes, a las ocho de la mañana, los dos estaban ya en el mercado.'
        ] },
      { tit: 'Gael Zubiaurre regresa de dar la vuelta al mundo y busca a alguien en el muelle', sum: 'El navegante solitario completa su travesía en 94 días y se funde en un abrazo con la marquesa de Peñalcor',
        txt: [
          'Tras 94 días de mar, 46.000 kilómetros y un mástil remendado, el navegante Gael Zubiaurre entró el viernes en el puerto de Portalba entre sirenas y bengalas. Cinco mil personas lo esperaban en el muelle de Levante. Él, con barba de náufrago y diez kilos menos, saludó a todos, pero buscaba a una sola persona.',
          'La encontró junto a la escalerilla: Casilda de Urrestarazu, marquesa de Peñalcor, con un chaquetón marinero y una botella de su propio vino bajo el brazo. El abrazo duró lo que duran las cosas que no necesitan explicación. «La he echado más de menos que la fruta fresca, y mire que he echado de menos la fruta», dijo el regatista, de 46 años.',
          'La marquesa, siempre discreta, solo comentó que había venido «a recibir a un amigo». Los amigos, ya se sabe, no suelen cenar a solas a la luz de las velas en la mejor mesa de Marea Baja. Pero eso fue por la noche.'
        ] },
      { tit: 'Olvido Farrán, la escritora que no tiene televisor ni ganas de fiestas', sum: 'La ganadora del Premio Nacional de las Letras nos recibe en su casa de piedra con su gato y su huerto',
        txt: [
          'En casa de Olvido Farrán huele a leña y a membrillo. La escritora del año vive en una casa de piedra a las afueras de Peñalcor con su gato, Tintero, y con su compañero desde hace dos décadas, el ceramista Amadeo Rentería, que ha hecho cada uno de los platos de la cocina. No hay televisor. «No es una postura: se rompió en 2009 y no lo echamos de menos», explica.',
          'El premio la ha pillado, dice, recogiendo calabazas. Desde entonces el teléfono no para y ella ha optado por dejarlo en un cajón de la despensa. «Estoy muy agradecida, pero yo sirvo para escribir, no para ir a cenas. En las cenas me aburro y se me nota».',
          'Tiene un huerto, una bicicleta vieja y la costumbre de leer en voz alta cada capítulo a Amadeo antes de darlo por bueno. ¿En qué gastará el dinero? «En un tejado nuevo. La literatura es eso: tejados».'
        ] },
      { tit: 'La cantante Nerea Altuna y el piloto Izan Garmendia ponen fin a tres años de amor', sum: 'Un comunicado conjunto, mucho cariño y una petición de respeto: así se despide una de las parejas más queridas',
        txt: [
          'Lo han anunciado juntos y con las mismas palabras: «Seguimos queriéndonos, pero ya no en la misma dirección». La cantante Nerea Altuna y el piloto de rallies Izan Garmendia han puesto fin a su relación después de tres años en los que formaron una de las parejas más simpáticas del panorama lireno. No hay terceras personas, aseguran en su entorno, sino agendas imposibles.',
          'Ella, de 28 años, prepara su tercer disco y una gira por Vesperia; él, de 32, pasa nueve meses al año de circuito en circuito. Compartían una casa en Albamar y dos perros, cuya custodia, han bromeado, «será lo único que tengamos que negociar».',
          'Los dos han pedido respeto y han agradecido las muestras de cariño. Un detalle que dice mucho: el pasado domingo, Nerea estaba en la meta del rally de Brezales para aplaudir la victoria de su ya expareja.'
        ] },
      { tit: 'Doña Eugenia de Fuentecalma cumple 80 años: «No pienso jubilarme de nada»', sum: 'La duquesa viuda celebra su aniversario con una merienda para todo el pueblo en los jardines del balneario',
        txt: [
          'Ochocientas raciones de chocolate, una banda de música y una duquesa bailando un pasodoble con el alcalde. Doña Eugenia de Albornoz, duquesa viuda de Fuentecalma, celebró el domingo su ochenta cumpleaños como a ella le gusta: invitando a merendar a todo el pueblo en los jardines del balneario. «Para qué quiero un jardín tan grande si no», dijo.',
          'Menuda, enérgica y con un sentido del humor temible, sigue presidiendo la junta del asilo, juega al mus los miércoles y conduce su propio coche, para inquietud de sus hijos. Recibió como regalo un bastón con empuñadura de plata que, advirtió, piensa usar «solo para señalar».',
          'Su hijo Tristán, el actual duque, la acompañó toda la tarde junto a la presentadora Mencía Roldán, a quien la homenajeada trató con evidente cariño. Cuando alguien le preguntó si habría pronto boda en la familia, contestó: «Eso pregúnteselo a quien tenga que pedirlo, que ya tarda».'
        ] },
      { tit: 'Nace Martina, la primera hija del nadador Unax Berasaluce y la periodista Sofía Arteche', sum: 'La pequeña ha pesado tres kilos doscientos y ha llegado dos semanas antes de lo previsto',
        txt: [
          'Tenía prisa por llegar, como su padre en la piscina. Martina, la primera hija del nadador olímpico Unax Berasaluce y de la periodista deportiva Sofía Arteche, nació el miércoles de madrugada en el Hospital del Mar de Portalba, dos semanas antes de lo previsto. Pesó tres kilos doscientos y, según el orgulloso papá, «ya mueve los pies como para los cien metros libres».',
          'Madre e hija se encuentran perfectamente y recibieron el alta el viernes. A la salida, la pareja posó unos segundos ante los fotógrafos con la niña envuelta en una mantita tejida por la bisabuela. Sofía, de 33 años, agradeció el trato del personal sanitario; Unax, de 30, apenas acertaba a hablar.',
          'La pareja se conoció hace cinco años durante una entrevista que, cuentan, duró el triple de lo acordado. El campeón ha pedido permiso a su club para no competir hasta enero. Por una vez, no le importa perder unas semanas.'
        ] },
      { tit: 'El pintor Tadeo Ibarzábal reaparece a los 88 años en la boda de su nieta', sum: 'El artista, retirado de la vida pública desde hace una década, bailó y firmó dibujos en las servilletas',
        txt: [
          'Hacía diez años que no se dejaba ver en público, y eligió para volver la mejor de las ocasiones. El pintor Tadeo Ibarzábal, de 88 años, acompañó el sábado al altar a su nieta Aroa en la iglesia marinera de las islas Cendra, donde tiene su estudio desde los años setenta. Llegó en barca, con sombrero de paja y una flor en el ojal.',
          'El maestro, cuya obra cuelga en los principales museos del país, estuvo de un humor excelente. Durante el banquete dibujó gaviotas en las servilletas de los invitados más pequeños, que no sospechaban el valor de lo que se llevaban a casa, y se animó incluso con un baile lento. «Las piernas ya no obedecen, pero la muñeca sí», comentó.',
          'La novia, bióloga marina, se casó con un compañero de expedición. De regalo, el abuelo les entregó un cuadro pintado para la ocasión: el mar, visto desde la ventana de su estudio, a la hora en que ella nació.'
        ] },
      { tit: 'Mencía Roldán nos enseña su armario: «Guardo el vestido de mi primera entrevista»', sum: 'La presentadora más elegante de la televisión comparte sus secretos de estilo y alguno del corazón',
        txt: [
          'Trescientos pares de zapatos no, pero casi. Mencía Roldán nos abre las puertas del vestidor de su casa de Castroval, una habitación luminosa donde todo está ordenado por colores y donde manda, en un lugar de honor, un vestido azul marino de hace dieciséis años. «Es el de mi primera entrevista. Me costó medio sueldo y me temblaban las rodillas», recuerda.',
          'La presentadora confiesa su debilidad por las chaquetas de hombre, las alpargatas y los pañuelos de su madre, y asegura que nunca estrena nada en directo. Su truco de belleza: dormir ocho horas y reírse mucho. De lo segundo, dice, se encarga últimamente cierto duque aficionado a la vela.',
          '«Estoy en un momento muy bonito y quiero cuidarlo», añade, mientras acaricia a su teckel, Regaliz. ¿Vestido de novia a la vista? «En este armario ya no cabe nada más. Habría que hacer obra».'
        ] }
    ],

    deportes: [
      { tit: 'El Atlético Portalba tumba al Deportivo Castroval y se escapa en el liderato', sum: 'Dos goles en el último cuarto de hora dan a los rojiblancos un triunfo que los deja cinco puntos por delante al cierre de la primera vuelta',
        marcador: { local: 'Atlético Portalba', visit: 'Deportivo Castroval', gl: 2, gv: 1 },
        txt: [
          'Cuarenta y cinco mil gargantas en la Ribera y un partido que tardó en romperse. El Deportivo Castroval salió a esperar, con las líneas juntas y la pelota lejos de su área, y durante una hora le funcionó. Al filo del descanso, además, se adelantó en la única llegada clara: un centro tenso de Iker Montoya que Baltasar Ruidíaz cabeceó al palo largo sin oposición.',
          'Zacarías Lertxundi movió el banquillo a la vuelta de los vestuarios. Entró el joven Ander Zuloaga por la banda izquierda y el partido cambió de lado. En el minuto 76, una pared con Ismael Carrión acabó con el balón en la red tras rozar en un defensa; seis minutos después, el propio Zuloaga recogió un rechace en la frontal y la clavó junto a la escuadra. La grada se vino abajo.',
          'El Castroval apretó en el tramo final y pidió penalti en un agarrón a Ruidíaz que el colegiado no quiso ver. No hubo más. Con este triunfo, los rojiblancos cierran la primera vuelta con cinco puntos de ventaja y diez jornadas sin perder. «Hoy hemos ganado sin jugar bien, y eso también es saber jugar», resumió Lertxundi en la sala de prensa.'
        ] },
      { tit: 'El Real Albamar firma la remontada del año ante el Unión Sotoluengo', sum: 'Los costeros, que perdían 0-2 al descanso, le dan la vuelta al marcador en un segundo tiempo de vértigo',
        marcador: { local: 'Real Albamar', visit: 'Unión Sotoluengo', gl: 3, gv: 2 },
        txt: [
          'Al descanso, el estadio del Paseo Marítimo silbaba y el Unión Sotoluengo, el equipo del barrio obrero, se frotaba las manos. Dos goles de Fidel Arrontegui, el segundo en una contra de libro, castigaban a un Real Albamar sin ideas y con el centro del campo partido. Nadie en la grada imaginaba lo que estaba por venir en la segunda mitad.',
          'El técnico Valentín Escobedo retiró a dos centrocampistas y metió a dos delanteros. La apuesta salió bien. Gaizka Ruiloba recortó distancias de cabeza en el 54, empató de penalti en el 71 y, cuando el reloj marcaba el minuto 89, el lateral Pascual Treviño firmó el 3-2 con un disparo seco desde fuera del área que se coló por la escuadra.',
          'La remontada devuelve al Albamar a la zona alta y deja muy tocado al Sotoluengo, que suma tres derrotas seguidas. «En el vestuario no ha habido gritos. Solo hemos dicho que esto no podía terminar así», contó Ruiloba, autor de dos goles. El equipo costero viaja el próximo domingo a Miravalle con la moral por las nubes.'
        ] },
      { tit: 'Empate sin goles y sin alma entre el Racing Miravalle y el Deportivo Brezales', sum: 'La lluvia y el barro convierten el partido en una batalla de centrocampistas que no sirve a ninguno de los dos',
        marcador: { local: 'Racing Miravalle', visit: 'Deportivo Brezales', gl: 0, gv: 0 },
        txt: [
          'Llovió desde una hora antes del pitido inicial y no paró hasta que el último aficionado abandonó el campo de la Vega. El césped, castigado por tres semanas de agua, se convirtió en un barrizal donde el balón se frenaba en cada charco y los jugadores resbalaban en cada giro. El Racing Miravalle y el Deportivo Brezales hicieron lo que pudieron, que fue poco.',
          'La mejor ocasión llegó en el minuto 38, cuando el delantero universitario Ramiro Echave se plantó solo ante el portero y su disparo murió en el barro a un metro de la línea. En la segunda parte, el Brezales tuvo la suya en un cabezazo de Álvaro Goicoa que se marchó rozando el larguero. Fue todo lo que dio de sí la tarde.',
          'El punto no satisface a nadie. El Racing sigue sin ganar en casa desde septiembre y el Brezales, recién ascendido, no se aleja del descenso. «Hoy no se podía jugar al fútbol, se podía jugar a otra cosa», se quejó el técnico local, Eusebio Larrazábal, que pidió a la federación revisar el estado de los campos en invierno.'
        ] },
      { tit: 'El Castroval Baloncesto resiste en la prórroga y asalta la cancha del Portalba Marítimo', sum: 'Un triple de Darío Olmedilla a falta de cuatro segundos fuerza el tiempo extra y el equipo de la capital se impone por 91-88',
        marcador: { local: 'Portalba Marítimo', visit: 'Castroval Baloncesto', gl: 88, gv: 91 },
        txt: [
          'El pabellón de los Astilleros vivió un partido de los que se recuerdan durante años. El Portalba Marítimo mandó durante tres cuartos gracias a la puntería del escolta Nahuel Ibarreche, que acabó con 27 puntos, y llegó a ganar de catorce mediado el tercer periodo. Pero el Castroval Baloncesto no se rindió nunca y fue recortando la distancia posesión a posesión.',
          'A falta de cuatro segundos, con 79-76 en el marcador, el base Darío Olmedilla recibió en la esquina, se levantó sobre su defensor y anotó un triple que enmudeció la grada. En la prórroga, los visitantes ganaron todos los rebotes defensivos y cerraron el partido desde la línea de tiros libres, donde el pívot Sergio Amuriza no falló ninguno de sus seis lanzamientos.',
          'Con esta victoria, el Castroval Baloncesto se coloca líder en solitario de la Liga Lirena con nueve triunfos en diez jornadas. «Este equipo no sabe cuándo está muerto, y eso es lo mejor que se puede decir de un grupo», resumió su entrenador, Fausto Lekuona. El Marítimo, que pierde su primer partido en casa, buscará la revancha en la Copa.'
        ] },
      { tit: 'El Albamar Basket arrolla al Fuentecalma en un partido sin historia', sum: 'Los costeros dominan el rebote y el ritmo desde el primer minuto y ganan por treinta puntos de diferencia',
        marcador: { local: 'Albamar Basket', visit: 'Club Baloncesto Fuentecalma', gl: 102, gv: 72 },
        txt: [
          'No hubo partido. El Albamar Basket salió a la pista con una intensidad que el Fuentecalma no supo igualar en ningún momento y cerró el primer cuarto con un parcial de 31-14 que ya presagiaba la goleada. El pívot Mamadou Seck, fichado este verano, dominó la zona a su antojo y terminó con 22 puntos y 14 rebotes en apenas veinticinco minutos.',
          'El equipo del balneario, con dos bajas importantes por lesión, intentó frenar la sangría con una defensa en zona que solo sirvió para que los tiradores locales se pusieran las botas. El Albamar anotó catorce triples, récord de la temporada, y llegó al descanso con una ventaja de veinticuatro puntos que ya nadie le iba a discutir en la segunda mitad.',
          'El último cuarto sirvió para que el técnico Ricardo Basterra diera minutos a los juveniles, ante la ovación de un pabellón que llenó sus 6.000 asientos. «No es el rival que más me preocupa, pero sí el partido que más me ha gustado», reconoció Basterra. El Fuentecalma, penúltimo, necesita reaccionar antes de que el descenso se convierta en realidad.'
        ] },
      { tit: 'El Balonmano Sotoluengo conquista la Copa en un final de infarto ante el Peñalcor', sum: 'El portero Imanol Aranburu detiene el último lanzamiento con el tiempo cumplido y da al club obrero su primer título en veinte años',
        marcador: { local: 'Balonmano Sotoluengo', visit: 'Club Balonmano Peñalcor', gl: 29, gv: 28 },
        txt: [
          'El pabellón de la Acería, con las gradas teñidas de azul, esperaba este título desde hacía veinte años. El Balonmano Sotoluengo y el Peñalcor protagonizaron una final de ida y vuelta, con continuos cambios en el marcador y ninguna ventaja superior a dos goles. El extremo Joseba Larrea, con nueve tantos, sostuvo a los locales en los peores momentos de la segunda parte.',
          'A falta de cuarenta segundos, el lateral Hernán Cortázar puso el 29-28 con un lanzamiento potentísimo desde nueve metros. El Peñalcor dispuso de la última posesión y su pivote se quedó solo en el área, pero el portero Imanol Aranburu adivinó la intención y detuvo el balón con la pierna cuando el reloj ya marcaba el final. La pista se llenó de aficionados en segundos.',
          'Es el primer trofeo del club desde la Liga de hace dos décadas, cuando la siderúrgica todavía pagaba las nóminas de media plantilla. «Esto es para los de la fábrica, que llevan toda la vida viniendo aquí después del turno», dijo Aranburu, llorando, con la Copa en las manos. Las celebraciones se prolongaron hasta la madrugada en la plaza del Mercado.'
        ] },
      { tit: 'El Portalba Marítimo de balonmano golea al Torremaura y se acerca a la cabeza', sum: 'Los portuarios dominan desde el principio y ganan por ocho goles gracias a una defensa impenetrable',
        marcador: { local: 'Portalba Marítimo', visit: 'Balonmano Torremaura', gl: 34, gv: 26 },
        txt: [
          'El Portalba Marítimo resolvió por la vía rápida un partido que se presumía incómodo. El Torremaura llegaba con la vitola de equipo revelación, pero se estrelló una y otra vez contra una defensa 6-0 que le obligó a lanzar desde lejos y con prisas. Al descanso, el marcador ya reflejaba un contundente 18-11 que dejaba poco margen para la remontada.',
          'El central Abel Zabaleta dirigió el ataque con precisión de relojero y repartió once asistencias, mientras el extremo derecho Teo Mendiola convertía todo lo que le llegaba hasta sumar diez goles. El Torremaura, que echó en falta a su máximo goleador, lesionado en el tobillo, intentó acelerar el juego en la segunda mitad sin conseguir acercarse a menos de seis tantos.',
          'Los portuarios se sitúan a solo un punto del líder, el Sotoluengo, al que visitarán en tres semanas en un duelo que ya se anuncia decisivo. «Si defendemos así, podemos ganar a cualquiera en cualquier pista», advirtió el entrenador, Ernesto Villabona. El Torremaura recibe el sábado al colista con la obligación de volver a sumar.'
        ] },
      { tit: 'Leire Altuna gana en solitario la etapa reina de la Vuelta a Lirenia en el puerto de Brezales', sum: 'La ciclista de Valdearcos ataca a seis kilómetros de la cima y se viste de amarilla con un minuto de ventaja',
        marcador: { local: 'Leire Altuna', visit: 'Pelotón', gl: 1, gv: 0 },
        txt: [
          'La etapa reina de la Vuelta a Lirenia tenía un nombre escrito en la cuneta desde por la mañana: el de Leire Altuna, la ciclista del Alto Aldera que lleva años soñando con ganar en la sierra que la vio crecer. A seis kilómetros de la cima del puerto de Brezales, con las rampas más duras por delante, lanzó un ataque seco al que ninguna de sus rivales pudo responder.',
          'Subió sola entre una multitud que coreaba su nombre, con el gesto torcido y el maillot abierto, y cruzó la meta con 1 minuto y 4 segundos de ventaja sobre la orvaliana Ingrid Halvesen. La hasta ahora líder, la tarsiana Mira Kostadin, perdió casi tres minutos y se despidió de sus opciones. Altuna se viste de amarilla a falta de dos etapas.',
          '«He subido este puerto mil veces entrenando, pero nunca con tanta gente gritando. No me oía ni la respiración», confesó en la línea de meta, envuelta en una bandera de Valdearcos. Mañana, la carrera baja hacia Fuentecalma en una etapa llana, y el domingo concluye con una contrarreloj de veinte kilómetros por las calles de Castroval.'
        ] },
      { tit: 'Íñigo Basauri se impone al esprint en Albamar y la Vuelta llega intacta a la contrarreloj', sum: 'El velocista del Equipo Aldera remata el trabajo de sus compañeros en el paseo marítimo; Altuna conserva el liderato',
        marcador: { local: 'Íñigo Basauri', visit: 'Pelotón', gl: 1, gv: 0 },
        txt: [
          'La etapa más llana de la ronda masculina terminó como estaba previsto: con un esprint masivo en el paseo marítimo de Albamar. El Equipo Aldera controló la fuga del día, formada por cinco corredores que llegaron a tener cuatro minutos de ventaja, y la neutralizó a solo ocho kilómetros de la meta, cuando el viento de costa empezaba a soplar de cara.',
          'Los gregarios del conjunto lireno lanzaron a su velocista, Íñigo Basauri, a trescientos metros del final, y el corredor de Portalba no dio opción a nadie. Levantó los brazos con media bicicleta de ventaja sobre el nordhavense Erik Sandvold. Es su tercera victoria en esta edición, lo que lo convierte en el gran dominador de las llegadas rápidas.',
          'En la general no hubo cambios: los favoritos llegaron juntos y protegidos por sus equipos, sin arriesgar en las rotondas de la entrada a la ciudad. «Hoy tocaba esperar y no caerse», resumió el director deportivo del Equipo Aldera, Leandro Garaioa. Todo se decidirá el domingo en la contrarreloj final por las avenidas de Castroval.'
        ] },
      { tit: 'El Club Náutico Albamar gana el derbi de waterpolo en el último segundo', sum: 'Un lanzamiento de Marcos Elizalde con la bocina sentencia el duelo ante el Portalba Natación en una piscina llena hasta la bandera',
        marcador: { local: 'Club Náutico Albamar', visit: 'Portalba Natación', gl: 11, gv: 10 },
        txt: [
          'Dos mil aficionados apretados en la grada de la piscina de los Arcos y un partido que se decidió con la última bocina. El Club Náutico Albamar y el Portalba Natación, los dos grandes del waterpolo lireno, se enzarzaron en un duelo físico y tenso, con siete expulsiones temporales en el primer periodo y un marcador que nunca se separó más de un gol.',
          'Con empate a diez y quince segundos por jugar, el Náutico recuperó el balón tras un pase arriesgado del boya portuario. El capitán Marcos Elizalde nadó con la pelota delante, se elevó sobre el agua y la soltó con la muñeca cuando sonaba la bocina. El balón pegó en el palo y entró. Los jugadores locales se lanzaron al agua desde el banquillo.',
          'El triunfo deja al Náutico como líder invicto de la liga y confirma la hegemonía del club costero en los últimos años. «Lo he tirado sin mirar, sinceramente. A veces es mejor no pensar», confesó Elizalde, todavía con el gorro puesto. El Portalba, que mereció más, tendrá la revancha en la final de la Copa, prevista para marzo.'
        ] },
      { tit: 'Los Halcones de Castroval aplastan a los Mareantes de Portalba en el clásico del rugby', sum: 'Cuatro ensayos y un dominio absoluto de la melé dan a los capitalinos la victoria con punto bonus',
        marcador: { local: 'Halcones de Castroval', visit: 'Mareantes de Portalba', gl: 31, gv: 12 },
        txt: [
          'El campo universitario de la Vega acogió el clásico más antiguo del rugby lireno, y los Halcones de Castroval lo convirtieron en una exhibición. La delantera local, más pesada y mejor sincronizada, ganó todas las melés y desarboló a los Mareantes de Portalba desde el primer cuarto de hora, cuando el tercera línea Néstor Aguirrebeña posó el primer ensayo tras un maul de veinte metros.',
          'Antes del descanso llegaron dos ensayos más, uno de ellos tras una jugada de manos que recorrió el campo de punta a punta y que terminó el ala Ulises Santamaría. Los Mareantes solo encontraron respuesta en dos golpes de castigo de su apertura y en un ensayo de consolación en la segunda parte, cuando el partido ya estaba decidido.',
          'El cuarto ensayo, obra del medio de melé Gorka Etxabe en el minuto 72, aseguró el punto bonus ofensivo y desató la fiesta en una grada que, como manda la tradición, aplaudió también a los visitantes en el pasillo final. «En la melé se gana el partido y en el tercer tiempo se gana el respeto», dijo el capitán local entre cervezas.'
        ] },
      { tit: 'El Hockey Miravalle remonta tres goles y gana al Club Patín Albamar', sum: 'Los universitarios logran una victoria épica en el último cuarto con dos tantos de su capitana, Alba Recalde',
        marcador: { local: 'Hockey Miravalle', visit: 'Club Patín Albamar', gl: 5, gv: 4 },
        txt: [
          'El partido parecía resuelto a mitad del tercer cuarto. El Club Patín Albamar, vigente campeón de la liga femenina de hockey sobre patines, ganaba 1-4 con una superioridad insultante, y algunos aficionados del pabellón universitario empezaban a buscar la salida. Entonces apareció Alba Recalde, la capitana del Hockey Miravalle, y el partido dio un vuelco inesperado.',
          'Recalde marcó el 2-4 con un disparo desde la media distancia y, apenas dos minutos después, provocó la expulsión de una defensora rival con una arrancada por la banda. En superioridad, la delantera Noelia Ugarte puso el 3-4. Con todo el pabellón en pie, la capitana igualó en una jugada individual y la juvenil Irati Lasa firmó el 5-4 a falta de un minuto.',
          'La victoria rompe una racha de siete derrotas consecutivas del Miravalle ante el Albamar y relanza sus aspiraciones de jugar los cuartos de final de la competición europea. «Al descanso nos hemos mirado a los ojos y nadie ha bajado la cabeza», explicó Recalde. El Patín Albamar, sorprendido, pierde el liderato por primera vez en dos temporadas.'
        ] },
      { tit: 'El Atlético Portalba se deja dos puntos en el barro de Sotoluengo', sum: 'Un gol en propia meta en el descuento priva a los rojiblancos de una victoria que tenían en el bolsillo',
        marcador: { local: 'Unión Sotoluengo', visit: 'Atlético Portalba', gl: 1, gv: 1 },
        txt: [
          'Lo había advertido Zacarías Lertxundi durante toda la semana: el campo de la Acería, con lluvia, iguala a cualquiera. Y así fue. El Atlético Portalba se adelantó en el minuto 33 con un gol de Ismael Carrión, que aprovechó un error en la salida de balón del Unión Sotoluengo, y después se dedicó a defender la renta sin excesivos apuros ante un rival muy limitado.',
          'El Sotoluengo, empujado por su grada y por la necesidad, cargó el área en el tramo final con más corazón que fútbol. Los rojiblancos resistieron hasta el minuto 92, cuando un centro sin peligro desde la banda derecha rebotó en la rodilla del central Jonás Etxeberria y se coló junto al poste, ante la incredulidad de su propio guardameta.',
          'El empate no cambia el liderato, pero sí reduce la ventaja a tres puntos sobre el Deportivo Castroval, que ganó con solvencia en Brezales. «Es fútbol, y en el fútbol a veces el balón decide por ti», lamentó Lertxundi. En el vestuario local, en cambio, se celebró como una victoria un punto que vale oro en la lucha por la permanencia.'
        ] },
      { tit: 'El Deportivo Castroval golea en Brezales y no suelta la estela del líder', sum: 'Baltasar Ruidíaz firma un triplete en un partido sentenciado antes del descanso',
        marcador: { local: 'Deportivo Brezales', visit: 'Deportivo Castroval', gl: 0, gv: 4 },
        txt: [
          'El Deportivo Castroval viajó a la sierra con la lección aprendida y dejó el partido resuelto en media hora. El equipo de la capital presionó arriba desde el pitido inicial, robó tres balones en campo contrario en los primeros diez minutos y aprovechó el segundo de ellos para abrir el marcador por medio de su delantero centro, Baltasar Ruidíaz, que empujó a puerta vacía.',
          'El ariete, máximo goleador de la competición, completó su triplete antes del minuto 60: primero con un cabezazo en un saque de esquina y después con una vaselina deliciosa ante la salida desesperada del portero local. El cuarto gol, obra del centrocampista Iker Montoya desde fuera del área, puso la guinda a una tarde redonda para los capitalinos.',
          'El Brezales, que acusa la falta de profundidad de su plantilla, encadena cuatro jornadas sin ganar y cae a puestos de descenso. «Hemos venido a un campo difícil y lo hemos hecho parecer fácil. Ese es el mérito», valoró Ruidíaz, que suma ya diecisiete goles. El Castroval queda a tres puntos del Atlético Portalba con todo por decidir.'
        ] },
      { tit: 'El Castroval Baloncesto cae en casa ante un Miravalle inspirado desde el triple', sum: 'Los universitarios rompen la racha del líder con dieciséis triples y una actuación estelar del escolta Martín Igartua',
        marcador: { local: 'Castroval Baloncesto', visit: 'Universitario Miravalle', gl: 84, gv: 93 },
        txt: [
          'El líder de la Liga Lirena tropezó donde menos lo esperaba. El Universitario Miravalle, un equipo joven construido con jugadores de la cantera, salió al pabellón del Parque Central sin ningún complejo y castigó cada despiste defensivo del Castroval Baloncesto desde la línea de tres puntos. Al descanso, los visitantes ya habían anotado nueve triples.',
          'El escolta Martín Igartua, de solo veinte años, fue la gran estrella de la noche con 31 puntos y siete triples en once intentos. El Castroval, desconcertado, intentó cambiar el ritmo con una defensa presionante en todo el campo y llegó a ponerse a cuatro puntos en el último cuarto, pero dos triples consecutivos de Igartua devolvieron la calma a los universitarios.',
          'La derrota, la segunda de la temporada, no cuesta el liderato al Castroval, pero sí rompe una racha de siete victorias consecutivas. «Hoy nos han dado una clase de baloncesto. Toca tomar notas», reconoció con deportividad Fausto Lekuona. Los aficionados del Miravalle, desplazados en cuatro autobuses, despidieron a su equipo con cánticos.'
        ] },
      { tit: 'El Atlético Portalba femenino conquista la Supercopa ante el Real Albamar', sum: 'La delantera Carla Ezpeleta firma un doblete en la final disputada en el estadio de la Ribera',
        marcador: { local: 'Atlético Portalba', visit: 'Real Albamar', gl: 2, gv: 0 },
        txt: [
          'El primer título de la temporada ya tiene dueño. El equipo femenino del Atlético Portalba se impuso con autoridad al Real Albamar en la final de la Supercopa, disputada ante 18.000 espectadores en el estadio de la Ribera, una cifra récord para un partido de fútbol femenino en Lirenia. Las rojiblancas dominaron desde el primer minuto y apenas concedieron ocasiones.',
          'Carla Ezpeleta, la delantera de Peñalcor fichada este verano, abrió el marcador en el minuto 24 con un disparo cruzado tras una gran asistencia de la capitana Ainara Gorostiza. En la segunda mitad, la propia Ezpeleta cerró la final con un cabezazo imparable en un saque de esquina. El Albamar solo inquietó en un remate al larguero en el descuento.',
          'Es el tercer título del equipo en cuatro años y el primero con la entrenadora Begoña Unzueta en el banquillo. «Hace cinco años jugábamos en un campo de tierra con doscientas personas. Hoy hemos llenado la Ribera», recordó Gorostiza, emocionada, antes de levantar el trofeo. El club anunció que el equipo jugará la liga en el estadio principal.'
        ] },
      { tit: 'El Club Náutico Albamar se lleva la Regata de las Islas Cendra en un final ajustado', sum: 'El velero «Gaviota Tercera» cruza la línea de llegada con solo catorce segundos de ventaja sobre el «Viento de Calder»',
        marcador: { local: 'Gaviota Tercera', visit: 'Viento de Calder', gl: 1, gv: 0 },
        txt: [
          'La Regata de las Islas Cendra, la prueba de vela más prestigiosa del calendario lireno, vivió anoche un desenlace de película. Tras 140 millas náuticas de travesía entre Albamar y el faro de la isla Mayor, el «Gaviota Tercera» del Club Náutico Albamar cruzó la línea de llegada con solo catorce segundos de ventaja sobre el «Viento de Calder», que había liderado la prueba durante casi toda la noche.',
          'La clave estuvo en la última bordada. Con el viento rolando hacia el norte, el patrón Lucas Arrizabalaga apostó por pegarse a la costa de la isla, donde la corriente era más favorable, mientras su rival mantenía el rumbo por fuera. La maniobra, arriesgada por la cercanía de los bajos, permitió al «Gaviota Tercera» recortar dos minutos en la última milla.',
          'Es la segunda victoria consecutiva del velero costero, que se queda en propiedad el trofeo de plata tras sumar tres triunfos en cinco ediciones. «A veces el mar te premia por conocerlo y a veces te castiga por creer que lo conoces. Hoy ha tocado lo primero», resumió Arrizabalaga en el muelle, mientras su tripulación se bañaba en la dársena.'
        ] },
      { tit: 'El Racing Miravalle sorprende al Real Albamar y respira en la tabla', sum: 'Un gol de penalti de Ramiro Echave en el minuto 81 da a los universitarios su primera victoria en casa',
        marcador: { local: 'Racing Miravalle', visit: 'Real Albamar', gl: 1, gv: 0 },
        txt: [
          'Hacía dos meses que el campo de la Vega no celebraba una victoria, y la que llegó ayer tuvo el sabor de las que se sufren hasta el último segundo. El Racing Miravalle se encerró atrás ante un Real Albamar que llegaba lanzado tras su remontada ante el Sotoluengo, y aguantó durante una hora el empuje de los costeros con un orden defensivo impecable.',
          'En el minuto 81, el delantero Ramiro Echave fue derribado dentro del área en una de las escasas contras locales. El propio Echave, que había fallado dos ocasiones claras en las semanas anteriores, cogió el balón con determinación y lo colocó por la escuadra, lejos del alcance del portero. El Albamar se volcó en los minutos finales sin éxito.',
          'El triunfo saca al Racing de los puestos de descenso y da oxígeno a su entrenador, Eusebio Larrazábal, cuyo puesto estaba en el aire. «Hoy he dormido mal y mañana dormiré mejor. Así es este oficio», bromeó el técnico. El Albamar, que perdió a su goleador Gaizka Ruiloba por lesión en la primera parte, se aleja de los puestos europeos.'
        ] },
      { tit: 'Unax Berasaluce bate el récord nacional de los cien libres en la piscina de Portalba', sum: 'El nadador baja de los 48 segundos en su regreso a la competición tras el nacimiento de su hija',
        marcador: { local: 'Unax Berasaluce', visit: 'Récord nacional', gl: 1, gv: 0 },
        txt: [
          'Unax Berasaluce volvió a la piscina por la puerta grande. En su primera competición tras el parón por el nacimiento de su hija Martina, el nadador portalbés pulverizó el récord nacional de los cien metros libres con un tiempo de 47,86 segundos, rebajando en dos décimas la marca que él mismo había establecido hace dos temporadas en el campeonato regional.',
          'Berasaluce salió muy rápido, pasó el primer largo en 22,9 segundos y mantuvo la velocidad en la segunda mitad con un viraje impecable. Al tocar la pared y mirar el marcador, se quedó unos segundos inmóvil antes de golpear el agua con el puño. En la grada, la periodista Sofía Arteche lo aplaudía con la pequeña en brazos y protegida con unos cascos.',
          'El tiempo le sitúa entre los diez mejores nadadores de la temporada y le abre las puertas de la gran final del campeonato continental de verano. «He dormido muy poco estos meses, así que no sé de dónde ha salido esto. Igual los pañales entrenan más que el gimnasio», bromeó el nadador ante los periodistas al salir del agua.'
        ] }
    ],

    mercados: [
      { n: 'Índice General de Castroval', v: '8.412,6', d: '+0,8 %' },
      { n: 'Índice Selectivo Lireno 30', v: '12.087,3', d: '+0,5 %' },
      { n: 'Bolsa de Portalba (Índice Portuario)', v: '3.264,1', d: '-0,3 %' },
      { n: 'Bono lireno a 10 años', v: '3,12 %', d: '-0,04 %' },
      { n: 'Bono lireno a 2 años', v: '2,87 %', d: '+0,02 %' },
      { n: 'Florín / corona de Nordhaven', v: '7,4521', d: '+0,3 %' },
      { n: 'Florín / marco de Vesperia', v: '1,1834', d: '-0,2 %' },
      { n: 'Florín / ducado de Orvalia', v: '0,9467', d: '+0,1 %' },
      { n: 'Petróleo Calder (barril)', v: '78,40', d: '-1,2 %' },
      { n: 'Oro (onza, en florines)', v: '2.218,5', d: '+0,6 %' },
      { n: 'Aceros Sotoluengo', v: '24,36', d: '+6,3 %' },
      { n: 'Banco del Aldera', v: '11,82', d: '-0,9 %' },
      { n: 'Naviera Tramontana', v: '38,15', d: '+1,7 %' },
      { n: 'Lumen Sistemas', v: '62,04', d: '+2,4 %' },
      { n: 'Telelira', v: '15,28', d: '-0,6 %' },
      { n: 'Energías Cendra', v: '19,73', d: '+0,4 %' },
      { n: 'Ferrolira (bonos de infraestructura)', v: '101,35', d: '-0,1 %' },
      { n: 'Trigo del Aldera (tonelada)', v: '231,00', d: '-1,8 %' }
    ],

    agenda: [
      { d: 'Lunes 16', t: 'Pleno extraordinario sobre el plan de los muelles', l: 'Ayuntamiento de Portalba' },
      { d: 'Lunes 16', t: 'Concierto de la Orquesta Sinfónica de Lirenia: Brahms y Mahler', l: 'Teatro Principal, Castroval' },
      { d: 'Martes 17', t: 'Conferencia «El cometa de Brezales: qué esperar en primavera»', l: 'Observatorio de Brezales' },
      { d: 'Martes 17', t: 'Mercado de productores del Alto Aldera', l: 'Plaza Mayor, Valdearcos' },
      { d: 'Miércoles 18', t: 'Presentación de «La sal en las manos» con Olvido Farrán', l: 'Librería del Puerto, Albamar' },
      { d: 'Miércoles 18', t: 'Comparecencia del consejero de Hacienda sobre los presupuestos', l: 'Asamblea General, Castroval' },
      { d: 'Jueves 19', t: 'Reunión de alcaldes con los técnicos del tren de alta velocidad', l: 'Casa de Cultura, Sotoluengo' },
      { d: 'Jueves 19', t: 'Inauguración de la exposición del retablo del Maestro de Peñalcor', l: 'Museo de Bellas Artes, Castroval' },
      { d: 'Viernes 20', t: 'Jornada de puertas abiertas en la escuela rural', l: 'Escuela Pública, Valdearcos' },
      { d: 'Viernes 20', t: 'Ciclo de cine al aire libre: «Los días largos»', l: 'Cine Marítimo, Albamar' },
      { d: 'Sábado 21', t: 'Feria del libro antiguo y de ocasión', l: 'Claustro de la Universidad, Miravalle' },
      { d: 'Sábado 21', t: 'Atlético Portalba - Racing Miravalle, jornada 18', l: 'Estadio de la Ribera, Portalba' },
      { d: 'Sábado 21', t: 'Ruta guiada por la escala de los salmones', l: 'Puente Sarrio, río Aldera' },
      { d: 'Domingo 22', t: 'Contrarreloj final de la Vuelta a Lirenia', l: 'Avenida del Parque Central, Castroval' },
      { d: 'Domingo 22', t: 'Fiesta de la vendimia y concurso de pasodobles', l: 'Jardines del Balneario, Fuentecalma' },
      { d: 'Lunes 23', t: 'Visita de la delegación de alcaldes nordhavenses a la cuenca', l: 'Antiguo lavadero de carbón, Torremaura' },
      { d: 'Martes 24', t: 'Taller de oficios tradicionales para escolares', l: 'Centro Cívico de la Ribera, Portalba' },
      { d: 'Miércoles 25', t: 'Recital de poesía en las islas', l: 'Faro de la isla Mayor, islas Cendra' }
    ]
  };
})();
