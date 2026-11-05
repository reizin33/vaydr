"""p61d: depuração — zumbi do 2º andar do Aurora até o jogador no térreo; registra a trilha."""
import json, os
A = ("const n=__nnc,C=n.CID,a=C.predios[0],P=n.P,G=n.G,W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],r2=v=>Math.round(v*100)/100,LL=(p,x,z)=>{const dx=x-p.ox,dz=z-p.oz;return[dx*p.c-dz*p.s,dx*p.s+dz*p.c];};")
def ev(nome, corpo): return ["eval", nome, "(()=>{" + A + corpo + "})()"]
def js(corpo): return ["js", "(()=>{" + A + corpo + "})()"]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
 js("G.hora=10;n.Z.length=0;const w=W(a,a.uc,3);P.x=w[0];P.z=w[1];P.y=a.y0;P.vy=0;"), ["gwait", 0.3],
 ev("setup", "const s=a.salas[2].find(s=>s.tipo==='apartamento');const w=W(a,(s.u0+s.u1)/2,(s.v0+s.v1)/2);const z=n.criarZ('walker',w[0],w[1],{y:s.y,cidade:true});z.st='caca';z.viu=0;z.lx=P.x;z.lz=P.z;z.ly=P.y;window.__z=z;"
    "for(const d of C.portas)if(d.p===a&&(d.estado==='trancada'||d.estado==='travada'||d.estado==='fechada'))n.portaEstado(d,'aberta');const w2=W(a,a.uc,3);P.x=w2[0];P.z=w2[1];P.y=a.y0;P.vy=0;P.vida=100;"
    "const rota=n.navRota(z.x,z.y,z.z,P.x,P.y,P.z);window.__tr=[];window.__cadaPasso=()=>{const z=window.__z;if(!window.__tr.length||G.t-window.__tr[window.__tr.length-1].t>1){const L=LL(a,z.x,z.z);window.__tr.push({t:r2(G.t),u:r2(L[0]),v:r2(L[1]),y:r2(z.y),st:z.st,ri:z.rotaI,rl:z.rota?z.rota.length:-1,zona:z.zona?(z.zona.tipo+z.zona.f):'-',tg:z.rota&&z.rota[z.rotaI]?(()=>{const q=z.rota[z.rotaI],l=LL(a,q.x,q.z);return r2(l[0])+','+r2(l[1])+','+r2(q.y);})():''});}};"
    "return{z:[r2(z.x),r2(z.y),r2(z.z)],rota:rota?rota.map(q=>{const l=LL(a,q.x,q.z);return r2(l[0])+','+r2(l[1])+','+r2(q.y)+(q.porta?'P':'')+(q.sala&&q.sala.tipo?(':'+q.sala.tipo):'');}):null,uc:a.uc};"),
 js("window.__turbo=3;"), ["gwait", 45], js("window.__turbo=6;window.__cadaPasso=null;"),
 ev("trilha", "return window.__tr;"),
 ev("fim", "const z=window.__z;return{vivo:z.vivo,d:r2(Math.hypot(z.x-P.x,z.z-P.z)),dy:r2(z.y-P.y),vida:P.vida};"),
]
plan = [["desk", {"viewport": {"width": 480, "height": 270}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p61d.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
