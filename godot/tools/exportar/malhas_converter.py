"""Converte as malhas exportadas do VAYDR antigo (vértices de 11 floats: posição, cor linear, brilho, interior, normal)
em blocos compactos que o Godot monta sem laço por vértice:
  posição float32 x3 | cor sRGB 8 bits + interior (CUSTOM0, RGBA8 unorm) | normal + brilho (CUSTOM1, RGBA8 snorm)
  | UV float32 x2 (só nas que têm textura) | índices uint32
Vértices repetidos viram um só (índice). Cada malha vai comprimida (deflate) e o índice JSON diz onde está.
Uso: python3 -I malhas_converter.py <saida_sem_extensao> <arquivo.json> [mais.json ...]"""
import base64, json, os, sys, zlib
import numpy as np


def srgb8(c):
    c = np.clip(c, 0.0, 1.0)
    s = np.where(c < 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)
    return np.clip(np.round(s * 255), 0, 255).astype(np.uint8)


def converter(rec):
    f = np.frombuffer(base64.b64decode(rec['d']), dtype='<f4').reshape(-1, 11)
    n = f.shape[0]
    pos = np.ascontiguousarray(f[:, 0:3]).astype('<f4')
    c0 = np.empty((n, 4), np.uint8)
    c0[:, 0:3] = srgb8(f[:, 3:6])
    c0[:, 3] = np.clip(np.round(f[:, 7] * 255), 0, 255).astype(np.uint8)
    nr = f[:, 8:11]
    ln = np.linalg.norm(nr, axis=1, keepdims=True)
    ln[ln < 1e-6] = 1
    nr = nr / ln
    c1 = np.empty((n, 4), np.int8)
    c1[:, 0:3] = np.clip(np.round(nr * 127), -127, 127).astype(np.int8)
    c1[:, 3] = np.clip(np.round(f[:, 6] * 40), 0, 127).astype(np.int8)
    partes = [pos.view(np.uint8).reshape(n, 12), c0, c1.view(np.uint8)]
    uv = None
    if rec.get('uv'):
        uv = np.frombuffer(base64.b64decode(rec['uv']), dtype='<f4').reshape(-1, 2).astype('<f4')
        partes.append(uv.view(np.uint8).reshape(n, 8))
    chave = np.ascontiguousarray(np.concatenate(partes, axis=1))
    vista = chave.view(np.dtype((np.void, chave.shape[1]))).ravel()
    _, primeiro, inverso = np.unique(vista, return_index=True, return_inverse=True)
    # mantém a ordem de aparição (melhor para o cache de vértices)
    ordem = np.argsort(primeiro)
    novo = np.empty_like(ordem)
    novo[ordem] = np.arange(len(ordem))
    sel = primeiro[ordem]
    idx = novo[inverso.ravel()].astype('<u4')
    # o WebGL usa triângulo anti-horário como frente; o Godot, horário: inverte a ordem de cada triângulo
    idx = idx.reshape(-1, 3)[:, [0, 2, 1]].ravel()
    nu = len(sel)
    blocos = [pos[sel].tobytes(), c0[sel].tobytes(), c1[sel].tobytes()]
    if uv is not None:
        blocos.append(uv[sel].tobytes())
    blocos.append(idx.tobytes())
    bruto = b''.join(blocos)
    lo = pos.min(axis=0).tolist()
    hi = pos.max(axis=0).tolist()
    return bruto, nu, len(idx), lo, hi, uv is not None


def main():
    saida = sys.argv[1]
    entradas = sys.argv[2:]
    os.makedirs(os.path.dirname(saida), exist_ok=True)
    indice = []
    total_v = total_u = 0
    with open(saida + '.bin', 'wb') as out:
        for arq in entradas:
            recs = json.loads(json.load(open(arq, encoding='utf-8')))
            if isinstance(recs, dict):
                print('erro em', arq, str(recs)[:300])
                continue
            for rec in recs:
                if not rec or not rec.get('n'):
                    continue
                bruto, nu, ni, lo, hi, tem_uv = converter(rec)
                z = zlib.compress(bruto, 6)
                info = {k: v for k, v in rec.items() if k not in ('d', 'uv')}
                info.update({'off': out.tell(), 'tz': len(z), 't': len(bruto), 'nu': nu, 'ni': ni, 'lo': lo, 'hi': hi, 'uv': tem_uv})
                out.write(z)
                indice.append(info)
                total_v += rec['n']
                total_u += nu
    json.dump(indice, open(saida + '.json', 'w', encoding='utf-8'), ensure_ascii=False)
    print('%s: %d malhas, %d vértices -> %d únicos, %.1f MB' % (os.path.basename(saida), len(indice), total_v, total_u,
                                                             os.path.getsize(saida + '.bin') / 1e6))


if __name__ == '__main__':
    main()
