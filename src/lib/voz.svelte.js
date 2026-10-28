// Lectura en voz alta con las voces del sistema (Web Speech API).
import { ui, avisar } from './ui.svelte.js';
import { usuario } from './usuario.svelte.js';
import { info } from './biblia.js';
import { t } from './i18n.svelte.js';

export const voz = $state({ activa: false });

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

export function detener() {
  voz.activa = false;
  ui.leyendo = null;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

export function leer() {
  if (!('speechSynthesis' in window)) {
    avisar(t('voz.sin'), true);
    return;
  }
  detener();
  const ingles = info(usuario.ajustes.version)?.idioma === 'en';
  const lang = ingles ? 'en' : 'es';
  cargarVoces();
  const vozElegida = vozPara(lang);
  const inicio = ui.seleccion.length ? Math.min(...ui.seleccion) : 1;
  const lista = ui.cap.versos.filter((x) => x.v >= inicio);
  let i = 0;
  voz.activa = true;
  const siguiente = () => {
    if (!voz.activa) return;
    if (i >= lista.length) { detener(); return; }
    const x = lista[i++];
    ui.leyendo = x.v;
    document.querySelector(`.texto [data-v="${x.v}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
