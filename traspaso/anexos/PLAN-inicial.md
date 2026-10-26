> **Nota del traspaso:** es el plan inicial del 25 de octubre de 2026 y está **en parte desactualizado**. Por ejemplo, habla de «HTML sin frameworks» (después se pasó a Tauri + Svelte), de Anton (eliminada) y de cintas (eliminadas). Vale como registro de las intenciones originales y de las 3 rondas de innovación. El estado real está en los documentos 01 a 10.

# Biblia Ligera: plan de construcción

Lector bíblico local, muy ligero, con varias versiones, subrayado, notas, estudio de palabras y conexión opcional a internet.

---

## Decisiones tomadas (25 de octubre de 2026)

| Tema | Decisión |
|---|---|
| Para quién | Uso personal. Más adelante, quizá se proponga a otros como complemento |
| Plataforma | **Computadora primero**; celular después, si se puede con el mismo código |
| Canon | Protestante (66 libros) |
| Traducción principal | **NTV** (Nueva Traducción Viviente). Tiene copyright de Tyndale: se obtiene vía una API con licencia y no se incluye en el paquete |
| Idiomas | Español e inglés |
| Sincronización | Sí, entre dispositivos |
| Audio | Deseable, si hay una fuente viable |
| IA | Sí, pero **bien delimitada**: sin inventar versículos, sin imponer doctrina y siempre citando |
| Identidad | Nombre e identidad **propios**, en torno al crismón (ΧΡ). Estética inspirada en Holy Saints, sin usar su marca |
| Nombre | **«Chi-Ro» + una segunda palabra** (idea: «Heirs», herederos). El guion evita la confusión con «chiro». Nombre provisional mientras se decide: **Chi-Ro** |
| NTV | **En línea y gratis** vía la API oficial de Tyndale (api.nlt.to). Se acepta que necesite conexión |
| Sincronización | **iCloud**, hecha a medida para el usuario primero; se generaliza después |
| Enfoque | **Primero a medida para el usuario**; adaptarlo al público, después |

### Orden de trabajo acordado (tras el research)
1. **El programa completo en computadora:** lector, NTV/NLT, versiones, subrayado, notas, estudio, búsqueda y diseño.
2. **Sincronización por iCloud.**
3. Audio.
4. Celular.
5. **IA, al final.**

Detalles y fuentes del research en `RESEARCH.md`.

---

## 0. Principios que guían todo

1. **Local primero.** Todo funciona sin internet y sin cuenta. Internet solo suma: más versiones, Wikipedia, diccionarios.
2. **Cero instalación.** Se abre `index.html` con doble clic en cualquier navegador moderno (PC, Mac, Linux, tablet). No hay `npm install`, compilación ni servidor obligatorio.
3. **Cero dependencias en tiempo de ejecución.** HTML, CSS y JavaScript puro. Sin frameworks. Las fuentes tipográficas de Google son opcionales: sin internet se usan las del sistema.
4. **Tus datos son tuyos.** Subrayados y notas viven en tu navegador (IndexedDB) y se exportan a un archivo JSON legible cuando quieras.
5. **Las anotaciones se anclan a la referencia, no a la versión.** Si subrayas Juan 3:16 en RV1909, el subrayado aparece también en KJV o en RVR1960. Ningún lector popular lo hace bien, y para quien compara versiones es lo más útil.

---

## 1. Ingeniería inversa: qué existe y qué tomamos

| Programa | Qué hace bien (lo copiamos) | Qué le falta (lo mejoramos) |
|---|---|---|
| **e-Sword / theWord / MySword** | Módulos offline, Strong, comentarios, paralelo | Solo Windows/Android, interfaz de 2005, módulos difíciles de conseguir |
| **YouVersion** | Planes, subrayado con colores, compartir | Requiere cuenta, nube obligatoria, sin estudio profundo |
| **Logos / Accordance** | Estudio de palabras, referencias cruzadas | Caros, pesadísimos (GBs) |
| **Blue Letter Bible / STEPBible** | Strong, interlineal, concordancia | Solo web, sin notas personales serias |
| **AndBible / Xiphos** | Libres, módulos SWORD | Interfaz compleja, notas pobres |
| **Obsidian (no es Biblia)** | Notas enlazadas y retroenlaces | No conoce la Biblia |

