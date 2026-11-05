"""p67d: zumbi preso no elevador — o que ele faz depois que a porta é forçada."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],"
     "por=(p,u,v,y)=>{const w=W(p,u,v);P.x=w[0];P.z=w[1];P.y=y;P.vy=0;P.vx=P.vz=0;P.escala=null;P.noChao=true;},"
     "olha=(p,du,dv)=>{const x=du*p.c+dv*p.s,z=-du*p.s+dv*p.c,a=Math.atan2(x,z);P.yaw=a;P.body=a;P.pitch=0;},"
     "au=C.predios[0],E=au.poco,r2=v=>Math.round(v*100)/100;")
def ev(nome, corpo): return ["eval", nome, "(()=>{" + A + corpo + "})()"]
def js(corpo): return ["js", "(()=>{" + A + corpo + "})()"]
st = "const z=n.Z.find(q=>q.preso);return z?{st:z.st,lev:z.levanta&&r2(z.levanta),d:r2(Math.hypot(z.x-P.x,z.z-P.z)),dy:r2(z.y-P.y),obra:z.obra?(z.obra.larg!==undefined?'porta '+z.obra.estado+' '+(z.obra.tipo||''):'obra '+z.obra.tipo):null,t:r2(G.t)}:null;"
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5], js("G.hora=10;n.Z.length=0;window.__turbo=1;for(const[k,q]of[['peDeCabra',1],['tabuas',20],['pregos',20],['corda',4],['agua',4]])n.invAdd(k,q);"), ["gwait", 0.3, 60],
         js("por(au,au.uc+0.6,E.vD,au.y0+au.H);olha(au,1,0);"), ["gwait", 0.3, 60], js("n.portaUsar(E.portas[1],true);")]
for i in range(12):
    steps += [["gwait", 0.25, 60], ev("t%02d" % i, st)]
plan = [["desk", {"viewport": {"width": 800, "height": 450}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p67d.json'), 'w'), ensure_ascii=False)
print('ok')
