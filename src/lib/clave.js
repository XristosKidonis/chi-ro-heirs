// Clave de colores: qué significa para ti cada color de subrayado («verde = fe», «oro = promesas»…).
// Se guarda en los ajustes, se ve al subrayar, en el margen y en Mi archivo, y se comparte como imagen.
import { usuario, ajustar } from './usuario.svelte.js';
import { t, idioma } from './i18n.svelte.js';

export const COLORES = ['oro', 'rojo', 'azul', 'verde', 'hueso'];
export const TINTA = { oro: '#e8ba30', rojo: '#d3271c', azul: '#3460ff', verde: '#26a060', hueso: '#c9c9c4' };

// Una sugerencia para empezar, inspirada en las claves que se comparten en redes; cada quien la cambia
const SUGERIDA = {
  es: { oro: 'Promesas', rojo: 'Jesús y la salvación', azul: 'Quién es Dios', verde: 'Fe y obediencia', hueso: 'Para recordar' },
  en: { oro: 'Promises', rojo: 'Jesus and salvation', azul: 'Who God is', verde: 'Faith and obedience', hueso: 'To remember' },
};
export const sugerida = () => SUGERIDA[idioma()];

export const significado = (color) => (usuario.ajustes.claveColores?.[color] || '').trim();
export const tieneClave = () => COLORES.some(significado);
// «Promesas» si la clave lo define; si no, el nombre del color
export const etiquetaColor = (color) => significado(color) || t(`color.${color}`);

export function definir(color, texto) {
  ajustar('claveColores', { ...(usuario.ajustes.claveColores || {}), [color]: texto });
}

export const usarSugerida = () => ajustar('claveColores', { ...sugerida() });

// Imagen 1080 × 1350 para Instagram: la clave como una página de cuaderno, con el subrayado de cada color
export async function imagenClave() {
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  await Promise.all(['650 150px "Inter Tight"', '500 24px "DM Sans"', '400 58px Literata'].map((f) => document.fonts.load(f).catch(() => {})));

  ctx.fillStyle = '#f7f7f5';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#181818';
  ctx.textBaseline = 'alphabetic';

  const rotulo = (texto, x, y, alinear = 'left') => {
    ctx.font = '500 24px "DM Sans", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.textAlign = alinear;
    ctx.fillStyle = '#6e6e6c';
    ctx.fillText(texto.toUpperCase(), x, y);
    ctx.letterSpacing = '0px';
  };

  rotulo(t('clave.imgSobre'), 90, 130);
  ctx.font = '650 150px "Inter Tight", sans-serif';
  ctx.letterSpacing = '-9px';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#181818';
  ctx.fillText(t('clave.imgTitulo'), 84, 300);
  ctx.letterSpacing = '0px';
  ctx.fillRect(90, 360, W - 180, 3);

  const fila = 168;
  COLORES.forEach((color, i) => {
    const y = 470 + i * fila;
    ctx.fillStyle = '#6e6e6c';
    ctx.font = '500 24px "DM Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(String(i + 1).padStart(2, '0'), 90, y);
    // la palabra, con el mismo subrayado que en el lector
    ctx.font = '400 58px Literata, Georgia, serif';
    let texto = etiquetaColor(color);
    while (ctx.measureText(texto).width > W - 330 && texto.length > 4) texto = `${texto.slice(0, -2)}…`;
    const ancho = ctx.measureText(texto).width;
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = TINTA[color];
    ctx.fillRect(170, y - 50, ancho + 24, 70);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#181818';
    ctx.fillText(texto, 182, y);
    ctx.fillStyle = '#d9d9d5';
    ctx.fillRect(90, y + 58, W - 180, 1);
  });

  ctx.fillStyle = '#181818';
  ctx.font = '650 34px "Inter Tight", sans-serif';
  ctx.letterSpacing = '-2px';
  ctx.textAlign = 'left';
  ctx.fillText('CHI—RO', 90, H - 90);
  ctx.letterSpacing = '0px';
  rotulo(t('clave.imgPie'), W - 90, H - 92, 'right');

  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
}
