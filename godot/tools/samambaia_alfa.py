#!/usr/bin/env python3
"""A samambaia com recorte (as folhinhas de verdade, com o vão entre elas).

A samambaia (Poly Haven, fern_02) veio sem a transparência: a textura é JPG e o material ficou opaco, então cada fronde
aparecia como uma folha larga e lisa (o miolo da fronde com o verde borrado em volta). Aqui cada fronde ganha o recorte:
pela malha acha-se o contorno de cada fronde na textura, o eixo dela (a nervura do meio) e a largura em cada altura, e
desenham-se as folhinhas (pinas) dos dois lados, inclinadas para a ponta, cada vez menores até a ponta. A cor vem da própria
textura (o verde de cada fronde) com a nervura mais clara e a borda da folhinha um pouco mais escura. O material passa a
MASK, dos dois lados.

Uso, da raiz do repositório:  python3 -I godot/tools/samambaia_alfa.py godot/assets/mata/samambaia_0.glb ...
"""
import io, json, math, struct, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

TAM = 1024


def ler_glb(caminho):
    b = open(caminho, 'rb').read()
    lj = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + lj])
    o = 20 + lj
    lb = struct.unpack('<I', b[o:o + 4])[0]
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
    t = {'VEC3': 3, 'VEC2': 2, 'SCALAR': 1}[a['type']]
    dt = {5126: np.float32, 5123: np.uint16, 5125: np.uint32}[a['componentType']]
    o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    arr = np.frombuffer(bytes(binario[o:o + n * t * np.dtype(dt).itemsize]), dt)
    return arr.reshape(n, t) if t > 1 else arr


def ilhas(caminhos):
    """o contorno de cada fronde na textura (os triângulos da malha pintados), de todas as variantes juntas"""
    m = Image.new('L', (TAM, TAM), 0)
    d = ImageDraw.Draw(m)
    for c in caminhos:
        j, binario = ler_glb(c)
        for me in j['meshes']:
            for pr in me['primitives']:
                U = acessor(j, binario, pr['attributes']['TEXCOORD_0'])
                I = acessor(j, binario, pr['indices']).reshape(-1, 3)
                for t in I:
                    d.polygon([(float(U[k][0]) * TAM, float(U[k][1]) * TAM) for k in t], fill=255)
    m = m.filter(ImageFilter.MaxFilter(3))
    return np.asarray(m) > 127


def rotulos(mask):
    h, w = mask.shape
    rot = np.zeros((h, w), np.int32)
    n = 0
    ys, xs = np.nonzero(mask)
    for y0, x0 in zip(ys, xs):
        if rot[y0, x0]:
            continue
        n += 1
        pilha = [(y0, x0)]
        rot[y0, x0] = n
        while pilha:
            y, x = pilha.pop()
            for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not rot[yy, xx]:
                    rot[yy, xx] = n
                    pilha.append((yy, xx))
    return rot, n


