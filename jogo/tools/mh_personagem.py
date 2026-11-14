"""Personagem "Personalizado" do MakeHuman (CC0) para o jogo (etapa do personagem, aprovada pelo dono em 13/11/2026).
Dois corpos (homem e mulher) com o esqueleto de 22 ossos no formato do sobrevivente (SKD de 21b_mixamo.js: pose de ligação =
a pose A do MakeHuman, repouso = pose T do Mixamo) e as peças encaixadas em cada corpo: cabelo, barba, sobrancelha, cílios
e olhos. Peles de corpo inteiro do MakeHuman (sem as que têm nudez: "with_genitals" e as "special_suit").
14/11: o personagem começa sem roupa (pedido do dono: as roupas são as do jogo, vestidas por cima): o homem de cueca e a
mulher de biquíni, pintados na própria pele (máscara no espaço da textura, tirada das regiões do corpo); sem roupa e sapato
do MakeHuman. Cabelo "Curto grisalho" (o curto castanho recolorido) para o Sobrevivente pronto.
- Corpo: a malha base do MakeHuman (grupo "body") com os alvos de gênero, idade, músculo, peso, altura e proporções.
- Juntas: as do esqueleto padrão do MakeHuman (centro dos vértices de apoio de cada junta), levadas para os 22 ossos.
- Pele (pesos): os do MakeHuman (default_weights.mhw, 163 ossos) somados nos 22 ossos; as peças herdam os pesos do corpo
  pelo próprio encaixe (cada vértice da peça é a mistura de 3 vértices do corpo base).
- Peças que cobrem o corpo escondem os triângulos que ficam por baixo (delete_verts do MakeHuman), para a pele não furar.
- Vértice de 28 bytes como o do sobrevivente: posição f32×3, normal i8×3, UV u16×2, ossos u8×4, pesos u8×4.
Saída: src/21m_mh_dados.js (const MHP). Uso:
  python3 -I tools/mh_personagem.py DATA_MH sistema.zip partes.zip pasta_fbx saida.js [so_homem]"""
import sys, os, io, json, base64, math, zipfile, time
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mixamo_clipes as MC
from fbx_ler import qmul, qconj, qrot

D, ZSIS, ZPAR, FBXD, SAI = sys.argv[1:6]
SO_HOMEM = len(sys.argv) > 6 and sys.argv[6] == 'so_homem'
OSSOS = MC.OSSOS; PAI = MC.PAI; IX = {o: i for i, o in enumerate(OSSOS)}
T0 = time.time()
def log(*a): print('[%5.0fs]' % (time.time() - T0), *a, flush=True)

# ---------------------------------------------------------------- o que entra (nome no jogo, arquivo)
CORPOS = {'homem': dict(genero=1.0, idade=0.55, musculo=0.6, peso=0.5, altura=0.55, prop=0.6),
          'mulher': dict(genero=0.0, idade=0.55, musculo=0.5, peso=0.5, altura=0.5, prop=0.6)}
RACA = {'caucasian': 0.6, 'african': 0.3, 'asian': 0.1}   # mistura brasileira (o rosto)
PELES = [  # (id, nome, corpo, pasta no zip): o nome diz o que a miniatura (o rosto) mostra
    ('h_jovem_clara', 'Jovem, pele clara', 'homem', 'skins/young_caucasian_male'), ('h_jovem_asia', 'Jovem, traços asiáticos', 'homem', 'skins/young_asian_male'),
    ('h_jovem_negra', 'Jovem, pele negra', 'homem', 'skins/young_african_male'), ('h_adulto_clara', 'Adulto, pele clara', 'homem', 'skins/middleage_caucasian_male'),
    ('h_adulto_asia', 'Adulto, traços asiáticos', 'homem', 'skins/middleage_asian_male'), ('h_adulto_negra', 'Adulto, pele negra', 'homem', 'skins/middleage_african_male'),
    ('h_velho_clara', 'Mais velho, pele clara', 'homem', 'skins/old_caucasian_male'), ('h_velho_negra', 'Mais velho, pele negra', 'homem', 'skins/old_african_male'),
    ('m_jovem_clara', 'Jovem, pele clara', 'mulher', 'skins/young_caucasian_female'), ('m_jovem_asia', 'Jovem, traços asiáticos', 'mulher', 'skins/young_asian_female'),
    ('m_jovem_negra', 'Jovem, pele negra', 'mulher', 'skins/young_african_female'), ('m_adulta_clara', 'Adulta, pele clara', 'mulher', 'skins/middleage_caucasian_female'),
    ('m_adulta_asia', 'Adulta, traços asiáticos', 'mulher', 'skins/middleage_asian_female'), ('m_adulta_negra', 'Adulta, pele negra', 'mulher', 'skins/middleage_african_female'),
    ('m_velha_clara', 'Mais velha, pele clara', 'mulher', 'skins/old_caucasian_female'), ('m_velha_negra', 'Mais velha, pele negra', 'mulher', 'skins/old_african_female')]
