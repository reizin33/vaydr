#!/usr/bin/env python3
"""Conserta a transparência das folhas das árvores (ilha1, ilha2, jacarandá e pequena).

As texturas de folha que vieram do jogo antigo têm o recorte (alfa) em polígonos grosseiros em volta de cada folha, e
dentro do polígono o que não é folha ficou PRETO e opaco: no jogo aparecem folhas com pedaços pretos (a primeira cena da
mata mostrava isso). Aqui o recorte passa a ser a própria folha da foto (opaco só onde tem cor de folha); os polígonos que
ficaram quase sem folha ganham a cópia de uma folha boa do mesmo arquivo (para a copa não ficar rala); e a cor dos pontos
transparentes passa a ser a da folha mais perto (a mipmap não escurece a borda).

Uso, da raiz do repositório:  python3 -I godot/tools/folhas_alfa.py godot/assets/mata/ilha1.glb ...
"""
import io, json, struct, sys
import numpy as np
from PIL import Image

LIMIAR_COR = 34       # mais escuro que isto (no canal mais claro) não é folha
LIMIAR_ALFA = 115     # o corte do material é 0,45


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


def componentes(m):
    """rótulos 4-conectados de uma máscara (sem scipy)"""
    h, w = m.shape
    rot = np.zeros((h, w), np.int32)
    n = 0
    ys, xs = np.nonzero(m)
    for y0, x0 in zip(ys, xs):
        if rot[y0, x0]:
            continue
        n += 1
        pilha = [(y0, x0)]
        rot[y0, x0] = n
        while pilha:
            y, x = pilha.pop()
            for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= yy < h and 0 <= xx < w and m[yy, xx] and not rot[yy, xx]:
                    rot[yy, xx] = n
                    pilha.append((yy, xx))
    return rot, n


def sangrar(rgb, alfa):
    """a cor dos pontos transparentes vira a da folha mais perto (empurra e puxa por uma pirâmide de tamanhos)"""
    h, w = alfa.shape
    niveis = [(rgb * alfa[..., None], alfa.astype(np.float32))]
    while min(niveis[-1][1].shape) > 1:
        c, a = niveis[-1]
        hh, ww = (a.shape[0] + 1) // 2, (a.shape[1] + 1) // 2
        c2 = np.zeros((hh, ww, 3), np.float32)
        a2 = np.zeros((hh, ww), np.float32)
        for dy in (0, 1):
            for dx in (0, 1):
                cs = c[dy::2, dx::2]
                as_ = a[dy::2, dx::2]
                c2[:cs.shape[0], :cs.shape[1]] += cs
                a2[:as_.shape[0], :as_.shape[1]] += as_
        niveis.append((c2, a2))
    cor = niveis[-1][0] / np.maximum(niveis[-1][1], 1e-6)[..., None]
    for c, a in reversed(niveis[:-1]):
        sobe = np.repeat(np.repeat(cor, 2, 0), 2, 1)[:a.shape[0], :a.shape[1]]
        tem = a > 0
        aqui = c / np.maximum(a, 1e-6)[..., None]
        cor = np.where(tem[..., None], aqui, sobe)
    return cor


def consertar(im):
    a = np.asarray(im.convert('RGBA')).astype(np.float32)
    rgb = a[..., :3]
    alfa_v = a[..., 3] >= LIMIAR_ALFA
    folha = alfa_v & (rgb.max(axis=2) >= LIMIAR_COR)
    # os polígonos do recorte velho: os que têm pouca folha dentro ganham uma folha boa copiada
    rot, n = componentes(alfa_v)
    boas = []
    fracos = []
    for k in range(1, n + 1):
        sel = rot == k
        tot = int(sel.sum())
        if tot < 40:
            continue
        ys, xs = np.nonzero(sel)
        caixa = (ys.min(), ys.max() + 1, xs.min(), xs.max() + 1)
        cobre = float((folha & sel).sum()) / tot
        if cobre >= 0.6:
            boas.append((caixa, sel))
        elif cobre < 0.45:
            fracos.append((caixa, sel))
    novo_rgb = rgb.copy()
    novo_alfa = folha.copy()
    if boas:
        for i, (caixa, sel) in enumerate(fracos):
            (b0, b1, c0, c1), selb = boas[i % len(boas)]
            src_rgb = rgb[b0:b1, c0:c1]
            src_m = (folha & selb)[b0:b1, c0:c1]
            y0, y1, x0, x1 = caixa
            tam = (x1 - x0, y1 - y0)
            p_rgb = np.asarray(Image.fromarray(src_rgb.astype(np.uint8)).resize(tam, Image.BICUBIC)).astype(np.float32)
            p_m = np.asarray(Image.fromarray((src_m * 255).astype(np.uint8)).resize(tam, Image.BILINEAR)) >= 128
            dentro = sel[y0:y1, x0:x1]
            # o polígono velho some e a folha copiada entra no lugar dele (só dentro dele)
            novo_alfa[y0:y1, x0:x1] &= ~dentro
            m = p_m & dentro
            novo_rgb[y0:y1, x0:x1][m] = p_rgb[m]
            novo_alfa[y0:y1, x0:x1] |= m
    cor = sangrar(novo_rgb / 255.0, novo_alfa.astype(np.float32))
    out = np.zeros(a.shape, np.uint8)
    out[..., :3] = np.clip(np.where(novo_alfa[..., None], novo_rgb / 255.0, cor) * 255.0 + 0.5, 0, 255).astype(np.uint8)
    out[..., 3] = np.where(novo_alfa, 255, 0).astype(np.uint8)
    return Image.fromarray(out, 'RGBA'), len(boas), len(fracos), float(folha.sum()) / max(1, int(alfa_v.sum()))


def main():
    for caminho in sys.argv[1:]:
        j, binario = ler_glb(caminho)
        feito = False
        for mat in j.get('materials', []):
            if mat.get('alphaMode') != 'MASK':
                continue
            ti = mat.get('pbrMetallicRoughness', {}).get('baseColorTexture', {}).get('index')
            if ti is None:
                continue
            ii = j['textures'][ti]['source']
            img = j['images'][ii]
            bv = j['bufferViews'][img['bufferView']]
            ini = bv.get('byteOffset', 0)
            im = Image.open(io.BytesIO(bytes(binario[ini:ini + bv['byteLength']])))
            novo, nb, nf, cob = consertar(im)
            buf = io.BytesIO()
            novo.save(buf, 'PNG', optimize=True)
            binario = trocar_view(j, binario, img['bufferView'], buf.getvalue())
            img['mimeType'] = 'image/png'
            print('%s: %s (folha cobria %.0f%% do recorte velho; %d folhas boas, %d polígonos refeitos)' % (caminho, mat.get('name'), cob * 100, nb, nf))
            feito = True
        if feito:
            gravar_glb(caminho, j, binario)


if __name__ == '__main__':
    main()
