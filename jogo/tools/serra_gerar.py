"""Gera a Serra Velha nova (relevo erodido) e a Gruta da Serra Velha (caverna esculpida em 3D) para o jogo.
Entrada: serra_base.npz (altura do chão de hoje na área, tirada do jogo por tools/serra_base.py).
Saída: src/10a_serra_dados.js (SERRA_DADOS) e imagens de conferência.

Relevo: tools/serra_relevo.py (cristas + erosão por gotas em duas escalas + degraus de rocha).
Boca da caverna: no pé da serra, dentro da borda de andar. O chão em volta vira um pátio plano e atrás dele a encosta sobe
íngreme. A rocha da boca (paredão com saliências e a própria entrada) e a caverna inteira saem de um campo 3D com sinal:
rocha = abaixo do terreno (com saliências de ruído 3D no paredão) e fora do ar da caverna. Marching cubes dá uma malha só;
fica a parede da caverna inteira e, do lado de fora, só o pedaço da boca (ali as células do terreno somem).
Caverna: túneis de seção oval, um salão e um corredor lateral com uma gruta, ruído 3D nas paredes, chão quase plano para
andar, estalactites e pedras. Junto vão: o chão para andar (grade de 0,5 m), as caixas de colisão e o quanto cada vértice
fica no escuro (a luz de fora entra pela boca e some uns 12 m para dentro).
Uso: python3 tools/serra_gerar.py serra_base.npz [pasta_das_imagens]"""
import sys, os, json, math, base64, time
import numpy as np
from scipy import ndimage
from skimage import measure
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from serra_relevo import relevo, Ruido2, fbm, sm

ARQ = sys.argv[1]; FOTOS = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(ARQ))
SAIDA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', '10a_serra_dados.js')
B = np.load(ARQ, allow_pickle=False)
H0 = B['h'].astype(np.float64); X0, X1, Z0, Z1 = float(B['x0']), float(B['x1']), float(B['z0']), float(B['z1'])
NZ, NX = H0.shape[0] - 1, H0.shape[1] - 1; DX = (X1 - X0) / NX; DZ = (Z1 - Z0) / NZ
BORDA = B['borda']
xs = X0 + DX * np.arange(NX + 1); zs = Z0 + DZ * np.arange(NZ + 1); XX, ZZ = np.meshgrid(xs, zs)
RR = np.hypot(XX, ZZ); AA = (np.degrees(np.arctan2(ZZ, XX)) + 360) % 360
borda_r = lambda a: np.interp(a, np.arange(180, 271), BORDA)
t0 = time.time()

# ---------------- relevo ----------------
borda_aqui = borda_r(np.clip(AA, 180, 270))
dpe = np.minimum.reduce([XX - X0, X1 - XX, ZZ - Z0, Z1 - ZZ])
mask = sm(184, 206, AA) * sm(262, 240, AA) * sm(4, 75, dpe) * sm(borda_aqui - 30, borda_aqui + 62, RR) ** 1.1 * sm(440, 330, RR)
CACHE = os.environ.get('SERRA_CACHE')
if CACHE and os.path.exists(CACHE):
    M = np.load(CACHE); print('relevo lido de', CACHE, flush=True)
else:
    M = relevo(XX, ZZ, mask, log=lambda s: print(s, flush=True))
    if CACHE: np.save(CACHE, M)
HTOT = H0 + M
print('relevo: serra até %.1f m acima do chão de antes (%.1fs)' % (M.max(), time.time() - t0), flush=True)

# ---------------- pátio e encosta da boca (no terreno) ----------------
A_BOCA = 214.0
R_BOCA = float(borda_r(A_BOCA)) - 11.0
ca, sa = math.cos(math.radians(A_BOCA)), math.sin(math.radians(A_BOCA))
EX, EZ = R_BOCA * ca, R_BOCA * sa
def bil(G, x, z):
    fx = np.clip((np.asarray(x) - X0) / DX, 0, NX - 1e-6); fz = np.clip((np.asarray(z) - Z0) / DZ, 0, NZ - 1e-6)
    i = np.floor(fx).astype(int); j = np.floor(fz).astype(int); u = fx - i; v = fz - j
    return (G[j, i] * (1 - u) + G[j, i + 1] * u) * (1 - v) + (G[j + 1, i] * (1 - u) + G[j + 1, i + 1] * u) * v
