# 13. Novedades de la v0.12.1 a la v0.14.1 (27 y 28 de octubre de 2026)

Qué se construyó después de la v0.12.0, versión por versión, con los archivos de cada función. Cada punto se revisó contra el código de la rama `diseno/white-industrial` (commit `8ad00d7`).

- El criterio del dueño en esta etapa está en [`12-criterio-reciente.md`](12-criterio-reciente.md).
- El diseño vigente está en [`11-integracion-white-industrial.md`](11-integracion-white-industrial.md).

## Versiones y releases

No todas las versiones se compilaron. Las que no tienen release quedaron incluidas en la siguiente.

| Versión | Commit | Release en GitHub | Qué trajo |
|---|---|---|---|
| v0.12.1 | `715f3c8` | No (va dentro de la v0.13.0) | Icono, logotipo e instaladores *white industrial*; sellos «Facto» |
| v0.13.0 | `c824e07` | Sí | Música grabada en el Ambiente; inicio con 5 entradas; palabra marcada al pasar el mouse; «Clave» sin círculo; trozo grande de las láminas visible y elegible |
| v0.13.1 | `c0b2458` | Sí | Parser de la NTV/NLT arreglado; láminas con el versículo entero por defecto |
| v0.13.2 | `e30ed95` | No (va dentro de la v0.14.0) | La NTV reintenta sola; botón «Reintentar»; paralela visible aunque falle |
| v0.14.0 | `ae048b7` | Sí | Voz con tres motores: equipo, natural con IA (Piper) y Biblia narrada (Bible.is) |
| v0.14.1 | `ab02069` | Sí (con `latest.json` firmado) | Actualizador automático |
| v0.14.2 | (ver Releases) | Sí | NTV sin versículos perdidos (pegados, unidos y omitidos), Biblia narrada en `4.dbt.io`, nada se choca en la interfaz (detector en Chromium y WebKit), Ambiente sin trabarse |

## v0.12.1: identidad *white industrial* en icono e instaladores

- **Icono de la app:** `CHI` / `—RO` apilado, tinta sobre blanco cálido.
  - Sale de `marca/png/icono-1024.png`, que dibuja `herramientas/marca.mjs`.
  - Todos los tamaños de `src-tauri/icons/` se regeneran con `npx tauri icon marca/png/icono-1024.png`.
- **Logotipos PNG:** horizontal y apilado, en tinta y en hueso, en `marca/png/`. Ver `marca/LEEME.md`.
- **Instaladores:** las imágenes del DMG (Mac) y del NSIS/MSI (Windows) en `src-tauri/instalador/`, dibujadas con `node herramientas/instalador.mjs`.
- Se **retiraron** el crismón ΧΡ del icono y el logotipo «Aura» de los instaladores. El dueño los había rechazado.
- **Sellos de Historia:** dicen «Facto / Probable / Se discute / Fake»; en inglés, «Fact / Likely / Debated / Cap».
  - Están en `src/lib/i18n.svelte.js` (claves `his.grado.*`).
  - El instalador también dejó de decir «firme».

## v0.13.0: música grabada de verdad y ajustes del lector

### Ambiente con música real

- **Qué cambió:** el Ambiente ya no genera sonido con un motor. Ahora toca **19 grabaciones reales** de Wikimedia Commons, en tres listas:
  1. **Piano** (7): Bach, Satie, Schumann y Chopin.
  2. **Himnos** (6): Sublime gracia, Santo santo santo, Más cerca oh Dios de ti, y otros.
  3. **Coral y cuerdas** (6): Bach, gregoriano, Händel, Pachelbel y Allegri.
- **Licencias:** dominio público, CC0, CC BY 3.0 y CC BY-SA 4.0. Cada pista muestra su crédito en la app.
- **Archivos:**

| Qué | Dónde |
|---|---|
| Lista de pistas (título es/en, autor, intérprete, licencia, enlace a Commons) | `src/lib/musica.js` |
| Motor del Ambiente (reproducción, anterior/siguiente, volumen, temporizador, bajar con la voz) | `src/lib/ambiente.svelte.js` |
| Interfaz del Ambiente | `src/componentes/dialogos/Ambiente.svelte` |
| Los MP3 | `public/musica/<id>.mp3` |
| Créditos completos | `public/musica/LICENCIAS.txt` |
| Herramienta que busca, recorta y nivela las pistas | `herramientas/traer_musica.py` |

