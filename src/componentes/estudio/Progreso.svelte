<script>
  import { irA } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { LIBROS, TOTAL_CAPITULOS, nombreLibro, abrevLibro } from '../../lib/libros.js';
  import { t } from '../../lib/i18n.svelte.js';

  const leidos = $derived(Object.keys(usuario.leidos));
  const at = $derived(leidos.filter((k) => Number(k.split('.')[0]) <= 39).length);
  const nt = $derived(leidos.length - at);
  const CAP_AT = LIBROS.slice(0, 39).reduce((a, l) => a + l.capitulos, 0);
  const CAP_NT = TOTAL_CAPITULOS - CAP_AT;
  const pct = (a, b) => Math.round((a / b) * 1000) / 10;
</script>

<div class="seccion">
  <h3>{t('prog.lectura')}</h3>
  <p class="cartel">{pct(leidos.length, TOTAL_CAPITULOS)}% <em>{t('prog.de')}</em></p>
  <div class="cifras">
    <div class="cifra"><b>{leidos.length}</b><span>{t('prog.capitulos', { n: TOTAL_CAPITULOS })}</span></div>
    <div class="cifra"><b>{pct(at, CAP_AT)}%</b><span>{t('prog.at')}</span></div>
    <div class="cifra"><b>{pct(nt, CAP_NT)}%</b><span>{t('prog.nt')}</span></div>
  </div>
  <div class="barra-prog"><i style="width: {pct(leidos.length, TOTAL_CAPITULOS)}%"></i></div>
  <p class="nota-pie">{t('prog.sinRachas')}</p>
</div>

<div class="seccion">
  <h3>{t('prog.cobertura')}</h3>
  <div class="cobertura">
    {#each LIBROS as l (l.n)}
      <div class="cob-fila">
        <span class="cob-libro">{abrevLibro(l)}</span>
        <div class="cob-celdas">
          {#each Array.from({ length: l.capitulos }, (_, i) => i + 1) as c}
            <button class:leido={usuario.leidos[`${l.n}.${c}`]} onclick={() => irA(l.n, c)} aria-label="{nombreLibro(l)} {c}" title="{nombreLibro(l)} {c}"></button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<div class="seccion">
  <h3>{t('prog.guardado')}</h3>
  <div class="cifras">
    <div class="cifra"><b>{usuario.notas.length}</b><span>{t('prog.notas')}</span></div>
    <div class="cifra"><b>{Object.keys(usuario.subrayados).length}</b><span>{t('prog.subrayados')}</span></div>
    <div class="cifra"><b>{usuario.cintas.length}</b><span>{t('prog.cintas')}</span></div>
    <div class="cifra"><b>{usuario.memoria.length}</b><span>{t('prog.memoria')}</span></div>
  </div>
</div>
