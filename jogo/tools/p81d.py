"""p81d: chegada no topo da escada de mão do mercado, quadro a quadro (escala, muro, esqueleto, posição)."""
import json
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,X=s=>n.ev(s),r2=v=>Math.round(v*100)/100;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
LOG = ("window.__L=window.__L||[];const v=window.__via;window.__L.push({t:r2(G.t),esc:P.escala?r2(P.escala.u):null,muro:P.muro?(P.muro.clip||P.muro.nome||1):null,sk:!!(P.ch&&P.ch.sk),"
       "y:r2(P.y),d:r2(Math.hypot(P.x-v.topo.x,P.z-v.topo.z)),mz:X('IN').mz,noChao:P.noChao,modo:G.modo});")
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("G.hora=11;G.chuva=0;n.Z.length=0;n.cfg.cam='3';window.__turbo=2;window.__semRender=true;"), ["gwait", 0.3],
         js("const e=C.escadasExt[0];window.__via=e.via;P.x=e.via.base.x;P.z=e.via.base.z;P.y=e.via.base.y;n.comecarEscalada({v:e.via,u:0});P.escala.u=0.97;window.__L=[];" + LOG),
         ["down", "w"]]
for k in range(6):
    steps += [["gwait", 0.1], js(LOG)]
steps += [["up", "w"]]
for k in range(8):
    steps += [["gwait", 0.3], js(LOG)]
steps += [ev("log", "const v=window.__via;return{L:window.__L,topo:{x:r2(v.topo.x),y:r2(v.topo.y),z:r2(v.topo.z),rumo:v.topo.rumo},n:C.escadasExt.length};")]
json.dump([["desk", {"viewport": {"width": 1280, "height": 720}}, steps]], open('p81d.json', 'w'))
print('ok', len(steps))
