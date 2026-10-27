<script>
  // ¿Facto o fake?: afirmaciones que circulan en redes. Eliges, y la app explica con la prueba en la mano.
  // Sin rachas ni puntos acumulados: una ronda, un resultado y la puerta abierta al expediente.
  import Sello from './Sello.svelte';
  import { PREGUNTAS, prueba } from '../../lib/evidencias.js';
  import { t, idioma } from '../../lib/i18n.svelte.js';

  let { verPrueba } = $props();
  const L = (x) => x?.[idioma()] ?? '';
  const OPCIONES = ['firme', 'discutido', 'falso'];

  const barajar = () => [...PREGUNTAS].sort(() => Math.random() - 0.5);
  let orden = $state(barajar());
  let i = $state(0);
  let elegida = $state(null);
  let aciertos = $state(0);

  const q = $derived(orden[i]);
  const p = $derived(q ? prueba(q.prueba) : null);
  const terminado = $derived(i >= orden.length);
  const bien = $derived(elegida === q?.respuesta);
  // la explicación: si es firme, lo que establece; si no, lo que no establece
  const porque = $derived(p ? L(q.respuesta === 'firme' ? p.establece : p.noEstablece) : '');

  function elegir(o) {
    if (elegida) return;
    elegida = o;
    if (o === q.respuesta) aciertos++;
  }
  function siguiente() {
    elegida = null;
    i++;
  }
  function otraVez() {
    orden = barajar();
    i = 0;
    elegida = null;
    aciertos = 0;
  }
</script>

<div class="quiz">
  {#if !terminado}
    <div class="quiz-cabeza">
      <span>{t('his.quizNum', { n: String(i + 1).padStart(2, '0'), total: orden.length })}</span>
      <span class="quiz-barra" aria-hidden="true"><i style:width="{(i / orden.length) * 100}%"></i></span>
    </div>
    <p class="quiz-afirmacion">«{L(q.texto)}»</p>
    <div class="quiz-opciones" role="group" aria-label={t('his.quizElige')}>
      {#each OPCIONES as o (o)}
        <button class="quiz-op op-{o}" class:correcta={elegida && o === q.respuesta} class:errada={elegida === o && !bien}
          disabled={!!elegida} onclick={() => elegir(o)}>{t(`his.op.${o}`)}</button>
      {/each}
    </div>
    {#if elegida}
      <div class="quiz-veredicto" aria-live="polite">
        <p class="quiz-resultado">{bien ? t('his.bien') : t('his.casi', { r: t(`his.op.${q.respuesta}`) })}</p>
        <p class="quiz-porque">{porque}</p>
        <div class="quiz-acciones">
          <button class="boton" onclick={siguiente}>{i + 1 < orden.length ? t('his.siguiente') : t('his.verResultado')}</button>
          <button class="boton secundario" onclick={() => verPrueba(p)}>{t('his.verPrueba')} <Sello grado={p.grado} chico /></button>
        </div>
      </div>
    {/if}
  {:else}
    <div class="quiz-final">
      <span class="sobretitulo">{t('his.final')}</span>
      <p class="quiz-marcador">{aciertos}<small>/{orden.length}</small></p>
      <p class="quiz-porque">{aciertos >= orden.length - 2 ? t('his.finalAlto') : aciertos >= orden.length / 2 ? t('his.finalMedio') : t('his.finalBajo')}</p>
      <button class="boton" onclick={otraVez}>{t('his.otraVez')}</button>
    </div>
  {/if}
</div>
