#!/usr/bin/env python3
"""O zumbi do VAYDR antigo (o corpo "yaku" do Mixamo em jogo/src/21a_mixamo_dados.js, com os clipes do sobrevivente e o zLevantar)
para o projeto Godot, agora com as regiões do corpo (as cascas do jogo antigo, skSubconjuntos): além da malha inteira
(zumbi_malha), sai uma malha para cada região — troncoCurto, troncoLongo, pernas, pes, cabeca, cabecaAba, maos, cinto —, com a
mesma pele e os mesmos ossos. O jogo infla a região pela normal e pinta (a farda do policial, o colete, a calça, as botas, o
macacão do inchado...), como fazia o jogo antigo (42d_zumbis2.js: ZVISUAL).

Uso, da raiz do repositório:  python3 -I godot/tools/extrair_zumbi.py ."""
import base64, json, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extrair as X   # noqa: E402  (GLB, quatérnios, carregar)

RAIZ = sys.argv[1] if len(sys.argv) > 1 else '.'
SRC = os.path.join(RAIZ, 'jogo', 'src')
OUT = os.path.join(RAIZ, 'godot', 'assets', 'personagens')
OSSOS = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder',
         'RightArm', 'RightForeArm', 'RightHand', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase', 'RightUpLeg', 'RightLeg', 'RightFoot',
         'RightToeBase']
K = {n: i for i, n in enumerate(OSSOS)}
CLIPES = ('sFeridoParado', 'sFeridoAnda', 'sCorre', 'sDispara', 'sGolpe', 'zLevantar', 'sQueda', 'sParado', 'sAnda', 'sCaindo', 'sPega')


def regioes(P, J, W, I, Pr, hip):
    """as regiões do corpo (skSubconjuntos do jogo antigo): o osso de maior peso de cada vértice e a altura"""
    nv = P.shape[0]
    dom = J[np.arange(nv), np.argmax(W, axis=1)]
    Y = P[:, 1]
    neck, head, joelho = Pr[K['Neck'], 1], Pr[K['Head'], 1], Pr[K['LeftLeg'], 1]
    mL, mR = Pr[K['LeftHand']], Pr[K['RightHand']]
    dHand = np.minimum(np.linalg.norm(P - mL, axis=1), np.linalg.norm(P - mR, axis=1))
    em = lambda lst: np.isin(dom, [K[n] for n in lst])
    tronco = ['Spine', 'Spine1', 'Spine2', 'LeftShoulder', 'RightShoulder', 'LeftArm', 'RightArm']
    curto = em(tronco) | ((dom == K['Hips']) & (Y > hip + 0.04)) | ((dom == K['Neck']) & (Y < neck + 0.02))
    antebraco = em(['LeftForeArm', 'RightForeArm'])
    longo = curto | (antebraco & (dHand > 0.025)) | ((dom == K['Hips']) & (Y > hip - 0.14)) | (em(['LeftUpLeg', 'RightUpLeg']) & (Y > hip - 0.2))
    pernas = (em(['LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg']) & (Y > 0.1)) | ((dom == K['Hips']) & (Y <= hip + 0.06))
    pes = em(['LeftFoot', 'LeftToeBase', 'RightFoot', 'RightToeBase']) | (em(['LeftLeg', 'RightLeg']) & (Y < 0.34))
    cab = (dom == K['Head']) & (Y > head + 0.07)
    capmin = Y[cab].min() if cab.any() else 1e9
    T = I.reshape(-1, 3)

    def tris(m):
        ok = m[T[:, 0]] & m[T[:, 1]] & m[T[:, 2]]
        return T[ok].reshape(-1).astype(np.uint32)
    return {'troncoCurto': tris(curto), 'troncoLongo': tris(longo), 'pernas': tris(pernas), 'pes': tris(pes), 'cabeca': tris(cab),
            'cabecaAba': tris(cab & (Y < capmin + 0.04)), 'maos': tris(em(['LeftHand', 'RightHand']) | (antebraco & (dHand < 0.06))),
            'cinto': tris(em(['Hips', 'Spine', 'LeftUpLeg', 'RightUpLeg']) & (Y > hip) & (Y < hip + 0.085))}


