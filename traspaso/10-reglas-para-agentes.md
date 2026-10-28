# 10. Reglas para cualquier agente que siga este proyecto

## Forma de trabajar con el dueño (lo más importante)

1. **El dueño dirige los cambios estéticos.**
   - No apliques cambios visuales amplios por tu cuenta.
   - Ante cualquier cambio de diseño: arma **2 a 4 opciones** como imágenes (maquetas o capturas), da **una recomendación** y espera que elija. Después aplica **solo lo elegido**.
   - Antecedente: la v0.9.0 se revirtió porque el agente aplicó todas las referencias de golpe y al dueño le asustó.
2. **Muéstrale, no le describas.** Reacciona a lo que ve. Usa el enlace web (https://xristoskidonis.github.io/chi-ro-heirs/), que se actualiza solo en 2 o 3 minutos con cada push a `main`, o mándale capturas.
3. **Fidelidad a las referencias.** Cuando pide algo «como la referencia», lo quiere parecido de verdad. Nada de agregar elementos que la referencia no tiene: recuadros, destellos, marcas de agua.
4. **No mezcles referencias con capturas de crítica.**
   - `imagenes/A-…` es inspiración.
   - `imagenes/B-…` son capturas de la app que él mandó para decir qué no le gusta.
5. **Sé honesto sobre qué es intento y qué es final.** Marca el estado de las cosas (aprobado, provisional, descartado o pendiente).
6. **Escribe en español**, claro y breve. El dueño escribe rápido y por voz: interpreta la intención y, si algo es ambiguo, ofrece opciones.

## Restricciones legales y de marca

| Regla | Por qué |
|---|---|
| **No usar el nombre, el logo ni el emblema de Holy Saints** | Es una marca registrada. Solo se toma su lenguaje visual como inspiración |
| **No guardar la NTV ni la NLT en disco** (ni en la base, ni en caché persistente, ni en el repositorio) | Términos de Tyndale (api.nlt.to): uso personal no comercial, solo en línea. Se piden al leer y viven en memoria |
| **No subir imágenes con copyright al repositorio** (por ejemplo, las de Pinterest) | El repositorio es público. Las imágenes propias del usuario viven solo en su `usuario.db`. Las referencias de la carpeta A de este traspaso **no** se suben al repositorio (están en `.gitignore`) |
| **Los grabados de Doré son de dominio público** (1866, vía Project Gutenberg #8710) | Se pueden distribuir; hay que mantener el crédito |
| **Las fuentes deben ser libres** (SIL OFL o similar) | La app es open source (MIT) y se distribuye |
| **Atribuciones obligatorias:** OpenBible (CC BY), STEPBible (CC BY 4.0), Open Scriptures Strong (CC BY-SA) y el aviso de la NTV y la NLT | Están en `LEEME.md` y en la app; no quitarlas |
| **Canon protestante (66 libros)** | Decisión del dueño |
| **El ΧΡ (crismón) es de libre uso** | Símbolo cristiano del siglo IV. Aun así, el dueño rechazó usarlo de fondo y en el arranque |

## Reglas técnicas y de repositorio

- **Repositorio:** `XristosKidonis/chi-ro-heirs`.
  - Hoy se trabaja en la rama **`diseno/white-industrial`**.
  - Los pushes a `main` publican la web automáticamente: **no mezclar a `main` sin la aprobación del dueño.**
- **Antes de dar algo por terminado:** correr `node pruebas/navegador.mjs <carpeta>` con `npm run dev` en marcha. Los **33 pasos** deben pasar y no debe haber errores de consola. En Windows, usar `DIRECCION=http://localhost:1420/`.
  - Si se toca la interfaz: también `node pruebas/solapes.mjs <carpeta>`. **Nada se puede chocar** (pedido del dueño).
  - Para lo que importe en Mac: las dos con WebKit (`MOTOR=webkit` en la suite; `webkit` como segundo argumento en solapes).
  - Si se toca la NTV: probar también con la API real (solo en memoria; no guardar su texto en disco).
  - Si se toca cómo la web baja o guarda archivos: probar la compilación web (`WEB=1 npx vite build`) servida en `/chi-ro-heirs/` **con compresión gzip**, como GitHub Pages. `vite preview` no comprime, y así se escapó un error que dejó la web caída (documento 13). Después de publicar, abrir la web real.
  - Las pruebas se juntan: varios cambios y una sola tanda al final, siempre antes de publicar (pedido del dueño).
- **Instaladores:** cada compilación crea una **release pública**. Solo con la frase del dueño «dale, publica la vX.Y.Z». **No reutilizar v0.9.0**: fue revertida y nunca se publicó. El proceso:
  1. Subir la versión en `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` y `src-tauri/Cargo.lock`.
  2. Si cambia el número mayor o menor, regenerar el arte con `node herramientas/instalador.mjs`.
  3. Correr las pruebas, hacer el commit y subirlo.
  4. Lanzar `gh workflow run compilar.yml --ref diseno/white-industrial`.
- **Firma de actualizaciones:** la clave privada vive solo en los secretos del repositorio. No pedirla ni guardarla en el repositorio.
- **Dependencias nuevas:** con al menos dos semanas de publicadas.
- **Licencias GPL:** lo que tenga licencia GPL (como eSpeak NG) no va dentro del instalador; se descarga aparte.
- **Código:** seguir el estilo existente. Nombres y comentarios en español, Svelte 5 con runes, CSS con tokens en `src/app.css` y los textos de la interfaz en `src/lib/i18n.svelte.js`, siempre en español **e** inglés.
- **Láminas:** cualquier efecto debe hacerse a mano en Canvas 2D (sin `ctx.filter`), porque el WebKit de Mac no lo soporta.
- **Mensajes de commit:** en español y descriptivos, como el historial («Portada y arranque sin degradado ni ΧΡ»).

## Qué está en juego (para priorizar)

- Lo **funcional** está sólido y probado: no hace falta rehacerlo.
- La **estética** es la prioridad del dueño hoy. La app tiene que sentirse como sus referencias (editorial, Pinterest, cristiana, joven) sin volverse ruidosa ni genérica.
- El siguiente paso natural es que **elija la portada** (`E04`) y que después se revisen **pantalla por pantalla** las demás, con opciones.
