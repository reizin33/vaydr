"""Braço da primeira pessoa de verdade (MakeHuman, CC0): antebraço e mão direitos do corpo male_generic, com a mão fechada
em volta de um cabo (os dedos dobram em arco em volta do cabo; o polegar fecha por cima), a pele middleage_caucasian_male
recortada só na região do braço. Saída: src/21l_braco_dados.js (BRACO3D) no formato MOD3D (b, uv0, uvS) + textura WebP, no
espaço do braço: a origem é o centro do cabo dentro da mão, +x o eixo do cabo, +y vai para o cotovelo, +z = x × y.
Uso: python3 -I tools/braco_fp.py makehuman_system_assets_cc0.zip [previa.png]"""
import sys, os, io, json, base64, zipfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
import lugares_banco as LB
ZIPMH = sys.argv[1]; PREVIA = sys.argv[2] if len(sys.argv) > 2 else None
SAIDA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', '21l_braco_dados.js')
CFG = dict(pele='skins/middleage_caucasian_male/middleage_lightskinned_male_diffuse.png', corte=-0.24,   # antebraço até 24 cm antes do pulso
           Uk=0.108, Rc=0.026, polegar_giro=-1.6, polegar_giro2=0.2, lado=640)

z = zipfile.ZipFile(ZIPMH)
txt = z.read('proxymeshes/male_generic/male_generic.obj').decode('latin1').splitlines()
V = []; VT = []; F = []
for l in txt:
    if l.startswith('v '): V.append([float(x) for x in l.split()[1:4]])
    elif l.startswith('vt '): VT.append([float(x) for x in l.split()[1:3]])
    elif l.startswith('f '): F.append([[int(q) for q in p.split('/')[:2]] for p in l.split()[1:]])
V = np.array(V) * 0.1; VT = np.array(VT)          # decímetros -> metros
# eixo do braço direito (PCA dos pontos além do ombro) e o pulso (seção mais fina antes da mão)
A = V[V[:, 0] < -0.26]; c = A.mean(0); ax = np.linalg.svd(A - c)[2][0]
ponta = V[V[:, 0].argmin()]
if np.dot(ponta - c, ax) < 0: ax = -ax
t = (V - c) @ ax; R = np.linalg.norm((V - c) - np.outer(t, ax), axis=1)
tw = -0.068; W0 = c + ax * tw
dedos = (t > 0.05) & (R < 0.12) & (V[:, 0] < -0.40)
Fd = V[dedos] - V[dedos].mean(0); Fd = Fd - np.outer(Fd @ ax, ax); pn = np.linalg.svd(Fd)[2][1]
if pn[0] < 0: pn = -pn                              # palma virada para o corpo (+x) na mão direita
kn = np.cross(pn, ax)                               # linha dos nós
U = (V - W0) @ ax; Vv = (V - W0) @ kn; Ww = (V - W0) @ pn
braco = (U > CFG['corte']) & (R < 0.13) & (V[:, 0] < -0.25)
# dobra dos dedos em volta do cabo (eixo paralelo à linha dos nós, do lado da palma); o polegar sai com peso suave
Uk, Rc = CFG['Uk'], CFG['Rc']
sm = lambda a, b, x: np.clip((x - a) / (b - a), 0, 1) ** 2 * (3 - 2 * np.clip((x - a) / (b - a), 0, 1))
lim = -0.030 - 0.4 * np.maximum(0, U - 0.06)                                        # borda entre o polegar e o indicador
wp = braco * sm(lim + 0.006, lim - 0.008, Vv) * sm(0.175, 0.15, U) * sm(0.0, 0.03, U)  # peso do polegar (0 a 1)
dedo = braco & (U > Uk) & (wp < 0.5)
U2, V2, W2 = U.copy(), Vv.copy(), Ww.copy()
s = U[dedo] - Uk; r = Rc - Ww[dedo]; phi = s / Rc
U2[dedo] = Uk + r * np.sin(phi); W2[dedo] = Rc - r * np.cos(phi)
# polegar: gira em volta do eixo do braço pela base (V para W, por cima do cabo) e depois em volta da normal da palma (para os dedos)
pb = np.array([0.035, -0.03, 0.004]); g1 = CFG['polegar_giro']; g2 = CFG.get('polegar_giro2', 0.55)
m = wp > 0.001
q = np.stack([U[m], Vv[m], Ww[m]], 1) - pb; w = wp[m]
a1 = g1 * w; c1, s1 = np.cos(a1), np.sin(a1)
v1 = q[:, 1] * c1 - q[:, 2] * s1; w1 = q[:, 1] * s1 + q[:, 2] * c1; u1 = q[:, 0]
a2 = g2 * w; c2, s2 = np.cos(a2), np.sin(a2)
u2 = u1 * c2 - v1 * s2; v2 = u1 * s2 + v1 * c2
U2[m] = pb[0] + u2; V2[m] = pb[1] + v2; W2[m] = pb[2] + w1
# faces só do braço (todas as pontas dentro)
tri = []; tuv = []
for f in F:
    vi = [p[0] - 1 for p in f]; ti = [p[1] - 1 for p in f]
    if not all(braco[i] for i in vi): continue
    for k in range(1, len(vi) - 1): tri.append([vi[0], vi[k], vi[k + 1]]); tuv.append([ti[0], ti[k], ti[k + 1]])
