// Estado de la interfaz (no se guarda): selección, panel abierto, capítulo cargado, avisos.
import { usuario, irA as guardarPosicion } from './usuario.svelte.js';
import { capitulo as cargarCapitulo, info } from './biblia.js';
import { clave, nombreRef, nombreLibro, LIBROS } from './libros.js';

export const ui = $state({
  vista: 'inicio',      // 'inicio' | 'biblioteca' | 'lector' | 'archivo' | 'laminas'
  navAbierta: false,    // selector de libros y capítulos del lector
  buscadorAbierto: false, // búsqueda global (Ctrl/Cmd K)
  coleccion: null,      // colección de láminas abierta: null (índice) | 'tipografia' | 'color' | 'imagen'
  estudioAbierto: false, // el estudio se abre a pedido, como un margen junto al texto
  pestana: 'palabra',
  seleccion: [],        // números de versículo seleccionados
  ancla: null,          // último versículo tocado (para Mayús+clic)
  palabra: null,        // { texto, libro, cap, v }
  lamina: null,         // lámina pedida desde el menú de inicio: { texto, referencia, clave, version, libro, estilo, formato }
  dialogo: null,        // 'versiones' | 'ajustes' | 'respaldo' | 'poster'
  aviso: null,          // { texto, error }
  leyendo: null,        // versículo que lee la voz
  destello: null,       // { libro, cap, v } a resaltar al llegar
  busqueda: '',         // texto enviado desde la barra superior
  cap: { cargando: true, error: '', clave: '', versos: [], titulos: {}, paralelo: null, errorParalelo: '' },
});

let temporizadorAviso;
export function avisar(texto, error = false) {
  ui.aviso = { texto, error };
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => (ui.aviso = null), error ? 5200 : 2600);
}

export const pos = () => usuario.ajustes.pos;

// Cambia de pantalla; al salir del lector se cierran la selección y los paneles
export function abrirVista(v) {
  if (v === 'laminas') ui.coleccion = null;
  if (v !== 'lector') { ui.seleccion = []; ui.navAbierta = false; }
  ui.vista = v;
  if (typeof window !== 'undefined') requestAnimationFrame(() => document.querySelector('.vista')?.scrollTo?.(0, 0));
}

export function irA(libro, cap, v = null) {
  ui.vista = 'lector';
  ui.buscadorAbierto = false;
  ui.seleccion = [];
  ui.ancla = null;
  ui.navAbierta = false;
  ui.destello = v ? { libro, cap, v } : null;
  if (v) ui.seleccion = [v];
  guardarPosicion(libro, cap);
}

export function abrirPestana(p) {
  ui.pestana = p;
  ui.estudioAbierto = true;
}

// Claves de los versículos seleccionados en el capítulo actual
export function clavesSeleccion() {
  const { libro, cap } = pos();
  return [...ui.seleccion].sort((a, b) => a - b).map((v) => clave(libro, cap, v));
}

export function etiquetaSeleccion() {
  const { libro, cap } = pos();
  const s = [...ui.seleccion].sort((a, b) => a - b);
  if (!s.length) return '';
  const contiguo = s.every((v, i) => i === 0 || v === s[i - 1] + 1);
  if (contiguo) return nombreRef(libro, cap, s[0], s.at(-1));
  return `${nombreLibro(LIBROS[libro - 1])} ${cap}:${s.join(', ')}`;
}

let pedido = 0;
export async function recargarCapitulo() {
  const { libro, cap } = pos();
  const { version, paralela, claveNLT } = usuario.ajustes;
  const n = ++pedido;
  ui.cap.cargando = true;
  ui.cap.error = '';
  try {
    const datos = await cargarCapitulo(version, libro, cap, claveNLT);
    if (n !== pedido) return;
    ui.cap.versos = datos.versos;
    ui.cap.titulos = datos.titulos;
    ui.cap.clave = `${libro}.${cap}`;
  } catch (e) {
    if (n !== pedido) return;
    ui.cap.versos = [];
    ui.cap.titulos = {};
    ui.cap.clave = `${libro}.${cap}`;
    ui.cap.error = e.message || String(e);
  }
  ui.cap.paralelo = null;
  ui.cap.errorParalelo = '';
  if (paralela && paralela !== version && info(paralela)) {
    try {
      const p = await cargarCapitulo(paralela, libro, cap, claveNLT);
      if (n === pedido) ui.cap.paralelo = Object.fromEntries(p.versos.map((x) => [x.v, x.texto]));
    } catch (e) {
      if (n === pedido) ui.cap.errorParalelo = e.message || String(e);
    }
  }
  if (n === pedido) ui.cap.cargando = false;
}

export async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}
