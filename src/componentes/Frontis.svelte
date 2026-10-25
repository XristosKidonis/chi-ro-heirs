<script>
  // Portadilla de libro: un grabado de Doré a toda página (o la imagen que el usuario elija),
  // tratado en blanco y negro con grano, y el nombre del libro encima como en un cartel.
  import { grabado } from '../lib/grabados.js';
  import { usuario, ponerPortada } from '../lib/usuario.svelte.js';
  import { avisar } from '../lib/ui.svelte.js';
  import { LIBROS, nombreLibro } from '../lib/libros.js';
  import { t } from '../lib/i18n.svelte.js';

  let { libro } = $props();
  const datos = $derived(LIBROS[libro - 1]);
  const g = $derived(grabado(libro));
  const propia = $derived(usuario.portadas[libro]);
  const nombre = $derived(nombreLibro(datos).toUpperCase());
  let entrada = $state();
  let cargada = $state(false);

  async function elegir(e) {
    const f = e.currentTarget.files?.[0];
    e.currentTarget.value = '';
    if (!f) return;
    try {
      ponerPortada(libro, await reducir(f));
      avisar(t('fr.puesta'));
    } catch {
      avisar(t('fr.error'), true);
    }
  }

  // Reduce la imagen a 1600 px y la pasa a JPEG para que pese poco en usuario.db.
  async function reducir(archivo) {
    const bmp = await createImageBitmap(archivo);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.84);
  }
</script>

<figure class="frontis" style="--n: {Math.max(nombre.length, 5)}">
  <div class="frontis-lamina" class:cargada>
    <img src={propia || g.src} alt={propia ? '' : `Gustave Doré, ${g.titulo}`} onload={() => (cargada = true)} />
    <span class="frontis-etiqueta">{datos.testamento === 'AT' ? t('nav.at') : t('nav.nt')} · {t('lector.libroDe', { n: datos.n })}</span>
    <h1 class="frontis-titulo">{nombre}</h1>
  </div>
  <figcaption class="frontis-pie">
    <span>{#if propia}{t('fr.tuya')}{:else}<b>Gustave Doré</b> · {g.titulo} · {g.ref}{/if}</span>
    <span class="frontis-acciones">
      <button onclick={() => entrada.click()}>{t('fr.cambiar')}</button>
      {#if propia}<button onclick={() => ponerPortada(libro, null)}>{t('fr.quitar')}</button>{/if}
    </span>
    <input type="file" accept="image/*" hidden bind:this={entrada} onchange={elegir} />
  </figcaption>
</figure>
