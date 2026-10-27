"""Prepara las imágenes de la sección Historia a partir de los candidatos revisados a mano.

Uso: python3 herramientas/preparar_historia.py <carpeta fuente-historia> <carpeta de grabados de Doré (001.jpg…)>
Las carpetas salen de las ramas historia-fuente y grabados-fuente (flujo «Traer grabados»).
Escribe public/historia/<nombre>.webp. Los créditos y licencias están en src/lib/imagenesHistoria.js.
"""
import pathlib
import sys

from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parent.parent
fuente, dore = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
destino = RAIZ / 'public/historia'
destino.mkdir(parents=True, exist_ok=True)

# nombre final -> candidato elegido (o «dore:NNN»)
ELEGIDAS = {
    'tacito': 'tacito-1', 'tacito-detalle': 'tacito-2', 'josefo-retrato': 'josefo-1', 'josefo-manuscrito': 'josefo-2-2',
    'plinio': 'plinio-1', 'suetonio': 'suetonio-1', 'luciano': 'luciano-1', 'talmud': 'talmud-1',
    'p46': 'credo-1', 'saulo': 'dore:095', 'kells': 'evangelios-2-1', 'p52': 'p52-1', 'sinaitico': 'manuscritos-1',
    'isaias': 'isaias-2', 'pilato-piedra': 'pilato-4', 'ecce-homo': 'banner-jesus-2', 'caifas-osario': 'caifas-1',
    'caifas-giotto': 'caifas-2-2', 'sepultura': 'dore:090', 'siloe-foto': 'siloe-2', 'siloe-tissot': 'siloe-2-1',
    'betesda': 'betesda-1', 'galion': 'galion-1', 'nazaret': 'nazaret-2-1', 'megido': 'megido-1', 'santiago': 'santiago-2',
    'sabana': 'sabana-2', 'caravaggio': 'juan-muerte-4', 'herodias': 'juan-muerte-2-1', 'origenes': 'origenes-2',
    'efeso': 'dore:097', 'bautismo': 'betania-4', 'qumran': 'qumran-2', 'sozopol': 'reliquias-1', 'tiziano': 'banner-juan-2-1',
}

total = 0
for nombre, origen in ELEGIDAS.items():
    ruta = dore / f'{origen[5:]}.jpg' if origen.startswith('dore:') else fuente / f'{origen}.jpg'
    im = Image.open(ruta)
    im = im.convert('L') if origen.startswith('dore:') else im.convert('RGB')
    im.thumbnail((1400, 1400), Image.LANCZOS)
    salida = destino / f'{nombre}.webp'
    im.save(salida, 'WEBP', quality=74, method=6)
    total += salida.stat().st_size
print(f'{len(ELEGIDAS)} imágenes, {total / 1e6:.1f} MB')
