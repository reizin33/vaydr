"""p162f: foto do quadro da missão com a linha do guia "Primeira casa" (só para conferir o visual novo)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)z.vivo=false;n.Z.length=0;};n.invAdd('graveto',4);n.invAdd('pedra',2);n.invAdd('fibra',5);"), ["gwait", 2.5]]
s += foto('p162_guia_hud.png', "G.hora=10;", 0.3, 3.0)
salvar('p162f.json', s)
