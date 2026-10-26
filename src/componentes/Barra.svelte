<script>
  import Emblema from './Emblema.svelte';
  import Icono from './Icono.svelte';
  import { ui, irA, abrirPestana, avisar } from '../lib/ui.svelte.js';
  import { usuario, ajustar } from '../lib/usuario.svelte.js';
  import { lista } from '../lib/biblia.js';
  import { parsearReferencia, nombreRef } from '../lib/libros.js';
  import { t } from '../lib/i18n.svelte.js';
  import { voz, leer, detener } from '../lib/voz.svelte.js';

  let { versiones = [] } = $props();
  let texto = $state('');
  let entrada;

  const grupos = $derived([
    [t('grupo.es'), versiones.filter((v) => v.idioma === 'es')],
    [t('grupo.en'), versiones.filter((v) => v.idioma === 'en')],
  ]);

  function enviar(e) {
    e.preventDefault();
    const q = texto.trim();
    if (!q) return;
    const ref = parsearReferencia(q);
    if (ref) {
      irA(ref.libro, ref.cap, ref.v);
      if (ref.v && ref.hasta) ui.seleccion = Array.from({ length: ref.hasta - ref.v + 1 }, (_, i) => ref.v + i);
      avisar(nombreRef(ref.libro, ref.cap, ref.v, ref.hasta));
    } else {
      ui.busqueda = q;
      abrirPestana('buscar');
    }
    texto = '';
    entrada.blur();
  }

  export function enfocar() {
    entrada?.focus();
    entrada?.select();
  }

  function cambiarTema() {
    const actual = usuario.ajustes.tema;
    const oscuro = actual === 'cuero' || (actual === 'sistema' && !matchMedia('(prefers-color-scheme: light)').matches);
    ajustar('tema', oscuro ? 'papel' : 'cuero');
  }

  const esMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
</script>

<header class="barra">
  <button class="ico solo-tableta" onclick={() => (ui.navAbierta = !ui.navAbierta)} aria-label={t('barra.libros')} title={t('barra.libros')}>
    <Icono n="menu" />
  </button>
  <button class="marca" onclick={() => { ui.pasoInicio = 'menu'; ui.vista = 'inicio'; }} aria-label="Chi-Ro Heirs · {t('ini.abrir')}" title="Inicio">
    <Emblema tam={30} />
    <span class="logotipo marca-t" role="img" aria-label="Chi-Ro Heirs"></span>
  </button>
  <form class="ir" onsubmit={enviar} role="search">
    <input bind:this={entrada} bind:value={texto} type="text" placeholder={t('barra.irBuscar')}
      autocomplete="off" spellcheck="false" aria-label={t('barra.irBuscarAria')} />
    <kbd>{esMac ? '⌘' : 'Ctrl'} K</kbd>
  </form>
  <label class="sel" title={t('barra.version')}>
    <span class="vh">{t('barra.version')}</span>
    <select value={usuario.ajustes.version} onchange={(e) => ajustar('version', e.currentTarget.value)}>
      {#each grupos as [nombre, vs]}
        <optgroup label={nombre}>
          {#each vs as v}<option value={v.id}>{v.id} · {v.nombre}{v.enLinea ? ` ${t('barra.enLinea')}` : ''}</option>{/each}
        </optgroup>
      {/each}
    </select>
  </label>
  <label class="sel solo-escritorio" title={t('barra.paralela')}>
    <span class="vh">{t('barra.paralela')}</span>
    <select value={usuario.ajustes.paralela} onchange={(e) => ajustar('paralela', e.currentTarget.value)}>
      <option value="">{t('barra.sinParalela')}</option>
      {#each lista().filter((v) => v.id !== usuario.ajustes.version) as v}<option value={v.id}>∥ {v.id} · {v.nombre}</option>{/each}
    </select>
  </label>
  <span class="espacio"></span>
  <button class="ico" class:activo={voz.activa} onclick={() => (voz.activa ? detener() : leer())}
    aria-label={voz.activa ? t('barra.detener') : t('barra.leer')} title={voz.activa ? t('barra.detener') : t('barra.leer')}>
    <Icono n={voz.activa ? 'pausa' : 'voz'} />
  </button>
  <button class="ico solo-escritorio" onclick={cambiarTema} aria-label={t('barra.tema')} title={t('barra.tema')}><Icono n="tema" /></button>
  <button class="ico" class:activo={ui.estudioAbierto} onclick={() => (ui.estudioAbierto = !ui.estudioAbierto)}
    aria-label={t('barra.estudio')} title={t('barra.estudio')}><Icono n="estudio" /></button>
</header>
