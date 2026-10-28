<script>
  // Aviso de versión nueva: abajo a la izquierda, sin tapar la lectura. «Más tarde» lo esconde hasta la próxima vez.
  import { act, instalarActualizacion } from '../lib/actualizar.svelte.js';
  import { t } from '../lib/i18n.svelte.js';
</script>

{#if !act.oculta && (act.estado === 'hay' || act.estado === 'bajando' || act.estado === 'reiniciando')}
  <div class="actualizacion" role="status" aria-live="polite">
    <span class="etiqueta-ui">{t('act.nueva')}</span>
    <p class="act-version">Chi-Ro Heirs {act.version}{act.actual ? ` · ${t('act.tienes', { v: act.actual })}` : ''}</p>
    {#if act.estado === 'hay'}
      <div class="fila-botones">
        <button class="boton" onclick={instalarActualizacion}>{t('act.instalar')}</button>
        <button class="boton secundario" onclick={() => (act.oculta = true)}>{t('act.luego')}</button>
      </div>
    {:else}
      <span class="act-barra" role="progressbar" aria-valuenow={Math.round(act.progreso * 100)}><i style:width="{act.progreso * 100}%"></i></span>
      <p class="act-notas">{act.estado === 'reiniciando' ? t('act.reiniciando') : t('act.bajando', { p: Math.round(act.progreso * 100) })}</p>
    {/if}
  </div>
{/if}
