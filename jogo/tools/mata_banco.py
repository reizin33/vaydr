"""Converte as árvores, plantas, pedras e troncos da Poly Haven (glTF 2K, licença CC0) que o Himalaia baixou para o jogo:
src/21i_mata_dados.js (MATA). Pedido de 12/11/2026: a mata da Mata Atlântica com modelos de verdade no lugar das árvores de cone
e bola.
Árvores (1 a 4 milhões de triângulos cada, qualidade de cinema): cada uma vira duas versões, de perto (LOD0) e de meia distância
(LOD1). A casca e os galhos são simplificados (os galhinhos finos somem: a folhagem cobre); cada folha vira uma placa com
recorte (o desenho da folha tirado da própria textura), com menos folhas e maiores no lugar das muitas pequenas, e a normal
apontando para fora da copa (a copa recebe luz como um volume, dos dois lados).
Plantas, pedras e troncos: simplificados até o alvo de triângulos, sem rasgar a costura da textura.
Texturas em WebP 1K (as folhas com o recorte no canal alfa e a cor espalhada para fora do recorte, sem contorno claro no mipmap).
Uso (na pasta jogo/): python3 tools/mata_banco.py [ids...]   (sem ids: todos; os que já estão no arquivo e não foram pedidos ficam)"""
import os, sys, io, json, math, base64, time
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lugares_banco import ler_gltf, decimar, normais, codificar, cartas, densidade_uv, celulas
Image.MAX_IMAGE_PIXELS = None
SAIDA = os.environ.get('MATA_SAIDA') or os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', '21i_mata_dados.js')
PASTAS = ['/mnt/user-data/uploads/', '/mnt/user-data/attachments/d6133a28-118d-54a2-ac28-a551fc07194e/']

def acha(nome):
    for pasta in PASTAS:
        for f in sorted(os.listdir(pasta)):
            if nome in f and f.endswith('.zip') and '2k' in f: return pasta + f
    raise SystemExit('não achei o zip de ' + nome)

# id: arquivo, tipo, alvos de triângulos — árvores: por versão (perto, meia distância), o tronco, os galhos (sem os galhinhos
# menores que frac da altura) e as folhas. 13/11: antes era um alvo só para a madeira toda, com os galhinhos até 7% da altura:
# 50 a 70 mil triângulos de galho iam para ~3 mil e cada galho virava uma fita chata ("papel dobrado" no jogo). Agora ficam só
# os galhos que aparecem (a folhagem cobre os finos) e eles quase não são simplificados; o tronco ganhou mais triângulos.
def _L(tronco, galhos, folhas, frac): return dict(tronco=tronco, galhos=galhos, folhas=folhas, frac=frac)
MODELOS = {
    'ilha1': dict(src='island_tree_01', tipo='arvore', lod=[_L(4500, 4500, 9000, 0.10), _L(1000, 500, 1800, 0.16)]),
    'ilha2': dict(src='island_tree_02', tipo='arvore', lod=[_L(4000, 4500, 9000, 0.12), _L(1000, 500, 1800, 0.16)]),
    'ilha3': dict(src='island_tree_03', tipo='arvore', lod=[_L(4000, 4500, 9000, 0.10), _L(1000, 500, 1800, 0.16)]),
    'jacaranda': dict(src='jacaranda_tree', tipo='arvore', lod=[_L(5000, 5500, 10000, 0.12), _L(1000, 600, 2000, 0.16)]),
    'pequena': dict(src='tree_small_02', tipo='arvore', lod=[_L(4000, 4500, 9000, 0.10), _L(1000, 500, 1800, 0.16)]),
    'samambaia': dict(src='fern_02', tipo='planta', alvo=2200),
    'calathea': dict(src='calathea_orbifolia_01', tipo='planta', alvo=2600),
    'antorio': dict(src='anthurium_botany_01', tipo='planta', alvo=3200),
    'monguba': dict(src='pachira_aquatica_01', tipo='planta', alvo=4500),
    'arbusto2': dict(src='shrub_02', tipo='planta', alvo=3000),
    'arbusto4': dict(src='shrub_04', tipo='planta', alvo=3000),
    'tronco': dict(src='dead_tree_trunk', tipo='objeto', alvo=3000),
    'toco': dict(src='tree_stump_01', tipo='objeto', alvo=1800),
    'raizes': dict(src='root_cluster_01', tipo='objeto', alvo=3500),
    'pedra': dict(src='boulder_01', tipo='objeto', alvo=2400),
    'pedras_musgo': dict(src='rock_moss_set_01', tipo='conjunto', alvo=1400),
    'paredao': dict(src='mountainside', tipo='objeto', alvo=7000),
    'paredao2': dict(src='rock_face_01', tipo='objeto', alvo=5000),
    'paredao_l': dict(src='mountainside', tipo='objeto', alvo=1100),
    'paredao2_l': dict(src='rock_face_01', tipo='objeto', alvo=900),
    'pedra_l': dict(src='boulder_01', tipo='objeto', alvo=420),
}

