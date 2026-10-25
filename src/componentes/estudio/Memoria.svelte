<script>
  import { irA, avisar } from '../../lib/ui.svelte.js';
  import { usuario, repasar, quitarMemoria } from '../../lib/usuario.svelte.js';
  import { pasaje } from '../../lib/biblia.js';
  import { parsearRango, nombreRef } from '../../lib/libros.js';
  import { t, fecha } from '../../lib/i18n.svelte.js';

  let actual = $state(null);
  let texto = $state('');
  let nivel = $state(0);
  let ahora = $state(Date.now());

  const pendientes = $derived(usuario.memoria.filter((m) => m.proxima <= ahora).sort((a, b) => a.proxima - b.proxima));
  const NIVELES = [0, 1, 2, 3];

  $effect(() => {
    if (!actual && pendientes.length) actual = pendientes[0].ref;
  });

  $effect(() => {
    if (!actual) { texto = ''; return; }
    const r = parsearRango(actual);
    nivel = 0;
    texto = '';
    pasaje(usuario.ajustes.version, r.libro, r.cap, r.v, r.hasta, usuario.ajustes.claveNLT)
      .then((tx) => (texto = tx))
      .catch(() => pasaje('RV1909', r.libro, r.cap, r.v, r.hasta).then((tx) => (texto = tx)));
  });

  // Oculta palabras según el nivel, conservando la puntuación
  const palabras = $derived(texto.split(/(\s+)/).map((p, i) => {
    if (/^\s+$/.test(p) || !p) return { p, oculta: false };
    const idx = Math.floor(i / 2);
    if (nivel === 1 && idx % 3 === 2) return { p, oculta: true };
    if (nivel === 2) return { p: p.replace(/^([«"¿¡(]*\p{L})\p{L}*/u, '$1…'), oculta: false };
    if (nivel === 3) return { p, oculta: true };
    return { p, oculta: false };
  }));

  function responder(ok) {
    repasar(actual, ok);
    avisar(ok ? t('mem.bien') : t('mem.pronto'));
    ahora = Date.now();
    actual = pendientes.find((m) => m.ref !== actual)?.ref || null;
  }

  const ref = (k) => { const r = parsearRango(k); return nombreRef(r.libro, r.cap, r.v, r.hasta); };
  const cuando = (ms) => (ms <= ahora ? t('mem.hoyCorto') : fecha(ms));
</script>

{#if !usuario.memoria.length}
  <p class="cartel">{t('mem.cartel')} <em>{t('mem.cartelEm')}</em></p>
  <p class="ayuda">{t('mem.ayuda')}</p>
{:else}
  <div class="seccion">
    <h3>{t('mem.hoy', { n: pendientes.length })}</h3>
    {#if actual}
      <div class="mem-tarjeta">
        <span class="ref-encabezado">{ref(actual)}</span>
        <p class="mem-texto">{#each palabras as w}{#if w.oculta}<span class="oculta">{w.p}</span>{:else}{w.p}{/if}{/each}</p>
        <div class="niveles interruptor" role="group" aria-label={t('mem.nivel')}>
          {#each NIVELES as i}<button aria-pressed={nivel === i} onclick={() => (nivel = i)}>{t(`mem.n${i}`)}</button>{/each}
        </div>
        <div class="fila-botones">
          <button class="boton" onclick={() => responder(true)}>{t('mem.recorde')}</button>
          <button class="boton secundario" onclick={() => responder(false)}>{t('mem.otraVez')}</button>
        </div>
      </div>
    {:else}
      <p class="ayuda">{t('mem.nada')}</p>
    {/if}
  </div>
  <div class="seccion">
    <h3>{t('mem.tuyos', { n: usuario.memoria.length })}</h3>
    <ul class="resultados">
      {#each usuario.memoria as m (m.ref)}
        <li style="display:flex; align-items:center; gap:8px">
          <button style="flex:1" onclick={() => (actual = m.ref)}>
            <span class="r-ref">{t('mem.proximo', { cuando: cuando(m.proxima), n: m.aciertos })}</span>
            <span class="r-txt">{ref(m.ref)}</span>
          </button>
          <button class="enlace-texto" onclick={() => { const r = parsearRango(m.ref); irA(r.libro, r.cap, r.v); }}>{t('mem.abrir')}</button>
          <button class="enlace-texto" onclick={() => { quitarMemoria(m.ref); if (actual === m.ref) actual = null; }}>{t('mem.quitar')}</button>
        </li>
      {/each}
    </ul>
  </div>
{/if}
