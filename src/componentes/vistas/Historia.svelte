<script>
  // Historia: un expediente abierto sobre Jesús y Juan el Bautista. Lo que dicen los historiadores, las piedras
  // y los manuscritos, con lo que prueban y lo que no. Se juega (¿Firme o viral?) y se recorre en el tiempo.
  import { tick } from 'svelte';
  import Prueba from '../historia/Prueba.svelte';
  import Sello from '../historia/Sello.svelte';
  import Quiz from '../historia/Quiz.svelte';
  import LineaTiempo from '../historia/LineaTiempo.svelte';
  import { GRADOS, GRUPOS, pruebasDe } from '../../lib/evidencias.js';
  import { ui } from '../../lib/ui.svelte.js';
  import { t } from '../../lib/i18n.svelte.js';

  const PESTANAS = ['jesus', 'juan', 'quiz', 'tiempo'];
  const figura = $derived(ui.historia.pestana === 'juan' ? 'juan' : 'jesus');

  async function verPrueba(p) {
    ui.historia.pestana = p.figura;
    ui.historia.abierta = p.id;
    await tick();
    document.getElementById(`prueba-${p.id}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  const alternar = (id) => (ui.historia.abierta = ui.historia.abierta === id ? null : id);
</script>

<section class="pagina-vista historia" aria-labelledby="his-titulo">
  <div class="titular">
    <div><span class="sobretitulo">{t('his.over')}</span><h1 id="his-titulo">{t('vista.historia')}</h1></div>
    <p>{t('his.sub')}</p>
  </div>

  <div class="his-escala" aria-label={t('his.escala')}>
    {#each GRADOS as g (g)}
      <div class="his-escala-item"><Sello grado={g} /><span>{t(`his.grado.${g}.d`)}</span></div>
    {/each}
  </div>

  <div class="herramientas">
    <div class="filtros-vista" role="tablist" aria-label={t('vista.historia')}>
      {#each PESTANAS as id (id)}
        <button class="filtro" role="tab" aria-selected={ui.historia.pestana === id} aria-pressed={ui.historia.pestana === id}
          onclick={() => { ui.historia.pestana = id; ui.historia.abierta = null; }}>
          {t(`his.tab.${id}`)}{#if id === 'jesus' || id === 'juan'} <small>{String(pruebasDe(id).length).padStart(2, '0')}</small>{/if}
        </button>
      {/each}
    </div>
  </div>

  {#if ui.historia.pestana === 'jesus' || ui.historia.pestana === 'juan'}
    <p class="his-intro his-intro-figura">{t(`his.intro.${figura}`)}</p>
    {#each GRUPOS[figura] as g (g)}
      {@const lista = pruebasDe(figura).filter((p) => p.grupo === g)}
      {#if lista.length}
        <h2 class="his-grupo"><span>{t(`his.g.${g}`)}</span><small>{t(`his.g.${g}.d`)}</small></h2>
        <ol class="his-lista">
          {#each lista as p (p.id)}
            <Prueba {p} abierta={ui.historia.abierta === p.id} alternar={() => alternar(p.id)} />
          {/each}
        </ol>
      {/if}
    {/each}
    <p class="nota-pie his-fuentes">{t('his.creditos')}</p>
  {:else if ui.historia.pestana === 'quiz'}
    <Quiz {verPrueba} />
  {:else}
    <LineaTiempo {verPrueba} />
  {/if}
</section>
