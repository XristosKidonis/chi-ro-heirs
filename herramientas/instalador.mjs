// Genera las imágenes de los instaladores (ventana del .dmg en Mac, NSIS y MSI en Windows)
// con la estética white industrial: fondo blanco cálido, logotipo nítido CHI—RO / HEIRS en Inter Tight,
// DM Sans para los rótulos, filetes finos. Sin texturas, sombras, degradados ni grabados.
// Uso: node herramientas/instalador.mjs   (necesita Playwright y Python con Pillow)
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(process.env.PLAYWRIGHT_DIR || import.meta.url)('playwright');
const OUT = `${RAIZ}/src-tauri/instalador`;
const version = JSON.parse(fs.readFileSync(`${RAIZ}/package.json`, 'utf8')).version.split('.').slice(0, 2).join('.');
const b64 = (f) => fs.readFileSync(`${RAIZ}/public/fuentes/${f}`).toString('base64');

const estilos = `<style>
@font-face{font-family:IT;font-weight:100 900;src:url(data:font/woff2;base64,${b64('inter-tight-latin-variable.woff2')})}
@font-face{font-family:DM;font-weight:100 1000;src:url(data:font/woff2;base64,${b64('dm-sans-latin-variable.woff2')})}
*{margin:0;box-sizing:border-box}
body{width:var(--w);height:var(--h);overflow:hidden;position:relative;background:#f7f7f5;color:#181818;-webkit-font-smoothing:antialiased}
.et{font:600 8px DM;letter-spacing:.2em;text-transform:uppercase;color:#6e6e6c}
.marca{display:inline-flex;align-items:baseline;gap:.32em;white-space:nowrap;font-size:var(--t,26px)}
.marca b{font:650 1em/.9 IT;letter-spacing:-.079em;padding-right:.06em}
.marca small{font:600 .29em DM;letter-spacing:.23em}
.filete{position:absolute;border-top:1px solid #181818}
.filete.suave{border-color:#d9d9d5}
</style>`;
const marca = (t) => `<span class="marca" style="--t:${t}px"><b>CHI—RO</b><small>HEIRS</small></span>`;

// Columna izquierda de Windows (164 px): marca arriba, «Toma y lee.» abajo; nada de fotos
const columna = `
  <div style="position:absolute;left:0;top:0;width:164px;height:314px;background:#f7f7f5;border-right:1px solid #d9d9d5"></div>
  <div style="position:absolute;left:16px;top:20px">${marca(22)}</div>
  <div class="filete" style="left:16px;right:16px;top:52px;width:132px"></div>
  <div class="et" style="position:absolute;left:16px;top:62px;font-size:6.5px">Lector bíblico · v${version}</div>
  <div style="position:absolute;left:16px;bottom:44px;font:400 31px/.92 IT;letter-spacing:-.06em">Toma<br>y lee.</div>
  <div class="et" style="position:absolute;left:16px;bottom:22px;font-size:6px">San Agustín, Confesiones VIII</div>`;

const piezas = {
  // Mac: ventana del .dmg. Iconos en (350,236) y (546,236); Finder escribe sus nombres debajo, en negro.
  'dmg-fondo': [660, 400, `<body style="--w:660px;--h:400px">
    <div style="position:absolute;left:30px;top:26px">${marca(26)}</div>
    <div class="et" style="position:absolute;right:30px;top:34px">Lector bíblico · v${version}</div>
    <div class="filete" style="left:30px;right:30px;top:62px"></div>
    <div style="position:absolute;left:28px;top:90px;font:400 50px/.9 IT;letter-spacing:-.065em">Toma<br>y lee.</div>
    <div style="position:absolute;left:30px;top:200px;width:200px;font:400 12.5px/1.5 DM;color:#3a3a39">Arrastra Chi-Ro Heirs a la carpeta Aplicaciones.</div>
    <div class="et" style="position:absolute;left:30px;top:252px;font-size:7px;letter-spacing:.16em;width:200px;line-height:1.6">Drag Chi-Ro Heirs<br>to Applications</div>
    <div class="et" style="position:absolute;left:290px;width:120px;text-align:center;top:150px;white-space:nowrap">01 · La app</div>
    <div class="et" style="position:absolute;left:476px;width:140px;text-align:center;top:150px;white-space:nowrap">02 · Aplicaciones</div>
    <div class="filete" style="left:424px;width:46px;top:236px"></div>
    <div style="position:absolute;left:462px;top:232px;width:9px;height:9px;border-top:1px solid #181818;border-right:1px solid #181818;transform:rotate(45deg)"></div>
    <div class="filete suave" style="left:30px;right:30px;bottom:44px"></div>
    <div class="et" style="position:absolute;left:30px;bottom:24px">«Toma y lee» · San Agustín</div>
    <div class="et" style="position:absolute;right:30px;bottom:24px">Arrastra a Aplicaciones · Drag to Applications</div>
  </body>`],
  // Windows NSIS: barra lateral de bienvenida y fin (164x314)
  'nsis-lateral': [164, 314, `<body style="--w:164px;--h:314px">${columna}</body>`],
  // Windows NSIS: cabecera de las páginas internas (150x57)
  'nsis-cabecera': [150, 57, `<body style="--w:150px;--h:57px;background:#ffffff;display:flex;align-items:center;justify-content:flex-end;padding-right:12px">${marca(20)}</body>`],
  // Windows MSI: banner superior (493x58); el título del paso se escribe a la izquierda
  'msi-banner': [493, 58, `<body style="--w:493px;--h:58px;background:#ffffff">
    <div style="position:absolute;right:14px;top:19px">${marca(20)}</div>
    <div class="filete suave" style="left:0;right:0;bottom:0"></div>
  </body>`],
  // Windows MSI: diálogo de bienvenida (493x312); la franja izquierda de 164 px es la imagen
  'msi-dialogo': [493, 312, `<body style="--w:493px;--h:312px;background:#ffffff">${columna}</body>`],
};

const navegador = await chromium.launch();
for (const [nombre, [w, h, html]] of Object.entries(piezas)) {
  const p = await navegador.newPage({ viewport: { width: w, height: h } });
  await p.setContent(estilos + html);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
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
