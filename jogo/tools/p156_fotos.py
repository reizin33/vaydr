"""p156: fotos da casa de dois andares montada direto (sem o passo a passo do p154): bancada construída, fantasma da escada
e da porta no modo de construção, porta aberta vista de fora."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
MONTA = ("const C=[2,-19],g=(x,z)=>X('ground')(x,z),cr=X('criarObra');window.__C=C;"
         "for(const[i,k]of[[0,0],[3,0],[0,3],[3,3]])cr('pilar',C[0]+i,C[1]+k,0,undefined,false,g(C[0]+i,C[1]+k),{top:2.4});"
         "const pl=cr('plataforma',C[0]+1.5,C[1]+1.5,0,undefined,false,2.4,{apoio:'pilar',nivel:0});"
         "cr('portaMadeira',C[0]+1.5,C[1],0,undefined,false,g(C[0]+1.5,C[1]),{aberta:true});cr('janela',C[0]+3,C[1]+1.5,Math.PI*1.5,undefined,false,g(C[0]+3,C[1]+1.5));"
         "cr('paredeCasa',C[0],C[1]+1.5,Math.PI/2,undefined,false,g(C[0],C[1]+1.5));cr('paredeCasa',C[0]+1.5,C[1]+3,Math.PI,undefined,false,g(C[0]+1.5,C[1]+3));"
         "cr('janelaAlta',C[0],C[1]+1.5,-Math.PI/2,undefined,false,2.4);cr('paredeAlta',C[0]+3,C[1]+1.5,Math.PI/2,undefined,false,2.4);cr('paredeAlta',C[0]+1.5,C[1],Math.PI,undefined,false,2.4);"
         "cr('telhado',pl.x,pl.z,0,undefined,false,2.4);"
         "const bx=C[0]+7.5,bz=C[1]+0.5;window.__b=cr('bancadaTrab',bx,bz,-0.5,undefined,false,g(bx,bz));")
s = inicio("window.__casa3=true;X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;G.chuva=0;" + MONTA + "G.fab.nv=2;n.invAdd('mochilaExpedicao',1);X('vestir')(P.inv.findIndex(q=>q&&q.id==='mochilaExpedicao'));n.invAdd('tabuas',30);n.invAdd('pregos',20);"),
      ev("montou", "const m={};for(const o of X('OB'))m[o.tipo]=(m[o.tipo]||0)+1;return m;")]
s += foto("811_bancada.png", "G.hora=10;const b=window.__b,C=window.__C;vai(C[0]+12,C[1]+6,X('ground')(C[0]+12,C[1]+6));"
          "const a=b.yaw+Math.PI+0.75,cx=b.x+Math.sin(a)*2.3,cz=b.z+Math.cos(a)*2.3;G.camFix={pos:[cx,b.y+1.75,cz],tgt:[b.x,b.y+0.75,b.z],fov:0.9};", 0.6, 4.0)
# fantasma da escada: no modo de construção, mirando a beirada norte da plataforma a partir do chão
s += foto("804_fantasma_escada.png", "G.hora=10;const C=window.__C,pz=C[1]+3+3.4;vai(C[0]+1.5,pz,X('ground')(C[0]+1.5,pz));P.yaw=Math.PI;P.body=P.yaw;P.pitch=0;"
          "X('modoObra')(true);X('OBRA').tipo='escadaMadeira';X('obraAlvo')();G.camFix={pos:[C[0]+6.5,X('ground')(C[0]+6,C[1]+8)+3.2,C[1]+9.5],tgt:[C[0]+1.5,1.2,C[1]+4.2],fov:1.0};", 0.6, 4.0)
s += [ev("fantasma_escada", "const O=X('OBRA');return{ativo:O.ativo,tipo:O.tipo,ok:O.ok,motivo:O.motivo,ext:O.ext};"), js("X('modoObra')(false);")]
# fantasma da porta encaixando entre dois pilares novos
s += foto("805_fantasma_porta.png", "G.hora=10;const C=window.__C,cr=X('criarObra'),g=(x,z)=>X('ground')(x,z);for(const k of[6,9])cr('pilar',C[0]+k,C[1]+5,0,undefined,false,g(C[0]+k,C[1]+5),{top:g(C[0]+k,C[1]+5)+2.6});"
          "const c0=n.cfg.cam;n.cfg.cam='1';const yaw=0;vai(C[0]+7.5,C[1]+5-3.2,g(C[0]+7.5,C[1]+1.8));P.yaw=yaw;P.body=yaw;P.pitch=0;X('cam').fwd=[0,0,1];X('modoObra')(true);X('OBRA').tipo='portaMadeira';X('obraAlvo')();n.cfg.cam=c0;"
          "window.__fp={ok:X('OBRA').ok,x:X('OBRA').x-C[0],z:X('OBRA').z-C[1]};G.camFix={pos:[C[0]+4.2,g(C[0]+4,C[1]+1)+2.4,C[1]+0.8],tgt:[C[0]+7.5,1.0,C[1]+5],fov:1.0};", 0.6, 4.0)
s += [ev("fantasma_porta", "return window.__fp;"), js("X('modoObra')(false);")]
s += foto("806_porta_aberta_fora.png", "G.hora=10;const C=window.__C,g=(x,z)=>X('ground')(x,z);vai(C[0]+5,C[1]-6,g(C[0]+5,C[1]-6));G.camFix={pos:[C[0]+3.6,g(C[0]+3.5,C[1]-3.2)+1.7,C[1]-3.2],tgt:[C[0]+1.5,g(C[0]+1.5,C[1])+1.1,C[1]+0.8],fov:1.0};", 0.6, 4.0)
salvar('p156.json', s)
