#!/usr/bin/env python3
"""Monta dados/jogo/catalogo.json (o que o jogo Godot lê ao abrir) a partir do que foi tirado do VAYDR antigo:
  - dados/jogo/antigo_itens.json: os 213 itens (ITEMS), as 100 receitas (RECIPES), as abas da fabricação e os lugares da roupa;
  - dados/jogo/antigo_obras.json: as construções (OBRAS), as categorias delas e a tabela da fogueira (COZINHA).
Entra tudo como no jogo antigo (nomes, descrições, números, quem desbloqueia o quê). O que muda:
  - o plano de construção (como no Rust) e o martelo consertando a base;
  - as peças da casa viram as peças encaixadas na grade do Godot (fundação, parede, porta, janela, piso/teto, escada),
    com o custo das peças parecidas do jogo antigo (parede de tábuas, porta de madeira, janela, plataforma, escada interna);
  - energia, água, plantio e animais ficam para a etapa 6 (as obras dessas abas entram depois).
Uso, da raiz do repositório: python3 -I godot/tools/gerar_catalogo.py"""
import json, os, sys

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
D = os.path.join(RAIZ, 'dados', 'jogo')
ICONES = os.path.join(RAIZ, 'assets', 'icones')
a = json.load(open(os.path.join(D, 'antigo_itens.json'), encoding='utf-8'))
o = json.load(open(os.path.join(D, 'antigo_obras.json'), encoding='utf-8'))


def icone(nome):
    return nome if os.path.exists(os.path.join(ICONES, nome + '.webp')) else ''


itens = {}
for k, v in a['ITEMS'].items():
    d = dict(v)
    d['icone'] = icone(k) or icone('x_' + str(v.get('icon', '')))
    itens[k] = d
itens['plano'] = {'nome': 'Plano de construção', 'tipo': 'plano', 'max': 1, 'icone': 'x_i-plataforma',
                  'desc': 'Na mão: botão direito escolhe a peça (Q e E trocam a aba), R gira e o clique constrói. Cada peça gasta o '
                          'material na hora. Fundação, paredes, porta, janela, piso e escada se encaixam na grade; muros, defesas, '
                          'móveis e oficinas vão em qualquer lugar.'}
itens['martelo']['conserta'] = True
itens['martelo']['desc'] += ' Na base, conserta as peças estragadas (clique nelas; gasta um pouco do material de cada uma).'

receitas = [dict(r) for r in a['RECIPES']]
receitas.insert(0, {'faz': 'plano', 'n': 1, 'custo': {'madeira': 1, 'fibra': 2}, 'cat': 'ferramentas', 'etapa': 1, 'est': 0})

