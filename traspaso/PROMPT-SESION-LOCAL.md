Vas a continuar el desarrollo de **Chi-Ro Heirs**, un lector bíblico de escritorio (Mac y Windows) y web, hecho con Tauri 2 + Svelte 5 (runas) + Vite. Lo venía haciendo otra sesión de Claude Code en la nube; ahora seguimos aquí, en mi computadora. Háblame siempre en español, simple y directo.

## 1. Prepara el entorno y verifica que todo funcione

1. Revisa que tenga instalado Git, Node.js 22, Python 3.12 y Rust (rustup). Si falta algo, dime qué instalar y cómo, paso a paso. No instales nada a nivel de sistema sin preguntarme.
2. Trabajamos en la rama `diseno/white-industrial` del repo `XristosKidonis/chi-ro-heirs`. Confirma que estás en esa rama y al día con `origin`.
3. Instala dependencias: `npm ci`.
4. Arma la base bíblica: `npm run datos` (corre `herramientas/construir_datos.py`; genera `datos/biblias.db`, unos 175 MB; tarda la primera vez).
5. Levanta la versión de navegador con `npm run dev` (puerto 1420) y, en otra terminal, corre las pruebas: `node pruebas/navegador.mjs <carpeta-para-capturas>`.
   - Playwright no está en `package.json`: instálalo global (`npm i -g playwright` y `npx playwright install chromium`).
   - Si no lo encuentra, define `PLAYWRIGHT_DIR` como dice el comentario al inicio de `pruebas/navegador.mjs`.
   - Son 32 pasos y hoy pasan todos. Si alguno falla, investiga antes de tocar nada.
6. Prueba la app de escritorio con `npx tauri dev` y dime si abre bien.

## 2. Lee el contexto antes de cambiar nada

- `LEEME.md` (qué incluye la app, licencias, cómo compilar, actualizaciones automáticas).
- La carpeta `traspaso/` completa, empezando por `00-LEEME-PRIMERO.md`, `03-gusto-del-usuario.md` y `10-reglas-para-agentes.md`.
- `marca/LEEME.md` (logo e identidad).

## 3. Actualiza `traspaso/` con lo que pasó desde la v0.12

La carpeta quedó atrás. Agrega o actualiza los documentos con este resumen, revisando el código para confirmar cada punto:

- **v0.12.1**: icono, logotipo e instaladores con la estética *white industrial*; los sellos de Historia dicen «Facto / Probable / Se discute / Fake» (en inglés «Fact / Likely / Debated / Cap»).
- **v0.13.0**: el Ambiente toca **música grabada real** (19 pistas de Wikimedia Commons, dominio público / CC0 / CC BY / CC BY-SA) en tres listas: Piano, Himnos, Coral y cuerdas. Créditos en `public/musica/LICENCIAS.txt`; datos en `src/lib/musica.js`; motor en `src/lib/ambiente.svelte.js`. Se eliminó la música generada. El inicio tiene 5 entradas. La palabra bajo el mouse se marca (CSS Highlight API) y la que se toca es la que usa «Estudiar». El botón «Clave» ya no sale con círculo. Láminas: se ve y se elige el trozo que va en grande.
- **v0.13.1**: arreglo del parser NTV/NLT (`src/lib/nlt.js`): cuando un `<p>` cruzaba versículos, el navegador anidaba los `<verse_export>` y el primero se quedaba con el texto de los siguientes (Apocalipsis 22:1 traía del 1 al 5). Ahora se recorre el documento en orden. Las láminas llevan el versículo entero por defecto.
- **v0.13.2**: la NTV reintenta sola (3 intentos), botón «Reintentar» y recarga al volver internet. Si falla la versión principal se lee la paralela; si falla la paralela, el aviso sale arriba.
- **v0.14.0**: Ajustes → Voz con tres motores:
  1. Voces del equipo (selector, las naturales primero).
  2. **Voz natural con IA (Piper)**, en `src/lib/vozNeural.js`: voces de licencia libre de `rhasspy/piper-voices` (Hugging Face), descargadas una vez y guardadas en IndexedDB. La pronunciación (eSpeak NG, **GPL**) se descarga aparte desde jsDelivr y NO va en el instalador. ONNX Runtime Web 1.30.0 (MIT) sí va incluido.
  3. **Biblia narrada por personas** (Bible.is / API Bible Brain v4), en `src/lib/narrada.js`, con clave gratuita del usuario.
  La interfaz está en `src/componentes/dialogos/VozAjustes.svelte`.
- **v0.14.1**: **actualizador automático** (tauri-plugin-updater 2.13.3 + tauri-plugin-process 2.4.0), en `src/lib/actualizar.svelte.js` y `src/componentes/Actualizacion.svelte`. Busca `latest.json` en GitHub Releases al abrir, avisa y se instala con un toque. Las actualizaciones van firmadas: la clave pública está en `src-tauri/tauri.conf.json`; la privada y su contraseña están en los secretos del repo `TAURI_SIGNING_PRIVATE_KEY` y `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (yo tengo copia; tú no la necesitas ni debes pedirla).

Cuando termines, haz un commit con esos cambios y súbelo a la rama.

## 4. Pendientes que quedaron sin verificar en el mundo real

- Confirmar que la release **v0.14.1** se publicó con su `latest.json` (Actions → «Compilar instaladores»). El actualizador solo se puede probar de punta a punta cuando exista una versión posterior (v0.14.2) para actualizar desde la v0.14.1.
- Que Apocalipsis 22 en la NTV real ya no pegue versículos (la sesión anterior no tenía acceso a api.nlt.to).
- Bible Brain con una clave real: la sesión anterior lo probó solo con respuestas simuladas. Puede que la URL base (`https://4.dbp4.org/api`) o el formato de respuesta necesiten ajustes.
- Descarga real de las voces desde Hugging Face y jsDelivr dentro de la app de escritorio (en especial en Mac/WebKit), y que el audio arranque bien en Mac.
- En Windows hubo una vez «error sending request» al pedir la NTV: vigilar si se repite.

## 5. Reglas de trabajo (importantes)

- Todo en español: textos de la app (con su traducción al inglés en `src/lib/i18n.svelte.js`), comentarios y mensajes de commit. Escribe el código como el que ya existe: nombres en español y la misma densidad de comentarios.
- No mezcles a `main` ni publiques la versión web sin que yo lo apruebe.
- **Publicar una versión crea una release pública: pregúntame siempre antes.** El proceso:
  1. Sube la versión en `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` y `src-tauri/Cargo.lock`.
  2. Si cambia el número mayor o menor, regenera el arte de los instaladores con `node herramientas/instalador.mjs`.
  3. Corre las pruebas, haz el commit y súbelo.
  4. Con mi «dale, publica la vX.Y.Z», lanza `gh workflow run compilar.yml --ref diseno/white-industrial`.
- El texto de la NTV/NLT no se puede guardar en disco (términos de Tyndale); solo en memoria.
- Nada de marca «Holy Saints». No uses imágenes de terceros sin licencia libre, ni copies `material-original-no-publicar/`. El logo es nítido (sin filtros ni manchas). Ya rechacé el icono ΧΡ y el logotipo «Aura».
- Antes de agregar una dependencia, usa versiones con al menos dos semanas de publicadas.
- Para traer material de internet que tu red no alcance, existe el workflow «Traer grabados» (`.github/workflows/grabados.yml`, entrada `que`: grabados, historia, musica o voces), que lo deja en ramas `*-fuente`.
- Prueba en el navegador lo que cambies antes de decir que está listo, y dime con honestidad qué no pudiste probar.

Empieza por el punto 1 y avísame cómo te fue antes de seguir.
