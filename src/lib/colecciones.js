// Las tres colecciones de la galería de láminas. Cada acabado del motor (ESTILOS) está en alguna;
// pruebas/navegador.mjs comprueba que no quede ninguno afuera.
export const COLECCIONES = [
  { id: 'tipografia', piezas: [{ estilo: 'aura' }, { estilo: 'primario' }, { estilo: 'pedreria' }] },
  { id: 'color', piezas: [{ estilo: 'ultramar' }, { estilo: 'riso', tono: 'amarillo' }, { estilo: 'riso', tono: 'verde' }, { estilo: 'calor' }] },
  { id: 'imagen', piezas: [{ estilo: 'aerosol' }, { estilo: 'portadilla' }] },
].map((c) => ({ ...c, piezas: c.piezas.map((p) => ({ ...p, id: p.tono ? `${p.estilo}-${p.tono}` : p.estilo })) }));
