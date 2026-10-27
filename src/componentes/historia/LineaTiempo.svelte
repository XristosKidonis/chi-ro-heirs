<script>
  // Línea del tiempo: cuántos años después de los hechos se escribió cada fuente.
  // Arriba, un panorama horizontal (pantallas anchas); abajo, la lista vertical que se lee en cualquier pantalla,
  // y una comparación honesta con Alejandro Magno.
  import Sello from './Sello.svelte';
  import { imagenesDe } from '../../lib/imagenesHistoria.js';
  import { PRUEBAS, numero, distancia } from '../../lib/evidencias.js';
  import { t, idioma } from '../../lib/i18n.svelte.js';

  let { verPrueba } = $props();
  const L = (x) => x?.[idioma()] ?? '';

  // fuentes escritas (no los lugares): lo que la línea compara es cuándo se puso por escrito
  const ESCRITAS = ['credo', 'galatas', 'mara', 'josefo20', 'plinio', 'tacito', 'suetonio', 'p52', 'luciano', 'megido', 'origenes'];
  const lista = $derived([
    { anio: 30, hecho: true, texto: t('his.tl.hechos') },
    ...PRUEBAS.filter((p) => ESCRITAS.includes(p.id) || p.id === 'josefoJuan').map((p) => ({ anio: p.anio, p })),
    { anio: 70, hecho: true, texto: t('his.tl.templo') },
    { anio: 80, banda: true, texto: t('his.tl.evangelios') },
  ].sort((a, b) => a.anio - b.anio));

  // panorama: años 0 a 260 en un ancho de 1000
  const X0 = 50, X1 = 960, A1 = 260;
  const x = (a) => X0 + (a / A1) * (X1 - X0);
  const PUNTOS = [
    ['credo', 54, 'a1'], ['mara', 75, 'b1'], ['josefo20', 93, 'b2'], ['plinio', 112, 'a2'], ['tacito', 116, 'a1'],
    ['suetonio', 121, 'b1'], ['luciano', 165, 'a2'], ['megido', 230, 'b1'], ['origenes', 248, 'a1'],
  ];
  const Y = { a1: 62, a2: 96, b1: 214, b2: 246 };
  const forma = (id) => {
    const p = PRUEBAS.find((q) => q.id === id);
    return p.grupo === 'testigos' ? 'testigo' : p.grupo === 'cristianos' ? 'cristiano' : 'objeto';
  };
  const etiqueta = (id) => L(PRUEBAS.find((q) => q.id === id).autor).split(',')[0];
</script>

<div class="tl">
  <p class="his-intro">{t('his.tl.intro')}</p>

  <svg class="tl-panorama" viewBox="0 0 1000 290" role="img" aria-label={t('his.tl.aria')}>
    <rect x={x(28)} y="34" width={x(33) - x(28)} height="232" class="tl-hechos" />
    <text x={x(30.5)} y="24" class="tl-rotulo" text-anchor="middle">{t('his.tl.hechosCorto')}</text>
    <line x1={x(65)} x2={x(100)} y1="128" y2="128" class="tl-banda" />
    <text x={x(82)} y="120" class="tl-rotulo" text-anchor="middle">{t('his.tl.evangeliosCorto')}</text>
    <line x1={x(125)} x2={x(175)} y1="172" y2="172" class="tl-banda fina" />
    <text x={x(150)} y="189" class="tl-rotulo" text-anchor="middle">P52</text>
    <line x1={X0} x2={X1} y1="150" y2="150" class="tl-eje" />
    {#each [0, 50, 100, 150, 200, 250] as a (a)}
      <line x1={x(a)} x2={x(a)} y1="145" y2="155" class="tl-eje" />
      <text x={x(a)} y={a === 0 ? 172 : 168} class="tl-anio" text-anchor="middle">{a === 0 ? t('his.tl.cero') : a}</text>
    {/each}
    {#each PUNTOS as [id, anio, carril] (id)}
      {@const y = Y[carril]}
      <line x1={x(anio)} x2={x(anio)} y1={y < 150 ? y + 6 : 150} y2={y < 150 ? 150 : y - 14} class="tl-guia" />
      {#if forma(id) === 'objeto'}<rect x={x(anio) - 4} y="146" width="8" height="8" class="tl-punto testigo" />
      {:else}<circle cx={x(anio)} cy="150" r="4.5" class="tl-punto {forma(id)}" />{/if}
      <text x={x(anio)} y={y} class="tl-etiqueta" text-anchor="middle">{etiqueta(id)}</text>
      <text x={x(anio)} y={y + 13} class="tl-anio" text-anchor="middle">{anio}</text>
    {/each}
    <text x={X0} y="284" class="tl-anio">← {t('his.tl.isaias')}</text>
    <text x={X1} y="284" class="tl-anio" text-anchor="end">{t('his.tl.talmud')} →</text>
  </svg>
  <p class="tl-leyenda"><span class="tl-l testigo"></span>{t('his.tl.lTestigo')} <span class="tl-l cristiano"></span>{t('his.tl.lCristiano')} <span class="tl-l objeto"></span>{t('his.tl.lObjeto')}</p>

  <ol class="tl-lista">
    {#each lista as e (e.p?.id ?? e.texto)}
      <li class:hecho={e.hecho} class:banda={e.banda}>
        <span class="tl-ano">{e.banda ? '65-100' : e.anio}</span>
        {#if e.p && imagenesDe(e.p.id).length}<img class="tl-mini" src={imagenesDe(e.p.id)[0].src} alt="" loading="lazy" />{:else}<span class="tl-mini vacia"></span>{/if}
        {#if e.p}
          <button class="tl-item" onclick={() => verPrueba(e.p)}>
            <span class="tl-que">{L(e.p.titulo)}</span>
            <span class="tl-meta">{t('his.prueba')} {numero(e.p)} · {e.p.figura === 'juan' ? t('his.juan') : t('his.jesus')} · {t('his.despues', { n: distancia(e.p) })}</span>
          </button>
          <Sello grado={e.p.grado} chico />
        {:else}
          <span class="tl-item"><span class="tl-que">{e.texto}</span></span>
        {/if}
      </li>
    {/each}
  </ol>

  <div class="tl-compara">
    <h3>{t('his.tl.compara')}</h3>
    <p class="his-intro">{t('his.tl.comparaIntro')}</p>
    {#each [['jesus', 20, 65], ['alejandro', 420, 470]] as [quien, a, b] (quien)}
      <div class="tl-fila">
        <span class="tl-quien">{t(`his.tl.${quien}`)}</span>
        <span class="tl-pista"><i style:left="{(a / 480) * 100}%" style:width="{Math.max(1.4, ((b - a) / 480) * 100)}%"></i></span>
        <span class="tl-cifra">{t('his.tl.cifra', { a, b })}</span>
      </div>
    {/each}
    <div class="tl-fila tl-fila-escala" aria-hidden="true">
      <span></span>
      <span class="tl-escala">{#each [0, 100, 200, 300, 400] as a (a)}<span style:left="{(a / 480) * 100}%">{a}</span>{/each}</span>
      <span></span>
    </div>
    <p class="nota-pie">{t('his.tl.comparaNota')}</p>
  </div>
</div>
