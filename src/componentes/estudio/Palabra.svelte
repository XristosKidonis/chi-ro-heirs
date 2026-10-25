<script>
  import { ui, irA } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { info, versionEstudio, buscar, resaltar, strongPorGlosa } from '../../lib/biblia.js';
  import { LIBROS, nombreRef } from '../../lib/libros.js';

  let modo = $state('palabras');
  let res = $state(null);
  let error = $state('');
  let libroFiltro = $state(null);
  let mostrar = $state(40);
  let strongs = $state([]);

  const p = $derived(ui.palabra);
  const vOrigen = $derived(p ? info(p.version || usuario.ajustes.version) : null);
  const vConc = $derived(vOrigen ? (vOrigen.enLinea ? versionEstudio(vOrigen.id) : vOrigen.id) : null);
  const ingles = $derived(vOrigen?.idioma === 'en');

  $effect(() => {
    if (!p || !vConc) return;
    const m = modo;
    const pedido = p;
    res = null; error = ''; libroFiltro = null; mostrar = 40; strongs = [];
    buscar(vConc, pedido.texto, { modo: m === 'prefijo' ? 'prefijo' : 'palabras', limite: 3000 })
      .then((r) => { if (ui.palabra === pedido && modo === m) res = r; })
      .catch((e) => { error = e.message; });
    if (ingles) {
      strongPorGlosa(pedido.texto, LIBROS[pedido.libro - 1].testamento).then((s) => { if (ui.palabra === pedido) strongs = s; });
    }
  });

  const max = $derived(res ? Math.max(1, ...res.porLibro.map((x) => x.n)) : 1);
  const conteo = $derived(res ? Object.fromEntries(res.porLibro.map((x) => [x.libro, x.n])) : {});
  const pico = $derived(res?.porLibro.length ? res.porLibro.reduce((a, b) => (b.n > a.n ? b : a)) : null);
  const filas = $derived(res ? res.filas.filter((f) => !libroFiltro || f.libro === libroFiltro) : []);
  const enlaces = $derived(p ? [
    ingles
      ? ['Merriam-Webster', `https://www.merriam-webster.com/dictionary/${encodeURIComponent(p.texto)}`]
      : ['Diccionario RAE', `https://dle.rae.es/${encodeURIComponent(p.texto.toLowerCase())}`],
    ['Wikipedia', `https://${ingles ? 'en' : 'es'}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(p.texto)}`],
    ['Interlineal (BibleHub)', `https://biblehub.com/interlinear/${LIBROS[p.libro - 1].biblehub}/${p.cap}-${p.v}.htm`],
    ['Blue Letter Bible', `https://www.blueletterbible.org/kjv/${LIBROS[p.libro - 1].blb}/${p.cap}/${p.v}/`],
  ] : []);
</script>

{#if !p}
  <div class="seccion">
    <p class="cartel">Toca una <em>palabra.</em></p>
    <p class="ayuda">Al tocar cualquier palabra del texto verás cuántas veces aparece en la Biblia, en qué libros se concentra, y enlaces al diccionario, al interlineal griego y hebreo, y a Wikipedia.</p>
  </div>
{:else}
  <div class="seccion">
    <h3>Estudio de palabra · {nombreRef(p.libro, p.cap, p.v)}</h3>
    <p class="palabra-titulo">{p.texto}</p>
    <div class="interruptor" role="group" aria-label="Tipo de coincidencia">
      <button aria-pressed={modo === 'palabras'} onclick={() => (modo = 'palabras')}>Palabra exacta</button>
      <button aria-pressed={modo === 'prefijo'} onclick={() => (modo = 'prefijo')}>Empieza así</button>
    </div>
    {#if error}
      <p class="nota-pie">{error}</p>
    {:else if !res}
      <p class="nota-pie">Contando…</p>
    {:else}
      <div class="cifras">
        <div class="cifra"><b>{res.total}</b><span>Versículos</span></div>
        <div class="cifra"><b>{res.porLibro.length}</b><span>Libros</span></div>
        <div class="cifra"><b>{res.porLibro.filter((x) => x.libro >= 40).reduce((a, x) => a + x.n, 0)}</b><span>En el NT</span></div>
      </div>
      {#if vConc !== vOrigen?.id}
        <p class="nota-pie">Concordancia en {vConc}: la {vOrigen?.id} solo se lee en línea y no se puede indexar.</p>
      {/if}
      {#if res.total}
        <div class="distribucion">
          <svg viewBox="0 0 660 90" role="img" aria-label="Distribución por libro">
            <rect class="base" x="0" y="80" width="660" height="1" />
            <rect class="base" x="389" y="6" width="1" height="74" />
            {#each LIBROS as l, i}
              {@const n = conteo[l.n] || 0}
              {#if n}
                {@const h = Math.max(2, (n / max) * 66)}
                <rect class="barra-d" class:on={libroFiltro === l.n} x={i * 10 + 1} y={80 - h} width="8" height={h}
                  role="button" tabindex="0" aria-label="{l.nombre}: {n}"
                  onclick={() => (libroFiltro = libroFiltro === l.n ? null : l.n)}
                  onkeydown={(e) => e.key === 'Enter' && (libroFiltro = libroFiltro === l.n ? null : l.n)}>
                  <title>{l.nombre}: {n}</title>
                </rect>
              {/if}
            {/each}
            {#if pico}
              <text class="pico" x={Math.min(Math.max((pico.libro - 1) * 10 + 5, 30), 630)} y={80 - (pico.n / max) * 66 - 5} text-anchor="middle">{LIBROS[pico.libro - 1].abrev}</text>
            {/if}
          </svg>
          <div class="dist-pie"><span>Génesis</span><span>Mateo</span><span>Apocalipsis</span></div>
        </div>
        <p class="nota-pie">{libroFiltro ? `Mostrando solo ${LIBROS[libroFiltro - 1].nombre}. Toca la barra otra vez para ver todo.` : 'Toca una barra para ver solo ese libro.'}</p>
        <ul class="resultados">
          {#each filas.slice(0, mostrar) as f}
            <li><button onclick={() => irA(f.libro, f.cap, f.v)}>
              <span class="r-ref">{nombreRef(f.libro, f.cap, f.v)}</span>
              <span class="r-txt">{@html resaltar(f.texto, p.texto, modo === 'prefijo')}</span>
            </button></li>
          {/each}
        </ul>
        {#if filas.length > mostrar}
          <button class="boton secundario" onclick={() => (mostrar += 60)}>Ver más ({filas.length - mostrar})</button>
        {/if}
      {/if}
    {/if}
  </div>

  {#if strongs.length}
    <div class="seccion">
      <h3>Palabras originales que la KJV traduce «{p.texto}»</h3>
      {#each strongs as s}
        <div class="tarjeta">
          <span class="etiqueta-ui">{s.id}</span>
          <div class="strong-lema">{s.lema}</div>
          <div class="strong-translit">{s.translit}</div>
          <p class="strong-def">{s.definicion}</p>
          <a class="enlace-texto" href="https://www.blueletterbible.org/lexicon/{s.id.toLowerCase()}/kjv/" target="_blank" rel="noopener">Ver en Blue Letter Bible ↗</a>
        </div>
      {/each}
    </div>
  {/if}

  <div class="seccion">
    <h3>En internet</h3>
    <div class="enlaces">
      {#each enlaces as [nombre, url]}<a class="enlace" href={url} target="_blank" rel="noopener">{nombre}</a>{/each}
    </div>
  </div>
{/if}
