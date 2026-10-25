// Acceso a SQLite con la misma interfaz en la app de escritorio (Tauri) y en el navegador.
//   bd.select(sql, params) -> filas como objetos
//   bd.execute(sql, params)
// En Tauri: plugin oficial tauri-plugin-sql (SQLite nativo con FTS5).
// En el navegador (desarrollo y pruebas): SQLite compilado a WebAssembly.

export const esTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

let sqlitePromesa = null;
function sqliteWeb() {
  sqlitePromesa ??= import('@sqlite.org/sqlite-wasm').then((m) => m.default({ print: () => {}, printErr: () => {} }));
  return sqlitePromesa;
}

function envolverWeb(db) {
  return {
    async select(sql, params = []) {
      return db.selectObjects(sql, params);
    },
    async execute(sql, params = []) {
      db.exec({ sql, bind: params });
    },
  };
}

async function biblias() {
  if (esTauri) {
    const { default: Database } = await import('@tauri-apps/plugin-sql');
    // Rust copia la base incluida a la carpeta de configuración de la app al arrancar.
    return Database.load('sqlite:biblias.db');
  }
  const sqlite3 = await sqliteWeb();
  const r = await fetch('/biblias.db');
  if (!r.ok) throw new Error('No se encontró la base de datos bíblica. Ejecuta «npm run datos».');
  const bytes = new Uint8Array(await r.arrayBuffer());
  const p = sqlite3.wasm.allocFromTypedArray(bytes);
  const db = new sqlite3.oo1.DB();
  const rc = sqlite3.capi.sqlite3_deserialize(
    db.pointer, 'main', p, bytes.byteLength, bytes.byteLength,
    sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE | sqlite3.capi.SQLITE_DESERIALIZE_READONLY,
  );
  db.checkRc(rc);
  return envolverWeb(db);
}

async function usuario() {
  if (esTauri) {
    const { default: Database } = await import('@tauri-apps/plugin-sql');
    return Database.load('sqlite:usuario.db');
  }
  const sqlite3 = await sqliteWeb();
  // En el navegador los datos del usuario viven en localStorage (kvvfs).
  try {
    return envolverWeb(new sqlite3.oo1.JsStorageDb('local'));
  } catch {
    return envolverWeb(new sqlite3.oo1.DB(':memory:'));
  }
}

let cacheBiblias = null;
let cacheUsuario = null;
export const bdBiblias = () => (cacheBiblias ??= biblias());
export const bdUsuario = () => (cacheUsuario ??= usuario());

// fetch que en Tauri pasa por Rust (sin restricciones CORS) y en el navegador usa el nativo.
export async function pedir(url) {
  if (esTauri) {
    const { fetch: fetchTauri } = await import('@tauri-apps/plugin-http');
    return fetchTauri(url, { method: 'GET' });
  }
  return fetch(url);
}
