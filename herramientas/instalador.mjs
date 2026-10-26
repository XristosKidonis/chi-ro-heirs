// Genera las imágenes de los instaladores (ventana del .dmg en Mac, NSIS y MSI en Windows).
// Uso: node herramientas/instalador.mjs   (necesita Playwright y Python con Pillow)
// Estilo editorial: una lámina de Doré, papel, filetes finos y tipografía; sin flechas ni cintas.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(process.env.PLAYWRIGHT_DIR || import.meta.url)('playwright');
const F = `${RAIZ}/public/fuentes`;
const OUT = `${RAIZ}/src-tauri/instalador`;
const b64 = (f) => fs.readFileSync(f).toString('base64');
const fuente = (familia, peso, archivo) =>
  `@font-face{font-family:${familia};font-weight:${peso};src:url(data:font/woff2;base64,${b64(`${F}/${archivo}`)})}`;
// el logotipo Aura (hueso sobre oscuro, tinta sobre claro), recortado al ancho de las letras con su halo
const logo = (tono, alto) => `<img src="data:image/png;base64,${b64(`${RAIZ}/marca/png/logotipo-horizontal-${tono}.png`)}" style="height:${alto}px;margin:-${Math.round(alto * 0.09)}px 0;display:block">`;
const lamina = (n) => `data:image/webp;base64,${b64(`${RAIZ}/public/grabados/dore-${String(n).padStart(3, '0')}.webp`)}`;

const estilos = `<style>
${fuente('Bodoni', 400, 'bodoni-moda-latin-400-normal.woff2')}
${fuente('Bodoni', 700, 'bodoni-moda-latin-700-normal.woff2')}
@font-face{font-family:Bodoni;font-style:italic;src:url(data:font/woff2;base64,${b64(`${F}/bodoni-moda-latin-400-italic.woff2`)})}
${fuente('Pinyon', 400, 'pinyon-script-latin-400-normal.woff2')}
${fuente('Grotesca', 300, 'inter-tight-latin-300-normal.woff2')}
${fuente('Archivo', 600, 'archivo-latin-600-normal.woff2')}
*{margin:0;box-sizing:border-box} body{width:var(--w);height:var(--h);overflow:hidden;position:relative}
.et{font:600 8.5px Archivo;letter-spacing:.26em;text-transform:uppercase}
.lamina{position:absolute;overflow:hidden;background:#0b0a09}
.lamina img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.3) brightness(.86)}
.lamina::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(6,5,4,.35),transparent 30%,transparent 60%,rgba(6,5,4,.75))}
.marca{display:flex;align-items:baseline;gap:7px}
.marca b{font:700 var(--t,13px) Bodoni;letter-spacing:.18em}
.marca i{font:400 calc(var(--t,13px) * 1.55) Pinyon;font-style:normal}
</style>`;

const xr = (c, w) => `<svg width="${w}" height="${w}" viewBox="0 0 100 100" fill="none" stroke="${c}" style="align-self:center"><path d="M50 12V90" stroke-width="8.5"/><path d="M50 14C78 11 81 48 58 46" stroke-width="5" stroke-linecap="round"/><path d="M27 38L73 84" stroke-width="8.5"/><path d="M73 38L27 84" stroke-width="2.6"/><path d="M42 90H58" stroke-width="2.6"/></svg>`;

// Columna con lámina para la barra lateral de NSIS y el diálogo de MSI (164 px de ancho)
const columna = (n) => `
  <div class="lamina" style="left:0;top:0;width:164px;height:314px"><img src="${lamina(n)}"></div>
  <div style="position:absolute;top:14px;left:8px">${logo('hueso', 26)}</div>
  <div style="position:absolute;bottom:16px;left:14px;right:10px;color:#efece6">
    <div style="font:300 30px/.9 Grotesca;letter-spacing:-.06em">Toma<br>y lee.</div>
    <div class="et" style="font-size:6.5px;margin-top:8px;opacity:.7">Grabado de Gustave Doré</div>
  </div>`;

