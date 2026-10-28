<script>
  // Barra del lector: todo lo que es del capítulo y de cómo se lee. Lo que se hace con un versículo
  // (marcar, guardar, escuchar desde ahí…) está en la barra de selección de abajo (Acciones.svelte).
  // De izquierda a derecha: volver, dónde estás, versión (y con cuál comparar), «Aa» (tamaño, tema, letra,
  // margen, Calma), escuchar el capítulo, ambiente, cinta y Estudio. Todo queda guardado en usuario.db.
  import Icono from './Icono.svelte';
  import { ui, abrirVista, avisar } from '../lib/ui.svelte.js';
  import { usuario, ajustar, alternarCinta } from '../lib/usuario.svelte.js';
  import { lista } from '../lib/biblia.js';
  import { LIBROS, nombreLibro } from '../lib/libros.js';
  import { t } from '../lib/i18n.svelte.js';
  import { voz, leer, pausarLectura, puedeSeguir } from '../lib/voz.svelte.js';
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

  // el botón de escuchar dice si va a pausar, seguir donde quedó o empezar
  const ayudaVoz = $derived(voz.activa ? t('barra.detener') : puedeSeguir() ? t('barra.seguir', { v: voz.pausa.v }) : t('barra.leer'));
  const textoVoz = $derived(voz.activa ? t('voz.pausar') : puedeSeguir() ? t('voz.seguir') : t('voz.escuchar'));

  const tamano = (d) => ajustar('tamano', Math.max(15, Math.min(32, usuario.ajustes.tamano + d)));
  const alternarMenu = (m) => (ui.menuBarra = ui.menuBarra === m ? null : m);

  // un menú abierto se cierra al tocar fuera de él (Esc lo cierra desde App.svelte)
  let barra;
  $effect(() => {
    if (!ui.menuBarra) return;
    const fuera = (e) => { if (!barra?.contains(e.target)) ui.menuBarra = null; };
    window.addEventListener('pointerdown', fuera);
    return () => window.removeEventListener('pointerdown', fuera);
  });
</script>

