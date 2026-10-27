<script>
  // Una prueba del expediente: fila de índice que se abre en ficha (cita, qué establece y qué no, versículos y fuente)
  import Sello from './Sello.svelte';
  import Contraste from './Contraste.svelte';
  import Figura from './Figura.svelte';
  import { imagenesDe } from '../../lib/imagenesHistoria.js';
  import { numero, distancia, parsearVerso } from '../../lib/evidencias.js';
  import { irA } from '../../lib/ui.svelte.js';
  import { nombreRef } from '../../lib/libros.js';
  import { abrirEnNavegador } from '../../lib/archivos.js';
  import { t, idioma } from '../../lib/i18n.svelte.js';

  let { p, abierta = false, alternar } = $props();
  const imgs = $derived(imagenesDe(p.id));
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

<li class="his-prueba" class:abierta class:sin-imagen={!imgs.length} id="prueba-{p.id}">
  <button class="his-fila" aria-expanded={abierta} onclick={alternar}>
    <span class="his-mini" aria-hidden="true">{#if imgs.length}<img src={imgs[0].src} alt="" loading="lazy" decoding="async" />{:else}<span>{numero(p)}</span>{/if}</span>
    <span class="his-num">{t('his.prueba')} {numero(p)}</span>
    <span class="his-titulo">{L(p.titulo)}</span>
    <span class="his-meta">{L(p.autor)} · {L(p.fecha)}</span>
    <Sello grado={p.grado} />
  </button>
  {#if abierta}
    <div class="his-cuerpo">
      <dl class="his-datos">
        <div><dt><i>1</i> {t(`his.d1.${p.grupo}`)}</dt><dd>{L(p.autor)}</dd></div>
        <div><dt>{t(`his.d2.${p.grupo}`)}</dt><dd>{L(p.obra)}</dd></div>
        <div><dt>{t('his.cuando')}</dt><dd>{L(p.fecha)}</dd></div>
        {#if cuando}
          <div><dt>{t('his.distancia')}</dt><dd>{cuando}
            {#if d > 0 && d < 400}<span class="his-dist" aria-hidden="true"><i style:width="{Math.min(100, (d / 300) * 100)}%"></i></span>{/if}</dd></div>
        {/if}
      </dl>
      <div class="his-ficha" class:sin-fig={!imgs.length}>
        {#if imgs.length}
          <div class="his-figs">
            <Figura img={imgs[0]} />
            {#each imgs.slice(1) as im (im.nombre)}<Figura img={im} chica />{/each}
          </div>
        {/if}
        <div class="his-texto">
          <h4 class="his-paso"><i>2</i> {t('his.loQueDice')}</h4>
          <blockquote class="his-cita">{L(p.cita)}</blockquote>
          <h4 class="his-paso"><i>3</i> {t('his.queProbamos')}</h4>
          <div class="his-si"><h4><span aria-hidden="true">✓</span> {t('his.establece')}</h4><p>{L(p.establece)}</p></div>
          <div class="his-no"><h4><span aria-hidden="true">✕</span> {t('his.noEstablece')}</h4><p>{L(p.noEstablece)}</p></div>
        </div>
      </div>
      {#if p.contraste}<Contraste {p} />{/if}
      <div class="his-pie">
        <span class="his-pie-et"><i class="his-num-paso">4</i> {t('his.leelo')}</span>
        {#each p.versos as r (r)}
          {@const x = parsearVerso(r)}
          <button class="his-ref" onclick={() => leer(r)}>{nombreRef(x.libro, x.cap, x.v, x.hasta)} ↗</button>
        {/each}
        {#if p.fuente}<button class="his-ref his-fuente" onclick={() => abrirEnNavegador(p.fuente)}>{t('his.fuente')} ↗</button>{/if}
      </div>
    </div>
  {/if}
</li>
