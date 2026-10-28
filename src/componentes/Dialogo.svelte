<script>
  import Icono from './Icono.svelte';
  import Versiones from './dialogos/Versiones.svelte';
  import Ajustes from './dialogos/Ajustes.svelte';
  import Respaldo from './dialogos/Respaldo.svelte';
  import Laminas from './dialogos/Laminas.svelte';
  import Clave from './dialogos/Clave.svelte';
  import Ambiente from './dialogos/Ambiente.svelte';
  import Evidencia from './dialogos/Evidencia.svelte';
  import { ui } from '../lib/ui.svelte.js';
  import { t } from '../lib/i18n.svelte.js';
  let dlg;

  $effect(() => {
    if (!dlg) return;
    if (ui.dialogo && !dlg.open) dlg.showModal();
    if (!ui.dialogo && dlg.open) dlg.close();
  });
</script>

<!-- Esc apaga el diálogo directamente (oncancel); el aviso de «cerrado» llega un instante después y se ignora
     si para entonces ya se abrió otro, para no cerrarlo (como en el buscador) -->
<dialog class="dlg" class:dlg-ancho={ui.dialogo === 'poster' || ui.dialogo === 'evidencia'} bind:this={dlg}
  onclose={() => { if (dlg.open) return; ui.dialogo = null; ui.lamina = null; }}
  oncancel={(e) => { e.preventDefault(); ui.dialogo = null; ui.lamina = null; }} aria-labelledby="dlg-titulo">
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
      {:else if ui.dialogo === 'clave'}<Clave />
      {:else if ui.dialogo === 'ambiente'}<Ambiente />
      {:else if ui.dialogo === 'evidencia'}<Evidencia />{/if}
    </div>
  {/if}
</dialog>
