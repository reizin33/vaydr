"""p64: imagens da cidade (avenida, corredor, telhado com passarela, hospital, metrô com lanterna)."""
import json, os
A="const n=__nnc,C=n.CID,a=C.predios[0],H=C.predios.find(p=>p.tipo==='hospital');const W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c];"
def foto(nome,js):
    return [["js","(()=>{"+A+js+"n.Z.length=0;window.__turbo=0;window.__semRender=false;})()"],["wait",2.5],["shot",nome],["js","window.__semRender=true;window.__turbo=6;"]]
steps=[["wait",2],["click","#m-novo"],["wait",1],["js","(()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;for(const d of n.CID.portas)if(d.p===n.CID.predios[0]&&d.f===0&&d.larg>1.3)n.portaEstado(d,'aberta');})()"]]
steps+=foto("190_cidade.png","n.P.x=181;n.P.z=9.5;n.P.y=0;n.P.vy=0;n.P.yaw=Math.PI/2+0.12;n.P.body=n.P.yaw;n.P.pitch=0.06;n.G.hora=9.8;")
steps+=foto("191_corredor.png","const w=W(a,a.uc,4.5);n.P.x=w[0];n.P.z=w[1];n.P.y=a.y0;n.P.vy=0;n.P.yaw=a.yaw;n.P.body=a.yaw;n.P.pitch=-0.02;n.cfg.cam='1';")
steps+=foto("192_telhado.png","n.cfg.cam='3';const w=W(a,a.W-2.2,7.8);n.P.x=w[0];n.P.z=w[1];n.P.y=a.yTopo;n.P.vy=0;const yy=a.yaw+Math.PI/2;n.P.yaw=yy;n.P.body=yy;n.P.pitch=-0.12;")
steps+=foto("193_hospital.png","const w=W(H,H.W/2,-14);n.P.x=w[0];n.P.z=w[1];n.P.y=0;n.P.vy=0;n.P.yaw=H.yaw;n.P.body=H.yaw;n.P.pitch=0.18;")
steps+=foto("194_metro.png","n.P.x=196;n.P.z=-19;n.P.y=-6;n.P.vy=0;n.P.yaw=-Math.PI/2-0.3;n.P.body=n.P.yaw;n.P.pitch=-0.05;n.P.lanterna=true;n.cfg.cam='1';")
plan=[["desk",{"viewport":{"width":960,"height":540}},steps]]
json.dump(plan,open(os.path.join(os.path.dirname(__file__),'..','p64.json'),'w'),ensure_ascii=False)
print('ok',len(steps))
