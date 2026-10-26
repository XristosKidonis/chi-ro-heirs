# 4. Sistema visual: cómo está hoy

Corresponde al commit `e32e21a` de `main`, que es lo que se ve en https://xristoskidonis.github.io/chi-ro-heirs/. Las capturas de cada pantalla están en `imagenes/C-estado-actual-de-la-app/`.

> **Recordatorio:** que algo esté en la app **no** significa que el dueño lo haya aprobado. Mira la columna «Estado».

---

## 4.1 Tipografía

### Regla elegida por el dueño: «Opción C» ✅

| Rol | Letra | Uso |
|---|---|---|
| Títulos | **Inter Tight 300** (fina), grande y apretada (`letter-spacing: -0.04em` a `-0.06em`) | «Buenas noches.», «Láminas», «Tu estantería», tarjetas |
| Interfaz | **Inter Tight 400/600**, etiquetas en mayúsculas pequeñas y espaciadas | Botones, etiquetas, buscador, ayudas |
| Acento | **Pinyon Script** (caligrafía) | **Solo** nombres de libro, referencias («*Juan 3:16*»), una palabra suelta («¿Qué vas a *leer* hoy?» con *leer* en rojo) y el logo. **Nunca** en menús ni botones |
| Texto bíblico | **Literata** (o Atkinson Hyperlegible Next si la persona lo elige) | Solo para leer la Biblia |

### Dónde se aplica hoy

| Zona | Estado tipográfico | Estado |
|---|---|---|
| **Menú de inicio** | Ya está en la opción C (`.menu-inicio` redefine `--f-ui`, `--f-titulo` y `--f-texto` como Inter Tight) | ✅ Elegido por el dueño |
| **Logo** (barra, menú, portada y arranque) | «*Chi-Ro Heirs*» en Pinyon Script | ✅ Opción A, elegida por el dueño |
| **Portada** (versículo del día) | Versículo en **Bodoni Moda** con palabras clave en Pinyon rojo, y la referencia en Pinyon | 🟡 Solo se le quitaron el degradado y el ΧΡ. El dueño la siente **genérica**. ⏳ Hay 4 propuestas |
| **Portadilla de libro** | Nombre del libro en Pinyon Script grande sobre el grabado | ✅ Lo pidió el dueño («Sería chévere que ahí la tipografía sea la que es como caligrafía») |
| **Lector** (barra, navegación, panel de estudio, diálogos) | **Todavía mezcla:** Archivo (interfaz), Bodoni (número de capítulo, «AMEN», «Toca una *palabra*», cifras) y Pinyon | 🟡 **Sin migrar a la opción C.** El dueño todavía no lo pidió explícitamente; preguntarle |
| **Láminas** (canvas) | Cada acabado tiene su letra: Archivo variable condensada, Inter Tight, Fraunces 900 y Literata | 🟡 Ver `05-laminas.md` |

### Fuentes incluidas (todas con licencia SIL OFL, en `public/fuentes/`)

| Fuente | Pesos | Uso actual |
|---|---|---|
| Inter Tight | 300, 400, 800, 900 | Interfaz y títulos del menú; láminas Grabado y Ultramar |
| Pinyon Script | 400 | Caligrafía de acento y logo |
| Literata | 400, 400 cursiva, 600, más griego | Texto bíblico |
| Atkinson Hyperlegible Next | 400, 700 | Texto bíblico, si la persona lo elige |
| Bodoni Moda | 400, 400 cursiva, 700 | **Todavía** en la portada y el lector. Candidata a desaparecer (el dueño: «no me gusta la tipografía con serifas») |
| Archivo | 400, 600 | **Todavía** en la interfaz del lector. Candidata a ser reemplazada por Inter Tight |
| Archivo variable (familia «Archivo Condensada») | 100–900, ancho 62–125 % | Láminas Aura, Pedrería, Primario y Riso; logotipo Aura |
| Fraunces | 900 | Lámina Calor |
| Noto Serif Hebrew | 400, 600 | Interlineal hebreo |
| ~~Anton~~ | — | ❌ Eliminada a pedido del dueño |

## 4.2 Color

Hay dos temas: **Cuero** (oscuro) y **Papel** (claro). Se cambian con un botón; también existe la opción «sistema».

| Token | Cuero (oscuro) | Papel (claro) | Uso |
|---|---|---|---|
| `--fondo` | `#121110` | `#f7f6f2` | Fondo de la app; **plano, sin degradados** (el dueño los rechazó) |
| `--superficie` | `#191817` | `#ffffff` | Tarjetas y paneles |
| `--superficie-2` | `#23211f` | `#eeece6` | Hover y campos |
| `--tinta` | `#e8e4dc` (hueso) | `#0e0e0e` | Texto principal |
| `--tinta-2` | `#aca69c` | `#46433f` | Texto secundario |
| `--tenue` | `#8f8a82` | `#6b6b6b` | Etiquetas |
| `--linea` | `#2d2b28` | `#dad7d0` | Filetes y bordes |
| `--acento` | `#e55a50` | `#b3201e` | **Rojo lacre**, el único color fuerte de la interfaz |

