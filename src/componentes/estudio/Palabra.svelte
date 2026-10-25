<script>
  import { ui, irA } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { info, versionEstudio, buscar, resaltar, strongPorGlosa } from '../../lib/biblia.js';
  import { LIBROS, nombreRef, nombreLibro, abrevLibro } from '../../lib/libros.js';
  import { t } from '../../lib/i18n.svelte.js';
  import Distribucion from './Distribucion.svelte';

  let modo = $state('palabras');
  let res = $state(null);
  let error = $state('');
  let libroFiltro = $state(null);
  let mostrar = $state(40);
  let strongs = $state([]);

  const p = $derived(ui.palabra);
  const vOrigen = $derived(p ? info(p.version || usuario.ajustes.version) : null);
  const vConc = $derived(vOrigen ? (vOrigen.enLinea ? versionEstudio(vOrigen.id) : vOrigen.id) : null);
  const ingles = $derived(vOrigen?.idioma === 'en');

  $effect(() => {
    if (!p || !vConc) return;
    const m = modo;
    const pedido = p;
    res = null; error = ''; libroFiltro = null; mostrar = 40; strongs = [];
    buscar(vConc, pedido.texto, { modo: m === 'prefijo' ? 'prefijo' : 'palabras', limite: 3000 })
      .then((r) => { if (ui.palabra === pedido && modo === m) res = r; })
      .catch((e) => { error = e.message; });
    if (ingles) {
      strongPorGlosa(pedido.texto, LIBROS[pedido.libro - 1].testamento).then((s) => { if (ui.palabra === pedido) strongs = s; });
    }
  });

  const filas = $derived(res ? res.filas.filter((f) => !libroFiltro || f.libro === libroFiltro) : []);
  const enlaces = $derived(p ? [
    ingles
      ? ['Merriam-Webster', `https://www.merriam-webster.com/dictionary/${encodeURIComponent(p.texto)}`]
      : ['Diccionario RAE', `https://dle.rae.es/${encodeURIComponent(p.texto.toLowerCase())}`],
    ['Wikipedia', `https://${ingles ? 'en' : 'es'}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(p.texto)}`],
    [t('pal.interlineal'), `https://biblehub.com/interlinear/${LIBROS[p.libro - 1].biblehub}/${p.cap}-${p.v}.htm`],
    ['Blue Letter Bible', `https://www.blueletterbible.org/kjv/${LIBROS[p.libro - 1].blb}/${p.cap}/${p.v}/`],
  ] : []);
</script>

{#if !p}
  <div class="seccion">
    <p class="cartel">{t('pal.toca')} <em>{t('pal.tocaEm')}</em></p>
    <p class="ayuda">{t('pal.ayuda')}</p>
  </div>
{:else}
  <div class="seccion">
    <h3>{t('pal.titulo', { ref: nombreRef(p.libro, p.cap, p.v) })}</h3>
    <p class="palabra-titulo">{p.texto}</p>
    <div class="interruptor" role="group">
      <button aria-pressed={modo === 'palabras'} onclick={() => (modo = 'palabras')}>{t('pal.exacta')}</button>
      <button aria-pressed={modo === 'prefijo'} onclick={() => (modo = 'prefijo')}>{t('pal.empieza')}</button>
    </div>
    {#if error}
      <p class="nota-pie">{error}</p>
    {:else if !res}
      <p class="nota-pie">{t('pal.contando')}</p>
    {:else}
      <div class="cifras">
        <div class="cifra"><b>{res.total}</b><span>{t('pal.versiculos')}</span></div>
        <div class="cifra"><b>{res.porLibro.length}</b><span>{t('pal.libros')}</span></div>
        <div class="cifra"><b>{res.porLibro.filter((x) => x.libro >= 40).reduce((a, x) => a + x.n, 0)}</b><span>{t('pal.enNT')}</span></div>
      </div>
      {#if vConc !== vOrigen?.id}
        <p class="nota-pie">{t('pal.concEn', { c: vConc, v: vOrigen?.id })}</p>
      {/if}
      {#if res.total}
        <Distribucion porLibro={res.porLibro} bind:filtro={libroFiltro} />
        <ul class="resultados">
          {#each filas.slice(0, mostrar) as f}
            <li><button onclick={() => irA(f.libro, f.cap, f.v)}>
              <span class="r-ref">{nombreRef(f.libro, f.cap, f.v)}</span>
              <span class="r-txt">{@html resaltar(f.texto, p.texto, modo === 'prefijo')}</span>
            </button></li>
          {/each}
        </ul>
        {#if filas.length > mostrar}
          <button class="boton secundario" onclick={() => (mostrar += 60)}>{t('pal.verMas', { n: filas.length - mostrar })}</button>
        {/if}
      {/if}
    {/if}
  </div>

  {#if strongs.length}
    <div class="seccion">
      <h3>{t('pal.originalesKJV', { p: p.texto })}</h3>
      {#each strongs as s}
        <div class="tarjeta">
          <span class="etiqueta-ui">{s.id}</span>
          <div class="strong-lema">{s.lema}</div>
          <div class="strong-translit">{s.translit}</div>
          <p class="strong-def">{s.definicion}</p>
          <a class="enlace-texto" href="https://www.blueletterbible.org/lexicon/{s.id.toLowerCase()}/kjv/" target="_blank" rel="noopener">{t('pal.verBLB')}</a>
        </div>
      {/each}
    </div>
  {/if}

  <div class="seccion">
    <h3>{t('pal.internet')}</h3>
    <div class="enlaces">
      {#each enlaces as [nombre, url]}<a class="enlace" href={url} target="_blank" rel="noopener">{nombre}</a>{/each}
    </div>
  </div>
{/if}
