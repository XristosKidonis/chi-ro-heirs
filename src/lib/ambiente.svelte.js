// Ambiente: música y sonidos para leer, todo dentro de la app y sin internet.
// - Música: grabaciones reales de dominio público o con licencia libre (piano, himnos, coral y cuerdas),
//   ver musica.js. Suena con un elemento <audio> y se funde al empezar, al cambiar de pista y al pausar.
// - Sonidos: lluvia, fuego, viento y olas, generados con Web Audio (no son grabaciones).
// La música baja sola cuando la app lee en voz alta y puede apagarse con un temporizador o al terminar el capítulo.
import { usuario, ajustar } from './usuario.svelte.js';
import { voz } from './voz.svelte.js';
import { LISTAS, archivoPista } from './musica.js';

export const MUSICAS = Object.keys(LISTAS);
export const CAPAS = ['lluvia', 'fuego', 'viento', 'olas'];
export const TEMPORIZADORES = [0, 10, 20, 30, 'amen'];

const INICIAL = { musica: 'piano', volumen: 0.7, capas: { lluvia: 0, fuego: 0, viento: 0, olas: 0 }, temporizador: 0 };
export const preferencias = () => {
  const a = usuario.ajustes.ambiente || {};
  // las músicas generadas de antes (quietud, aurora) pasan al piano grabado
  const musica = a.musica === null || a.musica in LISTAS ? a.musica : a.musica === undefined ? INICIAL.musica : 'piano';
  return { ...INICIAL, ...a, musica, capas: { ...INICIAL.capas, ...(a.capas || {}) } };
};
const guardar = (cambio) => ajustar('ambiente', { ...preferencias(), ...cambio });

// pista: la que suena (o la última); lista: la lista de esa pista; indice: su lugar en la lista
export const amb = $state({ sonando: false, cargando: false, pista: null, lista: null, indice: 0, restante: 0 });

let ctx = null;
let salida;     // volumen general de los sonidos (fundidos)
let capasBus;
const capas = {};  // nombre -> { gain, parar() }
let reloj = null;

// ---------- utilidades de audio ----------
// Sin Web Audio (algún WebKit) no hay sonidos generados, pero la música grabada (<audio>) igual suena
function contexto() {
  if (ctx) return ctx;
  const Contexto = window.AudioContext || window.webkitAudioContext;
  if (!Contexto) return null;
  ctx = new Contexto();
  salida = ctx.createGain();
  salida.gain.value = 0;
  salida.connect(ctx.destination);
  capasBus = ctx.createGain();
  capasBus.connect(salida);
  return ctx;
}

function ruido(tipo, segundos = 6) {
  const n = Math.floor(ctx.sampleRate * segundos);
  const b = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = b.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, ultimo = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    if (tipo === 'rosa') {
      b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11;
    } else if (tipo === 'marron') {
      ultimo = (ultimo + 0.02 * w) / 1.02;
      d[i] = ultimo * 3.5;
    } else d[i] = w * 0.5;
  }
  return b;
}

function fuenteRuido(tipo) {
  const s = ctx.createBufferSource();
  s.buffer = ruido(tipo);
  s.loop = true;
  return s;
}

function filtro(tipo, f, q = 0.7) {
  const x = ctx.createBiquadFilter();
  x.type = tipo;
  x.frequency.value = f;
  x.Q.value = q;
  return x;
}

function lfo(frecuencia, cantidad, destino) {
  const o = ctx.createOscillator();
  o.frequency.value = frecuencia;
  const g = ctx.createGain();
  g.gain.value = cantidad;
  o.connect(g).connect(destino);
  o.start();
  return o;
}

// ---------- música grabada ----------
// Un solo <audio>. El volumen final = volumen elegido × (baja con la voz) × fundido de pista × fundido general.
let audio = null;
let blob = null;       // URL del archivo en memoria (en la app de escritorio se pide con fetch y se toca desde un blob)
let pedido = 0;        // para descartar cargas viejas si se cambia rápido de pista
const nivel = { pista: 1, general: 0 };
const SILENCIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

function elemento() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = 'auto';
  audio.addEventListener('ended', () => { if (audio.src !== SILENCIO && amb.sonando) siguiente(); });
  return audio;
}

function aplicarVolumenMusica() {
  if (!audio) return;
  const p = preferencias();
  const v = p.volumen * (voz.activa ? 0.25 : 1) * nivel.pista * nivel.general; // la música baja mientras la app lee
  audio.volume = Math.max(0, Math.min(1, v));
}

