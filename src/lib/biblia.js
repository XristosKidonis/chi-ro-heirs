// Versiones, capítulos, búsqueda, concordancia, referencias cruzadas y léxico Strong.
import { bdBiblias } from './bd.js';
import { capituloNLT } from './nlt.js';
import { normalizar, desclave, parsearRango } from './libros.js';

export const EN_LINEA = [
  { id: 'NTV', nombre: 'Nueva Traducción Viviente', idioma: 'es', enLinea: true,
    licencia: 'Texto bíblico © 2010 Tyndale House Foundation. Vía la API oficial api.nlt.to, para uso personal no comercial.' },
  { id: 'NLT', nombre: 'New Living Translation', idioma: 'en', enLinea: true,
    licencia: 'Holy Bible, New Living Translation © 1996, 2004, 2015 Tyndale House Foundation. Via api.nlt.to, non-commercial use.' },
];

let locales = [];

export async function cargarVersiones() {
  const db = await bdBiblias();
  locales = await db.select('SELECT id, nombre, idioma, licencia FROM versiones ORDER BY orden');
  return lista();
}

export const lista = () => [...EN_LINEA, ...locales];
export const info = (id) => lista().find((v) => v.id === id);

// Versión local que se usa para buscar y estudiar cuando la versión actual solo está en línea.
export function versionEstudio(id) {
  const v = info(id);
  if (!v || !v.enLinea) return id;
  return v.idioma === 'es' ? 'RV1909' : 'BSB';
}

// {versos: [{v, texto}], titulos: {v: título}}
export async function capitulo(id, libro, cap, claveNLT) {
  if (info(id)?.enLinea) return capituloNLT(id, libro, cap, claveNLT);
  const db = await bdBiblias();
  const versos = await db.select(
    'SELECT vers AS v, texto FROM versiculos WHERE version = ? AND libro = ? AND cap = ? ORDER BY vers',
    [id, libro, cap],
  );
  return { versos, titulos: {} };
}

// Texto de un versículo o rango dentro de un capítulo
export async function pasaje(id, libro, cap, v, hasta, claveNLT) {
  const { versos } = await capitulo(id, libro, cap, claveNLT);
  const fin = hasta || v;
  return versos.filter((x) => x.v >= v && x.v <= fin).map((x) => x.texto).join(' ');
}

// ---------- búsqueda ----------
const terminos = (texto) => normalizar(texto).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

export function consultaFTS(texto, modo = 'palabras') {
  const t = terminos(texto);
  if (!t.length) return null;
  if (modo === 'frase') return `"${t.join(' ')}"`;
  if (modo === 'prefijo') return t.map((x) => `"${x}"*`).join(' ');
  return t.map((x) => `"${x}"`).join(' ');
}

function filtroAmbito(ambito) {
  if (ambito === 'AT') return [' AND v.libro <= 39', []];
  if (ambito === 'NT') return [' AND v.libro >= 40', []];
  if (typeof ambito === 'number') return [' AND v.libro = ?', [ambito]];
  return ['', []];
}

export async function buscar(version, texto, { modo = 'palabras', ambito = 'todo', limite = 300 } = {}) {
  const q = consultaFTS(texto, modo);
  if (!q) return { total: 0, filas: [], porLibro: [] };
  const db = await bdBiblias();
  const [extra, params] = filtroAmbito(ambito);
  const base = `FROM versiculos_fts f JOIN versiculos v ON v.id = f.rowid
                WHERE versiculos_fts MATCH ? AND v.version = ?${extra}`;
  const args = [q, version, ...params];
  const porLibro = await db.select(`SELECT v.libro AS libro, COUNT(*) AS n ${base} GROUP BY v.libro`, args);
  const total = porLibro.reduce((a, x) => a + Number(x.n), 0);
  const filas = await db.select(
    `SELECT v.libro AS libro, v.cap AS cap, v.vers AS v, v.texto AS texto ${base} ORDER BY v.id LIMIT ?`,
    [...args, limite],
  );
  return { total, filas, porLibro: porLibro.map((x) => ({ libro: Number(x.libro), n: Number(x.n) })) };
}

