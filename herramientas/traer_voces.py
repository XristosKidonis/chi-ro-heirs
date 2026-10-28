"""Baja de Hugging Face (rhasspy/piper-voices) las fichas (MODEL_CARD) de las voces Piper en español e inglés
y algunos modelos para probarlos, en fuente-voces/. Lo corre el workflow «Traer grabados» con que=voces."""
import json, os, sys, urllib.request

BASE = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/'
OUT = 'fuente-voces'
MODELOS = sys.argv[1:] or ['es_MX-ald-medium', 'es_ES-davefx-medium', 'es_ES-sharvard-medium', 'en_US-hfc_female-medium', 'en_US-ljspeech-medium']
os.makedirs(OUT, exist_ok=True)

def bajar(ruta, destino, limite=95_000_000):
    with urllib.request.urlopen(BASE + ruta, timeout=120) as r:
        datos = r.read(limite + 1)
    if len(datos) > limite:
        print('demasiado grande, se salta:', ruta)
        return False
    with open(destino, 'wb') as f:
        f.write(datos)
    return True

bajar('voices.json', f'{OUT}/voices.json')
voces = json.load(open(f'{OUT}/voices.json'))
fichas = {}
for clave, v in voces.items():
    if not clave.startswith(('es_', 'en_')):
        continue
    onnx = next((p for p in v['files'] if p.endswith('.onnx')), None)
    carpeta = onnx.rsplit('/', 1)[0]
    try:
        with urllib.request.urlopen(BASE + carpeta + '/MODEL_CARD', timeout=60) as r:
            fichas[clave] = {'ficha': r.read().decode('utf-8', 'replace'), 'bytes': v['files'][onnx]['size_bytes'], 'ruta': onnx}
    except Exception as e:
        fichas[clave] = {'error': str(e), 'ruta': onnx}
json.dump(fichas, open(f'{OUT}/fichas.json', 'w'), ensure_ascii=False, indent=1)
for m in MODELOS:
    ruta = fichas[m]['ruta']
    if bajar(ruta, f'{OUT}/{m}.onnx'):
        bajar(ruta + '.json', f'{OUT}/{m}.onnx.json')
        print('ok', m)
