# 8. Arquitectura técnica

> **Actualizado a la v0.14.1 (28 de octubre de 2026)** en el stack, el tamaño de la base y las pruebas.
> - La **estructura de carpetas** de abajo es la de la v0.8.
> - Los componentes del diseño *white industrial* están en el documento 11.
> - Los archivos nuevos de la v0.12.1 a la v0.14.1 (música, voz, Biblia narrada y actualizador) están en el documento 13.

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| App de escritorio | **Tauri 2** (Rust), con los plugins sql, fs, dialog, http, opener, **updater** (2.13.3) y **process** (2.4.0) | 2.12 |
| Voz natural | **ONNX Runtime Web** (MIT), incluido en la app; eSpeak NG (GPL) se descarga aparte | 1.30.0 |
| Interfaz | **Svelte 5** (runes: `$state`, `$derived`, `$effect`) | 5.57 |
| Empaquetador | **Vite** | 8.3 |
| Datos | **SQLite** con FTS5: nativo en Tauri; `@sqlite.org/sqlite-wasm` en el navegador | 3.54 |
| Pruebas | **Playwright** (Chromium) | — |
| Herramientas | Node 22, Python 3 (construcción de datos y grabados) | — |

- **Identificador de la app:** `com.chiroheirs.lector`.
- **Nombre:** «Chi-Ro Heirs».
- **Versión en `package.json`, `tauri.conf.json`, `Cargo.toml` y `Cargo.lock`:** 0.14.1. Al publicar se suben las cuatro.

## Estructura de carpetas

```
src/
  App.svelte               arranque, temas, atajos, pantalla de arranque
  app.css                  TODO el CSS (tokens, temas, componentes); ~500 líneas densas
  componentes/
    Inicio.svelte          portada (versículo del día) + menú (saludo, buscador, tarjetas, galería de láminas, estantería)
    Barra.svelte           barra superior del lector (logo, «Ir a», versión, paralelo, íconos)
    Navegacion.svelte      panel izquierdo: libros y capítulos
    Lector.svelte          texto del capítulo, portadilla (Frontis), «Marcar», AMEN
    Frontis.svelte         portadilla con grabado de Doré y nombre del libro en caligrafía; «Usar mi imagen»
    Estudio.svelte         panel derecho con pestañas
    estudio/               Palabra, Original (interlineal), Notas, Comparar, Referencias, Buscar, Distribucion, Memoria, Progreso
    Acciones.svelte        barra de acciones al seleccionar versículos (colores, nota, lámina, etc.)
    dialogos/              Ajustes, Laminas (estudio de láminas), Respaldo, Versiones
    Emblema.svelte         monograma ΧΡ en SVG (todavía en el ícono del celular y en el AMEN)
    Icono.svelte, Dialogo.svelte
  lib/
    libros.js              66 libros, nombres es/en, parser de referencias («jn 3:16», «1 cor 13», «sal23»)
    bd.js                  abre SQLite (Tauri o WebAssembly); en la web, descarga biblias.db de BASE_URL
    biblia.js              versiones, capítulos, búsqueda FTS5, referencias, Strong, interlineal
    nlt.js                 cliente de api.nlt.to (NTV/NLT), caché solo en memoria
    usuario.svelte.js      estado del usuario y usuario.db
    ui.svelte.js           estado de la interfaz (pantalla, panel, diálogos, lámina abierta)
    i18n.svelte.js         textos de la interfaz en español e inglés (función t('clave'))
    laminas.js             motor de láminas (Canvas 2D); ver 05-laminas.md
    grabados.js            libro → lámina de Doré, con título y pasaje
    versiculosDelDia.js    lista de versículos de la portada, con sus palabras clave es/en
    morfologia.js          gramática explicada del interlineal
    voz.svelte.js          lectura en voz alta (speechSynthesis)
    archivos.js            exportar e importar
public/
  fuentes/                 woff2 (licencias OFL en LICENCIAS.txt)
  grabados/                65 láminas de Doré en webp (~11 MB), dore-NNN.webp
  img/icono-192.png, icono-180.png   favicon e icono de pantalla de inicio
src-tauri/                 Rust: copia biblias.db a la carpeta de datos y registra los plugins; instalador/ (imágenes del DMG y NSIS/MSI)
herramientas/
  construir_datos.py       descarga los textos abiertos y crea datos/biblias.db
  preparar_grabados.py     procesa los grabados de Gutenberg (820 px, autocontraste, webp q58)
  instalador.mjs           dibuja con Playwright las imágenes de los instaladores
  marca.mjs                genera el icono y el logotipo nítido CHI—RO (PNG) en marca/png
marca/                     monogramas ΧΡ (svg/png), sello, logotipo Aura (png), LEEME.md
pruebas/navegador.mjs      prueba funcional de 21 pasos
.github/workflows/
  compilar.yml             instaladores de Mac (universal) y Windows → Releases (a mano o con una etiqueta v*)
  web.yml                  versión web → GitHub Pages en cada push a main
  grabados.yml             trae las láminas de Gutenberg a la rama grabados-fuente
```

