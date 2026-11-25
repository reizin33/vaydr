#!/usr/bin/env python3
"""Tira os "losangos escuros" das árvores: os pedaços chatos da malha dos galhos.

Na malha da casca (os galhos e o tronco, opacos) há pedaços que não são galho de verdade: placas chatas (um
plano só, em geral um losango) e fitas chatas torcidas (uma tira de losangos ao longo do galho), que no modelo original
levavam uma textura de raminho com recorte. Aqui a textura dos galhos é a casca inteira, sem recorte, então cada placa
aparecia como um losango marrom-escuro flutuando ao longo dos galhos (o jacarandá tinha 214 placas, algumas de 2 m, e 161
fitas). Este script tira da malha dos galhos os pedaços chatos maiores que TAM_MIN (nas unidades do modelo): a placa
(plana) e a fita (os triângulos vizinhos quase no mesmo plano, dobrando menos que DOBRA_MAX graus em média; um galho de
verdade é um tubo e os vizinhos em volta dele dobram de 60 a 120 graus). As pontinhas de poucos centímetros ficam.

Uso, da raiz do repositório:  python3 -I godot/tools/galhos_planos.py godot/assets/mata/jacaranda.glb ...
"""
import json, struct, sys
import numpy as np

TAM_MIN = 0.12     # pedaço chato maior que isto sai (nas unidades do modelo)
CHATO = 0.02       # espessura / tamanho abaixo disto é um plano
DOBRA_MAX = 25.0   # dobra média entre triângulos vizinhos abaixo disto (graus) é uma fita


def ler_glb(caminho):
    b = open(caminho, 'rb').read()
    assert b[:4] == b'glTF'
    lj = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + lj])
    o = 20 + lj
    lb, tipo = struct.unpack('<II', b[o:o + 8])
    assert tipo == 0x004E4942
    return j, bytearray(b[o + 8:o + 8 + lb])


def gravar_glb(caminho, j, binario):
    js = json.dumps(j, separators=(',', ':')).encode('utf-8')
    js += b' ' * ((4 - len(js) % 4) % 4)
    bn = bytes(binario) + b'\0' * ((4 - len(binario) % 4) % 4)
    with open(caminho, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bn)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js)
        f.write(struct.pack('<II', len(bn), 0x004E4942) + bn)


def trocar_view(j, binario, iv, dados):
    """troca o conteúdo de uma bufferView e remonta o buffer inteiro (cada view começa alinhada em 4 bytes)"""
    partes = []
    for k, v in enumerate(j['bufferViews']):
        ini = v.get('byteOffset', 0)
        partes.append(bytes(dados) if k == iv else bytes(binario[ini:ini + v['byteLength']]))
    out = bytearray()
    for k, v in enumerate(j['bufferViews']):
        out += b'\0' * ((4 - len(out) % 4) % 4)
        v['byteOffset'] = len(out)
        v['byteLength'] = len(partes[k])
        out += partes[k]
    j['buffers'][0]['byteLength'] = len(out)
    return out


def acessor(j, binario, i):
    a = j['accessors'][i]
    bv = j['bufferViews'][a['bufferView']]
    n = a['count']
    t = {'VEC3': 3, 'VEC2': 2, 'SCALAR': 1, 'VEC4': 4}[a['type']]
    dt = {5126: np.float32, 5123: np.uint16, 5125: np.uint32}[a['componentType']]
    assert bv.get('byteStride') in (None, t * np.dtype(dt).itemsize)
    o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    arr = np.frombuffer(bytes(binario[o:o + n * t * np.dtype(dt).itemsize]), dt)
    return arr.reshape(n, t) if t > 1 else arr


