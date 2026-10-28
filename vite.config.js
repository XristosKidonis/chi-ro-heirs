import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// En modo navegador sirve datos/biblias.db en /biblias.db (desarrollo) o la copia junto a la web (versión web).
// En la app de escritorio la base viaja como recurso de Tauri.
// Junto a la base va biblias.version: una huella de su contenido. La web guarda la base en el navegador y solo
// la vuelve a bajar si la huella cambió.
const BASE = path.resolve('datos/biblias.db');
let huellaGuardada = null; // { mtime, huella }: calcularla lee 170 MB, así que se recuerda mientras el archivo no cambie
function huellaBase() {
  const mtime = fs.statSync(BASE).mtimeMs;
  if (huellaGuardada?.mtime !== mtime) huellaGuardada = { mtime, huella: crypto.createHash('sha256').update(fs.readFileSync(BASE)).digest('hex').slice(0, 16) };
  return huellaGuardada.huella;
}
const servirBiblias = {
  name: 'servir-biblias',
  writeBundle(opciones) {
    if (!process.env.WEB) return;
    fs.copyFileSync(BASE, path.join(opciones.dir, 'biblias.db'));
    fs.writeFileSync(path.join(opciones.dir, 'biblias.version'), huellaBase());
  },
  configureServer(server) {
    const falta = (res) => { res.statusCode = 404; res.end('Falta datos/biblias.db: ejecuta «npm run datos».'); };
    server.middlewares.use('/biblias.version', (req, res) => {
      if (!fs.existsSync(BASE)) return falta(res);
      res.setHeader('Content-Type', 'text/plain');
      res.end(huellaBase());
    });
    server.middlewares.use('/biblias.db', (req, res) => {
      if (!fs.existsSync(BASE)) return falta(res);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', fs.statSync(BASE).size); // la web copia la base por partes y necesita saber el tamaño
      fs.createReadStream(BASE).pipe(res);
    });
  },
};

// WEB=1 arma la versión web de prueba (GitHub Pages), que vive en /chi-ro-heirs/.
export default defineConfig({
  base: process.env.WEB ? '/chi-ro-heirs/' : '/',
  plugins: [svelte(), servirBiblias],
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  optimizeDeps: { exclude: ['@sqlite.org/sqlite-wasm', 'onnxruntime-web'] },
  build: { target: 'es2022', sourcemap: false },
});
