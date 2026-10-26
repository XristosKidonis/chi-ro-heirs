// Prueba funcional de Chi-Ro Heirs en modo navegador.
import { createRequire } from 'node:module';
// Requiere Playwright (npm i -g playwright) y «npm run dev» en marcha. PLAYWRIGHT_DIR apunta a node_modules global.
const { chromium } = createRequire(process.env.PLAYWRIGHT_DIR || import.meta.url)('playwright');

const OUT = process.argv[2];
const DIRECCION = 'http://127.0.0.1:1420/';

// Respuesta simulada de api.nlt.to con el formato documentado (verse_export, .vn, .subhead, .tn)
function falsaNLT(ref, version) {
  const [libro, cap] = ref.split(/ (?=\d+$)/);
  const n = 20;
  let html = `<div id="bibletext"><section><h2 class="bk_ch_vs_header">${ref}, ${version}</h2>`;
  html += `<p class="subhead">Título de sección simulado</p>`;
  for (let v = 1; v <= n; v++) {
    const extra = v === 16 ? ' Porque Dios amó tanto al mundo que dio a su único Hijo<a class="a-tn">*</a><span class="tn"><span class="tn-ref">3:16</span> Nota al pie.</span>' : ` texto de prueba ${version} ${libro} ${cap}:${v}.`;
    html += `<verse_export orig="x_${cap}_${v}" bk="x" ch="${cap}" vn="${v}"><span class="vn">${v}</span>${extra}</verse_export>`;
  }
  return html + '</section></div>';
}

