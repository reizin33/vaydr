"""Onde o capim pode nascer no mapa (dados/mapa/grama.u8, uma célula por metro, 255 = pode, 0 = não pode).
Tira o capim de: água (rio, lago, mar), areia da praia, terra batida e estradas (pisos e roads), e de tudo o que é chão
feito pelo homem: o piso, a calçada, a rua e a parede de cada malha do mapa que encosta no chão (prédios, casas, ruas da
cidade, cais, ferrovia...). A borda de cada área sem capim cresce 1 m (a touceira tem 0,7 m de largura).
Uso: python3 -I mascara_grama.py <pasta dados/mapa>"""
import json, os, sys, zlib
import numpy as np

pasta = sys.argv[1]
meta = json.load(open(os.path.join(pasta, 'mapa.json')))
X0, Z0, W, H, P = meta['X0'], meta['Z0'], meta['W'], meta['H'], meta['P']
rel = np.fromfile(os.path.join(pasta, 'relevo.f32'), '<f4').reshape(H, W)
cor = np.fromfile(os.path.join(pasta, 'cor.rgba8'), np.uint8).reshape(H, W, 4).astype(np.int32)
agua = np.fromfile(os.path.join(pasta, 'agua_tipo.u8'), np.uint8).reshape(H, W)
bloq = np.zeros((H, W), bool)

# água, areia (vermelho >= verde na cor do chão) e terra marcada no chão
bloq |= agua != 0
bloq |= (cor[:, :, 0] >= cor[:, :, 1] * 0.98) & (cor[:, :, 0] > 80)
bloq |= cor[:, :, 3] > 128

# pisos perto da clareira (asfalto, terra, concreto): 1024 px em +-H m
S, SH = meta['splat']['S'], meta['splat']['H']
pis = np.fromfile(os.path.join(pasta, 'pisos.rgba8'), np.uint8).reshape(S, S, 4)
pm = (pis[:, :, 0] > 70) | (pis[:, :, 1] > 110) | (pis[:, :, 2] > 70)
jj, ii = np.nonzero(pm)
xs = ii / S * 2 * SH - SH
zs = jj / S * 2 * SH - SH
ci = np.clip(np.round((xs - X0) / P).astype(int), 0, W - 1)
cj = np.clip(np.round((zs - Z0) / P).astype(int), 0, H - 1)
bloq[cj, ci] = True


def marcar(pts):
    i = np.round((pts[:, 0] - X0) / P).astype(np.int64)
    j = np.round((pts[:, 1] - Z0) / P).astype(np.int64)
    ok = (i >= 0) & (j >= 0) & (i < W) & (j < H)
    bloq[j[ok], i[ok]] = True


# estradas (linhas com largura)
veg = json.load(open(os.path.join(pasta, 'vegetacao.json'), encoding='utf-8'))
for r in veg.get('roads', []):
    pts = np.array(r['pts'], float)
    meia = r['w'] * 0.5
    for a, b in zip(pts[:-1], pts[1:]):
        L = np.hypot(*(b - a))
        n = max(2, int(L / 0.4) + 1)
        t = np.linspace(0, 1, n)[:, None]
        eixo = a + (b - a) * t
        d = (b - a) / max(L, 1e-6)
        nrm = np.array([-d[1], d[0]])
        for k in np.arange(-meia, meia + 0.01, 0.4):
            marcar(eixo + nrm * k)


def h_em(x, z):
    i = np.clip(np.round((x - X0) / P).astype(np.int64), 0, W - 1)
    j = np.clip(np.round((z - Z0) / P).astype(np.int64), 0, H - 1)
    return rel[j, i]


# malhas do mapa: todo triângulo que encosta no chão vira "sem capim" (a projeção dele no chão)
def triangulos(nome):
    idx = json.load(open(os.path.join(pasta, 'malhas', nome + '.json'), encoding='utf-8'))
    f = open(os.path.join(pasta, 'malhas', nome + '.bin'), 'rb')
    for r in idx:
        if r.get('lod') in ('longe',):
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
            x = pos[:, 0] * c + pos[:, 2] * s + ox
            z = -pos[:, 0] * s + pos[:, 2] * c + oz
            pos = np.stack([x, pos[:, 1], z], 1)
        elif 'pos' in r:
            pos = pos + np.array(r['pos'], float)
        yield pos[ids]


total = 0
for grupo in ('estaticos', 'predios', 'bairros'):
    for T in triangulos(grupo):
        cx = T[:, :, 0].mean(1)
        cz = T[:, :, 2].mean(1)
        g = h_em(cx, cz)
        ymin = T[:, :, 1].min(1)
        ymax = T[:, :, 1].max(1)
        perto = (ymin < g + 1.2) & (ymax > g - 3.0)
        T = T[perto]
        if not len(T):
            continue
        total += len(T)
        xz = T[:, :, [0, 2]]
        tam = np.max(xz.max(1) - xz.min(1), axis=1)
        k = np.maximum(1, np.ceil(tam / 0.4)).astype(np.int64)
        # agrupa por número de divisões (potências de 2) e amostra cada triângulo numa grade baricêntrica
        kk = np.power(2, np.ceil(np.log2(k))).astype(np.int64)
        for q in np.unique(kk):
            sel = xz[kk == q]
            u, v = np.meshgrid(np.arange(q + 1), np.arange(q + 1))
            m = (u + v) <= q
            w1 = (u[m] / q)[None, :, None]
            w2 = (v[m] / q)[None, :, None]
            w0 = 1.0 - w1 - w2
            for a in range(0, len(sel), max(1, 2_000_000 // max(1, m.sum()))):
                bloco = sel[a:a + max(1, 2_000_000 // max(1, m.sum()))]
                pts = bloco[:, 0:1] * w0 + bloco[:, 1:2] * w1 + bloco[:, 2:3] * w2
                marcar(pts.reshape(-1, 2))

# cresce a área sem capim em 1 m
b = bloq.copy()
b[1:, :] |= bloq[:-1, :]
b[:-1, :] |= bloq[1:, :]
b[:, 1:] |= bloq[:, :-1]
b[:, :-1] |= bloq[:, 1:]
saida = np.where(b, 0, 255).astype(np.uint8)
saida.tofile(os.path.join(pasta, 'grama.u8'))
print('capim: %d triângulos no chão, %.1f%% do mapa sem capim' % (total, 100.0 * b.mean()))
