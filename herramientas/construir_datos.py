#!/usr/bin/env python3
"""Construye datos/biblias.db: versiones libres (dominio público o Creative Commons), referencias cruzadas y léxico Strong.

Uso:  python3 herramientas/construir_datos.py

Descarga las fuentes abiertas a datos/fuentes/ (solo la primera vez) y genera una base
SQLite con búsqueda de texto completo (FTS5) que ignora acentos y mayúsculas.
Solo usa la biblioteca estándar de Python.
"""
import http.client
import json
import os
import re
import sqlite3
import sys
import time
from concurrent.futures import ThreadPoolExecutor
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUENTES = os.path.join(RAIZ, 'datos', 'fuentes')
SALIDA = os.path.join(RAIZ, 'datos', 'biblias.db')

SCROLLMAPPER = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master'
# Textos de eBible.org tal como los publica wldeh/bible-api (un JSON por capítulo, numeración inglesa).
WLDEH = 'https://raw.githubusercontent.com/wldeh/bible-api/1d6987e268fcadb1e96ceb487e3d365a5e837f4a/bibles'

# id, nombre, idioma, licencia, fuente, tipo, año, descripción (es), descripción (en)
# tipo: literal · formal · equilibrada · dinamica · sencilla · parafrasis
VERSIONES = [
    ('RV1909', 'Reina-Valera 1909', 'es', 'Dominio público', 'scrollmapper:formats/json/SpaRV.json', 'formal', '1909',
     'La Reina-Valera clásica. Castellano antiguo («vosotros», «os») y muy apegada al texto original. Es la base de la RV1960 que se lee en muchas iglesias.',
     'The classic Spanish Reina-Valera. Older Spanish, close to the original wording; the basis of the RV1960 read in many churches.'),
    ('PDT', 'Palabra de Dios para ti', 'es', '© 2020 Asociación Bíblica Latinoamericana. CC BY-SA 4.0. Fuente: eBible.org.', 'usfx:spa-pddpt', 'formal', '2020',
     'Traducción latinoamericana reciente en español actual. Fiel a la forma del original y conserva los nombres hebreos de Dios (Yavé, ʼElohim).',
     'A recent Latin American translation in modern Spanish. Close to the form of the original; keeps the Hebrew names of God (Yavé, ʼElohim).'),
    ('VBL', 'Versión Biblia Libre', 'es', '© 2018-2020 Jonathan Gallagher y Shelly Barrios de Ávila. CC BY-SA 4.0. Fuente: eBible.org.', 'usfx:spa-vbl', 'dinamica', '2020',
     'Español de hoy, traducida por sentido: se entiende a la primera. Es la versión española de la Free Bible Version. Su traductor es adventista y en algunos pasajes discutidos (por ejemplo Lucas 23:43) sigue la lectura de esa tradición.',
     'Everyday Spanish, translated thought-for-thought. The Spanish edition of the Free Bible Version. Its translator is Adventist, and in a few disputed passages (e.g. Luke 23:43) it follows that tradition’s reading.'),
    ('BES', 'La Biblia en Español Sencillo', 'es', '© 2018-2019 AudioBiblia.org / Irma Flores. CC BY 4.0. Fuente: eBible.org.', 'usfx:spa-bes', 'sencilla', '2019',
     'Vocabulario muy sencillo, pensada para leerse en voz alta. Sigue de cerca la Bible in Basic English. Buena para empezar o para niños.',
     'Very simple vocabulary, made to be read aloud. Closely follows the Bible in Basic English. Good for beginners and children.'),
    ('RV1865', 'Reina-Valera 1865', 'es', 'Dominio público', 'scrollmapper:formats/json/SpaRV1865.json', 'formal', '1865',
     'Revisión de 1865 de la Reina-Valera, aún más antigua que la 1909. Interesante para comparar.',
     'The 1865 revision of the Reina-Valera, older still than 1909. Interesting for comparison.'),
    ('BSB', 'Berean Standard Bible', 'en', 'Dominio público (CC0)', 'scrollmapper:formats/json/BSB.json', 'equilibrada', '2023',
     'Inglés moderno, claro y fiel al original: un punto medio entre lo literal y lo legible.',
     'Modern, clear English that stays faithful to the original: a balance between literal and readable.'),
    ('WEB', 'World English Bible', 'en', 'Dominio público. Fuente: eBible.org.', 'usfx:eng-web', 'formal', '2020',
     'Revisión moderna de la American Standard Version, en inglés actual. Formal y fácil de leer; usa «Yahweh» para el nombre de Dios.',
     'A modern-English revision of the American Standard Version. Formal and readable; uses “Yahweh” for God’s name.'),
    ('FBV', 'Free Bible Version', 'en', '© 2018 Dr. Jonathan Gallagher. CC BY-SA 4.0. Fuente: eBible.org.', 'wldeh:en-fbv|eng-engfbv', 'dinamica', '2018',
     'Inglés de hoy, traducida por sentido. Su traductor es adventista y en algunos pasajes discutidos (por ejemplo Lucas 23:43) sigue la lectura de esa tradición.',
     'Everyday English, thought-for-thought. Its translator is Adventist, and in a few disputed passages (e.g. Luke 23:43) it follows that tradition’s reading.'),
    ('BBE', 'Bible in Basic English', 'en', 'Dominio público', 'scrollmapper:formats/json/BBE.json', 'sencilla', '1965',
     'Escrita con unas mil palabras básicas del inglés. Muy fácil de leer; ideal si el inglés no es tu primer idioma.',
     'Written with about a thousand basic English words. Very easy to read; ideal if English is not your first language.'),
    ('LSV', 'Literal Standard Version', 'en', '© 2020 Covenant Press. CC BY-SA 4.0. Fuente: eBible.org.', 'wldeh:en-lsv|eng-englsv', 'literal', '2020',
     'Muy literal pero en inglés moderno. Escribe YHWH para el nombre de Dios y pone entre [corchetes] las palabras añadidas.',
     'Very literal, in modern English. Writes YHWH for God’s name and marks added words in [brackets].'),
    ('KJV', 'King James Version (1769)', 'en', 'Dominio público', 'scrollmapper:formats/json/KJV.json', 'formal', '1611',
     'La King James clásica (texto de 1769). Inglés antiguo, solemne y formal.',
     'The classic King James (1769 text). Older English; solemn and formal.'),
    ('ASV', 'American Standard Version', 'en', 'Dominio público', 'scrollmapper:formats/json/ASV.json', 'literal', '1901',
     'Muy literal, del inglés de 1901. Usa «Jehovah» para el nombre de Dios.',
     'Very literal, in 1901 English. Uses “Jehovah” for God’s name.'),
    ('YLT', 'Young’s Literal Translation', 'en', 'Dominio público', 'scrollmapper:formats/json/YLT.json', 'literal', '1898',
     'Palabra por palabra, hasta en los tiempos verbales del hebreo y el griego. Cuesta leerla, pero ayuda mucho a estudiar.',
     'Word for word, even in the Hebrew and Greek verb tenses. Hard to read, but a great study aid.'),
    ('DBY', 'Darby Translation', 'en', 'Dominio público', 'scrollmapper:formats/json/Darby.json', 'literal', '1890',
     'Traducción literal de John Nelson Darby, de la tradición de los Hermanos.',
     'A literal translation by John Nelson Darby, from the Brethren tradition.'),
    ('GNV', 'Geneva Bible', 'en', 'Dominio público. Fuente: eBible.org.', 'wldeh:en-gnv|eng-enggnv', 'formal', '1599',
     'La Biblia de los reformadores ingleses y de los peregrinos del Mayflower, anterior a la King James. Ortografía antigua («loued», «giuen»).',
     'The Bible of the English Reformers and the Mayflower pilgrims, before the King James. Old spelling (“loued”, “giuen”).'),
]

