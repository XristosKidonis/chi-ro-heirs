# 11. Integración del diseño «white industrial» (27 de octubre de 2026)

> **Estado:** integrado en la rama `diseno/white-industrial`.
> - **No** está fusionado en `main`.
> - **No** se publicó en la web ni se generaron instaladores: falta la aprobación final del dueño.
>
> **Origen:** la entrega de diseño del agente del dueño, `CHI-RO-HEIRS-ENTREGA-FINAL`, que contiene un prototipo HTML, especificaciones y capturas aprobadas.
> - La entrega **no** se copió al repositorio: ni sus imágenes, ni el ZIP histórico, ni el prototipo.
> - Este documento reemplaza, en lo visual, lo que describen `03-gusto-del-usuario.md` y `04-sistema-visual-actual.md`. Esos dos documentos quedan como historia.

## Qué se pidió (resumen de la entrega)

- **Superficie:** una sola, muy clara (`#f7f7f5`), con tinta `#181818` y pocos controles.
- **Logo:** CHI—RO **nítido**, con HEIRS chico debajo. Sin tinta corrida, desenfoque, filtros, sombras ni metal.
- **Inicio:** la marca grande y tres entradas (Continuar leyendo, Biblioteca, Mi archivo). Sin fotos, cifras ni rachas.
- **Biblioteca:** 66 cubiertas tipográficas grises y algunas con aluminio mate muy leve.
- **Lector:** sereno, con Literata, modo oscuro y modo Calma. El estudio se abre a pedido.
- **Mi archivo:** un índice, no tarjetas.
- **Láminas:** primero un índice neutro de tres colecciones (Tipografía, Color, Imagen). El color aparece solo al entrar en una.
- **Requisitos técnicos:**
  - Usar el motor real (Tauri, Svelte y SQLite) y no el JS del prototipo.
  - No perder funciones ni datos.
  - Respetar español e inglés y la accesibilidad.
  - Hacer pruebas y entregar capturas reales.

## Mapa: prototipo → app real

| Prototipo | App | Archivo |
|---|---|---|
| `global-header` (marca, 5 destinos, Buscar, guardados) | Cabecera, más un botón de Ajustes | `src/componentes/Cabecera.svelte` |
| marca `CHI—RO` + `HEIRS` | Componente de texto, sin imagen ni filtros | `src/componentes/Marca.svelte` |
| `mobile-nav` | Navegación inferior (≤ 760 px) | `src/componentes/NavMovil.svelte` |
| Inicio (`home-center`, `home-culture`, `home-signoff`) | Inicio. La micro-lámina se **dibuja en vivo** (Aura del versículo del día, en gris), no es un JPG | `src/componentes/Inicio.svelte` |
| Biblioteca (`book-catalog`) | 66 cubiertas desde `LIBROS`, con filtro AT/NT y búsqueda (acepta «jn 3:16») | `src/componentes/vistas/Biblioteca.svelte` |
| Lector (`reader-topline`, título «Juan 1», versículos) | Lector real (todas las versiones, paralela, subrayados, notas y voz), con barra mínima | `src/componentes/Lector.svelte`, `LectorBarra.svelte` |
| «JUAN 01 ▾» | Abre el selector de libros, capítulos, cintas e historial (el antiguo panel izquierdo) | `src/componentes/Navegacion.svelte` |
| `study-aside` | Panel de estudio real (palabra, original, refs, comparar, notas, buscar, memoria y progreso) como margen que se abre a pedido | `src/componentes/Estudio.svelte` |
| `selection-bar` | Barra de selección: colores, Guardar, Nota, Estudiar y Lámina; «Más» abre Original, Refs, Comparar, Memorizar y Copiar | `src/componentes/Acciones.svelte` |
| Mi archivo | Índice desde `usuario.db`: guardados (versículos y cintas), subrayados y notas, con filtros y búsqueda | `src/componentes/vistas/Archivo.svelte` |
| Láminas (índice y detalle) | Tres colecciones sobre el motor Canvas original; cada pieza abre el editor de siempre | `src/componentes/vistas/Galeria.svelte`, `src/lib/colecciones.js` |
| Búsqueda (Ctrl/Cmd K) | Diálogo nativo: referencia → pasaje, libro → lector, palabra → búsqueda FTS | `src/componentes/Buscador.svelte` |
| Notas (`note-modal`) | Se mantiene la pestaña Notas del estudio (tipos, `#etiquetas`, retroenlaces) | `estudio/Notas.svelte` (sin cambios) |

