// Portadillas: un grabado de Gustave Doré (La Grande Bible de Tours, 1866; dominio público)
// para abrir cada libro. Fuente: Project Gutenberg, «The Doré Bible Gallery» (#8710).
// Algunos libros no tienen lámina propia; se eligió la escena más cercana a su tema
// y el crédito siempre dice qué escena es.

import { idioma } from './i18n.svelte.js';

// lámina, título en español, título en inglés, pasaje
const L = {
  1: ['La creación de Eva', 'The Creation of Eve', 'Gn 2'],
  4: ['El diluvio', 'The Deluge', 'Gn 7'],
  7: ['Abraham hospeda a tres extraños', 'Abraham Entertains Three Strangers', 'Gn 18'],
  8: ['La destrucción de Sodoma', 'The Destruction of Sodom', 'Gn 19'],
  10: ['Agar en el desierto', 'Hagar in the Wilderness', 'Gn 21'],
  11: ['La prueba de la fe de Abraham', 'The Trial of the Faith of Abraham', 'Gn 22'],
  13: ['Eliezer y Rebeca', 'Eliezer and Rebekah', 'Gn 24'],
  14: ['Isaac bendice a Jacob', 'Isaac Blessing Jacob', 'Gn 27'],
  15: ['Jacob cuida los rebaños de Labán', 'Jacob Tending the Flocks of Laban', 'Gn 29'],
  17: ['José interpreta el sueño del faraón', "Joseph Interpreting Pharaoh's Dream", 'Gn 41'],
  18: ['José se da a conocer a sus hermanos', 'Joseph Making Himself Known to His Brethren', 'Gn 45'],
  19: ['Moisés entre los juncos', 'Moses in the Bulrushes', 'Ex 2'],
  20: ['La guerra contra Gabaón', 'The War against Gibeon', 'Jos 10'],
  22: ['El cántico de Débora', "Deborah's Song of Triumph", 'Jue 5'],
  24: ['La hija de Jefté y sus compañeras', "Jephthah's Daughter and Her Companions", 'Jue 11'],
  27: ['La muerte de Sansón', 'The Death of Samson', 'Jue 16'],
  29: ['Rut y Booz', 'Ruth and Boaz', 'Rt 2'],
  30: ['El regreso del arca', 'The Return of the Ark', '1S 6'],
  31: ['Saúl y David', 'Saul and David', '1S 18'],
  32: ['David perdona a Saúl', 'David Sparing Saul', '1S 24'],
  33: ['La muerte de Saúl', 'The Death of Saul', '1S 31'],
  35: ['David llora a Absalón', 'David Mourning over Absalom', '2S 18'],
  36: ['Salomón', 'Solomon', '1R 4'],
  37: ['El juicio de Salomón', 'The Judgment of Solomon', '1R 3'],
  38: ['Los cedros para el templo', 'The Cedars Destined for the Temple', '1R 5'],
  40: ['Elías y los mensajeros de Ocozías', 'Elijah Destroying the Messengers of Ahaziah', '2R 1'],
  41: ['Elías sube en un carro de fuego', "Elijah's Ascent in a Chariot of Fire", '2R 2'],
  43: ['Ester confunde a Amán', 'Esther Confounding Haman', 'Est 7'],
  44: ['Isaías', 'Isaiah', 'Is'],
  45: ['La destrucción del ejército de Senaquerib', "Destruction of Sennacherib's Host", 'Is 37'],
  46: ['Baruc', 'Baruch', 'Jer 45'],
  47: ['Ezequiel profetiza', 'Ezekiel Prophesying', 'Ez'],
  48: ['La visión de Ezequiel', 'The Vision of Ezekiel', 'Ez 37'],
  49: ['Daniel', 'Daniel', 'Dn'],
  50: ['El horno de fuego', 'The Fiery Furnace', 'Dn 3'],
  51: ['El banquete de Belsasar', "Belshazzar's Feast", 'Dn 5'],
  52: ['Daniel en el foso de los leones', "Daniel in the Lions' Den", 'Dn 6'],
  53: ['El profeta Amós', 'The Prophet Amos', 'Am'],
  54: ['Jonás llama a Nínive al arrepentimiento', 'Jonah Calling Nineveh to Repentance', 'Jon 3'],
  57: ['El nacimiento', 'The Nativity', 'Lc 2'],
  61: ['Jesús entre los maestros', 'Jesus Questioning the Doctors', 'Lc 2'],
  63: ['El sermón del monte', 'Sermon on the Mount', 'Mt 5'],
  64: ['Cristo calma la tempestad', 'Christ Stilling the Tempest', 'Mt 8'],
  66: ['Cristo en la sinagoga', 'Christ in the Synagogue', 'Mt 13'],
  68: ['Jesús camina sobre el agua', 'Jesus Walking on the Water', 'Mr 6'],
  69: ['La entrada en Jerusalén', "Christ's Entry into Jerusalem", 'Mt 21'],
  71: ['La ofrenda de la viuda', "The Widow's Mite", 'Mr 12'],
  73: ['El buen samaritano', 'The Good Samaritan', 'Lc 10'],
  74: ['El samaritano llega a la posada', 'Arrival of the Samaritan at the Inn', 'Lc 10'],
  75: ['El hijo pródigo', 'The Prodigal Son', 'Lc 15'],
  80: ['La resurrección de Lázaro', 'The Resurrection of Lazarus', 'Jn 11'],
  81: ['María Magdalena', 'Mary Magdalene', 'Lc 7'],
  82: ['La última cena', 'The Last Supper', 'Mt 26'],
  86: ['Cristo cae bajo la cruz', 'Christ Fainting under the Cross', 'Lc 23'],
  88: ['La crucifixión', 'The Crucifixion', 'Mt 27'],
  89: ['El final de la crucifixión', 'Close of the Crucifixion', 'Mt 27'],
  91: ['El ángel en el sepulcro', 'The Angel at the Sepulchre', 'Mt 28'],
  93: ['La ascensión', 'The Ascension', 'Hch 1'],
  94: ['El martirio de Esteban', 'The Martyrdom of St. Stephen', 'Hch 7'],
  95: ['La conversión de Saulo', "Saul's Conversion", 'Hch 9'],
  96: ['La liberación de Pedro', 'The Deliverance of St. Peter', 'Hch 12'],
  97: ['Pablo en Éfeso', 'Paul at Ephesus', 'Hch 19'],
  98: ['Pablo amenazado por la multitud', 'Paul Menaced by the Jews', 'Hch 21'],
  99: ['El naufragio de Pablo', "Paul's Shipwreck", 'Hch 27'],
  100: ['La muerte en el caballo amarillo', 'Death on the Pale Horse', 'Ap 6'],
};

// libro (1-66) → lámina
const POR_LIBRO = [
  1, 19, 11, 15, 14, 20, 27, 29, 32, 35, 37, 41, 31, 38, 30, 17, 43, 10, 22, 36, 44, 13,
  45, 46, 24, 48, 52, 18, 4, 53, 33, 54, 47, 40, 49, 51, 38, 69, 50,
  63, 64, 57, 80, 95, 99, 82, 98, 88, 97, 96, 89, 91, 93, 61, 94, 66, 75, 7, 71, 86, 68,
  73, 81, 74, 8, 100,
];

export const LAMINAS = [...new Set(POR_LIBRO)].sort((a, b) => a - b);

export function grabado(libro) {
  const n = POR_LIBRO[libro - 1];
  if (!n) return null;
  const [es, en, ref] = L[n];
  return {
    n,
    src: `${import.meta.env.BASE_URL}grabados/dore-${String(n).padStart(3, '0')}.webp`,
    titulo: idioma() === 'en' ? en : es,
    ref,
  };
}