# Nombres de carpeta de cada libro en wldeh/bible-api (se prueba cada alias hasta dar con el que existe)
WLDEH_LIBROS = [
    ('genesis', 'génesis'), ('exodus', 'éxodo'), ('leviticus', 'levítico'), ('numbers', 'números'), ('deuteronomy', 'deuteronomio'),
    ('joshua', 'josué'), ('judges', 'jueces'), ('ruth', 'rut'), ('1samuel',), ('2samuel',), ('1kings', '1reyes'), ('2kings', '2reyes'),
    ('1chronicles', '1crónicas'), ('2chronicles', '2crónicas'), ('ezra', 'esdras'), ('nehemiah', 'nehemías'), ('esther', 'ester'),
    ('job',), ('psalms', 'salmos'), ('proverbs', 'proverbios'), ('ecclesiastes', 'eclesiastés'),
    ('songofsongs', 'songofsolomon', 'cantares', 'cantardeloscantares'), ('isaiah', 'isaías'), ('jeremiah', 'jeremías'),
    ('lamentations', 'lamentaciones'), ('ezekiel', 'ezequiel'), ('daniel',), ('hosea', 'oseas'), ('joel',), ('amos', 'amós'),
    ('obadiah', 'abdías'), ('jonah', 'jonás'), ('micah', 'miqueas'), ('nahum', 'nahúm'), ('habakkuk', 'habacuc'),
    ('zephaniah', 'sofonías'), ('haggai', 'hageo', 'ageo'), ('zechariah', 'zacarías'), ('malachi', 'malaquías'),
    ('matthew', 'mateo'), ('mark', 'marcos'), ('luke', 'lucas'), ('john', 'juan'), ('acts', 'hechos'), ('romans', 'romanos'),
    ('1corinthians', '1corintios'), ('2corinthians', '2corintios'), ('galatians', 'gálatas'), ('ephesians', 'efesios'),
    ('philippians', 'filipenses'), ('colossians', 'colosenses'), ('1thessalonians', '1tesalonicenses'),
    ('2thessalonians', '2tesalonicenses'), ('1timothy', '1timoteo'), ('2timothy', '2timoteo'), ('titus', 'tito'),
    ('philemon', 'filemón'), ('hebrews', 'hebreos'), ('james', 'santiago'), ('1peter', '1pedro'), ('2peter', '2pedro'),
    ('1john', '1juan'), ('2john', '2juan'), ('3john', '3juan'), ('jude', 'judas'), ('revelation', 'apocalipsis'),
]
REFS_URL = SCROLLMAPPER + '/sources/extras/cross_references.txt'
STRONG_URLS = {
    'griego.js': 'https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js',
    'hebreo.js': 'https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js',
}

