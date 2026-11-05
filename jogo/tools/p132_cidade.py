"""p132: diagnóstico da cidade depois da sombra de contato e da hera: monta a malha de perto e de longe de todos os prédios
(conta erros e tempo), confere a hera, e tira uma foto de uma fachada da cidade (câmera fixa, como no p130)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("geo", "const L=X('CID').predios,geo=X('geoPredio');let err=[],t0=performance.now(),nv=0,maxT=0,maxId=-1;"
         "for(const p of L){const a=performance.now();try{const d=geo(p,false);nv+=d.length/11;geo(p,true);}catch(e){if(err.length<5)err.push(p.id+': '+e.message);}const dt=performance.now()-a;if(dt>maxT){maxT=dt;maxId=p.id;}}"
         "return{predios:L.length,ms:Math.round(performance.now()-t0),maxMs:Math.round(maxT),maxId,vertsPerto:Math.round(nv),erros:err,heras:L.reduce((a,p)=>a+(p.heras?p.heras.length:0),0),casasComHera:L.filter(p=>p.heras&&p.heras.length).length};")]
s += [js("vivo();Z.length=0;G.hora=10;G.chuva=0;const C=X('CIDADE'),cx=(C.x0+C.x1)/2,cz=(C.z0+C.z1)/2;const J=X('CID').janelas.filter(j=>j.f===0&&!j.p.rural).sort((a,b)=>Math.hypot(a.x-cx,a.z-cz)-Math.hypot(b.x-cx,b.z-cz));"
         "const j=J[0],nx=Math.sin(j.yaw),nz=Math.cos(j.yaw);window.__t0=performance.now();vai(j.x+nx*5,j.z+nz*5);window.__cam={pos:[j.x+nx*11+nz*3,P.y+2.2,j.z+nz*11-nx*3],tgt:[j.x,P.y+1.6,j.z],fov:1.0};"),
      ["wait", 3],
      ev("chegou", "return{ms:Math.round(performance.now()-window.__t0),modo:G.modo,x:r2(P.x),z:r2(P.z),t:r2(G.t)};")]
s += foto("722_vis_cidade.png", "G.camFix=window.__cam;", 0.6, 4.0)
s += [ev("fim", "return{modo:G.modo,t:r2(G.t)};")]
salvar('p132.json', s)
