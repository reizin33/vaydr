#!/usr/bin/env python3
"""O personagem do jogador, tirado do VAYDR antigo (jogo/src/21m_mh_dados.js, 21j_sobrevivente_dados.js, 21a_mixamo_dados.js e
21l_braco_dados.js), para o projeto Godot:

- assets/personagens/mh/mh_homem.glb e mh_mulher.glb: o corpo do MakeHuman (CC0) com o esqueleto de 22 ossos do Mixamo (pose de
  repouso, sem animação: as animações vão no clipes.bin), já em pedaços:
    corpo_N   o corpo, separado pelas roupas 3D que cobrem cada pedaço (o pedaço some com elas vestidas, como no jogo antigo,
              que tirava os triângulos escondidos pela roupa);
    peca_ID   olhos, cílios, sobrancelhas, cabelos e barbas (recortados pela transparência da textura);
    roupa_ID  as roupas 3D (camiseta, camisas, colete, casacos, calças, bermuda e botas: partes das roupas prontas do MakeHuman);
    casca_ID  as regiões do corpo para as roupas justas (gorro, boné, luvas, cinto, máscara...): o jogo infla pela normal e pinta;
- assets/personagens/mh/pele_ID.jpg, olho_ID.png e roupa_G_ID.jpg (a luz do tecido tingida na cor da peça, como o jogo antigo);
- assets/personagens/braco_direito.glb e braco_feminino.glb: o braço da primeira pessoa (mão fechada em volta do cabo), com a
  textura e a máscara (onde é mão e onde fica cada ponto do pulso ao cotovelo) para a manga e a luva;
- dados/personagem/mh.json: nomes, categorias, miniaturas (webp em base64), os pedaços do corpo e o que cobre cada um, os ossos
  (pai, deslocamento, rotação de repouso e o alinhamento com as poses do jogo) e os clipes;
- dados/personagem/clipes.bin: os clipes do sobrevivente (deltas D de cada osso em float32 e o quadril), como no jogo antigo.

Uso, da raiz do repositório:  python3 -I godot/tools/extrair_mh.py ."""
import base64, io, json, math, os, struct, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extrair as X   # noqa: E402  (GLB, malha_b, quatérnios)

RAIZ = sys.argv[1] if len(sys.argv) > 1 else '.'
SRC = os.path.join(RAIZ, 'jogo', 'src')
OUT = os.path.join(RAIZ, 'godot', 'assets', 'personagens')
DADOS = os.path.join(RAIZ, 'godot', 'dados', 'personagem')
OSSOS = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder',
         'RightArm', 'RightForeArm', 'RightHand', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase', 'RightUpLeg', 'RightLeg', 'RightFoot',
         'RightToeBase']
K = {n: i for i, n in enumerate(OSSOS)}
CLIPES = ['sParado', 'sRespira', 'sAnda', 'sAndaTras', 'sLadoE', 'sLadoD', 'sCorre', 'sDispara', 'sAgachado', 'sAgachadoAnda',
          'sFeridoParado', 'sFeridoAnda', 'sPulo', 'sCaindo', 'sQueda', 'sPega', 'sBebe', 'sGolpe', 'rolar']


def json_de(fn, marca):
    t = open(os.path.join(SRC, fn), encoding='utf-8').read()
    i = t.index(marca) + len(marca)
    i = t.index('{', i)
    return json.JSONDecoder().raw_decode(t[i:])[0]


def bytes_url(u):
    return base64.b64decode(u.split(',', 1)[1])


def b64_url(u):
    return u.split(',', 1)[1]


def png_de(u):
    im = Image.open(io.BytesIO(bytes_url(u)))
    b = io.BytesIO()
    im.convert('RGBA').save(b, 'PNG', optimize=True)
    return b.getvalue()


def gravar_imagem(u, caminho_sem_ext):
    """grava a imagem do jeito que veio (webp, jpg ou png): o Godot importa os três"""
    mime = u[5:u.index(';')]
    ext = {'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png'}[mime]
    open(caminho_sem_ext + '.' + ext, 'wb').write(bytes_url(u))
    return os.path.basename(caminho_sem_ext) + '.' + ext