STEP = 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/'
STEP_INTERLINEAL = [
    # nombre local, ruta en STEPBible-Data (en orden canónico)
    ('tahot-1.txt', 'Translators Amalgamated OT+NT/TAHOT Gen-Deu - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt'),
    ('tahot-2.txt', 'Translators Amalgamated OT+NT/TAHOT Jos-Est - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt'),
    ('tahot-3.txt', 'Translators Amalgamated OT+NT/TAHOT Job-Sng - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt'),
    ('tahot-4.txt', 'Translators Amalgamated OT+NT/TAHOT Isa-Mal - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt'),
    ('tagnt-1.txt', 'Translators Amalgamated OT+NT/TAGNT Mat-Jhn - Translators Amalgamated Greek NT - STEPBible.org CC-BY.txt'),
    ('tagnt-2.txt', 'Translators Amalgamated OT+NT/TAGNT Act-Rev - Translators Amalgamated Greek NT - STEPBible.org CC-BY.txt'),
]
STEP_LEXICOS = [
    ('tbesh.txt', 'Lexicons/TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt'),
    ('tbesg.txt', 'Lexicons/TBESG - Translators Brief lexicon of Extended Strongs for Greek - STEPBible.org CC BY.txt'),
]

OSIS = ('Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov '
        'Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark '
        'Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet '
        '2Pet 1John 2John 3John Jude Rev').split()
OSIS_NUM = {k: i + 1 for i, k in enumerate(OSIS)}

ESQUEMA = """
CREATE TABLE meta (clave TEXT PRIMARY KEY, valor TEXT);
CREATE TABLE versiones (
  id TEXT PRIMARY KEY, nombre TEXT, idioma TEXT, licencia TEXT, orden INTEGER,
  tipo TEXT, anio TEXT, descripcion TEXT, descripcion_en TEXT
);
CREATE TABLE versiculos (
  id INTEGER PRIMARY KEY,
  version TEXT NOT NULL, libro INTEGER NOT NULL, cap INTEGER NOT NULL, vers INTEGER NOT NULL,
  texto TEXT NOT NULL
);
CREATE UNIQUE INDEX versiculos_ref ON versiculos (version, libro, cap, vers);
CREATE VIRTUAL TABLE versiculos_fts USING fts5(
  texto, content='versiculos', content_rowid='id', tokenize="unicode61 remove_diacritics 2"
);
CREATE TABLE refs (origen TEXT PRIMARY KEY, destinos TEXT NOT NULL) WITHOUT ROWID;
CREATE TABLE strong (id TEXT PRIMARY KEY, lema TEXT, translit TEXT, definicion TEXT, kjv TEXT, derivacion TEXT) WITHOUT ROWID;
CREATE TABLE interlineal (
  libro INTEGER NOT NULL, cap INTEGER NOT NULL, vers INTEGER NOT NULL, pos INTEGER NOT NULL,
  original TEXT, translit TEXT, glosa TEXT, glosa_es TEXT, strong TEXT, morf TEXT, variante INTEGER DEFAULT 0
);
CREATE TABLE lexico (id TEXT PRIMARY KEY, lema TEXT, translit TEXT, morf TEXT, glosa TEXT, definicion TEXT) WITHOUT ROWID;
"""


