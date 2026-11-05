import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = "const inv=(id,n)=>X('invAdd')(id,n),W=window;"
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [js(H+"vivo();Z.length=0;P.inv.fill(null);P.roupa.costas='mochilaExpedicao';G.hora=10;const Zl=X('ZONAS_FAUNA').find(z=>z.id==='leste');const h=X('criarBicho')('cavalo',Zl.x,Zl.z,{zona:'leste'});W.__h=h;h.st='come';h.t=60;"
           "inv('maca',6);vai(h.x+2.2,h.z);P.agachado=true;P.agK=1;W.__log=[];W.__iv=setInterval(()=>{const h=W.__h;W.__log.push([Math.round(G.t*10)/10,Math.round((h.conf||0)*100)/100,h.st,Math.round(Math.hypot(h.x-P.x,h.z-P.z)*10)/10,P.acao?P.acao.tipo:'-'].join(' '));},300);")]
for i in range(3):
    s += [js(H+"const h=W.__h;const dx=P.x-h.x,dz=P.z-h.z,l=Math.hypot(dx,dz)||1;if(l>2.6||l<1.6)vai(h.x+dx/l*2.2,h.z+dz/l*2.2);P.agachado=true;P.agK=1;P.yaw=Math.atan2(h.x-P.x,h.z-P.z);P.body=P.yaw;const a=X('interAtual')();n.alvo=a;W.__log.push('hold '+(a&&a.k)+' '+(a&&a.o===h));n.interagir(false);"), ["gwait", 2.6]]
s += [ev('log', H+"clearInterval(W.__iv);return W.__log;")]
salvar('p173d.json', s)
