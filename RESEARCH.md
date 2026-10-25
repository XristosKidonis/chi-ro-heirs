# Research: lector bíblico personal (octubre de 2026)

Hecho con 5 investigaciones en paralelo: mercado, licencias y APIs, tecnología, diseño e identidad, e IA. Marcas: **[V]** verificado con fuente, **[I]** inferencia.

**Límites:** desde mi entorno estaban bloqueados Reddit, varios sitios de editoriales y la web de Holy Saints. Casi todo sale de resultados de búsqueda y de repositorios de GitHub. Lo que conviene comprobar a mano está en la sección 8.

---

## 1. Hallazgos que cambian el plan

| # | Hallazgo | Impacto |
|---|---|---|
| 1 | **La API oficial de Tyndale (api.nlt.to) ya sirve la NTV** (`version=NTV`), además de NLT y KJV. Con una clave gratuita, para uso no comercial: 500 versículos por petición y 5000 peticiones al día [V] | La NTV se puede leer **legalmente** desde la fuente oficial. Es justo el uso personal que planeas |
| 2 | Esos términos **no permiten guardar la NTV completa offline**. Para eso hace falta permiso escrito de Tyndale [V/I] | La NTV funciona con internet y una caché de la sesión. Conviene escribir a Tyndale para pedir permiso de caché personal. Mientras tanto, hay versiones libres para el uso offline |
| 3 | **bolls.life no tiene licencia demostrable** para las versiones con copyright [V] | Se descarta como fuente de NTV, RVR1960 o NVI |
| 4 | Stack recomendado para 2026: **Tauri 2.12 + Svelte 5 + SQLite con FTS5** [V] | Cambia la base técnica del prototipo: de HTML suelto con IndexedDB a una app de escritorio real de unos 5 MB, con el mismo código reutilizable en celular |
| 5 | Sincronización sin servidor: **un archivo de cambios por dispositivo** dentro de tu carpeta de iCloud, Dropbox u OneDrive [V/I] | Sincronización gratis, sin cuentas nuevas y sin conflictos |
| 6 | **STEPBible-Data** (Tyndale House Cambridge, CC BY) supera ampliamente al Strong de 1890 [V] | Mejor estudio de palabras hebreas y griegas |
| 7 | El nombre **«Chi Ro» tiene conflictos**: Chiro es un movimiento juvenil belga con más de 100 000 miembros, en las tiendas «chiro» es quiropráctica, y en Ecuador «estar chiro» significa no tener dinero [V] | **Crismón** queda como nombre principal |
| 8 | YouVersion **se niega a poner un chatbot**: su CEO dice que la IA cita mal la Escritura entre un 15 % y un 60 % de las veces [V]. Un estudio de Cambridge (enero de 2026) encontró **sesgo teológico** en las apps con IA [V] | Confirma el enfoque de IA delimitada: la búsqueda no genera texto y cada cita se verifica contra la base |

---

## 2. Mercado y lectores reales

### Panorama (resumen)

| App | Fuerte en | Débil en | NTV |
|---|---|---|---|
| Logos | Biblioteca profunda; IA que cita sus fuentes (Study Assistant) | Suscripción desde 2024, muy pesada, curva de aprendizaje | Sí, de pago |
| Accordance | Lenguas originales; sincronización (v14.1) | Sin IA | **No** |
| YouVersion | Gratis, más de 1.400 versiones, planes | Sin estudio profundo; dudas de privacidad | Sí |
| Bible Gateway | Muchas versiones | Anuncios; un solo color de subrayado en la app | Sí |
| Blue Letter Bible | Strong e interlineal gratis | Interfaz antigua | ? |
| AndBible | Libre, offline, sincroniza con Drive, IA opcional | Solo Android | No |
| Dwell | Audio de altísima calidad | Suscripción; en español solo NVI y RVR1960 | **No** |
| e-Sword / theWord / Xiphos | Gratis y offline | Anticuadas | ? |
| **Tov** | «Una Biblia sin ruido», minimalista, offline, código abierto | Solo BSB | No |

### Quejas más repetidas de los lectores [V]

1. La **sincronización falla** o tarda días.
2. **Se pierden o corrompen** subrayados y notas.
3. **No se pueden exportar** las notas.
4. Rechazo a las **suscripciones**.
5. Cobros sorpresa en las apps con IA.
6. **Anuncios** a mitad de la lectura.
7. Exceso de funciones nuevas.
8. **Rachas y notificaciones que generan culpa.**
9. **IA que cita mal**, sin opción de apagarla.
10. Programas **pesados**: Logos tarda horas en indexar.
11. **Falta la NTV** o no está disponible en tu región.
12. Privacidad.