def webp(im, q=80):
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()

def abre(z, caminho, lado):
    with z.open(caminho) as fh:
        im = Image.open(fh)
        if im.format == 'JPEG': im.draft('RGB', (lado, lado))
        im = im.convert('RGB')
    im.thumbnail((lado, lado), Image.LANCZOS); return im

def espalha_cor(rgb, alfa, passos=24):
    """a cor de dentro do recorte se espalha para fora (o mipmap mistura com ela, não com o fundo da foto)"""
    a = np.asarray(alfa).astype(np.float32) / 255; c = np.asarray(rgb).astype(np.float32); m = (a > 0.5).astype(np.float32)
    acc = c * m[..., None]; w = m.copy()
    for _ in range(passos):
        k = (w > 0).astype(np.float32)
        if k.all(): break
        s = np.zeros_like(acc); sw = np.zeros_like(w)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
            s += np.roll(np.roll(acc, dy, 0), dx, 1); sw += np.roll(np.roll(w, dy, 0), dx, 1)
        novo = (w == 0) & (sw > 0); acc[novo] = s[novo] / sw[novo][:, None]; w[novo] = 1
    acc[w == 0] = c[w == 0]
    return Image.fromarray(acc.clip(0, 255).astype(np.uint8))

def mascara_folhas(UV, I, lado):
    """o recorte das folhas: os triângulos de todas as folhas desenhados no espaço da textura (sem repetir os iguais)"""
    T = np.round(UV[I] * lado * 4).astype(np.int64)          # 4x para suavizar a borda
    T = np.unique(T.reshape(-1, 6), axis=0)
    im = Image.new('L', (lado * 4, lado * 4), 0); dr = ImageDraw.Draw(im)
    for t in T: dr.polygon([(t[0], lado * 4 - 1 - t[1]), (t[2], lado * 4 - 1 - t[3]), (t[4], lado * 4 - 1 - t[5])], fill=255)
    return im.resize((lado, lado), Image.LANCZOS), len(T)

def simplifica(P, UV, I, alvo, N0=None):
    """vértices juntos por célula (busca binária no tamanho da célula até ficar perto do alvo de triângulos).
    Com N0 (as normais da malha original): devolve também a normal de cada vértice novo, a média das normais originais que
    caíram nele (13/11: a casca simplificada com a normal das faces novas ficava facetada, "papel dobrado")."""
    if len(I) <= alvo: return (P, UV, I) if N0 is None else (P, UV, I, N0)
    car = cartas(len(P), I); diag = float(np.linalg.norm(P.max(0) - P.min(0)))
    lo, hi = diag * 1e-4, diag * 0.08; melhor = None
    for _ in range(18):
        cel = math.sqrt(lo * hi); r = decimar_n(P, UV, I, cel, car, N0)
        if len(r[2]) > alvo: lo = cel
        else: hi = cel; melhor = r
        if hi / lo < 1.06: break
    if melhor is None: melhor = decimar_n(P, UV, I, hi, car, N0)
    return melhor if N0 is not None else melhor[:3]

