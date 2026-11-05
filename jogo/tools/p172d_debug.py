import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
exec(open(os.path.join(os.path.dirname(__file__),'p172f_fotos.py')).read().split("s = inicio")[0])
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;P.inv.fill(null);G.hora=10;" + MONTA), ["gwait", 0.5]]
s += [ev('redes', H + "X('aguaSujo=true');const R=X('aguaRedes')();return R.map(r=>r.map(o=>o.tipo+'@'+(o.x-F[0]).toFixed(1)+','+(o.z-F[2]).toFixed(1)+(o.ext&&o.ext.a?' a='+o.ext.a.map(v=>(v).toFixed(1))+' b='+o.ext.b.map(v=>v.toFixed(1)):'')).join(' | ')).join('\\n');")]
s += [ev('lista', H + "return X('OB').filter(o=>Math.hypot(o.x-W.__x,o.z-W.__z)<12).map(o=>o.tipo+'@'+(o.x-W.__x).toFixed(2)+','+(o.z-W.__z).toFixed(2)+' y'+o.y.toFixed(2)).join('; ');")]
salvar('p172d.json', s)
