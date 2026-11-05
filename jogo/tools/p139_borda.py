"""p139: trechos da borda da cidade onde o jogador chega e bate no limite do mapa sem nada desenhado (parede invisível)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("borda", open(os.path.join(os.path.dirname(__file__), 'p139_borda.js'), encoding='utf-8').read())]
salvar('p139.json', s)
