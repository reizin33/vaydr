"""Converte a exportação do terreno do VAYDR antigo (JSON com base64) nos arquivos do mapa do Godot, em formato cru
(o Godot lê sem importar): relevo.f32 (altura de cada metro), agua.f32 (nível da água doce), agua_tipo.u8 (0 nada,
1 rio/lago, 2 mar), cor.rgba8 (cor do chão em sRGB + terra no alfa), mata.u8 (o quanto é mata) e mapa.json.
O mapa de pisos (pisos.rgba8, asfalto/terra/concreto perto da clareira) é exportado à parte e continua o mesmo.
Uso: python3 -I terreno_converter.py <terreno.json> <pasta godot/dados/mapa> [previa.jpg]"""
import base64, json, os, sys
import numpy as np

ent, saida = sys.argv[1], sys.argv[2]
os.makedirs(saida, exist_ok=True)
d = json.load(open(ent, encoding='utf-8'))
d = json.loads(d) if isinstance(d, str) else d
W, H = d['W'], d['H']
h = np.frombuffer(base64.b64decode(d['h']), dtype='<f4').reshape(H, W)
cor = np.frombuffer(base64.b64decode(d['cor']), dtype=np.uint8).reshape(H, W, 4)
agua = np.frombuffer(base64.b64decode(d['agua']), dtype='<f4').reshape(H, W)
tipo = np.frombuffer(base64.b64decode(d['tipo']), dtype=np.uint8).reshape(H, W)
mata = np.frombuffer(base64.b64decode(d['mata']), dtype=np.uint8).reshape(H, W)
h.astype('<f4').tofile(os.path.join(saida, 'relevo.f32'))
agua.astype('<f4').tofile(os.path.join(saida, 'agua.f32'))
tipo.tofile(os.path.join(saida, 'agua_tipo.u8'))
cor.tofile(os.path.join(saida, 'cor.rgba8'))
mata.tofile(os.path.join(saida, 'mata.u8'))
antigo = os.path.join(saida, 'mapa.json')
splat = json.load(open(antigo))['splat'] if os.path.exists(antigo) else {'S': 1024, 'H': 180}
meta = {k: d[k] for k in ('X0', 'Z0', 'W', 'H', 'P', 'mar', 'lago')}
meta['splat'] = splat
meta['h_min'] = float(h.min())
meta['h_max'] = float(h.max())
json.dump(meta, open(antigo, 'w'), indent=1)
print('relevo', W, 'x', H, 'de', d['X0'], d['Z0'], 'altura', round(float(h.min()), 2), 'a', round(float(h.max()), 2),
      '| água doce', int((tipo == 1).sum()), 'mar', int((tipo == 2).sum()), '| serra', d.get('nSerra'))
if len(sys.argv) > 3:
    from PIL import Image
    gy, gx = np.gradient(h)
    luz = np.clip(0.75 + (-gx * 0.6 - gy * 0.4), 0.3, 1.3)
    rgb = cor[:, :, :3].astype(np.float32) * luz[:, :, None]
    rgb[tipo == 1] = [60, 110, 150]
    rgb[tipo == 2] = [40, 80, 120]
    Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB').save(sys.argv[3], 'JPEG')
