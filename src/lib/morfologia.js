// Traduce los códigos morfológicos de STEPBible a texto legible (español e inglés).
// Griego: códigos Robinson (V-AAI-3S, N-NSF). Hebreo: códigos OSHB (HVqp3ms, HR/Ncfsa).

const T = {
  es: {
    pos: { N: 'Sustantivo', V: 'Verbo', A: 'Adjetivo', T: 'Artículo', P: 'Pronombre personal', R: 'Pronombre relativo', C: 'Pronombre recíproco',
      D: 'Pronombre demostrativo', K: 'Pronombre correlativo', I: 'Pronombre interrogativo', X: 'Pronombre indefinido', Q: 'Pronombre correlativo',
      F: 'Pronombre reflexivo', S: 'Pronombre posesivo', ADV: 'Adverbio', CONJ: 'Conjunción', COND: 'Condicional', PREP: 'Preposición',
      PRT: 'Partícula', INJ: 'Interjección', ARAM: 'Palabra aramea', HEB: 'Palabra hebrea' },
    caso: { N: 'nominativo', G: 'genitivo', D: 'dativo', A: 'acusativo', V: 'vocativo' },
    numero: { S: 'singular', P: 'plural', s: 'singular', p: 'plural', d: 'dual' },
    genero: { M: 'masculino', F: 'femenino', N: 'neutro', m: 'masculino', f: 'femenino', b: 'ambos géneros', c: 'común' },
    persona: { 1: '1.ª persona', 2: '2.ª persona', 3: '3.ª persona' },
    tiempo: { P: 'presente', I: 'imperfecto', F: 'futuro', A: 'aoristo', R: 'perfecto', L: 'pluscuamperfecto', '2A': 'aoristo segundo', '2R': 'perfecto segundo', '2F': 'futuro segundo', '2L': 'pluscuamperfecto segundo' },
    voz: { A: 'activa', M: 'media', P: 'pasiva', E: 'media o pasiva', D: 'media deponente', O: 'pasiva deponente', N: 'media/pasiva deponente' },
    modo: { I: 'indicativo', S: 'subjuntivo', O: 'optativo', M: 'imperativo', N: 'infinitivo', P: 'participio', R: 'participio imperativo' },
    extra: { P: 'nombre de persona', L: 'nombre de lugar', T: 'título', PRI: 'nombre propio indeclinable', NUI: 'numeral', N: 'negativo', I: 'interrogativo', C: 'contracto', ATT: 'ático' },
    hpos: { A: 'Adjetivo', C: 'Conjunción', D: 'Adverbio', N: 'Sustantivo', P: 'Pronombre', R: 'Preposición', S: 'Sufijo', T: 'Partícula', V: 'Verbo' },
    estado: { a: 'absoluto', c: 'constructo', d: 'determinado' },
    tipoN: { c: 'común', g: 'gentilicio', p: 'nombre propio' },
    tipoT: { a: 'afirmación', d: 'artículo definido', e: 'exhortación', i: 'interrogativa', j: 'interjección', m: 'demostrativa', n: 'negación', o: 'marcador de objeto directo', r: 'relativa' },
    tipoP: { d: 'demostrativo', f: 'indefinido', i: 'interrogativo', p: 'personal', r: 'relativo' },
    tipoS: { d: 'he direccional', h: 'he paragógica', n: 'nun paragógica', p: 'pronominal' },
    conj: { p: 'perfecto', q: 'perfecto consecutivo', i: 'imperfecto', w: 'imperfecto consecutivo', h: 'cohortativo', j: 'yusivo', v: 'imperativo', r: 'participio activo', s: 'participio pasivo', a: 'infinitivo absoluto', c: 'infinitivo constructo' },
    hebreo: 'Hebreo', arameo: 'Arameo',
  },
  en: {
    pos: { N: 'Noun', V: 'Verb', A: 'Adjective', T: 'Article', P: 'Personal pronoun', R: 'Relative pronoun', C: 'Reciprocal pronoun',
      D: 'Demonstrative pronoun', K: 'Correlative pronoun', I: 'Interrogative pronoun', X: 'Indefinite pronoun', Q: 'Correlative pronoun',
      F: 'Reflexive pronoun', S: 'Possessive pronoun', ADV: 'Adverb', CONJ: 'Conjunction', COND: 'Conditional', PREP: 'Preposition',
      PRT: 'Particle', INJ: 'Interjection', ARAM: 'Aramaic word', HEB: 'Hebrew word' },
    caso: { N: 'nominative', G: 'genitive', D: 'dative', A: 'accusative', V: 'vocative' },
    numero: { S: 'singular', P: 'plural', s: 'singular', p: 'plural', d: 'dual' },
    genero: { M: 'masculine', F: 'feminine', N: 'neuter', m: 'masculine', f: 'feminine', b: 'both genders', c: 'common' },
    persona: { 1: '1st person', 2: '2nd person', 3: '3rd person' },
    tiempo: { P: 'present', I: 'imperfect', F: 'future', A: 'aorist', R: 'perfect', L: 'pluperfect', '2A': 'second aorist', '2R': 'second perfect', '2F': 'second future', '2L': 'second pluperfect' },
    voz: { A: 'active', M: 'middle', P: 'passive', E: 'middle or passive', D: 'middle deponent', O: 'passive deponent', N: 'middle/passive deponent' },
    modo: { I: 'indicative', S: 'subjunctive', O: 'optative', M: 'imperative', N: 'infinitive', P: 'participle', R: 'imperative participle' },
    extra: { P: 'person name', L: 'place name', T: 'title', PRI: 'indeclinable proper noun', NUI: 'numeral', N: 'negative', I: 'interrogative', C: 'contracted', ATT: 'Attic' },
    hpos: { A: 'Adjective', C: 'Conjunction', D: 'Adverb', N: 'Noun', P: 'Pronoun', R: 'Preposition', S: 'Suffix', T: 'Particle', V: 'Verb' },
    estado: { a: 'absolute', c: 'construct', d: 'determined' },
    tipoN: { c: 'common', g: 'gentilic', p: 'proper name' },
    tipoT: { a: 'affirmation', d: 'definite article', e: 'exhortation', i: 'interrogative', j: 'interjection', m: 'demonstrative', n: 'negative', o: 'direct object marker', r: 'relative' },
    tipoP: { d: 'demonstrative', f: 'indefinite', i: 'interrogative', p: 'personal', r: 'relative' },
    tipoS: { d: 'directional he', h: 'paragogic he', n: 'paragogic nun', p: 'pronominal' },
    conj: { p: 'perfect', q: 'sequential perfect', i: 'imperfect', w: 'sequential imperfect', h: 'cohortative', j: 'jussive', v: 'imperative', r: 'active participle', s: 'passive participle', a: 'infinitive absolute', c: 'infinitive construct' },
    hebreo: 'Hebrew', arameo: 'Aramaic',
  },
};

