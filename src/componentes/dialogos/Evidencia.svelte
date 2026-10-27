<script>
  // Desde el lector: el pasaje bíblico y la fuente histórica, lado a lado, con lo que establece y lo que no.
  import Sello from '../historia/Sello.svelte';
  import Contraste from '../historia/Contraste.svelte';
  import { prueba, numero, parsearVerso } from '../../lib/evidencias.js';
  import { pasaje, versionEstudio } from '../../lib/biblia.js';
  import { ui, abrirVista } from '../../lib/ui.svelte.js';
  import { usuario } from '../../lib/usuario.svelte.js';
  import { nombreRef } from '../../lib/libros.js';
  import { abrirEnNavegador } from '../../lib/archivos.js';
  import { t, idioma } from '../../lib/i18n.svelte.js';

  const L = (x) => x?.[idioma()] ?? '';
  const pruebas = $derived((ui.evidencias || []).map(prueba).filter(Boolean));
  let textos = $state({});

  // el pasaje de cada prueba que contiene el versículo tocado (o el primero que cita)
  function pasajeDe(p) {
    const en = ui.evidenciaVerso;
    const refs = p.versos.map(parsearVerso);
    return refs.find((r) => en && r.libro === en.libro && r.cap === en.cap && en.v >= r.v && en.v <= (r.hasta || r.v)) || refs[0];
  }

  $effect(() => {
    const version = usuario.ajustes.version;
    const clave = usuario.ajustes.claveNLT;
    for (const p of pruebas) {
      const r = pasajeDe(p);
      pasaje(version, r.libro, r.cap, r.v, r.hasta, clave)
        .catch(() => pasaje(versionEstudio(version), r.libro, r.cap, r.v, r.hasta))
        .then((tx) => (textos = { ...textos, [p.id]: tx || '—' }))
        .catch(() => (textos = { ...textos, [p.id]: '—' }));
    }
  });

  function expediente(p) {
    ui.dialogo = null;
    ui.historia.pestana = p.figura;
    ui.historia.abierta = p.id;
    abrirVista('historia');
    setTimeout(() => document.getElementById(`prueba-${p.id}`)?.scrollIntoView({ block: 'start' }), 120);
  }
</script>

{#each pruebas as p (p.id)}
  {@const r = pasajeDe(p)}
  <article class="ev">
    <div class="ev-cabeza">
      <span class="his-num">{t('his.prueba')} {numero(p)} · {p.figura === 'juan' ? t('his.juan') : t('his.jesus')}</span>
      <Sello grado={p.grado} />
    </div>
    <h3 class="ev-titulo">{L(p.titulo)}</h3>
    {#if p.contraste}<Contraste {p} />{/if}
    <div class="ev-lado">
      <div class="ev-col">
        <span class="ev-et">{t('his.laBiblia')} · {nombreRef(r.libro, r.cap, r.v, r.hasta)} · {usuario.ajustes.version}</span>
        <p class="ev-texto">{textos[p.id] ?? '…'}</p>
      </div>
      <div class="ev-col">
        <span class="ev-et">{L(p.autor)} · {L(p.obra)} · {L(p.fecha)}</span>
        <p class="ev-texto ev-cita">{L(p.cita)}</p>
      </div>
    </div>
    <div class="his-dos">
      <div><h4>{t('his.establece')}</h4><p>{L(p.establece)}</p></div>
      <div><h4>{t('his.noEstablece')}</h4><p>{L(p.noEstablece)}</p></div>
    </div>
    <div class="his-pie">
      <button class="his-ref" onclick={() => expediente(p)}>{t('his.verExpediente')} ↗</button>
      {#if p.fuente}<button class="his-ref his-fuente" onclick={() => abrirEnNavegador(p.fuente)}>{t('his.fuente')} ↗</button>{/if}
    </div>
  </article>
{/each}