hE = float(np.mean([bil(HTOT, EX - ca * k, EZ - sa * k) for k in (3, 5, 7, 9)]))
S_ = (XX - EX) * ca + (ZZ - EZ) * sa; T_ = -(XX - EX) * sa + (ZZ - EZ) * ca
R_ = Ruido2(71)
linha = 0.9 * (fbm(R_, T_ / 3.5 + 40, np.zeros_like(T_) + 2, oit=3) - 0.5) * 2      # a linha do pé do paredão ondula
topo = hE + 11.0 + 3.0 * (fbm(R_, T_ / 7.0 + 9, np.zeros_like(T_) + 5, oit=3) - 0.5) * 2
encosta = hE + np.clip(S_ - linha, 0, None) * 2.4                                      # sobe ~67° atrás da linha
encosta = np.minimum(encosta, topo) + np.clip(S_ - linha - 4.6, 0, None) * 0.6         # e depois segue o morro
patio = sm(-16, -6, S_)                                                                # pátio plano de 10 m na frente
alvo = np.where(S_ <= linha, HTOT * (1 - patio) + hE * patio, np.maximum(encosta, np.minimum(HTOT, encosta + 30)))
largura = sm(19, 12, np.abs(T_)) * sm(-24, -14, S_) * sm(70, 40, S_)
HTOT = HTOT * (1 - largura) + alvo * largura
M = HTOT - H0
print('boca em (%.1f, %.1f), pátio a %.2f m, raio %.1f (borda %.1f)' % (EX, EZ, hE, R_BOCA, borda_r(A_BOCA)), flush=True)

# ---------------- caverna: campo 3D ----------------
def L2W(s, t): return EX + ca * s - sa * t, EZ + sa * s + ca * t
EIXO = [(-2.5, 0.0, 0.0), (6.0, 1.4, -0.35), (13.5, -1.6, -1.1), (20.5, 0.4, -1.9), (25.5, 1.2, -2.4)]
LADO = [(13.5, -1.6, -1.1), (17.5, -6.5, -0.9), (21.0, -10.5, -0.6)]
SALAO = (32.0, 2.5, -2.9, 9.5, 7.5, 6.4)
GRUTA = (21.5, -11.5, -0.6, 3.6, 3.2, 3.1)
RH = [2.9, 2.5, 2.3, 2.55, 3.0]; RV = [2.35, 2.0, 1.9, 2.1, 2.5]
class R3d:
    def __init__(s, semente): s.t = np.random.default_rng(semente).random((64, 64, 64))
    def v(s, x, y, z):
        n = 64; xi = np.floor(x).astype(np.int64); yi = np.floor(y).astype(np.int64); zi = np.floor(z).astype(np.int64)
        q = lambda t: t * t * t * (t * (t * 6 - 15) + 10); fx = q(x - xi); fy = q(y - yi); fz = q(z - zi); T = s.t
        g = lambda i, j, k: T[(zi + k) % n, (yi + j) % n, (xi + i) % n]
        x00 = g(0, 0, 0) + (g(1, 0, 0) - g(0, 0, 0)) * fx; x10 = g(0, 1, 0) + (g(1, 1, 0) - g(0, 1, 0)) * fx
        x01 = g(0, 0, 1) + (g(1, 0, 1) - g(0, 0, 1)) * fx; x11 = g(0, 1, 1) + (g(1, 1, 1) - g(0, 1, 1)) * fx
        y0 = x00 + (x10 - x00) * fy; y1 = x01 + (x11 - x01) * fy
        return y0 + (y1 - y0) * fz
