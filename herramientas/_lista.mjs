// Cabeceras y marcas reales. Los estilos se inspiran en tradiciones de prensa;
// no llevan el nombre de ninguna publicacion que exista.

/** Nombres inconfundibles: no pueden aparecer en ningun texto. */
// Ojo: dentro de la cadena la barra va doblada (\\p{L}); con una sola, JavaScript
// la descarta y el filtro deja de mirar los bordes de palabra.
export const BANNED = new RegExp('(^|[^\\p{L}])(' + [
  'la vanguardia', 'abc', 'diario as', 'mundo deportivo', 'la voz de galicia', 'heraldo de arag[oó]n',
  'new york times', 'washington post', 'wall street journal', 'usa today', 'los angeles times', 'chicago tribune', 'boston globe', 'new york post', 'newsweek', 'new yorker', 'us weekly', 'national enquirer', 'village voice',
  'the guardian', 'the times', 'the sun', 'daily telegraph', 'daily mirror', 'daily mail', 'daily express', 'daily star', 'financial times', 'evening standard', 'the economist', 'the scotsman', 'daily record', 'press and journal', 'irish times', 'irish independent',
  'le monde', 'le figaro', 'lib[eé]ration', 'paris match', 'der spiegel', 'spiegel', 'die zeit', 'frankfurter allgemeine', 's[uü]ddeutsche', 'die welt', 'corriere della sera', 'la repubblica', 'la stampa', 'gazzetta dello sport', 'de telegraaf', 'de volkskrant', 'aftonbladet', 'dagens nyheter', 'politiken', 'neue z[uü]rcher', 'pravda', 'izvestia',
  'sydney morning herald', 'herald sun', 'courier.mail', 'new zealand herald', 'el mercurio', 'folha de', 'o globo', 'times of india', 'asahi', 'yomiuri', 'straits times', 'south china morning post', 'al ahram',
  'vanity fair', 'cosmopolitan', 'rolling stone', 'national geographic', 'forbes', 'bloomberg', 'buzzfeed', 'huffpost', 'nikkei'
].join('|') + ')(?![\\p{L}])', 'iu');

/** Cabeceras reales con nombre de palabra corriente: solo se prohiben como nombre de cabecera. */
export const MASTS = new Set([
  'el pais', 'clarin', 'el mundo', 'el periodico', 'la razon', 'marca', 'as', 'expansion', 'cinco dias', '20 minutos', 'el correo', 'publico', 'hola', 'lecturas', 'semana', 'diez minutos', 'pronto', 'metro', 'sport', 'el diario', 'la nueva espana', 'levante', 'sur', 'ideal', 'la verdad', 'el norte de castilla', 'diario de noticias', 'expresso', 'record', 'a bola',
  'the age', 'the australian', 'the herald', 'the national', 'the independent', 'the observer', 'the telegraph', 'guardian', 'telegraph', 'the mirror', 'the express', 'the mail', 'the star', 'the post', 'hello', 'ok', 'time', 'people', 'vogue', 'elle', 'life', 'variety', 'politico', 'vice', 'wired', 'the atlantic', 'the nation', 'the globe and mail', 'toronto star', 'national post',
  'bild', 'stern', 'focus', 'le parisien', 'le point', 'l\'equipe', 'l\'express', 'il giornale', 'il sole 24 ore', 'panorama', 'trouw', 'nrc', 'expressen', 'la nacion', 'el universal', 'reforma', 'excelsior', 'la jornada', 'el tiempo', 'el espectador', 'el comercio', 'la tercera', 'ole', 'el heraldo', 'el nacional', 'la prensa', 'granma', 'the hindu', 'dawn', 'china daily', 'the star', 'sowetan', 'the citizen'
]);

export function mastKey(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¡!¿?.]/g, '').trim();
}
