<script>
  import Icono from './Icono.svelte';
  import Palabra from './estudio/Palabra.svelte';
  import Referencias from './estudio/Referencias.svelte';
  import Comparar from './estudio/Comparar.svelte';
  import Notas from './estudio/Notas.svelte';
  import Buscar from './estudio/Buscar.svelte';
  import Memoria from './estudio/Memoria.svelte';
  import Progreso from './estudio/Progreso.svelte';
  import { ui } from '../lib/ui.svelte.js';

  const PESTANAS = [
    ['palabra', 'Palabra'], ['refs', 'Refs'], ['comparar', 'Comparar'], ['notas', 'Notas'],
    ['buscar', 'Buscar'], ['memoria', 'Memoria'], ['progreso', 'Progreso'],
  ];
  let cuerpo;
  $effect(() => { ui.pestana; if (cuerpo) cuerpo.scrollTop = 0; });
</script>

<aside class="estudio" class:abierta={ui.estudioAbierto} aria-label="Panel de estudio">
  <div class="pestanas pestanas-estudio" role="tablist">
    {#each PESTANAS as [id, nombre]}
      <button role="tab" aria-selected={ui.pestana === id} onclick={() => (ui.pestana = id)}>{nombre}</button>
    {/each}
    <button class="ico cerrar-estudio" onclick={() => (ui.estudioAbierto = false)} aria-label="Cerrar panel"><Icono n="cerrar" /></button>
  </div>
  <div class="estudio-cuerpo" bind:this={cuerpo}>
    {#if ui.pestana === 'palabra'}<Palabra />
    {:else if ui.pestana === 'refs'}<Referencias />
    {:else if ui.pestana === 'comparar'}<Comparar />
    {:else if ui.pestana === 'notas'}<Notas />
    {:else if ui.pestana === 'buscar'}<Buscar />
    {:else if ui.pestana === 'memoria'}<Memoria />
    {:else}<Progreso />{/if}
  </div>
</aside>
