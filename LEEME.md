# Chi-Ro Heirs

Lector bíblico personal, ligero y local. Tiene la NTV y la NLT desde la API oficial de Tyndale, versiones de dominio público que funcionan sin conexión, subrayado, notas enlazadas, estudio de palabras, referencias cruzadas, memorización y pósteres de versículos.

> *«Y si hijos, también herederos; herederos de Dios y coherederos con Cristo».* Romanos 8:17

## Para quien siga el proyecto

La carpeta [`traspaso/`](traspaso/00-LEEME-PRIMERO.md) explica cómo se construyó la app, las decisiones creativas, qué aprobó y qué rechazó el dueño, y muestra todos los intentos con imágenes. Está pensada para que otra persona o IA continúe el trabajo.

## Probar en el navegador

Versión web de prueba, sin instalar nada: **https://xristoskidonis.github.io/chi-ro-heirs/**
Se actualiza sola cada vez que cambia `main` (tarda 2 o 3 minutos). La primera visita descarga unos 88 MB de Biblias; después quedan guardadas en el navegador. Tus notas y subrayados de la web viven solo en ese navegador, separados de los de la app de escritorio.

## Instalar (Mac y Windows)

1. Entra al repositorio en GitHub → **Releases** → la versión más reciente.
2. En «Assets», descarga:
   - **Mac:** el archivo `.dmg`. Ábrelo y arrastra **Chi-Ro Heirs** a Aplicaciones.
   - **Windows:** el archivo `…-setup.exe`.
3. **La primera vez**, el sistema avisa de que la app no está firmada por un desarrollador registrado (firmar cuesta 99 USD al año en Apple y es opcional para uso personal):
   - **Mac:** haz clic derecho sobre la app → **Abrir** → **Abrir**. Si no aparece esa opción, ve a Ajustes del Sistema → Privacidad y seguridad → «Abrir igualmente».
   - **Windows:** en el aviso azul de SmartScreen pulsa **Más información** → **Ejecutar de todas formas**.

Para generar una versión nueva: pestaña **Actions** → **Compilar instaladores** → **Run workflow**. En unos 15 minutos aparece en Releases.

## Qué incluye

| Función | Detalle |
|---|---|
| Inicio | La marca CHI—RO y tres entradas: Continuar leyendo, Biblioteca (los 66 libros como cubiertas tipográficas, con filtro y búsqueda) y Mi archivo (guardados, cintas, subrayados y notas en un índice) |
| Versiones | **NTV** y **NLT** en línea (API oficial de Tyndale). **RV1909, RV1865, BSB, KJV** dentro de la app, sin conexión |
| Portadillas | Opcional (Ajustes → Grabados): cada libro abre con un grabado de Gustave Doré a toda página. Puedes poner tu propia imagen; se guarda solo en tu equipo |
| Lectura | Lector claro (y oscuro a pedido), modo Calma sin barras, tamaño A−/A+, modo lector sin números, texto corrido, Literata o Atkinson Hyperlegible, vista paralela |
| Subrayado | 5 colores de marcador, anclados a la referencia: lo que subrayas en la NTV aparece también en la RV1909 |
| Notas | Tipos (observación, pregunta, aplicación, oración), `#etiquetas`, referencias que se vuelven enlaces y retroenlaces («mencionado en otras notas») |
| Estudio de palabra | Toca una palabra: concordancia, mapa por libros, diccionario RAE, interlineal, Blue Letter Bible; Strong para versiones en inglés |
| **Interlineal** | Hebreo (AT) y griego (NT) palabra por palabra: transliteración, traducción literal (en español para el griego), número Strong, gramática explicada, definición de los léxicos BDB y Abbott-Smith, y todos los versículos donde aparece cada palabra original |
| Idiomas | Interfaz en español o inglés (Ajustes → Idioma) |
| Referencias cruzadas | Unas 159 000 de OpenBible.info, ordenadas por votos |
| Búsqueda | Instantánea y sin acentos, en toda la Biblia, en un testamento o en un libro |
| Hábito | «Amén» al terminar un capítulo, cuadrícula de cobertura de los 1189 capítulos (sin rachas ni porcentajes), cintas por capítulo y versículos guardados |
| Memoria | Versículos que se desvanecen palabra a palabra, con repaso espaciado |
| Láminas | Cualquier versículo como fondo de pantalla (celular o computadora) o para compartir (post 4:5, historia 9:16). La galería abre con tres colecciones neutras, Tipografía (Aura, Primario, Pedrería), Color (Ultramar, Riso amarillo y verde, Calor) e Imagen (Aerosol, Grabado), y el color aparece solo al entrar |
| Voz | Lectura en voz alta con las voces del sistema |
| Respaldo | Exportar e importar todo en un JSON legible |