**Síntesis:** la parte offline de e-Sword, el subrayado de YouVersion, el estudio de palabra de Blue Letter Bible y las notas enlazadas de Obsidian, en un programa de pocos MB que corre en cualquier navegador.

---

## 2. Fuentes de datos (versión 2, tras el research)

| Dato | Cómo | Licencia |
|---|---|---|
| **NTV** (principal) y **NLT** | API oficial de Tyndale, api.nlt.to (en línea, caché solo en memoria) | © Tyndale, uso personal no comercial |
| RV1909, RV1865, BSB, KJV | Incluidas en `biblias.db` | Dominio público / CC0 |
| Referencias cruzadas | OpenBible.info, filtradas a ≥3 votos y 12 por versículo | CC BY |
| Léxico Strong | Open Scriptures | CC BY-SA |
| Más adelante | STEPBible (interlineal), YouVersion Platform o API.Bible (RVR1960, NVI…), Bible Brain (audio) | Ver `RESEARCH.md` |

## 3. Arquitectura (versión 2)

**Tauri 2 + Svelte 5 + Vite + SQLite (FTS5).** El detalle y la estructura de carpetas están en `LEEME.md`.

- `biblias.db` (solo lectura): versiones, búsqueda FTS5 sin acentos, referencias y Strong. Viaja como recurso de la app y se copia a la carpeta de configuración al arrancar.
- `usuario.db`: notas, subrayados, memoria, leídos, cintas y ajustes. Cada fila lleva `actualizado` y `borrado`, preparada para la sincronización.
- **Modo navegador** para desarrollo y pruebas: la misma interfaz con SQLite en WebAssembly.
- **Instaladores:** GitHub Actions compila el `.dmg` (Mac universal) y el `.exe` (Windows).

## 4. Dependencias (versión 2)

| Para quién | Qué |
|---|---|
| Usuario | Nada: instalador de Mac o Windows |
| Desarrollo | Node 22, Python 3, Rust; Tauri 2.12, Svelte 5.57, Vite 8.3, @sqlite.org/sqlite-wasm 3.54 |

## 5. Modelo de datos

**Referencia canónica:** `libro.capítulo.versículo` (Juan 3:16 = `43.3.16`). Todas las anotaciones se anclan a ella, nunca a una versión.


## 6. Plan de cada parte

Cada parte indica su objetivo, cómo se construye, sus riesgos y cuándo está terminada.

### 6.1 Datos y conversión
- **Cómo:** `convertir.py` lee el JSON de scrollmapper, valida 66 libros sin huecos de versículos (RV1909 ya verificada: 0 huecos) y escribe `data/<id>.js`. Las referencias cruzadas se filtran a votos ≥ 2, con un máximo de 15 por versículo ordenadas por votos. Strong se reduce a lema, transliteración, definición y uso en KJV.
- **Riesgo:** la versificación difiere entre tradiciones (Salmos con título, Malaquías 3–4). Mitigación: todas las incluidas siguen la numeración de la KJV, y si un versículo no existe en una versión se muestra «—».
- **Terminado cuando** los tres paquetes cargan y Juan 3:16 coincide con el texto fuente.

### 6.2 Almacén (SQLite: usuario.db) ✅
- **Cómo:** estado reactivo en memoria con escritura inmediata en SQLite. Cada fila guarda `actualizado` y `borrado` para la sincronización futura.
- **Terminado cuando** notas y subrayados sobreviven a recargar la página.

### 6.3 Versiones y proveedores en línea
- **Cómo (versión 2):** NTV/NLT vía api.nlt.to; versiones incluidas en SQLite. Se descartan bolls.life y la descarga de versiones con copyright (ver `RESEARCH.md`).
  - bolls: `languages.json` para el catálogo y `get-text/{VERSION}/{libro}/{cap}/` para el texto. Se limpia el HTML y se conservan los números Strong `<S>…</S>` como datos de la palabra.
  - HelloAO: `available_translations.json` y `/{id}/{USFM}/{cap}.json`.
  - **Descargar para offline:** recorre los 1189 capítulos con 4 peticiones en paralelo, barra de progreso y posibilidad de reanudar.
  - **Importar:** archivo JSON en formato scrollmapper o en el formato propio.
