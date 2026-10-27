// El versículo del día, compartido por el inicio y la galería de láminas.
// Se usa la versión del usuario si responde pronto; si no, una incluida (RV1909 o BSB).
import { usuario } from './usuario.svelte.js';
import { pasaje, info } from './biblia.js';
import { versiculoDelDia } from './versiculosDelDia.js';
import { nombreRef, normalizar } from './libros.js';
import { idioma } from './i18n.svelte.js';

export const dia = $state({ texto: '', version: '', idioma: '' });
const vd = versiculoDelDia();
let enCurso = null;

export function cargarVersoDelDia() {
  const ingles = idioma() === 'en';
  if (dia.texto && dia.idioma === idioma()) return Promise.resolve();
  if (enCurso) return enCurso;
  enCurso = (async () => {
    const local = ingles ? 'BSB' : 'RV1909';
    const preferida = usuario.ajustes.version;
    const conLimite = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('tiempo')), ms))]);
    try {
      const vPref = info(preferida);
      if (!vPref || (vPref.idioma === 'en') !== ingles) throw new Error('idioma');
      dia.texto = await conLimite(pasaje(preferida, vd.libro, vd.cap, vd.v, vd.hasta, usuario.ajustes.claveNLT), 2500);
      dia.version = preferida;
    } catch {
      dia.texto = await pasaje(local, vd.libro, vd.cap, vd.v, vd.hasta);
      dia.version = local;
    }
    dia.idioma = ingles ? 'en' : 'es';
  })().finally(() => { enCurso = null; });
  return enCurso;
}

// Datos de lámina del versículo del día, listos para dibujarLamina o para el editor
export function laminaDelDia() {
  // la palabra clave que de verdad aparece en el texto de esta versión (cada traducción dice distinto)
  const claves = idioma() === 'en' ? vd.claves.en : vd.claves.es;
  const texto = normalizar(dia.texto);
  return {
    texto: dia.texto,
    referencia: nombreRef(vd.libro, vd.cap, vd.v, vd.hasta),
    clave: claves.find((k) => texto.includes(normalizar(k))) || claves[0],
    version: dia.version,
    libro: vd.libro,
  };
}
