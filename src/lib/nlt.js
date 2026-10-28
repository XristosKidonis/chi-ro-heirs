// Cliente de la API oficial de Tyndale (api.nlt.to): NTV en español y NLT en inglés.
// Términos: uso personal no comercial. El texto se guarda solo en memoria durante la sesión.
import { LIBROS, normalizar } from './libros.js';
import { pedir, bdBiblias } from './bd.js';
import { t } from './i18n.svelte.js';

const BASE = 'https://api.nlt.to/api/passages';
const cache = new Map(); // solo en memoria: la licencia no cubre guardar el texto en disco
const MAX_PRUEBA = 50;   // con la clave de prueba la API entrega como mucho 50 versículos por pedido

const limpiar = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const QUITAR = '.vn, .tn, .a-tn, .tn-ref, .chapter-number, h2, h3, h4, .subhead';
const NUMERO = '.vn, .vs_num, .verse-num, .versenum';

// Convierte la respuesta HTML de la API en {versos: [{v, texto}], titulos: {v: título}}
export function parsearNLT(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const r = porVerseExport(doc);
  return r.versos.length ? r : porNumeros(doc);
}

// Formato documentado: <verse_export vn="16"><span class="vn">16</span>texto…</verse_export>
// Ojo: cuando un párrafo (<p>) empieza en un versículo y termina en otro, el navegador no cierra el
// <verse_export> y los siguientes quedan anidados dentro del primero. Por eso se recorre el documento en orden
// y cada texto va al <verse_export> más cercano que lo contiene, nunca al de afuera.
function porVerseExport(doc) {
  if (!doc.body.querySelector('verse_export')) return ordenar(new Map(), {});
  const versos = new Map();
  const titulos = {};
  let pendiente = null;
  const numero = (el) => parseInt(el.getAttribute('vn') || el.getAttribute('vs_num') || el.querySelector(`:scope > ${NUMERO.split(', ').join(', :scope > ')}`)?.textContent || '', 10);
  const sumar = (n, x) => versos.set(n, `${versos.get(n) || ''}${x}`);
  const recorrer = (nodo, n) => {
    for (const hijo of nodo.childNodes) {
      if (hijo.nodeType === 3) { if (n) sumar(n, hijo.textContent); continue; }
      if (hijo.nodeType !== 1) continue;
      if (hijo.tagName.toLowerCase() === 'verse_export') {
        const m = numero(hijo) || n;
        if (m && pendiente) { titulos[m] ??= pendiente; pendiente = null; }
        recorrer(hijo, m);
        continue;
      }
      if (hijo.matches('.subhead, h3, h4')) {
        // un título al principio de un versículo es de ese versículo; si no, del que viene
        if (n && !limpiar(versos.get(n))) titulos[n] ??= limpiar(hijo.textContent);
        else pendiente = limpiar(hijo.textContent);
        continue;
      }
      if (hijo.matches(`${QUITAR}, script, style`)) continue;
      recorrer(hijo, n);
      if (n && /^(P|DIV|BR|LI)$/.test(hijo.tagName)) sumar(n, ' ');
    }
  };
  recorrer(doc.body, 0);
  for (const [n, x] of versos) versos.set(n, limpiar(x));
  for (const [n, x] of versos) if (!x) versos.delete(n);
  return ordenar(versos, titulos);
}

// Respaldo: texto corrido con números de versículo sueltos (<span class="vn">16</span>texto…)
function porNumeros(doc) {
  const versos = new Map();
  const titulos = {};
  let actual = 0;
  let pendiente = null;
  const recorrer = (nodo) => {
    for (const hijo of nodo.childNodes) {
      if (hijo.nodeType === 3) {
        if (actual) versos.set(actual, `${versos.get(actual) || ''}${hijo.textContent}`);
        continue;
      }
      if (hijo.nodeType !== 1) continue;
      if (hijo.matches(NUMERO)) {
        const n = parseInt(hijo.textContent, 10);
        if (n) {
          actual = n;
          if (pendiente) { titulos[n] ??= pendiente; pendiente = null; }
        }
        continue;
      }
      if (hijo.matches('.subhead, h3, h4')) { pendiente = limpiar(hijo.textContent); continue; }
      if (hijo.matches('.tn, .a-tn, .tn-ref, .chapter-number, h2, script, style')) continue;
      recorrer(hijo);
      if (/^(P|DIV|BR|LI)$/.test(hijo.tagName) && actual) versos.set(actual, `${versos.get(actual) || ''} `);
    }
  };
  recorrer(doc.body);
  for (const [n, s] of versos) versos.set(n, limpiar(s));
  for (const [n, s] of versos) if (!s) versos.delete(n);
  return ordenar(versos, titulos);
}