- **Riesgo:** cambios en las APIs o CORS. Mitigación: errores visibles con explicación y la sugerencia de abrir el programa con `iniciar.py` (servidor local).
- **Terminado cuando** se puede elegir una versión en línea, leerla, y queda disponible sin conexión.

### 6.4 Lector
- **Cómo:** se renderiza un capítulo a la vez, con modo versículo por línea o párrafo. Encabezado con el nombre del libro en versalitas y número de capítulo grande, como en una Biblia impresa.
  - **Barra «Ir a»** tolerante: `jn 3:16`, `1 cor 13`, `génesis 1`, `sal23`, sin importar acentos ni puntos.
  - **Vista paralela:** dos versiones alineadas versículo a versículo en una cuadrícula, no por scroll. En móvil se apilan.
  - Teclado: ← → para cambiar de capítulo, `/` para buscar, `g` para ir a una referencia.
  - Ajustes: tema (sistema, Cuero, Papel), tamaño de letra, modo párrafo.
- **Terminado cuando** se navega Génesis 1 → Apocalipsis 22 sin errores y la posición se recuerda al reabrir.

### 6.5 Selección y subrayado
- **Cómo:** tocar un versículo lo selecciona y Mayús+clic selecciona rangos. Aparece una barra de acciones con 5 colores (amarillo, verde, azul, rosa, violeta), Nota, Estudiar «palabra», Comparar, Referencias, Memorizar y Copiar.
- **Clave:** al tocar se selecciona el versículo y además se captura la palabra tocada (`caretRangeFromPoint`). Un solo gesto sirve para las dos cosas, sin menús escondidos.
- **Terminado cuando** un subrayado hecho en RV1909 aparece en KJV.

### 6.6 Notas enlazadas
- **Cómo:** cada nota tiene un tipo: Nota, Observación, Pregunta, Aplicación u Oración (el método inductivo / SOAP). Las preguntas se pueden marcar como respondidas.
  - Las referencias escritas en el texto (`ver Ro 8:28`) se detectan solas y se vuelven enlaces.
  - **Retroenlaces:** si una nota de Juan 3 menciona Romanos 8:28, al leer Romanos 8 ese versículo muestra «mencionado en 1 nota».
  - Panel «Mis notas» con filtros por tipo, texto, `#etiquetas` y preguntas pendientes.
- **Terminado cuando** se crea una nota con una referencia y aparece el retroenlace en el destino.

### 6.7 Estudio de palabra (clic en una palabra)
- **Cómo:** el panel lateral muestra:
  1. **Concordancia instantánea offline:** cuántas veces aparece en la versión actual, como palabra exacta o como palabras que empiezan igual.
  2. **Mapa de distribución:** barras en los 66 libros que muestran dónde se concentra la palabra (por ejemplo, «amor» en 1 Juan).
  3. Lista de apariciones con la palabra resaltada; al tocar una se viaja ahí.
  4. **Strong**, si la versión lo trae: lema hebreo o griego, transliteración y definición desde el léxico local.
  5. **En línea, bajo demanda:** resumen de Wikipedia, RAE, BibleHub interlineal del versículo, Blue Letter Bible.
- **Terminado cuando** tocar «amó» en Juan 3:16 muestra el conteo, el mapa y los enlaces.

### 6.8 Referencias cruzadas y Comparar
- **Referencias:** se cargan bajo demanda las de OpenBible, se muestran con el texto del destino y se ordenan por votos de la comunidad.
- **Comparar:** el versículo seleccionado en todas las versiones disponibles, una debajo de otra.

### 6.9 Búsqueda
- **Cómo:** índice normalizado (sin acentos, en minúsculas) construido una sola vez por versión. Búsqueda de frase o de todas las palabras, con filtro por AT, NT o libro actual. Hasta 500 resultados con resaltado.
- **Meta:** menos de 150 ms en 31 000 versículos.

### 6.10 Lectura en voz alta
- **Cómo:** `speechSynthesis` del navegador, sin dependencias. Lee versículo por versículo, resalta el que se está leyendo y elige la voz según el idioma de la versión.

