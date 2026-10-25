<script>
  import { exportar, importar, usuario } from '../../lib/usuario.svelte.js';
  import { avisar, copiarTexto } from '../../lib/ui.svelte.js';
  import { guardarArchivo } from '../../lib/archivos.js';
  import { esTauri } from '../../lib/bd.js';

  let mensaje = $state('');

  async function descargar() {
    const hoy = new Date().toISOString().slice(0, 10);
    try {
      if (await guardarArchivo(`chi-ro-heirs-respaldo-${hoy}.json`, JSON.stringify(exportar(), null, 2), { name: 'Respaldo', extensions: ['json'] })) {
        avisar('Respaldo guardado.');
      }
    } catch (e) {
      avisar(`No se pudo guardar: ${e.message || e}`, true);
    }
  }

  async function copiar() {
    avisar((await copiarTexto(JSON.stringify(exportar()))) ? 'Respaldo copiado al portapapeles.' : 'No se pudo copiar.');
  }

  async function cargar(e) {
    const archivo = e.currentTarget.files?.[0];
    if (!archivo) return;
    try {
      const n = importar(JSON.parse(await archivo.text()));
      mensaje = n ? `Se añadieron ${n} elementos. Nada de lo que ya tenías se borró.` : 'El respaldo no traía nada nuevo.';
    } catch (err) {
      mensaje = err.message || 'El archivo no se pudo leer.';
    }
    e.currentTarget.value = '';
  }
</script>

<h3>Tus datos</h3>
<p class="ayuda">
  Tienes {usuario.notas.length} notas, {Object.keys(usuario.subrayados).length} subrayados, {usuario.cintas.length} cintas,
  {usuario.memoria.length} versículos en memoria y {Object.keys(usuario.leidos).length} capítulos leídos.
  {esTauri ? 'Todo vive en tu equipo, en el archivo usuario.db de la carpeta de la app.' : 'En el navegador viven en el almacenamiento local.'}
</p>
<h3>Exportar</h3>
<p class="ayuda">Un archivo JSON legible con todo lo tuyo. Sirve para guardarlo donde quieras o llevarlo a otro equipo.</p>
<div class="fila-botones">
  <button class="boton" onclick={descargar}>Guardar respaldo</button>
  <button class="boton secundario" onclick={copiar}>Copiar al portapapeles</button>
</div>
<h3>Importar</h3>
<p class="ayuda">Fusiona un respaldo con lo que ya tienes: añade lo que falta y no borra nada.</p>
<input class="campo" type="file" accept=".json,application/json" onchange={cargar} aria-label="Archivo de respaldo" />
{#if mensaje}<p class="nota-pie">{mensaje}</p>{/if}
<h3>Sincronización</h3>
<p class="ayuda">Próximo paso: sincronizar automáticamente con tu iCloud Drive entre tus equipos.</p>
