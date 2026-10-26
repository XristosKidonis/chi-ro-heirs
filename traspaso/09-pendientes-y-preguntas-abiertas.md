# 9. Pendientes y preguntas abiertas

## A. Decisiones que esperan al dueño ⏳

| # | Pregunta | Opciones ya mostradas | Recomendación del agente anterior |
|---|---|---|---|
| 1 | **¿Cómo debe ser la portada?** (hoy se siente «muy genérico») | `E04`–`E08`: (1) Editorial oscura, (2) Grabado a sangre, (3) Papel, (4) Una palabra | La **2** (grabado de Doré a sangre + frase corta en Inter Tight fina + referencia en caligrafía): es lo más propio de la app y conecta con las portadillas. Se pueden mezclar (por ejemplo, la 2 en oscuro y la 3 en claro) |
| 2 | **¿Se mantiene el ΧΡ en algún lado?** Hoy está en el ícono de la app, el sello AMEN y el logo de la barra en el celular | No se mostraron opciones | Preguntar. Rechazó el ΧΡ en el arranque y como marca de agua; del resto no dijo nada |
| 3 | **¿Llevar la opción C (Inter Tight + caligrafía de acento) al resto de la app?** (barra, lector, panel de estudio, diálogos; hoy mezclan Bodoni, Archivo y Pinyon) | No se mostró | Probablemente sí, por coherencia con «demasiadas tipografías» y «no me gusta la tipografía con serifas». **Mostrarle antes y después** de cada pantalla |
| 4 | **¿Qué logo va en las piezas grandes?** (instaladores, ícono, futuras redes). Hoy los instaladores usan el logotipo Aura y la interfaz usa la caligrafía | — | Preguntar si quiere unificar todo en caligrafía o guardar el Aura para lo grande |
| 5 | **¿Qué parte del lenguaje de las láminas** (Aura, Riso, Primario, etc.) quiere dentro de la interfaz? | v0.9.0 lo aplicó todo y lo revirtió (`D13`) | Ir **de a una pieza**, con opciones, y que él elija |
| 6 | **¿Cómo debe ser la pantalla de arranque?** | Hoy: nombre en caligrafía y Ro 8:17 | Mostrar opciones junto con la portada |
| 7 | **¿La «firma» CHI-RO HEIRS de las láminas** sigue igual o pasa a la caligrafía? | — | Consultar |
| 8 | **¿El sello AMEN** (Bodoni + círculo rojo con ΧΡ) se queda? | — | Consultar; mezcla Bodoni y ΧΡ, que tienen señales negativas |

## B. Trabajo de diseño probable (cuando el dueño lo pida)

- **Revisión pantalla por pantalla** con el dueño. Él pidió: «yo te voy diciendo exactamente qué cambiar mejor». El mecanismo es el enlace web: cada push a `main` se ve en 2 o 3 minutos.
- **Lector:** barra, títulos de capítulo (hoy el número va en Bodoni), «Toca una *palabra.*» (Bodoni + caligrafía roja, la misma mezcla del Cartel rechazado), cifras del panel y el AMEN.
- **Láminas:** seguir afinando la fidelidad a las referencias si él lo pide; revisar la firma.
- **Ícono de la app** (hoy el ΧΡ).
- **Guía de marca** (https://claude.ai/artifact/V2rWgxXXhJef5VdWbXjq3w): **desactualizada.** Todavía muestra el logotipo Aura como logo principal, la tipografía vieja (Bodoni/Archivo) y la portada con ΧΡ. Hay que actualizarla a: opción C, logo en caligrafía A, fondos planos y la portada que elija. Es una página privada del dueño en claude.ai.
- **`marca/LEEME.md` y `LEEME.md`** del repositorio: describen el logotipo Aura como «logotipo principal». Hay que actualizarlos cuando se cierre la marca.
- **Nuevo instalador:** el último publicado es v0.8.0. Todo lo posterior (opción C, logo en caligrafía, portada plana) **solo está en la web**. Compilar v0.9.x o v0.10 cuando el dueño quiera tenerlo instalado. Ojo: el número v0.9.0 quedó usado por la versión revertida; conviene usar **v0.10.0** para evitar confusión.

## C. Fases funcionales pendientes (orden acordado)

1. **Sincronización con iCloud.** Diseño previsto: un archivo de cambios por dispositivo en la carpeta de iCloud, sin servidor. `usuario.db` ya guarda `actualizado` y `borrado` en cada fila.
2. **Audio** (Bible Brain u otra fuente; seguramente no hay audio de la NTV).
3. **Celular** (Tauri 2 compila para iOS y Android; la interfaz ya es responsive, con anchos de 390 px probados).
4. **IA delimitada**, al final: búsqueda por significado local y preguntas con citas verificadas contra la base, con 12 reglas (en `anexos/RESEARCH.md`). El dueño quiere que sea lo último.

### Pendientes pequeños mencionados en su momento

- Notas al pie y párrafos reales de la NTV (hoy se procesan versículo por versículo).
- Exportar notas a Markdown.
- Actualizaciones automáticas de la app.
- Firmar la app (Apple cobra 99 USD al año; es opcional).
- Bajar el peso del DMG (los grabados van dos veces en el binario universal).
- Pedir permiso escrito a Tyndale para guardar la NTV sin conexión.

## D. Ideas sugeridas y no hechas

- Sello gótico en arco (BORN AGAIN) al terminar un libro.
- Staurograma como ícono de referencias cruzadas.
- Planes de lectura sobre la cuadrícula de cobertura; «Hace un año escribiste…».
- Mapas, línea de tiempo y comentarios clásicos de dominio público (Matthew Henry y otros).
- Página web del proyecto y banner de GitHub.
