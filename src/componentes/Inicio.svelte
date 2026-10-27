<script>
  // Inicio: la pausa entre abrir la app y abrir un libro. La marca CHI—RO grande y las cinco entradas.
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
  // quien todavía no ha leído nada (ni se ha movido de Génesis 1) recibe una sugerencia: empezar por Juan
  const primeraVez = $derived(!Object.keys(usuario.leidos).length && pos.libro === 1 && pos.cap === 1);
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

  // las cinco puertas de la app, en el mismo orden que la cabecera
  const ENTRADAS = [
    ['ini.continuar', () => irA(pos.libro, pos.cap)],
    ['ini.biblioteca', () => abrirVista('biblioteca')],
    ['ini.archivo', () => abrirVista('archivo')],
    ['ini.laminas', () => abrirVista('laminas')],
    ['ini.historia', () => abrirVista('historia')],
  ];

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
      {#each ENTRADAS as [clave, ir], i (clave)}
        <button class="inicio-entrada" onclick={ir}>
          <span class="inicio-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span>{t(clave)}</span><span class="inicio-flecha" aria-hidden="true">↗</span>
        </button>
      {/each}
    </nav>
    {#if primeraVez}
      <p class="inicio-ultima inicio-empezar">{t('ini.empezar')} <button onclick={() => irA(43, 1)}>{t('ini.juan')} ↗</button><small>{t('ini.juanPor')}</small></p>
    {:else}
      <p class="inicio-ultima">{t('ini.ultima')} <button onclick={() => irA(pos.libro, pos.cap)}>{nombreRef(pos.libro, pos.cap)}</button></p>
    {/if}
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
