<script>
  import { tick, untrack } from 'svelte';
  import Emblema from './Emblema.svelte';
  import Icono from './Icono.svelte';
  import { ui, irA, abrirPestana, avisar } from '../lib/ui.svelte.js';
  import { usuario, ajustar, marcarLeido, alternarCinta, indiceRetroenlaces } from '../lib/usuario.svelte.js';
  import { info, versionEstudio } from '../lib/biblia.js';
  import { LIBROS, clave, nombreRef, capituloSiguiente } from '../lib/libros.js';

  const pos = $derived(usuario.ajustes.pos);
  const libro = $derived(LIBROS[pos.libro - 1]);
  const ver = $derived(info(usuario.ajustes.version));
  const par = $derived(ui.cap.paralelo && usuario.ajustes.paralela ? info(usuario.ajustes.paralela) : null);
  const retro = $derived(indiceRetroenlaces(usuario.notas));
  const notasPorClave = $derived(usuario.notas.reduce((m, n) => ((m[n.ref] = (m[n.ref] || 0) + 1), m), {}));
  const leido = $derived(usuario.leidos[`${pos.libro}.${pos.cap}`]);
  const cintaPuesta = $derived(usuario.cintas.some((c) => c.libro === pos.libro && c.cap === pos.cap));
  const anterior = $derived(capituloSiguiente(pos.libro, pos.cap, -1));
  const siguiente = $derived(capituloSiguiente(pos.libro, pos.cap, 1));
  const avance = $derived((pos.cap / libro.capitulos) * 100);

  let lector;
  let finEl;
  let abierto = Date.now();

  // Al llegar un capítulo nuevo: volver arriba o llevar al versículo pedido.
  // Cambiar de versión dentro del mismo capítulo conserva la posición.
  let ultimaClave = '';
  $effect(() => {
    const k = ui.cap.clave;
    ui.cap.versos;
    untrack(() => {
      if (ui.cap.cargando && !ui.cap.versos.length) return;
      const d = ui.destello;
      const cambio = k !== ultimaClave;
      ultimaClave = k;
      if (cambio) abierto = Date.now();
      tick().then(() => {
        if (d && `${d.libro}.${d.cap}` === k) {
          const el = lector.querySelector(`.texto [data-v="${d.v}"]`);
          if (!el) return;
          el.scrollIntoView({ block: 'center' });
          el.classList.add('destello');
          setTimeout(() => el.classList.remove('destello'), 1900);
          ui.destello = null;
        } else if (cambio) {
          lector.scrollTop = 0;
        }
      });
    });
  });

  // Se marca leído solo si llegas al final después de 20 segundos de lectura
  $effect(() => {
    if (!finEl) return;
    const obs = new IntersectionObserver(([e]) => {
      const p = untrack(() => usuario.ajustes.pos);
      if (e.isIntersecting && !usuario.leidos[`${p.libro}.${p.cap}`] && ui.cap.versos.length && Date.now() - abierto > 20000) {
        marcarLeido(p.libro, p.cap);
        avisar(`${nombreRef(p.libro, p.cap)}: leído. Amén.`);
      }
    }, { threshold: 0.6 });
    obs.observe(finEl);
    return () => obs.disconnect();
  });

  function palabraEn(e) {
    let nodo;
    let off;
    if (document.caretPositionFromPoint) {
      const c = document.caretPositionFromPoint(e.clientX, e.clientY);
      if (!c) return null;
      nodo = c.offsetNode; off = c.offset;
    } else if (document.caretRangeFromPoint) {
      const r = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (!r) return null;
      nodo = r.startContainer; off = r.startOffset;
    } else return null;
    if (!nodo || nodo.nodeType !== 3 || !nodo.parentElement?.closest('.t')) return null;
    const t = nodo.textContent;
    const letra = (ch) => /[\p{L}\p{M}'’]/u.test(ch || '');
    let a = off;
    let b = off;
    while (a > 0 && letra(t[a - 1])) a--;
    while (b < t.length && letra(t[b])) b++;
    const w = t.slice(a, b).replace(/^['’]+|['’]+$/g, '');
    return w.length > 1 ? { texto: w, version: nodo.parentElement.closest('.t').dataset.ver } : null;
  }

  function tocar(e) {
    const marca = e.target.closest('.marca-nota, .marca-retro');
    const el = e.target.closest('[data-v]');
    if (!el) return;
    const v = Number(el.dataset.v);
    if (marca) {
      ui.seleccion = [v];
      abrirPestana('notas');
      return;
    }
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim().length > 2) return; // el usuario está seleccionando texto
    const p = palabraEn(e);
    if (p) ui.palabra = { ...p, libro: pos.libro, cap: pos.cap, v };
    if (e.shiftKey && ui.ancla) {
      const [a, b] = [Math.min(ui.ancla, v), Math.max(ui.ancla, v)];
      ui.seleccion = Array.from({ length: b - a + 1 }, (_, i) => a + i);
    } else if (ui.seleccion.includes(v) && !p) {
      ui.seleccion = ui.seleccion.filter((x) => x !== v);
    } else if (!ui.seleccion.includes(v)) {
      ui.seleccion = e.metaKey || e.ctrlKey || ui.seleccion.length ? [...ui.seleccion, v] : [v];
    }
    ui.ancla = v;
  }

  function sello() {
    marcarLeido(pos.libro, pos.cap, !leido);
    if (!leido) avisar('Amén. Capítulo marcado como leído.');
  }

  const fecha = (t) => new Date(t).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  const claseTexto = $derived([
    'texto',
    usuario.ajustes.parrafo && !par ? 'modo-parrafo' : 'modo-verso',
    usuario.ajustes.modoLector ? 'modo-lector' : '',
    par ? 'paralelo' : '',
  ].join(' '));
