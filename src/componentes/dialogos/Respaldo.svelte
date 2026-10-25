<script>
  import { exportar, importar, usuario } from '../../lib/usuario.svelte.js';
  import { avisar, copiarTexto } from '../../lib/ui.svelte.js';
  import { guardarArchivo } from '../../lib/archivos.js';
  import { esTauri } from '../../lib/bd.js';
  import { t } from '../../lib/i18n.svelte.js';

  let mensaje = $state('');

  async function descargar() {
    const hoy = new Date().toISOString().slice(0, 10);
    try {
      if (await guardarArchivo(`chi-ro-heirs-respaldo-${hoy}.json`, JSON.stringify(exportar(), null, 2), { name: 'Respaldo', extensions: ['json'] })) {
        avisar(t('res.guardado'));
      }
    } catch (e) {
      avisar(t('res.noGuardado', { e: e.message || e }), true);
    }
  }

  async function copiar() {
    avisar((await copiarTexto(JSON.stringify(exportar()))) ? t('res.copiado') : t('res.noCopiado'));
  }

  async function cargar(e) {
    const archivo = e.currentTarget.files?.[0];
    if (!archivo) return;
    try {
      const n = importar(JSON.parse(await archivo.text()));
      mensaje = n ? t('res.anadidos', { n }) : t('res.nadaNuevo');
    } catch (err) {
      mensaje = err.message || t('res.noLeido');
    }
    e.currentTarget.value = '';
  }
</script>

<h3>{t('res.datos')}</h3>
<p class="ayuda">
  {t('res.resumen', { notas: usuario.notas.length, sub: Object.keys(usuario.subrayados).length, cintas: usuario.cintas.length, mem: usuario.memoria.length, leidos: Object.keys(usuario.leidos).length })}
  {esTauri ? t('res.dondeApp') : t('res.dondeWeb')}
</p>
<h3>{t('res.exportar')}</h3>
<p class="ayuda">{t('res.exportarAyuda')}</p>
<div class="fila-botones">
  <button class="boton" onclick={descargar}>{t('res.guardar')}</button>
  <button class="boton secundario" onclick={copiar}>{t('res.copiar')}</button>
</div>
<h3>{t('res.importar')}</h3>
<p class="ayuda">{t('res.importarAyuda')}</p>
<input class="campo" type="file" accept=".json,application/json" onchange={cargar} aria-label={t('res.archivo')} />
{#if mensaje}<p class="nota-pie">{mensaje}</p>{/if}
<h3>{t('res.sync')}</h3>
<p class="ayuda">{t('res.syncAyuda')}</p>