N3a = R3d(5); N3b = R3d(6); N3c = R3d(8)
def fbm3(r, x, y, z, oit=3):
    s = 0; a = 1; t = 0
    for o in range(oit): s += a * (2 * r.v(x, y, z) - 1); t += a; a *= 0.5; x = x * 2.1 + 3.3; y = y * 2.1 - 1.7; z = z * 2.1 + 5.9
    return s / t
def smin(a, b, k):
    hh = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1); return b * (1 - hh) + a * hh - k * hh * (1 - hh)
def tubo(px, py, pz, A_, B_, rh, rv):
    ax, az = L2W(A_[0], A_[1]); bx, bz = L2W(B_[0], B_[1]); ay = hE + A_[2] + rv[0] * 0.55; by = hE + B_[2] + rv[1] * 0.55
    vx, vz = bx - ax, bz - az; l2 = vx * vx + vz * vz
    t = np.clip(((px - ax) * vx + (pz - az) * vz) / l2, 0, 1)
    cx = ax + vx * t; cz = az + vz * t; cy = ay + (by - ay) * t
    r_h = rh[0] + (rh[1] - rh[0]) * t; r_v = rv[0] + (rv[1] - rv[0]) * t
    return (np.sqrt((np.hypot(px - cx, pz - cz) / r_h) ** 2 + ((py - cy) / r_v) ** 2) - 1) * np.minimum(r_h, r_v)
def bolha(px, py, pz, C):
    s, t, ch, ra, rl, ry = C; cx, cz = L2W(s, t); cy = hE + ch + ry * 0.42
    lx = (px - cx) * ca + (pz - cz) * sa; lz = -(px - cx) * sa + (pz - cz) * ca
    return (np.sqrt((lx / ra) ** 2 + (lz / rl) ** 2 + ((py - cy) / ry) ** 2) - 1) * min(ra, rl, ry)
R2c = Ruido2(13)
def chao_cav(px, pz):
    s = (px - EX) * ca + (pz - EZ) * sa; t = -(px - EX) * sa + (pz - EZ) * ca
    melhor = np.full(np.shape(px), 1e9); ch = np.zeros(np.shape(px))
    for eixo in (EIXO, LADO):
        for a_, b_ in zip(eixo[:-1], eixo[1:]):
            vs, vt = b_[0] - a_[0], b_[1] - a_[1]; l2 = vs * vs + vt * vt
            u = np.clip(((s - a_[0]) * vs + (t - a_[1]) * vt) / l2, 0, 1); d = np.hypot(s - a_[0] - vs * u, t - a_[1] - vt * u)
            c = a_[2] + (b_[2] - a_[2]) * u; m = d < melhor; melhor = np.where(m, d, melhor); ch = np.where(m, c, ch)
    for C in (SALAO, GRUTA):
        ds = np.hypot((s - C[0]) / C[3], (t - C[1]) / C[4]); w = sm(1.25, 0.6, ds)
        ch = ch * (1 - w) + (C[2] - 0.35 * (1 - np.clip(ds, 0, 1) ** 2)) * w
    ch = ch + 0.1 * (fbm(R2c, px / 1.7 + 3, pz / 1.7 - 8, oit=3) - 0.5) * 2 * sm(-1, 2, s)
    return hE + ch
rng = np.random.default_rng(42); EST = []; PEDRAS = []
for k in range(26):
    C = SALAO if k < 20 else GRUTA; ang = rng.random() * 6.283; rr = math.sqrt(rng.random()) * 0.82
    EST.append((C[0] + math.cos(ang) * C[3] * rr, C[1] + math.sin(ang) * C[4] * rr, 0.16 + rng.random() * 0.34, 0.6 + rng.random() * 1.9))
for k in range(12):
    C = SALAO if k < 9 else GRUTA; ang = rng.random() * 6.283; rr = 0.35 + rng.random() * 0.5
    PEDRAS.append((C[0] + math.cos(ang) * C[3] * rr, C[1] + math.sin(ang) * C[4] * rr, 0.35 + rng.random() * 0.75))