def main():
    SKD = X.carregar('21a_mixamo_dados.js', 'const SKD')
    clipes = {}
    for fn in ('21a_mixamo_dados.js', '21j_sobrevivente_dados.js'):
        t = open(os.path.join(SRC, fn), encoding='utf-8').read()
        for marca in ('Object.assign(SKCLIP,', 'const SKCLIP='):
            i = t.find(marca)
            if i >= 0:
                clipes.update(json.JSONDecoder().raw_decode(t[i + len(marca):])[0])
    hip_akai = float(SKD['akai']['quadril'])
    d = SKD['yaku']
    g = X.GLB()
    nb = len(d['ossos'])
    pai = d['pai']
    tb = np.array(d['t'], np.float64).reshape(-1, 3)
    qb = np.array(d['qb'], np.float64).reshape(-1, 4)
    hip = float(d['quadril'])
    vb = base64.b64decode(d['vb'])
    nv = d['nv']
    A = np.frombuffer(vb, np.uint8).reshape(nv, 28)
    P = A[:, 0:12].copy().view('<f4').reshape(nv, 3)
    N = A[:, 12:15].copy().view('i1').astype(np.float32) / 127.0
    N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-6)
    U = A[:, 16:20].copy().view('<u2').astype(np.float32).reshape(nv, 2) / 65535.0
    J = A[:, 20:24].copy()
    W = A[:, 24:28].astype(np.float32)
    W /= np.maximum(W.sum(axis=1, keepdims=True), 1e-6)
    I = np.frombuffer(base64.b64decode(d['ib']), '<u4' if d['i32'] else '<u2').astype(np.uint32)
    Pr = np.zeros((nb, 3))
    for b in range(nb):
        p = pai[b]
        Pr[b] = (0, hip, 0) if p < 0 else Pr[p] + X.qrot(qb[p], tb[b])
    base_no = len(g.j['nodes'])
    for b in range(nb):
        p = pai[b]
        loc = qb[b] if p < 0 else X.qmul(X.qinv(qb[p]), qb[b])
        g.j['nodes'].append({'name': d['ossos'][b], 'translation': [float(x) for x in ((0, hip, 0) if p < 0 else tb[b])], 'rotation': [float(x) for x in X.qnorm(loc)]})
    for b in range(nb):
        filhos = [base_no + c for c in range(nb) if pai[c] == b]
        if filhos:
            g.j['nodes'][base_no + b]['children'] = filhos
    inv = np.zeros((nb, 16), np.float32)
    for b in range(nb):
        inv[b] = np.linalg.inv(X.qmat(qb[b], Pr[b])).T.reshape(16)
    ibm = g.acc(inv, 5126, 'MAT4')
    mat = g.material('pele', d['tex'], nrm=d.get('nrm'), rug=0.8, alfa=False)
    at = {'POSITION': g.acc(P.astype(np.float32), 5126, 'VEC3', 34962, mm=True), 'NORMAL': g.acc(N, 5126, 'VEC3', 34962),
          'TEXCOORD_0': g.acc(U, 5126, 'VEC2', 34962), 'JOINTS_0': g.acc(J, 5121, 'VEC4', 34962), 'WEIGHTS_0': g.acc(W.astype(np.float32), 5126, 'VEC4', 34962)}
    g.j['meshes'].append({'name': 'zumbi', 'primitives': [{'attributes': at, 'indices': g.acc(I, 5125, 'SCALAR', 34963), 'material': mat}]})
    g.j['skins'] = [{'inverseBindMatrices': ibm, 'joints': list(range(base_no, base_no + nb)), 'skeleton': base_no}]
    nos = [base_no]
    g.j['nodes'].append({'name': 'zumbi_malha', 'mesh': 0, 'skin': 0})
    nos.append(len(g.j['nodes']) - 1)
    # as regiões: a mesma malha (os mesmos vértices), só os triângulos da região
    R = regioes(P, J, W, I, Pr, hip)
    for nome, tri in R.items():
        if tri.size == 0:
            print('  região vazia:', nome)
            continue
        g.j['meshes'].append({'name': 'casca_' + nome, 'primitives': [{'attributes': at, 'indices': g.acc(tri, 5125, 'SCALAR', 34963), 'material': mat}]})
        g.j['nodes'].append({'name': 'casca_' + nome, 'mesh': len(g.j['meshes']) - 1, 'skin': 0})
        nos.append(len(g.j['nodes']) - 1)
        print('  casca_%s: %d triângulos' % (nome, tri.size // 3))
    g.j['nodes'].append({'name': 'zumbi', 'children': nos})
    g.j['scenes'][0]['nodes'] = [len(g.j['nodes']) - 1]
    k = hip / hip_akai
    anims = []
    for nome in CLIPES:
        if nome not in clipes:
            print('  sem o clipe', nome)
            continue
        c = clipes[nome]
        n = c['n']
        D = np.frombuffer(base64.b64decode(c['d']), '<i2').astype(np.float64).reshape(n, nb, 4) / 32767.0
        H = np.frombuffer(base64.b64decode(c['h']), '<f4').astype(np.float64).reshape(n, 3)
        tempos = (np.arange(n, dtype=np.float32) / float(c['fps'])).astype(np.float32)
        tacc = g.acc(tempos.reshape(-1, 1), 5126, 'SCALAR', mm=True)
        canais, amostras = [], []
        Q = np.zeros((n, nb, 4))
        for f in range(n):
            for b in range(nb):
                Q[f, b] = X.qnorm(X.qmul(X.qnorm(D[f, b]), qb[b]))
        for b in range(nb):
            p = pai[b]
            loc = np.array([Q[f, b] if p < 0 else X.qnorm(X.qmul(X.qinv(Q[f, p]), Q[f, b])) for f in range(n)])
            for f in range(1, n):
                if np.dot(loc[f], loc[f - 1]) < 0:
                    loc[f] = -loc[f]
            amostras.append({'input': tacc, 'output': g.acc(loc.astype(np.float32), 5126, 'VEC4'), 'interpolation': 'LINEAR'})
            canais.append({'sampler': len(amostras) - 1, 'target': {'node': base_no + b, 'path': 'rotation'}})
        tr = np.zeros((n, 3), np.float32)
        tr[:, 1] = hip + H[:, 1] * k
        amostras.append({'input': tacc, 'output': g.acc(tr, 5126, 'VEC3'), 'interpolation': 'LINEAR'})
        canais.append({'sampler': len(amostras) - 1, 'target': {'node': base_no, 'path': 'translation'}})
        anims.append({'name': nome, 'samplers': amostras, 'channels': canais})
    g.j['animations'] = anims
    g.salvar(os.path.join(OUT, 'zumbi.glb'))
    print('zumbi.glb: %d clipes, %d regiões' % (len(anims), len(R)))


if __name__ == '__main__':
    main()