## Datos

### `biblias.db` (solo lectura, unos 175 MB desde la v0.11.0; se genera con `npm run datos`)

| Tabla | Contenido |
|---|---|
| `versiones` | 15 versiones sin conexión desde la v0.11.0. En español: RV1909, PDT, VBL, BES y RV1865. En inglés: BSB, WEB, FBV, BBE, LSV, KJV, ASV, YLT, Darby y Ginebra 1599 (dominio público o Creative Commons; ver `LEEME.md`) |
| `versiculos` + `versiculos_fts` | Texto con índice FTS5 sin acentos |
| `refs` | Unas 159 000 referencias cruzadas de OpenBible (≥3 votos, máximo 12 por versículo) |
| `strong` | Léxico Strong (Open Scriptures) |
| `interlineal`, `lexico` | STEPBible TAHOT/TAGNT (palabra por palabra) y léxicos TBESH/TBESG (BDB y Abbott-Smith) |

**La NTV y la NLT no están en la base:** por los términos de Tyndale se piden a api.nlt.to al leer y viven solo en memoria. La app trae la clave de prueba (500 consultas al día); el usuario puede pegar la suya (5000).

### `usuario.db` (los datos de la persona)

- Tablas: `subrayados`, `notas`, `memoria`, `leidos`, `cintas`, `portadas` (imágenes propias de portadilla, como data URL) y `ajustes`.
- Cada fila tiene `actualizado` y `borrado`, ya preparada para sincronizar.
- **Ubicación:**
  - Mac: `~/Library/Application Support/com.chiroheirs.lector/`
  - Windows: `%APPDATA%\com.chiroheirs.lector\`
  - Web: el `localStorage` del navegador (kvvfs de sqlite-wasm), separado de la app de escritorio.
- **Anclaje:** todas las anotaciones usan la referencia canónica `libro.capítulo.versículo` (Juan 3:16 = `43.3.16`), nunca la versión.

**Ajustes iniciales:**

| Ajuste | Valor |
|---|---|
| `idioma` | `es` |
| `mostrarInicio` | `true` (portada y menú al abrir) |
| `grabados` | `true` (portadillas) |
| `version` | `NTV` |
| `tema` | `cuero` |

## Cómo correrla

```bash
npm install
npm run datos           # crea datos/biblias.db (Python 3)
npm run dev             # navegador en http://localhost:1420
npm run tauri dev       # app de escritorio (necesita Rust)
npm run tauri build     # instalador local
```

- **Versión web:** `WEB=1 npx vite build`. Usa `base: '/chi-ro-heirs/'` y copia `biblias.db` a `dist`.
- **Publicación web:** automática en cada push a `main` (`web.yml`), en 2 o 3 minutos. URL: https://xristoskidonis.github.io/chi-ro-heirs/
- **Instaladores:** pestaña Actions → «Compilar instaladores» → Run workflow (unos 15 minutos), o con una etiqueta `v*`. Salen en Releases. **La app no está firmada:**
  - Mac: clic derecho → Abrir.
  - Windows: «Más información» → «Ejecutar de todas formas».

## Pruebas

```bash
npm run dev &                               # en otra terminal
node pruebas/navegador.mjs <carpeta-capturas>
DIRECCION=http://127.0.0.1:4173/ node pruebas/navegador.mjs <carpeta>   # contra la versión compilada
```

> **Hoy son 32 pasos**, todos en verde en la v0.14.1, y no debe haber errores de consola. Lo nuevo:
> - Mi archivo, clave de colores y modo margen;
> - Ambiente con música grabada;
> - voz narrada (simulada), Historia, Láminas por colecciones y modo Calma;
> - interfaz en inglés, versiones con sus licencias y móvil a 390 y 320 px.
>
> En Windows, Vite escucha en `localhost` y no en `127.0.0.1`: hay que correrlas con `DIRECCION=http://localhost:1420/`. La lista de abajo es la original de 21 pasos.

