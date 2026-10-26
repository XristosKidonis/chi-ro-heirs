# 1. Visión y filosofía

## Qué es

**Chi-Ro Heirs** es un lector bíblico personal para computadora: ligero, local y bilingüe (español e inglés). Al principio el dueño lo pidió así:

> «Quisiera que me ayudes a crear un programa. Tampoco que reinventes la rueda, porque ya hay programas así, pero uno súper ligero que sea para leer la Biblia localmente, con varias versiones, […] donde pueda o subrayar o tener anotaciones, o que se conecte a internet también cuando le doy clic a alguna palabra en específico […] que sea bien completa.»

Después le sumó una dimensión estética, que hoy es la prioridad:

> «Quisiera que todo esté brandeado. Quisiera que todo tenga una marca, una estética, que se sienta una aplicación ligera, open source por ahora, para esta generación. Que les encante el Pinterest, que les encante la estética, pero son cristianos.»

> «Sería cool llevar esto a no solamente un lugar de estudio, sino también estético.»

## Para quién

| Aspecto | Decisión |
|---|---|
| Primero | **Para el dueño**, a su medida. Proyecto personal, gratis y sin fines de lucro |
| Después | Quizá para el público o como complemento («add-on») de alguien más |
| Público imaginado | Jóvenes cristianos de esta generación, a los que les gusta Pinterest y el diseño editorial |
| Plataforma | **Computadora primero** (Mac y Windows). Celular después, si se puede con el mismo código |
| Idiomas | Español e inglés (interfaz y textos) |
| Canon | **Protestante** (66 libros) |
| Traducción principal | **NTV** (Nueva Traducción Viviente), en línea vía la API oficial de Tyndale. Su hermana en inglés es la NLT |

## Orden de fases acordado

1. El programa completo en computadora: lector, versiones, subrayado, notas, estudio, búsqueda y diseño. ✅ Hecho en lo funcional; el diseño sigue en curso.
2. Sincronización con iCloud (el dueño usa iCloud). Pendiente. La base de datos ya guarda `actualizado` y `borrado` en cada fila para esto.
3. Audio. Pendiente.
4. Celular. Pendiente.
5. **IA, al final** y bien delimitada. Pendiente. Las 12 reglas propuestas están en `anexos/RESEARCH.md`.

> Dueño: «lo de la IA, que sea lo último que veamos. Porque primero quiero tener el sistema ya funcionando.»

## Nombre e identidad

- **Chi-Ro:** las letras griegas Χ (chi) y Ρ (rho), las dos primeras de ΧΡΙΣΤΟΣ (Cristo). El monograma ☧ (crismón) es un símbolo cristiano del siglo IV y es de libre uso.
- **Heirs** (herederos) lo propuso el dueño: *«me gustaría igual el chi ro, pero con otra palabra más. […] por ejemplo, heirs, de herederos.»* Viene de **Romanos 8:17**: «Y si hijos, también herederos; herederos de Dios y coherederos con Cristo».
- El guion de «Chi-Ro» evita que se lea «chiro». En inglés, «chiro» es quiropráctica; además, Chiro es un movimiento juvenil belga.
- El research inicial recomendaba «Crismón» como nombre, pero **el dueño eligió Chi-Ro Heirs**.
- **Lema:** «La Biblia para esta generación de herederos.»
- **Grito de marca:** **«Toma y lee.»** (*Tolle, lege*, San Agustín). Aparece en la portada y en los instaladores.
- **Voz:** frases cortas, sobrias y con peso. Por ejemplo, el estado vacío de las notas: «Todavía no hay notas. *La Palabra espera.*»

## Principios de producto (guían todas las decisiones)

1. **Local primero.** Todo funciona sin internet y sin cuenta, salvo la NTV/NLT, que por licencia se lee en línea. Internet solo suma.
2. **Tus datos son tuyos.** Notas y subrayados viven en `usuario.db`, en la computadora, y se exportan a JSON legible.
3. **Las anotaciones se anclan a la referencia, no a la versión.** Si subrayas Juan 3:16 en la NTV, aparece también en la RV1909. Casi ningún lector lo hace bien.
4. **Un toque, dos cosas.** Tocar una palabra selecciona el versículo y además abre el estudio de esa palabra.
5. **Hábito sin culpa.** No hay rachas ni notificaciones que castigan. Hay un mapa de cobertura de los 1189 capítulos y un sello «AMEN» al terminar cada capítulo. El research mostró que las rachas generan culpa y son una queja frecuente.
6. **Profundidad sin complejidad:** interlineal, léxicos, concordancia y referencias cruzadas, con una interfaz limpia.
7. **IA delimitada (fase final):** no inventa versículos, no impone doctrina, siempre cita y se puede apagar.
8. **Ligero:** la app instalada pesa decenas de MB, no GB como Logos.

## Filosofía estética (lo que se busca, todavía no logrado del todo)

- **Editorial, no plantilla.** El dueño rechaza lo que se siente «muy Canva» o «muy genérico».
- **Pinterest cristiano:** como sus referencias (carpeta A): carteles tipográficos con textura (fotocopia, riso, aerosol, strass, halo térmico), grabados antiguos, caligrafía y mucha escala.
- **Lo físico llevado a pantalla:** la Biblia de diseño (cuero negro, papel, caligrafía, «AMEN» enorme) inspiró el comienzo.
- **El rojo como acento:** desde el principio se usa rojo lacre y al dueño le gusta que el subrayado por defecto sea rojo.
- **Tipografía con roles claros:** pocas letras, cada una con un uso fijo. El dueño se quejó de «demasiadas tipografías».

## Qué hace la app hoy (funcional, todo probado)

| Función | Detalle |
|---|---|
| Inicio | Portada con el versículo del día a pantalla completa y un menú con buscador de libros y pasajes, «continuar leyendo», cintas, progreso, galería de láminas y estantería de 66 lomos |
| Versiones | NTV y NLT en línea (API de Tyndale); RV1909, RV1865, BSB y KJV sin conexión |
| Portadillas | Cada libro abre con un grabado de Gustave Doré (1866, dominio público) a toda página y el nombre del libro en caligrafía. Se puede poner una imagen propia |
| Lectura | Temas Cuero (oscuro) y Papel (claro), modo lector, Literata o Atkinson, vista paralela de dos versiones |
| Subrayado | 5 colores, rojo por defecto, anclado a la referencia |
| Notas | Tipos (observación, pregunta, aplicación, oración), `#etiquetas`, referencias que se vuelven enlaces y retroenlaces |
| Estudio de palabra | Concordancia, mapa por libros, RAE, interlineal, Blue Letter Bible y Strong |
| Interlineal | Hebreo y griego palabra por palabra (STEPBible): transliteración, glosa (en español para el griego), Strong, gramática explicada y léxicos BDB y Abbott-Smith |
| Referencias cruzadas | Unas 159 000 de OpenBible.info, ordenadas por votos |
| Búsqueda | FTS5 instantánea y sin acentos |
| Hábito | Sello AMEN, cuadrícula de 1189 capítulos y «Marcar» (cintas) |
| Memoria | Versículos que se desvanecen y repaso espaciado |
| Láminas | Versículos como fondo de pantalla o post en 8 acabados (ver `05-laminas.md`) |
| Voz | Lectura en voz alta con las voces del sistema |
| Respaldo | Exportar e importar en JSON |
