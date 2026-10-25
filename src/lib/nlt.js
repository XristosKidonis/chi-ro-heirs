// Cliente de la API oficial de Tyndale (api.nlt.to): NTV en español y NLT en inglés.
// Términos: uso personal no comercial. El texto se guarda solo en memoria durante la sesión.
import { LIBROS } from './libros.js';
import { pedir } from './bd.js';

const BASE = 'https://api.nlt.to/api/passages';
const cache = new Map(); // solo en memoria: la licencia no cubre guardar el texto en disco

const limpiar = (s) => String(s || '').replace(/\s+/g, ' ').trim();

// Convierte la respuesta HTML de la API en {versos: [{v, texto}], titulos: {v: título}}
export function parsearNLT(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const versos = new Map();
  const titulos = {};
  let pendiente = null;
  for (const el of doc.body.querySelectorAll('verse_export, .subhead')) {
    const esVerso = el.tagName.toLowerCase() === 'verse_export';
    if (!esVerso) {
      if (!el.closest('verse_export')) pendiente = limpiar(el.textContent);
      continue;
    }
    const n = parseInt(el.getAttribute('vn') || el.getAttribute('vs_num') || el.querySelector('.vn')?.textContent || '', 10);
    if (!n) continue;
    const copia = el.cloneNode(true);
    copia.querySelectorAll('.subhead').forEach((s) => {
      titulos[n] ??= limpiar(s.textContent);
      s.remove();
    });
    copia.querySelectorAll('.vn, .tn, .a-tn, .tn-ref, .chapter-number, h2, h3').forEach((x) => x.remove());
    if (pendiente) {
      titulos[n] ??= pendiente;
      pendiente = null;
    }
    const texto = limpiar(copia.textContent);
    versos.set(n, versos.has(n) ? `${versos.get(n)} ${texto}` : texto);
  }
  return {
    versos: [...versos].sort((a, b) => a[0] - b[0]).map(([v, texto]) => ({ v, texto })),
    titulos,
  };
}

export async function capituloNLT(version, libro, cap, clave) {
  const id = `${version}|${libro}|${cap}`;
  if (cache.has(id)) return cache.get(id);
  const ref = `${LIBROS[libro - 1].ingles} ${cap}`;
  const url = `${BASE}?ref=${encodeURIComponent(ref)}&version=${version}&key=${encodeURIComponent(clave || 'TEST')}`;
  let r;
  try {
    r = await pedir(url);
  } catch (e) {
    throw new Error(`Sin conexión con la API de Tyndale. La ${version} necesita internet; mientras tanto puedes leer una versión incluida. (Detalle: ${e?.message || e})`);
  }
  if (!r.ok) {
    throw new Error(r.status === 401 || r.status === 403
      ? 'La clave de la API de Tyndale no es válida. Revísala en Ajustes.'
      : `La API de Tyndale respondió ${r.status}. Si usas la clave de prueba, puede que alcanzaste el límite diario (500 consultas); registra tu clave gratuita en api.nlt.to.`);
  }
  const datos = parsearNLT(await r.text());
  if (!datos.versos.length) throw new Error(`La API de Tyndale no devolvió texto para ${ref}.`);
  cache.set(id, datos);
  return datos;
}