- **Se eliminaron** la música generada, `src/lib/himnos.js` y las muestras de `public/sonidos/piano/`.
- Los **sonidos** (lluvia, chimenea, viento, olas) se siguen generando en la app.

### Otros cambios de la v0.13.0

- **Inicio con 5 entradas:** Continuar leyendo, Biblioteca, Mi archivo, Láminas e Historia (`src/componentes/Inicio.svelte`).
  - El dueño notó que el menú tenía 3 entradas y adentro había más secciones.
- **Palabra bajo el mouse:** se marca con la CSS Highlight API (`palabra-encima`). La que se toca queda marcada (`palabra-elegida`) y es la que usa «Estudiar». Está en `src/componentes/Lector.svelte`.
  - Antes la sugerencia de «Estudiar» parecía arbitraria.
- **Botón «Clave»:** ya no hereda el círculo de los botones de color.
- **Láminas:** en los acabados de letra enorme se ve qué trozo va en grande y se puede elegir otro con un toque. Está en `src/componentes/dialogos/Laminas.svelte` y `src/lib/laminas.js`.

## v0.13.1: la NTV ya no pega versículos

- **El error:** en la NTV/NLT, cuando un párrafo (`<p>`) empezaba en un versículo y terminaba en otro, el navegador no cerraba el `<verse_export>`. Los siguientes quedaban anidados dentro del primero, y ese primero se quedaba con el texto de todos. Por ejemplo, Apocalipsis 22:1 traía del 1 al 5.
- **El arreglo** (`src/lib/nlt.js`, función `porVerseExport`): se recorre el documento en orden y cada texto va al `<verse_export>` más cercano que lo contiene, nunca al de afuera.
- **La prueba** simula párrafos que cruzan versículos, como la API real (`pruebas/navegador.mjs`, función `falsaNLT`).
- ⚠️ **Ese arreglo no alcanzó con la API real.**
  - **Qué pasaba:** el 28 de octubre, con api.nlt.to real, Apocalipsis 22 salía con 14 versículos de 21. El texto del 3, 6, 10, 12, 14, 16 y 20 se pegaba al anterior.
  - **La causa:** el HTML real deja un `<p>` suelto al final de cada párrafo, y el siguiente `<p class="body">` abre dentro del `<verse_export>` del versículo nuevo. Al corregirlo, el navegador saca ese texto fuera de su `<verse_export>`.
  - **El arreglo (después de la v0.14.1):** `parsearNLT` ya no mira quién contiene a quién. Recorre el documento en orden y cada texto va al último versículo que empezó, por su `<verse_export>` o por su `<span class="vn">`. Quedó una sola función en vez de dos.
  - **Verificado con la API real (NTV y NLT, en memoria):** Génesis 1, Salmos 23, Mateo 5, Juan 3, Romanos 8, Hechos 2 y Apocalipsis 22, todos con sus versículos completos.
  - **La prueba simulada** ahora copia esa estructura y revisa que **cada** versículo traiga solo su texto. Con el parser anterior falla (17 versículos de 20).
- **Láminas:** por defecto llevan el **versículo entero**, con la letra del tamaño que quepa. Los trozos para letra enorme quedan como opción y nunca terminan en «de», «la» o «y».
  - Si el texto supera las 60 palabras (`ENTERO_MAX`, varios versículos), se propone un trozo.

## v0.13.2: la NTV aguanta cortes de conexión

- **Reintentos:** cada pedido a api.nlt.to se intenta **3 veces**: al momento, a los 0,7 s y a los 2 s (`pedirPasaje` en `src/lib/nlt.js`).
- **Si igual falla:** el lector muestra el error con un botón **«Reintentar»**.
  - Además, recarga solo el capítulo cuando vuelve internet (evento `online`, en `src/componentes/Lector.svelte`).