// Lleva nivel[cual] a «hasta» en «ms» milisegundos.
// Un fundido nuevo corta al anterior y lo da por terminado: si no, quien esperaba al anterior se quedaba
// esperando para siempre (tocar «Siguiente» mientras arrancaba una pista dejaba el Ambiente en «Cargando…»).
const fundidos = {}; // cual -> { reloj, listo }
function fundir(cual, hasta, ms) {
  const previo = fundidos[cual];
  if (previo) { clearInterval(previo.reloj); previo.listo(); }
  const desde = nivel[cual];
  const t0 = performance.now();
  return new Promise((listo) => {
    if (ms <= 0) { fundidos[cual] = null; nivel[cual] = hasta; aplicarVolumenMusica(); listo(); return; }
    const este = { listo, reloj: setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      nivel[cual] = desde + (hasta - desde) * (k * k * (3 - 2 * k));
      aplicarVolumenMusica();
      if (k >= 1) { clearInterval(este.reloj); if (fundidos[cual] === este) fundidos[cual] = null; listo(); }
    }, 40) };
    fundidos[cual] = este;
  });
}

async function tocarPista(lista, indice) {
  const pistas = LISTAS[lista];
  const i = ((indice % pistas.length) + pistas.length) % pistas.length;
  const n = ++pedido;
  const a = elemento();
  if (!a.paused && a.src !== SILENCIO) await fundir('pista', 0, 700);
  if (n !== pedido) return;
  a.pause();
  amb.lista = lista;
  amb.indice = i;
  amb.pista = pistas[i];
  amb.cargando = true;
  try {
    const r = await fetch(archivoPista(pistas[i]));
    if (!r.ok) throw new Error(r.status);
    const url = URL.createObjectURL(await r.blob());
    if (n !== pedido) { URL.revokeObjectURL(url); return; }
    if (blob) URL.revokeObjectURL(blob);
    blob = url;
    a.src = url;
    nivel.pista = 0;
    aplicarVolumenMusica();
    if (amb.sonando) await a.play();
    if (n !== pedido) return; // mientras arrancaba se pidió otra pista: no pisar su fundido
    fundir('pista', 1, 1200);
  } catch (e) {
    console.warn('ambiente: no se pudo tocar', pistas[i].id, e);
  } finally {
    if (n === pedido) amb.cargando = false;
  }
}

function pararMusica() {
  pedido++;
  amb.cargando = false;
  if (!audio) return;
  fundir('pista', 0, 700).then(() => { if (!amb.sonando || !preferencias().musica) audio.pause(); });
}

async function ponerMusica(cual) {
  if (!cual) { pararMusica(); return; }
  if (!amb.sonando) return;
  // si esa lista ya estaba sonando, sigue donde iba; si no, empieza en una pista al azar
  if (amb.lista === cual && audio?.src && audio.src !== SILENCIO) {
    if (audio.paused) { await audio.play().catch(() => {}); fundir('pista', 1, 1000); }
    return;
  }
  await tocarPista(cual, Math.floor(Math.random() * LISTAS[cual].length));
}

export function siguiente() {
  const lista = amb.lista || preferencias().musica;
  if (lista) tocarPista(lista, amb.indice + 1);
}
export function anterior() {
  const lista = amb.lista || preferencias().musica;
  if (!lista) return;
  // como en cualquier reproductor: si ya avanzó un poco, vuelve al principio de la misma
  if (audio && audio.currentTime > 6) { audio.currentTime = 0; return; }
  tocarPista(lista, amb.indice - 1);
}
export function elegirPista(lista, indice) {
  guardar({ musica: lista });
  if (!amb.sonando) { amb.lista = lista; amb.indice = indice; reproducir(indice); return; }
  tocarPista(lista, indice);
}

// ---------- sonidos ----------
function crearCapa(nombre) {
  const g = ctx.createGain();
  g.gain.value = 0;
  g.connect(capasBus);
  const fuentes = [];
  const extra = [];
  if (nombre === 'lluvia') {
    const s = fuenteRuido('rosa');
    const hp = filtro('highpass', 500);
    const lp = filtro('lowpass', 7000);
    s.connect(hp).connect(lp).connect(g);
    fuentes.push(s);
    extra.push(lfo(0.3, 0.05, g.gain));
  } else if (nombre === 'fuego') {
    const s = fuenteRuido('marron');
    const lp = filtro('lowpass', 420);
    const base = ctx.createGain();
    base.gain.value = 0.9;
    s.connect(lp).connect(base).connect(g);
    fuentes.push(s);
    // chasquidos de leña: golpes muy cortos y al azar
    const chasquido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate);
    const d = chasquido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 6);
    const hp = filtro('highpass', 1800);
    hp.connect(g);
    let vivo = true;
    const tic = () => {
      if (!vivo) return;
      const s2 = ctx.createBufferSource();
      s2.buffer = chasquido;
      const gg = ctx.createGain();
      gg.gain.value = 0.2 + Math.random() * 0.6;
      s2.connect(gg).connect(hp);
      s2.start();
      setTimeout(tic, 60 + Math.random() * 420);
    };
    tic();
    extra.push({ stop: () => { vivo = false; } });
  } else if (nombre === 'viento') {
    const s = fuenteRuido('blanco');
    const bp = filtro('bandpass', 520, 0.9);
    const vg = ctx.createGain();
    vg.gain.value = 0.55;
    s.connect(bp).connect(vg).connect(g);
    fuentes.push(s);
    extra.push(lfo(0.07, 260, bp.frequency), lfo(0.05, 0.3, vg.gain));
  } else if (nombre === 'olas') {
    const s = fuenteRuido('rosa');
    const lp = filtro('lowpass', 1100);
    const vg = ctx.createGain();
    vg.gain.value = 0.5;
    s.connect(lp).connect(vg).connect(g);
    fuentes.push(s);
    extra.push(lfo(0.11, 0.48, vg.gain), lfo(0.11, 500, lp.frequency));
  }
  fuentes.forEach((s) => s.start());
  return {
    gain: g,
    parar() {
      const ahora = ctx.currentTime;
      g.gain.setTargetAtTime(0, ahora, 0.4);
      fuentes.forEach((s) => s.stop(ahora + 2));
      extra.forEach((x) => x.stop(ahora + 2));
    },
  };
}

