// Datos del usuario: subrayados, notas, memoria, capítulos leídos, cintas, portadas propias y ajustes.
// Viven en memoria (reactivos) y se escriben en usuario.db. Cada fila guarda «actualizado»
// y «borrado» para poder sincronizar entre dispositivos más adelante.
import { bdUsuario } from './bd.js';
import { referenciasEnTexto, clave } from './libros.js';

export const AJUSTES_INICIALES = {
  idioma: 'es',           // idioma de la interfaz: es | en
  mostrarInicio: true,    // portada y menú al abrir
  grabados: true,         // grabado a toda página al abrir cada libro
  version: 'NTV',
  paralela: '',
  tema: 'cuero',          // cuero | papel | sistema
  tamano: 21,
  interlineado: 1.6,
  fuente: 'literata',     // literata | atkinson
  modoLector: false,      // oculta números de versículo
  parrafo: false,
  claveNLT: 'TEST',
  velocidadVoz: 1,
  pos: { libro: 1, cap: 1 },
  historial: [],
};

export const usuario = $state({
  listo: false,
  error: '',
  subrayados: {},   // "43.3.16" -> color
  notas: [],
  memoria: [],
  leidos: {},       // "43.3" -> fecha
  cintas: [],
  portadas: {},     // libro -> imagen propia (data URL); solo en este equipo
  ajustes: { ...AJUSTES_INICIALES },
});

const TABLAS = [
  `CREATE TABLE IF NOT EXISTS subrayados (clave TEXT PRIMARY KEY, color TEXT, actualizado INTEGER, borrado INTEGER DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS notas (id TEXT PRIMARY KEY, ref TEXT, hasta INTEGER, tipo TEXT, texto TEXT,
     respondida INTEGER DEFAULT 0, creada INTEGER, actualizado INTEGER, borrado INTEGER DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS memoria (ref TEXT PRIMARY KEY, intervalo REAL, proxima INTEGER, aciertos INTEGER,
     creada INTEGER, actualizado INTEGER, borrado INTEGER DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS leidos (cap TEXT PRIMARY KEY, fecha INTEGER, actualizado INTEGER, borrado INTEGER DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS cintas (id TEXT PRIMARY KEY, libro INTEGER, cap INTEGER, color TEXT,
     creada INTEGER, actualizado INTEGER, borrado INTEGER DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS portadas (libro INTEGER PRIMARY KEY, imagen TEXT, actualizado INTEGER, borrado INTEGER DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS ajustes (clave TEXT PRIMARY KEY, valor TEXT, actualizado INTEGER)`,
];

const ahora = () => Date.now();
const nuevoId = () => (crypto.randomUUID ? crypto.randomUUID() : `${ahora()}-${Math.random().toString(36).slice(2)}`);
let db = null;

async function ejecutar(sql, params) {
  try {
    await db.execute(sql, params);
  } catch (e) {
    usuario.error = `${e.message || e}`;
    console.error(e);
  }
}

export async function iniciarUsuario() {
  db = await bdUsuario();
  for (const t of TABLAS) await db.execute(t);
  const vivos = (t) => db.select(`SELECT * FROM ${t} WHERE borrado = 0`);
  for (const f of await vivos('subrayados')) usuario.subrayados[f.clave] = f.color;
  usuario.notas = (await vivos('notas')).map((n) => ({ ...n, respondida: !!Number(n.respondida) }))
    .sort((a, b) => b.creada - a.creada);
  usuario.memoria = await vivos('memoria');
  for (const f of await vivos('leidos')) usuario.leidos[f.cap] = Number(f.fecha);
  usuario.cintas = await vivos('cintas');
  for (const f of await vivos('portadas')) usuario.portadas[f.libro] = f.imagen;
  for (const f of await db.select('SELECT clave, valor FROM ajustes')) {
    try { usuario.ajustes[f.clave] = JSON.parse(f.valor); } catch { /* valor corrupto: se ignora */ }
  }
  usuario.listo = true;
}