</script>

<div class="lector-marco">
  <div class="canto" aria-hidden="true"><i style="height: {avance}%"></i></div>
  <main class="lector" bind:this={lector}>
    <article class="pagina" class:paralelo={!!par}>
      <button class="cintas" class:puesta={cintaPuesta} onclick={() => avisar(alternarCinta(pos.libro, pos.cap) ? 'Cinta puesta en este capítulo.' : 'Cinta quitada.')}
        title={cintaPuesta ? 'Quitar la cinta' : 'Poner una cinta en este capítulo'} aria-label="Cinta marcapáginas" aria-pressed={cintaPuesta}>
        <span class="cinta c1"></span><span class="cinta c2"></span><span class="cinta c3"></span>
      </button>

      <header class="cap-cabeza">
        {#if pos.cap === 1}
          <div class="portada">
            <span class="etiqueta-ui">{libro.testamento === 'AT' ? 'Antiguo Testamento' : 'Nuevo Testamento'} · Libro {libro.n} de 66</span>
            <Emblema tam={46} />
            <h1>{libro.nombre}</h1>
            <span class="sub">{ver?.nombre}</span>
            {#if libro.capitulos > 1}<span class="cap1">Capítulo 1</span>{/if}
          </div>
        {:else}
          <div class="cabeza-corriente">
            <div class="cabeza-izq">
              <span class="etiqueta-ui">{ver?.nombre}</span>
              <h1 class="libro">{libro.nombre}</h1>
            </div>
            <span class="numero" aria-label="Capítulo {pos.cap}">{pos.cap}</span>
          </div>
        {/if}
      </header>

      {#if ui.cap.cargando && !ui.cap.versos.length}
        <div class="estado-carga"><span class="etiqueta-ui">Abriendo {nombreRef(pos.libro, pos.cap)}…</span></div>
      {:else if ui.cap.error}
        <div class="estado-carga">
          <p class="cartel">Sin texto <em>por ahora.</em></p>
          <p class="ayuda">{ui.cap.error}</p>
          {#if ver?.enLinea}
            <button class="boton" onclick={() => ajustar('version', versionEstudio(ver.id))}>Leer en {versionEstudio(ver.id)}</button>
          {/if}
        </div>
      {:else}
        {#if par}
          <div class="cabeza-paralelo">
            <span class="etiqueta-ui">{ver?.id} · {ver?.nombre}</span><span class="etiqueta-ui">{par.id} · {par.nombre}</span>
          </div>
        {/if}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <div class={claseTexto} onclick={tocar}>
          {#each ui.cap.versos as x (x.v)}
            {@const k = clave(pos.libro, pos.cap, x.v)}
            {#if ui.cap.titulos[x.v]}<span class="subtitulo">{ui.cap.titulos[x.v]}</span>{/if}
            {#snippet verso()}
              <span class="v" class:sel={ui.seleccion.includes(x.v)} class:leyendo={ui.leyendo === x.v} data-v={x.v}><span class="num">{x.v}</span><span class="t" data-ver={ver?.id} data-m={usuario.subrayados[k]}>{x.texto}</span>{#if notasPorClave[k]}<span class="marca-nota" title="Notas en este versículo">{notasPorClave[k]}</span>{/if}{#if retro[k]}<span class="marca-retro" title="Mencionado en otras notas">↩{retro[k].length}</span>{/if}</span>
            {/snippet}
            {#if par}
              <div class="fila">
                {@render verso()}
                <span class="p2" data-v={x.v}><span class="num">{x.v}</span><span class="t" data-ver={par.id} data-m={usuario.subrayados[k]}>{ui.cap.paralelo[x.v] || '—'}</span></span>
              </div>
            {:else}
              {@render verso()}{' '}
            {/if}
          {/each}
        </div>
        {#if ui.cap.errorParalelo}<p class="nota-pie">Paralela no disponible: {ui.cap.errorParalelo}</p>{/if}
        <p class="licencia">{ver?.licencia}{par ? ` · ${par.licencia}` : ''}</p>
      {/if}

      <footer class="amen" class:hecho={!!leido} class:pendiente={!leido} bind:this={finEl}>
        <div class="amen-palabra" aria-hidden="true">AMEN</div>
        <button class="sello" onclick={sello} aria-pressed={!!leido} title={leido ? 'Quitar la marca de leído' : 'Marcar como leído'}>
          <Emblema tam={42} titulo={leido ? 'Leído' : 'Marcar como leído'} />
        </button>
        <span class="etiqueta-ui">{leido ? `Leído el ${fecha(leido)}` : 'Toca el sello al terminar'}</span>
        <nav class="cap-nav" aria-label="Capítulos">
          {#if anterior}
            <button class="nav-cap" onclick={() => irA(anterior.libro, anterior.cap)}><Icono n="ant" /><span>{nombreRef(anterior.libro, anterior.cap)}</span></button>
          {:else}<span></span>{/if}
          {#if siguiente}
            <button class="nav-cap" onclick={() => irA(siguiente.libro, siguiente.cap)}><span>{nombreRef(siguiente.libro, siguiente.cap)}</span><Icono n="sig" /></button>
          {/if}
        </nav>
      </footer>
    </article>
  </main>
</div>
