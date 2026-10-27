// Prueba funcional de Chi-Ro Heirs en modo navegador.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
// Requiere Playwright (npm i -g playwright) y «npm run dev» en marcha. PLAYWRIGHT_DIR apunta a node_modules global.
const { chromium } = createRequire(process.env.PLAYWRIGHT_DIR || import.meta.url)('playwright');

const OUT = process.argv[2];
const DIRECCION = process.env.DIRECCION || 'http://127.0.0.1:1420/';

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

// Inicio → «Continuar leyendo» → lector
async function entrar(p) {
  await p.waitForSelector('.inicio-entrada', { timeout: 20000 });
  await p.click('.inicio-entrada >> nth=0');
  await p.waitForSelector('.texto .v', { timeout: 20000 });
}
// Búsqueda global (Ctrl K): una referencia va directo al pasaje
async function ir(p, texto) {
  await p.keyboard.press('Control+k');
  await p.waitForSelector('.buscador[open] input');
  await p.fill('.buscador input', texto);
  await p.press('.buscador input', 'Enter');
  await p.waitForSelector('.buscador[open]', { state: 'detached' }).catch(() => {});
}
async function abrirEstudio(p) {
  if ((await p.getAttribute('.lb-estudio', 'aria-pressed')) !== 'true') await p.click('.lb-estudio');
  await p.waitForSelector('.estudio .pestanas-estudio');
}
const titulo = (p) => p.textContent('.cap-titulo');
await pag.goto(DIRECCION);
await paso('inicio con la marca nítida, tres entradas y biblioteca de 66 libros', async () => {
  await pag.waitForSelector('.inicio .marca-grande');
  const estilo = await pag.evaluate(() => { const c = getComputedStyle(document.querySelector('.marca-grande > span')); return [c.filter, c.textShadow, document.querySelector('.marca-grande').textContent]; });
  if (estilo[0] !== 'none' || estilo[1] !== 'none' || !/CHI—RO\s*HEIRS/.test(estilo[2])) throw new Error(estilo.join(' | '));
  if ((await pag.locator('.inicio-entrada').count()) !== 3) throw new Error('el inicio no tiene tres entradas');
  if (await pag.locator('.inicio img:not(.inicio-cultura img)').count()) throw new Error('foto en el inicio');
  const sugerencia = await pag.locator('.inicio-empezar button').textContent();
  if (!/Juan/.test(sugerencia)) throw new Error('sin la sugerencia de empezar por Juan: ' + sugerencia);
  await pag.click('.inicio-entrada >> nth=1');
  await pag.waitForSelector('.cubierta');
  if ((await pag.locator('.cubierta').count()) !== 66) throw new Error('faltan libros');
  const filtroLogo = await pag.evaluate(() => getComputedStyle(document.querySelector('.cabecera .marca-main')).filter);
  if (filtroLogo !== 'none') throw new Error('logo con filtro: ' + filtroLogo);
  await pag.click('.filtro >> nth=2');
  if ((await pag.locator('.cubierta').count()) !== 27) throw new Error('filtro NT');
  await pag.click('.filtro >> nth=0');
  await pag.click('.cubierta >> nth=0');
  await pag.waitForSelector('.texto .v', { timeout: 20000 });
});
await paso('arranca en Génesis 1 con NTV', async () => {
  const h1 = await titulo(pag);
  if (!/Génesis\s*1/.test(h1)) throw new Error(h1);
  const sub = await pag.textContent('.texto .subtitulo');
  if (!/Título/.test(sub)) throw new Error('sin subtítulo NTV');
});
await pag.screenshot({ path: `${OUT}/01-genesis-ntv.png` });

await paso('ir a Jn 3:16 con la búsqueda (Ctrl K)', async () => {
  await ir(pag, 'jn 3:16');
  await pag.waitForFunction(() => document.querySelector('.cap-titulo em')?.textContent === '3');
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
  await pag.waitForFunction(() => /^Romanos/.test(document.querySelector('.cap-titulo')?.textContent || ''));
  await pag.waitForSelector('.texto [data-v="8"] .marca-retro');
});

await paso('el subrayado aparece también en la RV1909', async () => {
  await ir(pag, 'juan 3');
  await pag.selectOption('.lb-version:not(.lb-paralela) select', 'RV1909');
  await pag.waitForFunction(() => /de tal manera amó/.test(document.querySelector('.texto [data-v="16"] .t')?.textContent || ''));
  const m = await pag.getAttribute('.texto [data-v="16"] .t', 'data-m');
  if (m !== 'rojo') throw new Error(m);
});
await pag.screenshot({ path: `${OUT}/03-juan3-rv1909.png` });

