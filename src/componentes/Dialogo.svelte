<script>
  import Icono from './Icono.svelte';
  import Versiones from './dialogos/Versiones.svelte';
  import Ajustes from './dialogos/Ajustes.svelte';
  import Respaldo from './dialogos/Respaldo.svelte';
  import Poster from './dialogos/Poster.svelte';
  import { ui } from '../lib/ui.svelte.js';

  const TITULOS = { versiones: 'Versiones', ajustes: 'Ajustes', respaldo: 'Respaldo', poster: 'Póster' };
  let dlg;

  $effect(() => {
    if (!dlg) return;
    if (ui.dialogo && !dlg.open) dlg.showModal();
    if (!ui.dialogo && dlg.open) dlg.close();
  });
</script>

<dialog class="dlg" bind:this={dlg} onclose={() => (ui.dialogo = null)} aria-labelledby="dlg-titulo">
  {#if ui.dialogo}
    <div class="dlg-cabeza">
      <h2 id="dlg-titulo">{TITULOS[ui.dialogo]}</h2>
      <button class="ico" onclick={() => (ui.dialogo = null)} aria-label="Cerrar"><Icono n="cerrar" /></button>
    </div>
    <div class="dlg-cuerpo">
      {#if ui.dialogo === 'versiones'}<Versiones />
      {:else if ui.dialogo === 'ajustes'}<Ajustes />
      {:else if ui.dialogo === 'respaldo'}<Respaldo />
      {:else if ui.dialogo === 'poster'}<Poster />{/if}
    </div>
  {/if}
</dialog>
