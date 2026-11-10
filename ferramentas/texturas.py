"""Gera jogo/src/21f_texturas_dados.js: as texturas realistas da prova de estilo (Poly Haven, CC0), cor e relevo em 1K,
em JPG dentro do próprio jogo (base64), na ordem das camadas do terreno.

Uso: python3 ferramentas/texturas.py <pasta>
A pasta tem, para cada textura, <fonte>_cor_1k.jpg e <fonte>_relevo_1k.jpg (relevo = normal no padrão OpenGL, verde para cima).
Quando o pacote da Poly Haven traz o normal só em EXR compactado (DWAA), o relevo sai do mapa de altura (displacement)."""
import base64, os, sys
import numpy as np
from PIL import Image

# camada, fonte na Poly Haven, tamanho no mundo (m) que um ladrilho da textura cobre
CAMADAS = [('grama', 'sparse_grass', 2.0), ('mata', 'forest_ground_04', 3.2), ('folhas', 'leaves_forest_ground', 2.4),
           ('rocha', 'rock_boulder_dry', 1.8), ('tabua', 'weathered_brown_planks', 1.8)]

pasta = sys.argv[1]
saida = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'jogo', 'src', '21f_texturas_dados.js')
L = ['/* ================= texturas realistas da prova de estilo (Poly Haven, licença CC0) =================',
     '   Gerado por ferramentas/texturas.py. Cor e relevo (normal, padrão OpenGL) em 1K; tam = metros que um ladrilho cobre;',
     '   med = cor média da textura em luz linear (para puxar a cor para a paleta do jogo). Camadas na ordem do terreno. */',
     'const TEXREAL_DADOS=[']
tot = 0
for cam, fonte, tam in CAMADAS:
    cor = os.path.join(pasta, f'{fonte}_cor_1k.jpg')
    rel = os.path.join(pasta, f'{fonte}_relevo_1k.jpg')
    a = np.asarray(Image.open(cor).convert('RGB').resize((64, 64)), dtype=np.float64) / 255.0
    med = ((a ** 2.2).reshape(-1, 3)).mean(0)
    b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
    c, r = b64(cor), b64(rel)
    tot += len(c) + len(r)
    L.append(f"{{id:'{cam}',fonte:'{fonte}',tam:{tam},med:[{med[0]:.4f},{med[1]:.4f},{med[2]:.4f}],"
             f"cor:'data:image/jpeg;base64,{c}',rel:'data:image/jpeg;base64,{r}'}},")
L.append('];')
open(saida, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('ok', saida, round(tot / 1e6, 2), 'MB em base64')
