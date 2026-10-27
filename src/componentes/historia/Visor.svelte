<script>
  // Visor a pantalla completa de una imagen de Historia, con su crédito y el enlace a la fuente.
  // Es un <dialog> modal para quedar encima incluso del diálogo «lado a lado».
  import { ui } from '../../lib/ui.svelte.js';
  import { abrirEnNavegador } from '../../lib/archivos.js';
  import { t, idioma } from '../../lib/i18n.svelte.js';
  let dlg;
  const img = $derived(ui.visor);
  $effect(() => {
    if (img && !dlg.open) dlg.showModal();
    if (!img && dlg.open) dlg.close();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog class="visor" bind:this={dlg} onclose={() => (ui.visor = null)} onclick={(e) => e.target === dlg && (ui.visor = null)}
  aria-label={img ? img.titulo[idioma()] : ''}>
  {#if img}
    <img src={img.src} alt={img.titulo[idioma()]} />
    <div class="visor-pie">
      <span><b>{img.titulo[idioma()]}</b> · {img.autor} · {img.fecha} · {img.licencia}</span>
      <button onclick={() => abrirEnNavegador(img.pagina)}>{t('his.verFuenteImagen')} ↗</button>
      <button onclick={() => (ui.visor = null)}>{t('dlg.cerrar')}</button>
    </div>
  {/if}
</dialog>
