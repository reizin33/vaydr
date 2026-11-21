"""Converte os objetos 3D do VAYDR antigo (exportados pelo servidor de exportação) para o Godot:
  - os modelos escaneados dos móveis e da rua (PROPS3D, Poly Haven) e dos lugares (LUGX: galpão, bunker, casa abandonada,
    prédios destruídos, ruína, carros destruídos, Base Militar...) e as carcaças de ônibus, caminhão e ambulância ->
    dados/mapa/malhas/modelos.{bin,json}, no espaço do próprio modelo (cada parte com a textura dela);
  - as peças do kit nas fachadas e nos telhados da cidade (KIT: calhas, ar-condicionado, caixas d'água, antenas, barracos,
    portas de enrolar, tambores, caçambas e os fios) -> dados/mapa/malhas/kit.{bin,json}, já no lugar (um bloco por quarteirão);
  - onde cada objeto fica (matriz de cada um: móveis de dentro das casas e prédios, objetos da rua, do acampamento e os
    lugares) -> dados/mapa/objetos3d.json;
  - as texturas (WebP/JPEG/PNG como vieram) -> assets/mapa/<nome>.<ext> (o Godot importa com mipmaps e compressão).
Uso: python3 -I objetos_converter.py <pasta_dos_json_exportados> <pasta godot>"""
import base64, json, os, sys, zlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from malhas_converter import converter

ent, godot = sys.argv[1], sys.argv[2]


def ler(nome):
    v = json.load(open(os.path.join(ent, nome), encoding='utf-8'))
    v = json.loads(v) if isinstance(v, str) else v
    if isinstance(v, dict) and 'erro' in v:
        raise SystemExit(nome + ': ' + v['erro'][:500])
    return v


pasta_tex = os.path.join(godot, 'assets', 'mapa')
os.makedirs(pasta_tex, exist_ok=True)
EXT = {'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png'}


def salvar_tex(nome, url):
    cab, dados = url.split(',', 1)
    mime = cab[5:].split(';')[0]
    ext = EXT.get(mime, 'png')
    arq = os.path.join(pasta_tex, nome + '.' + ext)
    open(arq, 'wb').write(base64.b64decode(dados))
    return 'res://assets/mapa/%s.%s' % (nome, ext)


def gravar(saida, recs, texs):
    indice = []
    with open(saida + '.bin', 'wb') as out:
        for rec in recs:
            if not rec.get('n'):
                continue
            bruto, nu, ni, lo, hi, tem_uv = converter(rec)
            z = zlib.compress(bruto, 6)
            info = {k: v for k, v in rec.items() if k not in ('d', 'uv')}
            if info.get('tex'):
                info['tex'] = texs.get(info['tex'], '')
            info.update({'off': out.tell(), 'tz': len(z), 't': len(bruto), 'nu': nu, 'ni': ni, 'lo': lo, 'hi': hi, 'uv': tem_uv})
            out.write(z)
            indice.append(info)
    json.dump(indice, open(saida + '.json', 'w', encoding='utf-8'), ensure_ascii=False)
    print('%s: %d malhas, %.1f MB' % (os.path.basename(saida), len(indice), os.path.getsize(saida + '.bin') / 1e6))


props = ler('l_props_modelos.json')
lug = ler('m_lug_modelos.json')
kit = ler('n_kit.json')
inst = ler('o_inst.json')
# carcaças de ônibus, caminhões e ambulância (feitas peça por peça no jogo antigo: vêm só com a cor de cada peça)
carc = ler('p_carc.json') if os.path.exists(os.path.join(ent, 'p_carc.json')) else {'modelos': [], 'texturas': {}}

texs = {}
for fonte in (props, lug, kit):
    for nome, url in fonte['texturas'].items():
        if url:
            texs[nome] = salvar_tex(nome, url)
print('texturas:', len(texs))

malhas = os.path.join(godot, 'dados', 'mapa', 'malhas')
gravar(os.path.join(malhas, 'modelos'), props['modelos'] + lug['modelos'] + carc['modelos'], texs)
gravar(os.path.join(malhas, 'kit'), kit['modelos'], texs)

# matrizes: base (3 colunas) e origem, 12 números
saida = {}
usados = set()
for cat, lista in inst.items():
    L = []
    for o in lista:
        M = o['M']
        q = {'m': o['m'], 'xf': [M[0], M[1], M[2], M[4], M[5], M[6], M[8], M[9], M[10], M[12], M[13], M[14]]}
        for k in ('r', 'L', 'dist', 'id', 'nome', 'piso', 'p', 'y', 'k'):
            if k in o:
                q[k] = o[k]
        L.append(q)
        usados.add(o['m'])
    saida[cat] = L
saida['creditos'] = {'lugares': lug.get('creditos', {}), 'kit': kit.get('credito', '')}
json.dump(saida, open(os.path.join(godot, 'dados', 'mapa', 'objetos3d.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
modelos = {r['modelo'] for r in props['modelos'] + lug['modelos'] + carc['modelos']}
print('objetos:', {k: len(v) for k, v in saida.items() if isinstance(v, list)}, '| modelos usados sem malha:', sorted(usados - modelos))