await paso('vista paralela RV1909 + KJV', async () => {
  await pag.selectOption('.lb-paralela select', 'KJV');
  await pag.waitForSelector('.texto.paralelo .fila .p2');
  const t = await pag.textContent('.texto .fila:nth-child(16) .p2 .t').catch(() => '');
  const kjv = await pag.locator('.texto .p2[data-v="16"] .t').textContent();
  if (!/For God so loved/.test(kjv)) throw new Error(kjv);
});
await pag.screenshot({ path: `${OUT}/04-paralelo.png` });
await pag.selectOption('.lb-paralela select', '');

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

await paso('comparar: las del idioma, de literal a paráfrasis, y luego todas', async () => {
  await pag.click('.pestanas-estudio [role="tab"]:has-text("Comparar")');
  const listas = (n) => pag.waitForFunction((n) => [...document.querySelectorAll('.comparar-item .ref-texto')].every((p) => p.textContent !== 'Cargando…') && document.querySelectorAll('.comparar-item').length === n, n);
  await listas(6);
  const tipos = await pag.locator('.comparar-item .comp-tipo').allTextContents();
  if (tipos[0] !== 'Formal' || tipos.at(-1) !== 'Sencilla') throw new Error(`orden: ${tipos.join(', ')}`);
  await pag.click('.comp-todas');
  await listas(17);
  const vacios = await pag.locator('.comparar-item .ref-texto:text-is("—")').count();
  if (vacios) throw new Error(`${vacios} versiones sin texto`);
  await pag.click('.comp-todas');
  await listas(6);
});
await pag.screenshot({ path: `${OUT}/05-comparar.png` });

await paso('memorizar y practicar', async () => {
  await pag.click('.acc-mas');
  await pag.click('.acc-botones button:has-text("Memorizar")');
  await pag.waitForSelector('.mem-tarjeta');
  await pag.click('.niveles button:has-text("Solo iniciales")');
  await pag.click('button:has-text("Lo recordé")');
});

