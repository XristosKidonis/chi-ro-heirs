// Los 66 libros del canon protestante, sus nombres y el parser de referencias.

// [nombre, abreviatura, alias extra, nombre en inglés, código BLB, slug de BibleHub]
const DATOS = [
  ['Génesis', 'Gn', 'gen ge genesis', 'Genesis', 'gen', 'genesis'],
  ['Éxodo', 'Ex', 'exo exod exodo exodus', 'Exodus', 'exo', 'exodus'],
  ['Levítico', 'Lv', 'lev levitico leviticus', 'Leviticus', 'lev', 'leviticus'],
  ['Números', 'Nm', 'num nu numeros numbers', 'Numbers', 'num', 'numbers'],
  ['Deuteronomio', 'Dt', 'deut deu deuteronomy', 'Deuteronomy', 'deu', 'deuteronomy'],
  ['Josué', 'Jos', 'josh josue joshua', 'Joshua', 'jos', 'joshua'],
  ['Jueces', 'Jue', 'judg jc judges', 'Judges', 'jdg', 'judges'],
  ['Rut', 'Rt', 'ruth', 'Ruth', 'rth', 'ruth'],
  ['1 Samuel', '1S', '1sam 1sa 1sm', '1 Samuel', '1sa', '1_samuel'],
  ['2 Samuel', '2S', '2sam 2sa 2sm', '2 Samuel', '2sa', '2_samuel'],
  ['1 Reyes', '1R', '1re 1rey 1kgs 1ki 1kings', '1 Kings', '1ki', '1_kings'],
  ['2 Reyes', '2R', '2re 2rey 2kgs 2ki 2kings', '2 Kings', '2ki', '2_kings'],
  ['1 Crónicas', '1Cr', '1cro 1cron 1chr 1chronicles', '1 Chronicles', '1ch', '1_chronicles'],
  ['2 Crónicas', '2Cr', '2cro 2cron 2chr 2chronicles', '2 Chronicles', '2ch', '2_chronicles'],
  ['Esdras', 'Esd', 'ezra esd', 'Ezra', 'ezr', 'ezra'],
  ['Nehemías', 'Neh', 'ne nehemias nehemiah', 'Nehemiah', 'neh', 'nehemiah'],
  ['Ester', 'Est', 'esth esther', 'Esther', 'est', 'esther'],
  ['Job', 'Job', 'jb', 'Job', 'job', 'job'],
  ['Salmos', 'Sal', 'sl salmo ps psa psalm psalms', 'Psalms', 'psa', 'psalms'],
  ['Proverbios', 'Pr', 'prov pro prv proverbs', 'Proverbs', 'pro', 'proverbs'],
  ['Eclesiastés', 'Ec', 'ecl ecles eccl qo ecclesiastes', 'Ecclesiastes', 'ecc', 'ecclesiastes'],
  ['Cantares', 'Cnt', 'cant cantar song cantico', 'Song of Songs', 'sng', 'songs'],
  ['Isaías', 'Is', 'isa isaias isaiah', 'Isaiah', 'isa', 'isaiah'],
  ['Jeremías', 'Jer', 'jr jeremias jeremiah', 'Jeremiah', 'jer', 'jeremiah'],
  ['Lamentaciones', 'Lm', 'lam lamentations', 'Lamentations', 'lam', 'lamentations'],
  ['Ezequiel', 'Ez', 'eze ezek ezekiel', 'Ezekiel', 'eze', 'ezekiel'],
  ['Daniel', 'Dn', 'dan', 'Daniel', 'dan', 'daniel'],
  ['Oseas', 'Os', 'hos hosea', 'Hosea', 'hos', 'hosea'],
  ['Joel', 'Jl', 'joel', 'Joel', 'joe', 'joel'],
  ['Amós', 'Am', 'amos', 'Amos', 'amo', 'amos'],
  ['Abdías', 'Abd', 'ab abdias obad obadiah', 'Obadiah', 'oba', 'obadiah'],
  ['Jonás', 'Jon', 'jonas jonah', 'Jonah', 'jon', 'jonah'],
  ['Miqueas', 'Mi', 'miq mic micah', 'Micah', 'mic', 'micah'],
  ['Nahúm', 'Nah', 'na nahum', 'Nahum', 'nah', 'nahum'],
  ['Habacuc', 'Hab', 'ha habakkuk', 'Habakkuk', 'hab', 'habakkuk'],
  ['Sofonías', 'Sof', 'so sofonias zeph zephaniah', 'Zephaniah', 'zep', 'zephaniah'],
  ['Hageo', 'Hag', 'hg haggai', 'Haggai', 'hag', 'haggai'],
  ['Zacarías', 'Zac', 'za zacarias zech zechariah', 'Zechariah', 'zec', 'zechariah'],
  ['Malaquías', 'Mal', 'ml malaquias malachi', 'Malachi', 'mal', 'malachi'],
  ['Mateo', 'Mt', 'mat matt matthew', 'Matthew', 'mat', 'matthew'],
  ['Marcos', 'Mr', 'mc mar mrk mark', 'Mark', 'mar', 'mark'],
  ['Lucas', 'Lc', 'luc lu luke', 'Luke', 'luk', 'luke'],
  ['Juan', 'Jn', 'jua john', 'John', 'jhn', 'john'],
  ['Hechos', 'Hch', 'hech hec acts', 'Acts', 'act', 'acts'],
  ['Romanos', 'Ro', 'rom rm romans', 'Romans', 'rom', 'romans'],
  ['1 Corintios', '1Co', '1cor 1corinthians', '1 Corinthians', '1co', '1_corinthians'],
  ['2 Corintios', '2Co', '2cor 2corinthians', '2 Corinthians', '2co', '2_corinthians'],
  ['Gálatas', 'Gá', 'gal ga galatas galatians', 'Galatians', 'gal', 'galatians'],
  ['Efesios', 'Ef', 'efe eph ephesians', 'Ephesians', 'eph', 'ephesians'],
  ['Filipenses', 'Fil', 'flp phil philippians', 'Philippians', 'phl', 'philippians'],
  ['Colosenses', 'Col', 'col colossians', 'Colossians', 'col', 'colossians'],
  ['1 Tesalonicenses', '1Ts', '1tes 1te 1thess 1thessalonians', '1 Thessalonians', '1th', '1_thessalonians'],
  ['2 Tesalonicenses', '2Ts', '2tes 2te 2thess 2thessalonians', '2 Thessalonians', '2th', '2_thessalonians'],
  ['1 Timoteo', '1Ti', '1tim 1tm 1timothy', '1 Timothy', '1ti', '1_timothy'],
  ['2 Timoteo', '2Ti', '2tim 2tm 2timothy', '2 Timothy', '2ti', '2_timothy'],
  ['Tito', 'Tit', 'tt titus', 'Titus', 'tit', 'titus'],
  ['Filemón', 'Flm', 'filem filemon phlm philemon', 'Philemon', 'phm', 'philemon'],
  ['Hebreos', 'He', 'heb hb hebrews', 'Hebrews', 'heb', 'hebrews'],
  ['Santiago', 'Stg', 'sant stgo st jas james', 'James', 'jas', 'james'],
  ['1 Pedro', '1P', '1pe 1ped 1pet 1peter', '1 Peter', '1pe', '1_peter'],
  ['2 Pedro', '2P', '2pe 2ped 2pet 2peter', '2 Peter', '2pe', '2_peter'],
  ['1 Juan', '1Jn', '1jua 1john', '1 John', '1jo', '1_john'],
  ['2 Juan', '2Jn', '2jua 2john', '2 John', '2jo', '2_john'],
  ['3 Juan', '3Jn', '3jua 3john', '3 John', '3jo', '3_john'],
  ['Judas', 'Jud', 'jds jude', 'Jude', 'jde', 'jude'],
  ['Apocalipsis', 'Ap', 'apoc apo rev revelation', 'Revelation', 'rev', 'revelation'],
];