- **Subrayado:** 5 colores (oro, rojo, azul, verde y hueso). **Rojo por defecto** ✅ (al dueño le gusta).
- **Grano:** una textura de ruido fina sobre el fondo (`--grano`: 0.065 en oscuro y 0.04 en claro). Estado 🟡: el dueño no la mencionó.
- **Contraste:** se verificaron los mínimos de WCAG para texto chico en los dos temas.
- **Láminas:** usan sus propias paletas (ultramar, amarillo limón, amarillo riso, verde ácido, rojo aerosol). Ver `05-laminas.md`.

## 4.3 Logo y símbolos

| Pieza | Descripción | Dónde está | Estado |
|---|---|---|---|
| **Logo de la interfaz** | «*Chi-Ro Heirs*» en Pinyon Script, color `--tinta`. Clase `.marca-caligrafia` | Barra (30 px), menú, portada (42 px) y arranque (60 px) | ✅ |
| **Logotipo Aura** | «CHI-RO HEIRS» en Archivo condensada negrísima, desenfocado, con halo de grano; versiones hueso y tinta, apilada y horizontal | `marca/png/logotipo-*.png`; **solo en los instaladores** de Mac y Windows | 🟡 Aprobado como pieza grande («buenisimos»), rechazado como texto chico |
| **Monograma ΧΡ** | Crismón dibujado con trazos | Ícono de la app, sello AMEN, barra en el celular (≤900 px), `marca/monograma-*.svg` | 🟡 Rechazado en el arranque y como marca de agua; **el resto no se consultó** |
| **Sello AMEN** | «AMEN» en Bodoni grande y un círculo rojo con el ΧΡ al terminar cada capítulo (`C17`) | Lector | 🟡 |
| ~~Logo Bodoni~~ | ΧΡ + «CHI-RO» Bodoni espaciada + «*Heirs*» | — | ❌ Eliminado (`B06`, `D06`) |

## 4.4 Pantallas, una por una

| Pantalla | Cómo es hoy | Captura | Estado |
|---|---|---|---|
| **Arranque** | Fondo liso, «*Chi-Ro Heirs*» en caligrafía grande y debajo la frase de Romanos 8:17 | (no capturada; es breve) | 🟡 Solo se le quitó el ícono ΧΡ |
| **Portada** | Logo arriba a la izquierda y la fecha a la derecha. El versículo del día grande en Bodoni, con las palabras clave en caligrafía roja y la referencia en caligrafía. Abajo, «Toma y lee.» y «— Toca para entrar». Fondo plano | `C01`, `C02`, `C03` | 🟡 Genérica según el dueño; ⏳ hay 4 opciones (`E04`–`E08`) |
| **Menú de inicio** | «Buenas noches.» en Inter Tight fina enorme; «¿Qué vas a *leer* hoy?» en caligrafía con *leer* en rojo; buscador; tres tarjetas («Continuar leyendo» con el grabado, «Tus cintas» y «Tu lectura» en %); botón «Abrir el lector» | `C04`, `C05`, `C08` | ✅ Tipografía (opción C); 🟡 el resto |
| **Galería de láminas** | El versículo del día en los 8 acabados, en un muro tipo Pinterest; al tocar uno se abre el estudio | `C09` | 🟡 |
| **Estantería** | 66 lomos encuadernados (cuero o tela según el género, nervios dorados, tejuelo con el número de capítulos y una franja roja que sube al leer) | `C10` | 🟡 Rehechos tras «parecen hechos en paint»; el dueño no volvió a opinar |
| **Estudio de láminas** | Diálogo con la vista previa, chips de acabado, variante (Riso: amarillo o verde) y formato, la frase editable y «Guardar imagen» | `C11` | 🟡 |
| **Lector** | Barra (logo, buscador «Ir a», versión, paralelo e íconos); navegación a la izquierda (libros y capítulos); texto en el centro; panel de estudio a la derecha (Palabra, Original, Notas, Comparar, Referencias, Buscar) | `C12`–`C23` | 🟡 Mezcla tipográfica sin migrar |
| **Portadilla** | Grabado de Doré a sangre en B/N con grano; nombre del libro en caligrafía; crédito «Gustave Doré · escena · pasaje»; «Usar mi imagen»; «Marcar» | `C12`, `C20` | ✅ Concepto pedido por el dueño; 🟡 la ejecución |
| **Instaladores** | Mac: ventana con el grabado de Doré a la izquierda; a la derecha, papel, logotipo Aura, «Toma y lee.» en Inter Tight fina, «*Arrastra el libro a tu biblioteca.*» y filetes, sin flechas. Windows: barra lateral con el grabado, logotipo Aura y «Toma y lee.» | `D05` (versión vieja con el logo Bodoni), `C24` y `C25` (actuales) | 🟡 Usan el logotipo Aura; ver pendientes |
