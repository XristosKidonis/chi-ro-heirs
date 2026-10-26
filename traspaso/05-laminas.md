# 5. Láminas: fondos de pantalla y diseños para compartir

## Qué es y de dónde salió

- **Idea del dueño:** «Sería bueno que haya una sección de wallpapers, tal vez. O de diseños para compartir.»
- Convierte cualquier versículo en una imagen con la estética de las referencias (carpeta A).
- **Es la parte de la app más parecida a las referencias.** El dueño mismo notó que la app «simplemente tiene diseños, por así decirlo. Pero no los tiene dentro»: las láminas tienen el estilo y el resto de la app no.

### Dónde aparece

1. **Menú de inicio → «Láminas»:** un muro tipo Pinterest con el versículo del día en los 8 acabados (`C09`). Al tocar uno se abre el estudio.
2. **Lector → seleccionar versículos → «Lámina»:** abre el estudio con esos versículos (`C18`).
3. **Estudio de láminas** (`C11`):
   - vista previa y chips de **acabado**, **variante** (solo Riso: amarillo o verde ácido) y **formato**;
   - **frase editable**: de un versículo largo se puede dejar solo «Él es mi porción»;
   - botón **Guardar imagen**, que descarga un PNG.

### Formatos

| Formato | Tamaño | Notas |
|---|---|---|
| `post` | 1080 × 1350 (4:5) | Instagram |
| `historia` | 1080 × 1920 (9:16) | Historias y reels; zona segura para los botones de la red |
| `celular` | 1179 × 2556 | Fondo de pantalla; deja libre la zona del reloj (el texto empieza en el 34 % de la altura) |
| `escritorio` | 2560 × 1600 | Fondo de computadora; el texto va en la mitad derecha |

## Cómo se construyen (técnico)

- Archivo: `src/lib/laminas.js`. Función principal: `dibujarLamina(canvas, { estilo, formato, tono, texto, clave, referencia, version, libro, imagen, escala })`.
- Todo se dibuja con **Canvas 2D a mano, sin filtros CSS**, porque WebKit en Mac no aplica `filter` al canvas. El desenfoque, el aerosol, el grano y el blanco y negro se calculan píxel a píxel:
  - `difuminar`: reduce la imagen a la mitad varias veces y la vuelve a ampliar (un desenfoque barato).
  - `aerosol`: desenfoque más un umbral con ruido, para que la forma se deshaga en puntos.
  - `granoRiso`: borde corrido (desenfoque con umbral ruidoso) y huecos internos de unos 2 px, como el tambor de una risógrafa.
  - `laminaBN`: imagen a blanco y negro con contraste, recortada para cubrir.
- **Palabra clave (`clave`):** la palabra del versículo que se destaca (en rojo, en caligrafía o a mano, según el acabado). Viene del versículo del día o la elige la app.
- **`fraseCorta`:** si el versículo es largo, los acabados de letra gigante se quedan con la cláusula que contiene la palabra clave, más las siguientes mientras quepan (por ejemplo, de Juan 14:6 queda «Yo soy el camino»).
- **`pila`:** reparte la frase en renglones y da a cada uno el tamaño que llena el ancho. Las palabras de 3 letras o menos quedan al 62 %, como el «AND» de la referencia de pedrería.
- **`condensada`:** usa el ancho nativo de la fuente variable Archivo; si el navegador no lo soporta, comprime a mano con `scale`.

## Los 8 acabados actuales

Las imágenes de cada acabado están en `imagenes/F-laminas-acabados-actuales/`, con nombres como `F-<acabado>-<formato>-<texto>.jpg`:

- `jn` = Juan 14:6, «Jesús le dijo: Yo soy el camino…», palabra clave *camino*;
- `lam` = Lamentaciones 3:24, «Mi porción es Jehová…», palabra clave *porción*;
- las hojas `F-00-HOJA-RESUMEN-todos-los-acabados-jn.jpg` y `-lam.jpg` los muestran todos juntos.