## Funciones preservadas y dónde quedaron

Ninguna función se borró.

| Función | Dónde está ahora |
|---|---|
| Versiones NTV/NLT (en línea) y RV1909, RV1865, BSB y KJV | Selector de versión en la barra del lector |
| Vista paralela | Selector «∥» en la barra del lector (oculto en < 1080 px; también en Ajustes) |
| Subrayado en 5 colores, anclado a la referencia | Barra de selección |
| Notas con tipos, `#etiquetas` y retroenlaces | Estudio → Notas; también en Mi archivo |
| Estudio de palabra, concordancia y mapa por libros | Estudio → Palabra («Estudiar» en la selección) |
| Interlineal hebreo (de derecha a izquierda) y griego, Strong, morfología y léxicos | Estudio → Original |
| Referencias cruzadas y comparar | Estudio, o «Más» en la selección |
| Búsqueda FTS | Ctrl/Cmd K o «/» → «Buscar … en toda la Biblia» → Estudio → Buscar |
| Memorizar | «Más» → Memorizar → Estudio → Memoria |
| Capítulos leídos («Amén») y cobertura | Final del capítulo («Amén · Marcar como leído») y Estudio → Progreso |
| Cintas por capítulo | Ícono de marcador en la barra del lector; se listan en Mi archivo → Guardados y en el selector |
| Historial | Selector «JUAN 01 ▾» → Historial |
| Láminas en 8 acabados y 4 formatos, con frase editable y exportación PNG | Láminas → colección → pieza → editor (sin cambios en el motor) |
| Portadilla con grabado de Doré e imagen propia | **Opcional:** Ajustes → Grabados (ahora apagada por defecto) |
| Voz | Ícono de altavoz en la barra del lector |
| Idioma es/en, tamaño, interlineado, Literata/Atkinson, modo lector y texto corrido | Ajustes (ícono en la cabecera) y A−/A+ en la barra |
| Versiones y clave de Tyndale; respaldo JSON | Ajustes → «Más» (botones), y el pie del selector |
| Atajos ← → (capítulos), Esc, Mayús + clic | Igual; Esc también sale de Calma, cierra paneles y vuelve al índice de Láminas |

## Cambios en datos (`usuario.db`)

- **Nueva tabla `guardados`** (`clave`, `creada`, `actualizado`, `borrado`) para los versículos guardados en Mi archivo.
  - Se crea con `CREATE TABLE IF NOT EXISTS`. **No modifica ni migra ninguna tabla existente**, así que no destruye datos.
  - Va incluida en el respaldo JSON (exportar e importar).
- **Ajustes nuevos o con otro valor por defecto.** Solo afectan a quien nunca los cambió:
  - `tema`: ahora `papel` (claro). Si alguien ya había guardado `cuero`, sigue teniendo el lector oscuro.
  - `grabados`: ahora `false`. La portadilla de Doré se enciende en Ajustes.
  - `calma`: nuevo, `false`. Se guarda.
- **El modo oscuro aplica solo al lector** (y a su estudio). Inicio, Biblioteca, Archivo y Láminas siempre son claros.
- **Recomendación:** antes de instalar una versión con este diseño, exportar un respaldo (Ajustes → Respaldo). La migración es aditiva, pero el respaldo es la red de seguridad.

## Sistema visual implementado

- **Tokens** (en `src/app.css`): fondo `#f7f7f5`, superficie `#eeeeeb`, hover `#e6e6e2`, tinta `#181818`, línea `#d9d9d5`. Lector oscuro: `#171717` / `#f3f3f1`.
- **Contraste de metadatos:** el gris del mock (`#8b8b89`, 3,2:1) se cambió por `--tenue: #6e6e6c` (4,7:1). Solo los textos decorativos (`aria-hidden`) usan el gris claro.
- **Letras, todas locales con licencia OFL:**
  - **Inter Tight variable:** marca, títulos y biblioteca.
  - **DM Sans variable:** interfaz. Es nueva en `public/fuentes`.
  - **Literata:** texto bíblico.
  - **Noto Serif Hebrew:** interlineal hebreo.
  - Pinyon, Archivo y Fraunces quedan **solo** para dibujar láminas.
  - Bodoni ya no se usa en la interfaz.