### Huecos que tu app puede llenar [I]

- Un lector **ligero y bilingüe NTV + NLT**, igual de bueno en escritorio y en celular. No existe.
- **Notas que son tuyas:** formato abierto, exportables, local-first y con una sincronización que puedes comprobar. Responde a las quejas 1 a 3.
- **IA opcional y apagable** que siempre cita y verifica sus citas.
- Sin rachas, sin anuncios y sin redes sociales.

---

## 3. Contenido y licencias

### Traducciones

| Versión | Cómo usarla | Licencia |
|---|---|---|
| **NTV** (principal) | API oficial api.nlt.to con clave gratuita | © Tyndale. No comercial. Se pueden citar hasta 500 versículos; para más, permiso escrito |
| **NLT** (pareja en inglés) | La misma API | Igual que la NTV |
| RV1909, RV1865, KJV | Offline (ya incluidas) | Dominio público |
| **BSB** (Berean Standard Bible) | Offline | CC0 desde 2023 |
| WEB | Offline | Dominio público |
| Santa Biblia libre para el mundo | Offline (quitando los deuterocanónicos) | Dominio público |
| Versión Biblia Libre (VBL) | Offline | CC BY-SA 4.0 |
| Biblia en Español Sencillo | Offline | CC BY 4.0 |
| RVR1960, NVI, LBLA, NBLA, DHH | Solo en línea, vía una API con licencia (YouVersion Platform o API.Bible) | Copyright |

### Otras APIs con licencia

- **YouVersion Platform:** gratis, con licencias por editorial. No confirmé si incluye NTV.
- **API.Bible:** plan gratuito con hasta 3 Biblias con copyright; caché permitida si se refresca cada 30 días.

### Audio

- **Bible Brain** (Faith Comes By Hearing): clave gratuita y marcas de tiempo por versículo, lo que permite resaltar el versículo mientras suena. Hay al menos 5 versiones en español. **Audio NTV: poco probable** [I].
- **Respaldo:** la voz del sistema (Web Speech), o voces neuronales offline en español (Piper vía sherpa-onnx, unos 60 MB por voz).

### Recursos de estudio abiertos

| Recurso | Qué aporta | Licencia |
|---|---|---|
| **STEPBible-Data** (TAHOT, TAGNT, TBESH, TBESG, TIPNR) | Hebreo y griego con morfología, léxicos modernos y nombres propios | CC BY 4.0 |
| Referencias cruzadas OpenBible | Ya incluidas | CC BY |
| Geocodificación OpenBible | Mapas de lugares bíblicos | CC BY 4.0 |
| Theographic | Personas, lugares y cronología | CC BY-SA 4.0 |
| Comentarios en HelloAO (Adam Clarke, Tyndale Open Study Notes) | Comentarios offline | Dominio público / CC |

**No encontré ningún léxico en español con licencia abierta.** El etiquetado Strong de la RV1909 requiere pedir permiso a su autor.

---

## 4. Tecnología recomendada

| Capa | Elección | Por qué |
|---|---|---|
| Contenedor | **Tauri 2.12** | Instalador de unos 5 MB y unos 40 MB de RAM; móvil con el mismo código. Electron descartado por peso (más de 80 MB) |
| Interfaz | **Svelte 5 + Vite** | Muy ligero; permite migrar el prototipo poco a poco |
| Datos | **SQLite + FTS5** (plugin SQL de Tauri) | Búsqueda instantánea y sin acentos; concordancia nativa |
| Sincronización | Registro `.jsonl` por dispositivo en una carpeta de nube | Cero servidores; sin «copias en conflicto» |
| Búsqueda semántica | Embeddings precalculados (multilingual-e5-small o EmbeddingGemma) | Unos 12 MB por idioma; menos de 10 ms por consulta |
| Audio | Bible Brain + Web Speech; Piper opcional | Streaming con resaltado; respaldo offline |
| Móvil (fase 2) | Tauri móvil; **plan B: Capacitor 8** con la misma interfaz | El móvil de Tauri todavía es menos maduro que su escritorio |

**Dependencias para construir** (solo en tu PC; quien usa la app no instala nada):
- Rust (para compilar Tauri).
- Node.js 22 o superior.
- Python 3 (para los scripts de datos).

---

## 5. IA bien delimitada

### Qué valor aporta cada uso (de menor a mayor riesgo)