def vb_28(vb_b64, nv):
    """28 bytes por vértice: posição f32x3, normal i8x3 + 1, uv u16x2, ossos u8x4, pesos u8x4"""
    A = np.frombuffer(base64.b64decode(vb_b64), np.uint8).reshape(nv, 28)
    P = A[:, 0:12].copy().view('<f4').reshape(nv, 3).astype(np.float32)
    N = A[:, 12:15].copy().view('i1').astype(np.float32) / 127.0
    N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-6)
    U = (A[:, 16:20].copy().view('<u2').astype(np.float32).reshape(nv, 2) / 65535.0).astype(np.float32)
    J = A[:, 20:24].copy()
    W = A[:, 24:28].astype(np.float32)
    W /= np.maximum(W.sum(axis=1, keepdims=True), 1e-6)
    return P, N.astype(np.float32), U, J, W.astype(np.float32)


def indices(ib_b64, i32):
    return np.frombuffer(base64.b64decode(ib_b64), '<u4' if i32 else '<u2').astype(np.uint32)


def compactar(P, N, U, J, W, tris):
    """só os vértices que os triângulos usam (cada pedaço do corpo fica com a própria lista)"""
    usados, novo = np.unique(tris, return_inverse=True)
    return P[usados], N[usados], U[usados], J[usados], W[usados], novo.astype(np.uint32)


class Corpo(X.GLB):
    """o GLB de um corpo: os ossos na pose de repouso e as malhas com pele"""

    def __init__(s, c):
        super().__init__()
        s.c = c
        nb = len(OSSOS)
        s.pai = c['pai']
        s.tb = np.array(c['t'], np.float64).reshape(-1, 3)
        s.qb = np.array(c['qb'], np.float64).reshape(-1, 4)
        s.hip = float(c['quadril'])
        s.Pr = np.zeros((nb, 3))
        for b in range(nb):
            p = s.pai[b]
            s.Pr[b] = (0, s.hip, 0) if p < 0 else s.Pr[p] + X.qrot(s.qb[p], s.tb[b])
        s.base_no = 0
        for b in range(nb):
            p = s.pai[b]
            loc = s.qb[b] if p < 0 else X.qmul(X.qinv(s.qb[p]), s.qb[b])
            s.j['nodes'].append({'name': OSSOS[b], 'translation': [float(x) for x in ((0, s.hip, 0) if p < 0 else s.tb[b])],
                                 'rotation': [float(x) for x in X.qnorm(loc)]})
        for b in range(nb):
            filhos = [c2 for c2 in range(nb) if s.pai[c2] == b]
            if filhos:
                s.j['nodes'][b]['children'] = filhos
        inv = np.zeros((nb, 16), np.float32)
        for b in range(nb):
            inv[b] = np.linalg.inv(X.qmat(s.qb[b], s.Pr[b])).T.reshape(16)
        s.j['skins'] = [{'inverseBindMatrices': s.acc(inv, 5126, 'MAT4'), 'joints': list(range(nb)), 'skeleton': 0}]
        s.malhas = []
        s.mats = {}

    def mat(s, nome, png=None, alfa=False, dupla=False, rug=0.85, cor=None):
        if nome in s.mats:
            return s.mats[nome]
        m = {'name': nome, 'pbrMetallicRoughness': {'metallicFactor': 0.0, 'roughnessFactor': rug}}
        if png is not None:
            s.j['images'].append({'bufferView': s.view(png), 'mimeType': 'image/png'})
            s.j['textures'].append({'sampler': 0, 'source': len(s.j['images']) - 1})
            m['pbrMetallicRoughness']['baseColorTexture'] = {'index': len(s.j['textures']) - 1}
        if cor:
            m['pbrMetallicRoughness']['baseColorFactor'] = cor
        if alfa:
            m['alphaMode'] = 'MASK'
            m['alphaCutoff'] = 0.4
        if dupla or alfa:
            m['doubleSided'] = True
        s.j['materials'].append(m)
        s.mats[nome] = len(s.j['materials']) - 1
        return s.mats[nome]

    def com_pele(s, nome, P, N, U, J, W, I, mat):
        at = {'POSITION': s.acc(P, 5126, 'VEC3', 34962, mm=True), 'NORMAL': s.acc(N, 5126, 'VEC3', 34962),
              'TEXCOORD_0': s.acc(U, 5126, 'VEC2', 34962), 'JOINTS_0': s.acc(J, 5121, 'VEC4', 34962), 'WEIGHTS_0': s.acc(W, 5126, 'VEC4', 34962)}
        s.j['meshes'].append({'name': nome, 'primitives': [{'attributes': at, 'indices': s.acc(I.astype(np.uint32), 5125, 'SCALAR', 34963), 'material': mat}]})
        s.j['nodes'].append({'name': nome, 'mesh': len(s.j['meshes']) - 1, 'skin': 0})
        s.malhas.append(len(s.j['nodes']) - 1)

    def fechar(s, nome, caminho):
        s.j['nodes'].append({'name': nome, 'children': [0] + s.malhas})
        s.j['scenes'][0]['nodes'] = [len(s.j['nodes']) - 1]
        s.salvar(caminho)


