import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
exec(open(os.path.join(os.path.dirname(__file__),'p163_etapa6.py')).read().split("s = inicio(")[0].split("from vt import *")[1])
DIAG = ("const t=S('tiao'),D=X('terrD')();let acha=null;try{acha=X('OFICIOS').transportar[0].acha(t);}catch(e){acha='ERRO '+e.message;}"
        "return{hora:r2(G.hora),noite:G.noite,modo:G.modo,tiao:est(t),pos:[r2(t.x),r2(t.z)],acha,caixa:caixa(),cabe:(D.caixaTrocas||[]).filter(Boolean).map(it=>it.id+':'+X('ofBauCabe')(it)),baus:baus(),nBaus:X('bausBase')().length,BAU_N:X('BAU_N')};")
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j(MONTA), ["gwait", 20], e("d1", DIAG),
      j("const D=X('terrD')();D.caixaTrocas[0]=X('newItem')('municao9',7);D.caixaTrocas[1]=X('newItem')('kit',2);"), ["gwait", 15], e("d2", DIAG),
      j("const D=X('terrD')();D.caixaTrocas[0]=X('newItem')('municao9',7);D.caixaTrocas[1]=X('newItem')('kit',2);X('salvarJogo')();")]
s += recarrega()
s += [j("G.hora=10;"), ["gwait", 2], e("d3", DIAG), ["gwait", 20], e("d4", DIAG)]
salvar('p163d.json', s)
