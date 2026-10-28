import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'node:fs';
import path from 'node:path';

// En modo navegador sirve datos/biblias.db en /biblias.db (desarrollo) o la copia junto a la web (versión web).
// En la app de escritorio la base viaja como recurso de Tauri.
const servirBiblias = {
  name: 'servir-biblias',
  writeBundle(opciones) {
    if (!process.env.WEB) return;
    fs.copyFileSync(path.resolve('datos/biblias.db'), path.join(opciones.dir, 'biblias.db'));
  },
  configureServer(server) {
    server.middlewares.use('/biblias.db', (req, res) => {
      const archivo = path.resolve('datos/biblias.db');
      if (!fs.existsSync(archivo)) {
        res.statusCode = 404;
        res.end('Falta datos/biblias.db: ejecuta «npm run datos».');
        return;
      }
      res.setHeader('Content-Type', 'application/octet-stream');
      fs.createReadStream(archivo).pipe(res);
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
