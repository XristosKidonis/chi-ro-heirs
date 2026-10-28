// Lectura en voz alta con las voces del sistema (Web Speech API).
import { ui, avisar } from './ui.svelte.js';
import { usuario } from './usuario.svelte.js';
import { info } from './biblia.js';
import { t } from './i18n.svelte.js';

export const voz = $state({ activa: false, preparando: false });

// Voces instaladas, de la más natural a la más robótica. Las «naturales» (Microsoft … Online (Natural),
// las Premium/Mejoradas de Mac, las de Google) suenan mucho mejor que las clásicas del sistema.
export const voces = $state({ es: [], en: [] });
const calidad = (v) => (/natural|neural/i.test(v.name) ? 6 : 0) + (/online/i.test(v.name) ? 2 : 0)
  + (/premium|enhanced|mejorad|siri/i.test(v.name) ? 5 : 0) + (/google/i.test(v.name) ? 3 : 0)
  + (/es-(mx|us|419)/i.test(v.lang) ? 0.5 : 0) + (v.localService === false ? 1 : 0);
export const esNatural = (v) => calidad(v) >= 3;
function cargarVoces() {
  if (typeof speechSynthesis === 'undefined') return;
  const todas = speechSynthesis.getVoices();
  for (const lang of ['es', 'en']) {
    voces[lang] = todas.filter((x) => x.lang?.toLowerCase().startsWith(lang)).sort((a, b) => calidad(b) - calidad(a) || a.name.localeCompare(b.name));
  }
}
if (typeof speechSynthesis !== 'undefined') {
  cargarVoces();
  speechSynthesis.addEventListener?.('voiceschanged', cargarVoces);
}
// la que eligió la persona en Ajustes; si no eligió (o ya no está), la más natural instalada
export function vozPara(lang) {
  const elegida = usuario.ajustes[lang === 'en' ? 'vozEn' : 'vozEs'];
  return voces[lang].find((x) => x.voiceURI === elegida) || voces[lang][0] || null;
}

export function probarVoz(lang) {
  if (typeof speechSynthesis === 'undefined') return;
  detener();
  const u = new SpeechSynthesisUtterance(lang === 'en' ? 'In the beginning was the Word, and the Word was with God, and the Word was God.' : 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.');
  const v = vozPara(lang);
  if (v) u.voice = v;
  u.lang = v?.lang || (lang === 'en' ? 'en-US' : 'es-ES');
  u.rate = usuario.ajustes.velocidadVoz || 1;
  speechSynthesis.speak(u);
}

let pararOtro = null; // detiene la voz natural o la narrada, si es la que suena

export function detener() {
  voz.activa = false;
  voz.preparando = false;
  ui.leyendo = null;
  pararOtro?.();
  pararOtro = null;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

const idiomaLectura = () => (info(usuario.ajustes.version)?.idioma === 'en' ? 'en' : 'es');
const versosDesde = () => {
  const inicio = ui.seleccion.length ? Math.min(...ui.seleccion) : 1;
  return ui.cap.versos.filter((x) => x.v >= inicio && !x.omitido);
};
const mostrar = (v) => {
  ui.leyendo = v;
  document.querySelector(`.texto [data-v="${v}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
};

// Lee con la voz elegida en Ajustes: la natural (IA) o la narrada si están listas; si no, la del sistema
export async function leer() {
  detener();
  const lang = idiomaLectura();
  const motor = usuario.ajustes.motorVoz || 'sistema';
  if (motor === 'narrada') {
    // el reproductor se crea y se «desbloquea» aquí, dentro del toque (WebKit no deja sonar audio pedido después)
    const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    audio.play().catch(() => {});
    const { leerNarrada } = await import('./narrada.js');
    const r = await leerNarrada(lang, { voz, mostrar, versos: versosDesde(), audio });
    if (r) { pararOtro = r; return; }
  }
  if (motor === 'natural') {
    const id = usuario.ajustes[lang === 'en' ? 'vozNeuralEn' : 'vozNeuralEs'];
    const neural = await import('./vozNeural.js');
    if (id && (await neural.instalada(id))) { leerNatural(neural, id); return; }
    avisar(t('voz.naturalFalta'));
  }
  leerSistema(lang);
}

// Voz natural: genera el versículo siguiente mientras suena el actual, para que no haya silencios
let calentada = ''; // la voz natural ya cargada (la primera vez tarda unos segundos)
function leerNatural(neural, id) {
  if (calentada !== id) { avisar(t('voz.preparando')); calentada = id; }
  const lista = versosDesde();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const velocidad = usuario.ajustes.velocidadVoz || 1;
  let fuente = null;
  let vivo = true;
  voz.activa = true;
  voz.preparando = true;
  pararOtro = () => { vivo = false; try { fuente?.stop(); } catch { /* ya terminó */ } ctx.close(); };
  const generar = async (x) => {
    const trozos = [];
    for (const f of neural.frases(x.texto)) trozos.push(await neural.sintetizar(id, f, velocidad));
    const fr = trozos[0]?.frecuencia || 22050;
    const pausa = Math.round(fr * 0.25); // un respiro entre frases y al final del versículo
    const largo = trozos.reduce((a, b) => a + b.pcm.length + pausa, 0);
    const buf = ctx.createBuffer(1, Math.max(1, largo), fr);
    const d = buf.getChannelData(0);
    let o = 0;
    for (const tz of trozos) { d.set(tz.pcm, o); o += tz.pcm.length + pausa; }
    return buf;
  };
  let i = 0;
  let proximo = lista.length ? generar(lista[0]) : null;
  const siguiente = async () => {
    if (!vivo || !voz.activa) return;
    if (i >= lista.length) { detener(); return; }
    const x = lista[i++];
    let buf;
    try {
      buf = await proximo;
    } catch (e) {
      console.warn('voz natural', e);
      avisar(t('voz.naturalError'), true);
      detener();
      return;
    }
    if (!vivo) return;
    voz.preparando = false;
    proximo = i < lista.length ? generar(lista[i]) : null;
    mostrar(x.v);
    fuente = ctx.createBufferSource();
    fuente.buffer = buf;
    fuente.connect(ctx.destination);
    fuente.onended = siguiente;
    fuente.start();
  };
  ctx.resume().then(siguiente);
}

function leerSistema(lang) {
  if (!('speechSynthesis' in window)) {
    avisar(t('voz.sin'), true);
    return;
  }
  const ingles = lang === 'en';
  cargarVoces();
  const vozElegida = vozPara(lang);
  const lista = versosDesde();
  let i = 0;
  voz.activa = true;
  const siguiente = () => {
    if (!voz.activa) return;
    if (i >= lista.length) { detener(); return; }
    const x = lista[i++];
    mostrar(x.v);
    const u = new SpeechSynthesisUtterance(x.texto);
    u.lang = vozElegida?.lang || (ingles ? 'en-US' : 'es-ES');
    if (vozElegida) u.voice = vozElegida;
    u.rate = usuario.ajustes.velocidadVoz || 1;
    u.onend = siguiente;
    u.onerror = () => { if (voz.activa) siguiente(); };
    speechSynthesis.speak(u);
  };
  siguiente();
}
