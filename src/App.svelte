<script>
  import { onMount } from 'svelte';
  import Barra from './componentes/Barra.svelte';
  import Navegacion from './componentes/Navegacion.svelte';
  import Lector from './componentes/Lector.svelte';
  import Estudio from './componentes/Estudio.svelte';
  import Acciones from './componentes/Acciones.svelte';
  import Dialogo from './componentes/Dialogo.svelte';
  import Emblema from './componentes/Emblema.svelte';
  import Inicio from './componentes/Inicio.svelte';
  import { ui, irA, recargarCapitulo } from './lib/ui.svelte.js';
  import { usuario, iniciarUsuario } from './lib/usuario.svelte.js';
  import { cargarVersiones, info } from './lib/biblia.js';
  import { capituloSiguiente, fijarIdiomaLibros } from './lib/libros.js';
  import { t } from './lib/i18n.svelte.js';
  import { abrirEnNavegador } from './lib/archivos.js';
  import { esTauri } from './lib/bd.js';

  let versiones = $state([]);
  let listo = $state(false);
  let fallo = $state('');
  let barra = $state();

  onMount(async () => {
    try {
      await Promise.all([cargarVersiones().then((v) => (versiones = v)), iniciarUsuario()]);
      if (!info(usuario.ajustes.version)) usuario.ajustes.version = 'NTV';
      ui.vista = usuario.ajustes.mostrarInicio ? 'inicio' : 'lector';
      listo = true;
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

  // Tema y tipografía
  $effect(() => {
    const r = document.documentElement;
    const { tema, tamano, interlineado, fuente } = usuario.ajustes;
    if (tema === 'sistema') r.removeAttribute('data-theme');
    else r.setAttribute('data-theme', tema === 'papel' ? 'light' : 'dark');
    r.style.setProperty('--tam-texto', `${tamano}px`);
    r.style.setProperty('--interlineado', interlineado);
    r.style.setProperty('--f-texto', fuente === 'atkinson' ? 'var(--f-atkinson)' : 'var(--f-literata)');
  });

  function tecla(e) {
    if (ui.vista === 'inicio') return; // la pantalla de inicio maneja su propio teclado
    const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); barra.enfocar(); return; }
    if (e.key === 'Escape') {
      if (ui.dialogo) return;
      if (ui.seleccion.length) ui.seleccion = [];
      else if (ui.navAbierta) ui.navAbierta = false;
      else if (innerWidth <= 900) ui.estudioAbierto = false;
      return;
    }
    if (escribiendo || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); barra.enfocar(); }
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

<!-- filtros de las referencias: «aura» desenfoca con grano como una fotocopia; «riso» corre el borde de la tinta -->
<svg class="filtros" aria-hidden="true" width="0" height="0">
  <filter id="aura-ui" x="-10%" y="-30%" width="120%" height="160%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="b" />
    <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" result="r" />
    <feDisplacementMap in="b" in2="r" scale="6" xChannelSelector="R" yChannelSelector="G" />
  </filter>
  <filter id="riso-ui" x="-5%" y="-10%" width="110%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" result="r" />
    <feDisplacementMap in="SourceGraphic" in2="r" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
  </filter>
</svg>

{#if !listo}
  <div class="arranque">
    <Emblema tam={110} animado anillo />
    {#if fallo}
      <p class="cartel">{t('app.noAbrir')} <em>{t('app.noAbrirEm')}</em></p>
      <p class="ayuda">{fallo}</p>
    {:else}
      <span class="logotipo apilado arranque-marca" role="img" aria-label="Chi-Ro Heirs"></span>
      <span class="arranque-lema">Herederos de Dios y coherederos con Cristo · Ro 8:17</span>
    {/if}
  </div>
{:else}
  {#key idiomaUI}
  {#if ui.vista === 'inicio'}<Inicio />{/if}
  <Barra bind:this={barra} {versiones} />
  <div class="marco" class:sin-estudio={!ui.estudioAbierto}>
    <Navegacion />
    <Lector />
    <Estudio />
  </div>
  {#if ui.navAbierta || (ui.estudioAbierto && typeof innerWidth !== 'undefined' && innerWidth <= 900)}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="velo" onclick={() => { ui.navAbierta = false; if (innerWidth <= 900) ui.estudioAbierto = false; }}></div>
  {/if}
  <Acciones />
  <Dialogo />
  {#if ui.aviso}<div class="aviso" class:error={ui.aviso.error} role="status">{ui.aviso.texto}</div>{/if}
  {#if usuario.error}<div class="aviso error" role="alert">{t('app.noGuardar', { e: usuario.error })}</div>{/if}
  {/key}
{/if}
