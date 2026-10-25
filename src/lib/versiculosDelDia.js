// Versículos para la portada: uno por día. La palabra clave (en español y en inglés) se resalta en rojo.
// Se aceptan varias formas porque cada traducción usa palabras distintas.
const LISTA = [
  [45, 8, 17, null, ['herederos'], ['heirs']],
  [43, 3, 16, null, ['amó', 'amo'], ['loved']],
  [19, 23, 1, null, ['pastor'], ['shepherd']],
  [23, 40, 31, null, ['fuerzas', 'nuevas'], ['strength', 'renew']],
  [50, 4, 13, null, ['Cristo'], ['Christ']],
  [24, 29, 11, null, ['planes', 'pensamientos'], ['plans']],
  [20, 3, 5, null, ['confía', 'fíate', 'fiate'], ['trust']],
  [40, 11, 28, null, ['descanso', 'descansar'], ['rest']],
  [45, 8, 28, null, ['bien'], ['good']],
  [6, 1, 9, null, ['valiente', 'esfuérzate'], ['courageous', 'strong']],
  [55, 1, 7, null, ['temor', 'miedo'], ['fear', 'timidity']],
  [25, 3, 22, 23, ['misericordias', 'fidelidad'], ['mercies', 'faithfulness']],
  [40, 6, 33, null, ['reino'], ['kingdom']],
  [43, 14, 6, null, ['camino'], ['way']],
  [48, 2, 20, null, ['crucificado'], ['crucified']],
  [47, 5, 17, null, ['nueva', 'nuevo', 'nuevas'], ['new']],
  [49, 2, 8, null, ['gracia'], ['grace']],
  [58, 11, 1, null, ['fe'], ['faith']],
  [19, 119, 105, null, ['lámpara', 'lampara'], ['lamp']],
  [33, 6, 8, null, ['humildad', 'humillarte', 'humilde'], ['humbly']],
  [23, 41, 10, null, ['temas', 'teme'], ['fear']],
  [45, 12, 2, null, ['transformen', 'transformaos', 'reformaos'], ['transformed']],
  [43, 8, 12, null, ['luz'], ['light']],
  [19, 27, 1, null, ['luz'], ['light']],
  [40, 5, 14, null, ['luz'], ['light']],
  [62, 4, 19, null, ['amamos', 'amor'], ['love']],
  [66, 21, 5, null, ['nuevas', 'nuevo'], ['new']],
  [1, 1, 1, null, ['principio'], ['beginning']],
  [43, 1, 1, null, ['palabra', 'verbo'], ['word']],
  [23, 9, 6, null, ['paz'], ['peace']],
  [19, 34, 8, null, ['bueno'], ['good']],
  [40, 28, 20, null, ['siempre', 'días'], ['always']],
  [45, 5, 8, null, ['amor'], ['love']],
  [60, 5, 7, null, ['cuida', 'cuidado'], ['cares', 'care']],
  [59, 1, 5, null, ['sabiduría', 'sabiduria'], ['wisdom']],
  [44, 1, 8, null, ['poder', 'virtud'], ['power']],
  [19, 51, 10, null, ['limpio'], ['clean']],
  [43, 11, 25, null, ['resurrección', 'resurreccion'], ['resurrection']],
  [41, 10, 27, null, ['posible', 'posibles'], ['possible']],
  [19, 46, 10, null, ['quietos', 'calma', 'tranquilos'], ['still']],
  [45, 15, 13, null, ['esperanza'], ['hope']],
  [43, 15, 5, null, ['vid'], ['vine']],
];

export function versiculoDelDia(fecha = new Date()) {
  const inicio = new Date(fecha.getFullYear(), 0, 0);
  const dia = Math.floor((fecha - inicio) / 86400000);
  const [libro, cap, v, hasta, es, en] = LISTA[dia % LISTA.length];
  return { libro, cap, v, hasta, claves: { es, en } };
}
