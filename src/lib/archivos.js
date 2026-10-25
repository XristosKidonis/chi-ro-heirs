// Guardar archivos: diálogo nativo en la app de escritorio, descarga en el navegador.
import { esTauri } from './bd.js';

export async function guardarArchivo(nombre, contenido, filtro) {
  if (esTauri) {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const { writeFile, writeTextFile } = await import('@tauri-apps/plugin-fs');
    const ruta = await save({ defaultPath: nombre, filters: filtro ? [filtro] : undefined });
    if (!ruta) return false;
    if (typeof contenido === 'string') await writeTextFile(ruta, contenido);
    else await writeFile(ruta, contenido);
    return true;
  }
  const blob = typeof contenido === 'string' ? new Blob([contenido], { type: 'application/json' }) : new Blob([contenido]);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return true;
}

export async function abrirEnNavegador(url) {
  if (esTauri) {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url);
  } else {
    window.open(url, '_blank', 'noopener');
  }
}
