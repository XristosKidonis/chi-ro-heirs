<script>
  // Pantalla de inicio en dos pasos:
  //  1. Portada: el versículo del día como un cartel, a pantalla completa. Se toca para entrar.
  //  2. Menú: saludo, buscador de libros y pasajes, continuar leyendo, cintas y la estantería de los 66 libros.
  import { onMount, tick } from 'svelte';
  import Emblema from './Emblema.svelte';
  import { ui, irA } from '../lib/ui.svelte.js';
  import { usuario } from '../lib/usuario.svelte.js';
  import { pasaje, info } from '../lib/biblia.js';
  import { LIBROS, TOTAL_CAPITULOS, nombreLibro, nombreRef, parsearReferencia, normalizar } from '../lib/libros.js';
  import { versiculoDelDia } from '../lib/versiculosDelDia.js';
  import { grabado } from '../lib/grabados.js';
  import { dibujarLamina } from '../lib/laminas.js';
  import { t, idioma, fecha } from '../lib/i18n.svelte.js';

  const vd = versiculoDelDia();
  let texto = $state('');
  let versionTexto = $state('');
  let ancho = $state(1200);
  let alto = $state(800);
  let q = $state('');
  let activa = $state(0);
  let libroAbierto = $state(null);
  let buscador = $state();

  const ingles = $derived(idioma() === 'en');

  // Galería de láminas: el versículo del día en cada acabado, como un tablero de Pinterest
  const MURO = [
    { estilo: 'portadilla', formato: 'historia' },
    { estilo: 'ultramar', formato: 'post' },
    { estilo: 'aura', formato: 'historia' },
    { estilo: 'aerosol', formato: 'post' },
    { estilo: 'pedreria', formato: 'post' },
    { estilo: 'riso', formato: 'historia', tono: 'amarillo' },
    { estilo: 'primario', formato: 'post' },
    { estilo: 'calor', formato: 'post' },
  ];
  let muro = $state([]);
  const laminaDelDia = () => ({
    texto,
    referencia: nombreRef(vd.libro, vd.cap, vd.v, vd.hasta),
    clave: (ingles ? vd.claves.en : vd.claves.es)[0],
    version: versionTexto,
    libro: vd.libro,
  });
  $effect(() => {
    if (!texto || ui.pasoInicio !== 'menu') return;
    const base = laminaDelDia();
    let vivo = true;
    (async () => {
      const lista = [];
      for (const m of MURO) {
        const c = document.createElement('canvas');
        await dibujarLamina(c, { ...base, ...m, rotulo: t('lam.rotulo'), escala: 0.34 });
        if (!vivo) return;
        lista.push({ ...m, url: c.toDataURL('image/jpeg', 0.86) });
        muro = [...lista];
      }
    })();
    return () => { vivo = false; };
  });
  function abrirLamina(m) {
    ui.lamina = { ...laminaDelDia(), estilo: m.estilo, formato: m.formato, tono: m.tono };
    ui.dialogo = 'poster';
  }
  const pos = $derived(usuario.ajustes.pos);

  // Texto del versículo del día: la versión del usuario si responde pronto; si no, una incluida.
  onMount(async () => {
    const local = ingles ? 'BSB' : 'RV1909';
    const preferida = usuario.ajustes.version;
    const conLimite = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('tiempo')), ms))]);
    try {
      const vPref = info(preferida);
      if (!vPref || (vPref.idioma === 'en') !== ingles) throw new Error('idioma');
      texto = await conLimite(pasaje(preferida, vd.libro, vd.cap, vd.v, vd.hasta, usuario.ajustes.claveNLT), 2500);
      versionTexto = preferida;
    } catch {
      texto = await pasaje(local, vd.libro, vd.cap, vd.v, vd.hasta);
      versionTexto = local;
    }
  });

  // Tamaño del cartel: lo más grande que quepa en el espacio disponible
  const tamCartel = $derived.by(() => {
    const W = ancho > 900 ? Math.min(ancho * 0.6, 1040) : ancho - 48;
    const H = alto * (ancho > 900 ? 0.48 : 0.5);
    const chars = Math.max(20, texto.length);
    const palabraLarga = Math.max(4, ...texto.split(/\s+/).map((w) => w.length));
    const porArea = Math.sqrt((H * W) / (0.6 * chars));
    const porPalabra = W / (palabraLarga * 0.6);
    return Math.round(Math.max(28, Math.min(112, porArea, porPalabra)));
  });

  const claves = $derived((ingles ? vd.claves.en : vd.claves.es).map((k) => normalizar(k)));
  const palabras = $derived(texto.replace(/[«»"“”]/g, '').split(/\s+/).filter(Boolean).map((w) => {
    const n = normalizar(w).replace(/[^a-z0-9]/g, '');
    return { w, roja: claves.some((k) => n === k || (k.length >= 5 && n.startsWith(k))) };
  }));

  const saludo = $derived.by(() => {
    const h = new Date().getHours();
    return t(h < 12 ? 'ini.manana' : h < 19 ? 'ini.tarde' : 'ini.noche');
  });
  const hoy = $derived(fecha(Date.now(), { weekday: 'long', day: 'numeric', month: 'long' }));

  // ---------- menú ----------
  async function entrarAlMenu() {
    ui.pasoInicio = 'menu';
    await tick();
    buscador?.focus();
  }

  const GENEROS = [
    [1, 5, 'ley', 'hueso'], [6, 17, 'historia', 'cuero'], [18, 22, 'poesia', 'hueso'], [23, 27, 'mayores', 'cuero'],
    [28, 39, 'menores', 'tinta'], [40, 43, 'evangelios', 'lacre'], [44, 44, 'hechos', 'hueso'], [45, 57, 'pablo', 'cuero'],
    [58, 65, 'generales', 'hueso'], [66, 66, 'profecia', 'lacre'],
  ];
  const genero = (n) => GENEROS.find(([a, b]) => n >= a && n <= b);
  const leidosDe = (l) => Array.from({ length: l.capitulos }, (_, i) => usuario.leidos[`${l.n}.${i + 1}`]).filter(Boolean).length;
  const altoLomo = (l) => Math.max(150, 118 + Math.min(l.capitulos, 66) * 1.45);
  const anchoLomo = (l) => Math.round(30 + Math.min(l.capitulos, 50) / 5);
  // el título dorado se achica en los nombres largos para que entre entero entre los nervios
  const tamNombre = (l) => {
    const n = nombreLibro(l).length;
    return Math.max(8.5, Math.min(11.5, (altoLomo(l) - 108) / (n * (n > 8 ? 0.8 : 0.95)))).toFixed(1);
  };
  const totalLeidos = $derived(Object.keys(usuario.leidos).length);

  const sugerencias = $derived.by(() => {
    const s = q.trim();
    if (!s) return [];
    const out = [];
    const ref = /\d/.test(s) ? parsearReferencia(s) : null;
    if (ref) out.push({ tipo: 'ref', ref, texto: t('ini.ir', { ref: nombreRef(ref.libro, ref.cap, ref.v, ref.hasta) }) });
    const n = normalizar(s).replace(/\s+/g, '');
    for (const l of LIBROS) {
      if (out.length >= 7) break;
      const nombres = [l.clave, normalizar(l.ingles).replace(/\s+/g, ''), ...l.alias];
      if (nombres.some((x) => x.startsWith(n)) && !(ref && ref.libro === l.n)) out.push({ tipo: 'libro', libro: l, texto: nombreLibro(l) });
    }
    if (!ref && s.length > 2) out.push({ tipo: 'buscar', texto: t('ini.buscarTodo', { q: s }) });
    return out;
  });

  $effect(() => { q; activa = 0; });

  function elegir(s) {
    if (!s) return;
    if (s.tipo === 'ref') {
      irA(s.ref.libro, s.ref.cap, s.ref.v);
    } else if (s.tipo === 'libro') {
      libroAbierto = s.libro;
      q = '';
    } else {
      ui.busqueda = q.trim();
      ui.pestana = 'buscar';
      ui.estudioAbierto = true;
      ui.vista = 'lector';
    }
  }

  function teclaBuscador(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); activa = Math.min(activa + 1, sugerencias.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activa = Math.max(activa - 1, 0); }
    else if (e.key === 'Enter') { e.preventDefault(); elegir(sugerencias[activa]); }
  }

  function tecla(e) {
    if (ui.vista !== 'inicio') return;
    if (ui.pasoInicio === 'portada') {
      if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); entrarAlMenu(); }
    } else if (e.key === 'Escape') {
      if (libroAbierto) libroAbierto = null;
      else ui.vista = 'lector';
    }
  }
