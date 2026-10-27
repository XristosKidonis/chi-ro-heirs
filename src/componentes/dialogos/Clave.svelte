<script>
  // Mi clave de colores: escribe qué significa cada color. Se usa al subrayar, en el margen y en Mi archivo.
  import { COLORES, significado, definir, sugerida, usarSugerida, imagenClave } from '../../lib/clave.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { avisar } from '../../lib/ui.svelte.js';
  import { guardarArchivo } from '../../lib/archivos.js';
  import { t } from '../../lib/i18n.svelte.js';

  const cuantos = $derived(Object.values(usuario.subrayados).reduce((m, c) => ((m[c] = (m[c] || 0) + 1), m), {}));

  async function compartir() {
    try {
      if (await guardarArchivo(t('clave.archivo'), await imagenClave(), { name: 'Imagen', extensions: ['png'] })) avisar(t('lam.guardada'));
    } catch (e) {
      avisar(t('app.noGuardar', { e: e.message || e }), true);
    }
  }
</script>

<p class="ayuda">{t('clave.intro')}</p>
<ol class="clave-lista">
  {#each COLORES as color, i (color)}
    <li class="clave-fila">
      <span class="clave-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
      <span class="clave-muestra" data-m={color} aria-hidden="true"></span>
      <label class="vh" for="clave-{color}">{t(`color.${color}`)}</label>
      <input id="clave-{color}" class="campo clave-campo" type="text" maxlength="40" autocomplete="off"
        value={significado(color)} placeholder={sugerida()[color]}
        onchange={(e) => definir(color, e.currentTarget.value.trim())} />
      <span class="clave-cuenta" title={t('clave.cuantos')}>{cuantos[color] || 0}</span>
    </li>
  {/each}
</ol>
<div class="fila-botones">
  <button class="boton" onclick={compartir}>{t('clave.compartir')}</button>
  <button class="boton secundario" onclick={usarSugerida}>{t('clave.sugerida')}</button>
</div>
<p class="nota-pie">{t('clave.pie')}</p>