# as peças encaixadas da casa (grade de 3 m, como no Rust), com o custo das parecidas do jogo antigo
GRADE = {
    'fundacao': {'nome': 'Fundação', 'icon': 'i-plataforma', 'custo': {'madeira': 6, 'pedra': 6}, 'hp': 420,
                 'desc': 'O chão da casa, um pouco acima do terreno. As paredes, o piso e a escada se apoiam nela.'},
    'parede': {'nome': 'Parede de tábuas', 'icon': 'i-parede', 'custo': {'tabuas': 5, 'pregos': 2}, 'hp': 260, 'de': 'paredeCasa'},
    'porta': {'nome': 'Parede com porta', 'icon': 'i-porta', 'custo': {'tabuas': 6, 'pregos': 4}, 'hp': 280, 'de': 'portaMadeira',
              'desc': 'Parede com uma porta de madeira (E abre e fecha). Zumbi bate até quebrar.'},
    'janela': {'nome': 'Parede com janela', 'icon': 'i-janela', 'custo': {'tabuas': 5, 'pregos': 3}, 'hp': 240, 'de': 'janela'},
    'piso': {'nome': 'Piso / teto', 'icon': 'i-plataforma', 'custo': {'tabuas': 6, 'pregos': 4}, 'hp': 260, 'de': 'plataforma',
             'desc': 'Teto de um andar e chão do de cima. Apoia em paredes.'},
    'escada': {'nome': 'Escada', 'icon': 'i-escada-int', 'custo': {'tabuas': 8, 'pregos': 6}, 'hp': 200, 'de': 'escadaInterna',
               'desc': 'Escada interna: sobe ao andar de cima pelo piso.'},
}
# o que entra agora de cada aba do jogo antigo (as de energia, água, plantio e animais ficam para a etapa 6)
ABAS = [
    ('casa', 'Casa', 'i-telhado', ['fundacao', 'parede', 'porta', 'janela', 'piso', 'escada', 'tabuasPorta', 'tabuasJanela', 'tabuasJanelaX']),
    ('muros', 'Muros', 'i-muro', ['barricada', 'muro', 'muroPedra', 'palicada', 'muralha', 'portao', 'portaoGrande', 'muroFerro', 'portaoFerro']),
    ('defesa', 'Defesa', 'i-estacas', ['estacas', 'espetosFerro', 'arame', 'latas', 'armadilhaUrso', 'torreVigia']),
    ('moveis', 'Móveis', 'i-moveis', ['cama', 'camaMadeira', 'mesa', 'cadeira', 'prateleira', 'bau', 'despensa', 'armarioFerro', 'lamparina', 'lampParede']),
    ('base', 'Base', 'i-fogueira', ['fogueira', 'marcoBase']),
    ('oficina', 'Oficina', 'i-oficina', ['bancadaTrab', 'estacaoCouro', 'bancadaArmas', 'fornalha', 'defumador', 'mesaEstudo', 'bancadaDesmanche']),
]
obras, abas = {}, []
for aid, anome, aico, lista in ABAS:
    for k in lista:
        if k in GRADE:
            g = GRADE[k]
            base = dict(o['OBRAS'].get(g.get('de', ''), {}))
            base.update({'nome': g['nome'], 'icon': g['icon'], 'custo': g['custo'], 'hp': g['hp'], 'grade': True, 'etapa': 1})
            if 'desc' in g:
                base['desc'] = g['desc']
            base.pop('alto', None)
            ob = base
        else:
            ob = dict(o['OBRAS'][k])
        ob['cat'] = aid
        ob['icone'] = icone('x_' + str(ob.get('icon', '')))
        obras[k] = ob
    abas.append({'id': aid, 'nome': anome, 'icone': icone('x_' + aico), 't': lista})

# estação de cada receita (o "est" do jogo antigo) -> a obra que precisa estar perto (4 m)
ESTACOES = {'1': ['bancadaTrab', 'Bancada de trabalho'], '2': ['bancadaTrab', 'Bancada de trabalho (nível 2)'],
            'couro': ['estacaoCouro', 'Estação de couro'], 'forja': ['fornalha', 'Fornalha'], 'armas': ['bancadaArmas', 'Bancada de armas'],
            'mecanica': ['bancadaDesmanche', 'Bancada de desmanche'], 'desmanche': ['bancadaDesmanche', 'Bancada de desmanche'],
            'fogo': ['fogueira', 'Fogueira'], 'conserva': ['defumador', 'Defumador'], 'estudo': ['mesaEstudo', 'Mesa de estudo']}
# melhorar a bancada para o nível 2 (as receitas "est 2" e as que pedem oficina)
MELHORA = {'custo': {'tabuas': 8, 'pregos': 6, 'sucata': 4, 'corda': 2}}

cat = {'itens': itens, 'receitas': receitas, 'cats': a['FAB_CATS'], 'slots': a['ROUPA_SLOTS'], 'obras': obras, 'abas_obra': abas,
       'cozinha': o['COZINHA'], 'estacoes': ESTACOES, 'melhora_bancada': MELHORA, 'bau_n': 16}
saida = os.path.join(D, 'catalogo.json')
json.dump(cat, open(saida, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
sem = [k for k, v in itens.items() if not v.get('icone')]
print('itens %d (sem ícone: %s), receitas %d, obras %d em %d abas, %.0f KB' % (len(itens), sem, len(receitas), len(obras), len(abas),
                                                                                 os.path.getsize(saida) / 1024))
