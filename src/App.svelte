<script>
  import { onMount } from 'svelte';
  import Cabecera from './componentes/Cabecera.svelte';
  import NavMovil from './componentes/NavMovil.svelte';
  import Buscador from './componentes/Buscador.svelte';
  import Marca from './componentes/Marca.svelte';
  import Navegacion from './componentes/Navegacion.svelte';
  import Biblioteca from './componentes/vistas/Biblioteca.svelte';
  import Archivo from './componentes/vistas/Archivo.svelte';
  import Galeria from './componentes/vistas/Galeria.svelte';
  import Historia from './componentes/vistas/Historia.svelte';
  import Visor from './componentes/historia/Visor.svelte';
  import Lector from './componentes/Lector.svelte';
  import Estudio from './componentes/Estudio.svelte';
  import Acciones from './componentes/Acciones.svelte';
  import Dialogo from './componentes/Dialogo.svelte';
  import Inicio from './componentes/Inicio.svelte';
  import Actualizacion from './componentes/Actualizacion.svelte';
  import { buscarAlAbrir } from './lib/actualizar.svelte.js';
  import { ui, irA, recargarCapitulo } from './lib/ui.svelte.js';
  import { usuario, iniciarUsuario, ajustar } from './lib/usuario.svelte.js';
  import { cargarVersiones, info } from './lib/biblia.js';
  import { capituloSiguiente, fijarIdiomaLibros } from './lib/libros.js';
  import { t } from './lib/i18n.svelte.js';
  import { abrirEnNavegador } from './lib/archivos.js';
  import { esTauri } from './lib/bd.js';

  let listo = $state(false);
  let fallo = $state('');

  onMount(async () => {
    try {
      await Promise.all([cargarVersiones(), iniciarUsuario()]);
      if (!info(usuario.ajustes.version)) usuario.ajustes.version = 'NTV';
      ui.vista = usuario.ajustes.mostrarInicio ? 'inicio' : 'lector';
      listo = true;
      buscarAlAbrir();
    } catch (e) {
      fallo = e.message || String(e);
    }
  });

  // Cargar el capítulo cuando cambia la posición, la versión o la paralela
  $effect(() => {
    if (!listo) return;
    usuario.ajustes.pos.libro; usuario.ajustes.pos.cap;
    usuario.ajustes.version; usuario.ajustes.paralela; usuario.ajustes.claveNLT;
    recargarCapitulo();
  });

  // Idioma: los nombres de libro se fijan antes de volver a pintar la interfaz
  const idiomaUI = $derived.by(() => {
    fijarIdiomaLibros(usuario.ajustes.idioma);
    return usuario.ajustes.idioma;
  });
  $effect(() => { document.documentElement.lang = idiomaUI === 'en' ? 'en' : 'es'; });

  // Tema y tipografía. Todo es claro; el modo oscuro es solo del lector (y sus paneles).
  $effect(() => {
    const r = document.documentElement;
    const { tema, tamano, interlineado, fuente } = usuario.ajustes;
    const enLector = ui.vista === 'lector';
    if (tema === 'sistema' && enLector) r.removeAttribute('data-theme');
    else r.setAttribute('data-theme', tema === 'cuero' && enLector ? 'dark' : 'light');
    r.style.setProperty('--tam-texto', `${tamano}px`);
    r.style.setProperty('--interlineado', interlineado);
    r.style.setProperty('--f-texto', fuente === 'atkinson' ? 'var(--f-atkinson)' : 'var(--f-literata)');
  });

  function tecla(e) {
    const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ui.buscadorAbierto = true; return; }
    if (e.key === 'Escape') {
      if (ui.dialogo || ui.buscadorAbierto || ui.visor) return; // los diálogos se cierran solos
      if (usuario.ajustes.calma && ui.vista === 'lector') ajustar('calma', false);
      else if (ui.seleccion.length) ui.seleccion = [];
      else if (ui.navAbierta) ui.navAbierta = false;
      else if (ui.estudioAbierto && ui.vista === 'lector') ui.estudioAbierto = false;
      else if (ui.vista === 'laminas' && ui.coleccion) ui.coleccion = null;
      return;
    }
    if (escribiendo || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); ui.buscadorAbierto = true; }
    if (ui.vista !== 'lector') return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const p = capituloSiguiente(usuario.ajustes.pos.libro, usuario.ajustes.pos.cap, e.key === 'ArrowLeft' ? -1 : 1);
      if (p) irA(p.libro, p.cap);
    }
  }

  // En la app de escritorio los enlaces externos se abren en tu navegador
  function clic(e) {
    const a = e.target.closest('a[target="_blank"]');
    if (a && esTauri) {
      e.preventDefault();
      abrirEnNavegador(a.href);
    }
  }
</script>

<svelte:window onkeydown={tecla} onclick={clic} />

{#if !listo}
  <div class="arranque">
    {#if fallo}
      <p class="cartel">{t('app.noAbrir')} <em>{t('app.noAbrirEm')}</em></p>
      <p class="ayuda">{fallo}</p>
    {:else}
      <Marca grande />
    {/if}
  </div>
{:else}
  {#key idiomaUI}
  {#if ui.vista === 'inicio'}
    <Inicio />
  {:else}
    {@const calma = ui.vista === 'lector' && usuario.ajustes.calma}
    <div class="app" class:calma data-vista={ui.vista}>
      {#if !calma}<Cabecera />{/if}
      {#if ui.vista === 'lector'}
        <div class="marco" class:con-estudio={ui.estudioAbierto}>
          <Lector />
          <Estudio />
        </div>
        <Navegacion />
        {#if ui.navAbierta || (ui.estudioAbierto && typeof innerWidth !== 'undefined' && innerWidth <= 900)}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <div class="velo" onclick={() => { ui.navAbierta = false; if (innerWidth <= 900) ui.estudioAbierto = false; }}></div>
        {/if}
        <Acciones />
        {#if calma}<button class="salir-calma" onclick={() => ajustar('calma', false)}>{t('lec.calmaSalir')}</button>{/if}
      {:else}
        <main class="vista">
          {#if ui.vista === 'biblioteca'}<Biblioteca />
          {:else if ui.vista === 'archivo'}<Archivo />
          {:else if ui.vista === 'historia'}<Historia />
          {:else}<Galeria />{/if}
        </main>
      {/if}
      {#if !calma}<NavMovil />{/if}
    </div>
  {/if}
  <Buscador />
  <Dialogo />
  <Actualizacion />
  <Visor />
  {#if ui.aviso}<div class="aviso" class:error={ui.aviso.error} role="status">{ui.aviso.texto}</div>{/if}
  {#if usuario.error}<div class="aviso error" role="alert">{t('app.noGuardar', { e: usuario.error })}</div>{/if}
  {/key}
{/if}
