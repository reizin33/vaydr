"""VAYDR · etapa 4 (cascas): peças do kit "Post Apocalypse Kitbash" (versão gratuita, de Oleg Ushenok) → src/21n_kit_dados.js (KITX)
Uso (na pasta jogo/):
  python3 -I tools/kit_banco.py <pasta Post_apocalypse_kitbash_free> src/21n_kit_dados.js [pecas_previa.npz]
O kit é um FBX só (Fbx/12.fbx: 330 peças "Building_12_NNN", em cm, Z para cima) e uma textura 4K para todas. Aqui:
 · escolhe as peças da lista PECAS (nome no jogo ← número da peça no kit);
 · cada peça vai para metros, Y para cima, e é girada para a frente dela ficar em +z (as presas na parede ficam com as costas
   em z=0); a base fica em y=0 e o meio em x=0 (as de chão também ficam centradas em z);
 · junta os cantos repetidos (o FBX traz um vértice por canto de polígono) e simplifica as pesadas (tools/simplifica.py: colapso
   de arestas pelo erro quadrático, sem rasgar a textura nem virar triângulo);
 · textura: a cor escura do kit em 2048 px com a opacidade no canal alfa (WebP), uma só para todas as peças.
O jogo lê no mesmo formato binário dos outros modelos (62b_mod3d.js: posição e UV em 16 bits, índices, normal em 8 bits)."""
import sys, os, io, json, base64
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from fbx_ler import ler_fbx, filho
from lugares_banco import codificar
from simplifica import simplificar_qem

# nome no jogo: número da peça no kit, frente (eixo do kit que vira +z), parede (costas em z=0), alvo de triângulos
# (os números e as frentes vêm das folhas de vista de frente e de lado, feitas fora do jogo)
PECAS = {
    # fachada
    'cano':       dict(n=202, frente='+z', parede=True, alvo=450),            # calha descendo, com a curva de saída embaixo
    'arCond':     dict(n=183, frente='+z', parede=True, alvo=2000),            # caixa de ar-condicionado com ventilador e grade
    'arCaixa':    dict(n=172, frente='+z', parede=True, alvo=1900),            # caixa de ar-condicionado com grade
    'quadroLuz':  dict(n=186, frente='+x', parede=True, alvo=900),            # caixas de ligação com os fios
    'caixaLuz':   dict(n=185, frente='+z', parede=True, alvo=300),             # caixinha de luz com o relógio
    'extintor':   dict(n=213, frente='+z', parede=True, alvo=500),
    'chapa':      dict(n=230, frente='+z', parede=True, alvo=320),             # chapa rebitada (tapa janela)
    'chapa2':     dict(n=232, frente='+x', parede=True, alvo=320),
    'tabuas':     dict(n=89,  frente='+x', parede=True, alvo=400),             # tábuas pregadas em duas ripas
    # telhado
    'caixaDagua': dict(n=273, frente='+z', alvo=2600),                         # caixa d'água no suporte
    'tanque':     dict(n=1,   frente='+z', alvo=2600),                         # tanque redondo grande
    'solar':      dict(n=274, frente='+x', alvo=900),                         # placa solar inclinada
    'solar2':     dict(n=275, frente='+x', alvo=1000),
    'antena':     dict(n=195, frente='+z', alvo=2500),                         # armação de antenas
    'respiro':    dict(n=271, frente='+z', alvo=450),                         # cano de respiro com curva
    'telha':      dict(n=88,  frente='+z', alvo=400),                          # telha ondulada (barraco)
    # beco (a escada de marinheiro #219, as caixas de papelão #18, a barreira #242 e o feixe de fios #201 ficam para as próximas
    # etapas: os fios entre os prédios são cabos feitos no jogo, mais leves e com a barriga certa para cada vão)
    'cacamba':    dict(n=0,   frente='+z', alvo=1500),
    'tambores':   dict(n=21,  frente='+z', alvo=1800),
    'lona':       dict(n=36,  frente='+z', alvo=1800),                         # tambores cobertos com lona
}
# a calha do kit é a curva de saída embaixo, um cilindro reto de 0,78 a 2,06 m e a luva de 2,06 a 2,41 m: o trecho reto e a luva
# saem dela (antes de simplificar) e o jogo empilha quantos precisar até o telhado
RETO = dict(de='cano', reto=(0.75, 2.075), luva=(2.04, 2.45), alvo_luva=90)


def eixo_para_z(frente):
    """matriz (linhas) que leva o eixo 'frente' do kit para +z, mantendo y para cima"""
    M = {'+z': [[1, 0, 0], [0, 1, 0], [0, 0, 1]], '-z': [[-1, 0, 0], [0, 1, 0], [0, 0, -1]],
         '+x': [[0, 0, -1], [0, 1, 0], [1, 0, 0]], '-x': [[0, 0, 1], [0, 1, 0], [-1, 0, 0]]}[frente]
    M = np.array(M, float); assert abs(np.linalg.det(M) - 1) < 1e-9; return M