- **Paralela:**
  - Si falla la versión principal, se sigue leyendo la paralela.
  - Si falla la paralela, el aviso sale arriba con su propio «Reintentar» (`lector.paralelaNo`).
  - Antes desaparecía sin explicar por qué.

## v0.14.0: voz con tres motores

El dueño eligió «Las dos» opciones que se le mostraron (voz con IA y Biblia narrada), además de la voz del equipo. Se eligen en **Ajustes → Voz** (`src/componentes/dialogos/VozAjustes.svelte`). El ajuste es `motorVoz`, con los valores `sistema`, `natural` o `narrada`. El que lee está en `src/lib/voz.svelte.js`.

| Motor | Qué es | Archivo |
|---|---|---|
| **Voces del equipo** (`sistema`) | `speechSynthesis` del sistema, con selector de voz; las naturales primero | `src/lib/voz.svelte.js` |
| **Voz natural con IA** (`natural`) | Piper, en el propio equipo y sin internet después de bajarla | `src/lib/vozNeural.js` |
| **Biblia narrada** (`narrada`) | Audio grabado por personas, de Bible.is | `src/lib/narrada.js` |

### Voz natural con IA (Piper)

- **Voces:** 8 de `rhasspy/piper-voices` (Hugging Face), **solo las de licencia libre**: Apache 2.0, Unlicense, CC0, CC BY-SA 4.0 y dominio público. Se dejaron fuera las «no comerciales».
  - En español: Claude y Ald (México), Daniela (Argentina) y Dave (España).
  - En inglés: Kristin, John y Linda (EE. UU.) y Cori (Reino Unido).
- Cada modelo pesa entre 63 y 114 MB. **Se descarga una vez** y queda en IndexedDB (base `chiro-voces`).
- **Pronunciación:** eSpeak NG (vía piper-phonemize), con licencia **GPL**. Por eso **no va en el instalador**: se descarga aparte desde jsDelivr (`@diffusionstudio/piper-wasm@1.0.0`).
- **Inferencia:** ONNX Runtime Web 1.30.0 (MIT), que **sí** va incluido en la app.
- **Herramienta:** `herramientas/traer_voces.py` y la opción `voces` del workflow «Traer grabados» traen fichas y modelos de prueba a la rama `voces-fuente`.

### Biblia narrada (Bible.is)

- Usa la **API Bible Brain v4** de Faith Comes By Hearing, en `https://4.dbt.io/api`.
  - Hasta la v0.14.1 apuntaba a `4.dbp4.org`, un dominio que **no existe**. Con eso la Biblia narrada no podía funcionar nunca.
  - Se corrigió el 28 de octubre en `src/lib/narrada.js`, en el permiso HTTP (`src-tauri/capabilities/default.json`) y en la prueba.
  - Las rutas, los parámetros y los campos que lee la app se compararon con la especificación oficial (`https://4.dbt.io/open-api-4.json`).
- Cada usuario pega **su propia clave gratuita**. La página para pedirla está en `PAGINA_CLAVE`.
- Lista las Biblias en audio del idioma y, al leer, pide el audio del capítulo y sus marcas de tiempo. Así el texto marca el versículo que suena.
- Si la Biblia elegida no cubre el testamento, avisa (`narrada.noCubre`).

## v0.14.1: actualizador automático

- **Plugins:** `tauri-plugin-updater` 2.13.3 y `tauri-plugin-process` 2.4.0, con versión fija en `src-tauri/Cargo.toml`. En JavaScript son `@tauri-apps/plugin-updater` y `@tauri-apps/plugin-process`.
- **Cómo funciona** (`src/lib/actualizar.svelte.js`):
  1. Al abrir la app, 4 segundos después, busca `latest.json` en `https://github.com/XristosKidonis/chi-ro-heirs/releases/latest/download/latest.json`.
  2. Si hay una versión nueva, avisa abajo a la izquierda (`src/componentes/Actualizacion.svelte`).
  3. Con «Actualizar y reiniciar» descarga, verifica la firma, instala y reinicia.
  - **Nunca instala sin un toque.** Sin internet, al abrir no molesta.
