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

// Convierte la respuesta HTML de la API en {versos: [{v, texto, hasta?}], titulos: {v: título}}
// Formato documentado: <verse_export vn="16"><span class="vn">16</span>texto…</verse_export>; también acepta
// texto corrido con números sueltos (<span class="vn">16</span>texto…).
// Ojo: el HTML real no está bien anidado. Un párrafo (<p>) abre en un versículo y sigue en los siguientes, y al
// corregirlo el navegador deja <verse_export> anidados o saca el texto fuera del suyo (en Apocalipsis 22 el texto
// del 3 quedaba dentro del <verse_export> del 1). Por eso no se mira quién contiene a quién: se recorre el
// documento en orden y cada texto va al último versículo que empezó, por su <verse_export> o por su número.
// A veces la traducción une versículos: <span class="vn">20-21</span> (Números 1). Va como {v: 20, hasta: 21}.
export function parsearNLT(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const versos = new Map();
  const hasta = {};
  const titulos = {};
  let actual = 0;
  let pendiente = null;
  const sumar = (x) => versos.set(actual, `${versos.get(actual) || ''}${x}`);
  const empieza = (n) => {
    if (!n || (hasta[actual] && n > actual && n <= hasta[actual])) return; // el 21 de un «20-21» sigue en el 20
    actual = n;
    if (pendiente) { titulos[n] ??= pendiente; pendiente = null; }
  };
  const recorrer = (nodo) => {
    for (const hijo of nodo.childNodes) {
      if (hijo.nodeType === 3) { if (actual) sumar(hijo.textContent); continue; }
      if (hijo.nodeType !== 1) continue;
      if (hijo.matches(NUMERO)) {
        const [a, b] = hijo.textContent.split(/[-–]/).map((x) => parseInt(x, 10));
        empieza(a);
        if (a && b > a) hasta[a] = b;
        continue;
      }
      if (hijo.matches('.subhead, h3, h4')) {
        // un título al principio de un versículo es de ese versículo; si no, del que viene
        if (actual && !limpiar(versos.get(actual))) titulos[actual] ??= limpiar(hijo.textContent);
        else pendiente = limpiar(hijo.textContent);
        continue;
      }
      if (hijo.matches(`${QUITAR}, script, style`)) continue;
      if (hijo.tagName.toLowerCase() === 'verse_export') empieza(parseInt(hijo.getAttribute('vn') || hijo.getAttribute('vs_num') || '', 10));
      recorrer(hijo);
      if (actual && /^(P|DIV|BR|LI|TD|TH|TR)$/.test(hijo.tagName)) sumar(' '); // también entre celdas: «Simeón 59.300»
    }
  };
  recorrer(doc.body);
  for (const [n, x] of versos) versos.set(n, limpiar(x));
  for (const [n, x] of versos) if (!x) versos.delete(n);
  return ordenar(versos, titulos, hasta);
}

const ordenar = (versos, titulos, hasta = {}) => ({
  versos: [...versos].sort((a, b) => a[0] - b[0]).map(([v, texto]) => (hasta[v] ? { v, texto, hasta: hasta[v] } : { v, texto })),
  titulos,
});

// Versículos que la traducción no trae (Marcos 9:44, Hechos 8:37…: no están en los manuscritos más antiguos).
// Ocupan su lugar con {v, texto: '', omitido: true} para que no parezca que se perdieron y la búsqueda tenga
// adónde llevar. Solo si son pocos: muchos huecos serían un error de carga, no una omisión.
const MAX_OMITIDOS = 3;
function marcarOmitidos(versos) {
  const cubiertos = new Set();
  for (const x of versos) for (let v = x.v; v <= (x.hasta || x.v); v++) cubiertos.add(v);
  const ultimo = Math.max(0, ...cubiertos);
  const faltan = [];
  for (let v = 1; v < ultimo; v++) if (!cubiertos.has(v)) faltan.push(v);
  if (!faltan.length || faltan.length > MAX_OMITIDOS) return versos;
  return [...versos, ...faltan.map((v) => ({ v, texto: '', omitido: true }))].sort((a, b) => a.v - b.v);
}

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
  // un corte de red pasajero no debe dejar el capítulo en blanco: se reintenta dos veces antes de rendirse
  let r;
  let fallo;
  for (const espera of [0, 700, 2000]) {
    if (espera) await new Promise((listo) => setTimeout(listo, espera));
    try {
      r = await pedir(url);
      break;
    } catch (e) {
      fallo = e;
    }
  }
  if (!r) throw new Error(t('nlt.sinConexion', { v: version, e: fallo?.message || fallo }));
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
      for (const x of datos.versos) versos.set(x.v, x);
      Object.assign(titulos, datos.titulos);
      if (!datos.versos.length) break; // este nombre no funciona: se prueba el siguiente
    }
    if (versos.size) {
      formatoQueFunciona[version] = i;
      const resultado = { versos: marcarOmitidos([...versos.values()].sort((a, b) => a.v - b.v)), titulos };
      cache.set(id, resultado);
      return resultado;
    }
  }
  throw new Error(t('nlt.vacio', { ref: `${nombres[0]} ${cap}` }) + (ultimoLargo ? ` (${t('nlt.sinVersos', { n: ultimoLargo })})` : ` (${t('nlt.cuerpoVacio')})`));
}
