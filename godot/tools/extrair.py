#!/usr/bin/env python3
"""Extrai para o projeto Godot (godot/assets) os modelos e as texturas que já estão dentro do VAYDR antigo (jogo/src/21*_dados.js):
texturas do chão (Poly Haven, CC0), árvores, plantas, pedras e troncos (Poly Haven, CC0), ferramentas (Poly Haven, CC0), o baú
(Poly Haven, CC0), o capim (Poly Haven, CC0) e os personagens com esqueleto e animações (Mixamo: o zumbi e o sobrevivente).
Os modelos saem em GLB (glTF binário) e as imagens em JPG (sem transparência) ou PNG (com transparência).
Uso, da raiz do repositório:  python3 -I godot/tools/extrair.py ."""
import base64, io, json, math, os, struct, sys
import numpy as np
from PIL import Image

RAIZ = sys.argv[1] if len(sys.argv) > 1 else '.'
SRC = os.path.join(RAIZ, 'jogo', 'src')
OUT = os.path.join(RAIZ, 'godot', 'assets')


def carregar(fn, var):
    s = open(os.path.join(SRC, fn), encoding='utf-8').read()
    i = s.index(var) + len(var)
    while s[i] in ' =\n':
        i += 1
    obj, _ = json.JSONDecoder().raw_decode(s[i:])
    return obj


def imagem(url):
    """data URL -> (bytes, mime, tem_alfa)"""
    raw = base64.b64decode(url.split(',', 1)[1])
    im = Image.open(io.BytesIO(raw))
    alfa = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    if alfa:
        im = im.convert('RGBA')
        if im.getextrema()[3][0] >= 250:
            alfa = False
    b = io.BytesIO()
    if alfa:
        im.save(b, 'PNG', optimize=True)
        return b.getvalue(), 'image/png', True
    im.convert('RGB').save(b, 'JPEG', quality=90)
    return b.getvalue(), 'image/jpeg', False


def malha_b(d):
    """o formato das malhas do jogo antigo: nv, nt, caixa; posições u16, uv u16, índices u16/u32 e normais i8"""
    raw = base64.b64decode(d['b'])
    nv, nt = struct.unpack_from('<II', raw, 0)
    lo = np.array(struct.unpack_from('<3f', raw, 8), np.float32)
    hi = np.array(struct.unpack_from('<3f', raw, 20), np.float32)
    o = 32
    P = np.frombuffer(raw, '<u2', nv * 3, o).astype(np.float32).reshape(-1, 3) / 65535.0
    P = lo + (hi - lo) * P
    o += nv * 6
    U = np.frombuffer(raw, '<u2', nv * 2, o).astype(np.float32).reshape(-1, 2) / 65535.0
    U = np.array(d.get('uv0', [0, 0]), np.float32) + np.array(d.get('uvS', [1, 1]), np.float32) * U
    o += nv * 4
    i32 = nv > 65535
    I = np.frombuffer(raw, '<u4' if i32 else '<u2', nt * 3, o).astype(np.uint32)
    o += nt * 3 * (4 if i32 else 2)
    N = np.frombuffer(raw, 'i1', nv * 3, o).astype(np.float32).reshape(-1, 3) / 127.0
    N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-6)
    return P.astype(np.float32), U.astype(np.float32), N.astype(np.float32), I


