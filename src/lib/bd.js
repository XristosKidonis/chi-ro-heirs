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
  let copia;
  try {
    copia = await copiarAlSqlite(sqlite3, await respuestaBiblias());
  } catch (e) {
    // una copia guardada dañada (p. ej. se cortó mientras se guardaba) no puede dejar la app sin abrir:
    // se borra y se baja otra vez, una sola vez
    console.warn('La copia guardada de la base no sirvió; se baja de nuevo', e);
    if (typeof caches === 'undefined' || !(await caches.delete(ALMACEN))) throw e;
    copia = await copiarAlSqlite(sqlite3, await respuestaBiblias());
  }
  const { p, largo } = copia;
  const db = new sqlite3.oo1.DB();
  const rc = sqlite3.capi.sqlite3_deserialize(
    db.pointer, 'main', p, largo, largo,
    sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE | sqlite3.capi.SQLITE_DESERIALIZE_READONLY,
  );
  db.checkRc(rc);
  return envolverWeb(db);
}

// La base de la web (~170 MB) queda guardada en el navegador (Cache API) y solo se vuelve a bajar si cambió:
// biblias.version trae una huella de su contenido. Se pide además que el navegador no la borre por falta de
// espacio. Sin Cache API (modo privado, http), se baja como antes.
const ALMACEN = 'chiro-biblias';
async function respuestaBiblias() {
  const url = new URL(`${import.meta.env.BASE_URL}biblias.db`, location.href).href;
  const bajar = async () => {
    const r = await fetch(url);
    if (!r.ok) throw new Error('No se encontró la base de datos bíblica. Ejecuta «npm run datos».');
    return r;
  };
  // En navegación privada (Safari) se puede «guardar» pero no queda nada: se recuerda para no bajarla dos veces.
  // La marca vence a los 7 días, por si fue un problema pasajero (p. ej. el teléfono sin espacio).
  const SIN_COPIA = 'chiro-biblias-sin-copia';
  const sinCopia = () => { try { return Date.now() - Number(localStorage.getItem(SIN_COPIA) || 0) < 7 * 864e5; } catch { return true; } };
  if (typeof caches === 'undefined' || sinCopia()) return bajar();
  try {
    const huella = (await fetch(`${import.meta.env.BASE_URL}biblias.version`, { cache: 'no-store' }).then((x) => (x.ok ? x.text() : '')).catch(() => '')).trim();
    const almacen = await caches.open(ALMACEN);
    const clave = `${url}?v=${encodeURIComponent(huella)}`;
    // ignoreVary: el servidor manda «Vary» (Origin, Accept-Encoding) y WebKit no encontraba la copia al recargar
    const buscar = () => almacen.match(clave, { ignoreVary: true });
    const guardada = huella && (await buscar());
    if (guardada) return guardada;
    if (!huella) return bajar(); // sin huella no se puede saber si la copia sirve: mejor no guardar
    // se guarda entera y se lee desde lo guardado: así no queda una segunda copia en memoria mientras baja
    await almacen.put(clave, await bajar());
    for (const viejo of await almacen.keys()) if (viejo.url !== clave) await almacen.delete(viejo);
    navigator.storage?.persist?.().catch(() => {});
    const recien = await buscar();
    if (recien) return recien;
    try { localStorage.setItem(SIN_COPIA, String(Date.now())); } catch { /* sin almacenamiento: igual se baja sin guardar */ }
    return bajar();
  } catch (e) {
    console.warn('No se pudo guardar la base en el navegador; se baja sin guardar', e);
    return bajar();
  }
}

// Copia la base a la memoria de SQLite por partes, a medida que se lee, en vez de tenerla entera dos veces
// (el archivo y su copia): en un iPhone eso baja el pico de memoria de ~340 a ~170 MB.
async function copiarAlSqlite(sqlite3, r) {
  const largo = Number(r.headers.get('content-length')) || 0;
  if (!largo || !r.body?.getReader) {
    const bytes = new Uint8Array(await r.arrayBuffer());
    return { p: sqlite3.wasm.allocFromTypedArray(bytes), largo: bytes.byteLength };
  }
  const p = sqlite3.wasm.alloc(largo);
  const lector = r.body.getReader();
  let hecho = 0;
  try {
    for (;;) {
      const { done, value } = await lector.read();
      if (done) break;
      if (hecho + value.length > largo) throw new Error('La base de datos bíblica llegó más larga de lo esperado.');
      sqlite3.wasm.heap8u().set(value, p + hecho); // heap8u() de nuevo cada vez: la memoria puede haber crecido
      hecho += value.length;
    }
    if (hecho !== largo) throw new Error('La base de datos bíblica llegó incompleta. Vuelve a abrir la app.');
  } catch (e) {
    sqlite3.wasm.dealloc(p);
    throw e;
  }
  return { p, largo };
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
