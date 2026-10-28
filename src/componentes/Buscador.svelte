<script>
  // Búsqueda global (Ctrl/Cmd K): una referencia va directo, un libro abre su capítulo 1
  // y cualquier otra palabra se busca en toda la Biblia (pestaña Buscar del estudio).
  import { tick } from 'svelte';
  import { ui, irA, abrirPestana } from '../lib/ui.svelte.js';
  import { usuario } from '../lib/usuario.svelte.js';
  import { LIBROS, nombreLibro, nombreRef, parsearReferencia, normalizar } from '../lib/libros.js';
  import { t } from '../lib/i18n.svelte.js';

  let dlg;
  let entrada = $state();
  let q = $state('');
  let activa = $state(0);
  let antes = null;

  $effect(() => {
    if (!dlg) return;
    if (ui.buscadorAbierto && !dlg.open) {
      antes = document.activeElement;
      q = '';
      dlg.showModal();
      tick().then(() => entrada?.focus());
    }
    if (!ui.buscadorAbierto && dlg.open) dlg.close();
  });

  const opciones = $derived.by(() => {
    const s = q.trim();
    if (!s) return [];
    const out = [];
    const ref = /\d/.test(s) ? parsearReferencia(s) : null;
    if (ref) out.push({ tipo: 'ref', ref, texto: t('ini.ir', { ref: nombreRef(ref.libro, ref.cap, ref.v, ref.hasta) }), etiqueta: t('bus.pasaje') });
    const n = normalizar(s).replace(/\s+/g, '');
    for (const l of LIBROS) {
      if (out.length >= 7) break;
      const nombres = [l.clave, normalizar(l.ingles).replace(/\s+/g, ''), ...l.alias];
      if (nombres.some((x) => x.startsWith(n)) && !(ref && ref.libro === l.n)) out.push({ tipo: 'libro', libro: l, texto: nombreLibro(l), etiqueta: t('bus.libro') });
    }
    if (!ref && s.length > 2) out.push({ tipo: 'buscar', texto: t('ini.buscarTodo', { q: s }), etiqueta: t('bus.palabra') });
    return out;
  });
  $effect(() => { q; activa = 0; });

  function elegir(o) {
    if (!o) return;
    if (o.tipo === 'ref') {
      irA(o.ref.libro, o.ref.cap, o.ref.v);
      if (o.ref.v && o.ref.hasta) ui.seleccion = Array.from({ length: o.ref.hasta - o.ref.v + 1 }, (_, i) => o.ref.v + i);
    } else if (o.tipo === 'libro') {
      const p = usuario.ajustes.pos;
      irA(o.libro.n, p.libro === o.libro.n ? p.cap : 1);
    } else {
      ui.busqueda = q.trim();
      ui.vista = 'lector';
      abrirPestana('buscar');
    }
    ui.buscadorAbierto = false;
  }

  function tecla(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); activa = Math.min(activa + 1, opciones.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activa = Math.max(activa - 1, 0); }
    else if (e.key === 'Enter') { e.preventDefault(); elegir(opciones[activa]); }
  }

  // El aviso de «cerrado» llega un instante después de cerrar, y Chrome a veces junta dos en uno. Por eso
  // la marca no depende de él: Esc la apaga directamente (oncancel) y este aviso solo devuelve el foco.
  // Si llega cuando ya se volvió a abrir (Ctrl K enseguida de elegir un resultado), es viejo y se ignora.
  function cerrado() {
    if (dlg.open) return;
    ui.buscadorAbierto = false;
    if (antes && document.contains(antes)) antes.focus?.();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog class="buscador" bind:this={dlg} onclose={cerrado} oncancel={(e) => { e.preventDefault(); ui.buscadorAbierto = false; }} aria-label={t('bus.titulo')}
  onclick={(e) => { if (e.target === dlg) ui.buscadorAbierto = false; }}>
  <div class="buscador-caja">
    <div class="buscador-cabeza"><span>{t('bus.titulo')}</span><button onclick={() => (ui.buscadorAbierto = false)} aria-label={t('bus.cerrar')}>×</button></div>
    <input bind:this={entrada} bind:value={q} onkeydown={tecla} placeholder={t('bus.ph')} aria-label={t('bus.ph')}
      autocomplete="off" spellcheck="false" role="combobox" aria-expanded={opciones.length > 0} aria-controls="buscador-opciones" />
    {#if opciones.length}
      <ul class="buscador-opciones" id="buscador-opciones" role="listbox">
        {#each opciones as o, i}
          <li role="option" aria-selected={i === activa}>
            <button class:activa={i === activa} onclick={() => elegir(o)} onmouseenter={() => (activa = i)}><span>{o.texto}</span><small>{o.etiqueta}</small></button>
          </li>
        {/each}
      </ul>
    {/if}
    <small class="buscador-pie">{t('bus.pie')}</small>
  </div>
</dialog>
