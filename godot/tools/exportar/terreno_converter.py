"""Converte a exportação do terreno do VAYDR antigo (JSON com base64) nos arquivos do mapa do Godot.
Uso: python3 -I terreno_converter.py <c_terreno.json> <pasta godot/dados/mapa>"""
import base64, json, os, sys
import numpy as np
from PIL import Image

ent, saida = sys.argv[1], sys.argv[2]
os.makedirs(saida, exist_ok=True)
d = json.loads(json.load(open(ent, encoding='utf-8')))
W, H = d['W'], d['H']
h = np.frombuffer(base64.b64decode(d['h']), dtype='<f4').reshape(H, W)
cor = np.frombuffer(base64.b64decode(d['cor']), dtype=np.uint8).reshape(H, W, 4)
agua = np.frombuffer(base64.b64decode(d['agua']), dtype='<f4').reshape(H, W)
tipo = np.frombuffer(base64.b64decode(d['tipo']), dtype=np.uint8).reshape(H, W)
mata = np.frombuffer(base64.b64decode(d['mata']), dtype=np.uint8).reshape(H, W)
sp = d['splat']
splat = np.frombuffer(base64.b64decode(sp['d']), dtype=np.uint8).reshape(sp['S'], sp['S'], 4)
h.astype('<f4').tofile(os.path.join(saida, 'relevo.f32'))
Image.fromarray(cor, 'RGBA').save(os.path.join(saida, 'cor.png'))
Image.fromarray(mata, 'L').save(os.path.join(saida, 'mata.png'))
Image.fromarray(splat, 'RGBA').save(os.path.join(saida, 'pisos.png'))
# água: nível por célula (doce) e tipo (0 nada, 1 doce, 2 mar)
agua.astype('<f4').tofile(os.path.join(saida, 'agua.f32'))
Image.fromarray(tipo * 100, 'L').save(os.path.join(saida, 'agua_tipo.png'))
meta = {k: d[k] for k in ('X0', 'Z0', 'W', 'H', 'P', 'mar', 'lago')}
meta['splat'] = {'S': sp['S'], 'H': sp['H']}
meta['h_min'] = float(h.min()); meta['h_max'] = float(h.max())
json.dump(meta, open(os.path.join(saida, 'mapa.json'), 'w'), indent=1)
print('relevo', W, 'x', H, 'altura', round(float(h.min()), 2), 'a', round(float(h.max()), 2))
# prévia: relevo sombreado com a cor do chão e a água
gy, gx = np.gradient(h)
luz = np.clip(0.75 + (-gx * 0.6 - gy * 0.4), 0.3, 1.3)
rgb = cor[:, :, :3].astype(np.float32) * luz[:, :, None]
rgb[tipo == 1] = [60, 110, 150]
rgb[tipo == 2] = [40, 80, 120]
Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB').save(os.path.join(saida, '..', 'previa_mapa.jpg') if False else sys.argv[3] if len(sys.argv) > 3 else '/dev/null', 'JPEG')
