"""Texturas de detalhe dos itens feitos no código (machado de pedra, lança, porrete, faca de pedra, pedra, taco cravado...).
Uso (de dentro de jogo/):
  python3 -I tools/itens_textura.py <madeira.jpg> <metal.jpg> <pano.jpg> src/21f_texturas_dados.js src/21o_itens_tex_dados.js
  madeira = weathered_planks_diff_2k.jpg, metal = rusty_metal_02_diff_2k.jpg, pano = rough_linen_diff_2k.jpg (Poly Haven, CC0);
  a pedra sai da camada 'rocha' (rock_boulder_dry) que o jogo já tem em 21f_texturas_dados.js.
Cada textura vira um ladrilho de 256 px que repete sem emenda, com o brilho médio em 0,5: no jogo ela multiplica a cor da peça
(que vai em dobro), então a peça continua da cor de antes e ganha o veio da madeira, a ferrugem, a trama ou o grão da pedra.
Na madeira entra uma tábua só (sem as frestas entre as tábuas), deitada para o veio correr ao longo do cabo e espelhada nas
bordas para emendar."""
import base64, io, re, sys
import numpy as np
from PIL import Image

LADO = 256


def espelhar(im):   # meio ladrilho espelhado nos dois sentidos: emenda sem costura
    a = np.asarray(im); b = np.concatenate([a, a[:, ::-1]], 1); return Image.fromarray(np.concatenate([b, b[::-1]], 0))


def detalhe(im, guarda_cor, contraste=1.2):
    a = np.asarray(im.convert('RGB'), np.float32) / 255.0
    lin = a ** 2.2
    lum = lin @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    m = float(lum.mean()) or 1e-3
    cinza = np.repeat(lum[..., None], 3, 2)
    c = cinza * (1 - guarda_cor) + lin * guarda_cor
    c = c / m * 0.5                                   # média 0,5 (a cor da peça vai em dobro)
    c = 0.5 + (c - 0.5) * contraste
    c = np.clip(c, 0.02, 1.0) ** (1 / 2.2)            # a textura é lida como sRGB
    return Image.fromarray((c * 255 + 0.5).astype(np.uint8))


def tabua_sozinha(im):
    a = np.asarray(im.convert('L'), np.float32)
    col = a.mean(0); k = max(9, a.shape[1] // 100)
    lis = np.convolve(col, np.ones(k) / k, 'same')
    # frestas: mínimos locais bem abaixo da média; a tábua mais larga fica entre duas delas
    lim = lis.mean() - 0.6 * lis.std()
    fr = [i for i in range(k, len(lis) - k) if lis[i] < lim and lis[i] == lis[i - k:i + k].min()]
    fr = [0] + fr + [len(lis) - 1]
    i0, i1 = max(zip(fr, fr[1:]), key=lambda p: p[1] - p[0])
    m = (i1 - i0) // 8; x0, x1 = i0 + m, i1 - m; w = x1 - x0
    y0 = (a.shape[0] - w) // 2
    tab = im.crop((x0, y0, x1, y0 + w)).rotate(90, expand=True)   # veio deitado (corre ao longo de u)
    return tab


def data_url(im, q=82):
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()


def main():
    madeira, metal, pano, dados, saida = sys.argv[1:6]
    s = open(dados, encoding='utf8').read()
    m = re.search(r"\{id:'rocha'[^}]*?cor:'(data:image/\w+;base64,[A-Za-z0-9+/=]+)'", s)
    if not m: sys.exit('camada rocha não achada em ' + dados)
    rocha = Image.open(io.BytesIO(base64.b64decode(m.group(1).split(',', 1)[1])))
    out = {}
    out['madeira'] = espelhar(detalhe(tabua_sozinha(Image.open(madeira)), 0.0, 1.35).resize((LADO // 2, LADO // 2), Image.LANCZOS))
    out['metal'] = detalhe(Image.open(metal), 0.55, 1.0).resize((LADO, LADO), Image.LANCZOS)
    out['pano'] = detalhe(Image.open(pano), 0.0, 1.6).resize((LADO, LADO), Image.LANCZOS)
    out['pedra'] = detalhe(rocha, 0.3, 1.25).resize((LADO, LADO), Image.LANCZOS)
    linhas = ['/* ================= texturas de detalhe dos itens feitos no código (v10.2.4) =================',
              '   Gerado por tools/itens_textura.py. Poly Haven (CC0): weathered_planks (uma tábua só), rusty_metal_02, rough_linen e',
              "   rock_boulder_dry (a camada 'rocha' de 21f). Ladrilhos de 256 px que repetem, com brilho médio 0,5 (62zf_itens_tex.js). */",
              'const ITX_DADOS={']
    for k, im in out.items():
        linhas.append(f"  {k}:'{data_url(im)}',")
    linhas.append('};')
    open(saida, 'w', encoding='utf8').write('\n'.join(linhas) + '\n')
    for k, im in out.items(): im.save(saida + '.' + k + '.png')
    print('ok', saida, sum(len(l) for l in linhas) // 1024, 'KB')


if __name__ == '__main__':
    main()
