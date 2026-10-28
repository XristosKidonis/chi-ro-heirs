// Biblia narrada por personas: audio de Faith Comes By Hearing (Bible.is) por su API Bible Brain (v4).
// Necesita una clave gratuita y conexión. Cada Biblia en audio viene partida en Antiguo y Nuevo Testamento
// (o completa); por capítulo hay un MP3 y, en muchas, los segundos en que empieza cada versículo.
import { usuario } from './usuario.svelte.js';
import { ui, avisar } from './ui.svelte.js';
import { pedir } from './bd.js';
import { t } from './i18n.svelte.js';

const API = 'https://4.dbp4.org/api';
export const PAGINA_CLAVE = 'https://www.faithcomesbyhearing.com/bible-brain/developer-documentation';
const USFM = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');

async function api(ruta, params = {}, clave = usuario.ajustes.claveBibleBrain) {
  if (!clave) throw new Error(t('narrada.sinClave'));
  const q = new URLSearchParams({ v: '4', key: clave, ...params });
  const r = await pedir(`${API}/${ruta}?${q}`);
  if (r.status === 401 || r.status === 403) throw new Error(t('narrada.claveMala'));
  if (!r.ok) throw new Error(t('narrada.estado', { s: r.status }));
  return r.json();
}

// Biblias en audio de un idioma: [{ id, nombre, tipo: 'audio'|'audio_drama', AT, NT }] (AT/NT: id del fileset)
export async function bibliasEnAudio(lang, clave) {
  const out = new Map();
  for (let pagina = 1; pagina <= 5; pagina++) {
    const r = await api('bibles', { language_code: lang === 'en' ? 'eng' : 'spa', media: 'audio', limit: '100', page: String(pagina) }, clave);
    for (const b of r.data || []) {
      const grupos = Object.values(b.filesets || {}).flat();
      for (const f of grupos) {
        if (f.type !== 'audio' && f.type !== 'audio_drama') continue;
        const k = `${b.abbr}|${f.type}`;
        const x = out.get(k) || { id: k, nombre: b.vname || b.name, nombreEn: b.name, abbr: b.abbr, tipo: f.type, AT: null, NT: null };
        const tam = String(f.size || '').toUpperCase();
        if (tam.startsWith('OT') || tam === 'C' || tam.includes('OT')) x.AT ??= f.id;
        if (tam.startsWith('NT') || tam === 'C' || tam.includes('NT')) x.NT ??= f.id;
        out.set(k, x);
      }
    }
    const ultima = r.meta?.pagination?.last_page ?? r.meta?.pagination?.total_pages ?? 1;
    if (pagina >= ultima) break;
  }
  return [...out.values()].filter((x) => x.AT || x.NT).sort((a, b) => (a.tipo === b.tipo ? a.nombre.localeCompare(b.nombre) : a.tipo === 'audio' ? -1 : 1));
}

// Empieza a sonar el capítulo actual desde el primer versículo de «versos». Devuelve una función para pararlo,
// o null si no se puede (sin clave, sin Biblia elegida, o esa Biblia no tiene este testamento).
export async function leerNarrada(lang, { voz, mostrar, versos, audio: reproductor }) {
  const elegida = usuario.ajustes[lang === 'en' ? 'audioEn' : 'audioEs'];
  if (!usuario.ajustes.claveBibleBrain || !elegida) { avisar(t('narrada.falta')); return null; }
  const { libro, cap } = usuario.ajustes.pos;
  const fileset = libro <= 39 ? elegida.AT : elegida.NT;
  if (!fileset) { avisar(t('narrada.noCubre', { b: elegida.nombre })); return null; }
  const codigo = USFM[libro - 1];
  voz.activa = true;
  voz.preparando = true;
  let audio;
  let tiempos = [];
  try {
    const [arch, ts] = await Promise.all([
      api(`bibles/filesets/${fileset}/${codigo}/${cap}`),
      api(`timestamps/${fileset}/${codigo}/${cap}`).catch(() => ({ data: [] })),
    ]);
    const ruta = arch.data?.[0]?.path;
    if (!ruta) throw new Error(t('narrada.sinAudio'));
    tiempos = (ts.data || [])
      .map((x) => ({ v: parseInt(x.verse_start_alt ?? x.verse_start, 10), t: Number(x.timestamp) }))
      .filter((x) => x.v > 0 && Number.isFinite(x.t))
      .sort((a, b) => a.t - b.t);
    audio = reproductor || new Audio();
    audio.src = ruta;
  } catch (e) {
    voz.activa = false;
    voz.preparando = false;
    avisar(e.message || String(e), true);
    return null;
  }
  if (!voz.activa) return null;
  const fin = () => { voz.activa = false; voz.preparando = false; ui.leyendo = null; };
  const desde = versos[0]?.v || 1;
  const inicio = tiempos.find((x) => x.v === desde);
  audio.addEventListener('loadedmetadata', () => { if (inicio && desde > 1) audio.currentTime = inicio.t; }, { once: true });
  audio.addEventListener('playing', () => { voz.preparando = false; });
  // con tiempos, el versículo que suena se marca y el texto lo sigue
  let actual = 0;
  audio.addEventListener('timeupdate', () => {
    if (!tiempos.length) return;
    let v = tiempos[0].v;
    for (const x of tiempos) if (x.t <= audio.currentTime + 0.15) v = x.v;
    if (v !== actual) { actual = v; mostrar(v); }
  });
  audio.addEventListener('ended', fin);
  audio.addEventListener('error', () => { avisar(t('narrada.sinAudio'), true); fin(); });
  avisar(t('narrada.suena', { b: elegida.nombre }));
  audio.play().catch((e) => { avisar(e.message || String(e), true); fin(); });
  return () => { audio.pause(); audio.removeAttribute('src'); audio.load(); };
}