### 6.11 Cobertura de lectura
- **Cómo:** cuadrícula de los 1189 capítulos. Un capítulo se marca como leído al llegar al final tras 20 segundos o con el botón «Marcar leído». Muestra el porcentaje total, AT y NT.

### 6.12 Memorización
- **Cómo:** el versículo se va desvaneciendo en 4 niveles: completo, falta cada tercera palabra, solo iniciales, solo la referencia. Las repeticiones se espacian (intervalo ×2,2 si lo recordaste, vuelve a 1 día si no). Muestra «para repasar hoy».

### 6.13 Respaldo
- **Cómo:** exportar todo a un JSON (descarga o copiar) e importar con fusión, sin pisar lo existente.

### 6.14 Diseño: estética inspirada en Biblias de diseño editorial (tipo Holy Saints)
**Referencia:** el lenguaje visual de las Biblias de diseño de Holy Saints LA: cuero negro, papel blanco, «AMEN» en una serif clásica gigante, «New Testament» y «salvation» en caligrafía, frases tipo póster en condensada gruesa («READ YOUR BIBLE», «GOD IS REAL») y rojo como único color de acento.

> Se toma el lenguaje visual como inspiración. **No** se usa su nombre ni su emblema (marca registrada). Habrá un archivo `img/emblema.svg` con un emblema propio y sencillo, reemplazable por tu logo si tienes los derechos.

**Sistema visual:**
| Rol | Decisión |
|---|---|
| Tema «Cuero» (predeterminado) | Negro profundo #0B0B0B, superficies #151515, tinta hueso #EFECE6 |
| Tema «Papel» | Blanco papel #F7F6F2 con tinta negra, como las páginas interiores |
| Acento | Rojo sangre #D3271C (único color fuerte, igual que en la marca) |
| Títulos de libro | **Bodoni Moda** en mayúsculas gigantes (el efecto «AMEN») |
| Nombre del libro en el encabezado | **Pinyon Script**, caligrafía tipo «New Testament» |
| Frases, avisos y póster | **Anton**, condensada en mayúsculas («LEE TU BIBLIA.») |
| Texto bíblico | **Literata** (diseñada para leer en pantalla); Atkinson Hyperlegible como opción de alta legibilidad |
| Interfaz | **Archivo**, en mayúsculas pequeñas con espaciado |
| Textura | Grano fino de película sobre el fondo, sutil |

**Momentos de firma (lo físico llevado a pantalla):**
1. **Portada de libro:** al abrir el capítulo 1 de un libro aparece una «doble página» con el nombre en Bodoni gigante, como el AMEN del interior.
2. **Cintas marcapáginas:** las cintas blanca y negra de la Biblia física cuelgan del borde del texto. Al tocarlas marcas el capítulo y la cinta se vuelve roja. Puedes tener varias, como en la Biblia real.
3. **Subrayado de marcador:** trazo grueso, inspirado en la publicación de las líneas rojas tachando el texto.
4. **Póster de versículo:** genera una imagen vertical estilo cartel (negro, Anton en mayúsculas, palabra clave en rojo) para compartir. Pasa de la ronda 3 del roadmap a la v1.
5. **Estados vacíos con voz de marca:** «LEE TU BIBLIA.», «TODAVÍA NO HAY NOTAS. LA PALABRA ESPERA.»

**Distribución:** tres zonas en escritorio (navegación, texto de unos 65 caracteres por línea y estudio). En tableta la navegación pasa a un cajón; en móvil el estudio pasa a una hoja inferior.

### 6.15 Pruebas
- Script de Playwright que abre el programa, navega, subraya, crea una nota, cambia de versión, busca, estudia una palabra y saca capturas en escritorio y móvil.

---

## 7. Tres rondas de innovación

### Ronda 1: el momento de leer (quitar fricción)
*Pregunta: ¿qué interrumpe a alguien que solo quiere leer?*
| Idea | Por qué ayuda | v1 |
|---|---|---|
| Un toque selecciona el versículo y la palabra a la vez | Sin menús escondidos ni pulsaciones largas | ✅ |
| Barra «Ir a» que entiende cómo escribe la gente | `jn316`, `1cor 13`, sin acentos | ✅ |
| Subrayados independientes de la versión | Comparar versiones sin perder lo marcado | ✅ |
| Paralelo alineado por versículo | Leer dos traducciones sin desfase | ✅ |
| Voz alta con seguimiento | Leer mientras cocinas o manejas | ✅ |
| Lo leído en línea queda guardado | Internet una vez, offline siempre | ✅ |
| Temas Cuero y Papel, modo párrafo | Lectura larga sin cansancio | ✅ |
| Cintas marcapáginas como en la Biblia física | Volver a tus lugares con un toque | ✅ |