def descargar(url, nombre):
    os.makedirs(FUENTES, exist_ok=True)
    ruta = os.path.join(FUENTES, nombre)
    if not os.path.exists(ruta):
        print(f'  descargando {nombre}…')
        with urllib.request.urlopen(url, timeout=120) as r, open(ruta + '.tmp', 'wb') as f:
            f.write(r.read())
        os.replace(ruta + '.tmp', ruta)
    return ruta


def pedir_json(url, intentos=6):
    for i in range(intentos):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if i == intentos - 1:
                raise
        except (urllib.error.URLError, OSError, http.client.HTTPException):
            if i == intentos - 1:
                raise
        time.sleep(2 ** i)


def descargar_wldeh(id_, biblia, capitulos):
    """Baja una Biblia de wldeh/bible-api capítulo a capítulo y la guarda tal cual: [[libro, cap, vers, texto], …]."""
    os.makedirs(FUENTES, exist_ok=True)
    ruta = os.path.join(FUENTES, f'wldeh-{biblia}.json')
    if os.path.exists(ruta):
        return ruta
    print(f'  descargando {biblia} (wldeh/bible-api, {sum(capitulos)} capítulos)…')
    base = f'{WLDEH}/{urllib.parse.quote(biblia)}/books'

    def carpeta(i):
        for alias in WLDEH_LIBROS[i]:
            if pedir_json(f'{base}/{urllib.parse.quote(alias)}/chapters/1.json') is not None:
                return alias
        sys.exit(f'{id_}: no encuentro el libro {WLDEH_LIBROS[i][0]} en wldeh/{biblia}')

    with ThreadPoolExecutor(8) as pool:
        carpetas = list(pool.map(carpeta, range(66)))
        tareas = [(b, c) for b in range(66) for c in range(1, capitulos[b] + 1)]
        datos = list(pool.map(lambda t: pedir_json(f'{base}/{urllib.parse.quote(carpetas[t[0]])}/chapters/{t[1]}.json'), tareas))
    crudo = []
    for (b, c), d in zip(tareas, datos):
        if d is None:
            sys.exit(f'{id_}: falta {WLDEH_LIBROS[b][0]} {c}')
        crudo += [[b + 1, c, str(v['verse']), v['text'] or ''] for v in d['data']]
    json.dump(crudo, open(ruta + '.tmp', 'w', encoding='utf-8'), ensure_ascii=False)
    os.replace(ruta + '.tmp', ruta)
    return ruta


# El corpus de eBible (BibleNLP) trae el texto sin notas, pero solo para las referencias de su lista:
# se usa para limpiar los versículos de wldeh, que llevan las notas al pie pegadas dentro del texto.
EBIBLE = 'https://raw.githubusercontent.com/BibleNLP/ebible/main'
USFM = ('GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK '
        'DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH '
        '2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV').split()


def texto_ebible(nombre):
    vref = open(descargar(f'{EBIBLE}/metadata/vref.txt', 'ebible-vref.txt'), encoding='utf-8').read().split('\n')
    lineas = open(descargar(f'{EBIBLE}/corpus/{nombre}.txt', f'ebible-{nombre}.txt'), encoding='utf-8').read().split('\n')
    return {r.strip(): t.strip() for r, t in zip(vref, lineas) if t.strip() and t.strip() != '<range>'}


def quitar_nota(texto, cap, vers):
    """Quita una nota al pie pegada al texto («palabra3:16 Nota… sigue el versículo»)."""
    m = re.search(rf'(?<=[^\s\d]){cap}:{vers}\.?\s', texto)
    if not m:
        return texto
    antes, resto = texto[:m.start()], texto[m.end():]
    sigue = re.search(r'[.!?”"]\s+(?=[a-záéíóúñ])', resto)  # la nota acaba donde el versículo sigue en minúscula
    return f'{antes} {resto[sigue.end():]}' if sigue else antes


