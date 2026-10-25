<script>
  // El crismón ΧΡ dibujado como letra: trazo grueso y fino como la serif de los títulos,
  // y la panza de la Ρ abierta como en las monedas del siglo IV.
  let { tam = 28, anillo = false, animado = false, titulo = 'Chi-Ro' } = $props();
</script>

<svg width={tam} height={tam} viewBox="0 0 100 100" role="img" aria-label={titulo} fill="none" stroke="currentColor">
  {#if anillo}
    <circle cx="50" cy="50" r="46" stroke-width="1.6" class:trazo={animado} />
  {/if}
  <path d="M50 12 V90" stroke-width="8.5" class:trazo={animado} />
  <path d="M50 14 C78 11 81 48 58 46" stroke-width="5" stroke-linecap="round" class={animado ? 'trazo t2' : ''} />
  <path d="M27 38 L73 84" stroke-width="8.5" class={animado ? 'trazo t3' : ''} />
  <path d="M73 38 L27 84" stroke-width="2.6" class={animado ? 'trazo t3' : ''} />
  <path d="M42 90 H58" stroke-width="2.6" />
</svg>
