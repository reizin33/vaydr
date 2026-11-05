"""p157: parede em chão mais alto embaixo da plataforma não vira degrau invisível no andar de cima; pilar mais resistente."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("window.__casa3=true;X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;"),
      ev("teto", "const C=[2,-19],g=(x,z)=>X('ground')(x,z),cr=X('criarObra');"
         # parede criada ANTES da plataforma, 0,35 m acima do chão (como num terreno inclinado)
         "const w1=cr('paredeCasa',C[0]+1.5,C[1]+3,Math.PI,undefined,false,g(C[0]+1.5,C[1]+3)+0.35);const y1a=w1.col.y1;"
         "for(const[i,k]of[[0,0],[3,0],[0,3],[3,3]])cr('pilar',C[0]+i,C[1]+k,0,undefined,false,g(C[0]+i,C[1]+k),{top:2.4});"
         "const pl=cr('plataforma',C[0]+1.5,C[1]+1.5,0,undefined,false,2.4,{apoio:'pilar',nivel:0});"
         # porta criada DEPOIS da plataforma, também em chão mais alto
         "const dp=cr('portaMadeira',C[0]+1.5,C[1],0,undefined,false,g(C[0]+1.5,C[1])+0.35);"
         # porta e janela no chão plano (o caso comum): a verga não pode subir acima do piso de cima
         "const dq=cr('portaMadeira',C[0],C[1]+1.5,Math.PI/2,undefined,false,g(C[0],C[1]+1.5));const jq=cr('janela',C[0]+3,C[1]+1.5,Math.PI*1.5,undefined,false,g(C[0]+3,C[1]+1.5));"
         "const pil=X('OB').find(o=>o.tipo==='pilar');"
         "const em=(x,z)=>!!X('bloqueadoAlto')(x,z,0.3,pl.y);"
         "return{platY:r2(pl.y),paredeAntes:r2(y1a),paredeDepois:r2(w1.col.y1),portaCols:dp.cols.map(c=>r2(c.y1)),"
         "emCimaParede:em(C[0]+1.5,C[1]+2.85),emCimaPorta:em(C[0]+1.5,C[1]+0.15),noChaoParede:!!X('bloqueadoAlto')(C[0]+1.5,C[1]+3,0.3,g(C[0]+1.5,C[1]+3)),pilarHp:pil.hp,"
         "portaPlanaCols:dq.cols.map(c=>[r2(c.y0),r2(c.y1)]),janelaPlanaCols:jq.cols.map(c=>[r2(c.y0),r2(c.y1)]),"
         "emCimaPortaPlana:em(C[0]+0.15,C[1]+1.5),emCimaJanelaPlana:em(C[0]+2.85,C[1]+1.5),"
         "noChaoPortaPlana:!!X('bloqueadoAlto')(C[0],C[1]+1.5,0.3,g(C[0],C[1]+1.5)),noChaoJanelaPlana:!!X('bloqueadoAlto')(C[0]+3,C[1]+1.5,0.3,g(C[0]+3,C[1]+1.5))};")]
salvar('p157.json', s)
