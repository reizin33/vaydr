"""p237d (11/11): monta a imagem de antes e depois do HUD com as fotos do p237c (antes_* e depois_* em jogo/shots).
Uso: python3 tools/p237d_montar.py saida.jpg"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
J = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(J, 'shots')
FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 21)
FC = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
FS = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
BG, TXT, OR, CINZA = (18, 22, 22), (225, 222, 214), (232, 150, 60), (150, 150, 145)
W, M, CW = 1328, 16, 640
foto = lambda q, n: Image.open(os.path.join(S, q + '_hud_' + n + '.png')).convert('RGB')
blocos = []   # (altura, função de desenho)


def titulo():
    def d(im, dr, y):
        dr.text((M, y + 8), 'ANTES (versão 9.7)', font=FB, fill=TXT)
        dr.text((M * 2 + CW, y + 8), 'DEPOIS (versão 9.8, HUD no estilo do DayZ)', font=FB, fill=OR)
    blocos.append((42, d))


def legenda(t):
    def d(im, dr, y): dr.text((M, y + 10), t, font=FC, fill=CINZA)
    blocos.append((36, d))


def par(n):
    def d(im, dr, y):
        for i, q in enumerate(('antes', 'depois')):
            im.paste(foto(q, n).resize((CW, 360), Image.LANCZOS), (M + i * (CW + M), y))
    blocos.append((368, d))


def faixa(n, caixa, esc):
    """o mesmo pedaço das duas fotos, ampliado, um embaixo do outro"""
    x0, y0, x1, y1 = caixa
    w, h = int((x1 - x0) * esc), int((y1 - y0) * esc)
    def d(im, dr, y):
        for i, q in enumerate(('antes', 'depois')):
            yy = y + i * (h + 26)
            dr.text((M, yy), 'Antes' if q == 'antes' else 'Depois', font=FS, fill=TXT if q == 'antes' else OR)
            im.paste(foto(q, n).crop(caixa).resize((w, h), Image.LANCZOS), ((W - w) // 2, yy + 20))
    blocos.append((2 * (h + 26) + 6, d))


def lado(n, caixa, esc):
    """o mesmo pedaço das duas fotos, ampliado, lado a lado"""
    x0, y0, x1, y1 = caixa
    w, h = int((x1 - x0) * esc), int((y1 - y0) * esc)
    def d(im, dr, y):
        for i, q in enumerate(('antes', 'depois')):
            im.paste(foto(q, n).crop(caixa).resize((w, h), Image.LANCZOS), (M + i * (CW + M) + (CW - w) // 2, y))
    blocos.append((h + 8, d))


titulo()
legenda('1  Tudo bem, de dia (fome e sede um pouco gastas)')
par('normal')
legenda('2  Muita sede, fome baixa, perdendo vida e quase sem fôlego')
par('baixo')
legenda('   Zoom na parte de baixo da tela, na mesma situação: ícones à direita e a barra de fôlego à esquerda')
faixa('baixo', (0, 560, 1280, 720), 1.0)
legenda('3  Mochila aberta numa noite fria')
par('mochila')
legenda('   Zoom na coluna da roupa: o painel Estado (barras com número e a faixa de conforto da temperatura)')
lado('mochila', (150, 100, 310, 530), 1.45)
H = sum(h for h, _ in blocos) + 12
im = Image.new('RGB', (W, H), BG)
dr = ImageDraw.Draw(im)
y = 4
for h, d in blocos:
    d(im, dr, y)
    y += h
saida = sys.argv[1] if len(sys.argv) > 1 else os.path.join(J, 'shots', 'hud_antes_depois.jpg')
im.save(saida, quality=88)
print(saida, im.size)
