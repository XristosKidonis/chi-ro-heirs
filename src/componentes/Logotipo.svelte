<script>
  // Logotipo vectorial: las letras son trazos (nítidos a cualquier tamaño y pantalla) y la textura
  // de las referencias —borde corrido, huecos de tinta, halo de grano— la genera el navegador en vivo
  // con filtros SVG. El color es currentColor: hueso en Cuero y tinta en Papel, sin imágenes aparte.
  import { HORIZONTAL, APILADO } from '../lib/logotipo.js';

  // alto en px CSS; aura: halo grande y fuera de foco (arranque, portada); si no, textura fina (barra, menú)
  let { alto = 30, apilado = false, aura = false } = $props();
  const id = `logo-${Math.random().toString(36).slice(2, 8)}`;

  const caja = $derived.by(() => {
    if (apilado) return { x: 0, y: 0, w: APILADO.ancho, h: APILADO.alto };
    const [x0, y0, x1, y1] = HORIZONTAL.caja;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  });
  // unidades del dibujo por píxel en pantalla: el grano y el halo se miden en píxeles reales
  const u = $derived(caja.h / alto);
  const margen = $derived((aura ? 0.42 : 0.16) * caja.h);
  const vb = $derived(`${caja.x - margen} ${caja.y - margen} ${caja.w + 2 * margen} ${caja.h + 2 * margen}`);
  const ancho = $derived((alto * (caja.w + 2 * margen)) / caja.h);
  const altoTotal = $derived((alto * (caja.h + 2 * margen)) / caja.h);
  const f = $derived(aura
    ? { foco: 1.6, borde: 1.8, grano: 0.6, huecos: 0.42, halo: 8, haloA: 0.6 }
    : { foco: 0.3, borde: 0.7, grano: 0.8, huecos: 0.38, halo: 2, haloA: 0.28 });
</script>

<svg class="logotipo-svg" width={ancho} height={altoTotal} viewBox={vb} role="img" aria-label="Chi-Ro Heirs" style="margin: {-(altoTotal - alto) / 2}px {-(ancho - (alto * caja.w) / caja.h) / 2}px">
  <defs>
    <filter id={id} x={caja.x - margen} y={caja.y - margen} width={caja.w + 2 * margen} height={caja.h + 2 * margen} filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <!-- ruido en píxeles reales -->
      <feTurbulence type="fractalNoise" baseFrequency={f.grano / u} numOctaves="2" seed="7" result="ruido" />
      <!-- letra apenas fuera de foco, con el borde corrido por el ruido -->
      <feGaussianBlur in="SourceGraphic" stdDeviation={f.foco * u} result="blando" />
      <feDisplacementMap in="blando" in2="ruido" scale={f.borde * u} xChannelSelector="R" yChannelSelector="G" result="corrido" />
      <!-- umbral con ruido: la tinta no cubre del todo -->
      <!-- huecos donde el ruido baja del umbral (pocos y finos) -->
      <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 12 {1 - 12 * f.huecos}" result="mascara" />
      <feComposite in="corrido" in2="mascara" operator="in" result="tinta" />
      <feComponentTransfer in="tinta" result="tinta">
        <feFuncA type="linear" slope="1.8" intercept="-0.2" />
      </feComponentTransfer>
      <!-- halo de grano alrededor -->
      <feGaussianBlur in="SourceGraphic" stdDeviation={f.halo * u} result="nube" />
      <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3 -1.25" result="puntos" />
      <feComposite in="nube" in2="puntos" operator="in" result="halo" />
      <feComponentTransfer in="halo" result="halo">
        <feFuncA type="linear" slope={f.haloA * 2} />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="halo" />
        <feMergeNode in="tinta" />
      </feMerge>
    </filter>
  </defs>
  <g fill="currentColor" filter="url(#{id})">
    {#if apilado}
      {#each APILADO.renglones as r}
        <path d={r.d} transform="translate({-r.caja[0] * r.escala} {r.y}) scale({r.escala})" />
      {/each}
    {:else}
      <path d={HORIZONTAL.d} />
    {/if}
  </g>
</svg>

<style>
  .logotipo-svg { display: block; flex: none; overflow: visible; }
</style>
