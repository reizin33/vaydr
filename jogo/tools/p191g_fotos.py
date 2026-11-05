"""p191g: fotos de conferência da Etapa 20: o horizonte do mar (sem serra por cima do mar), o farol na ponta norte, mergulhando
perto do veleiro e um píer de dois trechos com baú em cima."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const olha=(x,y,z)=>mira(x,y,z),cam1=()=>{n.cfg.cam='1';},cam3=()=>{n.cfg.cam='3';},hora=(d,h)=>{G.dia=d;G.hora=h;G.t+=1e-3;},pos=(x,z,y)=>{vai(x,z,y);P.vx=P.vz=0;};")
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};G.porto={abertos:{},povoado:99};")]
s += foto("e20_horizonte.png", H + "window.__semRender=false;hora(3,10);cam1();pos(347,-60);olha(520,0,-40);", antes=0.4, esp=2.5)
s += foto("e20_farol.png", H + "window.__semRender=false;hora(3,10);cam1();pos(338,-120);const FA=X('FAROL');olha(FA.x,6,FA.z);", antes=0.4, esp=2.5)
# píer de dois trechos e um baú em cima
s += [j("hora(3,10);n.invAdd('tabuas',60);n.invAdd('madeira',30);n.invAdd('pregos',60);cam1();const b=X('marPonto')(-100,X('marLinhaD')(-100)-1.0);pos(b[0],b[1]);P.yaw=Math.PI/2+0.3;P.body=P.yaw;P.pitch=-0.2;"
        "X('modoObra')(true);X('OBRA').tipo='pier';X('obraAlvo')();X('colocarObra')();X('modoObra')(false);const p=X('OB')[X('OB').length-1];window.__p1=p;"
        "pos(p.x+Math.sin(p.yaw)*2.4,p.z+Math.cos(p.yaw)*2.4,p.y);P.yaw=p.yaw;P.body=P.yaw;X('modoObra')(true);X('OBRA').tipo='pier';X('obraAlvo')();X('colocarObra')();"
        "const q=X('OB')[X('OB').length-1];pos(q.x-Math.sin(q.yaw)*1.0,q.z-Math.cos(q.yaw)*1.0,q.y);P.yaw=q.yaw;P.body=P.yaw;P.pitch=-0.6;n.invAdd('tabuas',10);X('OBRA').tipo='bau';X('obraAlvo')();window.__bauOk=X('OBRA').ok+':'+X('OBRA').motivo;X('colocarObra')();X('modoObra')(false);")]
s += foto("e20_pier.png", H + "window.__semRender=false;cam3();const p=window.__p1;pos(p.x-Math.sin(p.yaw)*9-Math.cos(p.yaw)*6,p.z-Math.cos(p.yaw)*9+Math.sin(p.yaw)*6);olha(p.x+Math.sin(p.yaw)*4,0.5,p.z+Math.cos(p.yaw)*4);P.body=P.yaw;", antes=0.4, esp=2.5)
s += [ev("bauNoPier", "return{bau:window.__bauOk,obras:X('OB').filter(o=>['pier','bau'].includes(o.tipo)).map(o=>o.tipo+':'+Math.round(o.y*100)/100)};")]
s += foto("e20_mergulho.png", H + "window.__semRender=false;hora(3,11);cam1();const it=X('INTER').find(i=>i.id==='veleiro-bau');pos(it.x-4,it.z-4,X('marNivel')()-1.3);P.nada={t:0};P.mergulho=3.0;P.y=X('marNivel')()-1.32-3.0;olha(it.x,it.y,it.z);", antes=0.05, esp=2.0)
salvar('p191g.json', s, vp=(960, 540))
