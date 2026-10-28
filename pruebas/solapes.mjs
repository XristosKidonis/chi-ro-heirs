// Busca controles que se chocan: botones, enlaces, campos y etiquetas cuyas cajas (o su texto, si se sale
// de la caja) se pisan con otro control visible, en cada pantalla y en varios anchos de ventana.
// Uso: con «npm run dev» en marcha, node pruebas/solapes.mjs <carpeta-capturas> [chromium|webkit]
// WebKit es el motor de la app en Mac. Requiere Playwright como navegador.mjs (PLAYWRIGHT_DIR, DIRECCION).
import { createRequire } from 'node:module';

const pw = createRequire(process.env.PLAYWRIGHT_DIR || import.meta.url)('playwright');
const OUT = process.argv[2];
const MOTOR = process.argv[3] || 'chromium';
const DIRECCION = process.env.DIRECCION || 'http://127.0.0.1:1420/';
// la ventana de la app abre en 1360×860 y se puede achicar hasta 380×520
const ANCHOS = [1360, 1280, 1100, 1024, 900, 800, 700, 600, 480, 380];

// Corre dentro de la página: devuelve los pares de controles que se pisan
function buscarSolapes() {
  const SEL = 'button, a[href], select, input:not([type=hidden]):not([type=range]), textarea, [role=button], [role=tab], summary, .etiqueta-ui, .marca-main, .num';
  const visibles = [];
  for (const el of document.querySelectorAll(SEL)) {
    const c = el.getBoundingClientRect();
    if (c.width < 2 || c.height < 2 || c.bottom < 0 || c.top > innerHeight || c.right < 0 || c.left > innerWidth) continue;
    const e = getComputedStyle(el);
    if (e.visibility !== 'visible' || Number(e.opacity) === 0) continue;
    // solo lo que se ve: lo tapado entero por un diálogo o un panel no cuenta. Se miran el centro y cuatro
    // esquinas, porque un control encimado sobre otro tapa una parte, no todo
    const puntos = [[0.5, 0.5], [0.15, 0.2], [0.85, 0.2], [0.15, 0.8], [0.85, 0.8]];
    const seVe = puntos.some(([fx, fy]) => {
      const x = Math.min(innerWidth - 1, Math.max(0, c.left + c.width * fx));
      const y = Math.min(innerHeight - 1, Math.max(0, c.top + c.height * fy));
      const arriba = document.elementFromPoint(x, y);
      return arriba && (el === arriba || el.contains(arriba) || arriba.contains(el));
    });
    if (!seVe) continue;
    // si el texto se sale de la caja, cuenta hasta donde llega el texto
    const r = document.createRange();
    r.selectNodeContents(el);
    const t = r.getBoundingClientRect();
    const caja = t.width ? { l: Math.min(c.left, t.left), t: Math.min(c.top, t.top), r: Math.max(c.right, t.right), b: Math.max(c.bottom, t.bottom) } : { l: c.left, t: c.top, r: c.right, b: c.bottom };
    visibles.push({ el, caja });
  }
  const nombre = (el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}«${(el.textContent || el.getAttribute('aria-label') || el.value || '').trim().slice(0, 24)}»`;
  // La barra de abajo del celular es fija y el contenido pasa por debajo al desplazar: eso no es un choque.
  // Lo que sí importa (que al final nada quede escondido debajo) se mide aparte, en alFinal().
  const bajoBarra = (x, y) => (x.el.closest('.nav-movil') && !y.el.closest('.nav-movil')) || (y.el.closest('.nav-movil') && !x.el.closest('.nav-movil'));
  const pares = [];
  for (let i = 0; i < visibles.length; i++) {
    for (let j = i + 1; j < visibles.length; j++) {
      const a = visibles[i], b = visibles[j];
      if (a.el.contains(b.el) || b.el.contains(a.el) || bajoBarra(a, b)) continue;
      const ancho = Math.min(a.caja.r, b.caja.r) - Math.max(a.caja.l, b.caja.l);
      const alto = Math.min(a.caja.b, b.caja.b) - Math.max(a.caja.t, b.caja.t);
      if (ancho > 2 && alto > 2) pares.push(`${nombre(a.el)} ⨯ ${nombre(b.el)} (${Math.round(ancho)}×${Math.round(alto)} px)`);
    }
  }
  // la barra del lector tiene red de seguridad (se desliza): si la usa, avisa para ajustar sus cortes
  const barra = document.querySelector('.lb-controles');
  if (barra && barra.scrollWidth > barra.clientWidth + 1) pares.push(`la barra del lector no entra: ${barra.scrollWidth - barra.clientWidth} px se deslizan`);
  return pares;
}

// Con la barra de abajo del celular: al llegar al final de la página, lo último no puede quedar debajo de ella
function alFinal() {
  const barra = document.querySelector('.nav-movil');
  if (!barra || getComputedStyle(barra).display === 'none') return [];
  // la página puede desplazarse en la ventana o dentro de un contenedor: se lleva cada uno hasta el final
  const desplazables = [document.scrollingElement, ...document.querySelectorAll('*')].filter((el) => el && el.scrollHeight > el.clientHeight + 2 && (el === document.scrollingElement || /auto|scroll/.test(getComputedStyle(el).overflowY)));
  for (const el of desplazables) el.scrollTop = el.scrollHeight;
  const tope = barra.getBoundingClientRect().top;
  const tapados = [...document.querySelectorAll('main button, main a[href], main input')]
    .filter((el) => { const c = el.getBoundingClientRect(); return c.height > 0 && c.bottom > tope + 2 && c.top < innerHeight && getComputedStyle(el).visibility === 'visible'; });
  for (const el of desplazables) el.scrollTop = 0;
  return tapados.slice(0, 3).map((el) => `al final queda bajo la barra de abajo: ${el.tagName.toLowerCase()}«${el.textContent.trim().slice(0, 24)}»`);
}

const nav = await pw[MOTOR].launch();
const pag = await nav.newPage({ viewport: { width: 1360, height: 860 } });
const errores = [];
pag.on('pageerror', (e) => errores.push(e.message));

// Respuesta simulada de la NTV (como en navegador.mjs) para no depender de la red
await pag.route('https://api.nlt.to/**', (route) => {
  const u = new URL(route.request().url());
  const ref = u.searchParams.get('ref');
  let html = '<div id="bibletext"><section>';
  for (let v = 1; v <= 20; v++) html += `<verse_export vn="${v}"><span class="vn">${v}</span> texto de prueba ${ref}:${v} con algunas palabras más para ocupar el renglón.</verse_export>`;
  route.fulfill({ status: 200, contentType: 'text/html', body: html + '</section></div>' });
});

await pag.goto(DIRECCION);
await pag.waitForSelector('.inicio .marca-grande');

// Cada pantalla se abre con clics, como una persona: se vuelve al inicio (la marca) y se entra por sus cinco
// entradas; después se confirma que llegó antes de medir
const ENTRADAS = { lector: 0, biblioteca: 1, archivo: 2, laminas: 3, historia: 4 };
async function alInicio() {
  if (await pag.locator('.inicio .marca-grande').count()) return;
  await pag.click('.cab-marca');
  await pag.waitForSelector('.inicio .marca-grande');
}
async function entrar(v) {
  await alInicio();
  await pag.click(`.inicio-entrada >> nth=${ENTRADAS[v]}`);
}
async function lector() {
  await entrar('lector');
  await pag.waitForSelector('.texto .v', { timeout: 20000 });
}
async function seleccion() {
  await lector();
  await pag.click('.texto .v[data-v="3"] .t');
}
const pantallas = {
  inicio: ['.inicio .marca-grande', alInicio],
  biblioteca: ['.cubierta', () => entrar('biblioteca')],
  lector: ['.texto .v', lector],
  seleccion: ['.texto .v.sel', seleccion],
  estudio: ['.estudio .pestanas-estudio', async () => { await seleccion(); if ((await pag.getAttribute('.lb-estudio', 'aria-pressed')) !== 'true') await pag.click('.lb-estudio'); }],
  ambiente: ['.amb-musica', async () => { await lector(); await pag.click('.lb-ambiente'); }],
  ajustes: ['.dlg', async () => { await lector(); await pag.click('.cab-acciones .cab-accion:last-child'); }],
  archivo: ['.cab-link.activa:visible, .nav-movil .activa:visible', () => entrar('archivo')],
  laminas: ['.cab-link.activa:visible, .nav-movil .activa:visible', () => entrar('laminas')],
  historia: ['.cab-link.activa:visible, .nav-movil .activa:visible', () => entrar('historia')],
};

const hallazgos = [];
for (const ancho of ANCHOS) {
  await pag.setViewportSize({ width: ancho, height: ancho < 600 ? 760 : 860 });
  for (const [nombre, [llego, ir]] of Object.entries(pantallas)) {
    // Esc quita, en orden, la selección, el Estudio y los diálogos
    for (let k = 0; k < 3; k++) await pag.keyboard.press('Escape').catch(() => {});
    try {
      await ir();
      await pag.waitForSelector(llego, { timeout: 15000 });
    } catch (e) {
      hallazgos.push(`${ancho}px ${nombre}: no se pudo abrir (${e.message.split('\n')[0]})`);
      console.log(`  ${ancho}px ${nombre}: no se pudo abrir`);
      if (OUT) await pag.screenshot({ path: `${OUT}/no-abre-${MOTOR}-${ancho}-${nombre}.png` });
      continue;
    }
    await pag.waitForTimeout(350);
    const pares = [...await pag.evaluate(buscarSolapes), ...await pag.evaluate(alFinal)];
    console.log(`  ${ancho}px ${nombre}: ${pares.length ? pares.length + ' choques' : 'bien'}`);
    if (pares.length) {
      hallazgos.push(...pares.map((p) => `${ancho}px ${nombre}: ${p}`));
      if (OUT) await pag.screenshot({ path: `${OUT}/solape-${MOTOR}-${ancho}-${nombre}.png` });
    }
  }
}
console.log(`${MOTOR}: ${ANCHOS.length} anchos × ${Object.keys(pantallas).length} pantallas`);
console.log(hallazgos.length ? hallazgos.join('\n') : 'Sin controles que se choquen.');
if (errores.length) console.log('ERRORES:', errores.join(' | '));
await nav.close();
process.exitCode = hallazgos.length || errores.length ? 1 : 0;
