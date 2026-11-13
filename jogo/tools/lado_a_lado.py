# Junta o conceito e a captura real do jogo, cada um com a sua etiqueta numa faixa em cima (as imagens não são mexidas).
# Uso: python3 tools/lado_a_lado.py conceito.png "etiqueta 1" captura.png "etiqueta 2" saida.png [recorte x0,y0,x1,y1]
# Sem recorte: as duas imagens inteiras, uma embaixo da outra, na metade do tamanho. Com recorte: o mesmo pedaço das duas,
# lado a lado, no tamanho de verdade (para comparar letra por letra).
import sys
from PIL import Image, ImageDraw, ImageFont
a, ea, b, eb, saida = sys.argv[1:6]
rec = tuple(int(v) for v in sys.argv[6].split(',')) if len(sys.argv) > 6 else None
A = Image.open(a).convert('RGB'); B = Image.open(b).convert('RGB')
if B.size != A.size: B = B.resize(A.size, Image.LANCZOS)
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
def faixa(img, texto, cor):
    h = 54; out = Image.new('RGB', (img.width, img.height + h), (20, 20, 20))
    d = ImageDraw.Draw(out); d.rectangle([0, 0, img.width, h - 1], fill=cor); d.text((18, 13), texto, font=F, fill=(255, 255, 255))
    out.paste(img, (0, h)); return out
if rec:
    A = A.crop(rec); B = B.crop(rec)
    pa = faixa(A, ea, (90, 60, 140)); pb = faixa(B, eb, (30, 110, 60))
    out = Image.new('RGB', (pa.width + pb.width + 16, max(pa.height, pb.height)), (20, 20, 20))
    out.paste(pa, (0, 0)); out.paste(pb, (pa.width + 16, 0))
else:
    A = A.resize((A.width // 2, A.height // 2), Image.LANCZOS); B = B.resize((B.width // 2, B.height // 2), Image.LANCZOS)
    pa = faixa(A, ea, (90, 60, 140)); pb = faixa(B, eb, (30, 110, 60))
    out = Image.new('RGB', (pa.width, pa.height + pb.height + 12), (20, 20, 20))
    out.paste(pa, (0, 0)); out.paste(pb, (0, pa.height + 12))
out.save(saida)
print('ok', saida, out.size)