function aplicarCapas() {
  if (!ctx) return;
  const p = preferencias();
  for (const nombre of CAPAS) {
    const vol = amb.sonando ? p.capas[nombre] : 0;
    if (vol > 0 && !capas[nombre]) capas[nombre] = crearCapa(nombre);
    if (capas[nombre]) {
      capas[nombre].gain.gain.setTargetAtTime(vol * 0.9, ctx.currentTime, 0.3);
      if (vol === 0) { capas[nombre].parar(); delete capas[nombre]; }
    }
  }
}

// ---------- temporizador ----------
function programarFin() {
  clearInterval(reloj);
  amb.restante = 0;
  const min = preferencias().temporizador;
  if (!amb.sonando || typeof min !== 'number' || !min) return;
  const fin = Date.now() + min * 60000;
  amb.restante = min * 60;
  reloj = setInterval(() => {
    amb.restante = Math.max(0, Math.round((fin - Date.now()) / 1000));
    if (!amb.restante) pausar();
  }, 1000);
}

// ---------- API ----------
// reproducir() se llama desde un toque: ahí mismo se «desbloquea» el <audio> (Safari y WebKit exigen un gesto)
export async function reproducir(indice) {
  contexto();
  const a = elemento();
  if (!a.src) { a.src = SILENCIO; a.play().catch(() => {}); }
  amb.sonando = true;
  if (ctx) {
    await ctx.resume();
    salida.gain.cancelScheduledValues(ctx.currentTime);
    salida.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
  }
  fundir('general', 1, 1500);
  aplicarCapas();
  programarFin();
  const cual = preferencias().musica;
  if (cual && indice != null) await tocarPista(cual, indice);
  else await ponerMusica(cual);
}

// Se apaga con un fundido de unos segundos, no de golpe
export function pausar() {
  if (!amb.sonando) return;
  amb.sonando = false;
  clearInterval(reloj);
  amb.restante = 0;
  if (ctx) salida.gain.setTargetAtTime(0, ctx.currentTime, 1.2);
  fundir('general', 0, 3500).then(() => { if (!amb.sonando) audio?.pause(); });
  setTimeout(() => { if (!amb.sonando) aplicarCapas(); }, 5000);
}

export const alternar = () => (amb.sonando ? pausar() : reproducir());

export function elegirMusica(cual) {
  guardar({ musica: cual });
  if (amb.sonando) ponerMusica(cual);
}
export function volumenMusica(v) {
  guardar({ volumen: v });
  aplicarVolumenMusica();
}
export function volumenCapa(nombre, v) {
  guardar({ capas: { ...preferencias().capas, [nombre]: v } });
  aplicarCapas();
}
export function temporizador(valor) {
  guardar({ temporizador: valor });
  programarFin();
}

// Spotify se abre afuera (en su app o en el navegador): una búsqueda o tu propia playlist
export const enlaceSpotify = (busqueda) => `https://open.spotify.com/search/${encodeURIComponent(busqueda)}/playlists`;
export function playlistValida(texto) {
  const m = String(texto || '').trim().match(/(?:open\.spotify\.com\/(?:intl-[a-z-]+\/)?|spotify:)(playlist|album|artist)[/:]([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/${m[1]}/${m[2]}` : null;
}

// La voz baja la música; al terminar el capítulo (Amén) se apaga si así lo elegiste
let leidosAntes = null;
$effect.root(() => {
  $effect(() => {
    voz.activa;
    aplicarVolumenMusica();
  });
  $effect(() => {
    const { libro, cap } = usuario.ajustes.pos;
    const k = `${libro}.${cap}`;
    const leido = !!usuario.leidos[k];
    if (leidosAntes && leidosAntes.k === k && !leidosAntes.leido && leido && preferencias().temporizador === 'amen') pausar();
    leidosAntes = { k, leido };
  });
});