const ordenar = (versos, titulos) => ({
  versos: [...versos].sort((a, b) => a[0] - b[0]).map(([v, texto]) => ({ v, texto })),
  titulos,
});

// Cómo escribir el libro en la referencia. La NLT acepta el nombre en inglés; para la NTV se prueba
// también el nombre en español (con y sin tildes). El primero que responde queda recordado.
function nombresLibro(version, libro) {
  const l = LIBROS[libro - 1];
  const opciones = [l.ingles];
  if (version === 'NTV') opciones.push(l.nombre, normalizar(l.nombre).replace(/^./, (c) => c.toUpperCase()));
  return [...new Set(opciones)];
}
const formatoQueFunciona = {}; // versión -> índice del nombre que respondió con texto

// Cuántos versículos tiene el capítulo (según la versificación de la KJV incluida)
async function versiculosDelCapitulo(libro, cap) {
  try {
    const db = await bdBiblias();
    const [f] = await db.select('SELECT MAX(vers) AS n FROM versiculos WHERE version = ? AND libro = ? AND cap = ?', ['KJV', libro, cap]);
    return Number(f?.n) || 0;
  } catch {
    return 0;
  }
}

async function pedirPasaje(version, ref, clave) {
  const url = `${BASE}?ref=${encodeURIComponent(ref)}&version=${version}&key=${encodeURIComponent(clave || 'TEST')}`;
  let r;
  try {
    r = await pedir(url);
  } catch (e) {
    throw new Error(t('nlt.sinConexion', { v: version, e: e?.message || e }));
  }
  if (!r.ok) {
    throw new Error(r.status === 401 || r.status === 403 ? t('nlt.clave') : t('nlt.estado', { s: r.status }));
  }
  const html = await r.text();
  return { datos: parsearNLT(html), largo: html.length };
}

export async function capituloNLT(version, libro, cap, clave) {
  const id = `${version}|${libro}|${cap}`;
  if (cache.has(id)) return cache.get(id);

  // con la clave de prueba, los capítulos de más de 50 versículos se piden por tramos
  const total = !clave || clave === 'TEST' ? await versiculosDelCapitulo(libro, cap) : 0;
  const tramos = [];
  if (total > MAX_PRUEBA) for (let a = 1; a <= total; a += MAX_PRUEBA) tramos.push(`:${a}-${Math.min(total, a + MAX_PRUEBA - 1)}`);
  else tramos.push('');

  const nombres = nombresLibro(version, libro);
  const orden = formatoQueFunciona[version] != null
    ? [formatoQueFunciona[version], ...nombres.keys()].filter((x, i, a) => a.indexOf(x) === i)
    : [...nombres.keys()];

  let ultimoLargo = 0;
  for (const i of orden) {
    const versos = new Map();
    const titulos = {};
    for (const tramo of tramos) {
      const { datos, largo } = await pedirPasaje(version, `${nombres[i]} ${cap}${tramo}`, clave);
      ultimoLargo = largo;
      for (const x of datos.versos) versos.set(x.v, x.texto);
      Object.assign(titulos, datos.titulos);
      if (!datos.versos.length) break; // este nombre no funciona: se prueba el siguiente
    }
    if (versos.size) {
      formatoQueFunciona[version] = i;
      const resultado = ordenar(versos, titulos);
      cache.set(id, resultado);
      return resultado;
    }
  }
  throw new Error(t('nlt.vacio', { ref: `${nombres[0]} ${cap}` }) + (ultimoLargo ? ` (${t('nlt.sinVersos', { n: ultimoLargo })})` : ` (${t('nlt.cuerpoVacio')})`));
}
