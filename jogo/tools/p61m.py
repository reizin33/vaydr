"""p61m: memória durante a noite na cidade (infestação) — amostra o heap e o tamanho das listas a cada 2 s de jogo."""
import json, os
A = "const n=__nnc,C=n.CID,P=n.P,G=n.G,W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c];"
def ev(nome, corpo): return ["eval", nome, "(()=>{" + A + corpo + "})()"]
def js(corpo): return ["js", "(()=>{" + A + corpo + "})()"]
amostra = ("const m=performance.memory;let cg=0;for(const v of n.CGRID.values())cg+=v.length||0;let sg=0;for(const v of n.SGRID.values())sg+=v.length||0;"
           "const ho=G.cid.hordas||[];"
           "return{t:Math.round(G.t),heap:m?Math.round(m.usedJSHeapSize/1048576):-1,Z:n.Z.length,vivos:n.Z.filter(z=>z.vivo).length,COLL:n.COLL.length,cgrid:cg,sgrid:sg,SUPS:n.SUPS.length,PART:n.PART.length,NOISE:n.NOISE.length,DROPS:n.DROPS.length,RINGS:n.RINGS.length,EMB:n.EMBERS.length,SMOKE:n.SMOKE.length,INTER:n.INTER.length,hordas:ho.length,membros:ho.reduce((a,h)=>a+(h.membros?h.membros.length:0),0)};")
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5], js("window.__turbo=6;window.__semRender=true;"), ["gwait", 0.3],
 ev("m0", amostra),
 js("const a=C.predios[0];n.Z.length=0;const w=W(a,a.uc,3);P.x=w[0];P.z=w[1];P.y=a.y0;P.vy=0;G.hora=21;P.vida=100;"),
]
for i in range(20):
    steps += [["gwait", 2, 120], ev("m%d" % (i + 1), amostra + "".replace("", "")),
              js("const m=performance.memory;if(m&&m.usedJSHeapSize>8e8){window.__turbo=0;}P.vida=100;")]
plan = [["desk", {"viewport": {"width": 480, "height": 270}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p61m.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
