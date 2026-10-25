<script>
  import { ui, irA } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { buscar, resaltar, versionEstudio, info } from '../../lib/biblia.js';
  import { LIBROS, nombreRef, nombreLibro } from '../../lib/libros.js';
  import { t } from '../../lib/i18n.svelte.js';

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
  <h3>{t('bus.en', { v: info(version)?.nombre })}</h3>
  <input class="campo" type="search" bind:this={entrada} bind:value={q} placeholder={t('bus.placeholder')} aria-label={t('bus.texto')} />
  <div class="filtros">
    <select class="campo" bind:value={modo} onchange={() => ejecutar()} aria-label={t('bus.modo')}>
      <option value="palabras">{t('bus.palabras')}</option>
      <option value="frase">{t('bus.frase')}</option>
      <option value="prefijo">{t('bus.prefijo')}</option>
    </select>
    <select class="campo" bind:value={ambito} onchange={() => ejecutar()} aria-label={t('bus.donde')}>
      <option value="todo">{t('bus.toda')}</option>
      <option value="AT">{t('bus.at')}</option>
      <option value="NT">{t('bus.nt')}</option>
      <option value="libro">{t('bus.solo', { libro: nombreLibro(LIBROS[usuario.ajustes.pos.libro - 1]) })}</option>
    </select>
  </div>
  <button class="boton" type="submit">{t('bus.boton')}</button>
  {#if actual?.enLinea}
    <p class="nota-pie">{t('bus.enLinea', { a: actual.id, v: version })}</p>
  {/if}
</form>

{#if res}
  <div class="seccion" style="margin-top: 22px">
    <h3>{t(res.total === 1 ? 'bus.resultado1' : 'bus.resultados', { n: res.total, ms })}</h3>
    {#if !res.total}
      <p class="ayuda">{t('bus.nada')}</p>
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
      <button class="boton secundario" onclick={() => (mostrar += 50)}>{t('bus.verMas')}</button>
    {/if}
    {#if res.total > res.filas.length}<p class="nota-pie">{t('bus.primeros', { n: res.filas.length })}</p>{/if}
  </div>
{/if}