# peças: (id, nome, categoria, corpos, zip, pasta, lado da textura)
PECAS = [
    ('curto_castanho', 'Curto castanho', 'cabelo', ['homem', 'mulher'], 'S', 'hair/short02', 1024),
    ('curto_grisalho', 'Curto grisalho', 'cabelo', ['homem', 'mulher'], 'S', 'hair/short02', 1024),
    ('curto_escuro', 'Curto escuro', 'cabelo', ['homem', 'mulher'], 'S', 'hair/short01', 1024),
    ('penteado', 'Curto penteado', 'cabelo', ['homem', 'mulher'], 'S', 'hair/short04', 512),
    ('topete', 'Topete', 'cabelo', ['homem', 'mulher'], 'S', 'hair/short03', 1024),
    ('afro', 'Black power', 'cabelo', ['homem', 'mulher'], 'S', 'hair/afro01', 1024),
    ('chanel', 'Chanel', 'cabelo', ['homem', 'mulher'], 'S', 'hair/bob01', 1024),
    ('chanel_grisalho', 'Chanel grisalho', 'cabelo', ['homem', 'mulher'], 'S', 'hair/bob02', 1024),
    ('longo', 'Longo', 'cabelo', ['homem', 'mulher'], 'S', 'hair/long01', 1024),
    ('rabo', 'Rabo de cavalo', 'cabelo', ['homem', 'mulher'], 'S', 'hair/ponytail01', 1024),
    ('tranca', 'Trança', 'cabelo', ['homem', 'mulher'], 'S', 'hair/braid01', 1024),
    ('barba_cheia', 'Barba cheia', 'barba', ['homem'], 'P', 'clothes/wdg_scruffy_beard', 512),
    ('barba_branca', 'Barba branca', 'barba', ['homem'], 'P', 'clothes/grinsegold_beard_sigmund_wip', 512),
    ('bigode', 'Bigode', 'barba', ['homem'], 'P', 'clothes/rehmanpolanski_moustache_viking', 512),
    ('barba_longa', 'Barba longa', 'barba', ['homem'], 'P', 'clothes/rehmanpolanski_beard_viking', 1024),
    ('cavanhaque', 'Cavanhaque fino', 'barba', ['homem'], 'P', 'clothes/culturalibre_faun_beard', 1024)]
for i in range(1, 13): PECAS.append(('sobr%d' % i, 'Sobrancelha %d' % i, 'sobrancelha', ['homem', 'mulher'], 'S', 'eyebrows/eyebrow%03d' % i, 256))
PECAS += [('cilios_h', 'Cílios', 'cilios', ['homem'], 'S', 'eyelashes/eyelashes02', 256),
          ('cilios_m', 'Cílios', 'cilios', ['mulher'], 'S', 'eyelashes/eyelashes01', 256),
          ('olhos', 'Olhos', 'olhos', ['homem', 'mulher'], 'S', 'eyes/high-poly', 0)]
OLHOS = [('castanho', 'Castanhos', 'brown'), ('castanho_claro', 'Castanhos claros', 'brownlight'), ('verde', 'Verdes', 'green'),
         ('azul', 'Azuis', 'blue'), ('azul_escuro', 'Azuis escuros', 'deepblue'), ('cinza', 'Cinzentos', 'grey'), ('azul_verde', 'Azul-esverdeados', 'bluegreen')]
# peças recoloridas a partir de outra (a mesma malha e a textura mudada)
def grisalho(im):
    """cabelo grisalho: o tom vira cinza claro, os fios escuros continuam mais escuros (sal e pimenta)"""
    a = np.asarray(im.convert('RGBA'), float) / 255; L = a[..., :3] @ [0.3, 0.59, 0.11]
    g = 0.30 + 0.62 * np.clip(L / max(float(np.percentile(L[a[..., 3] > 0.5], 90)) if (a[..., 3] > 0.5).any() else 1, 1e-3), 0, 1.15) ** 0.85
    out = np.stack([g * 1.0, g * 0.985, g * 0.96, a[..., 3]], -1)
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGBA')
TINGE = {'curto_grisalho': grisalho}
# roupa de baixo pintada na pele (cor em sRGB) e a costura (elástico) um pouco mais escura
ROUPA_BAIXO = {'homem': {'cor': (46, 50, 56)}, 'mulher': {'cor': (34, 48, 74)}}
# ossos do MakeHuman -> 22 ossos do jogo (o resto da cabeça, dos dedos e dos dedões vai para o pai)
def osso_jogo(nome):
    n = nome; L = 'Left' if n.endswith('.L') else 'Right' if n.endswith('.R') else ''
    if n in ('root', 'spine05', 'spine04') or n.startswith('pelvis'): return 'Hips'
    if n == 'spine03': return 'Spine'
    if n == 'spine02': return 'Spine1'
    if n == 'spine01' or n.startswith('breast'): return 'Spine2'
    if n.startswith('neck'): return 'Neck'
    if n.startswith('clavicle'): return L + 'Shoulder'
    if n.startswith(('shoulder01', 'upperarm')): return L + 'Arm'
    if n.startswith('lowerarm'): return L + 'ForeArm'
    if n.startswith(('wrist', 'finger', 'metacarpal')): return L + 'Hand'
    if n.startswith('upperleg'): return L + 'UpLeg'
    if n.startswith('lowerleg'): return L + 'Leg'
    if n.startswith('foot'): return L + 'Foot'
    if n.startswith('toe'): return L + 'ToeBase'
    return 'Head'   # head, jaw, eye, tongue, special, músculos do rosto