OPEN_BIBLES = 'https://raw.githubusercontent.com/seven1m/open-bibles/f257a3559025c3f873b48a75019f53a9354ed7de'
USFX_FUERA = {'f', 'x', 's', 'h', 'toc', 'id', 'ide', 'd', 'rem', 'fig', 'ms', 'mr', 'r', 'sp', 'cl', 'cp', 'ca', 'va', 'vp'}


def leer_usfx(nombre):
    """USFX de eBible (vía seven1m/open-bibles): texto completo, sin notas, con la numeración de cada Biblia."""
    import xml.etree.ElementTree as ET
    ruta = descargar(f'{OPEN_BIBLES}/{nombre}.usfx.xml', f'open-{nombre}.usfx.xml')
    raiz = ET.parse(ruta).getroot()
    versos, estado = {}, {'libro': None, 'cap': 0, 'v': None}

    def anadir(texto):
        if texto and estado['v'] is not None and estado['libro']:
            clave = (estado['libro'], estado['cap'], estado['v'])
            versos[clave] = versos.get(clave, '') + texto

    def recorrer(el):
        tag = el.tag
        if tag == 'book':
            estado['libro'] = USFM.index(el.get('id')) + 1 if el.get('id') in USFM else None
            estado['v'] = None
            for hijo in el:
                recorrer(hijo)
        elif tag == 'c':
            estado['cap'], estado['v'] = int(el.get('id')), None
        elif tag == 'v':
            m = re.match(r'\d+', el.get('id', ''))
            estado['v'] = int(m.group()) if m else None
        elif tag == 've':
            estado['v'] = None
        elif tag not in USFX_FUERA:
            anadir(el.text)
            for hijo in el:
                recorrer(hijo)
        if tag in ('p', 'q', 'b'):
            anadir(' ')
        anadir(el.tail)

    for hijo in raiz:
        recorrer(hijo)
    libros = [{'chapters': {}} for _ in range(66)]
    for (b, c, n), texto in sorted(versos.items()):
        texto = re.sub(r'\s+', ' ', texto).replace('YAVÉ', 'Yavé').strip()  # la PDT escribe el nombre en versalitas
        if texto:
            libros[b - 1]['chapters'].setdefault(c, []).append({'verse': n, 'text': texto})
    return {'books': [{'chapters': [{'chapter': c, 'verses': vs} for c, vs in sorted(l['chapters'].items())]} for l in libros]}


def armar_wldeh(id_, ruta, ebible=None):
    limpio = texto_ebible(ebible) if ebible else {}
    versos = {}
    for b, c, v, texto in json.load(open(ruta, encoding='utf-8')):
        m = re.match(r'\d+', v)
        texto = texto.strip()
        if not m or not texto:
            continue
        n = int(m.group())
        clave = (b, c, n)
        previo = versos.get(clave)
        if previo is None or previo in texto:
            versos[clave] = texto
        elif texto not in previo:  # versículo partido en dos entradas
            versos[clave] = f'{previo} {texto}'
    libros = [{'chapters': {}} for _ in range(66)]
    for (b, c, n), texto in sorted(versos.items()):
        if limpio:
            texto = limpio.get(f'{USFM[b - 1]} {c}:{n}') or quitar_nota(texto, c, n)
        texto = re.sub(r'\s*\|\|\s*', ' ', texto)  # la LSV marca así los saltos de verso poético
        libros[b - 1]['chapters'].setdefault(c, []).append({'verse': n, 'text': texto})
    return {'books': [{'chapters': [{'chapter': c, 'verses': vs} for c, vs in sorted(l['chapters'].items())]} for l in libros]}


def capitulos_por_libro(ruta):
    return [len(b['chapters']) for b in json.load(open(ruta, encoding='utf-8'))['books']]


