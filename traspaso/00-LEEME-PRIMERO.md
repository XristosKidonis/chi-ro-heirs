# Chi-Ro Heirs: carpeta de traspaso

> **Para quién es esto:** para otra IA o para una persona que va a seguir perfeccionando la app.
> **Quién la escribió:** el agente que construyó la app desde cero hasta hoy (26 de octubre de 2026), a pedido del dueño del proyecto.
> **Qué contiene:**
> - todo lo que se decidió y por qué;
> - lo que el dueño aprobó y lo que rechazó, con sus palabras textuales;
> - todas las imágenes: referencias, capturas, intentos y propuestas.

---

## ⚠️ Lo más importante antes de leer nada más

1. **Casi todo lo visual de esta carpeta son INTENTOS del agente anterior, no el diseño final.** El dueño todavía está definiendo la estética. Lo único que aprobó explícitamente está marcado como ✅ en [`03-gusto-del-usuario.md`](03-gusto-del-usuario.md).
2. **No mezcles los tres tipos de imágenes.** Están en carpetas separadas a propósito:
   - `imagenes/A-…`: **referencias de inspiración** que el dueño trajo de Pinterest y otros lugares. Son el **norte estético**. No son la app.
   - `imagenes/B-…`: **capturas de la app que el dueño mandó para criticar** algo («esto no me gusta»). Muestran lo que **no** hay que hacer, salvo una (B07) que muestra algo que le gustó. **No son referencias.**
   - `imagenes/C-…` a `F-…`: lo que el agente construyó: el estado actual (C), lo descartado (D), las propuestas sin decidir (E) y las láminas actuales (F).
3. **El dueño quiere dirigir los cambios él mismo.** Hubo un momento en que el agente aplicó todas las referencias por su cuenta a la app (v0.9.0) y el dueño respondió: *«me asusta un poco lo que acabas de hacer porque has aplicado todas las referencias. Entonces prefiero que vuelvas a como estaba antes y yo te voy diciendo exactamente qué cambiar mejor.»* Desde entonces la regla es: **mostrar opciones con imágenes, esperar que elija, y aplicar solo eso.**
4. **La carpeta A no está en el repositorio de GitHub**, que es público: son imágenes de terceros. Viene completa en el ZIP que entregó el dueño. Si trabajas desde el repositorio y no la tienes, sus fichas en el índice describen cada imagen.
5. Cada imagen tiene su ficha en [`imagenes/INDICE-DE-IMAGENES.md`](imagenes/INDICE-DE-IMAGENES.md): qué muestra, de dónde viene, en qué estado está y qué dijo el dueño. **Si una IA no puede ver la imagen, la ficha alcanza para entenderla.**

## Leyenda de estados (se usa en todos los documentos)

| Marca | Significa |
|---|---|
| ✅ **APROBADO** | El dueño lo pidió o dijo explícitamente que le gusta |
| 🟡 **PROVISIONAL** | Está en la app, pero el dueño no lo aprobó explícitamente; lo propuso o lo eligió el agente |
| ❌ **DESCARTADO** | El dueño lo rechazó; se quitó de la app |
| ⏳ **PENDIENTE** | Hay opciones mostradas y falta que el dueño elija |

## Orden de lectura

| # | Archivo | Qué hay |
|---|---|---|
| 0 | `00-LEEME-PRIMERO.md` | Este archivo |
| 1 | [`01-vision-y-filosofia.md`](01-vision-y-filosofia.md) | Qué es la app, para quién, sus principios y su identidad |
| 2 | [`02-historia-y-feedback.md`](02-historia-y-feedback.md) | Cronología completa: cada pedido del dueño (textual), qué hizo el agente y qué respondió el dueño |
| 3 | [`03-gusto-del-usuario.md`](03-gusto-del-usuario.md) | **El documento más importante para diseñar:** qué le gusta y qué no, destilado de toda la conversación |
| 4 | [`04-sistema-visual-actual.md`](04-sistema-visual-actual.md) | Tipografías, colores, logo y pantallas, tal como están hoy, con su estado |
| 5 | [`05-laminas.md`](05-laminas.md) | La sección Láminas (fondos de pantalla y diseños para compartir): los 8 acabados y cómo se construyen |
| 6 | [`06-referencias-estudiadas.md`](06-referencias-estudiadas.md) | Cada referencia de inspiración: qué se ve, por qué funciona y qué se sacó de ella |
| 7 | [`07-intentos-descartados.md`](07-intentos-descartados.md) | Todo lo que se probó y se quitó, con el motivo |
| 8 | [`08-arquitectura-tecnica.md`](08-arquitectura-tecnica.md) | Stack, archivos, datos, compilación, pruebas y publicación |
| 9 | [`09-pendientes-y-preguntas-abiertas.md`](09-pendientes-y-preguntas-abiertas.md) | Lo que falta decidir y lo que falta construir |
| 10 | [`10-reglas-para-agentes.md`](10-reglas-para-agentes.md) | Restricciones legales, de marca y de forma de trabajar |
| — | [`imagenes/INDICE-DE-IMAGENES.md`](imagenes/INDICE-DE-IMAGENES.md) | Ficha de cada imagen |
| — | `anexos/` | Documentos originales: `RESEARCH.md` (investigación inicial, con las 12 reglas de la IA), `PLAN-inicial.md` (plan del primer día, en parte desactualizado), `LEEME-del-repositorio.md` y `LEEME-de-marca.md` |

## Enlaces

| Qué | Dónde |
|---|---|
| Código (público, MIT) | https://github.com/XristosKidonis/chi-ro-heirs |
| **Versión web de prueba** (se actualiza sola con cada cambio en `main`, en 2 o 3 minutos) | https://xristoskidonis.github.io/chi-ro-heirs/ |
| Instaladores de Mac y Windows | https://github.com/XristosKidonis/chi-ro-heirs/releases (la última publicada es **v0.8.0**; `main` ya tiene cambios posteriores, solo visibles en la web) |
| Guía de marca (página privada del dueño en claude.ai; **desactualizada**, ver 09) | https://claude.ai/artifact/V2rWgxXXhJef5VdWbXjq3w |
| Commit al que corresponde esta carpeta | `e32e21a` («Portada y arranque sin degradado ni ΧΡ») en `main` |

## Resumen en cinco líneas

- **Chi-Ro Heirs** es un lector bíblico de escritorio (Mac y Windows), ligero y local, en español e inglés, con la **NTV** como traducción principal.
- Está hecho con Tauri 2, Svelte 5 y SQLite.
- **Lo funcional está completo y probado:** lectura, versiones, subrayado, notas enlazadas, estudio de palabras, interlineal hebreo y griego, búsqueda, memorización, láminas para compartir, y una portada y menú de inicio con estantería.
- **Lo estético está en plena definición.** El dueño quiere una estética editorial tipo Pinterest para jóvenes cristianos, como sus referencias, y siente que la app todavía no la tiene: *«Se ve como muy genérico.»*
- El último paso fue mostrarle 4 opciones de portada (en `imagenes/E-…`). Todavía no eligió.
