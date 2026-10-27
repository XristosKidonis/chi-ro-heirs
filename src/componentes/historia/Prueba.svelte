<script>
  // Una prueba del expediente: fila de índice que se abre en ficha (cita, qué establece y qué no, versículos y fuente)
  import Sello from './Sello.svelte';
  import Contraste from './Contraste.svelte';
  import { numero, distancia, parsearVerso } from '../../lib/evidencias.js';
  import { irA } from '../../lib/ui.svelte.js';
  import { nombreRef } from '../../lib/libros.js';
  import { abrirEnNavegador } from '../../lib/archivos.js';
  import { t, idioma } from '../../lib/i18n.svelte.js';

  let { p, abierta = false, alternar } = $props();
  const L = (x) => x?.[idioma()] ?? '';
  const d = $derived(distancia(p));
  const cuando = $derived(
    p.figura === 'juan' && p.id === 'reliquias' ? ''
      : Math.abs(d) <= 6 ? t('his.mismaEpoca')
      : d > 0 ? t('his.despues', { n: d }) : t('his.antes', { n: -d }),
  );

  function leer(r) {
    const { libro, cap, v } = parsearVerso(r);
    irA(libro, cap, v);
  }
</script>

<li class="his-prueba" class:abierta id="prueba-{p.id}">
  <button class="his-fila" aria-expanded={abierta} onclick={alternar}>
    <span class="his-num">{t('his.prueba')} {numero(p)}</span>
    <span class="his-titulo">{L(p.titulo)}</span>
    <span class="his-meta">{L(p.autor)} · {L(p.obra)} · {L(p.fecha)}{#if cuando}{' · '}<b>{cuando}</b>{/if}</span>
    <Sello grado={p.grado} />
  </button>
  {#if abierta}
    <div class="his-cuerpo">
      <blockquote class="his-cita">{L(p.cita)}</blockquote>
      {#if p.contraste}<Contraste {p} />{/if}
      <div class="his-dos">
        <div><h4>{t('his.establece')}</h4><p>{L(p.establece)}</p></div>
        <div><h4>{t('his.noEstablece')}</h4><p>{L(p.noEstablece)}</p></div>
      </div>
      <div class="his-pie">
        <span class="his-pie-et">{t('his.leelo')}</span>
        {#each p.versos as r (r)}
          {@const x = parsearVerso(r)}
          <button class="his-ref" onclick={() => leer(r)}>{nombreRef(x.libro, x.cap, x.v, x.hasta)} ↗</button>
        {/each}
        {#if p.fuente}<button class="his-ref his-fuente" onclick={() => abrirEnNavegador(p.fuente)}>{t('his.fuente')} ↗</button>{/if}
      </div>
    </div>
  {/if}
</li>