class GLB:
    def __init__(s):
        s.bin = bytearray()
        s.j = {'asset': {'version': '2.0', 'generator': 'VAYDR godot/tools/extrair.py'}, 'buffers': [], 'bufferViews': [], 'accessors': [],
               'meshes': [], 'nodes': [], 'scenes': [{'nodes': []}], 'scene': 0, 'materials': [], 'images': [], 'textures': [],
               'samplers': [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}]}
        s.texs = {}

    def view(s, data, target=None):
        while len(s.bin) % 4:
            s.bin.append(0)
        v = {'buffer': 0, 'byteOffset': len(s.bin), 'byteLength': len(data)}
        s.bin += data
        if target:
            v['target'] = target
        s.j['bufferViews'].append(v)
        return len(s.j['bufferViews']) - 1

    def acc(s, arr, ctype, typ, target=None, norm=False, mm=False):
        a = {'bufferView': s.view(np.ascontiguousarray(arr).tobytes(), target), 'componentType': ctype, 'count': int(arr.shape[0]), 'type': typ}
        if norm:
            a['normalized'] = True
        if mm:
            a['min'] = [float(x) for x in arr.min(axis=0)]
            a['max'] = [float(x) for x in arr.max(axis=0)]
        s.j['accessors'].append(a)
        return len(s.j['accessors']) - 1

    def textura(s, url):
        if url in s.texs:
            return s.texs[url]
        data, mime, alfa = imagem(url)
        s.j['images'].append({'bufferView': s.view(data), 'mimeType': mime})
        s.j['textures'].append({'sampler': 0, 'source': len(s.j['images']) - 1})
        s.texs[url] = (len(s.j['textures']) - 1, alfa)
        return s.texs[url]

    def material(s, nome, url=None, nrm=None, rug=0.9, alfa=None, dupla=False, cor=None):
        m = {'name': nome, 'pbrMetallicRoughness': {'metallicFactor': 0.0, 'roughnessFactor': rug}}
        tem_alfa = False
        if url:
            ti, tem_alfa = s.textura(url)
            m['pbrMetallicRoughness']['baseColorTexture'] = {'index': ti}
        if cor:
            m['pbrMetallicRoughness']['baseColorFactor'] = cor
        if nrm:
            m['normalTexture'] = {'index': s.textura(nrm)[0]}
        if alfa or (alfa is None and tem_alfa):
            m['alphaMode'] = 'MASK'
            m['alphaCutoff'] = 0.45
            m['doubleSided'] = True
        if dupla:
            m['doubleSided'] = True
        s.j['materials'].append(m)
        return len(s.j['materials']) - 1

    def primitiva(s, P, U, N, I, mat):
        at = {'POSITION': s.acc(P, 5126, 'VEC3', 34962, mm=True), 'NORMAL': s.acc(N, 5126, 'VEC3', 34962), 'TEXCOORD_0': s.acc(U, 5126, 'VEC2', 34962)}
        idx = s.acc(I.astype(np.uint32), 5125, 'SCALAR', 34963)
        return {'attributes': at, 'indices': idx, 'material': mat}

    def malha(s, nome, prims):
        s.j['meshes'].append({'name': nome, 'primitives': prims})
        s.j['nodes'].append({'name': nome, 'mesh': len(s.j['meshes']) - 1})
        s.j['scenes'][0]['nodes'].append(len(s.j['nodes']) - 1)
        return len(s.j['nodes']) - 1

    def salvar(s, caminho):
        s.j['buffers'] = [{'byteLength': len(s.bin)}]
        for k in ('images', 'textures', 'materials'):
            if not s.j[k]:
                del s.j[k]
        if 'textures' not in s.j:
            s.j.pop('samplers', None)
        js = json.dumps(s.j, separators=(',', ':')).encode()
        js += b' ' * ((4 - len(js) % 4) % 4)
        bn = bytes(s.bin) + b'\0' * ((4 - len(s.bin) % 4) % 4)
        os.makedirs(os.path.dirname(caminho), exist_ok=True)
        with open(caminho, 'wb') as f:
            f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bn)))
            f.write(struct.pack('<II', len(js), 0x4E4F534A) + js)
            f.write(struct.pack('<II', len(bn), 0x004E4942) + bn)
        print('  %-44s %7.0f KB' % (os.path.relpath(caminho, OUT), os.path.getsize(caminho) / 1024))


def modelo_partes(nome, partes, tex, caminho, folhas_alfa=True):
    """partes: lista de (dados b, nome do material)"""
    g = GLB()
    mats = {}
    prims = []
    for d, mn in partes:
        url = tex.get(mn) if tex else None
        if url is None and tex:
            url = next(iter(tex.values()))
        if mn not in mats:
            folha = 'folha' in mn or 'leave' in mn or 'leaf' in mn
            mats[mn] = g.material(mn, url, rug=0.85 if folha else 0.92, alfa=True if folha and folhas_alfa else None)
        P, U, N, I = malha_b(d)
        prims.append(g.primitiva(P, U, N, I, mats[mn]))
    g.malha(nome, prims)
    g.salvar(caminho)