def subconjuntos(c, P, J, W, I, tb, qb, hip):
    """as regiões do corpo do jogo antigo (skSubconjuntos, 21b_mixamo.js): o osso de maior peso de cada vértice e a altura"""
    nv = P.shape[0]
    dom = J[np.arange(nv), np.argmax(W, axis=1)]
    X0, Y, Z = P[:, 0], P[:, 1], P[:, 2]
    pai = c['pai']
    pb = np.zeros((22, 3))
    pb[0] = tb[0]
    for b in range(1, 22):
        pb[b] = pb[pai[b]] + X.qrot(qb[pai[b]], tb[b])
    neck, head, joelho = pb[K['Neck'], 1], pb[K['Head'], 1], pb[K['LeftLeg'], 1]
    mA = c['maoA']
    mL, mR = np.array(mA[0:3]), np.array(mA[3:6])
    dHand = np.minimum(np.linalg.norm(P - mL, axis=1), np.linalg.norm(P - mR, axis=1))
    em = lambda lst: np.isin(dom, [K[n] for n in lst])
    tronco = ['Spine', 'Spine1', 'Spine2', 'LeftShoulder', 'RightShoulder', 'LeftArm', 'RightArm']
    curto = em(tronco) | ((dom == K['Hips']) & (Y > hip + 0.04)) | ((dom == K['Neck']) & (Y < neck + 0.02))
    antebraco = em(['LeftForeArm', 'RightForeArm'])
    longo = curto | (antebraco & (dHand > 0.025)) | ((dom == K['Hips']) & (Y > hip - 0.14)) | (em(['LeftUpLeg', 'RightUpLeg']) & (Y > hip - 0.2))
    pernas = (em(['LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg']) & (Y > 0.1)) | ((dom == K['Hips']) & (Y <= hip + 0.06))
    pes = em(['LeftFoot', 'LeftToeBase', 'RightFoot', 'RightToeBase']) | (em(['LeftLeg', 'RightLeg']) & (Y < 0.34))
    cab = (dom == K['Head']) & (Y > head + 0.07)
    hem = Y[longo].min() if longo.any() else 1e9
    capmin = Y[cab].min() if cab.any() else 1e9
    T = I.reshape(-1, 3)

    def tris(m):
        ok = m[T[:, 0]] & m[T[:, 1]] & m[T[:, 2]]
        return T[ok].reshape(-1)
    return {'troncoCurto': tris(curto), 'gola': tris(curto & (Y > neck - 0.06)), 'troncoLongo': tris(longo),
            'golaLonga': tris(longo & ((Y > neck - 0.07) | (Y < hem + 0.06) | (antebraco & (dHand < 0.09)))),
            'pernas': tris(pernas), 'pes': tris(pes), 'cabeca': tris(cab), 'cabecaAba': tris(cab & (Y < capmin + 0.04)),
            'rosto': tris(((dom == K['Head']) | (dom == K['Neck'])) & (Y > neck - 0.005) & (Y < head + 0.055)),
            'maos': tris(em(['LeftHand', 'RightHand']) | (antebraco & (dHand < 0.06))),
            'pernasCurtas': tris((em(['LeftUpLeg', 'RightUpLeg']) & (Y > joelho + 0.1)) | ((dom == K['Hips']) & (Y <= hip + 0.06))),
            'cinto': tris(em(['Hips', 'Spine', 'LeftUpLeg', 'RightUpLeg']) & (Y > hip) & (Y < hip + 0.085)),
            'mangaLonga': tris(curto | (antebraco & (dHand > 0.03)))}