# juntas dos 22 ossos (cabeça da peça do MakeHuman) e as pontas
JUNTA = {'Hips': 'spine05____head', 'Spine': 'spine03____head', 'Spine1': 'spine02____head', 'Spine2': 'spine01____head', 'Neck': 'neck01____head',
         'Head': 'head____head', 'Topo': 'head____tail'}
for L, s in (('Left', 'L'), ('Right', 'R')):
    JUNTA.update({L + 'Shoulder': 'clavicle.%s____head' % s, L + 'Arm': 'upperarm01.%s____head' % s, L + 'ForeArm': 'lowerarm01.%s____head' % s,
                  L + 'Hand': 'wrist.%s____head' % s, L + 'Dedo': 'finger3-3.%s____tail' % s, L + 'UpLeg': 'upperleg01.%s____head' % s,
                  L + 'Leg': 'lowerleg01.%s____head' % s, L + 'Foot': 'foot.%s____head' % s, L + 'ToeBase': 'toe3-1.%s____head' % s,
                  L + 'Ponta': 'toe3-3.%s____tail' % s})
FILHO = {'Hips': 'Spine', 'Spine': 'Spine1', 'Spine1': 'Spine2', 'Spine2': 'Neck', 'Neck': 'Head', 'Head': 'Topo'}
for L in ('Left', 'Right'):
    FILHO.update({L + 'Shoulder': L + 'Arm', L + 'Arm': L + 'ForeArm', L + 'ForeArm': L + 'Hand', L + 'Hand': L + 'Dedo',
                  L + 'UpLeg': L + 'Leg', L + 'Leg': L + 'Foot', L + 'Foot': L + 'ToeBase', L + 'ToeBase': L + 'Ponta'})

# ---------------------------------------------------------------- leitura
ZS = zipfile.ZipFile(ZSIS); ZP = zipfile.ZipFile(ZPAR)
def zler(z, n): return z.read(n).decode('utf-8', 'ignore')
def ler_obj_txt(txt, grupo=None):
    V, VT, F, FT, g = [], [], [], [], None
    for ln in txt.splitlines():
        if ln.startswith('v '): V.append([float(x) for x in ln.split()[1:4]])
        elif ln.startswith('vt '): VT.append([float(x) for x in ln.split()[1:3]])
        elif ln.startswith('g '): g = ln.split()[1].strip()
        elif ln.startswith('f ') and (grupo is None or g == grupo):
            a = [q.split('/') for q in ln.split()[1:]]
            F.append([int(q[0]) - 1 for q in a]); FT.append([int(q[1]) - 1 if len(q) > 1 and q[1] else -1 for q in a])
    return np.array(V, float), np.array(VT, float) if VT else np.zeros((0, 2)), F, FT
def ler_mhclo(txt):
    esc = [None, None, None]; ref = []; obj = mat = None; modo = None; dele = []
    for ln in txt.splitlines():
        s = ln.split()
        if not s or s[0].startswith('#'): continue
        if modo == 'verts' and s[0].lstrip('-').isdigit() and len(s) in (1, 9):
            if len(s) == 1: ref.append((int(s[0]), 0, 0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0))
            else: ref.append((int(s[0]), int(s[1]), int(s[2]), float(s[3]), float(s[4]), float(s[5]), float(s[6]), float(s[7]), float(s[8])))
            continue
        if modo == 'delete_verts' and s[0].isdigit():
            i = 0
            while i < len(s):
                if i + 2 < len(s) and s[i + 1] == '-': dele.extend(range(int(s[i]), int(s[i + 2]) + 1)); i += 3
                else: dele.append(int(s[i])); i += 1
            continue
        k = s[0]
        if k == 'obj_file': obj = s[1]
        elif k == 'material': mat = s[1]
        elif k in ('x_scale', 'y_scale', 'z_scale'): esc['xyz'.index(k[0])] = (int(s[1]), int(s[2]), float(s[3]))
        elif k in ('verts', 'delete_verts'): modo = k   # as outras palavras (material, z_depth...) podem vir no meio sem fechar a seção
    return obj, mat, esc, np.array(ref, float), np.array(sorted(set(dele)), int)
