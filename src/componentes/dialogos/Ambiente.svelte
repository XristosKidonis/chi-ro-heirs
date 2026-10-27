<script>
  // Ambiente: música y sonidos que suenan dentro de la app (sin cuentas ni internet) y, aparte,
  // Spotify, que se abre afuera: tu playlist o una búsqueda.
  import { amb, preferencias, MUSICAS, CAPAS, TEMPORIZADORES, reproducir, alternar, elegirMusica, volumenMusica,
    volumenCapa, temporizador, enlaceSpotify, playlistValida } from '../../lib/ambiente.svelte.js';
  import { usuario, ajustar } from '../../lib/usuario.svelte.js';
  import { avisar } from '../../lib/ui.svelte.js';
  import { abrirEnNavegador } from '../../lib/archivos.js';
  import { t, idioma } from '../../lib/i18n.svelte.js';

  const p = $derived(preferencias());
  const mia = $derived(playlistValida(usuario.ajustes.spotifyPlaylist));
  let enlace = $state(usuario.ajustes.spotifyPlaylist || '');
  const BUSQUEDAS = {
    es: ['piano instrumental cristiano', 'adoración tranquila', 'lofi worship', 'himnos instrumentales'],
    en: ['christian instrumental piano', 'calm worship', 'lofi worship', 'instrumental hymns'],
  };
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const estado = $derived(
    amb.cargando ? t('amb.cargando')
      : !amb.sonando ? t('amb.silencio')
      : amb.himno ? amb.himno[idioma()]
      : p.musica ? t(`amb.m.${p.musica}`) : t('amb.soloSonidos'),
  );

  function musica(cual) {
    elegirMusica(cual);
    if (cual && !amb.sonando) reproducir();
  }
  function capa(nombre, v) {
    volumenCapa(nombre, v);
    if (v > 0 && !amb.sonando) reproducir();
  }
  function guardarPlaylist(e) {
    e.preventDefault();
    const url = playlistValida(enlace);
    if (enlace.trim() && !url) { avisar(t('amb.enlaceMalo'), true); return; }
    ajustar('spotifyPlaylist', url || '');
    avisar(url ? t('amb.enlaceGuardado') : t('amb.enlaceQuitado'));
  }
</script>

<div class="amb-cabeza">
  <button class="boton amb-play" aria-pressed={amb.sonando} onclick={alternar}>{amb.sonando ? t('amb.pausar') : t('amb.reproducir')}</button>
  <span class="amb-estado" aria-live="polite">{estado}{#if amb.restante} · {mmss(amb.restante)}{/if}</span>
</div>

<h3>{t('amb.musica')} <small class="cuenta">{t('amb.dentro')}</small></h3>
<div class="amb-musicas" role="radiogroup" aria-label={t('amb.musica')}>
  {#each [...MUSICAS, null] as m (m ?? 'nada')}
    <button class="amb-musica" role="radio" aria-checked={p.musica === m} onclick={() => musica(m)}>
      <span class="amb-m-nombre">{m ? t(`amb.m.${m}`) : t('amb.m.nada')}</span>
      <span class="amb-m-desc">{m ? t(`amb.m.${m}.d`) : t('amb.m.nada.d')}</span>
    </button>
  {/each}
</div>
<label class="ajuste"><span class="lbl">{t('amb.volumen')}</span>
  <input type="range" min="0" max="1" step="0.05" value={p.volumen} oninput={(e) => volumenMusica(Number(e.currentTarget.value))} /></label>

<h3>{t('amb.sonidos')} <small class="cuenta">{t('amb.sonidosNota')}</small></h3>
{#each CAPAS as c (c)}
  <label class="ajuste amb-capa"><span class="lbl">{t(`amb.capa.${c}`)}</span>
    <input type="range" min="0" max="1" step="0.05" value={p.capas[c]} data-capa={c} oninput={(e) => capa(c, Number(e.currentTarget.value))} /></label>
{/each}

<h3>{t('amb.apagar')}</h3>
<div class="amb-tiempos" role="radiogroup" aria-label={t('amb.apagar')}>
  {#each TEMPORIZADORES as x (x)}
    <button class="filtro" role="radio" aria-checked={p.temporizador === x} onclick={() => temporizador(x)}>
      {x === 0 ? t('amb.t.nunca') : x === 'amen' ? t('amb.t.amen') : t('amb.t.min', { n: x })}
    </button>
  {/each}
</div>

<h3>Spotify <small class="cuenta">{t('amb.spotifyAfuera')}</small></h3>
<p class="ayuda">{t('amb.spotifyAyuda')}</p>
{#if mia}
  <button class="boton amb-mia" onclick={() => abrirEnNavegador(mia)}>{t('amb.abrirMia')} ↗</button>
{/if}
<form class="fila-botones" onsubmit={guardarPlaylist}>
  <input class="campo" style="flex: 1 1 240px" type="text" bind:value={enlace} placeholder={t('amb.pegaEnlace')} aria-label={t('amb.pegaEnlace')} spellcheck="false" autocomplete="off" />
  <button class="boton secundario" type="submit">{t('ver.guardar')}</button>
</form>
<div class="amb-busquedas">
  {#each BUSQUEDAS[idioma()] as q (q)}
    <button class="filtro-color" onclick={() => abrirEnNavegador(enlaceSpotify(q))}>{q} ↗</button>
  {/each}
</div>

<p class="nota-pie">{t('amb.creditos')}</p>
