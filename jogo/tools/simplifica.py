"""Simplificação de malha por colapso de arestas (erro quadrático, Garland & Heckbert), sem rasgar a textura.
Uso como módulo: from simplifica import simplificar_qem
  P, UV, N, I = simplificar_qem(P, UV, N, T, alvo)
Entrada com um vértice por canto (P, UV e N com 3 linhas por triângulo, T os índices) ou malha já indexada.
 · A topologia é a das posições (cantos no mesmo ponto viram um vértice só); UV e normal ficam nos cantos ("cunhas"), então a
   costura da textura não vira borda e a peça simplifica de verdade.
 · Colapso de meia aresta (a vai para b, b não sai do lugar): a UV de b na mesma cunha vem dos triângulos da própria aresta;
   se a tiver uma cunha que a aresta não toca (costura que não segue a aresta), não colapsa.
 · Não colapsa se virar algum triângulo, se deixar a malha não-variedade (condição do elo) ou se tirar ponto de uma borda
   aberta para dentro (borda só anda ao longo dela mesma, com planos extras que seguram o contorno)."""
import heapq
import numpy as np


def _plano(a, b, c):
    n = np.cross(b - a, c - a); l = np.linalg.norm(n)
    if l < 1e-12: return None, 0.0
    n = n / l; return np.array([n[0], n[1], n[2], -float(n @ a)]), l / 2


def _q(p):   # quádrica (10 termos da matriz simétrica 4x4) do plano p
    a, b, c, d = p
    return [a * a, a * b, a * c, a * d, b * b, b * c, b * d, c * c, c * d, d * d]


def _custo(q, x, y, z):
    return (q[0] * x * x + 2 * q[1] * x * y + 2 * q[2] * x * z + 2 * q[3] * x + q[4] * y * y + 2 * q[5] * y * z + 2 * q[6] * y
            + q[7] * z * z + 2 * q[8] * z + q[9])


