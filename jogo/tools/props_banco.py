"""Objetos de verdade (Poly Haven, CC0) para o mapa: móveis, caixas, tambores, postes, lixeiras, gerador...
GLB (dos pacotes .pak que o navegador do app montou) -> src/21k_props_dados.js (PROPS3D): cada modelo com o pé no chão (y = 0),
centrado em x/z, simplificado até o alvo de triângulos, textura de cor em WebP. O mesmo formato dos objetos do 21i (MATA).
Uso: python3 -I tools/props_banco.py pasta1:pasta2:... [ids...]   (sem ids: todos; os que já estão no arquivo e não foram pedidos ficam)"""
import os, sys, re, json, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import lugares_banco as LB
from lugares_banco import ler_gltf
from mata_banco import simplifica, malha, webp, abre
SAIDA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', '21k_props_dados.js')
PASTAS = sys.argv[1].split(':'); PEDIDOS = sys.argv[2:]
# id do jogo: (modelo da Poly Haven, alvo de triângulos, lado da textura[, nós: expressão do nome das peças que ficam])
# (vários modelos vêm em conjunto, com duas ou três versões lado a lado: o filtro de nós separa uma delas)
MODELOS = {
    # casas e prédios (móveis e armários de saque)
    'sofa': ('Sofa_01', 3000, 1024), 'sofaMadeira': ('painted_wooden_sofa', 2500, 1024), 'poltrona': ('ArmChair_01', 2500, 1024),
    'camaDia': ('vintage_day_bed', 3000, 1024), 'camaFerro': ('old_bed_frame', 3500, 1024),
    'mesaJantar': ('dining_table', 1200, 1024, r'^dining_table$'), 'mesaToalha': ('dining_table', 1500, 1024), 'mesaPintada': ('painted_wooden_table', 1200, 1024),
    'mesaRedonda': ('round_wooden_table_01', 2000, 1024), 'mesaEscritorio': ('metal_office_desk', 2200, 1024), 'mesaPiquenique': ('wooden_picnic_table', 2500, 1024),
    'mesaCentro': ('CoffeeTable_01', 2000, 1024), 'mesaBaixa': ('WoodenTable_01', 1000, 1024), 'mesaLado': ('side_table_01', 1500, 512),
    'cadeira': ('dining_chair_02', 1800, 512), 'cadeiraPintada': ('painted_wooden_chair_01', 1800, 512), 'cadeiraPlastico': ('plastic_monobloc_chair_01', 1500, 512),
    'cadeiraEscola': ('SchoolChair_01', 1500, 512), 'cadeiraBalanco': ('Rockingchair_01', 2500, 1024), 'banqueta': ('wooden_stool_01', 1500, 512),
    'banquetaMetal': ('metal_stool_01', 1500, 512), 'banquetaDobravel': ('folding_wooden_stool', 1500, 512),
    'estante': ('wooden_bookshelf_worn', 2500, 1024), 'estantePintada': ('painted_wooden_shelves', 2000, 1024), 'prateleiraMetal': ('worn_metal_rack', 2500, 1024),
    'prateleiraParede': ('Shelf_01', 400, 512), 'expositor': ('wooden_display_shelves_01', 1500, 1024),
    'armario': ('painted_wooden_cabinet', 2500, 1024), 'guardaRoupa': ('vintage_cabinet_01', 3000, 1024), 'gaveteiro': ('drawer_cabinet', 2500, 1024),
    'comoda': ('vintage_wooden_drawer_01', 2000, 1024), 'criadoMudo': ('painted_wooden_nightstand', 1500, 512),
    'fogao': ('electric_stove', 2500, 1024), 'televisao': ('television_02', 1500, 512), 'radioVelho': ('vintage_radio_transceiver', 2500, 512),
    'cadeiraRodas': ('wheelchair_01', 3000, 1024), 'quadroNegro': ('standing_chalkboard_01', 1500, 1024), 'mala': ('vintage_suitcase', 1600, 512, r'^vintage_suitcase_01_'),
    'carrinhoFerramentas': ('tool_cart', 3000, 1024), 'gerador': ('portable_generator', 3000, 1024), 'compressor': ('old_military_compressor', 3000, 1024),
    'baulFerramentas': ('metal_tool_chest', 2500, 1024), 'carrinhoCarga': ('industrial_storage_cart', 3000, 1024), 'furadeiraBancada': ('old_drill_press', 2500, 1024),
    'carrinhoSolda': ('portable_welding_cart', 3000, 1024), 'vaso': ('potted_plant_02', 2500, 1024), 'jardineira': ('planter_box_01', 1500, 512),
    'extintor': ('korean_fire_extinguisher_01', 1500, 512), 'fogareiroTambor': ('barrel_stove', 2000, 512),
    # caixas, tambores e tralha
    'caixaPapelao': ('cardboard_box_01', 1200, 512), 'caixaMadeira': ('wooden_crate_02', 1200, 512), 'caixaMadeira2': ('wooden_crate_01', 1500, 512),
    'caixaPlastico': ('plastic_crate_01', 1500, 512), 'caixaPlastico2': ('plastic_crate_02', 1500, 512),
    'caixaMilitarVelha': ('old_military_crate', 1800, 1024, r'_a$'), 'caixaMilitar': ('wooden_military_crate', 2000, 1024),
    'tambor': ('Barrel_01', 1500, 512), 'tamborVelho': ('barrel_03', 1500, 512), 'barrilVinho': ('wine_barrel_01', 2000, 512),
    'botijao': ('propane_tank', 1500, 512), 'botijaoGas': ('small_lpg_tank', 1500, 512), 'pneuVelho': ('old_tyre', 1500, 512),
    'sacoCimento': ('cement_bag', 800, 512), 'sacosAdubo': ('compost_bags', 1600, 1024, r'_floor(stacked)?$'), 'sacoAdubo': ('compost_bags', 1200, 1024, r'_standing$'),
    'sacoLixo': ('trashbag', 1500, 512), 'carrinhoMao': ('hand_truck', 2500, 512), 'escada': ('ladder_sectioned_01', 2500, 512), 'escadaMadeira': ('wooden_ladder', 2000, 512),
    'bancoPraca': ('painted_wooden_bench', 800, 1024), 'bancoRua': ('modular_street_seating', 2500, 1024, r'^(crossbar|legs_double|legs_single|back_support_[rl]|arm_rest_0[12]|seat|seat_back)$'),
    # rua
    'lixeira': ('metal_trash_can', 2500, 1024, r'^metal_trash_can(_lid|_handle_left|_handle_right)?$'), 'lixeiraVelha': ('metal_trash_can', 2500, 1024, r'^metal_trash_can_rust'),
    'hidrante': ('fire_hydrant', 2500, 512, r'_aged$'), 'poste': ('street_lamp_01', 3000, 1024),
    'caixaLuz': ('utility_box_01', 1500, 512), 'caixaLuz2': ('utility_box_02', 1500, 512),
    'arCondicionado': ('exterior_aircon_unit', 1800, 512, r'_rusted$'), 'placaPiso': ('WetFloorSign_01', 800, 512),
    'carroCoberto': ('covered_car', 4000, 1024), 'barreiraConcreto': ('concrete_road_barrier_02', 1500, 1024),
    # acampamento do jogador (clareira)
    'fogueiraPedras': ('stone_fire_pit', 3000, 1024), 'lampiao': ('Lantern_01', 1500, 512, r'^Lantern_01$'), 'troncoCaido': ('dead_tree_trunk_02', 2500, 1024),
    'tambor2': ('Barrel_02', 1500, 512), 'galaoVerde': ('metal_jerrycan_green', 1500, 512), 'tocoCorte': ('tree_stump_01', 2500, 1024), 'tocoCorte2': ('tree_stump_02', 2500, 1024), 'troncoReto': ('dead_tree_trunk', 2500, 1024),
}

