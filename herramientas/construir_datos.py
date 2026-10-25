#!/usr/bin/env python3
"""Construye datos/biblias.db: versiones de dominio público, referencias cruzadas y léxico Strong.

Uso:  python3 herramientas/construir_datos.py

Descarga las fuentes abiertas a datos/fuentes/ (solo la primera vez) y genera una base
SQLite con búsqueda de texto completo (FTS5) que ignora acentos y mayúsculas.
Solo usa la biblioteca estándar de Python.
"""
import json
import os
import re
import sqlite3
import sys
import urllib.request
from collections import defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUENTES = os.path.join(RAIZ, 'datos', 'fuentes')
SALIDA = os.path.join(RAIZ, 'datos', 'biblias.db')

SCROLLMAPPER = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master'
VERSIONES = [
    # id, nombre, idioma, licencia, archivo de scrollmapper
    ('RV1909', 'Reina-Valera 1909', 'es', 'Dominio público', 'formats/json/SpaRV.json'),
    ('RV1865', 'Reina-Valera 1865', 'es', 'Dominio público', 'formats/json/SpaRV1865.json'),
    ('BSB', 'Berean Standard Bible', 'en', 'Dominio público (CC0)', 'formats/json/BSB.json'),
    ('KJV', 'King James Version (1769)', 'en', 'Dominio público', 'formats/json/KJV.json'),
]
REFS_URL = SCROLLMAPPER + '/sources/extras/cross_references.txt'
STRONG_URLS = {
    'griego.js': 'https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js',
    'hebreo.js': 'https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js',
}

OSIS = ('Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov '
        'Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark '
        'Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet '
        '2Pet 1John 2John 3John Jude Rev').split()
OSIS_NUM = {k: i + 1 for i, k in enumerate(OSIS)}

ESQUEMA = """
CREATE TABLE meta (clave TEXT PRIMARY KEY, valor TEXT);
CREATE TABLE versiones (id TEXT PRIMARY KEY, nombre TEXT, idioma TEXT, licencia TEXT, orden INTEGER);
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


def cargar_biblia(cur, id_, ruta):
    d = json.load(open(ruta, encoding='utf-8'))
    if len(d['books']) != 66:
        sys.exit(f'{id_}: se esperaban 66 libros y hay {len(d["books"])}')
    filas = []
    for bi, b in enumerate(d['books'], start=1):
        for ch in b['chapters']:
            for v in ch['verses']:
                texto = re.sub(r'\s+', ' ', v['text']).strip()
                if texto:
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


def main():
    print('Fuentes:')
    rutas = {v[0]: descargar(f'{SCROLLMAPPER}/{v[4]}', os.path.basename(v[4])) for v in VERSIONES}
    ruta_refs = descargar(REFS_URL, 'cross_references.txt')
    rutas_strong = [descargar(u, n) for n, u in STRONG_URLS.items()]

    if os.path.exists(SALIDA):
        os.remove(SALIDA)
    con = sqlite3.connect(SALIDA)
    cur = con.cursor()
    cur.executescript(ESQUEMA)
    print('Construyendo:')
    for orden, (id_, nombre, idioma, licencia, _) in enumerate(VERSIONES):
        cur.execute('INSERT INTO versiones VALUES (?,?,?,?,?)', (id_, nombre, idioma, licencia, orden))
        print(f'  {id_}: {cargar_biblia(cur, id_, rutas[id_])} versículos')
    cur.execute("INSERT INTO versiculos_fts(versiculos_fts) VALUES ('rebuild')")
    print(f'  referencias cruzadas: {cargar_refs(cur, ruta_refs)} versículos con referencias')
    print(f'  Strong: {cargar_strong(cur, rutas_strong)} entradas')
    cur.executemany('INSERT INTO meta VALUES (?,?)', [
        ('formato', '1'),
        ('atribuciones', 'Referencias cruzadas: OpenBible.info (CC BY). Léxico Strong: Open Scriptures (CC BY-SA). '
                         'Textos: scrollmapper/bible_databases.'),
    ])
    cur.execute("INSERT INTO versiculos_fts(versiculos_fts) VALUES ('optimize')")
    con.commit()
    con.execute('VACUUM')
    con.close()
    print(f'Listo: {SALIDA} ({os.path.getsize(SALIDA) / 1e6:.1f} MB)')


if __name__ == '__main__':
    main()
