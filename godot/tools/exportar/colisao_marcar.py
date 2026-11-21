"""Marca em dados/mapa/colisao.json quais colisores têm desenho no Godot: alguma malha do mapa ACIMA do chão no lugar
deles (parede, móvel, cerca, carro; só o chão da rua embaixo não conta). Cada colisor ganha um 11º campo: 1 = tem desenho,
0 = não tem (coisa do jogo antigo que ainda não veio: lugares, gruta, navio, peças do kit...). O Godot só monta os que têm desenho, mais a parede de mato da
borda do mapa (que ganha moitas no Mundo) e as pedras da serra (que ganham pedra). Assim não fica parede invisível.
Uso: python3 -I colisao_marcar.py <pasta dados/mapa>"""
import json, os, sys, zlib
import numpy as np

pasta = sys.argv[1]
meta = json.load(open(os.path.join(pasta, 'mapa.json')))
X0, Z0, W, H, P = meta['X0'], meta['Z0'], meta['W'], meta['H'], meta['P']
rel = np.fromfile(os.path.join(pasta, 'relevo.f32'), '<f4').reshape(H, W)
alto = np.full((H, W), -1e9, np.float32)   # o ponto mais alto de malha em cada célula de 1 m


def marcar(pts):
    i = np.round((pts[:, 0] - X0) / P).astype(np.int64)
    j = np.round((pts[:, 2] - Z0) / P).astype(np.int64)
    ok = (i >= 0) & (j >= 0) & (i < W) & (j < H)
    np.maximum.at(alto, (j[ok], i[ok]), pts[ok, 1].astype(np.float32))


def triangulos(nome):
    idx = json.load(open(os.path.join(pasta, 'malhas', nome + '.json'), encoding='utf-8'))
    f = open(os.path.join(pasta, 'malhas', nome + '.bin'), 'rb')
    for r in idx:
        if r.get('lod') == 'longe':
            continue
        f.seek(r['off'])
        bruto = zlib.decompress(f.read(r['tz']))
        nu, ni = r['nu'], r['ni']
        pos = np.frombuffer(bruto, '<f4', nu * 3, 0).reshape(nu, 3).astype(np.float64)
        o = nu * 12 + nu * 8 + (nu * 8 if r['uv'] else 0)
        ids = np.frombuffer(bruto, '<u4', ni, o).reshape(-1, 3)
        if 'xf' in r:
            ox, oz, yaw = r['xf']
            c, s = np.cos(yaw), np.sin(yaw)
            pos = np.stack([pos[:, 0] * c + pos[:, 2] * s + ox, pos[:, 1], -pos[:, 0] * s + pos[:, 2] * c + oz], 1)
        elif 'pos' in r:
            pos = pos + np.array(r['pos'], float)
        yield pos[ids]


for grupo in ('estaticos', 'predios', 'bairros'):
    for T in triangulos(grupo):
        xz = T
        tam = np.max(xz[:, :, [0, 2]].max(1) - xz[:, :, [0, 2]].min(1), axis=1)
        k = np.maximum(1, np.ceil(tam / 0.5)).astype(np.int64)
        kk = np.power(2, np.ceil(np.log2(k))).astype(np.int64)
        for q in np.unique(kk):
            sel = xz[kk == q]
            u, v = np.meshgrid(np.arange(q + 1), np.arange(q + 1))
            m = (u + v) <= q
            w1 = (u[m] / q)[None, :, None]
            w2 = (v[m] / q)[None, :, None]
            w0 = 1.0 - w1 - w2
            passo = max(1, 2_000_000 // max(1, int(m.sum())))
            for a in range(0, len(sel), passo):
                b = sel[a:a + passo]
                marcar((b[:, 0:1] * w0 + b[:, 1:2] * w1 + b[:, 2:3] * w2).reshape(-1, 3))

# 1 m de folga em volta; "tem desenho" = alguma malha 35 cm ou mais acima do chão
a2 = alto.copy()
a2[1:, :] = np.maximum(a2[1:, :], alto[:-1, :])
a2[:-1, :] = np.maximum(a2[:-1, :], alto[1:, :])
a2[:, 1:] = np.maximum(a2[:, 1:], alto[:, :-1])
a2[:, :-1] = np.maximum(a2[:, :-1], alto[:, 1:])
cob = a2 > rel + 0.35

arq = os.path.join(pasta, 'colisao.json')
c = json.load(open(arq, encoding='utf-8'))
n = {0: 0, 1: 0}
for x in c['coll']:
    i = int(round((x[1] - X0) / P))
    j = int(round((x[2] - Z0) / P))
    if not (0 <= i < W and 0 <= j < H):
        tem = 0
    elif x[6] is not None:
        # colisor com faixa de altura (andar de prédio, metro embaixo da terra): malha acima do pé dele
        tem = 1 if a2[j, i] > float(x[6]) + 0.3 else 0
    else:
        tem = 1 if cob[j, i] else 0
    x[10:] = [tem]
    n[tem] += 1
json.dump(c, open(arq, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('colisores com desenho: %d, sem desenho: %d' % (n[1], n[0]))
