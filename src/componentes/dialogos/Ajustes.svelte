<script>
  import { usuario, ajustar } from '../../lib/usuario.svelte.js';
  import { lista } from '../../lib/biblia.js';
  const a = $derived(usuario.ajustes);
</script>

<h3>Lectura</h3>
<div class="ajuste">
  <label for="aj-tema">Tema</label>
  <select id="aj-tema" value={a.tema} onchange={(e) => ajustar('tema', e.currentTarget.value)}>
    <option value="cuero">Cuero (oscuro)</option>
    <option value="papel">Papel (claro)</option>
    <option value="sistema">Igual que el sistema</option>
  </select>
</div>
<div class="ajuste">
  <label for="aj-tam">Tamaño de letra <small>{a.tamano} px</small></label>
  <input id="aj-tam" type="range" min="15" max="32" step="1" value={a.tamano} oninput={(e) => ajustar('tamano', Number(e.currentTarget.value))} />
</div>
<div class="ajuste">
  <label for="aj-int">Interlineado <small>{a.interlineado}</small></label>
  <input id="aj-int" type="range" min="1.35" max="2.2" step="0.05" value={a.interlineado} oninput={(e) => ajustar('interlineado', Number(e.currentTarget.value))} />
</div>
<div class="ajuste">
  <label for="aj-fuente">Tipografía del texto <small>Atkinson está diseñada para baja visión</small></label>
  <select id="aj-fuente" value={a.fuente} onchange={(e) => ajustar('fuente', e.currentTarget.value)}>
    <option value="literata">Literata (serif de libro)</option>
    <option value="atkinson">Atkinson Hyperlegible</option>
  </select>
</div>
<div class="ajuste">
  <label for="aj-lector">Modo lector <small>Oculta los números de versículo, como una Biblia de lectura</small></label>
  <input id="aj-lector" type="checkbox" checked={a.modoLector} onchange={(e) => ajustar('modoLector', e.currentTarget.checked)} />
</div>
<div class="ajuste">
  <label for="aj-parrafo">Texto corrido <small>Los versículos siguen en el mismo párrafo</small></label>
  <input id="aj-parrafo" type="checkbox" checked={a.parrafo} onchange={(e) => ajustar('parrafo', e.currentTarget.checked)} />
</div>
<div class="ajuste">
  <label for="aj-par">Versión en paralelo</label>
  <select id="aj-par" value={a.paralela} onchange={(e) => ajustar('paralela', e.currentTarget.value)}>
    <option value="">Ninguna</option>
    {#each lista().filter((v) => v.id !== a.version) as v}<option value={v.id}>{v.id} · {v.nombre}</option>{/each}
  </select>
</div>
<h3>Voz</h3>
<div class="ajuste">
  <label for="aj-voz">Velocidad de lectura <small>{a.velocidadVoz}×</small></label>
  <input id="aj-voz" type="range" min="0.6" max="1.6" step="0.1" value={a.velocidadVoz} oninput={(e) => ajustar('velocidadVoz', Number(e.currentTarget.value))} />
</div>
<h3>Atajos de teclado</h3>
<p class="ayuda">
  <span class="tecla">Ctrl K</span> o <span class="tecla">/</span> ir a un pasaje o buscar ·
  <span class="tecla">←</span> <span class="tecla">→</span> capítulo anterior y siguiente ·
  <span class="tecla">Esc</span> quitar la selección ·
  <span class="tecla">Mayús</span> + clic seleccionar un rango
</p>
