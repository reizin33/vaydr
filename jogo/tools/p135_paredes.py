"""p135: caça às paredes invisíveis na cidade: colisores sólidos sem nada desenhado no lugar.
Para cada colisor de prédio, confere se o centro dele cai dentro de alguma peça alta (parede) do mesmo prédio; lista os que não caem.
Lista também os colisores da cidade sem dono (nem prédio, nem obra, nem árvore...) e um resumo por tipo."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("colisores", "const C=X('CIDADE'),IGN=['t','x','z','hw','hd','c','s','yaw','solid','r','y0','y1','id','cel','st','stamp','cells','k'],"
         "L=X('COLL').filter(c=>c.solid&&c.x>C.x0-6&&c.x<C.x1+6&&c.z>C.z0-6&&c.z<C.z1+6),tags={},extra=c=>Object.keys(c).filter(k=>!IGN.includes(k));"
         "for(const c of L){const k=extra(c).sort().join(',')||'(sem dono)';tags[k]=(tags[k]||0)+1;}"
         "const PR=X('CID').predios,plc=X('plc'),fora=[];let nP=0;"
         "for(const c of L){if(c.predio===undefined||c.t!==1)continue;nP++;const p=PR[c.predio];if(!p)continue;const l=plc(p,c.x,c.z),u=l[0],v=l[1];"
         "const ok=p.pecas.some(q=>q[3]-q[2]>0.4&&u>=q[0]-0.2&&u<=q[1]+0.2&&v>=q[4]-0.2&&v<=q[5]+0.2&&(c.y0===undefined||(q[3]>c.y0-0.2&&q[2]<(c.y1===undefined?99:c.y1)+0.2)));"
         "if(!ok)fora.push({p:c.predio,rural:!!p.rural,x:r2(c.x),z:r2(c.z),hw:r2(c.hw),hd:r2(c.hd),y0:c.y0===undefined?null:r2(c.y0),y1:c.y1===undefined?null:r2(c.y1),extra:extra(c).join(',')});}"
         "const sem=L.filter(c=>!extra(c).length).map(c=>({t:c.t,x:r2(c.x),z:r2(c.z),a:r2(c.hw||c.r),b:r2(c.hd||0)}));"
         "return{total:L.length,predio:nP,tags,foraN:fora.length,fora:fora.slice(0,25),semN:sem.length,sem:sem.slice(0,25)};")]
salvar('p135.json', s)
