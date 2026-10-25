<script>
  import { irA, avisar } from '../../lib/ui.svelte.js';
  import { usuario, repasar, quitarMemoria } from '../../lib/usuario.svelte.js';
  import { pasaje } from '../../lib/biblia.js';
  import { parsearRango, nombreRef } from '../../lib/libros.js';

  let actual = $state(null);
  let texto = $state('');
  let nivel = $state(0);
  let ahora = $state(Date.now());

  const pendientes = $derived(usuario.memoria.filter((m) => m.proxima <= ahora).sort((a, b) => a.proxima - b.proxima));
  const NIVELES = ['Completo', 'Faltan palabras', 'Solo iniciales', 'De memoria'];

  $effect(() => {
    if (!actual && pendientes.length) actual = pendientes[0].ref;
  });

  $effect(() => {
    if (!actual) { texto = ''; return; }
    const r = parsearRango(actual);
    nivel = 0;
    texto = '';
    pasaje(usuario.ajustes.version, r.libro, r.cap, r.v, r.hasta, usuario.ajustes.claveNLT)
      .then((t) => (texto = t))
      .catch(() => pasaje('RV1909', r.libro, r.cap, r.v, r.hasta).then((t) => (texto = t)));
  });

  // Oculta palabras según el nivel, conservando la puntuación
  const palabras = $derived(texto.split(/(\s+)/).map((p, i) => {
    if (/^\s+$/.test(p) || !p) return { p, oculta: false };
    const idx = Math.floor(i / 2);
    if (nivel === 1 && idx % 3 === 2) return { p, oculta: true };
    if (nivel === 2) return { p: p.replace(/^([«"¿¡(]*\p{L})\p{L}*/u, '$1…'), oculta: false };
    if (nivel === 3) return { p, oculta: true };
    return { p, oculta: false };
  }));

  function responder(ok) {
    repasar(actual, ok);
    avisar(ok ? 'Bien. Lo verás de nuevo en unos días.' : 'Lo repasarás de nuevo pronto.');
    ahora = Date.now();
    actual = pendientes.find((m) => m.ref !== actual)?.ref || null;
  }

  const ref = (k) => { const r = parsearRango(k); return nombreRef(r.libro, r.cap, r.v, r.hasta); };
  const cuando = (t) => (t <= ahora ? 'hoy' : new Date(t).toLocaleDateString('es', { day: 'numeric', month: 'short' }));
</script>

{#if !usuario.memoria.length}
  <p class="cartel">Esconde la Palabra <em>en tu corazón.</em></p>
  <p class="ayuda">Selecciona un versículo y toca «Memorizar». Aquí lo practicarás quitando palabras poco a poco, y la app te lo volverá a mostrar justo antes de que se te olvide (Salmo 119:11).</p>
{:else}
  <div class="seccion">
    <h3>Para repasar hoy · {pendientes.length}</h3>
    {#if actual}
      <div class="mem-tarjeta">
        <span class="ref-encabezado">{ref(actual)}</span>
        <p class="mem-texto">{#each palabras as w}{#if w.oculta}<span class="oculta">{w.p}</span>{:else}{w.p}{/if}{/each}</p>
        <div class="niveles interruptor" role="group" aria-label="Nivel">
          {#each NIVELES as n, i}<button aria-pressed={nivel === i} onclick={() => (nivel = i)}>{n}</button>{/each}
        </div>
        <div class="fila-botones">
          <button class="boton" onclick={() => responder(true)}>Lo recordé</button>
          <button class="boton secundario" onclick={() => responder(false)}>Repasar otra vez</button>
        </div>
      </div>
    {:else}
      <p class="ayuda">Nada pendiente por hoy. Vuelve mañana.</p>
    {/if}
  </div>
  <div class="seccion">
    <h3>Tus versículos · {usuario.memoria.length}</h3>
    <ul class="resultados">
      {#each usuario.memoria as m (m.ref)}
        <li style="display:flex; align-items:center; gap:8px">
          <button style="flex:1" onclick={() => (actual = m.ref)}>
            <span class="r-ref">Próximo repaso: {cuando(m.proxima)} · {m.aciertos} aciertos seguidos</span>
            <span class="r-txt">{ref(m.ref)}</span>
          </button>
          <button class="enlace-texto" onclick={() => { const r = parsearRango(m.ref); irA(r.libro, r.cap, r.v); }}>Abrir</button>
          <button class="enlace-texto" onclick={() => { quitarMemoria(m.ref); if (actual === m.ref) actual = null; }}>Quitar</button>
        </li>
      {/each}
    </ul>
  </div>
{/if}