# blocos caídos do teto (abatimento): poliedros de faces quebradas, achatados, inclinados e meio enterrados, nos mesmos
# lugares das pedras de antes (que eram bolhas lisas e pareciam bolas). Sorteio próprio: o resto da caverna não muda.
rngB = np.random.default_rng(91); BLOCOS = []
BASE_N = np.array([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], float)
for k_b, (ps, pt, pr) in enumerate(PEDRAS):
    r_ = (0.5 + (pr - 0.35) / 0.75 * 0.6) * (0.75 if k_b >= 9 else 1.0)   # 0,5 a 1,1 m (menores na gruta pequena)
    sc = np.array([1.0 + 0.5 * rngB.random(), max(0.5 / r_, 0.62 + 0.3 * rngB.random()), 0.8 + 0.4 * rngB.random()]) * r_
    ns = list(BASE_N) + [v / np.linalg.norm(v) for v in rngB.normal(size=(5, 3))]
    ns = np.array([n + rngB.normal(size=3) * 0.28 for n in ns]); ns /= np.linalg.norm(ns, axis=1, keepdims=True)
    hs = 0.72 + 0.26 * rngB.random(len(ns))
    yaw = rngB.random() * 6.283; incl = (rngB.random() ** 1.5) * 0.55; eixo_i = rngB.random() * 6.283
    cy_, sy_ = math.cos(yaw), math.sin(yaw); Ry = np.array([[cy_, 0, sy_], [0, 1, 0], [-sy_, 0, cy_]])
    a_ = np.array([math.cos(eixo_i), 0, math.sin(eixo_i)]); K = np.array([[0, -a_[2], a_[1]], [a_[2], 0, -a_[0]], [-a_[1], a_[0], 0]])
    R = (np.eye(3) + math.sin(incl) * K + (1 - math.cos(incl)) * K @ K) @ Ry   # colunas = eixos do bloco no mundo
    cx, cz = L2W(ps, pt); cy = float(chao_cav(np.array(cx), np.array(cz))) + sc[1] * 0.5
    BLOCOS.append((cx, cy, cz, R, sc, ns, hs))
def bloco(px, py, pz, B_):
    """distância com sinal (aproximada) até um bloco: o maior dos planos das faces, no espaço do bloco"""
    cx, cy, cz, R, sc, ns, hs = B_; qx, qy, qz = px - cx, py - cy, pz - cz
    lx = (R[0, 0] * qx + R[1, 0] * qy + R[2, 0] * qz) / sc[0]
    ly = (R[0, 1] * qx + R[1, 1] * qy + R[2, 1] * qz) / sc[1]
    lz = (R[0, 2] * qx + R[1, 2] * qy + R[2, 2] * qz) / sc[2]
    db = None
    for n_, h_ in zip(ns, hs):
        di = n_[0] * lx + n_[1] * ly + n_[2] * lz - h_; db = di if db is None else np.maximum(db, di)
    return db * sc.min()
def ar(px, py, pz):
    """distância com sinal: negativo = ar da caverna"""
    d = None
    for eixo, rs in ((EIXO, (RH, RV)), (LADO, ([2.3, 1.7, 1.55], [1.9, 1.5, 1.45]))):
        for i in range(len(eixo) - 1):
            di = tubo(px, py, pz, eixo[i], eixo[i + 1], (rs[0][i], rs[0][i + 1]), (rs[1][i], rs[1][i + 1]))
            d = di if d is None else smin(d, di, 1.4)
    d = smin(d, bolha(px, py, pz, SALAO), 2.4); d = smin(d, bolha(px, py, pz, GRUTA), 1.6)
    d = d + 0.55 * fbm3(N3a, px * 0.33, py * 0.33, pz * 0.33) + 0.16 * fbm3(N3b, px * 1.25 + 9, py * 1.25, pz * 1.25)
    d = np.maximum(d, chao_cav(px, pz) - py)
    s = (px - EX) * ca + (pz - EZ) * sa; d = np.maximum(d, -(s + 3.0))       # o túnel começa 3 m antes da linha (sai no pátio)
    for (es, et, er, el) in EST:
        cx, cz = L2W(es, et); top = hE + 8.5; dxz = np.hypot(px - cx, pz - cz); k_ = np.clip((top - py) / el, 0, 1)
        d = np.maximum(d, -np.where(py > top - el, dxz - er * (1 - k_) - 0.02, 9))
    asp = 0.035 * fbm3(N3b, px * 2.3 + 11, py * 2.3, pz * 2.3 - 4)          # aspereza das faces (sem desmanchar as arestas)
    for B_ in BLOCOS:
        d = np.maximum(d, -(bloco(px, py, pz, B_) + asp))
    return d
