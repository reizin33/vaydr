"""p163f: foto da tela do rádio com o pedido aberto (conferir o visual novo depois do ajuste dos botões)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
exec(open(os.path.join(os.path.dirname(__file__),'p163_etapa6.py')).read().split("s = inicio(")[0].split("from vt import *")[1])
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;G.m.etapa=Math.max(2,G.m.etapa);const p=livre(F[0]-14,F[2]-11,1.5);cr('antenaBase',p[0],p[1],0,undefined,false,gr(p[0],p[1]));X('terrOfertas')();n.invAdd('gasolina',2);n.invAdd('municao9',20);X('abrirRadio')();"),
      ["wait", 0.4], ["click", ".rd-g[data-sint='estrada']"], ["wait", 0.2], ["click", "#tr-lista [data-pedir]"], ["wait", 0.2], ["click", "#tr-lista [data-qtd='1']"], ["wait", 0.2],
      js("document.querySelector('.rd-ped').scrollIntoView({block:'center'});")]
s += foto('p163_radio_pedido.png', "", 0.05, 3.0)
s += [js("document.getElementById('tr-lista').scrollTop=0;")]
s += foto('p163_radio_topo.png', "", 0.05, 2.0)
salvar('p163f.json', s)
