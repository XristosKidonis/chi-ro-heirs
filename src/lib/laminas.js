// Láminas: fondos de pantalla y diseños para compartir, dibujados en un canvas.
// Todo se hace con Canvas 2D sin filtros CSS (WebKit en Mac no los aplica al canvas):
// el desenfoque, el aerosol y el blanco y negro se calculan a mano.
import { grabado } from './grabados.js';
import { normalizar } from './libros.js';

export const FORMATOS = {
  post: { w: 1080, h: 1350 },        // Instagram 4:5
  historia: { w: 1080, h: 1920 },    // historias y reels 9:16
  celular: { w: 1179, h: 2556 },     // fondo de pantalla del celular
  escritorio: { w: 2560, h: 1600 },  // fondo de pantalla de la computadora
};

export const ESTILOS = ['portadilla', 'ultramar', 'aura', 'aerosol', 'pedreria', 'primario', 'riso', 'calor'];
// acabados con variantes de color
export const VARIANTES = { riso: ['amarillo', 'verde'] };
const RISO = { amarillo: '#f2df45', verde: '#b6ee5a' };

const F = {
  bodoni: '"Bodoni Moda", Didot, serif',
  pinyon: '"Pinyon Script", cursive',
  grot: '"Inter Tight", "Helvetica Neue", Arial, sans-serif',
  literata: 'Literata, Georgia, serif',
  ui: 'Archivo, Arial, sans-serif',
  cond: '"Archivo Condensada", Archivo, "Arial Narrow", sans-serif',
  fraunces: 'Fraunces, Georgia, serif',
};

export async function cargarFuentes() {
  const f = [`300 80px ${F.grot}`, `400 80px ${F.grot}`, `900 80px ${F.grot}`, `400 80px ${F.bodoni}`,
    `400 80px ${F.pinyon}`, `400 40px ${F.literata}`, `600 20px ${F.ui}`, `800 80px ${F.grot}`,
    `900 extra-condensed 80px ${F.cond}`, `800 extra-condensed 80px ${F.cond}`, `900 80px ${F.fraunces}`];
  await Promise.all(f.map((x) => document.fonts.load(x).catch(() => {})));
}