# região da boca (coordenadas s,t): aqui o terreno some e quem desenha é a malha 3D (paredão com saliências)
BOCA_S = (-3.5, 9.0); BOCA_T = 11.0
def na_boca(px, pz, folga=0.0):
    s = (px - EX) * ca + (pz - EZ) * sa; t = -(px - EX) * sa + (pz - EZ) * ca
    return (s > BOCA_S[0] - folga) & (s < BOCA_S[1] + folga) & (np.abs(t) < BOCA_T + folga)
def saliencia(px, py, pz):
    """saliências 3D no paredão (só dentro da região da boca, somem na beirada dela e no chão plano)"""
    s = (px - EX) * ca + (pz - EZ) * sa; t = -(px - EX) * sa + (pz - EZ) * ca
    peso = sm(BOCA_S[0], BOCA_S[0] + 2.5, s) * sm(BOCA_S[1], BOCA_S[1] - 2.5, s) * sm(BOCA_T, BOCA_T - 3.0, np.abs(t))
    peso = peso * sm(hE + 0.6, hE + 2.2, py)     # o pé do paredão e o pátio ficam lisos (dá para andar)
    return peso * (1.1 * fbm3(N3c, px * 0.42, py * 0.42, pz * 0.42) + 0.35 * fbm3(N3b, px * 1.3, py * 1.3 + 4, pz * 1.3))
def rocha(px, py, pz):
    """positivo = fora da rocha; a superfície de fora é o terreno com saliências; dentro dela, o ar da caverna"""
    fora = py - bil(HTOT, px, pz) - saliencia(px, py, pz)
    return np.maximum(fora, -ar(px, py, pz))
VOX = 0.25
cantos = [L2W(s, t) for s in (BOCA_S[0] - 1.5, 44) for t in (-16, 14)]
bx0 = min(c[0] for c in cantos); bx1 = max(c[0] for c in cantos); bz0 = min(c[1] for c in cantos); bz1 = max(c[1] for c in cantos)
by0 = hE - 4.5; by1 = hE + 16.0
gx = np.arange(bx0, bx1 + VOX, VOX); gy = np.arange(by0, by1 + VOX, VOX); gz = np.arange(bz0, bz1 + VOX, VOX)
print('caverna: grade %d x %d x %d (%.1f mi pontos)' % (len(gx), len(gy), len(gz), len(gx) * len(gy) * len(gz) / 1e6), flush=True)
VOL = np.empty((len(gz), len(gy), len(gx)), np.float32)
for k, zz in enumerate(gz):
    PX, PY = np.meshgrid(gx, gy); VOL[k] = rocha(PX, PY, np.full_like(PX, zz))
print('campo pronto (%.1fs)' % (time.time() - t0), flush=True)
verts, faces, _, _ = measure.marching_cubes(VOL, level=0.0, spacing=(VOX, VOX, VOX), allow_degenerate=False)
V = np.stack([verts[:, 2] + bx0, verts[:, 1] + by0, verts[:, 0] + bz0], 1)
# qual pedaço é parede da caverna e qual é a rocha de fora
cen = V[faces].mean(1)
t_fora = cen[:, 1] - bil(HTOT, cen[:, 0], cen[:, 2]) - saliencia(cen[:, 0], cen[:, 1], cen[:, 2]); t_ar = -ar(cen[:, 0], cen[:, 1], cen[:, 2])
parede = t_ar >= t_fora
# células do terreno que somem: as da região da boca (centro da célula dentro)
ccx = xs[:-1] + DX / 2; ccz = zs[:-1] + DZ / 2; CCX, CCZ = np.meshgrid(ccx, ccz)
BUR = na_boca(CCX, CCZ)
def em_buraco(x, z):
    i = np.clip(((np.asarray(x) - X0) / DX).astype(int), 0, NX - 1); j = np.clip(((np.asarray(z) - Z0) / DZ).astype(int), 0, NZ - 1); return BUR[j, i]
