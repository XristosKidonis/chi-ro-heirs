<script>
  // Barra de selección: aparece al tocar versículos. Primero lo esencial (subrayar, guardar, nota,
  // estudiar, lámina); el resto queda a un toque en «Más», sin perder ninguna función.
  import Icono from './Icono.svelte';
  import { ui, abrirPestana, clavesSeleccion, etiquetaSeleccion, avisar, copiarTexto } from '../lib/ui.svelte.js';
  import { usuario, subrayar, memorizar, alternarGuardado, estaGuardado } from '../lib/usuario.svelte.js';
  import { clave } from '../lib/libros.js';
  import { COLORES, etiquetaColor, significado } from '../lib/clave.js';
  import { t } from '../lib/i18n.svelte.js';

  let mas = $state(false);
  // «Más» se cierra al cambiar de versículo, para que la barra vuelva a ser chica
  $effect(() => { ui.seleccion.join(','); mas = false; });

  // color de la selección (si todos los versículos comparten uno), para mostrar qué significa en tu clave
  const colorSel = $derived.by(() => {
    const cs = new Set(clavesSeleccion().map((k) => usuario.subrayados[k]));
    return cs.size === 1 ? [...cs][0] || null : null;
  });

  function pintar(color) {
    subrayar(clavesSeleccion(), color);
    if (color && significado(color)) avisar(t('clave.subrayado', { s: significado(color) }));
  }

  const guardada = $derived(ui.seleccion.length > 0 && clavesSeleccion().every(estaGuardado));

  function textoSeleccion() {
    const s = new Set(ui.seleccion);
    return ui.cap.versos.filter((x) => s.has(x.v)).map((x) => x.texto).join(' ');
  }

  async function copiar() {
    const texto = `«${textoSeleccion()}» ${etiquetaSeleccion()} (${usuario.ajustes.version})`;
    avisar((await copiarTexto(texto)) ? t('acc.copiado') : t('acc.noCopiado'));
  }

  function aMemoria() {
    const s = [...ui.seleccion].sort((a, b) => a - b);
    const { libro, cap } = usuario.ajustes.pos;
    const ref = clave(libro, cap, s[0]) + (s.length > 1 ? `-${clave(libro, cap, s.at(-1))}` : '');
    avisar(memorizar(ref) ? t('acc.memoriaSi') : t('acc.memoriaYa'));
    abrirPestana('memoria');
  }

  function accion(a) {
    if (a === 'cerrar') ui.seleccion = [];
    else if (a === 'copiar') copiar();
    else if (a === 'memoria') aMemoria();
    else if (a === 'guardar') avisar(alternarGuardado(clavesSeleccion()) ? t('acc.guardado') : t('acc.guardadoQuitado'));
    else if (a === 'estudiar') abrirPestana(ui.palabra ? 'palabra' : 'original');
    else if (a === 'poster') { ui.lamina = null; ui.dialogo = 'poster'; }
    else abrirPestana(a);
  }
</script>

{#if ui.seleccion.length}
  <div class="acciones" role="toolbar" aria-label={t('acc.aria')}>
    <div class="acc-cita">
      <span class="acc-ref">{etiquetaSeleccion()} / {usuario.ajustes.version}{#if colorSel}{' · '}<i class="acc-sentido" data-m={colorSel}>{etiquetaColor(colorSel)}</i>{/if}</span>
      <span class="acc-texto">{textoSeleccion()}</span>
    </div>
    <div class="acc-fila">
      <div class="colores" role="group" aria-label={t('acc.subrayar')}>
        {#each COLORES as c}
          <button data-color={c} onclick={() => pintar(c)} aria-label="{t('acc.subrayar')}: {etiquetaColor(c)}" title={etiquetaColor(c)}></button>
        {/each}
        <button class="sin" onclick={() => pintar(null)} aria-label={t('acc.quitarSub')} title={t('acc.quitarSub')}></button>
        <button class="acc-clave" onclick={() => (ui.dialogo = 'clave')} title={t('clave.abrir')}>{t('clave.corto')}</button>
      </div>
      <div class="acc-botones">
        <button class="acc-guardar" aria-pressed={guardada} onclick={() => accion('guardar')}>{guardada ? t('acc.quitarGuardado') : t('acc.guardar')}</button>
        <button onclick={() => accion('notas')}>{t('acc.nota')}</button>
        <button class="acc-palabra" onclick={() => accion('estudiar')} title={t('acc.estudiar')}>{t('acc.estudiarCorto')}{#if ui.palabra} <i>«{ui.palabra.texto}»</i>{/if}</button>
        <button onclick={() => accion('poster')}>{t('acc.poster')}</button>
        <button class="acc-mas" aria-expanded={mas} onclick={() => (mas = !mas)}>{t('aj.otros')} {mas ? '−' : '+'}</button>
        <button class="acc-cerrar" onclick={() => accion('cerrar')} aria-label={t('acc.quitarSel')} title={t('acc.quitarSel')}><Icono n="cerrar" /></button>
      </div>
    </div>
    {#if mas}
      <div class="acc-botones acc-mas-fila">
        <button onclick={() => accion('original')}>{t('acc.original')}</button>
        <button onclick={() => accion('refs')}>{t('acc.refs')}</button>
        <button onclick={() => accion('comparar')}>{t('acc.comparar')}</button>
        <button onclick={() => accion('memoria')}>{t('acc.memorizar')}</button>
        <button onclick={() => accion('copiar')}>{t('acc.copiar')}</button>
      </div>
    {/if}
  </div>
{/if}
