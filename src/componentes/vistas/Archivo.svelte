<script>
  // Mi archivo: un índice editorial de lo tuyo (versículos guardados, cintas, subrayados y notas),
  // ordenado como la Biblia. Todo sale de usuario.db y cada entrada vuelve a su pasaje.
  import { ui, irA, abrirPestana } from '../../lib/ui.svelte.js';
  import { usuario, alternarGuardado, subrayar, alternarCinta } from '../../lib/usuario.svelte.js';
  import { textos, versionEstudio } from '../../lib/biblia.js';
  import { desclave, nombreRef, normalizar } from '../../lib/libros.js';
  import { t } from '../../lib/i18n.svelte.js';
  import { COLORES, etiquetaColor, significado } from '../../lib/clave.js';

  let filtro = $state('todo');
  let colorFiltro = $state(null); // dentro de «Subrayados»: solo un color de tu clave
  let q = $state('');
  let texto = $state({}); // clave -> texto del versículo
  const version = $derived(versionEstudio(usuario.ajustes.version));

  const orden = (libro, cap, v = 0) => libro * 1e6 + cap * 1e3 + v;

  const entradas = $derived.by(() => {
    const out = [];
    for (const g of usuario.guardados) {
      const r = desclave(g.clave);
      out.push({ id: `g-${g.clave}`, tipo: 'guardado', ...r, k: g.clave });
    }
    for (const c of usuario.cintas) out.push({ id: `c-${c.id}`, tipo: 'cinta', libro: c.libro, cap: c.cap, v: null });
    for (const [k, color] of Object.entries(usuario.subrayados)) {
      const r = desclave(k);
      out.push({ id: `s-${k}`, tipo: 'subrayado', ...r, k, color });
    }
    for (const n of usuario.notas) {
      const r = desclave(n.ref);
      out.push({ id: `n-${n.id}`, tipo: 'nota', ...r, hasta: n.hasta, k: n.ref, nota: n });
    }
    return out.sort((a, b) => orden(a.libro, a.cap, a.v || 0) - orden(b.libro, b.cap, b.v || 0));
  });

  // textos de los versículos guardados y subrayados, en una versión incluida (sin pedir la NTV en lote)
  $effect(() => {
    const faltan = entradas.filter((e) => e.k && e.tipo !== 'nota' && !(e.k in texto)).map((e) => ({ libro: e.libro, cap: e.cap, v: e.v }));
    if (!faltan.length) return;
    textos(version, faltan).then((r) => (texto = { ...texto, ...r })).catch(() => {});
  });

  const FILTROS = [['todo', 'arc.todo'], ['guardados', 'arc.guardados'], ['subrayados', 'arc.subrayados'], ['notas', 'arc.notas']];
  const deFiltro = (e) => filtro === 'todo'
    || (filtro === 'guardados' && (e.tipo === 'guardado' || e.tipo === 'cinta'))
    || (filtro === 'subrayados' && e.tipo === 'subrayado' && (!colorFiltro || e.color === colorFiltro))
    || (filtro === 'notas' && e.tipo === 'nota');
  const porColor = $derived(entradas.reduce((m, e) => (e.tipo === 'subrayado' && (m[e.color] = (m[e.color] || 0) + 1), m), {}));
  const referencia = (e) => nombreRef(e.libro, e.cap, e.v, e.hasta);
  const contenido = (e) => (e.tipo === 'nota' ? e.nota.texto : e.tipo === 'cinta' ? t('arc.cintaTexto') : texto[e.k] || '');

  const visibles = $derived.by(() => {
    const n = normalizar(q.trim());
    return entradas.filter((e) => deFiltro(e) && (!n || normalizar(`${referencia(e)} ${contenido(e)}`).includes(n)));
  });

  // quitar desde el archivo, sin volver al lector (las notas se editan o borran en Estudio → Notas)
  function quitar(e) {
    if (e.tipo === 'guardado') alternarGuardado([e.k]);
    else if (e.tipo === 'subrayado') subrayar([e.k], null);
    else if (e.tipo === 'cinta') alternarCinta(e.libro, e.cap);
  }

  function volver(e) {
    irA(e.libro, e.cap, e.v || null);
    if (e.tipo === 'nota') abrirPestana('notas');
  }
