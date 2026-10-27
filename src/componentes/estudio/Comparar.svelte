<script>
  import { ui, etiquetaSeleccion } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { lista as versiones, pasaje, info, TIPOS } from '../../lib/biblia.js';
  import { t } from '../../lib/i18n.svelte.js';

  let filas = $state([]);
  let todas = $state(false); // por defecto, solo las del idioma que estás leyendo
  const idiomaActual = $derived(info(usuario.ajustes.version)?.idioma || 'es');
  const pos = $derived(usuario.ajustes.pos);
  const rango = $derived(ui.seleccion.length ? [Math.min(...ui.seleccion), Math.max(...ui.seleccion)] : null);

  let pedido = 0;
  $effect(() => {
    if (!rango) { filas = []; return; }
    const [a, b] = rango;
    const { libro, cap } = pos;
    const clave = usuario.ajustes.claveNLT;
    const n = ++pedido;
    // de la más literal a la más libre, para ver el mismo pasaje recorrer todo el espectro
    const rangoTipo = (v) => (v.tipo ? TIPOS.indexOf(v.tipo) : TIPOS.length);
    const elegidas = versiones()
      .filter((v) => todas || v.idioma === idiomaActual)
      .sort((x, y) => (x.idioma === idiomaActual ? 0 : 1) - (y.idioma === idiomaActual ? 0 : 1) || rangoTipo(x) - rangoTipo(y));
    const nuevas = elegidas.map((v) => ({ v, texto: null, error: '' }));
    filas = nuevas;
    nuevas.forEach((f, i) => {
      pasaje(f.v.id, libro, cap, a, b, clave)
        .then((tx) => { if (n === pedido) filas[i].texto = tx || '—'; })
        .catch((e) => { if (n === pedido) filas[i].error = e.message; });
    });
  });
</script>

{#if !rango}
  <p class="cartel">{t('comp.cartel')} <em>{t('comp.cartelEm')}</em></p>
  <p class="ayuda">{t('comp.ayuda')}</p>
{:else}
  <h3>{t('comp.titulo', { ref: etiquetaSeleccion(), n: filas.length })}</h3>
  {#each filas as f (f.v.id)}
    <div class="comparar-item">
      <span class="r-ref">{f.v.id} · {f.v.nombre}{#if f.v.tipo} <small class="comp-tipo">{t(`tipo.${f.v.tipo}`)}</small>{/if}</span>
      {#if f.error}<p class="nota-pie">{f.error}</p>
      {:else}<p class="ref-texto">{f.texto ?? t('comp.cargando')}</p>{/if}
    </div>
  {/each}
  <button class="boton secundario comp-todas" onclick={() => (todas = !todas)}>{todas ? t('comp.soloIdioma') : t('comp.todas')}</button>
{/if}