def ler_mhmat(txt):
    o = {}
    for ln in txt.splitlines():
        s = ln.split()
        if len(s) >= 2 and not s[0].startswith('#'): o[s[0]] = ' '.join(s[1:])
    return o

log('malha base')
VB, VTB, FB, FTB = ler_obj_txt(open(os.path.join(D, '3dobjs', 'base.obj'), encoding='utf-8', errors='ignore').read(), 'body')
NBV = len(VB)
SKEL = json.load(open(os.path.join(D, 'rigs', 'default.mhskel')))
WMH = json.load(open(os.path.join(D, 'rigs', 'default_weights.mhw')))['weights']
W22 = np.zeros((NBV, 22), np.float32)
for b, L in WMH.items():
    j = IX[osso_jogo(b)]
    for v, w in L: W22[v, j] += w
s = W22.sum(1, keepdims=True); W22 /= np.maximum(s, 1e-9)
log('pesos do MakeHuman: %d ossos -> 22 (%d vértices sem peso)' % (len(WMH), int((s[:, 0] < 1e-6).sum())))

def ler_alvo(p):
    out = []
    for ln in open(p, encoding='utf-8', errors='ignore'):
        if not ln.strip() or ln.startswith('#'): continue
        s = ln.split(); out.append((int(s[0]), float(s[1]), float(s[2]), float(s[3])))
    return out
def tres(v):
    if v < 0.5: mn = max(0.0, 1 - v * 2); return {'min': mn, 'average': 1 - mn, 'max': 0.0}
    mx = max(0.0, v * 2 - 1); return {'min': 0.0, 'average': 1 - mx, 'max': mx}
def idades(a):
    if a < 0.5:
        young = max(0.0, (a - 0.1875) * 3.2); baby = max(0.0, 1 - a * 5.333); child = max(0.0, min(1.0, 5.333 * a) - young)
        return {'baby': baby, 'child': child, 'young': young, 'old': 0.0}
    old = max(0.0, a * 2 - 1); return {'baby': 0, 'child': 0, 'young': 1 - old, 'old': old}
def corpo_com_alvos(c):
    P = VB.copy(); gen = {'male': c['genero'], 'female': 1 - c['genero']}; ida = idades(c['idade'])
    mus = tres(c['musculo']); pes = tres(c['peso']); alt = tres(c['altura'])
    pro = {'ideal': max(0.0, c['prop'] * 2 - 1), 'uncommon': max(0.0, 1 - c['prop'] * 2)}
    def soma(rel, w):
        if w <= 1e-4: return
        p = os.path.join(D, 'targets', 'macrodetails', rel)
        if not os.path.exists(p): return
        for i, dx, dy, dz in ler_alvo(p): P[i, 0] += dx * w; P[i, 1] += dy * w; P[i, 2] += dz * w
    for g, wg in gen.items():
        for a, wa in ida.items():
            for r, wr in RACA.items(): soma(f'{r}-{g}-{a}.target', wr * wg * wa)
            for m, wm in mus.items():
                for q, wq in pes.items():
                    w = wg * wa * wm * wq
                    soma(f'universal-{g}-{a}-{m}muscle-{q}weight.target', w)
                    for h in ('min', 'max'): soma(f'height/{g}-{a}-{m}muscle-{q}weight-{h}height.target', w * alt[h])
                    for k, wk in pro.items(): soma(f'proportions/{g}-{a}-{m}muscle-{q}weight-{k}proportions.target', w * wk)
    return P

# ---------------------------------------------------------------- esqueleto
_, NM, ESC = MC.carregar(os.path.join(FBXD, 'Idle.fbx')); WT, _tb = MC.repouso(NM, ESC)
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
def esqueleto(pA):
    """pose T de repouso (braços retos para os lados, como o Mixamo) e a pose A de ligação (a do MakeHuman)"""
    pT = {k: v.copy() for k, v in pA.items()}
    for L, sx in (('Left', 1), ('Right', -1)):
        cad = [L + 'Arm', L + 'ForeArm', L + 'Hand', L + 'Dedo']
        for a, b in zip(cad[:-1], cad[1:]): pT[b] = pT[a] + np.array([sx * np.linalg.norm(pA[b] - pA[a]), 0, 0])
    tb = np.zeros((22, 3))
    for b, o in enumerate(OSSOS):
        p = PAI[b]; tb[b] = pT[o] if p < 0 else qrot(qconj(WT[p]), pT[o] - pT[OSSOS[p]])
    WA = WT.copy()
    for o in ('LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand'):
        f = FILHO[o]; b = IX[o]; WA[b] = qmul(q_de_para(pT[f] - pT[o], pA[f] - pA[o]), WT[b])
    INV = [np.linalg.inv(mat_q(WA[b], pA[o])) for b, o in enumerate(OSSOS)]
    return tb, INV

