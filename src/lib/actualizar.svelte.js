// Actualizaciones automáticas (solo en la app de escritorio): al abrir, mira en GitHub Releases si hay una
// versión nueva (latest.json, firmado con la clave del proyecto). Si la hay, avisa; con un toque se descarga,
// se verifica la firma, se instala y la app se reinicia.
import { esTauri } from './bd.js';
import { usuario } from './usuario.svelte.js';

// estado: 'nada' | 'buscando' | 'hay' | 'bajando' | 'reiniciando' | 'al-dia' | 'error'
export const act = $state({ estado: 'nada', version: '', notas: '', progreso: 0, error: '', actual: '', oculta: false });
let pendiente = null;

export async function versionActual() {
  if (!esTauri) return '';
  const { getVersion } = await import('@tauri-apps/api/app');
  act.actual = await getVersion();
  return act.actual;
}

export async function buscarActualizacion({ silenciosa = false } = {}) {
  if (!esTauri || act.estado === 'bajando' || act.estado === 'reiniciando') return;
  act.estado = 'buscando';
  act.error = '';
  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    pendiente = await check();
    if (pendiente) {
      act.estado = 'hay';
      act.version = pendiente.version;
      act.notas = pendiente.body || '';
      act.oculta = false;
    } else {
      act.estado = silenciosa ? 'nada' : 'al-dia';
    }
  } catch (e) {
    // sin internet o sin versión publicada con actualizador: al abrir no se molesta a nadie
    act.estado = silenciosa ? 'nada' : 'error';
    act.error = e?.message || String(e);
  }
}

export async function instalarActualizacion() {
  if (!pendiente) return;
  act.estado = 'bajando';
  act.progreso = 0;
  let total = 0;
  let bajado = 0;
  try {
    await pendiente.downloadAndInstall((ev) => {
      if (ev.event === 'Started') total = ev.data.contentLength || 0;
      else if (ev.event === 'Progress') { bajado += ev.data.chunkLength; act.progreso = total ? bajado / total : 0; }
      else if (ev.event === 'Finished') act.progreso = 1;
    });
    act.estado = 'reiniciando';
    const { relaunch } = await import('@tauri-apps/plugin-process');
    await relaunch();
  } catch (e) {
    act.estado = 'error';
    act.error = e?.message || String(e);
  }
}

// Al abrir la app (si no se desactivó en Ajustes), unos segundos después para no frenar el arranque
export function buscarAlAbrir() {
  if (!esTauri) return;
  versionActual();
  if (usuario.ajustes.actualizarSolo === false) return;
  setTimeout(() => buscarActualizacion({ silenciosa: true }), 4000);
}