1. **Búsqueda por significado** («versículos sobre la ansiedad»). Solo devuelve versículos reales, sin generar texto. Riesgo prácticamente nulo.
2. Pasajes relacionados.
3. **Preguntas de reflexión** sobre lo que acabas de leer (método inductivo).
4. Resumen de un capítulo **ya leído**, con un versículo por frase.
5. Contexto histórico tomado solo de fuentes curadas.
6. Comparar traducciones y explicar las diferencias.
7. Preguntas libres sobre un pasaje: RAG, verificador y varias posturas si hay desacuerdo.

**Se evita:** «chatear con Jesús», generar oraciones y la consejería.

### Mecánica

1. Recuperar versículos en local.
2. Enviarlos al modelo como documentos con **citas activadas** (función oficial de la API de Claude). El texto citado sale de la fuente, no de la memoria del modelo.
3. Un verificador propio comprueba que cada referencia exista y que el texto coincida.

**Costo con la API de Claude** (precios oficiales verificados, octubre de 2026), unas 20 consultas al día:

| Modelo | Precio (entrada / salida por millón de tokens) | Costo aproximado al mes |
|---|---|---|
| Haiku 5.5 | 0,10 $ / 0,50 $ | **0,40 $** |
| Sonnet 5.5 | 2 $ / 10 $ | **8 $** |

La alternativa privada es Ollama con Gemma 4 en local: unos 3 GB y 16 GB de RAM.

**Detalle de licencia:** el índice semántico se construye con versiones libres (RV1909, BSB, WEB). La búsqueda devuelve referencias, y la NTV se muestra desde la API oficial.

### Constitución de la IA (12 reglas)

1. La Escritura habla primero: el texto bíblico mostrado sale siempre de la base, nunca de la memoria del modelo.
2. Toda afirmación lleva una fuente.
3. No inventar nada. Ante la duda: «no hay fuente suficiente».
4. No imponer doctrina. Si hay desacuerdo, mostrar dos o más posturas con su tradición, sin dar un veredicto.
5. Separar visualmente qué dice el texto, qué contexto aportan las fuentes y qué interpretaciones existen.
6. Primero preguntar, después explicar (y solo si lo pides).
7. Servir a la lectura, no sustituirla.
8. Alcance limitado a la Biblia, su contexto y su estudio.
9. Humildad pastoral: no es pastor ni consejero. Ante una crisis, remite a ayuda humana.
10. Transparencia: todo va etiquetado, con el modelo y las fuentes visibles, y la IA se puede apagar por completo.
11. Privacidad: tus notas no salen del dispositivo sin tu permiso.
12. El mismo criterio en español y en inglés, sin mezclar traducciones sin avisar.

---

## 6. Diseño e identidad

### Holy Saints y otras Biblias de diseño

