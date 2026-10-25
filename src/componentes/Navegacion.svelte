<script>
  import Icono from './Icono.svelte';
  import { ui, irA } from '../lib/ui.svelte.js';
  import { usuario, alternarCinta } from '../lib/usuario.svelte.js';
  import { LIBROS, nombreRef } from '../lib/libros.js';

  let pestana = $state('libros');
  let abierto = $state(usuario.ajustes.pos.libro);
  const pos = $derived(usuario.ajustes.pos);

  let cuerpo = $state();
  $effect(() => {
    abierto = pos.libro;
    // lleva el libro actual a la vista
    requestAnimationFrame(() => cuerpo?.querySelector('.libro-btn.actual')?.scrollIntoView({ block: 'start' }));
  });

  const fecha = (t) => new Date(t).toLocaleDateString('es', { day: 'numeric', month: 'short' });
</script>

<nav class="nav" class:abierta={ui.navAbierta} aria-label="Libros">
  <div class="pestanas" role="tablist">
    {#each [['libros', 'Libros'], ['cintas', 'Cintas'], ['historial', 'Historial']] as [id, nombre]}
      <button role="tab" aria-selected={pestana === id} onclick={() => (pestana = id)}>{nombre}</button>
    {/each}
  </div>
  <div class="nav-cuerpo" bind:this={cuerpo}>
    {#if pestana === 'libros'}
      {#each ['AT', 'NT'] as t}
        <div class="testamento">{t === 'AT' ? 'Antiguo Testamento' : 'Nuevo Testamento'}</div>
        {#each LIBROS.filter((l) => l.testamento === t) as l (l.n)}
          {@const leidos = Array.from({ length: l.capitulos }, (_, i) => usuario.leidos[`${l.n}.${i + 1}`]).filter(Boolean).length}
          <button class="libro-btn" class:actual={pos.libro === l.n} onclick={() => (abierto = abierto === l.n ? 0 : l.n)}
            aria-expanded={abierto === l.n}>
            <span>{l.nombre}</span><small>{leidos ? `${leidos}/` : ''}{l.capitulos}</small>
          </button>
          {#if abierto === l.n}
            <div class="caps">
              {#each Array.from({ length: l.capitulos }, (_, i) => i + 1) as c}
                <button class:actual={pos.libro === l.n && pos.cap === c} class:leido={usuario.leidos[`${l.n}.${c}`]}
                  onclick={() => irA(l.n, c)} aria-label="{l.nombre} {c}">{c}</button>
              {/each}
            </div>
          {/if}
        {/each}
      {/each}
    {:else if pestana === 'cintas'}
      {#if usuario.cintas.length}
        <ul class="lista-simple">
          {#each usuario.cintas as c (c.id)}
            <li>
              <button class="ir-a" onclick={() => irA(c.libro, c.cap)}>{nombreRef(c.libro, c.cap)}<small>Cinta puesta el {fecha(c.creada)}</small></button>
              <button class="ico" onclick={() => alternarCinta(c.libro, c.cap)} aria-label="Quitar cinta" title="Quitar cinta"><Icono n="cerrar" /></button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="vacio-nav">Toca las cintas en la esquina de la página para marcar un capítulo, como en tu Biblia de papel.</p>
      {/if}
    {:else}
      {#if usuario.ajustes.historial.length}
        <ul class="lista-simple">
          {#each usuario.ajustes.historial as h}
            <li><button class="ir-a" onclick={() => irA(h.libro, h.cap)}>{nombreRef(h.libro, h.cap)}</button></li>
          {/each}
        </ul>
      {:else}
        <p class="vacio-nav">Aquí aparecerán los últimos capítulos que abras.</p>
      {/if}
    {/if}
  </div>
  <div class="nav-pie">
    <button class="boton-linea" onclick={() => (ui.dialogo = 'versiones')}>Versiones</button>
    <button class="boton-linea" onclick={() => (ui.dialogo = 'ajustes')}>Ajustes</button>
    <button class="boton-linea" onclick={() => (ui.dialogo = 'respaldo')}>Respaldo</button>
  </div>
</nav>
