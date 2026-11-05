"""p211f: fotos de conferência da Etapa 25 (segunda tentativa das que não saíram no p209f): a beira de mata fechada vista
de uns 12 m (ponto sem pedra nem árvore na frente e a vegetação da beira montada na hora), os degraus da subida com a placa
de madeira, e o planalto visto do bloqueio, de manhã e sem zumbi na frente."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const cam1=()=>{n.cfg.cam='1';},hora=h=>{G.hora=h;G.t+=1e-3;},pos=(x,z,y)=>{vai(x,z,y===undefined?X('chaoEm')(x,z,X('ground')(x,z)+1):y);P.vx=P.vz=0;X('rebuildVeg')(true);};")
BEIRA = ("const sd=X('segDist'),RK=X('ROCKS'),TR=X('TREES'),BU=X('BUSHES');let A=null;for(let i=0;i<160&&A===null;i++){const a=2.0+i*0.02,x0=Math.cos(a)*138,z0=Math.sin(a)*138,x1=Math.cos(a)*148,z1=Math.sin(a)*148;"
         "if(RK.some(r=>r.alive&&(sd(r.x,r.z,x0,z0,x1,z1)<2.4*r.s||Math.hypot(r.x-x0,r.z-z0)<5)))continue;if(TR.some(t=>t.alive&&(sd(t.x,t.z,x0,z0,x1,z1)<1.8||Math.hypot(t.x-x0,t.z-z0)<4.5)))continue;if(BU.some(b=>sd(b.x,b.z,x0,z0,x1,z1)<1.4))continue;A=a;}"
         "window.__beira=A;const a=A===null?2.3:A;pos(Math.cos(a)*138,Math.sin(a)*138);mira(Math.cos(a)*152,1.2,Math.sin(a)*152);")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};X('perfDone=true');"),
      ["gwait", 1.0]]
s += foto("e25_beira.png", H + "window.__semRender=false;hora(10);cam1();" + BEIRA, antes=2.0, esp=4.0)
s += [ev("beira", "return{angulo:window.__beira,moitasPerto:X('BRENHA').filter(b=>Math.hypot(b.x-P.x,b.z-P.z)<25).length,naMalha:X('MESH').brenha.n};")]
s += foto("e25_degraus.png", H + "window.__semRender=false;hora(11);cam1();pos(57.5,-165);mira(65,8,-188);", antes=2.0, esp=4.0)
s += foto("e25_planalto.png", H + "window.__semRender=false;hora(10);cam1();pos(74,-206);mira(30,19,-240);", antes=2.0, esp=4.0)
salvar('p211f.json', s)