- **Holy Saints:** vende *The Everyday Bible* (70 USD) y *The Centerpiece Bible* (150 USD), que serían los «dos formatos». Lenguaje de moda y *streetwear*, no de producto religioso. No pude confirmar qué traducción usan.
- **Patrón común de las Biblias de diseño** (Bibliotheca, ESV Reader's, Alabaster, Byble, Monochrome Bible):
  - una sola columna sin justificar;
  - números de versículo ocultos o muy sutiles;
  - márgenes amplios;
  - libros tratados como literatura.

### Lectura en pantalla

- **Medida y espaciado:** líneas de 60 a 70 caracteres, letra de 20 a 22 px en escritorio, interlineado de 1,5 a 1,6, sin justificar.
- **Tipografía:** **Literata** (hecha para Google Play Books, incluye griego) o Newsreader. EB Garamond rinde mejor en tamaños grandes.
- **Modo oscuro:** sin negro puro. Fondo #121110 con texto #E8E4DC, porque el negro puro causa halo en personas con astigmatismo.
- **Dislexia:** las fuentes «para dislexia» no funcionan en los estudios; **el espaciado sí**. Mejor ofrecer controles de espaciado y la fuente Atkinson Hyperlegible Next como opción.
- **Ideas de otras apps de lectura:**
  - de **Readwise**: todo con teclado y una paleta de comandos (Ctrl+K);
  - de **Tov** y las Reader's Bibles: un **modo lector** sin números;
  - de **Dwell**: audio con resaltado del versículo.

### Nombre

| | Crismón | Chi Ro |
|---|---|---|
| En español | Palabra real y culta, con eco del arte románico | Suena a error ortográfico de «Chi Rho» |
| Búsqueda | Limpia | Contaminada por quiropráctica y por el movimiento juvenil Chiro |
| Conflictos | La revista alemana *chrismon* y la marca CHRISMONS en EE. UU., ambas en otros idiomas y sectores | Chiro (Bélgica), apps de quiropráctica, jerga ecuatoriana |

**Recomendación:** **Crismón** como nombre, con el glifo **ΧΡ** como logo. «Chi Ro» puede quedarse como apodo. Falta una búsqueda formal de marcas (EUIPO, OEPM, USPTO).

### El emblema

- Dibujar el ΧΡ **como tipografía**, derivado de las letras de la serif del texto, con la panza de la Ρ abierta como en las monedas antiguas.
- Dos pesos: uno fino para la interfaz y uno macizo para el icono.
- Una versión en rojo lacre que funcione como sello.

### Momentos de firma (lo físico llevado a la pantalla)

1. **Dos cintas:** negra para «donde voy» y roja para «mi plan». Se arrastran para marcar.
2. **Portadilla de libro:** el título en caligrafía y un **grabado de Gustave Doré** (241 grabados de dominio público) con grano.
3. **«AMEN» al terminar un capítulo:** serif gigante con el sello ΧΡ en lacre. Un cierre ritual, no una medalla de juego.
4. **Canto rojo:** un filo en el borde de la pantalla que imita el canto teñido de una Biblia y muestra tu avance en el libro.
5. **Modo cartel:** comparte un versículo como póster en blanco y negro con un acento rojo.

---

## 7. Lo que ya está hecho y sigue sirviendo

Todo el trabajo previo es reutilizable:

- Los datos convertidos: RV1909, RV1865, KJV, referencias cruzadas y Strong.
- El parser de referencias.
- El sistema visual y las fuentes.
- El plan de funciones.

El paso a Tauri, Svelte y SQLite es una migración del prototipo, no empezar de cero.

---

## 8. Pendiente de verificar a mano (en tu computadora)

- [ ] Registrar una clave gratuita en api.nlt.to y probar `version=NTV`.
- [ ] Escribir a Tyndale para pedir permiso de caché offline personal de la NTV (permisos de Tyndale Español).
- [ ] Comprobar si la YouVersion Platform incluye la NTV.
- [ ] Búsqueda formal de la marca «Crismón».
- [ ] Revisar en Bible Brain qué audio en español está disponible y si se puede descargar.

---

## 9. Fuentes principales

- API NLT/NTV de Tyndale: https://api.nlt.to/Documentation
- Permisos de Tyndale: https://tyndale.com/permissions
- YouVersion Platform: https://developers.youversion.com/api/licenses
- API.Bible: https://api.bible/partners/tyndale
- Política de la API de Bolls: https://raw.githubusercontent.com/Bolls-Bible/bain/master/docs/API.md
- Licencias de eBible: https://raw.githubusercontent.com/BibleNLP/ebible/main/metadata/translations.csv
- Bible Brain: https://www.faithcomesbyhearing.com/bible-brain/license
- STEPBible-Data: https://github.com/STEPBible/STEPBible-Data
- Geocodificación OpenBible: https://github.com/openbibleinfo/Bible-Geocoding-Data
- Theographic: https://github.com/robertrouse/theographic-bible-metadata
- Tauri: https://github.com/tauri-apps/tauri/releases y https://v2.tauri.app/plugin/sql/
- Automerge 3: https://automerge.org/blog/automerge-3/
- Svelte: https://releases.sh/svelte/svelte-releases.md
- Citas erróneas de la IA según YouVersion: https://www.christianpost.com/news/ais-bible-misquotes-range-from-15-to-60-youversion-ceo.html
- Sesgo teológico de la IA (Cambridge, 2026): https://scripture-engagement.org/content/ai-bible-apps-and-theological-bias/
- IA de Logos: https://support.logos.com/hc/en-us/articles/35181728416397-How-Logos-uses-AI
- Hallow AI: https://hallow.com/blog/hallow-ai/
- Tipografía de Bibliotheca: https://support.bibliotheca.co/hc/en-us/articles/205369158-Notes-on-the-Typography
- Lectura accesible (WCAG): https://w3c.github.io/wcag/understanding/visual-presentation.html
- Fuentes para dislexia: https://dyslexiahelp.umich.edu/latest/does-dyslexie-font-help-dyslexic-readers/
- Movimiento juvenil Chiro: https://en.wikipedia.org/wiki/Chiro_Flanders
- Crismón: https://www.ecured.cu/Crism%C3%B3n
- Tov: https://apps.apple.com/app/id6482045395
- Quejas de lectores sobre apps bíblicas: https://unstar.app/blog/youversion-bible-gateway-olive-tree-logos-blue-letter-bible-apps-ranked-2026
