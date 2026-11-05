"""p154d: depuração da subida pela escada de madeira (registra posição e chão a cada passo)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
C = [2,-19]
MONTA = ("const C=[2,-19],g=(x,z)=>X('ground')(x,z),cr=X('criarObra');"
         "for(const[i,k]of[[0,0],[3,0],[0,3],[3,3]])cr('pilar',C[0]+i,C[1]+k,0,undefined,false,g(C[0]+i,C[1]+k),{top:2.4});"
         "const pl=cr('plataforma',C[0]+1.5,C[1]+1.5,0,undefined,false,2.4,{apoio:'pilar',nivel:0});"
         "const m=X('escadaMedidas')(C[0]+1.5,C[1]+3,0,2.4);cr('escadaMadeira',C[0]+1.5,C[1]+3,0,undefined,false,2.4,{h:m.h,L:m.L,fg:m.fg});")
LOG = ("const pl=X('OB').find(o=>o.tipo==='plataforma');window.__L=window.__L||[];window.__L.push({x:r2(P.x-2),z:r2(P.z+19),y:r2(P.y),chao:r2(X('chaoEm')(P.x,P.z,P.y)),g:r2(X('ground')(P.x,P.z)),mz:X('IN').mz,modo:G.modo,noChao:P.noChao});")
s = inicio("window.__casa3=true;X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=2;window.__semRender=true;vivo();Z.length=0;G.hora=10;" + MONTA),
      ev("montou", "const e=X('OB').find(o=>o.tipo==='escadaMadeira');return{tipos:X('OB').map(o=>o.tipo).join(','),ext:e.ext,sups:e.sups.length,"
         "perfil:[0,0.3,0.5,1,1.5,2,2.5,3,3.5,4].map(t=>r2(X('chaoEm')(3.5,-16+t,5)))};"),
      js("const e=X('OB').find(o=>o.tipo==='escadaMadeira'),L=e.ext.L,fx=e.x,fz=e.z+L+0.8;vai(fx,fz,X('ground')(fx,fz));P.yaw=Math.PI;P.body=P.yaw;P.pitch=0;" + LOG),
      ["down", "w"]]
for k in range(10):
    s += [["gwait", 0.4], js(LOG)]
s += [["up", "w"], ev("log", "return window.__L;")]
salvar('p154d.json', s)
