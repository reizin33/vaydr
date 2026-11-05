import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
exec(open(os.path.join(os.path.dirname(__file__),'p173_cavalo.py')).read().split("s = inicio")[0])
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;P.inv.fill(null);G.hora=10;const Zl=X('ZONAS_FAUNA').find(z=>z.id==='leste');const h=X('criarBicho')('cavalo',Zl.x,Zl.z,{zona:'leste'});h.conf=1;X('domarCavalo')(h);W.__h=h;"
        "vai(h.x-Math.cos(h.yaw)*1.4,h.z+Math.sin(h.yaw)*1.4);P.yaw=Math.atan2(h.x-P.x,h.z-P.z);P.body=P.yaw;"), ["gwait", 0.5],
      j("const a=X('interAtual')();n.alvo=a;W.__k=a&&a.k;n.interagir(false);W.__ac1=P.acao&&JSON.stringify({t:P.acao.tipo,alt:P.acao.alt,dur:P.acao.dur,k:P.acao.alvo.k});"), ["gwait", 0.1],
      j("W.__ac2=P.acao&&JSON.stringify({t:P.acao.tipo,tt:P.acao.t,done:P.acao.done});X('usarSolta')();W.__m1=!!X('P').montado;"), ["gwait", 0.5],
      e("m", "return{k:W.__k,ac1:W.__ac1,ac2:W.__ac2,m1:W.__m1,m2:!!X('P').montado,modo:G.modo};"),
      j("X('montar')(W.__h);W.__m3=!!X('P').montado;"), ["gwait", 0.5], e("m2", "return{direto:W.__m3,depois:!!X('P').montado,py:r2(P.y-W.__h.y)};")]
salvar('p173m.json', s)
