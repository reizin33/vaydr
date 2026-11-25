#!/usr/bin/env python3
"""Tira os "losangos escuros" das árvores: os pedaços chatos da malha dos galhos.

Na malha dos galhos (o material "..._branches", casca opaca) há pedaços que não são galho de verdade: são placas chatas
(um plano só, em geral um losango) que no modelo original levavam uma textura de raminho com recorte. Aqui a textura dos
galhos é a casca inteira, sem recorte, então cada placa aparecia como um losango marrom-escuro flutuando ao longo dos
galhos (o jacarandá tinha 214 delas, algumas de 2 m). Este script tira da malha dos galhos os pedaços chatos maiores que
TAM_MIN (nas unidades do modelo): os galhos de verdade (cilindros) e as pontinhas chatas de poucos centímetros ficam.

Uso, da raiz do repositório:  python3 -I godot/tools/galhos_planos.py godot/assets/mata/jacaranda.glb ...
"""
import json, struct, sys
import numpy as np

TAM_MIN = 0.12     # pedaço chato maior que isto sai (nas unidades do modelo)
CHATO = 0.02       # espessura / tamanho abaixo disto é um plano


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
                if 'branches' not in nome:
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
                if not tirar:
                    continue
                fica = np.array([int(comp[t[0]]) not in tirar for t in I])
                novo = I[fica].reshape(-1)
                acc = j['accessors'][ia]
                dt = {5123: np.uint16, 5125: np.uint32}[acc['componentType']]
                dados = novo.astype(dt).tobytes()
                # o acessor dos índices passa a ter uma view só dele (o deslocamento dentro dela é zero)
                binario = trocar_view(j, binario, acc['bufferView'], dados)
                acc['byteOffset'] = 0
                acc['count'] = int(len(novo))
                print('%s: %s, %d pedaços chatos tirados (%d de %d triângulos)' % (caminho, nome, len(tirar), int((~fica).sum()), len(I)))
                mudou = True
        if mudou:
            gravar_glb(caminho, j, binario)


if __name__ == '__main__':
    main()
