"""Prepara las portadillas a partir de los grabados de Doré (Project Gutenberg #8710).

Uso: python3 herramientas/preparar_grabados.py <carpeta con 001.jpg … 100.jpg>
La carpeta se obtiene con el flujo «Traer grabados» (rama grabados-fuente).
Escribe public/grabados/dore-NNN.webp solo para las láminas que usa src/lib/grabados.js.
"""
import pathlib
import re
import sys

from PIL import Image, ImageOps

RAIZ = pathlib.Path(__file__).resolve().parent.parent
fuente = pathlib.Path(sys.argv[1])
js = (RAIZ / 'src/lib/grabados.js').read_text(encoding='utf-8')
laminas = sorted({int(x) for x in re.search(r'POR_LIBRO = \[([^\]]+)\]', js).group(1).replace('\n', '').split(',') if x.strip()})

destino = RAIZ / 'public/grabados'
destino.mkdir(parents=True, exist_ok=True)
total = 0
for n in laminas:
    im = Image.open(fuente / f'{n:03d}.jpg').convert('L')
    im = ImageOps.crop(im, 6)                      # bordes del escaneo
    im = ImageOps.autocontrast(im, cutoff=(0.4, 0.8))
    if im.width > 820:
        im = im.resize((820, round(im.height * 820 / im.width)), Image.LANCZOS)
    salida = destino / f'dore-{n:03d}.webp'
    im.save(salida, 'WEBP', quality=58, method=6)
    total += salida.stat().st_size
print(f'{len(laminas)} láminas, {total / 1e6:.1f} MB')
