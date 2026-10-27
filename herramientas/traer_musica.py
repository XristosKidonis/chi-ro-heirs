"""Busca grabaciones en Wikimedia Commons para la música del Ambiente.

Lo usa el flujo «Traer grabados» (opción musica, en GitHub Actions, donde Commons es accesible).
Lee herramientas/musica-busquedas.txt («clave | búsqueda») y deja en fuente-musica/:
  <clave>-<n>.<ext>  (hasta 4 grabaciones por búsqueda, de menos de 40 MB)
  candidatos.json    (título, duración, licencia, autor, intérprete y página de cada una)
La elección y la licencia se revisan a mano antes de usar ninguna.
"""
import json
import pathlib
import time
import urllib.parse
import urllib.request

UA = {'User-Agent': 'chi-ro-heirs/1.0 (https://github.com/XristosKidonis/chi-ro-heirs)'}
API = 'https://commons.wikimedia.org/w/api.php?'
salida = pathlib.Path('fuente-musica')
salida.mkdir(exist_ok=True)


def pedir(params):
    with urllib.request.urlopen(urllib.request.Request(API + urllib.parse.urlencode(params), headers=UA), timeout=60) as r:
        return json.load(r)


def limpio(meta, k):
    return ' '.join(str(meta.get(k, {}).get('value', '')).replace('<', ' <').split())[:400]


candidatos = {}
for linea in pathlib.Path('herramientas/musica-busquedas.txt').read_text(encoding='utf-8').splitlines():
    linea = linea.split('#')[0].strip()
    if '|' not in linea:
        continue
    clave, busqueda = [x.strip() for x in linea.split('|', 1)]
    try:
        d = pedir({'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': f'{busqueda} filetype:audio',
                   'gsrnamespace': 6, 'gsrlimit': 4, 'prop': 'imageinfo', 'iiprop': 'url|size|mime|extmetadata|metadata'})
    except Exception as e:  # noqa: BLE001
        print('error', clave, e)
        continue
    paginas = sorted(d.get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 99))
    candidatos[clave] = []
    for n, p in enumerate(paginas, 1):
        ii = (p.get('imageinfo') or [{}])[0]
        if ii.get('size', 0) > 40e6:
            print('muy grande', clave, p['title'])
            continue
        meta = ii.get('extmetadata', {})
        duracion = next((m.get('value') for m in (ii.get('metadata') or []) if m.get('name') == 'length'), None)
        ext = ii['url'].rsplit('.', 1)[-1].lower()
        archivo = f'{clave}-{n}.{ext}'
        try:
            with urllib.request.urlopen(urllib.request.Request(ii['url'], headers=UA), timeout=300) as r:
                (salida / archivo).write_bytes(r.read())
        except Exception as e:  # noqa: BLE001
            print('no se pudo bajar', clave, p['title'], e)
            continue
        candidatos[clave].append({
            'archivo': archivo, 'titulo': p['title'], 'pagina': ii.get('descriptionurl', ''), 'mime': ii.get('mime'),
            'bytes': ii.get('size'), 'duracion': duracion,
            'licencia': limpio(meta, 'LicenseShortName'), 'autor': limpio(meta, 'Artist'),
            'fecha': limpio(meta, 'DateTimeOriginal'), 'credito': limpio(meta, 'Credit'),
            'descripcion': limpio(meta, 'ImageDescription'),
        })
        print('ok', clave, p['title'], meta.get('LicenseShortName', {}).get('value'), duracion)
        time.sleep(0.5)
    time.sleep(0.6)

(salida / 'candidatos.json').write_text(json.dumps(candidatos, ensure_ascii=False, indent=1), encoding='utf-8')
print(sum(len(v) for v in candidatos.values()), 'grabaciones')