// Raíces verbales (binyanim) hebreas; los nombres son iguales en ambos idiomas.
const RAICES = { q: 'Qal', N: 'Nifal', p: 'Piel', P: 'Pual', h: 'Hifil', H: 'Hofal', t: 'Hitpael', o: 'Polel', O: 'Polal', r: 'Hitpolel',
  m: 'Poel', M: 'Poal', k: 'Palel', K: 'Pulal', Q: 'Qal pasivo', l: 'Pilpel', L: 'Polpal', f: 'Hitpalpel', D: 'Nitpael', j: 'Pealal',
  i: 'Pilel', u: 'Hotpaal', c: 'Tifil', v: 'Hishtafel', w: 'Nitpalel', y: 'Nitpoel', z: 'Hitpoel' };

function griego(cod, t) {
  const partes = cod.split('-');
  const out = [];
  const pos = partes[0];
  out.push(t.pos[pos] || pos);
  let resto = partes.slice(1);
  if (pos === 'V' && resto.length) {
    const m = /^(2?[PIFARL])([AMPEDON])([ISOMNPR])$/.exec(resto[0]);
    if (m) {
      out.push(t.tiempo[m[1]], t.voz[m[2]], t.modo[m[3]]);
      resto = resto.slice(1);
    }
  }
  for (const r of resto) {
    let m;
    if ((m = /^([123])([NGDAV]?)([SP])$/.exec(r))) out.push(t.persona[m[1]], t.caso[m[2]], t.numero[m[3]]);
    else if ((m = /^([123])([SP])$/.exec(r))) out.push(t.persona[m[1]], t.numero[m[2]]);
    else if ((m = /^([NGDAV])([SP])([MFN]?)$/.exec(r))) out.push(t.caso[m[1]], t.numero[m[2]], t.genero[m[3]]);
    else if (t.extra[r]) out.push(t.extra[r]);
  }
  return out.filter(Boolean).join(' · ');
}

function parteHebrea(p, t) {
  const pos = p[0];
  const out = [t.hpos[pos] || pos];
  const r = p.slice(1);
  const pgn = (s) => [t.persona[s[0]], t.genero[s[1]], t.numero[s[2]]];
  if (pos === 'V') {
    out.push(RAICES[r[0]] || r[0], t.conj[r[1]]);
    if ('rs'.includes(r[1])) out.push(t.genero[r[2]], t.numero[r[3]], t.estado[r[4]]);
    else if (r.length > 2) out.push(...pgn(r.slice(2)));
  } else if (pos === 'N') {
    out.push(t.tipoN[r[0]], t.genero[r[1]], t.numero[r[2]], t.estado[r[3]]);
  } else if (pos === 'A') {
    out.push(t.genero[r[1]], t.numero[r[2]], t.estado[r[3]]);
  } else if (pos === 'T') {
    out.push(t.tipoT[r[0]]);
  } else if (pos === 'P') {
    out.push(t.tipoP[r[0]], ...pgn(r.slice(1)));
  } else if (pos === 'S') {
    out.push(t.tipoS[r[0]]);
    if (r[0] === 'p') out.push(...pgn(r.slice(1)));
  }
  return out.filter(Boolean).join(' ');
}

function hebreo(cod, t) {
  const lengua = cod[0] === 'A' ? t.arameo : t.hebreo;
  const partes = cod.slice(1).split('/').filter(Boolean).map((p) => parteHebrea(p, t));
  return `${partes.join(' + ')} · ${lengua}`;
}

export function decodificar(cod, idioma = 'es') {
  if (!cod) return '';
  const t = T[idioma] || T.es;
  try {
    const esGriego = cod.includes('-') || ['ADV', 'CONJ', 'COND', 'PREP', 'PRT', 'INJ', 'ARAM', 'HEB'].includes(cod);
    return esGriego ? griego(cod, t) : hebreo(cod, t);
  } catch {
    return cod;
  }
}

// Quita los acentos de cantilación hebreos (te'amim) y deja las vocales
export const sinCantilacion = (s) => String(s || '').replace(/[֑-ֽ֯׀׃]/g, '');
