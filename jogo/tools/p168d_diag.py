import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
exec(open(os.path.join(os.path.dirname(__file__),'p168_som.py')).read().split("s = inicio(")[0].split("from vt import *")[1])
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;" + LIMPA + REG + "X('audioInit')();"), ["gwait", 0.5],
      j("dia(9,10);const p=X('CID').predios.find(q=>q.nome==='Hotel Imperial')||X('CID').predios[2];lugar(p.x0-6,(p.z0+p.z1)/2);"), ["gwait", 1],
      e("d1", "const S=X('SOM');let err=null;const L=[];try{for(let i=0;i<40;i++){X('somAmbiente')(0.5);}}catch(er){err=er.message+' '+er.stack.slice(0,300);}return{err,reg:reg(),prox:S.prox,sons:sons(),som:n.cfg.som};")]
salvar('p168d.json', s)