BUR_D = ndimage.binary_dilation(BUR, iterations=1)
def perto_buraco(x, z):
    i = np.clip(((np.asarray(x) - X0) / DX).astype(int), 0, NX - 1); j = np.clip(((np.asarray(z) - Z0) / DZ).astype(int), 0, NZ - 1); return BUR_D[j, i]
fica = parede | perto_buraco(cen[:, 0], cen[:, 2])
faces = faces[fica]; parede = parede[fica]
# vértices de fora que ficam onde o terreno continua: um pouco para baixo (o terreno cobre, sem fresta e sem piscar)
usados = np.unique(faces); mapa = -np.ones(len(V), int); mapa[usados] = np.arange(len(usados))
V = V[usados]; faces = mapa[faces]
e = 0.05
def grad(f, P):
    return np.stack([f(P[:, 0] + e, P[:, 1], P[:, 2]) - f(P[:, 0] - e, P[:, 1], P[:, 2]),
                     f(P[:, 0], P[:, 1] + e, P[:, 2]) - f(P[:, 0], P[:, 1] - e, P[:, 2]),
                     f(P[:, 0], P[:, 1], P[:, 2] + e) - f(P[:, 0], P[:, 1], P[:, 2] - e)], 1)
NR = grad(rocha, V); NR /= np.linalg.norm(NR, axis=1, keepdims=True) + 1e-9      # aponta para fora da rocha (para o ar)
eh_parede_v = np.zeros(len(V), bool); eh_parede_v[faces[parede].ravel()] = True
desce = (~eh_parede_v) & (~em_buraco(V[:, 0], V[:, 2]))
V[desce, 1] -= 0.06
n_face = np.cross(V[faces[:, 1]] - V[faces[:, 0]], V[faces[:, 2]] - V[faces[:, 0]])
vira = (n_face * NR[faces].mean(1)).sum(1) < 0
faces[vira] = faces[vira][:, ::-1]
print('malha: %d vértices, %d triângulos, %d da boca por fora (%.1fs)' % (len(V), len(faces), (~parede).sum(), time.time() - t0), flush=True)
# oclusão, cor da rocha, barro no chão e o escuro (a luz entra pela boca)
oc = np.zeros(len(V))
for k_, w_ in ((0.35, 0.35), (0.8, 0.3), (1.6, 0.22), (2.8, 0.13)):
    q = V + NR * k_; dd = rocha(q[:, 0], q[:, 1], q[:, 2]); oc += w_ * np.clip((k_ - dd) / k_, 0, 1)
