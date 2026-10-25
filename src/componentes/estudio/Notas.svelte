<script>
  import { ui, irA, clavesSeleccion, etiquetaSeleccion, avisar } from '../../lib/ui.svelte.js';
  import { usuario, guardarNota, borrarNota, TIPOS_NOTA, indiceRetroenlaces } from '../../lib/usuario.svelte.js';
  import { referenciasEnTexto, desclave, nombreRef, normalizar } from '../../lib/libros.js';
  import { t, fecha as fechaLocal } from '../../lib/i18n.svelte.js';

  let tipo = $state('Nota');
  let texto = $state('');
  let editando = $state(null);
  let filtroTexto = $state('');
  let filtroTipo = $state('');
  let soloPendientes = $state(false);
  let confirmar = $state(null);
  let area = $state();

  const claves = $derived(clavesSeleccion());
  const deEstos = $derived(usuario.notas.filter((n) => claves.includes(n.ref)));
  const retro = $derived(indiceRetroenlaces(usuario.notas));
  const mencionan = $derived([...new Set(claves.flatMap((k) => retro[k] || []))]
    .map((id) => usuario.notas.find((n) => n.id === id)).filter(Boolean));

  const filtradas = $derived(usuario.notas.filter((n) => {
    if (filtroTipo && n.tipo !== filtroTipo) return false;
    if (soloPendientes && (n.tipo !== 'Pregunta' || n.respondida)) return false;
    if (filtroTexto && !normalizar(n.texto).includes(normalizar(filtroTexto))) return false;
    return true;
  }));
  const etiquetas = $derived([...new Set(usuario.notas.flatMap((n) => n.texto.match(/#[\p{L}\d_-]+/gu) || []))].slice(0, 30));

  $effect(() => {
    if (ui.pestana === 'notas' && ui.seleccion.length && area) area.focus({ preventScroll: true });
  });

  function guardar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    if (editando) {
      guardarNota({ ...editando, tipo, texto: texto.trim() });
      avisar(t('notas.actualizada'));
    } else {
      const s = [...ui.seleccion].sort((a, b) => a - b);
      guardarNota({ ref: claves[0], hasta: s.length > 1 ? s.at(-1) : null, tipo, texto: texto.trim() });
      avisar(t('notas.guardada'));
    }
    texto = ''; editando = null; tipo = 'Nota';
  }

  function editar(n) {
    editando = n; tipo = n.tipo; texto = n.texto;
    const { libro, cap, v } = desclave(n.ref);
    irA(libro, cap, v);
  }

  // Parte el texto en trozos: texto normal, referencias bíblicas (enlaces) y #etiquetas
  function trozos(tx) {
    const marcas = referenciasEnTexto(tx).map((r) => ({ ...r, tipo: 'ref' }));
    const re = /#[\p{L}\d_-]+/gu;
    let m;
    while ((m = re.exec(tx))) marcas.push({ inicio: m.index, fin: m.index + m[0].length, tipo: 'tag' });
    marcas.sort((a, b) => a.inicio - b.inicio);
    const out = [];
    let pos = 0;
    for (const x of marcas) {
      if (x.inicio < pos) continue;
      if (x.inicio > pos) out.push({ t: tx.slice(pos, x.inicio) });
      out.push({ t: tx.slice(x.inicio, x.fin), ref: x.ref, tag: x.tipo === 'tag' });
      pos = x.fin;
    }
    if (pos < tx.length) out.push({ t: tx.slice(pos) });
    return out;
  }

  const fecha = (ms) => fechaLocal(ms, { day: 'numeric', month: 'short', year: 'numeric' });
  const refNota = (n) => { const r = desclave(n.ref); return nombreRef(r.libro, r.cap, r.v, n.hasta); };
</script>

{#snippet tarjeta(n)}
  <article class="nota">
    <div class="nota-meta">
      <span class="nota-tipo" class:respondida={n.respondida}>{t(`notas.tipo.${n.tipo}`)}</span>
      <span class="nota-fecha">{fecha(n.creada)}</span>
    </div>
    <button class="nota-ref" onclick={() => { const r = desclave(n.ref); irA(r.libro, r.cap, r.v); }}>{refNota(n)}</button>
    <p class="nota-texto">{#each trozos(n.texto) as p}{#if p.ref}<button class="ref-link" onclick={() => irA(p.ref.libro, p.ref.cap, p.ref.v)}>{p.t}</button>{:else if p.tag}<button class="ref-link etiqueta" onclick={() => (filtroTexto = p.t)}>{p.t}</button>{:else}{p.t}{/if}{/each}</p>
    <div class="nota-acciones">
      <button class="enlace-texto" onclick={() => editar(n)}>{t('notas.editar')}</button>
      {#if n.tipo === 'Pregunta'}
        <button class="enlace-texto" onclick={() => guardarNota({ ...n, respondida: !n.respondida })}>{n.respondida ? t('notas.reabrir') : t('notas.respondida')}</button>
      {/if}
      {#if confirmar === n.id}
        <button class="enlace-texto" style="color: var(--acento)" onclick={() => { borrarNota(n.id); confirmar = null; }}>{t('notas.siBorrar')}</button>
        <button class="enlace-texto" onclick={() => (confirmar = null)}>{t('notas.cancelar')}</button>
      {:else}
        <button class="enlace-texto" onclick={() => (confirmar = n.id)}>{t('notas.borrar')}</button>
      {/if}
    </div>
  </article>
{/snippet}

{#if ui.seleccion.length || editando}
  <div class="seccion">
    <h3>{editando ? t('notas.editando', { ref: refNota(editando) }) : t('notas.nueva', { ref: etiquetaSeleccion() })}</h3>
    <form class="form" onsubmit={guardar}>
      <div class="tipos" role="group" aria-label={t('notas.tipoAria')}>
        {#each TIPOS_NOTA as tp}<button type="button" class="tipo" aria-pressed={tipo === tp} onclick={() => (tipo = tp)}>{t(`notas.tipo.${tp}`)}</button>{/each}
      </div>
      <textarea class="campo" bind:this={area} bind:value={texto}
        placeholder={t('notas.placeholder')}></textarea>
      <div class="fila-botones">
        <button class="boton" type="submit" disabled={!texto.trim()}>{t('notas.guardar')}</button>
        {#if editando}<button class="boton secundario" type="button" onclick={() => { editando = null; texto = ''; }}>{t('notas.cancelar')}</button>{/if}
      </div>
    </form>
    {#each deEstos as n (n.id)}{@render tarjeta(n)}{/each}
    {#if mencionan.length}
      <h3 style="margin-top: 22px">{t('notas.mencionado')}</h3>
      {#each mencionan as n (n.id)}{@render tarjeta(n)}{/each}
    {/if}
  </div>
{/if}

<div class="seccion">
  <h3>{t('notas.mias', { n: usuario.notas.length })}</h3>
  {#if !usuario.notas.length}
    <p class="cartel">{t('notas.vacia')} <em>{t('notas.vaciaEm')}</em></p>
    <p class="ayuda">{t('notas.vaciaAyuda')}</p>
  {:else}
    <div class="filtros">
      <input class="campo ancho" type="search" placeholder={t('notas.buscar')} bind:value={filtroTexto} aria-label={t('notas.buscar')} />
      <select class="campo" bind:value={filtroTipo} aria-label={t('notas.tipoAria')}>
        <option value="">{t('notas.todos')}</option>
        {#each TIPOS_NOTA as tp}<option value={tp}>{t(`notas.tipo.${tp}`)}</option>{/each}
      </select>
      <label class="check"><input type="checkbox" bind:checked={soloPendientes} /> {t('notas.pendientes')}</label>
    </div>
    {#if etiquetas.length}
      <div class="tipos" style="margin: 8px 0">
        {#each etiquetas as e}<button class="tipo" aria-pressed={filtroTexto === e} onclick={() => (filtroTexto = filtroTexto === e ? '' : e)}>{e}</button>{/each}
      </div>
    {/if}
    {#each filtradas as n (n.id)}{@render tarjeta(n)}{/each}
    {#if !filtradas.length}<p class="nota-pie">{t('notas.ninguna')}</p>{/if}
  {/if}
</div>
