<script>
  import Icono from './Icono.svelte';
  import { ui, abrirPestana, clavesSeleccion, etiquetaSeleccion, avisar, copiarTexto } from '../lib/ui.svelte.js';
  import { usuario, subrayar, memorizar } from '../lib/usuario.svelte.js';
  import { clave } from '../lib/libros.js';

  const COLORES = ['oro', 'rojo', 'azul', 'verde', 'hueso'];

  function textoSeleccion() {
    const s = new Set(ui.seleccion);
    return ui.cap.versos.filter((x) => s.has(x.v)).map((x) => x.texto).join(' ');
  }

  async function copiar() {
    const t = `«${textoSeleccion()}» ${etiquetaSeleccion()} (${usuario.ajustes.version})`;
    avisar((await copiarTexto(t)) ? 'Copiado.' : 'No se pudo copiar; selecciona el texto a mano.', false);
  }

  function aMemoria() {
    const s = [...ui.seleccion].sort((a, b) => a - b);
    const { libro, cap } = usuario.ajustes.pos;
    const ref = clave(libro, cap, s[0]) + (s.length > 1 ? `-${clave(libro, cap, s.at(-1))}` : '');
    avisar(memorizar(ref) ? 'Añadido a tu memoria.' : 'Ya está en tu memoria.');
    abrirPestana('memoria');
  }

  function accion(a) {
    if (a === 'cerrar') ui.seleccion = [];
    else if (a === 'copiar') copiar();
    else if (a === 'memoria') aMemoria();
    else if (a === 'poster') ui.dialogo = 'poster';
    else abrirPestana(a);
  }
</script>

{#if ui.seleccion.length}
  <div class="acciones" role="toolbar" aria-label="Acciones del versículo">
    <span class="acc-ref">{etiquetaSeleccion()}</span>
    <div class="colores">
      {#each COLORES as c}
        <button data-color={c} onclick={() => subrayar(clavesSeleccion(), c)} aria-label="Subrayar {c}" title={c}></button>
      {/each}
      <button class="sin" onclick={() => subrayar(clavesSeleccion(), null)} aria-label="Quitar subrayado" title="Quitar subrayado"></button>
    </div>
    <div class="acc-botones">
      {#if ui.palabra}
        <button class="acc-palabra" onclick={() => accion('palabra')} title="Estudiar esta palabra"><Icono n="palabra" /><span>«{ui.palabra.texto}»</span></button>
      {/if}
      <button onclick={() => accion('notas')}><Icono n="nota" /><span>Nota</span></button>
      <button onclick={() => accion('refs')}><Icono n="refs" /><span>Refs</span></button>
      <button onclick={() => accion('comparar')}><Icono n="comparar" /><span>Comparar</span></button>
      <button onclick={() => accion('memoria')}><Icono n="memoria" /><span>Memorizar</span></button>
      <button onclick={() => accion('poster')}><Icono n="poster" /><span>Póster</span></button>
      <button onclick={() => accion('copiar')}><Icono n="copiar" /><span>Copiar</span></button>
      <button onclick={() => accion('cerrar')} aria-label="Quitar selección" title="Quitar selección (Esc)"><Icono n="cerrar" /></button>
    </div>
  </div>
{/if}