def ler_pecas(fbx, numeros):
    """lê do FBX só as peças pedidas: posição (m, Y para cima), UV (origem em cima, como as imagens), normal, um vértice por canto"""
    f = ler_fbx(fbx); nos = {n['nome']: n for n in f['nos']}
    geos, mods = {}, {}
    for n in nos['Objects']['filhos']:
        if n['nome'] == 'Geometry': geos[n['props'][0]] = n
        elif n['nome'] == 'Model': mods[n['props'][0]] = n
    pai = {}
    for c in nos['Connections']['filhos']:
        if c['props'][0] == 'OO': pai.setdefault(c['props'][1], []).append(c['props'][2])
    querem = {'Building_12_%03d' % k: k for k in numeros}; out = {}
    for gid, g in geos.items():
        ms = [p for p in pai.get(gid, []) if p in mods]
        nome = mods[ms[0]]['props'][1].split('\x00')[0] if ms else ''
        if nome not in querem: continue
        V = np.array(filho(g, 'Vertices')['props'][0], float).reshape(-1, 3)
        PI = np.array(filho(g, 'PolygonVertexIndex')['props'][0], np.int64)
        # polígonos -> triângulos (leque), guardando o índice do canto (polygon-vertex) para UV e normal
        tri, cant, ini = [], [], 0
        for e in np.nonzero(PI < 0)[0]:
            poly = PI[ini:e + 1].copy(); poly[-1] = -poly[-1] - 1; cs = np.arange(ini, e + 1)
            for k in range(1, len(poly) - 1): tri.append((poly[0], poly[k], poly[k + 1])); cant.append((cs[0], cs[k], cs[k + 1]))
            ini = e + 1
        tri = np.array(tri); cant = np.array(cant)

        def camada(nome_camada, nome_dado, nome_ind, dim):
            L = filho(g, nome_camada)
            if L is None: return None
            D = np.array(filho(L, nome_dado)['props'][0], float).reshape(-1, dim)
            ii = filho(L, nome_ind); mapa = filho(L, 'MappingInformationType')['props'][0]
            ref = filho(L, 'ReferenceInformationType')['props'][0]
            if mapa == 'ByPolygonVertex':
                idx = np.array(ii['props'][0], np.int64)[cant] if (ii is not None and ref != 'Direct') else cant
            else:   # ByVertice / ByControlPoint
                idx = np.array(ii['props'][0], np.int64)[tri] if (ii is not None and ref != 'Direct') else tri
            return D[idx].reshape(-1, dim)
        UV = camada('LayerElementUV', 'UV', 'UVIndex', 2)
        N = camada('LayerElementNormal', 'Normals', 'NormalsIndex', 3)
        P = V[tri].reshape(-1, 3) / 100.0
        P = P[:, [0, 2, 1]] * np.array([1, 1, -1])                       # cm, Z para cima -> m, Y para cima (x, z, -y)
        if N is not None: N = N[:, [0, 2, 1]] * np.array([1, 1, -1])
        UV = UV.copy(); UV[:, 1] = 1 - UV[:, 1]                           # FBX: v para cima; imagem: v para baixo
        T = np.arange(len(P)).reshape(-1, 3)[:, [0, 2, 1]]                # a troca de eixo espelha: inverte o giro dos triângulos
        out[querem[nome]] = dict(P=P, UV=UV, N=N, T=T)
    return out


def normais_faces(P, T):
    f = np.cross(P[T[:, 1]] - P[T[:, 0]], P[T[:, 2]] - P[T[:, 0]]); return f / (np.linalg.norm(f, axis=1, keepdims=True) + 1e-12)


def soldar(P, UV, N, T):
    """um vértice por canto -> malha indexada (junta cantos com a mesma posição, UV e normal)"""
    if N is None:
        Nf = normais_faces(P, T); N = np.repeat(Nf, 3, axis=0)
    k = np.c_[np.round(P * 1e4), np.round(UV * 1e5), np.round(N * 50)].astype(np.int64)
    _, idx, inv = np.unique(k, axis=0, return_index=True, return_inverse=True); inv = inv.ravel()
    return P[idx], UV[idx], N[idx], inv[T]


def assentar(P, parede, sem_chao=False):
    """base em y=0 e meio em x=0; peça de parede com as costas em z=0, de chão centrada em z"""
    lo, hi = P.min(0), P.max(0); d = np.array([-(lo[0] + hi[0]) / 2, 0 if sem_chao else -lo[1], -lo[2] if parede else -(lo[2] + hi[2]) / 2])
    if sem_chao: d[1] = -(lo[1] + hi[1]) / 2
    return P + d


