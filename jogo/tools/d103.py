import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [js("vivo();Z.length=0;const L=X('LAGO');vai(L.x-6,L.z+2);"), ["gwait", 1],
      ev("lago", "const L=X('LAGO'),x=L.x-6,z=L.z+2,s=X('supEm')(x,z,P.y,0.5);const V=X('VEICS')||[];return{P:[r2(P.x),r2(P.y),r2(P.z)],nada:!!P.nada,ground:r2(X('ground')(x,z)),niv:X('aguaNivel')(x,z),chao5:r2(X('chaoEm')(x,z,5)),sup:s?{t:s.t,y:s.y,dono:s.dono&&(s.dono.tipo||s.dono.id||'?'),solo:!!s.solo,veic:!!s.veic}:null,veics:V.filter(v=>Math.hypot(v.x-x,v.z-z)<15).map(v=>v.tipo+':'+r2(Math.hypot(v.x-x,v.z-z)))};")]
salvar('d103.json', s)
