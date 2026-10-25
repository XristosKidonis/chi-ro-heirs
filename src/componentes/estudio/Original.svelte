<script>
  // Interlineal hebreo (AT) y griego (NT) palabra por palabra, con léxico y concordancia por número Strong.
  import { ui, irA } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { interlineal, lexico, concordanciaStrong, textos, versionEstudio } from '../../lib/biblia.js';
  import { LIBROS, nombreRef } from '../../lib/libros.js';
  import { decodificar, sinCantilacion } from '../../lib/morfologia.js';
  import { t, idioma } from '../../lib/i18n.svelte.js';
  import Distribucion from './Distribucion.svelte';

  let palabras = $state(null);
  let elegida = $state(null);
  let entrada = $state(null);
  let conc = $state(null);
  let textosConc = $state({});
  let libroFiltro = $state(null);
  let acentos = $state(false);
  let mostrar = $state(30);

  const pos = $derived(usuario.ajustes.pos);
  const v = $derived(ui.seleccion.length ? Math.min(...ui.seleccion) : null);
  const hebreo = $derived(LIBROS[pos.libro - 1].testamento === 'AT');
  const vTexto = $derived(versionEstudio(usuario.ajustes.version));

  $effect(() => {
    if (!v) { palabras = null; return; }
    const pedido = `${pos.libro}.${pos.cap}.${v}`;
    palabras = null; elegida = null;
    interlineal(pos.libro, pos.cap, v).then((p) => {
      if (pedido === `${pos.libro}.${pos.cap}.${v}`) palabras = p;
    });
  });

  // Al elegir una palabra: definición del léxico y todas sus apariciones
  $effect(() => {
    if (!elegida) { entrada = null; conc = null; return; }
    const w = elegida;
    entrada = null; conc = null; libroFiltro = null; mostrar = 30; textosConc = {};
    lexico(w.strong).then((e) => { if (elegida === w) entrada = e; });
    concordanciaStrong(w.strong).then(async (c) => {
      if (elegida !== w) return;
      conc = c;
      textosConc = await textos(vTexto, c.filas.slice(0, 120));
    });
  });

  const glosa = (w) => (idioma() === 'es' && w.glosa_es ? w.glosa_es : w.glosa);
  const mostrarOriginal = (s) => (hebreo && !acentos ? sinCantilacion(s) : s);
  const filas = $derived(conc ? conc.filas.filter((f) => !libroFiltro || f.libro === libroFiltro) : []);

  async function cargarMas() {
    mostrar += 40;
    const faltan = filas.slice(0, mostrar).filter((f) => !textosConc[`${f.libro}.${f.cap}.${f.v}`]);
    if (faltan.length) textosConc = { ...textosConc, ...(await textos(vTexto, faltan)) };
  }
</script>

{#if !v}
  <p class="cartel">{t('ori.cartel')} <em>{t('ori.cartelEm')}</em></p>
  <p class="ayuda">{t('ori.ayuda')}</p>
{:else}
  <div class="seccion">
    <div class="ori-cabeza">
      <h3>{t('ori.titulo', { lengua: hebreo ? t('ori.hebreo') : t('ori.griego'), ref: nombreRef(pos.libro, pos.cap, v) })}</h3>
      {#if hebreo}
        <label class="check"><input type="checkbox" bind:checked={acentos} /> {t('ori.acentos')}</label>
      {/if}
    </div>
    {#if !palabras}
      <p class="nota-pie">{t('ori.cargando')}</p>
    {:else if !palabras.length}
      <p class="ayuda">{t('ori.sinDatos')}</p>
    {:else}
      <div class="interlineal" class:hebreo dir={hebreo ? 'rtl' : 'ltr'}>
        {#each palabras as w (w.pos)}
          <button class="palabra-orig" class:elegida={elegida === w} class:variante={!!w.variante} onclick={() => (elegida = elegida === w ? null : w)}
            title={w.variante ? t('ori.variante') : decodificar(w.morf, idioma())}>
            <span class="orig" lang={hebreo ? 'he' : 'grc'}>{mostrarOriginal(w.original)}</span>
            <span class="translit" dir="ltr">{w.translit}</span>
            <span class="glosa" dir="ltr">{glosa(w)}</span>
            <span class="strong-num" dir="ltr">{w.strong}</span>
          </button>
        {/each}
      </div>
      {#if !elegida}<p class="nota-pie">{t('ori.toca')}{hebreo && idioma() === 'es' ? ` ${t('ori.glosaIngles')}` : ''}</p>{/if}
    {/if}
  </div>

  {#if elegida}
    <div class="seccion">
      <div class="tarjeta">
        <span class="etiqueta-ui">{elegida.strong}{entrada?.morf ? ` · ${entrada.morf}` : ''}</span>
        <div class="strong-lema" lang={hebreo ? 'he' : 'grc'}>{entrada?.lema || mostrarOriginal(elegida.original)}</div>
        <div class="strong-translit">{entrada?.translit || elegida.translit} — {entrada?.glosa || elegida.glosa}</div>
        <h3 style="margin-top: 14px">{t('ori.morfologia')}</h3>
        <p class="strong-def">{decodificar(elegida.morf, idioma())}</p>
        {#if entrada?.definicion}
          <h3 style="margin-top: 14px">{t('ori.definicion')}</h3>
          <div class="strong-def definicion">{@html entrada.definicion}</div>
        {/if}
        <a class="enlace-texto" href="https://www.blueletterbible.org/lexicon/{elegida.strong.replace(/[A-Za-z]$/, '').toLowerCase()}/kjv/" target="_blank" rel="noopener">{t('pal.verBLB')}</a>
      </div>
    </div>
    {#if conc}
      <div class="seccion">
        <h3>{t('ori.aparece', { veces: conc.veces, n: conc.versiculos })}</h3>
        <Distribucion porLibro={conc.porLibro} bind:filtro={libroFiltro} />
        <ul class="resultados">
          {#each filas.slice(0, mostrar) as f}
            <li><button onclick={() => irA(f.libro, f.cap, f.v)}>
              <span class="r-ref">{nombreRef(f.libro, f.cap, f.v)}</span>
              <span class="r-txt">{textosConc[`${f.libro}.${f.cap}.${f.v}`] || '…'}</span>
            </button></li>
          {/each}
        </ul>
        {#if filas.length > mostrar}
          <button class="boton secundario" onclick={cargarMas}>{t('pal.verMas', { n: filas.length - mostrar })}</button>
        {/if}
      </div>
    {/if}
  {/if}
  <p class="nota-pie">{t('ori.fuente')}</p>
{/if}