def tingir(src_url, cor):
    """a luz do tecido (cinza) vezes a cor da peça (mhTexRoupa do jogo antigo: canal vermelho * 1,45)"""
    im = Image.open(io.BytesIO(bytes_url(src_url))).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    f = a[:, :, 0] * (1.45 / 255.0)
    rgb = np.array([(cor >> 16) & 255, (cor >> 8) & 255, cor & 255], np.float32)
    o = np.clip(f[:, :, None] * rgb[None, None, :], 0, 255).astype(np.uint8)
    b = io.BytesIO()
    Image.fromarray(o, 'RGB').save(b, 'JPEG', quality=90)
    return b.getvalue()


def alinhamento(c):
    """t.A do jogo antigo (skTipo): leva a pose de repouso (T) para a do jogo (braços caídos, pernas retas)"""
    pai = c['pai']
    tb = np.array(c['t'], np.float64).reshape(-1, 3)
    qb = np.array(c['qb'], np.float64).reshape(-1, 4)
    pb = np.zeros((22, 3))
    pb[0] = tb[0]
    for b in range(1, 22):
        pb[b] = pb[pai[b]] + X.qrot(qb[pai[b]], tb[b])

    def de_para(a, b):
        a = a / max(1e-9, np.linalg.norm(a))
        d = float(np.dot(a, b))
        x, y, z = a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]
        w = 1 + d
        if w < 1e-6:
            x, y, z, w = 0, 0, 1, 0
        q = np.array([x, y, z, w])
        return q / np.linalg.norm(q)
    A = np.tile(np.array([0, 0, 0, 1.0]), (22, 1))
    baixo = np.array([0, -1.0, 0])
    for lst, a, b in ((['LeftArm', 'LeftForeArm', 'LeftHand'], 'LeftArm', 'LeftForeArm'), (['RightArm', 'RightForeArm', 'RightHand'], 'RightArm', 'RightForeArm'),
                      (['LeftUpLeg', 'LeftLeg'], 'LeftUpLeg', 'LeftLeg'), (['RightUpLeg', 'RightLeg'], 'RightUpLeg', 'RightLeg')):
        q = de_para(pb[K[b]] - pb[K[a]], baixo)
        for n in lst:
            A[K[n]] = q
    return A


