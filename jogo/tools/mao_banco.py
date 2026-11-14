"""Itens na mão com modelo de verdade (Poly Haven, CC0): GLB -> MOD3D (src/21c_mod3d_dados.js), no espaço da mão do jogo:
a pega fica na origem, o comprimento vai para +z (o cabo um pouco para trás, z negativo) e a lâmina/ponta para -y — o mesmo
arranjo da pistola, do machado, da picareta, da pá e do corta-cadeado que já estão lá (estes ficam como estão).
Cada item diz qual ponta é o cabo ('maior' ou 'menor' seção nas pontas: o cabo da faca é mais grosso que a lâmina; o do taco é a
ponta fina) e onde a mão pega (fração do comprimento a partir do cabo). Várias texturas viram um atlas lado a lado.
Uso: python3 -I tools/mao_banco.py pasta_dos_glb [ids...]   (sem ids: todos os do CFG)"""
import sys, os, io, json, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
import lugares_banco as LB
PASTA = sys.argv[1]; IDS = sys.argv[2:]
ARQ = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', '21c_mod3d_dados.js')
CFG = {
    'faca': dict(m='fish_knife', cabo='maior', pega=0.2, lamina=True),
    'facao': dict(m='machete', cabo='maior', pega=0.11, lamina=True),
    'taco': dict(m='baseball_bat', cabo='menor', pega=0.13),
    'peDeCabra': dict(m='crowbar_01', cabo='menor', pega=0.18),
    'lanterna': dict(m='small_plastic_torch', cabo='menor', pega=0.32, eixo='-y'),   # como no 62d: corpo ao longo de -y, a lente na ponta -y
}

def acha(m):
    for n in ('ph_' + m + '.glb', m + '.glb'):
        if os.path.exists(os.path.join(PASTA, n)): return os.path.join(PASTA, n)
    raise FileNotFoundError(m)

