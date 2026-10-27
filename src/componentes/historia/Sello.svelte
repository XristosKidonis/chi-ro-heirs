<script>
  // Sello del grado de una prueba: Firme · Probable · Discutido · Sin base
  import { t } from '../../lib/i18n.svelte.js';
  let { grado, chico = false } = $props();
</script>

<span class="sello-grado g-{grado}" class:chico title={t(`his.grado.${grado}.d`)}>{t(`his.grado.${grado}`)}</span>
