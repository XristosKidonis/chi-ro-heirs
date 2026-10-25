<script>
  import { ui, irA } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { buscar, resaltar, versionEstudio, info } from '../../lib/biblia.js';
  import { LIBROS, nombreRef } from '../../lib/libros.js';

  let q = $state('');
  let modo = $state('palabras');
  let ambito = $state('todo');
  let res = $state(null);
  let mostrar = $state(50);
  let ms = $state(0);
  let entrada;

  const version = $derived(versionEstudio(usuario.ajustes.version));
  const actual = $derived(info(usuario.ajustes.version));

  // Lo que se escribe en la barra superior llega aquí
  $effect(() => {
    if (ui.busqueda) {
      q = ui.busqueda;
      ui.busqueda = '';
      ejecutar();
    }
  });

  async function ejecutar(e) {
    e?.preventDefault();
    if (!q.trim()) { res = null; return; }
    const t0 = performance.now();
    const amb = ambito === 'libro' ? usuario.ajustes.pos.libro : ambito;
    res = await buscar(version, q, { modo, ambito: amb, limite: 500 });
    ms = Math.round(performance.now() - t0);
    mostrar = 50;
  }

  $effect(() => { if (ui.pestana === 'buscar' && !q) entrada?.focus({ preventScroll: true }); });
</script>

<form class="form" onsubmit={ejecutar} role="search">
  <h3>Buscar en {info(version)?.nombre}</h3>
  <input class="campo" type="search" bind:this={entrada} bind:value={q} placeholder="gracia, «el Señor es mi pastor», luz del mundo…" aria-label="Texto a buscar" />
  <div class="filtros">
    <select class="campo" bind:value={modo} onchange={() => ejecutar()} aria-label="Modo">
      <option value="palabras">Todas las palabras</option>
      <option value="frase">Frase exacta</option>
      <option value="prefijo">Palabras que empiezan así</option>
    </select>
    <select class="campo" bind:value={ambito} onchange={() => ejecutar()} aria-label="Dónde buscar">
      <option value="todo">Toda la Biblia</option>
      <option value="AT">Antiguo Testamento</option>
      <option value="NT">Nuevo Testamento</option>
      <option value="libro">Solo {LIBROS[usuario.ajustes.pos.libro - 1].nombre}</option>
    </select>
  </div>
  <button class="boton" type="submit">Buscar</button>
  {#if actual?.enLinea}
    <p class="nota-pie">La {actual.id} se lee en línea y no se puede indexar en tu equipo, así que la búsqueda usa la {version}. Al abrir un resultado lo lees en la {actual.id}.</p>
  {/if}
</form>

{#if res}
  <div class="seccion" style="margin-top: 22px">
    <h3>{res.total} {res.total === 1 ? 'versículo' : 'versículos'} · {ms} ms</h3>
    {#if !res.total}
      <p class="ayuda">No hay coincidencias. Prueba con menos palabras o con «Palabras que empiezan así».</p>
    {/if}
    <ul class="resultados">
      {#each res.filas.slice(0, mostrar) as f}
        <li><button onclick={() => irA(f.libro, f.cap, f.v)}>
          <span class="r-ref">{nombreRef(f.libro, f.cap, f.v)}</span>
          <span class="r-txt">{@html resaltar(f.texto, q, modo === 'prefijo')}</span>
        </button></li>
      {/each}
    </ul>
    {#if res.filas.length > mostrar}
      <button class="boton secundario" onclick={() => (mostrar += 50)}>Ver más</button>
    {/if}
    {#if res.total > res.filas.length}<p class="nota-pie">Se muestran los primeros {res.filas.length}. Afina la búsqueda para ver el resto.</p>{/if}
  </div>
{/if}