const CAPITULOS = [50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22];

export const normalizar = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const LIBROS = DATOS.map((d, i) => ({
  n: i + 1,
  nombre: d[0],
  abrev: d[1],
  ingles: d[3],
  blb: d[4],
  biblehub: d[5],
  capitulos: CAPITULOS[i],
  testamento: i < 39 ? 'AT' : 'NT',
  clave: normalizar(d[0]).replace(/\s+/g, ''),
  alias: [normalizar(d[1]).replace(/\s+/g, ''), normalizar(d[3]).replace(/\s+/g, ''), ...d[2].split(' ')],
}));

// Idioma de los nombres de libro en pantalla (las búsquedas aceptan ambos siempre)
let idiomaLibros = 'es';
export const fijarIdiomaLibros = (i) => { idiomaLibros = i === 'en' ? 'en' : 'es'; };
export const nombreLibro = (l) => (idiomaLibros === 'en' ? l.ingles : l.nombre);
export const abrevLibro = (l) => (idiomaLibros === 'en' ? l.blb.replace(/[a-z]/, (c) => c.toUpperCase()) : l.abrev);

export const TOTAL_CAPITULOS = CAPITULOS.reduce((a, b) => a + b, 0);

export function buscarLibro(texto) {
  const t = normalizar(texto).replace(/[\s.]+/g, '');
  if (!t) return null;
  for (const l of LIBROS) if (l.clave === t || l.alias.includes(t)) return l;
  for (const l of LIBROS) if (l.clave.startsWith(t)) return l;
  for (const l of LIBROS) if (l.alias[1].startsWith(t)) return l;
  return null;
}