tri = np.array(tri); tuv = np.array(tuv)
# vértice por par (posição, uv), como no MOD3D
pares = {}; P = []; UV = []; I = []
for a in range(len(tri)):
    lin = []
    for k in range(3):
        key = (tri[a, k], tuv[a, k])
        if key not in pares: pares[key] = len(P); P.append([U2[key[0]], V2[key[0]], W2[key[0]]]); UV.append(VT[key[1]])
        lin.append(pares[key])
    I.append(lin)
P = np.array(P); UV = np.array(UV); I = np.array(I)
Uorig = np.array([U[k[0]] for k in sorted(pares, key=pares.get)])   # posição ao longo do braço (antes de dobrar), por vértice novo
# espaço do braço: origem no cabo (U=Uk, V=meio dos dedos, W=Rc); x = linha dos nós (cabo); y = para o cotovelo (-U); z = x × y
Vm = float(np.median(Vv[dedo])) if dedo.any() else 0.0
G = np.array([Uk + 0.004, Vm, Rc])
X = np.array([0, 1.0, 0]); Y = np.array([-1.0, 0, 0]); Z = np.cross(X, Y)
Pb = (P - G) @ np.stack([X, Y, Z]).T
N = LB.normais(Pb, I)
# textura: só as ilhas do atlas que o braço usa (antebraço e mão), copiadas lado a lado numa imagem pequena
im = Image.open(io.BytesIO(z.read(CFG['pele']))).convert('RGB'); Wt, Ht = im.size
pai = list(range(len(P)))
def raiz(a):
    while pai[a] != a: pai[a] = pai[pai[a]]; a = pai[a]
    return a
for t3 in I:
    for k in (1, 2):
        ra, rb = raiz(t3[0]), raiz(t3[k])
        if ra != rb: pai[ra] = rb
ilha = np.array([raiz(i) for i in range(len(P))]); ids, cont = np.unique(ilha, return_counts=True)
ilhas = [q for q, n in sorted(zip(ids, cont), key=lambda x: -x[1]) if n >= 8]
UVc = np.zeros_like(UV); pedacos = []; x_ = 0
for q in ilhas:
    mq = ilha == q; a0 = UV[mq].min(0); a1 = UV[mq].max(0); pad = 0.004
    a0 = np.maximum(a0 - pad, 0); a1 = np.minimum(a1 + pad, 1)
    caixa = (int(a0[0] * Wt), int((1 - a1[1]) * Ht), int(np.ceil(a1[0] * Wt)), int(np.ceil((1 - a0[1]) * Ht)))
    pedacos.append((q, mq, a0, a1, im.crop(caixa)))
Halt = max(p_[4].size[1] for p_ in pedacos); Wtot = sum(p_[4].size[0] for p_ in pedacos)
corte = Image.new('RGB', (Wtot, Halt), (200, 160, 140)); x_ = 0
for q, mq, a0, a1, pc in pedacos:
    corte.paste(pc, (x_, 0)); w_, h_ = pc.size
    UVc[mq, 0] = (x_ + (UV[mq, 0] - a0[0]) / (a1[0] - a0[0]) * w_) / Wtot
    UVc[mq, 1] = ((a1[1] - UV[mq, 1]) / (a1[1] - a0[1]) * h_) / Halt      # OBJ conta v de baixo; a textura do jogo, de cima
    x_ += w_
