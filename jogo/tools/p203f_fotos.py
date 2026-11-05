"""p203f: fotos da Etapa 22: a borda de mata fechada, o começo da trilha, a cachoeira, os degraus, o planalto visto do bloqueio,
a pousada, o galpão, o balão caído, a vista do mirante e o mapa grande com o Alto."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const cam1=()=>{n.cfg.cam='1';},cam3=()=>{n.cfg.cam='3';},hora=h=>{G.hora=h;G.t+=1e-3;},pos=(x,z,y)=>{vai(x,z,y);P.vx=P.vz=0;};")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};X('perfDone=true');"),
      js("vai(50,-230);"), ["gwait", 2.0]]
s += foto("e22_borda.png", H + "window.__semRender=false;hora(10);cam1();const a=2.3;pos(Math.cos(a)*145,Math.sin(a)*145);mira(Math.cos(a)*160,1.2,Math.sin(a)*160);", antes=0.6, esp=3.0)
s += foto("e22_trilha.png", H + "window.__semRender=false;hora(9.5);cam1();pos(30,-84);mira(36,0.6,-112);", antes=0.6, esp=3.0)
s += foto("e22_cachoeira.png", H + "window.__semRender=false;hora(11);cam1();pos(47,-170);mira(44,6,-189);", antes=0.6, esp=3.0)
s += foto("e22_degraus.png", H + "window.__semRender=false;hora(11);cam1();pos(57.5,-165);mira(65,8,-188);", antes=0.6, esp=3.0)
s += foto("e22_planalto.png", H + "window.__semRender=false;hora(15);cam1();pos(74,-206);mira(30,19,-240);", antes=0.6, esp=3.0)
s += foto("e22_pousada.png", H + "window.__semRender=false;hora(16);cam3();pos(40,-243);mira(22,18.5,-232);", antes=0.6, esp=3.0)
s += foto("e22_galpao.png", H + "window.__semRender=false;hora(13);cam1();pos(40,-262);mira(58,19,-258);", antes=0.6, esp=3.0)
s += foto("e22_balao.png", H + "window.__semRender=false;hora(12);cam1();pos(96,-232);mira(100,15,-216);", antes=0.6, esp=3.0)
s += foto("e22_mirante.png", H + "window.__semRender=false;hora(17);cam1();const L=X('ARC_LAY').mirante;pos(L.x,L.z,L.top);mira(40,10,-190);", antes=0.6, esp=3.0)
s += [js("G.modo='jogo';window.__semRender=false;window.__turbo=1;X('abrirMapa')();"), ["wait", 2.5], ["shot", "e22_mapa.png"], js("X('fecharMapa')();window.__semRender=true;window.__turbo=6;")]
salvar('p203f.json', s, vp=(960, 540))
