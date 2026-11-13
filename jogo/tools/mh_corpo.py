"""Corpo do MakeHuman (CC0) com as medidas escolhidas: lê a malha base (só o grupo "body", sem as peças de apoio) e soma os
alvos (targets) do jeito do MakeHuman: raça x gênero x idade, músculo x peso, altura e proporções.
Saída: JSON com posições (m), normais, triângulos, UV e o índice original de cada vértice (para os pesos do esqueleto).
Uso: python3 -I tools/mh_corpo.py PASTA_DATA_DO_MAKEHUMAN saida.json [genero idade musculo peso altura proporcoes]
     (valores de 0 a 1, como os do MakeHuman; padrão: homem, 33 anos, em forma, peso médio, um pouco alto)"""
import sys, os, json, math
D = sys.argv[1]; SAI = sys.argv[2]
par = [float(x) for x in sys.argv[3:9]] if len(sys.argv) >= 9 else [1.0, 0.55, 0.65, 0.5, 0.6, 0.65]
genero, idade, musculo, peso, altura, prop = par
RACA = {'caucasian': 0.6, 'african': 0.3, 'asian': 0.1}   # mistura brasileira

def ler_obj(p, grupo='body'):   # grupo=None: todas as faces (peças avulsas, como os olhos)
    V, VT, F, FT, g = [], [], [], [], None
    for ln in open(p, encoding='utf-8', errors='ignore'):
        if ln.startswith('v '): V.append([float(x) for x in ln.split()[1:4]])
        elif ln.startswith('vt '): VT.append([float(x) for x in ln.split()[1:3]])
        elif ln.startswith('g '): g = ln.split()[1].strip()
        elif ln.startswith('f ') and (grupo is None or g == grupo):
            a = [q.split('/') for q in ln.split()[1:]]
            F.append([int(q[0]) - 1 for q in a]); FT.append([int(q[1]) - 1 if len(q) > 1 and q[1] else -1 for q in a])
    return V, VT, F, FT

def ler_proxy(mhclo):
    """Peça encaixada no corpo (formato .mhclo do MakeHuman): cada vértice da peça é a mistura de 3 vértices do corpo
    mais um deslocamento, que cresce e encolhe com o corpo (escala medida entre dois vértices de referência em cada eixo)."""
    pasta = os.path.dirname(mhclo); esc = [None, None, None]; ref = []; obj = mat = None; modo = None
    for ln in open(mhclo, encoding='utf-8', errors='ignore'):
        s = ln.split()
        if not s or s[0].startswith('#'): continue
        if modo == 'verts' and s[0].lstrip('-').isdigit():
            if len(s) == 1: ref.append((int(s[0]), 0, 0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0))
            else:
                d = [float(x) for x in s[6:9]] + [0.0] * (9 - max(6, len(s[:9])))
                ref.append((int(s[0]), int(s[1]), int(s[2]), float(s[3]), float(s[4]), float(s[5]), *d[:3]))
            continue
        k = s[0]
        if k == 'obj_file': obj = os.path.join(pasta, s[1])
        elif k == 'material': mat = os.path.normpath(os.path.join(pasta, s[1]))
        elif k in ('x_scale', 'y_scale', 'z_scale'): esc['xyz'.index(k[0])] = (int(s[1]), int(s[2]), float(s[3]))
        else: modo = k
    return obj, mat, esc, ref

def encaixar(P, mhclo):
    obj, mat, esc, ref = ler_proxy(mhclo)
    s = [abs(P[e[0]][n] - P[e[1]][n]) / e[2] if e else 1.0 for n, e in enumerate(esc)]
    pos = [[w1 * P[v1][n] + w2 * P[v2][n] + w3 * P[v3][n] + s[n] * (d1, d2, d3)[n] for n in range(3)]
           for v1, v2, v3, w1, w2, w3, d1, d2, d3 in ref]
    V, VT, F, FT = ler_obj(obj, None)
    if len(V) != len(pos): raise SystemExit(f'{mhclo}: {len(V)} vértices no .obj e {len(pos)} no encaixe')
    tex = None
    if mat and os.path.exists(mat):
        for ln in open(mat, encoding='utf-8', errors='ignore'):
            if ln.startswith('diffuseTexture'): tex = os.path.join(os.path.dirname(mat), ln.split()[1])
    return pos, VT, F, FT, tex

def ler_alvo(p):
    out = []
    for ln in open(p, encoding='utf-8', errors='ignore'):
        if not ln.strip() or ln.startswith('#'): continue
        s = ln.split(); out.append((int(s[0]), float(s[1]), float(s[2]), float(s[3])))
    return out

def tres(v):   # min / average / max (0..1, com 0,5 = médio)
    if v < 0.5: mn = max(0.0, 1 - v * 2); return {'min': mn, 'average': 1 - mn, 'max': 0.0}
    mx = max(0.0, v * 2 - 1); return {'min': 0.0, 'average': 1 - mx, 'max': mx}