def normais_suaves(P, I):
    """normal de cada vértice da malha original, somando as faces em volta pela POSIÇÃO (a costura da textura duplica o
    vértice; aqui os dois lados da costura ficam com a mesma normal)"""
    _, w = np.unique(np.round(P / 1e-5).astype(np.int64), axis=0, return_inverse=True); w = w.ravel()
    f = np.cross(P[I[:, 1]] - P[I[:, 0]], P[I[:, 2]] - P[I[:, 0]]); Nw = np.zeros((int(w.max()) + 1, 3))
    for j in range(3): np.add.at(Nw, w[I[:, j]], f)
    N = Nw[w]; return N / (np.linalg.norm(N, axis=1, keepdims=True) + 1e-12)

def decimar_n(P, UV, I, cel, carta, N0):
    """decimar() (lugares_banco) que também leva as normais originais para os vértices novos"""
    g = densidade_uv(P, UV, I); uc = max(1 / 512, cel * g * 4)
    (cel_ids,), Pc = celulas([{'P': P}], cel)
    ku = np.floor(UV / uc).astype(np.int64)
    _, inv, cnt = np.unique(np.c_[cel_ids, carta, ku], axis=0, return_inverse=True, return_counts=True); inv = inv.ravel()
    cel_de = np.zeros(cnt.size, np.int64); cel_de[inv] = cel_ids; Pn = Pc[cel_de]
    Un = np.zeros((cnt.size, 2)); np.add.at(Un, inv, UV); Un /= cnt[:, None]
    J = inv[I]; ok = (J[:, 0] != J[:, 1]) & (J[:, 1] != J[:, 2]) & (J[:, 0] != J[:, 2]); J = J[ok]
    J = np.unique(np.sort(J, 1), axis=0, return_index=True)[1]; J = inv[I][ok][np.sort(J)]
    usados = np.unique(J); mapa = -np.ones(cnt.size, np.int64); mapa[usados] = np.arange(len(usados))
    if N0 is None: return Pn[usados], Un[usados], mapa[J]
    Nn = np.zeros((cnt.size, 3)); np.add.at(Nn, inv, N0); Nn = Nn[usados]; tam = np.linalg.norm(Nn, axis=1)
    In = mapa[J]; Pk = Pn[usados]
    # onde as normais se anulam (os dois lados de uma parede fina na mesma célula): a normal das faces novas
    fraco = tam < 0.35 * cnt[usados]
    if fraco.any():
        Ng = normais(Pk, In); Nn[fraco] = Ng[fraco]; tam[fraco] = 1
    Nn = Nn / (tam[:, None] + 1e-12)
    # vértices no mesmo ponto (costura da textura, ou a mesma célula dividida pela textura) ficam com a normal do ponto, a
    # média de tudo o que caiu na célula; menos onde ela não concorda com a do vértice (parede fina: os dois lados)
    ncel = int(cel_ids.max()) + 1; Nc = np.zeros((ncel, 3)); np.add.at(Nc, cel_ids, N0); cc = np.bincount(cel_ids, minlength=ncel)
    tc = np.linalg.norm(Nc, axis=1); Ncu = Nc / (tc[:, None] + 1e-12)
    ce = cel_de[usados]; usa = (tc[ce] > 0.5 * cc[ce]) & (np.einsum('ij,ij->i', Ncu[ce], Nn) > 0.6)
    Nn[usa] = Ncu[ce[usa]]
    return Pk, Un[usados], In, Nn

def malha(P, UV, I, N=None):
    if N is None: N = normais(P, I)
    b, uv0, uvS = codificar(P, UV, N, I)
    return {'b': b, 'uv0': [round(float(v), 6) for v in uv0], 'uvS': [round(float(v), 6) for v in uvS], 'tri': int(len(I))}

