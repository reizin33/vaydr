"""p135c: colisores de prédio no nível da rua (y0 < 0.6) que não caem em peça alta do prédio: separa os que ficam fora da caixa
do prédio (quintal, calçada) e diz o tamanho; tira fotos de cima nos três primeiros lugares para ver o que tem desenhado ali."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("rua", "const C=X('CIDADE'),PR=X('CID').predios,plc=X('plc'),L=X('COLL').filter(c=>c.solid&&c.predio!==undefined&&c.t===1&&c.x>C.x0-6&&c.x<C.x1+6&&c.z>C.z0-6&&c.z<C.z1+6&&(c.y0===undefined||c.y0<0.6));"
         "const out=[];for(const c of L){if(c.movel||c.sobEscada||c.elevador||c.entulho)continue;const p=PR[c.predio];if(!p)continue;const l=plc(p,c.x,c.z),u=l[0],v=l[1];"
         "const ok=p.pecas.some(q=>q[3]-q[2]>0.4&&q[2]<1.2&&u>=q[0]-0.2&&u<=q[1]+0.2&&v>=q[4]-0.2&&v<=q[5]+0.2);if(ok)continue;"
         "const foraCaixa=c.x<p.x0-0.3||c.x>p.x1+0.3||c.z<p.z0-0.3||c.z>p.z1+0.3;out.push({p:p.id,nome:p.nome||p.tipo,rural:!!p.rural,x:r2(c.x),z:r2(c.z),hw:r2(c.hw),hd:r2(c.hd),yaw:r2(c.yaw),y0:c.y0===undefined?null:r2(c.y0),y1:c.y1===undefined?null:r2(c.y1),foraCaixa,chaves:Object.keys(c).join(',')});}"
         "window.__rua=out;return{n:out.length,lista:out.slice(0,40)};")]
for i in range(3):
    s += foto("74%d_parede_%d.png" % (i, i), "const c=(window.__rua||[])[%d];if(c){vai(c.x+2.5,c.z+2.5);G.camFix={pos:[c.x+4,P.y+5.5,c.z+4],tgt:[c.x,P.y+0.5,c.z],fov:1.0};}" % i, 0.5, 4.0)
salvar('p135c.json', s)
