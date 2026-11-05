"""p138: colisores da cidade que bloqueiam no nível da rua sem nenhuma geometria desenhada perto da borda (parede invisível)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("invis", open(os.path.join(os.path.dirname(__file__), 'p138_invis.js'), encoding='utf-8').read())]
salvar('p138.json', s)
