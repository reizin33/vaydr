"""Converte modelos glTF (zip do Sketchfab/Fab) para o formato do jogo e escreve src/21h_lugares_dados.js (LUGX).
Para cada modelo: aplica as transformações dos nós, junta as partes do mesmo material, simplifica a malha se passar do
alvo de triângulos (junta vértices perto no espaço e na textura, sem rasgar as costuras), põe o chão no y=0 e o centro
em x=z=0, reduz as texturas de cor (JPEG) e grava no mesmo formato binário de 62b_mod3d.js (posição e UV em 16 bits,
índices, normal em 8 bits).
Uso: python3 tools/lugares_banco.py              (lê os zips de MODELOS abaixo)"""
import io, os, sys, json, math, zipfile, base64, struct
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
SAIDA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', '21h_lugares_dados.js')
UP = '/mnt/user-data/uploads/'; AT = '/mnt/user-data/attachments/d6133a28-118d-54a2-ac28-a551fc07194e/'
# id: zip, textura (lado máx. em px), alvo de triângulos (simplifica acima disso), escala, chão ('min', percentil, ou 'piso': o piso
# principal, a maior área virada para cima na parte de baixo do modelo; o que fica abaixo dele, como valas, vai para baixo do terreno), crédito
MODELOS = {
    'galpao':   dict(zip=UP + 'decayed_concrete_train_shed_with_graffiti_gltf.zip', tex=2048, alvo=60000, escala=1, chao='piso',
                     credito='Decayed concrete train shed with graffiti (Fab, licença Standard)'),
    'bunker':   dict(zip=UP + 'old_concrete_bunker_pbr_scan_gltf.zip', tex=2048, alvo=40000, escala=1, chao=8,
                     credito='Old Concrete Bunker PBR Scan (Fab, licença Standard)'),
    'predioDestruido': dict(zip=AT + 'b6ea7929-destroyed_building_02.zip', tex=1024, alvo=90000, escala=1, chao='min', tirar=['ground'],
                     # veio sem textura nenhuma (só a forma): cada material ganha uma cor e o jogo põe o relevo de detalhe dele por cima
                     cores=[('_metal', 0x6b4a35), ('concrete_0', 0x8b8880), ('walls', 0xa49b8d), ('frames', 0x4b3c2f), ('windows', 0x1e2427),
                            ('doors_panes', 0x5d4937), ('material', 0x7e7b75)],
                     credito='Destroyed Building 02, de Prince Obrymec (Sketchfab, licença Standard)'),
    'predioAbandonado': dict(zip=AT + 'cd44fc74-abandoned_building.zip', tex=2048, alvo=20000, escala=3, chao='min',   # veio 3x menor (fachada de 9 andares com 8,5 m); a fachada é o lado +x
                     credito='Abandoned building, de Federico Paredes (CC BY 4.0)'),
    'casaAbandonada': dict(zip=UP + 'abandoned_house.zip', tex=1024, alvo=30000, escala=0.5, chao='min',   # veio 2x maior (pé-direito de 5,9 m)
                     credito='Abandoned House, de AspectStudios (CC BY 4.0)'),
    'ruinaMata': dict(zip=UP + 'forest_house_ruin.zip', tex=2048, alvo=90000, escala=1, chao=6,
                     credito='Forest house ruin, de matousekfoto (CC BY 4.0)'),
    'carroDestruido': dict(zip=UP + 'destroyed_car_03__backrooms_car_gameready_ver.zip', tex=1024, alvo=15000, escala=1.35, chao='min',   # veio com 3,15 m
                     credito='Destroyed Car 03, de Renafox (CC BY 4.0)'),
    # túnel do metrô (vai no subsolo, depois da linha da estação escondida): veio ~2,2x maior (21 m de largura); 0,45 deixa a bitola
    # da linha e o túnel de duas vias com uns 9,5 m de largura e 7,4 m de altura. As luminárias (Material.004) acendem.
    # Luminária, caixa dela (005), canos (006) e cabos (007) entram inteiros: simplificadas viravam cacos (manchas claras soltas na parede)
    'tunelMetro': dict(zip=AT + '90b18db5-corrosed_subway_tunnel_gltf.zip', tex=2048, alvo=130000, escala=0.45, chao={'y': -0.01}, emissivo={'Material.004': 1.6},   # chão = topo do lastro (senão os trilhos viram parede)
                     inteiro=['Material.004', 'Material.005', 'Material.006', 'Material.007'], credito='Corroded subway tunnel (Fab, licença Standard)'),
}
CT = {5126: ('<f4', 4), 5125: ('<u4', 4), 5123: ('<u2', 2), 5121: ('u1', 1), 5122: ('<i2', 2), 5120: ('i1', 1)}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}