AO = np.clip(1 - oc * 1.1, 0.25, 1)
mancha = fbm3(N3b, V[:, 0] * 0.18, V[:, 1] * 0.18, V[:, 2] * 0.18) * 0.5 + 0.5
ferro = np.clip((fbm3(N3a, V[:, 0] * 0.4 + 20, V[:, 1] * 0.9, V[:, 2] * 0.4) - 0.25) * 3, 0, 1)
tinta = (0.82 + 0.36 * mancha)[:, None] * np.array([1.0, 0.97, 0.92])[None, :]
tinta = tinta * (1 - 0.4 * ferro[:, None]) + np.array([1.25, 0.8, 0.55])[None, :] * 0.4 * ferro[:, None]
COR = np.clip(tinta * AO[:, None] * 0.8, 0, 1)
chao = np.clip((NR[:, 1] - 0.55) / 0.35, 0, 1); BARRO = chao * (0.55 + 0.45 * mancha)
Sv = (V[:, 0] - EX) * ca + (V[:, 2] - EZ) * sa
ESCURO = np.where(eh_parede_v, 0.96 * sm(-0.5, 13.0, Sv), 0.0)
# ---------------- chão para andar e colisão ----------------
PR = 0.5; pnx = int((bx1 - bx0) / PR) + 1; pnz = int((bz1 - bz0) / PR) + 1
PXg, PZg = np.meshgrid(bx0 + PR * np.arange(pnx), bz0 + PR * np.arange(pnz))
CH = chao_cav(PXg, PZg)
Sg = (PXg - EX) * ca + (PZg - EZ) * sa
livre = (ar(PXg, CH + 0.5, PZg) < -0.12) & (ar(PXg, CH + 1.2, PZg) < -0.12) & (ar(PXg, CH + 1.75, PZg) < -0.05) & (Sg > -1.0)
livre = ndimage.binary_opening(livre, iterations=1)
pegada = ndimage.binary_dilation(livre, iterations=4) & (Sg > -1.0)
PISO = np.where(pegada, CH, np.nan)
# teto: a primeira rocha acima do chão (para a câmera e para saber se está dentro); sem rocha em cima = céu aberto
TETO = np.full(CH.shape, np.nan)
for k in range(70):
    yk = CH + 0.3 + 0.2 * k
    pedra = (rocha(PXg, yk, PZg) < 0) & np.isnan(TETO) & pegada
    TETO[pedra] = yk[pedra]
print('teto: %d de %d células com rocha em cima' % ((~np.isnan(TETO)).sum(), pegada.sum()), flush=True)
print('chão: %d células de %.1f m andáveis (%d com chão na pegada)' % (livre.sum(), PR, pegada.sum()), flush=True)
CR = 0.25; cnx = int((bx1 - bx0) / CR) + 1; cnz = int((bz1 - bz0) / CR) + 1
CXg, CZg = np.meshgrid(bx0 + CR * (np.arange(cnx) + 0.5), bz0 + CR * (np.arange(cnz) + 0.5))
CHc = chao_cav(CXg, CZg); Sc = (CXg - EX) * ca + (CZg - EZ) * sa
liv_c = (ar(CXg, CHc + 0.6, CZg) < -0.05) & (ar(CXg, CHc + 1.4, CZg) < -0.05) & (Sc > -1.0)
# fora do túnel, na região da boca: rocha onde o terreno passa de 1,2 m acima do pátio (o paredão segura)
paredao = na_boca(CXg, CZg) & (bil(HTOT, CXg, CZg) > hE + 1.2) & ~liv_c
perto = ndimage.binary_dilation(liv_c, iterations=3)
bloq = (perto & ~liv_c & (Sc > -1.0)) | (paredao & ndimage.binary_dilation(~paredao, iterations=4))   # Sc > -1.0: o mesmo corte da área livre (antes, -1.2 fechava a entrada com uma faixa de caixas)
def retangulos(G):
    G = G.copy(); out = []
    for j in range(G.shape[0]):
        i = 0
        while i < G.shape[1]:
            if not G[j, i]: i += 1; continue
            i1 = i
            while i1 + 1 < G.shape[1] and G[j, i1 + 1]: i1 += 1
            j1 = j
            while j1 + 1 < G.shape[0] and G[j1 + 1, i:i1 + 1].all(): j1 += 1
            G[j:j1 + 1, i:i1 + 1] = False; out.append((i, j, i1, j1)); i = i1 + 1
    return out
COL = []
for (i, j, i1, j1) in retangulos(bloq):
    x0 = bx0 + CR * i; x1 = bx0 + CR * (i1 + 1); z0 = bz0 + CR * j; z1 = bz0 + CR * (j1 + 1); hs = CHc[j:j1 + 1, i:i1 + 1]
    COL.append([round((x0 + x1) / 2, 3), round((z0 + z1) / 2, 3), round((x1 - x0) / 2, 3), round((z1 - z0) / 2, 3), round(float(np.nanmin(hs)) - 1.0, 2), round(float(np.nanmax(hs)) + 3.0, 2)])
