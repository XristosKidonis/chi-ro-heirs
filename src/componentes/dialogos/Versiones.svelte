<script>
  import { lista } from '../../lib/biblia.js';
  import { usuario, ajustar } from '../../lib/usuario.svelte.js';
  import { ui, avisar } from '../../lib/ui.svelte.js';
  import { t } from '../../lib/i18n.svelte.js';

  let clave = $state(usuario.ajustes.claveNLT === 'TEST' ? '' : usuario.ajustes.claveNLT);

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

<h3>{t('ver.tuyas')}</h3>
{#each lista() as v (v.id)}
  <div class="version-fila">
    <div class="vn">{v.id} · {v.nombre}<small>{v.licencia}</small></div>
    <span class="insignia" class:linea={v.enLinea}>{v.enLinea ? t('ver.enLinea') : t('ver.equipo')}</span>
    <button class="boton secundario" onclick={() => usar(v.id)} disabled={usuario.ajustes.version === v.id}>
      {usuario.ajustes.version === v.id ? t('ver.leyendo') : t('ver.leer')}
    </button>
  </div>
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
