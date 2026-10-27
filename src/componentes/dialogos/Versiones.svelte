<script>
  // Versiones: cada traducción con su tipo (de literal a paráfrasis), año, descripción y licencia.
  import { lista, TIPOS } from '../../lib/biblia.js';
  import { usuario, ajustar } from '../../lib/usuario.svelte.js';
  import { ui, avisar } from '../../lib/ui.svelte.js';
  import { t, idioma } from '../../lib/i18n.svelte.js';

  let clave = $state(usuario.ajustes.claveNLT === 'TEST' ? '' : usuario.ajustes.claveNLT);
  const versiones = $derived(lista());
  const grupos = $derived([
    ['es', t('grupo.es'), versiones.filter((v) => v.idioma === 'es')],
    ['en', t('grupo.en'), versiones.filter((v) => v.idioma === 'en')],
  ]);
  const descripcion = (v) => (idioma() === 'en' ? v.descripcion_en : v.descripcion) || '';

  function guardarClave(e) {
    e.preventDefault();
    ajustar('claveNLT', clave.trim() || 'TEST');
    avisar(clave.trim() ? t('ver.claveGuardada') : t('ver.clavePrueba'));
  }

  function usar(id) {
    ajustar('version', id);
    ui.dialogo = null;
  }
</script>

<p class="ayuda">{t('ver.intro')}</p>
<ol class="espectro" aria-label={t('ver.espectro')}>
  {#each TIPOS as tipo}
    <li>
      <span class="esp-tipo">{t(`tipo.${tipo}`)}</span>
      <span class="esp-def">{t(`tipo.${tipo}.d`)}</span>
      <span class="esp-ids">{versiones.filter((v) => v.tipo === tipo).map((v) => v.id).join(' · ') || '—'}</span>
    </li>
  {/each}
</ol>

{#each grupos as [id, nombre, vs] (id)}
  <h3>{nombre} <small class="cuenta">{vs.length}</small></h3>
  {#each vs as v (v.id)}
    <div class="version-fila">
      <div class="vn">
        {v.id} · {v.nombre}
        <span class="vn-meta">{#if v.tipo}<b>{t(`tipo.${v.tipo}`)}</b>{/if}{#if v.anio}{' · '}{v.anio}{/if}</span>
        {#if descripcion(v)}<span class="vn-desc">{descripcion(v)}</span>{/if}
        <small>{v.licencia}</small>
      </div>
      <span class="insignia" class:linea={v.enLinea}>{v.enLinea ? t('ver.enLinea') : t('ver.equipo')}</span>
      <button class="boton secundario" onclick={() => usar(v.id)} disabled={usuario.ajustes.version === v.id}>
        {usuario.ajustes.version === v.id ? t('ver.leyendo') : t('ver.leer')}
      </button>
    </div>
  {/each}
{/each}

<h3>{t('ver.clave')}</h3>
<p class="ayuda">{t('ver.claveAyuda')} <a href="https://api.nlt.to/" target="_blank" rel="noopener">api.nlt.to</a> {t('ver.clavePega')}</p>
<form class="fila-botones" onsubmit={guardarClave}>
  <input class="campo" style="flex: 1 1 240px" type="text" bind:value={clave} placeholder={t('ver.clavePlaceholder')} aria-label={t('ver.clave')} spellcheck="false" autocomplete="off" />
  <button class="boton" type="submit">{t('ver.guardar')}</button>
</form>
<p class="nota-pie">{t('ver.licencia')}</p>

<h3>{t('ver.proximo')}</h3>
<p class="ayuda">{t('ver.proximoAyuda')}</p>