def textura_atlas(z, partes):
    """uma textura só: as imagens das partes lado a lado (UV de cada parte encolhida para o seu pedaço)"""
    imgs = []
    for p in partes:
        im = None
        if p['img']:
            try: im = Image.open(io.BytesIO(z.read(p['img']))).convert('RGB')
            except Exception: im = None
        if im is None:
            f = p.get('fator') or [1, 1, 1, 1]; im = Image.new('RGB', (64, 64), tuple(int(255 * max(0, min(1, c)) ** (1 / 2.2)) for c in f[:3]))
        imgs.append(im)
    chaves = []; unicas = []
    for p, im in zip(partes, imgs):
        k = p['img'] or ('cor', tuple(p.get('fator') or [1, 1, 1, 1]))
        if k not in chaves: chaves.append(k); unicas.append(im)
    n = len(unicas); lado = 1024 if n == 1 else 512
    atlas = Image.new('RGB', (lado * n, lado))
    for i, im in enumerate(unicas): atlas.paste(im.resize((lado, lado), Image.LANCZOS), (i * lado, 0))
    UVs = []
    for p in partes:
        k = p['img'] or ('cor', tuple(p.get('fator') or [1, 1, 1, 1])); i = chaves.index(k); uv = p['UV'].copy()
        if n > 1:
            if uv.min() < -0.01 or uv.max() > 1.01: print('  aviso: UV fora de 0..1 numa parte com atlas (fica cortada)')
            uv = np.clip(uv, 0, 1); uv[:, 0] = (uv[:, 0] + i) / n
        UVs.append(uv)
    if atlas.size[0] > 2048: atlas = atlas.resize((2048, int(2048 * atlas.size[1] / atlas.size[0])), Image.LANCZOS)
    b = io.BytesIO(); atlas.save(b, 'WEBP', quality=84, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode(), UVs

def converter(item, c):
    z, partes = LB.ler_gltf(acha(c['m']))
    t, UVs = textura_atlas(z, partes)
    P = np.concatenate([p['P'] for p in partes]); UV = np.concatenate(UVs); I = []; o = 0
    for p in partes: I.append(p['I'] + o); o += len(p['P'])
    I = np.concatenate(I)
    lo, hi = P.min(0), P.max(0); dims = hi - lo; a = int(np.argmax(dims)); L = dims[a]; outros = [k for k in range(3) if k != a]
    def secao(m):
        q = P[m]; e = q.max(0) - q.min(0); return e[outros[0]] * e[outros[1]], q
    m0 = P[:, a] < lo[a] + 0.12 * L; m1 = P[:, a] > hi[a] - 0.12 * L
    s0, q0 = secao(m0); s1, q1 = secao(m1)
    cabo0 = (s0 >= s1) if c['cabo'] == 'maior' else (s0 < s1)          # o cabo está na ponta de menor coordenada?
    eixo_z = np.zeros(3); eixo_z[a] = 1 if cabo0 else -1                 # do cabo para a ponta
    qc, qp = (q0, q1) if cabo0 else (q1, q0)                             # pontas: cabo e ponta
    centro_cabo = qc.mean(0)
    # lado da lâmina: o eixo de maior extensão na ponta; o gume é o lado que vai mais longe do centro do cabo
    ep = qp.max(0) - qp.min(0); b = outros[0] if ep[outros[0]] >= ep[outros[1]] else outros[1]
    meio = P[(P[:, a] > lo[a] + 0.3 * L) & (P[:, a] < hi[a] - 0.15 * L)]
    ref = meio if len(meio) else P
    mais = ref[:, b].max() - centro_cabo[b]; menos = centro_cabo[b] - ref[:, b].min()
    gume = np.zeros(3); gume[b] = 1 if mais >= menos else -1
    if not c.get('lamina'): gume = np.zeros(3); gume[b] = 1
    if c.get('eixo') == '-y':   # lanterna: a ponta (lente) para -y; o outro eixo vai para z
        ey = -eixo_z; ez = np.zeros(3); ez[b] = 1; ex = np.cross(ey, ez); R = np.stack([ex, ey, ez])
    else:
        ey = -gume; ex = np.cross(ey, eixo_z); R = np.stack([ex, ey, eixo_z])     # linhas: novos eixos x, y, z
    pega = lo[a] + (c['pega'] * L if cabo0 else (1 - c['pega']) * L)
    g = centro_cabo.copy(); g[a] = pega
    P2 = (P - g) @ R.T
    N = LB.normais(P2, I)
    b64, uv0, uvS = LB.codificar(P2, UV, N, I)
    d = {'b': b64, 't': t}
    if c.get('eixo') == '-y':   # ponta (lente) e raio dela, para a luz e o brilho da lente saírem do lugar certo
        pp = P2[P2[:, 1] < P2[:, 1].min() + 0.01]; d['ponta'] = [0.0, float(P2[:, 1].min()), 0.0]; d['raio'] = float(max(0.008, np.hypot(pp[:, 0], pp[:, 2]).max() * 0.85))
    if (np.abs(uv0) > 1e-6).any() or (np.abs(uvS - 1) > 1e-6).any(): d['uv0'] = [float(v) for v in uv0]; d['uvS'] = [float(v) for v in uvS]
    print('%-12s %-22s tri %5d  comp %.2f m  cabo %s  z %.2f..%.2f  y %.2f..%.2f %s' % (item, c['m'], len(I), L, 'menor coord' if cabo0 else 'maior coord',
          P2[:, 2].min(), P2[:, 2].max(), P2[:, 1].min(), P2[:, 1].max(), d.get('ponta', '')))
    return d

t = open(ARQ, encoding='utf-8').read(); i = t.index('const MOD3D=') + len('const MOD3D='); j = t.index(';\n', i)
D = json.loads(t[i:j])
for item in (IDS or list(CFG)):
    D[item] = converter(item, CFG[item])
novo = t[:i] + json.dumps(D, separators=(',', ':')) + t[j:]
open(ARQ, 'w', encoding='utf-8').write(novo)
print('ok', ARQ, len(novo))
