"""p232e (Parte 1, diagnóstico): árvores gigantes e as saídas dos cipós. Para cada gigante: chão no tronco, água no tronco;
para cada rota: altura gravada da base e do topo comparada com o chão/superfície de agora e a água ali. Acha base de cipó
dentro d'água ou com o chão mudado depois que a árvore nasceu."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("gigantes", """const GG=n.GIGANTES,ap=X('aguaProf'),r=[];
for(const T of GG){const g=n.ground(T.x,T.z),o={id:T.id,x:r2(T.x),z:r2(T.z),R:r2(T.R),y:r2(T.y),chao:r2(g),agua:r2(typeof ap==='function'?ap(T.x,T.z):0),vias:[]};
 for(const v of T.vias){const b=v.base,t=v.topo,gb=n.ground(b.x,b.z),cb=n.chaoEm(b.x,b.z,b.y+0.3),ct=n.chaoEm(t.x,t.z,t.y+0.3);
  o.vias.push({baseY:r2(b.y),chaoBase:r2(gb),chaoEmBase:r2(cb),aguaBase:r2(typeof ap==='function'?ap(b.x,b.z):0),topoY:r2(t.y),supTopo:r2(ct)});}
 r.push(o);}
const ruins=[];for(const o of r)for(const v of o.vias){if(Math.abs(v.chaoBase-v.baseY)>0.3||v.aguaBase>0.3||Math.abs(v.chaoEmBase-v.baseY)>0.3||Math.abs(v.supTopo-v.topoY)>0.3)ruins.push({gig:o.id,x:o.x,z:o.z,...v});}
return{total:r.length,comProblema:ruins.length,problemas:ruins.slice(0,12),aguaNoTronco:r.filter(o=>o.agua>0.2).map(o=>[o.id,o.x,o.z,o.agua])};""")]
salvar('tools/p232e_gigantes.json', s, vp=(640, 360))
