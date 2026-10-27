<script>
  // Láminas: primero un índice neutro de tres colecciones; el color solo aparece al entrar en una.
  // Las piezas se dibujan con el motor original (Canvas 2D) y abren el editor de siempre.
  import { ui } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { dibujarLamina } from '../../lib/laminas.js';
  import { COLECCIONES } from '../../lib/colecciones.js';
  import { dia, cargarVersoDelDia, laminaDelDia } from '../../lib/versoDelDia.svelte.js';
  import { t } from '../../lib/i18n.svelte.js';

  const nombrePieza = (p) => t(`lam.e.${p.estilo}`) + (p.tono ? ` ${t(`lam.t.${p.tono}`).toLowerCase()}` : '');
  const nombres = (c) => c.piezas.map(nombrePieza).join(' · ');
  const piezas = (n) => t('lamp.piezas', { n: String(n).padStart(2, '0') });
  const elegida = $derived(COLECCIONES.find((c) => c.id === ui.coleccion));

  // miniaturas: solo de la colección abierta, una por una
  let miniaturas = $state({});
  $effect(() => {
    const c = elegida;
    if (!c) return;
    cargarVersoDelDia();
    if (!dia.texto) return;
    const base = laminaDelDia();
    let vivo = true;
    miniaturas = {};
    (async () => {
      for (const p of c.piezas) {
        const lienzo = document.createElement('canvas');
        await dibujarLamina(lienzo, { ...base, ...p, formato: 'post', rotulo: t('lam.rotulo'), imagen: usuario.portadas[base.libro] || undefined, escala: 0.4 });
        if (!vivo) return;
        miniaturas = { ...miniaturas, [p.id]: lienzo.toDataURL('image/jpeg', 0.88) };
      }
    })();
    return () => { vivo = false; };
  });

  function abrir(p) {
    ui.lamina = { ...laminaDelDia(), estilo: p.estilo, formato: 'post', tono: p.tono };
    ui.dialogo = 'poster';
  }
</script>

<section class="pagina-vista" aria-labelledby="lam-titulo">
  <div class="titular">
    <div><span class="sobretitulo">{t('lamp.over')}</span><h1 id="lam-titulo">{elegida ? t(`col.${elegida.id}`) : t('vista.laminas')}</h1></div>
    <p>{elegida ? t(`col.sub.${elegida.id}`) : t('lamp.sub')}</p>
  </div>

  {#if !elegida}
    <div class="colecciones" aria-label={t('lamp.colecciones')}>
      {#each COLECCIONES as c, i}
        <button class="coleccion" onclick={() => (ui.coleccion = c.id)}>
          <span class="col-num">{String(i + 1).padStart(2, '0')}</span>
          <span class="col-nombre">{t(`col.${c.id}`)}</span>
          <span class="col-sub">{nombres(c)}</span>
          <span class="col-cuenta">{piezas(c.piezas.length)}</span>
          <span class="col-flecha" aria-hidden="true">↗</span>
        </button>
      {/each}
    </div>
  {:else}
    <div class="coleccion-barra">
      <button onclick={() => (ui.coleccion = null)} aria-label={t('lamp.volver')}>← &nbsp; {t('lamp.colecciones')}</button>
      <span>{piezas(elegida.piezas.length)} · {nombres(elegida)}</span>
    </div>
    <p class="coleccion-ayuda">{dia.texto ? t('lamp.hoy', { ref: laminaDelDia().referencia }) : ''} · {t('lamp.ayuda')}</p>
    <div class="obras">
      {#each elegida.piezas as p (p.id)}
        <button class="obra" onclick={() => abrir(p)} aria-label={t('lamp.abrir', { e: nombrePieza(p) })}>
          <span class="obra-lamina">{#if miniaturas[p.id]}<img src={miniaturas[p.id]} alt="" />{/if}</span>
          <span class="obra-nombre"><span>{nombrePieza(p)}</span><span>{dia.texto ? laminaDelDia().referencia : ''}</span></span>
        </button>
      {/each}
    </div>
  {/if}
</section>