// ---------- utilidades ----------
const lienzo = (w, h) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};
const espaciado = (ctx, px) => { if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`; };
const limpiar = (w) => normalizar(w).replace(/[^a-z0-9]/g, '');

export function palabraClave(texto, clave) {
  const ws = texto.split(/\s+/).filter(Boolean);
  if (clave) {
    const k = limpiar(clave);
    const w = ws.find((x) => { const n = limpiar(x); return n === k || (k.length >= 5 && n.startsWith(k)); });
    if (w) return w.replace(/[^\p{L}]/gu, '');
  }
  return ws.map((x) => x.replace(/[^\p{L}]/gu, '')).sort((a, b) => b.length - a.length)[0] || '';
}
const esClave = (w, clave) => clave && limpiar(w) === limpiar(clave);

// Reparte palabras en líneas que no pasen de «ancho». medir(palabra) da su ancho.
function envolver(palabras, ancho, medir, espacio) {
  const lineas = [];
  let actual = [];
  let w = 0;
  for (const p of palabras) {
    const pw = medir(p);
    if (actual.length && w + espacio + pw > ancho) { lineas.push(actual); actual = [p]; w = pw; }
    else { w += (actual.length ? espacio : 0) + pw; actual.push(p); }
  }
  if (actual.length) lineas.push(actual);
  return lineas;
}

// Busca el tamaño más grande con el que el texto cabe en la caja.
// fuente(tam, palabra) devuelve la fuente de cada palabra; trk es el espaciado en em.
function ajustar(ctx, palabras, { ancho, alto, max, min = 18, lh = 1, fuente, trk = 0 }) {
  for (let tam = max; tam >= min; tam *= 0.96) {
    const medir = (p) => { ctx.font = fuente(tam, p); espaciado(ctx, trk * tam); return ctx.measureText(p).width; };
    ctx.font = fuente(tam, ''); espaciado(ctx, trk * tam);
    const espacio = ctx.measureText(' ').width + Math.max(0, -trk) * tam * 0.6;
    const lineas = envolver(palabras, ancho, medir, espacio);
    const anchoMax = Math.max(...lineas.map((l) => l.reduce((s, p) => s + medir(p), 0) + espacio * (l.length - 1)));
    if (lineas.length * tam * lh <= alto && anchoMax <= ancho * 1.001) return { tam, lineas, medir, espacio };
  }
  const tam = min;
  const medir = (p) => { ctx.font = fuente(tam, p); espaciado(ctx, trk * tam); return ctx.measureText(p).width; };
  ctx.font = fuente(tam, '');
  return { tam, lineas: envolver(palabras, ancho, medir, ctx.measureText(' ').width), medir, espacio: ctx.measureText(' ').width };
}

// Dibuja las líneas compuestas. alinear: 'izq' | 'centro'; color(p) devuelve el color de cada palabra.
function escribir(ctx, comp, { x, y, ancho, lh, alinear = 'izq', fuente, color, trk = 0 }) {
  const { tam, lineas, medir, espacio } = comp;
  ctx.textBaseline = 'alphabetic';
  lineas.forEach((l, i) => {
    const total = l.reduce((s, p) => s + medir(p), 0) + espacio * (l.length - 1);
    let cx = alinear === 'centro' ? x + (ancho - total) / 2 : x;
    const cy = y + tam * lh * i + tam * 0.8;
    for (const p of l) {
      ctx.font = fuente(tam, p);
      espaciado(ctx, trk * tam);
      ctx.fillStyle = color(p);
      ctx.fillText(p, cx, cy);
      cx += medir(p) + espacio;
    }
  });
  espaciado(ctx, 0);
  return lineas.length * tam * lh;
}

let ruido;
function grano(ctx, W, H, alfa, modo = 'overlay') {
  if (!ruido) {
    ruido = lienzo(256, 256);
    const g = ruido.getContext('2d');
    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.globalCompositeOperation = modo;
  ctx.fillStyle = ctx.createPattern(ruido, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Desenfoque barato que funciona en todos los navegadores: reducir a mitades y volver a ampliar.
function difuminar(fuente, radio) {
  const w = fuente.width;
  const h = fuente.height;
  let actual = fuente;
  let k = 1;
  while (k * 2 <= radio) {
    const c = lienzo(actual.width / 2, actual.height / 2);
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(actual, 0, 0, c.width, c.height);
    actual = c;
    k *= 2;
  }
  const out = lienzo(w, h);
  const o = out.getContext('2d');
  o.imageSmoothingQuality = 'high';
  o.drawImage(actual, 0, 0, w, h);
  return out;
}

// Difumina una forma y la convierte en puntos, como pintura en aerosol o un halo de fotocopia.
function aerosol(fuente, radio, densidad = 1, curva = 1.3) {
  const w = fuente.width;
  const h = fuente.height;
  const out = difuminar(fuente, radio);
  const o = out.getContext('2d');
  const img = o.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 3; i < d.length; i += 4) {
    if (!d[i]) continue;
    const a = d[i] / 255;
    d[i] = Math.random() < Math.pow(a, curva) * densidad ? 255 : 0;
  }
  o.putImageData(img, 0, 0);
  return out;
}

// Grano de risografía: el borde se corre un poco (desenfoque y umbral con ruido) y por dentro
// la tinta deja huecos en puntos de unos 2 px, como el tambor de una Riso.
function granoRiso(fuente, punto = 2, huecos = 0.12, corrimiento = true) {
  const w = fuente.width;
  const h = fuente.height;
  const blando = corrimiento ? difuminar(fuente, Math.max(2, punto * 1.6)) : fuente;
  const g = blando.getContext('2d');
  const img = g.getImageData(0, 0, w, h);
  const base = fuente.getContext('2d').getImageData(0, 0, w, h).data;
  const d = img.data;
  const p = Math.max(1, Math.round(punto));
  const cols = Math.ceil(w / p);
  const azar = new Float32Array(cols * Math.ceil(h / p));
  for (let i = 0; i < azar.length; i++) azar[i] = Math.random();
  for (let y = 0; y < h; y++) {
    const fila = Math.floor(y / p) * cols;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = d[i + 3] / 255;
      if (!a) continue;
      const r = azar[fila + Math.floor(x / p)];
      const dentro = a > 0.9;
      const on = dentro ? r > huecos : a > 0.5 + (r - 0.5) * 0.55;
      d[i] = base[i] || d[i]; d[i + 1] = base[i + 1] || d[i + 1]; d[i + 2] = base[i + 2] || d[i + 2];
      d[i + 3] = on ? 255 : 0;
    }
  }
  g.putImageData(img, 0, 0);
  return blando;
}

// Imagen a blanco y negro con contraste, recortada para cubrir la caja.
function laminaBN(ctx, img, x, y, w, h, { contraste = 1.35, brillo = 0.86, foco = 0.35 } = {}) {
  const r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / r;
  const sh = h / r;
  const c = lienzo(w, h);
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) * foco, sw, sh, 0, 0, c.width, c.height);
  const datos = g.getImageData(0, 0, c.width, c.height);
  const d = datos.data;
  for (let i = 0; i < d.length; i += 4) {
    let v = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255;
    v = Math.min(1, Math.max(0, ((v - 0.5) * contraste + 0.5) * brillo));
    d[i] = d[i + 1] = d[i + 2] = v * 255;
  }
  g.putImageData(datos, 0, 0);
  ctx.drawImage(c, x, y);
}

export function cargarImagen(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

function firma(ctx, x, y, color, s, alinear = 'left') {
  ctx.save();
  ctx.font = `600 ${17 * s}px ${F.ui}`;
  espaciado(ctx, 5 * s);
  ctx.fillStyle = color;
  ctx.textAlign = alinear;
  ctx.fillText('CHI-RO HEIRS', x, y);
  ctx.restore();
}

function etiqueta(ctx, texto, x, y, color, s, alinear = 'left') {
  ctx.save();
  ctx.font = `600 ${17 * s}px ${F.ui}`;
  espaciado(ctx, 5 * s);
  ctx.fillStyle = color;
  ctx.textAlign = alinear;
  ctx.fillText(texto.toUpperCase(), x, y);
  ctx.restore();
}

// Zona segura donde va el texto según el formato (deja libre el reloj del celular y los botones de las redes)
function zona(W, H, formato) {
  const m = Math.min(W, H) * 0.085;
  if (formato === 'escritorio') return { x: W * 0.52, y: H * 0.2, w: W * 0.4, h: H * 0.6, m };
  if (formato === 'celular') return { x: m, y: H * 0.34, w: W - 2 * m, h: H * 0.42, m, pie: H * 0.86 };
  if (formato === 'historia') return { x: m, y: H * 0.22, w: W - 2 * m, h: H * 0.5, m, pie: H * 0.82 };
  return { x: m, y: H * 0.18, w: W - 2 * m, h: H * 0.56, m, pie: H - m };
}

// Archivo extra condensada; si el navegador no sabe elegir el ancho, se comprime a mano.
let estrechaNativa = null;
function condensada(ctx, peso = 900, ancho = 'extra-condensed') {
  if (estrechaNativa === null) {
    ctx.font = `900 100px ${F.cond}`;
    const a = ctx.measureText('MMMM').width;
    ctx.font = `900 extra-condensed 100px ${F.cond}`;
    estrechaNativa = ctx.measureText('MMMM').width < a * 0.9;
  }
  return {
    k: estrechaNativa ? 1 : ancho === 'condensed' ? 0.8 : 0.66,
    fuente: (t) => (estrechaNativa ? `${peso} ${ancho} ${t}px ${F.cond}` : `${peso} ${t}px ${F.cond}`),
  };
}
function pintarX(ctx, texto, x, y, k) {
  if (k === 1) return ctx.fillText(texto, x, y);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, 1);
  ctx.fillText(texto, 0, 0);
  ctx.restore();
}

// Para los acabados de cartel grande: si la frase es larga, se queda con la cláusula de la palabra clave.
export function fraseCorta(texto, clave, max = 8) {
  const ws = texto.split(/\s+/).filter(Boolean);
  if (ws.length <= max) return texto.trim();
  // cláusulas con su puntuación; se parte de la que tiene la palabra clave y se suman las siguientes mientras quepan
  const trozos = texto.split(/([,;:.!?¿¡—]+)/);
  const clausulas = [];
  for (let i = 0; i < trozos.length; i += 2) {
    const t = trozos[i].trim();
    if (t) clausulas.push({ t, sep: (trozos[i + 1] || '').trim(), n: t.split(/\s+/).length });
  }
  const k = clave ? limpiar(clave) : '';
  let i = clausulas.findIndex((c) => c.n >= 2 && k && c.t.split(/\s+/).some((w) => limpiar(w).startsWith(k)));
  if (i < 0) i = Math.max(0, clausulas.findIndex((c) => c.n >= 2));
  let p = clausulas[i].t;
  let n = clausulas[i].n;
  for (let j = i + 1; j < clausulas.length && n + clausulas[j].n <= max; j++) {
    p += `${clausulas[j - 1].sep} ${clausulas[j].t}`;
    n += clausulas[j].n;
  }
  const pw = p.split(/\s+/);
  if (pw.length > max) {
    const idx = Math.max(0, pw.findIndex((w) => k && limpiar(w).startsWith(k)));
    const ini = Math.max(0, Math.min(idx - Math.floor(max / 2), pw.length - max));
    p = pw.slice(ini, ini + max).join(' ');
  }
  return p;
}

// Reparte la frase en renglones parecidos y da a cada uno el tamaño que llena el ancho
// (las palabras cortas como «Y» o «EN» quedan más chicas, como en los carteles de pedrería).
function pila(ctx, texto, { ancho, alto, max, fuente, k = 1, lh = 0.92 }) {
  const ws = texto.split(/\s+/).filter(Boolean);
  const total = ws.join(' ').length;
  const n = Math.max(1, Math.min(6, Math.round(Math.sqrt(total / 3.2))));
  const meta = total / n;
  const lineas = [];
  let actual = [];
  for (const w of ws) {
    const largo = [...actual, w].join(' ').length;
    if (actual.length && largo > meta * 1.25) { lineas.push(actual.join(' ')); actual = [w]; }
    else actual.push(w);
  }
  if (actual.length) lineas.push(actual.join(' '));
  ctx.font = fuente(100);
  const base = lineas.map((l) => (ancho * 100) / (ctx.measureText(l).width * k));
  const mediana = [...base].sort((a, b) => a - b)[Math.floor(base.length / 2)];
  const largas = base.filter((_, i) => lineas[i].replace(/\s/g, '').length > 3);
  const referencia = largas.length ? Math.min(...largas) : mediana;
  let tams = lineas.map((l, i) => Math.min(max, base[i], l.replace(/\s/g, '').length <= 3 ? referencia * 0.62 : Infinity));
  const suma = tams.reduce((a, b) => a + b * lh, 0);
  if (suma > alto) tams = tams.map((t) => (t * alto) / suma);
  return lineas.map((l, i) => ({ texto: l, tam: tams[i] }));
}

// ---------- acabados ----------
const DIBUJAR = {
  // Lámina de Doré (o la imagen del usuario) y el versículo en grotesca fina encima
  async portadilla(ctx, o) {
    const { W, H, s, formato } = o;
    ctx.fillStyle = '#0b0a09';
    ctx.fillRect(0, 0, W, H);
    const horizontal = formato === 'escritorio';
    const img = o.imagen ? await cargarImagen(o.imagen).catch(() => null) : null;
    const caja = horizontal ? { x: 0, y: 0, w: W * 0.5, h: H } : { x: 0, y: 0, w: W, h: H };
    if (img) laminaBN(ctx, img, caja.x, caja.y, caja.w, caja.h, { foco: 0.3, contraste: 1.75, brillo: 0.8 });
    const g = horizontal ? ctx.createLinearGradient(caja.w * 0.55, 0, caja.w, 0) : ctx.createLinearGradient(0, H * 0.35, 0, H);
    g.addColorStop(0, 'rgba(8,7,6,0)');
    g.addColorStop(1, 'rgba(8,7,6,0.72)');
    ctx.fillStyle = g;
    ctx.fillRect(caja.x, caja.y, caja.w, caja.h);
    const arriba = ctx.createLinearGradient(0, 0, 0, H * 0.18);
    arriba.addColorStop(0, 'rgba(8,7,6,0.55)');
    arriba.addColorStop(1, 'rgba(8,7,6,0)');
    ctx.fillStyle = arriba;
    ctx.fillRect(0, 0, W, H * 0.18);
    grano(ctx, W, H, 0.22);

    // la frase en grotesca fina, enorme, que se recorta contra el borde inferior
    const m = Math.min(W, H) * 0.075;
    const frase = fraseCorta(o.texto, o.clave, 5).toUpperCase().replace(/[.,;:]+$/, '');
    const fuente = (t) => `300 ${t}px ${F.grot}`;
    const ancho = horizontal ? W * 0.44 : W - m * 0.6;
    const x0 = horizontal ? W * 0.53 : m * 0.3;
    const comp = ajustar(ctx, frase.split(/\s+/), { ancho, alto: horizontal ? H * 0.62 : H * 0.6, max: 320 * s, min: 40 * s, lh: 0.86, fuente, trk: -0.06 });
    const alto = comp.lineas.length * comp.tam * 0.86;
    const y0 = horizontal ? (H - alto) / 2 : H - alto + comp.tam * 0.16;
    escribir(ctx, comp, { x: x0, y: y0, ancho, lh: 0.86, fuente, trk: -0.06, color: () => 'rgba(238,235,229,0.9)' });
    firma(ctx, m, m + 10 * s, 'rgba(241,238,232,0.85)', s);
    ctx.font = `400 ${58 * s}px ${F.pinyon}`;
    ctx.fillStyle = '#f1eee8';
    const yRef = formato === 'celular' ? H * 0.3 : m + 86 * s;
    ctx.fillText(o.referencia, m, yRef);
    etiqueta(ctx, o.version, m, yRef + 44 * s, 'rgba(241,238,232,0.62)', s);
    if (o.credito) etiqueta(ctx, o.credito, W - m, m + 10 * s, 'rgba(241,238,232,0.5)', s * 0.8, 'right');
  },

  // Tono sobre tono: azul ultramar y el versículo en un azul apenas más claro
  ultramar(ctx, o) {
    const { W, H, s, formato } = o;
    const fondo = '#1238e6';
    const tinta = '#5a78f4';
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, W, H);
    const z = zona(W, H, formato);
    const ancho = formato === 'escritorio' ? W * 0.5 : W * 0.7;
    const altoMax = formato === 'escritorio' ? H * 0.34 : H * 0.3;
    const fuente = (t) => `400 ${t}px ${F.grot}`;
    const frase = fraseCorta(o.texto, o.clave, 6).toUpperCase().replace(/[.,;:]+$/, '');
    const comp = ajustar(ctx, frase.split(/\s+/), { ancho, alto: altoMax, max: 150 * s, min: 26 * s, lh: 0.9, fuente, trk: -0.075 });
    const alto = comp.lineas.length * comp.tam * 0.9;
    const cy = formato === 'celular' ? H * 0.56 : formato === 'historia' ? H * 0.47 : H * 0.5;
    escribir(ctx, comp, { x: (W - ancho) / 2, y: cy - alto / 2, ancho, lh: 0.9, alinear: 'centro', fuente, trk: -0.075, color: () => tinta });
    const pie = formato === 'escritorio' ? H * 0.9 : z.pie || H - z.m;
    etiqueta(ctx, `${o.referencia} · ${o.version}`, W / 2, pie, tinta, s, 'center');
    firma(ctx, W / 2, formato === 'celular' ? H * 0.3 : z.m + 10 * s, tinta, s, 'center');
    grano(ctx, W, H, 0.05, 'soft-light');
  },

  // Aura: como una fotocopia desenfocada que brilla. Grotesca condensada negrísima en blanco sobre negro,
  // renglones apretados que llenan el ancho, todo fuera de foco y con grano, y un halo suave alrededor.
  aura(ctx, o) {
    const { W, H, s, formato } = o;
    ctx.fillStyle = '#030303';
    ctx.fillRect(0, 0, W, H);
    const { k, fuente } = condensada(ctx, 900, 'condensed');
    const horizontal = formato === 'escritorio';
    const ancho = horizontal ? W * 0.52 : W * 0.8;
    const altoMax = horizontal ? H * 0.7 : formato === 'post' ? H * 0.74 : H * 0.48;
    const renglones = pila(ctx, fraseCorta(o.texto, o.clave, 6).toUpperCase().replace(/[.,;:]+$/, ''), { ancho, alto: altoMax, max: 520 * s, fuente, k, lh: 0.86 });
    const alto = renglones.reduce((a, r) => a + r.tam * 0.86, 0);
    const capa = lienzo(W, H);
    const c = capa.getContext('2d');
    c.fillStyle = '#fff';
    let y = (formato === 'celular' ? H * 0.55 : H * 0.5) - alto / 2;
    for (const r of renglones) {
      c.font = fuente(r.tam);
      const w = c.measureText(r.texto).width * k;
      pintarX(c, r.texto, (W - w) / 2, y + r.tam * 0.79, k);
      y += r.tam * 0.86;
    }
    const tam = Math.min(...renglones.map((r) => r.tam));
    // fuera de foco: la letra se difumina y el umbral con ruido le da el borde de fotocopia
    const foco = difuminar(capa, tam * 0.09).getContext('2d').getImageData(0, 0, W, H).data;
    const halo = difuminar(capa, tam * 0.32).getContext('2d').getImageData(0, 0, W, H).data;
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const f = foco[i + 3] / 255;
      const h = halo[i + 3] / 255;
      if (h < 0.01 && f < 0.01) continue;
      const r = Math.random();
      let v = 0;
      if (f > 0.5 + (r - 0.5) * 0.7) v = 235 + Math.random() * 20;
      else if (Math.random() < Math.pow(h, 1.3) * 0.7) v = 120 + Math.random() * 110;
      if (v) d[i] = d[i + 1] = d[i + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
    const m = Math.min(W, H) * 0.05;
    etiqueta(ctx, `${o.referencia} · ${o.version}`, W / 2, formato === 'celular' ? H * 0.86 : H - m, 'rgba(255,255,255,0.35)', s * 0.85, 'center');
    grano(ctx, W, H, 0.24);
  },

  // El versículo impreso en mayúsculas justificadas y la palabra clave a mano, en aerosol rojo
  aerosol(ctx, o) {
    const { W, H, s, formato } = o;
    ctx.fillStyle = '#f3f1ec';
    ctx.fillRect(0, 0, W, H);
    const ancho = formato === 'escritorio' ? W * 0.5 : W * 0.8;
    const altoMax = formato === 'escritorio' ? H * 0.42 : H * (formato === 'post' ? 0.44 : 0.32);
    const fuente = (t) => `400 ${t}px ${F.literata}`;
    const comp = ajustar(ctx, o.texto.toUpperCase().replace(/[«»"“”]/g, '').split(/\s+/), { ancho, alto: altoMax, max: 44 * s, min: 16 * s, lh: 1.3, fuente, trk: 0.03 });
    const alto = comp.lineas.length * comp.tam * 1.3;
    const cy = formato === 'celular' ? H * 0.56 : H * 0.48;
    const x0 = (W - ancho) / 2;
    const y0 = cy - alto / 2;
    // justificado: reparte el espacio que sobra entre las palabras (menos en la última línea)
    ctx.fillStyle = '#161616';
    comp.lineas.forEach((l, i) => {
      ctx.font = fuente(comp.tam);
      espaciado(ctx, 0.03 * comp.tam);
      const anchos = l.map((p) => ctx.measureText(p).width);
      const total = anchos.reduce((a, b) => a + b, 0);
      const ultima = i === comp.lineas.length - 1;
      const hueco = l.length > 1 && !ultima ? (ancho - total) / (l.length - 1) : comp.espacio;
      let x = ultima ? x0 + (ancho - total - hueco * (l.length - 1)) / 2 : x0;
      const y = y0 + comp.tam * 1.3 * i + comp.tam;
      l.forEach((p, j) => { ctx.fillText(p, x, y); x += anchos[j] + hueco; });
    });
    espaciado(ctx, 0);
    // palabra a mano
    const pal = palabraClave(o.texto, o.clave);
    const palabra = pal.charAt(0).toUpperCase() + pal.slice(1).toLowerCase();
    const capa = lienzo(W, H);
    const c = capa.getContext('2d');
    let tam = 400 * s;
    c.font = `400 ${tam}px ${F.pinyon}`;
    const w0 = c.measureText(palabra).width || 1;
    tam = Math.min(tam * (W * (formato === 'escritorio' ? 0.56 : 0.86)) / w0, H * 0.3);
    c.font = `400 ${tam}px ${F.pinyon}`;
    c.translate(W / 2, cy + tam * 0.18);
    c.rotate(-0.12);
    c.textAlign = 'center';
    c.fillStyle = '#e0261c';
    c.strokeStyle = '#e0261c';
    c.lineWidth = tam * 0.014;
    c.lineJoin = 'round';
    c.strokeText(palabra, 0, 0);
    c.fillText(palabra, 0, 0);
    ctx.drawImage(aerosol(capa, tam * 0.1, 0.9, 1.6), 0, 0);
    ctx.drawImage(aerosol(capa, tam * 0.04, 0.95, 1.2), 0, 0);
    ctx.globalAlpha = 0.85;
    ctx.drawImage(aerosol(capa, tam * 0.015, 0.9, 1), 0, 0);
    ctx.globalAlpha = 1;
    const pie = formato === 'escritorio' ? H * 0.9 : (formato === 'post' ? H - Math.min(W, H) * 0.085 : H * 0.84);
    etiqueta(ctx, `${o.referencia} · ${o.version}`, W / 2, pie, '#55524d', s, 'center');
    firma(ctx, W / 2, formato === 'celular' ? H * 0.3 : Math.min(W, H) * 0.095, '#55524d', s, 'center');
    grano(ctx, W, H, 0.1, 'multiply');
  },

  // Pedrería: como una remera de strass. Grotesca condensada muy negra, renglones que llenan el ancho
  // casi tocándose, y cada trazo relleno de piedritas blancas en filas apretadas, con brillo y leve desorden.
  pedreria(ctx, o) {
    const { W, H, s, formato } = o;
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);
    const { k, fuente } = condensada(ctx, 900, 'condensed');
    const horizontal = formato === 'escritorio';
    const ancho = horizontal ? W * 0.6 : W * 0.88;
    const altoMax = horizontal ? H * 0.72 : formato === 'post' ? H * 0.8 : H * 0.5;
    const renglones = pila(ctx, fraseCorta(o.texto, o.clave, 7).toUpperCase().replace(/[.,;:]+$/, ''), { ancho, alto: altoMax, max: 520 * s, fuente, k, lh: 0.9 });
    const alto = renglones.reduce((a, r) => a + r.tam * 0.9, 0);
    const capa = lienzo(W, H);
    const c = capa.getContext('2d');
    c.fillStyle = '#fff';
    let y = (formato === 'celular' ? H * 0.55 : H * 0.5) - alto / 2;
    for (const r of renglones) {
      c.font = fuente(r.tam);
      const w = c.measureText(r.texto).width * k;
      pintarX(c, r.texto, (W - w) / 2, y + r.tam * 0.8, k);
      y += r.tam * 0.9;
    }
    // la piedra: un círculo blanco con borde gris y un brillo arriba a la izquierda
    const paso = Math.max(4 * s, Math.min(...renglones.map((r) => r.tam)) / 21);
    const piedra = lienzo(paso * 2, paso * 2);
    const pc = piedra.getContext('2d');
    const g = pc.createRadialGradient(paso * 0.82, paso * 0.78, paso * 0.04, paso, paso, paso * 0.44);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, '#f6f6f6');
    g.addColorStop(0.85, '#d8d8d8');
    g.addColorStop(1, '#9a9a9a');
    pc.fillStyle = g;
    pc.beginPath();
    pc.arc(paso, paso, paso * 0.43, 0, Math.PI * 2);
    pc.fill();
    const datos = c.getImageData(0, 0, W, H).data;
    const dentro = (px, py) => {
      const x = Math.round(px);
      const yy = Math.round(py);
      return x >= 0 && yy >= 0 && x < W && yy < H && datos[(yy * W + x) * 4 + 3] > 110;
    };
    for (let py = paso / 2; py < H; py += paso) {
      for (let px = paso / 2; px < W; px += paso) {
        if (!dentro(px, py)) continue;
        const jx = (Math.random() - 0.5) * paso * 0.14;
        const jy = (Math.random() - 0.5) * paso * 0.14;
        ctx.globalAlpha = 0.9 + Math.random() * 0.1;
        ctx.drawImage(piedra, px - paso + jx, py - paso + jy);
      }
    }
    ctx.globalAlpha = 1;
    const m = Math.min(W, H) * 0.05;
    etiqueta(ctx, `${o.referencia} · ${o.version}`, W / 2, formato === 'celular' ? H * 0.86 : H - m, 'rgba(255,255,255,0.4)', s * 0.85, 'center');
  },

  // Primario: amarillo limón plano, grotesca negrita en mayúsculas abajo, justificada a los dos lados
  // (aunque queden huecos grandes, como en el original), la palabra clave en rojo y la última en azul.
  primario(ctx, o) {
    const { W, H, s, formato } = o;
    ctx.fillStyle = '#fff200';
    ctx.fillRect(0, 0, W, H);
    const horizontal = formato === 'escritorio';
    const ancho = horizontal ? W * 0.46 : W * 0.78;
    const x0 = horizontal ? W * 0.46 : (W - ancho) / 2;
    const altoMax = horizontal ? H * 0.34 : formato === 'post' ? H * 0.3 : H * 0.24;
    const fuente = (t) => `800 ${t}px ${F.grot}`;
    const frase = fraseCorta(o.texto, o.clave, 14).toUpperCase();
    const palabras = frase.split(/\s+/);
    const clave = palabraClave(o.texto, o.clave);
    const ultima = palabras.at(-1);
    const azul = !esClave(ultima, clave) && palabras.length > 2 ? ultima : null;
    let comp = ajustar(ctx, palabras, { ancho, alto: altoMax, max: 84 * s, min: 22 * s, lh: 0.96, fuente, trk: -0.012 });
    for (let i = 0; i < 8 && comp.lineas.length > 1 && comp.lineas.at(-1).length === 1 && comp.lineas.at(-1)[0] !== azul; i++) {
      comp = ajustar(ctx, palabras, { ancho, alto: altoMax, max: comp.tam * 0.95, min: 22 * s, lh: 0.96, fuente, trk: -0.012 });
    }
    const lh = comp.tam * 0.96;
    const fondo = formato === 'celular' ? H * 0.82 : formato === 'historia' ? H * 0.8 : H - Math.min(W, H) * 0.1;
    const y0 = fondo - comp.lineas.length * lh;
    ctx.font = fuente(comp.tam);
    espaciado(ctx, -0.012 * comp.tam);
    comp.lineas.forEach((l, i) => {
      const anchos = l.map((p) => ctx.measureText(p).width);
      const total = anchos.reduce((a, b) => a + b, 0);
      const esUltima = i === comp.lineas.length - 1;
      // justificado a los dos lados; la última línea va centrada
      const hueco = l.length > 1 && !esUltima ? Math.min((ancho - total) / (l.length - 1), comp.espacio * 9) : comp.espacio;
      const anchoLinea = total + hueco * (l.length - 1);
      let x = esUltima || l.length === 1 ? x0 + (ancho - anchoLinea) / 2 : x0;
      l.forEach((p, j) => {
        ctx.fillStyle = esClave(p, clave) ? '#e8231c' : p === azul && esUltima ? '#1f4fd6' : '#1c1c1c';
        ctx.fillText(p, x, y0 + lh * i + comp.tam * 0.8);
        x += anchos[j] + hueco;
      });
    });
    espaciado(ctx, 0);
    etiqueta(ctx, `${o.referencia} · ${o.version}`, x0 + ancho / 2, fondo + Math.max(46 * s, comp.tam * 0.7), 'rgba(28,28,28,0.55)', s * 0.85, 'center');
    grano(ctx, W, H, 0.05, 'multiply');
  },

  // Riso: como un carrusel impreso en risografía. Rótulo arriba, franjas de color del mismo ancho con la frase
  // condensada (todos los renglones al mismo cuerpo), la referencia a los costados de los renglones cortos
  // y abajo la referencia entre dos flechas en círculo. Tinta con grano y bordes que se corren.
  riso(ctx, o) {
    const { W, H, s, formato } = o;
    const color = RISO[o.tono] || RISO.amarillo;
    const tinta = '#262624';
    ctx.fillStyle = '#f7f5ec';
    ctx.fillRect(0, 0, W, H);
    const { k, fuente } = condensada(ctx);
    const rot = condensada(ctx, 800);
    const horizontal = formato === 'escritorio';
    const anchoFranja = horizontal ? W * 0.56 : W * 0.86;
    const cx = W / 2;
    // renglones parejos: dos o tres, todos al mismo cuerpo, el más largo llena la franja
    const frase = fraseCorta(o.texto, o.clave, 6).toUpperCase().replace(/[.,;:]+$/, '');
    const ws = frase.split(/\s+/);
    const n = ws.length <= 2 ? ws.length : ws.length <= 5 ? 2 : 3;
    const meta = frase.length / n;
    const lineas = [];
    let act = [];
    for (const w of ws) {
      if (act.length && [...act, w].join(' ').length > meta * 1.2 && lineas.length < n - 1) { lineas.push(act.join(' ')); act = [w]; }
      else act.push(w);
    }
    lineas.push(act.join(' '));
    const pad = 0.07;
    ctx.font = fuente(100);
    const masLarga = Math.max(...lineas.map((l) => ctx.measureText(l).width * k));
    let tam = (anchoFranja * (1 - pad * 2) * 100) / masLarga;
    const altoMax = horizontal ? H * 0.6 : formato === 'post' ? H * 0.5 : H * 0.36;
    tam = Math.min(tam, altoMax / (lineas.length * 1.06), 330 * s);
    const altoFranja = tam * 0.84;
    const sep = tam * 0.12;
    const alto = lineas.length * altoFranja + (lineas.length - 1) * sep;
    const y0 = (formato === 'celular' ? H * 0.56 : H * 0.5) - alto / 2;
    const x0 = cx - anchoFranja / 2;

    // capa amarilla, corrida unos píxeles respecto de la tinta, con su propio grano
    const capaColor = lienzo(W, H);
    const cc = capaColor.getContext('2d');
    cc.fillStyle = color;
    lineas.forEach((_, i) => cc.fillRect(x0 + 5 * s, y0 + i * (altoFranja + sep) - 4 * s, anchoFranja, altoFranja));
    ctx.drawImage(granoRiso(capaColor, 1.6 * s, 0.05), 0, 0);

    // capa negra (renglones grandes) y capa fina (rótulo, costados y pie), cada una con su grano
    const capaTinta = lienzo(W, H);
    const t = capaTinta.getContext('2d');
    t.fillStyle = tinta;
    t.textBaseline = 'alphabetic';
    const capaFina = lienzo(W, H);
    const f = capaFina.getContext('2d');
    f.fillStyle = tinta;
    f.strokeStyle = tinta;
    const rotulo = (o.rotulo || 'Para no olvidar:').toUpperCase();
    f.font = rot.fuente(Math.max(30 * s, tam * 0.16));
    pintarX(f, rotulo, cx - (f.measureText(rotulo).width * rot.k) / 2, y0 - tam * 0.16, rot.k);
    const [libro, cv] = (() => { const m = o.referencia.match(/^(.*?)\s+([\d:,\-–]+)$/); return m ? [m[1], m[2]] : [o.referencia, '']; })();
    lineas.forEach((l, i) => {
      t.font = fuente(tam);
      const w = t.measureText(l).width * k;
      const yb = y0 + i * (altoFranja + sep);
      pintarX(t, l, cx - w / 2, yb + tam * 0.78, k);
      // a los costados de un renglón corto, la referencia en dos pisos, como el «FOUR THINGS» de la referencia
      const hueco = (anchoFranja - w) / 2;
      const pisos = [libro.toUpperCase(), cv].filter(Boolean);
      f.font = rot.fuente(100);
      const anchoPiso = Math.max(...pisos.map((x) => f.measureText(x).width * rot.k)) / 100;
      const tc = Math.min(tam * 0.17, (hueco * 0.7) / anchoPiso);
      if (hueco > tam * 0.5 && tc > 14 * s) {
        f.font = rot.fuente(tc);
        for (const lado of [-1, 1]) {
          const xc = cx + lado * (w / 2 + hueco / 2);
          pisos.forEach((txt, j) => {
            const tw = f.measureText(txt).width * rot.k;
            pintarX(f, txt, xc - tw / 2, yb + altoFranja / 2 + (j - (pisos.length - 1) / 2) * tc * 1.02 + tc * 0.36, rot.k);
          });
        }
      }
    });
    // pie: (→) REFERENCIA · VERSIÓN (→)
    const pieY = y0 + alto + Math.max(70 * s, tam * 0.42);
    const tp = Math.max(30 * s, tam * 0.15);
    f.font = rot.fuente(tp);
    const txt = `${o.referencia} · ${o.version}`.toUpperCase();
    const tw = f.measureText(txt).width * rot.k;
    pintarX(f, txt, cx - tw / 2, pieY + tp * 0.36, rot.k);
    const r = tp * 0.62;
    f.lineWidth = Math.max(2.4 * s, tp * 0.09);
    f.lineCap = 'round';
    f.lineJoin = 'round';
    for (const xc of [cx - tw / 2 - r * 2, cx + tw / 2 + r * 2]) {
      f.beginPath(); f.arc(xc, pieY, r, 0, Math.PI * 2); f.stroke();
      f.beginPath(); f.moveTo(xc - r * 0.45, pieY); f.lineTo(xc + r * 0.45, pieY);
      f.moveTo(xc + r * 0.1, pieY - r * 0.35); f.lineTo(xc + r * 0.45, pieY); f.lineTo(xc + r * 0.1, pieY + r * 0.35); f.stroke();
    }
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(granoRiso(capaTinta, 1.6 * s, 0.1), 0, 0);
    ctx.drawImage(granoRiso(capaFina, 1, 0.05, false), 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    firma(ctx, cx, formato === 'celular' ? H * 0.3 : Math.min(W, H) * 0.06, '#7a776f', s, 'center');
    grano(ctx, W, H, 0.06, 'multiply');
  },

  // Calor: una palabra en serif suave y negra con halo térmico: núcleo oscuro con brillo verde por dentro,
  // una banda amarilla pegada a la letra y una naranja más ancha que se deshace en grano hacia afuera.
  calor(ctx, o) {
    const { W, H, s, formato } = o;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    const corta = o.texto.split(/\s+/).length <= 3 ? o.texto : palabraClave(o.texto, o.clave);
    const palabra = corta.toLowerCase().replace(/[.,;:!?¡¿«»"]/g, '');
    const capa = lienzo(W, H);
    const c = capa.getContext('2d');
    let tam = 300 * s;
    c.font = `900 ${tam}px ${F.fraunces}`;
    tam = Math.min(tam * ((formato === 'escritorio' ? W * 0.52 : W * 0.68) / (c.measureText(palabra).width || 1)), H * 0.2);
    c.font = `900 ${tam}px ${F.fraunces}`;
    espaciado(c, -0.02 * tam);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#000';
    const cy = formato === 'celular' ? H * 0.52 : H * 0.5;
    c.fillText(palabra, W / 2, cy);
    const a = (cv) => cv.getContext('2d').getImageData(0, 0, W, H).data;
    const b1 = a(difuminar(capa, tam * 0.05));
    const b2 = a(difuminar(capa, tam * 0.11));
    const b3 = a(difuminar(capa, tam * 0.3));
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    const pon = (i, r, g, b) => { d[i] = r; d[i + 1] = g; d[i + 2] = b; };
    const mezcla = (x, y, t) => Math.round(x + (y - x) * t);
    for (let i = 0; i < d.length; i += 4) {
      const n1 = b1[i + 3] / 255;
      const n2 = b2[i + 3] / 255;
      const n3 = b3[i + 3] / 255;
      if (n3 < 0.01) continue;
      // calor: alto en la letra, bajando hacia afuera; el ruido hace los bordes de grano
      const calor = Math.min(1, n1 * 0.62 + n2 * 0.38 + n3 * 0.42) + (Math.random() - 0.5) * 0.14;
      if (n1 > 0.62) {
        // núcleo: casi negro, con zonas verde amarillentas donde la letra se afina
        const brillo = Math.min(1, Math.max(0, (1 - n1) * 2.4 + (1 - n2) * 1.1 - Math.random() * 0.75));
        pon(i, mezcla(15, 205, brillo), mezcla(24, 222, brillo), mezcla(8, 64, brillo));
      } else if (calor > 0.4) {
        pon(i, 242, 238, 60);
      } else if (calor > 0.31) {
        const t = (calor - 0.31) / 0.09;
        pon(i, mezcla(255, 242, t), mezcla(118, 238, t), mezcla(46, 60, t));
      } else if (calor > 0.19) {
        pon(i, 255, 110, 44);
      } else if (Math.random() < Math.pow(calor / 0.19, 1.3)) {
        pon(i, 255, 126, 66);
      }
    }
    ctx.putImageData(img, 0, 0);
    const m = Math.min(W, H) * 0.06;
    etiqueta(ctx, `${o.referencia} · ${o.version}`, W / 2, formato === 'celular' ? H * 0.86 : H - m, '#8a867e', s * 0.9, 'center');
    grano(ctx, W, H, 0.05, 'multiply');
  },
};

// Dibuja una lámina en el canvas. o: { estilo, formato, tono, texto, clave, referencia, version, libro, imagen, escala }
export async function dibujarLamina(canvas, o) {
  const f = FORMATOS[o.formato] || FORMATOS.post;
  const escala = o.escala || 1;
  const W = Math.round(f.w * escala);
  const H = Math.round(f.h * escala);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const s = (Math.min(W, H) / 1080) * (o.formato === 'escritorio' ? 1.35 : 1);
  await cargarFuentes();
  const g = o.libro ? grabado(o.libro) : null;
  const datos = {
    ...o, W, H, s,
    texto: (o.texto || '').trim(),
    imagen: o.imagen || g?.src,
    credito: o.imagen ? '' : g ? `Gustave Doré · ${g.titulo}` : '',
  };
  ctx.save();
  await DIBUJAR[o.estilo in DIBUJAR ? o.estilo : 'portadilla'](ctx, datos);
  ctx.restore();
}
