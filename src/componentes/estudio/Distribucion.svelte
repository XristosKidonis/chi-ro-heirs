<script>
  // Barras de los 66 libros: dónde se concentra una palabra. Tocar una barra filtra ese libro.
  import { LIBROS, nombreLibro, abrevLibro } from '../../lib/libros.js';
  import { t } from '../../lib/i18n.svelte.js';

  let { porLibro = [], filtro = $bindable(null) } = $props();
  const max = $derived(Math.max(1, ...porLibro.map((x) => x.n)));
  const conteo = $derived(Object.fromEntries(porLibro.map((x) => [x.libro, x.n])));
  const pico = $derived(porLibro.length ? porLibro.reduce((a, b) => (b.n > a.n ? b : a)) : null);
  const alternar = (n) => (filtro = filtro === n ? null : n);
</script>

<div class="distribucion">
  <svg viewBox="0 0 660 90" role="img" aria-label={t('pal.distribucion')}>
    <rect class="base" x="0" y="80" width="660" height="1" />
    <rect class="base" x="389" y="6" width="1" height="74" />
    {#each LIBROS as l, i}
      {@const n = conteo[l.n] || 0}
      {#if n}
        {@const h = Math.max(2, (n / max) * 66)}
        <rect class="barra-d" class:on={filtro === l.n} x={i * 10 + 1} y={80 - h} width="8" height={h}
          role="button" tabindex="0" aria-label="{nombreLibro(l)}: {n}"
          onclick={() => alternar(l.n)} onkeydown={(e) => e.key === 'Enter' && alternar(l.n)}>
          <title>{nombreLibro(l)}: {n}</title>
        </rect>
      {/if}
    {/each}
    {#if pico}
      <text class="pico" x={Math.min(Math.max((pico.libro - 1) * 10 + 5, 30), 630)} y={80 - (pico.n / max) * 66 - 5} text-anchor="middle">{abrevLibro(LIBROS[pico.libro - 1])}</text>
    {/if}
  </svg>
  <div class="dist-pie"><span>{nombreLibro(LIBROS[0])}</span><span>{nombreLibro(LIBROS[39])}</span><span>{nombreLibro(LIBROS[65])}</span></div>
</div>
<p class="nota-pie">{filtro ? t('pal.soloLibro', { libro: nombreLibro(LIBROS[filtro - 1]) }) : t('pal.tocaBarra')}</p>
