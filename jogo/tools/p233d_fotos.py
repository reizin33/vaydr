"""p233d (Parte 2): fotos da Mata dos Morros: dentro da mata a oeste, na beira nova (mato fechado), no morro do sul e o mapa grande."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;X('BICHOS').length=0;G.hora=11;")]
s += foto("p233_mata.png", "vai(-170,3);P.yaw=-Math.PI/2;P.body=P.yaw;P.pitch=-0.04;G.hora=11;")
s += foto("p233_beira.png", "vai(-183,3);P.yaw=-Math.PI/2;P.body=P.yaw;P.pitch=-0.04;G.hora=11;")
s += foto("p233_volta.png", "vai(-186,3);P.yaw=Math.PI/2;P.body=P.yaw;P.pitch=-0.06;G.hora=11;")
s += foto("p233_sul.png", "vai(-24,176);P.yaw=0.15;P.body=P.yaw;P.pitch=-0.02;G.hora=11;")
s += [js("vai(-176,3);X('abrirMapa')();window.__semRender=false;window.__turbo=1;"), ["wait", 2.5], ["shot", "p233_mapa.png"],
      js("X('fecharMapa')();window.__semRender=true;window.__turbo=6;")]
salvar('tools/p233d_fotos.json', s, vp=(960, 540))
