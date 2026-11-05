"""p235c: foto da enchente no trecho onde o rio mais sobe (versão corrigida) e no mesmo lugar na versão publicada."""
import sys, os, json; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
POS = os.environ.get('POS')
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;X('BICHOS').length=0;const C=X('mundoD')().cheia;C.ativa=true;C.alvo=1.5;C.nivel=1.5;C.fim=G.tm+8*60;X('cheiaPasso')(0);G.hora=11;"), ["gwait", 0.2]]
if POS:
    x, z, yaw = json.loads(POS)
    s += [js(f"vai({x},{z});P.yaw={yaw};P.body=P.yaw;P.pitch=-0.1;")]
else:
    s += [js("""let best=0,bs=0;for(let i=4;i<=80;i++){const s=i/100,e=X('cheiaEx')(s);if(e>best){best=e;bs=s;}}const p=X('rioPonto')(bs),w=X('RIO').larg(bs),nx=-p[3],nz=p[2],d=w+X('cheiaAlc')(bs,1)+4;
      const x=p[0]+nx*d,z=p[1]+nz*d;vai(x,z);P.yaw=Math.atan2(p[0]-x,p[1]-z);P.body=P.yaw;P.pitch=-0.1;window.__pos=[Math.round(x*10)/10,Math.round(z*10)/10,Math.round(P.yaw*100)/100,Math.round(best*100)/100,Math.round(bs*100)/100];""")]
s += [ev("pos", "return window.__pos||[r2(P.x),r2(P.z),r2(P.yaw)];")]
s += foto(os.environ.get('NOME', 'p235c.png'), "G.hora=11;")
salvar('tools/p235c_foto.json', s, vp=(960, 540))
