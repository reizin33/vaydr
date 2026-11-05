"""p191g: fotos de conferência da Etapa 20: o horizonte do mar (sem serra por cima do mar), o farol na ponta norte, mergulhando
perto do veleiro e um píer de dois trechos com baú em cima."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const olha=(x,y,z)=>mira(x,y,z),cam1=()=>{n.cfg.cam='1';},cam3=()=>{n.cfg.cam='3';},hora=(d,h)=>{G.dia=d;G.hora=h;G.t+=1e-3;},pos=(x,z,y)=>{vai(x,z,y);P.vx=P.vz=0;};")
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};G.porto={abertos:{},povoado:99};")]
s += foto("e20_farol.png", H + "window.__semRender=false;hora(3,10);cam1();pos(338,-120);const FA=X('FAROL');olha(FA.x,6,FA.z);", antes=0.4, esp=2.5)
# píer de dois trechos e um baú em cima
s += foto("e20_porto2.png", H + "window.__semRender=false;hora(3,10);cam1();pos(331,8);olha(383,6,4);", antes=0.4, esp=2.5)
salvar('p191h.json', s, vp=(960, 540))