def simplificar_qem(P, UV, N, T, alvo, peso_borda=8.0, ang_min=0.25):
    P = np.asarray(P, float); UV = np.asarray(UV, float); N = np.asarray(N, float); T = np.asarray(T, np.int64)
    # 1) posições soldadas: topologia; cantos guardam a cunha (u, v, nx, ny, nz)
    k = np.round(P * 1e4).astype(np.int64); _, pid, inv = np.unique(k, axis=0, return_index=True, return_inverse=True); inv = inv.ravel()
    X = P[pid].copy(); F = inv[T]
    ok = (F[:, 0] != F[:, 1]) & (F[:, 1] != F[:, 2]) & (F[:, 0] != F[:, 2]); F = F[ok]; T = T[ok]
    nf = len(F); nv = len(X)
    face = [list(map(int, f)) for f in F]
    cunha = [[(round(float(UV[c, 0]), 6), round(float(UV[c, 1]), 6), round(float(N[c, 0]), 3), round(float(N[c, 1]), 3), round(float(N[c, 2]), 3)) for c in t] for t in T]
    viva = [True] * nf; vfaces = [set() for _ in range(nv)]
    for i, f in enumerate(face):
        for v in f: vfaces[v].add(i)
    # 2) quádricas: plano de cada triângulo (pesado pela área) e planos de borda (perpendiculares, para segurar o contorno)
    Q = [[0.0] * 10 for _ in range(nv)]
    arestas = {}
    for i, f in enumerate(face):
        pl, ar = _plano(X[f[0]], X[f[1]], X[f[2]])
        if pl is None: continue
        q = _q(pl)
        for v in f:
            Qv = Q[v]
            for j in range(10): Qv[j] += q[j] * ar
        for e in ((f[0], f[1]), (f[1], f[2]), (f[2], f[0])):
            arestas.setdefault((min(e), max(e)), []).append(i)
    borda_v = set(); borda_e = set(); be_de = {}
    for (a, b), fs in arestas.items():
        if len(fs) != 1: continue
        borda_e.add((a, b)); borda_v.add(a); borda_v.add(b); be_de.setdefault(a, set()).add((a, b)); be_de.setdefault(b, set()).add((a, b))
        f = face[fs[0]]; pl, ar = _plano(X[f[0]], X[f[1]], X[f[2]])
        if pl is None: continue
        d = X[b] - X[a]; nb = np.cross(d, pl[:3]); l = np.linalg.norm(nb)
        if l < 1e-12: continue
        nb /= l; q = _q([nb[0], nb[1], nb[2], -float(nb @ X[a])]); w = peso_borda * float(d @ d)
        for v in (a, b):
            for j in range(10): Q[v][j] += q[j] * w
    ver = [0] * nv; vivo = [True] * nv
    heap = []

    def viz(v):
        s = set()
        for fi in vfaces[v]: s.update(face[fi])
        s.discard(v); return s

    def empurra(a, b):
        if a in borda_v and ((min(a, b), max(a, b)) not in borda_e): return   # ponto de borda só anda pela borda
        qa, qb = Q[a], Q[b]; q = [qa[j] + qb[j] for j in range(10)]
        heapq.heappush(heap, (_custo(q, *X[b]), ver[a], ver[b], a, b))

    for (a, b) in arestas:
        empurra(a, b); empurra(b, a)
    vivas = nf

    def pode(a, b):
        fa = vfaces[a]; comuns = [fi for fi in fa if b in face[fi]]
        if not comuns: return None
        # condição do elo: os vizinhos em comum são só os opostos dos triângulos da aresta
        opostos = set()
        for fi in comuns:
            for v in face[fi]:
                if v != a and v != b: opostos.add(v)
        if len(viz(a) & viz(b)) != len(opostos): return None
        # cunhas: a cunha de a em cada triângulo da aresta leva à cunha de b no mesmo triângulo
        mapa = {}
        for fi in comuns:
            f = face[fi]; ca = cunha[fi][f.index(a)]; cb = cunha[fi][f.index(b)]
            if ca in mapa and mapa[ca] != cb: return None
            mapa[ca] = cb
        novas = []
        pb = X[b]
        for fi in fa:
            if fi in comuns: continue
            f = face[fi]; j = f.index(a); ca = cunha[fi][j]
            if ca not in mapa: return None
            # não vira o triângulo
            p0 = [X[v] for v in f]; n0 = np.cross(p0[1] - p0[0], p0[2] - p0[0])
            p0[j] = pb; n1 = np.cross(p0[1] - p0[0], p0[2] - p0[0])
            l0 = np.linalg.norm(n0); l1 = np.linalg.norm(n1)
            if l1 < 1e-10 or (l0 > 1e-12 and float(n0 @ n1) < ang_min * l0 * l1): return None
            novas.append((fi, j, mapa[ca]))
        return comuns, novas

    while vivas > alvo and heap:
        c, va, vb, a, b = heapq.heappop(heap)
        if not (vivo[a] and vivo[b]) or va != ver[a] or vb != ver[b]: continue
        r = pode(a, b)
        if r is None: continue
        comuns, novas = r
        for fi in comuns:
            viva[fi] = False; vivas -= 1
            for v in face[fi]: vfaces[v].discard(fi)
        for fi, j, cb in novas:
            face[fi][j] = b; cunha[fi][j] = cb; vfaces[b].add(fi)
        vfaces[a] = set(); vivo[a] = False
        for j in range(10): Q[b][j] += Q[a][j]
        if a in borda_v:
            borda_v.add(b)
            for e in list(be_de.pop(a, ())):
                borda_e.discard(e); o = e[0] if e[1] == a else e[1]
                if o in be_de: be_de[o].discard(e)
                if o != b:
                    ne = (min(o, b), max(o, b)); borda_e.add(ne); be_de.setdefault(o, set()).add(ne); be_de.setdefault(b, set()).add(ne)
        ver[b] += 1
        for v in viz(b):
            empurra(v, b); empurra(b, v)
    # 3) de volta para malha indexada (um vértice por posição + cunha)
    chaves = {}; Po, Uo, No, Io = [], [], [], []
    for fi in range(nf):
        if not viva[fi]: continue
        tri = []
        for j in range(3):
            v = face[fi][j]; cu = cunha[fi][j]; kk = (v, cu)
            if kk not in chaves:
                chaves[kk] = len(Po); Po.append(X[v]); Uo.append(cu[:2]); No.append(cu[2:])
            tri.append(chaves[kk])
        Io.append(tri)
    No = np.array(No, float); No /= np.linalg.norm(No, axis=1, keepdims=True) + 1e-12
    return np.array(Po, float), np.array(Uo, float), No, np.array(Io, np.int64)
