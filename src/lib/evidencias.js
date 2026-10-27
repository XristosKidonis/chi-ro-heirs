// Historia: lo que dicen los historiadores, las piedras y los manuscritos sobre Jesús y Juan el Bautista.
// Cada prueba dice qué establece y qué no, con un grado honesto: firme · probable · discutido · sinbase.
// Las citas son traducciones propias de textos de dominio público (Tácito, Josefo, Plinio, Luciano, Orígenes…).
// Fuentes de partida: sybil-solutions/all-historical-evidence-of-jesus-christ y
// sybil-solutions/historical-evidence-for-john-the-baptist (sus textos y enlaces originales); la prosa es nuestra.
// Versículos: «libro.cap.v» o «libro.cap.v-hasta» (Mateo 40, Marcos 41, Lucas 42, Juan 43, Hechos 44…).

export const GRADOS = ['firme', 'probable', 'discutido', 'sinbase'];

export const GRUPOS = {
  jesus: ['testigos', 'cristianos', 'manuscritos', 'piedras'],
  juan: ['testigos', 'cristianos', 'piedras'],
};

// Año de referencia para calcular «cuántos años después»
export const BASE = { jesus: 30, juan: 29 };

export const PRUEBAS = [
  // ---------- Jesús: testigos que no eran cristianos ----------
  {
    id: 'tacito', figura: 'jesus', grupo: 'testigos', grado: 'firme', anio: 116,
    titulo: { es: 'Tácito: «Cristo fue ejecutado por Poncio Pilato»', en: 'Tacitus: “Christ was executed by Pontius Pilate”' },
    autor: { es: 'Tácito, historiador romano', en: 'Tacitus, Roman historian' },
    obra: { es: 'Anales 15.44', en: 'Annals 15.44' }, fecha: { es: 'c. 116 d. C.', en: 'c. AD 116' },
    cita: {
      es: '«Cristo, de quien toman el nombre, fue ejecutado en el reinado de Tiberio por el procurador Poncio Pilato.»',
      en: '“Christus, from whom the name had its origin, suffered the extreme penalty during the reign of Tiberius at the hands of the procurator Pontius Pilatus.”',
    },
    establece: {
      es: 'Uno de los grandes historiadores de Roma —que despreciaba a los cristianos— da por hecho que Cristo existió, que fue ejecutado en Judea bajo Pilato en tiempos de Tiberio y que sus seguidores ya estaban en Roma hacia el año 64.',
      en: 'One of Rome’s great historians — who despised Christians — takes it as fact that Christ existed, was executed in Judaea under Pilate in the reign of Tiberius, and that his followers were in Rome by about AD 64.',
    },
    noEstablece: {
      es: 'Nada sobre milagros ni resurrección. Tácito escribe unos 85 años después y no dice de dónde sacó el dato.',
      en: 'Nothing about miracles or the resurrection. Tacitus writes some 85 years later and does not name his source.',
    },
    versos: ['41.15.15', '42.3.1', '43.19.16'],
    contraste: {
      coinciden: { es: ['Cristo fue ejecutado', 'en Judea', 'bajo Poncio Pilato', 'en tiempos de Tiberio (Lucas 3:1)', 'sus seguidores crecieron después'], en: ['Christ was executed', 'in Judaea', 'under Pontius Pilate', 'in the reign of Tiberius (Luke 3:1)', 'his followers grew afterwards'] },
      biblia: { es: ['el juicio ante el sanedrín', 'los milagros', 'la resurrección'], en: ['the trial before the Sanhedrin', 'the miracles', 'the resurrection'] },
      fuente: { es: ['el incendio de Roma del año 64', 'la persecución de Nerón', 'llama a la fe «superstición dañina»'], en: ['the fire of Rome in AD 64', 'Nero’s persecution', 'he calls the faith a “pernicious superstition”'] },
    },
    fuente: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Tacitus/Annals/15B*.html',
  },
  {
    id: 'josefo20', figura: 'jesus', grupo: 'testigos', grado: 'firme', anio: 93,
    titulo: { es: 'Josefo: «el hermano de Jesús, llamado el Cristo»', en: 'Josephus: “the brother of Jesus, who was called Christ”' },
    autor: { es: 'Flavio Josefo, historiador judío', en: 'Flavius Josephus, Jewish historian' },
    obra: { es: 'Antigüedades judías 20.200', en: 'Jewish Antiquities 20.200' }, fecha: { es: 'c. 93 d. C.', en: 'c. AD 93' },
    cita: {
      es: '«Reunió al sanedrín y llevó ante él al hermano de Jesús, llamado el Cristo —su nombre era Santiago— y a algunos otros, y los entregó para ser apedreados.»',
      en: '“He assembled the sanhedrin and brought before them the brother of Jesus, who was called Christ, whose name was James, and some others, and delivered them to be stoned.”',
    },
    establece: {
      es: 'Un historiador judío del siglo I menciona a Jesús de pasada, como alguien que sus lectores ya conocían, y a su hermano Santiago, ejecutado en Jerusalén el año 62. Casi todos los historiadores lo consideran auténtico.',
      en: 'A first-century Jewish historian mentions Jesus in passing, as someone his readers already knew, and his brother James, executed in Jerusalem in AD 62. Almost all historians consider it authentic.',
    },
    noEstablece: {
      es: '«Llamado el Cristo» es cómo lo conocía la gente, no una confesión de fe de Josefo. Aquí no dice nada más de Jesús.',
      en: '“Called Christ” is how people knew him, not a confession of faith by Josephus. He says nothing more about Jesus here.',
    },
    versos: ['48.1.19', '41.6.3', '44.15.13'],
    fuente: 'https://penelope.uchicago.edu/josephus/ant-20.html',
  },
  {
    id: 'josefo18', figura: 'jesus', grupo: 'testigos', grado: 'probable', anio: 93,
    titulo: { es: 'Josefo: un maestro sabio que Pilato crucificó', en: 'Josephus: a wise teacher whom Pilate crucified' },
    autor: { es: 'Flavio Josefo, historiador judío', en: 'Flavius Josephus, Jewish historian' },
    obra: { es: 'Antigüedades judías 18.63-64', en: 'Jewish Antiquities 18.63-64' }, fecha: { es: 'c. 93 d. C.', en: 'c. AD 93' },
    cita: {
      es: '«Por este tiempo vivió Jesús, un hombre sabio […]. Atrajo a muchos judíos y a muchos griegos. Cuando Pilato, por la acusación de los principales de entre nosotros, lo condenó a la cruz, los que lo habían amado desde el principio no dejaron de hacerlo […]. Y hasta hoy no ha desaparecido la tribu de los cristianos, que se llaman así por él.»',
      en: '“About this time there lived Jesus, a wise man […]. He won over many Jews and many Greeks. When Pilate, upon an accusation by the leading men among us, condemned him to the cross, those who had loved him at the first did not cease […]. And the tribe of Christians, so called after him, has not disappeared to this day.”',
    },
    establece: {
      es: 'Lo más probable es que Josefo sí hablara de Jesús como un maestro sabio, seguido por muchos y crucificado por Pilato. Por eso lo citamos con puntos suspensivos: es el núcleo que la mayoría de los estudiosos acepta.',
      en: 'Most likely Josephus did speak of Jesus as a wise teacher with many followers, crucified by Pilate. That is why we quote it with ellipses: this is the core most scholars accept.',
    },
    noEstablece: {
      es: 'El texto que nos llegó tiene frases que casi seguro añadieron copistas cristianos («él era el Cristo», «se les apareció vivo al tercer día»). Por eso es «probable» y no «firme».',
      en: 'The text we have contains phrases almost certainly added by Christian copyists (“he was the Christ”, “he appeared to them alive on the third day”). That is why it is “likely”, not “solid”.',
    },
    versos: ['42.23.24', '43.19.16'],
    fuente: 'https://penelope.uchicago.edu/josephus/ant-18.html',
  },
  {
    id: 'plinio', figura: 'jesus', grupo: 'testigos', grado: 'firme', anio: 112,
    titulo: { es: 'Plinio: cantaban «a Cristo como a un dios»', en: 'Pliny: they sang “to Christ as to a god”' },
    autor: { es: 'Plinio el Joven, gobernador romano', en: 'Pliny the Younger, Roman governor' },
    obra: { es: 'Cartas 10.96, al emperador Trajano', en: 'Letters 10.96, to the emperor Trajan' }, fecha: { es: 'c. 112 d. C.', en: 'c. AD 112' },
    cita: {
      es: '«Afirmaban que toda su culpa o su error consistía en reunirse un día fijo antes del amanecer, cantar a coros un himno a Cristo como a un dios y comprometerse con juramento a no cometer ningún crimen.»',
      en: '“They affirmed that the whole of their guilt, or their error, was that they met on a fixed day before dawn, sang in alternate verses a hymn to Christ as to a god, and bound themselves by oath not to commit any crime.”',
    },
    establece: {
      es: 'Hacia el año 112, en el norte de la actual Turquía, había cristianos de toda edad y clase que adoraban a Cristo «como a un dios». Lo cuenta un gobernador romano que los interrogaba.',
      en: 'By about AD 112, in what is now northern Turkey, Christians of every age and class worshipped Christ “as a god”. A Roman governor who was interrogating them reports it.',
    },
    noEstablece: { es: 'Nada sobre la vida de Jesús: habla de sus seguidores.', en: 'Nothing about the life of Jesus: it is about his followers.' },
    versos: ['50.2.6-11', '51.3.16', '44.20.7'],
    fuente: 'https://www.attalus.org/old/pliny10b.html',
  },
  {
    id: 'suetonio', figura: 'jesus', grupo: 'testigos', grado: 'discutido', anio: 121,
    titulo: { es: 'Suetonio: los disturbios por «Cresto»', en: 'Suetonius: the riots over “Chrestus”' },
    autor: { es: 'Suetonio, biógrafo romano', en: 'Suetonius, Roman biographer' },
    obra: { es: 'Vida de Claudio 25.4', en: 'Life of Claudius 25.4' }, fecha: { es: 'c. 121 d. C.', en: 'c. AD 121' },
    cita: {
      es: '«Expulsó de Roma a los judíos, que provocaban continuos disturbios por instigación de Cresto.»',
      en: '“Since the Jews constantly made disturbances at the instigation of Chrestus, he expelled them from Rome.”',
    },
    establece: {
      es: 'Hubo una expulsión de judíos de Roma bajo el emperador Claudio, hacia el año 49: la misma que explica por qué Aquila y Priscila llegaron a Corinto en Hechos 18:2.',
      en: 'There was an expulsion of Jews from Rome under the emperor Claudius, around AD 49 — the same one that explains why Aquila and Priscilla came to Corinth in Acts 18:2.',
    },
    noEstablece: {
      es: 'Que «Cresto» sea Cristo. Puede ser una confusión de nombres (Christus/Chrestus) o alguien distinto. Es interesante, no decisivo.',
      en: 'That “Chrestus” is Christ. It may be a confusion of names (Christus/Chrestus) or someone else. Interesting, not decisive.',
    },
    versos: ['44.18.2'],
    fuente: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Claudius*.html',
  },
  {
    id: 'luciano', figura: 'jesus', grupo: 'testigos', grado: 'firme', anio: 165,
    titulo: { es: 'Luciano: «el hombre crucificado en Palestina»', en: 'Lucian: “the man crucified in Palestine”' },
    autor: { es: 'Luciano de Samósata, escritor satírico', en: 'Lucian of Samosata, satirist' },
    obra: { es: 'La muerte de Peregrino 11-13', en: 'The Passing of Peregrinus 11-13' }, fecha: { es: 'c. 165 d. C.', en: 'c. AD 165' },
    cita: {
      es: '«…ese hombre que fue crucificado en Palestina por haber introducido este nuevo culto en el mundo.»',
      en: '“…the man who was crucified in Palestine because he introduced this new cult into the world.”',
    },
    establece: {
      es: 'Un pagano que se burla de los cristianos da por sentado que su fundador fue un hombre crucificado en Palestina. Ni sus críticos ponían en duda que existió.',
      en: 'A pagan who mocks Christians takes for granted that their founder was a man crucified in Palestine. Not even their critics doubted that he existed.',
    },
    noEstablece: { es: 'Luciano escribe 130 años después y repite lo que los cristianos decían.', en: 'Lucian writes 130 years later and repeats what Christians said.' },
    versos: ['46.1.23'],
    fuente: 'https://sacred-texts.com/cla/luc/wl4/wl420.htm',
  },
  {
    id: 'talmud', figura: 'jesus', grupo: 'testigos', grado: 'discutido', anio: 450,
    titulo: { es: 'El Talmud: «Yeshu», colgado la víspera de Pascua', en: 'The Talmud: “Yeshu”, hanged on the eve of Passover' },
    autor: { es: 'Tradición rabínica', en: 'Rabbinic tradition' },
    obra: { es: 'Talmud de Babilonia, Sanedrín 43a', en: 'Babylonian Talmud, Sanhedrin 43a' }, fecha: { es: 'redactado hacia 500 d. C.', en: 'compiled c. AD 500' },
    cita: {
      es: 'Una tradición cuenta que «Yeshu» fue colgado la víspera de la Pascua, acusado de hechicería y de apartar a Israel. (Resumen; no es cita textual.)',
      en: 'A tradition says that “Yeshu” was hanged on the eve of Passover, accused of sorcery and of leading Israel astray. (Summary, not a quotation.)',
    },
    establece: {
      es: 'Que la tradición judía posterior recordaba, en tono hostil, a un Jesús ejecutado en la víspera de la Pascua: la misma fecha que da Juan 19:14.',
      en: 'That later Jewish tradition remembered, with hostility, a Jesus executed on the eve of Passover — the same date John 19:14 gives.',
    },
    noEstablece: {
      es: 'Se puso por escrito siglos después, y los estudiosos discuten si todas estas tradiciones hablan del Jesús de los evangelios.',
      en: 'It was written down centuries later, and scholars debate whether all these traditions refer to the Jesus of the Gospels.',
    },
    versos: ['43.19.14'],
    fuente: 'https://www.sefaria.org/Sanhedrin.43a',
  },
  {
    id: 'mara', figura: 'jesus', grupo: 'testigos', grado: 'discutido', anio: 75,
    titulo: { es: 'Mara bar Serapión: el «sabio rey» de los judíos', en: 'Mara bar Serapion: the Jews’ “wise king”' },
    autor: { es: 'Mara bar Serapión, filósofo sirio', en: 'Mara bar Serapion, Syrian philosopher' },
    obra: { es: 'Carta a su hijo', en: 'Letter to his son' }, fecha: { es: 'después del 73 d. C.', en: 'after AD 73' },
    cita: {
      es: '«¿Qué ganaron los judíos con ejecutar a su sabio rey, si desde entonces su reino les fue quitado?»',
      en: '“What advantage did the Jews gain from executing their wise king? From that time their kingdom was taken away.”',
    },
    establece: {
      es: 'Un filósofo que no era cristiano pone a un «sabio rey» de los judíos, ejecutado por los suyos, junto a Sócrates y Pitágoras.',
      en: 'A philosopher who was not a Christian places a “wise king” of the Jews, executed by his own people, beside Socrates and Pythagoras.',
    },
    noEstablece: { es: 'No nombra a Jesús. Muchos creen que habla de él, pero no se puede saber con certeza.', en: 'He does not name Jesus. Many think he means him, but it cannot be known for certain.' },
    versos: ['43.19.19'],
    fuente: 'https://archive.org/details/spicilegiumsyria00cureuoft',
  },

  // ---------- Jesús: los primeros cristianos ----------
  {
    id: 'credo', figura: 'jesus', grupo: 'cristianos', grado: 'firme', anio: 54,
    titulo: { es: 'Un credo de los primeros años: 1 Corintios 15', en: 'A creed from the earliest years: 1 Corinthians 15' },
    autor: { es: 'Pablo de Tarso', en: 'Paul of Tarsus' },
    obra: { es: '1 Corintios 15:3-8', en: '1 Corinthians 15:3-8' }, fecha: { es: 'carta c. 54 d. C.; el credo, antes', en: 'letter c. AD 54; the creed, earlier' },
    cita: {
      es: '«Les transmití lo que yo también recibí: que Cristo murió por nuestros pecados… que fue sepultado, que resucitó al tercer día… y que se apareció a Pedro, después a los Doce…»',
      en: '“I passed on to you what I also received: that Christ died for our sins… that he was buried, that he was raised on the third day… and that he appeared to Peter, then to the Twelve…”',
    },
    establece: {
      es: 'Pablo copia una fórmula que él mismo «recibió», con nombres de testigos que aún vivían (Pedro, Santiago, «más de quinientos»). La carta es de unos 25 años después, y muchos historiadores —también escépticos— fechan el credo a muy pocos años de la crucifixión.',
      en: 'Paul copies a formula he himself “received”, naming witnesses who were still alive (Peter, James, “more than five hundred”). The letter is from about 25 years later, and many historians — sceptics included — date the creed to within a very few years of the crucifixion.',
    },
    noEstablece: {
      es: 'Que la resurrección ocurriera: eso es fe. Lo que sí muestra es que los primeros cristianos lo afirmaron desde el principio y con nombres propios, no siglos después.',
      en: 'That the resurrection happened: that is faith. What it does show is that the first Christians claimed it from the start, with names attached — not centuries later.',
    },
    versos: ['46.15.3-8'],
  },
  {
    id: 'galatas', figura: 'jesus', grupo: 'cristianos', grado: 'firme', anio: 50,
    titulo: { es: 'Pablo pasó quince días con Pedro', en: 'Paul spent fifteen days with Peter' },
    autor: { es: 'Pablo de Tarso', en: 'Paul of Tarsus' },
    obra: { es: 'Gálatas 1:18-19', en: 'Galatians 1:18-19' }, fecha: { es: 'c. 48-55 d. C.', en: 'c. AD 48-55' },
    cita: {
      es: '«Subí a Jerusalén para conocer a Pedro y me quedé con él quince días. No vi a ningún otro apóstol, sino a Santiago, el hermano del Señor.»',
      en: '“I went up to Jerusalem to get acquainted with Peter and stayed with him fifteen days. I saw none of the other apostles — only James, the Lord’s brother.”',
    },
    establece: {
      es: 'El autor de las cartas más antiguas del Nuevo Testamento —que casi nadie discute que son suyas— conoció en persona al discípulo principal de Jesús y a su hermano.',
      en: 'The author of the oldest letters in the New Testament — almost no one disputes they are his — knew Jesus’s chief disciple and his brother in person.',
    },
    noEstablece: { es: 'De qué hablaron. Solo el encuentro, contado bajo juramento («no miento»).', en: 'What they talked about. Only the meeting, told under oath (“I do not lie”).' },
    versos: ['48.1.18-20'],
  },
  {
    id: 'evangelios', figura: 'jesus', grupo: 'cristianos', grado: 'firme', anio: 75,
    titulo: { es: 'Cuatro biografías antiguas', en: 'Four ancient biographies' },
    autor: { es: 'Marcos, Mateo, Lucas y Juan', en: 'Mark, Matthew, Luke and John' },
    obra: { es: 'Los evangelios', en: 'The Gospels' }, fecha: { es: 'c. 65-100 d. C.', en: 'c. AD 65-100' },
    cita: {
      es: '«Muchos han intentado escribir un relato de los hechos… tal como nos los transmitieron los que desde el principio fueron testigos… También a mí me ha parecido bien, después de investigarlo todo con cuidado…»',
      en: '“Many have undertaken to compile an account of the things… just as they were handed down to us by those who from the first were eyewitnesses… it seemed good to me also, having carefully investigated everything…”',
    },
    establece: {
      es: 'Son biografías al estilo antiguo, escritas entre unos 35 y 65 años después, cuando todavía vivían testigos. Coinciden en el marco: Galilea, Jerusalén, Pilato, Caifás, la cruz.',
      en: 'They are biographies in the ancient style, written roughly 35 to 65 years later, while witnesses were still alive. They agree on the frame: Galilee, Jerusalem, Pilate, Caiaphas, the cross.',
    },
    noEstablece: {
      es: 'Por sí solas, lo sobrenatural. Cada evangelio escribe con su propio propósito y difieren en detalles: el historiador las lee como fuentes, el creyente además como Escritura.',
      en: 'On their own, the supernatural. Each Gospel writes with its own purpose and they differ in details: historians read them as sources; believers also as Scripture.',
    },
    versos: ['42.1.1-4', '43.21.24'],
  },

  // ---------- Jesús: manuscritos ----------
  {
    id: 'p52', figura: 'jesus', grupo: 'manuscritos', grado: 'probable', anio: 150,
    titulo: { es: 'P52: un trocito de Juan del siglo II', en: 'P52: a scrap of John from the second century' },
    autor: { es: 'Copista anónimo, Egipto', en: 'Anonymous scribe, Egypt' },
    obra: { es: 'Papiro Rylands 457 (Juan 18)', en: 'Rylands Papyrus 457 (John 18)' }, fecha: { es: 'siglo II (c. 125-175)', en: '2nd century (c. 125-175)' },
    cita: {
      es: 'Un fragmento del tamaño de una tarjeta con parte de Juan 18:31-33 por un lado y 18:37-38 por el otro: Jesús ante Pilato.',
      en: 'A card-sized fragment with part of John 18:31-33 on one side and 18:37-38 on the other: Jesus before Pilate.',
    },
    establece: {
      es: 'El Evangelio de Juan ya se copiaba en Egipto en el siglo II, lejos de donde se escribió. Es de los manuscritos más antiguos del Nuevo Testamento.',
      en: 'John’s Gospel was already being copied in Egypt in the second century, far from where it was written. It is among the oldest New Testament manuscripts.',
    },
    noEstablece: { es: 'Una fecha exacta: fechar por la letra deja un margen de décadas. Por eso es «probable».', en: 'An exact date: dating by handwriting leaves a margin of decades. Hence “likely”.' },
    versos: ['43.18.31-33', '43.18.37-38'],
  },
  {
    id: 'manuscritos', figura: 'jesus', grupo: 'manuscritos', grado: 'firme', anio: 350,
    titulo: { es: 'Más de 5.800 manuscritos griegos', en: 'More than 5,800 Greek manuscripts' },
    autor: { es: 'Copistas de todo el mundo antiguo', en: 'Scribes across the ancient world' },
    obra: { es: 'Del siglo II al XV', en: 'From the 2nd to the 15th century' }, fecha: { es: 'Códice Sinaítico, c. 350 d. C.', en: 'Codex Sinaiticus, c. AD 350' },
    cita: {
      es: 'Además de los manuscritos griegos hay miles en latín, siríaco y copto. De muchas obras clásicas quedan unas pocas copias, a veces escritas mil años después.',
      en: 'Besides the Greek manuscripts there are thousands in Latin, Syriac and Coptic. Many classical works survive in a handful of copies, sometimes written a thousand years later.',
    },
    establece: {
      es: 'El texto del Nuevo Testamento se puede reconstruir con mucha seguridad. Las variantes entre copias son conocidas, y casi todas son menores (ortografía, orden de palabras).',
      en: 'The New Testament text can be reconstructed with great confidence. The variants between copies are known, and nearly all are minor (spelling, word order).',
    },
    noEstablece: { es: 'Que lo que dice sea verdad. Establece que lo que leemos hoy es, en lo esencial, lo que se escribió.', en: 'That what it says is true. It establishes that what we read today is, in substance, what was written.' },
    versos: ['42.1.3'],
    fuente: 'https://codexsinaiticus.org/',
  },

  // ---------- Jesús: piedras ----------
  {
    id: 'pilato', figura: 'jesus', grupo: 'piedras', grado: 'firme', anio: 30,
    titulo: { es: 'La piedra de Pilato', en: 'The Pilate stone' },
    autor: { es: 'Cesarea Marítima (Israel), hallada en 1961', en: 'Caesarea Maritima (Israel), found 1961' },
    obra: { es: 'Inscripción en piedra caliza; hoy en el Museo de Israel', en: 'Limestone inscription; now in the Israel Museum' }, fecha: { es: 'c. 26-36 d. C.', en: 'c. AD 26-36' },
    cita: { es: '«… Tiberieum / [Pon]cio Pilato / [pre]fecto de Jude[a]»', en: '“… Tiberieum / [Pon]tius Pilate / [pre]fect of Jude[a]”' },
    establece: {
      es: 'Poncio Pilato existió y gobernó Judea. Un detalle fino: la piedra le da su título exacto, «prefecto», que es el que tenían los gobernadores de Judea antes del año 41.',
      en: 'Pontius Pilate existed and governed Judaea. A fine detail: the stone gives his exact title, “prefect”, the one Judaea’s governors held before AD 41.',
    },
    noEstablece: { es: 'Nada sobre el juicio de Jesús: confirma al personaje y su cargo.', en: 'Nothing about the trial of Jesus: it confirms the man and his office.' },
    versos: ['42.3.1', '40.27.2', '41.15.1'],
    fuente: 'https://www.imj.org.il/en/collections/199042',
  },
  {
    id: 'caifas', figura: 'jesus', grupo: 'piedras', grado: 'probable', anio: 36,
    titulo: { es: 'El osario de Caifás', en: 'The Caiaphas ossuary' },
    autor: { es: 'Jerusalén, hallado en 1990', en: 'Jerusalem, found 1990' },
    obra: { es: 'Caja de huesos de piedra tallada; hoy en el Museo de Israel', en: 'Carved stone bone box; now in the Israel Museum' }, fecha: { es: 'siglo I', en: '1st century' },
    cita: { es: '«Yehosef bar Qayafa» —José, hijo de Caifás—, grabado en arameo.', en: '“Yehosef bar Qayafa” — Joseph, son of Caiaphas — carved in Aramaic.' },
    establece: {
      es: 'Una familia de rango sacerdotal llamada Caifás vivía en Jerusalén en la época de los evangelios. Josefo llama al sumo sacerdote de esos años «José, llamado Caifás».',
      en: 'A family of priestly rank named Caiaphas lived in Jerusalem in the time of the Gospels. Josephus calls the high priest of those years “Joseph, called Caiaphas”.',
    },
    noEstablece: { es: 'Con certeza, que esos huesos sean del Caifás del juicio. Es posible y se suele decir, pero no está probado.', en: 'For certain, that these bones belong to the Caiaphas of the trial. Plausible and often said, but not proven.' },
    versos: ['43.18.13', '40.26.57'],
    fuente: 'https://www.imj.org.il/en/collections/365050',
  },
  {
    id: 'yehohanan', figura: 'jesus', grupo: 'piedras', grado: 'firme', anio: 30,
    titulo: { es: 'El talón del crucificado', en: 'The heel of the crucified man' },
    autor: { es: 'Givat HaMivtar, Jerusalén, hallado en 1968', en: 'Givat HaMivtar, Jerusalem, found 1968' },
    obra: { es: 'Osario de Yehohanán', en: 'Ossuary of Yehohanan' }, fecha: { es: 'siglo I', en: '1st century' },
    cita: { es: 'Un hueso de talón atravesado todavía por un clavo de hierro, dentro de un osario con el nombre «Yehohanán».', en: 'A heel bone still pierced by an iron nail, inside an ossuary bearing the name “Yehohanan”.' },
    establece: {
      es: 'Es la prueba física de una crucifixión en la Jerusalén del siglo I. Y muestra que un crucificado podía ser enterrado en una tumba familiar, como cuentan los evangelios de Jesús.',
      en: 'It is physical evidence of a crucifixion in first-century Jerusalem. And it shows that a crucified man could be buried in a family tomb, as the Gospels say of Jesus.',
    },
    noEstablece: { es: 'Nada sobre Jesús en particular.', en: 'Nothing about Jesus in particular.' },
    versos: ['41.15.43-46', '43.19.38-42'],
  },
  {
    id: 'siloe', figura: 'jesus', grupo: 'piedras', grado: 'firme', anio: 30,
    titulo: { es: 'El estanque de Siloé', en: 'The Pool of Siloam' },
    autor: { es: 'Jerusalén, hallado en 2004', en: 'Jerusalem, found 2004' },
    obra: { es: 'Un gran estanque con escalones de piedra', en: 'A large pool with stone steps' }, fecha: { es: 'siglo I', en: '1st century' },
    cita: { es: 'Unos obreros que reparaban una tubería encontraron los escalones de piedra de un gran estanque de la época de Jesús.', en: 'Workers repairing a pipe uncovered the stone steps of a large pool from the time of Jesus.' },
    establece: {
      es: 'El estanque donde Juan 9 sitúa la curación del ciego existió en el siglo I. El autor del evangelio conocía bien la Jerusalén anterior a su destrucción en el año 70.',
      en: 'The pool where John 9 sets the healing of the blind man existed in the first century. The Gospel’s author knew the Jerusalem that stood before its destruction in AD 70.',
    },
    noEstablece: { es: 'El milagro. Establece el lugar.', en: 'The miracle. It establishes the place.' },
    versos: ['43.9.7'],
  },
  {
    id: 'betesda', figura: 'jesus', grupo: 'piedras', grado: 'probable', anio: 30,
    titulo: { es: 'El estanque de Betesda', en: 'The Pool of Bethesda' },
    autor: { es: 'Jerusalén, junto a Santa Ana', en: 'Jerusalem, beside St Anne’s' },
    obra: { es: 'Dos piscinas con un muro en medio', en: 'Two pools with a wall between them' }, fecha: { es: 'siglo I y antes', en: '1st century and earlier' },
    cita: { es: 'Juan 5:2 habla de un estanque «con cinco pórticos». Se encontraron dos piscinas separadas por un muro central.', en: 'John 5:2 speaks of a pool “with five porches”. Two pools separated by a central wall were found.' },
    establece: {
      es: 'El estanque existió donde el evangelio lo pone. Dos piscinas con un muro en medio permiten cuatro lados y un pórtico central: cinco.',
      en: 'The pool existed where the Gospel places it. Two pools with a wall between them allow four sides and a central porch: five.',
    },
    noEstablece: { es: 'Que los cinco pórticos estén demostrados: es una reconstrucción razonable. Tampoco la curación.', en: 'That the five porches are proven: it is a reasonable reconstruction. Nor the healing.' },
    versos: ['43.5.2'],
  },
  {
    id: 'galion', figura: 'jesus', grupo: 'piedras', grado: 'firme', anio: 52,
    titulo: { es: 'La inscripción de Galión', en: 'The Gallio inscription' },
    autor: { es: 'Delfos (Grecia), publicada en 1905', en: 'Delphi (Greece), published 1905' },
    obra: { es: 'Carta del emperador Claudio', en: 'Letter of the emperor Claudius' }, fecha: { es: 'c. 52 d. C.', en: 'c. AD 52' },
    cita: { es: '«… Lucio Junio Galión, mi amigo y procónsul…»', en: '“… Lucius Junius Gallio, my friend and proconsul…”' },
    establece: {
      es: 'Galión fue procónsul de Acaya hacia los años 51-52. Como Hechos 18 pone a Pablo ante Galión en Corinto, es uno de los puntos fijos para fechar la vida de Pablo.',
      en: 'Gallio was proconsul of Achaia around AD 51-52. Since Acts 18 places Paul before Gallio in Corinth, it is one of the fixed points for dating Paul’s life.',
    },
    noEstablece: { es: 'El juicio a Pablo: confirma al personaje y la fecha.', en: 'The trial of Paul: it confirms the man and the date.' },
    versos: ['44.18.12-17'],
  },
  {
    id: 'nazaret', figura: 'jesus', grupo: 'piedras', grado: 'firme', anio: 30,
    titulo: { es: 'Nazaret sí existía', en: 'Nazareth did exist' },
    autor: { es: 'Nazaret (Israel)', en: 'Nazareth (Israel)' },
    obra: { es: 'Casas del siglo I (excavaciones de 2009 y del convento de las Hermanas de Nazaret)', en: '1st-century houses (2009 excavation and the Sisters of Nazareth convent)' }, fecha: { es: 'siglo I', en: '1st century' },
    cita: { es: 'Restos de casas sencillas, cisternas y tumbas de la época de Jesús en una aldea pequeña.', en: 'Remains of simple houses, cisterns and tombs from the time of Jesus in a small village.' },
    establece: {
      es: 'Nazaret era una aldea pequeña y habitada en tiempos de Jesús. Algunos escépticos habían dicho que no existía; la arqueología lo desmintió. Que fuera tan pequeña explica Juan 1:46.',
      en: 'Nazareth was a small, inhabited village in Jesus’s time. Some sceptics had claimed it did not exist; archaeology refuted that. Its smallness explains John 1:46.',
    },
    noEstablece: { es: 'Cuál fue la casa de la familia de Jesús.', en: 'Which house belonged to Jesus’s family.' },
    versos: ['43.1.46', '42.1.26'],
  },
  {
    id: 'megido', figura: 'jesus', grupo: 'piedras', grado: 'firme', anio: 230,
    titulo: { es: 'Meguido: «al Dios Jesucristo»', en: 'Megiddo: “to God Jesus Christ”' },
    autor: { es: 'Meguido (Israel), hallado en 2005', en: 'Megiddo (Israel), found 2005' },
    obra: { es: 'Mosaico de una sala de culto', en: 'Mosaic in a prayer hall' }, fecha: { es: 'c. 230 d. C.', en: 'c. AD 230' },
    cita: {
      es: '«Akeptous, que ama a Dios, ofreció esta mesa al Dios Jesucristo como recuerdo.»',
      en: '“The God-loving Akeptous offered this table to God Jesus Christ as a memorial.”',
    },
    establece: {
      es: 'Una de las salas cristianas de reunión más antiguas que se conocen, en Galilea, con peces dibujados y una inscripción que llama «Dios» a Jesús un siglo antes del Concilio de Nicea.',
      en: 'One of the oldest known Christian meeting rooms, in Galilee, with fish in the mosaic and an inscription calling Jesus “God” a century before the Council of Nicaea.',
    },
    noEstablece: { es: 'Nada sobre la vida de Jesús: es evidencia de lo que creían sus seguidores.', en: 'Nothing about Jesus’s life: it is evidence of what his followers believed.' },
    versos: ['43.20.28'],
  },
  {
    id: 'isaias', figura: 'jesus', grupo: 'manuscritos', grado: 'firme', anio: -125,
    titulo: { es: 'El gran rollo de Isaías', en: 'The Great Isaiah Scroll' },
    autor: { es: 'Qumrán (Mar Muerto), hallado en 1947', en: 'Qumran (Dead Sea), found 1947' },
    obra: { es: '1QIsaᵃ, Museo de Israel', en: '1QIsaᵃ, Israel Museum' }, fecha: { es: 'c. 125 a. C.', en: 'c. 125 BC' },
    cita: { es: 'Un rollo de 7 metros con el libro completo de Isaías, incluido el capítulo 53.', en: 'A 7-metre scroll with the whole book of Isaiah, including chapter 53.' },
    establece: {
      es: 'Isaías 53 ya existía unos 150 años antes de Jesús, y el texto coincide en lo esencial con el de nuestras Biblias, con diferencias menores.',
      en: 'Isaiah 53 already existed some 150 years before Jesus, and its text matches our Bibles in substance, with minor differences.',
    },
    noEstablece: { es: 'Cómo lo leían en Qumrán. Que los cristianos lo lean como profecía de Jesús es interpretación de un texto que ya existía.', en: 'How Qumran read it. Christians reading it as prophecy of Jesus is interpretation of a text that already existed.' },
    versos: ['23.53.5', '44.8.32-35'],
    fuente: 'https://dss.collections.imj.org.il/isaiah',
  },
  {
    id: 'santiago', figura: 'jesus', grupo: 'piedras', grado: 'discutido', anio: 62,
    titulo: { es: 'El osario de Santiago', en: 'The James ossuary' },
    autor: { es: 'Mercado de antigüedades, presentado en 2002', en: 'Antiquities market, unveiled 2002' },
    obra: { es: 'Caja de huesos de piedra caliza', en: 'Limestone bone box' }, fecha: { es: 'la caja, siglo I', en: 'the box, 1st century' },
    cita: { es: '«Yaakov bar Yosef ajui de Yeshua» —Santiago, hijo de José, hermano de Jesús.', en: '“Yaakov bar Yosef akhui di Yeshua” — James, son of Joseph, brother of Jesus.' },
    establece: { es: 'Existe una caja del siglo I con esa inscripción.', en: 'A first-century box with this inscription exists.' },
    noEstablece: {
      es: 'Que la última parte de la inscripción sea antigua, ni que sea el Santiago de los evangelios. Se compró sin saber de dónde salió, y un juicio por falsificación terminó sin probar ni la falsedad ni la autenticidad.',
      en: 'That the last part of the inscription is ancient, or that this is the James of the Gospels. It was bought with no known findspot, and a forgery trial ended proving neither forgery nor authenticity.',
    },
    versos: ['41.6.3'],
  },
  {
    id: 'sabana', figura: 'jesus', grupo: 'piedras', grado: 'discutido', anio: 1300,
    titulo: { es: 'La Sábana Santa de Turín', en: 'The Shroud of Turin' },
    autor: { es: 'Catedral de Turín', en: 'Turin Cathedral' },
    obra: { es: 'Radiocarbono de 1988 (Oxford, Zúrich y Arizona)', en: '1988 radiocarbon test (Oxford, Zurich, Arizona)' }, fecha: { es: 'fechada en 1260-1390', en: 'dated 1260-1390' },
    cita: { es: 'Una tela de lino con la imagen de un hombre crucificado, conocida desde el siglo XIV.', en: 'A linen cloth with the image of a crucified man, known since the 14th century.' },
    establece: {
      es: 'Tres laboratorios fecharon la tela en la Edad Media. Cómo se formó la imagen todavía no se explica del todo.',
      en: 'Three laboratories dated the cloth to the Middle Ages. How the image formed is still not fully explained.',
    },
    noEstablece: {
      es: 'Ninguna relación demostrada con Jesús. Hay quien discute la muestra de 1988, pero no existe una datación alternativa aceptada. La fe no depende de ella.',
      en: 'Any demonstrated link to Jesus. Some dispute the 1988 sample, but no accepted alternative dating exists. Faith does not depend on it.',
    },
    versos: ['43.20.6-7'],
  },

  // ---------- Juan el Bautista ----------
  {
    id: 'josefoJuan', figura: 'juan', grupo: 'testigos', grado: 'firme', anio: 93,
    titulo: { es: 'Josefo también cuenta la muerte de Juan', en: 'Josephus also tells of John’s death' },
    autor: { es: 'Flavio Josefo, historiador judío', en: 'Flavius Josephus, Jewish historian' },
    obra: { es: 'Antigüedades judías 18.116-119', en: 'Jewish Antiquities 18.116-119' }, fecha: { es: 'c. 93 d. C.', en: 'c. AD 93' },
    cita: {
      es: '«Algunos judíos pensaban que el ejército de Herodes fue destruido por Dios, como justo castigo por lo que hizo contra Juan, llamado el Bautista. Herodes lo mató, aunque era un hombre bueno que exhortaba a los judíos a practicar la virtud, la justicia unos con otros y la piedad hacia Dios, y a acudir al bautismo. […] Como la gente se agolpaba a su alrededor, Herodes temió que su gran influencia los llevara a una rebelión. […] Fue enviado preso a Maqueronte y allí lo ejecutaron.»',
      en: '“Some of the Jews thought that the destruction of Herod’s army came from God, and very justly, as a punishment for what he did against John, called the Baptist. For Herod slew him, who was a good man and urged the Jews to practise virtue, justice towards one another and piety towards God, and so to come to baptism. […] When others gathered around him in crowds, Herod feared that his great influence might lead to a rebellion. […] He was sent a prisoner to Machaerus and there put to death.”',
    },
    establece: {
      es: 'Un historiador judío que no era cristiano confirma que Juan existió, que bautizaba, que arrastraba multitudes y que Herodes Antipas lo mandó matar en Maqueronte.',
      en: 'A Jewish historian who was not a Christian confirms that John existed, baptized, drew crowds, and was put to death by Herod Antipas at Machaerus.',
    },
    noEstablece: {
      es: 'El motivo que dan los evangelios (Herodías y su matrimonio). Josefo da un motivo político; los dos pueden ser ciertos a la vez: un profeta que critica al rey y mueve multitudes es un peligro doble.',
      en: 'The motive the Gospels give (Herodias and the marriage). Josephus gives a political one; both can be true at once: a prophet who rebukes the king and moves crowds is a double threat.',
    },
    versos: ['41.6.17-29', '40.14.3-12', '42.3.19-20'],
    contraste: {
      coinciden: { es: ['Herodes Antipas mandó matar a Juan', 'Juan era un hombre justo', 'bautizaba y llamaba a vivir con justicia', 'estuvo preso antes de morir'], en: ['Herod Antipas had John killed', 'John was a righteous man', 'he baptized and called people to live justly', 'he was imprisoned before he died'] },
      biblia: { es: ['Herodías y la crítica de Juan a ese matrimonio', 'el banquete y la hija que baila', 'la cabeza en un plato'], en: ['Herodias and John’s rebuke of the marriage', 'the banquet and the dancing daughter', 'the head on a platter'] },
      fuente: { es: ['el lugar: Maqueronte', 'el miedo de Herodes a una rebelión', 'la derrota de su ejército, vista como castigo'], en: ['the place: Machaerus', 'Herod’s fear of a rebellion', 'his army’s defeat, seen as punishment'] },
    },
    fuente: 'https://www.ccel.org/ccel/josephus/works/files/ant-18.htm',
  },
  {
    id: 'origenes', figura: 'juan', grupo: 'cristianos', grado: 'firme', anio: 248,
    titulo: { es: 'Orígenes ya citaba a Josefo', en: 'Origen already cited Josephus' },
    autor: { es: 'Orígenes de Alejandría', en: 'Origen of Alexandria' },
    obra: { es: 'Contra Celso 1.47', en: 'Against Celsus 1.47' }, fecha: { es: 'c. 248 d. C.', en: 'c. AD 248' },
    cita: {
      es: '«Josefo, en el libro dieciocho de las Antigüedades de los judíos, da testimonio de que Juan fue bautista y de que prometía la purificación a los que se bautizaban.»',
      en: '“In the eighteenth book of his Antiquities of the Jews, Josephus bears witness to John as having been a Baptist, and as promising purification to those who were baptized.”',
    },
    establece: {
      es: 'En el siglo III un cristiano ya usaba a un historiador no cristiano como testigo independiente. Preguntarse «¿esto pasó de verdad?» es tan antiguo como la fe.',
      en: 'In the third century a Christian was already using a non-Christian historian as an independent witness. Asking “did this really happen?” is as old as the faith.',
    },
    noEstablece: { es: 'Nada nuevo sobre Juan: confirma que el pasaje de Josefo ya existía entonces.', en: 'Nothing new about John: it confirms the Josephus passage already existed then.' },
    versos: ['40.3.1-6'],
    fuente: 'https://www.newadvent.org/fathers/04161.htm',
  },
  {
    id: 'discipulos', figura: 'juan', grupo: 'cristianos', grado: 'firme', anio: 52,
    titulo: { es: 'Sus discípulos seguían en Éfeso veinte años después', en: 'His disciples were still in Ephesus twenty years later' },
    autor: { es: 'Lucas', en: 'Luke' },
    obra: { es: 'Hechos 18:24-19:7', en: 'Acts 18:24-19:7' }, fecha: { es: 'hechos de c. 52 d. C.', en: 'events of c. AD 52' },
    cita: { es: '«¿En qué bautismo fueron bautizados?» Ellos respondieron: «En el bautismo de Juan.»', en: '“Into what then were you baptized?” They said, “Into John’s baptism.”' },
    establece: {
      es: 'Décadas después de su muerte había seguidores de Juan en Éfeso (la actual Turquía) que solo conocían su bautismo. Un movimiento que hay que explicar es un movimiento que existió.',
      en: 'Decades after his death there were followers of John in Ephesus (modern Turkey) who knew only his baptism. A movement that needs explaining is a movement that existed.',
    },
    noEstablece: { es: 'Cuántos eran ni cómo se organizaban.', en: 'How many there were or how they were organized.' },
    versos: ['44.19.1-7', '44.18.24-26'],
  },
  {
    id: 'maqueronte', figura: 'juan', grupo: 'piedras', grado: 'firme', anio: 29,
    titulo: { es: 'Maqueronte, la fortaleza de Herodes', en: 'Machaerus, Herod’s fortress' },
    autor: { es: 'Jordania, excavada desde los años 70', en: 'Jordan, excavated since the 1970s' },
    obra: { es: 'Palacio-fortaleza herodiano', en: 'Herodian palace-fortress' }, fecha: { es: 'siglo I a. C. - siglo I d. C.', en: '1st century BC - 1st century AD' },
    cita: { es: 'Muros, cisternas, baños y un patio lo bastante grande para un banquete real, en una colina frente al Mar Muerto.', en: 'Walls, cisterns, baths and a courtyard big enough for a royal banquet, on a ridge facing the Dead Sea.' },
    establece: {
      es: 'El lugar donde Josefo sitúa la ejecución de Juan existió tal como lo describe: un palacio fortificado de Herodes, en la época y la región correctas.',
      en: 'The place where Josephus sets John’s execution existed as he describes it: a fortified Herodian palace, in the right period and region.',
    },
    noEstablece: { es: 'Cuál fue la celda de Juan ni dónde bailó la hija de Herodías. Esas etiquetas son interpretaciones, no hallazgos.', en: 'Which was John’s cell, or where Herodias’s daughter danced. Those labels are interpretations, not findings.' },
    versos: ['41.6.21-28'],
    fuente: 'https://publications.acorjordan.org/2016/04/10/excavations-at-the-fortified-royal-palace-of-machaerus-an-acor-video-lecture-by-archaeologist-gyozo-voros/',
  },
  {
    id: 'betania', figura: 'juan', grupo: 'piedras', grado: 'probable', anio: 28,
    titulo: { es: 'Betania, al otro lado del Jordán', en: 'Bethany beyond the Jordan' },
    autor: { es: 'Al-Maghtas (Jordania)', en: 'Al-Maghtas (Jordan)' },
    obra: { es: 'Patrimonio de la Humanidad (UNESCO, 2015)', en: 'World Heritage Site (UNESCO, 2015)' }, fecha: { es: 'peregrinación desde época bizantina', en: 'pilgrimage since Byzantine times' },
    cita: { es: 'Restos de iglesias, piscinas bautismales y refugios de peregrinos junto al Jordán.', en: 'Remains of churches, baptismal pools and pilgrim shelters beside the Jordan.' },
    establece: {
      es: 'Desde hace muchos siglos los cristianos recuerdan aquí el lugar del bautismo, en la orilla y la zona que describe Juan 1:28.',
      en: 'For many centuries Christians have remembered the baptism here, on the bank and in the area John 1:28 describes.',
    },
    noEstablece: { es: 'El punto exacto del siglo I: la tradición es antigua, pero posterior.', en: 'The exact first-century spot: the tradition is old, but later.' },
    versos: ['43.1.28', '41.1.9'],
    fuente: 'https://whc.unesco.org/en/list/1446/',
  },
  {
    id: 'qumran', figura: 'juan', grupo: 'piedras', grado: 'discutido', anio: 28,
    titulo: { es: '¿Juan fue de Qumrán?', en: 'Was John from Qumran?' },
    autor: { es: 'Qumrán (Mar Muerto)', en: 'Qumran (Dead Sea)' },
    obra: { es: 'Los manuscritos del Mar Muerto', en: 'The Dead Sea Scrolls' }, fecha: { es: 'siglo I a. C. - siglo I d. C.', en: '1st century BC - 1st century AD' },
    cita: { es: 'Juan y la comunidad de Qumrán compartían desierto, época, lavados rituales y el mismo versículo: «Preparen en el desierto el camino del Señor» (Isaías 40:3).', en: 'John and the Qumran community shared a desert, an era, ritual washings and the same verse: “Prepare the way of the Lord in the wilderness” (Isaiah 40:3).' },
    establece: { es: 'Que el ambiente de Juan existía: grupos judíos que esperaban a Dios en el desierto.', en: 'That John’s world existed: Jewish groups awaiting God in the wilderness.' },
    noEstablece: { es: 'Que Juan perteneciera a esa comunidad. Es una hipótesis atractiva, sin ninguna prueba directa.', en: 'That John belonged to that community. An attractive hypothesis with no direct evidence.' },
    versos: ['42.1.80', '23.40.3', '40.3.3'],
  },
  {
    id: 'reliquias', figura: 'juan', grupo: 'piedras', grado: 'sinbase', anio: 2010,
    titulo: { es: 'Los «huesos de Juan» de Sozópol', en: 'The “bones of John” at Sozopol' },
    autor: { es: 'Isla de San Iván, Bulgaria, 2010', en: 'St Ivan Island, Bulgaria, 2010' },
    obra: { es: 'Radiocarbono y ADN (2012)', en: 'Radiocarbon and DNA (2012)' }, fecha: { es: 'huesos del siglo I', en: '1st-century bones' },
    cita: { es: 'Huesos de un hombre del siglo I, de origen compatible con Oriente Medio, junto a una cajita con el nombre de Juan.', en: 'Bones of a first-century man of Middle Eastern background, beside a small box naming John.' },
    establece: { es: 'Que los huesos son antiguos y que una iglesia los veneró como de Juan.', en: 'That the bones are ancient and that a church venerated them as John’s.' },
    noEstablece: {
      es: 'Que sean de Juan. «Edad compatible» no es identificación, y el ADN no puede decir de quién eran: no hay con qué compararlo. Los titulares que dijeron «encontraron a Juan» exageraron.',
      en: 'That they are John’s. “Compatible age” is not identification, and DNA cannot say whose they were — there is nothing to compare it with. Headlines saying “John found” overstated it.',
    },
    versos: ['41.6.29'],
    fuente: 'https://researchprofiles.ku.dk/en/publications/ams-dating-and-ancient-dna-analysis-of-bone-relics-associated-wit/',
  },
];

