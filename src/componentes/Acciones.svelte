<script>
  import Icono from './Icono.svelte';
  import { ui, abrirPestana, clavesSeleccion, etiquetaSeleccion, avisar, copiarTexto } from '../lib/ui.svelte.js';
  import { usuario, subrayar, memorizar } from '../lib/usuario.svelte.js';
  import { clave } from '../lib/libros.js';
  import { t } from '../lib/i18n.svelte.js';

  const COLORES = ['oro', 'rojo', 'azul', 'verde', 'hueso'];

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
    else if (a === 'poster') ui.dialogo = 'poster';
    else abrirPestana(a);
  }
</script>

{#if ui.seleccion.length}
  <div class="acciones" role="toolbar" aria-label={t('acc.aria')}>
    <span class="acc-ref">{etiquetaSeleccion()}</span>
    <div class="colores">
      {#each COLORES as c}
        <button data-color={c} onclick={() => subrayar(clavesSeleccion(), c)} aria-label="{t('acc.subrayar')}: {t(`color.${c}`)}" title={t(`color.${c}`)}></button>
      {/each}
      <button class="sin" onclick={() => subrayar(clavesSeleccion(), null)} aria-label={t('acc.quitarSub')} title={t('acc.quitarSub')}></button>
    </div>
    <div class="acc-botones">
      {#if ui.palabra}
        <button class="acc-palabra" onclick={() => accion('palabra')} title={t('acc.estudiar')}><Icono n="palabra" /><span>«{ui.palabra.texto}»</span></button>
      {/if}
      <button onclick={() => accion('notas')}><Icono n="nota" /><span>{t('acc.nota')}</span></button>
      <button onclick={() => accion('original')}><Icono n="original" /><span>{t('acc.original')}</span></button>
      <button onclick={() => accion('refs')}><Icono n="refs" /><span>{t('acc.refs')}</span></button>
      <button onclick={() => accion('comparar')}><Icono n="comparar" /><span>{t('acc.comparar')}</span></button>
      <button onclick={() => accion('memoria')}><Icono n="memoria" /><span>{t('acc.memorizar')}</span></button>
      <button onclick={() => accion('poster')}><Icono n="poster" /><span>{t('acc.poster')}</span></button>
      <button onclick={() => accion('copiar')}><Icono n="copiar" /><span>{t('acc.copiar')}</span></button>
      <button onclick={() => accion('cerrar')} aria-label={t('acc.quitarSel')} title={t('acc.quitarSel')}><Icono n="cerrar" /></button>
    </div>
  </div>
{/if}
