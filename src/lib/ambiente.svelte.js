// Ambiente: música y sonidos para leer, todo dentro de la app y sin internet.
// - Música: «Quietud» (piano generativo, nunca suena igual), «Himnos» (melodías de dominio público al piano)
//   y «Aurora» (acordes largos sintetizados). El piano es el Salamander Grand Piano (CC BY 3.0).
// - Sonidos: lluvia, fuego, viento y olas, generados con Web Audio (no son grabaciones).
// La música baja sola cuando la app lee en voz alta y puede apagarse con un temporizador o al terminar el capítulo.
import { usuario, ajustar } from './usuario.svelte.js';
import { voz } from './voz.svelte.js';
import { HIMNOS } from './himnos.js';

export const MUSICAS = ['quietud', 'himnos', 'aurora'];
export const CAPAS = ['lluvia', 'fuego', 'viento', 'olas'];
export const TEMPORIZADORES = [0, 10, 20, 30, 'amen'];

const INICIAL = { musica: 'quietud', volumen: 0.7, capas: { lluvia: 0, fuego: 0, viento: 0, olas: 0 }, temporizador: 0 };
export const preferencias = () => ({ ...INICIAL, ...(usuario.ajustes.ambiente || {}), capas: { ...INICIAL.capas, ...(usuario.ajustes.ambiente?.capas || {}) } });
const guardar = (cambio) => ajustar('ambiente', { ...preferencias(), ...cambio });

export const amb = $state({ sonando: false, cargando: false, himno: '', restante: 0 });

let ctx = null;
let salida;     // volumen general (fundidos)
let musicaBus;  // música (baja con la voz)
let capasBus;
let reverb;
let piano = null; // [{midi, buffer}]
let musica = null; // { parar() }
const capas = {};  // nombre -> { gain, parar() }
let reloj = null;

// ---------- utilidades de audio ----------
function contexto() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  salida = ctx.createGain();
  salida.gain.value = 0;
  salida.connect(ctx.destination);
  musicaBus = ctx.createGain();
  capasBus = ctx.createGain();
  reverb = ctx.createConvolver();
  reverb.buffer = respuestaSala(3.8);
  const humedo = ctx.createGain();
  humedo.gain.value = 0.55;
  musicaBus.connect(salida);
  musicaBus.connect(reverb).connect(humedo).connect(salida);
  capasBus.connect(salida);
  return ctx;
}

// Reverberación: ruido que decae, en estéreo (una sala grande y cálida)
function respuestaSala(segundos) {
  const n = Math.floor(ctx.sampleRate * segundos);
  const b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2);
  }
  return b;
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

// ---------- piano (Salamander) ----------
const MUESTRAS = [2, 3, 4, 5, 6].flatMap((o) => [['C', 0], ['Ds', 3], ['Fs', 6], ['A', 9]].map(([n, s]) => ({ archivo: `${n}${o}`, midi: 12 * (o + 1) + s })));

async function cargarPiano() {
  if (piano) return piano;
  const base = `${import.meta.env.BASE_URL}sonidos/piano/`;
  piano = await Promise.all(MUESTRAS.map(async (m) => {
    const r = await fetch(`${base}${m.archivo}.mp3`);
    return { midi: m.midi, buffer: await ctx.decodeAudioData(await r.arrayBuffer()) };
  }));
  return piano;
}

function nota(midi, cuando, fuerza = 0.4, duracion = 3) {
  let m = piano[0];
  for (const x of piano) if (Math.abs(x.midi - midi) < Math.abs(m.midi - midi)) m = x;
  const s = ctx.createBufferSource();
  s.buffer = m.buffer;
  s.playbackRate.value = Math.pow(2, (midi - m.midi) / 12);
  const g = ctx.createGain();
  g.gain.setValueAtTime(fuerza, cuando);
  g.gain.setTargetAtTime(0, cuando + duracion, 0.9);
  s.connect(g).connect(musicaBus);
  s.start(cuando);
  s.stop(cuando + duracion + 6);
}

// Programador: cada 200 ms agenda lo que toca en el próximo segundo y medio
function programador(agendar) {
  let hasta = ctx.currentTime + 0.1;
  const id = setInterval(() => {
    const limite = ctx.currentTime + 1.5;
    while (hasta < limite) hasta = agendar(hasta);
  }, 200);
  return () => clearInterval(id);
}

