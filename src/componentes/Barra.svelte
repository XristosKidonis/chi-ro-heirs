<script>
  import Emblema from './Emblema.svelte';
  import Icono from './Icono.svelte';
  import { ui, irA, abrirPestana, avisar } from '../lib/ui.svelte.js';
  import { usuario, ajustar } from '../lib/usuario.svelte.js';
  import { lista } from '../lib/biblia.js';
  import { parsearReferencia, nombreRef } from '../lib/libros.js';
  import { voz, leer, detener } from '../lib/voz.svelte.js';

  let { versiones = [] } = $props();
  let texto = $state('');
  let entrada;

  const grupos = $derived([
    ['Español', versiones.filter((v) => v.idioma === 'es')],
    ['English', versiones.filter((v) => v.idioma === 'en')],
  ]);

  function enviar(e) {
    e.preventDefault();
    const t = texto.trim();
    if (!t) return;
    const ref = parsearReferencia(t);
    if (ref) {
      irA(ref.libro, ref.cap, ref.v);
      if (ref.v && ref.hasta) ui.seleccion = Array.from({ length: ref.hasta - ref.v + 1 }, (_, i) => ref.v + i);
      avisar(nombreRef(ref.libro, ref.cap, ref.v, ref.hasta));
    } else {
      ui.busqueda = t;
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
  <button class="ico solo-tableta" onclick={() => (ui.navAbierta = !ui.navAbierta)} aria-label="Libros y cintas" title="Libros y cintas">
    <Icono n="menu" />
  </button>
  <button class="marca" onclick={() => irA(usuario.ajustes.pos.libro, usuario.ajustes.pos.cap)} aria-label="Chi-Ro Heirs">
    <Emblema tam={30} />
    <span class="marca-t"><b>CHI-RO</b><i>Heirs</i></span>
  </button>
  <form class="ir" onsubmit={enviar} role="search">
    <input bind:this={entrada} bind:value={texto} type="text" placeholder="Ir a o buscar: Jn 3:16, gracia…"
      autocomplete="off" spellcheck="false" aria-label="Ir a una referencia o buscar" />
    <kbd>{esMac ? '⌘' : 'Ctrl'} K</kbd>
  </form>
  <label class="sel" title="Versión">
    <span class="vh">Versión</span>
    <select value={usuario.ajustes.version} onchange={(e) => ajustar('version', e.currentTarget.value)}>
      {#each grupos as [nombre, vs]}
        <optgroup label={nombre}>
          {#each vs as v}<option value={v.id}>{v.id} · {v.nombre}{v.enLinea ? ' (en línea)' : ''}</option>{/each}
        </optgroup>
      {/each}
    </select>
  </label>
  <label class="sel solo-escritorio" title="Versión en paralelo">
    <span class="vh">Paralela</span>
    <select value={usuario.ajustes.paralela} onchange={(e) => ajustar('paralela', e.currentTarget.value)}>
      <option value="">Sin paralela</option>
      {#each lista().filter((v) => v.id !== usuario.ajustes.version) as v}<option value={v.id}>∥ {v.id} · {v.nombre}</option>{/each}
    </select>
  </label>
  <span class="espacio"></span>
  <button class="ico" class:activo={voz.activa} onclick={() => (voz.activa ? detener() : leer())}
    aria-label={voz.activa ? 'Detener lectura' : 'Leer en voz alta'} title={voz.activa ? 'Detener lectura' : 'Leer en voz alta'}>
    <Icono n={voz.activa ? 'pausa' : 'voz'} />
  </button>
  <button class="ico solo-escritorio" onclick={cambiarTema} aria-label="Cambiar tema" title="Cuero / Papel"><Icono n="tema" /></button>
  <button class="ico" class:activo={ui.estudioAbierto} onclick={() => (ui.estudioAbierto = !ui.estudioAbierto)}
    aria-label="Panel de estudio" title="Panel de estudio"><Icono n="estudio" /></button>
</header>
