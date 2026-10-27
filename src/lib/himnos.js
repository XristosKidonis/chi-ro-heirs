// Himnos de dominio público para el ambiente, escritos nota:duración. La armonía se calcula sola:
// en cada tramo se elige el acorde de la tonalidad (I, IV, V, vi, ii) que mejor contiene la melodía.

const CRUDOS = [
  {
    titulo: { es: 'Sublime gracia', en: 'Amazing Grace' }, // New Britain (1829)
    tonica: 7, compas: 3, anacrusa: 1, segundosPorTiempo: 0.86,
    melodia: `D4:1 | G4:2 B4:.5 G4:.5 | B4:2 A4:1 | G4:2 E4:1 | D4:2 D4:1 | G4:2 B4:.5 G4:.5 | B4:2 A4:1 | D5:5
      B4:1 | D5:2 B4:.5 G4:.5 | B4:2 A4:1 | G4:2 E4:1 | D4:2 D4:1 | G4:2 B4:.5 G4:.5 | B4:2 A4:1 | G4:3`,
  },
  {
    titulo: { es: 'Doxología', en: 'Doxology' }, // Old Hundredth (Genevan Psalter, 1551)
    tonica: 7, compas: 2, anacrusa: 0, segundosPorTiempo: 0.82,
    melodia: `G4:2 G4:1 F#4:1 E4:1 D4:1 G4:1 A4:1 B4:2 R:2
      B4:2 B4:1 B4:1 A4:1 G4:1 C5:1 B4:1 A4:2 R:2
      G4:2 A4:1 B4:1 A4:1 G4:1 E4:1 F#4:1 G4:2 R:2
      D5:2 B4:1 G4:1 A4:1 C5:1 B4:1 A4:1 G4:4`,
  },
  {
    titulo: { es: 'Noche de paz', en: 'Silent Night' }, // Stille Nacht (Gruber, 1818); en corcheas
    tonica: 0, compas: 6, anacrusa: 0, segundosPorTiempo: 0.37,
    melodia: `G4:1.5 A4:.5 G4:1 E4:3 | G4:1.5 A4:.5 G4:1 E4:3 | D5:2 D5:1 B4:3 | C5:2 C5:1 G4:3 |
      A4:2 A4:1 C5:1.5 B4:.5 A4:1 | G4:1.5 A4:.5 G4:1 E4:3 | A4:2 A4:1 C5:1.5 B4:.5 A4:1 | G4:1.5 A4:.5 G4:1 E4:3 |
      D5:2 D5:1 F5:1.5 D5:.5 B4:1 | C5:3 E5:3 | C5:1.5 G4:.5 E4:1 G4:1.5 F4:.5 D4:1 | C4:6`,
  },
  {
    titulo: { es: 'Himno de la alegría', en: 'Ode to Joy' }, // Beethoven (1824)
    tonica: 2, compas: 2, anacrusa: 0, segundosPorTiempo: 0.74, transponer: 12,
    melodia: `F#4:1 F#4:1 G4:1 A4:1 | A4:1 G4:1 F#4:1 E4:1 | D4:1 D4:1 E4:1 F#4:1 | F#4:1.5 E4:.5 E4:2 |
      F#4:1 F#4:1 G4:1 A4:1 | A4:1 G4:1 F#4:1 E4:1 | D4:1 D4:1 E4:1 F#4:1 | E4:1.5 D4:.5 D4:2 |
      E4:1 E4:1 F#4:1 D4:1 | E4:1 F#4:.5 G4:.5 F#4:1 D4:1 | E4:1 F#4:.5 G4:.5 F#4:1 E4:1 | D4:1 E4:1 A3:2 |
      F#4:1 F#4:1 G4:1 A4:1 | A4:1 G4:1 F#4:1 E4:1 | D4:1 D4:1 E4:1 F#4:1 | E4:1.5 D4:.5 D4:2`,
  },
];

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function midiDe(nombre) {
  const m = nombre.match(/^([A-G])([#b]?)(\d)$/);
  if (!m) throw new Error(`nota inválida: ${nombre}`);
  return 12 * (Number(m[3]) + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

// grados de la escala mayor: raíz (en semitonos desde la tónica), tipo y preferencia
const GRADOS = [[0, [0, 4, 7], 0.3], [7, [0, 4, 7], 0.25], [7, [0, 4, 7, 10], 0.1], [5, [0, 4, 7], 0.2], [9, [0, 3, 7], 0.05], [2, [0, 3, 7], 0]];

function acordePara(notas, tonica) {
  let mejor = null;
  for (const [raiz, tipo, extra] of GRADOS) {
    const pcs = tipo.map((x) => (tonica + raiz + x) % 12);
    const puntos = notas.reduce((s, n) => s + (pcs.includes(n.midi % 12) ? n.dur : 0), 0) + extra;
    if (!mejor || puntos > mejor.puntos) mejor = { puntos, raiz: (tonica + raiz) % 12, pcs };
  }
  return mejor;
}

const enRango = (pc, desde) => desde + ((pc - desde) % 12 + 12) % 12;

function preparar(h) {
  const notas = [];
  let t = 0;
  for (const tok of h.melodia.split(/\s+/).filter((x) => x && x !== '|')) {
    const [n, d] = tok.split(':');
    const dur = Number(d);
    if (n !== 'R') notas.push({ t, dur, midi: midiDe(n) + (h.transponer || 0) });
    t += dur;
  }
  const total = t;
  const eventos = [];
  const humano = () => (Math.random() - 0.5) * 0.03;
  for (const n of notas) eventos.push({ t: n.t + humano(), midi: n.midi, fuerza: 0.4 + Math.random() * 0.06, duracion: Math.max(0.5, n.dur * h.segundosPorTiempo * 1.05) });
  // tramos de armonía: la anacrusa y después cada compás
  const cortes = [0];
  for (let x = h.anacrusa || h.compas; x < total; x += h.compas) cortes.push(x);
  cortes.push(total);
  for (let i = 0; i < cortes.length - 1; i++) {
    const [a, b] = [cortes[i], cortes[i + 1]];
    const dentro = notas.filter((n) => n.t < b && n.t + n.dur > a).map((n) => ({ ...n, dur: Math.min(b, n.t + n.dur) - Math.max(a, n.t) }));
    if (!dentro.length) continue;
    const ac = acordePara(dentro, h.tonica);
    const dur = (b - a) * h.segundosPorTiempo;
    eventos.push({ t: a, midi: enRango(ac.raiz, 38), fuerza: 0.2, duracion: dur, bajo: true });
    ac.pcs.slice(1).forEach((pc, j) => eventos.push({ t: a + 0.04 * (j + 1), midi: enRango(pc, 48), fuerza: 0.13, duracion: dur }));
  }
  eventos.sort((x, y) => x.t - y.t);
  return { ...h, eventos, total };
}

export const HIMNOS = CRUDOS.map(preparar);
