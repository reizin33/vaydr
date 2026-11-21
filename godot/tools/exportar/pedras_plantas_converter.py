"""Grava dados/mapa/pedras_plantas.json a partir da consulta consultas/pedras_plantas.js (resultado do servidor de exportação):
paredões e pedras soltas da Serra Velha e a folhagem do chão da mata, com a altura de cada variante de planta do jogo antigo
(MATA.<espécie>.variantes[i].hi[1] vezes o fator de cada espécie em 62ya_mata_chao.js: calathea 1,9, antúrio 1,7, monguba 1,25).
Uso: python3 -I pedras_plantas_converter.py <resultado.json> <godot/dados/mapa/pedras_plantas.json>"""
import json, sys

r = json.load(open(sys.argv[1], encoding='utf-8'))
r = json.loads(r) if isinstance(r, str) else r
saida = {
    'paredoes': r['aflor'],      # [x, y, z, giro, tamanho, tipo (0 "mountainside", 1 "rock_face_01")]
    'soltas': r['soltas'],       # [x, y, z, giro, tamanho, variante (0 matacão, 1-7 pedras com musgo)]
    'folhagem': r['pl'],         # [x, y, z, giro, tamanho, variante (0-4 calathea, 5-10 antúrio, 11-14 monguba)]
    'alt_folhagem': [round(h * 1.9, 3) for h in (0.424, 0.303, 0.284, 0.13, 0.152)] +
                    [round(h * 1.7, 3) for h in (0.5, 0.472, 0.301, 0.359, 0.159, 0.139)] +
                    [round(h * 1.25, 3) for h in (1.302, 0.735, 1.149, 1.902)],
}
json.dump(saida, open(sys.argv[2], 'w'), separators=(',', ':'))
print({k: len(v) for k, v in saida.items()})
