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

export const ESTILOS = ['portadilla', 'cartel', 'ultramar', 'aura', 'aerosol', 'pedreria', 'primario', 'riso', 'calor'];
// acabados con variantes de color
export const VARIANTES = { cartel: ['cuero', 'papel', 'lacre'], riso: ['amarillo', 'verde'] };
const RISO = { amarillo: '#f2df45', verde: '#b6ee5a' };
export const TONOS = {
  cuero: { fondo: '#0d0c0b', tinta: '#efece6', acento: '#e55a50', grano: 0.1 },
  papel: { fondo: '#f7f6f2', tinta: '#0e0e0e', acento: '#b3201e', grano: 0.07 },
  lacre: { fondo: '#a51d1a', tinta: '#f7f3ec', acento: '#0e0e0e', grano: 0.12 },
};

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
function condensada(ctx, peso = 900) {
  if (estrechaNativa === null) {
    ctx.font = `900 100px ${F.cond}`;
    const a = ctx.measureText('MMMM').width;
    ctx.font = `900 extra-condensed 100px ${F.cond}`;
    estrechaNativa = ctx.measureText('MMMM').width < a * 0.9;
  }
  return {
    k: estrechaNativa ? 1 : 0.66,
    fuente: (t) => (estrechaNativa ? `${peso} extra-condensed ${t}px ${F.cond}` : `${peso} ${t}px ${F.cond}`),
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
  const partes = texto.split(/[,;:.!?¿¡—]+/).map((x) => x.trim()).filter((x) => x.split(/\s+/).length >= 2);
  const k = clave ? limpiar(clave) : '';
  let p = partes.find((x) => k && x.split(/\s+/).some((w) => limpiar(w).startsWith(k))) || partes[0] || texto;
  const pw = p.split(/\s+/);
  if (pw.length > max) {
    const i = Math.max(0, pw.findIndex((w) => k && limpiar(w).startsWith(k)));
    const ini = Math.max(0, Math.min(i - Math.floor(max / 2), pw.length - max));
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
  let tams = lineas.map((l, i) => Math.min(max, base[i], l.replace(/\s/g, '').length <= 3 ? mediana * 0.5 : Infinity));
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

  // Bodoni con la palabra clave en caligrafía roja, en Cuero, Papel o Lacre
  cartel(ctx, o) {
    const { W, H, s, formato } = o;
    const e = TONOS[o.tono] || TONOS.cuero;
    ctx.fillStyle = e.fondo;
    ctx.fillRect(0, 0, W, H);
    const z = zona(W, H, formato);
    const clave = palabraClave(o.texto, o.clave);
    const fuente = (t, p) => (esClave(p, clave) ? `400 ${t * 1.34}px ${F.pinyon}` : `400 ${t}px ${F.bodoni}`);
    const comp = ajustar(ctx, o.texto.split(/\s+/), { ancho: z.w, alto: z.h, max: 132 * s, min: 28 * s, lh: 1.08, fuente, trk: -0.012 });
    const alto = comp.lineas.length * comp.tam * 1.08;
    const y0 = formato === 'escritorio' ? (H - alto) / 2 - 60 * s : z.y + (z.h - alto) * 0.35;
    const x0 = formato === 'escritorio' ? W * 0.12 : z.x;
    const ancho = formato === 'escritorio' ? W * 0.62 : z.w;
    if (formato === 'escritorio') {
      const c2 = ajustar(ctx, o.texto.split(/\s+/), { ancho, alto: H * 0.56, max: 150 * s, min: 28 * s, lh: 1.08, fuente, trk: -0.012 });
      Object.assign(comp, c2);
    }
    const altoF = comp.lineas.length * comp.tam * 1.08;
    const yF = formato === 'escritorio' ? (H - altoF) / 2 - 60 * s : Math.max(z.y, (formato === 'celular' ? H * 0.58 : H * 0.5) - (altoF + 190 * s) / 2);
    escribir(ctx, comp, { x: x0, y: yF, ancho, lh: 1.08, fuente, trk: -0.012, color: (p) => (esClave(p, clave) ? e.acento : e.tinta) });
    const yr = yF + altoF + 110 * s;
    ctx.font = `400 ${84 * s}px ${F.pinyon}`;
    ctx.fillStyle = e.tinta;
    ctx.fillText(o.referencia, x0, yr);
    ctx.fillStyle = e.acento;
    ctx.fillRect(x0, yr + 34 * s, 80 * s, 4 * s);
    etiqueta(ctx, o.version, x0, yr + 84 * s, e.tinta, s);
    const pie = z.pie || H - z.m;
    firma(ctx, formato === 'escritorio' ? W * 0.12 : z.x, formato === 'escritorio' ? H * 0.1 : (formato === 'celular' ? H * 0.28 : z.m + 10 * s), e.tinta, s);
    if (formato !== 'escritorio') etiqueta(ctx, 'Toma y lee', W - z.m, pie, e.tinta, s * 0.9, 'right');
    grano(ctx, W, H, e.grano);
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

  // Grotesca negra con halo granulado, como una fotocopia que brilla; cada renglón llena el ancho
  aura(ctx, o) {
    const { W, H, s, formato } = o;
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);
    const z = zona(W, H, formato);
    const ancho = formato === 'escritorio' ? W * 0.5 : W * 0.84;
    const fuente = (t) => `900 ${t}px ${F.grot}`;
    const capa = lienzo(W, H);
    const c = capa.getContext('2d');
    espaciado(c, 0);
    const renglones = pila(c, fraseCorta(o.texto, o.clave, 6).toUpperCase().replace(/[.,;:]+$/, ''), { ancho, alto: formato === 'escritorio' ? H * 0.66 : formato === 'post' ? H * 0.66 : z.h * 1.05, max: 360 * s, fuente, lh: 0.9 });
    const alto = renglones.reduce((a, r) => a + r.tam * 0.9, 0);
    let y = (formato === 'celular' ? H * 0.56 : H * 0.5) - alto / 2;
    c.fillStyle = '#fff';
    for (const r of renglones) {
      c.font = fuente(r.tam);
      const w = c.measureText(r.texto).width;
      c.fillText(r.texto, (W - w) / 2, y + r.tam * 0.8);
      y += r.tam * 0.9;
    }
    const tam = Math.min(...renglones.map((r) => r.tam));
    ctx.globalAlpha = 0.45;
    ctx.drawImage(aerosol(capa, tam * 0.4, 0.85, 1.7), 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(aerosol(capa, tam * 0.12, 1.1, 0.9), 0, 0);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(aerosol(capa, tam * 0.035, 1, 0.6), 0, 0);
    ctx.globalAlpha = 1;
    const pie = formato === 'escritorio' ? H * 0.92 : z.pie || H - z.m;
    etiqueta(ctx, `${o.referencia} · ${o.version}`, W / 2, pie, 'rgba(255,255,255,0.6)', s, 'center');
    firma(ctx, W / 2, formato === 'celular' ? H * 0.3 : z.m + 10 * s, 'rgba(255,255,255,0.6)', s, 'center');
    grano(ctx, W, H, 0.22);
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

  // Pedrería: el texto hecho de piedritas brillantes sobre negro, cada renglón llenando el ancho
  pedreria(ctx, o) {
    const { W, H, s, formato } = o;
    ctx.fillStyle = '#060606';
    ctx.fillRect(0, 0, W, H);
    const z = zona(W, H, formato);
    const { k, fuente } = condensada(ctx);
    const ancho = formato === 'escritorio' ? W * 0.62 : W * 0.86;
    const altoMax = formato === 'escritorio' ? H * 0.6 : formato === 'post' ? H * 0.66 : z.h;
    const renglones = pila(ctx, fraseCorta(o.texto, o.clave, 7).toUpperCase(), { ancho, alto: altoMax, max: 420 * s, fuente, k, lh: 0.96 });
    const alto = renglones.reduce((a, r) => a + r.tam * 0.96, 0);
    const capa = lienzo(W, H);
    const c = capa.getContext('2d');
    c.fillStyle = '#fff';
    c.textBaseline = 'alphabetic';
    let y = (formato === 'celular' ? H * 0.56 : H * 0.48) - alto / 2;
    for (const r of renglones) {
      c.font = fuente(r.tam);
      const w = c.measureText(r.texto).width * k;
      pintarX(c, r.texto, (W - w) / 2, y + r.tam * 0.84, k);
      y += r.tam * 0.96;
    }
    // una piedra por celda de la cuadrícula donde hay letra
    const paso = Math.max(5 * s, Math.min(...renglones.map((r) => r.tam)) / 15);
    const piedra = lienzo(paso * 2, paso * 2);
    const pc = piedra.getContext('2d');
    const g = pc.createRadialGradient(paso * 0.75, paso * 0.7, paso * 0.05, paso, paso, paso * 0.46);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.55, '#e9e9e9');
    g.addColorStop(1, '#8d8d8d');
    pc.fillStyle = g;
    pc.beginPath();
    pc.arc(paso, paso, paso * 0.44, 0, Math.PI * 2);
    pc.fill();
    const datos = c.getImageData(0, 0, W, H).data;
    for (let py = paso / 2; py < H; py += paso) {
      for (let px = paso / 2; px < W; px += paso) {
        if (datos[(Math.round(py) * W + Math.round(px)) * 4 + 3] > 120) {
          ctx.globalAlpha = 0.82 + Math.random() * 0.18;
          ctx.drawImage(piedra, px - paso, py - paso);
        }
      }
    }
    ctx.globalAlpha = 1;
    // destellos en cuatro puntas sobre algunas piedras
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 18; i++) {
      let px, py, intentos = 0;
      do { px = Math.random() * W; py = Math.random() * H; intentos++; } while (datos[(Math.round(py) * W + Math.round(px)) * 4 + 3] < 120 && intentos < 400);
      if (intentos >= 400) break;
      const r = paso * (0.9 + Math.random() * 1.3);
      ctx.beginPath();
      ctx.moveTo(px, py - r); ctx.quadraticCurveTo(px, py, px + r, py); ctx.quadraticCurveTo(px, py, px, py + r);
      ctx.quadraticCurveTo(px, py, px - r, py); ctx.quadraticCurveTo(px, py, px, py - r);
      ctx.fill();
    }
    const pie = formato === 'escritorio' ? H * 0.92 : z.pie || H - z.m;
    etiqueta(ctx, `${o.referencia} · ${o.version}`, W / 2, pie, 'rgba(255,255,255,0.6)', s, 'center');
    firma(ctx, W / 2, formato === 'celular' ? H * 0.3 : z.m + 10 * s, 'rgba(255,255,255,0.6)', s, 'center');
  },

  // Primario: amarillo plano, grotesca negra justificada abajo y la palabra clave en rojo
  primario(ctx, o) {
    const { W, H, s, formato } = o;
    ctx.fillStyle = '#ffe500';
    ctx.fillRect(0, 0, W, H);
    const m = Math.min(W, H) * 0.075;
    const ancho = formato === 'escritorio' ? W * 0.56 : W - 2 * m;
    const x0 = formato === 'escritorio' ? W - m - ancho : m;
    const altoMax = formato === 'post' ? H * 0.36 : formato === 'escritorio' ? H * 0.42 : H * 0.3;
    const fuente = (t) => `800 ${t}px ${F.grot}`;
    const clave = palabraClave(o.texto, o.clave);
    let comp = ajustar(ctx, o.texto.toUpperCase().split(/\s+/), { ancho, alto: altoMax, max: 96 * s, min: 24 * s, lh: 0.98, fuente, trk: -0.01 });
    // sin viudas: una palabra sola en el último renglón se ve como un error
    for (let i = 0; i < 8 && comp.lineas.length > 1 && comp.lineas.at(-1).length === 1; i++) {
      comp = ajustar(ctx, o.texto.toUpperCase().split(/\s+/), { ancho, alto: altoMax, max: comp.tam * 0.95, min: 24 * s, lh: 0.98, fuente, trk: -0.01 });
    }
    const lh = comp.tam * 0.98;
    const fondo = formato === 'celular' ? H * 0.84 : formato === 'historia' ? H * 0.8 : H - m;
    const y0 = fondo - comp.lineas.length * lh;
    ctx.font = fuente(comp.tam);
    espaciado(ctx, -0.01 * comp.tam);
    comp.lineas.forEach((l, i) => {
      const anchos = l.map((p) => ctx.measureText(p).width);
      const total = anchos.reduce((a, b) => a + b, 0);
      const ultima = i === comp.lineas.length - 1;
      const justo = l.length > 1 && !ultima ? (ancho - total) / (l.length - 1) : comp.espacio;
      // justifica solo si el hueco no se vuelve un agujero; si no, alinea a la izquierda
      const hueco = justo > comp.espacio * 2.6 ? comp.espacio : justo;
      let x = x0;
      l.forEach((p, j) => {
        ctx.fillStyle = esClave(p, clave) ? '#e3241b' : '#141414';
        ctx.fillText(p, x, y0 + lh * i + comp.tam * 0.8);
        x += anchos[j] + hueco;
      });
    });
    espaciado(ctx, 0);
    etiqueta(ctx, `${o.referencia} · ${o.version}`, x0, formato === 'celular' ? H * 0.3 : m + 10 * s, '#1d4fd8', s);
    firma(ctx, formato === 'escritorio' ? W - m : W - m, formato === 'celular' ? H * 0.3 : m + 10 * s, '#141414', s, 'right');
    grano(ctx, W, H, 0.06, 'multiply');
  },

  // Riso: renglones condensados sobre franjas de color, con tinta que no llega a todo y un recuadro abajo
  riso(ctx, o) {
    const { W, H, s, formato } = o;
    const color = RISO[o.tono] || RISO.amarillo;
    ctx.fillStyle = '#f5f2e7';
    ctx.fillRect(0, 0, W, H);
    const { k, fuente } = condensada(ctx);
    const ancho = formato === 'escritorio' ? W * 0.62 : W * 0.8;
    const altoMax = formato === 'escritorio' ? H * 0.46 : formato === 'post' ? H * 0.46 : H * 0.34;
    const renglones = pila(ctx, fraseCorta(o.texto, o.clave, 6).toUpperCase(), { ancho, alto: altoMax, max: 300 * s, fuente, k, lh: 1.12 });
    const alto = renglones.reduce((a, r) => a + r.tam * 1.12, 0);
    const cx = W / 2;
    let y = (formato === 'celular' ? H * 0.56 : H * 0.5) - alto / 2;
    const rot = condensada(ctx, 800);
    // rótulo
    ctx.fillStyle = '#1b1b1b';
    ctx.font = rot.fuente(40 * s);
    const rotulo = (o.rotulo || 'Para no olvidar:').toUpperCase();
    pintarX(ctx, rotulo, cx - (ctx.measureText(rotulo).width * rot.k) / 2, y - 34 * s, rot.k);
    // franjas, con un leve corrimiento de registro respecto de la tinta
    const franjas = [];
    const tinta = lienzo(W, H);
    const t = tinta.getContext('2d');
    t.fillStyle = '#1b1b1b';
    const anchoFranja = Math.max(...renglones.map((r) => { t.font = fuente(r.tam); return t.measureText(r.texto).width * k + r.tam * 0.24; }));
    for (const r of renglones) {
      t.font = fuente(r.tam);
      const w = t.measureText(r.texto).width * k;
      franjas.push([cx - anchoFranja / 2 + 4 * s, y + r.tam * 0.06 - 3 * s, anchoFranja, r.tam * 0.98]);
      pintarX(t, r.texto, cx - w / 2, y + r.tam * 0.88, k);
      y += r.tam * 1.12;
    }
    ctx.fillStyle = color;
    for (const [fx, fy, fw, fh] of franjas) ctx.fillRect(fx, fy, fw, fh);
    // rayado diagonal fino sobre las franjas
    ctx.save();
    ctx.beginPath();
    for (const [fx, fy, fw, fh] of franjas) ctx.rect(fx, fy, fw, fh);
    ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    ctx.lineWidth = 1.4 * s;
    for (let d = -H; d < W; d += 6 * s) { ctx.beginPath(); ctx.moveTo(d, H); ctx.lineTo(d + H, 0); ctx.stroke(); }
    ctx.restore();
    // la tinta del riso no cubre del todo
    const img = t.getImageData(0, 0, W, H);
    for (let i = 3; i < img.data.length; i += 4) if (img.data[i] && Math.random() < 0.16) img.data[i] = 0;
    t.putImageData(img, 0, 0);
    ctx.drawImage(tinta, 0, 0);
    // recuadro con la referencia
    ctx.font = rot.fuente(46 * s);
    const necesita = (ctx.measureText(o.referencia.toUpperCase()).width + ctx.measureText(`${o.version} →`).width) * rot.k + 110 * s;
    const bw = Math.min(W - 2 * Math.min(W, H) * 0.06, Math.max(anchoFranja, necesita));
    const bh = 78 * s;
    const bx = cx - bw / 2;
    const by = y + 26 * s;
    ctx.strokeStyle = '#1b1b1b';
    ctx.lineWidth = 3 * s;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.font = rot.fuente(46 * s);
    const corte = bx + bw - ctx.measureText(`${o.version} →`).width * rot.k - 56 * s;
    ctx.beginPath(); ctx.moveTo(corte, by); ctx.lineTo(corte, by + bh); ctx.stroke();
    ctx.fillStyle = '#1b1b1b';
    ctx.font = rot.fuente(46 * s);
    pintarX(ctx, o.referencia.toUpperCase(), bx + 22 * s, by + bh * 0.68, rot.k);
    const v = `${o.version} →`;
    pintarX(ctx, v, corte + (bx + bw - corte - ctx.measureText(v).width * rot.k) / 2, by + bh * 0.68, rot.k);
    firma(ctx, cx, formato === 'celular' ? H * 0.3 : Math.min(W, H) * 0.095, '#55524d', s, 'center');
    grano(ctx, W, H, 0.14, 'multiply');
  },

  // Calor: una palabra (o frase muy corta) con halo térmico de grano, naranja y amarillo
  calor(ctx, o) {
    const { W, H, s, formato } = o;
    ctx.fillStyle = '#fbfaf6';
    ctx.fillRect(0, 0, W, H);
    const corta = o.texto.split(/\s+/).length <= 3 ? o.texto : palabraClave(o.texto, o.clave);
    const palabra = corta.toLowerCase().replace(/[.,;:!?¡¿«»"]/g, '');
    const capa = lienzo(W, H);
    const c = capa.getContext('2d');
    let tam = 300 * s;
    c.font = `900 ${tam}px ${F.fraunces}`;
    tam = Math.min(tam * ((formato === 'escritorio' ? W * 0.5 : W * 0.84) / (c.measureText(palabra).width || 1)), H * 0.24);
    c.font = `900 ${tam}px ${F.fraunces}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#000';
    const cy = formato === 'celular' ? H * 0.52 : H * 0.44;
    c.fillText(palabra, W / 2, cy);
    const nucleo = c.getImageData(0, 0, W, H).data;
    const medio = difuminar(capa, tam * 0.13).getContext('2d').getImageData(0, 0, W, H).data;
    const halo = difuminar(capa, tam * 0.5).getContext('2d').getImageData(0, 0, W, H).data;
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    const pon = (i, [r, g, b]) => { d[i] = r; d[i + 1] = g; d[i + 2] = b; };
    for (let i = 0; i < d.length; i += 4) {
      const n = nucleo[i + 3] / 255;
      const m = medio[i + 3] / 255;
      const h = halo[i + 3] / 255;
      if (h < 0.01) continue;
      const r = Math.random();
      if (n > 0.5) pon(i, r < (1 - m) * 2.2 ? [196, 224, 58] : r < 0.08 ? [60, 80, 20] : [14, 22, 8]);
      else if (m > 0.1 && r < m * 2.2) pon(i, [242, 228, 52]);
      else if (r < Math.pow(h, 0.7) * 1.7) pon(i, [255, 104, 52]);
    }
    ctx.putImageData(img, 0, 0);
    if (corta !== o.texto) {
      const fuente = (t) => `400 ${t}px ${F.literata}`;
      const ancho = formato === 'escritorio' ? W * 0.44 : W * 0.72;
      const comp = ajustar(ctx, o.texto.split(/\s+/), { ancho, alto: H * 0.16, max: 34 * s, min: 16 * s, lh: 1.4, fuente });
      escribir(ctx, comp, { x: (W - ancho) / 2, y: cy + tam * 0.75, ancho, lh: 1.4, alinear: 'centro', fuente, color: () => '#3a3833' });
    }
    const pie = formato === 'escritorio' ? H * 0.9 : (formato === 'post' ? H - Math.min(W, H) * 0.085 : H * 0.84);
    etiqueta(ctx, `${o.referencia} · ${o.version}`, W / 2, pie, '#6b6862', s, 'center');
    firma(ctx, W / 2, formato === 'celular' ? H * 0.3 : Math.min(W, H) * 0.095, '#6b6862', s, 'center');
    grano(ctx, W, H, 0.08, 'multiply');
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
  await DIBUJAR[o.estilo in DIBUJAR ? o.estilo : 'cartel'](ctx, datos);
  ctx.restore();
}