def trs(n):
    if 'matrix' in n: return np.array(n['matrix'], dtype=np.float64).reshape(4, 4).T
    t = n.get('translation', [0, 0, 0]); q = n.get('rotation', [0, 0, 0, 1]); s = n.get('scale', [1, 1, 1]); x, y, z, w = q
    R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                  [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    M = np.eye(4); M[:3, :3] = R * np.array(s)[None, :]; M[:3, 3] = t; return M

def ler_gltf(caminho):
    z = zipfile.ZipFile(caminho); nomes = z.namelist()
    gn = [n for n in nomes if n.endswith('.gltf')][0]; base = gn.rsplit('/', 1)[0] + '/' if '/' in gn else ''
    g = json.loads(z.read(gn)); bins = [z.read(base + b['uri']) for b in g['buffers']]
    def acc(i):
        a = g['accessors'][i]; bv = g['bufferViews'][a['bufferView']]; dt, sz = CT[a['componentType']]; n = NC[a['type']]; c = a['count']
        o = bv.get('byteOffset', 0) + a.get('byteOffset', 0); st = bv.get('byteStride') or n * sz; buf = bins[bv.get('buffer', 0)]
        raw = np.frombuffer(buf, dtype=np.uint8, count=st * (c - 1) + n * sz, offset=o)
        arr = np.lib.stride_tricks.as_strided(raw, shape=(c, n * sz), strides=(st, 1)).copy().view(dt).reshape(c, n).astype(np.float64)
        if a.get('normalized'):
            arr /= {'u1': 255, '<u2': 65535, 'i1': 127, '<i2': 32767}.get(dt, 1)
        return arr if n > 1 else arr[:, 0]
    partes = {}   # material → listas
    def anda(ni, M):
        n = g['nodes'][ni]; W = M @ trs(n)
        if 'mesh' in n:
            for p in g['meshes'][n['mesh']]['primitives']:
                if p.get('mode', 4) != 4: continue
                A = p['attributes']; P = acc(A['POSITION'])
                I = acc(p['indices']).astype(np.int64).reshape(-1, 3) if 'indices' in p else np.arange(len(P)).reshape(-1, 3)
                UV = acc(A['TEXCOORD_0']) if 'TEXCOORD_0' in A else np.zeros((len(P), 2))
                mi = p.get('material', -1); mat = g['materials'][mi] if mi >= 0 else {}
                tt = ((mat.get('pbrMetallicRoughness') or {}).get('baseColorTexture') or {}).get('extensions', {}).get('KHR_texture_transform')
                if tt:
                    off = np.array(tt.get('offset', [0, 0])); sc = np.array(tt.get('scale', [1, 1])); r = tt.get('rotation', 0)
                    c_, s_ = math.cos(r), math.sin(r); UV = (UV * sc) @ np.array([[c_, s_], [-s_, c_]]) + off
                Pw = (np.c_[P, np.ones(len(P))] @ W.T)[:, :3]
                if np.linalg.det(W[:3, :3]) < 0: I = I[:, ::-1]
                L = partes.setdefault(mi, {'P': [], 'UV': [], 'I': [], 'n': 0})
                L['P'].append(Pw); L['UV'].append(UV); L['I'].append(I + L['n']); L['n'] += len(Pw)
        for c in n.get('children', []): anda(c, W)
    for r in g['scenes'][g.get('scene', 0)]['nodes']: anda(r, np.eye(4))
    saida = []
    for mi, L in partes.items():
        mat = g['materials'][mi] if mi >= 0 else {}; pb = mat.get('pbrMetallicRoughness') or {}
        img = None; bt = pb.get('baseColorTexture')
        if bt is not None:
            src = g['textures'][bt['index']].get('source')
            if src is not None: img = base + g['images'][src]['uri']
        saida.append({'P': np.concatenate(L['P']), 'UV': np.concatenate(L['UV']), 'I': np.concatenate(L['I']), 'img': img,
                      'fator': pb.get('baseColorFactor', [1, 1, 1, 1]), 'nome': mat.get('name', str(mi))})
    return z, saida

def densidade_uv(P, UV, I):
    """quanto a UV anda por metro de superfície (mediana dos triângulos)"""
    A, B, C = P[I[:, 0]], P[I[:, 1]], P[I[:, 2]]; a3 = np.linalg.norm(np.cross(B - A, C - A), axis=1) / 2
    a, b, c = UV[I[:, 0]], UV[I[:, 1]], UV[I[:, 2]]; a2 = np.abs((b[:, 0] - a[:, 0]) * (c[:, 1] - a[:, 1]) - (c[:, 0] - a[:, 0]) * (b[:, 1] - a[:, 1])) / 2
    m = a3 > 1e-8; return float(np.median(np.sqrt(a2[m] / a3[m]))) if m.any() else 0.0

def cartas(nv, I):
    """ilha de textura (carta) de cada vértice: no glTF a costura da UV duplica o vértice, então cada pedaço ligado da malha é uma ilha"""
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import connected_components
    r = np.r_[I[:, 0], I[:, 1], I[:, 2]]; c = np.r_[I[:, 1], I[:, 2], I[:, 0]]
    return connected_components(coo_matrix((np.ones(len(r), np.int8), (r, c)), shape=(nv, nv)), directed=False)[1].astype(np.int64)

def celulas(partes, cel):
    """célula de posição de cada vértice de todas as partes juntas, e a posição média de cada célula. Tem que ser uma conta só
    para o modelo todo: na costura entre dois materiais (duas partes), os dois lados precisam cair no mesmo ponto"""
    allP = np.concatenate([p['P'] for p in partes]); _, inv = np.unique(np.floor(allP / cel).astype(np.int64), axis=0, return_inverse=True); inv = inv.ravel()
    n = int(inv.max()) + 1; Pc = np.zeros((n, 3)); np.add.at(Pc, inv, allP); Pc /= np.bincount(inv, minlength=n)[:, None]
    out = []; o = 0
    for p in partes: out.append(inv[o:o + len(p['P'])]); o += len(p['P'])
    return out, Pc

def decimar(P, UV, I, cel, g=None, carta=None, cel_ids=None, Pc=None):
    """junta vértices na mesma célula de posição (cel m); tira triângulos que somem ou se repetem.
    Só junta vértices da mesma ilha de textura (carta): juntar através da costura faz triângulo atravessar o vão entre as ilhas do
    atlas, e aparece na parede uma risca clara de contorno escuro (parecia rachadura). A posição é a média da célula (a mesma dos
    dois lados da costura: não abre fresta); a UV é a média dentro da ilha. Na mesma ilha, a célula de textura (g = UV por metro)
    ainda separa as duas faces de uma parede fina."""
    if g is None: g = densidade_uv(P, UV, I)
    if carta is None: carta = np.zeros(len(P), np.int64)
    uc = max(1 / 512, cel * g * 4)
    if cel_ids is None: (cel_ids,), Pc = celulas([{'P': P}], cel)
    invp = cel_ids
    ku = np.floor(UV / uc).astype(np.int64)
    _, inv, cnt = np.unique(np.c_[invp, carta, ku], axis=0, return_inverse=True, return_counts=True); inv = inv.ravel()
    cel_de = np.zeros(cnt.size, np.int64); cel_de[inv] = invp; Pn = Pc[cel_de]
    Un = np.zeros((cnt.size, 2)); np.add.at(Un, inv, UV); Un /= cnt[:, None]
    J = inv[I]; ok = (J[:, 0] != J[:, 1]) & (J[:, 1] != J[:, 2]) & (J[:, 0] != J[:, 2]); J = J[ok]
    J = np.unique(np.sort(J, 1), axis=0, return_index=True)[1]; J = inv[I][ok][np.sort(J)]
    usados = np.unique(J); mapa = -np.ones(cnt.size, np.int64); mapa[usados] = np.arange(len(usados))
    return Pn[usados], Un[usados], mapa[J]

def normais(P, I):
    N = np.zeros_like(P); f = np.cross(P[I[:, 1]] - P[I[:, 0]], P[I[:, 2]] - P[I[:, 0]])
    for j in range(3): np.add.at(N, I[:, j], f)
    return N / (np.linalg.norm(N, axis=1, keepdims=True) + 1e-12)

def textura(z, parte, lado):
    if parte['img']:
        with z.open(parte['img']) as fh:
            im = Image.open(fh)
            if im.format == 'JPEG': im.draft('RGB', (lado, lado))
            im = im.convert('RGB')
    else: im = None
    f = parte['fator']
    if im is None:
        c = tuple(int(255 * max(0, min(1, v)) ** (1 / 2.2)) for v in f[:3]); im = Image.new('RGB', (8, 8), c)
    else:
        im.thumbnail((lado, lado), Image.LANCZOS)
        if any(abs(v - 1) > 1e-3 for v in f[:3]):
            a = np.asarray(im).astype(np.float64) / 255; a = (a ** 2.2 * np.array(f[:3])) ** (1 / 2.2); im = Image.fromarray((a * 255).clip(0, 255).astype(np.uint8))
    b = io.BytesIO(); im.save(b, 'WEBP', quality=80, method=6)   # WebP: ~45% menor que o JPEG q82, mesma cara
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode(), im.size

def codificar(P, UV, N, I):
    nv, nt = len(P), len(I); lo = P.min(0); hi = P.max(0); hi = np.where(hi - lo < 1e-6, lo + 1e-6, hi)
    uv0 = UV.min(0); uvS = np.maximum(UV.max(0) - uv0, 1e-6)
    out = bytearray(struct.pack('<II3f3f', nv, nt, *lo, *hi))
    out += np.round((P - lo) / (hi - lo) * 65535).clip(0, 65535).astype('<u2').tobytes()
    out += np.round((UV - uv0) / uvS * 65535).clip(0, 65535).astype('<u2').tobytes()
    out += I.astype('<u4' if nv > 65535 else '<u2').tobytes()
    out += np.round(N * 127).clip(-127, 127).astype('i1').tobytes()
    return base64.b64encode(bytes(out)).decode(), uv0, uvS

def decodificar(b64):
    """o inverso de codificar(): posições e triângulos do binário que o jogo lê"""
    d = base64.b64decode(b64); nv, nt = struct.unpack_from('<II', d, 0); lo = np.array(struct.unpack_from('<3f', d, 8)); hi = np.array(struct.unpack_from('<3f', d, 20))
    o = 32; q = np.frombuffer(d, '<u2', nv * 3, o).reshape(-1, 3); o += nv * 6 + nv * 4
    I = np.frombuffer(d, '<u4' if nv > 65535 else '<u2', nt * 3, o).reshape(-1, 3).astype(np.int64)
    return lo + q / 65535 * (hi - lo), I

def colisao(malhas, cel=0.25, faixa=(0.4, 1.6), minimo=3, fechar=True, raio=1):
    """caixas de colisão (x, z, meia-largura, meia-profundidade no espaço do modelo, chão em y=0): onde houver parede, coluna,
    entulho ou móvel na altura do corpo (faixa), o jogador e os zumbis param; chão, entulho baixo e teto/viga alta não contam.
    Amostra cada triângulo numa grade fina, marca as células de cel m que têm superfície na faixa, tira grãos soltos (menos de
    `minimo` células juntas) e junta as células em retângulos grandes."""
    from scipy import ndimage
    pts = []
    for P, I in malhas:
        A, B, C = P[I[:, 0]], P[I[:, 1]], P[I[:, 2]]
        y0 = np.minimum(np.minimum(A[:, 1], B[:, 1]), C[:, 1]); y1 = np.maximum(np.maximum(A[:, 1], B[:, 1]), C[:, 1])
        ok = (y1 >= faixa[0]) & (y0 <= faixa[1]); A, B, C = A[ok], B[ok], C[ok]
        L = np.maximum(np.maximum(np.linalg.norm(B - A, axis=1), np.linalg.norm(C - B, axis=1)), np.linalg.norm(A - C, axis=1))
        k = np.clip(np.ceil(L / (cel * 0.5)), 1, 400).astype(int)
        for kv in np.unique(k):
            s = k == kv; ii, jj = np.meshgrid(np.arange(kv + 1), np.arange(kv + 1)); m = ii + jj <= kv; u = ii[m] / kv; v = jj[m] / kv
            a, b, c = A[s], B[s], C[s]; bloco = max(1, 400000 // len(u))   # em blocos, para não estourar a memória
            for lo in range(0, len(a), bloco):
                a_, b_, c_ = a[lo:lo + bloco], b[lo:lo + bloco], c[lo:lo + bloco]
                Q = (a_[:, None, :] + (b_ - a_)[:, None, :] * u[None, :, None] + (c_ - a_)[:, None, :] * v[None, :, None]).reshape(-1, 3)
                Q = Q[(Q[:, 1] >= faixa[0]) & (Q[:, 1] <= faixa[1])]
                if len(Q): pts.append(Q[:, [0, 2]])
    if not pts: return []
    Q = np.concatenate(pts); ij = np.floor(Q / cel).astype(np.int64); i0 = ij.min(0); ij -= i0
    G = np.zeros(ij.max(0) + 1, bool); G[ij[:, 0], ij[:, 1]] = True
    lab, n = ndimage.label(G, structure=np.ones((3, 3)))
    if n:
        tam = ndimage.sum(G, lab, range(1, n + 1)); G &= np.isin(lab, 1 + np.nonzero(tam >= minimo)[0])
    if fechar:   # o que o corpo (raio 0,3 m) não alcança vindo de fora vira sólido: frestas, vãos fechados, cômodo sem porta
        pad = 4; G2 = np.pad(G, pad); q = np.ones((3, 3), bool)
        livre = ~ndimage.binary_dilation(G2, structure=q, iterations=raio)
        lab2, _ = ndimage.label(livre); borda = np.unique(np.r_[lab2[0, :], lab2[-1, :], lab2[:, 0], lab2[:, -1]]); borda = borda[borda > 0]
        corpo = ndimage.binary_dilation(np.isin(lab2, borda), structure=q, iterations=raio)
        G = ~corpo[pad:-pad, pad:-pad]
    usado = np.zeros_like(G); caixas = []; NX, NZ = G.shape
    for z in range(NZ):
        x = 0
        while x < NX:
            if not G[x, z] or usado[x, z]: x += 1; continue
            x2 = x
            while x2 + 1 < NX and G[x2 + 1, z] and not usado[x2 + 1, z]: x2 += 1
            z2 = z
            while z2 + 1 < NZ and G[x:x2 + 1, z2 + 1].all() and not usado[x:x2 + 1, z2 + 1].any(): z2 += 1
            usado[x:x2 + 1, z:z2 + 1] = True
            hw = (x2 - x + 1) * cel / 2; hd = (z2 - z + 1) * cel / 2
            cx = (i0[0] + x) * cel + hw; cz = (i0[1] + z) * cel + hd
            caixas.append([round(float(cx), 2), round(float(cz), 2), round(max(0.08, hw - 0.04), 2), round(max(0.08, hd - 0.04), 2)])
            x = x2 + 1
    return caixas

def colisao_lugar(L):
    return colisao([decodificar(p['b']) for p in L['partes']])

def piso(partes, ymin, ymax):
    """altura do piso principal: a faixa de 25 cm com mais área virada para cima nos 40% de baixo, e a mediana (por área) dela"""
    ys, ars = [], []
    for p in partes:
        P, I = p['P'], p['I']; A, B, C = P[I[:, 0]], P[I[:, 1]], P[I[:, 2]]; n = np.cross(B - A, C - A); ar = np.linalg.norm(n, axis=1) / 2
        ny = n[:, 1] / (2 * ar + 1e-12); m = ny > 0.85; ys.append((A[m, 1] + B[m, 1] + C[m, 1]) / 3); ars.append(ar[m])
    y = np.concatenate(ys); a = np.concatenate(ars); teto = ymin + 0.4 * (ymax - ymin)
    h, e = np.histogram(y, bins=np.arange(ymin, teto + 0.25, 0.25), weights=a); c = (e[np.argmax(h)] + e[np.argmax(h) + 1]) / 2
    m = np.abs(y - c) < 0.3; o = np.argsort(y[m]); cw = np.cumsum(a[m][o]) / a[m].sum()
    return float(y[m][o][np.searchsorted(cw, 0.5)])

def s2l(c):
    c = c / 255; return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def cor_parte(cfg, p):
    """cor (linear) de uma parte sem textura: a da tabela do modelo (pelo nome do material) ou a do próprio material"""
    for chave, h in cfg.get('cores', []):
        if chave in p['nome']: return [round(s2l((h >> 16) & 255), 4), round(s2l((h >> 8) & 255), 4), round(s2l(h & 255), 4)]
    return [round(float(v), 4) for v in p['fator'][:3]]

def converter(mid, cfg):
    z, partes = ler_gltf(cfg['zip'])
    partes = [p for p in partes if p['nome'] not in cfg.get('tirar', [])]
    Pall = np.concatenate([p['P'] for p in partes]) * cfg['escala']
    for p in partes: p['P'] = p['P'] * cfg['escala']
    tri = sum(len(p['I']) for p in partes)
    # 'inteiro': materiais que não são simplificados (peça fina e comprida, como a luminária e os cabos do túnel, vira caco
    # solto quando junta vértices; elas são leves e entram inteiras, e o resto é simplificado para caber no alvo)
    dec = [p for p in partes if p['nome'] not in cfg.get('inteiro', [])]; fixos = tri - sum(len(p['I']) for p in dec)
    if tri > cfg['alvo'] and dec:   # procura a célula que dá perto do alvo (busca binária)
        dim = (Pall.max(0) - Pall.min(0)).max(); a, b = dim / 4000, dim / 60
        for p in dec: p['g'] = densidade_uv(p['P'], p['UV'], p['I']); p['carta'] = cartas(len(p['P']), p['I'])
        for _ in range(14):
            c = math.sqrt(a * b); ids, Pc = celulas(dec, c); t = fixos + sum(len(decimar(p['P'], p['UV'], p['I'], c, p['g'], p['carta'], q, Pc)[2]) for p, q in zip(dec, ids))
            if t > cfg['alvo']: a = c
            else: b = c
        ids, Pc = celulas(dec, b)
        for p, q in zip(dec, ids): p['P'], p['UV'], p['I'] = decimar(p['P'], p['UV'], p['I'], b, p['g'], p['carta'], q, Pc)
        Pall = np.concatenate([p['P'] for p in partes])
    lo, hi = Pall.min(0), Pall.max(0); cx, cz = (lo[0] + hi[0]) / 2, (lo[2] + hi[2]) / 2
    y0 = lo[1] if cfg['chao'] == 'min' else piso(partes, lo[1], hi[1]) if cfg['chao'] == 'piso' else cfg['chao']['y'] * cfg['escala'] if isinstance(cfg['chao'], dict) else np.percentile(Pall[:, 1], cfg['chao'])
    out = {'tam': [round(float(hi[0] - lo[0]), 2), round(float(hi[1] - y0), 2), round(float(hi[2] - lo[2]), 2)], 'partes': [], 'credito': cfg['credito']}
    tri2 = 0; bytes_ = 0
    for p in partes:
        P = p['P'] - np.array([cx, y0, cz]); N = normais(P, p['I'])
        b, uv0, uvS = codificar(P, p['UV'], N, p['I'])
        q = {'b': b, 'uv0': [round(float(v), 6) for v in uv0], 'uvS': [round(float(v), 6) for v in uvS]}
        if p['img']:   # com textura
            q['t'], ts = textura(z, p, cfg['tex']); q['rep'] = bool(uv0.min() < -0.01 or (uv0 + uvS).max() > 1.01)
        else: q['cor'] = cor_parte(cfg, p)   # sem textura: cor no vértice (e o detalhe do jogo por cima)
        if p['nome'] in cfg.get('emissivo', {}): q['e'] = cfg['emissivo'][p['nome']]   # brilho próprio (luminária acesa)
        out['partes'].append(q); tri2 += len(p['I']); bytes_ += len(b) + len(q.get('t', ''))
    out['col'] = colisao_lugar(out)
    print('%-18s %3d partes  %7d → %7d triângulos  tamanho %s m  %.1f MB  %d caixas de colisão' % (mid, len(partes), tri, tri2, out['tam'], bytes_ / 2**20, len(out['col'])), flush=True)
    return out

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; so_col = '--col' in sys.argv
    so = args or list(MODELOS)
    antigo = {}
    if os.path.exists(SAIDA) and (args or so_col):
        t = open(SAIDA, encoding='utf-8').read(); antigo = json.loads(t[t.index('const LUGX=') + 11:t.rindex(';')])
    for mid in so:
        if so_col:   # só refaz as caixas de colisão a partir do que já está convertido (rápido)
            if mid in antigo: antigo[mid]['col'] = colisao_lugar(antigo[mid]); print('%-18s %d caixas de colisão' % (mid, len(antigo[mid]['col'])), flush=True)
        else: antigo[mid] = converter(mid, MODELOS[mid])
    cab = ('/* ================= lugares escaneados (v10.1): galpão, bunker, prédios, casa, ruína e carro =================\n'
           '   Gerado por tools/lugares_banco.py a partir dos zips que o Himalaia baixou do Fab/Sketchfab. Créditos em LUGX[id].credito\n'
           '   (os CC BY pedem o nome do autor na tela de créditos). Não editar à mão. */\n')
    open(SAIDA, 'w', encoding='utf-8').write(cab + 'const LUGX=' + json.dumps(antigo, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('ok', os.path.getsize(SAIDA) // 2**20, 'MB em', SAIDA)