| # | Acabado (es / en, clave interna) | Referencia (carpeta A) | Cómo es | Letra y colores | Estado |
|---|---|---|---|---|---|
| 1 | **Grabado** / Engraving (`portadilla`) | `A09` SEEK JESUS | El grabado de Doré del libro del versículo (o la imagen propia del usuario), en B/N de alto contraste tipo fotocopia; la frase en grotesca **fina y enorme**, cortada por el borde inferior; la referencia en caligrafía arriba | Inter Tight 300 blanca `#f1eee8`; Pinyon para la referencia; fondo `#0b0a09` | 🟡 |
| 2 | **Ultramar** / Ultramarine (`ultramar`) | `A06` HE IS MY PORTION | Tono sobre tono: fondo azul ultramar y la frase corta en un azul apenas más claro, pequeña, centrada, con mucho aire. Se lee en la segunda mirada | Inter Tight; fondo `#1238e6`, texto `#5a78f4` | 🟡 |
| 3 | **Aura** (`aura`) | `A07` ALL WE NEED IS GOD | Blanco sobre negro; condensada negrísima en mayúsculas; cada renglón llena el ancho; todo fuera de foco, con borde de fotocopia y halo de grano | Archivo variable 900, extra-condensed; fondo `#030303`, letra blanca | 🟡 Al dueño le gustó **este estilo** (lo pidió para el logo, `B07`) |
| 4 | **Aerosol** / Spray (`aerosol`) | `A08` Holy | El versículo impreso en mayúsculas serif justificadas, pequeño y gris oscuro; encima, la palabra clave escrita «a mano» en caligrafía roja de aerosol (borrosa con puntos) | Literata mayúsculas `#161616`; palabra en Pinyon roja `#e0261c`; papel `#f3f1ec` | 🟡 |
| 5 | **Pedrería** / Rhinestone (`pedreria`) | `A14` BLESSED AND HIGHLY FAVORED | Como una remera de strass: condensada muy negra; renglones que llenan el ancho y casi se tocan; cada trazo relleno de piedritas blancas (unas 5 por trazo) con brillo arriba a la izquierda y un leve desorden. Las palabras cortas, más chicas | Archivo variable condensada; fondo `#050505`; piedras con degradado radial del blanco al gris | 🟡 Afinado dos veces a pedido |
| 6 | **Primario** / Primary (`primario`) | `A15` IS IT WORSHIPING JESUS | Amarillo limón plano; el texto abajo, en negrita mayúscula, justificado a los dos lados aunque queden huecos grandes; la palabra clave en **rojo** y la última palabra en **azul**; la última línea centrada; sin palabras sueltas al final | Archivo variable negrita; fondo `#fff200`, texto `#1c1c1c`, rojo `#e8231c`, azul `#1f4fd6` | 🟡 Afinado a pedido |
| 7 | **Riso** (`riso`), variantes **amarillo** y **verde ácido** | `A16` IN CHRIST I HAVE (amarillo) y `A17` MY GOD SAYS (verde) | Como un carrusel impreso en risografía: rótulo «Para no olvidar:» arriba; franjas de color del mismo ancho con la frase en condensada (todos los renglones al mismo cuerpo); a los costados de los renglones cortos, la referencia en dos pisos («JUAN / 14:6», como el «FOUR THINGS»); abajo, la referencia entre flechas en círculo. Tinta con grano y huecos; la franja de color, corrida unos píxeles | Archivo variable condensada; tinta `#262624`; amarillo `#f2df45`, verde `#b6ee5a`; papel crema `#f7f5ec` | 🟡 Rehecho tras `B05` («no tenían ese rectángulo abajo […] la textura podría estar mejor») |
| 8 | **Calor** / Heat (`calor`) | `A18` amen | Una sola palabra (la clave), en serif gruesa y suave, con halo térmico: núcleo casi negro con zonas verde amarillentas, una banda amarilla pegada a la letra y un halo naranja ancho que se deshace en grano. Fondo blanco; la referencia tenue abajo | Fraunces 900; fondo `#ffffff` | 🟡 Afinado dos veces a pedido |

> **Firma:** algunos acabados llevan arriba «CHI-RO HEIRS» en letra de etiqueta pequeña, y todos llevan la referencia y la versión abajo. Con el logo nuevo en caligrafía, conviene revisar si la firma debería cambiar (pendiente).

## Acabados eliminados

| Acabado | Qué era | Referencia | Por qué se fue | Imagen |
|---|---|---|---|---|
| **Cruz** | Dos palabras del versículo, una horizontal y otra vertical, cruzadas en una letra compartida, con la letra del cruce en rojo | `A11`–`A13` (cruces) | «borra estos diseños, esa refe mo sirvio, no me guisto como quedo» | `B03`, `D09` |
| **Cartel** | Bodoni con la palabra clave en caligrafía roja, en Cuero, Papel o Lacre | El lenguaje de la marca de entonces | «este tampoco me gusto» | `B04`, `D10` |

## Ideas de las referencias que **no** se convirtieron en lámina

- **BORN AGAIN** (`A10`): gótica en arco alrededor de una cruz. Se pensó como sello al terminar un libro. **No se hizo.**
- **Staurograma** (Τ y Ρ entrelazadas, la cruz más antigua en un manuscrito, alrededor del año 200): se pensó como ícono de «Referencias cruzadas». **No se hizo.**
- **GOD / Bless the Algorithm** (`A11`): tres registros encimados (grotesca expandida, cruz a mano y caligrafía). Se pensó para stickers y redes. **No se hizo**, y además el dueño descartó las referencias de cruces.

## Historial de afinado

- **v0.5.0:** 6 acabados (Grabado, Cartel, Ultramar, Aura, Aerosol y Cruz).
- **v0.6.0:** se sumaron Pedrería, Primario, Riso y Calor.
- **v0.7.0:** dos pasadas a todos («perfecciona lo que hasz hecho con las referencias, dale 2 pasadas a cada una»); fuera Cruz y Cartel.
- **v0.7.1:** Riso más fiel a la referencia (sin el rectángulo de abajo; flechas en círculo; textura de risografía real).
- **v0.7.2:** Pedrería (piedras más chicas y apretadas, sin destellos ni firma) y Calor (halo en bandas, solo la palabra).
- **v0.7.3:** Aura (condensada negrísima, todo desenfocado) y Primario (amarillo limón vivo, texto abajo justificado y la última palabra en azul).
- Hay hojas de comparación de cada pasada en `imagenes/D-intentos-descartados/` (`D14a`–`D14d`).
