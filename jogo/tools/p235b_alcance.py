"""p235b: até onde a enchente chega (versão corrigida): perto da clareira, da fogueira e dos lugares do mapa."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();const C=X('mundoD')().cheia;C.ativa=true;C.alvo=1.5;C.nivel=1.5;C.fim=G.tm+8*60;X('cheiaPasso')(0);"), ["gwait", 0.2]]
s += [ev("alcance", """const an=X('aguaNivel'),gr=n.ground,A=X('cheiaAlcance')(),mx=a=>Math.max(...a),md=a=>r2(a.reduce((p,q)=>p+q,0)/a.length);
 const linhas={};for(const z of[-10,0,9,20]){const L=[];for(let x=-12;x<=30;x+=3){const v=an(x,z);L.push([x,r2(gr(x,z)),v===null?'-':r2(v-gr(x,z))]);}linhas['z'+z]=L;}
 const lug=X('PLACES').map(p=>{let ag=0,tot=0,prof=0;for(let a=0;a<16;a++)for(const f of[0,0.5,1]){const x=p.x+Math.cos(a/16*6.283)*p.r*f,z=p.z+Math.sin(a/16*6.283)*p.r*f;tot++;const v=an(x,z);if(v!==null&&v>gr(x,z)+0.05){ag++;prof=Math.max(prof,v-gr(x,z));}}return[p.id,ag+'/'+tot,r2(prof)];});
 const f=F;return{fogueira:[r2(f[0]),r2(f[2]),r2(gr(f[0],f[2]))],aguaNaFogueira:an(f[0],f[2]),alcEsq:{max:mx(A.e),media:md(A.e)},alcDir:{max:mx(A.d),media:md(A.d)},lugares:lug,linhas};""")]
salvar('tools/p235b_alcance.json', s, vp=(640, 360))
