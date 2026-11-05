"""p184g: fotos da Etapa 17 (interface e noite): tela de fios, painel de energia, a fileira de peças de longe e as lâmpadas à noite."""
import sys, os, io, contextlib; sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import p184f_fotos as f
from vt import *
k = next(i for i, st in enumerate(f.s) if st[0] == 'js' and 'window.__fila=[]' in st[1])
s = f.s[:k + 1]
H = f.H
s += foto("e17_tela_fios.png", H + "window.__semRender=false;G.modo='jogo';vai(C[0]+1,C[1]+4);X('abrirFios')(window.__pe.ger);const T=X('FT');T.sel=window.__pe.ger;X('fiosRender')(true);", antes=0.3, esp=1.5)
s += [js(H + "X('fecharFios')();")]
s += foto("e17_painel.png", H + "window.__semRender=false;G.modo='jogo';X('abrirEnergia')(window.__fila[0]);", antes=0.3, esp=1.5)
s += [js(H + "X('fecharEstacao')();")]
s += foto("e17_noite2.png", H + "window.__semRender=false;n.cfg.cam='1';G.hora=21.5;const L=window.__fila[5];vai(L.x+1.5,L.z+6);olha(L.x,L.y+0.6,L.z-1);", antes=1.0, esp=3.0)
salvar('p184g.json', s)