def cargar_biblia(cur, id_, fuente):
    d = fuente if isinstance(fuente, dict) else json.load(open(fuente, encoding='utf-8'))
    if len(d['books']) != 66:
        sys.exit(f'{id_}: se esperaban 66 libros y hay {len(d["books"])}')
    filas = []
    for bi, b in enumerate(d['books'], start=1):
        for ch in b['chapters']:
            for v in ch['verses']:
                texto = re.sub(r'\s+', ' ', v['text']).strip()
                if texto and not re.fullmatch(r'[-–—]+', texto):  # la LSV marca con «-» los versículos que omite
                    filas.append((id_, bi, int(ch['chapter']), int(v['verse']), texto))
    cur.executemany('INSERT INTO versiculos (version, libro, cap, vers, texto) VALUES (?,?,?,?,?)', filas)
    return len(filas)


def ref_osis(s):
    libro, cap, vers = s.split('.')
    return f'{OSIS_NUM[libro]}.{cap}.{vers}'


def cargar_refs(cur, ruta, min_votos=3, maximo=12):
    por_origen = defaultdict(list)
    with open(ruta, encoding='utf-8') as f:
        next(f)
        for linea in f:
            p = linea.rstrip('\n').split('\t')
            try:
                votos = int(p[2])
                partes = p[1].split('-')
                destino = ref_osis(partes[0]) + ('-' + ref_osis(partes[1]) if len(partes) > 1 else '')
                origen = ref_osis(p[0])
            except (ValueError, KeyError, IndexError):
                continue
            if votos >= min_votos:
                por_origen[origen].append((votos, destino))
    filas = []
    for origen, lst in por_origen.items():
        lst.sort(key=lambda x: -x[0])
        filas.append((origen, '|'.join(d for _, d in lst[:maximo])))
    cur.executemany('INSERT INTO refs VALUES (?,?)', filas)
    return len(filas)


def cargar_strong(cur, rutas):
    filas = []
    for ruta in rutas:
        t = open(ruta, encoding='utf-8').read()
        d = json.loads(t[t.index('{', t.index('=')):t.rindex('}') + 1])
        for k, v in d.items():
            filas.append((k, v.get('lemma', ''), v.get('translit') or v.get('xlit', ''),
                          (v.get('strongs_def') or '').strip(), (v.get('kjv_def') or '').strip(),
                          (v.get('derivation') or '').strip()))
    cur.executemany('INSERT INTO strong VALUES (?,?,?,?,?,?)', filas)
    return len(filas)


RE_REF_STEP = re.compile(r'^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)(?:\([^)]*\))?#(\d+)=?([A-Za-z]*)')
RE_LLAVES = re.compile(r'\{([HG]\d+[A-Za-z]?)\}')


def cargar_interlineal(cur, rutas):
    """TAHOT (hebreo) y TAGNT (griego): una fila por palabra, con numeración inglesa."""
    libros = []  # códigos STEP en orden de aparición -> 1..66
    filas = []
    for ruta in rutas:
        griego = 'tagnt' in os.path.basename(ruta)
        with open(ruta, encoding='utf-8') as f:
            for linea in f:
                m = RE_REF_STEP.match(linea)
                if not m:
                    continue
                p = linea.rstrip('\n').split('\t')
                codigo = m.group(1)
                if codigo not in libros:
                    libros.append(codigo)
                libro = libros.index(codigo) + 1
                cap, vers, pos, tipo = int(m.group(2)), int(m.group(3)), int(m.group(4)), m.group(5)
                if griego:
                    palabra, _, translit = p[1].partition(' (')
                    strong, _, morf = p[3].partition('=')
                    glosa_es = p[8].strip() if len(p) > 8 else ''
                    filas.append((libro, cap, vers, pos, palabra.strip(), translit.rstrip(')').strip(), p[2].strip(),
                                  glosa_es, strong.strip(), morf.strip(), 0 if 'N' in tipo or 'K' in tipo else 1))
                else:
                    principal = RE_LLAVES.search(p[4])
                    strong = principal.group(1) if principal else p[4].split('/')[0].strip('{}\\')
                    original = p[1].replace('/', '').replace('\\', '')
                    filas.append((libro, cap, vers, pos, original, p[2].replace('/', ''), re.sub(r'\s+', ' ', p[3].replace('/', ' ')).strip(),
                                  '', strong, p[5].strip(), 0))
    if len(libros) != 66:
        sys.exit(f'Interlineal: se esperaban 66 libros y hay {len(libros)}')
    cur.executemany('INSERT INTO interlineal VALUES (?,?,?,?,?,?,?,?,?,?,?)', filas)
    cur.execute('CREATE INDEX interlineal_ref ON interlineal (libro, cap, vers)')
    cur.execute('CREATE INDEX interlineal_strong ON interlineal (strong)')
    return len(filas)


