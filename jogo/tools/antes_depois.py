"""Folha de antes e depois: cada linha é a mesma vista em duas capturas reais do jogo (sem edição), lado a lado.
Uso: python3 -I tools/antes_depois.py saida.png "rótulo do antes" "rótulo do depois" antes1.png:depois1.png:legenda1 [antes2.png:depois2.png:legenda2 ...]"""
import sys
from PIL import Image, ImageDraw, ImageFont
SAI, RA, RD = sys.argv[1:4]; pares = [a.split(':', 2) for a in sys.argv[4:]]
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def fonte(n): return ImageFont.truetype(F, n)
tw, th, topo = 800, 450, 56
im = Image.new('RGB', (tw * 2 + 12, topo + len(pares) * (th + 12)), (14, 16, 18)); d = ImageDraw.Draw(im)
for k, (rot, cor) in enumerate(((RA, (90, 92, 96)), (RD, (28, 110, 62)))):
    x = k * (tw + 12); w = d.textlength(rot, font=fonte(22)); d.rectangle([x + 10, 12, x + 30 + w, 46], fill=cor); d.text((x + 20, 16), rot, font=fonte(22), fill=(255, 255, 255))
for i, (a, b, leg) in enumerate(pares):
    y = topo + i * (th + 12)
    for k, p in enumerate((a, b)):
        x = k * (tw + 12); im.paste(Image.open(p).convert('RGB').resize((tw, th), Image.LANCZOS), (x, y))
        w = d.textlength(leg, font=fonte(19)); d.rectangle([x + 8, y + th - 40, x + 26 + w, y + th - 8], fill=(0, 0, 0)); d.text((x + 17, y + th - 36), leg, font=fonte(19), fill=(255, 255, 255))
im.save(SAI, optimize=True); print(SAI, im.size)
