<script>
  // Barra mínima del lector: volver a la biblioteca, dónde estás (abre libros y capítulos),
  // versión y paralela, y los controles de lectura. Todo queda guardado en usuario.db.
  import Icono from './Icono.svelte';
  import { ui, abrirVista, avisar } from '../lib/ui.svelte.js';
  import { usuario, ajustar, alternarCinta } from '../lib/usuario.svelte.js';
  import { lista } from '../lib/biblia.js';
  import { LIBROS, nombreLibro } from '../lib/libros.js';
  import { t } from '../lib/i18n.svelte.js';
  import { voz, leer, detener } from '../lib/voz.svelte.js';
  import { amb } from '../lib/ambiente.svelte.js';

  const pos = $derived(usuario.ajustes.pos);
  const libro = $derived(LIBROS[pos.libro - 1]);
  const versiones = $derived(lista());
  const grupos = $derived([
    [t('grupo.es'), versiones.filter((v) => v.idioma === 'es')],
    [t('grupo.en'), versiones.filter((v) => v.idioma === 'en')],
  ]);
  const oscuro = $derived(usuario.ajustes.tema === 'cuero');
  const cintaPuesta = $derived(usuario.cintas.some((c) => c.libro === pos.libro && c.cap === pos.cap));

  const tamano = (d) => ajustar('tamano', Math.max(15, Math.min(32, usuario.ajustes.tamano + d)));
</script>

<div class="lector-barra">
  <button class="lb-volver" onclick={() => abrirVista('biblioteca')}><span aria-hidden="true">←</span> <span class="lb-texto">{t('lec.volver')}</span></button>

  <div class="lb-lugar">
    <span class="lb-etiqueta">{t('lec.leyendo')}</span>
    <button class="lb-capitulo" onclick={() => (ui.navAbierta = !ui.navAbierta)} aria-expanded={ui.navAbierta} aria-label="{t('lec.elegir')}: {nombreLibro(libro)} {pos.cap}">
      {nombreLibro(libro).toUpperCase()} <span>{String(pos.cap).padStart(2, '0')}</span> ▾
    </button>
  </div>

  <div class="lb-controles">
    <label class="lb-version" title={t('barra.version')}>
      <span class="vh">{t('barra.version')}</span>
      <select value={usuario.ajustes.version} onchange={(e) => ajustar('version', e.currentTarget.value)}>
        {#each grupos as [nombre, vs]}
          <optgroup label={nombre}>
            {#each vs as v}<option value={v.id}>{v.id}{v.enLinea ? ` ${t('barra.enLinea')}` : ''}</option>{/each}
          </optgroup>
        {/each}
      </select>
    </label>
    <label class="lb-version lb-paralela" title={t('barra.paralela')}>
      <span class="vh">{t('barra.paralela')}</span>
      <select value={usuario.ajustes.paralela} onchange={(e) => ajustar('paralela', e.currentTarget.value)}>
        <option value="">∥ —</option>
        {#each versiones.filter((v) => v.id !== usuario.ajustes.version) as v}<option value={v.id}>∥ {v.id}</option>{/each}
      </select>
    </label>
    <button class="lb-control lb-tam" onclick={() => tamano(-1)} aria-label={t('lec.menos')} title={t('lec.menos')}>A−</button>
    <button class="lb-control lb-tam" onclick={() => tamano(1)} aria-label={t('lec.mas')} title={t('lec.mas')}>A+</button>
    <button class="lb-control lb-icono lb-tema" onclick={() => ajustar('tema', oscuro ? 'papel' : 'cuero')} aria-pressed={oscuro} aria-label={t('lec.tema')} title={t('lec.tema')}><Icono n="tema" /></button>
    <button class="lb-control lb-icono" class:activo={voz.activa} onclick={() => (voz.activa ? detener() : leer())}
      aria-label={voz.activa ? t('barra.detener') : t('barra.leer')} title={voz.activa ? t('barra.detener') : t('barra.leer')}><Icono n={voz.activa ? 'pausa' : 'voz'} /></button>
    <button class="lb-control lb-icono lb-ambiente" class:activo={amb.sonando} onclick={() => (ui.dialogo = 'ambiente')}
      aria-label={t('amb.abrir')} title={t('amb.abrir')}><Icono n="musica" /></button>
    <button class="lb-control lb-icono marcador" class:puesto={cintaPuesta} aria-pressed={cintaPuesta}
      onclick={() => avisar(alternarCinta(pos.libro, pos.cap) ? t('lector.cintaPuesta') : t('lector.cintaQuitada'))}
      title={cintaPuesta ? t('lector.cintaQuitar') : t('lector.cintaPoner')} aria-label={cintaPuesta ? t('lector.cintaQuitar') : t('lector.cintaPoner')}><Icono n="guardar" /></button>
    <button class="lb-control lb-estudio" aria-pressed={ui.estudioAbierto} onclick={() => (ui.estudioAbierto = !ui.estudioAbierto)}>
      <!-- en el celular dice siempre «Estudio» (subrayado si está abierto): la hoja tiene su propia ✕ -->
      {#if ui.estudioAbierto}<span class="lb-largo">{t('lec.cerrarEstudio')}</span><span class="lb-corto">{t('lec.estudio')}</span>{:else}{t('lec.estudio')}{/if} <span aria-hidden="true">↗</span>
    </button>
    <button class="lb-control lb-margen" aria-pressed={!!usuario.ajustes.margen} onclick={() => ajustar('margen', !usuario.ajustes.margen)} title={t('margen.ayuda')}>{t('margen.boton')}</button>
    <button class="lb-control lb-calma" onclick={() => ajustar('calma', true)} title={t('lec.calmaAyuda')}>{t('lec.calma')} <span aria-hidden="true">⤢</span></button>
  </div>
</div>
