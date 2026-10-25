import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'node:fs';
import path from 'node:path';

// En modo navegador (desarrollo y pruebas) sirve datos/biblias.db en /biblias.db.
// En la app de escritorio la base viaja como recurso de Tauri.
const servirBiblias = {
  name: 'servir-biblias',
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

export default defineConfig({
  plugins: [svelte(), servirBiblias],
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  optimizeDeps: { exclude: ['@sqlite.org/sqlite-wasm'] },
  build: { target: 'es2022', sourcemap: false },
});