def idades(a):
    if a < 0.5:
        young = max(0.0, (a - 0.1875) * 3.2); baby = max(0.0, 1 - a * 5.333); child = max(0.0, min(1.0, 5.333 * a) - young)
        return {'baby': baby, 'child': child, 'young': young, 'old': 0.0}
    old = max(0.0, a * 2 - 1); return {'baby': 0, 'child': 0, 'young': 1 - old, 'old': old}

V, VT, F, FT = ler_obj(os.path.join(D, '3dobjs', 'base.obj'))
P = [v[:] for v in V]
gen = {'male': genero, 'female': 1 - genero}; ida = idades(idade); mus = tres(musculo); pes = tres(peso); alt = tres(altura)
pro = {'ideal': max(0.0, prop * 2 - 1), 'uncommon': max(0.0, 1 - prop * 2)}
usados = []
def soma(rel, w):
    if w <= 1e-4: return
    p = os.path.join(D, 'targets', 'macrodetails', rel)
    if not os.path.exists(p): return
    for i, dx, dy, dz in ler_alvo(p):
        P[i][0] += dx * w; P[i][1] += dy * w; P[i][2] += dz * w
    usados.append([rel, round(w, 4)])
for g, wg in gen.items():
    for a, wa in ida.items():
        for r, wr in RACA.items(): soma(f'{r}-{g}-{a}.target', wr * wg * wa)
        for m, wm in mus.items():
            for q, wq in pes.items():
                w = wg * wa * wm * wq
                soma(f'universal-{g}-{a}-{m}muscle-{q}weight.target', w)
                for h in ('min', 'max'): soma(f'height/{g}-{a}-{m}muscle-{q}weight-{h}height.target', w * alt[h])
                for k, wk in pro.items(): soma(f'proportions/{g}-{a}-{m}muscle-{q}weight-{k}proportions.target', w * wk)
# só os vértices do corpo, reindexados; quadrados viram dois triângulos; unidade do MakeHuman (decímetro) -> metro
usa = sorted({i for f in F for i in f}); novo = {o: n for n, o in enumerate(usa)}
pos = [[P[o][0] / 10, P[o][1] / 10, P[o][2] / 10] for o in usa]
miny = min(p[1] for p in pos)
for p in pos: p[1] -= miny     # pés no chão (y = 0)
def triangulos(F, FT, idx=lambda i: i):
    tri, uvi = [], []
    for f, ft in zip(F, FT):
        for k in range(1, len(f) - 1):
            tri.append([idx(f[0]), idx(f[k]), idx(f[k + 1])]); uvi.append([ft[0], ft[k], ft[k + 1]])
    return tri, uvi
def normais(pos, tri):
    nor = [[0.0, 0.0, 0.0] for _ in pos]
    for a, b, c in tri:
        pa, pb, pc = pos[a], pos[b], pos[c]
        u = [pb[i] - pa[i] for i in range(3)]; v = [pc[i] - pa[i] for i in range(3)]
        n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
        for q in (a, b, c):
            for i in range(3): nor[q][i] += n[i]
    for n in nor:
        l = math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2) or 1; n[0] /= l; n[1] /= l; n[2] /= l
    return nor
def malha(pos, nor, tri, uvi, VT):
    return {'pos': [round(x, 5) for p in pos for x in p], 'nor': [round(x, 4) for n in nor for x in n], 'tri': [i for t in tri for i in t],
            'uv': [round(x, 5) for t in uvi for i in t for x in (VT[i] if i >= 0 else [0, 0])]}
tri, uvi = triangulos(F, FT, lambda i: novo[i])
nor = normais(pos, tri)
alt_m = max(p[1] for p in pos)
saida = {**malha(pos, nor, tri, uvi, VT), 'orig': usa, 'altura_m': round(alt_m, 3),
         'parametros': dict(zip(['genero', 'idade', 'musculo', 'peso', 'altura', 'proporcoes'], par)), 'raca': RACA, 'alvos': usados}
# olhos: a peça "high-poly" do MakeHuman, encaixada nas órbitas do corpo já com as medidas
olho = os.path.join(D, 'eyes', 'high-poly', 'high-poly.mhclo')
if os.path.exists(olho):
    opos, OVT, OF, OFT, otex = encaixar(P, olho)
    opos = [[p[0] / 10, p[1] / 10 - miny, p[2] / 10] for p in opos]
    otri, ouvi = triangulos(OF, OFT)
    saida['olhos'] = {**malha(opos, normais(opos, otri), otri, ouvi, OVT), 'textura': os.path.relpath(otex, D) if otex else None}
json.dump(saida, open(SAI, 'w'))
print(json.dumps({'vertices': len(pos), 'triangulos': len(tri), 'altura_m': round(alt_m, 3), 'alvos': len(usados),
                  'olhos': len(saida['olhos']['tri']) // 3 if 'olhos' in saida else 0}))