def fitas(V, I):
    """os triângulos das fitas chatas (por aresta, com os vértices da mesma posição soldados): devolve a máscara"""
    chave = {}
    sold = np.zeros(len(V), int)
    for i, p in enumerate(np.round(V, 5)):
        sold[i] = chave.setdefault(tuple(p), len(chave))
    T = sold[I]
    pos = np.zeros((len(chave), 3))
    pos[sold] = V
    nrm = np.cross(pos[T[:, 1]] - pos[T[:, 0]], pos[T[:, 2]] - pos[T[:, 0]])
    nrm /= np.maximum(np.linalg.norm(nrm, axis=1, keepdims=True), 1e-12)
    pai = np.arange(len(T))

    def raiz(x):
        while pai[x] != x:
            pai[x] = pai[pai[x]]
            x = pai[x]
        return x
    arestas = {}
    for ti, t in enumerate(T):
        for x, y in ((t[0], t[1]), (t[1], t[2]), (t[2], t[0])):
            arestas.setdefault((min(x, y), max(x, y)), []).append(ti)
    for ts in arestas.values():
        for k in range(1, len(ts)):
            pai[raiz(ts[k])] = raiz(ts[0])
    comp = np.array([raiz(i) for i in range(len(T))])
    soma = {}
    cont = {}
    for ts in arestas.values():
        if len(ts) == 2:
            c = comp[ts[0]]
            ang = float(np.degrees(np.arccos(np.clip(abs(float(np.dot(nrm[ts[0]], nrm[ts[1]]))), 0.0, 1.0))))
            soma[c] = soma.get(c, 0.0) + ang
            cont[c] = cont.get(c, 0) + 1
    tirar = np.zeros(len(T), bool)
    for c in np.unique(comp):
        sel = comp == c
        vs = pos[np.unique(T[sel].reshape(-1))]
        # sem aresta dividida com outro triângulo (um triângulo solto, ou dois encostados só pela ponta) também é chato; e
        # um quadrado só (dois triângulos, mesmo dobrado) não é galho: é o losango
        if float(np.ptp(vs, axis=0).max()) > TAM_MIN and (cont.get(c, 0) == 0 or int(sel.sum()) <= 2 or soma[c] / cont[c] < DOBRA_MAX):
            tirar |= sel
    return tirar


def pedacos(n, tris):
    """os pedaços ligados da malha (cada vértice -> o pedaço dele)"""
    pai = np.arange(n)

    def raiz(x):
        while pai[x] != x:
            pai[x] = pai[pai[x]]
            x = pai[x]
        return x
    for t in tris:
        a, b, c = raiz(t[0]), raiz(t[1]), raiz(t[2])
        pai[b] = a
        pai[c] = a
    return np.array([raiz(i) for i in range(n)])


def main():
    for caminho in sys.argv[1:]:
        j, binario = ler_glb(caminho)
        mudou = False
        for me in j['meshes']:
            for pr in me['primitives']:
                nome = j['materials'][pr['material']].get('name', '') if 'material' in pr else ''
                # a casca: os galhos e o tronco (as folhas ficam como estão)
                if nome == 'folhas' or j['materials'][pr['material']].get('alphaMode', 'OPAQUE') != 'OPAQUE':
                    continue
                V = acessor(j, binario, pr['attributes']['POSITION'])
                ia = pr['indices']
                I = acessor(j, binario, ia).reshape(-1, 3)
                comp = pedacos(len(V), I)
                tirar = set()
                for u in np.unique(comp[I[:, 0]]):
                    vs = V[comp == u]
                    if len(vs) < 3:
                        continue
                    s = np.linalg.svd(vs - vs.mean(0), compute_uv=False)
                    tam = float(np.ptp(vs, axis=0).max())
                    if s[0] > 1e-6 and s[2] / s[0] < CHATO and tam > TAM_MIN:
                        tirar.add(int(u))
                fica = np.array([int(comp[t[0]]) not in tirar for t in I]) & ~fitas(V, I)
                if fica.all():
                    continue
                novo = I[fica].reshape(-1)
                acc = j['accessors'][ia]
                dt = {5123: np.uint16, 5125: np.uint32}[acc['componentType']]
                dados = novo.astype(dt).tobytes()
                # o acessor dos índices passa a ter uma view só dele (o deslocamento dentro dela é zero)
                binario = trocar_view(j, binario, acc['bufferView'], dados)
                acc['byteOffset'] = 0
                acc['count'] = int(len(novo))
                print('%s: %s, %d placas chatas e as fitas tiradas (%d de %d triângulos)' % (caminho, nome, len(tirar), int((~fica).sum()), len(I)))
                mudou = True
        if mudou:
            gravar_glb(caminho, j, binario)


if __name__ == '__main__':
    main()