# ---------------- quatérnios (x, y, z, w) ----------------
def qmul(a, b):
    ax, ay, az, aw = a
    bx, by, bz, bw = b
    return np.array([aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx,
                     aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz])


def qinv(q):
    return np.array([-q[0], -q[1], -q[2], q[3]]) / max(1e-12, float(np.dot(q, q)))


def qnorm(q):
    return q / max(1e-12, float(np.linalg.norm(q)))


def qrot(q, v):
    x, y, z = v
    qx, qy, qz, qw = q
    tx, ty, tz = 2 * (qy * z - qz * y), 2 * (qz * x - qx * z), 2 * (qx * y - qy * x)
    return np.array([x + qw * tx + qy * tz - qz * ty, y + qw * ty + qz * tx - qx * tz, z + qw * tz + qx * ty - qy * tx])


def qmat(q, p):
    x, y, z, w = q
    M = np.eye(4)
    M[:3, :3] = [[1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
                 [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
                 [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]]
    M[:3, 3] = p
    return M


def personagem(nome_saida, d, clipes, hip_akai, tint=None):
    """d: SKD[x] (22 ossos, pai, t = deslocamento no osso pai, qb = rotação de repouso no espaço do personagem, inv, vb, ib).
    No jogo antigo: Q = D * qb (rotação global), posição = posição do pai + Q_pai * t; quadril em (0, quadril, 0)."""
    g = GLB()
    nb = len(d['ossos'])
    pai = d['pai']
    tb = np.array(d['t'], np.float64).reshape(-1, 3)
    qb = np.array(d['qb'], np.float64).reshape(-1, 4)
    hip = float(d['quadril'])
    # malha com pele: 28 bytes por vértice (pos f32x3, normal i8x3 + 1, uv u16x2, ossos u8x4, pesos u8x4)
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
    # pose de repouso: rotações globais qb, posições pela cadeia
    Pr = np.zeros((nb, 3))
    for b in range(nb):
        p = pai[b]
        Pr[b] = (0, hip, 0) if p < 0 else Pr[p] + qrot(qb[p], tb[b])
    # nós dos ossos (rotação local = qb_pai^-1 * qb)
    base_no = len(g.j['nodes'])
    for b in range(nb):
        p = pai[b]
        loc = qb[b] if p < 0 else qmul(qinv(qb[p]), qb[b])
        g.j['nodes'].append({'name': d['ossos'][b], 'translation': [float(x) for x in ((0, hip, 0) if p < 0 else tb[b])], 'rotation': [float(x) for x in qnorm(loc)]})
    for b in range(nb):
        filhos = [base_no + c for c in range(nb) if pai[c] == b]
        if filhos:
            g.j['nodes'][base_no + b]['children'] = filhos
    # matrizes inversas de ligação, da própria pose de repouso (ficam coerentes com os nós)
    inv = np.zeros((nb, 16), np.float32)
    for b in range(nb):
        inv[b] = np.linalg.inv(qmat(qb[b], Pr[b])).T.reshape(16)   # coluna-maior
    ibm = g.acc(inv, 5126, 'MAT4')
    mat = g.material('pele', d['tex'], nrm=d.get('nrm'), rug=0.8, alfa=False, cor=tint)
    at = {'POSITION': g.acc(P.astype(np.float32), 5126, 'VEC3', 34962, mm=True), 'NORMAL': g.acc(N, 5126, 'VEC3', 34962),
          'TEXCOORD_0': g.acc(U, 5126, 'VEC2', 34962), 'JOINTS_0': g.acc(J, 5121, 'VEC4', 34962), 'WEIGHTS_0': g.acc(W.astype(np.float32), 5126, 'VEC4', 34962)}
    g.j['meshes'].append({'name': nome_saida, 'primitives': [{'attributes': at, 'indices': g.acc(I, 5125, 'SCALAR', 34963), 'material': mat}]})
    g.j['skins'] = [{'inverseBindMatrices': ibm, 'joints': list(range(base_no, base_no + nb)), 'skeleton': base_no}]
    g.j['nodes'].append({'name': nome_saida + '_malha', 'mesh': 0, 'skin': 0})
    raiz = {'name': nome_saida, 'children': [base_no, len(g.j['nodes']) - 1]}
    g.j['nodes'].append(raiz)
    g.j['scenes'][0]['nodes'] = [len(g.j['nodes']) - 1]
    # animações: D (deltas globais em int16) e quadril relativo (h)
    k = hip / hip_akai
    anims = []
    for nome, c in clipes.items():
        n = c['n']
        D = np.frombuffer(base64.b64decode(c['d']), '<i2').astype(np.float64).reshape(n, nb, 4) / 32767.0
        H = np.frombuffer(base64.b64decode(c['h']), '<f4').astype(np.float64).reshape(n, 3)
        tempos = (np.arange(n, dtype=np.float32) / float(c['fps'])).astype(np.float32)
        tacc = g.acc(tempos.reshape(-1, 1), 5126, 'SCALAR', mm=True)
        canais, amostras = [], []
        Q = np.zeros((n, nb, 4))
        for f in range(n):
            for b in range(nb):
                Q[f, b] = qnorm(qmul(qnorm(D[f, b]), qb[b]))
        for b in range(nb):
            p = pai[b]
            loc = np.array([Q[f, b] if p < 0 else qnorm(qmul(qinv(Q[f, p]), Q[f, b])) for f in range(n)])
            for f in range(1, n):   # mesmo hemisfério quadro a quadro
                if np.dot(loc[f], loc[f - 1]) < 0:
                    loc[f] = -loc[f]
            amostras.append({'input': tacc, 'output': g.acc(loc.astype(np.float32), 5126, 'VEC4'), 'interpolation': 'LINEAR'})
            canais.append({'sampler': len(amostras) - 1, 'target': {'node': base_no + b, 'path': 'rotation'}})
        tr = np.zeros((n, 3), np.float32)
        tr[:, 1] = hip + H[:, 1] * k   # no lugar: o andar de verdade fica com o jogo
        amostras.append({'input': tacc, 'output': g.acc(tr, 5126, 'VEC3'), 'interpolation': 'LINEAR'})
        canais.append({'sampler': len(amostras) - 1, 'target': {'node': base_no, 'path': 'translation'}})
        anims.append({'name': nome, 'samplers': amostras, 'channels': canais})
    g.j['animations'] = anims
    g.salvar(os.path.join(OUT, 'personagens', nome_saida + '.glb'))


def main():
    os.makedirs(OUT, exist_ok=True)
    # ---------- texturas do chão ----------
    print('texturas')
    s = open(os.path.join(SRC, '21f_texturas_dados.js'), encoding='utf-8').read()
    import re
    for m in re.finditer(r"\{id:'([a-z]+)',fonte:'([a-z_0-9]+)',tam:([0-9.]+).*?cor:'(data:[^']+)',rel:'(data:[^']+)'", s, re.S):
        tid, fonte, tam, cor, rel = m.groups()
        os.makedirs(os.path.join(OUT, 'tex'), exist_ok=True)
        for suf, url in (('cor', cor), ('nrm', rel)):
            data, mime, _ = imagem(url)
            fn = os.path.join(OUT, 'tex', '%s_%s.%s' % (tid, suf, 'png' if mime == 'image/png' else 'jpg'))
            open(fn, 'wb').write(data)
            print('  %-44s %7.0f KB  (%s, %s m)' % (os.path.relpath(fn, OUT), len(data) / 1024, fonte, tam))
    # ---------- mata: árvores, plantas, pedras, troncos ----------
    print('mata')
    M = carregar('21i_mata_dados.js', 'const MATA')
    for nome, A in M.items():
        if nome.endswith('_l'):
            continue
        tex = A.get('tex') or {}
        if A.get('tipo') == 'arvore':
            partes = [(dd, mn) for mn, dd in A['lod'][0].items()]
            modelo_partes(nome, partes, tex, os.path.join(OUT, 'mata', nome + '.glb'))
        elif A.get('tipo') == 'planta':
            for i, v in enumerate(A.get('variantes', [])[:3]):
                partes = [(dd, dd.get('mat') or next(iter(tex))) for dd in v['partes']]
                modelo_partes(nome, partes, tex, os.path.join(OUT, 'mata', '%s_%d.glb' % (nome, i)))
        elif A.get('tipo') == 'objeto':
            partes = [(dd, dd.get('mat') or next(iter(tex))) for dd in A['partes']]
            modelo_partes(nome, partes, tex, os.path.join(OUT, 'mata', nome + '.glb'), folhas_alfa=False)
        elif A.get('tipo') == 'conjunto':
            for i, dd in enumerate(A.get('pecas', [])[:6]):
                modelo_partes(nome, [(dd, next(iter(tex)))], tex, os.path.join(OUT, 'mata', '%s_%d.glb' % (nome, i)), folhas_alfa=False)
    # ---------- ferramentas ----------
    print('ferramentas')
    F = carregar('21c_mod3d_dados.js', 'const MOD3D')
    for nome, A in F.items():
        if not isinstance(A, dict) or 'b' not in A:
            continue
        modelo_partes(nome, [(A, 't')], {'t': A.get('t')} if A.get('t') else {}, os.path.join(OUT, 'ferramentas', nome + '.glb'), folhas_alfa=False)
    # ---------- baú e capim ----------
    print('objetos')
    X = carregar('21e_modelos_dados.js', 'const MODX')
    if 'bau' in X:
        A = X['bau']
        modelo_partes('bau', [(A, 't')], {'t': A['t']}, os.path.join(OUT, 'objetos', 'bau.glb'), folhas_alfa=False)
    Gm = carregar('21d_grama_dados.js', 'const GRAMA3D')
    for i, dd in enumerate(Gm['v']):
        dd = dd if isinstance(dd, dict) else {'b': dd}
        modelo_partes('capim', [(dd, 'capim_folha')], {'capim_folha': Gm['t']}, os.path.join(OUT, 'mata', 'capim_%d.glb' % i))
    # ---------- personagens ----------
    print('personagens')
    s = open(os.path.join(SRC, '21a_mixamo_dados.js'), encoding='utf-8').read()
    SKD = carregar('21a_mixamo_dados.js', 'const SKD')
    clipes = {}
    for fn in ('21a_mixamo_dados.js', '21j_sobrevivente_dados.js'):
        t = open(os.path.join(SRC, fn), encoding='utf-8').read()
        i = t.find('Object.assign(SKCLIP,')
        if i >= 0:
            clipes.update(json.JSONDecoder().raw_decode(t[i + len('Object.assign(SKCLIP,'):])[0])
        i = t.find('const SKCLIP=')
        if i >= 0:
            clipes.update(json.JSONDecoder().raw_decode(t[i + len('const SKCLIP='):])[0])
    t = open(os.path.join(SRC, '21j_sobrevivente_dados.js'), encoding='utf-8').read()
    SURV = json.JSONDecoder().raw_decode(t[t.index('SKD.surv=') + len('SKD.surv='):])[0]
    print('  clipes:', ', '.join(clipes))
    hip_akai = float(SKD['akai']['quadril'])
    zclip = {k: clipes[k] for k in ('sFeridoParado', 'sFeridoAnda', 'sCorre', 'sGolpe', 'zLevantar', 'sQueda', 'sParado', 'sAnda') if k in clipes}
    personagem('zumbi', SKD['yaku'], zclip, hip_akai)
    sclip = {k: clipes[k] for k in ('sParado', 'sAnda', 'sCorre', 'sDispara', 'sAgachado', 'sAgachadoAnda', 'sPulo', 'sGolpe', 'sPega') if k in clipes}
    personagem('sobrevivente', SURV, sclip, hip_akai)


if __name__ == '__main__':
    main()
