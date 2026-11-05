import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
import p180_ponte as m
s = m.s[:m.s.index(next(st for st in m.s if st[0]=='eval' and st[1]=='ponteFaz'))+1]
H = m.H
def e(nome, c): return ev(nome, H + c)
s += [e("dbg", "const o=ob('ponteMadeira')[0],e=o.ext,mx=(e.ax+e.bx)/2,mz=(e.az+e.bz)/2;const hm=X('ponteAltura')(e,0.5);"
        "return{o:[r2(o.x),r2(o.z),r2(o.y),r2(o.yaw)],mid:[r2(mx),r2(mz)],yawAB:r2(Math.atan2(e.bx-e.ax,e.bz-e.az)),hm:r2(hm),chao:r2(X('chaoEm')(mx,mz,hm+0.1)),g:r2(g(mx,mz)),nv:e.nv,"
        "cols:o.cols.slice(0,4).map(c=>[r2(c.x-mx),r2(c.z-mz),c.hw,r2(c.hd),r2(c.yaw),r2(c.y0),r2(c.y1)]),sups:o.sups.slice(0,3).map(q=>[r2(q.x-mx),r2(q.z-mz),r2(q.hw),r2(q.hd),r2(q.yaw),r2(q.ya),r2(q.yb)])};"),
      js(H+"const o=ob('ponteMadeira')[0],e=o.ext;const mx=(e.ax+e.bx)/2,mz=(e.az+e.bz)/2;vai(mx,mz,X('ponteAltura')(e,0.5)+0.02);P.yaw=o.yaw+Math.PI/2;P.body=P.yaw;n.cfg.cam='1';window.__tr=[];window.__tt=0;"
        "window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.energia=100;if(window.__tr.length<40){window.__tr.push([r2(G.t),r2(P.x-mx),r2(P.z-mz),r2(P.y),!!P.nada,!!P.muro,P.acao&&P.acao.tipo,r2(P.vx||0),r2(P.vz||0)]);}};"),
      ["down", "KeyW"], ["gwait", 2.0], ["up", "KeyW"], ["gwait", 0.4],
      e("traj", "return window.__tr.slice(0,40);")]
salvar('p180d.json', s)