await paso('cinta y sello AMEN', async () => {
  await pag.keyboard.press('Escape');
  await pag.click('.lector-barra .marcador');
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

await paso('guardar en Mi archivo, filtrar y volver al pasaje desde una nota', async () => {
  // el versículo 16 sigue seleccionado desde la lámina; si no, se selecciona
  if (!(await pag.locator('.texto [data-v="16"].sel').count())) await pag.locator('.texto [data-v="16"] .num').click();
  await pag.click('.acc-guardar');
  await pag.waitForSelector('.acc-guardar[aria-pressed="true"]');
  await pag.keyboard.press('Escape');
  await pag.click('.cab-link:has-text("Mi archivo")');
  await pag.waitForSelector('.archivo-entrada');
  await pag.click('.filtro:has-text("Guardados")');
  const g = await pag.locator('.archivo-entrada .arc-meta').allTextContents();
  if (!g.some((x) => /Juan 3:16 \/ Guardado/.test(x)) || !g.some((x) => /Juan 3 \/ Cinta/.test(x))) throw new Error('guardados: ' + g.join(' | '));
  await pag.waitForFunction(() => [...document.querySelectorAll('.archivo-entrada .arc-verso')].some((e) => /de tal manera/.test(e.textContent)));
  await pag.click('.filtro:has-text("Notas")');
  const n = await pag.locator('.archivo-entrada .arc-nota').first().textContent();
  if (!/Ro 5:8/.test(n)) throw new Error('nota: ' + n);
  await pag.click('.archivo-entrada .arc-volver >> nth=0');
  await pag.waitForFunction(() => /^Juan\s*3/.test(document.querySelector('.cap-titulo')?.textContent || ''));
  await pag.waitForSelector('.pestanas-estudio [role="tab"][aria-selected="true"]:has-text("Notas")');
});
await pag.screenshot({ path: `${OUT}/13-archivo.png` });

await paso('Láminas: índice neutro → Color → volver al índice', async () => {
  await pag.click('.cab-link:has-text("Láminas")');
  await pag.waitForSelector('.coleccion');
  if ((await pag.locator('.coleccion').count()) !== 3) throw new Error('no hay tres colecciones');
  if (await pag.locator('.obra, .pagina-vista img, .pagina-vista canvas').count()) throw new Error('hay arte antes de entrar');
  await pag.click('.coleccion:has-text("Color")');
  await pag.waitForFunction(() => document.querySelectorAll('.obra img').length === 4, null, { timeout: 30000 });
  await pag.screenshot({ path: `${OUT}/14-laminas-color.png` });
  await pag.click('.coleccion-barra button');
  await pag.waitForSelector('.coleccion');
  if (await pag.locator('.obra').count()) throw new Error('el índice no quedó neutro');
  // ningún acabado del motor queda fuera de las colecciones (se lee el código, sirve también para la web compilada)
  const { COLECCIONES } = await import('../src/lib/colecciones.js');
  const fuente = readFileSync(new URL('../src/lib/laminas.js', import.meta.url), 'utf8');
  const ESTILOS = JSON.parse(fuente.match(/export const ESTILOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  const en = new Set(COLECCIONES.flatMap((c) => c.piezas.map((p) => p.estilo)));
  const fuera = ESTILOS.filter((e) => !en.has(e));
  if (fuera.length || ESTILOS.length !== 8) throw new Error('acabados sin colección: ' + fuera.join(', '));
});

await paso('modo Calma: solo el texto, Esc para salir', async () => {
  await pag.click('.cab-link:has-text("Leer")');
  await pag.waitForSelector('.lb-calma');
  await pag.click('.lb-calma');
  await pag.waitForSelector('.cabecera', { state: 'detached' });
  if (await pag.locator('.lector-barra').count()) throw new Error('la barra sigue en Calma');
  await pag.keyboard.press('Escape');
  await pag.waitForSelector('.cabecera');
});

await paso('los datos sobreviven a recargar', async () => {
  await pag.reload();
  await entrar(pag);
  const m = await pag.getAttribute('.texto [data-v="16"] .t', 'data-m');
  const notas = await pag.locator('.texto [data-v="16"] .marca-nota').count();
  if (m !== 'rojo' || !notas) throw new Error(`m=${m} notas=${notas}`);
  const guardados = await pag.textContent('.cab-guardados span');
  if (guardados !== '01') throw new Error(`guardados=${guardados}`);
});

await paso('interlineal griego de Jn 3:16 con glosas en español', async () => {
  await ir(pag, 'jn 3:16');
  await pag.waitForTimeout(800);
  await abrirEstudio(pag);
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

await paso('tocar otro versículo reemplaza la selección y el estudio lo sigue', async () => {
  await pag.locator('.texto [data-v="17"] .t').click({ position: { x: 40, y: 12 } });
  await pag.waitForFunction(() => /3:17/.test(document.querySelector('.ori-cabeza h3')?.textContent || ''));
  const sel = await pag.evaluate(() => [...document.querySelectorAll('.texto .v.sel')].map((e) => e.dataset.v).join(','));
  if (sel !== '17') throw new Error('selección: ' + sel);
  await pag.keyboard.down('Control');
  await pag.locator('.texto [data-v="18"] .num').click();
  await pag.keyboard.up('Control');
  const dos = await pag.evaluate(() => [...document.querySelectorAll('.texto .v.sel')].map((e) => e.dataset.v).join(','));
  if (dos !== '17,18') throw new Error('Ctrl + clic: ' + dos);
});

await paso('interlineal hebreo de Gn 1:1 (derecha a izquierda)', async () => {
  await ir(pag, 'gn 1:1');
  await pag.waitForSelector('.interlineal.hebreo .palabra-orig');
  const dir = await pag.getAttribute('.interlineal', 'dir');
  const w = await pag.locator('.interlineal .palabra-orig:first-child .orig').textContent();
  console.log('      dir:', dir, '· primera palabra:', w);
  await pag.click('.interlineal .palabra-orig:nth-child(2)');
  await pag.waitForSelector('.definicion');
});
await pag.screenshot({ path: `${OUT}/11-interlineal-hebreo.png` });

await paso('interfaz en inglés', async () => {
  await pag.click('.cab-accion[aria-label="Ajustes"]');
  await pag.selectOption('#aj-idioma', 'en');
  await pag.waitForSelector('.dlg-cabeza h2:has-text("Settings")');
  await pag.click('.dlg-cabeza .ico');
  await ir(pag, 'john 3:16');
  await pag.waitForFunction(() => /^John\s*3/.test(document.querySelector('.cap-titulo')?.textContent || ''));
  await abrirEstudio(pag);
  const tab = await pag.locator('.pestanas-estudio [role="tab"]').first().textContent();
  const nav = await pag.locator('.cab-link').nth(1).textContent();
  const sobre = await pag.textContent('.cap-sobre');
  if (tab !== 'Word' || nav !== 'Library' || !/New Testament/.test(sobre)) throw new Error(`${tab} / ${nav} / ${sobre}`);
});
await pag.screenshot({ path: `${OUT}/12-ingles.png` });
await pag.click('.cab-accion[aria-label="Settings"]');
await pag.selectOption('#aj-idioma', 'es');
await pag.click('.dlg-cabeza .ico');

await paso('versiones: espectro, descripciones y licencias', async () => {
  await pag.click('.cab-accion[aria-label="Ajustes"]');
  await pag.click('button:has-text("Versiones y clave de Tyndale")');
  await pag.waitForSelector('.espectro li');
  const tipos = await pag.locator('.espectro li').count();
  const filas = await pag.locator('.version-fila').count();
  const sinDesc = await pag.locator('.version-fila:not(:has(.vn-desc))').count();
  const literales = await pag.locator('.espectro li:first-child .esp-ids').textContent();
  if (tipos !== 6 || filas !== 17 || sinDesc || !/YLT/.test(literales)) throw new Error(`${tipos} tipos, ${filas} versiones, ${sinDesc} sin descripción, literales: ${literales}`);
  await pag.click('.version-fila:has-text("PDT ·") button');
  await pag.waitForFunction(() => /PDT/.test(document.querySelector('.cap-sobre')?.textContent || '')
    && /CC BY-SA/.test(document.querySelector('.licencia')?.textContent || '') && document.querySelectorAll('.pagina .v').length > 5);
  await pag.selectOption('.lb-version:not(.lb-paralela) select', 'RV1909');
});
await pag.screenshot({ path: `${OUT}/12b-versiones.png` });

await paso('lector oscuro y vuelta a claro', async () => {
  await pag.click('.lb-control[aria-label="Lector claro u oscuro"]');
  await pag.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await pag.screenshot({ path: `${OUT}/08-oscuro.png` });
  await pag.click('.cab-link:has-text("Biblioteca")');
  await pag.waitForFunction(() => document.documentElement.dataset.theme === 'light'); // el resto de la app sigue claro
  await pag.click('.cab-link:has-text("Leer")');
  await pag.click('.lb-control[aria-label="Lector claro u oscuro"]');
  await pag.waitForFunction(() => document.documentElement.dataset.theme === 'light');
});

// Móvil
const movil = await navegador.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
const pm = await movil.newPage();
pm.on('pageerror', (e) => errores.push('movil pageerror: ' + e.message));
await pm.route('https://api.nlt.to/**', (route) => {
  const u = new URL(route.request().url());
  route.fulfill({ status: 200, contentType: 'text/html', body: falsaNLT(u.searchParams.get('ref'), u.searchParams.get('version')) });
});
await pm.goto(DIRECCION);
await paso('móvil (390 y 320 px): todas las pantallas sin desbordes horizontales', async () => {
  for (const ancho of [390, 320]) {
    await pm.setViewportSize({ width: ancho, height: 844 });
    await pm.goto(DIRECCION);
    await pm.waitForSelector('.inicio-entrada');
    const anchos = { inicio: await pm.evaluate(() => document.documentElement.scrollWidth) };
    for (const [n, nombre] of [[1, 'biblioteca'], [2, 'lector'], [3, 'archivo'], [4, 'laminas']]) {
      if (nombre === 'biblioteca') await pm.click('.inicio-entrada >> nth=1');
      else await pm.click(`.nav-movil button >> nth=${n}`);
      await pm.waitForTimeout(700);
      anchos[nombre] = await pm.evaluate(() => Math.max(...[...document.querySelectorAll('.vista, .lector, html')].map((e) => e.scrollWidth)));
    }
    console.log(`      ${ancho}px:`, JSON.stringify(anchos));
    if (Object.values(anchos).some((w) => w > ancho)) throw new Error('desborde horizontal');
  }
  await pm.setViewportSize({ width: 390, height: 844 });
  await pm.click('.nav-movil button >> nth=2');
  await pm.waitForSelector('.texto .v', { timeout: 20000 });
});
await pm.screenshot({ path: `${OUT}/09-movil.png` });

console.log('pedidos a la API NTV/NLT simulada:', pedidosNLT);
console.log(errores.length ? 'ERRORES:\n' + errores.join('\n') : 'Sin errores de consola.');
await navegador.close();