</script>

<svelte:window bind:innerWidth={ancho} bind:innerHeight={alto} onkeydown={tecla} />

<div class="inicio">
  {#if ui.pasoInicio === 'portada'}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <section class="portada-w" role="button" tabindex="0" aria-label={t('ini.toca')} onclick={entrarAlMenu}>
      <div class="marca-agua" aria-hidden="true"><Emblema tam={1000} /></div>
      <header class="portada-cabeza">
        <span class="portada-marca"><Emblema tam={34} /><b>CHI-RO</b><i>Heirs</i></span>
        <span class="etiqueta-ui">{t('ini.diaVerso')} · {hoy}</span>
      </header>
      <div class="portada-centro">
        {#if texto}
          <p class="portada-verso" style="font-size: {tamCartel}px">
            {#each palabras as p}<span class:roja={p.roja}>{p.w}</span>{' '}{/each}
          </p>
          <p class="portada-ref">{nombreRef(vd.libro, vd.cap, vd.v, vd.hasta)} <span class="etiqueta-ui">{versionTexto}</span></p>
        {/if}
      </div>
      <footer class="portada-pie">
        <span class="lema">{t('ini.lema')}</span>
        <span class="tocar"><i></i>{t('ini.toca')}</span>
        <span class="etiqueta-ui solo-escritorio">chi-ro heirs · Ro 8:17</span>
      </footer>
    </section>
  {:else}
    <section class="menu-inicio">
      <header class="menu-cabeza">
        <button class="portada-marca" onclick={() => (ui.pasoInicio = 'portada')} title={t('ini.portada')}>
          <Emblema tam={30} /><b>CHI-RO</b><i>Heirs</i>
        </button>
        <button class="boton" onclick={() => (ui.vista = 'lector')}>{t('ini.abrir')} →</button>
      </header>

      <div class="menu-saludo">
        <span class="etiqueta-ui">{hoy}</span>
        <h1>{saludo}</h1>
        <p class="sub">{t('ini.pregunta')}</p>
        <div class="buscador-inicio">
          <input bind:this={buscador} bind:value={q} onkeydown={teclaBuscador} type="search" class="campo"
            placeholder={t('ini.buscar')} aria-label={t('ini.buscar')} autocomplete="off" spellcheck="false" />
          {#if sugerencias.length}
            <ul class="sugerencias" role="listbox">
              {#each sugerencias as s, i}
                <li role="option" aria-selected={i === activa}>
                  <button class:activa={i === activa} onmouseenter={() => (activa = i)} onclick={() => elegir(s)}>
                    {#if s.tipo === 'libro'}<span class="sug-libro">{s.texto}</span><small>{s.libro.capitulos}</small>
                    {:else}<span>{s.texto}</span>{/if}
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>

      <div class="tarjetas-inicio">
        <button class="tarjeta-inicio principal" onclick={() => irA(pos.libro, pos.cap)}>
          <span class="etiqueta-ui">{t('ini.continuar')}</span>
          <span class="t-grande">{nombreRef(pos.libro, pos.cap)}</span>
          <span class="t-pie">{info(usuario.ajustes.version)?.nombre}</span>
          <img class="tarjeta-grabado" src={usuario.portadas[pos.libro] || grabado(pos.libro)?.src} alt="" aria-hidden="true" />
        </button>
        <div class="tarjeta-inicio">
          <span class="etiqueta-ui">{t('ini.cintas')}</span>
          {#if usuario.cintas.length}
            <ul class="lista-cintas">
              {#each usuario.cintas.slice(0, 4) as c (c.id)}
                <li><button onclick={() => irA(c.libro, c.cap)}>{nombreRef(c.libro, c.cap)}</button></li>
              {/each}
            </ul>
          {:else}
            <span class="t-pie">{t('ini.sinCintas')}</span>
          {/if}
        </div>
        <div class="tarjeta-inicio">
          <span class="etiqueta-ui">{t('ini.progreso')}</span>
          <span class="t-grande">{Math.round((totalLeidos / TOTAL_CAPITULOS) * 1000) / 10}%</span>
          <span class="t-pie">{t('ini.capLeidos', { n: totalLeidos, total: TOTAL_CAPITULOS })}</span>
          <div class="barra-prog"><i style="width: {(totalLeidos / TOTAL_CAPITULOS) * 100}%"></i></div>
        </div>
      </div>

      <div class="laminas-inicio">
        <div class="estante-cabeza">
          <h2>{t('lam.titulo')}</h2>
          <span class="nota-pie">{t('lam.ayuda')}</span>
        </div>
        <div class="muro">
          {#each muro as m (m.estilo)}
            <button class="pin" class:alto={m.formato === 'historia'} onclick={() => abrirLamina(m)}>
              <img src={m.url} alt={`${t(`lam.e.${m.estilo}`)} · ${nombreRef(vd.libro, vd.cap, vd.v, vd.hasta)}`} />
              <span class="etiqueta-ui">{t(`lam.e.${m.estilo}`)}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="estanteria">
        <div class="estante-cabeza">
          <h2>{t('ini.estante')}</h2>
          <span class="nota-pie">{t('ini.estanteAyuda')}</span>
        </div>
        {#each [['AT', 'nav.at'], ['NT', 'nav.nt']] as [tes, etiqueta]}
          <span class="etiqueta-ui">{t(etiqueta)}</span>
          <div class="estante">
            {#each LIBROS.filter((l) => l.testamento === tes) as l (l.n)}
              {@const g = genero(l.n)}
              {@const leidos = leidosDe(l)}
              <button class="lomo {g[3]}" class:abierto={libroAbierto === l} class:completo={leidos === l.capitulos}
                style="height: {altoLomo(l)}px; width: {anchoLomo(l)}px"
                onclick={() => (libroAbierto = libroAbierto === l ? null : l)} title="{nombreLibro(l)} · {t(`gen.${g[2]}`)}">
                <span class="cabezada" aria-hidden="true"></span>
                <span class="nervios" aria-hidden="true"><i></i><i></i></span>
                <span class="nombre" class:largo={nombreLibro(l).length > 8} style="font-size: {tamNombre(l)}px">{nombreLibro(l)}</span>
                <span class="nervios" aria-hidden="true"><i></i><i></i></span>
                <span class="tejuelo">{l.capitulos}</span>
                {#if leidos}<span class="leido" style="height: {(leidos / l.capitulos) * 100}%" aria-hidden="true"></span>{/if}
              </button>
            {/each}
          </div>
          {#if libroAbierto && libroAbierto.testamento === tes}
            <div class="libro-abierto">
              <div class="libro-abierto-cabeza">
                <h3 class="libro-nombre">{nombreLibro(libroAbierto)}</h3>
                <span class="etiqueta-ui">{t(`gen.${genero(libroAbierto.n)[2]}`)}</span>
                <span class="espacio"></span>
                <button class="enlace-texto" onclick={() => (libroAbierto = null)}>{t('ini.cerrarLibro')}</button>
              </div>
              <div class="caps">
                {#each Array.from({ length: libroAbierto.capitulos }, (_, i) => i + 1) as c}
                  <button class:leido={usuario.leidos[`${libroAbierto.n}.${c}`]} onclick={() => irA(libroAbierto.n, c)}>{c}</button>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
        <div class="leyenda">
          {#each GENEROS as g}<span><i class="punto {g[3]}"></i>{t(`gen.${g[2]}`)}</span>{/each}
        </div>
      </div>
    </section>
  {/if}
</div>