- **Marca:** `CHI—RO` en Inter Tight 500–650 con `letter-spacing` negativo. La regla `filter: none !important; text-shadow: none !important` garantiza que nunca lleve efectos. Una prueba lo verifica.
- **Aluminio mate:** solo en 4 cubiertas (Génesis, Salmos, Juan y Apocalipsis), con un degradado leve y un rayado al 9 % que nunca toca el texto.
- **Movimiento:** cambios de opacidad y desplazamientos de 2–5 px, en 150–250 ms. Con `prefers-reduced-motion` desaparecen las animaciones y los desplazamientos.

## Diferencias conocidas con el prototipo (decisiones justificadas)

| Diferencia | Por qué |
|---|---|
| Láminas: **Pedrería** va en Tipografía y Riso aparece con sus **dos variantes** en Color (9 piezas en total) | La entrega pide catalogar todos los acabados del motor sin perder ninguno. Una prueba comprueba que los 8 estén en alguna colección |
| La barra de selección tiene 5 colores y «Más» | La app real tiene 5 colores y más acciones que el mock; se aplicó divulgación progresiva |
| La barra del lector suma selector de versión, paralela, voz y cinta | Son funciones existentes que el mock no tenía |
| Se agregó un botón **Ajustes** en la cabecera | Sin él, versiones, idioma y respaldo quedaban inaccesibles |
| «Amén» es texto (sin sello ΧΡ) | El ΧΡ decorativo fue rechazado antes; la función de marcar leído se conserva |
| Progreso sin porcentajes (cuenta de capítulos) | La entrega prohíbe porcentajes y rachas |
| La navegación de la cabecera sigue visible entre 761 y 1080 px | En el mock, en ese rango no había ninguna navegación |
| La lámina del inicio se dibuja en vivo | No se copiaron los JPG del mock al repositorio |

## Pruebas

`node pruebas/navegador.mjs <carpeta>`: **25 de 25 pasos en verde, sin errores de consola**, tanto en `npm run dev` como en la versión web compilada (`WEB=1 npx vite build` + `vite preview`).

- **Los 21 pasos originales**, adaptados solo donde el flujo cambió legítimamente:
  - el inicio ya no tiene portada;
  - «Ir a» ahora es Ctrl K;
  - los selectores de versión pasaron a la barra del lector;
  - el tema se cambia desde el lector.
- **Pasos nuevos:**
  1. Inicio con marca nítida (`filter` y `text-shadow` en `none`), tres entradas, sin fotos, y la biblioteca con 66 libros (y 27 en el filtro NT).
  2. Guardar en Mi archivo, filtrar (Guardados y Notas) y volver al pasaje desde una nota.
  3. Láminas: índice neutro (sin arte), luego Color (4 piezas), luego volver al índice, y comprobar que todos los acabados del motor estén en alguna colección.
  4. Modo Calma: sin cabecera ni barra; Esc para salir.
  5. Móvil a 390 y 320 px: inicio, biblioteca, lector, archivo y láminas sin desbordes horizontales.
- También se verifica que el guardado sobrevive a recargar (además de subrayados y notas) y que el modo oscuro afecta solo al lector.
- **Capturas reales** en 1440, 1280, 768 y 390 px: `imagenes/G-integracion-white-industrial/`.

## Cómo probarlo

```bash
git checkout diseno/white-industrial
npm install
npm run dev                       # http://localhost:1420
node pruebas/navegador.mjs /tmp/capturas    # con npm run dev en marcha
npm run tauri dev                 # app de escritorio (requiere Rust)
```

## Pendiente o fuera de alcance

- **Aprobación del dueño** para fusionar en `main`. Eso publica la web automáticamente.
- **Aprobación para compilar instaladores.** Conviene usar **v0.10.0**, porque v0.9.0 fue una versión revertida.
- **`npm run tauri dev/build` no se ejecutó en este entorno.**
  - El código Rust no cambió y la interfaz es la misma que se probó en la web.
  - Igual hay que abrirla en Mac y Windows reales.
- **La NTV real no se puede probar desde aquí**: la API de Tyndale está bloqueada en este entorno; las pruebas la simulan.
- **Instalador e ícono** siguen con el logotipo Aura y el ΧΡ. La entrega dice que el cambio requiere una evaluación aparte; no se usaron los modelos del estudio 09.
- **Guía de marca** (página en claude.ai) y `marca/LEEME.md`: describen la marca anterior.
- **Revisión manual pendiente:**
  - zoom al 200 %;
  - lector de pantalla (VoiceOver, NVDA).
  - El contraste ya se calculó.
- **El «modo fotográfico editorial»** queda fuera de alcance; no está aprobado.
- **Los documentos 03 y 04 de esta carpeta** describen el diseño anterior. Este documento manda en lo visual.
