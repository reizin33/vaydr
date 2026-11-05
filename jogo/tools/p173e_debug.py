import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
exec(open(os.path.join(os.path.dirname(__file__),'p173_cavalo.py')).read().split("s = inicio")[0])
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;P.inv.fill(null);P.roupa.costas='mochilaExpedicao';G.hora=10;G.noite=false;G.chuva=0;n.cfg.cam='3';")]
s += [j("const Zl=X('ZONAS_FAUNA').find(z=>z.id==='leste');let c=null;for(let k=0;k<40&&!c;k++){const a=k*0.9,r=k*0.6,x=Zl.x+Math.cos(a)*r,z=Zl.z+Math.sin(a)*r;const d=dirLivre(x,z);if(d.l>=40)c={x,z,a:d.a};}"
        "W.__c=c;const fx=Math.sin(c.a),fz=Math.cos(c.a);const h2=X('criarBicho')('cavalo',c.x-fx*40,c.z-fz*40,{zona:'leste'});W.__h2=h2;h2.st='come';h2.t=60;h2.lider=null;"
        "vai(h2.x+fx*6,h2.z+fz*6);P.agachado=false;P.agK=0;W.__log=[];"), ["gwait", 0.2]]
for i in range(8):
    s += [j("const h=W.__h2;W.__log.push([r2(G.t),h.st,r2(h.alerta),r2(Math.hypot(h.x-P.x,h.z-P.z)),'Py',r2(P.y),'g',r2(X('ground')(P.x,P.z)),'agK',r2(P.agK||0),'veg',!!P.vegOculto,'amea',h.amea?r2(h.amea.f):0].join(' '));"), ["gwait", 0.4]]
s += [ev('log', H+"return {log:W.__log,c:W.__c};")]
salvar('p173e.json', s)
