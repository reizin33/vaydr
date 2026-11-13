"""Monta o sobrevivente (male_survivor1, glTF de malha única) para o jogo, no mesmo formato do Akai (SKD de 21b_mixamo.js):
- esqueleto de 22 ossos com os eixos do Mixamo (as rotações de repouso vêm de um FBX do Mixamo), com as juntas no lugar do corpo
  dele (medidas na malha, conferidas em foto);
- pose de ligação = a pose A em que a malha veio (braços a 45 graus); pose de repouso = pose T (braços abertos), a das animações:
  com delta zero o personagem fica em T, igual ao Mixamo, e as animações do Mixamo entram sem ajuste;
- pesos da pele por difusão de calor na malha (como o "bone heat" do Pinocchio): cada vértice puxa o osso mais perto que ele
  "enxerga" por dentro do corpo (o lado do peito não puxa o braço) e o calor espalha os pesos nas juntas; até 4 ossos por vértice;
- textura de cor 2K, relevo (normal) 2K e rugosidade 1K em JPEG; clipes novos convertidos de FBX (tools/mixamo_clipes.py).
Uso: python3 tools/sobrevivente_rig.py male_survivor1.zip pasta_dos_fbx [pasta_das_previas]"""
import sys, os, io, json, base64, math, time
import numpy as np
from PIL import Image
from scipy import sparse
from scipy.sparse.linalg import factorized
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lugares_banco import ler_gltf
from fbx_ler import qmul, qconj, qrot
import mixamo_clipes as MC

OSSOS = MC.OSSOS; PAI = MC.PAI; IX = {o: i for i, o in enumerate(OSSOS)}
ALTURA = 1.82
# juntas na pose A da malha (m; +x = lado esquerdo do personagem, +z = frente), medidas em foto (tools: juntas.png)
JA = {'Hips': (0, 0.98, -0.03), 'Spine': (0, 1.07, -0.035), 'Spine1': (0, 1.17, -0.035), 'Spine2': (0, 1.29, -0.03), 'Neck': (0, 1.49, -0.045),
      'Head': (0, 1.60, -0.03), 'Topo': (0, 1.82, -0.02),
      'LeftShoulder': (0.045, 1.43, -0.025), 'LeftArm': (0.20, 1.425, -0.045), 'LeftForeArm': (0.375, 1.195, -0.05), 'LeftHand': (0.53, 1.01, 0.01),
      'LeftDedo': (0.585, 0.885, 0.05), 'LeftUpLeg': (0.095, 0.915, -0.025), 'LeftLeg': (0.125, 0.515, -0.035), 'LeftFoot': (0.16, 0.10, -0.07),
      'LeftToeBase': (0.17, 0.025, 0.085), 'LeftPonta': (0.175, 0.02, 0.19)}
for k in list(JA):
    if k.startswith('Left'): x, y, z = JA[k]; JA['Right' + k[4:]] = (-x, y, z)
JA = {k: np.array(v, float) for k, v in JA.items()}
FIM = {'Head': 'Topo', 'LeftHand': 'LeftDedo', 'RightHand': 'RightDedo', 'LeftToeBase': 'LeftPonta', 'RightToeBase': 'RightPonta'}
FILHO = {'Hips': 'Spine', 'Spine': 'Spine1', 'Spine1': 'Spine2', 'Spine2': 'Neck', 'Neck': 'Head', 'LeftShoulder': 'LeftArm', 'RightShoulder': 'RightArm',
         'LeftArm': 'LeftForeArm', 'LeftForeArm': 'LeftHand', 'RightArm': 'RightForeArm', 'RightForeArm': 'RightHand',
         'LeftUpLeg': 'LeftLeg', 'LeftLeg': 'LeftFoot', 'LeftFoot': 'LeftToeBase', 'RightUpLeg': 'RightLeg', 'RightLeg': 'RightFoot', 'RightFoot': 'RightToeBase'}
FILHO.update(FIM)

def q_de_para(a, b):
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b); d = float(np.dot(a, b)); c = np.cross(a, b); w = 1 + d
    if w < 1e-8: return np.array([0, 0, 1.0, 0])
    q = np.array([c[0], c[1], c[2], w]); return q / np.linalg.norm(q)
