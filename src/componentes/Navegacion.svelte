<script>
  import Icono from './Icono.svelte';
  import { ui, irA } from '../lib/ui.svelte.js';
  import { usuario, alternarCinta } from '../lib/usuario.svelte.js';
  import { LIBROS, nombreRef, nombreLibro } from '../lib/libros.js';
  import { t, fecha } from '../lib/i18n.svelte.js';

  let pestana = $state('libros');
  let abierto = $state(usuario.ajustes.pos.libro);
  const pos = $derived(usuario.ajustes.pos);

  let cuerpo = $state();
  $effect(() => {
    abierto = pos.libro;
    // lleva el libro actual a la vista
    requestAnimationFrame(() => cuerpo?.querySelector('.libro-btn.actual')?.scrollIntoView({ block: 'start' }));
  });

</script>

<nav class="nav" class:abierta={ui.navAbierta} aria-label={t('nav.libros')}>
  <div class="pestanas" role="tablist">
    {#each [['libros', t('nav.libros')], ['cintas', t('nav.cintas')], ['historial', t('nav.historial')]] as [id, nombre]}
      <button role="tab" aria-selected={pestana === id} onclick={() => (pestana = id)}>{nombre}</button>
    {/each}
  </div>
  <div class="nav-cuerpo" bind:this={cuerpo}>
    {#if pestana === 'libros'}
      {#each ['AT', 'NT'] as tes}
        <div class="testamento">{tes === 'AT' ? t('nav.at') : t('nav.nt')}</div>
        {#each LIBROS.filter((l) => l.testamento === tes) as l (l.n)}
          {@const leidos = Array.from({ length: l.capitulos }, (_, i) => usuario.leidos[`${l.n}.${i + 1}`]).filter(Boolean).length}
          <button class="libro-btn" class:actual={pos.libro === l.n} onclick={() => (abierto = abierto === l.n ? 0 : l.n)}
            aria-expanded={abierto === l.n}>
            <span>{nombreLibro(l)}</span><small>{leidos ? `${leidos}/` : ''}{l.capitulos}</small>
          </button>
          {#if abierto === l.n}
            <div class="caps">
              {#each Array.from({ length: l.capitulos }, (_, i) => i + 1) as c}
                <button class:actual={pos.libro === l.n && pos.cap === c} class:leido={usuario.leidos[`${l.n}.${c}`]}
                  onclick={() => irA(l.n, c)} aria-label="{nombreLibro(l)} {c}">{c}</button>
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
              <button class="ir-a" onclick={() => irA(c.libro, c.cap)}>{nombreRef(c.libro, c.cap)}<small>{t('nav.cintaPuesta', { fecha: fecha(c.creada) })}</small></button>
              <button class="ico" onclick={() => alternarCinta(c.libro, c.cap)} aria-label={t('nav.quitarCinta')} title={t('nav.quitarCinta')}><Icono n="cerrar" /></button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="vacio-nav">{t('nav.sinCintas')}</p>
      {/if}
    {:else}
      {#if usuario.ajustes.historial.length}
        <ul class="lista-simple">
          {#each usuario.ajustes.historial as h}
            <li><button class="ir-a" onclick={() => irA(h.libro, h.cap)}>{nombreRef(h.libro, h.cap)}</button></li>
          {/each}
        </ul>
      {:else}
        <p class="vacio-nav">{t('nav.sinHistorial')}</p>
      {/if}
    {/if}
  </div>
  <div class="nav-pie">
    <button class="boton-linea" onclick={() => (ui.dialogo = 'versiones')}>{t('nav.versiones')}</button>
    <button class="boton-linea" onclick={() => (ui.dialogo = 'ajustes')}>{t('nav.ajustes')}</button>
    <button class="boton-linea" onclick={() => (ui.dialogo = 'respaldo')}>{t('nav.respaldo')}</button>
  </div>
</nav>
