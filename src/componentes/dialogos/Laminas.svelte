<script>
  // Estudio de láminas: el versículo elegido como fondo de pantalla o diseño para compartir.
  // Viene de la selección del lector o de la galería del menú de inicio (ui.lamina).
  import { ui, etiquetaSeleccion, avisar } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { ESTILOS, FORMATOS, VARIANTES, dibujarLamina } from '../../lib/laminas.js';
  import { guardarArchivo } from '../../lib/archivos.js';
  import { t } from '../../lib/i18n.svelte.js';

  const origen = $derived.by(() => {
    if (ui.lamina) return ui.lamina;
    const s = new Set(ui.seleccion);
    const p = usuario.ajustes.pos;
    return {
      texto: ui.cap.versos.filter((x) => s.has(x.v)).map((x) => x.texto).join(' '),
      referencia: etiquetaSeleccion(),
      clave: ui.palabra?.texto || '',
      version: usuario.ajustes.version,
      libro: p.libro,
    };
  });

  let estilo = $state(ui.lamina?.estilo || 'portadilla');
  let formato = $state(ui.lamina?.formato || 'post');
  let tono = $state(ui.lamina?.tono || 'cuero');
  let frase = $state('');
  let lienzo = $state();
  let dibujando = $state(false);
  let pedido = 0;

  $effect(() => { frase = origen.texto; });

  async function dibujar() {
    if (!lienzo || !frase.trim()) return;
    const n = ++pedido;
    dibujando = true;
    const o = $state.snapshot(origen);
    await dibujarLamina(lienzo, {
      ...o, estilo, formato, tono: tonoDe(estilo), texto: frase, rotulo: t('lam.rotulo'),
      imagen: usuario.portadas[o.libro] || undefined,
    });
    if (n === pedido) dibujando = false;
  }

  const tonoDe = (e) => (VARIANTES[e]?.includes(tono) ? tono : VARIANTES[e]?.[0]);

  let espera;
  $effect(() => {
    estilo; formato; tono; frase; lienzo;
    clearTimeout(espera);
    espera = setTimeout(dibujar, 160);
    return () => clearTimeout(espera);
  });

  async function guardar() {
    const blob = await new Promise((r) => lienzo.toBlob(r, 'image/png'));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const nombre = `${origen.referencia.replace(/[^\p{L}\d]+/gu, '-')}-${estilo}-${formato}.png`;
    try {
      if (await guardarArchivo(nombre, bytes, { name: 'Imagen', extensions: ['png'] })) avisar(t('lam.guardada'));
    } catch (e) {
      avisar(t('app.noGuardar', { e: e.message || e }), true);
    }
  }
</script>

{#if !origen.texto}
  <p class="ayuda">{t('pos.elige')}</p>
{:else}
  <div class="estudio-lamina">
    <div class="lamina-vista" class:apaisada={formato === 'escritorio'} class:cargando={dibujando}>
      <canvas bind:this={lienzo} aria-label={t('pos.alt', { ref: origen.referencia })}></canvas>
    </div>
    <div class="lamina-controles">
      <span class="etiqueta-ui">{t('lam.acabado')}</span>
      <div class="chips">
        {#each ESTILOS as e}<button aria-pressed={estilo === e} onclick={() => (estilo = e)}>{t(`lam.e.${e}`)}</button>{/each}
      </div>
      {#if VARIANTES[estilo]}
        <div class="chips">
          {#each VARIANTES[estilo] as k}<button aria-pressed={tonoDe(estilo) === k} onclick={() => (tono = k)}>{t(`lam.t.${k}`)}</button>{/each}
        </div>
      {/if}
      <span class="etiqueta-ui">{t('lam.formato')}</span>
      <div class="chips">
        {#each Object.keys(FORMATOS) as f}<button aria-pressed={formato === f} onclick={() => (formato = f)}>{t(`lam.f.${f}`)}</button>{/each}
      </div>
      <label class="etiqueta-ui" for="lam-frase">{t('lam.frase')}</label>
      <textarea id="lam-frase" class="campo" rows="4" bind:value={frase}></textarea>
      <p class="nota-pie">{t('lam.fraseAyuda')}</p>
      <button class="boton" onclick={guardar}>{t('lam.guardar')}</button>
    </div>
  </div>
{/if}
