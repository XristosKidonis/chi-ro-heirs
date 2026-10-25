<script>
  import Icono from './Icono.svelte';
  import Palabra from './estudio/Palabra.svelte';
  import Original from './estudio/Original.svelte';
  import Referencias from './estudio/Referencias.svelte';
  import Comparar from './estudio/Comparar.svelte';
  import Notas from './estudio/Notas.svelte';
  import Buscar from './estudio/Buscar.svelte';
  import Memoria from './estudio/Memoria.svelte';
  import Progreso from './estudio/Progreso.svelte';
  import { ui } from '../lib/ui.svelte.js';
  import { t } from '../lib/i18n.svelte.js';

  const PESTANAS = ['palabra', 'original', 'refs', 'comparar', 'notas', 'buscar', 'memoria', 'progreso'];
  let cuerpo = $state();
  $effect(() => { ui.pestana; if (cuerpo) cuerpo.scrollTop = 0; });
</script>

<aside class="estudio" class:abierta={ui.estudioAbierto} aria-label={t('barra.estudio')}>
  <div class="pestanas pestanas-estudio" role="tablist">
    {#each PESTANAS as id}
      <button role="tab" aria-selected={ui.pestana === id} onclick={() => (ui.pestana = id)}>{t(`tab.${id}`)}</button>
    {/each}
    <button class="ico cerrar-estudio" onclick={() => (ui.estudioAbierto = false)} aria-label={t('tab.cerrar')}><Icono n="cerrar" /></button>
  </div>
  <div class="estudio-cuerpo" bind:this={cuerpo}>
    {#if ui.pestana === 'palabra'}<Palabra />
    {:else if ui.pestana === 'original'}<Original />
    {:else if ui.pestana === 'refs'}<Referencias />
    {:else if ui.pestana === 'comparar'}<Comparar />
    {:else if ui.pestana === 'notas'}<Notas />
    {:else if ui.pestana === 'buscar'}<Buscar />
    {:else if ui.pestana === 'memoria'}<Memoria />
    {:else}<Progreso />{/if}
  </div>
</aside>