def mat_q(q, p):
    x, y, z, w = q; M = np.eye(4)
    M[:3, :3] = [[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                 [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                 [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]]
    M[:3, 3] = p; return M

# afinamento por osso: (escala de lado x, escala de frente z, escala ao longo) para tronco; (escala em volta do eixo, ao longo) para membros
AF_TRONCO = {'Hips': (0.96, 0.97, 1.0), 'Spine': (0.92, 0.95, 1.0), 'Spine1': (0.87, 0.92, 1.0), 'Spine2': (0.83, 0.90, 1.0), 'Neck': (0.83, 0.90, 1.0), 'Head': (1.0, 1.0, 1.0)}
AF_MEMBRO = {'Shoulder': (0.82, 1.0), 'Arm': (0.73, 1.0), 'ForeArm': (0.81, 1.0), 'Hand': (0.93, 1.0), 'UpLeg': (0.94, 1.06), 'Leg': (0.96, 1.06), 'Foot': (1.0, 1.0), 'ToeBase': (1.0, 1.0)}
OMBRO_X = 0.87          # o ombro chega um pouco para dentro com o peito mais estreito
def afinar(Pw, ordem, w4, pA):
    """deforma a malha (pose A) osso a osso, misturando pelos pesos da pele: cada osso escala o que é dele em volta do próprio
    eixo e leva junto o que vem depois (ombro para dentro, pernas mais compridas); devolve a malha e as juntas novas"""
    c = {k: v.copy() for k, v in pA.items()}; c2 = {k: v.copy() for k, v in pA.items()}
    for L in ('Left', 'Right'):
        d_ombro = np.array([pA[L + 'Arm'][0] * (OMBRO_X - 1), 0, 0])
        c2[L + 'Shoulder'] = pA[L + 'Shoulder'] + d_ombro * 0.3
        for o in ('Arm', 'ForeArm', 'Hand', 'Dedo'): c2[L + o] = pA[L + o] + d_ombro
        k1 = AF_MEMBRO['UpLeg'][1]; k2 = AF_MEMBRO['Leg'][1]
        c2[L + 'Leg'] = pA[L + 'UpLeg'] + (pA[L + 'Leg'] - pA[L + 'UpLeg']) * k1
        c2[L + 'Foot'] = c2[L + 'Leg'] + (pA[L + 'Foot'] - pA[L + 'Leg']) * k2
        for o in ('ToeBase', 'Ponta'): c2[L + o] = c2[L + 'Foot'] + (pA[L + o] - pA[L + 'Foot'])
    T = np.zeros((len(Pw), 22, 3))
    for b, o in enumerate(OSSOS):
        v = Pw - c[o]
        if o in AF_TRONCO:
            sx, sz, sa = AF_TRONCO[o]; T[:, b] = c2[o] + v * np.array([sx, sa, sz])
        else:
            tipo = o[4:] if o.startswith('Left') else o[5:]; sp, sa = AF_MEMBRO[tipo]
            d = c[FILHO[o]] - c[o]; d /= np.linalg.norm(d); a = v @ d; pp = v - a[:, None] * d
            T[:, b] = c2[o] + a[:, None] * sa * d + pp * sp
    out = np.zeros_like(Pw)
    for k in range(4): out += w4[:, k:k + 1] * T[np.arange(len(Pw)), ordem[:, k]]
    return out, c2

def montar(zip_gltf, fbx_ref):
    t0 = time.time()
    z, partes = ler_gltf(zip_gltf); pt = partes[0]
    P = pt['P'].astype(np.float64).copy(); s = ALTURA / (P[:, 1].max() - P[:, 1].min()); P = (P - [0, P[:, 1].min(), 0]) * s
    U = pt['UV'].astype(np.float64); I = pt['I'].astype(np.int64)
    img = Image.open(io.BytesIO(z.read(pt['img']))).convert('RGB')
    _, nm, esc = MC.carregar(fbx_ref); WT, _tb = MC.repouso(nm, esc)          # rotações de repouso no espaço do personagem
    pA = {k: v.copy() for k, v in JA.items()}
    # ---------- malha soldada (as costuras de UV dividem vértices; os pesos e as normais têm que ser iguais dos dois lados) ----------
    chave = np.round(P, 5); uq, inv_idx = np.unique(chave, axis=0, return_inverse=True); inv_idx = inv_idx.ravel(); n = len(uq)
    Pw = np.zeros((n, 3)); np.add.at(Pw, inv_idx, P); Pw /= np.bincount(inv_idx, minlength=n)[:, None]
    F = inv_idx[I]; F = F[(F[:, 0] != F[:, 1]) & (F[:, 1] != F[:, 2]) & (F[:, 0] != F[:, 2])]
    fn = np.cross(Pw[F[:, 1]] - Pw[F[:, 0]], Pw[F[:, 2]] - Pw[F[:, 0]])
    Nw = np.zeros((n, 3))
    for k in range(3): np.add.at(Nw, F[:, k], fn)
    Nw /= np.linalg.norm(Nw, axis=1, keepdims=True) + 1e-12
    # dentro/fora (número de voltas) numa grade de 2 cm, para o teste de "enxergar o osso por dentro do corpo"
    G0 = Pw.min(0) - 0.03; G1 = Pw.max(0) + 0.03; gs = 0.02
    gx = np.arange(G0[0], G1[0], gs); gy = np.arange(G0[1], G1[1], gs); gz = np.arange(G0[2], G1[2], gs)
    A_ = Pw[F[:, 0]]; B_ = Pw[F[:, 1]]; C_ = Pw[F[:, 2]]
    def voltas(Q):
        out = np.zeros(len(Q))
        for i0 in range(0, len(Q), 512):
            q = Q[i0:i0 + 512][:, None, :]; a = A_[None] - q; b = B_[None] - q; c = C_[None] - q
            la = np.linalg.norm(a, axis=2); lb = np.linalg.norm(b, axis=2); lc = np.linalg.norm(c, axis=2)
            num = np.einsum('ijk,ijk->ij', a, np.cross(b, c))
            den = la * lb * lc + np.einsum('ijk,ijk->ij', a, b) * lc + np.einsum('ijk,ijk->ij', b, c) * la + np.einsum('ijk,ijk->ij', c, a) * lb
            out[i0:i0 + 512] = np.arctan2(num, den).sum(1) / (2 * np.pi)
        return out
    GX, GY, GZ = np.meshgrid(gx, gy, gz, indexing='ij'); Q = np.stack([GX.ravel(), GY.ravel(), GZ.ravel()], 1)
    dentro = (np.abs(voltas(Q)) > 0.5).reshape(GX.shape)
    print('malha: %d vértices (%d soldados), %d triângulos; dentro: %.0f%% da grade (%.0fs)' % (len(P), n, len(F), 100 * dentro.mean(), time.time() - t0), flush=True)
    def dentro_em(X):
        i = np.clip(np.round((X - G0) / gs).astype(int), 0, np.array(dentro.shape) - 1); return dentro[i[..., 0], i[..., 1], i[..., 2]]
    # ---------- segmentos dos ossos (pose A) ----------
    SEG = {o: [(pA[o], pA[FILHO[o]])] for o in OSSOS if o in FILHO}
    SEG['Hips'] = [(pA['Hips'], pA['Spine']), (pA['LeftUpLeg'], pA['RightUpLeg'])]
    def dist_seg(X, a, b):
        ab = b - a; t = np.clip(((X - a) @ ab) / (ab @ ab), 0, 1); proj = a + t[:, None] * ab; return np.linalg.norm(X - proj, axis=1), proj
    D = np.full((n, 22), 9.0); PRJ = np.zeros((n, 22, 3))
    for b, o in enumerate(OSSOS):
        for (a, c) in SEG[o]:
            d, pr = dist_seg(Pw, a, c); m = d < D[:, b]; D[m, b] = d[m]; PRJ[m, b] = pr[m]
    # lado: osso de um lado não pega vértice do outro; cabeça e barba só na cabeça e no pescoço
    lado = np.array([1 if o.startswith('Left') else -1 if o.startswith('Right') else 0 for o in OSSOS])
    proib = (lado[None, :] * np.sign(Pw[:, 0])[:, None] < 0) & (np.abs(Pw[:, 0])[:, None] > 0.012)
    cab = Pw[:, 1] > 1.515; proib[cab] = True; proib[cab, IX['Head']] = False; proib[cab, IX['Neck']] = False
    # enxerga o osso por dentro do corpo? (amostras no segmento do vértice, 1 cm para dentro, até o ponto mais perto do osso)
    vis = np.ones((n, 22), bool); base_ = Pw - Nw * 0.01
    for b in range(22):
        ok = np.ones(n, bool)
        for k in np.linspace(0.15, 0.95, 7): ok &= dentro_em(base_ + (PRJ[:, b] - base_) * k)
        vis[:, b] = ok
    Dv = np.where(vis & ~proib, D, 9.0); semvis = Dv.min(1) > 8
    Dv[semvis] = np.where(proib[semvis], 9.0, D[semvis])
    perto = Dv.argmin(1); dmin = np.maximum(Dv[np.arange(n), perto], 0.012)
    print('pesos: %d vértices sem osso visível (usam o mais perto do lado certo)' % semvis.sum(), flush=True)
    # ---------- difusão de calor: (L + H) w = H p ----------
    E = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]); E = np.unique(np.sort(E, 1), axis=0)
    le = np.linalg.norm(Pw[E[:, 0]] - Pw[E[:, 1]], axis=1); we = 1.0 / np.maximum(le, 0.004) ** 2
    Wm = sparse.coo_matrix((np.concatenate([we, we]), (np.concatenate([E[:, 0], E[:, 1]]), np.concatenate([E[:, 1], E[:, 0]]))), shape=(n, n)).tocsr()
    Lp = sparse.diags(np.asarray(Wm.sum(1)).ravel()) - Wm
    Hd = 1.0 / dmin ** 2 * 1.0
    solve = factorized((Lp + sparse.diags(Hd)).tocsc())
    Wt = np.zeros((n, 22))
    for b in range(22):
        pb = (perto == b).astype(float)
        if pb.any(): Wt[:, b] = solve(Hd * pb)
    Wt = np.clip(Wt, 0, None); Wt[proib] = 0
    # até 4 ossos, peso mínimo 2%
    ordem = np.argsort(-Wt, 1)[:, :4]; w4 = np.take_along_axis(Wt, ordem, 1); w4[w4 < 0.02] = 0
    w4 /= w4.sum(1, keepdims=True) + 1e-12
    # ---------- corpo de sobrevivente comum (o dono achou "forte demais" e "grande demais"): escala por osso na pose A ----------
    Pw, pA = afinar(Pw, ordem, w4, pA)
    dy = -Pw[:, 1].min(); Pw[:, 1] += dy
    for k in pA: pA[k] = pA[k] + np.array([0, dy, 0])
    P = Pw[inv_idx].copy(); altura = float(Pw[:, 1].max())
    fn = np.cross(Pw[F[:, 1]] - Pw[F[:, 0]], Pw[F[:, 2]] - Pw[F[:, 0]]); Nw = np.zeros((n, 3))
    for k in range(3): np.add.at(Nw, F[:, k], fn)
    Nw /= np.linalg.norm(Nw, axis=1, keepdims=True) + 1e-12
    print('corpo afinado: altura %.3f m, ombros %.3f m, quadril %.3f m' % (altura, 2 * pA['LeftArm'][0], pA['Hips'][1]), flush=True)
    # ---------- esqueleto: repouso T com os eixos do Mixamo ----------
    pT = {k: v.copy() for k, v in pA.items()}
    for L, sx in (('Left', 1), ('Right', -1)):
        cad = [L + 'Arm', L + 'ForeArm', L + 'Hand', L + 'Dedo']
        for a, b in zip(cad[:-1], cad[1:]): pT[b] = pT[a] + np.array([sx * np.linalg.norm(pA[b] - pA[a]), 0, 0])
    tb = np.zeros((22, 3))
    for b, o in enumerate(OSSOS):
        p = PAI[b]; tb[b] = pT[o] if p < 0 else qrot(qconj(WT[p]), pT[o] - pT[OSSOS[p]])
    # ---------- pose de ligação (A): braço, antebraço e mão girados da direção T para a da malha ----------
    WA = WT.copy()
    for o in ('LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand'):
        f = FILHO[o]; b = IX[o]; WA[b] = qmul(q_de_para(pT[f] - pT[o], pA[f] - pA[o]), WT[b])
    GA = [mat_q(WA[b], pA[o]) for b, o in enumerate(OSSOS)]; INV = [np.linalg.inv(g) for g in GA]
    # ---------- vértices finais (com costuras) ----------
    J4 = ordem[inv_idx]; W4 = w4[inv_idx]; NV = Nw[inv_idx]
    W8 = np.floor(W4 * 255).astype(int); falta = 255 - W8.sum(1); W8[np.arange(len(W8)), W4.argmax(1)] += falta
    vb = bytearray(); nn = np.clip(np.round(NV * 127), -127, 127).astype(np.int8); uv16 = np.clip(np.round(U * 65535), 0, 65535).astype(np.uint16)
    for i in range(len(P)):
        vb += np.asarray(P[i], '<f4').tobytes() + nn[i].tobytes() + b'\x00' + uv16[i].astype('<u2').tobytes() + J4[i].astype(np.uint8).tobytes() + W8[i].astype(np.uint8).tobytes()
    ib = I.astype('<u2').tobytes()
    bio = io.BytesIO(); img.save(bio, 'JPEG', quality=86, optimize=True)                                  # cor em 2K
    nimg = Image.open(io.BytesIO(z.read(pt['img'].replace('baseColor', 'normal')))).convert('RGB')         # relevo (normal no espaço da textura)
    bion = io.BytesIO(); nimg.save(bion, 'JPEG', quality=90, optimize=True)
    rimg = Image.open(io.BytesIO(z.read(pt['img'].replace('baseColor.jpeg', 'metallicRoughness.png')))).convert('RGB').split()[1].resize((1024, 1024), Image.LANCZOS)
    bior = io.BytesIO(); rimg.save(bior, 'JPEG', quality=88, optimize=True)                                   # rugosidade (canal verde)
    invf = np.concatenate([M.T.ravel() for M in INV]).astype('<f4')
    SKDs = {'ossos': OSSOS, 'pai': PAI, 't': [round(float(v), 5) for v in tb.ravel()], 'qb': [round(float(v), 6) for v in WT.ravel()],
            'inv': base64.b64encode(invf.tobytes()).decode(), 'vb': base64.b64encode(bytes(vb)).decode(), 'ib': base64.b64encode(ib).decode(),
            'nv': int(len(P)), 'ni': int(I.size), 'i32': False, 'tex': 'data:image/jpeg;base64,' + base64.b64encode(bio.getvalue()).decode(), 'mask': None,
            'nrm': 'data:image/jpeg;base64,' + base64.b64encode(bion.getvalue()).decode(), 'rug': 'data:image/jpeg;base64,' + base64.b64encode(bior.getvalue()).decode(),
            'altura': round(altura, 4), 'quadril': round(float(pA['Hips'][1]), 4), 'maoA': [round(float(v), 4) for v in list(pA['LeftHand']) + list(pA['RightHand'])]}
    print('sobrevivente pronto: vb %.0f KB, cor %.0f KB, relevo %.0f KB, rugosidade %.0f KB (%.0fs)' % (len(vb) / 1024, len(bio.getvalue()) / 1024, len(bion.getvalue()) / 1024, len(bior.getvalue()) / 1024, time.time() - t0), flush=True)
    rig = {'P': P, 'U': U, 'I': I, 'img': img, 'qb': WT, 'tb': tb, 'inv': INV, 'J4': J4, 'W4': W4, 'quadril': float(pA['Hips'][1]), 'pA': pA, 'pT': pT}
    return SKDs, rig

