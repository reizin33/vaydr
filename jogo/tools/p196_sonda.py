import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const hora=(d,h)=>{G.dia=d;G.hora=h;G.t+=1e-3;},beira=(z,o)=>X('marPonto')(z,X('marLinhaD')(z)+(o||0));")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=1;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};"),
      js(H+"hora(3,10);P.nada=null;const b=beira(80,0.4);vai(b[0],b[1]);P.yaw=Math.PI/2;P.body=P.yaw;"), ["gwait", 0.4],
      ev("sonda", H+"const fx=Math.sin(P.body),fz=Math.cos(P.body),pts=[0.8,1.5,2.3].map(d=>{const x=P.x+fx*d,z=P.z+fz*d,n=X('aguaNivel')(x,z);return[r2(x),r2(z),n===null?null:r2(n),r2(X('ground')(x,z))];});"
         "const a=X('interAtual')();return{P:[r2(P.x),r2(P.y),r2(P.z)],body:r2(P.body),perto:X('aguaPerto')(P.x,P.z,4),pts,a:a&&a.k,modo:G.modo,nada:!!P.nada,alive:P.alive,rio:X('RIO').ok,carro:X('CARRO').ativo,linha:r2(X('marLinhaD')(30)),nivel:r2(X('marNivel')())};"),
      js("n.invAdd('vara',1);sel('vara');vai(374,-3.4,0.35);P.yaw=Math.PI;P.body=P.yaw;"), ["gwait", 0.4],
      ev("sonda2", "const fx=Math.sin(P.body),fz=Math.cos(P.body),pts=[0.8,1.5,2.3,3.8].map(d=>{const x=P.x+fx*d,z=P.z+fz*d,n=X('aguaNivel')(x,z);return[r2(x),r2(z),n===null?null:r2(n),r2(X('ground')(x,z))];});"
         "const a=X('interAtual')();return{P:[r2(P.x),r2(P.y),r2(P.z)],pts,a:a&&a.k,sel:X('selItem')()&&X('selItem')().id,perto:X('aguaPerto')(P.x,P.z,4)};")]
salvar('p196.json', s, vp=(960, 540))
