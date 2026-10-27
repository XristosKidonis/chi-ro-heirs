<script>
  // Dos relatos del mismo hecho: en qué coinciden y qué cuenta solo cada uno
  import { t, idioma } from '../../lib/i18n.svelte.js';
  let { p } = $props();
  const L = (x) => x?.[idioma()] ?? [];
  const fuente = $derived((p.autor[idioma()] || '').split(',')[0]);
</script>

<div class="contraste" aria-label={t('his.contraste')}>
  <div class="ct-col ct-coinciden"><h4>{t('his.coinciden')}</h4><ul>{#each L(p.contraste.coinciden) as x (x)}<li>{x}</li>{/each}</ul></div>
  <div class="ct-col"><h4>{t('his.soloBiblia')}</h4><ul>{#each L(p.contraste.biblia) as x (x)}<li>{x}</li>{/each}</ul></div>
  <div class="ct-col"><h4>{t('his.soloFuente', { f: fuente })}</h4><ul>{#each L(p.contraste.fuente) as x (x)}<li>{x}</li>{/each}</ul></div>
</div>