def main():
    os.makedirs(os.path.join(OUT, 'mh'), exist_ok=True)
    os.makedirs(DADOS, exist_ok=True)
    M = json_de('21m_mh_dados.js', 'const MHP')
    pecas = M['pecas']
    meta = {'corpos': {}, 'pecas': {}, 'peles': {}, 'olhos': {}, 'clipes': {}}
    # ---------------- peles, olhos e miniaturas ----------------
    for k, v in M['peles'].items():
        open(os.path.join(OUT, 'mh', 'pele_%s.jpg' % k), 'wb').write(bytes_url(v['tex']))
        meta['peles'][k] = {'nome': v['nome'], 'corpo': v['corpo'], 'mini': b64_url(v['mini']), 'media': v.get('media', 0)}
    for k, v in M['olhos'].items():
        arq = gravar_imagem(v['tex'], os.path.join(OUT, 'mh', 'olho_%s' % k))
        meta['olhos'][k] = {'nome': v['nome'], 'mini': b64_url(v['mini']), 'tex': arq}
    # ---------------- os dois corpos ----------------
    BASE3D = {}   # roupa -> a peça que tem a forma dela (as da mesma forma só mudam a cor)
    for k, p in pecas.items():
        if p.get('cat') != 'roupa':
            continue
        for g in ('homem', 'mulher'):
            if g in p:
                BASE3D[(k, g)] = p[g].get('mesmo') or k
    for g in ('homem', 'mulher'):
        c = M['corpos'][g]
        print('corpo', g)
        P, N, U, J, W = vb_28(c['vb'], c['nv'])
        I = indices(c['ib'], c['i32'])
        nt = I.shape[0] // 3
        gl = Corpo(c)
        mat_pele = gl.mat('pele', rug=0.62)
        # o que cada roupa 3D esconde do corpo (um bit por triângulo)
        bases = sorted({BASE3D[(k, g)] for (k, gg) in BASE3D if gg == g})
        cobre = np.zeros(nt, np.int64)
        for bi, b in enumerate(bases):
            oc = pecas[b][g].get('oculta')
            if not oc:
                continue
            bits = np.unpackbits(np.frombuffer(base64.b64decode(oc), np.uint8), bitorder='little')[:nt].astype(np.int64)
            cobre |= bits << bi
        grupos = []
        T = I.reshape(-1, 3)
        for chave in sorted(set(cobre.tolist())):
            sel = T[cobre == chave].reshape(-1)
            Pg, Ng, Ug, Jg, Wg, Ig = compactar(P, N, U, J, W, sel)
            nome = 'corpo_%d' % len(grupos)
            gl.com_pele(nome, Pg, Ng, Ug, Jg, Wg, Ig, mat_pele)
            grupos.append({'no': nome, 'cobre': [bases[i] for i in range(len(bases)) if chave >> i & 1], 'tris': int(sel.shape[0] // 3)})
        print('  %d pedaços do corpo (%s)' % (len(grupos), ', '.join('%d:%s' % (x['tris'], '+'.join(x['cobre']) or '-') for x in grupos)))
        # regiões para as cascas
        tb = np.array(c['t'], np.float64).reshape(-1, 3)
        qb = np.array(c['qb'], np.float64).reshape(-1, 4)
        S = subconjuntos(c, P, J, W, I, tb, qb, float(c['quadril']))
        mat_casca = gl.mat('casca', rug=0.9, cor=[0.5, 0.45, 0.4, 1.0])
        for nome_s, sel in S.items():
            if sel.shape[0] == 0:
                continue
            Pg, Ng, Ug, Jg, Wg, Ig = compactar(P, N, U, J, W, sel)
            gl.com_pele('casca_' + nome_s, Pg, Ng, Ug, Jg, Wg, Ig, mat_casca)
        # peças (olhos, cílios, sobrancelhas, cabelos, barbas) e roupas 3D
        for k, p in pecas.items():
            if g not in p:
                continue
            d = p[g]
            cat = p.get('cat')
            if cat == 'roupa':
                if d.get('mesmo'):
                    continue
                Pp, Np, Up, Jp, Wp = vb_28(d['vb'], d['nv'])
                Ip = indices(d['ib'], d['i32'])
                gl.com_pele('roupa_' + k, Pp, Np, Up, Jp, Wp, Ip, gl.mat('roupa', rug=0.9))
                continue
            Pp, Np, Up, Jp, Wp = vb_28(d['vb'], d['nv'])
            Ip = indices(d['ib'], d['i32'])
            if k == 'olhos':
                m = gl.mat('olhos', alfa=True, rug=0.25)
            else:
                m = gl.mat('peca_' + k, alfa=bool(p.get('alfa')), rug=0.7 if cat in ('cabelo', 'barba') else 0.8)
            gl.com_pele('peca_' + k, Pp, Np, Up, Jp, Wp, Ip, m)
        gl.fechar('mh_' + g, os.path.join(OUT, 'mh', 'mh_%s.glb' % g))
        A = alinhamento(c)
        meta['corpos'][g] = {'altura': c['altura'], 'quadril': c['quadril'], 'maoA': c['maoA'], 'pai': c['pai'],
                             't': [round(float(x), 6) for x in c['t']], 'qb': [round(float(x), 7) for x in c['qb']],
                             'A': [round(float(x), 7) for x in A.reshape(-1)], 'grupos': grupos}
        # roupas tingidas
        for (k, gg), b in BASE3D.items():
            if gg != g:
                continue
            e = pecas[k][g]
            src = e.get('texf') and M['roupasTex'].get(e['texf'])
            if src:
                open(os.path.join(OUT, 'mh', 'roupa_%s_%s.jpg' % (g, k)), 'wb').write(tingir(src, int(pecas[k].get('cor', 0x808080))))
    for k, p in pecas.items():
        meta['pecas'][k] = {'nome': p.get('nome'), 'cat': p.get('cat'), 'corpos': [g for g in ('homem', 'mulher') if g in p],
                            'mini': b64_url(p['mini']) if p.get('mini') else '', 'alfa': bool(p.get('alfa'))}
        if p.get('tex'):
            meta['pecas'][k]['tex'] = gravar_imagem(p['tex'], os.path.join(OUT, 'mh', 'peca_%s' % k))
        if p.get('cat') == 'roupa':
            meta['pecas'][k]['cor'] = p.get('cor', 0)
            meta['pecas'][k]['forma'] = {g: BASE3D[(k, g)] for g in ('homem', 'mulher') if (k, g) in BASE3D}
    # ---------------- clipes (do sobrevivente) ----------------
    clipes = {}
    for fn in ('21a_mixamo_dados.js', '21j_sobrevivente_dados.js'):
        t = open(os.path.join(SRC, fn), encoding='utf-8').read()
        for marca in ('Object.assign(SKCLIP,', 'const SKCLIP='):
            i = t.find(marca)
            while i >= 0:
                clipes.update(json.JSONDecoder().raw_decode(t[t.index('{', i):])[0])
                i = t.find(marca, i + len(marca))
    SKD_akai = json_de('21a_mixamo_dados.js', 'const SKD')['akai']
    meta['quadril_akai'] = SKD_akai['quadril']
    blob = bytearray()
    for nome in CLIPES:
        c = clipes[nome]
        n = int(c['n'])
        D = np.frombuffer(base64.b64decode(c['d']), '<i2').astype(np.float32).reshape(n, 22, 4) / 32767.0
        H = np.frombuffer(base64.b64decode(c['h']), '<f4').astype(np.float32).reshape(n, 3)
        while len(blob) % 4:
            blob.append(0)
        od = len(blob)
        blob += D.astype('<f4').tobytes()
        oh = len(blob)
        blob += H.astype('<f4').tobytes()
        meta['clipes'][nome] = {'n': n, 'fps': c['fps'], 'dur': c['dur'], 'vel': c.get('vel'), 'd': od, 'h': oh}
    open(os.path.join(DADOS, 'clipes.bin'), 'wb').write(bytes(blob))
    print('clipes: %d (%.0f KB)' % (len(CLIPES), len(blob) / 1024))
    # ---------------- braço da primeira pessoa ----------------
    B = json_de('21l_braco_dados.js', 'const BRACO3D')
    meta['braco'] = {}
    for k, d in B.items():
        Pb, Ub, Nb, Ib = X.malha_b(d)
        g = X.GLB()
        mt = g.material('braco_' + k, None, rug=0.7)
        g.malha('braco_' + k, [g.primitiva(Pb, Ub, Nb, Ib, mt)])
        g.salvar(os.path.join(OUT, 'braco_%s.glb' % k))
        mk = gravar_imagem(d['m'], os.path.join(OUT, 'mh', 'braco_%s_mascara' % k))
        pl = gravar_imagem(d['t'], os.path.join(OUT, 'mh', 'braco_%s_pele' % k))
        # o centro do pulso (onde o antebraço dobra): a média dos vértices na altura do pulso (brfPrepDobra)
        yp = float(d.get('pulso', 0.112))
        sel = np.abs(Pb[:, 1] - yp) < 0.006
        piv = [float(Pb[sel, 0].mean()) if sel.any() else 0.0, yp, float(Pb[sel, 2].mean()) if sel.any() else 0.0]
        meta['braco'][k] = {'pulso': yp, 'piv': [round(x, 5) for x in piv], 'media': d.get('media', 0), 'mascara': mk, 'pele': pl}
    meta['pele_ref'] = M.get('pele_ref', 0)
    js = json.dumps(meta, ensure_ascii=False, separators=(',', ':'))
    open(os.path.join(DADOS, 'mh.json'), 'w', encoding='utf-8').write(js)
    print('mh.json: %.0f KB' % (len(js) / 1024))


if __name__ == '__main__':
    main()