Los 21 pasos originales eran:

- portada y menú (66 lomos);
- portadilla de Génesis con NTV simulada;
- «Ir a» Jn 3:16;
- tocar una palabra;
- subrayar;
- concordancia;
- nota con retroenlace;
- el subrayado aparece en otra versión;
- paralelo;
- búsqueda de frase;
- referencias cruzadas;
- comparar;
- memorizar;
- cinta y AMEN;
- progreso;
- **lámina en los ocho acabados**;
- persistencia al recargar;
- interlineal griego y hebreo;
- inglés;
- tema Papel.

Las capturas de `imagenes/C-…` (`C12`–`C23`) salen de esta prueba. **La API de Tyndale se simula**, porque el entorno del agente no tenía acceso; los textos «texto de prueba NTV…» de las capturas son simulados.

## Decisiones técnicas que conviene conocer

- **Canvas sin filtros CSS:** WebKit (Safari y la app en Mac) no aplica `ctx.filter`. Todo efecto de las láminas se calcula a mano.
- **Fuentes condensadas:** Archivo variable con el eje `wdth`. Si `font-stretch` no funciona en canvas, se comprime con `scale` (`condensada()` en `laminas.js`).
- **Tipografía por zonas:** la opción C se aplica redefiniendo variables CSS en `.menu-inicio` (`--f-ui`, `--f-titulo` y `--f-texto` pasan a Inter Tight). Para llevarla al resto de la app basta con cambiar las variables globales en `:root` y revisar los usos de `--f-titulo` (Bodoni).
- **El logo** es texto (`<span class="marca-caligrafia">Chi-Ro Heirs</span>`), no una imagen. Se ve nítido a cualquier tamaño.
- **Los grabados** viajan dentro de la app. En el DMG universal van dos veces (Intel y ARM), por eso pesa unos 63 MB.
- **Portadillas propias:** la imagen del usuario se guarda como data URL en `usuario.db` y nunca sale de la computadora. Así se pueden usar imágenes de Pinterest sin problemas de distribución.

## Limitaciones conocidas

- La NTV real no se pudo probar desde el entorno del agente: el formato de la API se programó según la documentación y se probó con respuestas simuladas. Además, puede que la API de Tyndale no acepte pedidos desde la web (CORS); en ese caso, en la versión web la NTV no carga y hay que usar la RV1909.
- El agente no pudo abrir la URL de GitHub Pages (su red la bloqueaba); se probó la misma compilación en local.
- Los instaladores no se vieron en un Mac ni en un Windows reales; las imágenes del DMG y del NSIS se simularon.
  - Desde la v0.10 el dueño instala y prueba la app en **Windows**.
  - El 28 de octubre de 2026 `npx tauri dev` se compiló y abrió en su Windows (documento 13).
  - **Mac sigue sin probarse.**
