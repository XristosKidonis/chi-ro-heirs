<script>
  // Marca CHI—RO: texto nítido, sin filtros, sombras ni texturas (decisión final del dueño).
  // «grande» es la versión del inicio; la normal va en la cabecera.
  let { grande = false } = $props();
</script>

{#if grande}
  <div class="marca-grande" role="img" aria-label="Chi-Ro Heirs"><span>CHI—RO</span><small>HEIRS</small></div>
{:else}
  <span class="marca" aria-hidden="true"><span class="marca-main">CHI—RO</span><span class="marca-sub">HEIRS</span></span>
{/if}
