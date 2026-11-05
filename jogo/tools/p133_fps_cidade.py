"""p133: desempenho na cidade (comparar versões): vai para a frente de um prédio no centro, liga o desenho e conta
quantos quadros saem em 20 s (sem foto). Rodar com SRC apontando para cada versão."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;G.hora=10;G.chuva=0;const C=X('CIDADE'),cx=(C.x0+C.x1)/2,cz=(C.z0+C.z1)/2;const J=X('CID').janelas.filter(j=>j.f===0&&!j.p.rural).sort((a,b)=>Math.hypot(a.x-cx,a.z-cz)-Math.hypot(b.x-cx,b.z-cz));"
         "const j=J[0],nx=Math.sin(j.yaw),nz=Math.cos(j.yaw);vai(j.x+nx*5,j.z+nz*5);P.yaw=P.body=Math.atan2(-nx,-nz);"),
      ["wait", 3],
      js("window.__turbo=1;window.__semRender=false;window.__q=[];const f=t=>{window.__q.push(t);if(window.__q.length<4000)requestAnimationFrame(f);};requestAnimationFrame(f);"),
      ["wait", 20],
      ev("fps", "const q=window.__q;window.__semRender=true;const nq=q.length,dt=nq>1?(q[nq-1]-q[0])/1000:0;let mx=0;for(let i=1;i<nq;i++)mx=Math.max(mx,q[i]-q[i-1]);return{quadros:nq,seg:Math.round(dt*10)/10,fps:dt?Math.round((nq-1)/dt*100)/100:0,maiorQuadroMs:Math.round(mx)};")]
salvar('p133.json', s)
