"""p208f: fotos de conferência depois dos ajustes (com o jogador na altura certa no planalto): placa de madeira sem desenho de tijolo, a mata vista de longe (árvores leves
até mais longe), a beira de mata fechada vista de uns 12 m, o planalto com a encosta de mata, e o balão do campo voando sobre
o Alto (visto do cesto e de longe)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const cam1=()=>{n.cfg.cam='1';},cam3=()=>{n.cfg.cam='3';},hora=h=>{G.hora=h;G.t+=1e-3;},pos=(x,z,y)=>{vai(x,z,y===undefined?X('chaoEm')(x,z,X('ground')(x,z)+1):y);P.vx=P.vz=0;};")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};X('perfDone=true');"),
      js("vai(50,-230);"), ["gwait", 2.0]]
s += foto("e22b_placa.png", H + "window.__semRender=false;hora(11);cam1();const p=X('ARC_LAY').trilha.placa;pos(p.x+Math.sin(p.yaw+Math.PI)*3.2,p.z+Math.cos(p.yaw+Math.PI)*3.2);mira(p.x,ground_?0:1.9,p.z);".replace("ground_?0:1.9","X('ground')(p.x,p.z)+1.9"), antes=0.6, esp=3.0)
s += foto("e22b_mataLonge.png", H + "window.__semRender=false;hora(10);cam1();pos(30,-84);mira(36,4,-200);", antes=1.0, esp=3.0)
s += foto("e22b_beira.png", H + "window.__semRender=false;hora(10);cam1();const a=2.3;pos(Math.cos(a)*137,Math.sin(a)*137);mira(Math.cos(a)*160,1.0,Math.sin(a)*160);", antes=0.6, esp=3.0)
s += foto("e22b_planalto.png", H + "window.__semRender=false;hora(15);cam1();pos(74,-206);mira(30,19,-240);", antes=1.0, esp=3.0)
s += foto("e22b_pousada.png", H + "window.__semRender=false;hora(16);cam1();pos(44,-246);mira(24,18.5,-230);", antes=0.8, esp=3.0)
s += foto("e22b_galpao.png", H + "window.__semRender=false;hora(13);cam1();pos(40,-262);mira(58,19,-258);", antes=0.8, esp=3.0)
s += foto("e22b_balaoCaido.png", H + "window.__semRender=false;hora(12);cam1();pos(96,-232);mira(100,16,-214);", antes=0.8, esp=3.0)
# balão: conserta, sobe e voa
s += [js(H + "n.invAdd('pano',8);n.invAdd('corda',4);n.invAdd('sucata',2);n.invAdd('pecasMaquina',1);n.invAdd('botijaoGas',2);const b=X('balD')();vai(b.x+1.6,b.z);window.__a={k:'balaoCesto',o:b};X('alvoInter=window.__a');X('interagir')(true);X('interagir')(true);"
         "const cp=window.__cadaPasso;window.__cadaPasso=()=>{cp();if(window.__queima)__nnc.ev('BV').queima=6;};window.__queima=true;"), ["gwait", 22.0], js("window.__queima=false;")]
s += foto("e22b_balaoCesto.png", H + "window.__semRender=false;hora(16.5);cam1();P.pitch=-0.35;P.yaw=-2.6;", antes=0.4, esp=3.0)
s += foto("e22b_balaoLonge.png", H + "window.__semRender=false;hora(16.5);cam3();n.cfg.camDist=14;P.pitch=0.1;", antes=0.4, esp=3.0)
salvar('p208f.json', s, vp=(960, 540))