def limpiar_definicion(html):
    html = re.sub(r"<ref='[^']*'>(.*?)</ref>", r'\1', html)
    html = re.sub(r'<(?!/?(b|i|br)\b)[^>]*>', '', html, flags=re.I)
    return re.sub(r'<br\s*/?>', '<br>', html, flags=re.I).strip()


def cargar_lexicos(cur, rutas):
    filas = {}
    for ruta in rutas:
        with open(ruta, encoding='utf-8') as f:
            for linea in f:
                p = linea.rstrip('\n').split('\t')
                if len(p) < 8 or not re.match(r'^[HG]\d', p[0]):
                    continue
                d = p[1].split('=')[0].strip() or p[0].strip()
                if d in filas:
                    continue
                filas[d] = (d, p[3].strip(), p[4].strip(), p[5].strip(), p[6].strip(), limpiar_definicion(p[7]))
    cur.executemany('INSERT INTO lexico VALUES (?,?,?,?,?,?)', list(filas.values()))
    return len(filas)


def descargar_step(nombre, ruta):
    return descargar(STEP + urllib.parse.quote(ruta), nombre)


def main():
    print('Fuentes:')
    rutas = {}
    for v in VERSIONES:
        fuente, _, archivo = v[4].partition(':')
        if fuente == 'scrollmapper':
            rutas[v[0]] = descargar(f'{SCROLLMAPPER}/{archivo}', os.path.basename(archivo))
    capitulos = capitulos_por_libro(rutas['KJV'])
    for v in VERSIONES:
        fuente, _, archivo = v[4].partition(':')
        if fuente == 'usfx':
            rutas[v[0]] = leer_usfx(archivo)
        elif fuente == 'wldeh':
            biblia, _, ebible = archivo.partition('|')
            rutas[v[0]] = armar_wldeh(v[0], descargar_wldeh(v[0], biblia, capitulos), ebible or None)
    ruta_refs = descargar(REFS_URL, 'cross_references.txt')
    rutas_strong = [descargar(u, n) for n, u in STRONG_URLS.items()]
    rutas_inter = [descargar_step(n, r) for n, r in STEP_INTERLINEAL]
    rutas_lex = [descargar_step(n, r) for n, r in STEP_LEXICOS]

    if os.path.exists(SALIDA):
        os.remove(SALIDA)
    con = sqlite3.connect(SALIDA)
    cur = con.cursor()
    cur.executescript(ESQUEMA)
    print('Construyendo:')
    for orden, (id_, nombre, idioma, licencia, _, tipo, anio, desc, desc_en) in enumerate(VERSIONES):
        cur.execute('INSERT INTO versiones VALUES (?,?,?,?,?,?,?,?,?)', (id_, nombre, idioma, licencia, orden, tipo, anio, desc, desc_en))
        print(f'  {id_}: {cargar_biblia(cur, id_, rutas[id_])} versículos')
    cur.execute("INSERT INTO versiculos_fts(versiculos_fts) VALUES ('rebuild')")
    print(f'  referencias cruzadas: {cargar_refs(cur, ruta_refs)} versículos con referencias')
    print(f'  Strong: {cargar_strong(cur, rutas_strong)} entradas')
    print(f'  Interlineal (STEPBible): {cargar_interlineal(cur, rutas_inter)} palabras')
    print(f'  Léxicos BDB/Abbott-Smith (STEPBible): {cargar_lexicos(cur, rutas_lex)} entradas')
    cur.executemany('INSERT INTO meta VALUES (?,?)', [
        ('formato', '1'),
        ('atribuciones', 'Referencias cruzadas: OpenBible.info (CC BY). Léxico Strong: Open Scriptures (CC BY-SA). '
                         'Textos: scrollmapper/bible_databases y eBible.org (vía wldeh/bible-api). Interlineal y léxicos: STEP Bible (stepbible.org), CC BY 4.0.'),
    ])
    cur.execute("INSERT INTO versiculos_fts(versiculos_fts) VALUES ('optimize')")
    con.commit()
    con.execute('VACUUM')
    con.close()
    print(f'Listo: {SALIDA} ({os.path.getsize(SALIDA) / 1e6:.1f} MB)')


if __name__ == '__main__':
    main()