// ---------- ajustes ----------
export function ajustar(k, v) {
  usuario.ajustes[k] = v;
  ejecutar('INSERT OR REPLACE INTO ajustes (clave, valor, actualizado) VALUES (?, ?, ?)', [k, JSON.stringify(v), ahora()]);
}

export function irA(libro, cap) {
  const h = [{ libro, cap }, ...usuario.ajustes.historial.filter((x) => x.libro !== libro || x.cap !== cap)].slice(0, 20);
  ajustar('pos', { libro, cap });
  ajustar('historial', h);
}

// ---------- subrayados ----------
export function subrayar(claves, color) {
  for (const k of claves) {
    if (color) usuario.subrayados[k] = color;
    else delete usuario.subrayados[k];
    ejecutar('INSERT OR REPLACE INTO subrayados (clave, color, actualizado, borrado) VALUES (?, ?, ?, ?)',
      [k, color || null, ahora(), color ? 0 : 1]);
  }
}

// ---------- notas ----------
export const TIPOS_NOTA = ['Nota', 'Observación', 'Pregunta', 'Aplicación', 'Oración'];

export function guardarNota({ id, ref, hasta = null, tipo = 'Nota', texto, respondida = false }) {
  const t = ahora();
  let nota = id && usuario.notas.find((n) => n.id === id);
  if (nota) {
    Object.assign(nota, { tipo, texto, respondida, actualizado: t });
  } else {
    nota = { id: nuevoId(), ref, hasta, tipo, texto, respondida, creada: t, actualizado: t };
    usuario.notas.unshift(nota);
  }
  ejecutar(`INSERT OR REPLACE INTO notas (id, ref, hasta, tipo, texto, respondida, creada, actualizado, borrado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
  [nota.id, nota.ref, nota.hasta, nota.tipo, nota.texto, nota.respondida ? 1 : 0, nota.creada, nota.actualizado]);
  return nota;
}

export function borrarNota(id) {
  usuario.notas = usuario.notas.filter((n) => n.id !== id);
  ejecutar('UPDATE notas SET borrado = 1, actualizado = ? WHERE id = ?', [ahora(), id]);
}

export const notasDe = (k) => usuario.notas.filter((n) => n.ref === k);

// Retroenlaces: versículo -> notas (de otros versículos) que lo mencionan
export function indiceRetroenlaces(notas) {
  const idx = {};
  for (const n of notas) {
    for (const { ref } of referenciasEnTexto(n.texto)) {
      const fin = Math.min(ref.hasta || ref.v, ref.v + 40);
      for (let v = ref.v; v <= fin; v++) {
        const k = clave(ref.libro, ref.cap, v);
        if (k === n.ref) continue;
        (idx[k] ||= []).push(n.id);
      }
    }
  }
  return idx;
}

// ---------- capítulos leídos ----------
export function marcarLeido(libro, cap, leido = true) {
  const k = `${libro}.${cap}`;
  if (leido) usuario.leidos[k] = ahora();
  else delete usuario.leidos[k];
  ejecutar('INSERT OR REPLACE INTO leidos (cap, fecha, actualizado, borrado) VALUES (?, ?, ?, ?)',
    [k, ahora(), ahora(), leido ? 0 : 1]);
}

// ---------- cintas marcapáginas ----------
export function alternarCinta(libro, cap) {
  const existente = usuario.cintas.find((c) => c.libro === libro && c.cap === cap);
  if (existente) {
    usuario.cintas = usuario.cintas.filter((c) => c !== existente);
    ejecutar('UPDATE cintas SET borrado = 1, actualizado = ? WHERE id = ?', [ahora(), existente.id]);
    return false;
  }
  const c = { id: nuevoId(), libro, cap, color: 'rojo', creada: ahora(), actualizado: ahora() };
  usuario.cintas.unshift(c);
  ejecutar('INSERT OR REPLACE INTO cintas (id, libro, cap, color, creada, actualizado, borrado) VALUES (?, ?, ?, ?, ?, ?, 0)',
    [c.id, c.libro, c.cap, c.color, c.creada, c.actualizado]);
  return true;
}

// ---------- portadas propias ----------
// La imagen que el usuario elige para abrir un libro (por ejemplo, de su tablero de Pinterest).
// Se guarda solo en usuario.db: no viaja con el respaldo ni con el repositorio.
export function ponerPortada(libro, imagen) {
  if (imagen) usuario.portadas[libro] = imagen;
  else delete usuario.portadas[libro];
  ejecutar('INSERT OR REPLACE INTO portadas (libro, imagen, actualizado, borrado) VALUES (?, ?, ?, ?)',
    [libro, imagen || null, ahora(), imagen ? 0 : 1]);
}

// ---------- memorización (repetición espaciada sencilla) ----------
const DIA = 86400000;
export function memorizar(ref) {
  if (usuario.memoria.some((m) => m.ref === ref)) return false;
  const m = { ref, intervalo: 1, proxima: ahora(), aciertos: 0, creada: ahora(), actualizado: ahora() };
  usuario.memoria.push(m);
  guardarMemoria(m);
  return true;
}

export function repasar(ref, recordado) {
  const m = usuario.memoria.find((x) => x.ref === ref);
  if (!m) return;
  m.intervalo = recordado ? Math.max(1, m.intervalo * 2.2) : 1;
  m.aciertos = recordado ? m.aciertos + 1 : 0;
  m.proxima = ahora() + (recordado ? m.intervalo * DIA : DIA / 3);
  m.actualizado = ahora();
  guardarMemoria(m);
}

export function quitarMemoria(ref) {
  usuario.memoria = usuario.memoria.filter((m) => m.ref !== ref);
  ejecutar('UPDATE memoria SET borrado = 1, actualizado = ? WHERE ref = ?', [ahora(), ref]);
}

function guardarMemoria(m) {
  ejecutar(`INSERT OR REPLACE INTO memoria (ref, intervalo, proxima, aciertos, creada, actualizado, borrado)
            VALUES (?, ?, ?, ?, ?, ?, 0)`, [m.ref, m.intervalo, m.proxima, m.aciertos, m.creada, m.actualizado]);
}

// ---------- respaldo ----------
export function exportar() {
  return {
    app: 'Chi-Ro Heirs',
    formato: 1,
    exportado: new Date().toISOString(),
    subrayados: usuario.subrayados,
    notas: usuario.notas,
    memoria: usuario.memoria,
    leidos: usuario.leidos,
    cintas: usuario.cintas,
    ajustes: usuario.ajustes,
  };
}

// Fusiona un respaldo sin borrar lo existente. Devuelve cuántos elementos se añadieron.
export function importar(datos) {
  if (!datos || datos.app !== 'Chi-Ro Heirs') throw new Error('El archivo no es un respaldo de Chi-Ro Heirs.');
  let n = 0;
  for (const [k, color] of Object.entries(datos.subrayados || {})) {
    if (!usuario.subrayados[k]) { subrayar([k], color); n++; }
  }
  const ids = new Set(usuario.notas.map((x) => x.id));
  for (const nota of datos.notas || []) {
    if (ids.has(nota.id)) continue;
    usuario.notas.push({ ...nota });
    ejecutar(`INSERT OR REPLACE INTO notas (id, ref, hasta, tipo, texto, respondida, creada, actualizado, borrado)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [nota.id, nota.ref, nota.hasta ?? null, nota.tipo, nota.texto, nota.respondida ? 1 : 0, nota.creada, nota.actualizado || nota.creada]);
    n++;
  }
  usuario.notas.sort((a, b) => b.creada - a.creada);
  for (const m of datos.memoria || []) if (memorizar(m.ref)) n++;
  for (const k of Object.keys(datos.leidos || {})) {
    if (!usuario.leidos[k]) { const [b, c] = k.split('.').map(Number); marcarLeido(b, c); n++; }
  }
  for (const c of datos.cintas || []) {
    if (!usuario.cintas.some((x) => x.libro === c.libro && x.cap === c.cap)) { alternarCinta(c.libro, c.cap); n++; }
  }
  return n;
}
