<script>
  // Navegación inferior en pantallas chicas (≤ 760 px): los mismos seis destinos de la cabecera.
  import Icono from './Icono.svelte';
  import { ui, abrirVista } from '../lib/ui.svelte.js';
  import { t } from '../lib/i18n.svelte.js';

  const DESTINOS = [
    ['inicio', 'inicio', 'vista.inicio'],
    ['biblioteca', 'biblioteca', 'vista.bibliotecaCorta'],
    ['lector', 'lector', 'vista.lector'],
    ['archivo', 'guardar', 'vista.archivoCorta'],
    ['laminas', 'laminas', 'vista.laminas'],
    ['historia', 'historia', 'vista.historia'],
  ];
</script>

<nav class="nav-movil" aria-label={t('cab.navMovil')}>
  {#each DESTINOS as [v, icono, etiqueta]}
    <button class:activa={ui.vista === v} aria-current={ui.vista === v ? 'page' : undefined} onclick={() => abrirVista(v)}>
      <Icono n={icono} /><span>{t(etiqueta)}</span>
    </button>
  {/each}
</nav>
