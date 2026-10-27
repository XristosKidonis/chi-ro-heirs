// Música grabada del Ambiente: interpretaciones reales de dominio público o con licencia libre,
// tomadas de Wikimedia Commons y pasadas a MP3 con el volumen parejo (herramientas/traer_musica.py).
// Los créditos completos están en public/musica/LICENCIAS.txt.
const C = 'https://commons.wikimedia.org/wiki/File:';

export const LISTAS = {
  piano: [
    { id: 'aria-goldberg', titulo: { es: 'Aria de las Variaciones Goldberg', en: 'Aria from the Goldberg Variations' }, autor: 'J. S. Bach', interprete: 'Kimiko Ishizaka', licencia: 'CC0', fuente: `${C}Kimiko_Ishizaka_-_01_-_Aria.ogg` },
    { id: 'gymnopedie-1', titulo: { es: 'Gymnopédie n.º 1', en: 'Gymnopédie No. 1' }, autor: 'Erik Satie', interprete: 'Robin Alciatore', licencia: 'PD', fuente: `${C}Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg` },
    { id: 'preludio-do-mayor', titulo: { es: 'Preludio en do mayor (El clave bien temperado)', en: 'Prelude in C major (Well-Tempered Clavier)' }, autor: 'J. S. Bach', interprete: 'Kimiko Ishizaka', licencia: 'CC0', fuente: `${C}Kimiko_Ishizaka_-_Bach_-_Well-Tempered_Clavier,_Book_1_-_01_Prelude_No._1_in_C_major,_BWV_846.ogg` },
    { id: 'traumerei', titulo: { es: 'Ensueño (Escenas de niños)', en: 'Träumerei (Scenes from Childhood)' }, autor: 'Robert Schumann', interprete: 'Musopen', licencia: 'PD', fuente: `${C}Robert_Schumann_-_scenes_from_childhood,_op._15_-_vii._dreaming.ogg` },
    { id: 'gnossienne-1', titulo: { es: 'Gnossienne n.º 1', en: 'Gnossienne No. 1' }, autor: 'Erik Satie', interprete: 'La Pianista', licencia: 'PD', fuente: `${C}Satie_-_Gnossienne_1.ogg` },
    { id: 'nocturno-op9-2', titulo: { es: 'Nocturno op. 9 n.º 2', en: 'Nocturne Op. 9 No. 2' }, autor: 'Frédéric Chopin', interprete: 'Frank Levy', licencia: 'PD', fuente: `${C}Nocturne_in_E_flat_major,_Op._9_no._2.mp3` },
    { id: 'aria-da-capo', titulo: { es: 'Aria da capo (Variaciones Goldberg)', en: 'Aria da capo (Goldberg Variations)' }, autor: 'J. S. Bach', interprete: 'Kimiko Ishizaka', licencia: 'CC0', fuente: `${C}Kimiko_Ishizaka_-_32_-_Aria_da_Capo_Fine.ogg` },
  ],
  himnos: [
    { id: 'sublime-gracia', titulo: { es: 'Sublime gracia', en: 'Amazing Grace' }, autor: 'John Newton', interprete: { es: 'Banda de la Infantería de Marina de EE. UU.', en: 'United States Marine Band' }, licencia: 'PD', fuente: `${C}Amazing_Grace_US_Marine_Band.ogg` },
    { id: 'santo-santo-santo', titulo: { es: 'Santo, santo, santo', en: 'Holy, Holy, Holy' }, autor: 'John B. Dykes', interprete: 'Richard M. S. Irwin', licencia: 'CC BY-SA 4.0', fuente: `${C}HWW_Holy_holy_holy_is_the_Lord-Processional.ogg` },
    { id: 'mas-cerca', titulo: { es: 'Más cerca, oh Dios, de ti', en: 'Nearer, My God, to Thee' }, autor: 'Lowell Mason', interprete: { es: 'Banda de la Fuerza Aérea de EE. UU.', en: 'United States Air Force Band' }, licencia: 'PD', fuente: `${C}Nearer_My_God_to_Thee_-_Concert_Band_-_United_States_Air_Force_Band.mp3` },
    { id: 'se-tu-mi-vision', titulo: { es: 'Sé tú mi visión', en: 'Be Thou My Vision' }, autor: { es: 'Tradicional irlandés', en: 'Irish traditional' }, interprete: 'Walmartshopper', licencia: 'PD', fuente: `${C}Be_thou_my_vision_acoustic_by_walmartshopper.ogg` },
    { id: 'castillo-fuerte', titulo: { es: 'Castillo fuerte es nuestro Dios', en: 'A Mighty Fortress Is Our God' }, autor: 'Martín Lutero', interprete: 'Wolfgang Kindl', licencia: 'CC0', fuente: `${C}(Wolfgang_Kindl)_EG_362_Ein_feste_Burg_ist_unser_Gott_(zweite_Version).mp3` },
    { id: 'noche-de-paz', titulo: { es: 'Noche de paz', en: 'Silent Night' }, autor: 'Franz X. Gruber', interprete: { es: 'Singing Sergeants, Fuerza Aérea de EE. UU.', en: 'Singing Sergeants, US Air Force Band' }, licencia: 'PD', fuente: `${C}Silent_Night_-_Singing_Sergeants_-_United_States_Air_Force_Band.mp3` },
  ],
  coral: [
    { id: 'jesus-alegria', titulo: { es: 'Jesús, alegría de los hombres', en: 'Jesu, Joy of Man’s Desiring' }, autor: 'J. S. Bach', interprete: 'Orchestra Gli Armonici', licencia: 'CC0', fuente: `${C}Bach,_BWV_147,_10._Jesus_bleibet_meine_Freude.ogg` },
    { id: 'aire-bach', titulo: { es: 'Aire (Suite n.º 3)', en: 'Air (Suite No. 3)' }, autor: 'J. S. Bach', interprete: { es: 'Cuerdas de la Fuerza Aérea de EE. UU.', en: 'Air Force Strings' }, licencia: 'PD', fuente: `${C}Air_-_Air_Force_Strings_-_United_States_Air_Force_Band.mp3` },
    { id: 'rorate-caeli', titulo: { es: 'Rorate caeli (canto gregoriano)', en: 'Rorate caeli (Gregorian chant)' }, autor: { es: 'Gregoriano', en: 'Gregorian' }, interprete: 'Inritter', licencia: 'CC BY-SA 4.0', fuente: `${C}Rorate_Caeli_~_Gregorian_Chant.ogg` },
    { id: 'ombra-mai-fu', titulo: { es: 'Ombra mai fu (Largo)', en: 'Ombra mai fu (Largo)' }, autor: 'G. F. Händel', interprete: 'Lea Desandre, Les Arts Florissants', licencia: 'CC BY 3.0', fuente: `${C}Les_Arts_Florissants_-_Handel%27s_Serse,_HWV_40_-_Ombra_mai_fu.ogg` },
    { id: 'canon-pachelbel', titulo: { es: 'Canon en re (guitarra)', en: 'Canon in D (guitar)' }, autor: 'Johann Pachelbel', interprete: 'Aitua', licencia: 'CC BY-SA 4.0', fuente: `${C}Pachelbel_-_Canon_in_D_major,_P._37_(Guitar).ogg` },
    { id: 'miserere', titulo: { es: 'Miserere mei, Deus (Salmo 51)', en: 'Miserere mei, Deus (Psalm 51)' }, autor: 'Gregorio Allegri', interprete: 'Ensamble Escénico Vocal', licencia: 'CC BY 3.0', fuente: `${C}Allegri_-_Miserere_Mei,_Deus_-_Ensamble_Esc%C3%A9nico_Vocal_(audio).ogg` },
  ],
};

export const archivoPista = (p) => `${import.meta.env.BASE_URL}musica/${p.id}.mp3`;
