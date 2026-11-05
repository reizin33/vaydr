import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__semRender=true;"),
      ev("hash", "const h=a=>{let s=0;for(let i=0;i<a.length;i++){const o=a[i];s=(s*31+Math.round(o.x*100)*7+Math.round(o.z*100)*13)%1000000007;}return s;};const T=X('TREES').filter(t=>!t.alto),Rk=X('ROCKS').filter(r=>!r.alto),B=X('BUSHES').filter(b=>!b.alto),Pk=X('PICKS').filter(p=>!p.alto),Gr=X('GRASS').filter(g=>!g.alto),Sm=X('SAMAMBAIAS').filter(g=>!g.alto),Si=X('SINISTROS')||[];"
         "return{arvores:[T.length,h(T)],pedras:[Rk.length,h(Rk)],arbustos:[B.length,h(B)],coletaveis:[Pk.length,h(Pk)],capim:[Gr.length,h(Gr)],samamb:[Sm.length,h(Sm)],sinistros:[Si.length,h(Si)],troncos:X('TRONCOS').filter(t=>!t.alto).length,cid:X('CID').predios.length,inter:X('INTER').length,conts:X('CID').conts.length};")]
salvar('p198.json', s, vp=(640, 360))
