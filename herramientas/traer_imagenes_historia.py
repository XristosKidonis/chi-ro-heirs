"""Busca en Wikimedia Commons candidatos para ilustrar la sección Historia.

Lo usa el flujo «Traer grabados» (GitHub Actions, donde Commons es accesible).
Lee herramientas/historia-imagenes.txt («clave | búsqueda») y deja en fuente-historia/:
  <clave>-<n>.jpg  (hasta 4 candidatos por búsqueda, a 1600 px de ancho)
  candidatos.json  (título, licencia, autor, fecha, crédito y página de cada uno)
La elección final y la licencia se revisan a mano antes de usar ninguna imagen.
"""
import json
import pathlib
import time
import urllib.parse
import urllib.request

UA = {'User-Agent': 'chi-ro-heirs/1.0 (https://github.com/XristosKidonis/chi-ro-heirs)'}
API = 'https://commons.wikimedia.org/w/api.php?'
salida = pathlib.Path('fuente-historia')
salida.mkdir(exist_ok=True)


def pedir(params):
    with urllib.request.urlopen(urllib.request.Request(API + urllib.parse.urlencode(params), headers=UA), timeout=60) as r:
        return json.load(r)


def limpio(meta, k):
    v = meta.get(k, {}).get('value', '')
    return ' '.join(str(v).replace('<', ' <').split())[:400]


candidatos = {}
for linea in pathlib.Path('herramientas/historia-imagenes.txt').read_text(encoding='utf-8').splitlines():
    linea = linea.split('#')[0].strip()
    if '|' not in linea:
        continue
    clave, busqueda = [x.strip() for x in linea.split('|', 1)]
    try:
        d = pedir({'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': busqueda,
                   'gsrnamespace': 6, 'gsrlimit': 4, 'prop': 'imageinfo',
                   'iiprop': 'url|size|mime|extmetadata', 'iiurlwidth': 1600})
    except Exception as e:  # noqa: BLE001
        print('error', clave, e)
        continue
    paginas = sorted(d.get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 99))
    candidatos[clave] = []
    for n, p in enumerate(paginas, 1):
        ii = (p.get('imageinfo') or [{}])[0]
        if not ii.get('mime', '').startswith('image/') or ii.get('mime') == 'image/svg+xml':
            continue
        meta = ii.get('extmetadata', {})
        archivo = f'{clave}-{n}.jpg'
        try:
            with urllib.request.urlopen(urllib.request.Request(ii.get('thumburl') or ii['url'], headers=UA), timeout=120) as r:
                (salida / archivo).write_bytes(r.read())
        except Exception as e:  # noqa: BLE001
            print('no se pudo bajar', clave, p['title'], e)
            continue
        candidatos[clave].append({
            'archivo': archivo, 'titulo': p['title'], 'pagina': ii.get('descriptionurl', ''),
            'ancho': ii.get('width'), 'alto': ii.get('height'),
            'licencia': limpio(meta, 'LicenseShortName'), 'uso': limpio(meta, 'UsageTerms'),
            'autor': limpio(meta, 'Artist'), 'fecha': limpio(meta, 'DateTimeOriginal'),
            'credito': limpio(meta, 'Credit'), 'descripcion': limpio(meta, 'ImageDescription'),
        })
        print('ok', clave, p['title'], meta.get('LicenseShortName', {}).get('value'))
        time.sleep(0.4)
    time.sleep(0.6)

(salida / 'candidatos.json').write_text(json.dumps(candidatos, ensure_ascii=False, indent=1), encoding='utf-8')
print(sum(len(v) for v in candidatos.values()), 'candidatos')
