"""p67ag: térreo alagado do p67: o que segura o jogador parado (v=0)."""
import json
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,X=s=>n.ev(s),W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],"
     "por=(p,u,v,y)=>{const w=W(p,u,v);P.x=w[0];P.z=w[1];P.y=y;P.vy=0;P.vx=P.vz=0;P.escala=null;P.noChao=true;},"
     "olha=(p,du,dv)=>{const x=du*p.c+dv*p.s,z=-du*p.s+dv*p.c,a=Math.atan2(x,z);P.yaw=a;P.body=a;P.pitch=0;},"
     "au=C.predios[0],bv=C.predios[5],r2=v=>Math.round(v*100)/100;")
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def js(c): return ["js", "(()=>{" + A + c + "})()"]
LOG = ("window.__L=window.__L||[];const bb=window.__b;const l=[(P.x-bb.ox)*bb.c-(P.z-bb.oz)*bb.s,(P.x-bb.ox)*bb.s+(P.z-bb.oz)*bb.c];"
       "window.__L.push({u:r2(l[0]),v:r2(l[1]),y:r2(P.y),vx:r2(P.vx),vz:r2(P.vz),agua:n.naAgua(P.x,P.y,P.z),mz:X('IN').mz,acao:P.acao&&P.acao.tipo,muro:!!P.muro,nada:!!P.nada});")
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5], js("window.__turbo=2;window.__semRender=true;G.hora=10;n.Z.length=0;"), ["gwait", 0.3]]
for nome, p in [("seco", "au"), ("alagado", "bv")]:
    steps += [js("n.Z.length=0;window.__b=%s;por(%s,%s.uc,2.2,%s.y0);olha(%s,0,1);P.ruidoK=0;" % (p, p, p, p, p)),
              ev(nome + "_antes", "const b=window.__b,out=[];for(const d of[0.3,0.6,1,1.5,2,3]){const w=W(b,b.uc,2.2+d);const c=X('bloqueadoAlto')(w[0],w[1],0.3,P.y);out.push([d,c?{k:c.mob&&c.mob.k||c.k||null,obra:c.obra&&c.obra.tipo,t:c.t,hw:c.hw,hd:c.hd,y0:c.y0,y1:c.y1,porta:!!c.porta,predio:!!c.predio}:null]);}return{uc:b.uc,y0:b.y0,P:[r2(P.x),r2(P.y),r2(P.z)],frente:out,sala:(X('salaEm')(P.x,P.y+0.3,P.z)||{}).nome||null};"),
              js("window.__L=[];" + LOG), ["down", "w"]]
    for k in range(6):
        steps += [["gwait", 0.25], js(LOG)]
    steps += [["up", "w"], ev(nome + "_log", "return window.__L;")]
json.dump([["desk", {"viewport": {"width": 1280, "height": 720}}, steps]], open('p67ag.json', 'w'))
print('ok', len(steps))