// "jn 3:16", "1 cor 13:4-7", "génesis 1", "sal23", "Juan 3.16", "juan 3 16"
const RE_REF = /^\s*([1-3]?\s*[a-zA-ZÀ-ÿñÑ.]+?)\.?\s*(\d+)?(?:\s*[:., ]\s*(\d+)(?:\s*[-–]\s*(\d+))?)?\s*$/;

export function parsearReferencia(texto) {
  const m = RE_REF.exec(texto || '');
  if (!m) return null;
  const libro = buscarLibro(m[1]);
  if (!libro) return null;
  const cap = Math.min(Math.max(parseInt(m[2] || '1', 10), 1), libro.capitulos);
  const v = m[3] ? parseInt(m[3], 10) : null;
  const hasta = m[4] ? parseInt(m[4], 10) : null;
  return { libro: libro.n, cap, v, hasta };
}

// Referencias dentro de un texto libre (notas): [{inicio, fin, ref}]
const RE_EN_TEXTO = /(?:^|[^\wÀ-ÿ])((?:[1-3]\s?)?[A-Za-zÀ-ÿñÑ]{1,15}\.?\s?\d{1,3}[:.]\d{1,3}(?:[-–]\d{1,3})?)/g;
export function referenciasEnTexto(texto) {
  const out = [];
  let m;
  RE_EN_TEXTO.lastIndex = 0;
  while ((m = RE_EN_TEXTO.exec(texto))) {
    const ref = parsearReferencia(m[1]);
    if (ref && ref.v) {
      const inicio = m.index + m[0].indexOf(m[1]);
      out.push({ inicio, fin: inicio + m[1].length, ref });
    }
  }
  return out;
}

export const clave = (b, c, v) => `${b}.${c}.${v}`;
export const claveCap = (b, c) => `${b}.${c}`;

export function desclave(k) {
  const [b, c, v] = String(k).split('.').map(Number);
  return { libro: b, cap: c, v };
}

export function nombreRef(b, c, v, hasta) {
  const l = LIBROS[b - 1];
  if (!l) return '';
  let s = `${nombreLibro(l)} ${c}`;
  if (v) s += `:${v}`;
  if (hasta && hasta !== v) s += `-${hasta}`;
  return s;
}

export function abrevRef(b, c, v) {
  const l = LIBROS[b - 1];
  return `${abrevLibro(l)} ${c}${v ? ':' + v : ''}`;
}

// "43.3.16-43.3.18" -> {libro, cap, v, hasta}
export function parsearRango(s) {
  const [a, b] = String(s).split('-');
  const ini = desclave(a);
  const fin = b ? desclave(b) : null;
  return { ...ini, hasta: fin && fin.cap === ini.cap ? fin.v : null };
}

export function capituloSiguiente(b, c, delta) {
  let libro = b;
  let cap = c + delta;
  if (cap < 1) {
    if (libro === 1) return null;
    libro -= 1;
    cap = LIBROS[libro - 1].capitulos;
  } else if (cap > LIBROS[libro - 1].capitulos) {
    if (libro === 66) return null;
    libro += 1;
    cap = 1;
  }
  return { libro, cap };
}
