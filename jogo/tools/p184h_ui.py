"""p184h: fotos da interface da Etapa 17 (tela de fios e painel de energia), sem redesenhar o 3D (o print com o 3D rodando por trás estoura o tempo sem placa de vídeo)."""
import sys, os, io, contextlib; sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import p184f_fotos as f
from vt import *
k = next(i for i, st in enumerate(f.s) if st[0] == 'js' and 'window.__fila=[]' in st[1])
s = f.s[:k + 1]
H = f.H
s += [js(H + "window.__semRender=true;G.modo='jogo';vai(C[0]+1,C[1]+4);X('abrirFios')(window.__pe.ger);const T=X('FT');T.sel=window.__pe.ger;X('fiosRender')(true);"), ["wait", 1.0], ["shot", "e17_tela_fios.png"],
      js(H + "X('fecharFios')();X('abrirEnergia')(window.__fila[0]);"), ["wait", 1.0], ["shot", "e17_painel.png"],
      js(H + "X('fecharEstacao')();X('abrirEnergia')(window.__fila[3]);"), ["wait", 1.0], ["shot", "e17_painel_sensor.png"],
      js(H + "X('fecharEstacao')();")]
salvar('p184h.json', s)
