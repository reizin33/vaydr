"""p233b (Parte 2, diagnóstico): dirigir a caminhonete do círculo antigo para fora, em várias direções da Mata dos Morros.
Mostra o caminho a cada segundo, onde parou, o que estava na frente e a inclinação; e a densidade da mata por faixa."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;window.__cadaPasso=()=>{const P=__nnc.P;if(P.vida<60)P.vida=60;P.fome=100;P.sede=100;__nnc.Z.length=0;"
         "const t=window.__t;if(t&&G.t-(window.__ult||0)>=1){window.__ult=G.t;window.__traj.push([Math.round(t.x),Math.round(t.z),Math.round(t.v*10)/10]);}};")]
s += [ev("densidade", """const T=X('TREES'),deg=a=>((a%360)+360)%360,bins={};for(const t of T){if(t.agua)continue;const r=Math.hypot(t.x,t.z),a=deg(Math.atan2(t.z,t.x)*180/Math.PI);if(a<70||a>240||r<90)continue;
 const b=Math.floor(r/10)*10,k=b+(t.morros?'nova':'velha');bins[k]=(bins[k]||0)+1;}const out={};for(const k in bins){const b=parseInt(k),ar=Math.PI*((b+10)**2-b*b)*170/360;out[k]={n:bins[k],m2PorArvore:Math.round(ar/bins[k])};}return out;""")]
for a in (180, 160, 135, 118, 90, 205, 232):   # 110 e 225 caíam em ponto ruim de largada (07/11): trocados por 118 e 232
    s += [js("window.__t=null;X('sairCarro')&&X('sairCarro')();const a=" + str(a) + "*Math.PI/180,t=X('VEICS').find(v=>v.id==='caminhonete'||v.tipo==='caminhonete');let r=146,x=0,z=0;"
             "for(;r>132;r-=1){x=Math.cos(a)*r;z=Math.sin(a)*r;if(X('pontoLivre')(x,z))break;}"
             "t.x=x;t.z=z;t.yaw=Math.atan2(Math.cos(a),Math.sin(a));t.v=0;t.comb=80;t.hp=Math.max(t.hp||0,80);X('veicColisor')(t);vai(t.x+2,t.z+2);X('entrarVeic')(t);window.__traj=[];window.__t=t;window.__r0=r;X('IN').mz=1;"),
          ["gwait", 22], js("X('IN').mz=0;")]
    s += [ev("dir" + str(a), """const t=window.__t;if(!t)return null;const fx=Math.sin(t.yaw),fz=Math.cos(t.yaw),r=Math.hypot(t.x,t.z),R=X('raioMapaEm')(t.x,t.z);
 const C=X('COLL').filter(c=>c.x!==undefined&&Math.hypot(c.x-t.x,c.z-t.z)<6&&!(c.veic===t)).map(c=>({tipo:c.tree?(c.tree.morros?'arvNova':'arvVelha'):c.brenha?'brenha':c.rock?'pedra':c.gigante?'gigante':c.carro?'carro':'outro',
   d:r2(Math.hypot(c.x-t.x,c.z-t.z)),frente:r2((c.x-t.x)*fx+(c.z-t.z)*fz),lado:r2((c.x-t.x)*fz-(c.z-t.z)*fx)})).sort((p,q)=>p.d-q.d).slice(0,6);
 const g0=n.ground(t.x,t.z),g1=n.ground(t.x+fx*3,t.z+fz*3);
 return{r0:window.__r0,fim:[r2(t.x),r2(t.z)],r:r2(r),raioAqui:r2(R),faltou:r2(R-r),ativo:t.ativo,v:r2(t.v),incl:r2((g1-g0)/3),traj:window.__traj,perto:C};""")]
s += [js("X('sairCarro')&&X('sairCarro')();window.__t=null;")]
salvar('tools/p233b_dirigir.json', s, vp=(640, 360))