def desenhar(tex, mask):
    rgb = np.asarray(tex.convert('RGB').resize((TAM, TAM), Image.LANCZOS)).astype(np.float32)
    alfa = Image.new('L', (TAM, TAM), 0)
    da = ImageDraw.Draw(alfa)
    nerv = Image.new('L', (TAM, TAM), 0)
    dn = ImageDraw.Draw(nerv)
    rot, n = rotulos(mask)
    rng = np.random.default_rng(7)
    for k in range(1, n + 1):
        ys, xs = np.nonzero(rot == k)
        if len(xs) < 400:
            continue
        pts = np.stack([xs, ys], 1).astype(np.float32)
        c = pts.mean(0)
        u, s, vt = np.linalg.svd(pts - c, full_matrices=False)
        eixo = vt[0]
        # a ponta da fronde: o lado mais fino
        proj = (pts - c) @ eixo
        lado = (pts - c) @ np.array([-eixo[1], eixo[0]])
        lo, hi = proj.min(), proj.max()
        fat_lo = np.ptp(lado[proj < lo + (hi - lo) * 0.15]) if (proj < lo + (hi - lo) * 0.15).any() else 0
        fat_hi = np.ptp(lado[proj > hi - (hi - lo) * 0.15]) if (proj > hi - (hi - lo) * 0.15).any() else 0
        if fat_hi > fat_lo:
            eixo = -eixo
            proj = -proj
            lado = -lado
            lo, hi = -hi, -lo
        perp = np.array([-eixo[1], eixo[0]])
        L = hi - lo
        # a nervura do meio: em cada fatia, o meio da largura
        fatias = 60
        meio = []
        larg = []
        for f in range(fatias + 1):
            t = lo + L * f / fatias
            sel = np.abs(proj - t) < L / fatias
            if sel.sum() < 2:
                meio.append(None)
                larg.append(0.0)
                continue
            a0, a1 = lado[sel].min(), lado[sel].max()
            meio.append(c + eixo * t + perp * (a0 + a1) * 0.5)
            larg.append((a1 - a0) * 0.5)
        ultimo = None
        for f in range(fatias + 1):
            if meio[f] is None:
                meio[f] = ultimo
            ultimo = meio[f]
        meio = [m if m is not None else c for m in meio]
        # a nervura
        for f in range(fatias):
            a, b = meio[f], meio[f + 1]
            esp = max(1.0, 3.2 * (1 - f / fatias))
            da.line([tuple(a), tuple(b)], fill=255, width=int(round(esp + 1)))
            dn.line([tuple(a), tuple(b)], fill=255, width=int(round(esp)))
        # as folhinhas: dos dois lados, do pé (curtinhas) até a ponta (pequenas), inclinadas para a ponta
        npar = 34
        for q in range(npar):
            t = 0.06 + 0.92 * q / (npar - 1)
            fi = t * fatias
            f0 = int(min(fatias - 1, math.floor(fi)))
            w = fi - f0
            p = meio[f0] * (1 - w) + meio[f0 + 1] * w
            hw = larg[f0] * (1 - w) + larg[f0 + 1] * w
            base_l = hw * (0.55 + 0.4 * min(1.0, t * 4)) * (1.0 if t < 0.85 else (1 - (t - 0.85) / 0.15) * 0.8 + 0.2)
            larg_p = max(2.0, L / npar * 0.42)
            for sgn in (-1, 1):
                ang = math.radians(58 + rng.uniform(-6, 6))
                d = perp * sgn * math.sin(ang) + eixo * math.cos(ang)
                comp = base_l / max(0.3, math.sin(ang)) * rng.uniform(0.85, 1.0)
                ponta = p + d * comp
                lat = np.array([-d[1], d[0]])
                poly = [p + lat * larg_p * 0.35, p + d * comp * 0.35 + lat * larg_p * 0.55, p + d * comp * 0.75 + lat * larg_p * 0.38,
                        ponta, p + d * comp * 0.75 - lat * larg_p * 0.38, p + d * comp * 0.35 - lat * larg_p * 0.55,
                        p - lat * larg_p * 0.35]
                da.polygon([tuple(v) for v in poly], fill=255)
                dn.line([tuple(p), tuple(p + d * comp * 0.8)], fill=110, width=1)
    a = np.asarray(alfa.filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255.0
    nv = np.asarray(nerv.filter(ImageFilter.GaussianBlur(0.5))).astype(np.float32) / 255.0
    # a cor: o verde da própria fronde (o borrado do fundo é do mesmo tom), a nervura mais clara e a borda mais escura
    borda = np.asarray(alfa.filter(ImageFilter.GaussianBlur(2.2))).astype(np.float32) / 255.0
    cor = rgb * (0.82 + 0.2 * borda[..., None]) + nv[..., None] * np.array([28.0, 30.0, 12.0])
    ruido = rng.normal(0.0, 6.0, (TAM, TAM, 1)).astype(np.float32)
    cor = np.clip(cor + ruido, 0, 255)
    out = np.zeros((TAM, TAM, 4), np.uint8)
    out[..., :3] = cor.astype(np.uint8)
    out[..., 3] = np.clip(a * 255.0, 0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def main():
    caminhos = sys.argv[1:]
    mask = ilhas(caminhos)
    feito = None
    for c in caminhos:
        j, binario = ler_glb(c)
        mat = j['materials'][0]
        ti = mat['pbrMetallicRoughness']['baseColorTexture']['index']
        ii = j['textures'][ti]['source']
        img = j['images'][ii]
        if feito is None:
            bv = j['bufferViews'][img['bufferView']]
            ini = bv.get('byteOffset', 0)
            tex = Image.open(io.BytesIO(bytes(binario[ini:ini + bv['byteLength']])))
            novo = desenhar(tex, mask)
            buf = io.BytesIO()
            novo.save(buf, 'PNG', optimize=True)
            feito = buf.getvalue()
        binario = trocar_view(j, binario, img['bufferView'], feito)
        img['mimeType'] = 'image/png'
        mat['alphaMode'] = 'MASK'
        mat['alphaCutoff'] = 0.5
        mat['doubleSided'] = True
        gravar_glb(c, j, binario)
        print('%s: samambaia com recorte (%d KB)' % (c, len(feito) // 1024))


if __name__ == '__main__':
    main()
