import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
exec(open('tools/p229_armas.py').read().split('DIST = ')[0].split('from vt import *')[1])
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.P.vida=100;};G.hora=11;" + LIB + "L.C2=L.campo([8,20,30,45],320);"),
      ev("debug", "const L=window.__A,C=L.C2,out={T:C&&C.T.map(r2),u:C&&C.u};if(!C)return out;const raySeg=n.ev('raySeg'),bichoAlt=n.ev('bichoAlt'),bichoHitR=n.ev('bichoHitR'),BICHOS=n.ev('BICHOS');"
         "out.nBichos=BICHOS.filter(b=>b.vivo).length;"
         "for(const d of[20,30,45]){const r={};L.fixo(()=>{const S=L.poe(C,d);P.aim=1;const z=L.zumbi('walker',C.T,S);const p=L.alvo(z,'tronco');const m=L.mira(S,p);"
         "const Cz=L.zCorpo(z),rr=raySeg(m.o,m.d,Cz.a,Cz.b);r.zRay={t:r2(rr.t),dist:r2(rr.dist),u:r2(rr.u),r:r2(Cz.r)};"
         "r.bichos=BICHOS.filter(b=>b.vivo).map(b=>{const h=bichoAlt(b),q=raySeg(m.o,m.d,[b.x,b.y+h*0.3,b.z],[b.x,b.y+h,b.z]);return{tipo:b.tipo,t:r2(q.t),dist:r2(q.dist),hr:r2(bichoHitR(b))};}).filter(q=>q.dist<q.hr+1);"
         "let blk=null;for(let t=1;t<rr.t;t+=0.5){const x=m.o[0]+m.d[0]*t,y=m.o[1]+m.d[1]*t,zz=m.o[2]+m.d[2]*t;if(y<L.ground(x,zz)){blk={t,chao:true};break;}const c=L.bloqueiaTiro(x,y,zz);if(c){blk={t,col:Object.keys(c).slice(0,8).join(',')};break;}}r.bloqueio=blk;"
         "const h0=z.hp;window.__capt=[];L.atirar({id:'pistola',mun:9},L.ITEMS.pistola);r.pistola=r2(h0-z.hp);r.capt=window.__capt.length;"
         "const z2=L.zumbi('walker',C.T,S);L.mira(S,p);const h1=z2.hp;L.atirar({id:'rifle',mun:9},L.ITEMS.rifle);r.rifle=r2(h1-z2.hp);window.__capt=null;});out['d'+d]=r;}return out;")]
salvar('tools/p229b_debug.json', s, vp=(800, 450))