# ---------------------------------------------------------------- malhas
def normais(P, T):
    fn = np.cross(P[T[:, 1]] - P[T[:, 0]], P[T[:, 2]] - P[T[:, 0]]); N = np.zeros_like(P)
    for k in range(3): np.add.at(N, T[:, k], fn)
    return N / (np.linalg.norm(N, axis=1, keepdims=True) + 1e-12)
def tri_de(F, FT):
    T, TU = [], []
    for f, ft in zip(F, FT):
        for k in range(1, len(f) - 1): T.append([f[0], f[k], f[k + 1]]); TU.append([ft[0], ft[k], ft[k + 1]])
    return np.array(T, int), np.array(TU, int)
def top4(W):
    o = np.argsort(-W, 1)[:, :4]; w = np.take_along_axis(W, o, 1); w[w < 0.02] = 0; w /= w.sum(1, keepdims=True) + 1e-12
    W8 = np.floor(w * 255).astype(int); W8[np.arange(len(W8)), w.argmax(1)] += 255 - W8.sum(1)
    return o.astype(np.uint8), W8.astype(np.uint8)
def pacote(P, N, UV, Wv, T):
    """vértices de 28 bytes (o mesmo formato do sobrevivente) e índices"""
    J4, W8 = top4(Wv); n = len(P)
    nn = np.clip(np.round(N * 127), -127, 127).astype(np.int8); uv = np.clip(np.round(UV * 65535), 0, 65535).astype('<u2')
    rec = np.zeros(n, dtype=[('p', '<f4', 3), ('n', 'i1', 3), ('x', 'u1'), ('u', '<u2', 2), ('j', 'u1', 4), ('w', 'u1', 4)])
    rec['p'] = P; rec['n'] = nn; rec['u'] = uv; rec['j'] = J4; rec['w'] = W8
    i32 = n > 65535; ib = T.astype('<u4' if i32 else '<u2').ravel()
    return {'vb': base64.b64encode(rec.tobytes()).decode(), 'ib': base64.b64encode(ib.tobytes()).decode(), 'nv': int(n), 'ni': int(ib.size), 'i32': bool(i32)}
