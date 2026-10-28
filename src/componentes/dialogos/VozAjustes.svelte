<script>
  // Ajustes → Voz: con qué se lee en voz alta. Tres caminos: las voces del equipo, una voz natural con IA
  // que se descarga una vez y funciona sin internet, o la Biblia narrada por personas (Bible.is).
  import { usuario, ajustar } from '../../lib/usuario.svelte.js';
  import { avisar } from '../../lib/ui.svelte.js';
  import { voces, vozPara, probarVoz, esNatural, detener } from '../../lib/voz.svelte.js';
  import { VOCES_NEURALES, MOTOR_MB, instalada, instalar, borrar, sintetizar } from '../../lib/vozNeural.js';
  import { abrirEnNavegador } from '../../lib/archivos.js';
  import { PAGINA_CLAVE } from '../../lib/narrada.js';
  import { t, idioma } from '../../lib/i18n.svelte.js';

  const a = $derived(usuario.ajustes);
  const motor = $derived(a.motorVoz || 'sistema');
  const L = (x) => (typeof x === 'string' ? x : x?.[idioma()] ?? '');
  const MOTORES = ['sistema', 'natural', 'narrada'];

  // ---- voz natural ----
  let listas = $state({});     // id -> true si ya está descargada
  let bajando = $state({});    // id -> fracción 0..1
  let motorListo = $state(false);
  async function revisar() {
    const r = {};
    for (const v of VOCES_NEURALES) r[v.id] = await instalada(v.id);
    listas = r;
    motorListo = Object.values(r).some(Boolean);
  }
  $effect(() => { if (motor === 'natural') revisar(); });
  const campoNeural = (lang) => (lang === 'en' ? 'vozNeuralEn' : 'vozNeuralEs');

  async function descargar(v) {
    bajando = { ...bajando, [v.id]: 0 };
    try {
      await instalar(v.id, (f) => (bajando = { ...bajando, [v.id]: f }));
      if (!a[campoNeural(v.lang)] || !listas[a[campoNeural(v.lang)]]) ajustar(campoNeural(v.lang), v.id);
      avisar(t('vn.lista', { n: v.nombre }));
    } catch (e) {
      avisar(t('vn.errorBajar', { e: e.message || e }), true);
    }
    const { [v.id]: _, ...resto } = bajando;
    bajando = resto;
    await revisar();
  }
  async function quitar(v) {
    await borrar(v.id);
    if (a[campoNeural(v.lang)] === v.id) ajustar(campoNeural(v.lang), '');
    await revisar();
  }
  let probando = $state('');
  async function probarNeural(v) {
    detener();
    probando = v.id;
    try {
      const frase = v.lang === 'en' ? 'In the beginning was the Word, and the Word was with God, and the Word was God.' : 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.';
      const { pcm, frecuencia } = await sintetizar(v.id, frase, a.velocidadVoz || 1);
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, pcm.length, frecuencia);
      buf.getChannelData(0).set(pcm);
      const s = ctx.createBufferSource();
      s.buffer = buf;
      s.connect(ctx.destination);
      s.onended = () => ctx.close();
      s.start();
    } catch (e) {
      avisar(t('voz.naturalError'), true);
    }
    probando = '';
  }

  // ---- narrada ----
  let clave = $state(usuario.ajustes.claveBibleBrain || '');
  let buscando = $state(false);
  let encontradas = $state({ es: [], en: [] });
  async function buscarAudio(e) {
    e?.preventDefault();
    const k = clave.trim();
    ajustar('claveBibleBrain', k);
    if (!k) return;
    buscando = true;
    try {
      const { bibliasEnAudio } = await import('../../lib/narrada.js');
      const [es, en] = await Promise.all([bibliasEnAudio('es', k), bibliasEnAudio('en', k)]);
      encontradas = { es, en };
      for (const [lang, lista] of [['es', es], ['en', en]]) {
        const campo = lang === 'en' ? 'audioEn' : 'audioEs';
        if (lista.length && !lista.some((x) => x.id === a[campo]?.id)) ajustar(campo, $state.snapshot(lista[0]));
      }
      avisar(t('narrada.encontradas', { n: es.length + en.length }));
    } catch (err) {
      avisar(err.message || String(err), true);
    }
    buscando = false;
  }
  const opcionesAudio = (lang) => {
    const elegida = a[lang === 'en' ? 'audioEn' : 'audioEs'];
    const lista = encontradas[lang];
    return elegida && !lista.some((x) => x.id === elegida.id) ? [elegida, ...lista] : lista;
  };
  const etiquetaAudio = (x) => `${x.nombre} · ${x.tipo === 'audio_drama' ? t('narrada.drama') : t('narrada.lectura')}${x.AT && x.NT ? '' : x.NT ? ` · ${t('narrada.soloNT')}` : ` · ${t('narrada.soloAT')}`}`;
</script>

