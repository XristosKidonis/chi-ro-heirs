<script>
  // Una imagen del expediente con su pie (qué es, autor, fecha y licencia). Se abre en grande al tocarla.
  import { ui } from '../../lib/ui.svelte.js';
  import { t, idioma } from '../../lib/i18n.svelte.js';
  let { img, chica = false, pie = true } = $props();
</script>

<figure class="his-fig" class:chica>
  <button class="his-fig-img" onclick={() => (ui.visor = img)} aria-label="{t('his.ampliar')}: {img.titulo[idioma()]}">
    <img src={img.src} alt={img.titulo[idioma()]} loading={pie ? "lazy" : "eager"} decoding="async" />
  </button>
  {#if pie}
    <figcaption><b>{img.titulo[idioma()]}</b> · {img.autor} · {img.fecha} · <span class="his-lic">{img.licencia}</span></figcaption>
  {/if}
</figure>