// Resalta los términos buscados dentro de un texto (devuelve HTML seguro)
export function resaltar(texto, consulta, prefijo = false) {
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const t = terminos(consulta);
  if (!t.length) return esc(texto);
  const norm = normalizar(texto);
  const marcas = [];
  for (const term of t) {
    const re = new RegExp(`(^|[^a-z0-9])(${term}${prefijo ? '[a-z0-9]*' : ''})(?=[^a-z0-9]|$)`, 'g');
    let m;
    while ((m = re.exec(norm))) marcas.push([m.index + m[1].length, m.index + m[1].length + m[2].length]);
  }
  marcas.sort((a, b) => a[0] - b[0]);
  let out = '';
  let pos = 0;
  for (const [a, b] of marcas) {
    if (a < pos) continue;
    out += esc(texto.slice(pos, a)) + '<mark>' + esc(texto.slice(a, b)) + '</mark>';
    pos = b;
  }
  return out + esc(texto.slice(pos));
}

// ---------- referencias cruzadas ----------
export async function referencias(libro, cap, v) {
  const db = await bdBiblias();
  const [fila] = await db.select('SELECT destinos FROM refs WHERE origen = ?', [`${libro}.${cap}.${v}`]);
  if (!fila) return [];
  return fila.destinos.split('|').map(parsearRango);
}

// ---------- léxico Strong ----------
export async function strong(id) {
  const db = await bdBiblias();
  const [fila] = await db.select('SELECT * FROM strong WHERE id = ?', [id]);
  return fila || null;
}

// Palabras griegas o hebreas que la KJV traduce con una palabra inglesa dada
export async function strongPorGlosa(palabra, testamento) {
  const p = normalizar(palabra).replace(/[^a-z]/g, '');
  if (p.length < 3) return [];
  const db = await bdBiblias();
  const pref = testamento === 'AT' ? 'H%' : 'G%';
  const filas = await db.select(
    `SELECT * FROM strong WHERE id LIKE ? AND (' ' || lower(kjv) || ' ') LIKE ? LIMIT 40`,
    [pref, `%[^a-z]${p}[^a-z]%`.replace(/\[\^a-z\]/g, '_')],
  );
  const re = new RegExp(`(^|[^a-z])${p}([^a-z]|$)`);
  return filas.filter((f) => re.test(` ${String(f.kjv).toLowerCase()} `)).slice(0, 8);
}

// ---------- interlineal hebreo y griego (STEPBible, CC BY) ----------
export async function interlineal(libro, cap, v) {
  const db = await bdBiblias();
  return db.select(
    'SELECT pos, original, translit, glosa, glosa_es, strong, morf, variante FROM interlineal WHERE libro = ? AND cap = ? AND vers = ? ORDER BY pos',
    [libro, cap, v],
  );
}

// Entrada del léxico: primero el número extendido exacto (H7225G), luego el número base (H7225)
export async function lexico(id) {
  if (!id) return null;
  const db = await bdBiblias();
  const [exacto] = await db.select('SELECT * FROM lexico WHERE id = ?', [id]);
  if (exacto) return exacto;
  const base = id.replace(/[A-Za-z]$/, '');
  const [aprox] = await db.select('SELECT * FROM lexico WHERE id = ? OR id LIKE ? ORDER BY id LIMIT 1', [base, `${base}_`]);
  return aprox || null;
}

// Todos los versículos donde aparece una palabra original (mismo número Strong)
export async function concordanciaStrong(id, limite = 400) {
  const db = await bdBiblias();
  const porLibro = await db.select(
    'SELECT libro, COUNT(DISTINCT cap * 1000 + vers) AS n, COUNT(*) AS veces FROM interlineal WHERE strong = ? GROUP BY libro',
    [id],
  );
  const filas = await db.select(
    'SELECT DISTINCT libro, cap, vers AS v FROM interlineal WHERE strong = ? ORDER BY libro, cap, vers LIMIT ?',
    [id, limite],
  );
  const pl = porLibro.map((x) => ({ libro: Number(x.libro), n: Number(x.n), veces: Number(x.veces) }));
  return {
    versiculos: pl.reduce((a, x) => a + x.n, 0),
    veces: pl.reduce((a, x) => a + x.veces, 0),
    porLibro: pl,
    filas,
  };
}

// Textos de muchos versículos de una vez (para listas de resultados)
export async function textos(version, refs) {
  if (!refs.length) return {};
  const db = await bdBiblias();
  const out = {};
  for (let i = 0; i < refs.length; i += 200) {
    const lote = refs.slice(i, i + 200);
    const cond = lote.map(() => '(libro = ? AND cap = ? AND vers = ?)').join(' OR ');
    const filas = await db.select(
      `SELECT libro, cap, vers, texto FROM versiculos WHERE version = ? AND (${cond})`,
      [version, ...lote.flatMap((r) => [r.libro, r.cap, r.v])],
    );
    for (const f of filas) out[`${f.libro}.${f.cap}.${f.vers}`] = f.texto;
  }
  return out;
}

export const claveDesdeRef = (k) => desclave(k);
