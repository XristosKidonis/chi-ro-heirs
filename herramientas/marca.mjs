// Marca white industrial: el icono de la app y el logotipo nítido CHI—RO / HEIRS (sin texturas ni filtros).
// Escribe marca/png/icono-1024.png (fuente del icono; luego `npx tauri icon marca/png/icono-1024.png`)
// y los logotipos marca/png/logotipo-{horizontal,apilado}-{tinta,hueso}.png.
// Uso: node herramientas/marca.mjs   (necesita Playwright)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(process.env.PLAYWRIGHT_DIR || import.meta.url)('playwright');
const b64 = (f) => fs.readFileSync(`${RAIZ}/public/fuentes/${f}`).toString('base64');
const CSS = `<style>
@font-face{font-family:IT;font-weight:100 900;src:url(data:font/woff2;base64,${b64('inter-tight-latin-variable.woff2')})}
@font-face{font-family:DM;font-weight:100 1000;src:url(data:font/woff2;base64,${b64('dm-sans-latin-variable.woff2')})}
*{margin:0;box-sizing:border-box} html,body{background:transparent}
.mano{font:650 1em/0.9 IT;letter-spacing:-0.079em;white-space:nowrap;padding-right:.08em}
.sub{font:600 .2857em DM;letter-spacing:.23em}
</style>`;
const TINTA = '#181818';
const HUESO = '#f3f3f1';

const piezas = [
  // icono: CHI / —RO apilado, tinta sobre el blanco cálido de la app, en el cuadrado redondeado de macOS
  ['icono-1024', 1024, 1024, `<body style="width:1024px;height:1024px;display:grid;place-items:center">
    <div style="width:824px;height:824px;border-radius:186px;background:#f7f7f5;box-shadow:inset 0 0 0 2px #e2e2de;display:grid;place-items:center">
      <div style="font:650 270px/.86 IT;letter-spacing:-.09em;color:${TINTA};text-align:left;padding-right:.06em">CHI<br>—RO</div>
    </div></body>`],
];
for (const [tono, color] of [['tinta', TINTA], ['hueso', HUESO]]) {
  piezas.push([`logotipo-horizontal-${tono}`, 1200, 260, `<body style="width:1200px;height:260px;display:flex;align-items:center;justify-content:center;color:${color};font-size:150px">
    <span class="mano">CHI—RO</span><span class="sub" style="margin-left:.4em;align-self:center;padding-top:.6em">HEIRS</span></body>`]);
  piezas.push([`logotipo-apilado-${tono}`, 1000, 520, `<body style="width:1000px;height:520px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;color:${color};font-size:220px">
    <span class="mano">CHI—RO</span><span class="sub" style="font-size:44px;letter-spacing:.56em;padding-left:.56em">HEIRS</span></body>`]);
}

const b = await chromium.launch();
for (const [nombre, w, h, html] of piezas) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(CSS + html);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(150);
  await p.screenshot({ path: `${RAIZ}/marca/png/${nombre}.png`, omitBackground: true });
  await p.close();
}
await b.close();
console.log('Marca lista en marca/png');