k = CFG['lado'] / max(corte.size); corte = corte.resize((max(8, int(corte.size[0] * k)), max(8, int(corte.size[1] * k))), Image.LANCZOS)
print('ilhas', len(ilhas), 'atlas', (Wt, Ht), '->', corte.size)
b64, uv0, uvS = LB.codificar(Pb, UVc, N, I)
# máscara no espaço da textura: R = mão (luva), G = do pulso (0) ao corte perto do cotovelo (255), para manga e luva no jogo
Wm, Hm = corte.size; R_ = np.zeros((Hm, Wm), np.float32); G_ = np.zeros((Hm, Wm), np.float32); A_ = np.zeros((Hm, Wm), bool)
mao_v = np.clip((Uorig + 0.035) / 0.02, 0, 1); arm_v = np.clip(-Uorig / -CFG['corte'], 0, 1)
for tri_ in I:
    p = UVc[tri_] * [Wm, Hm]; x0, y0 = np.floor(p.min(0)).astype(int); x1, y1 = np.ceil(p.max(0)).astype(int)
    x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, Wm - 1), min(y1, Hm - 1)
    if x1 < x0 or y1 < y0: continue
    xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
    d = (p[1, 1] - p[2, 1]) * (p[0, 0] - p[2, 0]) + (p[2, 0] - p[1, 0]) * (p[0, 1] - p[2, 1])
    if abs(d) < 1e-9: continue
    l1 = ((p[1, 1] - p[2, 1]) * (xs - p[2, 0]) + (p[2, 0] - p[1, 0]) * (ys - p[2, 1])) / d
    l2 = ((p[2, 1] - p[0, 1]) * (xs - p[2, 0]) + (p[0, 0] - p[2, 0]) * (ys - p[2, 1])) / d; l3 = 1 - l1 - l2
    dentro = (l1 >= -0.02) & (l2 >= -0.02) & (l3 >= -0.02)
    if not dentro.any(): continue
    rv = l1 * mao_v[tri_[0]] + l2 * mao_v[tri_[1]] + l3 * mao_v[tri_[2]]; gv = l1 * arm_v[tri_[0]] + l2 * arm_v[tri_[1]] + l3 * arm_v[tri_[2]]
    sub = (slice(y0, y1 + 1), slice(x0, x1 + 1))
    R_[sub] = np.where(dentro, rv, R_[sub]); G_[sub] = np.where(dentro, gv, G_[sub]); A_[sub] |= dentro
# espalha um pouco para fora das bordas das ilhas (sem costura no filtro da textura)
for _ in range(3):
    for arr in (R_, G_):
        viz = np.maximum.reduce([np.roll(arr, s_, ax_) for s_ in (-1, 1) for ax_ in (0, 1)]); arr[~A_] = viz[~A_]
    A_ = A_ | np.roll(A_, 1, 0) | np.roll(A_, -1, 0) | np.roll(A_, 1, 1) | np.roll(A_, -1, 1)
mk = Image.fromarray(np.stack([(R_ * 255).clip(0, 255), (G_ * 255).clip(0, 255), np.zeros_like(R_)], 2).astype(np.uint8))
bm = io.BytesIO(); mk.save(bm, 'PNG', optimize=True)
bb = io.BytesIO(); corte.save(bb, 'WEBP', quality=84, method=6)
d = {'b': b64, 't': 'data:image/webp;base64,' + base64.b64encode(bb.getvalue()).decode(), 'm': 'data:image/png;base64,' + base64.b64encode(bm.getvalue()).decode(), 'uv0': [float(x) for x in uv0], 'uvS': [float(x) for x in uvS]}
print('braço: %d vértices, %d triângulos, caixa %s..%s, textura %s %d KB, máscara %d KB' % (len(Pb), len(I), Pb.min(0).round(3), Pb.max(0).round(3), corte.size, len(bb.getvalue()) // 1024, len(bm.getvalue()) // 1024))
open(SAIDA, 'w', encoding='utf-8').write('/* braço da primeira pessoa (MakeHuman male_generic, pele middleage_caucasian_male, CC0), mão fechada em volta do cabo.\n'
    '   Gerado por tools/braco_fp.py: não editar à mão. Espaço: origem no cabo, +x eixo do cabo, +y para o cotovelo. */\nconst BRACO3D={"direito":' + json.dumps(d, separators=(',', ':')) + '};\n')
print('ok', SAIDA)
if PREVIA:
    np.savez(PREVIA + '.npz', P=Pb, I=I, UV=UVc)
    corte.save(PREVIA + '_tex.png'); mk.save(PREVIA + '_mask.png')
