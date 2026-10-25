<script>
  import { ui, irA } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { referencias, pasaje, info, versionEstudio } from '../../lib/biblia.js';
  import { nombreRef } from '../../lib/libros.js';

  let lista = $state(null);
  const v = $derived(ui.seleccion.length ? Math.min(...ui.seleccion) : null);
  const pos = $derived(usuario.ajustes.pos);
  // Los textos de las referencias salen de una versión local (instantáneo y sin conexión)
  const vTexto = $derived(versionEstudio(usuario.ajustes.version));

  $effect(() => {
    if (!v) { lista = null; return; }
    const pedido = `${pos.libro}.${pos.cap}.${v}`;
    lista = null;
    referencias(pos.libro, pos.cap, v).then(async (refs) => {
      const conTexto = await Promise.all(refs.map(async (r) => ({ ...r, texto: await pasaje(vTexto, r.libro, r.cap, r.v, r.hasta) })));
      if (pedido === `${pos.libro}.${pos.cap}.${v}`) lista = conTexto;
    });
  });
</script>

{#if !v}
  <p class="cartel">Elige un <em>versículo.</em></p>
  <p class="ayuda">Toca un versículo para ver los pasajes relacionados que más votó la comunidad de OpenBible.info, con su texto.</p>
{:else}
  <h3>Referencias cruzadas de {nombreRef(pos.libro, pos.cap, v)}</h3>
  {#if !lista}
    <p class="nota-pie">Buscando…</p>
  {:else if !lista.length}
    <p class="ayuda">Este versículo no tiene referencias cruzadas con suficientes votos.</p>
  {:else}
    <ul class="resultados">
      {#each lista as r}
        <li><button onclick={() => irA(r.libro, r.cap, r.v)}>
          <span class="r-ref">{nombreRef(r.libro, r.cap, r.v, r.hasta)}</span>
          <span class="r-txt">{r.texto}</span>
        </button></li>
      {/each}
    </ul>
    <p class="nota-pie">Texto en {info(vTexto)?.nombre}. Ordenadas por votos de la comunidad. Fuente: OpenBible.info (CC BY).</p>
  {/if}
{/if}
