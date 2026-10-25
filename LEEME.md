# Chi-Ro Heirs

Lector bíblico personal, ligero y local. Tiene la NTV y la NLT desde la API oficial de Tyndale, versiones de dominio público que funcionan sin conexión, subrayado, notas enlazadas, estudio de palabras, referencias cruzadas, memorización y pósteres de versículos.

> *«Y si hijos, también herederos; herederos de Dios y coherederos con Cristo».* Romanos 8:17

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
| Inicio | Portada con el versículo del día como cartel; al tocarla, un menú con buscador de libros y pasajes, «continuar leyendo», tus cintas y una estantería con los 66 libros como lomos que se llenan de rojo al leerlos |
| Versiones | **NTV** y **NLT** en línea (API oficial de Tyndale). **RV1909, RV1865, BSB, KJV** dentro de la app, sin conexión |
| Lectura | Portadilla de cada libro, temas Cuero y Papel, modo lector sin números, texto corrido, Literata o Atkinson Hyperlegible, vista paralela |
| Subrayado | 5 colores de marcador, anclados a la referencia: lo que subrayas en la NTV aparece también en la RV1909 |
| Notas | Tipos (observación, pregunta, aplicación, oración), `#etiquetas`, referencias que se vuelven enlaces y retroenlaces («mencionado en otras notas») |
| Estudio de palabra | Toca una palabra: concordancia, mapa por libros, diccionario RAE, interlineal, Blue Letter Bible; Strong para versiones en inglés |
| **Interlineal** | Hebreo (AT) y griego (NT) palabra por palabra: transliteración, traducción literal (en español para el griego), número Strong, gramática explicada, definición de los léxicos BDB y Abbott-Smith, y todos los versículos donde aparece cada palabra original |
| Idiomas | Interfaz en español o inglés (Ajustes → Idioma) |
| Referencias cruzadas | Unas 159 000 de OpenBible.info, ordenadas por votos |
| Búsqueda | Instantánea y sin acentos, en toda la Biblia, en un testamento o en un libro |
| Hábito | Sello AMEN al terminar un capítulo, cuadrícula de cobertura de los 1189 capítulos (sin rachas), cintas marcapáginas |
| Memoria | Versículos que se desvanecen palabra a palabra, con repaso espaciado |
| Póster | Imagen 1080×1350 estilo cartel en tres acabados: Cuero, Papel y Lacre |
| Voz | Lectura en voz alta con las voces del sistema |
| Respaldo | Exportar e importar todo en un JSON legible |

**Atajos de teclado:**
- `Ctrl/⌘ K` o `/`: ir a un pasaje o buscar.
- `←` `→`: capítulo anterior o siguiente.
- `Esc`: quitar la selección.
- `Mayús` + clic: seleccionar un rango de versículos.

## NTV: clave gratuita

La app funciona desde el principio con la clave de prueba de Tyndale (hasta 500 consultas al día). Para subir el límite a 5000:

1. Regístrate en [api.nlt.to](https://api.nlt.to/).
2. Pega tu clave en **Versiones → Clave de la API de Tyndale**.

Por la licencia, el texto de la NTV y la NLT no se guarda en disco: se pide al leer y vive en memoria mientras la app está abierta.

## Marca

Logos y recursos en [`marca/`](marca/). Guía de marca completa: https://claude.ai/artifact/V2rWgxXXhJef5VdWbXjq3w

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
herramientas/construir_datos.py   genera la base bíblica
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
- **Fuentes tipográficas:** Literata, Bodoni Moda, Pinyon Script, Anton, Archivo, Atkinson Hyperlegible Next y Noto Serif Hebrew, todas con licencia SIL Open Font License.
- **Estética:** inspirada en las Biblias de diseño editorial; nombre y emblema propios (el crismón ΧΡ es un símbolo cristiano del siglo IV, de libre uso).