const piezas = {
  // Mac: ventana del .dmg. Iconos en (350,236) y (546,236); Finder escribe sus nombres debajo, en negro.
  'dmg-fondo': [660, 400, `<body style="--w:660px;--h:400px;background:#f7f6f2;color:#0e0e0e">
    <div class="lamina" style="left:0;top:0;width:236px;height:400px"><img src="${lamina(95)}" style="object-position:40% 50%"></div>
    <div class="et" style="position:absolute;left:18px;bottom:16px;color:#efece6;opacity:.75;font-size:7px">Doré · La conversión de Saulo</div>
    <div style="position:absolute;left:266px;right:30px;top:30px;display:flex;justify-content:space-between;align-items:center">
      <div style="margin-left:-8px">${logo('tinta', 28)}</div>
      <span class="et" style="color:#6b6b6b">Lector bíblico</span>
    </div>
    <div style="position:absolute;left:266px;right:30px;top:62px;border-top:1px solid #0e0e0e"></div>
    <div style="position:absolute;left:264px;top:80px;font:300 54px/.86 Grotesca;letter-spacing:-.065em">Toma y lee.</div>
    <div style="position:absolute;left:266px;top:136px;font:italic 400 13px Bodoni;color:#46433f">Arrastra el libro a tu biblioteca.</div>
    <div style="position:absolute;left:420px;width:56px;top:236px;border-top:1px solid #b3201e"></div>
    <div style="position:absolute;left:266px;right:30px;bottom:44px;border-top:1px solid #d9d6cf"></div>
    <div style="position:absolute;left:266px;right:30px;bottom:24px;display:flex;justify-content:space-between">
      <span class="et" style="color:#6b6b6b">Arrastra a Aplicaciones</span>
      <span class="et" style="color:#6b6b6b">Drag to Applications</span>
    </div>
  </body>`],
  // Windows NSIS: barra lateral de bienvenida y fin (164x314)
  'nsis-lateral': [164, 314, `<body style="--w:164px;--h:314px;background:#121110">${columna(95)}</body>`],
  // Windows NSIS: cabecera de las páginas internas (150x57)
  'nsis-cabecera': [150, 57, `<body style="--w:150px;--h:57px;background:#ffffff;color:#0e0e0e;display:flex;align-items:center;justify-content:flex-end;padding-right:12px">
    ${logo('tinta', 30)}
  </body>`],
  // Windows MSI: banner superior (493x58); el título del paso se escribe a la izquierda
  'msi-banner': [493, 58, `<body style="--w:493px;--h:58px;background:#ffffff;color:#0e0e0e">
    <div style="position:absolute;right:10px;top:15px">${logo('tinta', 30)}</div>
  </body>`],
  // Windows MSI: diálogo de bienvenida (493x312); la franja izquierda de 164 px es la imagen
  'msi-dialogo': [493, 312, `<body style="--w:493px;--h:312px;background:#ffffff">${columna(95)}</body>`],
};

const navegador = await chromium.launch();
for (const [nombre, [w, h, html]] of Object.entries(piezas)) {
  const p = await navegador.newPage({ viewport: { width: w, height: h } });
  await p.setContent(estilos + html);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${nombre}.png` });
  await p.close();
}
await navegador.close();

// Windows pide BMP de 24 bits
const bmp = ['nsis-lateral', 'nsis-cabecera', 'msi-banner', 'msi-dialogo'];
execFileSync('python3', ['-c', `
import sys
from PIL import Image
for n in sys.argv[1:]:
    Image.open(f'${OUT}/{n}.png').convert('RGB').save(f'${OUT}/{n}.bmp')
`, ...bmp]);
for (const n of bmp) fs.rmSync(`${OUT}/${n}.png`);
console.log('Instaladores listos en', OUT);
