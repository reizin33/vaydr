"""Lê todas as malhas do mapa já convertidas para o Godot e devolve os triângulos no lugar deles no mundo (para a máscara do
capim e a marcação dos colisores): prédios, bairros, o que é fixo, as peças do kit e os objetos 3D (móveis, rua, lugares),
cada um com a matriz dele. Uso: from malhas_mundo import triangulos_do_mundo"""
import json, os, zlib
import numpy as np


def _ler(pasta, nome, pular_longe=True):
    idx = json.load(open(os.path.join(pasta, 'malhas', nome + '.json'), encoding='utf-8'))
    f = open(os.path.join(pasta, 'malhas', nome + '.bin'), 'rb')
    for r in idx:
        if pular_longe and r.get('lod') == 'longe':
            continue
        f.seek(r['off'])
        bruto = zlib.decompress(f.read(r['tz']))
        nu, ni = r['nu'], r['ni']
        pos = np.frombuffer(bruto, '<f4', nu * 3, 0).reshape(nu, 3).astype(np.float64)
        o = nu * 12 + nu * 4 + nu * 12 + (nu * 8 if r['uv'] else 0) + (nu * 8 if r.get('br') else 0)
        ids = np.frombuffer(bruto, '<u4', ni, o).reshape(-1, 3)
        yield r, pos, ids


def triangulos_do_mundo(pasta, objetos=True):
    """Gera arrays (n, 3, 3) de triângulos no espaço do mundo."""
    for grupo in ('estaticos', 'predios', 'bairros', 'kit'):
        if not os.path.exists(os.path.join(pasta, 'malhas', grupo + '.json')):
            continue
        for r, pos, ids in _ler(pasta, grupo):
            if 'xf' in r:
                ox, oz, yaw = r['xf']
                c, s = np.cos(yaw), np.sin(yaw)
                pos = np.stack([pos[:, 0] * c + pos[:, 2] * s + ox, pos[:, 1], -pos[:, 0] * s + pos[:, 2] * c + oz], 1)
            elif 'pos' in r:
                pos = pos + np.array(r['pos'], float)
            yield pos[ids]
    arq = os.path.join(pasta, 'objetos3d.json')
    if not objetos or not os.path.exists(arq):
        return
    modelos = {}
    for r, pos, ids in _ler(pasta, 'modelos', False):
        modelos.setdefault(r['modelo'], []).append(pos[ids])
    inst = json.load(open(arq, encoding='utf-8'))
    for cat in ('interior', 'rua', 'mundo', 'lugar', 'fixo'):
        for o in inst.get(cat, []):
            partes = modelos.get(o['m'])
            if not partes:
                continue
            x = o['xf']
            B = np.array([[x[0], x[3], x[6]], [x[1], x[4], x[7]], [x[2], x[5], x[8]]])
            t = np.array([x[9], x[10], x[11]])
            for T in partes:
                yield T @ B.T + t
