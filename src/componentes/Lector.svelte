<script>
  import { tick, untrack } from 'svelte';
  import Frontis from './Frontis.svelte';
  import LectorBarra from './LectorBarra.svelte';
  import { ui, irA, abrirPestana, avisar } from '../lib/ui.svelte.js';
  import { usuario, ajustar, marcarLeido, indiceRetroenlaces } from '../lib/usuario.svelte.js';
  import { info, versionEstudio } from '../lib/biblia.js';
  import { LIBROS, clave, nombreRef, nombreLibro, capituloSiguiente } from '../lib/libros.js';
  import { t, fecha as fechaLocal } from '../lib/i18n.svelte.js';

  const pos = $derived(usuario.ajustes.pos);
  const libro = $derived(LIBROS[pos.libro - 1]);
  const ver = $derived(info(usuario.ajustes.version));
  const par = $derived(ui.cap.paralelo && usuario.ajustes.paralela ? info(usuario.ajustes.paralela) : null);
  const retro = $derived(indiceRetroenlaces(usuario.notas));
  const notasPorClave = $derived(usuario.notas.reduce((m, n) => ((m[n.ref] = (m[n.ref] || 0) + 1), m), {}));
  const leido = $derived(usuario.leidos[`${pos.libro}.${pos.cap}`]);
  const anterior = $derived(capituloSiguiente(pos.libro, pos.cap, -1));
  const siguiente = $derived(capituloSiguiente(pos.libro, pos.cap, 1));
  const conGrabado = $derived(pos.cap === 1 && usuario.ajustes.grabados !== false);

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
        avisar(t('lector.leidoAuto', { ref: nombreRef(p.libro, p.cap) }));
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
    // la palabra tocada es la que se estudia; tocar el número (sin palabra) no deja una palabra vieja
    ui.palabra = p ? { ...p, libro: pos.libro, cap: pos.cap, v } : null;
    if (e.shiftKey && ui.ancla) {
      // Mayús + clic: rango
      const [a, b] = [Math.min(ui.ancla, v), Math.max(ui.ancla, v)];
      ui.seleccion = Array.from({ length: b - a + 1 }, (_, i) => a + i);
    } else if (e.metaKey || e.ctrlKey) {
      // Ctrl/⌘ + clic: suma o quita ese versículo
      ui.seleccion = ui.seleccion.includes(v) ? ui.seleccion.filter((x) => x !== v) : [...ui.seleccion, v];
    } else if (ui.seleccion.length === 1 && ui.seleccion[0] === v && !p) {
      // tocar de nuevo el mismo versículo (fuera de una palabra) lo deselecciona
      ui.seleccion = [];
    } else {
      // un toque simple reemplaza la selección: el estudio pasa al versículo nuevo
      ui.seleccion = [v];
    }
    ui.ancla = v;
    // si el versículo queda debajo de la barra de acciones, sube un poco el texto para que se vea
    requestAnimationFrame(() => {
      const abajo = el.getBoundingClientRect().bottom - (innerHeight - (innerWidth <= 760 ? 230 : 130));
      if (abajo > 0 && ui.seleccion.length) lector.scrollBy({ top: abajo, behavior: 'smooth' });
    });
  }

  function sello() {
    marcarLeido(pos.libro, pos.cap, !leido);
    if (!leido) avisar(t('lector.amenAviso'));
  }

  const fecha = (ms) => fechaLocal(ms, { day: 'numeric', month: 'long', year: 'numeric' });
  const claseTexto = $derived([
    'texto',
    usuario.ajustes.parrafo && !par ? 'modo-parrafo' : 'modo-verso',
    usuario.ajustes.modoLector ? 'modo-lector' : '',
    par ? 'paralelo' : '',
  ].join(' '));
</script>

<div class="lector-marco">
  <main class="lector" bind:this={lector}>
    {#if !usuario.ajustes.calma}<LectorBarra />{/if}
    {#if conGrabado}
      {#key pos.libro}<Frontis libro={pos.libro} />{/key}
    {/if}
    <article class="pagina" class:paralelo={!!par}>
      <header class="cap-cabeza">
        <span class="cap-sobre">{libro.testamento === 'AT' ? t('nav.at') : t('nav.nt')} / {ver?.id}{par ? ` ∥ ${par.id}` : ''}</span>
        <h1 class="cap-titulo">{nombreLibro(libro)} <em>{pos.cap}</em></h1>
        <div class="cap-filete" aria-hidden="true"></div>
      </header>

      {#if ui.cap.cargando && !ui.cap.versos.length}
        <div class="estado-carga"><span class="etiqueta-ui">{t('lector.abriendo', { ref: nombreRef(pos.libro, pos.cap) })}</span></div>
      {:else if ui.cap.error}
        <div class="estado-carga">
          <p class="cartel">{t('lector.sinTexto')} <em>{t('lector.porAhora')}</em></p>
          <p class="ayuda">{ui.cap.error}</p>
          {#if ver?.enLinea}
            <button class="boton" onclick={() => ajustar('version', versionEstudio(ver.id))}>{t('lector.leerEn', { v: versionEstudio(ver.id) })}</button>
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
              <span class="v" class:sel={ui.seleccion.includes(x.v)} class:leyendo={ui.leyendo === x.v} data-v={x.v}><span class="num">{x.v}</span><span class="t" data-ver={ver?.id} data-m={usuario.subrayados[k]}>{x.texto}</span>{#if notasPorClave[k]}<span class="marca-nota" title={t('lector.notasAqui')}>{notasPorClave[k]}</span>{/if}{#if retro[k]}<span class="marca-retro" title={t('lector.mencionado')}>↩{retro[k].length}</span>{/if}</span>
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
        {#if ui.cap.errorParalelo}<p class="nota-pie">{t('lector.paralelaNo', { e: ui.cap.errorParalelo })}</p>{/if}
        <p class="pista-lectura">{t('lec.pista')}</p>
        <p class="licencia">{ver?.licencia}{par ? ` · ${par.licencia}` : ''}</p>
      {/if}

      <footer class="amen" class:hecho={!!leido} class:pendiente={!leido} bind:this={finEl}>
        <button class="sello" onclick={sello} aria-pressed={!!leido} title={leido ? t('lector.quitarLeido') : t('lector.marcarLeido')}>
          <span class="amen-palabra">{t('lec.amen')}</span>
          <span class="amen-estado">{leido ? t('lector.leidoEl', { fecha: fecha(leido) }) : t('lector.marcarLeido')}</span>
        </button>
        <nav class="cap-nav" aria-label={t('lector.capitulos')}>
          {#if anterior}
            <button class="nav-cap" onclick={() => irA(anterior.libro, anterior.cap)}><small>← {t('lec.anterior')}</small><span>{nombreRef(anterior.libro, anterior.cap)}</span></button>
          {:else}<span></span>{/if}
          {#if siguiente}
            <button class="nav-cap siguiente" onclick={() => irA(siguiente.libro, siguiente.cap)}><small>{t('lec.siguiente')} →</small><span>{nombreRef(siguiente.libro, siguiente.cap)}</span></button>
          {/if}
        </nav>
      </footer>
    </article>
  </main>
</div>