def atlas(pasta, lado=2048):
    """cor escura + opacidade (alfa) -> WebP RGBA"""
    tx = os.path.join(pasta, 'Textures')
    cor = Image.open(os.path.join(tx, 'Post_apocalypse_city_color_dark.png')).convert('RGB').resize((lado, lado), Image.LANCZOS)
    op = Image.open(os.path.join(tx, 'Post_apocalypse_city_opacity.png')).convert('L').resize((lado, lado), Image.LANCZOS)
    im = cor.copy(); im.putalpha(op)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=82, method=6, alpha_quality=90)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode(), len(b.getvalue())


def main():
    pasta, saida = sys.argv[1], sys.argv[2]; previa = sys.argv[3] if len(sys.argv) > 3 else None
    cruas = ler_pecas(os.path.join(pasta, 'Fbx', '12.fbx'), sorted({c['n'] for c in PECAS.values()}))
    KITX = {'pecas': {}}; prev = {}; rel = []
    for nome, c in PECAS.items():
        d = cruas[c['n']]; R = eixo_para_z(c['frente'])
        P = d['P'] @ R.T; N = d['N'] @ R.T if d['N'] is not None else None
        P = assentar(P, c.get('parede', False), c.get('sem_chao', False))
        if N is None: N = np.repeat(normais_faces(P, d['T']), 3, axis=0)
        n0 = len(d['T']); pecas_extra = []
        if nome == RETO['de']:   # trecho reto e luva saem da calha inteira (sem simplificar)
            P0, UV0, N0, I0 = soldar(P, d['UV'], N, d['T'])
            def recorta(y0, y1):
                m = (P0[I0][:, :, 1].min(1) >= y0) & (P0[I0][:, :, 1].max(1) <= y1)
                Ir = I0[m]; us = np.unique(Ir); mp = -np.ones(len(P0), np.int64); mp[us] = np.arange(len(us))
                Pr = P0[us].copy(); Pr[:, 1] -= Pr[:, 1].min(); return Pr, UV0[us], N0[us], mp[Ir]
            Pr, Ur, Nr, Ir = recorta(*RETO['reto']); pecas_extra.append(('canoReto', Pr, Ur, Nr, Ir, dict(passo=round(float(Pr[:, 1].max()), 4))))
            Pl, Ul, Nl, Il = recorta(*RETO['luva'])
            if len(Il) > RETO['alvo_luva']: Pl, Ul, Nl, Il = simplificar_qem(Pl[Il].reshape(-1, 3), Ul[Il].reshape(-1, 2), Nl[Il].reshape(-1, 3), np.arange(len(Il) * 3).reshape(-1, 3), RETO['alvo_luva'])
            pecas_extra.append(('canoLuva', Pl, Ul, Nl, Il, dict(passo=round(float(Pl[:, 1].max()), 4))))
        if n0 > c['alvo']: P, UV, N, I = simplificar_qem(P, d['UV'], N, d['T'], c['alvo'])
        else: P, UV, N, I = soldar(P, d['UV'], N, d['T'])
        for nm, PP, UU, NN, II, extra in [(nome, P, UV, N, I, {})] + pecas_extra:
            b64, uv0, uvS = codificar(PP, UU, NN, II)
            lo, hi = PP.min(0), PP.max(0)
            e = {'b': b64, 'tam': [round(float(v), 3) for v in hi - lo], 'lo': [round(float(v), 3) for v in lo], 'hi': [round(float(v), 3) for v in hi], 'tri': int(len(II))}
            e['uv0'] = [round(float(v), 6) for v in uv0]; e['uvS'] = [round(float(v), 6) for v in uvS]
            e.update(extra); KITX['pecas'][nm] = e
            prev[nm] = (PP, UU, II)
            rel.append('%-11s #%03d  %6d -> %5d tri  %s' % (nm, c['n'], n0 if nm == nome else len(II), len(II), e['tam']))
    KITX['tex'], ntex = atlas(pasta)
    js = ('/* VAYDR · peças do kit "Post Apocalypse Kitbash" (versão gratuita), de Oleg Ushenok. Gerado por tools/kit_banco.py: não editar à mão.\n'
          '   pecas: nome -> malha (62b_mod3d.js), tamanho (m), caixa (lo/hi); tex: a textura do kit (cor + opacidade no alfa). */\n'
          'const KITX=' + json.dumps(KITX, separators=(',', ':')) + ';\n')
    open(saida, 'w').write(js)
    print('\n'.join(rel)); print('textura %.2f MB · arquivo %.2f MB · triângulos %d' % (ntex / 1e6, len(js) / 1e6, sum(v['tri'] for v in KITX['pecas'].values())))
    if previa:
        np.savez_compressed(previa, **{k + '|' + c: v for k, (P, UV, I) in prev.items() for c, v in (('P', P.astype(np.float32)), ('UV', UV.astype(np.float32)), ('T', I.astype(np.int32)))})


if __name__ == '__main__':
    main()