print('colisão: %d caixas; terreno: %d células abertas na boca' % (len(COL), BUR.sum()), flush=True)
# ---------------- conferência ----------------
try:
    from PIL import Image
    gy_, gx_ = np.gradient(HTOT, DZ, DX); luz = np.clip((-gx_ * 0.6 - gy_ * 0.5 + 1) / np.sqrt(gx_ ** 2 + gy_ ** 2 + 1) / 1.35, 0, 1)
    alt = (HTOT - HTOT.min()) / (np.ptp(HTOT) + 1e-6)
    cor = np.stack([0.25 + 0.6 * alt, 0.32 + 0.45 * alt, 0.2 + 0.4 * alt], -1) * luz[..., None]
    cor[:-1, :-1][BUR] = [1, 0.2, 0.1]
    Image.fromarray((np.clip(cor, 0, 1) * 255).astype(np.uint8)).resize((NX * 2 + 2, NZ * 2 + 2), Image.BICUBIC).save(os.path.join(FOTOS, 'serra_relevo.png'))
    pl = np.zeros(livre.shape + (3,)); pl[livre] = [0.85, 0.8, 0.6]
    Image.fromarray((pl * 255).astype(np.uint8)).resize((pnx * 4, pnz * 4), Image.NEAREST).save(os.path.join(FOTOS, 'serra_caverna_planta.png'))
except Exception as ex: print('imagens:', ex)
# ---------------- saída ----------------
b64 = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
OFF16 = np.clip(np.round(M * 100), -32000, 32000).astype(np.int16)
O = np.array([bx0, by0, bz0]); VQ = np.round((V - O) * 1000).astype(np.int64)
if VQ.max() > 65535 or VQ.min() < 0: raise SystemExit('caverna grande demais para 16 bits')
NQ = np.round(NR * 127).astype(np.int8)
CQ = np.round(np.concatenate([COR, BARRO[:, None], ESCURO[:, None]], 1) * 255).astype(np.uint8)
PQ = np.where(np.isnan(PISO), -32768, np.round(np.nan_to_num(PISO) * 100)).astype(np.int16)
TQ = np.where(np.isnan(TETO), -32768, np.round(np.nan_to_num(TETO) * 100)).astype(np.int16)
dados = {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1, 'nx': NX, 'nz': NZ, 'off': b64(OFF16), 'buraco': b64(np.packbits(BUR.ravel().astype(np.uint8))),
         'gruta': {'nome': 'Gruta da Serra Velha', 'boca': [round(EX, 2), round(hE, 2), round(EZ, 2), round(math.atan2(ca, sa), 4)],
                   'dir': [round(ca, 5), round(sa, 5)], 'o': [round(float(v), 3) for v in O], 'v': b64(VQ.astype(np.uint16)), 'n': b64(NQ), 'c': b64(CQ),
                   'i': b64(faces.astype(np.uint32)), 'nv': int(len(V)), 'nt': int(len(faces)),
                   'piso': {'x0': round(bx0, 3), 'z0': round(bz0, 3), 'res': PR, 'nx': pnx, 'nz': pnz, 'h': b64(PQ), 'teto': b64(TQ)},
                   'col': COL, 'caixa': [round(bx0, 2), round(by0, 2), round(bz0, 2), round(bx1, 2), round(by1, 2), round(bz1, 2)]}}
cab = ('/* ================= Serra Velha nova e Gruta da Serra Velha (teste da etapa 1) =================\n'
       '   Gerado por tools/serra_gerar.py (relevo com erosão e caverna esculpida em 3D). Não editar à mão.\n'
       '   off: quanto a serra sobe acima do chão de antes, em cm (grade de ~1 m); buraco: células do terreno abertas na boca;\n'
       '   gruta: malha (mm a partir de o), normais, cor + barro + escuro, índices, chão para andar (cm; -32768 = sem chão) e colisão. */\n')
open(SAIDA, 'w', encoding='utf-8').write(cab + 'const SERRA_DADOS=' + json.dumps(dados, separators=(',', ':')) + ';\n')
print('ok %s (%.1f MB) em %.0fs' % (SAIDA, os.path.getsize(SAIDA) / 2 ** 20, time.time() - t0))
