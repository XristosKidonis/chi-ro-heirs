<script>
  import { lista } from '../../lib/biblia.js';
  import { usuario, ajustar } from '../../lib/usuario.svelte.js';
  import { ui, avisar } from '../../lib/ui.svelte.js';

  let clave = $state(usuario.ajustes.claveNLT === 'TEST' ? '' : usuario.ajustes.claveNLT);

  function guardarClave(e) {
    e.preventDefault();
    ajustar('claveNLT', clave.trim() || 'TEST');
    avisar(clave.trim() ? 'Clave guardada.' : 'Usando la clave de prueba.');
  }

  function usar(id) {
    ajustar('version', id);
    ui.dialogo = null;
  }
</script>

<h3>Tus versiones</h3>
{#each lista() as v (v.id)}
  <div class="version-fila">
    <div class="vn">{v.id} · {v.nombre}<small>{v.licencia}</small></div>
    <span class="insignia" class:linea={v.enLinea}>{v.enLinea ? 'En línea' : 'En tu equipo'}</span>
    <button class="boton secundario" onclick={() => usar(v.id)} disabled={usuario.ajustes.version === v.id}>
      {usuario.ajustes.version === v.id ? 'Leyendo' : 'Leer'}
    </button>
  </div>
{/each}

<h3>Clave de la API de Tyndale (NTV y NLT)</h3>
<p class="ayuda">La NTV y la NLT llegan gratis desde la API oficial de Tyndale. Sin clave se usa la de prueba (hasta 500 consultas al día por conexión). Con tu clave gratuita el límite sube a 5000. Regístrala en <a href="https://api.nlt.to/" target="_blank" rel="noopener">api.nlt.to</a> y pégala aquí.</p>
<form class="fila-botones" onsubmit={guardarClave}>
  <input class="campo" style="flex: 1 1 240px" type="text" bind:value={clave} placeholder="Pega tu clave (vacío = clave de prueba)" aria-label="Clave de la API" spellcheck="false" autocomplete="off" />
  <button class="boton" type="submit">Guardar</button>
</form>
<p class="nota-pie">Por la licencia de Tyndale, el texto de la NTV y la NLT no se guarda en tu equipo: se pide al leer y vive en memoria mientras la app está abierta.</p>

<h3>Próximamente</h3>
<p class="ayuda">RVR1960, NVI, LBLA y otras versiones con licencia se pueden añadir mediante la YouVersion Platform o API.Bible, ambas gratuitas para uso personal. También el interlineal hebreo y griego de STEPBible.</p>
