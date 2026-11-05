"""p209f: fotos de conferência da Etapa 25: a cachoeira depois do ajuste das pedras (as pedras da encosta descem até o chão
do lado de baixo), de frente (do poço, o mesmo lugar da foto e22_cachoeira) e de lado; a beira de mata fechada vista de uns
13 m num ponto sem pedra nem árvore na frente; os degraus da subida; e o planalto visto do bloqueio, de manhã e sem zumbi na frente."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const cam1=()=>{n.cfg.cam='1';},hora=h=>{G.hora=h;G.t+=1e-3;},pos=(x,z,y)=>{vai(x,z,y===undefined?X('chaoEm')(x,z,X('ground')(x,z)+1):y);P.vx=P.vz=0;};")
# ponto da beira com a vista limpa: nenhuma pedra, árvore ou moita no caminho entre 136 m e 147 m do centro
BEIRA = ("const sd=X('segDist'),RK=X('ROCKS'),TR=X('TREES'),BU=X('BUSHES');let A=null;for(let i=0;i<120&&A===null;i++){const a=2.0+i*0.02,x0=Math.cos(a)*136,z0=Math.sin(a)*136,x1=Math.cos(a)*147,z1=Math.sin(a)*147;"
         "if(RK.some(r=>r.alive&&sd(r.x,r.z,x0,z0,x1,z1)<2.2*r.s))continue;if(TR.some(t=>t.alive&&sd(t.x,t.z,x0,z0,x1,z1)<1.4))continue;if(BU.some(b=>sd(b.x,b.z,x0,z0,x1,z1)<1.2))continue;A=a;}"
         "window.__beira=A;const a=A===null?2.3:A;pos(Math.cos(a)*136,Math.sin(a)*136);mira(Math.cos(a)*152,1.2,Math.sin(a)*152);")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};X('perfDone=true');"),
      js("vai(47,-170,X('ground')(47,-170)+1);"), ["gwait", 2.0]]
s += foto("e25_cachoeira.png", H + "window.__semRender=false;hora(11);cam1();pos(47,-170);mira(44,6,-189);", antes=0.8, esp=3.0)
s += foto("e25_cachoeiraLado.png", H + "window.__semRender=false;hora(11);cam1();pos(56,-176);mira(44,5,-188);", antes=0.6, esp=3.0)
s += foto("e25_degraus.png", H + "window.__semRender=false;hora(11);cam1();pos(57.5,-165);mira(65,8,-188);", antes=0.6, esp=3.0)
s += foto("e25_planalto.png", H + "window.__semRender=false;hora(10);cam1();pos(74,-206);mira(30,19,-240);", antes=1.0, esp=3.0)
s += foto("e25_beira.png", H + "window.__semRender=false;hora(10);cam1();" + BEIRA, antes=1.0, esp=3.0)
s += [ev("beira", "return{angulo:window.__beira};")]
salvar('p209f.json', s)