<div class="lector-barra" bind:this={barra}>
  <button class="lb-volver" onclick={() => abrirVista('biblioteca')}><span aria-hidden="true">←</span> <span class="lb-texto">{t('lec.volver')}</span></button>

  <div class="lb-lugar">
    <span class="lb-etiqueta">{t('lec.leyendo')}</span>
    <button class="lb-capitulo" onclick={() => (ui.navAbierta = !ui.navAbierta)} aria-expanded={ui.navAbierta} aria-label="{t('lec.elegir')}: {nombreLibro(libro)} {pos.cap}">
      {nombreLibro(libro).toUpperCase()} <span>{String(pos.cap).padStart(2, '0')}</span> ▾
    </button>
  </div>

  <div class="lb-controles">
    <button class="lb-control lb-versiones" aria-expanded={ui.menuBarra === 'version'} aria-haspopup="true" onclick={() => alternarMenu('version')} title={t('barra.versiones')}>
      {usuario.ajustes.version}{#if usuario.ajustes.paralela}<span class="lb-con"> ∥ {usuario.ajustes.paralela}</span>{/if} <span aria-hidden="true">▾</span>
    </button>
    <button class="lb-control lb-aa" aria-expanded={ui.menuBarra === 'aa'} aria-haspopup="true" onclick={() => alternarMenu('aa')} title={t('barra.aa')}>
      <span class="lb-aa-letras">Aa</span> <span aria-hidden="true">▾</span>
    </button>
    <button class="lb-control lb-voz" class:activo={voz.activa} onclick={() => (voz.activa ? pausarLectura() : leer())} aria-label={ayudaVoz} title={ayudaVoz}>
      <Icono n={voz.activa ? 'pausa' : 'voz'} /><span class="lb-voz-texto">{textoVoz}</span>
    </button>
    <button class="lb-control lb-icono lb-ambiente" class:activo={amb.sonando} onclick={() => (ui.dialogo = 'ambiente')}
      aria-label={t('amb.abrir')} title={t('amb.abrir')}><Icono n="musica" /></button>
    <button class="lb-control lb-icono marcador" class:puesto={cintaPuesta} aria-pressed={cintaPuesta}
      onclick={() => avisar(alternarCinta(pos.libro, pos.cap) ? t('lector.cintaPuesta') : t('lector.cintaQuitada'))}
      title={cintaPuesta ? t('lector.cintaQuitar') : t('lector.cintaPoner')} aria-label={cintaPuesta ? t('lector.cintaQuitar') : t('lector.cintaPoner')}><Icono n="guardar" /></button>
    <!-- Estudio se queda aquí: Progreso, Memoria, Notas y Buscar no dependen de tocar un versículo -->
    <button class="lb-control lb-estudio" aria-pressed={ui.estudioAbierto} onclick={() => (ui.estudioAbierto = !ui.estudioAbierto)}>
      <!-- en el celular dice siempre «Estudio» (subrayado si está abierto): la hoja tiene su propia ✕ -->
      {#if ui.estudioAbierto}<span class="lb-largo">{t('lec.cerrarEstudio')}</span><span class="lb-corto">{t('lec.estudio')}</span>{:else}{t('lec.estudio')}{/if} <span aria-hidden="true">↗</span>
    </button>
  </div>

  <!-- Los menús cuelgan de la barra entera (no de los controles, que se deslizan de costado y los recortarían) -->
  {#if ui.menuBarra === 'version'}
    <div class="lb-menu" role="group" aria-label={t('barra.versiones')}>
      <label class="lb-menu-fila lb-version">
        <span>{t('barra.version')}</span>
        <select value={usuario.ajustes.version} onchange={(e) => ajustar('version', e.currentTarget.value)}>
          {#each grupos as [nombre, vs]}
            <optgroup label={nombre}>
              {#each vs as v}<option value={v.id}>{v.id}{v.enLinea ? ` ${t('barra.enLinea')}` : ''}</option>{/each}
            </optgroup>
          {/each}
        </select>
      </label>
      <label class="lb-menu-fila lb-version lb-paralela">
        <span>{t('barra.comparar')}</span>
        <select value={usuario.ajustes.paralela} onchange={(e) => ajustar('paralela', e.currentTarget.value)}>
          <option value="">{t('barra.sinComparar')}</option>
          {#each versiones.filter((v) => v.id !== usuario.ajustes.version) as v}<option value={v.id}>{v.id}</option>{/each}
        </select>
      </label>
    </div>
  {:else if ui.menuBarra === 'aa'}
    <div class="lb-menu" role="group" aria-label={t('barra.aa')}>
      <div class="lb-menu-fila">
        <span>{t('aa.tamano')}</span>
        <span class="lb-seg">
          <button class="lb-tam" onclick={() => tamano(-1)} aria-label={t('lec.menos')} title={t('lec.menos')}>A−</button>
          <button class="lb-tam" onclick={() => tamano(1)} aria-label={t('lec.mas')} title={t('lec.mas')}>A+</button>
        </span>
      </div>
      <div class="lb-menu-fila" role="group" aria-label={t('lec.tema')}>
        <span>{t('aa.tema')}</span>
        <span class="lb-seg">
          <button class="lb-tema" aria-pressed={!oscuro} onclick={() => ajustar('tema', 'papel')}>{t('aa.claro')}</button>
          <button class="lb-tema" aria-pressed={oscuro} onclick={() => ajustar('tema', 'cuero')}>{t('aa.oscuro')}</button>
        </span>
      </div>
      <div class="lb-menu-fila" role="group" aria-label={t('aj.fuente')}>
        <span>{t('aa.letra')}</span>
        <span class="lb-seg">
          <button aria-pressed={usuario.ajustes.fuente !== 'atkinson'} onclick={() => ajustar('fuente', 'literata')}>Literata</button>
          <button aria-pressed={usuario.ajustes.fuente === 'atkinson'} onclick={() => ajustar('fuente', 'atkinson')}>Atkinson</button>
        </span>
      </div>
      <button class="lb-menu-fila lb-margen" aria-pressed={!!usuario.ajustes.margen} onclick={() => ajustar('margen', !usuario.ajustes.margen)} title={t('margen.ayuda')}>
        <span>{t('aa.margen')}</span><b>{usuario.ajustes.margen ? t('aa.si') : t('aa.no')}</b>
      </button>
      <button class="lb-menu-fila lb-calma" onclick={() => { ui.menuBarra = null; ajustar('calma', true); }} title={t('lec.calmaAyuda')}>
        <span>{t('aa.calma')}</span><b aria-hidden="true">⤢</b>
      </button>
    </div>
  {/if}
</div>
