# 12. Criterio reciente (v0.10 → v0.14.1, 27 y 28 de octubre de 2026)

Lo que el dueño pidió, corrigió y aprobó después de adoptar el diseño *white industrial*. Complementa a `03-gusto-del-usuario.md` (que es anterior) y a `11-integracion-white-industrial.md` (que manda en lo visual).

## Cómo pide y cómo aprueba

- Pide por voz y en frases largas; a veces manda varias cosas seguidas mientras se trabaja. Hay que atenderlas todas y no perder ninguna.
- Aprueba publicar con «dale, publica la vX.Y.Z». **Nunca publicar sin esa frase**: cada compilación crea una release pública. Para cosas grandes con caminos distintos, hay que darle opciones con una recomendación (así eligió «Las dos» para la voz).
- Prueba la app instalada en **Windows** y manda capturas. Lo que ve en pantalla manda sobre lo que dicen las pruebas.
- Quiere saber el **porqué** de lo que ve. Ejemplos: «¿en base a qué está sugiriendo esa palabra?» o «no sé de dónde salió lo de *produce doce cosechas*». Explicarle en simple la causa real, y después arreglarla.
- Valora la honestidad: decirle qué no se pudo probar (servidores sin acceso, claves que no tenemos, Mac).

## Lo que quiere (confirmado en esta etapa)

- **Leíble, didáctico y bien segmentado**: «súper leíble, bien didáctico, bien segmentado… para que no cueste leerlo». Pasos numerados, bloques cortos, etiquetas claras.
- **Imágenes, no solo texto**: «si todo es texto, aparte de ser blanco, se agarra demasiado plano». Prefiere pinturas antiguas y grabados de dominio público, en buena calidad.
- **Lo real antes que lo generado**:
  - pidió música grabada en vez del motor que «genera sonido»;
  - pidió una voz que no suene a robot.
- **Todo lo que la app ofrece debe verse desde el inicio**: notó que el menú tenía 3 entradas y adentro había más secciones. Hoy son 5.
- **Humor ligero y en su idioma**: el quiz pasó de «firme / viral» a «¿Facto o fake?» y, en inglés, «Fact or cap?». Los sellos dicen Facto, Probable, Se discute y Fake.
- **Que nada se recorte ni se mezcle sin avisar**: en las láminas va el versículo entero por defecto y los trozos son una opción. Cada versículo trae solo su texto.
- **Dentro de la app siempre**: Spotify puede abrirse afuera, pero siempre tiene que haber música dentro de la app («para los que no tienen Spotify»).
- Le gustó: la clave de colores, el modo margen, la sección Historia con su expediente, la línea del tiempo y el quiz, y que se recomiende empezar por Juan.

## Lo que corrigió (no repetir)

- Un botón con estilo heredado por error: el círculo de los colores aplicado a «Clave».
- Sugerencias que parecen arbitrarias: la palabra de «Estudiar». Ahora se marca al pasar el mouse y se subraya la que se tocó.
- Textos de interfaz que no coinciden con lo decidido: el instalador seguía diciendo «firme» después de cambiar a «Facto».
- Funciones que fallan en silencio: el paralelo no aparecía cuando la NTV no cargaba, sin explicar por qué.

## Decisiones técnicas que reflejan su criterio

- Solo material con licencia libre. Música de Wikimedia Commons con crédito por pista; voces Piper sin licencias «no comerciales».
- Lo que tiene licencia GPL (eSpeak NG) no va dentro del instalador: se descarga aparte.
- La NTV/NLT nunca se guarda en disco.
- Las dependencias nuevas deben tener al menos dos semanas de publicadas.
- Actualizaciones firmadas: la clave privada la tiene él y está en los secretos del repositorio. Nunca pedírsela ni guardarla en el repositorio.