- **En Ajustes → Actualizaciones** se puede buscar a mano o desactivar la búsqueda al abrir (ajuste `actualizarSolo`).
- **Firma:**
  - La clave pública está en `src-tauri/tauri.conf.json` (`plugins.updater.pubkey`).
  - La privada y su contraseña están en los secretos del repositorio `TAURI_SIGNING_PRIVATE_KEY` y `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. El dueño tiene copia. **Ningún agente la necesita ni debe pedirla.**
  - El workflow `.github/workflows/compilar.yml` se detiene con un aviso si faltan los secretos. Genera `latest.json` (`includeUpdaterJson`) y prefiere el instalador NSIS en Windows.
- **Release v0.14.1:** publicada con `latest.json`, `.dmg`, `-setup.exe`, `.msi`, `.app.tar.gz` y sus `.sig`.
- **Prueba de punta a punta:** solo se puede hacer cuando exista una versión posterior (v0.14.2) para actualizar desde la v0.14.1.

## Entorno local (Windows, 28 de octubre de 2026)

Primera sesión fuera de la nube, en la computadora del dueño.

- **Resultados:**
  - `npm ci`, `npm run datos` (`datos/biblias.db` de 174,6 MB) y las **32 pruebas** en verde.
  - `npx tauri dev` compiló (unos 4 min 30 s la primera vez) y abrió la ventana. El dueño confirmó que se ve bien.
- **Detalles de Windows:**
  - **Vite escucha en `localhost`** (IPv6), no en `127.0.0.1`. Las pruebas se corren con `DIRECCION=http://localhost:1420/`.
  - **Playwright global:** `PLAYWRIGHT_DIR` debe apuntar a la carpeta de `npm root -g`, terminada en `\`.
  - **Disco sin dueño de archivos:** si el repositorio está en un disco que no registra dueños (por ejemplo, F:), git da «dubious ownership». Se resuelve con `safe.directory`.
  - **Para la app de escritorio** hacen falta Rust (rustup) y Visual Studio Build Tools con C++.
  - **Ambiente trabado en «Cargando…» (corregido en la v0.14.2).** Al principio se lo atribuyó a tener `tauri dev` abierto: era un error. Volvió a pasar con la máquina ocupada (compilando Rust).
    - **La causa real:** si se tocaba «Siguiente» mientras la pista anterior arrancaba (`play()` pendiente), el fundido de entrada de esa pista cortaba el fundido de salida que esperaba «Siguiente», y su promesa nunca se cumplía.
    - **El arreglo** (`fundir()` en `ambiente.svelte.js`): un fundido nuevo da por terminado al anterior, y una pista reemplazada mientras arrancaba ya no lanza su fundido.
    - **La prueba** demora `play()` 0,4 s y toca «Siguiente» en ese momento. Con el código anterior se traba siempre; con el arreglo, nunca.

## Después de la v0.14.1: versículos que faltaban y controles que se chocaban (28 de octubre)

El dueño contó que un amigo, en **Mac**, buscaba versículos de la NTV que no aparecían y que algunos botones se chocaban.

### Versículos

Se barrieron con la API real 126 capítulos de la NTV (dos por libro), con el código de la app. Había tres causas:

| Causa | Ejemplo | Arreglo |
|---|---|---|
| Texto de un versículo pegado al anterior | Apocalipsis 22 | Parser en orden (ver la v0.13.1) |
| La traducción **une** versículos: `<span class="vn">20-21</span>` | Números 1:20-43 (faltaban 12) | `parsearNLT` entrega `{v: 20, hasta: 21}`. El lector muestra «20–21». Buscar el 21 lleva al bloque y lo deja elegido (`contiene()` en `Lector.svelte`). La paralela junta los dos de la otra versión |
| La traducción **no trae** el versículo (no está en los manuscritos más antiguos) | Mateo 17:21, Marcos 9:44 y 46, Hechos 8:37, Hechos 15:34 | `marcarOmitidos()` en `nlt.js` (solo si faltan 3 o menos) pone una línea tenue: «La NTV no incluye este versículo…» (`lector.omitido`). No se puede elegir y la voz la salta |

- **Tablas** (censos, listas): las celdas ya no se pegan («Simeón 59.300»).
- **La prueba** simula los tres casos y tiene un paso propio: «NTV: versículos unidos y omitidos».

### Controles que se chocaban

- **Detector nuevo: `pruebas/solapes.mjs`.**
  - Abre con clics 10 pantallas (inicio, biblioteca, lector, selección, estudio, ambiente, ajustes, archivo, láminas, historia) en 10 anchos, de 1360 a 380 px.
  - Busca controles visibles cuyas cajas o textos se pisan.
  - Se probó encimando botones a propósito, y los detecta.
  - Se corre con Chromium y con **WebKit** (el motor de la app en Mac): `node pruebas/solapes.mjs <carpeta> webkit`.
- **Lo que encontró**, igual en los dos motores:
  1. Con el **Estudio abierto** (~1100 px), la barra del lector no entraba en su columna: el selector de versión tapaba «GÉNESIS 01» y «Calma» quedaba bajo el panel.
  2. A **380 px**, el selector tapaba el nombre del libro.
  3. Con la **hoja del Estudio** (≤900 px), la barra de selección tapaba sus resultados.
- **Los arreglos** (`src/app.css`):
  - La barra se achica según el ancho de **su columna** (container queries), no el de la ventana. El capítulo nunca se encoge, y si igual no entra (WebKit viejo), los controles se deslizan de costado.
  - En celular se esconden «← Biblioteca» (está «Libros» abajo) y, en columnas angostas, el botón de tema (está en Ajustes).
  - Con el Estudio abierto en celular el botón dice «Estudio» subrayado (la hoja tiene su ✕).
  - La barra de selección se apoya **encima** de la hoja del Estudio.
- **Resultado:** sin choques en las 100 combinaciones, en Chromium y en WebKit.

### Pruebas en WebKit

- `MOTOR=webkit node pruebas/navegador.mjs <carpeta>` corre la suite con el motor de Mac: **33 de 33**, igual que en Chromium.
- Encontró que, sin Web Audio, el Ambiente se rompía entero. Ahora la música grabada suena igual y solo faltan los sonidos generados.
- «voz narrada (Bible.is simulado)» falló una vez en Chromium y pasó en las dos repeticiones: es intermitente, por tiempos de la simulación.

## Después de la v0.14.2: voz y diálogos (28 de octubre)

El dueño probó la v0.14.2 instalada: le gustaron las voces naturales argentina (Daniela) y española (Dave). No encontraba cómo darle play desde un versículo, y al pausar y seguir volvía a empezar.

- **«Escuchar» en la barra de selección** (`Acciones.svelte`): lee desde el versículo elegido. Mientras suena dice «Pausar».
- **Pausa con memoria** (`pausarLectura()` y `voz.pausa` en `voz.svelte.js`):
  - Al pausar se guarda el versículo que sonaba, y el play siguiente sigue desde ahí (lo relee desde su inicio).
  - Si se eligió otro versículo, empieza en el elegido; si se cambió de capítulo, desde el principio. Quitar la selección no cuenta como elegir otro.
  - El parlante de arriba dice «Seguir leyendo desde el versículo N».
  - La pausa no se guarda al cerrar la app.
- **Dos lecturas a la vez (voz del sistema):** `speechSynthesis.cancel()` avisa con un error un instante después. Si ya había empezado otra lectura, la vieja lo tomaba como «sigo». Ahora cada lectura tiene su propio interruptor (`vivo`). La prueba simula el aviso tardío; sin el interruptor, el versículo 5 suena dos veces.
- **Buscador y diálogos que no abrían o se cerraban solos** (`Buscador.svelte`, `Dialogo.svelte`):
  - El aviso `close` del `<dialog>` llega un instante después, y Chrome a veces junta dos en uno.
  - Por eso Ctrl K a veces no abría: 4 de 20 veces tras Esc, y 4 de 10 si se tocaba justo después de elegir un resultado.
  - Ahora Esc apaga el diálogo directamente (`oncancel`), y un aviso de cierre que llega con el diálogo ya reabierto se ignora.
  - Esta era la causa del fallo «intermitente» de la prueba de voz narrada.
- **Pruebas:** 34 pasos (uno nuevo de voz; el de Ctrl K repite la reapertura rápida). 34 de 34 en tres corridas de Chromium y una de WebKit. Detector sin choques.

## Orden de los botones: opción B (28 de octubre) ✅ APROBADO

El dueño pidió pensar «qué botones deberían estar realmente abajo y cuáles arriba». Se le mostraron maquetas sobre la app real: A, cambio mínimo; B, recomendada. **Eligió la B.**

- **Criterio:** arriba, lo del **capítulo** y cómo se lee; abajo, lo que se hace con los **versículos** que tocaste.
- **Arriba** (`LectorBarra.svelte`):
  - ← Biblioteca · capítulo ▾
  - **Versión ▾**: menú con «Versión» y «Comparar con» (la paralela). El botón muestra «NTV ∥ NLT» cuando hay paralela.
  - **Aa ▾**: tamaño, tema claro/oscuro, letra (Literata/Atkinson), notas al margen y modo Calma.
  - **▶ Escuchar**: el texto cambia a «Pausar» o «Seguir» según el estado.
  - Ambiente · cinta · **Estudio**.
- **Diferencia con la maqueta:** «Estudio» **se quedó arriba**, porque Progreso, Memoria, Notas y Buscar no dependen de tocar un versículo. Sacarlo dejaba esas pestañas sin entrada directa.
- **Abajo** (`Acciones.svelte`): colores y Clave · **▶ Escuchar desde aquí** («Escuchar» en ventanas de 1100 px o menos) · Guardar · Nota · Estudiar · Lámina · Más · ✕. En celular la ✕ va arriba a la derecha de la barra.
- **Los menús:**
  - Cuelgan de la barra entera, no de los controles, que se deslizan de costado y los recortarían.
  - Se cierran con Esc (`ui.menuBarra` en `App.svelte`) o tocando afuera. En celular se abren a lo ancho.
- **CSS:** se quitaron las reglas que escondían tamaño, paralela, tema y Calma en pantallas angostas (ahora están en los menús). En columnas de 760 px o menos, «Escuchar» queda solo con su ícono.
- **Pruebas:**
  - Las de versión, paralela, margen, Calma y tema abren su menú (función `menu()`). La de paralela verifica que el botón diga «RV1909 ∥ KJV».
  - El detector de choques revisa también los dos menús abiertos (12 pantallas).
  - Resultado: 34 de 34 en Chromium y WebKit, sin choques.

## Versión web con el diseño nuevo (28 de octubre)

- **El pedido:** el dueño preguntó si la app funciona en iOS. No hay app para iPhone: hace falta una cuenta de Apple Developer (99 USD al año) y pasar por TestFlight o la App Store. La alternativa es la versión web en Safari → «Agregar a pantalla de inicio».
- **El cambio:** con su aprobación se pasó `diseno/white-industrial` a **`main`** como avance directo (36 commits, sin conflictos). Desde entonces `web.yml` publica la web con todo lo nuevo; antes, la web mostraba el diseño viejo.
- **Antes de publicar:** se compiló la web en local (`WEB=1 npx vite build`, 241 MB, de los cuales `biblias.db` son 167 MB). Se probó servida en `/chi-ro-heirs/` (`vite preview` **con** `WEB=1`; sin esa variable sirve en `/` y nada carga): 34 de 34 en Chromium y WebKit.
- **Pendiente en iPhone (resuelto el mismo día, abajo):** la web dependía de la caché del navegador para la base y la tenía dos veces en memoria al abrir (unos 340 MB).

### La base queda guardada en la web (28 de octubre)

- **Huella de la base:** `vite.config.js` publica `biblias.version`, los primeros 16 caracteres del SHA-256 de `biblias.db`. En desarrollo la sirve el mismo middleware, que además manda `Content-Length` para `/biblias.db`.
- **Guardado** (`respuestaBiblias()` en `src/lib/bd.js`):
  - Guarda la base en la Cache API (`chiro-biblias`), con la clave `biblias.db?v=<huella>`, y borra las versiones viejas.
  - Pide `navigator.storage.persist()`.
  - Busca con `ignoreVary`, porque el servidor manda `Vary`.
  - Solo la vuelve a bajar si la huella cambió.
  - Sin Cache API, o sin huella, la baja como antes.
- **Memoria** (`copiarAlSqlite()`): copia la base por partes, directo a la memoria de SQLite (`wasm.alloc` y `heap8u().set`), sin tener el archivo y su copia a la vez. Pico de unos 170 MB en vez de 340.
- **Copia dañada:** si la copia guardada no sirve, por ejemplo porque se cortó al guardarse, se borra y se baja de nuevo, una sola vez. Hay un aviso en la consola.
- **Navegación privada:** ahí «guardar» no deja nada. La app lo nota en el primer recargo (ese recargo baja la base dos veces) y lo recuerda en `localStorage` (`chiro-biblias-sin-copia`, vence a los 7 días): desde ahí la baja una sola vez.
- **Comprobado:**
  - WebKit persistente, como Safari normal o la web en la pantalla de inicio: 1 bajada; al recargar 0; al cerrar y reabrir el navegador 0.
  - Una copia dañada a propósito se recupera.
  - La suite (34 pasos) lo verifica en Chromium y, en WebKit efímero, el comportamiento del modo privado.
- **«Más» en el iPhone:** en celular, «Estudiar» ya no muestra la palabra entre comillas (sigue marcada en el texto), así «Más» no se cae a una tercera línea.
- ⚠️ **Incidente (web caída unos 30 minutos):**
  - **El error:** la primera publicación de esto (`780b281`) reservaba la memoria según `Content-Length`. GitHub Pages manda `biblias.db` comprimida con gzip, así que esa cabecera dice 75 MB mientras llegan 175. La web mostraba «No se pudo abrir. La base de datos bíblica llegó más larga de lo esperado».
  - **Por qué no se detectó antes:** las pruebas locales (`vite dev` y `vite preview`) no comprimen, y `curl -I` no pide compresión.
  - **El arreglo** (`9d81cc1`): `biblias.version` es «huella tamaño», y la app reserva el tamaño real. Nunca usa `Content-Length`.
  - **Regla desde ahora:** antes de pasar a `main`, probar la web compilada con un servidor que comprima como Pages (en esta sesión se usó un servidor Node con gzip que sirve `dist/` en `/chi-ro-heirs/`) y revisar la web publicada después del despliegue.

## Pendientes sin verificar en el mundo real

| Pendiente | Por qué falta |
|---|---|
| Actualizador de punta a punta | Hace falta publicar una v0.14.2 para actualizar desde la v0.14.1 |
| ~~Apocalipsis 22 en la NTV real, sin versículos pegados~~ | Verificado el 28 de octubre con la API real: el arreglo de la v0.13.1 no alcanzaba y se corrigió de nuevo (ver la v0.13.1). Falta que llegue a una versión publicada |
| Bible Brain con una clave real | La URL base estaba mal (`4.dbp4.org` no existe) y se corrigió a `4.dbt.io`. Responde 401 con una clave falsa, como se espera. Falta probar con una clave real: la lista de Biblias, el audio y las marcas de tiempo |
| Descarga real de las voces (Hugging Face y jsDelivr) en la app de escritorio, y que el audio arranque bien en Mac (WebKit) | **Probado el 28 de octubre en Chromium con el código de la app:** la voz Ald (México) más el motor bajaron de verdad (unos 82 MB en 10 s), quedaron en IndexedDB y sintetizaron un versículo en 2,6 s. earshot lo reconoce como voz hablada, sin saturación. Hugging Face y jsDelivr aceptan CORS desde `http://tauri.localhost` (Windows), `tauri://localhost` (Mac), la web y `localhost:1420`. **Falta:** probarlo dentro de la app instalada y en Mac |
| «error sending request» al pedir la NTV en Windows | Es el mensaje del plugin HTTP de Tauri cuando el pedido no llega (DNS, TLS o red). Desde la v0.13.2 se reintenta 3 veces. Vigilar si se repite |
