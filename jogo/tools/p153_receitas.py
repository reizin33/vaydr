import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("receitas", "const I=X('ITEMS');return X('RECIPES').map((r,i)=>[i,r.faz,I[r.faz]&&I[r.faz].nome,r.est===undefined?'-':r.est,r.cat||'',JSON.stringify(r.custo),r.desb?JSON.stringify(r.desb):'',r.n||1]);"),
      ev("bancada", "const b=X('INTER').find(i=>i.id==='bancada');return{b:b&&{x:b.x,z:b.z,label:b.label,kind:b.kind},bench:X('BENCH'),estacoes:Object.keys(X('ESTACOES'))};")]
salvar('p153.json', s)
