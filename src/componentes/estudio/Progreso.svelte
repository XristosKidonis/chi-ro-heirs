<script>
  import { irA } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { LIBROS, TOTAL_CAPITULOS } from '../../lib/libros.js';

  const leidos = $derived(Object.keys(usuario.leidos));
  const at = $derived(leidos.filter((k) => Number(k.split('.')[0]) <= 39).length);
  const nt = $derived(leidos.length - at);
  const CAP_AT = LIBROS.slice(0, 39).reduce((a, l) => a + l.capitulos, 0);
  const CAP_NT = TOTAL_CAPITULOS - CAP_AT;
  const pct = (a, b) => Math.round((a / b) * 1000) / 10;
</script>

<div class="seccion">
  <h3>Tu lectura</h3>
  <p class="cartel">{pct(leidos.length, TOTAL_CAPITULOS)}% <em>de la Biblia.</em></p>
  <div class="cifras">
    <div class="cifra"><b>{leidos.length}</b><span>de {TOTAL_CAPITULOS} capítulos</span></div>
    <div class="cifra"><b>{pct(at, CAP_AT)}%</b><span>Antiguo T.</span></div>
    <div class="cifra"><b>{pct(nt, CAP_NT)}%</b><span>Nuevo T.</span></div>
  </div>
  <div class="barra-prog"><i style="width: {pct(leidos.length, TOTAL_CAPITULOS)}%"></i></div>
  <p class="nota-pie">Sin rachas ni culpa: cada cuadro es un capítulo leído, y se quedan para siempre. Toca uno para abrirlo.</p>
</div>

<div class="seccion">
  <h3>Cobertura</h3>
  <div class="cobertura">
    {#each LIBROS as l (l.n)}
      <div class="cob-fila">
        <span class="cob-libro">{l.abrev}</span>
        <div class="cob-celdas">
          {#each Array.from({ length: l.capitulos }, (_, i) => i + 1) as c}
            <button class:leido={usuario.leidos[`${l.n}.${c}`]} onclick={() => irA(l.n, c)} aria-label="{l.nombre} {c}" title="{l.nombre} {c}"></button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<div class="seccion">
  <h3>Lo que has guardado</h3>
  <div class="cifras">
    <div class="cifra"><b>{usuario.notas.length}</b><span>Notas</span></div>
    <div class="cifra"><b>{Object.keys(usuario.subrayados).length}</b><span>Subrayados</span></div>
    <div class="cifra"><b>{usuario.cintas.length}</b><span>Cintas</span></div>
    <div class="cifra"><b>{usuario.memoria.length}</b><span>En memoria</span></div>
  </div>
</div>