def separar_costuras(T, TU, nvert):
    """um vértice por par (posição, UV): as costuras da textura dividem vértices"""
    chave = T.ravel() * 1000003 + np.maximum(TU.ravel(), 0); u, inv = np.unique(chave, return_inverse=True)
    vpos = (u // 1000003).astype(int); vuv = (u % 1000003).astype(int)
    return vpos, vuv, inv.reshape(T.shape)
def mini(z, pasta, tinge=None):
    t = [pasta] if pasta.endswith('.thumb') else [n for n in z.namelist() if n.startswith(pasta + '/') and n.endswith('.thumb')]
    if not t: return None
    try: im = Image.open(io.BytesIO(z.read(t[0]))).convert('RGB').resize((80, 80), Image.LANCZOS)
    except Exception: return None
    if tinge:   # a miniatura do cabelo é o cabelo num boneco cinza: só o que é mais saturado (o cabelo) muda de cor
        a = np.asarray(im, float); sat = a.max(2) - a.min(2); m = np.clip((sat - 12) / 30, 0, 1)[..., None]
        g = np.asarray(tinge(im.convert('RGBA')).convert('RGB'), float); im = Image.fromarray((a * (1 - m) + g * m).astype(np.uint8))
    b = io.BytesIO(); im.save(b, 'WEBP', quality=78, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
def media_pele(im):
    a = np.asarray(im.convert('RGB').resize((256, 256)), float); l = a @ [0.3, 0.59, 0.11]; m = a[l > 25].mean(0)
    return int(m[0]) << 16 | int(m[1]) << 8 | int(m[2])
def mascara_px(P, A, B, TB, TBU, cand, dentro, lado=1024):
    """a roupa de baixo texel a texel: cada texel do corpo leva a posição 3D (no corpo parado) e os pesos de braço (A) e de peito (B)
    interpolados no triângulo; dentro(pos, a, b) diz em metros o quanto o ponto está para dentro da peça (negativo: fora) e onde fica
    o elástico. Assim a borda segue a linha certa (horizontal na cintura, cavada na perna), lisa, em vez dos dentes dos triângulos"""
    uv = np.c_[VTB[:, 0], 1 - VTB[:, 1]] * lado - 0.5
    M = np.zeros((lado, lado), np.float32); E = np.zeros((lado, lado), np.float32); COB = np.zeros((lado, lado), bool)
    for t in np.nonzero(cand)[0]:
        iv, iu = TB[t], TBU[t]
        if (iu < 0).any(): continue
        q = uv[iu]; x0, y0 = np.maximum(np.floor(q.min(0)).astype(int), 0); x1, y1 = np.minimum(np.ceil(q.max(0)).astype(int), lado - 1)
        if x1 < x0 or y1 < y0: continue
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
        (ax, ay), (bx, by), (cx, cy) = q; den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
        if abs(den) < 1e-12: continue
        l0 = ((by - cy) * (gx - cx) + (cx - bx) * (gy - cy)) / den; l1 = ((cy - ay) * (gx - cx) + (ax - cx) * (gy - cy)) / den; l2 = 1 - l0 - l1
        ok = (l0 >= -0.03) & (l1 >= -0.03) & (l2 >= -0.03)
        if not ok.any(): continue
        L = np.stack([l0[ok], l1[ok], l2[ok]], 1); sd, el = dentro(L @ P[iv], L @ A[iv], L @ B[iv])
        py, px = gy[ok], gx[ok]; al = np.clip(0.5 + sd / 0.004, 0, 1)
        M[py, px] = np.maximum(M[py, px], al); E[py, px] = np.maximum(E[py, px], el * al); COB[py, px] = True
    for _ in range(2):   # a fresta entre as ilhas da textura pega o valor do vizinho: a costura não mostra pele
        for X in (M, E):
            g = np.asarray(Image.fromarray((X * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)), np.float32) / 255
            X[~COB] = g[~COB]
        COB |= np.asarray(Image.fromarray(COB.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(3))) > 0
    return M, E
def vestir_baixo(im, masc, cor):
    """pinta a roupa de baixo na pele: a cor do pano levando a luz e as dobras da própria pele, e o elástico mais escuro"""
    M, E = masc; lado = M.shape[0]
    a = np.asarray(im.convert('RGB').resize((lado, lado), Image.LANCZOS), float); m = M[..., None]
    L = a @ [0.3, 0.59, 0.11]; Lm = float(np.median(L[M > 0.5])) if (M > 0.5).any() else 128.0
    luz = np.clip(0.82 + 0.45 * (L - Lm) / max(Lm, 1), 0.55, 1.2)[..., None]
    pano = np.array(cor, float) * luz * (1 - 0.3 * E[..., None])
    out = a * (1 - m) + pano * m
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
def img_b64(im, lado, alfa, q=84):
    if lado and max(im.size) > lado: im = im.resize((lado, lado), Image.LANCZOS)
    b = io.BytesIO()
    if alfa: im.convert('RGBA').save(b, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
    im.convert('RGB').save(b, 'JPEG', quality=q, optimize=True, progressive=True); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

# ---------------------------------------------------------------- monta
SAIDA = {'corpos': {}, 'pecas': {}, 'peles': {}, 'olhos': {}}
BYTES = {}; MASCARA = {}
TB, TBU = tri_de(FB, FTB)
for cid, c in CORPOS.items():
    if SO_HOMEM and cid != 'homem': continue
    P = corpo_com_alvos(c) / 10.0
    usa = np.unique(TB); miny = P[usa, 1].min(); P[:, 1] -= miny
    Jt = SKEL['joints']; pA = {k: P[Jt[v]].mean(0) for k, v in JUNTA.items()}
    tb, INV = esqueleto(pA)
    altura = float(P[usa, 1].max())
    # roupa de baixo, medida no corpo parado (Y do chão para cima, X para o lado, Z para a frente). Cueca boxer: da cintura até um
    # palmo abaixo da virilha, a perna cortada reta. Biquíni: a calcinha baixa, cavada na perna (mais na frente que atrás), e o
    # top com as duas copas (o peso dos ossos do peito) e a faixa que dá a volta nas costas. O braço nunca entra.
    X, Y, Z = P[:, 0], P[:, 1], P[:, 2]
    A = W22[:, [IX[o] for o in ('LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm', 'LeftHand', 'RightHand', 'LeftShoulder', 'RightShoulder')]].sum(1)
    B = np.zeros(NBV)
    for b, Lw in WMH.items():
        if b.startswith('breast'):
            for v, w in Lw: B[v] += w
    yL = float((pA['LeftUpLeg'][1] + pA['RightUpLeg'][1]) / 2); zH = float(pA['Hips'][2])
    meio = (np.abs(X) < 0.012) & (Y > 0.4) & np.isin(np.arange(NBV), usa); yC = float(Y[meio].min())   # a virilha: o ponto mais baixo do meio
    perna = np.isin(W22.argmax(1), [IX['LeftUpLeg'], IX['RightUpLeg']])
    xi = float(np.abs(X[perna & (Y > yC - 0.03) & (Y < yC - 0.005)]).min())
    if cid == 'homem':
        topo, bainha = yL + 0.105, yC - 0.06
        def dentro(p, a, b):
            y = p[:, 1]; sd = np.minimum(np.minimum(topo - y, y - bainha), (0.5 - a) * 0.08)
            el = np.clip(1 - np.abs((topo - y) - 0.006) / 0.006, 0, 1) + np.clip(1 - np.abs((y - bainha) - 0.004) / 0.004, 0, 1) * 0.6
            return sd, np.clip(el, 0, 1)
        ylim = (bainha - 0.03, topo + 0.03)
    else:
        topo = yL + 0.065
        # o top: duas copas (elipses, vistas de frente, em volta do bico de cada peito) com o decote em coração, e a faixa por baixo
        # do peito dando a volta nas costas. O bico é o ponto mais à frente dos vértices do peito (peso dos ossos breast*)
        cp = (B > 0.3) & (A < 0.5); yU = float(np.percentile(Y[cp], 2))
        bico = np.array([P[np.nonzero(cp & (np.sign(X) == sg))[0][np.argmax(Z[cp & (np.sign(X) == sg)])]] for sg in (-1, 1)])
        yA, zA = float(bico[:, 1].mean()), float(bico[:, 2].mean()); yT = yA + 0.058; yc, ry, rx = (yU + yT) / 2, (yT - yU) / 2, 0.075
        def dentro(p, a, b):
            x, y, z = p[:, 0], p[:, 1], p[:, 2]
            k = 0.35 + 0.45 * np.clip((z - zH) / 0.06 + 0.5, 0, 1)
            bainha = yC - 0.012 + k * np.maximum(np.abs(x) - xi, 0)
            baixo = np.minimum(topo - y, (y - bainha) / np.sqrt(1 + k * k))
            copa = np.full(x.shape, -1.0)
            for i in range(2):
                e = ((x - bico[i, 0]) / rx) ** 2 + ((y - yc) / ry) ** 2
                copa = np.maximum(copa, np.minimum((1 - np.sqrt(e)) * min(rx, ry), z - (zA - 0.075)))
            cima = np.maximum(copa, np.minimum(y - (yU - 0.004), yU + 0.026 - y))
            sd = np.minimum(np.maximum(baixo, cima), (0.5 - a) * 0.08)
            el = np.clip(1 - np.abs((topo - y) - 0.005) / 0.005, 0, 1) * (baixo >= cima)
            return sd, el
        ylim = (yC - 0.05, yT + 0.03)
    cand = ((P[TB, 1].max(1) > ylim[0]) & (P[TB, 1].min(1) < ylim[1]) & (np.abs(P[TB, 0]).min(1) < 0.3))
    MASCARA[cid] = mascara_px(P, A, B, TB, TBU, cand, dentro)
    log('%s: roupa de baixo (virilha %.3f, quadril %.3f) em %.1f%% da textura' % (cid, yC, yL, 100 * float((MASCARA[cid][0] > 0.5).mean())))
    # corpo: normais no corpo soldado, depois um vértice por (posição, UV)
    Nb = normais(P, TB)
    vpos, vuv, Tn = separar_costuras(TB, TBU, NBV)
    cor = pacote(P[vpos], Nb[vpos], np.c_[VTB[vuv, 0], 1 - VTB[vuv, 1]], W22[vpos], Tn)
    invf = np.concatenate([M.T.ravel() for M in INV]).astype('<f4')
    SAIDA['corpos'][cid] = {'ossos': OSSOS, 'pai': PAI, 't': [round(float(v), 5) for v in tb.ravel()], 'qb': [round(float(v), 6) for v in WT.ravel()],
                            'inv': base64.b64encode(invf.tobytes()).decode(), **cor, 'altura': round(altura, 4), 'quadril': round(float(pA['Hips'][1]), 4),
                            'maoA': [round(float(v), 4) for v in list(pA['LeftHand']) + list(pA['RightHand'])], 'ntri': int(len(TB))}
    log('%s: %.2f m, quadril %.3f, ombros %.3f; corpo %d vértices, %d triângulos' % (cid, altura, pA['Hips'][1], 2 * pA['LeftArm'][0], cor['nv'], len(TB)))
    # peças
    for pid, nome, cat, corpos, zq, pasta, lado in PECAS:
        if cid not in corpos: continue
        z = ZS if zq == 'S' else ZP
        mh = [n for n in z.namelist() if n.startswith(pasta + '/') and n.endswith('.mhclo')]
        if not mh: log('  falta', pasta); continue
        obj, mat, esc, ref, dele = ler_mhclo(zler(z, mh[0]))
        Pd = P * 10.0 + np.array([0, miny * 10, 0])   # de volta ao decímetro do MakeHuman para o encaixe
        s3 = [abs(Pd[e[0], n] - Pd[e[1], n]) / e[2] if e else 1.0 for n, e in enumerate(esc)]
        v1, v2, v3 = ref[:, 0].astype(int), ref[:, 1].astype(int), ref[:, 2].astype(int)
        Q = (ref[:, 3:4] * Pd[v1] + ref[:, 4:5] * Pd[v2] + ref[:, 5:6] * Pd[v3] + ref[:, 6:9] * np.array(s3)) / 10.0 - np.array([0, miny, 0])
        Wq = ref[:, 3:4] * W22[v1] + ref[:, 4:5] * W22[v2] + ref[:, 5:6] * W22[v3]
        Vq, VTq, Fq, FTq = ler_obj_txt(zler(z, pasta + '/' + obj))
        if len(Vq) != len(Q): log('  %s: %d vértices no obj e %d no encaixe' % (pid, len(Vq), len(Q))); continue
        Tq, TUq = tri_de(Fq, FTq); Nq = normais(Q, Tq)
        vp, vu, Tqn = separar_costuras(Tq, TUq, len(Q))
        UVq = np.c_[VTq[vu, 0], 1 - VTq[vu, 1]] if len(VTq) else np.zeros((len(vp), 2))
        pk = pacote(Q[vp], Nq[vp], UVq, Wq[vp], Tqn)
        # triângulos do corpo que ficam por baixo (todos os três vértices apagados)
        if len(dele):
            dm = np.zeros(NBV, bool); dm[dele[dele < NBV]] = True; esc_t = dm[TB].all(1)
            pk['oculta'] = base64.b64encode(np.packbits(esc_t, bitorder='little').tobytes()).decode(); pk['nocult'] = int(esc_t.sum())
        e = SAIDA['pecas'].setdefault(pid, {'nome': nome, 'cat': cat, 'corpos': corpos})
        if 'mini' not in e and cat not in ('olhos', 'cilios'): e['mini'] = mini(z, pasta, TINGE.get(pid))
        e[cid] = pk
        if cat == 'olhos': e['alfa'] = True
        if 'tex' not in e and lado:
            mm = ler_mhmat(zler(z, pasta + '/' + mat)) if mat else {}
            dt = mm.get('diffuseTexture'); alfa = mm.get('transparent', 'False') == 'True' or cat in ('cabelo', 'barba', 'sobrancelha', 'cilios')
            if dt:
                im = Image.open(io.BytesIO(z.read(pasta + '/' + dt)))
                if alfa and im.mode != 'RGBA': im = im.convert('RGBA')
                if pid in TINGE: im = TINGE[pid](im)
                e['tex'] = img_b64(im, lado, alfa); e['alfa'] = bool(alfa); BYTES[pid] = len(e['tex'])
        log('  %-12s %-11s %5d vértices %5d triângulos%s' % (pid, cat, pk['nv'], pk['ni'] // 3, (', esconde %d do corpo' % pk.get('nocult', 0)) if pk.get('nocult') else ''))
for pid, nome, corpo, pasta in PELES:
    if SO_HOMEM and corpo != 'homem': continue
    mm = ler_mhmat(zler(ZS, [n for n in ZS.namelist() if n.startswith(pasta + '/') and n.endswith('.mhmat')][0]))
    im = Image.open(io.BytesIO(ZS.read(pasta + '/' + mm['diffuseTexture'])))
    media = media_pele(im)   # a média da pele nua (o braço da 1ª pessoa é levado a ela)
    if corpo in MASCARA: im = vestir_baixo(im, MASCARA[corpo], ROUPA_BAIXO[corpo]['cor'])
    SAIDA['peles'][pid] = {'nome': nome, 'corpo': corpo, 'tex': img_b64(im, 1024, False, 82), 'mini': mini(ZS, pasta), 'media': media}; BYTES['pele_' + pid] = len(SAIDA['peles'][pid]['tex'])
im = Image.open(io.BytesIO(ZS.read('skins/middleage_caucasian_male/middleage_lightskinned_male_diffuse.png')))
SAIDA['pele_ref'] = media_pele(im)   # a pele da textura do braço da 1ª pessoa (tools/braco_fp.py), medida do mesmo jeito
for oid, nome, arq in OLHOS:
    mm = ler_mhmat(zler(ZS, 'eyes/materials/%s.mhmat' % arq)); im = Image.open(io.BytesIO(ZS.read('eyes/materials/' + mm['diffuseTexture'])))
    SAIDA['olhos'][oid] = {'nome': nome, 'tex': img_b64(im.convert('RGBA'), 256, True, 88), 'mini': mini(ZS, 'eyes/materials/%s.thumb' % arq)}   # a córnea é transparente (alfa 0): sem ela o olho fica branco
txt = 'const MHP=' + json.dumps(SAIDA, separators=(',', ':')) + ';\n'
open(SAI, 'w').write('/* personagem Personalizado: corpos e peças do MakeHuman (CC0), feito por tools/mh_personagem.py */\n' + txt)
log('saída %s: %.1f MB (texturas %.1f MB)' % (SAI, len(txt) / 1e6, sum(BYTES.values()) / 1e6))
