# Saca los contornos de «CHI-RO HEIRS» (Archivo 900, ancho 75) para el logotipo vectorial de la app.
# Uso: python3 herramientas/logotipo-vector.py <carpeta temporal>  (necesita fonttools, brotli y uharfbuzz)
import sys, uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
fuente = TTFont('/home/user/chi-ro-heirs/public/fuentes/archivo-latin-variable.woff2')
inst = instantiateVariableFont(fuente, {'wght': 900, 'wdth': 75})
inst.flavor = None
ruta = sys.argv[1] + '/archivo-900-75.ttf'
inst.save(ruta)
f = TTFont(ruta)
upm = f['head'].unitsPerEm
datos = open(ruta, 'rb').read()
face = hb.Face(datos); font = hb.Font(face)
gs = f.getGlyphSet()
orden = f.getGlyphOrder()
def renglon(texto):
    buf = hb.Buffer(); buf.add_str(texto); buf.guess_segment_properties()
    hb.shape(font, buf, {'kern': True})
    pen = SVGPathPen(gs); x = 0
    bp = BoundsPen(gs)
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        nombre = orden[info.codepoint]
        t = (1, 0, 0, -1, x + pos.x_offset, 0)
        gs[nombre].draw(TransformPen(pen, t)); gs[nombre].draw(TransformPen(bp, t))
        x += pos.x_advance
    return pen.getCommands(), bp.bounds, x
import json
salida = {}
for clave, texto in [('horizontal', 'CHI-RO HEIRS'), ('chi', 'CHI-RO'), ('heirs', 'HEIRS')]:
    d, b, ancho = renglon(texto)
    salida[clave] = {'d': d, 'bounds': b, 'avance': ancho}
salida['upm'] = upm
json.dump(salida, open(sys.argv[1] + '/trazos.json', 'w'))
# apilado: cada renglón escalado a un ancho común
h, c, e = salida['horizontal'], salida['chi'], salida['heirs']
W = 2600.0
sc_c = W / (c['bounds'][2] - c['bounds'][0]); sc_e = W / (e['bounds'][2] - e['bounds'][0])
alto_c = (c['bounds'][3] - c['bounds'][1]) * sc_c; alto_e = (e['bounds'][3] - e['bounds'][1]) * sc_e
gap = alto_c * 0.1
import pathlib
destino = pathlib.Path(__file__).resolve().parent.parent / 'src/lib/logotipo.js'
destino.write_text(f"""// Contornos del logotipo CHI-RO HEIRS en Archivo 900, ancho 75, generados con herramientas/logotipo-vector.py.
// En unidades de la fuente (1000 por em); la línea base está en y = 0.
export const HORIZONTAL = {{ d: '{h['d']}', caja: {list(h['bounds'])} }};
export const APILADO = {{
  renglones: [
    {{ d: '{c['d']}', caja: {list(c['bounds'])}, escala: {sc_c:.5f}, y: {(-c['bounds'][1])*sc_c:.2f} }},
    {{ d: '{e['d']}', caja: {list(e['bounds'])}, escala: {sc_e:.5f}, y: {(-c['bounds'][1])*sc_c + gap + alto_e:.2f} }},
  ],
  ancho: {W}, alto: {alto_c+gap+alto_e:.2f},
}};
""")
print({k: (v['bounds'] if isinstance(v, dict) else v) for k, v in salida.items()})
