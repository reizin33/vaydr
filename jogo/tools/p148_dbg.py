import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("dbg", "const p=X('VILA').v7,pw=X('pw'),pb=X('pointBlocked');const portas=X('CID').portas.filter(d=>d.p===p).map(d=>({x:r2(d.x),z:r2(d.z),u:r2((d.x-p.ox)*p.c-(d.z-p.oz)*p.s),v:r2((d.x-p.ox)*p.s+(d.z-p.oz)*p.c)}));"
  "const out=[];for(const[u,v]of[[7.3,-2.5],[2.9,-3.3],[5.1,-3.3],[8.6,-3.4]]){const w=pw(p,u,v),c=pb(w[0],w[1],1.0);out.push({u,v,w:[r2(w[0]),r2(w[1])],bloq:c?{x:r2(c.x),z:r2(c.z),hw:c.hw,hd:c.hd,r:c.r,k:Object.keys(c).filter(k=>!['x','z','t','c','s','stamp','br','cells'].includes(k)).join(',')}:null});}"
  "return{c:r2(p.c),s:r2(p.s),ox:p.ox,oz:p.oz,portas,out};")]
salvar('p148.json', s)