const errores = [];
const navegador = await chromium.launch();
const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
const pag = await ctx.newPage();
pag.on('pageerror', (e) => errores.push('pageerror: ' + e.message));
pag.on('console', (m) => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
let pedidosNLT = 0;
await pag.route('https://api.nlt.to/**', (route) => {
  pedidosNLT++;
  const u = new URL(route.request().url());
  route.fulfill({ status: 200, contentType: 'text/html', body: falsaNLT(u.searchParams.get('ref'), u.searchParams.get('version')) });
});

const paso = async (nombre, fn) => {
  try { await fn(); console.log('OK  ', nombre); } catch (e) { console.log('FALLA', nombre, '-', e.message.split('\n')[0]); errores.push(nombre); }
};

async function entrar(p) {
  await p.waitForSelector('.portada-w', { timeout: 20000 });
  await p.click('.portada-w');
  await p.click('.menu-cabeza .boton');
  await p.waitForSelector('.texto .v', { timeout: 20000 });
}
await pag.goto(DIRECCION);
await paso('portada y menú de inicio', async () => {
  await pag.waitForSelector('.portada-w.lista', { timeout: 30000 });
  await pag.click('.portada-w');
  await pag.waitForSelector('.lomo');
  if ((await pag.locator('.lomo').count()) !== 66) throw new Error('faltan lomos');
  await pag.click('.menu-cabeza .boton');
  await pag.waitForSelector('.texto .v', { timeout: 20000 });
});
await paso('arranca en Génesis 1 con NTV y portadilla', async () => {
  const h1 = await pag.textContent('.frontis-titulo');
  if (!/Génesis/.test(h1)) throw new Error(h1);
  const sub = await pag.textContent('.texto .subtitulo');
  if (!/Título/.test(sub)) throw new Error('sin subtítulo NTV');
});
await pag.screenshot({ path: `${OUT}/01-genesis-ntv.png` });

await paso('ir a Jn 3:16 con la barra', async () => {
  await pag.fill('.ir input', 'jn 3:16');
  await pag.press('.ir input', 'Enter');
  await pag.waitForFunction(() => document.querySelector('.cabeza-corriente .numero')?.textContent === '3');
  const t = await pag.textContent('.texto [data-v="16"] .t');
  if (!/amó tanto/.test(t)) throw new Error(t);
  if (/Nota al pie/.test(t)) throw new Error('la nota al pie no se quitó');
});

await paso('tocar una palabra selecciona versículo y palabra', async () => {
  await pag.waitForTimeout(900);
  const caja = await pag.locator('.texto [data-v="16"] .t').boundingBox();
  // clic sobre «Dios» (cerca del inicio del texto)
  await pag.mouse.click(caja.x + 80, caja.y + 12);
  await pag.waitForSelector('.acciones');
  const p = await pag.textContent('.acc-palabra');
  console.log('     palabra capturada:', p.trim());
});

await paso('subrayar en rojo', async () => {
  await pag.click('.colores [data-color="rojo"]');
  const m = await pag.getAttribute('.texto [data-v="16"] .t', 'data-m');
  if (m !== 'rojo') throw new Error(m);
});

await paso('estudio de palabra con concordancia en RV1909', async () => {
  await pag.click('.acc-palabra');
  await pag.waitForSelector('.cifra b');
  const n = await pag.textContent('.cifra b');
  console.log('     versículos encontrados:', n);
  if (!(Number(n) > 0)) throw new Error('sin resultados');
  await pag.waitForSelector('.distribucion .barra-d');
});
await pag.screenshot({ path: `${OUT}/02-palabra.png` });

await paso('nota con referencia y retroenlace', async () => {
  await pag.click('.pestanas-estudio [role="tab"]:has-text("Notas")');
  await pag.click('.tipo:has-text("Observación")');
  await pag.fill('textarea.campo', 'El amor de Dios se demuestra en Ro 5:8. #amor');
  await pag.click('button:has-text("Guardar nota")');
  await pag.waitForSelector('.texto [data-v="16"] .marca-nota');
  await pag.click('.nota-texto .ref-link:has-text("Ro 5:8")');
  await pag.waitForFunction(() => document.querySelector('.cabeza-corriente h1')?.textContent === 'Romanos');
  await pag.waitForSelector('.texto [data-v="8"] .marca-retro');
});

await paso('el subrayado aparece también en la RV1909', async () => {
  await pag.fill('.ir input', 'juan 3');
  await pag.press('.ir input', 'Enter');
  await pag.selectOption('.barra .sel:not(.solo-escritorio) select', 'RV1909');
  await pag.waitForFunction(() => /de tal manera amó/.test(document.querySelector('.texto [data-v="16"] .t')?.textContent || ''));
  const m = await pag.getAttribute('.texto [data-v="16"] .t', 'data-m');
  if (m !== 'rojo') throw new Error(m);
});
await pag.screenshot({ path: `${OUT}/03-juan3-rv1909.png` });

await paso('vista paralela RV1909 + KJV', async () => {
  await pag.selectOption('.barra .sel.solo-escritorio select', 'KJV');
  await pag.waitForSelector('.texto.paralelo .fila .p2');
  const t = await pag.textContent('.texto .fila:nth-child(16) .p2 .t').catch(() => '');
  const kjv = await pag.locator('.texto .p2[data-v="16"] .t').textContent();
  if (!/For God so loved/.test(kjv)) throw new Error(kjv);
});
await pag.screenshot({ path: `${OUT}/04-paralelo.png` });
await pag.selectOption('.barra .sel.solo-escritorio select', '');

await paso('búsqueda «luz del mundo» frase exacta', async () => {
  await pag.click('.pestanas-estudio [role="tab"]:has-text("Buscar")');
  await pag.fill('.estudio input[type="search"]', 'luz del mundo');
  await pag.selectOption('.estudio select[aria-label="Modo"]', 'frase');
  await pag.waitForSelector('.estudio .resultados li');
  const h = await pag.textContent('.estudio .seccion h3');
  console.log('     ', h.trim());
});

await paso('referencias cruzadas de Jn 3:16', async () => {
  await pag.locator('.texto [data-v="16"] .num').click();
  await pag.click('.pestanas-estudio [role="tab"]:has-text("Refs")');
  await pag.waitForSelector('.estudio .resultados li');
  const n = await pag.locator('.estudio .resultados li').count();
  console.log('      referencias:', n);
});

await paso('comparar en todas las versiones', async () => {
  await pag.click('.pestanas-estudio [role="tab"]:has-text("Comparar")');
  await pag.waitForFunction(() => [...document.querySelectorAll('.comparar-item .ref-texto')].every((p) => p.textContent !== 'Cargando…') && document.querySelectorAll('.comparar-item').length === 6);
});
await pag.screenshot({ path: `${OUT}/05-comparar.png` });

await paso('memorizar y practicar', async () => {
  await pag.click('.acc-botones button:has-text("Memorizar")');
  await pag.waitForSelector('.mem-tarjeta');
  await pag.click('.niveles button:has-text("Solo iniciales")');
  await pag.click('button:has-text("Lo recordé")');
});

await paso('cinta y sello AMEN', async () => {
  await pag.keyboard.press('Escape');
  await pag.click('.marcador');
  await pag.waitForSelector('.marcador.puesto');
  await pag.click('.sello');
  await pag.waitForSelector('.amen.hecho');
});
await pag.locator('.amen').scrollIntoViewIfNeeded();
await pag.screenshot({ path: `${OUT}/06-amen.png` });

await paso('progreso refleja el capítulo leído', async () => {
  await pag.click('.pestanas-estudio [role="tab"]:has-text("Progreso")');
  await pag.waitForSelector('.cob-celdas button.leido');
});

await paso('lámina en los ocho acabados', async () => {
  await pag.locator('.texto [data-v="16"] .num').click();
  await pag.click('.acc-botones button:has-text("Lámina")');
  await pag.waitForSelector('.estudio-lamina canvas', { timeout: 10000 });
  for (const e of ['Ultramar', 'Aura', 'Aerosol', 'Pedrería', 'Primario', 'Riso', 'Calor', 'Grabado']) {
    await pag.click(`.chips button:has-text("${e}")`);
    await pag.waitForTimeout(600);
    await pag.waitForSelector('.lamina-vista:not(.cargando)', { timeout: 10000 });
  }
  await pag.click('.chips button:has-text("Fondo de celular")');
  await pag.waitForTimeout(800);
  const [w, h] = await pag.evaluate(() => { const c = document.querySelector('.estudio-lamina canvas'); return [c.width, c.height]; });
  if (w !== 1179 || h !== 2556) throw new Error(`tamaño ${w}x${h}`);
});
await pag.screenshot({ path: `${OUT}/07-lamina.png` });
await pag.click('.dlg .dlg-cabeza .ico');

await paso('los datos sobreviven a recargar', async () => {
  await pag.reload();
  await entrar(pag);
  const m = await pag.getAttribute('.texto [data-v="16"] .t', 'data-m');
  const notas = await pag.locator('.texto [data-v="16"] .marca-nota').count();
  if (m !== 'rojo' || !notas) throw new Error(`m=${m} notas=${notas}`);
});

await paso('interlineal griego de Jn 3:16 con glosas en español', async () => {
  await pag.fill('.ir input', 'jn 3:16');
  await pag.press('.ir input', 'Enter');
  await pag.waitForTimeout(800);
  await pag.click('.pestanas-estudio [role="tab"]:has-text("Original")');
  await pag.waitForSelector('.interlineal .palabra-orig');
  const n = await pag.locator('.interlineal .palabra-orig').count();
  const g = await pag.locator('.interlineal .palabra-orig:nth-child(3) .glosa').textContent();
  console.log('      palabras:', n, '· 3.ª glosa:', g);
  if (n < 20 || !/amó/.test(g)) throw new Error('interlineal incorrecto');
  await pag.click('.interlineal .palabra-orig:nth-child(3)');
  await pag.waitForSelector('.definicion');
  await pag.waitForSelector('.estudio .resultados li');
  const h = await pag.locator('.estudio .seccion h3').filter({ hasText: /Aparece/ }).textContent();
  const m = await pag.locator('.estudio .tarjeta .strong-def').first().textContent();
  console.log('      ', h.trim(), '·', m.trim());
});
await pag.screenshot({ path: `${OUT}/10-interlineal-griego.png` });

await paso('interlineal hebreo de Gn 1:1 (derecha a izquierda)', async () => {
  await pag.fill('.ir input', 'gn 1:1');
  await pag.press('.ir input', 'Enter');
  await pag.waitForSelector('.interlineal.hebreo .palabra-orig');
  const dir = await pag.getAttribute('.interlineal', 'dir');
  const w = await pag.locator('.interlineal .palabra-orig:first-child .orig').textContent();
  console.log('      dir:', dir, '· primera palabra:', w);
  await pag.click('.interlineal .palabra-orig:nth-child(2)');
  await pag.waitForSelector('.definicion');
});
await pag.screenshot({ path: `${OUT}/11-interlineal-hebreo.png` });

await paso('interfaz en inglés', async () => {
  await pag.click('.nav-pie button:nth-child(2)');
  await pag.selectOption('#aj-idioma', 'en');
  await pag.waitForSelector('.dlg-cabeza h2:has-text("Settings")');
  await pag.click('.dlg-cabeza .ico');
  await pag.fill('.ir input', 'john 3:16');
  await pag.press('.ir input', 'Enter');
  await pag.waitForFunction(() => document.querySelector('.cabeza-corriente h1')?.textContent === 'John');
  const tab = await pag.locator('.pestanas-estudio [role="tab"]').first().textContent();
  const nav = await pag.locator('.nav .testamento').first().textContent();
  if (tab !== 'Word' || !/Old Testament/.test(nav)) throw new Error(`${tab} / ${nav}`);
});
await pag.screenshot({ path: `${OUT}/12-ingles.png` });
await pag.click('.nav-pie button:nth-child(2)');
await pag.selectOption('#aj-idioma', 'es');
await pag.click('.dlg-cabeza .ico');

await paso('tema Papel', async () => {
  await pag.click('button[aria-label="Cuero / Papel"]');
  await pag.waitForFunction(() => document.documentElement.dataset.theme === 'light');
});
await pag.screenshot({ path: `${OUT}/08-papel.png` });

// Móvil
const movil = await navegador.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
const pm = await movil.newPage();
pm.on('pageerror', (e) => errores.push('movil pageerror: ' + e.message));
await pm.route('https://api.nlt.to/**', (route) => {
  const u = new URL(route.request().url());
  route.fulfill({ status: 200, contentType: 'text/html', body: falsaNLT(u.searchParams.get('ref'), u.searchParams.get('version')) });
});
await pm.goto(DIRECCION);
await entrar(pm);
await pm.screenshot({ path: `${OUT}/09-movil.png` });
const anchoDoc = await pm.evaluate(() => document.documentElement.scrollWidth);
console.log('ancho documento móvil:', anchoDoc);

console.log('pedidos a la API NTV/NLT simulada:', pedidosNLT);
console.log(errores.length ? 'ERRORES:\n' + errores.join('\n') : 'Sin errores de consola.');
await navegador.close();