def galhos_grossos(P, UV, I, H, frac):
    """tira os galhinhos (pedaços ligados menores que frac da altura da árvore): a folhagem cobre e eles somem na simplificação"""
    lab = cartas(len(P), I); nc = int(lab.max()) + 1
    mn = np.full((nc, 3), 1e9); mx = np.full((nc, 3), -1e9); np.minimum.at(mn, lab, P); np.maximum.at(mx, lab, P)
    fica = np.linalg.norm(mx - mn, axis=1) >= frac * H
    tri_fica = fica[lab[I[:, 0]]]; I2 = I[tri_fica]
    usados = np.unique(I2); mapa = -np.ones(len(P), np.int64); mapa[usados] = np.arange(len(usados))
    return P[usados], UV[usados], mapa[I2], int(fica.sum()), nc

def folhas_cartas(P, UV, I, n_manter, centro, H, semente, expo=0.3):
    """cada folha (pedaço ligado) vira uma placa: a caixa da folha na textura, levada para o espaço pelo encaixe afim UV -> posição
    da própria folha. Ficam n_manter folhas sorteadas, maiores (cobrem a mesma área de copa)."""
    lab = cartas(len(P), I); nc = int(lab.max()) + 1
    ordem = np.argsort(lab, kind='stable'); ls = lab[ordem]; ini = np.searchsorted(ls, np.arange(nc)); fim = np.r_[ini[1:], len(ls)]
    rng = np.random.default_rng(semente)
    # folhas em tufos: sementes sorteadas e as 3 vizinhas de cada uma (copa com tufos e vãos, como a de verdade, sem folha gigante solta)
    cen = np.zeros((nc, 3)); np.add.at(cen, lab, P); cen /= np.bincount(lab, minlength=nc)[:, None]
    from scipy.spatial import cKDTree
    sem = rng.permutation(nc)[:max(1, min(n_manter, nc) // 4)]; _, viz = cKDTree(cen).query(cen[sem], k=min(4, nc))
    escolha = np.unique(np.asarray(viz).ravel())[:min(n_manter, nc)]
    k = (nc / len(escolha)) ** expo                            # folhas um pouco maiores para a copa não ficar rala
    Pq, Uq, Nq, Iq = [], [], [], []
    for c in escolha:
        vs = ordem[ini[c]:fim[c]]
        if len(vs) < 3: continue
        u = UV[vs]; p = P[vs]; M = np.c_[u, np.ones(len(vs))]
        A, *_ = np.linalg.lstsq(M, p, rcond=None)
        u0, v0 = u.min(0); u1, v1 = u.max(0)
        cu = np.array([[u0, v0], [u1, v0], [u1, v1], [u0, v1]]); q = np.c_[cu, np.ones(4)] @ A
        if np.linalg.norm(np.cross(q[1] - q[0], q[3] - q[0])) < 1e-10: continue
        cen = q.mean(0); q = cen + (q - cen) * k
        nf = np.cross(q[1] - q[0], q[3] - q[0]); nf /= np.linalg.norm(nf) + 1e-12
        fora = cen - centro; fora[1] *= 0.6; fora /= np.linalg.norm(fora) + 1e-9
        if np.dot(nf, fora) < 0: nf = -nf
        n = fora * 0.7 + nf * 0.3 + np.array([0, 0.25, 0]); n /= np.linalg.norm(n)
        b = len(Pq) * 4; Pq.append(q); Uq.append(cu); Nq.append(np.tile(n, (4, 1))); Iq.append([[b, b + 1, b + 2], [b, b + 2, b + 3]])
    return np.concatenate(Pq), np.concatenate(Uq), np.concatenate(Nq), np.concatenate(Iq).astype(np.int64), nc, k

def arvore(mid, cfg):
    t0 = time.time(); z, partes = ler_gltf(acha(cfg['src']))
    fol = [p for p in partes if 'lea' in p['nome'].lower()]; mad = [p for p in partes if 'lea' not in p['nome'].lower()]
    allP = np.concatenate([p['P'] for p in partes]); lo = allP.min(0); hi = allP.max(0); H = float(hi[1] - lo[1])
    base = np.array([(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2])
    for p in partes: p['P'] = p['P'] - base                     # pé da árvore no (0,0,0)
    fP = np.concatenate([p['P'] for p in fol]); fUV = np.concatenate([p['UV'] for p in fol]); off = np.cumsum([0] + [len(p['P']) for p in fol])
    fI = np.concatenate([p['I'] + off[k] for k, p in enumerate(fol)])
    centro = np.array([0.0, (fP[:, 1].min() + fP[:, 1].max()) / 2, 0.0]); centro[0] = fP[:, 0].mean(); centro[2] = fP[:, 2].mean()
    # texturas
    tex = {}
    ftex = fol[0]['img']; rgb = abre(z, ftex, 1024); masc, ntri = mascara_folhas(fUV, fI, 1024)
    cor = espalha_cor(rgb, masc); rgba = cor.copy(); rgba.putalpha(masc); tex['folhas'] = webp(rgba, 82)
    for p in mad: tex[p['nome']] = webp(abre(z, p['img'], 512 if 'branch' in p['nome'].lower() else 1024), 78)
    lods = []
    for nl, Lc in enumerate(cfg['lod']):
        L = {}
        # madeira: o tronco inteiro; os galhos sem os galhinhos (mais fino na meia distância). Cada parte com o seu alvo e com
        # as normais da malha original (a casca fica redonda na luz mesmo com poucos triângulos)
        for p in mad:
            P, UV, I = p['P'], p['UV'], p['I']; galho = 'branch' in p['nome'].lower()
            if galho: P, UV, I, nk, nc = galhos_grossos(P, UV, I, H, Lc['frac'])
            if len(I) == 0: continue
            Pn, Un, In, Nn = simplifica(P, UV, I, Lc['galhos'] if galho else Lc['tronco'], normais_suaves(P, I))
            L[p['nome']] = malha(Pn, Un, In, Nn)
        Pq, Uq, Nq, Iq, nfol, k = folhas_cartas(fP, fUV, fI, Lc['folhas'] // 2, centro, H, 7 + nl, 0.3 if nl == 0 else 0.4)
        L['folhas'] = malha(Pq, Uq, Iq, Nq); L['folhas']['escala'] = round(k, 3)
        lods.append(L)
    print(mid, 'altura %.2f m' % H, 'folhas', nfol, 'recorte', ntri, 'tri', [{k: v['tri'] for k, v in L.items()} for L in lods], '%.0fs' % (time.time() - t0), flush=True)
    return {'tipo': 'arvore', 'h': round(H, 3), 'lo': [round(float(v), 3) for v in (lo - base)], 'hi': [round(float(v), 3) for v in (hi - base)],
            'tex': tex, 'madeira': [p['nome'] for p in mad], 'lod': lods, 'src': cfg['src']}


def ler_variantes(caminho):
    """como ler_gltf, mas separando por nó de malha: cada nó é uma variante (a Poly Haven põe as variantes de planta lado a lado)"""
    import zipfile, math as _m
    from lugares_banco import trs, CT, NC
    z = zipfile.ZipFile(caminho); nomes = z.namelist(); gn = [n for n in nomes if n.endswith('.gltf')][0]; base = gn.rsplit('/', 1)[0] + '/' if '/' in gn else ''
    g = json.loads(z.read(gn)); bins = [z.read(base + b['uri']) for b in g['buffers']]
    def acc(i):
        a = g['accessors'][i]; bv = g['bufferViews'][a['bufferView']]; dt, sz = CT[a['componentType']]; n = NC[a['type']]; c = a['count']
        o = bv.get('byteOffset', 0) + a.get('byteOffset', 0); st = bv.get('byteStride') or n * sz; buf = bins[bv.get('buffer', 0)]
        raw = np.frombuffer(buf, dtype=np.uint8, count=st * (c - 1) + n * sz, offset=o)
        arr = np.lib.stride_tricks.as_strided(raw, shape=(c, n * sz), strides=(st, 1)).copy().view(dt).reshape(c, n).astype(np.float64)
        return arr if n > 1 else arr[:, 0]
    var = []
    def anda(ni, M):
        nd = g['nodes'][ni]; W = M @ trs(nd)
        if 'mesh' in nd:
            partes = {}
            for pr in g['meshes'][nd['mesh']]['primitives']:
                A = pr['attributes']; P = acc(A['POSITION']); I = acc(pr['indices']).astype(np.int64).reshape(-1, 3)
                UV = acc(A['TEXCOORD_0']) if 'TEXCOORD_0' in A else np.zeros((len(P), 2))
                mi = pr.get('material', -1); mat = g['materials'][mi] if mi >= 0 else {}
                Pw = (np.c_[P, np.ones(len(P))] @ W.T)[:, :3]
                if np.linalg.det(W[:3, :3]) < 0: I = I[:, ::-1]
                L = partes.setdefault(mi, {'P': [], 'UV': [], 'I': [], 'n': 0, 'nome': mat.get('name', str(mi)), 'img': None})
                bt = (mat.get('pbrMetallicRoughness') or {}).get('baseColorTexture')
                if bt is not None and L['img'] is None: L['img'] = base + g['images'][g['textures'][bt['index']]['source']]['uri']
                L['P'].append(Pw); L['UV'].append(UV); L['I'].append(I + L['n']); L['n'] += len(Pw)
            var.append([{'P': np.concatenate(L['P']), 'UV': np.concatenate(L['UV']), 'I': np.concatenate(L['I']), 'nome': L['nome'], 'img': L['img']} for L in partes.values()])
        for c in nd.get('children', []): anda(c, W)
    for r in g['scenes'][g.get('scene', 0)]['nodes']: anda(r, np.eye(4))
    return z, var

def simples(mid, cfg):
    t0 = time.time(); z, partes = ler_gltf(acha(cfg['src']))
    allP = np.concatenate([p['P'] for p in partes]); lo = allP.min(0); hi = allP.max(0)
    base = np.array([(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2])
    tot = sum(len(p['I']) for p in partes); out = {'tipo': cfg['tipo'], 'src': cfg['src'], 'partes': [], 'tex': {}}
    if cfg['tipo'] == 'conjunto':
        # várias pedras num arquivo: cada pedaço ligado vira uma pedra (com o pé no chão e o centro no meio)
        p = partes[0]; lab = cartas(len(p['P']), p['I']); comps = np.unique(lab[p['I'][:, 0]])
        out['tex'][p['nome']] = webp(abre(z, p['img'], 1024), 80); out['pecas'] = []
        for c in comps:
            ti = lab[p['I'][:, 0]] == c; I = p['I'][ti]
            if len(I) < 200: continue
            us = np.unique(I); mapa = -np.ones(len(p['P']), np.int64); mapa[us] = np.arange(len(us)); P = p['P'][us]; UV = p['UV'][us]; I = mapa[I]
            l2, h2 = P.min(0), P.max(0); P = P - np.array([(l2[0] + h2[0]) / 2, l2[1], (l2[2] + h2[2]) / 2])
            Pn, Un, In = simplifica(P, UV, I, cfg['alvo']); m = malha(Pn, Un, In); m['mat'] = p['nome']
            m['lo'] = [round(float(v), 3) for v in Pn.min(0)]; m['hi'] = [round(float(v), 3) for v in Pn.max(0)]; out['pecas'].append(m)
        print(mid, 'pedras', len(out['pecas']), [m['tri'] for m in out['pecas']], '%.0fs' % (time.time() - t0), flush=True)
        return out
    if cfg['tipo'] == 'planta':
        z, var = ler_variantes(acha(cfg['src'])); out['variantes'] = []
        # casca e folhas da mesma planta vêm em nós separados (monguba): junta os nós que ficam no mesmo lugar
        juntos = []
        for v in var:
            c = np.concatenate([p['P'] for p in v]).mean(0)
            for J in juntos:
                if np.hypot(*(J['c'] - c)[[0, 2]]) < 0.4: J['v'] += v; break
            else: juntos.append({'c': c, 'v': list(v)})
        var = [J['v'] for J in juntos]
        for v in var:
            vP = np.concatenate([p['P'] for p in v]); l2, h2 = vP.min(0), vP.max(0); b2 = np.array([(l2[0] + h2[0]) / 2, l2[1], (l2[2] + h2[2]) / 2]); tv = sum(len(p['I']) for p in v)
            ps = []
            for p in v:
                alvo = max(80, int(cfg['alvo'] * len(p['I']) / tv)); Pn, Un, In = simplifica(p['P'] - b2, p['UV'], p['I'], alvo); m = malha(Pn, Un, In); m['mat'] = p['nome']; ps.append(m)
                if p['nome'] not in out['tex'] and p['img']: out['tex'][p['nome']] = webp(abre(z, p['img'], 1024), 80)
            out['variantes'].append({'partes': ps, 'lo': [round(float(x), 3) for x in (l2 - b2)], 'hi': [round(float(x), 3) for x in (h2 - b2)]})
        print(mid, 'variantes', len(out['variantes']), [[m['tri'] for m in vv['partes']] for vv in out['variantes']], [vv['hi'][1] for vv in out['variantes']], '%.0fs' % (time.time() - t0), flush=True)
        return out
    for p in partes:
        P = p['P'] - base; alvo = max(80, int(cfg['alvo'] * len(p['I']) / tot))
        Pn, Un, In = simplifica(P, p['UV'], p['I'], alvo); m = malha(Pn, Un, In); m['mat'] = p['nome']; out['partes'].append(m)
        if p['nome'] not in out['tex'] and p['img']: out['tex'][p['nome']] = webp(abre(z, p['img'], 1024), 80)
    out['lo'] = [round(float(v), 3) for v in (lo - base)]; out['hi'] = [round(float(v), 3) for v in (hi - base)]
    fr = np.zeros(3)
    for p in partes:
        Pp = p['P']; f = np.cross(Pp[p['I'][:, 1]] - Pp[p['I'][:, 0]], Pp[p['I'][:, 2]] - Pp[p['I'][:, 0]]); fr += f.sum(0)
    fr[1] = 0; out['frente'] = [round(float(v), 4) for v in fr / (np.linalg.norm(fr) + 1e-9)]   # para onde a face escaneada olha (no chão)
    print(mid, 'tri', [m['tri'] for m in out['partes']], 'de', tot, 'tamanho', np.round(hi - lo, 2).tolist(), '%.0fs' % (time.time() - t0), flush=True)
    return out

if __name__ == '__main__':
    pedidos = sys.argv[1:] or list(MODELOS)
    antigo = {}
    if os.path.exists(SAIDA):
        s = open(SAIDA, encoding='utf-8').read(); i = s.index('const MATA=') + len('const MATA='); antigo = json.loads(s[i:s.rindex(';')])
    for mid in pedidos:
        cfg = MODELOS[mid]; antigo[mid] = arvore(mid, cfg) if cfg['tipo'] == 'arvore' else simples(mid, cfg)
    cab = ('/* ================= mata de verdade (Poly Haven, licença CC0): árvores, plantas, pedras e troncos =================\n'
           '   Gerado por tools/mata_banco.py a partir dos zips glTF 2K que o Himalaia baixou em 12/11/2026. Não editar à mão. */\n')
    open(SAIDA, 'w', encoding='utf-8').write(cab + 'const MATA=' + json.dumps(antigo, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('ok', round(os.path.getsize(SAIDA) / 2 ** 20, 1), 'MB em', SAIDA)