def acha(m):
    for d in PASTAS:
        for n in ('ph_' + m + '.glb', m + '.glb', m + '_2k.gltf.zip', m + '_1k.gltf.zip', m + '.gltf.zip'):
            if os.path.exists(os.path.join(d, n)): return os.path.join(d, n)
    raise FileNotFoundError(m)

def _abrir(caminho):
    """GLB solto ou .zip com .gltf (+ .bin e texturas) da Poly Haven: (zip, json, buffers, pasta base)"""
    import zipfile
    if caminho.lower().endswith('.glb'): return LB._abrir_glb(open(caminho, 'rb').read())
    z = zipfile.ZipFile(caminho); gn = [n for n in z.namelist() if n.endswith('.gltf')][0]; base = gn.rsplit('/', 1)[0] + '/' if '/' in gn else ''
    g = json.loads(z.read(gn)); return z, g, [z.read(base + b['uri']) for b in g['buffers']], base

def ler_nos(caminho, filtro):
    """como lugares_banco.ler_gltf, mas só com os nós de malha cujo nome casa com o filtro"""
    z, g, bins, base = _abrir(caminho); er = re.compile(filtro)
    def acc(i):
        a = g['accessors'][i]; bv = g['bufferViews'][a['bufferView']]; dt, sz = LB.CT[a['componentType']]; n = LB.NC[a['type']]; c = a['count']
        o = bv.get('byteOffset', 0) + a.get('byteOffset', 0); st = bv.get('byteStride') or n * sz; buf = bins[bv.get('buffer', 0)]
        raw = np.frombuffer(buf, dtype=np.uint8, count=st * (c - 1) + n * sz, offset=o)
        arr = np.lib.stride_tricks.as_strided(raw, shape=(c, n * sz), strides=(st, 1)).copy().view(dt).reshape(c, n).astype(np.float64)
        return arr if n > 1 else arr[:, 0]
    partes = {}
    def anda(ni, M):
        nd = g['nodes'][ni]; W = M @ LB.trs(nd)
        if 'mesh' in nd and er.search(nd.get('name', '')):
            for p in g['meshes'][nd['mesh']]['primitives']:
                if p.get('mode', 4) != 4: continue
                A = p['attributes']; P = acc(A['POSITION']); I = acc(p['indices']).astype(np.int64).reshape(-1, 3)
                UV = acc(A['TEXCOORD_0']) if 'TEXCOORD_0' in A else np.zeros((len(P), 2))
                mi = p.get('material', -1); Pw = (np.c_[P, np.ones(len(P))] @ W.T)[:, :3]
                if np.linalg.det(W[:3, :3]) < 0: I = I[:, ::-1]
                L = partes.setdefault(mi, {'P': [], 'UV': [], 'I': [], 'n': 0})
                L['P'].append(Pw); L['UV'].append(UV); L['I'].append(I + L['n']); L['n'] += len(Pw)
        for c in nd.get('children', []): anda(c, W)
    for r in g['scenes'][g.get('scene', 0)]['nodes']: anda(r, np.eye(4))
    saida = []
    for mi, L in partes.items():
        mat = g['materials'][mi] if mi >= 0 else {}; pb = mat.get('pbrMetallicRoughness') or {}; img = None; bt = pb.get('baseColorTexture')
        if bt is not None:
            src = g['textures'][bt['index']].get('source')
            if src is not None: img = base + g['images'][src]['uri']
        saida.append({'P': np.concatenate(L['P']), 'UV': np.concatenate(L['UV']), 'I': np.concatenate(L['I']), 'img': img,
                      'fator': pb.get('baseColorFactor', [1, 1, 1, 1]), 'nome': mat.get('name', str(mi))})
    if not saida: raise ValueError('nenhum nó casou com ' + filtro)
    return z, saida

