"""p191f: fotos da Etapa 20: o porto e o navio vistos da avenida, o convés entre os contêineres, a praia com o farol, a mesma
vista na maré baixa e na maré alta (lua cheia), o naufrágio na maré baixa, pescando no cais (vara e linha) e caranguejos."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const olha=(x,y,z)=>mira(x,y,z),cam1=()=>{n.cfg.cam='1';},cam3=()=>{n.cfg.cam='3';},hora=(d,h)=>{G.dia=d;G.hora=h;G.t+=1e-3;},"
     "pos=(x,z,y)=>{vai(x,z,y);P.vx=P.vz=0;};")
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};"
         "G.porto={abertos:{},povoado:99};")]
s += foto("e20_porto.png", H + "window.__semRender=false;hora(3,10);cam1();pos(331,8);olha(383,6,4);", antes=0.4, esp=2.5)
s += foto("e20_navio.png", H + "window.__semRender=false;hora(3,10.5);cam1();pos(379.2,-14,3.85);olha(381,5.4,22);", antes=0.4, esp=2.5)
s += foto("e20_praia.png", H + "window.__semRender=false;hora(3,11);cam1();pos(346,-34);olha(318,4,-190);", antes=0.4, esp=2.5)
s += foto("e20_mare_baixa.png", H + "window.__semRender=false;hora(3,8.6);cam1();pos(339,62);olha(380,-1.5,112);", antes=0.4, esp=2.5)
s += foto("e20_mare_alta.png", H + "window.__semRender=false;hora(3,14.8);cam1();pos(339,62);olha(380,-1.5,112);", antes=0.4, esp=2.5)
s += foto("e20_naufragio.png", H + "window.__semRender=false;hora(3,8.6);cam3();pos(360,99);olha(372,-1,112);P.body=P.yaw;", antes=0.6, esp=2.5)
s += foto("e20_pesca_cais.png", H + "window.__semRender=false;hora(3,16);cam3();n.invAdd('vara',1);sel('vara');pos(373.6,-3.4,0.35);P.yaw=Math.PI+0.25;P.body=P.yaw-0.25;P.pitch=-0.15;"
          "const bz=-11,bx=372;P.pesca={x:bx,y:X('marNivel')(),z:bz,t:3,morde:99,mordeu:false,janela:0,px:P.x,pz:P.z,mar:true};P.yaw+=1.9;", antes=0.6, esp=2.5)
s += foto("e20_caranguejos.png", H + "window.__semRender=false;P.pesca=null;hora(3,8.4);cam3();const C=X('CRABS');C.length=0;const L=X('marLinhaD')(70),p=X('marPonto')(70,L-2.5);pos(p[0]-3.2,70);P.yaw=Math.PI/2;P.body=P.yaw;P.pitch=-0.35;"
          "for(let i=0;i<5;i++){const x=p[0]+(Math.random()-0.5)*3,z=70+(Math.random()-0.5)*3;C.push({x,z,y:X('ground')(x,z),yaw:Math.random()*6,dir:0,st:'anda',t:99,v:0,s:1.3,fase:0});}P.agachado=true;", antes=0.2, esp=2.5)
salvar('p191f.json', s, vp=(960, 540))
