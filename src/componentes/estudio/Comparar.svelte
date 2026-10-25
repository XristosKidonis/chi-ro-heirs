<script>
  import { ui, etiquetaSeleccion } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { lista as versiones, pasaje } from '../../lib/biblia.js';

  let filas = $state([]);
  const pos = $derived(usuario.ajustes.pos);
  const rango = $derived(ui.seleccion.length ? [Math.min(...ui.seleccion), Math.max(...ui.seleccion)] : null);

  let pedido = 0;
  $effect(() => {
    if (!rango) { filas = []; return; }
    const [a, b] = rango;
    const { libro, cap } = pos;
    const clave = usuario.ajustes.claveNLT;
    const n = ++pedido;
    const nuevas = versiones().map((v) => ({ v, texto: null, error: '' }));
    filas = nuevas;
    nuevas.forEach((f, i) => {
      pasaje(f.v.id, libro, cap, a, b, clave)
        .then((t) => { if (n === pedido) filas[i].texto = t || '—'; })
        .catch((e) => { if (n === pedido) filas[i].error = e.message; });
    });
  });
</script>

{#if !rango}
  <p class="cartel">Compara <em>traducciones.</em></p>
  <p class="ayuda">Selecciona uno o varios versículos para leerlos en todas tus versiones, una debajo de otra.</p>
{:else}
  <h3>{etiquetaSeleccion()} en {filas.length} versiones</h3>
  {#each filas as f (f.v.id)}
    <div class="comparar-item">
      <span class="r-ref">{f.v.id} · {f.v.nombre}</span>
      {#if f.error}<p class="nota-pie">{f.error}</p>
      {:else}<p class="ref-texto">{f.texto ?? 'Cargando…'}</p>{/if}
    </div>
  {/each}
{/if}
