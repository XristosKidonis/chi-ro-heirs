<script>
  import { usuario, ajustar } from '../../lib/usuario.svelte.js';
  import { lista } from '../../lib/biblia.js';
  import { ui } from '../../lib/ui.svelte.js';
  import { t } from '../../lib/i18n.svelte.js';
  const a = $derived(usuario.ajustes);
</script>

<h3>{t('aj.lectura')}</h3>
<div class="ajuste">
  <label for="aj-idioma">{t('aj.idioma')} <small>Interface language</small></label>
  <select id="aj-idioma" value={a.idioma} onchange={(e) => ajustar('idioma', e.currentTarget.value)}>
    <option value="es">Español</option>
    <option value="en">English</option>
  </select>
</div>
<div class="ajuste">
  <label for="aj-inicio">{t('aj.inicio')} <small>{t('aj.inicioAyuda')}</small></label>
  <input id="aj-inicio" type="checkbox" checked={a.mostrarInicio} onchange={(e) => ajustar('mostrarInicio', e.currentTarget.checked)} />
</div>
<div class="ajuste">
  <label for="aj-grabados">{t('aj.grabados')} <small>{t('aj.grabadosAyuda')}</small></label>
  <input id="aj-grabados" type="checkbox" checked={a.grabados !== false} onchange={(e) => ajustar('grabados', e.currentTarget.checked)} />
</div>
<div class="ajuste">
  <label for="aj-tema">{t('aj.tema')}</label>
  <select id="aj-tema" value={a.tema} onchange={(e) => ajustar('tema', e.currentTarget.value)}>
    <option value="cuero">{t('aj.cuero')}</option>
    <option value="papel">{t('aj.papel')}</option>
    <option value="sistema">{t('aj.sistema')}</option>
  </select>
</div>
<div class="ajuste">
  <label for="aj-tam">{t('aj.tamano')} <small>{a.tamano} px</small></label>
  <input id="aj-tam" type="range" min="15" max="32" step="1" value={a.tamano} oninput={(e) => ajustar('tamano', Number(e.currentTarget.value))} />
</div>
<div class="ajuste">
  <label for="aj-int">{t('aj.interlineado')} <small>{a.interlineado}</small></label>
  <input id="aj-int" type="range" min="1.35" max="2.2" step="0.05" value={a.interlineado} oninput={(e) => ajustar('interlineado', Number(e.currentTarget.value))} />
</div>
<div class="ajuste">
  <label for="aj-fuente">{t('aj.fuente')} <small>{t('aj.fuenteAyuda')}</small></label>
  <select id="aj-fuente" value={a.fuente} onchange={(e) => ajustar('fuente', e.currentTarget.value)}>
    <option value="literata">{t('aj.literata')}</option>
    <option value="atkinson">{t('aj.atkinson')}</option>
  </select>
</div>
<div class="ajuste">
  <label for="aj-lector">{t('aj.modoLector')} <small>{t('aj.modoLectorAyuda')}</small></label>
  <input id="aj-lector" type="checkbox" checked={a.modoLector} onchange={(e) => ajustar('modoLector', e.currentTarget.checked)} />
</div>
<div class="ajuste">
  <label for="aj-parrafo">{t('aj.parrafo')} <small>{t('aj.parrafoAyuda')}</small></label>
  <input id="aj-parrafo" type="checkbox" checked={a.parrafo} onchange={(e) => ajustar('parrafo', e.currentTarget.checked)} />
</div>
<div class="ajuste">
  <label for="aj-par">{t('aj.paralela')}</label>
  <select id="aj-par" value={a.paralela} onchange={(e) => ajustar('paralela', e.currentTarget.value)}>
    <option value="">{t('aj.ninguna')}</option>
    {#each lista().filter((v) => v.id !== a.version) as v}<option value={v.id}>{v.id} · {v.nombre}</option>{/each}
  </select>
</div>
<h3>{t('aj.otros')}</h3>
<div class="fila-botones">
  <button class="boton secundario" onclick={() => (ui.dialogo = 'versiones')}>{t('aj.abrirVersiones')}</button>
  <button class="boton secundario" onclick={() => (ui.dialogo = 'respaldo')}>{t('aj.abrirRespaldo')}</button>
</div>
<h3>{t('aj.voz')}</h3>
<div class="ajuste">
  <label for="aj-voz">{t('aj.velocidad')} <small>{a.velocidadVoz}×</small></label>
  <input id="aj-voz" type="range" min="0.6" max="1.6" step="0.1" value={a.velocidadVoz} oninput={(e) => ajustar('velocidadVoz', Number(e.currentTarget.value))} />
</div>
<h3>{t('aj.atajos')}</h3>
<p class="ayuda">
  <span class="tecla">Ctrl K</span> · <span class="tecla">/</span>
  {@html t('aj.atajosTexto', {
    flechas: '<span class="tecla">←</span> <span class="tecla">→</span>',
    esc: '<span class="tecla">Esc</span>',
    mayus: `<span class="tecla">${usuario.ajustes.idioma === 'en' ? 'Shift' : 'Mayús'}</span>`,
  })}
</p>