// «Quietud»: varias frases cortas que se repiten con periodos distintos y nunca coinciden igual
// (la técnica de «Music for Airports»). Re mayor pentatónica, muy suave.
function quietud() {
  const frases = [
    { periodo: 17.8, notas: [[0, 62], [1.2, 66]] },
    { periodo: 21.3, notas: [[0, 69]] },
    { periodo: 24.9, notas: [[0, 57], [0.9, 64]] },
    { periodo: 29.7, notas: [[0, 71], [1.6, 69]] },
    { periodo: 31.1, notas: [[0, 50]] },
    { periodo: 37.3, notas: [[0, 74], [2.1, 73]] },
    { periodo: 41.9, notas: [[0, 45], [0.7, 52]] },
  ];
  const t0 = ctx.currentTime + 0.3;
  const proximas = frases.map((f, i) => t0 + i * 2.7);
  return programador((desde) => {
    frases.forEach((f, i) => {
      if (proximas[i] < desde + 0.2) {
        for (const [d, m] of f.notas) nota(m, proximas[i] + d, m < 55 ? 0.22 : 0.3, 4.5);
        proximas[i] += f.periodo;
      }
    });
    return desde + 0.2;
  });
}

// «Himnos»: melodía con su armonía sencilla, lenta y suave; uno tras otro, en bucle
function himnos() {
  let i = Math.floor(Math.random() * HIMNOS.length);
  let t = ctx.currentTime + 0.5;
  let cola = [];
  const preparar = () => {
    const h = HIMNOS[i % HIMNOS.length];
    amb.himno = h.titulo;
    cola = h.eventos.map((e) => ({ ...e, cuando: t + e.t * h.segundosPorTiempo }));
    t += h.total * h.segundosPorTiempo + 5;
    i++;
  };
  preparar();
  const parar = programador((desde) => {
    const limite = desde + 0.5;
    while (cola.length && cola[0].cuando < limite) {
      const e = cola.shift();
      nota(e.midi, e.cuando, e.fuerza, e.duracion);
    }
    if (!cola.length && t - desde < 6) preparar();
    return limite;
  });
  return () => { parar(); amb.himno = ''; };
}

// «Aurora»: acordes largos de cuatro voces que se funden (Re mayor 9, Si menor 7, Sol mayor 7, La sus)
function aurora() {
  const acordes = [[50, 57, 64, 66, 69], [47, 54, 62, 64, 69], [43, 50, 59, 62, 66], [45, 52, 57, 62, 64]];
  const voces = [];
  const lp = filtro('lowpass', 900, 0.5);
  const oscLp = lfo(0.05, 350, lp.frequency);
  lp.connect(musicaBus);
  let k = 0;
  const cambiar = (cuando) => {
    for (const v of voces.splice(0)) {
      v.g.gain.setTargetAtTime(0, cuando, 2.5);
      v.o.forEach((o) => o.stop(cuando + 12));
    }
    for (const m of acordes[k % acordes.length]) {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, cuando);
      g.gain.setTargetAtTime(0.045, cuando, 2.5);
      const f = 440 * Math.pow(2, (m - 69) / 12);
      const o = [-6, 0, 7].map((cents) => {
        const x = ctx.createOscillator();
        x.type = cents ? 'sawtooth' : 'triangle';
        x.frequency.value = f;
        x.detune.value = cents;
        x.connect(g);
        x.start(cuando);
        return x;
      });
      g.connect(lp);
      voces.push({ g, o });
    }
    k++;
  };
  let proximo = ctx.currentTime + 0.2;
  const parar = programador((desde) => {
    if (proximo < desde + 0.2) { cambiar(proximo); proximo += 16; }
    return desde + 0.2;
  });
  return () => {
    parar();
    const ahora = ctx.currentTime;
    for (const v of voces) { v.g.gain.setTargetAtTime(0, ahora, 0.6); v.o.forEach((o) => o.stop(ahora + 4)); }
    oscLp.stop(ahora + 4);
  };
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

function aplicarVolumenMusica() {
  if (!ctx) return;
  const p = preferencias();
  const vol = p.volumen * (voz.activa ? 0.25 : 1); // la música baja mientras la app lee en voz alta
  musicaBus.gain.setTargetAtTime(vol, ctx.currentTime, 0.4);
}

async function ponerMusica(cual) {
  musica?.();
  musica = null;
  if (!cual || !amb.sonando) return;
  if (cual !== 'aurora') {
    amb.cargando = true;
    try { await cargarPiano(); } finally { amb.cargando = false; }
    if (!amb.sonando || preferencias().musica !== cual) return;
  }
  musica = cual === 'quietud' ? quietud() : cual === 'himnos' ? himnos() : aurora();
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
export async function reproducir() {
  contexto();
  await ctx.resume();
  amb.sonando = true;
  salida.gain.cancelScheduledValues(ctx.currentTime);
  salida.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
  aplicarVolumenMusica();
  aplicarCapas();
  programarFin();
  await ponerMusica(preferencias().musica);
}

// Se apaga con un fundido de unos segundos, no de golpe
export function pausar() {
  if (!ctx || !amb.sonando) return;
  amb.sonando = false;
  clearInterval(reloj);
  amb.restante = 0;
  salida.gain.setTargetAtTime(0, ctx.currentTime, 1.2);
  setTimeout(() => {
    if (amb.sonando) return;
    musica?.();
    musica = null;
    aplicarCapas();
  }, 5000);
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