</script>

<section class="pagina-vista" aria-labelledby="arc-titulo">
  <div class="titular">
    <div><span class="sobretitulo">{t('arc.over')}</span><h1 id="arc-titulo">{t('vista.archivo')}</h1></div>
    <p>{t('arc.sub')}</p>
  </div>
  <div class="herramientas">
    <div class="filtros-vista" role="group" aria-label={t('vista.archivo')}>
      {#each FILTROS as [id, etiqueta]}
        <button class="filtro" aria-pressed={filtro === id} onclick={() => { filtro = id; colorFiltro = null; }}>{t(etiqueta)}</button>
      {/each}
    </div>
    <div class="buscar-vista" role="search">
      <span aria-hidden="true">⌕</span>
      <input bind:value={q} placeholder={t('arc.buscar')} aria-label={t('arc.buscar')} autocomplete="off" spellcheck="false" />
    </div>
  </div>
  {#if filtro === 'subrayados'}
    <div class="filtros-color" role="group" aria-label={t('clave.filtrar')}>
      {#each COLORES.filter((c) => porColor[c]) as c (c)}
        <button class="filtro-color" aria-pressed={colorFiltro === c} onclick={() => (colorFiltro = colorFiltro === c ? null : c)}>
          <i class="arc-color" data-m={c} aria-hidden="true"></i>{etiquetaColor(c)} <small>{porColor[c]}</small>
        </button>
      {/each}
      <button class="filtro-color filtro-editar" onclick={() => (ui.dialogo = 'clave')}>{t('clave.editar')}</button>
    </div>
  {/if}
  <div class="indice-cabeza"><span>{t('arc.contador', { n: String(visibles.length).padStart(2, '0') })}</span></div>

  {#if !entradas.length}
    <div class="archivo-vacio">
      <h2>{t('arc.vacioTitulo')}</h2>
      <p>{t('arc.vacio')}</p>
      <button onclick={() => irA(usuario.ajustes.pos.libro, usuario.ajustes.pos.cap)}>{t('arc.irLeer')}</button>
    </div>
  {:else if !visibles.length}
    <p class="vacio-vista">{t('arc.sinResultados', { q })}</p>
  {:else}
    <ol class="archivo">
      {#each visibles as e (e.id)}
        <li class="archivo-entrada tipo-{e.tipo}">
          <div class="arc-meta">
            <span>{referencia(e)} / {t(`arc.t.${e.tipo}`)}{#if e.tipo === 'subrayado'} <i class="arc-color" data-m={e.color} aria-label={t(`color.${e.color}`)}></i>{#if significado(e.color)} {significado(e.color)}{/if}{/if}{#if e.tipo === 'nota' && e.nota.tipo !== 'Nota'} · {t(`notas.tipo.${e.nota.tipo}`)}{/if}</span>
            <span class="arc-firma" aria-hidden="true">{t('arc.firma')}</span>
          </div>
          {#if e.tipo === 'nota'}
            <p class="arc-nota">{e.nota.texto}</p>
          {:else if e.tipo === 'cinta'}
            <p class="arc-nota">{t('arc.cintaTexto')}</p>
          {:else}
            <p class="arc-verso">{texto[e.k] || '…'}{#if texto[e.k]}<small> {version}</small>{/if}</p>
          {/if}
          <div class="arc-acciones">
            <button class="arc-volver" onclick={() => volver(e)}>{t('arc.volver')} <span aria-hidden="true">↗</span></button>
            {#if e.tipo !== 'nota'}<button class="arc-volver arc-quitar" onclick={() => quitar(e)}>{t('arc.quitar')}</button>{/if}
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</section>
