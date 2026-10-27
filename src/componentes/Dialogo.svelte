<script>
  import Icono from './Icono.svelte';
  import Versiones from './dialogos/Versiones.svelte';
  import Ajustes from './dialogos/Ajustes.svelte';
  import Respaldo from './dialogos/Respaldo.svelte';
  import Laminas from './dialogos/Laminas.svelte';
  import Clave from './dialogos/Clave.svelte';
  import { ui } from '../lib/ui.svelte.js';
  import { t } from '../lib/i18n.svelte.js';
  let dlg;

  $effect(() => {
    if (!dlg) return;
    if (ui.dialogo && !dlg.open) dlg.showModal();
    if (!ui.dialogo && dlg.open) dlg.close();
  });
</script>

<dialog class="dlg" class:dlg-ancho={ui.dialogo === 'poster'} bind:this={dlg} onclose={() => { ui.dialogo = null; ui.lamina = null; }} aria-labelledby="dlg-titulo">
  {#if ui.dialogo}
    <div class="dlg-cabeza">
      <h2 id="dlg-titulo">{t(`dlg.${ui.dialogo}`)}</h2>
      <button class="ico" onclick={() => (ui.dialogo = null)} aria-label={t('dlg.cerrar')}><Icono n="cerrar" /></button>
    </div>
    <div class="dlg-cuerpo">
      {#if ui.dialogo === 'versiones'}<Versiones />
      {:else if ui.dialogo === 'ajustes'}<Ajustes />
      {:else if ui.dialogo === 'respaldo'}<Respaldo />
      {:else if ui.dialogo === 'poster'}<Laminas />
      {:else if ui.dialogo === 'clave'}<Clave />{/if}
    </div>
  {/if}
</dialog>