GRANDES = {'carroCoberto', 'troncoCaido'}   # só estes passam de 512 px (o resto é móvel/objeto de até 2 m: 512 basta e gasta 4x menos memória)
def converter(gid, src, alvo, lado, nos=None):
    if gid not in GRANDES: lado = min(lado, 512)
    t0 = time.time(); z, partes = ler_nos(acha(src), nos) if nos else ler_gltf(acha(src))
    allP = np.concatenate([p['P'] for p in partes]); lo = allP.min(0); hi = allP.max(0)
    base = np.array([(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2]); tot = sum(len(p['I']) for p in partes)
    out = {'tipo': 'objeto', 'src': src, 'partes': [], 'tex': {}}
    for p in partes:
        P = p['P'] - base; a = max(80, int(alvo * len(p['I']) / tot))
        Pn, Un, In = simplifica(P, p['UV'], p['I'], a); m = malha(Pn, Un, In); m['mat'] = p['nome']; out['partes'].append(m)
        if p['nome'] not in out['tex']:
            if p['img']: out['tex'][p['nome']] = webp(abre(z, p['img'], lado), 80)
            else:   # sem textura: um quadradinho da cor do material
                from PIL import Image
                f = p.get('fator') or [0.6, 0.6, 0.6, 1]; out['tex'][p['nome']] = webp(Image.new('RGB', (8, 8), tuple(int(255 * max(0, min(1, c)) ** (1 / 2.2)) for c in f[:3])), 90)
    out['lo'] = [round(float(v), 3) for v in (lo - base)]; out['hi'] = [round(float(v), 3) for v in (hi - base)]
    print('%-18s %-28s tri %5d de %6d  tam %s  %.0fs' % (gid, src, sum(m['tri'] for m in out['partes']), tot, np.round(hi - lo, 2).tolist(), time.time() - t0), flush=True)
    return out

antigo = {}
if os.path.exists(SAIDA):
    s = open(SAIDA, encoding='utf-8').read(); i = s.index('const PROPS3D=') + len('const PROPS3D='); antigo = json.loads(s[i:s.rindex(';')])
for gid in (PEDIDOS or list(MODELOS)):
    try: antigo[gid] = converter(gid, *MODELOS[gid])
    except Exception as e: print(gid, 'ERRO', e)
for gid in [k for k in antigo if k not in MODELOS]: del antigo[gid]   # o que saiu da lista sai do arquivo
txt = ('/* Objetos de verdade da Poly Haven (CC0), convertidos por tools/props_banco.py: pé no chão, centrados, simplificados, textura WebP.\n'
       '   Gerado: não editar à mão. Usados pelo 62yf_props.js. */\nconst PROPS3D=' + json.dumps(antigo, separators=(',', ':')) + ';\n')
open(SAIDA, 'w', encoding='utf-8').write(txt); print('ok', SAIDA, round(len(txt) / 1e6, 1), 'MB')