**Atajos de teclado:**
- `Ctrl/⌘ K` o `/`: buscar un libro, un pasaje o una palabra.
- `Esc`: quitar la selección, cerrar paneles o salir del modo Calma.
- `←` `→`: capítulo anterior o siguiente.
- `Mayús` + clic: seleccionar un rango de versículos.

## NTV: clave gratuita

La app funciona desde el principio con la clave de prueba de Tyndale (hasta 500 consultas al día). Para subir el límite a 5000:

1. Regístrate en [api.nlt.to](https://api.nlt.to/).
2. Pega tu clave en **Versiones → Clave de la API de Tyndale**.

Por la licencia, el texto de la NTV y la NLT no se guarda en disco: se pide al leer y vive en memoria mientras la app está abierta.

## Marca

Logotipo (estilo Aura, en modo claro y oscuro), monogramas y recursos en [`marca/`](marca/). Guía de marca completa: https://claude.ai/artifact/V2rWgxXXhJef5VdWbXjq3w

## Desarrollo

Requisitos: Node.js 22 o superior, Python 3, y Rust (solo para la app de escritorio).

```bash
npm install
npm run datos          # descarga los textos abiertos y crea datos/biblias.db
npm run dev            # versión navegador en http://localhost:1420
npm run tauri dev      # app de escritorio
npm run tauri build    # instalador para tu sistema
```

**Estructura:**

```
src/
  App.svelte              arranque, temas, atajos
  componentes/            Barra, Navegación, Lector, Estudio (+ pestañas), Acciones, diálogos
  lib/
    libros.js             66 libros, parser de referencias («jn 3:16», «1 cor 13»)
    bd.js                 SQLite: Tauri (nativo) o navegador (WebAssembly)
    biblia.js             versiones, capítulos, búsqueda FTS5, referencias, Strong
    nlt.js                cliente de la API de Tyndale (NTV/NLT)
    usuario.svelte.js     notas, subrayados, memoria, cintas, ajustes (usuario.db)
    ui.svelte.js          estado de la interfaz
src-tauri/                app de escritorio (Rust): copia biblias.db y registra los plugins
herramientas/construir_datos.py    genera la base bíblica
herramientas/preparar_grabados.py  prepara las portadillas (grabados de Doré)
herramientas/instalador.mjs        dibuja las imágenes de los instaladores
```

**Dónde viven tus datos:** en `usuario.db`, dentro de la carpeta de configuración de la app:
- Mac: `~/Library/Application Support/com.chiroheirs.lector/`
- Windows: `%APPDATA%\com.chiroheirs.lector\`

Cada fila guarda la fecha de cambio y una marca de borrado, ya preparada para la sincronización con iCloud (siguiente fase).

## Licencias y atribuciones

- **Código:** licencia [MIT](LICENSE). Puedes usarlo, modificarlo y compartirlo libremente.

- **NTV:** Texto bíblico tomado de la Santa Biblia, Nueva Traducción Viviente, © Tyndale House Foundation, 2010. Usado con permiso de Tyndale House Publishers, Inc., vía api.nlt.to, para uso personal no comercial.
- **NLT:** Holy Bible, New Living Translation, © 1996, 2004, 2015 by Tyndale House Foundation. Vía api.nlt.to.
- **RV1909, RV1865, KJV:** dominio público, vía [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases).
- **BSB:** Berean Standard Bible, dedicada al dominio público (CC0).
- **Referencias cruzadas:** [OpenBible.info](https://www.openbible.info/labs/cross-references/), CC BY.
- **Léxico Strong:** [Open Scriptures](https://github.com/openscriptures/strongs), CC BY-SA.
- **Interlineal hebreo y griego, léxicos:** [STEP Bible](https://www.stepbible.org) (Tyndale House, Cambridge), datos TAHOT, TAGNT, TBESH y TBESG, CC BY 4.0.
- **Grabados:** Gustave Doré, *La Grande Bible de Tours* (1866), dominio público, vía [Project Gutenberg](https://www.gutenberg.org/ebooks/8710) («The Doré Bible Gallery»). Se obtienen con el flujo «Traer grabados» y `herramientas/preparar_grabados.py`.
- **Fuentes tipográficas:** Inter Tight, DM Sans, Literata, Atkinson Hyperlegible Next y Noto Serif Hebrew (interfaz y lectura); Archivo, Fraunces y Pinyon Script (solo en las láminas). Todas con licencia SIL Open Font License.
- **Estética:** inspirada en las Biblias de diseño editorial; nombre y emblema propios (el crismón ΧΡ es un símbolo cristiano del siglo IV, de libre uso).