// ¿Facto o fake? Afirmaciones que circulan; la respuesta y su porqué
export const PREGUNTAS = [
  { prueba: 'tacito', respuesta: 'firme', texto: { es: 'Un historiador romano que despreciaba a los cristianos escribió que Cristo fue ejecutado por Poncio Pilato.', en: 'A Roman historian who despised Christians wrote that Christ was executed by Pontius Pilate.' } },
  { prueba: 'sabana', respuesta: 'falso', texto: { es: 'La ciencia probó que la Sábana Santa es la mortaja de Jesús.', en: 'Science has proven the Shroud of Turin is Jesus’s burial cloth.' } },
  { prueba: 'pilato', respuesta: 'firme', texto: { es: 'Existe una piedra antigua con el nombre de Poncio Pilato.', en: 'There is an ancient stone bearing the name of Pontius Pilate.' } },
  { prueba: 'reliquias', respuesta: 'falso', texto: { es: 'Se identificó el ADN de Juan el Bautista.', en: 'John the Baptist’s DNA has been identified.' } },
  { prueba: 'credo', respuesta: 'falso', texto: { es: 'Los cristianos empezaron a decir que Jesús resucitó siglos después de su muerte.', en: 'Christians began claiming Jesus rose from the dead centuries after his death.' } },
  { prueba: 'qumran', respuesta: 'discutido', texto: { es: 'Juan el Bautista era miembro de la comunidad de Qumrán.', en: 'John the Baptist was a member of the Qumran community.' } },
  { prueba: 'nazaret', respuesta: 'falso', texto: { es: 'Nazaret ni siquiera existía en tiempos de Jesús.', en: 'Nazareth did not even exist in Jesus’s time.' } },
  { prueba: 'josefo20', respuesta: 'firme', texto: { es: 'Un historiador judío del siglo I menciona a Santiago, «el hermano de Jesús, llamado el Cristo».', en: 'A first-century Jewish historian mentions James, “the brother of Jesus, who was called Christ”.' } },
  { prueba: 'suetonio', respuesta: 'discutido', texto: { es: 'Cuando Suetonio escribe «Cresto», es seguro que habla de Cristo.', en: 'When Suetonius writes “Chrestus”, he certainly means Christ.' } },
  { prueba: 'maqueronte', respuesta: 'falso', texto: { es: 'Los arqueólogos encontraron la celda exacta donde estuvo preso Juan.', en: 'Archaeologists found the exact cell where John was held.' } },
  { prueba: 'yehohanan', respuesta: 'firme', texto: { es: 'Un crucificado del siglo I podía ser enterrado en una tumba familiar.', en: 'A first-century crucifixion victim could be buried in a family tomb.' } },
  { prueba: 'manuscritos', respuesta: 'falso', texto: { es: 'Tenemos el manuscrito original escrito a mano por el evangelista Juan.', en: 'We have the original manuscript handwritten by John the evangelist.' } },
  { prueba: 'santiago', respuesta: 'discutido', texto: { es: 'El osario de Santiago prueba que Jesús tuvo un hermano llamado Santiago.', en: 'The James ossuary proves Jesus had a brother named James.' } },
  { prueba: 'plinio', respuesta: 'firme', texto: { es: 'Hacia el año 112 ya había cristianos que cantaban himnos a Cristo «como a un dios».', en: 'By AD 112 there were Christians singing hymns to Christ “as to a god”.' } },
];

// ---------- utilidades ----------
export const prueba = (id) => PRUEBAS.find((p) => p.id === id);
export const pruebasDe = (figura) => PRUEBAS.filter((p) => p.figura === figura);
export const numero = (p) => String(pruebasDe(p.figura).indexOf(p) + 1).padStart(2, '0');

export function parsearVerso(r) {
  const [libro, cap, v] = r.split('.');
  const [a, b] = v.split('-').map(Number);
  return { libro: Number(libro), cap: Number(cap), v: a, hasta: b || null };
}

// versículo -> ids de pruebas, para marcar el lector: «43.9.7» -> ['siloe']
export const INDICE = (() => {
  const m = {};
  for (const p of PRUEBAS) {
    for (const r of p.versos) {
      const { libro, cap, v } = parsearVerso(r);
      (m[`${libro}.${cap}.${v}`] ||= []).push(p.id);
    }
  }
  return m;
})();

// «unos 85 años después» / «unos 150 años antes» (respecto de los hechos)
export function distancia(p) {
  const d = p.anio - BASE[p.figura];
  return d;
}
