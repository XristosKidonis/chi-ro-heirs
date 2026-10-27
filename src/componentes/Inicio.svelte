<script>
  // Inicio: la pausa entre abrir la app y abrir un libro. La marca CHI—RO grande y tres entradas.
  // Sin fotos, sin cifras, sin rachas. Un único detalle cultural: una lámina mínima en el margen.
  import { onMount } from 'svelte';
  import Marca from './Marca.svelte';
  import { ui, irA, abrirVista } from '../lib/ui.svelte.js';
  import { usuario } from '../lib/usuario.svelte.js';
  import { nombreRef } from '../lib/libros.js';
  import { dibujarLamina } from '../lib/laminas.js';
  import { dia, cargarVersoDelDia, laminaDelDia } from '../lib/versoDelDia.svelte.js';
  import { t } from '../lib/i18n.svelte.js';

  const pos = $derived(usuario.ajustes.pos);
  let miniatura = $state('');

  onMount(() => { cargarVersoDelDia(); });

  // la lámina del día, en Aura y en miniatura; en gris hasta que se pasa el cursor
  $effect(() => {
    if (!dia.texto) return;
    const base = laminaDelDia();
    let vivo = true;
    const c = document.createElement('canvas');
    dibujarLamina(c, { ...base, estilo: 'aura', formato: 'post', escala: 0.16 }).then(() => {
      if (vivo) miniatura = c.toDataURL('image/jpeg', 0.85);
    });
    return () => { vivo = false; };
  });

  function verLaminas() {
    abrirVista('laminas');
    ui.coleccion = 'tipografia';
  }
</script>

<section class="inicio" aria-label={t('vista.inicio')}>
  <div class="inicio-centro">
    <div class="inicio-edicion" aria-hidden="true">{t('ini.edicion')}</div>
    <Marca grande />
    <nav class="inicio-entradas" aria-label={t('ini.entrar')}>
      <button class="inicio-entrada" onclick={() => irA(pos.libro, pos.cap)}>
        <span class="inicio-num" aria-hidden="true">01</span><span>{t('ini.continuar')}</span><span class="inicio-flecha" aria-hidden="true">↗</span>
      </button>
      <button class="inicio-entrada" onclick={() => abrirVista('biblioteca')}>
        <span class="inicio-num" aria-hidden="true">02</span><span>{t('ini.biblioteca')}</span><span class="inicio-flecha" aria-hidden="true">↗</span>
      </button>
      <button class="inicio-entrada" onclick={() => abrirVista('archivo')}>
        <span class="inicio-num" aria-hidden="true">03</span><span>{t('ini.archivo')}</span><span class="inicio-flecha" aria-hidden="true">↗</span>
      </button>
    </nav>
    <p class="inicio-ultima">{t('ini.ultima')} <button onclick={() => irA(pos.libro, pos.cap)}>{nombreRef(pos.libro, pos.cap)}</button></p>
  </div>

  {#if miniatura}
    <div class="inicio-cultura">
      <button class="inicio-cultura-lamina" onclick={verLaminas} aria-label={t('ini.verLamina')}>
        <img src={miniatura} alt="" />
      </button>
      <div aria-hidden="true"><span>{t('ini.estudioVisual')}</span><small>{laminaDelDia().referencia}</small></div>
    </div>
  {/if}

  <div class="inicio-firma" aria-hidden="true"><span>{t('ini.firma')}</span><span>{t('ini.firmaLema')}</span></div>
</section>
