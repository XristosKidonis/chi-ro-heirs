<script>
  import { ui, etiquetaSeleccion, avisar } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { normalizar } from '../../lib/libros.js';
  import { guardarArchivo } from '../../lib/archivos.js';
  import { t } from '../../lib/i18n.svelte.js';

  const ESTILOS = {
    cuero: { fondo: '#0d0c0b', tinta: '#efece6', acento: '#e55a50', grano: 0.10 },
    papel: { fondo: '#f7f6f2', tinta: '#0e0e0e', acento: '#b3201e', grano: 0.07 },
    lacre: { fondo: '#a51d1a', tinta: '#f7f3ec', acento: '#0e0e0e', grano: 0.12 },
  };
  const ANCHO = 1080;
  const ALTO = 1350;
  const M = 96;

  let estilo = $state('cuero');
  let url = $state('');
  let lienzo = $state();

  const texto = $derived.by(() => {
    const s = new Set(ui.seleccion);
    return ui.cap.versos.filter((x) => s.has(x.v)).map((x) => x.texto).join(' ');
  });
  const referencia = $derived(etiquetaSeleccion());
  const clavePalabra = $derived(ui.palabra ? normalizar(ui.palabra.texto) : '');

  function emblema(ctx, x, y, tam, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(tam / 100, tam / 100);
    ctx.strokeStyle = color;
    ctx.lineCap = 'butt';
    const trazos = [['M50 12 V90', 8.5], ['M50 14 C78 11 81 48 58 46', 5], ['M27 38 L73 84', 8.5], ['M73 38 L27 84', 2.6], ['M42 90 H58', 2.6]];
    for (const [d, w] of trazos) { ctx.lineWidth = w; ctx.stroke(new Path2D(d)); }
    ctx.restore();
  }

  function lineas(ctx, palabras, ancho) {
    const out = [];
    let actual = [];
    for (const w of palabras) {
      const prueba = [...actual, w].join(' ');
      if (actual.length && ctx.measureText(prueba).width > ancho) { out.push(actual); actual = [w]; }
      else actual.push(w);
    }
    if (actual.length) out.push(actual);
    return out;
  }

  async function dibujar() {
    if (!lienzo || !texto) return;
    const e = ESTILOS[estilo];
    await Promise.all(['120px Anton', '80px "Pinyon Script"', '600 26px Archivo'].map((f) => document.fonts.load(f).catch(() => {})));
    const ctx = lienzo.getContext('2d');
    ctx.fillStyle = e.fondo;
    ctx.fillRect(0, 0, ANCHO, ALTO);

    // grano fotográfico
    const g = document.createElement('canvas');
    g.width = g.height = 200;
    const gc = g.getContext('2d');
    const img = gc.createImageData(200, 200);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    gc.putImageData(img, 0, 0);
    ctx.save();
    ctx.globalAlpha = e.grano;
    ctx.fillStyle = ctx.createPattern(g, 'repeat');
    ctx.fillRect(0, 0, ANCHO, ALTO);
    ctx.restore();

    // cabecera
    ctx.fillStyle = e.tinta;
    ctx.font = '600 24px Archivo, sans-serif';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '6px';
    ctx.fillText('CHI-RO HEIRS', M, M + 10);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    emblema(ctx, ANCHO - M - 64, M - 34, 64, e.tinta);

    // versículo en cartel: el tamaño se ajusta para que quepa
    const palabras = texto.toUpperCase().replace(/[«»"“”]/g, '').split(/\s+/).filter(Boolean);
    const anchoTexto = ANCHO - 2 * M;
    const altoMax = ALTO - 2 * M - 330;
    let tam = 150;
    let ls;
    while (tam > 34) {
      ctx.font = `${tam}px Anton, Impact, sans-serif`;
      ls = lineas(ctx, palabras, anchoTexto);
      if (ls.length * tam * 1.02 <= altoMax) break;
      tam -= 4;
    }
    let y = M + 150 + tam * 0.85;
    for (const linea of ls) {
      let x = M;
      for (const w of linea) {
        const limpia = normalizar(w).replace(/[^a-z0-9]/g, '');
        ctx.fillStyle = clavePalabra && limpia === clavePalabra.replace(/[^a-z0-9]/g, '') ? e.acento : e.tinta;
        ctx.fillText(w, x, y);
        x += ctx.measureText(w + ' ').width;
      }
      y += tam * 1.02;
    }

    // referencia caligráfica y versión
    ctx.fillStyle = e.tinta;
    ctx.font = '86px "Pinyon Script", cursive';
    ctx.fillText(referencia, M, ALTO - M - 70);
    ctx.fillStyle = e.acento;
    ctx.fillRect(M, ALTO - M - 34, 80, 4);
    ctx.fillStyle = e.tinta;
    ctx.font = '600 22px Archivo, sans-serif';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '5px';
    ctx.fillText(usuario.ajustes.version, M, ALTO - M + 4);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    url = lienzo.toDataURL('image/png');
  }

  $effect(() => { estilo; texto; clavePalabra; dibujar(); });

  async function guardar() {
    const blob = await new Promise((r) => lienzo.toBlob(r, 'image/png'));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const nombre = `${referencia.replace(/[^\p{L}\d]+/gu, '-')}.png`;
    try {
      if (await guardarArchivo(nombre, bytes, { name: 'Imagen', extensions: ['png'] })) avisar(t('pos.guardado'));
    } catch (e) {
      avisar(t('app.noGuardar', { e: e.message || e }), true);
    }
  }
</script>

{#if !texto}
  <p class="ayuda">{t('pos.elige')}</p>
{:else}
  <canvas bind:this={lienzo} width={ANCHO} height={ALTO} hidden></canvas>
  <div class="poster-vista">{#if url}<img src={url} alt={t('pos.alt', { ref: referencia })} />{/if}</div>
  <div class="fila-botones">
    <div class="interruptor" role="group" aria-label={t('pos.estilo')}>
      <button aria-pressed={estilo === 'cuero'} onclick={() => (estilo = 'cuero')}>{t('pos.cuero')}</button>
      <button aria-pressed={estilo === 'papel'} onclick={() => (estilo = 'papel')}>{t('pos.papel')}</button>
      <button aria-pressed={estilo === 'lacre'} onclick={() => (estilo = 'lacre')}>{t('pos.lacre')}</button>
    </div>
    <button class="boton" onclick={guardar}>{t('pos.guardar')}</button>
  </div>
  <p class="nota-pie">{ui.palabra ? t('pos.resaltada', { p: ui.palabra.texto }) : ''}{t('pos.tocaOtra')}</p>
{/if}