<h3>{t('aj.voz')}</h3>
<div class="amb-musicas voz-motores" role="radiogroup" aria-label={t('aj.voz')}>
  {#each MOTORES as m (m)}
    <button class="amb-musica" role="radio" aria-checked={motor === m} onclick={() => ajustar('motorVoz', m)}>
      <span class="amb-m-nombre">{t(`vm.${m}`)}</span>
      <span class="amb-m-desc">{t(`vm.${m}.d`)}</span>
    </button>
  {/each}
</div>

{#if motor === 'sistema'}
  {#each [['es', 'vozEs'], ['en', 'vozEn']] as [lang, campo] (lang)}
    <div class="ajuste aj-voz">
      <label for="aj-voz-{lang}">{t(`aj.voz.${lang}`)}</label>
      <div class="fila-botones">
        <select id="aj-voz-{lang}" class="campo" value={vozPara(lang)?.voiceURI || ''} onchange={(e) => ajustar(campo, e.currentTarget.value)}>
          {#each voces[lang] as v (v.voiceURI)}<option value={v.voiceURI}>{esNatural(v) ? '★ ' : ''}{v.name}</option>{/each}
          {#if !voces[lang].length}<option value="">{t('aj.voz.ninguna')}</option>{/if}
        </select>
        <button class="boton secundario" onclick={() => probarVoz(lang)}>{t('aj.voz.probar')}</button>
      </div>
    </div>
  {/each}
  <p class="nota-pie">{t('aj.voz.ayuda')}</p>
{:else if motor === 'natural'}
  <p class="ayuda">{t('vn.ayuda', { mb: MOTOR_MB })}{motorListo ? ` ${t('vn.motorListo')}` : ''}</p>
  {#each ['es', 'en'] as lang (lang)}
    <span class="etiqueta-ui">{t(`aj.voz.${lang}`)}</span>
    <ul class="vn-lista">
      {#each VOCES_NEURALES.filter((v) => v.lang === lang) as v (v.id)}
        {@const usada = a[campoNeural(lang)] === v.id && listas[v.id]}
        <li class:usada>
          <span class="vn-nombre">{v.nombre} <small>{L(v.acento)}</small></span>
          <span class="vn-meta">{L(v.licencia)} · {v.mb} MB</span>
          <span class="vn-acciones">
            {#if bajando[v.id] != null}
              <span class="vn-progreso" role="progressbar" aria-valuenow={Math.round(bajando[v.id] * 100)}><i style:width="{bajando[v.id] * 100}%"></i></span>
              <span class="vn-pct">{Math.round(bajando[v.id] * 100)} %</span>
            {:else if listas[v.id]}
              <button class="his-ref" onclick={() => probarNeural(v)} disabled={probando === v.id}>{probando === v.id ? t('vn.generando') : t('aj.voz.probar')}</button>
              {#if !usada}<button class="his-ref" onclick={() => ajustar(campoNeural(lang), v.id)}>{t('vn.usar')}</button>{:else}<span class="vn-usada">{t('vn.enUso')}</span>{/if}
              <button class="his-ref vn-borrar" onclick={() => quitar(v)}>{t('vn.borrar')}</button>
            {:else}
              <button class="his-ref" onclick={() => descargar(v)}>{t('vn.descargar')} ↓</button>
            {/if}
          </span>
        </li>
      {/each}
    </ul>
  {/each}
  <p class="nota-pie">{t('vn.creditos')}</p>
{:else}
  <p class="ayuda">{t('narrada.ayuda')}</p>
  <form class="fila-botones" onsubmit={buscarAudio}>
    <input class="campo" style="flex: 1 1 240px" type="text" bind:value={clave} placeholder={t('narrada.clave')} aria-label={t('narrada.clave')} spellcheck="false" autocomplete="off" />
    <button class="boton secundario" type="submit" disabled={buscando}>{buscando ? t('narrada.buscando') : t('narrada.buscar')}</button>
  </form>
  <button class="his-ref" onclick={() => abrirEnNavegador(PAGINA_CLAVE)}>{t('narrada.pedirClave')} ↗</button>
  {#each ['es', 'en'] as lang (lang)}
    {#if opcionesAudio(lang).length}
      <div class="ajuste aj-voz">
        <label for="aj-audio-{lang}">{t(`narrada.biblia.${lang}`)}</label>
        <select id="aj-audio-{lang}" class="campo" value={a[lang === 'en' ? 'audioEn' : 'audioEs']?.id || ''}
          onchange={(e) => ajustar(lang === 'en' ? 'audioEn' : 'audioEs', $state.snapshot(opcionesAudio(lang).find((x) => x.id === e.currentTarget.value)))}>
          {#each opcionesAudio(lang) as x (x.id)}<option value={x.id}>{etiquetaAudio(x)}</option>{/each}
        </select>
      </div>
    {/if}
  {/each}
  <p class="nota-pie">{t('narrada.nota')}</p>
{/if}
<div class="ajuste">
  <label for="aj-vel">{t('aj.velocidad')} <small>{a.velocidadVoz}×</small></label>
  <input id="aj-vel" type="range" min="0.6" max="1.6" step="0.1" value={a.velocidadVoz} oninput={(e) => ajustar('velocidadVoz', Number(e.currentTarget.value))} disabled={motor === 'narrada'} />
</div>