def pose(rig, Dq, hy=0.0):
    """matrizes da pele como o jogo faz (skPose): Q = D * Qrepouso (mundo), filho = pai + Q_pai * t; hy = quadril relativo
    (m, escala do Akai)"""
    qb, tb = rig['qb'], rig['tb']; W = np.zeros((22, 4)); Pp = np.zeros((22, 3)); S = []
    for b in range(22):
        W[b] = qmul(Dq[b], qb[b]); p = PAI[b]
        if p < 0: Pp[b] = [0, rig['quadril'] + hy * rig['quadril'] / MC.QUADRIL_AKAI, 0]
        else: Pp[b] = Pp[p] + qrot(W[p], tb[b])
        S.append(mat_q(W[b], Pp[b]) @ rig['inv'][b])
    return np.array(S), Pp

def pele(rig, S):
    P = rig['P']; Ph = np.concatenate([P, np.ones((len(P), 1))], 1); out = np.zeros((len(P), 3))
    for k in range(4):
        M = S[rig['J4'][:, k]]; out += rig['W4'][:, k:k + 1] * np.einsum('nij,nj->ni', M, Ph)[:, :3]
    return out

if __name__ == '__main__':
    SKDs, rig = montar(sys.argv[1], os.path.join(sys.argv[2], 'Idle.fbx'))