### Ronda 2: el estudiante (profundidad sin complejidad)
*Pregunta: ¿qué hace un estudiante con 5 libros abiertos y una libreta?*
| Idea | Por qué ayuda | v1 |
|---|---|---|
| Notas enlazadas con retroenlaces | La Biblia se interpreta con la Biblia, y tus notas también | ✅ |
| Tipos de nota (observación, pregunta, aplicación, oración) | Estructura el estudio inductivo; «preguntas pendientes» | ✅ |
| Mapa de distribución de una palabra | Ver de un vistazo dónde se concentra un tema | ✅ |
| Referencias cruzadas con votos de la comunidad | Las 15 mejores, no 300 sin orden | ✅ |
| Strong + léxico offline | Saber qué palabra griega o hebrea hay detrás | ✅ (con versiones en línea que traen Strong) |
| Comparar en todas las versiones | Ver matices de traducción | ✅ |
| Etiquetas `#tema` en notas | Construir estudios temáticos propios | ✅ |
| Línea de tiempo y mapas bíblicos | Contexto histórico y geográfico | 🔜 |
| Comentarios clásicos de dominio público (Matthew Henry, Jamieson-Fausset-Brown) | Segunda opinión offline | 🔜 |

### Ronda 3: la persona (hábito, memoria, vida)
*Pregunta: ¿qué hace que alguien vuelva mañana y que la Palabra se le quede?*
| Idea | Por qué ayuda | v1 |
|---|---|---|
| Mapa de cobertura (1189 capítulos) | Ver lo leído motiva más que una racha que castiga | ✅ |
| Memorización por desvanecimiento + repetición espaciada | La técnica con más evidencia para memorizar | ✅ |
| Diario: las notas de aplicación forman una línea de tiempo | Ver cómo te habló Dios a lo largo del tiempo | ✅ (filtro por tipo y fecha) |
| «Hace un año escribiste…» | Volver a encontrar notas antiguas | 🔜 |
| Planes de lectura (cronológico, M'Cheyne) sobre la cuadrícula de cobertura | Guía sin culpa | 🔜 |
| Póster de versículo para compartir (estilo cartel) | Compartir sin capturas feas | ✅ |
| Sincronización entre dispositivos sin cuenta (archivo o P2P cifrado) | Privacidad total | 🔜 |
| Preguntas a una IA local sobre el pasaje, citando versículos | Ayuda al estudio sin mandar datos a la nube | 🔜 |

---

## 8. Orden de construcción

1. **Datos:** conversión y verificación de paquetes.
2. **Esqueleto:** HTML, CSS, temas y diseño responsive.
3. **Núcleo de lectura:** libros, parser, lector, navegación y ajustes.
4. **Almacén y anotaciones:** subrayados y notas con retroenlaces.
5. **Estudio:** palabra, concordancia, mapa, Strong, referencias y comparar.
6. **Búsqueda y voz.**
7. **Hábito:** cobertura y memorización.
8. **Versiones en línea:** bolls, HelloAO, descarga offline e importación.
9. **Respaldo.**
10. **Pruebas automáticas y capturas.**
11. **Entrega:** carpeta lista, guía rápida (LEEME.md) y demo en línea.

---

## 9. Riesgos conocidos

| Riesgo | Mitigación |
|---|---|
| APIs en línea no verificables desde mi entorno | Código defensivo, mensajes claros; lo offline está probado |
| Copyright de RVR1960/NVI | No se incluyen; solo se leen en línea vía API, con descarga para uso personal |
| `file://` bloquea `fetch` en algunos navegadores | Paquetes como `<script>`; `iniciar.py` como alternativa con servidor local |
| Tamaño (unos 15 MB con 3 Biblias) | Carga bajo demanda; el código de la app pesa menos de 150 KB |
| Diferente versificación entre versiones | Se muestra «—» donde falta un versículo |
