<script>
  // Cabecera global: marca, cinco destinos y dos acciones (buscar y lo guardado). No aparece en el inicio.
  import Marca from './Marca.svelte';
  import Icono from './Icono.svelte';
  import { ui, abrirVista } from '../lib/ui.svelte.js';
  import { usuario } from '../lib/usuario.svelte.js';
  import { t } from '../lib/i18n.svelte.js';

  const VISTAS = ['inicio', 'biblioteca', 'lector', 'archivo', 'laminas'];
  const guardados = $derived(String(usuario.guardados.length).padStart(2, '0'));
</script>

<header class="cabecera">
  <button class="cab-marca" onclick={() => abrirVista('inicio')} aria-label={t('marca.aria')}><Marca /></button>
  <nav class="cab-nav" aria-label={t('cab.nav')}>
    {#each VISTAS as v}
      <button class="cab-link" class:activa={ui.vista === v} aria-current={ui.vista === v ? 'page' : undefined} onclick={() => abrirVista(v)}>{t(`vista.${v}`)}</button>
    {/each}
  </nav>
  <div class="cab-acciones">
    <button class="cab-accion" onclick={() => (ui.buscadorAbierto = true)} aria-label={t('cab.buscarAria')}><Icono n="buscar" /><span>{t('cab.buscar')}</span></button>
    <button class="cab-accion cab-guardados" onclick={() => abrirVista('archivo')} aria-label={t('cab.guardados')} title={t('cab.guardados')}><Icono n="guardar" /><span>{guardados}</span></button>
    <button class="cab-accion" onclick={() => (ui.dialogo = 'ajustes')} aria-label={t('cab.ajustes')} title={t('cab.ajustes')}><Icono n="ajustes" /></button>
  </div>
</header>
